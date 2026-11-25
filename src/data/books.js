// Sample catalogue shared by every screen. All books, authors and numbers are fictional.
// Each cover is described by colours + a "motif"; src/lib/covers.js paints it for both
// the DOM (CSS) and WebGL (canvas texture), so a book looks the same everywhere.

export const AUTHORS = {
  okafor: { id: 'okafor', name: 'Mira Okafor', initials: 'MO', color: '#F5B94A', city: 'Lagos → Lisbon', genre: 'Literary sci-fi', followers: 48200, influence: 94, books: 3, streak: 412, bio: 'Former urban planner. Posts a 40-word “field log” every morning; readers vote on which ones become chapters.' },
  raman: { id: 'raman', name: 'Dev Raman', initials: 'DR', color: '#9D8CFF', city: 'Kochi', genre: 'Thrillers', followers: 41700, influence: 91, books: 5, streak: 208, bio: 'Ex-radio engineer. #SaltDiaries started as a joke on day one and is now a 24,900-reader serial.' },
  ishida: { id: 'ishida', name: 'Hana Ishida', initials: 'HI', color: '#6FD6C4', city: 'Kyoto', genre: 'Literary', followers: 63000, influence: 88, books: 4, streak: 96, bio: 'Writes about light, grief and small rooms. Her readers translate every chapter into 11 languages.' },
  kulkarni: { id: 'kulkarni', name: 'Sana Kulkarni', initials: 'SK', color: '#F2C14E', city: 'Pune', genre: 'Magical realism', followers: 12900, influence: 85, books: 2, streak: 133, bio: 'Monsoon stories from a Pune balcony. Debut grew out of 300 daily stories.' },
  varga: { id: 'varga', name: 'Lena Varga', initials: 'LV', color: '#C9A7FF', city: 'Budapest', genre: 'Fantasy', followers: 22400, influence: 83, books: 3, streak: 54, bio: 'Builds worlds in public — maps, myths and a reader-voted pantheon.' },
  brandt: { id: 'brandt', name: 'Theo Brandt', initials: 'TB', color: '#B7F36B', city: 'Berlin', genre: 'Techno-thriller', followers: 18800, influence: 80, books: 2, streak: 71, bio: 'Security researcher turned novelist. Every chapter ends with a puzzle readers solve in the forum.' },
  mehta: { id: 'mehta', name: 'Arjun Mehta', initials: 'AM', color: '#F7D9A8', city: 'Leh', genre: 'Memoir · travel', followers: 9700, influence: 78, books: 1, streak: 188, bio: 'Walked from Kanyakumari to Leh and posted a page a day.' },
  calloway: { id: 'calloway', name: 'Iris Calloway', initials: 'IC', color: '#D8C7E8', city: 'Galway', genre: 'Poetry', followers: 7400, influence: 76, books: 2, streak: 365, bio: 'One poem a day for a year. Readers chose the 60 that became the book.' },
};

const B = (id, title, authorId, genre, cover, stats, extra) => ({ id, title, authorId, author: AUTHORS[authorId]?.name ?? authorId, genre, ...cover, ...stats, ...extra });

