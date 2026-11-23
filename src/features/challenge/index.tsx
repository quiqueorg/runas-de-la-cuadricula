/** Lesson composition: measure the board, reduce actions, hand the view a model. */
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { BASE_OFFSET, canvasGutter, isModernLevel, levelKind, levelLabel, regionOf, worldMeta } from '../../core/catalog';
import type { BoardView, Level } from '../../core/models';
import { navigate } from '../../core/navigation';
import { session } from '../../core/session';
import { progress, saveProgress } from '../../core/state';
import { useGame } from '../../core/useGame';
import { music, sound } from '../../shared/audio/audio';
import { registerSymbols } from '../../shared/icons/registry';
import { isleSymbols } from '../../shared/icons/isleSymbols';
import { SYMBOLS } from '../../shared/icons/symbols';
import { ChallengeView } from './ChallengeView';
import {
  CONDITION_TOKENS,
  activeView,
  chimeIfNeeded,
  deliverExam,
  evaluate,
  freshLive,
  readBlueprint,
  registerFill,
  savedTexts,
  setBoardState,
  solutionTexts,
  type BlueprintView,
  type Evaluation,
  type LiveChallenge,
} from './engine';
import { advanceClock, beginClock, editorRows, lessonChrome, restartClock, runeSnippet } from './model';

registerSymbols(SYMBOLS);
registerSymbols(isleSymbols(BASE_OFFSET));

export { requestFill } from './engine';

export interface ChallengeProps {
  readonly level: Level;
  readonly onVictory: (model: NonNullable<Evaluation['victory']>) => void;
}

function signature(view: Evaluation): string {
  return JSON.stringify({
    messages: view.messages,
    rules: view.rules,
    solved: view.solved,
    placed: view.placed,
    matches: view.matches,
    legend: view.legend,
    showNotice: view.showNotice,
    clock: view.clockLabel,
    clockClass: view.clockClass,
    widthOk: view.widthOk,
    guides: view.guides,
    arena: view.arena,
  });
}

