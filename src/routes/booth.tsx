import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Camera, CameraOff, Mic, MicOff, Radio, Upload } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { CITIES, GENRES } from "@/lib/catalog";
import { dropBoothMix, listMyMixes, startBoothLive, stopBoothLive } from "@/lib/live-api";
import { getBoothStream, setBoothStream, stopBoothStream } from "@/lib/booth-stream";
import { useLibrary } from "@/lib/library-store";
import { usePlayer } from "@/lib/player-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LiveDot } from "@/components/live-dot";
import { useCurrentUser, useCurrentUserState } from "@/lib/auth/use-current-user";
import { formatGbp } from "@/lib/utils";
import { useMyBilling } from "@/lib/use-billing";

export const Route = createFileRoute("/booth")({ component: BoothPage });

function BoothPage() {
  const { user } = useCurrentUserState();
  if (!user) return <BoothGate />;
  return <BoothMemberGate />;
}

function BoothMemberGate() {
  const billing = useMyBilling();
  if (billing.loading) return <div className="h-64 animate-pulse rounded-sm bg-surface" />;
  if (!billing.member) {
    return (
      <div className="mx-auto max-w-md py-8 text-center">
        <h1 className="font-display text-3xl font-semibold uppercase tracking-wide">Membership required</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Resident is {formatGbp(500)} a calendar month. Go live and drop mixes. Featured is{" "}
          {formatGbp(1500)} and advertises your stream on Discover. Gifts are not on sale yet.
        </p>
        <Link
          to="/membership"
          className="mt-6 inline-flex h-11 items-center rounded-sm bg-accent px-5 text-sm font-medium text-accent-fg"
        >
          View membership
        </Link>
      </div>
    );
  }
  return <BoothStudio featured={billing.plan === "featured"} />;
}

function BoothGate() {
  return (
    <div className="mx-auto max-w-sm py-6 text-center">
      <img src="/art/brand/logo.png" alt="" className="mx-auto size-28" />
      <h1 className="mt-6 font-display text-3xl font-semibold uppercase tracking-wide">Go live in one tap</h1>
      <p className="mt-2 text-sm text-muted">
        Sign in with email, camera on, you're on air. Mixcloud ease — factory floor energy.
      </p>
      <Link
        to="/login"
        search={{ redirect: "/booth" }}
        className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-sm bg-accent text-sm font-semibold text-accent-fg"
      >
        Sign in to go live
      </Link>
    </div>
  );
}

