"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("../utils/db"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Place a bet
router.post('/place', auth_1.authenticateToken, async (req, res) => {
    try {
        const { round_id, bet_number, amount } = req.body;
        if (!bet_number || amount <= 0) {
            res.status(400).json({ message: 'Invalid bet details' });
            return;
        }
        // Get current active round
        const round = await db_1.default.round.findUnique({ where: { id: round_id } });
        if (!round || round.status !== 'active') {
            res.status(400).json({ message: 'Round is not active' });
            return;
        }
        // Check user balance
        const user = await db_1.default.user.findUnique({ where: { id: req.user.id } });
        if (!user || user.wallet < amount) {
            res.status(400).json({ message: 'Insufficient balance' });
            return;
        }
        // Calculate possible prize initially (will be finalized at draw time)
        // Simple logic for now, later fetch from settings
        const length = bet_number.toString().length;
        let multiplier = 9;
        if (length === 2)
            multiplier = 90;
        if (length === 3)
            multiplier = 900;
        if (length === 4)
            multiplier = 9000;
        if (length === 5)
            multiplier = 90000;
        if (length === 6)
            multiplier = 900000;
        const possiblePrize = amount * multiplier;
        // Deduct balance and place bet
        await db_1.default.$transaction([
            db_1.default.user.update({
                where: { id: user.id },
                data: { wallet: { decrement: Number(amount) } }
            }),
            db_1.default.bet.create({
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
        res.status(201).json({ message: 'Bet placed successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
});
// Get user bets history
router.get('/history', auth_1.authenticateToken, async (req, res) => {
    try {
        const bets = await db_1.default.bet.findMany({
            where: { user_id: req.user.id },
            orderBy: { createdAt: 'desc' },
            take: 50,
            include: { round: true }
        });
        res.json(bets);
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
});
exports.default = router;
//# sourceMappingURL=bet.routes.js.map