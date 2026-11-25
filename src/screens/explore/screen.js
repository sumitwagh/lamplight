import { ViewModel } from '../../runtime.js';
import { BOOKS, BOOK, AUTHORS, GENRES, MOODS, genreOf, fmt } from '../../data/books.js';
import { domBook } from '../../lib/covers.js';
import { reducedMotion } from '../../lib/ui.js';
import { go } from '../../router.js';

const root = () => document.documentElement;
const WHY = {
  'Mind-bending': 'you highlight sentences about memory and maps more than anything else.',
  Warm: 'it fits the 20 minutes you usually read before bed.',
  'A good cry': 'you re-read sad endings twice — this one earns it.',
  'One more chapter': 'short chapters; readers like you finish it in two nights.',
};

// The Stacks: genre/mood/search filters drive the 3D helix; clicking pulls a book out.
export default class LibraryScreen extends ViewModel {
  constructor() {
    super();
    this.state = { genre: 'All', mood: null, q: '', cur: null, saved: {} };
    this.cleanups = [];
  }

  destroy() {
    this.dead = true;
    this.cleanups.forEach((f) => f());
    ['--tx', '--ty', '--to'].forEach((v) => root().style.removeProperty(v));
  }

  list() {
    const { genre, mood, q } = this.state;
    const ql = q.trim().toLowerCase();
    return BOOKS.filter((b) => (genre === 'All' || genreOf(b) === genre)
      && (!mood || b.moods.includes(mood))
      && (!ql || b.title.toLowerCase().includes(ql) || b.author.toLowerCase().includes(ql) || b.genre.toLowerCase().includes(ql)));
  }

  update(patch) {
    this.setState(patch);
    const ids = this.list().map((b) => b.id);
    if (this.state.cur && !ids.includes(this.state.cur)) this.setState({ cur: null });
    if (this.helix) {
      this.helix.filter(ids);
      if (!this.state.cur) {
        this.helix.pinned = -1;
        const mid = Math.floor((ids.length - 1) / 2);
        let t = -(mid / 9) * Math.PI * 2;
        t += Math.round((this.helix.target - t) / (Math.PI * 2)) * Math.PI * 2;
        this.helix.target = t; this.helix.velocity = 0;
      }
    }
  }

  pick(id) {
    this.setState({ cur: id });
    this.helix?.focus(id);
  }

