/** Surface adventure: CSS Grid regions, piece types and levels. Player-facing copy stays in Spanish. */
import type {
  BoardRuleDraft,
  FilterGroup,
  LevelDraft,
  PieceTypeMap,
  RegionDraft,
  WorldContent,
} from '../models';

const regions: readonly RegionDraft[] = [
  {
    name: 'Pradera del Despertar',
    subtitle: 'Fundamentos',
    x: 0.22,
    y: 0.77,
    terrain: 'pradera',
    character: 'Olma',
    role: 'la granjera',
  },
  {
    name: 'Bosque de los Huecos',
    subtitle: 'Huecos y medidas',
    x: 0.42,
    y: 0.84,
    terrain: 'bosque',
    character: 'Tilo',
    role: 'el guardabosques',
  },
  {
    name: 'Cañón de las Líneas',
    subtitle: 'Colocar por líneas',
    x: 0.64,
    y: 0.79,
    terrain: 'canon',
    character: 'Brecha',
    role: 'la exploradora',
  },
  {
    name: 'Valle de las Áreas',
    subtitle: 'Áreas y nombres',
    x: 0.8,
    y: 0.59,
    terrain: 'valle',
    character: 'Surco',
    role: 'el agrimensor',
  },
  {
    name: 'Laguna de la Alineación',
    subtitle: 'Alinear',
    x: 0.74,
    y: 0.31,
    terrain: 'lago',
    character: 'Nácar',
    role: 'la barquera',
  },
  {
    name: 'Cumbres Implícitas',
    subtitle: 'La cuadrícula implícita',
    x: 0.5,
    y: 0.18,
    terrain: 'cumbres',
    character: 'Escarcha',
    role: 'el ermitaño',
  },
  {
    name: 'Dunas de Ámbar',
    subtitle: 'Medidas intrínsecas',
    x: 0.25,
    y: 0.24,
    terrain: 'desierto',
    character: 'Ambarina',
    role: 'la mercadera',
  },
  {
    name: 'Aldea de los Farolillos',
    subtitle: 'Orden y capas',
    x: 0.16,
    y: 0.52,
    terrain: 'aldea',
    character: 'Hana',
    role: 'la abuela del gallinero',
  },
  {
    name: 'Ciudadela del Arquitecto',
    subtitle: 'Prueba de aprendizaje',
    x: 0.47,
    y: 0.5,
    terrain: 'ciudadela',
    character: 'Áurea',
    role: 'la arquitecta mayor',
    exam: true,
  },
  { name: 'Lugares secretos', subtitle: 'Escondidos en el mapa', terrain: 'lago', secret: true },
];

// Piece types: `material` stretches over the piece (map areas), `token` is an object with an icon,
// `icon` is drawn over a material.
const pieceTypes: PieceTypeMap = {
  huerto: { material: 'huerto' },
  bancal: { material: 'tierra' },
  trigal: { material: 'trigo' },
  flores: { material: 'flores' },
  orilla: { material: 'flores' },
  jardin: { material: 'flores', icon: 'flor' },
  rio: { material: 'agua' },
  acequia: { material: 'agua' },
  estanque: { material: 'agua', icon: 'pez' },
  isla: { material: 'flores', icon: 'nenufar' },
  camino: { material: 'camino' },
  plaza: { material: 'camino', icon: 'pozo' },
  casa: { material: 'tejas', icon: 'casa' },
  arbol: { material: 'copas' },
  arboleda: { material: 'copas' },
  pino: { material: 'pinos' },
  claro: { material: 'tierra', icon: 'hoguera' },
  puente: { material: 'tablones' },
  pasarela: { material: 'tablones' },
  escala: { material: 'escala' },
  campamento: { material: 'lona', icon: 'tienda' },
  carpa: { material: 'lona', icon: 'tienda' },
  fuerte: { material: 'sillares', icon: 'bandera' },
  templo: { material: 'sillares', icon: 'runa' },
  monte: { material: 'roca' },
  glaciar: { material: 'hielo' },
  almenas: { material: 'sillares', icon: 'bandera' },
  patio: { material: 'marmol' },
  biblioteca: { material: 'tablones', icon: 'runa' },
  puerta: { material: 'sillares', icon: 'llave' },
  atlas: { material: 'atlas' },
  vigia: { material: 'sillares', icon: 'faro' },
  vitral: { material: 'vitral' },
  tapiz: { material: 'tapiz' },
  estatua: { material: 'marmol', icon: 'sello' },
  barca: { token: 'barca' },
  pez: { token: 'pez' },
  nenufar: { token: 'nenufar' },
  faro: { token: 'faro' },
  cofre: { token: 'cofre' },
  tienda: { token: 'tienda' },
  cabana: { token: 'casa' },
  refugio: { token: 'casa' },
  pozo: { token: 'pozo' },
  molino: { token: 'molino' },
  puesto: { token: 'manzana' },
  bandera: { token: 'bandera' },
  cristal: { token: 'cristal' },
  runa: { token: 'runa' },
  seta: { token: 'seta' },
  flor: { token: 'flor' },
  farol: { token: 'antorcha' },
  llave: { token: 'llave' },
  manzana: { token: 'manzana' },
  bellota: { token: 'bellota' },
  sello: { token: 'sello' },
  //desert
  cartel: { sign: true },
  alfombra: { material: 'alfombra' },
  jarron: { token: 'jarron' },
  oasis: { material: 'agua', icon: 'palmera' },
  jaima: { material: 'jaima', icon: 'tienda' },
  caravana: { material: 'duna', icon: 'camello' },
  camello: { material: 'duna', icon: 'camello' },
  palmera: { token: 'palmera' },
  moneda: { token: 'moneda' },
  //village
  gallina: { token: 'gallina' },
  gallo: { token: 'gallo' },
  pollito: { token: 'pollito' },
  farolillo: { token: 'farolillo' },
  koi: { token: 'koi' },
  zorro: { token: 'zorro' },
  charca: { material: 'agua' },
  valla: { material: 'valla' },
  cerezo: { material: 'cerezo' },
  bambu: { material: 'bambu' },
  //secrets
  casco: { material: 'tablones', icon: 'ancla' },
  mastil: { material: 'mastil' },
  vela: { material: 'vela' },
  cola: { material: 'escamas' },
  escama: { material: 'escamas' },
  cabeza: { material: 'escamas', icon: 'serpiente' },
  menhir: { token: 'menhir' },
  sol: { token: 'sol' },
  luna: { token: 'luna' },
  altar: { material: 'altar' },
  crater: { material: 'lava', icon: 'hoguera' },
  colada: { material: 'lava' },
  ancla: { token: 'ancla' },
  coco: { token: 'coco' },
  cangrejo: { token: 'cangrejo' },
};

export const GRID_5 =
  'display: grid;\ngrid-template-columns: repeat(5, 1fr);\ngrid-template-rows: repeat(5, 1fr);\ngap: 6px;';
export const GRID_3 =
  'display: grid;\ngrid-template-columns: repeat(3, 1fr);\ngrid-template-rows: repeat(3, 1fr);\ngap: 8px;';
export const GRID_TALL =
  'display: grid;\ngrid-template-columns: repeat(3, 1fr);\ngrid-template-rows: repeat(2, 1fr);\ngap: 8px;';
export const DESIGN_PROPS = [
  'display',
  'grid-template-columns',
  'grid-template-rows',
  'grid-template-areas',
  'grid-template',
  'gap',
  'grid-column',
  'grid-row',
  'grid-area',
];
export const areaRule = (selector: string): BoardRuleDraft => ({
  selector: `.${selector}`,
  fixed: `grid-area: ${selector};`,
  editable: false,
});
export const hiddenRule = (selector: string): BoardRuleDraft => ({
  selector: `.${selector}`,
  fixed: `grid-area: ${selector};`,
  editable: false,
  hidden: true,
});
export const fixedRule = (selector: string, css: string): BoardRuleDraft => ({
  selector: `.${selector}`,
  fixed: css,
  editable: false,
});
export const VERTICAL_RIVER = fixedRule('rio', 'grid-column: 3;\ngrid-row: 1 / -1;');
export const horizontalRiver = (row: number): BoardRuleDraft =>
  fixedRule('rio', `grid-column: 1 / -1;\ngrid-row: ${row};`);
export const FOREST_9 = [
  'arbol',
  'pino',
  'arbol',
  'pino',
  'arbol',
  'pino',
  'arbol',
  'pino',
  'arbol',
];
export const LAKE_6 = ['barca', 'pez', 'barca', 'pez', 'barca', 'pez'];

