// Angkor Wat as Suryavarman II built it (c. 1113–1150; docs/settlements/angkor.md §4): the
// western gate on the enclosure wall, the inner causeway with its serpent balustrades, the two
// libraries and the two basins, and the temple — a base terrace with the third gallery (187 ×
// 215 m), the second level with its gallery, the central level (Bakan) 13 m higher with its
// gallery, four corner towers and the central tower, 65 m above the ground. The temple at its true
// size; the enclosure and the moat drawn in (see §2).

import { LEVEL, CX, T, ENCLOSURE, CAUSEWAY, BASINS, LIBRARIES } from './layout.js';

const E = [];
const [ex0, ez0, ex1, ez1] = ENCLOSURE;
const wallPal = { plaster: 'laterite', roof: 'sandstone_khmer', plinth: 'laterite' };

// ── the enclosure wall of laterite, the western gate with its three towers ──
E.push({ t: 'ming_wall', a: [ex0, ez0], b: [ex1, ez0], y: 0, h: 4.5, th: 1.2, pal: wallPal });
E.push({ t: 'ming_wall', a: [ex0, ez1], b: [ex1, ez1], y: 0, h: 4.5, th: 1.2, pal: wallPal });
E.push({ t: 'ming_wall', a: [ex1, ez0], b: [ex1, ez1], y: 0, h: 4.5, th: 1.2, gates: [{ at: ez1 - ez0 >> 1, w: 6, h: 3.5 }], pal: wallPal });
E.push({ t: 'ming_wall', a: [ex0, ez0], b: [ex0, -22], y: 0, h: 4.5, th: 1.2, pal: wallPal });
E.push({ t: 'ming_wall', a: [ex0, 22], b: [ex0, ez1], y: 0, h: 4.5, th: 1.2, pal: wallPal });
E.push({ t: 'k_gallery', rect: [ex0 - 3, -22, ex0 + 3, 22], y: 1.0, w: 4, h: 3.6, solid: 'out', gates: true, gate: 5, gateSides: 'w' });
for (const z of [-14, 14]) E.push({ t: 'k_tower', c: [ex0, z], y: 1.0, w: 7, h: 16, tiers: 3, porches: false });
E.push({ t: 'k_tower', c: [ex0, 0], y: 1.0, w: 9, h: 21, tiers: 4 });

// ── the causeways ──
E.push({ t: 'k_terrace', rect: CAUSEWAY.outer, y0: LEVEL.moatBed, y1: 1.0 });
E.push({ t: 'k_terrace', rect: [CAUSEWAY.inner[0] + 6, CAUSEWAY.inner[1], CAUSEWAY.inner[2], CAUSEWAY.inner[3]], y0: 0, y1: 1.2 });
for (const s of [-1, 1]) {
  E.push({ t: 'naga_rail', a: [CAUSEWAY.outer[0] + 1, s * 4.3], b: [CAUSEWAY.outer[2] - 2, s * 4.3], y: 1.0, h: 1.0 });
  E.push({ t: 'naga_rail', a: [CAUSEWAY.inner[0] + 8, s * 4.3], b: [CAUSEWAY.inner[2] - 6, s * 4.3], y: 1.2, h: 0.9 });
}
// the giant stone lions guarding the causeway's western steps (§12)
for (const s of [-1, 1]) E.push({ t: 'k_lion', at: [CAUSEWAY.outer[0] - 2.2, s * 5.2], y: 0, face: 'w', s: 1.15 });
for (const [x, dir] of [[CAUSEWAY.outer[0] - 4, 'e'], [CAUSEWAY.inner[2] - 6, 'w']]) E.push({ t: 'stairs', rect: [x, -3.5, x + 4, 3.5], y0: 0, y1: 1.1, dir, mat: 'sandstone_khmer' });
// the cross-shaped terrace before the temple's western entrance (the "terrace of honour")
E.push({ t: 'k_terrace', rect: [CX - 99 - 14, -12, CX - 99, 12], y0: 0, y1: 1.4 });
// its serpent balustrades broken for the steps on its north and south sides; lions on pedestals flank the steps on its three sides
for (const s of [-1, 1]) {
  E.push({ t: 'naga_rail', a: [CX - 112, s * 11.6], b: [CX - 108.4, s * 11.6], y: 1.4, h: 0.8 });
  E.push({ t: 'naga_rail', a: [CX - 103.6, s * 11.6], b: [CX - 100, s * 11.6], y: 1.4, h: 0.8 });
  E.push({ t: 'stairs', rect: s < 0 ? [CX - 108, -14.4, CX - 104, -12] : [CX - 108, 12, CX - 104, 14.4], y0: 0, y1: 1.4, dir: s < 0 ? 's' : 'n', mat: 'sandstone_khmer' });
  for (const x of [CX - 108.9, CX - 103.1]) E.push({ t: 'k_lion', at: [x, s * 13.3], y: 0, face: s < 0 ? 'n' : 's', s: 1.0 });
  E.push({ t: 'k_lion', at: [CX - 112.3, s * 6.6], y: 1.4, face: 'w', s: 0.9 });
}

