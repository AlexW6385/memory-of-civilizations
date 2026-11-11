// Teotihuacan — what is set about the avenue's plazas and the Moon Plaza (docs/settlements/teotihuacan.md §15):
// braziers, drain slabs, the worn way, litter, offerings, the plasterers, sweepers, bearers resting, sellers on
// mats, groups, boys, dogs and turkeys. Pure data from layout.js; built by the style's `tt_avenue`.
import { AVENUE, CROSS, STEP, LEVELS, MOON, PLAZA, CIUD } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const SR = 3.6;
/** The five plazas of the avenue: [z0, z1, level] of the floor clear of the stairs. */
export function plazas() {
  const ends = [STEP[3] + 5.6, CROSS[0] - SR, CROSS[0] + 6 + SR, CROSS[1] - SR, CROSS[1] + 6 + SR, CROSS[2] - SR, CROSS[2] + 6 + SR, CROSS[3] - SR, CROSS[3] + 6 + SR, AVENUE[3] - 8];
  return [0, 1, 2, 3, 4].map((i) => [ends[2 * i], ends[2 * i + 1], LEVELS[i]]);
}
let CACHE = null;
export function avenueItems() {
  if (CACHE) return CACHE;
  const out = [], P = plazas();
  // the altars' footprints to keep clear: the arrival plaza's, the middle altars of the longer plazas
  const altars = [[0, 15, 8.5], [-9, 42, 3.5], [0, -209, 8], [11, -226, 3.5]];
  P.forEach(([za, zb, lv], i) => { if (zb - za > 60 && i !== 2) altars.push([0, (za + zb) / 2, 5]); });
  const clear = (x, z, m = 0) => altars.every(([ax, az, r]) => Math.hypot(x - ax, z - az) > r + m);
  P.forEach(([za, zb, lv], i) => {
    const r = rng(900 + i), y = lv + 0.05, L = zb - za - 16, dens = i === 2 ? 1.5 : i === 1 || i === 3 ? 1.1 : 0.8;
    const spot = (xmax = 17) => { for (let t = 0; t < 30; t++) { const x = (r() * 2 - 1) * xmax, z = za + 8 + r() * L; if (clear(x, z, 1.5)) return [x, z]; } return [xmax, za + 8]; };
    for (let z = za + 9; z < zb - 8; z += 15) for (const sx of [-1, 1]) out.push({ k: 'brazier', x: sx * 17.4, z: z + (r() - 0.5) * 3, y });
    for (let z = za + 12; z < zb - 8; z += 33) out.push({ k: 'drain', x: (r() < 0.5 ? -1 : 1) * (9 + r() * 3), z, y, rot: r() < 0.5 ? 0 : Math.PI / 2 });
    // the worn way up the middle: stretches a little off the axis
    for (let z = za + 4; z < zb - 4; z += 18 + r() * 8) { const len = Math.min(zb - 4 - z, 14 + r() * 14), x0 = -3.8 + r() * 2.5; out.push({ k: 'wear', y, x0, x1: x0 + 2.6 + r() * 1.6, z0: z, z1: z + len }); }
    for (let n = 0; n < L / 7; n++) { const [x, z] = spot(18); out.push({ k: 'litter', x, z, y, seed: 1 + n + i * 99 }); }
    for (let n = 0; n < Math.round(L / 28 * dens); n++) { const [x, z] = spot(12); out.push({ k: 'sweeper', x, z, y, rot: r() * 6.28, seed: 50 + n + i * 10 }); }
    for (let n = 0; n < Math.round(L / 45 * dens); n++) { const [x, z] = spot(16); out.push({ k: 'rest', x, z, y, rot: r() * 6.28, seed: 80 + n + i * 10, who: r() < 0.7 ? 'man' : 'woman' }); }
    for (let n = 0; n < Math.round(L / 30 * dens) + 1; n++) { const sx = r() < 0.5 ? -1 : 1, z = za + 10 + r() * L; if (!clear(sx * 15.5, z, 2)) continue; out.push({ k: 'seller', x: sx * 15.5, z, y, rot: 0, side: r() < 0.5 ? 1 : -1, seed: 120 + n + i * 10, goods: [['basket', 'water_pot', 'dark_pot', 'heap'], ['basket', 'basket', 'heap'], ['water_pot', 'dark_pot', 'amphora']][n % 3], who: r() < 0.75 ? 'woman' : 'man' }); }
    for (let n = 0; n < Math.round(L / 22 * dens); n++) { const [x, z] = spot(16); out.push({ k: 'group', x, z, y, n: 2 + Math.floor(r() * 3), seed: 200 + n * 7 + i * 30 }); }
    for (let n = 0; n < Math.round(L / 80 * dens) + 1; n++) { const [x, z] = spot(15); out.push({ k: 'boys', x, z, y, seed: 300 + n * 5 + i * 20 }); }
    for (let n = 0; n < (i === 2 ? 3 : 1); n++) { const [x, z] = spot(16); out.push({ k: 'dog', x, z, y, rot: r() * 6.28, seed: 400 + n + i * 3 }); }
    if (i === 2 || i === 3) { const [x, z] = spot(15); out.push({ k: 'turkey', x, z, y, rot: r() * 6.28, seed: 450 + i }); }
    if (i >= 1 && i <= 3) { const z = za + 20 + r() * (L - 40), x = -13; if (clear(x, z, 4)) out.push({ k: 'crew', x, z, y, seed: 500 + i * 10 }); }
    // offerings at the middle altars
    for (const [ax, az, rr] of altars) if (az >= za && az <= zb) for (let q = 0; q < 5; q++) { const a = q * 1.3 + 0.3; out.push({ k: 'offering', x: ax + Math.cos(a) * (rr + 1.0), z: az + Math.sin(a) * (rr + 1.0), y, seed: q + 7 }); }
  });
  // the Moon Plaza (its terrace MOON.rise up): braziers about the Cross, groups, sweepers, the plasterers, dogs
  {
    const r = rng(777), y = MOON.rise + 0.06, [qx0, qz0, qx1, qz1] = PLAZA;
    const spot = () => { for (let t = 0; t < 40; t++) { const x = qx0 + 24 + r() * (qx1 - qx0 - 48), z = qz0 + 6 + r() * (qz1 - qz0 - 24); if (clear(x, z, 2) && Math.abs(x) > 4) return [x, z]; } return [30, qz0 + 10]; };
    for (const [x, z] of [[-12, -212], [12, -212], [-30, -240], [30, -240], [-40, -208], [40, -208], [-20, -250], [20, -250]]) out.push({ k: 'brazier', x, z, y });
    for (let n = 0; n < 9; n++) { const [x, z] = spot(); out.push({ k: 'group', x, z, y, n: 2 + n % 3, seed: 600 + n * 11 }); }
    for (let n = 0; n < 5; n++) { const [x, z] = spot(); out.push({ k: 'sweeper', x, z, y, rot: r() * 6.28, seed: 650 + n }); }
    for (let n = 0; n < 4; n++) { const [x, z] = spot(); out.push({ k: 'rest', x, z, y, rot: r() * 6.28, seed: 680 + n }); }
    for (let n = 0; n < 3; n++) { const [x, z] = spot(); out.push({ k: 'dog', x, z, y, rot: r() * 6.28, seed: 700 + n }); }
    for (let n = 0; n < 2; n++) { const [x, z] = spot(); out.push({ k: 'boys', x, z, y, seed: 720 + n }); }
    out.push({ k: 'crew', x: -45, z: -236, y, seed: 740 });
    for (let n = 0; n < 40; n++) { const [x, z] = spot(); out.push({ k: 'litter', x, z, y, seed: 760 + n }); }
    for (let q = 0; q < 6; q++) { const a = q * 1.1; out.push({ k: 'offering', x: -12 + Math.cos(a) * 3.5, z: -212 + Math.sin(a) * 3.5, y, seed: q + 40 }); }
  }
  // the Ciudadela's court (a plastered floor at 0.03 between the banks): about the Feathered Serpent Pyramid and its Adosada
  {
    const r = rng(333), y = 0.06, [x0, z0, x1, z1] = [CIUD[0] + 22, CIUD[1] + 22, CIUD[2] - 22, CIUD[3] - 22];
    const solid = (x, z, m = 2.5) => (x > 89 - m && x < 119 + m && z > 237 - m && z < 283 + m) || (x > 117.5 - m && x < 182.5 + m && z > 227.5 - m && z < 292.5 + m);
    const spot = () => { for (let t = 0; t < 60; t++) { const x = x0 + 4 + r() * (x1 - x0 - 8), z = z0 + 4 + r() * (z1 - z0 - 8); if (!solid(x, z)) return [x, z]; } return [x0 + 6, z0 + 6]; };
    for (let n = 0; n < 16; n++) { const [x, z] = spot(); out.push({ k: 'group', x, z, y, n: 2 + n % 3, seed: 1000 + n * 13 }); }
    for (let n = 0; n < 8; n++) { const [x, z] = spot(); out.push({ k: 'sweeper', x, z, y, rot: r() * 6.28, seed: 1100 + n }); }
    for (let n = 0; n < 6; n++) { const [x, z] = spot(); out.push({ k: 'rest', x, z, y, rot: r() * 6.28, seed: 1150 + n }); }
    for (let n = 0; n < 4; n++) { const [x, z] = spot(); out.push({ k: 'boys', x, z, y, seed: 1200 + n * 3 }); }
    for (let n = 0; n < 4; n++) { const [x, z] = spot(); out.push({ k: 'dog', x, z, y, rot: r() * 6.28, seed: 1250 + n }); }
    for (let n = 0; n < 60; n++) { const [x, z] = spot(); out.push({ k: 'litter', x, z, y, seed: 1300 + n }); }
    const bz = [215, 238, 260, 282, 305];
    for (const z of bz) for (const x of [66, 172 + 10]) if (!solid(x, z, 0)) out.push({ k: 'brazier', x, z, y });
    for (const x of [100, 130, 160]) for (const z of [208, 312]) out.push({ k: 'brazier', x, z, y });
    for (let q = 0; q < 10; q++) { const a = q * 0.9; out.push({ k: 'offering', x: 78 + Math.cos(a) * 2.5, z: 260 + Math.sin(a) * 4, y, seed: q + 60 }); }
    out.push({ k: 'crew', x: 70, z: 215, y, seed: 1400 });
  }
  CACHE = out;
  return out;
}
/** The braziers whose incense the smoke system rises from: those of the arrival plaza and the Moon Plaza, [x, y, z]. */
export function brazierSpots() { return avenueItems().filter((o) => o.k === 'brazier' && ((o.y < 0.5 && o.y > -0.1 && o.z > -4 && o.z < 120 && Math.abs(o.x) < 20) || o.y > 2.5 || (o.x > 50 && o.z > 190))).map((o) => [o.x, o.y + 0.7, o.z]); }
