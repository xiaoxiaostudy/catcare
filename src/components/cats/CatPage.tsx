import { useEffect, useState } from 'preact/hooks';
import { addDays, ageText, breathsPerMinute, recordsOf, today, upsertRecord, type Cat, type DayRecord } from '../../lib/store';
import { alertsFor, METRICS } from '../../lib/baseline';
import { CatForm } from './CatForm';
import { RecordForm } from './RecordForm';
import { TrendChart } from './TrendChart';
import { DotStrip } from './DotStrip';
import { BASE, useData } from './useData';

type Tab = 'log' | 'trend';

const LABEL: Record<string, string> = {
  none: '没吃', less: '偏少', normal: '正常', more: '偏多', low: '没精神', high: '活跃', s: '小', m: '中', l: '大',
};

const md = (iso: string) => `${Number(iso.slice(5, 7))}月${Number(iso.slice(8, 10))}日`;

export default function CatPage() {
  const { data, update, saveFailed } = useData();
  const [id] = useState(() => new URLSearchParams(location.search).get('id') ?? '');
  const [date, setDate] = useState(today);
  const [tab, setTab] = useState<Tab>(() => (location.hash === '#trend' ? 'trend' : 'log'));
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    history.replaceState(null, '', tab === 'trend' ? '#trend' : location.pathname + location.search);
  }, [tab]);

  const cat = data.cats.find((c) => c.id === id);
  if (!cat) {
    return (
      <div class="empty card">
        <p class="empty-title">找不到这只猫</p>
        <p>记录只存在当初添加它的那台设备上。如果换了设备，先在原设备导出备份，再到这里导入。</p>
        <a class="btn primary" href={`${BASE}cats/`}>回到我的猫</a>
      </div>
    );
  }

  const recs = recordsOf(data, cat.id);
  const existing = recs.find((r) => r.date === date);
  const alerts = alertsFor(cat, recs, date, BASE);
  const t = today();

  const saveCat = (c: Cat) => {
    update({ ...data, cats: data.cats.map((x) => (x.id === c.id ? c : x)) });
    setEditing(false);
  };

  const removeCat = () => {
    if (!confirm(`删除${cat.name}和它的全部 ${recs.length} 条记录？删除后找不回来，除非你导出过备份。`)) return;
    update({ cats: data.cats.filter((c) => c.id !== cat.id), records: data.records.filter((r) => r.catId !== cat.id), version: data.version });
    location.href = `${BASE}cats/`;
  };

  const saveRecord = (rec: DayRecord) => update(upsertRecord(data, rec));

  return (
    <div class="cats-app">
      <a class="back" href={`${BASE}cats/`}>← 我的猫</a>
      {saveFailed && <p class="banner warn">这台设备的浏览器不允许保存（可能是无痕模式），刷新后记录会丢失。</p>}

      <header class="cat-head">
        <span class="avatar big" aria-hidden="true">{cat.name.slice(0, 1)}</span>
        <div>
          <h1 class="serif">{cat.name}</h1>
          <p class="cat-meta">
            {[cat.breed, cat.sex + '猫', cat.neutered ? '已绝育' : '未绝育', ageText(cat.birth)].filter(Boolean).join(' · ')}
          </p>
        </div>
        <button class="btn small" onClick={() => setEditing(!editing)}>{editing ? '收起' : '编辑'}</button>
      </header>

      {editing && (
        <div class="edit-cat">
          <CatForm cat={cat} onSave={saveCat} onCancel={() => setEditing(false)} />
          <button class="btn danger-link" onClick={removeCat}>删除这只猫</button>
        </div>
      )}

      <div class="tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'log'} onClick={() => setTab('log')}>记一笔</button>
        <button role="tab" aria-selected={tab === 'trend'} onClick={() => setTab('trend')}>看趋势</button>
      </div>

      {tab === 'log' && (
        <>
          <div class="day-nav">
            <button class="btn small" onClick={() => setDate(addDays(date, -1))} aria-label="前一天">‹</button>
            <label class="day-pick">
              <b>{date === t ? '今天' : date === addDays(t, -1) ? '昨天' : md(date)}</b>
              <input type="date" value={date} max={t} onInput={(e) => e.currentTarget.value && setDate(e.currentTarget.value)} aria-label="选日期" />
            </label>
            <button class="btn small" onClick={() => setDate(addDays(date, 1))} disabled={date >= t} aria-label="后一天">›</button>
          </div>

          {alerts.length > 0 && (
            <section class="alerts" aria-label="值得留意">
              {alerts.map((a) => (
                <div class={`alert ${a.level}`}>
                  <p>{a.text}</p>
                  {a.link && <a href={a.link.href}>{a.link.label} →</a>}
                </div>
              ))}
              <p class="fine">这些提醒只是和它自己的记录比较，不是诊断。拿不准就联系兽医。</p>
            </section>
          )}

          <RecordForm catId={cat.id} date={date} existing={existing} onSave={saveRecord} />
        </>
      )}

      {tab === 'trend' && (
        <>
          {recs.length === 0 ? (
            <div class="empty card">
              <p>还没有记录。先去「记一笔」，记满 5 天就能看到它自己的正常范围。</p>
            </div>
          ) : (
            <div class="trends">
              <TrendChart metric={METRICS[0]} records={recs} end={t} />
              <DotStrip records={recs} end={t} />
              <TrendChart metric={METRICS[1]} records={recs} end={t} />
              <TrendChart metric={METRICS[2]} records={recs} end={t} />
              <TrendChart metric={METRICS[3]} records={recs} end={t} days={365} />
              <p class="fine">
                正常范围用最近 30 天的记录算（去掉最高和最低的各一成），所以每只猫都不一样，也会随着记录慢慢变准。还在长身体的小猫，体重本来就会一直涨。
              </p>
            </div>
          )}

          {recs.length > 0 && (
            <section>
              <h2 class="section-title">全部记录</h2>
              <div class="table-scroll">
                <table class="history">
                  <thead>
                    <tr><th>日期</th><th>呼吸</th><th>食量</th><th>饮水</th><th>尿</th><th>便</th><th>精神</th><th>体重</th><th>备注</th></tr>
                  </thead>
                  <tbody>
                    {[...recs].reverse().map((r) => (
                      <tr onClick={() => { setDate(r.date); setTab('log'); scrollTo(0, 0); }}>
                        <td>{md(r.date)}</td>
                        <td>{r.breathing ? breathsPerMinute(r.breathing) : ''}</td>
                        <td>{r.appetite ? LABEL[r.appetite] : ''}</td>
                        <td>{r.water ? LABEL[r.water] : ''}</td>
                        <td>{[r.urineCount, r.urineSize && LABEL[r.urineSize]].filter((v) => v !== undefined).join(' ')}</td>
                        <td>{[r.stoolCount, r.stoolScore && `${r.stoolScore}分`].filter((v) => v !== undefined).join(' ')}</td>
                        <td>{r.energy ? LABEL[r.energy] : ''}</td>
                        <td>{r.weight ?? ''}</td>
                        <td class="note-cell">{r.note ?? ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p class="fine">点一行可以修改那天的记录。</p>
            </section>
          )}
        </>
      )}
    </div>
  );
}
