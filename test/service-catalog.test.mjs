import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const index = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const config = fs.readFileSync(new URL('../_config.yml', import.meta.url), 'utf8');
const script = fs.readFileSync(new URL('../script.js', import.meta.url), 'utf8');
const head = fs.readFileSync(new URL('../_includes/head.html', import.meta.url), 'utf8');
const styles = fs.readFileSync(new URL('../style.css', import.meta.url), 'utf8');

const publicFamilies = [
  'Video Editing',
  'Informational Websites and Blogs',
  'Promotional Design',
  'Website Care',
];

const inquiryChoices = [
  'Short-Form Video',
  'Long-Form Video',
  'Video Repurposing',
  'Informational Website',
  'Website and Blog',
  'Promotional Graphic or Flyer',
  'Website Maintenance or Update',
  'Not Sure Yet',
];

test('homepage presents the four approved public service families', () => {
  for (const family of publicFamilies) assert.match(index, new RegExp(family));
});

test('inquiry form offers only the approved choices', () => {
  const select = index.match(/<select id="cf-type"[\s\S]*?<\/select>/)?.[0] ?? '';
  const actual = [...select.matchAll(/<option>([^<]+)<\/option>/g)].map((match) => match[1]);
  assert.deepEqual(actual, inquiryChoices);
});

test('public scope states the important client-supplied and delivery limits', () => {
  assert.match(index, /client-supplied/i);
  assert.match(index, /existing branding/i);
  assert.match(index, /digital and\s+print-ready files only/i);
  assert.match(index, /publish (?:their|your) own posts/i);
});

test('homepage and metadata do not advertise excluded offers or public prices', () => {
  const publicCopy = `${index}\n${config}`;
  assert.doesNotMatch(publicCopy, /logo (?:creation|design)|branding package|printing coordination|filming service|ecommerce|custom app/i);
  assert.doesNotMatch(index, /\$\s*\d/);
});

test('contact email subject is broad enough for every approved service', () => {
  assert.match(script, /const subject = `Project inquiry: \$\{type\}`;/);
  assert.doesNotMatch(script, /Video project:/);
});

test('structured metadata represents the complete approved service mix', () => {
  assert.match(head, /Creative Services Provider/);
  for (const family of publicFamilies) assert.match(head, new RegExp(family));
  assert.doesNotMatch(head, /"serviceType": "Video editing"/);
});

test('four service cards use a balanced desktop grid', () => {
  assert.match(styles, /\.services-list\s*\{[\s\S]*?grid-template-columns:\s*repeat\(2,/);
});
