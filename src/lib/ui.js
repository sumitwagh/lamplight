// App-wide experience layer: smooth scroll, lamp cursor, preloader and the ⌘K "Ask Folio" palette.
import Lenis from 'lenis';
import { BOOKS, AUTHORS, MOODS } from '../data/books.js';

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = () => window.matchMedia('(pointer: fine)').matches;

/* ---------------------------------------------------------------- smooth scroll */
export let lenis = null;
const scrollSubs = new Set();
export function onScroll(fn) { scrollSubs.add(fn); return () => scrollSubs.delete(fn); }

export function startScroll() {
  if (!reducedMotion()) {
    lenis = new Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 4), smoothWheel: true });
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    lenis.on('scroll', () => scrollSubs.forEach((f) => f(window.scrollY)));
  } else {
    window.addEventListener('scroll', () => scrollSubs.forEach((f) => f(window.scrollY)), { passive: true });
  }
}

export function resetScroll() {
  if (lenis) { lenis.scrollTo(0, { immediate: true, force: true }); lenis.resize(); } else window.scrollTo(0, 0);
}

export function scrollToEl(el) {
  if (lenis) lenis.scrollTo(el, { offset: -80 }); else el.scrollIntoView({ behavior: 'smooth' });
}

/** Progress 0…1 of a tall "pinned" section (sticky child inside). */
export function pinProgress(el) {
  const r = el.getBoundingClientRect();
  const span = r.height - window.innerHeight;
  return span <= 0 ? 0 : Math.min(1, Math.max(0, -r.top / span));
}

/* ---------------------------------------------------------------- reveal on view */
let io;
export function revealAll(root = document) {
  io ||= new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -12% 0px' });
  root.querySelectorAll('[data-reveal]:not(.is-in),[data-split]:not(.is-in)').forEach((el) => io.observe(el));
}

/** Split text of [data-split] into words for staggered reveals. */
export function splitWords(root = document) {
  root.querySelectorAll('[data-split]:not([data-js-frozen])').forEach((el) => {
    el.setAttribute('data-js-frozen', '');
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.nodeValue.split(/(\s+)/).forEach((w) => {
            if (!w) return;
            if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(w)); return; }
            const o = document.createElement('span'); o.className = 'w';
            const i = document.createElement('span'); i.className = 'wi'; i.textContent = w;
            o.appendChild(i); frag.appendChild(o);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
    el.querySelectorAll('.wi').forEach((w, i) => w.style.setProperty('--i', i));
  });
}

/* ---------------------------------------------------------------- lamp cursor */
export function startCursor() {
  if (!fine() || reducedMotion()) return;
  const glow = document.createElement('div'); glow.className = 'lamp-glow';
  const dot = document.createElement('div'); dot.className = 'lamp-dot';
  const label = document.createElement('span'); dot.appendChild(label);
  document.body.append(glow, dot);
  let x = innerWidth / 2, y = innerHeight / 2, gx = x, gy = y, dx = x, dy = y;
  addEventListener('pointermove', (e) => { x = e.clientX; y = e.clientY; }, { passive: true });
  document.addEventListener('pointerover', (e) => {
    const t = e.target.closest?.('a,button,[data-cursor],input,textarea,[role="tab"]');
    const txt = t?.closest('[data-cursor]')?.getAttribute('data-cursor') || '';
    dot.classList.toggle('hot', !!t && !t.matches('input,textarea'));
    dot.classList.toggle('lbl', !!txt);
    label.textContent = txt;
  });
  document.addEventListener('pointerdown', () => dot.classList.add('down'));
  document.addEventListener('pointerup', () => dot.classList.remove('down'));
  const loop = () => {
    gx += (x - gx) * 0.08; gy += (y - gy) * 0.08; dx += (x - dx) * 0.35; dy += (y - dy) * 0.35;
    glow.style.transform = `translate3d(${gx}px,${gy}px,0)`;
    dot.style.transform = `translate3d(${dx}px,${dy}px,0)`;
    requestAnimationFrame(loop);
  };
  loop();
  document.documentElement.classList.add('has-lamp');
}

/* ---------------------------------------------------------------- preloader */
export function preloader() {
  const el = document.createElement('div');
  el.className = 'preload';
  el.setAttribute('role', 'status');
  el.innerHTML = `<div class="pl-in"><div class="pl-k">FOLIO · THE READING ROOM</div><div class="pl-n"><span>p.</span> <b>000</b></div><div class="pl-t">Turning on the lamp…</div><div class="pl-bar"><i></i></div></div>`;
  document.body.appendChild(el);
  const n = el.querySelector('b'), bar = el.querySelector('i');
  const dur = reducedMotion() ? 200 : 1500;
  const fonts = document.fonts?.ready || Promise.resolve();
  const t0 = performance.now();
  return new Promise((done) => {
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      n.textContent = String(Math.round(e * 384)).padStart(3, '0');
      bar.style.transform = `scaleX(${e})`;
      if (p < 1) requestAnimationFrame(step);
      else fonts.then(() => { el.classList.add('out'); done(); setTimeout(() => el.remove(), 1100); });
    };
    requestAnimationFrame(step);
  });
}

/* ---------------------------------------------------------------- ⌘K palette */
const ANSWERS = [
  [/sad|cry|grief|loss/i, 'A good cry', 'You want something that hurts in the right way. These are the books readers re-read for the ending.'],
  [/fast|thrill|page|tonight|chapter/i, 'One more chapter', 'Short chapters, hard cliffhangers. Readers finish these in two nights.'],
  [/cosy|cozy|warm|rain|monsoon|comfort/i, 'Warm', 'Soft, rainy and kind. Good with tea and 20 minutes before bed.'],
  [/weird|strange|mind|map|future|sci/i, 'Mind-bending', 'Slow reveals and strange cities — the kind of book you draw diagrams about.'],
];

