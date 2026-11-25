import { ViewModel } from '../../runtime.js';

// Author screen: state, data and every interaction on this page.
export default class AuthorScreen extends ViewModel {
  bindings() {
    const s = this.state;
    const px = s.px ?? 0, py = s.py ?? 0;
    const f = !!s.follow, n = !!s.notify;
    const dotOn = 'background:#F5B94A;box-shadow:0 0 0 4px rgba(245,185,74,.2)', dotOff = 'background:#06060B;border:2px solid rgba(255,255,255,.3)';
    return {
      x1: (px * -12).toFixed(1), y1: (py * -8).toFixed(1), x2: (px * 24).toFixed(1), y2: (py * 14).toFixed(1), x3: (px * 44).toFixed(1), y3: (py * 26).toFixed(1),
      onMove: (e) => { const t = e.currentTarget.getBoundingClientRect(); this.setState({ px: (e.clientX - t.left) / t.width - 0.5, py: (e.clientY - t.top) / t.height - 0.5 }); },
      onLeave: () => this.setState({ px: 0, py: 0 }),
      toggleFollow: () => this.setState({ follow: !f }),
      followLabel: f ? 'Following ✓' : 'Follow',
      followStyle: f ? 'background:transparent;color:#F5B94A;border:1px solid #F5B94A' : 'background:#F5B94A;color:#120D04;border:1px solid #F5B94A',
      followers: f ? '48,213' : '48,212',
      toggleNotify: () => this.setState({ notify: !n }),
      notifyLabel: n ? 'You’re on the waitlist ✓' : 'Notify me at launch',
      notifyStyle: n ? 'background:rgba(245,185,74,.18);color:#F5B94A' : 'background:#F5B94A;color:#120D04',
      score: [
        { label:'Reader engagement', v:96, color:'#F5B94A' },
        { label:'Feedback sentiment', v:92, color:'#6FD6C4' },
        { label:'Content quality', v:95, color:'#9D8CFF' },
        { label:'Community contribution', v:91, color:'#E9E1D3' }
      ],
      logs: [
        { when:'TODAY · 07:02 · FIELD LOG #412', badge:'NEW', badgeColor:'#F5B94A', text:'The lamplighter counts in threes: one for the light, one for the dark, one for whoever is walking between them.', likes:'1.2k', replies:'94', ai:'AI: 3 readers asked for a sequel thread', dot:dotOn },
        { when:'YESTERDAY · FIELD LOG #411', badge:'→ THE LANTERN CENSUS · CH. 3', badgeColor:'#C9BFFF', text:'Every census misses someone. This one missed a whole street, and the street noticed.', likes:'3.4k', replies:'287', ai:'Became a chapter draft', dot:dotOn },
        { when:'12 NOV · FIELD LOG #398', badge:'READER-SHAPED', badgeColor:'#6FD6C4', text:'You asked what the Bureau of Sound eats for lunch. The answer: other people’s small talk, lightly salted.', likes:'5.1k', replies:'612', ai:'Written from your comments', dot:dotOff },
        { when:'2023 · FIELD LOG #007', badge:'→ CARTOGRAPHER · CH. 9', badgeColor:'#C9BFFF', text:'Every map lies about one thing. Mine lies about where the silence begins.', likes:'12.8k', replies:'1,402', ai:'The story that started it all', dot:dotOff }
      ]
    };
  }
}
