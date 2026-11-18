import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const root = new URL('../', import.meta.url);

test('every portfolio project has an existing local preview image', () => {
  const missing = [];
  for (const file of fs.readdirSync(new URL('_projects/', root))) {
    if (!file.endsWith('.md')) continue;
    const source = fs.readFileSync(new URL(`_projects/${file}`, root), 'utf8');
    const thumbnail = source.match(/^thumbnail:\s*(\S+)/m)?.[1];
    if (!thumbnail?.startsWith('/assets/images/projects/') || !fs.existsSync(new URL(`.${thumbnail}`, root))) {
      missing.push(file);
    }
  }
  assert.deepEqual(missing, [], 'Each project needs a preview served by this site');
});
