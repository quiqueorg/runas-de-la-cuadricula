# Runas de la Cuadrícula

Un juego para aprender CSS escribiéndolo. Cada ejercicio es un tablero y una tablilla: escribes las declaraciones, las piezas se colocan y, si coinciden con el objetivo, sigues camino por el mapa.

**Jugar:** <https://quiqueorg.github.io/runas-de-la-cuadricula/>

## Los mundos

| Mundo                       | Enseña                                                                                                                                                                                                         | Id del mundo | Ids    | Datos                                           |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ------ | ----------------------------------------------- |
| La Isla del Aprendiz        | Fundamentos: selectores (también de atributo, `:is()`, `:where()`, `:has()`), cascada, unidades y funciones, colores, sombras y degradados, texto, pseudoelementos, modelo de caja, flujo, `float`, `position` | `isle`       | `b0-1` | `src/core/data/isle.ts` y `src/core/data/isle/` |
| Las Ruinas de la Cuadrícula | CSS Grid                                                                                                                                                                                                       | `grid`       | `1-1`  | `src/core/data/grid.ts`                         |
| El Subsuelo Flexible        | Flexbox                                                                                                                                                                                                        | `flex`       | `f0-1` | `src/core/data/flex.ts`                         |
| Los Cielos Cambiantes       | Media queries, variables y transiciones                                                                                                                                                                        | `sky`        | `c0-1` | `src/core/data/sky.ts`                          |
| El Vacío entre los Mundos   | Combate final, todo a la vez                                                                                                                                                                                   | `finale`     | `x0-1` | `src/core/data/finale.ts`                       |

Los mundos de Grid y de Flexbox son **puros**: sus ejercicios no piden propiedades del otro. Lo que mezcla técnicas va en los cielos o en el final.

## Puesta en marcha

Hace falta Node 22 (o 20.19 en adelante) y pnpm: `corepack enable` o `npm install -g pnpm`.

```sh
pnpm install
pnpm dev          # http://localhost:5173
```

| Orden                    | Qué hace                                                                                                                      |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| `pnpm dev`               | Servidor de desarrollo                                                                                                        |
| `pnpm run check`         | Biome (formato y lint), tipos, catálogo de ejercicios y build: lo mismo que pasa en GitHub                                    |
| `pnpm run lint`          | Solo Biome                                                                                                                    |
| `pnpm run format`        | Formatea y aplica los arreglos seguros de Biome                                                                               |
| `pnpm run check:lessons` | Solo el catálogo (dos segundos)                                                                                               |
| `pnpm build`             | Tipos y build de producción en `dist/`                                                                                        |
| `pnpm preview`           | Sirve `dist/`                                                                                                                 |
| `pnpm music`             | Vuelve a generar los bucles de kalimba de `assets/` (solo el del menú: los mundos se tocan en directo en `src/shared/audio/`) |
| `pnpm isle-map`          | Vuelve a pintar el mapa de la isla (`assets/mapa-isla.jpg`); necesita Chrome                                                  |

## Estructura

Las capas solo miran hacia abajo: `app` usa `features`, que usan `core` y `shared`; `core` y `shared` no conocen ninguna pantalla.

```
src/main.tsx                 arranque: ajustes → audio, sincronización en la nube, render
src/app/                     la aplicación: rutas, diálogos, estilos en orden de cascada, autocomprobación
src/core/models.ts           el modelo: mundos, regiones, ejercicios, piezas
src/core/data/               los ejercicios, un archivo por mundo (la isla, además, una carpeta por región)
src/core/catalog/            el catálogo: normaliza los borradores, consultas fijas, auditoría
src/core/progress/           la partida: almacén con acciones, consultas, formato guardado, nube
src/core/navigation.ts       rutas por hash (#mapa, #prueba-<id>)
src/features/home/           la portada
src/features/map/            los mapas, sus habitantes, el índice de ejercicios
src/features/challenge/      el ejercicio: tablero, tablilla y su evaluación
src/features/settings/       controles de ajustes que comparten las pantallas
src/shared/                  piezas genéricas: botones, diálogos, audio, iconos, lienzos
scripts/                     auditoría del catálogo, generador de música y pintor del mapa de la isla
assets/                      mapas, texturas y audio
```

