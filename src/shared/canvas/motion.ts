/** One animation loop, running only while a canvas or flyer still moves. */

const jobs = new Set<(now: number) => void>();
let frame = 0;

function pump(now: number): void {
  frame = 0;
  for (const job of [...jobs]) job(now);
  if (jobs.size > 0) frame = requestAnimationFrame(pump);
}

export function trackMotion(job: (now: number) => void): () => void {
  jobs.add(job);
  if (!frame) frame = requestAnimationFrame(pump);
  return () => {
    jobs.delete(job);
    if (jobs.size === 0 && frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  };
}
