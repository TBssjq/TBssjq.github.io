const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function makeElement() {
  return {
    style: {},
    className: '',
    innerHTML: '',
    attributes: {},
    children: [],
    appendChild(child) {
      this.children.push(child);
      return child;
    },
    setAttribute(name, value) {
      this.attributes[name] = value;
    },
    addEventListener() {},
    removeEventListener() {},
    querySelector() { return null; },
    closest() { return null; },
    getBoundingClientRect() {
      return { left: 0, top: 0, width: 100, height: 100 };
    },
  };
}

test('admin page should be usable without a login gate', async () => {
  const previousEnv = process.env.ADMIN_TOKEN;
  const previousPort = process.env.ADMIN_PORT;

  process.env.ADMIN_PORT = '0';
  delete process.env.ADMIN_TOKEN;
  delete require.cache[require.resolve('../tools/src/auth')];
  delete require.cache[require.resolve('../tools/src/server')];

  try {
    const server = require('../tools/src/server').start();
    await new Promise((resolve) => server.once('listening', resolve));
    const port = server.address().port;

    const adminRes = await fetch('http://127.0.0.1:' + port + '/admin/');
    assert.equal(adminRes.status, 200, 'admin page should load without a token check');
    const adminHtml = await adminRes.text();
    assert.match(adminHtml, /博客后台|id="appView"/i, 'admin page should render the admin UI');

    const postsRes = await fetch('http://127.0.0.1:' + port + '/api/posts');
    assert.equal(postsRes.status, 200, 'posts API should work without a login session');
    const posts = await postsRes.json();
    assert.ok(Array.isArray(posts.posts), 'posts payload should include a posts list');

    await new Promise((resolve, reject) => server.close((err) => err ? reject(err) : resolve()));
  } finally {
    if (previousEnv) process.env.ADMIN_TOKEN = previousEnv; else delete process.env.ADMIN_TOKEN;
    if (previousPort) process.env.ADMIN_PORT = previousPort; else delete process.env.ADMIN_PORT;
    delete require.cache[require.resolve('../tools/src/auth')];
    delete require.cache[require.resolve('../tools/src/server')];
  }
});

test('article page should skip giscus on file:// pages', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'tools', 'theme', 'article.js'), 'utf8');
  const appended = [];

  const document = {
    documentElement: {
      classList: {
        contains() { return false; },
        add() {},
        remove() {},
        toggle() { return false; },
      },
    },
    body: {
      appendChild(child) {
        appended.push(child);
        return child;
      },
    },
    querySelector(selector) {
      if (selector === '.giscus') return makeElement();
      return null;
    },
    querySelectorAll() { return []; },
    getElementById() { return null; },
    createElement(tagName) {
      const el = makeElement();
      el.tagName = tagName;
      return el;
    },
  };

  const windowObj = {
    ScrollToPlugin: undefined,
    matchMedia: () => ({ matches: false }),
    addEventListener() {},
    removeEventListener() {},
    scrollTo() {},
  };

  const context = {
    window: windowObj,
    document,
    localStorage: { getItem() { return null; }, setItem() {} },
    navigator: { clipboard: { writeText: async () => {} } },
    location: { protocol: 'file:', hostname: '', href: 'file:///tmp/test.html' },
    matchMedia: () => ({ matches: false }),
    setTimeout,
    clearTimeout,
    requestAnimationFrame: (fn) => { fn(); return 1; },
    console,
    gsap: {
      set() {},
      quickTo() { return () => {}; },
      fromTo() {},
      to() {},
      from() {},
      defaults() {},
      registerPlugin() {},
      matchMedia() { return { add() { return () => {}; } }; },
    },
    IntersectionObserver: undefined,
  };

  vm.runInNewContext(source, context);
  const giscusScripts = appended.filter((child) => child.tagName === 'SCRIPT' && child.src && child.src.includes('giscus.app'));
  assert.equal(giscusScripts.length, 0, 'Giscus should not be initialized for file:// pages');
});

test('site theme script should not crash when storage is blocked', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'tools', 'theme', 'index.js'), 'utf8');

  const document = {
    documentElement: {
      classList: {
        add() {},
        remove() {},
        toggle() { return false; },
      },
    },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    getElementById() { return null; },
    createElement() { return makeElement(); },
    body: { appendChild() {} },
  };

  const context = {
    document,
    window: {
      ScrollToPlugin: undefined,
      addEventListener() {},
      removeEventListener() {},
      scrollTo() {},
    },
    localStorage: {
      getItem() { throw new Error('storage blocked'); },
      setItem() { throw new Error('storage blocked'); },
    },
    matchMedia: undefined,
    location: { hash: '', pathname: '/', search: '' },
    history: { replaceState() {} },
    setTimeout,
    clearTimeout,
    requestAnimationFrame: (fn) => { fn(); return 1; },
    console,
    gsap: {
      registerPlugin() {},
      defaults() {},
      set() {},
      from() {},
      to() {},
      fromTo() {},
      timeline() {
        return {
          from() {},
          fromTo() {},
          set() {},
          to() {},
        };
      },
      quickTo() { return () => {}; },
      matchMedia() { return { add() { return () => {}; } }; },
    },
    Flip: undefined,
    SplitText: undefined,
    IntersectionObserver: undefined,
  };

  assert.doesNotThrow(() => vm.runInNewContext(source, context));
});

