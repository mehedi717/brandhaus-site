/* ==========================================================================
   BRANDHAUS GROUP — gallery.js
   Carousels, Netflix-style poster rows, unified media lightbox
   ========================================================================== */

(() => {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    /* ------------------------------------------------------------------
       Carousel — .carousel > .carousel-track > .carousel-slide(s)
       Autoplays every 5.5s, pauses on hover/focus, keyboard friendly.
       ------------------------------------------------------------------ */
    document.querySelectorAll('.carousel').forEach((carousel) => {
      const track = carousel.querySelector('.carousel-track');
      const slides = [...carousel.querySelectorAll('.carousel-slide')];
      if (!track || slides.length < 2) return;

      let index = 0;
      let timer = null;

      // Dots
      const dots = document.createElement('div');
      dots.className = 'carousel-dots';
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', `Go to slide ${i + 1} of ${slides.length}`);
        dot.addEventListener('click', () => goTo(i, true));
        dots.appendChild(dot);
      });
      carousel.appendChild(dots);

      const syncDots = () => {
        [...dots.children].forEach((d, i) => {
          d.setAttribute('aria-current', String(i === index));
        });
      };

      const goTo = (i, user = false) => {
        index = (i + slides.length) % slides.length;
        track.style.transform = `translateX(-${index * 100}%)`;
        syncDots();

        // Only let the active slide's video play.
        slides.forEach((slide, s) => {
          const video = slide.querySelector('video');
          if (!video) return;
          if (s === index) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });

        if (user) restart();
      };

      const restart = () => {
        clearInterval(timer);
        timer = setInterval(() => goTo(index + 1), 5500);
      };

      carousel.querySelector('.carousel-btn--prev')?.addEventListener('click', () => goTo(index - 1, true));
      carousel.querySelector('.carousel-btn--next')?.addEventListener('click', () => goTo(index + 1, true));

      carousel.addEventListener('mouseenter', () => clearInterval(timer));
      carousel.addEventListener('mouseleave', restart);
      carousel.addEventListener('focusin', () => clearInterval(timer));
      carousel.addEventListener('focusout', restart);

      carousel.setAttribute('tabindex', '0');
      carousel.setAttribute('role', 'region');
      carousel.setAttribute('aria-roledescription', 'carousel');
      carousel.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') goTo(index - 1, true);
        if (e.key === 'ArrowRight') goTo(index + 1, true);
      });

      goTo(0);
      restart();
    });

    /* ------------------------------------------------------------------
       Poster rows — scroll a row by ~90% of its width via arrows
       ------------------------------------------------------------------ */
    document.querySelectorAll('.poster-row-wrap').forEach((wrap) => {
      const row = wrap.querySelector('.poster-row');
      if (!row) return;

      wrap.querySelector('.row-nav--prev')?.addEventListener('click', () => {
        row.scrollBy({ left: -row.clientWidth * 0.9, behavior: 'smooth' });
      });

      wrap.querySelector('.row-nav--next')?.addEventListener('click', () => {
        row.scrollBy({ left: row.clientWidth * 0.9, behavior: 'smooth' });
      });
    });

    /* ------------------------------------------------------------------
       Lightbox — one shared overlay for images and videos.
       Triggers: [data-lightbox-img="src"] or [data-lightbox-video="src"]
       Optional: [data-lightbox-title], [data-lightbox-poster],
                 [data-lightbox-muted] (for loops delivered without sound)
       ------------------------------------------------------------------ */
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', 'Media viewer');
    lightbox.innerHTML = `
      <button type="button" class="lightbox-close" aria-label="Close viewer">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path d="M1 1l16 16M17 1L1 17" stroke="currentColor" stroke-width="1.5"/>
        </svg>
      </button>
      <div class="lightbox-stage"></div>
    `;
    document.body.appendChild(lightbox);

    const stage = lightbox.querySelector('.lightbox-stage');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    let lastFocus = null;

    const close = () => {
      lightbox.classList.remove('is-open');
      stage.innerHTML = '';
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    };

    const open = (build) => {
      lastFocus = document.activeElement;
      stage.innerHTML = '';
      build(stage);
      lightbox.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    };

    closeBtn.addEventListener('click', close);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target === stage) close();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('is-open')) close();
    });

    document.addEventListener('click', (e) => {
      const imgTrigger = e.target.closest('[data-lightbox-img]');
      const vidTrigger = e.target.closest('[data-lightbox-video]');
      if (!imgTrigger && !vidTrigger) return;

      e.preventDefault();

      if (imgTrigger) {
        open((mount) => {
          const img = document.createElement('img');
          img.src = imgTrigger.dataset.lightboxImg;
          img.alt = imgTrigger.dataset.lightboxTitle || '';
          mount.appendChild(img);
          addCaption(mount, imgTrigger.dataset.lightboxTitle);
        });
      } else {
        open((mount) => {
          const video = document.createElement('video');
          video.src = vidTrigger.dataset.lightboxVideo;
          video.controls = true;
          video.autoplay = true;
          video.playsInline = true;
          video.muted = vidTrigger.hasAttribute('data-lightbox-muted');
          if (vidTrigger.dataset.lightboxPoster) {
            video.poster = vidTrigger.dataset.lightboxPoster;
          }
          mount.appendChild(video);
          addCaption(mount, vidTrigger.dataset.lightboxTitle);
        });
      }
    });

    const addCaption = (mount, title) => {
      if (!title) return;
      const cap = document.createElement('p');
      cap.className = 'lightbox-caption';
      cap.textContent = title;
      mount.appendChild(cap);
    };
  });
})();
