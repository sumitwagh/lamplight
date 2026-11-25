import { ViewModel } from '../../runtime.js';
import { BOOKS, BOOK, AUTHORS, HIGHLIGHTS, CHAPTER_ONE, PAGE_LINES, READERS_NOW, fmt } from '../../data/books.js';
import { domBook } from '../../lib/covers.js';
import { onScroll, pinProgress, lenis, reducedMotion } from '../../lib/ui.js';
import { go } from '../../router.js';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const range = (p, a, b) => clamp((p - a) / (b - a));
const band = (p, a, b, c, d) => Math.min(range(p, a, b), 1 - range(p, c, d));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);
const root = () => document.documentElement;

// "Ask the book" — canned, page-cited answers (chapter 1 only).
const QA = [
  { id: 'why', label: 'Why is silence sold?', re: /sold|sell|buy|silence|mother|funeral/i, hl: [0, 1], cite: 'p. 1 · lines 1–4',
    a: 'In Vell, quiet is rationed by the Bureau of Sound, so it is weighed and sold like salt. On the first page the narrator’s mother buys it only for funerals — silence is what a family can afford to spend on grief.' },
  { id: 'who', label: 'Who is the narrator?', re: /who|narrator|name|she|girl/i, hl: [2, 4], cite: 'p. 1 · lines 5 & 9',
    a: 'Chapter one never gives her name. What it does tell you: she is a mapmaker who steals silence to draw with, and she uses pencil so the Bureau cannot hear her work.' },
  { id: 'street', label: 'Why did the street move?', re: /street|move|map|east/i, hl: [3, 5], cite: 'p. 1 · lines 6–12',
    a: 'Chapter one doesn’t say — it ends on the street sliding two blocks east overnight. 60% of readers in the forum think the street follows whoever is grieving; I won’t go further without spoilers.' },
  { id: 'tldr', label: 'Chapter one in one line', re: /summar|tl;?dr|one line|short/i, hl: [0, 3, 5], cite: 'Chapter 1 · 12 lines',
    a: 'A girl who steals silence draws a street with no name — and by morning, the street has moved.' },
];

const JOURNEY = [
  { n: '01', color: '#F5B94A', kicker: 'MON 7:02 A.M. · FIELD LOG #42', text: '“The keeper tried to switch the radio off. It said it had a few more names to read.”', vis: 'Posted to 41.7k followers\n1,840 ♥ · 214 replies in 3 hours', meta: 'Dev Raman · #SaltDiaries', href: '#/feed', cta: 'Read the field log' },
  { n: '02', color: '#6FD6C4', kicker: 'MON–TUE · READERS REPLY', text: 'Readers ask whose names. Three theories start fighting in the replies.', vis: '“It’s reading the future” · 92 replies\n“They’re the crew of 1987” · 71\n“The keeper is on it” · 51', meta: 'Thread trending #1 in Thrillers', href: '#/community', cta: 'Join the thread' },
  { n: '03', color: '#9D8CFF', kicker: 'WED · AI STUDIO', text: 'Folio’s AI groups 214 replies into three theories and drafts a chapter outline in Dev’s voice.', vis: '◆ Theory A — 43% of replies\n◆ Theory B — 33%\n◆ Theory C — 24%\n→ outline: 6 beats · 2,400 words', meta: 'Dev keeps beats 1, 3, 5 and rewrites the rest', href: '#/studio', cta: 'Open AI Studio' },
  { n: '04', color: '#FF7A59', kicker: 'THU · AUTHOR DASHBOARD', text: 'Chapter four goes to 1,200 early readers. Completion: 94%.', vis: 'Avg. read time 11m 40s\nMost highlighted: “The list was alphabetical. Mine was not on it.”', meta: 'Scheduled for Friday 7 a.m.', href: '#/dashboard', cta: 'See the dashboard' },
  { n: '05', color: '#F2C14E', kicker: 'FRI · IN THE BOOK', text: 'Salt & Static, chapter 4: “The List.” 24,900 readers now.', vis: '★ 4.6 · 12,880 ratings\nLive Q&A tonight · 1,940 going', meta: 'From a 40-word story to a chapter in five days', href: '#/book?b=salt', cta: 'Read chapter four' },
];

