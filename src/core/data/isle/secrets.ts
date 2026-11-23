/** The isle's newer secret places, off the trail. Player-facing copy stays in Spanish. */
import type { LevelDraft, PieceTypeMap } from '../../models';
import { fixed, GAP, hidden, ISLE, inRow } from './helpers';

/** Piece types only this file uses; merged into the isle's own. */
export const pieceTypes: PieceTypeMap = {};

export const lessons: LevelDraft[] = [
  {
    id: 'bS-4',
    region: ISLE.secrets,
    title: 'La cueva de los números',
    landmark: 'gema',
    variant: 'secreto',
    terrain: 'imprenta',
    character: 'Ábaco',
    role: 'el ermitaño que lo cuenta todo',
    portrait: 'pj-bs4',
    secret: {
      x: 0.873,
      y: 0.577,
      width: 0.05,
      drawing: 'cueva',
      hint: 'En la isla del faro, entre los picos, se abre una boca negra. Si pegas la oreja, alguien dentro cuenta en voz alta… y siempre vuelve a empezar.',
    },
    showMarkup: true,
    width: 440,
    height: 360,
    allowed: ['counter-reset', 'counter-increment', 'content'],
    concepts: ['contadores', '::before'],
    speech:
      '…cuarenta y uno, cuarenta y dos… ¡Ah, visita! No me distraigas, que pierdo la cuenta. Llevo treinta años numerando esta cueva a mano y cada vez que se cae una estalagmita tengo que reescribirlo todo. Dicen que el CSS sabe contar solo. Enséñame. Y cada galería empieza desde uno, que son galerías distintas.',
    theory:
      '<p>El CSS tiene <b>contadores</b>: números que el navegador lleva por ti. Hacen falta tres piezas:</p><ul><li><code>counter-reset: piedra;</code> crea el contador (y lo pone a cero) en un elemento. Cada vez que aparece ese elemento, la cuenta <b>vuelve a empezar</b>.</li><li><code>counter-increment: piedra;</code> le suma uno cada vez que aparece el elemento que lo lleva.</li><li><code>content: counter(piedra) ". ";</code> en un <code>::before</code> <b>escribe</b> el número delante del texto.</li></ul><pre>.galeria { counter-reset: piedra; }\n.galeria p::before {\n  counter-increment: piedra;\n  content: counter(piedra) ". ";\n}</pre><p>Así numeran los navegadores las listas <code>ol</code>, por dentro.</p>',
    objective:
      'Cada piedra de cada galería, numerada delante de su nombre: <b>1. 2. 3.</b>… Y cada <code>.galeria</code> vuelve a empezar desde uno.',
    earlyHints: [
      'El contador se crea (y se reinicia) en la galería; se incrementa y se escribe en el <code>::before</code> de cada párrafo.',
    ],
    hint: 'En <code>.galeria</code>: <code>counter-reset: piedra;</code>. En <code>.galeria p::before</code>: <code>counter-increment: piedra;</code> y <code>content: counter(piedra) ". ";</code>',
    pieces: [
      'section@galeria',
      ['p:Estalagmita gorda', 'p:Estalagmita fina', 'p:Murciélago dormido'],
      'section@galeria',
      ['p:Charco que suena', 'p:Eco'],
    ],
    checks: [
      { pattern: /counter-reset/, message: 'Crea el contador con <code>counter-reset</code>' },
      { pattern: /counter-increment/, message: 'Súmale uno con <code>counter-increment</code>' },
      { pattern: /counter\(/, message: 'Escribe el número con <code>content: counter(…)</code>' },
    ],
    rules: [
      hidden('.galeria', 'padding: 8px 10px;\nmargin-bottom: 10px;\nborder: 2px dashed #8a6a40;'),
      hidden('.galeria p', 'width: fit-content;\nmargin: 0 0 6px;'),
      { selector: '.galeria', solution: 'counter-reset: piedra;' },
      {
        selector: '.galeria p::before',
        solution: 'counter-increment: piedra;\ncontent: counter(piedra) ". ";',
      },
    ],
    farewell:
      '…uno, dos, tres… ¡y otra vez uno! Treinta años contando y resulta que la cueva sabía hacerlo sola. Bueno. Ahora contaré otra cosa: las veces que me lo agradezco. Una.',
  },
  {
    id: 'bS-5',
    region: ISLE.secrets,
    title: 'El pozo redondo',
    landmark: 'pozo',
    variant: 'secreto',
    terrain: 'biblioteca',
    character: 'Brocal',
    role: 'el zahorí',
    portrait: 'pj-bs5',
    secret: {
      x: 0.273,
      y: 0.639,
      width: 0.045,
      drawing: 'pozo',
      hint: 'En la isla del bosque, la de la biblioteca, hay un claro con un pozo viejo. Nadie sabe quién lo cavó, pero todo el mundo sabe que no es redondo.',
    },
    width: 460,
    height: 260,
    allowed: ['aspect-ratio'],
    concepts: [],
    speech:
      'Con esta varita encuentro agua en cualquier sitio. Lo que no encuentro es un albañil que me haga un pozo redondo: me lo dejan siempre chato, como un plato. El ancho ya lo tienen. El alto, que lo saquen solos de la proporción. Y de paso, la ventana del cobertizo, que también me la dejaron aplastada.',
    theory:
      '<p><code>aspect-ratio</code> fija la <b>proporción</b> de una caja: ancho entre alto. Si le das el ancho, el alto <b>se calcula solo</b>.</p><pre>aspect-ratio: 1;\naspect-ratio: 16 / 9;\naspect-ratio: 3 / 2;</pre><p><code>1</code> es un cuadrado; <code>16 / 9</code>, la forma de una pantalla.</p><p>Si cambia el ancho, el alto lo sigue, sin hacer cuentas. Solo manda cuando la altura no está escrita: un <code>height</code> explícito gana.</p>',
    objective:
      'El pozo, tan alto como ancho: un círculo perfecto. La ventana, en proporción <b>3 / 2</b>.',
    hint: '<code>aspect-ratio: 1;</code> en <code>.pozo</code> y <code>aspect-ratio: 3 / 2;</code> en <code>.ventana</code>.',
    pieces: ['div@pozo', 'div@ventana'],
    missteps: [
      {
        selector: '.ventana',
        when: { 'aspect-ratio': '2 / 3' },
        message:
          'La ventana ha salido de pie. La proporción es <b>ancho / alto</b>: primero el ancho.',
      },
    ],
    rules: [
      inRow('.pieza'),
      fixed(
        '.pozo',
        'width: 130px;\nborder: 10px solid slategray;\nborder-radius: 50%;\nbackground-color: #6a9ac0;',
      ),
      fixed(
        '.ventana',
        'width: 150px;\nborder: 8px solid sienna;\nbackground-color: lightskyblue;',
      ),
      { selector: '.pozo', solution: 'aspect-ratio: 1;' },
      { selector: '.ventana', solution: 'aspect-ratio: 3 / 2;' },
    ],
    farewell:
      '¡Redondo como una moneda! Ahora sí: tiro la piedra y suena a agua, no a plato. Si algún día te pierdes en el bosque, ven al pozo. No te encontraré, pero te daré de beber.',
  },
  {
    id: 'bS-6',
    region: ISLE.secrets,
    title: 'La esquina de la cartógrafa',
    landmark: 'mapa',
    variant: 'secreto',
    terrain: 'canal',
    character: 'Rumbo',
    role: 'la cartógrafa que dibujó este mapa',
    portrait: 'pj-bs6',
    secret: {
      x: 0.035,
      y: 0.93,
      width: 0.05,
      drawing: 'cartografo',
      hint: 'En el mismísimo borde de la carta, en la esquina del suroeste, alguien ha plantado una tienda diminuta. Desde ahí se ve todo el mapa… porque está dentro del mapa.',
    },
    width: 440,
    height: 320,
    allowed: ['writing-mode', 'text-orientation'],
    concepts: [],
    speech:
      '¿Me has encontrado? Qué vergüenza: estoy en el margen, terminando este mismo mapa que estás mirando. Me falta rotular las costas. En los márgenes de una carta los nombres van de pie, a lo largo del borde, no tumbados como en un libro. El del oeste, girado. El del este, con las letras una encima de otra, como en los mapas viejos.',
    theory:
      '<p><code>writing-mode</code> cambia la <b>dirección en que se escribe</b>:</p><ul><li><code>horizontal-tb</code>: la de siempre, líneas horizontales de arriba abajo.</li><li><code>vertical-rl</code>: líneas verticales, de derecha a izquierda (como el japonés tradicional). El texto queda <b>girado</b>.</li><li><code>vertical-lr</code>: verticales, de izquierda a derecha.</li></ul><p>Con el texto en vertical, <code>text-orientation: upright;</code> pone cada letra <b>derecha</b>, una debajo de otra.</p><p>Fíjate en que la caja también gira: lo que era ancho ahora es alto.</p>',
    objective:
      'El rótulo del oeste, en vertical (<code>vertical-rl</code>). El del este, también en vertical, pero con las letras de pie, una debajo de otra. El título se queda como está.',
    hint: '<code>writing-mode: vertical-rl;</code> en <code>.oeste</code>. En <code>.este</code>: <code>writing-mode: vertical-rl;</code> y <code>text-orientation: upright;</code>',
    pieces: [
      'p@rotulo.oeste:Mar del Oeste',
      'p@titulo:Carta de la Isla',
      'p@rotulo.este:Costa Este',
    ],
    rules: [
      inRow('.pieza'),
      hidden(
        '.pieza',
        'padding: 6px 8px;\nborder: 2px solid #8a6a40;\nfont-family: Georgia, serif;\nletter-spacing: 2px;',
      ),
      { selector: '.oeste', solution: 'writing-mode: vertical-rl;' },
      { selector: '.este', solution: 'writing-mode: vertical-rl;\ntext-orientation: upright;' },
    ],
    farewell:
      'Listo: «Costa Este» de pie, como un faro de letras. Ahora vuelve al mapa y mira los márgenes… ¿ves? Ya están. Y si ves una tienda diminuta en una esquina, no me saludes, que se me mueve el pulso.',
  },
  {
    id: 'bS-7',
    region: ISLE.secrets,
    title: 'El faro viejo',
    landmark: 'faro',
    variant: 'secreto',
    terrain: 'farola',
    character: 'Don Sepia',
    role: 'el farero jubilado',
    portrait: 'pj-bs7',
    secret: {
      x: 0.261,
      y: 0.053,
      width: 0.05,
      drawing: 'faroviejo',
      hint: 'Frente a la costa norte, sobre una roca, quedan las ruinas de un faro sin color, como si se hubiera quedado en una foto antigua.',
    },
    width: 480,
    height: 200,
    allowed: ['filter'],
    compare: ['filter'],
    concepts: [],
    speech:
      'Este era mi faro antes de que construyeran el nuevo, el de Fanal. Quiero colgar tres cuadros en la pared para no olvidarlo: uno amarillento, como las fotos de mi abuelo; otro en blanco y negro, que es más serio; y el último, el del día que me jubilé, amarillento y un poco borroso. Por la emoción.',
    theory:
      '<p><code>filter</code> aplica <b>efectos de imagen</b> a un elemento entero, con todo lo que lleva dentro:</p><ul><li><code>sepia(1)</code>: tono de foto antigua (de <code>0</code> a <code>1</code>).</li><li><code>grayscale(1)</code>: en blanco y negro.</li><li><code>blur(2px)</code>: desenfocado.</li><li>y más: <code>brightness()</code>, <code>contrast()</code>, <code>saturate()</code>…</li></ul><p>Se pueden <b>encadenar</b> separándolos con espacios, y se aplican en orden:</p><pre>filter: sepia(1) blur(2px);</pre>',
    objective:
      '<code>.antiguo</code>: en sepia (<code>sepia(1)</code>). <code>.serio</code>: en blanco y negro (<code>grayscale(1)</code>). <code>.recuerdo</code>: en sepia y desenfocado <b>2px</b>.',
    hint: '<code>filter: sepia(1);</code> · <code>filter: grayscale(1);</code> · <code>filter: sepia(1) blur(2px);</code>',
    pieces: ['faro@antiguo', 'faro@serio', 'faro@recuerdo'],
    rules: [
      inRow('.faro'),
      hidden(
        '.faro',
        'width: 100px;\nheight: 120px;\nborder: 6px solid #8a6a40;\nbackground-color: #9fd8f0;',
      ),
      { selector: '.antiguo', solution: 'filter: sepia(1);' },
      { selector: '.serio', solution: 'filter: grayscale(1);' },
      { selector: '.recuerdo', solution: 'filter: sepia(1) blur(2px);' },
      GAP,
    ],
    farewell:
      'Qué bonitos. El borroso es el mejor: así no se nota que aquel día lloré. Si pasas por el faro nuevo, dile a Fanal que el viejo sigue aquí. Sin luz, pero con buena memoria.',
  },
  {
    id: 'bS-8',
    region: ISLE.secrets,
    title: 'La ciudad sumergida',
    landmark: 'cristal',
    variant: 'secreto',
    terrain: 'canal',
    character: 'Nautilia',
    role: 'la buzo arqueóloga',
    portrait: 'pj-bs8',
    secret: {
      x: 0.727,
      y: 0.551,
      width: 0.07,
      drawing: 'sumergida',
      hint: 'En la laguna, entre el Aula Magna y los picos del faro, cuando el agua está quieta se adivinan calles y columnas bajo la superficie…',
    },
    width: 480,
    height: 220,
    allowed: ['clip-path'],
    compare: ['clip-path'],
    concepts: [],
    speech:
      'Glub. Perdona, aquí abajo todo suena así. Llevo meses catalogando esta ciudad hundida y el museo me pide postales. Pero no quieren el cuadro entero: quieren verla como yo, a través del ojo de buey del batiscafo, redondo. Luego otra como la ve un pez, alargada. Y la última por la escotilla, que tiene las esquinas redondeadas porque el carpintero tenía miedo de cortarse.',
    theory:
      '<p><code>clip-path</code> <b>recorta</b> lo que se ve de un elemento con una forma. Lo de fuera no se pinta, pero la caja <b>sigue ocupando lo mismo</b>: no empuja ni deja de empujar a nadie.</p><ul><li><code>circle(50%)</code>: un círculo del radio que digas.</li><li><code>ellipse(50% 30%)</code>: una elipse, con su radio horizontal y vertical.</li><li><code>inset(16px round 20px)</code>: un rectángulo metido 16px hacia dentro por cada lado, con las esquinas redondeadas.</li><li><code>polygon(…)</code>: la forma que quieras, punto a punto.</li></ul><pre>clip-path: circle(50%);</pre>',
    objective:
      '<code>.ojo</code>: recortado en un círculo de radio <code>50%</code>. <code>.pez</code>: en una elipse de <code>50%</code> de ancho y <code>30%</code> de alto. <code>.escotilla</code>: con <code>inset(16px round 20px)</code>.',
    earlyHints: [
      'Las tres postales usan la misma propiedad, <code>clip-path</code>; solo cambia la forma: <code>circle()</code>, <code>ellipse()</code> e <code>inset()</code>.',
    ],
    hint: '<code>clip-path: circle(50%);</code> · <code>clip-path: ellipse(50% 30%);</code> · <code>clip-path: inset(16px round 20px);</code>',
    pieces: ['tela@ojo', 'tela@pez', 'tela@escotilla'],
    rules: [
      inRow('.tela'),
      hidden(
        '.tela',
        'width: 120px;\nheight: 120px;\nbackground-color: #2f7f8f;\nbackground-image: radial-gradient(circle at 30% 70%, #9fc4c0 0 18%, transparent 19%), radial-gradient(circle at 70% 40%, #f0a040 0 8%, transparent 9%), linear-gradient(#5fb4c8, #1f5c6c);',
      ),
      { selector: '.ojo', solution: 'clip-path: circle(50%);' },
      { selector: '.pez', solution: 'clip-path: ellipse(50% 30%);' },
      { selector: '.escotilla', solution: 'clip-path: inset(16px round 20px);' },
    ],
    farewell:
      'Glub glub: ¡preciosas! El museo las colgará en la sala de «Cosas que no hay que tocar». Si algún día bajas a la laguna, trae aletas. Y paciencia: aquí abajo todo va despacio, menos los peces.',
  },
  {
    id: 'bS-9',
    region: ISLE.secrets,
    title: 'El pecio del bergantín',
    landmark: 'barril',
    variant: 'secreto',
    terrain: 'embarcadero',
    character: 'Capitana Escora',
    role: 'la capitana del barco hundido',
    portrait: 'pj-bs9',
    secret: {
      x: 0.224,
      y: 0.419,
      width: 0.06,
      drawing: 'pecio',
      hint: 'En el rincón de la laguna que queda entre los tintes, el patio y el bosque, una sombra con forma de barco duerme bajo el agua…',
    },
    showMarkup: true,
    labels: false,
    width: 480,
    height: 440,
    allowed: ['columns', 'column-count', 'column-width', 'column-gap', 'column-rule'],
    compare: ['column-rule-style', 'column-rule-width', 'column-rule-color'],
    concepts: [],
    speech:
      'Bienvenida a bordo. Bueno, a fondo. Mi bitácora sobrevivió al naufragio, pero el agua le ha corrido las líneas y ahora es una tira larguísima que no hay pez que lea. En mis tiempos los cuadernos de bitácora se escribían en columnas, como los periódicos: tres, con un buen hueco entre ellas y una raya a trazos en medio, para no marearse leyendo.',
    theory:
      '<p>Un texto largo se puede repartir en <b>columnas</b>, como un periódico, sin tocar el HTML:</p><ul><li><code>column-count: 3;</code> lo reparte en tres columnas (o <code>column-width</code>, si prefieres decir lo que mide cada una y que quepan las que quepan).</li><li><code>columns</code> es el atajo de las dos.</li><li><code>column-gap</code> es el hueco entre columnas.</li><li><code>column-rule</code> traza una línea en el hueco, y se escribe como un borde: <code>2px dashed sienna</code>.</li></ul><p>El navegador va llenando la primera columna, sigue por la segunda y acaba en la tercera.</p>',
    objective:
      'La bitácora (<code>.bitacora</code>), repartida en <b>3</b> columnas, con <b>24px</b> de hueco y una raya de <code>2px dashed sienna</code> entre ellas.',
    earlyHints: [
      'Son tres declaraciones en <code>.bitacora</code>: cuántas columnas, cuánto hueco y qué raya va en medio.',
    ],
    hint: '<code>column-count: 3;</code>, <code>column-gap: 24px;</code> y <code>column-rule: 2px dashed sienna;</code>',
    pieces: [
      'div@bitacora',
      [
        'p:Día 1. Zarpamos con viento a favor.',
        'p:Día 2. El cocinero jura que ha visto una sirena.',
        'p:Día 3. La sirena era una foca.',
        'p:Día 4. La foca se ha llevado el timón.',
        'p:Día 5. Navegamos en círculos. Con estilo.',
        'p:Día 6. Una vía de agua. Pequeña.',
        'p:Día 7. Ya no tan pequeña.',
        'p:Día 8. Escribo esto desde el fondo. Hay buena luz.',
      ],
    ],
    rules: [
      hidden(
        '.bitacora',
        'padding: 12px;\nbackground-color: #efe2b8;\nborder: 3px solid #8a5a34;\nfont-size: 15px;',
      ),
      hidden('.bitacora p', 'margin: 0 0 8px;\nbreak-inside: avoid;'),
      {
        selector: '.bitacora',
        solution: 'column-count: 3;\ncolumn-gap: 24px;\ncolumn-rule: 2px dashed sienna;',
      },
    ],
    farewell:
      '¡Ahora sí se lee! Columna a columna, como debe ser. Si encuentras el timón, está en la foca. Y la foca, en la laguna. Tú sabrás si te merece la pena.',
  },
];
