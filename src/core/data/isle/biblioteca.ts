/** The Library of Scrolls: pseudo-elements and text that does not fit. Player-facing copy stays in Spanish. */
import type { LevelDraft, PieceTypeMap } from '../../models';
import { GAP, ISLE, hidden, pick } from './helpers';

/** Piece types only this file uses; merged into the isle's own. */
export const pieceTypes: PieceTypeMap = {};

const r = ISLE.biblioteca;
// The engine measures the pieces, not their pseudo-elements: generated text only shows up in the
// comparison when the box it lives in shrinks to fit. Labels are off (`et: false`) because the
// board's own markup label is a `::before`, and these lessons need that slot for the student.
const FIT = (selector: string) => hidden(selector, 'width: fit-content;');
/** A narrow spine whose text is allowed to spill, so what does not fit can be seen. */
const SPINE = (width: number) => hidden('.lomo', `width: ${width}px;\noverflow: visible;\ntext-align: left;`);
const ELLIPSIS = 'white-space: nowrap;\noverflow: hidden;\ntext-overflow: ellipsis;';

export const lessons: LevelDraft[] = [
  //Region 10 · LA BIBLIOTECA DE LOS PERGAMINOS
  {
    id: 'b11-1', r, n: 'Lo que no está escrito', html: true, et: false, w: 440, h: 230, ok: ['content'], c: ['::before'],
    enc: 'Chsss… Bienvenida a la biblioteca. Vienes del Observatorio, ¿verdad? Se nota: traes las medidas en los bolsillos. Aquí todo se hace en voz baja. Mira estos títulos de capítulo: a todos les falta el «Cap.» delante. Podría escribirlo a mano en cada uno… pero si mañana decido que pone «Capítulo», tendría que reescribirlos todos. Que lo escriba el CSS.',
    teo: '<p>Un <b>pseudoelemento</b> es una caja que <b>no está en el HTML</b>: la crea el CSS. <code>::before</code> la pone <b>al principio</b> del contenido del elemento, y <code>::after</code>, al final.</p><p>Sin la propiedad <code>content</code> no existen. Es la que dice <b>qué texto llevan</b>:</p><pre>.capitulo::before {\n  content: "Cap. ";\n}</pre><p>El texto va <b>entre comillas</b>, y el espacio de dentro también cuenta. Como no está en el HTML, no se puede seleccionar con el ratón: úsalo para rótulos y adornos, no para lo que importa.</p>',
    obj: 'Cada título de capítulo empieza por <code>Cap. </code> (con un espacio detrás), sin tocar el HTML.',
    pista: '<code>content: "Cap. ";</code>',
    p: ['h3@capitulo:Del margen que colapsa', 'h3@capitulo:De las notas al pie', 'h3@capitulo:De los títulos que no caben'],
    b: [FIT('.capitulo'), { s: '.capitulo::before', sol: 'content: "Cap. ";' }, GAP],
  },
  {
    id: 'b11-2', r, n: 'Citas con firma', html: true, et: false, w: 440, h: 230, ok: ['content'], c: ['::after', 'atributo'],
    enc: 'En la sala de lectura colgamos frases célebres de la isla. Pero ni una lleva firma, y una cita sin firma es un rumor. Los nombres ya están en el HTML, escondidos en un atributo de cada párrafo. Que el CSS los saque y los ponga detrás, entre paréntesis. Con buena letra.',
    teo: '<p><code>::after</code> añade su caja <b>al final</b> del contenido. Y <code>content</code> no solo admite texto fijo: puede <b>leer un atributo</b> del propio elemento con <code>attr()</code>, y encadenar trozos separados por espacios:</p><pre>.cita::after {\n  content: " (" attr(data-autor) ")";\n}</pre><p>Los atributos que empiezan por <code>data-</code> son tuyos: el HTML te deja inventarlos para guardar datos en cada elemento. Mira el HTML del tablero.</p>',
    obj: 'Detrás de cada cita, el nombre de su autor (su atributo <code>data-autor</code>) entre paréntesis y con un espacio delante, así: <i>… esquinas. (Tilde)</i>',
    pistasPrevias: ['Son tres trozos seguidos, sin comas entre ellos: el texto <code>" ("</code>, el atributo con <code>attr()</code> y el texto <code>")"</code>.'],
    pista: '<code>content: " (" attr(data-autor) ")";</code>',
    p: ['p@cita[data-autor=Tilde]:Las olas no tienen esquinas.', 'p@cita[data-autor=Hilera]:Quien no forma, no cuenta.', 'p@cita[data-autor=Remo]:El agua nunca tiene prisa.'],
    b: [FIT('.cita'), { s: '.cita::after', sol: 'content: " (" attr(data-autor) ")";' }, GAP],
  },
  {
    id: 'b11-3', r, n: 'Cintas de punto de libro', html: true, et: false, w: 440, h: 220, ok: ['content', 'display'], c: ['::before', 'bloque y en línea'],
    enc: 'Cada estante lleva una cinta roja delante del título, para encontrarlo a tientas. Ya tengo escrito cuánto mide la cinta y de qué color es… y no aparece. Le falta lo mismo que a todo en esta vida: existir. Y, después, que la dejen tener medidas.',
    teo: '<p>Un pseudoelemento sin <code>content</code> <b>no se dibuja</b>, aunque tenga ancho, alto y color. Para una caja decorativa sin texto se usa la <b>cadena vacía</b>:</p><pre>content: "";</pre><p>Y como <code>::before</code> va <b>en línea</b> de fábrica, ignora <code>width</code> y <code>height</code>: lo viste en el Canal. Con <code>display: inline-block</code> se convierte en una cajita con medidas que sigue en la misma línea que el texto.</p><p>Así se dibujan viñetas, iconos y adornos sin añadir ni una etiqueta al HTML.</p>',
    obj: 'Una cinta <code>crimson</code> de <b>14px × 14px</b> delante de cada título, en la misma línea.',
    pistasPrevias: ['Las medidas y el color ya están escritos. Faltan dos cosas: que la cinta exista y que acepte medidas.'],
    pista: '<code>content: "";</code> y <code>display: inline-block;</code>',
    p: ['h3@estante:Astronomía', 'h3@estante:Cajas y márgenes', 'h3@estante:Tintas raras'],
    b: [FIT('.estante'), { s: '.estante::before', f: 'width: 14px;\nheight: 14px;\nmargin-right: 8px;\nbackground-color: crimson;', sol: 'content: "";\ndisplay: inline-block;' }, GAP],
  },
  {
    id: 'b11-4', r, n: 'La primera línea manda', esp: 'escribe el selector', html: true, et: false, w: 440, h: 340, ok: [], c: ['::first-line'],
    enc: 'En los libros antiguos, la primera línea de cada crónica va más grande y en mayúsculas, para que el ojo sepa dónde empezar. El problema es que yo no sé dónde acaba la primera línea: depende del ancho de la página. Menos mal que el navegador sí lo sabe. Las declaraciones ya están; dime a quién van.',
    teo: '<p><code>::first-line</code> selecciona <b>la primera línea</b> tal como se ve en pantalla. Si la caja se estrecha, esa línea tiene menos palabras y el estilo se va con ellas: ninguna etiqueta del HTML podría hacer eso.</p><pre>.cronica::first-line { … }</pre><p>Solo admite propiedades del <b>texto</b>: letra, color, fondo, mayúsculas, espaciado… Tiene un hermano, <code>::first-letter</code>, que dicen que alguien usa para escribir cartas. En botellas.</p>',
    obj: 'Solo la <b>primera línea</b> de cada crónica, a 20px y en mayúsculas. La nota no cambia.',
    pista: '<code>.cronica::first-line</code>',
    p: ['p@cronica:En el año de la gran marea, los márgenes de la isla colapsaron y nadie supo decir cuál de los dos ganaba.', 'p@nota:Nota: este libro no se presta.', 'p@cronica:Al día siguiente vino la sargenta, contó a todos los vecinos y le salieron siete.'],
    req: [{ sel: true, re: /::first-line/, m: 'Usa el pseudoelemento <code>::first-line</code>' }],
    b: [hidden('.cronica', 'width: 330px;'), pick('.cronica::first-line', 'font-size: 20px;\ntext-transform: uppercase;'), GAP],
  },
  {
    id: 'b11-5', r, n: 'El lomo del libro', et: false, w: 440, h: 230, ok: ['white-space'], cmp: ['white-space'], c: ['white-space', 'texto que no cabe'],
    enc: 'El lomo de un libro es estrecho, y el título tiene que leerse de una tirada, sin partirse en renglones. Aquí los títulos largos se me doblan como servilletas. Que no salten de línea, pase lo que pase. (Sí, se van a salir del lomo. Paciencia: cada cosa a su tiempo.)',
    teo: '<p>El texto salta de línea él solo, por los espacios, cuando no le cabe. <code>white-space</code> decide si puede hacerlo:</p><ul><li><code>normal</code>: salta cuando hace falta (lo de fábrica).</li><li><code>nowrap</code>: <b>nunca</b> salta; todo en un renglón, quepa o no.</li><li><code>pre</code>: respeta los espacios y los saltos tal como están en el HTML, como en un poema.</li></ul><p>Lo que no cabe <b>se desborda</b>: asoma por el borde de la caja.</p>',
    obj: 'Cada título, en <b>un solo renglón</b>, aunque se salga del lomo.',
    pista: '<code>white-space: nowrap;</code>',
    p: ['div@lomo:Tratado de los márgenes que se juntan', 'div@lomo:Cien recetas con tinta', 'div@lomo:Memorias de una caja sin box-sizing'],
    b: [SPINE(190), { s: '.lomo', sol: 'white-space: nowrap;' }, GAP],
  },
  {
    id: 'b11-6', r, n: 'Los tres puntos', et: false, w: 440, h: 230, ok: ['white-space', 'overflow', 'overflow-x', 'text-overflow'], cmp: ['white-space', 'overflow-x', 'text-overflow'], c: ['text-overflow', 'texto que no cabe'],
    enc: 'Ahora sí. Un título que se sale del lomo es una falta de respeto al libro de al lado. Que no se salga: lo que no quepa, se corta, y en el corte, tres puntitos, para que se sepa que hay más. Como en los buenos chismes.',
    teo: '<p>Los puntos suspensivos de CSS necesitan <b>tres propiedades a la vez</b>, y si falta una no funcionan:</p><pre>white-space: nowrap;      /* un solo renglón */\noverflow: hidden;         /* lo que sobra, no se ve */\ntext-overflow: ellipsis;  /* y en el corte, … */</pre><p><code>text-overflow</code> solo decide <b>cómo</b> se marca el corte; el corte lo hacen las otras dos. Es una de las recetas más copiadas de la historia del CSS.</p>',
    obj: 'Cada título, en un renglón, sin salirse del lomo y con <b>…</b> donde se corta.',
    pista: '<code>white-space: nowrap;</code>, <code>overflow: hidden;</code> y <code>text-overflow: ellipsis;</code>',
    p: ['div@lomo:Historia completa del punto y coma', 'div@lomo:Atlas', 'div@lomo:Las mil y una cajas anidadas'],
    despistes: [{ s: '.lomo', si: { 'text-overflow': 'ellipsis', 'overflow-x': 'visible' }, m: 'Los puntos están pedidos, pero el texto sigue saliéndose. Sin <code>overflow: hidden</code> no hay corte, y sin corte no hay dónde ponerlos.' }],
    b: [SPINE(190), { s: '.lomo', ini: 'white-space: nowrap;', sol: ELLIPSIS }, GAP],
  },
  {
    id: 'b11-7', r, n: 'La signatura interminable', et: false, w: 440, h: 200, ok: ['overflow-wrap', 'word-break'], cmp: ['overflow-wrap'], c: ['overflow-wrap', 'texto que no cabe'],
    enc: 'Las fichas del catálogo llevan la signatura de cada pergamino, y quien las numeró odiaba los espacios. Esa palabra no tiene por dónde partirse y se sale de la ficha. Pártela por donde haga falta… pero solo si hace falta: lo que cabe entero, que se quede entero.',
    teo: '<p>El navegador solo parte el texto por los <b>espacios</b> (y algunos guiones). Una palabra más larga que la caja —un enlace, un código, un nombre alemán— se queda entera y <b>desborda</b>.</p><p><code>overflow-wrap: anywhere;</code> le da permiso para partir una palabra por <b>cualquier letra</b>, pero <b>solo si no le cabe</b> un renglón para ella sola. (Verás también <code>break-word</code>: es el valor de antes y hace casi lo mismo).</p><p>Su primo bruto, <code>word-break: break-all;</code>, parte <b>todas</b> las palabras por donde caigan, quepan o no.</p>',
    obj: 'La signatura se parte en varios renglones sin salirse de la ficha. «Signatura:» se queda entera en el primero.',
    pista: '<code>overflow-wrap: anywhere;</code>',
    p: ['p@ficha:Signatura: pergamino_del_margen_que_colapsa_entre_hermanos', 'p@ficha:Signatura: atlas_n42'],
    despistes: [
      { s: '.ficha', si: { 'word-break': 'break-all' }, m: 'Con <code>break-all</code> se parte cualquier palabra, quepa o no. Aquí solo debe partirse lo que no cabe: eso es cosa de <code>overflow-wrap</code>.' },
      { s: '.ficha', si: { 'overflow-wrap': 'break-word' }, m: '<code>break-word</code> es el valor antiguo y casi hace lo mismo. Marginalia quiere el moderno: <code>anywhere</code>.' },
    ],
    b: [hidden('.ficha', 'width: 220px;\noverflow: visible;'), { s: '.ficha', sol: 'overflow-wrap: anywhere;' }, GAP],
  },
  {
    id: 'b11-8', r, n: 'Dibujos en el renglón', html: true, et: false, w: 480, h: 140, ok: ['vertical-align'], cmp: ['vertical-align'], c: ['vertical-align', 'bloque y en línea'],
    enc: 'En el índice ilustrado, cada renglón lleva dibujitos entre las palabras. Pero se me sientan en la línea como gallinas en el palo: con los pies en la base de las letras y la cabeza en las nubes. Los quiero centrados con el texto, a media altura.',
    teo: '<p>En un renglón, las cajas en línea (<code>inline</code> e <code>inline-block</code>) se alinean de fábrica por la <b>línea base</b>: la raya invisible donde se apoyan las letras. Un dibujo alto se apoya ahí y empuja todo lo demás.</p><p><code>vertical-align</code> lo cambia, pero <b>solo</b> en elementos en línea o en celdas de tabla; en un bloque no hace nada:</p><ul><li><code>baseline</code>: sobre la línea base (lo de fábrica).</li><li><code>middle</code>: centrado con las letras minúsculas.</li><li><code>top</code> / <code>bottom</code>: arriba o abajo del renglón.</li></ul>',
    obj: 'Los dos dibujos (<code>.icono</code>), centrados a media altura con el texto de su renglón.',
    pista: '<code>vertical-align: middle;</code>',
    p: ['div@renglon', ['span:Abre el', 'libro@icono', 'span:y busca la', 'llave@icono', 'span:al final.']],
    b: [hidden('.icono', 'display: inline-block;\nwidth: 44px;\npadding: 2px;'), { s: '.icono', sol: 'vertical-align: middle;' }],
  },
  {
    id: 'b11-9', r, n: 'Catálogo a oscuras', esp: 'a oscuras', espejismo: true, clase: 'oscuras', html: true, et: false, w: 440, h: 340,
    ok: ['content', 'white-space', 'overflow', 'overflow-x', 'text-overflow'], cmp: ['white-space', 'overflow-x', 'text-overflow'], c: ['::before', 'texto que no cabe'],
    enc: 'Chsss… Se han apagado los candiles y mañana viene la inspección. Termina el catálogo de memoria: cada sala, con su rótulo «Sala» delante, que no está en el HTML; y cada lomo, en un renglón, sin salirse y con sus tres puntitos. A tientas, como las buenas lectoras.',
    teo: '<p><b>A oscuras:</b> la silueta solo asoma a ratos. Dos recetas de esta biblioteca: <code>::before</code> con <code>content</code> para escribir lo que no está en el HTML, y el trío <code>nowrap</code> + <code>overflow</code> + <code>text-overflow</code> para lo que no cabe.</p>',
    obj: 'Cada <code>.sala</code> empieza por <code>Sala </code> (con un espacio). Cada <code>.lomo</code>, en un renglón, sin salirse y con <b>…</b> donde se corta.',
    pistasPrevias: ['Son dos reglas: el pseudoelemento de <code>.sala</code> necesita su texto, y <code>.lomo</code>, tres declaraciones.'],
    pista: 'En <code>.sala::before</code>: <code>content: "Sala ";</code>. En <code>.lomo</code>: <code>white-space: nowrap;</code>, <code>overflow: hidden;</code> y <code>text-overflow: ellipsis;</code>',
    p: ['h3@sala:Norte', 'div@lomo:Crónica de las cajas que no cabían en el almacén', 'div@lomo:Mapas', 'h3@sala:Sur', 'div@lomo:Memorias de un párrafo con demasiado interlineado'],
    b: [FIT('.sala'), SPINE(220), { s: '.sala::before', sol: 'content: "Sala ";' }, { s: '.lomo', sol: ELLIPSIS }, GAP],
    fin: 'Chsss… perfecto. Ni un ruido, ni un renglón fuera de sitio. Ya has recorrido casi toda la isla, y la isla te ha leído a ti. Ve al Aula Magna, en el corazón de la isla: la Maestra Rúbrica te espera con sus pruebas. Y devuelve los libros antes de irte.',
  },
];
