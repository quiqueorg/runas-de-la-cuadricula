/** Exams the Aula Magna gained when the trail grew (ids b7-6 onwards). Player-facing copy stays in Spanish. */
import type { LevelDraft, PieceTypeMap } from '../../models';
import { BG, GAP, GOLD, ISLE, fixed, hidden, pick } from './helpers';

/** Piece types only this file uses; merged into the isle's own. */
export const pieceTypes: PieceTypeMap = {};

export const lessons: LevelDraft[] = [
  {
    id: 'b7-6', r: ISLE.aula, n: 'Etiquetas rotas', examen: true, html: true, w: 440, h: 360, ok: [], cmp: [...BG, 'opacity'],
    enc: 'Tercera hoja de nuestro aprendiz anónimo. Volvió del Mercado muy crecido y quiso lucirse. Las declaraciones, impecables. Los selectores: uno confunde «empieza por» con «es igual a», otro pregunta al revés y el tercero grita cuando debería susurrar.',
    obj: 'Los enlaces cuyo <code>href</code> <b>empieza</b> por <code>https</code>, dorados. Los <code>.puesto</code> que <b>contienen</b> algo <code>.agotado</code>, a media opacidad. Y los párrafos de <code>#mostrador</code>, <code>lightblue</code>… sin quitarle el dorado a la <code>.oferta</code>.',
    p: [
      'a[href=https://isla.es]:Puerto seguro', 'a[href=http://viejo.isla]:Puerto viejo', 'a[href=https://mercado.isla]:Mercado',
      'div@puesto', ['p:Fresas'], 'div@puesto', ['p@agotado:Cerezas'],
      'section#mostrador', ['p:Sardinas', 'p@oferta:Pulpo', 'p:Almejas'],
    ],
    b: [
      hidden('a', 'display: inline-block;\nmargin: 0 8px 8px 0;'),
      hidden('.puesto', 'display: inline-block;\nwidth: 120px;\nmargin: 0 8px 8px 0;\npadding: 4px;\nborder: 2px solid #8a6a40;'),
      pick('a[href^="https"]', GOLD, 'a[href="https"]'),
      pick('.puesto:has(.agotado)', 'opacity: 0.5;', '.agotado:has(.puesto)'),
      pick(':where(#mostrador) p', 'background-color: lightblue;', '#mostrador p'),
      fixed('.oferta', GOLD),
      GAP,
    ],
  },
  {
    id: 'b7-7', r: ISLE.aula, n: 'El último escaparate', examen: true, anchos: [300, 560], h: 230,
    ok: ['width', 'margin', 'padding', 'background-image', 'box-shadow', 'white-space', 'overflow', 'text-overflow'],
    cmp: ['background-image', 'box-shadow', 'white-space', 'overflow-x', 'text-overflow'],
    enc: 'Última hoja. Esta no la rompió nadie: está en blanco. Quiero el cartel de la subasta de fin de curso. Que se vea en un muelle estrecho y en uno ancho, que brille como el Invernadero y que el lema no se desborde como la sopa de la cocina.',
    obj: '<code>.cartel</code>: tan ancho como pueda, pero <b>nunca más de 360px</b>, con una sola declaración de <code>width</code>; centrado; <b>12px</b> de relleno; fondo con un degradado de <code>gold</code> a <code>tomato</code> (de arriba abajo) y una sombra <code>teal</code> desplazada <b>6px</b> a la derecha y <b>6px</b> hacia abajo, sin desenfoque. <code>.lema</code>: en un solo renglón y, lo que no quepa, recortado con puntos suspensivos.',
    p: ['div@cartel', ['h2@titulo:Gran subasta de fin de curso', 'p@lema:Todo lo aprendido en la isla, a precio de saldo y sin devoluciones']],
    b: [
      { s: '.cartel', sol: 'width: min(100%, 360px);\nmargin: 0 auto;\npadding: 12px;\nbackground-image: linear-gradient(gold, tomato);\nbox-shadow: 6px 6px 0 teal;' },
      { s: '.lema', sol: 'white-space: nowrap;\noverflow: hidden;\ntext-overflow: ellipsis;' },
      hidden('.titulo', 'margin-bottom: 8px;'),
    ],
    fin: 'Aprobada. Del todo, esta vez: selectores, cajas, letras, sombras, cuentas y pergaminos. No lo diga muy alto, que se me suben los demás a las barbas. El barco zarpa al amanecer: en el continente le esperan las Ruinas de la Cuadrícula, los túneles y los cielos. Escriba con buena letra.',
  },
];
