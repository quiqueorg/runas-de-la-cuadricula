/** Underground adventure: Flexbox regions, piece types and levels. */
import type {
  BoardRuleDraft,
  FilterGroup,
  LevelDraft,
  Misstep,
  PieceTypeMap,
  RegionDraft,
  WorldContent,
} from '../models';

// ═══════════════════════════════════════════════════════════════
//  THE FLEXIBLE UNDERGROUND · Flexbox levels
//  Regions use a local index (0–9); the catalog places them after the surface.
// ═══════════════════════════════════════════════════════════════
const flexRegions: readonly RegionDraft[] = [
  {
    name: 'La Boca de la Mina',
    subtitle: 'El contenedor flex',
    x: 0.18,
    y: 0.2,
    terrain: 'mina',
    character: 'Brunna',
    role: 'la capataz enana',
  },
  {
    name: 'Bosque de Setas',
    subtitle: 'Repartir por el eje principal',
    x: 0.4,
    y: 0.15,
    terrain: 'hongos',
    character: 'Mohín',
    role: 'el anciano fúngido',
  },
  {
    name: 'El Lago Negro',
    subtitle: 'Alinear en el eje cruzado',
    x: 0.68,
    y: 0.19,
    terrain: 'lagosub',
    character: 'Pindra',
    role: 'la barquera gnoma',
  },
  {
    name: 'Grietas de Cristal',
    subtitle: 'Saltos de línea',
    x: 0.85,
    y: 0.44,
    terrain: 'cristal',
    character: 'Cuarzo',
    role: 'el gólem de cristal',
  },
  {
    name: 'La Forja Enana',
    subtitle: 'Crecer y encoger',
    x: 0.75,
    y: 0.76,
    terrain: 'forja',
    character: 'Durgan',
    role: 'el maestro herrero',
  },
  {
    name: 'El Abismo',
    subtitle: 'Orden y excepciones',
    x: 0.5,
    y: 0.85,
    terrain: 'abismo',
    character: 'Kib',
    role: 'el kobold puentero',
  },
  {
    name: "Ciudad Drow de Vel'Zhar",
    subtitle: 'Anidar y componer',
    x: 0.24,
    y: 0.78,
    terrain: 'drow',
    character: 'Nyx',
    role: 'la exploradora renegada',
  },
  {
    name: 'Catacumbas de los Reyes',
    subtitle: 'Maestría',
    x: 0.13,
    y: 0.5,
    terrain: 'templo',
    character: 'Bramdur',
    role: 'el rey enano fantasma',
  },
  {
    name: 'La Gran Bóveda',
    subtitle: 'Prueba de aprendizaje',
    x: 0.47,
    y: 0.48,
    terrain: 'boveda',
    character: 'Custodia',
    role: 'la guardiana de piedra',
    exam: true,
  },
  { name: 'Lugares secretos', subtitle: 'Escondidos en la roca', terrain: 'boveda', secret: true },
];

const flexPieceTypes: PieceTypeMap = {
  vagoneta: { token: 'vagoneta' },
  pico: { token: 'pico' },
  antorcha: { token: 'antorcha' },
  gema: { token: 'gema' },
  fungido: { token: 'fungido' },
  junco: { material: 'musgo' },
  yunque: { token: 'yunque' },
  martillo: { token: 'martillo' },
  viga: { material: 'hierro' },
  lingote: { material: 'oro' },
  molde: { material: 'hierro' },
  escudo: { token: 'escudo' },
  trapo: { material: 'lona' },
  banco: { material: 'tablones' },
  barril: { token: 'barril' },
  placa: { material: 'hierro' },
  tabla: { material: 'tablones' },
  murcielago: { token: 'murcielago' },
  poste: { material: 'roca' },
  tambor: { token: 'tambor' },
  cuerda: { token: 'cuerda' },
  torre: { material: 'obsidiana' },
  luz: { token: 'orbe' },
  centinela: { token: 'orbe' },
  ala: { material: 'obsidiana' },
  salon: { material: 'seda', icon: 'corona' },
  pocion: { token: 'pocion' },
  mansion: { material: 'obsidiana' },
  arana: { token: 'arana' },
  orbe: { token: 'orbe' },
  idolo: { material: 'obsidiana', icon: 'arana' },
  corona: { token: 'corona' },
  escalon: { material: 'obsidiana' },
  reina: { material: 'seda', icon: 'arana' },
  estandarte: { token: 'bandera' },
  lapida: { material: 'sillares', icon: 'runa' },
  busto: { material: 'sillares', icon: 'corona' },
  sarcofago: { material: 'marmol', icon: 'corona' },
  cirio: { token: 'cirio' },
  guardia: { token: 'escudo' },
  mesa: { material: 'tablones', icon: 'libro' },
  arcon: { material: 'obsidiana', icon: 'cofre' },
  engranaje: { token: 'engranaje' },
  segmento: { material: 'escamas' },
  testa: { material: 'escamas', icon: 'serpiente' },
};

export const boardRule = (css: string): BoardRuleDraft => ({
  selector: '.tablero',
  fixed: css,
  editable: false,
});
export const FLEX_ALL = [
  'display',
  'flex-direction',
  'flex-wrap',
  'flex-flow',
  'justify-content',
  'align-items',
  'align-content',
  'align-self',
  'gap',
  'row-gap',
  'column-gap',
  'order',
  'flex',
  'flex-grow',
  'flex-shrink',
  'flex-basis',
  'margin',
  'margin-left',
  'margin-right',
  'margin-top',
  'margin-bottom',
];
export const MARGIN_PROPS = [
  'margin',
  'margin-left',
  'margin-right',
  'margin-top',
  'margin-bottom',
];
export const repeatItem = (item: string, count: number): string[] =>
  Array.from({ length: count }, () => item);
const NOT_FLEX: Misstep = {
  when: { display: 'block' },
  message: 'El tablero aún no es flex: hasta que lo sea, las demás runas no tienen efecto.',
};

