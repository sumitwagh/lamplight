import { ViewModel } from '../../runtime.js';
import { BOOKS, BOOK, PAGE_LINES, fmt } from '../../data/books.js';
import { pagesFor, NOTE_PEOPLE, summaries, authorOf } from '../../data/chapters.js';
import { domBook } from '../../lib/covers.js';
import { reducedMotion, scrollToEl } from '../../lib/ui.js';
import { playAmbience, stopAmbience } from '../../lib/ambience.js';

const ORDER = ['LH', 'KS', 'MO', 'NL'];
const pill = (on) => on ? 'background:var(--paper);color:var(--ink);border:1px solid var(--paper)' : 'background:transparent;color:#D6D4E0;border:1px solid rgba(255,255,255,.16)';

function wrapLines(text, n = 31) {
  const out = []; let line = '';
  for (const w of text.split(' ')) { if ((line + ' ' + w).trim().length > n && line) { out.push(line); line = w; } else line = (line + ' ' + w).trim(); }
  if (line) out.push(line);
  return out.slice(0, 12);
}

function viewPage(pg) {
  if (!pg) return { kind: 'blank', isBlank: 'y' };
  const v = { ...pg, isDed: pg.kind === 'dedication' ? 'y' : '', isTitle: pg.kind === 'title' ? 'y' : '', isText: pg.kind === 'text' ? 'y' : '', isEnd: pg.kind === 'end' ? 'y' : '', isBlank: '' };
  if (pg.kind === 'text') {
    v.folio = `p. ${pg.folio}`;
    v.paras = pg.paras.map((para) => para.map((sg) => Array.isArray(sg)
      ? { hl: 'y', plain: '', text: sg[0], color: NOTE_PEOPLE[sg[1]].color, n: ORDER.indexOf(sg[1]) + 1 }
      : { plain: 'y', hl: '', text: sg }));
  }
  return v;
}

const codesOn = (pg) => (pg?.kind === 'text' ? pg.paras.flat().filter(Array.isArray).map((s) => s[1]) : []);

// Book page: 3D hero, an in-browser page-turning reader with social margins, ambience,
// spoiler-dial summary and reviews. Choose the book with #/book?b=<id>.
export default class BookScreen extends ViewModel {
  constructor() {
    super();
    const id = new URLSearchParams(location.hash.split('?')[1] || '').get('b');
    this.id = BOOK[id] ? id : 'carto';
    this.pages = pagesFor(this.id);
    this.state = { spread: 0, moving: -1, theme: 'paper', fs: 19, amb: null, peek: false, lvl: 'No spoilers', tab: 'Reviews', liked: {}, shelf: false };
    this.cleanups = [];
  }

  destroy() {
    this.dead = true;
    stopAmbience();
    clearTimeout(this._mv);
    this.cleanups.forEach((f) => f());
  }

  leafCount() { return Math.ceil((this.pages.length - 1) / 2); }

  turn(dir) {
    const s = this.state.spread + dir;
    if (s < 0 || s > this.leafCount() || this.state.moving >= 0 && !reducedMotion()) return;
    const moving = dir > 0 ? this.state.spread : s;
    this.setState({ spread: s, moving });
    clearTimeout(this._mv);
    this._mv = setTimeout(() => this.setState({ moving: -1 }), reducedMotion() ? 0 : 950);
  }

