"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("../utils/db"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get wallet balance and history
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const user = await db_1.default.user.findUnique({
            where: { id: req.user.id },
            select: { wallet: true, transactions: { orderBy: { createdAt: 'desc' }, take: 20 } }
        });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json({ wallet: user.wallet, transactions: user.transactions });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
});
// Request Deposit (Pending Admin Approval)
router.post('/deposit', auth_1.authenticateToken, async (req, res) => {
    try {
        const { amount } = req.body;
        if (amount <= 0) {
            res.status(400).json({ message: 'Invalid amount' });
            return;
        }
        const transaction = await db_1.default.transaction.create({
            data: {
                user_id: req.user.id,
                type: 'deposit',
                amount: Number(amount),
                status: 'pending'
            }
        });
        res.status(201).json({ message: 'Deposit request submitted successfully', transaction });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
});
// Request Withdrawal (Pending Admin Approval)
router.post('/withdraw', auth_1.authenticateToken, async (req, res) => {
    try {
        const { amount } = req.body;
        const user = await db_1.default.user.findUnique({ where: { id: req.user.id } });
        if (!user || user.wallet < amount) {
            res.status(400).json({ message: 'Insufficient wallet balance' });
            return;
        }
        // Deduct balance immediately so they don't bet it while waiting.
        // If admin rejects, we will refund it.
        await db_1.default.$transaction([
            db_1.default.user.update({
                where: { id: user.id },
                data: { wallet: { decrement: Number(amount) } }
            }),
            db_1.default.transaction.create({
                data: {
                    user_id: user.id,
                    type: 'withdraw',
                    amount: Number(amount),
                    status: 'pending'
                }
            })
        ]);
        res.status(201).json({ message: 'Withdraw request submitted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
});
exports.default = router;
//# sourceMappingURL=wallet.routes.js.map