// WebGL layer for the Reading Room: a lamp-lit room with a real 3D book and a helix library.
// Built on three.js. Everything here is optional: callers check `Stage.supported()` first and
// fall back to the DOM/CSS version when WebGL is unavailable.
import * as THREE from 'three';
import { paintCover, paintSpine, paintPage } from './covers.js';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
export const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const range = (p, a, b) => clamp((p - a) / (b - a));

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function tex(canvas) {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function paperEdgeTexture() {
  const c = document.createElement('canvas');
  c.width = 8; c.height = 256;
  const g = c.getContext('2d');
  for (let y = 0; y < 256; y += 2) { g.fillStyle = y % 4 ? '#efe6d4' : '#d6cab3'; g.fillRect(0, y, 8, 2); }
  const t = tex(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

function glyphPageTexture(seed = 1) {
  const c = document.createElement('canvas');
  c.width = 384; c.height = 576;
  const g = c.getContext('2d');
  g.fillStyle = '#F2EADB'; g.fillRect(0, 0, 384, 576);
  let s = seed * 9301;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  g.fillStyle = 'rgba(42,38,32,.28)';
  for (let y = 70; y < 520; y += 19) {
    const w = y > 500 ? 120 : 250 + rnd() * 40;
    let x = 46;
    while (x < 46 + w) { const ww = 8 + rnd() * 30; g.fillRect(x, y, ww, 5); x += ww + 6; }
  }
  return tex(c);
}

function dotTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, 'rgba(255,236,200,1)'); r.addColorStop(0.3, 'rgba(255,214,150,.5)'); r.addColorStop(1, 'rgba(255,200,120,0)');
  g.fillStyle = r; g.fillRect(0, 0, 64, 64);
  return tex(c);
}

function shadowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, 'rgba(0,0,0,.75)'); r.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = r; g.fillRect(0, 0, 128, 128);
  return tex(c);
}

/* ------------------------------------------------------------------ Stage */
export class Stage {
  static supported() {
    try {
      const c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
    } catch { return false; }
  }

