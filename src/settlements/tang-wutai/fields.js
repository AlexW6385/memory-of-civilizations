// The terraced fields of the valley's flanks (docs/settlements/tang-wutai.md §13): rows of millet on the flat of each terrace, the
// bank between them left to grass, a scarecrow, a stook of sheaves, a cairn of cleared stones, a field hut here and there, farmers
// bent at their work, a cart and an ox. The terraces are found from the ground itself (layout.js height).
// Elements of the `wutai-site` style and of the street life. Pure data.

import { height, inLot, inLane, inRect, GREEN, RADIUS } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

/** The flat bands of the terraces on one flank (sign −1 north, +1 south): [z0, z1] in |z|, from the ground's slope across z. */
export function bands(sign) {
  const out = []; let start = null;
  for (let a = 100; a < 215; a += 0.5) {
    const flat = Math.abs(height(-110, sign * (a + 0.5)) - height(-110, sign * a)) < 0.05 && Math.abs(height(-190, sign * (a + 0.5)) - height(-190, sign * a)) < 0.05;
    if (flat && start === null) start = a;
    if (!flat && start !== null) { if (a - start > 3.5) out.push([start + 0.4, a - 0.4]); start = null; }
  }
  return out;
}

let BUILT = null;
export function fields() {
  if (BUILT) return BUILT;
  const W = [], Lf = [], rand = rng(2468);
  const ok = (x, z) => Math.hypot(x, z) < RADIUS - 30 && !inLot(x, z, 1.2) && !inLane(x, z, 1.2) && !inRect(GREEN, x, z, 2);
  const yaw = (s) => (s > 0 ? 0 : Math.PI);
  for (const sign of [-1, 1]) bands(sign).forEach(([a0, a1], bi) => {
    const z0 = sign * a0, z1 = sign * a1, rect = [-205, Math.min(z0, z1), -78, Math.max(z0, z1)], mid = (a0 + a1) / 2 * sign;
    const crop = (bi + (sign > 0 ? 1 : 0)) % 3;                                        // 0, 1 millet; 2 stubble and stooks
    if (crop < 2) W.push({ t: 'wutai_rows', rect, along: 'x', spacing: 1.1, h: crop ? 1.0 : 1.35, seed: bi * 13 + (sign > 0 ? 7 : 1), skip: (x, z) => !ok(x, z) });
    // a scarecrow and a cairn at the band's ends, a few stooks
    for (let k = 0; k < 2; k++) { const x = -100 - rand() * 90, z = mid + (rand() - 0.5) * (a1 - a0) * 0.5; if (ok(x, z)) W.push({ t: 'wutai_scarecrow', at: [x, z], y: height(x, z), seed: Math.floor(rand() * 999) }); }
    { const x = -84 - rand() * 6, z = mid; if (ok(x, z)) W.push({ t: 'wutai_cairn', at: [x, z], y: height(x, z), seed: bi + 3 }); }
    if (crop === 2) for (let k = 0; k < 9; k++) { const x = -90 - rand() * 100, z = mid + (rand() - 0.5) * (a1 - a0) * 0.7; if (ok(x, z)) Lf.push({ t: 'haystack', at: [x, z], y: height(x, z), seed: Math.floor(rand() * 999) }); }
    // a field hut of mud brick with a lean-to roof, at the band's far end from the village, facing the lane side
    if (bi % 2 === 0) { const x = -150 - rand() * 40, z = mid + sign * (a1 - a0) * 0.15, r = [x - 1.7, z - 1.5, x + 1.7, z + 1.5]; if (ok(x, z) && ok(x + 1.7, z + 1.5) && ok(x - 1.7, z - 1.5)) { const hs = [[r[0], r[1]], [r[2], r[1]], [r[0], r[3]], [r[2], r[3]]].map(([p, q]) => height(p, q)); W.push({ t: 'wutai_house', rect: r, front: sign > 0 ? 'n' : 's', y: Math.max(...hs), foot: Math.min(...hs), seed: 900 + bi, kind: 'shed', nb: 1, bare: true }); } }
    // farmers at the work, bent over, in straw hats; a pair resting in the shade of a stook
    for (let k = 0; k < 3; k++) {
      const x = -95 - rand() * 100, z = mid + (rand() - 0.5) * (a1 - a0) * 0.6; if (!ok(x, z)) continue;
      Lf.push({ t: 'figure', at: [x, z], y: height(x, z), rot: rand() * 6.28, seed: 700 + bi * 10 + k + (sign > 0 ? 100 : 0), dress: k % 2 ? 'trousers' : 'robe', cloth: ['cloth_indigo', 'cloth_grey', 'cloth_brown', 'cloth_white'][k % 4], cloth2: 'cloth_white', skin: 'skin_light', hair: k === 1 ? 'bun' : 'topknot', hat: 'straw', carry: 'none', pose: 'low' });
    }
    if (bi % 3 === 1) { const x = -120 - rand() * 50, z = mid; if (ok(x, z)) { Lf.push({ t: 'cart', kind: 'two', load: 'sacks', at: [x, z], y: height(x, z), seed: bi + 41, rot: yaw(sign) + Math.PI / 2 }); Lf.push({ t: 'animal', kind: 'ox', at: [x + 3.4, z], y: height(x + 3.4, z), seed: bi + 43, rot: yaw(sign) + Math.PI / 2 }); } }
  });
  BUILT = { chinese: W, life: Lf };
  return BUILT;
}
