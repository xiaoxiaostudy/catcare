import { useEffect, useMemo, useState } from 'preact/hooks';

/**
 * 砂盆观察：拖动一天的时间，看两只虚构公猫各自去了几次砂盆、尿出来多少，
 * 再判断哪只要马上联系兽医。次数和大小只是示意，不是正常标准。
 */

// 0 = 什么都没有，0.5 = 几滴，1 = 小团，2 = 正常大小的一团
type Amount = 0 | 0.5 | 1 | 2;
interface Visit {
  t: number; // 从早上 8 点算起的小时数
  amount: Amount;
  note?: string; // 只用笔记「就医红线」里写到的表现
}

const HOURS = 12;
const START = 8;

const NORMAL: Visit[] = [
  { t: 0.6, amount: 2 },
  { t: 4.8, amount: 2 },
  { t: 9.3, amount: 2 },
];

const BLOCKED: Visit[] = [
  { t: 0.4, amount: 1 },
  { t: 1.3, amount: 1 },
  { t: 2.1, amount: 0.5 },
  { t: 2.9, amount: 0.5 },
  { t: 3.6, amount: 0 },
  { t: 4.3, amount: 0.5, note: '蹲了很久，反复用力' },
  { t: 5.0, amount: 0 },
  { t: 5.6, amount: 0, note: '蹲了很久，反复用力' },
  { t: 6.4, amount: 0 },
  { t: 7.1, amount: 0, note: '用力时叫了' },
  { t: 7.8, amount: 0 },
  { t: 8.5, amount: 0, note: '越来越烦躁' },
  { t: 9.1, amount: 0, note: '一直在舔生殖器附近' },
  { t: 9.8, amount: 0 },
  { t: 10.5, amount: 0, note: '用力时叫了' },
  { t: 11.2, amount: 0, note: '不肯吃晚饭' },
];

const AMOUNT_TEXT: Record<Amount, string> = {
  0: '什么都没尿出来',
  0.5: '只有几滴',
  1: '尿了一小团',
  2: '尿了一团',
};

// 砂盆里尿团的位置，按顺序取，看起来随意但每次都一样
const SPOTS = [
  [52, 46],
  [118, 40],
  [86, 58],
  [150, 56],
  [70, 34],
  [132, 64],
  [100, 36],
  [40, 62],
];

const clock = (t: number) => {
  const m = Math.round((START + t) * 60);
  return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;
};

type Answer = 'blocked' | 'normal' | 'wait';
const CHOICES = [['猫 A', '猫 A'], ['猫 B', '猫 B'], ['wait', '都再观察一下']];

