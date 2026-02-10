if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

const tabs = Array.from(document.querySelectorAll('.tab'));
const tabContents = Array.from(document.querySelectorAll('.tab-content'));

const hero = document.getElementById('hero');
const heroTitle = document.getElementById('hero-title');
const heroSubtitle = document.getElementById('hero-subtitle');
const heroHint = document.getElementById('hero-hint');
const profile = document.querySelector('.profile');
const mainContent = document.querySelector('.main-content');
const topbar = document.getElementById('topbar');

const getTopbarOffset = () => {
  const styles = getComputedStyle(document.documentElement);
  const cssValue = styles.getPropertyValue('--topbar-height').trim();
  const cssNumber = parseFloat(cssValue);
  if (!Number.isNaN(cssNumber)) {
    return cssNumber + 20;
  }
  return topbar ? topbar.offsetHeight + 20 : 84;
};

const activateTab = (tab) => {
  tabs.forEach((t) => t.classList.remove('active'));
  tabContents.forEach((c) => c.classList.remove('active'));
  tab.classList.add('active');
  const target = document.getElementById(tab.dataset.tab);
  if (target) {
    target.classList.add('active');
    const offset = getTopbarOffset();
    window.requestAnimationFrame(() => {
      const top = Math.max(target.getBoundingClientRect().top + window.scrollY - offset, 0);
      window.scrollTo({ top, behavior: 'smooth' });
    });
  }
};

tabs.forEach((tab) => {
  tab.addEventListener('click', () => activateTab(tab));
});

window.copyEmail = function () {
  const email = (window.__resumeData && window.__resumeData.email) || 'ogle.wyatt28@gmail.com';
  navigator.clipboard.writeText(email).then(() => {
    const popup = document.getElementById('copy-popup');
    if (!popup) return;
    popup.classList.add('show');
    setTimeout(() => popup.classList.remove('show'), 1200);
  });
};

let hintTimer = null;
let heroHeight = hero ? hero.offsetHeight : window.innerHeight;
let ticking = false;
let heroScrollLocked = false;
let heroLockScrollY = 0;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const updateHeroText = () => {
  if (!hero) return;
  const rect = hero.getBoundingClientRect();
  const heroOut = rect.bottom < 0;
  if (heroTitle) {
    heroTitle.textContent = heroOut ? 'Hello again' : 'Hello';
  }
  if (heroSubtitle) {
    heroSubtitle.textContent = heroOut ? 'Back so soon?' : "I'm Wyatt";
  }
  if (heroHint && heroOut) {
    heroHint.classList.remove('show');
  }
};

const updateScrollDrivenUI = () => {
  const scrollY = window.scrollY;
  heroHeight = hero ? hero.offsetHeight : heroHeight;
  const progress = clamp(scrollY / heroHeight, 0, 1);
  const delayedProgress = clamp((progress - 0.08) / 0.92, 0, 1);

  if (!heroScrollLocked && progress >= 1) {
    heroScrollLocked = true;
    heroLockScrollY = heroHeight;
  }

  if (heroScrollLocked && scrollY < heroLockScrollY) {
    window.scrollTo(0, heroLockScrollY);
  }

  if (profile) {
    if (heroScrollLocked) {
      profile.style.transform = 'translateX(0%)';
      profile.style.opacity = '1';
    } else {
      const sidebarShift = -120 + (120 * progress);
      profile.style.transform = `translateX(${sidebarShift}%)`;
      profile.style.opacity = progress.toFixed(3);
    }
  }

  if (mainContent) {
    const contentShift = 48 - (48 * delayedProgress);
    mainContent.style.transform = `translateX(${contentShift}px)`;
    mainContent.style.opacity = delayedProgress.toFixed(3);
  }

  if (topbar) {
    const topbarShift = -140 + (140 * progress);
    topbar.style.transform = `translateY(${topbarShift}%)`;
    topbar.style.opacity = progress.toFixed(3);
    topbar.style.pointerEvents = progress > 0.1 ? 'auto' : 'none';
  }

  document.body.classList.toggle('scrolled', progress >= 1);
  updateHeroText();
};

const scheduleHint = () => {
  if (!heroHint || !hero) return;
  clearTimeout(hintTimer);
  heroHint.classList.remove('show');
  const onHero = window.scrollY < heroHeight;
  if (!onHero) return;
  hintTimer = setTimeout(() => {
    if (window.scrollY < heroHeight) {
      heroHint.classList.add('show');
    }
  }, 5000);
};

const onScroll = () => {
  if (ticking) return;
  ticking = true;
  window.requestAnimationFrame(() => {
    updateScrollDrivenUI();
    scheduleHint();
    ticking = false;
  });
};

window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', () => {
  heroHeight = hero ? hero.offsetHeight : window.innerHeight;
  updateScrollDrivenUI();
});

updateScrollDrivenUI();
scheduleHint();
