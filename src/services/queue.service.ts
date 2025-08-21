import Bull from 'bull';
import { generateWeb } from './web_generator';
import * as http from 'http';
import * as https from 'https';

// Job data interface
interface WebGenerationJobData {
  owner: string;
  message: string;
  description: string;
  app_name?: string;
  jobId: string;
}

// Job result interface
interface WebGenerationResult {
  success: boolean;
  data?: any;
  error?: string;
}

// Create Bull queue
const webGenerationQueue = new Bull<WebGenerationJobData>('web generation', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  },
  defaultJobOptions: {
    removeOnComplete: 10, // Keep last 10 completed jobs
    removeOnFail: 10, // Keep last 10 failed jobs
    attempts: 3, // Retry failed jobs up to 3 times
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

// Webhook helper
const WEBHOOK_URL = process.env.WEBHOOK_URL;

async function postWebhook(payload: any) {
  if (!WEBHOOK_URL) {
    console.warn('WEBHOOK_URL not set; skipping webhook');
    return;
  }

  try {
    const url = new URL(WEBHOOK_URL);
    const data = JSON.stringify(payload);
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data).toString(),
    } as Record<string, string>;

    await new Promise<void>((resolve, reject) => {
      const lib = url.protocol === 'https:' ? https : http;
      const req = lib.request(
        url,
        {
          method: 'POST',
          headers,
        },
        (res) => {
          // Drain response
          res.on('data', () => {});
          res.on('end', () => {
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              resolve();
            } else {
              console.warn('Webhook responded with status', res.statusCode);
              resolve();
            }
          });
        }
      );
      req.on('error', (err) => {
        console.error('Webhook POST failed:', err);
        resolve(); // Do not reject to avoid affecting queue flow
      });
      req.write(data);
      req.end();
    });
  } catch (e) {
    console.error('Webhook POST error:', e);
  }
}

// Process jobs
webGenerationQueue.process(async (job) => {
  const { owner, message, description, app_name } = job.data;
  
  try {
    console.log(`Processing web generation job ${job.id} for owner: ${owner}`);
    
    // Update job progress
    await job.progress(10);
    
    const result = await generateWeb({ owner, message, description, app_name });
    
    // Update job progress to complete
    await job.progress(100);
    
    console.log(`Completed web generation job ${job.id}`);
    return { success: true, data: result };
  } catch (error) {
    console.error(`Failed web generation job ${job.id}:`, error);
    throw error; // This will mark the job as failed
  }
});

// Queue event handlers
webGenerationQueue.on('completed', async (job, result) => {
  console.log(`Job ${job.id} completed successfully`);
  await postWebhook({
    jobId: job.id,
    status: 'completed',
    result,
  });
});

webGenerationQueue.on('failed', async (job, err) => {
  console.error(`Job ${job.id} failed:`, err.message);
  await postWebhook({
    jobId: job.id,
    status: 'failed',
    error: err?.message || 'Unknown error',
  });
});

webGenerationQueue.on('stalled', (job) => {
  console.warn(`Job ${job.id} stalled`);
});

// Export queue service functions
export const queueService = {
  /**
   * Add a web generation job to the queue
   */
  async addWebGenerationJob(data: Omit<WebGenerationJobData, 'jobId'>): Promise<string> {
    const jobId = `web_gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const job = await webGenerationQueue.add({
      ...data,
      jobId,
    }, {
      jobId, // Use custom job ID for tracking
      delay: 0, // Process immediately
    });
    
    return job.id as string;
  },

  /**
   * Get job status and result
   */
  async getJobStatus(jobId: string): Promise<{
    status: string;
    progress: number;
    result?: WebGenerationResult;
    error?: string;
  }> {
    const job = await webGenerationQueue.getJob(jobId);
    
    if (!job) {
      return { status: 'not_found', progress: 0 };
    }

    const state = await job.getState();
    const progress = job.progress();

    let result: WebGenerationResult | undefined;
    let error: string | undefined;

    if (state === 'completed') {
      result = job.returnvalue as WebGenerationResult;
    } else if (state === 'failed') {
      error = job.failedReason;
    }

    return {
      status: state,
      progress: typeof progress === 'number' ? progress : 0,
      result,
      error,
    };
  },

  /**
   * Get queue statistics
   */
  async getQueueStats() {
    const waiting = await webGenerationQueue.getWaiting();
    const active = await webGenerationQueue.getActive();
    const completed = await webGenerationQueue.getCompleted();
    const failed = await webGenerationQueue.getFailed();

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
    };
  },

  /**
   * Clean up old jobs
   */
  async cleanQueue() {
    await webGenerationQueue.clean(24 * 60 * 60 * 1000, 'completed'); // Remove completed jobs older than 24 hours
    await webGenerationQueue.clean(24 * 60 * 60 * 1000, 'failed'); // Remove failed jobs older than 24 hours
  },
};

export default queueService;
