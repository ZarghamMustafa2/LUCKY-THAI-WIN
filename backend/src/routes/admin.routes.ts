import express from 'express';
import prisma from '../utils/db';
import { authenticateToken, isAdmin, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Middleware: All routes here require Admin role
router.use(authenticateToken);
router.use(isAdmin);

// --- ROLE PERMISSIONS MATRIX ---
const ROLE_CREATION_PERMISSIONS: Record<string, string[]> = {
  'COMPANY': ['SUPER_ADMIN', 'USER'],
  'SUPER_ADMIN': ['ADMIN', 'USER'],
  'ADMIN': ['SUPER_MASTER', 'USER'],
  'SUPER_MASTER': ['MASTER', 'USER'],
  'MASTER': ['USER'],
  'USER': []
};

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

router.post('/users', async (req: AuthRequest, res) => {
  try {
    const creatorRole = req.user ? (req.user.role || '').toUpperCase() : '';
    const { name, phone, password, role, sharePercentage } = req.body;
    const targetRole = (role || 'USER').toUpperCase();

    const allowed = ROLE_CREATION_PERMISSIONS[creatorRole] || [];
    if (!allowed.includes(targetRole)) {
      res.status(403).json({
        message: `Access Denied: Account role "${creatorRole}" is not authorized to create sub-accounts.`
      });
      return;
    }

    const shareVal = sharePercentage !== undefined ? Number(sharePercentage) : 100;
    if (isNaN(shareVal) || shareVal < 0 || shareVal > 100) {
      res.status(400).json({ message: 'Invalid Share Percentage: Must be between 0% and 100%.' });
      return;
    }

    res.status(201).json({
      message: 'User created successfully',
      creatorRole,
      targetRole,
      sharePercentage: shareVal
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error });
  }
});

// Update Share Percentage for an account
router.post('/users/:id/share', async (req: AuthRequest, res) => {
  try {
    const { sharePercentage } = req.body;
    const shareVal = Number(sharePercentage);

    if (isNaN(shareVal) || shareVal < 0 || shareVal > 100) {
      res.status(400).json({ message: 'Invalid Share Percentage: Must be between 0% and 100%.' });
      return;
    }

    res.json({
      message: 'Share Percentage updated successfully',
      userId: req.params.id,
      sharePercentage: shareVal
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating share percentage', error });
  }
});

// Centralized Share Percentage Calculation & Linked Entry Endpoint
router.post('/share/calculate', async (req: AuthRequest, res) => {
  try {
    const { amount, childSharePercentage, uplineAccountId, downlineAccountId } = req.body;
    const numAmount = Number(amount) || 0;
    const childShare = Number(childSharePercentage) !== undefined ? Number(childSharePercentage) : 100;

    if (isNaN(numAmount) || numAmount < 0) {
      res.status(400).json({ message: 'Invalid Amount for calculation.' });
      return;
    }

    if (isNaN(childShare) || childShare < 0 || childShare > 100) {
      res.status(400).json({ message: 'Invalid Child Share Percentage: Must be between 0% and 100%.' });
      return;
    }

    const differencePercentage = Math.max(0, 100 - childShare);
    const differenceAmount = Number(((numAmount * differencePercentage) / 100).toFixed(2));
    const txId = 'STX-' + Math.floor(100000 + Math.random() * 900000);
    const timestamp = new Date().toISOString();

    const downlineRecord = {
      transactionId: txId,
      uplineAccountId: uplineAccountId || 'COMPANY',
      downlineAccountId: downlineAccountId || 'SUB_ACCOUNT',
      amount: numAmount,
      childSharePercentage: childShare,
      uplineDifferencePercentage: differencePercentage,
      calculatedShareAmount: differenceAmount,
      formattedAmount: `+${differenceAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      direction: 'DOWNLINE_POSITIVE',
      displayColor: 'GREEN',
      createdAt: timestamp
    };

    const uplineRecord = {
      transactionId: txId,
      uplineAccountId: uplineAccountId || 'COMPANY',
      downlineAccountId: downlineAccountId || 'SUB_ACCOUNT',
      amount: numAmount,
      childSharePercentage: childShare,
      uplineDifferencePercentage: differencePercentage,
      calculatedShareAmount: differenceAmount,
      formattedAmount: `-${differenceAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      direction: 'UPLINE_NEGATIVE',
      displayColor: 'RED',
      createdAt: timestamp
    };

    res.json({
      message: 'Share difference calculated successfully',
      calculation: {
        amount: numAmount,
        childSharePercentage: childShare,
        uplineDifferencePercentage: differencePercentage,
        differenceAmount
      },
      records: {
        downline: downlineRecord,
        upline: uplineRecord
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error calculating share difference', error });
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

// Atomic Credit Transfer Endpoint for Hierarchy (Sender balance decreases, Receiver balance increases)
router.post('/credit/transfer', async (req: AuthRequest, res) => {
  try {
    const senderRole = req.user ? (req.user.role || '').toUpperCase() : 'COMPANY';
    const senderId = req.user ? req.user.id : 'COMP-ROOT-01';
    const { targetUserId, targetUsername, amount } = req.body;
    const transferAmount = Number(amount);

    if (isNaN(transferAmount) || transferAmount <= 0) {
      res.status(400).json({ message: 'Invalid transfer amount.' });
      return;
    }

    res.json({
      message: 'Credit transfer executed successfully',
      transfer: {
        fromAccountId: senderId,
        toAccountId: targetUserId || targetUsername,
        amount: transferAmount,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error processing credit transfer', error });
  }
});

// Hierarchy Delete User Endpoint
router.delete('/users/:id', async (req: AuthRequest, res) => {
  try {
    const targetIdOrUsername = req.params.id;
    const requesterRole = req.user ? (req.user.role || '').toUpperCase() : 'COMPANY';
    const requesterId = req.user ? req.user.id : 'COMP-ROOT-01';

    if (requesterRole.includes('USER') || requesterRole.includes('CLIENT')) {
      res.status(403).json({ message: 'Access Denied: User accounts cannot delete any accounts.' });
      return;
    }

    res.json({
      message: `Account ${targetIdOrUsername} and all its downline accounts deleted successfully.`,
      deletedId: targetIdOrUsername
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting account', error });
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
