import { useEffect, useState } from 'preact/hooks';

// 添加到主屏幕：安卓和电脑上的 Chrome 能直接弹出安装框（事件在 Base.astro 里先存好），
// iPhone 只能自己从「分享」菜单里加，所以给文字说明。

interface InstallPrompt extends Event {
  prompt: () => Promise<void>;
}

declare global {
  interface Window {
    __installPrompt?: InstallPrompt;
  }
}

export const isStandalone = () =>
  matchMedia('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true;

const isIOS = () => /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

export function InstallHint() {
  const [prompt, setPrompt] = useState(() => window.__installPrompt);
  const [installed, setInstalled] = useState(isStandalone);

  useEffect(() => {
    const ready = () => setPrompt(window.__installPrompt);
    const done = () => setInstalled(true);
    window.addEventListener('catcare:installable', ready);
    window.addEventListener('appinstalled', done);
    return () => {
      window.removeEventListener('catcare:installable', ready);
      window.removeEventListener('appinstalled', done);
    };
  }, []);

  if (installed) return <p class="fine">已经从主屏幕打开了，记录不会因为很久没打开而被清掉。</p>;

  if (prompt) {
    const install = async () => {
      await prompt.prompt();
      window.__installPrompt = undefined;
      setPrompt(undefined);
    };
    return (
      <p class="install-hint">
        <button class="btn" type="button" onClick={install}>
          添加到主屏幕
        </button>
        <span class="fine">以后从主屏幕打开，没网也能用。</span>
      </p>
    );
  }

  return (
    <p class="fine">
      {isIOS()
        ? '添加到主屏幕：在 Safari 里点底部的「分享」，再选「添加到主屏幕」。以后从主屏幕打开，没网也能用。'
        : '添加到主屏幕：在浏览器菜单里选「添加到主屏幕」或「安装应用」。以后从主屏幕打开，没网也能用。'}
    </p>
  );
}