// ── libraries and basins ──
for (const r of LIBRARIES) E.push({ t: 'k_library', rect: r, y: 1.4, h: 4.8 });
for (const b of BASINS) {
  E.push({ t: 'water_rect', rect: b, y: LEVEL.basin });
  for (const [a, c] of [[[b[0], b[1]], [b[2], b[1]]], [[b[0], b[3]], [b[2], b[3]]], [[b[0], b[1]], [b[0], b[3]]], [[b[2], b[1]], [b[2], b[3]]]]) E.push({ t: 'canal_wall', a, b: c, y: 0.1, bed: LEVEL.basinBed, th: 0.8 });
}

// ── the temple ──
// the base terrace, built in pieces round the four basins of the cruciform cloister
const CL = { rect: [T.third.line[0] + T.third.w / 2 + 0.46, -19, T.second.terrace[0], 19], west: CX - 89, stair: T.second.terrace[0] - (T.second.y - T.base.y) / 0.16 * 0.26 };
{
  const xm = (CL.rect[0] + CL.rect[2]) / 2, a = CL.rect[0] + 1, b = xm - 3.6, c = xm + 3.6, d = CL.rect[2] - 1;
  CL.basins = [[a, -12.8, b, -5], [c, -12.8, d, -5], [a, 5, b, 12.8], [c, 5, d, 12.8]];
}
for (const r of carve(T.base.rect, CL.basins)) E.push({ t: 'k_terrace', rect: r, y0: 0, y1: T.base.y });
E.push({ t: 'k_cloister', rect: CL.rect, y: T.base.y, w: 4, h: 3.4, west: CL.west, stair: CL.stair, basins: CL.basins });
E.push({ t: 'k_gallery', rect: T.third.line, y: T.base.y, w: T.third.w, h: T.third.h, solid: 'in', half: true, gates: true, gate: 22, gateH: 12, relief: true });
E.push({ t: 'k_terrace', rect: T.second.terrace, y0: T.base.y, y1: T.second.y });
E.push({ t: 'k_gallery', rect: T.second.line, y: T.second.y, w: T.second.w, h: T.second.h, solid: 'out', gates: true, gate: 12, gateH: 13, corner: 12, devatas: true });
E.push({ t: 'k_terrace', rect: T.bakan.terrace, y0: T.second.y, y1: T.bakan.y });
E.push({ t: 'k_gallery', rect: T.bakan.line, y: T.bakan.y, w: T.bakan.w, h: T.bakan.h, solid: 'out', gates: true, gate: 8, gateH: 10, windows: true });
for (const [x, z] of [[CX - 28, -28], [CX + 28, -28], [CX - 28, 28], [CX + 28, 28]]) E.push({ t: 'k_tower', c: [x, z], y: T.bakan.y + T.bakan.h * 0.2, w: 9, h: 32, tiers: 5 });
// the central sanctuary, open on its four sides as built, the standing eight-armed Vishnu in its cella (§12)
E.push({ t: 'k_tower', c: [CX, 0], y: T.bakan.y, w: 15, h: 65 - T.bakan.y, tiers: 6, cella: { half: 2.6, dw: 1.0, dh: 3.6, image: { face: 'w', h: 3.3 } } });
// the stairs: up the base terrace, up the second level, the steep stairs of the Bakan, on each axis
const st = (rect, y0, y1, dir) => E.push({ t: 'stairs', rect, y0, y1, dir, mat: 'sandstone_khmer' });
st([CX - 99 - 0.01 - 2.5, -6, CX - 99, 6], T.base.y - 0.2, T.base.y, 'e');
for (const [face, sgn] of [['x', -1], ['x', 1], ['z', -1], ['z', 1]]) {
  // the Bakan's stairs: forty steps at about 65° (docs/settlements/angkor.md §11)
  const h2 = (T.second.y - T.base.y) / 0.16 * 0.26, h3 = (T.bakan.y - T.second.y) / Math.tan(63.4 * Math.PI / 180);
  if (face === 'x') {
    const x2 = sgn < 0 ? T.second.terrace[0] : T.second.terrace[2], x3 = sgn < 0 ? T.bakan.terrace[0] : T.bakan.terrace[2];
    st(sgn < 0 ? [x2 - h2, -4, x2, 4] : [x2, -4, x2 + h2, 4], T.base.y, T.second.y, sgn < 0 ? 'e' : 'w');
    E.push({ t: 'k_stair', rect: sgn < 0 ? [x3 - h3, -1.6, x3, 1.6] : [x3, -1.6, x3 + h3, 1.6], y0: T.second.y, y1: T.bakan.y, dir: sgn < 0 ? 'e' : 'w', riser: 0.325, cheek: 0.7 });
  } else {
    const z2 = sgn < 0 ? T.second.terrace[1] : T.second.terrace[3], z3 = sgn < 0 ? T.bakan.terrace[1] : T.bakan.terrace[3];
    st(sgn < 0 ? [CX - 4, z2 - h2, CX + 4, z2] : [CX - 4, z2, CX + 4, z2 + h2], T.base.y, T.second.y, sgn < 0 ? 's' : 'n');
    E.push({ t: 'k_stair', rect: sgn < 0 ? [CX - 1.6, z3 - h3, CX + 1.6, z3] : [CX - 1.6, z3, CX + 1.6, z3 + h3], y0: T.second.y, y1: T.bakan.y, dir: sgn < 0 ? 's' : 'n', riser: 0.325, cheek: 0.7 });
  }
}

