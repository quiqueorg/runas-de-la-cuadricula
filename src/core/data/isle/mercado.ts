/** The Market of Labels: attribute selectors and pseudo-classes. Player-facing copy stays in Spanish. */
import type { LevelDraft, PieceTypeMap } from '../../models';
import { BG, GAP, GOLD, ISLE, fixed, hidden, inRow, pick, refill } from './helpers';

/** Piece types only this file uses; merged into the isle's own. */
export const pieceTypes: PieceTypeMap = {};

const r = ISLE.mercado;
/** Board links read as a column of notices, one per line. */
const NOTICES = hidden('a', 'display: block;\nwidth: 220px;\nmargin-bottom: 6px;');

export const lessons: LevelDraft[] = [
  {
    id: 'b8-1', r, n: 'Con etiqueta o sin ella', esp: 'escribe el selector', html: true, w: 440, h: 280, ok: [], cmp: BG, c: ['atributo'],
    enc: '¡Pasen, pasen! ¿Vienes del Faro? Se nota: traes cara de saber dónde está cada cosa. Aquí lo que importa es qué etiqueta lleva. Lo que tiene precio se subasta y se pinta de oro. Lo que no tiene precio… se queda mirando.',
    teo: '<p>Las etiquetas HTML llevan <b>atributos</b>: datos escritos dentro de la etiqueta, como <code>class</code>, <code>id</code>, <code>href</code>… Los que empiezan por <code>data-</code> son tuyos, para guardar lo que quieras:</p><pre>&lt;p data-precio="3"&gt;Sardinas&lt;/p&gt;</pre><p>Entre <b>corchetes</b>, el nombre de un atributo selecciona a quien lo lleve, <b>valga lo que valga</b>, aunque esté vacío:</p><pre>[data-precio] { … }</pre>',
    obj: 'Todo lo que lleve el atributo <code>data-precio</code>, dorado. Lo demás, no.',
    pista: '<code>[data-precio]</code>',
    p: ['p[data-precio=3]:Sardinas frescas', 'p:Caracola que canta', 'p[data-precio=12]:Ánfora de barro', 'p[data-precio=]:Regalo de la casa', 'p:Bota sin pareja'],
    req: [{ sel: true, re: /\[\s*data-precio\s*\]/, m: 'Usa el nombre del atributo entre corchetes: <code>[data-precio]</code>' }],
    b: [pick('[data-precio]', GOLD), GAP],
  },
  {
    id: 'b8-2', r, n: 'Lo que pone, ni más ni menos', esp: 'escribe el selector', html: true, w: 440, h: 280, ok: [], cmp: BG, c: ['atributo'],
    enc: 'La pescadera me ha pedido los cajones de pescado en azul claro, para que se vean fresquitos. De pescado, he dicho. El bacalao seco no cuenta, que lleva tres meses en sal y ya no se acuerda del mar.',
    teo: '<p>Con un signo igual, el atributo tiene que valer <b>exactamente</b> eso:</p><pre>[data-tipo="pescado"] { … }</pre><p>Ni más ni menos: <code>data-tipo="pescado-seco"</code> <b>no</b> se cuela, porque no pone «pescado» a secas. Las comillas son opcionales si el valor es una sola palabra, pero conviene ponerlas siempre.</p>',
    obj: 'Solo los cajones cuyo <code>data-tipo</code> es exactamente <code>pescado</code>, de color <code>lightblue</code>.',
    pista: '<code>[data-tipo="pescado"]</code>',
    p: ['p[data-tipo=pescado]:Sardinas', 'p[data-tipo=fruta]:Naranjas', 'p[data-tipo=pescado-seco]:Bacalao en salazón', 'p[data-tipo=pescado]:Merluza', 'p[data-tipo=marisco]:Navajas'],
    req: [{ sel: true, re: /\[\s*data-tipo\s*=/, m: 'Pregunta por el valor del atributo: <code>[data-tipo="…"]</code>' }],
    b: [pick('[data-tipo="pescado"]', 'background-color: lightblue;'), GAP],
  },
  {
    id: 'b8-3', r, n: 'Empieza, acaba, contiene', esp: 'escribe el selector', html: true, w: 460, h: 300, ok: [], cmp: BG, c: ['atributo'],
    enc: 'El tablón de pregones es un lío de enlaces. Los que empiezan por https van seguros: en verde. Los que acaban en .pdf son catálogos: en azul. Y todo lo que lleve «isla» en la dirección es de aquí, de los nuestros: un poco más adentro, que se note.',
    teo: '<p>Tres signos preguntan por <b>un trozo</b> del valor:</p><ul><li><code>[href^="https"]</code>: <b>empieza</b> por «https».</li><li><code>[href$=".pdf"]</code>: <b>acaba</b> en «.pdf».</li><li><code>[href*="isla"]</code>: <b>contiene</b> «isla» en cualquier parte.</li></ul><p>Truco para recordarlos: <code>^</code> apunta al principio, <code>$</code> cierra la cuenta y <code>*</code> vale para cualquier sitio.</p>',
    obj: 'Los enlaces que empiezan por <code>https</code>, fondo <code>palegreen</code>. Los que acaban en <code>.pdf</code>, fondo <code>lightblue</code>. Y los que contienen <code>isla</code>, con <b>40px</b> de margen a la izquierda.',
    pista: 'Por orden: <code>a[href^="https"]</code>, <code>a[href$=".pdf"]</code> y <code>a[href*="isla"]</code>.',
    p: ['a[href=https://lonja.isla]:Subasta en directo', 'a[href=http://puerto.es]:Precios de antaño', 'a[href=/otono.pdf]:Catálogo de otoño', 'a[href=/isla-norte]:Puestos del norte', 'a[href=https://rutas.pdf]:Rutas de reparto'],
    req: [{ sel: true, re: /\^=[\s\S]*\$=[\s\S]*\*=/, m: 'Usa los tres signos, uno en cada regla: <code>^=</code>, <code>$=</code> y <code>*=</code>' }],
    b: [NOTICES, pick('a[href^="https"]', 'background-color: palegreen;'), pick('a[href$=".pdf"]', 'background-color: lightblue;'), pick('a[href*="isla"]', 'margin-left: 40px;')],
  },
  {
    id: 'b8-4', r, n: 'Una lista dentro de otra', esp: 'escribe el selector', html: true, w: 460, h: 330, ok: [], cmp: BG, c: [':is()', 'lista de selectores'],
    enc: 'Lo fresco se vende antes. Quiero dorado todo lo de la frutería y todo lo de la pescadería. La ferretería, no: los clavos no se ponen pochos. Y no me escribas «.fruteria p, .pescaderia p», que repites la p y la tinta la pago yo.',
    teo: '<p><code>:is()</code> acepta <b>una lista</b> y se cumple si se cumple <b>cualquiera</b> de sus selectores. Sirve para no repetir:</p><pre>.fruteria p, .pescaderia p { … }\n/* lo mismo, más corto: */\n:is(.fruteria, .pescaderia) p { … }</pre><p>Pesa lo mismo que <b>el más pesado</b> de su lista: con un id dentro, pesa como un id.</p>',
    obj: 'Los productos (<code>p</code>) de <code>.fruteria</code> y de <code>.pescaderia</code>, dorados, con un solo selector que use <code>:is()</code>. Los de <code>.ferreteria</code>, no.',
    pista: '<code>:is(.fruteria, .pescaderia) p</code>',
    p: ['div@fruteria', ['p:Manzanas', 'p:Higos'], 'div@pescaderia', ['p:Sardinas', 'p:Pulpo'], 'div@ferreteria', ['p:Clavos', 'p:Bisagras']],
    req: [{ sel: true, re: /:is\(/, m: 'Agrupa los dos puestos dentro de <code>:is( … )</code>' }],
    b: [pick(':is(.fruteria, .pescaderia) p', GOLD), hidden('div', 'margin-bottom: 10px;'), GAP],
  },
  {
    id: 'b8-5', r, n: 'El selector que no pesa', esp: 'escribe el selector', html: true, w: 440, h: 300, ok: [], cmp: BG, c: [':where()', 'especificidad'],
    enc: 'Mi aprendiz pintó de azul todo el pan del mostrador y, de paso, me tapó la oferta, que tiene que lucir dorada. Escribió un selector con id, que pesa como un saco de harina. No quiero que pese menos: quiero que no pese nada.',
    teo: '<p><code>:where()</code> funciona igual que <code>:is()</code>, con una diferencia: <b>no pesa nada</b>. Todo lo que pongas dentro tiene especificidad cero.</p><pre>#mostrador p { … }        /* pesa un id y un tipo */\n:where(#mostrador) p { … } /* pesa solo el tipo */</pre><p>Es perfecto para reglas «por defecto» que cualquier otra regla, por ligera que sea, pueda corregir.</p>',
    obj: 'El pan del mostrador, <code>lightblue</code>… salvo la <code>.oferta</code>, que sigue dorada. El pan del vecino, como está. Arregla el selector con <code>:where()</code>.',
    pistasPrevias: ['La regla de la oferta es una clase y pierde contra un id. Si el id va dentro de <code>:where()</code>, deja de contar.'],
    pista: '<code>:where(#mostrador) p</code>',
    p: ['section#mostrador', ['p:Pan de ayer', 'p@oferta:Pan de hoy, a mitad de precio', 'p:Pan de anteayer'], 'p:Pan del vecino'],
    req: [{ sel: true, re: /:where\(/, m: 'Mete el id dentro de <code>:where( … )</code>' }],
    b: [pick(':where(#mostrador) p', 'background-color: lightblue;', '#mostrador p'), fixed('.oferta', GOLD), GAP],
  },
  {
    id: 'b8-6', r, n: 'El puesto que lo tiene dentro', esp: 'escribe el selector', html: true, w: 460, h: 330, ok: [], cmp: BG, c: [':has()'],
    enc: 'Cuando un puesto tiene algo agotado, le bajamos el toldo gris para que la gente no haga cola en balde. Pero el cartel de «agotado» va en el producto, no en el puesto. ¿Cómo pinto al de fuera mirando lo de dentro?',
    teo: '<p>Hasta hace poco, el CSS solo miraba <b>hacia abajo</b>: del padre a los hijos. <code>:has()</code> mira <b>hacia dentro</b> y selecciona al elemento que <b>contiene</b> algo:</p><pre>.puesto:has(.agotado) { … }</pre><p>«El <code>.puesto</code> que tiene dentro un <code>.agotado</code>». Por eso lo llaman el <b>selector de padre</b>, el que se pidió durante veinte años.</p>',
    obj: 'Los puestos que contienen algo <code>.agotado</code>, con fondo <code>gray</code>. Los demás, como están.',
    pista: '<code>.puesto:has(.agotado)</code>',
    p: ['div@puesto', ['h3:Frutería', 'p:Manzanas'], 'div@puesto', ['h3:Quesería', 'p@agotado:Queso curado'], 'div@puesto', ['h3:Panadería', 'p:Hogazas'], 'div@puesto', ['h3:Especias', 'p@agotado:Azafrán']],
    req: [{ sel: true, re: /:has\(/, m: 'Pregunta al puesto qué tiene dentro con <code>:has( … )</code>' }],
    b: [inRow('.puesto'), hidden('.puesto', 'width: 180px;\npadding: 4px;'), pick('.puesto:has(.agotado)', 'background-color: gray;')],
  },
  {
    id: 'b8-7', r, n: 'Toldos al pasar', esp: 'escribe el selector', estado: 'hover', html: true, w: 440, h: 180, ok: [], cmp: BG, c: [':hover'],
    enc: 'Los toldos de mi mercado saludan: cuando alguien pasa por debajo, se despliegan y se ponen dorados. Bueno, eso dice el cartel. Ahora mismo no saludan a nadie. Las declaraciones ya están; falta decirles cuándo.',
    teo: '<p>Una <b>pseudoclase</b> selecciona según un <b>estado</b>, no según el HTML. La más conocida es <code>:hover</code>: el cursor está encima.</p><pre>.toldo:hover { … }</pre><p>Se pega al selector, sin espacio. Pasa el ratón por los toldos, o pulsa <b>Pasar el cursor</b> para verlos todos a la vez. Otras pseudoclases de estado: <code>:focus</code> (tiene el foco del teclado) y <code>:active</code> (se está pulsando).</p>',
    obj: 'Con el cursor encima, cada toldo se pone dorado y mide <b>80px</b> de alto. Sin el cursor, como estaba.',
    pista: '<code>.toldo:hover</code>',
    p: ['div@toldo:Telas', 'div@toldo:Especias', 'div@toldo:Quesos'],
    despistes: [{ s: '.toldo', si: { 'background-color': 'rgb(255, 215, 0)' }, m: 'Los toldos ya están dorados sin el cursor encima: falta la pseudoclase <code>:hover</code>.' }],
    b: [inRow('.toldo'), hidden('.toldo', 'width: 96px;\nheight: 50px;'), pick('.toldo:hover', 'background-color: gold;\nheight: 80px;')],
  },
  {
    id: 'b8-8', r, n: 'La subasta de las doce', esp: 'contra reloj', tiempo: 80, clase: 'marea', html: true, w: 460, h: 300, ok: [], cmp: BG, c: ['atributo'],
    tiempoTxt: [`¡Ha sonado la campana y se ha cerrado la subasta! ${refill('Pide otra ronda')} y vuelve a intentarlo.`, 'Adjudicado, aunque con la campana ya sonando. Repítelo a tiempo y sin pistas para dominarlo.'],
    enc: '¡A las doce en punto se cierra la subasta y la marea sube hasta los puestos! Los lotes de la serie A, dorados. Lo vendido, en gris, que no lo puje nadie. Y los lotes que acaban en siete, un paso adelante, que traen suerte. ¡Rápido, que cierro!',
    teo: '<p><b>Contra reloj:</b> la marea sube en cuanto empiezas a escribir. Repasa: <code>[a="b"]</code> vale exactamente, <code>^=</code> empieza por, <code>$=</code> acaba en, <code>*=</code> contiene.</p>',
    obj: 'Los lotes cuyo <code>data-lote</code> empieza por <code>A</code>, dorados. Los que tienen <code>data-estado="vendido"</code>, fondo <code>silver</code>. Los que acaban en <code>7</code>, con <b>40px</b> de margen a la izquierda.',
    pista: 'Por orden: <code>[data-lote^="A"]</code>, <code>[data-estado="vendido"]</code> y <code>[data-lote$="7"]</code>.',
    p: ['p[data-lote=A-12][data-estado=libre]:Ánfora de barro', 'p[data-lote=B-07][data-estado=libre]:Brújula sin norte', 'p[data-lote=A-37][data-estado=libre]:Alfombra casi voladora', 'p[data-lote=C-04][data-estado=vendido]:Caracola parlante', 'p[data-lote=B-21][data-estado=libre]:Bota de siete leguas'],
    b: [pick('[data-lote^="A"]', GOLD), pick('[data-estado="vendido"]', 'background-color: silver;'), pick('[data-lote$="7"]', 'margin-left: 40px;'), GAP],
    fin: '¡Adjudicado todo! Tienes buen ojo para las etiquetas. Ahora sube a los Invernaderos de Cristal: Clorofila tiene las plantas pálidas y dice que les faltan sombras y colores. Llévale estas semillas, y no las pongas al sol, que se te van a ver de más.',
  },
];