export const BOOKS = [
  B('carto', 'The Cartographer of Silence', 'okafor', 'Literary sci-fi', { bg: '#123B3A', accent: '#F5B94A', ink: '#F4EBD7', spine: '#0B2726', motif: 'sun' }, { rating: 4.8, ratings: 9412, reading: 18200, pages: 384, year: 2026, threads: 412 }, { moods: ['Mind-bending', 'A good cry'], hook: 'In the city of Vell, silence was sold by the gram.', blurb: 'A mapmaker charts a city where sound is rationed — and finds the one street that was never meant to be quiet.' }),
  B('salt', 'Salt & Static', 'raman', 'Thriller', { bg: '#E9E1D3', accent: '#D9472B', ink: '#1A1714', spine: '#B9AE9A', motif: 'band' }, { rating: 4.6, ratings: 12880, reading: 24900, pages: 296, year: 2026, threads: 214 }, { moods: ['One more chapter'], hook: 'The lighthouse radio read names nobody had given it.', blurb: 'A lighthouse keeper’s radio starts reading out the names of people who haven’t drowned yet.' }),
  B('orchard', 'Orchard of Small Gods', 'varga', 'Fantasy', { bg: '#2A1A3F', accent: '#C9A7FF', ink: '#F1E9FF', spine: '#1B102A', motif: 'arch' }, { rating: 4.7, ratings: 6110, reading: 11300, pages: 512, year: 2025, threads: 166 }, { moods: ['Mind-bending', 'Warm'], hook: 'Every tree in the orchard was somebody’s prayer.', blurb: 'An orchard where every tree is a minor god, and one of them has stopped answering.' }),
  B('km', 'Kilometre Zero', 'mehta', 'Memoir · travel', { bg: '#C5532E', accent: '#F7D9A8', ink: '#FFF4E4', spine: '#8F3A1F', motif: 'disc' }, { rating: 4.5, ratings: 3204, reading: 8700, pages: 248, year: 2025, threads: 58 }, { moods: ['Warm', 'One more chapter'], hook: 'The road began where the ocean gave up.', blurb: '3,700 km on foot, one page a day, and the strangers who walked a little of it with him.' }),
  B('weight', 'The Weight of Light', 'ishida', 'Literary', { bg: '#0F1A33', accent: '#8FB8FF', ink: '#E8EEFF', spine: '#08101F', motif: 'line' }, { rating: 4.9, ratings: 21040, reading: 31000, pages: 320, year: 2026, threads: 503 }, { moods: ['A good cry'], hook: 'My father measured light for a living. He died in the dark.', blurb: 'A daughter inherits her father’s photometers and a list of rooms he never finished measuring.' }),
  B('glass', 'Glasshouse Protocol', 'brandt', 'Techno-thriller', { bg: '#1E2A22', accent: '#B7F36B', ink: '#EAF7DA', spine: '#121A15', motif: 'diamond' }, { rating: 4.4, ratings: 4421, reading: 9900, pages: 352, year: 2026, threads: 131 }, { moods: ['Mind-bending', 'One more chapter'], hook: 'The building was transparent. The people inside were not.', blurb: 'A smart greenhouse starts negotiating with the city — and it is very good at it.' }),
  B('moons', 'Paper Moons Over Pune', 'kulkarni', 'Magical realism', { bg: '#F2C14E', accent: '#23324D', ink: '#23324D', spine: '#C99A2E', motif: 'moon' }, { rating: 4.7, ratings: 2980, reading: 6400, pages: 224, year: 2026, threads: 77 }, { moods: ['Warm'], hook: 'Every monsoon, my grandmother folded a new moon.', blurb: 'A grandmother’s paper moons start appearing in the real sky over Pune.' }),
  B('field', 'Fieldnotes for the End of Summer', 'calloway', 'Poetry', { bg: '#D8C7E8', accent: '#5B3E7A', ink: '#2B1D3A', spine: '#A894BE', motif: 'tide' }, { rating: 4.6, ratings: 1710, reading: 5100, pages: 112, year: 2025, threads: 40 }, { moods: ['A good cry', 'Warm'], hook: 'August keeps a list of everything it will lose.', blurb: 'Sixty poems about a summer that refuses to end, chosen by the readers who lived through it.' }),
  B('tide', 'The Tidewright', 'varga', 'Fantasy', { bg: '#0D3B4C', accent: '#7FE3D8', ink: '#E4FBF7', spine: '#082833', motif: 'tide' }, { rating: 4.5, ratings: 3870, reading: 7200, pages: 448, year: 2024, threads: 92 }, { moods: ['Mind-bending'], hook: 'She could move the sea, but only backwards.', blurb: 'A girl who can reverse tides is hired to undo a flood that already happened.' }),
  B('nine', 'Nine Rooms in Kyoto', 'ishida', 'Literary', { bg: '#EFE6D8', accent: '#B5412E', ink: '#2A211B', spine: '#C8BCA8', motif: 'grid' }, { rating: 4.7, ratings: 8820, reading: 12600, pages: 272, year: 2024, threads: 188 }, { moods: ['Warm', 'A good cry'], hook: 'The first room had only a window and a promise.', blurb: 'Nine rented rooms, nine years, one woman learning how to stay.' }),
  B('frequency', 'Dead Frequency', 'raman', 'Thriller', { bg: '#14141A', accent: '#FF5A3C', ink: '#F4F0EA', spine: '#0A0A0E', motif: 'rings' }, { rating: 4.3, ratings: 5560, reading: 10100, pages: 304, year: 2024, threads: 97 }, { moods: ['One more chapter'], hook: 'At 3:12 a.m. the station played a song from next week.', blurb: 'A pirate radio station broadcasts tomorrow’s news, and someone wants it off the air.' }),
  B('atlas', 'Atlas of Unbuilt Cities', 'okafor', 'Essays', { bg: '#F4EDE0', accent: '#123B3A', ink: '#1C2523', spine: '#D7CDB9', motif: 'grid' }, { rating: 4.6, ratings: 2210, reading: 4300, pages: 196, year: 2023, threads: 44 }, { moods: ['Mind-bending'], hook: 'Every city is a draft of a better one.', blurb: 'Essays on the cities we planned and never built, and what they say about us.' }),
  B('orbit', 'Small Orbit', 'brandt', 'Sci-fi', { bg: '#20103A', accent: '#FF9DE2', ink: '#FBEFFF', spine: '#140A26', motif: 'rings' }, { rating: 4.2, ratings: 1960, reading: 3900, pages: 288, year: 2025, threads: 35 }, { moods: ['Mind-bending', 'One more chapter'], hook: 'The station was small enough to love.', blurb: 'Six people, one leaking station, and an AI that keeps writing them poems.' }),
  B('monsoon', 'Monsoon Ledger', 'kulkarni', 'Magical realism', { bg: '#1F4B3A', accent: '#F2C14E', ink: '#F3F7EE', spine: '#143329', motif: 'line' }, { rating: 4.5, ratings: 1430, reading: 2800, pages: 208, year: 2024, threads: 29 }, { moods: ['Warm'], hook: 'Rain kept its own accounts in our house.', blurb: 'A family ledger that records every rainfall — and every debt the rain still owes.' }),
  B('ember', 'Ember Psalms', 'calloway', 'Poetry', { bg: '#3A1410', accent: '#FFB067', ink: '#FFEBD8', spine: '#260B08', motif: 'sun' }, { rating: 4.4, ratings: 990, reading: 2100, pages: 96, year: 2024, threads: 18 }, { moods: ['A good cry'], hook: 'Keep the fire small enough to carry.', blurb: 'Poems written by firelight during a winter without power.' }),
  B('wander', 'The Last Wanderer of Leh', 'mehta', 'Travel', { bg: '#DDE7EE', accent: '#2E5C8A', ink: '#162433', spine: '#B6C5D1', motif: 'arch' }, { rating: 4.3, ratings: 860, reading: 1900, pages: 232, year: 2026, threads: 21 }, { moods: ['Warm', 'One more chapter'], hook: 'Above 4,000 metres, everyone tells the truth.', blurb: 'A road-trip novel set on the highest passes in the world.' }),
  B('cipher', 'Cipher Garden', 'brandt', 'Mystery', { bg: '#0F2A1E', accent: '#E8D36B', ink: '#F2F6E9', spine: '#0A1C14', motif: 'diamond' }, { rating: 4.5, ratings: 2650, reading: 5600, pages: 336, year: 2025, threads: 118 }, { moods: ['Mind-bending', 'One more chapter'], hook: 'The hedges spelled a word only from the air.', blurb: 'A botanical garden whose hedges encode a murder confession.' }),
  B('hollow', 'Hollow Bells', 'varga', 'Gothic', { bg: '#1B1B24', accent: '#D6C4A1', ink: '#EDE6D9', spine: '#111118', motif: 'arch' }, { rating: 4.4, ratings: 2010, reading: 4100, pages: 368, year: 2023, threads: 60 }, { moods: ['A good cry', 'Mind-bending'], hook: 'The bells rang for people who had not died yet.', blurb: 'A village whose bells toll a day early, and the bell-ringer who stops listening.' }),
  B('saltwind', 'Saltwind Letters', 'okafor', 'Epistolary', { bg: '#B9D3D0', accent: '#123B3A', ink: '#102422', spine: '#93B2AE', motif: 'band' }, { rating: 4.6, ratings: 1820, reading: 3500, pages: 184, year: 2025, threads: 52 }, { moods: ['Warm', 'A good cry'], hook: 'Dear stranger, the wind took your letter to me.', blurb: 'Letters between two strangers on opposite coasts, carried by the wrong wind.' }),
  B('vantage', 'Vantage', 'raman', 'Thriller', { bg: '#F0EAE0', accent: '#1F1F1F', ink: '#111', spine: '#D2CABD', motif: 'line' }, { rating: 4.2, ratings: 3300, reading: 6900, pages: 280, year: 2025, threads: 73 }, { moods: ['One more chapter'], hook: 'From the 41st floor you can see a lie.', blurb: 'A window cleaner witnesses a crime that, officially, never happened.' }),
  B('lanterns', 'A Thousand Lanterns', 'ishida', 'Literary', { bg: '#5A1E2E', accent: '#FFC56B', ink: '#FFF1E2', spine: '#3E1420', motif: 'disc' }, { rating: 4.8, ratings: 7020, reading: 9800, pages: 296, year: 2025, threads: 140 }, { moods: ['A good cry', 'Warm'], hook: 'We lit one for every name we were afraid to say.', blurb: 'A festival of lanterns, a family of secrets, and one lantern that will not light.' }),
  B('drift', 'Continental Drift', 'mehta', 'Essays', { bg: '#2C2A26', accent: '#E0A458', ink: '#F4EEE4', spine: '#1E1C19', motif: 'tide' }, { rating: 4.1, ratings: 640, reading: 1300, pages: 168, year: 2023, threads: 12 }, { moods: ['Warm'], hook: 'Every border is moving, just slowly.', blurb: 'Short essays about borders, crossings and the people who keep moving.' }),
  B('glow', 'Glowworm Arithmetic', 'calloway', 'Poetry', { bg: '#0E2230', accent: '#C6F36B', ink: '#E9F6FF', spine: '#08161F', motif: 'moon' }, { rating: 4.5, ratings: 720, reading: 1600, pages: 88, year: 2026, threads: 15 }, { moods: ['Warm', 'Mind-bending'], hook: 'Count the lights; one of them is counting you.', blurb: 'Poems about counting, caves and things that glow in the dark.' }),
  B('cartel', 'The Quiet Cartel', 'okafor', 'Literary sci-fi', { bg: '#2B2F3A', accent: '#F5B94A', ink: '#F0ECE3', spine: '#1D2029', motif: 'rings' }, { rating: 4.7, ratings: 0, reading: 0, pages: 0, year: 2027, threads: 210 }, { moods: ['Mind-bending'], hook: 'Coming spring 2027 — the sequel to Cartographer.', blurb: 'The Bureau of Sound wants its silence back. Pre-order and read the field logs that are becoming it.', upcoming: true }),
];

