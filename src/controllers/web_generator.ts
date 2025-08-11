import { Router, Request, Response } from 'express';

const router = Router();

router.post('/', (_req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Express + TypeScript is running' });
});

export default router;
