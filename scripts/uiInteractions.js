/* =========================================================================
   UI interactions — sticky nav, scrollspy, scroll-reveal, copy email,
   and the pinned "show, don't tell" story scroller.
   ========================================================================= */
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

const nav = document.getElementById('nav');
const navLinks = Array.from(document.querySelectorAll('.nav-links a'));

/* ---------------------------------------------------------------------- */
/* Mobile menu — hamburger toggles the nav-links dropdown                 */
/* ---------------------------------------------------------------------- */
const navToggle = document.getElementById('nav-toggle');
if (navToggle && nav) {
  const setMenu = (open) => {
    nav.classList.toggle('menu-open', open);
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  navToggle.addEventListener('click', () => setMenu(!nav.classList.contains('menu-open')));
  // Tapping any link inside the dropdown closes it.
  document.querySelectorAll('#nav-menu a').forEach((a) =>
    a.addEventListener('click', () => setMenu(false)));
  // Tapping outside the open menu closes it.
  document.addEventListener('click', (e) => {
    if (nav.classList.contains('menu-open') && !nav.contains(e.target)) setMenu(false);
  });
}

/* ---------------------------------------------------------------------- */
/* Scroll-reveal (IntersectionObserver) — exposed for dynamic content     */
/* ---------------------------------------------------------------------- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

window.observeReveals = function () {
  document.querySelectorAll('.reveal:not(.io-watched)').forEach((el, i) => {
    el.classList.add('io-watched');
    if (!el.style.getPropertyValue('--i')) el.style.setProperty('--i', (i % 6).toString());
    revealObserver.observe(el);
  });
};
window.observeReveals();

/* ---------------------------------------------------------------------- */
/* Sticky nav — gains a background once the page is scrolled              */
/* ---------------------------------------------------------------------- */
const onScrollNav = () => {
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 24);
};
window.addEventListener('scroll', onScrollNav, { passive: true });
onScrollNav();

/* ---------------------------------------------------------------------- */
/* Scrollspy — highlight the nav link for the section in view             */
/* ---------------------------------------------------------------------- */
const sections = navLinks
  .map((link) => document.getElementById(link.dataset.nav))
  .filter(Boolean);

const spy = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const id = entry.target.id;
    navLinks.forEach((l) => l.classList.toggle('active', l.dataset.nav === id));
  });
}, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

sections.forEach((s) => spy.observe(s));

/* ---------------------------------------------------------------------- */
/* Demo iframes — stop them from hijacking scroll                         */
/* The featured pitches embed cross-origin live apps that run a scripted     */
/* auto-demo. When one focuses a field inside itself, the browser scrolls    */
/* that iframe into view — yanking the whole page down, seemingly at random. */
/* demoFrames.js parks off-screen demos so this can't happen at any real     */
/* distance; this is the backstop for a demo sitting just past the fold.     */
(() => {
  const isDemo = (el) =>
    el && el.tagName === 'IFRAME' && el.closest('.phone-embed, .browser-embed');

  let restingY = window.scrollY;
  let lastInput = 0;
  ['wheel', 'touchstart', 'touchmove', 'keydown', 'pointerdown'].forEach((evt) =>
    window.addEventListener(evt, () => { lastInput = Date.now(); },
      { capture: true, passive: true }));

  // Any scroll the visitor drove is their intent — remember it. A jump nothing
  // they did explains, while a demo holds focus, is the iframe pulling itself
  // into view: put the page back. Note we watch 'scroll', not 'blur' — the
  // browser performs that scroll *after* the blur event, so a blur handler
  // corrects a position it hasn't lost yet and the jump wins.
  window.addEventListener('scroll', () => {
    const stolen = isDemo(document.activeElement) &&
                   Date.now() - lastInput > 700 &&
                   Math.abs(window.scrollY - restingY) > 120;
    if (stolen) window.scrollTo(0, restingY);
    else restingY = window.scrollY;
  }, { passive: true });
})();

