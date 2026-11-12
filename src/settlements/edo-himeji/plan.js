// Himeji Castle as it stood about 1620 (docs/settlements/edo-himeji.md §2–§4): the inner enclosure
// on its stone rampart within the moat, the main gate on the south; Himeyama with the Ninomaru,
// Honmaru and Nishinomaru on their ramparts, turrets and walls; the keep cluster — the main keep of
// five tiers and the three small keeps joined by roofed passages; the long gallery of the
// Nishinomaru; the lord's residence in the Sannomaru; the middle moat and its gate.

import { INNER, OUTER, BANK, LEVEL, NINO, HON, DAI, NISHI, KEEP, SMALL, GOTEN, OTEMON, MIDDLE, RADIUS } from './layout.js';

const E = [];
const KEEP_TIERS = [{ hw: 11.5, hd: 10.5, h: 6.5 }, { hw: 10.3, hd: 9.3, h: 5 }, { hw: 9, hd: 8, h: 5 }, { hw: 7.6, hd: 6.6, h: 4.8 }, { hw: 6.2, hd: 5.3, h: 4.7 }];
const [ix0, iz0, ix1, iz1] = INNER, [ox0, oz0, ox1, oz1] = OUTER, RW = 4, RT = BANK + 1.4;
const ST = 'ishigaki';
// ---- the inner rampart (four strips, the south one broken by the gate) and the moat's outer bank
const strip = (rect, sides, y0, y1, batter) => E.push({ t: 'ishigaki', rect, sides, y0, y1, batter });
const gx = OTEMON.w / 2;
strip([ix0, iz0, ix1, iz0 + RW], 'nwe', LEVEL.bed, RT, 2.5);
strip([ix0, iz0 + RW, ix0 + RW, iz1 - RW], 'w', LEVEL.bed, RT, 2.5);
strip([ix1 - RW, iz0 + RW, ix1, iz1 - RW], 'e', LEVEL.bed, RT, 2.5);
strip([ix0, iz1 - RW, OTEMON.x - gx, iz1], 'sw', LEVEL.bed, RT, 2.5);
strip([OTEMON.x + gx, iz1 - RW, ix1, iz1], 'se', LEVEL.bed, RT, 2.5);
const BW = 3;
strip([ox0, oz0, ox1, oz0 + BW], 's', LEVEL.bed, 0.3, 1.4);
strip([ox0, oz0 + BW, ox0 + BW, oz1 - BW], 'e', LEVEL.bed, 0.3, 1.4);
strip([ox1 - BW, oz0 + BW, ox1, oz1 - BW], 'w', LEVEL.bed, 0.3, 1.4);
strip([ox0, oz1 - BW, OTEMON.x - gx, oz1], 'n', LEVEL.bed, 0.3, 1.4);
strip([OTEMON.x + gx, oz1 - BW, ox1, oz1], 'n', LEVEL.bed, 0.3, 1.4);
// the water in the moats
for (const r of [[ox0, oz0, ox1, iz0], [ox0, iz1, OTEMON.x - gx, oz1], [OTEMON.x + gx, iz1, ox1, oz1], [ox0, iz0, ix0, iz1], [ix1, iz0, ox1, iz1]]) E.push({ t: 'water_rect', rect: r, y: LEVEL.water });
// (in strips, each out to where the moat's bed comes up toward the disc's edge)
for (let k = 0; k < 3; k++) {
  const z0 = MIDDLE.z0 + (MIDDLE.z1 - MIDDLE.z0) * k / 3, z1 = MIDDLE.z0 + (MIDDLE.z1 - MIDDLE.z0) * (k + 1) / 3, xm = Math.sqrt(RADIUS ** 2 - z1 ** 2) - 24;
  E.push({ t: 'water_rect', rect: [-xm, z0, -MIDDLE.gap / 2, z1], y: LEVEL.water }, { t: 'water_rect', rect: [MIDDLE.gap / 2, z0, xm, z1], y: LEVEL.water });
}
// the walls on the rampart
const wall = (a, b, y, sama = true) => E.push({ t: 'dobei', a, b, y, h: 2.3, sama });
wall([ix0 + 1, iz0 + 1], [ix1 - 1, iz0 + 1], RT); wall([ix0 + 1, iz0 + 1], [ix0 + 1, iz1 - 1], RT); wall([ix1 - 1, iz0 + 1], [ix1 - 1, iz1 - 1], RT);
wall([ix0 + 1, iz1 - 1], [-gx - 4, iz1 - 1], RT); wall([gx + 4, iz1 - 1], [ix1 - 1, iz1 - 1], RT);
for (const [x, z] of [[ix0, iz0], [ix1 - 10, iz0], [ix0, iz1 - 10], [ix1 - 10, iz1 - 10]]) E.push({ t: 'yagura', rect: [x + 0.5, z + 0.5, x + 9.5, z + 9.5], y: RT, storeys: 2 });
// the main gate on the causeway, its steps up into the enclosure
E.push({ t: 'yagura_mon', rect: [-gx - 4, iz1 - 1, gx + 4, iz1 + 7], y: 0, passage: 6, h: 4.6 });
E.push({ t: 'stairs', rect: [-3, iz1, 3, iz1 + 10], y0: 0, y1: BANK, dir: 'n', mat: ST });
E.push({ t: 'lane', rect: [-gx, iz1, gx, oz1], y: 0.02, mat: 'flagstone' });

