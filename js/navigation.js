/* ==========================================================================
   BRANDHAUS GROUP — navigation.js
   Sticky nav behaviour, hide-on-scroll, mobile drawer, current-page marker
   ========================================================================== */

(() => {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('.site-nav');
    if (!nav) return;

    /* ------------------------------------------------------------------
       Scroll state: compact + blurred after the fold, hide when
       scrolling down deep in the page, reveal when scrolling up.
       ------------------------------------------------------------------ */
    let lastY = window.scrollY;
    let ticking = false;

    const onScroll = () => {
      const y = window.scrollY;

      nav.classList.toggle('is-scrolled', y > 40);

      const scrollingDown = y > lastY;
      const pastHero = y > window.innerHeight * 0.9;
      const drawerOpen = document.querySelector('.nav-links.is-open');
      nav.classList.toggle('is-hidden', scrollingDown && pastHero && !drawerOpen);

      lastY = y;
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(onScroll);
        ticking = true;
      }
    }, { passive: true });

    onScroll();

    /* ------------------------------------------------------------------
       Mobile drawer
       ------------------------------------------------------------------ */
    const toggle = nav.querySelector('.nav-toggle');
    const links = nav.querySelector('.nav-links');

    if (toggle && links) {
      const setOpen = (open) => {
        toggle.setAttribute('aria-expanded', String(open));
        links.classList.toggle('is-open', open);
        document.body.classList.toggle('nav-locked', open);
      };

      toggle.addEventListener('click', () => {
        setOpen(toggle.getAttribute('aria-expanded') !== 'true');
      });

      links.addEventListener('click', (e) => {
        if (e.target.closest('a')) setOpen(false);
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && links.classList.contains('is-open')) {
          setOpen(false);
          toggle.focus();
        }
      });
    }

    /* ------------------------------------------------------------------
       Mark the current page in the nav for styling + a11y
       ------------------------------------------------------------------ */
    const page = location.pathname.split('/').pop() || 'index.html';
    nav.querySelectorAll('.nav-links a[href]').forEach((a) => {
      if (a.getAttribute('href') === page) {
        a.setAttribute('aria-current', 'page');
      }
    });
  });
})();
