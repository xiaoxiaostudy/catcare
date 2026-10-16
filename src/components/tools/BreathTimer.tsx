import { useEffect, useRef, useState } from 'preact/hooks';
import { breathsPerMinute, type Breathing } from '../../lib/store';
import { Segmented } from '../cats/Segmented';
import { SaveToCat } from '../cats/SaveToCat';

type Phase = 'ready' | 'counting' | 'done';
type Seconds = Breathing['seconds'];

interface Props {
  /** 嵌在记录表单里时，数完直接把结果交回表单，不显示「存进记录」 */
  onDone?: (b: Breathing) => void;
}

const R = 88;
const C = 2 * Math.PI * R;

export default function BreathTimer({ onDone }: Props) {
  const [seconds, setSeconds] = useState<Seconds>(30);
  const [phase, setPhase] = useState<Phase>('ready');
  const [count, setCount] = useState(0);
  const [left, setLeft] = useState(30);
  const [bump, setBump] = useState(0);
  const endAt = useRef(0);
  const wakeLock = useRef<{ release: () => Promise<void> } | null>(null);

  useEffect(() => {
    if (phase !== 'counting') return;
    // 用 setInterval 而不是 requestAnimationFrame：页面切到后台时 rAF 会停，计时就卡住了
    const id = setInterval(() => {
      const ms = endAt.current - Date.now();
      if (ms <= 0) {
        clearInterval(id);
        setLeft(0);
        setPhase('done');
        navigator.vibrate?.([60, 60, 60]);
        return;
      }
      setLeft(ms / 1000);
    }, 100);
    return () => clearInterval(id);
  }, [phase]);

  // 计时时不让屏幕熄灭；不支持的浏览器就算了
  useEffect(() => {
    if (phase === 'counting') {
      (navigator as Navigator & { wakeLock?: { request: (t: 'screen') => Promise<{ release: () => Promise<void> }> } }).wakeLock
        ?.request('screen')
        .then((l) => (wakeLock.current = l))
        .catch(() => {});
    } else {
      wakeLock.current?.release().catch(() => {});
      wakeLock.current = null;
    }
  }, [phase]);

  const start = () => {
    setCount(0);
    setLeft(seconds);
    endAt.current = Date.now() + seconds * 1000;
    setPhase('counting');
  };

  const tap = () => {
    if (phase !== 'counting') return;
    setCount((c) => c + 1);
    setBump((b) => b + 1);
    navigator.vibrate?.(8);
  };

  useEffect(() => {
    if (phase !== 'counting') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        tap();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase]);

  const result: Breathing | undefined = phase === 'done' && count > 0 ? { count, seconds } : undefined;
  const progress = phase === 'counting' ? left / seconds : phase === 'done' ? 0 : 1;

  return (
    <div class="breath-timer">
      {phase === 'ready' && (
        <div class="bt-ready">
          <ul class="bt-check">
            <li>猫已经睡熟，或者安静地躺着休息</li>
            <li>没有在呼噜（呼噜时不能数）</li>
            <li>看胸口：一起一伏算一次</li>
          </ul>
          <div class="bt-setup">
            <span class="field-label">数多久</span>
            <Segmented value={String(seconds)} onChange={(v) => v && setSeconds(Number(v) as Seconds)} options={[['15', '15 秒'], ['30', '30 秒'], ['60', '60 秒']]} label="数多久" />
          </div>
          <button class="btn primary bt-start" type="button" onClick={start}>
            开始计时
          </button>
          <p class="fine">开始后，猫的胸口每起伏一次，就点一下大圆圈（电脑上也可以按空格键）。</p>
        </div>
      )}

      {phase !== 'ready' && (
        <div class="bt-stage">
          <button
            type="button"
            class={phase === 'counting' ? 'bt-dial live' : 'bt-dial'}
            onClick={tap}
            disabled={phase !== 'counting'}
            aria-label={phase === 'counting' ? `已数 ${count} 次，点一下加一` : `一共数了 ${count} 次`}
          >
            <svg viewBox="0 0 200 200" aria-hidden="true">
              <circle class="bt-track" cx="100" cy="100" r={R} />
              <circle class="bt-ring" cx="100" cy="100" r={R} stroke-dasharray={C} stroke-dashoffset={C * (1 - progress)} transform="rotate(-90 100 100)" />
            </svg>
            <span class="bt-count" key={bump}>
              {count}
            </span>
            <span class="bt-sub">{phase === 'counting' ? `还剩 ${Math.ceil(left)} 秒` : '时间到'}</span>
          </button>

          {phase === 'counting' && (
            <div class="actions bt-actions">
              <button class="btn small" type="button" onClick={() => setCount((c) => Math.max(0, c - 1))} disabled={count === 0}>
                点多了，减一
              </button>
              <button class="btn small" type="button" onClick={() => setPhase('ready')}>
                停下，重来
              </button>
            </div>
          )}

          {phase === 'done' && (
            <div class="bt-result">
              <label class="field inline">
                <span>一共数到</span>
                <input type="number" inputMode="numeric" min="0" max="200" value={count} onInput={(e) => setCount(Math.max(0, Number(e.currentTarget.value) || 0))} />
                <span>次（{seconds} 秒）</span>
              </label>
              {result && (
                <p class="bt-bpm">
                  每分钟 <b>{breathsPerMinute(result)}</b> 次
                </p>
              )}
              <p class="fine">
                单独一次的结果说明不了什么，连续多天记下来，和它自己平时的数比才有意义。多少算偏高，以你的兽医给的标准为准。
              </p>
              {result && onDone ? (
                <div class="actions">
                  <button class="btn primary" type="button" onClick={() => onDone(result)}>
                    填进记录
                  </button>
                  <button class="btn" type="button" onClick={() => setPhase('ready')}>
                    重新数
                  </button>
                </div>
              ) : (
                <>
                  {result && <SaveToCat patch={{ breathing: result }} what="多存几天，就能在趋势图里看到它睡着时呼吸的正常范围。" />}
                  <button class="btn" type="button" onClick={() => setPhase('ready')}>
                    重新数
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
