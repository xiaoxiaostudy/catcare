import { useState } from 'preact/hooks';
import { recordsOf } from '../../lib/store';
import { Segmented } from '../cats/Segmented';
import { useData } from '../cats/useData';

/**
 * 喝多少水：按 Cornell 的「每 5 磅瘦体重每天约 4 盎司」（换算成每公斤约 52 毫升）算一天的总水量。
 * 总量包括食物里的水；湿粮含水最高约 80%，所以不替人算「要喝多少」，只提醒湿粮的水也算。数字和措辞跟笔记 eating-drinking-elimination 一致。
 */

const ML_PER_KG = 52;

type Diet = 'dry' | 'wet';

export default function WaterCalc() {
  const { data } = useData();
  const [weight, setWeight] = useState('');
  const [bcs, setBcs] = useState<number>();
  const [diet, setDiet] = useState<Diet>('dry');

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
  const ml = kg > 0 ? Math.round((kg * ML_PER_KG) / 10) * 10 : 0;

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
                setBcs(b);
              }}
            >
              用{cat.name}记的体重 {w} 公斤
            </button>
          ))}
        </div>
      )}

      <div class="fc-grid">
        <label class="field">
          <span class="field-label">体重</span>
          <span class="fc-input">
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={weight}
              onInput={(e) => {
                setWeight(e.currentTarget.value);
                setBcs(undefined);
              }}
              placeholder="比如 4.2"
            />
            公斤
          </span>
        </label>
        <div class="field">
          <span class="field-label">主要吃什么</span>
          <Segmented value={diet} onChange={(v) => v && setDiet(v as Diet)} options={[['dry', '干粮为主'], ['wet', '湿粮为主']]} label="主要吃什么" />
        </div>
      </div>

      {ml > 0 && (
        <>
          <p class="fc-kcal">
            一天总共大约 <b>{ml}</b> 毫升水
            <span class="fine">（喝的，加上食物里的）</span>
          </p>
          <p>
            {diet === 'dry'
              ? '吃干粮为主，这些水大部分要靠它自己喝。'
              : '湿粮里的水最多能占八成左右，也算在里面。吃湿粮的猫喝得少，是正常的。'}
          </p>
        </>
      )}

      {bcs !== undefined && bcs > 5 && (
        <p class="banner warn">它记的体型是 {bcs} 分，比理想胖。Cornell 是按瘦体重算的，偏胖的猫，体重请填兽医说的理想体重。</p>
      )}

      <p class="fine">
        这是 Cornell 给的大概数，不用每天量到毫升。更要紧的是它跟自己的平时比：喝水突然明显变多，联系兽医，别自己限制它喝水。
      </p>
    </div>
  );
}
