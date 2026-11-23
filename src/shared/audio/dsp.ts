/** Small Web Audio helpers shared by the effects and the music. */

/**
 * The quietest level an envelope aims for. Exponential ramps and `setTargetAtTime` can never reach
 * zero, so envelopes fall to this (about -80 dB) and only then step to a true zero.
 */
export const SILENT = 0.0001;

/** Below this a partial is inaudible on phone speakers and only wastes a voice. */
const LOWEST_AUDIBLE_HZ = 20;

/**
 * Oscillators above this fraction of the sample rate alias into audible junk on the low sample
 * rates some phones run at, so such partials are skipped.
 */
const NYQUIST_GUARD = 0.42;

/** True for a frequency too low to bother playing. */
export function isInaudible(frequency: number): boolean {
  return frequency <= LOWEST_AUDIBLE_HZ;
}

/** True for a frequency close enough to Nyquist to alias. */
export function wouldAlias(context: BaseAudioContext, frequency: number): boolean {
  return frequency >= context.sampleRate * NYQUIST_GUARD;
}

/** True unless the frequency is inaudible or would alias. */
export function isPlayable(context: BaseAudioContext, frequency: number): boolean {
  return !(isInaudible(frequency) || wouldAlias(context, frequency));
}

/** Glides a gain from wherever it is now towards `target`, with time constant `tau` (s). */
export function glideGain(param: AudioParam, target: number, now: number, tau: number): void {
  param.cancelScheduledValues(now);
  param.setValueAtTime(Math.max(SILENT, param.value), now);
  param.setTargetAtTime(target, now, tau);
}

/**
 * The level `setTargetAtTime(SILENT, …, tau)` has reached after `elapsed` seconds from `peak`.
 * Envelopes pin this value and then ramp to zero, so the oscillator stops without a click.
 */
export function decayedLevel(peak: number, elapsed: number, tau: number): number {
  return SILENT + (peak - SILENT) * Math.exp(-elapsed / tau);
}

/** A random offset in ±spread/2 seconds, so notes don't land with machine precision. */
export function jitter(spread: number): number {
  return (Math.random() - 0.5) * spread;
}
