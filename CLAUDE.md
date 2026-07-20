# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Brandhaus Group marketing site — a premium, dark/editorial "creative business solutions" site for a company with three divisions: **Builder** (architectural visualisation), **Studio** (film/TV/streaming/games), and **Promotions** (brand marketing/integration). Six pages: `index.html` (home), `about.html`, `builder.html`, `studio.html`, `promotions.html`, `contact.html`.

Live at https://mehedi717.github.io/brandhaus-site/ via GitHub Pages, served directly from the `main` branch — there is no CI/build step, so anything committed to `main` is live within about a minute of pushing.

## Commands

There is no package.json, build tool, linter, or test suite — this is a hand-authored static site (plain HTML/CSS/JS, no framework, no bundler).

**Local preview** (do not use `python` — it's a Microsoft Store stub on this machine with no real interpreter):
```
npx -y http-server -p 8765 -c-1
```
Then browse to `http://localhost:8765/<page>.html`. For automated/browser-driven verification, `playwright-core` (no bundled browser) works with the system Edge via `chromium.launch({ channel: 'msedge' })`.

**Deploy**: commit and `git push origin main`. No build step runs; GitHub Pages serves the pushed files as-is.

## Architecture

**No templating — pages are fully self-contained HTML files.** There is no shared partial/include mechanism. The `<header class="site-nav">` and `<footer class="site-footer">` markup is duplicated verbatim across all six HTML files. When changing nav links, footer structure, or any other "shared" chrome, it must be edited in every page individually (grep across `*.html` first to find every occurrence).

**CSS is split into three files, loaded on every page in this order:**
- `css/style.css` — design tokens (`:root` custom properties: palette, type scale, spacing, easing), base/reset, and the bulk of component styles.
- `css/animations.css` — `@keyframes`, scroll-reveal animation states, and any component that is primarily animation-driven (e.g. the value-index ripple badges, shimmer-rule divider).
- `css/responsive.css` — breakpoint overrides only (`1280px` large laptops, `1080px` tablets, `620px` phones), desktop-first.

All design tokens (colors, fonts, spacing, easing curves) live in the `:root` block at the top of `style.css` — check there before hardcoding a value.

**Components are shared across pages, so a one-off tweak needs scoping.** Classes like `.grid-2`, `.case`, `.case-index`, `.cine-band`, `.section`, `.stats` are reused with different content on multiple pages. The established pattern in this codebase for a single-instance adjustment (e.g. shrinking one heading, or removing a border on one section) is to give that element an `id` or a modifier class (e.g. `.case--no-border`, `.section--tight-top`, `.section--tight-bottom`) and target that specifically, rather than editing the shared class and risking unintended changes elsewhere. Grep for the shared class across `*.html` before modifying its base CSS rule.

**Fonts are self-hosted**, not loaded from Google Fonts/CDN — `@font-face` declarations at the top of `style.css` point at `media/fonts/*.woff2`. Current type stack: `Cinzel` (`--font-hero`, hero `<h1>`s only), `Cormorant Garamond` (`--font-display`/`--font-text`, headings h2-h4 and body copy), `Inter` (`--font-body`, nav/buttons/labels/UI chrome).

**JS is five independent IIFEs**, each self-guarding with `querySelector` checks so they're safe to load on pages missing that markup:
- `main.js` — preloader, custom cursor (fine pointers only), page-transition veil on internal link clicks, marquee track duplication, contact form (front-end only — `submit` just shows a confirmation message and resets; **no backend/mail service is wired up**), footer year.
- `navigation.js` — sticky nav hide/show on scroll direction, mobile drawer toggle, marks the current page link with `aria-current`.
- `animations.js` — the scroll-reveal system: elements are opted in via `data-reveal`, `data-reveal-stagger` (stagger children), `data-reveal-media`, or `data-split` (splits heading text into per-line `<span>`s for a line-by-line rise-in) attributes, observed by a single `IntersectionObserver` that adds `.is-inview`. Also drives `data-count` number counters and `data-parallax` scroll-linked transforms.
- `gallery.js` — carousels (`.carousel > .carousel-track > .carousel-slide`, autoplay + dots) and the lightbox for images/videos (`data-lightbox-img` / `data-lightbox-video`).
- `video.js` — ambient background videos (`<video data-autoplay data-src="...">`) lazy-attach `src` and play/pause based on viewport intersection; all autoplaying video is muted, sound only exists in the lightbox player.

When adding an element that should animate in on scroll, add the appropriate `data-reveal*`/`data-split` attribute rather than writing new CSS transitions — the observer and CSS states already exist.
