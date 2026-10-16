import { useEffect, useRef, useState } from 'preact/hooks';
import { addDays, type DayRecord } from '../../lib/store';
import { compare, fmtRange, hasRange, MIN_DAYS, rangeBefore, type Metric } from '../../lib/baseline';

interface Props {
  metric: Metric;
  records: DayRecord[];
  end: string;
  days?: number;
}

const H = 170;
const PAD = { top: 12, right: 12, bottom: 24, left: 34 };

function niceTicks(lo: number, hi: number, integer: boolean, count = 3) {
  const span = hi - lo || 1;
  const raw = span / (count - 1);
  const mag = 10 ** Math.floor(Math.log10(raw));
  const steps = (integer ? [1, 2, 5, 10] : [1, 2, 2.5, 5, 10]).map((m) => m * mag);
  const step = Math.max(integer ? 1 : 0, steps.find((s) => s >= raw) ?? raw);
  const start = Math.floor(lo / step) * step;
  const end = Math.ceil(hi / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= end + step * 0.001; v += step) ticks.push(Number(v.toFixed(6)));
  return ticks;
}

const md = (iso: string) => `${Number(iso.slice(5, 7))}月${Number(iso.slice(8, 10))}日`;

export function TrendChart({ metric, records, end, days = 30 }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  // 按容器的实际宽度画，手机上文字不会被缩小
  const plotRef = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(600);
  useEffect(() => {
    const el = plotRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setW(Math.max(260, Math.round(entry.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const start = addDays(end, -(days - 1));
  const dates = Array.from({ length: days }, (_, i) => addDays(start, i));
  const byDate = new Map(records.map((r) => [r.date, metric.get(r)]));
  const pts = dates
    .map((d, i) => ({ i, date: d, v: byDate.get(d) }))
    .filter((p): p is { i: number; date: string; v: number } => p.v !== undefined);

  const range = metric.band ? rangeBefore(records, metric, end) : undefined;
  const band = range && hasRange(range) ? range : undefined;
  const latest = pts.at(-1);
  const digits = metric.digits ?? 0;

  let lo = Math.min(...pts.map((p) => p.v), ...(band ? [band.low] : []));
  let hi = Math.max(...pts.map((p) => p.v), ...(band ? [band.high] : []));
  if (!metric.digits) lo = 0; // 计数类从 0 开始
  if (hi === lo) hi = lo + 1;
  const ticks = niceTicks(lo - (metric.digits ? (hi - lo) * 0.15 : 0), hi + (hi - lo) * 0.15, !metric.digits);
  const y0 = ticks[0];
  const y1 = ticks.at(-1)!;

  const x = (i: number) => PAD.left + (i / (days - 1)) * (W - PAD.left - PAD.right);
  const y = (v: number) => PAD.top + (1 - (v - y0) / (y1 - y0)) * (H - PAD.top - PAD.bottom);

  const line = pts.map((p, k) => `${k ? 'L' : 'M'} ${x(p.i).toFixed(1)} ${y(p.v).toFixed(1)}`).join(' ');
  const hovered = hover === null ? undefined : pts.find((p) => p.i === hover);

  const onMove = (e: PointerEvent) => {
    const svg = e.currentTarget as SVGSVGElement;
    const rect = svg.getBoundingClientRect();
    const sx = ((e.clientX - rect.left) / rect.width) * W;
    let best: number | null = null;
    let dist = Infinity;
    for (const p of pts) {
      const d = Math.abs(x(p.i) - sx);
      if (d < dist) {
        dist = d;
        best = p.i;
      }
    }
    setHover(best);
  };

  const flag = (v: number) => (band ? compare(v, band) : undefined);

  return (
    <figure class="trend card">
      <figcaption class="trend-head">
        <span class="trend-label">{metric.label}</span>
        <span class="trend-value">
          {latest ? (
            <>
              <b>{latest.v.toFixed(digits)}</b> {metric.unit}
              <small>{latest.date === end ? '今天' : md(latest.date)}</small>
            </>
          ) : (
            <small>这段时间没有记录</small>
          )}
        </span>
        <span class="trend-range">
          {!metric.band
            ? `最近 ${days} 天的变化`
            : band
              ? <>它的正常范围 <b>{fmtRange(band, metric)}</b> {metric.unit}</>
              : `还在建立正常范围（已记 ${range?.n ?? 0}/${MIN_DAYS} 天）`}
        </span>
      </figcaption>

      {pts.length > 0 && (
        <div class="trend-plot" ref={plotRef}>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            role="img"
            aria-label={`${metric.label}最近 ${days} 天的记录`}
            onPointerMove={onMove}
            onPointerDown={onMove}
            onPointerLeave={() => setHover(null)}
          >
            {ticks.map((t) => (
              <g>
                <line class="grid" x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} />
                <text class="tick" x={PAD.left - 8} y={y(t) + 4} text-anchor="end">
                  {t}
                </text>
              </g>
            ))}
            {band && <rect class="band" x={PAD.left} width={W - PAD.left - PAD.right} y={y(band.high)} height={Math.max(2, y(band.low) - y(band.high))} rx="4" />}
            <text class="tick" x={PAD.left} y={H - 6}>
              {md(start)}
            </text>
            <text class="tick" x={W - PAD.right} y={H - 6} text-anchor="end">
              {md(end)}
            </text>
            {hovered && <line class="crosshair" x1={x(hovered.i)} x2={x(hovered.i)} y1={PAD.top} y2={H - PAD.bottom} />}
            {pts.length > 1 && <path class="line" d={line} />}
            {pts.map((p) => (
              <circle class={flag(p.v) ? 'pt out' : 'pt'} cx={x(p.i)} cy={y(p.v)} r={hover === p.i ? 6 : 4.5} />
            ))}
          </svg>
          {hovered && (
            <div class="tip" style={{ left: `${(x(hovered.i) / W) * 100}%` }}>
              <span>{md(hovered.date)}</span>
              <b>
                {hovered.v.toFixed(digits)} {metric.unit}
              </b>
              {flag(hovered.v) && <em>{flag(hovered.v) === 'above' ? '高于平时' : '低于平时'}</em>}
            </div>
          )}
        </div>
      )}
    </figure>
  );
}
