// The lanes and the gardens of the city (docs/settlements/jerusalem.md §5b): the cells of the lot grid the
// houses did not take are walled gardens — an orchard of figs and olives, a yard with its beasts and its well,
// a house fallen to its footings, terraced olives on the slopes; arches carry rooms across the narrow lanes;
// a washing line, a pot or a stack of wood at the lane's doors. Pure data.

import { lots, gardens, laneArches, height } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** The segments of a wall along a polyline of points (each at most 3 m), with their ground levels. */
function run(pts, rand, h0 = 1.1, jitter = 0) {
  const S = [];
  for (let k = 0; k < pts.length - 1; k++) {
    const [ax, az] = pts[k], [bx, bz] = pts[k + 1], n = Math.max(1, Math.ceil(Math.hypot(bx - ax, bz - az) / 3));
    for (let q = 0; q < n; q++) {
      const x0 = ax + (bx - ax) * q / n, z0 = az + (bz - az) * q / n, x1 = ax + (bx - ax) * (q + 1) / n, z1 = az + (bz - az) * (q + 1) / n;
      const h = [height(x0, z0), height((x0 + x1) / 2, (z0 + z1) / 2), height(x1, z1)];
      S.push([x0, z0, x1, z1, Math.min(...h), Math.max(...h), h0 + (jitter ? (rand() - 0.5) * jitter : 0)]);
    }
  }
  return S;
}

export function gardenWalls() {
  const E = [], rand = rng(751);
  for (const g of gardens()) {
    const [x0, z0, x1, z1] = g.rect, m = 0.3, a = [x0 + m, z0 + m], b = [x1 - m, z0 + m], c = [x1 - m, z1 - m], d = [x0 + m, z1 - m];
    const gx = (x0 + x1) / 2 + (rand() - 0.5) * 4, hw = 0.95;
    let segs;
    if (g.kind === 'ruin') {
      // footings of a house fallen: the walls to a metre in places, to a knee in others, a gap or two
      segs = [...run([a, b], rand, 0.9, 1.4), ...run([b, c], rand, 0.8, 1.4), ...run([c, [gx + hw, c[1]]], rand, 0.7, 1.2), ...run([[gx - hw, d[1]], d], rand, 0.7, 1.2), ...run([d, a], rand, 0.9, 1.4)].filter(() => rand() > 0.18);
    } else {
      const h = g.kind === 'terrace' ? 1.35 : 1.15;
      segs = [...run([a, b], rand, h), ...run([b, c], rand, h), ...run([c, [gx + hw, c[1]]], rand, h), ...run([[gx - hw, d[1]], d], rand, h), ...run([d, a], rand, h)];
    }
    E.push({ t: 'wall_run', segs, th: 0.5, mat: 'rubble' });
    if (g.kind === 'ruin') {
      // the fallen stone heaped inside, a doorway's lintel lying
      for (let k = 0; k < 5; k++) { const px = x0 + 2 + rand() * (x1 - x0 - 4), pz = z0 + 2 + rand() * (z1 - z0 - 4), yy = height(px, pz), r = 0.5 + rand() * 0.6; E.push({ t: 'block', rect: [px - r, pz - r * 0.8, px + r, pz + r * 0.8], y0: yy - 0.2, y1: yy + 0.3 + rand() * 0.45, batter: [0.2, 0.2, 0.2, 0.2], mat: 'rubble', collide: false }); }
    }
  }
  return E;
}

