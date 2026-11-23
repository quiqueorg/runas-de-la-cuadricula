/** What the chart shows for a world and a progress. Pure: the view only draws it. */
import {
  EXAM_COUNTS,
  EXERCISE_COUNTS,
  levelKind,
  levelLabel,
  levels,
  levelsById,
  levelsInRegion,
  secretsInWorld,
  WORLD_BY_ID,
} from '../../core/catalog';
import type { Level, Region, WorldId } from '../../core/models';
import {
  examsDone,
  exercisesDone,
  frontierLevel,
  isDiscovered,
  isDone,
  regionComplete,
  regionStats,
} from '../../core/progress/queries';
import type { Progress } from '../../core/progress/types';
import { allRegions, stopPositions, type TrailSpan, trailSpans } from './geometry';
import { inhabitantOf, inhabitantsOf, type Joke } from './inhabitants';
import { type IndexFilters, type IndexGroup, lessonIndex } from './lessonIndex';
import { type RegionCard, regionCard } from './regionCard';
import scenery from './scenery.json';
import type { MapUi, Ripple } from './state';

/** Width and height of each secret's drawing, for its aspect ratio. */
const SECRET_BOX: Record<string, readonly [number, number]> = {
  naufragio: [140, 100],
  serpiente: [170, 90],
  circulo: [120, 80],
  volcan: [120, 90],
  ballena: [140, 80],
  isla: [100, 80],
  botella: [80, 100],
  gemelas: [120, 90],
  fantasma: [140, 100],
  dragon: [140, 90],
  taller: [120, 90],
  gusano: [120, 100],
  aeronave: [140, 90],
  reves: [120, 100],
  fenix: [120, 100],
  cueva: [130, 90],
  pozo: [100, 90],
  cartografo: [110, 100],
  faroviejo: [100, 100],
  sumergida: [140, 100],
  pecio: [140, 90],
};
const DEFAULT_SECRET_BOX = [120, 80] as const;

const WORLD_CLASS: Record<WorldId, string> = {
  isle: 'is-isle',
  grid: '',
  flex: 'is-underground',
  sky: 'is-sky',
  finale: 'is-final',
};

export interface SecretSpot {
  readonly id: string;
  readonly className: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly aspectRatio: string;
  readonly label: string;
  readonly name: string | null;
}

export interface CreatureSpot {
  readonly key: string;
  readonly className: string;
  readonly x: number;
  readonly y: number;
  readonly delay: string;
  readonly color: string | undefined;
  readonly label: string;
  readonly rune: string | null;
}

export interface Veil {
  readonly key: string;
  readonly className: string;
  readonly vars: Readonly<Record<string, string | number>>;
}

export interface Waypoint {
  readonly id: string;
  readonly className: string;
  readonly x: string;
  readonly y: string;
  readonly label: string;
  readonly icon: string;
}

export interface RegionMarker {
  readonly id: number;
  readonly className: string;
  readonly x: number;
  readonly y: number;
  readonly label: string;
  readonly progress: string;
  readonly number: string;
  readonly icon: string | null;
  readonly name: string;
}

export interface MapScene {
  readonly world: WorldId;
  readonly worldClass: string;
  readonly title: string;
  readonly subtitle: string;
  readonly indexOpen: boolean;
  readonly spin: boolean;
  readonly joke: Joke | null;
  readonly ripples: readonly Ripple[];
  readonly spans: readonly TrailSpan[];
  readonly secrets: readonly SecretSpot[];
  readonly creatures: readonly CreatureSpot[];
  readonly veils: readonly Veil[];
  readonly waypoints: readonly Waypoint[];
  readonly markers: readonly RegionMarker[];
  /** The "you are here" mark. */
  readonly explorer: {
    readonly id: string;
    readonly x: string;
    readonly y: string;
    readonly label: string;
  } | null;
  readonly next: { readonly id: string; readonly label: string } | null;
  readonly card: RegionCard | null;
  readonly filters: IndexFilters;
  readonly groups: readonly IndexGroup[];
}

/** Which stops the trail shows: a stop appears once it is reachable, not before. */
interface Visibility {
  readonly frontier: Level | undefined;
  readonly current: Level | undefined;
  readonly isVisible: (level: Level) => boolean;
}

function visibilityOf(world: WorldId, progress: Progress): Visibility {
  const frontier = frontierLevel(progress, world);
  const current = progress.currentLessonId ? levelsById[progress.currentLessonId] : undefined;
  // Where the trail branches, every open region shows its next stop, not only the suggested one.
  const heads = new Set(
    allRegions
      .filter((region) => region.world === world && isDiscovered(progress, region.index))
      .flatMap((region) => {
        const next = levelsInRegion(region.index).find((level) => !isDone(progress, level.id));
        return next ? [next] : [];
      }),
  );
  const isVisible = (level: Level) =>
    isDone(progress, level.id) ||
    level === frontier ||
    heads.has(level) ||
    ((level === current || Boolean(level.exam)) && isDiscovered(progress, level.region));
  return { frontier, current, isVisible };
}

