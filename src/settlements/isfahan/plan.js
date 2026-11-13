// Naqsh-e Jahan Square and its monuments, c. 1630 (docs/settlements/isfahan.md §2–§4): the square
// at true size with its two-storey arcades, the canal and the polo posts; the Shah Mosque (portal
// on the square, the court with four iwans, the sanctuary under the great dome, all turned 45°
// toward Mecca); the Sheikh Lotfollah Mosque; Ali Qapu with its talar; the Qeysarieh portal and the
// first stretch of the vaulted bazaar; the royal garden behind Ali Qapu.

import { SQUARE, ARCADE, CANAL, GARDEN, BAZAAR, PORTAL, COURT, M, C, LOTF, ALIQAPU, ARCADE_RUNS, ARCADE_OPEN } from './layout.js';

const E = [];
const [sx0, sz0, sx1, sz1] = SQUARE, H = 12;
const mid = [0, (sz0 + sz1) / 2];
// ---- the arcades round the square, broken for the monuments and a few streets
for (const [a, b] of ARCADE_RUNS) E.push({ t: 'square_arcade', a, b, h: H, depth: ARCADE, bay: 7, facing: mid, open: ARCADE_OPEN });
for (const [x0, z0] of [[sx0 - ARCADE - 0.6, sz0 - ARCADE - 0.6], [sx1 + 0.6, sz0 - ARCADE - 0.6], [sx0 - ARCADE - 0.6, sz1 + 0.6], [sx1 + 0.6, sz1 + 0.6]]) {
  E.push({ t: 'block', walk: true, rect: [x0, z0, x0 + ARCADE, z0 + ARCADE], y0: 0, y1: H, mat: 'brick_buff' });
}
// ---- the square: paved walks by the arcades, the canal with its stone curbs, the polo posts
const k0 = sx0 + CANAL, k1 = sx1 - CANAL, q0 = sz0 + CANAL, q1 = sz1 - CANAL;
for (const r of [[sx0, sz0, k0 - 1.4, sz1], [k1 + 1.4, sz0, sx1, sz1], [k0 - 1.4, sz0, k1 + 1.4, q0 - 1.4], [k0 - 1.4, q1 + 1.4, k1 + 1.4, sz1]]) E.push({ t: 'lane', rect: r, y: 0.04, mat: 'brick_paving' });
for (const r of [[k0 - 1, q0 - 1, k0 + 1, q1 + 1], [k1 - 1, q0 - 1, k1 + 1, q1 + 1], [k0 + 1, q0 - 1, k1 - 1, q0 + 1], [k0 + 1, q1 - 1, k1 - 1, q1 + 1]]) {
  E.push({ t: 'water_rect', rect: r, y: 0.22 });
  const [x0, z0, x1, z1] = r, vert = x1 - x0 < z1 - z0;
  for (const c of vert ? [[x0 - 0.4, z0, x0, z1], [x1, z0, x1 + 0.4, z1]] : [[x0, z0 - 0.4, x1, z0], [x0, z1, x1, z1 + 0.4]]) E.push({ t: 'block', walk: true, rect: c, y0: 0, y1: 0.35, mat: 'limestone' });
}
// a flat stone footbridge over the canal on each of the square's two axes (to the Qeysarieh and the
// Shah Mosque, to Ali Qapu and Lotfollah): three low steps up over the curb, a slab over the water
const AX = (LOTF.portal[0][1] + LOTF.portal[1][1]) / 2;
const bridge = (vert, c, at) => {
  // vert: the canal runs along z at x = c (cross it along x); otherwise along x at z = c (cross along z)
  const B = 1.6, S = 1.0, half = 1.5, top = 0.45, R = (u0, v0, u1, v1) => (vert ? [u0, v0, u1, v1] : [v0, u0, v1, u1]);
  E.push({ t: 'block', walk: true, rect: R(c - B, at - half, c + B, at + half), y0: 0.3, y1: top, mat: 'limestone' });
  E.push({ t: 'stair', rect: R(c - B - S, at - half, c - B, at + half), y0: 0.04, y1: top, dir: vert ? 'e' : 's', riser: 0.137, mat: 'limestone' });
  E.push({ t: 'stair', rect: R(c + B, at - half, c + B + S, at + half), y0: 0.04, y1: top, dir: vert ? 'w' : 'n', riser: 0.137, mat: 'limestone' });
};
bridge(false, q0, 0); bridge(false, q1, 0); bridge(true, k0, AX); bridge(true, k1, AX);
E.push({ t: 'goalpost', c: [0, q0 + 6], along: 'x', gap: 7, h: 3.2 });
E.push({ t: 'goalpost', c: [0, q1 - 6], along: 'x', gap: 7, h: 3.2 });

