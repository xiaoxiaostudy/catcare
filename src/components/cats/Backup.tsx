import { useState } from 'preact/hooks';
import { exportFile, parseBackup, type Data } from '../../lib/store';

interface Props {
  data: Data;
  onImport: (data: Data) => void;
}

export function Backup({ data, onImport }: Props) {
  const [msg, setMsg] = useState('');

  const pick = async (e: Event) => {
    const input = e.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    try {
      const next = await parseBackup(file);
      const ok = confirm(
        `备份里有 ${next.cats.length} 只猫、${next.records.length} 条记录。导入会替换这台设备上现有的全部数据（${data.cats.length} 只猫、${data.records.length} 条记录），确定吗？`,
      );
      if (!ok) return;
      onImport(next);
      setMsg('导入好了。');
    } catch (err) {
      setMsg(err instanceof Error ? err.message : '读不了这个文件');
    }
  };

  return (
    <details class="backup">
      <summary>备份和换设备</summary>
      <p>
        所有记录只存在<strong>这台设备的这个浏览器</strong>里，不会上传。清除浏览器数据、换手机之前，先导出一份备份；到新设备上再导入。
      </p>
      <div class="actions">
        <button class="btn" type="button" onClick={() => exportFile(data)} disabled={data.cats.length === 0}>
          导出备份
        </button>
        <label class="btn">
          从备份导入
          <input type="file" accept="application/json,.json" onChange={pick} hidden />
        </label>
      </div>
      {msg && <p class="fine">{msg}</p>}
    </details>
  );
}
