// 学习地图：七大块和每块下的主题。
// 写好的主题用 note 字段指向 src/content/notes 里的文件名，状态以笔记 frontmatter 为准；
// 没写的主题状态一律是「未开始」。

export const STATUSES = ['未开始', '写作中', '已完成', '已审核'] as const;
export type Status = (typeof STATUSES)[number];

export const MODULE_IDS = [
  'recognize',
  'prevention',
  'nutrition',
  'diseases',
  'behavior',
  'life-stages',
  'daily-care',
] as const;
export type ModuleId = (typeof MODULE_IDS)[number];

export interface Topic {
  title: string;
  note?: string;
  /** 还没写笔记、但已经有互动工具的主题，指向工具页路径（不带 base） */
  tool?: string;
  tag?: string;
}

export interface Module {
  id: ModuleId;
  name: string;
  blurb: string;
  topics: Topic[];
}

export const MODULES: Module[] = [
  {
    id: 'recognize',
    name: '急症识别',
    blurb: '先知道自家猫的「正常」，才看得出不对劲',
    topics: [
      { title: '猫的正常生命体征', note: 'vital-signs' },
      { title: '怎么数静息呼吸', note: 'resting-breathing' },
      { title: '吃喝拉撒的正常范围与异常信号', note: 'eating-drinking-elimination' },
      { title: '猫的体型评分怎么看', note: 'body-condition', tool: 'tools/body-condition/' },
      { title: '猫很会忍，哪些细微变化要警惕', note: 'subtle-changes' },
      { title: '这些情况别等，立刻就医', note: 'dont-wait' },
      { title: '公猫尿不出：为什么是急事', note: 'urinary-blockage' },
      { title: '家里哪些东西对猫有毒', note: 'household-toxins' },
      { title: '意外和异物：哪些要马上送医', note: 'accidents-foreign-bodies' },
      { title: '送医前的正确做法', note: 'before-the-vet' },
      { title: '急症清单（一页成稿）', note: 'emergency-checklist' },
    ],
  },
  {
    id: 'prevention',
    name: '预防医疗',
    blurb: '绝育、疫苗、驱虫、体检',
    topics: [
      { title: '绝育的利弊与时机', note: 'neutering', tag: '优先' },
      { title: '疫苗原理、程序与加强免疫', note: 'vaccines' },
      { title: '体内外驱虫', note: 'parasites' },
      { title: '定期体检', note: 'checkups' },
    ],
  },
  {
    id: 'nutrition',
    name: '营养与饮食',
    blurb: '猫是肉食动物，吃什么、怎么吃',
    topics: [
      { title: '猫是肉食动物：蛋白质、水分、牛磺酸', note: 'carnivore' },
      { title: '看懂成分表和营养标注', note: 'food-labels' },
      { title: '干粮、湿粮、自制饮食的利弊', note: 'diet-types' },
      { title: '喂食方式和饮水', note: 'feeding-water' },
      { title: '肥胖的危害与体重管理', note: 'obesity' },
    ],
  },
  {
    id: 'diseases',
    name: '常见疾病',
    blurb: '最常见的几种病，早期长什么样',
    topics: [
      { title: '下泌尿道疾病', note: 'flutd' },
      { title: '慢性肾病', note: 'kidney-disease' },
      { title: '牙周病和口炎', note: 'dental-disease' },
      { title: '上呼吸道感染', note: 'cat-flu' },
      { title: '猫瘟', note: 'panleukopenia' },
      { title: '肥胖与糖尿病', note: 'diabetes' },
      { title: '甲亢', note: 'hyperthyroidism', tag: '老年猫' },
      { title: '肥厚型心肌病', note: 'hcm', tag: '老年猫' },
    ],
  },
  {
    id: 'behavior',
    name: '行为与环境',
    blurb: '读懂猫在说什么，给它一个好环境',
    topics: [
      { title: '猫的沟通方式与压力信号', note: 'communication-stress' },
      { title: '乱尿', note: 'house-soiling' },
      { title: '过度舔毛', note: 'over-grooming' },
      { title: '攻击行为', note: 'aggression' },
      { title: '环境丰容' },
      { title: '多猫家庭' },
    ],
  },
  {
    id: 'life-stages',
    name: '生命阶段',
    blurb: '幼猫、成年猫、老年猫各要注意什么',
    topics: [{ title: '幼猫和青少年猫' }, { title: '成年猫' }, { title: '老年猫' }],
  },
  {
    id: 'daily-care',
    name: '日常护理',
    blurb: '梳毛、刷牙、剪指甲、猫砂盆',
    topics: [{ title: '梳毛' }, { title: '刷牙' }, { title: '剪指甲' }, { title: '猫砂盆管理' }],
  },
];
