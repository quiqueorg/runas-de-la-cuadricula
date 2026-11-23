/**
 * `?test` only. Plays the whole catalog on an empty save, then puts the real one back.
 *
 *   await __runas.comprobar()       every lesson; or a prefix: 'b' the isle, 'b4-' one region
 *   __runas.rellenar('b4-7')        opens a lesson and writes its solution
 */
import { levels } from '../core/catalog';
import { goToLesson } from '../core/navigation';
import { getProgress, replaceProgress } from '../core/progress/store';
import { requestFill } from '../features/challenge/fill';

export interface SelfTestReport {
  readonly total: number;
  readonly fallos: readonly string[];
}

declare global {
  interface Window {
    __runas?: {
      readonly NIVELES: typeof levels;
      readonly rellenar: (id: string) => void;
      readonly comprobar: (prefix?: string) => Promise<SelfTestReport>;
    };
  }
}

const pause = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

async function openBoard(id: string): Promise<HTMLElement | null> {
  goToLesson(id);
  for (let tries = 0; tries < 40; tries++) {
    await pause(tries ? 100 : 230);
    const view = document.querySelector<HTMLElement>('#view-challenge');
    if (view) return view;
  }
  return null;
}

function fill(id: string): void {
  goToLesson(id);
  requestFill(id, 'solution');
}

/** Why a lesson fails, or null when it arrives unsolved and its own solution solves it. */
async function checkLesson(id: string, exam: boolean): Promise<string | null> {
  const view = await openBoard(id);
  if (!view) return 'no se abre';
  if (view.classList.contains('solved')) return 'ya llega resuelto';
  fill(id);
  await pause(270);
  if (exam) {
    const deliver = [...view.querySelectorAll('button')].find((button) =>
      button.textContent?.includes('Entregar'),
    );
    deliver?.click();
    await pause(200);
  }
  if (document.querySelector('#view-challenge.solved, #view-challenge .msg.bien')) return null;
  const message = document.querySelector('#view-challenge .msg')?.textContent?.slice(0, 120) ?? '';
  return `su solución no lo resuelve · ${message}`;
}

export async function selfTest(prefix = ''): Promise<SelfTestReport> {
  const kept = getProgress();
  const cameFrom = location.hash;
  replaceProgress({ ...kept, results: {}, code: {}, failedAttempts: {}, foundSecrets: {} });
  const chosen = levels.filter((level) => level.id.startsWith(prefix));
  const failures: string[] = [];
  try {
    for (const level of chosen) {
      const problem = await checkLesson(level.id, Boolean(level.exam));
      if (problem) failures.push(`${level.id}: ${problem}`);
    }
  } finally {
    replaceProgress(kept);
    location.hash = cameFrom;
  }
  if (failures.length) {
    console.warn(
      `${failures.length} de ${chosen.length} ejercicios fallan:\n${failures.join('\n')}`,
    );
  } else {
    console.info(`${chosen.length} ejercicios: todos se resuelven con su solución.`);
  }
  return { total: chosen.length, fallos: failures };
}

export function installSelfTest(): void {
  window.__runas = { NIVELES: levels, rellenar: fill, comprobar: selfTest };
}
