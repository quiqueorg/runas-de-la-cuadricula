/** UI sounds and the kalimba, underground and sky scores. */
import { progress } from '../../core/state';

interface MusicZone {
  bajo?: readonly number[] | boolean;
  eco?: readonly number[] | number;
  tempo?: number;
  arm?: number;
  oct?: number;
  brillo?: number;
  tink?: readonly number[];
  suave?: boolean;
  sinBombo?: boolean;
  bajoOct?: boolean;
  escaso?: number;
  bemol?: boolean;
  dron?: boolean;
  fuerte?: boolean;
  viento?: boolean;
  campanillas?: number;
  campanas?: boolean;
  menor?: boolean;
  tambor?: boolean;
  pad?: number;
  tema?: boolean;
  /** The isle: chance per eighth of a water drop. */
  agua?: number;
  /** The isle: waves lapping every other bar. */
  olas?: boolean;
  /** The isle: loudness of the deep rumble from under the lagoon. */
  fondo?: number;
  /** The isle: a soft clockwork tick on the off-beats. */
  reloj?: boolean;
  /** The surface: birdsong between the notes. */
  pajaros?: boolean;
  /** The surface: the tune kept to a pentatonic. */
  penta?: boolean;
  /** The surface: loudness of the flute that answers on the second pass. */
  flauta?: number;
}

type ZoneMap = Record<string, MusicZone>;

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
    /** Shuts down a previous copy of this module (hot reload / duplicate import). */
    __kalimbaAudioDispose?: () => void;
  }
}

// ════════════════════════════════════════════ shared audio engine (single AudioContext)
interface AudioEngine {
  ctx: AudioContext;
  master: DynamicsCompressorNode;
  sfxBus: GainNode;
  musicMaster: GainNode;
  reverbSend: GainNode;
  tapBuf: AudioBuffer;
  tickBuf: AudioBuffer;
  gustBuf: AudioBuffer;
  thunderBuf: AudioBuffer;
}

let engine: AudioEngine | null = null;

