import { useEffect, useState } from "react";

interface WaterTankProps {
  level: number; // 0-100
  pumpOn: boolean;
}

export function WaterTank({ level, pumpOn }: WaterTankProps) {
  const [waveOffset, setWaveOffset] = useState(0);

  useEffect(() => {
    let raf: number;
    const tick = () => {
      setWaveOffset((o) => (o + 1) % 200);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Tank inner dimensions
  const tankX = 90;
  const tankY = 60;
  const tankW = 220;
  const tankH = 280;
  const waterH = (tankH - 10) * (level / 100);
  const waterY = tankY + tankH - 5 - waterH;

  // Wave path
  const buildWave = (offset: number, amp: number) => {
    const points: string[] = [];
    const segs = 20;
    for (let i = 0; i <= segs; i++) {
      const x = tankX + 5 + (i / segs) * (tankW - 10);
      const y = waterY + Math.sin((i / segs) * Math.PI * 2 + offset) * amp;
      points.push(`${i === 0 ? "M" : "L"} ${x} ${y}`);
    }
    points.push(`L ${tankX + tankW - 5} ${tankY + tankH - 5}`);
    points.push(`L ${tankX + 5} ${tankY + tankH - 5} Z`);
    return points.join(" ");
  };

  const levelColor =
    level > 70
      ? "var(--color-chart-2)"
      : level > 30
        ? "var(--color-chart-4)"
        : "var(--color-destructive)";

  return (
    <svg viewBox="0 0 400 480" className="w-full max-w-md drop-shadow-2xl">
      <defs>
        <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity="0.95" />
          <stop offset="100%" stopColor="var(--color-chart-3)" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="tankGlass" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--color-muted)" stopOpacity="0.4" />
          <stop offset="50%" stopColor="var(--color-muted)" stopOpacity="0.1" />
          <stop offset="100%" stopColor="var(--color-muted)" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id="pumpGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-secondary)" />
          <stop offset="100%" stopColor="var(--color-muted)" />
        </linearGradient>
        <clipPath id="tankClip">
          <rect x={tankX + 5} y={tankY + 5} width={tankW - 10} height={tankH - 10} rx="8" />
        </clipPath>
      </defs>

      {/* Inlet pipe from top */}
      <rect x="180" y="10" width="40" height="60" fill="var(--color-muted)" stroke="var(--color-border)" strokeWidth="2" rx="4" />
      <rect x="175" y="50" width="50" height="14" fill="var(--color-secondary)" stroke="var(--color-border)" strokeWidth="2" rx="2" />

      {/* Falling water stream when pump on */}
      {pumpOn && (
        <g clipPath="url(#tankClip)">
          <rect
            x="192"
            y="64"
            width="16"
            height={Math.max(0, waterY - 64)}
            fill="url(#waterGrad)"
            opacity="0.85"
          >
            <animate attributeName="opacity" values="0.7;1;0.7" dur="0.4s" repeatCount="indefinite" />
          </rect>
          {/* Splash circles */}
          <circle cx="200" cy={waterY} r="6" fill="var(--color-chart-2)" opacity="0.6">
            <animate attributeName="r" values="2;10;2" dur="0.6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.8;0;0.8" dur="0.6s" repeatCount="indefinite" />
          </circle>
        </g>
      )}

      {/* Tank body */}
      <rect
        x={tankX}
        y={tankY}
        width={tankW}
        height={tankH}
        rx="12"
        fill="url(#tankGlass)"
        stroke="var(--color-foreground)"
        strokeWidth="3"
      />

      {/* Water inside tank */}
      <g clipPath="url(#tankClip)">
        <path
          d={buildWave(waveOffset * 0.05, 4)}
          fill="url(#waterGrad)"
          opacity="0.9"
        />
        <path
          d={buildWave(waveOffset * 0.05 + 1.5, 3)}
          fill="var(--color-chart-2)"
          opacity="0.4"
        />
        {/* Bubbles */}
        {pumpOn && level > 10 && (
          <>
            <circle cx="140" cy={tankY + tankH - 20} r="3" fill="white" opacity="0.6">
              <animate attributeName="cy" from={tankY + tankH - 20} to={waterY + 10} dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0;0.7;0" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="240" cy={tankY + tankH - 30} r="2" fill="white" opacity="0.6">
              <animate attributeName="cy" from={tankY + tankH - 30} to={waterY + 10} dur="2.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0;0.7;0" dur="2.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="180" cy={tankY + tankH - 15} r="2.5" fill="white" opacity="0.6">
              <animate attributeName="cy" from={tankY + tankH - 15} to={waterY + 10} dur="1.8s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0;0.7;0" dur="1.8s" repeatCount="indefinite" />
            </circle>
          </>
        )}
      </g>

      {/* Level markings */}
      {[0, 25, 50, 75, 100].map((m) => {
        const y = tankY + tankH - 5 - ((tankH - 10) * m) / 100;
        return (
          <g key={m}>
            <line x1={tankX + tankW} y1={y} x2={tankX + tankW + 10} y2={y} stroke="var(--color-foreground)" strokeWidth="2" />
            <text x={tankX + tankW + 14} y={y + 4} fontSize="11" fill="var(--color-muted-foreground)" fontFamily="monospace">
              {m}%
            </text>
          </g>
        );
      })}

      {/* Level percentage display */}
      <g>
        <rect x="120" y="20" width="60" height="28" rx="6" fill="var(--color-card)" stroke={levelColor} strokeWidth="2" />
        <text x="150" y="39" fontSize="16" fontWeight="bold" textAnchor="middle" fill={levelColor} fontFamily="monospace">
          {Math.round(level)}%
        </text>
      </g>

      {/* Tank base */}
      <rect x={tankX - 10} y={tankY + tankH} width={tankW + 20} height="10" fill="var(--color-foreground)" rx="2" />

      {/* Outlet pipe at bottom going down to pump */}
      <rect x="100" y={tankY + tankH + 10} width="14" height="40" fill="var(--color-muted)" stroke="var(--color-border)" strokeWidth="2" />
      <rect x="60" y={tankY + tankH + 50} width="54" height="14" fill="var(--color-muted)" stroke="var(--color-border)" strokeWidth="2" rx="2" />

      {/* Pump - top inlet pipe (sucks from a source, pumps up to inlet) */}
      <rect x="20" y="70" width="14" height={tankY + tankH + 50 - 70 + 14} fill="var(--color-muted)" stroke="var(--color-border)" strokeWidth="2" />
      <rect x="20" y="56" width="14" height="20" fill="var(--color-secondary)" stroke="var(--color-border)" strokeWidth="2" />
      {/* Pipe connecting pump up to top inlet */}
      <rect x="20" y="40" width="180" height="14" fill="var(--color-muted)" stroke="var(--color-border)" strokeWidth="2" />
      <rect x="186" y="40" width="14" height="30" fill="var(--color-muted)" stroke="var(--color-border)" strokeWidth="2" />

      {/* Flowing arrows in pipes when pump on */}
      {pumpOn && (
        <g stroke="var(--color-chart-2)" strokeWidth="2.5" fill="none" strokeLinecap="round">
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <path d="M 30 47 L 36 47" opacity="0.8">
                <animateTransform attributeName="transform" type="translate" from={`${i * 50} 0`} to={`${i * 50 + 50} 0`} dur="1s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0;1;0" dur="1s" repeatCount="indefinite" />
              </path>
            </g>
          ))}
        </g>
      )}

      {/* Pump motor body */}
      <g transform="translate(15, 380)">
        <rect x="0" y="0" width="90" height="70" rx="8" fill="url(#pumpGrad)" stroke="var(--color-foreground)" strokeWidth="2.5" />
        <circle cx="45" cy="35" r="22" fill="var(--color-card)" stroke="var(--color-foreground)" strokeWidth="2" />
        {/* Spinning fan */}
        <g transform="translate(45, 35)">
          {pumpOn && (
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0"
              to="360"
              dur="0.4s"
              repeatCount="indefinite"
              additive="sum"
            />
          )}
          <path d="M 0 -18 Q 6 -8 0 0 Q -6 -8 0 -18 Z" fill={pumpOn ? "var(--color-chart-2)" : "var(--color-muted-foreground)"} />
          <path d="M 18 0 Q 8 6 0 0 Q 8 -6 18 0 Z" fill={pumpOn ? "var(--color-chart-2)" : "var(--color-muted-foreground)"} />
          <path d="M 0 18 Q -6 8 0 0 Q 6 8 0 18 Z" fill={pumpOn ? "var(--color-chart-2)" : "var(--color-muted-foreground)"} />
          <path d="M -18 0 Q -8 -6 0 0 Q -8 6 -18 0 Z" fill={pumpOn ? "var(--color-chart-2)" : "var(--color-muted-foreground)"} />
          <circle r="4" fill="var(--color-foreground)" />
        </g>
        {/* Status light */}
        <circle cx="78" cy="12" r="5" fill={pumpOn ? "var(--color-chart-2)" : "var(--color-destructive)"}>
          {pumpOn && <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />}
        </circle>
        <text x="45" y="62" fontSize="9" textAnchor="middle" fill="var(--color-foreground)" fontFamily="monospace" fontWeight="bold">
          MOTOR
        </text>
      </g>

      {/* Ground */}
      <line x1="0" y1="465" x2="400" y2="465" stroke="var(--color-foreground)" strokeWidth="2" strokeDasharray="4 4" />
    </svg>
  );
}
