import express from 'express';
import prisma from '../utils/db';

const router = express.Router();

// Get the current active round
router.get('/current', async (req, res) => {
  try {
    const round = await prisma.round.findFirst({
      where: { status: 'active' },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(round);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
});

// Get last 20 results
router.get('/results', async (req, res) => {
  try {
    const rounds = await prisma.round.findMany({
      where: { status: 'completed' },
      orderBy: { end_time: 'desc' },
      take: 20
    });
    
    res.json(rounds);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
});

export default router;
