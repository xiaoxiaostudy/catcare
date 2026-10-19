import { useState } from 'preact/hooks';
import { Segmented } from '../cats/Segmented';

/**
 * 肢体语言：尾巴、耳朵、眼睛、胡须、身体各自切换，看这只猫在「说」什么。
 * 每一格的文字取自笔记 communication-stress 第 1 节 iCatCare 的表，不要自己改写。
 */

type Mood = 'calm' | 'fear' | 'tense';
type Part = 'tail' | 'ears' | 'eyes' | 'whiskers' | 'body';

const MOODS: [Mood, string][] = [
  ['calm', '友好、放松'],
  ['fear', '害怕、焦虑'],
  ['tense', '沮丧、紧张、敌意'],
];

const PARTS: { id: Part; name: string; say: Record<Mood, string> }[] = [
  {
    id: 'tail',
    name: '尾巴',
    say: { calm: '竖直朝上走过来，是友好的意思', fear: '夹在两条后腿之间', tense: '竖起炸毛，是「走开」的警告' },
  },
  {
    id: 'ears',
    name: '耳朵',
    say: { calm: '朝前，正常位置', fear: '压平贴在头上', tense: '竖起向外转，配合瞳孔变小，常是沮丧' },
  },
  {
    id: 'eyes',
    name: '眼睛',
    say: { calm: '放松、半闭眼、眨眼，表示满足、没有威胁', fear: '瞳孔放大，转开视线或快速眨眼', tense: '睁大眼睛盯着、很少眨眼，常见于对峙' },
  },
  {
    id: 'whiskers',
    name: '胡须',
    say: { calm: '自然向外，不太张开', fear: '紧贴脸颊、并在一起', tense: '张开、向前，紧张或高度警觉' },
  },
  {
    id: 'body',
    name: '身体',
    say: { calm: '躺着、蜷着或坐着，身体舒展', fear: '缩头缩脖子、身体贴地，随时准备逃', tense: '伸直、紧绷、身体朝前，可能是自信，也可能准备攻击' },
  },
];

const SHORT: Record<Mood, string> = { calm: '放松', fear: '害怕', tense: '紧张' };

type Pose = Record<Part, Mood>;
const all = (m: Mood): Pose => ({ tail: m, ears: m, eyes: m, whiskers: m, body: m });

