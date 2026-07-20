/* =========================================================================
   Demo embeds — park the ones that are off screen
   The pitch demos are live cross-origin apps that run a scripted auto-demo:
   every so often the script focuses an input inside the iframe. When a
   cross-origin iframe takes focus, the browser scrolls it into view — which
   yanks the visitor down the page, seconds or minutes after they landed,
   with no apparent trigger. An iframe that isn't in the document can't do
   that, so we detach any demo the visitor has scrolled well away from and
   re-attach it when they come back. (It also stops three React apps from
   animating behind the visitor's back.)
   ========================================================================= */
(() => {
  const BOXES = '.phone-embed, .browser-embed, .cs-demo-frame';

  // A little slack past the fold, so nudging a demo just out of view doesn't
  // tear it down — but not so much that a demo a screen away is still running.
  // (A demo only barely off screen can still take focus; the scroll that
  // causes is a few hundred px, and the guard in uiInteractions.js absorbs it.)
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const box = entry.target;
      if (entry.isIntersecting) {
        if (!box.querySelector('iframe')) {
          box.insertBefore(box.__demoFrame.cloneNode(false), box.firstChild);
        }
      } else {
        const frame = box.querySelector('iframe');
        if (frame) frame.remove();
      }
    });
  }, { rootMargin: '25% 0px' });

  // We re-insert a pristine clone rather than blanking and restoring `src`:
  // reassigning an iframe's src pushes an entry onto session history and
  // would break the back button.
  window.watchDemoFrames = function () {
    document.querySelectorAll(BOXES).forEach((box) => {
      if (box.__demoFrame) return;
      const frame = box.querySelector('iframe');
      if (!frame) return;
      box.__demoFrame = frame.cloneNode(false);
      io.observe(box);
    });
  };

  window.watchDemoFrames();
  document.addEventListener('DOMContentLoaded', window.watchDemoFrames);
})();
