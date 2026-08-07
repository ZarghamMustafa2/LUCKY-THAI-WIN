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

// Get last 20 confirmed results
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

// --- AUTHORITATIVE RITMU TV DRAW RESULT SYNC & VALIDATION API ---
interface ResultSyncPayload {
  drawId: string;
  gameId?: string;
  drawDate?: string;
  drawTime?: string;
  winningNumbers: string[]; // [res1, res2, res3, res4]
  sourceTimestamp?: number;
}

// Memory cache for validated draw results (complements DB persistence)
const validatedDrawStore: Record<string, {
  drawId: string;
  gameId: string;
  drawDate: string;
  drawTime: string;
  winningNumbers: string[];
  status: 'PENDING' | 'CONFIRMED';
  sourceTimestamp: number;
  confirmedAt: string;
}> = {};

// POST /api/round/sync-result -> Receive, Validate, and Confirm Official Draw Result
router.post('/sync-result', async (req, res) => {
  try {
    const { drawId, gameId = 'THAI_4D', drawDate, drawTime, winningNumbers, sourceTimestamp }: ResultSyncPayload = req.body;

    if (!drawId || !Array.isArray(winningNumbers) || winningNumbers.length < 4) {
      res.status(400).json({
        success: false,
        message: 'Invalid payload. drawId and winningNumbers array (4 items) are required.',
        status: 'PENDING'
      });
      return;
    }

    // Check duplicate or existing status
    const existing = validatedDrawStore[drawId];
    if (existing && existing.status === 'CONFIRMED') {
      res.status(409).json({
        success: false,
        message: `Draw ID ${drawId} is already CONFIRMED. Overwriting confirmed results is strictly prohibited.`,
        status: 'CONFIRMED',
        data: existing
      });
      return;
    }

    // Validate winning numbers (4-digit format)
    const isValidFormat = winningNumbers.every(n => typeof n === 'string' && /^\d{4}$/.test(n));
    if (!isValidFormat) {
      res.status(422).json({
        success: false,
        message: 'Result Validation Failed: Each winning number must be a valid 4-digit string.',
        status: 'PENDING'
      });
      return;
    }

    // Save Confirmed Result
    const confirmedRecord = {
      drawId,
      gameId,
      drawDate: drawDate || new Date().toISOString().split('T')[0],
      drawTime: drawTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      winningNumbers,
      status: 'CONFIRMED' as const,
      sourceTimestamp: sourceTimestamp || Date.now(),
      confirmedAt: new Date().toISOString()
    };

    validatedDrawStore[drawId] = confirmedRecord;

    res.json({
      success: true,
      message: `Draw ID ${drawId} Result Successfully Validated and CONFIRMED.`,
      status: 'CONFIRMED',
      data: confirmedRecord
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error during result sync', error, status: 'PENDING' });
  }
});

// GET /api/round/status/:drawId -> Query Result Status (RESULT PENDING or RESULT CONFIRMED)
router.get('/status/:drawId', (req, res) => {
  const { drawId } = req.params;
  const record = validatedDrawStore[drawId];

  if (!record || record.status !== 'CONFIRMED') {
    res.json({
      drawId,
      status: 'PENDING',
      message: 'RESULT PENDING: Official draw result from Ritmu TV source has not been received or confirmed yet.',
      winningNumbers: null
    });
    return;
  }

  res.json({
    drawId: record.drawId,
    status: 'CONFIRMED',
    message: 'RESULT CONFIRMED',
    winningNumbers: record.winningNumbers,
    drawDate: record.drawDate,
    drawTime: record.drawTime,
    confirmedAt: record.confirmedAt
  });
});

// GET /api/round/stream-ocr-status -> Query Server-Side Stream Ingestion & OCR Telemetry
router.get('/stream-ocr-status', (req, res) => {
  try {
    const { ritmuStreamOcrService } = require('../services/ritmuStreamOcr');
    const drawId = req.query.drawId ? String(req.query.drawId) : undefined;
    const phase = req.query.phase ? (String(req.query.phase) as any) : undefined;
    const telemetry = ritmuStreamOcrService.getTelemetry(drawId, phase);
    res.json({
      success: true,
      telemetry
    });
  } catch(err) {
    res.status(500).json({ success: false, message: 'Error fetching server OCR telemetry', error: err });
  }
});

export default router;
