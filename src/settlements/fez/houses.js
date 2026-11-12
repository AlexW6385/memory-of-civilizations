// The houses of the medina as elements (docs/settlements/fez.md §5): which lot carries dukkans, which is open, which is rich.
import { lots, lanes, ground0, inLot, riverZ, RIVER, quayY, RADIUS, BRIDGES, K, S } from './layout.js';

/** The lane a lot's door opens on: { w, kind } of the lane touching the door's side, or null. */
export function doorLane(l) {
  const r = l.rect, e = l.door, m = 0.8;
  for (const q of lanes()) {
    if (e === 's' && q.axis === 'x' && Math.abs(r[3] - q.r[1]) < m && q.r[2] > r[0] + 2 && q.r[0] < r[2] - 2) return q;
    if (e === 'n' && q.axis === 'x' && Math.abs(r[1] - q.r[3]) < m && q.r[2] > r[0] + 2 && q.r[0] < r[2] - 2) return q;
    if (e === 'e' && q.axis === 'z' && Math.abs(r[2] - q.r[0]) < m && q.r[3] > r[1] + 2 && q.r[1] < r[3] - 2) return q;
    if (e === 'w' && q.axis === 'z' && Math.abs(r[0] - q.r[2]) < m && q.r[3] > r[1] + 2 && q.r[1] < r[3] - 2) return q;
  }
  return null;
}
const rngS = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
/** The trades of the dukkans along a street at x: bakers and potters in the west, booksellers and chandlers toward the Qarawiyyin. */
export function tradesAt(x, seed) {
  const W = ['bread', 'pottery', 'dates', 'cloth', 'bread', 'slipper'], M = ['spice', 'cloth', 'brass', 'dates', 'slipper', 'pottery'], Q = ['books', 'perfume', 'candle', 'books', 'henna', 'dates'];
  const set = x < -60 ? W : x > 100 ? Q : M;
  return [set[seed % set.length], set[(seed * 3 + 1) % set.length]];
}
/** The houses of the medina with their dukkans: the lots on a main street carry shops; a share of those on the row lanes and the derbs near the core. */
export function houseList() {
  const L = lots(), houses = [], rand = rngS(55);
  // the houses nearest the madrasa's door are open and furnished (a riad with its salon): wide, deep
  const near = (l) => Math.hypot((l.rect[0] + l.rect[2]) / 2 + 132, (l.rect[1] + l.rect[3]) / 2 + 30);
  const cand = L.filter((l) => l.w >= 10.5 && l.d >= 14).sort((a, b) => near(a) - near(b)).slice(0, 14);
  for (const l of L) {
    const open = cand.includes(l), rich = open || (l.seed % 9 === 0 && Math.hypot(l.rect[0], l.rect[1]) < 200);
    const q = doorLane(l), cx = (l.rect[0] + l.rect[2]) / 2, dist = Math.hypot(cx, (l.rect[1] + l.rect[3]) / 2);
    const shop = q && (q.kind === 'street' || (q.kind === 'lane' && dist < 230 && rand() < 0.3) || (q.kind === 'derb' && dist < 170 && rand() < 0.07));
    houses.push({ t: 'fez_house', rect: l.rect, y: l.y, foot: l.foot, door: l.door, storeys: l.storeys, seed: l.seed, open, rich, laneW: q ? q.w : 2.4, shops: shop ? tradesAt(cx, l.seed) : undefined });
  }
  return houses;
}

/** The lanes' gutters and paving courses (near level), the covered stretches of the derbs, the wash-places on the quays. */
export function laneElements() {
  const out = [], rand = rngS(909);
  let n = 0;
  for (const q of lanes()) {
    const alongX = q.axis === 'x', len = alongX ? q.r[2] - q.r[0] : q.r[3] - q.r[1], c = alongX ? (q.r[1] + q.r[3]) / 2 : (q.r[0] + q.r[2]) / 2, u0 = alongX ? q.r[0] : q.r[1];
    const mid = alongX ? [u0 + len / 2, c] : [c, u0 + len / 2];
    if (Math.hypot(mid[0], mid[1]) > (q.kind === 'derb' ? 150 : 300) || len < 4) continue;
    const st = 2.5, ys = []; for (let u = u0; u <= u0 + len + st; u += st) ys.push(alongX ? ground0(u, c) : ground0(c, u));
    out.push({ t: 'fez_lane', rect: q.r, axis: q.axis, ys, step: st, kind: q.kind });
    // a covered stretch of a derb: the sabat, a room over the lane between the houses either side
    if (q.kind === 'derb' && len > 10 && Math.hypot(mid[0], mid[1]) < 190 && (n++ % 3) === 0) {
      const z = q.r[1] + 3.0 + rand() * Math.min(4, len - 9), zm = z + 1.6;
      if (inLot(q.r[0] - 0.7, zm) && inLot(q.r[2] + 0.7, zm) && inLot(q.r[0] - 0.7, z) && inLot(q.r[2] + 0.7, z + 3.2)) out.push({ t: 'fez_sabat', rect: [q.r[0], z, q.r[2], z + 3.2], y: ground0(c, zm), clear: 4.0 });
    }
  }
  for (const { x, side } of washPlaces()) out.push({ t: 'fez_wash', at: [x, riverZ(x) + side * (RIVER.w / 2 + 1.5)], side, top: quayY(x, side), water: RIVER.water, cz: riverZ(x) });
  return out;
}
/** Where the women wash: x along the river and the bank (-1 north, +1 south); clear of the bridges. */
export function washPlaces() {
  const rand = rngS(311), out = [];
  for (let x = -250; x < 280; x += 31 + rand() * 18) { if (BRIDGES.some((b) => Math.abs(b.x - x) < 6)) continue; out.push({ x, side: rand() < 0.5 ? -1 : 1 }); }
  return out;
}
