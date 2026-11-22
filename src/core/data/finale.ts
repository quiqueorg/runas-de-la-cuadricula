/** Final battle: The Void Between Worlds. */
import type { LevelDraft, PieceTypeMap, Region } from '../models';

// ═══════════════════════════════════════════════════════════════
//  THE VOID BETWEEN WORLDS · final battle
//  It opens when the three adventures are complete. Each phase mixes
//  what was learned: Grid, Flexbox, media queries, variables and transitions.
// ═══════════════════════════════════════════════════════════════
export const finaleRegions: Region[] = [
  {
    n: 'El Vacío entre los Mundos', sub: 'Combate final', x: 0.5, y: 0.5, radio: 0.2, t: 'vacio', icono: 'garabato',
    pj: 'El Desmaquetador', rol: 'el garabato que deshace los mundos', al: 'al Desmaquetador', examen: true, jefe: true,
    pullas: ['¡Garabato va, garabato viene!', '¡Todo queda mejor torcido!', '¡display: none para tus esperanzas!', '¡Te falta un punto y coma… en el alma!', '¡Mi estilo favorito es ninguno!', '¡Qué bonito desorden has hecho!'],
  },
];

export const finalePieceTypes: PieceTypeMap = {
  muro: { a: 'sillares' }, torre: { a: 'sillares', i: 'faro' }, sala: { a: 'marmol' }, nucleo: { a: 'tormenta', i: 'garabato' },
  cabecera: { a: 'tejas', i: 'bandera' }, atlas: { a: 'atlas' }, brujula: { a: 'tablones', i: 'orbe' }, base: { a: 'marmol', i: 'arena' },
  corona: { o: 'corona' }, astilla: { a: 'obsidiana', i: 'cristal' },
};

export const FINALE_GRID = ['display', 'grid-template-columns', 'grid-template-rows', 'grid-template-areas', 'grid-auto-rows', 'gap', 'grid-column', 'grid-row', 'grid-area'];
export const FINALE_FLEX = ['display', 'flex-direction', 'flex-wrap', 'justify-content', 'align-items', 'align-self', 'gap', 'order', 'flex-grow', 'flex'];
export const FINALE_MEDIA = ['min-width', 'max-width', 'width', 'and', '<', '<=', '>='];
export const FINALE_TRANSITION = ['transition', 'transition-property', 'transition-duration', 'transition-timing-function', 'transition-delay', 'transform'];
export const uniqueList = (...lists: readonly (readonly string[])[]): string[] => [...new Set(lists.flat())];