const MOOD_PICKS = {
  'Mind-bending': [['carto', 97, 'you highlight sentences about memory more than anything else.'], ['glass', 93, 'readers who finished Cartographer rated it 4.9.'], ['cipher', 88, 'you like puzzles you can solve before the detective.']],
  Warm: [['moons', 96, 'you saved three monsoon stories this week.'], ['nine', 90, 'it fits the 20 minutes you usually read before bed.'], ['km', 85, 'you are on a #12BooksAway streak.']],
  'A good cry': [['weight', 98, 'you re-read sad endings twice.'], ['lanterns', 91, 'grief, written as a festival of light.'], ['field', 86, 'it is short, and it will undo you.']],
  'One more chapter': [['salt', 97, 'you finish short-chapter thrillers in two nights.'], ['frequency', 92, 'it never slows down.'], ['vantage', 84, 'every chapter ends on a floor number.']],
};

const LOGS = {
  okafor: 'Day 412. The Bureau sent a letter. It was blank, which is how they say yes.',
  raman: 'Day 43. The radio is quiet tonight. That has never once been good news.',
  ishida: 'Measured the kitchen at dawn: 212 lux. My father would have said, enough.',
  kulkarni: 'Folded a new moon for the first rain. My niece says it looks like a samosa.',
};

const TICKS = [
  ['Leila', 'Lisbon', 'highlighted p. 211 of Cartographer', '#6FD6C4'], ['Kabir', 'Pune', 'finished Salt & Static in two nights', '#9D8CFF'],
  ['Yuki', 'Kyoto', 'joined the Weight of Light read-along', '#F5B94A'], ['Ama', 'Lagos', 'asked Mira a question for Saturday', '#FF7A59'],
  ['Jonas', 'Berlin', 'solved the chapter 9 cipher in Glasshouse', '#B7F36B'], ['Priya', 'Kochi', 'started a 7-day #SaltDiaries streak', '#9D8CFF'],
  ['Marta', 'São Paulo', 'left a margin note on p. 1', '#6FD6C4'], ['Ji-woo', 'Seoul', 'added Paper Moons to a shelf', '#F2C14E'],
  ['Ciarán', 'Galway', 'voted Iris’s poem 214 into the book', '#D8C7E8'], ['Sara', 'Mexico City', 'finished chapter one of Cartographer', '#F5B94A'],
];

export default class ReadingRoomScreen extends ViewModel {
  constructor() {
    super();
    this.state = { mood: 'Mind-bending', chat: [{ who: 'ai', label: 'FOLIO COMPANION', text: 'I’ve read chapter one with you. Ask me anything — I’ll answer from the page and never spoil what comes next.' }], following: {}, flipped: {} };
    this.cleanups = [];
  }

  destroy() {
    this.dead = true;
    this.cleanups.forEach((f) => f());
    clearTimeout(this._t); clearTimeout(this._stream);
    ['--v0', '--v1', '--v2', '--v3', '--rail', '--hz', '--hzp', '--stage-o', '--tx', '--ty', '--to'].forEach((v) => root().style.removeProperty(v));
    delete root().dataset.ch;
  }

