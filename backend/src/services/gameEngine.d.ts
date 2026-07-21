import { Server } from 'socket.io';
export declare class GameEngine {
    private io;
    private roundTimeMs;
    private currentRoundId;
    private countdownInterval;
    private endTime;
    constructor(io: Server);
    start(): Promise<void>;
    private fetchSettings;
    private startNewRound;
    private tick;
    private endRound;
    private processBets;
    private generateRoundNumber;
}
//# sourceMappingURL=gameEngine.d.ts.map