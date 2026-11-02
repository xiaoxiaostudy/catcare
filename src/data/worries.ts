// 「我家猫……」：按读者担心的情况找笔记。只收已写好的笔记里讲到的情况，不写新的医学内容。
// notes 是笔记文件名，按先看哪篇排；emergency 是急症清单（src/data/emergency.ts）里对应条目的 id，有就会提示去看急症清单。

export interface Worry {
  text: string;
  notes: string[];
  emergency?: string;
}

export interface WorryGroup {
  name: string;
  items: Worry[];
}

export const WORRIES: WorryGroup[] = [
  {
    name: '身体好像不对劲',
    items: [
      { text: '公猫老去砂盆，却几乎没有尿', notes: ['urinary-blockage'], emergency: 'blocked' },
      { text: '可能吃了、舔了不该碰的东西', notes: ['household-toxins', 'accidents-foreign-bodies'], emergency: 'poison' },
      { text: '睡着时呼吸好像很快', notes: ['resting-breathing'], emergency: 'fast-breathing' },
      { text: '一天多没吃东西', notes: ['dont-wait'], emergency: 'not-eating' },
      { text: '吐了，或者老吐毛球', notes: ['dont-wait', 'grooming'], emergency: 'vomiting' },
      { text: '拉肚子', notes: ['dont-wait'] },
      { text: '两天没拉，或者拉得很费劲', notes: ['eating-drinking-elimination'], emergency: 'constipation' },
      { text: '突然撞家具，像是看不见了', notes: ['dont-wait'], emergency: 'blindness' },
      { text: '喝水、尿尿好像变多了', notes: ['eating-drinking-elimination', 'kidney-disease', 'diabetes'], emergency: 'drinking-more' },
      { text: '吃得多，却在变瘦', notes: ['hyperthyroidism', 'diabetes'] },
      { text: '打喷嚏、流鼻涕、眼睛有分泌物', notes: ['cat-flu'] },
      { text: '嘴巴臭', notes: ['dental-disease'] },
      { text: '老挠，毛里有黑色小颗粒', notes: ['parasites', 'grooming'] },
      { text: '越来越胖', notes: ['body-condition', 'obesity'] },
    ],
  },
  {
    name: '行为让我头疼',
    items: [
      { text: '不在砂盆里尿', notes: ['house-soiling', 'litter-box'] },
      { text: '老舔同一块地方，舔秃了', notes: ['over-grooming'] },
      { text: '突然咬人、抓人', notes: ['aggression'] },
      { text: '躲起来、变安静了', notes: ['subtle-changes', 'communication-stress'], emergency: 'behavior' },
      { text: '家里几只猫处不来', notes: ['multi-cat'] },
      { text: '把沙发抓得一道一道', notes: ['enrichment', 'claw-trimming'] },
      { text: '不让梳毛、不让刷牙', notes: ['grooming', 'toothbrushing'] },
    ],
  },
  {
    name: '日常拿不准',
    items: [
      { text: '刚接回一只小猫', notes: ['kitten', 'vaccines', 'parasites'] },
      { text: '该不该绝育，什么时候做', notes: ['neutering'] },
      { text: '一天该喂多少', notes: ['feeding-water'] },
      { text: '怎么挑猫粮', notes: ['food-labels', 'diet-types'] },
      { text: '老猫不往高处跳了', notes: ['senior-cat'] },
    ],
  },
];
