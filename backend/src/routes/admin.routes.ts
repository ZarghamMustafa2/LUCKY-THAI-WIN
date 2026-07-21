import express from 'express';
import prisma from '../utils/db';
import { authenticateToken, isAdmin, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Middleware: All routes here require Admin role
router.use(authenticateToken);
router.use(isAdmin);

// --- USERS ---
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, phone: true, wallet: true, role: true, createdAt: true }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
});

router.post('/users/:id/balance', async (req, res) => {
  try {
    const { amount, action } = req.body; // action: 'add' or 'deduct'
    const userId = parseInt(req.params.id);
    
    if (action === 'add') {
      await prisma.user.update({
        where: { id: userId },
        data: { wallet: { increment: Number(amount) } }
      });
    } else if (action === 'deduct') {
      await prisma.user.update({
        where: { id: userId },
        data: { wallet: { decrement: Number(amount) } }
      });
    }

    res.json({ message: `Balance ${action}ed successfully` });
  } catch (error) {
    res.status(500).json({ message: 'Error updating balance', error });
  }
});

// --- TRANSACTIONS ---
router.get('/transactions', async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, phone: true } } }
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transactions', error });
  }
});

router.post('/transactions/:id/approve', async (req, res) => {
  try {
    const txId = parseInt(req.params.id);
    const tx = await prisma.transaction.findUnique({ where: { id: txId } });
    
    if (!tx || tx.status !== 'pending') {
      res.status(400).json({ message: 'Transaction not found or already processed' });
      return;
    }

    if (tx.type === 'deposit') {
      // Add balance to user
      await prisma.$transaction([
        prisma.transaction.update({ where: { id: txId }, data: { status: 'approved' } }),
        prisma.user.update({ where: { id: tx.user_id }, data: { wallet: { increment: tx.amount } } })
      ]);
    } else if (tx.type === 'withdraw') {
      // Balance was already deducted during request, just approve
      await prisma.transaction.update({ where: { id: txId }, data: { status: 'approved' } });
    }

    res.json({ message: 'Transaction approved' });
  } catch (error) {
    res.status(500).json({ message: 'Error approving transaction', error });
  }
});

router.post('/transactions/:id/reject', async (req, res) => {
  try {
    const txId = parseInt(req.params.id);
    const tx = await prisma.transaction.findUnique({ where: { id: txId } });
    
    if (!tx || tx.status !== 'pending') {
      res.status(400).json({ message: 'Transaction not found or already processed' });
      return;
    }

    if (tx.type === 'withdraw') {
      // Refund the deducted balance back to user
      await prisma.$transaction([
        prisma.transaction.update({ where: { id: txId }, data: { status: 'rejected' } }),
        prisma.user.update({ where: { id: tx.user_id }, data: { wallet: { increment: tx.amount } } })
      ]);
    } else {
      // Deposit rejected, nothing to refund
      await prisma.transaction.update({ where: { id: txId }, data: { status: 'rejected' } });
    }

    res.json({ message: 'Transaction rejected' });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting transaction', error });
  }
});

// --- DASHBOARD STATS ---
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalBets = await prisma.bet.count();
    const totalDepositData = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { type: 'deposit', status: 'approved' }
    });
    const totalWithdrawData = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { type: 'withdraw', status: 'approved' }
    });

    res.json({
      totalUsers,
      totalBets,
      totalDeposits: totalDepositData._sum.amount || 0,
      totalWithdrawals: totalWithdrawData._sum.amount || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error });
  }
});

export default router;
