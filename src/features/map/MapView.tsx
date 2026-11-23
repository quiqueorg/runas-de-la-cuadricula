/** The map screen's markup. Clicks are reported; `state.ts` decides what they mean. */
import type { RefObject } from 'react';
import { Rune } from '../../shared/icons/Rune';
import { Chart } from './chart/Chart';
import type { IndexFilterHandlers } from './components/IndexFilterBar';
import { LessonIndexPanel } from './components/LessonIndexPanel';
import { MapTopBar } from './components/MapTopBar';
import { RegionCardPanel } from './components/RegionCardPanel';
import type { MapScene } from './scene';
import type { MapHit } from './state';

export interface MapViewProps extends IndexFilterHandlers {
  readonly scene: MapScene;
  readonly scrollRef: RefObject<HTMLDivElement | null>;
  readonly onHit: (hit: MapHit) => void;
  /** A click on empty ground, with the chart's box. */
  readonly onGround: (clientX: number, clientY: number, chart: DOMRect) => void;
  readonly onHome: () => void;
  readonly onToggleIndex: () => void;
  readonly onCloseIndex: () => void;
  readonly onSpinDone: () => void;
  readonly onCloseCard: () => void;
  readonly onOpen: (id: string) => void;
}

function NextLessonButton({
  next,
  onOpen,
}: {
  readonly next: NonNullable<MapScene['next']>;
  readonly onOpen: (id: string) => void;
}) {
  return (
    <button className="button primary next-fab" type="button" onClick={() => onOpen(next.id)}>
      <Rune id="i-brujula" />
      <span>{next.label}</span>
    </button>
  );
}

export function MapView({
  scene,
  scrollRef,
  onHit,
  onGround,
  onHome,
  onToggleIndex,
  onCloseIndex,
  onSpinDone,
  onCloseCard,
  onOpen,
  ...filterHandlers
}: MapViewProps) {
  return (
    <section id="view-map" className={scene.worldClass}>
      <MapTopBar
        title={scene.title}
        subtitle={scene.subtitle}
        indexOpen={scene.indexOpen}
        onHome={onHome}
        onToggleIndex={onToggleIndex}
      />
      <div className="map-stage" id="map-stage">
        <Chart
          scene={scene}
          scrollRef={scrollRef}
          onHit={onHit}
          onGround={onGround}
          onSpinDone={onSpinDone}
        />
        {scene.next ? <NextLessonButton next={scene.next} onOpen={onOpen} /> : null}
        {scene.card ? (
          <RegionCardPanel card={scene.card} onClose={onCloseCard} onOpen={onOpen} />
        ) : null}
        {scene.indexOpen ? (
          <LessonIndexPanel
            filters={scene.filters}
            groups={scene.groups}
            onClose={onCloseIndex}
            onOpen={onOpen}
            {...filterHandlers}
          />
        ) : null}
      </div>
    </section>
  );
}
