/**
 * The music's scenes: how each place colours the song of its world. Scene names are content keys
 * (region terrains and a few special places), so they stay as the content spells them.
 */

/** One of the scores, or the recorded loop of the title screen. */
export type Song = 'menu' | 'surface' | 'underground' | 'sky' | 'isle';

/** Every field is optional; a scene with none plays its song plainly. */
export interface Scene {
  /** Multiplies the length of an eighth note, so above 1 is slower. Applied at the next bar. */
  readonly stretch?: number;
  /** Shifts the tune: semitones, or kalimba keys underground (7 keys make an octave). */
  readonly transpose?: number;
  /**
   * Adds a harmony note to each melody note, this many semitones away (kalimba keys underground).
   * Below the note on the surface, above it underground, above the octave below in the sky and isle.
   */
  readonly harmony?: number;
  /** Level of a ghost note an octave above the melody, relative to the note. */
  readonly shimmer?: number;
  /** Delay of the melody's echo in seconds (the surface echoes a quarter behind by default). */
  readonly echoDelay?: number;
  /** Chance of skipping a melody or arpeggio note, for a thinner texture. */
  readonly sparseness?: number;
  /** A louder bass on the surface and the isle, and a bass line at all in the sky. */
  readonly bass?: boolean;
  /** The underground: the bass an octave down. */
  readonly lowBass?: boolean;
  /** Level of the held chord pad (or the electric piano on the surface). */
  readonly padLevel?: number;
  /** A low held note under everything. */
  readonly drone?: boolean;
  /** Flattened notes: B flat underground, the desert's scale on the surface. */
  readonly flat?: boolean;
  /** The sky: everything bent into a minor mode. */
  readonly minor?: boolean;
  /** Heavier drums on the surface; in the sky, drums at all. */
  readonly drums?: boolean;
  /** The underground: a harder kick. */
  readonly loud?: boolean;
  /** Drums only on the downbeat on the surface; quieter drums underground. */
  readonly soft?: boolean;
  /** The underground: no kick drum. */
  readonly noKick?: boolean;
  /** The underground: the eighths of the bar where an anvil tinks. */
  readonly anvil?: readonly number[];
  /** Gusts of wind. */
  readonly wind?: boolean;
  /** Small bells now and then. */
  readonly bells?: boolean;
  /** Chance per eighth of a high wind-chime note. */
  readonly chimes?: number;
  /** The sky: play the surface's kalimba theme instead of the sky's tune (the final battle). */
  readonly finaleTheme?: boolean;
  /** The isle and the surface: chance per eighth of a water drop. */
  readonly drips?: number;
  /** The isle: waves lapping every other bar. */
  readonly waves?: boolean;
  /** The isle: loudness of the deep rumble from under the lagoon. */
  readonly deepLevel?: number;
  /** The isle: a soft clockwork tick on the off-beats. */
  readonly clockwork?: boolean;
  /** The surface: birdsong between the notes. */
  readonly birds?: boolean;
  /** The surface: the tune kept to a pentatonic. */
  readonly pentatonic?: boolean;
  /** The surface: loudness of the flute that answers on the second pass. */
  readonly flute?: number;
}

type Scenes = Readonly<Record<string, Scene>>;

/** The surface: one tune, coloured by each place on the continent. */
const SURFACE_SCENES: Scenes = {
  inicio: { stretch: 1.08 },
  pradera: {},
  bosque: { stretch: 1.04, birds: true, flute: 0.026 },
  canon: { stretch: 1.04, drums: true, echoDelay: 0.5 },
  valle: { harmony: 3, shimmer: 0.14 },
  lago: { stretch: 1.1, soft: true, drips: 0.1 },
  cumbres: { stretch: 1.14, wind: true, sparseness: 0.3, echoDelay: 0.38 },
  desierto: { stretch: 1.02, flat: true, drone: true },
  aldea: { stretch: 0.98, pentatonic: true, shimmer: 0.2 },
  ciudadela: { stretch: 1.08, bells: true, padLevel: 0.05, bass: true, flute: 0.03 },
  secreto: { stretch: 1.12, transpose: 12, echoDelay: 0.3, chimes: 0.15 },
};

