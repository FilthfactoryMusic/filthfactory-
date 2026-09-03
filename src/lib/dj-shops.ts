/** Real UK DJ desks. Product links go to their till — affiliate tags slot in later. */

export type DjShop = {
  id: string;
  name: string;
  city: string;
  site: string;
  controllers: string;
  blurb: string;
};

export type DjController = {
  id: string;
  name: string;
  brand: string;
  software: string;
  image: string;
  blurb: string;
  shopId: string;
  url: string;
};

/** Put partner codes here later, e.g. { bop: "?ref=filthfactory" }. Empty = clean URL. */
export const DJ_AFFILIATE: Record<string, string> = {};

export function shopHref(url: string, shopId: string) {
  const tag = DJ_AFFILIATE[shopId];
  if (!tag) return url;
  if (url.includes("?")) return `${url}&${tag.replace(/^\?/, "")}`;
  return `${url}${tag.startsWith("?") ? tag : `?${tag}`}`;
}

export const UK_DJ_SHOPS: DjShop[] = [
  {
    id: "bop",
    name: "Bop DJ",
    city: "Leeds · Manchester · Bristol",
    site: "https://www.bopdj.com/",
    controllers: "https://www.bopdj.com/catalogsearch/result/?q=DJ+controller",
    blurb: "UK DJ shop. 0% finance, part-ex, showrooms.",
  },
  {
    id: "thedjshop",
    name: "The DJ Shop",
    city: "UK",
    site: "https://www.thedjshop.co.uk/",
    controllers: "https://www.thedjshop.co.uk/dj-equipment/dj-controllers",
    blurb: "Long-running UK DJ equipment store. 0% finance.",
  },
  {
    id: "djsuperstore",
    name: "DJ Superstore",
    city: "UK",
    site: "https://www.djsuperstore.com/",
    controllers: "https://www.djsuperstore.com/dj-equipment/dj-controllers/",
    blurb: "Pioneer, AlphaTheta, Denon stock. Next-day UK.",
  },
  {
    id: "gak",
    name: "GAK",
    city: "Brighton",
    site: "https://www.gak.co.uk/",
    controllers: "https://www.gak.co.uk/dj",
    blurb: "Brighton desk. DJ, studio, live.",
  },
  {
    id: "pmt",
    name: "PMT",
    city: "UK stores",
    site: "https://www.pmtonline.co.uk/",
    controllers: "https://www.pmtonline.co.uk/dj",
    blurb: "High street music shops across the UK.",
  },
  {
    id: "absolute",
    name: "Absolute Music",
    city: "UK",
    site: "https://www.absolutemusic.co.uk/",
    controllers: "https://www.absolutemusic.co.uk/dj-equipment",
    blurb: "Controllers, monitors, production.",
  },
  {
    id: "rubadub",
    name: "Rubadub",
    city: "Glasgow",
    site: "https://rubadub.co.uk/",
    controllers: "https://rubadub.co.uk/collections/dj",
    blurb: "Independent. Records, studio, DJ gear.",
  },
];

export const FEATURED_CONTROLLERS: DjController[] = [
  {
    id: "flx4",
    name: "DDJ-FLX4",
    brand: "Pioneer DJ",
    software: "rekordbox · Serato",
    image: "/art/gear/flx4.jpg",
    blurb: "Two-channel starter. The one most bedrooms begin on.",
    shopId: "bop",
    url: "https://www.bopdj.com/pioneer-dj-ddj-flx4-2-channel-dj-controller.html",
  },
  {
    id: "flx10",
    name: "DDJ-FLX10",
    brand: "Pioneer DJ",
    software: "rekordbox · Serato",
    image: "/art/gear/flx10.jpg",
    blurb: "Four-channel. Stems, Mix Point Link, club layout.",
    shopId: "bop",
    url: "https://www.bopdj.com/pioneer-dj-ddj-flx10-4-channel-dj-controller.html",
  },
  {
    id: "xdj-az",
    name: "XDJ-AZ",
    brand: "AlphaTheta",
    software: "rekordbox · Serato · standalone",
    image: "/art/gear/xdj-az.jpg",
    blurb: "All-in-one. No laptop if you don't want one.",
    shopId: "bop",
    url: "https://www.bopdj.com/new-in/staff-picks/alphatheta-xdj-az-all-in-one-rekordbox-system.html",
  },
  {
    id: "sc-live-4",
    name: "SC LIVE 4",
    brand: "Denon DJ",
    software: "Engine DJ",
    image: "/art/gear/sc-live-4.jpg",
    blurb: "Standalone four-channel. Speakers in the deck.",
    shopId: "bop",
    url: "https://www.bopdj.com/denon-dj-sc-live-4-white.html",
  },
];

export function shopById(id: string) {
  return UK_DJ_SHOPS.find((s) => s.id === id);
}
