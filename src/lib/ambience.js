// Generated reading ambience (no audio files): rain, fireplace and a quiet library.
let ctx = null;
let current = null;

function noiseBuffer(ac, seconds = 2, brown = false) {
  const len = ac.sampleRate * seconds;
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1;
    if (brown) { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; } else d[i] = w;
  }
  return buf;
}

function loop(ac, buf, dest) {
  const s = ac.createBufferSource();
  s.buffer = buf; s.loop = true; s.connect(dest); s.start();
  return s;
}

export function playAmbience(kind, volume = 0.5) {
  stopAmbience();
  if (!kind) return;
  ctx ||= new (window.AudioContext || window.webkitAudioContext)();
  ctx.resume?.();
  const ac = ctx;
  const out = ac.createGain();
  out.gain.value = 0;
  out.gain.linearRampToValueAtTime(volume, ac.currentTime + 1.2);
  out.connect(ac.destination);
  const nodes = [out];
  const timers = [];

  if (kind === 'rain') {
    const f = ac.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 900;
    const f2 = ac.createBiquadFilter(); f2.type = 'lowpass'; f2.frequency.value = 7000;
    const g = ac.createGain(); g.gain.value = 0.35;
    f.connect(f2).connect(g).connect(out);
    nodes.push(loop(ac, noiseBuffer(ac, 3), f));
    const drop = () => {
      const o = ac.createBufferSource(); o.buffer = noiseBuffer(ac, 0.03);
      const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2500 + Math.random() * 3000; bp.Q.value = 8;
      const gg = ac.createGain(); gg.gain.value = 0.25 * Math.random();
      o.connect(bp).connect(gg).connect(out); o.start();
    };
    timers.push(setInterval(drop, 70));
  } else if (kind === 'fire') {
    const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 500;
    const g = ac.createGain(); g.gain.value = 0.9;
    f.connect(g).connect(out);
    nodes.push(loop(ac, noiseBuffer(ac, 3, true), f));
    const crack = () => {
      const o = ac.createBufferSource(); o.buffer = noiseBuffer(ac, 0.012);
      const hp = ac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 1500;
      const gg = ac.createGain(); gg.gain.value = 0.5 + Math.random() * 0.5;
      o.connect(hp).connect(gg).connect(out); o.start();
      timers.push(setTimeout(crack, 80 + Math.random() * 600));
    };
    crack();
  } else if (kind === 'library') {
    const hum = ac.createOscillator(); hum.frequency.value = 60; const hg = ac.createGain(); hg.gain.value = 0.03; hum.connect(hg).connect(out); hum.start(); nodes.push(hum);
    const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 1200;
    const g = ac.createGain(); g.gain.value = 0.12;
    f.connect(g).connect(out);
    nodes.push(loop(ac, noiseBuffer(ac, 3, true), f));
    const page = () => {
      const o = ac.createBufferSource(); o.buffer = noiseBuffer(ac, 0.35);
      const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 3000; bp.Q.value = 0.7;
      const gg = ac.createGain(); gg.gain.setValueAtTime(0, ac.currentTime); gg.gain.linearRampToValueAtTime(0.18, ac.currentTime + 0.1); gg.gain.linearRampToValueAtTime(0, ac.currentTime + 0.35);
      o.connect(bp).connect(gg).connect(out); o.start();
      timers.push(setTimeout(page, 4000 + Math.random() * 7000));
    };
    timers.push(setTimeout(page, 2500));
  }
  current = { nodes, timers, out };
}

export function stopAmbience() {
  if (!current || !ctx) return;
  const { nodes, timers, out } = current;
  current = null;
  timers.forEach((t) => { clearInterval(t); clearTimeout(t); });
  out.gain.cancelScheduledValues(ctx.currentTime);
  out.gain.setValueAtTime(out.gain.value, ctx.currentTime);
  out.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
  setTimeout(() => nodes.forEach((n) => { try { n.stop?.(); n.disconnect(); } catch { /* already stopped */ } }), 500);
}
