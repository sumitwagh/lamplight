import { mount } from './runtime.js';
import { ROUTES } from './routes.js';
import { navigation } from './shell/navigation.js';
import navMarkup from './shell/nav.html?raw';

const host = document.getElementById('app');
const screenStyle = document.getElementById('screen-style');
let current = null;

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function currentPath() {
  const path = location.hash.replace(/^#/, '').split('?')[0] || '/';
  return ROUTES[path] ? path : '/';
}

function show(path) {
  const route = ROUTES[path];
  current?.destroy?.();
  host.replaceChildren();
  screenStyle.textContent = route.style;
  document.title = `${route.title} · Folio`;
  current = mount(route.Screen, {
    root: host,
    markup: route.markup.replace('<!--nav-->', navMarkup),
    extend: (values) => ({ ...values, nav: navigation(route.nav) }),
  });
  window.scrollTo(0, 0);
}

function navigate() {
  const path = currentPath();
  if (document.startViewTransition && current && !reduceMotion()) {
    document.startViewTransition(() => show(path));
  } else {
    show(path);
  }
}

export function startRouter() {
  window.addEventListener('hashchange', navigate);
  navigate();
}
