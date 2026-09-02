import type { Dj, EngineGenre, LiveShow, Mix } from "./types";
import { hashString } from "./utils";

const IA = "https://archive.org/download/BreakbeatMixes2005-2006-OwenSpencer";

/** CC BY-NC-ND 3.0 DJ mixes (Owen Spencer, Internet Archive) — streamed with credit. */
export const FREE_MIX_FILES = [
  `${IA}/AddictedtoBreaks.mp3`,
  `${IA}/DarkAndHardNuSkoolMix.mp3`,
  `${IA}/ElectroFunkMix.mp3`,
  `${IA}/ElectroTekMix.mp3`,
  `${IA}/EssentialMix2006.mp3`,
  `${IA}/PercussiveThinkingMix.mp3`,
  `${IA}/ProgressiveBreaks1Mix.mp3`,
  `${IA}/ProgressiveBreaks2Mix.mp3`,
  `${IA}/Room1TekBreaks-Vol1.mp3`,
  `${IA}/Room2FunkyBreaks-Vol1.mp3`,
  `${IA}/SubBassAndDirtyBreaksMix.mp3`,
  `${IA}/SynthNuSkoolMix.mp3`,
  `${IA}/TekBreaks1Mix.mp3`,
  `${IA}/TekBreaks2Mix.mp3`,
  `${IA}/TightAndFocusedMix.mp3`,
  `${IA}/ToughMainRoomMix.mp3`,
] as const;

export const MIX_CREDIT = "Owen Spencer · CC BY-NC-ND · Internet Archive";

export function mixStreamUrl(mix: Mix) {
  if (mix.streamUrl) return mix.streamUrl;
  if (mix.id.startsWith("drop-")) return null;
  return FREE_MIX_FILES[hashString(mix.id) % FREE_MIX_FILES.length]!;
}

export function mixCredit(mix: Mix) {
  return mix.credit ?? MIX_CREDIT;
}

export const WORLD_DJS: Dj[] = [
  {
    id: "groove-london",
    name: "Groove London",
    handle: "groovelondon",
    city: "London",
    citySlug: "london",
    photo: "/art/stations/groove-london.jpg",
    show: "Groove London Radio",
    genres: ["House", "UK Garage", "UK Funky"],
    followers: 48000,
    bio: "London underground dance, 24 hours. groovelondon.com",
  },
  {
    id: "thames-delta",
    name: "Thames Delta Radio",
    handle: "thamesdelta",
    city: "Grays",
    citySlug: "london",
    photo: "/art/stations/thames-delta.jpg",
    show: "Thames Delta",
    genres: ["Jungle", "Drum & Bass"],
    followers: 22000,
    bio: "Jungle and drum & bass out of Thurrock. Live on YouTube and Restream.",
  },
  {
    id: "radio-respect",
    name: "Radio Respect",
    handle: "radiorespect",
    city: "Bognor Regis",
    citySlug: "brighton",
    photo: "/art/stations/radio-respect.jpg",
    show: "Bognor Radio Respect",
    genres: ["House", "Disco"],
    followers: 6400,
    bio: "Bognor community station. Live shows, mental health, records.",
  },
  {
    id: "code-red",
    name: "Code Red Radio",
    handle: "codered",
    city: "London",
    citySlug: "london",
    photo: "/art/stations/code-red.jpg",
    show: "Code Red",
    genres: ["Drum & Bass", "Jungle"],
    followers: 18000,
    bio: "UK DnB station. Live Tue–Fri 19:30–22:30 on YouTube.",
  },
  {
    id: "rinse-fm",
    name: "Rinse FM",
    handle: "rinse",
    city: "London",
    citySlug: "london",
    photo: "/art/stations/rinse.jpg",
    show: "Rinse FM",
    genres: ["Grime", "UK Garage", "Drum & Bass"],
    followers: 210000,
    bio: "London pirate bloodline. Official public stream.",
  },
  {
    id: "flex-fm",
    name: "Flex FM",
    handle: "flexfm",
    city: "London",
    citySlug: "london",
    photo: "/art/stations/flex-fm.jpg",
    show: "Flex FM",
    genres: ["UK Garage", "Bassline"],
    followers: 31000,
    bio: "West London garage and bass. Official public stream.",
  },
];

