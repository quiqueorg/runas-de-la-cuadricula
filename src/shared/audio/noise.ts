/** Noise buffers, made once when the engine starts so no note allocates an AudioBuffer. */

export interface NoiseBuffers {
  /** A fingernail tap on a kalimba tine. */
  readonly tapNoise: AudioBuffer;
  /** A hi-hat or clock tick. */
  readonly tickNoise: AudioBuffer;
  /** A breath that swells and fades: wind, waves and brushed drums. */
  readonly gustNoise: AudioBuffer;
  /** A rumbling roll of thunder. */
  readonly thunderNoise: AudioBuffer;
}

/** Samples faded in at the start of the short buffers, so they don't click. */
const TAP_FADE_IN = 16;
const TICK_FADE_IN = 32;
/** How sharply the tick dies away (exponent of its linear decay). */
const TICK_DECAY_CURVE = 2.2;

/**
 * Brown noise is white noise through a leaky integrator. Each sample keeps most of the previous one,
 * so the result wanders slowly and sounds like a low rumble instead of a hiss.
 */
const THUNDER_LEAK = 0.96;
const THUNDER_INPUT = 0.04;
/** Makes up for the level the integrator loses. */
const THUNDER_GAIN = 9;
const THUNDER_DECAY_CURVE = 1.6;
const THUNDER_FADE_IN = 300;
const THUNDER_FADE_OUT = 600;
/** A slow wobble in loudness, so the roll seems to come in waves. */
const THUNDER_ROLL_DEPTH = 0.6;
const THUNDER_ROLL_PERIOD = 900;

function whiteNoise(): number {
  return Math.random() * 2 - 1;
}

function createNoiseBuffer(
  context: AudioContext,
  seconds: number,
  sampleAt: (index: number, length: number) => number,
): AudioBuffer {
  const length = Math.max(1, Math.floor(context.sampleRate * seconds));
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const samples = buffer.getChannelData(0);
  for (let index = 0; index < length; index++) samples[index] = sampleAt(index, length);
  return buffer;
}

export function createNoiseBuffers(context: AudioContext): NoiseBuffers {
  const tapNoise = createNoiseBuffer(context, 0.012, (index, length) => {
    const fadeIn = index < TAP_FADE_IN ? index / TAP_FADE_IN : 1;
    return whiteNoise() * fadeIn * (1 - index / length);
  });
  const tickNoise = createNoiseBuffer(context, 0.04, (index, length) => {
    const fadeIn = index < TICK_FADE_IN ? index / TICK_FADE_IN : 1;
    return whiteNoise() * fadeIn * (1 - index / length) ** TICK_DECAY_CURVE;
  });
  const gustNoise = createNoiseBuffer(
    context,
    2.4,
    (index, length) => whiteNoise() * Math.sin((Math.PI * index) / length),
  );
  let brown = 0;
  const thunderNoise = createNoiseBuffer(context, 2.0, (index, length) => {
    brown = brown * THUNDER_LEAK + whiteNoise() * THUNDER_INPUT;
    const fadeIn = index < THUNDER_FADE_IN ? index / THUNDER_FADE_IN : 1;
    const fadeOut = index > length - THUNDER_FADE_OUT ? (length - index) / THUNDER_FADE_OUT : 1;
    const roll = 1 + THUNDER_ROLL_DEPTH * Math.sin(index / THUNDER_ROLL_PERIOD);
    return Math.max(
      -1,
      Math.min(
        1,
        brown *
          THUNDER_GAIN *
          (1 - index / length) ** THUNDER_DECAY_CURVE *
          fadeIn *
          fadeOut *
          roll,
      ),
    );
  });
  return { tapNoise, tickNoise, gustNoise, thunderNoise };
}
