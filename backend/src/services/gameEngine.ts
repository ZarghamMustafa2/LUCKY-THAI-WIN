import prisma from '../utils/db';
import { Server } from 'socket.io';

export class GameEngine {
  private io: Server;
  private roundTimeMs = 30 * 1000; // Default 30 seconds
  private currentRoundId: number | null = null;
  private countdownInterval: NodeJS.Timeout | null = null;
  private endTime: number = 0;

  constructor(io: Server) {
    this.io = io;
  }

  public async start() {
    console.log('[GameEngine] Starting...');
    await this.fetchSettings();
    await this.startNewRound();
  }

  private async fetchSettings() {
    try {
      const settings = await prisma.setting.findFirst();
      if (settings && settings.round_time) {
        this.roundTimeMs = 30 * 1000; // FORCED 30 SECONDS FOR TESTING
      } else {
        await prisma.setting.create({
          data: { round_time: 5 }
        });
      }
    } catch (e) {
      console.log('[GameEngine] Database not ready or empty. Using defaults.');
    }
  }

  private async startNewRound() {
    try {
      this.endTime = Date.now() + this.roundTimeMs;
      
      const newRound = await prisma.round.create({
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

      if (this.countdownInterval) clearInterval(this.countdownInterval);
      
      this.countdownInterval = setInterval(() => this.tick(), 1000);
    } catch (error) {
      console.error('[GameEngine] Error starting round, retrying in 5s...', error);
      setTimeout(() => this.startNewRound(), 5000);
    }
  }

  private async tick() {
    const remainingMs = this.endTime - Date.now();
    
    if (remainingMs <= 0) {
      if (this.countdownInterval) clearInterval(this.countdownInterval);
      await this.endRound();
    } else {
      this.io.emit('tick', { remainingMs, roundId: this.currentRoundId });
    }
  }

  private async endRound() {
    if (!this.currentRoundId) return;
    
    console.log(`[GameEngine] Ending round ${this.currentRoundId}`);
    
    try {
      // Generate 4 digit winning number
      const winningNumber = Math.floor(1000 + Math.random() * 9000).toString();
      
      await prisma.round.update({
        where: { id: this.currentRoundId },
        data: {
          winning_number: winningNumber,
          status: 'completed'
        }
      });

      this.io.emit('round_ended', { roundId: this.currentRoundId, winningNumber });

      await this.processBets(this.currentRoundId, winningNumber);

      // Start next round after 25 seconds to show result
      setTimeout(() => this.startNewRound(), 25000);
      
    } catch (error) {
      console.error('[GameEngine] Error ending round:', error);
    }
  }

  private async processBets(roundId: number, winningNumber: string) {
    try {
      const bets = await prisma.bet.findMany({ where: { round_id: roundId, status: 'pending' } });
      
      for (const bet of bets) {
        // User wins if the drawn winning number ends with the user's bet number.
        const hasWon = winningNumber.endsWith(bet.bet_number);
        
        if (hasWon) {
          await prisma.$transaction([
            prisma.bet.update({
              where: { id: bet.id },
              data: { status: 'won' }
            }),
            prisma.user.update({
              where: { id: bet.user_id },
              data: { wallet: { increment: bet.prize } }
            }),
            prisma.transaction.create({
              data: {
                user_id: bet.user_id,
                type: 'win',
                amount: bet.prize,
                status: 'approved'
              }
            })
          ]);
        } else {
          await prisma.bet.update({
            where: { id: bet.id },
            data: { status: 'lost' }
          });
        }
      }
    } catch (e) {
      console.error('[GameEngine] Failed to process bets:', e);
    }
  }

  private generateRoundNumber(): string {
    const date = new Date();
    return `${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}-${Math.floor(Math.random() * 10000)}`;
  }
}