function BoothStudio({ featured }: { featured: boolean }) {
  const user = useCurrentUser();
  const addUpload = useLibrary((s) => s.addUpload);
  const setUploads = useLibrary((s) => s.setUploads);
  const startLiveLocal = useLibrary((s) => s.startLive);
  const stopLiveLocal = useLibrary((s) => s.stopLive);
  const ownLive = useLibrary((s) => s.ownLive);
  const setName = useLibrary((s) => s.setName);
  const playLive = usePlayer((s) => s.playLive);
  const stop = usePlayer((s) => s.stop);
  const now = usePlayer((s) => s.now);
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [camOn, setCamOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [going, setGoing] = useState(false);
  const [title, setTitle] = useState("");
  const [previewOn, setPreviewOn] = useState(false);
  const [liveRights, setLiveRights] = useState(false);
  const [dropRights, setDropRights] = useState(false);

  const displayName = user?.displayName || "Resident";
  const photo = user?.profileImageUrl ?? null;

  useEffect(() => {
    setName(displayName);
  }, [displayName, setName]);

  useEffect(() => {
    void listMyMixes()
      .then(setUploads)
      .catch(() => {});
  }, [setUploads]);

  useEffect(() => {
    let cancelled = false;
    async function open() {
      stopBoothStream();
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: camOn ? { facingMode: "user", width: { ideal: 1280 } } : false,
          audio: micOn,
        });
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        setBoothStream(s);
        setPreviewOn(true);
        setMediaError(null);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          await videoRef.current.play().catch(() => {});
        }
      } catch {
        if (!cancelled) setMediaError("Camera or mic blocked — you can still go live audio-only.");
      }
    }
    void open();
    return () => {
      cancelled = true;
    };
  }, [camOn, micOn]);

  useEffect(() => {
    return () => {
      if (!useLibrary.getState().ownLive) stopBoothStream();
    };
  }, []);

  useEffect(() => {
    const existing = getBoothStream();
    if (existing && videoRef.current) {
      videoRef.current.srcObject = existing;
      void videoRef.current.play().catch(() => {});
    }
  }, []);

  async function onLive(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (going) return;
    if (!liveRights) return;
    setGoing(true);
    try {
      const fd = new FormData(e.currentTarget);
      const genre = String(fd.get("lgenre") ?? "UK Garage");
      const show = await startBoothLive({
        data: {
          title: title.trim() || `${displayName} live`,
          genre,
          hasCamera: camOn && !mediaError,
          displayName,
          photo,
          rightsConfirmed: liveRights,
        },
      });
      startLiveLocal(show);
      playLive(show.id);
      void navigate({ to: "/live/$id", params: { id: show.id } });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("MEMBERSHIP")) {
        void navigate({ to: "/membership" });
        return;
      }
    } finally {
      setGoing(false);
    }
  }

  async function endLive() {
    if (now?.kind === "live" && now.id === ownLive?.id) stop();
    stopLiveLocal();
    stopBoothStream();
    try {
      await stopBoothLive();
    } catch {
      /* still end locally */
    }
  }

  async function onDrop(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const mixTitle = String(fd.get("title") ?? "").trim();
    const genre = String(fd.get("genre") ?? "UK Garage");
    const citySlug = String(fd.get("city") ?? "london");
    const description = String(fd.get("description") ?? "").trim();
    if (!mixTitle) return;
    if (!dropRights) return;
    const city = CITIES.find((c) => c.slug === citySlug) ?? { slug: "london", name: "London" };
    try {
      const mix = await dropBoothMix({
        data: {
          title: mixTitle,
          genre,
          city: city.name,
          citySlug: city.slug,
          description,
          displayName,
          rightsConfirmed: dropRights,
        },
      });
      addUpload(mix);
      void navigate({ to: "/mix/$id", params: { id: mix.id } });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("MEMBERSHIP")) void navigate({ to: "/membership" });
    }
  }

  return (
    <div>
      <h1 className="font-display text-4xl font-semibold uppercase tracking-wide">The booth</h1>
      <p className="mt-1 max-w-xl text-sm text-muted">
        {featured
          ? "Featured: this broadcast will be advertised on Discover. Listeners hear your mic — keep the tab open."
          : "Resident booth. Listeners hear your mic. Upgrade to Featured to advertise on the main feed."}
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div>
          <div className="relative overflow-hidden rounded-sm bg-bg aspect-video">
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className="size-full object-cover"
              style={{ transform: "scaleX(-1)" }}
            />
            {!previewOn ? (
              <div className="absolute inset-0 grid place-items-center">
                <img src="/art/brand/logo.png" alt="" className="size-28 opacity-80" />
              </div>
            ) : null}
            {ownLive ? (
              <div className="absolute left-3 top-3">
                <LiveDot />
              </div>
            ) : null}
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-bg to-transparent p-3">
              <div className="flex gap-1">
                <button
                  type="button"
                  aria-label={camOn ? "Camera off" : "Camera on"}
                  onClick={() => setCamOn((v) => !v)}
                  className="flex size-11 items-center justify-center rounded-full bg-raised/90"
                >
                  {camOn ? <Camera className="size-4" /> : <CameraOff className="size-4 text-muted" />}
                </button>
                <button
                  type="button"
                  aria-label={micOn ? "Mic off" : "Mic on"}
                  onClick={() => setMicOn((v) => !v)}
                  className="flex size-11 items-center justify-center rounded-full bg-raised/90"
                >
                  {micOn ? <Mic className="size-4" /> : <MicOff className="size-4 text-muted" />}
                </button>
              </div>
              <p className="text-xs text-muted">{displayName}</p>
            </div>
          </div>
          {mediaError ? <p className="mt-2 text-xs text-muted">{mediaError}</p> : null}
        </div>

        <form onSubmit={onLive} className="rounded-sm border border-border bg-surface p-5">
          <div className="flex items-center gap-2">
            <Radio className="size-4 shrink-0 text-live" />
            <h2 className="font-display text-2xl font-semibold uppercase tracking-wide whitespace-nowrap">Go live</h2>
          </div>
          <p className="mt-1 text-sm text-muted">Title it. One tap. You're on air.</p>
          {ownLive ? (
            <div className="mt-4">
              <p className="text-sm font-medium">On air: {ownLive.title}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button type="button" variant="live" asChild>
                  <Link to="/live/$id" params={{ id: ownLive.id }}>
                    Open live room
                  </Link>
                </Button>
                <Button type="button" variant="outline" onClick={() => void endLive()}>
                  End broadcast
                </Button>
              </div>
            </div>
          ) : (
            <>
              <label className="mt-4 block text-sm text-muted">
                Show title
                <Input
                  name="ltitle"
                  className="mt-1"
                  placeholder="Sunday closedown"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </label>
              <label className="mt-3 block text-sm text-muted">
                Genre
                <select
                  name="lgenre"
                  className="mt-1 h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-fg"
                >
                  {GENRES.map((g) => (
                    <option key={g}>{g}</option>
                  ))}
                </select>
              </label>
              <label className="mt-4 flex gap-3 text-sm leading-relaxed text-muted">
                <input
                  type="checkbox"
                  className="mt-1 size-4 shrink-0 accent-accent"
                  checked={liveRights}
                  onChange={(e) => setLiveRights(e.target.checked)}
                />
                <span>
                  I have the rights to this broadcast. Filthfactory does not hold a blanket PRS or PPL licence.
                </span>
              </label>
              <Button type="submit" variant="live" className="mt-5 w-full" disabled={going}>
                {going ? "Going live…" : "Go live"}
              </Button>
            </>
          )}
        </form>
      </div>

      <form onSubmit={(e) => void onDrop(e)} className="mt-8 rounded-sm border border-border bg-surface p-5">
        <div className="flex items-center gap-2">
          <Upload className="size-4 shrink-0" />
          <h2 className="font-display text-2xl font-semibold uppercase tracking-wide">Drop a mix</h2>
        </div>
        <p className="mt-1 text-sm text-muted">Lands in Your drops, tied to this account.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block text-sm text-muted sm:col-span-2">
            Title
            <Input name="title" className="mt-1" required placeholder="Peckham Steppers 085" />
          </label>
          <label className="block text-sm text-muted">
            Genre
            <select
              name="genre"
              className="mt-1 h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-fg"
            >
              {GENRES.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm text-muted">
            City
            <select
              name="city"
              className="mt-1 h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-fg"
            >
              {CITIES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm text-muted sm:col-span-2">
            Notes
            <Input name="description" className="mt-1" placeholder="Recorded at the factory, Sunday" />
          </label>
        </div>
        <label className="mt-4 flex gap-3 text-sm leading-relaxed text-muted">
          <input
            type="checkbox"
            className="mt-1 size-4 shrink-0 accent-accent"
            checked={dropRights}
            onChange={(e) => setDropRights(e.target.checked)}
          />
          <span>I own or have a licence for this mix and grant Filthfactory the right to host and stream it.</span>
        </label>
        <Button type="submit" className="mt-5">
          Drop mix
        </Button>
      </form>
    </div>
  );
}
