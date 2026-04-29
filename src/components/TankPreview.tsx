import { useEffect, useId, useState } from "react";
import type { TankShape } from "./tankShapes";

interface TankPreviewProps {
  shape: TankShape;
  level: number; // 0-100
  pumpOn: boolean;
  withSump: boolean;
  sumpLevel?: number; // 0-100
  className?: string;
}

/**
 * Realistic SVG renderer for 10 tank shapes with optional underground sump.
 * Uses a clipPath per-shape so the same wavy water fills any silhouette.
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

  // Canvas
  const VBW = 500;
  const VBH = withSump ? 800 : 620;

  // Tank bounding box (where water lives) - varies per shape
  const box = getTankBox(shape);
  const waterMaxH = box.h;
  const waterH = waterMaxH * (level / 100);
  const waterY = box.y + box.h - waterH;

  const buildWave = (
    offset: number,
    amp: number,
    freq: number,
    baseY: number,
    x0: number,
    x1: number,
    bottomY: number,
  ) => {
    const pts: string[] = [];
    const segs = 40;
    for (let i = 0; i <= segs; i++) {
      const x = x0 + (i / segs) * (x1 - x0);
      const y =
        baseY +
        Math.sin((i / segs) * Math.PI * freq + offset) * amp +
        Math.cos((i / segs) * Math.PI * (freq * 1.7) + offset * 1.3) * (amp * 0.4);
      pts.push(`${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`);
    }
    pts.push(`L ${x1} ${bottomY}`);
    pts.push(`L ${x0} ${bottomY} Z`);
    return pts.join(" ");
  };

  // ===== Sump geometry =====
  const sumpX = 60;
  const sumpY = 620;
  const sumpW = 380;
  const sumpH = 130;
  const sumpPad = 6;
  const sumpWaterMaxH = sumpH - sumpPad * 2;
  const sumpWaterH = sumpWaterMaxH * (sumpLevel / 100);
  const sumpWaterY = sumpY + sumpH - sumpPad - sumpWaterH;

  const tankClipId = `tankClip-${uid}`;
  const sumpClipId = `sumpClip-${uid}`;
  const waterId = `waterDeep-${uid}`;
  const surfaceId = `waterSurface-${uid}`;
  const glassId = `tankGlass-${uid}`;
  const shadowId = `tankShadow-${uid}`;

  return (
    <svg viewBox={`0 0 ${VBW} ${VBH}`} className={className ?? "w-full drop-shadow-2xl"}>
      <defs>
        <linearGradient id={waterId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4fb3d9" />
          <stop offset="40%" stopColor="#1e7ba8" />
          <stop offset="100%" stopColor="#0a3d5c" />
        </linearGradient>
        <linearGradient id={surfaceId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#aee3f5" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#4fb3d9" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={glassId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="50%" stopColor="#fff" stopOpacity="0" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id={shadowId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#000" stopOpacity="0.18" />
          <stop offset="50%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id={`pipe-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#5a6470" />
          <stop offset="50%" stopColor="#e8ecf0" />
          <stop offset="100%" stopColor="#3e4651" />
        </linearGradient>
        <linearGradient id={`soil-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6b4a2b" />
          <stop offset="100%" stopColor="#2a1d12" />
        </linearGradient>
        <linearGradient id={`grass-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5fa84a" />
          <stop offset="100%" stopColor="#3a7028" />
        </linearGradient>
        <linearGradient id={`concrete-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#3a3a3a" />
          <stop offset="50%" stopColor="#7a7a7a" />
          <stop offset="100%" stopColor="#2a2a2a" />
        </linearGradient>
        <linearGradient id={`cap-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a4250" />
          <stop offset="100%" stopColor="#0a0e14" />
        </linearGradient>

        <clipPath id={tankClipId}>
          <ShapePath shape={shape} inset={6} />
        </clipPath>
        <clipPath id={sumpClipId}>
          <rect
            x={sumpX + sumpPad}
            y={sumpY + sumpPad}
            width={sumpW - sumpPad * 2}
            height={sumpH - sumpPad * 2}
            rx="4"
          />
        </clipPath>
      </defs>

      {/* Stand / support legs */}
      <Stand shape={shape} />

      {/* Tank shell (back) */}
      <g>
        <ShapePath shape={shape} fill="#0a1820" stroke="#0a0e14" strokeWidth={2} />
      </g>

      {/* Water inside (clipped) */}
      <g clipPath={`url(#${tankClipId})`}>
        <path
          d={buildWave(t, 5, 3, waterY, box.x, box.x + box.w, box.y + box.h)}
          fill={`url(#${waterId})`}
        />
        <path
          d={buildWave(t, 5, 3, waterY, box.x, box.x + box.w, box.y + box.h)}
          fill={`url(#${surfaceId})`}
          style={{ mixBlendMode: "screen" }}
        />
        <path
          d={buildWave(t * 1.4 + 2, 3, 5, waterY, box.x, box.x + box.w, box.y + box.h)}
          fill="#4fb3d9"
          opacity="0.25"
        />
        <ellipse cx={box.x + box.w * 0.35} cy={waterY + 2} rx={box.w * 0.18} ry="2" fill="#fff" opacity="0.55" />
        {pumpOn && level > 8 &&
          [0, 1, 2, 3].map((i) => (
            <circle
              key={i}
              cx={box.x + box.w * (0.2 + i * 0.2)}
              r={2 + (i % 2)}
              fill="#fff"
              opacity="0.7"
            >
              <animate
                attributeName="cy"
                from={box.y + box.h - 10}
                to={waterY + 6}
                dur={`${2 + i * 0.3}s`}
                begin={`${i * 0.4}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0;0.8;0.8;0"
                dur={`${2 + i * 0.3}s`}
                begin={`${i * 0.4}s`}
                repeatCount="indefinite"
              />
            </circle>
          ))}
      </g>

      {/* Glass highlights / shadow overlay */}
      <g pointerEvents="none">
        <ShapePath shape={shape} fill={`url(#${glassId})`} />
        <ShapePath shape={shape} fill={`url(#${shadowId})`} />
        <ShapePath shape={shape} fill="none" stroke="#1a1f26" strokeWidth={3} />
      </g>

      {/* Inlet pipe top */}
      <rect x={box.x + box.w / 2 - 8} y={box.y - 30} width="16" height="30" fill={`url(#pipe-${uid})`} />
      {pumpOn && (!withSump || sumpLevel > 5) && (
        <line
          x1={box.x + box.w / 2}
          y1={box.y - 30}
          x2={box.x + box.w / 2}
          y2={box.y}
          stroke="#4fb3d9"
          strokeWidth="8"
          strokeDasharray="10 10"
          opacity="0.7"
        >
          <animate attributeName="stroke-dashoffset" from="0" to="-20" dur="0.5s" repeatCount="indefinite" />
        </line>
      )}

      {/* Digital display */}
      <g>
        <rect x={VBW / 2 - 40} y={10} width="80" height="32" rx="5" fill="#0a0e14" stroke="#2c333d" strokeWidth="2" />
        <rect x={VBW / 2 - 37} y={13} width="74" height="26" rx="3" fill="#001a0d" />
        <text
          x={VBW / 2}
          y={32}
          fontSize="18"
          fontWeight="bold"
          textAnchor="middle"
          fill="#22ff88"
          fontFamily="'Courier New', monospace"
          style={{ filter: "drop-shadow(0 0 3px #22ff88)" }}
        >
          {level.toFixed(1)}%
        </text>
      </g>

      {/* Ground + sump */}
      {withSump && (
        <>
          <rect x="0" y="600" width={VBW} height={VBH - 600} fill={`url(#soil-${uid})`} />
          <rect x="0" y="595" width={VBW} height="10" fill={`url(#grass-${uid})`} />
          <line x1="0" y1="600" x2={VBW} y2="600" stroke="#1a1f26" strokeWidth="1.5" />

          <rect
            x={sumpX - 10}
            y={sumpY - 10}
            width={sumpW + 20}
            height={sumpH + 20}
            rx="6"
            fill={`url(#concrete-${uid})`}
            stroke="#1a1f26"
            strokeWidth="2"
          />
          <rect
            x={sumpX}
            y={sumpY}
            width={sumpW}
            height={sumpH}
            rx="4"
            fill="#0a1820"
            stroke="#0a0e14"
            strokeWidth="1.5"
          />
          <g clipPath={`url(#${sumpClipId})`}>
            <path
              d={buildWave(t * 0.8, 3, 4, sumpWaterY, sumpX + sumpPad, sumpX + sumpW - sumpPad, sumpY + sumpH - sumpPad)}
              fill={`url(#${waterId})`}
            />
            <path
              d={buildWave(t * 0.8, 3, 4, sumpWaterY, sumpX + sumpPad, sumpX + sumpW - sumpPad, sumpY + sumpH - sumpPad)}
              fill={`url(#${surfaceId})`}
              style={{ mixBlendMode: "screen" }}
            />
          </g>

          {/* Suction pipe down from tank to sump */}
          <rect
            x={box.x + box.w / 2 - 8}
            y={box.y + box.h}
            width="16"
            height={sumpY - (box.y + box.h)}
            fill={`url(#pipe-${uid})`}
          />
          <rect
            x={box.x + box.w / 2 - 16}
            y={sumpY + sumpH - 28}
            width="32"
            height="20"
            rx="3"
            fill="#3a4250"
            stroke="#0a0e14"
            strokeWidth="1.2"
          />

          {/* Hatch */}
          <rect
            x={sumpX + sumpW / 2 - 30}
            y="588"
            width="60"
            height="14"
            rx="2"
            fill={`url(#cap-${uid})`}
            stroke="#0a0e14"
            strokeWidth="1.2"
          />
          <text
            x={sumpX + sumpW - 10}
            y={sumpY + 22}
            fontSize="12"
            textAnchor="end"
            fill="#aee3f5"
            fontFamily="monospace"
            fontWeight="bold"
          >
            SUMP {sumpLevel.toFixed(0)}%
          </text>
          <text x={sumpX + 10} y={sumpY + 22} fontSize="9" fill="#aee3f5" fontFamily="monospace" opacity="0.7">
            UNDERGROUND TANK
          </text>
        </>
      )}

      {!withSump && (
        <>
          <rect x="0" y="595" width={VBW} height="10" fill={`url(#grass-${uid})`} />
          <rect x="0" y="600" width={VBW} height={VBH - 600} fill={`url(#soil-${uid})`} />
        </>
      )}
    </svg>
  );
}

// ====== shape geometry ======
function getTankBox(shape: TankShape): { x: number; y: number; w: number; h: number } {
  switch (shape) {
    case "classic":
      return { x: 110, y: 80, w: 280, h: 320 };
    case "cylindrical-vertical":
      return { x: 150, y: 70, w: 200, h: 360 };
    case "cylindrical-horizontal":
      return { x: 60, y: 180, w: 380, h: 180 };
    case "spherical":
      return { x: 110, y: 90, w: 280, h: 280 };
    case "dome-top":
      return { x: 140, y: 90, w: 220, h: 340 };
    case "loft-low":
      return { x: 60, y: 230, w: 380, h: 180 };
    case "conical-bottom":
      return { x: 130, y: 70, w: 240, h: 380 };
    case "capsule":
      return { x: 160, y: 70, w: 180, h: 380 };
    case "hexagonal":
      return { x: 120, y: 90, w: 260, h: 320 };
    case "industrial-silo":
      return { x: 170, y: 60, w: 160, h: 420 };
  }
}

function ShapePath({
  shape,
  fill,
  stroke,
  strokeWidth,
  inset = 0,
}: {
  shape: TankShape;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  inset?: number;
}) {
  const b = getTankBox(shape);
  const x = b.x + inset;
  const y = b.y + inset;
  const w = b.w - inset * 2;
  const h = b.h - inset * 2;
  const common = { fill: fill ?? "transparent", stroke, strokeWidth };

  switch (shape) {
    case "classic":
      return <rect x={x} y={y} width={w} height={h} rx="14" {...common} />;
    case "cylindrical-vertical":
      return <rect x={x} y={y} width={w} height={h} rx={w / 2} ry="20" {...common} />;
    case "cylindrical-horizontal":
      return <rect x={x} y={y} width={w} height={h} rx="20" ry={h / 2} {...common} />;
    case "spherical":
      return <ellipse cx={x + w / 2} cy={y + h / 2} rx={w / 2} ry={h / 2} {...common} />;
    case "dome-top": {
      const r = w / 2;
      const d = `M ${x} ${y + r} A ${r} ${r} 0 0 1 ${x + w} ${y + r} L ${x + w} ${y + h} Q ${x + w} ${y + h + 14} ${x + w / 2} ${y + h + 14} Q ${x} ${y + h + 14} ${x} ${y + h} Z`;
      return <path d={d} {...common} />;
    }
    case "loft-low":
      return <rect x={x} y={y} width={w} height={h} rx="30" {...common} />;
    case "conical-bottom": {
      const taperY = y + h * 0.6;
      const d = `M ${x} ${y + 14} Q ${x} ${y} ${x + 14} ${y} L ${x + w - 14} ${y} Q ${x + w} ${y} ${x + w} ${y + 14} L ${x + w} ${taperY} L ${x + w / 2 + 10} ${y + h} L ${x + w / 2 - 10} ${y + h} L ${x} ${taperY} Z`;
      return <path d={d} {...common} />;
    }
    case "capsule": {
      const r = w / 2;
      const d = `M ${x} ${y + r} A ${r} ${r} 0 0 1 ${x + w} ${y + r} L ${x + w} ${y + h - r} A ${r} ${r} 0 0 1 ${x} ${y + h - r} Z`;
      return <path d={d} {...common} />;
    }
    case "hexagonal": {
      const cx = x + w / 2;
      const top = y;
      const bot = y + h;
      const inset2 = w * 0.15;
      const d = `M ${cx} ${top} L ${x + w - inset2} ${top + 30} L ${x + w} ${y + h / 2} L ${x + w - inset2} ${bot - 30} L ${cx} ${bot} L ${x + inset2} ${bot - 30} L ${x} ${y + h / 2} L ${x + inset2} ${top + 30} Z`;
      return <path d={d} {...common} />;
    }
    case "industrial-silo": {
      const r = w / 2;
      const d = `M ${x} ${y + r * 0.6} Q ${x + w / 2} ${y - r * 0.4} ${x + w} ${y + r * 0.6} L ${x + w} ${y + h - 30} Q ${x + w} ${y + h} ${x + w - 14} ${y + h} L ${x + 14} ${y + h} Q ${x} ${y + h} ${x} ${y + h - 30} Z`;
      return <path d={d} {...common} />;
    }
  }
}

function Stand({ shape }: { shape: TankShape }) {
  const b = getTankBox(shape);
  const baseY = b.y + b.h;
  const groundY = 595;
  if (baseY >= groundY - 4) return null;
  // Two angled legs
  return (
    <g>
      <line x1={b.x + 20} y1={baseY} x2={b.x + 30} y2={groundY} stroke="#2c333d" strokeWidth="6" />
      <line x1={b.x + b.w - 20} y1={baseY} x2={b.x + b.w - 30} y2={groundY} stroke="#2c333d" strokeWidth="6" />
      <line x1={b.x + b.w * 0.35} y1={baseY} x2={b.x + b.w * 0.4} y2={groundY} stroke="#2c333d" strokeWidth="5" />
      <line x1={b.x + b.w * 0.65} y1={baseY} x2={b.x + b.w * 0.6} y2={groundY} stroke="#2c333d" strokeWidth="5" />
      <rect x={b.x - 10} y={baseY - 6} width={b.w + 20} height="10" rx="2" fill="#2c333d" />
    </g>
  );
}
