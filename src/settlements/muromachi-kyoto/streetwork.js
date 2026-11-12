// Muromachi Kyoto — the street work (docs/settlements/muromachi-kyoto.md §5.3): the stone-edged gutter under the eaves of every
// street, the town's gates and its roadside shrines, the notice boards and public wells at the crossings; the yards behind the
// houses (storehouses, vegetable beds, woodsheds, racks for drying), the steps down to the stream, and the temples' bell towers
// and stones. Plans of the muromachi style; positions from layout.js.
import { NS, EW, SW, RADIUS, STREAM, GINKAKU, RYOAN, streets, yards, inLot, onBridge, inRect } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
export const STEP_Z = [-210, -150, -85, -30, 40, 140, 205];

/** The gutters: along both sides of every street where houses stand, 1.2 m in from the block's edge (under the eaves' drip), broken at the crossings. */
export function gutters() {
  const E = [], S = streets(), horiz = (r) => r[2] - r[0] > r[3] - r[1];
  for (const r of S) {
    if (Math.min(r[2] - r[0], r[3] - r[1]) < 6) continue;
    const h = horiz(r);
    for (const side of [0, 1]) {
      const c = h ? (side ? r[3] - 1.2 : r[1] + 1.2) : (side ? r[2] - 1.2 : r[0] + 1.2), out = side ? 1.4 : -1.4;
      const a0 = h ? r[0] : r[1], a1 = h ? r[2] : r[3];
      const cross = S.filter((q) => horiz(q) !== h && Math.min(q[2] - q[0], q[3] - q[1]) > 6 && (h ? q[1] <= c && q[3] >= c && q[0] < r[2] && q[2] > r[0] : q[0] <= c && q[2] >= c && q[1] < r[3] && q[3] > r[1])).map((q) => (h ? [q[0] - 0.4, q[2] + 0.4] : [q[1] - 0.4, q[3] + 0.4]));
      let run = null;
      for (let a = a0; a <= a1; a += 3) {
        const x = h ? a : c + 0, z = h ? c : a, ok = !cross.some(([p, q]) => a >= p - 1.5 && a <= q + 1.5) && inLot(h ? x : c + out, h ? c + out : z, 0.5) && Math.hypot(x, z) < RADIUS - 26 && !(x > STREAM.x0 - 4 && x < STREAM.x1 + 4);
        if (ok) { if (!run) run = [a, a]; else run[1] = a; } else if (run) { if (run[1] - run[0] > 3) E.push(h ? { t: 'gutter', a: [run[0], c], b: [run[1], c], y: 0 } : { t: 'gutter', a: [c, run[0]], b: [c, run[1]], y: 0 }); run = null; }
      }
      if (run && run[1] - run[0] > 3) E.push(h ? { t: 'gutter', a: [run[0], c], b: [run[1], c], y: 0 } : { t: 'gutter', a: [c, run[0]], b: [c, run[1]], y: 0 });
    }
  }
  return E;
}

/** The gates across the streets near their ends, the roadside shrines and notice boards at the crossings, public wells. */
export function furniture() {
  const E = [], r = rng(1493);
  for (const q of streets()) {
    if (q[2] - q[0] < 150 || q[3] - q[1] > 8) continue;                       // the long streets along x
    const z = (q[1] + q[3]) / 2;
    for (const x of [q[0] + 16, Math.min(q[2] - 16, NS[NS.length - 1] - 14)]) if (Math.hypot(x, z) < RADIUS - 40 && !inRect(GINKAKU.rect, x, z, 4) && !inRect(RYOAN.rect, x, z, 4)) E.push({ t: 'kido', at: [x, z], w: 7, y: 0 });
  }
  let k = 0;
  for (let i = 0; i < NS.length; i++) for (let j = 0; j < EW.length; j++) {
    const x = NS[i], z = EW[j];
    if (Math.hypot(x, z) > RADIUS - 50 || inRect(GINKAKU.rect, x, z, 6) || inRect(RYOAN.rect, x, z, 6)) continue;
    k++;
    const c = [x + SW - 1.1, z + SW - 1.1];                                    // the inner corner of the crossing, clear of the house eaves
    if (k % 4 === 0) E.push({ t: 'jizo', at: c, rot: Math.PI * (0.5 + 0.5 * (k % 2)) });
    else if (k % 7 === 1) E.push({ t: 'kosatsu', at: [x - SW + 1.4, z - SW + 1.4], rot: 0 });
    else if (k % 5 === 2) E.push({ t: 'ido', at: [x + 1.5, z - 1.5], y: 0, rot: r() * 6 });
  }
  // beside the stream, in the strip before Ginkaku-ji's wall: an Inari shrine and a Jizō
  E.push({ t: 'inari', at: [108.2, 52], rot: -Math.PI / 2 }, { t: 'jizo', at: [107.5, -36], rot: -Math.PI / 2 });
  return E;
}

