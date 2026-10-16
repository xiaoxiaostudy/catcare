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
    signs: '用力时叫或明显难受、越来越烦躁、舔生殖器附近；再往后会不吃、精神差、呕吐',
    action: '立刻联系兽医或去急诊，不分白天黑夜。别当成便秘在家观察，也别自己按压肚子。',
    why: '公猫尿道又细又长，容易被栓子、结石或痉挛堵死。Cornell 说从完全堵住到死亡可能不到 24 到 48 小时，iCatCare 和 Merck 说不治疗 2 到 3 天内可能致命，而且非常疼。绝育的公猫也一样有风险。',
    sources: [
      { name: 'iCatCare：Urethral obstruction', url: 'https://icatcare.org/articles/urethral-obstruction-in-cats' },
      { name: 'Cornell：Feline Lower Urinary Tract Disease', url: `${CORNELL}/feline-lower-urinary-tract-disease` },
    ],
    note: 'urinary-blockage',
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
    id: 'poison',
    tier: 'now',
    title: '怀疑吃了、舔了或碰了有毒的东西',
    signs: '比如百合（花粉、花瓶水也算）、人吃的药、狗用的跳蚤药、清洁剂、灭鼠药；可能出现呕吐、流口水、抽搐、呼吸困难，也可能还没有任何症状',
    action: '立刻打电话给兽医或急诊，不要等症状出现。不要自己催吐，除非兽医让你这么做。带上包装、标签或植物，记下大概的时间。',
    why: 'Cornell 说，等主人发现不对劲时，猫可能已经有严重的风险；有些毒物在呕吐时伤害更大。iCatCare 说百合中毒是急症，发展很快，越早治疗活下来的机会越大。',
    sources: [
      { name: 'Cornell：Common Cat Hazards', url: `${CORNELL}/common-cat-hazards` },
      { name: 'iCatCare：Lily poisoning in cats', url: 'https://icatcare.org/articles/lily-poisoning-in-cats' },
    ],
    note: 'household-toxins',
  },
  {
    id: 'seizure',
    tier: 'now',
    title: '抽搐',
    signs: '24 小时内抽了 2 次或以上，一次超过 5 分钟，或者停不下来',
    action: '立刻去兽医院。抽的时候把周围会撞到的东西挪开，用手表计时；不要按住它，手不要靠近它的嘴。只抽了一次、很快停了，之后也要联系兽医。',
    why: 'AVMA 的宠物急救指南把这三种情况列为要立刻送医的抽搐。抽搐也是 Cornell 列出的中毒信号之一。',
    sources: [
      { name: 'AVMA：First aid tips for pet owners', url: 'https://www.avma.org/resources-tools/pet-owners/emergencycare/first-aid-tips-pet-owners' },
    ],
    note: 'before-the-vet',
  },
  {
    id: 'fall',
    tier: 'now',
    title: '从窗户、阳台或高处掉下来',
    signs: '就算看起来没受伤、还能走能跳',
    action: '马上联系兽医，通常需要急诊处理。',
    why: 'iCatCare 说，猫从高处掉下来可能骨折、伤到韧带，还可能伤到膀胱、肺这些内脏；内伤从外面不一定看得出来。摔伤的猫大部分是不到一岁的年轻猫。',
    sources: [{ name: 'iCatCare：High-rise cats', url: 'https://icatcare.org/articles/high-rise-cats' }],
    note: 'accidents-foreign-bodies',
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
    id: 'foreign-body',
    tier: 'soon',
    title: '吞了线、针、发圈或其他不该吃的东西',
    signs: '知道或怀疑它吞了；或者出现不吃、干呕、呕吐、肚子疼、没精神',
    action: '尽快联系兽医，别等它自己拉出来。看到线从嘴里露出来，不要往外拉。告诉兽医家里不见了什么。',
    why: 'iCatCare 说吞下的东西很多时候排不出来，线状物会让肠子挤成一团，通常要手术。Merck 说线可能缠在舌根，随着肠子蠕动像锯子一样割破肠壁。「不要拉线」目前只有 B 级来源。',
    sources: [
      { name: 'iCatCare：Cats and foreign bodies', url: 'https://icatcare.org/articles/cats-and-foreign-bodies' },
      { name: 'Merck：胃肠道梗阻', url: 'https://www.merckvetmanual.com/cat-owners/digestive-disorders-of-cats/disorders-of-the-stomach-and-intestines-in-cats' },
    ],
    note: 'accidents-foreign-bodies',
  },
  {
    id: 'urinary-signs',
    tier: 'soon',
    title: '还能尿出来，但尿频、尿血或排尿用力',
    signs: '排尿时叫、在砂盆外尿、频繁舔生殖器附近',
    action: '尽快约兽医。如果是公猫，留意它是不是越尿越少，一旦几乎尿不出来，就按上面的急症处理。',
    why: 'iCatCare 说，猫还能尿出来但有下泌尿道信号时，也要尽快约兽医；尿道堵死之前的几天，常常就能看到尿频、用力、尿血这些变化。',
    sources: [
      { name: 'iCatCare：Urethral obstruction', url: 'https://icatcare.org/articles/urethral-obstruction-in-cats' },
      { name: 'Cornell：Feline Lower Urinary Tract Disease', url: `${CORNELL}/feline-lower-urinary-tract-disease` },
    ],
    note: 'urinary-blockage',
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
