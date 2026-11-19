import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

// Run the Jekyll build first: these check what a visitor actually receives.
const root = new URL('../_site/', import.meta.url);
const html = fs.readFileSync(new URL('index.html', root), 'utf8');

test('the opening features Rapture Ready and the approved two selected edits', () => {
  const opening = html.split('id="all-projects"')[0];
  assert.match(opening, /<h1[^>]*>Michael Taylor<\/h1>/);
  for (const id of ['eLOY-t9ioUI', '3fQs762NWMI', 'Tf19oRK3UwA']) {
    assert.ok(opening.includes(`https://www.youtube.com/watch?v=${id}`), id);
  }
  assert.doesNotMatch(opening, /Caribbean Carnival|hero-timeline|hero-motion-toggle/);
});

test('all eight projects remain reachable in a native disclosure without JavaScript', () => {
  const gallery = html.match(/<details\b[^>]*id="all-projects"[\s\S]*?<\/details>/)?.[0];
  assert.ok(gallery, 'A keyboard-accessible native disclosure contains the full portfolio');
  assert.match(gallery, /<summary[^>]*>[\s\S]*?View all eight projects/);
  assert.equal([...gallery.matchAll(/<article\b[^>]*class="project-row"/g)].length, 8);
  assert.match(gallery, /Caribbean Carnival/);
  assert.match(gallery, /Video link to be added/);
});

test('rendered media is local and every external video link protects the referrer', () => {
  for (const match of html.matchAll(/<img\b[^>]*src="([^"]+)"/g)) {
    assert.ok(match[1].startsWith('/assets/'), match[1]);
    assert.ok(fs.existsSync(new URL(`.${match[1]}`, root)), match[1]);
  }
  const videoLinks = [...html.matchAll(/<a\b[^>]*href="https:\/\/www\.youtube\.com\/watch\?v=[^"]+"[^>]*>/g)];
  assert.ok(videoLinks.length >= 9, 'featured, selected and full-gallery links render');
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
  assert.match(html, /href="mailto:michaeltaylor82@gmail\.com\?subject=Project%20inquiry">Email Michael<\/a>/);
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
