import { useState } from 'preact/hooks';
import { recordsOf } from '../../lib/store';
import { Segmented } from '../cats/Segmented';
import { BASE, useData } from '../cats/useData';

/**
 * 喂多少：按 WSAVA 给健康成年猫（体型理想）的每天热量表，换算成多少克干粮、几罐湿粮。
 * 表和提醒都来自笔记 feeding-water 和 obesity，只是起点，要看体型再调。
 */

// WSAVA：体重（公斤）→ 每天热量（千卡）
const WSAVA: [number, number, number][] = [
  [2, 160, 170],
  [3, 200, 210],
  [4, 225, 250],
  [5, 250, 290],
  [6, 265, 330],
];

/** 表里只有整公斤，中间的体重按相邻两行线性估算 */
function kcalFor(kg: number): [number, number] | undefined {
  if (kg < 2 || kg > 6) return undefined;
  const i = Math.min(WSAVA.length - 2, Math.floor(kg - 2));
  const [w0, lo0, hi0] = WSAVA[i];
  const [, lo1, hi1] = WSAVA[i + 1];
  const t = kg - w0;
  return [lo0 + (lo1 - lo0) * t, hi0 + (hi1 - hi0) * t];
}

type Mix = 'dry' | 'wet' | 'half';
type DryUnit = 'kg' | '100g';
type WetUnit = 'can' | '100g';

const round5 = (n: number) => Math.round(n / 5) * 5;
const range = (a: number, b: number, digits = 0) => {
  const f = (n: number) => (digits ? n.toFixed(digits) : String(Math.round(n)));
  return f(a) === f(b) ? f(a) : `${f(a)}–${f(b)}`;
};

