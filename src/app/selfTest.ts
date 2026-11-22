/** `?test` only. Plays the whole catalog on an empty save, then puts the real one back. */
import { levels } from '../core/catalog';
import type { Progress } from '../core/models';
import { progress, saveProgress } from '../core/state';

export interface SelfTestReport {
  readonly total: number;
  readonly fallos: readonly string[];
}

const pause = (ms: number) => new Promise<void>((resolve) => { setTimeout(resolve, ms); });

async function board(id: string): Promise<HTMLElement | null> {
  location.hash = `prueba-${id}`;
  for (let tries = 0; tries < 40; tries++) {
    await pause(tries ? 100 : 230);
    const view = document.querySelector<HTMLElement>('#view-challenge');
    if (view) return view;
  }
  return null;
}

/** A lesson passes when it is not solved on arrival and its own solution solves it. `prefix` narrows the run: 'b' is the isle, 'b4-' one region. */
export async function selfTest(fill: (id: string) => void, prefix = ''): Promise<SelfTestReport> {
  const kept = JSON.stringify(progress);
  const cameFrom = location.hash;
  Object.assign(progress, { hechos: {}, codigo: {}, intentos: {}, secretos: {} });
  const chosen = levels.filter((level) => level.id.startsWith(prefix));
  const failures: string[] = [];
  try {
    for (const level of chosen) {
      const view = await board(level.id);
      if (!view) { failures.push(`${level.id}: no se abre`); continue; }
      if (view.classList.contains('solved')) { failures.push(`${level.id}: ya llega resuelto`); continue; }
      fill(level.id);
      await pause(270);
      if (level.examen) {
        [...view.querySelectorAll('button')].find((button) => button.textContent?.includes('Entregar'))?.click();
        await pause(200);
      }
      const solved = document.querySelector('#view-challenge.solved, #view-challenge .msg.bien');
      if (!solved) failures.push(`${level.id}: su solución no lo resuelve · ${document.querySelector('#view-challenge .msg')?.textContent?.slice(0, 120) ?? ''}`);
    }
  } finally {
    const saved = JSON.parse(kept) as Progress;
    Object.assign(progress, saved);
    progress.mundo = saved.mundo;
    saveProgress(true);
    location.hash = cameFrom;
  }
  if (failures.length) console.warn(`${failures.length} de ${chosen.length} ejercicios fallan:\n${failures.join('\n')}`);
  else console.info(`${chosen.length} ejercicios: todos se resuelven con su solución.`);
  return { total: chosen.length, fallos: failures };
}
