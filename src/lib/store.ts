// 「我的猫」的数据层：全部存在这台设备的 localStorage 里，不上传。
// 结构改动时提高 VERSION，并在 migrate() 里把旧数据转过来。

export const STORAGE_KEY = 'catcare:data';
const VERSION = 2; // 2：加了疫苗和驱虫记录 care

export type Sex = '公' | '母';
export type Level = 'less' | 'normal' | 'more';
export type Energy = 'low' | 'normal' | 'high';
export type Appetite = 'none' | Level;
export type UrineSize = 's' | 'm' | 'l';

export interface Cat {
  id: string;
  name: string;
  sex: Sex;
  neutered: boolean;
  birth: string; // YYYY-MM-DD，可以为空
  breed: string;
  createdAt: string;
}

/** 数了几次、数了多久。呼吸和心跳都用这个结构。 */
export interface Breathing {
  count: number; // 实际数到的次数
  seconds: 15 | 30 | 60; // 数了多久
}

export interface DayRecord {
  catId: string;
  date: string; // YYYY-MM-DD，每只猫每天一条
  breathing?: Breathing;
  heart?: Breathing; // 安静时心跳
  appetite?: Appetite;
  water?: Level;
  urineCount?: number;
  urineSize?: UrineSize;
  stoolCount?: number;
  stoolScore?: number; // 1–7
  energy?: Energy;
  weight?: number; // 公斤
  bcs?: number; // 体型评分，9 分制
  note?: string;
}

/** 打疫苗、驱虫，一次一条。不是每天都有，所以和 DayRecord 分开存。 */
export type CareKind = 'vaccine' | 'deworm';
export type DewormScope = 'internal' | 'external' | 'both';

export interface CareEvent {
  id: string;
  catId: string;
  kind: CareKind;
  date: string; // YYYY-MM-DD
  scope?: DewormScope; // 只有驱虫有：体内、体外还是体内外一起
  product: string; // 疫苗或药的名字，可以为空
  place: string; // 在哪里打的、做的，可以为空
  next?: string; // 兽医或说明书说的下次日期，填了才会提醒
  note?: string;
}

export interface Data {
  version: number;
  cats: Cat[];
  records: DayRecord[];
  care: CareEvent[];
}

const empty = (): Data => ({ version: VERSION, cats: [], records: [], care: [] });

function migrate(raw: unknown): Data {
  if (!raw || typeof raw !== 'object') return empty();
  const d = raw as Partial<Data>;
  return {
    version: VERSION,
    cats: Array.isArray(d.cats) ? d.cats : [],
    records: Array.isArray(d.records) ? d.records : [],
    care: Array.isArray(d.care) ? d.care : [], // 版本 1 没有这一项
  };
}

export function load(): Data {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    return s ? migrate(JSON.parse(s)) : empty();
  } catch {
    return empty();
  }
}

/** 保存成功返回 true；隐私模式或存储满了会返回 false。 */
export function save(d: Data): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
    window.dispatchEvent(new Event('catcare:change'));
    return true;
  } catch {
    return false;
  }
}

export function newId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export function today() {
  const d = new Date();
  return toISO(d);
}

export function toISO(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function addDays(iso: string, n: number) {
  const [y, m, d] = iso.split('-').map(Number);
  return toISO(new Date(y, m - 1, d + n));
}

export function breathsPerMinute(b: Breathing) {
  return Math.round((b.count * 60) / b.seconds);
}

export function recordsOf(d: Data, catId: string) {
  return d.records.filter((r) => r.catId === catId).sort((a, b) => a.date.localeCompare(b.date));
}

export function upsertRecord(d: Data, rec: DayRecord): Data {
  const others = d.records.filter((r) => !(r.catId === rec.catId && r.date === rec.date));
  return { ...d, records: [...others, rec] };
}

/** 这只猫的疫苗和驱虫记录，新的在前 */
export function careOf(d: Data, catId: string) {
  return d.care.filter((e) => e.catId === catId).sort((a, b) => b.date.localeCompare(a.date));
}

export function upsertCare(d: Data, ev: CareEvent): Data {
  return { ...d, care: [...d.care.filter((e) => e.id !== ev.id), ev] };
}

export function removeCare(d: Data, id: string): Data {
  return { ...d, care: d.care.filter((e) => e.id !== id) };
}

/** 三条线分开提醒：疫苗、体内驱虫、体外驱虫。「体内外」两条线都算。 */
export const CARE_TRACKS = [
  { id: 'vaccine', label: '疫苗', covers: (e: CareEvent) => e.kind === 'vaccine' },
  { id: 'internal', label: '体内驱虫', covers: (e: CareEvent) => e.kind === 'deworm' && e.scope !== 'external' },
  { id: 'external', label: '体外驱虫', covers: (e: CareEvent) => e.kind === 'deworm' && e.scope !== 'internal' },
] as const;

export interface CareStatus {
  id: (typeof CARE_TRACKS)[number]['id'];
  label: string;
  last?: CareEvent; // 最近一次
  next?: string; // 最近一次写的下次日期
  daysLeft?: number; // 离下次还有几天，过了是负数
}

export function daysBetween(from: string, to: string) {
  const [y1, m1, d1] = from.split('-').map(Number);
  const [y2, m2, d2] = to.split('-').map(Number);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000);
}

export function careStatus(events: CareEvent[], on = today()): CareStatus[] {
  return CARE_TRACKS.map((t) => {
    const last = events.filter(t.covers).sort((a, b) => b.date.localeCompare(a.date))[0];
    const next = last?.next;
    return { id: t.id, label: t.label, last, next, daysLeft: next ? daysBetween(on, next) : undefined };
  });
}

/** 7 天内到期或已经过期的 */
export function careDue(events: CareEvent[], on = today()) {
  return careStatus(events, on).filter((s) => s.daysLeft !== undefined && s.daysLeft <= 7);
}

export function ageText(birth: string, on = today()) {
  if (!birth) return '';
  const [by, bm, bd] = birth.split('-').map(Number);
  const [ty, tm, td] = on.split('-').map(Number);
  let months = (ty - by) * 12 + (tm - bm) - (td < bd ? 1 : 0);
  if (months < 0) return '';
  if (months < 12) return `${months} 个月`;
  const y = Math.floor(months / 12);
  months %= 12;
  return months ? `${y} 岁 ${months} 个月` : `${y} 岁`;
}

// 备份：导出成 JSON 文件，或从文件导入（覆盖前由页面确认）
export function exportFile(d: Data) {
  const blob = new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `猫咪记录备份-${today()}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export async function parseBackup(file: File): Promise<Data> {
  const raw = JSON.parse(await file.text());
  if (!raw || !Array.isArray(raw.cats) || !Array.isArray(raw.records)) {
    throw new Error('这不是猫咪记录的备份文件');
  }
  return migrate(raw);
}
