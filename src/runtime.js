/**
 * Tiny view runtime shared in spirit (but copied, not linked) by each Folio concept.
 *
 * How it works
 *  - index.html holds the markup inside <template id="app-template">.
 *  - Holes like {{title}} or {{book.title}} are filled from the object returned by
 *    your component's bindings() method.
 *  - <for-each list="{{items}}" as="item"> repeats its children for every item.
 *  - <show-if value="{{flag}}"> renders its children only when the value is truthy.
 *  - Attributes named onClick, onChange, onPointerDown… bind to functions in bindings().
 *  - On SVG elements write data-svg-d="{{path}}" or data-svg-points="{{pts}}": the runtime sets the
 *    real attribute once the value is known (avoids browser parse warnings).
 *  - Classes named is-* and attributes named data-js-* are owned by scripts and kept on re-render;
 *    an element with data-js-frozen keeps its children as they are.
 *  - Calling this.setState({...}) re-renders. The DOM is patched in place, so CSS
 *    transitions keep running and inputs keep focus.
 */

export class ViewModel {
  constructor() {
    this.state = {};
  }

  setState(patch) {
    Object.assign(this.state, typeof patch === 'function' ? patch(this.state) : patch);
    this._schedule?.();
  }

  bindings() {
    return {};
  }
}

const EVENTS = {
  onclick: 'click',
  onchange: 'input',
  onfocus: 'focus',
  onkeydown: 'keydown',
  onsubmit: 'submit',
  onpointerdown: 'pointerdown',
  onpointermove: 'pointermove',
  onpointerup: 'pointerup',
  onpointercancel: 'pointercancel',
  onpointerenter: 'pointerenter',
  onpointerleave: 'pointerleave',
};

function lookup(path, scopes) {
  const parts = path.trim().split('.');
  if (parts[0] === 'true') return true;
  if (parts[0] === 'false') return false;
  let value;
  for (let i = scopes.length - 1; i >= 0; i--) {
    if (scopes[i] && Object.prototype.hasOwnProperty.call(scopes[i], parts[0])) {
      value = scopes[i][parts[0]];
      break;
    }
  }
  for (let j = 1; j < parts.length; j++) value = value == null ? undefined : value[parts[j]];
  return value;
}

const fill = (text, scopes) =>
  text.replace(/\{\{([^}]+)\}\}/g, (_, path) => {
    const v = lookup(path, scopes);
    return v == null ? '' : String(v);
  });

const holeName = (attr) => attr.replace(/[{}]/g, '');

function expand(node, scopes) {
  if (node.nodeType === Node.TEXT_NODE) {
    if (node.nodeValue.includes('{{')) node.nodeValue = fill(node.nodeValue, scopes);
    return;
  }
  if (node.nodeType !== Node.ELEMENT_NODE) {
    node.remove();
    return;
  }
  const tag = node.tagName.toLowerCase();

  if (tag === 'for-each') {
    const list = lookup(holeName(node.getAttribute('list')), scopes) || [];
    const as = node.getAttribute('as');
    const out = document.createDocumentFragment();
    for (const item of list) {
      const copy = node.cloneNode(true);
      const scope = scopes.concat([{ [as]: item }]);
      for (const child of [...copy.childNodes]) expand(child, scope);
      out.append(...copy.childNodes);
    }
    node.replaceWith(out);
    return;
  }

  if (tag === 'show-if') {
    if (!lookup(holeName(node.getAttribute('value')), scopes)) {
      node.remove();
      return;
    }
    const out = document.createDocumentFragment();
    for (const child of [...node.childNodes]) expand(child, scopes);
    out.append(...node.childNodes);
    node.replaceWith(out);
    return;
  }

  for (const attr of [...node.attributes]) {
    const name = attr.name.toLowerCase();
    if (EVENTS[name]) {
      const fn = lookup(holeName(attr.value), scopes);
      node.removeAttribute(attr.name);
      if (typeof fn === 'function') (node.__handlers ||= {})[EVENTS[name]] = fn;
    } else if (name.startsWith('data-svg-')) {
      node.removeAttribute(attr.name);
      node.setAttribute(name.slice(9), fill(attr.value, scopes));
    } else if (attr.value.includes('{{')) {
      node.setAttribute(attr.name, fill(attr.value, scopes));
    }
  }
  for (const child of [...node.childNodes]) expand(child, scopes);
}

