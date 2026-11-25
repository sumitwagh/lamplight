import { mount } from './runtime.js';
import { ROUTES } from './routes.js';
import { navigation } from './shell/navigation.js';
import navMarkup from './shell/nav.html?raw';
import { resetScroll, revealAll, splitWords, reducedMotion } from './lib/ui.js';

const host = document.getElementById('app');
const screenStyle = document.getElementById('screen-style');
let current = null;
let observer = null;

export function query() {
  return new URLSearchParams(location.hash.split('?')[1] || '');
}

function currentPath() {
  const path = location.hash.replace(/^#/, '').split('?')[0] || '/';
  return ROUTES[path] ? path : '/';
}

/** Navigate to a hash route, e.g. go('#/book?b=salt'). */
export function go(href) {
  if (location.hash === href || (href === '#/' && !location.hash)) navigate();
  else location.hash = href;
}

function enhance() {
  splitWords(host);
  revealAll(host);
}

function show(path) {
  const route = ROUTES[path];
  observer?.disconnect();
  current?.destroy?.();
  host.replaceChildren();
  screenStyle.textContent = route.style;
  document.title = `${route.title} · Folio`;
  document.documentElement.dataset.route = route.nav;
  current = mount(route.Screen, {
    root: host,
    markup: route.markup.replace('<!--nav-->', navMarkup),
    extend: (values) => ({ ...values, nav: navigation(route.nav, route.page) }),
  });
  resetScroll();
  enhance();
  let t;
  observer = new MutationObserver(() => { clearTimeout(t); t = setTimeout(enhance, 30); });
  observer.observe(host, { childList: true, subtree: true });
  const view = current;
  requestAnimationFrame(() => view === current && view.mounted?.(host));
}

function navigate() {
  const path = currentPath();
  if (document.startViewTransition && current && !reducedMotion()) {
    document.startViewTransition(() => show(path));
  } else {
    show(path);
  }
}

export function startRouter() {
  window.addEventListener('hashchange', navigate);
  navigate();
}
