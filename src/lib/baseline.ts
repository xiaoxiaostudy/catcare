// 「它自己的正常范围」：用这只猫最近 30 天（不含当天）的记录算出一个范围，
// 像 Apple 健康那样把超出范围的点标出来。记录少于 MIN_DAYS 天时还不算。

import { addDays, breathsPerMinute, type Cat, type DayRecord } from './store';

export const MIN_DAYS = 5;
const WINDOW = 30;

export type MetricId = 'breathing' | 'urineCount' | 'stoolCount' | 'weight' | 'heart';

export interface Metric {
  id: MetricId;
  label: string;
  unit: string;
  get: (r: DayRecord) => number | undefined;
  /** 体重这类会随成长变化的指标，不画正常范围，只看趋势 */
  band: boolean;
  digits?: number;
}

export const METRICS: Metric[] = [
  { id: 'breathing', label: '睡着时呼吸', unit: '次/分', get: (r) => (r.breathing ? breathsPerMinute(r.breathing) : undefined), band: true },
  { id: 'urineCount', label: '排尿次数', unit: '次/天', get: (r) => r.urineCount, band: true },
  { id: 'stoolCount', label: '排便次数', unit: '次/天', get: (r) => r.stoolCount, band: true },
  { id: 'weight', label: '体重', unit: '公斤', get: (r) => r.weight, band: false, digits: 2 },
  // 心跳只画趋势和范围，不做提醒：笔记里还没有心跳的就医红线
  { id: 'heart', label: '安静时心跳', unit: '次/分', get: (r) => (r.heart ? breathsPerMinute(r.heart) : undefined), band: true },
];

export interface Range {
  low: number;
  high: number;
  n: number;
}

function quantile(sorted: number[], q: number) {
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

/** 截止到 date（不含）之前 30 天的正常范围；记录不够时返回 n 但没有 low/high。 */
export function rangeBefore(records: DayRecord[], metric: Metric, date: string): Range | { n: number } {
  const from = addDays(date, -WINDOW);
  const values = records
    .filter((r) => r.date >= from && r.date < date)
    .map(metric.get)
    .filter((v): v is number => v !== undefined)
    .sort((a, b) => a - b);
  if (values.length < MIN_DAYS) return { n: values.length };
  // 去掉两头各 10%，免得一两天的特殊情况把范围撑大
  return { low: quantile(values, 0.1), high: quantile(values, 0.9), n: values.length };
}

export const hasRange = (r: Range | { n: number }): r is Range => 'low' in r;

export type Direction = 'above' | 'below';

export function compare(value: number, range: Range): Direction | undefined {
  // 计数类的数据是整数，范围两端先取整再比，避免 2.4 这种小数边界误报
  const low = Math.floor(range.low);
  const high = Math.ceil(range.high);
  if (value > high) return 'above';
  if (value < low) return 'below';
  return undefined;
}

export function fmtRange(r: Range, metric: Metric) {
  const d = metric.digits ?? 0;
  const low = d ? r.low.toFixed(d) : String(Math.floor(r.low));
  const high = d ? r.high.toFixed(d) : String(Math.ceil(r.high));
  return low === high ? low : `${low}–${high}`;
}

// 当天值得留意的事：只说「和它平时不一样」，再指向笔记和急症清单里对应的条目
export interface Alert {
  level: 'now' | 'soon' | 'call' | 'info';
  text: string;
  link?: { href: string; label: string };
}

export function alertsFor(cat: Cat, records: DayRecord[], date: string, base: string): Alert[] {
  const rec = records.find((r) => r.date === date);
  if (!rec) return [];
  const out: Alert[] = [];
  const sos = (id: string) => `${base}emergency/#${id}`;

  const bpm = METRICS[0];
  const b = bpm.get(rec);
  if (b !== undefined) {
    const range = rangeBefore(records, bpm, date);
    if (hasRange(range) && compare(b, range) === 'above') {
      out.push({
        level: 'soon',
        text: `今天睡着时呼吸 ${b} 次/分，比它平时（${fmtRange(range, bpm)}）快。先在两三个小时内多数几次确认；持续偏快就尽快联系兽医。`,
        link: { href: sos('fast-breathing'), label: '急症清单：睡着时呼吸持续偏快' },
      });
    }
  }

  if (rec.urineCount !== undefined) {
    const m = METRICS[1];
    const range = rangeBefore(records, m, date);
    const low = rec.urineCount === 0 || (hasRange(range) && compare(rec.urineCount, range) === 'below');
    if (low && cat.sex === '公') {
      out.push({
        level: 'now',
        text: '今天排尿比平时少。如果它反复去砂盆却几乎没有尿，这是急症，立刻联系兽医或去急诊。',
        link: { href: sos('blocked'), label: '急症清单：公猫反复去砂盆，几乎没有尿' },
      });
    } else if (hasRange(range) && compare(rec.urineCount, range) === 'above') {
      out.push({
        level: 'call',
        text: `今天排尿 ${rec.urineCount} 次，比它平时（${fmtRange(range, m)}）多。如果喝水和尿量持续明显增多，联系兽医，不要自己限制喝水。`,
        link: { href: sos('drinking-more'), label: '急症清单：喝水或尿量突然明显增多' },
      });
    } else if (low) {
      out.push({ level: 'info', text: '今天排尿比平时少，留意一下它去砂盆的情况。' });
    }
  }

  // 连续没排便：从当天往前数
  let noStool = 0;
  for (let d = date; ; d = addDays(d, -1)) {
    const r = records.find((x) => x.date === d);
    if (!r || r.stoolCount !== 0) break;
    noStool++;
  }
  if (noStool >= 2) {
    out.push({
      level: 'call',
      text: `已经连续 ${noStool} 天记录为没排便。超过 48 小时没排便，联系兽医。`,
      link: { href: sos('constipation'), label: '急症清单：超过 48 小时没排便' },
    });
  }

  if (rec.appetite === 'none') {
    out.push({
      level: 'soon',
      text: '今天没吃东西。成年猫持续不吃约 24 小时，就要尽快联系兽医，不要等几天看看。',
      link: { href: sos('not-eating'), label: '急症清单：持续不吃东西' },
    });
  }

  if (rec.energy === 'low') {
    out.push({
      level: 'info',
      text: '今天比平时没精神。猫很会忍，留意它还有没有别的变化；找不到原因的明显变化，值得联系兽医。',
      link: { href: `${base}notes/subtle-changes/`, label: '笔记：猫很会忍，哪些细微变化要警惕' },
    });
  }

  const order = { now: 0, soon: 1, call: 2, info: 3 };
  return out.sort((a, b) => order[a.level] - order[b.level]);
}