  /* --------------------------------------------------------------- bindings */
  bindings() {
    const s = this.state;
    const thinking = !!s.thinking;
    const last = [...s.chat].reverse().find((m) => m.hl);
    const hlOn = new Set(last?.hl || []);
    const heat = this._heat ||= Array.from({ length: 112 }, (_, i) => { const r = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1; return i > 104 ? (i === 111 ? 0.25 : 0.8) : r < 0.28 ? 0 : +(0.15 + r * 0.85).toFixed(2); });
    return {
      hero: domBook(BOOK.carto),
      magnet: (e) => { const t = e.currentTarget, r = t.getBoundingClientRect(); t.style.setProperty('--mx', ((e.clientX - r.left - r.width / 2) * 0.25).toFixed(1) + 'px'); t.style.setProperty('--my', ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + 'px'); },
      unmagnet: (e) => { e.currentTarget.style.setProperty('--mx', '0px'); e.currentTarget.style.setProperty('--my', '0px'); },
      skipToBook: () => this.jump(0.3),
      toc: [['I', 'The door', 0], ['II', 'The book', 0.28], ['III', 'The margins', 0.53], ['IV', 'The stacks', 0.84]].map(([n, label, p], i) => ({ n, label, i, go: () => this.jump(p) })),
      highlights: HIGHLIGHTS.map((h, i) => ({ ...h, line: i, tag: h.author ? 'AUTHOR' : '' })),

      passage: CHAPTER_ONE.map((text, i) => ({ text, on: hlOn.has(i) ? 'true' : 'false' })),
      chat: s.chat.map((m) => ({ ...m, typing: m.typing ? 'y' : '' })),
      questions: QA.map((q) => ({ label: q.label, ask: () => this.ask(q.label, q) })),
      draft: s.draft || '',
      onDraft: (e) => { this.state.draft = e.target.value; },
      send: () => this.ask(this.state.draft),
      submit: (e) => { e.preventDefault(); this.ask(this.state.draft); },

      journey: JOURNEY,

      moods: Object.keys(MOOD_PICKS).map((k) => ({ label: k, on: k === s.mood ? 'true' : 'false', pick: () => this.pickMood(k) })),
      thinking, showPicks: !thinking,
      picks: MOOD_PICKS[s.mood].map(([id, match, why], i) => ({ b: domBook(BOOK[id]), match, why, d: (i * 0.09) + 's' })),

      heat,
      badges: [
        ['🔥', 'Streak keeper', '23 days in a row. Your longest is 41.', ''],
        ['🗺️', 'Cartographer', 'Highlighted 100 lines in one book.', ''],
        ['🕯️', 'Night owl', 'Read past 1 a.m. on 12 nights.', ''],
        ['🖋️', 'Book whisperer', 'Locked — get an author to reply to your review.', 'locked'],
      ].map(([icon, name, desc, cls], i) => ({ icon, name, desc, cls, d: (i * 0.06) + 's', on: s.flipped[i] ? 'true' : 'false', flip: () => this.setState({ flipped: { ...s.flipped, [i]: !s.flipped[i] } }) })),

      authors: ['okafor', 'raman', 'ishida', 'kulkarni'].map((id, i) => {
        const a = AUTHORS[id];
        const on = !!s.following[id];
        return { ...a, followers: fmt(a.followers + (on ? 1 : 0)), log: LOGS[id], when: ['LIVE · 4M AGO', 'POSTED 1H AGO', 'POSTED 3H AGO', 'WRITING NOW'][i], on: on ? 'true' : 'false', label: on ? 'Following ✓' : `Follow ${a.name.split(' ')[0]}`, follow: () => this.setState({ following: { ...s.following, [id]: !on } }), tilt: this.tilt, untilt: this.untilt };
      }),

      threads: [
        { color: '#F5B94A', kicker: 'THEORY · 86 READING LIVE', title: 'Is the narrator of Cartographer already gone?', digest: 'readers split 60 / 40; most-quoted passage is p. 211; Mira hinted “read the map legend”.', faces: '🟠🟣🟢', meta: '412 replies', typing: '3 typing', d: '0s' },
        { color: '#C9BFFF', kicker: 'TONIGHT 8 PM IST · AUTHOR Q&A', title: 'Dev Raman answers your Salt & Static theories', digest: '128 questions submitted; top ask is whether the 1987 crew is real.', faces: '🟣🟡🔵', meta: '1,940 going', typing: 'Dev is typing', d: '.06s' },
        { color: '#6FD6C4', kicker: 'READ-ALONG · WEEK 2', title: 'The Weight of Light, chapters 6–10', digest: 'chapter 8 has the most re-reads this week; 11 languages in the thread.', faces: '🟢🟠🟣', meta: '640 members', typing: '5 typing', d: '.12s' },
        { color: '#FF7A59', kicker: 'CRAFT · FROM THE AI STUDIO', title: 'How Sana turned 300 balcony stories into a novel', digest: 'a breakdown of which daily stories became chapters, voted by readers.', faces: '🟡🟢🟠', meta: '88 replies', typing: '2 typing', d: '.18s' },
      ],
    };
  }

