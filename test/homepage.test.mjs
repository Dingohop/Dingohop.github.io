import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

// Run the Jekyll build first: these check what a visitor actually receives.
const root = new URL('../_site/', import.meta.url);
const html = fs.readFileSync(new URL('index.html', root), 'utf8');

test('the portfolio leads with Michael and the featured projects', () => {
  const heading = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1].replace(/<br\s*\/?\s*>/g, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  assert.equal(heading, 'Michael Taylor.');
  assert.match(html, /id="work-heading">Selected work/);
  assert.doesNotMatch(html, /hero-timeline|hero-motion-toggle/);
});

test('all eight real projects render in the carousel, including previews awaiting links', () => {
  const titles = [...html.matchAll(/data-project-title="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(titles.length, 8);
  assert.equal(new Set(titles).size, 8);
  assert.deepEqual(titles.slice(0, 3), ['Rapture Ready', 'Sermon Clip Editing', 'The Chatbox']);
  assert.ok(titles.includes('Caribbean Carnival'));
  assert.equal((html.match(/Video link to be added/g) ?? []).length, 2);
  assert.match(html, /aria-roledescription="carousel"/);
  assert.doesNotMatch(html, /id="all-projects"/);
});

test('rendered media is local and every external video link protects the referrer', () => {
  for (const match of html.matchAll(/<img\b[^>]*src="([^"]+)"/g)) {
    assert.ok(match[1].startsWith('/assets/'), match[1]);
    assert.ok(fs.existsSync(new URL(`.${match[1]}`, root)), match[1]);
  }
  const videoLinks = [...html.matchAll(/<a\b[^>]*href="https:\/\/www\.youtube\.com\/watch\?v=[^"]+"[^>]*>/g)];
  assert.equal(videoLinks.length, 10, 'Six carousel links and two links for each featured video');
  assert.equal(new Set(videoLinks.map(([link]) => link.match(/watch\?v=([^"]+)/)[1])).size, 6, 'Only six real video destinations');
  for (const [link] of videoLinks) {
    assert.match(link, /target="_blank"/);
    assert.match(link, /rel="noopener noreferrer"/);
    assert.match(link, /referrerpolicy="no-referrer"/);
  }
});

test('primary navigation resolves and contact uses the configured email', () => {
  for (const match of html.matchAll(/href="\/?#([^"]+)"/g)) {
    assert.ok(html.includes(`id="${match[1]}"`), `Missing anchor: ${match[1]}`);
  }
  assert.match(html, /href="mailto:michaeltaylor82@gmail\.com">michaeltaylor82@gmail\.com<\/a>/);
  assert.doesNotMatch(html, /<form\b/);
});

test('local recovery and supporting-page links resolve to generated files', () => {
  for (const file of ['index.html', '404.html', 'accessibility/index.html']) {
    const page = fs.readFileSync(new URL(file, root), 'utf8');
    for (const match of page.matchAll(/<a\b[^>]*href="\/([^"#?]*)/g)) {
      const target = match[1];
      const destination = target.endsWith('/') || !target ? `${target}index.html` : target;
      assert.ok(fs.existsSync(new URL(destination, root)), `${file} links to missing /${target}`);
    }
  }
});
