/** A world's map: the chart, its inhabitants, the region cards and the lesson index. */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { REGION_OFFSET, regions, routes } from '../../core/catalog';
import type { WorldId } from '../../core/models';
import { goHome, goToLesson } from '../../core/navigation';
import { currentWorld, frontierLevel, isDiscovered } from '../../core/progress/queries';
import { findSecret, getProgress, markRegionSeen, useProgress } from '../../core/progress/store';
import { music, sound } from '../../shared/audio/audio';
import { isleSymbols } from '../../shared/icons/isleSymbols';
import { registerSymbols } from '../../shared/icons/registry';
import { SYMBOLS } from '../../shared/icons/symbols';
import { allRegions } from './geometry';
import { greeters } from './inhabitants';
import { MapView } from './MapView';
import { mapScene } from './scene';
import {
  chartPercent,
  initialMapUi,
  type MapAction,
  type MapEffect,
  type MapUi,
  reduceMap,
  type SecretNotice,
} from './state';

registerSymbols(SYMBOLS);
registerSymbols(isleSymbols(REGION_OFFSET.isle));

export type { SecretNotice };

const RIPPLE_MS = 1200;
/** A character greets the player if nobody has been clicked by then. */
const GREETING_MS = 4500;

/** The music of the region the player is heading to. */
function mapScore(world: WorldId): string {
  const frontier = frontierLevel(getProgress(), world) ?? routes[world][0];
  return (frontier && regions[frontier.region]?.terrain) || 'inicio';
}

/** Marks newly discovered regions as seen, with a fanfare for any beyond the first. */
function useDiscoveries(world: WorldId): void {
  useEffect(() => {
    const progress = getProgress();
    const fresh = allRegions.filter(
      (region) =>
        region.world === world &&
        isDiscovered(progress, region.index) &&
        !progress.seenRegions[region.index],
    );
    for (const region of fresh) markRegionSeen(region.index);
    if (fresh.some((region) => region.index > 0)) sound.discover();
  }, [world]);
}

/** Keeps the "you are here" mark in the middle of the scrolling chart. */
function useCenterOnExplorer(scroller: React.RefObject<HTMLDivElement | null>, key: unknown): void {
  // biome-ignore lint/correctness/useExhaustiveDependencies: `key` says when to re-centre.
  useLayoutEffect(() => {
    const frame = scroller.current;
    const explorer = frame?.querySelector('.explorer');
    if (!frame || !(explorer instanceof HTMLElement)) return;
    const mark = explorer.getBoundingClientRect();
    const box = frame.getBoundingClientRect();
    frame.scrollLeft += mark.left - box.left - box.width / 2;
    frame.scrollTop += mark.top - box.top - box.height / 2;
  }, [scroller, key]);
}

/**
 * The map's state with synchronous reads: effects that dispatch later (a ripple fading, the compass
 * spinning on the next frame) must reduce the latest state, not the one of their render.
 */
function useMapUi(): [MapUi, (action: MapAction) => MapEffect] {
  const [ui, setUi] = useState(initialMapUi);
  const latest = useRef(ui);
  const dispatch = useCallback((action: MapAction) => {
    const step = reduceMap(latest.current, action, getProgress());
    latest.current = step.ui;
    setUi(step.ui);
    return step.effect;
  }, []);
  return [ui, dispatch];
}

export interface MapScreenProps {
  readonly onSecret: (secret: SecretNotice) => void;
}

export function MapScreen({ onSecret }: MapScreenProps) {
  const progress = useProgress();
  const world = currentWorld(progress);
  const [ui, dispatch] = useMapUi();
  const scrollRef = useRef<HTMLDivElement>(null);
  const nextRipple = useRef(0);

  const openLesson = (id: string) => {
    sound.click();
    goToLesson(id);
  };

  const run = (effect: MapEffect) => {
    switch (effect.type) {
      case 'sound':
        sound[effect.name]();
        break;
      case 'talk':
        sound.chatter(effect.voice);
        break;
      case 'open-lesson':
        openLesson(effect.id);
        break;
      case 'secret':
        findSecret(effect.notice.id);
        sound.secret();
        onSecret(effect.notice);
        break;
      case 'ripple':
        sound.drop();
        window.setTimeout(() => dispatch({ type: 'drop-ripple', id: effect.id }), RIPPLE_MS);
        break;
      case 'spin-compass':
        sound.click();
        requestAnimationFrame(() => dispatch({ type: 'spin', on: true }));
        break;
      case 'none':
        break;
    }
  };
  const act = (action: MapAction) => run(dispatch(action));

  useEffect(() => {
    music.setScene(mapScore(world));
  }, [world]);
  useDiscoveries(world);
  useCenterOnExplorer(scrollRef, `${world}:${progress.currentLessonId}`);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const keys = greeters(world);
      const key = keys[Math.floor(Math.random() * keys.length)];
      if (key) dispatch({ type: 'greet', key });
    }, GREETING_MS);
    return () => window.clearTimeout(timer);
  }, [world, dispatch]);

  return (
    <MapView
      scene={mapScene(world, ui, progress)}
      scrollRef={scrollRef}
      onHit={(hit) => act({ type: 'hit', hit })}
      onGround={(clientX, clientY, chart) => {
        const { x, y } = chartPercent(clientX, clientY, chart);
        act({ type: 'hit', hit: { kind: 'ground', x, y, rippleId: nextRipple.current++ } });
      }}
      onHome={goHome}
      onToggleIndex={() => act({ type: 'toggle-index' })}
      onCloseIndex={() => act({ type: 'close-index' })}
      onQuery={(value) => act({ type: 'query', value })}
      onStatus={(value) => act({ type: 'status', value })}
      onTag={(tag) => act({ type: 'toggle-tag', tag })}
      onClearFilters={() => act({ type: 'clear-filters' })}
      onSpinDone={() => act({ type: 'spin', on: false })}
      onCloseCard={() => act({ type: 'close-card' })}
      onOpen={openLesson}
    />
  );
}