  tilt = (e) => {
    const t = e.currentTarget, r = t.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    t.style.setProperty('--ry', ((x - 0.5) * 14).toFixed(2) + 'deg');
    t.style.setProperty('--rx', ((0.5 - y) * 10).toFixed(2) + 'deg');
    t.style.setProperty('--gx', (x * 100).toFixed(1) + '%');
    t.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
    t.style.setProperty('--go', '1');
  };

  untilt = (e) => { ['--rx', '--ry', '--go'].forEach((v) => e.currentTarget.style.setProperty(v, v === '--go' ? '0' : '0deg')); };

  pickMood(k) {
    if (k === this.state.mood) return;
    this.setState({ mood: k, thinking: true });
    clearTimeout(this._t);
    this._t = setTimeout(() => this.setState({ thinking: false }), 900);
  }

  ask(text, qa) {
    text = (text || '').trim();
    if (!text || this.state.chat.some((m) => m.typing)) return;
    const hit = qa || QA.find((q) => q.re.test(text));
    const reply = hit || { a: 'Chapter one only hints at that. 41 readers asked something similar — the thread is open in the community, and Mira answers the best one on Saturday.', cite: 'Community · 41 similar questions', hl: [] };
    const chat = [...this.state.chat, { who: 'me', label: 'YOU', text }, { who: 'ai', label: 'FOLIO COMPANION', text: '', typing: true }];
    this.setState({ chat: chat.slice(-7), draft: '' });
    const words = reply.a.split(' ');
    let i = 0;
    const step = () => {
      if (this.dead) return;
      i = Math.min(words.length, i + 2);
      const c = this.state.chat.slice();
      const m = { ...c[c.length - 1], text: words.slice(0, i).join(' ') };
      if (i >= words.length) { m.typing = false; m.cite = reply.cite; m.hl = reply.hl; }
      c[c.length - 1] = m;
      this.setState({ chat: c });
      if (i < words.length) this._stream = setTimeout(step, reducedMotion() ? 0 : 45);
      else requestAnimationFrame(() => { const log = document.querySelector('.chat-log'); if (log) log.scrollTop = log.scrollHeight; });
    };
    this._stream = setTimeout(step, 420);
    requestAnimationFrame(() => { const log = document.querySelector('.chat-log'); if (log) log.scrollTop = log.scrollHeight; });
  }

  jump(p) {
    const el = document.querySelector('[data-story]');
    if (!el) return;
    const y = el.offsetTop + p * (el.offsetHeight - window.innerHeight) + 2;
    if (lenis) lenis.scrollTo(y, { duration: 1.6 }); else window.scrollTo({ top: y, behavior: reducedMotion() ? 'auto' : 'smooth' });
  }

  /* --------------------------------------------------------------- after first paint */
  async mounted(host) {
    this.host = host;
    this.startLive();
    this.startGlobe();
    this.startHorizontal();
    const story = host.querySelector('[data-story]');
    this.story = story;
    this.p = 0; this.ps = 0;
    const update = () => {
      if (this.dead) return;
      this.p = pinProgress(story);
      this.applyOverlay(this.p);
      const r = story.getBoundingClientRect();
      const o = clamp(r.bottom / window.innerHeight * 1.4 - 0.2);
      root().style.setProperty('--stage-o', o.toFixed(3));
      if (this.stage) this.stage.paused = o <= 0.001;
    };
    this.cleanups.push(onScroll(update));
    update();

    const { Stage } = await import('../../lib/stage.js');
    if (this.dead) return;
    if (!Stage.supported()) { host.querySelector('.rr')?.classList.add('no-gl'); return; }
    await Promise.all([
      document.fonts.load("400 64px 'Instrument Serif'"), document.fonts.load("italic 400 34px 'Instrument Serif'"),
      document.fonts.load("500 14px 'JetBrains Mono'"), document.fonts.load('600 16px Inter'),
    ].map((p) => p.catch(() => null)));
    if (this.dead) return;
    await this.startStage(story);
    update();
  }

