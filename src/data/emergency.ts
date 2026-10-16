// 急症清单（临时版）：只收录已写笔记里「就医红线」明确写到的情况，
// 措辞和来源都以笔记为准。《急症清单》正式写好后用它替换。

export type Tier = 'now' | 'soon' | 'call';

export const TIERS: Record<Tier, { label: string; hint: string }> = {
  now: { label: '立刻去医院', hint: '马上联系兽医或直接去急诊，不要在家等' },
  soon: { label: '尽快联系兽医', hint: '今天就打电话问兽医' },
  call: { label: '联系兽医看诊', hint: '记下情况，约时间带去看' },
};

export interface Source {
  name: string;
  url?: string;
}

export interface Situation {
  id: string;
  tier: Tier;
  title: string;
  signs: string;
  action: string;
  why: string;
  sources: Source[];
  note: string;
}

const CORNELL = 'https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics';

export const SITUATIONS: Situation[] = [
  {
    id: 'blocked',
    tier: 'now',
    title: '公猫反复去砂盆，几乎没有尿',
    signs: '而且越来越不安、疼得叫',
    action: '立刻联系兽医或去急诊。别当成便秘在家观察。',
    why: 'Cornell 说尿道堵塞是绝对的急症，从完全堵塞到死亡可能不到 24 到 48 小时。公猫尿道更长更窄，风险比母猫高。尿道堵塞时猫也会频繁去砂盆，很容易被误认成便秘。',
    sources: [{ name: 'Cornell：Feline Lower Urinary Tract Disease', url: `${CORNELL}/feline-lower-urinary-tract-disease` }],
    note: 'eating-drinking-elimination',
  },
  {
    id: 'breathing-plus',
    tier: 'now',
    title: '呼吸偏快，同时还有别的表现',
    signs: '呼吸费力、坐立不安、找不到舒服的睡姿或开始坐着睡、咳嗽或干呕、虚弱、不吃、没精神；后腿无力或瘫痪、前腿跛行、疼痛',
    action: '可能是急症，尤其是半夜，可能需要去急诊。先打电话给兽医或急诊医院。',
    why: 'VCA 的建议：呼吸偏高的同时还有其他表现，可能是急症。',
    sources: [{ name: 'VCA Canada：怎么数猫的呼吸频率' }],
    note: 'resting-breathing',
  },
  {
    id: 'not-eating',
    tier: 'soon',
    title: '持续不吃东西',
    signs: '成年猫持续没有食欲，约 24 小时',
    action: '尽快联系兽医，不要等几天看看。',
    why: 'Cornell 说持续食欲丧失短到 24 小时就可能严重影响成年猫健康。伊利诺伊大学兽医学院说，猫连续几天不吃有发生脂肪肝的风险，超重的猫风险更高。',
    sources: [
      { name: 'Cornell：Anorexia', url: `${CORNELL}/anorexia` },
      { name: '伊利诺伊大学：Hepatic Lipidosis', url: 'https://vetmed.illinois.edu/pet-health-columns/hepatic-lipidosis-when-cats-dont-eat/' },
    ],
    note: 'eating-drinking-elimination',
  },
  {
    id: 'dehydration',
    tier: 'soon',
    title: '像是缺水，又不吃、没力气',
    signs: '精神差、虚弱、牙龈干燥，严重时眼睛凹陷；轻提肩部皮肤，回弹变慢（老年猫本来弹性就差）',
    action: '尽快联系兽医。',
    why: 'Cornell 建议出现脱水迹象并且不吃、虚弱时尽快联系兽医。',
    sources: [{ name: 'Cornell：Hydration', url: `${CORNELL}/hydration` }],
    note: 'eating-drinking-elimination',
  },
  {
    id: 'fast-breathing',
    tier: 'soon',
    title: '睡着时呼吸持续偏快',
    signs: '睡熟或安静休息、没有呼噜时数呼吸，明显比它平时快',
    action: '先在两三个小时内多数几次，确认是不是持续偏高；持续偏高就尽快联系兽医。',
    why: 'VCA 说持续高于每分钟 30 次视为偏高，兽医通常会约一两天内复查。AAFP 给心脏病猫的监测表是 40 次以上联系兽医、50 次以上尽快联系。两个来源的线不一样，以你的兽医给的为准。',
    sources: [{ name: 'VCA Canada' }, { name: 'AAFP 呼吸监测表' }],
    note: 'resting-breathing',
  },
  {
    id: 'constipation',
    tier: 'call',
    title: '超过 48 小时没排便',
    signs: '或者粪便又干又硬、用力排便',
    action: '联系兽医。',
    why: '健康成年猫通常每天排便 1 到 2 次。OVC 建议出现这些情况时联系兽医。',
    sources: [{ name: '圭尔夫大学 OVC：便秘', url: 'https://ovcpetnutrition.uoguelph.ca/2025/11/20/is-your-cat-having-trouble-pooping-lets-talk-constipation/' }],
    note: 'eating-drinking-elimination',
  },
  {
    id: 'drinking-more',
    tier: 'call',
    title: '喝水或尿量突然明显增多',
    signs: '和它平时比，明显多了',
    action: '联系兽医。不要自己限制它喝水。',
    why: 'Cornell 提到饮水和排尿突然增多可能提示糖尿病等问题。',
    sources: [{ name: 'Cornell：Hydration', url: `${CORNELL}/hydration` }],
    note: 'eating-drinking-elimination',
  },
  {
    id: 'behavior',
    tier: 'call',
    title: '行为变了，又找不到原因',
    signs: '躲起来、不愿跳或跳不高、梳毛变多或变少、睡觉姿势变了、不爱用砂盆、叫声变多',
    action: '带去看兽医，和兽医一起找原因。',
    why: '猫很会隐藏疼痛，主人能看到的往往只是这些小变化。Texas A&M 建议出现这些迹象就带去看兽医；AMC 说任何偏离自家猫基线、找不到明显原因的变化，都值得联系兽医。',
    sources: [{ name: 'Texas A&M' }, { name: 'AMC' }],
    note: 'subtle-changes',
  },
];
