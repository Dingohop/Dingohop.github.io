document.documentElement.classList.add('js');

const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const navAnchors = document.querySelectorAll('.nav-links a');
const year = document.querySelector('#year');
const videoPreviews = document.querySelectorAll('.video-preview');
const fallbackImages = document.querySelectorAll('img[data-fallback]');
const hero = document.querySelector('.hero');
const heroVideo = document.querySelector('.hero-video');
const heroMotionToggle = document.querySelector('.hero-motion-toggle');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
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

/* ---------- Thumbnail fallbacks ---------- */
fallbackImages.forEach((image) => {
  image.addEventListener('error', () => {
    const fallback = image.dataset.fallback;

    if (fallback && image.src !== fallback) {
      image.src = fallback;
    }
  });
});

/* ---------- Hero background motion ---------- */
let heroMotionPaused = reducedMotion.matches;

const applyHeroMotionPreference = () => {
  if (!heroVideo || !hero || !heroMotionToggle) {
    return;
  }

  hero.classList.toggle('motion-paused', heroMotionPaused);
  heroMotionToggle.textContent = heroMotionPaused ? 'Play background' : 'Pause background';

  if (heroMotionPaused) {
    heroVideo.pause();
    return;
  }

  heroVideo.play().catch(() => {
    // The poster frame remains visible if autoplay is unavailable.
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

/* ---------- Click-to-load video players ---------- */
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

    const slot = preview.closest('.player-slot') || preview.parentElement;
    const title = preview.dataset.videoTitle || 'Video project';

    const iframe = document.createElement('iframe');
    iframe.className = 'portfolio-player';
    if (preview.dataset.videoAspect === 'portrait') {
      iframe.classList.add('is-portrait');
    }
    iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&playsinline=1&cc_load_policy=1&hl=en`;
    iframe.title = `${title} player`;
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.tabIndex = 0;

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'player-close';
    closeButton.textContent = 'Close video';

    const shell = document.createElement('div');
    shell.className = 'player-shell';
    shell.append(iframe, closeButton);

    preview.hidden = true;
    slot.append(shell);

    closeButton.addEventListener('click', () => {
      shell.remove();
      preview.hidden = false;
      preview.focus();
    });

    iframe.addEventListener('load', () => iframe.focus(), { once: true });
  });
});

/* ---------- Category filtering on the work index ---------- */
const filterChips = document.querySelectorAll('.filter-chip');
const projectRows = document.querySelectorAll('#project-list .project-row');
const workEmpty = document.querySelector('.work-empty');
const filterStatus = document.querySelector('.filter-status');

if (filterChips.length && projectRows.length) {
  filterChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const filter = chip.dataset.filter;
      let shown = 0;

      filterChips.forEach((other) => {
        const isActive = other === chip;
        other.classList.toggle('is-active', isActive);
        other.setAttribute('aria-pressed', String(isActive));
      });

      projectRows.forEach((row) => {
        const match = filter === 'all' || row.dataset.category === filter;
        row.hidden = !match;
        if (match) {
          shown += 1;
        }
      });

      if (workEmpty) {
        workEmpty.hidden = shown !== 0;
      }

      if (filterStatus) {
        const label = filter === 'all' ? 'all categories' : chip.textContent.trim();
        filterStatus.textContent = `Showing ${shown} ${shown === 1 ? 'project' : 'projects'} in ${label}.`;
        const firstVisible = document.querySelector('#project-list .project-row:not([hidden])');
        if (firstVisible) {
          firstVisible.classList.add('is-first-visible');
        }
        projectRows.forEach((row) => {
          if (row !== firstVisible) { row.classList.remove('is-first-visible'); }
        });
      }
    });
  });
}
