import { Router, Request, Response } from 'express';
import { identifyContact } from '../services/identifyService';
import { IdentifyRequest } from '../types/contact';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const body = req.body as IdentifyRequest;

    if (!body.email && !body.phoneNumber) {
      return res.status(400).json({
        error: 'Please provide email or phoneNumber',
      });
    }

    const result = await identifyContact(body);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Identify error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

export default router;
