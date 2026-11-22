/** Domain models. Lesson selectors and the save record keep their stored names. */

export type WorldId = 'base' | 'grid' | 'flex' | 'cielo' | 'final';

export type ViewName = 'home' | 'map' | 'challenge';

export type BoardState = 'activo' | 'hover' | 'pulsa' | 'foco';

export type PieceSpec = string | readonly PieceSpec[];

export interface PieceType {
  readonly a?: string;
  readonly o?: string;
  readonly i?: string;
  readonly cartel?: boolean;
  /** Real element name. The type is then not a class: the tag identifies the piece. */
  readonly tag?: string;
  /** The piece is its text, written straight inside the element. */
  readonly texto?: boolean;
}

/** One way of looking at the board: its size and what the device reports. */
export interface BoardView {
  readonly w: number;
  readonly h: number;
  readonly n: string;
  readonly medio: 'screen' | 'print';
  readonly esquema: 'light' | 'dark';
  readonly puntero: 'fine' | 'coarse';
  readonly calma: boolean;
}

export type BoardViewDraft = Partial<BoardView>;

export type PieceTypeMap = Record<string, PieceType>;

export interface MediaDraft {
  readonly sol: string;
  readonly ini?: string;
}

export interface BoardRule {
  s: string;
  f: string;
  sol: string;
  ed: boolean;
  ini: string;
  oculto?: boolean;
  m?: string | MediaDraft;
  g: number;
  /** Starting text of a selector the student writes; `s` is then the solution. */
  sel?: string;
}

export interface BoardRuleDraft {
  readonly s: string;
  readonly f?: string;
  readonly sol?: string;
  readonly ed?: boolean;
  readonly ini?: string;
  readonly oculto?: boolean;
  readonly m?: string | MediaDraft;
  g?: number;
  readonly sel?: string;
}

export interface MediaGroup {
  readonly fijo: boolean;
  readonly sol: string;
  readonly ini: string;
}

export interface SecretPlace {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly dib: string;
  readonly pista: string;
}

export interface Purse {
  readonly total: number;
  readonly precio: number;
}

export interface RuleCheck {
  readonly re: RegExp;
  readonly m: string;
  readonly b?: number;
  readonly cond?: boolean;
  /** Test the selectors the student wrote instead of the declarations. */
  readonly sel?: boolean;
}

/** A recognisable wrong turn: when every listed property computes to its value, say what to look at. */
export interface Misstep {
  readonly s?: string;
  readonly si: Readonly<Record<string, string>>;
  readonly m: string;
}

export interface RuntimePiece {
  readonly t: string;
  readonly k: string;
  readonly fija: boolean;
  readonly txt: string;
  readonly padre: number;
  T: PieceType;
  readonly e: string;
  readonly id: string;
  /** How the piece reads in the markup (`p.nota#aviso`), shown on pieces that are real elements. */
  marca: string;
  cont?: boolean;
}

export interface LevelDraft {
  readonly id: string;
  r: number;
  readonly n: string;
  readonly hito?: string;
  readonly ok?: readonly string[];
  readonly enc?: string;
  readonly teo?: string;
  readonly obj?: string;
  readonly pista?: string;
  readonly pistasPrevias?: readonly string[];
  readonly practica?: 'huecos-en-columna';
  readonly despistes?: readonly Misstep[];
  readonly nota?: string;
  p: PieceSpec[];
  b: BoardRuleDraft[];
  w?: number;
  h?: number;
  anchos?: number[];
  vistas?: readonly BoardViewDraft[];
  et?: boolean;
  etFijas?: boolean;
  readonly esp?: string;
  readonly clase?: string;
  readonly examen?: boolean;
  jefe?: boolean;
  readonly secreto?: SecretPlace;
  readonly t?: string;
  readonly pj?: string;
  readonly rol?: string;
  readonly av?: string;
  readonly fin?: string;
  readonly tiempo?: number;
  readonly tiempoTxt?: readonly string[];
  readonly estado?: BoardState;
  dim?: false | readonly [number, number];
  readonly cmp?: readonly string[];
  readonly c?: readonly string[];
  readonly musica?: boolean;
  readonly fase?: string;
  readonly espejismo?: boolean;
  readonly bolsa?: Purse;
  readonly bolsaTxt?: string;
  readonly encima?: readonly (readonly [string, string, string])[];
  readonly req?: readonly RuleCheck[];
  /** Show the board's markup next to the theory. */
  readonly html?: boolean;
  /** The board itself is not the container being taught, so do not warn that it is not one. */
  readonly sinAviso?: boolean;
  mundo?: WorldId;
  i?: number;
  mg?: MediaGroup[];
  tags?: string[];
  movibles?: number[];
  max?: number;
}

export interface Level extends Omit<LevelDraft, 'p' | 'b' | 'mundo' | 'i' | 'w' | 'h' | 'anchos' | 'vistas' | 'ok' | 'hito'> {
  mundo: WorldId;
  i: number;
  w: number;
  h: number;
  anchos: number[];
  vistas: BoardView[];
  b: BoardRule[];
  p: RuntimePiece[];
  mg: MediaGroup[];
  tags: string[];
  movibles: number[];
  ok: readonly string[];
  hito: string;
}

export interface Region {
  readonly n: string;
  readonly sub: string;
  x?: number;
  y?: number;
  readonly t: string;
  readonly pj?: string;
  readonly rol?: string;
  readonly examen?: boolean;
  readonly jefe?: boolean;
  readonly secreto?: boolean;
  readonly ruta?: readonly (readonly [number, number])[];
  readonly vuelo?: { readonly desde: number; readonly con: string };
  readonly radio?: number;
  readonly icono?: string;
  readonly al?: string;
  readonly pullas?: readonly string[];
  mundo?: WorldId;
  num?: number;
  ri?: number;
}

export interface WorldCopy {
  readonly n: string;
  readonly mapa: string;
  readonly tec: string;
}

export interface AttemptRecord {
  m?: boolean;
  nota?: number;
  t?: number;
}

/** localStorage document. Field names are the saved-game contract. */
export interface Progress {
  v: number;
  actual: string | null;
  hechos: Record<string, AttemptRecord>;
  codigo: Record<string, string[]>;
  intentos: Record<string, number>;
  sonido: boolean;
  lineas: boolean;
  musica: boolean;
  secretos: Record<string, boolean>;
  vistas: Record<string, boolean>;
  mundo?: WorldId;
  t: number;
}

export interface RegionStats {
  readonly total: number;
  readonly hechos: number;
}

export interface Session {
  world: WorldId;
  level: Level | null;
}

export function isWorldId(value: string): value is WorldId {
  return value === 'base' || value === 'grid' || value === 'flex' || value === 'cielo' || value === 'final';
}

