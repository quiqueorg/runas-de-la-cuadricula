/**
 * A small, cheap stereo room for the music (no ConvolverNode).
 *
 * An earlier 173/241 ms ping-pong delay repeated every pluck as a distinct, quieter copy a moment
 * later, which made one kalimba sound like a second one trailing behind it. Short damped combs and
 * allpass diffusers (a Schroeder reverb) blur the repeats into a smooth tail of about a second.
 */

const SEND_LEVEL = 0.26;
/** Keeps kicks and bass from booming in the room. */
const LOW_CUT_HZ = 180;
/** Each comb loses high end on every pass, like a real room's walls. */
const DAMPING_HZ = 3600;
/** A negative Q gives a Butterworth response: no resonant peak inside the feedback loop. */
const DAMPING_Q = -3;
const COMB_FEEDBACK = 0.8;
const COMB_MIX = 0.3;
const ALLPASS_GAIN = 0.5;
const COMB_MAX_DELAY = 0.1;
const ALLPASS_MAX_DELAY = 0.05;

/**
 * Delay times (s) for each channel. They differ slightly between left and right for width, and
 * don't share common multiples, so the echoes never pile up on the same instant.
 */
const CHANNELS = [
  { combs: [0.0253, 0.029, 0.0322, 0.0353], diffusers: [0.0126, 0.0077] },
  { combs: [0.0269, 0.0307, 0.0338, 0.0367], diffusers: [0.0131, 0.0083] },
] as const;

/**
 * Schroeder allpass: y = -g·w + w[n-d], w = x + g·w[n-d]. It smears echoes in time without
 * colouring the tone.
 */
function createAllpass(
  context: AudioContext,
  input: AudioNode,
  delaySeconds: number,
  gain: number,
): AudioNode {
  const sum = context.createGain();
  const delay = context.createDelay(ALLPASS_MAX_DELAY);
  delay.delayTime.value = delaySeconds;
  const feedback = context.createGain();
  feedback.gain.value = gain;
  const feedforward = context.createGain();
  feedforward.gain.value = -gain;
  const output = context.createGain();
  input.connect(sum);
  sum.connect(delay);
  delay.connect(feedback);
  feedback.connect(sum);
  sum.connect(feedforward);
  feedforward.connect(output);
  delay.connect(output);
  return output;
}

/** A damped feedback comb from `input` into `sum`. */
function connectComb(
  context: AudioContext,
  input: AudioNode,
  sum: AudioNode,
  delaySeconds: number,
): void {
  const delay = context.createDelay(COMB_MAX_DELAY);
  delay.delayTime.value = delaySeconds;
  const damping = context.createBiquadFilter();
  damping.type = 'lowpass';
  damping.frequency.value = DAMPING_HZ;
  damping.Q.value = DAMPING_Q;
  const feedback = context.createGain();
  feedback.gain.value = COMB_FEEDBACK;
  input.connect(delay);
  delay.connect(damping);
  damping.connect(feedback);
  feedback.connect(delay);
  damping.connect(sum);
}

/** Builds the room into `output` and returns the send that feeds it. */
export function createRoomReverb(context: AudioContext, output: AudioNode): GainNode {
  const send = context.createGain();
  send.gain.value = SEND_LEVEL;
  const lowCut = context.createBiquadFilter();
  lowCut.type = 'highpass';
  lowCut.frequency.value = LOW_CUT_HZ;
  send.connect(lowCut);
  const merger = context.createChannelMerger(CHANNELS.length);
  for (const [channel, { combs, diffusers }] of CHANNELS.entries()) {
    const sum = context.createGain();
    sum.gain.value = COMB_MIX;
    for (const delaySeconds of combs) connectComb(context, lowCut, sum, delaySeconds);
    let tail: AudioNode = sum;
    for (const delaySeconds of diffusers)
      tail = createAllpass(context, tail, delaySeconds, ALLPASS_GAIN);
    tail.connect(merger, 0, channel);
  }
  merger.connect(output);
  return send;
}