const levels: readonly LevelDraft[] = [
  //Region 1 · Pradera del Despertar
  {
    id: '1-1',
    region: 0,
    title: 'Los huertos dormidos',
    landmark: 'flor',
    allowed: ['display'],
    speech:
      '¡Las parcelas se han amontonado junto al camino! Despierta la cuadrícula y cada una volverá a su sitio.',
    note: 'Escribe en la tablilla rúnica: el tablero cambia al instante. Las huellas turquesa marcan dónde debe acabar cada pieza.',
    theory:
      '<p>Todo empieza con una runa: <code>display: grid</code>. El elemento que la recibe se convierte en un <b>contenedor de cuadrícula</b> y sus hijos directos, en <b>elementos de la cuadrícula</b>.</p><p>Las líneas atenuadas de <code>.tablero</code> ya describen tres columnas y un hueco, pero están dormidas: ninguna propiedad de grid surte efecto hasta que el contenedor es una cuadrícula.</p>',
    objective: 'Despierta el tablero para que las seis parcelas ocupen sus huellas.',
    hint: 'Escribe <code>display: grid;</code> dentro de <code>.tablero</code>.',
    pieces: ['huerto', 'flores', 'trigal', 'huerto', 'flores', 'trigal'],
    rules: [
      {
        selector: '.tablero',
        fixed: 'grid-template-columns: 1fr 1fr 1fr;\ngap: 12px;',
        solution: 'display: grid;',
      },
    ],
  },
  {
    id: '1-2',
    region: 0,
    title: 'El camino del molino',
    landmark: 'molino',
    allowed: ['grid-template-columns'],
    speech:
      'Quiero el trigal a la izquierda, el camino del molino en medio y mi huerto a la derecha. Ya he medido el terreno.',
    theory:
      '<p><code>grid-template-columns</code> dibuja las columnas: un tamaño por columna, separados por espacios.</p><pre>grid-template-columns: 100px 50px;</pre><p>Eso crea dos columnas, de 100px y de 50px. Si hay más piezas que celdas, la cuadrícula añade filas por su cuenta.</p>',
    objective:
      'Tres columnas: trigal de <b>80px</b>, camino de <b>160px</b> y huerto de <b>100px</b>.',
    hint: 'Escribe los tres tamaños seguidos, separados por espacios.',
    pieces: ['trigal', 'camino', 'huerto'],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: grid;',
        solution: 'grid-template-columns: 80px 160px 100px;',
      },
    ],
  },
  {
    id: '1-3',
    region: 0,
    title: 'Franjas del prado',
    landmark: 'pozo',
    allowed: ['grid-template-rows'],
    speech:
      'Arriba, una franja de flores; en medio, el huerto grande; abajo, el arroyo que lo riega.',
    theory:
      '<p><code>grid-template-rows</code> funciona igual, pero en vertical: cada valor es la altura de una fila.</p><pre>grid-template-rows: 50px 100px;</pre><p>Si las filas no llenan el tablero, el espacio sobrante queda libre al final.</p>',
    objective: 'Tres filas: flores de <b>60px</b>, huerto de <b>140px</b> y arroyo de <b>60px</b>.',
    hint: 'Igual que con las columnas: tres tamaños separados por espacios.',
    pieces: ['flores', 'huerto', 'rio'],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: grid;',
        solution: 'grid-template-rows: 60px 140px 60px;',
      },
    ],
  },
  {
    id: '1-4',
    region: 0,
    title: 'Las dos orillas',
    landmark: 'barca',
    allowed: ['grid-template-columns'],
    concepts: ['fr'],
    speech:
      'El río se ha encogido y las barcas ya no pasan. Necesita el doble de anchura que cada orilla.',
    theory:
      '<p><code>fr</code> significa <b>fracción del espacio libre</b>. Primero se descuentan los huecos y las pistas de tamaño fijo; lo que queda se reparte según las fracciones.</p><pre>grid-template-columns: 1fr 3fr;</pre><p>Aquí la primera columna recibe un cuarto y la segunda, tres cuartos.</p>',
    objective:
      'Tres columnas que llenen el ancho: el río, <b>el doble</b> de ancho que cada orilla.',
    hint: 'Si cada orilla vale <code>1fr</code>, ¿cuánto vale el río?',
    pieces: ['orilla', 'rio', 'orilla'],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: grid;\ngap: 10px;',
        solution: 'grid-template-columns: 1fr 2fr 1fr;',
      },
    ],
    checks: [{ pattern: /\dfr\b/, message: 'Usa la unidad fr' }],
  },
  {
    id: '1-5',
    region: 0,
    title: 'La granja de Olma',
    landmark: 'casa',
    allowed: ['grid-template-columns', 'grid-template-rows'],
    concepts: ['fr'],
    speech:
      'Mi casa ocupa una franja fija de 100px y el huerto se queda el resto. Abajo, 80px para el pozo y el camino.',
    theory:
      '<p>Puedes combinar unidades fijas y flexibles. Las pistas en <code>px</code> se reservan primero y las <code>fr</code> se reparten lo que sobra.</p><pre>grid-template-columns: 200px 1fr;</pre><p>Una columna fija y otra que crece o encoge con el contenedor: la base de casi cualquier diseño con barra lateral.</p>',
    objective:
      'Columna izquierda de <b>100px</b> y derecha flexible. Fila inferior de <b>80px</b> y la superior con el resto del alto.',
    hint: 'Dos declaraciones: una para columnas y otra para filas, cada una con un valor fijo y un <code>1fr</code>.',
    pieces: ['casa', 'huerto', 'pozo', 'camino'],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: grid;\ngap: 8px;',
        solution: 'grid-template-columns: 100px 1fr;\ngrid-template-rows: 1fr 80px;',
      },
    ],
  },
  {
    id: '1-6',
    region: 0,
    title: 'Bancales de colores',
    landmark: 'flor',
    allowed: ['grid-template-columns'],
    concepts: ['repeat()', 'fr'],
    speech:
      'Diez bancales en cinco columnas iguales. Y no me hagas escribir cinco veces lo mismo, que se me cansa la mano.',
    theory:
      '<p>Cuando una pista se repite, <code>repeat()</code> ahorra tinta: el primer argumento es cuántas veces y el segundo, qué repetir.</p><pre>grid-template-columns: repeat(4, 1fr);\n/* igual que 1fr 1fr 1fr 1fr */</pre>',
    objective: 'Cinco columnas iguales que llenen el tablero, escritas con <code>repeat()</code>.',
    hint: '<code>repeat(5, …)</code> y dentro, la fracción de cada columna.',
    pieces: [
      'flores',
      'huerto',
      'flores',
      'huerto',
      'flores',
      'huerto',
      'flores',
      'huerto',
      'flores',
      'huerto',
    ],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: grid;\ngap: 8px;',
        solution: 'grid-template-columns: repeat(5, 1fr);',
      },
    ],
    checks: [{ pattern: /repeat\s*\(/, message: 'Usa repeat()' }],
  },
  {
    id: '1-7',
    region: 0,
    title: 'Las acequias',
    landmark: 'pez',
    allowed: ['grid-template-columns'],
    concepts: ['repeat()', 'fr'],
    speech:
      'Entre trigal y trigal corre una acequia estrecha de 50px. Empieza por una acequia, y el dibujo se repite dos veces.',
    theory:
      '<p><code>repeat()</code> también repite <b>patrones</b> de varias pistas.</p><pre>grid-template-columns: repeat(3, 20px 1fr);\n/* 20px 1fr 20px 1fr 20px 1fr */</pre>',
    objective:
      'En cada fila, alterna una acequia de <b>50px</b> con un trigal flexible. Usa <code>repeat()</code> para repetir ese par de columnas <b>dos veces por fila</b>.',
    hint: 'El patrón que se repite es <code>50px 1fr</code>.',
    pieces: ['acequia', 'trigal', 'acequia', 'trigal', 'acequia', 'trigal', 'acequia', 'trigal'],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: grid;\ngap: 8px;',
        solution: 'grid-template-columns: repeat(2, 50px 1fr);',
      },
    ],
    checks: [{ pattern: /repeat\s*\(/, message: 'Usa repeat()' }],
  },
  {
    id: '1-8',
    region: 0,
    title: 'Bancales en línea',
    landmark: 'flor',
    labels: false,
    hideNotice: true,
    allowed: ['display'],
    concepts: ['inline-grid'],
    speech:
      'Estos dos bancales pequeños se me ponen uno debajo del otro y cada uno se queda con el prado entero. Son cuadrículas, sí, pero quiero que se comporten como palabras: una al lado de la otra y sin acaparar.',
    theory:
      '<p>Un contenedor con <code>display: grid</code> es, por fuera, un <b>bloque</b>: empieza en línea nueva y ocupa todo el ancho. Con <code>display: inline-grid</code> sigue siendo una cuadrícula <b>por dentro</b>, pero por fuera va <b>en línea</b>: ocupa solo lo que miden sus pistas y deja que otros se pongan a su lado.</p><pre>display: inline-grid;</pre><p>Aquí la cuadrícula no es el tablero, sino cada bancal.</p>',
    objective: 'Los dos bancales, uno junto al otro, cada uno del ancho justo de sus dos columnas.',
    hint: 'Cambia <code>grid</code> por <code>inline-grid</code> en <code>.bancal</code>.',
    pieces: [
      'bancal',
      ['flor', 'flor', 'flor', 'flor'],
      'bancal',
      ['seta', 'seta', 'seta', 'seta'],
    ],
    rules: [
      {
        selector: '.bancal',
        fixed: 'grid-template-columns: 56px 56px;\ngap: 6px;\nmargin: 6px;\nvertical-align: top;',
        initial: 'display: grid;',
        solution: 'display: inline-grid;',
      },
    ],
  },

  //Region 2 · Bosque de los Huecos
  {
    id: '2-1',
    region: 1,
    title: 'Senderos de Musgoalto',
    landmark: 'seta',
    allowed: ['gap'],
    speech:
      'Los árboles han crecido pegados y no hay por dónde pasar. Ábreme senderos de 24px entre ellos.',
    theory:
      '<p><code>gap</code> abre espacio <b>entre</b> pistas, nunca en los bordes exteriores. Es mucho más cómodo que poner márgenes a cada pieza.</p><pre>gap: 16px;</pre><p>Antes se llamaba <code>grid-gap</code>; ese nombre aún funciona, pero el actual es <code>gap</code>.</p>',
    objective: 'Senderos de <b>24px</b> entre los árboles, en ambas direcciones.',
    hint: 'Un solo valor vale para filas y columnas.',
    pieces: FOREST_9,
    rules: [
      {
        selector: '.tablero',
        fixed:
          'display: grid;\ngrid-template-columns: repeat(3, 1fr);\ngrid-template-rows: repeat(3, 1fr);',
        solution: 'gap: 24px;',
      },
    ],
  },
  {
    id: '2-2',
    region: 1,
    title: 'Cortafuegos',
    landmark: 'hoguera',
    allowed: ['row-gap', 'column-gap'],
    speech:
      'Entre las filas de árboles quiero cortafuegos anchos, de 40px. Entre columnas basta una senda de 8px.',
    theory:
      '<p>Cada dirección tiene su propia runa: <code>row-gap</code> separa las filas y <code>column-gap</code>, las columnas.</p><pre>row-gap: 10px;\ncolumn-gap: 30px;</pre>',
    objective: 'Filas separadas <b>40px</b> y columnas separadas <b>8px</b>.',
    hint: 'Dos declaraciones: <code>row-gap</code> para el espacio entre filas y <code>column-gap</code> para el espacio entre columnas.',
    pieces: FOREST_9,
    rules: [
      {
        selector: '.tablero',
        fixed:
          'display: grid;\ngrid-template-columns: repeat(3, 1fr);\ngrid-template-rows: repeat(3, 1fr);',
        solution: 'row-gap: 40px;\ncolumn-gap: 8px;',
      },
    ],
  },
  {
    id: '2-3',
    region: 1,
    title: 'El atajo del guardabosques',
    landmark: 'bellota',
    allowed: ['gap'],
    concepts: ['shorthand'],
    maxDeclarations: 1,
    speech:
      'Ahora al revés, y con un único hechizo, que el bosque escucha mejor las órdenes cortas.',
    theory:
      '<p><code>gap</code> es un <b>atajo</b> (shorthand) de <code>row-gap</code> y <code>column-gap</code>. Con dos valores, el primero es para las filas y el segundo para las columnas.</p><pre>gap: 10px 30px;\n/* row-gap: 10px; column-gap: 30px; */</pre>',
    objective:
      'Filas separadas <b>8px</b> y columnas separadas <b>40px</b>, con <b>una sola</b> declaración.',
    hint: 'Primero el hueco entre filas, después el hueco entre columnas.',
    pieces: ['pino', 'arbol', 'pino', 'arbol', 'pino', 'arbol', 'pino', 'arbol', 'pino'],
    rules: [
      {
        selector: '.tablero',
        fixed:
          'display: grid;\ngrid-template-columns: repeat(3, 1fr);\ngrid-template-rows: repeat(3, 1fr);',
        solution: 'gap: 8px 40px;',
      },
    ],
  },
  {
    id: '2-4',
    region: 1,
    title: 'El campamento',
    landmark: 'tienda',
    allowed: ['grid-template-columns'],
    concepts: ['auto', 'fr'],
    speech:
      'Las tiendas solo necesitan su propio sitio. El claro de la hoguera, en cambio, que se quede todo lo demás.',
    theory:
      '<p><code>auto</code> ajusta la pista a su contenido. Cuando hay pistas <code>fr</code> cerca, estas se quedan con todo el espacio sobrante y las <code>auto</code> miden lo justo.</p><pre>grid-template-columns: auto 1fr;</pre>',
    objective:
      'Las columnas de las tiendas miden exactamente lo que su tienda; el claro se queda el resto.',
    hint: 'Tres columnas: <code>auto</code>, una fracción y otra vez <code>auto</code>.',
    pieces: ['tienda', 'claro', 'tienda'],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: grid;\ngap: 10px;',
        solution: 'grid-template-columns: auto 1fr auto;',
      },
    ],
    checks: [{ pattern: /\bauto\b/, message: 'Usa la palabra clave auto' }],
  },
  {
    id: '2-5',
    region: 1,
    title: 'La cabaña de Tilo',
    landmark: 'casa',
    allowed: ['grid-template-columns'],
    concepts: ['minmax()', 'fr'],
    widths: [400, 260],
    speech:
      'Mi cabaña ocupa un tercio del claro, pero nunca menos de 100px, que si no, no quepo. Mira el claro grande y el pequeño.',
    theory:
      '<p><code>minmax(mín, máx)</code> pone límites a una pista: crece hasta el máximo, pero nunca baja del mínimo.</p><pre>grid-template-columns: minmax(150px, 1fr) 3fr;</pre><p>Esta prueba se juzga con <b>dos anchos de tablero</b>: cámbialos bajo el tablero.</p>',
    objective:
      'Dos columnas: la cabaña ocupa <b>1 parte de cada 3</b>, pero nunca menos de <b>100px</b>; la arboleda, las otras 2 partes.',
    hint: 'La primera columna es <code>minmax(100px, 1fr)</code>. ¿Y la segunda?',
    pieces: ['cabana', 'arboleda'],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: grid;\ngap: 10px;',
        solution: 'grid-template-columns: minmax(100px, 1fr) 2fr;',
      },
    ],
    checks: [{ pattern: /minmax\s*\(/, message: 'Usa minmax()' }],
  },
  {
    id: '2-6',
    region: 1,
    title: 'La aldea del claro',
    landmark: 'casa',
    allowed: ['grid-template-columns', 'grid-template-rows', 'gap'],
    concepts: ['repeat()', 'fr'],
    speech:
      'Pinos de 60px a cada lado y, en medio, dos columnas iguales: arriba las casas, abajo los huertos.',
    theory:
      '<p>Hora de combinar lo aprendido: tamaños fijos, fracciones, <code>repeat()</code> y huecos distintos en cada dirección.</p><p>Recuerda: en <code>gap</code>, el primer valor es para las filas.</p>',
    objective:
      'Columnas: <b>60px</b>, dos flexibles iguales y <b>60px</b>. Filas: <b>80px</b> y el resto. Huecos: <b>12px</b> entre filas y <b>6px</b> entre columnas.',
    hint: '<code>repeat()</code> puede ir en medio de otros valores: <code>60px repeat(2, 1fr) 60px</code>.',
    pieces: ['pino', 'casa', 'casa', 'pino', 'pino', 'huerto', 'huerto', 'pino'],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: grid;',
        solution:
          'grid-template-columns: 60px repeat(2, 1fr) 60px;\ngrid-template-rows: 80px 1fr;\ngap: 12px 6px;',
      },
    ],
  },

  //Region 3 · Cañón de las Líneas
  {
    id: '3-1',
    region: 2,
    title: 'El vado',
    landmark: 'barca',
    allowed: ['grid-column-start'],
    speech:
      'El río baja por la tercera columna del cañón. Lleva la barca hasta el agua: esa columna empieza en la línea 3.',
    theory:
      '<p>Entre pista y pista hay <b>líneas</b>, numeradas desde 1. Una cuadrícula de 5 columnas tiene 6 líneas verticales: mira los números sobre el tablero.</p><p><code>grid-column-start</code> dice en qué línea empieza una pieza.</p><pre>grid-column-start: 2;</pre>',
    objective: 'Lleva la barca a la <b>tercera columna</b>, la que empieza en la línea 3.',
    hint: '<code>grid-column-start: 3;</code> en el bloque de la barca.',
    pieces: ['#rio', 'barca'],
    rules: [
      { selector: '.tablero', fixed: GRID_5, editable: false },
      VERTICAL_RIVER,
      { selector: '.barca', fixed: 'grid-row: 3;', solution: 'grid-column-start: 3;' },
    ],
  },
  {
    id: '3-2',
    region: 2,
    title: 'El puente colgante',
    landmark: 'puente',
    allowed: ['grid-column-start', 'grid-column-end'],
    speech:
      'Hay que cruzar el río por la fila 2. Tiende el puente desde la línea 2 hasta la línea 5.',
    theory:
      '<p><code>grid-column-end</code> marca la línea donde termina la pieza, que ocupa todo lo que hay entre ambas líneas.</p><pre>grid-column-start: 1;\ngrid-column-end: 3; /* 2 columnas */</pre>',
    objective: 'El puente empieza en la línea <b>2</b> y termina en la línea <b>5</b>.',
    hint: 'Dos declaraciones: una de inicio y otra de fin.',
    pieces: ['#rio', 'puente'],
    rules: [
      { selector: '.tablero', fixed: GRID_5, editable: false },
      VERTICAL_RIVER,
      {
        selector: '.puente',
        fixed: 'grid-row: 2;',
        solution: 'grid-column-start: 2;\ngrid-column-end: 5;',
      },
    ],
  },
  {
    id: '3-3',
    region: 2,
    title: 'La escala del acantilado',
    landmark: 'antorcha',
    allowed: ['grid-column-start', 'grid-column-end', 'grid-row-start', 'grid-row-end'],
    speech:
      'Quiero bajar al río desde la cornisa de la fila 2. Tiende la escala por la columna 4 hasta tocar el agua.',
    theory:
      '<p>Las filas tienen sus propias líneas horizontales y sus propias runas: <code>grid-row-start</code> y <code>grid-row-end</code>.</p><pre>grid-row-start: 1;\ngrid-row-end: 4;</pre>',
    objective:
      'La escala va por la <b>columna 4</b>, desde la línea de fila <b>2</b> hasta la <b>5</b>, justo donde empieza el río.',
    hint: 'Una declaración para la columna y dos para las filas.',
    pieces: ['#rio', 'escala'],
    rules: [
      { selector: '.tablero', fixed: GRID_5, editable: false },
      horizontalRiver(5),
      {
        selector: '.escala',
        solution: 'grid-column-start: 4;\ngrid-row-start: 2;\ngrid-row-end: 5;',
      },
    ],
  },
  {
    id: '3-4',
    region: 2,
    title: 'La pasarela larga',
    landmark: 'puente',
    allowed: ['grid-column-start', 'grid-column-end', 'grid-row-start'],
    concepts: ['líneas negativas'],
    speech:
      'Una pasarela de pared a pared del cañón, en la fila 3. Nunca sé cuántas columnas tiene, así que cuenta desde el final.',
    theory:
      '<p>Las líneas también se cuentan desde el final con números negativos: <code>-1</code> es la última, <code>-2</code> la penúltima…</p><pre>grid-column-end: -1; /* hasta el borde */</pre><p>Así no necesitas saber cuántas columnas hay. Ojo: solo cuentan las líneas de la cuadrícula <b>explícita</b>, la que tú defines.</p>',
    objective:
      'La pasarela cruza de lado a lado en la <b>fila 3</b>. Para el borde derecho, cuenta desde el final.',
    hint: '<code>grid-column-start: 1;</code> y <code>grid-column-end: -1;</code>, más la fila.',
    pieces: ['#rio', 'pasarela'],
    rules: [
      { selector: '.tablero', fixed: GRID_5, editable: false },
      VERTICAL_RIVER,
      {
        selector: '.pasarela',
        solution: 'grid-column-start: 1;\ngrid-column-end: -1;\ngrid-row-start: 3;',
      },
    ],
    checks: [
      {
        rule: 2,
        pattern: /grid-column-end\s*:\s*-\s*\d/,
        message: 'Usa un número negativo en grid-column-end',
      },
    ],
  },
  {
    id: '3-5',
    region: 2,
    title: 'El campamento minero',
    landmark: 'tienda',
    allowed: ['grid-column-start', 'grid-column-end', 'grid-row-start', 'grid-row-end'],
    concepts: ['span'],
    speech:
      'Monta el campamento junto a la veta: empieza en la columna 2 y la fila 2, y ocupa 3 columnas por 2 filas.',
    theory:
      '<p>En lugar de una línea final, puedes decir cuántas pistas <b>abarca</b> la pieza con <code>span</code>.</p><pre>grid-column-start: 2;\ngrid-column-end: span 2; /* columnas 2 y 3 */</pre>',
    objective:
      'El campamento empieza en la columna <b>2</b> y la fila <b>2</b>, y abarca <b>3 columnas</b> y <b>2 filas</b>.',
    hint: 'Inicio con números; fin con <code>span 3</code> y <code>span 2</code>.',
    pieces: ['#rio', 'campamento'],
    rules: [
      { selector: '.tablero', fixed: GRID_5, editable: false },
      horizontalRiver(5),
      {
        selector: '.campamento',
        solution:
          'grid-column-start: 2;\ngrid-column-end: span 3;\ngrid-row-start: 2;\ngrid-row-end: span 2;',
      },
    ],
    checks: [{ rule: 2, pattern: /span[\s\S]*span/, message: 'Usa span en columnas y en filas' }],
  },
  {
    id: '3-6',
    region: 2,
    title: 'Fuerte y camino',
    landmark: 'bandera',
    allowed: ['grid-column', 'grid-row'],
    concepts: ['shorthand'],
    speech:
      'El fuerte vigila las dos primeras columnas, de la fila 1 a la 3. Al otro lado del río, el camino sale de la columna 3 hasta el final.',
    theory:
      '<p><code>grid-column</code> es el atajo de <code>grid-column-start</code> y <code>grid-column-end</code>, separados por una barra. Lo mismo con <code>grid-row</code>.</p><pre>grid-column: 1 / 3;\ngrid-row: 2 / span 2;</pre><p>Con un solo valor, la pieza ocupa una única pista.</p>',
    objective:
      'El fuerte ocupa las columnas <b>1 y 2</b> y las filas <b>1 a 3</b>. El camino va de la columna <b>3 hasta el final</b>, en la fila <b>5</b>.',
    hint: 'Fuerte: <code>grid-column: 1 / 3</code>. Para el camino, recuerda el <code>-1</code>.',
    pieces: ['#rio', 'fuerte', 'camino'],
    rules: [
      { selector: '.tablero', fixed: GRID_5, editable: false },
      horizontalRiver(4),
      { selector: '.fuerte', solution: 'grid-column: 1 / 3;\ngrid-row: 1 / 4;' },
      { selector: '.camino', solution: 'grid-column: 3 / -1;\ngrid-row: 5;' },
    ],
  },
  {
    id: '3-7',
    region: 2,
    title: 'El mercado del cañón',
    landmark: 'manzana',
    allowed: ['grid-column', 'grid-row'],
    concepts: ['span'],
    speech:
      'La carpa grande ocupa 2×2. No le digas dónde: los puestos se acomodarán a su alrededor.',
    theory:
      '<p>Si una pieza solo indica <code>span</code>, sin línea de inicio, la cuadrícula la coloca sola en el primer hueco donde quepa, y el resto de piezas sigue fluyendo a su alrededor.</p><pre>grid-column: span 2;</pre>',
    objective:
      'La carpa ocupa un bloque de <b>2×2</b> sin decirle dónde: deja que la cuadrícula elija.',
    hint: '<code>span 2</code> en las dos direcciones, sin números de línea.',
    pieces: ['puesto', 'puesto', 'carpa', 'puesto', 'puesto', 'puesto', 'puesto'],
    rules: [
      {
        selector: '.tablero',
        fixed:
          'display: grid;\ngrid-template-columns: repeat(4, 1fr);\ngrid-template-rows: repeat(3, 1fr);\ngap: 6px;',
        editable: false,
      },
      { selector: '.carpa', solution: 'grid-column: span 2;\ngrid-row: span 2;' },
    ],
    checks: [
      { rule: 1, pattern: /span[\s\S]*span/, message: 'Usa span en las dos direcciones' },
      { rule: 1, pattern: /^[^/]*$/, message: 'Sin barras: solo span' },
    ],
  },
  {
    id: '3-8',
    region: 2,
    title: 'El templo enterrado',
    landmark: 'runa',
    allowed: ['grid-area'],
    concepts: ['shorthand'],
    maxDeclarations: 1,
    speech: 'Bajo la arena asoma un templo. Desentiérralo de un solo golpe de pala.',
    theory:
      '<p><code>grid-area</code> condensa las cuatro líneas en una declaración, en este orden: <b>fila inicio / columna inicio / fila fin / columna fin</b>. Es decir: arriba, izquierda, abajo, derecha; al revés que <code>margin</code>.</p><pre>grid-area: 1 / 2 / 3 / 5;</pre>',
    objective:
      'Con <b>una sola</b> declaración: el templo empieza en la fila <b>2</b> y la columna <b>2</b>, y termina en la línea de fila <b>5</b> y la línea de columna <b>4</b>.',
    hint: 'Orden: fila inicio / columna inicio / fila fin / columna fin.',
    pieces: ['templo'],
    rules: [
      { selector: '.tablero', fixed: GRID_5, editable: false },
      { selector: '.templo', solution: 'grid-area: 2 / 2 / 5 / 4;' },
    ],
  },

  //Region 4 · Valle de las Áreas
  {
    id: '4-1',
    region: 3,
    title: 'El plano de la granja',
    landmark: 'pozo',
    allowed: ['grid-template-areas'],
    speech: 'He medido el valle palmo a palmo. Dibuja el plano y cada cosa irá a su parcela.',
    theory:
      '<p><code>grid-template-areas</code> dibuja el plano del tablero con nombres. Cada cadena entre comillas es una fila y cada palabra, una celda. Repetir un nombre hace que el área abarque varias celdas.</p><pre>grid-template-areas:\n  "cielo cielo"\n  "suelo agua";</pre><p>Las piezas ya dicen a qué área pertenecen con <code>grid-area</code>. Las áreas deben ser <b>rectangulares</b>.</p>',
    objective:
      'El <b>huerto</b> ocupa un bloque de 2×2 arriba a la izquierda; el <b>pozo</b>, la columna derecha de esas dos filas; la <b>casa</b>, toda la fila de abajo.',
    hint: 'Tres cadenas, tres palabras cada una. La primera: <code>"huerto huerto pozo"</code>.',
    pieces: ['huerto', 'pozo', 'casa'],
    rules: [
      {
        selector: '.tablero',
        fixed: GRID_3,
        solution:
          'grid-template-areas:\n  "huerto huerto pozo"\n  "huerto huerto pozo"\n  "casa casa casa";',
      },
      areaRule('huerto'),
      areaRule('pozo'),
      areaRule('casa'),
    ],
  },
  {
    id: '4-2',
    region: 3,
    title: 'Cada cosa en su parcela',
    landmark: 'molino',
    allowed: ['grid-area'],
    speech: 'El plano ya está trazado: colina, bosque y lago. Ahora lleva cada cosa a su sitio.',
    theory:
      '<p>Ahora el plano está dibujado en el tablero. Solo tienes que decirle a cada pieza en qué área vive.</p><pre>.pieza { grid-area: cielo; }</pre>',
    objective:
      'El molino a la <b>colina</b>, la arboleda al <b>bosque</b> y el estanque al <b>lago</b>.',
    hint: '<code>grid-area: colina;</code> en el molino, y así con los demás.',
    pieces: ['molino', 'arboleda', 'estanque'],
    rules: [
      {
        selector: '.tablero',
        fixed:
          GRID_3 +
          '\ngrid-template-areas:\n  "colina colina colina"\n  "bosque lago lago"\n  "bosque lago lago";',
        editable: false,
      },
      { selector: '.molino', solution: 'grid-area: colina;' },
      { selector: '.arboleda', solution: 'grid-area: bosque;' },
      { selector: '.estanque', solution: 'grid-area: lago;' },
    ],
  },
  {
    id: '4-3',
    region: 3,
    title: 'Tierras en barbecho',
    landmark: 'flor',
    allowed: ['grid-template-areas'],
    speech:
      'Este año descansan varias parcelas. Márcalas con un punto y deja que la hierba crezca en ellas.',
    theory:
      '<p>Un punto <code>.</code> marca una celda vacía, que no pertenece a ningún área. Varios puntos seguidos (<code>...</code>) también cuentan como una sola celda.</p><pre>grid-template-areas:\n  "a a ."\n  ". b b";</pre>',
    objective:
      'El <b>trigal</b> ocupa el bloque 2×2 de arriba a la izquierda. Las <b>flores</b>, la última columna de las filas 2 y 3. El resto queda en barbecho.',
    hint: 'Cuatro palabras por cadena. Primera fila: <code>"trigal trigal . ."</code>.',
    pieces: ['trigal', 'flores'],
    rules: [
      {
        selector: '.tablero',
        fixed:
          'display: grid;\ngrid-template-columns: repeat(4, 1fr);\ngrid-template-rows: repeat(3, 1fr);\ngap: 8px;',
        solution:
          'grid-template-areas:\n  "trigal trigal . ."\n  "trigal trigal . flores"\n  ". . . flores";',
      },
      areaRule('trigal'),
      areaRule('flores'),
    ],
    checks: [{ rule: 0, pattern: /"[^"]*\.[^"]*"/, message: 'Usa puntos para las celdas vacías' }],
  },
  {
    id: '4-4',
    region: 3,
    title: 'El pueblo del valle',
    landmark: 'casa',
    allowed: ['grid-template-columns', 'grid-template-rows', 'grid-template-areas'],
    speech:
      'El pueblo entero en un plano: el camino arriba, el huerto a un lado, la plaza en el centro y el río abajo.',
    theory:
      '<p>Juntando pistas y áreas se describe un diseño completo de un vistazo: el plano dice <i>qué va dónde</i> y las plantillas, <i>cuánto mide</i> cada pista.</p>',
    objective:
      '<b>Camino</b> de 70px arriba, a todo lo ancho. <b>Huerto</b> de 110px a la izquierda. <b>Plaza</b> con el resto. <b>Río</b> de 50px abajo, a todo lo ancho.',
    hint: 'Columnas <code>110px 1fr</code>, filas <code>70px 1fr 50px</code> y un plano de 3 cadenas con 2 palabras.',
    pieces: ['camino', 'huerto', 'plaza', 'rio'],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: grid;\ngap: 8px;',
        solution:
          'grid-template-columns: 110px 1fr;\ngrid-template-rows: 70px 1fr 50px;\ngrid-template-areas:\n  "camino camino"\n  "huerto plaza"\n  "rio rio";',
      },
      areaRule('camino'),
      areaRule('huerto'),
      areaRule('plaza'),
      areaRule('rio'),
    ],
  },
  {
    id: '4-5',
    region: 3,
    title: 'El vado del valle',
    landmark: 'puente',
    allowed: ['grid-column', 'grid-row'],
    concepts: ['líneas con nombre'],
    speech:
      'He bautizado las líneas del valle: el río corre entre rio-inicio y rio-fin. Usa esos nombres, que los números se borran con la lluvia.',
    theory:
      '<p>Puedes bautizar las líneas escribiendo nombres entre corchetes en la plantilla, y después colocar las piezas por nombre en lugar de por número.</p><pre>grid-template-columns: [izq] 1fr [mitad] 1fr [der];\ngrid-column: mitad / der;</pre>',
    objective:
      'El <b>puente</b> va de <b>oeste</b> a <b>este</b> en la fila 2. La <b>barca</b> se amarra sobre el río, de <b>rio-inicio</b> a <b>rio-fin</b>, en la fila 3.',
    hint: 'Puente: <code>grid-column: oeste / este;</code> y <code>grid-row: 2;</code>.',
    pieces: ['#rio', 'puente', 'barca'],
    rules: [
      {
        selector: '.tablero',
        fixed:
          'display: grid;\ngrid-template-columns:\n  [oeste] 1fr [rio-inicio] 2fr\n  [rio-fin] 1fr [este];\ngrid-template-rows: repeat(3, 1fr);\ngap: 8px;',
        editable: false,
      },
      fixedRule('rio', 'grid-column: rio-inicio / rio-fin;\ngrid-row: 1 / -1;'),
      { selector: '.puente', solution: 'grid-column: oeste / este;\ngrid-row: 2;' },
      { selector: '.barca', solution: 'grid-column: rio-inicio / rio-fin;\ngrid-row: 3;' },
    ],
    checks: [
      {
        rule: 2,
        pattern: /grid-column\s*:\s*[a-z]/i,
        message: 'Coloca el puente con nombres de línea',
      },
      {
        rule: 3,
        pattern: /grid-column\s*:\s*[a-z]/i,
        message: 'Coloca la barca con nombres de línea',
      },
    ],
  },
  {
    id: '4-6',
    region: 3,
    title: 'El huerto del monte',
    landmark: 'cristal',
    allowed: ['grid-column', 'grid-row'],
    concepts: ['líneas con nombre'],
    speech: 'El monte ya tiene su área. Planta el huerto justo a sus pies, igual de ancho que él.',
    theory:
      '<p>Cada área con nombre crea líneas implícitas: <code>nombre-start</code> y <code>nombre-end</code>, en filas y en columnas. Puedes usarlas aunque nunca las hayas escrito.</p><pre>grid-column: torre-start / torre-end;</pre>',
    objective:
      'El huerto va <b>justo debajo</b> del monte, con su mismo ancho y una fila de alto, usando las líneas <code>monte-…</code>.',
    hint: 'Columnas: de <code>monte-start</code> a <code>monte-end</code>. Fila: empieza en <code>monte-end</code>.',
    pieces: ['monte', 'huerto'],
    rules: [
      {
        selector: '.tablero',
        fixed: `${GRID_3}\ngrid-template-areas:\n  "monte monte ."\n  "monte monte ."\n  ". . .";`,
        editable: false,
      },
      areaRule('monte'),
      {
        selector: '.huerto',
        solution: 'grid-column: monte-start / monte-end;\ngrid-row: monte-end;',
      },
    ],
    checks: [
      { rule: 2, pattern: /monte-(start|end)/, message: 'Usa las líneas monte-start y monte-end' },
    ],
  },
  {
    id: '4-7',
    region: 3,
    title: 'La granja de un trazo',
    landmark: 'molino',
    allowed: ['grid-template'],
    concepts: ['shorthand'],
    maxDeclarations: 1,
    speech: 'Un buen agrimensor dibuja la granja entera de un solo trazo, sin levantar la pluma.',
    theory:
      '<p><code>grid-template</code> es el atajo de filas, columnas y áreas a la vez. Cada cadena del plano va seguida del alto de su fila; tras la barra, las columnas.</p><pre>grid-template:\n  "a a" 50px\n  "b c" 1fr\n  / 100px 1fr;</pre>',
    objective:
      'Con <b>una sola</b> declaración: <b>camino</b> de 60px a todo lo ancho; debajo, la <b>casa</b> en 120px y el <b>trigal</b> con el resto.',
    hint: 'Dos cadenas, cada una con su alto, y <code>/ 120px 1fr</code> al final.',
    pieces: ['camino', 'casa', 'trigal'],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: grid;\ngap: 8px;',
        solution: 'grid-template:\n  "camino camino" 60px\n  "casa trigal" 1fr\n  / 120px 1fr;',
      },
      areaRule('camino'),
      areaRule('casa'),
      areaRule('trigal'),
    ],
  },

  //Region 5 · Lago de la Alineación
  {
    id: '5-1',
    region: 4,
    title: 'Los amarres',
    landmark: 'barca',
    allowed: ['justify-items'],
    speech:
      'Cada barca y cada pez tienen su amarre, pero la corriente los ha estirado. Céntralos en horizontal.',
    theory:
      '<p>Por defecto, cada pieza se estira para llenar su celda. <code>justify-items</code> la alinea en el eje <b>en línea</b> (el horizontal, en español): <code>start</code>, <code>end</code>, <code>center</code> o <code>stretch</code>.</p><pre>justify-items: start;</pre>',
    objective: 'Centra todas las piezas en horizontal dentro de sus celdas.',
    hint: 'El valor que buscas es <code>center</code>.',
    pieces: LAKE_6,
    rules: [{ selector: '.tablero', fixed: GRID_TALL, solution: 'justify-items: center;' }],
  },
  {
    id: '5-2',
    region: 4,
    title: 'Bajamar',
    landmark: 'pez',
    allowed: ['align-items'],
    speech: 'Ha bajado la marea: todo se posa en el fondo de su amarre.',
    theory:
      '<p><code>align-items</code> hace lo mismo en el eje de <b>bloque</b>, el vertical.</p><pre>align-items: center;</pre><p>Truco: <i>justify</i> es horizontal y <i>align</i>, vertical.</p>',
    objective: 'Apoya todas las piezas en el <b>fondo</b> de sus celdas.',
    hint: 'El final del eje vertical es <code>end</code>.',
    pieces: ['pez', 'barca', 'pez', 'barca', 'pez', 'barca'],
    rules: [{ selector: '.tablero', fixed: GRID_TALL, solution: 'align-items: end;' }],
  },
  {
    id: '5-3',
    region: 4,
    title: 'El ojo del remolino',
    landmark: 'nenufar',
    allowed: ['place-items'],
    concepts: ['shorthand'],
    maxDeclarations: 1,
    speech:
      'En el centro de cada celda el agua está en calma. Llévalo todo allí con un solo hechizo.',
    theory:
      '<p><code>place-items</code> es el atajo de <code>align-items</code> y <code>justify-items</code>. Con un solo valor, se aplica a los dos ejes.</p><pre>place-items: start;</pre>',
    objective: 'Centra las piezas en ambos ejes con <b>una sola</b> declaración.',
    hint: 'Un único valor basta.',
    pieces: ['nenufar', 'barca', 'nenufar', 'barca', 'nenufar', 'barca'],
    rules: [{ selector: '.tablero', fixed: GRID_TALL, solution: 'place-items: center;' }],
  },
  {
    id: '5-4',
    region: 4,
    title: 'Viento del noreste',
    landmark: 'nenufar',
    allowed: ['place-items'],
    concepts: ['shorthand'],
    maxDeclarations: 1,
    speech: 'El viento empuja todo hacia la esquina de abajo a la izquierda de cada celda.',
    theory:
      '<p>Con dos valores, <code>place-items</code> recibe primero el eje vertical (<i>align</i>) y después el horizontal (<i>justify</i>).</p><pre>place-items: start end;\n/* arriba y a la derecha */</pre>',
    objective:
      'Coloca cada pieza <b>abajo a la izquierda</b> de su celda, con una sola declaración.',
    hint: 'Vertical: <code>end</code>. Horizontal: <code>start</code>.',
    pieces: ['nenufar', 'pez', 'nenufar', 'pez', 'nenufar', 'pez'],
    rules: [{ selector: '.tablero', fixed: GRID_TALL, solution: 'place-items: end start;' }],
  },
  {
    id: '5-5',
    region: 4,
    title: 'El cofre a la deriva',
    landmark: 'cofre',
    allowed: ['justify-self', 'align-self'],
    speech:
      'Las barcas siguen bien amarradas, pero el cofre se ha soltado y flota hacia la esquina superior derecha.',
    theory:
      '<p><code>justify-self</code> y <code>align-self</code> alinean una sola pieza, por encima de lo que diga el contenedor.</p><pre>.pieza { align-self: center; }</pre>',
    objective:
      'Las barcas siguen estiradas. Lleva el cofre a la <b>esquina superior derecha</b> de su celda.',
    hint: 'Horizontal al final y vertical al principio.',
    pieces: ['barca', 'barca', 'barca', 'barca', 'cofre', 'barca'],
    rules: [
      { selector: '.tablero', fixed: GRID_TALL, editable: false },
      { selector: '.cofre', solution: 'justify-self: end;\nalign-self: start;' },
    ],
  },
  {
    id: '5-6',
    region: 4,
    title: 'El faro',
    landmark: 'faro',
    allowed: ['place-self'],
    concepts: ['shorthand'],
    maxDeclarations: 1,
    speech:
      'Los nenúfares flotan en el centro de su celda. El faro, en cambio, se apoya arriba y centrado, para verse desde la orilla.',
    theory:
      '<p><code>place-self</code> es el atajo de <code>align-self</code> y <code>justify-self</code>, en el mismo orden: primero el vertical, después el horizontal.</p><pre>place-self: center stretch;</pre>',
    objective:
      'Deja el faro <b>pegado arriba</b> y <b>centrado en horizontal</b>, con una sola declaración.',
    hint: 'Vertical: <code>start</code>. Horizontal: <code>center</code>.',
    pieces: ['nenufar', 'faro', 'nenufar', 'nenufar', 'nenufar', 'nenufar'],
    rules: [
      { selector: '.tablero', fixed: `${GRID_TALL}\nplace-items: center;`, editable: false },
      { selector: '.faro', solution: 'place-self: start center;' },
    ],
  },
  {
    id: '5-7',
    region: 4,
    title: 'Muelles repartidos',
    landmark: 'barca',
    allowed: ['justify-content'],
    speech:
      'Los muelles se han amontonado a un lado. Que el primero toque la orilla izquierda, el último la derecha, y el agua quede repartida entre ellos.',
    theory:
      '<p>Si las pistas son más pequeñas que el contenedor, sobra espacio. <code>justify-content</code> decide qué hacer con él en horizontal: mover <b>toda la cuadrícula</b> (<code>start</code>, <code>center</code>, <code>end</code>) o repartirlo entre pistas (<code>space-between</code>, <code>space-around</code>, <code>space-evenly</code>).</p>',
    objective:
      'Primera columna pegada a la izquierda, última pegada a la derecha y el espacio repartido entre ellas.',
    hint: 'El reparto que deja los extremos pegados es <code>space-between</code>.',
    pieces: LAKE_6,
    rules: [
      {
        selector: '.tablero',
        fixed:
          'display: grid;\ngrid-template-columns: repeat(3, 80px);\ngrid-template-rows: repeat(2, 80px);\ngap: 8px;',
        solution: 'justify-content: space-between;',
      },
    ],
  },
  {
    id: '5-8',
    region: 4,
    title: 'La marea',
    landmark: 'pez',
    allowed: ['align-content'],
    speech:
      'Que haya la misma agua por encima, entre las filas y por debajo. Así ningún muelle se queda en seco.',
    theory:
      '<p><code>align-content</code> reparte el espacio sobrante en vertical, con los mismos valores que <code>justify-content</code>.</p><pre>align-content: space-around;</pre><p><code>space-around</code> deja medio hueco en los bordes; <code>space-evenly</code>, huecos idénticos en todas partes.</p>',
    objective:
      'La cuadrícula ya está centrada en horizontal. Reparte el espacio vertical para que haya <b>el mismo hueco</b> por encima, entre las filas y por debajo.',
    hint: 'Huecos idénticos: <code>space-evenly</code>.',
    pieces: ['pez', 'barca', 'pez', 'barca', 'pez', 'barca'],
    rules: [
      {
        selector: '.tablero',
        fixed:
          'display: grid;\ngrid-template-columns: repeat(3, 80px);\ngrid-template-rows: repeat(2, 80px);\ngap: 8px;\njustify-content: center;',
        solution: 'align-content: space-evenly;',
      },
    ],
  },
  {
    id: '5-9',
    region: 4,
    title: 'Todo el lago',
    landmark: 'faro',
    allowed: ['place-content'],
    concepts: ['shorthand'],
    maxDeclarations: 1,
    speech:
      'Un solo hechizo para todo el lago: filas al centro y el agua repartida alrededor de cada columna.',
    theory:
      '<p><code>place-content</code> es el atajo de <code>align-content</code> y <code>justify-content</code>: primero el vertical, después el horizontal.</p><pre>place-content: end center;</pre>',
    objective:
      'Con una sola declaración: filas <b>centradas</b> en vertical; columnas con el espacio repartido <b>alrededor</b> de cada una.',
    hint: 'Vertical <code>center</code>, horizontal <code>space-around</code>.',
    pieces: ['barca', 'nenufar', 'barca', 'nenufar', 'barca', 'nenufar'],
    rules: [
      {
        selector: '.tablero',
        fixed:
          'display: grid;\ngrid-template-columns: repeat(3, 80px);\ngrid-template-rows: repeat(2, 80px);\ngap: 8px;',
        solution: 'place-content: center space-around;',
      },
    ],
  },
  {
    id: '5-10',
    region: 4,
    title: 'La regata',
    landmark: 'bandera',
    allowed: [
      'place-content',
      'place-items',
      'place-self',
      'align-content',
      'justify-content',
      'align-items',
      'justify-items',
      'align-self',
      'justify-self',
    ],
    speech:
      'Día de regata: las barcas en el centro de su calle, las calles pegadas arriba y abajo, y la isla de la meta llenando la suya.',
    theory:
      '<p>Tres niveles de alineación trabajan juntos: <code>*-content</code> mueve las pistas, <code>*-items</code> mueve las piezas dentro de sus celdas y <code>*-self</code> hace excepciones.</p>',
    objective:
      'Filas pegadas arriba y abajo con el espacio entre ellas; columnas centradas. Todas las piezas, centradas en su celda… salvo la isla, que llena la suya.',
    hint: 'Tablero: <code>place-content: space-between center</code> y <code>place-items: center</code>. Isla: <code>stretch</code>.',
    pieces: ['barca', 'pez', 'barca', 'pez', 'isla', 'pez', 'barca', 'pez', 'barca'],
    rules: [
      {
        selector: '.tablero',
        fixed:
          'display: grid;\ngrid-template-columns: repeat(3, 70px);\ngrid-template-rows: repeat(3, 70px);\ngap: 6px;',
        solution: 'place-content: space-between center;\nplace-items: center;',
      },
      { selector: '.isla', solution: 'place-self: stretch;' },
    ],
  },

  //Region 6 · Cumbres Implícitas
  {
    id: '6-1',
    region: 5,
    title: 'Terrazas de hielo',
    landmark: 'cristal',
    allowed: ['grid-auto-rows'],
    speech:
      'Solo tallé la primera terraza, de 80px. Las que la montaña abra por su cuenta deben medir 50px.',
    theory:
      '<p>Si hay más piezas que celdas, la cuadrícula crea pistas nuevas por su cuenta: la <b>cuadrícula implícita</b>. Por defecto miden <code>auto</code>; <code>grid-auto-rows</code> fija el tamaño de esas filas automáticas.</p><pre>grid-auto-rows: 100px;</pre><p>Sobre el tablero, las líneas implícitas se dibujan punteadas.</p>',
    objective:
      'Solo la primera fila está definida (80px). Haz que las filas que se crean solas midan <b>50px</b>.',
    hint: '<code>grid-auto-rows</code> con un único tamaño.',
    pieces: ['cristal', 'runa', 'cristal', 'runa', 'cristal', 'runa', 'cristal', 'runa', 'cristal'],
    rules: [
      {
        selector: '.tablero',
        fixed:
          'display: grid;\ngrid-template-columns: repeat(3, 1fr);\ngrid-template-rows: 80px;\ngap: 8px;',
        solution: 'grid-auto-rows: 50px;',
      },
    ],
  },
  {
    id: '6-2',
    region: 5,
    title: 'El descenso',
    landmark: 'runa',
    allowed: ['grid-auto-flow'],
    speech:
      'En la montaña primero se baja y luego se avanza. Que las piedras rúnicas llenen columna a columna.',
    theory:
      '<p><code>grid-auto-flow</code> decide cómo se colocan solas las piezas. Por defecto es <code>row</code>: rellenan fila a fila. Con <code>column</code> rellenan columna a columna, creando columnas nuevas.</p>',
    objective: 'Haz que las piezas bajen por columnas en lugar de avanzar por filas.',
    hint: 'El valor es <code>column</code>.',
    pieces: ['runa', 'cristal', 'runa', 'cristal', 'runa', 'cristal', 'runa'],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: grid;\ngrid-template-rows: repeat(3, 1fr);\ngap: 8px;',
        solution: 'grid-auto-flow: column;',
      },
    ],
  },
  {
    id: '6-3',
    region: 5,
    title: 'Cornisas',
    landmark: 'bandera',
    allowed: ['grid-auto-columns'],
    speech:
      'Las cornisas que se abren hacia la derecha deben medir 70px. Ni más, ni menos: el viento no perdona.',
    theory:
      '<p>Igual que <code>grid-auto-rows</code>, <code>grid-auto-columns</code> fija el tamaño de las columnas implícitas. Es la pareja natural de <code>grid-auto-flow: column</code>.</p>',
    objective: 'Las columnas que se crean solas deben medir <b>70px</b>.',
    hint: '<code>grid-auto-columns</code> con un tamaño fijo.',
    pieces: [
      'bandera',
      'cristal',
      'bandera',
      'cristal',
      'bandera',
      'cristal',
      'bandera',
      'cristal',
    ],
    rules: [
      {
        selector: '.tablero',
        fixed:
          'display: grid;\ngrid-template-rows: repeat(2, 1fr);\ngrid-auto-flow: column;\ngap: 8px;',
        solution: 'grid-auto-columns: 70px;',
      },
    ],
  },
  {
    id: '6-4',
    region: 5,
    title: 'Grietas en el glaciar',
    landmark: 'cristal',
    allowed: ['grid-auto-flow'],
    concepts: ['dense'],
    speech:
      'Los glaciares son tan anchos que dejan grietas al bajar. Los pinos pequeños podrían rellenarlas.',
    theory:
      '<p>El algoritmo de colocación nunca vuelve atrás: si una pieza grande no cabe, salta a la fila siguiente y deja huecos. Con <code>dense</code>, las piezas posteriores rellenan esos huecos.</p><pre>grid-auto-flow: dense;</pre><p>Cuidado: el orden visual deja de coincidir con el del HTML, algo a tener en cuenta para quien navega con teclado.</p>',
    objective: 'Elimina los huecos dejando que las piezas pequeñas los rellenen.',
    hint: 'La palabra clave es <code>dense</code> (equivale a <code>row dense</code>).',
    pieces: ['glaciar', 'pino', 'refugio', 'glaciar', 'pino', 'pino'],
    rules: [
      {
        selector: '.tablero',
        fixed:
          'display: grid;\ngrid-template-columns: repeat(4, 1fr);\ngrid-auto-rows: 70px;\ngap: 8px;',
        solution: 'grid-auto-flow: dense;',
      },
      { selector: '.glaciar', fixed: 'grid-column: span 3;', editable: false },
      { selector: '.refugio', fixed: 'grid-column: span 2;', editable: false },
    ],
    checks: [{ rule: 0, pattern: /dense/, message: 'Usa dense' }],
  },
  {
    id: '6-5',
    region: 5,
    title: 'El pinar que se adapta',
    landmark: 'bandera',
    allowed: ['grid-template-columns'],
    concepts: ['auto-fill', 'repeat()'],
    width: 440,
    widths: [440, 280],
    speech:
      'El pinar crece según el ancho de la ladera: columnas de 90px, tantas como quepan, sea la ladera ancha o estrecha.',
    theory:
      '<p>En <code>repeat()</code>, en lugar de un número puedes escribir <code>auto-fill</code>: crea tantas columnas como quepan en el contenedor. Es la base de las cuadrículas adaptables sin media queries.</p><pre>grid-template-columns: repeat(auto-fill, 120px);</pre><p>Se juzga con dos anchos de tablero.</p>',
    objective: 'Columnas de <b>90px</b>, tantas como quepan en cada ancho.',
    hint: '<code>repeat(auto-fill, 90px)</code>.',
    pieces: ['pino', 'runa', 'pino', 'runa', 'pino'],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: grid;\ngrid-auto-rows: 70px;\ngap: 10px;',
        solution: 'grid-template-columns: repeat(auto-fill, 90px);',
      },
    ],
    checks: [{ pattern: /auto-fill/, message: 'Usa auto-fill' }],
  },
  {
    id: '6-6',
    region: 5,
    title: 'Los tres refugios',
    landmark: 'casa',
    allowed: ['grid-template-columns'],
    concepts: ['auto-fit', 'minmax()', 'repeat()'],
    width: 520,
    widths: [520, 300],
    speech:
      'Tres refugios de al menos 100px que aprovechen toda la ladera. Nada de dejar huecos vacíos para la ventisca.',
    theory:
      '<p><code>auto-fit</code> crea las mismas columnas que <code>auto-fill</code>, pero <b>colapsa las vacías</b>. Combinado con <code>minmax()</code>, las piezas se estiran hasta ocupar todo el ancho.</p><pre>repeat(auto-fit, minmax(150px, 1fr))</pre>',
    objective:
      'Columnas de al menos <b>100px</b> que se estiren para llenar el ancho, sin dejar columnas vacías. Compruébalo en ambos anchos.',
    hint: '<code>repeat(auto-fit, minmax(100px, 1fr))</code>.',
    pieces: ['refugio', 'refugio', 'refugio'],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: grid;\ngrid-auto-rows: 80px;\ngap: 10px;',
        solution: 'grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));',
      },
    ],
    checks: [
      { pattern: /auto-fit/, message: 'Usa auto-fit' },
      { pattern: /minmax\s*\(/, message: 'Usa minmax()' },
    ],
  },
  {
    id: '6-7',
    region: 5,
    title: 'El campamento base',
    landmark: 'tienda',
    allowed: ['grid'],
    concepts: ['shorthand'],
    maxDeclarations: 1,
    speech:
      'Antes de la cumbre, el campamento: tres columnas de tiendas y filas automáticas de 60px. Un solo hechizo, que aquí arriba falta el aire.',
    theory:
      '<p><code>grid</code> es el atajo más poderoso: incluye las plantillas y también la cuadrícula implícita. Con <code>auto-flow</code> en un lado de la barra, defines las pistas automáticas de ese eje.</p><pre>grid: auto-flow 80px / repeat(2, 1fr);\n/* filas automáticas de 80px y 2 columnas */</pre>',
    objective:
      'Con una sola declaración: <b>3 columnas</b> iguales y filas automáticas de <b>60px</b>.',
    hint: 'Filas a la izquierda de la barra: <code>auto-flow 60px</code>.',
    pieces: ['tienda', 'bandera', 'tienda', 'bandera', 'tienda', 'bandera', 'tienda'],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: grid;\ngap: 8px;',
        solution: 'grid: auto-flow 60px / repeat(3, 1fr);',
      },
    ],
  },

  //Region 7 · Dunas de Ámbar
  {
    id: '7-1',
    region: 6,
    title: 'El cartel más largo',
    landmark: 'moneda',
    allowed: ['grid-template-columns'],
    concepts: ['max-content'],
    speech:
      '¡Bienvenido a mi puesto, cliente de primerísima caridad! Los carteles se me cortan por todas partes: quiero la columna de carteles tan ancha como el más largo, ni un cénimo más.',
    theory:
      '<p>Además de medidas fijas y fracciones, una pista puede medirse por su <b>contenido</b>. <code>max-content</code> es el ancho que necesita el contenido para no partirse en ninguna línea.</p><pre>grid-template-columns: max-content 1fr;</pre><p>Así la primera columna se ajusta al cartel más largo, sin saltos de línea.</p>',
    objective:
      'La columna de los carteles mide exactamente lo que el cartel más largo, sin partir ninguna línea. Las mercancías se quedan el resto.',
    hint: 'Primera columna <code>max-content</code>, segunda <code>1fr</code>.',
    pieces: [
      'cartel:Dátiles',
      'alfombra',
      'cartel:Alfombras casi voladoras',
      'jarron',
      'cartel:Agua fresca',
      'oasis',
    ],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: grid;\ngap: 8px;',
        solution: 'grid-template-columns: max-content 1fr;',
      },
    ],
    checks: [{ pattern: /max-content/, message: 'Usa max-content' }],
    farewell:
      'Ahora sí: los carteles se leen de punta a punta. Esto es un negocio redondamente cuadrado.',
  },
  {
    id: '7-2',
    region: 6,
    title: 'Toldos apretados',
    landmark: 'jarron',
    allowed: ['grid-template-columns'],
    concepts: ['min-content'],
    speech:
      'El toldo de los carteles me ocupa medio desierto. Estréchalo todo lo que puedas, pero sin partir ninguna palabra, que luego los clientes leen «Alfom-» y salen corriendo.',
    theory:
      '<p><code>min-content</code> es lo contrario: el ancho más pequeño posible sin desbordar, que es el de la palabra más larga. El texto salta de línea en cada espacio.</p><pre>grid-template-columns: min-content 1fr;</pre>',
    objective:
      'La columna de carteles mide lo que su palabra más larga: las palabras pueden bajar de línea, pero ninguna se parte.',
    hint: 'Primera columna <code>min-content</code>, segunda <code>1fr</code>.',
    pieces: [
      'cartel:Telas de seda fina',
      'alfombra',
      'cartel:Especias del sur',
      'jarron',
      'cartel:Lámparas mágicas',
      'oasis',
    ],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: grid;\ngap: 8px;',
        solution: 'grid-template-columns: min-content 1fr;',
      },
    ],
    checks: [{ pattern: /min-content/, message: 'Usa min-content' }],
  },
  {
    id: '7-3',
    region: 6,
    title: 'Ni tan tanto ni tan calvo',
    landmark: 'palmera',
    allowed: ['grid-template-columns'],
    concepts: ['fit-content()'],
    speech:
      'Quiero los carteles anchos, pero no más de 140px, que la lona del toldo cuesta un ojo de la carta. Ni tan tanto ni tan calvo, como decía mi abuela.',
    theory:
      '<p><code>fit-content(límite)</code> se ajusta al contenido como <code>max-content</code>, pero no pasa del límite que le des (salvo que una palabra no quepa).</p><pre>grid-template-columns: fit-content(200px) 1fr;</pre>',
    objective:
      'La columna de carteles se ajusta a su contenido, pero sin pasar de <b>140px</b>: los carteles largos saltan de línea al llegar al límite.',
    hint: '<code>fit-content(140px)</code> y después <code>1fr</code>.',
    pieces: [
      'cartel:Higos',
      'alfombra',
      'cartel:Tinajas de barro cocido al sol',
      'jarron',
      'cartel:Sal',
      'oasis',
    ],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: grid;\ngap: 8px;',
        solution: 'grid-template-columns: fit-content(140px) 1fr;',
      },
    ],
    checks: [{ pattern: /fit-content\s*\(/, message: 'Usa fit-content()' }],
  },
  {
    id: '7-4',
    region: 6,
    title: 'El cartel kilométrico',
    landmark: 'jarron',
    labels: false,
    allowed: ['grid-template-columns'],
    concepts: ['minmax()', 'minmax(0, 1fr)'],
    speech:
      'Mi sobrino ha pintado un cartel con una palabra larguísima y ahora las columnas del puesto están descompensadas. ¡Qué desfalco! Tres columnas iguales, como siempre.',
    theory:
      '<p>Un detalle traicionero: <code>1fr</code> equivale a <code>minmax(auto, 1fr)</code>, y ese <code>auto</code> impide que la columna sea más estrecha que su contenido. Una palabra enorme ensancha su columna.</p><pre>grid-template-columns: repeat(3, minmax(0, 1fr));</pre><p>Con mínimo <code>0</code> las columnas son iguales pase lo que pase. Los carteles tienen <code>min-width: auto</code>, el valor normal de un elemento de grid.</p>',
    objective:
      'Las tres columnas deben medir lo mismo, aunque el cartel del sobrino no quepa entero.',
    hint: 'Cambia <code>1fr</code> por <code>minmax(0, 1fr)</code> dentro del <code>repeat()</code>.',
    pieces: [
      'cartel:Bienvenidos',
      'cartel:Superalfombrasvoladorasdesegundamano',
      'cartel:Ofertas',
      'alfombra',
      'jarron',
      'oasis',
    ],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: grid;\ngap: 8px;',
        initial: 'grid-template-columns: repeat(3, 1fr);',
        solution: 'grid-template-columns: repeat(3, minmax(0, 1fr));',
      },
      { selector: '.cartel', fixed: 'min-width: auto;', editable: false },
    ],
    checks: [{ pattern: /minmax\s*\(\s*0/, message: 'Usa minmax(0, 1fr)' }],
  },
  {
    id: '7-5',
    region: 6,
    title: 'El regateo',
    landmark: 'moneda',
    variant: 'regateo',
    purse: { price: 5, total: 15 },
    allowed: [
      'grid-template-columns',
      'grid-template-rows',
      'grid-template',
      'grid',
      'gap',
      'row-gap',
      'column-gap',
      'grid-column',
      'grid-column-start',
      'grid-column-end',
      'grid-area',
    ],
    concepts: ['shorthand'],
    speech:
      'Aquí todo se paga, cliente. Cada runa cuesta 5 ámbar y en tu bolsa solo hay 15. Si te pasas, no hay trato. ¡A regatear, que el regateo es la sal de la vía!',
    theory:
      '<p>Los atajos no solo ahorran tinta: aquí ahorran ámbar. <code>grid-template</code> define filas y columnas a la vez, <code>gap</code> los dos huecos y <code>grid-column</code> el inicio y el fin de una pieza.</p><pre>grid-template: 50px 1fr / 1fr 1fr;</pre>',
    objective:
      'Columnas <b>1fr 2fr 1fr</b>; filas de <b>80px</b> y el resto; huecos de <b>10px</b> entre filas y <b>20px</b> entre columnas. La caravana cruza toda la primera fila. Todo por <b>15 ámbar</b> como mucho.',
    hint: 'Tres runas: <code>grid-template</code>, <code>gap</code> con dos valores y <code>grid-column: 1 / -1</code> en la caravana.',
    pieces: ['caravana', 'jaima', 'oasis', 'jaima'],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: grid;',
        solution: 'grid-template: 80px 1fr / 1fr 2fr 1fr;\ngap: 10px 20px;',
      },
      { selector: '.caravana', solution: 'grid-column: 1 / -1;' },
    ],
    farewell:
      '¡Trato hecho! Vamos a desenmorsar… digo, a desembolsar. Ha sido un placer hacer negocios contigo.',
  },
  {
    id: '7-6',
    region: 6,
    title: 'Tormenta de arena',
    landmark: 'camello',
    variant: 'contra reloj',
    timeLimit: 150,
    allowed: ['grid-template-areas'],
    speech:
      '¡Se acerca una tormenta! Monta el campamento antes de que la arena lo cubra todo. Corre, que el tiempo es oro… y el oro, mío.',
    theory:
      '<p>Repaso a contrarreloj: un plano de áreas como en el valle. El reloj se pone en marcha cuando escribas la primera runa. Si la arena te alcanza, sacúdela y vuelve a intentarlo.</p>',
    objective:
      'Las <b>jaimas</b> ocupan toda la fila de arriba; los <b>camellos</b>, la columna izquierda de las dos filas de abajo; el <b>oasis</b>, el resto.',
    hint: '<code>"jaima jaima jaima" "camello oasis oasis" "camello oasis oasis"</code>.',
    pieces: ['jaima', 'camello', 'oasis'],
    rules: [
      {
        selector: '.tablero',
        fixed:
          'display: grid;\ngrid-template-columns: repeat(3, 1fr);\ngrid-template-rows: repeat(3, 1fr);\ngap: 8px;',
        solution:
          'grid-template-areas:\n  "jaima jaima jaima"\n  "camello oasis oasis"\n  "camello oasis oasis";',
      },
      areaRule('jaima'),
      areaRule('camello'),
      areaRule('oasis'),
    ],
    farewell: '¡Por los pelos! Si llegas a tardar un poco más, te cobro la arena.',
  },
  {
    id: '7-7',
    region: 6,
    title: 'Espejismo',
    landmark: 'palmera',
    variant: 'sin huellas',
    mirage: true,
    allowed: ['grid-column', 'grid-row', 'grid-area'],
    speech:
      'Ese oasis que ves… ¿es de verdad o un espejismo? Con este calor, las huellas aparecen y desaparecen. Fíjate bien cuando brillen.',
    theory:
      '<p>Aquí las huellas son un espejismo: solo se ven un instante de vez en cuando. Usa las líneas numeradas y lo que ya sabes de <code>grid-column</code> y <code>grid-row</code>.</p>',
    objective:
      'Una palmera a cada lado del oasis, en la <b>fila 3</b>: la <b>izquierda</b> en la columna 1 y la <b>derecha</b> en la columna 5. La <b>caravana</b> cruza toda la fila 5.',
    hint: 'La caravana: <code>grid-column: 1 / -1</code> y <code>grid-row: 5</code>.',
    pieces: ['#oasis', 'palmera@izquierda', 'palmera@derecha', 'caravana'],
    rules: [
      { selector: '.tablero', fixed: GRID_5, editable: false },
      fixedRule('oasis', 'grid-area: 2 / 2 / 5 / 5;'),
      { selector: '.izquierda', solution: 'grid-column: 1;\ngrid-row: 3;' },
      { selector: '.derecha', solution: 'grid-column: 5;\ngrid-row: 3;' },
      { selector: '.caravana', solution: 'grid-column: 1 / -1;\ngrid-row: 5;' },
    ],
    farewell: 'Era de verdad, ¡y ahora es mío! Te hago un desfuento la próxima vez.',
  },

  //Region 8 · Aldea de los Farolillos
  {
    id: '8-1',
    region: 7,
    title: 'El gallo madrugador',
    landmark: 'gallo',
    allowed: ['order'],
    concepts: [],
    speech:
      'Cada mañana el gallo tiene que ser el primero en salir del gallinero, ¡y hoy se ha quedado dormido al final de la fila!',
    theory:
      '<p><code>order</code> cambia el orden en que se colocan las piezas, sin tocar el HTML. Todas valen <code>0</code> por defecto; un número menor va antes.</p><pre>.pieza { order: -1; } /* pasa delante de todas */</pre>',
    objective: 'Que el gallo sea el primero de la fila, sin mover a nadie más.',
    hint: 'Un número menor que <code>0</code> en el gallo.',
    pieces: [
      'gallina@blanca',
      'gallina@marron',
      'pollito',
      'gallina@blanca',
      'gallina@marron',
      'gallo',
    ],
    rules: [
      {
        selector: '.tablero',
        fixed:
          'display: grid;\ngrid-template-columns: repeat(3, 1fr);\ngrid-template-rows: repeat(2, 1fr);\ngap: 8px;',
        editable: false,
      },
      { selector: '.gallo', solution: 'order: -1;' },
    ],
    farewell: '¡Quiquiriquí! Ya era hora. Gallo que madruga, la aldea lo ayuda.',
  },
  {
    id: '8-2',
    region: 7,
    title: 'Las gallinas revoltosas',
    landmark: 'gallina',
    variant: 'minijuego',
    labels: false,
    allowed: ['order'],
    speech:
      'Se han escapado todas y se han mezclado. Quiero una fila de gallinas blancas, otra de marrones y otra de negras. ¡Y que dejen de corretear de una vez!',
    theory:
      '<p>Puedes dar el mismo <code>order</code> a un grupo entero: las piezas con el mismo valor conservan entre ellas el orden del HTML.</p><pre>.blanca { order: 1; }\n.negra { order: 3; }</pre>',
    objective:
      'Primera fila, las cuatro <b>blancas</b>; segunda, las <b>marrones</b>; tercera, las <b>negras</b>.',
    hint: 'Dale a cada color un número: <code>1</code>, <code>2</code> y <code>3</code>.',
    pieces: [
      'gallina@negra',
      'gallina@blanca',
      'gallina@marron',
      'gallina@blanca',
      'gallina@negra',
      'gallina@marron',
      'gallina@marron',
      'gallina@blanca',
      'gallina@negra',
      'gallina@negra',
      'gallina@blanca',
      'gallina@marron',
    ],
    rules: [
      {
        selector: '.tablero',
        fixed:
          'display: grid;\ngrid-template-columns: repeat(4, 1fr);\ngrid-template-rows: repeat(3, 1fr);\ngap: 8px;',
        editable: false,
      },
      { selector: '.blanca', solution: 'order: 1;' },
      { selector: '.marron', solution: 'order: 2;' },
      { selector: '.negra', solution: 'order: 3;' },
    ],
    farewell: '¡Qué orden! Ni el mercado del desierto. Toma, un huevo recién puesto.',
  },
  {
    id: '8-3',
    region: 7,
    title: 'El puente rojo',
    landmark: 'koi',
    labels: false,
    allowed: ['grid-row', 'grid-column', 'grid-area', 'z-index'],
    concepts: [],
    speech:
      'Las carpas del estanque nadan por encima del puente y los vecinos se mojan los pies. El puente tiene que quedar por encima de los peces.',
    theory:
      '<p>En una cuadrícula, dos piezas pueden ocupar las mismas celdas: la que va después en el HTML se pinta encima. <code>z-index</code> cambia ese orden, y en los elementos de grid funciona sin necesidad de <code>position</code>.</p><pre>.pieza { z-index: 1; }</pre><p>Fíjate: el estanque ocupa todas las celdas, así que el puente sin colocar se va a una fila nueva.</p>',
    objective:
      'Tiende el puente por la <b>fila 2</b>, de punta a punta, y haz que quede <b>por encima</b> de las carpas.',
    hint: '<code>grid-row: 2</code>, <code>grid-column: 1 / -1</code> y un <code>z-index</code> positivo.',
    pieces: ['#charca', 'puente', '#koi@uno', '#koi@dos'],
    rules: [
      {
        selector: '.tablero',
        fixed:
          'display: grid;\ngrid-template-columns: repeat(5, 1fr);\ngrid-template-rows: repeat(3, 1fr);',
        editable: false,
      },
      fixedRule('charca', 'grid-area: 1 / 1 / -1 / -1;'),
      fixedRule('uno', 'grid-area: 1 / 2 / 3 / 3;'),
      fixedRule('dos', 'grid-area: 2 / 4 / 4 / 5;'),
      { selector: '.puente', solution: 'grid-row: 2;\ngrid-column: 1 / -1;\nz-index: 1;' },
    ],
    above: [{ upper: 'puente', lower: 'koi', message: 'El puente queda por encima de las carpas' }],
    farewell: 'Ahora las carpas pasan por debajo y nadie se moja. Ven, que te invito a un té.',
  },
  {
    id: '8-4',
    region: 7,
    title: 'Farolillos del festival',
    landmark: 'farolillo',
    variant: 'musical',
    musical: true,
    className: 'festival',
    labels: false,
    allowed: ['align-self'],
    speech:
      'Esta noche es el festival. Cuelga cada farolillo a su altura y, cuando estén todos, sonará la canción de la aldea.',
    theory:
      '<p>Repaso con música: <code>align-self</code> coloca cada farolillo en vertical dentro de su celda. Cada farolillo que cuelgues en su sitio dará su nota.</p><pre>.alto { align-self: start; }</pre>',
    objective:
      'Los farolillos <b>altos</b> arriba, los <b>medios</b> en el centro y los <b>bajos</b> abajo.',
    hint: '<code>start</code>, <code>center</code> y <code>end</code>.',
    pieces: [
      'farolillo@bajo',
      'farolillo@medio',
      'farolillo@alto',
      'farolillo@medio',
      'farolillo@bajo',
      'farolillo@medio',
      'farolillo@alto',
    ],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: grid;\ngrid-template-columns: repeat(7, 1fr);\ngap: 6px;',
        editable: false,
      },
      { selector: '.alto', solution: 'align-self: start;' },
      { selector: '.medio', solution: 'align-self: center;' },
      { selector: '.bajo', solution: 'align-self: end;' },
    ],
    farewell: '¡Qué bonito suena! Hacía años que la aldea no brillaba así.',
  },
  {
    id: '8-5',
    region: 7,
    title: 'El zorro y el gallinero',
    landmark: 'zorro',
    variant: 'minijuego',
    labelPinned: false,
    allowed: ['grid-column', 'grid-row', 'grid-area'],
    speech:
      '¡Un zorro ronda el gallinero! Levanta las vallas para cerrarle el paso antes de que se cuele.',
    theory:
      '<p>Repaso de líneas: coloca cada valla con <code>grid-column</code> y <code>grid-row</code>. Las piezas pueden cruzarse en una celda si las colocas tú.</p>',
    objective:
      'La <b>valla larga</b> recorre la fila 2 desde la línea 1 hasta la 5. La <b>valla corta</b> baja por la columna 4 desde la fila 2 hasta el final.',
    hint: 'Larga: <code>grid-row: 2</code> y <code>grid-column: 1 / 5</code>. Corta: <code>grid-column: 4</code> y <code>grid-row: 2 / -1</code>.',
    pieces: [
      '#zorro',
      '#gallina@blanca',
      '#gallina@marron',
      '#gallina@negra',
      'valla@larga',
      'valla@corta',
    ],
    rules: [
      { selector: '.tablero', fixed: GRID_5, editable: false },
      fixedRule('zorro', 'grid-area: 1 / 5;'),
      fixedRule('blanca', 'grid-area: 3 / 1;'),
      fixedRule('marron', 'grid-area: 4 / 2;'),
      fixedRule('negra', 'grid-area: 5 / 3;'),
      { selector: '.larga', solution: 'grid-row: 2;\ngrid-column: 1 / 5;' },
      { selector: '.corta', solution: 'grid-column: 4;\ngrid-row: 2 / -1;' },
    ],
    farewell: '¡Se ha ido con el rabo entre las piernas! Esta noche dormiremos tranquilas.',
  },

  //Region 9 · Ciudadela del Arquitecto · PRUEBA DE APRENDIZAJE
  {
    id: '9-1',
    region: 8,
    exam: true,
    title: 'Las puertas de la ciudadela',
    landmark: 'bandera',
    allowed: DESIGN_PROPS,
    speech:
      'Bienvenida, bienvenido. La ciudadela está en blanco: almenas arriba, puerta abajo y, en medio, jardín, patio y biblioteca.',
    theory:
      '<p>Un clásico de la arquitectura web, el «santo grial»: cabecera, menú, contenido, lateral y pie. Esta vez el tablero está en blanco y tienes las runas de plantilla y de colocación.</p><p>Hay muchas soluciones válidas: con líneas, con áreas o con atajos.</p>',
    objective:
      'Columnas: <b>90px</b>, flexible y <b>90px</b>. Filas: <b>60px</b>, flexible y <b>50px</b>. Huecos de <b>8px</b>. Almenas y puerta a todo lo ancho; en medio, jardín, patio y biblioteca.',
    hint: 'Si las almenas y la puerta abarcan <code>1 / -1</code>, las otras tres piezas se colocan solas en la fila central.',
    pieces: ['almenas', 'jardin', 'patio', 'biblioteca', 'puerta'],
    rules: [
      {
        selector: '.tablero',
        solution:
          'display: grid;\ngrid-template-columns: 90px 1fr 90px;\ngrid-template-rows: 60px 1fr 50px;\ngap: 8px;',
      },
      { selector: '.almenas', solution: 'grid-column: 1 / -1;' },
      { selector: '.jardin' },
      { selector: '.patio' },
      { selector: '.biblioteca' },
      { selector: '.puerta', solution: 'grid-column: 1 / -1;' },
    ],
  },
  {
    id: '9-2',
    region: 8,
    exam: true,
    title: 'La sala de mapas',
    landmark: 'sello',
    allowed: DESIGN_PROPS,
    concepts: ['span'],
    speech:
      'En esta sala se guarda el atlas de las ruinas. Que ocupe el sitio de honor; la torre vigía, toda la pared del fondo.',
    theory:
      '<p>Los paneles de datos son cuadrículas puras: una pieza grande, una columna lateral alta y piezas pequeñas que se colocan solas en los huecos libres.</p>',
    objective:
      'Cuadrícula de <b>4 columnas × 3 filas</b> iguales con huecos de <b>10px</b>. El <b>atlas</b> abarca 3 columnas y 2 filas arriba a la izquierda; la <b>vigía</b>, toda la última columna; los tres objetos, debajo del atlas.',
    hint: 'Las piezas con posición fija se colocan primero. Prueba <code>grid-row: 1 / -1</code> en la vigía.',
    pieces: ['atlas', 'vigia', 'farol', 'cofre', 'llave'],
    rules: [
      {
        selector: '.tablero',
        solution:
          'display: grid;\ngrid-template-columns: repeat(4, 1fr);\ngrid-template-rows: repeat(3, 1fr);\ngap: 10px;',
      },
      { selector: '.atlas', solution: 'grid-column: span 3;\ngrid-row: span 2;' },
      { selector: '.vigia', solution: 'grid-column: 4;\ngrid-row: 1 / -1;' },
    ],
  },
  {
    id: '9-3',
    region: 8,
    exam: true,
    title: 'El gran mosaico',
    landmark: 'cristal',
    allowed: [
      'display',
      'grid-template-columns',
      'grid-auto-rows',
      'grid-auto-flow',
      'gap',
      'grid-column',
      'grid-row',
      'grid-area',
      'grid',
    ],
    concepts: ['span', 'dense'],
    speech:
      'El suelo del gran salón es un mosaico de piezas de todos los tamaños. Ni una baldosa vacía, por favor.',
    theory:
      '<p>Las maquetas tipo revista mezclan piezas de tamaños distintos. Con filas automáticas, <code>span</code> y <code>dense</code> consigues un mosaico compacto sin calcular ni una posición.</p>',
    objective:
      '<b>4 columnas</b> iguales, filas automáticas de <b>80px</b> y huecos de <b>8px</b>. El <b>vitral</b> ocupa 2×2 y el <b>tapiz</b>, 3 columnas. Ningún hueco vacío.',
    hint: 'Los huecos desaparecen con <code>grid-auto-flow: dense</code>.',
    pieces: ['farol', 'vitral', 'flor', 'tapiz', 'runa', 'cristal', 'manzana', 'llave'],
    rules: [
      {
        selector: '.tablero',
        solution:
          'display: grid;\ngrid-template-columns: repeat(4, 1fr);\ngrid-auto-rows: 80px;\ngrid-auto-flow: dense;\ngap: 8px;',
      },
      { selector: '.vitral', solution: 'grid-column: span 2;\ngrid-row: span 2;' },
      { selector: '.tapiz', solution: 'grid-column: span 3;' },
    ],
  },
  {
    id: '9-4',
    region: 8,
    exam: true,
    title: 'La galería viva',
    landmark: 'runa',
    allowed: [
      'display',
      'grid-template-columns',
      'grid-auto-rows',
      'grid-auto-flow',
      'gap',
      'grid-column',
      'grid-row',
      'grid-area',
      'grid',
    ],
    concepts: ['auto-fill', 'minmax()', 'span', 'dense'],
    width: 520,
    height: 420,
    widths: [520, 300],
    speech:
      'La galería cambia de tamaño según la luz del día. Sus vitrinas deben recolocarse solas, con la estatua siempre bien a la vista.',
    theory:
      '<p>Una galería que se adapta sola a cualquier ancho, sin media queries: columnas con <code>auto-fill</code> y <code>minmax()</code>, filas automáticas y una pieza destacada.</p>',
    objective:
      'Columnas de al menos <b>90px</b> que se estiren, tantas como quepan; filas automáticas de <b>70px</b>; huecos de <b>8px</b>. La <b>estatua</b> ocupa 2×2. Ningún hueco vacío, en ambos anchos.',
    hint: '<code>repeat(auto-fill, minmax(90px, 1fr))</code>, <code>span 2</code> en ambos ejes y <code>dense</code>.',
    pieces: ['flor', 'manzana', 'estatua', 'cristal', 'runa', 'pez', 'bellota'],
    rules: [
      {
        selector: '.tablero',
        solution:
          'display: grid;\ngrid-template-columns: repeat(auto-fill, minmax(90px, 1fr));\ngrid-auto-rows: 70px;\ngrid-auto-flow: dense;\ngap: 8px;',
      },
      { selector: '.estatua', solution: 'grid-column: span 2;\ngrid-row: span 2;' },
    ],
  },
  {
    id: '9-5',
    region: 8,
    exam: true,
    title: 'El corazón de la ciudadela',
    landmark: 'sello',
    allowed: ['display', 'grid', 'grid-area', 'place-self', 'gap'],
    concepts: ['shorthand'],
    speech:
      'La última sala. Aquí solo valen los atajos: demuestra que dominas la cuadrícula y el sello de las ruinas volverá a brillar.',
    theory:
      '<p>Solo se permiten atajos. Demuestra que dominas <code>grid</code>, <code>grid-area</code> y <code>place-self</code>.</p><p>Un secreto: dos piezas pueden compartir la misma área.</p>',
    objective:
      'Columnas: flexible y <b>120px</b>. Filas: <b>70px</b>, flexible y <b>60px</b>. Huecos de <b>10px</b>. Las <b>almenas</b> cruzan arriba; el <b>patio</b> ocupa la columna izquierda de las dos filas inferiores; <b>biblioteca</b> y <b>puerta</b> van a su derecha. El <b>sello</b> brilla en el centro del patio.',
    hint: '<code>grid</code> admite el plano completo, como <code>grid-template</code>. El sello comparte área con el patio y se centra con <code>place-self</code>.',
    pieces: ['almenas', 'patio', 'biblioteca', 'puerta', 'sello'],
    rules: [
      {
        selector: '.tablero',
        solution:
          'display: grid;\ngrid:\n  "almenas almenas" 70px\n  "patio biblioteca" 1fr\n  "patio puerta" 60px\n  / 1fr 120px;\ngap: 10px;',
      },
      areaRule('almenas'),
      areaRule('biblioteca'),
      areaRule('puerta'),
      { selector: '.patio', solution: 'grid-area: patio;' },
      { selector: '.sello', solution: 'grid-area: patio;\nplace-self: center;' },
    ],
    farewell: 'El sello vuelve a brillar. Ya eres arquitecta, arquitecto de la cuadrícula.',
  },

  // ───────────────────────────── Lugares secretos
  {
    id: 'S-1',
    region: 9,
    title: 'El tesoro del naufragio',
    landmark: 'ancla',
    variant: 'secreto',
    terrain: 'lago',
    character: 'El capitán Percebe',
    role: 'fantasma',
    portrait: 'pj-s1',
    secret: {
      x: 0.905,
      y: 0.815,
      width: 0.11,
      drawing: 'naufragio',
      hint: 'Algo naufragó junto a un arrecife, al sureste.',
    },
    allowed: ['grid-area', 'z-index'],
    concepts: ['shorthand'],
    speech:
      '¡Arr! Mi barco se hundió y se deshizo en tablones. Vuelve a montarlo pieza a pieza y te dejaré ver el cofre… que, por cierto, tiene que asomar por encima del casco.',
    theory:
      '<p>Un barco dibujado solo con <code>grid-area</code>: cuatro números por pieza (fila inicio / columna inicio / fila fin / columna fin). Y para que una pieza quede delante de otra, <code>z-index</code>.</p>',
    objective:
      '<b>Casco</b>: filas 4 y 5, de borde a borde. <b>Mástil</b>: columna 3, filas 1 a 3. <b>Vela</b>: columnas 4 y 5, filas 1 y 2. <b>Bandera</b>: fila 1, columna 2. <b>Cofre</b>: fila 4, columna 3, por encima del casco.',
    hint: 'Casco: <code>4 / 1 / 6 / 6</code>. Mástil: <code>1 / 3 / 4 / 4</code>. Vela: <code>1 / 4 / 3 / 6</code>.',
    pieces: ['cofre', 'casco', 'mastil', 'vela', 'bandera'],
    rules: [
      {
        selector: '.tablero',
        fixed:
          'display: grid;\ngrid-template-columns: repeat(5, 1fr);\ngrid-template-rows: repeat(5, 1fr);\ngap: 4px;',
        editable: false,
      },
      { selector: '.casco', solution: 'grid-area: 4 / 1 / 6 / 6;' },
      { selector: '.mastil', solution: 'grid-area: 1 / 3 / 4 / 4;' },
      { selector: '.vela', solution: 'grid-area: 1 / 4 / 3 / 6;' },
      { selector: '.bandera', solution: 'grid-area: 1 / 2;' },
      { selector: '.cofre', solution: 'grid-area: 4 / 3;\nz-index: 1;' },
    ],
    above: [{ upper: 'cofre', lower: 'casco', message: 'El cofre asoma por encima del casco' }],
    farewell:
      '¡Mi barco! Bueno, un dibujo de mi barco. El tesoro es tuyo: un mapa que lleva a… este mismo mapa. Arr.',
  },
  {
    id: 'S-2',
    region: 9,
    title: 'La serpiente marina',
    landmark: 'serpiente',
    variant: 'secreto',
    terrain: 'lago',
    character: 'Serpentina',
    role: 'la serpiente del mar',
    portrait: 'pj-s2',
    secret: {
      x: 0.885,
      y: 0.115,
      width: 0.15,
      drawing: 'serpiente',
      hint: 'Los marineros juran ver algo nadando en el mar del noreste.',
    },
    allowed: ['grid-template-areas'],
    speech:
      'Sssí, sssoy la serpiente del mar. Me he enredado en mí misssma. Dibuja mi cuerpo en el plano, de la cola a la cabeza, y te dejaré passsar.',
    theory:
      '<p>Cada trozo de la serpiente ya tiene su área: <code>cola</code>, <code>s1</code> a <code>s6</code> y <code>cabeza</code>. Dibuja el plano con <code>grid-template-areas</code>; los huecos, con un punto.</p>',
    objective:
      'Tablero de 3 columnas y 4 filas. La <b>cola</b> arriba a la izquierda; el cuerpo avanza por la fila 1, baja por la columna 3, vuelve por la fila 3 hacia la izquierda y la <b>cabeza</b> asoma abajo a la izquierda.',
    hint: '<code>"cola s1 s2" ". . s3" "s6 s5 s4" "cabeza . ."</code>',
    pieces: [
      'cola',
      'escama@s1',
      'escama@s2',
      'escama@s3',
      'escama@s4',
      'escama@s5',
      'escama@s6',
      'cabeza',
    ],
    rules: [
      {
        selector: '.tablero',
        fixed:
          'display: grid;\ngrid-template-columns: repeat(3, 1fr);\ngrid-template-rows: repeat(4, 1fr);',
        solution: 'grid-template-areas:\n  "cola s1 s2"\n  ". . s3"\n  "s6 s5 s4"\n  "cabeza . .";',
      },
      hiddenRule('cola'),
      hiddenRule('s1'),
      hiddenRule('s2'),
      hiddenRule('s3'),
      hiddenRule('s4'),
      hiddenRule('s5'),
      hiddenRule('s6'),
      hiddenRule('cabeza'),
    ],
    checks: [{ rule: 0, pattern: /"[^"]*\.[^"]*"/, message: 'Usa puntos para el agua' }],
    farewell: 'Ahhh, qué ressspiro. Ya puedo nadar sin hacerme nudos. Que tengas buen viento.',
  },
  {
    id: 'S-3',
    region: 9,
    title: 'El círculo de piedras',
    landmark: 'menhir',
    variant: 'secreto',
    terrain: 'pradera',
    character: 'Menhir el viejo',
    role: 'piedra milenaria',
    portrait: 'pj-s3',
    secret: {
      x: 0.075,
      y: 0.87,
      width: 0.1,
      drawing: 'circulo',
      hint: 'En un islote del suroeste hay piedras que nadie ha movido en mil años.',
    },
    className: 'circulo',
    labelPinned: false,
    allowed: ['grid-area', 'grid-row', 'grid-column', 'place-self', 'z-index'],
    concepts: ['shorthand'],
    speech:
      'Llevamos mil años en círculo esperando a que alguien vuelva a alinear el sol y la luna. Sin prisa, pero sin pausa.',
    theory:
      '<p>El último secreto mezcla tres runas: <code>grid-area</code> para ocupar un bloque, <code>place-self</code> para colocar una pieza dentro de él y <code>z-index</code> para decidir quién queda encima.</p>',
    objective:
      'El <b>altar</b> ocupa el bloque central de 3×3. El <b>sol</b> comparte ese bloque, centrado y por encima del altar. La <b>luna</b> se apoya en la esquina superior derecha de la celda de arriba a la derecha.',
    hint: 'Altar y sol: <code>grid-area: 2 / 2 / 5 / 5</code>. Sol: <code>place-self: center</code> y <code>z-index: 1</code>. Luna: <code>grid-area: 1 / 5</code> y <code>place-self: start end</code>.',
    pieces: [
      '#menhir@m1',
      '#menhir@m2',
      '#menhir@m3',
      '#menhir@m4',
      '#menhir@m5',
      '#menhir@m6',
      '#menhir@m7',
      '#menhir@m8',
      'sol',
      'luna',
      'altar',
    ],
    rules: [
      {
        selector: '.tablero',
        fixed:
          'display: grid;\ngrid-template-columns: repeat(5, 1fr);\ngrid-template-rows: repeat(5, 1fr);\ngap: 4px;',
        editable: false,
      },
      fixedRule('m1', 'grid-area: 1 / 2;'),
      fixedRule('m2', 'grid-area: 1 / 4;'),
      fixedRule('m3', 'grid-area: 2 / 1;'),
      fixedRule('m4', 'grid-area: 2 / 5;'),
      fixedRule('m5', 'grid-area: 4 / 1;'),
      fixedRule('m6', 'grid-area: 4 / 5;'),
      fixedRule('m7', 'grid-area: 5 / 2;'),
      fixedRule('m8', 'grid-area: 5 / 4;'),
      { selector: '.altar', solution: 'grid-area: 2 / 2 / 5 / 5;' },
      { selector: '.sol', solution: 'grid-area: 2 / 2 / 5 / 5;\nplace-self: center;\nz-index: 1;' },
      { selector: '.luna', solution: 'grid-area: 1 / 5;\nplace-self: start end;' },
    ],
    above: [{ upper: 'sol', lower: 'altar', message: 'El sol brilla por encima del altar' }],
    farewell: 'Por fin alineados. Vuelve cuando quieras: nosotras no nos vamos a ninguna parte.',
  },
  {
    id: 'S-4',
    region: 9,
    title: 'El corazón del volcán',
    landmark: 'hoguera',
    variant: 'secreto',
    terrain: 'canon',
    character: 'Ascua',
    role: 'la salamandra del cráter',
    portrait: 'pj-s4',
    secret: {
      x: 0.585,
      y: 0.13,
      width: 0.09,
      drawing: 'volcan',
      hint: 'Dicen que en el volcán del norte vive algo… y no es solo lava.',
    },
    allowed: ['grid-column', 'grid-row'],
    concepts: ['span', 'líneas negativas'],
    speech:
      '¡Sssh, que quema! Las coladas se han desbordado. Encáuzalas desde el cráter hasta el pie del volcán. Y cuenta las líneas desde el final, que yo siempre empiezo por abajo.',
    theory:
      '<p>Las líneas también se cuentan <b>desde el final</b> con números negativos: <code>-1</code> es la última línea y <code>-2</code> la penúltima. Y <code>span</code> dice cuántas celdas ocupa una pieza, sin tener que calcular dónde acaba.</p><pre>grid-column: 2 / -2;\ngrid-row: 2 / span 3;</pre>',
    objective:
      '<b>Cráter</b>: fila 1, de la línea 2 a la penúltima. <b>Colada central</b>: columna 3, de la fila 2 hasta el final. <b>Colada izquierda</b>: columna 2, desde la fila 2 ocupando 3 filas. <b>Colada derecha</b>: columna 4, desde la fila 2 ocupando 2. <b>Cristal</b>: la última celda, abajo a la derecha.',
    hint: 'Cráter: <code>grid-column: 2 / -2</code>. Centro: <code>grid-row: 2 / -1</code>. Izquierda: <code>grid-row: 2 / span 3</code>. Cristal: <code>-2</code> en fila y en columna.',
    pieces: ['crater', 'colada@izq', 'colada@centro', 'colada@der', 'cristal'],
    rules: [
      {
        selector: '.tablero',
        fixed:
          'display: grid;\ngrid-template-columns: repeat(5, 1fr);\ngrid-template-rows: repeat(5, 1fr);\ngap: 4px;',
        editable: false,
      },
      { selector: '.crater', solution: 'grid-column: 2 / -2;\ngrid-row: 1;' },
      { selector: '.izq', solution: 'grid-column: 2;\ngrid-row: 2 / span 3;' },
      { selector: '.centro', solution: 'grid-column: 3;\ngrid-row: 2 / -1;' },
      { selector: '.der', solution: 'grid-column: 4;\ngrid-row: 2 / span 2;' },
      { selector: '.cristal', solution: 'grid-column: -2;\ngrid-row: -2;' },
    ],
    checks: [
      {
        pattern: /:\s*-\d|\/\s*-\d/,
        message: 'Cuenta alguna línea desde el final (número negativo)',
      },
      { pattern: /span/, message: 'Usa span en alguna colada' },
    ],
    farewell:
      '¡Ahora sí que fluye! Toma este cristal de obsidiana: aguanta el calor mejor que yo los chistes de los peces.',
  },
  {
    id: 'S-5',
    region: 9,
    title: 'La panza de la ballena',
    landmark: 'pez',
    variant: 'secreto',
    terrain: 'lago',
    character: 'Bruma',
    role: 'la ballena glotona',
    portrait: 'pj-s5',
    secret: {
      x: 0.05,
      y: 0.288,
      width: 0.085,
      drawing: 'ballena',
      hint: 'Al oeste, una ballena enorme resopla junto a la costa. ¿Qué se habrá tragado?',
    },
    allowed: ['grid-auto-flow', 'grid-auto-columns'],
    concepts: ['fr'],
    speech:
      'Glub… me he tragado medio puerto y aquí dentro está todo apelotonado. Mi panza es larga, no alta: coloca las cosas por columnas, de dos en dos, y que todas las columnas midan lo mismo.',
    theory:
      '<p>Las piezas sin sitio fijo llenan la cuadrícula <b>fila a fila</b>. Con <code>grid-auto-flow: column</code> la llenan <b>columna a columna</b>. Las columnas que se crean solas (implícitas) se miden con <code>grid-auto-columns</code>.</p><pre>grid-auto-flow: column;\ngrid-auto-columns: 1fr;</pre>',
    objective:
      'La panza ya tiene dos filas. Llena por <b>columnas</b> (de arriba abajo y después a la derecha) y haz que todas las columnas midan lo mismo.',
    hint: '<code>grid-auto-flow: column;</code> y <code>grid-auto-columns: 1fr;</code>',
    pieces: ['barca', 'pez', 'ancla', 'cofre', 'pez', 'faro', 'llave', 'pez'],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: grid;\ngrid-template-rows: repeat(2, 1fr);\ngap: 6px;',
        solution: 'grid-auto-flow: column;\ngrid-auto-columns: 1fr;',
      },
    ],
    checks: [
      { rule: 0, pattern: /grid-auto-flow\s*:\s*column/, message: 'Llena la panza por columnas' },
      {
        rule: 0,
        pattern: /grid-auto-columns/,
        message: 'Mide las columnas implícitas con grid-auto-columns',
      },
    ],
    farewell:
      '¡Ay, qué alivio! Si ves al farero, dile que su faro está bien. Un poco mojado, nada más.',
  },
  {
    id: 'S-6',
    region: 9,
    title: 'La isla de los cocos',
    landmark: 'palmera',
    variant: 'secreto',
    terrain: 'desierto',
    character: 'Coco',
    role: 'el cangrejo ermitaño',
    portrait: 'pj-s6',
    secret: {
      x: 0.357,
      y: 0.06,
      width: 0.075,
      drawing: 'isla',
      hint: 'Al norte del desierto hay un islote con palmeras… y alguien que hace clic, clac.',
    },
    allowed: [
      'place-content',
      'place-self',
      'justify-content',
      'align-content',
      'justify-self',
      'align-self',
    ],
    speech:
      '¡Clic, clac! Mi isla es diminuta y el mar, inmenso. Quiero mi parcela justo en el centro del islote. Y el coco, en la esquina de abajo a la derecha de su celda, que ahí da la sombra.',
    theory:
      '<p>Si las pistas miden menos que el tablero, sobra espacio. <code>place-content</code> mueve <b>toda la cuadrícula</b> dentro del contenedor (primero el eje vertical, después el horizontal). <code>place-self</code> mueve <b>una sola pieza</b> dentro de su celda.</p><pre>place-content: center;\n.pieza { place-self: end; }</pre>',
    objective:
      'La cuadrícula de 3×2 (pistas de 90px por 80px) queda <b>centrada</b> en el tablero. El <b>coco</b> se apoya abajo a la derecha de su celda.',
    hint: 'En el tablero: <code>place-content: center</code>. En el coco: <code>place-self: end</code>.',
    pieces: ['palmera', 'coco', 'cofre', 'palmera', 'cangrejo', 'palmera'],
    rules: [
      {
        selector: '.tablero',
        fixed:
          'display: grid;\ngrid-template-columns: repeat(3, 90px);\ngrid-template-rows: repeat(2, 80px);\ngap: 8px;',
        solution: 'place-content: center;',
      },
      { selector: '.coco', solution: 'place-self: end;' },
    ],
    farewell:
      '¡Perfecto! Desde aquí veo todo el mapa. Si encuentras otra isla, avísame: esta concha se me está quedando pequeña.',
  },
];

