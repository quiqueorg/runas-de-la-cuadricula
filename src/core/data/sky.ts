/** Sky adventure: media queries, variables and transitions. */
import type {
  FilterGroup,
  LevelDraft,
  MediaDraft,
  PieceTypeMap,
  RegionDraft,
  WorldContent,
} from '../models';
import { FLEX_ALL } from './flex';

// ═══════════════════════════════════════════════════════════════
//  THE SHIFTING SKIES · media queries, variables and transitions
//  Regions use a local index (0–9); the catalog places them after the underground.
//  New blocks:  media → the rule's @media condition (fixed text, or { solution } to write)
//               state → the board can be activated (.activo / :hover)
//               compare → computed styles that must also match
//  Two cloud continents: the large one (southwest) and the Heights (northeast). Routes wind over
//  land; crossing between continents is a griffin flight and, until the storm, a dragon.
// ═══════════════════════════════════════════════════════════════
const skyRegions: readonly RegionDraft[] = [
  {
    name: 'El Muelle de los Globos',
    subtitle: 'Pantallas que cambian',
    x: 0.18,
    y: 0.8,
    terrain: 'muelle',
    character: 'Aurelia',
    role: 'la capitana aeronauta',
    path: [
      [0.12, 0.74],
      [0.075, 0.66],
    ],
  },
  {
    name: 'Los Jardines Colgantes',
    subtitle: 'Puntos de ruptura',
    x: 0.08,
    y: 0.57,
    terrain: 'jardin',
    character: 'Lino',
    role: 'el jardinero de nubes',
    path: [
      [0.12, 0.49],
      [0.2, 0.44],
    ],
  },
  {
    name: 'El Observatorio',
    subtitle: 'Diseños que se adaptan',
    x: 0.28,
    y: 0.47,
    terrain: 'observatorio',
    character: 'Astra',
    role: 'la astrónoma',
    path: [
      [0.34, 0.53],
      [0.3, 0.61],
      [0.33, 0.69],
    ],
  },
  {
    name: 'El Templo del Viento',
    subtitle: 'Variables',
    x: 0.38,
    y: 0.76,
    terrain: 'viento',
    character: 'Hermano Soplo',
    role: 'el monje del viento',
    path: [
      [0.45, 0.81],
      [0.52, 0.76],
      [0.5, 0.69],
    ],
  },
  {
    name: 'El Taller del Arcoíris',
    subtitle: 'Herencia y valores de reserva',
    x: 0.5,
    y: 0.62,
    terrain: 'arcoiris',
    character: 'Iris',
    role: 'la tintorera de nubes',
    path: [
      [0.57, 0.66],
      [0.62, 0.58],
      [0.6, 0.5],
      [0.615, 0.43],
      [0.67, 0.33],
    ],
    flight: { from: 4, via: 'grifo' },
  },
  {
    name: 'El Nido de los Grifos',
    subtitle: 'Cálculos con variables',
    x: 0.76,
    y: 0.3,
    terrain: 'nido',
    character: 'Garra',
    role: 'la grifa matriarca',
    path: [
      [0.74, 0.4],
      [0.8, 0.47],
      [0.86, 0.48],
    ],
  },
  {
    name: 'La Cascada de Nubes',
    subtitle: 'Transiciones',
    x: 0.9,
    y: 0.42,
    terrain: 'cascada',
    character: 'Brisa',
    role: 'la funambulista',
    path: [
      [0.95, 0.33],
      [0.93, 0.22],
    ],
  },
  {
    name: 'El Campanario de los Vientos',
    subtitle: 'Ritmo y retardo',
    x: 0.86,
    y: 0.12,
    terrain: 'campanario',
    character: 'Maese Tañido',
    role: 'el campanero',
    path: [
      [0.8, 0.07],
      [0.74, 0.1],
      [0.71, 0.18],
      [0.6, 0.08],
    ],
    flight: { from: 3, via: 'dragon' },
  },
  {
    name: 'El Ojo de la Tormenta',
    subtitle: 'Examen final',
    x: 0.42,
    y: 0.19,
    terrain: 'tormenta',
    character: 'Vórtice',
    role: 'el titán de la tormenta',
    exam: true,
    boss: true,
  },
  {
    name: 'Lugares secretos',
    subtitle: 'Escondidos entre las nubes',
    terrain: 'tormenta',
    secret: true,
  },
];

const skyPieceTypes: PieceTypeMap = {
  globo: { token: 'globo' },
  dirigible: { token: 'dirigible' },
  lastre: { token: 'barril' },
  nube: { token: 'nube' },
  maceta: { token: 'maceta' },
  cupula: { material: 'estrellas', icon: 'luna' },
  carta: { material: 'estrellas', icon: 'astro' },
  catalogo: { material: 'tablones', icon: 'libro' },
  pie: { material: 'marmol', icon: 'arena' },
  estrella: { token: 'astro' },
  planeta: { token: 'planeta' },
  telescopio: { token: 'telescopio' },
  molinillo: { token: 'molinillo' },
  campanilla: { token: 'campana' },
  banderin: { material: 'lienzo' },
  pano: { material: 'lienzo' },
  franja: { material: 'lienzo' },
  tendedero: { material: 'celeste' },
  huevo: { token: 'huevo' },
  pluma: { token: 'pluma' },
  grifo: { token: 'grifo' },
  nido: { material: 'paja', icon: 'huevo' },
  isleta: { material: 'nube' },
  gota: { token: 'gota' },
  chorro: { material: 'agua' },
  campana: { token: 'campana' },
  gallardete: { material: 'lienzo', icon: 'campana' },
  rayo: { token: 'rayo' },
  nubarron: { material: 'tormenta' },
  ojo: { material: 'tormenta', icon: 'tormenta' },
  fenix: { token: 'fenix' },
};

export const SKY_ROW = 'display: flex;\ngap: 12px;';
export const SKY_GRID_PROPS = [
  'display',
  'grid-template-columns',
  'grid-template-rows',
  'grid-template-areas',
  'grid-auto-rows',
  'gap',
  'grid-column',
  'grid-row',
  'grid-area',
  'justify-items',
  'align-items',
];
export const SKY_MEDIA = ['min-width', 'max-width', 'width', 'and', '<=', '>='];
export const SKY_TRANSITION = [
  'transition',
  'transition-property',
  'transition-duration',
  'transition-timing-function',
  'transition-delay',
];
export const skyCondition = (sol: string): MediaDraft => ({ solution: sol });

