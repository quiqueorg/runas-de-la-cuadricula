/** The countdown of a timed lesson. Pure: the hook in `useClock.ts` drives it once a second. */

export type ClockStatus = 'off' | 'waiting' | 'running' | 'expired' | 'won';

export interface Clock {
  readonly status: ClockStatus;
  /** Seconds left. */
  readonly remaining: number;
  /** The clock ran out at least once: the lesson can still be solved, but not mastered. */
  readonly ranOut: boolean;
}

const URGENT_S = 20;
/** The sand never quite fills the board while there is time left. */
const SAND_WHILE_RUNNING = 0.72;

export const initialClock = (timeLimit: number | undefined): Clock => ({
  status: timeLimit ? 'waiting' : 'off',
  remaining: timeLimit ?? 0,
  ranOut: false,
});

/** The first keystroke starts a waiting clock. */
export const startClock = (clock: Clock): Clock =>
  clock.status === 'waiting' ? { ...clock, status: 'running' } : clock;

export function tickClock(clock: Clock): Clock {
  if (clock.status !== 'running') return clock;
  if (clock.remaining <= 1) return { status: 'expired', remaining: 0, ranOut: true };
  return { ...clock, remaining: clock.remaining - 1 };
}

/** Another go after the clock ran out. */
export const restartClock = (clock: Clock, timeLimit: number): Clock => ({
  ...clock,
  status: 'running',
  remaining: timeLimit,
});

export const stopClockWon = (clock: Clock): Clock =>
  clock.status === 'running' ? { ...clock, status: 'won' } : clock;

export function clockLabel(clock: Clock): string {
  const seconds = Math.max(0, clock.remaining);
  const text = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  return clock.status === 'waiting' ? `${text} · empieza al escribir` : text;
}

export function clockTone(clock: Clock): '' | 'urgent' | 'expired' | 'won' {
  if (clock.status === 'expired' || clock.status === 'won') return clock.status;
  return clock.status === 'running' && clock.remaining <= URGENT_S ? 'urgent' : '';
}

/** How much sand covers the board, from 0 to 1. */
export function sandLevel(clock: Clock, timeLimit: number | undefined): number {
  if (clock.status === 'expired') return 1;
  if (clock.status !== 'running') return 0;
  return (1 - clock.remaining / (timeLimit ?? 1)) * SAND_WHILE_RUNNING;
}
