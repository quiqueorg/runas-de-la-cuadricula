/** Runs a timed lesson's clock once a second while it is running. */
import { useCallback, useEffect, useState } from 'react';
import { sound } from '../../../shared/audio/audio';
import {
  type Clock,
  initialClock,
  restartClock,
  startClock,
  stopClockWon,
  tickClock,
} from '../clock';

export interface ClockControls {
  readonly clock: Clock;
  /** The first keystroke starts a waiting clock. */
  readonly start: () => void;
  readonly restart: () => void;
  readonly stopWon: () => void;
}

export function useClock(timeLimit: number | undefined): ClockControls {
  const [clock, setClock] = useState(() => initialClock(timeLimit));
  const running = clock.status === 'running';

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setClock(tickClock), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (clock.status === 'expired') sound.error();
  }, [clock.status]);

  return {
    clock,
    start: useCallback(() => setClock(startClock), []),
    restart: useCallback(() => {
      if (timeLimit) setClock((current) => restartClock(current, timeLimit));
    }, [timeLimit]),
    stopWon: useCallback(() => setClock(stopClockWon), []),
  };
}
