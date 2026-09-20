import { Router, Request, Response } from 'express';
import { supabase } from '../db/supabase';

const router = Router();

// Liveness check - inexpensive
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Readiness check - validates dependencies like DB
router.get('/ready', async (req: Request, res: Response) => {
  try {
    // Simple, inexpensive query to verify database connection
    const { error } = await supabase.from('family').select('id').limit(1);
    
    if (error) {
      return res.status(503).json({ status: 'unhealthy', reason: 'Database unavailable' });
    }
    
    res.status(200).json({ status: 'ready' });
  } catch (err) {
    res.status(503).json({ status: 'unhealthy', reason: 'Internal error checking readiness' });
  }
});

export default router;
