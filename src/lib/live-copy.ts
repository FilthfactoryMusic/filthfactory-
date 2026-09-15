/** User-facing live booth copy. Honesty until soak PASS; open join after LiveKit works. */

export const LIVE_COMING_SOON = "Coming soon";

export const LIVE_OPEN_JOIN =
  "Anyone who joins this session gets the audio and video. Not a private mates-only room.";

export const LIVE_COMING_SOON_BODY =
  "The live booth is coming soon. We will not call it live — or sell it as live — until it is proven.";

export const LIVE_MESH_BODY =
  "This public site still uses the old booth link. Open-join live — everyone who joins hears and sees you — is coming soon.";

export const LIVE_JOIN_CTA = "Tap to join";
export const LIVE_JOINING = "Joining the session…";
export const LIVE_GO_LIVE = "Go live";

export function liveHeroLine(openJoin: boolean) {
  return openJoin
    ? "The download shops packed up. The crate didn't. Garage, grime, bassline, 140, DnB, tech house. Tap a room. Anyone who joins a live session gets the audio and video."
    : "The download shops packed up. The crate didn't. Garage, grime, bassline, 140, DnB, tech house. Tap a room. The live booth is coming soon.";
}

export function liveMetaDescription(openJoin: boolean) {
  return openJoin
    ? "UK garage, grime, bassline, 140, DnB, tech house. Live rooms — join and you get the audio and video. Free to listen. 18+."
    : "UK garage, grime, bassline, 140, DnB, tech house. Free to listen. Live booth coming soon. 18+.";
}

export function boothGateLine(openJoin: boolean) {
  return openJoin
    ? "Sign in with email, camera on, then go live. Anyone who joins the session gets the audio and video."
    : "Sign in with email. The live booth is coming soon — we will not put you on air until it is proven.";
}

export function boothFormLine(openJoin: boolean, mesh: boolean) {
  if (openJoin) return "Title it. One tap. Anyone who joins gets the audio and video.";
  if (mesh) return LIVE_MESH_BODY;
  return LIVE_COMING_SOON_BODY;
}

export function boothHonesty(openJoin: boolean) {
  const rights =
    "You broadcast on your own rights. Filthfactory does not hold a blanket PRS or PPL licence. Not legal advice.";
  return openJoin ? `${LIVE_OPEN_JOIN} ${rights}` : `${LIVE_COMING_SOON_BODY} ${rights}`;
}

export function payHonesty(openJoin: boolean) {
  return openJoin
    ? "Membership is the booth. Listening stays free. Checkout is Stripe when it is on — never a fake till. Not legal advice."
    : "Membership is mix drops and the booth when live is proven. Listening stays free. We will not sell live until it works. Checkout is Stripe when it is on — never a fake till. Not legal advice.";
}
