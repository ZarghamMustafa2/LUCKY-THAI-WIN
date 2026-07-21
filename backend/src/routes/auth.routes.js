"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../utils/db"));
const router = express_1.default.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';
router.post('/register', async (req, res) => {
    try {
        const { name, phone, password } = req.body;
        const existingUser = await db_1.default.user.findUnique({ where: { phone } });
        if (existingUser) {
            res.status(400).json({ message: 'User with this phone number already exists' });
            return;
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const user = await db_1.default.user.create({
            data: { name, phone, password: hashedPassword },
        });
        res.status(201).json({ message: 'User registered successfully', userId: user.id });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
});
router.post('/login', async (req, res) => {
    try {
        const { phone, password } = req.body;
        const user = await db_1.default.user.findUnique({ where: { phone } });
        if (!user) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }
        const validPassword = await bcrypt_1.default.compare(password, user.password);
        if (!validPassword) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, phone: user.phone, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        res.status(200).json({
            message: 'Login successful',
            token,
            user: { id: user.id, name: user.name, phone: user.phone, wallet: user.wallet, role: user.role }
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
});
exports.default = router;
//# sourceMappingURL=auth.routes.js.map