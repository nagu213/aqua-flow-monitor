import { useEffect, useState } from "react";

interface WaterTankProps {
  level: number; // 0-100
  pumpOn: boolean;
}

export function WaterTank({ level, pumpOn }: WaterTankProps) {
  const [waveOffset, setWaveOffset] = useState(0);

  useEffect(() => {
    let raf: number;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      setWaveOffset((o) => o + dt * 0.003);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Tank geometry
  const tankX = 110;
  const tankY = 80;
  const tankW = 240;
  const tankH = 300;
  const innerPad = 8;
  const waterMaxH = tankH - innerPad * 2;
  const waterH = waterMaxH * (level / 100);
  const waterY = tankY + tankH - innerPad - waterH;

  // Wave path
  const buildWave = (offset: number, amp: number, freq: number) => {
    const points: string[] = [];
    const segs = 40;
    const x0 = tankX + innerPad;
    const x1 = tankX + tankW - innerPad;
    for (let i = 0; i <= segs; i++) {
      const x = x0 + (i / segs) * (x1 - x0);
      const y = waterY + Math.sin((i / segs) * Math.PI * freq + offset) * amp
              + Math.cos((i / segs) * Math.PI * (freq * 1.7) + offset * 1.3) * (amp * 0.4);
      points.push(`${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`);
    }
    points.push(`L ${x1} ${tankY + tankH - innerPad}`);
    points.push(`L ${x0} ${tankY + tankH - innerPad} Z`);
    return points.join(" ");
  };

  return (
    <svg viewBox="0 0 500 560" className="w-full max-w-xl drop-shadow-2xl">
      <defs>
        {/* Realistic water gradient */}
        <linearGradient id="waterDeep" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4fb3d9" />
          <stop offset="40%" stopColor="#1e7ba8" />
          <stop offset="100%" stopColor="#0a3d5c" />
        </linearGradient>
        <linearGradient id="waterSurface" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#aee3f5" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#4fb3d9" stopOpacity="0" />
        </linearGradient>

        {/* Glass tank gradient */}
        <linearGradient id="tankGlass" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="15%" stopColor="#ffffff" stopOpacity="0.05" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="85%" stopColor="#ffffff" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id="tankShadow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#000" stopOpacity="0.15" />
          <stop offset="50%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.25" />
        </linearGradient>

        {/* Metallic pipe gradient */}
        <linearGradient id="pipeMetal" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#5a6470" />
          <stop offset="25%" stopColor="#c8ced6" />
          <stop offset="50%" stopColor="#e8ecf0" />
          <stop offset="75%" stopColor="#a8b0ba" />
          <stop offset="100%" stopColor="#3e4651" />
        </linearGradient>
        <linearGradient id="pipeMetalH" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5a6470" />
          <stop offset="25%" stopColor="#c8ced6" />
          <stop offset="50%" stopColor="#e8ecf0" />
          <stop offset="75%" stopColor="#a8b0ba" />
          <stop offset="100%" stopColor="#3e4651" />
        </linearGradient>

        {/* Pump motor body */}
        <linearGradient id="motorBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2563a8" />
          <stop offset="50%" stopColor="#1e4d80" />
          <stop offset="100%" stopColor="#0f2a4a" />
        </linearGradient>
        <radialGradient id="motorCap" cx="0.35" cy="0.35" r="0.7">
          <stop offset="0%" stopColor="#5a6470" />
          <stop offset="60%" stopColor="#2c333d" />
          <stop offset="100%" stopColor="#13171e" />
        </radialGradient>
        <radialGradient id="fanHub" cx="0.4" cy="0.4" r="0.6">
          <stop offset="0%" stopColor="#888" />
          <stop offset="100%" stopColor="#222" />
        </radialGradient>

        {/* Tank top cap */}
        <linearGradient id="tankCap" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a4250" />
          <stop offset="50%" stopColor="#1a2028" />
          <stop offset="100%" stopColor="#0a0e14" />
        </linearGradient>

        {/* Status LED */}
        <radialGradient id="ledOn" cx="0.4" cy="0.4" r="0.6">
          <stop offset="0%" stopColor="#aaffcc" />
          <stop offset="50%" stopColor="#22cc66" />
          <stop offset="100%" stopColor="#0a4a22" />
        </radialGradient>
        <radialGradient id="ledOff" cx="0.4" cy="0.4" r="0.6">
          <stop offset="0%" stopColor="#ff8888" />
          <stop offset="100%" stopColor="#4a0a0a" />
        </radialGradient>

        {/* Ground shadow */}
        <radialGradient id="groundShadow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#000" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>

        <clipPath id="tankClip">
          <rect x={tankX + innerPad} y={tankY + innerPad} width={tankW - innerPad * 2} height={tankH - innerPad * 2} rx="6" />
        </clipPath>

        <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      {/* Ground shadow under everything */}
      <ellipse cx="250" cy="525" rx="200" ry="12" fill="url(#groundShadow)" />

      {/* ========= PIPING (behind tank) ========= */}
      {/* Vertical suction pipe from pump going up */}
      <rect x="35" y="100" width="22" height={400} fill="url(#pipeMetal)" />
      {/* Horizontal pipe across top to tank inlet */}
      <rect x="35" y="78" width="200" height="22" fill="url(#pipeMetalH)" />
      {/* Elbow joint top-left */}
      <circle cx="46" cy="89" r="14" fill="url(#pipeMetal)" stroke="#1a1f26" strokeWidth="1" />
      {/* Vertical drop to tank inlet */}
      <rect x="224" y="78" width="22" height="40" fill="url(#pipeMetal)" />
      {/* Inlet flange */}
      <rect x="218" y="115" width="34" height="8" fill="#2c333d" rx="1" />
      <rect x="218" y="115" width="34" height="8" fill="url(#pipeMetalH)" opacity="0.6" />

      {/* Outlet pipe at tank bottom */}
      <rect x="340" y={tankY + tankH - 30} width="60" height="20" fill="url(#pipeMetalH)" />
      <rect x="395" y={tankY + tankH - 30} width="20" height="80" fill="url(#pipeMetal)" />
      {/* Valve on outlet */}
      <rect x="368" y={tankY + tankH - 38} width="14" height="36" fill="url(#pipeMetal)" stroke="#1a1f26" strokeWidth="1" />
      <circle cx="375" cy={tankY + tankH - 44} r="9" fill="#a02020" stroke="#1a1f26" strokeWidth="1.5" />
      <circle cx="375" cy={tankY + tankH - 44} r="3" fill="#1a1f26" />

      {/* ========= WATER FLOW IN PIPES (when pump on) ========= */}
      {pumpOn && (
        <g>
          {/* Animated water dashes in horizontal pipe */}
          <line x1="60" y1="89" x2="220" y2="89" stroke="#4fb3d9" strokeWidth="10" strokeDasharray="14 14" opacity="0.7">
            <animate attributeName="stroke-dashoffset" from="0" to="-28" dur="0.6s" repeatCount="indefinite" />
          </line>
          {/* Vertical suction pipe flow */}
          <line x1="46" y1="500" x2="46" y2="100" stroke="#4fb3d9" strokeWidth="10" strokeDasharray="14 14" opacity="0.7">
            <animate attributeName="stroke-dashoffset" from="0" to="-28" dur="0.6s" repeatCount="indefinite" />
          </line>
          {/* Drop into tank */}
          <line x1="235" y1="80" x2="235" y2="118" stroke="#4fb3d9" strokeWidth="10" strokeDasharray="14 14" opacity="0.7">
            <animate attributeName="stroke-dashoffset" from="0" to="-28" dur="0.6s" repeatCount="indefinite" />
          </line>
        </g>
      )}

      {/* ========= TANK ========= */}
      {/* Tank back/inner shadow */}
      <rect x={tankX} y={tankY} width={tankW} height={tankH} rx="14" fill="#0a1820" />

      {/* Falling water stream inside tank */}
      {pumpOn && (
        <g clipPath="url(#tankClip)">
          <rect
            x="228"
            y="120"
            width="14"
            height={Math.max(0, waterY - 120)}
            fill="url(#waterDeep)"
            opacity="0.85"
          />
          <rect
            x="231"
            y="120"
            width="3"
            height={Math.max(0, waterY - 120)}
            fill="#aee3f5"
            opacity="0.7"
          />
          {/* Splash ripples on impact */}
          <circle cx="235" cy={waterY} r="6" fill="none" stroke="#aee3f5" strokeWidth="2" opacity="0.8">
            <animate attributeName="r" values="2;22;2" dur="1s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.9;0;0.9" dur="1s" repeatCount="indefinite" />
          </circle>
          <circle cx="235" cy={waterY} r="6" fill="none" stroke="#aee3f5" strokeWidth="1.5" opacity="0.6">
            <animate attributeName="r" values="2;28;2" dur="1.2s" begin="0.3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;0;0.7" dur="1.2s" begin="0.3s" repeatCount="indefinite" />
          </circle>
        </g>
      )}

      {/* Water body */}
      <g clipPath="url(#tankClip)">
        {/* Deep water */}
        <path d={buildWave(waveOffset, 5, 3)} fill="url(#waterDeep)" />
        {/* Surface highlight band */}
        <path
          d={buildWave(waveOffset, 5, 3)}
          fill="url(#waterSurface)"
          style={{ mixBlendMode: "screen" }}
        />
        {/* Secondary wave for depth */}
        <path d={buildWave(waveOffset * 1.4 + 2, 3, 5)} fill="#4fb3d9" opacity="0.25" />
        {/* Specular highlight on water surface */}
        <ellipse cx={tankX + tankW * 0.3} cy={waterY + 2} rx={tankW * 0.18} ry="2" fill="#ffffff" opacity="0.55" />
        <ellipse cx={tankX + tankW * 0.7} cy={waterY + 3} rx={tankW * 0.1} ry="1.5" fill="#ffffff" opacity="0.4" />

        {/* Bubbles */}
        {pumpOn && level > 10 && (
          <>
            {[
              { cx: 150, delay: 0, dur: 2.4, r: 3 },
              { cx: 200, delay: 0.6, dur: 2.8, r: 2 },
              { cx: 280, delay: 1.2, dur: 2.2, r: 2.5 },
              { cx: 320, delay: 0.3, dur: 3, r: 1.8 },
              { cx: 175, delay: 1.8, dur: 2.6, r: 2.2 },
            ].map((b, i) => (
              <circle key={i} cx={b.cx} r={b.r} fill="#ffffff" opacity="0.7" stroke="#aee3f5" strokeWidth="0.5">
                <animate
                  attributeName="cy"
                  from={tankY + tankH - 20}
                  to={waterY + 8}
                  dur={`${b.dur}s`}
                  begin={`${b.delay}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0;0.8;0.8;0"
                  dur={`${b.dur}s`}
                  begin={`${b.delay}s`}
                  repeatCount="indefinite"
                />
              </circle>
            ))}
          </>
        )}
      </g>

      {/* Tank glass overlay (reflections) */}
      <rect
        x={tankX}
        y={tankY}
        width={tankW}
        height={tankH}
        rx="14"
        fill="url(#tankGlass)"
        pointerEvents="none"
      />
      <rect
        x={tankX}
        y={tankY}
        width={tankW}
        height={tankH}
        rx="14"
        fill="url(#tankShadow)"
        pointerEvents="none"
      />
      {/* Bright vertical highlight strip */}
      <rect x={tankX + 14} y={tankY + 14} width="6" height={tankH - 28} fill="#ffffff" opacity="0.3" rx="3" />
      <rect x={tankX + tankW - 22} y={tankY + 14} width="3" height={tankH - 28} fill="#ffffff" opacity="0.18" rx="2" />

      {/* Tank frame */}
      <rect
        x={tankX}
        y={tankY}
        width={tankW}
        height={tankH}
        rx="14"
        fill="none"
        stroke="#1a1f26"
        strokeWidth="3"
      />

      {/* Tank top cap with bolts */}
      <rect x={tankX - 8} y={tankY - 18} width={tankW + 16} height="22" rx="4" fill="url(#tankCap)" stroke="#0a0e14" strokeWidth="1.5" />
      {[0, 1, 2, 3, 4].map((i) => {
        const cx = tankX + 16 + i * ((tankW - 32) / 4);
        return <circle key={i} cx={cx} cy={tankY - 7} r="3" fill="#5a6470" stroke="#0a0e14" strokeWidth="0.5" />;
      })}

      {/* Tank base/stand */}
      <rect x={tankX - 14} y={tankY + tankH} width={tankW + 28} height="14" rx="3" fill="url(#tankCap)" stroke="#0a0e14" strokeWidth="1.5" />
      <rect x={tankX - 4} y={tankY + tankH + 14} width="20" height="40" fill="#2c333d" stroke="#0a0e14" strokeWidth="1" />
      <rect x={tankX + tankW - 16} y={tankY + tankH + 14} width="20" height="40" fill="#2c333d" stroke="#0a0e14" strokeWidth="1" />

      {/* Level scale on right side */}
      <rect x={tankX + tankW + 6} y={tankY + 8} width="22" height={tankH - 16} fill="#1a1f26" rx="2" opacity="0.6" />
      {[0, 25, 50, 75, 100].map((m) => {
        const y = tankY + tankH - innerPad - (waterMaxH * m) / 100;
        return (
          <g key={m}>
            <line x1={tankX + tankW + 8} y1={y} x2={tankX + tankW + 26} y2={y} stroke="#aee3f5" strokeWidth="1.2" />
            <text x={tankX + tankW + 32} y={y + 3} fontSize="10" fill="#aee3f5" fontFamily="monospace" fontWeight="bold">
              {m}
            </text>
          </g>
        );
      })}
      {/* Minor ticks */}
      {Array.from({ length: 21 }).map((_, i) => {
        if (i % 5 === 0) return null;
        const y = tankY + tankH - innerPad - (waterMaxH * i * 5) / 100;
        return <line key={i} x1={tankX + tankW + 8} y1={y} x2={tankX + tankW + 16} y2={y} stroke="#aee3f5" strokeWidth="0.7" opacity="0.7" />;
      })}

      {/* Digital level display */}
      <g>
        <rect x={tankX + tankW / 2 - 38} y={tankY - 60} width="76" height="34" rx="5" fill="#0a0e14" stroke="#2c333d" strokeWidth="2" />
        <rect x={tankX + tankW / 2 - 35} y={tankY - 57} width="70" height="28" rx="3" fill="#001a0d" />
        <text
          x={tankX + tankW / 2}
          y={tankY - 36}
          fontSize="20"
          fontWeight="bold"
          textAnchor="middle"
          fill="#22ff88"
          fontFamily="'Courier New', monospace"
          style={{ filter: "drop-shadow(0 0 3px #22ff88)" }}
        >
          {level.toFixed(1)}%
        </text>
      </g>

      {/* ========= MOTOR PUMP ========= */}
      <g transform="translate(0, 470)">
        {/* Base plate */}
        <rect x="8" y="55" width="140" height="10" rx="2" fill="#1a1f26" />
        <rect x="8" y="55" width="140" height="10" rx="2" fill="url(#pipeMetalH)" opacity="0.4" />

        {/* Motor cylindrical body */}
        <rect x="20" y="10" width="100" height="48" rx="6" fill="url(#motorBody)" stroke="#0a1428" strokeWidth="1.5" />
        {/* Cooling fins on motor */}
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <line key={i} x1={28 + i * 13} y1="14" x2={28 + i * 13} y2="54" stroke="#0a1428" strokeWidth="1.2" opacity="0.7" />
        ))}
        {/* Motor highlight */}
        <rect x="22" y="12" width="96" height="10" rx="4" fill="#ffffff" opacity="0.18" />

        {/* Pump housing (left circular part) */}
        <circle cx="20" cy="34" r="26" fill="url(#motorCap)" stroke="#0a1428" strokeWidth="1.5" />
        <circle cx="20" cy="34" r="20" fill="#1a1f26" stroke="#0a1428" strokeWidth="1" />
        <circle cx="20" cy="34" r="18" fill="none" stroke="#3a4250" strokeWidth="1" />

        {/* Spinning impeller/fan inside pump housing */}
        <g transform="translate(20, 34)">
          <g>
            {pumpOn && (
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0"
                to="360"
                dur="0.25s"
                repeatCount="indefinite"
              />
            )}
            {[0, 60, 120, 180, 240, 300].map((angle) => (
              <path
                key={angle}
                d="M 0 0 Q 4 -8 2 -16 L -2 -16 Q -4 -8 0 0 Z"
                fill={pumpOn ? "#888" : "#5a6470"}
                stroke="#0a0e14"
                strokeWidth="0.5"
                transform={`rotate(${angle})`}
              />
            ))}
            <circle r="4" fill="url(#fanHub)" stroke="#0a0e14" strokeWidth="0.5" />
          </g>
        </g>

        {/* Pump suction port (bottom) connecting down */}
        <rect x="14" y="58" width="12" height="6" fill="url(#pipeMetal)" />

        {/* Motor cap right side */}
        <circle cx="120" cy="34" r="14" fill="url(#motorCap)" stroke="#0a1428" strokeWidth="1.5" />
        <circle cx="120" cy="34" r="10" fill="none" stroke="#3a4250" strokeWidth="1" />
        <circle cx="120" cy="34" r="2" fill="#0a0e14" />

        {/* Status LED */}
        <circle cx="135" cy="20" r="5" fill={pumpOn ? "url(#ledOn)" : "url(#ledOff)"} stroke="#0a0e14" strokeWidth="1" />
        {pumpOn && (
          <circle cx="135" cy="20" r="9" fill="#22cc66" opacity="0.4" filter="url(#softGlow)">
            <animate attributeName="opacity" values="0.5;0.15;0.5" dur="1.2s" repeatCount="indefinite" />
          </circle>
        )}

        {/* Brand label */}
        <rect x="40" y="28" width="60" height="14" rx="2" fill="#0a1428" stroke="#3a4250" strokeWidth="0.5" />
        <text x="70" y="38" fontSize="8" textAnchor="middle" fill="#aee3f5" fontFamily="monospace" fontWeight="bold" letterSpacing="1">
          AQUA-PUMP
        </text>

        {/* Bolt details on base */}
        {[20, 50, 100, 130].map((x) => (
          <circle key={x} cx={x} cy="60" r="2" fill="#3a4250" stroke="#0a0e14" strokeWidth="0.5" />
        ))}
      </g>

      {/* Pump-side suction connection (small vertical pipe from pump up to suction line) */}
      <rect x="22" y="500" width="22" height="30" fill="url(#pipeMetal)" />

      {/* Ground line */}
      <line x1="0" y1="535" x2="500" y2="535" stroke="#1a1f26" strokeWidth="2" />
      <line x1="0" y1="540" x2="500" y2="540" stroke="#1a1f26" strokeWidth="1" opacity="0.4" />
    </svg>
  );
}
