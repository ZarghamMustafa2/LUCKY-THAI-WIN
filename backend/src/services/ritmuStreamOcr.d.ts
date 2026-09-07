export interface StreamSourceStatus {
    STREAM_SOURCE_STATUS: 'AVAILABLE' | 'UNAVAILABLE';
    sourceType: 'HLS_DIRECT_MEDIA_STREAM' | 'PAGE_URL_ANCHOR' | 'UNRESOLVED';
    lastSuccessfulFrameTimestamp: number | null;
    decodedFrameCount: number;
    lastFrameChecksum: string | null;
    lastOcrAttempt: string | null;
    message: string;
}
export interface RitmuStreamOcrTelemetry {
    streamSourceStatus: StreamSourceStatus;
    streamConnectionStatus: 'CONNECTED' | 'SEARCHING' | 'PENDING' | 'STANDBY';
    streamUrlAvailable: boolean;
    streamUrl: string | null;
    mediaStreamType: 'HLS_LIVE_MANIFEST' | 'PAGE_URL_ANCHOR';
    isDirectMediaDecoded: boolean;
    frameSha256Checksum: string | null;
    hasHardcodedFallbacks: boolean;
    frameExtractionCount: number;
    ocrInvocationCount: number;
    rawOcrReadings: string[];
    cleanedOcrReadings: string[];
    ocrConfidence: number;
    consensusCount: number;
    requiredConsensusCount: number;
    currentDrawId: string;
    currentDrawPhase: 'betting' | 'spinning' | 'idle';
    lastSuccessfulResult: {
        drawId: string;
        winningNumbers: string[];
        confirmedAt: string;
    } | null;
    lastError: string | null;
    backendValidationStatus: 'PENDING' | 'CONFIRMED';
    dashboardStatus: {
        mediaSource: string;
        ocrWorker: string;
        frameDecoding: number;
        resultConfirmation: string;
    };
}
declare class RitmuStreamOcrWorkerService {
    private active;
    private streamUrl;
    private streamConnectionStatus;
    private frameExtractionCount;
    private ocrInvocationCount;
    private lastSuccessfulFrameTimestamp;
    private lastFrameChecksum;
    private lastOcrAttempt;
    private rawOcrReadings;
    private cleanedOcrReadings;
    private candidateHistory;
    private requiredConsensusCount;
    private lastSubmittedDrawId;
    private lastSuccessfulResult;
    private lastError;
    constructor();
    initStreamDiscovery(): void;
    private isValid4DigitResult;
    private evaluateConsensus;
    submitConsensusToBackend(consensus: {
        res1: string;
        res2: string;
        res3: string;
        res4: string;
    }, drawId: string): Promise<void>;
    getStreamSourceStatus(): StreamSourceStatus;
    getTelemetry(currentDrawId?: string, currentPhase?: 'betting' | 'spinning' | 'idle'): RitmuStreamOcrTelemetry;
}
export declare const ritmuStreamOcrService: RitmuStreamOcrWorkerService;
export {};
//# sourceMappingURL=ritmuStreamOcr.d.ts.map