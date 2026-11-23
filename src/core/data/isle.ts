/** The apprentice's isle: CSS fundamentals, before any layout. Player-facing copy stays in Spanish. */
import seal from '../../../assets/m-cerezo.jpg';
import type { FilterGroup, LevelDraft, PieceTypeMap, RegionDraft, WorldContent } from '../models';
import * as finals from './isle/classroom';
import * as glasshouses from './isle/greenhouses';
import {
  BG,
  BORDER,
  BORDER_BOX,
  fixed,
  GAP,
  GOLD,
  hidden,
  ISLE,
  inRow,
  LAMPS,
  POSITION,
  pick,
  refill,
} from './isle/helpers';
import * as library from './isle/library';
import * as market from './isle/market';
import * as observatory from './isle/observatory';
import * as hideouts from './isle/secrets';

// ═══════════════════════════════════════════════════════════════
//  THE APPRENTICE'S ISLE · rules, selectors, the box, the normal flow and everything around them
//  Regions use a local index (0–12); the catalog appends them after the finale.
//  The isle is an atoll (src/features/map/isleLayout.ts): the trail goes round the ring of islands over
//  bridges (`path`), then into the lagoon. After the lighthouse it branches: the four regions that
//  follow open together (`after`, local indexes of the regions they wait for) and the Aula Magna opens
//  when all four are done. This list's order is still the suggested one.
//  Nothing here is flex or grid: pieces are real elements in document flow.
//  New blocks:  ownSelector → the student writes the selector (`selector` is the solution)
//               showMarkup → the board's markup is shown beside the theory
//               compare → computed styles that must also match (colour, border, font…)
//               [attr=value] after a piece's class or id gives it an HTML attribute
//  Each region closes on a lesson with a twist (against the tide, in the dark, a tune, a bargain),
//  and the places off the trail teach what the syllabus leaves out.
//  Ids are save keys and keep the number they were born with: the four regions added after the
//  lighthouse use b8–b11 and the Aula Magna kept b7. Players read the region's place instead.
// ═══════════════════════════════════════════════════════════════
const baseRegions: readonly RegionDraft[] = [
  {
    name: 'El Embarcadero',
    subtitle: 'Reglas y selectores',
    x: 0.1636,
    y: 0.7885,
    path: [
      [0.1303, 0.7489],
      [0.1212, 0.6476],
    ],
    terrain: 'embarcadero',
    character: 'Maese Cálamo',
    role: 'el viejo escriba',
  },
  {
    name: 'El Patio de las Filas',
    subtitle: 'Combinar, contar y desempatar',
    x: 0.1061,
    y: 0.5198,
    path: [
      [0.1212, 0.4053],
      [0.1636, 0.3084],
    ],
    terrain: 'patio',
    character: 'Hilera',
    role: 'la sargenta instructora',
  },
  {
    name: 'El Taller de Tintas',
    subtitle: 'Colores, unidades, bordes y fondos',
    x: 0.203,
    y: 0.2291,
    path: [
      [0.2758, 0.2203],
      [0.3303, 0.1718],
    ],
    terrain: 'tintas',
    character: 'Bermellón',
    role: 'el maestro tintorero',
  },
  {
    name: 'La Imprenta',
    subtitle: 'Fuentes y texto',
    x: 0.397,
    y: 0.1366,
    path: [
      [0.4545, 0.1542],
      [0.5606, 0.1542],
    ],
    terrain: 'imprenta',
    character: 'Doña Serifa',
    role: 'la impresora',
  },
  {
    name: 'El Almacén de Cajas',
    subtitle: 'El modelo de caja',
    x: 0.6273,
    y: 0.1278,
    path: [
      [0.7061, 0.1586],
      [0.7727, 0.207],
    ],
    terrain: 'almacen',
    character: 'Tara',
    role: 'la estibadora',
  },
  {
    name: 'El Canal',
    subtitle: 'Bloques, líneas y flotadores',
    x: 0.8364,
    y: 0.2467,
    path: [
      [0.8788, 0.348],
      [0.8879, 0.4141],
    ],
    terrain: 'canal',
    character: 'Remo',
    role: 'el barquero',
  },
  {
    name: 'El Faro',
    subtitle: 'Posición y página base',
    x: 0.9364,
    y: 0.511,
    path: [
      [0.8818, 0.6476],
      [0.8576, 0.7401],
    ],
    terrain: 'farola',
    character: 'Fanal',
    role: 'la farera',
  },
  {
    name: 'El Mercado de las Etiquetas',
    subtitle: 'Atributos y pseudoclases',
    x: 0.8182,
    y: 0.8018,
    path: [
      [0.7394, 0.8458],
      [0.697, 0.8767],
    ],
    after: [6],
    terrain: 'mercado',
    character: 'Almoneda',
    role: 'la subastadora',
  },
  {
    name: 'Los Invernaderos de Cristal',
    subtitle: 'Sombras, degradados y transparencias',
    x: 0.6136,
    y: 0.8855,
    path: [
      [0.5273, 0.8899],
      [0.4606, 0.8899],
    ],
    after: [6],
    terrain: 'invernadero',
    character: 'Clorofila',
    role: 'la jardinera del cristal',
  },
  {
    name: 'El Observatorio de las Medidas',
    subtitle: 'Funciones, unidades y palabras clave',
    x: 0.3909,
    y: 0.8767,
    path: [
      [0.3727, 0.8238],
      [0.3364, 0.6564],
    ],
    after: [6],
    terrain: 'observatorio',
    character: 'Astrolabio',
    role: 'el astrónomo calculista',
  },
  {
    name: 'La Biblioteca de los Pergaminos',
    subtitle: 'Pseudoelementos y texto que no cabe',
    x: 0.3152,
    y: 0.5683,
    path: [
      [0.3848, 0.5595],
      [0.4667, 0.5286],
    ],
    after: [6],
    terrain: 'biblioteca',
    character: 'Marginalia',
    role: 'la bibliotecaria',
  },
  {
    name: 'El Aula Magna',
    subtitle: 'Prueba de aprendizaje',
    x: 0.5455,
    y: 0.511,
    after: [7, 8, 9, 10],
    terrain: 'aula',
    character: 'Maestra Rúbrica',
    role: 'la examinadora',
    exam: true,
  },
  {
    name: 'Lugares secretos',
    subtitle: 'Escondidos por toda la isla',
    terrain: 'embarcadero',
    secret: true,
  },
];

// tag: the piece is that element, and its type is not a class · texto: it is its own text
const basePieceTypes: PieceTypeMap = {
  h1: { tag: 'h1', isText: true },
  h2: { tag: 'h2', isText: true },
  h3: { tag: 'h3', isText: true },
  p: { tag: 'p', isText: true },
  span: { tag: 'span', isText: true },
  strong: { tag: 'strong', isText: true },
  em: { tag: 'em', isText: true },
  a: { tag: 'a', isText: true },
  li: { tag: 'li', isText: true },
  ul: { tag: 'ul' },
  ol: { tag: 'ol' },
  div: { tag: 'div' },
  section: { tag: 'section' },
  article: { tag: 'article' },
  header: { tag: 'header' },
  nav: { tag: 'nav' },
  main: { tag: 'main' },
  aside: { tag: 'aside' },
  footer: { tag: 'footer' },
  tablilla: { token: 'runa' },
  libro: { token: 'libro' },
  tintero: { token: 'pocion' },
  caja: {},
  tela: { material: 'lienzo' },
  ...market.pieceTypes,
  ...glasshouses.pieceTypes,
  ...observatory.pieceTypes,
  ...library.pieceTypes,
  ...hideouts.pieceTypes,
  ...finals.pieceTypes,
};

const CUARTEL = [
  'p:Vendedor de pipas',
  'section@cuartel',
  ['p:Recluta Uno', 'p:Recluta Dos', 'div@banquillo', ['p:Recluta castigado']],
  'p:Visitante despistado',
];
const FILA = ['ul@fila', ['li:Ana', 'li:Blas', 'li:Cleo', 'li:Dimas', 'li:Eva', 'li:Fidel']];

// The landmark each region leaves on the map when a lesson is cleared.
const LANDMARKS = [
  'ancla',
  'escudo',
  'pocion',
  'libro',
  'cofre',
  'barca',
  'faro',
  'moneda',
  'maceta',
  'telescopio',
  'lupa',
  'sello',
  'llave',
];

