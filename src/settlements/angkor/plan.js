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
for (const [x, dir] of [[CAUSEWAY.outer[0] - 4, 'e'], [CAUSEWAY.inner[2] - 6, 'w']]) E.push({ t: 'stairs', rect: [x, -3.5, x + 4, 3.5], y0: 0, y1: 1.1, dir, mat: 'sandstone_khmer' });
// the cross-shaped terrace before the temple's western entrance (the "terrace of honour")
E.push({ t: 'k_terrace', rect: [CX - 99 - 14, -12, CX - 99, 12], y0: 0, y1: 1.4 });
for (const s of [-1, 1]) E.push({ t: 'naga_rail', a: [CX - 112, s * 11.6], b: [CX - 100, s * 11.6], y: 1.4, h: 0.8 });

// ── libraries and basins ──
for (const r of LIBRARIES) E.push({ t: 'k_library', rect: r, y: 1.4, h: 4.8 });
for (const b of BASINS) {
  E.push({ t: 'water_rect', rect: b, y: LEVEL.basin });
  for (const [a, c] of [[[b[0], b[1]], [b[2], b[1]]], [[b[0], b[3]], [b[2], b[3]]], [[b[0], b[1]], [b[0], b[3]]], [[b[2], b[1]], [b[2], b[3]]]]) E.push({ t: 'canal_wall', a, b: c, y: 0.1, bed: LEVEL.basinBed, th: 0.8 });
}

// ── the temple ──
E.push({ t: 'k_terrace', rect: T.base.rect, y0: 0, y1: T.base.y });
E.push({ t: 'k_gallery', rect: T.third.line, y: T.base.y, w: T.third.w, h: T.third.h, solid: 'in', half: true, gates: true, gate: 22, gateH: 12 });
E.push({ t: 'k_terrace', rect: T.second.terrace, y0: T.base.y, y1: T.second.y });
E.push({ t: 'k_gallery', rect: T.second.line, y: T.second.y, w: T.second.w, h: T.second.h, solid: 'out', gates: true, gate: 12, gateH: 13, corner: 12 });
E.push({ t: 'k_terrace', rect: T.bakan.terrace, y0: T.second.y, y1: T.bakan.y });
E.push({ t: 'k_gallery', rect: T.bakan.line, y: T.bakan.y, w: T.bakan.w, h: T.bakan.h, solid: 'out', gates: true, gate: 8, gateH: 10 });
for (const [x, z] of [[CX - 28, -28], [CX + 28, -28], [CX - 28, 28], [CX + 28, 28]]) E.push({ t: 'k_tower', c: [x, z], y: T.bakan.y + T.bakan.h * 0.2, w: 9, h: 32, tiers: 5 });
E.push({ t: 'k_tower', c: [CX, 0], y: T.bakan.y, w: 15, h: 65 - T.bakan.y, tiers: 6 });
// the stairs: up the base terrace, up the second level, the steep stairs of the Bakan, on each axis
const st = (rect, y0, y1, dir) => E.push({ t: 'stairs', rect, y0, y1, dir, mat: 'sandstone_khmer' });
st([CX - 99 - 0.01 - 2.5, -6, CX - 99, 6], T.base.y - 0.2, T.base.y, 'e');
for (const [face, sgn] of [['x', -1], ['x', 1], ['z', -1], ['z', 1]]) {
  const h2 = (T.second.y - T.base.y) / 0.16 * 0.26, h3 = (T.bakan.y - T.second.y) / 0.2 * 0.22;
  if (face === 'x') {
    const x2 = sgn < 0 ? T.second.terrace[0] : T.second.terrace[2], x3 = sgn < 0 ? T.bakan.terrace[0] : T.bakan.terrace[2];
    st(sgn < 0 ? [x2 - h2, -4, x2, 4] : [x2, -4, x2 + h2, 4], T.base.y, T.second.y, sgn < 0 ? 'e' : 'w');
    st(sgn < 0 ? [x3 - h3, -3, x3, 3] : [x3, -3, x3 + h3, 3], T.second.y, T.bakan.y, sgn < 0 ? 'e' : 'w');
  } else {
    const z2 = sgn < 0 ? T.second.terrace[1] : T.second.terrace[3], z3 = sgn < 0 ? T.bakan.terrace[1] : T.bakan.terrace[3];
    st(sgn < 0 ? [CX - 4, z2 - h2, CX + 4, z2] : [CX - 4, z2, CX + 4, z2 + h2], T.base.y, T.second.y, sgn < 0 ? 's' : 'n');
    st(sgn < 0 ? [CX - 3, z3 - h3, CX + 3, z3] : [CX - 3, z3, CX + 3, z3 + h3], T.second.y, T.bakan.y, sgn < 0 ? 's' : 'n');
  }
}

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [
  room('bakan', T.bakan.terrace, T.bakan.y, 'open'),
  room('second', T.second.terrace, T.second.y, 'open'),
  room('court', T.base.rect, T.base.y, 'open'),
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