const skyLevels: readonly LevelDraft[] = [
  //Region 0 · EL MUELLE DE LOS GLOBOS
  {
    id: 'c0-1',
    region: 0,
    title: 'Globos en columna',
    widths: [300, 520],
    height: 300,
    allowed: ['flex-direction'],
    concepts: ['@media', 'max-width'],
    speech:
      '¡Bienvenida a bordo, grumete de tierra! Aquí arriba el muelle se estira y se encoge con el viento. Cuando el muelle se queda estrecho, los globos tienen que amarrarse en columna o chocan. ¡Por todos los vientos, que no choquen!',
    theory:
      '<p>Una <b>media query</b> aplica unas reglas <b>solo cuando se cumple una condición</b> sobre la pantalla. La más usada pregunta por el ancho:</p><pre>@media (max-width: 400px) {\n  .tablero { … }\n}</pre><p><code>max-width: 400px</code> significa «<b>como mucho</b> 400px de ancho». En una web de verdad la condición mira la ventana del navegador; aquí, en el cielo, <b>el tablero hace de ventana</b>. Usa los botones de ancho para estrecharlo y ensancharlo.</p>',
    objective:
      'Con el tablero estrecho (300px), los tres globos en columna. Con el ancho (520px), siguen en fila.',
    hint: 'Dentro de la media query: <code>flex-direction: column;</code>',
    pieces: ['globo', 'globo', 'globo'],
    rules: [
      { selector: '.tablero', fixed: SKY_ROW, editable: false },
      { selector: '.tablero', media: '(max-width: 400px)', solution: 'flex-direction: column;' },
    ],
    farewell: '¡Amarrados y en orden! Un muelle que se adapta es un muelle que no se hunde.',
  },
  {
    id: 'c0-2',
    region: 0,
    title: 'A partir de cierto ancho',
    widths: [320, 560],
    height: 300,
    allowed: ['flex-direction', 'justify-content'],
    concepts: ['@media', 'min-width'],
    speech:
      'Por defecto amarramos en columna, que es lo más seguro con poco sitio. Pero cuando el muelle se ensancha, quiero el dirigible y los globos en fila y en el centro, para que los vean los pasajeros.',
    theory:
      '<p><code>min-width</code> es lo contrario: «<b>como mínimo</b> tantos píxeles de ancho». Las reglas de dentro se aplican <b>a partir</b> de ese ancho.</p><pre>@media (min-width: 500px) { … }</pre><p>Lo de fuera de la media query se aplica siempre; lo de dentro <b>se suma</b> encima cuando la condición se cumple.</p>',
    objective: 'Estrecho (320px): en columna, como está. Ancho (560px): en fila y centrados.',
    hint: '<code>flex-direction: row;</code> y <code>justify-content: center;</code> dentro de la media query.',
    pieces: ['dirigible', 'globo', 'globo'],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: flex;\nflex-direction: column;\ngap: 12px;',
        editable: false,
      },
      {
        selector: '.tablero',
        media: '(min-width: 500px)',
        solution: 'flex-direction: row;\njustify-content: center;',
      },
    ],
  },
  {
    id: 'c0-3',
    region: 0,
    title: 'Soltar lastre',
    widths: [320, 540],
    height: 220,
    allowed: ['display'],
    concepts: ['@media', 'max-width'],
    speech:
      'En los muelles estrechos no caben los sacos de lastre. ¡Fuera con ellos! Pero solo cuando haga falta: en los anchos, que se queden, que pesan lo justo.',
    theory:
      '<p>Dentro de una media query puedes poner <b>cualquier selector</b>, no solo el tablero. Con <code>display: none</code> un elemento <b>desaparece</b> y deja su sitio libre a los demás.</p><pre>@media (max-width: 400px) {\n  .lastre { display: none; }\n}</pre>',
    objective:
      'Con 400px o menos, los sacos de lastre desaparecen y quedan solo los tres globos, centrados. Con más ancho, todo a la vista.',
    hint: '<code>display: none;</code> para <code>.lastre</code> dentro de la media query.',
    pieces: ['globo', 'lastre', 'globo', 'lastre', 'globo'],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: flex;\ngap: 10px;\njustify-content: center;',
        editable: false,
      },
      { selector: '.lastre', media: '(max-width: 400px)', solution: 'display: none;' },
    ],
  },
  {
    id: 'c0-4',
    region: 0,
    title: 'Tú pones la condición',
    widths: [340, 560],
    height: 300,
    allowed: SKY_MEDIA,
    concepts: ['@media', 'max-width'],
    speech:
      'Esta vez las órdenes ya están escritas: columna y al centro. Lo que falta es saber CUÁNDO darlas. Escríbelo tú, que yo tengo que atar cabos.',
    theory:
      '<p>La condición va entre paréntesis después de <code>@media</code>: una <b>característica</b> (como <code>max-width</code>), dos puntos y un valor.</p><pre>@media (max-width: 450px) { … }</pre><p>Elige un valor que separe bien el tablero estrecho del ancho.</p>',
    objective: 'Globos en columna en el tablero estrecho (340px) y en fila en el ancho (560px).',
    hint: 'Algo como <code>(max-width: 450px)</code>.',
    pieces: ['globo', 'dirigible', 'globo'],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: flex;\ngap: 12px;\nalign-items: center;\njustify-content: center;',
        editable: false,
      },
      {
        selector: '.tablero',
        media: skyCondition('(max-width: 450px)'),
        fixed: 'flex-direction: column;',
        editable: false,
      },
    ],
  },
  {
    id: 'c0-5',
    region: 0,
    title: 'Antes de que zarpe el dirigible',
    variant: 'contra reloj',
    timeLimit: 60,
    className: 'niebla',
    widths: [380, 400, 401],
    height: 280,
    allowed: SKY_MEDIA,
    concepts: ['@media', 'max-width'],
    timeMessages: {
      expired:
        '¡La niebla se ha tragado el muelle! <button type="button" class="text-link" id="p-sacudir">Despeja la niebla</button> y vuelve a intentarlo antes de que zarpe el dirigible.',
      late: 'Zarpamos con retraso, pero zarpamos. Repítelo a tiempo y sin pistas para dominarlo.',
    },
    speech:
      '¡Rápido, que sube la niebla! El reglamento del puerto dice: hasta 400 píxeles INCLUIDOS, columna. A partir de 401, fila. Ni uno más, ni uno menos.',
    theory:
      '<p><b>Contra reloj:</b> la niebla sube en cuanto empiezas a escribir. <code>max-width: 400px</code> <b>incluye</b> el 400: se cumple con 400px justos.</p>',
    objective:
      'Hasta 400px inclusive, los globos van en columna. Comprueba que con un píxel más (401px) vuelven a la fila.',
    hint: '<code>(max-width: 400px)</code>',
    pieces: ['globo', 'globo', 'globo'],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: flex;\ngap: 10px;\njustify-content: center;',
        editable: false,
      },
      {
        selector: '.tablero',
        media: skyCondition('(max-width: 400px)'),
        fixed: 'flex-direction: column;\nalign-items: center;',
        editable: false,
      },
    ],
    farewell:
      '¡Justo a tiempo! El dirigible zarpa rumbo a los Jardines Colgantes. Dale recuerdos a Lino, que riega hasta las nubes.',
  },
  {
    id: 'c0-6',
    region: 0,
    title: 'Tres muelles',
    widths: [320, 480, 640],
    height: 280,
    allowed: ['flex-direction', 'align-items', 'justify-content'],
    concepts: ['@media', 'max-width', 'min-width'],
    speech:
      'Último encargo del muelle: en los atraques pequeños, en columna y centrados; en los medianos, en fila tal cual; y en los grandes, repartidos de punta a punta.',
    theory:
      '<p>Puedes tener <b>varias media queries</b> a la vez. Cada una se aplica solo cuando se cumple su condición; si no se cumple ninguna, quedan las reglas de fuera.</p>',
    objective:
      '320px: columna centrada. 480px: fila normal. 640px: fila con el primero y el último pegados a los bordes.',
    hint: 'En la primera: <code>flex-direction: column;</code> y <code>align-items: center;</code>. En la segunda: <code>justify-content: space-between;</code>',
    pieces: ['globo', 'dirigible', 'globo'],
    rules: [
      { selector: '.tablero', fixed: SKY_ROW, editable: false },
      {
        selector: '.tablero',
        media: '(max-width: 360px)',
        solution: 'flex-direction: column;\nalign-items: center;',
      },
      {
        selector: '.tablero',
        media: '(min-width: 600px)',
        solution: 'justify-content: space-between;',
      },
    ],
  },
  {
    id: 'c0-7',
    region: 0,
    title: 'El cartel de papel',
    views: [{ name: 'Pantalla' }, { name: 'Papel', media: 'print' }],
    width: 460,
    height: 220,
    allowed: ['screen', 'print', 'and', 'not'],
    concepts: ['@media', 'print'],
    speech:
      'Del horario de salidas hacemos carteles de papel para pegarlos por el puerto. Y en un papel los globos de adorno sobran: gastan tinta y no dicen nada. Que se vean en la pantalla, pero no al imprimir.',
    theory:
      '<p>Una media query puede preguntar también por el <b>tipo de medio</b>: dónde se está mostrando la página.</p><ul><li><code>screen</code>: una pantalla.</li><li><code>print</code>: el papel, al imprimir o guardar como PDF.</li><li><code>all</code>: cualquiera (es lo que vale si no pones nada).</li></ul><pre>@media print {\n  .globo { display: none; }\n}</pre><p>El tipo va <b>sin paréntesis</b>. Usa los botones de vista para ver el tablero «en papel».</p>',
    objective:
      'En pantalla, todo a la vista. En papel, los globos desaparecen y queda solo el dirigible, en el centro.',
    hint: 'La condición es una sola palabra: <code>print</code>',
    pieces: ['globo', 'dirigible', 'globo'],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: flex;\ngap: 12px;\njustify-content: center;',
        editable: false,
      },
      {
        selector: '.globo',
        media: skyCondition('print'),
        fixed: 'display: none;',
        editable: false,
      },
    ],
  },
  {
    id: 'c0-8',
    region: 0,
    title: 'Pantalla, y además ancha',
    views: [
      { width: 340, name: 'Pantalla estrecha' },
      { width: 560, name: 'Pantalla ancha' },
      { width: 560, name: 'Papel', media: 'print' },
    ],
    height: 300,
    allowed: ['screen', 'print', 'and', 'not', 'min-width', 'max-width'],
    concepts: ['@media', 'screen', 'and'],
    speech:
      'Y ahora lo contrario. Los globos en fila lucen mucho en una pantalla ancha, pero en papel ocupan media hoja. En fila solo si es una pantalla y además es ancha. En todo lo demás, en columna.',
    theory:
      '<p>El tipo de medio se une a las condiciones con <code>and</code>:</p><pre>@media screen and (min-width: 500px) { … }</pre><p>«En una <b>pantalla</b> que mida al menos 500px». Un papel de 560px de ancho no cumple: es ancho, pero no es una pantalla.</p>',
    objective:
      'En fila y centrados solo en la pantalla ancha (a partir de 500px). En la pantalla estrecha y en papel, en columna.',
    hint: '<code>screen and (min-width: 500px)</code>',
    pieces: ['dirigible', 'globo', 'globo'],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: flex;\nflex-direction: column;\nalign-items: center;\ngap: 10px;',
        editable: false,
      },
      {
        selector: '.tablero',
        media: skyCondition('screen and (min-width: 500px)'),
        fixed: 'flex-direction: row;\njustify-content: center;',
        editable: false,
      },
    ],
    farewell:
      '¡Muelle en orden! Ahora vuela al jardín colgante: allí las plantas también crecen según el sitio que tienen.',
  },
  //Region 1 · LOS JARDINES COLGANTES
  {
    id: 'c1-1',
    region: 1,
    title: 'Primero, el móvil',
    tokenSize: false,
    widths: [320, 560],
    height: 320,
    allowed: ['grid-template-columns'],
    concepts: ['mobile first', 'min-width'],
    speech:
      'Shhh… las macetas duermen. Las colocamos de una en una, en columna, porque así caben en cualquier balcón. Si el balcón es amplio, de dos en dos.',
    theory:
      '<p><b>Primero el móvil</b> (<i>mobile first</i>): las reglas de fuera son para la pantalla <b>pequeña</b>, y con <code>min-width</code> vas añadiendo cambios para las grandes. Una rejilla sin columnas definidas ya es una sola columna.</p><pre>@media (min-width: 480px) {\n  .tablero { grid-template-columns: repeat(2, 1fr); }\n}</pre>',
    objective: '320px: una maceta por fila. 560px: dos columnas iguales.',
    hint: '<code>grid-template-columns: repeat(2, 1fr);</code> dentro de la media query.',
    pieces: ['maceta', 'maceta', 'maceta', 'maceta'],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: grid;\ngap: 10px;\ngrid-auto-rows: 64px;',
        editable: false,
      },
      {
        selector: '.tablero',
        media: '(min-width: 480px)',
        solution: 'grid-template-columns: repeat(2, 1fr);',
      },
    ],
  },
  {
    id: 'c1-2',
    region: 1,
    title: 'Tres balcones',
    tokenSize: false,
    widths: [320, 520, 720],
    height: 320,
    allowed: ['grid-template-columns'],
    concepts: ['mobile first', 'min-width'],
    speech:
      'Tengo balcones pequeños, medianos y uno enorme que da al sol. En el mediano, dos columnas. En el enorme, las cuatro macetas en una sola fila, que les dé la luz a todas.',
    theory:
      '<p>Con dos <code>min-width</code>, en la pantalla grande se cumplen <b>las dos</b> condiciones. Gana la que está <b>escrita más abajo</b>, como siempre en CSS: por eso se ordenan de menor a mayor.</p>',
    objective: '320px: una columna. 520px: dos columnas. 720px: cuatro columnas.',
    hint: '<code>repeat(2, 1fr)</code> en la primera y <code>repeat(4, 1fr)</code> en la segunda.',
    pieces: ['maceta', 'maceta', 'maceta', 'maceta'],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: grid;\ngap: 10px;\ngrid-auto-rows: 64px;',
        editable: false,
      },
      {
        selector: '.tablero',
        media: '(min-width: 480px)',
        solution: 'grid-template-columns: repeat(2, 1fr);',
      },
      {
        selector: '.tablero',
        media: '(min-width: 680px)',
        solution: 'grid-template-columns: repeat(4, 1fr);',
      },
    ],
  },
  {
    id: 'c1-3',
    region: 1,
    title: 'Solo en los medianos',
    widths: [340, 500, 700],
    height: 220,
    allowed: SKY_MEDIA,
    concepts: ['@media', 'and'],
    speech:
      'Las flores del balcón mediano son tímidas: les gusta estar en el centro, arropadas. En los demás balcones, al borde, que miren el paisaje.',
    theory:
      '<p>Puedes unir dos condiciones con <code>and</code>: se aplica solo si se cumplen <b>las dos</b>.</p><pre>@media (min-width: 400px) and (max-width: 600px) { … }</pre>',
    objective:
      'Flores centradas solo con el tablero mediano (500px). Con 340px y con 700px, a la izquierda.',
    hint: '<code>(min-width: 400px) and (max-width: 600px)</code>',
    pieces: ['flor', 'flor', 'flor'],
    rules: [
      { selector: '.tablero', fixed: SKY_ROW, editable: false },
      {
        selector: '.tablero',
        media: skyCondition('(min-width: 400px) and (max-width: 600px)'),
        fixed: 'justify-content: center;',
        editable: false,
      },
    ],
  },
  {
    id: 'c1-4',
    region: 1,
    title: 'Rangos modernos',
    widths: [360, 520, 680],
    height: 300,
    allowed: SKY_MEDIA,
    concepts: ['@media', 'rango'],
    speech:
      'Un viajero me enseñó una forma más corta de escribir «entre tanto y tanto». Parece una fórmula de las de Astra, pero se lee de un vistazo. ¿La probamos?',
    theory:
      '<p>La <b>sintaxis de rango</b> compara el ancho directamente con <code>&lt;</code>, <code>&lt;=</code>, <code>&gt;</code> y <code>&gt;=</code>:</p><pre>@media (400px &lt;= width &lt;= 600px) { … }</pre><p>Significa lo mismo que <code>(min-width: 400px) and (max-width: 600px)</code>, pero se lee mejor.</p>',
    objective: 'En columna solo con el tablero mediano (520px), usando la sintaxis de rango.',
    hint: '<code>(400px &lt;= width &lt;= 600px)</code>',
    pieces: ['maceta', 'flor', 'maceta'],
    checks: [
      {
        inCondition: true,
        pattern: /width\s*[<>]|[<>]=?\s*width/,
        message:
          'Escribe la condición con la sintaxis de rango (<code>&lt;=</code>, <code>&gt;=</code>…)',
      },
    ],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: flex;\ngap: 12px;\njustify-content: center;',
        editable: false,
      },
      {
        selector: '.tablero',
        media: skyCondition('(400px <= width <= 600px)'),
        fixed: 'flex-direction: column;\nalign-items: center;',
        editable: false,
      },
    ],
  },
  {
    id: 'c1-5',
    region: 1,
    title: 'El vivero de Lino',
    variant: 'regateo',
    purse: { total: 6, price: 2 },
    widths: [320, 520, 720],
    height: 300,
    allowed: ['flex-direction', 'justify-content', 'align-items'],
    concepts: ['mobile first'],
    purseMessage:
      'Lino, el jardinero: «Las semillas no crecen más por regarlas dos veces… Lo que ya pusiste en un balcón sigue valiendo en el siguiente.»',
    speech:
      'Las runas de riego están caras este año. Con lo que tengo te llega para tres. Columna en el pequeño, fila en el mediano, y en el grande, fila repartida de lado a lado.',
    theory:
      '<p><b>Regateo:</b> cada declaración cuesta. Aprovecha la <b>cascada</b>: con <code>min-width</code>, lo que pones en la media query mediana <b>sigue valiendo</b> en la grande, porque las dos se cumplen.</p>',
    objective:
      '320px: columna. 520px: fila. 720px: fila con el primero y el último en los bordes. Con tres declaraciones.',
    hint: 'Fuera: <code>flex-direction: column;</code>. En la de 480: <code>flex-direction: row;</code>. En la de 680, solo <code>justify-content: space-between;</code>',
    pieces: ['flor', 'maceta', 'flor'],
    rules: [
      { selector: '.tablero', fixed: SKY_ROW, solution: 'flex-direction: column;' },
      { selector: '.tablero', media: '(min-width: 480px)', solution: 'flex-direction: row;' },
      {
        selector: '.tablero',
        media: '(min-width: 680px)',
        solution: 'justify-content: space-between;',
      },
    ],
  },
  {
    id: 'c1-6',
    region: 1,
    title: 'O muy poco o demasiado',
    widths: [320, 500, 700],
    height: 220,
    allowed: [...SKY_MEDIA, 'or'],
    concepts: ['@media', 'or'],
    speech:
      'Las flores del balcón mediano están a gusto juntas. En el pequeño se agobian y en el enorme se sienten solas: en esos dos, cada una a una punta. Dos casos distintos, una sola regla.',
    theory:
      '<p>Una <b>coma</b> entre dos condiciones significa «<b>o</b>»: la regla se aplica si se cumple <b>cualquiera</b> de las dos.</p><pre>@media (max-width: 400px), (min-width: 600px) { … }</pre><p>También puedes escribir la palabra <code>or</code> en lugar de la coma. Con <code>and</code> hacen falta las dos condiciones; con <code>or</code>, basta una.</p>',
    objective:
      'Flores repartidas de borde a borde con 320px y con 700px. Con 500px, juntas en el centro.',
    hint: '<code>(max-width: 400px), (min-width: 600px)</code>',
    pieces: ['flor', 'flor', 'flor'],
    checks: [
      {
        inCondition: true,
        pattern: /,|\bor\b/,
        message: 'Une las dos condiciones con una coma o con <code>or</code>',
      },
    ],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: flex;\ngap: 12px;\njustify-content: center;',
        editable: false,
      },
      {
        selector: '.tablero',
        media: skyCondition('(max-width: 400px), (min-width: 600px)'),
        fixed: 'justify-content: space-between;',
        editable: false,
      },
    ],
  },
  {
    id: 'c1-7',
    region: 1,
    title: 'Todos menos el grande',
    widths: [320, 500, 700],
    height: 300,
    allowed: [...SKY_MEDIA, 'not'],
    concepts: ['@media', 'not'],
    speech:
      'Shhh… En el balcón grande las macetas duermen en fila, al sol. En todos los demás, en columna, bien arropadas. No me digas cuáles son los demás: dime cuál no.',
    theory:
      '<p><code>not</code> le da la vuelta a una condición: se cumple cuando la condición <b>no</b> se cumple.</p><pre>@media not (min-width: 600px) { … }</pre><p>«Cuando <b>no</b> mida 600px o más». Es útil cuando la excepción es más fácil de describir que la regla.</p>',
    objective:
      'Macetas en columna y centradas con 320px y 500px. Con 700px, en fila. Usa <code>not</code>.',
    hint: '<code>not (min-width: 600px)</code>',
    pieces: ['maceta', 'flor', 'maceta'],
    checks: [
      {
        inCondition: true,
        pattern: /\bnot\b/,
        message: 'Escribe la condición con <code>not</code>',
      },
    ],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: flex;\ngap: 12px;\njustify-content: center;',
        editable: false,
      },
      {
        selector: '.tablero',
        media: skyCondition('not (min-width: 600px)'),
        fixed: 'flex-direction: column;\nalign-items: center;',
        editable: false,
      },
    ],
    farewell:
      'Tres runas, tres balcones. Los jardines te lo agradecen con un perfume que llega hasta el Observatorio.',
  },
  //Region 2 · EL OBSERVATORIO
  {
    id: 'c2-1',
    region: 2,
    title: 'La cúpula y el catálogo',
    tokenSize: false,
    widths: [340, 620],
    height: 380,
    allowed: ['grid-template-areas', 'grid-template-columns', 'grid-template-rows'],
    concepts: ['@media', 'grid-template-areas'],
    speech:
      'Observación: en pantallas estrechas, todo apilado. En pantallas anchas, el catálogo de estrellas pasa a una columna lateral a la izquierda de la carta celeste. Es el diseño más clásico del firmamento… y de la web.',
    theory:
      '<p>Las media queries brillan con <b>grid-template-areas</b>: cambias el plano y cada zona se recoloca sola, sin tocar las piezas.</p><pre>@media (min-width: 560px) {\n  .tablero {\n    grid-template-areas:\n      "cupula cupula"\n      "catalogo carta"\n      "pie pie";\n  }\n}</pre>',
    objective:
      '340px: cúpula, carta, catálogo y pie apilados. 620px: la cúpula arriba de lado a lado; debajo, el catálogo (150px) a la izquierda de la carta; el pie abajo de lado a lado. Filas de 56px, el resto y 44px.',
    hint: 'Áreas <code>"cupula cupula" "catalogo carta" "pie pie"</code>, columnas <code>150px 1fr</code> y filas <code>56px 1fr 44px</code>.',
    pieces: ['cupula', 'carta', 'catalogo', 'pie'],
    rules: [
      {
        selector: '.tablero',
        fixed:
          'display: grid;\ngap: 8px;\ngrid-template-areas:\n  "cupula"\n  "carta"\n  "catalogo"\n  "pie";\ngrid-template-rows: 56px 1fr 56px 44px;',
        editable: false,
      },
      { selector: '.cupula', fixed: 'grid-area: cupula;', editable: false },
      { selector: '.carta', fixed: 'grid-area: carta;', editable: false },
      { selector: '.catalogo', fixed: 'grid-area: catalogo;', editable: false },
      { selector: '.pie', fixed: 'grid-area: pie;', editable: false },
      {
        selector: '.tablero',
        media: '(min-width: 560px)',
        solution:
          'grid-template-areas:\n  "cupula cupula"\n  "catalogo carta"\n  "pie pie";\ngrid-template-columns: 150px 1fr;\ngrid-template-rows: 56px 1fr 44px;',
      },
    ],
  },
  {
    id: 'c2-2',
    region: 2,
    title: 'Constelaciones',
    tokenSize: false,
    widths: [320, 500, 680],
    height: 260,
    allowed: ['grid-template-columns'],
    concepts: ['mobile first', 'min-width'],
    speech:
      'Seis estrellas, tres telescopios distintos. En el pequeño las veo de dos en dos; en el mediano, de tres en tres; en el grande, las seis en fila, como el Cinturón del Grifo.',
    theory:
      '<p>Un patrón muy común: el número de columnas <b>crece</b> con el ancho. Escribe la base para la pantalla pequeña y dos <code>min-width</code> para las demás.</p>',
    objective: '320px: dos columnas. 500px: tres. 680px: seis.',
    hint: 'Fuera, <code>repeat(2, 1fr)</code>; luego <code>repeat(3, 1fr)</code> y <code>repeat(6, 1fr)</code>.',
    pieces: ['estrella', 'estrella', 'estrella', 'estrella', 'estrella', 'estrella'],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: grid;\ngap: 10px;\ngrid-auto-rows: 56px;',
        solution: 'grid-template-columns: repeat(2, 1fr);',
      },
      {
        selector: '.tablero',
        media: '(min-width: 460px)',
        solution: 'grid-template-columns: repeat(3, 1fr);',
      },
      {
        selector: '.tablero',
        media: '(min-width: 640px)',
        solution: 'grid-template-columns: repeat(6, 1fr);',
      },
    ],
  },
  {
    id: 'c2-3',
    region: 2,
    title: 'El telescopio, primero',
    widths: [320, 560],
    height: 330,
    allowed: ['flex-direction', 'order'],
    concepts: ['@media', 'order'],
    speech:
      'Cuando la pantalla es estrecha, quien llega quiere ver el telescopio lo primero, no al final de la lista. En las anchas, que se quede donde está.',
    theory:
      '<p>Una misma media query puede llevar <b>varias reglas</b>. Aquí cambias la dirección del tablero y el <code>order</code> de una pieza a la vez. (<code>order</code> se mueve de menor a mayor; el valor por defecto es 0.)</p>',
    objective:
      '320px: en columna, con el telescopio el primero de arriba. 560px: en fila, en el orden original.',
    hint: '<code>flex-direction: column;</code> en el tablero y <code>order: -1;</code> en el telescopio, los dos dentro de la media query.',
    pieces: ['planeta', 'planeta', 'telescopio', 'planeta'],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: flex;\ngap: 10px;\njustify-content: center;\nalign-items: center;',
        editable: false,
      },
      { selector: '.tablero', media: '(max-width: 400px)', solution: 'flex-direction: column;' },
      { selector: '.telescopio', media: '(max-width: 400px)', solution: 'order: -1;' },
    ],
  },
  {
    id: 'c2-4',
    region: 2,
    title: 'Planetas en la oscuridad',
    variant: 'a oscuras',
    mirage: true,
    className: 'oscuras',
    widths: [340, 600],
    height: 420,
    allowed: ['flex-direction', 'justify-content', 'align-items'],
    concepts: ['@media'],
    speech:
      'Apaga la lámpara, que no deja ver las estrellas. Te lo dicto: en la pantalla ancha, planetas en fila con el mismo espacio alrededor de todos. En la estrecha, en columna, igual de repartidos.',
    theory:
      '<p><b>A oscuras:</b> la huella del objetivo apenas asoma. Fíate de la descripción.</p>',
    objective:
      '<b>600px:</b> fila con el espacio repartido por igual entre bordes y planetas (<code>space-evenly</code>). <b>340px:</b> columna, centrada en horizontal y repartida igual en vertical.',
    hint: 'Fuera: <code>justify-content: space-evenly;</code>. Dentro: <code>flex-direction: column;</code>',
    pieces: ['planeta', 'planeta', 'planeta', 'planeta', 'planeta'],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: flex;\ngap: 10px;\nalign-items: center;',
        solution: 'justify-content: space-evenly;',
      },
      { selector: '.tablero', media: '(max-width: 420px)', solution: 'flex-direction: column;' },
    ],
  },
  {
    id: 'c2-5',
    region: 2,
    title: 'Tres pantallas, tres cartas',
    tokenSize: false,
    widths: [340, 520, 720],
    height: 300,
    allowed: ['grid-template-columns', ...SKY_MEDIA],
    concepts: ['mobile first'],
    speech:
      'Última observación antes de cerrar la cúpula: cuatro cartas celestes. Una columna en el visor pequeño, dos en el mediano; en el grande, la primera carta ocupa el doble que las demás. Tú decides dónde cambia cada cosa.',
    theory:
      '<p>Ahora escribes <b>las condiciones y las reglas</b>. Elige puntos de ruptura que caigan entre los anchos de prueba.</p>',
    objective:
      '340px: una columna. 520px: dos columnas iguales. 720px: cuatro columnas, la primera el doble de ancha (<code>2fr 1fr 1fr 1fr</code>).',
    hint: '<code>(min-width: 480px)</code> con <code>repeat(2, 1fr)</code> y <code>(min-width: 680px)</code> con <code>2fr 1fr 1fr 1fr</code>.',
    pieces: ['carta', 'carta', 'carta', 'carta'],
    rules: (() => {
      const a = skyCondition('(min-width: 480px)'),
        b2 = skyCondition('(min-width: 680px)');
      return [
        {
          selector: '.tablero',
          fixed: 'display: grid;\ngap: 10px;\ngrid-auto-rows: 56px;',
          editable: false,
        },
        { selector: '.tablero', media: a, solution: 'grid-template-columns: repeat(2, 1fr);' },
        { selector: '.tablero', media: b2, solution: 'grid-template-columns: 2fr 1fr 1fr 1fr;' },
      ];
    })(),
  },
  {
    id: 'c2-6',
    region: 2,
    title: 'El cielo apaisado',
    views: [
      { width: 300, height: 400, name: 'Vertical' },
      { width: 520, height: 280, name: 'Apaisada' },
    ],
    allowed: ['orientation', 'and', 'min-width', 'max-width'],
    concepts: ['@media', 'orientation'],
    speech:
      'Mis visitantes giran el catalejo de mano según les conviene: de pie para mirar la Luna, tumbado para barrer el horizonte. El orden de los instrumentos debe seguir al giro, no a los píxeles.',
    theory:
      '<p>No todo es el ancho. <code>orientation</code> pregunta por la <b>forma</b> de la pantalla:</p><ul><li><code>portrait</code>: más alta que ancha (un móvil de pie).</li><li><code>landscape</code>: más ancha que alta (un móvil tumbado, casi cualquier monitor).</li></ul><pre>@media (orientation: landscape) { … }</pre><p>Aquí los botones de vista cambian también el <b>alto</b> del tablero.</p>',
    objective:
      'Con la pantalla vertical, los instrumentos en columna. Con la pantalla apaisada, en fila.',
    hint: '<code>(orientation: landscape)</code>',
    pieces: ['telescopio', 'planeta', 'estrella'],
    checks: [
      {
        inCondition: true,
        pattern: /orientation/,
        message: 'Pregunta por la orientación, no por el ancho',
      },
    ],
    rules: [
      {
        selector: '.tablero',
        fixed:
          'display: flex;\nflex-direction: column;\nalign-items: center;\njustify-content: center;\ngap: 14px;',
        editable: false,
      },
      {
        selector: '.tablero',
        media: skyCondition('(orientation: landscape)'),
        fixed: 'flex-direction: row;',
        editable: false,
      },
    ],
  },
  {
    id: 'c2-7',
    region: 2,
    title: 'Ventanas bajas',
    views: [
      { width: 420, height: 200, name: 'Baja' },
      { width: 420, height: 380, name: 'Alta' },
    ],
    allowed: ['min-height', 'max-height', 'height', 'and'],
    concepts: ['@media', 'min-height'],
    speech:
      'La cúpula tiene ventanas de todos los altos. En las bajas, las estrellas solo caben en fila. Cuando la ventana es alta, de trescientos para arriba, las quiero en columna, como una constelación de pie.',
    theory:
      '<p>Todo lo que has preguntado sobre el ancho se puede preguntar sobre el <b>alto</b>: <code>min-height</code>, <code>max-height</code> y, en la sintaxis de rango, <code>height</code>.</p><pre>@media (min-height: 300px) { … }</pre><p>«Cuando la ventana mida <b>al menos</b> 300px de alto».</p>',
    objective:
      'Con la ventana baja (200px de alto), las estrellas en fila. Con la alta (380px), en columna.',
    hint: '<code>(min-height: 300px)</code>',
    pieces: ['estrella', 'estrella', 'estrella'],
    checks: [
      { inCondition: true, pattern: /height/, message: 'Pregunta por el alto de la ventana' },
    ],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: flex;\nalign-items: center;\njustify-content: center;\ngap: 14px;',
        editable: false,
      },
      {
        selector: '.tablero',
        media: skyCondition('(min-height: 300px)'),
        fixed: 'flex-direction: column;',
        editable: false,
      },
    ],
  },
  {
    id: 'c2-8',
    region: 2,
    title: 'La gran pantalla',
    views: [
      { width: 320, height: 320, name: 'Cuadrada' },
      { width: 560, height: 315, name: 'Panorámica' },
    ],
    allowed: ['aspect-ratio', 'min-aspect-ratio', 'max-aspect-ratio', 'and'],
    concepts: ['@media', 'aspect-ratio'],
    speech:
      'He instalado una pantalla panorámica para proyectar el firmamento: dieciséis de ancho por nueve de alto. En ella, y solo en ella, los planetas se reparten de punta a punta.',
    theory:
      '<p><code>aspect-ratio</code> pregunta por la <b>proporción</b> entre el ancho y el alto, escrita como una fracción. También tiene versiones <code>min-</code> y <code>max-</code>:</p><pre>@media (min-aspect-ratio: 16/9) { … }</pre><p>«Cuando la pantalla sea <b>al menos</b> tan alargada como una de 16:9».</p>',
    objective:
      'En la pantalla cuadrada, los planetas juntos en el centro. En la panorámica (16:9), repartidos de borde a borde.',
    hint: '<code>(min-aspect-ratio: 16/9)</code>',
    pieces: ['planeta', 'estrella', 'planeta'],
    checks: [
      {
        inCondition: true,
        pattern: /aspect-ratio/,
        message: 'Pregunta por la proporción de la pantalla',
      },
    ],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: flex;\nalign-items: center;\njustify-content: center;\ngap: 14px;',
        editable: false,
      },
      {
        selector: '.tablero',
        media: skyCondition('(min-aspect-ratio: 16/9)'),
        fixed: 'justify-content: space-between;',
        editable: false,
      },
    ],
  },
  {
    id: 'c2-9',
    region: 2,
    title: 'Con el dedo',
    views: [{ name: 'Con ratón' }, { name: 'Táctil', pointer: 'coarse' }],
    width: 440,
    height: 240,
    allowed: ['pointer', 'hover', 'and', 'not'],
    concepts: ['@media', 'pointer', 'hover'],
    speech:
      'Última observación. Quien consulta el catálogo en una tablilla táctil no apunta con una flecha: apunta con un dedo, y un dedo es gordo e impreciso. Para ellos, las estrellas más grandes.',
    theory:
      '<p>Dos preguntas sobre <b>cómo se maneja</b> el aparato:</p><ul><li><code>pointer</code>: la precisión del puntero. <code>fine</code> es un ratón; <code>coarse</code>, un dedo.</li><li><code>hover</code>: si se puede «pasar por encima» sin tocar. <code>hover</code> con ratón; <code>none</code> en una pantalla táctil.</li></ul><pre>@media (pointer: coarse) { … }</pre><p>Sirven para agrandar los botones en pantallas táctiles y para no esconder nada detrás de un <code>:hover</code> que allí no existe.</p>',
    objective:
      'Con ratón, las estrellas a su tamaño. En una pantalla táctil, de <b>88px</b> de lado.',
    hint: '<code>(pointer: coarse)</code>',
    pieces: ['estrella', 'estrella', 'estrella'],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: flex;\nalign-items: center;\njustify-content: center;\ngap: 14px;',
        editable: false,
      },
      {
        selector: '.estrella',
        media: skyCondition('(pointer: coarse)'),
        fixed: 'width: 88px;\nheight: 88px;',
        editable: false,
      },
    ],
    farewell:
      'Mis cálculos indican que ya dominas las media queries con un error del cero por ciento. Sube al Templo del Viento: allí guardan los nombres secretos de las cosas.',
  },
  //Region 3 · EL TEMPLO DEL VIENTO
  {
    id: 'c3-1',
    region: 3,
    title: 'El primer soplo',
    width: 480,
    height: 180,
    allowed: ['--hueco'],
    concepts: ['custom properties', 'var()'],
    speech:
      'Respira. El viento tiene nombre. Las cosas también. En este templo escribimos el hueco una vez, con nombre, y lo usamos donde haga falta. Dale valor al nombre: treinta píxeles.',
    theory:
      '<p>Una <b>variable CSS</b> (o <i>custom property</i>) es una propiedad que te inventas tú. Su nombre empieza por <b>dos guiones</b> y puede guardar cualquier valor:</p><pre>--hueco: 30px;</pre><p>Para usarla se escribe <code>var(--hueco)</code>. Aquí el tablero ya la usa en su <code>gap</code>; solo falta darle valor.</p>',
    objective: 'Los molinillos centrados con 30px de hueco entre ellos.',
    hint: '<code>--hueco: 30px;</code>',
    pieces: ['molinillo', 'molinillo', 'molinillo', 'molinillo'],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: flex;\njustify-content: center;\nalign-items: center;\ngap: var(--hueco);',
        solution: '--hueco: 30px;',
      },
    ],
  },
  {
    id: 'c3-2',
    region: 3,
    title: 'El tamaño heredado',
    width: 480,
    height: 220,
    allowed: ['--tam'],
    concepts: ['custom properties', 'herencia'],
    speech:
      'Los molinillos preguntan: «¿cuánto medimos?». El templo responde desde arriba. Lo que el padre sabe, los hijos lo heredan.',
    theory:
      '<p>Las variables <b>se heredan</b>: si las defines en el tablero, todas las piezas de dentro pueden usarlas. Los molinillos ya miden <code>var(--tam)</code>; mientras no le des valor, esa medida no vale nada y el molinillo ocupa lo que ocupe su dibujo.</p>',
    objective:
      'Los tres molinillos de 96 × 96 píxeles, definiendo <code>--tam</code> solo en el tablero.',
    hint: '<code>--tam: 96px;</code> en el tablero.',
    pieces: ['molinillo', 'molinillo', 'molinillo'],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: flex;\njustify-content: center;\nalign-items: center;\ngap: 16px;',
        solution: '--tam: 96px;',
      },
      { selector: '.molinillo', fixed: 'width: var(--tam);\nheight: var(--tam);', editable: false },
    ],
  },
  {
    id: 'c3-3',
    region: 3,
    title: 'Tu primer var()',
    width: 440,
    height: 260,
    allowed: ['--viento', 'gap', 'padding'],
    concepts: ['var()'],
    speech:
      'Ahora escribe tú el nombre… y llámalo. Un mismo soplo de veinticuatro píxeles para separar las piezas entre sí y del borde del templo.',
    theory:
      '<p>Defines la variable y, en la misma regla, la usas con <code>var()</code> en tantas propiedades como quieras:</p><pre>--viento: 24px;\ngap: var(--viento);</pre><p>Si mañana el viento cambia, solo tocas un número.</p>',
    objective:
      '24px de hueco entre piezas y 24px de relleno hasta el borde del tablero, los dos con <code>var(--viento)</code>.',
    hint: '<code>--viento: 24px;</code> · <code>gap: var(--viento);</code> · <code>padding: var(--viento);</code>',
    pieces: ['molinillo', 'campanilla', 'molinillo'],
    checks: [
      {
        pattern: /(var\(\s*--viento\s*\)[\s\S]*){2}/,
        message: 'Usa <code>var(--viento)</code> en el hueco y en el relleno',
      },
    ],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: flex;\nalign-items: flex-start;',
        solution: '--viento: 24px;\ngap: var(--viento);\npadding: var(--viento);',
      },
    ],
  },
  {
    id: 'c3-4',
    region: 3,
    title: 'Banderines alternos',
    labels: false,
    width: 460,
    height: 180,
    tokenSize: [52, 84],
    compare: ['background-color'],
    allowed: ['--claro', '--oscuro'],
    concepts: ['custom properties', 'colores'],
    speech:
      'Las banderas de oración se alternan: una clara, una oscura. Como la respiración: dentro, fuera. Los nombres ya están en las telas. Dales color.',
    theory:
      '<p>Las variables guardan <b>cualquier valor</b>: medidas, colores, números… Aquí las telas pares usan <code>var(--oscuro)</code> y las impares <code>var(--claro)</code>. Los nombres de colores de CSS valen tal cual: <code>gold</code>, <code>royalblue</code>…</p>',
    objective:
      'Banderines alternos: los impares de color <code>gold</code> y los pares de color <code>royalblue</code>.',
    hint: '<code>--claro: gold;</code> y <code>--oscuro: royalblue;</code>',
    pieces: ['banderin', 'banderin', 'banderin', 'banderin', 'banderin', 'banderin'],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: flex;\ngap: 8px;\njustify-content: center;',
        solution: '--claro: gold;\n--oscuro: royalblue;',
      },
      { selector: '.banderin', fixed: 'background-color: var(--claro);', editable: false },
      {
        selector: '.banderin:nth-child(even)',
        fixed: 'background-color: var(--oscuro);',
        editable: false,
      },
    ],
  },
  {
    id: 'c3-5',
    region: 3,
    title: 'Una sola palabra',
    variant: 'regateo',
    purse: { total: 2, price: 2 },
    width: 460,
    height: 200,
    allowed: ['--u', 'gap', 'padding', 'margin-top'],
    concepts: ['custom properties'],
    purseMessage:
      'Hermano Soplo: «Muchas palabras… poco viento. Una sola basta, si es la correcta.»',
    speech:
      'Último ejercicio de silencio: una sola palabra. El hueco, el relleno y el margen de las campanillas dependen de ella. Veintidós.',
    theory:
      '<p><b>Regateo:</b> solo te llega para una declaración. Fíjate en cuántos sitios se usa la misma variable: cambiando su valor, cambias todos a la vez.</p>',
    objective:
      '22px de hueco, 22px de relleno y campanillas bajadas 22px, con una sola declaración.',
    hint: '<code>--u: 22px;</code>',
    pieces: ['campanilla', 'campanilla', 'campanilla', 'campanilla'],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: flex;\ngap: var(--u);\npadding: var(--u);',
        solution: '--u: 22px;',
      },
      { selector: '.campanilla', fixed: 'margin-top: var(--u);', editable: false },
    ],
  },
  {
    id: 'c3-6',
    region: 3,
    title: 'La paleta en la raíz',
    labels: false,
    width: 460,
    height: 180,
    tokenSize: [52, 84],
    compare: ['background-color'],
    allowed: ['--cielo', '--sol'],
    concepts: ['custom properties', ':root'],
    speech:
      'Hasta ahora guardábamos los nombres en el tablero. Pero hay un lugar más alto, del que todo desciende: la raíz. Lo que nombres allí lo oye la página entera. Guarda en ella los dos colores del templo.',
    theory:
      '<p><code>:root</code> selecciona la <b>raíz</b> del documento: el elemento del que cuelgan todos los demás. Una variable declarada ahí está disponible en <b>cualquier parte</b> de la página, y por eso es donde se suele guardar la <b>paleta</b>: colores, medidas y tipos de letra.</p><pre>:root {\n  --cielo: skyblue;\n  --sol: gold;\n}</pre><p>Si mañana cambia un color, se cambia en un solo sitio.</p>',
    objective:
      'En <code>:root</code>, <code>--cielo</code> vale <code>skyblue</code> y <code>--sol</code>, <code>gold</code>: los banderines se alternan.',
    hint: '<code>--cielo: skyblue;</code> y <code>--sol: gold;</code>',
    pieces: ['banderin', 'banderin', 'banderin', 'banderin', 'banderin', 'banderin'],
    rules: [
      { selector: ':root', solution: '--cielo: skyblue;\n--sol: gold;' },
      {
        selector: '.tablero',
        fixed: 'display: flex;\ngap: 8px;\njustify-content: center;',
        editable: false,
      },
      { selector: '.banderin', fixed: 'background-color: var(--cielo);', editable: false },
      {
        selector: '.banderin:nth-child(even)',
        fixed: 'background-color: var(--sol);',
        editable: false,
      },
    ],
    farewell:
      'Una palabra, muchos efectos. Ve en paz al Taller del Arcoíris. Iris habla mucho, pero tiñe bien.',
  },
  //Region 4 · EL TALLER DEL ARCOÍRIS
  {
    id: 'c4-1',
    region: 4,
    title: 'Cada tela, su tinte',
    width: 440,
    height: 180,
    compare: ['background-color'],
    allowed: ['--tinte'],
    concepts: ['custom properties', 'herencia'],
    speech:
      '¡Hola, hola, hola! ¿Te gustan los colores? ¡A mí me ENCANTAN! Todas las telas, azul cielo… menos la especial, que va en rojo tomate. ¡Una variable, dos colores!',
    theory:
      '<p>Una variable definida en el tablero llega a todas las piezas… salvo que una pieza la <b>vuelva a definir</b>. Entonces, para esa pieza (y lo que tenga dentro), vale el valor nuevo.</p><pre>.tablero  { --tinte: skyblue; }\n.especial { --tinte: tomato; }</pre>',
    objective:
      'Todas las telas de color <code>skyblue</code>, menos la especial, de color <code>tomato</code>.',
    hint: '<code>--tinte: skyblue;</code> en el tablero y <code>--tinte: tomato;</code> en <code>.especial</code>.',
    pieces: ['pano', 'pano', 'pano@especial', 'pano'],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: flex;\ngap: 12px;\njustify-content: center;',
        solution: '--tinte: skyblue;',
      },
      { selector: '.pano', fixed: 'background-color: var(--tinte);', editable: false },
      { selector: '.especial', solution: '--tinte: tomato;' },
    ],
  },
  {
    id: 'c4-2',
    region: 4,
    title: 'Valor de reserva',
    width: 440,
    height: 220,
    allowed: ['height', '--alto'],
    concepts: ['var()', 'fallback'],
    speech:
      'Las telas cortas ya saben cuánto miden: lo pone en su etiqueta. Las demás no tienen ni idea, ¡las pobres! Que midan 150 si nadie les dice otra cosa.',
    theory:
      '<p><code>var()</code> admite un <b>valor de reserva</b> tras una coma: se usa si la variable <b>no está definida</b>.</p><pre>height: var(--alto, 150px);</pre><p>Las telas cortas definen <code>--alto</code>; las demás, no.</p>',
    objective:
      'Las telas cortas, de 70px de alto; las demás, de 150px. Con una sola regla para <code>.pano</code>.',
    hint: '<code>height: var(--alto, 150px);</code>',
    pieces: ['pano', 'pano@corto', 'pano', 'pano@corto'],
    checks: [
      {
        pattern: /var\(\s*--alto\s*,/,
        message: 'Usa <code>var(--alto, …)</code> con un valor de reserva',
      },
    ],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: flex;\ngap: 12px;\nalign-items: flex-end;\njustify-content: center;',
        editable: false,
      },
      { selector: '.pano', solution: 'height: var(--alto, 150px);' },
      { selector: '.corto', fixed: '--alto: 70px;', editable: false },
    ],
  },
  {
    id: 'c4-3',
    region: 4,
    title: 'Tendederos',
    labels: false,
    width: 440,
    height: 260,
    compare: ['background-color'],
    allowed: ['--tinte'],
    concepts: ['herencia', 'anidación'],
    speech:
      'Dos tendederos, seis telas. El de arriba, azul acero; el del sol, ¡naranja! Y no pienso pintar tela por tela, que se me secan los pinceles.',
    theory:
      '<p>La herencia baja <b>por las ramas</b>: si redefines la variable en un contenedor, todos sus hijos reciben el valor nuevo, y el resto se queda con el de antes.</p>',
    objective:
      'Las telas del primer tendedero, <code>steelblue</code>; las del tendedero del sol, <code>orange</code>.',
    hint: '<code>--tinte: steelblue;</code> en el tablero y <code>--tinte: orange;</code> en <code>.sol</code>.',
    pieces: ['tendedero', ['pano', 'pano', 'pano'], 'tendedero@sol', ['pano', 'pano', 'pano']],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: flex;\nflex-direction: column;\ngap: 12px;',
        solution: '--tinte: steelblue;',
      },
      { selector: '.tendedero', fixed: 'display: flex;\ngap: 10px;', editable: false },
      { selector: '.pano', fixed: 'background-color: var(--tinte);', editable: false },
      { selector: '.sol', solution: '--tinte: orange;' },
    ],
  },
  {
    id: 'c4-4',
    region: 4,
    title: 'Tonos del arcoíris',
    variant: 'contra reloj',
    timeLimit: 75,
    className: 'niebla',
    tokenSize: false,
    width: 340,
    height: 300,
    compare: ['background-color'],
    allowed: ['--tono'],
    concepts: ['custom properties', 'colores'],
    timeMessages: {
      expired:
        '¡Se ha secado el tinte! <button type="button" class="text-link" id="p-sacudir">Moja los pinceles</button> y vuelve a intentarlo.',
      late: 'Colores preciosos, aunque un poco secos. Repítelo a tiempo y sin pistas para dominarlo.',
    },
    speech:
      '¡Rápido, que el tinte se seca! Las franjas usan el tono como un número del círculo de colores: rojo cero, amarillo sesenta, verde ciento veinte, azul doscientos cuarenta. ¡Ya!',
    theory:
      '<p>Una variable puede guardar solo <b>un trozo</b> de un valor. Aquí cada franja pinta <code>hsl(var(--tono) 80% 60%)</code>: el tono es un ángulo del círculo cromático.</p>',
    objective: 'Franjas de arriba abajo: tono 0 (rojo), 60 (amarillo), 120 (verde) y 240 (azul).',
    hint: '<code>--tono: 0;</code>, <code>--tono: 60;</code>, <code>--tono: 120;</code> y <code>--tono: 240;</code>',
    pieces: ['franja@f1', 'franja@f2', 'franja@f3', 'franja@f4'],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: flex;\nflex-direction: column;\ngap: 8px;',
        editable: false,
      },
      {
        selector: '.franja',
        fixed: 'flex: 1;\nbackground-color: hsl(var(--tono) 80% 60%);',
        editable: false,
      },
      { selector: '.f1', solution: '--tono: 0;' },
      { selector: '.f2', solution: '--tono: 60;' },
      { selector: '.f3', solution: '--tono: 120;' },
      { selector: '.f4', solution: '--tono: 240;' },
    ],
  },
  {
    id: 'c4-5',
    region: 4,
    title: 'El taller a oscuras',
    variant: 'a oscuras',
    mirage: true,
    className: 'oscuras',
    width: 460,
    height: 200,
    compare: ['background-color'],
    allowed: ['--ancho', '--tinte'],
    concepts: ['fallback', 'herencia'],
    speech:
      '¡Ay, se ha fundido la lámpara! Te lo digo de memoria: todas las telas, de 84 de ancho. La de seda, de 120 y de color ciruela. Las demás, del color que traen de serie.',
    theory:
      '<p><b>A oscuras:</b> casi no verás la huella. Las telas usan <code>var(--ancho, 64px)</code> y <code>var(--tinte, ivory)</code>: lo que no definas se queda con el valor de reserva.</p>',
    objective:
      'Todas las telas de <b>84px</b> de ancho, menos la de seda, de <b>120px</b> y color <code>plum</code>. Las demás conservan su color de reserva.',
    hint: '<code>--ancho: 84px;</code> en el tablero; <code>--tinte: plum;</code> y <code>--ancho: 120px;</code> en <code>.seda</code>.',
    pieces: ['pano', 'pano@seda', 'pano', 'pano'],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: flex;\ngap: 12px;\njustify-content: center;\nalign-items: center;',
        solution: '--ancho: 84px;',
      },
      {
        selector: '.pano',
        fixed: 'width: var(--ancho, 64px);\nbackground-color: var(--tinte, ivory);',
        editable: false,
      },
      { selector: '.seda', solution: '--tinte: plum;\n--ancho: 120px;' },
    ],
  },
  {
    id: 'c4-6',
    region: 4,
    title: 'Cuando cae la noche',
    views: [{ name: 'Claro' }, { name: 'Oscuro', colorScheme: 'dark' }],
    width: 440,
    height: 190,
    compare: ['background-color'],
    allowed: ['prefers-color-scheme', '--fondo', '--tinta', 'and', 'not'],
    concepts: [':root', 'prefers-color-scheme'],
    speech:
      '¡Hay gente que prefiere la noche! ¡Con lo bonito que es el día! Pero yo tiño para todos: si alguien tiene su aparato en modo oscuro, las telas en azul medianoche y la franja, dorada. ¡Mismos nombres, otros tintes!',
    theory:
      '<p><code>prefers-color-scheme</code> pregunta qué ha elegido <b>la persona</b> en su sistema: tema <code>light</code> (claro) o <code>dark</code> (oscuro).</p><pre>@media (prefers-color-scheme: dark) {\n  :root { --fondo: midnightblue; }\n}</pre><p>Con la paleta en <code>:root</code>, el modo oscuro es facilísimo: <b>no tocas ninguna regla</b>, solo cambias el valor de las variables.</p>',
    objective:
      'En modo claro, como está. En modo oscuro, <code>--fondo</code> vale <code>midnightblue</code> y <code>--tinta</code>, <code>gold</code>.',
    hint: 'Condición: <code>(prefers-color-scheme: dark)</code>. Dentro: <code>--fondo: midnightblue;</code> y <code>--tinta: gold;</code>',
    pieces: ['pano', 'pano@franja', 'pano'],
    rules: [
      { selector: ':root', fixed: '--fondo: ivory;\n--tinta: tomato;', editable: false },
      {
        selector: '.tablero',
        fixed: 'display: flex;\ngap: 12px;\njustify-content: center;',
        editable: false,
      },
      { selector: '.pano', fixed: 'background-color: var(--fondo);', editable: false },
      { selector: '.franja', fixed: 'background-color: var(--tinta);', editable: false },
      {
        selector: ':root',
        media: skyCondition('(prefers-color-scheme: dark)'),
        solution: '--fondo: midnightblue;\n--tinta: gold;',
      },
    ],
    farewell:
      '¡Preciosidad de colores! Llévale este pañuelo a Garra, la grifa. Dile que es de parte de Iris… y que no se lo coma.',
  },
  //Region 5 · EL NIDO DE LOS GRIFOS
  {
    id: 'c5-1',
    region: 5,
    title: 'Huevos a medida',
    width: 440,
    height: 260,
    allowed: ['width', 'height'],
    concepts: ['calc()', 'var()'],
    speech:
      'Mis polluelos se miden en garras. Una garra son veinte píxeles. Los huevos normales miden tres garras de ancho y cuatro de alto. El grande, cinco de ancho y siete de alto. Y no me lo redondees.',
    theory:
      '<p><code>calc()</code> hace cuentas con medidas, y se lleva muy bien con las variables:</p><pre>width: calc(var(--u) * 5);</pre><p>Si cambias <code>--u</code>, todo lo que se calcula con ella cambia en proporción.</p>',
    objective:
      'El huevo grande, de 5 × 7 garras (<code>--u</code> vale 20px), calculado con <code>calc()</code> y <code>var(--u)</code>.',
    hint: '<code>width: calc(var(--u) * 5);</code> y <code>height: calc(var(--u) * 7);</code>',
    pieces: ['huevo', 'huevo', 'huevo@grande'],
    checks: [
      {
        pattern: /calc\([^;]*var\(\s*--u\s*\)/,
        message: 'Calcula con <code>calc()</code> y <code>var(--u)</code>',
      },
    ],
    rules: [
      {
        selector: '.tablero',
        fixed:
          'display: flex;\nalign-items: flex-end;\njustify-content: center;\ngap: 12px;\n--u: 20px;',
        editable: false,
      },
      {
        selector: '.huevo',
        fixed: 'width: calc(var(--u) * 3);\nheight: calc(var(--u) * 4);',
        editable: false,
      },
      { selector: '.grande', solution: 'width: calc(var(--u) * 5);\nheight: calc(var(--u) * 7);' },
    ],
  },
  {
    id: 'c5-2',
    region: 5,
    title: 'Proporciones del nido',
    width: 460,
    height: 240,
    allowed: ['--doble'],
    concepts: ['calc()', 'custom properties'],
    speech:
      'En mi nido todo es proporcional. Las plumas y el nido usan una medida doble que alguien olvidó definir. Doble de la garra, claro.',
    theory:
      '<p>Una variable puede <b>calcularse a partir de otra</b>:</p><pre>--doble: calc(var(--u) * 2);</pre>',
    objective:
      'Definir <code>--doble</code> como el doble de <code>--u</code>: plumas de 36 × 72 y nido de 144 × 72.',
    hint: '<code>--doble: calc(var(--u) * 2);</code>',
    pieces: ['pluma', 'nido', 'pluma'],
    checks: [
      {
        pattern: /--doble\s*:\s*calc\(/,
        message: 'Calcula <code>--doble</code> con <code>calc()</code>',
      },
    ],
    rules: [
      {
        selector: '.tablero',
        fixed:
          'display: flex;\nalign-items: center;\njustify-content: center;\ngap: 14px;\n--u: 36px;',
        solution: '--doble: calc(var(--u) * 2);',
      },
      { selector: '.pluma', fixed: 'width: var(--u);\nheight: var(--doble);', editable: false },
      {
        selector: '.nido',
        fixed: 'width: calc(var(--doble) * 2);\nheight: var(--doble);',
        editable: false,
      },
    ],
  },
  {
    id: 'c5-3',
    region: 5,
    title: 'Columnas variables',
    tokenSize: false,
    widths: [340, 600],
    height: 260,
    allowed: ['--cols'],
    concepts: ['custom properties', '@media'],
    speech:
      'Cuando el nido es pequeño, mis polluelos duermen de dos en dos. Cuando es grande, cuatro en fila. La regla ya está escrita: solo cambia cuántas columnas.',
    theory:
      '<p>Una media query puede cambiar <b>solo el valor de una variable</b>, y todo lo que la use se actualiza:</p><pre>@media (min-width: 520px) {\n  .tablero { --cols: 4; }\n}</pre>',
    objective: '340px: dos columnas. 600px: cuatro. Cambiando solo <code>--cols</code>.',
    hint: '<code>--cols: 2;</code> fuera y <code>--cols: 4;</code> dentro.',
    pieces: ['nido', 'nido', 'nido', 'nido'],
    rules: [
      {
        selector: '.tablero',
        fixed:
          'display: grid;\ngrid-template-columns: repeat(var(--cols), 1fr);\ngrid-auto-rows: 70px;\ngap: 10px;',
        solution: '--cols: 2;',
      },
      { selector: '.tablero', media: '(min-width: 520px)', solution: '--cols: 4;' },
    ],
  },
  {
    id: 'c5-4',
    region: 5,
    title: 'Plumas que crecen',
    widths: [340, 620],
    height: 260,
    allowed: ['--u'],
    concepts: ['calc()', '@media'],
    speech:
      'En el nido estrecho, la garra mide doce. En el ancho, veinte. Las plumas y sus huecos crecen solas, porque todo está medido en garras.',
    theory:
      '<p>Combinando <code>calc()</code>, variables y media queries, un solo número controla un diseño entero y su versión para cada pantalla.</p>',
    objective:
      '340px: <code>--u</code> de 12px. 620px: <code>--u</code> de 20px. Las plumas y los huecos se calculan solos.',
    hint: '<code>--u: 12px;</code> fuera y <code>--u: 20px;</code> dentro.',
    pieces: ['pluma', 'pluma', 'pluma', 'pluma'],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: flex;\njustify-content: center;\nalign-items: center;\ngap: var(--u);',
        solution: '--u: 12px;',
      },
      {
        selector: '.pluma',
        fixed: 'width: calc(var(--u) * 3);\nheight: calc(var(--u) * 6);',
        editable: false,
      },
      { selector: '.tablero', media: '(min-width: 520px)', solution: '--u: 20px;' },
    ],
  },
  {
    id: 'c5-5',
    region: 5,
    title: 'Antes de que eclosionen',
    variant: 'contra reloj',
    timeLimit: 70,
    className: 'niebla',
    width: 460,
    height: 240,
    allowed: ['--u', 'width', 'height'],
    concepts: ['calc()'],
    timeMessages: {
      expired:
        '¡Crac! ¡Han eclosionado! <button type="button" class="text-link" id="p-sacudir">Vuelve a empezar</button> antes de que salga el siguiente.',
      late: 'Los polluelos han salido antes de tiempo, pero están sanos. Repítelo a tiempo y sin pistas para dominarlo.',
    },
    speech:
      '¡Crac, crac! ¡Que nacen! Garra de dieciséis. Y la cría que ya ha salido del cascarón, cinco garras por cinco. ¡Deprisa!',
    theory:
      '<p><b>Contra reloj:</b> el tiempo corre en cuanto escribes. Todo se mide en garras: <code>--u</code>.</p>',
    objective: '<code>--u</code> de 16px; la cría, de 5 × 5 garras con <code>calc()</code>.',
    hint: '<code>--u: 16px;</code> y en <code>.cria</code>: <code>width: calc(var(--u) * 5);</code> <code>height: calc(var(--u) * 5);</code>',
    pieces: ['huevo', 'huevo', 'grifo@cria', 'huevo', 'huevo'],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: flex;\nalign-items: flex-end;\njustify-content: center;\ngap: var(--u);',
        solution: '--u: 16px;',
      },
      {
        selector: '.huevo',
        fixed: 'width: calc(var(--u) * 3);\nheight: calc(var(--u) * 4);',
        editable: false,
      },
      { selector: '.cria', solution: 'width: calc(var(--u) * 5);\nheight: calc(var(--u) * 5);' },
    ],
    farewell:
      '¡Mis polluelos te adoran! Toma, una pluma de grifo: dicen que hace las caídas más suaves. Te vendrá bien en la Cascada de Nubes.',
  },
  //Region 6 · LA CASCADA DE NUBES
  {
    id: 'c6-1',
    region: 6,
    title: 'El puente que se despliega',
    state: 'active',
    width: 480,
    height: 180,
    allowed: SKY_TRANSITION.slice(0, 3),
    concepts: ['transition'],
    speech:
      '¡Hop! ¡Hola! Cuando tiro de la palanca, el puente de cuerda se despliega… ¡de golpe! Y así no hay quien haga equilibrios. Que se estire despacito, en un segundo.',
    theory:
      '<p>Sin transición, un cambio de estilo ocurre <b>de golpe</b>. Con <code>transition</code>, el navegador lo reparte en el tiempo:</p><pre>transition: width 1s;</pre><p>Primero, <b>qué propiedad</b> se anima; después, <b>cuánto dura</b>. Pulsa <b>Activar</b> para ver el cambio: al activar, el tablero recibe la clase <code>.activo</code>. La huella te enseña el ritmo que buscamos.</p><p>Animar el tamaño es el ejemplo más fácil de ver, pero no el más ligero: al final de esta región aprenderás la alternativa.</p>',
    objective: 'Al activar, el puente pasa de 40px a 280px de ancho <b>en 1 segundo</b>.',
    hint: '<code>transition: width 1s;</code>',
    pieces: ['isleta', 'puente', 'isleta'],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: flex;\nalign-items: center;\njustify-content: center;',
        editable: false,
      },
      {
        selector: '.puente',
        fixed: 'width: 40px;\nheight: 36px;',
        solution: 'transition: width 1s;',
      },
      { selector: '.tablero.activo .puente', fixed: 'width: 280px;', editable: false },
    ],
  },
  {
    id: 'c6-2',
    region: 6,
    title: 'Nubes lentas y rápidas',
    state: 'active',
    width: 420,
    height: 260,
    allowed: SKY_TRANSITION.slice(0, 3),
    concepts: ['transition-duration'],
    speech:
      'Mira las nubes: unas corren, otras pasean. Las rápidas suben en cuatro décimas de segundo. La lenta, en dos segundos enteros. ¡Como en la vida!',
    theory:
      '<p>La duración se escribe en segundos (<code>2s</code>) o en milisegundos (<code>400ms</code>). <code>0.4s</code> y <code>400ms</code> son lo mismo.</p>',
    objective: 'Al activar, todas suben 120px: las rápidas en <b>0.4s</b> y la lenta en <b>2s</b>.',
    hint: '<code>transition: transform 0.4s;</code> en <code>.rapida</code> y <code>transition: transform 2s;</code> en <code>.lenta</code>.',
    pieces: ['nube@rapida', 'nube@lenta', 'nube@rapida'],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: flex;\njustify-content: space-around;\nalign-items: flex-end;',
        editable: false,
      },
      {
        selector: '.tablero.activo .nube',
        fixed: 'transform: translateY(-120px);',
        editable: false,
      },
      { selector: '.rapida', solution: 'transition: transform 0.4s;' },
      { selector: '.lenta', solution: 'transition: transform 2s;' },
    ],
  },
  {
    id: 'c6-3',
    region: 6,
    title: 'Solo lo que toca',
    state: 'active',
    width: 380,
    height: 260,
    allowed: SKY_TRANSITION.slice(0, 3),
    concepts: ['transition-property'],
    speech:
      'Las gotas de la cascada caen despacio, pero se vuelven transparentes de golpe, ¡zas!, como si se las tragara la niebla. Solo el movimiento lleva transición.',
    theory:
      '<p><code>transition-property</code> elige <b>qué</b> se anima. Lo que no esté en la lista cambia de golpe. Con <code>all</code> se anima todo, y aquí eso no vale.</p><pre>transition-property: transform;\ntransition-duration: 1.5s;</pre>',
    objective:
      'Al activar, las gotas bajan en <b>1.5s</b>, pero su transparencia cambia <b>al instante</b>.',
    hint: '<code>transition-property: transform;</code> y <code>transition-duration: 1.5s;</code>',
    pieces: ['gota', 'gota', 'gota'],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: flex;\njustify-content: space-around;',
        editable: false,
      },
      {
        selector: '.gota',
        solution: 'transition-property: transform;\ntransition-duration: 1.5s;',
      },
      {
        selector: '.tablero.activo .gota',
        fixed: 'transform: translateY(140px);\nopacity: 0.3;',
        editable: false,
      },
    ],
  },
  {
    id: 'c6-4',
    region: 6,
    title: 'Globos al pasar el cursor',
    state: 'hover',
    width: 420,
    height: 260,
    allowed: ['transform', ...SKY_TRANSITION.slice(0, 3)],
    concepts: [':hover', 'transition'],
    speech:
      '¿Sabes qué les gusta a los globos? ¡Las cosquillas! Cuando pasas el ratón por encima, suben noventa píxeles en seis décimas de segundo. Prueba, prueba.',
    theory:
      '<p>El estado <code>:hover</code> se cumple cuando el cursor está <b>encima</b> del elemento. Las transiciones son perfectas para él: describe el cambio en <code>:hover</code> y la transición en la regla normal.</p><p>Pasa el ratón por tus globos, o usa el botón <b>Pasar el cursor</b> para verlos todos a la vez.</p>',
    objective:
      'Con el cursor encima, cada globo sube 90px (<code>translateY(-90px)</code>) en <b>0.6s</b>.',
    hint: 'En <code>.globo</code>: <code>transition: transform 0.6s;</code>. En <code>.globo:hover</code>: <code>transform: translateY(-90px);</code>',
    pieces: ['globo', 'globo', 'globo'],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: flex;\njustify-content: space-around;\nalign-items: flex-end;',
        editable: false,
      },
      { selector: '.globo', solution: 'transition: transform 0.6s;' },
      { selector: '.globo:hover', solution: 'transform: translateY(-90px);' },
    ],
  },
  {
    id: 'c6-5',
    region: 6,
    title: 'La cascada contra reloj',
    variant: 'contra reloj',
    timeLimit: 60,
    className: 'niebla',
    state: 'active',
    width: 420,
    height: 280,
    tokenSize: [56, 40],
    allowed: SKY_TRANSITION.slice(0, 3),
    concepts: ['transition'],
    timeMessages: {
      expired:
        '¡Me caigo, me caigo! <button type="button" class="text-link" id="p-sacudir">Vuelve a la cuerda</button> y prueba otra vez antes de que suba la niebla.',
      late: 'Un poco tarde, pero el equilibrio es lo que cuenta. Repítelo a tiempo y sin pistas para dominarlo.',
    },
    speech:
      '¡Rápido, que viene la niebla! Al abrir las compuertas, los chorros caen en 1.2 segundos. El grueso, que pesa más, tarda dos.',
    theory:
      '<p><b>Contra reloj.</b> Recuerda: una propiedad suelta como <code>transition-duration</code> escrita después cambia solo esa parte de la transición.</p>',
    objective:
      'Al activar, los chorros crecen hasta 230px de alto en <b>1.2s</b>; el grueso, en <b>2s</b>.',
    hint: '<code>transition: height 1.2s;</code> en <code>.chorro</code> y <code>transition-duration: 2s;</code> en <code>.grueso</code>.',
    pieces: ['chorro', 'chorro@grueso', 'chorro'],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: flex;\njustify-content: space-around;\nalign-items: flex-start;',
        editable: false,
      },
      { selector: '.tablero.activo .chorro', fixed: 'height: 230px;', editable: false },
      { selector: '.chorro', solution: 'transition: height 1.2s;' },
      { selector: '.grueso', solution: 'transition-duration: 2s;' },
    ],
  },
  {
    id: 'c6-6',
    region: 6,
    title: 'Al pulsar',
    state: 'pressed',
    width: 420,
    height: 240,
    allowed: ['transform', ...SKY_TRANSITION.slice(0, 3)],
    concepts: [':active', 'transition'],
    speech:
      '¡Otro truco! Cuando aprietas un globo, se encoge un poquito, como si lo estrujaras. Y al soltarlo, ¡pop!, vuelve. Tiene que ser rapidísimo: una décima de segundo.',
    theory:
      '<p><code>:active</code> se cumple <b>mientras se está pulsando</b> el elemento: desde que aprietas hasta que sueltas. Es la respuesta que hace que un botón parezca un botón.</p><pre>.globo:active { transform: scale(0.85); }</pre><p>Mantén pulsado uno de tus globos, o usa el botón <b>Mantener pulsado</b> para verlos todos.</p>',
    objective: 'Mientras se pulsa, cada globo se encoge (<code>scale(0.85)</code>) en <b>0.1s</b>.',
    hint: 'En <code>.globo</code>: <code>transition: transform 0.1s;</code>. En <code>.globo:active</code>: <code>transform: scale(0.85);</code>',
    pieces: ['globo', 'globo', 'globo'],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: flex;\njustify-content: space-around;\nalign-items: center;',
        editable: false,
      },
      { selector: '.globo', solution: 'transition: transform 0.1s;' },
      { selector: '.globo:active', solution: 'transform: scale(0.85);' },
    ],
  },
  {
    id: 'c6-7',
    region: 6,
    title: 'El aura del foco',
    state: 'focus',
    compare: ['box-shadow'],
    width: 420,
    height: 240,
    allowed: ['box-shadow', ...SKY_TRANSITION.slice(0, 3)],
    concepts: [':focus', 'transition'],
    speech:
      'Hay quien cruza la cuerda sin ratón, saltando de globo en globo con el teclado. ¡Y tiene que saber en cuál está! Al que tiene el foco, un aura dorada alrededor, que aparezca en medio segundo.',
    theory:
      '<p><code>:focus</code> se cumple en el elemento que <b>tiene el foco</b>: el que recibirá lo que teclees. Quien navega con el tabulador depende de verlo, así que nunca lo dejes sin señal. Usa el botón <b>Dar el foco</b> para probarlo.</p><p><code>box-shadow</code> dibuja una <b>sombra</b> alrededor de la caja sin ocupar sitio: desplazamiento horizontal, vertical, desenfoque, extensión y color.</p><pre>box-shadow: 0 0 0 6px gold;</pre><p>Sin desplazamiento ni desenfoque y con 6px de extensión, la «sombra» es un <b>anillo</b>.</p>',
    objective:
      'Con el foco, cada globo lleva un anillo dorado de 6px (<code>0 0 0 6px gold</code>) que aparece en <b>0.5s</b>.',
    hint: 'En <code>.globo</code>: <code>transition: box-shadow 0.5s;</code>. En <code>.globo:focus</code>: <code>box-shadow: 0 0 0 6px gold;</code>',
    pieces: ['globo', 'globo', 'globo'],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: flex;\njustify-content: space-around;\nalign-items: center;',
        editable: false,
      },
      { selector: '.globo', solution: 'transition: box-shadow 0.5s;' },
      { selector: '.globo:focus', solution: 'box-shadow: 0 0 0 6px gold;' },
    ],
  },
  {
    id: 'c6-8',
    region: 6,
    title: 'Sin empujar a nadie',
    state: 'active',
    width: 480,
    height: 200,
    allowed: ['transform', 'opacity', ...SKY_TRANSITION.slice(0, 3)],
    concepts: ['rendimiento', 'transition'],
    speech:
      '¿Te acuerdas del puente que se estiraba? Era muy bonito, pero cada vez que crecía empujaba a las isletas, y las isletas a las nubes, y las nubes a mí. Hay otra forma de estirarlo sin que nadie se entere.',
    theory:
      '<p>Al animar <code>width</code>, <code>height</code> o <code>margin</code>, el navegador tiene que <b>recolocar</b> todo lo que hay alrededor a cada fotograma, y eso puede ir a tirones.</p><p><code>transform</code> y <code>opacity</code> no mueven a nadie: el elemento se <b>dibuja</b> estirado, girado o transparente, pero su hueco sigue siendo el mismo. Por eso son las dos propiedades <b>baratas</b> de animar, y la regla es: <b>si puedes, anima <code>transform</code> y <code>opacity</code></b>.</p><pre>transform: scaleX(3);  /* tres veces más ancho, sin empujar */</pre>',
    objective:
      'Al activar, el puente se dibuja <b>tres veces más ancho</b> (<code>scaleX(3)</code>) en <b>1s</b>, hasta tocar las isletas, sin moverlas.',
    hint: 'En <code>.puente</code>: <code>transition: transform 1s;</code>. En <code>.tablero.activo .puente</code>: <code>transform: scaleX(3);</code>',
    pieces: ['isleta', 'puente', 'isleta'],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: flex;\nalign-items: center;\njustify-content: space-between;',
        editable: false,
      },
      {
        selector: '.puente',
        fixed: 'width: 108px;\nheight: 36px;',
        solution: 'transition: transform 1s;',
      },
      { selector: '.tablero.activo .puente', solution: 'transform: scaleX(3);' },
    ],
    farewell:
      '¡Ta-chán! Ni una gota fuera de sitio. Sube al Campanario, que Maese Tañido lleva toda la mañana tocando a destiempo.',
  },
  //Region 7 · EL CAMPANARIO DE LOS VIENTOS
  {
    id: 'c7-1',
    region: 7,
    title: 'Tres ritmos',
    state: 'active',
    width: 420,
    height: 280,
    allowed: ['transition-timing-function'],
    concepts: ['timing-function'],
    speech:
      '¿EH? ¿CÓMO? ¡Ah, las campanas! Bajan las tres a la vez, pero cada una a su ritmo: la primera, siempre igual; la segunda arranca despacio; la tercera frena al final. ¡Escucha con los ojos!',
    theory:
      '<p><code>transition-timing-function</code> dice <b>cómo se reparte</b> el cambio en el tiempo:</p><ul><li><code>linear</code>: a velocidad constante.</li><li><code>ease-in</code>: empieza despacio y acelera.</li><li><code>ease-out</code>: empieza rápido y frena.</li><li><code>ease</code> (por defecto) y <code>ease-in-out</code>: suaves por los dos lados.</li></ul>',
    objective:
      'Al activar: la primera campana baja con <code>linear</code>, la segunda con <code>ease-in</code> y la tercera con <code>ease-out</code>.',
    hint: '<code>transition-timing-function: linear;</code>, <code>ease-in</code> y <code>ease-out</code>.',
    pieces: ['campana@uno', 'campana@dos', 'campana@tres'],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: flex;\njustify-content: space-around;',
        editable: false,
      },
      { selector: '.campana', fixed: 'transition: transform 1.5s;', editable: false },
      {
        selector: '.tablero.activo .campana',
        fixed: 'transform: translateY(170px);',
        editable: false,
      },
      { selector: '.uno', solution: 'transition-timing-function: linear;' },
      { selector: '.dos', solution: 'transition-timing-function: ease-in;' },
      { selector: '.tres', solution: 'transition-timing-function: ease-out;' },
    ],
  },
  {
    id: 'c7-2',
    region: 7,
    title: 'El carillón',
    variant: 'musical',
    musical: true,
    state: 'active',
    width: 440,
    height: 200,
    allowed: ['transition-delay'],
    concepts: ['transition-delay'],
    speech:
      '¡El carillón! Cuatro campanas, una detrás de otra: tan… tan… tan… ¡TAN! Tres décimas de segundo entre cada una. Ahora suenan todas a la vez y parece una cacerolada.',
    theory:
      '<p><code>transition-delay</code> hace <b>esperar</b> a la transición antes de empezar. Con retrasos crecientes, los elementos se mueven <b>en cascada</b>.</p><p><b>Nivel musical:</b> al activar, cada campana suena cuando empieza a moverse.</p>',
    objective:
      'Al activar, las campanas se balancean en orden: la primera enseguida, y las siguientes con <b>0.3s</b>, <b>0.6s</b> y <b>0.9s</b> de retraso.',
    hint: '<code>transition-delay: 0.3s;</code> en <code>.c2</code>, <code>0.6s</code> en <code>.c3</code> y <code>0.9s</code> en <code>.c4</code>.',
    pieces: ['campana@c1', 'campana@c2', 'campana@c3', 'campana@c4'],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: flex;\njustify-content: center;\nalign-items: flex-start;\ngap: 20px;',
        editable: false,
      },
      {
        selector: '.campana',
        fixed: 'transition: transform 0.4s ease-out;\ntransform-origin: 50% 0;',
        editable: false,
      },
      { selector: '.tablero.activo .campana', fixed: 'transform: rotate(25deg);', editable: false },
      { selector: '.c2', solution: 'transition-delay: 0.3s;' },
      { selector: '.c3', solution: 'transition-delay: 0.6s;' },
      { selector: '.c4', solution: 'transition-delay: 0.9s;' },
    ],
    farewell: '¡TAN, TAN, TAN, TAAAN! ¡Precioso! Aunque no oigo nada desde 1803.',
  },
  {
    id: 'c7-3',
    region: 7,
    title: 'Todo en una cuerda',
    maxDeclarations: 1,
    state: 'active',
    width: 420,
    height: 260,
    allowed: SKY_TRANSITION,
    concepts: ['shorthand'],
    speech:
      'Para tocar la campana grande solo hay UNA cuerda. Una. Así que todo, propiedad, duración, ritmo y espera, en un solo tirón.',
    theory:
      '<p>El atajo <code>transition</code> junta todo en este orden: <b>propiedad, duración, función de tiempo y retraso</b>. El primer tiempo es siempre la duración; el segundo, el retraso.</p><pre>transition: transform 0.8s ease-in-out 0.2s;</pre>',
    objective:
      'Al activar, las campanas bajan y giran con <code>transform</code> durante <b>0.8s</b>, con <code>ease-in-out</code>, tras <b>0.2s</b> de espera. Una sola declaración.',
    hint: '<code>transition: transform 0.8s ease-in-out 0.2s;</code>',
    pieces: ['campana', 'campana', 'campana'],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: flex;\njustify-content: space-around;',
        editable: false,
      },
      { selector: '.campana', solution: 'transition: transform 0.8s ease-in-out 0.2s;' },
      {
        selector: '.tablero.activo .campana',
        fixed: 'transform: translateY(150px) rotate(-20deg);',
        editable: false,
      },
    ],
  },
  {
    id: 'c7-4',
    region: 7,
    title: 'Dos cosas a la vez',
    state: 'active',
    width: 440,
    height: 240,
    compare: ['background-color'],
    allowed: SKY_TRANSITION,
    concepts: ['transition', 'varias'],
    speech:
      'Los gallardetes de fiesta crecen y se doran. Pero el dorado llega rapidito y el crecimiento, despacio, con pompa. ¿Se puede hacer eso? ¡CLARO QUE SE PUEDE!',
    theory:
      '<p>Puedes animar <b>varias propiedades</b> con tiempos distintos separándolas con comas:</p><pre>transition: transform 1s, background-color 0.3s;</pre>',
    objective:
      'Al activar, los gallardetes crecen (<code>transform</code>) en <b>1s</b> y se vuelven dorados (<code>background-color</code>) en <b>0.3s</b>.',
    hint: '<code>transition: transform 1s, background-color 0.3s;</code>',
    pieces: ['gallardete', 'gallardete', 'gallardete'],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: flex;\njustify-content: space-around;\nalign-items: center;',
        editable: false,
      },
      {
        selector: '.gallardete',
        fixed: 'background-color: lightsteelblue;',
        solution: 'transition: transform 1s, background-color 0.3s;',
      },
      {
        selector: '.tablero.activo .gallardete',
        fixed: 'transform: scale(1.4);\nbackground-color: gold;',
        editable: false,
      },
    ],
  },
  {
    id: 'c7-5',
    region: 7,
    title: 'Ida rápida, vuelta lenta',
    state: 'hover',
    width: 420,
    height: 240,
    allowed: SKY_TRANSITION.slice(0, 3),
    concepts: [':hover', 'transition'],
    speech:
      'Último toque. Cuando pasas por encima, los globos del campanario se hinchan de golpe, en tres décimas. Cuando te vas, se deshinchan despacito, en segundo y medio. ¡Como un suspiro!',
    theory:
      '<p>La transición que cuenta es la del estado <b>al que se va</b>. Si pones una en <code>:hover</code>, se usa al <b>entrar</b>; la de la regla normal, al <b>salir</b>.</p><pre>.globo { transition: transform 1.5s; }\n.globo:hover { transition: transform 0.3s; }</pre>',
    objective:
      'Al pasar el cursor, cada globo crece (ya está escrito) en <b>0.3s</b>; al quitarlo, vuelve en <b>1.5s</b>.',
    hint: '<code>transition: transform 1.5s;</code> en <code>.globo</code> y <code>transition: transform 0.3s;</code> en <code>.globo:hover</code>.',
    pieces: ['globo', 'globo', 'globo'],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: flex;\njustify-content: space-around;\nalign-items: center;',
        editable: false,
      },
      { selector: '.globo', solution: 'transition: transform 1.5s;' },
      {
        selector: '.globo:hover',
        fixed: 'transform: scale(1.5);',
        solution: 'transition: transform 0.3s;',
      },
    ],
  },
  {
    id: 'c7-6',
    region: 7,
    title: 'Sin mareos',
    views: [{ name: 'Con movimiento' }, { name: 'Movimiento reducido', reducedMotion: true }],
    state: 'active',
    width: 420,
    height: 280,
    allowed: ['prefers-reduced-motion', ...SKY_TRANSITION, 'and', 'not'],
    concepts: ['prefers-reduced-motion', 'transition'],
    speech:
      '¿EH? ¡AH! Mi prima Vértiga no puede ver las campanas balancearse: se marea y se cae del campanario. ¡Ella ya le ha dicho a su aparato que quiere menos movimiento! ¡Para ella, que cambien de golpe!',
    theory:
      '<p>Hay personas a las que el movimiento en pantalla les causa <b>mareo</b> o les impide concentrarse, y pueden pedir a su sistema que lo reduzca. <code>prefers-reduced-motion</code> te dice si lo han hecho:</p><pre>@media (prefers-reduced-motion: reduce) {\n  .campana { transition: none; }\n}</pre><p>Respetarlo no es un adorno: es <b>accesibilidad</b>. Toda animación que añadas debería tener su versión tranquila.</p>',
    objective:
      'Con movimiento, las campanas bajan en 1.5s, como están. Con movimiento reducido, cambian <b>de golpe</b>.',
    hint: 'Condición: <code>(prefers-reduced-motion: reduce)</code>. Dentro: <code>transition: none;</code>',
    pieces: ['campana', 'campana', 'campana'],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: flex;\njustify-content: space-around;',
        editable: false,
      },
      { selector: '.campana', fixed: 'transition: transform 1.5s ease-in-out;', editable: false },
      {
        selector: '.tablero.activo .campana',
        fixed: 'transform: translateY(150px) rotate(20deg);',
        editable: false,
      },
      {
        selector: '.campana',
        media: skyCondition('(prefers-reduced-motion: reduce)'),
        solution: 'transition: none;',
      },
    ],
    farewell:
      '¡Has aprendido a mover el cielo! Pero cuidado: ahí arriba, en el Ojo de la Tormenta, Vórtice lleva siglos deshaciendo lo que construimos. ¡Demuéstrale lo que sabes!',
  },
  //Region 8 · EL OJO DE LA TORMENTA (jefe final)
  {
    id: 'c8-1',
    region: 8,
    title: 'El muro de nubes',
    phase: 'Grid',
    exam: true,
    tokenSize: false,
    width: 440,
    height: 320,
    allowed: SKY_GRID_PROPS,
    speech:
      '¡JA! ¿Una aprendiz de runas en MI tormenta? Mi muro de nubes no lo levanta cualquiera. Construye la cuadrícula del plano… si puedes.',
    objective:
      'Rejilla de tres columnas <code>1fr 2fr 1fr</code> y tres filas <code>70px 1fr 60px</code> con 8px de hueco. La cima y la base ocupan la fila entera; en medio, ala, ojo y ala.',
    pieces: ['nubarron@cima', 'nubarron@izq', 'ojo', 'nubarron@der', 'nubarron@base'],
    rules: [
      {
        selector: '.tablero',
        solution:
          'display: grid;\ngrid-template-columns: 1fr 2fr 1fr;\ngrid-template-rows: 70px 1fr 60px;\ngap: 8px;',
      },
      { selector: '.cima', solution: 'grid-column: 1 / -1;' },
      { selector: '.base', solution: 'grid-column: 1 / -1;' },
    ],
  },
  {
    id: 'c8-2',
    region: 8,
    title: 'Los rayos',
    phase: 'Flexbox',
    exam: true,
    width: 460,
    height: 220,
    allowed: FLEX_ALL,
    speech:
      '¿Has roto mi muro? ¡Suerte! Mis rayos no obedecen a cuadrículas: se doblan, se estiran… ¡Ordénalos si te atreves!',
    objective:
      'Cinco rayos en fila, pegados abajo, con 12px de hueco. El grande se estira para llenar el espacio que sobra y queda centrado en vertical.',
    pieces: ['rayo', 'rayo', 'rayo@grande', 'rayo', 'rayo'],
    rules: [
      { selector: '.tablero', solution: 'display: flex;\nalign-items: flex-end;\ngap: 12px;' },
      { selector: '.grande', solution: 'flex-grow: 1;\nalign-self: center;' },
    ],
  },
  {
    id: 'c8-3',
    region: 8,
    title: 'El cielo que encoge',
    phase: 'Media queries',
    exam: true,
    tokenSize: false,
    widths: [320, 560],
    height: 280,
    allowed: [...SKY_GRID_PROPS, ...SKY_MEDIA],
    speech: '¡GRRR! ¡Encojo el cielo! ¡A ver qué haces cuando no te quepan mis nubarrones!',
    objective:
      'Rejilla de filas de 90px con 10px de hueco: cuatro columnas iguales en el tablero ancho (560px) y dos en el estrecho (320px).',
    pieces: ['nubarron', 'nubarron', 'nubarron', 'nubarron'],
    rules: [
      {
        selector: '.tablero',
        solution:
          'display: grid;\ngrid-template-columns: repeat(4, 1fr);\ngrid-auto-rows: 90px;\ngap: 10px;',
      },
      {
        selector: '.tablero',
        media: skyCondition('(max-width: 400px)'),
        solution: 'grid-template-columns: repeat(2, 1fr);',
      },
    ],
  },
  {
    id: 'c8-4',
    region: 8,
    title: 'Los colores de la tormenta',
    phase: 'Variables',
    exam: true,
    width: 460,
    height: 220,
    compare: ['background-color'],
    allowed: ['--hueco', '--lado', '--color'],
    speech:
      '¡Basta! Mis nubarrones beben de nombres secretos. Sin ellos no tienen forma ni color… y tú no los conoces. ¿O sí?',
    objective:
      'Fila centrada con 14px de hueco. Nubarrones de 64px de color <code>slategray</code>; el ojo, de 110px y color <code>gold</code>.',
    pieces: ['nubarron', 'nubarron', 'ojo', 'nubarron', 'nubarron'],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: flex;\njustify-content: center;\nalign-items: center;\ngap: var(--hueco);',
        solution: '--hueco: 14px;\n--lado: 64px;\n--color: slategray;',
      },
      {
        selector: '.pieza',
        fixed: 'width: var(--lado);\nheight: var(--lado);\nbackground-color: var(--color);',
        editable: false,
      },
      { selector: '.ojo', solution: '--lado: 110px;\n--color: gold;' },
    ],
  },
  {
    id: 'c8-5',
    region: 8,
    title: 'El golpe final',
    phase: 'Transiciones',
    exam: true,
    state: 'active',
    width: 460,
    height: 260,
    compare: ['opacity'],
    allowed: ['--caida', ...SKY_TRANSITION],
    speech:
      '¡NO! ¡Mis escudos! ¡Mi ojo! ¡Si caen a destiempo no podrás… no podrás…! ¡Mi tormenta es ETERNA!',
    objective:
      'Al activar, los escudos caen <code>--caida</code> = <b>90px</b> y se apagan: <code>transform</code> en 0.8s con <code>ease-in</code> y <code>opacity</code> en 0.8s. Después, el ojo se encoge con <code>transform</code> en 1.2s, <code>ease-in-out</code>, esperando <b>0.8s</b>.',
    pieces: ['escudo', 'escudo', 'ojo', 'escudo', 'escudo'],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: flex;\njustify-content: center;\nalign-items: center;\ngap: 14px;',
        solution: '--caida: 90px;',
      },
      { selector: '.escudo', solution: 'transition: transform 0.8s ease-in, opacity 0.8s;' },
      { selector: '.ojo', solution: 'transition: transform 1.2s ease-in-out 0.8s;' },
      {
        selector: '.tablero.activo .escudo',
        fixed: 'transform: translateY(var(--caida));\nopacity: 0.2;',
        editable: false,
      },
      {
        selector: '.tablero.activo .ojo',
        fixed: 'transform: scale(0.3) rotate(180deg);',
        editable: false,
      },
    ],
  },
  // ─────────────────────────────── secretos del cielo
  {
    id: 'cS-1',
    region: 9,
    title: 'El barco de los vientos',
    terrain: 'muelle',
    state: 'active',
    width: 360,
    height: 300,
    allowed: SKY_TRANSITION,
    concepts: ['steps()'],
    character: 'Ráfaga',
    role: 'la capitana pirata del aire',
    portrait: 'pj-cs1',
    secret: {
      x: 0.83,
      y: 0.79,
      width: 0.12,
      drawing: 'aeronave',
      hint: 'Abajo a la derecha, sobre el mar de nubes, navega un barco con velas que no es de ningún muelle…',
    },
    speech:
      '¡Arr! Has encontrado mi barco. Mi ancla no baja como las de los cobardes de tierra: baja a TIRONES, cadena a cadena. Cuatro tirones en dos segundos, grumete.',
    theory:
      '<p>La función <code>steps(n)</code> no reparte el cambio de forma continua: lo hace en <b>n saltos</b>, como las agujas de un reloj o los fotogramas de un dibujo animado.</p><pre>transition: transform 2s steps(4);</pre>',
    objective: 'Al activar, el ancla baja 200px en <b>2s</b>, en <b>4 saltos</b>.',
    hint: '<code>transition: transform 2s steps(4);</code>',
    pieces: ['ancla'],
    rules: [
      { selector: '.tablero', fixed: 'display: flex;\njustify-content: center;', editable: false },
      { selector: '.ancla', solution: 'transition: transform 2s steps(4);' },
      {
        selector: '.tablero.activo .ancla',
        fixed: 'transform: translateY(200px);',
        editable: false,
      },
    ],
    farewell:
      '¡A eso lo llamo yo echar el ancla! Si alguna vez quieres surcar los cielos sin pagar peaje… búscame.',
  },
  {
    id: 'cS-2',
    region: 9,
    title: 'La isla del revés',
    terrain: 'viento',
    widths: [340, 500, 660],
    height: 260,
    allowed: ['width', '<', '<=', '>=', 'and'],
    concepts: ['rango'],
    character: 'Volteo',
    role: 'el acróbata del revés',
    portrait: 'pj-cs2',
    secret: {
      x: 0.72,
      y: 0.64,
      width: 0.09,
      drawing: 'reves',
      hint: 'Al este del gran continente flota una isla con las raíces hacia arriba…',
    },
    speech:
      '¡Odlas! Digo… ¡saludo! En mi isla todo va del revés, pero con orden: en lo estrecho, columna al revés; en lo mediano, fila al revés; y en lo ancho, por fin del derecho, repartida. Las órdenes ya están. Faltan los cuándos.',
    theory:
      '<p>En la sintaxis de rango también existen <code>&lt;</code> y <code>&gt;</code> <b>estrictos</b>: <code>(width &lt; 400px)</code> no incluye el 400. Así los rangos encajan sin pisarse.</p>',
    objective:
      '340px: <code>column-reverse</code>. 500px: <code>row-reverse</code>. 660px: fila normal repartida. Tú escribes las tres condiciones.',
    hint: '<code>(width &lt; 400px)</code>, <code>(400px &lt;= width &lt; 600px)</code> y <code>(width &gt;= 600px)</code>.',
    pieces: ['isleta@uno', 'isleta@dos', 'isleta@tres'],
    rules: [
      { selector: '.tablero', fixed: SKY_ROW, editable: false },
      {
        selector: '.tablero',
        media: skyCondition('(width < 400px)'),
        fixed: 'flex-direction: column-reverse;',
        editable: false,
      },
      {
        selector: '.tablero',
        media: skyCondition('(400px <= width < 600px)'),
        fixed: 'flex-direction: row-reverse;',
        editable: false,
      },
      {
        selector: '.tablero',
        media: skyCondition('(width >= 600px)'),
        fixed: 'justify-content: space-between;',
        editable: false,
      },
    ],
    farewell: '¡Oclé! ¡Olé! Vuelve cuando quieras… o cuando no quieras, que aquí es lo mismo.',
  },
  {
    id: 'cS-3',
    region: 9,
    title: 'El nido del fénix',
    terrain: 'nido',
    state: 'active',
    width: 360,
    height: 320,
    allowed: ['--altura', ...SKY_TRANSITION],
    concepts: ['cubic-bezier()'],
    character: 'Pira',
    role: 'el fénix que renace',
    portrait: 'pj-cs3',
    secret: {
      x: 0.13,
      y: 0.24,
      width: 0.09,
      drawing: 'fenix',
      hint: 'Lejos, al noroeste, una roca solitaria brilla como una brasa…',
    },
    speech:
      'Cada mil años renazco y subo al cielo. Pero no subo como un globo cualquiera: me paso un poco de altura y vuelvo, como una llama que chisporrotea. Ciento ochenta de altura.',
    theory:
      '<p>Con <code>cubic-bezier()</code> inventas tu propia curva de tiempo. Si un valor vertical pasa de 1, la animación <b>se pasa de largo</b> y vuelve, como un rebote.</p><pre>cubic-bezier(0.3, 1.6, 0.5, 1)</pre>',
    objective:
      '<code>--altura</code> de 180px y, al activar, el fénix sube con <code>transform</code> en <b>1.4s</b> con la curva <code>cubic-bezier(0.3, 1.6, 0.5, 1)</code>.',
    hint: '<code>--altura: 180px;</code> y <code>transition: transform 1.4s cubic-bezier(0.3, 1.6, 0.5, 1);</code>',
    pieces: ['fenix'],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: flex;\njustify-content: center;\nalign-items: flex-end;',
        solution: '--altura: 180px;',
      },
      {
        selector: '.fenix',
        solution: 'transition: transform 1.4s cubic-bezier(0.3, 1.6, 0.5, 1);',
      },
      {
        selector: '.tablero.activo .fenix',
        fixed: 'transform: translateY(calc(var(--altura) * -1)) scale(1.3);',
        editable: false,
      },
    ],
    farewell: 'Mientras haya alguien que sepa hacer arder el cielo… yo seguiré volviendo.',
  },
];

