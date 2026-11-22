/** UI sounds and the kalimba, underground and sky scores. */
import { progress } from '../../core/state';

interface MusicZone {
  bajo?: readonly number[] | boolean;
  eco?: readonly number[] | number;
  adorno?: number;
  prob?: number;
  tempo?: number;
  arm?: number;
  soloExtremos?: boolean;
  oct?: number;
  brillo?: number;
  temblor?: boolean;
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
  acomp?: boolean;
  pulso?: boolean;
}

type ZoneMap = Record<string, MusicZone>;

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
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

    // Music master + lightweight cross-coupled stereo delay reverb (replaces heavy 3.2s ConvolverNode)
    const musicMaster = ctx.createGain();
    musicMaster.gain.value = 0.0001;
    musicMaster.connect(master);

    const reverbSend = ctx.createGain();
    reverbSend.gain.value = 0.24;
    const dL = ctx.createDelay(0.5); dL.delayTime.value = 0.173;
    const dR = ctx.createDelay(0.5); dR.delayTime.value = 0.241;
    const lpL = ctx.createBiquadFilter(); lpL.type = 'lowpass'; lpL.frequency.value = 2800;
    const lpR = ctx.createBiquadFilter(); lpR.type = 'lowpass'; lpR.frequency.value = 2300;
    const fbL = ctx.createGain(); fbL.gain.value = 0.34;
    const fbR = ctx.createGain(); fbR.gain.value = 0.34;
    const merger = ctx.createChannelMerger(2);

    reverbSend.connect(dL);
    reverbSend.connect(dR);
    dL.connect(lpL); lpL.connect(fbL); fbL.connect(dR);
    dR.connect(lpR); lpR.connect(fbR); fbR.connect(dL);
    lpL.connect(merger, 0, 0);
    lpR.connect(merger, 0, 1);
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
//Surface melody (kalimba tablature, the dot marks the upper octave):
//   4 5 1̇ 7 6  ×2   ·   4 5 3̇ 7 1  ×2   + gentle second-pass variation and warm harmonic bed.
interface TrackBus {
  gain: GainNode;
  body: BiquadFilterNode;
}

