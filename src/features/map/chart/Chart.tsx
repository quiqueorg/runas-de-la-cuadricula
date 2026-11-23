/** The scrolling chart: the landscape, the trail, the effects and every layer the player can click. */
import { type MouseEvent, type RefObject, useRef } from 'react';
import { Effects, PassingClouds } from '../effects';
import { Landscape } from '../landscape';
import type { MapScene } from '../scene';
import type { MapHit } from '../state';
import { JokeBubble } from './JokeBubble';
import { Compass, InhabitantLayer, MarkerLayer, SecretLayer, VeilLayer } from './layers';
import { Trail } from './Trail';

export interface ChartProps {
  readonly scene: MapScene;
  readonly scrollRef: RefObject<HTMLDivElement | null>;
  readonly onHit: (hit: MapHit) => void;
  /** A click on empty ground, with the chart's box. */
  readonly onGround: (clientX: number, clientY: number, chart: DOMRect) => void;
  readonly onSpinDone: () => void;
}

export function Chart({ scene, scrollRef, onHit, onGround, onSpinDone }: ChartProps) {
  const speakerRef = useRef<HTMLButtonElement>(null);
  const clickGround = (event: MouseEvent<HTMLDivElement>) => {
    // Everything on the chart that does something is a button with its own handler.
    if (!(event.target instanceof Element) || event.target.closest('button')) return;
    onGround(event.clientX, event.clientY, event.currentTarget.getBoundingClientRect());
  };
  return (
    <div className="map-scroll" id="map-scroll" ref={scrollRef}>
      <div className="map-sheet">
        {/* biome-ignore lint/a11y/noStaticElementInteractions lint/a11y/useKeyWithClickEvents: a click on empty ground only drops a ripple, a pointer flourish with nothing to reach by keyboard. */}
        <div className="world" id="world-map" onClick={clickGround}>
          <Landscape world={scene.world} />
          <Trail world={scene.world} spans={scene.spans} />
          <div className="effects" aria-hidden="true">
            <Effects world={scene.world} />
          </div>
          <SecretLayer secrets={scene.secrets} onHit={onHit} />
          <InhabitantLayer
            creatures={scene.creatures}
            speaker={scene.joke?.speaker}
            speakerRef={speakerRef}
            onHit={onHit}
          />
          <VeilLayer veils={scene.veils} />
          <div className="cloud-layer" aria-hidden="true">
            <PassingClouds world={scene.world} />
          </div>
          <MarkerLayer
            waypoints={scene.waypoints}
            markers={scene.markers}
            explorer={scene.explorer}
            ripples={scene.ripples}
            onHit={onHit}
          />
          <Compass spinning={scene.spin} onHit={onHit} onSpinDone={onSpinDone} />
          {scene.joke ? (
            <JokeBubble joke={scene.joke} speakerRef={speakerRef} scrollRef={scrollRef} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
