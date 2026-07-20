(async function () {
  // ---- Helpers ----------------------------------------------------------
  const setText = (id, text) => { const el = document.getElementById(id); if (el && text != null) el.textContent = text; };
  const setLink = (id, href, textOverride) => {
    const el = document.getElementById(id);
    if (!el || !href) return;
    el.href = href;
    const txt = document.getElementById(id.replace('-link', '-text'));
    if (txt) txt.textContent = textOverride || href.replace(/^https?:\/\//, '');
  };
  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const reveal = () => { if (typeof window.observeReveals === 'function') window.observeReveals(); };

  const arrowRightSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`;

  // ---- Hero -------------------------------------------------------------
  const renderHero = (hero = {}) => {
    setText('hero-lead', hero.lead);
    setText('hero-kicker', hero.kicker);
    if (hero.photo) { const img = document.getElementById('hero-img'); if (img) img.src = hero.photo; }
  };

  // ---- Story: show, don't tell -----------------------------------------
  const renderStory = (story = {}) => {
    setText('story-eyebrow', story.eyebrow);
    setText('story-title', story.title);
    setText('story-lead', story.lead);
    const viewer = document.getElementById('story-viewer');
    const progress = document.getElementById('story-progress');
    if (!viewer) return;
    const clips = story.clips || [];

    viewer.innerHTML = clips.map((c, i) => {
      const link = c.link
        ? `<a class="built-btn" href="${c.link}" target="_blank" rel="noopener">${esc(c.linkLabel || 'Open')} ${arrowRightSVG}</a>`
        : '';
      const features = (c.features || []).length
        ? `<ul class="story-clip-tags">${c.features.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>`
        : '';
      // Long project names (e.g. the Workday → Calendar converter) get a smaller
      // title so they don't dominate the clip.
      const nameClass = (c.title || '').length > 22 ? ' story-clip-name--sm' : '';
      // On mobile the link button is hidden; tapping the title opens a popup to
      // the same URL. These data-attrs feed that handler (see uiInteractions.js).
      const linkClass = c.link ? ' story-clip-name--link' : '';
      const linkAttrs = c.link
        ? ` data-link="${esc(c.link)}" data-link-label="${esc(c.linkLabel || 'Open')}"`
        : '';
      return `
      <div class="story-clip${i === 0 ? ' is-active' : ''}" data-index="${i}">
        <div class="story-clip-row">
          <div class="story-clip-media">
            ${c.video
              ? `<video src="${c.video}" muted loop playsinline preload="metadata" aria-hidden="true"></video>`
              : `<div class="story-clip-placeholder">Clip coming soon</div>`}
          </div>
          <div class="story-clip-info">
            <h3 class="story-clip-name${nameClass}${linkClass}"${linkAttrs}>${esc(c.title)}</h3>
            <p class="story-clip-caption">${esc(c.caption)}</p>
            ${features}
            ${link ? `<div class="story-clip-actions">${link}</div>` : ''}
          </div>
        </div>
      </div>`;
    }).join('');

    if (progress) {
      progress.innerHTML = clips.map((_, i) =>
        `<span class="story-dot${i === 0 ? ' is-active' : ''}"></span>`).join('');
    }

    // Hand the section off to the scroll controller in uiInteractions.js
    if (typeof window.initStoryScroll === 'function') window.initStoryScroll(clips.length);
  };

  // ---- Product pitches --------------------------------------------------
  const renderPitches = (pitches = {}) => {
    setText('pitches-eyebrow', pitches.eyebrow);
    setText('pitches-title', pitches.title);
    setText('pitches-lead', pitches.lead);

    // Featured pitches — embedded live demos. Each title and the demo device
    // itself link to the write-up (no separate "Learn more" button). A pitch is
    // shown as a tall phone (variant "phone") or a wide Chrome window
    // (variant "desktop"). `featured` may be a single object or an array.
    const fmount = document.getElementById('pitch-featured');
    const featured = Array.isArray(pitches.featured)
      ? pitches.featured
      : (pitches.featured ? [pitches.featured] : []);
    if (fmount) {
      fmount.innerHTML = featured.map((f) => {
        const iframe = f.embed
          ? `<iframe src="${f.embed}" title="${esc(f.name)} — interactive demo" loading="lazy" allow="autoplay" scrolling="no"></iframe>`
          : '';
        // Tint only the vendor's name (the part before the "·") in its brand
        // style; the product-concept half keeps the default title color. Google
        // gets per-letter spans so CSS can paint each letter like its logo.
        const [brandRaw, ...restParts] = f.name.split('·');
        const brandName = brandRaw.trim();
        const brand = brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const rest = restParts.length ? ` · ${restParts.join('·').trim()}` : '';
        const brandInner = brand === 'google'
          ? [...brandName].map((ch) => `<span>${esc(ch)}</span>`).join('')
          : esc(brandName);
        const label = `<span class="brand-name">${brandInner}</span>${esc(rest)}`;
        const title = `<h3 class="showcase-title showcase-title--${brand}">${f.writeup
          ? `<a href="${f.writeup}">${label}</a>`
          : label}</h3>`;
        const tagline = f.tagline ? `<p class="showcase-tagline">${esc(f.tagline)}</p>` : '';

        if (f.variant === 'desktop') {
          // The embed renders its own Chrome window (bar + URL); this box just
          // sizes, clips and shadows it — same idea as the phone bezel below.
          const device = f.writeup
            ? `<a class="browser-embed browser-embed-link" href="${f.writeup}" aria-label="${esc(f.name)} — read the write-up">${iframe}</a>`
            : `<div class="browser-embed">${iframe}</div>`;
          return `<div class="showcase showcase-desktop reveal">${title}${tagline}${device}</div>`;
        }

        // Phone variant — the iframe renders the device bezel itself.
        const device = f.writeup
          ? `<a class="phone-embed phone-embed-link" href="${f.writeup}" aria-label="${esc(f.name)} — read the write-up">${iframe}</a>`
          : `<div class="phone-embed">${iframe}</div>`;
        return `<div class="showcase showcase-phone reveal">${title}${tagline}${device}</div>`;
      }).join('');
      // These embeds only exist now, so hand them to the off-screen parker.
      if (typeof window.watchDemoFrames === 'function') window.watchDemoFrames();
    }

    const mount = document.getElementById('pitches-grid');
    if (!mount) return;
    const items = pitches.items || [];
    mount.innerHTML = items.map((p) => {
      const actions = [];
      if (p.writeup) actions.push(`<a class="pitch-btn" href="${p.writeup}">Read the write-up ${arrowRightSVG}</a>`);
      if (p.demo) actions.push(`<a class="pitch-link" href="${p.demo}" target="_blank" rel="noopener">Try the live demo ↗</a>`);
      const actionsHtml = actions.length ? `<div class="pitch-actions">${actions.join('')}</div>` : '';
      const inner = `
        <span class="pitch-status">${esc(p.status || '')}</span>
        <h3 class="pitch-name">${esc(p.name)}</h3>
        <p class="pitch-blurb">${esc(p.blurb || '')}</p>
        ${actionsHtml}`;
      // Whole-card link only when there are no inner action buttons (avoids nested links).
      if (p.link && !actions.length) {
        return `<a class="pitch-card reveal" href="${p.link}" target="_blank" rel="noopener">${inner}</a>`;
      }
      return `<article class="pitch-card${actions.length ? '' : ' is-soon'} reveal">${inner}</article>`;
    }).join('');
    reveal();
  };

  // ---- Personal: polaroids ----------------------------------------------
  const renderPersonal = (personal = {}) => {
    setText('life-eyebrow', personal.eyebrow);
    setText('life-title', personal.title);
    setText('life-lead', personal.lead);
    const mount = document.getElementById('polaroids');
    if (!mount) return;
    const tilts  = [-11, 7, -5, 9, -8, 6];      // staggered angles
    const shifts = [18, -14, 20, -8, 14, -12];  // staggered vertical offsets (px)
    mount.innerHTML = (personal.polaroids || []).map((p, i) => `
      <figure class="polaroid" style="--tilt: ${tilts[i % tilts.length]}deg; --dy: ${shifts[i % shifts.length]}px;">
        <div class="polaroid-photo"><img src="${p.img}" alt="${esc(p.caption)}" loading="lazy"></div>
        <figcaption class="polaroid-caption">${esc(p.caption)}</figcaption>
      </figure>`).join('');
    reveal();
  };

  // ---- Fetch + boot -----------------------------------------------------
  let data;
  try {
    const res = await fetch('resume.json', { cache: 'no-cache' });
    data = await res.json();
    window.__resumeData = data;
  } catch (e) {
    console.error('Failed to load resume.json', e);
    return;
  }

  setText('email-text', data.email);
  setText('location-text', data.location);
  setLink('linkedin-link', data.linkedin);
  setLink('github-link', data.github);

  renderHero(data.hero);
  renderStory(data.story);
  renderPitches(data.pitches);
  renderPersonal(data.personal);

  reveal();

  // Deep-link landing — guarantee that any navigation to a hash (e.g. #pitches)
  // lands squarely on the section, every time. This is needed because the story
  // section is expanded to a tall scroll height by JS *after* the browser's hash
  // jump, and images above the target (hero, "things I've built") load later
  // still — both push the target down and would otherwise leave us parked above
  // it. scroll-padding-top keeps the landing clear of the sticky nav.
  const landOnHash = () => {
    if (!window.location.hash) return;
    const target = document.getElementById(window.location.hash.slice(1));
    if (!target) return;
    const land = () => target.scrollIntoView({ behavior: 'auto', block: 'start' });

    // The deferred correction below can fire seconds after the hash navigation
    // (the page has late-loading demo iframes + story videos). If the visitor has
    // started scrolling on their own by then, snapping them back to the target is
    // the "random autoscroll" bug. So we let any genuine user input cancel it.
    // Note: we watch input events, NOT 'scroll' — scrollIntoView fires 'scroll'.
    let cancelled = false;
    const inputs = ['wheel', 'touchstart', 'keydown', 'pointerdown'];
    const stopWatching = () => inputs.forEach((e) => window.removeEventListener(e, cancel));
    function cancel() { cancelled = true; stopWatching(); }

    // Two frames lets the just-applied layout settle before we measure.
    requestAnimationFrame(() => requestAnimationFrame(() => { if (!cancelled) land(); }));

    // …and once more after every image/subresource has loaded, in case a late
    // load shifts the target — but only if the visitor hasn't taken over scrolling.
    if (document.readyState !== 'complete') {
      inputs.forEach((e) => window.addEventListener(e, cancel, { passive: true }));
      window.addEventListener('load', () => {
        stopWatching();
        if (!cancelled) requestAnimationFrame(land);
      }, { once: true });
    }
  };

  landOnHash();                                   // initial / cross-page load
  window.addEventListener('hashchange', landOnHash); // back/forward, re-clicks
})();
