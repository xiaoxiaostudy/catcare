// 读者的学习进度：学会了哪些笔记。和「我的猫」一样只存在这台设备的浏览器里。
// 存的是笔记文件名（src/content/notes 里的英文短名）。

export const LEARNED_KEY = 'catcare:learned';

export function loadLearned(): Set<string> {
  try {
    const raw = JSON.parse(localStorage.getItem(LEARNED_KEY) ?? '[]');
    return new Set(Array.isArray(raw) ? raw.filter((x): x is string => typeof x === 'string') : []);
  } catch {
    return new Set();
  }
}

/** 保存成功返回 true；隐私模式下可能存不了。 */
export function setLearned(note: string, learned: boolean): boolean {
  const set = loadLearned();
  if (learned) set.add(note);
  else set.delete(note);
  try {
    localStorage.setItem(LEARNED_KEY, JSON.stringify([...set]));
    return true;
  } catch {
    return false;
  }
}
