document.documentElement.classList.add('js');

const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const navAnchors = document.querySelectorAll('.nav-links a');
const year = document.querySelector('#year');
const mobileNavigation = window.matchMedia('(max-width: 760px)');

if (year) {
  year.textContent = new Date().getFullYear();
}

/* ---------- Navigation ---------- */
if (navToggle && navLinks) {
  const closeNavigation = (returnFocus = false) => {
    navLinks.classList.remove('active');
    navToggle.setAttribute('aria-expanded', 'false');

    if (returnFocus) {
      navToggle.focus();
    }
  };

  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('active');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navAnchors.forEach((anchor) => {
    anchor.addEventListener('click', () => {
      closeNavigation();
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navLinks.classList.contains('active')) {
      closeNavigation(true);
    }
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.nav') && navLinks.classList.contains('active')) {
      closeNavigation();
    }
  });

  mobileNavigation.addEventListener('change', () => closeNavigation());
}

/* ---------- Portfolio carousel ---------- */
// The native scroll window stays bounded; project positions wrap independently.
function carouselRange({ scrollLeft, clientWidth, cardWidth, gap, count }) {
  if (!count || cardWidth <= 0 || clientWidth <= 0) return { first: 0, visible: 0 };
  const stride = cardWidth + gap;
  const visible = Math.min(count, Math.max(1, Math.round((clientWidth + gap) / stride)));
  return { visible, first: Math.max(0, Math.min(count - visible, Math.round(scrollLeft / stride))) };
}

function carouselStep({ first, count, step = 1 }) {
  return count ? ((first + step) % count + count) % count : 0;
}

function carouselOrder({ first, slot, count }) {
  return Array.from({ length: count }, (_, position) => carouselStep({ first, count, step: position - slot }));
}

function carouselLabel({ first, visible, count }) {
  if (!visible) return '0 projects';
  const positions = first + visible <= count
    ? visible === 1 ? `${first + 1}` : `${first + 1}–${first + visible}`
    : Array.from({ length: visible }, (_, step) => carouselStep({ first, count, step }) + 1).join(', ');
  return `${positions} of ${count}`;
}

// Time-based easing runs at the display's refresh rate and is cancellable.
function carouselAnimate({ from, to, duration = 800, render, finish = () => {},
  requestFrame = (callback) => window.requestAnimationFrame(callback),
  cancelFrame = (id) => window.cancelAnimationFrame(id) }) {
  let started;
  let frame;
  const tick = (time) => {
    if (started === undefined) started = time;
    const progress = Math.min(1, (time - started) / duration);
    const eased = (1 - Math.cos(Math.PI * progress)) / 2;
    render(from + (to - from) * eased);
    if (progress < 1) frame = requestFrame(tick);
    else { frame = undefined; finish(); }
  };
  frame = requestFrame(tick);
  return () => { if (frame !== undefined) cancelFrame(frame); frame = undefined; };
}

function carouselAutoplay({ advance, render, reducedMotion = false }) {
  let playing = !reducedMotion;
  let hovering = false;
  let focused = false;
  let explicitFocusPlay = false;
  let visible = true;
  let timer;

  const schedule = () => {
    clearTimeout(timer);
    if (playing && !hovering && visible && (!focused || explicitFocusPlay)) {
      timer = setTimeout(() => { advance(); schedule(); }, 3000);
    }
  };
  const sync = () => { render(playing); schedule(); };
  const controls = {
    isPlaying: () => playing,
    pause() { playing = false; explicitFocusPlay = false; sync(); },
    play() { playing = true; explicitFocusPlay = true; sync(); },
    setHover(value) { hovering = value; sync(); },
    focus(isRotationControl) {
      focused = true;
      explicitFocusPlay = false;
      // Preserve the Pause button's requested state while it receives focus,
      // so a pointer click does not accidentally turn Pause into Play.
      if (!isRotationControl) playing = false;
      sync();
    },
    blur() {
      if (focused && !explicitFocusPlay) playing = false;
      focused = false;
      explicitFocusPlay = false;
      sync();
    },
    setVisible(value) { visible = value; sync(); },
  };
  sync();
  return controls;
}

