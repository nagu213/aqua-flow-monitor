import { useEffect, useId, useState } from "react";
import type { TankShape } from "./tankShapes";

interface TankPreviewProps {
  shape: TankShape;
  level: number;
  pumpOn: boolean;
  withSump: boolean;
  sumpLevel?: number;
  className?: string;
}

/**
 * Premium SVG renderer — same visual language as the reference screenshot:
 * shaded steel tank, level rule on side, top inlet pipe, side outlet w/ valve,
 * floats inside, AQUA-PUMP unit on stand, and underground sump with hatch.
 * Shape changes the silhouette; everything else stays consistent.
 */
export function TankPreview({
  shape,
  level,
  pumpOn,
  withSump,
  sumpLevel = 70,
  className,
}: TankPreviewProps) {
  const [t, setT] = useState(0);
  const uid = useId().replace(/:/g, "");

  useEffect(() => {
    let raf: number;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      setT((o) => o + dt * 0.003);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const VBW = 560;
  const VBH = withSump ? 880 : 640;

  const box = getTankBox(shape);
  const waterMaxH = box.h - 12;
  const waterH = waterMaxH * (level / 100);
  const waterY = box.y + box.h - 6 - waterH;

  // sump
  const sumpX = 70;
  const sumpY = 690;
  const sumpW = 420;
  const sumpH = 150;
  const sumpPad = 8;
  const sumpWaterMaxH = sumpH - sumpPad * 2;
  const sumpWaterH = sumpWaterMaxH * (sumpLevel / 100);
  const sumpWaterY = sumpY + sumpH - sumpPad - sumpWaterH;

  const buildWave = (
    offset: number, amp: number, freq: number,
    baseY: number, x0: number, x1: number, bottomY: number,
  ) => {
    const pts: string[] = [];
    const segs = 48;
    for (let i = 0; i <= segs; i++) {
      const x = x0 + (i / segs) * (x1 - x0);
      const y =
        baseY +
        Math.sin((i / segs) * Math.PI * freq + offset) * amp +
        Math.cos((i / segs) * Math.PI * (freq * 1.7) + offset * 1.3) * (amp * 0.45);
      pts.push(`${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`);
    }
    pts.push(`L ${x1} ${bottomY} L ${x0} ${bottomY} Z`);
    return pts.join(" ");
  };

  const ids = {
    tankClip: `tc-${uid}`,
    sumpClip: `sc-${uid}`,
    waterDeep: `wd-${uid}`,
    waterSurf: `ws-${uid}`,
    steel: `st-${uid}`,
    rim: `rm-${uid}`,
    glass: `gl-${uid}`,
    chrome: `ch-${uid}`,
    pumpBody: `pb-${uid}`,
    soil: `so-${uid}`,
    grass: `gr-${uid}`,
    concrete: `co-${uid}`,
    cap: `cp-${uid}`,
    led: `ld-${uid}`,
  };

  const tankCenterX = box.x + box.w / 2;
  const groundY = 670;

  return (
    <svg viewBox={`0 0 ${VBW} ${VBH}`} className={className ?? "w-full drop-shadow-2xl"}>
      <defs>
        {/* Water */}
        <linearGradient id={ids.waterDeep} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7fd4f0" />
          <stop offset="35%" stopColor="#2c92c4" />
          <stop offset="100%" stopColor="#0a2f48" />
        </linearGradient>
        <linearGradient id={ids.waterSurf} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e6f6ff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#7fd4f0" stopOpacity="0" />
        </linearGradient>
        {/* Steel shell */}
        <linearGradient id={ids.steel} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0c1922" />
          <stop offset="20%" stopColor="#1a2e3c" />
          <stop offset="50%" stopColor="#2a4458" />
          <stop offset="80%" stopColor="#13242f" />
          <stop offset="100%" stopColor="#06121a" />
        </linearGradient>
        <linearGradient id={ids.glass} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.28" />
          <stop offset="20%" stopColor="#fff" stopOpacity="0.05" />
          <stop offset="55%" stopColor="#fff" stopOpacity="0" />
          <stop offset="85%" stopColor="#fff" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0.32" />
        </linearGradient>
        <linearGradient id={ids.rim} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a5266" />
          <stop offset="100%" stopColor="#0a141c" />
        </linearGradient>
        {/* Chrome pipes */}
        <linearGradient id={ids.chrome} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#3a4651" />
          <stop offset="35%" stopColor="#cdd6df" />
          <stop offset="55%" stopColor="#f4f7fa" />
          <stop offset="75%" stopColor="#7e8b96" />
          <stop offset="100%" stopColor="#222a32" />
        </linearGradient>
        {/* Pump body */}
        <linearGradient id={ids.pumpBody} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3aa9d6" />
          <stop offset="100%" stopColor="#13567a" />
        </linearGradient>
        <radialGradient id={ids.led} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#a4ffb0" />
          <stop offset="60%" stopColor="#22cc55" />
          <stop offset="100%" stopColor="#003a14" />
        </radialGradient>
        {/* Ground */}
        <linearGradient id={ids.soil} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5d3f24" />
          <stop offset="100%" stopColor="#1f1409" />
        </linearGradient>
        <linearGradient id={ids.grass} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5fa84a" />
          <stop offset="100%" stopColor="#2f5a20" />
        </linearGradient>
        <linearGradient id={ids.concrete} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2c2c2c" />
          <stop offset="50%" stopColor="#7d7d7d" />
          <stop offset="100%" stopColor="#1d1d1d" />
        </linearGradient>
        <linearGradient id={ids.cap} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a4250" />
          <stop offset="100%" stopColor="#080c12" />
        </linearGradient>

        <clipPath id={ids.tankClip}>
          <ShapePath shape={shape} inset={6} />
        </clipPath>
        <clipPath id={ids.sumpClip}>
          <rect x={sumpX + sumpPad} y={sumpY + sumpPad}
            width={sumpW - sumpPad * 2} height={sumpH - sumpPad * 2} rx="5" />
        </clipPath>
      </defs>

      {/* Background haze under tank */}
      <ellipse cx={tankCenterX} cy={groundY - 2} rx={box.w * 0.6} ry={10} fill="#000" opacity="0.35" />

      {/* Stand legs (only if tank not sitting on ground) */}
      <Stand shape={shape} groundY={groundY} chromeId={ids.chrome} />

      {/* === TANK SHELL === */}
      <ShapePath shape={shape} fill={`url(#${ids.steel})`} stroke="#03080c" strokeWidth={2.5} />

      {/* Water inside (clipped to silhouette) */}
      <g clipPath={`url(#${ids.tankClip})`}>
        <path d={buildWave(t, 5, 3, waterY, box.x, box.x + box.w, box.y + box.h)} fill={`url(#${ids.waterDeep})`} />
        <path d={buildWave(t, 5, 3, waterY, box.x, box.x + box.w, box.y + box.h)} fill={`url(#${ids.waterSurf})`} style={{ mixBlendMode: "screen" }} />
        <path d={buildWave(t * 1.4 + 2, 3, 5, waterY + 4, box.x, box.x + box.w, box.y + box.h)} fill="#a8e4f6" opacity="0.25" />
        <ellipse cx={box.x + box.w * 0.32} cy={waterY + 2} rx={box.w * 0.22} ry="2.5" fill="#fff" opacity="0.55" />

        {/* Float sensors on a string from the top */}
        <FloatSensor x={box.x + box.w * 0.32} topY={box.y + 6} waterY={waterY} highY={box.y + box.h * 0.18} active={level > 88} label="HI" />
        <FloatSensor x={box.x + box.w * 0.68} topY={box.y + 6} waterY={waterY} highY={box.y + box.h * 0.78} active={level < 18} label="LO" />

        {/* bubbles when pumping */}
        {pumpOn && level > 8 && [0, 1, 2, 3].map((i) => (
          <circle key={i} cx={box.x + box.w * (0.2 + i * 0.2)} r={2 + (i % 2)} fill="#fff" opacity="0.7">
            <animate attributeName="cy" from={box.y + box.h - 12} to={waterY + 6} dur={`${2 + i * 0.3}s`} begin={`${i * 0.4}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;0.8;0.8;0" dur={`${2 + i * 0.3}s`} begin={`${i * 0.4}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </g>

      {/* Glass highlight + outline overlays */}
      <g pointerEvents="none">
        <ShapePath shape={shape} fill={`url(#${ids.glass})`} />
        <ShapePath shape={shape} fill="none" stroke="#1a2530" strokeWidth={3} />
        <ShapePath shape={shape} fill="none" stroke="#fff" strokeOpacity="0.07" strokeWidth={1} inset={4} />
      </g>

      {/* Top rim plate with bolts */}
      <TopRim box={box} rimId={ids.rim} />

      {/* === Side measurement rule (left) === */}
      <LevelRule x={box.x - 22} y={box.y} h={box.h} />

      {/* === Top inlet pipe & elbow === */}
      <g>
        <rect x={tankCenterX - 9} y={box.y - 60} width="18" height="60" fill={`url(#${ids.chrome})`} stroke="#0a131a" strokeWidth="1" />
        <rect x={tankCenterX - 80} y={box.y - 70} width="80" height="20" fill={`url(#${ids.chrome})`} stroke="#0a131a" strokeWidth="1" />
        <circle cx={tankCenterX - 80} cy={box.y - 60} r="14" fill={`url(#${ids.chrome})`} stroke="#0a131a" strokeWidth="1.2" />
        {pumpOn && (!withSump || sumpLevel > 5) && (
          <line x1={tankCenterX} y1={box.y - 30} x2={tankCenterX} y2={box.y + 4} stroke="#7fd4f0" strokeWidth="9" strokeDasharray="10 8" opacity="0.85">
            <animate attributeName="stroke-dashoffset" from="0" to="-18" dur="0.5s" repeatCount="indefinite" />
          </line>
        )}
      </g>

      {/* === Side outlet pipe + red valve === */}
      <g>
        <rect x={box.x + box.w - 4} y={box.y + box.h * 0.55} width="60" height="14" fill={`url(#${ids.chrome})`} stroke="#0a131a" strokeWidth="1" />
        <rect x={box.x + box.w + 56} y={box.y + box.h * 0.55} width="14" height={groundY - (box.y + box.h * 0.55)} fill={`url(#${ids.chrome})`} stroke="#0a131a" strokeWidth="1" />
        <circle cx={box.x + box.w + 50} cy={box.y + box.h * 0.55 + 7} r="11" fill="#c93030" stroke="#3a0606" strokeWidth="1.5" />
        <rect x={box.x + box.w + 49} y={box.y + box.h * 0.55 - 5} width="2" height="6" fill="#3a0606" />
      </g>

      {/* === Digital display === */}
      <g>
        <rect x={VBW / 2 - 50} y={6} width="100" height="38" rx="6" fill="#0a0e14" stroke="#2c333d" strokeWidth="2" />
        <rect x={VBW / 2 - 47} y={9} width="94" height="32" rx="4" fill="#001a0d" />
        <text x={VBW / 2} y={32} fontSize="20" fontWeight="bold" textAnchor="middle"
          fill="#22ff88" fontFamily="'Courier New', monospace"
          style={{ filter: "drop-shadow(0 0 4px #22ff88)" }}>
          {level.toFixed(1)}%
        </text>
      </g>

      {/* === Ground === */}
      {withSump ? (
        <>
          <rect x="0" y={groundY} width={VBW} height={VBH - groundY} fill={`url(#${ids.soil})`} />
          <rect x="0" y={groundY - 6} width={VBW} height="8" fill={`url(#${ids.grass})`} />
          <line x1="0" y1={groundY} x2={VBW} y2={groundY} stroke="#0a0a0a" strokeWidth="1.5" />

          {/* Concrete shoulder */}
          <rect x={sumpX - 12} y={sumpY - 12} width={sumpW + 24} height={sumpH + 24} rx="8"
            fill={`url(#${ids.concrete})`} stroke="#0a0e14" strokeWidth="2" />

          {/* Sump cavity */}
          <rect x={sumpX} y={sumpY} width={sumpW} height={sumpH} rx="6" fill="#08161f" stroke="#03080c" strokeWidth="1.5" />

          {/* Water inside sump */}
          <g clipPath={`url(#${ids.sumpClip})`}>
            <path d={buildWave(t * 0.8, 3.5, 4, sumpWaterY, sumpX + sumpPad, sumpX + sumpW - sumpPad, sumpY + sumpH - sumpPad)} fill={`url(#${ids.waterDeep})`} />
            <path d={buildWave(t * 0.8, 3.5, 4, sumpWaterY, sumpX + sumpPad, sumpX + sumpW - sumpPad, sumpY + sumpH - sumpPad)} fill={`url(#${ids.waterSurf})`} style={{ mixBlendMode: "screen" }} />
            {/* sump float */}
            <FloatSensor x={sumpX + sumpW - 40} topY={sumpY + 4} waterY={sumpWaterY} highY={sumpY + sumpH - 20} active={sumpLevel < 12} label="" small />
          </g>

          {/* Suction pipe to pump */}
          <rect x={tankCenterX - 80 - 7} y={box.y - 60} width="14" height={sumpY + sumpH / 2 - (box.y - 60)} fill={`url(#${ids.chrome})`} stroke="#0a131a" strokeWidth="1" />
          {/* Pump unit on small concrete pad */}
          <PumpUnit x={tankCenterX - 130} y={groundY - 60} pumpId={ids.pumpBody} ledId={ids.led} on={pumpOn} />

          {/* Hatch */}
          <rect x={sumpX + sumpW / 2 - 36} y={groundY - 14} width="72" height="16" rx="3" fill={`url(#${ids.cap})`} stroke="#03080c" strokeWidth="1.2" />
          <line x1={sumpX + sumpW / 2 - 26} y1={groundY - 6} x2={sumpX + sumpW / 2 + 26} y2={groundY - 6} stroke="#fff" strokeOpacity="0.1" strokeWidth="1" />

          <text x={sumpX + sumpW - 14} y={sumpY + 24} fontSize="13" textAnchor="end" fill="#aee3f5" fontFamily="monospace" fontWeight="bold">
            SUMP {sumpLevel.toFixed(0)}%
          </text>
          <text x={sumpX + 12} y={sumpY + 24} fontSize="10" fill="#aee3f5" fontFamily="monospace" opacity="0.75">
            UNDERGROUND TANK
          </text>
        </>
      ) : (
        <>
          <rect x="0" y={groundY - 6} width={VBW} height="8" fill={`url(#${ids.grass})`} />
          <rect x="0" y={groundY} width={VBW} height={VBH - groundY} fill={`url(#${ids.soil})`} />
          {/* Pump unit on the ground next to tank */}
          <PumpUnit x={tankCenterX - 130} y={groundY - 60} pumpId={ids.pumpBody} ledId={ids.led} on={pumpOn} />
        </>
      )}
    </svg>
  );
}

/* ===== Geometry ===== */
function getTankBox(shape: TankShape) {
  switch (shape) {
    case "classic": return { x: 130, y: 90, w: 300, h: 340 };
    case "cylindrical-vertical": return { x: 170, y: 80, w: 220, h: 380 };
    case "cylindrical-horizontal": return { x: 80, y: 200, w: 400, h: 200 };
    case "spherical": return { x: 130, y: 110, w: 300, h: 300 };
    case "dome-top": return { x: 160, y: 90, w: 240, h: 360 };
    case "loft-low": return { x: 80, y: 240, w: 400, h: 200 };
    case "conical-bottom": return { x: 150, y: 80, w: 260, h: 400 };
    case "capsule": return { x: 180, y: 80, w: 200, h: 400 };
    case "hexagonal": return { x: 140, y: 100, w: 280, h: 340 };
    case "industrial-silo": return { x: 195, y: 70, w: 170, h: 440 };
  }
}

function ShapePath({
  shape, fill, stroke, strokeWidth, inset = 0,
  strokeOpacity,
}: {
  shape: TankShape; fill?: string; stroke?: string;
  strokeWidth?: number; inset?: number; strokeOpacity?: number;
}) {
  const b = getTankBox(shape);
  const x = b.x + inset, y = b.y + inset, w = b.w - inset * 2, h = b.h - inset * 2;
  const common = { fill: fill ?? "transparent", stroke, strokeWidth, strokeOpacity };
  switch (shape) {
    case "classic":
      return <rect x={x} y={y} width={w} height={h} rx="16" {...common} />;
    case "cylindrical-vertical":
      return <rect x={x} y={y} width={w} height={h} rx={w / 2} ry="22" {...common} />;
    case "cylindrical-horizontal":
      return <rect x={x} y={y} width={w} height={h} rx="24" ry={h / 2} {...common} />;
    case "spherical":
      return <ellipse cx={x + w / 2} cy={y + h / 2} rx={w / 2} ry={h / 2} {...common} />;
    case "dome-top": {
      const r = w / 2;
      const d = `M ${x} ${y + r} A ${r} ${r} 0 0 1 ${x + w} ${y + r} L ${x + w} ${y + h - 12} Q ${x + w} ${y + h} ${x + w - 14} ${y + h} L ${x + 14} ${y + h} Q ${x} ${y + h} ${x} ${y + h - 12} Z`;
      return <path d={d} {...common} />;
    }
    case "loft-low":
      return <rect x={x} y={y} width={w} height={h} rx="34" {...common} />;
    case "conical-bottom": {
      const taper = y + h * 0.62;
      const d = `M ${x + 14} ${y} L ${x + w - 14} ${y} Q ${x + w} ${y} ${x + w} ${y + 14} L ${x + w} ${taper} L ${x + w / 2 + 12} ${y + h} L ${x + w / 2 - 12} ${y + h} L ${x} ${taper} L ${x} ${y + 14} Q ${x} ${y} ${x + 14} ${y} Z`;
      return <path d={d} {...common} />;
    }
    case "capsule": {
      const r = w / 2;
      const d = `M ${x} ${y + r} A ${r} ${r} 0 0 1 ${x + w} ${y + r} L ${x + w} ${y + h - r} A ${r} ${r} 0 0 1 ${x} ${y + h - r} Z`;
      return <path d={d} {...common} />;
    }
    case "hexagonal": {
      const cx = x + w / 2, top = y, bot = y + h, ix = w * 0.16;
      const d = `M ${cx} ${top} L ${x + w - ix} ${top + 32} L ${x + w} ${y + h / 2} L ${x + w - ix} ${bot - 32} L ${cx} ${bot} L ${x + ix} ${bot - 32} L ${x} ${y + h / 2} L ${x + ix} ${top + 32} Z`;
      return <path d={d} {...common} />;
    }
    case "industrial-silo": {
      const r = w / 2;
      const d = `M ${x} ${y + r * 0.7} Q ${x + w / 2} ${y - r * 0.45} ${x + w} ${y + r * 0.7} L ${x + w} ${y + h - 32} Q ${x + w} ${y + h} ${x + w - 16} ${y + h} L ${x + 16} ${y + h} Q ${x} ${y + h} ${x} ${y + h - 32} Z`;
      return <path d={d} {...common} />;
    }
  }
}

function Stand({ shape, groundY, chromeId }: { shape: TankShape; groundY: number; chromeId: string }) {
  const b = getTankBox(shape);
  const baseY = b.y + b.h;
  if (baseY >= groundY - 6) return null;
  const legs = [b.x + 22, b.x + b.w * 0.38, b.x + b.w * 0.62, b.x + b.w - 22];
  return (
    <g>
      {legs.map((lx, i) => (
        <rect key={i} x={lx - 5} y={baseY - 4} width="10" height={groundY - baseY + 4}
          fill={`url(#${chromeId})`} stroke="#0a131a" strokeWidth="0.8" />
      ))}
      <rect x={b.x - 14} y={baseY - 8} width={b.w + 28} height="14" rx="2"
        fill="#1c2630" stroke="#03080c" strokeWidth="1" />
      <rect x={b.x - 18} y={groundY - 4} width={b.w + 36} height="6" fill="#0a0a0a" opacity="0.7" />
    </g>
  );
}

function TopRim({ box, rimId }: { box: { x: number; y: number; w: number; h: number }; rimId: string }) {
  const bolts = 9;
  return (
    <g>
      <rect x={box.x + 4} y={box.y - 6} width={box.w - 8} height="14" rx="3" fill={`url(#${rimId})`} stroke="#03080c" strokeWidth="1" />
      {Array.from({ length: bolts }).map((_, i) => {
        const cx = box.x + 16 + (i * (box.w - 32)) / (bolts - 1);
        return <circle key={i} cx={cx} cy={box.y + 1} r="1.8" fill="#cdd6df" stroke="#0a141c" strokeWidth="0.4" />;
      })}
    </g>
  );
}

function LevelRule({ x, y, h }: { x: number; y: number; h: number }) {
  const ticks = [0, 25, 50, 75, 100];
  return (
    <g>
      <rect x={x - 6} y={y} width="12" height={h} rx="2" fill="#1c2630" stroke="#03080c" strokeWidth="1" />
      {ticks.map((p) => {
        const ty = y + h - (p / 100) * h;
        return (
          <g key={p}>
            <line x1={x - 6} y1={ty} x2={x + 6} y2={ty} stroke="#cdd6df" strokeWidth="1" />
            <text x={x - 10} y={ty + 3} fontSize="8" textAnchor="end" fill="#aee3f5" fontFamily="monospace">{p}</text>
          </g>
        );
      })}
    </g>
  );
}

function FloatSensor({
  x, topY, waterY, highY, active, label, small = false,
}: { x: number; topY: number; waterY: number; highY: number; active: boolean; label: string; small?: boolean }) {
  const ballY = Math.max(highY, waterY - 4);
  const r = small ? 5 : 7;
  return (
    <g>
      <line x1={x} y1={topY} x2={x} y2={ballY - r} stroke="#0a141c" strokeWidth="1.4" />
      <ellipse cx={x} cy={ballY} rx={r + 2} ry={r} fill="#f4b400" stroke="#5a3d00" strokeWidth="1" />
      <ellipse cx={x - 1} cy={ballY - 2} rx={r * 0.4} ry={r * 0.25} fill="#fff" opacity="0.7" />
      {label && (
        <text x={x + 10} y={topY + 18} fontSize="9" fontFamily="monospace" fontWeight="bold"
          fill={active ? "#ff5a5a" : "#22ff88"}
          style={{ filter: active ? "drop-shadow(0 0 3px #ff5a5a)" : "drop-shadow(0 0 3px #22ff88)" }}>
          ● {label}
        </text>
      )}
    </g>
  );
}

function PumpUnit({ x, y, pumpId, ledId, on }: { x: number; y: number; pumpId: string; ledId: string; on: boolean }) {
  return (
    <g>
      {/* pad */}
      <rect x={x - 6} y={y + 50} width={120} height="10" fill="#3a3a3a" stroke="#0a0a0a" strokeWidth="1" />
      {/* body */}
      <rect x={x} y={y} width="108" height="50" rx="6" fill={`url(#${pumpId})`} stroke="#03222e" strokeWidth="1.5" />
      {/* fan housing */}
      <circle cx={x + 18} cy={y + 25} r="14" fill="#0a2030" stroke="#03080c" strokeWidth="1.5" />
      <g transform={`translate(${x + 18} ${y + 25})`}>
        <g style={on ? { animation: "spin 0.6s linear infinite", transformOrigin: "center" } : {}}>
          <rect x="-2" y="-12" width="4" height="24" fill="#cdd6df" />
          <rect x="-12" y="-2" width="24" height="4" fill="#cdd6df" />
        </g>
      </g>
      {/* label */}
      <rect x={x + 38} y={y + 14} width="62" height="22" rx="3" fill="#001827" stroke="#03080c" strokeWidth="0.8" />
      <text x={x + 69} y={y + 30} fontSize="11" textAnchor="middle" fill="#7fd4f0" fontFamily="monospace" fontWeight="bold">AQUA-PUMP</text>
      {/* led */}
      <circle cx={x + 100} cy={y + 8} r="5" fill={on ? `url(#${ledId})` : "#222"} />
      {on && <circle cx={x + 100} cy={y + 8} r="9" fill="#22cc55" opacity="0.25" />}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </g>
  );
}
