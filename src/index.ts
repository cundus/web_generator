import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import healthRouter from "./controllers/health.controller";
import webGeneratorRouter from "./controllers/web_generator";
import databaseRouter from "./controllers/database.controller";
import databaseService from "./services/database.service";

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

app.use(cors());
app.use(express.json());

app.use("/", healthRouter);
app.use("/web-generator", webGeneratorRouter);
app.use("/db", databaseRouter);

// Graceful shutdown handler
const gracefulShutdown = async () => {
  console.log('Received shutdown signal. Closing database connections...');
  await databaseService.close();
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server with database connection test
const startServer = async () => {
  try {
    // Test database connection on startup
    console.log('Testing database connection...');
    const isConnected = await databaseService.testConnection();
    
    if (!isConnected) {
      console.warn('Warning: Database connection failed. Server will start but database operations may not work.');
    }

    app.listen(port, () => {
      console.log(`Server listening on http://localhost:${port}`);
      console.log('Database pool status:', databaseService.getPoolStatus());
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
