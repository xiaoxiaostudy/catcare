# 猫咪知识笔记库

养猫知识笔记 + 每个人记录自家猫的工具，用 Astro 做成静态网站，发布在 GitHub Pages（https://xiaoxiaostudy.github.io/catcare/）。

## 结构

- `src/content/notes/`：知识笔记，一篇一个 Markdown。开头的 frontmatter 写标题、所属区域（`module`）、状态（未开始 / 写作中 / 已完成 / 已审核）、日期、作者和一句话结论（`summary`）。正文按十栏模板写，用 `## 标题` 分节。
- `src/lib/rehype-note-sections.mjs`：按 h2 标题里的关键词给每节套样式（就医红线 → 红框，来源、我家猫 → 折叠）。改了模板里的栏目名，要同步改这里。
- `src/data/map.ts`：首页学习地图的七大块和全部主题。写好的主题用 `note` 指向笔记文件名。
- `src/data/emergency.ts`：急症清单（临时版）。只收录笔记里「就医红线」明确写到的情况，措辞和来源跟笔记保持一致。
- `src/content/pages/`：工具箱（来源清单、待问兽医清单、档案）和基线记录表。
- 用户自己的数据（目前只有急症页的电话）只存在浏览器 localStorage 里，键名以 `catcare:` 开头。

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
