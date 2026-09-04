document.documentElement.classList.add('js');

const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const navAnchors = document.querySelectorAll('.nav-links a');
const year = document.querySelector('#year');
const videoPreviews = document.querySelectorAll('.video-preview');
const fallbackImages = document.querySelectorAll('img[data-fallback]');
const hero = document.querySelector('.hero');
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

/* ---------- Hero timeline motion ---------- */
let heroMotionPaused = reducedMotion.matches;

const applyHeroMotionPreference = () => {
  if (!hero || !heroMotionToggle) {
    return;
  }

  hero.classList.toggle('motion-paused', heroMotionPaused);
  heroMotionToggle.textContent = heroMotionPaused ? 'Play animation' : 'Pause animation';
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
      }
    });
  });
}

/* ---------- Contact form ---------- */
/* Static host, so there is no server to post to. The form composes a
   structured email instead, which is the "template" that lands in the
   inbox. Swap this for a real endpoint later without touching the markup. */
const contactForm = document.querySelector('#contact-form');

if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const to = contactForm.dataset.mailto;
    if (!to) {
      return;
    }

    const value = (name) => {
      const field = contactForm.elements[name];
      return field ? field.value.trim() : '';
    };

    const name = value('name');
    const type = value('type');
    const subject = `Video project: ${type}`;
    const body = [
      `Name: ${name}`,
      `Email: ${value('email')}`,
      `Project type: ${type}`,
      '',
      value('details'),
      ''
    ].join('\n');

    window.location.href =
      `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
}
