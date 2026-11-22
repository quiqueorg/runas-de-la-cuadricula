# Runas de la Cuadrícula

Un juego para aprender CSS escribiéndolo. Cada ejercicio es un tablero y una tablilla: escribes las declaraciones, las piezas se colocan y, si coinciden con el objetivo, sigues camino por el mapa.

**Jugar:** <https://quiqueorg.github.io/runas-de-la-cuadricula/>

## Los mundos

| Mundo | Enseña | Ids | Datos |
| --- | --- | --- | --- |
| La Isla del Aprendiz | Fundamentos: selectores, cascada, unidades, colores, texto, modelo de caja, flujo, `float`, `position` | `b0-1` | `src/core/data/base.ts` |
| Las Ruinas de la Cuadrícula | CSS Grid | `1-1` | `src/core/data/grid.ts` |
| El Subsuelo Flexible | Flexbox | `f0-1` | `src/core/data/flex.ts` |
| Los Cielos Cambiantes | Media queries, variables y transiciones | `c0-1` | `src/core/data/sky.ts` |
| El Vacío entre los Mundos | Combate final, todo a la vez | `x0-1` | `src/core/data/finale.ts` |

Los mundos de Grid y de Flexbox son **puros**: sus ejercicios no piden propiedades del otro. Lo que mezcla técnicas va en los cielos o en el final.

## Puesta en marcha

Hace falta Node 22 (o 20.19 en adelante) y pnpm: `corepack enable` o `npm install -g pnpm`.

```sh
pnpm install
pnpm dev          # http://localhost:5173
```

| Orden | Qué hace |
| --- | --- |
| `pnpm dev` | Servidor de desarrollo |
| `pnpm run check` | Tipos, catálogo de ejercicios y build: lo mismo que pasa en GitHub |
| `pnpm run check:lessons` | Solo el catálogo (dos segundos) |
| `pnpm build` | Tipos y build de producción en `dist/` |
| `pnpm preview` | Sirve `dist/` |
| `pnpm music` | Vuelve a generar los bucles de kalimba de `assets/` |

## Estructura

```
src/core/         catálogo, modelos, partida guardada, navegación
src/core/data/    los ejercicios, un archivo por mundo
src/features/     home, map (mapas y sus habitantes) y challenge (el tablero y su motor)
src/shared/       botones, diálogos, audio, iconos
scripts/          comprobación del catálogo y generador de música
assets/           mapas, texturas y audio
```

Los textos del juego van en español; los comentarios del código, en inglés.

## Añadir o cambiar un ejercicio

Un ejercicio es un objeto en el archivo de su mundo:

```ts
{
  id: 'b2-9', r: 2, n: 'Nombre del ejercicio',
  ok: ['color'],                    // runas que se ofrecen; cualquier otra propiedad se rechaza
  c: ['colores'],                   // conceptos, para los filtros del índice
  enc: 'Lo que dice el personaje.',
  teo: '<p>La teoría, en HTML.</p>',
  obj: 'Qué hay que conseguir.',
  pista: '<code>color: tomato;</code> en <code>.aviso</code>.',
  p: ['p@aviso:Cuidado con la pintura'],
  b: [{ s: '.aviso', sol: 'color: tomato;' }],
}
```

- **Piezas (`p`)**: `tipo@clase.clase#id:texto`. Una `#` delante la fija al tablero. Un array después de una pieza son sus hijos.
- **Reglas (`b`)**: `s` es el selector; `sol`, la solución; `f`, declaraciones fijas que se ven pero no se editan; `ini`, lo que ya viene escrito; `ed: false`, regla entera fija; `oculto`, fija y sin mostrar; `sel`, el selector lo escribe quien juega (y `s` es la solución); `m`, la media query que la envuelve.
- **Ayudas**: `pistasPrevias` (pistas más suaves antes de `pista`) y `despistes` (`{ si: { propiedad: valor }, m }`: un mensaje para un error reconocible).
- **Variantes**: `esp` (`'contra reloj'` con `tiempo`, `'a oscuras'`, `'musical'`…), `examen`, `estado` (`'hover'`, `'pulsa'`, `'foco'`, `'activo'`), `vistas` (varios tamaños o dispositivos), `html: true` (enseña el marcado del tablero), `cmp` (estilos calculados que se comparan además de la posición), `req` y `encima` (condiciones extra).

Reglas que conviene no saltarse:

1. **El `id` es la clave de las partidas guardadas.** No se renumera ni se reutiliza. Un ejercicio nuevo va al final de su región con el número siguiente; si la región terminaba con un `fin` (la despedida), se mueve al nuevo último.
2. Todo lo que escribe `sol` tiene que estar en `ok`, también las variables (por su nombre, o todas a la vez con `'--*'`).
3. Cada etiqueta de `c` y cada `esp` tiene que figurar en los filtros de su mundo (`*_GROUPS` en `src/core/catalog.ts`), o no se podrá buscar.
4. Un tipo de pieza nuevo se declara en el `…PieceTypes` de su mundo: `o` o `i` es su dibujo (`i-nombre` en los símbolos), `a` su material (una clase `.m-nombre` en el CSS), `tag` lo convierte en un elemento HTML de verdad.

`pnpm run check:lessons` avisa de casi todo lo anterior.

## Comprobar que todo se resuelve

El catálogo se puede jugar solo. Abre el juego con `?test` y, en la consola:

```js
await __runas.comprobar()       // todos: que no lleguen resueltos y que su solución los resuelva
await __runas.comprobar('b')    // solo la isla; 'b4-' sería una región
__runas.rellenar('b4-7')        // abre un ejercicio y escribe su solución
```

`comprobar()` usa una partida vacía mientras dura y deja la tuya como estaba. Tarda un par de minutos.

## El mapa

- `src/features/map/scenery.json`: dónde está cada efecto y cada habitante de cada mundo, en fracciones del mapa (0 a 1).
- `src/features/map/inhabitants.json`: nombre, dibujo y chistes de cada habitante. Con `"cur": true` es una curiosidad que se mira, no un personaje.
- Un **lugar secreto** es un ejercicio con `secreto: { x, y, w, dib, pista }` en la región de secretos de su mundo. Necesita su dibujo `dib-<dib>` en los símbolos, su proporción en `SECRET_BOX` (`src/features/map/model.ts`) y algo pintado en el mapa donde pulsar.
- El mapa de la isla es SVG (`Isle.tsx`); los demás son imágenes de `assets/` con efectos por encima (`Effects.tsx`).

## Partidas guardadas

Se guardan en `localStorage` con la clave `runas-cuadricula-v1`. Su forma es un contrato (`src/core/state.ts`): si cambia, hace falta una migración en `migrateSave`.

## Publicación

Cada `push` a `main` ejecuta `.github/workflows/deploy.yml`: comprueba el catálogo, compila y publica en GitHub Pages. Las pull requests pasan por `ci.yml` (`pnpm run check`). Dependabot propone una vez al mes las actualizaciones de las acciones y de las dependencias.

La versión de pnpm está fijada en `packageManager`; si se cambia, hay que regenerar `pnpm-lock.yaml` (`pnpm install`) en el mismo commit, porque GitHub instala con `--frozen-lockfile`.

¿Algo no funciona o falta un contenido? [Abre una incidencia](https://github.com/quiqueorg/runas-de-la-cuadricula/issues/new/choose).