function subtitleOf(world: WorldId, progress: Progress): string {
  const exams = examsDone(progress, world);
  if (world === 'finale') {
    const total = EXAM_COUNTS.finale;
    return `Combate final · fase ${Math.min(exams + 1, total)} de ${total}${exams === total ? ' · ¡derrotado!' : ''}`;
  }
  const secrets = secretsInWorld(world);
  const found = secrets.filter((level) => progress.foundSecrets[level.id]).length;
  const ending = world === 'sky' ? 'combate final' : 'prueba';
  return [
    `${exercisesDone(progress, world)} de ${EXERCISE_COUNTS[world]} ejercicios`,
    `${ending} ${exams} de ${EXAM_COUNTS[world]}`,
    ...(secrets.length ? [`secretos ${found} de ${secrets.length}`] : []),
  ].join(' · ');
}

/** Near the chart's edge a secret's name opens inwards, so the frame does not cut it. */
function edgeClasses(place: { readonly x: number; readonly y: number }): string[] {
  const horizontal = place.x < 0.12 ? 'edge-l' : place.x > 0.88 ? 'edge-r' : '';
  return [horizontal, place.y > 0.9 ? 'edge-b' : ''];
}

function secretSpots(world: WorldId, progress: Progress): SecretSpot[] {
  return secretsInWorld(world).flatMap((level) => {
    const place = level.secret;
    if (!place) return [];
    const [boxWidth, boxHeight] = SECRET_BOX[place.drawing] ?? DEFAULT_SECRET_BOX;
    const known = Boolean(progress.foundSecrets[level.id]);
    return [
      {
        id: level.id,
        className: [
          'secreto',
          `s-${place.drawing}`,
          known && 'found',
          isDone(progress, level.id) && 'resuelto',
          ...edgeClasses(place),
        ]
          .filter(Boolean)
          .join(' '),
        x: place.x,
        y: place.y,
        width: place.width,
        aspectRatio: `${boxWidth}/${boxHeight}`,
        label: known ? level.title : 'Algo llama la atención en el mapa',
        name: known ? level.title : null,
      },
    ];
  });
}

function creatureSpots(world: WorldId): CreatureSpot[] {
  return inhabitantsOf(world).flatMap(({ key, x, y }, index) => {
    const inhabitant = inhabitantOf(key);
    if (!inhabitant) return [];
    const { curio, sprite } = inhabitant;
    let kind = `pez h-${key}`;
    if (curio) kind = `curio h-${key}`;
    else if (sprite) kind = `bicho a-${inhabitant.voice ?? ''} h-${key}`;
    let rune: string | null = 'pez-hab';
    if (sprite) rune = `i-${sprite}`;
    else if (curio) rune = null;
    return [
      {
        key,
        className: `inhabitant ${kind}`,
        x,
        y,
        delay: `${(-index * 1.7).toFixed(1)}s`,
        color: inhabitant.color,
        label: curio
          ? `${inhabitant.name}: mirar de cerca`
          : `${inhabitant.name}: cuéntame un chiste`,
        rune,
      },
    ];
  });
}

/** Undiscovered places hide under cloud in the sky and under sea mist on the isle. */
function veilsOf(
  world: WorldId,
  onMap: readonly Region[],
  hidden: Region | undefined,
  progress: Progress,
): Veil[] {
  if (world !== 'sky' && world !== 'isle') return [];
  return onMap.flatMap((region, index) => {
    const veil = scenery[world].veils[index] ?? [];
    if (!veil.length || isDiscovered(progress, region.index)) return [];
    return veil.map(([x = 0, y = 0, size = 1, variant = 1, dx = 0, dy = 0], cloudIndex) => ({
      key: `${region.index}-${cloudIndex}`,
      className: `v${variant} ${region === hidden ? 'faint' : ''}`,
      vars: {
        '--x': x,
        '--y': y,
        '--s': size,
        '--dx': dx,
        '--dy': dy,
        '--k': cloudIndex,
        '--d': `${(-cloudIndex * 1.3 - index * 0.7).toFixed(1)}s`,
      },
    }));
  });
}

function waypointsOf(world: WorldId, progress: Progress, visibility: Visibility): Waypoint[] {
  return levels.flatMap((level) => {
    const point = stopPositions[level.id];
    if (level.world !== world || !point || !visibility.isVisible(level)) return [];
    const result = progress.results[level.id];
    return [
      {
        id: level.id,
        className: [
          'waypoint',
          result && 'cleared',
          result?.mastered && 'mastered',
          level === visibility.frontier && 'frontier',
          level.exam && 'exam',
        ]
          .filter(Boolean)
          .join(' '),
        x: point.x.toFixed(4),
        y: point.y.toFixed(4),
        label: `${levelKind(level)} ${levelLabel(level.id)}, ${level.title}${result ? ', superado' : ''}`,
        icon: `i-${level.landmark}`,
      },
    ];
  });
}

