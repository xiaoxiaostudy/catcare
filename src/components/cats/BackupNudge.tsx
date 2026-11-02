import { backupDue, exportFile, snoozeBackup, type Data } from '../../lib/store';

/** 很久没备份时，在「我的猫」页面顶上提醒一下。 */
export function BackupNudge({ data }: { data: Data }) {
  const due = backupDue(data);
  if (!due) return null;

  return (
    <div class="banner backup-nudge">
      <p>
        {due.last ? `上次备份是 ${due.days} 天前。` : `已经记了 ${due.days} 天，还没备份过。`}
        记录只存在这个浏览器里，清除浏览器数据、换手机，或者 Safari 连续 7 天没打开这个网站，都可能让记录丢失。
      </p>
      <div class="actions">
        <button class="btn small primary" type="button" onClick={() => exportFile(data)}>
          导出备份
        </button>
        <button class="btn small" type="button" onClick={() => snoozeBackup()}>
          过几天再说
        </button>
      </div>
    </div>
  );
}