/** Map index filters. */
const filters: readonly FilterGroup[] = [
  [
    'Tipo de ejercicio',
    [
      'prueba de aprendizaje',
      'secreto',
      'contra reloj',
      'sin huellas',
      'regateo',
      'musical',
      'minijuego',
    ],
  ],
  [
    'Contenedor',
    [
      'display',
      'grid-template-columns',
      'grid-template-rows',
      'grid-template-areas',
      'grid-template',
      'gap',
      'row-gap',
      'column-gap',
    ],
  ],
  [
    'Colocación',
    [
      'grid-column-start',
      'grid-column-end',
      'grid-row-start',
      'grid-row-end',
      'grid-column',
      'grid-row',
      'grid-area',
    ],
  ],
  [
    'Alineación',
    [
      'justify-items',
      'align-items',
      'place-items',
      'justify-self',
      'align-self',
      'place-self',
      'justify-content',
      'align-content',
      'place-content',
    ],
  ],
  ['Cuadrícula implícita', ['grid-auto-rows', 'grid-auto-columns', 'grid-auto-flow', 'grid']],
  ['Orden y capas', ['order', 'z-index']],
  [
    'Conceptos',
    [
      'fr',
      'auto',
      'repeat()',
      'minmax()',
      'inline-grid',
      'span',
      'líneas negativas',
      'líneas con nombre',
      'auto-fill',
      'auto-fit',
      'dense',
      'max-content',
      'min-content',
      'fit-content()',
      'minmax(0, 1fr)',
      'shorthand',
    ],
  ],
];

export const gridWorld: WorldContent = {
  id: 'grid',
  name: 'Las Ruinas de la Cuadrícula',
  mapTitle: 'Mapa de las ruinas',
  topic: 'CSS Grid',
  card: { tech: 'CSS Grid · la superficie', className: '' },
  regions: regions,
  pieceTypes: pieceTypes,
  filters,
  lessons: levels,
};
