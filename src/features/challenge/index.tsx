/**
 * A lesson. The board is measured by `useBoard`; this component turns what it reports into
 * feedback (sounds, the exam's verdict, the victory) and wires the panels together.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { levelKind, levelLabel, REGION_OFFSET, regionOf, WORLD_BY_ID } from '../../core/catalog';
import type { BoardView, Level } from '../../core/models';
import {
  changeSettings,
  completeLesson,
  getProgress,
  openLesson,
  recordFailedAttempt,
  useProgress,
} from '../../core/progress/store';
import { music, sound } from '../../shared/audio/audio';
import { isleSymbols } from '../../shared/icons/isleSymbols';
import { registerSymbols } from '../../shared/icons/registry';
import { SYMBOLS } from '../../shared/icons/symbols';
import { boardOrigin } from './board/layers';
import { lessonChrome } from './chrome';
import { BoardPanel, type Spark } from './components/BoardPanel';
import { TabletPanel } from './components/TabletPanel';
import { TheoryPanel } from './components/TheoryPanel';
import { TopBar } from './components/TopBar';
import type { StatusLine } from './evaluate';
import { failedDelivery, passedDelivery } from './exam';
import { playChimes, playMatched, playVictory } from './feedback';
import { useBoard } from './hooks/useBoard';
import { useClock } from './hooks/useClock';
import { useRuneInsertion } from './hooks/useRuneInsertion';
import { type TabletField, useTablet } from './hooks/useTablet';
import { editorRows } from './tablet';
import { type VictoryModel, victoryOf } from './victory';

registerSymbols(SYMBOLS);
registerSymbols(isleSymbols(REGION_OFFSET.isle));

export type { VictoryModel };

const SPARK_COUNT = 22;
const BLOW_MS = 900;
const FLASH_MS = 1700;

type Blow = '' | 'golpe-heroe' | 'golpe-jefe';

function burst(level: Level, view: BoardView): Spark[] {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return [];
  const { x, y } = boardOrigin(level, view);
  return Array.from({ length: SPARK_COUNT }, () => ({
    x: x + Math.random() * view.width,
    y: y + Math.random() * view.height,
    delay: Math.random() * 0.5,
    scale: 0.6 + Math.random(),
  }));
}

/** The music for the lesson's place. Secrets have their own, by world. */
function sceneOf(level: Level): string {
  if (level.secret) {
    if (level.world === 'flex') return 'secretosub';
    if (level.world === 'isle') return 'secretoisla';
    return level.world === 'grid' ? 'secreto' : 'secretocielo';
  }
  return level.world === 'finale' ? 'final' : level.terrain || regionOf(level).terrain;
}

/** Saves where the player is, starts the lesson's music and names the tab. */
function useLessonOpened(level: Level): void {
  useEffect(() => {
    openLesson(level);
    music.setScene(sceneOf(level));
    const world = WORLD_BY_ID[level.world].name;
    document.title = `${levelKind(level)} ${levelLabel(level.id)} ${level.title} · ${world}`;
  }, [level]);
}

/** A value that plays once: set on the next frame, then back to `empty` after `ms`. */
function useTransient<T>(empty: T, ms: number): readonly [T, (value: T) => void] {
  const [value, setValue] = useState(empty);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const play = (next: T) => {
    clearTimeout(timer.current);
    setValue(empty);
    // A frame at rest first, so the same animation can play twice in a row.
    requestAnimationFrame(() => setValue(next));
    timer.current = setTimeout(() => setValue(empty), ms);
  };
  return [value, play];
}

const NOTHING_FLASHING: ReadonlySet<number> = new Set();

export interface ChallengeProps {
  readonly level: Level;
  readonly onVictory: (model: VictoryModel) => void;
}

