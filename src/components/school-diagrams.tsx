import type { ReactNode } from "react";

type Diagram = "board" | "cue" | "gain" | "eq" | "pitch" | "phrase" | "cues" | "loop" | "filter" | "fx" | "stems" | "faders" | "crate" | "desks";

function Tag({ n, x, y }: { n: number; x: number; y: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r="9" fill="#e11d2e" />
      <text x={x} y={y + 3.5} textAnchor="middle" fontSize="10" fontWeight="700" fill="#fff">
        {n}
      </text>
    </g>
  );
}

function Frame({ title, children }: { title: string; children: ReactNode }) {
  return (
    <svg viewBox="0 0 360 220" className="w-full bg-black text-white" role="img" aria-label={title}>
      <rect width="360" height="220" fill="#0b0b0b" />
      <rect x="8" y="8" width="344" height="204" fill="none" stroke="#2a2a2a" />
      <text x="18" y="26" fill="#9a9a96" fontSize="10" letterSpacing="2">
        {title.toUpperCase()}
      </text>
      {children}
    </svg>
  );
}

function Channel({ x, label }: { x: number; label: string }) {
  return (
    <g>
      <rect x={x} y="40" width="70" height="150" fill="#141414" stroke="#3a3a3a" />
      <text x={x + 35} y="56" textAnchor="middle" fill="#e8e8e4" fontSize="11">
        {label}
      </text>
      <circle cx={x + 35} cy="74" r="10" fill="none" stroke="#888" />
      <rect x={x + 22} y="94" width="26" height="8" fill="#2a2a2a" stroke="#666" />
      <rect x={x + 22} y="108" width="26" height="8" fill="#2a2a2a" stroke="#666" />
      <rect x={x + 22} y="122" width="26" height="8" fill="#2a2a2a" stroke="#666" />
      <rect x={x + 28} y="140" width="14" height="12" fill="#222" stroke="#e11d2e" />
      <rect x={x + 30} y="160" width="10" height="22" fill="#1a1a1a" stroke="#888" />
    </g>
  );
}