  applyOverlay(p) {
    const v = [1 - range(p, 0.035, 0.085), band(p, 0.115, 0.16, 0.34, 0.39), band(p, 0.43, 0.47, 0.62, 0.66), band(p, 0.71, 0.76, 1.1, 1.2)];
    v.forEach((x, i) => root().style.setProperty('--v' + i, x.toFixed(3)));
    root().style.setProperty('--rail', p.toFixed(4));
    let best = 0; v.forEach((x, i) => { if (x > v[best] + 0.01) best = i; });
    if (root().dataset.ch !== String(best)) root().dataset.ch = String(best);
  }

  async startStage(story) {
    const { Stage, Dust, Book3D, Helix } = await import('../../lib/stage.js');
    if (this.dead) return;
    const holder = document.createElement('div');
    holder.className = 'rr-stage';
    document.body.prepend(holder);
    this.cleanups.push(() => holder.remove());
    const stage = this.stage = new Stage(holder);
    this.cleanups.push(() => stage.destroy());
    new Dust(stage, { count: window.innerWidth < 760 ? 260 : 520 });
    const book = new Book3D(stage, BOOK.carto, { lines: PAGE_LINES });
    const helixBooks = BOOKS.filter((b) => b.id !== 'carto');
    const helix = new Helix(stage, helixBooks, { scale: 0.34, radius: 4.3, rise: 0.27 });
    helix.filter([]);
    helix.place(true);
    helix.interactive = false;

    const pin = story.querySelector('[data-pin]');
    const notes = [...story.querySelectorAll('[data-note]')];
    const tip = story.querySelector('[data-tip]');
    let helixOn = false;

    // helix interaction (only during chapter III)
    const ndc = (e) => { const r = pin.getBoundingClientRect(); return [((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1]; };
    let drag = null, moved = 0;
    const onMove = (e) => {
      if (!helix.interactive) return;
      const [x, y] = ndc(e);
      helix.setPointer(x, y);
      root().style.setProperty('--tx', e.clientX + 'px');
      root().style.setProperty('--ty', e.clientY + 'px');
      if (drag) { const dx = e.clientX - drag.x; drag.x = e.clientX; moved += Math.abs(dx); helix.velocity = dx * 0.004; }
    };
    const onDown = (e) => { if (!helix.interactive || e.target.closest('a,button')) return; drag = { x: e.clientX }; moved = 0; };
    const onUp = () => { if (drag && moved < 6) helix.pick(); drag = null; };
    const onLeave = () => { helix.setPointer(-9, -9); drag = null; };
    pin.addEventListener('pointermove', onMove);
    pin.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    pin.addEventListener('pointerleave', onLeave);
    this.cleanups.push(() => { pin.removeEventListener('pointermove', onMove); pin.removeEventListener('pointerdown', onDown); window.removeEventListener('pointerup', onUp); pin.removeEventListener('pointerleave', onLeave); });
    helix.on('hover', (b) => {
      pin.style.cursor = b ? 'pointer' : '';
      if (b) {
        tip.querySelector('.tip-g').textContent = b.genre;
        tip.querySelector('b').textContent = b.title;
        tip.querySelector('.tip-a').textContent = b.author;
        tip.querySelector('.tip-m').textContent = b.upcoming ? 'COMING 2027 · PRE-ORDER' : `★ ${b.rating} · ${fmt(b.reading)} READING · ${b.pages} PP`;
      }
      root().style.setProperty('--to', b ? '1' : '0');
      root().style.setProperty('--ts', b ? '1' : '.9');
    });
    helix.on('pick', (b) => go(`#/book?b=${b.id}`));

    // scroll-driven choreography
    let t0 = 0;
    stage.frames.add((dt, t) => {
      t0 = t;
      const k = 1 - Math.pow(0.0004, dt);
      this.ps = lerp(this.ps, this.p, reducedMotion() ? 1 : k);
      const p = this.ps;
      const wide = stage.camera.aspect >= 1;
      const ptr = stage.pointer;

      const open = smooth(range(p, 0.1, 0.22));
      const rif = range(p, 0.22, 0.38);
      const exit = smooth(range(p, 0.62, 0.72));
      const reading = range(p, 0.4, 0.46);
      book.set(open * (1 - exit), rif * (1 - exit));

      // book placement per chapter
      const hero = wide ? [2.6, -0.1, 0] : [0, 2.3, 0];
      const read = wide ? [1.6, 0, 0] : [-1.5, 1.6, 0];
      const marg = wide ? [-1.9, -0.1, 0] : [-1.5, 1.4, 0];
      const pos = [0, 1, 2].map((i) => lerp(lerp(hero[i], read[i], open), marg[i], smooth(reading)));
      const fly = [0, 1.8, -10];
      book.root.position.set(lerp(pos[0], fly[0], exit), lerp(pos[1], fly[1], exit) + (reducedMotion() ? 0 : Math.sin(t * 0.9) * 0.06 * (1 - open)), lerp(pos[2], fly[2], exit));
      book.root.scale.setScalar(lerp(1, 0.25, exit));
      book.root.visible = exit < 0.98;
      book.tilt.rotation.y = lerp(0.36 + ptr.sx * 0.3, ptr.sx * 0.07, open) + exit * 2.4;
      book.tilt.rotation.x = lerp(0.1 - ptr.sy * 0.18, -0.14 - ptr.sy * 0.05, open);
      book.tilt.rotation.z = lerp(-0.04, 0, open);
      book.shadow.material.opacity = 0.8 * (1 - exit);
      stage.lamp.target.position.copy(book.root.position);

      // highlights on the page + margin notes
      const hl = PAGE_LINES.map(() => 0);
      HIGHLIGHTS.forEach((h, i) => h.lines.forEach((l, j) => { hl[l] = range(p, 0.45 + i * 0.03 + j * 0.012, 0.49 + i * 0.03 + j * 0.012); }));
      book.setHighlights(hl);
      const v2 = band(p, 0.43, 0.47, 0.62, 0.66);
      if (v2 > 0.001) {
        let prev = -1e9;
        const order = notes.map((n, i) => ({ n, i, a: book.lineAnchor(HIGHLIGHTS[i].lines[0]) })).sort((x, y) => x.a.y - y.a.y);
        const cardH = wide ? 112 : 104;
        order.forEach(({ n, i, a }) => {
          const o = range(p, 0.46 + i * 0.03, 0.5 + i * 0.03);
          const x = wide ? a.x : Math.min(a.x, stage.size.w - 24);
          const cy = Math.max(a.y - 30, prev + 12);
          prev = cy + cardH;
          const len = wide ? 46 : 0;
          n.style.setProperty('--x', x.toFixed(1) + 'px');
          n.style.setProperty('--y', a.y.toFixed(1) + 'px');
          n.style.setProperty('--cy', (cy - a.y).toFixed(1) + 'px');
          n.style.setProperty('--len', len + 'px');
          n.style.setProperty('--ang', Math.atan2(cy - a.y + 26, len + 18).toFixed(3) + 'rad');
          n.style.setProperty('--ll', Math.hypot(cy - a.y + 26, len + 18).toFixed(1) + 'px');
          n.style.setProperty('--o', o.toFixed(3));
        });
      }

      // camera
      const zHero = wide ? 12 : 21, zRead = wide ? 13 : 19, zMarg = wide ? 12.4 : 18, zHelix = wide ? 15 : 22;
      const helixT = smooth(range(p, 0.64, 0.76));
      let z = lerp(lerp(zHero, zRead, open), zMarg, smooth(reading));
      z = lerp(z, zHelix, helixT);
      stage.camera.position.set(ptr.sx * 0.35, ptr.sy * 0.25 + helixT * 0.6, z);
      stage.lookAt.set(0, helixT * 0.3, 0);
      stage.scene.fog.near = z - 2; stage.scene.fog.far = z + 12;

      // helix library
      const show = p > 0.64;
      if (show !== helixOn) { helixOn = show; helix.filter(show ? helixBooks.map((b) => b.id) : []); }
      helix.interactive = p > 0.74 && p < 1 && !reducedMotion() ? true : p > 0.74 && p < 1;
      if (!helix.interactive && helix.hover >= 0) helix.setPointer(-9, -9);
      helix.group.position.set(wide ? 2.4 : 0, lerp(-2.4, 2.4, range(p, 0.66, 1)) + (wide ? 0 : 2.2), wide ? -1 : -2);
      helix.target += (range(p, 0.66, 1) * 7.5 - (this._lastSpin || 0));
      this._lastSpin = range(p, 0.66, 1) * 7.5;
      helix.group.rotation.x = 0.08;
    });
    void t0;
  }

  /* --------------------------------------------------------------- live counters + ticker */
  startLive() {
    const live = [...this.host.querySelectorAll('[data-live],[data-live2]')];
    let n = 18204;
    const iv = setInterval(() => {
      n += Math.round((Math.random() - 0.35) * 14);
      live.forEach((el) => { el.textContent = n.toLocaleString('en-US'); });
    }, 1800);
    const list = this.host.querySelector('[data-ticker]');
    let i = 0;
    const push = () => {
      const [who, city, what, c] = TICKS[i++ % TICKS.length];
      const li = document.createElement('li');
      li.innerHTML = `<i style="background:${c}"></i><span><b>${who}</b> in ${city} ${what}</span><small>now</small>`;
      list.prepend(li);
      [...list.children].forEach((x, j) => { if (j > 0) x.querySelector('small').textContent = `${j * 2 + 1}s ago`; });
      while (list.children.length > 6) list.lastChild.remove();
    };
    for (let k = 0; k < 4; k++) push();
    const iv2 = setInterval(push, reducedMotion() ? 6000 : 2400);
    this.cleanups.push(() => { clearInterval(iv); clearInterval(iv2); });
  }

  /* --------------------------------------------------------------- dotted globe of readers */
  startGlobe() {
    const cv = this.host.querySelector('[data-globe]');
    if (!cv) return;
    const g = cv.getContext('2d');
    const S = cv.width, R = S * 0.4, C = S / 2;
    const pts = [];
    const N = 1500, phi = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) { const y = 1 - (i / (N - 1)) * 2; const r = Math.sqrt(1 - y * y); const th = phi * i; pts.push([Math.cos(th) * r, y, Math.sin(th) * r]); }
    const cities = READERS_NOW.map(([name, lat, lon, n]) => { const la = lat * Math.PI / 180, lo = lon * Math.PI / 180; return { name, n, v: [Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo)] }; });
    const arcs = [];
    let rot = -0.6, vel = 0.0025, drag = null, visible = false, raf;
    const tilt = 0.32;
    const proj = (v, a) => {
      const x = v[0] * Math.cos(a) + v[2] * Math.sin(a), z = -v[0] * Math.sin(a) + v[2] * Math.cos(a);
      const y2 = v[1] * Math.cos(tilt) - z * Math.sin(tilt), z2 = v[1] * Math.sin(tilt) + z * Math.cos(tilt);
      return [C + x * R, C - y2 * R, z2];
    };
    const draw = (time) => {
      raf = requestAnimationFrame(draw);
      if (!visible) return;
      if (!drag) rot += reducedMotion() ? 0 : vel;
      g.clearRect(0, 0, S, S);
      const halo = g.createRadialGradient(C, C, R * 0.7, C, C, R * 1.25);
      halo.addColorStop(0, 'rgba(245,185,74,.10)'); halo.addColorStop(1, 'rgba(245,185,74,0)');
      g.fillStyle = halo; g.fillRect(0, 0, S, S);
      for (const p of pts) {
        const [x, y, z] = proj(p, rot);
        if (z < -0.05) continue;
        g.fillStyle = `rgba(242,240,234,${0.1 + z * 0.5})`;
        g.beginPath(); g.arc(x, y, 1.3 + z * 1.1, 0, Math.PI * 2); g.fill();
      }
      if (Math.random() < 0.03 && arcs.length < 6) { const a = cities[Math.floor(Math.random() * cities.length)], b = cities[Math.floor(Math.random() * cities.length)]; if (a !== b) arcs.push({ a, b, t: 0 }); }
      for (let i = arcs.length - 1; i >= 0; i--) {
        const arc = arcs[i]; arc.t += 0.012;
        const A = proj(arc.a.v, rot), B = proj(arc.b.v, rot);
        if (A[2] < 0 || B[2] < 0 || arc.t > 1.6) { if (arc.t > 1.6 || A[2] < -0.3) arcs.splice(i, 1); continue; }
        const mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2;
        const dx = mx - C, dy = my - C, len = Math.hypot(dx, dy) || 1, lift = 0.25 * Math.hypot(A[0] - B[0], A[1] - B[1]);
        const cx = mx + dx / len * lift, cy = my + dy / len * lift;
        g.strokeStyle = `rgba(157,140,255,${0.6 * Math.min(1, 1.6 - arc.t)})`;
        g.lineWidth = 1.4;
        g.beginPath();
        const steps = 30, upto = Math.min(1, arc.t) * steps;
        for (let s = 0; s <= upto; s++) { const u = s / steps; const x = (1 - u) * (1 - u) * A[0] + 2 * (1 - u) * u * cx + u * u * B[0]; const y = (1 - u) * (1 - u) * A[1] + 2 * (1 - u) * u * cy + u * u * B[1]; s ? g.lineTo(x, y) : g.moveTo(x, y); }
        g.stroke();
      }
      for (const c of cities) {
        const [x, y, z] = proj(c.v, rot);
        if (z < 0) continue;
        const size = 2.5 + Math.sqrt(c.n) * 0.16;
        const pulse = (time / 1000 + c.n % 7) % 2 / 2;
        g.strokeStyle = `rgba(245,185,74,${(1 - pulse) * 0.6 * z})`;
        g.beginPath(); g.arc(x, y, size + pulse * 18, 0, Math.PI * 2); g.stroke();
        g.fillStyle = `rgba(255,213,138,${0.5 + z * 0.5})`;
        g.beginPath(); g.arc(x, y, size, 0, Math.PI * 2); g.fill();
        if (c.n > 600 && z > 0.35) { g.fillStyle = `rgba(242,240,234,${z * 0.85})`; g.font = "500 14px 'JetBrains Mono', monospace"; g.fillText(`${c.name} · ${c.n.toLocaleString('en-US')}`, x + size + 8, y + 4); }
      }
    };
    raf = requestAnimationFrame(draw);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }); io.observe(cv);
    const down = (e) => { drag = { x: e.clientX }; cv.setPointerCapture?.(e.pointerId); };
    const move = (e) => { if (!drag) return; const dx = e.clientX - drag.x; drag.x = e.clientX; rot += dx * 0.006; vel = Math.max(-0.02, Math.min(0.02, dx * 0.0008)) || 0.0025; };
    const up = () => { drag = null; if (Math.abs(vel) < 0.001) vel = 0.0025; };
    cv.addEventListener('pointerdown', down); cv.addEventListener('pointermove', move); cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    this.cleanups.push(() => { cancelAnimationFrame(raf); io.disconnect(); });
  }

  /* --------------------------------------------------------------- horizontal journey */
  startHorizontal() {
    const sec = this.host.querySelector('[data-hz]');
    const track = this.host.querySelector('[data-hz-track]');
    if (!sec || !track || reducedMotion()) return;
    const upd = () => {
      const p = pinProgress(sec);
      const max = Math.max(0, track.scrollWidth - window.innerWidth);
      root().style.setProperty('--hz', (-p * max).toFixed(1) + 'px');
      root().style.setProperty('--hzp', p.toFixed(4));
    };
    this.cleanups.push(onScroll(upd));
    upd();
  }
}
