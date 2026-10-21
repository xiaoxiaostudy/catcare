# 健康养猫

副标题：学养猫，也给自家猫记一笔。（2026-10-19 由「猫咪知识笔记库」改名；网址仍是 /catcare/。）

养猫知识笔记 + 每个人记录自家猫的工具（多用户，数据存在各自浏览器里），用 Astro 做成静态网站，发布在 GitHub Pages（https://xiaoxiaostudy.github.io/catcare/）。

## 结构

- 设计：配色和字体在 `src/styles/global.css` 顶部。配色取自三花猫（白毛纸面、玳瑁黑文字、橘毛 = 学会、肉垫粉 = 下一篇和选中、猫眼绿 = 兽医审核过、急症红只给急症用）；手写体（龙藏体，`.hand`）只用在页面大标题、区域名和猫身上的标注，正文和急症页不用。不要在标题上方加小标签，链接后面不加「→」。
- `src/content/notes/`：知识笔记，一篇一个 Markdown。开头的 frontmatter 写标题、所属区域（`module`）、状态（未开始 / 写作中 / 已完成 / 已审核）、日期、作者和一句话结论（`summary`）。正文用 `## 标题` 分节。
  - 新格式（改版中，样例是 `vital-signs.md`，其他笔记还是旧的十栏模板）：frontmatter 可写 `scene`（开头两三句小场景）→「记住这几件事」（最多三条，加粗的一句 + 一句解释）→ 按读者的问题分节（正常是多少 / 怎么测 / 什么时候找兽医 / 别这样做），数字配一个好记的说法 →「考考自己」（有序列表一题一项，缩进的子列表是答案）→「细节：…」「来源」折叠在最后。有「记住」一节的笔记不显示「一句话结论」框，互动工具挪到第一个「怎么…」小节后面（`src/components/NoteWidget.astro`）。
  - 示意图：正文里写 `![说明](figure:名字)`，图放 `src/figures/名字.svg`，以内联 SVG 插进页面，颜色用 `var(--…)` 才能跟深色模式走。只画来源里写清楚的东西。
- `src/pages/cards.astro`：速记卡页（`/cards/`），按地图顺序汇总每篇的「记住」一节，内容不另写。还没放进顶部导航，等改版的笔记多了再加。
- `src/lib/rehype-note-sections.mjs`：按 h2 标题里的关键词给每节套样式（就医红线 → 红框，来源和细节 → 折叠，考考自己 → 点开看答案），也负责插示意图和互动工具的插槽。「存疑点」「我家猫」两节是作者自己的工作区，留在 Markdown 里，网站上不显示。改了模板里的栏目名，要同步改这里。
- `src/lib/learned.ts`：读者学会了哪些笔记（键名 `catcare:learned`），首页三花猫的花色和爪印按它填色，笔记页底部的「我学会了这一篇」按钮写入。
- `src/lib/sources.ts`：笔记依据的五家主要机构（iCatCare、Cornell、Merck、AAFP、WSAVA），按正文里的网址认出每篇用了哪几家。笔记页标题下的「依据」和「内容从哪来」页（`src/pages/about.astro`，讲来源、核对流程、分级、还没兽医审核）都用它。加了新的主要机构要改这里。
- `src/data/map.ts`：首页学习地图的七大块和全部主题。写好的主题用 `note` 指向笔记文件名。
- `src/data/emergency.ts`：急症清单页的数据。只收录笔记里「就医红线」明确写到的情况，措辞和来源跟笔记保持一致；笔记 `emergency-checklist.md` 是它的打印版，两边要同步改。
- 作者自己用的笔记模板、来源清单、待问兽医清单、绵绵和妙妙的档案和基线记录表，放在仓库外面的 `~/Desktop/catcare-作者工作区/`，不进仓库（仓库是公开的）。网站是给读者学的，作者的工作内容不要放进这个仓库。
- 「我的猫」（`src/pages/cats/`、`src/components/cats/`）是 Preact 组件，只在浏览器里运行（`client:only`）。每个用户添加自己的猫、每天记录，数据都在浏览器 localStorage 里，不上传：
  - `src/lib/store.ts`：数据结构、读写、备份导入导出。键名 `catcare:data`；改结构要提高 `VERSION` 并在 `migrate()` 里转换旧数据。现在是版本 2：每天的记录在 `records`，疫苗和驱虫在 `care`（一次一条）。
  - 「疫苗驱虫」是猫页面的第三个标签（`CareLog.tsx`）：分疫苗、体内驱虫、体外驱虫三条线提醒，「下次」日期由用户照兽医或说明书填，网站不替人算间隔；7 天内到期或过期，猫页面和列表上会提示。
  - `src/lib/baseline.ts`：每只猫自己的正常范围（最近 30 天去掉两头各 10%，满 5 天才算）和当天提醒。提醒只说「和它平时不一样」，并链接到急症清单和笔记里对应的条目，措辞要和笔记一致。
  - 急症页存的兽医电话在 `catcare:contacts`。