export function Challenge({ level, onVictory }: ChallengeProps) {
  useGame();
  const live = useRef<LiveChallenge>(freshLive(level));
  const roots = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const floorRef = useRef<HTMLDivElement>(null);
  const sandRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const outlineRef = useRef<HTMLDivElement>(null);
  const probeRef = useRef<HTMLDivElement>(null);
  const probeTargetRef = useRef<HTMLDivElement>(null);
  const objectiveStyle = useRef<HTMLStyleElement>(null);
  const playerStyle = useRef<HTMLStyleElement>(null);
  const lastArea = useRef<HTMLTextAreaElement | null>(null);
  const [texts, setTexts] = useState(() => savedTexts(level).texts);
  const [conditions, setConditions] = useState(() => savedTexts(level).conditions);
  const [selectors, setSelectors] = useState(() => savedTexts(level).selectors);
  const [peeking, setPeeking] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  const [hintStep, setHintStep] = useState(0);
  const [linesOn, setLinesOn] = useState(progress.lineas !== false);
  const [active, setActive] = useState(false);
  const [running, setRunning] = useState(false);
  const [tick, setTick] = useState(0);
  const [sparks, setSparks] = useState<readonly { x: number; y: number; delay: number; scale: number }[]>([]);
  const [view, setView] = useState<Evaluation | null>(null);
  const [plans, setPlans] = useState<readonly BlueprintView[]>([]);
  const [hit, setHit] = useState<'golpe-heroe' | 'golpe-jefe' | ''>('');
  const seen = useRef('');
  const openedLevel = useRef(level.id);
  if (openedLevel.current !== level.id) {
    openedLevel.current = level.id;
    const saved = savedTexts(level);
    live.current = freshLive(level);
    seen.current = '';
    setTexts(saved.texts);
    setConditions(saved.conditions);
    setSelectors(saved.selectors);
    setPeeking(false);
    setHintOpen(false);
    setHintStep(0);
    setActive(false);
    setRunning(false);
    setView(null);
    setPlans([]);
  }

  useEffect(() => {
    progress.actual = level.id;
    session.level = level;
    session.world = level.mundo;
    progress.mundo = level.mundo;
    if (level.secreto && !progress.secretos[level.id]) progress.secretos[level.id] = true;
    saveProgress();
    const modern = isModernLevel(level);
    music.escala(level.secreto ? (level.mundo === 'flex' ? 'secretosub' : level.mundo === 'base' ? 'secretoisla' : modern ? 'secretocielo' : 'secreto') : level.mundo === 'final' ? 'final' : level.t || regionOf(level).t);
    document.title = `${levelKind(level)} ${levelLabel(level.id)} ${level.n} · ${worldMeta[level.mundo].n}`;
    registerFill(level.id, (field) => {
      const filled = solutionTexts(level, field);
      setTexts(filled.texts);
      setConditions(filled.conditions);
      setSelectors(filled.selectors);
    });
  }, [level]);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      const stepped = advanceClock(live.current.clock);
      live.current.clock = stepped.clock;
      if (stepped.expired) { sound.error(); setRunning(false); }
      setTick((value) => value + 1);
    }, 1000);
    live.current.clock = { ...live.current.clock, id };
    return () => window.clearInterval(id);
  }, [running]);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const floor = floorRef.current;
    const sand = sandRef.current;
    const player = playerRef.current;
    const target = targetRef.current;
    const outline = outlineRef.current;
    const probe = probeRef.current;
    const probeTarget = probeTargetRef.current;
    if (!frame || !stage || !canvas || !floor || !sand || !player || !target || !outline || !probe || !probeTarget) return;
    const board = { player, target, outline, probe, probeTarget, canvas, floor, sand };
    const maxW = Math.max(...level.anchos);
    const width = maxW + 2 * canvasGutter;
    const height = level.h + 2 * canvasGutter;
    const mobile = matchMedia('(max-width: 900px)').matches;
    const availableW = frame.clientWidth || 300;
    const viewport = window.visualViewport?.height ?? window.innerHeight;
    const availableH = mobile ? Math.max(130, Math.min(viewport * 0.32, window.innerHeight * 0.36)) : Math.max(280, window.innerHeight - 200);
    live.current.stageScale = Math.max(0.3, Math.min(mobile ? 1.1 : 1.45, availableW / width, availableH / height));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.style.transform = `scale(${live.current.stageScale})`;
    stage.style.width = `${width * live.current.stageScale}px`;
    stage.style.height = `${height * live.current.stageScale}px`;
    // On narrow screens the board is pinned over the page; fields scroll clear of it (see challenge.css).
    roots.current?.style.setProperty('--board-h', `${frame.parentElement?.offsetHeight ?? 0}px`);
    if (level.dim) {
      canvas.style.setProperty('--dw', `${level.dim[0]}px`);
      canvas.style.setProperty('--dh', `${level.dim[1]}px`);
    }
    canvas.style.setProperty('--arena', '0');
    const next = evaluate(level, board, texts, conditions, selectors, live.current, linesOn, {
      player: playerStyle.current,
      objective: objectiveStyle.current,
    });
    canvas.style.setProperty('--arena', next.arena.toFixed(3));
    const key = signature(next);
    if (key !== seen.current) {
      seen.current = key;
      setView(next);
      if (level.examen) setPlans(readBlueprint(level, board, live.current, objectiveStyle.current));
    }
    if (next.victory) setSparks(burst(level, activeView(level, live.current)));
    return () => {
      if (!live.current.shown) live.current.celebrated = false;
    };
  }, [level, texts, conditions, selectors, linesOn, active, tick, running]);

  useEffect(() => {
    if (!view?.victory) return;
    live.current.shown = true;
    onVictory(view.victory);
  }, [view, onVictory]);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const observer = new ResizeObserver(() => setTick((value) => value + 1));
    observer.observe(frame);
    const onResize = () => setTick((value) => value + 1);
    window.addEventListener('resize', onResize);
    window.visualViewport?.addEventListener('resize', onResize);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', onResize);
      window.visualViewport?.removeEventListener('resize', onResize);
    };
  }, []);

  const chrome = lessonChrome(level, !!view?.solved, hit, live.current.delivery?.tone === 'bien');
  const rows = editorRows(level);

  // The clock of a timed level starts with the first keystroke, in whichever field it lands.
  const startClock = () => {
    if (live.current.clock.estado === 'espera' && level.tiempo) {
      live.current.clock = beginClock(live.current.clock);
      setRunning(true);
    }
  };

  const edit = (indexOfRule: number, value: string) => {
    startClock();
    setTexts((current) => current.map((text, index) => (index === indexOfRule ? value : text)));
  };

  const insertRune = (prop: string) => {
    const areas = [...(roots.current?.querySelectorAll<HTMLTextAreaElement>('textarea') ?? [])];
    let area = lastArea.current && areas.includes(lastArea.current) ? lastArea.current : areas[0];
    if (!area) return;
    const media = areas.filter((item) => item.dataset.m !== undefined);
    if (media.length && CONDITION_TOKENS.has(prop)) {
      const target = area.dataset.m !== undefined ? area : media[0];
      if (!target) return;
      const snippet = runeSnippet(prop, true);
      write(target, snippet.text, snippet.rewind);
      return;
    }
    if (area.dataset.m !== undefined || area.dataset.s !== undefined) area = areas.find((item) => item.dataset.b !== undefined) ?? area;
    const start = area.selectionStart ?? area.value.length;
    const line = area.value.lastIndexOf('\n', start - 1) + 1;
    const prefix = area.value.slice(line, start).trim() ? '\n' : '';
    const snippet = runeSnippet(prop, false);
    write(area, `${prefix}${snippet.text}`, snippet.rewind);
  };

  const write = (area: HTMLTextAreaElement, text: string, rewind: number) => {
    area.focus();
    const start = area.selectionStart ?? area.value.length;
    const end = area.selectionEnd ?? start;
    const next = area.value.slice(0, start) + text + area.value.slice(end);
    const cursor = start + text.length - rewind;
    // insertText goes through the browser's own editing, so it lands in the undo history and
    // fires the same input event as typing. The manual path is for browsers that dropped it.
    if (document.execCommand?.('insertText', false, text) && area.value === next) {
      area.setSelectionRange(cursor, cursor);
      return;
    }
    if (area.dataset.m !== undefined) setConditions((current) => current.map((value, index) => (index === Number(area.dataset.m) ? next : value)));
    else if (area.dataset.s !== undefined) setSelectors((current) => current.map((value, index) => (index === Number(area.dataset.s) ? next : value)));
    else setTexts((current) => current.map((value, index) => (index === Number(area.dataset.b) ? next : value)));
    requestAnimationFrame(() => area.setSelectionRange(cursor, cursor));
  };

  const submit = () => {
    const canvas = canvasRef.current;
    const floor = floorRef.current;
    const sand = sandRef.current;
    const player = playerRef.current;
    const target = targetRef.current;
    const outline = outlineRef.current;
    const probe = probeRef.current;
    const probeTarget = probeTargetRef.current;
    if (!canvas || !floor || !sand || !player || !target || !outline || !probe || !probeTarget) return;
    const board = { player, target, outline, probe, probeTarget, canvas, floor, sand };
    const blow = deliverExam(level, board, live.current);
    if (blow) {
      setHit(blow === 'hero' ? 'golpe-heroe' : 'golpe-jefe');
      window.setTimeout(() => setHit(''), 900);
    }
    setTick((value) => value + 1);
  };

  const toggleState = () => {
    const next = !active;
    setActive(next);
    live.current.boardActive = next;
    sound.clic();
    const player = playerRef.current;
    const target = targetRef.current;
    const outline = outlineRef.current;
    if (player && target && outline) {
      setBoardState([player, target, outline], next);
      chimeIfNeeded(level, player, next);
    }
  };

  return (
    <ChallengeView
      chrome={chrome}
      level={level}
      view={view}
      plans={plans}
      sparks={sparks}
      linesOn={linesOn}
      active={active}
      hintOpen={hintOpen}
      hintStep={hintStep}
      onNextHint={() => setHintStep((step) => Math.min(step + 1, level.pistasPrevias?.length ?? 0))}
      texts={texts}
      conditions={conditions}
      selectors={selectors}
      rows={rows}
      viewIndex={live.current.vista}
      peeking={peeking}
      rootsRef={roots}
      objectiveStyleRef={objectiveStyle}
      playerStyleRef={playerStyle}
      frameRef={frameRef}
      stageRef={stageRef}
      canvasRef={canvasRef}
      floorRef={floorRef}
      sandRef={sandRef}
      probeRef={probeRef}
      probeTargetRef={probeTargetRef}
      targetRef={targetRef}
      playerRef={playerRef}
      outlineRef={outlineRef}
      onNavigate={navigate}
      onLines={(on) => { progress.lineas = on; saveProgress(); setLinesOn(on); }}
      onViewChange={(index) => { live.current.vista = index; sound.clic(); setTick((value) => value + 1); }}
      onPeek={(on) => { sound.clic(); setPeeking(on); }}
      onToggleState={toggleState}
      onSubmit={submit}
      onToggleHint={() => { setHintOpen((open) => !open); if (!hintOpen) { live.current.usedHelp = true; sound.clic(); } }}
      onReset={() => { sound.clic(); const reset = solutionTexts(level, 'ini'); setTexts(reset.texts); setConditions(reset.conditions); setSelectors(reset.selectors); setHintOpen(false); setHintStep(0); live.current.celebrated = false; live.current.previousMatches = []; }}
      onShowSolution={() => { live.current.usedHelp = true; const solved = solutionTexts(level, 'sol'); setTexts(solved.texts); setConditions(solved.conditions); setSelectors(solved.selectors); }}
      onInsertRune={insertRune}
      onEditRule={edit}
      onEditCondition={(index, value) => { startClock(); setConditions((current) => current.map((item, itemIndex) => (itemIndex === index ? value : item))); }}
      onEditSelector={(index, value) => {
        startClock();
        setSelectors((current) => current.map((item, itemIndex) => (itemIndex === index ? value : item)));
      }}
      onFocusArea={(area) => { lastArea.current = area; }}
      onTab={(area) => write(area, '  ', 0)}
      onShake={() => { if (!level.tiempo) return; live.current.clock = restartClock(live.current.clock, level.tiempo); setRunning(true); setTick((value) => value + 1); }}
    />
  );
}

function burst(level: Level, view: BoardView): { x: number; y: number; delay: number; scale: number }[] {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return [];
  const maxW = Math.max(...level.anchos);
  const x0 = canvasGutter + (maxW - view.w) / 2;
  return Array.from({ length: 22 }, () => ({
    x: x0 + Math.random() * view.w,
    y: canvasGutter + Math.random() * view.h,
    delay: Math.random() * 0.5,
    scale: 0.6 + Math.random(),
  }));
}