function markerIcon(region: Region): string | null {
  if (region.boss) return `i-${region.icon || 'tormenta'}`;
  return region.exam ? 'emblema' : null;
}

function markerClass(region: Region, state: string, current: Level | undefined): string {
  return [
    'region-marker',
    state,
    current?.region === region.index && 'current',
    region.exam && 'exam',
    region.boss && 'boss',
  ]
    .filter(Boolean)
    .join(' ');
}

/** The next region not yet open shows as a question mark. */
function undiscoveredMarker(
  region: Region,
  progress: Progress,
  current: Level | undefined,
): RegionMarker {
  const stats = regionStats(progress, region.index);
  return {
    id: region.index,
    className: markerClass(region, 'undiscovered', current),
    x: region.x ?? 0,
    y: region.y ?? 0,
    label: 'Región sin descubrir',
    progress: (stats.done / stats.total).toFixed(3),
    number: '?',
    icon: null,
    name: 'Sin descubrir',
  };
}

function discoveredMarker(
  region: Region,
  progress: Progress,
  current: Level | undefined,
): RegionMarker {
  const { done, total } = regionStats(progress, region.index);
  let state = '';
  if (done === total) state = 'complete';
  else if (done) state = 'en-curso';
  const exam = region.exam ? ' (prueba de aprendizaje)' : '';
  return {
    id: region.index,
    className: markerClass(region, state, current),
    x: region.x ?? 0,
    y: region.y ?? 0,
    label: `${region.name}${exam}: ${done} de ${total}`,
    progress: (done / total).toFixed(3),
    // Exams and bosses show an emblem instead of a number.
    number: region.boss || region.exam ? '' : String(region.number),
    icon: markerIcon(region),
    name: region.name,
  };
}

function markersOf(
  onMap: readonly Region[],
  hidden: Region | undefined,
  progress: Progress,
  current: Level | undefined,
): RegionMarker[] {
  return onMap.flatMap((region) => {
    if (isDiscovered(progress, region.index)) return [discoveredMarker(region, progress, current)];
    return region === hidden ? [undiscoveredMarker(region, progress, current)] : [];
  });
}

function explorerOf(visibility: Visibility, progress: Progress): MapScene['explorer'] {
  const { current, frontier } = visibility;
  // The mark stays on the last lesson opened while it is still pending; otherwise it shows the frontier.
  const resumable =
    current &&
    stopPositions[current.id] &&
    visibility.isVisible(current) &&
    !isDone(progress, current.id);
  const destination = resumable ? current : frontier;
  const point = destination ? stopPositions[destination.id] : undefined;
  if (!destination || !point) return null;
  return {
    id: destination.id,
    x: point.x.toFixed(4),
    y: point.y.toFixed(4),
    label: `Estás aquí: ${levelKind(destination)} ${levelLabel(destination.id)}, ${destination.title}`,
  };
}

function nextOf(frontier: Level | undefined): MapScene['next'] {
  if (!frontier) return null;
  const kind = frontier.boss ? 'Combate' : frontier.exam ? 'Prueba' : 'Siguiente';
  return { id: frontier.id, label: `${kind}: ${levelLabel(frontier.id)} ${frontier.title}` };
}

export function mapScene(world: WorldId, ui: MapUi, progress: Progress): MapScene {
  const visibility = visibilityOf(world, progress);
  const onMap = allRegions.filter((region) => region.world === world);
  const hidden = onMap.find((region) => !isDiscovered(progress, region.index));
  const cleared = (level: Level) => isDone(progress, level.id);
  const index = lessonIndex(world, ui, progress);
  return {
    world,
    worldClass: `view ${WORLD_CLASS[world]}`.trim(),
    title: WORLD_BY_ID[world].mapTitle,
    subtitle: subtitleOf(world, progress),
    indexOpen: ui.indexOpen,
    spin: ui.spin,
    joke: ui.joke,
    ripples: ui.ripples,
    spans: onMap
      .filter((region) => isDiscovered(progress, region.index))
      .flatMap((region) =>
        trailSpans(region, visibility.isVisible, cleared, regionComplete(progress, region.index)),
      ),
    secrets: secretSpots(world, progress),
    creatures: creatureSpots(world),
    veils: veilsOf(world, onMap, hidden, progress),
    waypoints: waypointsOf(world, progress, visibility),
    markers: markersOf(onMap, hidden, progress, visibility.current),
    explorer: explorerOf(visibility, progress),
    next: nextOf(visibility.frontier),
    card: ui.card === null ? null : regionCard(ui.card, progress),
    filters: index.filters,
    groups: index.groups,
  };
}
