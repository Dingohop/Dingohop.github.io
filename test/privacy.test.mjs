import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const read = (file) => fs.readFileSync(new URL(file, root), 'utf8');
const head = read('_includes/head.html');
const video = read('_includes/video-embed.html');

test('page templates and styles do not load third-party resources', () => {
  const files = ['index.html', '404.html', 'accessibility.html', 'style.css',
    ...['_includes', '_layouts'].flatMap((dir) =>
      fs.readdirSync(new URL(`${dir}/`, root)).map((file) => `${dir}/${file}`))];
  for (const file of files) {
    const source = read(file);
    assert.doesNotMatch(source, /<(?:script|img|iframe|source|video|audio|embed)\b[^>]*\b(?:src|poster)\s*=\s*["'](?:https?:)?\/\//i, file);
    assert.doesNotMatch(source, /<link\b[^>]*\bhref\s*=\s*["'](?:https?:)?\/\//i, file);
    assert.doesNotMatch(source, /(?:fonts\.googleapis\.com|fonts\.gstatic\.com|i\.ytimg\.com)/i, file);
    assert.doesNotMatch(source, /(?:url\(\s*["']?|@import\s+["'])(?:https?:)?\/\//i, file);
  }
});

test('browser policy blocks connections and frames before resources load', () => {
  const policyTag = head.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)">/);
  assert.ok(policyTag, 'CSP is present');
  const directives = new Map(policyTag[1].split(';').map((part) => {
    const [name, ...values] = part.trim().split(/\s+/);
    return [name, values];
  }));
  for (const kind of ['default', 'script', 'style', 'font', 'media']) {
    assert.deepEqual(directives.get(`${kind}-src`), ["'self'"], kind);
  }
  assert.deepEqual(directives.get('img-src'), ["'self'", 'data:']);
  for (const directive of ['connect-src', 'frame-src', 'object-src', 'base-uri', 'form-action']) {
    assert.deepEqual(directives.get(directive), ["'none'"], directive);
  }
  assert.ok(head.indexOf(policyTag[0]) < head.indexOf('<link'), 'policy precedes resource loads');
  assert.match(head, /<meta name="referrer" content="no-referrer">/);
});

test('video links leave the site explicitly without sharing the referring page', () => {
  const link = video.match(/<a\b[\s\S]*?<\/a>/)?.[0];
  assert.ok(link);
  assert.match(link, /href="https:\/\/www\.youtube\.com\/watch\?v=/);
  assert.match(link, /target="_blank"/);
  assert.match(link, /rel="noopener noreferrer"/);
  assert.match(link, /referrerpolicy="no-referrer"/);
  assert.match(link, /on YouTube \(opens in a new tab\)/);
  assert.doesNotMatch(video, /<iframe|data-video-id|data-fallback/i);
  for (const file of fs.readdirSync(new URL('_projects/', root))) {
    const thumbnail = read(`_projects/${file}`).match(/^thumbnail:\s*(\S+)/m)?.[1];
    if (thumbnail) {
      assert.ok(thumbnail.startsWith('/assets/'), file);
      assert.ok(fs.existsSync(new URL(`.${thumbnail}`, root)), path.basename(thumbnail));
    }
  }
});

test('site script leaves video links alone and uses no network or browser storage', () => {
  const listeners = [];
  const blocked = () => assert.fail('Unexpected network, storage, or embedded resource use');
  const preview = {
    addEventListener: (event) => listeners.push(event),
    dataset: { videoId: 'cc7Ormfb1AQ' },
  };
  const year = {};
  const context = {
    document: {
      documentElement: { classList: { add() {} } },
      querySelector: (selector) => selector === '#year' ? year : null,
      querySelectorAll: (selector) => selector === '.video-preview' ? [preview] : [],
      createElement: blocked,
      cookie: undefined,
    },
    window: { matchMedia: () => ({ matches: false, addEventListener() {} }) },
    fetch: blocked,
    XMLHttpRequest: blocked,
    WebSocket: blocked,
    navigator: { sendBeacon: blocked },
    localStorage: new Proxy({}, { get: blocked, set: blocked }),
    sessionStorage: new Proxy({}, { get: blocked, set: blocked }),
  };
  Object.defineProperty(context.document, 'cookie', { get: blocked, set: blocked });
  vm.runInNewContext(read('script.js'), context);
  assert.deepEqual(listeners, [], 'video links must use normal browser navigation');
  assert.equal(year.textContent, new Date().getFullYear());
  assert.doesNotMatch(read('script.js'), /youtube-nocookie|data-fallback|\.cookie\b|\b(?:fetch|XMLHttpRequest|WebSocket|sendBeacon|localStorage|sessionStorage)\b/);
});
