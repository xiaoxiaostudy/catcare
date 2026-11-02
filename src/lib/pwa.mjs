// 构建完成后，把 dist 里所有文件的地址填进 sw.js 的预缓存列表，再按内容算一个版本号。
// 这样第一次打开网站就会把整站存下来，之后没网也能用；每次发布内容变了，版本号也跟着变。
import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}

export default function pwa() {
  let base = '/';
  return {
    name: 'catcare-pwa',
    hooks: {
      'astro:config:done': ({ config }) => {
        base = config.base.endsWith('/') ? config.base : config.base + '/';
      },
      'astro:build:done': async ({ dir }) => {
        const root = fileURLToPath(dir);
        const swPath = path.join(root, 'sw.js');
        const files = (await walk(root)).filter((f) => f !== swPath && !path.basename(f).startsWith('.')).sort();
        const hash = createHash('sha256');
        const urls = [];
        for (const f of files) {
          const rel = path.relative(root, f).split(path.sep).join('/');
          hash.update(rel).update(await readFile(f));
          urls.push(base + (rel === 'index.html' ? '' : rel.endsWith('/index.html') ? rel.slice(0, -'index.html'.length) : rel));
        }
        const version = hash.digest('hex').slice(0, 12);
        const sw = (await readFile(swPath, 'utf8'))
          .replace("'__VERSION__'", JSON.stringify(version))
          .replace('/*__PRECACHE__*/ []', JSON.stringify(urls));
        await writeFile(swPath, sw);
      },
    },
  };
}
