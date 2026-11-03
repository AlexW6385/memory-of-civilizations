// The large map: the planet itself, as a globe to turn (drag) and come closer to (wheel, pinch),
// with the settlements marked and named. A click on a settlement takes the visitor to its
// building's entrance; a click anywhere else on the land, there. The list below names every
// settlement with its time.

import { t, tr, onLang } from './i18n.js';
import { coastAt, climateAt } from '../planet/land.js';
import { BUILT, PLANET_RADIUS } from '../planet/relief.js';
import { SITES } from '../planet/sites.js';
import { PLACED } from '../planet/layout.js';
import { unit, latLon, eastNorth, dot, norm, cross } from '../planet/geo.js';

const sm = (e0, e1, x) => { const q = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return q * q * (3 - 2 * q); };

/**
 * Day and night on the maps: the colour c lit by the sun (planet direction sun) at direction v — full
 * day, a reddened band of twilight, and night (dim, blue).
 */
export function daylight(c, v, sun) {
  if (!sun) return c;
  const d = v[0] * sun[0] + v[1] * sun[1] + v[2] * sun[2];
  const day = sm(-0.1, 0.08, d), dusk = Math.max(0, 1 - Math.abs(d + 0.02) / 0.12) * 0.35;
  const k = 0.22 + 0.78 * day;
  return [c[0] * k * (1 + dusk * 0.5) + 6 * (1 - day), c[1] * k * (1 + dusk * 0.12) + 10 * (1 - day), c[2] * k * (1 - dusk * 0.2) + 26 * (1 - day), c[3]];
}

/** Colour of the land (or sea) for the maps, from the distance to the coast and the climate. */
export function landColour(d, [mount, moist, warm]) {
  if (d < 0) {
    const s = sm(-120, 0, d);
    return [22 + 30 * s, 52 + 45 * s, 82 + 55 * s];
  }
  if (warm < 0.2 || mount > 120) return [228, 232, 236];
  const dry = sm(0.15, 0.7, 1 - moist), beach = 1 - sm(4, 18, d);
  let r = 112 + 90 * dry - 0.2 * mount, g = 122 + 30 * moist + 42 * dry - 0.25 * mount, b = 74 + 52 * dry + 0.1 * mount;
  if (moist > 0.55 && warm > 0.3) { const f = sm(0.55, 0.75, moist); r -= 40 * f; g -= 18 * f; b -= 22 * f; }
  r += (214 - r) * beach * 0.7; g += (196 - g) * beach * 0.7; b += (150 - b) * beach * 0.7;
  return [r, g, b].map((v) => Math.max(0, Math.min(255, v)));
}

export class GlobeView {
  constructor(world, onBuilding, onPlace, sun = null) {
    this.sun = sun;
    this.world = world;
    this.onBuilding = onBuilding;
    this.onPlace = onPlace;
    this.canvas = document.getElementById('map-canvas');
    this.list = document.getElementById('map-list');
    this.off = document.createElement('canvas');
    this.center = [0, 1, 0];
    this.up = [0, 0, -1];
    this.zoom = 1;
    this.you = null;
    this.bind();
    this.fillList();
    onLang(() => { this.fillList(); this.draw(); });
  }

  /** The entrance record of each built settlement's first building. */
  recFor(S) { return [...this.world.plans.values()].find((r) => r.site?.S === S); }

  fillList() {
    this.list.innerHTML = '';
    for (const S of BUILT) {
      const li = document.createElement('li'), b = document.createElement('button');
      b.innerHTML = `<span class="name"></span><span class="era"></span>`;
      b.querySelector('.name').textContent = tr(S.site.name);
      b.querySelector('.era').textContent = S.site.era;
      b.onclick = () => { const r = this.recFor(S); if (r) this.onBuilding(r); };
      li.appendChild(b); this.list.appendChild(li);
    }
  }

  /** Open centred on the visitor (direction u), facing north up. */
  open(u, heading) {
    this.you = { u, heading };
    this.center = u.slice();
    const [, n] = eastNorth(u);
    this.up = n;
    this.zoom = 2.2;
    requestAnimationFrame(() => this.draw());
    // the night moves on while the map is open
    clearInterval(this._tick);
    this._tick = setInterval(() => { if (this.canvas.offsetParent) this.draw(); else clearInterval(this._tick); }, 2000);
  }