export function startPalette(go) {
  const wrap = document.createElement('div');
  wrap.className = 'pal';
  wrap.hidden = true;
  wrap.innerHTML = `<div class="pal-scrim" data-close></div>
  <div class="pal-box" role="dialog" aria-modal="true" aria-label="Ask Folio">
    <label class="pal-in"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 3l1.8 4.9L19 9.7l-4.2 3.2 1.4 5.1L12 15.2 7.8 18l1.4-5.1L5 9.7l5.2-1.8z"/></svg>
      <span class="sr">Ask Folio</span><input type="text" placeholder="Ask for a book, a mood, an author…" autocomplete="off"><kbd>esc</kbd></label>
    <div class="pal-ai" hidden></div>
    <div class="pal-list" role="listbox"></div>
    <div class="pal-foot"><span>↑↓ to move · ↵ to open</span><span>Folio companion · reads 214 of your highlights</span></div>
  </div>`;
  document.body.appendChild(wrap);
  const input = wrap.querySelector('input'), list = wrap.querySelector('.pal-list'), ai = wrap.querySelector('.pal-ai');
  let items = [], sel = 0, lastFocus = null, typing;

  const render = () => {
    const q = input.value.trim().toLowerCase();
    const bk = BOOKS.filter((b) => !q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || b.genre.toLowerCase().includes(q)).slice(0, q ? 6 : 4)
      .map((b) => ({ kind: 'Book', label: b.title, sub: `${b.author} · ${b.genre}`, sw: b.bg, ac: b.accent, href: `#/book?b=${b.id}` }));
    const au = Object.values(AUTHORS).filter((a) => q && (a.name.toLowerCase().includes(q) || a.genre.toLowerCase().includes(q))).slice(0, 3)
      .map((a) => ({ kind: 'Author', label: a.name, sub: `${a.genre} · ${(a.followers / 1000).toFixed(1)}k followers`, sw: a.color, href: '#/author' }));
    const go2 = [['Open the 3D library', '#/explore'], ['Live community threads', '#/community'], ['AI Studio — turn feedback into a chapter', '#/studio'], ['Leaderboard & reading challenges', '#/leaderboard']]
      .filter(([l]) => !q || l.toLowerCase().includes(q)).map(([label, href]) => ({ kind: 'Go to', label, sub: '', href }));
    items = [...bk, ...au, ...go2];
    if (sel >= items.length) sel = 0;
    list.innerHTML = items.map((it, i) => `<a href="${it.href}" role="option" aria-selected="${i === sel}" class="pal-it" data-i="${i}">
      <span class="pal-sw" style="background:${it.sw || 'rgba(255,255,255,.08)'}">${it.ac ? `<i style="background:${it.ac}"></i>` : ''}</span>
      <span class="pal-tx"><b>${it.label}</b>${it.sub ? `<small>${it.sub}</small>` : ''}</span><span class="pal-k">${it.kind}</span></a>`).join('') || `<div class="pal-empty">${q.length >= 4 ? 'No exact title or author match — the companion’s picks are above.' : `Nothing on the shelves for “${input.value}”. Try a mood like “rainy” or “twisty”.`}</div>`;
  };

  const ask = () => {
    const q = input.value.trim();
    clearTimeout(typing);
    if (q.length < 4 || BOOKS.some((b) => b.title.toLowerCase().includes(q.toLowerCase()))) { ai.hidden = true; return; }
    const hit = ANSWERS.find(([re]) => re.test(q)) || [null, MOODS[0], 'Here is where I would start, based on what you highlight most.'];
    const picks = BOOKS.filter((b) => b.moods.includes(hit[1]) && !b.upcoming).slice(0, 3);
    ai.hidden = false;
    ai.innerHTML = `<div class="pal-ai-k">FOLIO COMPANION</div><p></p><div class="pal-ai-picks">${picks.map((b) => `<a href="#/book?b=${b.id}" style="--bg:${b.bg};--ac:${b.accent}"><i></i>${b.title}</a>`).join('')}</div>`;
    const p = ai.querySelector('p');
    let i = 0;
    const full = hit[2];
    const tick = () => { p.textContent = full.slice(0, i += 2); if (i < full.length) typing = setTimeout(tick, 16); };
    tick();
  };

  const open = () => { lastFocus = document.activeElement; wrap.hidden = false; requestAnimationFrame(() => wrap.classList.add('on')); input.value = ''; ai.hidden = true; sel = 0; render(); input.focus(); lenis?.stop(); };
  const close = () => { wrap.classList.remove('on'); setTimeout(() => { wrap.hidden = true; }, 250); lenis?.start(); lastFocus?.focus?.(); };
  const choose = (i) => { const it = items[i]; if (!it) return; close(); go(it.href); };

  input.addEventListener('input', () => { sel = 0; render(); clearTimeout(input._t); input._t = setTimeout(ask, 350); });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { sel = (sel + 1) % Math.max(items.length, 1); render(); e.preventDefault(); }
    else if (e.key === 'ArrowUp') { sel = (sel - 1 + items.length) % Math.max(items.length, 1); render(); e.preventDefault(); }
    else if (e.key === 'Enter') { choose(sel); e.preventDefault(); }
  });
  wrap.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) close();
    const a = e.target.closest('a');
    if (a) { e.preventDefault(); close(); go(a.getAttribute('href')); }
  });
  wrap.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') { e.preventDefault(); input.focus(); }
  });
  addEventListener('keydown', (e) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); wrap.hidden ? open() : close(); } });
  document.addEventListener('click', (e) => { if (e.target.closest('[data-ask]')) { e.preventDefault(); open(); } });
  return { open, close };
}