export function Challenge({ level, onVictory }: ChallengeProps) {
  const progress = useProgress();
  const { tablet, edit, fill } = useTablet(level);
  const { clock, start, restart, stopWon } = useClock(level.timeLimit);
  const [viewIndex, setViewIndex] = useState(0);
  const [hint, setHint] = useState({ open: false, step: 0 });
  const [peeking, setPeeking] = useState(false);
  const [active, setActive] = useState(false);
  const [delivery, setDelivery] = useState<StatusLine | null>(null);
  const [sparks, setSparks] = useState<readonly Spark[]>([]);
  const [blow, playBlow] = useTransient<Blow>('', BLOW_MS);
  const [flashing, playFlash] = useTransient(NOTHING_FLASHING, FLASH_MS);
  const usedHelp = useRef(false);
  const celebrated = useRef(false);
  const previousMatches = useRef<readonly boolean[]>([]);
  useLessonOpened(level);

  const view = level.views[viewIndex] ?? level.views[0];
  if (!view) throw new Error(`Lesson without views: ${level.id}`);
  const guidesOn = progress.settings.guides;
  const board = useBoard(
    {
      level,
      tablet,
      view,
      guidesOn,
      clock,
      delivery,
      mastered: Boolean(progress.results[level.id]?.mastered),
    },
    active,
  );
  const { evaluation } = board;
  const won = level.exam ? delivery?.tone === 'bien' : Boolean(evaluation?.solved);

  // Pieces that just fell into place make a sound.
  useEffect(() => {
    if (!evaluation) return;
    const previous = previousMatches.current;
    if (previous.length) {
      const newly = level.movable.filter((index) => evaluation.matches[index] && !previous[index]);
      playMatched(level, newly);
    }
    previousMatches.current = evaluation.matches;
  }, [level, evaluation]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: celebrate once, when the lesson is won.
  useEffect(() => {
    if (!won || celebrated.current) return;
    celebrated.current = true;
    stopWon();
    playVictory(level);
    const { result, model } = victoryOf(level, getProgress(), {
      usedHelp: usedHelp.current,
      ranOut: clock.ranOut,
    });
    completeLesson(level.id, result, Boolean(level.exam));
    setSparks(burst(level, view));
    onVictory(model);
  }, [won]);

  // A musical board rings as the state switches on, once its classes are in the DOM.
  useEffect(() => {
    const player = board.refs.player.current;
    if (active && level.musical && player) playChimes(player);
  }, [active, level, board.refs]);

  const editAndStart = (field: TabletField, index: number, value: string) => {
    start();
    edit(field, index, value);
  };
  const runes = useRuneInsertion(board.refs.root, editAndStart);
  const rows = useMemo(() => editorRows(level), [level]);
  const chrome = lessonChrome(level, progress, won);

  const deliver = () => {
    const exam = evaluation?.exam;
    if (!exam) return;
    if (exam.solved) {
      setDelivery(passedDelivery(level));
      if (level.boss) {
        sound.thunder(0.6);
        playBlow('golpe-heroe');
      }
      return;
    }
    const attempt = recordFailedAttempt(level.id);
    sound.error();
    if (level.boss) {
      sound.thunder(1);
      playBlow('golpe-jefe');
    }
    playFlash(new Set(exam.misplaced));
    setDelivery(failedDelivery(level, exam, attempt));
  };

  const reset = () => {
    sound.click();
    fill('initial');
    setHint({ open: false, step: 0 });
    celebrated.current = false;
    previousMatches.current = [];
  };

  const toggleHint = () => {
    if (!hint.open) {
      usedHelp.current = true;
      sound.click();
    }
    setHint({ ...hint, open: !hint.open });
  };

  return (
    <section
      id="view-challenge"
      className={`${chrome.className} ${blow}`.trim()}
      ref={board.refs.root}
    >
      <style ref={board.refs.goalSheet} />
      <style ref={board.refs.playerSheet} />
      <TopBar chrome={chrome} />
      <div className="challenge-layout">
        <BoardPanel
          level={level}
          chrome={chrome}
          evaluation={evaluation}
          refs={board.refs}
          clock={clock}
          viewIndex={viewIndex}
          guidesOn={guidesOn}
          peeking={peeking}
          active={active}
          flashing={flashing}
          sparks={sparks}
          blow={blow}
          onGuides={(on) => changeSettings({ guides: on })}
          onPeek={(on) => {
            sound.click();
            setPeeking(on);
          }}
          onView={(index) => {
            sound.click();
            setViewIndex(index);
          }}
          onToggleState={() => {
            sound.click();
            setActive(!active);
          }}
        />
        <TheoryPanel chrome={chrome} checks={evaluation?.checks ?? []} plans={board.plans} />
        <TabletPanel
          chrome={chrome}
          rows={rows}
          tablet={tablet}
          messages={evaluation?.messages ?? []}
          hint={hint}
          onEdit={editAndStart}
          onFocusField={runes.focus}
          onTab={runes.indent}
          onInsertRune={runes.insertRune}
          onDeliver={deliver}
          onToggleHint={toggleHint}
          onNextHint={() =>
            setHint({ ...hint, step: Math.min(hint.step + 1, chrome.earlyHints.length) })
          }
          onShowSolution={() => {
            usedHelp.current = true;
            fill('solution');
          }}
          onReset={reset}
          onShake={restart}
        />
      </div>
    </section>
  );
}
