import { useEffect, useState } from 'preact/hooks';
import { breathsPerMinute, type Breathing, type DayRecord } from '../../lib/store';
import { Segmented, Stepper } from './Segmented';
import { BASE } from './useData';
import BreathTimer from '../tools/BreathTimer';

interface Props {
  catId: string;
  date: string;
  existing?: DayRecord;
  onSave: (rec: DayRecord) => void;
}

const SECONDS: [string, string][] = [
  ['15', '15 秒'],
  ['30', '30 秒'],
  ['60', '60 秒'],
];

export function RecordForm({ catId, date, existing, onSave }: Props) {
  const [rec, setRec] = useState<DayRecord>(existing ?? { catId, date });
  const [count, setCount] = useState(existing?.breathing ? String(existing.breathing.count) : '');
  const [seconds, setSeconds] = useState<Breathing['seconds']>(existing?.breathing?.seconds ?? 30);
  const [saved, setSaved] = useState(false);
  const [timing, setTiming] = useState(false);

  // 换了日期或换了猫，表单重新载入那天的记录
  useEffect(() => {
    setRec(existing ?? { catId, date });
    setCount(existing?.breathing ? String(existing.breathing.count) : '');
    setSeconds(existing?.breathing?.seconds ?? 30);
    setSaved(false);
  }, [catId, date]);

  const set = <K extends keyof DayRecord>(k: K, v: DayRecord[K]) => {
    setSaved(false);
    setRec((r) => {
      const next = { ...r };
      if (v === undefined || v === '') delete next[k];
      else next[k] = v;
      return next;
    });
  };

  const n = Number(count);
  const breathing: Breathing | undefined = count && n > 0 ? { count: n, seconds } : undefined;

  const submit = (e: Event) => {
    e.preventDefault();
    const out = { ...rec, catId, date };
    if (breathing) out.breathing = breathing;
    else delete out.breathing;
    onSave(out);
    setSaved(true);
  };

  const num = (v: string) => (v === '' ? undefined : Number(v));

  return (
    <form class="record-form" onSubmit={submit}>
      <fieldset class="card">
        <legend>静息呼吸</legend>
        <p class="hint">
          等它睡熟、没有在呼噜时，胸口一起一伏算一次。<a href={`${BASE}notes/resting-breathing/`}>怎么数？</a>
        </p>
        {!timing && (
          <>
            <div class="breath-row">
              <label class="field inline">
                <span>数到</span>
                <input type="number" inputMode="numeric" min="1" max="200" value={count} onInput={(e) => { setCount(e.currentTarget.value); setSaved(false); }} />
                <span>次，数了</span>
              </label>
              <Segmented value={String(seconds)} onChange={(v) => v && setSeconds(Number(v) as Breathing['seconds'])} options={SECONDS} label="数了多久" />
            </div>
            {breathing && seconds !== 60 && <p class="calc">= 每分钟 {breathsPerMinute(breathing)} 次</p>}
          </>
        )}
        {timing ? (
          <BreathTimer
            onDone={(b) => {
              setCount(String(b.count));
              setSeconds(b.seconds);
              setTiming(false);
              setSaved(false);
            }}
          />
        ) : (
          <button class="btn small timer-btn" type="button" onClick={() => setTiming(true)}>
            ⏱ 用计时器数
          </button>
        )}
      </fieldset>

      <fieldset class="card">
        <legend>吃和喝</legend>
        <div class="field">
          <span class="field-label">食量</span>
          <Segmented value={rec.appetite} onChange={(v) => set('appetite', v as DayRecord['appetite'])} options={[['none', '没吃'], ['less', '偏少'], ['normal', '正常'], ['more', '偏多']]} label="食量" />
        </div>
        <div class="field">
          <span class="field-label">饮水（大概估一下）</span>
          <Segmented value={rec.water} onChange={(v) => set('water', v as DayRecord['water'])} options={[['less', '偏少'], ['normal', '正常'], ['more', '偏多']]} label="饮水" />
        </div>
      </fieldset>

      <fieldset class="card">
        <legend>拉和撒</legend>
        <div class="field-row">
          <div class="field">
            <span class="field-label">排尿次数（尿团数）</span>
            <Stepper value={rec.urineCount} onChange={(v) => set('urineCount', v)} label="排尿次数" />
          </div>
          <div class="field">
            <span class="field-label">尿团大小</span>
            <Segmented value={rec.urineSize} onChange={(v) => set('urineSize', v as DayRecord['urineSize'])} options={[['s', '小'], ['m', '中'], ['l', '大']]} label="尿团大小" />
          </div>
        </div>
        <div class="field-row">
          <div class="field">
            <span class="field-label">排便次数</span>
            <Stepper value={rec.stoolCount} onChange={(v) => set('stoolCount', v)} label="排便次数" />
          </div>
          <label class="field">
            <span class="field-label">粪便评分（1–7）</span>
            <select value={rec.stoolScore ?? ''} onChange={(e) => set('stoolScore', num(e.currentTarget.value))}>
              <option value="">没记</option>
              <option value="1">1 · 又干又硬，可能便秘</option>
              <option value="2">2 · 理想</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7">7</option>
            </select>
          </label>
        </div>
      </fieldset>

      <fieldset class="card">
        <legend>精神和活动</legend>
        <Segmented value={rec.energy} onChange={(v) => set('energy', v as DayRecord['energy'])} options={[['low', '没精神'], ['normal', '和平时一样'], ['high', '比平时活跃']]} label="精神和活动" />
      </fieldset>

      <details class="card monthly" open={rec.weight !== undefined || rec.bcs !== undefined}>
        <summary>每月一次：体重和体型评分</summary>
        <div class="field-row">
          <label class="field">
            <span class="field-label">体重（公斤）</span>
            <input type="number" inputMode="decimal" step="0.01" min="0" max="20" value={rec.weight ?? ''} onInput={(e) => set('weight', num(e.currentTarget.value))} />
          </label>
          <label class="field">
            <span class="field-label">
              体型评分（9 分制，理想 5 分）<a href={`${BASE}tools/body-condition/?cat=${encodeURIComponent(catId)}`}>对照图</a>
            </span>
            <select value={rec.bcs ?? ''} onChange={(e) => set('bcs', num(e.currentTarget.value))}>
              <option value="">没记</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((v) => (
                <option value={v}>{v}</option>
              ))}
            </select>
          </label>
        </div>
      </details>

      <label class="field card">
        <span class="field-label">备注</span>
        <textarea rows={2} value={rec.note ?? ''} onInput={(e) => set('note', e.currentTarget.value || undefined)} placeholder="比如：今天换了新猫砂、来了客人" />
      </label>

      <div class="actions sticky-save">
        <button class="btn primary" type="submit">
          {existing ? '更新这天的记录' : '保存这天的记录'}
        </button>
        {saved && <span class="saved">已保存 ✓</span>}
      </div>
    </form>
  );
}
