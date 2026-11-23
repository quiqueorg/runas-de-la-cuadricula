/** The Observatory of Measures: functions, units and keywords. Player-facing copy stays in Spanish. */
import type { LevelDraft, PieceTypeMap } from '../../models';
import { BORDER_BOX, GAP, ISLE, fixed, hidden } from './helpers';

/** Piece types only this file uses; merged into the isle's own. */
export const pieceTypes: PieceTypeMap = {
  // A real <button>: it brings its own font and colour from the browser, which is the point of b10-6.
  boton: { tag: 'button', texto: true },
};

const r = ISLE.observatorio;

export const lessons: LevelDraft[] = [
  //Region 9 · EL OBSERVATORIO DE LAS MEDIDAS
  {
    id: 'b10-1', r, n: 'Todo menos la escalera', anchos: [360, 560], h: 150, ok: ['width'], c: ['calc()', '%'],
    enc: '¡Una visita! Vienes de los invernaderos, se nota: hueles a tomatera. Pasa, pero no toques nada que tenga lentes. El riel del telescopio debe ocupar toda la cúpula menos los ochenta píxeles de la escalera. Y la cúpula gira: unas noches es ancha y otras, estrecha.',
    teo: '<p>A veces una medida es <b>una mezcla</b>: «todo el ancho, menos 80px». Ni los píxeles ni los porcentajes solos pueden decir eso. <code>calc()</code> sí:</p><pre>width: calc(100% - 80px);</pre><p>Dentro puedes sumar, restar, multiplicar y dividir, y mezclar unidades distintas. El navegador hace la cuenta cada vez que cambia el tamaño.</p><p>Ojo: el <code>+</code> y el <code>-</code> necesitan <b>un espacio a cada lado</b>. <code>calc(100%-80px)</code> no vale.</p>',
    obj: 'El riel mide <b>el 100% menos 80px</b>, con la cúpula estrecha y con la ancha.',
    pistasPrevias: ['Con píxeles solo aciertas uno de los dos tamaños, y con un porcentaje, tampoco: lo que sobra son siempre 80px justos. Tienes que restar una cosa de la otra.'],
    pista: '<code>width: calc(100% - 80px);</code>',
    p: ['div@escalera:escalera', 'telescopio@riel'],
    b: [BORDER_BOX, hidden('.escalera', 'position: absolute;\nleft: 14px;\ntop: 14px;\nwidth: 72px;'), hidden('.riel', 'margin-left: auto;'), { s: '.riel', sol: 'width: calc(100% - 80px);' }],
  },
  {
    id: 'b10-2', r, n: 'Ni más ancha que la cúpula', anchos: [300, 560], h: 130, ok: ['width'], c: ['min()', '%'],
    enc: 'Esta carta celeste la dibujé a trescientos veinte de ancho, y así la quiero. Pero en la cúpula pequeña se sale por el borde y se me arruga, y una carta arrugada pone las estrellas donde no están. Trescientos veinte… salvo que no quepa. Entonces, lo que quepa.',
    teo: '<p><code>min()</code> recibe varias medidas, separadas por comas, y se queda con <b>la más pequeña</b>:</p><pre>width: min(100%, 320px);</pre><p>Si el 100% mide más de 320px, gana 320px; si mide menos, gana el 100%. Es lo mismo que <code>width: 100%</code> con <code>max-width: 320px</code>, pero en una sola declaración.</p><p>Piénsalo así: <code>min()</code> pone un <b>techo</b>.</p>',
    obj: 'La carta mide <b>320px</b> si cabe; si no, el <b>100%</b> del tablero. Prueba los dos tamaños.',
    pistasPrevias: ['Quieres «el más pequeño de los dos»: el 100% o 320px. Hay una función que elige eso por ti.'],
    pista: '<code>width: min(100%, 320px);</code>',
    p: ['div@carta:carta celeste'],
    b: [BORDER_BOX, { s: '.carta', sol: 'width: min(100%, 320px);' }],
  },
  {
    id: 'b10-3', r, n: 'Que quepa un ojo', anchos: [320, 640], h: 150, ok: ['width'], c: ['max()', '%'],
    enc: 'La mirilla crece con la cúpula: un cuarenta por ciento, siempre. Pero en la cúpula pequeña se queda tan chica que no cabe ni un ojo, y un astrónomo sin ojo es un poeta. Que nunca baje de ciento ochenta.',
    teo: '<p><code>max()</code> es la hermana de <code>min()</code>: se queda con <b>la más grande</b>.</p><pre>width: max(40%, 180px);</pre><p>Mientras el 40% mida más de 180px, manda el 40%. Cuando se queda corto, manda 180px. <code>max()</code> pone un <b>suelo</b>.</p><p>Sí, al revés de lo que parece: <code>min()</code> limita por arriba y <code>max()</code>, por abajo. Hasta los astrónomos se lían.</p>',
    obj: 'La mirilla mide el <b>40%</b> del tablero, pero nunca menos de <b>180px</b>.',
    pista: '<code>width: max(40%, 180px);</code>',
    p: ['telescopio@mirilla'],
    b: [BORDER_BOX, { s: '.mirilla', sol: 'width: max(40%, 180px);' }],
  },
  {
    id: 'b10-4', r, n: 'Tres cúpulas, una runa', esp: 'regateo', bolsa: { total: 2, precio: 2 }, anchos: [300, 480, 700], h: 130, ok: ['width', 'min-width', 'max-width'], c: ['clamp()', '%'],
    bolsaTxt: 'Astrolabio: «Cada runa me cuesta una lente pulida, y solo me queda una. Que valga por tres.»',
    enc: 'Tengo tres cúpulas y una sola lente mayor. Debe ocupar media cúpula, pero sin bajar de ciento sesenta, que no se ve nada, ni pasar de trescientos, que pesa y se cae. Y las lentes no las regalan: te fío una sola runa.',
    teo: '<p><b>Regateo:</b> solo te llega para una declaración. <code>clamp()</code> junta suelo, medida ideal y techo en una:</p><pre>width: clamp(160px, 50%, 300px);</pre><p>Se lee «el 50%, pero nunca menos de 160px ni más de 300px». Es <code>max(160px, min(50%, 300px))</code>, mucho más corto. Prueba los tres tamaños de cúpula.</p>',
    obj: 'La lente ocupa el <b>50%</b> del tablero, sin bajar de <b>160px</b> ni pasar de <b>300px</b>, con una sola declaración.',
    pistasPrevias: ['Con <code>width</code>, <code>min-width</code> y <code>max-width</code> lo consigues, pero son tres runas. Hay una función que recibe las tres medidas a la vez: mínimo, ideal y máximo.'],
    pista: '<code>width: clamp(160px, 50%, 300px);</code>',
    p: ['div@lente:lente mayor'],
    b: [BORDER_BOX, { s: '.lente', sol: 'width: clamp(160px, 50%, 300px);' }],
  },
  {
    id: 'b10-5', r, n: 'Renglones que se leen', anchos: [300, 620], h: 200, ok: ['max-width', 'width'], c: ['ch'],
    enc: 'Apunto lo que veo en notas que lee todo el pueblo. Pero en la pared grande los renglones se hacen tan largos que, al saltar al siguiente, la gente se pierde y acaba leyendo la nota de al lado. Que ningún renglón pase de treinta letras de ancho.',
    teo: '<p>La unidad <code>ch</code> mide lo que ocupa <b>el carácter «0»</b> en la letra del propio elemento. <code>30ch</code> son, más o menos, treinta letras.</p><p>Por eso es la unidad de los textos: un renglón cómodo de leer tiene entre 45 y 75 caracteres, y para una nota estrecha bastan unos 30. Si la letra crece, el renglón crece con ella.</p><pre>max-width: 30ch;</pre>',
    obj: 'Con el tablero ancho, la nota no pasa de <b>30ch</b>. Con el estrecho, ocupa lo que haya, como hasta ahora.',
    pistasPrevias: ['Con <code>width</code>, en el tablero estrecho la nota se saldría del borde. Lo que quieres es un tope, no una medida fija.'],
    pista: '<code>max-width: 30ch;</code>',
    p: ['p@nota:Esta noche Saturno se ve con anillos y todo. Mañana, si hay nubes, se verá con imaginación, que gasta menos lente.'],
    req: [{ b: 0, re: /\d\s*ch\b/, m: 'Mide el renglón en <code>ch</code>' }],
    b: [{ s: '.nota', sol: 'max-width: 30ch;' }],
  },
  {
    id: 'b10-6', r, n: 'Botones con mala memoria', html: true, w: 460, h: 230, ok: ['color', 'font', 'font-family', 'font-size'], cmp: ['color', 'font-family', 'font-size'], c: ['inherit', 'herencia'],
    enc: 'La carta de avisos va en azul de medianoche y en letra con remates, como Dios manda. El párrafo obedece. Pero el botón se ha puesto su letra de fábrica y el enlace se ha vestido de azul chillón. No quiero repetirles el color y la letra: quiero que hereden, como el párrafo.',
    teo: '<p>El color y la letra se heredan… salvo cuando el navegador da los suyos. Los <b>enlaces</b> traen su azul y los <b>botones</b> y campos de formulario, su letra de sistema. Con <code>inherit</code> les dices: «toma el valor de tu padre».</p><pre>button, a {\n  color: inherit;\n  font: inherit;\n}</pre><p>Tiene dos primas:</p><ul><li><code>initial</code>: el valor inicial que dice la norma de CSS. Cuidado: el <code>display</code> inicial es <code>inline</code>, también para un <code>div</code>.</li><li><code>unset</code>: hereda si la propiedad se hereda y, si no, vuelve a la inicial.</li></ul>',
    obj: 'El botón y el enlace, con el mismo color y la misma letra que el resto de la carta.',
    pistasPrevias: ['La carta ya tiene color y letra. El párrafo los hereda solo; el botón y el enlace traen los suyos. Pídeles que hereden en lugar de copiar los valores.'],
    pista: '<code>color: inherit;</code> y <code>font: inherit;</code>',
    p: ['div@carta', ['p:Esta noche, lluvia de estrellas.', 'boton:Avisar al pueblo', 'a[href=#cielo]:Ver la carta del cielo']],
    req: [{ b: 1, re: /inherit/, m: 'Pide a los dos que hereden con <code>inherit</code>' }],
    b: [fixed('.carta', 'color: midnightblue;\nfont-family: Georgia, serif;'), { s: 'button, a', sol: 'color: inherit;\nfont: inherit;' }, GAP],
  },
  {
    id: 'b10-7', r, n: 'La leyenda del mapa estelar', html: true, et: false, w: 440, h: 170, ok: ['background-color', 'color', 'border-color'], cmp: ['background-color'], c: ['currentColor', 'colores'],
    enc: 'Cada planeta de la leyenda lleva su color en el nombre y, al lado, un cuadradito de muestra que está en blanco. No pienso pintar tres cuadraditos: el día que Marte cambie de color tendría que acordarme de cambiar dos cosas, y yo no me acuerdo ni de cenar.',
    teo: '<p><code>currentColor</code> es una palabra que vale <b>lo mismo que el <code>color</code> del propio elemento</b>: el de su texto. Puedes escribirla en cualquier sitio donde quepa un color.</p><pre>.muestra {\n  background-color: currentColor;\n}</pre><p>Cada muestra hereda el color de su planeta y lo usa de fondo. Si mañana cambias el color de Marte, la muestra cambia sola.</p><p>De hecho, el navegador ya la usa sin decírtelo: un <code>border</code> sin color se pinta en <code>currentColor</code>.</p>',
    obj: 'Cada cuadradito de muestra, pintado del mismo color que el nombre de su planeta, con una sola regla.',
    pistasPrevias: ['Las tres muestras comparten regla, pero cada una debe salir de un color. Hay una palabra que significa «el color de mi texto».'],
    pista: '<code>background-color: currentColor;</code>',
    p: ['ul@leyenda', ['li@saturno:Saturno', ['span@muestra'], 'li@marte:Marte', ['span@muestra'], 'li@neptuno:Neptuno', ['span@muestra']]],
    b: [
      hidden('.leyenda', 'list-style: none;\npadding-left: 8px;'),
      hidden('li', 'margin-bottom: 6px;'),
      hidden('.muestra', 'display: inline-block;\nwidth: 16px;\nheight: 16px;\npadding: 0;\nmargin-left: 10px;\nvertical-align: middle;'),
      fixed('.saturno', 'color: goldenrod;'),
      fixed('.marte', 'color: firebrick;'),
      fixed('.neptuno', 'color: royalblue;'),
      { s: '.muestra', sol: 'background-color: currentColor;' },
    ],
  },
  {
    // Added after b10-8 was written: it goes before the night of the eclipse, which closes the region.
    id: 'b10-9', r, n: 'El grito del astrónomo', html: true, w: 460, h: 210, ok: ['width'], c: ['!important', 'especificidad', 'cascada'],
    enc: 'Las tres tapas de las lentes tienen que medir lo mismo, doscientos sesenta exactos, o el polvo de estrellas se cuela por el hueco. Pero la tapa principal la dejó escrita mi predecesor con un id, y su hoja está lacrada: no se toca. Solo me queda mi regla. Tendré que levantar la voz… una vez, y que no se acostumbre nadie.',
    teo: '<p>Cuando dos reglas chocan, gana la de <b>más especificidad</b>: un id pesa más que cualquier clase. Pero hay una forma de saltarse esa cuenta: añadir <code>!important</code> al final del valor.</p><pre>.lente {\n  width: 260px !important;\n}</pre><p>Una declaración con <code>!important</code> gana a todas las que no lo llevan, pese lo que pese su selector. Es un <b>grito</b>, y funciona… hasta que otra regla grita también. Entonces vuelve a mandar la especificidad, y cada arreglo necesita otro grito.</p><p>Por eso es el <b>último recurso</b>: sirve para pisar estilos que no puedes cambiar (los de otra persona, los de una biblioteca). En tu propia hoja, antes de gritar, cambia el selector.</p>',
    obj: 'Las tres tapas (<code>.lente</code>) miden <b>260px</b> de ancho, también la que tiene <code>id="principal"</code>, escribiendo solo en la regla de <code>.lente</code>.',
    pistasPrevias: ['La regla de <code>#principal</code> pesa más que la tuya y no la puedes tocar. Hay una palabra que, escrita al final del valor, hace que tu declaración gane igualmente.'],
    pista: '<code>width: 260px !important;</code>',
    p: ['p@lente:Tapa del buscador', 'p@lente#principal:Tapa principal', 'p@lente:Tapa del ocular'],
    req: [{ re: /!\s*important/, m: 'Haz que tu declaración gane con <code>!important</code>' }],
    b: [fixed('#principal', 'width: 120px;'), { s: '.lente', sol: 'width: 260px !important;' }, GAP],
  },
  {
    id: 'b10-8', r, n: 'La noche del eclipse', esp: 'a oscuras', espejismo: true, clase: 'oscuras', anchos: [340, 600], h: 200, ok: ['width'], c: ['calc()', 'max()'],
    enc: '¡Esta noche hay eclipse y la luna se lo ha tragado todo! Tendrás que montar el telescopio de memoria. El tubo, toda la cúpula menos cien. El filtro, un tercio de la cúpula, pero no menos de ciento cuarenta, que el sol quema. Y sí, la cúpula sigue girando.',
    teo: '<p><b>A oscuras:</b> la silueta solo asoma a ratos. Haz la cuenta antes de escribir: <code>calc()</code> para restar una medida fija de un porcentaje, y <code>max()</code> para poner un suelo.</p>',
    obj: 'El tubo mide <b>el 100% menos 100px</b> y queda centrado. El filtro mide un <b>33%</b> del tablero, pero nunca menos de <b>140px</b>. Con los dos tamaños de cúpula.',
    pistasPrevias: ['El tubo es una resta entre un porcentaje y unos píxeles. El filtro, un porcentaje con suelo: la función que se queda con la mayor.'],
    pista: 'Tubo: <code>width: calc(100% - 100px);</code>. Filtro: <code>width: max(33%, 140px);</code>',
    p: ['telescopio@tubo', 'div@filtro:filtro solar'],
    b: [BORDER_BOX, hidden('.tubo', 'margin: 0 auto 10px;'), hidden('.filtro', 'margin: 0 auto;'), { s: '.tubo', sol: 'width: calc(100% - 100px);' }, { s: '.filtro', sol: 'width: max(33%, 140px);' }],
    fin: '¡Bravo! Calculas casi tan bien como yo, y yo sin ábaco calculo fatal. Baja a la Biblioteca de los Pergaminos: Marginalia guarda allí los textos que no caben en ninguna parte. Llévale esta nota. Si no le cabe, que la doble.',
  },
];