- 互动工具（`src/components/tools/`）：
  - 笔记 frontmatter 写 `widget: <名字>`，工具就会出现在笔记页「动手试试」里。新加一个工具要改三处：`src/content.config.ts` 的 `widget` 枚举、`src/pages/notes/[slug].astro` 里加一段、样式写在 `src/styles/tools.css`。工具里的事实和措辞只用对应笔记里写到的，出处跟笔记一致。
  - `BreathTimer`：呼吸计时器（`breath-timer`）；记录表单里也能打开，数完直接填进表单。`kind="heart"` 是心跳计时器（`heart-timer`，在 `vital-signs`）：心跳太快点不过来，心里默数，时间到再填数字。
  - `BodyCondition`：体型评分滑块，页面在 `/tools/body-condition/`。每一分的文字逐条译自 WSAVA 对照表，不要自己改写。地图上的主题可以用 `tool` 字段指向工具页。
  - `LitterWatch`：砂盆观察（`litter-watch`，在 `urinary-blockage`）。拖动一天的时间，对比两只虚构公猫的砂盆，再判断哪只要马上去医院。次数和尿团大小只是示意。
  - `SpotChange`：找不同（`spot-change`，在 `subtle-changes`）。上个月和这个月的同一个房间，每处不同对应笔记第 1 节表里的一行。
  - `BodyLanguage`：肢体语言（`body-language`，在 `communication-stress`）。尾巴、耳朵、眼睛、胡须、身体各自切换，文字取自笔记里 iCatCare 的表。
  - `ToxinRoom`：找危险物（`toxin-room`，在 `household-toxins`）。客厅里每一样都在笔记的清单里。
  - `FoodCalc`：喂多少（`food-calc`，在 `feeding-water`）。按笔记里 WSAVA 的热量表（2 到 6 公斤、体型理想的成年猫）换算成克数和罐数；体型不是 5 分就不算，改成提醒找兽医。
  - `LifeStage`：年龄滑块（`life-stage`，在 `kitten`、`adult-cat`、`senior-cat`，起始年龄在 `[slug].astro` 的 `startAge`）。分段和人类年龄换算按 AAFP 和 iCatCare。
  - 呼吸、心跳计时器和体型评分都用 `SaveToCat` 把结果存进某只猫今天的记录；链接带 `?cat=<id>` 会预先选好那只猫。
- 已知坑：`.astro` 文件里，条件表达式 `{x && (...)}` 中的 `client:only` 组件不要带 `slot="fallback"` 子元素，会让 Astro 编译器崩溃。
- 已知坑：改了 `src/figures/` 里的图，本地预览不会更新（内容缓存只看 Markdown 有没有变），要删掉 `.astro/data-store.json` 再重启。线上每次重新构建，不受影响。

## 本地预览

```bash
npm install
npm run dev
```

推送到 `main` 后，`.github/workflows/deploy.yml` 会自动构建并发布。

## 每写完一篇笔记

1. 放到 `src/content/notes/<英文短名>.md`，写好 frontmatter。
2. 在 `src/data/map.ts` 里给对应主题加上 `note: '<英文短名>'`。
3. 如果它的就医红线里有新的情况，补进 `src/data/emergency.ts`。
4. 跑 `npm run build`，确认没有报错。
5. 提交，提交信息写「笔记：<主题>」，然后 `git push`。
