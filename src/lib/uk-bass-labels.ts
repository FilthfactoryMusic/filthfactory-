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

export function labelMerchSlug(name: string) {
  if (name === "Hospital Records") return "hospital";
  if (name === "V Recordings") return "v-recordings";
  return slug(name);
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
  { name: "Anjunabeats", site: "https://anjunabeats.com/", genre: "Trance", deezer: "Anjunabeats", news: "Anjunabeats trance", needles: ["anjunabeats", "anjuna"] },
  { name: "Anjunadeep", site: "https://anjunadeep.com/", genre: "Trance", deezer: "Anjunadeep", news: "Anjunadeep", needles: ["anjunadeep"] },
  { name: "Armada Music", site: "https://www.armadamusic.com/", genre: "Trance", deezer: "Armada", news: '"Armada Music" trance', needles: ["armada"] },
  { name: "A State of Trance", site: "https://www.astateoftrance.com/", genre: "Trance", deezer: "A State of Trance", news: '"A State of Trance" OR ASOT', needles: ["a state of trance", "asot"] },
  { name: "Black Hole Recordings", site: "https://www.blackholerecordings.com/", genre: "Trance", deezer: "Black Hole Recordings", news: '"Black Hole Recordings"', needles: ["black hole recordings"] },
  { name: "FSOE", site: "https://www.fsorecords.com/", genre: "Trance", deezer: "FSOE", news: '"FSOE" OR "Future Sound of Egypt"', needles: ["fsoe", "future sound of egypt"] },
  { name: "Enhanced Music", site: "https://www.enhancedmusic.com/", genre: "Trance", deezer: "Enhanced Music", news: '"Enhanced Music"', needles: ["enhanced music"] },
  { name: "Vandit", site: "https://www.vandit.com/", genre: "Trance", deezer: "Vandit", news: '"Vandit" trance', needles: ["vandit"] },
  { name: "Pure Trance", site: "https://puretrancemusic.com/", genre: "Trance", deezer: "Pure Trance", news: '"Pure Trance" Solarstone', needles: ["pure trance"] },
  { name: "Subculture", site: "https://www.subculturemusic.com/", genre: "Trance", deezer: "Subculture", news: '"Subculture" OCallaghan OR trance', needles: ["subculture"] },
  { name: "Coldharbour", site: "https://coldharbourrecordings.com/", genre: "Trance", deezer: "Coldharbour", news: "Coldharbour Schulz", needles: ["coldharbour"] },
  { name: "Kearnage", site: bp("Kearnage Recordings"), genre: "Trance", deezer: "Kearnage", news: "Kearnage Kearney", needles: ["kearnage"] },
  { name: "Perfecto", site: "https://www.perfectorecords.com/", genre: "Trance", deezer: "Perfecto", news: '"Perfecto" Oakenfold', needles: ["perfecto"] },
  { name: "Captivating Sounds", site: bp("Captivating Sounds"), genre: "Trance", deezer: "Captivating Sounds" },
  { name: "Flashover Recordings", site: "https://www.flashoverrecordings.com/", genre: "Trance", deezer: "Flashover Recordings" },
  { name: "Who's Afraid of 138", site: bp("Who's Afraid of 138"), genre: "Trance", deezer: "Who's Afraid of 138", needles: ["who's afraid of 138", "wao138"] },
  { name: "Tidy Trax", site: "https://www.tidytrax.co.uk/", genre: "Hard House", deezer: "Tidy Trax", news: '"Tidy Trax" hard house', needles: ["tidy trax"] },
  { name: "Nukleuz", site: bp("Nukleuz"), genre: "Hard House", deezer: "Nukleuz", news: "Nukleuz hard house", needles: ["nukleuz"] },
  { name: "Tripoli Trax", site: bp("Tripoli Trax"), genre: "Hard House", deezer: "Tripoli Trax", news: '"Tripoli Trax"', needles: ["tripoli trax"] },
  { name: "Tortured Records", site: bp("Tortured Records hard house"), genre: "Hard House", deezer: "Tortured Records", needles: ["tortured records"] },
  { name: "Maximum Impact", site: bp("Maximum Impact hard house"), genre: "Hard House", deezer: "Maximum Impact" },
  { name: "Y3K", site: bp("Y3K Recordings"), genre: "Hard House", deezer: "Y3K" },
  { name: "Audio Rehab", site: bp("Audio Rehab"), genre: "Hard House", deezer: "Audio Rehab" },
  { name: "Hard House Nation", site: bp("Hard House Nation"), genre: "Hard House", deezer: "Hard House Nation", needles: ["hard house nation"] },
].map((l) => ({ ...l, logo: logoPath(l.name) }));

export const WOW_NEWS_LABELS = UK_BASS_LABELS.filter((l) => l.news).slice(0, 10);
