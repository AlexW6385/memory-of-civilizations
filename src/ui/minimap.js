// The small map in the corner: the land round the visitor (north up) — sea, coast, the open
// country's colours, the settlements' discs with their names — and the visitor's arrow. Click it
// to open the globe. Night darkens it as it darkens the globe.

import { tr } from './i18n.js';
import { coastAt, climateAt } from '../planet/land.js';
import { PLANET_RADIUS as R, BUILT } from '../planet/relief.js';
import { eastNorth, dot } from '../planet/geo.js';
import { landColour, daylight } from './globe.js';

const RADIUS = 600;                     // metres from the centre to the edge of the small map
const RES = 88;                         // samples across

export class MiniMap {
  constructor(world, mapView, onOpen, sun = null) {
    this.sun = sun;
    this.world = world;
    this.box = document.getElementById('minimap');
    this.canvas = document.getElementById('minimap-canvas');
    this.label = document.getElementById('minimap-region');
    this.next = 0;
    this.off = document.createElement('canvas');
    this.off.width = this.off.height = RES;
    this.box.addEventListener('click', () => onOpen());
  }

  /** Redraw (a few times a second) for the visitor at planet direction u, heading (radians from north). */
  update(u, heading) {
    const now = performance.now();
    if (this.box.hidden || now < this.next) return;
    this.next = now + 250;
    const cv = this.canvas, dpr = devicePixelRatio || 1, W = Math.round(cv.clientWidth * dpr), H = Math.round(cv.clientHeight * dpr);
    if (!W || !H) return;
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
    const [e, n] = eastNorth(u);
    // the land, sampled coarsely and drawn smooth
    const og = this.off.getContext('2d'), img = og.createImageData(RES, RES), sun = this.sun?.();
    for (let j = 0; j < RES; j++) for (let i = 0; i < RES; i++) {
      const dx = ((i + 0.5) / RES * 2 - 1) * RADIUS / R, dy = (1 - (j + 0.5) / RES * 2) * RADIUS / R;
      const v = [u[0] + e[0] * dx + n[0] * dy, u[1] + e[1] * dx + n[1] * dy, u[2] + e[2] * dx + n[2] * dy];
      const l = Math.hypot(v[0], v[1], v[2]); v[0] /= l; v[1] /= l; v[2] /= l;
      const c = daylight([...landColour(coastAt(v), climateAt(v)), 255], v, sun);
      img.data.set(c, (j * RES + i) * 4);
    }
    og.putImageData(img, 0, 0);
    const g = cv.getContext('2d');
    g.imageSmoothingEnabled = true;
    g.drawImage(this.off, 0, 0, W, H);
    const s = (W / 2) / RADIUS;
    // the settlements
    let here = null;
    g.font = `${Math.round(11 * dpr)}px system-ui, sans-serif`;
    g.textAlign = 'center';
    for (const S of BUILT) {
      const d = [S.u[0] - u[0], S.u[1] - u[1], S.u[2] - u[2]];
      const x = W / 2 + dot(d, e) * R * s, y = H / 2 - dot(d, n) * R * s;
      if (dot(S.u, u) < 0.9) continue;
      const rr = S.radius * s;
      if (x < -rr || y < -rr || x > W + rr || y > H + rr) continue;
      g.fillStyle = 'rgba(214, 196, 160, 0.55)'; g.strokeStyle = 'rgba(255, 240, 210, 0.9)'; g.lineWidth = 1.5 * dpr;
      g.beginPath(); g.arc(x, y, rr, 0, Math.PI * 2); g.fill(); g.stroke();
      g.fillStyle = '#fff8e8'; g.shadowColor = 'rgba(0,0,0,0.7)'; g.shadowBlur = 3 * dpr;
      g.fillText(tr(S.site.name), x, y - rr - 4 * dpr);
      g.shadowBlur = 0;
      if (Math.hypot(x - W / 2, y - H / 2) < rr) here = S;
    }
    // the visitor
    g.save(); g.translate(W / 2, H / 2); g.rotate(heading);
    g.fillStyle = '#ffd36b'; g.strokeStyle = '#2a2116'; g.lineWidth = 1.5 * dpr;
    g.beginPath(); g.moveTo(0, -9 * dpr); g.lineTo(6 * dpr, 7 * dpr); g.lineTo(0, 3.5 * dpr); g.lineTo(-6 * dpr, 7 * dpr); g.closePath(); g.fill(); g.stroke();
    g.restore();
    this.label.textContent = here ? `${tr(here.site.name)} · ${here.site.era}` : '';
  }
}
