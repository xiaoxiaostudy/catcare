# 猫咪知识笔记库

养猫知识笔记 + 每个人记录自家猫的工具（多用户，数据存在各自浏览器里），用 Astro 做成静态网站，发布在 GitHub Pages（https://xiaoxiaostudy.github.io/catcare/）。

## 结构

- 设计：配色和字体在 `src/styles/global.css` 顶部。配色取自三花猫（白毛纸面、玳瑁黑文字、橘毛 = 学会、肉垫粉 = 下一篇和选中、猫眼绿 = 兽医审核过、急症红只给急症用）；手写体（龙藏体，`.hand`）只用在页面大标题、区域名和猫身上的标注，正文和急症页不用。不要在标题上方加小标签，链接后面不加「→」。
- `src/content/notes/`：知识笔记，一篇一个 Markdown。开头的 frontmatter 写标题、所属区域（`module`）、状态（未开始 / 写作中 / 已完成 / 已审核）、日期、作者和一句话结论（`summary`）。正文按十栏模板写，用 `## 标题` 分节。
- `src/lib/rehype-note-sections.mjs`：按 h2 标题里的关键词给每节套样式（就医红线 → 红框，来源 → 折叠）。「存疑点」「我家猫」两节是作者自己的工作区，留在 Markdown 里，网站上不显示。改了模板里的栏目名，要同步改这里。
- `src/lib/learned.ts`：读者学会了哪些笔记（键名 `catcare:learned`），首页三花猫的花色和爪印按它填色，笔记页底部的「我学会了这一篇」按钮写入。
- `src/data/map.ts`：首页学习地图的七大块和全部主题。写好的主题用 `note` 指向笔记文件名。
- `src/data/emergency.ts`：急症清单页的数据。只收录笔记里「就医红线」明确写到的情况，措辞和来源跟笔记保持一致；笔记 `emergency-checklist.md` 是它的打印版，两边要同步改。
- `src/content/pages/`：工具箱（来源清单、待问兽医清单、档案）和基线记录表。
- 「我的猫」（`src/pages/cats/`、`src/components/cats/`）是 Preact 组件，只在浏览器里运行（`client:only`）。每个用户添加自己的猫、每天记录，数据都在浏览器 localStorage 里，不上传：
  - `src/lib/store.ts`：数据结构、读写、备份导入导出。键名 `catcare:data`；改结构要提高 `VERSION` 并在 `migrate()` 里转换旧数据。
  - `src/lib/baseline.ts`：每只猫自己的正常范围（最近 30 天去掉两头各 10%，满 5 天才算）和当天提醒。提醒只说「和它平时不一样」，并链接到急症清单和笔记里对应的条目，措辞要和笔记一致。
  - 急症页存的兽医电话在 `catcare:contacts`。
- 互动工具（`src/components/tools/`）：
  - `BreathTimer`：呼吸计时器。笔记 frontmatter 写 `widget: breath-timer` 就会出现在笔记页「动手试试」里；记录表单里也能打开，数完直接填进表单。
  - `BodyCondition`：体型评分滑块，页面在 `/tools/body-condition/`。每一分的文字逐条译自 WSAVA 对照表，不要自己改写。地图上的主题可以用 `tool` 字段指向工具页。
  - `LitterWatch`：砂盆观察，笔记 `urinary-blockage` 里用 `widget: litter-watch`。拖动一天的时间，对比两只虚构公猫的砂盆，再判断哪只要马上去医院。次数和尿团大小只是示意；猫的表现和揭晓里的措辞只用笔记「就医红线」里写到的。
  - 呼吸计时器和体型评分都用 `SaveToCat` 把结果存进某只猫今天的记录；链接带 `?cat=<id>` 会预先选好那只猫。
- 已知坑：`.astro` 文件里，条件表达式 `{x && (...)}` 中的 `client:only` 组件不要带 `slot="fallback"` 子元素，会让 Astro 编译器崩溃。

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
