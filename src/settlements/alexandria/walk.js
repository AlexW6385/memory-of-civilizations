// The visitor's walk in Alexandria (docs/settlements/alexandria.md §16): from the arrival on the quay before the Museion west along the
// promenade (the potter's and the oil-seller's houses, the horrea, the customs post) to the gate of the Soma, down the Soma street to
// the great crossing, and along the Canopic Way under the colonnades of its shops east to the agora and the Gymnasium (the cross
// street between the rows leads to the craftsman's house). Pure data and helpers (no three.js): the polylines the walk-check,
// the placing of street furniture, the sound map and the night light read.

import { frame } from '../../styles/greek/agora.js';
import { houseLayout, egyptLayout } from '../../styles/ptolemaic/house.js';
import { lots, shopRuns, SOMA, CANOPIC, GROUND, height } from './layout.js';

export const ARRIVAL = [102, -86];
/** The walk, as polylines in world x, z: the promenade, the Soma street, the Canopic Way east and west, the cross street to the craftsman's house. */
export const WALK = [
  [[130, -84.6], [102, -86], [86, -83.4], [60, -83.4]],
  [[60, -83.4], [60, 70]],
  [[60, 70], [240, 70]],
  [[60, 70], [-150, 70]],
  [[72, -45], [126, -45]],                       // the cross street east of the Soma, to the craftsman's house
  [[48, -45], [-70, -45]],                       // and west, between the rows
  [[48, -8], [-70, -8]],
  [[72, -8], [126, -8]],
  [[48, 21], [-200, 21]],                        // the cross street at z 21 west to Rhakotis: the mudbrick houses on both sides (§17)
];
function segDist(p, a, b) {
  const vx = b[0] - a[0], vz = b[1] - a[1], l2 = vx * vx + vz * vz || 1, t = Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vz) / l2));
  return Math.hypot(p[0] - a[0] - vx * t, p[1] - a[1] - vz * t);
}
/** Distance (m) of a point from the walk. */
export function walkDist(x, z) { let best = 1e9; for (const W of WALK) for (let i = 0; i + 1 < W.length; i++) best = Math.min(best, segDist([x, z], W[i], W[i + 1])); return best; }

/** The front line's middle of a lot (the point on the street in front of its door). */
export function frontMid(l) { const F = frame(l.rect, l.front); return F.P(F.L / 2, -1); }

let OPENED = null;
/**
 * The houses and shops of the walk that are opened: the Greek courtyard houses (warehouses and the Rhakotis houses aside) whose front is within 9 m of the walk, nearest the arrival first.
 * { l, K (houseLayout), F (frame), door: u of the street door's middle }.
 */
export function opened() {
  if (OPENED) return OPENED;
  const list = [];
  for (const l of lots()) {
    if (l.warehouse || l.quarter === 'egyptian') continue;
    const [fx, fz] = frontMid(l);
    if (walkDist(fx, fz) > 9) continue;
    const K = houseLayout({ rect: l.rect, seed: l.seed, front: l.front }), F = K.F;
    list.push({ l, K, F, door: K.du + K.dw / 2, n: Math.hypot(fx - ARRIVAL[0], fz - ARRIVAL[1]) });
  }
  OPENED = list.sort((a, b) => a.n - b.n);
  return OPENED;
}

let OPENED_E = null;
/** The Rhakotis houses of the walk that are opened (their street door 1.7 m clear): those whose front is within 9 m of the walk, the four nearest the Soma street. { l, L (egyptLayout), F, door: u of the door's middle }. */
export function openedEgypt() {
  if (OPENED_E) return OPENED_E;
  const list = [];
  for (const l of lots()) {
    if (l.warehouse || l.quarter !== 'egyptian') continue;
    const [fx, fz] = frontMid(l);
    if (walkDist(fx, fz) > 9) continue;
    const K = egyptLayout({ rect: l.rect, seed: l.seed, front: l.front });
    list.push({ l, K, F: K.F, door: K.du + K.dw / 2, n: Math.abs(fx - 60) });
  }
  OPENED_E = list.sort((a, b) => a.n - b.n).slice(0, 4);
  return OPENED_E;
}
/**
 * Keep a prop out of an opened house's door lane (a metre either side of the line out from the street door, five metres out): the point moved along the front,
 * the way that has more room (the lanes of two doors are never closer than this to one another's neighbours).
 */