function createNoiseBuffer(ctx: AudioContext, dur: number, shape: (i: number, n: number) => number): AudioBuffer {
  const n = Math.max(1, Math.floor(ctx.sampleRate * dur));
  const buf = ctx.createBuffer(1, n, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = shape(i, n);
  return buf;
}

/** Schroeder allpass: y = -g·w + w[n-d], w = x + g·w[n-d]. Smears echoes without colouring the tone. */
function createAllpass(ctx: AudioContext, input: AudioNode, d: number, g: number): AudioNode {
  const w = ctx.createGain();
  const delay = ctx.createDelay(0.05); delay.delayTime.value = d;
  const fb = ctx.createGain(); fb.gain.value = g;
  const ff = ctx.createGain(); ff.gain.value = -g;
  const out = ctx.createGain();
  input.connect(w);
  w.connect(delay); delay.connect(fb); fb.connect(w);
  w.connect(ff); ff.connect(out);
  delay.connect(out);
  return out;
}

function getEngine(): AudioEngine | null {
  if (engine) {
    if (engine.ctx.state === 'suspended') engine.ctx.resume().catch(() => {});
    return engine;
  }
  try {
    const AudioCtor = window.AudioContext ?? window.webkitAudioContext;
    if (!AudioCtor) return null;
    const ctx = new AudioCtor();

    // Master limiter prevents clipping when SFX and overlapping music voices stack
    const master = ctx.createDynamicsCompressor();
    master.threshold.value = -10;
    master.knee.value = 12;
    master.ratio.value = 6;
    master.attack.value = 0.004;
    master.release.value = 0.15;
    master.connect(ctx.destination);

    // SFX bus with gentle filtered echo
    const sfxBus = ctx.createGain();
    sfxBus.gain.value = 0.5;
    const sfxDelay = ctx.createDelay(0.5);
    sfxDelay.delayTime.value = 0.21;
    const sfxFb = ctx.createGain();
    sfxFb.gain.value = 0.28;
    const sfxLp = ctx.createBiquadFilter();
    sfxLp.type = 'lowpass';
    sfxLp.frequency.value = 2600;
    sfxBus.connect(master);
    sfxBus.connect(sfxDelay);
    sfxDelay.connect(sfxLp);
    sfxLp.connect(sfxFb);
    sfxFb.connect(sfxDelay);
    sfxLp.connect(master);

    // Music master + a small, cheap room reverb (no ConvolverNode).
    // The old 173/241 ms ping-pong delay repeated every pluck as a distinct, quieter copy a moment later,
    // which made one kalimba sound like a second one trailing behind it. Short damped combs + allpass
    // diffusers blur the repeats into a smooth ~1 s tail instead.
    const musicMaster = ctx.createGain();
    musicMaster.gain.value = 0.0001;
    musicMaster.connect(master);

    const reverbSend = ctx.createGain();
    reverbSend.gain.value = 0.26;
    const reverbHp = ctx.createBiquadFilter(); // keep kicks and bass from booming in the room
    reverbHp.type = 'highpass'; reverbHp.frequency.value = 180;
    reverbSend.connect(reverbHp);
    const merger = ctx.createChannelMerger(2);
    const COMBS = [[0.0253, 0.029, 0.0322, 0.0353], [0.0269, 0.0307, 0.0338, 0.0367]];
    const DIFFUSERS = [[0.0126, 0.0077], [0.0131, 0.0083]];
    COMBS.forEach((times, ch) => {
      const sum = ctx.createGain();
      sum.gain.value = 0.3;
      for (const d of times) {
        const dl = ctx.createDelay(0.1); dl.delayTime.value = d;
        const damp = ctx.createBiquadFilter();
        damp.type = 'lowpass'; damp.frequency.value = 3600; damp.Q.value = -3; // Butterworth: no resonant peak in the loop
        const fb = ctx.createGain(); fb.gain.value = 0.8;
        reverbHp.connect(dl); dl.connect(damp); damp.connect(fb); fb.connect(dl);
        damp.connect(sum);
      }
      let out: AudioNode = sum;
      for (const d of DIFFUSERS[ch]) out = createAllpass(ctx, out, d, 0.5);
      out.connect(merger, 0, ch);
    });
    merger.connect(musicMaster);

    // Pre-allocated noise buffers (zero per-note AudioBuffer allocations)
    const tapBuf = createNoiseBuffer(ctx, 0.012, (i, n) => {
      const fadeIn = i < 16 ? i / 16 : 1;
      return (Math.random() * 2 - 1) * fadeIn * (1 - i / n);
    });
    const tickBuf = createNoiseBuffer(ctx, 0.04, (i, n) => {
      const fadeIn = i < 32 ? i / 32 : 1;
      return (Math.random() * 2 - 1) * fadeIn * Math.pow(1 - i / n, 2.2);
    });
    const gustBuf = createNoiseBuffer(ctx, 2.4, (i, n) => (Math.random() * 2 - 1) * Math.sin(Math.PI * i / n));
    let brown = 0;
    const thunderBuf = createNoiseBuffer(ctx, 2.0, (i, n) => {
      brown = brown * 0.96 + (Math.random() * 2 - 1) * 0.04;
      const fadeIn = i < 300 ? i / 300 : 1;
      const fadeOut = i > n - 600 ? (n - i) / 600 : 1;
      return Math.max(-1, Math.min(1, brown * 9 * Math.pow(1 - i / n, 1.6) * fadeIn * fadeOut * (1 + 0.6 * Math.sin(i / 900))));
    });

    engine = { ctx, master, sfxBus, musicMaster, reverbSend, tapBuf, tickBuf, gustBuf, thunderBuf };
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return engine;
  } catch {
    return null;
  }
}

function rampGain(param: AudioParam, target: number, now: number, tau: number) {
  param.cancelScheduledValues(now);
  param.setValueAtTime(Math.max(0.0001, param.value), now);
  param.setTargetAtTime(target, now, tau);
}

// ════════════════════════════════════════════ sound (WebAudio, no files)
export const sound = (() => {
  function sfxEngine(): AudioEngine | null {
    if (!progress.sonido) return null;
    return getEngine();
  }
  function playNote(f: number, t0: number, dur: number, vol = 0.12, tipo: OscillatorType = 'sine') {
    const e = sfxEngine(); if (!e) return;
    const { ctx: a, sfxBus } = e;
    const o = a.createOscillator(), g = a.createGain(), t = a.currentTime + t0;
    o.type = tipo; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    g.gain.linearRampToValueAtTime(0, t + dur + 0.015);
    o.connect(g); g.connect(sfxBus); o.start(t); o.stop(t + dur + 0.025);
  }
  return {
    clic() { playNote(880, 0, 0.08, 0.05, 'triangle'); },
    encaje() { playNote(1318.5, 0, 0.25, 0.05); playNote(1975.5, 0.05, 0.3, 0.03); },
    victoria() { [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => { playNote(f, i * 0.09, 0.9, 0.09); playNote(f * 2, i * 0.09 + 0.02, 0.5, 0.02, 'triangle'); }); [523.25, 783.99, 1046.5].forEach((f) => playNote(f, 0.55, 1.8, 0.05)); },
    error() { playNote(220, 0, 0.18, 0.05, 'triangle'); },
    tono(f: number, t0 = 0, dur = 0.9) { playNote(f, t0, dur, 0.1); playNote(f * 2, t0 + 0.01, dur * 0.5, 0.02, 'triangle'); },
    descubrir() { [392, 523.25, 659.25, 783.99].forEach((f, i) => playNote(f, 0.2 + i * 0.14, 1.4, 0.06)); },
    secreto() { [880, 1046.5, 1318.5, 1760, 2093].forEach((f, i) => { playNote(f, i * 0.07, 0.8, 0.06); playNote(f * 1.5, i * 0.07 + 0.03, 0.4, 0.02, 'triangle'); }); },
    //short chatter for land creatures: three syllables, timbre depends on the creature
    charla(tipo: string) {
      const e = sfxEngine(); if (!e) return;
      const { ctx: a, sfxBus: bus } = e;
      const voices: Record<string, number> = { aletea: 980, flota: 420, tiembla: 200, asoma: 300, cuelga: 760, planea: 1100, picotea: 900, salta: 520, pasta: 340 };
      const base = voices[tipo] ?? 480;
      const forma: OscillatorType = tipo === 'flota' ? 'sine' : tipo === 'tiembla' ? 'sawtooth' : 'triangle';
      [0, 0.085, 0.17].forEach((d, i) => {
        const o = a.createOscillator(), g = a.createGain(), t = a.currentTime + d, f = base * (1 + (i === 1 ? 0.18 : i === 2 ? -0.08 : 0) + Math.random() * 0.06);
        o.type = forma; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * (tipo === 'flota' ? 0.7 : 1.25), t + 0.07);
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(tipo === 'tiembla' ? 0.025 : 0.045, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
        g.gain.linearRampToValueAtTime(0, t + 0.09);
        o.connect(g); g.connect(bus); o.start(t); o.stop(t + 0.1);
      });
    },
    //thunder: filtered low noise with a long decay (the boss attacks or takes a hit)
    trueno(fuerza = 1): void {
      const e = sfxEngine(); if (!e) return;
      const { ctx: a, sfxBus: bus, thunderBuf } = e;
      const t = a.currentTime, dur = Math.min(2.0, 1.6 * fuerza);
      const s0 = a.createBufferSource(), lp = a.createBiquadFilter(), g = a.createGain();
      s0.buffer = thunderBuf;
      lp.type = 'lowpass'; lp.frequency.setValueAtTime(900, t); lp.frequency.exponentialRampToValueAtTime(120, t + dur);
      g.gain.setValueAtTime(0.5 * fuerza, t);
      g.gain.setTargetAtTime(0.0001, t + dur * 0.65, 0.2);
      s0.connect(lp); lp.connect(g); g.connect(bus); s0.start(t); s0.stop(t + dur + 0.1);
      playNote(70, 0, 0.6 * fuerza, 0.08, 'sine');
    },
    glub() { const e = sfxEngine(); if (!e) return; const { ctx: a, sfxBus: bus } = e; [0, 0.09].forEach((d, i) => { const o = a.createOscillator(), g = a.createGain(), t = a.currentTime + d; o.type = 'sine'; o.frequency.setValueAtTime(260 + i * 120, t); o.frequency.exponentialRampToValueAtTime(900 + i * 300, t + 0.08); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.06, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12); g.gain.linearRampToValueAtTime(0, t + 0.13); o.connect(g); g.connect(bus); o.start(t); o.stop(t + 0.14); }); },
    gota() { const e = sfxEngine(); if (!e) return; const { ctx: a, sfxBus } = e; const o = a.createOscillator(), g = a.createGain(), t = a.currentTime; o.type = 'sine'; o.frequency.setValueAtTime(900, t); o.frequency.exponentialRampToValueAtTime(320, t + 0.12); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.05, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18); g.gain.linearRampToValueAtTime(0, t + 0.19); o.connect(g); g.connect(sfxBus); o.start(t); o.stop(t + 0.2); },
    cloc() { playNote(330, 0, 0.07, 0.07, 'square'); playNote(250, 0.08, 0.09, 0.06, 'square'); },
  };
})();

// ════════════════════════════════════════════ ambient music: 17-key kalimba, underground & sky
interface TrackBus {
  gain: GainNode;
  body: BiquadFilterNode;
  loop?: AudioBufferSourceNode;
  loading?: boolean;
}