const lessons: LevelDraft[] = [
  //Region 0 · EL EMBARCADERO
  {
    id: 'b0-1',
    region: 0,
    title: 'La primera runa',
    width: 420,
    height: 200,
    allowed: ['width'],
    concepts: ['regla', 'px'],
    speech:
      'Bienvenida a la isla, criatura. Antes de levantar ciudades hay que saber escribir una sola runa. Mira esa tablilla: ocupa todo el muelle y no me deja pasar con la carretilla. Estréchala.',
    note: 'Escribe en la tablilla rúnica: el tablero cambia al instante. La silueta punteada marca cómo debe quedar cada pieza y, con «Ver el objetivo», la ves terminada.',
    theory:
      '<p>El CSS se escribe en <b>reglas</b>. Cada regla tiene dos partes: un <b>selector</b>, que dice <b>a quién</b> se aplica, y un bloque entre llaves con sus <b>declaraciones</b>.</p><pre>.tablilla {\n  width: 180px;\n}</pre><p>Una declaración es una <b>propiedad</b>, dos puntos, un <b>valor</b> y un punto y coma: <code>width: 180px;</code> significa «180 píxeles de ancho».</p>',
    objective: 'La tablilla mide <b>180px</b> de ancho.',
    hint: '<code>width: 180px;</code>',
    pieces: ['tablilla'],
    rules: [{ selector: '.tablilla', solution: 'width: 180px;' }],
    farewell: 'Una runa, un cambio. Así empieza todo lo demás.',
  },
  {
    id: 'b0-2',
    region: 0,
    title: 'Dos runas, dos puntos y coma',
    width: 420,
    height: 240,
    allowed: ['width', 'height'],
    concepts: ['regla'],
    speech:
      'Ese cofre ha llegado en el barco de la mañana y viene sin medir. En mi registro pone doscientos cuarenta de ancho y cien de alto. Y el registro nunca se equivoca: lo escribo yo.',
    theory:
      '<p>Una regla admite <b>todas las declaraciones que quieras</b>, una detrás de otra. El <b>punto y coma</b> cierra cada una: si lo olvidas, el navegador junta dos declaraciones en una y no entiende ninguna.</p><pre>.cofre {\n  width: 240px;\n  height: 100px;\n}</pre>',
    objective: 'El cofre mide <b>240px</b> de ancho y <b>100px</b> de alto.',
    hint: '<code>width: 240px;</code> y, en otra línea, <code>height: 100px;</code>',
    pieces: ['cofre'],
    rules: [{ selector: '.cofre', solution: 'width: 240px;\nheight: 100px;' }],
  },
  {
    id: 'b0-3',
    region: 0,
    title: 'Runas dormidas',
    width: 420,
    height: 260,
    allowed: ['width', 'height'],
    concepts: ['comentarios'],
    speech:
      'Un escriba prudente no borra: duerme. Ayer dejé dormida la runa del ancho y despierta la del alto, y era justo al revés. Arréglalo sin borrar nada, que el pergamino es caro.',
    theory:
      '<p>Todo lo que va entre <code>/*</code> y <code>*/</code> es un <b>comentario</b>: el navegador lo ignora. Sirve para dejar notas… y para <b>apagar</b> una declaración sin borrarla.</p><pre>/* esto es una nota */\n/* width: 200px; */</pre><p>Quita los dos signos y la declaración vuelve a funcionar.</p>',
    objective:
      'Despierta el ancho de <b>200px</b> y deja dormido el alto: el libro vuelve a medir de alto lo que ocupa.',
    hint: '<code>width: 200px;</code> sin signos, y <code>/* height: 130px; */</code> entre ellos.',
    pieces: ['libro'],
    rules: [
      {
        selector: '.libro',
        initial: '/* width: 200px; */\nheight: 130px;',
        solution: 'width: 200px;\n/* height: 130px; */',
      },
    ],
  },
  {
    id: 'b0-4',
    region: 0,
    title: '¿A quién? El tipo',
    variant: 'escribe el selector',
    showMarkup: true,
    width: 440,
    height: 230,
    allowed: [],
    compare: BG,
    concepts: ['tipo'],
    speech:
      'Ahora al revés: la runa ya está escrita y falta decir a quién va. Quiero dorados todos los párrafos del tablón. Solo los párrafos: el título se queda como está.',
    theory:
      '<p>El selector más sencillo es el <b>nombre de la etiqueta</b>. Se llama <b>selector de tipo</b> y alcanza a <b>todos</b> los elementos de ese tipo que haya en la página.</p><pre>p { … }   /* todos los párrafos */\nh2 { … }  /* todos los títulos h2 */</pre><p>Debajo tienes el HTML del tablero: mira qué etiqueta lleva cada pieza.</p>',
    objective: 'Los tres párrafos (<code>&lt;p&gt;</code>), dorados. El título, no.',
    hint: 'El selector es el nombre de la etiqueta: <code>p</code>',
    pieces: [
      'h2:Normas del muelle',
      'p:No correr por las tablas.',
      'p:Amarrar con dos nudos.',
      'p:Saludar al escriba.',
    ],
    rules: [pick('p', GOLD), GAP],
  },
  {
    id: 'b0-5',
    region: 0,
    title: 'Con apellido: la clase',
    variant: 'escribe el selector',
    showMarkup: true,
    width: 440,
    height: 270,
    allowed: [],
    compare: BG,
    concepts: ['clase'],
    speech:
      'Hay avisos urgentes mezclados con los de todos los días, y unos son párrafos y otro es un título. Menos mal que a los urgentes les puse una marca. Píntamelos de rojo tomate.',
    theory:
      '<p>Una <b>clase</b> es una marca que tú pones en el HTML con <code>class="urgente"</code>. Pueden llevarla <b>muchos</b> elementos, aunque sean de tipos distintos. En CSS se selecciona con un <b>punto</b> delante:</p><pre>.urgente { … }</pre><p>Es el selector que más vas a usar.</p>',
    objective: 'Todo lo que lleve la clase <code>urgente</code>, de color <code>tomato</code>.',
    hint: 'Un punto y el nombre de la clase: <code>.urgente</code>',
    pieces: [
      'p:Barca del pescadero',
      'p@urgente:Barca con vía de agua',
      'p:Barca del correo',
      'h2@urgente:¡Sube la marea!',
      'p:Barca del escriba',
    ],
    rules: [pick('.urgente', 'background-color: tomato;'), GAP],
  },
  {
    id: 'b0-6',
    region: 0,
    title: 'Único en el muelle: el id',
    variant: 'escribe el selector',
    showMarkup: true,
    width: 440,
    height: 220,
    allowed: [],
    compare: BG,
    concepts: ['id'],
    speech:
      'Todas son barcas, pero solo hay una Capitana. Tiene nombre propio y nadie más puede llevarlo. Dórala, que hoy zarpa.',
    theory:
      '<p>Un <b>id</b> es un nombre <b>único</b>: en una página no puede repetirse. En el HTML se escribe <code>id="capitana"</code> y en CSS se selecciona con una <b>almohadilla</b>:</p><pre>#capitana { … }</pre><p>Clase para lo que se repite, id para lo que solo hay uno.</p>',
    objective: 'Solo la barca con <code>id="capitana"</code>, dorada.',
    hint: 'Una almohadilla y el id: <code>#capitana</code>',
    pieces: [
      'p@barca:La Sardinera',
      'p@barca:La Lenta',
      'p@barca#capitana:La Capitana',
      'p@barca:La Tercera',
    ],
    rules: [pick('#capitana', GOLD), GAP],
  },
  {
    id: 'b0-7',
    region: 0,
    title: 'A todo el mundo',
    variant: 'escribe el selector',
    showMarkup: true,
    width: 420,
    height: 310,
    allowed: [],
    concepts: ['universal'],
    speech:
      'En este muelle todo está pegado con todo y no hay quien respire. Sepáralo: a todo, sin excepción. No me hagas una lista, que hay un signo para eso.',
    theory:
      '<p>El asterisco es el <b>selector universal</b>: alcanza a <b>todos</b> los elementos, sean lo que sean, incluso los que están dentro de otros.</p><pre>* { … }</pre><p>Se usa poco, pero es la base de los «reinicios» con los que empiezan casi todas las hojas de estilo. Lo verás en el Faro.</p>',
    objective: 'Todo lo que hay en el tablero —absolutamente todo— con 12px de margen por debajo.',
    hint: 'Un solo signo: <code>*</code>',
    pieces: ['h2:Carga del día', 'p:Dos barriles de tinta', 'p:Un saco de plumas', 'tablilla'],
    rules: [pick('*', 'margin-bottom: 12px;')],
  },
  {
    id: 'b0-8',
    region: 0,
    title: 'Varios de una vez',
    variant: 'escribe el selector',
    showMarkup: true,
    width: 440,
    height: 270,
    allowed: [],
    compare: BG,
    concepts: ['lista de selectores'],
    speech:
      'El título y los urgentes van dorados. Podría escribirte la regla dos veces, pero la tinta no la regalan. Una regla, dos destinatarios.',
    theory:
      '<p>Con una <b>coma</b> unes varios selectores en la misma regla. Se lee «<b>y también</b>»:</p><pre>h2, .urgente { … }</pre><p>La regla se aplica a los <code>h2</code> <b>y también</b> a lo que lleve la clase <code>urgente</code>. Ojo: sin coma significaría otra cosa, que verás en el Patio.</p>',
    objective: 'El título <code>h2</code> y los dos avisos urgentes, dorados, con una sola regla.',
    hint: '<code>h2, .urgente</code>',
    pieces: [
      'h2:Avisos del muelle',
      'p:Se vende ancla, poco uso.',
      'p@urgente:Falta un remo.',
      'p:Clases de nudos los jueves.',
      'p@urgente:El gato ha vuelto a subir al mástil.',
    ],
    checks: [{ inSelector: true, pattern: /,/, message: 'Une los dos selectores con una coma' }],
    rules: [pick('h2, .urgente', GOLD), GAP],
  },
  {
    id: 'b0-9',
    region: 0,
    title: 'El tablón del muelle',
    variant: 'escribe el selector',
    showMarkup: true,
    width: 440,
    height: 270,
    allowed: [],
    compare: BG,
    concepts: ['tipo', 'clase', 'id'],
    speech:
      'Última tarea del muelle y te dejo sola. Tres reglas escritas y ningún destinatario: el título, los avisos y la nota de la Capitana. Tú sabrás cuál es cuál.',
    theory:
      '<p>Repaso: <b>tipo</b> (<code>h2</code>), <b>clase</b> (<code>.aviso</code>) e <b>id</b> (<code>#capitana</code>). Un mismo elemento puede recibir <b>varias reglas</b> a la vez: la nota de la Capitana es un aviso y además tiene id, así que se lleva las dos.</p>',
    objective:
      'El título, dorado. Los avisos, azul claro. Y la nota de la Capitana, además, de 220px de ancho.',
    hint: 'Por orden: <code>h2</code>, <code>.aviso</code> y <code>#capitana</code>.',
    pieces: [
      'h2:Tablón del muelle',
      'p@aviso:Marea alta a mediodía',
      'p@aviso#capitana:Zarpa la Capitana',
      'p:Se busca gato marinero',
      'p@aviso:No alimentar a las gaviotas',
    ],
    rules: [
      pick('h2', GOLD),
      pick('.aviso', 'background-color: lightblue;'),
      pick('#capitana', 'width: 220px;'),
      GAP,
    ],
  },
  {
    id: 'b0-10',
    region: 0,
    title: 'Antes de que suba la marea',
    variant: 'contra reloj',
    timeLimit: 75,
    className: 'marea',
    showMarkup: true,
    width: 440,
    height: 270,
    allowed: [],
    compare: BG,
    concepts: ['tipo', 'clase', 'id'],
    timeMessages: {
      expired: `¡La marea ha cubierto el muelle! ${refill('Achica el agua')} y vuelve a intentarlo.`,
      late: 'Marcado, aunque con los pies mojados. Repítelo a tiempo y sin pistas para dominarlo.',
    },
    speech:
      'Y ahora deprisa, que sube la marea y el manifiesto está sin marcar. El título, dorado. La carga, azul claro. Y la loza, que es frágil, más estrecha, para que nadie le ponga nada encima. ¡Los pies, criatura, los pies!',
    theory:
      '<p><b>Contra reloj:</b> la marea sube en cuanto empiezas a escribir. Son los tres selectores de siempre: el <b>tipo</b> se escribe tal cual, la <b>clase</b> lleva un punto delante y el <b>id</b>, una almohadilla.</p>',
    objective:
      'El título <code>h2</code>, dorado. Todo lo que lleve la clase <code>carga</code>, azul claro. Y el elemento con <code>id="fragil"</code>, de 200px de ancho.',
    hint: 'Por orden: <code>h2</code>, <code>.carga</code> y <code>#fragil</code>.',
    pieces: [
      'h2:Manifiesto de carga',
      'p@carga:Barriles de tinta',
      'p@carga#fragil:Loza fina',
      'p:Pasajeros',
      'p@carga:Fardos de lana',
    ],
    rules: [
      pick('h2', GOLD),
      pick('.carga', 'background-color: lightblue;'),
      pick('#fragil', 'width: 200px;'),
      GAP,
    ],
    farewell:
      'Ya sabes dirigirte a cada cosa por su nombre. Sube al Patio: la sargenta Hilera te enseñará a dar órdenes más finas. Tápate los oídos.',
  },
  //Region 1 · EL PATIO DE LAS FILAS
  {
    id: 'b1-1',
    region: 1,
    title: 'Los de dentro',
    variant: 'escribe el selector',
    showMarkup: true,
    width: 440,
    height: 370,
    allowed: [],
    compare: BG,
    concepts: ['descendiente'],
    speech:
      '¡FIRMES! Aquí hay reclutas y hay gente que pasaba por el patio. Quiero dorados a los reclutas: a todos los que estén dentro del cuartel, estén donde estén. ¡A LOS DE FUERA, NI MIRARLOS!',
    theory:
      '<p>Un <b>espacio</b> entre dos selectores significa «<b>dentro de</b>». Es el <b>selector descendiente</b>:</p><pre>.cuartel p { … }</pre><p>Alcanza a los <code>p</code> que estén dentro de <code>.cuartel</code>, a <b>cualquier profundidad</b>: hijos, nietos o bisnietos. Fíjate en el sangrado del HTML: lo que está más adentro está dentro.</p>',
    objective:
      'Los tres párrafos que están dentro de <code>.cuartel</code>, dorados. Los dos de fuera, no.',
    hint: '<code>.cuartel p</code>',
    pieces: CUARTEL,
    rules: [pick('.cuartel p', GOLD), GAP],
  },
  {
    id: 'b1-2',
    region: 1,
    title: 'Solo los hijos',
    variant: 'escribe el selector',
    showMarkup: true,
    width: 440,
    height: 370,
    allowed: [],
    compare: BG,
    concepts: ['hijo'],
    speech:
      '¡El del banquillo está CASTIGADO y hoy no se dora! Solo los que forman directamente en el cuartel. ¡Ni nietos ni sobrinos!',
    theory:
      '<p>El signo <code>&gt;</code> es más estricto que el espacio: solo alcanza a los <b>hijos directos</b>, los que están justo un nivel por debajo.</p><pre>.cuartel &gt; p { … }</pre><p>El recluta castigado está dentro de <code>.banquillo</code>, que a su vez está dentro del cuartel: es un nieto, y <code>&gt;</code> no llega hasta él.</p>',
    objective:
      'Solo los dos párrafos que son <b>hijos directos</b> de <code>.cuartel</code>, dorados.',
    hint: '<code>.cuartel &gt; p</code>',
    pieces: CUARTEL,
    checks: [
      { inSelector: true, pattern: />/, message: 'Usa el signo <code>&gt;</code> de hijo directo' },
    ],
    rules: [pick('.cuartel > p', GOLD), GAP],
  },
  {
    id: 'b1-3',
    region: 1,
    title: 'Cabeza y cola',
    variant: 'escribe el selector',
    showMarkup: true,
    width: 420,
    height: 340,
    allowed: [],
    compare: BG,
    concepts: [':first-child', ':last-child'],
    speech:
      '¡A FORMAR! El primero de la fila lleva el estandarte dorado. El último, el farolillo rojo. ¡Y no me digas sus nombres, que mañana cambian de sitio!',
    theory:
      '<p>Una <b>pseudo-clase</b> empieza por dos puntos y selecciona según <b>la situación</b> del elemento, no según su nombre. Estas dos miran su posición entre sus hermanos:</p><pre>li:first-child { … }  /* el primero */\nli:last-child { … }   /* el último */</pre><p>Si la fila cambia de orden, la regla sigue acertando.</p>',
    objective: 'El primero de la fila, dorado. El último, de color <code>tomato</code>.',
    hint: '<code>li:first-child</code> y <code>li:last-child</code>',
    pieces: FILA,
    rules: [pick('li:first-child', GOLD), pick('li:last-child', 'background-color: tomato;'), GAP],
  },
  {
    id: 'b1-4',
    region: 1,
    title: '¡El tercero, un paso al frente!',
    variant: 'escribe el selector',
    showMarkup: true,
    width: 420,
    height: 340,
    allowed: [],
    concepts: [':nth-child()'],
    speech:
      '¡El TERCERO de la fila, un paso al frente! ¿Que cómo se llama? ¡Y yo qué sé! ¡El tercero! ¡Se cuenta, recluta, se cuenta!',
    theory:
      '<p><code>:nth-child(n)</code> selecciona por <b>número de orden</b> entre los hermanos, empezando en 1:</p><pre>li:nth-child(3) { … }  /* el tercero */</pre>',
    objective: 'El tercero de la fila, 60px hacia la derecha.',
    hint: '<code>li:nth-child(3)</code>',
    pieces: FILA,
    rules: [pick('li:nth-child(3)', 'margin-left: 60px;'), GAP],
  },
  {
    id: 'b1-5',
    region: 1,
    title: 'Pares, nones y de tres en tres',
    variant: 'escribe el selector',
    showMarkup: true,
    width: 420,
    height: 340,
    allowed: [],
    compare: BG,
    concepts: [':nth-child()'],
    speech:
      '¡Los PARES, de dorado! ¡Y uno de cada tres, un paso al frente! ¡Si alguno es par y además le toca, las dos cosas! ¡Esto es un ejército, no una verbena!',
    theory:
      '<p>Dentro de <code>:nth-child()</code> caben también palabras y fórmulas:</p><ul><li><code>even</code>: los pares. <code>odd</code>: los impares.</li><li><code>3n</code>: uno de cada tres (el 3.º, el 6.º, el 9.º…).</li><li><code>3n+1</code>: lo mismo, pero empezando por el primero.</li></ul><p>Es la forma de hacer listas «a rayas» sin tocar el HTML.</p>',
    objective:
      'Los que ocupan un puesto par, dorados. Y uno de cada tres (el 3.º y el 6.º), 60px a la derecha.',
    hint: '<code>li:nth-child(even)</code> y <code>li:nth-child(3n)</code>',
    pieces: FILA,
    rules: [pick('li:nth-child(even)', GOLD), pick('li:nth-child(3n)', 'margin-left: 60px;'), GAP],
  },
  {
    id: 'b1-6',
    region: 1,
    title: 'Todos menos los oficiales',
    variant: 'escribe el selector',
    showMarkup: true,
    width: 420,
    height: 340,
    allowed: [],
    concepts: [':not()'],
    speech:
      '¡Toda la fila, un paso al frente! ¡MENOS los oficiales, que para eso son oficiales! ¡No me hagas la lista de los que sí: dime los que NO!',
    theory:
      '<p><code>:not()</code> niega lo que pongas dentro: selecciona a los que <b>no</b> cumplen ese selector.</p><pre>li:not(.oficial) { … }</pre><p>«Los <code>li</code> que no llevan la clase <code>oficial</code>». Ahorra muchas clases de más.</p>',
    objective:
      'Todos los de la fila, 60px a la derecha, menos los que llevan la clase <code>oficial</code>.',
    hint: '<code>li:not(.oficial)</code>',
    pieces: [
      'ul@fila',
      [
        'li@oficial:Capitana Ana',
        'li:Blas',
        'li:Cleo',
        'li@oficial:Teniente Dimas',
        'li:Eva',
        'li:Fidel',
      ],
    ],
    rules: [pick('li:not(.oficial)', 'margin-left: 60px;'), GAP],
  },
  {
    id: 'b1-7',
    region: 1,
    title: 'La última orden manda',
    width: 440,
    height: 190,
    allowed: ['width'],
    concepts: ['cascada'],
    speech:
      '¡Ayer dije doscientos sesenta de ancho! ¡HOY digo ciento cincuenta! ¿Que cuál vale? ¡LA ÚLTIMA, recluta, siempre la última! ¡Y no me borres la de ayer, que es historia militar!',
    theory:
      '<p>Cuando dos declaraciones <b>chocan</b> —misma propiedad, mismo elemento— y sus selectores pesan lo mismo, gana <b>la que está escrita más abajo</b>. Esa regla de desempate se llama <b>cascada</b>, y da nombre al lenguaje: <i>Cascading Style Sheets</i>.</p><p>Por eso el orden en que escribes las reglas importa.</p>',
    objective: 'Los reclutas miden <b>150px</b> de ancho, sin tocar la primera regla.',
    hint: 'En la segunda regla: <code>width: 150px;</code>',
    pieces: ['p@recluta:Blas', 'p@recluta:Cleo', 'p@recluta:Eva'],
    rules: [
      fixed('.recluta', 'width: 260px;'),
      { selector: '.recluta', solution: 'width: 150px;' },
      GAP,
    ],
  },
  {
    id: 'b1-8',
    region: 1,
    title: 'Quién pesa más',
    variant: 'escribe el selector',
    showMarkup: true,
    width: 440,
    height: 190,
    allowed: [],
    concepts: ['especificidad', 'cascada'],
    speech:
      '¡Última lección! Mi orden está escrita ARRIBA y las otras dos, debajo. Tendría que perder… ¡pero una orden con nombre propio pesa más que cien órdenes generales! ¡Que la veterana mida trescientos!',
    theory:
      '<p>Antes que el orden, cuenta el <b>peso</b> del selector, su <b>especificidad</b>:</p><ul><li>un <b>id</b> pesa más que cualquier número de clases;</li><li>una <b>clase</b> (o una pseudo-clase) pesa más que cualquier número de tipos;</li><li>un <b>tipo</b> es lo que menos pesa.</li></ul><p>Solo cuando dos selectores <b>pesan igual</b> decide el orden. Aquí tu regla va la primera: con un selector de tipo perdería; con uno más pesado, gana.</p>',
    objective:
      'La veterana mide <b>300px</b>; la otra recluta, 200px; el visitante, 120px. Solo puedes escribir el selector de la primera regla.',
    earlyHints: [
      'Tu regla está escrita la primera: a igualdad de peso, perdería contra las de abajo. Necesitas un selector que pese más que una clase.',
    ],
    hint: 'El id pesa más que la clase y que el tipo: <code>#veterana</code>',
    pieces: ['p@recluta#veterana:Veterana', 'p@recluta:Recluta', 'p:Visitante'],
    rules: [
      pick('#veterana', 'width: 300px;'),
      fixed('.recluta', 'width: 200px;'),
      fixed('p', 'width: 120px;'),
      GAP,
    ],
  },
  {
    id: 'b1-9',
    region: 1,
    title: 'Revista nocturna',
    variant: 'a oscuras',
    mirage: true,
    className: 'oscuras',
    showMarkup: true,
    width: 440,
    height: 440,
    allowed: [],
    compare: BG,
    concepts: ['hijo', ':last-child'],
    speech:
      '¡Revista nocturna! ¡Y SIN FAROLES, que gastan aceite! Te lo digo de viva voz: los que forman directamente en el cuartel, de dorado. Y el último de la fila de guardia, un paso al frente. ¡Si no ves, CUENTA!',
    theory:
      '<p><b>A oscuras:</b> la silueta solo asoma a ratos. Tienes el HTML debajo: léelo como un plano. <code>&gt;</code> para los hijos directos y <code>:last-child</code> para el último de sus hermanos.</p>',
    objective:
      'Los párrafos que son <b>hijos directos</b> de <code>.cuartel</code>, dorados. El <b>último</b> <code>li</code> de la fila, 60px a la derecha.',
    earlyHints: [
      'El castigado está dentro del banquillo, y el banquillo dentro del cuartel: es un nieto. Y al último de la fila no hace falta contarlo.',
    ],
    hint: '<code>.cuartel &gt; p</code> y <code>li:last-child</code>',
    pieces: [
      'section@cuartel',
      ['p:Recluta Uno', 'p:Recluta Dos', 'div@banquillo', ['p:Recluta castigado']],
      'ul@fila',
      ['li:Ana', 'li:Blas', 'li:Cleo'],
    ],
    rules: [pick('.cuartel > p', GOLD), pick('li:last-child', 'margin-left: 60px;'), GAP],
    farewell:
      '¡DESCANSEN! Ya sabes a quién mandas y qué orden gana. ¡Ahora al Taller de Tintas, a aprender qué se puede mandar! ¡Y no manches el uniforme!',
  },
  //Region 2 · EL TALLER DE TINTAS
  {
    id: 'b2-1',
    region: 2,
    title: 'Tintas con nombre',
    tokenSize: [84, 110],
    width: 420,
    height: 190,
    allowed: ['background-color'],
    compare: BG,
    concepts: ['colores'],
    speech:
      '¡Ah, una aprendiza! Pasa, pasa, pero no toques nada. Tres telas en crudo y tres tintas que tienen nombre propio: tomate, oro y azul acero. ¡El color es lo único que importa en esta vida!',
    theory:
      '<p><code>background-color</code> pinta el <b>fondo</b> de un elemento. La forma más directa de decir un color es por su <b>nombre</b> en inglés: CSS conoce unos 140.</p><pre>background-color: tomato;</pre><p>Algunos: <code>gold</code>, <code>steelblue</code>, <code>crimson</code>, <code>teal</code>, <code>orchid</code>, <code>white</code>, <code>black</code>…</p>',
    objective:
      'La primera tela, <code>tomato</code>; la segunda, <code>gold</code>; la tercera, <code>steelblue</code>.',
    hint: '<code>background-color: tomato;</code>, <code>gold</code> y <code>steelblue</code>.',
    pieces: ['tela@roja', 'tela@dorada', 'tela@azul'],
    rules: [
      inRow('.tela'),
      { selector: '.roja', solution: 'background-color: tomato;' },
      { selector: '.dorada', solution: 'background-color: gold;' },
      { selector: '.azul', solution: 'background-color: steelblue;' },
    ],
  },
  {
    id: 'b2-2',
    region: 2,
    title: 'Tintas en clave',
    tokenSize: [84, 110],
    width: 420,
    height: 190,
    allowed: ['background-color'],
    compare: BG,
    concepts: ['colores', 'hex', 'rgb()', 'hsl()'],
    speech:
      'Los nombres son para turistas. Los maestros mezclamos: tanto de rojo, tanto de verde, tanto de azul. Tengo tres recetas, cada una escrita en un idioma distinto. ¡Síguelas al pie de la letra!',
    theory:
      '<p>Con 140 nombres no llega. Hay tres formas de escribir <b>cualquier</b> color:</p><ul><li><b>Hexadecimal</b>: <code>#e67e22</code>. Dos cifras para el rojo, dos para el verde y dos para el azul, de <code>00</code> a <code>ff</code>.</li><li><b>rgb()</b>: <code>rgb(46, 204, 113)</code>. Lo mismo, de 0 a 255.</li><li><b>hsl()</b>: <code>hsl(270 60% 55%)</code>. Tono (un ángulo del círculo de color), saturación y luminosidad.</li></ul>',
    objective:
      'Primera tela: <code>#e67e22</code>. Segunda: <code>rgb(46, 204, 113)</code>. Tercera: <code>hsl(270 60% 55%)</code>.',
    hint: 'Copia cada receta tal cual tras <code>background-color:</code>',
    pieces: ['tela@hex', 'tela@rgb', 'tela@hsl'],
    checks: [
      { rule: 1, pattern: /#[0-9a-f]{3,8}\b/i, message: 'La primera, en hexadecimal' },
      { rule: 2, pattern: /rgb\(/i, message: 'La segunda, con <code>rgb()</code>' },
      { rule: 3, pattern: /hsl\(/i, message: 'La tercera, con <code>hsl()</code>' },
    ],
    rules: [
      inRow('.tela'),
      { selector: '.hex', solution: 'background-color: #e67e22;' },
      { selector: '.rgb', solution: 'background-color: rgb(46, 204, 113);' },
      { selector: '.hsl', solution: 'background-color: hsl(270 60% 55%);' },
    ],
  },
  {
    id: 'b2-3',
    region: 2,
    title: 'Tinta para las letras',
    width: 440,
    height: 170,
    allowed: ['color', 'background-color'],
    compare: ['color', 'background-color'],
    concepts: ['colores', 'rgb()'],
    speech:
      'El rótulo del taller, criatura: letras blancas sobre carmesí, que se vea desde el puerto. Y el lema, debajo, en negro aguado. Aguado, no gris: negro con la mitad de tinta.',
    theory:
      '<p><code>color</code> pinta <b>el texto</b> (y solo el texto). <code>background-color</code>, lo de detrás.</p><p>Un color puede ser <b>medio transparente</b>: añade la opacidad, de 0 a 1, tras una barra.</p><pre>color: rgb(0 0 0 / 0.5);</pre><p>Eso es negro al 50%: deja ver lo que hay debajo. También se escribe <code>rgba(0, 0, 0, 0.5)</code>.</p>',
    objective:
      'El rótulo: letras <code>white</code> sobre fondo <code>crimson</code>. El lema: letras negras al 50%, <code>rgb(0 0 0 / 0.5)</code>.',
    hint: 'En <code>.rotulo</code>: <code>color: white;</code> y <code>background-color: crimson;</code>. En <code>.lema</code>: <code>color: rgb(0 0 0 / 0.5);</code>',
    pieces: ['h2@rotulo:Tintorería Bermellón', 'p@lema:Teñimos hasta las nubes'],
    rules: [
      { selector: '.rotulo', solution: 'color: white;\nbackground-color: crimson;' },
      { selector: '.lema', solution: 'color: rgb(0 0 0 / 0.5);' },
      GAP,
    ],
  },
  {
    id: 'b2-4',
    region: 2,
    title: 'Varas de medir',
    widths: [360, 520],
    height: 190,
    allowed: ['width'],
    concepts: ['px', '%'],
    speech:
      'Para cortar tela hacen falta varas. Tengo una de madera, que mide lo que mide, y dos de goma, que se estiran con la mesa. Estira la mesa y verás la diferencia.',
    theory:
      '<p>Las medidas llevan <b>unidad</b>, pegada al número y sin espacio.</p><ul><li><code>px</code> es una medida <b>absoluta</b>: 150px son 150px en cualquier sitio.</li><li><code>%</code> es <b>relativa</b>: un tanto por ciento de lo que mide <b>el elemento que la contiene</b>. Si el contenedor cambia, ella cambia.</li></ul><p>Usa los botones de tamaño para ensanchar el tablero.</p>',
    objective:
      'La vara fija, de <b>150px</b>. La media vara, del <b>50%</b> del tablero, y el cuarto de vara, del <b>25%</b>, con los dos tamaños de tablero.',
    hint: '<code>width: 150px;</code>, <code>width: 50%;</code> y <code>width: 25%;</code>',
    pieces: ['div@fija:fija', 'div@media:media', 'div@cuarto:cuarto'],
    rules: [
      { selector: '.fija', solution: 'width: 150px;' },
      { selector: '.media', solution: 'width: 50%;' },
      { selector: '.cuarto', solution: 'width: 25%;' },
      GAP,
    ],
  },
  {
    id: 'b2-5',
    region: 2,
    title: 'La vara que crece con la letra',
    width: 460,
    height: 210,
    allowed: ['width'],
    concepts: ['em', 'rem'],
    speech:
      'Hay una vara más rara todavía: mide según lo grande que sea la letra de quien la lleva. Diez letras de ancho, sea la letra que sea. Y luego está la vara patrón, que solo obedece a la letra de la casa.',
    theory:
      '<p>Dos unidades relativas al <b>tamaño de letra</b>:</p><ul><li><code>em</code>: el tamaño de letra <b>del propio elemento</b>. Con letra de 12px, <code>10em</code> son 120px; con letra de 24px, 240px.</li><li><code>rem</code>: el tamaño de letra <b>de la raíz de la página</b> (16px si nadie lo cambia). <code>10rem</code> son 160px en cualquier parte.</li></ul><p>Con ellas, si alguien agranda la letra, todo crece a la vez.</p>',
    objective:
      'Las dos varas, de <b>10em</b>: cada una sale de un ancho distinto. La vara patrón, de <b>10rem</b>.',
    hint: '<code>width: 10em;</code> en <code>.vara</code> y <code>width: 10rem;</code> en <code>.patron</code>.',
    pieces: [
      'div@vara.chica:letra de 12px',
      'div@vara.grande:letra de 24px',
      'div@patron:letra de 24px',
    ],
    checks: [
      { rule: 2, pattern: /\dem\b/, message: 'Las varas, en <code>em</code>' },
      { rule: 3, pattern: /\drem\b/, message: 'La vara patrón, en <code>rem</code>' },
    ],
    rules: [
      fixed('.chica', 'font-size: 12px;'),
      fixed('.grande', 'font-size: 24px;'),
      { selector: '.vara', solution: 'width: 10em;' },
      { selector: '.patron', fixed: 'font-size: 24px;', solution: 'width: 10rem;' },
      GAP,
    ],
  },
  {
    id: 'b2-6',
    region: 2,
    title: 'Marcos y ribetes',
    tokenSize: [110, 70],
    width: 480,
    height: 170,
    allowed: [
      'border',
      'border-width',
      'border-style',
      'border-color',
      'border-bottom',
      'border-radius',
    ],
    compare: BORDER,
    concepts: ['shorthand'],
    speech:
      'Una tela sin ribete es un trapo. A la primera, marco azul real de puntadas. A la segunda, marco carmesí y forma de sello, redonda. A la tercera, solo un ribete dorado por abajo.',
    theory:
      '<p>El borde tiene <b>grosor</b>, <b>estilo</b> y <b>color</b>, y casi siempre se escriben juntos con el atajo <code>border</code>:</p><pre>border: 6px dashed royalblue;</pre><p>Estilos: <code>solid</code> (continuo), <code>dashed</code> (a rayas), <code>dotted</code> (a puntos), <code>double</code>… Puedes dar borde a un solo lado con <code>border-bottom</code>, <code>border-left</code>…</p><p><code>border-radius</code> redondea las esquinas: con <code>50%</code>, una caja se vuelve un óvalo.</p>',
    objective:
      '<code>.marco</code>: borde de 6px, a rayas, <code>royalblue</code>. <code>.sello</code>: borde de 4px, continuo, <code>crimson</code>, y esquinas al 50%. <code>.ribete</code>: solo el borde de abajo, de 8px, continuo, <code>gold</code>.',
    hint: '<code>border: 6px dashed royalblue;</code> · <code>border: 4px solid crimson;</code> y <code>border-radius: 50%;</code> · <code>border-bottom: 8px solid gold;</code>',
    pieces: ['tela@marco', 'tela@sello', 'tela@ribete'],
    rules: [
      inRow('.tela'),
      { selector: '.marco', solution: 'border: 6px dashed royalblue;' },
      { selector: '.sello', solution: 'border: 4px solid crimson;\nborder-radius: 50%;' },
      { selector: '.ribete', solution: 'border-bottom: 8px solid gold;' },
    ],
  },
  {
    id: 'b2-7',
    region: 2,
    title: 'Estampados',
    tokenSize: [150, 110],
    width: 420,
    height: 190,
    allowed: ['background-repeat', 'background-position', 'background-size'],
    compare: ['background-repeat', 'background-position', 'background-size'],
    concepts: [],
    speech:
      'Y para terminar, el estampado de cerezos, mi obra maestra. En el pañuelo quiero una sola flor, pequeña y en el centro. En el mantel, que el estampado lo cubra entero, sin repetirse.',
    theory:
      '<p><code>background-image: url(…)</code> pone una <b>imagen de fondo</b>. Sola, se pinta a su tamaño y se <b>repite</b> como un mosaico. Tres propiedades la doman:</p><ul><li><code>background-repeat: no-repeat;</code> una sola vez.</li><li><code>background-position: center;</code> dónde se coloca (<code>top</code>, <code>right</code>, <code>center</code>…).</li><li><code>background-size</code>: una medida (<code>60px</code>), o <code>cover</code> para que <b>cubra</b> la caja entera, o <code>contain</code> para que <b>quepa</b> entera.</li></ul>',
    objective:
      'El pañuelo: la imagen una sola vez, centrada, de <b>60px</b>. El mantel: la imagen cubriéndolo entero (<code>cover</code>), centrada y sin repetir.',
    hint: 'Pañuelo: <code>background-repeat: no-repeat;</code>, <code>background-position: center;</code> y <code>background-size: 60px;</code>. Mantel: lo mismo con <code>background-size: cover;</code>',
    pieces: ['tela@panuelo', 'tela@mantel'],
    rules: [
      inRow('.tela'),
      fixed('.tela', `background-image: url(${seal});`),
      {
        selector: '.panuelo',
        solution:
          'background-repeat: no-repeat;\nbackground-position: center;\nbackground-size: 60px;',
      },
      {
        selector: '.mantel',
        solution:
          'background-repeat: no-repeat;\nbackground-position: center;\nbackground-size: cover;',
      },
    ],
  },
  {
    id: 'b2-8',
    region: 2,
    title: 'Pedido de palacio',
    variant: 'contra reloj',
    timeLimit: 80,
    className: 'tinta',
    tokenSize: [84, 110],
    width: 420,
    height: 190,
    allowed: [
      'background-color',
      'border',
      'border-width',
      'border-style',
      'border-color',
      'border-radius',
    ],
    compare: [...BG, ...BORDER],
    concepts: ['colores', 'shorthand'],
    timeMessages: {
      expired: `¡La tinta ha hervido! ${refill('Aparta el caldero')} y vuelve a intentarlo.`,
      late: 'Entregado, aunque con la tinta algo pasada. Repítelo a tiempo y sin pistas para dominarlo.',
    },
    speech:
      '¡Un pedido de palacio y la tinta ya está en el fuego! Si hierve, se echa a perder. La capa, carmesí con ribete dorado. El escudo, azul acero y redondo. La faja, dorada. ¡Corre, criatura, que yo remuevo!',
    theory:
      '<p><b>Contra reloj:</b> la tinta sube en cuanto empiezas a escribir. Recuerda el atajo del borde —<b>grosor, estilo y color</b>— y que <code>border-radius: 50%</code> redondea la caja entera.</p>',
    objective:
      '<code>.capa</code>: fondo <code>crimson</code> y borde de 4px, continuo, <code>gold</code>. <code>.escudo</code>: fondo <code>steelblue</code> y esquinas al 50%. <code>.faja</code>: fondo <code>gold</code>.',
    hint: '<code>background-color: crimson;</code> y <code>border: 4px solid gold;</code> · <code>background-color: steelblue;</code> y <code>border-radius: 50%;</code> · <code>background-color: gold;</code>',
    pieces: ['tela@capa', 'tela@escudo', 'tela@faja'],
    rules: [
      inRow('.tela'),
      { selector: '.capa', solution: 'background-color: crimson;\nborder: 4px solid gold;' },
      { selector: '.escudo', solution: 'background-color: steelblue;\nborder-radius: 50%;' },
      { selector: '.faja', solution: 'background-color: gold;' },
    ],
    farewell:
      '¡Magnífico! Casi tan bueno como yo a tu edad. Llévale estas tintas a Doña Serifa, la de la Imprenta. Y dile que la Garamond está sobrevalorada. No, mejor no se lo digas.',
  },
  //Region 3 · LA IMPRENTA
  {
    id: 'b3-1',
    region: 3,
    title: 'Tipos de imprenta',
    width: 460,
    height: 210,
    allowed: ['font-family', 'font-size'],
    compare: ['font-family', 'font-size'],
    concepts: ['px'],
    speech:
      'Buenos días. Límpiese los zapatos. En esta casa la letra no es un adorno: es la voz del texto. El titular del Heraldo va en letra con remates, grande. La noticia, en letra de máquina.',
    theory:
      '<p><code>font-family</code> elige la <b>familia de letra</b>. Se da una <b>lista</b> separada por comas: el navegador usa la primera que tenga instalada. La última debe ser siempre una familia <b>genérica</b>:</p><ul><li><code>serif</code>: con remates.</li><li><code>sans-serif</code>: de palo seco.</li><li><code>monospace</code>: todas las letras igual de anchas.</li></ul><pre>font-family: Georgia, serif;</pre><p><code>font-size</code> es el <b>tamaño</b>: <code>32px</code>, <code>1.5em</code>…</p>',
    objective:
      'El titular: <code>Georgia, serif</code> a <b>32px</b>. La noticia: <code>monospace</code> a <b>14px</b>.',
    hint: 'Titular: <code>font-family: Georgia, serif;</code> y <code>font-size: 32px;</code>. Noticia: <code>font-family: monospace;</code> y <code>font-size: 14px;</code>',
    pieces: [
      'h2@titular:El Heraldo de la Isla',
      'p@noticia:Hoy zarpa la Capitana rumbo a las Ruinas.',
    ],
    rules: [
      { selector: '.titular', solution: 'font-family: Georgia, serif;\nfont-size: 32px;' },
      { selector: '.noticia', solution: 'font-family: monospace;\nfont-size: 14px;' },
      GAP,
    ],
  },
  {
    id: 'b3-2',
    region: 3,
    title: 'Gritos y susurros',
    width: 460,
    height: 230,
    allowed: ['font-weight', 'font-style', 'text-decoration', 'text-transform'],
    compare: ['font-weight', 'font-style', 'text-decoration-line', 'text-transform'],
    concepts: [],
    speech:
      'Un buen impreso se oye. El aviso se grita: en negrita y en mayúsculas. El rumor se susurra: en cursiva. La errata se tacha, con dignidad. Y la firma se subraya.',
    theory:
      '<p>Cuatro propiedades cambian el <b>tono</b> de la letra:</p><ul><li><code>font-weight: bold;</code> negrita (<code>normal</code> la quita).</li><li><code>font-style: italic;</code> cursiva.</li><li><code>text-transform: uppercase;</code> todo en mayúsculas, sin reescribir el texto.</li><li><code>text-decoration: underline;</code> subrayado; <code>line-through</code>, tachado; <code>none</code> lo quita.</li></ul>',
    objective:
      '<code>.aviso</code>: negrita y en mayúsculas. <code>.rumor</code>: cursiva. <code>.errata</code>: tachada. <code>.firma</code>: subrayada.',
    hint: '<code>font-weight: bold;</code> y <code>text-transform: uppercase;</code> · <code>font-style: italic;</code> · <code>text-decoration: line-through;</code> · <code>text-decoration: underline;</code>',
    pieces: [
      'p@aviso:Se necesita aprendiz',
      'p@rumor:Dicen que el faro habla',
      'p@errata:Hoy es marte',
      'p@firma:Doña Serifa',
    ],
    rules: [
      { selector: '.aviso', solution: 'font-weight: bold;\ntext-transform: uppercase;' },
      { selector: '.rumor', solution: 'font-style: italic;' },
      { selector: '.errata', solution: 'text-decoration: line-through;' },
      { selector: '.firma', solution: 'text-decoration: underline;' },
      GAP,
    ],
  },
  {
    id: 'b3-3',
    region: 3,
    title: 'Aire entre líneas',
    width: 460,
    height: 300,
    allowed: ['text-align', 'line-height', 'letter-spacing'],
    compare: ['text-align', 'line-height', 'letter-spacing'],
    concepts: [],
    speech:
      'Ese párrafo está apelmazado: no se puede leer sin perder el renglón. Dele aire entre líneas. Y la cabecera, centrada y con las letras separadas, que es un periódico y no una lista de la compra.',
    theory:
      '<ul><li><code>text-align</code> alinea el texto dentro de su caja: <code>left</code>, <code>center</code>, <code>right</code> o <code>justify</code>.</li><li><code>line-height</code> es el <b>interlineado</b>. Mejor un número sin unidad: <code>1.8</code> significa 1,8 veces el tamaño de la letra.</li><li><code>letter-spacing</code> separa las letras entre sí: <code>4px</code>.</li></ul>',
    objective:
      'La cabecera: centrada, con <b>4px</b> entre letras. El párrafo: interlineado de <b>1.8</b> y alineado a la derecha.',
    hint: 'Cabecera: <code>text-align: center;</code> y <code>letter-spacing: 4px;</code>. Párrafo: <code>line-height: 1.8;</code> y <code>text-align: right;</code>',
    pieces: [
      'h2@cabecera:El Heraldo',
      'p@parrafo:La sargenta Hilera ha contado sus reclutas tres veces y le salen siete, ocho y seis. Se sospecha de la aritmética.',
    ],
    rules: [
      { selector: '.cabecera', solution: 'text-align: center;\nletter-spacing: 4px;' },
      { selector: '.parrafo', solution: 'line-height: 1.8;\ntext-align: right;' },
      GAP,
    ],
  },
  {
    id: 'b3-4',
    region: 3,
    title: 'Todo en un renglón',
    variant: 'regateo',
    purse: { total: 2, price: 2 },
    width: 460,
    height: 200,
    allowed: ['font', 'font-family', 'font-size', 'font-weight', 'font-style', 'line-height'],
    compare: ['font-family', 'font-size', 'font-weight', 'font-style', 'line-height'],
    concepts: ['shorthand'],
    purseMessage: 'Doña Serifa: «El plomo no es gratis. Con un solo renglón debería bastarle.»',
    speech:
      'El plomo está carísimo y solo le puedo fiar una línea de tipos. Cursiva, negrita, veinte píxeles, interlineado de uno y medio, Georgia. Todo en un renglón. Hay un atajo; búsquelo.',
    theory:
      '<p><b>Regateo:</b> solo te llega para una declaración. El atajo <code>font</code> junta la letra entera, <b>en este orden</b>:</p><pre>font: italic bold 20px/1.5 Georgia, serif;</pre><p>Estilo, grosor, <b>tamaño</b>/interlineado y <b>familia</b>. El tamaño y la familia son obligatorios; lo demás se puede omitir.</p>',
    objective:
      'El pregón: cursiva, negrita, <b>20px</b>, interlineado <b>1.5</b> y familia <code>Georgia, serif</code>, con una sola declaración.',
    hint: '<code>font: italic bold 20px/1.5 Georgia, serif;</code>',
    pieces: [
      'p@pregon:Se hace saber que la imprenta cierra los domingos, los lunes y cuando llueve.',
    ],
    rules: [{ selector: '.pregon', solution: 'font: italic bold 20px/1.5 Georgia, serif;' }],
  },
  {
    id: 'b3-5',
    region: 3,
    title: 'De padres a hijos',
    showMarkup: true,
    width: 460,
    height: 250,
    allowed: ['color', 'font-family'],
    compare: ['color', 'font-family'],
    concepts: ['herencia'],
    speech:
      'No pienso componer la misma letra renglón por renglón. Diga la letra y el color una sola vez, en la página, y que los renglones los hereden. Para eso tienen madre.',
    theory:
      '<p>Algunas propiedades se <b>heredan</b>: si se las das a un elemento, sus descendientes las reciben sin que escribas nada más. Son, sobre todo, las del <b>texto</b>: <code>color</code>, <code>font-family</code>, <code>font-size</code>, <code>line-height</code>, <code>text-align</code>…</p><p>Las de la <b>caja</b> no se heredan: <code>width</code>, <code>margin</code>, <code>padding</code>, <code>border</code> o el fondo se quedan en quien las recibe.</p><p>Por eso la letra de una web se define una sola vez, arriba del todo.</p>',
    objective:
      'Todo el texto de la página, de color <code>teal</code> y en <code>Georgia, serif</code>, escribiendo solo en <code>.pagina</code>.',
    hint: '<code>color: teal;</code> y <code>font-family: Georgia, serif;</code>',
    pieces: [
      'div@pagina',
      [
        'h2:Fe de erratas',
        'p:Donde dice «marte», debe decir «martes».',
        'p:Donde dice «la errata», no debe decir nada.',
      ],
    ],
    rules: [{ selector: '.pagina', solution: 'color: teal;\nfont-family: Georgia, serif;' }, GAP],
  },
  {
    id: 'b3-6',
    region: 3,
    title: 'El índice',
    showMarkup: true,
    width: 440,
    height: 460,
    allowed: ['list-style', 'list-style-type', 'padding', 'padding-left'],
    compare: ['list-style-type'],
    concepts: ['listas'],
    speech:
      'Y por último, las listas, que son media imprenta. El índice, con cuadraditos. Los pasos, numerados a la romana, que da empaque. Y los anuncios sueltos, sin viñeta ni sangría: limpios.',
    theory:
      '<p>Una lista <code>ul</code> pone una <b>viñeta</b> delante de cada elemento; una <code>ol</code>, un <b>número</b>. <code>list-style</code> elige cuál:</p><ul><li><code>disc</code>, <code>circle</code>, <code>square</code>: punto, aro o cuadrado.</li><li><code>decimal</code>, <code>upper-roman</code>, <code>lower-alpha</code>: 1, I, a…</li><li><code>none</code>: ninguna.</li></ul><p>La viñeta vive en la <b>sangría</b> de la lista, que es un <code>padding-left</code>: con <code>padding-left: 0</code> la lista se pega al borde.</p>',
    objective:
      '<code>.indice</code>: viñetas cuadradas (<code>square</code>). <code>.pasos</code>: números romanos en mayúscula (<code>upper-roman</code>). <code>.sueltos</code>: sin viñeta y sin sangría.',
    hint: '<code>list-style: square;</code> · <code>list-style: upper-roman;</code> · <code>list-style: none;</code> y <code>padding-left: 0;</code>',
    pieces: [
      'ul@indice',
      ['li:Portada', 'li:Sucesos'],
      'ol@pasos',
      ['li:Entintar', 'li:Prensar'],
      'ul@sueltos',
      ['li:Se vende prensa', 'li:Se busca corrector'],
    ],
    rules: [
      hidden('ul, ol', 'padding-left: 34px;\nmargin-bottom: 6px;'),
      hidden('li', 'overflow: visible;\nmargin-bottom: 4px;'),
      { selector: '.indice', solution: 'list-style: square;' },
      { selector: '.pasos', solution: 'list-style: upper-roman;' },
      { selector: '.sueltos', solution: 'list-style: none;\npadding-left: 0;' },
    ],
    farewell:
      'Correcto. Sobrio. Legible. Puede irse. En el Almacén, Tara le enseñará que cada letra, cada palabra y cada párrafo viven dentro de una caja. Límpiese los zapatos al salir.',
  },
  //Region 4 · EL ALMACÉN DE CAJAS
  {
    id: 'b4-1',
    region: 4,
    title: 'Contenido y relleno',
    width: 440,
    height: 220,
    allowed: ['width', 'height', 'padding'],
    concepts: ['modelo de caja'],
    speech:
      '¡Eh, tú, la nueva! Aquí todo va en cajas. Todo. Esta lleva loza: ciento sesenta por sesenta de hueco, y veinte de paja alrededor para que no se rompa. La paja va por dentro, ¿eh?',
    theory:
      '<p>Cada elemento es una <b>caja</b> con capas, de dentro afuera: el <b>contenido</b>, el <b>relleno</b> (<code>padding</code>), el <b>borde</b> (<code>border</code>) y el <b>margen</b> (<code>margin</code>).</p><p><code>width</code> y <code>height</code> miden <b>el contenido</b>. El <code>padding</code> es el espacio entre el contenido y el borde, <b>por dentro</b>: se pinta con el fondo de la caja y la hace más grande.</p><pre>padding: 20px;</pre>',
    objective:
      'El contenido de la caja mide <b>160px × 60px</b>, con <b>20px</b> de relleno por los cuatro lados.',
    hint: '<code>width: 160px;</code>, <code>height: 60px;</code> y <code>padding: 20px;</code>',
    pieces: ['caja:Loza'],
    rules: [{ selector: '.caja', solution: 'width: 160px;\nheight: 60px;\npadding: 20px;' }],
  },
  {
    id: 'b4-2',
    region: 4,
    title: 'Las cuentas de la estibadora',
    width: 440,
    height: 190,
    allowed: ['width'],
    concepts: ['modelo de caja'],
    speech:
      'El hueco de la estantería mide doscientos cuarenta justos. La caja lleva quince de paja y cinco de tabla por cada lado. ¿Cuánto tiene que medir el hueco de dentro? Las cuentas, de cabeza, que aquí no hay ábaco.',
    theory:
      '<p>Lo que una caja <b>ocupa</b> de lado a lado es la suma de todo:</p><pre>ancho total = width\n            + padding izquierdo + padding derecho\n            + borde izquierdo + borde derecho</pre><p>Con 15px de relleno y 5px de borde <b>a cada lado</b>, la caja ocupa 40px más de lo que diga <code>width</code>.</p>',
    objective:
      'La caja debe ocupar <b>240px en total</b>, contando el relleno (15px) y el borde (5px). Calcula su <code>width</code>.',
    earlyHints: [
      'El relleno y el borde cuentan dos veces: una por la izquierda y otra por la derecha. Réstaselos a los 240px.',
    ],
    hint: '240 − 15 − 15 − 5 − 5 = 200: <code>width: 200px;</code>',
    pieces: ['caja:Cristalería'],
    rules: [
      {
        selector: '.caja',
        fixed: 'padding: 15px;\nborder: 5px solid sienna;',
        solution: 'width: 200px;',
      },
    ],
  },
  {
    id: 'b4-3',
    region: 4,
    title: 'Que corra el aire',
    width: 440,
    height: 290,
    allowed: ['margin', 'margin-top', 'margin-bottom', 'margin-left', 'margin-right'],
    concepts: ['modelo de caja', 'shorthand'],
    speech:
      'Las cajas, sin tocarse, que luego se rozan y me descuentan del jornal. Doce por arriba y por abajo, cuarenta por los lados. Y la de pólvora, cuarenta por encima. Lejos. Muy lejos.',
    theory:
      '<p>El <code>margin</code> es el espacio <b>por fuera</b> del borde: separa la caja de sus vecinas y es siempre transparente.</p><p>El atajo admite de uno a cuatro valores:</p><ul><li><code>margin: 12px;</code> los cuatro lados.</li><li><code>margin: 12px 40px;</code> arriba y abajo · izquierda y derecha.</li><li><code>margin: 1px 2px 3px 4px;</code> arriba, derecha, abajo, izquierda (como las agujas del reloj).</li></ul><p>Un detalle: entre dos cajas apiladas, los márgenes de arriba y abajo <b>no se suman</b>; se queda el mayor.</p>',
    objective:
      'Todas las cajas: <b>12px</b> de margen arriba y abajo y <b>40px</b> a los lados. La de pólvora, además, <b>40px</b> por arriba.',
    hint: '<code>margin: 12px 40px;</code> en <code>.caja</code> y <code>margin-top: 40px;</code> en <code>.polvora</code>.',
    pieces: ['caja:Loza', 'caja:Tinta', 'caja@polvora:Pólvora'],
    rules: [
      { selector: '.caja', solution: 'margin: 12px 40px;' },
      { selector: '.polvora', solution: 'margin-top: 40px;' },
    ],
  },
  {
    id: 'b4-4',
    region: 4,
    title: 'La caja que no engorda',
    width: 440,
    height: 200,
    allowed: ['box-sizing'],
    concepts: ['modelo de caja'],
    speech:
      'Estoy harta de hacer sumas. Pido una caja de doscientos, le pongo paja y tabla y me sale de doscientos cincuenta y dos. Hay una runa que hace que doscientos sea doscientos, con todo dentro.',
    theory:
      '<p><code>box-sizing</code> decide <b>qué mide</b> <code>width</code>:</p><ul><li><code>content-box</code> (de fábrica): solo el contenido. El relleno y el borde se <b>añaden</b>.</li><li><code>border-box</code>: la caja <b>entera</b>, hasta el borde. El relleno y el borde se <b>descuentan</b> por dentro.</li></ul><p>Con <code>border-box</code>, una caja de 200px mide 200px. Por eso casi todo el mundo lo activa para toda la página.</p>',
    objective:
      'La caja ocupa <b>200px en total</b>, sin tocar su <code>width</code>, su relleno ni su borde.',
    hint: '<code>box-sizing: border-box;</code>',
    pieces: ['caja:Porcelana'],
    rules: [
      {
        selector: '.caja',
        fixed: 'width: 200px;\npadding: 20px;\nborder: 6px solid sienna;',
        solution: 'box-sizing: border-box;',
      },
    ],
  },
  {
    id: 'b4-5',
    region: 4,
    title: 'En el centro del pasillo',
    width: 460,
    height: 180,
    allowed: ['margin', 'margin-left', 'margin-right'],
    concepts: ['margin auto'],
    speech:
      'La caja grande, en el centro exacto del pasillo, para que pasen las carretillas por los dos lados. No me midas nada: que el sitio que sobre se reparta solo.',
    theory:
      '<p>En un margen lateral, el valor <code>auto</code> significa «<b>todo el espacio que sobre</b>». Si lo pones a los <b>dos lados</b>, el sobrante se reparte a partes iguales y la caja queda <b>centrada</b>:</p><pre>margin: 0 auto;</pre><p>Solo funciona si la caja tiene un <code>width</code>: sin ancho ocupa todo el hueco y no sobra nada que repartir.</p>',
    objective: 'La caja, de 220px, centrada en el tablero.',
    hint: '<code>margin: 0 auto;</code>',
    pieces: ['caja:Ancla de repuesto'],
    rules: [{ selector: '.caja', fixed: 'width: 220px;', solution: 'margin: 0 auto;' }],
  },
  {
    id: 'b4-6',
    region: 4,
    title: 'Ni un palmo más',
    widths: [300, 560],
    height: 180,
    allowed: ['max-width', 'width', 'margin', 'margin-left', 'margin-right'],
    concepts: ['margin auto'],
    speech:
      'Última caja. En el almacén pequeño, que ocupe todo el pasillo. En el grande, que no pase de cuatrocientos, y centrada. Una sola caja para los dos almacenes, que no tengo dos.',
    theory:
      '<p><code>max-width</code> pone un <b>tope</b>: la caja ocupa lo que haya, pero nunca más que eso.</p><pre>max-width: 400px;\nmargin: 0 auto;</pre><p>En pantallas estrechas la caja se adapta; en las anchas se queda en 400px y los márgenes <code>auto</code> la centran. Es el esqueleto de casi todas las páginas web.</p>',
    objective:
      'Con 300px, la caja ocupa todo el ancho. Con 560px, se queda en <b>400px</b> y centrada.',
    hint: '<code>max-width: 400px;</code> y <code>margin: 0 auto;</code>',
    pieces: ['caja:Velas y aparejos'],
    rules: [{ selector: '.caja', solution: 'max-width: 400px;\nmargin: 0 auto;' }],
  },
  {
    id: 'b4-7',
    region: 4,
    title: 'La partitura',
    variant: 'musical',
    musical: true,
    width: 440,
    height: 230,
    allowed: ['margin-top'],
    concepts: ['modelo de caja'],
    speech:
      'Mira lo que había al fondo del almacén: las campanas del viejo carillón. Suenan según lo altas que cuelguen. Las agudas, arriba del todo; las medias, a cuarenta; las graves, a ochenta. Cuélgalas bien y te toco algo.',
    theory:
      '<p><code>margin-top</code> empuja una caja <b>hacia abajo</b>, separándola de lo que tiene encima. Con márgenes distintos, unas cajas iguales quedan a alturas distintas, como las notas en un pentagrama.</p><p><b>Nivel musical:</b> cada campana suena al llegar a su altura. Cuando estén todas, oirás la melodía entera.</p>',
    objective:
      'Las campanas <code>.medio</code>, <b>40px</b> más abajo. Las <code>.bajo</code>, <b>80px</b> más abajo. Las <code>.alto</code> se quedan arriba.',
    hint: '<code>margin-top: 40px;</code> en <code>.medio</code> y <code>margin-top: 80px;</code> en <code>.bajo</code>.',
    pieces: ['campana@bajo', 'campana@medio', 'campana@alto', 'campana@medio', 'campana@alto'],
    rules: [
      hidden(
        '.campana',
        'display: inline-block;\nvertical-align: top;\nwidth: 52px;\nmargin: 0 4px;',
      ),
      fixed('.alto', 'margin-top: 0;'),
      { selector: '.medio', solution: 'margin-top: 40px;' },
      { selector: '.bajo', solution: 'margin-top: 80px;' },
    ],
    farewell:
      '¡Eso es! Hacía años que nadie las afinaba. En el almacén, hasta la música va en cajas.',
  },
  {
    id: 'b4-8',
    region: 4,
    title: 'La caja que rebosa',
    width: 440,
    height: 270,
    allowed: ['overflow', 'overflow-x', 'overflow-y'],
    compare: ['overflow-y'],
    concepts: ['modelo de caja'],
    speech:
      'Y lo último: el manifiesto no cabe en su caja y se me sale por abajo, encima de la de al lado. Lo que no quepa, que no se vea. Y el rollo de pedidos, que es largo de verdad, que se pueda bajar a leerlo.',
    theory:
      '<p>Cuando el contenido es más grande que su caja, por defecto <b>se sale</b> y se pinta por encima de lo que haya. <code>overflow</code> decide qué hacer con lo que sobra:</p><ul><li><code>visible</code> (de fábrica): se sale.</li><li><code>hidden</code>: se recorta y no se ve.</li><li><code>auto</code>: aparece una barra para <b>desplazarse</b>, solo si hace falta.</li><li><code>scroll</code>: la barra está siempre.</li></ul>',
    objective:
      'En <code>.manifiesto</code>, lo que no cabe se recorta. En <code>.rollo</code>, aparece una barra de desplazamiento cuando hace falta.',
    hint: '<code>overflow: hidden;</code> en <code>.manifiesto</code> y <code>overflow: auto;</code> en <code>.rollo</code>.',
    pieces: [
      'caja@manifiesto:Doce barriles de tinta, nueve fardos de lana, tres cajas de loza, un ancla de repuesto y un gato que no figura en ningún papel.',
      'caja@rollo:Pedido uno: tinta. Pedido dos: más tinta. Pedido tres: papel para apuntar los pedidos. Pedido cuatro: otro rollo, que este se acaba.',
    ],
    rules: [
      hidden('.caja', 'overflow: visible;\nmargin-bottom: 44px;'),
      fixed('.caja', 'width: 240px;\nheight: 44px;'),
      { selector: '.manifiesto', solution: 'overflow: hidden;' },
      { selector: '.rollo', solution: 'overflow: auto;' },
    ],
    farewell:
      '¡Así se estiba! Ya sabes lo que mide una caja por dentro y por fuera. Ahora baja al Canal: Remo te enseñará cómo se colocan unas junto a otras. Dile que me debe dos cuerdas.',
  },
  //Region 5 · EL CANAL
  {
    id: 'b5-1',
    region: 5,
    title: 'Cada boya, en su renglón',
    showMarkup: true,
    width: 500,
    height: 200,
    allowed: ['display'],
    concepts: ['bloque y en línea'],
    speech:
      'Buenas… Sin prisa, que el agua no la tiene. Esas boyas van una detrás de otra, como las palabras de una frase. Yo las quiero una debajo de otra, cada una en su renglón.',
    theory:
      '<p>Los elementos fluyen de dos maneras:</p><ul><li><b>En bloque</b> (<code>p</code>, <code>div</code>, <code>h1</code>…): empiezan en línea nueva y ocupan <b>todo el ancho</b> disponible.</li><li><b>En línea</b> (<code>span</code>, <code>a</code>, <code>strong</code>…): van <b>seguidos</b>, como palabras, y ocupan solo lo que mide su contenido.</li></ul><p><code>display</code> cambia ese comportamiento: <code>display: block;</code> convierte un elemento en bloque.</p>',
    objective: 'Cada <code>span</code>, en su propia línea y a todo lo ancho.',
    hint: '<code>display: block;</code>',
    pieces: ['span@boya:Roja', 'span@boya:Verde', 'span@boya:Blanca'],
    rules: [{ selector: '.boya', solution: 'display: block;' }],
  },
  {
    id: 'b5-2',
    region: 5,
    title: 'En fila india',
    showMarkup: true,
    width: 460,
    height: 180,
    allowed: ['display'],
    concepts: ['bloque y en línea'],
    speech:
      'Ahora al revés. Estas barcas son párrafos y cada una se me queda con un renglón entero. En el canal no cabe tanto señorío: en fila, una detrás de otra.',
    theory:
      '<p><code>display: inline;</code> hace que un elemento fluya <b>en línea</b>, pegado al anterior.</p><p>Pero tiene un precio: a un elemento en línea <b>no se le puede dar</b> <code>width</code> ni <code>height</code>, ni margen por arriba o por abajo. Mide lo que mide su contenido, y punto.</p>',
    objective: 'Las tres barcas, en la misma línea.',
    hint: '<code>display: inline;</code>',
    pieces: ['p@barca:Lenta', 'p@barca:Tercera', 'p@barca:Sardina'],
    missteps: [
      {
        selector: '.barca',
        when: { display: 'inline-block' },
        message:
          'Con <code>inline-block</code> también van en fila, pero siguen siendo cajas con medidas. Aquí deben fluir como palabras: <code>inline</code>.',
      },
    ],
    rules: [{ selector: '.barca', solution: 'display: inline;' }],
  },
  {
    id: 'b5-3',
    region: 5,
    title: 'Barcazas a medida',
    showMarkup: true,
    width: 460,
    height: 180,
    allowed: ['display', 'width', 'height'],
    concepts: ['bloque y en línea'],
    speech:
      'Las barcazas de carga van en fila, sí, pero todas del mismo tamaño: cien de eslora por cincuenta. Y a una barca en línea no se le puede decir cuánto mide… Hay un término medio. Siempre lo hay.',
    theory:
      '<p><code>display: inline-block;</code> es el término medio: el elemento va <b>en línea</b> con los demás, pero por dentro es un <b>bloque</b>, así que sí acepta <code>width</code>, <code>height</code> y márgenes.</p><pre>display: inline-block;\nwidth: 100px;\nheight: 50px;</pre>',
    objective: 'Las tres barcazas, en la misma línea, cada una de <b>100px × 50px</b>.',
    hint: '<code>display: inline-block;</code>, <code>width: 100px;</code> y <code>height: 50px;</code>',
    pieces: ['div@barcaza:Sal', 'div@barcaza:Lana', 'div@barcaza:Tinta'],
    rules: [
      { selector: '.barcaza', solution: 'display: inline-block;\nwidth: 100px;\nheight: 50px;' },
    ],
  },
  {
    id: 'b5-4',
    region: 5,
    title: 'Ni rastro del pirata',
    showMarkup: true,
    width: 440,
    height: 230,
    allowed: ['display'],
    concepts: [],
    speech:
      'Viene la inspección del puerto y ese de ahí no tiene papeles. No lo quiero tapado ni transparente: lo quiero fuera del canal, como si no hubiera venido nunca.',
    theory:
      '<p><code>display: none;</code> hace que el elemento <b>no exista</b> para el diseño: no se pinta y <b>no ocupa sitio</b>. Los demás se recolocan como si no estuviera.</p><p>No lo confundas con <code>visibility: hidden;</code>, que lo vuelve invisible pero le <b>guarda el hueco</b>.</p>',
    objective: 'La barca pirata desaparece y las demás ocupan su sitio.',
    hint: '<code>display: none;</code>',
    pieces: ['p:La Sardinera', 'p@pirata:La Calavera Alegre', 'p:La Lenta', 'p:La Tercera'],
    rules: [{ selector: '.pirata', solution: 'display: none;' }, GAP],
  },
  {
    id: 'b5-5',
    region: 5,
    title: 'Amarrar a un lado',
    showMarkup: true,
    width: 460,
    height: 230,
    allowed: ['float'],
    concepts: [],
    speech:
      'El sello del puerto va amarrado a la izquierda y el texto del permiso lo rodea, como el agua rodea una barca. Y la firma, amarrada a la derecha. Suéltalos, que floten.',
    theory:
      '<p><code>float</code> saca un elemento del flujo y lo <b>arrima a un lado</b> de su contenedor. Lo que viene detrás <b>lo rodea</b>, como el texto de un periódico rodea una foto.</p><pre>float: left;   /* a la izquierda */\nfloat: right;  /* a la derecha */</pre><p>Para eso nació. Durante años se usó también para maquetar páginas enteras; hoy eso se hace con Flexbox y Grid.</p>',
    objective:
      'El sello, flotando a la izquierda. La firma, flotando a la derecha. El texto, entre los dos.',
    hint: '<code>float: left;</code> en <code>.sello</code> y <code>float: right;</code> en <code>.firma</code>.',
    pieces: [
      'tablilla@sello',
      'tablilla@firma',
      'p:Se concede permiso de amarre a la barca La Lenta por tiempo indefinido, que es justo lo que tarda en llegar.',
    ],
    rules: [
      hidden('.tablilla', 'width: 64px;'),
      { selector: '.sello', solution: 'float: left;' },
      { selector: '.firma', solution: 'float: right;' },
    ],
  },
  {
    id: 'b5-6',
    region: 5,
    title: 'Aguas despejadas',
    showMarkup: true,
    width: 460,
    height: 250,
    allowed: ['clear'],
    concepts: [],
    speech:
      'Las barcas flotan a la izquierda, muy bien. Pero el muelle se me ha colado al lado de ellas, y un muelle no flota: va debajo, a todo lo ancho. Despéjale las aguas.',
    theory:
      '<p>Lo que viene después de un flotante intenta <b>ponerse a su lado</b>. <code>clear</code> se lo prohíbe: el elemento baja hasta quedar <b>por debajo</b> de los flotantes.</p><pre>clear: left;   /* de los que flotan a la izquierda */\nclear: both;   /* de todos */</pre>',
    objective: 'El muelle, por debajo de las tres barcas y a todo lo ancho.',
    hint: '<code>clear: both;</code>',
    pieces: ['div@barca:Sal', 'div@barca:Lana', 'div@barca:Tinta', 'div@muelle:Muelle de carga'],
    rules: [
      fixed('.barca', 'float: left;\nwidth: 70px;\nmargin: 0 8px 8px 0;'),
      { selector: '.muelle', solution: 'clear: both;' },
    ],
  },
  {
    id: 'b5-7',
    region: 5,
    title: 'Antes de que cierren la esclusa',
    variant: 'contra reloj',
    timeLimit: 70,
    className: 'marea',
    showMarkup: true,
    width: 460,
    height: 200,
    allowed: ['display', 'width', 'height'],
    concepts: ['bloque y en línea'],
    timeMessages: {
      expired: `Han cerrado la esclusa… ${refill('Pide que la abran')} y vuelve a intentarlo.`,
      late: 'Has pasado, aunque el esclusero ha tenido que esperarte. Repítelo a tiempo y sin pistas para dominarlo.',
    },
    speech:
      'Ay… van a cerrar la esclusa y yo con las barcazas sin colocar. Por una vez hay prisa. Las tres en fila, de noventa de ancho. Y la del ron… esa que no la vean, que no tiene papeles.',
    theory:
      '<p><b>Contra reloj:</b> el agua sube en cuanto empiezas a escribir. <code>inline-block</code> pone las cajas en fila y les deja tener medidas; <code>display: none</code> las quita de en medio sin dejar hueco.</p>',
    objective:
      'Las barcazas, en la misma línea y de <b>90px</b> de ancho. La del ron (<code>.pirata</code>), fuera: las otras dos ocupan su sitio.',
    hint: 'En <code>.barcaza</code>: <code>display: inline-block;</code> y <code>width: 90px;</code>. En <code>.pirata</code>: <code>display: none;</code>',
    pieces: [
      'div@barcaza:Sal',
      'div@barcaza.pirata:Ron',
      'div@barcaza:Lana',
      'div@muelle:Muelle de la esclusa',
    ],
    rules: [
      { selector: '.barcaza', solution: 'display: inline-block;\nwidth: 90px;' },
      { selector: '.pirata', solution: 'display: none;' },
    ],
    farewell:
      'Eso es… Unas cosas fluyen, otras flotan y otras se apartan. Como en la vida. Sube al Faro, que Fanal sabe poner cada cosa en su sitio exacto. Y no corras.',
  },
  //Region 6 · EL FARO
  {
    id: 'b6-1',
    region: 6,
    title: 'Un empujoncito',
    width: 440,
    height: 310,
    allowed: POSITION,
    concepts: [],
    speech:
      'Desde aquí arriba lo veo todo… y veo que la segunda señal está torcida. No la saques de su sitio: solo empújala un poco. Sesenta a la derecha y diez hacia arriba.',
    theory:
      '<p>De fábrica, todo elemento tiene <code>position: static</code>: está donde le toca en el flujo y no se puede mover.</p><p><code>position: relative</code> lo deja <b>en su sitio</b> —los demás no se enteran y le guardan el hueco—, pero permite <b>desplazarlo</b> desde ahí con <code>top</code>, <code>right</code>, <code>bottom</code> y <code>left</code>.</p><pre>position: relative;\nleft: 60px;   /* 60px desde su borde izquierdo */\ntop: -10px;   /* 10px hacia arriba */</pre>',
    objective:
      'La segunda señal, <b>60px</b> a la derecha y <b>10px</b> hacia arriba de donde está. Las otras no se mueven.',
    hint: '<code>position: relative;</code>, <code>left: 60px;</code> y <code>top: -10px;</code>',
    pieces: ['farol', 'farol@segunda', 'farol'],
    rules: [
      LAMPS,
      { selector: '.segunda', solution: 'position: relative;\nleft: 60px;\ntop: -10px;' },
      GAP,
    ],
  },
  {
    id: 'b6-2',
    region: 6,
    title: 'Fuera de la fila',
    width: 440,
    height: 310,
    allowed: POSITION,
    concepts: [],
    speech:
      'La linterna no puede estar en la fila con las demás señales: va arriba a la derecha, donde se vea desde el mar. Sácala de la fila. Las otras, que cierren el hueco.',
    theory:
      '<p><code>position: absolute</code> <b>saca</b> el elemento del flujo: los demás se colocan como si no existiera. Después lo sitúas con <code>top</code>, <code>right</code>, <code>bottom</code> y <code>left</code>, que ahora miden la distancia a los <b>bordes de su contenedor</b>.</p><pre>position: absolute;\ntop: 20px;\nright: 20px;</pre><p>«A 20px del borde de arriba y a 20px del borde derecho».</p>',
    objective:
      'La linterna, a <b>20px</b> del borde superior y a <b>20px</b> del borde derecho del tablero. Las otras señales suben a ocupar su hueco.',
    hint: '<code>position: absolute;</code>, <code>top: 20px;</code> y <code>right: 20px;</code>',
    pieces: ['farol', 'farol@linterna', 'farol'],
    missteps: [
      {
        selector: '.linterna',
        when: { position: 'relative' },
        message:
          'Con <code>relative</code> la linterna se mueve, pero sigue ocupando su hueco en la fila: las otras no suben. Para sacarla del todo hace falta <code>absolute</code>.',
      },
    ],
    rules: [
      LAMPS,
      { selector: '.linterna', solution: 'position: absolute;\ntop: 20px;\nright: 20px;' },
      GAP,
    ],
  },
  {
    id: 'b6-3',
    region: 6,
    title: 'El ancla de la posición',
    showMarkup: true,
    width: 440,
    height: 300,
    allowed: POSITION,
    concepts: [],
    speech:
      'La luz tiene que ir en la esquina de abajo de la torre. De la torre, no del tablero. Ahora mismo se me escapa a la esquina del mundo: le falta un ancla.',
    theory:
      '<p>Un elemento <code>absolute</code> se coloca respecto a su <b>antepasado posicionado</b> más cercano: el primero que no sea <code>static</code>. Si no hay ninguno, usa la página entera.</p><p>Por eso, el truco de siempre: dar <code>position: relative</code> al <b>contenedor</b> —sin moverlo— para que sirva de <b>ancla</b> a lo que lleva dentro.</p><pre>.torre { position: relative; }\n.luz   { position: absolute; right: 0; bottom: 0; }</pre>',
    objective: 'La luz, pegada a la esquina inferior derecha <b>de la torre</b>.',
    hint: '<code>position: relative;</code> en <code>.torre</code>. En <code>.luz</code>: <code>position: absolute;</code>, <code>right: 0;</code> y <code>bottom: 0;</code>',
    pieces: ['div@torre', ['farol@luz']],
    missteps: [
      {
        selector: '.torre',
        when: { position: 'static' },
        message:
          'La torre aún no es un ancla: mientras sea <code>static</code>, lo que lleve dentro con <code>absolute</code> se coloca respecto al tablero.',
      },
    ],
    rules: [
      {
        selector: '.torre',
        fixed: 'width: 220px;\nheight: 200px;',
        solution: 'position: relative;',
      },
      {
        selector: '.luz',
        fixed: 'width: 56px;',
        solution: 'position: absolute;\nright: 0;\nbottom: 0;',
      },
    ],
  },
  {
    id: 'b6-4',
    region: 6,
    title: 'Clavado en la ventana',
    showMarkup: true,
    width: 440,
    height: 300,
    allowed: POSITION,
    concepts: [],
    speech:
      'El aviso de niebla no es de la torre ni de nadie: es de la ventana por la que miras. Tiene que estar siempre arriba a la izquierda, pase lo que pase debajo.',
    theory:
      '<p><code>position: fixed</code> ancla el elemento a la <b>ventana del navegador</b>: no le importa quién lo contiene y <b>no se mueve aunque la página se desplace</b>. Así se hacen las barras que siempre están arriba y los botones que te siguen.</p><p>Aquí, el tablero hace de ventana. Fíjate en que la torre tiene <code>position: relative</code> y aun así el aviso la ignora.</p>',
    objective:
      'El aviso, fijo a <b>10px</b> del borde superior y a <b>10px</b> del borde izquierdo de la ventana (el tablero), aunque esté dentro de la torre.',
    hint: '<code>position: fixed;</code>, <code>top: 10px;</code> y <code>left: 10px;</code>',
    pieces: ['div@torre', ['bandera@aviso']],
    rules: [
      fixed(
        '.torre',
        'position: relative;\nwidth: 200px;\nheight: 180px;\nmargin: 60px 0 0 160px;',
      ),
      {
        selector: '.aviso',
        fixed: 'width: 56px;',
        solution: 'position: fixed;\ntop: 10px;\nleft: 10px;',
      },
    ],
  },
  {
    id: 'b6-5',
    region: 6,
    title: 'Borrón y cuenta nueva',
    className: 'crudo',
    showMarkup: true,
    width: 440,
    height: 430,
    allowed: ['margin', 'padding', 'box-sizing'],
    concepts: ['reset', 'universal'],
    speech:
      'Antes de levantar una página hay que limpiar el solar. Cada navegador trae sus manías: márgenes aquí, sangrías allá… Quítaselas todas de una vez y empieza desde cero.',
    theory:
      '<p>Los navegadores dan <b>estilos de fábrica</b> a muchas etiquetas: márgenes a los títulos y párrafos, sangría a las listas… y no todos dan los mismos. Por eso casi todas las hojas de estilo empiezan con un <b>reinicio universal</b>:</p><pre>* {\n  margin: 0;\n  padding: 0;\n  box-sizing: border-box;\n}</pre><p>Todo a cero y todas las cajas midiendo hasta el borde. A partir de ahí, cada espacio lo decides tú.</p>',
    objective: 'Todos los elementos sin margen, sin relleno y con <code>border-box</code>.',
    hint: '<code>margin: 0;</code>, <code>padding: 0;</code> y <code>box-sizing: border-box;</code>',
    pieces: [
      'h1:El Faro',
      'p:Abierto de noche.',
      'ul',
      ['li:Niebla', 'li:Tormenta'],
      'p:Cerrado de día.',
    ],
    rules: [{ selector: '*', solution: 'margin: 0;\npadding: 0;\nbox-sizing: border-box;' }],
  },
  {
    id: 'b6-6',
    region: 6,
    title: 'De arriba abajo',
    showMarkup: true,
    labels: false,
    width: 440,
    height: 360,
    allowed: ['height', 'min-height'],
    concepts: ['página base', '%'],
    speech:
      'Una página tiene cabecera, contenido y pie, como un faro tiene linterna, torre y base. Pero mira: la mía se queda encogida arriba. La quiero de arriba abajo de la ventana.',
    theory:
      '<p>La estructura de casi todas las páginas es <code>header</code>, <code>main</code> y <code>footer</code>. Sin más, cada uno mide <b>lo que ocupa su contenido</b>.</p><p>Una altura en <code>%</code> solo funciona si <b>el contenedor tiene una altura definida</b>. Por eso las páginas empiezan con <code>html, body { height: 100%; }</code>: así el 100% tiene de dónde medir.</p><p>Aquí la <code>.pagina</code> hace de <code>body</code>. En cuanto mida el 100% del tablero, el <code>main</code> —que ya pide «todo menos la cabecera y el pie»— podrá estirarse.</p>',
    objective:
      'La página ocupa todo el alto del tablero, y el contenido se estira entre la cabecera y el pie.',
    earlyHints: [
      'El <code>main</code> ya pide «el 100% menos 90px»… pero ¿el 100% de qué? Su contenedor, <code>.pagina</code>, todavía no tiene una altura definida.',
    ],
    hint: '<code>height: 100%;</code> en <code>.pagina</code>.',
    pieces: ['div@pagina', ['header:Cabecera', 'main:Contenido', 'footer:Pie']],
    rules: [
      BORDER_BOX,
      { selector: '.pagina', solution: 'height: 100%;' },
      fixed('header', 'height: 50px;'),
      fixed('main', 'height: calc(100% - 90px);'),
      fixed('footer', 'height: 40px;'),
    ],
  },
  {
    id: 'b6-7',
    region: 6,
    title: 'La página base',
    showMarkup: true,
    labels: false,
    widths: [340, 620],
    height: 360,
    allowed: ['margin', 'padding', 'box-sizing', 'height', 'max-width', 'width'],
    concepts: ['página base', 'reset', 'margin auto'],
    speech:
      'Ahora, lo que importa de verdad. Junta todo lo que sabes: solar limpio, página de arriba abajo, y una columna que no se estire más de la cuenta y quede en el centro. Esa es la página con la que empieza todo lo demás.',
    theory:
      '<p>La <b>página base</b> son tres ideas juntas:</p><ul><li>un <b>reinicio universal</b>: sin márgenes ni rellenos, y <code>border-box</code>;</li><li><b>altura del 100%</b>, para que la página llene la ventana;</li><li>una columna con <b>ancho máximo</b> y <code>margin: 0 auto</code>, que se adapta en pantallas pequeñas y queda centrada en las grandes.</li></ul><p>Todo lo que construyas en el continente irá dentro de una página así.</p>',
    objective:
      'Reinicio universal. La página ocupa el 100% del alto, no pasa de <b>420px</b> de ancho y queda centrada: prueba los dos tamaños.',
    earlyHints: [
      'Son tres ideas y ya las has usado todas: reinicio en <code>*</code>, altura del 100% y una columna con tope de ancho y márgenes automáticos.',
    ],
    hint: 'En <code>*</code>: <code>margin: 0;</code>, <code>padding: 0;</code> y <code>box-sizing: border-box;</code>. En <code>.pagina</code>: <code>height: 100%;</code>, <code>max-width: 420px;</code> y <code>margin: 0 auto;</code>',
    pieces: ['div@pagina', ['header:Cabecera', 'main:Contenido', 'footer:Pie']],
    rules: [
      { selector: '*', solution: 'margin: 0;\npadding: 0;\nbox-sizing: border-box;' },
      { selector: '.pagina', solution: 'height: 100%;\nmax-width: 420px;\nmargin: 0 auto;' },
      fixed('header', 'height: 50px;'),
      fixed('main', 'height: calc(100% - 90px);'),
      fixed('footer', 'height: 40px;'),
    ],
  },
  {
    id: 'b6-8',
    region: 6,
    title: 'Quién tapa a quién',
    width: 440,
    height: 290,
    allowed: ['z-index'],
    concepts: ['capas'],
    speech:
      'Tengo tres banderas de señales en el mismo mástil y se tapan unas a otras. Manda la que queda encima. Hoy toca la roja delante, la dorada detrás y la azul al fondo, y no pienso descolgarlas para cambiarlas de orden.',
    theory:
      '<p>Cuando varios elementos posicionados se <b>solapan</b>, queda encima el que va <b>más tarde en el HTML</b>. <code>z-index</code> cambia ese orden: es un número, y gana el <b>mayor</b>.</p><pre>z-index: 2;</pre><p>Solo funciona en elementos <b>posicionados</b> (con un <code>position</code> distinto de <code>static</code>). Piensa en él como la altura de cada hoja en un montón.</p>',
    objective: 'La bandera roja, por encima de la dorada; y la dorada, por encima de la azul.',
    hint: '<code>z-index: 2;</code> en <code>.roja</code> y <code>z-index: 1;</code> en <code>.dorada</code>.',
    pieces: ['tela@roja', 'tela@dorada', 'tela@azul'],
    above: [
      { upper: 'roja', lower: 'dorada', message: 'La roja queda por encima de la dorada' },
      { upper: 'dorada', lower: 'azul', message: 'La dorada queda por encima de la azul' },
    ],
    rules: [
      fixed('.tela', 'position: absolute;\nwidth: 150px;\nheight: 100px;'),
      {
        selector: '.roja',
        fixed: 'left: 50px;\ntop: 30px;\nbackground-color: tomato;',
        solution: 'z-index: 2;',
      },
      {
        selector: '.dorada',
        fixed: 'left: 130px;\ntop: 80px;\nbackground-color: gold;',
        solution: 'z-index: 1;',
      },
      { selector: '.azul', fixed: 'left: 210px;\ntop: 130px;\nbackground-color: steelblue;' },
    ],
  },
  {
    id: 'b6-9',
    region: 6,
    title: 'La noche del faro',
    variant: 'a oscuras',
    mirage: true,
    className: 'faro-noche',
    width: 440,
    height: 300,
    allowed: POSITION,
    concepts: [],
    speech:
      'Esta noche el faro alumbra a ratos: quiero ver si sabes colocar las luces de memoria. El farol, arriba a la derecha. La barca, abajo a la izquierda. Dieciséis de cada borde, ni uno más. El faro, donde está.',
    theory:
      '<p><b>A oscuras:</b> la silueta solo asoma cuando pasa el haz. Un elemento <code>absolute</code> se coloca midiendo desde los <b>bordes del tablero</b>: <code>top</code> y <code>bottom</code> para la altura, <code>left</code> y <code>right</code> para los lados.</p>',
    objective:
      'El farol, a <b>16px</b> del borde superior y del derecho. La barca, a <b>16px</b> del borde inferior y del izquierdo. El faro no se mueve de su sitio.',
    earlyHints: [
      'Las dos piezas salen del flujo con <code>position: absolute;</code>. Después, cada una necesita dos distancias: una vertical y una horizontal.',
    ],
    hint: 'Farol: <code>position: absolute;</code>, <code>top: 16px;</code> y <code>right: 16px;</code>. Barca: <code>position: absolute;</code>, <code>bottom: 16px;</code> y <code>left: 16px;</code>',
    pieces: ['farol', 'faro', 'barca'],
    rules: [
      hidden('.pieza', 'width: 64px;'),
      { selector: '.farol', solution: 'position: absolute;\ntop: 16px;\nright: 16px;' },
      { selector: '.barca', solution: 'position: absolute;\nbottom: 16px;\nleft: 16px;' },
    ],
    farewell:
      'Ya está. Reglas, selectores, cajas y posiciones: con eso se sostiene todo lo demás. Pero la isla es más grande de lo que parece desde aquí arriba: baja al Mercado de las Etiquetas, que Almoneda lleva toda la mañana subastando cosas sin saber cómo se llaman.',
  },
  //Region 11 · EL AULA MAGNA (prueba) · ids b7, from before the trail grew
  {
    id: 'b7-1',
    region: 11,
    title: 'Selectores rotos',
    exam: true,
    showMarkup: true,
    width: 440,
    height: 270,
    allowed: [],
    compare: BG,
    speech:
      'Siéntese. Un aprendiz anterior —no diré nombres— dejó esta hoja antes de marcharse. Las declaraciones están bien. Los selectores, no acierta ni uno. Arréglelos.',
    objective:
      'El título <code>h2</code>, de color <code>gold</code>. Los párrafos de clase <code>aviso</code>, de color <code>lightblue</code>. La firma (<code>id="firma"</code>), de 200px de ancho.',
    pieces: [
      'h2:Acta del examen',
      'p@aviso:Se examina de selectores.',
      'p:No se permiten chuletas.',
      'p@aviso:Ni soplar.',
      'p#firma:Maestra Rúbrica',
    ],
    rules: [
      pick('h2', GOLD, '.h2'),
      pick('.aviso', 'background-color: lightblue;', 'aviso'),
      pick('#firma', 'width: 200px;', '.firma'),
      GAP,
    ],
  },
  {
    id: 'b7-2',
    region: 11,
    title: 'Más selectores rotos',
    exam: true,
    showMarkup: true,
    width: 440,
    height: 480,
    allowed: [],
    compare: BG,
    speech:
      'Segunda hoja del mismo aprendiz. Aquí al menos lo intentó. Tres reglas, tres errores: uno coge de más, otro no sabe contar y el tercero no sabe decir que no.',
    objective:
      'Solo los elementos de primer nivel del menú (los hijos directos de <code>.menu</code>), <code>lightblue</code>. Los puestos impares de <code>.sub</code>, <code>gold</code>. Y todos los <code>p</code> menos el de clase <code>nota</code>, de 220px de ancho.',
    pieces: [
      'ul@menu',
      ['li:Inicio', 'ul@sub', ['li:Tintas', 'li:Cajas', 'li:Faros'], 'li:Contacto'],
      'p:Horario de mañana',
      'p@nota:Cerrado por examen',
      'p:Horario de tarde',
    ],
    rules: [
      pick('.menu > li', 'background-color: lightblue;', '.menu li'),
      pick('.sub li:nth-child(odd)', GOLD, '.sub li:nth-child(impar)'),
      pick('p:not(.nota)', 'width: 220px;', 'p:no(.nota)'),
      GAP,
    ],
  },
  {
    id: 'b7-3',
    region: 11,
    title: 'La caja del examen',
    exam: true,
    width: 460,
    height: 260,
    allowed: [
      'width',
      'height',
      'padding',
      'margin',
      'border',
      'box-sizing',
      'background-color',
      'color',
    ],
    compare: [
      'background-color',
      'color',
      'border-top-width',
      'border-top-style',
      'border-top-color',
    ],
    speech:
      'Ahora, una caja. Una sola. Si sabe hacer bien una caja, sabe hacer bien una página. Tiene las medidas en el enunciado; léalo dos veces.',
    objective:
      'La caja ocupa <b>300px × 120px en total</b> (<code>border-box</code>), con <b>20px</b> de relleno y un borde de <b>6px</b>, continuo, <code>teal</code>. Fondo <code>ivory</code>, letras <code>teal</code>, y centrada con <b>30px</b> de margen por arriba.',
    pieces: ['caja:Diploma'],
    rules: [
      {
        selector: '.caja',
        solution:
          'box-sizing: border-box;\nwidth: 300px;\nheight: 120px;\npadding: 20px;\nborder: 6px solid teal;\nbackground-color: ivory;\ncolor: teal;\nmargin: 30px auto 0;',
      },
    ],
  },
  {
    id: 'b7-4',
    region: 11,
    title: 'La página del aprendiz',
    exam: true,
    showMarkup: true,
    labels: false,
    widths: [340, 620],
    height: 380,
    allowed: [
      'margin',
      'padding',
      'box-sizing',
      'height',
      'max-width',
      'width',
      'background-color',
      'color',
      'text-align',
      'font-size',
      'font-family',
    ],
    compare: ['background-color', 'color', 'text-align', 'font-size'],
    speech:
      'Ahora, su primera página. Solar limpio, columna centrada, cabecera, contenido y pie. Si la entrega bien, mañana embarca hacia las Ruinas de la Cuadrícula. Si no, también, pero con deberes.',
    objective:
      'Reinicio universal (sin margen ni relleno, <code>border-box</code>). <code>.pagina</code>: 100% de alto, <b>400px</b> de ancho máximo y centrada. <code>header</code>: 60px de alto, fondo <code>teal</code>, letras <code>white</code>, texto centrado y de <b>24px</b>. <code>main</code>: el alto ya está puesto; añade <b>16px</b> de relleno. <code>footer</code>: 40px de alto, fondo <code>gold</code> y texto centrado.',
    pieces: [
      'div@pagina',
      [
        'header:Mi primera página',
        'main:Aquí irá todo lo que aprenda en el continente.',
        'footer:Isla del Aprendiz',
      ],
    ],
    rules: [
      { selector: '*', solution: 'margin: 0;\npadding: 0;\nbox-sizing: border-box;' },
      { selector: '.pagina', solution: 'height: 100%;\nmax-width: 400px;\nmargin: 0 auto;' },
      {
        selector: 'header',
        solution:
          'height: 60px;\nbackground-color: teal;\ncolor: white;\ntext-align: center;\nfont-size: 24px;',
      },
      { selector: 'main', fixed: 'height: calc(100% - 100px);', solution: 'padding: 16px;' },
      {
        selector: 'footer',
        solution: 'height: 40px;\nbackground-color: gold;\ntext-align: center;',
      },
    ],
  },
  {
    id: 'b7-5',
    region: 11,
    title: 'El cartel de despedida',
    exam: true,
    width: 460,
    height: 220,
    allowed: [
      'font-family',
      'font-size',
      'font-weight',
      'font-style',
      'text-align',
      'text-transform',
      'text-decoration',
      'color',
      'background-color',
      'border',
      'border-width',
      'border-style',
      'border-color',
    ],
    compare: [
      'font-family',
      'font-size',
      'text-align',
      'text-transform',
      'color',
      'font-style',
      'background-color',
      'border-top-width',
      'border-top-style',
      'border-top-color',
    ],
    speech:
      'Y para terminar, el cartel que colgaremos en el muelle el día que se marche. Letra, color y borde: todo lo que ha aprendido en el taller y en la imprenta. Que se lea desde el barco.',
    objective:
      'El titular: <code>Georgia, serif</code> a <b>28px</b>, centrado, en mayúsculas y de color <code>crimson</code>. El aviso: en cursiva, fondo <code>gold</code> y borde de 4px, a rayas, <code>crimson</code>.',
    pieces: ['h2@titular:Zarpa la aprendiza', 'p@aviso:Mañana, al amanecer, desde el embarcadero.'],
    rules: [
      {
        selector: '.titular',
        solution:
          'font-family: Georgia, serif;\nfont-size: 28px;\ntext-align: center;\ntext-transform: uppercase;\ncolor: crimson;',
      },
      {
        selector: '.aviso',
        solution: 'font-style: italic;\nbackground-color: gold;\nborder: 4px dashed crimson;',
      },
      GAP,
    ],
  },
  // ─────────────────────────────── secretos de la isla
  {
    id: 'bS-1',
    region: 12,
    title: 'El mensaje en la botella',
    landmark: 'pluma',
    variant: 'secreto',
    terrain: 'imprenta',
    character: 'Tilde',
    role: 'el náufrago poeta',
    portrait: 'pj-bs1',
    secret: {
      x: 0.036,
      y: 0.289,
      width: 0.05,
      drawing: 'botella',
      hint: 'Al oeste del atolón, en mar abierto, algo de cristal sube y baja con la marea…',
    },
    showMarkup: true,
    labels: false,
    width: 440,
    height: 300,
    allowed: [],
    compare: ['font-size'],
    concepts: ['::first-letter'],
    speech:
      'Llevo once años en este islote escribiendo cartas. Tengo la tinta, tengo las botellas… pero una carta como es debido empieza con una letra capital, grande y roja, como en los libros antiguos. Solo la primera letra, ¿eh? El resto ya me quedó bien.',
    theory:
      '<p>Un <b>pseudo-elemento</b> selecciona <b>un trozo</b> de un elemento, no el elemento entero. Se escribe con <b>dos veces dos puntos</b>:</p><pre>p::first-letter { … }  /* la primera letra */\np::first-line { … }    /* la primera línea */</pre><p>No hace falta tocar el HTML ni envolver la letra en nada: el navegador la encuentra solo.</p>',
    objective:
      'Solo la <b>primera letra</b> de cada párrafo, grande y de color <code>crimson</code>. El resto del texto no cambia.',
    hint: '<code>p::first-letter</code>',
    pieces: [
      'p:Querida aprendiza:',
      'p:Si lees esto, la marea trae buenas noticias.',
      'p:Posdata: manda más botellas.',
    ],
    rules: [pick('p::first-letter', 'font-size: 44px;\ncolor: crimson;'), GAP],
    farewell:
      '¡Ahora sí parece una carta! La echaré al mar esta misma tarde. Si dentro de once años te llega otra, es la respuesta.',
  },
  {
    id: 'bS-2',
    region: 12,
    title: 'Las vecinas de al lado',
    landmark: 'casa',
    variant: 'secreto',
    terrain: 'patio',
    character: 'Doña Contigua',
    role: 'la vecina observadora',
    portrait: 'pj-bs2',
    secret: {
      x: 0.955,
      y: 0.894,
      width: 0.075,
      drawing: 'gemelas',
      hint: 'Al sureste, en un islote que casi no sale en los mapas, hay dos casitas idénticas, pared con pared…',
    },
    showMarkup: true,
    width: 440,
    height: 330,
    allowed: [],
    compare: BG,
    concepts: ['hermano adyacente'],
    speech:
      'Yo no soy cotilla: soy observadora. Y solo me interesa quien vive justo al lado, ¿eh? Pared con pared. De esta lista de vecinos, márcame en dorado a los que van inmediatamente después de un título. Los demás me dan igual.',
    theory:
      '<p>El signo <code>+</code> selecciona al <b>hermano que va justo después</b>: los dos tienen el mismo padre y están uno a continuación del otro.</p><pre>h2 + p { … }</pre><p>«El <code>p</code> que va <b>inmediatamente después</b> de un <code>h2</code>». Su primo <code>~</code> es menos exigente: <code>h2 ~ p</code> alcanza a <b>todos</b> los <code>p</code> hermanos que vengan después, estén pegados o no.</p>',
    objective:
      'Solo los párrafos que van <b>justo después</b> de un título <code>h2</code>, dorados.',
    hint: '<code>h2 + p</code>',
    pieces: [
      'h2:Calle del Faro',
      'p:Fanal, la farera',
      'p:Su gato',
      'h2:Calle del Canal',
      'p:Remo, el barquero',
      'p:Su barca, que cuenta como vecina',
    ],
    checks: [
      {
        inSelector: true,
        pattern: /\+/,
        message: 'Usa el signo <code>+</code> de hermano adyacente',
      },
    ],
    rules: [pick('h2 + p', GOLD), GAP],
    farewell:
      '¡Lo sabía! Pared con pared. Y ahora, si me disculpas, tengo que mirar por la ventana. Es por seguridad.',
  },
  {
    id: 'bS-3',
    region: 12,
    title: 'El barco fantasma',
    landmark: 'ancla',
    variant: 'secreto',
    terrain: 'canal',
    character: 'Capitán Bruma',
    role: 'el capitán que casi no está',
    portrait: 'pj-bs3',
    secret: {
      x: 0.933,
      y: 0.137,
      width: 0.085,
      drawing: 'fantasma',
      hint: 'Al noreste hay un banco de niebla que no se mueve con el viento. Y dentro, a veces, asoma un mástil…',
    },
    width: 440,
    height: 240,
    allowed: ['visibility', 'opacity'],
    compare: ['visibility', 'opacity'],
    concepts: [],
    speech:
      'Buuu… perdona, es la costumbre. Mi tripulación está a medio desaparecer y así no hay quien pase revista. El contramaestre, invisible del todo, pero que guarde su sitio en la fila. El cocinero, a medio ver, como un buen espectro.',
    theory:
      '<p>Tres formas de hacer desaparecer algo, y no son lo mismo:</p><ul><li><code>display: none;</code> lo quita: <b>no ocupa sitio</b>.</li><li><code>visibility: hidden;</code> lo vuelve invisible, pero <b>le guarda el hueco</b>.</li><li><code>opacity</code> lo hace <b>translúcido</b>: de <code>0</code> (invisible) a <code>1</code> (opaco). Sigue ocupando su sitio y se puede pulsar.</li></ul>',
    objective:
      'El contramaestre (<code>.invisible</code>), oculto pero guardando su hueco. El cocinero (<code>.espectro</code>), con una opacidad de <b>0.4</b>.',
    hint: '<code>visibility: hidden;</code> en <code>.invisible</code> y <code>opacity: 0.4;</code> en <code>.espectro</code>.',
    pieces: ['p:Capitán Bruma', 'p@invisible:Contramaestre', 'p:Grumete', 'p@espectro:Cocinero'],
    rules: [
      { selector: '.invisible', solution: 'visibility: hidden;' },
      { selector: '.espectro', solution: 'opacity: 0.4;' },
      GAP,
    ],
    farewell:
      'Así da gusto: una tripulación presentable. Si alguna noche ves un barco donde no hay nada, saluda. Seremos nosotros, o la niebla. Casi es lo mismo.',
  },
];

// The trail order is this array's order: the new regions go between the lighthouse and the Aula Magna.
const aula = lessons.findIndex((lesson) => lesson.region === ISLE.classroom);
const secrets = lessons.findIndex((lesson) => lesson.region === ISLE.secrets);
const ordered: LevelDraft[] = [
  ...lessons.slice(0, aula),
  ...market.lessons,
  ...glasshouses.lessons,
  ...observatory.lessons,
  ...library.lessons,
  ...lessons.slice(aula, secrets),
  ...finals.lessons,
  ...lessons.slice(secrets),
  ...hideouts.lessons,
];

const baseLevels: readonly LevelDraft[] = ordered.map((lesson) => ({
  landmark: LANDMARKS[lesson.region],
  ...lesson,
}));

/** Map index filters. */
const filters: readonly FilterGroup[] = [
  [
    'Tipo de ejercicio',
    [
      'prueba de aprendizaje',
      'secreto',
      'contra reloj',
      'a oscuras',
      'regateo',
      'musical',
      'escribe el selector',
    ],
  ],
  [
    'La caja',
    [
      'width',
      'height',
      'max-width',
      'min-width',
      'min-height',
      'max-height',
      'aspect-ratio',
      'padding',
      'padding-left',
      'padding-top',
      'margin',
      'margin-top',
      'margin-bottom',
      'margin-left',
      'margin-right',
      'border',
      'border-width',
      'border-style',
      'border-color',
      'border-bottom',
      'border-left',
      'border-radius',
      'box-sizing',
      'overflow',
      'overflow-x',
      'overflow-y',
    ],
  ],
  [
    'Color y fondo',
    [
      'color',
      'background-color',
      'background',
      'background-image',
      'background-repeat',
      'background-position',
      'background-size',
      'opacity',
    ],
  ],
  [
    'Efectos',
    ['box-shadow', 'text-shadow', 'outline', 'outline-offset', 'filter', 'clip-path', 'cursor'],
  ],
  [
    'Texto',
    [
      'font-family',
      'font-size',
      'font-weight',
      'font-style',
      'font',
      'text-align',
      'text-decoration',
      'text-transform',
      'line-height',
      'letter-spacing',
      'list-style',
      'list-style-type',
      'white-space',
      'text-overflow',
      'overflow-wrap',
      'word-break',
      'hyphens',
      'text-indent',
      'vertical-align',
      'writing-mode',
      'content',
      'counter-reset',
      'counter-increment',
      'columns',
      'column-count',
      'column-width',
      'column-gap',
      'column-rule',
    ],
  ],
  [
    'Flujo y posición',
    [
      'display',
      'visibility',
      'float',
      'clear',
      'position',
      'top',
      'right',
      'bottom',
      'left',
      'z-index',
    ],
  ],
  [
    'Conceptos',
    [
      'regla',
      'comentarios',
      'tipo',
      'clase',
      'id',
      'universal',
      'lista de selectores',
      'descendiente',
      'hijo',
      'hermano adyacente',
      'hermanos',
      ':first-child',
      ':last-child',
      ':nth-child()',
      ':not()',
      'atributo',
      ':is()',
      ':where()',
      ':has()',
      ':hover',
      ':focus',
      ':focus-visible',
      ':active',
      '::first-letter',
      '::first-line',
      '::before',
      '::after',
      '::marker',
      'cascada',
      'especificidad',
      '!important',
      'herencia',
      'inherit',
      'initial',
      'unset',
      'currentColor',
      'px',
      '%',
      'em',
      'rem',
      'ch',
      'vw',
      'calc()',
      'min()',
      'max()',
      'clamp()',
      'colores',
      'hex',
      'rgb()',
      'hsl()',
      'transparencia',
      'degradados',
      'sombras',
      'shorthand',
      'modelo de caja',
      'margin auto',
      'bloque y en línea',
      'listas',
      'contadores',
      'texto que no cabe',
      'capas',
      'reset',
      'página base',
    ],
  ],
];

export const isleWorld: WorldContent = {
  id: 'isle',
  name: 'La Isla del Aprendiz',
  mapTitle: 'Mapa de la isla',
  topic: 'Fundamentos de CSS',
  card: { tech: 'Fundamentos de CSS · antes de maquetar', className: 'is-isle' },
  regions: baseRegions,
  pieceTypes: basePieceTypes,
  filters,
  lessons: baseLevels,
};
