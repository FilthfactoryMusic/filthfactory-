/**
 * HTML5 stream manager for mixes + radio.
 * Recovers from 4G/5G dropouts with exponential backoff and cache-busted re-attach.
 */

export type StreamStartOpts = {
  url: string;
  offset?: number;
  volume?: number;
  live?: boolean;
  title?: string;
  artist?: string;
  artwork?: string;
  onEnded?: () => void;
  onPlaying?: () => void;
  onStall?: () => void;
};

function withNocache(url: string) {
  try {
    const u = new URL(url, typeof location === "undefined" ? "https://www.filthfactory.co.uk" : location.origin);
    u.searchParams.set("nocache", String(Date.now()));
    return u.toString();
  } catch {
    const join = url.includes("?") ? "&" : "?";
    return `${url}${join}nocache=${Date.now()}`;
  }
}

export class StreamManager {
  private el: HTMLAudioElement | null = null;
  private source = "";
  private live = false;
  private retries = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private ended: (() => void) | null = null;
  private stall: (() => void) | null = null;
  private playingCb: (() => void) | null = null;
  private lastOffset = 0;
  private meta: { title?: string; artist?: string; artwork?: string } = {};

  private ensure() {
    if (this.el) return this.el;
    const el = new Audio();
    el.preload = "auto";
    el.setAttribute("playsinline", "true");
    el.setAttribute("webkit-playsinline", "true");
    el.addEventListener("ended", () => {
      if (!this.live) this.ended?.();
    });
    el.addEventListener("playing", () => {
      this.retries = 0;
      this.playingCb?.();
      this.syncSession("playing");
    });
    el.addEventListener("pause", () => this.syncSession("paused"));
    el.addEventListener("waiting", () => this.stall?.());
    el.addEventListener("stalled", () => this.scheduleRetry());
    el.addEventListener("error", () => this.scheduleRetry());
    el.addEventListener("emptied", () => {
      /* ignore during re-attach */
    });
    this.el = el;
    return el;
  }

  start(opts: StreamStartOpts) {
    this.clearRetry();
    this.source = opts.url;
    this.live = Boolean(opts.live);
    this.retries = 0;
    this.ended = opts.onEnded ?? null;
    this.stall = opts.onStall ?? null;
    this.playingCb = opts.onPlaying ?? null;
    this.lastOffset = opts.offset ?? 0;
    this.meta = { title: opts.title, artist: opts.artist, artwork: opts.artwork };
    const el = this.ensure();
    el.pause();
    el.removeAttribute("crossorigin");
    el.volume = opts.volume ?? 0.7;
    this.attach(true);
    if (!this.live && this.lastOffset) {
      const seek = () => {
        try {
          el.currentTime = this.lastOffset;
        } catch {
          /* live / ice */
        }
        el.removeEventListener("loadedmetadata", seek);
      };
      el.addEventListener("loadedmetadata", seek);
    }
    this.bindSession();
    void el.play().catch(() => this.scheduleRetry());
  }

  private attach(bust: boolean) {
    const el = this.ensure();
    const next = bust ? withNocache(this.source) : this.source;
    el.src = next;
    el.load();
  }

  private scheduleRetry() {
    if (!this.source) return;
    this.clearRetry();
    this.stall?.();
    const delay = Math.min(30_000, 400 * 2 ** Math.min(this.retries, 6));
    this.retries += 1;
    this.timer = setTimeout(() => {
      try {
        this.lastOffset = this.el?.currentTime || this.lastOffset;
      } catch {
        /* ignore */
      }
      this.attach(true);
      if (!this.live && this.lastOffset) {
        try {
          this.ensure().currentTime = this.lastOffset;
        } catch {
          /* ignore */
        }
      }
      void this.ensure().play().catch(() => this.scheduleRetry());
    }, delay);
  }

  private clearRetry() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private bindSession() {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    const { title, artist, artwork } = this.meta;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: title || "Filthfactory",
        artist: artist || "filthfactory.co.uk",
        album: "Filthfactory",
        artwork: artwork
          ? [{ src: artwork, sizes: "512x512", type: "image/png" }]
          : [{ src: "/art/brand/logo.png", sizes: "512x512", type: "image/png" }],
      });
    } catch {
      /* older webviews */
    }
  }

  private syncSession(state: MediaSessionPlaybackState) {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    try {
      navigator.mediaSession.playbackState = state;
    } catch {
      /* ignore */
    }
  }

  pause() {
    this.clearRetry();
    this.el?.pause();
    this.syncSession("paused");
  }

  resume() {
    void this.el?.play().catch(() => this.scheduleRetry());
    this.syncSession("playing");
  }

  stop() {
    this.clearRetry();
    this.source = "";
    if (!this.el) return;
    this.el.pause();
    this.el.removeAttribute("src");
    this.el.load();
    this.syncSession("none");
  }

  seek(t: number) {
    if (this.live || !this.el) return;
    try {
      this.el.currentTime = t;
      this.lastOffset = t;
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
