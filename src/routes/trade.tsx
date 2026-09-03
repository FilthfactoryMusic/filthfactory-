import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { BrandedText } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FLOOR_ORGS } from "@/lib/floor";
import { listGigs, listReviews, postGig, postReview, type GigRow, type ReviewRow } from "@/lib/trade-api";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useMyBilling } from "@/lib/use-billing";

export const Route = createFileRoute("/trade")({
  component: TradePage,
  head: () => ({
    meta: [
      { title: "Trade floor — Filthfactory" },
      {
        name: "description",
        content: "Gigs, promoters, looking-for-a-DJ, and reviews. The ASDA aisle for UK bass desks.",
      },
    ],
  }),
});

function TradePage() {
  const { user } = useCurrentUserState();
  const billing = useMyBilling();
  const [gigs, setGigs] = useState<GigRow[]>([]);
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [err, setErr] = useState<string | null>(null);

  function refresh() {
    void listGigs().then(setGigs).catch(() => {});
    void listReviews().then(setReviews).catch(() => {});
  }

  useEffect(() => {
    refresh();
  }, []);

  async function onGig(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setErr(null);
    try {
      await postGig({
        data: {
          kind: String(f.get("kind") ?? "gig"),
          title: String(f.get("title") ?? ""),
          city: String(f.get("city") ?? "UK"),
          whenText: String(f.get("when") ?? ""),
          venue: String(f.get("venue") ?? ""),
          contact: String(f.get("contact") ?? ""),
          blurb: String(f.get("blurb") ?? ""),
          displayName: user?.displayName || user?.primaryEmail || "Resident",
        },
      });
      e.currentTarget.reset();
      refresh();
    } catch (error) {
      const msg = error instanceof Error ? error.message : "";
      setErr(msg.includes("MEMBERSHIP") ? "Resident membership to pin a gig." : "Couldn't pin that.");
    }
  }

  async function onReview(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setErr(null);
    try {
      await postReview({
        data: {
          subject: String(f.get("subject") ?? ""),
          rating: Number(f.get("rating") ?? 5),
          body: String(f.get("body") ?? ""),
          displayName: user?.displayName || user?.primaryEmail || "Listener",
        },
      });
      e.currentTarget.reset();
      refresh();
    } catch {
      setErr("Sign in to leave a review.");
    }
  }

  const nights = gigs.filter((g) => g.kind === "gig");
  const looking = gigs.filter((g) => g.kind === "looking");
  const promoters = gigs.filter((g) => g.kind === "promoter");

  return (
    <div className="enter-up">
      <h1 className="font-display text-4xl font-semibold uppercase tracking-wide">Trade floor</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        <BrandedText text="Gigs, promoters, looking for a DJ, reviews. One aisle for the UK bass desk — book, play, get paid, get rated." />
      </p>
      <p className="mt-2 text-sm text-muted">
        Pull a YouTube / Mixcloud / Twitch desk onto Filthfactory from{" "}
        <Link to="/booth" className="underline underline-offset-4">
          Go live
        </Link>
        . OBS virtual camera lives there too.
      </p>
      {err ? <p className="mt-3 text-sm text-live">{err}</p> : null}

      <h2 className="mt-10 font-display text-2xl font-semibold uppercase tracking-wide">Official desks</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {FLOOR_ORGS.map((o) => (
          <a
            key={o.site}
            href={o.site}
            target="_blank"
            rel="noreferrer"
            className="rounded-sm border border-border bg-surface p-4 hover:border-fg"
          >
            <p className="text-[10px] uppercase tracking-widest text-muted">{o.kind}</p>
            <p className="mt-1 font-display text-lg font-semibold uppercase tracking-wide">
              <BrandedText text={o.name} />
            </p>
            <p className="mt-1 text-xs text-muted">{o.blurb}</p>
          </a>
        ))}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <Board title="Nights" rows={nights} empty="No nights pinned yet." />
        <Board title="Looking for a DJ" rows={looking} empty="Nobody hunting a desk yet." />
        <Board title="Promoters" rows={promoters} empty="Pin your night. Residents only." />
      </div>

      {user && billing.member ? (
        <form onSubmit={(e) => void onGig(e)} className="mt-10 rounded-sm border border-border bg-surface p-5">
          <h2 className="font-display text-2xl font-semibold uppercase tracking-wide">Pin a listing</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-sm text-muted">
              Type
              <select name="kind" className="mt-1 h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-fg">
                <option value="gig">Night / gig</option>
                <option value="looking">Looking for a DJ</option>
                <option value="promoter">Promoter</option>
              </select>
            </label>
            <label className="text-sm text-muted">
              Title
              <Input name="title" className="mt-1" required placeholder="Saturday closedown" />
            </label>
            <label className="text-sm text-muted">
              City
              <Input name="city" className="mt-1" placeholder="London" />
            </label>
            <label className="text-sm text-muted">
              When
              <Input name="when" className="mt-1" placeholder="Sat 12 Sep, 10pm" />
            </label>
            <label className="text-sm text-muted">
              Venue
              <Input name="venue" className="mt-1" placeholder="The cellar" />
            </label>
            <label className="text-sm text-muted">
              Contact
              <Input name="contact" className="mt-1" placeholder="bookings@…" />
            </label>
            <label className="text-sm text-muted sm:col-span-2">
              Details
              <Input name="blurb" className="mt-1" placeholder="UKG / bassline. Two rooms." />
            </label>
          </div>
          <Button type="submit" variant="live" className="mt-4">
            Pin it
          </Button>
        </form>
      ) : (
        <p className="mt-8 text-sm text-muted">
          <Link to="/membership" className="underline underline-offset-4">
            Resident £5
          </Link>{" "}
          to pin a gig or hunt a DJ.
        </p>
      )}

      <h2 className="mt-12 font-display text-2xl font-semibold uppercase tracking-wide">Reviews</h2>
      <p className="mt-1 text-sm text-muted">Nights and desks you actually played or stood in. No fake names.</p>
      <ul className="mt-4 space-y-3">
        {reviews.length ? (
          reviews.map((r) => (
            <li key={r.id} className="rounded-sm border border-border bg-surface p-4">
              <p className="font-display text-lg font-semibold uppercase tracking-wide">{r.subject}</p>
              <p className="text-xs text-muted">
                {r.display_name} · {"★".repeat(r.rating)}
                {"☆".repeat(5 - r.rating)}
              </p>
              <p className="mt-2 text-sm">{r.body}</p>
            </li>
          ))
        ) : (
          <li className="text-sm text-muted">No reviews yet. First one sets the tone.</li>
        )}
      </ul>

      {user ? (
        <form onSubmit={(e) => void onReview(e)} className="mt-6 rounded-sm border border-border bg-surface p-5">
          <h3 className="font-display text-xl font-semibold uppercase tracking-wide">Leave a review</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
            <Input name="subject" required placeholder="Night or DJ name" />
            <select name="rating" className="h-11 rounded-md border border-border bg-surface px-3 text-sm text-fg">
              <option value="5">5</option>
              <option value="4">4</option>
              <option value="3">3</option>
              <option value="2">2</option>
              <option value="1">1</option>
            </select>
          </div>
          <Input name="body" className="mt-3" required placeholder="How was the room." />
          <Button type="submit" variant="outline" className="mt-4">
            Post review
          </Button>
        </form>
      ) : (
        <p className="mt-4 text-sm text-muted">
          <Link to="/login" className="underline underline-offset-4">
            Sign in
          </Link>{" "}
          to review a night.
        </p>
      )}
    </div>
  );
}

function Board({ title, rows, empty }: { title: string; rows: GigRow[]; empty: string }) {
  return (
    <section>
      <h2 className="font-display text-2xl font-semibold uppercase tracking-wide">{title}</h2>
      <ul className="mt-4 space-y-3">
        {rows.length ? (
          rows.map((g) => (
            <li key={g.id} className="rounded-sm border border-border bg-surface p-4">
              <p className="font-display text-lg font-semibold uppercase tracking-wide">{g.title}</p>
              <p className="text-xs text-muted">
                {g.city}
                {g.when_text ? ` · ${g.when_text}` : ""}
                {g.venue ? ` · ${g.venue}` : ""}
              </p>
              {g.blurb ? <p className="mt-2 text-sm text-muted">{g.blurb}</p> : null}
              <p className="mt-2 text-xs text-muted">
                {g.display_name}
                {g.contact ? ` · ${g.contact}` : ""}
              </p>
            </li>
          ))
        ) : (
          <li className="text-sm text-muted">{empty}</li>
        )}
      </ul>
    </section>
  );
}
