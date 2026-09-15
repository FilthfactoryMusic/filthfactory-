/** 16-bit mono WAV so Xbox / Edge can play a complete file, not a WebM cluster. */
export function floatToWav(pcm: Float32Array, sampleRate: number): ArrayBuffer {
  const bytes = pcm.length * 2;
  const buf = new ArrayBuffer(44 + bytes);
  const v = new DataView(buf);
  write(v, 0, "RIFF");
  v.setUint32(4, 36 + bytes, true);
  write(v, 8, "WAVE");
  write(v, 12, "fmt ");
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, 1, true);
  v.setUint32(24, sampleRate, true);
  v.setUint32(28, sampleRate * 2, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  write(v, 36, "data");
  v.setUint32(40, bytes, true);
  let o = 44;
  for (let i = 0; i < pcm.length; i++) {
    const s = Math.max(-1, Math.min(1, pcm[i] ?? 0));
    v.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    o += 2;
  }
  return buf;
}

function write(v: DataView, offset: number, text: string) {
  for (let i = 0; i < text.length; i++) v.setUint8(offset + i, text.charCodeAt(i));
}

export function downsample(input: Float32Array, fromRate: number, toRate: number) {
  if (toRate >= fromRate) return input;
  const ratio = fromRate / toRate;
  const out = new Float32Array(Math.floor(input.length / ratio));
  for (let i = 0; i < out.length; i++) {
    const x = i * ratio;
    const i0 = Math.floor(x);
    const i1 = Math.min(i0 + 1, input.length - 1);
    const f = x - i0;
    out[i] = (input[i0] ?? 0) * (1 - f) + (input[i1] ?? 0) * f;
  }
  return out;
}