export const BOOK = Object.fromEntries(BOOKS.map((b) => [b.id, b]));

export const GENRES = ['All', 'Literary', 'Fantasy', 'Thriller', 'Sci-fi', 'Poetry', 'Memoir & travel'];
export const MOODS = ['Mind-bending', 'Warm', 'A good cry', 'One more chapter'];

export const genreOf = (b) => {
  const g = b.genre.toLowerCase();
  if (g.includes('sci-fi')) return 'Sci-fi';
  if (g.includes('fantasy') || g.includes('gothic')) return 'Fantasy';
  if (g.includes('thriller') || g.includes('mystery')) return 'Thriller';
  if (g.includes('poetry')) return 'Poetry';
  if (g.includes('memoir') || g.includes('travel') || g.includes('essay')) return 'Memoir & travel';
  return 'Literary';
};

export const fmt = (n) => (n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 1 : 1).replace(/\.0$/, '') + 'k' : String(n));

// Reader highlights shown in the margins of chapter one (home story + book reader).
// `lines` index into PAGE_LINES (the typeset page).
export const HIGHLIGHTS = [
  { who: 'Leila H.', initials: 'LH', color: '#6FD6C4', lines: [0, 1], count: 412, note: 'The first line I ever screenshotted from a book.' },
  { who: 'Kabir S.', initials: 'KS', color: '#9D8CFF', lines: [4], count: 188, note: 'Maps as theft. This whole book in one verb.' },
  { who: 'Mira Okafor', initials: 'MO', color: '#F5B94A', lines: [5, 6], count: 96, note: 'Author note: this street is real. It’s in Lisbon.', author: true },
  { who: 'Nora L.', initials: 'NL', color: '#E9E1D3', lines: [10, 11], count: 61, note: 'Reading this at 2 a.m. was a mistake. A good one.' },
];

