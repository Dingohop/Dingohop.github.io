import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const root = new URL('../_site/', import.meta.url);
const pages = ['index.html', 'accessibility/index.html', '404.html'];
const read = (file) => fs.readFileSync(new URL(file, root), 'utf8');
const meta = (html, name) => html.match(new RegExp(`<meta (?:property|name)="${name}" content="([^"]*)"`))?.[1];

test('every public page has complete branded sharing metadata without invented handles', () => {
  for (const file of pages) {
    const html = read(file);
    assert.ok(html.match(/<title>([^<]+)<\/title>/)?.[1].includes('Taylor'), file);
    assert.ok(meta(html, 'description')?.length > 25, file);
    assert.match(html, /rel="canonical" href="https:\/\/taylorsdesignllc\.com\//, file);
    assert.equal(meta(html, 'og:image'), 'https://taylorsdesignllc.com/assets/images/social-card-studio.jpg', file);
    assert.equal(meta(html, 'twitter:image'), meta(html, 'og:image'), file);
    assert.equal(meta(html, 'twitter:card'), 'summary_large_image', file);
    assert.equal(meta(html, 'og:image:width'), '1200', file);
    assert.equal(meta(html, 'og:image:height'), '630', file);
    assert.ok(meta(html, 'og:image:alt')?.includes('Taylor'), file);
    assert.equal(meta(html, 'twitter:site'), undefined, file);
    assert.equal(meta(html, 'twitter:creator'), undefined, file);
  }
  assert.equal(fs.readFileSync(new URL('assets/images/social-card-studio.jpg', root)).subarray(0, 2).toString('hex'), 'ffd8');
});

test('public pages have one H1 and explicit image alternatives', () => {
  for (const file of pages) {
    const html = read(file);
    assert.equal([...html.matchAll(/<h1\b/g)].length, 1, file);
    for (const [tag] of html.matchAll(/<img\b[^>]+>/g)) assert.match(tag, /\balt="[^"]*"/, `${file}: ${tag}`);
  }
});

test('published output has a sitemap, custom recovery and no debug artifacts', () => {
  const sitemap = read('sitemap.xml');
  assert.match(sitemap, /https:\/\/taylorsdesignllc\.com\//);
  assert.doesNotMatch(sitemap, /404\.html|127\.0\.0\.1|localhost|vercel\.app/);
  assert.match(read('404.html'), /View the portfolio/);
  const script = read('script.js');
  assert.doesNotMatch(script, /console\.(?:log|debug)|sourceMappingURL/);
  assert.ok(Buffer.byteLength(script) < 50000, 'No oversized JS bundle');
  const files = fs.readdirSync(root, { recursive: true });
  assert.equal(files.filter((file) => file.endsWith('.map')).length, 0);
});