// ---- the hill's baileys on their ramparts, the paths up
// coursed: the stones of the ramparts read as laid courses, long and short at the corners; the dressed blocks stand
// out of the face only where the rampart is seen (the Honmaru's and the keep's, the Ninomaru's upper 9 m)
const plat = (p, b, y0, from) => E.push({ t: 'ishigaki', rect: p.rect, y0, y1: p.top, batter: b, coursed: true, course: 0.6, reliefFrom: from });
plat(NINO, 6, 0, NINO.top - 9); plat(NISHI, 5, 0, NISHI.top - 9); plat(HON, 5, NINO.top - 1, 0); plat(DAI, 4.5, HON.top - 1, 0);
E.push({ t: 'stairs', rect: [-4, NINO.rect[3], 4, NINO.rect[3] + 42], y0: BANK, y1: NINO.top, dir: 'n', mat: ST });
E.push({ t: 'stairs', rect: [8, HON.rect[3], 16, HON.rect[3] + 12], y0: NINO.top, y1: HON.top, dir: 'n', mat: ST });
E.push({ t: 'stairs', rect: [-34, DAI.rect[3], -28, DAI.rect[3] + 13], y0: HON.top, y1: DAI.top, dir: 'n', mat: ST });
E.push({ t: 'stairs', rect: [NISHI.rect[2], 8, NINO.rect[0], 15], y0: NISHI.top, y1: NINO.top, dir: 'e', mat: ST });
// walls and turrets round the baileys
const ring = (r, y, gaps = []) => {
  const [x0, z0, x1, z1] = r, e = 1;
  wall([x0 + e, z0 + e], [x1 - e, z0 + e], y); wall([x0 + e, z0 + e], [x0 + e, z1 - e], y); wall([x1 - e, z0 + e], [x1 - e, z1 - e], y);
  let u = x0 + e; for (const [g0, g1] of gaps) { wall([u, z1 - e], [g0, z1 - e], y); u = g1; } wall([u, z1 - e], [x1 - e, z1 - e], y);
};
ring(NINO.rect, NINO.top, [[-10, 10]]);
// the Hishi gate, the turret gate of the Ninomaru's entrance, at the head of the way up (§4)
E.push({ t: 'hishi_mon', rect: [-10, NINO.rect[3] - 8.5, 10, NINO.rect[3] - 0.5], y: NINO.top, passage: 5, h: 4.4, front: 's' });
ring(HON.rect, HON.top, [[6, 18]]);
// the keep cluster's own wall on the edge of its stone base (white, loopholed), broken on the south by the plain gate at the head of the stair from the Honmaru
{ const [dx0, dz0, dx1, dz1] = DAI.rect, e = 1, g0 = -33.1, g1 = -28.9;
  wall([dx0 + e, dz1 - e], [g0, dz1 - e], DAI.top); wall([g1, dz1 - e], [dx1 - e, dz1 - e], DAI.top);
  wall([dx0 + e, dz0 + e], [dx0 + e, dz1 - e], DAI.top); wall([dx1 - e, dz0 + e], [dx1 - e, dz1 - e], DAI.top); wall([dx0 + e, dz0 + e], [dx1 - e, dz0 + e], DAI.top);
  E.push({ t: 'kabuki_mon', rect: [g0, dz1 - 2.6, g1, dz1 - 0.4], y: DAI.top, w: 3.6, h: 3.5 }); }
