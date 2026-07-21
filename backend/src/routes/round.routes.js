"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("../utils/db"));
const router = express_1.default.Router();
// Get the current active round
router.get('/current', async (req, res) => {
    try {
        const round = await db_1.default.round.findFirst({
            where: { status: 'active' },
            orderBy: { createdAt: 'desc' }
        });
        res.json(round);
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
});
// Get last 20 results
router.get('/results', async (req, res) => {
    try {
        const rounds = await db_1.default.round.findMany({
            where: { status: 'completed' },
            orderBy: { end_time: 'desc' },
            take: 20
        });
        res.json(rounds);
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
});
exports.default = router;
//# sourceMappingURL=round.routes.js.map