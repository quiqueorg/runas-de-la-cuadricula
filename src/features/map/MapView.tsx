/** Map markup. Clicks are reported; the model decides what they do. */
import type { RefObject } from 'react';
import { MusicButton } from '../../shared/audio/MusicButton';
import { Rune } from '../../shared/icons/Rune';
import type { MapHit } from './actions';
import { Effects, cloudLayer } from './Effects';
import type { MapScene } from './model';
import { Trail } from './Trail';

function Stars({ score }: { readonly score: number }) {
  return <span className="stars" aria-hidden="true">{[1, 2, 3].map((star) => <Rune key={star} id="i-estrella" className={score >= star ? 'on' : ''} />)}</span>;
}

export function MapView({ scene, onHit, onGround, onHome, onToggleIndex, onCloseIndex, onQuery, onStatus, onTag, onClearFilters, onSpinDone, onCloseCard, onOpen, scrollRef }: {
  readonly scene: MapScene;
  readonly onHit: (hit: MapHit) => void;
  readonly onGround: (x: number, y: number, width: number, height: number, left: number, top: number) => void;
  readonly onHome: () => void;
  readonly onToggleIndex: () => void;
  readonly onCloseIndex: () => void;
  readonly onQuery: (value: string) => void;
  readonly onStatus: (value: MapScene['filters']['status']) => void;
  readonly onTag: (tag: string) => void;
  readonly onClearFilters: () => void;
  readonly onSpinDone: () => void;
  readonly onCloseCard: () => void;
  readonly onOpen: (id: string) => void;
  readonly scrollRef: RefObject<HTMLDivElement | null>;
}) {
  const world = scene.world;
  return (
    <section id="view-map" className={scene.worldClass}>
      <header className="top-bar">
        <button className="button icon-text" type="button" onClick={onHome}><Rune id="i-atras" /><span>Inicio</span></button>
        <div className="top-bar-title"><span className="region-kicker">{scene.subtitle}</span><h2>{scene.title}</h2></div>
        <div className="bar-nav">
          <MusicButton />
          <button className="button icon-text" type="button" aria-expanded={scene.indexOpen} aria-controls="exercise-index" onClick={onToggleIndex}><Rune id="i-lista" /><span>Índice</span></button>
        </div>
      </header>
      <div className="map-stage" id="map-stage">
        <div className="map-scroll" id="map-scroll" ref={scrollRef}>
          <div className="map-sheet">
            <div className="world" id="world-map" onClick={(event) => {
              const target = event.target;
              if (!(target instanceof Element)) return;
              const inhabitant = target.closest<HTMLElement>('.inhabitant');
              if (inhabitant?.dataset.key) { onHit({ kind: 'inhabitant', key: inhabitant.dataset.key }); return; }
              const secret = target.closest<HTMLElement>('.secreto');
              if (secret?.dataset.id) { onHit({ kind: 'secret', id: secret.dataset.id }); return; }
              const stop = target.closest<HTMLElement>('.waypoint, .explorer');
              if (stop?.dataset.id) { onHit({ kind: 'stop', id: stop.dataset.id }); return; }
              const marker = target.closest<HTMLElement>('.region-marker');
              if (marker?.dataset.region) { onHit({ kind: 'region', region: Number(marker.dataset.region) }); return; }
              if (target.closest('.compass')) { onHit({ kind: 'compass' }); return; }
              const map = event.currentTarget.getBoundingClientRect();
              onGround(event.clientX, event.clientY, map.width, map.height, map.left, map.top);
            }}>
              <Trail world={world} spans={scene.spans} />
              <div className="effects" aria-hidden="true"><Effects world={world} /></div>
              <div className="secret-layer">
                {scene.secrets.map((secret) => (
                  <button key={secret.id} type="button" className={secret.className} data-id={secret.id} style={{ ['--x' as string]: secret.x, ['--y' as string]: secret.y, ['--w' as string]: secret.w, ['--ar' as string]: secret.ar }} aria-label={secret.label}>
                    <i className="twinkle" aria-hidden="true" />
                    {secret.name ? <span className="secret-name">{secret.name}</span> : null}
                  </button>
                ))}
              </div>
              <div className="fish-layer">
                {scene.creatures.map((creature) => (
                  <button key={creature.key} type="button" className={creature.className} data-key={creature.key} style={{ ['--x' as string]: creature.x, ['--y' as string]: creature.y, ['--d' as string]: creature.delay, color: creature.color }} aria-label={creature.label}>
                    {creature.rune ? <Rune id={creature.rune} /> : null}
                  </button>
                ))}
              </div>
              <div className="cloud-veil" aria-hidden="true">
                {scene.veils.map((veil) => <i key={veil.key} className={veil.className} style={veil.vars} />)}
              </div>
              <div className="cloud-layer" aria-hidden="true">{cloudLayer(world)}</div>
              <div className="marker-layer">
                {scene.waypoints.map((stop) => (
                  <button key={stop.id} type="button" className={stop.className} style={{ ['--x' as string]: stop.x, ['--y' as string]: stop.y }} data-id={stop.id} aria-label={stop.label}>
                    <Rune id={stop.icon} />
                  </button>
                ))}
                {scene.markers.map((marker) => (
                  <button key={marker.id} type="button" className={marker.className} style={{ ['--x' as string]: marker.x, ['--y' as string]: marker.y }} data-region={marker.id} aria-label={marker.label}>
                    <span className="marker-ring" style={{ ['--p' as string]: marker.progress }}>
                      <span className="marker-number">{marker.icon ? <Rune id={marker.icon} /> : marker.number}</span>
                    </span>
                    <span className="marker-name">{marker.name}</span>
                  </button>
                ))}
                {scene.explorer ? (
                  <button type="button" className="explorer" style={{ ['--x' as string]: scene.explorer.x, ['--y' as string]: scene.explorer.y }} data-id={scene.explorer.id} aria-label={scene.explorer.label}>
                    <Rune id="i-bandera" />
                  </button>
                ) : null}
                {scene.ripples.map((ripple) => <i key={ripple.id} className="onda" style={{ left: ripple.x, top: ripple.y }} />)}
              </div>
              <button className={`compass ${scene.spin ? 'spin' : ''}`} type="button" aria-label="Rosa de los vientos" onAnimationEnd={onSpinDone}><Rune id="rosa" /></button>
              {scene.joke ? <div className={`chiste ${scene.jokeClass}`} role="status" style={{ ['--x' as string]: scene.joke.x, ['--y' as string]: scene.joke.y, ['--tx' as string]: scene.jokeShift }}><b>{scene.joke.name}</b>{scene.joke.text}</div> : null}
            </div>
          </div>
        </div>
        {scene.next ? <button className="button primary next-fab" type="button" onClick={() => onOpen(scene.next?.id ?? '')}><Rune id="i-brujula" /><span>{scene.next.label}</span></button> : null}
        {scene.card ? <RegionCard card={scene.card} onClose={onCloseCard} onOpen={onOpen} /> : null}
        {scene.indexOpen ? (
          <aside className="panel index-panel" id="exercise-index" aria-label="Índice de ejercicios">
            <div className="index-header"><h3>Índice de ejercicios</h3><button className="button icon-only" type="button" aria-label="Cerrar el índice" onClick={onCloseIndex}><Rune id="i-cerrar" /></button></div>
            <div className="filter-bar">
              <label className="search-field"><Rune id="i-lupa" /><input type="search" value={scene.filters.query} placeholder="Buscar ejercicio o propiedad…" autoComplete="off" spellCheck={false} onChange={(event) => onQuery(event.target.value)} /></label>
              <div className="segmented" role="group" aria-label="Estado">
                {([['todas', 'Todos'], ['pendientes', 'Pendientes'], ['hechas', 'Superados']] as const).map(([value, label]) => <button key={value} type="button" aria-pressed={scene.filters.status === value} onClick={() => onStatus(value)}>{label}</button>)}
              </div>
              <details className="rune-filter">
                <summary><span>Filtrar por runa</span><small className="filter-hint">propiedades y conceptos</small><span className="filter-count">{scene.filters.active ? `${scene.filters.active} activa${scene.filters.active > 1 ? 's' : ''}` : ''}</span></summary>
                <div>
                  {scene.filters.groups.map((group) => (
                    <div key={group.title} className="filter-group"><h4>{group.title}</h4><div>{group.chips.map((chip) => <button key={chip.tag} type="button" className="chip" aria-pressed={chip.pressed} onClick={() => onTag(chip.tag)}>{chip.tag} <small>{chip.count}</small></button>)}</div></div>
                  ))}
                </div>
                <button type="button" className="text-link" hidden={!scene.filters.dirty} onClick={onClearFilters}>Quitar filtros</button>
              </details>
            </div>
            <div id="exercise-list">
              {scene.groups.map((group) => (
                <section key={group.id} className={group.className}>
                  <h3><span className="group-number">{group.emblem ? <Rune id="emblema" /> : group.number}</span><span className="group-title"><span>{group.title}</span><small>{group.detail}</small></span></h3>
                  <div className="exercise-cards">
                    {group.cards.map((card) => card.hidden ? (
                      <div key={card.id} className="exercise-card undiscovered"><span className="card-number">{card.label}</span><span><span className="card-title">{card.title}</span><span className="card-hint">{card.hint}</span></span></div>
                    ) : (
                      <button key={card.id} type="button" className={card.className} onClick={() => onOpen(card.id)}>
                        <span className="card-number">{card.label}</span>
                        <span>
                          <span className="card-title">{card.title}</span>
                          {card.badge ? <span className="badge">{card.badge}</span> : null}
                          <span className="card-tags">{card.tags.map((tag) => <code key={tag.text} className={tag.concept ? 'c' : ''}>{tag.text}</code>)}</span>
                        </span>
                        <span className={`card-status ${card.exam ? 'with-stars' : ''}`}>{card.exam ? <Stars score={card.score ?? 0} /> : card.done ? <Rune id={card.gem ? 'i-gema' : 'i-hecho'} /> : null}</span>
                      </button>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </aside>
        ) : null}
      </div>
    </section>
  );
}

function RegionCard({ card, onClose, onOpen }: { readonly card: MapScene['card'] & object; readonly onClose: () => void; readonly onOpen: (id: string) => void }) {
  if (!card.known) {
    return (
      <div className="panel region-card" role="dialog" aria-labelledby="region-card-title">
        <div className="ficha-cab"><div><h3 id="region-card-title">{card.title}</h3></div><button type="button" className="button icon-only" aria-label="Cerrar" onClick={onClose}><Rune id="i-cerrar" /></button></div>
        <p className="f-txt">{card.blocked}</p>
      </div>
    );
  }
  return (
    <div className="panel region-card" role="dialog" aria-labelledby="region-card-title">
      <div className="ficha-cab">
        <Rune id={card.portrait} className="portrait" />
        <div>
          <p className="f-sub">{card.kicker}</p>
          <h3 id="region-card-title">{card.title}</h3>
          <p className="f-pj">{card.speaker}</p>
        </div>
        <button type="button" className="button icon-only" aria-label="Cerrar" onClick={onClose}><Rune id="i-cerrar" /></button>
      </div>
      <div className="f-barra" aria-hidden="true"><i style={{ width: `${card.bar.toFixed(0)}%` }} /></div>
      <p className="f-prog">{card.progress}</p>
      <ol className="f-lista">
        {card.rows.map((row) => (
          <li key={row.id}>
            <button type="button" className={row.className} onClick={() => onOpen(row.id)}>
              <span className="card-number">{row.label}</span>
              <span className="entry-name">{row.name}{row.extra ? <> <small>{row.extra}</small></> : null}</span>
              {row.exam ? <Stars score={row.score ?? 0} /> : row.done ? <Rune id={row.gem ? 'i-gema' : 'i-hecho'} /> : null}
            </button>
          </li>
        ))}
      </ol>
      {card.next ? <button type="button" className="button primary" onClick={() => onOpen(card.next?.id ?? '')}>{card.next.label}</button> : null}
    </div>
  );
}