/** A rectangle less the rectangles `holes` inside it (not overlapping), as rectangles: strips across x at the holes' edges, each cut along z. */
function carve(r, holes) {
  const xs = [...new Set([r[0], r[2], ...holes.flatMap((h) => [h[0], h[2]])])].sort((p, q) => p - q), out = [];
  for (let i = 0; i + 1 < xs.length; i++) {
    const a = xs[i], b = xs[i + 1], cut = holes.filter((h) => h[0] < b - 1e-6 && h[2] > a + 1e-6).sort((p, q) => p[1] - q[1]);
    let z = r[1];
    for (const h of cut) { if (h[1] > z) out.push([a, z, b, h[1]]); z = h[3]; }
    if (r[3] > z) out.push([a, z, b, r[3]]);
  }
  return out;
}

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [
  room('bakan', T.bakan.terrace, T.bakan.y, 'open'),
  room('sanctuary', [CX - 2.5, -2.5, CX + 2.5, 2.5], T.bakan.y + 0.7, 'hall'),
  room('second', T.second.terrace, T.second.y, 'open'),
  room('court', T.base.rect, T.base.y, 'open'),
  room('hall-of-echoes', [CL.rect[0] + 1, -18, CL.rect[2] - 1, -15], T.base.y + 0.4, 'hall'),
  room('enclosure', ENCLOSURE, 0, 'open'),
];
const walks = [[[-205, 0], [-196, 0], [-150, 0], [-80, 0], [-74, 0], [-60, 0], [-45, 0], [-33, 0], [-20, 0], [-8, 0]]];
walks[0].y0 = 0;

export const temple = {
  id: 'angkor-wat',
  name: { en: 'Angkor Wat', zh: '吴哥窟' },
  era: { en: 'Khmer Empire, c. 1113–1150', zh: '高棉帝国，约1113–1150年' },
  style: 'khmer',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [-206, 0], facing: 'e' },
  bounds: [ex0 - 10, ez0 - 10, ex1 + 10, ez1 + 10],
  bakeBounds: [CX - 100, -114, CX + 100, 114],
  view: [CX - 60, -66, CX + 60, 66],
  bakeTop: 65,
  elements: E,
  rooms,
  walks,
};
export default temple;