  bindings() {
    const s = this.state;
    const shown = this.list();
    const c = s.cur ? BOOK[s.cur] : null;
    const step = (dir) => () => { if (this.helix) { this.helix.pinned = -1; this.helix.target += dir * (Math.PI * 2) / 9; this.helix.velocity = 0; } };
    const scrollRail = (dir) => () => document.querySelector('[data-rail]')?.scrollBy({ left: dir * 528, behavior: reducedMotion() ? 'auto' : 'smooth' });
    const top = [...BOOKS].filter((b) => !b.upcoming).sort((a, b) => b.reading - a.reading).slice(0, 8);
    const max = top[0].reading;
    return {
      shown: shown.map(domBook),
      countLabel: `${shown.length} OF ${BOOKS.length} BOOKS`,
      empty: shown.length === 0 ? 'y' : '',
      clear: () => this.update({ genre: 'All', mood: null, q: '' }),
      q: s.q,
      onQ: (e) => this.update({ q: e.target.value }),
      genres: GENRES.map((g) => ({ label: g, n: g === 'All' ? BOOKS.length : BOOKS.filter((b) => genreOf(b) === g).length, on: g === s.genre ? 'true' : 'false', pick: () => this.update({ genre: g }) })),
      moods: MOODS.map((m) => ({ label: m, on: m === s.mood ? 'true' : 'false', pick: () => this.update({ mood: s.mood === m ? null : m }) })),
      prev: step(-1), next: step(1),
      pulledOpen: c ? 'true' : 'false',
      cur: c && {
        ...domBook(c), initials: AUTHORS[c.authorId]?.initials, ac: AUTHORS[c.authorId]?.color,
        ratingLabel: c.upcoming ? '—' : `★ ${c.rating}`, readingLabel: c.upcoming ? `${c.threads} waiting` : fmt(c.reading), pagesLabel: c.upcoming ? '2027' : c.pages,
        why: c.upcoming ? 'you finished Cartographer in 4 days. The field logs becoming this book are open to read now.' : WHY[c.moods[0]],
        cta: c.upcoming ? 'Read the field logs' : 'Open the book',
      },
      unpick: () => { this.setState({ cur: null }); if (this.helix) this.helix.pinned = -1; },
      savedOn: c && s.saved[c.id] ? 'true' : 'false',
      saveLabel: c && s.saved[c.id] ? 'On your shelf ✓' : (c?.upcoming ? 'Pre-order' : 'Add to shelf'),
      toggleSave: () => c && this.setState({ saved: { ...s.saved, [c.id]: !s.saved[c.id] } }),

      railPrev: scrollRail(-1), railNext: scrollRail(1),
      rail: [
        [BOOK.cartel, 'PRE-ORDER · SPRING 2027', '#F5B94A', '210 field logs written · 4,120 pre-orders', 62],
        [BOOK.wander, 'OUT THIS WEEK', '#6FD6C4', 'Launch Q&A Saturday · 1,900 reading', 100],
        [BOOK.glow, 'NEW · POETRY', '#6FD6C4', 'Chosen by readers from 365 daily poems', 100],
        [BOOK.weight, 'SERIAL · CH. 22 OF 26', '#9D8CFF', 'Next chapter Friday 7 a.m.', 84],
        [BOOK.salt, 'SERIAL · CH. 4 OF 18', '#9D8CFF', 'From #SaltDiaries · 24,900 readers', 22],
        [BOOK.moons, 'AUDIO EDITION · DEC', '#F5B94A', 'Narrated by the author in Marathi & English', 70],
        [BOOK.cipher, 'BOOK CLUB PICK · JAN', '#FF7A59', '38 clubs signed up · cipher contest open', 45],
      ].map(([b, kicker, kc, meta, pct]) => ({ ...domBook(b), kicker, kc, meta, pct })),

      collections: [
        { kicker: "EDITORS' PICKS · NOVEMBER", color: '#F5B94A', title: 'Books that rearrange time', desc: 'Looping, reversed and braided stories, chosen by the Lamplight editors.', ids: ['glass', 'weight', 'carto'], readers: '61k', href: '#/book?b=glass' },
        { kicker: 'BORN IN PUBLIC', color: '#6FD6C4', title: 'Started as daily stories', desc: 'Every one of these began as a 40-word post that readers would not let go.', ids: ['moons', 'salt', 'km'], readers: '40k', href: '#/book?b=moons' },
        { kicker: 'COMPANION · BUILT FOR YOU', color: '#C9BFFF', title: 'Rain, lamps and long nights', desc: 'Four quiet books for the monsoon; two by authors you follow.', ids: ['monsoon', 'lanterns', 'nine'], readers: '25k', href: '#/book?b=lanterns' },
      ].map((col, i) => ({ ...col, d: (i * 0.08) + 's', count: 12 + i * 5, books: col.ids.map((id, k) => ({ ...domBook(BOOK[id]), k: k - 1 })) })),

      chart: top.map((b, i) => ({ ...domBook(b), n: String(i + 1).padStart(2, '0'), pct: Math.round((b.reading / max) * 100), readingLabel: fmt(b.reading), delta: ['+12%', '+31%', '+8%', '+4%', '+19%', 'NEW', '+2%', '+44%'][i], d: (i * 0.04) + 's' })),
    };
  }

