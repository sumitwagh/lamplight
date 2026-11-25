# Lamplight

A Folio concept, the immersive 3D direction: a dark reading room
lit by a lamp that follows your cursor. One real-time WebGL book opens as you scroll, its pages
riffle, readers' highlights float out of the margins and it flies back into a 3D helix library.
Around it: an "Ask the book" companion, a live globe of readers, a story-to-chapter journey,
reading challenges, a page-turning reader with ambient sound, and the community screens.

This is one of three independent Folio concept projects, each in its own repository with its own
dependencies, configuration and deployment. Nothing is shared, so you can change it freely.

## Run it

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build in dist/
npm run preview   # serve the build locally
```

Requires Node 20 or newer.

## Structure

```
index.html                 page shell and fonts
src/
  main.js                  entry point
  router.js                hash router (#/, #/discover, #/book …) with view transitions
  routes.js                the list of screens; add new screens here
  runtime.js               tiny rendering engine (template + bindings, DOM patching)
  data/
    books.js               sample catalogue (24 books, 8 authors), highlights, readers by city
    chapters.js            reader pages, margin notes, spoiler-dial summaries
  lib/
    stage.js               three.js layer: Stage (lamp, camera), Book3D (opening, page curl), Helix, Dust
    covers.js              one cover design painted for CSS books and WebGL textures
    ui.js                  smooth scroll (Lenis), lamp cursor, preloader, reveals, ⌘K Ask Lamplight palette
    ambience.js            generated rain / fire / library sound (Web Audio, no files)
  shell/
    nav.html               top navigation (becomes a bottom tab bar on phones)
    navigation.js          navigation items and badges
    shell.css              layout shared by all screens, mobile tab bar, page transitions
  screens/<name>/
    template.html          the screen's markup
    screen.js              its state, sample data and interactions
    style.css              styles loaded only while that screen is open
```

Each screen is self-contained: editing `screens/feed/` never changes another screen, and its
CSS is swapped in only while it is showing, so class names cannot clash.

## How templates work

- `{{name}}` or `{{post.title}}` is filled from the object `bindings()` returns in `screen.js`.
- `<for-each list="{{items}}" as="item">…</for-each>` repeats its content for each item.
- `<show-if value="{{isOpen}}">…</show-if>` renders only when the value is truthy.
- `onClick="{{handler}}"` (also `onChange`, `onPointerDown` …) calls a function from `bindings()`.
- `this.setState({ ... })` updates state and re-renders; the DOM is patched in place.
- Links between screens are ordinary anchors: `<a href="#/community">`.
- `<!--nav-->` in a template marks where the shared top navigation is inserted.
- Classes named `is-*` and attributes named `data-js-*` belong to scripts and survive re-renders;
  an element with `data-js-frozen` keeps its children (used for WebGL hosts and live counters).
- A screen can define `mounted(host)` (runs after first paint) and `destroy()` (on leave).
- `data-reveal` fades an element in on scroll; `data-split` reveals a heading word by word.

## Changing the 3D

- Swap the hero book: `BOOK.carto` in `src/screens/home/screen.js` (any id from `data/books.js`).
- Add a book: one entry in `BOOKS`; its cover is painted from `bg`, `accent`, `ink`, `spine` and
  `motif` (`sun`, `band`, `arch`, `disc`, `line`, `diamond`, `moon`, `tide`, `grid`, `rings`).
- The home scroll choreography lives in `startStage()`; each chapter is a progress range (0–1).
- Without WebGL, or with reduced motion, every screen falls back to CSS books and static motion.

## Screens

| Route | Screen |
| --- | --- |
| `#/` | The Reading Room: pinned WebGL story (door → book opens → margins → helix library), Ask the book, live globe, story-to-chapter journey, mood picks, challenge, authors, community, the door |
| `#/explore` | The Stacks: full-screen 3D helix — drag, filter by genre/mood/search, pull a book out; pre-orders, collections, weekly chart |
| `#/book?b=<id>` | Book: 3D book that opens, page-turning reader with margin notes, themes, text size, ambient sound, spoiler dial, reviews |
| `#/author` | Author profile: daily field logs, books, influence |
| `#/community` | Community forum: threads, replies, AI summaries |
| `#/feed` | Feed: posts, reactions, comments |
| `#/leaderboard` | Leaderboard |
| `#/studio` | AI Studio: turn community activity into content |
| `#/dashboard` | Author dashboard: analytics and ideas |

## Deploy

Linked to the Vercel project `lamplight`. Every push to `main` redeploys; pull
requests get preview URLs. To deploy by hand: `npx vercel --prod`.
