"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameEngine = void 0;
const db_1 = __importDefault(require("../utils/db"));
const socket_io_1 = require("socket.io");
class GameEngine {
    io;
    roundTimeMs = 5 * 60 * 1000; // Default 5 minutes
    currentRoundId = null;
    countdownInterval = null;
    endTime = 0;
    constructor(io) {
        this.io = io;
    }
    async start() {
        console.log('[GameEngine] Starting...');
        await this.fetchSettings();
        await this.startNewRound();
    }
    async fetchSettings() {
        try {
            const settings = await db_1.default.setting.findFirst();
            if (settings && settings.round_time) {
                this.roundTimeMs = settings.round_time * 60 * 1000;
            }
            else {
                await db_1.default.setting.create({
                    data: { round_time: 5 }
                });
            }
        }
        catch (e) {
            console.log('[GameEngine] Database not ready or empty. Using defaults.');
        }
    }
    async startNewRound() {
        try {
            this.endTime = Date.now() + this.roundTimeMs;
            const newRound = await db_1.default.round.create({
                data: {
                    round_number: this.generateRoundNumber(),
                    start_time: new Date(),
                    end_time: new Date(this.endTime),
                    status: 'active'
                }
            });
            this.currentRoundId = newRound.id;
            console.log(`[GameEngine] Started new round: ${newRound.round_number}`);
            this.io.emit('round_started', newRound);
            if (this.countdownInterval)
                clearInterval(this.countdownInterval);
            this.countdownInterval = setInterval(() => this.tick(), 1000);
        }
        catch (error) {
            console.error('[GameEngine] Error starting round, retrying in 5s...', error);
            setTimeout(() => this.startNewRound(), 5000);
        }
    }
    async tick() {
        const remainingMs = this.endTime - Date.now();
        if (remainingMs <= 0) {
            if (this.countdownInterval)
                clearInterval(this.countdownInterval);
            await this.endRound();
        }
        else {
            this.io.emit('tick', { remainingMs, roundId: this.currentRoundId });
        }
    }
    async endRound() {
        if (!this.currentRoundId)
            return;
        console.log(`[GameEngine] Ending round ${this.currentRoundId}`);
        try {
            // Generate 6 digit winning number
            const winningNumber = Math.floor(100000 + Math.random() * 900000).toString();
            await db_1.default.round.update({
                where: { id: this.currentRoundId },
                data: {
                    winning_number: winningNumber,
                    status: 'completed'
                }
            });
            this.io.emit('round_ended', { roundId: this.currentRoundId, winningNumber });
            await this.processBets(this.currentRoundId, winningNumber);
            // Start next round after 5 seconds
            setTimeout(() => this.startNewRound(), 5000);
        }
        catch (error) {
            console.error('[GameEngine] Error ending round:', error);
        }
    }
    async processBets(roundId, winningNumber) {
        try {
            const bets = await db_1.default.bet.findMany({ where: { round_id: roundId, status: 'pending' } });
            for (const bet of bets) {
                // User wins if the drawn winning number ends with the user's bet number.
                const hasWon = winningNumber.endsWith(bet.bet_number);
                if (hasWon) {
                    await db_1.default.$transaction([
                        db_1.default.bet.update({
                            where: { id: bet.id },
                            data: { status: 'won' }
                        }),
                        db_1.default.user.update({
                            where: { id: bet.user_id },
                            data: { wallet: { increment: bet.prize } }
                        }),
                        db_1.default.transaction.create({
                            data: {
                                user_id: bet.user_id,
                                type: 'win',
                                amount: bet.prize,
                                status: 'approved'
                            }
                        })
                    ]);
                }
                else {
                    await db_1.default.bet.update({
                        where: { id: bet.id },
                        data: { status: 'lost' }
                    });
                }
            }
        }
        catch (e) {
            console.error('[GameEngine] Failed to process bets:', e);
        }
    }
    generateRoundNumber() {
        const date = new Date();
        return `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}-${Math.floor(Math.random() * 10000)}`;
    }
}
exports.GameEngine = GameEngine;
//# sourceMappingURL=gameEngine.js.map