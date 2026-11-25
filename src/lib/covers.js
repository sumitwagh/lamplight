// One cover design, two renderers: CSS (for DOM books) and Canvas 2D (for WebGL textures).

/** CSS declarations for the motif layer of a DOM cover. */
export function motifCSS(b) {
  const a = b.accent;
  switch (b.motif) {
    case 'sun': return `width:80%;height:54%;border-radius:50%;top:-10%;right:-24%;background:${a}`;
    case 'band': return `width:100%;height:6%;left:0;top:58%;background:${a}`;
    case 'arch': return `width:84%;height:60%;border-radius:999px 999px 0 0;left:8%;bottom:0;background:${a}`;
    case 'disc': return `width:46%;height:31%;border-radius:50%;left:27%;top:34%;background:${a}`;
    case 'line': return `width:2px;height:70%;left:62%;top:15%;background:${a}`;
    case 'diamond': return `width:56%;height:37%;border:2px solid ${a};left:22%;top:28%;transform:rotate(45deg)`;
    case 'moon': return `width:46%;height:31%;border-radius:50%;right:10%;top:12%;background:transparent;box-shadow:inset -18px 10px 0 0 ${a}`;
    case 'tide': return `width:130%;height:90%;border-radius:50%;left:-60%;bottom:-48%;background:${a}`;
    case 'grid': return `inset:0;background:repeating-linear-gradient(90deg,transparent 0 23%,${a}33 23% calc(23% + 1px)),repeating-linear-gradient(0deg,transparent 0 15%,${a}33 15% calc(15% + 1px))`;
    case 'rings': return `width:120%;height:80%;left:-10%;top:10%;border-radius:50%;background:repeating-radial-gradient(circle,transparent 0 9px,${a} 9px 10px)`;
    default: return '';
  }
}

/** A ready-to-use HTML string for a 3D DOM book (used by templates through bindings). */
export function coverVars(b) {
  return `--bg:${b.bg};--ac:${b.accent};--ci:${b.ink};--sp:${b.spine}`;
}

function wrap(ctx, text, maxW) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

/** Paint a cover onto a canvas (default 512×768). Returns the canvas. */
export function paintCover(b, { w = 512, h = 768, canvas } = {}) {
  const c = canvas || document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  const s = w / 512;
  g.fillStyle = b.bg; g.fillRect(0, 0, w, h);
  g.save();
  g.fillStyle = b.accent; g.strokeStyle = b.accent;
  switch (b.motif) {
    case 'sun': g.beginPath(); g.ellipse(w * 0.84, h * 0.17, w * 0.4, h * 0.27, 0, 0, Math.PI * 2); g.fill(); break;
    case 'band': g.fillRect(0, h * 0.58, w, h * 0.06); break;
    case 'arch': g.beginPath(); g.moveTo(w * 0.08, h); g.lineTo(w * 0.08, h * 0.4 + w * 0.42); g.arc(w * 0.5, h * 0.4 + w * 0.42, w * 0.42, Math.PI, 0); g.lineTo(w * 0.92, h); g.fill(); break;
    case 'disc': g.beginPath(); g.ellipse(w * 0.5, h * 0.495, w * 0.23, h * 0.155, 0, 0, Math.PI * 2); g.fill(); break;
    case 'line': g.fillRect(w * 0.62, h * 0.15, 3 * s, h * 0.7); break;
    case 'diamond': g.lineWidth = 4 * s; g.translate(w * 0.5, h * 0.465); g.rotate(Math.PI / 4); g.strokeRect(-w * 0.2, -w * 0.2, w * 0.4, w * 0.4); break;
    case 'moon': g.beginPath(); g.arc(w * 0.66, h * 0.27, w * 0.18, 0, Math.PI * 2); g.fill(); g.fillStyle = b.bg; g.beginPath(); g.arc(w * 0.61, h * 0.25, w * 0.165, 0, Math.PI * 2); g.fill(); break;
    case 'tide': g.beginPath(); g.ellipse(w * 0.05, h * 1.03, w * 0.85, h * 0.45, 0, 0, Math.PI * 2); g.fill(); break;
    case 'grid': g.globalAlpha = 0.25; g.lineWidth = 1.5 * s; for (let x = w * 0.23; x < w; x += w * 0.23) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = h * 0.15; y < h; y += h * 0.15) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } break;
    case 'rings': g.lineWidth = 2 * s; for (let r = 12 * s; r < w * 0.7; r += 20 * s) { g.beginPath(); g.ellipse(w * 0.5, h * 0.5, r, r * 0.66, 0, 0, Math.PI * 2); g.stroke(); } break;
  }
  g.restore();
  // type
  const pad = w * 0.12;
  g.fillStyle = b.ink;
  g.font = `500 ${Math.round(15 * s)}px 'JetBrains Mono', monospace`;
  g.globalAlpha = 0.85;
  g.fillText(b.genre.toUpperCase().split('').join(String.fromCharCode(8202)), pad, pad + 10 * s);
  g.globalAlpha = 1;
  const size = Math.round((b.title.length > 24 ? 64 : 76) * s);
  g.font = `400 ${size}px 'Instrument Serif', serif`;
  const lines = wrap(g, b.title, w - pad * 2);
  const lh = size * 0.94;
  const top = h - pad - 34 * s - lh * (lines.length - 1);
  lines.forEach((l, i) => g.fillText(l, pad, top + i * lh));
  g.font = `600 ${Math.round(16 * s)}px Inter, sans-serif`;
  g.globalAlpha = 0.85;
  g.fillText(b.author.toUpperCase(), pad, h - pad + 4 * s);
  g.globalAlpha = 1;
  // spine shading + sheen
  const sh = g.createLinearGradient(0, 0, w, 0);
  sh.addColorStop(0, 'rgba(0,0,0,.35)'); sh.addColorStop(0.05, 'rgba(255,255,255,.12)'); sh.addColorStop(0.09, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,.18)');
  g.fillStyle = sh; g.fillRect(0, 0, w, h);
  return c;
}