/* ---------------------------------------------------------------------- */
/* "Show, don't tell" — pinned scroll story                               */
/* The section is made tall; an inner panel sticks to the viewport while  */
/* we crossfade between clips based on how far we've scrolled through it.  */
/* ---------------------------------------------------------------------- */
window.initStoryScroll = function (numClips) {
  const section = document.querySelector('.story');
  const clips = Array.from(document.querySelectorAll('.story-clip'));
  const dots = Array.from(document.querySelectorAll('.story-dot'));
  if (!section || !clips.length || !numClips) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Fallback: no scroll-jacking — just stack the clips and play them all.
  if (reduceMotion) {
    section.classList.add('story-static');
    clips.forEach((c) => {
      c.classList.add('is-active');
      c.style.opacity = 1;
      const v = c.querySelector('video');
      if (v) { v.muted = true; v.play().catch(() => {}); }
    });
    return;
  }

  section.classList.add('story-dynamic');
  // Each clip "sticks" for a long stretch of scroll before the next one hits.
  // The middle clip gets extra weight — it sat in the crossfire between its two
  // neighbours and was easy to scroll straight past.
  const PER_CLIP_VH = 135;
  const MIDDLE_WEIGHT = 2;
  const middleIdx = numClips >= 3 ? Math.floor((numClips - 1) / 2) : -1;
  const weights = Array.from({ length: numClips }, (_, i) =>
    i === middleIdx ? MIDDLE_WEIGHT : 1
  );
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  // Where each clip hands off to the next, as a 0–1 fraction of the scroll.
  const bounds = [];
  weights.reduce((acc, w) => { const next = acc + w / totalWeight; bounds.push(next); return next; }, 0);
  section.style.height = (totalWeight * PER_CLIP_VH + 40) + 'vh';

  const setActiveVideo = (idx) => {
    clips.forEach((c, i) => {
      const v = c.querySelector('video');
      if (!v) return;
      if (i === idx) { try { v.currentTime = 0; } catch (e) {} const p = v.play(); if (p && p.catch) p.catch(() => {}); }
      else { v.pause(); }
    });
  };

  // Discrete model: a scroll threshold *flips* the active clip. There is no
  // in-between state — you can't park the page on a half-faded clip. The CSS
  // then plays a short, non-overlapping fade-out → fade-in.
  let currentIdx = -1;
  let ticking = false;
  const update = () => {
    ticking = false;
    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight;
    const scrollLen = section.offsetHeight - vh;
    let t = scrollLen > 0 ? (-rect.top) / scrollLen : 0;
    t = Math.max(0, Math.min(1, t));

    let idx = bounds.findIndex((b) => t < b);
    if (idx < 0) idx = numClips - 1;
    if (idx === currentIdx) return;
    currentIdx = idx;

    setActiveVideo(idx);
    clips.forEach((c, i) => c.classList.toggle('is-active', i === idx));
    dots.forEach((d, i) => d.classList.toggle('is-active', i === idx));
  };

  const onScroll = () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
};

/* ---------------------------------------------------------------------- */
/* Copy to clipboard (email / phone) with a toast                         */
/* ---------------------------------------------------------------------- */
const showCopyToast = (label) => {
  const toast = document.getElementById('copy-popup');
  if (!toast) return;
  toast.textContent = label + ' copied to clipboard';
  toast.classList.add('show');
  clearTimeout(window.__copyTimer);
  window.__copyTimer = setTimeout(() => toast.classList.remove('show'), 1900);
};

window.copyEmail = function () {
  const email = (window.__resumeData && window.__resumeData.email) || 'o.wyatt@wustl.edu';
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(email).then(() => showCopyToast('Email')).catch(() => { window.location.href = 'mailto:' + email; });
  } else {
    window.location.href = 'mailto:' + email;
  }
};

window.copyPhone = function () {
  const phone = (window.__resumeData && window.__resumeData.phone) || '442-515-0724';
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(phone).then(() => showCopyToast('Phone number')).catch(() => { window.location.href = 'tel:' + phone; });
  } else {
    window.location.href = 'tel:' + phone;
  }
};

/* ---------------------------------------------------------------------- */
/* Mobile: tapping a project title opens a popup to visit its link.        */
/* (The inline "Visit site / View on GitHub" button is hidden on mobile.)  */
/* ---------------------------------------------------------------------- */
(function () {
  const isMobile = () => window.matchMedia('(max-width: 760px)').matches;
  let popup;

  const closePopup = () => { if (popup) popup.classList.remove('is-open'); };

  const buildPopup = () => {
    popup = document.createElement('div');
    popup.className = 'link-popup';
    popup.innerHTML =
      '<div class="link-popup-backdrop"></div>' +
      '<div class="link-popup-card" role="dialog" aria-modal="true">' +
        '<p class="link-popup-title"></p>' +
        '<a class="link-popup-go" target="_blank" rel="noopener"></a>' +
        '<button type="button" class="link-popup-cancel">Cancel</button>' +
      '</div>';
    document.body.appendChild(popup);
    popup.querySelector('.link-popup-backdrop').addEventListener('click', closePopup);
    popup.querySelector('.link-popup-cancel').addEventListener('click', closePopup);
    popup.querySelector('.link-popup-go').addEventListener('click', closePopup);
    return popup;
  };

  const openPopup = (name, label, href) => {
    if (!popup) buildPopup();
    popup.querySelector('.link-popup-title').textContent = name;
    const go = popup.querySelector('.link-popup-go');
    go.textContent = (label || 'Open') + ' ↗';
    go.href = href;
    popup.classList.add('is-open');
  };

  document.addEventListener('click', (e) => {
    const title = e.target.closest('.story-clip-name[data-link]');
    if (!title || !isMobile()) return;
    e.preventDefault();
    openPopup(title.textContent, title.dataset.linkLabel, title.dataset.link);
  });

  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePopup(); });
})();
