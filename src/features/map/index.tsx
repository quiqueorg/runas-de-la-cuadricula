/** Map screen: reduce clicks, then draw the scene. */
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { navigate } from '../../core/navigation';
import { session } from '../../core/session';
import { progress, saveProgress } from '../../core/state';
import { useGame } from '../../core/useGame';
import { music, sound } from '../../shared/audio/audio';
import { registerSymbols } from '../../shared/icons/registry';
import { isleSymbols } from '../../shared/icons/isleSymbols';
import { SYMBOLS } from '../../shared/icons/symbols';
import { BASE_OFFSET } from '../../core/catalog';
import { initialMapUi, type MapAction, type MapHit, type SecretNotice } from './actions';
import { MapView } from './MapView';
import { armSpin, greetKeys, mapScene, mapTheme, reduceMap, regionsToMark, ripplePercent } from './model';

registerSymbols(SYMBOLS);
registerSymbols(isleSymbols(BASE_OFFSET));

export type { SecretNotice };

export function MapViewScreen({ onSecret }: { readonly onSecret: (secret: SecretNotice) => void }) {
  useGame();
  const world = session.world;
  const [ui, setUi] = useState(initialMapUi);
  const scrollRef = useRef<HTMLDivElement>(null);
  const greeted = useRef(false);
  const rippleSeq = useRef(0);
  const uiRef = useRef(ui);
  uiRef.current = ui;

  const apply = (action: MapAction) => {
    const step = reduceMap(uiRef.current, action, world);
    uiRef.current = step.ui;
    setUi(step.ui);
    const effect = step.effect;
    if (action.type === 'hit' && action.hit.kind === 'compass') {
      requestAnimationFrame(() => {
        const next = armSpin(uiRef.current);
        uiRef.current = next;
        setUi(next);
      });
    }
    if (effect.type === 'sound') sound[effect.name]();
    else if (effect.type === 'talk') sound.charla(effect.animal);
    else if (effect.type === 'navigate') { sound.clic(); navigate(effect.hash); }
    else if (effect.type === 'secret') { saveProgress(true); sound.secreto(); onSecret(effect.notice); }
    else if (effect.type === 'schedule-ripple') {
      sound.gota();
      const id = effect.id;
      window.setTimeout(() => {
        const next = reduceMap(uiRef.current, { type: 'drop-ripple', id }, world).ui;
        uiRef.current = next;
        setUi(next);
      }, 1200);
    }
  };

  useEffect(() => {
    music.escala(mapTheme(world));
    const fresh = regionsToMark(world);
    if (fresh.ids.length) {
      fresh.ids.forEach((id) => { progress.vistas[id] = true; });
      saveProgress();
      if (fresh.fanfare) sound.descubrir();
    }
  }, [world]);

  useLayoutEffect(() => {
    const scroller = scrollRef.current;
    const explorer = scroller?.querySelector('.explorer');
    if (!scroller || !(explorer instanceof HTMLElement)) return;
    const mark = explorer.getBoundingClientRect();
    const frame = scroller.getBoundingClientRect();
    scroller.scrollLeft += mark.left - frame.left - frame.width / 2;
    scroller.scrollTop += mark.top - frame.top - frame.height / 2;
  }, [world, progress.actual]);

  useEffect(() => {
    if (greeted.current) return;
    const timer = window.setTimeout(() => {
      greeted.current = true;
      const keys = greetKeys(world);
      const key = keys[Math.floor(Math.random() * keys.length)];
      if (key && !uiRef.current.joke) apply({ type: 'greet', key });
    }, 4500);
    return () => window.clearTimeout(timer);
  }, [world]);

  const scene = mapScene(world, ui);
  const onHit = (hit: MapHit) => apply({ type: 'hit', hit, rippleId: 0 });
  return (
    <MapView
      scene={scene}
      scrollRef={scrollRef}
      onHit={onHit}
      onGround={(x, y, width, height, left, top) => {
        const id = rippleSeq.current++;
        const point = ripplePercent(x, y, left, top, width, height);
        apply({ type: 'hit', hit: { kind: 'ground', x: point.x, y: point.y }, rippleId: id });
      }}
      onHome={() => navigate('inicio')}
      onToggleIndex={() => apply({ type: 'toggle-index' })}
      onCloseIndex={() => apply({ type: 'close-index' })}
      onQuery={(value) => apply({ type: 'query', value })}
      onStatus={(value) => apply({ type: 'status', value })}
      onTag={(tag) => apply({ type: 'toggle-tag', tag })}
      onClearFilters={() => apply({ type: 'clear-filters' })}
      onSpinDone={() => apply({ type: 'spin-done' })}
      onCloseCard={() => apply({ type: 'close-card' })}
      onOpen={(id) => { sound.clic(); navigate(`prueba-${id}`); }}
    />
  );
}
