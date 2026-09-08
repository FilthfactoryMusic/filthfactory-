import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/drafts")({ component: DraftsPage });

const V = "d7";

const GROUPS: { title: string; items: { src: string; name: string }[] }[] = [
  {
    title: "UK spoofs — not on sale",
    items: [
      { src: `/art/merch/drafts/uk1-brokelads.jpg?v=${V}`, name: "B1 BROKELADS" },
      { src: `/art/merch/drafts/uk2-superdrugs.jpg?v=${V}`, name: "B2 SUPERDRUGS" },
      { src: `/art/merch/drafts/uk3-rizlate.jpg?v=${V}`, name: "B3 RIZLATE" },
      { src: `/art/merch/drafts/uk4-special-break.jpg?v=${V}`, name: "B4 SPECIAL BREAK" },
      { src: `/art/merch/drafts/uk5-greggs-afters.jpg?v=${V}`, name: "B5 GREGGS AFTERS" },
      { src: `/art/merch/drafts/uk6-umbroke.jpg?v=${V}`, name: "B6 UMBROKE" },
      { src: `/art/merch/drafts/uk7-playsedation.jpg?v=${V}`, name: "B7 PLAYSEDATION" },
      { src: `/art/merch/drafts/uk8-stoned-island.jpg?v=${V}`, name: "B8 STONED ISLAND" },
      { src: `/art/merch/drafts/uk9-carling-blackout.jpg?v=${V}`, name: "B9 CARLING BLACKOUT" },
      { src: `/art/merch/drafts/uk10-paddy-powder.jpg?v=${V}`, name: "B10 PADDY POWDER" },
      { src: `/art/merch/drafts/uk11-silk-cuts.jpg?v=${V}`, name: "B11 SILK CUTS" },
      { src: `/art/merch/drafts/uk12-spoons-6am.jpg?v=${V}`, name: "B12 WETHERSPOONS 6AM" },
      { src: `/art/merch/drafts/uk13-game-bong.jpg?v=${V}`, name: "B13 GAME BONG" },
      { src: `/art/merch/drafts/uk14-lambert-bass.jpg?v=${V}`, name: "B14 LAMBERT & BASS" },
      { src: `/art/merch/drafts/uk15-xbass.jpg?v=${V}`, name: "B15 X-BASS" },
      { src: `/art/merch/drafts/uk16-lost-dale.jpg?v=${V}`, name: "B16 LOST DALE" },
      { src: `/art/merch/drafts/uk17-crack-converter.jpg?v=${V}`, name: "B17 CRACK CONVERTER" },
      { src: `/art/merch/drafts/uk18-crack-converters.jpg?v=${V}`, name: "B18 CRACK CONVERTERS" },
      { src: `/art/merch/drafts/uk19-gurnoff.jpg?v=${V}`, name: "B19 GURNOFF" },
      { src: `/art/merch/drafts/uk20-gurnoff-red.jpg?v=${V}`, name: "B20 GURNOFF RED" },
    ],
  },
  {
    title: "Shirts — colourways (still drafts)",
    items: [
      { src: `/art/merch/drafts/tee-brokelads-black.jpg?v=${V}`, name: "Brokelads · black tee" },
      { src: `/art/merch/drafts/tee-brokelads-white.jpg?v=${V}`, name: "Brokelads · white tee" },
      { src: `/art/merch/drafts/tee-crack-black.jpg?v=${V}`, name: "Crack Converters · black tee" },
      { src: `/art/merch/drafts/tee-crack-olive.jpg?v=${V}`, name: "Crack Converters · olive tee" },
      { src: `/art/merch/drafts/tee-superdrugs-white.jpg?v=${V}`, name: "Superdrugs · white tee" },
      { src: `/art/merch/drafts/hoodie-superdrugs-white.jpg?v=${V}`, name: "Superdrugs · white hoodie" },
      { src: `/art/merch/drafts/tee-greggs-black.jpg?v=${V}`, name: "Greggs Afters · black tee" },
      { src: `/art/merch/drafts/tee-paddy-black.jpg?v=${V}`, name: "Paddy Powder · black tee" },
      { src: `/art/merch/drafts/tee-gurnoff-black.jpg?v=${V}`, name: "Gurnoff · black tee" },
      { src: `/art/merch/drafts/tee-gurnoff-olive.jpg?v=${V}`, name: "Gurnoff · olive tee" },
      { src: `/art/merch/drafts/tee-silk-black.jpg?v=${V}`, name: "Silk Cuts · black tee" },
      { src: `/art/merch/drafts/tee-silk-white.jpg?v=${V}`, name: "Silk Cuts · white tee" },
      { src: `/art/merch/drafts/tee-stoned-black.jpg?v=${V}`, name: "Stoned Island · black tee" },
      { src: `/art/merch/drafts/tee-stoned-white.jpg?v=${V}`, name: "Stoned Island · white tee" },
      { src: `/art/merch/drafts/tee-stoned-olive.jpg?v=${V}`, name: "Stoned Island · olive tee" },
      { src: `/art/merch/drafts/hoodie-stoned-black.jpg?v=${V}`, name: "Stoned Island · black hoodie" },
    ],
  },
  {
    title: "Jungle camo — staying",
    items: [
      { src: `/art/merch/drafts/13-woodland-hoodie.jpg?v=${V}`, name: "Woodland hoodie" },
      { src: `/art/merch/drafts/14-woodland-tee.jpg?v=${V}`, name: "Woodland tee" },
      { src: `/art/merch/drafts/15-tiger-hoodie.jpg?v=${V}`, name: "Tiger hoodie" },
    ],
  },
  {
    title: "Graffiti text",
    items: [
      { src: `/art/merch/drafts/00-graff-text-logo.jpg?v=${V}`, name: "FILTH / FACTORY lockup" },
      { src: `/art/merch/drafts/00b-graff-horizontal.jpg?v=${V}`, name: "Horizontal FILTHFACTORY" },
      { src: `/art/merch/drafts/11-olive-hoodie-graff.jpg?v=${V}`, name: "Olive hoodie graffiti" },
      { src: `/art/merch/drafts/12-white-hoodie-graff.jpg?v=${V}`, name: "White hoodie graffiti" },
    ],
  },
  {
    title: "Hats — keyring stamp",
    items: [
      { src: `/art/merch/drafts/09-beanie-keyring-stamp.jpg?v=${V}`, name: "Beanie" },
      { src: `/art/merch/drafts/10-cap-keyring-stamp.jpg?v=${V}`, name: "Cap" },
    ],
  },
];

function DraftsPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <p className="text-xs uppercase tracking-[0.25em] text-muted">Drafts · not on sale</p>
      <h1 className="mt-2 font-display text-4xl font-semibold uppercase tracking-wide">Design drafts</h1>
      <p className="mt-3 max-w-2xl font-display text-sm font-semibold uppercase tracking-wide text-muted">
        Look. Pick numbers. Nothing here is in the shop until you say so.
      </p>
      <p className="mt-4">
        <Link to="/shop" className="font-display text-sm font-semibold uppercase tracking-wide underline underline-offset-2">
          Back to shop
        </Link>
      </p>
      {GROUPS.map((g) => (
        <section key={g.title} className="mt-12">
          <h2 className="font-display text-2xl font-semibold uppercase tracking-wide">{g.title}</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {g.items.map((item) => (
              <article key={item.name} className="overflow-hidden rounded-lg border border-border bg-surface">
                <img src={item.src} alt={item.name} className="aspect-square w-full bg-white object-contain" />
                <p className="p-4 font-display text-sm font-semibold uppercase tracking-wide">{item.name}</p>
              </article>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
