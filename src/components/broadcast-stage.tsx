import { useEffect, useRef, useState } from "react";
import { LiveDot } from "@/components/live-dot";
import { useHostBroadcast } from "@/hooks/use-host-broadcast";
import { useWatchBroadcast, type WatchStatus } from "@/hooks/use-watch-broadcast";
import { getBoothStream, subscribeBoothStream } from "@/lib/booth-stream";

function statusCopy(s: WatchStatus) {
  if (s === "connecting") return "Connecting to the booth…";
  if (s === "audio") return "Audio live — video still linking";
  if (s === "blocked") return "Tap to listen";
  if (s === "ended") return "This broadcast ended";
  if (s === "full") return "Booth is full — try again in a minute";
  return null;
}

export function BroadcastStage({
  liveId,
  isHost,
  hasCamera,
  artwork,
  title,
  enabled,
  onNeedGesture,
}: {
  liveId: string;
  isHost: boolean;
  hasCamera: boolean;
  artwork: string;
  title: string;
  enabled: boolean;
  onNeedGesture?: () => void;
}) {
  if (isHost) return <HostStage liveId={liveId} artwork={artwork} />;
  return (
    <ViewerStage
      liveId={liveId}
      hasCamera={hasCamera}
      artwork={artwork}
      title={title}
      enabled={enabled}
      onNeedGesture={onNeedGesture}
    />
  );
}

function HostStage({ liveId, artwork }: { liveId: string; artwork: string }) {
  const { viewers } = useHostBroadcast(liveId);
  const ref = useRef<HTMLVideoElement>(null);
  const [hasStream, setHasStream] = useState(Boolean(getBoothStream()));

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const apply = (s: MediaStream | null) => {
      setHasStream(Boolean(s));
      el.srcObject = s;
      if (s) void el.play().catch(() => {});
    };
    apply(getBoothStream());
    return subscribeBoothStream(apply);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-sm bg-surface">
      <video
        ref={ref}
        data-host-cam
        autoPlay
        muted
        playsInline
        className="aspect-video w-full object-cover"
        style={{ transform: "scaleX(-1)" }}
      />
      {!hasStream ? (
        <img src={artwork} alt="" className="absolute inset-0 size-full object-cover" />
      ) : null}
      <div className="absolute left-3 top-3">
        <LiveDot />
      </div>
      <p className="absolute bottom-3 left-3 rounded-sm bg-bg/80 px-2 py-1 text-xs uppercase tracking-widest">
        On air · {viewers} listening
      </p>
    </div>
  );
}

function ViewerStage({
  liveId,
  hasCamera,
  artwork,
  title,
  enabled,
  onNeedGesture,
}: {
  liveId: string;
  hasCamera: boolean;
  artwork: string;
  title: string;
  enabled: boolean;
  onNeedGesture?: () => void;
}) {
  const { status, remote, videoRef, audioRef } = useWatchBroadcast(liveId, enabled);
  const copy = !enabled ? "Tap to listen" : statusCopy(status);
  const showVideo = Boolean(remote?.getVideoTracks().length);

  return (
    <div className="relative overflow-hidden rounded-sm bg-surface">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className={`aspect-video w-full object-cover ${showVideo ? "" : "hidden"}`}
      />
      {!showVideo ? (
        <img src={artwork} alt="" className="aspect-video w-full object-cover" />
      ) : null}
      <audio ref={audioRef} autoPlay playsInline />
      <div className="absolute left-3 top-3">
        <LiveDot />
      </div>
      {copy ? (
        <button
          type="button"
          onClick={onNeedGesture}
          className="absolute inset-0 grid place-items-center bg-bg/50"
        >
          <span className="rounded-sm bg-live px-5 py-3 text-sm font-medium text-live-fg">
            {status === "blocked" || !enabled ? "Tap to listen" : copy}
          </span>
        </button>
      ) : null}
      {!hasCamera && status === "live" ? (
        <p className="absolute bottom-3 left-3 text-xs uppercase tracking-widest text-fg">
          {title} · audio
        </p>
      ) : null}
    </div>
  );
}
