import { ViewModel } from '../../runtime.js';

// Book screen: state, data and every interaction on this page.
export default class BookScreen extends ViewModel {
  bindings() {
    const s = this.state;
    const open = !!s.open;
    const lvl = s.lvl || 'No spoilers';
    const SUM = {
      'No spoilers': 'A mapmaker in a city where silence is rationed sets out to chart the one street nobody can name. Quiet, aching and strange — readers compare it to walking through a dream you half remember.',
      'Up to ch. 9': 'Ada learns her mother didn’t buy silence for funerals — she sold it. The unnamed street appears only on maps Ada draws while grieving, and the Bureau of Sound wants every copy.',
      'Full book': 'The street is a map of Ada’s own memory. In the final chapter she trades her voice to keep it on the city’s charts — the community is split on whether that is a sacrifice or a release.'
    };
    const tab = s.tab || 'Reviews';
    const liked = s.liked || {};
    const R = [
      { id:'a', name:'Leila Haddad', initials:'LH', color:'#6FD6C4', badge:'TOP REVIEWER', meta:'Finished in 4 days · 3 days ago', stars:'★★★★★', text:'I underlined half of chapter nine. Okafor writes grief like a city planner — every street of it has a reason to be there. The ending will split your book club in two, and that is the point.', count:214, replies:38 },
      { id:'b', name:'Kabir Sethi', initials:'KS', color:'#9D8CFF', badge:'READING STREAK · 61', meta:'Read alongside the author’s field logs', stars:'★★★★☆', text:'Reading the daily field logs first made the book land twice as hard. The middle drags slightly, but the map sequences are unlike anything I have read this year.', count:97, replies:12 },
      { id:'c', name:'Nora Lindqvist', initials:'NL', color:'#E9E1D3', badge:'', meta:'Stockholm · 1 week ago', stars:'★★★★★', text:'Quiet books are rarely this gripping. I would follow Ada into any street she draws.', count:61, replies:4 }
    ];
    const pill = (on) => on ? 'background:#F2F0EA;color:#0A0A10;border:1px solid #F2F0EA' : 'background:transparent;color:#D6D4E0;border:1px solid rgba(255,255,255,.16)';
    return {
      rx: s.rx ?? 0, ry: open ? 0 : (s.ry ?? -18), lid: open ? -165 : 0, shift: open ? 150 : 0,
      onMove: (e) => { if (open) return; const t = e.currentTarget.getBoundingClientRect(); const x = (e.clientX - t.left) / t.width, y = (e.clientY - t.top) / t.height; this.setState({ rx: ((0.5 - y) * 14).toFixed(2), ry: (-18 + (x - 0.3) * 50).toFixed(2) }); },
      onLeave: () => this.setState({ rx: 0, ry: -18 }),
      toggleOpen: () => this.setState({ open: !open }),
      openLabel: open ? 'Close the book' : 'Open a preview',
      shelfLabel: s.shelf ? 'On your shelf ✓' : 'Add to 3D shelf',
      toggleShelf: () => this.setState({ shelf: !s.shelf }),
      levels: Object.keys(SUM).map((k) => ({ label: k, pick: () => this.setState({ lvl: k }), style: pill(k === lvl) })),
      summary: SUM[lvl],
      tabs: ['Reviews', 'Discussions'].map((t) => ({ label: t, pick: () => this.setState({ tab: t }), style: t === tab ? 'background:#F2F0EA;color:#0A0A10' : 'background:transparent;color:#D6D4E0' })),
      showReviews: tab === 'Reviews', showThreads: tab === 'Discussions',
      reviews: R.map((r) => ({ ...r, count: r.count + (liked[r.id] ? 1 : 0), like: () => this.setState({ liked: { ...liked, [r.id]: !liked[r.id] } }), likeStyle: liked[r.id] ? 'background:rgba(245,185,74,.16);color:#F5B94A;border:1px solid rgba(245,185,74,.5)' : 'background:transparent;color:#A09EB0;border:1px solid rgba(255,255,255,.12)' })),
      threads: [
        { tag:'THEORY · 86 LIVE', tagColor:'#F5B94A', title:'Is the narrator of Cartographer already gone? (spoilers, ch. 1–12)', meta:'Started by @atlasreads · 2h ago', replies:'412' },
        { tag:'AUTHOR Q&A', tagColor:'#C9BFFF', title:'Ask Mira anything — Saturday 7 PM IST', meta:'Hosted by Mira Okafor · 1,120 going', replies:'240' },
        { tag:'CRAFT', tagColor:'#6FD6C4', title:'How the map chapters are structured like real survey notes', meta:'Started by @civicink · yesterday', replies:'88' },
        { tag:'BOOK CLUB', tagColor:'#D6D4E0', title:'Week 2 read-along: chapters 6–10', meta:'Pune Readers Circle · 640 members', replies:'131' }
      ]
    };
  }
}