  async mounted(host) {
    const holder = host.querySelector('[data-lib-stage]');
    const { Stage, Helix } = await import('../../lib/stage.js');
    if (this.dead) return;
    if (!Stage.supported()) { host.querySelector('.lib')?.classList.add('no-gl'); return; }
    await Promise.all(["400 64px 'Instrument Serif'", "500 14px 'JetBrains Mono'", '600 16px Inter'].map((f) => document.fonts.load(f).catch(() => null)));
    if (this.dead) return;
    const stage = new Stage(holder, { z: 15, fog: [12, 26] });
    this.cleanups.push(() => stage.destroy());
    const helix = this.helix = new Helix(stage, BOOKS, { scale: 0.36, radius: 4.5, rise: 0.26 });
    helix.filter(BOOKS.map((b) => b.id));
    helix.filter([]); helix.place(true);
    setTimeout(() => !this.dead && helix.filter(this.list().map((b) => b.id)), 250);
    const tip = host.querySelector('[data-ltip]');

    let drag = null, moved = 0;
    const ndc = (e) => { const r = holder.getBoundingClientRect(); return [((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1]; };
    const move = (e) => {
      const [x, y] = ndc(e);
      helix.setPointer(x, y);
      root().style.setProperty('--tx', e.clientX + 'px');
      root().style.setProperty('--ty', e.clientY + 'px');
      if (drag) { const dx = e.clientX - drag.x; drag.x = e.clientX; moved += Math.abs(dx); helix.velocity = dx * 0.0045; helix.pinned = -1; }
    };
    const down = (e) => { drag = { x: e.clientX }; moved = 0; };
    const up = () => { if (drag && moved < 6 && helix.hover >= 0) this.pick(helix.items[helix.hover].userData.book.id); drag = null; };
    const leave = () => { helix.setPointer(-9, -9); drag = null; };
    holder.addEventListener('pointermove', move);
    holder.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);
    holder.addEventListener('pointerleave', leave);
    const key = (e) => {
      if (e.target.closest?.('input,textarea')) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { helix.pinned = -1; helix.target += (e.key === 'ArrowRight' ? 1 : -1) * Math.PI * 2 / 9; }
      if (e.key === 'Escape' && this.state.cur) { this.setState({ cur: null }); helix.pinned = -1; }
    };
    window.addEventListener('keydown', key);
    this.cleanups.push(() => { holder.removeEventListener('pointermove', move); holder.removeEventListener('pointerdown', down); window.removeEventListener('pointerup', up); holder.removeEventListener('pointerleave', leave); window.removeEventListener('keydown', key); });

    helix.on('hover', (b) => {
      holder.style.cursor = b ? 'pointer' : '';
      if (b) {
        tip.querySelector('.tip-g').textContent = b.genre;
        tip.querySelector('b').textContent = b.title;
        tip.querySelector('.tip-a').textContent = b.author;
        tip.querySelector('.tip-m').textContent = b.upcoming ? 'COMING 2027 · PRE-ORDER' : `★ ${b.rating} · ${fmt(b.reading)} READING`;
      }
      root().style.setProperty('--to', b ? '1' : '0');
    });

    stage.frames.add((dt, t) => {
      const wide = stage.camera.aspect >= 1;
      const open = !!this.state.cur;
      const gx = open && wide ? -2.6 : 0;
      helix.group.position.x += (gx - helix.group.position.x) * (1 - Math.pow(0.002, dt));
      const fy = this.state.cur ? -helix.slotY(this.state.cur) : 0;
      helix.group.position.y += ((wide ? -1.1 : -0.2) + fy - helix.group.position.y) * 0.1;
      helix.group.rotation.x = 0.1;
      if (!drag && helix.hover < 0 && helix.pinned < 0 && !reducedMotion()) helix.target += dt * 0.08;
      stage.camera.position.set(stage.pointer.sx * 0.5, 0.6 + stage.pointer.sy * 0.3, wide ? 15 : 23);
      stage.lookAt.set(0, wide ? -0.6 : -0.6, 0);
      void t;
    });

    const pre = new URLSearchParams(location.hash.split('?')[1] || '').get('b');
    if (pre && BOOK[pre]) setTimeout(() => !this.dead && this.pick(pre), 600);
  }
}