// ---- the Shah Mosque: the portal on the square (27.5 m, minarets 42 m), the court turned to Mecca
E.push({ t: 'portal', a: PORTAL.b, b: PORTAL.a, facing: mid, h: 27.5, depth: PORTAL.depth, iwan: { w: 12, h: 21, depth: 8, pass: true, backMat: 'tile_cream' }, minarets: { h: 42, r: 2.1, y: 0 } });
// the court (70 × 70 m): arcades of two storeys on each side, an iwan in the middle of each
const ch = COURT.half, ring = COURT.ring, AH = 14;
const courtSide = (p, q, iw) => {
  const L = Math.hypot(q[0] - p[0], q[1] - p[1]), at = (s) => [p[0] + (q[0] - p[0]) * s / L, p[1] + (q[1] - p[1]) * s / L];
  E.push({ t: 'court_arcade', a: p, b: at(L / 2 - iw.half), h: AH, depth: ring, bay: 6.2, facing: C });
  E.push({ t: 'court_arcade', a: at(L / 2 + iw.half), b: q, h: AH, depth: ring, bay: 6.2, facing: C });
  E.push({ t: 'portal', a: at(L / 2 - iw.half), b: at(L / 2 + iw.half), facing: C, h: iw.h, depth: ring, iwan: iw.iwan, niches: false, minarets: iw.minarets });
};
courtSide(M(-ch, -ch), M(ch, -ch), { half: 7, h: 20, iwan: { w: 9, h: 15, depth: 6, pass: true, backMat: 'tile_cream' } });
courtSide(M(ch, -ch), M(ch, ch), { half: 8, h: 22, iwan: { w: 10, h: 17, depth: 6, back: 'tile_cream' } });
courtSide(M(-ch, ch), M(-ch, -ch), { half: 8, h: 22, iwan: { w: 10, h: 17, depth: 6, back: 'tile_cream' } });
courtSide(M(ch, ch), M(-ch, ch), { half: 10, h: 33, iwan: { w: 13, h: 26, depth: 9, pass: true, backMat: 'tile_cream', doorH: 6.5 }, minarets: { h: 48, r: 2.3, y: 0 } });
for (const [su, sv] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) E.push({ t: 'mass', a: M(su * (ch + ring / 2) - 6, sv * (ch + ring / 2)), b: M(su * (ch + ring / 2) + 6, sv * (ch + ring / 2)), th: ring, h: AH });
// the court's paving and its pool
E.push({ t: 'mass', a: M(0, -ch), b: M(0, ch), th: 2 * ch, h: 0.06, mat: 'brick_paving' });
E.push({ t: 'mass', a: M(0, -13), b: M(0, 13), th: 18, h: 0.4, mat: 'marble' });
E.push({ t: 'mass', a: M(0, -12), b: M(0, 12), y: 0.3, th: 16, h: 0.12, mat: 'water' });
// the sanctuary (22.5 m inside) under the dome (52 m high, 26 m across), the winter halls either side
const sv = ch + ring + 12.1;                                          // its entrance wall abuts the qibla iwan's back wall
E.push({ t: 'dome_chamber', c: M(0, sv), half: 12.5, rot: Math.PI / 4, wallH: 24, drum: { r: 12, h: 7 }, dome: { r: 13, h: 17, bulge: 0.08 }, wallMat: 'brick_buff', drumMat: 'tile_lapis', domeMat: 'tile_turquoise',
  inscription: true, grilles: true, net: { n: 24, turn: 3, width: 0.45, band: 'tile_cream', line: 'tile_white', knot_mat: 'tile_lapis', knot: 0.55 },
  interior: { door: 2.5, doorH: 6.5, ah: 17, mihrab: 1.45 } });   // the sanctuary walkable: the inner dome under the outer one (docs/settlements/isfahan.md §17)
