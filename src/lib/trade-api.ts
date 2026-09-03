import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";

export type GigRow = {
  id: string;
  user_id: string;
  display_name: string;
  kind: string;
  title: string;
  city: string;
  when_text: string;
  venue: string;
  contact: string;
  blurb: string;
  created_at: string;
};

export type ReviewRow = {
  id: string;
  user_id: string;
  display_name: string;
  subject: string;
  rating: number;
  body: string;
  created_at: string;
};

export const listGigs = createServerFn({ method: "GET" }).handler(async () => {
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  return sql<GigRow>`
    select id, user_id, display_name, kind, title, city, when_text, venue, contact, blurb, created_at
    from gigs
    order by created_at desc
    limit 60
  `;
});

export const postGig = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (d: {
      kind: string;
      title: string;
      city: string;
      whenText: string;
      venue: string;
      contact: string;
      blurb: string;
      displayName: string;
    }) => d,
  )
  .handler(async ({ context, data }) => {
    const kind = ["gig", "looking", "promoter"].includes(data.kind) ? data.kind : "gig";
    const title = data.title.trim();
    if (!title) throw new Error("Title required");
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const sub = (
      await sql<{ status: string }>`select status from subscriptions where user_id = ${context.userId}`
    )[0];
    if (!sub || sub.status !== "active") throw new Error("MEMBERSHIP_REQUIRED");
    const id = `gig-${context.userId.slice(0, 8)}-${Date.now().toString(36)}`;
    await sql`
      insert into gigs (id, user_id, display_name, kind, title, city, when_text, venue, contact, blurb)
      values (
        ${id}, ${context.userId}, ${data.displayName.trim() || "Resident"}, ${kind}, ${title},
        ${data.city.trim() || "UK"}, ${data.whenText.trim()}, ${data.venue.trim()},
        ${data.contact.trim()}, ${data.blurb.trim()}
      )
    `;
    return { id };
  });

export const listReviews = createServerFn({ method: "GET" }).handler(async () => {
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  return sql<ReviewRow>`
    select id, user_id, display_name, subject, rating, body, created_at
    from reviews
    order by created_at desc
    limit 40
  `;
});

export const postReview = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { subject: string; rating: number; body: string; displayName: string }) => d)
  .handler(async ({ context, data }) => {
    const subject = data.subject.trim();
    const body = data.body.trim();
    if (!subject || !body) throw new Error("Write the review");
    const rating = Math.min(5, Math.max(1, Math.round(data.rating) || 5));
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const id = `rev-${context.userId.slice(0, 8)}-${Date.now().toString(36)}`;
    await sql`
      insert into reviews (id, user_id, display_name, subject, rating, body)
      values (${id}, ${context.userId}, ${data.displayName.trim() || "Listener"}, ${subject}, ${rating}, ${body})
    `;
    return { id };
  });
