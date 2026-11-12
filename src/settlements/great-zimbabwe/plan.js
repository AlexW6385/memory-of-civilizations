// Great Zimbabwe about 1350 (docs/settlements/great-zimbabwe.md §2–§4): the Great Enclosure with its
// outer and inner walls, the parallel passage and the conical tower; the Hill Complex's walls; the
// Valley Ruins' enclosures.

import { ENCLOSURE, TOWER, PLATFORM, HILL, WEST, RECESS, ASCENT, VALLEY, height, inWalled, onAscent } from './layout.js';
import { goodsAt, courtAt, kraals } from './life.js';

const E = [];
const ellipse = (c, r, n, a0 = 0, a1 = Math.PI * 2) => Array.from({ length: n + 1 }, (_, k) => { const a = a0 + (a1 - a0) * k / n; return [c[0] + Math.cos(a) * r[0], c[1] + Math.sin(a) * r[1]]; });
const [ex, ez] = ENCLOSURE.c, [ra, rb] = ENCLOSURE.r;
// the outer wall (11 m high at its greatest, chevron band on the north-east), with the north entrance
E.push({ t: 'dry_wall', pts: ellipse(ENCLOSURE.c, ENCLOSURE.r, 40, -Math.PI * 0.42, Math.PI * 1.45), h: 10, th: 4.5, y: 0, chevron: [0, 0.2], drains: [0.035, 0.06, 0.092, 0.12, 0.152, 0.185] });
// the inner wall forming the narrow parallel passage (about 2 m wide) on the east, from the north-east round to the south-east
E.push({ t: 'dry_wall', pts: ellipse(ENCLOSURE.c, [ra - 5.9, rb - 5.9], 16, -Math.PI * 0.3, Math.PI * 0.4), h: 8, th: 2.5, y: 0, lichen: 0.1 });
// the conical tower stands just inside the north entrance, left of the path, so that the visitor coming up from the valley
// sees its cone between the rounded ends of the outer wall (TOWER in layout.js: the arrival looks at it); its small companion
// beside it, and the platform "beside the tower", the largest at Great Zimbabwe (zimfieldguide), across the path
E.push({ t: 'cone_tower', c: TOWER.c, r: TOWER.r, h: TOWER.h });
E.push({ t: 'cone_tower', c: [TOWER.c[0] - 5.5, TOWER.c[1] - 3], r: 1.2, h: 4, dentelle: false });
E.push({ t: 'platform', c: PLATFORM, r: 3.8, h: 0.9, step: Math.PI * 1.0 });
// the tower's foot paved with daga, a kerb round it; the forecourt in the entrance's mouth, a kerbed court of daga that the path crosses
// (zimfieldguide: courtyards paved with dhaka "often with raised kerbs" [placing inferred]); two round platforms each with its monolith
E.push({ t: 'daga_yard', c: TOWER.c, r: [5.4, 5.4], y: 0 });
E.push({ t: 'daga_yard', c: [43, 85.5], r: [9, 5], y: 0 });
for (const [px, pz, pr, mh] of [[30.5, 97, 1.7, 2.1], [57.5, 97.5, 1.4, 1.8]]) {
  E.push({ t: 'platform', c: [px, pz], r: pr, h: 0.7, step: Math.PI * 0.5 });
  E.push({ t: 'monolith', at: [px, pz], y: 0.64, rot: px * 0.3, h: mh });
}
const yh = (x, z) => height(x, z);
// the Hill Complex: walls along the ridge among the boulders, broken on the south where the Ancient
// Ascent comes up through its cleft (docs/settlements/great-zimbabwe.md §11)
const ga = Math.acos((ASCENT.x - HILL.c[0]) / (HILL.r[0] * 0.5));      // the ascent's crossing of the ridge wall
E.push({ t: 'dry_wall', pts: ellipse(HILL.c, [HILL.r[0] * 0.5, HILL.r[1] * 0.42], 8, Math.PI * 0.1, ga - 0.11), h: 6, th: 3, yAt: yh });
E.push({ t: 'dry_wall', pts: ellipse(HILL.c, [HILL.r[0] * 0.5, HILL.r[1] * 0.42], 18, ga + 0.11, Math.PI * 1.75), h: 6, th: 3, yAt: yh });
{
  // the Western Enclosure (zimfieldguide: "bounded by two curved walls over 30 feet (9 metres) high";
  // the Great West Wall "nearly 8 metres high and 4.2 metres wide", "capped by turrets and
  // monoliths"; its floor levelled with daga, the hut floors "just a metre apart")
  const [wx, wz] = WEST.c, [wa, wb] = WEST.r, P = (a) => [wx + Math.cos(a) * wa, wz + Math.sin(a) * wb];
  E.push({ t: 'dry_wall', pts: ellipse(WEST.c, WEST.r, 14, Math.PI * 0.55, Math.PI * 1.45), h: 8.5, th: 4.2, yAt: yh, monoliths: [0.58, 0.97] });
  E.push({ t: 'dry_wall', pts: ellipse(WEST.c, WEST.r, 16, Math.PI * 1.42, Math.PI * 2.45), h: 7, th: 2.6, yAt: yh });
  for (const f of [0.68, 0.8, 0.92, 1.02]) {
    const a = Math.PI * f, [x, z] = P(a), nx = Math.cos(a) / wa, nz = Math.sin(a) / wb, L = Math.hypot(nx, nz), o = 0.45;
    E.push({ t: 'cone_tower', c: [x + nx / L * o, z + nz / L * o], r: 0.85, h: 2.6, y: yh(x, z) + 8.5 * 0.9, dentelle: false });
  }
  for (const [dx, dz, r] of [[-10, -4, 2.6], [-3, -7, 2.4], [5, -5, 2.7], [-8, 4, 2.5], [1, 3, 2.3], [9, 3, 2.6]]) {
    const x = wx + dx, z = wz + dz, a = Math.atan2(wz + 12 - z, wx - x);     // the doors toward the court's south side
    E.push({ t: 'daga_hut', c: [x, z], r, y: WEST.y, h: 2.1, seed: (Math.round(a * 100) % 628 + 628) % 628, open: true });
  }
  // the Recess Enclosure: a small walled space open to the north, its roof of thatch on four posts in the walls
  const [rx, rz] = RECESS.c, [ra2, rb2] = RECESS.r;
  E.push({ t: 'dry_wall', pts: ellipse(RECESS.c, RECESS.r, 12, Math.PI * 1.64, Math.PI * 3.36), h: 2.6, th: 1.4, yAt: yh });
  E.push({ t: 'thatch_roof', c: RECESS.c, r: [ra2 - 0.2, rb2 - 0.2], y: RECESS.y, h: 3.3, yAt: yh, posts: [0.22, 0.78, 1.22, 1.78].map((f) => [rx + Math.cos(Math.PI * f) * ra2, rz + Math.sin(Math.PI * f) * rb2]) });
  // the Ancient Ascent: granite steps up the south face, low walls either side, through the cleft between two boulders
  E.push({ t: 'stone_steps', x: ASCENT.x, z0: ASCENT.z0, z1: -159.2, w: ASCENT.w, yAt: yh });
  for (const s of [-1, 1]) E.push({ t: 'dry_wall', pts: [[ASCENT.x + s * (ASCENT.w / 2 + 0.45), -110], [ASCENT.x + s * (ASCENT.w / 2 + 0.45), -142]], h: 1.1, th: 0.8, yAt: yh });
  for (const s of [-1, 1]) { const x = ASCENT.x + s * 7.0, z = -150; E.push({ t: 'boulder', c: [x, z], r: 4.4, h: 4.6, y: Math.min(...[[x, z], [x + 4, z], [x - 4, z], [x, z + 4], [x, z - 4]].map(([p, q]) => yh(p, q))) - 0.3, seed: s > 0 ? 41 : 43 }); }
}
// the Valley Ruins (§12): walled enclosures each round a court of daga houses, the houses set
// opposite the entrance with their doors to the court
for (const V of VALLEY) {
  const [cx, cz] = V.c, [ra1, rb1] = V.r, y = yh(cx, cz), gm = (V.a1 + V.a0 + Math.PI * 2) / 2;
  E.push({ t: 'dry_wall', pts: ellipse(V.c, V.r, 16, V.a0, V.a1), h: 3.5, th: 1.6, yAt: yh });
  E.push({ t: 'daga_yard', c: V.c, r: [ra1 - 1.0, rb1 - 1.0], y });
  for (const da of [Math.PI, Math.PI - 2.0, Math.PI + 2.0]) {
    const a = gm + da, x = cx + Math.cos(a) * ra1 * 0.5, z = cz + Math.sin(a) * rb1 * 0.5, toC = Math.atan2(cz - z, cx - x);
    E.push({ t: 'daga_hut', c: [x, z], r: 2.4 + (Math.abs(da - Math.PI) < 0.1 ? 0.4 : 0), y: y + 0.06, h: 2.1, seed: (Math.round(toC * 100) % 628 + 628) % 628, open: true });
  }
}