export function SchoolDiagram({ kind }: { kind: Diagram }) {
  if (kind === "board") {
    return (
      <Frame title="Mixer">
        <Channel x={40} label="A" />
        <Channel x={250} label="B" />
        <rect x="130" y="70" width="100" height="90" fill="#121212" stroke="#3a3a3a" />
        <rect x="145" y="150" width="70" height="8" fill="#1a1a1a" stroke="#888" />
        <Tag n={1} x={75} y={48} />
        <Tag n={2} x={285} y={48} />
        <Tag n={3} x={180} y={100} />
        <Tag n={4} x={180} y={170} />
        <text x="180" y="205" textAnchor="middle" fill="#9a9a96" fontSize="9">
          CROSSFADER
        </text>
      </Frame>
    );
  }
  if (kind === "cue") {
    return (
      <Frame title="Headphones">
        <ellipse cx="90" cy="120" rx="28" ry="36" fill="none" stroke="#888" />
        <ellipse cx="150" cy="120" rx="28" ry="36" fill="none" stroke="#888" />
        <path d="M90 84 C90 60 150 60 150 84" fill="none" stroke="#888" />
        <text x="90" y="124" textAnchor="middle" fill="#e8e8e4" fontSize="9">
          CUE
        </text>
        <text x="150" y="124" textAnchor="middle" fill="#e8e8e4" fontSize="9">
          MASTER
        </text>
        <rect x="230" y="80" width="90" height="70" fill="#141414" stroke="#3a3a3a" />
        <rect x="248" y="108" width="54" height="8" fill="#2a2a2a" stroke="#888" />
        <Tag n={1} x={120} y={50} />
        <Tag n={2} x={275} y={70} />
        <text x="275" y="168" textAnchor="middle" fill="#9a9a96" fontSize="9">
          CUE MIX
        </text>
      </Frame>
    );
  }
  if (kind === "gain" || kind === "eq") {
    return (
      <Frame title={kind === "gain" ? "Gain" : "EQ"}>
        <Channel x={145} label="CH" />
        <Tag n={1} x={180} y={74} />
        <text x="250" y="78" fill="#9a9a96" fontSize="9">
          GAIN
        </text>
        <Tag n={2} x={180} y={112} />
        <text x="250" y="116" fill="#9a9a96" fontSize="9">
          HI / MID / LOW
        </text>
        <Tag n={3} x={180} y={170} />
        <text x="250" y="174" fill="#9a9a96" fontSize="9">
          FADER
        </text>
      </Frame>
    );
  }
  if (kind === "pitch") {
    return (
      <Frame title="Deck">
        <circle cx="130" cy="120" r="58" fill="#111" stroke="#888" />
        <circle cx="130" cy="120" r="10" fill="#222" stroke="#666" />
        <rect x="220" y="70" width="18" height="100" fill="#141414" stroke="#888" />
        <rect x="222" y="110" width="14" height="8" fill="#e11d2e" />
        <Tag n={1} x={248} y={75} />
        <text x="270" y="80" fill="#9a9a96" fontSize="9">
          PITCH
        </text>
        <Tag n={2} x={130} y={50} />
        <text x="130" y="200" textAnchor="middle" fill="#9a9a96" fontSize="9">
          NUDGE THE PLATTER
        </text>
      </Frame>
    );
  }
  if (kind === "phrase") {
    const cells = Array.from({ length: 32 }, (_, i) => i);
    return (
      <Frame title="32 bars">
        {cells.map((i) => (
          <rect
            key={i}
            x={20 + (i % 16) * 20}
            y={70 + Math.floor(i / 16) * 50}
            width="18"
            height="36"
            fill={i % 8 === 0 ? "#e11d2e" : "#1a1a1a"}
            stroke="#333"
          />
        ))}
        <Tag n={1} x={29} y={62} />
        <text x="180" y="200" textAnchor="middle" fill="#9a9a96" fontSize="9">
          RED = PHRASE START
        </text>
      </Frame>
    );
  }
  if (kind === "cues") {
    return (
      <Frame title="Hot cues">
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <rect x={40 + i * 80} y="90" width="56" height="44" fill="#1a1a1a" stroke="#e11d2e" />
            <text x={68 + i * 80} y="116" textAnchor="middle" fill="#e8e8e4" fontSize="12">
              {i + 1}
            </text>
          </g>
        ))}
        <text x="68" y="160" textAnchor="middle" fill="#9a9a96" fontSize="9">
          IN
        </text>
        <text x="148" y="160" textAnchor="middle" fill="#9a9a96" fontSize="9">
          VOCAL
        </text>
        <text x="228" y="160" textAnchor="middle" fill="#9a9a96" fontSize="9">
          DROP
        </text>
        <text x="308" y="160" textAnchor="middle" fill="#9a9a96" fontSize="9">
          OUT
        </text>
      </Frame>
    );
  }
  if (kind === "loop") {
    return (
      <Frame title="Loop">
        <circle cx="180" cy="120" r="50" fill="none" stroke="#e11d2e" strokeWidth="3" strokeDasharray="8 6" />
        <text x="180" y="124" textAnchor="middle" fill="#e8e8e4" fontSize="14">
          8 BAR
        </text>
        <Tag n={1} x={180} y={58} />
        <text x="180" y="200" textAnchor="middle" fill="#9a9a96" fontSize="9">
          EXIT ON THE 1
        </text>
      </Frame>
    );
  }
  if (kind === "filter") {
    return (
      <Frame title="Filter">
        <circle cx="180" cy="120" r="34" fill="#141414" stroke="#888" />
        <line x1="180" y1="120" x2="180" y2="90" stroke="#e11d2e" strokeWidth="3" />
        <text x="90" y="124" fill="#9a9a96" fontSize="9">
          LOW-PASS
        </text>
        <text x="230" y="124" fill="#9a9a96" fontSize="9">
          HIGH-PASS
        </text>
        <Tag n={1} x={180} y={70} />
      </Frame>
    );
  }
  if (kind === "fx") {
    return (
      <Frame title="FX">
        <rect x="50" y="70" width="260" height="90" fill="#141414" stroke="#3a3a3a" />
        <text x="180" y="100" textAnchor="middle" fill="#e8e8e4" fontSize="12">
          ECHO 1/4
        </text>
        <rect x="90" y="118" width="180" height="10" fill="#1a1a1a" stroke="#888" />
        <rect x="90" y="118" width="70" height="10" fill="#e11d2e" />
        <Tag n={1} x={70} y={70} />
        <text x="180" y="190" textAnchor="middle" fill="#9a9a96" fontSize="9">
          WET THEN OFF
        </text>
      </Frame>
    );
  }
  if (kind === "stems") {
    const labs = ["DRUMS", "BASS", "VOCAL", "MUSIC"];
    return (
      <Frame title="Stems">
        {labs.map((l, i) => (
          <g key={l}>
            <rect x={24 + i * 84} y="90" width="72" height="50" fill="#141414" stroke={i === 2 ? "#e11d2e" : "#3a3a3a"} />
            <text x={60 + i * 84} y="120" textAnchor="middle" fill="#e8e8e4" fontSize="10">
              {l}
            </text>
          </g>
        ))}
        <text x="180" y="170" textAnchor="middle" fill="#9a9a96" fontSize="9">
          MUTE THE CLASH
        </text>
      </Frame>
    );
  }
  if (kind === "faders") {
    return (
      <Frame title="Faders">
        <rect x="80" y="60" width="16" height="100" fill="#141414" stroke="#888" />
        <rect x="160" y="60" width="16" height="100" fill="#141414" stroke="#888" />
        <rect x="90" y="175" width="160" height="10" fill="#141414" stroke="#888" />
        <Tag n={1} x={88} y={50} />
        <Tag n={2} x={168} y={50} />
        <Tag n={3} x={170} y={190} />
        <text x="88" y="210" textAnchor="middle" fill="#9a9a96" fontSize="9">
          A
        </text>
        <text x="168" y="210" textAnchor="middle" fill="#9a9a96" fontSize="9">
          B
        </text>
        <text x="260" y="184" fill="#9a9a96" fontSize="9">
          CROSS
        </text>
      </Frame>
    );
  }
  if (kind === "crate") {
    return (
      <Frame title="Crate">
        {["BPM", "KEY", "ENERGY", "DROP"].map((l, i) => (
          <g key={l}>
            <rect x="40" y={58 + i * 36} width="280" height="28" fill="#141414" stroke="#3a3a3a" />
            <text x="54" y={77 + i * 36} fill="#e8e8e4" fontSize="12">
              {i + 1}. {l}
            </text>
          </g>
        ))}
      </Frame>
    );
  }
  return (
    <Frame title="Three desks">
      {["rekordbox", "Serato", "Engine"].map((l, i) => (
        <g key={l}>
          <rect x={20 + i * 114} y="80" width="100" height="80" fill="#141414" stroke="#3a3a3a" />
          <text x={70 + i * 114} y="126" textAnchor="middle" fill="#e8e8e4" fontSize="11">
            {l}
          </text>
        </g>
      ))}
      <text x="180" y="190" textAnchor="middle" fill="#9a9a96" fontSize="9">
        SAME JOB · DIFFERENT STICKER
      </text>
    </Frame>
  );
}
