/**
 * UI sounds and the kalimba scores of the surface, the underground, the sky and the isle.
 *
 * The public face of the audio modules: `sound` for effects, `music` for the background score and
 * `configureAudio` for the player's settings. Importing it also arms the autoplay unlock and the
 * pause on hidden tabs (see lifecycle.ts).
 */
export { configureAudio } from './configure';
export { onFirstGesture } from './lifecycle';
export { music } from './music/player';
export { sound } from './sound';
