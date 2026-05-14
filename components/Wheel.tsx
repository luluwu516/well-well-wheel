"use client";

import { motion, useAnimationControls } from "framer-motion";
import { useMemo, useState } from "react";
import type { Game } from "@/lib/types";
import type { AllowedWeight } from "@/lib/weight";

export type WheelSlot = { game: Game; weight: AllowedWeight };

const SLICE_COLORS = [
  "#FFB6C1", // berry
  "#B9F3DC", // mint
  "#C5B9FF", // lavender
  "#FFAA77", // tangerine
  "#FFF4D6", // cream
];

const SIZE = 420;
const RADIUS = SIZE / 2 - 8;
const CX = SIZE / 2;
const CY = SIZE / 2;

export function Wheel({
  slots,
  onResult,
}: {
  slots: WheelSlot[];
  onResult: (game: Game) => void;
}) {
  const controls = useAnimationControls();
  const [spinning, setSpinning] = useState(false);
  const [angle, setAngle] = useState(0);

  // Expand slots into per-slice array (weight * 2 to support 0.5x).
  // Round-robin so duplicate-weighted games are interleaved instead of grouped:
  // e.g. A=1x, B=2x → [A, B, A, B, B, B] rather than [A, A, B, B, B, B].
  const expanded = useMemo(() => {
    const counts = slots.map((s) => Math.round(s.weight * 2));
    const games = slots.map((s) => s.game);
    const total = counts.reduce((a, b) => a + b, 0);
    const out: Game[] = [];
    while (out.length < total) {
      for (let i = 0; i < counts.length; i++) {
        if (counts[i] > 0) {
          out.push(games[i]);
          counts[i]--;
        }
      }
    }
    return out;
  }, [slots]);

  const sliceDeg = expanded.length > 0 ? 360 / expanded.length : 0;

  async function spin() {
    if (spinning || expanded.length === 0) return;
    setSpinning(true);
    const winnerIndex = Math.floor(Math.random() * expanded.length);
    const winner = expanded[winnerIndex];

    // Random jitter within the winner slice, but staying away from edges
    const jitter = (Math.random() - 0.5) * sliceDeg * 0.6;
    const centerDeg = (winnerIndex + 0.5) * sliceDeg + jitter;
    const spinCount = 5 + Math.floor(Math.random() * 4);

    // Compute a rotation strictly greater than current `angle`
    const current = angle;
    const currentMod = ((current % 360) + 360) % 360;
    const targetMod = ((-centerDeg) % 360 + 360) % 360;
    let delta = targetMod - currentMod;
    if (delta <= 0) delta += 360;
    const next = current + 360 * spinCount + delta;

    await controls.start({
      rotate: next,
      transition: { duration: 4.5, ease: [0.17, 0.67, 0.21, 1] },
    });
    setAngle(next);
    setSpinning(false);
    onResult(winner);
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        {/* Static shadow disc (does not rotate) */}
        <div
          aria-hidden
          className="absolute rounded-full border-[3px] border-cocoa bg-white shadow-[6px_6px_0_0_var(--cocoa)]"
          style={{ left: 4, top: 4, right: 4, bottom: 4 }}
        />

        {/* Pointer (above wheel) */}
        <div
          className="absolute left-1/2 -translate-x-1/2 -top-2 z-20"
          style={{
            width: 0,
            height: 0,
            borderLeft: "18px solid transparent",
            borderRight: "18px solid transparent",
            borderTop: "32px solid var(--cocoa)",
            filter: "drop-shadow(0 2px 0 white)",
          }}
        />
        <motion.svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          animate={controls}
          style={{ originX: 0.5, originY: 0.5 }}
          className="relative z-10"
        >
          {expanded.map((game, i) => {
            const start = -90 + i * sliceDeg;
            const end = -90 + (i + 1) * sliceDeg;
            const path = arcPath(CX, CY, RADIUS, start, end);
            const mid = (start + end) / 2;
            const labelR = RADIUS * 0.62;
            const lx = CX + labelR * Math.cos((mid * Math.PI) / 180);
            const ly = CY + labelR * Math.sin((mid * Math.PI) / 180);
            return (
              <g key={`${game.id}-${i}`}>
                <path
                  d={path}
                  fill={SLICE_COLORS[i % SLICE_COLORS.length]}
                  stroke="var(--cocoa)"
                  strokeWidth={2}
                />
                <g transform={`translate(${lx}, ${ly}) rotate(${mid + 90})`}>
                  <text
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={sliceDeg < 18 ? 10 : 13}
                    fontWeight={700}
                    fill="var(--cocoa)"
                    style={{ pointerEvents: "none" }}
                  >
                    {truncate(game.title, sliceDeg < 18 ? 6 : 10)}
                  </text>
                </g>
              </g>
            );
          })}
          <circle
            cx={CX}
            cy={CY}
            r={28}
            fill="var(--cocoa)"
            stroke="white"
            strokeWidth={4}
          />
        </motion.svg>
      </div>
      <button
        type="button"
        onClick={spin}
        disabled={spinning || expanded.length < 2}
        className="btn-sticker active:btn-sticker-active bg-tangerine text-xl px-8 py-4 disabled:opacity-50"
      >
        {spinning ? "Spinning…" : "🎲 Spin"}
      </button>
    </div>
  );
}

function arcPath(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number,
): string {
  const start = (startDeg * Math.PI) / 180;
  const end = (endDeg * Math.PI) / 180;
  const x1 = cx + r * Math.cos(start);
  const y1 = cy + r * Math.sin(start);
  const x2 = cx + r * Math.cos(end);
  const y2 = cy + r * Math.sin(end);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n) + "…" : s;
}
