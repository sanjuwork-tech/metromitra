"use client";
// The signature brand motif: a living metro-map fragment rendered as SVG.
// Stations are nodes; lines are coloured connections. Two nodes pulse to
// suggest activity. Pure CSS/SVG — no WebGL — and respects reduced motion.
import { motion } from "framer-motion";
import { LINE_COLOR_HEX } from "@/lib/stations-data";

type NodeT = { x: number; y: number; label: string; code: string; active?: boolean };
type LineT = { color: string; path: string };

const nodes: NodeT[] = [
  { x: 60, y: 140, label: "Rajiv Chowk", code: "RJC", active: true },
  { x: 180, y: 80, label: "Indiranagar", code: "IND", active: true },
  { x: 180, y: 200, label: "MG Road", code: "MGR" },
  { x: 320, y: 140, label: "Cubbon Park", code: "CSB" },
  { x: 320, y: 240, label: "Majestic", code: "KRP", active: true },
  { x: 440, y: 80, label: "Baiyappanahalli", code: "BYH" },
  { x: 440, y: 200, label: "Yeshwanthpur", code: "YSR" },
];

const lines: LineT[] = [
  { color: LINE_COLOR_HEX.purple, path: "M 60 140 L 180 80 L 320 140 L 440 80" },
  { color: LINE_COLOR_HEX.green, path: "M 60 140 L 180 200 L 320 240 L 440 200" },
  { color: LINE_COLOR_HEX.yellow, path: "M 180 80 L 180 200" },
];

export function MetroMapHero() {
  return (
    <div className="relative aspect-[5/4] w-full overflow-hidden rounded-xl border border-border bg-card">
      <svg
        viewBox="0 0 500 300"
        className="h-full w-full"
        role="img"
        aria-label="A schematic of metro stations connected by coloured lines, illustrating the MetroMitra community concept."
      >
        {/* faint grid */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--border)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="500" height="300" fill="url(#grid)" opacity="0.4" />

        {/* lines */}
        {lines.map((l, i) => (
          <path
            key={i}
            d={l.path}
            fill="none"
            stroke={l.color}
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.85"
          />
        ))}

        {/* nodes */}
        {nodes.map((n) => (
          <g key={n.code}>
            <circle
              cx={n.x}
              cy={n.y}
              r="9"
              fill="var(--card)"
              stroke={n.active ? "var(--primary)" : "var(--muted-foreground)"}
              strokeWidth="3"
            />
            {n.active && (
              <motion.circle
                cx={n.x}
                cy={n.y}
                r="9"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="2"
                initial={{ r: 9, opacity: 0.7 }}
                animate={{ r: 18, opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
              />
            )}
            <text
              x={n.x}
              y={n.y - 16}
              textAnchor="middle"
              className="fill-foreground"
              style={{ fontSize: "11px", fontWeight: 600 }}
            >
              {n.code}
            </text>
            <text
              x={n.x}
              y={n.y + 24}
              textAnchor="middle"
              className="fill-muted-foreground"
              style={{ fontSize: "9px" }}
            >
              {n.label}
            </text>
          </g>
        ))}

        {/* "connection" between two active nodes — the promise visualised */}
        <motion.path
          d="M 60 140 Q 120 30 180 80"
          fill="none"
          stroke="var(--primary)"
          strokeWidth="2"
          strokeDasharray="4 4"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.6, ease: "easeInOut", delay: 0.4 }}
        />
      </svg>

      <div className="absolute bottom-3 right-3 rounded-md bg-background/85 px-2.5 py-1 text-[10px] text-muted-foreground backdrop-blur">
        Schematic illustration · not to scale
      </div>
    </div>
  );
}
