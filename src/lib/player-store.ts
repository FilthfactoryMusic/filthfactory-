import { create } from "zustand";
import { getEngine, type EngineOpts } from "./audio-engine";
import { getChartMix } from "./chart-cache";
import { getLive, getMix, liveOffsetSec } from "./catalog";
import { mixStreamUrl } from "./feeds";
import { resolveLive, useLibrary } from "./library-store";
import { getRemoteDeck } from "./stream-player";
import { isBoothBroadcast } from "./viewer-id";
import { setWatchGain, setWatchPaused } from "./watch-media";

export type NowPlaying =
  | { kind: "mix"; id: string }
  | { kind: "live"; id: string }
  | null;

type PlayerState = {
  now: NowPlaying;
  playing: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  queue: string[];
  queueIndex: number;
  playMix: (id: string, opts?: { queue?: string[]; offset?: number }) => void;
  playLive: (id: string) => void;
  toggle: () => void;
  seek: (t: number) => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  next: () => void;
  prev: () => void;
  tick: () => void;
  stop: () => void;
};

function findMix(id: string) {
  return getMix(id) ?? useLibrary.getState().uploads.find((m) => m.id === id) ?? getChartMix(id);
}

function usingRemote(now: NowPlaying) {
  if (!now) return false;
  if (now.kind === "live") {
    if (isBoothBroadcast(now.id)) return false;
    const live = getLive(now.id) ?? resolveLive(now.id);
    return Boolean(live?.streamUrl);
  }
  const mix = findMix(now.id);
  return Boolean(mix && mixStreamUrl(mix));
}

function engineOptsForMix(id: string, offset: number, volume: number): EngineOpts | null {
  const mix = findMix(id);
  if (!mix || mixStreamUrl(mix)) return null;
  return {
    engine: mix.engine,
    bpm: mix.bpm,
    seed: mix.seed,
    duration: mix.duration,
    offset,
    volume,
    onEnded: () => usePlayer.getState().next(),
  };
}

export const usePlayer = create<PlayerState>((set, get) => ({
  now: null,
  playing: false,
  currentTime: 0,
  duration: 0,
  volume: 0.7,
  muted: false,
  queue: [],
  queueIndex: 0,

  playMix: (id, opts) => {
    const mix = findMix(id);
    if (!mix) return;
    const queue = opts?.queue?.length ? opts.queue : [id];
    const idx = Math.max(0, queue.indexOf(id));
    const offset = opts?.offset ?? 0;
    const vol = get().muted ? 0 : get().volume;
    const url = mixStreamUrl(mix);
    const eng = getEngine();
    if (url) {
      eng?.stop();
      getRemoteDeck().start({
        url,
        offset,
        volume: vol,
        onEnded: () => usePlayer.getState().next(),
      });
    } else {
      getRemoteDeck().stop();
      const eopts = engineOptsForMix(id, offset, vol);
      if (eng && eopts) void eng.start(eopts);
    }
    set({
      now: { kind: "mix", id },
      playing: true,
      currentTime: offset,
      duration: mix.duration,
      queue,
      queueIndex: idx,
    });
    useLibrary.getState().heard(id, "mix");
  },

  playLive: (id) => {
    const live = getLive(id) ?? resolveLive(id) ?? useLibrary.getState().ownLive;
    const eng = getEngine();
    const remote = getRemoteDeck();
    const vol = get().muted ? 0 : get().volume;
    if (isBoothBroadcast(id)) {
      eng?.stop();
      remote.stop();
      setWatchPaused(false);
      setWatchGain(get().volume, get().muted);
    } else if (live?.streamUrl) {
      eng?.stop();
      remote.start({ url: live.streamUrl, volume: vol, live: true });
    } else if (live?.embedUrl || live?.watchUrl) {
      eng?.stop();
      remote.stop();
    } else {
      remote.stop();
      const offset = live?.status === "live" && live ? liveOffsetSec(live) : 0;
      if (eng && live) {
        void eng.start({
          engine: live.engine,
          bpm: live.bpm,
          seed: live.seed,
          duration: live.durationMin * 60,
          offset,
          volume: vol,
          onEnded: () => usePlayer.getState().stop(),
        });
      }
    }
    set({
      now: { kind: "live", id },
      playing: true,
      currentTime: 0,
      duration: live?.durationMin ? live.durationMin * 60 : 3 * 60 * 60,
      queue: [],
      queueIndex: 0,
    });
    useLibrary.getState().heard(id, "live");
  },

  toggle: () => {
    const { playing, now } = get();
    if (!now) return;
    if (now.kind === "live" && isBoothBroadcast(now.id)) {
      setWatchPaused(playing);
      set({ playing: !playing });
      return;
    }
    if (usingRemote(now)) {
      if (playing) getRemoteDeck().pause();
      else getRemoteDeck().resume();
      set({ playing: !playing });
      return;
    }
    const eng = getEngine();
    if (!eng) return;
    if (playing) {
      eng.pause();
      set({ playing: false, currentTime: eng.currentTime() });
    } else {
      void eng.resume();
      set({ playing: true });
    }
  },

  seek: (t) => {
    const { duration, now } = get();
    if (!now || now.kind === "live") return;
    const clamped = Math.max(0, Math.min(duration, t));
    if (usingRemote(now)) getRemoteDeck().seek(clamped);
    else getEngine()?.seek(clamped);
    set({ currentTime: clamped });
  },

  setVolume: (v) => {
    const vol = Math.max(0, Math.min(1, v));
    const muted = vol === 0;
    const eng = getEngine();
    if (eng && !muted) eng.setVolume(vol);
    getRemoteDeck().setVolume(muted ? 0 : vol);
    setWatchGain(vol, muted);
    set({ volume: vol, muted });
  },

  toggleMute: () => {
    const { muted, volume, now } = get();
    const next = !muted;
    getEngine()?.setVolume(next ? 0 : volume);
    getRemoteDeck().setVolume(next ? 0 : volume);
    if (now?.kind === "live" && isBoothBroadcast(now.id)) setWatchGain(volume, next);
    set({ muted: next });
  },

  next: () => {
    const { queue, queueIndex } = get();
    const nxt = queue[queueIndex + 1];
    if (nxt) get().playMix(nxt, { queue });
    else {
      getEngine()?.stop();
      getRemoteDeck().stop();
      set({ playing: false });
    }
  },

  prev: () => {
    const { queue, queueIndex, currentTime } = get();
    if (currentTime > 3 || queueIndex === 0) {
      get().seek(0);
      return;
    }
    const prevId = queue[queueIndex - 1];
    if (prevId) get().playMix(prevId, { queue });
  },

  tick: () => {
    const { playing, now } = get();
    if (!playing || !now) return;
    if (now.kind === "live" && isBoothBroadcast(now.id)) {
      set({ currentTime: get().currentTime + 0.016 });
      return;
    }
    if (usingRemote(now)) {
      const deck = getRemoteDeck();
      const d = deck.duration();
      set({ currentTime: deck.currentTime(), duration: d || get().duration });
      return;
    }
    const eng = getEngine();
    if (eng) set({ currentTime: eng.currentTime() });
  },

  stop: () => {
    getEngine()?.stop();
    getRemoteDeck().stop();
    setWatchPaused(true);
    set({ now: null, playing: false, currentTime: 0, queue: [], queueIndex: 0 });
  },
}));
