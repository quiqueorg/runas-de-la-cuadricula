/**
 * The chart's clickable layers, back to front: secret places, inhabitants, the veil over undiscovered
 * regions, and the markers (lesson stops, regions, "you are here" and click ripples).
 */
import type { RefObject } from 'react';
import { Rune } from '../../../shared/icons/Rune';
import { cssVars } from '../cssVars';
import type { CreatureSpot, MapScene, RegionMarker, SecretSpot, Waypoint } from '../scene';
import type { MapHit, Ripple } from '../state';

type OnHit = (hit: MapHit) => void;

function SecretButton({ secret, onHit }: { readonly secret: SecretSpot; readonly onHit: OnHit }) {
  return (
    <button
      type="button"
      className={secret.className}
      style={cssVars({
        '--x': secret.x,
        '--y': secret.y,
        '--w': secret.width,
        '--ar': secret.aspectRatio,
      })}
      aria-label={secret.label}
      onClick={() => onHit({ kind: 'secret', id: secret.id })}
    >
      <i className="twinkle" aria-hidden="true" />
      {secret.name ? <span className="secret-name">{secret.name}</span> : null}
    </button>
  );
}

export function SecretLayer({
  secrets,
  onHit,
}: {
  readonly secrets: readonly SecretSpot[];
  readonly onHit: OnHit;
}) {
  return (
    <div className="secret-layer">
      {secrets.map((secret) => (
        <SecretButton key={secret.id} secret={secret} onHit={onHit} />
      ))}
    </div>
  );
}

export function InhabitantLayer({
  creatures,
  speaker,
  speakerRef,
  onHit,
}: {
  readonly creatures: readonly CreatureSpot[];
  /** Who is telling a joke, if anyone: their button anchors the bubble. */
  readonly speaker: string | undefined;
  readonly speakerRef: RefObject<HTMLButtonElement | null>;
  readonly onHit: OnHit;
}) {
  return (
    <div className="fish-layer">
      {creatures.map((creature) => {
        const speaking = speaker === creature.key;
        return (
          <button
            key={creature.key}
            ref={speaking ? speakerRef : undefined}
            type="button"
            className={creature.className}
            data-speaking={speaking || undefined}
            style={{
              ...cssVars({ '--x': creature.x, '--y': creature.y, '--d': creature.delay }),
              color: creature.color,
            }}
            aria-label={creature.label}
            onClick={() => onHit({ kind: 'inhabitant', key: creature.key })}
          >
            {creature.rune ? <Rune id={creature.rune} painted /> : null}
          </button>
        );
      })}
    </div>
  );
}

/** Cloud or sea mist over the regions not yet discovered. */
export function VeilLayer({ veils }: { readonly veils: MapScene['veils'] }) {
  return (
    <div className="cloud-veil" aria-hidden="true">
      {veils.map((veil) => (
        <i key={veil.key} className={veil.className} style={veil.vars} />
      ))}
    </div>
  );
}

function WaypointButton({ stop, onHit }: { readonly stop: Waypoint; readonly onHit: OnHit }) {
  return (
    <button
      type="button"
      className={stop.className}
      style={cssVars({ '--x': stop.x, '--y': stop.y })}
      aria-label={stop.label}
      onClick={() => onHit({ kind: 'stop', id: stop.id })}
    >
      <Rune id={stop.icon} />
    </button>
  );
}

function RegionButton({ marker, onHit }: { readonly marker: RegionMarker; readonly onHit: OnHit }) {
  return (
    <button
      type="button"
      className={marker.className}
      style={cssVars({ '--x': marker.x, '--y': marker.y })}
      aria-label={marker.label}
      onClick={() => onHit({ kind: 'region', region: marker.id })}
    >
      <span className="marker-ring" style={cssVars({ '--p': marker.progress })}>
        <span className="marker-number">
          {marker.icon ? <Rune id={marker.icon} /> : marker.number}
        </span>
      </span>
      <span className="marker-name">{marker.name}</span>
    </button>
  );
}

function ExplorerButton({
  explorer,
  onHit,
}: {
  readonly explorer: NonNullable<MapScene['explorer']>;
  readonly onHit: OnHit;
}) {
  return (
    <button
      type="button"
      className="explorer"
      style={cssVars({ '--x': explorer.x, '--y': explorer.y })}
      aria-label={explorer.label}
      onClick={() => onHit({ kind: 'stop', id: explorer.id })}
    >
      <Rune id="i-bandera" />
    </button>
  );
}

export function MarkerLayer({
  waypoints,
  markers,
  explorer,
  ripples,
  onHit,
}: {
  readonly waypoints: readonly Waypoint[];
  readonly markers: readonly RegionMarker[];
  readonly explorer: MapScene['explorer'];
  readonly ripples: readonly Ripple[];
  readonly onHit: OnHit;
}) {
  return (
    <div className="marker-layer">
      {waypoints.map((stop) => (
        <WaypointButton key={stop.id} stop={stop} onHit={onHit} />
      ))}
      {markers.map((marker) => (
        <RegionButton key={marker.id} marker={marker} onHit={onHit} />
      ))}
      {explorer ? <ExplorerButton explorer={explorer} onHit={onHit} /> : null}
      {ripples.map((ripple) => (
        <i key={ripple.id} className="onda" style={{ left: ripple.x, top: ripple.y }} />
      ))}
    </div>
  );
}

export function Compass({
  spinning,
  onHit,
  onSpinDone,
}: {
  readonly spinning: boolean;
  readonly onHit: OnHit;
  readonly onSpinDone: () => void;
}) {
  return (
    <button
      className={`compass ${spinning ? 'spin' : ''}`}
      type="button"
      aria-label="Rosa de los vientos"
      onClick={() => onHit({ kind: 'compass' })}
      onAnimationEnd={onSpinDone}
    >
      <Rune id="rosa" />
    </button>
  );
}
