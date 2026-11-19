import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const context = {
  document: {
    documentElement: { classList: { add() {} } },
    querySelector: () => null,
    querySelectorAll: () => [],
  },
  window: { matchMedia: () => ({ matches: false, addEventListener() {} }) },
};
vm.runInNewContext(fs.readFileSync(new URL('../script.js', import.meta.url), 'utf8'), context);
const range = (overrides = {}) => context.carouselRange({
  scrollLeft: 0, clientWidth: 1128, scrollWidth: 3048, cardWidth: 360, gap: 24, count: 8,
  ...overrides,
});

test('desktop carousel moves through all eight projects and stops at the ends', () => {
  const first = range();
  assert.deepEqual([first.first, first.last, first.previous, first.next], [0, 2, 0, 3]);
  assert.ok(first.atStart);
  assert.equal(first.atEnd, false);
  const middle = range({ scrollLeft: first.next * 384 });
  assert.deepEqual([middle.first, middle.last, middle.next], [3, 5, 5]);
  const last = range({ scrollLeft: middle.next * 384 });
  assert.deepEqual([last.first, last.last, last.next], [5, 7, 5]);
  assert.ok(last.atEnd);
});

test('phone and tablet layouts expose the correct number of projects', () => {
  const phone = range({ clientWidth: 360 });
  assert.deepEqual([phone.first, phone.last, phone.next], [0, 0, 1]);
  const tablet = range({ clientWidth: 744 });
  assert.deepEqual([tablet.first, tablet.last, tablet.next], [0, 1, 2]);
  const phoneEnd = range({ clientWidth: 360, scrollLeft: 2688 });
  assert.deepEqual([phoneEnd.first, phoneEnd.last, phoneEnd.previous], [7, 7, 6]);
  assert.ok(phoneEnd.atEnd);
});

test('elastic overscroll and resizing never produce out-of-range project positions', () => {
  const negative = range({ scrollLeft: -60 });
  assert.equal(negative.first, 0);
  assert.ok(negative.atStart);
  const pastEnd = range({ scrollLeft: 9999 });
  assert.deepEqual([pastEnd.first, pastEnd.last], [5, 7]);
  assert.ok(pastEnd.atEnd);
  const resized = range({ scrollLeft: 2688, clientWidth: 1128 });
  assert.deepEqual([resized.first, resized.last], [5, 7]);
});

test('a single project or empty collection has no enabled navigation', () => {
  const single = range({ count: 1, clientWidth: 360, scrollWidth: 360 });
  assert.deepEqual([single.first, single.last, single.previous, single.next], [0, 0, 0, 0]);
  assert.ok(single.atStart && single.atEnd);
  const empty = range({ count: 0, cardWidth: 0, clientWidth: 0, scrollWidth: 0 });
  assert.equal(empty.visible, 0);
  assert.ok(empty.atStart && empty.atEnd);
});

function autoplayHarness(reducedMotion = false) {
  let now = 0;
  let sequence = 0;
  const timers = new Map();
  const sandbox = {
    document: context.document,
    window: context.window,
    setTimeout(callback, delay) {
      const id = ++sequence;
      timers.set(id, { callback, at: now + delay });
      return id;
    },
    clearTimeout(id) { timers.delete(id); },
  };
  vm.runInNewContext(fs.readFileSync(new URL('../script.js', import.meta.url), 'utf8'), sandbox);
  assert.equal(typeof sandbox.carouselAutoplay, 'function', 'Autoplay controls must exist');
  let moves = 0;
  const states = [];
  const rotation = sandbox.carouselAutoplay({
    advance: () => { moves += 1; },
    render: (playing) => states.push(playing),
    reducedMotion,
  });
  const advanceTime = (milliseconds) => {
    const until = now + milliseconds;
    while (true) {
      const due = [...timers.entries()].sort((a, b) => a[1].at - b[1].at)[0];
      if (!due || due[1].at > until) break;
      timers.delete(due[0]);
      now = due[1].at;
      due[1].callback();
    }
    now = until;
  };
  return { rotation, advanceTime, get moves() { return moves; }, states };
}

test('autoplay advances every six seconds and Pause/Play controls it', () => {
  const h = autoplayHarness();
  h.advanceTime(5999);
  assert.equal(h.moves, 0);
  h.advanceTime(1);
  assert.equal(h.moves, 1);
  h.rotation.pause();
  h.advanceTime(18000);
  assert.equal(h.moves, 1);
  h.rotation.play();
  h.advanceTime(6000);
  assert.equal(h.moves, 2);
});

test('hover pauses temporarily and keyboard interaction waits for explicit Play', () => {
  const h = autoplayHarness();
  h.rotation.setHover(true);
  h.advanceTime(12000);
  assert.equal(h.moves, 0);
  h.rotation.setHover(false);
  h.advanceTime(6000);
  assert.equal(h.moves, 1);
  h.rotation.focus(false);
  h.rotation.blur();
  h.advanceTime(12000);
  assert.equal(h.moves, 1);
  h.rotation.focus(true);
  h.rotation.play();
  h.advanceTime(6000);
  assert.equal(h.moves, 2);
});

test('reduced motion starts paused and hidden pages never advance', () => {
  const h = autoplayHarness(true);
  h.advanceTime(12000);
  assert.equal(h.moves, 0);
  assert.equal(h.states.at(-1), false);
  h.rotation.play();
  h.rotation.setVisible(false);
  h.advanceTime(12000);
  assert.equal(h.moves, 0);
  h.rotation.setVisible(true);
  h.advanceTime(6000);
  assert.equal(h.moves, 1);
});
