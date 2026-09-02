const TICKS = Array.from({ length: 72 }, (_, i) => i);

export function StampCdj() {
  return (
    <div className="stamp-cdj size-32 sm:size-36 md:size-48 lg:size-56" role="img" aria-label="Filthfactory">
      <img src="/art/brand/logo.png?v=exact" alt="" className="stamp-cdj-face" />
      <div className="stamp-cdj-deck" aria-hidden="true">
        <div className="stamp-cdj-ticks">
          {TICKS.map((i) => (
            <span key={i} style={{ transform: `rotate(${i * 5}deg)` }} />
          ))}
        </div>
        <svg className="stamp-cdj-wave" viewBox="0 0 200 36" preserveAspectRatio="none">
          <path
            d="M0 18 L4 10 L8 26 L12 8 L16 22 L20 14 L24 28 L28 6 L32 20 L36 12 L40 30 L44 9 L48 18 L52 7 L56 25 L60 11 L64 29 L68 15 L72 21 L76 5 L80 24 L84 13 L88 27 L92 10 L96 19 L100 8 L104 26 L108 14 L112 22 L116 6 L120 28 L124 16 L128 20 L132 9 L136 25 L140 12 L144 30 L148 11 L152 18 L156 7 L160 23 L164 14 L168 27 L172 10 L176 21 L180 8 L184 26 L188 15 L192 22 L196 12 L200 18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinejoin="round"
          />
        </svg>
        <p className="stamp-cdj-time">03:42.18</p>
        <p className="stamp-cdj-bpm">
          132.0 <span>BPM</span>
        </p>
        <p className="stamp-cdj-cue">CUE</p>
      </div>
    </div>
  );
}
