const nodes = new Set<HTMLMediaElement>();

export function registerWatchEl(el: HTMLMediaElement) {
  nodes.add(el);
  return () => {
    nodes.delete(el);
  };
}

export function setWatchPaused(paused: boolean) {
  nodes.forEach((el) => {
    if (paused) el.pause();
    else void el.play().catch(() => {});
  });
}

export function setWatchGain(volume: number, muted: boolean) {
  nodes.forEach((el) => {
    el.volume = muted ? 0 : volume;
  });
}