  constructor(host, { fov = 32, z = 12, fog = [11, 26] } = {}) {
    this.host = host;
    this.reduced = reduced();
    const small = window.innerWidth < 760;
    this.renderer = new THREE.WebGLRenderer({ antialias: !small, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setClearColor(0x07070c, 0);
    host.appendChild(this.renderer.domElement);
    this.renderer.domElement.setAttribute('aria-hidden', 'true');

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x07070c, fog[0], fog[1]);
    this.camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 100);
    this.camera.position.set(0, 0, z);
    this.lookAt = new THREE.Vector3();

    this.scene.add(new THREE.AmbientLight(0x6c6888, 0.55));
    const hemi = new THREE.HemisphereLight(0xffe3b0, 0x0d0b1a, 0.6);
    this.scene.add(hemi);
    this.lamp = new THREE.SpotLight(0xffc77a, 380, 40, 0.6, 0.7, 1.5);
    this.lamp.position.set(-3, 6, 7);
    this.scene.add(this.lamp, this.lamp.target);
    this.rim = new THREE.PointLight(0x9d8cff, 30, 30, 1.6);
    this.rim.position.set(6, -2, -4);
    this.scene.add(this.rim);

    this.pointer = { x: 0, y: 0, sx: 0, sy: 0 };
    this.frames = new Set();
    this._onMove = (e) => {
      this.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('pointermove', this._onMove, { passive: true });
    this._onResize = () => this.resize();
    window.addEventListener('resize', this._onResize);
    this.resize();

    this.clock = new THREE.Clock();
    this.visible = true;
    this._io = new IntersectionObserver(([e]) => { this.visible = e.isIntersecting; }, { threshold: 0 });
    this._io.observe(host);
    const loop = () => {
      this._raf = requestAnimationFrame(loop);
      if (!this.visible || this.paused || document.hidden) { this.clock.getDelta(); return; }
      const dt = Math.min(this.clock.getDelta(), 0.05);
      const k = 1 - Math.pow(0.0015, dt);
      this.pointer.sx = lerp(this.pointer.sx, this.pointer.x, k);
      this.pointer.sy = lerp(this.pointer.sy, this.pointer.y, k);
      this.lamp.position.x = lerp(this.lamp.position.x, -1 + this.pointer.sx * 7, k);
      this.lamp.position.y = lerp(this.lamp.position.y, 5 + this.pointer.sy * 4, k);
      for (const f of this.frames) f(dt, this.clock.elapsedTime);
      this.camera.lookAt(this.lookAt);
      this.renderer.render(this.scene, this.camera);
    };
    loop();
  }

  resize() {
    const r = this.host.getBoundingClientRect();
    const w = Math.max(1, r.width || window.innerWidth), h = Math.max(1, r.height || window.innerHeight);
    this.renderer.setSize(w, h, false);
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.size = { w, h };
  }

  /** Project a world-space point to CSS pixels inside the host. */
  project(v) {
    const p = v.clone().project(this.camera);
    return { x: (p.x + 1) / 2 * this.size.w, y: (1 - p.y) / 2 * this.size.h, z: p.z };
  }

  destroy() {
    cancelAnimationFrame(this._raf);
    window.removeEventListener('pointermove', this._onMove);
    window.removeEventListener('resize', this._onResize);
    this._io.disconnect();
    this.scene.traverse((o) => {
      o.geometry?.dispose?.();
      const m = o.material;
      (Array.isArray(m) ? m : m ? [m] : []).forEach((mm) => { mm.map?.dispose?.(); mm.dispose?.(); });
    });
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}

/* ------------------------------------------------------------------ Dust */
export class Dust {
  constructor(stage, { count = 520, spread = [16, 10, 10], color = 0xffd9a0 } = {}) {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    this.seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * spread[0];
      pos[i * 3 + 1] = (Math.random() - 0.5) * spread[1];
      pos[i * 3 + 2] = (Math.random() - 0.5) * spread[2];
      this.seed[i] = Math.random() * 100;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.mat = new THREE.PointsMaterial({ size: 0.07, map: dotTexture(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color, opacity: 0.8 });
    this.points = new THREE.Points(geo, this.mat);
    this.spread = spread;
    stage.scene.add(this.points);
    if (stage.reduced) return;
    stage.frames.add((dt, t) => {
      const a = geo.attributes.position.array;
      for (let i = 0; i < count; i++) {
        a[i * 3 + 1] += dt * (0.05 + (this.seed[i] % 1) * 0.12);
        a[i * 3] += Math.sin(t * 0.3 + this.seed[i]) * dt * 0.05;
        if (a[i * 3 + 1] > spread[1] / 2) a[i * 3 + 1] = -spread[1] / 2;
      }
      geo.attributes.position.needsUpdate = true;
    });
  }
}

/* ------------------------------------------------------------------ Book */
const W = 3, H = 4.5, T = 0.5, NP = 7, NX = 22;

export class Book3D {
  constructor(stage, book, { lines = [], leftTitle = 'Chapter One', kicker = 'CHAPTER ONE · VELL', folio = 'p. 1' } = {}) {
    this.stage = stage;
    this.root = new THREE.Group();
    this.tilt = new THREE.Group();
    this.book = new THREE.Group();
    this.root.add(this.tilt);
    this.tilt.add(this.book);
    stage.scene.add(this.root);
    this.state = { open: 0, riffle: 0, hl: [] };

    const coverTex = tex(paintCover(book));
    const spineTex = tex(paintSpine(book));
    const edge = paperEdgeTexture();
    const paper = new THREE.MeshStandardMaterial({ color: 0xf3ead8, roughness: 0.9 });
    const edgeMat = new THREE.MeshStandardMaterial({ map: edge, roughness: 0.95 });
    const clothMat = new THREE.MeshStandardMaterial({ color: book.spine, roughness: 0.75 });
    const coverMat = new THREE.MeshStandardMaterial({ map: coverTex, roughness: 0.55, metalness: 0.05 });

    // endpaper / flyleaf
    const ep = document.createElement('canvas');
    ep.width = 512; ep.height = 768;
    const eg = ep.getContext('2d');
    eg.fillStyle = book.spine; eg.fillRect(0, 0, 512, 768);
    eg.strokeStyle = book.accent; eg.globalAlpha = 0.18; eg.lineWidth = 1.2;
    for (let i = 0; i < 26; i++) { eg.beginPath(); eg.moveTo(0, i * 34 + 10); eg.bezierCurveTo(170, i * 34 - 30, 340, i * 34 + 50, 512, i * 34); eg.stroke(); }
    eg.globalAlpha = 0.7; eg.fillStyle = book.ink; eg.font = "italic 400 34px 'Instrument Serif', serif"; eg.textAlign = 'center';
    eg.fillText('for the ones who listen', 256, 400);
    const endMat = new THREE.MeshStandardMaterial({ map: tex(ep), roughness: 0.85 });

    const ct = 0.04;
    // back cover
    const back = new THREE.Mesh(new THREE.BoxGeometry(W + 0.08, H + 0.12, ct), [clothMat, clothMat, clothMat, clothMat, endMat, clothMat]);
    back.position.set(W / 2 + 0.04, 0, -T / 2 + ct / 2);
    // page block
    const bd = T - ct * 2 - 0.02;
    const block = new THREE.Mesh(new THREE.BoxGeometry(W - 0.02, H - 0.04, bd), [edgeMat, paper, edgeMat, edgeMat, paper, paper]);
    block.position.set(W / 2, 0, 0);
    this.blockTop = bd / 2;
    // spine
    const spine = new THREE.Mesh(new THREE.BoxGeometry(0.06, H + 0.12, T), [clothMat, new THREE.MeshStandardMaterial({ map: spineTex, roughness: 0.6 }), clothMat, clothMat, clothMat, clothMat]);
    spine.position.set(-0.03, 0, 0);
    // front cover on a hinge
    this.hinge = new THREE.Group();
    this.hinge.position.set(0, 0, T / 2 - ct / 2);
    const front = new THREE.Mesh(new THREE.BoxGeometry(W + 0.08, H + 0.12, ct), [clothMat, clothMat, clothMat, clothMat, coverMat, endMat]);
    front.position.set(W / 2 + 0.04, 0, 0);
    this.hinge.add(front);

    // right-hand text page (the page you land on)
    this.pageCanvas = document.createElement('canvas');
    this.pageCanvas.width = 768; this.pageCanvas.height = 1152;
    this.lines = lines; this.kicker = kicker; this.folio = folio;
    this.pageTex = tex(this.pageCanvas);
    this.drawPage();
    const textPage = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.06, H - 0.08), new THREE.MeshStandardMaterial({ map: this.pageTex, roughness: 0.95 }));
    textPage.position.set(W / 2, 0, this.blockTop + 0.003);

    // riffle pages
    const lp = document.createElement('canvas');
    lp.width = 512; lp.height = 768;
    const lg = lp.getContext('2d');
    lg.fillStyle = '#F4EDE0'; lg.fillRect(0, 0, 512, 768);
    const gut = lg.createLinearGradient(512, 0, 420, 0); gut.addColorStop(0, 'rgba(60,40,10,.3)'); gut.addColorStop(1, 'rgba(60,40,10,0)'); lg.fillStyle = gut; lg.fillRect(0, 0, 512, 768);
    lg.fillStyle = '#8A6A2A'; lg.font = "500 14px 'JetBrains Mono', monospace"; lg.fillText('I.', 60, 120);
    lg.fillStyle = '#2A2620'; lg.font = "400 64px 'Instrument Serif', serif"; lg.fillText(leftTitle, 60, 330);
    lg.font = "italic 400 34px 'Instrument Serif', serif"; lg.fillStyle = '#5A5348'; lg.fillText('Vell, the quiet city', 60, 380);
    lg.strokeStyle = '#8A6A2A'; lg.globalAlpha = 0.6; lg.beginPath(); lg.arc(256, 560, 70, 0, Math.PI * 2); lg.stroke(); lg.beginPath(); lg.moveTo(186, 560); lg.lineTo(326, 560); lg.moveTo(256, 490); lg.lineTo(256, 630); lg.stroke();
    const leftTex = tex(lp);
    leftTex.wrapS = THREE.RepeatWrapping; leftTex.repeat.x = -1; leftTex.offset.x = 1;

    this.pages = [];
    for (let i = 0; i < NP; i++) {
      const geo = new THREE.PlaneGeometry(W - 0.06, H - 0.1, NX, 1);
      const pos = geo.attributes.position;
      const col = new Uint8Array(pos.count);
      for (let v = 0; v < pos.count; v++) col[v] = Math.round((pos.getX(v) + (W - 0.06) / 2) / (W - 0.06) * NX);
      const frontM = new THREE.MeshStandardMaterial({ map: glyphPageTexture(i + 2), roughness: 0.95, side: THREE.FrontSide });
      const backTex = i === NP - 1 ? leftTex : (() => { const t = glyphPageTexture(i + 11); t.wrapS = THREE.RepeatWrapping; t.repeat.x = -1; t.offset.x = 1; return t; })();
      const backM = new THREE.MeshStandardMaterial({ map: backTex, roughness: 0.95, side: THREE.BackSide });
      const g = new THREE.Group();
      g.add(new THREE.Mesh(geo, frontM), new THREE.Mesh(geo, backM));
      this.book.add(g);
      this.pages.push({ geo, col, i });
    }

    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(W * 2.4, 1.6), new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false, opacity: 0.8 }));
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(0, -H / 2 - 0.6, 0);
    this.shadow = shadow;
    this.root.add(shadow);

    this.book.add(back, block, spine, this.hinge, textPage);
    this.layoutPages();
    this.anchorObj = new THREE.Object3D();
    this.book.add(this.anchorObj);
  }

  drawPage() {
    const g = this.pageCanvas.getContext('2d');
    paintPage(g, { w: this.pageCanvas.width, h: this.pageCanvas.height, lines: this.lines, kicker: this.kicker, folio: this.folio, highlight: this.state?.hl || [] });
    this.pageTex.needsUpdate = true;
  }

  setHighlights(arr) {
    const prev = this.state.hl;
    if (prev.length === arr.length && prev.every((v, i) => Math.abs(v - arr[i]) < 0.01)) return;
    this.state.hl = arr.slice();
    this.drawPage();
  }

  /** Bend each riffle page around the spine. f = 0 (all on the right) … 1 (all flipped left). */
  layoutPages() {
    const open = this.state.open, f = this.state.riffle;
    const seg = (W - 0.06) / NX;
    for (const p of this.pages) {
      // pages lie on the right until the cover is open, then flip in a staggered wave
      const local = clamp(f * (NP + 2) - p.i);
      const theta = ease(local) * Math.PI;
      const k = Math.sin(theta) * 0.85;
      const baseZ = local < 0.5 ? this.blockTop + 0.008 + (NP - p.i) * 0.004 : T / 2 + 0.03 + p.i * 0.004;
      const xs = new Float32Array(NX + 1), zs = new Float32Array(NX + 1);
      let x = 0, z = 0;
      for (let j = 1; j <= NX; j++) {
        const a = clamp(theta - k * Math.pow(j / NX, 1.3) + (theta > Math.PI * 0.5 ? k * 0.25 * (j / NX) : 0), 0, Math.PI);
        x += seg * Math.cos(a); z += seg * Math.sin(a);
        xs[j] = x; zs[j] = z;
      }
      const pos = p.geo.attributes.position;
      for (let v = 0; v < pos.count; v++) { const c = p.col[v]; pos.setX(v, xs[c] + 0.02); pos.setZ(v, zs[c] + baseZ); }
      pos.needsUpdate = true;
      p.geo.computeVertexNormals();
      p.geo.computeBoundingSphere();
    }
    // keep the riffle stack hidden under the cover while closed
    const vis = open > 0.02;
    this.pages.forEach((p) => { p.geo.userData.vis = vis; });
    this.book.children.forEach((c) => { if (c.isGroup && c !== this.hinge) c.visible = vis; });
  }

  set(open, riffle) {
    if (Math.abs(open - this.state.open) < 1e-4 && Math.abs(riffle - this.state.riffle) < 1e-4) return;
    this.state.open = open; this.state.riffle = riffle;
    this.hinge.rotation.y = -ease(open) * Math.PI * 0.995;
    this.book.position.x = -W / 2 * (1 - ease(open));
    this.layoutPages();
  }

  /** Screen position of the right margin next to text line i (for HTML margin notes). */
  lineAnchor(i, side = 'right') {
    const pw = this.pageCanvas.width;
    const fs = pw * 0.056, pad = pw * 0.12;
    const yPx = pad + fs * 1.6 + i * fs * 1.38 - fs * 0.35;
    const y = (H - 0.08) / 2 - (yPx / this.pageCanvas.height) * (H - 0.08);
    this.anchorObj.position.set(side === 'right' ? W - 0.02 : 0.25, y, this.blockTop + 0.01);
    this.anchorObj.updateWorldMatrix(true, false);
    const v = new THREE.Vector3().setFromMatrixPosition(this.anchorObj.matrixWorld);
    return this.stage.project(v);
  }
}