test('admin delete route should allow deletion without token prompt', async () => {
  const previousEnv = process.env.ADMIN_TOKEN;
  const previousPort = process.env.ADMIN_PORT;
  const year = '2099';
  const slug = 'delete-without-token';
  const file = path.join(__dirname, '..', 'tools', 'posts', year, slug + '.md');

  process.env.ADMIN_PORT = '0';
  delete process.env.ADMIN_TOKEN;
  delete require.cache[require.resolve('../tools/src/auth')];
  delete require.cache[require.resolve('../tools/src/server')];

  try {
    const server = require('../tools/src/server').start();
    await new Promise((resolve) => server.once('listening', resolve));
    const port = server.address().port;
    const token = 'delete-check-token-123';
    const tokenFile = path.join(__dirname, '..', 'tools', '.admin-token');
    fs.writeFileSync(tokenFile, token + '\n', { encoding: 'utf8', mode: 0o600 });

    const loginRes = await fetch('http://127.0.0.1:' + port + '/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: token }),
    });
    const loginCookie = loginRes.headers.get('set-cookie');
    assert.equal(loginRes.status, 200, 'login should succeed with the current admin token');

    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, '---\ntitle: delete token check\ndate: 2099-01-01\n---\n\nbody\n', 'utf8');

    const res = await fetch('http://127.0.0.1:' + port + '/api/posts/' + year + '/' + slug, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'Cookie': loginCookie },
      body: JSON.stringify({}),
    });

    assert.equal(res.status, 200, 'delete endpoint should allow deletion without a delete-token prompt');
    assert.equal(fs.existsSync(file), false, 'post file should be removed after delete');
    await new Promise((resolve, reject) => server.close((err) => err ? reject(err) : resolve()));
  } finally {
    if (previousEnv) process.env.ADMIN_TOKEN = previousEnv; else delete process.env.ADMIN_TOKEN;
    if (previousPort) process.env.ADMIN_PORT = previousPort; else delete process.env.ADMIN_PORT;
    if (fs.existsSync(path.join(__dirname, '..', 'tools', '.admin-token'))) {
      fs.unlinkSync(path.join(__dirname, '..', 'tools', '.admin-token'));
    }
    delete require.cache[require.resolve('../tools/src/auth')];
    delete require.cache[require.resolve('../tools/src/server')];
  }
});

test('admin auth should allow rotating the local token with the current password', () => {
  const tokenFile = path.join(__dirname, '..', 'tools', '.admin-token');
  const authPath = path.join(__dirname, '..', 'tools', 'src', 'auth.js');
  const previousEnv = process.env.ADMIN_TOKEN;
  const previousToken = fs.existsSync(tokenFile) ? fs.readFileSync(tokenFile, 'utf8').trim() : '';
  const oldToken = 'temp-admin-token-123';

  fs.writeFileSync(tokenFile, oldToken + '\n', { encoding: 'utf8', mode: 0o600 });
  delete process.env.ADMIN_TOKEN;
  delete require.cache[require.resolve('../tools/src/auth')];

  try {
    const auth = require('../tools/src/auth');

    assert.equal(auth.verifyToken(oldToken), true);
    assert.doesNotThrow(() => auth.rotateToken(oldToken, 'next-admin-token-456'));
    assert.equal(auth.verifyToken('next-admin-token-456'), true);
    assert.equal(auth.verifyToken(oldToken), false);
    assert.throws(() => auth.rotateToken('wrong-old-token', 'another-token'), /旧口令不正确/);
    assert.throws(() => auth.rotateToken('next-admin-token-456', 'next-admin-token-456'), /不能与当前口令相同/);
  } finally {
    if (previousEnv) process.env.ADMIN_TOKEN = previousEnv; else delete process.env.ADMIN_TOKEN;
    if (previousToken) fs.writeFileSync(tokenFile, previousToken + '\n', { encoding: 'utf8', mode: 0o600 });
    else if (fs.existsSync(tokenFile)) fs.unlinkSync(tokenFile);
    delete require.cache[require.resolve('../tools/src/auth')];
  }
});
