/**
 * LUCKY THAI WIN - Standalone Real-Time Scheduled Draw Timer Module (TypeScript)
 * Authoritative 1-Hour Wall-Clock Sync Engine
 */

export interface FormattedTime {
  hhmmss: string;
  formatted: string;
  hours: string;
  mins: string;
  secs: string;
  remainingMs: number;
}

export function getNextScheduledDrawDate(): Date {
  const now = new Date();
  const nextDraw = new Date(now);
  nextDraw.setMinutes(0, 0, 0);
  nextDraw.setHours(nextDraw.getHours() + 1);

  if (nextDraw.getTime() - now.getTime() <= 0) {
    nextDraw.setHours(nextDraw.getHours() + 1);
  }
  return nextDraw;
}

export function getNextRealClockMs(): number {
  const now = new Date();
  const nextDraw = getNextScheduledDrawDate();
  const rem = nextDraw.getTime() - now.getTime();
  return Math.max(1000, rem);
}

export function formatTimeFromMs(remainingMs: number): FormattedTime {
  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);

  const hours = h.toString().padStart(2, '0');
  const mins = m.toString().padStart(2, '0');
  const secs = s.toString().padStart(2, '0');

  const hhmmss = `${hours}:${mins}:${secs}`;
  const formatted = h > 0 ? `${h}h ${m}m ${secs}s` : (m > 0 ? `${m}m ${secs}s` : `0m ${secs}s`);

  return {
    hhmmss,
    formatted,
    hours,
    mins,
    secs,
    remainingMs
  };
}

export function startTimerTicker(onTick: (data: FormattedTime) => void): () => void {
  const tick = () => {
    const ms = getNextRealClockMs();
    const formatted = formatTimeFromMs(ms);
    onTick(formatted);
  };

  tick();
  const intervalId = setInterval(tick, 1000);
  return () => clearInterval(intervalId);
}