for (const s of [-1, 1]) E.push({ t: 'mass', a: M(s * 30.25, ch + ring), b: M(s * 30.25, ch + ring + 25), th: 35.5, h: 15 });

// ---- the Sheikh Lotfollah Mosque: portal on the east side, the dome chamber turned behind it
// the portal's iwan opens by a door into a tall vestibule; from it the passage winds north-east and south-east round
// the chamber to its door (the passage and the chamber are the dome_chamber's interior, docs/settlements/isfahan.md §13)
E.push({ t: 'portal', a: LOTF.portal[0], b: LOTF.portal[1], facing: mid, h: 20, depth: 10, iwan: { w: 9, h: 14, depth: 4, pass: true, backMat: 'tile_lapis' } });
const VX = 91.2;                                                       // the vestibule's east face (the portal's mass ends here)
E.push({ t: 'mass', a: [VX + 0.3, -44.7], b: [VX + 0.3, -40.4], th: 0.6, h: 7.4 });
E.push({ t: 'mass', a: [VX + 0.3, -40.6], b: [VX + 0.3, -35.3], y: 4.5, th: 0.6, h: 2.9 });
E.push({ t: 'mass', a: [VX + 0.3, -44.7], b: [VX + 0.3, -35.3], y: 7.4, th: 0.6, h: 6.6 });
E.push({ t: 'block', rect: [85.6, -44.7, VX, -35.3], y0: 7.0, y1: 7.4, mat: 'plaster_persian', collide: false });
E.push({ t: 'lane', rect: [85.6, -44.7, VX, -35.3], y: 0.04, mat: 'brick_paving' });
E.push({ t: 'dome_chamber', c: LOTF.c, half: LOTF.half, rot: Math.PI / 4, wallH: 14, drum: { r: 10, h: 4 }, dome: { r: 11, h: 10, bulge: 0 }, wallMat: 'brick_buff', drumMat: 'tile_lapis', domeMat: 'tile_cream',
  inscription: true, grilles: true, net: { n: 16, turn: 3, width: 0.42, band: 'tile_lapis', line: 'tile_white', knot_mat: 'tile_turquoise', knot: 0.5 },
  interior: { passage: { x: VX } } });

// ---- Ali Qapu: the gate block (13 m) with its vaulted passage and the hall over it, the talar on 18
// wooden columns on top, the tower behind (38 m) with the reception chamber, two storeys of rooms and
// the music room, the enclosed stair on its south side joining them all
const [, az0, ax1, az1] = ALIQAPU.rect;
E.push({ t: 'ali_qapu', rect: ALIQAPU.rect, tower: -92, top: 38 });
E.push({ t: 'talar', rect: [-92, az0 + 1, ax1, az1 - 1], y: 13, h: 12, cols: [3, 6], rail: [[[ax1, az0 + 1], [ax1, az1 - 1]], [[-92, az0 + 1], [ax1, az0 + 1]], [[-92, az1 - 1], [ax1, az1 - 1]]] });

