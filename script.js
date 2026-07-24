document.documentElement.classList.add('js');

const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const navAnchors = document.querySelectorAll('.nav-links a');
const year = document.querySelector('#year');
const videoPreviews = document.querySelectorAll('.video-preview');
const previewImages = document.querySelectorAll('.video-preview img[data-fallback]');
const hero = document.querySelector('.hero');
const heroVideo = document.querySelector('.hero-video');
const heroMotionToggle = document.querySelector('.hero-motion-toggle');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const mobileNavigation = window.matchMedia('(max-width: 760px)');

if (year) {
  year.textContent = new Date().getFullYear();
}

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

previewImages.forEach((image) => {
  image.addEventListener('error', () => {
    const fallback = image.dataset.fallback;

    if (fallback && image.src !== fallback) {
      image.src = fallback;
    }
  });
});

let heroMotionPaused = reducedMotion.matches;

const applyHeroMotionPreference = () => {
  if (!heroVideo || !hero || !heroMotionToggle) {
    return;
  }

  hero.classList.toggle('motion-paused', heroMotionPaused);
  heroMotionToggle.setAttribute('aria-pressed', String(heroMotionPaused));
  heroMotionToggle.textContent = heroMotionPaused ? 'Play background video' : 'Pause background video';

  if (heroMotionPaused) {
    heroVideo.pause();
    return;
  }

  heroVideo.play().catch(() => {
    // The gradient background remains visible if autoplay is unavailable.
  });
};

applyHeroMotionPreference();

if (heroMotionToggle) {
  heroMotionToggle.addEventListener('click', () => {
    heroMotionPaused = !heroMotionPaused;
    applyHeroMotionPreference();
  });
}

reducedMotion.addEventListener('change', (event) => {
  heroMotionPaused = event.matches;
  applyHeroMotionPreference();
});

videoPreviews.forEach((preview) => {
  preview.addEventListener('click', (event) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    const videoId = preview.dataset.videoId;

    if (!videoId) {
      return;
    }

    event.preventDefault();

    const iframe = document.createElement('iframe');
    iframe.className = 'portfolio-player';
    if (preview.dataset.videoAspect === 'portrait') {
      iframe.classList.add('is-portrait');
    }
    iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&playsinline=1&cc_load_policy=1&hl=en`;
    iframe.title = `${preview.dataset.videoTitle || 'Video project'} player`;
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.tabIndex = 0;

    preview.replaceWith(iframe);
    iframe.addEventListener('load', () => iframe.focus(), { once: true });
  });
});
