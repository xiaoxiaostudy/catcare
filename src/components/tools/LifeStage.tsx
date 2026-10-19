import { useState } from 'preact/hooks';
import { today } from '../../lib/store';
import { BASE, useData } from '../cats/useData';

/**
 * 年龄滑块：拖到某个年龄，看它属于哪个阶段、相当于人的几岁、这时该做什么。
 * 分段、换算和每个阶段的要点都来自笔记 kitten、adult-cat、senior-cat，措辞跟笔记一致。
 */

// 滑块的刻度：头两年按月，之后按年，免得小猫阶段挤成一条缝
const STEPS = [...Array.from({ length: 24 }, (_, i) => i + 1), ...Array.from({ length: 18 }, (_, i) => (i + 3) * 12)];
const MAX = STEPS.length - 1;

const indexOf = (months: number) => {
  let best = 0;
  STEPS.forEach((m, i) => {
    if (Math.abs(m - months) < Math.abs(STEPS[best] - months)) best = i;
  });
  return best;
};

const ageLabel = (m: number) => (m < 12 ? `${m} 个月` : m % 12 ? `${Math.floor(m / 12)} 岁 ${m % 12} 个月` : `${m / 12} 岁`);

/** iCatCare 的换算：3 个月≈4 岁，6 个月≈10 岁，1 岁≈15 岁，2 岁≈24 岁，之后每年约 4 岁 */
function humanAge(m: number) {
  const pts: [number, number][] = [[0, 0], [3, 4], [6, 10], [12, 15], [24, 24]];
  if (m >= 24) return Math.round(24 + ((m - 24) / 12) * 4);
  for (let i = 1; i < pts.length; i++) {
    const [m1, h1] = pts[i];
    if (m <= m1) {
      const [m0, h0] = pts[i - 1];
      return Math.round(h0 + ((h1 - h0) * (m - m0)) / (m1 - m0));
    }
  }
  return 24;
}

type StageId = 'kitten' | 'young' | 'mature' | 'senior';

const AAFP: { id: StageId; name: string; upTo: number }[] = [
  { id: 'kitten', name: '幼猫', upTo: 12 },
  { id: 'young', name: '青年成猫', upTo: 84 },
  { id: 'mature', name: '中年成猫', upTo: 132 },
  { id: 'senior', name: '老年猫', upTo: Infinity },
];

const ICC: { name: string; upTo: number }[] = [
  { name: '幼猫', upTo: 7 },
  { name: '青少年', upTo: 36 },
  { name: '成年', upTo: 84 },
  { name: '中年', upTo: 132 },
  { name: '老年', upTo: 180 },
  { name: '超高龄', upTo: Infinity },
];

const stageOf = <T extends { upTo: number }>(list: T[], m: number) => list.find((s) => m < s.upTo)!;

interface Tip {
  title: string;
  items: string[];
}

const TIPS: Record<StageId, { note: string; noteName: string; tips: Tip[] }> = {
  kitten: {
    note: 'kitten',
    noteName: '幼猫和青少年猫',
    tips: [
      { title: '体检', items: ['兽医这时重点看：先天和遗传问题、寄生虫和病毒等传染病、皮肤真菌', '疫苗、驱虫、绝育各有专门的笔记'] },
      { title: '吃', items: ['吃幼猫粮，不要吃成猫粮；少量多餐，每天 4 到 6 顿', '干粮湿粮都给一些；不要给牛奶'] },
      { title: '从小习惯', items: ['温柔地、配着零食，让它习惯被摸嘴、摸脚、梳毛、剪指甲、进航空箱', '不要用手或脚逗它玩'] },
      { title: '留意', items: ['没打完疫苗的小猫吐、拉、不吃、精神差，马上看兽医', '性成熟后可能开始喷尿；绝育后容易发胖，从这时就要防肥胖'] },
    ],
  },
  young: {
    note: 'adult-cat',
    noteName: '成年猫',
    tips: [
      { title: '体检', items: ['每年至少一次全面体检', '化验做一次当作基线，以后的结果和它比'] },
      { title: '吃和动', items: ['不要让碗里一直有粮，按体重和体型评分调整', '每天陪玩，保持活动量'] },
      { title: '这个年纪要留意', items: ['下泌尿道病（公猫尿不出是急症）、心肌病、支气管病、慢性肠病、皮肤过敏', '咳嗽不是毛球，要看兽医'] },
      { title: '记录', items: ['用日记、照片、视频记下它平时的样子，有变化时才有依据'] },
    ],
  },
  mature: {
    note: 'adult-cat',
    noteName: '成年猫',
    tips: [
      { title: '体检', items: ['每年至少一次全面体检', '化验（血常规、生化、尿检、T4、肾功能、血压）每 1 到 2 年一次'] },
      { title: '这个年纪要留意', items: ['慢性肾病、甲亢、糖尿病、肿瘤、牙周病和牙吸收、关节炎、慢性肠病', '很多猫在 7 到 10 岁开始出现和年龄有关的身体变化'] },
      { title: '吃和动', items: ['按体重和体型评分调整量；健康的中老年猫不应该限制蛋白质', '每天陪玩'] },
    ],
  },
  senior: {
    note: 'senior-cat',
    noteName: '老年猫',
    tips: [
      { title: '体检', items: ['至少每 6 个月一次，有慢性病的更频繁', '化验至少每年一次，建议每 6 个月一次'] },
      { title: '关节炎的信号', items: ['不太愿意跳、跳得少了；进出砂盆困难；梳毛少了、毛打结', '大多数关节炎的猫不会明显跛，只是动得少'] },
      { title: '家里改造', items: ['低边砂盆、台阶或缓坡、防滑垫、软而暖的床', '上下楼梯困难的猫，把食盆、水盆、床、砂盆都放在它常待的那一层'] },
      { title: '要约兽医', items: ['不吃、体重下降、喝得多、僵硬跳不上去、乱尿、夜里叫、迷糊', '不要以为「老了就这样」，很多是能治的病'] },
    ],
  },
};