export const finaleLevels: LevelDraft[] = [
  {
    id: 'x0-1', r: 0, n: 'Los cimientos', fase: 'Grid y Flexbox', examen: true, t: 'ciudadela', dim: false, w: 460, h: 320, ok: uniqueList(FINALE_GRID, FINALE_FLEX),
    enc: '¡JI, JI! Has ordenado tres mundos… qué aburrimiento. Yo vivo entre ellos y me alimento de desorden. ¿Quieres detenerme? Empieza por levantar estos cimientos: una cuadrícula… ¡y dentro, una fila!',
    obj: 'Rejilla con columnas <code>80px 1fr 80px</code>, filas <code>60px 1fr 50px</code> y 8px de hueco. El muro de arriba y el de abajo ocupan toda la fila; en medio, torre, sala y torre. La sala es flex: centra las tres gemas en vertical y deja cuatro huecos horizontales iguales, incluidos los dos de los extremos (<code>space-evenly</code>).',
    p: ['muro@cima', 'torre', 'sala', ['gema', 'gema', 'gema'], 'torre', 'muro@base'],
    b: [{ s: '.tablero', sol: 'display: grid;\ngrid-template-columns: 80px 1fr 80px;\ngrid-template-rows: 60px 1fr 50px;\ngap: 8px;' }, { s: '.cima', sol: 'grid-column: 1 / -1;' }, { s: '.base', sol: 'grid-column: 1 / -1;' }, { s: '.sala', sol: 'display: flex;\njustify-content: space-evenly;\nalign-items: center;' }, { s: '.gema', f: 'width: 44px;\nheight: 44px;', ed: false }],
  },
  {
    id: 'x0-2', r: 0, n: 'El mapa que se encoge', fase: 'Grid y media queries', examen: true, t: 'lago', dim: false, anchos: [340, 620], h: 360, ok: uniqueList(FINALE_GRID, FINALE_MEDIA),
    enc: '¡Mira lo que hago con tu mapa! Lo estiro, lo encojo… ¡y lo descoloco! En pantallas estrechas te lo apilo todo; en las anchas, a ver si sabes dónde va cada cosa.',
    obj: '<b>340px:</b> cabecera, atlas, brújula y base apilados, con filas de <code>50px 1fr 60px 40px</code> y 8px de hueco. <b>620px</b> (a partir de 500px): la cabecera arriba de lado a lado; debajo, el atlas y la brújula (columnas <code>1fr 140px</code>); la base abajo de lado a lado. Filas <code>50px 1fr 40px</code>.',
    p: ['cabecera', 'atlas', 'brujula', 'base'],
    b: [
      { s: '.tablero', sol: 'display: grid;\ngap: 8px;\ngrid-template-areas:\n  "cab"\n  "atlas"\n  "bru"\n  "base";\ngrid-template-rows: 50px 1fr 60px 40px;' },
      { s: '.cabecera', f: 'grid-area: cab;', ed: false }, { s: '.atlas', f: 'grid-area: atlas;', ed: false }, { s: '.brujula', f: 'grid-area: bru;', ed: false }, { s: '.base', f: 'grid-area: base;', ed: false },
      { s: '.tablero', m: { sol: '(min-width: 500px)' }, sol: 'grid-template-areas:\n  "cab cab"\n  "atlas bru"\n  "base base";\ngrid-template-columns: 1fr 140px;\ngrid-template-rows: 50px 1fr 40px;' },
    ],
  },
  {
    id: 'x0-3', r: 0, n: 'Los nombres del caos', fase: 'Variables, calc() y media queries', examen: true, t: 'cristal', anchos: [340, 620], h: 220, ok: uniqueList(FINALE_FLEX, FINALE_MEDIA, ['--u']),
    enc: '¡Mis runas crecen y menguan con un solo nombre! Si no lo conoces, se quedan sin forma… ¡como a mí me gustan!',
    obj: 'Fila centrada en las dos direcciones con un hueco de <code>var(--u)</code>. Las piezas ya miden <code>calc(var(--u) * 3)</code> (el orbe, <code>* 5</code>). <code>--u</code> vale <b>14px</b> y, a partir de 500px de ancho, <b>22px</b>.',
    p: ['runa', 'runa', 'orbe@grande', 'runa', 'runa'],
    b: [{ s: '.tablero', sol: 'display: flex;\njustify-content: center;\nalign-items: center;\ngap: var(--u);\n--u: 14px;' }, { s: '.pieza', f: 'width: calc(var(--u) * 3);\nheight: calc(var(--u) * 3);', ed: false }, { s: '.grande', f: 'width: calc(var(--u) * 5);\nheight: calc(var(--u) * 5);', ed: false }, { s: '.tablero', m: { sol: '(min-width: 500px)' }, sol: '--u: 22px;' }],
  },
  {
    id: 'x0-4', r: 0, n: 'El latido del garabato', fase: 'Transiciones, :hover y variables', examen: true, t: 'tormenta', estado: 'hover', cmp: ['transform'], w: 440, h: 240, ok: uniqueList(FINALE_TRANSITION, ['--t']),
    enc: '¡Ji, ji, ji! Mis escudos tiemblan cuando los miras… ¡pero cada uno a su ritmo! Ritmos guardados en un nombre, claro. ¿Te acuerdas de cuál?',
    obj: 'Con el cursor encima, cada escudo crece y gira (<code>scale(1.3) rotate(10deg)</code>). La transición de <code>transform</code> dura <code>var(--t)</code> con <code>ease-out</code>: <code>--t</code> vale <b>0.4s</b> en el tablero y <b>1.2s</b> en el escudo lento.',
    p: ['escudo', 'escudo@lento', 'escudo'],
    b: [{ s: '.tablero', f: 'display: flex;\njustify-content: space-around;\nalign-items: center;', sol: '--t: 0.4s;' }, { s: '.escudo', sol: 'transition: transform var(--t) ease-out;' }, { s: '.escudo:hover', sol: 'transform: scale(1.3) rotate(10deg);' }, { s: '.lento', sol: '--t: 1.2s;' }],
  },
  {
    id: 'x0-5', r: 0, n: 'Los tres anchos', fase: 'Flexbox, order y rangos', examen: true, t: 'boveda', anchos: [340, 560, 700], h: 300, ok: uniqueList(FINALE_FLEX, FINALE_MEDIA),
    enc: '¡Tres pantallas, tres trampas! En una, todo de pie; en otra, todo en fila; en la grande, todo desparramado. Y la corona… ¡la corona siempre quiere ir primero cuando hay poco sitio!',
    obj: 'Fila con 10px de hueco. Con <b>menos de 450px</b>: columna centrada y la corona la primera. Con <b>650px o más</b>: el primero y el último pegados a los bordes (<code>space-between</code>). Usa la sintaxis de rango.',
    p: ['astilla', 'astilla', 'corona', 'astilla'],
    req: [{ cond: true, re: /width\s*[<>]|[<>]=?\s*width/, m: 'Escribe las condiciones con la sintaxis de rango' }],
    b: (() => { const a = { sol: '(width < 450px)' }, b2 = { sol: '(width >= 650px)' }; return [{ s: '.tablero', sol: 'display: flex;\ngap: 10px;' }, { s: '.tablero', m: a, sol: 'flex-direction: column;\nalign-items: center;' }, { s: '.corona', m: a, sol: 'order: -1;' }, { s: '.tablero', m: b2, sol: 'justify-content: space-between;' }]; })(),
  },
  {
    id: 'x0-6', r: 0, n: 'El último trazo', fase: 'Todo a la vez', examen: true, t: 'vacio', estado: 'activo', dim: false, anchos: [360, 600], h: 300, ok: uniqueList(FINALE_GRID, FINALE_FLEX, FINALE_MEDIA, FINALE_TRANSITION, ['--hueco']),
    enc: '¡NO! ¡Ni se te ocurra! Si mi núcleo gira y se encoge… ¡me borraré del todo! ¡Nadie sabe hacer las cinco cosas a la vez! ¡NADIE!',
    obj: 'Rejilla de una columna con hueco <code>var(--hueco)</code> (<b>10px</b>); a partir de 500px, columnas <code>2fr 1fr</code> y <code>--hueco</code> de <b>16px</b>. La sala es flex: gemas centradas en las dos direcciones, separadas por <code>var(--hueco)</code>. Al activar, el núcleo gira y se encoge en <b>1s</b> con <code>ease-in-out</code>.',
    p: ['sala', ['gema', 'gema', 'gema'], 'nucleo'],
    b: [
      { s: '.tablero', sol: 'display: grid;\ngrid-template-columns: 1fr;\ngap: var(--hueco);\n--hueco: 10px;' },
      { s: '.tablero', m: { sol: '(min-width: 500px)' }, sol: 'grid-template-columns: 2fr 1fr;\n--hueco: 16px;' },
      { s: '.sala', sol: 'display: flex;\njustify-content: center;\nalign-items: center;\ngap: var(--hueco);' },
      { s: '.nucleo', sol: 'transition: transform 1s ease-in-out;' },
      { s: '.gema', f: 'width: 44px;\nheight: 44px;', ed: false },
      { s: '.tablero.activo .nucleo', f: 'transform: rotate(180deg) scale(0.4);', ed: false },
    ],
    fin: 'Nooo… mis garabatos… se están… alineando… Qué bonito queda. Maldita sea. Qué bonito queda.',
  },
];
