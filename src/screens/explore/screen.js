import { ViewModel } from '../../runtime.js';

// 3D Library screen: state, data and every interaction on this page.
export default class LibraryScreen extends ViewModel {
  bindings() {
    const s = this.state;
    const B = {
      carto:{title:'The Cartographer of Silence',short:'OKAFOR',author:'Mira Okafor',genre:'LITERARY SCI-FI',cat:'Speculative',bg:'#123B3A',accent:'#F5B94A',ink:'#F4EBD7',spine:'#0B2726',shape:'width:80%;height:54%;border-radius:50%;top:-10%;right:-24%',rating:'4.8',reading:'18.2k',blurb:'A mapmaker charts a city where sound is rationed, and finds the one street that was never meant to be quiet.',why:'you slowed down on every passage about memory in your last three books.'},
      salt:{title:'Salt & Static',short:'RAMAN',author:'Dev Raman',genre:'THRILLER',cat:'Thriller',bg:'#E9E1D3',accent:'#D9472B',ink:'#1A1714',spine:'#B9AE9A',shape:'width:100%;height:6%;left:0;top:58%',rating:'4.6',reading:'24.9k',blurb:'A lighthouse radio starts reading out the names of people who will vanish next. The keeper hears her own.',why:'you finish short-chapter thrillers in two nights.'},
      orchard:{title:'Orchard of Small Gods',short:'VARGA',author:'Lena Varga',genre:'FANTASY',cat:'Speculative',bg:'#2A1A3F',accent:'#C9A7FF',ink:'#F1E9FF',spine:'#1B102A',shape:'width:84%;height:60%;border-radius:999px 999px 0 0;left:8%;bottom:0',rating:'4.7',reading:'11.3k',blurb:'Every tree in the orchard shelters a god no larger than a thumb. One of them has stopped answering prayers.',why:'mythic worlds with slow reveals, like your last three five-star reads.'},
      km:{title:'Kilometre Zero',short:'MEHTA',author:'Arjun Mehta',genre:'MEMOIR',cat:'Life',bg:'#C5532E',accent:'#F7D9A8',ink:'#FFF4E4',spine:'#8F3A1F',shape:'width:44%;height:30%;border-radius:50%;left:28%;top:34%',rating:'4.5',reading:'8.7k',blurb:'Nine thousand kilometres by bus from Kanyakumari to Istanbul, and the strangers who kept him going.',why:'it is the most-picked book in your #12BooksAway challenge.'},
      weight:{title:'The Weight of Light',short:'ISHIDA',author:'Hana Ishida',genre:'LITERARY',cat:'Literary',bg:'#0F1A33',accent:'#8FB8FF',ink:'#E8EEFF',spine:'#08101F',shape:'width:2px;height:70%;left:62%;top:15%',rating:'4.9',reading:'31.0k',blurb:'Two sisters inherit a darkroom in Kyoto, and the photographs their mother never developed.',why:'Kabir, whose taste matches yours 91%, gave it five stars.'},
      glass:{title:'Glasshouse Protocol',short:'BRANDT',author:'Theo Brandt',genre:'TECHNO-THRILLER',cat:'Thriller',bg:'#1E2A22',accent:'#B7F36B',ink:'#EAF7DA',spine:'#121A15',shape:'width:60%;height:40%;border:2px solid #B7F36B;background:transparent;left:20%;top:26%;transform:rotate(45deg)',rating:'4.4',reading:'9.9k',blurb:'A heist inside a city governed by its own weather model. To get out, the crew has to make it rain.',why:'it has the pace of Salt & Static, which you finished in two nights.'},
      moons:{title:'Paper Moons Over Pune',short:'KULKARNI',author:'Sana Kulkarni',genre:'MAGICAL REALISM',cat:'Literary',bg:'#F2C14E',accent:'#23324D',ink:'#23324D',spine:'#C99A2E',shape:'width:46%;height:31%;border-radius:50%;right:10%;top:12%',rating:'4.7',reading:'6.4k',blurb:'A grandmother keeps the moon in a steel tiffin box. Her granddaughter opens it during the monsoon.',why:'it is set in Pune, and you saved three monsoon stories this week.'},
      field:{title:'Fieldnotes for the End of Summer',short:'CALLOWAY',author:'Iris Calloway',genre:'POETRY',cat:'Life',bg:'#D8C7E8',accent:'#5B3E7A',ink:'#2B1D3A',spine:'#A894BE',shape:'width:120%;height:120%;border-radius:50%;left:-60%;bottom:-70%',rating:'4.6',reading:'5.1k',blurb:'Forty-four short poems written in the last week of August, one for each hour the light allowed.',why:'short enough for the 20 minutes you read before bed.'}
    };
    const keys = Object.keys(B);
    const CATS = ['All shelves','Literary','Speculative','Thriller','Life'];
    const cat = s.cat || 'All shelves';
    const list = keys.filter((k) => cat === 'All shelves' || B[k].cat === cat);
    const sel = list.indexOf(s.sel) > -1 ? s.sel : list[0];
    const W = { carto:48, salt:40, orchard:56, km:38, weight:44, glass:50, moons:36, field:30 };
    const H = { carto:280, salt:256, orchard:290, km:248, weight:270, glass:262, moons:244, field:236 };
    const vt = (fn) => { if (document.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) { document.startViewTransition(() => new Promise((r) => { fn(); setTimeout(r, 40); })); } else fn(); };
    const spine = (k) => ({ ...B[k], w: W[k], h: H[k], on: k === sel ? 'true' : 'false', vt: k === sel ? 'none' : 'bk-' + k, sel: k === sel ? 'opacity:.18;filter:grayscale(1)' : '', pick: () => vt(() => this.setState({ sel: k, flip: !(this.state).flip })) });
    const half = Math.ceil(list.length / 2);
    const rows = list.length > 4 ? [list.slice(0, half), list.slice(half)] : [list];
    const sv = s.saved || {};
    return {
      cats: CATS.map((c) => ({ label: c, on: c === cat ? 'true' : 'false', pick: () => vt(() => this.setState({ cat: c })), style: c === cat ? 'background:#F2F0EA;color:#0A0A10;border:1px solid #F2F0EA' : 'background:rgba(255,255,255,.04);color:#D6D4E0;border:1px solid rgba(255,255,255,.14)' })),
      shelves: rows.map((r, i) => ({ label: rows.length > 1 ? (i === 0 ? 'UPPER SHELF' : 'LOWER SHELF') : cat.toUpperCase(), books: r.map(spine) })),
      cur: { ...B[sel], caps: B[sel].author.toUpperCase() }, curVt: 'bk-' + sel,
      inName: s.flip ? 'in' : 'rv',
      tilt: (e) => { const t = e.currentTarget, r = t.getBoundingClientRect(); t.style.setProperty('--rx', (4 + (0.5 - (e.clientY - r.top) / r.height) * 6).toFixed(2) + 'deg'); t.style.setProperty('--ry', (((e.clientX - r.left) / r.width - 0.5) * 10).toFixed(2) + 'deg'); },
      untilt: (e) => { e.currentTarget.style.setProperty('--rx', '4deg'); e.currentTarget.style.setProperty('--ry', '0deg'); },
      magnet: (e) => { const t = e.currentTarget, r = t.getBoundingClientRect(); t.style.setProperty('--mx', ((e.clientX - r.left - r.width / 2) * 0.28).toFixed(1) + 'px'); t.style.setProperty('--my', ((e.clientY - r.top - r.height / 2) * 0.35).toFixed(1) + 'px'); },
      unmagnet: (e) => { e.currentTarget.style.setProperty('--mx', '0px'); e.currentTarget.style.setProperty('--my', '0px'); },
      savedOn: sv[sel] ? 'true' : 'false', saveLabel: sv[sel] ? 'On your shelf ✓' : 'Add to my shelf',
      toggleSave: () => this.setState({ saved: { ...sv, [sel]: !sv[sel] } }),
      collections: [
        { kicker:"EDITOR'S PICKS · NOVEMBER", color:'#F5B94A', title:'Books that rearrange time', desc:'Looping, reversed and braided stories, chosen by the Folio editors.', a:B.glass, b:B.weight, c:B.carto },
        { kicker:'NEW THIS MONTH', color:'#6FD6C4', title:'Out in November', desc:'Launch-week Q&As already scheduled in the community.', a:B.km, b:B.field, c:B.salt },
        { kicker:'COMPANION · BUILT FOR YOU', color:'#C9BFFF', title:'Salt-air mysteries', desc:'Four books set beside the sea; two by authors you follow.', a:B.salt, b:B.km, c:B.moons }
      ]
    };
  }
}
