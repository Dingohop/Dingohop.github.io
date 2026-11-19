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

test('native scroll positions remain bounded through overscroll and responsive changes', () => {
  assert.deepEqual([range().first, range().visible], [0, 3]);
  assert.equal(range({ scrollLeft: -60 }).first, 0);
  assert.equal(range({ scrollLeft: 9999 }).first, 5);
  assert.deepEqual([range({ clientWidth: 360 }).first, range({ clientWidth: 360 }).visible], [0, 1]);
  assert.equal(range({ clientWidth: 744 }).visible, 2);
  assert.equal(range({ scrollLeft: 2688, clientWidth: 1128 }).first, 5);
  assert.equal(range({ count: 0, cardWidth: 0 }).visible, 0);
});

test('a recycled window crosses the last project without duplicates or a reversed order', () => {
  const order = [...context.carouselOrder({ first: 7, slot: 2, count: 8 })];
  assert.deepEqual(order, [5, 6, 7, 0, 1, 2, 3, 4]);
  assert.equal(new Set(order).size, 8);
  assert.deepEqual(order.slice(2, 5), [7, 0, 1], 'last project is followed by the first two');
  assert.deepEqual([...context.carouselOrder({ first: 0, slot: 3, count: 8 })], [5, 6, 7, 0, 1, 2, 3, 4]);
  assert.deepEqual([...context.carouselOrder({ first: 0, slot: 0, count: 0 })], []);
});

test('wrapped position labels identify the visible projects', () => {
  assert.equal(context.carouselLabel({ first: 0, visible: 3, count: 8 }), '1–3 of 8');
  assert.equal(context.carouselLabel({ first: 7, visible: 3, count: 8 }), '8, 1, 2 of 8');
  assert.equal(context.carouselLabel({ first: 7, visible: 1, count: 8 }), '8 of 8');
  assert.equal(context.carouselLabel({ first: 0, visible: 0, count: 0 }), '0 projects');
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

test('autoplay advances every three seconds and Pause/Play controls it', () => {
  const h = autoplayHarness();
  h.advanceTime(2999);
  assert.equal(h.moves, 0);
  h.advanceTime(1);
  assert.equal(h.moves, 1);
  h.rotation.pause();
  h.advanceTime(18000);
  assert.equal(h.moves, 1);
  h.rotation.play();
  h.advanceTime(3000);
  assert.equal(h.moves, 2);
});

test('hover pauses temporarily and keyboard interaction waits for explicit Play', () => {
  const h = autoplayHarness();
  h.rotation.setHover(true);
  h.advanceTime(12000);
  assert.equal(h.moves, 0);
  h.rotation.setHover(false);
  h.advanceTime(3000);
  assert.equal(h.moves, 1);
  h.rotation.focus(false);
  h.rotation.blur();
  h.advanceTime(12000);
  assert.equal(h.moves, 1);
  h.rotation.focus(true);
  h.rotation.play();
  h.advanceTime(3000);
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
  h.advanceTime(3000);
  assert.equal(h.moves, 1);
});

// Exercise frame timing rather than relying on a browser's default scroll duration.
test('carousel transitions ease in and out, finish exactly, and can be interrupted', () => {
  let sequence = 0;
  const frames = new Map();
  const requestFrame = (callback) => { const id = ++sequence; frames.set(id, callback); return id; };
  const cancelFrame = (id) => frames.delete(id);
  const tick = (time) => {
    const callbacks = [...frames.values()];
    frames.clear();
    callbacks.forEach((callback) => callback(time));
  };
  const values = [];
  let finished = false;
  context.carouselAnimate({ from: 0, to: 100, duration: 800,
    render: (value) => values.push(value), finish: () => { finished = true; },
    requestFrame, cancelFrame });
  tick(1000);
  assert.equal(values.at(-1), 0);
  tick(1200);
  assert.ok(values.at(-1) > 0 && values.at(-1) < 25, 'gentle start');
  tick(1400);
  assert.ok(Math.abs(values.at(-1) - 50) < .001);
  tick(1600);
  assert.ok(values.at(-1) > 75 && values.at(-1) < 100, 'gentle arrival');
  tick(1800);
  assert.equal(values.at(-1), 100);
  assert.ok(finished);
  assert.equal(frames.size, 0);

  const stop = context.carouselAnimate({ from: 100, to: 0, duration: 800,
    render: (value) => values.push(value), requestFrame, cancelFrame });
  tick(2000);
  tick(2200);
  const beforeStop = values.at(-1);
  stop();
  tick(3000);
  assert.equal(values.at(-1), beforeStop, 'manual interaction cancels pending movement');
  assert.equal(frames.size, 0);
});

test('automatic and manual movement wrap around the complete collection', () => {
  let first = 0;
  const seen = [];
  for (let i = 0; i < 12; i += 1) {
    first = context.carouselStep({ first, count: 8 });
    seen.push(first);
  }
  assert.deepEqual(seen, [1, 2, 3, 4, 5, 6, 7, 0, 1, 2, 3, 4]);
  assert.equal(context.carouselStep({ first: 0, count: 8, step: -3 }), 5);
  assert.equal(context.carouselStep({ first: 7, count: 8, step: 3 }), 2);
  assert.equal(context.carouselStep({ first: 0, count: 1 }), 0);
  assert.equal(context.carouselStep({ first: 0, count: 0 }), 0);
});