function room(opts: {
  id: string;
  djId: string;
  title: string;
  venue: string;
  city: string;
  citySlug: string;
  artwork: string;
  genres: string[];
  engine: EngineGenre;
  listeners: number;
  description: string;
  streamUrl?: string;
  watchUrl?: string;
  embedUrl?: string;
  credit: string;
  advertised?: boolean;
}): LiveShow {
  return {
    id: opts.id,
    djId: opts.djId,
    title: opts.title,
    venue: opts.venue,
    city: opts.city,
    citySlug: opts.citySlug,
    artwork: opts.artwork,
    genres: opts.genres,
    engine: opts.engine,
    bpm: 128,
    listeners: opts.listeners,
    durationMin: 24 * 60,
    description: opts.description,
    tracklist: [{ t: 0, title: "Live feed" }],
    status: "live",
    seed: hashString(opts.id),
    streamUrl: opts.streamUrl,
    watchUrl: opts.watchUrl,
    embedUrl: opts.embedUrl,
    credit: opts.credit,
    advertised: opts.advertised,
  };
}

export const WORLD_LIVE: LiveShow[] = [
  room({
    id: "feed-groove-london",
    djId: "groove-london",
    title: "Groove London Radio",
    venue: "Groove London",
    city: "London",
    citySlug: "london",
    artwork: "/art/stations/groove-london-card.jpg",
    genres: ["House", "UK Garage"],
    engine: "house",
    listeners: 1840,
    description: "London underground dance, 24/7. Official Groove London stream.",
    streamUrl: "https://eu10.fastcast4u.com/groovelondon",
    watchUrl: "https://www.groovelondon.com/",
    credit: "Stream via Groove London Radio",
    advertised: true,
  }),
  room({
    id: "feed-thames-delta",
    djId: "thames-delta",
    title: "Thames Delta Radio",
    venue: "Thames Delta",
    city: "Grays",
    citySlug: "london",
    artwork: "/art/stations/thames-delta-card.jpg",
    genres: ["Jungle", "Drum & Bass"],
    engine: "jungle",
    listeners: 920,
    description: "Jungle / DnB from Thurrock. Watch the live desk on their official player.",
    watchUrl: "https://thamesdeltaradio.com/listen-live",
    embedUrl: "https://player.restream.io/?token=d2fd242c31b748fc9018aee1ddfc018f",
    credit: "Watch via Thames Delta Radio",
    advertised: true,
  }),
  room({
    id: "feed-radio-respect",
    djId: "radio-respect",
    title: "Bognor Radio Respect",
    venue: "Radio Respect",
    city: "Bognor Regis",
    citySlug: "brighton",
    artwork: "/art/stations/radio-respect-card.jpg",
    genres: ["House", "Disco"],
    engine: "disco",
    listeners: 310,
    description: "Bognor community radio. Live volunteer shows.",
    streamUrl: "/api/radio/respect",
    watchUrl: "http://bognorradiorespect.org/listen.html",
    credit: "Stream via Radio Respect CIC",
  }),
  room({
    id: "feed-code-red",
    djId: "code-red",
    title: "Code Red Radio",
    venue: "Code Red",
    city: "London",
    citySlug: "london",
    artwork: "/art/stations/code-red-card.jpg",
    genres: ["Drum & Bass", "Jungle"],
    engine: "dnb",
    listeners: 740,
    description: "UK DnB. Live desk Tue–Fri 19:30–22:30. Opens their official YouTube when they're on.",
    watchUrl: "https://www.youtube.com/channel/UCQRp7g7irivIUb4HdiU1KiQ/live",
    embedUrl: "https://www.youtube.com/embed/live_stream?channel=UCQRp7g7irivIUb4HdiU1KiQ",
    credit: "Watch via Code Red Radio on YouTube",
  }),
  room({
    id: "feed-rinse",
    djId: "rinse-fm",
    title: "Rinse FM",
    venue: "Rinse",
    city: "London",
    citySlug: "london",
    artwork: "/art/stations/rinse-card.jpg",
    genres: ["Grime", "UK Garage"],
    engine: "grime",
    listeners: 6200,
    description: "London pirate bloodline. Official public stream — not the BBC.",
    streamUrl: "https://admin.stream.rinse.fm/proxy/rinse_uk/stream",
    watchUrl: "https://rinse.fm/",
    credit: "Stream via Rinse FM",
  }),
  room({
    id: "feed-flex",
    djId: "flex-fm",
    title: "Flex FM",
    venue: "Flex FM",
    city: "London",
    citySlug: "london",
    artwork: "/art/stations/flex-fm-card.jpg",
    genres: ["UK Garage", "Bassline"],
    engine: "ukg",
    listeners: 1100,
    description: "West London garage. Official public stream.",
    streamUrl: "https://a2.asurahosting.com:7400/radio.mp3",
    watchUrl: "https://flexfm.co.uk/",
    credit: "Stream via Flex FM",
  }),
];

export function worldDj(id: string) {
  return WORLD_DJS.find((d) => d.id === id);
}

export function worldLive(id: string) {
  return WORLD_LIVE.find((s) => s.id === id);
}
