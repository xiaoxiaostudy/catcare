import { useState } from 'preact/hooks';

/**
 * 找不同：同一只猫、同一个房间，上个月和这个月。
 * 每一处不同都对应笔记 subtle-changes 第 1 节表里的一行，说明里的出处和笔记一致。
 */

interface Diff {
  id: string;
  box: [number, number, number, number]; // 在画面里的范围 x, y, w, h（viewBox 坐标）
  title: string;
  text: string;
  link?: 'blocked';
}

const DIFFS: Diff[] = [
  {
    id: 'tree',
    box: [10, 26, 74, 40],
    title: '猫爬架最高层空了',
    text: '上个月它常睡在最高那层，现在不上去了。不愿跳、跳的高度变了，是慢性疼痛常见的表现（Texas A&M）。dvm360 提到猫的关节病常常两侧都有，所以明显跛行反而不常见。',
  },
  {
    id: 'cat',
    box: [206, 134, 58, 30],
    title: '它缩在床底下',
    text: '换了睡觉的地方，缩成一团，可能是躺下后找不到舒服的姿势；大部分时间躲在床下，也是要留意的变化（PMC、Texas A&M）。看起来在睡，也可能是醒着在警惕。',
  },
  {
    id: 'food',
    box: [92, 136, 34, 26],
    title: '饭剩下了',
    text: '食欲改变是 Texas A&M 列出的信号之一。如果是完全不吃，就不只是细微变化了：成年猫持续不吃约 24 小时，就要尽快联系兽医。',
  },
  {
    id: 'litter',
    box: [146, 128, 58, 34],
    title: '砂盆里的尿团少了',
    text: '砂盆用得少了，尤其是边缘很高的砂盆，Texas A&M 也把它列为疼痛的信号；可以检查一下砂盆边缘是不是太高。',
    link: 'blocked',
  },
];

function Scene({ now }: { now: boolean }) {
  return (
    <>
      <rect class="sc-wall" x="0" y="0" width="300" height="160" />
      <rect class="sc-floor" x="0" y="160" width="300" height="40" />

      {/* 猫爬架 */}
      <rect class="sc-wood" x="40" y="60" width="8" height="100" />
      <rect class="sc-wood" x="20" y="156" width="48" height="6" rx="2" />
      <rect class="sc-plank" x="16" y="58" width="64" height="6" rx="2" />
      <rect class="sc-plank" x="26" y="108" width="44" height="6" rx="2" />

      {/* 床，床底下一片阴影 */}
      <rect class="sc-under" x="210" y="134" width="84" height="26" />
      <rect class="sc-bed" x="206" y="104" width="92" height="30" rx="4" />
      <rect class="sc-pillow" x="266" y="96" width="26" height="12" rx="5" />
      <rect class="sc-wood" x="208" y="134" width="5" height="26" />
      <rect class="sc-wood" x="291" y="134" width="5" height="26" />

      {/* 食盆和水碗 */}
      {now && <ellipse class="sc-kibble" cx="109" cy="150" rx="11" ry="5" />}
      <path class="sc-bowl" d="M95 150 h28 l-4 10 h-20 z" />
      <path class="sc-bowl" d="M128 150 h20 l-3 10 h-14 z" />
      <ellipse class="sc-water" cx="138" cy="151" rx="9" ry="2" />

      {/* 高边砂盆和尿团 */}
      <rect class="sc-box" x="150" y="136" width="50" height="24" rx="3" />
      <rect class="sc-litter" x="154" y="136" width="42" height="5" />
      {(now ? [[166, 138]] : [[162, 138], [176, 139], [189, 138]]).map(([x, y]) => (
        <ellipse class="sc-clump" cx={x} cy={y} rx="5" ry="2.5" />
      ))}

      {now ? (
        // 这个月：缩在床底下，只看得到一团和两只眼睛
        <g class="sc-cat">
          <ellipse cx="236" cy="152" rx="20" ry="9" />
          <circle cx="222" cy="148" r="8" />
          <path d="M216 142 l2 -7 l4 5 z M224 141 l3 -6 l2 7 z" />
          <circle class="sc-eye" cx="219" cy="148" r="1.6" />
          <circle class="sc-eye" cx="225" cy="148" r="1.6" />
        </g>
      ) : (
        // 上个月：在最高层伸展着睡
        <g class="sc-cat">
          <ellipse cx="46" cy="50" rx="24" ry="8" />
          <ellipse class="sc-patch" cx="40" cy="48" rx="9" ry="5" />
          <circle cx="72" cy="47" r="8" />
          <path d="M67 41 l1 -7 l5 5 z M75 41 l3 -6 l2 7 z" />
          <path class="sc-tail" d="M23 52 q-12 4 -8 14" />
          <path class="sc-shut" d="M68 47 q2 1.5 4 0 M74 47 q2 1.5 4 0" />
        </g>
      )}
    </>
  );
}

