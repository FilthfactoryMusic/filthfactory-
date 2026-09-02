let stream: MediaStream | null = null;
const listeners = new Set<(s: MediaStream | null) => void>();

export function getBoothStream() {
  return stream;
}

export function setBoothStream(next: MediaStream | null) {
  stream = next;
  listeners.forEach((fn) => fn(stream));
}

export function subscribeBoothStream(fn: (s: MediaStream | null) => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function stopBoothStream() {
  stream?.getTracks().forEach((t) => t.stop());
  setBoothStream(null);
}