export const music = (() => {
  //17 keys in C: 1..7 = C4..B4 · dotted 1..7 = C5..B5 · double-dotted 1 2 3 = C6..E6
  const F = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25, 587.33, 659.25, 698.46, 783.99, 880.0, 987.77, 1046.5, 1174.66, 1318.51];
  const PASO = 0.82, FIN_FRASE = 1.64, RESPIRO = 1.05;
  const A = [3, 4, 7, 6, 5], B = [3, 4, 9, 6, 0]; // 4 5 1̇ 7 6 · 4 5 3̇ 7 1
  const A2 = [3, 4, 7, 8, 7, 5], B2 = [3, 4, 9, 7, 6, 4]; // second-pass answer with passing tones
  // Harmonic progression across the 4 phrases: Fmaj7 -> Dm7 -> Am7 -> G -> C
  const SURF_CHORDS: readonly { bass: number; pad: readonly number[]; acomp: readonly number[] }[] = [
    { bass: 174.61, pad: [174.61, 220.0, 261.63], acomp: [0, 2, 4] },   // F
    { bass: 146.83, pad: [146.83, 220.0, 261.63], acomp: [1, 3, 5] },   // Dm7
    { bass: 174.61, pad: [174.61, 220.0, 329.63], acomp: [0, 4, 5] },   // Fmaj7
    { bass: 130.81, pad: [130.81, 196.0, 261.63], acomp: [0, 2, 4] },   // C
  ];
  interface KalimbaStep { k: number; ini: boolean; fin: boolean; dt: number; phrase: number; idx: number }
  function buildSequence(phrases: readonly (readonly number[])[]): KalimbaStep[] {
    const out: KalimbaStep[] = [];
    phrases.forEach((fr, phrase) => {
      fr.forEach((k, idx) => {
        const isLast = idx === fr.length - 1;
        const stepDt = fr.length > 5 && (idx === 2 || idx === 3) ? PASO * 0.55 : PASO;
        out.push({ k, ini: idx === 0, fin: isLast, dt: isLast ? FIN_FRASE : stepDt, phrase, idx });
      });
    });
    out[out.length - 1].dt += RESPIRO;
    return out;
  }
  const SEC = buildSequence([A, A, B, B]);
  const SEC_B = buildSequence([A, A2, B, B2]);

  //the same melody, colored by the region (with distinct title screen & rich first world)
  const ZONAS: ZoneMap = {
    inicio: { tempo: 1.08, pad: 0.032, bajo: [0, 4], brillo: 0.16, acomp: true },
    pradera: { tempo: 0.96, pad: 0.026, bajo: [0], acomp: true, pulso: true },
    bosque: { tempo: 1.12, pad: 0.03, brillo: 0.24, acomp: true },
    canon: { eco: [0.42, 0.84], pad: 0.022, bajo: [0] },
    valle: { tempo: 0.9, arm: 2, acomp: true, pulso: true },
    lago: { tempo: 1.05, pad: 0.028, adorno: 1, prob: 0.6, acomp: true },
    cumbres: { oct: 7, tempo: 1.12, pad: 0.026, brillo: 0.15 },
    desierto: { bajo: [0, 4], adorno: -1, prob: 0.5, pulso: true },
    aldea: { tempo: 0.92, adorno: 2, prob: 0.65, temblor: true, acomp: true, pulso: true },
    ciudadela: { tempo: 1.06, bajo: [0], arm: 4, soloExtremos: true, pad: 0.034 },
    secreto: { oct: 7, tempo: 1.08, eco: [0.46], brillo: 0.2, pad: 0.026 },
  };

  let scene: MusicZone = ZONAS.inicio;
  let pendingScene: MusicZone | null = null;
  let currentZoneName = 'inicio';
  let trackBus: TrackBus | null = null;
  let musicTimer = 0;
  let phraseIndex = 0;
  let nextTime = 0;
  let song = 'kalimba', step = 0, cycle = 0;

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
    gain.connect(reverbSend);
    return { gain, body };
  }

  function retireTrackBus(oldBus: TrackBus | null, e: AudioEngine) {
    if (!oldBus) return;
    const now = e.ctx.currentTime;
    rampGain(oldBus.gain.gain, 0.0001, now, 0.12);
    window.setTimeout(() => {
      try { oldBus.body.disconnect(); oldBus.gain.disconnect(); } catch { /* already disconnected */ }
    }, 900);
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
        if (z.arm && m + z.arm < 100) pluck(e, bus, tono(m - 12 + z.arm), t + 0.03, v * 0.4);
        if (typeof z.eco === 'number') pluck(e, bus, tono(m), t + z.eco, v * 0.28);
        if (z.brillo && m + 12 <= 100) pluck(e, bus, tono(m + 12), t + 0.18, v * z.brillo);
      }
      if (st === 0) {
        //pad: three chord tones that enter slowly
        arp.slice(0, 3).forEach((m, j) => playPartial(e, bus, tono(m - 12), t0 + j * 0.02, z.pad || 0.03, 2.2 * (z.tempo || 1), 'sine', 0.65));
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

  function scheduleNotes() {
    if (!progress.musica) return;
    const ready = ensureTrackBus();
    if (!ready) return;
    const { e, bus } = ready;
    if (e.ctx.state !== 'running') return;
    if (song === 'sub') return scheduleUnderground(e, bus);
    if (song === 'cielo') return scheduleSky(e, bus);

    const ahora = e.ctx.currentTime;
    clampDrift(ahora);
    while (nextTime < ahora + 0.5) {
      const seq = cycle % 2 ? SEC_B : SEC;
      const n = seq[phraseIndex % seq.length];
      if (n.ini) applyPendingScene();
      const z = scene;
      const tempo = z.tempo || 1;
      const chord = SURF_CHORDS[n.phrase] ?? SURF_CHORDS[0];
      let k = n.k + (z.oct || 0);
      if (k > 16) k -= 7;
      const t = Math.max(nextTime + (Math.random() - 0.5) * 0.035, ahora + 0.02);
      const v = 0.18 + Math.random() * 0.035;

      // Warm harmonic pad & root bass on phrase entry
      if (n.ini) {
        const padVol = z.pad ?? 0.022;
        if (padVol > 0) {
          chord.pad.forEach((pf, j) => playPartial(e, bus, pf, t + j * 0.03, padVol, 2.3 * tempo, 'sine', 0.55));
        }
        playBass(e, bus, chord.bass, t + 0.01, 0.095, 1.8);
      }

      if (z.adorno && !n.ini && z.prob !== undefined && Math.random() < z.prob) {
        const ka = k + z.adorno;
        if (ka >= 0 && ka <= 16) pluck(e, bus, F[ka] ?? 0, Math.max(ahora + 0.01, t - 0.1), v * 0.38);
      }
      pluck(e, bus, F[k] ?? 0, t, v);

      // Gentle two-thumb off-beat accompaniment pluck between melody notes
      if (z.acomp && !n.fin) {
        const acKey = chord.acomp[n.idx % chord.acomp.length];
        const halfStep = n.dt * tempo * 0.5;
        if (halfStep >= 0.28) {
          pluck(e, bus, F[acKey] ?? 0, t + halfStep, v * 0.36);
        }
      }

      // Soft organic pulse for livelier surface regions
      if (z.pulso) {
        if (n.ini) playKick(e, bus, t, 0.11, 88, 46);
        else if (n.idx % 2 === 1) playTick(e, bus, t + n.dt * tempo * 0.5, 0.022, 5200, 0.03);
      }

      if (z.arm && (!z.soloExtremos || n.ini || n.fin)) {
        const k2 = k + z.arm;
        if (k2 <= 16) pluck(e, bus, F[k2] ?? 0, t + 0.032, v * 0.42);
      }
      if (Array.isArray(z.bajo) && n.ini) {
        z.bajo.forEach((kb, j) => pluck(e, bus, F[kb] ?? 0, t + 0.015 + j * 0.035, v * 0.42));
      }
      if (Array.isArray(z.eco)) {
        z.eco.forEach((d, j) => pluck(e, bus, F[k] ?? 0, t + d, v * (0.28 / (j + 1))));
      }
      if (z.brillo && k + 7 <= 16) pluck(e, bus, F[k + 7] ?? 0, t + 0.18, v * z.brillo);
      if (z.temblor && n.fin) pluck(e, bus, F[k] ?? 0, t + 0.15, v * 0.5);

      nextTime += n.dt * tempo;
      if (++phraseIndex >= seq.length) {
        phraseIndex = 0;
        cycle++;
      }
    }
  }

  function startMusic() {
    if (!progress.musica) return;
    const ready = ensureTrackBus();
    if (!ready) return;
    const { e } = ready;
    rampGain(e.musicMaster.gain, 0.55, e.ctx.currentTime, 0.45);
    if (!musicTimer) {
      phraseIndex = 0; step = 0;
      nextTime = e.ctx.currentTime + 0.25;
      musicTimer = window.setInterval(scheduleNotes, 100);
      scheduleNotes();
    }
  }

  function stopMusic() {
    if (!engine) return;
    rampGain(engine.musicMaster.gain, 0.0001, engine.ctx.currentTime, 0.25);
    if (musicTimer) { clearInterval(musicTimer); musicTimer = 0; }
  }

  return {
    sonar: startMusic,
    callar: stopMusic,
    escala(nombre: string) {
      if (nombre === currentZoneName) return;
      currentZoneName = nombre;
      const sub = nombre in ZONAS_SUB, cie = nombre in ZONAS_CIELO;
      const nueva = sub ? 'sub' : cie ? 'cielo' : 'kalimba';
      const nextScene = (sub ? ZONAS_SUB : cie ? ZONAS_CIELO : ZONAS)[nombre] || ZONAS.inicio;

      if (nueva !== song) {
        // Crossfade cleanly to a fresh track bus so old world notes & tails don't clash
        song = nueva;
        scene = nextScene;
        pendingScene = null;
        phraseIndex = 0; step = 0; cycle = 0;
        if (engine) {
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

progress.musica = progress.musica !== false;
export const onFirstGesture = () => {
  if (progress.musica) music.sonar();
  removeEventListener('pointerdown', onFirstGesture);
  removeEventListener('touchend', onFirstGesture);
  removeEventListener('click', onFirstGesture);
  removeEventListener('keydown', onFirstGesture);
};
addEventListener('pointerdown', onFirstGesture);
addEventListener('touchend', onFirstGesture);
addEventListener('click', onFirstGesture);
addEventListener('keydown', onFirstGesture);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) music.callar();
  else if (progress.musica) music.sonar();
});
