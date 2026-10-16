import { useState } from 'preact/hooks';
import { today, upsertRecord, type DayRecord } from '../../lib/store';
import { Segmented } from './Segmented';
import { BASE, catUrl, useData } from './useData';

interface Props {
  /** 要写进当天记录的字段，比如 { breathing } 或 { bcs } */
  patch: Partial<Omit<DayRecord, 'catId' | 'date'>>;
  /** 存完之后在按钮旁边显示的说明 */
  what: string;
}

/** 互动工具的结果「存进某只猫今天的记录」；同一天已有记录时只覆盖这几项。 */
export function SaveToCat({ patch, what }: Props) {
  const { data, update, saveFailed } = useData();
  const [catId, setCatId] = useState<string | undefined>(() => {
    const fromUrl = new URLSearchParams(location.search).get('cat');
    return data.cats.find((c) => c.id === fromUrl)?.id ?? (data.cats.length === 1 ? data.cats[0].id : undefined);
  });
  const [savedTo, setSavedTo] = useState<string>();

  if (data.cats.length === 0) {
    return (
      <p class="save-to-cat fine">
        想把结果记下来？先<a href={`${BASE}cats/`}>添加你的猫</a>，以后每次都能存进它的记录，攒出它自己的正常范围。
      </p>
    );
  }

  const save = () => {
    if (!catId) return;
    const date = today();
    const existing = data.records.find((r) => r.catId === catId && r.date === date);
    update(upsertRecord(data, { ...(existing ?? { catId, date }), ...patch }));
    setSavedTo(catId);
  };

  const saved = savedTo && data.cats.find((c) => c.id === savedTo);

  return (
    <div class="save-to-cat">
      {data.cats.length > 1 && (
        <Segmented value={catId} onChange={(v) => { setCatId(v); setSavedTo(undefined); }} options={data.cats.map((c) => [c.id, c.name])} label="存给哪只猫" />
      )}
      <div class="actions">
        <button class="btn primary" type="button" disabled={!catId} onClick={save}>
          {catId ? `存进${data.cats.find((c) => c.id === catId)!.name}今天的记录` : '先选一只猫'}
        </button>
        {saved && !saveFailed && (
          <span class="saved">
            已存 ✓ <a href={catUrl(saved.id) + '#trend'}>看{saved.name}的趋势</a>
          </span>
        )}
      </div>
      {saveFailed && <p class="fine">这台设备的浏览器不允许保存（可能是无痕模式）。</p>}
      {saved && !saveFailed && <p class="fine">{what}</p>}
    </div>
  );
}
