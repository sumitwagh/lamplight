import { ViewModel } from '../../runtime.js';

// Author dashboard screen: state, data and every interaction on this page.
export default class DashboardScreen extends ViewModel {
  bindings() {
    const s = this.state;
    const R = {
      '7 days': { v:[3.1,3.4,3.2,4.8,6.9,5.6,5.9], s:[2.0,2.2,2.6,3.1,3.0,3.6,3.9], start:'THU 19 NOV', end:'WED 25 NOV', k:['42.8k','18%','1,214','9%','1,840','32%','94','6'], peak:'Q&A day · 6.9k' },
      '30 days': { v:[2.2,2.6,2.4,2.9,3.1,2.8,3.4,3.9,3.6,4.2,4.0,4.8,5.6,5.2,6.1], s:[1.4,1.6,1.7,1.9,2.2,2.1,2.5,2.6,2.8,3.0,3.2,3.4,3.5,3.8,3.9], start:'27 OCT', end:'25 NOV', k:['164k','24%','4,980','15%','6,210','21%','94','9'], peak:'Field log #398 · 6.1k' },
      '90 days': { v:[1.6,1.9,2.1,2.0,2.6,2.9,3.3,3.1,3.8,4.4,4.9,5.8], s:[1.0,1.2,1.3,1.5,1.7,1.9,2.2,2.4,2.7,3.0,3.4,3.9], start:'AUG', end:'NOV', k:['421k','37%','11.2k','28%','15.4k','40%','94','14'], peak:'Cartographer paperback · 5.8k' }
    };
    const rng = s.rng || '7 days';
    const d = R[rng];
    const max = 7.5, W = 800, H = 240;
    const pts = (arr) => arr.map((v, i) => [Math.round(i * W / (arr.length - 1)), Math.round(H - v / max * (H - 30))]);
    const p1 = pts(d.v), p2 = pts(d.s);
    let pi = 0; d.v.forEach((v, i) => { if (v > d.v[pi]) pi = i; });
    const peak = p1[pi];
    return {
      ranges: Object.keys(R).map((r) => ({ label: r, pick: () => this.setState({ rng: r }), style: r === rng ? 'background:#F2F0EA;color:#0A0A10' : 'background:transparent;color:#D6D4E0' })),
      kpis: [
        { label:'READS', value:d.k[0], delta:d.k[1], note:'Across 3 books and 412 stories' },
        { label:'NEW FOLLOWERS', value:d.k[2], delta:d.k[3], note:'62% came from daily stories' },
        { label:'COMMENTS & REPLIES', value:d.k[4], delta:d.k[5], note:'Sentiment 89% positive' },
        { label:'INFLUENCE SCORE', value:d.k[6], delta:d.k[7], note:'#1 author this week' }
      ],
      line: p1.map((p) => p.join(',')).join(' '),
      line2: p2.map((p) => p.join(',')).join(' '),
      area: 'M0,' + H + ' L' + p1.map((p) => p.join(',')).join(' L') + ' L' + W + ',' + H + ' Z',
      peakX: peak[0] === W ? W - 4 : (peak[0] === 0 ? 4 : peak[0]), peakY: peak[1], peakTextY: peak[1] - 16, peakLabel: d.peak,
      chartNote: 'Thousands of reads per ' + (rng === '90 days' ? 'week' : 'day') + ' · ' + rng,
      chartLabel: 'Line chart of reads over the last ' + rng + ', peaking at ' + d.peak,
      xStart: d.start, xEnd: d.end,
      regions: [['India',34],['Nigeria',18],['Portugal',14],['United States',12],['United Kingdom',9]].map(([name, v]) => ({ name, v, w: Math.round(v / 34 * 100) })),
      ideas: [
        { type:'ESSAY', color:'#F5B94A', signal:'412 REPLIES', title:'“Why I wrote Ada the way I did”', why:'The narrator-theory thread is your most active discussion ever. Readers want your side.' },
        { type:'TUTORIAL', color:'#6FD6C4', signal:'96 REQUESTS', title:'How I turn a daily story into a chapter', why:'Aspiring writers keep asking about your field-log process in Q&A threads.' },
        { type:'SHORT STORY', color:'#C9BFFF', signal:'5.1K LIKES', title:'A Bureau of Sound lunch break', why:'Field log #398 was written from reader comments — they are asking for a full story.' }
      ],
      adding: !!s.adding, addExp: s.adding ? 'true' : 'false', addLabel: s.adding ? 'Cancel' : '+ Add a book',
      toggleAdd: () => this.setState({ adding: !s.adding, addError: '' }),
      newTitle: s.newTitle || '', onNewTitle: (e) => this.setState({ newTitle: e.target.value }), addError: s.addError || '',
      addBook: () => { const t = (s.newTitle || '').trim(); if (t.length < 2) { this.setState({ addError: 'Add a working title first.' }); return; } this.setState({ drafts: [t].concat(s.drafts || []), newTitle: '', adding: false, addError: '' }); },
      books: (s.drafts || []).map((t) => ({ title: t, bg: '#3A2E5C', status: 'DRAFT', statusStyle: 'background:rgba(157,140,255,.16);color:#C9BFFF', reads: '—', rating: '—', disc: 'Not published', action: 'Seed with AI', href: '#/studio' })).concat([
        { title:'The Cartographer of Silence', bg:'#123B3A', status:'PUBLISHED', statusStyle:'background:rgba(111,214,196,.14);color:#6FD6C4', reads:'121,400', rating:'★ 4.8', disc:'412 threads', action:'View', href:'#/book' },
        { title:'The Lantern Census', bg:'#1B1530', status:'PRE-ORDER · MAR 2027', statusStyle:'background:rgba(245,185,74,.14);color:#F5B94A', reads:'5.2k waitlist', rating:'—', disc:'38 threads', action:'Promote', href:'#/studio' },
        { title:'Low Tide Atlas', bg:'#E8DCC4', status:'BACKLIST', statusStyle:'background:rgba(255,255,255,.08);color:#D6D4E0', reads:'37,800', rating:'★ 4.5', disc:'96 threads', action:'View', href:'#/book' }
      ])
    };
  }
}
