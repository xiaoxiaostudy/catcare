import { useEffect, useState } from 'preact/hooks';
import { load, save, type Data } from '../../lib/store';

/** 读写本地数据；别的标签页改了数据也会同步过来。 */
export function useData() {
  const [data, setData] = useState<Data>(load);
  const [saveFailed, setSaveFailed] = useState(false);

  useEffect(() => {
    const refresh = () => setData(load());
    window.addEventListener('catcare:change', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('catcare:change', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const update = (next: Data) => {
    setData(next);
    setSaveFailed(!save(next));
  };

  return { data, update, saveFailed };
}

export const BASE = import.meta.env.BASE_URL;
export const catUrl = (id: string) => `${BASE}cats/cat/?id=${encodeURIComponent(id)}`;
