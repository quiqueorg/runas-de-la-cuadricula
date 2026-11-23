import { writeFileSync } from 'node:fs';

// Render the dry, mono loops in advance. Wrap the release of the last
// note into the start so repeating the PCM never cuts a vibrating tine.
const rate = 24000;
const keys = [261.63, 293.66, 329.63, 349.23, 392, 440, 493.88, 523.25, 587.33, 659.25];
const a = [3, 4, 7, 6, 5],
  b = [3, 4, 9, 6, 0];
for (const [name, tempo, phrases] of [['menu', 1.08, [a, a, b, b]]]) {
  let cursor = 0;
  const notes = [];
  for (const phrase of phrases) {
    phrase.forEach((key, i) => {
      notes.push([Math.round(cursor * rate), keys[key]]);
      cursor += (i === phrase.length - 1 ? 1.64 : 0.82) * tempo;
    });
  }
  const samples = new Float64Array(Math.round((cursor + 1.05 * tempo) * rate));
  for (const [start, f] of notes) {
    const tau = 1.15 * (261.63 / f) ** 0.35;
    for (const [ratio, amp, decay] of [
      [1, 0.12, tau],
      [2, 0.0084, tau * 0.42],
      [6.27, 0.0144, 0.045],
    ]) {
      for (let i = 0; i < rate * decay * 11; i++) {
        const t = i / rate;
        const attack = Math.min(t / 0.012, 1);
        samples[(start + i) % samples.length] +=
          amp * attack * Math.exp(-t / decay) * Math.sin(2 * Math.PI * f * ratio * t);
      }
    }
  }
  const wav = Buffer.alloc(44 + samples.length * 2);
  wav.write('RIFF');
  wav.writeUInt32LE(wav.length - 8, 4);
  wav.write('WAVEfmt ', 8);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(rate, 24);
  wav.writeUInt32LE(rate * 2, 28);
  wav.writeUInt16LE(2, 32);
  wav.writeUInt16LE(16, 34);
  wav.write('data', 36);
  wav.writeUInt32LE(samples.length * 2, 40);
  for (const [i, v] of samples.entries()) wav.writeInt16LE(Math.round(v * 32767), 44 + i * 2);
  writeFileSync(new URL(`../assets/kalimba-${name}.wav`, import.meta.url), wav);
}