  bindings() {
    const s = this.state;
    const b = BOOK[this.id];
    const a = authorOf(b);
    const n = this.leafCount();
    const P = this.pages;
    const leaves = Array.from({ length: n }, (_, i) => {
      const flipped = i < s.spread;
      return { front: viewPage(P[1 + 2 * i]), back: viewPage(P[2 + 2 * i]), cls: (flipped ? 'flipped' : '') + (i === s.moving ? ' moving' : ''), z: i === s.moving ? n + 5 : flipped ? i + 1 : n - i };
    });
    const leftIdx = s.spread === 0 ? 0 : 2 * s.spread;
    const visible = [P[leftIdx], P[leftIdx + 1]];
    const codes = [...new Set(visible.flatMap(codesOn))].sort((x, y) => ORDER.indexOf(x) - ORDER.indexOf(y));
    const SUM = summaries(b);
    const liked = s.liked;
    const R = [
      { id: 'a', name: 'Leila Haddad', initials: 'LH', color: '#6FD6C4', badge: 'TOP REVIEWER', meta: 'Finished in 4 days · 3 days ago', stars: '★★★★★', text: `I underlined half of it. ${b.author.split(' ')[0]} writes like someone who has watched readers react in real time — every scene has a reason to be there. The ending will split your book club in two, and that is the point.`, count: 214, replies: 38 },
      { id: 'b', name: 'Kabir Sethi', initials: 'KS', color: '#9D8CFF', badge: 'READING STREAK · 61', meta: 'Read alongside the author’s field logs', stars: '★★★★☆', text: 'Reading the daily field logs first made the book land twice as hard. The middle drags slightly, but the best sequences are unlike anything I have read this year.', count: 97, replies: 12 },
      { id: 'c', name: 'Nora Lindqvist', initials: 'NL', color: '#E9E1D3', badge: '', meta: 'Stockholm · 1 week ago', stars: '★★★★★', text: `Quiet books are rarely this gripping. “${b.hook}” — I have not stopped thinking about that first line.`, count: 61, replies: 4 },
    ];
    return {
      b: { ...domBook(b), genreCaps: b.genre.toUpperCase(), titleCaps: b.title.toUpperCase() },
      a: { ...a, followersLabel: fmt(a.followers) },
      tags: [[b.upcoming ? 'COMING 2027' : `#${BOOKS.indexOf(b) + 1} TRENDING`, 'background:var(--amber);color:#140E03'], ["EDITORS' PICK", 'border:1px solid rgba(255,255,255,.2);color:#D6D4E0'], [b.year >= 2026 ? 'WRITTEN IN PUBLIC' : 'BACKLIST', 'border:1px solid rgba(111,214,196,.4);color:#6FD6C4']].map(([label, style]) => ({ label, style })),
      stats: (b.upcoming
        ? [['Pre-orders', '4,120'], ['Field logs', b.threads], ['Out', 'Spring 2027'], ['Waiting', '2.1k']]
        : [['Rating', `★ ${b.rating}`], ['Ratings', b.ratings.toLocaleString('en-US')], ['Pages', b.pages], ['Reading now', fmt(b.reading)]]).map(([label, value]) => ({ label, value })),
      readNow: () => { const el = document.getElementById('reader'); if (el) scrollToEl(el); },
      readLabel: b.upcoming ? 'Read the field logs' : 'Read chapter one',
      togglePeek: () => this.setState({ peek: !s.peek }),
      peekOn: s.peek ? 'true' : 'false',
      peekLabel: s.peek ? 'Close the book' : 'Open it here',
      shelfOn: s.shelf ? 'true' : 'false',
      shelfLabel: s.shelf ? 'On your shelf ✓' : (b.upcoming ? 'Pre-order' : 'Add to shelf'),
      toggleShelf: () => this.setState({ shelf: !s.shelf }),

      themes: [['paper', 'Paper'], ['sepia', 'Sepia'], ['night', 'Night']].map(([id, label]) => ({ id, label, on: s.theme === id ? 'true' : 'false', pick: () => this.setState({ theme: id }) })),
      theme: s.theme, fs: s.fs,
      smaller: () => this.setState({ fs: Math.max(15, s.fs - 1) }),
      bigger: () => this.setState({ fs: Math.min(24, s.fs + 1) }),
      ambiences: [['rain', '☂', 'Rain'], ['fire', '🔥', 'Fire'], ['library', '📚', 'Library']].map(([id, icon, label]) => ({ icon, label, on: s.amb === id ? 'true' : 'false', pick: () => { const next = s.amb === id ? null : id; this.setState({ amb: next }); if (next) playAmbience(next); else stopAmbience(); } })),

      p0: viewPage(P[0]),
      leaves,
      all: P.map(viewPage),
      next: () => this.turn(1),
      prev: () => this.turn(-1),
      onKey: (e) => { if (e.key === 'ArrowRight') { this.turn(1); e.preventDefault(); } if (e.key === 'ArrowLeft') { this.turn(-1); e.preventDefault(); } },
      swipeStart: (e) => { this._sx = e.clientX; },
      swipeEnd: (e) => { const dx = e.clientX - (this._sx ?? e.clientX); if (Math.abs(dx) > 50) this.turn(dx < 0 ? 1 : -1); this._sx = null; },
      progLabel: `Pages ${leftIdx + 1}–${Math.min(leftIdx + 2, P.length)} of ${P.length}`,
      progPct: Math.round(((leftIdx + 2) / P.length) * 100),
      notesLabel: codes.length ? `${codes.length} READERS ON THESE PAGES` : 'QUIET PAGES',
      noNotes: codes.length ? '' : 'y',
      notes: codes.map((c) => ({ ...NOTE_PEOPLE[c], n: ORDER.indexOf(c) + 1, author: NOTE_PEOPLE[c].author ? 'y' : '' })),

      levels: Object.keys(SUM).map((k) => ({ label: k, on: k === s.lvl ? 'true' : 'false', pick: () => this.setState({ lvl: k }) })),
      lvlKey: Object.keys(SUM).indexOf(s.lvl),
      summary: SUM[s.lvl],
      tabs: ['Reviews', 'Discussions'].map((t) => ({ label: t, on: t === s.tab ? 'true' : 'false', pick: () => this.setState({ tab: t }) })),
      showReviews: s.tab === 'Reviews' ? 'y' : '', showThreads: s.tab === 'Discussions' ? 'y' : '',
      reviews: R.map((r) => ({ ...r, on: liked[r.id] ? 'true' : 'false', count: r.count + (liked[r.id] ? 1 : 0), like: () => this.setState({ liked: { ...liked, [r.id]: !liked[r.id] } }) })),
      threads: [
        { tag: 'THEORY · 86 LIVE', color: '#F5B94A', title: `What is really going on in ${b.title}? (spoilers, ch. 1–12)`, meta: 'Started by @atlasreads · 2h ago', replies: b.threads },
        { tag: 'AUTHOR Q&A', color: '#C9BFFF', title: `Ask ${a.name.split(' ')[0]} anything — Saturday 7 PM IST`, meta: `Hosted by ${a.name} · 1,120 going`, replies: 240 },
        { tag: 'CRAFT', color: '#6FD6C4', title: 'Which field logs became which chapters? A map', meta: 'Started by @civicink · yesterday', replies: 88 },
        { tag: 'BOOK CLUB', color: '#D6D4E0', title: 'Week 2 read-along: chapters 6–10', meta: 'Pune Readers Circle · 640 members', replies: 131 },
      ],
      also: BOOKS.filter((x) => x.id !== b.id && x.moods.some((m) => b.moods.includes(m))).slice(0, 3).map(domBook),
    };
  }

