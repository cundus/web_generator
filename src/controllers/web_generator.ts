import { Router, Request, Response } from "express";
import { generateWeb } from "../services/web_generator";
import { findChat, getProjects } from "../services/v0.service";
import queueService from "../services/queue.service";

const router = Router();

router.post("/", (_req: Request, res: Response) => {
  res.json({ status: "ok", message: "Express + TypeScript is running" });
});

router.get("/chats", async (_req: Request, res: Response) => {
  try {
    const chats = await findChat();
    res.json(chats);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

router.post("/create", async (_req: Request, res: Response) => {
  try {
    const { owner, message, description, app_name } = _req.body;
    
    // Add job to queue instead of processing directly
    const jobId = await queueService.addWebGenerationJob({
      owner,
      message,
      description,
      app_name,
    });
    
    res.json({
      success: true,
      jobId,
      message: "Web generation job queued successfully",
      statusUrl: `/web-generator/status/${jobId}`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Job status endpoint
router.get("/status/:jobId", async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const status = await queueService.getJobStatus(jobId);
    
    if (status.status === 'not_found') {
      return res.status(404).json({
        success: false,
        error: "Job not found",
      });
    }
    
    res.json({
      success: true,
      jobId,
      status: status.status,
      progress: status.progress,
      result: status.result,
      error: status.error,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Queue statistics endpoint
router.get("/queue/stats", async (_req: Request, res: Response) => {
  try {
    const stats = await queueService.getQueueStats();
    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

router.get("/projects",async (_req: Request, res: Response) => {
    try {
        const projects = await getProjects();
        res.json(projects);
    } catch (error) {
      console.log(error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
})

export default router;