for (const [x, z] of [[NINO.rect[0], NINO.rect[1]], [NINO.rect[2] - 9, NINO.rect[1]], [NINO.rect[0], NINO.rect[3] - 9], [NINO.rect[2] - 9, NINO.rect[3] - 9], [HON.rect[2] - 8, HON.rect[3] - 8], [HON.rect[0], HON.rect[3] - 8]]) {
  const y = z > HON.rect[1] && z < HON.rect[3] && x > HON.rect[0] - 1 && x < HON.rect[2] ? HON.top : NINO.top;
  E.push({ t: 'yagura', rect: [x + 0.5, z + 0.5, x + (y === HON.top ? 7.5 : 8.5), z + (y === HON.top ? 7.5 : 8.5)], y, storeys: 2 });
}
// the Nishinomaru: its long gallery on the west edge with a turret at each end (the north one three storeys)
const [nx0, nz0, nx1, nz1] = NISHI.rect;
E.push({ t: 'watari', rect: [nx0 + 0.5, nz0 + 9, nx0 + 6.5, nz1 - 9], y: NISHI.top, storeys: 2, h: 3.4 });
E.push({ t: 'yagura', rect: [nx0, nz0, nx0 + 10, nz0 + 9], y: NISHI.top, storeys: 3, h: 3.4 });
E.push({ t: 'yagura', rect: [nx0, nz1 - 9, nx0 + 11, nz1], y: NISHI.top, storeys: 2, h: 3.6 });
wall([nx0 + 7, nz0 + 1], [nx1 - 1, nz0 + 1], NISHI.top); wall([nx0 + 7, nz1 - 1], [nx1 - 1, nz1 - 1], NISHI.top);

// ---- the keep cluster on its base: the main keep (46 m above the Honmaru), three small keeps, the passages
// the main keep is hollow: its stone base a ring round the basement, entered by a door on the west from the
// courtyard between the keeps; inside, the floors, the great pillars and the stairs to the top
E.push({ t: 'ishigaki', rect: [KEEP.c[0] - 12, KEEP.c[1] - 11, KEEP.c[0] + 12, KEEP.c[1] + 11], y0: DAI.top, y1: KEEP.base, batter: 2.4, coursed: true, course: 0.5, ring: 2.5, door: { at: KEEP.c[1] - 7.4, w: 1.8, h: 2.8 } });
E.push({ t: 'tenshu', c: KEEP.c, base: KEEP.base, hollow: true, below: DAI.top, basementRect: [KEEP.c[0] - 9.5, KEEP.c[1] - 8.5, KEEP.c[0] + 9.5, KEEP.c[1] + 8.5], basementHd: 8.5, chidori: [0, 2], kara: { 1: ['s', 'n'] }, ishiOtoshi: true, tiers: KEEP_TIERS });
for (const k of SMALL) E.push({ t: 'tenshu', c: k.c, base: DAI.top, chidori: [0], tiers: [{ hw: 6, hd: 5.5, h: 5 }, { hw: 5, hd: 4.5, h: 4.5 }, { hw: 4, hd: 3.6, h: 4.2 }] });
// the four passages (i, ro, ha, ni) close the courtyard between the keeps; the way in is a gate through
// the ground storey of the south-west one, between the west small keep and the main keep, where the
// path from the Honmaru comes up (the last of the water gates, mizu-no-mon, led so into the keeps)
for (const rect of [[-17, -76.5, -9, -62.6], [-39, -86, -19, -78], [-49, -76.5, -41, -55.5]]) E.push({ t: 'watari', rect, y: DAI.top, storeys: 2, h: 3.5 });
E.push({ t: 'watari', rect: [-39, -54, -26.6, -46], y: DAI.top, storeys: 2, h: 3.5, gate: { at: -32.4, w: 2.6, h: 3.0, side: 'hi' } });

// ---- the Sannomaru: the lord's residence, its walls and gate
E.push({ t: 'goten', y: BANK, halls: [[-55, 106, -12, 134], [-4, 100, 42, 128, 4], [12, 138, 56, 166], [-52, 142, -8, 168], [-8, 134, 6, 146, 3]], open: { 1: { face: 's', W: 16, dq: 9 }, 2: { face: 's', W: 12, dq: 7 }, 3: { face: 's', W: 12, dq: 7 } } });
const [gx0, gz0, gx1, gz1] = GOTEN;
wall([gx0, gz0], [gx1, gz0], BANK, false); wall([gx0, gz0], [gx0, gz1], BANK, false); wall([gx1, gz0], [gx1, gz1], BANK, false);
wall([gx0, gz1], [-6, gz1], BANK, false); wall([6, gz1], [gx1, gz1], BANK, false);
E.push({ t: 'lane', rect: [-4, gz1, 4, iz1 - RW - 8], y: BANK + 0.02, mat: 'flagstone' });

// ---- the middle moat's banks and its gate
for (const [x0, x1] of [[-RADIUS, -MIDDLE.gap / 2], [MIDDLE.gap / 2, RADIUS]]) {
  const xa = Math.max(x0, -Math.sqrt(RADIUS ** 2 - MIDDLE.z1 ** 2) + 30), xb = Math.min(x1, Math.sqrt(RADIUS ** 2 - MIDDLE.z1 ** 2) - 30);
  strip([xa, MIDDLE.z0 - 2.5, xb, MIDDLE.z0], 's', LEVEL.bed, 0.3, 1.2);
  strip([xa, MIDDLE.z1, xb, MIDDLE.z1 + 2.5], 'n', LEVEL.bed, 0.3, 1.2);
}
E.push({ t: 'yagura_mon', rect: [-12, MIDDLE.z0 - 9, 12, MIDDLE.z0 - 1], y: 0, passage: 6, h: 4.2 });

