// SG̱ang Gwaay — the yards: what stands and who sits in the street before each house, on the beach and in the shallows, and who is
// inside the houses (docs/settlements/sgang-gwaay.md §5, §9). Pure data from layout.js; positions are derived, never hard-coded.
// { props: [{ kind, c, yaw, y, seed, w? }], sit: [{ at, y, rot, pose, who }], folk: [{ house, at, y, rot, pose, who }], boats: [{ c, yaw, l, seed, crew }] }

import { G, SEA, LANDMARK, houses, village, height, shoreX, arc, toWorld, inHouse, inSea } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
let FIT = null;
const frontOf = (z) => { const slope = 0.0036 * z, fl = Math.hypot(1, slope); return [1 / fl, -slope / fl]; };

export function yards() {
  if (FIT) return FIT;
  const rand = rng(1851), H = houses(), V = village();
  const props = [], sit = [], folk = [], boats = [];
  const taken = [...V.poles.map((p) => [p.c[0], p.c[1], 1.6]), ...V.racks.map((r) => [r.c[0], r.c[1], r.w / 2 + 1.2]), ...V.stacks.map((s) => [s.c[0], s.c[1], 2.2]),
    ...V.canoes.filter((c) => !c.moored).map((c) => [c.c[0], c.c[1], c.l / 2 + 1.6]), [V.hollow.c[0], V.hollow.c[1], V.hollow.l / 2 + 2.5]];
  const free = (x, z, r) => !inHouse(x, z, -(r + 1.2)) && !taken.some(([a, b, q]) => Math.hypot(a - x, b - z) < q + r);
  const put = (kind, x, z, yaw, o = {}) => {
    const r = o.r ?? 1.1;
    if (!free(x, z, r) || height(x, z) < (o.minH ?? 0.6)) return null;
    taken.push([x, z, r]);
    const p = { kind, c: [x, z], yaw, y: height(x, z), seed: Math.floor(rand() * 1e6), ...o }; delete p.r; delete p.minH;
    props.push(p); return p;
  };
  const at = (h, u, v) => toWorld(h, u, v);
  H.forEach((h, k) => {
    const hd = h.d / 2, hw = h.w / 2;
    // before the house: log benches with elders on them, an open fire with people about it, a hide frame, a net on its poles
    const bench = (u, dv) => {
      const [x, z] = at(h, u, -hd - dv), p = put('logbench', x, z, h.yaw + Math.PI / 2 + (rand() - 0.5) * 0.2, { r: 1.0 });
      if (p) sit.push({ at: [x, z], y: p.y + 0.0, rot: h.yaw + (rand() - 0.5) * 0.5, pose: 'sit', who: rand() < 0.5 ? 'elder' : 'woman' });
    };
    if (k % 2 === 0) bench(-hw * 0.5 + rand() * 2, 5.6 + rand());
    if (k % 3 !== 1) bench(hw * 0.55 - rand() * 2, 7.2 + rand());
    if (k % 3 === 2 || k === LANDMARK + 1) {
      const [x, z] = at(h, (rand() - 0.5) * hw, -hd - 8.2), p = put('fire', x, z, rand() * 6, { r: 1.8 });
      if (p) for (let j = 0; j < 3; j++) { const a = p.seed % 7 + j * 2.1, d = 1.9 + rand() * 0.3, sx = x + Math.cos(a) * d, sz = z + Math.sin(a) * d; sit.push({ at: [sx, sz], y: height(sx, sz), rot: Math.atan2(-(x - sx), -(z - sz)), pose: 'sit_ground', who: j === 0 ? 'woman' : rand() < 0.5 ? 'man' : 'child' }); }
    }
    { const [x, z] = at(h, hw + 2.1 + rand(), -hd * 0.4 + rand() * hd), p = put(k % 2 ? 'hideframe' : 'midden', x, z, h.yaw + (rand() - 0.5) * 0.6, { w: 2.6 + rand(), r: 1.5 }); if (p && p.kind === 'hideframe') sit.push({ at: [x + Math.cos(h.yaw) * 0.0, z - 1.0], y: height(x, z - 1.0), rot: Math.PI, pose: 'kneel', who: 'woman' }); }
    if (k % 3 !== 0) { const [x, z] = at(h, -hw - 2.0 - rand(), hd * 0.2 + rand() * hd * 0.5); put(k % 2 ? 'boxes' : 'bark', x, z, h.yaw + rand() * 0.6, { r: 1.5 }); }
    if (k % 2 === 1) { const [x, z] = at(h, (rand() - 0.5) * hw, -hd - 3.6 - rand() * 3); put('net', x, z, h.yaw, { w: 3.2 + rand() * 1.4, r: 1.5 }); }
    if (k % 3 === 0) { const [x, z] = at(h, -hw * 0.5, hd + 3.0); put('tub', x, z, 0, { r: 0.8 }); put('clams', x + 2, z + 0.5, h.yaw, { r: 1.3 }); }
    // and more, scattered over the street and the house's sides: the street is worked ground, not paving
    const KINDS = [['clams', 1.3], ['bark', 1.4], ['boxes', 1.5], ['floats', 1.0], ['hideframe', 1.5], ['tub', 0.8], ['logbench', 1.0], ['midden', 1.5], ['clams', 1.3], ['floats', 1.0]];
    for (let j = 0; j < 9; j++) {
      const [kind, r] = KINDS[Math.floor(rand() * KINDS.length)], side = rand() < 0.3, u = side ? (rand() < 0.5 ? -1 : 1) * (hw + 1.8 + rand() * 1.5) : (rand() - 0.5) * (h.w + 4), v = side ? (rand() - 0.5) * h.d : -hd - 2.6 - rand() * 9;
      const [x, z] = at(h, u, v), p = put(kind, x, z, h.yaw + (rand() - 0.5) * 1.2, { r, w: 2 + rand() * 1.5 });
      if (p && kind === 'logbench' && rand() < 0.8) sit.push({ at: [x, z], y: p.y, rot: h.yaw + (rand() - 0.5) * 0.6, pose: 'sit', who: rand() < 0.5 ? 'elder' : rand() < 0.5 ? 'woman' : 'man' });
      if (p && kind === 'hideframe') sit.push({ at: [x, z - 1.0], y: height(x, z - 1.0), rot: Math.PI, pose: 'kneel', who: 'woman' });
    }
    // the people inside: round the fire on the pit's floor, one or two on the beds
    const n = h.landmark ? 5 : 2 + Math.floor(rand() * 3);
    for (let j = 0; j < n; j++) {
      const a = rand() * 6.28 + j * 1.9, uu = Math.cos(a) * 1.55, vv = Math.sin(a) * 1.75, [x, z] = at(h, uu, vv);
      folk.push({ house: k, at: [x, z], y: G - 1.2, rot: Math.atan2(-(h.c[0] - x), -(h.c[1] - z)), pose: j % 3 === 2 ? 'cross' : 'sit_ground', who: j === 0 ? 'elder' : rand() < 0.5 ? 'woman' : rand() < 0.5 ? 'man' : 'child' });
    }
    const bu = (rand() < 0.5 ? -1 : 1) * (hw - 0.4 - 0.75), [bx, bz] = at(h, bu, -hd + 2.6 + rand() * 2);
    folk.push({ house: k, at: [bx, bz], y: G - 0.4 + 0.36, rot: h.yaw + (bu > 0 ? Math.PI / 2 : -Math.PI / 2) + Math.PI, pose: 'sit_ground', who: 'woman' });
  });
  // the beach: shell middens at the top, baskets of clams, cradles of canoes in the building, floats and nets, fish weirs in the shallows
  for (let z = -140; z <= 150; z += 23 + rand() * 9) {
    const x = shoreX(z) - 1.6 - rand() * 2;
    if (rand() < 0.45) put('clams', x, z, Math.PI / 2, { r: 1.4, minH: 0.1 }); else put('floats', x, z, rand() * 6, { r: 1.0, minH: 0.1 });
  }
  { const zn = H[0].c[1] - 16, [nx] = frontOf(zn); for (const dz of [-17, 18]) { const c = [arc(zn + dz) - 9 * nx, zn + dz]; put('cradle', c[0], c[1], Math.PI / 2 + 0.05, { w: 8 + rand() * 3, r: 2.2 }); } }
  for (const z of [-118, -62, -14, 52, 104, 140]) { const x = shoreX(z) + 8.5 + rand() * 1.5; if (inSea(x + 3, z) || height(x, z) < SEA) props.push({ kind: 'weir', c: [x, z], yaw: Math.PI / 2 + (rand() - 0.5) * 0.4, y: height(x, z), seed: Math.floor(rand() * 1e6) }); }
  for (let z = -150; z <= 150; z += 19 + rand() * 12) for (let k = 0; k < 2; k++) { const x = shoreX(z) + 9 + rand() * 18; if (inSea(x, z)) props.push({ kind: 'kelp', c: [x, z], yaw: rand() * 6, y: SEA, w: 3 + rand() * 3, seed: Math.floor(rand() * 1e6) }); }
  // boats at their moorings with their crews, fishing in the bay
  for (const z of [-112, -50, 28, 92, 138]) {
    const x = shoreX(z) + 19 + rand() * 6, l = 7 + rand() * 5;
    if (!inSea(x, z) || !inSea(x + 4, z)) continue;
    boats.push({ c: [x, z], yaw: Math.PI / 2 + (rand() - 0.5) * 0.5, l, seed: 800 + z, crew: 2 + (rand() < 0.5 ? 1 : 0) });
  }
  return (FIT = { props, sit, folk, boats });
}
export const footprintsY = () => yards().props.map((p) => p.c);