/** The apprentice's isle has its own theme; each island colours it differently. */
const ISLE_SCENES: Scenes = {
  embarcadero: { waves: true },
  patio: { stretch: 0.94, clockwork: true },
  tintas: { harmony: 2, shimmer: 0.18 },
  imprenta: { stretch: 0.97, clockwork: true },
  almacen: { stretch: 1.03, bass: true },
  canal: { stretch: 1.06, drips: 0.16, waves: true },
  farola: { stretch: 1.04, bells: true },
  mercado: { stretch: 0.92, harmony: 4, shimmer: 0.15 },
  invernadero: { stretch: 1.02, shimmer: 0.25, drips: 0.1 },
  // Unreachable: the sky's `observatorio` is looked up first (see `resolveScene`).
  observatorio: { stretch: 1.05, transpose: 12, chimes: 0.2 },
  biblioteca: { stretch: 1.12, sparseness: 0.4, drone: true },
  aula: { padLevel: 0.04, bass: true, bells: true },
  secretoisla: { stretch: 1.1, transpose: 12, drips: 0.14, deepLevel: 0.05, sparseness: 0.25 },
};

const UNDERGROUND_SCENES: Scenes = {
  subsuelo: {},
  mina: { anvil: [6] },
  hongos: { echoDelay: 0.29, soft: true },
  lagosub: { noKick: true, shimmer: 0.25, stretch: 1.08 },
  cristal: { transpose: 7, shimmer: 0.15 },
  forja: { anvil: [2, 6], loud: true },
  abismo: { lowBass: true, sparseness: 0.35 },
  drow: { flat: true, drone: true },
  templo: { stretch: 1.12, echoDelay: 0.43, drone: true, flat: true },
  boveda: { harmony: 2, loud: true },
  secretosub: { transpose: 7, echoDelay: 0.29 },
};

/** The final battle: the surface's kalimba theme, in minor and with drums, over the sky's song. */
const FINALE: Scene = {
  stretch: 0.56,
  minor: true,
  drums: true,
  bass: true,
  padLevel: 0.055,
  finaleTheme: true,
  chimes: 0.1,
};

const SKY_SCENES: Scenes = {
  cielo: {},
  muelle: { bass: true },
  jardin: { shimmer: 0.22 },
  observatorio: { stretch: 1.12, chimes: 0.2 },
  viento: { wind: true, sparseness: 0.3 },
  arcoiris: { harmony: 4 },
  nido: { stretch: 0.9, bass: true },
  cascada: { echoDelay: 0.36 },
  campanario: { bells: true },
  tormenta: { stretch: 0.62, minor: true, drums: true, bass: true, padLevel: 0.05 },
  secretocielo: { transpose: 12, echoDelay: 0.3, chimes: 0.15 },
  final: FINALE,
  vacio: FINALE,
};

/** The scene the music starts in: the title screen. */
export const TITLE_SCENE_NAME = 'inicio';
export const TITLE_SCENE: Scene = SURFACE_SCENES.inicio;

/** The worlds with their own song, in the order a scene name is looked up. */
const WORLD_SONGS: readonly (readonly [Song, Scenes])[] = [
  ['underground', UNDERGROUND_SCENES],
  ['sky', SKY_SCENES],
  ['isle', ISLE_SCENES],
];

/**
 * The song and scene for a scene name. Names from no world play the surface song, coloured by the
 * surface scene of that name (or the title scene); the title scene plays the recorded loop.
 */
export function resolveScene(name: string): { readonly song: Song; readonly scene: Scene } {
  for (const [song, scenes] of WORLD_SONGS)
    if (name in scenes) return { song, scene: scenes[name] || TITLE_SCENE };
  return {
    song: name === TITLE_SCENE_NAME ? 'menu' : 'surface',
    scene: SURFACE_SCENES[name] || TITLE_SCENE,
  };
}
