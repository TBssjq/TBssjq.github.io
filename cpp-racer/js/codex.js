import { CATEGORIES, TOPICS, getTopic, topicsOf, categoryOf } from './content/index.js';
import { t, pick, getLang } from './i18n.js';
import { Save } from './save.js';

const KEYWORDS = new Set([
  'alignas', 'alignof', 'and', 'auto', 'bool', 'break', 'case', 'catch', 'char', 'class',
  'concept', 'const', 'consteval', 'constexpr', 'constinit', 'const_cast', 'continue',
  'decltype', 'default', 'delete', 'do', 'double', 'dynamic_cast', 'else', 'enum', 'explicit',
  'extern', 'false', 'final', 'float', 'for', 'friend', 'goto', 'if', 'inline', 'int', 'long',
  'mutable', 'namespace', 'new', 'noexcept', 'nullptr', 'operator', 'or', 'override', 'private',
  'protected', 'public', 'requires', 'return', 'short', 'signed', 'sizeof', 'static',
  'static_assert', 'static_cast', 'struct', 'switch', 'template', 'this', 'throw', 'true',
  'try', 'typedef', 'typeid', 'typename', 'union', 'unsigned', 'using', 'virtual', 'void',
  'volatile', 'while',
]);

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const TOKEN_RE = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*')|(^[ \t]*#[^\n]*)|(\b\d[\d.']*\b)|(\bstd::\w+(?:::\w+)*)|(\b[A-Za-z_]\w*\b)/gm;

/** 极简 C++ 语法高亮 */
export function highlight(code) {
  let out = '';
  let last = 0;
  let m;
  TOKEN_RE.lastIndex = 0;

  while ((m = TOKEN_RE.exec(code)) !== null) {
    out += esc(code.slice(last, m.index));
    const text = m[0];

    if (m[1]) out += `<span class="tok-com">${esc(text)}</span>`;
    else if (m[2]) out += `<span class="tok-str">${esc(text)}</span>`;
    else if (m[3]) out += `<span class="tok-pre">${esc(text)}</span>`;
    else if (m[4]) out += `<span class="tok-num">${esc(text)}</span>`;
    else if (m[5]) out += `<span class="tok-ty">${esc(text)}</span>`;
    else if (KEYWORDS.has(text)) out += `<span class="tok-kw">${esc(text)}</span>`;
    else if (/^[A-Z][A-Za-z0-9_]*$/.test(text)) out += `<span class="tok-cls">${esc(text)}</span>`;
    else if (code[m.index + text.length] === '(') out += `<span class="tok-fn">${esc(text)}</span>`;
    else out += esc(text);

    last = m.index + text.length;
    if (m.index === TOKEN_RE.lastIndex) TOKEN_RE.lastIndex++;
  }

  out += esc(code.slice(last));
  return out;
}

/** 正文：按空行分段 + 行内代码 */
export function richText(text, cls = '') {
  return String(text)
    .split(/\n{2,}/)
    .map((p) => {
      const body = esc(p).replace(/`([^`]+)`/g, '<code>$1</code>');
      return `<p${cls ? ` class="${cls}"` : ''}>${body}</p>`;
    })
    .join('');
}

export class Codex {
  constructor({ onOpen, onClose } = {}) {
    this.onOpen = onOpen;
    this.onClose = onClose;
    this.isOpen = false;

    this.root = document.getElementById('codex');
    this.nav = document.getElementById('codexNav');
    this.list = document.getElementById('codexList');
    this.doc = document.getElementById('codexDoc');
    this.sub = document.getElementById('codexSub');

    this.cat = CATEGORIES[0].id;
    this.topic = topicsOf(this.cat)[0].id;

    this.nav.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-cat]');
      if (!btn) return;
      this.cat = btn.dataset.cat;
      this.topic = topicsOf(this.cat)[0].id;
      this.render();
    });

    this.list.addEventListener('click', (e) => {
      const item = e.target.closest('[data-topic]');
      if (!item) return;
      this.topic = item.dataset.topic;
      this.render();
    });

    document.getElementById('codexClose').addEventListener('click', () => this.close());

    const syncSub = () => {
      this.sub.textContent = t('codex.sub', { n: TOPICS.length, got: Save.topicCount() });
    };

    window.addEventListener('langchange', () => {
      if (this.isOpen) this.render();
      else syncSub();
    });

    syncSub();
  }

  open(topicId) {
    if (topicId) {
      const topic = getTopic(topicId);
      this.cat = topic.cat;
      this.topic = topic.id;
    }
    this.root.classList.remove('hidden');
    this.isOpen = true;
    this.render();
    if (this.onOpen) this.onOpen();
  }

  close() {
    if (!this.isOpen) return;
    this.root.classList.add('hidden');
    this.isOpen = false;
    if (this.onClose) this.onClose();
  }

  toggle(topicId) {
    if (this.isOpen) this.close();
    else this.open(topicId);
  }

  render() {
    const lang = getLang();
    const catObj = categoryOf(this.cat);
    const list = topicsOf(this.cat);
    const topic = getTopic(this.topic);

    this.sub.textContent = t('codex.sub', { n: TOPICS.length, got: Save.topicCount() });

    this.nav.innerHTML = CATEGORIES.map((c) => {
      const n = topicsOf(c.id).length;
      return `<button class="codex__cat${c.id === this.cat ? ' is-on' : ''}" data-cat="${c.id}">
        <span>${esc(pick(c.name))}</span><em>${n}</em>
      </button>`;
    }).join('');

    this.list.innerHTML = list.map((item) => {
      const got = Save.hasTopic(item.id);
      return `<button class="codex__item${item.id === this.topic ? ' is-on' : ''}" data-topic="${item.id}">
        <b>${esc(pick(item.title))}${got ? '<i class="codex__dot"></i>' : ''}</b>
        <small>${esc(pick(item.meta))}</small>
      </button>`;
    }).join('');

    const points = (topic.points && topic.points[lang]) || [];
    const related = TOPICS.filter((x) => x.cat === topic.cat && x.id !== topic.id).slice(0, 3);

    this.doc.innerHTML = `
      <div class="doc__head">
        <div class="doc__kicker">${esc(pick(catObj.name))} <i>// ${topic.id}</i></div>
        <h2 class="doc__title">${esc(pick(topic.title))}</h2>
        <p class="doc__meta">${esc(pick(topic.meta))}</p>
      </div>
      ${richText(topic.body[lang] || topic.body.en, 'doc__text')}
      <pre class="code">${highlight(topic.code)}</pre>
      <ul class="doc__points">
        ${points.map((p) => `<li>${esc(p)}</li>`).join('')}
      </ul>
      <div class="doc__related">
        <span class="lbl">${lang === 'zh' ? '同分类' : 'more in this category'}</span>
        ${related.map((r) => `<button class="chip" data-topic="${r.id}">${esc(pick(r.title))}</button>`).join('')}
      </div>
    `;

    this.doc.querySelectorAll('[data-topic]').forEach((el) => {
      el.addEventListener('click', () => {
        this.topic = el.dataset.topic;
        this.render();
      });
    });
  }
}