  async mounted(host) {
    const holder = host.querySelector('[data-book-stage]');
    const { Stage, Book3D } = await import('../../lib/stage.js');
    if (this.dead) return;
    if (!Stage.supported()) { host.querySelector('.bkp')?.classList.add('no-gl'); return; }
    await Promise.all(["400 64px 'Instrument Serif'", "italic 400 34px 'Instrument Serif'", "500 14px 'JetBrains Mono'", '600 16px Inter'].map((f) => document.fonts.load(f).catch(() => null)));
    if (this.dead) return;
    const b = BOOK[this.id];
    const stage = new Stage(holder, { z: 11.5, fog: [20, 40] });
    this.cleanups.push(() => stage.destroy());
    const lines = this.id === 'carto' ? PAGE_LINES : wrapLines(`${b.hook} ${b.blurb}`);
    const book = new Book3D(stage, b, { lines, kicker: 'CHAPTER ONE', leftTitle: 'Chapter One' });
    let o = 0, r = 0;
    stage.frames.add((dt, t) => {
      const peek = this.state.peek;
      const k = reducedMotion() ? 1 : 1 - Math.pow(0.05, dt);
      o += ((peek ? 1 : 0) - o) * k;
      r += ((peek && o > 0.9 ? 1 : 0) - r) * k * 0.7;
      book.set(o, r);
      const ptr = stage.pointer;
      book.tilt.rotation.y = (1 - o) * (0.42 + ptr.sx * 0.45) + o * ptr.sx * 0.12;
      book.tilt.rotation.x = 0.08 - ptr.sy * 0.2 * (1 - o * 0.6);
      book.root.position.set(0, reducedMotion() ? 0 : Math.sin(t * 0.9) * 0.08 * (1 - o), 0);
      const wide = stage.camera.aspect >= 0.9;
      stage.camera.position.set(0, 0, (wide ? 11.5 : 14) + o * (wide ? 3.6 : 9));
      stage.lamp.target.position.set(0, 0, 0);
    });
  }
}
