import { addDays, type DayRecord } from '../../lib/store';

interface Row {
  label: string;
  get: (r: DayRecord) => string | undefined;
  normal: string;
  short: Record<string, string>;
}

const ROWS: Row[] = [
  { label: '食量', get: (r) => r.appetite, normal: 'normal', short: { none: '没', less: '少', more: '多' } },
  { label: '饮水', get: (r) => r.water, normal: 'normal', short: { less: '少', more: '多' } },
  { label: '精神', get: (r) => r.energy, normal: 'normal', short: { low: '差', high: '旺' } },
];

interface Props {
  records: DayRecord[];
  end: string;
  days?: number;
}

/** 食量、饮水、精神这类「正常 / 不正常」的记录，一天一格。 */
export function DotStrip({ records, end, days = 30 }: Props) {
  const start = addDays(end, -(days - 1));
  const dates = Array.from({ length: days }, (_, i) => addDays(start, i));
  const byDate = new Map(records.map((r) => [r.date, r]));

  return (
    <figure class="strip card">
      <figcaption class="trend-head">
        <span class="trend-label">吃喝和精神</span>
        <span class="trend-range">
          最近 <span class="days-long">{days}</span><span class="days-short">14</span> 天 · 灰色是正常，橙色标字是和平时不一样，空白是没记
        </span>
      </figcaption>
      {ROWS.map((row) => (
        <div class="strip-row">
          <span class="strip-label">{row.label}</span>
          <span class="strip-cells">
            {dates.map((d) => {
              const rec = byDate.get(d);
              const v = rec ? row.get(rec) : undefined;
              const state = v === undefined ? 'none' : v === row.normal ? 'ok' : 'off';
              return (
                <span class={`cell ${state}`} title={`${d}：${v === undefined ? '没记' : v === row.normal ? '正常' : row.short[v]}`}>
                  {state === 'off' ? row.short[v!] : ''}
                </span>
              );
            })}
          </span>
        </div>
      ))}
    </figure>
  );
}
