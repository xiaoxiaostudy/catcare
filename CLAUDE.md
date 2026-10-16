# 猫咪知识笔记库

给绵绵和妙妙写的养猫知识笔记，用 MkDocs Material 发布成网站（GitHub Pages）。

- 笔记都放在 `docs/`，总目录和工具箱是 `docs/猫咪知识笔记库.md`，网站首页是 `docs/index.md`。
- `mkdocs.yml` 的 `nav` 决定侧边栏顺序；新笔记不加进 nav 就不会出现在侧边栏里。
- 推送到 `main` 后，`.github/workflows/deploy.yml` 会自动构建并发布网站。构建用的是 `--strict`，链接断了构建就会失败。

## 每写完一篇笔记

1. 在 `mkdocs.yml` 的 `nav` 里，把笔记加到对应模块下面（模块还没有就新建一节）。
2. 在 `docs/index.md` 的「已写的笔记」里加上链接。
3. 在 `docs/猫咪知识笔记库.md` 的进度表里更新它的状态。
4. 本地跑 `mkdocs build --strict`，确认没有警告。
5. 提交，提交信息写「笔记：<主题>」，然后 `git push`。
