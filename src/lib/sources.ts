// 笔记主要依据的机构。笔记正文里出现这些网址，就算这篇用到了它；
// 「内容从哪来」页的统计和笔记页标题下的「依据」都按这张表来。
export interface Source {
  id: string;
  name: string;
  short: string;
  url: string;
  about: string;
  match: RegExp;
}

export const SOURCES: Source[] = [
  {
    id: 'icatcare',
    name: 'International Cat Care（iCatCare）',
    short: 'iCatCare',
    url: 'https://icatcare.org/',
    about: '英国的猫福利慈善机构，旗下有猫科兽医学会，出版猫科医学期刊 JFMS。给养猫人的文章每篇都标有更新日期。',
    match: /icatcare\.org/,
  },
  {
    id: 'cornell',
    name: 'Cornell Feline Health Center',
    short: 'Cornell',
    url: 'https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center',
    about: '美国康奈尔大学兽医学院的猫健康中心，为养猫人和兽医提供猫病资料。',
    match: /vet\.cornell\.edu/,
  },
  {
    id: 'merck',
    name: 'Merck 兽医手册（宠物主人版）',
    short: 'Merck 兽医手册',
    url: 'https://www.merckvetmanual.com/cat-owners',
    about: '历史悠久的兽医参考书的宠物主人版，每篇由兽医撰写、经过同行评审，标有审阅日期。',
    match: /merckvetmanual\.com/,
  },
  {
    id: 'aafp',
    name: 'AAFP / FelineVMA',
    short: 'AAFP',
    url: 'https://catvets.com/',
    about: '美国猫科执业兽医协会（现名 FelineVMA），组织专家小组制定猫的诊疗指南，并配有给养猫人的手册。',
    match: /catvets\.com|PMC10812130/,
  },
  {
    id: 'wsava',
    name: 'WSAVA 世界小动物兽医协会',
    short: 'WSAVA',
    url: 'https://wsava.org/',
    about: '全球小动物兽医的联合组织，发布疫苗、营养、牙科等全球指南。',
    match: /wsava\.org/,
  },
];

/** 这篇笔记正文里用到了哪些主要机构，按 SOURCES 的顺序 */
export function sourcesOf(body: string | undefined): Source[] {
  if (!body) return [];
  return SOURCES.filter((s) => s.match.test(body));
}
