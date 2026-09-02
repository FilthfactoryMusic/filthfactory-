import { create } from "zustand";
import type { Comment, LibraryState, LiveShow, Mix, Playlist } from "./types";

export const EMPTY_COMMENTS: Comment[] = [];
export const EMPTY_CHAT: { id: string; user: string; text: string; at: number }[] = [];

const KEY = "filthfactory-library-v1";

const empty: LibraryState = {
  likes: [],
  follows: [],
  later: [],
  reposts: [],
  history: [],
  playlists: [{ id: "later", name: "Listen later", mixIds: [], createdAt: new Date().toISOString() }],
  comments: {},
  uploads: [],
  displayName: "You",
  ownLive: null,
  chat: {},
  bag: [],
};

function load(): LibraryState {
  if (typeof window === "undefined") return empty;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<LibraryState>;
    return { ...empty, ...parsed, bag: Array.isArray(parsed.bag) ? parsed.bag : [] };
  } catch {
    return empty;
  }
}

type Lib = LibraryState & {
  hydrated: boolean;
  communityLive: LiveShow[];
  hydrate: () => void;
  toggleLike: (id: string) => void;
  toggleFollow: (id: string) => void;
  toggleLater: (id: string) => void;
  toggleRepost: (id: string) => void;
  heard: (id: string, kind: "mix" | "live") => void;
  addComment: (mixId: string, text: string, t: number) => void;
  addPlaylist: (name: string) => void;
  addToPlaylist: (playlistId: string, mixId: string) => void;
  addUpload: (mix: Mix) => void;
  setUploads: (mixes: Mix[]) => void;
  setName: (name: string) => void;
  addBag: (name: string) => void;
  removeBag: (name: string) => void;
  startLive: (show: LiveShow) => void;
  stopLive: () => void;
  setCommunityLive: (lives: LiveShow[]) => void;
  addChat: (liveId: string, text: string) => void;
};

function save(state: Lib) {
  if (typeof window === "undefined") return;
  const data: LibraryState = {
    likes: state.likes,
    follows: state.follows,
    later: state.later,
    reposts: state.reposts,
    history: state.history,
    playlists: state.playlists,
    comments: state.comments,
    uploads: state.uploads,
    displayName: state.displayName,
    ownLive: state.ownLive,
    chat: state.chat,
    bag: state.bag ?? [],
  };
  localStorage.setItem(KEY, JSON.stringify(data));
}

export const useLibrary = create<Lib>((set, get) => ({
  ...empty,
  hydrated: false,
  communityLive: [],
  hydrate: () => {
    if (get().hydrated) return;
    set({ ...load(), hydrated: true, communityLive: get().communityLive });
  },
  toggleLike: (id) =>
    set((s) => {
      const likes = s.likes.includes(id) ? s.likes.filter((x) => x !== id) : [id, ...s.likes];
      const next = { ...s, likes };
      save(next);
      return next;
    }),
  toggleFollow: (id) =>
    set((s) => {
      const follows = s.follows.includes(id) ? s.follows.filter((x) => x !== id) : [id, ...s.follows];
      const next = { ...s, follows };
      save(next);
      return next;
    }),
  toggleLater: (id) =>
    set((s) => {
      const later = s.later.includes(id) ? s.later.filter((x) => x !== id) : [id, ...s.later];
      const next = { ...s, later };
      save(next);
      return next;
    }),
  toggleRepost: (id) =>
    set((s) => {
      const reposts = s.reposts.includes(id) ? s.reposts.filter((x) => x !== id) : [id, ...s.reposts];
      const next = { ...s, reposts };
      save(next);
      return next;
    }),
  heard: (id, kind) =>
    set((s) => {
      const history = [{ id, at: Date.now(), kind }, ...s.history.filter((h) => h.id !== id)].slice(0, 80);
      const next = { ...s, history };
      save(next);
      return next;
    }),
  addComment: (mixId, text, t) =>
    set((s) => {
      const comments = {
        ...s.comments,
        [mixId]: [...(s.comments[mixId] ?? []), { id: `c-${Date.now()}`, user: s.displayName, text, t }],
      };
      const next = { ...s, comments };
      save(next);
      return next;
    }),
  addPlaylist: (name) =>
    set((s) => {
      const playlists: Playlist[] = [
        ...s.playlists,
        { id: `pl-${Date.now()}`, name, mixIds: [], createdAt: new Date().toISOString() },
      ];
      const next = { ...s, playlists };
      save(next);
      return next;
    }),
  addToPlaylist: (playlistId, mixId) =>
    set((s) => {
      const playlists = s.playlists.map((p) =>
        p.id === playlistId && !p.mixIds.includes(mixId) ? { ...p, mixIds: [...p.mixIds, mixId] } : p,
      );
      const next = { ...s, playlists };
      save(next);
      return next;
    }),
  addUpload: (mix) =>
    set((s) => {
      const next = { ...s, uploads: [mix, ...s.uploads.filter((m) => m.id !== mix.id)] };
      save(next);
      return next;
    }),
  setUploads: (mixes) =>
    set((s) => {
      const next = { ...s, uploads: mixes };
      save(next);
      return next;
    }),
  setName: (name) =>
    set((s) => {
      const next = { ...s, displayName: name.trim() || "You" };
      save(next);
      return next;
    }),
  addBag: (name) =>
    set((s) => {
      const n = name.trim().slice(0, 80);
      if (!n) return s;
      if (s.bag.some((x) => x.toLowerCase() === n.toLowerCase())) return s;
      const next = { ...s, bag: [n, ...s.bag].slice(0, 24) };
      save(next);
      return next;
    }),
  removeBag: (name) =>
    set((s) => {
      const next = { ...s, bag: s.bag.filter((x) => x !== name) };
      save(next);
      return next;
    }),
  startLive: (show) =>
    set((s) => {
      const communityLive = [show, ...s.communityLive.filter((x) => x.id !== show.id)];
      const next = { ...s, ownLive: show, communityLive };
      save(next);
      return next;
    }),
  stopLive: () =>
    set((s) => {
      const communityLive = s.ownLive ? s.communityLive.filter((x) => x.id !== s.ownLive?.id) : s.communityLive;
      const next = { ...s, ownLive: null, communityLive };
      save(next);
      return next;
    }),
  setCommunityLive: (lives) => set((s) => ({ ...s, communityLive: lives })),
  addChat: (liveId, text) =>
    set((s) => {
      const msg = {
        id: `m-${Date.now()}`,
        user: s.displayName || "You",
        text,
        at: Date.now(),
      };
      const chat = { ...s.chat, [liveId]: [...(s.chat[liveId] ?? []), msg] };
      const next = { ...s, chat };
      save(next);
      return next;
    }),
}));

export function resolveLive(id: string) {
  const s = useLibrary.getState();
  if (s.ownLive?.id === id) return s.ownLive;
  return s.communityLive.find((x) => x.id === id);
}
