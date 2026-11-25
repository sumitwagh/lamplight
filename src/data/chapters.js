// Preview pages for the in-browser reader. Cartographer has a full chapter; other books get a
// short preview (dedication, title page, opening, preview-ends page).
import { BOOK, AUTHORS } from './books.js';

const CARTO = [
  { kind: 'dedication', text: 'for the ones who listen' },
  { kind: 'title', kicker: 'I.', title: 'Vell', sub: 'the quiet city' },
  { kind: 'text', folio: 1, paras: [
    [['In the city of Vell, silence was sold by the gram.', 'LH'], ' My mother bought it for funerals, folded into paper like salt. ', ['I stole it for maps.', 'KS']],
    ['The first street I charted had no name, ', ['only a hush that followed you home and sat at the foot of your bed.', 'MO'], ' I drew it in pencil, so the Bureau could not hear me.'],
    [['By morning, the street had moved two blocks east.', 'NL']],
  ] },
  { kind: 'text', folio: 2, paras: [
    ['Nobody in Vell talks about the Bureau of Sound, which is the point. Its clerks wear felt shoes. Its doors close with a sigh you have to pay for.'],
    ['They ration quiet the way other cities ration water: so much per household, more for the grieving, none at all for the curious.'],
    ['My mother was a careful woman. She kept our allowance in a tin under the stairs and spent it only when somebody died.'],
  ] },
  { kind: 'text', folio: 3, paras: [
    ['I was eleven when I learned to steal it. You hold your breath at the edge of a funeral and let the silence settle into your coat like snow.'],
    ['At home I shook it out over paper. Where it landed, the streets drew themselves — faint, the colour of pencil, and absolutely still.'],
    [['A map is just a list of places that agreed to stay put.', 'LH'], ' Mine did not.'],
  ] },
  { kind: 'text', folio: 4, paras: [
    ['The nameless street moved again on Thursday. Then on Friday. By Sunday it was outside the Bureau itself, humming very softly to itself.'],
    ['I went to see it. Of course I did. Nobody can draw a thing for that long without wanting to walk down it.'],
    ['It was empty, and it was listening.'],
  ] },
  { kind: 'text', folio: 5, paras: [
    ['“You shouldn’t be here,” said a clerk in felt shoes, who was also there.'],
    ['“Neither should the street,” I said.'],
    [['He looked at my pencil the way people look at a lit match in a library.', 'KS']],
  ] },
  { kind: 'end', title: 'End of the preview', sub: 'Chapter two is 31 pages. 18,204 people are reading it tonight.' },
];

export function pagesFor(id) {
  if (id === 'carto') return CARTO;
  const b = BOOK[id] || BOOK.carto;
  const words = `${b.blurb} The first readers met this story one post at a time, and some of them are in the margins now.`;
  return [
    { kind: 'dedication', text: 'for everyone who read it first, one day at a time' },
    { kind: 'title', kicker: 'I.', title: b.title.split(' ').slice(0, 3).join(' '), sub: b.genre.toLowerCase() },
    { kind: 'text', folio: 1, paras: [[[b.hook, 'LH']], [words], [`— from ${b.author}’s field logs, day one`]] },
    { kind: 'end', title: b.upcoming ? 'Coming spring 2027' : 'End of the preview', sub: b.upcoming ? `${b.threads} field logs are already open to read.` : `${(b.reading || 0).toLocaleString('en-US')} people are reading it tonight.` },
  ];
}

export const NOTE_PEOPLE = {
  LH: { who: 'Leila H.', color: '#6FD6C4', note: 'The first line I ever screenshotted from a book.', count: 412 },
  KS: { who: 'Kabir S.', color: '#9D8CFF', note: 'This whole book in one image.', count: 188 },
  MO: { who: 'Mira Okafor', color: '#F5B94A', note: 'Author note: this street is real. It’s in Lisbon.', count: 96, author: true },
  NL: { who: 'Nora L.', color: '#E9E1D3', note: 'Reading this at 2 a.m. was a mistake. A good one.', count: 61 },
};

export function summaries(b) {
  if (b.id === 'carto') return {
    'No spoilers': 'A mapmaker in a city where silence is rationed sets out to chart the one street nobody can name. Quiet, aching and strange — readers compare it to walking through a dream you half remember.',
    'Up to ch. 9': 'Ada learns her mother didn’t buy silence for funerals — she sold it. The unnamed street appears only on maps Ada draws while grieving, and the Bureau of Sound wants every copy.',
    'Full book': 'The street is a map of Ada’s own memory. In the final chapter she trades her voice to keep it on the city’s charts — the community is split on whether that is a sacrifice or a release.',
  };
  return {
    'No spoilers': b.blurb + ' Readers describe it as hard to put down and easy to talk about.',
    'Up to ch. 9': `By the middle of the book, the premise turns on its narrator: what looked like ${b.genre.toLowerCase()} becomes a story about who gets to be remembered.`,
    'Full book': `The ending reframes the first line — “${b.hook}” — and the community is still arguing about whether it was a promise or a warning.`,
  };
}

export const authorOf = (b) => AUTHORS[b.authorId] || AUTHORS.okafor;