  /** The view's basis: right, up, toward the viewer (the globe's point at the centre of the view). */
  basis() {
    const c = norm(this.center), r = norm(cross(this.up, c)), u = cross(c, r);
    return { c, r, u };
  }

  /** Screen point (canvas pixels) → planet direction, or null off the globe. */
  unproject(px, py) {
    const W = this.canvas.width, H = this.canvas.height, rad = Math.min(W, H) * 0.46 * this.zoom;
    const x = (px - W / 2) / rad, y = -(py - H / 2) / rad, q = x * x + y * y;
    if (q > 1) return null;
    const z = Math.sqrt(1 - q), { c, r, u } = this.basis();
    return norm([r[0] * x + u[0] * y + c[0] * z, r[1] * x + u[1] * y + c[1] * z, r[2] * x + u[2] * y + c[2] * z]);
  }

  /** Planet direction → screen point, or null on the far side. */
  project(v) {
    const { c, r, u } = this.basis(), z = dot(v, c);
    if (z < 0) return null;
    const W = this.canvas.width, H = this.canvas.height, rad = Math.min(W, H) * 0.46 * this.zoom;
    return [W / 2 + dot(v, r) * rad, H / 2 - dot(v, u) * rad];
  }

  draw(coarse = false) {
    const cv = this.canvas, dpr = devicePixelRatio || 1;
    const W = Math.round(cv.clientWidth * dpr), H = Math.round(cv.clientHeight * dpr);
    if (!W || !H) return;
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
    const res = coarse ? 160 : 360, sx = Math.ceil(W / (Math.min(W, H) / res)), sy = Math.ceil(H / (Math.min(W, H) / res));
    this.off.width = sx; this.off.height = sy;
    const og = this.off.getContext('2d'), img = og.createImageData(sx, sy), sun = this.sun?.();
    for (let j = 0; j < sy; j++) for (let i = 0; i < sx; i++) {
      const v = this.unproject((i + 0.5) / sx * W, (j + 0.5) / sy * H);
      let c;
      if (!v) c = [20, 18, 15, 0];
      else {
        c = landColour(coastAt(v), climateAt(v));
        // a little shading toward the rim
        const z = dot(v, this.basis().c), sh = 0.55 + 0.45 * Math.sqrt(Math.max(0, z));
        c = daylight([c[0] * sh, c[1] * sh, c[2] * sh, 255], v, sun);
      }
      img.data.set(c, (j * sx + i) * 4);
    }
    og.putImageData(img, 0, 0);
    const g = cv.getContext('2d');
    g.clearRect(0, 0, W, H);
    g.imageSmoothingEnabled = true;
    g.drawImage(this.off, 0, 0, W, H);
    // the planned settlements, faint; the built ones, named
    g.font = `${Math.round(12 * dpr)}px system-ui, sans-serif`;
    g.textAlign = 'left';
    for (const s of SITES) {
      if (s.legacy) continue;
      const p = this.project(unit(...PLACED[s.id]));
      if (!p) continue;
      g.fillStyle = 'rgba(255, 245, 220, 0.35)';
      g.beginPath(); g.arc(p[0], p[1], 2.2 * dpr, 0, Math.PI * 2); g.fill();
    }
    this.marks = [];
    for (const S of BUILT) {
      const p = this.project(S.u);
      if (!p) continue;
      this.marks.push({ S, p });
      // at night the settlements glow with their lamps
      if (sun && dot(S.u, sun) < 0.02) {
        const gl = g.createRadialGradient(p[0], p[1], 0, p[0], p[1], 14 * dpr);
        gl.addColorStop(0, 'rgba(255, 200, 110, 0.75)'); gl.addColorStop(1, 'rgba(255, 170, 80, 0)');
        g.fillStyle = gl; g.beginPath(); g.arc(p[0], p[1], 14 * dpr, 0, Math.PI * 2); g.fill();
      }
      g.fillStyle = '#ffd36b'; g.strokeStyle = '#2a2116'; g.lineWidth = 1.5 * dpr;
      g.beginPath(); g.arc(p[0], p[1], 4.5 * dpr, 0, Math.PI * 2); g.fill(); g.stroke();
      g.fillStyle = '#fff8e8'; g.shadowColor = 'rgba(0,0,0,0.8)'; g.shadowBlur = 4 * dpr;
      // the name to the right of the mark, or to its left where it would run off the edge
      const name = tr(S.site.name), tw = g.measureText(name).width, left = p[0] + 8 * dpr + tw > W - 4 * dpr;
      let tx = left ? p[0] - 8 * dpr - tw : p[0] + 8 * dpr;
      tx = Math.max(4 * dpr, Math.min(W - 4 * dpr - tw, tx));
      g.fillText(name, tx, p[1] + 4 * dpr);
      g.textAlign = 'left';
      g.shadowBlur = 0;
    }
    if (this.you) {
      const p = this.project(this.you.u);
      if (p) {
        g.fillStyle = '#7fd3ff'; g.strokeStyle = '#0d1a22'; g.lineWidth = 2 * dpr;
        g.beginPath(); g.arc(p[0], p[1], 5 * dpr, 0, Math.PI * 2); g.fill(); g.stroke();
      }
    }
  }

