/* ==========================================================================
   BRANDHAUS GROUP — main.js
   Bootstrapping: preloader, custom cursor, page transitions, misc chrome
   ========================================================================== */

(() => {
  'use strict';

  /* Shared namespace for cross-module helpers */
  window.BH = window.BH || {};

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.BH.prefersReducedMotion = prefersReducedMotion;

  /* ------------------------------------------------------------------
     Preloader — brand mark fades once the page is ready
     ------------------------------------------------------------------ */
  const initPreloader = () => {
    const preloader = document.querySelector('.preloader');
    if (!preloader) return;

    const done = () => {
      preloader.classList.add('is-done');
      // Remove from the tree once faded so it never traps clicks.
      setTimeout(() => preloader.remove(), 900);
    };

    if (document.readyState === 'complete') {
      done();
    } else {
      window.addEventListener('load', done, { once: true });
      // Safety net: never hold the page hostage on a slow video.
      setTimeout(done, 3200);
    }
  };

  /* ------------------------------------------------------------------
     Custom cursor — gold dot + trailing ring (fine pointers only)
     ------------------------------------------------------------------ */
  const initCursor = () => {
    if (prefersReducedMotion) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const dot = document.createElement('div');
    const ring = document.createElement('div');
    dot.className = 'cursor-dot';
    ring.className = 'cursor-ring';
    dot.setAttribute('aria-hidden', 'true');
    ring.setAttribute('aria-hidden', 'true');
    document.body.append(dot, ring);

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    });

    const trail = () => {
      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;
      ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
      requestAnimationFrame(trail);
    };
    requestAnimationFrame(trail);

    const interactive = 'a, button, [role="button"], input, select, textarea, .poster-card, .masonry-item';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(interactive)) ring.classList.add('is-active');
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(interactive)) ring.classList.remove('is-active');
    });
  };

  /* ------------------------------------------------------------------
     Page transition veil — wipes up before internal navigation
     ------------------------------------------------------------------ */
  const initPageTransitions = () => {
    if (prefersReducedMotion) return;

    const veil = document.createElement('div');
    veil.className = 'page-veil';
    veil.setAttribute('aria-hidden', 'true');
    document.body.appendChild(veil);

    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (!link) return;

      const href = link.getAttribute('href');
      const isInternalPage =
        href &&
        !href.startsWith('#') &&
        !href.startsWith('http') &&
        !href.startsWith('mailto:') &&
        !href.startsWith('tel:') &&
        !link.hasAttribute('target') &&
        (href.endsWith('.html') || !href.includes('.'));

      if (!isInternalPage || e.metaKey || e.ctrlKey || e.shiftKey) return;

      e.preventDefault();
      veil.classList.add('is-covering');
      setTimeout(() => {
        window.location.href = href;
      }, 520);
    });

    // Reset the veil when returning via back/forward cache.
    window.addEventListener('pageshow', (e) => {
      if (e.persisted) veil.classList.remove('is-covering');
    });
  };

  /* ------------------------------------------------------------------
     Marquee — duplicate track content so the loop is seamless
     ------------------------------------------------------------------ */
  const initMarquee = () => {
    document.querySelectorAll('.marquee-track').forEach((track) => {
      track.innerHTML += track.innerHTML;
    });
  };

  /* ------------------------------------------------------------------
     Enquiry form — front-end validation + confirmation.
     Point the form's `action` at a mail endpoint to go live.
     ------------------------------------------------------------------ */
  const initForm = () => {
    const form = document.querySelector('form.form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const status = form.querySelector('.form-status');

      if (!form.checkValidity()) {
        if (status) status.textContent = 'Please complete the highlighted fields before sending.';
        form.reportValidity();
        return;
      }

      if (status) {
        status.textContent =
          'Thank you — your enquiry is ready to send. (Connect this form to your mail service to go live.)';
      }
      form.reset();
    });
  };

  /* ------------------------------------------------------------------
     Footer year
     ------------------------------------------------------------------ */
  const initYear = () => {
    document.querySelectorAll('[data-year]').forEach((el) => {
      el.textContent = new Date().getFullYear();
    });
  };

  document.addEventListener('DOMContentLoaded', () => {
    initPreloader();
    initCursor();
    initPageTransitions();
    initMarquee();
    initForm();
    initYear();
  });
})();
