// The Sacred Precinct of Tenochtitlan in 1519 (docs/settlements/tenochtitlan.md §2–§4): the
// serpent wall and its three gates, the Templo Mayor at true size, Ehecatl's round temple on its
// axis, the temples of Tezcatlipoca and the Sun, the ballcourt, the tzompantli, the House of the
// Eagles, the calmecac; the palace of Moctezuma; the causeway west over the lake; the canals,
// their walls, timber bridges and dugout canoes; the market by the west canal.

import { RADIUS, PRECINCT, TM, PALACE, MARKET, LEVEL, ISLAND, CAUSEWAY, CANALS, TZOMPANTLI, GAP, inChinampaHouse } from './layout.js';
import { ground } from './ground.js';
import { stalls, aisles, GEOM, JUDGES, LANDINGS } from './market.js';

const E = [];
const [px0, pz0, px1, pz1] = PRECINCT;
// ---- the platform that bounds the precinct, with gates north, west and south (its x runs carried over the corners)
const sw = (a, b) => E.push({ t: 'mx_enclosure', a, b, w: 6, h: 3 });
sw([px0 - 3, pz0], [-8, pz0]); sw([8, pz0], [px1 + 3, pz0]); sw([px0 - 3, pz1], [-8, pz1]); sw([8, pz1], [px1 + 3, pz1]);
sw([px0, pz0], [px0, -8]); sw([px0, 8], [px0, pz1]); sw([px1, pz0], [px1, pz1]);
// ---- the coatepantli: the two serpents round the Templo Mayor, Tlaloc's blue on the north, Huitzilopochtli's ochre on the south, their heads at the front
E.push({ t: 'coatepantli', pts: [[58, -56], [142, -56], [142, -3]], paint: 'maya_blue', kind: 'tlaloc' });
E.push({ t: 'coatepantli', pts: [[58, 56], [142, 56], [142, 3]], paint: 'paint_ochre', kind: 'feathered' });
E.push({ t: 'lane', rect: [px0 + 2, pz0 + 2, px1 - 2, pz1 - 2], y: 0.03, mat: 'stucco' });
// ---- the temples
E.push({ t: 'templo_mayor', c: TM.c, w: TM.w, d: TM.d, h: TM.h, terraces: 4, top: TM.top });
E.push({ t: 'ehecatl_temple', c: [-4, -10], r: 9, h: 8, front: 24 });
E.push({ t: 'm_pyramid', c: [-55, 75], base: 17, top: 8, h: 15, tiers: 4, stairs: 'e', steps: 60, stairW: 7, serpents: 'e', temple: { w: 10, d: 10, h: 5, doors: 'e' } });
E.push({ t: 'm_pyramid', c: [25, -95], base: 15, top: 7, h: 13, tiers: 3, stairs: 's', steps: 50, stairW: 6, serpents: 's', temple: { w: 9, d: 9, h: 5, doors: 's' } });
E.push({ t: 'mx_temple', c: [42, 102], base: 26, top: 10, h: 17.6, tiers: 4, stairW: 8, god: 'tezcatlipoca' });
E.push({ t: 'ballcourt', c: [-50, -65], len: 60, w: 9, h: 4 });
// the Huey Tzompantli before Huitzilopochtli's side of the temple: its platform north–south, the tower of skulls at its north end
E.push({ t: 'tzompantli', rect: TZOMPANTLI, h: 4.6 });
E.push({ t: 'm_platform', c: [-30, 40], a: 9, h: 2.4, serpents: 'w' });
E.push({ t: 'eagle_house', rect: [84, -138, 136, -104], seed: 3 });
E.push({ t: 'calmecac', rect: [-140, -140, -84, -104], seed: 5 });
E.push({ t: 'court_house', rect: [-138, 100, -90, 138], h: 3.8, ring: 8, seed: 6 });
// ---- the palace of Moctezuma
E.push({ t: 'tecpan', rect: PALACE });
// ---- the causeway west over the lake
const cw = Math.sqrt((RADIUS - 26) ** 2 - CAUSEWAY.z1 ** 2);
for (const [a, b] of [[-cw, GAP[0]], [GAP[1], -ISLAND + 6]]) {
  E.push({ t: 'block', walk: true, rect: [a, CAUSEWAY.z0, b, CAUSEWAY.z1], y0: LEVEL.lakeBed, y1: 0.4, mat: 'basalt' });
  for (const z of [CAUSEWAY.z0 - 0.1, CAUSEWAY.z1 + 0.1]) E.push({ t: 'causeway_stakes', a: [a + 0.3, z], b: [b - 0.3, z], y0: LEVEL.lakeBed, y1: 0.55, seed: Math.round(-a) });
}
// the opening through it, the water passing, and the bridge of great timbers laid over it
E.push({ t: 'beam_bridge', at: [(GAP[0] + GAP[1]) / 2, 0], across: 'x', span: GAP[1] - GAP[0], width: 8, y: 0.4 });
// ---- the canals: water, stone walls, timber bridges at the avenues, canoes poled along or moored
const clip = ([x0, z0, x1, z1]) => { const h = (v) => Math.sqrt(Math.max(0, (ISLAND - 6) ** 2 - v * v)); return x1 - x0 > z1 - z0 ? [Math.max(x0, -h(z1)), z0, Math.min(x1, h(z1)), z1] : [x0, Math.max(z0, -h(x1)), x1, Math.min(z1, h(x1))]; };
let seed = 11;
for (const c of CANALS) {
  const r = clip(c), horiz = r[2] - r[0] > r[3] - r[1];
  E.push({ t: 'water_rect', rect: r, y: LEVEL.water });
  for (const [a, b] of horiz ? [[[r[0], r[1]], [r[2], r[1]]], [[r[0], r[3]], [r[2], r[3]]]] : [[[r[0], r[1]], [r[0], r[3]]], [[r[2], r[1]], [r[2], r[3]]]]) E.push({ t: 'mx_canal_wall', a, b, y: 0.05, bed: LEVEL.canalBed, th: 0.7 });
  E.push({ t: 'beam_bridge', at: horiz ? [0, (r[1] + r[3]) / 2] : [(r[0] + r[2]) / 2, 0], across: horiz ? 'z' : 'x', span: 8, width: 4.4, y: 0.05 });
  for (let k = 0; k < 6; k++) {
    const t = (k + 0.5) / 6, side = k % 2 ? 1.6 : -1.6, mid = horiz ? (r[1] + r[3]) / 2 + side : (r[0] + r[2]) / 2 + side;
    const at = horiz ? [r[0] + (r[2] - r[0]) * t, mid] : [mid, r[1] + (r[3] - r[1]) * t];
    if (Math.abs(at[0]) > 12 && Math.abs(at[1]) > 12) E.push({ t: 'acalli', at, dir: horiz ? [k % 3 ? 1 : -1, 0] : [0, k % 3 ? 1 : -1], len: 5 + (k % 3), y: LEVEL.water, seed: seed++ });
  }
}
// ---- the market by the west canal: the sellers' rows, a landing stair down to the water, canoes unloading
{
  const rp = ((q) => () => ((q = (q * 1664525 + 1013904223) >>> 0) / 4294967296))(3);
  const spots = [];
  for (const [ax0, az0, ax1, az1] of aisles().slice(0, GEOM.rows + 1)) for (let i = 0; i < 5; i++) spots.push([ax0 + 3 + rp() * (ax1 - ax0 - 6), (az0 + az1) / 2 + (rp() - 0.5) * 1.6]);
  E.push({ t: 'tianguis', rect: MARKET, seed: 1519, stalls: stalls(), judges: JUDGES, aisleX: [GEOM.xWest, GEOM.xCross, GEOM.xEast], aisleSpots: spots });
}
for (const z of LANDINGS.map((v) => v - 3)) E.push({ t: 'stairs', rect: [-219.6, z, -215.6, z + 6], y0: LEVEL.water - 0.3, y1: 0.05, dir: 'e', mat: 'andesite' });
for (const [z, cargo] of [[30, 'maize'], [44, 'pots'], [56, 'chile'], [74, 'reeds'], [84, 'cloth']]) E.push({ t: 'acalli', at: [-218.6, z], dir: [0, 1], len: 6, y: LEVEL.water, seed: seed++, cargo });
// ---- people: priests climbing Huitzilopochtli's and Tlaloc's stairs with censers, the drummer and priests at the summit,
// worshippers kneeling about the Coyolxauhqui stone, people crossing the precinct; farmers with the coa on the chinampas
{
  const sx0 = TM.c[0] - TM.top.w / 2 - TM.h * 0.9, len = TM.h * 0.9 + 0.5, n = Math.round(TM.h / 0.22), rs = TM.h / n;
  const step = (k, z, rot, who, seed) => [sx0 + len * (k + 0.5) / n, z, rs * (k + 1), rot, who, seed];
  const UP = -Math.PI / 2, DOWN = Math.PI / 2, P = [];
  P.push(step(28, 9.2, UP, 'priest_censer', 1), step(32, 11.6, UP, 'priest', 2), step(88, 10.2, UP, 'priest_censer', 3), step(92, 8.4, UP, 'priest', 4),
    step(150, 11.4, UP, 'priest_censer', 5), step(118, 13.2, DOWN, 'priest', 6), step(60, -9.0, UP, 'priest', 7), step(64, -11.4, UP, 'bearer', 8), step(170, -12.0, DOWN, 'priest', 9));
  P.push([84.7, 12.4, TM.h, DOWN, 'priest', 10], [85.2, 3.1, TM.h, DOWN, 'drummer', 11], [83.0, -13.6, TM.h, DOWN, 'priest_censer', 12], [80.6, 15.0, TM.h, Math.PI * 0.8, 'priest', 13]);
  // at the foot: worshippers about the Coyolxauhqui stone, others crossing toward the stairs
  P.push([30.2, 7.4, 0.03, UP, 'worshipper', 20], [30.0, 10.6, 0.03, UP, 'worshipper', 21], [30.4, 13.6, 0.03, UP, 'worshipper', 22], [29.0, -9.5, 0.03, UP, 'worshipper', 23], [28.8, -11.6, 0.03, UP, 'worshipper', 24]);
  const rp = ((s) => () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296))(77);
  for (let i = 0; i < 16; i++) {
    const x = 6 + rp() * 26, z = -26 + rp() * 52;
    if (Math.hypot(x + 4, z + 10) < 16 || (x > 26 && Math.abs(Math.abs(z) - 10.4) < 4.5)) continue;
    P.push([x, z, 0.03, rp() * 6.28, ['man', 'woman', 'bearer', 'man', 'priest'][i % 5], 30 + i]);
  }
  E.push({ t: 'mx_people', people: P });
  // the chinampas: farmers turning the mud with the coa, others planting, on the plots between the ditches
  const F = [];
  for (let i = 0; i < 26; i++) {
    const a = rp() * Math.PI * 2, r = 304 + rp() * 24;
    let x = Math.cos(a) * r; const z = Math.sin(a) * r;
    if (x < 0 && Math.abs(z) < 16) continue;
    x = Math.floor(x / 14) * 14 + 4.5 + rp() * 5;
    if (Math.hypot(x, z) < 303 || Math.hypot(x + 1.6, z + 1.2) > 331 || inChinampaHouse(x, z, 1.5) || inChinampaHouse(x + 1.6, z + 1.2, 1.5)) continue;
    F.push([x, z, ground.height(x, z), rp() * 6.28, i % 3 ? 'farmer' : 'planter', 60 + i]);
    if (i % 2) F.push([x + 1.6, z + 1.2, ground.height(x + 1.6, z + 1.2), rp() * 6.28, 'farmer', 90 + i]);
  }
  E.push({ t: 'mx_people', people: F });
}
const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [room('precinct', PRECINCT, 0, 'open'), room('tianguis', MARKET, 0.04, 'open'), room('palace', PALACE, 1.0, 'open')];
const walks = [[[-260, 0], [-150, 0], [-60, 0], [-20, 8], [20, 8], [34, 0]]];
walks[0].y0 = 0;

export const precinct = {
  id: 'tenochtitlan-precinct',
  name: { en: 'The Sacred Precinct and the Templo Mayor', zh: '圣域与大神庙' },
  era: { en: 'Mexica, 1519', zh: '墨西加，1519年' },
  style: 'aztec',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [-60, 0], facing: 'e' },
  bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS],
  bakeBounds: [-150, -150, 270, 260],
  view: [55, -50, 135, 50],
  bakeTop: 56,
  elements: E,
  rooms,
  walks,
};
export default precinct;
