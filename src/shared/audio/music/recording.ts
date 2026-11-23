/** The title screen's music: a kalimba loop rendered ahead of time by scripts/render-kalimba.mjs. */
import type { MusicOutput } from './trackBus';
import { transport } from './transport';

const MENU_LOOP_URL = new URL('../../../../assets/kalimba-menu.wav', import.meta.url).href;

/** Decoded once per URL; a failed decode is forgotten so the next attempt retries. */
const decoded = new Map<string, Promise<AudioBuffer>>();

function decode(context: AudioContext, url: string): Promise<AudioBuffer> {
  let buffer = decoded.get(url);
  if (!buffer) {
    buffer = fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
        return response.arrayBuffer();
      })
      .then((bytes) => context.decodeAudioData(bytes));
    decoded.set(url, buffer);
  }
  return buffer;
}

/** Loops the title recording on the bus, unless the song moved on while it was loading. */
export async function playMenuLoop({ engine, bus }: MusicOutput): Promise<void> {
  const url = MENU_LOOP_URL;
  bus.loading = true;
  try {
    const audio = await decode(engine.context, url);
    if (transport.trackBus !== bus || !transport.timer) return;
    const source = engine.context.createBufferSource();
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