// ---- the Qeysarieh portal and the bazaar running north
E.push({ t: 'portal', a: [15, sz0], b: [-15, sz0], facing: mid, h: 24, depth: 12, iwan: { w: 10, h: 17, depth: 6, pass: true, backMat: 'tile_cream', doorH: 5 } });
// Sagittarius in mosaic tile over the door at the back of the iwan (the back wall's face 7.2 m behind the portal's)
E.push({ t: 'sagittarius', c: [0, sz0 - 7.2], n: [0, 1], y0: 5.5, w: 5, h: 2.5 });
E.push({ t: 'bazaar', a: [BAZAAR.x, BAZAAR.z0], b: [BAZAAR.x, BAZAAR.z1], w: BAZAAR.w, h: 7, bay: 5, shops: BAZAAR.shops });

// ---- the royal garden behind Ali Qapu: walls, the long channel, the pool
const [gx0, gz0, gx1, gz1] = GARDEN;
const gw = (a, b) => E.push({ t: 'adobe_wall', a, b, h: 5, th: 0.9, mat: 'kahgel' });
gw([gx0, gz0], [gx1, gz0]); gw([gx0, gz1], [gx1, gz1]); gw([gx0, gz0], [gx0, gz1]);
gw([gx1, gz0], [gx1, -52]); gw([gx1, -28], [gx1, gz1]);
E.push({ t: 'water_rect', rect: [-222.5, gz0 + 6, -219.5, gz1 - 6], y: 0.25 });
for (const r of [[-223.1, gz0 + 6, -222.5, gz1 - 6], [-219.5, gz0 + 6, -218.9, gz1 - 6]]) E.push({ t: 'block', walk: true, rect: r, y0: 0, y1: 0.45, mat: 'limestone' });
E.push({ t: 'block', walk: true, rect: [-238, -54, -204, -36], y0: 0, y1: 0.6, mat: 'limestone' });
E.push({ t: 'water_rect', rect: [-236, -52, -206, -38], y: 0.5 });
E.push({ t: 'lane', rect: [gx0 + 6, -50, gx1 - 1, -40], y: 0.04, mat: 'brick_paving' });

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [room('square', SQUARE, 0, 'open'), room('garden', GARDEN, 0, 'open'), room('talar', [-92, az0 + 1, ax1, az1 - 1], 13, 'hall'), room('music_room', [-102, -47, -94, -38], 32.5, 'hall'), room('bazaar', [-2.5, BAZAAR.z1, 2.5, BAZAAR.z0], 0, 'hall'), room('shah_sanctuary', [M(0, sv)[0] - 8, M(0, sv)[1] - 8, M(0, sv)[0] + 8, M(0, sv)[1] + 8], 0, 'hall'), room('lotfollah', [LOTF.c[0] - 6.7, LOTF.c[1] - 6.7, LOTF.c[0] + 6.7, LOTF.c[1] + 6.7], 0, 'hall')];
const walks = [[[0, -280], [2.5, -168], [2.5, -155], [-1, -143], [-1, -125], [1.6, 35], [1.6, 150], [0, 200], [0, 245]]];   // down the square's axis, bearing round the strollers and goods the generated street life stands on it
walks[0].y0 = 0;
walks.push([[-70, 167.5], [-82.6, 167.5], [-88, 167.5], [-82.6, 167.5]], [[70, 181.2], [82.6, 181.2], [88, 181.2]]);          // into an arcade shop on each side of the square, by the arch and the doorway

export const square = {
  id: 'isfahan-maidan',
  name: { en: 'Naqsh-e Jahan Square', zh: '伊玛目广场（世界图景广场）' },
  era: { en: 'Safavid, c. 1630', zh: '萨法维王朝，约1630年' },
  style: 'safavid',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [0, -150], facing: 's' },
  bounds: [-112, -390, 125, 380],
  bakeBounds: [-106, -315, 122, 378],
  view: [-40, 150, 40, 262],
  bakeTop: 60,
  elements: E,
  rooms,
  walks,
};
export default square;
