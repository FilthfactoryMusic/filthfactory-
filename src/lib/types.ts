export type EngineGenre =
  | "ukg"
  | "dnb"
  | "techno"
  | "house"
  | "grime"
  | "jungle"
  | "bassline"
  | "breaks"
  | "funky"
  | "disco"
  | "electro"
  | "industrial";

export type Track = {
  t: number;
  title: string;
};

export type Comment = {
  id: string;
  user: string;
  text: string;
  t: number;
};

export type Mix = {
  id: string;
  title: string;
  djId: string;
  show: string;
  artwork: string;
  city: string;
  citySlug: string;
  genres: string[];
  engine: EngineGenre;
  bpm: number;
  duration: number;
  plays: number;
  likes: number;
  uploadedAt: string;
  description: string;
  tracklist: Track[];
  comments: Comment[];
  tags: string[];
  seed: number;
  featured?: boolean;
  streamUrl?: string;
  credit?: string;
  beatportUrl?: string;
  spotifyUrl?: string;
  bandcampUrl?: string;
  cut?: string;
  label?: string;
};

export type Dj = {
  id: string;
  name: string;
  handle: string;
  city: string;
  citySlug: string;
  photo: string;
  bio: string;
  genres: string[];
  show: string;
  followers: number;
};

export type LiveShow = {
  id: string;
  djId: string;
  title: string;
  venue: string;
  city: string;
  citySlug: string;
  artwork: string;
  genres: string[];
  engine: EngineGenre;
  bpm: number;
  listeners: number;
  durationMin: number;
  description: string;
  tracklist: Track[];
  status: "live" | "upcoming";
  startsAt?: string;
  seed: number;
  hostUserId?: string;
  hostName?: string;
  hasCamera?: boolean;
  advertised?: boolean;
  streamUrl?: string;
  credit?: string;
  watchUrl?: string;
  embedUrl?: string;
};

export type Playlist = {
  id: string;
  name: string;
  mixIds: string[];
  createdAt: string;
};

export type LibraryState = {
  likes: string[];
  follows: string[];
  later: string[];
  reposts: string[];
  history: { id: string; at: number; kind: "mix" | "live" }[];
  playlists: Playlist[];
  comments: Record<string, Comment[]>;
  uploads: Mix[];
  displayName: string;
  ownLive: LiveShow | null;
  chat: Record<string, { id: string; user: string; text: string; at: number }[]>;
  bag: string[];
};