export default function FoodCalc() {
  const { data } = useData();
  const [weight, setWeight] = useState('');
  const [bcs, setBcs] = useState<string>();
  const [mix, setMix] = useState<Mix>('dry');
  const [dry, setDry] = useState('');
  const [dryUnit, setDryUnit] = useState<DryUnit>('kg');
  const [wet, setWet] = useState('');
  const [wetUnit, setWetUnit] = useState<WetUnit>('can');
  const [treats, setTreats] = useState(true);

  // 「我的猫」里有体重记录的猫，可以一键填进来
  const known = data.cats
    .map((c) => {
      const recs = recordsOf(data, c.id);
      const w = [...recs].reverse().find((r) => r.weight !== undefined)?.weight;
      const b = [...recs].reverse().find((r) => r.bcs !== undefined)?.bcs;
      return { cat: c, w, b };
    })
    .filter((k) => k.w !== undefined);

  const kg = Number(weight);
  const kcal = weight ? kcalFor(kg) : undefined;
  const score = bcs ? Number(bcs) : undefined;
  const offIdeal = score !== undefined && score !== 5;

  const share = treats ? 0.9 : 1; // 留 10% 给零食
  const dryKcal = mix === 'wet' ? 0 : mix === 'half' ? 0.5 : 1;
  const wetKcal = 1 - dryKcal;

  const dryPerGram = Number(dry) / (dryUnit === 'kg' ? 1000 : 100);
  const wetPer = Number(wet);

  const show = kcal && !offIdeal;
  const lo = show ? kcal[0] * share : 0;
  const hi = show ? kcal[1] * share : 0;

  return (
    <div class="food-calc">
      {known.length > 0 && (
        <div class="actions">
          {known.map(({ cat, w, b }) => (
            <button
              class="btn small"
              type="button"
              onClick={() => {
                setWeight(String(w));
                setBcs(b !== undefined ? String(b) : undefined);
              }}
            >
              用{cat.name}记的体重 {w} 公斤{b !== undefined ? ` · ${b} 分` : ''}
            </button>
          ))}
        </div>
      )}

      <div class="fc-grid">
        <label class="field">
          <span class="field-label">体重</span>
          <span class="fc-input">
            <input type="number" inputMode="decimal" min="0" step="0.1" value={weight} onInput={(e) => setWeight(e.currentTarget.value)} placeholder="比如 4.2" />
            公斤
          </span>
        </label>
        <div class="field">
          <span class="field-label">
            体型评分 <a href={`${BASE}tools/body-condition/`}>怎么评？</a>
          </span>
          <Segmented
            value={bcs}
            onChange={setBcs}
            options={[['4', '4 偏瘦'], ['5', '5 理想'], ['6', '6 偏胖'], ['7', '7 以上']]}
            label="体型评分"
          />
        </div>
      </div>

      {weight && !kcal && <p class="banner warn">WSAVA 的表只列了 2 到 6 公斤的成年猫。其他体重、还在长身体的小猫，喂多少问兽医。</p>}

      {offIdeal && score! > 5 && (
        <p class="banner warn">
          体型偏胖时，别自己按这个数减量。减重要在兽医指导下慢慢来，大约每周减体重的 1% 到 2%；突然少喂，会有得脂肪肝的危险，这病不及时治会致命。
        </p>
      )}
      {offIdeal && score! < 5 && <p class="banner warn">体型偏瘦，先找兽医看看原因，再定喂多少。</p>}

      {show && (
        <>
          <p class="fc-kcal">
            每天大约 <b>{range(round5(kcal[0]), round5(kcal[1]))}</b> 千卡
            {treats && <span class="fine">（主粮 {range(round5(lo), round5(hi))} 千卡，留一成给零食）</span>}
          </p>

          <div class="field">
            <span class="field-label">吃什么</span>
            <Segmented value={mix} onChange={(v) => v && setMix(v as Mix)} options={[['dry', '全干粮'], ['half', '一半一半'], ['wet', '全湿粮']]} label="吃什么" />
          </div>

          <div class="fc-grid">
            {mix !== 'wet' && (
              <div class="field">
                <span class="field-label">干粮包装上的热量</span>
                <span class="fc-input">
                  <input type="number" inputMode="decimal" min="0" aria-label="干粮热量" value={dry} onInput={(e) => setDry(e.currentTarget.value)} placeholder={dryUnit === 'kg' ? '比如 3800' : '比如 380'} />
                  千卡 /
                  <Segmented value={dryUnit} onChange={(v) => v && setDryUnit(v as DryUnit)} options={[['kg', '公斤'], ['100g', '100 克']]} label="干粮热量单位" />
                </span>
              </div>
            )}
            {mix !== 'dry' && (
              <div class="field">
                <span class="field-label">湿粮包装上的热量</span>
                <span class="fc-input">
                  <input type="number" inputMode="decimal" min="0" aria-label="湿粮热量" value={wet} onInput={(e) => setWet(e.currentTarget.value)} placeholder={wetUnit === 'can' ? '比如 80' : '比如 100'} />
                  千卡 /
                  <Segmented value={wetUnit} onChange={(v) => v && setWetUnit(v as WetUnit)} options={[['can', '每罐（袋）'], ['100g', '100 克']]} label="湿粮热量单位" />
                </span>
              </div>
            )}
          </div>

          <div class="fc-out">
            {mix !== 'wet' && (
              <p>
                干粮：每天 <b>{dryPerGram > 0 ? range((lo * dryKcal) / dryPerGram, (hi * dryKcal) / dryPerGram) : '?'}</b> 克
              </p>
            )}
            {mix !== 'dry' && (
              <p>
                湿粮：每天{' '}
                <b>{wetPer > 0 ? (wetUnit === 'can' ? range((lo * wetKcal) / wetPer, (hi * wetKcal) / wetPer, 1) : range(((lo * wetKcal) / wetPer) * 100, ((hi * wetKcal) / wetPer) * 100)) : '?'}</b>{' '}
                {wetUnit === 'can' ? '罐（袋）' : '克'}
              </p>
            )}
          </div>

          <label class="fc-check">
            <input type="checkbox" checked={treats} onChange={(e) => setTreats(e.currentTarget.checked)} />
            留一成热量给零食（零食不超过每天热量的 10% 到 15%）
          </label>
        </>
      )}

      <p class="fine">
        这只是起点。WSAVA 的表是给健康、体型理想的成年猫的参考，每只猫不一样；表里只有整公斤，中间的体重是按相邻两行估算的。干粮要用秤称，合适的量看起来很少。之后定期称体重、看体型，往哪边走再调整。
      </p>
    </div>
  );
}
