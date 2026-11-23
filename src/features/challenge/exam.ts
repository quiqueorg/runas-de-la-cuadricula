/** Delivering an exam: the verdict shown on the tablet. Pure. */
import { regions } from '../../core/catalog';
import type { Level } from '../../core/models';
import { escapeHtml } from '../../shared/dom';
import type { StatusLine } from './evaluate';

/** How the board stood when the player pressed "Entregar". */
export interface ExamSnapshot {
  readonly solved: boolean;
  readonly placed: number;
  readonly total: number;
  /** Pieces out of place, to flash. */
  readonly misplaced: readonly number[];
  readonly failedViews: readonly string[];
  /** No wrong or sealed runes. */
  readonly clean: boolean;
  readonly checksPassed: boolean;
}

const TAUNTS = [
  '¡JA! ¿Eso es todo lo que sabes?',
  '¡Mis vientos se ríen de tus runas!',
  '¡Fallaste! El cielo es mío.',
  '¡Otra vez! ¡Me encanta verte fallar!',
  '¡Tu plano se lo lleva el huracán!',
];

/** `el tablero a 400px y 600px`, or `«Móvil» y «Impresión»` for views that are not just sizes. */
export function viewList(
  names: readonly string[],
  bySize = names.every((name) => /^\d/.test(name)),
): string {
  return bySize
    ? `el tablero a ${names.join(' y ')}`
    : names.map((name) => `«${name}»`).join(' y ');
}

export function passedDelivery(level: Level): StatusLine {
  return {
    tone: 'bien',
    icon: 'i-hecho',
    html: level.boss
      ? '¡Golpe certero! El plano y el tablero coinciden.'
      : 'Entrega correcta. El plano y el tablero coinciden.',
  };
}

/** @param attempt this delivery's number, counting failures from 1 */
export function failedDelivery(level: Level, exam: ExamSnapshot, attempt: number): StatusLine {
  const region = regions[level.region];
  const taunts = region?.taunts ?? TAUNTS;
  const taunt = taunts[(attempt - 1) % taunts.length] ?? '';
  const severalViews = level.views.length > 1;
  const parts = [
    level.boss ? `<b>${escapeHtml(region?.character ?? '')}:</b> «${taunt}» ` : '',
    `Entrega ${attempt}: ${exam.placed} de ${exam.total} piezas en su sitio`,
    severalViews ? ' en la vista actual' : '',
    exam.clean ? '' : ', y la tablilla tiene runas incorrectas o selladas',
    exam.checksPassed ? '' : ', y falta cumplir alguna condición',
    '.',
    severalViews && exam.failedViews.length ? ` Revisa ${viewList(exam.failedViews)}.` : '',
    exam.misplaced.length ? ' Las piezas que parpadean no coinciden con el plano.' : '',
  ];
  return { tone: 'error', icon: 'i-aviso', html: parts.join('') };
}
