// The finish of the monastery's approach and of the hill behind it (docs/settlements/tang-wutai.md §13): the gate's stone drums, dismount
// stele and hitching posts; stone lamp pillars, benches and fire vats on the three levels; the monks' well and washing in the
// courtyard; a path of slabs up Foguang Hill past a shrine and cairns to a hermit's cell under pines. [inferred: the gate's furniture,
// the lamps, the hermitage and the path; Tang monasteries had stone lamp pillars (shi deng) and hill hermitages, no source for this one]
// Elements of the `wutai-site` style and of the street life. Pure data.

import { GATE_X, height } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

export function dress() {
  const C = [], Lf = [], rand = rng(8570);
  const blk = (rect, y0, y1, mat, collide = false) => C.push({ t: 'block', rect, y0, y1, mat, collide });
  const gy = (x, z) => height(x, z);
  const monk = (x, z, y, rot, seed, extra = {}) => Lf.push({ t: 'figure', at: [x, z], y, rot, seed, dress: 'robe', cloth: seed % 3 ? 'cloth_black' : 'cloth_grey', cloth2: 'cloth_brown', skin: 'skin_light', hair: 'shaven', hat: 'none', carry: 'none', pose: 'stand', ...extra });
  // the gate: a pair of stone drums on bases flanking the way, a dismount stele (xiama bei) and two hitching posts west of it, red lanterns on the posts
  for (const s of [-1, 1]) {
    const x = GATE_X - 4.2, z = s * 3.4, y = gy(x, z);
    blk([x - 0.6, z - 0.6, x + 0.6, z + 0.6], y - 0.2, y + 0.35, 'granite_grey', true); blk([x - 0.45, z - 0.45, x + 0.45, z + 0.45], y + 0.35, y + 1.25, 'granite_grey', true); blk([x - 0.5, z - 0.5, x + 0.5, z + 0.5], y + 1.25, y + 1.3, 'iron');
    const hx = GATE_X - 9, hz = s * 5.4, hy = gy(hx, hz);
    for (const o of [-0.8, 0.8]) blk([hx - 0.07, hz + o - 0.07, hx + 0.07, hz + o + 0.07], hy - 0.4, hy + 1.3, 'timber', true);
    blk([hx - 0.05, hz - 0.8, hx + 0.05, hz + 0.8], hy + 1.0, hy + 1.1, 'timber');
    Lf.push({ t: 'lantern', kind: 'paper', h: 2.2, at: [GATE_X - 3.0, s * 5.2], y: gy(GATE_X - 3.0, s * 5.2) });
  }
  { const x = GATE_X - 7, z = -7.4, y = gy(x, z); blk([x - 0.6, z - 0.4, x + 0.6, z + 0.4], y - 0.3, y + 0.3, 'limestone', true); blk([x - 0.4, z - 0.17, x + 0.4, z + 0.17], y + 0.3, y + 2.1, 'limestone', true); blk([x - 0.46, z - 0.23, x + 0.46, z + 0.23], y + 2.1, y + 2.25, 'limestone'); }
  Lf.push({ t: 'animal', kind: 'donkey', at: [GATE_X - 9.2, 6.6], y: gy(GATE_X - 9.2, 6.6), seed: 71, rot: 1.6 });
  monk(GATE_X - 4.8, -1.8, gy(GATE_X - 4.8, -1.8), 1.57, 6101, { pose: 'talk' });
  // stone lamp pillars and benches on the three levels (courtyard 0, middle terrace 6.5, upper terrace 13), set beside the axis
  for (const [x, y] of [[-34, 0], [6, 6.5], [44, 13]]) for (const s of [-1, 1]) {
    C.push({ t: 'wutai_lamp', at: [x, s * 9], y });
    Lf.push({ t: 'bench', len: 1.8, at: [x + 2.6, s * 14.5], y, seed: Math.round(x) + s, rot: Math.PI / 2 });
  }
  // fire vats (taiping gang): big water jars kept full against fire at the hall's front corners and the Manjusri hall
  for (const [x, z, y] of [[45.2, -19, 13], [45.2, 19, 13], [12, -33.2, 6.5], [-47, 30, 0]]) Lf.push({ t: 'pot', kind: 'vat', n: 1, at: [x, z], y, seed: Math.round(x * 3 + z) });
  // the courtyard: the monks' well, washing hung to dry, a rack, baskets, a monk drawing water, another with a broom-less bow
  C.push({ t: 'wutai_well', at: [-47, -27], y: 0 });
  Lf.push({ t: 'laundry', len: 3.4, at: [-44, 27], y: 0, seed: 7, rot: 0 }, { t: 'laundry', len: 3.4, at: [-39.5, 27.4], y: 0, seed: 8, rot: 0 });
  C.push({ t: 'wutai_rack', at: [-50, 24], y: 0, rot: 0, len: 3 });
  Lf.push({ t: 'basket', n: 3, at: [-45.6, -29.0], y: 0, seed: 9 }, { t: 'trough', at: [-44, -27.5], y: 0, seed: 10, rot: 0 });
  monk(-45.8, -26.4, 0, 3.9, 6102, { pose: 'talk' }); monk(-42.5, 25.8, 0, 0, 6103, { cloth2: 'cloth_ochre' });
  // the path up the hill: slabs of bluestone from the upper terrace's south-east corner to the hermit's cell, a stone lamp at its foot, a shrine
  // half-way, cairns and old pines beside it
  const way = [[96, 36], [114, 40], [130, 50], [146, 48], [162, 58], [172, 56]];
  const slab = (x, z, k) => { const y = gy(x, z); blk([x - 0.7, z - 0.65, x + 0.7, z + 0.65], y - 0.35, y + 0.045 + (k % 3) * 0.012, k % 4 ? 'bluestone' : 'limestone', false); };
  let k = 0;
  for (let i = 0; i < way.length - 1; i++) {
    const [ax, az] = way[i], [bx, bz] = way[i + 1], n = Math.round(Math.hypot(bx - ax, bz - az) / 1.35);
    for (let j = 0; j < n; j++) { const t = j / n, x = ax + (bx - ax) * t + (rand() - 0.5) * 0.3, z = az + (bz - az) * t + (rand() - 0.5) * 0.3; slab(x, z, k++); if (rand() < 0.3) { const o = (rand() < 0.5 ? -1 : 1) * (1.3 + rand() * 0.5); blk([x + o * 0.2 - 0.12, z + o - 0.1, x + o * 0.2 + 0.12, z + o + 0.1], gy(x, z) - 0.1, gy(x, z) + 0.1, 'schist_rubble', false); } }
  }
  C.push({ t: 'wutai_lamp', at: [97, 33], y: gy(97, 33) });
  C.push({ t: 'wutai_shrine', at: [147.5, 44.8], y: gy(147.5, 44.8), front: 'w' });
  for (const [x, z, s] of [[104, 44, 1], [124, 43, 2], [140, 56, 3], [158, 52, 4]]) C.push({ t: 'wutai_cairn', at: [x, z], y: gy(x, z), seed: s });
  for (const [x, z, h, s] of [[111, 46, 7, 1], [128, 40, 6, 2], [138, 46, 8, 3], [153, 63, 7, 4], [166, 50, 6.5, 5], [178, 63, 8, 6], [182, 52, 7, 7], [120, 56, 6, 8]]) C.push({ t: 'wutai_pine', at: [x, z], y: gy(x, z), h, seed: s * 11 });
  // the hermit's cell: a hut of stone and earth with a lean-to roof facing the path, a little yard of piled stones, a woodpile, a jar, the hermit sitting before it, a pilgrim on the path
  { const r = [174, 51, 180.2, 56.4], hs = [[r[0], r[1]], [r[2], r[1]], [r[0], r[3]], [r[2], r[3]]].map(([x, z]) => gy(x, z));
    C.push({ t: 'wutai_house', rect: r, front: 'w', y: Math.max(...hs), foot: Math.min(...hs), seed: 4242, kind: 'shed', nb: 2, bare: true, wallMat: 'schist_rubble' });
    Lf.push({ t: 'firewood', at: [180.4, 58], y: gy(180.4, 58), seed: 12, rot: 0, len: 1.6 }, { t: 'pot', kind: 'vat', n: 1, at: [172.6, 57.5], y: gy(172.6, 57.5), seed: 13 }, { t: 'stool', at: [172.0, 54.0], y: gy(172.0, 54.0), seed: 14, rot: 0 });
    monk(172.0, 54.0, gy(172, 54), -Math.PI / 2 - 0.3, 6104, { pose: 'low', cloth: 'cloth_grey', cloth2: 'cloth_brown' });
    monk(163, 58.4, gy(163, 58.4), 0.8, 6105, { cloth: 'cloth_indigo', cloth2: 'cloth_white', hair: 'topknot', hat: 'brim', carry: 'basket' });
    monk(116.8, 40.3, gy(116.8, 40.3), -0.4, 6106, { cloth: 'cloth_brown', hair: 'topknot', hat: 'straw', dress: 'trousers', carry: 'pole' }); }
  // pilgrims' offerings at the shrine: a small mat with fruit baskets
  Lf.push({ t: 'basket', n: 2, at: [146.4, 44.8], y: gy(146.4, 44.8), seed: 15 });
  return { chinese: C, life: Lf };
}
