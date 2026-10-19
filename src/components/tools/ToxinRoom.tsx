import { useState } from 'preact/hooks';

/**
 * 找危险物：一个普通的客厅，点出对猫有毒的东西。
 * 每一样都在笔记 household-toxins 的清单里，说明的措辞和出处跟笔记一致。
 */

interface Hazard {
  id: string;
  box: [number, number, number, number]; // x, y, w, h（viewBox 坐标）
  name: string;
  text: string;
  urgent?: boolean;
}

const HAZARDS: Hazard[] = [
  {
    id: 'lily',
    box: [262, 92, 62, 100],
    name: '花瓶里的百合',
    text: '花、叶、茎、花粉都有毒。猫舔掉毛上的花粉、喝插过百合的花瓶水，都可能中毒；“无花粉百合”也不安全。家里永远不放百合，包括别人送的花束（iCatCare）。',
    urgent: true,
  },
  {
    id: 'grapes',
    box: [338, 152, 50, 40],
    name: '一盘葡萄',
    text: '葡萄、葡萄干、洋葱、牛油果、巧克力，还有任何含木糖醇的东西，都在 Cornell 的名单上。',
  },
  {
    id: 'pills',
    box: [318, 286, 44, 24],
    name: '掉在地上的药片',
    text: '阿司匹林、对乙酰氨基酚、布洛芬都在 Cornell 的名单上，猫常常会把掉在桌上、地上的药片吃掉。掉了马上捡起来，不经兽医同意不给猫吃任何药。',
  },
  {
    id: 'dogflea',
    box: [462, 88, 44, 34],
    name: '狗用的跳蚤药',
    text: '有的狗用产品含氯菊酯，可能毒死猫，连蹭到刚用过药的狗都可能中毒（iCatCare）。只用猫用的产品；狗用药后 24 小时内，别让猫接触这只狗（Cornell）。',
  },
  {
    id: 'oil',
    box: [514, 88, 32, 34],
    name: '精油',
    text: '茶树油、桉树油、柑橘油这类“天然”东西，没有经过严格的安全验证，有的对猫可能有毒。不要靠它们给猫驱虫（iCatCare）。',
  },
  {
    id: 'cleaner',
    box: [22, 244, 44, 62],
    name: '清洁剂',
    text: '漂白剂、洗涤剂、消毒剂，还有杀虫剂、灭鼠药，都在 Cornell 的名单上。放在猫够不到的地方，洒了马上清理。',
  },
  {
    id: 'plant',
    box: [194, 222, 58, 84],
    name: '一品红盆栽',
    text: '一品红、郁金香、绣球、满天星等都在 Cornell 的名单上。好奇的年轻猫、无聊的猫更容易啃植物（iCatCare）。买新植物前先查一下对猫安不安全。',
  },
];

function Room() {
  return (
    <>
      <rect class="tr-wall" x="0" y="0" width="600" height="250" />
      <rect class="tr-floor" x="0" y="250" width="600" height="90" />

      {/* 窗户 */}
      <rect class="tr-window" x="60" y="40" width="110" height="110" rx="4" />
      <path class="tr-frame" d="M115 40 v110 M60 95 h110" />

      {/* 墙上的架子：狗用跳蚤药、精油 */}
      <rect class="tr-wood" x="452" y="122" width="132" height="6" rx="2" />
      <rect class="tr-pack" x="466" y="94" width="36" height="28" rx="2" />
      <g class="tr-paw" transform="translate(484 108)">
        <circle cx="0" cy="3" r="4" />
        <circle cx="-5" cy="-3" r="2" />
        <circle cx="0" cy="-5" r="2" />
        <circle cx="5" cy="-3" r="2" />
      </g>
      <rect class="tr-oil" x="522" y="104" width="16" height="18" rx="3" />
      <rect class="tr-cap" x="526" y="94" width="8" height="10" rx="2" />
      <rect class="tr-book" x="556" y="96" width="8" height="26" />
      <rect class="tr-book alt" x="566" y="100" width="8" height="22" />

      {/* 桌子 */}
      <rect class="tr-wood" x="250" y="190" width="180" height="8" rx="2" />
      <rect class="tr-wood" x="262" y="198" width="7" height="100" />
      <rect class="tr-wood" x="411" y="198" width="7" height="100" />

      {/* 花瓶和百合 */}
      <path class="tr-stem" d="M292 160 C290 140 280 124 276 110 M294 160 C296 136 300 120 306 104 M296 160 C302 144 312 132 318 124" />
      {[[276, 108], [306, 102], [318, 122]].map(([x, y]) => (
        <g class="tr-lily" transform={`translate(${x} ${y})`}>
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <ellipse cx="0" cy="-7" rx="3.2" ry="8" transform={`rotate(${a})`} />
          ))}
          <circle class="tr-pollen" cx="0" cy="0" r="2.2" />
        </g>
      ))}
      <path class="tr-vase" d="M284 158 h22 l-3 32 h-16 z" />

      {/* 一盘葡萄 */}
      <path class="tr-plate" d="M340 184 q23 10 46 0 z" />
      {[[352, 178], [360, 178], [368, 178], [376, 178], [356, 171], [364, 171], [372, 171], [360, 164], [368, 164], [364, 158]].map(([x, y]) => (
        <circle class="tr-grape" cx={x} cy={y} r="4" />
      ))}

      {/* 地上的药片 */}
      <ellipse class="tr-pill" cx="332" cy="300" rx="6" ry="3.5" />
      <ellipse class="tr-pill" cx="346" cy="296" rx="6" ry="3.5" />

      {/* 一品红 */}
      <path class="tr-pot" d="M204 268 h38 l-5 34 h-28 z" />
      {[[-14, -8], [0, -18], [14, -8], [-7, 6], [9, 4]].map(([dx, dy], i) => (
        <g transform={`translate(${223 + dx} ${248 + dy}) rotate(${i * 40})`}>
          <path class={i % 2 ? 'tr-leaf' : 'tr-bract'} d="M0 0 l-5 -13 l5 -4 l5 4 z" />
          <path class={i % 2 ? 'tr-bract' : 'tr-leaf'} d="M0 0 l13 -5 l4 5 l-4 5 z" />
        </g>
      ))}

      {/* 清洁剂 */}
      <path class="tr-bottle" d="M30 302 v-40 q0 -8 8 -8 h12 q8 0 8 8 v40 z" />
      <rect class="tr-label" x="34" y="272" width="20" height="18" rx="2" />
      <path class="tr-bottle" d="M40 254 v-8 h8 l10 -2 v6 h-10 v4" />

      {/* 一只坐着的猫，只是装饰 */}
      <g class="tr-cat">
        <ellipse cx="520" cy="290" rx="22" ry="20" />
        <circle cx="522" cy="258" r="15" />
        <path d="M510 249 l1 -14 l9 9 z M534 249 l-1 -14 l-9 9 z" />
        <path class="tr-tail" d="M500 302 q-18 6 -10 -16" />
        <circle class="tr-eye" cx="517" cy="257" r="1.8" />
        <circle class="tr-eye" cx="527" cy="257" r="1.8" />
      </g>
    </>
  );
}

