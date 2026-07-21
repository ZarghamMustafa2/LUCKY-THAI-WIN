import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../utils/db';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

router.post('/register', async (req, res) => {
  try {
    const { name, phone, password } = req.body;
    
    const existingUser = await prisma.user.findUnique({ where: { phone } });
    if (existingUser) {
      res.status(400).json({ message: 'User with this phone number already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, phone, password: hashedPassword },
    });

    res.status(201).json({ message: 'User registered successfully', userId: user.id });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await prisma.user.findUnique({ where: { phone } });

    if (!user) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ id: user.id, phone: user.phone, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    
    res.status(200).json({ 
      message: 'Login successful', 
      token, 
      user: { id: user.id, name: user.name, phone: user.phone, wallet: user.wallet, role: user.role } 
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
});

export default router;
