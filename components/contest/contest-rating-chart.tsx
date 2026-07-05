"use client";

import { useId, useMemo, useState } from "react";

export type ContestRatingPoint = {
  rating: number;
  title: string;
  slug: string;
  rank: number;
  delta: number;
  date: string;
};

type Props = Readonly<{
  points: ContestRatingPoint[];
}>;

const WIDTH = 640;
const HEIGHT = 240;
const PADDING = { top: 24, right: 20, bottom: 32, left: 44 };

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleDateString(undefined, { month: "short", year: "numeric" });
}

export default function ContestRatingChart({ points }: Props) {
  const gradientId = useId();
  const [active, setActive] = useState<number | null>(null);

  const geometry = useMemo(() => {
    const innerWidth = WIDTH - PADDING.left - PADDING.right;
    const innerHeight = HEIGHT - PADDING.top - PADDING.bottom;
    const ratings = points.map((point) => point.rating);
    const rawMin = Math.min(...ratings);
    const rawMax = Math.max(...ratings);
    const span = rawMax - rawMin || 1;
    const pad = Math.max(Math.round(span * 0.2), 20);
    const min = rawMin - pad;
    const max = rawMax + pad;

    const xFor = (index: number) =>
      points.length === 1
        ? PADDING.left + innerWidth / 2
        : PADDING.left + (innerWidth * index) / (points.length - 1);
    const yFor = (rating: number) =>
      PADDING.top + innerHeight - ((rating - min) / (max - min)) * innerHeight;

    const coords = points.map((point, index) => ({
      x: xFor(index),
      y: yFor(point.rating),
    }));

    const line = coords
      .map((coord, index) => `${index === 0 ? "M" : "L"} ${coord.x} ${coord.y}`)
      .join(" ");
    const area =
      coords.length > 0
        ? `${line} L ${coords[coords.length - 1].x} ${PADDING.top + innerHeight} L ${coords[0].x} ${PADDING.top + innerHeight} Z`
        : "";

    const ticks = [min, Math.round((min + max) / 2), max];
    const tickCoords = ticks.map((rating) => ({ rating, y: yFor(rating) }));

    return { coords, line, area, tickCoords };
  }, [points]);

  if (points.length === 0) {
    return null;
  }

  const activePoint = active === null ? null : points[active];
  const activeCoord = active === null ? null : geometry.coords[active];

  return (
    <div className="contest-rating-chart">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label="Contest rating over time"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {geometry.tickCoords.map((tick) => (
          <g key={tick.rating} className="contest-rating-chart__grid">
            <line x1={PADDING.left} y1={tick.y} x2={WIDTH - PADDING.right} y2={tick.y} />
            <text x={PADDING.left - 10} y={tick.y + 4} textAnchor="end">
              {tick.rating}
            </text>
          </g>
        ))}

        {geometry.area ? <path d={geometry.area} fill={`url(#${gradientId})`} /> : null}
        <path className="contest-rating-chart__line" d={geometry.line} />

        {geometry.coords.map((coord, index) => (
          <a
            key={`${points[index].date}-${index}`}
            href={`/contests/${points[index].slug}`}
            aria-label={`${points[index].title}: rating ${points[index].rating}`}
            onMouseEnter={() => setActive(index)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(index)}
            onBlur={() => setActive(null)}
          >
            <circle
              className={`contest-rating-chart__dot${active === index ? " is-active" : ""}`}
              cx={coord.x}
              cy={coord.y}
              r={active === index ? 5 : 3.5}
            />
            <circle className="contest-rating-chart__hit" cx={coord.x} cy={coord.y} r={16} />
          </a>
        ))}

        {activePoint && activeCoord ? (
          <line
            className="contest-rating-chart__marker"
            x1={activeCoord.x}
            y1={PADDING.top}
            x2={activeCoord.x}
            y2={HEIGHT - PADDING.bottom}
          />
        ) : null}
      </svg>

      {activePoint && activeCoord ? (
        <div
          className="contest-rating-chart__tooltip"
          style={{
            left: `${(activeCoord.x / WIDTH) * 100}%`,
            top: `${(activeCoord.y / HEIGHT) * 100}%`,
          }}
        >
          <strong>{activePoint.title}</strong>
          <span>Rating {activePoint.rating}</span>
          <span>
            #{activePoint.rank} · {activePoint.delta >= 0 ? "+" : ""}
            {activePoint.delta}
          </span>
          <span className="contest-rating-chart__tooltip-date">{formatDate(activePoint.date)}</span>
        </div>
      ) : null}
    </div>
  );
}