// Chapter one as sentences (used by "Ask the book").
export const CHAPTER_ONE = [
  'In the city of Vell, silence was sold by the gram.',
  'My mother bought it for funerals, folded into paper like salt.',
  'I stole it for maps.',
  'The first street I charted had no name, only a hush that followed you home and sat at the foot of your bed.',
  'I drew it in pencil, so the Bureau could not hear me.',
  'By morning, the street had moved two blocks east.',
];

// The same text, typeset as lines on the printed page (3D book + reader).
export const PAGE_LINES = [
  'In the city of Vell, silence',
  'was sold by the gram. My mother',
  'bought it for funerals, folded',
  'into paper like salt.',
  'I stole it for maps.',
  'The first street I charted had',
  'no name, only a hush that followed',
  'you home and sat at the foot',
  'of your bed. I drew it in pencil,',
  'so the Bureau could not hear me.',
  'By morning, the street had moved',
  'two blocks east.',
];

export const READERS_NOW = [
  ['Lisbon', 38.72, -9.14, 412], ['Pune', 18.52, 73.86, 1840], ['Lagos', 6.52, 3.38, 960], ['Kyoto', 35.01, 135.77, 720], ['Berlin', 52.52, 13.4, 530], ['São Paulo', -23.55, -46.63, 610],
  ['New York', 40.71, -74.0, 1290], ['Nairobi', -1.29, 36.82, 300], ['Seoul', 37.57, 126.98, 880], ['Galway', 53.27, -9.05, 140], ['Mexico City', 19.43, -99.13, 470], ['Sydney', -33.87, 151.21, 390],
  ['Toronto', 43.65, -79.38, 520], ['Jakarta', -6.2, 106.85, 660], ['Cairo', 30.04, 31.24, 280], ['Reykjavík', 64.15, -21.94, 60], ['Leh', 34.15, 77.58, 44], ['Kochi', 9.93, 76.27, 350],
];
