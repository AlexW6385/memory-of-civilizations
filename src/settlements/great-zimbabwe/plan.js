// Great Zimbabwe about 1350 (docs/settlements/great-zimbabwe.md §2–§4): the Great Enclosure with its
// outer and inner walls, the parallel passage and the conical tower; the Hill Complex's walls; the
// Valley Ruins' enclosures.

import { ENCLOSURE, HILL, WEST, RECESS, ASCENT, VALLEY, height, inWalled, onAscent } from './layout.js';

const E = [];
const ellipse = (c, r, n, a0 = 0, a1 = Math.PI * 2) => Array.from({ length: n + 1 }, (_, k) => { const a = a0 + (a1 - a0) * k / n; return [c[0] + Math.cos(a) * r[0], c[1] + Math.sin(a) * r[1]]; });
const [ex, ez] = ENCLOSURE.c, [ra, rb] = ENCLOSURE.r;
// the outer wall (11 m high at its greatest, chevron band on the north-east), with the north entrance
E.push({ t: 'dry_wall', pts: ellipse(ENCLOSURE.c, ENCLOSURE.r, 40, -Math.PI * 0.42, Math.PI * 1.45), h: 10, th: 4.5, y: 0, chevron: [0, 0.2] });
// the inner wall forming the narrow parallel passage on the east, and an inner ring round the tower's court
E.push({ t: 'dry_wall', pts: ellipse(ENCLOSURE.c, [ra - 7, rb - 7], 14, -Math.PI * 0.35, Math.PI * 0.35), h: 8, th: 2.5, y: 0 });
E.push({ t: 'dry_wall', pts: ellipse([ex + 25, ez - 5], [16, 14], 14, Math.PI * 0.6, Math.PI * 1.9), h: 4, th: 1.6, y: 0 });
E.push({ t: 'cone_tower', c: [ex + 30, ez - 8], r: 2.8, h: 10 });
E.push({ t: 'cone_tower', c: [ex + 24, ez - 10], r: 1.2, h: 4, dentelle: false });
// the platform beside the tower, 7.6 m across, the largest at Great Zimbabwe (zimfieldguide)
E.push({ t: 'platform', c: [ex + 31, ez], r: 3.8, h: 0.9, step: Math.PI * 1.15 });
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
    E.push({ t: 'daga_hut', c: [x, z], r, y: WEST.y, h: 2.1, seed: (Math.round(a * 100) % 628 + 628) % 628 });
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
    E.push({ t: 'daga_hut', c: [x, z], r: 2.4 + (Math.abs(da - Math.PI) < 0.1 ? 0.4 : 0), y: y + 0.06, h: 2.1, seed: (Math.round(toC * 100) % 628 + 628) % 628 });
  }
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