// Checkpoints (f0-7, f1-8, f2-7, f6-6, f7-5) start from an empty tablet. Closers rehearse the same questions, one more per region:
// is it flex? · where does the main axis point? · free space along it? · across it? · one line or several? · gaps? · any item on its own?
const flexLevels: readonly LevelDraft[] = [
  //Region 0 · LA BOCA DE LA MINA
  {
    id: 'f0-1',
    region: 0,
    title: 'Vagonetas en fila',
    allowed: ['display'],
    concepts: ['eje principal'],
    width: 460,
    height: 300,
    speech:
      '¡Bienvenida al subsuelo, superficial! Aquí abajo nada va en cuadrícula: todo se dobla, se estira y se encoge como el buen hierro. Lo primero: pon las vagonetas en fila.',
    note: 'Escribe en la tablilla rúnica: el tablero cambia al instante. Las huellas turquesa marcan dónde debe acabar cada pieza, y con «Ver ejes» verás hacia dónde apunta cada eje.',
    theory:
      '<p>Con <code>display: flex</code>, <code>.tablero</code> pasa a ser un <b>contenedor flex</b> y coloca a sus hijos <b>en fila</b>, uno detrás de otro, a lo largo del <b>eje principal</b>. Por defecto, ese eje va de izquierda a derecha.</p><pre>display: flex;</pre><p>Es siempre la primera runa: sin ella, ninguna otra runa flexible tiene efecto.</p>',
    objective: 'Las cuatro vagonetas, en una sola fila de izquierda a derecha.',
    hint: '<code>display: flex;</code> en el tablero.',
    pieces: repeatItem('vagoneta', 4),
    rules: [{ selector: '.tablero', solution: 'display: flex;' }],
    farewell: '¡Así se empieza! En el subsuelo, quien no se alinea, se queda en la superficie.',
  },
  {
    id: 'f0-2',
    region: 0,
    title: 'El pozo vertical',
    allowed: ['flex-direction'],
    concepts: ['eje principal'],
    width: 300,
    height: 300,
    speech:
      'Este pozo baja en vertical. Lo que bajemos por él va uno encima de otro, no de lado. ¡Y sin empujar!',
    theory:
      '<p><code>flex-direction</code> elige hacia dónde apunta el <b>eje principal</b>: <code>row</code> (fila, el valor por defecto) o <code>column</code> (columna, de arriba abajo).</p><pre>flex-direction: column;</pre><p>Mira la flecha del eje principal junto al tablero: gira cuando cambias la dirección. Casi todas las runas flexibles trabajan a lo largo o a lo ancho de esa flecha.</p>',
    objective: 'Antorcha, pico y gema, en columna de arriba abajo.',
    hint: '<code>flex-direction: column;</code>',
    pieces: ['antorcha', 'pico', 'gema'],
    rules: [{ selector: '.tablero', fixed: 'display: flex;', solution: 'flex-direction: column;' }],
  },
  {
    id: 'f0-3',
    region: 0,
    title: 'Marcha atrás',
    allowed: ['flex-direction'],
    concepts: ['reverse'],
    width: 420,
    height: 180,
    speech:
      'La vía está cortada por la izquierda. El convoy tiene que salir marcha atrás: empezando por la derecha y con el orden dado la vuelta.',
    theory:
      '<p>Cada dirección tiene su versión al revés: <code>row-reverse</code> y <code>column-reverse</code>. El eje principal cambia de sentido: los elementos <b>empiezan por el final</b> y su orden se invierte.</p>',
    objective:
      'Las piezas, pegadas a la derecha y en orden inverso: el pico, el último por la derecha.',
    earlyHints: [
      'Con «Ver ejes» activado, mira la flecha del eje principal: ahora nace en la izquierda, y el convoy tiene que arrancar desde el otro extremo.',
    ],
    hint: '<code>flex-direction: row-reverse;</code>',
    pieces: ['pico', 'antorcha', 'gema', 'cofre'],
    rules: [
      { selector: '.tablero', fixed: 'display: flex;', solution: 'flex-direction: row-reverse;' },
    ],
  },
  {
    id: 'f0-4',
    region: 0,
    title: 'Subiendo del pozo',
    allowed: ['flex-direction'],
    concepts: ['reverse'],
    width: 300,
    height: 320,
    speech:
      'Ahora al revés: lo que sale del fondo del pozo sube apilado desde abajo. Primero el cofre, que pesa más.',
    theory:
      '<p><code>column-reverse</code> hace en vertical lo que <code>row-reverse</code> hacía en horizontal: apila desde <b>abajo</b>. El primer hijo queda en el fondo y los siguientes, encima.</p>',
    objective: 'Columna que empieza abajo: el cofre en el fondo, la gema arriba del todo.',
    earlyHints: [
      '¿En qué dirección va la pila y por qué extremo empieza? Necesitas la versión «al revés» de <code>column</code>.',
    ],
    hint: '<code>flex-direction: column-reverse;</code>',
    pieces: ['cofre', 'moneda', 'gema'],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: flex;',
        solution: 'flex-direction: column-reverse;',
      },
    ],
  },
  {
    id: 'f0-5',
    region: 0,
    title: 'Hueco entre raíles',
    allowed: ['gap', 'column-gap', 'row-gap'],
    concepts: [],
    width: 460,
    height: 180,
    speech:
      'Las vagonetas chocan entre sí. Déjales 24 palmos de hueco… digo, píxeles. Entre ellas, no en los bordes.',
    theory:
      '<p><code>gap</code> deja hueco <b>entre</b> elementos, nunca en los bordes del contenedor. Se escribe una sola vez, en el contenedor, y no en cada pieza. En una fila cuenta el hueco entre columnas (<code>column-gap</code>); <code>gap</code> fija los dos de una vez.</p><pre>gap: 24px;</pre>',
    objective: 'Cuatro vagonetas en fila con 24px de hueco entre cada una.',
    hint: '<code>gap: 24px;</code>',
    pieces: repeatItem('vagoneta', 4),
    rules: [{ selector: '.tablero', fixed: 'display: flex;', solution: 'gap: 24px;' }],
  },
  {
    id: 'f0-6',
    region: 0,
    title: 'La galería en columna',
    allowed: ['flex-direction', 'gap', 'row-gap', 'column-gap'],
    concepts: ['eje principal'],
    width: 300,
    height: 340,
    speech:
      'En la galería vertical también hay que dejar aire. Columna, y 16 píxeles entre pieza y pieza.',
    theory:
      '<p>En columna, el hueco que cuenta es el de <b>entre filas</b> (<code>row-gap</code>). <code>gap</code> sigue funcionando igual: siempre separa en la dirección que toque.</p>',
    objective: 'Antorcha, vagoneta y pico en columna, con 16px de hueco entre cada uno.',
    earlyHints: [
      'Son dos runas, las dos en <code>.tablero</code>: una decide la dirección y la otra, el hueco.',
    ],
    hint: '<code>flex-direction: column;</code> y <code>gap: 16px;</code>',
    pieces: ['antorcha', 'vagoneta', 'pico'],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: flex;',
        solution: 'flex-direction: column;\ngap: 16px;',
      },
    ],
  },
  {
    id: 'f0-7',
    region: 0,
    title: 'A oscuras',
    variant: 'a oscuras',
    mirage: true,
    className: 'oscuras',
    allowed: ['display', 'flex-direction', 'gap', 'column-gap'],
    concepts: ['reverse'],
    width: 420,
    height: 300,
    speech:
      '¡Se ha apagado el candil! Te lo dicto de memoria, que los enanos vemos en la oscuridad y tú no: fila al revés, empezando por la derecha con la antorcha, y 16 píxeles entre pieza y pieza. Y esta vez el tablero lo despiertas tú.',
    theory:
      '<p><b>A oscuras:</b> la huella del objetivo solo se ve a ratos, y la tablilla empieza vacía. Hazte las tres preguntas de la capataz, siempre en este orden:</p><ol><li><b>¿El tablero es flex?</b> Sin <code>display: flex</code>, las demás runas no hacen nada.</li><li><b>¿Hacia dónde va el eje principal?</b> Lo decide <code>flex-direction</code>: en este tablero, <code>row</code> empieza a la izquierda y <code>row-reverse</code>, a la derecha. La antorcha sigue siendo la primera pieza.</li><li><b>¿Qué hueco hay entre piezas?</b> <code>gap</code> las separa sin abrir hueco junto a la pared.</li></ol>',
    objective:
      'Fila de <b>derecha a izquierda</b>: la antorcha pegada al borde derecho, después gema, pico y cofre. <b>16px</b> entre cada pieza.',
    earlyHints: [
      'Responde a las preguntas una a una y mira el tablero después de cada runa: primero, que sea flex; luego, la dirección; al final, el hueco.',
    ],
    hint: '<code>display: flex;</code> · <code>flex-direction: row-reverse;</code> · <code>gap: 16px;</code>',
    pieces: ['antorcha', 'gema', 'pico', 'cofre'],
    rules: [
      {
        selector: '.tablero',
        solution: 'display: flex;\nflex-direction: row-reverse;\ngap: 16px;',
      },
    ],
    missteps: [NOT_FLEX],
    farewell:
      '¡Ni un tropiezo! Toma, una mecha de repuesto. Ahí abajo, en el bosque de setas, la vas a necesitar menos: brillan solas.',
  },
  //Region 1 · BOSQUE DE SETAS
  {
    id: 'f1-1',
    region: 1,
    title: 'Setas al fondo',
    allowed: ['justify-content'],
    concepts: ['espacio libre'],
    width: 480,
    height: 180,
    speech:
      'Sssss… las setasss jóvenes quieren crecer al fondo del claro, donde gotea el agua. Llévalasss a la derecha, sin prisa.',
    theory:
      '<p><code>justify-content</code> decide dónde queda el <b>espacio libre</b> a lo largo del <b>eje principal</b>. Por defecto vale <code>flex-start</code>: las piezas se juntan al inicio del eje y el espacio sobra al final. Con <code>flex-end</code> es al revés.</p><pre>justify-content: flex-end;</pre><p>No es lo mismo que <code>row-reverse</code>: aquí el orden de las setas no cambia; solo se mueve el grupo.</p>',
    objective: 'Las cuatro setas, juntas y pegadas a la derecha.',
    hint: '<code>justify-content: flex-end;</code>',
    pieces: repeatItem('seta', 4),
    rules: [
      { selector: '.tablero', fixed: 'display: flex;', solution: 'justify-content: flex-end;' },
    ],
  },
  {
    id: 'f1-2',
    region: 1,
    title: 'El corro',
    allowed: ['justify-content'],
    concepts: [],
    width: 480,
    height: 180,
    speech:
      'Las setasss mayores se reúnen en corro, en mitad del claro. Ni a un lado ni al otro: en el centro.',
    theory:
      '<p><code>justify-content: center</code> junta los elementos en el <b>centro</b> del eje principal y deja el mismo espacio libre a cada lado.</p>',
    objective: 'Tres setas juntas en el centro de la fila.',
    hint: '<code>justify-content: center;</code>',
    pieces: repeatItem('seta', 3),
    rules: [
      { selector: '.tablero', fixed: 'display: flex;', solution: 'justify-content: center;' },
    ],
  },
  {
    id: 'f1-3',
    region: 1,
    title: 'De pared a pared',
    allowed: ['justify-content'],
    concepts: ['espacio libre'],
    width: 480,
    height: 180,
    speech:
      'Que la primera seta toque la pared izquierda, la última la derecha, y las demásss se repartan el sitio entre medias.',
    theory:
      '<p>Con <code>justify-content: space-between</code>, todo el espacio libre de la fila se reparte <b>entre</b> las setas. La primera toca la pared izquierda y la última, la derecha: no queda hueco en los extremos.</p>',
    objective:
      'Cuatro setas: la primera y la última en los extremos, las del medio a la misma distancia.',
    earlyHints: [
      '¿Dónde debe quedar el espacio libre: junto a las paredes o solo entre las setas?',
    ],
    hint: '<code>justify-content: space-between;</code>',
    pieces: repeatItem('seta', 4),
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: flex;',
        solution: 'justify-content: space-between;',
      },
    ],
    missteps: [
      {
        when: { 'justify-content': 'space-around' },
        message:
          'Ha quedado hueco junto a las paredes. Aquí la primera y la última seta tocan la pared: el espacio libre va solo entre ellas.',
      },
      {
        when: { 'justify-content': 'space-evenly' },
        message:
          'Ha quedado hueco junto a las paredes. Aquí la primera y la última seta tocan la pared: el espacio libre va solo entre ellas.',
      },
    ],
  },
  {
    id: 'f1-4',
    region: 1,
    title: 'Cada una con su aire',
    allowed: ['justify-content'],
    concepts: ['espacio libre'],
    width: 480,
    height: 180,
    speech:
      'A cada seta le gusta tener el mismo aire a cada lado. Ssssí, también a las de las orillas.',
    theory:
      '<p>Con <code>justify-content: space-around</code>, cada seta recibe la misma porción de espacio libre a cada lado. Si junto a la pared quedan 10px, entre dos setas quedan 20px: allí se juntan dos porciones. No necesitas añadir márgenes.</p>',
    objective:
      'Cuatro setas, cada una con el mismo espacio a izquierda y derecha (en los bordes, la mitad que entre ellas).',
    earlyHints: [
      'Mira las orillas del objetivo: ¿el hueco junto a la pared mide lo mismo que el que hay entre dos setas, o la mitad?',
    ],
    hint: '<code>justify-content: space-around;</code>',
    pieces: repeatItem('seta', 4),
    rules: [
      { selector: '.tablero', fixed: 'display: flex;', solution: 'justify-content: space-around;' },
    ],
    missteps: [
      {
        when: { 'justify-content': 'space-between' },
        message:
          'Las setas de las orillas tocan la pared. Aquí cada seta quiere aire a los dos lados, también junto a la pared.',
      },
      {
        when: { 'justify-content': 'space-evenly' },
        message:
          'Ahora todos los huecos miden lo mismo. El objetivo deja junto a la pared la mitad que entre dos setas.',
      },
    ],
  },
  {
    id: 'f1-5',
    region: 1,
    title: 'Todos los huecos iguales',
    allowed: ['justify-content'],
    concepts: ['espacio libre'],
    width: 480,
    height: 180,
    speech:
      'Las esporasss son muy justas: quieren que todos los huecos midan lo mismo, los de las orillas también.',
    theory:
      '<p><code>justify-content</code> reparte el espacio libre a lo largo del eje principal. Con el valor <code>space-evenly</code>, cada hueco recibe la misma porción. En esta fila hay cuatro setas y <b>cinco huecos</b>: tres entre setas y dos junto a las paredes.</p><p>Compara con <code>space-around</code>: allí el hueco del borde era la mitad de uno interior; aquí miden lo mismo.</p>',
    objective: 'Cuatro setas con todos los huecos idénticos, incluidos los de los bordes.',
    practice: 'column-gaps',
    earlyHints: [
      'Compara la distancia de la pared a la primera seta con la distancia de esa seta a la siguiente. ¿Son iguales?',
      'Escribe la propiedad en <code>.tablero</code>, no en cada seta: es el contenedor el que reparte el espacio libre de la fila.',
    ],
    hint: '<code>justify-content: space-evenly;</code>',
    pieces: repeatItem('seta', 4),
    rules: [
      { selector: '.tablero', fixed: 'display: flex;', solution: 'justify-content: space-evenly;' },
    ],
    missteps: [
      {
        when: { 'justify-content': 'space-around' },
        message:
          'Mira los bordes: entre dos setas queda el doble de espacio que junto a la pared. El objetivo pide cinco huecos iguales.',
      },
      {
        when: { 'justify-content': 'space-between' },
        message:
          'Las setas de las orillas tocan la pared. El objetivo pide cinco huecos iguales, también junto a las paredes.',
      },
    ],
  },
  {
    id: 'f1-6',
    region: 1,
    title: 'Setas trepadoras',
    allowed: ['justify-content'],
    concepts: ['eje principal'],
    width: 260,
    height: 380,
    speech:
      'Estas setas crecen por la pared, en vertical. Una arriba, otra abajo y la tercera en medio. Piensa hacia dónde va el eje, joven.',
    theory:
      '<p><code>justify-content</code> siempre trabaja sobre el <b>eje principal</b>. Si la dirección es <code>column</code>, ese eje es vertical, así que reparte de arriba abajo.</p>',
    objective:
      'Tres setas en columna: la primera arriba del todo, la última abajo del todo y la otra en medio.',
    earlyHints: [
      'Activa «Ver ejes»: ¿hacia dónde apunta el eje principal en este tablero? <code>justify-content</code> reparte siempre a lo largo de esa flecha.',
      'Es el mismo reparto que en «De pared a pared»: la primera pieza en un extremo del eje y la última, en el otro.',
    ],
    hint: '<code>justify-content: space-between;</code>',
    pieces: repeatItem('seta', 3),
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: flex;\nflex-direction: column;',
        solution: 'justify-content: space-between;',
      },
    ],
  },
  {
    id: 'f1-7',
    region: 1,
    title: 'El anciano se aparta',
    allowed: ['margin-left', 'margin', 'margin-right'],
    concepts: ['margin auto'],
    width: 480,
    height: 180,
    speech:
      'Yo prefiero estar a mi aire, al otro lado del claro. Las jóvenes que se queden juntas a la izquierda, y yo, sssolo, a la derecha.',
    theory:
      '<p>Hasta ahora mandabas en el contenedor. Esta runa va en <b>un hijo</b>: un margen <code>auto</code> en un elemento flex se queda con <b>todo el espacio libre</b> de ese lado. Con <code>margin-left: auto</code>, el elemento (y los que vengan detrás) se van al extremo opuesto.</p><pre>.anciano { margin-left: auto; }</pre><p>Así se aparta, por ejemplo, el botón de salir del resto de un menú.</p>',
    objective: 'Tres setas juntas a la izquierda; el anciano, solo y pegado a la derecha.',
    hint: '<code>margin-left: auto;</code> en el anciano.',
    pieces: ['seta', 'seta', 'seta', 'fungido@anciano'],
    rules: [
      boardRule('display: flex;\ngap: 10px;'),
      { selector: '.anciano', solution: 'margin-left: auto;' },
    ],
  },
  {
    id: 'f1-8',
    region: 1,
    title: 'Antes de que te duerman',
    variant: 'contra reloj',
    timeLimit: 60,
    className: 'esporas',
    allowed: ['display', 'flex-direction', 'justify-content', 'gap', 'row-gap'],
    concepts: [],
    width: 300,
    height: 360,
    timeMessages: {
      expired:
        'Las esporas te han dormido. <button type="button" class="text-link" id="p-sacudir">Sacúdete las esporas</button> e inténtalo antes de que vuelvan a caer.',
      late: 'Superado, aunque las esporas te durmieron un rato. Repítelo a tiempo y sin pistas para dominarlo.',
    },
    speech:
      '¡Atchísss! Las esporas de la tarde ya caen. Rápido: columna, todo en el centro y diez píxeles entre seta y seta, antes de que te quedes dormida. Y el claro está sssin despertar: empieza por ahí.',
    theory:
      '<p><b>Contra reloj:</b> las esporas empiezan a caer en cuanto escribes, así que piensa antes. La tablilla está vacía: son las preguntas de la capataz, con una más.</p><ol><li><b>¿El tablero es flex?</b> <code>display</code></li><li><b>¿Hacia dónde va el eje principal?</b> <code>flex-direction</code></li><li><b>¿Dónde queda el espacio libre de ese eje?</b> <code>justify-content</code> reparte a lo largo de la flecha: en columna, de arriba abajo.</li><li><b>¿Qué hueco hay entre piezas?</b> <code>gap</code></li></ol>',
    objective:
      'Cuatro piezas en columna, juntas en el centro vertical del tablero, con 10px entre cada una.',
    earlyHints: [
      'Una runa por pregunta, las cuatro en <code>.tablero</code>. En columna, el «centro» que te piden está a lo largo del eje principal.',
    ],
    hint: '<code>display: flex;</code> · <code>flex-direction: column;</code> · <code>justify-content: center;</code> · <code>gap: 10px;</code>',
    pieces: ['seta', 'fungido', 'seta', 'seta'],
    rules: [
      {
        selector: '.tablero',
        solution: 'display: flex;\nflex-direction: column;\njustify-content: center;\ngap: 10px;',
      },
    ],
    missteps: [NOT_FLEX],
    farewell:
      'Bosstezo… muy bien. Llévate esta seta luminosa: alumbra más que una antorcha y no se apaga.',
  },
  //Region 2 · EL LAGO NEGRO
  {
    id: 'f2-1',
    region: 2,
    title: 'Boyas a media agua',
    allowed: ['align-items'],
    concepts: ['eje cruzado'],
    width: 420,
    height: 220,
    speech:
      'Las boyas se me hunden o se me suben. Las quiero flotando a media agua, en el centro de la altura del lago.',
    theory:
      '<p><code>justify-content</code> reparte a lo largo del eje principal. Para el otro eje, el <b>eje cruzado</b> (el perpendicular), está <code>align-items</code>. En una fila, el eje cruzado es la <b>altura</b>.</p><pre>align-items: center;</pre>',
    objective: 'Barca, pez y barca centrados en vertical.',
    hint: '<code>align-items: center;</code>',
    pieces: ['barca', 'pez', 'barca'],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: flex;\ngap: 12px;',
        solution: 'align-items: center;',
      },
    ],
  },
  {
    id: 'f2-2',
    region: 2,
    title: 'Anclas al fondo',
    allowed: ['align-items'],
    concepts: ['eje cruzado'],
    width: 420,
    height: 220,
    speech: 'Las anclas, al fondo del lago, que para eso son anclas. Todas apoyadas abajo.',
    theory:
      '<p><code>flex-end</code> en el eje cruzado lleva todo al <b>final de la altura</b> (abajo, en una fila). <code>flex-start</code> lo lleva arriba.</p>',
    objective: 'Tres anclas apoyadas en el borde de abajo.',
    earlyHints: [
      'Es la misma runa que en «Boyas a media agua»; solo cambia el valor. ¿Las quieres al inicio, en el centro o al final del eje cruzado?',
    ],
    hint: '<code>align-items: flex-end;</code>',
    pieces: repeatItem('ancla', 3),
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: flex;\ngap: 12px;',
        solution: 'align-items: flex-end;',
      },
    ],
  },
  {
    id: 'f2-3',
    region: 2,
    title: 'Juncos estirados',
    allowed: ['align-items'],
    concepts: ['eje cruzado'],
    width: 420,
    height: 240,
    speech:
      'Los juncos luminosos crecen del fondo a la superficie. Alguien grabó una runa que los deja arriba, encogidos. Arréglala para que se estiren de borde a borde.',
    theory:
      '<p>Esta vez la tablilla ya trae una runa… y es la culpable. Con <code>align-items: flex-start</code>, los juncos se quedan al inicio del eje cruzado con su altura mínima.</p><p><code>stretch</code> los <b>estira</b> para ocupar todo el eje cruzado, pero solo si no tienen una altura fija: por eso los juncos llevan <code>height: auto</code>. Es el valor <b>por defecto</b> de <code>align-items</code>.</p>',
    objective: 'Cuatro juncos que ocupan toda la altura del lago.',
    earlyHints: [
      'Lee la runa que ya está escrita: ¿qué valor de <code>align-items</code> deja las piezas al inicio del eje cruzado?',
      'Hay dos arreglos: cambiar el valor por el que estira… o borrar la línea, porque estirar es lo que <code>align-items</code> hace por defecto.',
    ],
    hint: '<code>align-items: stretch;</code>',
    pieces: repeatItem('junco', 4),
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: flex;\ngap: 10px;',
        initial: 'align-items: flex-start;',
        solution: 'align-items: stretch;',
      },
      { selector: '.junco', fixed: 'height: auto;', editable: false },
    ],
  },
  {
    id: 'f2-4',
    region: 2,
    title: 'Línea de flotación',
    allowed: ['align-items'],
    concepts: ['baseline'],
    labels: false,
    width: 440,
    height: 220,
    speech:
      'Los letreros del muelle tienen marcos de distinta altura, pero las letras deben quedar todas a la misma altura, como si flotaran en la misma línea de agua.',
    theory:
      '<p><code>align-items: baseline</code> alinea los elementos por la <b>línea base del texto</b> (la línea sobre la que se apoyan las letras), no por sus bordes. Sirve cuando conviven cajas de distinto tamaño, como un título junto a un botón.</p>',
    objective:
      'Las tres palabras, apoyadas sobre la misma línea, aunque los letreros queden a distinta altura.',
    earlyHints: [
      'No mires los marcos, mira las letras: ¿sobre qué línea se apoyan en el objetivo?',
    ],
    hint: '<code>align-items: baseline;</code>',
    pieces: ['cartel@b1:Muelle', 'cartel@b2:Lago', 'cartel@b3:Isla'],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: flex;\ngap: 12px;',
        solution: 'align-items: baseline;',
      },
      { selector: '.b1', fixed: 'height: auto;\npadding-top: 30px;', editable: false },
      { selector: '.b2', fixed: 'height: auto;\npadding-top: 8px;', editable: false },
      { selector: '.b3', fixed: 'height: auto;\npadding-top: 48px;', editable: false },
    ],
  },
  {
    id: 'f2-5',
    region: 2,
    title: 'Faroles en la orilla',
    allowed: ['align-items', 'justify-content'],
    concepts: ['eje cruzado'],
    width: 320,
    height: 300,
    speech:
      'Los faroles van en columna, colgados en la orilla de la derecha. ¿A que ahora el eje cruzado no es el de antes?',
    theory:
      '<p>Los ejes van en pareja: si la dirección es <code>column</code>, el principal es vertical y el cruzado pasa a ser el <b>horizontal</b>. Entonces <code>align-items</code> mueve las piezas a izquierda o derecha, y <code>justify-content</code>, arriba o abajo.</p>',
    objective: 'Tres antorchas en columna, pegadas al borde derecho.',
    earlyHints: [
      'Activa «Ver ejes» y busca la flecha del eje cruzado: ¿va de arriba abajo o de lado a lado?',
      'Para moverte por el eje cruzado, la runa es <code>align-items</code>; <code>justify-content</code> llevaría las antorchas arriba o abajo.',
    ],
    hint: '<code>align-items: flex-end;</code>',
    pieces: repeatItem('antorcha', 3),
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: flex;\nflex-direction: column;\ngap: 10px;',
        solution: 'align-items: flex-end;',
      },
    ],
    missteps: [
      {
        when: { 'justify-content': 'flex-end' },
        message:
          'Las antorchas se han ido al fondo: en columna, <code>justify-content</code> reparte de arriba abajo. La orilla derecha está en el otro eje.',
      },
    ],
  },
  {
    id: 'f2-6',
    region: 2,
    title: 'La barca en el centro',
    allowed: ['justify-content', 'align-items'],
    concepts: ['eje principal', 'eje cruzado'],
    width: 400,
    height: 300,
    speech:
      'Mi barca, en el centro exacto del lago. Ni un palmo a un lado. Hace falta mandar en los dos ejes a la vez.',
    theory:
      '<p>Para centrar del todo: <code>justify-content: center</code> en el eje principal y <code>align-items: center</code> en el cruzado. Es el centrado más famoso de CSS: vale igual para una barca que para un aviso en mitad de la pantalla.</p>',
    objective: 'La barca en el centro exacto del tablero.',
    earlyHints: [
      'Son dos movimientos: al centro a lo largo del eje principal y al centro a lo ancho, en el eje cruzado. ¿Qué runa manda en cada eje?',
    ],
    hint: '<code>justify-content: center;</code> y <code>align-items: center;</code>',
    pieces: ['barca'],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: flex;',
        solution: 'justify-content: center;\nalign-items: center;',
      },
    ],
  },
  {
    id: 'f2-7',
    region: 2,
    title: 'El embarcadero',
    allowed: ['display', 'flex-direction', 'justify-content', 'align-items', 'gap', 'row-gap'],
    concepts: ['eje principal', 'eje cruzado'],
    width: 320,
    height: 380,
    speech:
      'Última faena antes de cruzarte: amarra la flota en el embarcadero. Una debajo de otra, todas apoyadas en el fondo, en mitad del ancho y con diez píxeles de cabo entre ellas. Y nadie ha despertado el tablero, así que te toca a ti.',
    theory:
      '<p>Aquí se juntan la mina, el bosque y el lago, y la tablilla empieza vacía. Las preguntas de la capataz, ya con los dos ejes:</p><ol><li><b>¿El tablero es flex?</b> <code>display</code></li><li><b>¿Hacia dónde va el eje principal?</b> <code>flex-direction</code></li><li><b>¿Dónde queda el espacio libre de ese eje?</b> <code>justify-content</code></li><li><b>¿Y en el eje cruzado?</b> <code>align-items</code></li><li><b>¿Qué hueco hay entre piezas?</b> <code>gap</code></li></ol><p>En columna, «abajo» está al final del eje principal y «en mitad del ancho», en el eje cruzado.</p>',
    objective:
      'Barca, pez y ancla en <b>columna</b>, juntos <b>abajo del todo</b>, centrados en <b>horizontal</b> y con <b>10px</b> entre ellos.',
    earlyHints: [
      'Escribe una runa por pregunta y mira el tablero tras cada una. Si una pieza se mueve en el eje que no esperabas, activa «Ver ejes» y comprueba cuál es el principal.',
      'A lo largo del eje principal (vertical), las piezas van al final; a lo ancho, en el eje cruzado, al centro.',
    ],
    hint: '<code>display: flex;</code> · <code>flex-direction: column;</code> · <code>justify-content: flex-end;</code> · <code>align-items: center;</code> · <code>gap: 10px;</code>',
    pieces: ['barca', 'pez', 'ancla'],
    rules: [
      {
        selector: '.tablero',
        solution:
          'display: flex;\nflex-direction: column;\njustify-content: flex-end;\nalign-items: center;\ngap: 10px;',
      },
    ],
    missteps: [
      NOT_FLEX,
      {
        when: { 'flex-direction': 'column', 'align-items': 'flex-end' },
        message:
          'La flota se ha ido a la orilla derecha: en columna, <code>align-items</code> mueve de lado a lado. «Abajo» está al final del eje principal.',
      },
      {
        when: { 'flex-direction': 'column', 'justify-content': 'center' },
        message:
          'La flota se ha quedado a media altura: en columna, <code>justify-content</code> reparte de arriba abajo. «En mitad del ancho» es cosa del eje cruzado.',
      },
    ],
    farewell:
      'Perfecto. Te cruzo gratis hasta las grietas. Bueno, casi gratis: cuéntale un chiste a los peces ciegos, que se aburren.',
  },
  //Region 3 · GRIETAS DE CRISTAL
  {
    id: 'f3-1',
    region: 3,
    title: 'Cristales que no caben',
    allowed: ['flex-wrap'],
    concepts: [],
    width: 360,
    height: 320,
    speech:
      'Clinc. Los cristales no caben en una fila y se están aplastando. Clinc, clinc. Que salten a la línea siguiente.',
    theory:
      '<p>Por defecto, flex mete todo en <b>una sola línea</b> aunque haya que encoger. Con <code>flex-wrap: wrap</code>, lo que no cabe <b>salta a otra línea</b>. Cada línea funciona como una fila flex nueva, con su propio espacio libre.</p>',
    objective: 'Nueve cristales sin aplastar, repartidos en varias filas.',
    hint: '<code>flex-wrap: wrap;</code>',
    pieces: repeatItem('cristal', 9),
    rules: [
      { selector: '.tablero', fixed: 'display: flex;\ngap: 8px;', solution: 'flex-wrap: wrap;' },
    ],
  },
  {
    id: 'f3-2',
    region: 3,
    title: 'Crecer hacia arriba',
    allowed: ['flex-wrap'],
    concepts: ['reverse'],
    width: 360,
    height: 320,
    speech:
      'Clinc. Los cristales crecen del suelo hacia el techo. La primera fila, abajo; la siguiente, encima.',
    theory:
      '<p><code>wrap-reverse</code> también salta de línea, pero apila las líneas <b>al revés</b> en el eje cruzado: la primera queda abajo.</p>',
    objective: 'Nueve cristales en varias filas, con la primera fila abajo del todo.',
    earlyHints: [
      'Las filas siguen saltando, pero se apilan en sentido contrario. Igual que con <code>row-reverse</code>, el salto de línea tiene su valor «al revés».',
    ],
    hint: '<code>flex-wrap: wrap-reverse;</code>',
    pieces: repeatItem('cristal', 9),
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: flex;\ngap: 8px;',
        solution: 'flex-wrap: wrap-reverse;',
      },
    ],
  },
  {
    id: 'f3-3',
    region: 3,
    title: 'El atajo de una runa',
    allowed: ['flex-direction', 'flex-wrap', 'flex-flow'],
    concepts: ['shorthand'],
    maxDeclarations: 1,
    width: 360,
    height: 300,
    speech:
      'Clinc. Solo tengo sitio para grabar una runa. Las gemas van en columnas que saltan a la derecha cuando se llenan.',
    theory:
      '<p><code>flex-flow</code> es el atajo de <code>flex-direction</code> y <code>flex-wrap</code> en una sola declaración.</p><pre>flex-flow: column wrap;</pre>',
    objective:
      'Ocho gemas en columnas: cuando una columna se llena, sigue en la de la derecha. Con una sola declaración.',
    hint: '<code>flex-flow: column wrap;</code>',
    pieces: repeatItem('gema', 8),
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: flex;\ngap: 8px;',
        solution: 'flex-flow: column wrap;',
      },
    ],
  },
  {
    id: 'f3-4',
    region: 3,
    title: 'Vetas apretadas',
    allowed: ['align-content', 'align-items'],
    concepts: ['espacio libre'],
    width: 360,
    height: 360,
    speech:
      'Las vetas de cristal se separan demasiado. Probé con una runa del lago y ni se movieron. Júntalas todas arriba, una pegada a la otra. Clinc.',
    theory:
      '<p>La tablilla trae <code>align-items: flex-start</code>, y no basta: <code>align-items</code> coloca cada pieza <b>dentro de su línea</b>, pero no mueve las líneas.</p><p>Cuando hay <b>varias líneas</b>, quien reparte el espacio libre entre ellas, en el eje cruzado, es <code>align-content</code>. Por defecto las líneas se estiran para repartirse toda la altura; con <code>flex-start</code> se juntan al principio.</p>',
    objective: 'Dos filas de cristales, juntas y arriba del todo.',
    earlyHints: [
      'Mira el tablero: cada cristal ya está arriba <b>de su fila</b>. Lo que sobra es el espacio entre fila y fila.',
      'La runa que mueve las líneas enteras es <code>align-content</code>. Puedes sustituir la que hay o añadirla debajo.',
    ],
    hint: '<code>align-content: flex-start;</code>',
    pieces: repeatItem('cristal', 7),
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: flex;\nflex-wrap: wrap;\ngap: 8px;',
        initial: 'align-items: flex-start;',
        solution: 'align-content: flex-start;',
      },
    ],
  },
  {
    id: 'f3-5',
    region: 3,
    title: 'La geoda',
    allowed: ['justify-content', 'align-content', 'align-items'],
    concepts: [],
    width: 360,
    height: 360,
    speech:
      'Una geoda: todo el cristal apiñado en el corazón de la piedra, en el centro exacto. Clinc.',
    theory:
      '<p>Con varias líneas hay dos repartos: <code>justify-content</code> centra las piezas <b>dentro de cada línea</b> y <code>align-content</code> centra el <b>bloque de líneas</b>.</p><p>Compara con «La barca en el centro»: allí había una sola línea y bastaba <code>align-items</code>. Aquí <code>align-items</code> centraría cada cristal en su fila, pero las filas seguirían separadas.</p>',
    objective:
      'Los cristales, en dos filas centradas, y las dos filas juntas en el centro vertical.',
    earlyHints: [
      'Son dos repartos distintos: uno coloca los cristales dentro de cada fila y el otro coloca el bloque de filas en la altura.',
    ],
    hint: '<code>justify-content: center;</code> y <code>align-content: center;</code>',
    pieces: repeatItem('cristal', 7),
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: flex;\nflex-wrap: wrap;\ngap: 8px;',
        solution: 'justify-content: center;\nalign-content: center;',
      },
    ],
    missteps: [
      {
        when: { 'align-items': 'center', 'align-content': 'normal' },
        message:
          'Cada cristal está centrado en su fila, pero las filas siguen repartiéndose toda la altura. Para apiñar las filas hace falta la runa de las líneas.',
      },
    ],
  },
  {
    id: 'f3-6',
    region: 3,
    title: 'Estratos',
    allowed: ['align-content'],
    concepts: ['espacio libre'],
    width: 360,
    height: 380,
    speech:
      'Tres estratos: uno pegado al techo, otro al suelo y el tercero justo en medio. Así crece la roca. Clinc.',
    theory:
      '<p><code>align-content</code> admite los mismos repartos que <code>justify-content</code>, pero aplicados a las <b>líneas</b>: <code>space-between</code> pega la primera línea al inicio, la última al final y reparte el resto entre medias.</p>',
    objective:
      'Tres filas de cristales: la primera arriba del todo, la última abajo del todo y otra en medio.',
    earlyHints: [
      'Este reparto ya lo usaste en el bosque de setas: la primera en un extremo y la última en el otro. Aquí no se reparten piezas, sino filas enteras.',
    ],
    hint: '<code>align-content: space-between;</code>',
    pieces: repeatItem('cristal', 10),
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: flex;\nflex-wrap: wrap;\ngap: 8px;',
        solution: 'align-content: space-between;',
      },
    ],
  },
  {
    id: 'f3-7',
    region: 3,
    title: 'El túnel que respira',
    variant: 'túnel cambiante',
    widths: [240, 380, 520],
    height: 260,
    allowed: ['flex-wrap', 'justify-content', 'gap', 'column-gap', 'row-gap'],
    concepts: [],
    speech:
      'Este túnel respira: se ensancha y se estrecha. Clinc… clinc. Tu fila de cristales tiene que quedar bien con cualquier anchura.',
    theory:
      '<p><b>Túnel cambiante:</b> el mismo CSS se comprueba con tres anchuras. Usa los botones de anchura para ver cada una. Así se diseña para pantallas de distinto tamaño: no colocas las piezas una a una, describes <b>cómo deben repartirse</b> y flex hace el resto.</p><p>La pregunta nueva de esta región: <b>¿cabe todo en una línea?</b> Si no cabe, <code>flex-wrap</code> decide si salta; <code>justify-content</code> reparte dentro de cada línea y <code>gap</code> separa piezas y líneas.</p>',
    objective:
      'Con cualquier anchura: los cristales saltan de línea cuando no caben, van centrados y con 10px de hueco en las dos direcciones.',
    earlyHints: [
      'Empieza por el túnel más estrecho: ¿qué les pasa a los cristales cuando no caben? Arregla eso primero; después centra y separa.',
    ],
    hint: '<code>flex-wrap: wrap;</code> · <code>justify-content: center;</code> · <code>gap: 10px;</code>',
    pieces: repeatItem('cristal', 6),
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: flex;',
        solution: 'flex-wrap: wrap;\njustify-content: center;\ngap: 10px;',
      },
    ],
    farewell: 'Clinc, clinc, clinc. (Es mi forma de aplaudir.)',
  },
  //Region 4 · LA FORJA ENANA
  {
    id: 'f4-1',
    region: 4,
    title: 'La viga que crece',
    allowed: ['flex-grow'],
    concepts: ['espacio libre'],
    width: 460,
    height: 180,
    speech:
      '¡Por mi barba! Entre el yunque y el martillo hay un hueco y la viga no lo llena. Que crezca hasta tocar los dos.',
    theory:
      '<p>Hasta ahora el espacio libre quedaba entre las piezas o a sus lados. Con <code>flex-grow</code>, son las piezas las que <b>crecen</b> para quedárselo. Va en el hijo, no en el contenedor: si solo uno tiene <code>flex-grow: 1</code>, se lleva todo el hueco.</p><pre>.viga { flex-grow: 1; }</pre>',
    objective: 'La viga se estira y llena todo el hueco entre yunque y martillo.',
    hint: '<code>flex-grow: 1;</code> en la viga.',
    pieces: ['yunque', 'viga', 'martillo'],
    rules: [
      boardRule('display: flex;\ngap: 10px;'),
      { selector: '.viga', solution: 'flex-grow: 1;' },
    ],
  },
  {
    id: 'f4-2',
    region: 4,
    title: 'Lingotes en proporción',
    allowed: ['flex-grow'],
    concepts: ['espacio libre'],
    width: 460,
    height: 180,
    speech:
      'Tres lingotes. El del medio se lleva el doble del espacio sobrante que los otros dos. Ni una pizca más.',
    theory:
      '<p>Los números de <code>flex-grow</code> son <b>proporciones</b>: con 1, 2 y 1, el espacio libre se parte en cuatro trozos y el del medio se lleva dos. Ojo: se reparte el espacio <b>sobrante</b>, no el ancho total.</p>',
    objective: 'Los tres lingotes llenan la fila; el espacio sobrante se reparte 1 : 2 : 1.',
    earlyHints: [
      'Cuenta partes: si los de los lados se llevan una parte cada uno y el del medio, dos, ¿qué número le toca a cada lingote?',
    ],
    hint: '<code>.a { flex-grow: 1 }</code> · <code>.b { flex-grow: 2 }</code> · <code>.c { flex-grow: 1 }</code>',
    pieces: ['lingote@a', 'lingote@b', 'lingote@c'],
    rules: [
      boardRule('display: flex;\ngap: 10px;'),
      { selector: '.a', solution: 'flex-grow: 1;' },
      { selector: '.b', solution: 'flex-grow: 2;' },
      { selector: '.c', solution: 'flex-grow: 1;' },
    ],
  },
  {
    id: 'f4-3',
    region: 4,
    title: 'Medidas de molde',
    allowed: ['flex-basis'],
    concepts: [],
    width: 460,
    height: 180,
    speech:
      'Cada molde tiene su medida de partida: 80, 160 y 120 píxeles. Antes de crecer o encoger, ese es su tamaño.',
    theory:
      '<p><code>flex-basis</code> es el <b>tamaño de partida</b> de un elemento en el eje principal, antes de repartir el espacio. En una fila es un ancho; en una columna sería un alto. Si lo pones, manda más que <code>width</code>.</p>',
    objective: 'Tres moldes de 80, 160 y 120px de ancho.',
    hint: '<code>flex-basis: 80px</code>, <code>160px</code> y <code>120px</code>.',
    pieces: ['molde@m1', 'molde@m2', 'molde@m3'],
    rules: [
      boardRule('display: flex;\ngap: 10px;'),
      { selector: '.m1', solution: 'flex-basis: 80px;' },
      { selector: '.m2', solution: 'flex-basis: 160px;' },
      { selector: '.m3', solution: 'flex-basis: 120px;' },
    ],
  },
  {
    id: 'f4-4',
    region: 4,
    title: 'Escudos que no ceden',
    allowed: ['flex-shrink'],
    concepts: [],
    width: 420,
    height: 180,
    speech:
      'No caben todos y la fila los aprieta. Los escudos enanos no se doblan, ¡jamás! Que encoja el trapo, que para eso es trapo.',
    theory:
      '<p>Aquí falta sitio: el espacio libre es <b>negativo</b>. Entonces los elementos <b>encogen</b>, y <code>flex-shrink</code> dice cuánto cede cada uno. Por defecto vale <code>1</code> y todos ceden; con <code>0</code>, un elemento <b>no encoge nada</b> y los demás pagan la falta de sitio.</p>',
    objective: 'Los tres escudos conservan sus 110px; el trapo encoge todo lo que haga falta.',
    earlyHints: ['¿Quién no debe ceder? La runa va en esas piezas, no en la que encoge.'],
    hint: '<code>flex-shrink: 0;</code> en los escudos.',
    pieces: ['escudo', 'escudo', 'trapo', 'escudo'],
    rules: [
      boardRule('display: flex;\ngap: 8px;'),
      { selector: '.trapo', fixed: 'width: 110px;', editable: false },
      { selector: '.escudo', fixed: 'width: 110px;', solution: 'flex-shrink: 0;' },
    ],
  },
  {
    id: 'f4-5',
    region: 4,
    title: 'El atajo del herrero',
    allowed: ['flex', 'flex-grow', 'flex-shrink', 'flex-basis'],
    concepts: ['shorthand'],
    width: 480,
    height: 180,
    speech:
      'Dos bancos de trabajo se reparten todo el hueco, y el segundo tiene que medir exactamente el doble que el primero. Mi aprendiz probó con flex-grow 1 y 2, y mira: no sale el doble. Exactamente, he dicho.',
    theory:
      '<p>¿Por qué no sale el doble? <code>flex-grow</code> reparte solo el espacio <b>sobrante</b>: cada banco conserva su ancho de partida y le suma su parte.</p><p>El atajo <code>flex</code> junta tres valores: <code>flex-grow flex-shrink flex-basis</code>. <code>flex: 1</code> significa <code>1 1 0%</code>: al partir de <b>base cero</b>, todo el ancho es espacio a repartir y los bancos quedan <b>exactamente</b> en la proporción de los números.</p>',
    objective: 'Los dos bancos llenan el hueco y el segundo mide justo el doble que el primero.',
    earlyHints: [
      'Con <code>flex-grow</code>, cada banco suma su parte del hueco a los 64px que ya medía. ¿De qué tamaño tendrían que partir para que solo contaran las proporciones?',
    ],
    hint: 'Cambia las dos runas por el atajo: <code>.b1 { flex: 1 }</code> y <code>.b2 { flex: 2 }</code>',
    pieces: ['martillo', 'banco@b1', 'banco@b2', 'barril'],
    rules: [
      boardRule('display: flex;\ngap: 8px;'),
      { selector: '.b1', initial: 'flex-grow: 1;', solution: 'flex: 1;' },
      { selector: '.b2', initial: 'flex-grow: 2;', solution: 'flex: 2;' },
    ],
    checks: [{ pattern: /(^|[^-])flex\s*:/m, message: 'Usa el atajo <code>flex</code>' }],
  },
  {
    id: 'f4-6',
    region: 4,
    title: 'Ni crece ni mengua',
    variant: 'túnel cambiante',
    widths: [420, 600],
    height: 180,
    allowed: ['flex', 'flex-grow', 'flex-shrink', 'flex-basis'],
    concepts: ['shorthand'],
    speech:
      'La placa maestra mide 140 y no se toca. Las otras dos se adaptan al taller: encogen si falta sitio y crecen si sobra. Comprueba los dos talleres.',
    theory:
      '<p>Dos atajos muy útiles: <code>flex: none</code> (= <code>0 0 auto</code>, ni crece ni encoge) y <code>flex: auto</code> (= <code>1 1 auto</code>, crece y encoge partiendo de su ancho).</p>',
    objective:
      'En los dos anchos: la placa 1 siempre mide 140px; las placas 2 y 3 se reparten lo que sobre o lo que falte.',
    earlyHints: [
      'Compara los dos talleres: ¿qué placa mide lo mismo en ambos? Esa ni crece ni encoge; las otras dos hacen las dos cosas.',
    ],
    hint: '<code>.p1 { flex: none }</code> · <code>.p2, .p3 { flex: auto }</code>',
    pieces: ['placa@p1', 'placa@p2', 'placa@p3'],
    rules: [
      boardRule('display: flex;\ngap: 8px;'),
      { selector: '.p1', fixed: 'width: 140px;', solution: 'flex: none;' },
      { selector: '.p2', fixed: 'width: 140px;', solution: 'flex: auto;' },
      { selector: '.p3', fixed: 'width: 140px;', solution: 'flex: auto;' },
    ],
  },
  {
    id: 'f4-7',
    region: 4,
    title: 'Antes de que se enfríe',
    variant: 'contra reloj',
    timeLimit: 60,
    className: 'brasas',
    allowed: ['align-items', 'flex-basis', 'flex-grow'],
    concepts: [],
    width: 460,
    height: 200,
    timeMessages: {
      expired:
        '¡El metal se ha enfriado! <button type="button" class="text-link" id="p-sacudir">Aviva la fragua</button> y vuelve a intentarlo.',
      late: 'Superado, aunque el metal se enfrió. Repítelo a tiempo y sin pistas para dominarlo.',
    },
    speech:
      '¡Rápido, que se enfría! Lingotes centrados en altura, el primero de 100 de partida y el del medio, que llene el resto.',
    theory:
      '<p><b>Contra reloj:</b> antes de escribir, separa lo que va en el contenedor de lo que va en cada lingote. Al contenedor le preguntas por los ejes: <code>align-items</code> para la altura. A cada pieza, <b>de qué tamaño parte</b> (<code>flex-basis</code>) y <b>si crece</b> para quedarse el espacio libre (<code>flex-grow</code>).</p>',
    objective:
      'Los tres lingotes centrados en vertical; el primero parte de 100px y el segundo crece hasta llenar el hueco.',
    hint: '<code>align-items: center</code> · <code>.a { flex-basis: 100px }</code> · <code>.b { flex-grow: 1 }</code>',
    pieces: ['lingote@a', 'lingote@b', 'lingote@c'],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: flex;\ngap: 8px;',
        solution: 'align-items: center;',
      },
      { selector: '.a', solution: 'flex-basis: 100px;' },
      { selector: '.b', solution: 'flex-grow: 1;' },
    ],
  },
  {
    id: 'f4-8',
    region: 4,
    title: 'Partes del todo',
    widths: [360, 520],
    height: 180,
    allowed: ['width'],
    concepts: ['%'],
    speech:
      'Último encargo de la forja: una viga de tres piezas para un túnel que cambia de ancho. No me des medidas en píxeles: dame partes. Un cuarto, la mitad y otro cuarto.',
    theory:
      '<p>A un hijo flex se le puede dar el ancho en <b>porcentaje</b>: se calcula sobre el ancho del <b>contenedor</b>.</p><pre>width: 50%;</pre><p>Si los porcentajes suman 100, las piezas llenan la fila justa, mida lo que mida el túnel. Es la forma clásica de repartir una barra o una fila de columnas.</p>',
    objective:
      'Las piezas finas ocupan el <b>25%</b> del ancho y la gruesa, el <b>50%</b>, con los dos anchos de túnel.',
    hint: '<code>width: 25%;</code> en <code>.fina</code> y <code>width: 50%;</code> en <code>.gruesa</code>.',
    pieces: ['viga@fina', 'viga@gruesa', 'viga@fina'],
    rules: [
      boardRule('display: flex;\nalign-items: center;'),
      { selector: '.fina', solution: 'width: 25%;' },
      { selector: '.gruesa', solution: 'width: 50%;' },
    ],
    farewell:
      '¡Templado perfecto! Que los dioses de la piedra te guarden la barba… aunque no tengas.',
  },
  //Region 5 · EL ABISMO
  {
    id: 'f5-1',
    region: 5,
    title: 'La antorcha delante',
    allowed: ['order'],
    concepts: [],
    width: 420,
    height: 180,
    speech:
      'Kib dice: la antorcha va delante, ¡siempre delante! Si no, Kib se cae al abismo. Pero el HTML no se toca, Kib lo prometió.',
    theory:
      '<p><code>order</code> cambia el orden <b>visual</b> sin tocar el HTML. Todos empiezan en <code>0</code>; los números más bajos van primero, y valen los negativos.</p><pre>.antorcha { order: -1; }</pre><p>Solo cambia lo que se ve: quien navega con teclado o con lector de pantalla sigue el orden del HTML.</p>',
    objective: 'La antorcha la primera por la izquierda; las tablas, detrás.',
    hint: '<code>order: -1;</code> en la antorcha.',
    pieces: ['tabla', 'tabla', 'tabla', 'antorcha'],
    rules: [
      boardRule('display: flex;\ngap: 8px;'),
      { selector: '.antorcha', solution: 'order: -1;' },
    ],
  },
  {
    id: 'f5-2',
    region: 5,
    title: 'Uno, dos, tres',
    allowed: ['order'],
    concepts: [],
    width: 380,
    height: 180,
    speech:
      'Kib grabó las piedras del puente desordenadas. Kib sabe contar hasta tres, pero el puente no. Ponlas en orden.',
    theory:
      '<p>Con varios <code>order</code> puedes reordenar todo: primero los de número más bajo; a igual número, manda el orden del HTML.</p>',
    objective: 'De izquierda a derecha: uno, dos, tres.',
    earlyHints: [
      'Todas empiezan en <code>0</code> y, a igual número, manda el HTML. ¿Cuál está fuera de sitio y adónde tiene que ir?',
    ],
    hint: 'Basta con mandar «tres» al final: <code>.tres { order: 1 }</code>. También vale numerar las tres.',
    pieces: ['runa@tres', 'runa@uno', 'runa@dos'],
    rules: [
      boardRule('display: flex;\ngap: 10px;'),
      { selector: '.uno', solution: 'order: 1;' },
      { selector: '.dos', solution: 'order: 2;' },
      { selector: '.tres', solution: 'order: 3;' },
    ],
  },
  {
    id: 'f5-3',
    region: 5,
    title: 'El murciélago colgado',
    allowed: ['align-self'],
    concepts: ['eje cruzado'],
    width: 420,
    height: 220,
    speech:
      'Todo apoyado abajo, menos el murciélago. Los murciélagos cuelgan del techo, Kib lo sabe bien.',
    theory:
      '<p><code>align-items</code> coloca a todos por igual. <code>align-self</code> hace lo mismo para <b>un solo elemento</b>: va en el hijo y le deja colocarse distinto que los demás en el eje cruzado.</p><pre>.murcielago { align-self: flex-start; }</pre>',
    objective: 'Las tablas abajo; el murciélago, arriba.',
    hint: '<code>align-self: flex-start;</code> en el murciélago.',
    pieces: ['tabla', 'murcielago', 'tabla', 'tabla'],
    rules: [
      boardRule('display: flex;\nalign-items: flex-end;\ngap: 8px;'),
      { selector: '.murcielago', solution: 'align-self: flex-start;' },
    ],
  },
  {
    id: 'f5-4',
    region: 5,
    title: 'Puente colgante',
    allowed: ['align-self'],
    concepts: ['eje cruzado'],
    width: 460,
    height: 240,
    speech:
      'El puente cuelga torcido: el poste de la izquierda está más alto que el de la derecha. Las tablas, en medio. Kib quiere que se vea así.',
    theory:
      '<p>Cada elemento puede llevar su propio <code>align-self</code>: <code>flex-start</code>, <code>center</code>, <code>flex-end</code>, <code>stretch</code> o <code>baseline</code>.</p>',
    objective: 'Poste izquierdo arriba, poste derecho abajo; las tablas centradas.',
    earlyHints: [
      'El tablero ya centra a todas las piezas. ¿Qué dos se salen de la norma, y hacia qué extremo del eje cruzado va cada una?',
    ],
    hint: '<code>.izq { align-self: flex-start }</code> · <code>.der { align-self: flex-end }</code>',
    pieces: ['poste@izq', 'tabla', 'tabla', 'poste@der'],
    rules: [
      boardRule('display: flex;\njustify-content: space-between;\nalign-items: center;'),
      { selector: '.izq', solution: 'align-self: flex-start;' },
      { selector: '.der', solution: 'align-self: flex-end;' },
    ],
  },
  {
    id: 'f5-5',
    region: 5,
    title: 'Al revés y en orden',
    allowed: ['order'],
    concepts: ['reverse'],
    width: 420,
    height: 180,
    speech:
      'Kib dejó la fila al revés y ya no puede cambiarla. Pero quiere leer uno, dos, tres, cuatro de izquierda a derecha. Kib confía en ti.',
    theory:
      '<p><code>order</code> se aplica <b>antes</b> que la dirección: con <code>row-reverse</code>, el elemento con el número más bajo acaba a la <b>derecha</b>.</p>',
    objective:
      'De izquierda a derecha se lee: uno, dos, tres, cuatro (la fila sigue pegada a la derecha).',
    earlyHints: [
      'Con <code>row-reverse</code>, el eje principal nace en la derecha: la pieza con el <code>order</code> más bajo se coloca la primera… es decir, la más a la derecha.',
    ],
    hint: 'Dale números más altos a los que quieras más a la izquierda: <code>.uno { order: 4 }</code>…',
    pieces: ['runa@uno', 'runa@dos', 'runa@tres', 'runa@cuatro'],
    rules: [
      boardRule('display: flex;\nflex-direction: row-reverse;\ngap: 8px;'),
      { selector: '.uno', solution: 'order: 4;' },
      { selector: '.dos', solution: 'order: 3;' },
      { selector: '.tres', solution: 'order: 2;' },
      { selector: '.cuatro', solution: 'order: 1;' },
    ],
  },
  {
    id: 'f5-6',
    region: 5,
    title: 'La marcha de los tambores',
    variant: 'musical',
    musical: true,
    allowed: ['order'],
    concepts: [],
    maxDeclarations: 1,
    width: 400,
    height: 200,
    speech:
      '¡Bum, bum! Los enanos cruzan el abismo marcando el paso. Tambores de grave a agudo, de izquierda a derecha. Cada uno suena cuando llega a su sitio. Y solo queda tiza para una runa: Kib gastó el resto dibujando murciélagos.',
    theory:
      '<p><b>Nivel musical:</b> cada tambor suena al quedar en su sitio. Ordena con <code>order</code>, pero con una sola declaración: todos empiezan en <code>0</code> y, a igual número, manda el orden del HTML. No hace falta numerar los tres; basta con mover el que está fuera de sitio.</p>',
    objective: 'De izquierda a derecha: tambor bajo, medio y alto. Con una sola declaración.',
    earlyHints: [
      'Bajo y medio ya están en el orden correcto entre sí. ¿Qué tambor sobra delante, y qué número lo manda detrás de los que valen <code>0</code>?',
    ],
    hint: '<code>.alto { order: 1 }</code>',
    pieces: ['tambor@alto', 'tambor@bajo', 'tambor@medio'],
    rules: [
      boardRule('display: flex;\ngap: 14px;\njustify-content: center;'),
      { selector: '.bajo' },
      { selector: '.medio' },
      { selector: '.alto', solution: 'order: 1;' },
    ],
  },
  {
    id: 'f5-7',
    region: 5,
    title: '¡Que se cae el puente!',
    variant: 'contra reloj',
    timeLimit: 50,
    className: 'derrumbe',
    allowed: ['order', 'align-self'],
    concepts: [],
    width: 420,
    height: 220,
    timeMessages: {
      expired:
        '¡El puente se ha derrumbado! <button type="button" class="text-link" id="p-sacudir">Recoge las tablas</button> y vuelve a intentarlo.',
      late: 'Superado, aunque el puente se vino abajo. Repítelo a tiempo y sin pistas para dominarlo.',
    },
    speech:
      '¡Kib oye crujidos! Antorcha delante y colgada arriba, la cuerda al final y apoyada abajo. ¡Corre, corre!',
    theory:
      '<p><b>Contra reloj:</b> el puente cruje en cuanto empiezas a escribir. La pregunta de esta región: <b>¿alguna pieza va por libre?</b> El contenedor ya centra a todas; las excepciones se escriben en cada hijo: <code>order</code> para su puesto en la fila y <code>align-self</code> para su altura.</p>',
    objective:
      'La antorcha, la primera y arriba; la cuerda, la última y abajo; las tablas, centradas entre ambas.',
    hint: '<code>.antorcha { order: -1; align-self: flex-start }</code> · <code>.cuerda { order: 1; align-self: flex-end }</code>',
    pieces: ['cuerda', 'tabla', 'tabla', 'antorcha'],
    rules: [
      boardRule('display: flex;\nalign-items: center;\ngap: 6px;'),
      { selector: '.antorcha', solution: 'order: -1;\nalign-self: flex-start;' },
      { selector: '.cuerda', solution: 'order: 1;\nalign-self: flex-end;' },
    ],
    farewell: 'Kib está vivo. Kib te debe una. Kib nunca olvida… bueno, a veces sí.',
  },
  //Region 6 · CIUDAD DROW
  {
    id: 'f6-1',
    region: 6,
    title: 'Torres dentro de torres',
    variant: 'anidado',
    allowed: ['display', 'flex-direction', 'justify-content', 'align-items'],
    concepts: ['anidación'],
    width: 460,
    height: 300,
    speech:
      "Shh. Soy Nyx; hui de las matriarcas. Las torres de Vel'Zhar guardan luces dentro. Cada torre es una pieza de la ciudad… y a la vez un contenedor. Ordena sus luces.",
    theory:
      '<p>Un elemento flex puede ser <b>a la vez contenedor flex</b> de sus propios hijos. Así se construye casi cualquier interfaz: cajas dentro de cajas.</p><pre>.torre {\n  display: flex;\n  flex-direction: column;\n}</pre><p>Dentro de cada torre valen las preguntas de siempre: ¿es flex?, ¿hacia dónde va su eje principal?, ¿cómo se reparte el espacio en cada eje?</p>',
    objective:
      'Dentro de cada torre: luces en columna, centradas en horizontal y repartidas con el mismo hueco arriba, abajo y entre ellas.',
    earlyHints: [
      'Olvida la ciudad y mira una sola torre: es un tablero pequeño. Hazle las preguntas de siempre, empezando por si es flex.',
      'Dentro de la torre: columna; a lo largo del eje, huecos iguales también arriba y abajo; a lo ancho, al centro.',
    ],
    hint: '<code>display: flex</code> · <code>flex-direction: column</code> · <code>justify-content: space-evenly</code> · <code>align-items: center</code>',
    pieces: ['torre', ['luz', 'luz', 'luz'], 'torre', ['luz', 'luz', 'luz']],
    rules: [
      boardRule('display: flex;\ngap: 14px;'),
      {
        selector: '.torre',
        fixed: 'flex-grow: 1;',
        solution:
          'display: flex;\nflex-direction: column;\njustify-content: space-evenly;\nalign-items: center;',
      },
    ],
    missteps: [
      {
        selector: '.torre',
        when: { display: 'block' },
        message:
          'La torre aún no es flex: hasta que lo sea, sus luces no obedecen a las demás runas.',
      },
    ],
  },
  {
    id: 'f6-2',
    region: 6,
    title: 'El centinela',
    allowed: MARGIN_PROPS,
    concepts: ['margin auto'],
    width: 400,
    height: 300,
    speech:
      'El orbe centinela vigila desde el centro de la plaza. Sin tocar el contenedor: solo con el propio orbe. Los márgenes automáticos hacen magia.',
    theory:
      '<p>En un contenedor flex, <code>margin: auto</code> reparte el espacio libre <b>a los cuatro lados</b> del elemento: lo centra en los dos ejes.</p><p>Ya tienes dos formas de centrar: desde el contenedor, con <code>justify-content</code> y <code>align-items</code>, o desde el propio hijo, con sus márgenes.</p>',
    objective: 'El centinela, en el centro exacto, sin cambiar las reglas del tablero.',
    earlyHints: [
      'En el bosque de setas, un margen <code>auto</code> se quedaba con todo el espacio libre de un lado. ¿Y si lo pides por los cuatro lados a la vez?',
    ],
    hint: '<code>margin: auto;</code> en el centinela.',
    pieces: ['centinela'],
    rules: [boardRule('display: flex;'), { selector: '.centinela', solution: 'margin: auto;' }],
  },
  {
    id: 'f6-3',
    region: 6,
    title: 'La casa de tres alas',
    allowed: ['flex-grow', 'flex-basis', 'flex'],
    concepts: [],
    width: 480,
    height: 220,
    speech:
      'Las casas nobles tienen dos alas iguales de 90 y un salón que ocupa todo lo demás. Así presumen las familias de las matriarcas.',
    theory:
      '<p>La receta clásica de muchas webs: laterales con <b>tamaño fijo</b> (<code>flex-basis</code>) y una zona central que <b>crece</b> (<code>flex-grow</code>).</p>',
    objective: 'Ala izquierda y derecha de 90px; el salón llena el resto.',
    earlyHints: [
      'Pregúntale a cada pieza lo que aprendiste en la forja: ¿de qué tamaño parte? ¿Crece para llenar lo que sobra?',
    ],
    hint: '<code>.izq, .der { flex-basis: 90px }</code> · <code>.salon { flex-grow: 1 }</code>',
    pieces: ['ala@izq', 'salon', 'ala@der'],
    rules: [
      boardRule('display: flex;\ngap: 8px;'),
      { selector: '.izq', solution: 'flex-basis: 90px;' },
      { selector: '.salon', solution: 'flex-grow: 1;' },
      { selector: '.der', solution: 'flex-basis: 90px;' },
    ],
  },
  {
    id: 'f6-4',
    region: 6,
    title: 'El Mercado de la Telaraña',
    variant: 'regateo',
    purse: { total: 6, price: 2 },
    allowed: [
      'flex-flow',
      'flex-direction',
      'flex-wrap',
      'justify-content',
      'align-content',
      'gap',
      'row-gap',
      'column-gap',
    ],
    concepts: ['shorthand'],
    width: 380,
    height: 300,
    character: 'Grizka',
    role: 'la mercadera goblin',
    portrait: 'pj-grizka',
    purseMessage:
      'Grizka, la mercadera goblin: «¡Je, je! ¿Tanta runa para tan poco oro? Grizka no fía ni a su abuela.»',
    speech:
      '¡Je, je! Grizka vende pociones hasta a las matriarcas. Pero aquí todo se paga, también las runas: dos monedas cada una y tienes seis. Pociones en columnas, de arriba abajo, que salten a la derecha cuando no quepan; el montón, en mitad del puesto, y 10 de hueco.',
    theory:
      '<p><b>Regateo:</b> cada declaración cuesta, y con lo que hay en la bolsa te llega para tres justas. Dirección y salto por separado ya son dos… pero en las grietas aprendiste un atajo que los junta en una sola runa: <code>flex-flow</code>.</p><p>Y recuerda: en columna, las líneas son <b>columnas</b>, así que <code>align-content</code> las mueve en horizontal.</p>',
    objective:
      'Siete pociones en columnas de arriba abajo que saltan a la derecha; el bloque de columnas, centrado en horizontal; 10px de hueco en las dos direcciones. Con tres declaraciones.',
    earlyHints: [
      'Cuenta lo que te piden: dirección, salto de línea, centrar las columnas y hueco. Son cuatro cosas y solo puedes pagar tres runas: dos de ellas caben en un atajo.',
      'El atajo es <code>flex-flow</code>: dirección y salto juntos. Para centrar el bloque de columnas, piensa en qué eje se apilan las líneas cuando la dirección es <code>column</code>.',
    ],
    hint: '<code>flex-flow: column wrap;</code> · <code>align-content: center;</code> · <code>gap: 10px;</code>',
    pieces: repeatItem('pocion', 7),
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: flex;',
        solution: 'flex-flow: column wrap;\nalign-content: center;\ngap: 10px;',
      },
    ],
    missteps: [
      {
        when: { 'flex-direction': 'column', 'justify-content': 'center' },
        message:
          'Las pociones se han centrado de arriba abajo: en columna, <code>justify-content</code> reparte en vertical. El bloque de columnas lo mueve la runa de las líneas.',
      },
    ],
  },
  {
    id: 'f6-5',
    region: 6,
    title: 'Las casas de las matriarcas',
    variant: 'anidado',
    allowed: ['flex', 'flex-grow', 'display', 'justify-content', 'align-items'],
    concepts: ['anidación', 'shorthand'],
    width: 480,
    height: 240,
    character: "Zesh'ra",
    role: 'la matriarca de la Casa Velkyn',
    portrait: 'pj-zeshra',
    speech:
      'Vaya, vaya. Una superficial ordenando mi calle. Tres casas de matriarcas, todas igual de anchas: ninguna consiente ser menos que otra. Y en cada una, las luces vigilan las dos esquinas de arriba. Si sale torcido… servirás de cena a mis arañas.',
    theory:
      '<p>Combina niveles: <code>flex: 1</code> para que las casas se repartan el ancho, y dentro de cada casa otro <code>display: flex</code> para colocar sus luces.</p>',
    objective:
      'Tres casas del mismo ancho que llenan la fila. En cada casa, dos luces: una en la esquina superior izquierda y otra en la superior derecha.',
    earlyHints: [
      'Dos niveles, dos preguntas. Hacia fuera: ¿cómo se reparte cada casa el ancho de la calle? Hacia dentro: ¿cómo coloca cada casa sus dos luces?',
      'Todo va en <code>.mansion</code>: una runa la hace crecer por igual, como hija de la calle, y las demás la convierten en contenedor y mandan sus luces a los extremos, arriba.',
    ],
    hint: '<code>.mansion { flex: 1; display: flex; justify-content: space-between; align-items: flex-start; }</code>',
    pieces: ['mansion', ['luz', 'luz'], 'mansion', ['luz', 'luz'], 'mansion', ['luz', 'luz']],
    rules: [
      boardRule('display: flex;\ngap: 10px;'),
      {
        selector: '.mansion',
        solution:
          'flex: 1;\ndisplay: flex;\njustify-content: space-between;\nalign-items: flex-start;',
      },
    ],
    missteps: [
      {
        selector: '.mansion',
        when: { display: 'block' },
        message:
          'La casa aún no es flex: hasta que lo sea, sus luces no obedecen a las demás runas.',
      },
    ],
  },
  {
    id: 'f6-6',
    region: 6,
    title: 'Luces apagadas',
    variant: 'a oscuras',
    mirage: true,
    className: 'oscuras',
    allowed: ['display', 'flex-direction', 'justify-content', 'align-items', 'gap', 'row-gap'],
    concepts: [],
    width: 300,
    height: 340,
    speech:
      'Los drow apagan las luces para cazar a los superficiales. Yo veo en la oscuridad; tú no. Te lo dicto: columna, todo a la derecha, en el centro de la altura y con 12 de hueco. Y han borrado hasta la primera runa.',
    theory:
      '<p><b>A oscuras:</b> la huella solo asoma a ratos y la tablilla está vacía. Traduce la descripción con las preguntas de siempre: ¿es flex? (<code>display</code>), ¿hacia dónde va el eje principal? (<code>flex-direction</code>), ¿dónde queda el espacio libre a lo largo de ese eje? (<code>justify-content</code>), ¿y a lo ancho, en el eje cruzado? (<code>align-items</code>), ¿qué hueco hay? (<code>gap</code>).</p>',
    objective:
      'Araña, poción y orbe en <b>columna</b>, pegados al <b>borde derecho</b>, juntos en el <b>centro vertical</b> y con <b>12px</b> entre ellos.',
    earlyHints: [
      'En columna, «a la derecha» está en el eje cruzado y «en el centro de la altura», en el eje principal.',
    ],
    hint: '<code>display: flex;</code> · <code>flex-direction: column;</code> · <code>align-items: flex-end;</code> · <code>justify-content: center;</code> · <code>gap: 12px;</code>',
    pieces: ['arana', 'pocion', 'orbe'],
    rules: [
      {
        selector: '.tablero',
        solution:
          'display: flex;\nflex-direction: column;\nalign-items: flex-end;\njustify-content: center;\ngap: 12px;',
      },
    ],
    missteps: [
      NOT_FLEX,
      {
        when: { 'flex-direction': 'column', 'justify-content': 'flex-end' },
        message:
          'Las piezas se han ido abajo: en columna, <code>justify-content</code> reparte de arriba abajo. «A la derecha» está en el eje cruzado.',
      },
      {
        when: { 'flex-direction': 'column', 'align-items': 'center' },
        message:
          'Las piezas se han ido a mitad del ancho: en columna, <code>align-items</code> mueve de lado a lado. «El centro de la altura» está en el eje principal.',
      },
    ],
  },
  {
    id: 'f6-7',
    region: 6,
    title: 'El letrero de la posada',
    showMarkup: true,
    compare: ['list-style-type'],
    hideNotice: true,
    allowed: ['display', 'gap', 'list-style', 'padding'],
    concepts: ['navegación'],
    width: 480,
    height: 270,
    speech:
      'Fuera de la ciudad hay una posada que no pregunta de dónde vienes. Su letrero es una lista, y las listas salen en columna, con viñetas y sangría. Un menú de verdad va en fila y limpio.',
    theory:
      '<p>Los menús de navegación se escriben como una <b>lista</b>: un <code>ul</code> con un <code>li</code> por enlace. De fábrica, una lista trae <b>viñetas</b> y <b>sangría</b>. Para convertirla en una barra:</p><pre>.menu {\n  display: flex;\n  list-style: none;\n  padding: 0;\n}</pre><p><code>list-style: none</code> quita las viñetas; <code>padding: 0</code>, la sangría; y <code>display: flex</code> pone los elementos en fila. Aquí el contenedor flex no es el tablero, sino la lista.</p>',
    objective: 'El menú, en fila, con <b>10px</b> de hueco, sin viñetas y sin sangría.',
    hint: '<code>display: flex;</code> · <code>gap: 10px;</code> · <code>list-style: none;</code> · <code>padding: 0;</code>',
    pieces: ['ul@menu', ['li:Camas', 'li:Cena', 'li:Establo', 'li:Salida']],
    rules: [
      { selector: '.menu', fixed: 'padding-left: 30px;', editable: false, hidden: true },
      {
        selector: '.menu li',
        fixed: 'width: auto;\nheight: auto;\npadding: 4px 12px;\noverflow: visible;',
        editable: false,
        hidden: true,
      },
      { selector: '.menu', solution: 'display: flex;\ngap: 10px;\nlist-style: none;\npadding: 0;' },
    ],
  },
  {
    id: 'f6-8',
    region: 6,
    title: 'La posada entera',
    variant: 'anidado',
    showMarkup: true,
    labels: false,
    allowed: [
      'display',
      'flex-direction',
      'justify-content',
      'align-items',
      'gap',
      'flex-grow',
      'flex',
    ],
    concepts: ['anidación', 'navegación'],
    width: 480,
    height: 340,
    speech:
      'Y esta es la posada por dentro: cabecera con el nombre y el menú, la sala y el pie. Es una página como cualquier otra de la superficie. Móntala con lo que sabes: cajas flexibles dentro de cajas flexibles.',
    theory:
      '<p>Casi cualquier página es esto: un <code>header</code>, un <code>main</code> y un <code>footer</code> en <b>columna</b>, con el <code>main</code> creciendo para ocupar lo que sobra. Y, dentro del <code>header</code>, otra caja flex en <b>fila</b>: el nombre a un lado y la navegación (<code>nav</code>) al otro.</p><p>Hazte las preguntas de siempre en cada caja, de fuera adentro: ¿es flex?, ¿hacia dónde va su eje?, ¿cómo se reparte lo que sobra?</p>',
    objective:
      'El tablero, en columna, con la sala creciendo hasta llenar el alto. En la cabecera, el nombre a la izquierda y el menú a la derecha, centrados en vertical. En el menú, los enlaces en fila con <b>12px</b> de hueco.',
    earlyHints: [
      'Son cuatro cajas: el tablero (columna), <code>main</code> (crece), <code>header</code> (fila, a los extremos) y <code>nav</code> (fila, con hueco).',
    ],
    hint: '<code>.tablero</code>: <code>display: flex;</code> y <code>flex-direction: column;</code> · <code>header</code>: <code>display: flex;</code>, <code>justify-content: space-between;</code> y <code>align-items: center;</code> · <code>nav</code>: <code>display: flex;</code> y <code>gap: 12px;</code> · <code>main</code>: <code>flex-grow: 1;</code>',
    pieces: [
      'header',
      ['div@nombre:La Seta Dorada', 'nav', ['a:Camas', 'a:Cena', 'a:Establo']],
      'main:Sala común',
      'footer:Abierto hasta que cante el murciélago',
    ],
    rules: [
      {
        selector: '.pieza',
        fixed: 'width: auto;\nheight: auto;\npadding: 6px 10px;',
        editable: false,
        hidden: true,
      },
      { selector: '.tablero', solution: 'display: flex;\nflex-direction: column;' },
      {
        selector: 'header',
        solution: 'display: flex;\njustify-content: space-between;\nalign-items: center;',
      },
      { selector: 'nav', solution: 'display: flex;\ngap: 12px;' },
      { selector: 'main', solution: 'flex-grow: 1;' },
    ],
    farewell:
      'Bien hecho. Sal de la ciudad antes de que las matriarcas se den cuenta. Al norte están las catacumbas de los viejos reyes enanos; allí no hay drow… solo fantasmas.',
  },
  //Region 7 · CATACUMBAS DE LOS REYES
  {
    id: 'f7-1',
    region: 7,
    title: 'El panteón ordenado',
    allowed: ['flex-wrap', 'justify-content', 'align-content'],
    concepts: [],
    speech:
      '¡Uuuh! Tranquila, no muerdo: soy Bramdur, rey de estas salas desde hace seiscientos años. Mis antepasados descansan en filas, y quiero aire alrededor de cada lápida, también entre filas. Hasta un fantasma necesita su espacio.',
    theory:
      '<p><code>justify-content</code> reparte dentro de cada línea; <code>align-content</code>, entre líneas. Los dos admiten los mismos repartos: <code>space-around</code>, <code>space-between</code>, <code>space-evenly</code>…</p>',
    objective:
      'Ocho lápidas en filas que saltan de línea; aire alrededor de cada una en horizontal y también alrededor de cada fila.',
    earlyHints: [
      'Dos repartos con el mismo nombre: uno dentro de cada fila y otro entre filas. ¿Qué runa se encarga de cada uno?',
    ],
    hint: '<code>flex-wrap: wrap;</code> · <code>justify-content: space-around;</code> · <code>align-content: space-around;</code>',
    pieces: repeatItem('lapida', 8),
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: flex;',
        solution: 'flex-wrap: wrap;\njustify-content: space-around;\nalign-content: space-around;',
      },
    ],
    width: 380,
    height: 380,
  },
  {
    id: 'f7-2',
    region: 7,
    title: 'Ofrendas de tres en tres',
    allowed: ['flex', 'flex-basis', 'flex-grow', 'flex-shrink'],
    concepts: ['shorthand'],
    width: 400,
    height: 260,
    speech:
      'Las ofrendas a los reyes se ponen de tres en tres, cada fila llena de pared a pared. Así lo mandaba mi abuelo, y mi abuelo daba mucho miedo. Ahora da más.',
    theory:
      '<p>Con <code>flex-wrap</code> y una base en porcentaje se consigue un efecto de rejilla: <code>flex: 1 1 30%</code> hace que quepan tres por línea y que crezcan hasta llenarla. Es la base de muchas galerías de tarjetas.</p>',
    objective: 'Seis gemas en dos filas de tres; cada fila, llena de borde a borde.',
    earlyHints: [
      'Tres por fila: cada gema parte de algo menos de un tercio del ancho, porque hay que dejar sitio a los huecos, y crece hasta llenar su fila.',
    ],
    hint: '<code>.gema { flex: 1 1 30%; }</code>',
    pieces: repeatItem('gema', 6),
    rules: [
      boardRule('display: flex;\nflex-wrap: wrap;\ngap: 10px;'),
      { selector: '.gema', solution: 'flex: 1 1 30%;' },
    ],
  },
  {
    id: 'f7-3',
    region: 7,
    title: 'Los bustos de los reyes',
    allowed: ['flex-grow', 'max-width', 'justify-content'],
    concepts: ['espacio libre'],
    width: 520,
    height: 200,
    speech:
      'Los bustos de mis antepasados crecen para lucirse… pero ninguno más de 90 palmos, que el más alto fue el mío y no pienso compartir el récord. Y en el centro de la sala.',
    theory:
      '<p><code>max-width</code> pone <b>techo</b> al crecimiento. Si los elementos llegan a su máximo y aún sobra espacio, ese resto lo reparte <code>justify-content</code>.</p>',
    objective: 'Cuatro bustos que crecen hasta 90px de ancho y quedan juntos en el centro.',
    earlyHints: [
      'Primero haz crecer los bustos y ponles techo. Cuando ya no puedan crecer más, vuelve a sobrar espacio: ¿quién lo reparte?',
    ],
    hint: '<code>.busto { flex-grow: 1; max-width: 90px; }</code> · <code>justify-content: center;</code>',
    pieces: repeatItem('busto', 4),
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: flex;\ngap: 10px;',
        solution: 'justify-content: center;',
      },
      { selector: '.busto', solution: 'flex-grow: 1;\nmax-width: 90px;' },
    ],
  },
  {
    id: 'f7-4',
    region: 7,
    title: 'El trono del rey fantasma',
    allowed: ['align-items', 'gap', 'row-gap', 'order'],
    concepts: ['reverse'],
    width: 300,
    height: 360,
    speech:
      'Mi trono está en lo alto de la escalinata. Los escalones crecen desde el suelo, centrados y con seis de hueco, y mi corona encima de todo. Aunque ya no tenga cabeza donde ponerla.',
    theory:
      '<p>Con <code>column-reverse</code> la columna se apila desde abajo. Si además le das a un elemento un <code>order</code> mayor, acabará el <b>último</b>… es decir, arriba del todo.</p>',
    objective:
      'Tres escalones apilados desde abajo, centrados y con 6px de hueco; la corona, encima de todos.',
    earlyHints: [
      'La columna ya está del revés: su eje principal nace abajo. La corona es la primera en el HTML, así que ahora mismo queda debajo de todo. ¿Qué runa la manda al final del eje?',
    ],
    hint: '<code>align-items: center;</code> · <code>gap: 6px;</code> · <code>.corona { order: 1; }</code>',
    pieces: ['corona', 'escalon', 'escalon', 'escalon'],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: flex;\nflex-direction: column-reverse;',
        solution: 'align-items: center;\ngap: 6px;',
      },
      { selector: '.corona', solution: 'order: 1;' },
    ],
  },
  {
    id: 'f7-5',
    region: 7,
    title: 'Antes de que despierten',
    variant: 'contra reloj',
    timeLimit: 75,
    className: 'fantasmal',
    allowed: ['display', 'flex-wrap', 'justify-content', 'gap', 'flex-basis', 'flex'],
    concepts: [],
    width: 420,
    height: 350,
    timeMessages: {
      expired:
        'Los fantasmas de la cripta se han despertado. <button type="button" class="text-link" id="p-sacudir">Espántalos</button> y vuelve a intentarlo.',
      late: 'Superado, aunque despertaste a medio panteón. Repítelo a tiempo y sin pistas para dominarlo.',
    },
    speech:
      'Shhh… mis primos duermen. Rápido y sin ruido: el sarcófago real ocupa él solo toda la primera fila, y los cuatro cirios debajo, centrados y con doce de hueco. La cripta está tal cual la dejaron: ni siquiera es flex. Si se despiertan, querrán contarte su vida entera. Y fue muy larga.',
    theory:
      '<p><b>Contra reloj:</b> el último ensayo antes de la Bóveda, con la tablilla vacía. Repasa las preguntas antes de escribir: ¿es flex?, ¿cabe todo en una línea?, ¿cómo se reparte cada línea?, ¿qué hueco hay?, ¿alguna pieza va por libre?</p><p>La pieza que va por libre es el sarcófago. Como en las ofrendas, la base en porcentaje decide cuántos caben por línea: con <code>flex-basis: 100%</code>, un elemento ocupa <b>toda una línea</b> y el resto salta a la siguiente.</p>',
    objective:
      'El sarcófago ocupa solo toda la primera fila; los cuatro cirios, en la fila de abajo, centrados y con 12px de hueco.',
    earlyHints: [
      'Si el sarcófago parte de todo el ancho, no cabe nadie más en su línea… siempre que las líneas puedan saltar.',
    ],
    hint: '<code>display: flex;</code> · <code>flex-wrap: wrap;</code> · <code>justify-content: center;</code> · <code>gap: 12px;</code> · <code>.sarcofago { flex-basis: 100%; }</code>',
    pieces: ['sarcofago', 'cirio', 'cirio', 'cirio', 'cirio'],
    rules: [
      {
        selector: '.tablero',
        solution: 'display: flex;\nflex-wrap: wrap;\njustify-content: center;\ngap: 12px;',
      },
      { selector: '.sarcofago', solution: 'flex-basis: 100%;' },
    ],
    missteps: [NOT_FLEX],
    farewell:
      'Ni un ruido. Pasa a la Gran Bóveda: la guardiana de piedra te espera desde antes de que yo naciera… y eso es mucho decir.',
  },
  //Region 8 · LA GRAN BÓVEDA (prueba)
  {
    id: 'f8-1',
    region: 8,
    title: 'La guardia de piedra',
    exam: true,
    allowed: FLEX_ALL,
    width: 300,
    height: 380,
    speech:
      'Has cruzado minas, lagos y catacumbas. Enanos, gnomos y hasta drow han oído hablar de ti. Pero nadie entra en la Bóveda sin demostrar que domina las runas flexibles. Primero, mi guardia.',
    theory: '',
    hint: '',
    objective:
      'Columna. La primera pieza pegada arriba, la última pegada abajo y las demás repartidas entre medias. Todas centradas en horizontal.',
    pieces: ['guardia', 'antorcha', 'guardia', 'antorcha', 'guardia'],
    rules: [
      {
        selector: '.tablero',
        solution:
          'display: flex;\nflex-direction: column;\njustify-content: space-between;\nalign-items: center;',
      },
    ],
  },
  {
    id: 'f8-2',
    region: 8,
    title: 'El tesoro de la Bóveda',
    exam: true,
    allowed: FLEX_ALL,
    width: 380,
    height: 320,
    speech:
      'El tesoro de los pueblos del subsuelo, ordenado como merece: en filas centradas, recogidas arriba, y con diez de hueco.',
    theory: '',
    hint: '',
    objective:
      'Siete gemas en filas que saltan de línea, centradas en horizontal. Las filas, juntas arriba. 10px de hueco en las dos direcciones.',
    pieces: repeatItem('gema', 7),
    rules: [
      {
        selector: '.tablero',
        solution:
          'display: flex;\nflex-wrap: wrap;\njustify-content: center;\nalign-content: flex-start;\ngap: 10px;',
      },
    ],
  },
  {
    id: 'f8-3',
    region: 8,
    title: 'La mesa del consejo',
    exam: true,
    allowed: FLEX_ALL,
    width: 460,
    height: 220,
    speech:
      'Aquí se sientan enanos, gnomos y fúngidos para firmar la paz. La mesa llena la sala; el estandarte de los enanos ondea arriba, porque fueron ellos quienes tallaron la Bóveda.',
    theory: '',
    hint: '',
    objective:
      'Fila con 8px de hueco y todo apoyado abajo. La mesa crece hasta llenar el hueco. El estandarte <b>a</b>, arriba.',
    pieces: ['estandarte@a', 'mesa', 'estandarte@b'],
    rules: [
      { selector: '.tablero', solution: 'display: flex;\nalign-items: flex-end;\ngap: 8px;' },
      { selector: '.mesa', solution: 'flex-grow: 1;' },
      { selector: '.a', solution: 'align-self: flex-start;' },
    ],
  },
  {
    id: 'f8-4',
    region: 8,
    title: 'La puerta secreta',
    exam: true,
    allowed: FLEX_ALL,
    width: 460,
    height: 200,
    speech:
      'La llave de la Bóveda va la primera y bien apartada de las runas. Sin tocar el HTML: las runas flexibles no se tallan dos veces.',
    theory: '',
    hint: '',
    objective:
      'Fila con 10px de hueco. La llave, la primera por la izquierda; las tres runas, juntas y pegadas a la derecha.',
    pieces: ['runa@uno', 'runa@dos', 'runa@tres', 'llave'],
    rules: [
      { selector: '.tablero', solution: 'display: flex;\ngap: 10px;' },
      { selector: '.llave', solution: 'order: -1;\nmargin-right: auto;' },
    ],
  },
  {
    id: 'f8-5',
    region: 8,
    title: 'La bóveda anidada',
    exam: true,
    allowed: FLEX_ALL,
    width: 380,
    height: 340,
    speech:
      'La última prueba: los dos arcones, uno encima del otro, y dentro de cada uno sus gemas. Si lo consigues, la Bóveda te reconocerá como maestra de las runas flexibles.',
    theory: '',
    hint: '',
    objective:
      'Dos arcones en columna, con 12px de hueco, que se reparten toda la altura. Dentro de cada arcón, las tres gemas en fila, repartidas con aire alrededor y centradas en vertical.',
    pieces: ['arcon', ['gema', 'gema', 'gema'], 'arcon', ['gema', 'gema', 'gema']],
    rules: [
      { selector: '.tablero', solution: 'display: flex;\nflex-direction: column;\ngap: 12px;' },
      {
        selector: '.arcon',
        solution:
          'flex-grow: 1;\ndisplay: flex;\njustify-content: space-around;\nalign-items: center;',
      },
    ],
  },
  // ─────────────────────────────── SECRETOS
  {
    id: 'fS-1',
    region: 9,
    title: 'La siesta del dragón',
    landmark: 'moneda',
    variant: 'secreto',
    terrain: 'forja',
    character: 'Brasaescama',
    role: 'el dragón dormilón',
    portrait: 'pj-fs1',
    secret: {
      x: 0.885,
      y: 0.13,
      width: 0.12,
      drawing: 'dragon',
      hint: 'En el rincón noreste, algo enorme ronca sobre un montón de oro.',
    },
    allowed: ['flex-wrap', 'justify-content', 'align-content'],
    concepts: ['reverse'],
    speech:
      'Zzz… ¿Quién osa…? Bah, da igual. Si vas a tocar mi tesoro, al menos apílalo bien: desde el suelo hacia arriba, centrado y recogido abajo. Zzz…',
    theory:
      '<p>Con <code>wrap-reverse</code> el inicio del eje cruzado pasa a estar <b>abajo</b>. Por eso <code>align-content: flex-start</code> recoge las líneas en el suelo.</p>',
    objective:
      'Nueve monedas en un montón: la fila más larga abajo, la siguiente encima, todo centrado y apoyado en el suelo.',
    hint: '<code>flex-wrap: wrap-reverse;</code> · <code>justify-content: center;</code> · <code>align-content: flex-start;</code>',
    pieces: repeatItem('moneda', 9),
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: flex;\ngap: 6px;',
        solution: 'flex-wrap: wrap-reverse;\njustify-content: center;\nalign-content: flex-start;',
      },
    ],
    width: 380,
    height: 320,
    farewell: 'Zzz… bien apilado. Llévate una moneda. Solo una. Las tengo contadas. Zzz.',
  },
  {
    id: 'fS-2',
    region: 9,
    title: 'El taller de Tuerquín',
    landmark: 'engranaje',
    variant: 'secreto',
    terrain: 'forja',
    character: 'Tuerquín',
    role: 'el gnomo inventor',
    portrait: 'pj-fs2',
    secret: {
      x: 0.715,
      y: 0.5,
      width: 0.11,
      drawing: 'taller',
      hint: 'En plena roca, entre el río luminoso y los cristales, sale vapor de una grieta. Alguien inventa cosas ahí dentro.',
    },
    allowed: ['flex-shrink'],
    concepts: ['espacio libre'],
    speech:
      '¡Eureka! Bueno, casi. Mi máquina no cabe en el taller. El engranaje grande no puede encoger ni un pelo, y el pequeño debe encoger el doble que el mediano. ¡Ciencia!',
    theory:
      '<p>Al encoger, cada elemento cede en proporción a su <code>flex-shrink</code> <b>multiplicado por su tamaño de partida</b>. Con <code>0</code> no cede nada.</p>',
    objective:
      'El engranaje grande conserva sus 160px; el pequeño encoge con el doble de fuerza que el mediano.',
    hint: '<code>.grande { flex-shrink: 0 }</code> · <code>.peque { flex-shrink: 2 }</code>',
    pieces: ['engranaje@grande', 'engranaje@mediano', 'engranaje@peque'],
    rules: [
      boardRule('display: flex;\ngap: 8px;\nalign-items: center;'),
      { selector: '.grande', fixed: 'width: 160px;', solution: 'flex-shrink: 0;' },
      { selector: '.mediano', fixed: 'width: 120px;', editable: false },
      { selector: '.peque', fixed: 'width: 120px;', solution: 'flex-shrink: 2;' },
    ],
    width: 340,
    height: 200,
    farewell: '¡Funciona! ¡Funciona! Apunta en tu cuaderno: «el gnomo tenía razón». Otra vez.',
  },
  {
    id: 'fS-3',
    region: 9,
    title: 'El gusano colosal',
    landmark: 'serpiente',
    variant: 'secreto',
    terrain: 'abismo',
    character: 'Gusarapo',
    role: 'el gusano colosal',
    portrait: 'pj-fs3',
    secret: {
      x: 0.35,
      y: 0.62,
      width: 0.11,
      drawing: 'gusano',
      hint: 'Entre la ciudad drow y la Bóveda, la roca está agujereada… y algo se mueve dentro.',
    },
    allowed: ['flex-direction', 'align-self'],
    concepts: ['reverse'],
    speech:
      'Grrmmm… me he dado la vuelta al excavar y ahora llevo la cabeza detrás. Dame la vuelta: cabeza a la izquierda, asomando por arriba, y el cuerpo arrastrándose por el suelo.',
    theory:
      '<p>Recuerda: <code>row-reverse</code> invierte el orden, y <code>align-self</code> saca a un elemento de la alineación de los demás.</p>',
    objective:
      'La cabeza, la primera por la izquierda y pegada arriba; el cuerpo y la cola detrás, apoyados abajo, todo pegado a la derecha.',
    hint: '<code>flex-direction: row-reverse;</code> · <code>.testa { align-self: flex-start; }</code>',
    pieces: ['segmento@cola', 'segmento', 'segmento', 'segmento', 'testa'],
    rules: [
      {
        selector: '.tablero',
        fixed: 'display: flex;\nalign-items: flex-end;',
        solution: 'flex-direction: row-reverse;',
      },
      { selector: '.testa', solution: 'align-self: flex-start;' },
    ],
    width: 460,
    height: 220,
    farewell:
      'Grrmmm… ¡mucho mejor! Ahora veo por dónde excavo. Si oyes temblar la mina, saluda: seré yo.',
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
      'a oscuras',
      'regateo',
      'musical',
      'túnel cambiante',
      'anidado',
    ],
  ],
  [
    'Contenedor',
    ['display', 'flex-direction', 'flex-wrap', 'flex-flow', 'gap', 'row-gap', 'column-gap'],
  ],
  [
    'Alineación',
    [
      'justify-content',
      'align-items',
      'align-content',
      'align-self',
      'margin',
      'margin-left',
      'margin-right',
      'margin-top',
      'margin-bottom',
    ],
  ],
  [
    'Tamaño flexible',
    ['flex-grow', 'flex-shrink', 'flex-basis', 'flex', 'width', 'max-width', 'min-width'],
  ],
  ['Listas', ['list-style', 'padding']],
  ['Orden', ['order']],
  [
    'Conceptos',
    [
      'eje principal',
      'eje cruzado',
      'espacio libre',
      'reverse',
      'baseline',
      'margin auto',
      'anidación',
      '%',
      'navegación',
      'shorthand',
    ],
  ],
];

export const flexWorld: WorldContent = {
  id: 'flex',
  name: 'El Subsuelo Flexible',
  mapTitle: 'Mapa del subsuelo',
  topic: 'Flexbox',
  card: { tech: 'Flexbox · bajo tierra', className: 'is-underground' },
  regions: flexRegions,
  pieceTypes: flexPieceTypes,
  filters,
  lessons: flexLevels,
};
