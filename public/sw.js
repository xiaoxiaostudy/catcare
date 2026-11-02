// 离线缓存：第一次打开网站时把整站（一百多万字节）存进手机，没网也能看急症清单、笔记和自家猫的记录。
// PRECACHE 和 VERSION 由 src/lib/pwa.mjs 在构建时填进来；每次发布版本号会变，旧缓存随之清掉。
const VERSION = '__VERSION__';
const PRECACHE = /*__PRECACHE__*/ [];
const CACHE = `catcare-${VERSION}`;
const FONTS = 'catcare-fonts';

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE && k !== FONTS).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

const timeout = (ms) => new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms));

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // 手写体字体：有缓存先用缓存，同时在后台更新
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(
      caches.open(FONTS).then(async (c) => {
        const cached = await c.match(req);
        const fresh = fetch(req)
          .then((res) => {
            c.put(req, res.clone());
            return res;
          })
          .catch(() => cached);
        return cached || fresh;
      }),
    );
    return;
  }

  if (url.origin !== location.origin) return;

  // 页面：先上网拿最新的，网慢（3 秒）或没网就用缓存。猫页面带 ?id=，缓存里按不带参数的地址找。
  if (req.mode === 'navigate') {
    e.respondWith(
      (async () => {
        const key = url.origin + url.pathname;
        const cached = await caches.match(key);
        try {
          const res = await Promise.race([fetch(req), timeout(cached ? 3000 : 30000)]);
          if (res.ok) (await caches.open(CACHE)).put(key, res.clone());
          return res;
        } catch {
          return cached || Response.error();
        }
      })(),
    );
    return;
  }

  // 脚本、样式、图片：文件名带了内容指纹，有缓存就用缓存。
  // 动态加载的脚本会带 Origin 请求头，服务器回 Vary: Origin 时就对不上缓存，所以忽略 Vary。
  e.respondWith(
    caches.match(req, { ignoreVary: true }).then(
      (cached) =>
        cached ||
        fetch(req).then(async (res) => {
          if (res.ok) (await caches.open(CACHE)).put(req, res.clone());
          return res;
        }),
    ),
  );
});
