import { ViewModel } from '../../runtime.js';

// AI Studio screen: state, data and every interaction on this page.
export default class StudioScreen extends ViewModel {
  destroy() { if (this._t) clearTimeout(this._t); }
  bindings() {
    const s = this.state;
    const SRC = [
      { id:'narr', title:'“Is the narrator already gone?” theory thread', meta:'412 replies · 60/40 split', n:412, cite:'@atlasreads on the “mapped” ledger' },
      { id:'qa', title:'Unanswered Q&A questions', meta:'96 questions about your process', n:96, cite:'@kabirreads: how do logs become chapters?' },
      { id:'log', title:'Comments on field log #398', meta:'612 replies · 5.1k likes', n:612, cite:'@priyareads asked about the Bureau’s lunch' }
    ];
    const OUT = {
      'Article': { kicker:'ESSAY · 6 MIN READ', title:'Why I wrote Ada the way I did', body:['Four hundred of you have spent the last week arguing about whether Ada is alive. I have read every reply, and I want to tell you why I never answered.','When I worked as a city planner, the people our maps forgot were not dead — they were simply never counted. Ada is written in that gap. The Bureau calls her “mapped” because that is what bureaucracies do to people they cannot see.','So: both camps are right. And the dedication, as Leila spotted, was the only clue I allowed myself.'] },
      'Tutorial': { kicker:'TUTORIAL · 4 STEPS', title:'From field log to chapter', body:['1 · Write a 40-word log every morning. No plot, just one strange true-feeling detail.','2 · Watch the replies. When readers ask “what happens next?” more than twice, the log has a pulse.','3 · Stack five pulsing logs and look for the person who appears in all of them. That is your chapter’s point of view.','4 · Rewrite from scratch. Keep only the original first line — readers will recognise it, and that recognition is the reward.'] },
      'Short story': { kicker:'SHORT STORY · 900 WORDS', title:'Lunch at the Bureau of Sound', body:['At noon the clerks of the Bureau unwrapped their sandwiches very quietly, which was the point.','Today’s special was other people’s small talk, lightly salted. Inspector Vo took the weather conversation from a bus stop on Rua Augusta and chewed it slowly, the way you would a memory you did not fully trust.','Across the table, a new clerk asked whether anyone had ever eaten a goodbye. The room went still — stiller, even, than usual.'] },
      'Daily update': { kicker:'FIELD LOG #413 · DRAFT', title:'The street that kept score', body:['You asked whether streets remember. This one keeps a tally in chalk on its own kerb: one mark for every time someone walks it without looking up.','Tomorrow: what happens when the count reaches a thousand.'] }
    };
    const sel = s.sel || { narr: true, log: false, qa: false };
    const fmt = s.fmt || 'Article', tone = s.tone || 'Your voice';
    const phase = s.phase || 'done';
    const on = 'background:rgba(157,140,255,.10);border:1px solid rgba(157,140,255,.55)', off = 'background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.08)';
    const chosen = SRC.filter((o) => sel[o.id]);
    const total = chosen.reduce((a, o) => a + o.n, 0) || 0;
    const H = { 'Article':'Essays & behind-the-scenes', 'Tutorial':'Craft & how-to', 'Short story':'Reader-shaped fiction', 'Daily update':'Tomorrow’s field log' };
    return {
      schedule: () => this.setState({ sched: !s.sched }), schedOn: s.sched ? 'true' : 'false',
      schedLabel: s.sched ? 'Scheduled · 7 AM ✓' : 'Schedule for 7 AM', schedStyle: s.sched ? 'border-color:#F5B94A;color:#F5B94A' : '',
      sources: SRC.map((o) => ({ ...o, on: sel[o.id] ? 'true' : 'false', pick: () => this.setState({ sel: { ...sel, [o.id]: !sel[o.id] } }), style: sel[o.id] ? on : off, box: sel[o.id] ? 'background:#9D8CFF;color:#0E0A22' : 'border:1px solid rgba(255,255,255,.3)', check: sel[o.id] ? '✓' : '' })),
      formats: Object.keys(OUT).map((f) => ({ label: f, hint: H[f], pick: () => this.setState({ fmt: f }), style: f === fmt ? on : off })),
      tones: ['Your voice', 'Reflective', 'Playful'].map((t) => ({ label: t, pick: () => this.setState({ tone: t }), style: t === tone ? 'background:#F2F0EA;color:#0A0A10;border:1px solid #F2F0EA' : 'background:transparent;color:#D6D4E0;border:1px solid rgba(255,255,255,.16)' })),
      generate: () => { if (!chosen.length) { this.setState({ phase: 'idle' }); return; } this.setState({ phase: 'loading', pub: false }); if (this._t) clearTimeout(this._t); this._t = setTimeout(() => this.setState({ phase: 'done', shown: fmt }), 1800); },
      genLabel: phase === 'loading' ? 'Generating…' : '✶ Generate ' + fmt.toLowerCase() + (total ? ' from ' + total.toLocaleString() + ' replies' : ''),
      isIdle: phase === 'idle', isLoading: phase === 'loading', isDone: phase === 'done',
      replyCount: total.toLocaleString(),
      fmtUpper: (s.shown || fmt).toUpperCase(), toneUpper: tone.toUpperCase(),
      status: phase === 'loading' ? 'WRITING…' : phase === 'done' ? (s.pub ? 'PUBLISHED' : 'READY TO REVIEW') : 'WAITING',
      statusColor: phase === 'done' ? (s.pub ? '#F5B94A' : '#6FD6C4') : '#8A889C',
      out: { ...OUT[s.shown || fmt], cites: (chosen.length ? chosen : SRC.slice(0, 1)).map((o) => o.cite).concat(['Mira’s past 30 field logs (voice)']) },
      publish: () => this.setState({ pub: true }),
      published: !!s.pub,
      pubLabel: s.pub ? 'Published to your feed ✓' : 'Publish to followers',
      pubStyle: s.pub ? 'background:rgba(245,185,74,.16);color:#F5B94A' : 'background:#F5B94A;color:#120D04'
    };
  }
}
