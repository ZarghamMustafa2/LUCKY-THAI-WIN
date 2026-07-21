import express from 'express';
import prisma from '../utils/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get wallet balance and history
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { wallet: true, transactions: { orderBy: { createdAt: 'desc' }, take: 20 } }
    });
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({ wallet: user.wallet, transactions: user.transactions });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
});

// Request Deposit (Pending Admin Approval)
router.post('/deposit', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { amount } = req.body;
    if (amount <= 0) {
      res.status(400).json({ message: 'Invalid amount' });
      return;
    }

    const transaction = await prisma.transaction.create({
      data: {
        user_id: req.user.id,
        type: 'deposit',
        amount: Number(amount),
        status: 'pending'
      }
    });

    res.status(201).json({ message: 'Deposit request submitted successfully', transaction });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
});

// Request Withdrawal (Pending Admin Approval)
router.post('/withdraw', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { amount } = req.body;
    
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user || user.wallet < amount) {
      res.status(400).json({ message: 'Insufficient wallet balance' });
      return;
    }

    // Deduct balance immediately so they don't bet it while waiting.
    // If admin rejects, we will refund it.
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { wallet: { decrement: Number(amount) } }
      }),
      prisma.transaction.create({
        data: {
          user_id: user.id,
          type: 'withdraw',
          amount: Number(amount),
          status: 'pending'
        }
      })
    ]);

    res.status(201).json({ message: 'Withdraw request submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
});

export default router;
