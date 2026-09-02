import { createFileRoute } from "@tanstack/react-router";

/** HTTPS bridge for stations that only publish HTTP Icecast. Allow-listed. */
const STREAMS: Record<string, string> = {
  respect: "http://icecast.pisd.co.uk:5030/brr_mp3",
};

export const Route = createFileRoute("/api/radio/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const src = STREAMS[params.id];
        if (!src) return new Response("Unknown station", { status: 404 });
        const up = await fetch(src, {
          headers: { "User-Agent": "FilthfactoryRadio/1.0", "Icy-MetaData": "1" },
        });
        if (!up.ok || !up.body) return new Response("Station offline", { status: 502 });
        return new Response(up.body, {
          headers: {
            "Content-Type": up.headers.get("content-type") || "audio/mpeg",
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});
