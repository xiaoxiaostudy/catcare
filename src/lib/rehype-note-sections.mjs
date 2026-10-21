import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// 把笔记按 h2 切成 <section>，并根据标题给每节打上类型，方便单独设计样式。
// 只对笔记生效（文件在 content/notes 下）。
const KINDS = [
  [/^记住/, 'remember'],
  [/就医红线|什么时候找兽医/, 'danger'],
  // 不急的情况（比如处方粮要听兽医的）不用急症红，用平静的蓝
  [/问问兽医/, 'askvet'],
  [/家里能做什么/, 'todo'],
  [/常见误区|别这样做/, 'myths'],
  [/^怎么/, 'howto'],
  [/考考自己/, 'quiz'],
  [/^细节/, 'detail'],
  [/国内差异/, 'local'],
  [/^来源/, 'sources'],
  [/存疑点/, 'questions'],
  [/我家猫/, 'mycat'],
];

const COLLAPSED = new Set(['sources', 'detail']);
// 作者自己的工作区（待问兽医、我家猫的实际情况）留在 Markdown 里，网站上不给读者看
const HIDDEN = new Set(['questions', 'mycat']);

// 「考考自己」：有序列表每一项是一道题，缩进的子列表是答案，做成点开才看到答案的卡片
function quizItem(li) {
  const answer = li.children.filter((c) => c.tagName === 'ul');
  const question = li.children.filter((c) => c.tagName !== 'ul');
  return {
    ...li,
    children: [
      {
        type: 'element',
        tagName: 'details',
        properties: { className: ['quiz-card'] },
        children: [
          { type: 'element', tagName: 'summary', properties: {}, children: question },
          { type: 'element', tagName: 'div', properties: { className: ['quiz-answer'] }, children: answer.flatMap((ul) => ul.children.filter((c) => c.tagName === 'li').map((c) => ({ ...c, tagName: 'p' }))) },
        ],
      },
    ],
  };
}

// 示意图：Markdown 里写 ![说明](figure:名字)，换成 src/figures/名字.svg 的内联 SVG（内联才能跟着深色模式换颜色），说明放在图下面
function figure(node) {
  const img = node.tagName === 'p' && node.children.filter((c) => !(c.type === 'text' && !c.value.trim()));
  if (!img || img.length !== 1 || img[0].tagName !== 'img') return node;
  const src = String(img[0].properties.src || '');
  if (!src.startsWith('figure:')) return node;
  const svg = readFileSync(join(process.cwd(), 'src/figures', `${src.slice(7)}.svg`), 'utf8');
  return {
    type: 'element',
    tagName: 'figure',
    properties: { className: ['note-figure'] },
    children: [
      { type: 'raw', value: svg },
      { type: 'element', tagName: 'figcaption', properties: {}, children: [{ type: 'text', value: img[0].properties.alt || '' }] },
    ],
  };
}

function text(node) {
  if (node.type === 'text') return node.value;
  return (node.children || []).map(text).join('');
}

export default function rehypeNoteSections() {
  return (tree, file) => {
    // 所有 Markdown 的表格都包一层，窄屏时可以横向滚动
    tree.children = tree.children.map((node) =>
      node.type === 'element' && node.tagName === 'table'
        ? { type: 'element', tagName: 'div', properties: { className: ['table-scroll'] }, children: [node] }
        : node.type === 'element'
          ? figure(node)
          : node,
    );

    const path = file.path || file.history?.[0] || '';
    if (!path.includes('/content/notes/')) return;

    // 正文里单独一行 <!-- 工具 -->，就把「动手试试」放在那里；没写的话，放在第一个「怎么……」小节后面
    const isMarker = (n) => n.type === 'raw' && /^<!--\s*工具\s*-->$/.test(n.value.trim());
    const marked = tree.children.some(isMarker);
    const slot = () => ({ type: 'element', tagName: 'div', properties: { className: ['try-slot'] }, children: [] });

    const out = [];
    let current = null;
    for (const node of tree.children) {
      if (isMarker(node)) {
        // 插槽要在小节外面，笔记页才能从这里切开；标记后面到下一个 h2 之间的内容也留在外面
        out.push(slot());
        current = null;
        continue;
      }
      if (node.type === 'element' && node.tagName === 'h2') {
        // 去掉标题前的序号，比如「4. 」，再按标题判断这一节是什么
        const title = text(node).replace(/^\d+\.\s*/, '');
        const kind = KINDS.find(([re]) => re.test(title))?.[1] || 'plain';
        node.children = [{ type: 'text', value: title }];
        if (HIDDEN.has(kind)) {
          current = { type: 'element', tagName: 'template', properties: {}, children: [] };
        } else if (COLLAPSED.has(kind)) {
          current = {
            type: 'element',
            tagName: 'details',
            properties: { className: ['note-section', `kind-${kind}`] },
            children: [{ type: 'element', tagName: 'summary', properties: {}, children: [node] }],
          };
        } else {
          current = {
            type: 'element',
            tagName: 'section',
            properties: { className: ['note-section', `kind-${kind}`] },
            children: [node],
          };
        }
        out.push(current);
        // 第一个「怎么……」小节后面留个插槽，笔记页把「动手试试」放进去：先讲怎么做，再动手
        if (!marked && kind === 'howto' && !out.some((n) => n.properties?.className?.includes('try-slot'))) {
          out.push(slot());
        }
      } else if (current) {
        if (current.properties.className?.includes('kind-quiz') && node.tagName === 'ol') {
          node.children = node.children.map((c) => (c.tagName === 'li' ? quizItem(c) : c));
        }
        current.children.push(node);
      } else {
        out.push(node);
      }
    }
    // 「记住」那张卡片底下，链到汇总所有卡片的速记卡页
    const remember = out.find((n) => n.properties?.className?.includes('kind-remember'));
    remember?.children.push({
      type: 'element',
      tagName: 'p',
      properties: { className: ['cards-link'] },
      children: [{ type: 'element', tagName: 'a', properties: { href: '/catcare/cards/' }, children: [{ type: 'text', value: '所有笔记的速记卡' }] }],
    });
    tree.children = out.filter((n) => n.tagName !== 'template');
  };
}
