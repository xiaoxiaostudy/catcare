import { useState } from 'preact/hooks';
import { ageText, recordsOf, today, type Cat } from '../../lib/store';
import { alertsFor } from '../../lib/baseline';
import { CatForm } from './CatForm';
import { Backup } from './Backup';
import { BASE, catUrl, useData } from './useData';

export default function CatList() {
  const { data, update, saveFailed } = useData();
  const [adding, setAdding] = useState(false);

  const add = (cat: Cat) => {
    update({ ...data, cats: [...data.cats, cat] });
    location.href = catUrl(cat.id);
  };

  return (
    <div class="cats-app">
      {saveFailed && <p class="banner warn">这台设备的浏览器不允许保存（可能是无痕模式），刷新后记录会丢失。</p>}

      {data.cats.length === 0 && !adding && (
        <div class="empty card">
          <p class="empty-title">还没有添加猫</p>
          <p>
            添加之后，每天花一分钟记下呼吸、吃喝拉撒和精神状态。记满 5 天，就能看到<strong>它自己的正常范围</strong>，之后哪天不一样了会提醒你。
          </p>
          <button class="btn primary" onClick={() => setAdding(true)}>
            添加第一只猫
          </button>
        </div>
      )}

      {data.cats.length > 0 && (
        <ul class="cat-cards">
          {data.cats.map((cat) => {
            const recs = recordsOf(data, cat.id);
            const t = today();
            const doneToday = recs.some((r) => r.date === t);
            const alerts = alertsFor(cat, recs, t, BASE).filter((a) => a.level !== 'info');
            return (
              <li>
                <a class="cat-card card" href={catUrl(cat.id)}>
                  <span class="avatar" aria-hidden="true">
                    {cat.name.slice(0, 1)}
                  </span>
                  <span class="cat-card-main">
                    <span class="cat-name">{cat.name}</span>
                    <span class="cat-meta">
                      {[cat.breed, cat.sex + '猫', cat.neutered ? '已绝育' : '未绝育', ageText(cat.birth)].filter(Boolean).join(' · ')}
                    </span>
                    <span class="cat-status">
                      {alerts.length > 0 ? (
                        <span class="pill alert">今天有 {alerts.length} 件事要留意</span>
                      ) : doneToday ? (
                        <span class="pill ok">今天已记录</span>
                      ) : (
                        <span class="pill todo">今天还没记</span>
                      )}
                      <span class="count">共记录 {recs.length} 天</span>
                    </span>
                  </span>
                  <span class="chev" aria-hidden="true">
                    →
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      )}

      {adding ? (
        <section>
          <h2 class="section-title">添加一只猫</h2>
          <CatForm onSave={add} onCancel={() => setAdding(false)} />
        </section>
      ) : (
        data.cats.length > 0 && (
          <button class="btn add-btn" onClick={() => setAdding(true)}>
            ＋ 再添加一只
          </button>
        )
      )}

      <Backup data={data} onImport={update} />
    </div>
  );
}
