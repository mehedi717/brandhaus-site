/* ==========================================================================
   BRANDHAUS GROUP — video.js
   Performance-first video behaviour:
   · lazy-loaded, muted, in-view autoplay for ambient loops
   · hover / focus motion-poster playback (Netflix-style cards)
   All autoplaying video is muted; sound only exists in the lightbox player.
   ========================================================================== */

(() => {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    /* ------------------------------------------------------------------
       Ambient loops — <video data-autoplay data-src="...">
       The src attaches just before the video scrolls into view, and
       playback pauses whenever it leaves the viewport.
       ------------------------------------------------------------------ */
    const ambient = document.querySelectorAll('video[data-autoplay]');

    if (ambient.length) {
      const attach = (video) => {
        if (video.dataset.src && !video.src) {
          video.src = video.dataset.src;
          video.removeAttribute('data-src');
        }
      };

      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const video = entry.target;
            if (entry.isIntersecting) {
              attach(video);
              video.play().catch(() => {});
            } else {
              video.pause();
            }
          });
        },
        { rootMargin: '260px 0px' }
      );

      ambient.forEach((video) => {
        // Enforce silent autoplay everywhere.
        video.muted = true;
        video.defaultMuted = true;
        video.loop = true;
        video.playsInline = true;
        video.setAttribute('playsinline', '');
        video.preload = 'none';
        io.observe(video);
      });
    }

    /* ------------------------------------------------------------------
       Motion posters — .poster-card[data-motion="video.mp4"]
       A still poster sits on top; on hover/focus the loop fades in.
       The video element is created on first interaction only.
       ------------------------------------------------------------------ */
    const cards = document.querySelectorAll('[data-motion]');

    cards.forEach((card) => {
      let video = null;
      let hideTimer = null;

      const ensureVideo = () => {
        if (video) return video;
        video = document.createElement('video');
        video.src = card.dataset.motion;
        video.muted = true;
        video.defaultMuted = true;
        video.loop = true;
        video.playsInline = true;
        video.setAttribute('playsinline', '');
        video.preload = 'auto';
        video.setAttribute('aria-hidden', 'true');
        video.tabIndex = -1;
        card.prepend(video);
        return video;
      };

      const play = () => {
        clearTimeout(hideTimer);
        const v = ensureVideo();
        const started = () => card.classList.add('is-playing');
        if (v.readyState >= 2) {
          v.play().then(started).catch(() => {});
        } else {
          v.addEventListener('canplay', () => {
            if (card.matches(':hover') || card.contains(document.activeElement)) {
              v.play().then(started).catch(() => {});
            }
          }, { once: true });
          v.load();
        }
      };

      const stop = () => {
        card.classList.remove('is-playing');
        // Let the crossfade finish before pausing.
        hideTimer = setTimeout(() => {
          if (video) {
            video.pause();
            video.currentTime = 0;
          }
        }, 620);
      };

      card.addEventListener('mouseenter', play);
      card.addEventListener('mouseleave', stop);
      card.addEventListener('focusin', play);
      card.addEventListener('focusout', (e) => {
        if (!card.contains(e.relatedTarget)) stop();
      });

      // Touch: first tap previews the motion poster, second follows the link.
      card.addEventListener('touchstart', () => {
        if (!card.classList.contains('is-playing')) play();
      }, { passive: true });
    });

    /* ------------------------------------------------------------------
       Hero video — begins muted playback as soon as it can
       ------------------------------------------------------------------ */
    document.querySelectorAll('video[data-hero]').forEach((video) => {
      video.muted = true;
      video.defaultMuted = true;

      // Some hero clips open with a studio vanity card baked into the
      // footage; data-hero-start skips past it and, since native `loop`
      // always restarts at 0, we take over looping to keep skipping it.
      const start = parseFloat(video.dataset.heroStart || '0');
      if (start > 0) {
        video.loop = false;
        video.addEventListener('loadedmetadata', () => { video.currentTime = start; }, { once: true });
        video.addEventListener('ended', () => {
          video.currentTime = start;
          video.play().catch(() => {});
        });
      }

      video.play().catch(() => {
        // Autoplay blocked: retry on first interaction.
        const kick = () => {
          video.play().catch(() => {});
          document.removeEventListener('pointerdown', kick);
        };
        document.addEventListener('pointerdown', kick);
      });
    });
  });
})();