function monthsSince(birth: string) {
  const [by, bm, bd] = birth.split('-').map(Number);
  const [ty, tm, td] = today().split('-').map(Number);
  return (ty - by) * 12 + (tm - bm) - (td < bd ? 1 : 0);
}

export default function LifeStage({ start = 48 }: { start?: number }) {
  const { data } = useData();
  const [i, setI] = useState(indexOf(start));
  const months = STEPS[i];
  const aafp = stageOf(AAFP, months);
  const icc = stageOf(ICC, months);
  const tip = TIPS[aafp.id];

  const withAge = data.cats.filter((c) => c.birth && monthsSince(c.birth) >= 1);

  // 时间轴上每一段的位置，用滑块的刻度算
  const pos = (m: number) => (indexOf(Math.min(m, STEPS[MAX])) / MAX) * 100;
  const bars = (list: { name: string; upTo: number }[]) => {
    let from = 0;
    return list.map((s) => {
      const left = from === 0 ? 0 : pos(from);
      const right = s.upTo === Infinity ? 100 : pos(s.upTo);
      from = s.upTo;
      return { name: s.name, left, width: right - left, on: s === stageOf(list, months) };
    });
  };

  return (
    <div class="life-stage">
      {withAge.length > 0 && (
        <div class="actions">
          {withAge.map((c) => (
            <button class="btn small" type="button" onClick={() => setI(indexOf(monthsSince(c.birth)))}>
              看{c.name}现在
            </button>
          ))}
        </div>
      )}

      <div class="ls-head">
        <p class="ls-age">
          <b>{ageLabel(months)}</b>
          <span>相当于人的 {humanAge(months)} 岁</span>
        </p>
        <p class="ls-stage">
          AAFP：<b>{aafp.name}</b>
          <span aria-hidden="true">·</span>
          iCatCare：<b>{icc.name}</b>
        </p>
      </div>

      <div class="ls-track">
        {[
          ['AAFP', bars(AAFP)],
          ['iCatCare', bars(ICC)],
        ].map(([label, list]) => (
          <div class="ls-row" aria-hidden="true">
            <span class="ls-src">{label as string}</span>
            <div class="ls-bars">
              {(list as ReturnType<typeof bars>).map((b) => (
                <span class={b.on ? 'ls-bar on' : 'ls-bar'} style={{ left: `${b.left}%`, width: `${b.width}%` }}>
                  {b.width > 9 ? b.name : ''}
                </span>
              ))}
              <span class="ls-pin" style={{ left: `${(i / MAX) * 100}%` }} />
            </div>
          </div>
        ))}
        <input type="range" min="0" max={MAX} step="1" value={i} onInput={(e) => setI(Number(e.currentTarget.value))} aria-label="拖动年龄" aria-valuetext={ageLabel(months)} />
        <div class="ls-ticks fine" aria-hidden="true">
          <span style={{ left: '0%' }}>出生</span>
          <span style={{ left: `${pos(12)}%` }}>1 岁</span>
          <span style={{ left: `${pos(84)}%` }}>7 岁</span>
          <span style={{ left: `${pos(132)}%` }}>11 岁</span>
          <span style={{ left: `${pos(180)}%` }}>15 岁</span>
          <span style={{ left: '100%' }}>20 岁</span>
        </div>
      </div>

      <div class="ls-tips">
        {tip.tips.map((t) => (
          <section class="ls-tip">
            <h3>{t.title}</h3>
            <ul>
              {t.items.map((it) => (
                <li>{it}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <p class="fine">
        每只猫不一样，年龄分段只是大致的参考；有的 10 岁以上的猫身体很好，兽医可以把它当作中年成猫来照顾。详细的见笔记<a href={`${BASE}notes/${tip.note}/`}>《{tip.noteName}》</a>。
      </p>
    </div>
  );
}