/* ------------------------------------------------------------------ Helix library */
export class Helix {
  constructor(stage, books, { radius = 4.4, perTurn = 9, rise = 0.3, scale = 0.5 } = {}) {
    this.stage = stage;
    this.group = new THREE.Group();
    stage.scene.add(this.group);
    this.radius = radius; this.perTurn = perTurn; this.rise = rise;
    this.rotation = 0; this.target = 0; this.velocity = 0;
    this.hover = -1; this.pinned = -1;
    this.items = [];
    const edge = paperEdgeTexture();
    const edgeMat = new THREE.MeshStandardMaterial({ map: edge, roughness: 0.95 });
    const geo = new THREE.BoxGeometry(W, H, T * 0.9);
    books.forEach((b, i) => {
      const cover = new THREE.MeshStandardMaterial({ map: tex(paintCover(b, { w: 256, h: 384 })), roughness: 0.55, transparent: true });
      const spine = new THREE.MeshStandardMaterial({ map: tex(paintSpine(b, { w: 48, h: 384 })), roughness: 0.6, transparent: true });
      const backM = new THREE.MeshStandardMaterial({ color: b.spine, roughness: 0.7, transparent: true });
      const m = new THREE.Mesh(geo, [edgeMat, spine, edgeMat, edgeMat, cover, backM]);
      m.scale.setScalar(scale);
      m.userData = { book: b, index: i, slot: i, show: 1, s: 0, pull: 0, base: scale };
      this.group.add(m);
      this.items.push(m);
    });
    this.count = books.length;
    this.ray = new THREE.Raycaster();
    this.ndc = new THREE.Vector2(-9, -9);
    this.interactive = true;
    this.listeners = { hover: [], pick: [] };
    this.place(true);
    stage.frames.add((dt) => this.tick(dt));
  }

