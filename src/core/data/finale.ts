/** Final battle: The Void Between Worlds. */
import type {
  FilterGroup,
  LevelDraft,
  MediaDraft,
  PieceTypeMap,
  RegionDraft,
  WorldContent,
} from '../models';

// ═══════════════════════════════════════════════════════════════
//  THE VOID BETWEEN WORLDS · final battle
//  It opens when the three adventures are complete. Each phase mixes
//  what was learned: Grid, Flexbox, media queries, variables and transitions.
// ═══════════════════════════════════════════════════════════════
const finaleRegions: readonly RegionDraft[] = [
  {
    name: 'El Vacío entre los Mundos',
    subtitle: 'Combate final',
    x: 0.5,
    y: 0.5,
    radius: 0.2,
    terrain: 'vacio',
    icon: 'garabato',
    character: 'El Desmaquetador',
    role: 'el garabato que deshace los mundos',
    nameWithArticle: 'al Desmaquetador',
    exam: true,
    boss: true,
    taunts: [
      '¡Garabato va, garabato viene!',
      '¡Todo queda mejor torcido!',
      '¡display: none para tus esperanzas!',
      '¡Te falta un punto y coma… en el alma!',
      '¡Mi estilo favorito es ninguno!',
      '¡Qué bonito desorden has hecho!',
    ],
  },
];

const finalePieceTypes: PieceTypeMap = {
  muro: { material: 'sillares' },
  torre: { material: 'sillares', icon: 'faro' },
  sala: { material: 'marmol' },
  nucleo: { material: 'tormenta', icon: 'garabato' },
  cabecera: { material: 'tejas', icon: 'bandera' },
  atlas: { material: 'atlas' },
  brujula: { material: 'tablones', icon: 'orbe' },
  base: { material: 'marmol', icon: 'arena' },
  corona: { token: 'corona' },
  astilla: { material: 'obsidiana', icon: 'cristal' },
};

export const FINALE_GRID = [
  'display',
  'grid-template-columns',
  'grid-template-rows',
  'grid-template-areas',
  'grid-auto-rows',
  'gap',
  'grid-column',
  'grid-row',
  'grid-area',
];
export const FINALE_FLEX = [
  'display',
  'flex-direction',
  'flex-wrap',
  'justify-content',
  'align-items',
  'align-self',
  'gap',
  'order',
  'flex-grow',
  'flex',
];
export const FINALE_MEDIA = ['min-width', 'max-width', 'width', 'and', '<', '<=', '>='];
export const FINALE_TRANSITION = [
  'transition',
  'transition-property',
  'transition-duration',
  'transition-timing-function',
  'transition-delay',
  'transform',
];
export const uniqueList = (...lists: readonly (readonly string[])[]): string[] => [
  ...new Set(lists.flat()),
];

