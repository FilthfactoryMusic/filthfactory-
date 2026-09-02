/** One HTML5 deck for licensed remote mixes / radio. */

type StartOpts = {
  url: string;
  offset?: number;
  volume?: number;
  live?: boolean;
  onEnded?: () => void;
};

class RemoteDeck {
  private el: HTMLAudioElement | null = null;
  private ended: (() => void) | null = null;
  private live = false;

  private ensure() {
    if (this.el) return this.el;
    const el = new Audio();
    el.preload = "auto";
    el.setAttribute("playsinline", "true");
    // Do NOT set crossOrigin — Icecast/Shoutcast usually has no CORS,
    // and anonymous mode then plays silence in Chrome.
    el.addEventListener("ended", () => this.ended?.());
    this.el = el;
    return el;
  }

  start(opts: StartOpts) {
    const el = this.ensure();
    this.ended = opts.onEnded ?? null;
    this.live = Boolean(opts.live);
    el.pause();
    el.removeAttribute("crossorigin");
    el.src = opts.url;
    el.volume = opts.volume ?? 0.7;
    if (!this.live && opts.offset) {
      const seek = () => {
        try {
          el.currentTime = opts.offset ?? 0;
        } catch {
          /* radio */
        }
        el.removeEventListener("loadedmetadata", seek);
      };
      el.addEventListener("loadedmetadata", seek);
    }
    void el.play().catch(() => {});
  }

  pause() {
    this.el?.pause();
  }

  resume() {
    void this.el?.play().catch(() => {});
  }

  stop() {
    if (!this.el) return;
    this.el.pause();
    this.el.removeAttribute("src");
    this.el.load();
  }

  seek(t: number) {
    if (this.live || !this.el) return;
    try {
      this.el.currentTime = t;
    } catch {
      /* ignore */
    }
  }

  setVolume(v: number) {
    if (this.el) this.el.volume = v;
  }

  currentTime() {
    return this.el?.currentTime ?? 0;
  }

  duration() {
    const d = this.el?.duration;
    return d && Number.isFinite(d) ? d : 0;
  }
}

let deck: RemoteDeck | null = null;

export function getRemoteDeck() {
  deck ??= new RemoteDeck();
  return deck;
}