/** Paint a spine (narrow) texture. */
export function paintSpine(b, { w = 96, h = 768 } = {}) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  g.fillStyle = b.spine; g.fillRect(0, 0, w, h);
  g.fillStyle = b.accent; g.fillRect(0, h * 0.06, w, 4);
  g.save();
  g.translate(w / 2 + 10, h * 0.5);
  g.rotate(Math.PI / 2);
  g.fillStyle = b.accent;
  g.font = `400 34px 'Instrument Serif', serif`;
  g.textAlign = 'center';
  const t = b.title.length > 26 ? b.title.slice(0, 25) + '…' : b.title;
  g.fillText(t, 0, 0);
  g.restore();
  return c;
}

/** Paint an open-book page with lines of text and optional highlight progress per line. */
export function paintPage(g, { w, h, lines, kicker, folio, highlight = [], side = 'right' }) {
  g.fillStyle = '#F4EDE0'; g.fillRect(0, 0, w, h);
  const gutter = g.createLinearGradient(side === 'right' ? 0 : w, 0, side === 'right' ? w * 0.18 : w * 0.82, 0);
  gutter.addColorStop(0, 'rgba(60,40,10,.28)'); gutter.addColorStop(1, 'rgba(60,40,10,0)');
  g.fillStyle = gutter; g.fillRect(0, 0, w, h);
  const pad = w * 0.12;
  g.fillStyle = '#8A6A2A';
  g.font = `500 ${w * 0.026}px 'JetBrains Mono', monospace`;
  if (kicker) g.fillText(kicker, pad, pad);
  const fs = w * 0.056;
  g.font = `400 ${fs}px 'Instrument Serif', serif`;
  let y = pad + fs * 1.6;
  lines.forEach((l, i) => {
    const hp = highlight[i] || 0;
    if (hp > 0) {
      const tw = g.measureText(l).width;
      g.fillStyle = `rgba(245,185,74,${0.55 * Math.min(1, hp * 1.4)})`;
      g.fillRect(pad - 4, y - fs * 0.82, (tw + 8) * Math.min(1, hp), fs * 1.02);
    }
    g.fillStyle = '#2A2620';
    g.fillText(l, pad, y);
    y += fs * 1.38;
  });
  if (folio) {
    g.fillStyle = '#8A6A2A';
    g.font = `500 ${w * 0.024}px 'JetBrains Mono', monospace`;
    g.fillText(folio, pad, h - pad * 0.7);
  }
}

/** Data for the shared .b3 DOM book markup (see shell.css). */
export function domBook(b) {
  return { ...b, vars: coverVars(b), motifStyle: motifCSS(b), href: `#/book?b=${b.id}` };
}