// ---- the baileys' ground (docs §5.7): pines, wells, lanterns, storehouse rows, flagstone paths; the Sannomaru's storehouses
{
  const pine = (x, z, y, h, seed) => E.push({ t: 'niwaki', at: [x, z], y, h, seed });
  const N = NINO.top, H = HON.top;
  [[-95, -100, 7.5], [-95, -60, 8.5], [-96, -20, 7], [-96, 12, 6.5], [-62, 8, 7], [-30, 6, 6], [22, 9, 7.5], [44, -100, 8], [44, -50, 7], [44, -10, 8.5], [-40, -132, 6.5]].forEach(([x, z, h], i) => pine(x, z, N, h, 70 + i));
  [[-70, -60, 8], [-76, -20, 7], [18, -70, 8.5], [22, -20, 7], [-45, -10, 6.5], [-20, -112, 7], [10, -108, 7.5]].forEach(([x, z, h], i) => pine(x, z, H, h, 90 + i));
  E.push({ t: 'ido', at: [-46, 11], y: N, rot: 0.4 }, { t: 'ido', at: [46, -72], y: N, rot: 1.2 }, { t: 'ido', at: [-72, -14], y: H, rot: 2 });
  for (const [x, z, y] of [[-12, 14, N], [12, 15, N], [-8, -8, H], [24, -4, H], [-25.5, -16, H]]) E.push({ t: 'ishidoro', at: [x, z], y, s: 1.2 });
  for (const x of [-90, -78, -66]) E.push({ t: 'kura', rect: [x, -138, x + 8, -130], y: N });
  for (const x of [-98, -86]) E.push({ t: 'kura', rect: [x, 2, x + 8, 10], y: N });
  E.push({ t: 'lane', rect: [-34, -7, 16, -1], y: H + 0.02, mat: 'flagstone' }, { t: 'lane', rect: [-34, -22, -28, -7], y: H + 0.02, mat: 'flagstone' });
  E.push({ t: 'lane', rect: [-3, 12, 16, 17.5], y: N + 0.02, mat: 'flagstone' });
  // the Sannomaru: pines along the lane to the gate, storehouses in rows west and east of the lord's residence
  for (const [x, z] of [[-12, 182], [12, 182], [-14, 194], [14, 194], [-24, 188], [24, 188]]) pine(x, z, BANK, 5 + ((x * 7 + z) % 3), 130 + x);
  for (const [x, z] of [[-6, 180], [6, 180], [-6, 192], [6, 192]]) E.push({ t: 'ishidoro', at: [x * 1.8, z + 3], y: BANK, s: 1.1 });
  for (let c = 0; c < 5; c++) for (let r = 0; r < 3; r++) { E.push({ t: 'kura', rect: [-200 + c * 22, 112 + r * 22, -193 + c * 22, 118 + r * 22], y: BANK }); E.push({ t: 'kura', rect: [78 + c * 22, 112 + r * 22, 85 + c * 22, 118 + r * 22], y: BANK }); }
}

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [room('main keep', [KEEP.c[0] - 12, KEEP.c[1] - 11, KEEP.c[0] + 12, KEEP.c[1] + 11], DAI.top, 'hall'), room('inner', INNER, BANK, 'open'), room('honmaru', HON.rect, HON.top, 'open'), room('keep', DAI.rect, DAI.top, 'hall'),
  room('keep courtyard', [-40, -77, -26, -55], DAI.top, 'open')];
// every floor of the main keep, climbed by its own stairs from the basement
{ let y = KEEP.base; for (const [i, t] of KEEP_TIERS.entries()) { rooms.push(room(`main keep floor ${i + 1}`, [KEEP.c[0] - t.hw + 1, KEEP.c[1] - t.hd + 1, KEEP.c[0] + t.hw - 1, KEEP.c[1] + t.hd - 1], y, 'hall')); y += t.h; } }
const walks = [[[0, 300], [0, 215], [0, 180], [70, 180], [70, 90], [0, 80], [0, 40], [0, 14], [12, 14], [12, -3], [-31, -3], [-31, -30]]];
walks[0].y0 = 0;

export const castle = {
  id: 'edo-himeji-castle',
  name: { en: 'Himeji Castle', zh: '姬路城' },
  era: { en: 'Edo, c. 1620', zh: '江户时代，约1620年' },
  style: 'edo',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [0, 240], facing: 'n' },
  bounds: [ox0, oz0, ox1, oz1],
  bakeBounds: [-206, -156, 76, 172],
  view: [-58, -96, 2, -34],
  viewY: DAI.top,
  bakeTop: 90,
  elements: E,
  rooms,
  walks,
};
export default castle;
