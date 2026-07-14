/* ==========================================================================
   BRANDHAUS GROUP — animations.js
   Scroll reveals, split-text lines, animated counters, parallax,
   magnetic buttons
   ========================================================================== */

(() => {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ------------------------------------------------------------------
       Split headings into line-wrapped spans for the rise-in effect.
       Splitting by word keeps natural wrapping; lines are grouped after
       layout so each visual line animates as one unit.
       ------------------------------------------------------------------ */
    const splitLines = (el) => {
      const text = el.textContent.trim();
      const words = text.split(/\s+/);
      el.textContent = '';

      const probe = words.map((word) => {
        const span = document.createElement('span');
        span.textContent = word + ' ';
        span.style.display = 'inline-block';
        el.appendChild(span);
        return span;
      });

      // Group words by their rendered top offset => visual lines.
      const lines = [];
      let currentTop = null;
      probe.forEach((span) => {
        const top = span.offsetTop;
        if (top !== currentTop) {
          lines.push([]);
          currentTop = top;
        }
        lines[lines.length - 1].push(span.textContent);
      });

      el.textContent = '';
      lines.forEach((lineWords) => {
        const line = document.createElement('span');
        line.className = 'split-line';
        const inner = document.createElement('span');
        inner.textContent = lineWords.join('');
        line.appendChild(inner);
        el.appendChild(line);
      });
    };

    if (!reduced) {
      document.querySelectorAll('[data-split]').forEach(splitLines);
    }

    /* ------------------------------------------------------------------
       Reveal-on-scroll observer
       ------------------------------------------------------------------ */
    const revealTargets = document.querySelectorAll(
      '[data-reveal], [data-reveal-stagger], [data-reveal-media], [data-split]'
    );

    if (revealTargets.length) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-inview');
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.16, rootMargin: '0px 0px -6% 0px' }
      );

      revealTargets.forEach((el) => io.observe(el));
    }

    /* ------------------------------------------------------------------
       Animated counters — [data-count="150"] [data-count-suffix="+"]
       ------------------------------------------------------------------ */
    const counters = document.querySelectorAll('[data-count]');

    if (counters.length) {
      const easeOut = (t) => 1 - Math.pow(1 - t, 4);

      const run = (el) => {
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.countSuffix || '';
        const duration = 2000;
        const start = performance.now();

        const tick = (now) => {
          const p = Math.min((now - start) / duration, 1);
          const value = Math.round(target * easeOut(p));
          el.textContent = value + suffix;
          if (p < 1) requestAnimationFrame(tick);
        };

        if (reduced) {
          el.textContent = target + suffix;
        } else {
          requestAnimationFrame(tick);
        }
      };

      const cio = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              run(entry.target);
              cio.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 }
      );

      counters.forEach((el) => cio.observe(el));
    }

    /* ------------------------------------------------------------------
       Parallax — [data-parallax="0.18"] drifts against scroll
       ------------------------------------------------------------------ */
    const parallaxEls = [...document.querySelectorAll('[data-parallax]')];

    if (parallaxEls.length && !reduced) {
      let ticking = false;

      const update = () => {
        const vh = window.innerHeight;
        parallaxEls.forEach((el) => {
          const speed = parseFloat(el.dataset.parallax) || 0.15;
          const rect = el.getBoundingClientRect();
          if (rect.bottom < 0 || rect.top > vh) return;
          const progress = (rect.top + rect.height / 2 - vh / 2) / vh;
          el.style.transform = `translateY(${(-progress * speed * 100).toFixed(2)}px)`;
        });
        ticking = false;
      };

      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(update);
          ticking = true;
        }
      }, { passive: true });

      update();
    }

    /* ------------------------------------------------------------------
       Magnetic buttons — subtle pull toward the pointer
       ------------------------------------------------------------------ */
    if (!reduced && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      document.querySelectorAll('.btn--gold, .btn--ghost, .carousel-btn, .row-nav').forEach((btn) => {
        const strength = 0.32;

        btn.addEventListener('mousemove', (e) => {
          const rect = btn.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          btn.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
        });

        btn.addEventListener('mouseleave', () => {
          btn.style.transform = '';
        });
      });
    }
  });
})();
