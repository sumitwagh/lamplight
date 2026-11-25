import { ViewModel } from '../../runtime.js';

// Leaderboard screen: state, data and every interaction on this page.
export default class LeaderboardScreen extends ViewModel {
  bindings() {
    const s = this.state;
    const per = s.per || 'This week', cat = s.cat || 'Authors';
    const D = {
      'Authors': { metric:'INFLUENCE', href:'#/author', rows:[['Mira Okafor','MO','#F5B94A','Literary sci-fi · Q&A host',94,'+2'],['Dev Raman','DR','#9D8CFF','Thrillers · daily #SaltDiaries',91,'+1'],['Hana Ishida','HI','#6FD6C4','Literary · 63k followers',88,'−1'],['Sana Kulkarni','SK','#F2C14E','Magical realism · debut',85,'+7'],['Theo Brandt','TB','#B7F36B','Techno-thrillers',82,'0'],['Lena Varga','LV','#C9A7FF','Fantasy · read-along host',80,'+3'],['Arjun Mehta','AM','#F7D9A8','Memoir · travel',77,'−2'],['Iris Calloway','IC','#D8C7E8','Poetry',74,'+1']] },
      'Readers': { metric:'BOOKS · STREAK', href:'#/feed', rows:[['Leila Haddad','LH','#6FD6C4','61 books this year',61,'+1'],['Kabir Sethi','KS','#9D8CFF','61-day streak',58,'0'],['Tomás Ruiz','TR','#F2C14E','#12BooksAway leader',54,'+4'],['Nora Lindqvist','NL','#E9E1D3','Night Owl III',49,'−1'],['Priya Nair','PN','#F2C14E','9 challenges completed',47,'+2'],['Aanya Rao (you)','AR','#9D8CFF','23-day streak · up 41 places',31,'+41'],['Wei Chen','WC','#8FB8FF','Speed reader badge',30,'−3'],['Omar Farouk','OF','#F7D9A8','Poetry month champion',28,'0']] },
      'Reviewers': { metric:'HELPFUL VOTES', href:'#/book', rows:[['Leila Haddad','LH','#6FD6C4','Top reviewer · 214 reviews','8.4k','+1'],['Atlas Reads','AT','#6FD6C4','Theory threads','6.9k','+2'],['Kabir Sethi','KS','#9D8CFF','Spoiler-safe specialist','5.2k','0'],['Nora Lindqvist','NL','#E9E1D3','Nordic noir','4.1k','−2'],['Priya Nair','PN','#F2C14E','Debut champion','3.8k','+5'],['Wei Chen','WC','#8FB8FF','Sci-fi','3.1k','0'],['Omar Farouk','OF','#F7D9A8','Poetry','2.7k','+1'],['Tomás Ruiz','TR','#F2C14E','Travel','2.2k','+3']] },
      'Contributors': { metric:'CONTENT SPARKED', href:'#/community', rows:[['Atlas Reads','AT','#6FD6C4','Their thread became an author essay',42,'+6'],['Priya Nair','PN','#F2C14E','Inspired field log #398',38,'+3'],['Leila Haddad','LH','#6FD6C4','Book-club host',33,'0'],['Kabir Sethi','KS','#9D8CFF','Q&A question curator',29,'+1'],['Tomás Ruiz','TR','#F2C14E','Challenge guides',24,'+2'],['Nora Lindqvist','NL','#E9E1D3','Translation threads',21,'−1'],['Omar Farouk','OF','#F7D9A8','Poetry prompts',18,'0'],['Wei Chen','WC','#8FB8FF','Reading maps',15,'+1']] }
    };
    const d = D[cat];
    const R = per === 'This week' ? d.rows : [d.rows[0], d.rows[2], d.rows[1], ...d.rows.slice(3)];
    const pill = (on) => on ? 'background:#F2F0EA;color:#0A0A10;border:1px solid #F2F0EA' : 'background:rgba(255,255,255,.04);color:#D6D4E0;border:1px solid rgba(255,255,255,.14)';
    const POD = [[1, 180, '#C9CBD6', 'linear-gradient(#2A2A38,#14141E)', '#3A3A4C', 88, 'rgba(201,203,214,.7)', '-1s'], [0, 250, '#F5B94A', 'linear-gradient(#3B2C10,#17120A)', '#5C4419', 108, 'rgba(245,185,74,.8)', '0s'], [2, 130, '#D08A5B', 'linear-gradient(#2E2018,#15100C)', '#4A3022', 80, 'rgba(208,138,91,.7)', '-2s']];
    const J = s.joined || { a: true };
    const unit = cat === 'Authors' ? ' influence' : cat === 'Readers' ? ' books' : cat === 'Reviewers' ? ' votes' : ' sparks';
    return {
      periodUpper: per.toUpperCase(), catUpper: cat.toUpperCase(), metric: d.metric,
      periods: ['This week', 'This month'].map((p) => ({ label: p, pick: () => this.setState({ per: p }), style: p === per ? 'background:#F2F0EA;color:#0A0A10' : 'background:transparent;color:#D6D4E0' })),
      cats: Object.keys(D).map((c) => ({ label: c, pick: () => this.setState({ cat: c }), style: pill(c === cat) })),
      podium: POD.map(([i, h, num, face, top, av, ring, delay]) => ({ rank: String(i + 1), h, num, face, top, av, ring, delay, name: R[i][0], initials: R[i][1], color: R[i][2], stat: R[i][4] + unit, href: d.href })),
      rows: R.slice(3).map((r, i) => ({ rank: String(i + 4).padStart(2, '0'), name: r[0], initials: r[1], color: r[2], meta: r[3], score: r[4], move: r[5] === '0' ? '—' : (r[5][0] === '+' ? '▲ ' + r[5].slice(1) : '▼ ' + r[5].slice(1)), moveColor: r[5][0] === '+' ? '#6FD6C4' : r[5] === '0' ? '#8A889C' : '#F0A08A', href: d.href, delay: (i * 0.05) + 's', style: r[0].indexOf('(you)') > -1 ? 'background:rgba(157,140,255,.10);box-shadow:inset 3px 0 0 #9D8CFF' : '' })),
      badges: [['✶','Night Owl II','#F5B94A',1],['◎','First Review','#6FD6C4',1],['◆','23-Day Streak','#9D8CFF',1],['▲','Trendsetter','#F2C14E',1],['✦','Q&A Regular','#8A889C',0],['❖','Century Club','#8A889C',0]].map(([icon, label, color, got]) => ({ icon, label, color, style: got ? 'background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:#F2F0EA' : 'border:1px dashed rgba(255,255,255,.16);color:#8A889C' })),
      challenges: [
        { id:'a', when:'WEEK 3 OF 12', color:'#6FD6C4', people:'3,402 JOINED', title:'#12BooksAway', desc:'Twelve books set in places you have never been. You have read 4.', pct:33 },
        { id:'b', when:'DECEMBER', color:'#F5B94A', people:'1,180 JOINED', title:'Read the author, then the book', desc:'Follow one author’s daily stories for 30 days, then read the book they became.', pct:0 },
        { id:'c', when:'WEEKEND SPRINT', color:'#C9BFFF', people:'612 JOINED', title:'Poetry in one sitting', desc:'Finish a poetry collection between Friday and Sunday night.', pct:0 }
      ].map((c) => ({ ...c, pick: () => this.setState({ joined: { ...J, [c.id]: !J[c.id] } }), label: J[c.id] ? 'Joined ✓' : 'Join challenge', style: J[c.id] ? 'background:transparent;color:' + c.color + ';border:1px solid ' + c.color : 'background:#F2F0EA;color:#0A0A10;border:1px solid #F2F0EA' }))
    };
  }
}