/** The yards: each block's yard in nine sectors — a storehouse, vegetable beds, a woodshed, a drying rack — round its well. */
export function yardWork() {
  const E = [], r = rng(1498);
  for (const y of yards()) {
    const w = y[2] - y[0], d = y[3] - y[1], sw = w / 3, sd = d / 3, c = (i, j) => [y[0] + sw * (i + 0.5), y[1] + sd * (j + 0.5)];
    if (w < 24 || d < 24) continue;
    const kura = (i, j, ww = 5.5, dd = 7) => { const [cx, cz] = c(i, j); E.push({ t: 'kura', rect: [cx - ww / 2, cz - dd / 2, cx + ww / 2, cz + dd / 2], y: 0 }); };
    if (r() < 0.8) kura(0, 0); if (r() < 0.45) kura(2, 2, 6, 7.5);
    for (const [i, j] of [[2, 0], [0, 2]]) {
      const [cx, cz] = c(i, j), n = 3 + Math.floor(r() * 3);
      if (r() < 0.65) for (let b = 0; b < n; b++) E.push({ t: 'veg_bed', rect: [cx - 5 + b * 2.0, cz - 4.5, cx - 5 + b * 2.0 + 1.5, cz + 4.5], y: 0, seed: Math.floor(r() * 1e6) });
      else E.push({ t: 'drying_rack', at: [cx, cz], rot: Math.floor(r() * 2) * Math.PI / 2, len: 5, cloth: r() < 0.5 ? 'cloth_indigo' : null, seed: Math.floor(r() * 1e6) });
    }
    { const [cx, cz] = c(1, 0); E.push({ t: 'woodshed', at: [cx + (r() - 0.5) * 4, cz - 1], y: 0, rot: Math.PI }); }
    { const [cx, cz] = c(2, 1); for (let b = 0; b < 4; b++) if (r() < 0.8) E.push({ t: 'veg_bed', rect: [cx - 3 + b * 1.6, cz - 3, cx - 3 + b * 1.6 + 1.2, cz + 3], y: 0, seed: Math.floor(r() * 1e6) }); }
  }
  return E;
}

/** The stream's steps on both banks, at the places where the women wash. */
export function streamWork() {
  const E = [];
  for (const z of STEP_Z) {
    if (Math.hypot(STREAM.x0, z) > RADIUS - 40) continue;
    E.push({ t: 'stream_steps', at: [STREAM.x0, z], side: 'w', top: STREAM.top, level: STREAM.level, w: 1.3 });
    E.push({ t: 'stream_steps', at: [STREAM.x1, z + 18], side: 'e', top: STREAM.top, level: STREAM.level, w: 1.0 });
  }
  return E;
}

/** The temples' bell towers and the stones of the gardens' ponds. */
export function templeWork() {
  const E = [], G = GINKAKU.pond, P = RYOAN.pond;
  E.push({ t: 'shoro', at: [140, -52], y: 0 }, { t: 'shoro', at: [-208, -122], y: 0 });
  // the islets of the pond at Ginkaku-ji: stones and a pine on each; stones along the bank of Ryōan-ji's
  for (const [dx, dz, k] of [[-18, -2, 1.5], [14, 3, 1.2], [34, -3, 1.0]]) { E.push({ t: 'stone_group', at: [G.c[0] + dx, G.c[1] + dz], y: G.bed + 0.2, seed: 5 + dx, n: 4, k }); }
  E.push({ t: 'niwaki', at: [G.c[0] - 18, G.c[1] - 2.5], y: -0.9, h: 3.8, seed: 12 });
  for (const [dx, dz] of [[-30, 11], [-6, 12], [22, -10], [30, 8]]) E.push({ t: 'stone_group', at: [P.c[0] + dx, P.c[1] + dz], y: P.bed + 0.4, seed: 9 + dx, n: 3, k: 1.1 });
  // the kitchen (kuri) of Ryōan-ji, by the gate, open
  E.push({ t: 'machiya_m', at: [-199, -111], facing: 's', w: 9, d: 12, seed: 4242, trade: 'food', open: true, y: 0 });
  E.push({ t: 'woodshed', at: [-188, -112], y: 0, rot: Math.PI });
  return E;
}
void onBridge;
