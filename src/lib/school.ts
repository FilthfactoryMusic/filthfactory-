export type SchoolLesson = {
  id: string;
  n: number;
  title: string;
  blurb: string;
  diagram: "board" | "cue" | "gain" | "eq" | "pitch" | "phrase" | "cues" | "loop" | "filter" | "fx" | "stems" | "faders" | "crate" | "desks";
  steps: string[];
};

export const SCHOOL_CREDIT = {
  name: "DJ Carlo Atendido",
  url: "https://www.youtube.com/@djcarlo",
};

/** Original Filthfactory control-school copy. Topics overlap common beginner-to-pro desks. Wording is ours. */
export const SCHOOL: SchoolLesson[] = [
  {
    id: "board",
    n: 1,
    title: "The board",
    blurb: "Two decks. Mixer in the middle. Everything else is extra.",
    diagram: "board",
    steps: [
      "Left deck is A. Right deck is B. The mixer sits between them.",
      "Each channel has gain at the top, EQ in the middle, a cue button, then the fader.",
      "The long bar at the bottom is the crossfader. Leave it centred until you actually need it.",
      "If you can point to those four things with your eyes shut, you can mix.",
    ],
  },
  {
    id: "cue",
    n: 2,
    title: "Cans first",
    blurb: "The room hears the master. You hear the next record in the headphones.",
    diagram: "cue",
    steps: [
      "Put the cans on. Split-cue if you’ve got it — one ear master, one ear the next tune.",
      "Hit CUE on the channel you are about to bring in. You should hear that deck only in the cans.",
      "Do not raise that channel fader until the phrase in the cans lines up with the phrase in the room.",
      "If you can’t hear the next kick clearly, turn headphone mix toward CUE, not the master.",
    ],
  },
  {
    id: "gain",
    n: 3,
    title: "Gain before EQ",
    blurb: "Gain sets how loud the record is. EQ shapes it. Don’t mix those jobs.",
    diagram: "gain",
    steps: [
      "Play the loudest part of the track (usually the drop) with EQ at noon.",
      "Turn GAIN until the channel meter kisses yellow, not red.",
      "Match the other deck the same way. Two records should look the same on the meters before you blend them.",
      "If a mix is thin, reach for gain last — check you didn’t scoop the bass on both channels.",
    ],
  },
  {
    id: "eq",
    n: 4,
    title: "EQ is a knife",
    blurb: "Two kicks in the same room fight. One of them has to sit down.",
    diagram: "eq",
    steps: [
      "LOW is the kick and sub. MID is the vocal and stab. HIGH is hats and air.",
      "When both decks are playing, drop the LOW on the incoming channel until the swap.",
      "Bring the new LOW up as you take the old LOW out. That’s the swap — not a volume fade.",
      "Don’t cut mids on a vocal track unless you want the MC to disappear. Cut what clashes, leave what talks.",
    ],
  },
  {
    id: "pitch",
    n: 5,
    title: "Match the pulse",
    blurb: "Tempo first. Nudge second. Fingers last.",
    diagram: "pitch",
    steps: [
      "Read the BPM. Put both decks in the same number with the pitch fader (or sync once, then learn without it).",
      "In the cans, the two kicks should land together. If the new one runs ahead, slow the pitch a hair.",
      "Nudge the platter — push to catch up, drag to hold back. Tiny moves.",
      "Once they lock, stop touching the platter. Let the pitch fader do the holding.",
    ],
  },
  {
    id: "phrase",
    n: 6,
    title: "Count the phrase",
    blurb: "Tunes breathe in 8s, 16s and 32s. Mix on the breath, not in the middle of a sentence.",
    diagram: "phrase",
    steps: [
      "Most UK garage, bassline and DnB phrasing is 8 or 16 bars. Count kicks: 1-2-3-4 is a bar.",
      "Start the new tune on a phrase start — intro, breakdown, or the first bar of a drop.",
      "Do not dump a drop on top of someone else’s drop unless you mean it.",
      "If you lose the count, wait. A late mix that lands is cleaner than an early one that crashes.",
    ],
  },
  {
    id: "cues",
    n: 7,
    title: "Hot cues are bookmarks",
    blurb: "Mark the intro, the vocal, the drop, the outro. Then stop hunting.",
    diagram: "cues",
    steps: [
      "Pad 1: start of the mix-in (usually bars of drums).",
      "Pad 2: first vocal or hook.",
      "Pad 3: the drop.",
      "Pad 4: mix-out / last 16. Recue from 1 when you want a clean run-in.",
    ],
  },
  {
    id: "loop",
    n: 8,
    title: "Loop to hold the room",
    blurb: "A 4 or 8-bar loop buys you time. It is not a trick. It is a pause button with groove.",
    diagram: "loop",
    steps: [
      "Hit LOOP on a drum phrase, not a vocal syllable.",
      "4 bars to catch a thought. 8 bars to stretch an intro while you find the next tune.",
      "Halve the loop only if the kick still makes sense. A 1-bar vocal loop turns into a stutter fast.",
      "Exit the loop on a phrase start so the track continues like you never paused it.",
    ],
  },
  {
    id: "filter",
    n: 9,
    title: "Filter to leave",
    blurb: "A high-pass takes the weight out without killing the hats. Use it to walk away.",
    diagram: "filter",
    steps: [
      "Sweep the filter on the outgoing channel as you bring the new LOW in.",
      "High-pass = bass leaves. Low-pass = top leaves. Most mix-outs want high-pass.",
      "Don’t park a filter half-open all night. Open it back up or kill the channel.",
      "EQ still does the kick swap. Filter is the coat you put on as you walk out.",
    ],
  },
  {
    id: "fx",
    n: 10,
    title: "Echo out, then shut up",
    blurb: "One echo on the last vocal. Then hands off.",
    diagram: "fx",
    steps: [
      "Send or dry/wet on the outgoing channel, echo or delay, 1/4 or 1/2 beat.",
      "Hit it on the last word or last snare, then pull the fader.",
      "Kill the effect as soon as the new tune is in. Wet tails on two records is mud.",
      "If you need a third FX in one mix, you don’t. Save it.",
    ],
  },
  {
    id: "stems",
    n: 11,
    title: "Stems, one layer",
    blurb: "Drums, bass, vocal, music. Mute one. Don’t solo everything at once.",
    diagram: "stems",
    steps: [
      "Use stems to lift a vocal over a bed, or to drop drums out of the outgoing tune.",
      "If the stem sounds crunchy, you pushed the isolation too far — back it off.",
      "Never leave two vocals fighting. Mute one stem or don’t mix those two records.",
      "Stems are a tool. If the blend works with EQ alone, leave the stems alone.",
    ],
  },
  {
    id: "faders",
    n: 12,
    title: "Faders vs the bar",
    blurb: "Club mixes live on channel faders. The crossfader is a cut, not a blend.",
    diagram: "faders",
    steps: [
      "Keep the crossfader in the middle. Ride A and B with the two channel faders.",
      "Scratch, battle, quick cuts — that’s when the crossfader earns its keep.",
      "Hamster / reverse is for cuts. Don’t reverse it ‘for fun’ mid-set.",
      "If a mix is messy, your hands are probably on the wrong fader.",
    ],
  },
  {
    id: "crate",
    n: 13,
    title: "Build the crate first",
    blurb: "The set is won in the library, not on the night.",
    diagram: "crate",
    steps: [
      "BPM and key on every file. Energy mark: warm-up, peak, reset.",
      "Folder by job, not by vibe word. ‘Garage 130 mix-in’ beats ‘tunes I like’.",
      "Waveform preview the drop so you know if it slams or teases.",
      "Take 20 records you can mix, not 400 you might. Dead weight slows the hunt.",
    ],
  },
  {
    id: "desks",
    n: 14,
    title: "Same hands, three desks",
    blurb: "rekordbox, Serato, Engine — the labels move. The job doesn’t.",
    diagram: "desks",
    steps: [
      "Cue / headphones: CUE button on the channel, then headphone mix.",
      "Loop: LOOP / AUTO LOOP. Hot cues: the pads under the jog, 1–8.",
      "Stems: pad mode or a STEMS panel. Filter: channel knob or FX slot one.",
      "Learn one desk properly. The others are the same map with different stickers.",
    ],
  },
];