function Cat({ p }: { p: Pose }) {
  // 身体姿势决定头的位置
  const head = { calm: [152, 78], fear: [150, 116], tense: [166, 74] }[p.body];
  const [hx, hy] = head;
  const body = {
    calm: { cy: 128, ry: 32, rot: 0 },
    fear: { cy: 152, ry: 22, rot: 0 },
    tense: { cy: 122, ry: 28, rot: -8 },
  }[p.body];

  const tail = {
    calm: { d: 'M66 124 C46 104 44 64 54 42 q4 -7 11 -3', w: 9 },
    fear: { d: 'M70 146 C76 172 112 178 128 170', w: 9 },
    tense: { d: 'M66 120 C54 100 52 66 56 38', w: 17 },
  }[p.tail];

  const earTurn = { calm: 0, fear: 62, tense: 26 }[p.ears];
  const earDrop = p.ears === 'fear' ? 8 : 0;

  const whisker = {
    calm: { len: 26, angles: [-10, 2, 14] },
    fear: { len: 15, angles: [24, 30, 36] },
    tense: { len: 32, angles: [-26, -4, 18] },
  }[p.whiskers];

  return (
    <svg class="bl-svg" viewBox="0 0 240 200" aria-hidden="true">
      <line class="bl-ground" x1="10" y1="180" x2="230" y2="180" />

      <g class="bl-cat">
        {/* 尾巴：先画一道深色的边，再画浅色的芯 */}
        <path class="bl-tail-edge" d={tail.d} style={{ strokeWidth: tail.w + 3 }} />
        <path class="bl-tail" d={tail.d} style={{ strokeWidth: tail.w }} />

        <g transform={`rotate(${body.rot} 110 ${body.cy})`}>
          <ellipse cx="108" cy={body.cy} rx="52" ry={body.ry} />
          <ellipse class="bl-patch" cx="96" cy={body.cy - body.ry * 0.4} rx="18" ry={body.ry * 0.45} />
          <circle cx="78" cy={body.cy + body.ry * 0.3} r={body.ry * 0.8} />
        </g>
        <rect x={hx - 22} y={body.cy} width="11" height={178 - body.cy} rx="5" />
        <rect x={hx - 6} y={body.cy} width="11" height={178 - body.cy} rx="5" />

        {/* 耳朵：绕耳根转，害怕时往两边压平 */}
        <g transform={`translate(0 ${earDrop})`}>
          <path d={`M${hx - 24} ${hy - 12} L${hx - 22} ${hy - 44} L${hx - 4} ${hy - 26} z`} transform={`rotate(${-earTurn} ${hx - 14} ${hy - 20})`} />
          <path d={`M${hx + 24} ${hy - 12} L${hx + 22} ${hy - 44} L${hx + 4} ${hy - 26} z`} transform={`rotate(${earTurn} ${hx + 14} ${hy - 20})`} />
        </g>
        <circle cx={hx} cy={hy} r="28" />
        <ellipse class="bl-patch" cx={hx + 12} cy={hy - 14} rx="10" ry="7" />

        {[-1, 1].map((s) => {
          const ex = hx + s * 11;
          const ey = hy - 3;
          if (p.eyes === 'calm') return <path class="bl-line" d={`M${ex - 6} ${ey} q6 4 12 0`} />;
          return (
            <g>
              <circle class="bl-eye" cx={ex} cy={ey} r="6.5" />
              {p.eyes === 'fear' ? <circle class="bl-pupil" cx={ex} cy={ey} r="5.2" /> : <ellipse class="bl-pupil" cx={ex} cy={ey} rx="1.4" ry="5" />}
            </g>
          );
        })}
        <path class="bl-nose" d={`M${hx - 3.5} ${hy + 7} h7 l-3.5 4 z`} />

        {[-1, 1].map((s) =>
          whisker.angles.map((a) => {
            const r = (a * Math.PI) / 180;
            const x1 = hx + s * 8;
            const y1 = hy + 11;
            return <line class="bl-whisker" x1={x1} y1={y1} x2={x1 + s * whisker.len * Math.cos(r)} y2={y1 + whisker.len * Math.sin(r)} />;
          }),
        )}
      </g>
    </svg>
  );
}

export default function BodyLanguage() {
  const [pose, setPose] = useState<Pose>(all('calm'));
  const moods = new Set(Object.values(pose));
  const one = moods.size === 1 ? pose.tail : undefined;

  return (
    <div class="body-language">
      <div class="actions">
        {MOODS.map(([m, label]) => (
          <button class={one === m ? 'btn small picked' : 'btn small'} type="button" onClick={() => setPose(all(m))}>
            一只{SHORT[m]}的猫
          </button>
        ))}
      </div>

      <div class="bl-stage">
        <Cat p={pose} />
        <div class="bl-read" aria-live="polite">
          <p class="bl-sum">{one ? <>这几处都在说：<b>{MOODS.find(([m]) => m === one)![1]}</b></> : '这几处说的不一样'}</p>
          <ul>
            {PARTS.map((part) => (
              <li class={`mood-${pose[part.id]}`}>
                <b>{part.name}</b>
                {part.say[pose[part.id]]}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div class="bl-controls">
        {PARTS.map((part) => (
          <div class="bl-row">
            <span class="field-label">{part.name}</span>
            <Segmented
              value={pose[part.id]}
              onChange={(v) => v && setPose({ ...pose, [part.id]: v as Mood })}
              options={MOODS.map(([m]) => [m, SHORT[m]])}
              label={part.name}
            />
          </div>
        ))}
      </div>

      <p class="fine">
        每一处的意思取自 iCatCare 的表。真实的猫要几处连起来看，再结合当时的情况。害怕的猫别硬抱，让它自己决定要不要靠近你。
      </p>
    </div>
  );
}
