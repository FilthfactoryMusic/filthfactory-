/** Real UK bass desks currently putting records out. Sites are official where they resolve; Beatport search otherwise. */

export type BassLabel = {
  name: string;
  site: string;
  logo: string;
  genre: string;
  deezer: string;
  news?: string;
  needles?: string[];
};

function slug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function logoPath(name: string) {
  if (name === "Hospital Records") return "/art/labels/hospital.png";
  if (name === "V Recordings") return "/art/labels/v-recordings.png";
  return `/art/labels/${slug(name)}.png`;
}

function bp(q: string) {
  return `https://www.beatport.com/search?q=${encodeURIComponent(q)}`;
}

export const UK_BASS_LABELS: BassLabel[] = [
  { name: "Hospital Records", site: "https://www.hospitalrecords.com/", genre: "Drum & Bass", deezer: "Hospital Records", news: '"Hospital Records" drum OR bass', needles: ["hospital records"] },
  { name: "V Recordings", site: "https://www.vrecordings.com/", genre: "Drum & Bass", deezer: "V Recordings", news: '"V Recordings" drum AND bass', needles: ["v recordings"] },
  { name: "Born on Road", site: "https://bornonroad.com/", genre: "Jungle", deezer: "Born on Road", news: '"Born on Road" jungle', needles: ["born on road"] },
  { name: "Crucast", site: "https://www.crucast.com/", genre: "UK Bass", deezer: "Crucast", news: "Crucast bass", needles: ["crucast"] },
  { name: "Playaz", site: "https://playaz.co.uk/", genre: "Drum & Bass", deezer: "Playaz", news: '"Playaz" drum and bass', needles: ["playaz"] },
  { name: "Low Down Deep", site: "https://lowdowndeep.com/", genre: "Drum & Bass", deezer: "Low Down Deep", news: '"Low Down Deep" drum', needles: ["low down deep"] },
  { name: "High Focus", site: "https://highfocus.co.uk/", genre: "UK rap", deezer: "High Focus", news: '"High Focus" rap OR grime', needles: ["high focus"] },
  { name: "3000 Bass", site: "https://3000bass.com/", genre: "Bassline", deezer: "3000 Bass", news: '"3000 Bass" OR "Bass 3000"', needles: ["3000 bass", "bass 3000"] },
  { name: "Foor", site: "https://www.foor.org/", genre: "UK Garage", deezer: "Foor", news: '"Foor" garage OR "we are foor"', needles: ["foor"] },
  { name: "Garage Shared", site: "https://www.garageshared.com/", genre: "UK Garage", deezer: "Garage Shared", news: '"Garage Shared"', needles: ["garage shared"] },
  { name: "Southpoint", site: bp("Southpoint UK garage"), genre: "UK Garage", deezer: "Southpoint" },
  { name: "Deeprot", site: bp("Deeprot"), genre: "Bassline", deezer: "Deeprot" },
  { name: "Skank and Bass", site: "https://skankandbass.com/", genre: "UK Garage", deezer: "Skankandbass" },
  { name: "Critical Music", site: "https://criticalmusic.com/", genre: "Drum & Bass", deezer: "Critical Music", news: '"Critical Music" Kasra', needles: ["critical music"] },
  { name: "RAM Records", site: "https://www.ramrecords.com/", genre: "Drum & Bass", deezer: "RAM Records", news: '"RAM Records" Andy C', needles: ["ram records"] },
  { name: "Shogun Audio", site: "https://www.shogunaudio.co.uk/", genre: "Drum & Bass", deezer: "Shogun Audio" },
  { name: "Metalheadz", site: "https://metalheadz.co.uk/", genre: "Drum & Bass", deezer: "Metalheadz" },
  { name: "Technique Recordings", site: bp("Technique Recordings"), genre: "Drum & Bass", deezer: "Technique Recordings" },
  { name: "Spearhead Records", site: "https://www.spearheadrecords.com/", genre: "Drum & Bass", deezer: "Spearhead Records" },
  { name: "Soulvent Records", site: "https://www.soulventrecords.com/", genre: "Drum & Bass", deezer: "Soulvent" },
  { name: "The North Quarter", site: "https://thenorthquarter.co.uk/", genre: "Drum & Bass", deezer: "The North Quarter" },
  { name: "1985 Music", site: "https://1985music.com/", genre: "Drum & Bass", deezer: "1985 Music" },
  { name: "Dispatch Recordings", site: bp("Dispatch Recordings"), genre: "Drum & Bass", deezer: "Dispatch Recordings" },
  { name: "Flexout Audio", site: "https://www.flexoutaudio.com/", genre: "Drum & Bass", deezer: "Flexout Audio" },
  { name: "Viper Recordings", site: "https://viperrecordings.co.uk/", genre: "Drum & Bass", deezer: "Viper Recordings" },
  { name: "CIA Records", site: "https://www.cia-records.com/", genre: "Drum & Bass", deezer: "C.I.A." },
  { name: "Exit Records", site: bp("Exit Records dBridge"), genre: "Drum & Bass", deezer: "Exit Records" },
  { name: "Deep Medi", site: "https://deepmedi.com/", genre: "Dubstep", deezer: "Deep Medi" },
  { name: "Tempa", site: bp("Tempa Records"), genre: "Dubstep", deezer: "Tempa" },
  { name: "Butterz", site: "https://www.butterz.co.uk/", genre: "Grime", deezer: "Butterz" },
  { name: "Hyperdub", site: "https://hyperdub.net/", genre: "Bass", deezer: "Hyperdub" },
  { name: "Night Slugs", site: "https://nightslugs.net/", genre: "Bass", deezer: "Night Slugs" },
  { name: "Tectonic", site: "https://www.tectonicrecordings.com/", genre: "Bass", deezer: "Tectonic" },
  { name: "Hessle Audio", site: bp("Hessle Audio"), genre: "Bass", deezer: "Hessle Audio" },
  { name: "Keysound", site: bp("Keysound Recordings"), genre: "Grime", deezer: "Keysound" },
  { name: "White Peach", site: "https://www.whitepeachrecords.com/", genre: "Grime", deezer: "White Peach" },
  { name: "Nervous Horizon", site: bp("Nervous Horizon"), genre: "Bass", deezer: "Nervous Horizon" },
  { name: "Local Action", site: "https://localactionrecords.co.uk/", genre: "Grime", deezer: "Local Action" },
  { name: "Rinse", site: "https://www.rinse.fm/", genre: "UK Bass", deezer: "Rinse" },
  { name: "Med School", site: "https://www.hospitalrecords.com/", genre: "Drum & Bass", deezer: "Med School" },
  { name: "Liquid V", site: "https://www.vrecordings.com/", genre: "Drum & Bass", deezer: "Liquid V" },
  { name: "Ingredients", site: bp("Ingredients Records"), genre: "Drum & Bass", deezer: "Ingredients" },
  { name: "Deep Dark & Dangerous", site: "https://deepdarkanddangerous.com/", genre: "Dubstep", deezer: "Deep Dark & Dangerous" },
  { name: "Timedance", site: bp("Timedance"), genre: "Bass", deezer: "Timedance" },
  { name: "Livity Sound", site: bp("Livity Sound"), genre: "Bass", deezer: "Livity Sound" },
  { name: "Astrophonica", site: bp("Astrophonica"), genre: "Bass", deezer: "Astrophonica" },
  { name: "Formation Records", site: bp("Formation Records"), genre: "Drum & Bass", deezer: "Formation Records" },
  { name: "Infrared", site: bp("Infrared Recordings"), genre: "Drum & Bass", deezer: "Infrared" },
  { name: "Sentry", site: bp("Sentry Recordings"), genre: "Drum & Bass", deezer: "Sentry" },
  { name: "DSCI4", site: bp("DSCI4"), genre: "Drum & Bass", deezer: "DSCI4" },
].map((l) => ({ ...l, logo: logoPath(l.name) }));

export const WOW_NEWS_LABELS = UK_BASS_LABELS.filter((l) => l.news).slice(0, 10);
