import { ViewModel } from '../../runtime.js';

// Community screen: state, data and every interaction on this page.
export default class CommunityScreen extends ViewModel {
  bindings() {
    const s = this.state;
    const T = [
      { id:'narr', tag:'● 86 LIVE · THEORY', tagColor:'#F5B94A', glow:'rgba(245,185,74,.18)', space:'The Cartographer of Silence', title:'Is the narrator of Cartographer already gone? (spoilers, ch. 1–12)', author:'Atlas Reads', initials:'AT', color:'#6FD6C4', when:'2 hours ago · Top contributor', count:412, hot:3, top:2, body:'Every time Ada enters the unnamed street, nobody in the scene speaks to her — they speak about her. Chapter 12 has the Bureau listing her as “mapped”, which is the word they use for the dead. Am I reading too much into this?', digest:'60% of readers think Ada is alive but erased from records; 40% believe she died before chapter 1. The most-cited evidence is the “mapped” ledger on p. 211. Mira Okafor has liked 4 replies but not confirmed either side.', idea:'412 replies debating one passage. AI suggests a behind-the-scenes essay: “Why I wrote Ada as a ghost — or didn’t.”',
        replies:[['Kabir Sethi','KS','#9D8CFF','READING STREAK · 61','#C9BFFF','1h','The ledger detail broke me. But on p. 240 the baker hands her change, which ghosts do not usually get.','318',''],['Mira Okafor','MO','#F5B94A','AUTHOR','#F5B94A','48m','I will say only this: re-read the dedication after chapter 12.','1.9k','padding-left:24px;border-left:2px solid rgba(245,185,74,.5);margin-left:4px'],['Leila Haddad','LH','#E9E1D3','TOP REVIEWER','#6FD6C4','20m','The dedication is “for the ones who listen.” Not “read”. Listen. I am now convinced.','644','']] },
      { id:'qa', tag:'TONIGHT 8 PM IST · AUTHOR Q&A', tagColor:'#C9BFFF', glow:'rgba(157,140,255,.22)', space:'Salt & Static', title:'Dev Raman answers your Salt & Static theories', author:'Dev Raman', initials:'DR', color:'#9D8CFF', when:'Pinned by moderators', count:240, hot:2, top:3, body:'Bring me your wildest lighthouse theories. I will answer the top 20 live tonight and the best one becomes tomorrow’s #SaltDiaries story.', digest:'Top-voted questions cluster around the radio’s origin (38%), the keeper’s sister (27%) and a possible sequel (19%).', idea:'The top 20 questions map cleanly to a reader FAQ — AI can draft it in your voice after the session.',
        replies:[['Priya Nair','PN','#F2C14E','','#8A889C','3h','Is the radio broadcasting the future or the past? Asking for my sleep schedule.','402',''],['Tomás Ruiz','TR','#6FD6C4','CHALLENGE · WEEK 3','#6FD6C4','2h','Will we ever learn who built the lighthouse?','211','']] },
      { id:'ch', tag:'3,402 JOINED · CHALLENGE', tagColor:'#6FD6C4', glow:'rgba(111,214,196,.18)', space:'#12BooksAway', title:'Twelve books set in places you have never been — week 3 check-in', author:'Lamplight Editors', initials:'FE', color:'#E9E1D3', when:'Weekly thread', count:1180, hot:1, top:1, body:'Week 3 is “a city you could not find on a map.” Post what you picked, how far you are, and one line that made you want to book a ticket.', digest:'Kilometre Zero and Paper Moons Over Pune are this week’s most-picked books. 214 reviews posted today.', idea:'Challenge readers are asking for itineraries from Kilometre Zero — a great tutorial-style post for Arjun Mehta.',
        replies:[['Aanya Rao','AR','#9D8CFF','STREAK · 23','#C9BFFF','5h','Picked Paper Moons. One line: “the moon would rust in the rain.” I want to be in Pune in July.','88','']] }
    ];
    const sort = s.sort || 'Hot';
    const key = sort === 'Hot' ? 'hot' : sort === 'Top' ? 'top' : null;
    const list = key ? [...T].sort((a, b) => a[key] - b[key]) : [...T].reverse();
    const id = s.id || 'narr';
    const cur = T.find((t) => t.id === id);
    const extra = (s.extra || {})[id] || [];
    const R = s.reacts || {};
    const mine = R[id] || {};
    const base = { '♥': 1240, '◎ Insightful': 318, '✶ Mind-blown': 204, '? Same question': 96 };
    return {
      sorts: ['Hot', 'New', 'Top'].map((o) => ({ label: o, pick: () => this.setState({ sort: o }), style: o === sort ? 'background:#F2F0EA;color:#0A0A10' : 'background:transparent;color:#D6D4E0' })),
      sortNote: sort.toUpperCase() + ' THREADS',
      threads: list.map((t) => ({ ...t, pick: () => this.setState({ id: t.id }), style: t.id === id ? 'background:rgba(255,255,255,.06);border:1px solid rgba(245,185,74,.5)' : 'background:#0C0C14;border:1px solid rgba(255,255,255,.08)' })),
      cur: { ...cur, count: cur.count + extra.length },
      reacts: Object.keys(base).map((k) => ({ label: k, n: base[k] + (mine[k] ? 1 : 0), pick: () => this.setState({ reacts: { ...R, [id]: { ...mine, [k]: !mine[k] } } }), style: mine[k] ? 'background:rgba(245,185,74,.16);color:#F5B94A;border:1px solid rgba(245,185,74,.5)' : 'background:transparent;color:#D6D4E0;border:1px solid rgba(255,255,255,.14)' })),
      replies: cur.replies.map((r) => ({ name:r[0], initials:r[1], color:r[2], badge:r[3], badgeColor:r[4], when:r[5], text:r[6], likes:r[7], indent:r[8] })).concat(extra),
      draft: s.draft || '',
      onDraft: (e) => this.setState({ draft: e.target.value }),
      post: () => { const t = (s.draft || '').trim(); if (!t) return; const ex = { ...(s.extra || {}) }; ex[id] = [...extra, { name:'Aanya Rao', initials:'AR', color:'#9D8CFF', badge:'YOU', badgeColor:'#C9BFFF', when:'just now', text:t, likes:'0', indent:'' }]; this.setState({ extra: ex, draft: '' }); }
    };
  }
}