export default function SpotChange({ base }: { base: string }) {
  const [found, setFound] = useState<string[]>([]);
  const [miss, setMiss] = useState<{ x: number; y: number; k: number } | null>(null);
  const done = found.length === DIFFS.length;

  const click = (e: MouseEvent) => {
    const svg = e.currentTarget as SVGSVGElement;
    const m = svg.getScreenCTM();
    if (!m) return;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    const pad = 6;
    const hit = DIFFS.find(({ box: [x, y, w, h] }) => p.x >= x - pad && p.x <= x + w + pad && p.y >= y - pad && p.y <= y + h + pad);
    if (hit) {
      setMiss(null);
      setFound((f) => (f.includes(hit.id) ? f : [...f, hit.id]));
    } else {
      setMiss({ x: p.x, y: p.y, k: Date.now() });
    }
  };

  const shown = DIFFS.filter((d) => found.includes(d.id));

  return (
    <div class="spot-change">
      <p class="fine">同一只猫、同一个房间。在任意一张图上点出不一样的地方。</p>

      <div class="sc-pair">
        {[false, true].map((now) => (
          <figure>
            <svg class="sc-svg" viewBox="0 0 300 200" onClick={click} role="img" aria-label={now ? '这个月的房间' : '上个月的房间'}>
              <Scene now={now} />
              {shown.map(({ id, box: [x, y, w, h] }) => (
                <ellipse class="sc-ring" key={id} cx={x + w / 2} cy={y + h / 2} rx={w / 2 + 6} ry={h / 2 + 6} />
              ))}
              {miss && <circle class="sc-miss" key={miss.k} cx={miss.x} cy={miss.y} r="7" />}
            </svg>
            <figcaption>{now ? '这个月' : '上个月'}</figcaption>
          </figure>
        ))}
      </div>

      <div class="actions">
        <span class="sc-count">
          找到 <b>{found.length}</b> / {DIFFS.length} 处
        </span>
        {!done && (
          <button class="btn small" type="button" onClick={() => setFound(DIFFS.map((d) => d.id))}>
            找不到了，告诉我
          </button>
        )}
        {found.length > 0 && (
          <button class="btn small" type="button" onClick={() => { setFound([]); setMiss(null); }}>
            重新找
          </button>
        )}
      </div>

      {shown.length > 0 && (
        <ol class="sc-list">
          {shown.map((d) => (
            <li key={d.id}>
              <b>{d.title}</b>
              <p>
                {d.text}
                {d.link === 'blocked' && (
                  <>
                    如果是公猫反复去砂盆却几乎没有尿，那是急症：<a href={`${base}emergency/#blocked`}>急症清单里的这一条</a>
                  </>
                )}
              </p>
            </li>
          ))}
        </ol>
      )}

      {done && (
        <div class="sc-end">
          <p>
            每一样单看都不起眼，没有跛行，也没有叫。加在一起，却可能是一只在忍着不舒服的猫。Texas A&M 的建议是：看到这些迹象，就带它去看兽医，和兽医一起找原因。
          </p>
          <p class="fine">
            要看出变化，先得知道它平时的样子。可以在<a href={`${base}cats/`}>「我的猫」</a>里每天记一笔，也可以每个月在同一个地方给它拍一段走动和跳上跳下的视频。
          </p>
        </div>
      )}
    </div>
  );
}