export const music = (() => {
  //17 keys in C: 1..7 = C4..B4 · dotted 1..7 = C5..B5 · double-dotted 1 2 3 = C6..E6
  const F = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25, 587.33, 659.25, 698.46, 783.99, 880.0, 987.77, 1046.5, 1174.66, 1318.51];
  const recordings = {
    menu: new URL('../../../assets/kalimba-menu.wav', import.meta.url).href,
  };
  const decoded = new Map<string, Promise<AudioBuffer>>();

  // Regional tempo changes take effect between phrases.
  // The surface (scheduleSurface): one tune, coloured by each place on the continent.
  const ZONAS: ZoneMap = {
    inicio: { tempo: 1.08 },
    pradera: {},
    bosque: { tempo: 1.04, pajaros: true, flauta: 0.026 },
    canon: { tempo: 1.04, tambor: true, eco: 0.5 },
    valle: { arm: 3, brillo: 0.14 },
    lago: { tempo: 1.1, suave: true, agua: 0.1 },
    cumbres: { tempo: 1.14, viento: true, escaso: 0.3, eco: 0.38 },
    desierto: { tempo: 1.02, bemol: true, dron: true },
    aldea: { tempo: 0.98, penta: true, brillo: 0.2 },
    ciudadela: { tempo: 1.08, campanas: true, pad: 0.05, bajo: true, flauta: 0.03 },
    secreto: { tempo: 1.12, oct: 12, eco: 0.3, campanillas: 0.15 },
  };
  // The apprentice's isle has its own theme (scheduleIsle); each island colours it differently.
  const ZONAS_ISLA: ZoneMap = {
    embarcadero: { olas: true },
    patio: { tempo: 0.94, reloj: true },
    tintas: { arm: 2, brillo: 0.18 },
    imprenta: { tempo: 0.97, reloj: true },
    almacen: { tempo: 1.03, bajo: true },
    canal: { tempo: 1.06, agua: 0.16, olas: true },
    farola: { tempo: 1.04, campanas: true },
    mercado: { tempo: 0.92, arm: 4, brillo: 0.15 },
    invernadero: { tempo: 1.02, brillo: 0.25, agua: 0.1 },
    observatorio: { tempo: 1.05, oct: 12, campanillas: 0.2 },
    biblioteca: { tempo: 1.12, escaso: 0.4, dron: true },
    aula: { pad: 0.04, bajo: true, campanas: true },
    secretoisla: { tempo: 1.1, oct: 12, agua: 0.14, fondo: 0.05, escaso: 0.25 },
  };

  let scene: MusicZone = ZONAS.inicio;
  let pendingScene: MusicZone | null = null;
  let currentZoneName = 'inicio';
  let trackBus: TrackBus | null = null;
  let musicTimer = 0;
  let nextTime = 0;
  let song = 'menu', step = 0, cycle = 0;

  // ── The underground: D dorian at 104 bpm, eight bars of eighth notes with rhythmic variations
  const CORCHEA = 60 / 104 / 2;
  const MEL = [ //per bar: [eighth-note step, key of F] (1 = D4 … 8 = D5)
    [[0, 5], [2, 8], [3, 7], [4, 5], [6, 4]],
    [[0, 3], [3, 4], [4, 5], [6, 2]],
    [[0, 5], [2, 8], [3, 7], [4, 5], [5, 7], [6, 8]],
    [[0, 9], [2, 8], [4, 5], [7, 7]],
    [[0, 8], [1, 7], [2, 5], [4, 4], [6, 5]],
    [[0, 3], [2, 4], [3, 3], [4, 2], [6, 1]],
    [[0, 5], [2, 5], [3, 7], [4, 8], [6, 9], [7, 10]],
    [[0, 8], [4, 1]],
  ];
  const MEL_B = MEL.slice(); //second pass: syncopation on the even bars
  MEL_B[1] = [[0, 3], [2, 4], [3, 5], [5, 4], [6, 2]];
  MEL_B[3] = [[0, 9], [1, 8], [3, 5], [6, 7], [7, 8]];
  MEL_B[5] = [[0, 3], [1, 4], [3, 3], [5, 2], [6, 1], [7, 2]];
  const RAIZ = [146.83, 130.81, 146.83, 110.0, 146.83, 130.81, 98.0, 146.83];
  const BAJO_A = [[0, 1], [3, 1], [4, 1.5]], BAJO_B = [[0, 1], [4, 1], [6, 1.5]], BAJO_C = [[0, 1], [2, 1], [4, 1.5], [7, 1]];
  const ZONAS_SUB: ZoneMap = {
    subsuelo: {}, mina: { tink: [6] }, hongos: { eco: 0.29, suave: true }, lagosub: { sinBombo: true, brillo: 0.25, tempo: 1.08 },
    cristal: { oct: 7, brillo: 0.15 }, forja: { tink: [2, 6], fuerte: true }, abismo: { bajoOct: true, escaso: 0.35 },
    drow: { bemol: true, dron: true }, templo: { tempo: 1.12, eco: 0.43, dron: true, bemol: true }, boveda: { arm: 2, fuerte: true },
    secretosub: { oct: 7, eco: 0.29 },
  };

  // ── The skies: F lydian in 3/4, music-box arpeggios, a soft pad and wind chimes
  const midi = (m: number) => 440 * Math.pow(2, (m - 69) / 12);
  const CORCHEA_C = 60 / 84 / 2;
  const ACORDES: readonly (readonly [number, readonly number[]])[] = [ // [bajo, arpegio]
    [41, [65, 69, 72, 76]], [43, [67, 71, 74, 79]], [41, [65, 69, 72, 76]], [43, [67, 71, 74, 79]],
    [38, [62, 65, 69, 72]], [40, [64, 67, 71, 74]], [41, [65, 69, 72, 76, 79]], [36, [60, 62, 67, 72]],
  ];
  const ARP = [0, 1, 2, 3, 2, 1];
  const MELC = [[[0, 81], [4, 84]], [[0, 83], [3, 79]], [[0, 81], [2, 84], [4, 88]], [[0, 86]], [[0, 84], [4, 81]], [[0, 83], [2, 79], [4, 76]], [[0, 77], [2, 79], [4, 81]], [[0, 79]]];
  const MELC_B = MELC.slice();
  MELC_B[1] = [[0, 83], [2, 86], [4, 88]]; MELC_B[3] = [[0, 86], [3, 84], [5, 83]]; MELC_B[7] = [[0, 79], [3, 77], [4, 76]];
  const ZONAS_CIELO: ZoneMap = {
    cielo: {}, muelle: { bajo: true }, jardin: { brillo: 0.22 }, observatorio: { tempo: 1.12, campanillas: 0.2 }, viento: { viento: true, escaso: 0.3 },
    arcoiris: { arm: 4 }, nido: { tempo: 0.9, bajo: true }, cascada: { eco: 0.36 }, campanario: { campanas: true },
    tormenta: { tempo: 0.62, menor: true, tambor: true, bajo: true, pad: 0.05 }, secretocielo: { oct: 12, eco: 0.3, campanillas: 0.15 },
  };
  //the final battle: the surface kalimba theme, in minor and with drums
  ZONAS_CIELO.final = ZONAS_CIELO.vacio = { tempo: 0.56, menor: true, tambor: true, bajo: true, pad: 0.055, tema: true, campanillas: 0.1 };
  const MEL_TEMA = [[[0, 77], [1, 79], [2, 84], [4, 83]], [[0, 81]], [[0, 77], [1, 79], [2, 84], [4, 83]], [[0, 81]], [[0, 77], [1, 79], [2, 88], [4, 83]], [[0, 84]], [[0, 77], [1, 79], [2, 88], [4, 83]], [[0, 84], [3, 79]]];
  const aMenor = (m: number) => ([4, 9, 11].includes(((m % 12) + 12) % 12) ? m - 1 : m);
  //F lydian uses only the white keys: nudge a black key down onto the scale (keeps harmony notes in key)
  const enEscala = (m: number) => ([1, 3, 6, 8, 10].includes(((m % 12) + 12) % 12) ? m - 1 : m);

  // ── The isle: E dorian at 72 bpm. Suspended and add9 chords that never quite land, a slow kalimba
  //    with a long echo over a glassy pad, water lapping and dripping, bells far off, and now and then
  //    something big moving under the lagoon. Calm, and a little curious.
  const CORCHEA_I = 60 / 72 / 2;
  const ISLA_ACORDES: readonly (readonly [number, readonly number[]])[] = [ // [bass, chord tones] in MIDI
    [40, [64, 67, 71, 74, 78]], // Em9
    [36, [64, 67, 71, 74, 78]], // Cmaj9(#11): the same tones over a new floor
    [45, [60, 64, 67, 71, 74]], // Am9
    [35, [64, 66, 71, 76]], //     Bsus4, left hanging
    [40, [64, 67, 71, 74, 78]], // Em9
    [43, [62, 64, 67, 69, 71]], // G6/9
    [36, [64, 67, 71, 72, 78]], // Cmaj7(#11)
    [38, [62, 64, 66, 69, 71]], // D6sus2, back round without resolving
  ];
  const ISLA_ARP = [0, -1, 2, 1, -1, 3, 2, -1]; // chord tone per eighth; -1 is a rest
  const MEL_ISLA = [[[0, 76], [3, 79], [6, 78]], [[2, 74], [4, 71]], [[0, 72], [3, 76], [5, 74]], [[0, 71]], [[0, 76], [2, 78], [3, 79], [6, 83]], [[1, 81], [4, 79]], [[0, 78], [3, 76], [6, 74]], [[0, 78], [5, 76]]];
  const MEL_ISLA_B = [[[0, 71], [4, 74]], [[0, 76], [3, 74], [6, 71]], [[2, 69], [4, 72]], [[0, 71], [6, 66]], [[0, 79], [4, 78]], [[0, 76], [2, 74], [5, 71]], [[0, 72], [4, 71]], [[0, 71], [4, 76]]];

  // ── The surface: a deep lo-fi stroll in G at 70 bpm, swung. A dark electric piano on jazzy sevenths
  //    and ninths over a sub-bass and a warm low bed, brushed drums, the kalimba tune down in its low
  //    register taking its time, and a little vinyl crackle.
  const CORCHEA_S = 60 / 70 / 2;
  const SWING = 0.17; // how late the off-beat eighths land, as a fraction of an eighth
  const SUP_ACORDES: readonly (readonly [number, readonly number[]])[] = [ // [bass, chord tones] in MIDI
    [43, [59, 62, 66, 69]], // Gmaj9
    [47, [57, 62, 66, 69]], // Bm7
    [40, [59, 62, 66, 67]], // Em9
    [36, [59, 62, 64, 67]], // Cmaj7
    [45, [55, 60, 64, 67]], // Am9
    [38, [57, 60, 64, 67]], // D9sus4
    [43, [59, 62, 66, 69]], // Gmaj9
    [36, [59, 62, 66, 67]], // Cmaj7(#11)
  ];
  const MEL_SUP = [[[0, 74], [3, 76], [5, 79]], [[2, 78], [4, 74]], [[0, 71], [3, 74], [6, 76]], [[1, 74]], [[0, 72], [2, 76], [3, 79], [6, 81]], [[1, 79], [4, 76]], [[0, 78], [3, 74], [5, 71]], [[2, 74]]];
  const MEL_SUP_B = [[[1, 79], [3, 81], [6, 83]], [[0, 81], [4, 78]], [[0, 79], [2, 76], [5, 74]], [[0, 76], [6, 71]], [[1, 76], [3, 79], [5, 84]], [[0, 83], [4, 79]], [[1, 78], [3, 76], [6, 74]], [[0, 79]]];
  // the desert flattens the second and the sixth, which turns the road south
  const aDesierto = (m: number) => ([9, 4].includes(((m % 12) + 12) % 12) ? m - 1 : m);
  // the village keeps to G major's five notes: C steps down to B and F sharp down to E
  const aPenta = (m: number) => {
    const pc = ((m % 12) + 12) % 12;
    return pc === 0 ? m - 1 : pc === 6 ? m - 2 : m;
  };

  function createTrackBus(e: AudioEngine, fadeInDelay = 0): TrackBus {
    const { ctx, musicMaster, reverbSend } = e;
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    if (fadeInDelay > 0) {
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.setTargetAtTime(1, now + fadeInDelay, 0.2);
    } else {
      gain.gain.setValueAtTime(1, now);
    }
    //wooden body: gentle lift of the low mids and tamed highs
    const body = ctx.createBiquadFilter();
    body.type = 'peaking'; body.frequency.value = 280; body.Q.value = 1.1; body.gain.value = 3.5;
    const suave = ctx.createBiquadFilter();
    suave.type = 'lowpass'; suave.frequency.value = 5000; suave.Q.value = 0.5;
    body.connect(suave);
    suave.connect(gain);
    gain.connect(musicMaster);
    if (song !== 'menu') gain.connect(reverbSend);
    return { gain, body };
  }

  function retireTrackBus(oldBus: TrackBus | null, e: AudioEngine, tau = 0.12) {
    if (!oldBus) return;
    const now = e.ctx.currentTime;
    rampGain(oldBus.gain.gain, 0.0001, now, tau);
    oldBus.loop?.stop(now + 6 * tau);
    window.setTimeout(() => {
      try { oldBus.body.disconnect(); oldBus.gain.disconnect(); } catch { /* already disconnected */ }
    }, Math.max(900, tau * 5000));
  }

  function ensureTrackBus(): { e: AudioEngine; bus: TrackBus } | null {
    const e = getEngine();
    if (!e) return null;
    if (!trackBus) trackBus = createTrackBus(e, 0);
    return { e, bus: trackBus };
  }

  function playGust(e: AudioEngine, bus: TrackBus, t: number, v: number) {
    const { ctx, gustBuf } = e;
    const src = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = gustBuf;
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(500, t);
    bp.frequency.linearRampToValueAtTime(1300, t + 1.2);
    bp.frequency.linearRampToValueAtTime(700, t + 2.4);
    bp.Q.value = 1.6;
    g.gain.setValueAtTime(v, t);
    src.connect(bp); bp.connect(g); g.connect(bus.gain);
    src.start(t);
  }

  function playPartial(e: AudioEngine, bus: TrackBus, f: number, t: number, v: number, tau: number, tipo: OscillatorType = 'sine', ataque = 0.004) {
    const { ctx } = e;
    // Nyquist guard prevents digital aliasing artifacts on mobile sample rates
    if (f <= 20 || f >= ctx.sampleRate * 0.42) return;
    const o = ctx.createOscillator(), g = ctx.createGain();
    const decayDur = tau * 5.8;
    const fadeEnd = t + ataque + decayDur;
    const endVal = 0.0001 + (v - 0.0001) * Math.exp(-decayDur / tau);
    o.type = tipo; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(v, t + ataque);
    g.gain.setTargetAtTime(0.0001, t + ataque, tau);
    g.gain.setValueAtTime(endVal, fadeEnd);
    g.gain.linearRampToValueAtTime(0, fadeEnd + 0.03);
    o.connect(g); g.connect(bus.body);
    o.start(t); o.stop(fadeEnd + 0.04);
  }

  function pluck(e: AudioEngine, bus: TrackBus, f: number, t: number, v: number) {
    if (f <= 20) return;
    const { ctx, tapBuf } = e;
    const tau = 1.15 * Math.pow(261.63 / f, 0.35); // lower tines resonate longer
    playPartial(e, bus, f, t, v, tau);
    playPartial(e, bus, f * 1.0014, t, v * 0.24, tau * 0.85); // gentle tine beating
    playPartial(e, bus, f * 2, t, v * 0.07, tau * 0.42);
    playPartial(e, bus, f * 6.27, t, v * 0.12, 0.045); // metallic tine attack (auto-skipped if above Nyquist)
    // fingernail tap using pre-allocated noise buffer
    const ruido = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), gr = ctx.createGain();
    ruido.buffer = tapBuf;
    bp.type = 'bandpass'; bp.frequency.value = 2600; bp.Q.value = 1.4;
    gr.gain.setValueAtTime(v * 0.32, t);
    ruido.connect(bp); bp.connect(gr); gr.connect(bus.body);
    ruido.start(t);
  }

  function playKick(e: AudioEngine, bus: TrackBus, t: number, v: number, f0 = 110, f1 = 45) {
    const { ctx } = e;
    const o = ctx.createOscillator(), g = ctx.createGain();
    const tau = 0.085, decayDur = 0.516;
    const endVal = 0.0001 + (v - 0.0001) * Math.exp(-decayDur / tau);
    o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + 0.12);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.004);
    g.gain.setTargetAtTime(0.0001, t + 0.004, tau);
    g.gain.setValueAtTime(endVal, t + 0.004 + decayDur);
    g.gain.linearRampToValueAtTime(0, t + 0.55);
    o.connect(g); g.connect(bus.gain); o.start(t); o.stop(t + 0.57);
  }

  function playTick(e: AudioEngine, bus: TrackBus, t: number, v: number, fc = 6500, dur = 0.035) {
    const { ctx, tickBuf } = e;
    const s = ctx.createBufferSource(), hp = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = tickBuf;
    hp.type = 'highpass'; hp.frequency.value = fc;
    g.gain.setValueAtTime(v, t);
    s.connect(hp); hp.connect(g); g.connect(bus.gain);
    s.start(t, 0, Math.min(dur, tickBuf.duration));
  }

  function playTin(e: AudioEngine, bus: TrackBus, t: number, v: number) {
    const { ctx } = e;
    [2210, 3140, 5230].forEach((f, i) => {
      if (f >= ctx.sampleRate * 0.42) return;
      const o = ctx.createOscillator(), g = ctx.createGain();
      const peak = v / (i + 1), tau = 0.05 + 0.04 / (i + 1), decayDur = 0.447;
      const endVal = 0.0001 + (peak - 0.0001) * Math.exp(-decayDur / tau);
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(peak, t + 0.003);
      g.gain.setTargetAtTime(0.0001, t + 0.003, tau);
      g.gain.setValueAtTime(endVal, t + 0.003 + decayDur);
      g.gain.linearRampToValueAtTime(0, t + 0.48);
      o.connect(g); g.connect(bus.gain); o.start(t); o.stop(t + 0.5);
    });
  }

  function playBass(e: AudioEngine, bus: TrackBus, f: number, t: number, v: number, dur: number) {
    const { ctx } = e;
    const o = ctx.createOscillator(), o2 = ctx.createOscillator(), lp = ctx.createBiquadFilter(), g = ctx.createGain();
    const tau = 0.16 * dur;
    const decayDur = Math.min(2.6, tau * 6.2);
    const end = t + 0.008 + decayDur;
    const endVal = 0.0001 + (v - 0.0001) * Math.exp(-decayDur / tau);
    o.type = 'triangle'; o.frequency.value = f;
    o2.type = 'sine'; o2.frequency.value = f;
    lp.type = 'lowpass'; lp.frequency.value = 680;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(v, t + 0.008);
    g.gain.setTargetAtTime(0.0001, t + 0.008, tau);
    g.gain.setValueAtTime(endVal, end);
    g.gain.linearRampToValueAtTime(0, end + 0.03);
    o.connect(lp); o2.connect(lp); lp.connect(g); g.connect(bus.gain);
    o.start(t); o2.start(t); o.stop(end + 0.04); o2.stop(end + 0.04);
  }

  /** Waves on the shore: filtered noise that swells and draws back. */
  function playSwell(e: AudioEngine, bus: TrackBus, t: number, v: number) {
    const { ctx, gustBuf } = e;
    const src = ctx.createBufferSource(), lp = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = gustBuf;
    src.playbackRate.value = 0.55;
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(260, t);
    lp.frequency.linearRampToValueAtTime(820, t + 1.9);
    lp.frequency.linearRampToValueAtTime(240, t + 4.2);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(v, t + 1.6);
    g.gain.linearRampToValueAtTime(0.0001, t + 4.3);
    src.connect(lp); lp.connect(g); g.connect(bus.gain);
    src.start(t); src.stop(t + 4.4);
  }

  /** A drop falling into still water: a quick downward sine. */
  function playDrop(e: AudioEngine, bus: TrackBus, t: number, v: number) {
    const { ctx } = e;
    const o = ctx.createOscillator(), g = ctx.createGain();
    const f = 900 + Math.random() * 700;
    o.frequency.setValueAtTime(f, t);
    o.frequency.exponentialRampToValueAtTime(f * 0.45, t + 0.09);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(v, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    g.gain.linearRampToValueAtTime(0, t + 0.17);
    o.connect(g); g.connect(bus.gain); o.start(t); o.stop(t + 0.18);
  }

  /** A bell across the water: inharmonic partials with a long tail. */
  function playBell(e: AudioEngine, bus: TrackBus, f: number, t: number, v: number) {
    [[1, 1, 2.6], [2.76, 0.42, 1.4], [5.4, 0.2, 0.7], [0.5, 0.3, 3]].forEach(([ratio, amp, tau]) => playPartial(e, bus, f * ratio!, t, v * amp!, tau!, 'sine', 0.006));
  }

  /** Something big under the lagoon: a low glide that rises out of nothing and sinks back. */
  function playDeep(e: AudioEngine, bus: TrackBus, t: number, v: number) {
    const { ctx } = e;
    [0, 1.004].forEach((detune, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain(), lp = ctx.createBiquadFilter();
      o.type = 'triangle';
      o.frequency.setValueAtTime(82.41 * (detune || 1), t);
      o.frequency.linearRampToValueAtTime(73.42 * (detune || 1), t + 3.4);
      lp.type = 'lowpass'; lp.frequency.value = 320;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(v / (i + 1), t + 1.4);
      g.gain.linearRampToValueAtTime(0.0001, t + 3.8);
      o.connect(lp); lp.connect(g); g.connect(bus.gain); o.start(t); o.stop(t + 3.9);
    });
  }

  /** A wooden flute, held and breathing: a sine with a slow vibrato and a soft attack. */
  function playFlute(e: AudioEngine, bus: TrackBus, f: number, t: number, dur: number, v: number) {
    const { ctx } = e;
    if (f <= 20 || f >= ctx.sampleRate * 0.42) return;
    const o = ctx.createOscillator(), lfo = ctx.createOscillator(), depth = ctx.createGain(), g = ctx.createGain();
    o.type = 'sine'; o.frequency.value = f;
    lfo.frequency.value = 5.2; depth.gain.value = f * 0.006;
    lfo.connect(depth); depth.connect(o.frequency);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(v, t + 0.09);
    g.gain.setValueAtTime(v, t + dur * 0.7);
    g.gain.linearRampToValueAtTime(0.0001, t + dur);
    g.gain.linearRampToValueAtTime(0, t + dur + 0.02);
    o.connect(g); g.connect(bus.body);
    o.start(t); lfo.start(t); o.stop(t + dur + 0.05); lfo.stop(t + dur + 0.05);
  }

  /** A bird in the wood: two or three quick upward chirps. */
  function playBird(e: AudioEngine, bus: TrackBus, t: number, v: number) {
    const { ctx } = e;
    const base = 2400 + Math.random() * 1400;
    const chirps = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < chirps; i++) {
      const o = ctx.createOscillator(), g = ctx.createGain(), at = t + i * 0.09;
      o.frequency.setValueAtTime(base, at);
      o.frequency.exponentialRampToValueAtTime(base * 1.5, at + 0.05);
      g.gain.setValueAtTime(0.0001, at);
      g.gain.linearRampToValueAtTime(v, at + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, at + 0.07);
      g.gain.linearRampToValueAtTime(0, at + 0.075);
      o.connect(g); g.connect(bus.gain); o.start(at); o.stop(at + 0.08);
    }
  }

  /** An electric piano, worn and warm: a sine pair with a slow tremolo, rounded off by a lowpass. */
  function playKeys(e: AudioEngine, bus: TrackBus, f: number, t: number, dur: number, v: number) {
    const { ctx } = e;
    if (f <= 20 || f >= ctx.sampleRate * 0.42) return;
    const o = ctx.createOscillator(), o2 = ctx.createOscillator(), lp = ctx.createBiquadFilter(), g = ctx.createGain(), trem = ctx.createOscillator(), depth = ctx.createGain();
    o.type = 'sine'; o.frequency.value = f;
    o2.type = 'triangle'; o2.frequency.value = f * 2.001;
    lp.type = 'lowpass'; lp.frequency.value = 950;
    trem.frequency.value = 4.6; depth.gain.value = v * 0.25;
    trem.connect(depth); depth.connect(g.gain);
    const o2g = ctx.createGain(); o2g.gain.value = 0.1;
    o.connect(lp); o2.connect(o2g); o2g.connect(lp); lp.connect(g); g.connect(bus.body);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(v, t + 0.012);
    g.gain.setTargetAtTime(v * 0.45, t + 0.012, 0.35);
    g.gain.setTargetAtTime(0.0001, t + dur, 0.18);
    const end = t + dur + 0.8;
    o.start(t); o2.start(t); trem.start(t); o.stop(end); o2.stop(end); trem.stop(end);
  }

  /** A brushed snare: a short breath of filtered noise. */
  function playBrush(e: AudioEngine, bus: TrackBus, t: number, v: number) {
    const { ctx, gustBuf } = e;
    const src = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = gustBuf;
    bp.type = 'bandpass'; bp.frequency.value = 2400; bp.Q.value = 0.7;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(v, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);
    g.gain.linearRampToValueAtTime(0, t + 0.25);
    src.connect(bp); bp.connect(g); g.connect(bus.gain);
    src.start(t, Math.random() * 1.5, 0.26);
  }

  function scheduleSurface(e: AudioEngine, bus: TrackBus) {
    const ahora = e.ctx.currentTime;
    clampDrift(ahora);
    while (nextTime < ahora + 0.45) {
      const c = Math.floor(step / 8), s = step % 8;
      if (s === 0) applyPendingScene();
      const z = scene, corch = CORCHEA_S * (z.tempo || 1);
      // the off-beats land late: that lean is the whole groove
      const t0 = Math.max(nextTime, ahora + 0.02) + (s % 2 ? corch * SWING : 0);
      const hum = () => (Math.random() - 0.5) * 0.016;
      const tono = (m: number) => midi(z.bemol ? aDesierto(m) : m);
      const chord = SUP_ACORDES[c];
      if (!chord) { nextTime += corch; if (++step >= 64) { step = 0; cycle++; } continue; }
      const [bass, tones] = chord;
      const oct = z.oct || 0;
      // keys: the chord on the downbeat, pushed again just before beat three
      if (s === 0 || s === 3) tones.forEach((m, j) => playKeys(e, bus, tono(m), t0 + j * 0.012 + hum(), corch * (s === 0 ? 2.6 : 4), (z.pad || 0.042) * (s === 0 ? 1 : 0.75)));
      // bass: root on one, a passing fifth or octave before the next bar
      if (s === 0) {
        playBass(e, bus, tono(bass), t0, z.bajo ? 0.115 : 0.1, 2.4);
        // the floor under it all: a sub an octave down, and root and fifth held low and warm
        playPartial(e, bus, tono(bass - 12), t0, 0.05, 1.6, 'sine', 0.03);
        [bass + 12, bass + 19].forEach((m, j) => playPartial(e, bus, tono(m), t0 + j * 0.04, 0.018, 3.4 * corch, 'sine', 1.4 * corch));
      }
      if (s === 5 && c % 2) playBass(e, bus, tono(bass + 7), t0, 0.07, 1.2);
      if (s === 7 && !(c % 2)) playBass(e, bus, tono(bass + 12), t0, 0.05, 0.8);
      // brushed drums
      if (!z.suave || s === 0) {
        if (s === 0 || s === 5) playKick(e, bus, t0, (z.tambor ? 0.18 : 0.13) * (s === 0 ? 1 : 0.7), 68, 36);
        if (s === 2 || s === 6) playBrush(e, bus, t0 + hum(), z.tambor ? 0.06 : 0.042);
        if (!(z.escaso && s % 2)) playTick(e, bus, t0 + hum(), s % 2 ? 0.012 : 0.02, 6800, 0.025);
      }
      // the kalimba tune, an octave down and unhurried, with its echo a quarter behind
      for (const [p, m0] of (cycle % 2 ? MEL_SUP_B : MEL_SUP)[c] ?? []) {
        if (p !== s) continue;
        if (z.escaso && Math.random() < z.escaso) continue;
        const m = (z.penta ? aPenta(m0) : m0) - 12 + oct, t = t0 + hum(), v = 0.16 + Math.random() * 0.025;
        pluck(e, bus, tono(m), t, v);
        pluck(e, bus, tono(m), t + (typeof z.eco === 'number' ? z.eco : corch * 2), v * 0.3);
        if (z.arm) pluck(e, bus, tono(enEscala(m - z.arm)), t + 0.02, v * 0.38);
        if (z.brillo && m + 12 <= 100) pluck(e, bus, tono(m + 12), t + 0.16, v * z.brillo);
      }
      if (s === 0) {
        if (z.flauta && c % 2 === 0) playFlute(e, bus, tono((tones[tones.length - 1] ?? 69) + 12 + oct), t0 + 0.05, corch * 6, z.flauta);
        if (z.dron) playPartial(e, bus, midi(43), t0, 0.022, 3, 'sine', 0.3);
        if (z.campanas && c % 4 === 0) [0, 0.14].forEach((d, j) => playTin(e, bus, t0 + d, 0.018 / (j + 1)));
        if (z.viento && c % 2 === 0) playGust(e, bus, t0, 0.045);
      }
      // dust on the record
      if (Math.random() < 0.22) playTick(e, bus, t0 + corch * Math.random(), 0.004 + Math.random() * 0.006, 2500 + Math.random() * 4000, 0.004);
      if (z.pajaros && Math.random() < 0.04) playBird(e, bus, t0 + corch * Math.random(), 0.014);
      if (z.agua && Math.random() < z.agua) playDrop(e, bus, t0 + corch * Math.random(), 0.015);
      if (z.campanillas && Math.random() < z.campanillas) pluck(e, bus, tono(Math.min(100, (tones[Math.floor(Math.random() * tones.length)] ?? 69) + 24)), t0 + 0.1, 0.022);
      nextTime += corch;
      if (++step >= 64) { step = 0; cycle++; }
    }
  }

  function scheduleIsle(e: AudioEngine, bus: TrackBus) {
    const ahora = e.ctx.currentTime;
    clampDrift(ahora);
    while (nextTime < ahora + 0.5) {
      const c = Math.floor(step / 8), s = step % 8;
      if (s === 0) applyPendingScene();
      const z = scene, corch = CORCHEA_I * (z.tempo || 1);
      const t0 = Math.max(nextTime, ahora + 0.02);
      const hum = () => (Math.random() - 0.5) * 0.02;
      const chord = ISLA_ACORDES[c];
      if (!chord) { nextTime += corch; if (++step >= 64) { step = 0; cycle++; } continue; }
      const [bass, tones] = chord;
      const oct = z.oct || 0;
      // kalimba arpeggio, an octave down and soft, with gaps to breathe
      const k = ISLA_ARP[s] ?? -1;
      if (k >= 0 && !(z.escaso && Math.random() < z.escaso)) pluck(e, bus, midi((tones[k % tones.length] ?? 64) - 12), t0 + hum(), 0.06);
      // the tune, answered by its own echo
      for (const [p, m0] of (cycle % 2 ? MEL_ISLA_B : MEL_ISLA)[c] ?? []) {
        if (p !== s) continue;
        const m = m0 + oct, t = t0 + hum(), v = 0.13 + Math.random() * 0.025;
        pluck(e, bus, midi(m), t, v);
        pluck(e, bus, midi(m), t + corch * 1.5, v * 0.3);
        if (z.arm) pluck(e, bus, midi(m - 12 + z.arm), t + 0.03, v * 0.38);
        if (z.brillo && m + 12 <= 100) pluck(e, bus, midi(m + 12), t + 0.2, v * z.brillo);
      }
      if (s === 0) {
        // glassy pad: three low chord tones, slow to arrive, each a hair out of tune with its twin
        tones.slice(0, 3).forEach((m, j) => {
          playPartial(e, bus, midi(m - 12), t0 + j * 0.05, z.pad || 0.026, 3.2 * corch, 'sine', 1.6 * corch);
          playPartial(e, bus, midi(m - 12) * 1.003, t0 + j * 0.05 + 0.03, (z.pad || 0.026) * 0.6, 3.2 * corch, 'sine', 1.8 * corch);
        });
        playBass(e, bus, midi(bass), t0, z.bajo ? 0.11 : 0.075, 3);
        if (z.dron) playPartial(e, bus, midi(40), t0, 0.03, 4, 'sine', 0.8);
        if (c % 2 === 0 && (z.olas || c === 0)) playSwell(e, bus, t0, z.olas ? 0.05 : 0.03);
        if (z.campanas && c % 4 === 0) playBell(e, bus, midi(88), t0 + 0.3, 0.022);
        if (c === 4 && cycle % 2 === 0) playDeep(e, bus, t0, z.fondo ?? 0.022);
      }
      if (z.reloj && (s === 2 || s === 6)) playTick(e, bus, t0 + hum(), 0.022, 4200, 0.03);
      if (Math.random() < (z.agua ?? 0.05)) playDrop(e, bus, t0 + corch * Math.random(), 0.018);
      if (Math.random() < (z.campanillas ?? 0.04)) pluck(e, bus, midi(Math.min(100, (tones[Math.floor(Math.random() * tones.length)] ?? 76) + 24)), t0 + 0.13, 0.024);
      nextTime += corch;
      if (++step >= 64) { step = 0; cycle++; }
    }
  }

  function clampDrift(ahora: number) {
    // Prevent note-burst clustering when mobile timers stall or resume from background
    if (nextTime < ahora - 0.15) nextTime = ahora + 0.05;
  }

  function applyPendingScene() {
    if (pendingScene) {
      scene = pendingScene;
      pendingScene = null;
    }
  }

  function scheduleSky(e: AudioEngine, bus: TrackBus) {
    const ahora = e.ctx.currentTime;
    clampDrift(ahora);
    while (nextTime < ahora + 0.45) {
      const c = Math.floor(step / 6) % 8, st = step % 6;
      if (st === 0) applyPendingScene();
      const z = scene, corch = CORCHEA_C * (z.tempo || 1);
      const tono = (m: number) => midi(z.menor ? aMenor(m) : m);
      const t0 = Math.max(nextTime, ahora + 0.02);
      const hum = () => (Math.random() - 0.5) * 0.014;
      const chord = ACORDES[c];
      if (!chord) { nextTime += corch; if (++step >= 48) { step = 0; cycle++; } continue; }
      const [b, arp] = chord;
      const oct = z.oct || 0;
      //music-box arpeggio
      if (!(z.escaso && st % 2 && Math.random() < z.escaso)) {
        pluck(e, bus, tono(arp[ARP[st] % arp.length] + oct), t0 + hum(), 0.08);
      }
      //chime melody
      for (const [p, m0] of (z.tema ? MEL_TEMA : cycle % 2 ? MELC_B : MELC)[c]) {
        if (p !== st) continue;
        const m = m0 + oct, t = t0 + hum(), v = 0.15 + Math.random() * 0.03;
        pluck(e, bus, tono(m), t, v);
        if (z.arm) pluck(e, bus, tono(enEscala(m - 12 + z.arm)), t + 0.03, v * 0.4);
        if (typeof z.eco === 'number') pluck(e, bus, tono(m), t + z.eco, v * 0.28);
        if (z.brillo && m + 12 <= 100) pluck(e, bus, tono(m + 12), t + 0.18, v * z.brillo);
      }
      if (st === 0) {
        //pad: three chord tones that enter slowly
        arp.slice(0, 3).forEach((m, j) => playPartial(e, bus, tono(m - 12), t0 + j * 0.02, z.pad || 0.024, 2 * corch, 'sine', corch));
        if (z.bajo) playBass(e, bus, tono(b), t0, z.menor ? 0.15 : 0.11, 2);
        if (z.campanas) [0, 0.12].forEach((d, j) => playTin(e, bus, t0 + d, 0.02 / (j + 1)));
        if (z.viento && c % 2 === 0) playGust(e, bus, t0, 0.05);
      }
      if (z.tambor) {
        if (st === 0 || (st === 3 && c % 2)) playKick(e, bus, t0, st === 0 ? 0.26 : 0.19, 90, 40);
        if (st === 2 || st === 4) playTick(e, bus, t0 + hum(), 0.048, 3000, 0.04);
        if (st === 0 && c === 7 && cycle % 2) playGust(e, bus, t0, 0.085);
      }
      const prob = z.campanillas || 0.06;
      if (Math.random() < prob) {
        const chimeMidi = Math.min(98, arp[Math.floor(Math.random() * arp.length)] + 24);
        pluck(e, bus, tono(chimeMidi), t0 + 0.11, 0.028);
      }
      nextTime += corch;
      if (++step >= 48) { step = 0; cycle++; }
    }
  }

  function undergroundFrequency(k: number, z: MusicZone): number {
    if (z.bemol && (k === 6 || k === 13)) return F[k] * 0.9439; //B flat: darker
    return F[k];
  }

  function scheduleUnderground(e: AudioEngine, bus: TrackBus) {
    const ahora = e.ctx.currentTime;
    clampDrift(ahora);
    while (nextTime < ahora + 0.45) {
      const c = Math.floor(step / 8), s = step % 8;
      if (s === 0) applyPendingScene();
      const z = scene, corch = CORCHEA * (z.tempo || 1);
      const t0 = Math.max(nextTime, ahora + 0.02);
      const hum = () => (Math.random() - 0.5) * 0.018;
      const mel = (cycle % 2 ? MEL_B : MEL)[c];
      for (const [p, k0] of mel) {
        if (p !== s) continue;
        if (z.escaso && p !== 0 && Math.random() < z.escaso) continue;
        let k = k0 + (z.oct || 0); if (k > 16) k -= 7;
        const t = t0 + hum(), v = 0.145 + Math.random() * 0.035;
        pluck(e, bus, undergroundFrequency(k, z), t, v);
        if (z.arm && (p === 0 || p === 4) && k + z.arm <= 16) pluck(e, bus, undergroundFrequency(k + z.arm, z), t + 0.03, v * 0.42);
        if (typeof z.eco === 'number') pluck(e, bus, undergroundFrequency(k, z), t + z.eco, v * 0.28);
        if (z.brillo && k + 7 <= 16) pluck(e, bus, undergroundFrequency(k + 7, z), t + 0.15, v * z.brillo);
      }
      const patron = cycle % 2 && c % 2 ? BAJO_C : c % 2 ? BAJO_B : BAJO_A;
      for (const [p, dur] of patron) if (p === s) playBass(e, bus, RAIZ[c] * (z.bajoOct ? 0.5 : 1) * (p === 4 && dur > 1 ? 1.5 : 1), t0 + hum(), 0.145, dur);
      if (z.dron && s === 0) playPartial(e, bus, 146.83, t0, 0.048, 2.0, 'sine', 0.4);
      const vb = z.fuerte ? 0.28 : z.suave ? 0.12 : 0.21;
      const relleno = c === 3 || c === 7;
      if (!z.sinBombo && (s === 0 || s === 4 || (relleno && (s === 6 || s === 7)))) playKick(e, bus, t0, vb * (s === 0 ? 1 : 0.8));
      if (s === 2 || s === 6) playTick(e, bus, t0 + hum(), z.suave ? 0.03 : 0.048);
      else if (cycle % 2 && (s % 2)) playTick(e, bus, t0 + hum(), 0.02);
      if (z.tink && z.tink.includes(s)) playTin(e, bus, t0 + hum(), 0.032);
      nextTime += corch;
      if (++step >= 64) { step = 0; cycle++; }
    }
  }

  async function playRecording(e: AudioEngine, bus: TrackBus, url: string) {
    bus.loading = true;
    try {
      let buffer = decoded.get(url);
      if (!buffer) {
        buffer = fetch(url).then(response => {
          if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
          return response.arrayBuffer();
        }).then(bytes => e.ctx.decodeAudioData(bytes));
        decoded.set(url, buffer);
      }
      const audio = await buffer;
      if (trackBus !== bus || !musicTimer) return;
      const source = e.ctx.createBufferSource();
      source.buffer = audio;
      source.loop = true;
      source.connect(bus.body);
      bus.loop = source;
      source.start();
    } catch (error) {
      decoded.delete(url);
      console.error('No se pudo reproducir la kalimba:', error);
    }
  }

  function scheduleNotes() {
    if (!progress.musica) return;
    const ready = ensureTrackBus();
    if (!ready) return;
    const { e, bus } = ready;
    if (e.ctx.state !== 'running') return;
    if (song === 'sub') return scheduleUnderground(e, bus);
    if (song === 'cielo') return scheduleSky(e, bus);
    if (song === 'isla') return scheduleIsle(e, bus);
    if (song === 'surface') return scheduleSurface(e, bus);

    // only the title screen still plays a recorded loop
    applyPendingScene();
    if (!bus.loading) void playRecording(e, bus, recordings.menu);
  }

  function startMusic() {
    if (!progress.musica) return;
    const ready = ensureTrackBus();
    if (!ready) return;
    const { e } = ready;
    rampGain(e.musicMaster.gain, 0.55, e.ctx.currentTime, 0.45);
    if (!musicTimer) {
      step = 0;
      nextTime = e.ctx.currentTime + 0.25;
      musicTimer = window.setInterval(scheduleNotes, 100);
      scheduleNotes();
    }
  }

  function stopMusic() {
    if (musicTimer) { clearInterval(musicTimer); musicTimer = 0; }
    if (!engine) return;
    rampGain(engine.musicMaster.gain, 0.0001, engine.ctx.currentTime, 0.25);
    // Drop the notes already queued ~0.5 s ahead: otherwise a quick stop → start (tab switch)
    // lets them play on top of the restarted song.
    retireTrackBus(trackBus, engine, 0.25);
    trackBus = null;
  }

  return {
    sonar: startMusic,
    callar: stopMusic,
    escala(nombre: string) {
      if (nombre === currentZoneName) return;
      currentZoneName = nombre;
      const sub = nombre in ZONAS_SUB, cie = nombre in ZONAS_CIELO, isl = nombre in ZONAS_ISLA;
      const nueva = sub ? 'sub' : cie ? 'cielo' : isl ? 'isla' : nombre === 'inicio' ? 'menu' : 'surface';
      const nextScene = (sub ? ZONAS_SUB : cie ? ZONAS_CIELO : isl ? ZONAS_ISLA : ZONAS)[nombre] || ZONAS.inicio;

      if (nueva !== song) {
        // Crossfade cleanly to a fresh track bus so old world notes & tails don't clash
        song = nueva;
        scene = nextScene;
        pendingScene = null;
        step = 0; cycle = 0;
        if (engine && musicTimer) {
          retireTrackBus(trackBus, engine);
          trackBus = createTrackBus(engine, 0.16);
          nextTime = engine.ctx.currentTime + 0.22;
        }
      } else if (musicTimer) {
        // Defer same-world region changes to the next bar/phrase boundary for smooth tempo transitions
        pendingScene = nextScene;
      } else {
        scene = nextScene;
        pendingScene = null;
      }
    },
  };
})();

// If an older copy of this module is still alive (dev hot reload, or the file imported twice),
// it has its own AudioContext and scheduler and the song would play twice. Shut it down first.
window.__kalimbaAudioDispose?.();

progress.musica = progress.musica !== false;
const UNLOCK_EVENTS = ['pointerdown', 'touchend', 'click', 'keydown'] as const;
function removeGestureListeners() {
  UNLOCK_EVENTS.forEach((ev) => removeEventListener(ev, onFirstGesture));
}
export const onFirstGesture = () => {
  if (progress.musica) music.sonar();
  // On touch screens a pointerdown does not unlock audio (touchend/click do), so keep
  // listening until the AudioContext is actually running.
  if (!progress.musica || engine?.ctx.state === 'running') removeGestureListeners();
};
const onVisibility = () => {
  if (document.hidden) music.callar();
  else if (progress.musica) music.sonar();
};
UNLOCK_EVENTS.forEach((ev) => addEventListener(ev, onFirstGesture));
document.addEventListener('visibilitychange', onVisibility);

window.__kalimbaAudioDispose = () => {
  music.callar();
  removeGestureListeners();
  document.removeEventListener('visibilitychange', onVisibility);
  engine?.ctx.close().catch(() => {});
  engine = null;
};