export default function LitterWatch({ emergencyHref }: { emergencyHref: string }) {
  // 每次打开随机决定哪只是堵住的，免得记住答案
  const blockedIsA = useMemo(() => Math.random() < 0.5, []);
  const lanes = blockedIsA
    ? [{ name: '猫 A', visits: BLOCKED }, { name: '猫 B', visits: NORMAL }]
    : [{ name: '猫 A', visits: NORMAL }, { name: '猫 B', visits: BLOCKED }];
  const blockedName = blockedIsA ? '猫 A' : '猫 B';
  const normalName = blockedIsA ? '猫 B' : '猫 A';

  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [pick, setPick] = useState<string | null>(null);
  const answer: Answer | null = pick === null ? null : pick === 'wait' ? 'wait' : pick === blockedName ? 'blocked' : 'normal';
  const reachedEnd = time >= HOURS;

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setTime((t) => {
        const next = Math.min(HOURS, t + 0.1);
        if (next >= HOURS) setPlaying(false);
        return next;
      });
    }, 80);
    return () => clearInterval(id);
  }, [playing]);

  const play = () => {
    if (reachedEnd) setTime(0);
    setPlaying(true);
  };

  return (
    <div class="litter-watch">
      <p class="fine">两只虚构的公猫，都是从早上 8 点开始看。次数和尿团大小只是示意，不是正常标准。</p>

      <div class="lw-clock">
        <span class="lw-time">{clock(time)}</span>
        <input
          type="range"
          min="0"
          max={HOURS}
          step="0.1"
          value={time}
          onInput={(e) => {
            setPlaying(false);
            setTime(Number(e.currentTarget.value));
          }}
          aria-label="拖动时间"
        />
        <button class="btn small" type="button" onClick={() => (playing ? setPlaying(false) : play())}>
          {playing ? '暂停' : reachedEnd ? '重新看一遍' : '自动播放'}
        </button>
      </div>

      <div class="lw-lanes">
        {lanes.map((lane) => {
          const seen = lane.visits.filter((v) => v.t <= time);
          const clumps = seen.filter((v) => v.amount > 0);
          const last = seen[seen.length - 1];
          return (
            <section class="lw-lane" aria-label={lane.name}>
              <h3 class="lw-name">{lane.name}</h3>

              <svg class="lw-box" viewBox="0 0 200 100" role="img" aria-label={`砂盆里有 ${clumps.length} 个尿团`}>
                <rect class="lw-tray" x="8" y="18" width="184" height="74" rx="10" />
                <rect class="lw-sand" x="18" y="26" width="164" height="58" rx="6" />
                {clumps.map((v, i) => {
                  const [x, y] = SPOTS[i % SPOTS.length];
                  const r = v.amount === 2 ? 13 : v.amount === 1 ? 8 : 3.5;
                  return <ellipse class="lw-clump" cx={x} cy={y} rx={r * 1.25} ry={r} key={v.t} />;
                })}
              </svg>

              <div class="lw-track" aria-hidden="true">
                {lane.visits.map((v) => (
                  <span
                    key={v.t}
                    class={['lw-dot', v.t <= time ? 'on' : '', v.amount === 0 ? 'dry' : ''].join(' ')}
                    style={{ left: `${(v.t / HOURS) * 100}%`, '--s': `${6 + v.amount * 4}px` }}
                  />
                ))}
                <span class="lw-now" style={{ left: `${(time / HOURS) * 100}%` }} />
              </div>

              <p class="lw-tally">
                去了 <b>{seen.length}</b> 次砂盆，尿团 <b>{clumps.length}</b> 个
              </p>
              <p class="lw-last" aria-live="polite">
                {last ? `${clock(last.t)} ${AMOUNT_TEXT[last.amount]}${last.note ? `，${last.note}` : ''}` : '还没去过砂盆'}
              </p>
            </section>
          );
        })}
      </div>

      <div class="lw-legend fine" aria-hidden="true">
        <span><i class="lw-dot on" style={{ '--s': '14px' }} />尿出来了（越大越多）</span>
        <span><i class="lw-dot on dry" style={{ '--s': '6px' }} />去了，没尿出来</span>
      </div>

      {reachedEnd || answer ? (
        <div class="lw-quiz">
          <p class="lw-q">看完这一天，哪只要马上联系兽医？</p>
          <div class="actions">
            {CHOICES.map(([value, label]) => (
              <button class={pick === value ? 'btn picked' : 'btn'} type="button" aria-pressed={pick === value} onClick={() => setPick(value)}>
                {label}
              </button>
            ))}
          </div>

          {answer === 'blocked' && (
            <div class="lw-reveal right">
              <p>
                <b>对，是{blockedName}。</b>它一天去了十几次砂盆，可砂盆几乎是干净的：反复用力，几乎没有尿。这就是笔记里的就医红线，不分白天黑夜，马上联系兽医或去急诊。
              </p>
              <p>
                注意它是怎么一步步变的：一开始还能尿出小团，后来只有几滴，再后来什么都没有，接着开始叫、烦躁、不肯吃。到了不吃这一步，已经拖了一段时间了。
              </p>
            </div>
          )}
          {answer === 'normal' && (
            <div class="lw-reveal">
              <p>
                <b>再看看{blockedName}。</b>{normalName}去得少，但每次都尿出一大团，砂盆里看得到。{blockedName}去了十几次，砂盆却几乎是干净的。单看去砂盆的次数不够，要看有没有尿出来。
              </p>
            </div>
          )}
          {answer === 'wait' && (
            <div class="lw-reveal">
              <p>
                <b>{blockedName}不能等。</b>反复去砂盆、反复用力，却几乎没有尿，这是急症，不是便秘。Cornell 说从完全堵住到死亡可能不到 24 到 48 小时。
              </p>
            </div>
          )}

          {answer && (
            <p class="fine">
              在家最容易看到的线索，就是每天铲砂时尿团的数量和大小。可以在「我的猫」里每天记下来，攒出它自己的正常范围。
              <a href={emergencyHref}>急症清单里的这一条</a>
            </p>
          )}
        </div>
      ) : (
        <p class="fine">把时间拖到晚上 8 点，再回答一个问题。</p>
      )}
    </div>
  );
}