  bind() {
    const cv = this.canvas;
    let drag = null, moved = 0;
    const pinch = new Map();
    cv.addEventListener('pointerdown', (e) => {
      cv.setPointerCapture(e.pointerId);
      pinch.set(e.pointerId, [e.clientX, e.clientY]);
      drag = { x: e.clientX, y: e.clientY }; moved = 0;
    });
    cv.addEventListener('pointermove', (e) => {
      if (!pinch.has(e.pointerId)) return;
      if (pinch.size === 2) {
        const [a, b] = [...pinch.values()], d0 = Math.hypot(a[0] - b[0], a[1] - b[1]);
        pinch.set(e.pointerId, [e.clientX, e.clientY]);
        const [c2, d2] = [...pinch.values()], d1 = Math.hypot(c2[0] - d2[0], c2[1] - d2[1]);
        this.zoom = Math.max(0.9, Math.min(14, this.zoom * d1 / Math.max(1, d0)));
        moved += 10; this.draw(true); return;
      }
      pinch.set(e.pointerId, [e.clientX, e.clientY]);
      if (!drag) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      drag = { x: e.clientX, y: e.clientY };
      moved += Math.abs(dx) + Math.abs(dy);
      // turn the globe under the pointer
      const rad = Math.min(cv.clientWidth, cv.clientHeight) * 0.46 * this.zoom;
      const { c, r, u } = this.basis(), ax = -dx / rad, ay = dy / rad;
      this.center = norm([c[0] + r[0] * ax + u[0] * ay, c[1] + r[1] * ax + u[1] * ay, c[2] + r[2] * ax + u[2] * ay]);
      // keep north up where possible
      const [, n] = eastNorth(this.center);
      this.up = n;
      this.draw(true);
    });
    const end = (e) => {
      pinch.delete(e.pointerId);
      if (!drag) return;
      drag = null;
      if (moved < 6) this.click(e);
      else this.draw();
    };
    cv.addEventListener('pointerup', end);
    cv.addEventListener('pointercancel', (e) => { pinch.delete(e.pointerId); drag = null; this.draw(); });
    cv.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.zoom = Math.max(0.9, Math.min(14, this.zoom * Math.exp(-e.deltaY * 0.0015)));
      this.draw(true);
      clearTimeout(this._wt); this._wt = setTimeout(() => this.draw(), 160);
    }, { passive: false });
  }

  click(e) {
    const rect = this.canvas.getBoundingClientRect(), dpr = devicePixelRatio || 1;
    const px = (e.clientX - rect.left) * dpr, py = (e.clientY - rect.top) * dpr;
    for (const m of this.marks || []) {
      if (Math.hypot(m.p[0] - px, m.p[1] - py) < 14 * dpr) { const r = this.recFor(m.S); if (r) this.onBuilding(r); return; }
    }
    const v = this.unproject(px, py);
    if (!v) return;
    // near a settlement (within about a kilometre of its rim, or a few pixels of its mark): there
    let near = null, nd = Infinity;
    for (const S of BUILT) {
      const d = Math.acos(Math.max(-1, Math.min(1, dot(v, S.u)))) * PLANET_RADIUS - S.radius;
      if (d < nd) { nd = d; near = S; }
    }
    const perPx = 2 / (Math.min(this.canvas.width, this.canvas.height) * 0.46 * this.zoom) * PLANET_RADIUS / 2;
    if (near && nd < Math.max(1000, 30 * dpr * perPx)) { const r = this.recFor(near); if (r) { this.onBuilding(r); return; } }
    const [la, lo] = latLon(v);
    this.onPlace(la, lo);
  }
}

export { t };