const carousel = document.querySelector('[data-carousel]');
if (carousel) {
  const track = carousel.querySelector('.carousel-track');
  const slides = Array.from(track.querySelectorAll('.carousel-slide'));
  const previous = carousel.querySelector('.carousel-previous');
  const next = carousel.querySelector('.carousel-next');
  const status = carousel.querySelector('.carousel-status');
  const announcement = carousel.querySelector('.carousel-announcement');
  const toggle = carousel.querySelector('.carousel-toggle');
  const dots = Array.from(carousel.querySelectorAll('.carousel-dot'));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const count = slides.length;
  let orderStart = 0;
  let cancelAnimation;
  let announcementTimer;

  slides.forEach((slide, index) => slide.setAttribute('aria-label', `${index + 1} of ${count}: ${slide.dataset.projectTitle}`));

  const measure = () => {
    const style = getComputedStyle(track);
    const gap = parseFloat(style.columnGap) || 0;
    const padding = (parseFloat(style.paddingLeft) || 0) + (parseFloat(style.paddingRight) || 0);
    const cardWidth = slides[0]?.getBoundingClientRect().width || 0;
    const range = carouselRange({ scrollLeft: track.scrollLeft, clientWidth: track.clientWidth - padding, cardWidth, gap, count });
    return { ...range, slot: range.first, first: carouselStep({ first: orderStart, count, step: range.first }), stride: cardWidth + gap };
  };

  const update = () => {
    const { first, visible } = measure();
    const visibleProjects = new Set(Array.from({ length: visible }, (_, step) => carouselStep({ first, count, step })));
    slides.forEach((slide, index) => {
      slide.inert = !visibleProjects.has(index) && !slide.contains(document.activeElement);
    });
    const allFit = visible >= count;
    previous.setAttribute('aria-disabled', String(allFit));
    next.setAttribute('aria-disabled', String(allFit));
    status.textContent = carouselLabel({ first, visible, count });
    dots.forEach((dot, index) => {
      dot.hidden = allFit && index > 0;
      dot.setAttribute('aria-current', String(index === first));
      const distance = Math.abs(index - first);
      dot.setAttribute('data-near', String(distance === 1 || distance === count - 1));
      dot.setAttribute('aria-label', `Show ${visible === 1 ? 'project' : 'projects'} ${carouselLabel({ first: index, visible, count })}`);
    });
  };

  // Recycle the original nodes outside the visible window. No cloned links or IDs.
  const arrange = (first, slot, stride) => {
    const order = carouselOrder({ first, slot, count });
    const children = Array.from(track.children);
    track.classList.add('is-animating');
    if (order.some((index, position) => children[position] !== slides[index])) track.append(...order.map((index) => slides[index]));
    orderStart = order[0] || 0;
    track.scrollLeft = slot * stride;
    track.classList.remove('is-animating');
  };

  const normalize = () => {
    // Never move a node while a visitor is interacting with its link or details.
    if (track.contains(document.activeElement) && document.activeElement !== track) return;
    const { first, visible, slot, stride } = measure();
    const anchor = Math.floor((count - visible) / 2);
    if (slot !== anchor || Math.abs(track.scrollLeft - anchor * stride) > 1) arrange(first, anchor, stride);
  };

  const stopAnimation = () => {
    const wasAnimating = Boolean(cancelAnimation);
    if (cancelAnimation) cancelAnimation();
    cancelAnimation = undefined;
    track.classList.remove('is-animating');
    if (wasAnimating) normalize();
  };

  const moveTo = (target, steps) => {
    stopAnimation();
    const { first, visible, stride } = measure();
    const maximum = count - visible;
    if (maximum <= 0) return;
    let delta = steps ?? carouselStep({ first: target, count, step: -first });
    if (steps === undefined && delta > count / 2) delta -= count;
    const destination = carouselStep({ first, count, step: delta });
    const anchor = Math.floor(maximum / 2);
    if (reducedMotion.matches || !delta || Math.abs(delta) > maximum) {
      arrange(destination, anchor, stride);
      update();
      return;
    }
    // Make room in the requested direction before the animated part starts.
    const start = delta > 0 ? Math.min(anchor, maximum - delta) : Math.max(anchor, -delta);
    arrange(first, start, stride);
    track.classList.add('is-animating');
    cancelAnimation = carouselAnimate({
      from: start * stride, to: (start + delta) * stride,
      render: (position) => { track.scrollLeft = position; },
      finish: () => { stopAnimation(); update(); },
    });
  };

  const rotation = carouselAutoplay({
    reducedMotion: reducedMotion.matches,
    advance: () => moveTo(0, 1),
    render: (playing) => {
      toggle.textContent = playing ? 'Pause' : 'Play';
      toggle.setAttribute('aria-label', playing ? 'Pause carousel' : 'Play carousel');
      announcement.setAttribute('aria-live', playing ? 'off' : 'polite');
    },
  });

  const announce = () => {
    clearTimeout(announcementTimer);
    if (track.classList.contains('is-animating')) return;
    normalize();
    update();
    if (announcement.textContent !== status.textContent) announcement.textContent = status.textContent;
  };
  const updateAndSettle = () => {
    update();
    clearTimeout(announcementTimer);
    announcementTimer = setTimeout(announce, 180);
  };
  const pause = () => { rotation.pause(); stopAnimation(); update(); };

  toggle.addEventListener('click', () => rotation.isPlaying() ? pause() : rotation.play());
  dots.forEach((dot, index) => dot.addEventListener('click', () => { pause(); moveTo(index); }));
  previous.addEventListener('click', () => { pause(); moveTo(0, -measure().visible); });
  next.addEventListener('click', () => { pause(); moveTo(0, measure().visible); });
  carousel.addEventListener('pointerenter', (event) => {
    if (event.pointerType === 'mouse') { rotation.setHover(true); stopAnimation(); }
  });
  carousel.addEventListener('pointerleave', (event) => {
    if (event.pointerType === 'mouse') rotation.setHover(false);
  });
  carousel.addEventListener('focusin', (event) => { rotation.focus(event.target === toggle); stopAnimation(); });
  carousel.addEventListener('focusout', (event) => {
    if (!carousel.contains(event.relatedTarget)) rotation.blur();
  });
  track.addEventListener('pointerdown', pause, { passive: true });
  track.addEventListener('wheel', (event) => {
    if (Math.abs(event.deltaX) > Math.abs(event.deltaY) || event.shiftKey) pause();
  }, { passive: true });
  document.addEventListener('visibilitychange', () => {
    rotation.setVisible(!document.hidden);
    if (document.hidden) stopAnimation();
  });
  reducedMotion.addEventListener('change', (event) => { if (event.matches) pause(); });
  track.addEventListener('scroll', updateAndSettle, { passive: true });
  track.addEventListener('scrollend', announce);
  track.addEventListener('keydown', (event) => {
    if (event.target !== track) return;
    const { first, visible } = measure();
    const targets = { ArrowLeft: carouselStep({ first, count, step: -visible }), ArrowRight: carouselStep({ first, count, step: visible }), Home: 0, End: count - 1 };
    if (!(event.key in targets)) return;
    event.preventDefault();
    pause();
    moveTo(targets[event.key]);
  });
  window.addEventListener('resize', () => { stopAnimation(); updateAndSettle(); });
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(updateAndSettle).observe(track);
  rotation.setVisible(!document.hidden);
  arrange(0, Math.floor((count - measure().visible) / 2), measure().stride);
  update();
  announce();
}
