// 把笔记按 h2 切成 <section>，并根据标题给每节打上类型，方便单独设计样式。
// 只对笔记生效（文件在 content/notes 下）。
const KINDS = [
  [/就医红线/, 'danger'],
  [/家里能做什么/, 'todo'],
  [/常见误区/, 'myths'],
  [/国内差异/, 'local'],
  [/^来源/, 'sources'],
  [/存疑点/, 'questions'],
  [/我家猫/, 'mycat'],
];

const COLLAPSED = new Set(['sources', 'mycat']);

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
        : node,
    );

    const path = file.path || file.history?.[0] || '';
    if (!path.includes('/content/notes/')) return;

    const out = [];
    let current = null;
    for (const node of tree.children) {
      if (node.type === 'element' && node.tagName === 'h2') {
        // 去掉标题前的序号，比如「4. 」，再按标题判断这一节是什么
        const title = text(node).replace(/^\d+\.\s*/, '');
        const kind = KINDS.find(([re]) => re.test(title))?.[1] || 'plain';
        node.children = [{ type: 'text', value: title }];
        if (COLLAPSED.has(kind)) {
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
      } else if (current) {
        current.children.push(node);
      } else {
        out.push(node);
      }
    }
    tree.children = out;
  };
}