/** Map index filters. */
const filters: readonly FilterGroup[] = [
  [
    'Tipo de ejercicio',
    ['prueba de aprendizaje', 'secreto', 'contra reloj', 'a oscuras', 'regateo', 'musical'],
  ],
  [
    'Diseño que se adapta',
    [
      'flex-direction',
      'justify-content',
      'align-items',
      'order',
      'display',
      'grid-template-columns',
      'grid-template-areas',
      'grid-template-rows',
    ],
  ],
  ['Tamaños', ['width', 'height', 'gap', 'padding']],
  [
    'Transiciones',
    [
      'transition',
      'transition-property',
      'transition-duration',
      'transition-timing-function',
      'transition-delay',
      'transform',
      'opacity',
      'box-shadow',
    ],
  ],
  [
    'Conceptos',
    [
      '@media',
      'max-width',
      'min-width',
      'and',
      'or',
      'not',
      'rango',
      'mobile first',
      'min-height',
      'orientation',
      'aspect-ratio',
      'screen',
      'print',
      'hover',
      'pointer',
      'custom properties',
      'var()',
      ':root',
      'herencia',
      'fallback',
      'colores',
      'prefers-color-scheme',
      'calc()',
      'anidación',
      ':hover',
      ':active',
      ':focus',
      'timing-function',
      'transition-delay',
      'varias',
      'shorthand',
      'rendimiento',
      'prefers-reduced-motion',
      'steps()',
      'cubic-bezier()',
    ],
  ],
];

export const skyWorld: WorldContent = {
  id: 'sky',
  name: 'Los Cielos Cambiantes',
  mapTitle: 'Mapa de los cielos',
  topic: 'Media queries, variables y transiciones',
  card: { tech: 'Media queries · variables · transiciones', className: 'is-sky' },
  regions: skyRegions,
  pieceTypes: skyPieceTypes,
  filters,
  lessons: skyLevels,
};
