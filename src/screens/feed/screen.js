import { ViewModel } from '../../runtime.js';

// Feed screen: state, data and every interaction on this page.
export default class FeedScreen extends ViewModel {
  destroy() { clearTimeout(this._t); }
  bindings() {
    const s = this.state;
    const B = {
      salt:{title:'Salt & Static',bg:'#E9E1D3',accent:'#D9472B',ink:'#1A1714',spine:'#B9AE9A',shape:'width:100%;height:6%;left:0;top:58%'},
      weight:{title:'The Weight of Light',bg:'#0F1A33',accent:'#8FB8FF',ink:'#E8EEFF',spine:'#08101F',shape:'width:2px;height:70%;left:62%;top:15%'},
      km:{title:'Kilometre Zero',bg:'#C5532E',accent:'#F7D9A8',ink:'#FFF4E4',spine:'#8F3A1F',shape:'width:44%;height:30%;border-radius:50%;left:28%;top:34%'}
    };
    const serif = "'Instrument Serif',serif", sans = 'Inter,sans-serif';
    const P = [
      { id:1, f:'Stories', name:'Dev Raman', initials:'DR', color:'#9D8CFF', action:'posted a story', meta:'DAY 42 · #SALTDIARIES · 18 MIN AGO', kind:'STORY', kindColor:'#F5B94A', text:'The keeper tried to switch the radio off. It said, very politely, that it had a few more names to read.', size:'26px', font:serif, likes:1840, replies:'214' },
      { id:2, f:'Following', name:'Kabir Sethi', initials:'KS', color:'#6FD6C4', action:'finished a book', meta:'5 STARS · 1 HOUR AGO', kind:'REVIEW', kindColor:'#6FD6C4', text:'The Weight of Light wrecked me in the best way. The darkroom chapter is the most beautiful thing I have read in years.', size:'17px', font:sans, likes:322, replies:'41', book:B.weight },
      { id:3, f:'For you', ai:true, name:'Your companion', initials:'✶', color:'#C9BFFF', action:'made you a shelf', meta:'BASED ON YOUR LAST 30 DAYS', kind:'AI', kindColor:'#C9BFFF', text:'You keep saving books with ocean settings. I built a “Salt-air mysteries” shelf of four — two are by authors you already follow.', size:'17px', font:sans, likes:0, replies:'0', bg:'rgba(157,140,255,.07)', border:'rgba(157,140,255,.3)' },
      { id:4, f:'Following', name:'Tomás Ruiz', initials:'TR', color:'#F2C14E', action:'is reading', meta:'#12BOOKSAWAY · 2 HOURS AGO', kind:'PROGRESS', kindColor:'#6FD6C4', text:'Day 6 on the bus from Kanyakumari. Arjun Mehta makes every border feel like a chapter break.', size:'17px', font:sans, likes:96, replies:'12', book:B.km, progress:58, progressNote:'chapter 14 of 24' },
      { id:5, f:'Stories', name:'Sana Kulkarni', initials:'SK', color:'#F2C14E', action:'shared a sneak peek', meta:'PAPER MOONS OVER PUNE · 3 HOURS AGO', kind:'SNEAK PEEK', kindColor:'#F5B94A', text:'In our house, monsoon was not a season. It was a guest who never told you when it was leaving.', size:'26px', font:serif, likes:2210, replies:'388' }
    ];
    const filt = s.filt || 'For you';
    const L = s.liked || {}, S = s.saved || {}, D = s.dismissed || {};
    const mine = s.mine || [];
    const shown = mine.concat(P).filter((p) => !D[p.id] && (filt === 'For you' || p.f === filt || (filt === 'Following' && p.f === 'Stories')));
    const F = s.fol || {};
    const on = 'background:#F2F0EA;color:#0A0A10;border:1px solid #F2F0EA', off = 'background:rgba(255,255,255,.04);color:#D6D4E0;border:1px solid rgba(255,255,255,.14)';
    return {
      newCount: shown.length * 3 + 2,
      draft: s.draft || '', onDraft: (e) => this.setState({ draft: e.target.value }),
      assistLabel: s.assisting ? 'Writing…' : '✶ Help me write it',
      assist: () => {
        if (s.assisting) return;
        const ideas = ['Finished chapter 12 of The Cartographer of Silence and I need to talk about the ledger on p. 211.', 'Three books in and #12BooksAway has taken me from Kanyakumari to Kyoto. Next stop: Pune.', '“Some photographs only develop when the person in them has forgiven you.” I keep thinking about this line.'];
        this.setState({ assisting: true });
        clearTimeout(this._t);
        this._t = setTimeout(() => this.setState({ assisting: false, draft: ideas[(this.state.ideaN || 0) % ideas.length], ideaN: (this.state.ideaN || 0) + 1 }), 900);
      },
      postIt: () => {
        const text = (s.draft || '').trim();
        if (!text) return;
        const post = { id: 'u' + Date.now(), f: 'For you', name: 'Aanya Rao', initials: 'AR', color: '#9D8CFF', action: 'shared a thought', meta: 'JUST NOW', kind: 'POST', kindColor: '#F5B94A', text, size: '17px', font: sans, likes: 0, replies: '0' };
        this.setState({ mine: [post].concat(mine), draft: '', filt: 'For you' });
      },
      filters: ['For you', 'Following', 'Stories'].map((f) => ({ label: f, pick: () => this.setState({ filt: f }), style: f === filt ? on : off })),
      posts: shown.map((p, i) => ({ ...p, delay: (i * 0.08) + 's', bg: p.bg || '#0C0C14', border: p.border || 'rgba(255,255,255,.08)', hasBook: !!p.book, book: p.book || B.salt, hasProgress: !!p.progress, isAi: !!p.ai,
        likes: p.likes + (L[p.id] ? 1 : 0), like: () => this.setState({ liked: { ...L, [p.id]: !L[p.id] } }),
        likeStyle: L[p.id] ? 'background:rgba(245,185,74,.16);color:#F5B94A;border:1px solid rgba(245,185,74,.5)' : 'background:transparent;color:#A09EB0;border:1px solid rgba(255,255,255,.12)',
        save: () => this.setState({ saved: { ...S, [p.id]: !S[p.id] } }), saveLabel: S[p.id] ? 'Saved ✓' : 'Save',
        saveStyle: S[p.id] ? 'background:rgba(157,140,255,.16);color:#C9BFFF;border:1px solid rgba(157,140,255,.5)' : 'background:transparent;color:#A09EB0;border:1px solid rgba(255,255,255,.12)',
        dismiss: () => this.setState({ dismissed: { ...D, [p.id]: true } }) })),
      week: ['M','T','W','T','F','S','S'].map((l, i) => ({ l, style: i < 6 ? 'background:#F5B94A;opacity:' + (0.45 + i * 0.09) : 'border:1px dashed rgba(245,185,74,.6)' })),
      suggest: [['Hana Ishida','HI','#6FD6C4','You loved The Weight of Light'],['Lena Varga','LV','#C9A7FF','Trending in Fantasy'],['Arjun Mehta','AM','#F7D9A8','In your #12BooksAway list']].map(([name, initials, color, why]) => ({ name, initials, color, why, pick: () => this.setState({ fol: { ...F, [name]: !F[name] } }), label: F[name] ? 'Following' : 'Follow', style: F[name] ? 'background:transparent;color:#F5B94A;border:1px solid #F5B94A' : 'background:#F2F0EA;color:#0A0A10;border:1px solid #F2F0EA' }))
    };
  }
}
