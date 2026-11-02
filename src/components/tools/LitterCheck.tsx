import { useState } from 'preact/hooks';
import { Segmented } from '../cats/Segmented';

/**
 * 给砂盆打个分：填几个、多大、什么砂、多久铲、放在哪，列出做得好的和可以改的。
 * 每一条的事实和出处都来自笔记 litter-box，措辞跟笔记一致，不另加。
 */

type Litter = 'clay' | 'loose' | 'silica' | 'plant' | 'tofu';
type Style = 'open' | 'covered' | 'flap' | 'auto' | 'top';
type Scoop = 'twice' | 'once' | 'less';
type Special = 'kitten' | 'senior' | 'surgery' | 'asthma';

const LITTERS: [Litter, string][] = [
  ['clay', '结团矿砂'],
  ['loose', '不结团矿砂'],
  ['silica', '水晶砂'],
  ['plant', '木、纸、玉米砂'],
  ['tofu', '豆腐砂或混合砂'],
];

const STYLES: [Style, string][] = [
  ['open', '开放的'],
  ['covered', '带盖的'],
  ['flap', '带盖有门帘'],
  ['auto', '自动砂盆'],
  ['top', '顶入式'],
];

const SPECIALS: [Special, string][] = [
  ['kitten', '有小猫'],
  ['senior', '有老猫或关节不好的'],
  ['surgery', '刚做完手术'],
  ['asthma', '有哮喘、呼吸道问题'],
];

interface Item {
  ok: boolean;
  text: string;
}