function listen(el) {
  if (!el.__handlers) return;
  el.__listening ||= {};
  for (const type of Object.keys(el.__handlers)) {
    if (el.__listening[type]) continue;
    el.__listening[type] = true;
    el.addEventListener(type, (event) => el.__handlers?.[type]?.(event));
  }
}

function attach(node) {
  if (node.nodeType !== Node.ELEMENT_NODE) return;
  listen(node);
  if (node.tagName === 'INPUT' && node.hasAttribute('value')) node.value = node.getAttribute('value');
  for (let c = node.firstChild; c; c = c.nextSibling) attach(c);
}

function patch(current, next) {
  if (current.nodeType !== next.nodeType || current.nodeName !== next.nodeName) {
    current.replaceWith(next);
    attach(next);
    return;
  }
  if (current.nodeType === Node.TEXT_NODE) {
    if (current.nodeValue !== next.nodeValue) current.nodeValue = next.nodeValue;
    return;
  }
  // Attributes named data-js-* and classes named is-* belong to scripts (reveals, split text…)
  // and survive re-renders.
  for (const attr of [...current.attributes]) {
    if (next.hasAttribute(attr.name) || attr.name.startsWith('data-js')) continue;
    const keep = attr.name === 'class' ? [...current.classList].filter((c) => c.startsWith('is-')) : [];
    if (keep.length) current.setAttribute('class', keep.join(' '));
    else current.removeAttribute(attr.name);
  }
  for (const attr of [...next.attributes]) {
    let value = attr.value;
    if (attr.name === 'class') {
      const keep = [...current.classList].filter((c) => c.startsWith('is-'));
      if (keep.length) value = (value + ' ' + keep.join(' ')).trim();
    }
    if (current.getAttribute(attr.name) !== value) current.setAttribute(attr.name, value);
  }
  if (current.hasAttribute('data-js-frozen')) return;
  if (current.tagName === 'INPUT') {
    const value = next.getAttribute('value') || '';
    const focused = document.activeElement === current;
    if (!focused && current.value !== value) current.value = value;
    if (focused && value === '' && current.__lastValue) current.value = '';
    current.__lastValue = value;
  }
  current.__handlers = next.__handlers;
  listen(current);
  patchChildren(current, next);
}

function patchChildren(current, next) {
  const a = [...current.childNodes];
  const b = [...next.childNodes];
  b.forEach((child, i) => {
    if (i < a.length) patch(a[i], child);
    else {
      current.appendChild(child);
      attach(child);
    }
  });
  for (let i = b.length; i < a.length; i++) a[i].remove();
}

/**
 * Render a component into a host element.
 *  root      CSS selector or element to render into (default #app)
 *  template  CSS selector of a <template> (default #app-template)
 *  markup    template markup as a string (used instead of `template`)
 *  extend    optional (values) => values, to add shared bindings such as navigation
 * Returns the component instance; call destroy() on it before mounting another screen.
 */
export function mount(Component, { root = '#app', template = '#app-template', markup, extend } = {}) {
  const host = typeof root === 'string' ? document.querySelector(root) : root;
  if (markup == null) markup = document.querySelector(template).innerHTML;
  const view = new Component();
  let queued = false;
  let alive = true;

  const render = () => {
    if (!alive) return;
    let values;
    try {
      values = view.bindings();
      if (extend) values = extend(values);
    } catch (error) {
      console.error(error);
      return;
    }
    const tpl = document.createElement('template');
    tpl.innerHTML = markup;
    const holder = document.createElement('div');
    holder.appendChild(tpl.content);
    for (const child of [...holder.childNodes]) expand(child, [values]);
    patchChildren(host, holder);
  };

  view._schedule = () => {
    if (queued) return;
    queued = true;
    queueMicrotask(() => {
      queued = false;
      render();
    });
  };

  const cleanup = view.destroy?.bind(view);
  view.destroy = () => {
    alive = false;
    cleanup?.();
  };

  render();
  return view;
}