// the goods of the coast in the first court of the Valley Ruins; the cattle kraals by the homesteads (life.js)
E.push({ t: 'trade_goods', ...goodsAt() });
for (const K of kraals()) E.push({ t: 'kraal', ...K });
// the smith's yard in the second court, the soapstone carver's corner in the third (the houses stand opposite the entrance, the goods between)
{ const a = courtAt(1), b = courtAt(2);
  E.push({ t: 'smithy', at: a.at, y: a.y, rot: a.gm });
  E.push({ t: 'stone_carver', at: b.at, y: b.y, rot: b.gm + Math.PI / 2 }); }
// the Hill Complex's small enclosures between the ridge wall and the Western Enclosure (zimfieldguide: "narrow passages among the
// small enclosures"): short curved walls with narrow entrances, a covered passage between two walls under stone lintels, and the
// Balcony — three walls on a great boulder [positions inferred]
for (const [cx, cz, ra, rb, a0, a1] of [[8, -176, 6, 5, 0.5, 5.6], [20, -190, 5, 4, 3.4, 9.0], [-8, -203, 7, 5, 1.0, 6.2], [-32, -170, 5, 4, 2.2, 7.6], [24, -180, 4.5, 3.5, 4.0, 9.4]])
  E.push({ t: 'dry_wall', pts: ellipse([cx, cz], [ra, rb], 10, a0, a1), h: 2.8, th: 1.3, yAt: yh });
{
  const z0 = -192, x0 = -6, x1 = 5, ym = yh(0, z0);
  for (const dz of [-1, 1]) E.push({ t: 'dry_wall', pts: [[x0, z0 + dz * 1.0], [x1, z0 + dz * 1.0]], h: 2.6, th: 1.1, yAt: yh, rubble: false });
  for (let x = x0 + 0.4; x < x1 - 0.5; x += 1.55) E.push({ t: 'block', rect: [x, z0 - 1.55, x + 1.7, z0 + 1.55], y0: ym + 2.1, y1: ym + 2.55, mat: 'granite_block' });
  const bx = 40, bz = -170, by = Math.min(...[[bx, bz], [bx + 4, bz], [bx - 4, bz], [bx, bz + 4], [bx, bz - 4]].map(([p, q]) => yh(p, q))) - 0.3, top = by + 5.2;
  E.push({ t: 'boulder', c: [bx, bz], r: 5.2, h: 5.2, y: by, seed: 59 });
  E.push({ t: 'dry_wall', pts: [[bx - 2.0, bz + 1.6], [bx - 2.2, bz - 0.4], [bx - 1.2, bz - 1.9], [bx + 0.9, bz - 2.3], [bx + 2.2, bz - 1.2], [bx + 2.2, bz + 1.2]], h: 1.7, th: 0.9, y: top - 0.55, rubble: false });
}

