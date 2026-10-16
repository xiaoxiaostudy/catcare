import { useState } from 'preact/hooks';
import { SaveToCat } from '../cats/SaveToCat';

// WSAVA 猫的 9 分制体型评分（Body Condition Score）对照表，中文为逐条翻译。
// 原表（俄亥俄州立大学兽医中心转载的 WSAVA 版）：https://vmc.vet.osu.edu/sites/default/files/documents/wsava-bcs-chart-dogs-cats.pdf
const SCORES: { group: 'under' | 'ideal' | 'over'; text: string[] }[] = [
  { group: 'under', text: ['短毛猫能看到肋骨，摸不到脂肪', '腹部严重往上收', '很容易摸到腰椎和骨盆两侧的骨头'] },
  { group: 'under', text: ['短毛猫很容易看到肋骨', '腰椎明显', '腹部明显往上收，摸不到脂肪'] },
  { group: 'under', text: ['很容易摸到肋骨，只盖着很少的脂肪', '腰椎明显，肋骨后面的腰身很明显', '腹部脂肪很少'] },
  { group: 'under', text: ['能摸到肋骨，盖着很少的脂肪', '肋骨后面能看出腰身', '腹部稍微往上收，没有腹部脂肪垫'] },
  { group: 'ideal', text: ['身材匀称', '肋骨后面能看到腰身', '能摸到肋骨，上面有薄薄一层脂肪', '腹部脂肪垫很少'] },
  { group: 'over', text: ['能摸到肋骨，脂肪稍微多了一点', '腰身和腹部脂肪垫能分辨出来，但不明显', '腹部不再往上收'] },
  { group: 'over', text: ['不容易摸到肋骨，盖着中等厚度的脂肪', '腰身不太看得出来，腹部明显变圆', '腹部脂肪垫中等'] },
  { group: 'over', text: ['摸不到肋骨，脂肪过多，没有腰身', '腹部明显变圆，腹部脂肪垫很突出', '腰背部有脂肪堆积'] },
  { group: 'over', text: ['厚厚的脂肪下摸不到肋骨', '腰背部、脸和四肢都有大量脂肪', '腹部胀大，没有腰身，腹部有大量脂肪'] },
];

const GROUP = {
  under: { label: '低于理想', cls: 'under' },
  ideal: { label: '理想', cls: 'ideal' },
  over: { label: '高于理想', cls: 'over' },
} as const;

/** 从上面看：胸、腰、臀的宽度随评分变化 */
function TopView({ s }: { s: number }) {
  const chest = 24 + s * 1.6;
  const waist = 11 + s * 3.3;
  const hip = 20 + s * 2.2;
  const cx = 70;
  const d = `M ${cx} 40
    C ${cx + chest * 0.7} 40, ${cx + chest} 52, ${cx + chest} 70
    C ${cx + chest} 84, ${cx + waist} 90, ${cx + waist} 100
    C ${cx + waist} 112, ${cx + hip} 118, ${cx + hip} 132
    C ${cx + hip} 150, ${cx + hip * 0.5} 160, ${cx} 160
    C ${cx - hip * 0.5} 160, ${cx - hip} 150, ${cx - hip} 132
    C ${cx - hip} 118, ${cx - waist} 112, ${cx - waist} 100
    C ${cx - waist} 90, ${cx - chest} 84, ${cx - chest} 70
    C ${cx - chest} 52, ${cx - chest * 0.7} 40, ${cx} 40 Z`;
  return (
    <svg viewBox="0 0 140 200" class="bcs-svg" aria-hidden="true">
      <path class="bcs-tail" d={`M ${cx} 158 C ${cx + 4} 180, ${cx + 22} 186, ${cx + 30} 194`} />
      <path class="bcs-body" d={d} />
      <circle class="bcs-body" cx={cx} cy="28" r="17" />
      <path class="bcs-body" d={`M ${cx - 15} 22 L ${cx - 13} 6 L ${cx - 4} 14 Z M ${cx + 15} 22 L ${cx + 13} 6 L ${cx + 4} 14 Z`} />
      {s <= 3 && [62, 72, 82].map((y) => <path class="bcs-rib" d={`M ${cx - chest + 6} ${y} Q ${cx} ${y + 5} ${cx + chest - 6} ${y}`} />)}
    </svg>
  );
}

/** 从侧面看：肚子的线从往上收到往下垂 */
function SideView({ s }: { s: number }) {
  const belly = 112 + (s - 5) * 7; // 肚子最低点
  const back = 66 - Math.max(0, s - 6) * 2;
  const d = `M 40 ${back + 4}
    C 70 ${back - 2}, 140 ${back - 2}, 172 ${back + 6}
    C 186 ${back + 12}, 190 100, 184 118
    L 186 150 L 176 150 L 172 124
    C 150 ${belly}, 100 ${belly}, 66 120
    L 62 150 L 52 150 L 50 118
    C 36 108, 32 ${back + 14}, 40 ${back + 4} Z`;
  return (
    <svg viewBox="0 0 220 160" class="bcs-svg" aria-hidden="true">
      <path class="bcs-tail" d={`M 182 ${back + 10} C 204 ${back}, 210 ${back - 30}, 200 ${back - 40}`} />
      <path class="bcs-body" d={d} />
      <circle class="bcs-body" cx="34" cy={back - 6} r="17" />
      <path class="bcs-body" d={`M 24 ${back - 18} L 22 ${back - 34} L 32 ${back - 22} Z M 40 ${back - 21} L 46 ${back - 36} L 48 ${back - 18} Z`} />
      <line class="bcs-ground" x1="10" x2="210" y1="151" y2="151" />
    </svg>
  );
}

export default function BodyCondition() {
  const [s, setS] = useState(5);
  const info = SCORES[s - 1];
  const g = GROUP[info.group];

  return (
    <div class="bcs">
      <div class={`bcs-views ${g.cls}`}>
        <figure>
          <TopView s={s} />
          <figcaption>从上面看</figcaption>
        </figure>
        <figure>
          <SideView s={s} />
          <figcaption>从侧面看</figcaption>
        </figure>
      </div>

      <div class="bcs-slider">
        <input
          type="range"
          min="1"
          max="9"
          step="1"
          value={s}
          onInput={(e) => setS(Number(e.currentTarget.value))}
          aria-label="体型评分"
          aria-valuetext={`${s} 分，${g.label}`}
        />
        <div class="bcs-scale" aria-hidden="true">
          {SCORES.map((x, i) => (
            <button type="button" class={`${GROUP[x.group].cls}${i + 1 === s ? ' on' : ''}`} onClick={() => setS(i + 1)} tabIndex={-1}>
              {i + 1}
            </button>
          ))}
        </div>
        <div class="bcs-zones" aria-hidden="true">
          <span class="under">低于理想</span>
          <span class="ideal">理想</span>
          <span class="over">高于理想</span>
        </div>
      </div>

      <div class={`bcs-card ${g.cls}`} aria-live="polite">
        <p class="bcs-score">
          <b>{s}</b> / 9 <span class="pill">{g.label}</span>
        </p>
        <ul>
          {info.text.map((t) => (
            <li>{t}</li>
          ))}
        </ul>
      </div>

      <SaveToCat patch={{ bcs: s }} what="体型评分每月记一次就够了，最好同一天也称一下体重。" />
    </div>
  );
}
