import { Router, Request, Response } from "express";
import { generateWeb } from "../services/web_generator";
import { findChat, getProjects } from "../services/v0.service";

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
    const result = await generateWeb({ owner, message, description, app_name });
    res.json(result);
  } catch (error) {
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
