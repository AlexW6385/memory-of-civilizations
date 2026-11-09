// The large map: the planet itself, as a globe to turn (drag) and come closer to (wheel, pinch),
// with the settlements marked and named. A click on a settlement opens its card (card.js), whose Go
// button takes the visitor to its building's entrance; a click anywhere else on the land, there. The list below names every
// settlement with its time.

import { t, tr, onLang } from './i18n.js';
import { coastAt, climateAt } from '../planet/land.js';
import { BUILT, PLANET_RADIUS } from '../planet/relief.js';
import { SITES } from '../planet/sites.js';
import { PLACED } from '../planet/layout.js';
import { take } from './order.js';
import { SettlementCard } from './card.js';
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

// The list's groups, in order, and the regions (sites.js) each holds.
const GROUPS = [
  ['east', ['china', 'tibet', 'japan', 'korea']],
  ['south', ['india', 'indochina', 'java']],
  ['mena', ['mesopotamia', 'persia', 'levant', 'bosphorus', 'egypt']],
  ['africa', ['sahel', 'ethiopia', 'swahili', 'zimbabwe']],
  ['europe', ['aegean', 'latium', 'britain', 'france', 'iberia', 'italy', 'lowlands', 'scandinavia', 'russia']],
  ['americas', ['mexico', 'yucatan', 'andes', 'mississippi', 'southwest', 'northeast']],
  ['oceania', ['polynesia', 'aotearoa', 'australia']],
];
const groupOf = (region) => (GROUPS.find(([, rs]) => rs.includes(region)) || ['other'])[0];
/** "9th c." → 9, "21st c. BC" → -21: a sortable date. */
const eraKey = (era) => { const m = /(\d+)/.exec(era || ''); const n = m ? +m[1] : 0; return /BC/i.test(era) ? -n : n; };

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
    this.sel = null;
    this.card = new SettlementCard(this.canvas.parentElement, this.canvas, (S) => this.go(S), () => { this.sel = null; if (this.canvas.offsetParent) this.repaintMarks(); });
    this.bind();
    this.fillList();
    onLang(() => { this.fillList(); this.card.fill(); this.draw(); });
  }

  /** The entrance record of each built settlement's first building. */
  recFor(S) { return [...this.world.plans.values()].find((r) => r.site?.S === S); }
  /** Go to a settlement at once (the travel fetches its plans if they have not come yet). */
  go(S) { return this.onBuilding(S); }

  fillList() {
    this.list.innerHTML = '';
    const order = [...GROUPS.map(([g]) => g), 'other'];
    const sorted = [...BUILT].sort((a, b) => order.indexOf(groupOf(a.site.region)) - order.indexOf(groupOf(b.site.region)) || eraKey(a.site.era) - eraKey(b.site.era));
    let last = null;
    for (const S of sorted) {
      const g = groupOf(S.site.region);
      if (g !== last) {
        last = g;
        const h = document.createElement('li'); h.className = 'head'; h.textContent = t('regions')[g]; this.list.appendChild(h);
      }
      const li = document.createElement('li'), b = document.createElement('button');
      b.innerHTML = `<span class="name"></span><span class="era"></span>`;
      b.querySelector('.name').textContent = tr(S.site.name);
      b.querySelector('.era').textContent = S.site.era;
      b.onclick = () => this.go(S);
      li.appendChild(b); this.list.appendChild(li);
    }
  }

  /** The settlement the visitor is at (the nearest), or null. */
  here() {
    if (!this.you) return null;
    let best = null, bd = -2;
    for (const S of BUILT) { const d = dot(this.you.u, S.u); if (d > bd) { bd = d; best = S; } }
    return best;
  }

  /** Travel to the next settlement of the shared random order (src/ui/order.js), other than the current one. */
  random() {
    const S = take(this.here());
    if (S) this.go(S);
  }

  /** Open centred on the visitor (direction u), facing north up. */
  open(u, heading) {
    this.card.close();
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
    this.drawFaint(g);
    this.paintMarks();
    this.card.place(this.marks.find((m) => m.S === this.sel));
  }

  drawFaint(g) {
    const dpr = devicePixelRatio || 1;
    for (const s of SITES) {
      if (s.legacy) continue;
      const p = this.project(unit(...PLACED[s.id]));
      if (!p) continue;
      g.fillStyle = 'rgba(255, 245, 220, 0.35)';
      g.beginPath(); g.arc(p[0], p[1], 2.2 * dpr, 0, Math.PI * 2); g.fill();
    }
  }

  /** The settlements' marks and names over the cached map picture: every name always shown, at a fixed place to the
   *  right of its dot (inside the canvas), overlap allowed; the hovered and the current settlement drawn last. */
  paintMarks() {
    const cv = this.canvas, W = cv.width, H = cv.height, dpr = devicePixelRatio || 1, sun = this.sun?.();
    const g = cv.getContext('2d');
    const cur = this.here();
    this.marks = [];
    for (const S of BUILT) {
      const p = this.project(S.u);
      if (p) this.marks.push({ S, p });
    }
    const order = [...this.marks].sort((a, b) => (a.S === this.hover) - (b.S === this.hover) || (a.S === cur) - (b.S === cur));
    const px = Math.round(11 * dpr), m = 3 * dpr;
    g.textAlign = 'left'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    for (const mk of order) {
      const { S, p } = mk;
      const hov = S === this.hover || S === this.sel, isCur = S === cur;
      // at night the settlements glow with their lamps
      if (sun && dot(S.u, sun) < 0.02) {
        const gl = g.createRadialGradient(p[0], p[1], 0, p[0], p[1], 12 * dpr);
        gl.addColorStop(0, 'rgba(255, 200, 110, 0.7)'); gl.addColorStop(1, 'rgba(255, 170, 80, 0)');
        g.fillStyle = gl; g.beginPath(); g.arc(p[0], p[1], 12 * dpr, 0, Math.PI * 2); g.fill();
      }
      // the dot: small, with a light ring (the current settlement's in blue, the hovered one larger)
      const r = (hov ? 4 : 3) * dpr;
      g.beginPath(); g.arc(p[0], p[1], r, 0, Math.PI * 2);
      g.fillStyle = isCur ? '#7fd3ff' : hov ? '#fff2c4' : '#ffd36b'; g.fill();
      g.lineWidth = 1.4 * dpr; g.strokeStyle = isCur ? 'rgba(235, 248, 255, 0.95)' : 'rgba(255, 250, 235, 0.9)'; g.stroke();
      // the name, to the right of the dot; kept inside the canvas
      g.font = `${hov || isCur ? '600 ' : ''}${px}px system-ui, sans-serif`;
      const name = tr(S.site.name), tw = g.measureText(name).width;
      const x = Math.max(m, Math.min(W - m - tw, p[0] + r + 4 * dpr)), y = Math.max(px / 2 + m, Math.min(H - px / 2 - m, p[1]));
      mk.left = p[0] - r; mk.right = x + tw;
      g.lineWidth = 3 * dpr; g.strokeStyle = 'rgba(14, 12, 9, 0.85)'; g.strokeText(name, x, y);
      g.fillStyle = hov ? '#ffffff' : isCur ? '#e3f5ff' : '#fff6e0'; g.fillText(name, x, y);
    }
    g.textBaseline = 'alphabetic';
    if (this.you) {
      const p = this.project(this.you.u);
      if (p) {
        g.fillStyle = '#7fd3ff'; g.strokeStyle = '#0d1a22'; g.lineWidth = 2 * dpr;
        g.beginPath(); g.arc(p[0], p[1], 5 * dpr, 0, Math.PI * 2); g.fill(); g.stroke();
      }
    }
  }

  /** Repaint only the marks (the hover), over the map picture already made. */
  repaintMarks() {
    const cv = this.canvas, g = cv.getContext('2d');
    g.clearRect(0, 0, cv.width, cv.height);
    g.drawImage(this.off, 0, 0, cv.width, cv.height);
    this.drawFaint(g);
    this.paintMarks();
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
      if (!pinch.has(e.pointerId)) {
        const rect = cv.getBoundingClientRect(), dpr = devicePixelRatio || 1;
        const px = (e.clientX - rect.left) * dpr, py = (e.clientY - rect.top) * dpr;
        let h = null, hd = 14 * dpr;
        for (const m of this.marks || []) { const d = Math.hypot(m.p[0] - px, m.p[1] - py); if (d < hd) { hd = d; h = m.S; } }
        if (h !== this.hover) { this.hover = h; cv.style.cursor = h ? 'pointer' : ''; this.repaintMarks(); }
        return;
      }
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
    cv.addEventListener('pointerleave', () => { if (this.hover) { this.hover = null; this.repaintMarks(); } });
    cv.addEventListener('pointerup', end);
    cv.addEventListener('pointercancel', (e) => { pinch.delete(e.pointerId); drag = null; this.draw(); });
    cv.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.zoom = Math.max(0.9, Math.min(14, this.zoom * Math.exp(-e.deltaY * 0.0015)));
      this.draw(true);
      clearTimeout(this._wt); this._wt = setTimeout(() => this.draw(), 160);
    }, { passive: false });
  }

  /** Open the settlement card of a marked settlement. */
  openCard(m) {
    this.sel = m.S;
    this.repaintMarks();
    this.card.show(m.S, this.marks.find((q) => q.S === m.S));
  }

  click(e) {
    const rect = this.canvas.getBoundingClientRect(), dpr = devicePixelRatio || 1;
    const px = (e.clientX - rect.left) * dpr, py = (e.clientY - rect.top) * dpr;
    for (const m of this.marks || []) {
      if (Math.hypot(m.p[0] - px, m.p[1] - py) < 14 * dpr) { this.openCard(m); return; }
    }
    // with a card open, a click elsewhere on the map only closes it
    if (this.card.isOpen) { this.card.close(); return; }
    const v = this.unproject(px, py);
    if (!v) return;
    // near a settlement (within about a kilometre of its rim, or a few pixels of its mark): there
    let near = null, nd = Infinity;
    for (const S of BUILT) {
      const d = Math.acos(Math.max(-1, Math.min(1, dot(v, S.u)))) * PLANET_RADIUS - S.radius;
      if (d < nd) { nd = d; near = S; }
    }
    const perPx = 2 / (Math.min(this.canvas.width, this.canvas.height) * 0.46 * this.zoom) * PLANET_RADIUS / 2;
    if (near && nd < Math.max(1000, 30 * dpr * perPx)) { const m = (this.marks || []).find((q) => q.S === near); if (m) this.openCard(m); else this.go(near); return; }
    const [la, lo] = latLon(v);
    this.onPlace(la, lo);
  }
}

export { t };
