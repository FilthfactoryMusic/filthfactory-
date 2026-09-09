export const ICE: RTCConfiguration = {
  iceServers: [
    { urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302", "stun:stun.cloudflare.com:3478"] },
    {
      urls: [
        "turn:openrelay.metered.ca:80",
        "turn:openrelay.metered.ca:443",
        "turns:openrelay.metered.ca:443",
      ],
      username: "openrelayproject",
      credential: "openrelayproject",
    },
  ],
};

function isApple() {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (/Safari/.test(navigator.userAgent) && !/Chrome|Chromium|Edg/.test(navigator.userAgent));
}

/** Safari/iOS likes mp4. Chrome/Edge like webm. */
export function pickRecorderMime(stream: MediaStream) {
  const hasVideo = stream.getVideoTracks().some((t) => t.readyState === "live");
  const apple = isApple();
  const list = apple
    ? hasVideo
      ? ["video/mp4", "video/webm;codecs=vp8,opus", "audio/mp4", "audio/webm"]
      : ["audio/mp4", "audio/aac", "audio/webm;codecs=opus", "audio/webm"]
    : hasVideo
      ? ["video/webm;codecs=vp8,opus", "video/webm", "video/mp4", "audio/webm;codecs=opus"]
      : ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
  if (typeof MediaRecorder === "undefined") return "";
  return list.find((t) => MediaRecorder.isTypeSupported(t)) ?? "";
}

export function bufToB64(buf: ArrayBuffer) {
  const bytes = new Uint8Array(buf);
  const chunk = 0x8000;
  let bin = "";
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(bin);
}

export function b64ToBuf(b64: string) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out.buffer;
}