export default function LitterCheck() {
  const [cats, setCats] = useState<string>();
  const [boxes, setBoxes] = useState<string>();
  const [catLen, setCatLen] = useState('');
  const [boxLen, setBoxLen] = useState('');
  const [litter, setLitter] = useState<string>();
  const [scent, setScent] = useState<string>();
  const [style, setStyle] = useState<string>();
  const [scoop, setScoop] = useState<string>();
  const [farFood, setFarFood] = useState(false);
  const [quiet, setQuiet] = useState(false);
  const [apart, setApart] = useState(false);
  const [liner, setLiner] = useState(false);
  const [special, setSpecial] = useState<Special[]>([]);

  const has = (s: Special) => special.includes(s);
  const toggle = (s: Special) => setSpecial(has(s) ? special.filter((x) => x !== s) : [...special, s]);

  const items: Item[] = [];
  const n = Number(cats);
  const b = Number(boxes);

  if (n && b) {
    items.push(
      b >= n + 1
        ? { ok: true, text: `${b} 个砂盆，够 ${n} 只猫用：猫数加一（AAFP 指南、iCatCare）。` }
        : { ok: false, text: `${n} 只猫至少要 ${n + 1} 个砂盆，现在是 ${b} 个。一只猫也要 2 个，放两个地方（AAFP 指南）。` },
    );
  }

  const cl = Number(catLen);
  const bl = Number(boxLen);
  if (cl > 0 && bl > 0) {
    const need = Math.ceil(cl * 1.5);
    items.push(
      bl >= need
        ? { ok: true, text: `${bl} 厘米长，够大：至少要它鼻子到尾巴根的 1.5 倍，也就是 ${need} 厘米（AAFP 指南）。` }
        : { ok: false, text: `砂盆至少要 ${need} 厘米长（它鼻子到尾巴根的 1.5 倍），现在是 ${bl} 厘米。很多市面上的砂盆太小，大的收纳箱也行（AAFP 指南、iCatCare）。` },
    );
  }

  if (litter) {
    const l = litter as Litter;
    if (l === 'clay') items.push({ ok: true, text: '结团矿砂：大多数猫最爱用细颗粒、无香的结团砂（AAFP 指南、iCatCare）。' });
    if (l === 'loose') items.push({ ok: false, text: '不结团矿砂要更常整盆换（VCA）。大多数猫更爱用细颗粒的结团砂（AAFP 指南、iCatCare）。' });
    if (l === 'silica') items.push({ ok: false, text: '水晶砂对敏感的爪子可能太硬（VCA）；和结团砂放在一起，大多数猫选结团砂（研究）。' });
    if (l === 'plant')
      items.push(
        has('kitten') || has('surgery')
          ? { ok: true, text: '木、纸、玉米砂：粉尘少、对爪子温和（VCA），小猫和刚做完手术的猫用正合适（iCatCare、ASPCA、PDSA）。' }
          : { ok: false, text: '木、纸、玉米砂粉尘少、对爪子温和（VCA），但研究里猫用得比结团矿砂少，木颗粒最不受欢迎。它用得好就不用换。' },
      );
    if (l === 'tofu') items.push({ ok: false, text: '豆腐砂、混合砂没有兽医资料，也没有研究，没法按证据评价。留意它喜不喜欢这个盆的信号。' });

    if (has('kitten') && l === 'clay') items.push({ ok: false, text: '有小猫：iCatCare 建议先别用矿砂，有的小猫会吃砂；AAFP 生命阶段指南则说从无香的结团砂开始。两家说法不同，问问兽医。' });
    if (has('kitten') && l === 'silica') items.push({ ok: false, text: '有小猫：8 周以下的小猫别用硅胶砂（iCatCare）。' });
    if (has('surgery') && l !== 'plant') items.push({ ok: false, text: '刚做完手术：至少一周用纸砂或木颗粒，免得砂尘粘进伤口（ASPCA、PDSA）。' });
    if (has('asthma') && (l === 'clay' || l === 'loose')) items.push({ ok: false, text: '有哮喘、呼吸道问题：矿砂有粉尘，避开粉尘大的猫砂（Cornell、iCatCare、VCA）。' });
  }

  if (scent === 'yes') items.push({ ok: false, text: '换成无香的：香味猫砂、除臭剂，猫常常嫌冲，可能去别处上厕所（AAFP 指南、iCatCare）。' });
  if (scent === 'no') items.push({ ok: true, text: '无香的：香味猫砂猫常常嫌冲，无香的更好（AAFP 指南、iCatCare）。' });

  if (style) {
    const s = style as Style;
    if (s === 'open') items.push({ ok: true, text: '开放的：AAFP 指南建议尽量用开放的，你好看、好铲。' });
    if (s === 'covered') items.push({ ok: false, text: '带盖的也可以，盆要够大：小的带盖盆，大一点的猫很难摆好姿势。AAFP 指南建议尽量用开放的；拿不准就两种都放（iCatCare、Merck）。' });
    if (s === 'flap') items.push({ ok: false, text: '把门帘拿掉：门帘可能让它不愿进（iCatCare）。' });
    if (s === 'auto') items.push({ ok: false, text: '自动砂盆会突然动、出声，可能吓到它；很多尺寸太小（iCatCare）。' });
    if (s === 'top') items.push({ ok: !has('senior'), text: has('senior') ? '顶入式的，老猫和行动不便的猫进出很难，换成低边的（ASPCA、AAFP 指南）。' : '顶入式的，等它老了、关节不好了，进出会很难（ASPCA）。' });
  }
  if (has('senior') && style && style !== 'top') items.push({ ok: false, text: '有老猫：确认至少有一个低入口的砂盆，细颗粒的砂对爪子更好（AAFP 指南、iCatCare）。' });
  if (has('kitten') && style) items.push({ ok: false, text: '有小猫：要用低边的砂盆（Cornell、iCatCare）。' });

  if (scoop === 'twice') items.push({ ok: true, text: '每天铲两次：iCatCare 建议至少两次。' });
  if (scoop === 'once') items.push({ ok: true, text: '每天铲一次：AAFP 指南说至少一次，iCatCare 说至少两次，能铲两次更好。' });
  if (scoop === 'less') items.push({ ok: false, text: '每天至少铲一次，最好两次（AAFP 指南、iCatCare）。盆里看得见的脏，比气味更让猫避开（研究）。' });

  const touched = n || b || cl || bl || litter || scent || style || scoop;
  if (touched) {
    items.push(
      farFood
        ? { ok: true, text: '离食盆水盆远（iCatCare、Merck）。' }
        : { ok: false, text: '砂盆离食盆水盆远一点（iCatCare、Merck）。' },
      quiet
        ? { ok: true, text: '放在安静、人少的地方（iCatCare、Merck）。' }
        : { ok: false, text: '放在安静、人少、它容易去到的地方；离吵的电器、落地窗、猫门远一点（iCatCare、Merck）。' },
    );
    if (b > 1)
      items.push(
        apart
          ? { ok: true, text: '几个砂盆分开放（iCatCare）。' }
          : { ok: false, text: '几个砂盆别并排放，不然猫会当成一个，也容易被别的猫堵住（iCatCare）。' },
      );
    if (liner) items.push({ ok: false, text: '别套砂盆袋：会勾住爪子，很多猫不喜欢（iCatCare、AAFP 指南）。' });
  }

  const good = items.filter((i) => i.ok);
  const fix = items.filter((i) => !i.ok);

  return (
    <div class="food-calc litter-check">
      <div class="fc-grid">
        <div class="field">
          <span class="field-label">家里几只猫</span>
          <Segmented value={cats} onChange={setCats} options={[['1', '1'], ['2', '2'], ['3', '3'], ['4', '4']]} label="家里几只猫" />
        </div>
        <div class="field">
          <span class="field-label">几个砂盆</span>
          <Segmented value={boxes} onChange={setBoxes} options={[['1', '1'], ['2', '2'], ['3', '3'], ['4', '4'], ['5', '5']]} label="几个砂盆" />
        </div>
        <label class="field">
          <span class="field-label">猫从鼻子到尾巴根</span>
          <span class="fc-input">
            <input type="number" inputMode="decimal" min="0" value={catLen} onInput={(e) => setCatLen(e.currentTarget.value)} placeholder="比如 40" />
            厘米
          </span>
        </label>
        <label class="field">
          <span class="field-label">砂盆多长（最小的那个）</span>
          <span class="fc-input">
            <input type="number" inputMode="decimal" min="0" value={boxLen} onInput={(e) => setBoxLen(e.currentTarget.value)} placeholder="比如 50" />
            厘米
          </span>
        </label>
      </div>

      <div class="field">
        <span class="field-label">用什么砂</span>
        <Segmented value={litter} onChange={setLitter} options={LITTERS} label="用什么砂" />
      </div>
      <div class="fc-grid">
        <div class="field">
          <span class="field-label">有香味吗</span>
          <Segmented value={scent} onChange={setScent} options={[['no', '无香'], ['yes', '有香味']]} label="有香味吗" />
        </div>
        <div class="field">
          <span class="field-label">多久铲一次</span>
          <Segmented value={scoop} onChange={setScoop} options={[['twice', '一天两次以上'], ['once', '一天一次'], ['less', '不到一天一次']]} label="多久铲一次" />
        </div>
      </div>
      <div class="field">
        <span class="field-label">什么样的砂盆</span>
        <Segmented value={style} onChange={setStyle} options={STYLES} label="什么样的砂盆" />
      </div>

      <div class="field">
        <span class="field-label">放在哪（符合的打勾）</span>
        <div class="lc-checks">
          <label class="fc-check"><input type="checkbox" checked={farFood} onChange={(e) => setFarFood(e.currentTarget.checked)} />离食盆水盆远</label>
          <label class="fc-check"><input type="checkbox" checked={quiet} onChange={(e) => setQuiet(e.currentTarget.checked)} />安静、人少</label>
          <label class="fc-check"><input type="checkbox" checked={apart} onChange={(e) => setApart(e.currentTarget.checked)} />几个砂盆分开放</label>
          <label class="fc-check"><input type="checkbox" checked={liner} onChange={(e) => setLiner(e.currentTarget.checked)} />套了砂盆袋</label>
        </div>
      </div>

      <div class="field">
        <span class="field-label">家里有这些猫吗（可以不选）</span>
        <div class="lc-checks">
          {SPECIALS.map(([id, text]) => (
            <label class="fc-check">
              <input type="checkbox" checked={has(id)} onChange={() => toggle(id)} />
              {text}
            </label>
          ))}
        </div>
      </div>

      {items.length > 0 && (
        <div class="lc-result" aria-live="polite">
          <p class="lc-score">
            <b>{good.length}</b> 项做得好，<b>{fix.length}</b> 项可以改
          </p>
          {fix.length > 0 && (
            <ul class="lc-list fix">
              {fix.map((i) => (
                <li>{i.text}</li>
              ))}
            </ul>
          )}
          {good.length > 0 && (
            <ul class="lc-list good">
              {good.map((i) => (
                <li>{i.text}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <p class="fine">
        这只是对照笔记里的建议，不是打分标准。每只猫喜好不一样，它用得好好的就别急着全换；最准的还是看它自己：刨盆外、蹲盆沿、不埋，说明它不太喜欢。
      </p>
    </div>
  );
}
