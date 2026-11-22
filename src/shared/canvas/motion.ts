/** One animation loop, running only while a canvas or flyer still moves and motion is allowed. */

const jobs = new Set<(now: number) => void>();
let frame = 0;
let listenersAttached = false;

const reducedMotionQuery =
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;

function isMotionPaused(): boolean {
  if (typeof document !== 'undefined' && document.hidden) return true;
  if (reducedMotionQuery?.matches) return true;
  return false;
}

function schedule(): void {
  if (jobs.size > 0 && !frame && !isMotionPaused()) {
    frame = requestAnimationFrame(pump);
  }
}

function halt(): void {
  if (frame) {
    cancelAnimationFrame(frame);
    frame = 0;
  }
}

function onEnvironmentChange(): void {
  if (isMotionPaused()) halt();
  else schedule();
}

function ensureListeners(): void {
  if (listenersAttached) return;
  listenersAttached = true;
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', onEnvironmentChange);
  }
  reducedMotionQuery?.addEventListener('change', onEnvironmentChange);
}

function pump(now: number): void {
  frame = 0;
  if (isMotionPaused()) return;
  for (const job of [...jobs]) job(now);
  schedule();
}

export function trackMotion(job: (now: number) => void): () => void {
  ensureListeners();
  jobs.add(job);
  schedule();
  return () => {
    jobs.delete(job);
    if (jobs.size === 0) halt();
  };
}