export function laneClear(at) {
  let [x, z] = at;
  for (const { F, door } of [...opened(), ...openedEgypt()]) {
    for (let v = 0; v <= 5; v += 1) {
      const [px, pz] = F.P(door, -v);
      if (Math.abs(F.alongX ? x - px : z - pz) < 1.35 && Math.abs(F.alongX ? z - pz : x - px) < 1.1) { const d = F.alongX ? x - px : z - pz, s = d < 0 ? -1 : 1, t = s * 1.5 - d; if (F.alongX) x += t; else z += t; }
    }
  }
  return [x, z];
}
const withY = (r) => { r.y0 = height(r[0][0], r[0][1]); return r; };
/** A route into a stoa's room k (the rooms' doors stand off the middle, 0.6 m from the room's start): from the street, through the colonnade, to the room's middle. */
function intoRoom(rect, front, n, rd, k, wt = 0.7) {
  const F = frame(rect, front), rw = (F.L - 2 * wt) / n, vb = F.D - rd, u = wt + k * rw + 1.2;
  return [F.P(u, -3), F.P(u, 1.2), F.P(u, vb - 0.6), F.P(u, vb + 1.0), F.P(u + 0.9, vb + 1.8)];
}
/** Into a courtyard house by its street door: through the passage, and on into the shop or the store (`room: 'a'`), the court (`'court'`) or the andron (`'andron'`). */
export function intoHouse({ l, K, F, door }, room) {
  const { du, dw, wA, df, cv0, cv1, split } = K, u = door, R = [F.P(u, -3), F.P(u, 0.3), F.P(u, 1.9)];
  if (room === 'a') return [...R, F.P(wA - 0.9, 1.9), F.P(wA - 1.3, 2.4)];
  if (room === 'court') return [...R, F.P(u, df + 1.2), F.P(u, (cv0 + cv1) / 2 - 0.6)];
  void du; void dw;
  // round the well, which stands in the court's middle: past it on the side of the andron's door
  const sw = K.sw, a0 = (0.6 + split) / 2, cm = (sw + 0.8 + K.L - sw - 0.8) / 2, side = a0 > cm ? 1 : -1;
  return [...R, F.P(u, df + 1.2), F.P(cm + side * 1.9, (cv0 + cv1) / 2 - 0.3), F.P(a0, cv1 - 1.5), F.P(a0, cv1 + 1.5)];
}

/** Into a Rhakotis house by its street door, to the middle of the ground room (the family at the quern sits beyond). */
export function intoEgypt({ K, F, door }) { return [F.P(door, -3), F.P(door, 0.3), F.P(door, 2.2), F.P(door, Math.min(K.hd / 2, 4.2))]; }

/** The routes walk-check follows (world x, z; start on the ground of the first point): into the places the walk passes. */
export function walkRoutes() {
  const out = [], O = opened();
  // the nearest shops and houses: into the front room (shop or store) of each of the first six, the court of the next three, the andron of two
  O.slice(0, 6).forEach((o) => out.push(withY(intoHouse(o, 'a'))));
  O.slice(6, 9).forEach((o) => out.push(withY(intoHouse(o, 'court'))));
  O.slice(9, 11).forEach((o) => out.push(withY(intoHouse(o, 'andron'))));
  openedEgypt().forEach((o) => out.push(withY(intoEgypt(o))));
  // the shops under the colonnades of the Canopic Way, within reach of the crossing: into the rooms
  const full = shopRuns().filter((r) => r.full && Math.abs(r.cx - 60) < 120).sort((a, b) => Math.abs(a.cx - 60) - Math.abs(b.cx - 60));
  for (const r of full.slice(0, 4)) out.push(withY(intoRoom(r.rect, r.front, 5, 6, 1)), withY(intoRoom(r.rect, r.front, 5, 6, 3)));
  void SOMA; void CANOPIC; void GROUND;
  return out;
}
