import { ViewModel } from '../../runtime.js';

// The Reading Room screen: state, data and every interaction on this page.
export default class ReadingRoomScreen extends ViewModel {
  destroy() { if (this._t) clearTimeout(this._t); }
  bindings() {
    const s = this.state;
    const B = {
      carto:{title:'The Cartographer of Silence',author:'Mira Okafor',genre:'LITERARY SCI-FI',bg:'#123B3A',accent:'#F5B94A',ink:'#F4EBD7',spine:'#0B2726',shape:'width:80%;height:54%;border-radius:50%;top:-10%;right:-24%',rating:'4.8',reading:'18.2k'},
      salt:{title:'Salt & Static',author:'Dev Raman',genre:'THRILLER',bg:'#E9E1D3',accent:'#D9472B',ink:'#1A1714',spine:'#B9AE9A',shape:'width:100%;height:6%;left:0;top:58%',rating:'4.6',reading:'24.9k'},
      orchard:{title:'Orchard of Small Gods',author:'Lena Varga',genre:'FANTASY',bg:'#2A1A3F',accent:'#C9A7FF',ink:'#F1E9FF',spine:'#1B102A',shape:'width:84%;height:60%;border-radius:999px 999px 0 0;left:8%;bottom:0',rating:'4.7',reading:'11.3k'},
      km:{title:'Kilometre Zero',author:'Arjun Mehta',genre:'MEMOIR · TRAVEL',bg:'#C5532E',accent:'#F7D9A8',ink:'#FFF4E4',spine:'#8F3A1F',shape:'width:44%;height:30%;border-radius:50%;left:28%;top:34%',rating:'4.5',reading:'8.7k'},
      weight:{title:'The Weight of Light',author:'Hana Ishida',genre:'LITERARY',bg:'#0F1A33',accent:'#8FB8FF',ink:'#E8EEFF',spine:'#08101F',shape:'width:2px;height:70%;left:62%;top:15%',rating:'4.9',reading:'31.0k'},
      glass:{title:'Glasshouse Protocol',author:'Theo Brandt',genre:'TECHNO-THRILLER',bg:'#1E2A22',accent:'#B7F36B',ink:'#EAF7DA',spine:'#121A15',shape:'width:60%;height:40%;border:2px solid #B7F36B;background:transparent;left:20%;top:26%;transform:rotate(45deg)',rating:'4.4',reading:'9.9k'},
      moons:{title:'Paper Moons Over Pune',author:'Sana Kulkarni',genre:'MAGICAL REALISM',bg:'#F2C14E',accent:'#23324D',ink:'#23324D',spine:'#C99A2E',shape:'width:46%;height:31%;border-radius:50%;right:10%;top:12%',rating:'4.7',reading:'6.4k'},
      field:{title:'Fieldnotes for the End of Summer',author:'Iris Calloway',genre:'POETRY',bg:'#D8C7E8',accent:'#5B3E7A',ink:'#2B1D3A',spine:'#A894BE',shape:'width:120%;height:120%;border-radius:50%;left:-60%;bottom:-70%',rating:'4.6',reading:'5.1k'}
    };
    const M = {
      'Mind-bending':[['carto',97,'you highlight sentences about memory more than anything else.'],['glass',93,'readers who finished Cartographer rated it 4.9.'],['orchard',88,'you like reveals that arrive slowly.']],
      'Warm':[['moons',96,'you saved three monsoon stories this week.'],['field',90,'it fits the 20 minutes you usually read before bed.'],['km',85,'you are on a #12BooksAway streak.']],
      'A good cry':[['weight',98,'you re-read sad endings twice.'],['field',91,'grief, written as a summer that will not end.'],['carto',86,'the last map will undo you.']],
      'One more chapter':[['salt',97,'you finish short-chapter thrillers in two nights.'],['glass',92,'it never slows down.'],['km',84,'every chapter ends at a border.']]
    };
    const mood = s.mood || 'Mind-bending';
    const thinking = !!s.thinking;
    const scrollCor = (e, dir) => { const sec = e.currentTarget.closest('section'); const c = sec && sec.querySelector('[data-cor]'); if (c) c.scrollBy({ left: dir * 248, behavior: 'smooth' }); };
    return {
      tilt: (e) => { const t = e.currentTarget, r = t.getBoundingClientRect(); t.style.setProperty('--rx', ((0.5 - (e.clientY - r.top) / r.height) * 8).toFixed(2) + 'deg'); t.style.setProperty('--ry', (((e.clientX - r.left) / r.width - 0.5) * 12).toFixed(2) + 'deg'); },
      untilt: (e) => { e.currentTarget.style.setProperty('--rx', '0deg'); e.currentTarget.style.setProperty('--ry', '0deg'); },
      magnet: (e) => { const t = e.currentTarget, r = t.getBoundingClientRect(); t.style.setProperty('--mx', ((e.clientX - r.left - r.width / 2) * 0.28).toFixed(1) + 'px'); t.style.setProperty('--my', ((e.clientY - r.top - r.height / 2) * 0.35).toFixed(1) + 'px'); },
      unmagnet: (e) => { e.currentTarget.style.setProperty('--mx', '0px'); e.currentTarget.style.setProperty('--my', '0px'); },
      corPrev: (e) => scrollCor(e, -1), corNext: (e) => scrollCor(e, 1),
      corridor: ['weight','salt','carto','orchard','moons','glass','km','field'].map((k, i) => ({ ...B[k], rank: i + 1 })),
      journey: [
        { n:'1', cls:'n1', kicker:'7:02 A.M. · STORY · #SALTDIARIES DAY 42', text:'“The keeper tried to switch the radio off. It said it had a few more names to read.”', meta:'Dev Raman · 1,840 likes · 214 replies', href:'#/feed' },
        { n:'2', cls:'n2', kicker:'WEDNESDAY · CHAPTER DRAFT', text:'Readers asked whose names. The AI desk grouped 214 replies into three theories.', meta:'Turned into chapter 4 in the author dashboard', href:'#/studio' },
        { n:'3', cls:'n3', kicker:'FRIDAY · IN THE BOOK', text:'Salt & Static, chapter 4: “The List”. 24,900 readers now.', meta:'★ 4.6 · live Q&A tonight', href:'#/book' }
      ],
      moods: Object.keys(M).map((k) => ({ label: k, on: k === mood ? 'true' : 'false', pick: () => { if (k === mood) return; this.setState({ mood: k, thinking: true }); if (this._t) clearTimeout(this._t); this._t = setTimeout(() => this.setState({ thinking: false, gen: ((this.state).gen || 0) + 1 }), 900); }, style: k === mood ? 'background:#F2F0EA;color:#0A0A10;border:1px solid #F2F0EA' : 'background:rgba(255,255,255,.04);color:#D6D4E0;border:1px solid rgba(255,255,255,.14)' })),
      thinking, showPicks: !thinking,
      picks: M[mood].map(([k, match, why], i) => ({ b: B[k], match, why, d: (i * 0.08) + 's' })),
      authors: [['Mira Okafor','MO','#F5B94A','Literary sci-fi · 48.2k followers','94'],['Dev Raman','DR','#9D8CFF','Thrillers · 41.7k followers','91'],['Hana Ishida','HI','#6FD6C4','Literary · 63.0k followers','88'],['Sana Kulkarni','SK','#F2C14E','Magical realism · 12.9k followers','85']].map(([name, initials, color, meta, score]) => ({ name, initials, color, meta, score }))
    };
  }
}
