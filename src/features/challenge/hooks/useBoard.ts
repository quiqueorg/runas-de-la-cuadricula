/**
 * The board's DOM and its measurement. Evaluating needs the board laid out, so it runs in a layout
 * effect after every render that changes one of its inputs, and again when the frame resizes.
 */
import { createRef, type RefObject, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { Level } from '../../../core/models';
import { type BlueprintView, readBlueprint } from '../board/blueprint';
import { type BoardLayers, stageSize } from '../board/layers';
import { type Evaluation, type EvaluationInput, evaluate } from '../evaluate';

const MOBILE_QUERY = '(max-width: 900px)';

export interface BoardRefs {
  readonly root: RefObject<HTMLElement | null>;
  readonly frame: RefObject<HTMLDivElement | null>;
  readonly stage: RefObject<HTMLDivElement | null>;
  readonly canvas: RefObject<HTMLDivElement | null>;
  readonly floor: RefObject<HTMLDivElement | null>;
  readonly sand: RefObject<HTMLDivElement | null>;
  readonly player: RefObject<HTMLDivElement | null>;
  readonly target: RefObject<HTMLDivElement | null>;
  readonly outline: RefObject<HTMLDivElement | null>;
  readonly probe: RefObject<HTMLDivElement | null>;
  readonly probeTarget: RefObject<HTMLDivElement | null>;
  readonly playerSheet: RefObject<HTMLStyleElement | null>;
  readonly goalSheet: RefObject<HTMLStyleElement | null>;
}

/** Stable for the component's life, so effects can depend on it. */
function useBoardRefs(): BoardRefs {
  const [refs] = useState<BoardRefs>(() => ({
    root: createRef<HTMLElement>(),
    frame: createRef<HTMLDivElement>(),
    stage: createRef<HTMLDivElement>(),
    canvas: createRef<HTMLDivElement>(),
    floor: createRef<HTMLDivElement>(),
    sand: createRef<HTMLDivElement>(),
    player: createRef<HTMLDivElement>(),
    target: createRef<HTMLDivElement>(),
    outline: createRef<HTMLDivElement>(),
    probe: createRef<HTMLDivElement>(),
    probeTarget: createRef<HTMLDivElement>(),
    playerSheet: createRef<HTMLStyleElement>(),
    goalSheet: createRef<HTMLStyleElement>(),
  }));
  return refs;
}

function layersOf(refs: BoardRefs): BoardLayers | null {
  const { canvas, floor, sand, player, target, outline, probe, probeTarget } = refs;
  if (!canvas.current || !floor.current || !sand.current || !player.current) return null;
  if (!target.current || !outline.current || !probe.current || !probeTarget.current) return null;
  return {
    canvas: canvas.current,
    floor: floor.current,
    sand: sand.current,
    player: player.current,
    target: target.current,
    outline: outline.current,
    probe: probe.current,
    probeTarget: probeTarget.current,
  };
}

/** Scales the stage to the space it has, and returns the scale. */
function fitStage(level: Level, refs: BoardRefs): number {
  const frame = refs.frame.current;
  const stage = refs.stage.current;
  const canvas = refs.canvas.current;
  if (!frame || !stage || !canvas) return 1;
  const { width, height } = stageSize(level);
  const mobile = matchMedia(MOBILE_QUERY).matches;
  const viewport = window.visualViewport?.height ?? window.innerHeight;
  const availableWidth = frame.clientWidth || 300;
  const availableHeight = mobile
    ? Math.max(130, Math.min(viewport * 0.32, window.innerHeight * 0.36))
    : Math.max(280, window.innerHeight - 200);
  const scale = Math.max(
    0.3,
    Math.min(mobile ? 1.1 : 1.45, availableWidth / width, availableHeight / height),
  );
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  canvas.style.transform = `scale(${scale})`;
  stage.style.width = `${width * scale}px`;
  stage.style.height = `${height * scale}px`;
  // On narrow screens the board is pinned over the page; fields scroll clear of it (see challenge.css).
  refs.root.current?.style.setProperty('--board-h', `${frame.parentElement?.offsetHeight ?? 0}px`);
  if (level.tokenSize) {
    canvas.style.setProperty('--dw', `${level.tokenSize[0]}px`);
    canvas.style.setProperty('--dh', `${level.tokenSize[1]}px`);
  }
  return scale;
}

/** A new tick whenever the frame or the window changes size. */
function useResizeTick(frame: RefObject<HTMLDivElement | null>): number {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    const bump = () => setTick((value) => value + 1);
    const observer = new ResizeObserver(bump);
    observer.observe(element);
    window.addEventListener('resize', bump);
    window.visualViewport?.addEventListener('resize', bump);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', bump);
      window.visualViewport?.removeEventListener('resize', bump);
    };
  }, [frame]);
  return tick;
}

/** Only what the screen shows: re-rendering for an identical evaluation would be wasted work. */
const sameEvaluation = (a: Evaluation | null, b: Evaluation): boolean =>
  a !== null && JSON.stringify(a) === JSON.stringify(b);

export type BoardInput = Omit<EvaluationInput, 'layers' | 'scale' | 'sheets'>;

export interface BoardMeasurement {
  readonly refs: BoardRefs;
  readonly evaluation: Evaluation | null;
  /** The exam's plan, one per view and state. */
  readonly plans: readonly BlueprintView[];
  /** Stage scale, for anything drawn in board pixels. */
  readonly scale: number;
  readonly layers: () => BoardLayers | null;
}

/**
 * @param active the visible boards show the simulated state; evaluating does not read it, but what
 *   it measures there (guides, stacking) changes with it.
 */
export function useBoard(input: BoardInput, active: boolean): BoardMeasurement {
  const refs = useBoardRefs();
  const tick = useResizeTick(refs.frame);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [plans, setPlans] = useState<readonly BlueprintView[]>([]);
  const scale = useRef(1);
  const { level, tablet, view, guidesOn, clock, delivery, mastered } = input;

  // biome-ignore lint/correctness/useExhaustiveDependencies: `tick` and `active` only trigger a re-measure.
  useLayoutEffect(() => {
    const layers = layersOf(refs);
    if (!layers) return;
    scale.current = fitStage(level, refs);
    // The sand is measured off: it would cover the pieces.
    layers.canvas.style.setProperty('--arena', '0');
    const next = evaluate({
      level,
      layers,
      tablet,
      view,
      scale: scale.current,
      guidesOn,
      clock,
      delivery,
      mastered,
      sheets: { player: refs.playerSheet.current, goal: refs.goalSheet.current },
    });
    layers.canvas.style.setProperty('--arena', next.sand.toFixed(3));
    setEvaluation((current) => (sameEvaluation(current, next) ? current : next));
  }, [level, refs, tablet, view, guidesOn, clock, delivery, mastered, tick, active]);

  // The plan only changes with the layout: re-read it when the evaluation does.
  useLayoutEffect(() => {
    const layers = layersOf(refs);
    if (!level.exam || !layers || !evaluation) return;
    setPlans(readBlueprint(level, layers, view, scale.current, refs.goalSheet.current));
  }, [level, view, evaluation, refs]);

  return { refs, evaluation, plans, scale: scale.current, layers: () => layersOf(refs) };
}