const finaleLevels: readonly LevelDraft[] = [
  {
    id: 'x0-1',
    region: 0,
    title: 'Los cimientos',
    phase: 'Grid y Flexbox',
    exam: true,
    terrain: 'ciudadela',
    tokenSize: false,
    width: 460,
    height: 320,
    allowed: uniqueList(FINALE_GRID, FINALE_FLEX),
    speech:
      '¡JI, JI! Has ordenado tres mundos… qué aburrimiento. Yo vivo entre ellos y me alimento de desorden. ¿Quieres detenerme? Empieza por levantar estos cimientos: una cuadrícula… ¡y dentro, una fila!',
    objective:
      'Rejilla con columnas <code>80px 1fr 80px</code>, filas <code>60px 1fr 50px</code> y 8px de hueco. El muro de arriba y el de abajo ocupan toda la fila; en medio, torre, sala y torre. La sala es flex: centra las tres gemas en vertical y deja cuatro huecos horizontales iguales, incluidos los dos de los extremos (<code>space-evenly</code>).',
    pieces: ['muro@cima', 'torre', 'sala', ['gema', 'gema', 'gema'], 'torre', 'muro@base'],
    rules: [
      {
        selector: '.tablero',
        solution:
          'display: grid;\ngrid-template-columns: 80px 1fr 80px;\ngrid-template-rows: 60px 1fr 50px;\ngap: 8px;',
      },
      { selector: '.cima', solution: 'grid-column: 1 / -1;' },
      { selector: '.base', solution: 'grid-column: 1 / -1;' },
      {
        selector: '.sala',
        solution: 'display: flex;\njustify-content: space-evenly;\nalign-items: center;',
      },
      { selector: '.gema', fixed: 'width: 44px;\nheight: 44px;', editable: false },
    ],
  },
  {
    id: 'x0-2',
    region: 0,
    title: 'El mapa que se encoge',
    phase: 'Grid y media queries',
    exam: true,
    terrain: 'lago',
    tokenSize: false,
    widths: [340, 620],
    height: 360,
    allowed: uniqueList(FINALE_GRID, FINALE_MEDIA),
    speech:
      '¡Mira lo que hago con tu mapa! Lo estiro, lo encojo… ¡y lo descoloco! En pantallas estrechas te lo apilo todo; en las anchas, a ver si sabes dónde va cada cosa.',
    objective:
      '<b>340px:</b> cabecera, atlas, brújula y base apilados, con filas de <code>50px 1fr 60px 40px</code> y 8px de hueco. <b>620px</b> (a partir de 500px): la cabecera arriba de lado a lado; debajo, el atlas y la brújula (columnas <code>1fr 140px</code>); la base abajo de lado a lado. Filas <code>50px 1fr 40px</code>.',
    pieces: ['cabecera', 'atlas', 'brujula', 'base'],
    rules: [
      {
        selector: '.tablero',
        solution:
          'display: grid;\ngap: 8px;\ngrid-template-areas:\n  "cab"\n  "atlas"\n  "bru"\n  "base";\ngrid-template-rows: 50px 1fr 60px 40px;',
      },
      { selector: '.cabecera', fixed: 'grid-area: cab;', editable: false },
      { selector: '.atlas', fixed: 'grid-area: atlas;', editable: false },
      { selector: '.brujula', fixed: 'grid-area: bru;', editable: false },
      { selector: '.base', fixed: 'grid-area: base;', editable: false },
      {
        selector: '.tablero',
        media: { solution: '(min-width: 500px)' },
        solution:
          'grid-template-areas:\n  "cab cab"\n  "atlas bru"\n  "base base";\ngrid-template-columns: 1fr 140px;\ngrid-template-rows: 50px 1fr 40px;',
      },
    ],
  },
  {
    id: 'x0-3',
    region: 0,
    title: 'Los nombres del caos',
    phase: 'Variables, calc() y media queries',
    exam: true,
    terrain: 'cristal',
    widths: [340, 620],
    height: 220,
    allowed: uniqueList(FINALE_FLEX, FINALE_MEDIA, ['--u']),
    speech:
      '¡Mis runas crecen y menguan con un solo nombre! Si no lo conoces, se quedan sin forma… ¡como a mí me gustan!',
    objective:
      'Fila centrada en las dos direcciones con un hueco de <code>var(--u)</code>. Las piezas ya miden <code>calc(var(--u) * 3)</code> (el orbe, <code>* 5</code>). <code>--u</code> vale <b>14px</b> y, a partir de 500px de ancho, <b>22px</b>.',
    pieces: ['runa', 'runa', 'orbe@grande', 'runa', 'runa'],
    rules: [
      {
        selector: '.tablero',
        solution:
          'display: flex;\njustify-content: center;\nalign-items: center;\ngap: var(--u);\n--u: 14px;',
      },
      {
        selector: '.pieza',
        fixed: 'width: calc(var(--u) * 3);\nheight: calc(var(--u) * 3);',
        editable: false,
      },
      {
        selector: '.grande',
        fixed: 'width: calc(var(--u) * 5);\nheight: calc(var(--u) * 5);',
        editable: false,
      },
      { selector: '.tablero', media: { solution: '(min-width: 500px)' }, solution: '--u: 22px;' },
    ],
  },
  {
    id: 'x0-4',
    region: 0,
    title: 'El latido del garabato',
    phase: 'Transiciones, :hover y variables',
    exam: true,
    terrain: 'tormenta',
    state: 'hover',
    compare: ['transform'],
    width: 440,
    height: 240,
    allowed: uniqueList(FINALE_TRANSITION, ['--t']),
    speech:
      '¡Ji, ji, ji! Mis escudos tiemblan cuando los miras… ¡pero cada uno a su ritmo! Ritmos guardados en un nombre, claro. ¿Te acuerdas de cuál?',
    objective:
      'Con el cursor encima, cada escudo crece y gira (<code>scale(1.3) rotate(10deg)</code>). La transición de <code>transform</code> dura <code>var(--t)</code> con <code>ease-out</code>: <code>--t</code> vale <b>0.4s</b> en el tablero y <b>1.2s</b> en el escudo lento.',
    pieces: ['escudo', 'escudo@lento', 'escudo'],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: flex;\njustify-content: space-around;\nalign-items: center;',
        solution: '--t: 0.4s;',
      },
      { selector: '.escudo', solution: 'transition: transform var(--t) ease-out;' },
      { selector: '.escudo:hover', solution: 'transform: scale(1.3) rotate(10deg);' },
      { selector: '.lento', solution: '--t: 1.2s;' },
    ],
  },
  {
    id: 'x0-5',
    region: 0,
    title: 'Los tres anchos',
    phase: 'Flexbox, order y rangos',
    exam: true,
    terrain: 'boveda',
    widths: [340, 560, 700],
    height: 300,
    allowed: uniqueList(FINALE_FLEX, FINALE_MEDIA),
    speech:
      '¡Tres pantallas, tres trampas! En una, todo de pie; en otra, todo en fila; en la grande, todo desparramado. Y la corona… ¡la corona siempre quiere ir primero cuando hay poco sitio!',
    objective:
      'Fila con 10px de hueco. Con <b>menos de 450px</b>: columna centrada y la corona la primera. Con <b>650px o más</b>: el primero y el último pegados a los bordes (<code>space-between</code>). Usa la sintaxis de rango.',
    pieces: ['astilla', 'astilla', 'corona', 'astilla'],
    checks: [
      {
        inCondition: true,
        pattern: /width\s*[<>]|[<>]=?\s*width/,
        message: 'Escribe las condiciones con la sintaxis de rango',
      },
    ],
    rules: (() => {
      const a: MediaDraft = { solution: '(width < 450px)' },
        b2: MediaDraft = { solution: '(width >= 650px)' };
      return [
        { selector: '.tablero', solution: 'display: flex;\ngap: 10px;' },
        {
          selector: '.tablero',
          media: a,
          solution: 'flex-direction: column;\nalign-items: center;',
        },
        { selector: '.corona', media: a, solution: 'order: -1;' },
        { selector: '.tablero', media: b2, solution: 'justify-content: space-between;' },
      ];
    })(),
  },
  {
    id: 'x0-6',
    region: 0,
    title: 'El último trazo',
    phase: 'Todo a la vez',
    exam: true,
    terrain: 'vacio',
    state: 'active',
    tokenSize: false,
    widths: [360, 600],
    height: 300,
    allowed: uniqueList(FINALE_GRID, FINALE_FLEX, FINALE_MEDIA, FINALE_TRANSITION, ['--hueco']),
    speech:
      '¡NO! ¡Ni se te ocurra! Si mi núcleo gira y se encoge… ¡me borraré del todo! ¡Nadie sabe hacer las cinco cosas a la vez! ¡NADIE!',
    objective:
      'Rejilla de una columna con hueco <code>var(--hueco)</code> (<b>10px</b>); a partir de 500px, columnas <code>2fr 1fr</code> y <code>--hueco</code> de <b>16px</b>. La sala es flex: gemas centradas en las dos direcciones, separadas por <code>var(--hueco)</code>. Al activar, el núcleo gira y se encoge en <b>1s</b> con <code>ease-in-out</code>.',
    pieces: ['sala', ['gema', 'gema', 'gema'], 'nucleo'],
    rules: [
      {
        selector: '.tablero',
        solution: 'display: grid;\ngrid-template-columns: 1fr;\ngap: var(--hueco);\n--hueco: 10px;',
      },
      {
        selector: '.tablero',
        media: { solution: '(min-width: 500px)' },
        solution: 'grid-template-columns: 2fr 1fr;\n--hueco: 16px;',
      },
      {
        selector: '.sala',
        solution:
          'display: flex;\njustify-content: center;\nalign-items: center;\ngap: var(--hueco);',
      },
      { selector: '.nucleo', solution: 'transition: transform 1s ease-in-out;' },
      { selector: '.gema', fixed: 'width: 44px;\nheight: 44px;', editable: false },
      {
        selector: '.tablero.activo .nucleo',
        fixed: 'transform: rotate(180deg) scale(0.4);',
        editable: false,
      },
    ],
    farewell:
      'Nooo… mis garabatos… se están… alineando… Qué bonito queda. Maldita sea. Qué bonito queda.',
  },
];

/** Map index filters. */
const filters: readonly FilterGroup[] = [
  ['Tipo de ejercicio', ['prueba de aprendizaje']],
  [
    'Grid y Flexbox',
    [
      'display',
      'grid-template-columns',
      'grid-template-rows',
      'grid-template-areas',
      'grid-column',
      'justify-content',
      'align-items',
      'flex-direction',
      'order',
      'gap',
    ],
  ],
  ['Transiciones', ['transition', 'transform']],
  ['Conceptos', ['@media', 'custom properties', 'calc()']],
];

export const finaleWorld: WorldContent = {
  id: 'finale',
  name: 'El Vacío entre los Mundos',
  mapTitle: 'El Vacío entre los Mundos',
  topic: 'Combate final',
  card: { tech: 'Combate final · todo a la vez', className: 'is-final' },
  regions: finaleRegions,
  pieceTypes: finalePieceTypes,
  filters,
  lessons: finaleLevels,
};
