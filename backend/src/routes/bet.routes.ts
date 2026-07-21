import express from 'express';
import prisma from '../utils/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Place a bet
router.post('/place', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { round_id, bet_number, amount } = req.body;

    if (!bet_number || amount <= 0) {
      res.status(400).json({ message: 'Invalid bet details' });
      return;
    }

    // Get current active round
    const round = await prisma.round.findUnique({ where: { id: round_id } });
    if (!round || round.status !== 'active') {
      res.status(400).json({ message: 'Round is not active' });
      return;
    }

    // Check user balance
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user || user.wallet < amount) {
      res.status(400).json({ message: 'Insufficient balance' });
      return;
    }

    // Calculate possible prize initially (will be finalized at draw time)
    // Simple logic for now, later fetch from settings
    const length = bet_number.toString().length;
    let multiplier = 9;
    if (length === 2) multiplier = 90;
    if (length === 3) multiplier = 900;
    if (length === 4) multiplier = 9000;
    if (length === 5) multiplier = 90000;
    if (length === 6) multiplier = 900000;
    
    const possiblePrize = amount * multiplier;

    // Deduct balance and place bet
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { wallet: { decrement: Number(amount) } }
      }),
      prisma.bet.create({
        data: {
          user_id: user.id,
          round_id: round.id,
          bet_number: bet_number.toString(),
          amount: Number(amount),
          prize: possiblePrize,
          status: 'pending'
        }
      })
    ]);

    const io = req.app.get('io');
    if (io) {
      io.emit('new_bet', {
        user_name: user.name.length > 3 ? user.name.substring(0, 3) + '***' : user.name + '***',
        bet_number: bet_number.toString(),
        amount: Number(amount)
      });
    }

    res.status(201).json({ message: 'Bet placed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
});

// Get user bets history
router.get('/history', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const bets = await prisma.bet.findMany({
      where: { user_id: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { round: true }
    });

    res.json(bets);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
});

export default router;
