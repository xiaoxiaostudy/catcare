// 「我的猫」的数据层：全部存在这台设备的 localStorage 里，不上传。
// 结构改动时提高 VERSION，并在 migrate() 里把旧数据转过来。

export const STORAGE_KEY = 'catcare:data';
const VERSION = 1;

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

export interface Breathing {
  count: number; // 实际数到的次数
  seconds: 15 | 30 | 60; // 数了多久
}

export interface DayRecord {
  catId: string;
  date: string; // YYYY-MM-DD，每只猫每天一条
  breathing?: Breathing;
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

export interface Data {
  version: number;
  cats: Cat[];
  records: DayRecord[];
}

const empty = (): Data => ({ version: VERSION, cats: [], records: [] });

function migrate(raw: unknown): Data {
  if (!raw || typeof raw !== 'object') return empty();
  const d = raw as Partial<Data>;
  return {
    version: VERSION,
    cats: Array.isArray(d.cats) ? d.cats : [],
    records: Array.isArray(d.records) ? d.records : [],
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
