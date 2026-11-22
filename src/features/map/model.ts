/** Map facts: who is visible, what a click means, and where a flyer is on its cycle. */
import { CONCEPTS, EXAM_COUNTS, EXERCISE_COUNTS, EXERCISE_KINDS, GROUPS_BY_WORLD, examProgress, exerciseProgress, frontierLevel, isDiscovered, levelKind, levelLabel, levels, levelsById, levelsInRegion, levelsInWorld, regionComplete, regionStats, regions, routes, secretsInWorld, worldMeta } from '../../core/catalog';
import type { Level, WorldId } from '../../core/models';
import { progress } from '../../core/state';
import type { Joke, MapAction, MapEffect, MapUi } from './actions';
import { allRegions, stopPositions, trailSpans, type TrailSpan } from './geometry';
import inhabitants from './inhabitants.json';
import scenery from './scenery.json';

function foldText(value: string): string {
  return value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

const SECRET_BOX: Record<string, readonly [number, number]> = {
  naufragio: [140, 100], serpiente: [170, 90], circulo: [120, 80], volcan: [120, 90], ballena: [140, 80],
  isla: [100, 80], botella: [80, 100], gemelas: [120, 90], fantasma: [140, 100], dragon: [140, 90], taller: [120, 90], gusano: [120, 100], aeronave: [140, 90], reves: [120, 100], fenix: [120, 100],
};

export interface RoutePoint {
  readonly x: number;
  readonly y: number;
  readonly opacity: number;
}

/** Griffin and dragon travel for the first four fifths, then hold the end and fade out. */
export function routeSample(points: readonly (readonly number[])[], elapsed: number, duration: number, mode: 'loop' | 'ping' | 'flight'): RoutePoint {
  const span = Math.max(duration, 0.001);
  let cycle = (elapsed / span) % 1;
  let opacity = 1;
  if (mode === 'ping') cycle = (1 - Math.cos(cycle * 2 * Math.PI)) / 2;
  else if (mode === 'flight') {
    const fade = Math.min(1, cycle / 0.08, (1 - cycle) / 0.14);
    opacity = fade * fade * (3 - 2 * fade);
  }
  if (points.length < 2) return { x: points[0]?.[0] ?? 0, y: points[0]?.[1] ?? 0, opacity };
  // Some traced routes repeat the landing point; don't spend a beat hovering there.
  let last = points.length - 1;
  while (last > 1 && points[last]?.[0] === points[last - 1]?.[0] && points[last]?.[1] === points[last - 1]?.[1]) last--;
  const cursor = cycle * last;
  const index = Math.min(last - 1, Math.floor(cursor));
  const local = cursor - index;
  const from = points[index] ?? [0, 0];
  const to = points[index + 1] ?? from;
  return {
    x: (from[0] ?? 0) + ((to[0] ?? 0) - (from[0] ?? 0)) * local,
    y: (from[1] ?? 0) + ((to[1] ?? 0) - (from[1] ?? 0)) * local,
    opacity,
  };
}

export function ripplePercent(clientX: number, clientY: number, left: number, top: number, width: number, height: number): { x: string; y: string } {
  return {
    x: `${((clientX - left) / width * 100).toFixed(2)}%`,
    y: `${((clientY - top) / height * 100).toFixed(2)}%`,
  };
}

function personOf(key: string) {
  if (!(key in inhabitants)) return null;
  return inhabitants[key as keyof typeof inhabitants];
}

function creatures(world: WorldId): { key: string; x: number; y: number }[] {
  return scenery[world].habitantes.flatMap((item) => {
    const key = item[0];
    const x = item[1];
    const y = item[2];
    if (typeof key === 'string' && typeof x === 'number' && typeof y === 'number') return [{ key, x, y }];
    return [];
  });
}

function jokeFor(key: string, cursors: Readonly<Record<string, number>>): { joke: Joke; cursors: Record<string, number>; effect: MapEffect } | null {
  const person = personOf(key);
  if (!person) return null;
  const lines = person.ch;
  const cursor = ((cursors[key] ?? -1) + 1) % lines.length;
  const joke = { speaker: key, name: person.n, text: lines[cursor] ?? '' };
  const effect: MapEffect = 'cur' in person && person.cur
    ? { type: 'sound', name: 'clic' }
    : 'sp' in person && person.sp
      ? { type: 'talk', animal: 'an' in person ? person.an : '' }
      : { type: 'sound', name: 'glub' };
  return { joke, cursors: { ...cursors, [key]: cursor }, effect };
}

function secretOf(id: string): MapEffect {
  const level = levelsById[id];
  if (!level?.secreto) return { type: 'none' };
  if (progress.secretos[id]) return { type: 'navigate', hash: `prueba-${id}` };
  progress.secretos[id] = true;
  return {
    type: 'secret',
    notice: { id, title: `Lugar secreto: ${level.n}`, text: `${level.pj ?? ''} te espera con un ejercicio que no aparece en ningún camino.`, icon: `dib-${level.secreto.dib}` },
  };
}

export function reduceMap(ui: MapUi, action: MapAction, world: WorldId): { ui: MapUi; effect: MapEffect } {
  if (action.type === 'close-card') return { ui: { ...ui, card: null }, effect: { type: 'none' } };
  if (action.type === 'close-index') return { ui: { ...ui, indexOpen: false }, effect: { type: 'none' } };
  if (action.type === 'toggle-index') return { ui: { ...ui, card: null, indexOpen: !ui.indexOpen }, effect: { type: 'sound', name: 'clic' } };
  if (action.type === 'query') return { ui: { ...ui, query: action.value }, effect: { type: 'none' } };
  if (action.type === 'status') return { ui: { ...ui, status: action.value }, effect: { type: 'none' } };
  if (action.type === 'clear-filters') return { ui: { ...ui, tags: new Set(), query: '', status: 'todas' }, effect: { type: 'none' } };
  if (action.type === 'spin-done') return { ui: { ...ui, spin: false }, effect: { type: 'none' } };
  if (action.type === 'drop-ripple') return { ui: { ...ui, ripples: ui.ripples.filter((item) => item.id !== action.id) }, effect: { type: 'none' } };
  if (action.type === 'toggle-tag') {
    const tags = new Set(ui.tags);
    if (tags.has(action.tag)) tags.delete(action.tag);
    else tags.add(action.tag);
    return { ui: { ...ui, tags }, effect: { type: 'sound', name: 'clic' } };
  }
  if (action.type === 'greet') {
    const told = jokeFor(action.key, ui.cursors);
    if (!told) return { ui, effect: { type: 'none' } };
    return { ui: { ...ui, joke: told.joke, cursors: told.cursors }, effect: { type: 'none' } };
  }
  const hit = action.hit;
  if (hit.kind === 'inhabitant') {
    const told = jokeFor(hit.key, ui.cursors);
    if (!told) return { ui, effect: { type: 'none' } };
    return { ui: { ...ui, joke: told.joke, cursors: told.cursors }, effect: told.effect };
  }
  if (hit.kind === 'secret') return { ui, effect: secretOf(hit.id) };
  if (hit.kind === 'stop') return { ui, effect: { type: 'navigate', hash: `prueba-${hit.id}` } };
  if (hit.kind === 'region') return { ui: { ...ui, indexOpen: false, card: hit.region }, effect: { type: 'sound', name: 'clic' } };
  if (hit.kind === 'compass') return { ui: { ...ui, spin: false }, effect: { type: 'sound', name: 'clic' } };
  return {
    ui: { ...ui, joke: null, card: null, ripples: [...ui.ripples, { id: action.rippleId, x: hit.x, y: hit.y }] },
    effect: { type: 'schedule-ripple', id: action.rippleId },
  };
}

export function armSpin(ui: MapUi): MapUi {
  return { ...ui, spin: true };
}

export function mapTheme(world: WorldId): string {
  const frontier = frontierLevel() ?? routes[world][0];
  return frontier ? regions[frontier.r]?.t || 'inicio' : 'inicio';
}

export function regionsToMark(world: WorldId): { readonly ids: readonly number[]; readonly fanfare: boolean } {
  const fresh = allRegions.filter((region) => region.mundo === world && isDiscovered(region.ri) && !progress.vistas[region.ri]);
  return { ids: fresh.map((region) => region.ri), fanfare: fresh.some((region) => region.ri > 0) };
}

export function greetKeys(world: WorldId): readonly string[] {
  return creatures(world).filter((creature) => {
    const person = personOf(creature.key);
    return person && !('cur' in person && person.cur);
  }).map((creature) => creature.key);
}

export interface MapScene {
  readonly world: WorldId;
  readonly worldClass: string;
  readonly title: string;
  readonly subtitle: string;
  readonly indexOpen: boolean;
  readonly spin: boolean;
  readonly joke: Joke | null;
  readonly ripples: MapUi['ripples'];
  readonly spans: readonly TrailSpan[];
  readonly secrets: readonly { id: string; className: string; x: number; y: number; w: number; ar: string; label: string; name: string | null }[];
  readonly creatures: readonly { key: string; className: string; x: number; y: number; delay: string; color: string | undefined; label: string; rune: string | null }[];
  readonly veils: readonly { key: string; className: string; vars: Record<string, string | number> }[];
  readonly waypoints: readonly { id: string; className: string; x: string; y: string; label: string; icon: string }[];
  readonly markers: readonly { id: number; className: string; x: number; y: number; label: string; progress: string; number: string; icon: string | null; name: string }[];
  readonly explorer: { id: string; x: string; y: string; label: string } | null;
  readonly next: { id: string; label: string } | null;
  readonly card: RegionCard | null;
  readonly filters: { query: string; status: MapUi['status']; active: number; groups: readonly { title: string; chips: readonly { tag: string; count: number; pressed: boolean }[] }[]; dirty: boolean };
  readonly groups: readonly IndexGroup[];
}

export interface RegionCard {
  readonly known: boolean;
  readonly title: string;
  readonly kicker: string;
  readonly speaker: string;
  readonly portrait: string;
  readonly bar: number;
  readonly progress: string;
  readonly blocked: string;
  readonly rows: readonly { id: string; className: string; label: string; name: string; extra: string; score: number | null; gem: boolean; done: boolean; exam: boolean }[];
  readonly next: { id: string; label: string; review: boolean } | null;
}

export interface IndexGroup {
  readonly id: number;
  readonly className: string;
  readonly emblem: boolean;
  readonly secret: boolean;
  readonly number: string;
  readonly title: string;
  readonly detail: string;
  readonly cards: readonly IndexCard[];
}

export interface IndexCard {
  readonly id: string;
  readonly hidden: boolean;
  readonly hint: string;
  readonly label: string;
  readonly title: string;
  readonly badge: string;
  readonly tags: readonly { text: string; concept: boolean }[];
  readonly className: string;
  readonly exam: boolean;
  readonly score: number | null;
  readonly gem: boolean;
  readonly done: boolean;
}

export function mapScene(world: WorldId, ui: MapUi): MapScene {
  const frontier = frontierLevel();
  const current = progress.actual ? levelsById[progress.actual] : undefined;
  const visible = (level: Level) => !!progress.hechos[level.id] || level === frontier || (level === current && isDiscovered(level.r)) || !!(level.examen && isDiscovered(level.r));
  const cleared = (level: Level) => !!progress.hechos[level.id];
  const onMap = allRegions.filter((region) => region.mundo === world);
  const hidden = onMap.find((region) => !isDiscovered(region.ri));
  const destination = current && stopPositions[current.id] && visible(current) && !progress.hechos[current.id] ? current : frontier;
  const secrets = secretsInWorld(world);
  const found = secrets.filter((level) => progress.secretos[level.id]).length;
  const matches = (level: Level) => {
    const done = progress.hechos[level.id];
    if (ui.status === 'pendientes' && done) return false;
    if (ui.status === 'hechas' && !done) return false;
    if (ui.tags.size && !level.tags.some((tag) => ui.tags.has(tag))) return false;
    if (ui.query) {
      const haystack = foldText(`${level.id} ${levelLabel(level.id)} ${level.n} ${level.tags.join(' ')} ${level.ok.join(' ')} ${regions[level.r]?.n ?? ''}`);
      if (!foldText(ui.query).split(/\s+/).filter(Boolean).every((word) => haystack.includes(word))) return false;
    }
    return true;
  };
  const counts: Record<string, number> = {};
  levelsInWorld(world).forEach((level) => level.tags.forEach((tag) => { counts[tag] = (counts[tag] ?? 0) + 1; }));
  const joke = ui.joke;
  return {
    world,
    worldClass: `view ${world === 'flex' ? 'is-underground' : ''} ${world === 'cielo' ? 'is-sky' : ''} ${world === 'final' ? 'is-final' : ''} ${world === 'base' ? 'is-isle' : ''}`,
    title: worldMeta[world].mapa,
    subtitle: world === 'final'
      ? `Combate final · fase ${Math.min(examProgress() + 1, EXAM_COUNTS.final)} de ${EXAM_COUNTS.final}${examProgress() === EXAM_COUNTS.final ? ' · ¡derrotado!' : ''}`
      : `${exerciseProgress()} de ${EXERCISE_COUNTS[world]} ejercicios · ${world === 'cielo' ? 'combate final' : 'prueba'} ${examProgress()} de ${EXAM_COUNTS[world]}${secrets.length ? ` · secretos ${found} de ${secrets.length}` : ''}`,
    indexOpen: ui.indexOpen,
    spin: ui.spin,
    joke,
    ripples: ui.ripples,
    spans: onMap.filter((region) => isDiscovered(region.ri)).flatMap((region) => trailSpans(region, visible, cleared, regionComplete(region.ri))),
    secrets: secrets.flatMap((level) => {
      const place = level.secreto;
      if (!place) return [];
      const box = SECRET_BOX[place.dib] ?? [120, 80];
      const known = !!progress.secretos[level.id];
      return [{
        id: level.id,
        className: `secreto s-${place.dib} ${known ? 'found' : ''} ${progress.hechos[level.id] ? 'resuelto' : ''}`,
        x: place.x, y: place.y, w: place.w, ar: `${box[0]}/${box[1]}`,
        label: known ? level.n : 'Algo llama la atención en el mapa',
        name: known ? level.n : null,
      }];
    }),
    creatures: creatures(world).flatMap((creature, index) => {
      const person = personOf(creature.key);
      if (!person) return [];
      const curious = 'cur' in person && person.cur;
      const sprite = 'sp' in person ? person.sp : '';
      return [{
        key: creature.key,
        className: `inhabitant ${curious ? `curio h-${creature.key}` : sprite ? `bicho a-${'an' in person ? person.an : ''} h-${creature.key}` : `pez h-${creature.key}`}`,
        x: creature.x,
        y: creature.y,
        delay: `${(-index * 1.7).toFixed(1)}s`,
        color: 'c1' in person ? person.c1 : undefined,
        label: curious ? `${person.n}: mirar de cerca` : `${person.n}: cuéntame un chiste`,
        rune: sprite ? `i-${sprite}` : curious ? null : 'pez-hab',
      }];
    }),
    veils: world === 'cielo' ? onMap.flatMap((region, index) => {
      const veil = scenery.cielo.velos[index] ?? [];
      if (!veil.length || isDiscovered(region.ri)) return [];
      return veil.map((cloud, cloudIndex) => ({
        key: `${region.ri}-${cloudIndex}`,
        className: `v${cloud[3] ?? 1} ${region === hidden ? 'faint' : ''}`,
        vars: { '--x': cloud[0] ?? 0, '--y': cloud[1] ?? 0, '--s': cloud[2] ?? 1, '--dx': cloud[4] ?? 0, '--dy': cloud[5] ?? 0, '--k': cloudIndex, '--d': `${(-cloudIndex * 1.3 - index * 0.7).toFixed(1)}s` },
      }));
    }) : [],
    waypoints: levels.flatMap((level) => {
      const point = stopPositions[level.id];
      if (level.mundo !== world || !point || !visible(level)) return [];
      const record = progress.hechos[level.id];
      return [{
        id: level.id,
        className: ['waypoint', record ? 'cleared' : '', record?.m ? 'mastered' : '', level === frontier ? 'frontier' : '', level.examen ? 'exam' : ''].filter(Boolean).join(' '),
        x: point.x.toFixed(4),
        y: point.y.toFixed(4),
        label: `${levelKind(level)} ${levelLabel(level.id)}, ${level.n}${record ? ', superado' : ''}`,
        icon: `i-${level.hito}`,
      }];
    }),
    markers: onMap.flatMap((region) => {
      const known = isDiscovered(region.ri);
      if (!known && region !== hidden) return [];
      const stats = regionStats(region.ri);
      const state = !known ? 'undiscovered' : stats.hechos === stats.total ? 'complete' : stats.hechos ? 'en-curso' : '';
      return [{
        id: region.ri,
        className: `region-marker ${state} ${current?.r === region.ri ? 'current' : ''} ${region.examen ? 'exam' : ''} ${region.jefe ? 'boss' : ''}`,
        x: region.x ?? 0,
        y: region.y ?? 0,
        label: known ? `${region.n}${region.examen ? ' (prueba de aprendizaje)' : ''}: ${stats.hechos} de ${stats.total}` : 'Región sin descubrir',
        progress: (stats.hechos / stats.total).toFixed(3),
        number: known ? (region.jefe || region.examen ? '' : String(region.num)) : '?',
        icon: known ? (region.jefe ? `i-${region.icono || 'tormenta'}` : region.examen ? 'emblema' : null) : null,
        name: known ? region.n : 'Sin descubrir',
      }];
    }),
    explorer: destination && stopPositions[destination.id]
      ? { id: destination.id, x: stopPositions[destination.id]?.x.toFixed(4) ?? '0', y: stopPositions[destination.id]?.y.toFixed(4) ?? '0', label: `Estás aquí: ${levelKind(destination)} ${levelLabel(destination.id)}, ${destination.n}` }
      : null,
    next: frontier ? { id: frontier.id, label: `${frontier.jefe ? 'Combate' : frontier.examen ? 'Prueba' : 'Siguiente'}: ${levelLabel(frontier.id)} ${frontier.n}` } : null,
    card: ui.card === null ? null : regionCard(ui.card),
    filters: {
      query: ui.query,
      status: ui.status,
      active: ui.tags.size,
      dirty: ui.tags.size > 0 || ui.query.length > 0 || ui.status !== 'todas',
      groups: GROUPS_BY_WORLD[world].flatMap(([group, list]) => {
        const chips = list.filter((tag) => counts[tag]).map((tag) => ({ tag, count: counts[tag] ?? 0, pressed: ui.tags.has(tag) }));
        return chips.length ? [{ title: group, chips }] : [];
      }),
    },
    groups: regions.flatMap((region, regionIndex) => {
      if (region.mundo !== world) return [];
      const rows = levels.filter((level) => level.r === regionIndex && matches(level));
      if (!rows.length) return [];
      const stats = regionStats(regionIndex);
      return [{
        id: regionIndex,
        className: `level-group ${region.examen ? 'exam' : ''} ${region.secreto ? 'secretos' : ''}`,
        emblem: !!region.examen,
        secret: !!region.secreto,
        number: region.secreto ? '?' : String(region.num),
        title: region.n,
        detail: `${region.sub} · ${stats.hechos} de ${stats.total}`,
        cards: rows.map((level): IndexCard => {
          const record = progress.hechos[level.id];
          if (region.secreto && !progress.secretos[level.id]) {
            return { id: level.id, hidden: true, hint: level.secreto?.pista ?? '', label: '?·?', title: 'Lugar sin descubrir', badge: '', tags: [], className: '', exam: false, score: null, gem: false, done: false };
          }
          return {
            id: level.id,
            hidden: false,
            hint: '',
            label: levelLabel(level.id),
            title: level.n,
            badge: level.esp ?? '',
            tags: level.tags.filter((tag) => !EXERCISE_KINDS.has(tag)).map((tag) => ({ text: tag, concept: CONCEPTS.has(tag) })),
            className: `exercise-card ${record ? 'cleared' : ''} ${record?.m ? 'mastered' : ''} ${level.examen ? 'exam' : ''} ${progress.actual === level.id ? 'es-actual' : ''}`,
            exam: !!level.examen,
            score: record?.nota ?? (record ? 1 : 0),
            gem: !!record?.m,
            done: !!record,
          };
        }),
      }];
    }),
  };
}

function regionCard(regionIndex: number): RegionCard | null {
  const region = regions[regionIndex];
  if (!region) return null;
  const known = isDiscovered(regionIndex);
  if (!known) {
    return {
      known: false, title: 'Región sin descubrir', kicker: '', speaker: '', portrait: '', bar: 0, progress: '',
      blocked: `El camino hasta aquí se abrirá cuando completes ${regions[regionIndex - 1]?.n ?? 'la región anterior'}. Si tienes prisa, el índice te lleva a cualquier ejercicio.`,
      rows: [], next: null,
    };
  }
  const rows = levelsInRegion(regionIndex);
  const stats = regionStats(regionIndex);
  const next = rows.find((level) => !progress.hechos[level.id]) ?? rows[0];
  return {
    known: true,
    title: region.n,
    kicker: region.jefe ? 'Combate final' : region.examen ? 'Prueba de aprendizaje' : `Región ${region.num} · ${region.sub}`,
    speaker: `${region.pj}, ${region.rol}`,
    portrait: `pj-${regionIndex}`,
    bar: (stats.hechos / stats.total) * 100,
    progress: `${stats.hechos} de ${stats.total} ${region.jefe ? 'fases superadas' : region.examen ? 'pruebas superadas' : 'ejercicios superados'}`,
    blocked: '',
    rows: rows.map((level) => {
      const record = progress.hechos[level.id];
      return {
        id: level.id,
        className: `${record ? 'cleared' : ''} ${level === next && !record ? 'up-next' : ''}`,
        label: levelLabel(level.id),
        name: level.n,
        extra: level.esp ?? '',
        score: record?.nota ?? (record ? 1 : 0),
        gem: !!record?.m,
        done: !!record,
        exam: !!level.examen,
      };
    }),
    next: next ? { id: next.id, label: `${progress.hechos[next.id] ? 'Repasar' : 'Continuar aquí'} · ${levelLabel(next.id)}`, review: !!progress.hechos[next.id] } : null,
  };
}
