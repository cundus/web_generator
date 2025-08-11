import { Router, Request, Response } from 'express';
import { getHealthStatus } from '../services/health.service';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json(getHealthStatus());
});

export default router;
