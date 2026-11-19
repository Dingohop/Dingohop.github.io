import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const html = fs.readFileSync(new URL('../_site/index.html', import.meta.url), 'utf8');

test('OneMessage is honestly presented as an unfinished prototype with a local preview', () => {
  const project = html.match(/<article class="featured-web"[\s\S]*?<\/article>/)?.[0];
  assert.ok(project);
  assert.match(project, /In progress/);
  assert.match(project, /welcome-page prototype/);
  assert.match(project, /wider application is still in development/);
  assert.match(project, /src="\/assets\/images\/projects\/onemessage-welcome-preview.jpg"/);
  assert.doesNotMatch(project, /href="https?:|localhost|127\.0\.0\.1/);
});

test('the portfolio uses personal profile metadata and a quiet contact without sales or forms', () => {
  const data = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map(([, json]) => JSON.parse(json));
  const profile = data.find((item) => item['@type'] === 'ProfilePage');
  assert.equal(profile?.mainEntity?.['@type'], 'Person');
  assert.equal(profile.mainEntity.name, 'Michael Taylor');
  assert.doesNotMatch(html, /ProfessionalService|serviceType|Scope &amp; delivery|What I do|Design Media|<form\b|<input\b|<textarea\b/);
  assert.match(html, /Taylor’s Design/);
  assert.doesNotMatch(html, /\$\s*\d/);
});
