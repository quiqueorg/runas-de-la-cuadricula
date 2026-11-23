/** The Glasshouses: shadows, gradients and transparency. Player-facing copy stays in Spanish. */
import type { LevelDraft, PieceTypeMap } from '../../models';
import { GAP, hidden, ISLE, inRow, refill } from './helpers';

/** Piece types only this file uses; merged into the isle's own. */
export const pieceTypes: PieceTypeMap = {
  maceta: { token: 'maceta' },
};

const r = ISLE.greenhouses;
const SHADOW = ['box-shadow'];
const OUTLINE = ['outline-style', 'outline-width', 'outline-color', 'outline-offset'];

export const lessons: LevelDraft[] = [
  //Region 8 · LOS INVERNADEROS DE CRISTAL
  {
    id: 'b9-1',
    region: r,
    title: 'Cristal tintado',
    width: 440,
    height: 210,
    allowed: ['background-color', 'opacity'],
    compare: ['background-color', 'opacity'],
    concepts: ['transparencia', 'rgb()'],
    speech:
      '¡Cierra, cierra, que se escapa el calor! Vienes del mercado, ¿verdad? Hueles a etiqueta. Mira: necesito dos cristales tintados. El de los helechos, verde y translúcido, pero con el cartel bien legible. El de las orquídeas es viejo y lo quiero entero desvaído, letras incluidas, como un recuerdo.',
    theory:
      '<p>Hay dos maneras de volver algo <b>translúcido</b>, y no hacen lo mismo:</p><ul><li>Un <b>color con transparencia</b>: <code>rgb(46 139 87 / 0.5)</code>. El cuarto valor, tras la barra, es el <b>alfa</b>: de <code>0</code> (transparente) a <code>1</code> (opaco). Solo se aclara <b>ese color</b>: el fondo deja ver lo de detrás, pero el texto sigue nítido.</li><li><code>opacity: 0.5;</code> aclara el elemento <b>entero</b>: fondo, borde, texto y todo lo que lleve dentro.</li></ul><p>El alfa también se puede escribir en hexadecimal (<code>#2e8b5780</code>) o en <code>hsl()</code>.</p>',
    objective:
      '<code>.helechos</code>: fondo <code>rgb(46 139 87 / 0.5)</code>, con el texto opaco. <code>.orquideas</code>: el cristal entero a <code>0.5</code> de opacidad.',
    earlyHints: [
      'Los helechos piden transparencia solo en el fondo: eso va en el propio color. Las orquídeas, en todo el elemento.',
    ],
    hint: '<code>background-color: rgb(46 139 87 / 0.5);</code> en <code>.helechos</code> y <code>opacity: 0.5;</code> en <code>.orquideas</code>.',
    pieces: [
      'div@cristal.helechos:Helechos: regar los martes',
      'div@cristal.orquideas:Orquídeas: no regar nunca',
    ],
    missteps: [
      {
        selector: '.helechos',
        when: { opacity: '0.5' },
        message:
          'Con <code>opacity</code> el cartel de los helechos también se desvanece. Aquí solo debe aclararse el fondo: pon la transparencia en el color.',
      },
    ],
    rules: [
      hidden('.cristal', 'height: 64px;\nmargin-bottom: 14px;'),
      { selector: '.helechos', solution: 'background-color: rgb(46 139 87 / 0.5);' },
      { selector: '.orquideas', solution: 'opacity: 0.5;' },
    ],
  },
  {
    id: 'b9-2',
    region: r,
    title: 'La sombra de la maceta',
    width: 440,
    height: 200,
    allowed: ['box-shadow'],
    compare: SHADOW,
    concepts: ['sombras'],
    speech:
      'Bajo el cristal no hay sombras: la luz entra por todas partes y las macetas parecen pegatinas. Quiero que se despeguen del suelo. La de barro, con una sombra dura, de dibujo antiguo. La de porcelana, con una sombra suave, de tarde de verano.',
    theory:
      '<p><code>box-shadow</code> dibuja una <b>sombra</b> detrás de la caja. Sus valores, por orden:</p><pre>box-shadow: 8px 8px 0 darkolivegreen;\n/*          x   y   desenfoque  color */</pre><ul><li>Los dos primeros la <b>desplazan</b>: a la derecha y hacia abajo (en negativo, al revés).</li><li>El tercero la <b>difumina</b>: con <code>0</code>, borde duro; cuanto más, más suave.</li><li>El color, si es translúcido, queda más natural.</li></ul><p>La sombra no ocupa sitio: no empuja a nadie.</p>',
    objective:
      '<code>.barro</code>: sombra de <b>8px</b> a la derecha y <b>8px</b> abajo, sin desenfoque, <code>darkolivegreen</code>. <code>.porcelana</code>: sombra centrada, <b>10px</b> abajo y <b>14px</b> de desenfoque, <code>rgb(0 0 0 / 0.5)</code>.',
    hint: '<code>box-shadow: 8px 8px 0 darkolivegreen;</code> · <code>box-shadow: 0 10px 14px rgb(0 0 0 / 0.5);</code>',
    pieces: ['maceta@barro', 'maceta@porcelana'],
    rules: [
      inRow('.maceta'),
      hidden('.maceta', 'width: 90px;\nmargin: 16px 28px;'),
      { selector: '.barro', solution: 'box-shadow: 8px 8px 0 darkolivegreen;' },
      { selector: '.porcelana', solution: 'box-shadow: 0 10px 14px rgb(0 0 0 / 0.5);' },
    ],
  },
  {
    id: 'b9-3',
    region: r,
    title: 'Sombra por dentro, anillos por fuera',
    width: 460,
    height: 200,
    allowed: ['box-shadow'],
    compare: SHADOW,
    concepts: ['sombras'],
    speech:
      'Dos encargos raros, que son los que me gustan. El semillero tiene que parecer hundido en la tierra, con la sombra por dentro. Y la vitrina de los cactus premiados, con dos anillos alrededor, blanco y verde, sin engordarla ni un pelo.',
    theory:
      '<p>Dos trucos más de <code>box-shadow</code>:</p><ul><li>La palabra <code>inset</code> mete la sombra <b>dentro</b> de la caja: parece hundida.</li><li>Un cuarto número, la <b>extensión</b>, agranda la sombra en todas direcciones. Sin desplazamiento ni desenfoque, dibuja un <b>anillo</b> que no ocupa sitio.</li></ul><p>Y se pueden poner <b>varias sombras</b> separadas por comas. La primera queda encima:</p><pre>box-shadow: 0 0 0 4px white, 0 0 0 8px seagreen;</pre>',
    objective:
      '<code>.semillero</code>: sombra interior, <b>4px</b> hacia abajo, <b>10px</b> de desenfoque, <code>saddlebrown</code>. <code>.vitrina</code>: un anillo blanco de <b>4px</b> y, por fuera, otro <code>seagreen</code> hasta los <b>8px</b>.',
    earlyHints: [
      'Para el semillero: <code>inset</code> delante de los números. Para la vitrina: dos sombras separadas por una coma, cada una con desplazamiento y desenfoque a <code>0</code>.',
    ],
    hint: '<code>box-shadow: inset 0 4px 10px saddlebrown;</code> · <code>box-shadow: 0 0 0 4px white, 0 0 0 8px seagreen;</code>',
    pieces: ['div@semillero:Semillero', 'div@vitrina:Vitrina'],
    missteps: [
      {
        selector: '.vitrina',
        when: { 'border-top-width': '4px' },
        message:
          'Un borde engorda la vitrina y empuja lo que tiene al lado. Los anillos de sombra no ocupan sitio.',
      },
    ],
    rules: [
      inRow('.pieza'),
      hidden('.pieza', 'width: 140px;\nheight: 70px;\nmargin: 20px 22px;'),
      { selector: '.semillero', solution: 'box-shadow: inset 0 4px 10px saddlebrown;' },
      { selector: '.vitrina', solution: 'box-shadow: 0 0 0 4px white, 0 0 0 8px seagreen;' },
    ],
  },
  {
    id: 'b9-4',
    region: r,
    title: 'Letras con relieve',
    width: 460,
    height: 220,
    allowed: ['text-shadow'],
    compare: ['text-shadow'],
    concepts: ['sombras'],
    speech:
      'Los rótulos se me pierden contra tanto verde. El del invernadero, con relieve dorado, como grabado en latón. Y el de los cactus, que brille en rojo, a ver si así la gente deja de tocarlos.',
    theory:
      '<p><code>text-shadow</code> es la sombra de las <b>letras</b>, no de la caja. Lleva lo mismo que <code>box-shadow</code>, menos la extensión y <code>inset</code>:</p><pre>text-shadow: 3px 3px 0 gold;   /* relieve */\ntext-shadow: 0 0 6px tomato;   /* resplandor */</pre><p>Sin desplazamiento y con desenfoque, la sombra se reparte alrededor: parece que la letra <b>brilla</b>.</p>',
    objective:
      '<code>.rotulo</code>: sombra de <b>3px</b> a la derecha y <b>3px</b> abajo, sin desenfoque, <code>gold</code>. <code>.cactus</code>: resplandor sin desplazar, de <b>6px</b>, <code>tomato</code>.',
    hint: '<code>text-shadow: 3px 3px 0 gold;</code> · <code>text-shadow: 0 0 6px tomato;</code>',
    pieces: ['h2@rotulo:Invernadero Mayor', 'p@cactus:Prohibido tocar los cactus'],
    missteps: [
      {
        selector: '.rotulo',
        when: { 'box-shadow': 'rgb(255, 215, 0) 3px 3px 0px 0px' },
        message: 'Esa es la sombra de la caja. La de las letras se llama <code>text-shadow</code>.',
      },
    ],
    rules: [
      hidden('.rotulo', 'font-size: 34px;'),
      hidden('.cactus', 'font-size: 20px;'),
      GAP,
      { selector: '.rotulo', solution: 'text-shadow: 3px 3px 0 gold;' },
      { selector: '.cactus', solution: 'text-shadow: 0 0 6px tomato;' },
    ],
  },
  {
    id: 'b9-5',
    region: r,
    title: 'Amanecer en el cristal',
    width: 440,
    height: 310,
    allowed: ['background-image'],
    compare: ['background-image'],
    concepts: ['degradados'],
    speech:
      'A primera hora el cristal se tiñe de oro arriba y de rojo abajo, y yo quiero esa luz todo el día. Píntamela. Y el toldo de la entrada, que pase de verde oscuro a verde claro de izquierda a derecha. Y la cinta del concurso, a rayas: mitad blanca, mitad verde, sin mezclar.',
    theory:
      '<p>Un <b>degradado</b> es una imagen que el navegador pinta pasando de un color a otro. Va en <code>background-image</code>:</p><pre>background-image: linear-gradient(gold, tomato);</pre><p>Sin más, va <b>de arriba abajo</b>. Delante de los colores puedes darle una dirección: <code>to right</code>, <code>to top</code>, <code>45deg</code>…</p><p>Cada color admite una <b>parada</b>: dónde empieza o acaba. Si dos colores paran en el mismo sitio, no hay mezcla y sale una <b>raya</b>:</p><pre>linear-gradient(to right, white 50%, seagreen 50%)</pre>',
    objective:
      '<code>.ventanal</code>: de <code>gold</code> arriba a <code>tomato</code> abajo. <code>.toldo</code>: hacia la derecha, de <code>darkgreen</code> a <code>palegreen</code>. <code>.cinta</code>: hacia la derecha, <code>white</code> hasta el 50% y <code>seagreen</code> desde el 50%.',
    earlyHints: [
      'El ventanal usa la dirección de fábrica. Los otros dos empiezan con <code>to right</code>, y la cinta repite el 50% en los dos colores.',
    ],
    hint: '<code>linear-gradient(gold, tomato)</code> · <code>linear-gradient(to right, darkgreen, palegreen)</code> · <code>linear-gradient(to right, white 50%, seagreen 50%)</code>, cada uno en <code>background-image</code>.',
    pieces: ['div@ventanal:Ventanal', 'div@toldo:Toldo', 'div@cinta:Primer premio'],
    missteps: [
      {
        selector: '.toldo',
        when: { 'background-image': 'linear-gradient(90deg, rgb(0, 100, 0), rgb(152, 251, 152))' },
        message:
          '<code>90deg</code> apunta a la derecha, igual que <code>to right</code>. Aquí, por claridad, escríbelo con palabras: <code>to right</code>.',
      },
    ],
    rules: [
      hidden('.ventanal', 'height: 110px;'),
      hidden('.toldo, .cinta', 'height: 44px;'),
      hidden('.pieza', 'margin-bottom: 12px;'),
      { selector: '.ventanal', solution: 'background-image: linear-gradient(gold, tomato);' },
      {
        selector: '.toldo',
        solution: 'background-image: linear-gradient(to right, darkgreen, palegreen);',
      },
      {
        selector: '.cinta',
        solution: 'background-image: linear-gradient(to right, white 50%, seagreen 50%);',
      },
    ],
  },
  {
    id: 'b9-6',
    region: r,
    title: 'La flor que se abre',
    width: 440,
    height: 220,
    allowed: ['background-image'],
    compare: ['background-image'],
    concepts: ['degradados'],
    speech:
      'Esta es mi joya: la flor de medianoche. Se abre desde el centro, dorada por dentro y carmesí por fuera, redonda como una moneda. Y el estanque de al lado, igual pero en agua: claro en el centro, verde azulado en la orilla.',
    theory:
      '<p><code>radial-gradient()</code> pinta el degradado <b>desde el centro hacia fuera</b>: el primer color en medio, el último en los bordes.</p><pre>background-image: radial-gradient(gold, crimson);</pre><p>De fábrica, la forma es una <b>elipse</b> que se estira con la caja. Con <code>circle</code> delante de los colores, es un <b>círculo</b> perfecto aunque la caja sea alargada.</p>',
    objective:
      '<code>.flor</code>: degradado circular (<code>circle</code>) de <code>gold</code> a <code>crimson</code>. <code>.estanque</code>: degradado radial, en elipse, de <code>lightcyan</code> a <code>teal</code>.',
    hint: '<code>background-image: radial-gradient(circle, gold, crimson);</code> · <code>background-image: radial-gradient(lightcyan, teal);</code>',
    pieces: ['div@flor', 'div@estanque'],
    rules: [
      inRow('.pieza'),
      hidden('.flor', 'width: 110px;\nheight: 110px;\nborder-radius: 50%;\nmargin: 20px;'),
      hidden('.estanque', 'width: 200px;\nheight: 110px;\nborder-radius: 50%;\nmargin: 20px 10px;'),
      { selector: '.flor', solution: 'background-image: radial-gradient(circle, gold, crimson);' },
      { selector: '.estanque', solution: 'background-image: radial-gradient(lightcyan, teal);' },
    ],
  },
  {
    id: 'b9-7',
    region: r,
    title: 'El contorno que no ocupa',
    width: 460,
    height: 200,
    allowed: [
      'outline',
      'outline-width',
      'outline-style',
      'outline-color',
      'outline-offset',
      'border',
      'border-width',
      'border-style',
      'border-color',
    ],
    compare: OUTLINE,
    concepts: [],
    speech:
      'Mañana viene el jurado del concurso y quiero marcar la planta ganadora con un cerco verde. Pero cuidado: en esta fila no cabe ni un alfiler. Si la planta engorda, empuja a sus vecinas y se me cae una maceta. Márcala sin moverla.',
    theory:
      '<p><code>outline</code> dibuja un <b>contorno</b> alrededor de la caja, como un borde. Se escribe igual —<b>grosor, estilo y color</b>—, pero con una diferencia enorme: <b>no ocupa sitio</b>. La caja no crece y no empuja a nadie.</p><pre>outline: 4px solid seagreen;\noutline-offset: 3px;  /* separado 3px de la caja */</pre><p>Es lo que usan los navegadores para señalar el elemento que tiene el <b>foco</b> del teclado. Si lo quitas, pon otro: hay quien navega sin ratón.</p>',
    objective:
      'Solo la planta ganadora (<code>.ganadora</code>), con un contorno de <b>4px</b>, continuo, <code>seagreen</code>, separado <b>3px</b> de la caja. Las otras no se mueven ni un píxel.',
    earlyHints: [
      'Un <code>border</code> de 4px haría la caja 4px más grande por cada lado y empujaría a las vecinas. Busca el primo que no ocupa sitio.',
    ],
    hint: '<code>outline: 4px solid seagreen;</code> y <code>outline-offset: 3px;</code>',
    pieces: [
      'div@planta:Aloe',
      'div@planta.ganadora:Ficus',
      'div@planta:Menta',
      'div@planta:Hiedra',
    ],
    missteps: [
      {
        selector: '.ganadora',
        when: { 'border-top-width': '4px' },
        message:
          'El borde engorda la planta y empuja a sus vecinas. El contorno que no ocupa sitio es <code>outline</code>.',
      },
    ],
    rules: [
      inRow('.planta'),
      hidden('.planta', 'width: 70px;\nmargin: 40px 8px;'),
      { selector: '.ganadora', solution: 'outline: 4px solid seagreen;\noutline-offset: 3px;' },
    ],
  },
  {
    id: 'b9-8',
    region: r,
    title: 'Antes de la helada',
    variant: 'contra reloj',
    timeLimit: 90,
    className: 'niebla',
    width: 460,
    height: 260,
    allowed: ['background-color', 'box-shadow', 'text-shadow', 'opacity'],
    compare: ['background-color', 'box-shadow', 'text-shadow'],
    concepts: ['transparencia', 'sombras'],
    timeMessages: {
      expired: `¡La helada ha empañado los cristales! ${refill('Limpia el vaho')} y vuelve a intentarlo antes de que se congelen los esquejes.`,
      late: 'Salvados, aunque con alguna hoja tiritando. Repítelo a tiempo y sin pistas para dominarlo.',
    },
    speech:
      '¡Esta noche hiela! Hay que preparar el invernadero ya: la cristalera, de azul translúcido para que pase la luz; la estufa, con un resplandor naranja alrededor para que se vea desde la puerta; y el rótulo, con un filo azul acero, que con la escarcha no se lee. ¡Rápido, que se me congelan los esquejes!',
    theory:
      '<p><b>Contra reloj:</b> la escarcha sube en cuanto empiezas a escribir. Recuerda: la transparencia de un solo color va en el propio color (<code>rgb(… / alfa)</code>); la sombra de la caja es <code>box-shadow</code> y la de las letras, <code>text-shadow</code>. Sin desplazamiento y con desenfoque, una sombra se vuelve resplandor.</p>',
    objective:
      '<code>.cristalera</code>: fondo <code>rgb(173 216 230 / 0.6)</code>. <code>.estufa</code>: resplandor sin desplazar, de <b>16px</b>, <code>orange</code>. <code>.rotulo</code>: sombra de letra de <b>2px</b> a la derecha y <b>2px</b> abajo, sin desenfoque, <code>steelblue</code>.',
    hint: '<code>background-color: rgb(173 216 230 / 0.6);</code> · <code>box-shadow: 0 0 16px orange;</code> · <code>text-shadow: 2px 2px 0 steelblue;</code>',
    pieces: [
      'h2@rotulo:Invernadero cerrado por helada',
      'div@cristalera:Cristalera',
      'div@estufa:Estufa',
    ],
    rules: [
      hidden('.rotulo', 'font-size: 24px;\nmargin-bottom: 16px;'),
      hidden('.cristalera', 'height: 60px;\nmargin-bottom: 22px;'),
      hidden('.estufa', 'width: 120px;\nmargin: 0 auto;'),
      { selector: '.cristalera', solution: 'background-color: rgb(173 216 230 / 0.6);' },
      { selector: '.estufa', solution: 'box-shadow: 0 0 16px orange;' },
      { selector: '.rotulo', solution: 'text-shadow: 2px 2px 0 steelblue;' },
    ],
    farewell:
      '¡Salvados! Ni un esqueje congelado. Ahora sube al Observatorio de las Medidas: Astrolabio lo calcula todo, hasta cuánta luz cabe en un cristal. Y no le preguntes la hora, que te la da con decimales.',
  },
];