  on(evt, fn) { this.listeners[evt].push(fn); }
  emit(evt, v) { this.listeners[evt].forEach((f) => f(v)); }

  /** Show only `ids` (in that order); others shrink away. */
  filter(ids) {
    const order = new Map(ids.map((id, i) => [id, i]));
    this.items.forEach((m) => {
      const k = order.get(m.userData.book.id);
      m.userData.show = k == null ? 0 : 1;
      if (k != null) m.userData.slot = k;
    });
    this.count = Math.max(ids.length, 1);
  }

  slotPos(slot) {
    const a = (slot / this.perTurn) * Math.PI * 2;
    const y = (slot - (this.count - 1) / 2) * this.rise;
    return { a, y };
  }

  place(instant) {
    this.items.forEach((m) => {
      const u = m.userData;
      const { a, y } = this.slotPos(u.slot);
      u.a = instant ? a : lerp(u.a ?? a, a, 0.12);
      u.y = instant ? y : lerp(u.y ?? y, y, 0.12);
      u.s = instant ? u.show : lerp(u.s, u.show, 0.12);
    });
  }

  setPointer(x, y) { this.ndc.set(x, y); }

  tick(dt) {
    if (Math.abs(this.velocity) > 1e-4) { this.target += this.velocity; this.velocity *= Math.pow(0.04, dt); }
    this.rotation = lerp(this.rotation, this.target, 1 - Math.pow(0.002, dt));
    this.group.rotation.y = this.rotation;
    this.place(false);
    // hover
    let hit = -1;
    if (this.interactive && this.ndc.x > -2) {
      this.ray.setFromCamera(this.ndc, this.stage.camera);
      const hits = this.ray.intersectObjects(this.items.filter((m) => m.userData.s > 0.5), false);
      if (hits.length) hit = hits[0].object.userData.index;
    }
    if (hit !== this.hover) { this.hover = hit; this.emit('hover', hit >= 0 ? this.items[hit].userData.book : null); }
    this.items.forEach((m) => {
      const u = m.userData;
      const want = (u.index === this.hover || u.index === this.pinned) ? 1 : 0;
      u.pull = lerp(u.pull, want, 1 - Math.pow(0.0008, dt));
      const r = this.radius + u.pull * 1.1;
      m.position.set(Math.sin(u.a) * r, u.y + u.pull * 0.12, Math.cos(u.a) * r);
      m.rotation.set(0, u.a + u.pull * 0.0, u.pull * -0.04);
      const sc = u.base * (0.001 + u.s) * (1 + u.pull * 0.22);
      m.scale.setScalar(sc);
      m.visible = u.s > 0.01;
      const mats = m.material;
      mats[1].opacity = mats[4].opacity = mats[5].opacity = clamp(u.s * 1.4);
    });
  }

  pick() { if (this.hover >= 0) this.emit('pick', this.items[this.hover].userData.book); }

  /** Rotate so that book `id` faces the camera. */
  focus(id) {
    const m = this.items.find((x) => x.userData.book.id === id);
    if (!m) return;
    const a = (m.userData.slot / this.perTurn) * Math.PI * 2;
    let t = -a;
    const turns = Math.round((this.target - t) / (Math.PI * 2));
    t += turns * Math.PI * 2;
    this.target = t; this.velocity = 0;
    this.pinned = m.userData.index;
  }

  slotY(id) {
    const m = this.items.find((x) => x.userData.book.id === id);
    return m ? this.slotPos(m.userData.slot).y : 0;
  }
}

export { clamp, lerp };
