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

/* ---------- Manual portfolio carousel ---------- */
// Shared with the controls: counts and targets stay bounded during touch
// overscroll, partial scroll positions and responsive column changes.
function carouselRange({ scrollLeft, clientWidth, scrollWidth, cardWidth, gap, count }) {
  if (!count || cardWidth <= 0 || clientWidth <= 0) {
    return { first: 0, last: 0, visible: 0, previous: 0, next: 0, atStart: true, atEnd: true };
  }
  const stride = cardWidth + gap;
  const visible = Math.min(count, Math.max(1, Math.round((clientWidth + gap) / stride)));
  const maximum = Math.max(0, count - visible);
  const first = Math.min(maximum, Math.max(0, Math.round(scrollLeft / stride)));
  return {
    first,
    last: Math.min(count - 1, first + visible - 1),
    visible,
    previous: Math.max(0, first - visible),
    next: Math.min(maximum, first + visible),
    atStart: scrollLeft <= 2 || !maximum,
    atEnd: scrollLeft + clientWidth >= scrollWidth - 2 || !maximum,
  };
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
      timer = setTimeout(() => { advance(); schedule(); }, 6000);
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
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  slides.forEach((slide, index) => {
    slide.setAttribute('aria-label', `${index + 1} of ${slides.length}: ${slide.dataset.projectTitle}`);
  });

  const measure = () => {
    const style = getComputedStyle(track);
    const gap = parseFloat(style.columnGap) || 0;
    const padding = (parseFloat(style.paddingLeft) || 0) + (parseFloat(style.paddingRight) || 0);
    const cardWidth = slides[0]?.getBoundingClientRect().width || 0;
    return {
      stride: cardWidth + gap,
      range: carouselRange({
        scrollLeft: track.scrollLeft,
        clientWidth: track.clientWidth - padding,
        scrollWidth: track.scrollWidth - padding,
        cardWidth, gap, count: slides.length,
      }),
    };
  };

  const update = () => {
    const { range } = measure();
    previous.setAttribute('aria-disabled', String(range.atStart));
    next.setAttribute('aria-disabled', String(range.atEnd));
    const positions = range.first === range.last ? `${range.first + 1}` : `${range.first + 1}–${range.last + 1}`;
    const label = range.visible ? `${positions} of ${slides.length}` : '0 projects';
    if (status.textContent !== label) status.textContent = label;
  };

  const moveTo = (index, instant = false) => {
    const { stride } = measure();
    track.scrollTo({ left: index * stride, behavior: instant || reducedMotion.matches ? 'auto' : 'smooth' });
  };

  const rotation = carouselAutoplay({
    reducedMotion: reducedMotion.matches,
    advance: () => {
      const { range } = measure();
      if (range.visible >= slides.length) return;
      const wrap = range.atEnd;
      moveTo(wrap ? 0 : range.first + 1, wrap);
    },
    render: (playing) => {
      toggle.textContent = playing ? 'Pause' : 'Play';
      toggle.setAttribute('aria-label', playing ? 'Pause carousel' : 'Play carousel');
      announcement.setAttribute('aria-live', playing ? 'off' : 'polite');
    },
  });

  let announcementTimer;
  const announce = () => {
    clearTimeout(announcementTimer);
    if (announcement.textContent !== status.textContent) announcement.textContent = status.textContent;
  };
  const updateAndSettle = () => {
    update();
    clearTimeout(announcementTimer);
    announcementTimer = setTimeout(announce, 180);
  };

  toggle.addEventListener('click', () => rotation.isPlaying() ? rotation.pause() : rotation.play());
  carousel.addEventListener('pointerenter', (event) => {
    if (event.pointerType === 'mouse') rotation.setHover(true);
  });
  carousel.addEventListener('pointerleave', (event) => {
    if (event.pointerType === 'mouse') rotation.setHover(false);
  });
  carousel.addEventListener('focusin', (event) => rotation.focus(event.target === toggle));
  carousel.addEventListener('focusout', (event) => {
    if (!carousel.contains(event.relatedTarget)) rotation.blur();
  });
  track.addEventListener('pointerdown', () => rotation.pause(), { passive: true });
  track.addEventListener('wheel', (event) => {
    if (Math.abs(event.deltaX) > Math.abs(event.deltaY) || event.shiftKey) rotation.pause();
  }, { passive: true });
  document.addEventListener('visibilitychange', () => rotation.setVisible(!document.hidden));
  reducedMotion.addEventListener('change', (event) => { if (event.matches) rotation.pause(); });

  previous.addEventListener('click', () => {
    rotation.pause();
    const { range } = measure();
    if (!range.atStart) moveTo(range.previous);
  });
  next.addEventListener('click', () => {
    rotation.pause();
    const { range } = measure();
    if (!range.atEnd) moveTo(range.next);
  });
  track.addEventListener('scroll', updateAndSettle, { passive: true });
  track.addEventListener('scrollend', announce);
  track.addEventListener('keydown', (event) => {
    // Keep native keyboard behavior inside project links and disclosures.
    if (event.target !== track) return;
    const { range } = measure();
    let target;
    if (event.key === 'ArrowLeft') target = range.previous;
    if (event.key === 'ArrowRight') target = range.next;
    if (event.key === 'Home') target = 0;
    if (event.key === 'End') target = Math.max(0, slides.length - range.visible);
    if (target === undefined) return;
    event.preventDefault();
    moveTo(target);
  });
  window.addEventListener('resize', updateAndSettle);
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(updateAndSettle).observe(track);
  rotation.setVisible(!document.hidden);
  update();
  announce();
}