// the Eastern Enclosure at the hill's east end: a curved wall, the stone platform with the soapstone
// birds on their columns in a row and tall monoliths behind them (Wikipedia, Zimbabwe Bird: eight
// birds; slots in a platform here held the monoliths; the birds' order is unknown — ours a row)
{
  const EC = [46, -195];
  E.push({ t: 'dry_wall', pts: ellipse(EC, [13, 10], 12, Math.PI * 0.75, Math.PI * 2.45), h: 3.2, th: 1.6, yAt: yh, dentelle: [0.78, 1] });
  // round stone platforms on the terraced slope, each with a monolith (zimfieldguide: "groups of circular stone platforms" that carried monoliths)
  for (const [px, pz, pr] of [[40.5, -191.2, 1.5], [46.5, -190.4, 1.3], [52, -191.4, 1.5]]) {
    const ys = [[px, pz], [px + pr, pz], [px - pr, pz], [px, pz + pr], [px, pz - pr]].map(([a, b]) => yh(a, b)), y0 = Math.min(...ys), ph = 0.7 + Math.max(...ys) - y0;
    E.push({ t: 'platform', c: [px, pz], r: pr, h: ph, y: y0, step: Math.PI * 0.5 });
    E.push({ t: 'monolith', at: [px, pz], y: y0 + ph - 0.06, rot: px * 0.3, h: 1.7 + (px % 3) * 0.2 });
  }
  const P = [40, -200.2, 52, -196], hs = [[P[0], P[1]], [P[2], P[1]], [P[0], P[3]], [P[2], P[3]], [46, -198]].map(([x, z]) => yh(x, z));
  const y1 = Math.max(...hs) + 0.5;
  E.push({ t: 'block', rect: P, y0: Math.min(...hs) - 0.4, y1, mat: 'granite_block', walk: true });
  for (let k = 0; k < 8; k++) E.push({ t: 'soapstone_bird', at: [40.9 + k * 1.46, -197.1], y: y1, rot: Math.PI + (k % 3 - 1) * 0.06, s: k === 2 || k === 5 ? 0.8 : 1 });
  for (let k = 0; k < 6; k++) E.push({ t: 'monolith', at: [41.6 + k * 1.95, -199.3], y: y1, rot: (k % 2 ? 0.1 : -0.08), h: 1.9 + (k * 37 % 10) / 10 });
}
// the granite boulders of the hill, the walls winding among them
{
  const walls = [];
  for (const el of E) if (el.t === 'dry_wall' && el.yAt) for (let k = 0; k < el.pts.length - 1; k++) for (let f = 0; f < 1; f += 0.1) walls.push([el.pts[k][0] + (el.pts[k + 1][0] - el.pts[k][0]) * f, el.pts[k][1] + (el.pts[k + 1][1] - el.pts[k][1]) * f]);
  let seed = 7;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (let n = 0, tries = 0; n < 18 && tries < 600; tries++) {
    const a = rnd() * Math.PI * 2, e = 0.15 + rnd() * 0.75, x = HILL.c[0] + Math.cos(a) * HILL.r[0] * e, z = HILL.c[1] + Math.sin(a) * HILL.r[1] * e, r = 3 + rnd() * 5;
    if (walls.some(([wx, wz]) => Math.hypot(wx - x, wz - z) < r + 3) || Math.hypot(x - 46, z + 195) < r + 16) continue;
    if (yh(x, z) < 6 || inWalled(x, z, r + 3) || onAscent(x, z, r + 2)) continue;
    if (E.some((o) => o.t === 'boulder' && Math.hypot(o.c[0] - x, o.c[1] - z) < o.r + r + 2)) continue;
    const ys = [[x, z], [x + r, z], [x - r, z], [x, z + r], [x, z - r]].map(([p, q]) => yh(p, q));
    E.push({ t: 'boulder', c: [x, z], r, h: r * (0.55 + rnd() * 0.35), y: Math.min(...ys) - 0.2, seed: n * 3 + 1 });
    n++;
  }
}

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
export const great = {
  id: 'great-zimbabwe-enclosure',
  name: { en: 'The Great Enclosure', zh: '大围场' },
  era: { en: 'Great Zimbabwe, about 1350', zh: '大津巴布韦，约1350年' },
  style: 'zimbabwe',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [ex + 6, ez - rb - 18], facing: 's' },
  bounds: [-180, -260, ex + ra + 4, ez + rb + 4],
  view: [ex - ra, ez - rb, ex + ra, ez + rb],
  bakeTop: 12,
  elements: E,
  rooms: [room('enclosure', [ex - ra + 6, ez - rb + 6, ex + ra - 6, ez + rb - 6], 0, 'open'),
    room('western enclosure', [WEST.c[0] - 6, WEST.c[1] + 7, WEST.c[0] + 6, WEST.c[1] + 11], WEST.y, 'open'),
    room('recess', [RECESS.c[0] - 3, RECESS.c[1] - 2, RECESS.c[0] + 3, RECESS.c[1] + 2], RECESS.y, 'open'),
    room('ascent top', [ASCENT.x - 0.8, -158, ASCENT.x + 0.8, -156], height(ASCENT.x, -157) + 0.08, 'open')],
  walks: [Object.assign([[ex + 6, ez - rb - 18], [ex + 6, ez - rb + 2], [ex + 6, ez]], { y0: 0 })],
};
export default great;
