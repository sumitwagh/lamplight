# Folio · The Reading Room

The immersive 3D direction for Folio: a home page where a book opens as you scroll, a 3D library
you browse by turning shelves, book and author pages, community, feed, leaderboard, an AI studio
and an author dashboard, all connected and dark, cinematic and tactile.

This is one of three independent Folio projects, each in its own repository with its own
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

## Screens

| Route | Screen |
| --- | --- |
| `#/` | The Reading Room: scroll to open the book of the month; journey from story to book; AI moods |
| `#/explore` | 3D Library: shelves of spines, fanning collections, book detail panel |
| `#/book` | Book: 3D cover, highlights, reviews, contributors, reading room |
| `#/author` | Author profile: daily field logs, books, influence |
| `#/community` | Community forum: threads, replies, AI summaries |
| `#/feed` | Feed: posts, reactions, comments |
| `#/leaderboard` | Leaderboard |
| `#/studio` | AI Studio: turn community activity into content |
| `#/dashboard` | Author dashboard: analytics and ideas |

## Deploy

Linked to the Vercel project `folio-reading-room`. Every push to `main` redeploys; pull
requests get preview URLs. To deploy by hand: `npx vercel --prod`.