export function gardenLife() {
  const E = [], rand = rng(753), pick = (a) => a[Math.floor(rand() * a.length)];
  const CL = ['cloth_white', 'cloth_brown', 'cloth_indigo', 'cloth_ochre', 'cloth_grey'];
  for (const g of gardens()) {
    const [x0, z0, x1, z1] = g.rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, y = height(cx, cz);
    const at = (fx, fz) => { const x = x0 + (x1 - x0) * fx, z = z0 + (z1 - z0) * fz; return [x, z, height(x, z)]; };
    if (g.kind === 'yard') {
      // beasts in the yard, a trough, a stack of wood, jars against the wall, hens; a woman and a boy
      const [ax, az, ay] = at(0.3, 0.4), [bx, bz, by] = at(0.65, 0.55);
      E.push({ t: 'animal', kind: pick(['goat', 'sheep', 'goat']), at: [ax, az], y: ay, rot: rand() * 6.28, seed: Math.floor(rand() * 1e9) });
      E.push({ t: 'animal', kind: pick(['goat', 'sheep', 'donkey']), at: [bx, bz], y: by, rot: rand() * 6.28, seed: Math.floor(rand() * 1e9) });
      if (rand() < 0.6) E.push({ t: 'animal', kind: 'goat', at: [cx + 1.5, cz - 1.5], y: height(cx + 1.5, cz - 1.5), rot: rand() * 6.28, seed: Math.floor(rand() * 1e9) });
      const [tx, tz, ty] = at(0.2, 0.15); E.push({ t: 'trough', at: [tx, tz], y: ty, rot: 0 });
      const [wx, wz, wy] = at(0.8, 0.2); E.push({ t: 'firewood', at: [wx, wz], y: wy, rot: rand() * 0.4, seed: Math.floor(rand() * 1e9), len: 1.4 });
      const [px, pz, py] = at(0.85, 0.8); E.push({ t: 'pot', kind: pick(['amphora', 'pithos', 'water_pot']), n: 3, at: [px, pz], y: py, seed: Math.floor(rand() * 1e9) });
      const [hx, hz, hy] = at(0.5, 0.8); E.push({ t: 'chickens', at: [hx, hz], y: hy, rot: rand() * 6.28, seed: Math.floor(rand() * 1e9) });
      E.push({ t: 'figure', at: [cx - 1.2, cz + 0.5], y, rot: rand() * 6.28, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: pick(CL), cloth2: pick(CL), skin: 'skin_medium', hat: rand() < 0.5 ? 'turban' : 'veil', hatMat: 'cloth_white', pose: rand() < 0.5 ? 'squat' : 'stand', carry: rand() < 0.3 ? 'basket' : 'none' });
    } else if (g.kind === 'orchard') {
      const [wx, wz, wy] = at(0.5, 0.5);
      if (rand() < 0.5) E.push({ t: 'well', kind: 'shaduf', at: [wx, wz], y: wy, seed: Math.floor(rand() * 1e9) });
      const [bx, bz, by] = at(0.2, 0.75); E.push({ t: 'basket', at: [bx, bz], y: by, n: 2, seed: Math.floor(rand() * 1e9) });
      if (rand() < 0.6) E.push({ t: 'figure', at: [cx + 1.5, cz + 2], y, rot: rand() * 6.28, seed: Math.floor(rand() * 1e9), dress: 'tunic', legs: 'bare', cloth: 'cloth_brown', cloth2: 'cloth_brown', skin: 'skin_medium', hat: 'cap', carry: 'hoe', pose: 'stand' });
    } else if (g.kind === 'terrace' && rand() < 0.5) {
      E.push({ t: 'animal', kind: 'goat', at: [cx, cz], y, rot: rand() * 6.28, seed: Math.floor(rand() * 1e9) });
    }
  }
  return E;
}

/** Arches over the narrow lanes, and the lanes' doors' things. */
export function laneArchElements() {
  const E = [];
  for (const a of laneArches()) E.push({ t: 'lane_arch', x0: a.x0, x1: a.x1, z: a.z, y: height((a.x0 + a.x1) / 2, a.z), th: 3.2 });
  return E;
}

export function laneLife() {
  const E = [], rand = rng(757), pick = (a) => a[Math.floor(rand() * a.length)];
  for (const l of lots()) {
    const [x0, , x1, z1] = l.rect;
    // the house's door is on its south wall; where the lane is wide enough, jars and a stool by it
    if (l.gs > 2.4 && rand() < 0.55) {
      const x = x0 + 2 + rand() * (x1 - x0 - 4), z = z1 + 0.5;
      E.push({ t: 'pot', kind: pick(['zir', 'water_pot', 'amphora']), at: [x, z], y: height(x, z), seed: Math.floor(rand() * 1e9) });
      if (rand() < 0.4) E.push({ t: 'stool', at: [x + 0.8, z], y: height(x + 0.8, z), rot: rand() * 6.28 });
    }
    if (l.gx > 2.2 && rand() < 0.3) { const z = l.rect[1] + 3 + rand() * 6, x = x1 + 0.5; E.push({ t: 'barrel', at: [x, z], y: height(x, z), n: 1, seed: 3 }); }
  }
  return E;
}