Dentro de `features/challenge/`: `evaluate.ts` aplica la tablilla al tablero y emite el veredicto (sin guardar ni sonar); `css/` lee lo que se escribe (declaraciones, media queries, selectores, transiciones); `board/` mide el tablero y calcula guías y plano; `hooks/` y `components/` son la pantalla; `victory.ts`, `exam.ts` y `clock.ts` son la lógica pura del resultado, las entregas y el reloj.

Los textos del juego van en español; el código y sus comentarios, en inglés. Las clases CSS que escribe quien juega (`.tablero`, `.pieza`, `.activo`, los tipos de pieza) siguen en español porque son parte de los ejercicios. Las convenciones de código están en `.github/copilot-instructions.md`.

## Añadir o cambiar un ejercicio

Un ejercicio es un objeto en el archivo de su mundo (`LevelDraft` en `src/core/models.ts`, donde cada campo está documentado):

```ts
{
  id: 'b2-9',
  region: 2,                              // región dentro de su mundo
  title: 'Nombre del ejercicio',
  allowed: ['color'],                     // runas que se ofrecen; cualquier otra propiedad se sella
  concepts: ['colores'],                  // para los filtros del índice
  speech: 'Lo que dice el personaje.',
  theory: '<p>La teoría, en HTML.</p>',
  objective: 'Qué hay que conseguir.',
  hint: '<code>color: tomato;</code> en <code>.aviso</code>.',
  pieces: ['p@aviso:Cuidado con la pintura'],
  rules: [{ selector: '.aviso', solution: 'color: tomato;' }],
  farewell: 'Lo que dice el personaje al resolverlo.',
}
```

- **Piezas (`pieces`)**: `tipo@clase.clase#id[atributo=valor]:texto`. Una `#` delante la fija al tablero. Los atributos (`[data-precio=3]`, `[href=https://isla.es]`, `[title]`) son opcionales y sirven para los selectores de atributo. Un array después de una pieza son sus hijos.
- **Reglas (`rules`)**: `selector`; `solution`; `fixed`, declaraciones fijas que se ven pero no se editan; `initial`, lo que ya viene escrito; `editable: false`, regla entera fija; `hidden`, fija y sin mostrar; `ownSelector`, el selector lo escribe quien juega (empieza con ese texto y `selector` es la solución); `media`, la media query que la envuelve (texto fijo, o `{ solution, initial }` si la escribe quien juega).
- **Ayudas**: `earlyHints` (pistas más suaves antes de `hint`) y `missteps` (`{ selector?, when: { propiedad: valor }, message }`: un mensaje para un error reconocible).
- **Variantes**: `variant` (`'contra reloj'` con `timeLimit` y `timeMessages: { expired, late }`, `'a oscuras'`, `'musical'`…), `exam`, `state` (`'active'`, `'hover'`, `'pressed'`, `'focus'`), `views` (varios tamaños o dispositivos) o `widths`, `showMarkup` (enseña el marcado del tablero), `compare` (estilos calculados que se comparan además de la posición), `checks` y `above` (`{ upper, lower, message }`) como condiciones extra, `purse` (regateo).

Reglas que conviene no saltarse:

1. **El `id` es la clave de las partidas guardadas.** No se renumera ni se reutiliza. Un ejercicio nuevo va al final de su región con el número siguiente; si la región terminaba con un `farewell` especial (la despedida), se mueve al nuevo último. En la isla, el número que ve quien juega sale del orden de las regiones y de la posición del ejercicio en la suya, no del id: por eso el Aula Magna conserva `b7` aunque sea la última región, y las cuatro regiones que van después del Faro usan `b8` a `b11`.
2. Todo lo que escribe `solution` tiene que estar en `allowed`, también las variables (por su nombre, o todas a la vez con `'--*'`).
3. Cada etiqueta de `concepts` y cada `variant` tiene que figurar en los filtros de su mundo (`filters`, al final del archivo del mundo), o no se podrá buscar.
4. Un tipo de pieza nuevo se declara en las `pieceTypes` de su mundo: `token` o `icon` es su dibujo (`i-nombre` en los símbolos), `material` su textura (una clase `.m-nombre` en el CSS), `tag` lo convierte en un elemento HTML de verdad.

