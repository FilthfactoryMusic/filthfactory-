/** Upside-down graffiti drip EQ. Visual only — does not bounce to the mix. */
const DRIPS = [
  { x: 8, w: 7, h: 28, blob: 9 },
  { x: 22, w: 5, h: 46, blob: 8 },
  { x: 34, w: 8, h: 22, blob: 10 },
  { x: 50, w: 6, h: 58, blob: 9 },
  { x: 64, w: 5, h: 34, blob: 7 },
  { x: 76, w: 9, h: 18, blob: 11 },
  { x: 92, w: 6, h: 50, blob: 8 },
  { x: 106, w: 7, h: 26, blob: 9 },
  { x: 120, w: 5, h: 42, blob: 7 },
  { x: 132, w: 8, h: 16, blob: 10 },
  { x: 148, w: 6, h: 54, blob: 9 },
  { x: 162, w: 5, h: 30, blob: 7 },
  { x: 174, w: 9, h: 20, blob: 11 },
  { x: 190, w: 6, h: 44, blob: 8 },
  { x: 204, w: 7, h: 36, blob: 9 },
];

export function DripEq() {
  return (
    <div className="ff-drip-eq mt-3 w-full overflow-hidden rounded-sm bg-black px-2 pt-1 pb-2" aria-hidden>
      <svg viewBox="0 0 220 78" className="h-16 w-full sm:h-20" preserveAspectRatio="xMidYMin meet">
        <rect x="0" y="0" width="220" height="5" rx="1.5" fill="#c4453c" />
        <rect x="8" y="1" width="18" height="2" fill="#fff6f4" opacity="0.55" />
        <rect x="92" y="1" width="10" height="2" fill="#fff6f4" opacity="0.35" />
        {DRIPS.map((d, i) => (
          <g key={i} className="ff-drip" style={{ animationDelay: `${i * 0.17}s` }}>
            <path
              d={`M${d.x} 5 h${d.w} v${d.h} q0 ${d.blob} ${-d.w / 2} ${d.blob} q${-d.w / 2} 0 ${-d.w / 2} ${-d.blob} z`}
              fill="#c4453c"
            />
            <ellipse cx={d.x + d.w / 2} cy={5 + d.h + d.blob * 0.35} rx={d.w * 0.72} ry={d.blob * 0.55} fill="#c4453c" />
            {i % 3 === 0 ? (
              <>
                <rect x={d.x + d.w / 2 - 1} y={5 + d.h + d.blob * 0.15} width="2" height="3" fill="#fff6f4" />
                <rect x={d.x + 1} y={8} width="2" height="2" fill="#fff6f4" opacity="0.7" />
              </>
            ) : i % 3 === 1 ? (
              <rect x={d.x + d.w - 3} y={5 + d.h + 1} width="2" height="2" fill="#fff6f4" />
            ) : null}
          </g>
        ))}
      </svg>
    </div>
  );
}
