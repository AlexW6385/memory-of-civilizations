// Himeji Castle as it stood about 1620 (docs/settlements/edo-himeji.md §2–§4): the inner enclosure
// on its stone rampart within the moat, the main gate on the south; Himeyama with the Ninomaru,
// Honmaru and Nishinomaru on their ramparts, turrets and walls; the keep cluster — the main keep of
// five tiers and the three small keeps joined by roofed passages; the long gallery of the
// Nishinomaru; the lord's residence in the Sannomaru; the middle moat and its gate.

import { INNER, OUTER, BANK, LEVEL, NINO, HON, DAI, NISHI, KEEP, SMALL, GOTEN, OTEMON, MIDDLE, RADIUS } from './layout.js';

const E = [];
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
{ const xm = Math.sqrt(RADIUS ** 2 - MIDDLE.z1 ** 2) - 24; E.push({ t: 'water_rect', rect: [-xm, MIDDLE.z0, -MIDDLE.gap / 2, MIDDLE.z1], y: LEVEL.water }, { t: 'water_rect', rect: [MIDDLE.gap / 2, MIDDLE.z0, xm, MIDDLE.z1], y: LEVEL.water }); }
// the walls on the rampart
const wall = (a, b, y, sama = true) => E.push({ t: 'dobei', a, b, y, h: 2.3, sama });
wall([ix0 + 1, iz0 + 1], [ix1 - 1, iz0 + 1], RT); wall([ix0 + 1, iz0 + 1], [ix0 + 1, iz1 - 1], RT); wall([ix1 - 1, iz0 + 1], [ix1 - 1, iz1 - 1], RT);
wall([ix0 + 1, iz1 - 1], [-gx - 4, iz1 - 1], RT); wall([gx + 4, iz1 - 1], [ix1 - 1, iz1 - 1], RT);
for (const [x, z] of [[ix0, iz0], [ix1 - 10, iz0], [ix0, iz1 - 10], [ix1 - 10, iz1 - 10]]) E.push({ t: 'yagura', rect: [x + 0.5, z + 0.5, x + 9.5, z + 9.5], y: RT, storeys: 2 });
// the main gate on the causeway, its steps up into the enclosure
E.push({ t: 'yagura_mon', rect: [-gx - 4, iz1 - 1, gx + 4, iz1 + 7], y: 0, passage: 6, h: 4.6 });
E.push({ t: 'stairs', rect: [-3, iz1 - RW - 8, 3, iz1 - 1], y0: 0, y1: BANK, dir: 'n', mat: ST });
E.push({ t: 'lane', rect: [-gx, iz1, gx, oz1], y: 0.02, mat: 'flagstone' });

// ---- the hill's baileys on their ramparts, the paths up
const plat = (p, b) => E.push({ t: 'ishigaki', rect: p.rect, y0: 0, y1: p.top, batter: b });
plat(NINO, 6); plat(NISHI, 5); plat(HON, 4); plat(DAI, 3);
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
ring(NINO.rect, NINO.top, [[-6, 18]]);
ring(HON.rect, HON.top, [[-36, -26]]);
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
E.push({ t: 'ishigaki', rect: [KEEP.c[0] - 12, KEEP.c[1] - 11, KEEP.c[0] + 12, KEEP.c[1] + 11], y0: DAI.top, y1: KEEP.base, batter: 1.4, ring: 2.5, door: { at: KEEP.c[1] - 7.4, w: 1.8, h: 2.8 } });
E.push({ t: 'tenshu', c: KEEP.c, base: KEEP.base, hollow: true, below: DAI.top, basementRect: [KEEP.c[0] - 9.5, KEEP.c[1] - 8.5, KEEP.c[0] + 9.5, KEEP.c[1] + 8.5], basementHd: 8.5, chidori: [0, 2], kara: { 1: ['s', 'n'] }, tiers: [{ hw: 11.5, hd: 10.5, h: 6.5 }, { hw: 10.3, hd: 9.3, h: 5 }, { hw: 9, hd: 8, h: 5 }, { hw: 7.6, hd: 6.6, h: 4.8 }, { hw: 6.2, hd: 5.3, h: 4.7 }] });
for (const k of SMALL) E.push({ t: 'tenshu', c: k.c, base: DAI.top, chidori: [0], tiers: [{ hw: 6, hd: 5.5, h: 5 }, { hw: 5, hd: 4.5, h: 4.5 }, { hw: 4, hd: 3.6, h: 4.2 }] });
for (const rect of [[-17, -76.5, -9, -62.6], [-39, -86, -19, -78], [-49, -76.5, -41, -55.5], [-39, -54, -26.6, -46]]) E.push({ t: 'watari', rect, y: DAI.top, storeys: 2, h: 3.5 });

// ---- the Sannomaru: the lord's residence, its walls and gate
E.push({ t: 'goten', y: BANK, halls: [[-55, 106, -12, 134], [-4, 100, 42, 128, 4], [12, 138, 56, 166], [-52, 142, -8, 168], [-8, 134, 6, 146, 3]] });
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

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [room('main keep', [KEEP.c[0] - 12, KEEP.c[1] - 11, KEEP.c[0] + 12, KEEP.c[1] + 11], DAI.top, 'hall'), room('inner', INNER, BANK, 'open'), room('honmaru', HON.rect, HON.top, 'open'), room('keep', DAI.rect, DAI.top, 'hall')];
const walks = [[[0, 300], [0, 215], [0, 180], [0, 80], [0, 40], [0, 10], [12, 0], [-31, -30]]];
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
