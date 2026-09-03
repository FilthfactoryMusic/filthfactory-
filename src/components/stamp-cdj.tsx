const TICKS = Array.from({ length: 72 }, (_, i) => i);

const WAVE =
  "M0 16 L3 9 L6 24 L9 7 L12 20 L15 12 L18 26 L21 5 L24 18 L27 11 L30 28 L33 8 L36 16 L39 6 L42 23 L45 10 L48 27 L51 14 L54 19 L57 4 L60 22 L63 12 L66 25 L69 9 L72 17 L75 7 L78 24 L81 13 L84 20 L87 5 L90 26 L93 15 L96 18 L99 8 L102 23 L105 11 L108 28 L111 10 L114 16 L117 6 L120 21 L123 13 L126 25 L129 9 L132 19 L135 7 L138 24 L141 14 L144 20 L147 11 L150 16";

export function StampCdj() {
  return (
    <div className="stamp-cdj size-44 sm:size-52 md:size-64 lg:size-72" role="img" aria-label="Filthfactory">
      <img src="/art/brand/logo.png?v=exact" alt="" className="stamp-cdj-face" />
      <div className="stamp-cdj-deck" aria-hidden="true">
        <div className="stamp-cdj-ticks">
          {TICKS.map((i) => (
            <span key={i} style={{ transform: `rotate(${i * 5}deg)` }} />
          ))}
        </div>
        <div className="stamp-cdj-readout">
          <p className="stamp-cdj-cues">
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
          </p>
          <p className="stamp-cdj-remain">REMAIN</p>
          <p className="stamp-cdj-time">-3:42.1</p>
          <div className="stamp-cdj-wavewrap">
            <svg className="stamp-cdj-wave" viewBox="0 0 150 32" preserveAspectRatio="none">
              <path d={WAVE} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
            </svg>
            <span className="stamp-cdj-needle" />
          </div>
          <p className="stamp-cdj-bpm">
            132.00 <span>BPM</span>
          </p>
        </div>
      </div>
    </div>
  );
}