`pnpm run check:lessons` avisa de casi todo lo anterior (`src/core/catalog/audit.ts`).

## Comprobar que todo se resuelve

El catálogo se puede jugar solo. Abre el juego con `?test` y, en la consola:

```js
await __runas.comprobar(); // todos: que no lleguen resueltos y que su solución los resuelva
await __runas.comprobar('b'); // solo la isla; 'b4-' sería una región (con guion: 'b1' también recoge b10 y b11)
__runas.rellenar('b4-7'); // abre un ejercicio y escribe su solución
```

`comprobar()` usa una partida vacía mientras dura y deja la tuya como estaba. Tarda un par de minutos.

## El mapa

- `src/features/map/scenery.json`: dónde está cada efecto y cada habitante de cada mundo, en fracciones del mapa (0 a 1).
- `src/features/map/inhabitants.json`: nombre, dibujo, voz y chistes de cada habitante. Con `"curio": true` es una curiosidad que se mira, no un personaje.
- Un **lugar secreto** es un ejercicio con `secret: { x, y, width, drawing, hint }` en la región de secretos de su mundo. Necesita su dibujo `dib-<drawing>` en los símbolos, su proporción en `SECRET_BOX` (`src/features/map/scene.ts`) y algo pintado en el mapa donde pulsar.
- `src/features/map/scene.ts` decide qué muestra el mapa para una partida; `state.ts`, qué significa cada clic. Las vistas solo dibujan.
- Todos los mapas son imágenes de `assets/` con efectos por encima. El de la isla, `assets/mapa-isla.jpg`, se pinta en código: `scripts/isle-chart.ts` lo dibuja (semilla fija: biomas, bosque, picos, ríos, campos y pueblos) y `pnpm isle-map` lo hornea a 2400 × 1650 con Chrome sin ventana (si no lo encuentra, `CHROME=/ruta/al/navegador`). Si cambias el dibujo, vuelve a hornearlo y sube la imagen en el mismo commit. `landscape/Isle.tsx` solo añade lo que se mueve; los efectos animados de cada mundo están en `effects/`.
- Las coordenadas de la isla (`ISLE_SPOTS`, `CURIOS` en `src/features/map/isleLayout.ts`) están en la hoja de 660 × 454; en `scenery.json` van divididas entre 660 y 454.

## Partidas guardadas

Se guardan en `localStorage` con la clave `runas-cuadricula-v1`, y en la nube cuando el entorno la ofrece. El documento guardado (`StoredProgress` en `src/core/progress/storage.ts`) lleva una versión (`VERSION`) y el juego solo lee partidas de la versión actual: las anteriores se descartan, no se migran. Si cambia su forma, cómo se escribe un campo o algún id de lección, se sube `VERSION`. El mundo se guarda con su id actual (`isle`, `grid`, `flex`, `sky`, `finale`). El juego lo lee y lo escribe a través de `fromStored` y `toStored`.

## Publicación

Cada `push` a `main` ejecuta `.github/workflows/deploy.yml`: comprueba el catálogo, compila y publica en GitHub Pages. Las pull requests pasan por `ci.yml` (`pnpm run check`). Dependabot propone una vez al mes las actualizaciones de las acciones y de las dependencias.

La versión de pnpm está fijada en `packageManager`; si se cambia, hay que regenerar `pnpm-lock.yaml` (`pnpm install`) en el mismo commit, porque GitHub instala con `--frozen-lockfile`.

¿Algo no funciona o falta un contenido? [Abre una incidencia](https://github.com/quiqueorg/runas-de-la-cuadricula/issues/new/choose).