export default function ToxinRoom({ emergencyHref }: { emergencyHref: string }) {
  const [found, setFound] = useState<string[]>([]);
  const [last, setLast] = useState<string>();
  const [miss, setMiss] = useState<{ x: number; y: number; k: number } | null>(null);
  const done = found.length === HAZARDS.length;

  const click = (e: MouseEvent) => {
    const svg = e.currentTarget as SVGSVGElement;
    const m = svg.getScreenCTM();
    if (!m) return;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    const hit = HAZARDS.find(({ box: [x, y, w, h] }) => p.x >= x - 4 && p.x <= x + w + 4 && p.y >= y - 4 && p.y <= y + h + 4);
    if (hit) {
      setMiss(null);
      setLast(hit.id);
      setFound((f) => (f.includes(hit.id) ? f : [...f, hit.id]));
    } else {
      setMiss({ x: p.x, y: p.y, k: Date.now() });
    }
  };

  const current = HAZARDS.find((h) => h.id === last);

  return (
    <div class="toxin-room">
      <p class="fine">一个普通的客厅。点出你觉得对猫有危险的东西。</p>

      <svg class="tr-svg" viewBox="0 0 600 340" onClick={click} role="img" aria-label="客厅">
        <Room />
        {HAZARDS.filter((h) => found.includes(h.id)).map(({ id, box: [x, y, w, h] }) => (
          <rect class={id === last ? 'tr-mark on' : 'tr-mark'} key={id} x={x - 4} y={y - 4} width={w + 8} height={h + 8} rx="8" />
        ))}
        {miss && <circle class="sc-miss" key={miss.k} cx={miss.x} cy={miss.y} r="9" />}
      </svg>

      <div class="actions">
        <span class="sc-count">
          找到 <b>{found.length}</b> / {HAZARDS.length} 样
        </span>
        {!done && (
          <button class="btn small" type="button" onClick={() => { setFound(HAZARDS.map((h) => h.id)); setLast(undefined); }}>
            全部告诉我
          </button>
        )}
        {found.length > 0 && (
          <button class="btn small" type="button" onClick={() => { setFound([]); setLast(undefined); setMiss(null); }}>
            重新找
          </button>
        )}
      </div>

      {current && (
        <div class={current.urgent ? 'tr-card urgent' : 'tr-card'} aria-live="polite">
          <b>{current.name}</b>
          <p>{current.text}</p>
        </div>
      )}

      {done && !current && (
        <ul class="tr-all">
          {HAZARDS.map((h) => (
            <li>
              <b>{h.name}</b>
              {h.text}
            </li>
          ))}
        </ul>
      )}

      {found.length > 0 && (
        <p class="tr-sos">
          怀疑猫吃了、舔了或碰了其中任何一样：<b>立刻打电话给兽医</b>，不要等症状出现，也不要自己催吐。带上包装、标签或植物，记下大概的时间。
          <a href={emergencyHref}>急症清单里的这一条</a>
        </p>
      )}

      {done && <p class="fine">这些只是常见的，不是全部；名单之外的东西也可能有毒（Cornell）。</p>}
    </div>
  );
}
