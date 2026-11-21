// Petra, about AD 50 — wear on what is walked over (docs/settlements/petra.md §27): the sandstone of a threshold polished lighter and smooth where feet cross it
// and a path worn into the floor beyond a door, in every house, court house gate and shop. The climate is dry: no moss, no rising damp here (the style's
// `faceDress` already has the runnels and the drifted sand). Wraps the style's builders from here (the style files stay as they were); pure functions of the
// element's own numbers, a few hundredths of a metre thick (no collision), the width varying by the hash of the place.
import '../../styles/nabataean/index.js';
import './nightlight.js';
import { box } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { houseLayout } from '../../styles/nabataean/house.js';
import { hashAt } from './nightlight.js';
import { height, PLAZA } from './layout.js';

const WORN = 'mud_plaster';

function houseWear(el, bag) {
  const L = houseLayout(el), { P, y } = L, put = (u0, v0, u1, v1, y0, y1) => { const a = P(u0, v0), b = P(u1, v1); bag.add(WORN, box(Math.min(a[0], b[0]), y0, Math.min(a[1], b[1]), Math.max(a[0], b[0]), y1, Math.max(a[1], b[1]))); };
  const [x0, z0] = el.rect, q = hashAt(x0, z0, 41), w = 0.36 + 0.1 * q;
  if (!L.court) {
    const d = L.door.u;
    put(d - w, -0.42, d + w, 0.5, y + 0.08, y + 0.088);                           // the doorstep (its top y + 0.08), worn light in the middle
    put(d - w * 0.9, 0.55, d + w * 0.9, 2.3, y + 0.03, y + 0.036);                // the path across the floor beyond the door
  } else {
    const g = L.gate.u, di = L.doorIn.u, R0 = L.range.v0;
    put(g - w, -0.42, g + w, 0.5, y + 0.08, y + 0.088);                           // the gate's sill
    put(g - w * 0.9, 0.6, g + w * 0.9, 2.4, y + 0.03, y + 0.036);                 // the flags inside the gate
    put(di - w, R0 - 1.6, di + w, R0 - 0.1, y + 0.03, y + 0.036);                 // before the range's door
  }
}
function frontWear(el, bag) {
  const [x, z] = el.at, rot = el.rot ?? 0, y = el.y ?? 0.45, c = Math.cos(rot), s = Math.sin(rot), P = (u, v) => [x + u * c + v * s, z - u * s + v * c];
  const q = hashAt(x, z, 42), w = 0.5 + 0.12 * q, a = P(-w, -0.9), b = P(w, 1.1), M = [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])];
  bag.add(WORN, box(M[0], y, M[1], M[2], y + 0.012, M[3]));                       // the shop's threshold and the way in, worn light by the customers' feet
}

/**
 * The way the Khazneh's visitors went [inferred]: the three steps polished pale down their middle, and beyond them a path trodden in the forecourt's sand
 * from the Siq's mouth to the steps, widest where the way from the Siq meets the way from the Outer Siq (the Khazneh faces east, its front at x = at[0] + v).
 */
function khaznehWear(el, bag) {
  const [ax, az] = el.at;
  const put = (v0, v1, hw, y0, y1, zc = az) => bag.add(WORN, box(ax + v0, y0, zc - hw, ax + v1, y1, zc + hw));
  put(3.2, 3.6, 2.6, 0.35, 0.358); put(2.8, 3.2, 2.5, 0.7, 0.708); put(0.9, 2.8, 2.4, 1.05, 1.058);        // the treads, the nosing's width worn
  const x1 = PLAZA.c[0] + 18;
  for (let x = ax + 3.6, i = 0; x < x1; i++) {
    const len = 3.0 + 0.8 * hashAt(x, az, 51), xe = Math.min(x1, x + len), xm = (x + xe) / 2, zc = az + (hashAt(xm, az, 52) - 0.5) * 1.6 + (xm - ax) * 0.0;
    const hw = (2.6 - 1.4 * Math.min(1, (xm - ax) / 30)) * (0.85 + 0.3 * hashAt(xm, az, 53)), y = height(xm, zc);
    bag.add(WORN, box(x, y, zc - hw, xe + 0.05, y + 0.014, zc + hw));
    x = xe;
  }
}

let done = false;
export function registerWear() {
  if (done) return; done = true;
  const E = STYLES.nabataean.elements, house = E.nabataean_house, front = E.petra_front;
  E.nabataean_house = function worn(el, ctx) { const r = house.call(this, el, ctx); houseWear(el, ctx.bag); return r; };
  { const kh = E.khazneh; E.khazneh = function worn(el, ctx) { const r = kh.call(this, el, ctx); khaznehWear(el, ctx.bag); return r; }; }
  E.petra_front = function worn(el, ctx) { const r = front.call(this, el, ctx); frontWear(el, ctx.bag); return r; };
}
registerWear();
