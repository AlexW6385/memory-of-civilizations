// The life of the quay streets and the canals (docs/settlements/amsterdam.md §5.14): the oil lanterns van der
// Heyden's lamps of 1669 put on the streets, benches against the quay, peat and firewood stacked, barrels and
// sacks before the warehouses and shops, handcarts, neighbours in talk on the stoops, a maid sweeping, an angler
// on his stool at the quay's edge, rowing boats on the canals. Explicit and derived from layout.js; split into
// tiles that are drawn only near the visitor (plan.near).
import { RADIUS, C, RINGS, CANAL_W, QUAY, GROUND, WATER, BRIDGE_ANGLES, DAM, lots, inRect } from './layout.js';
import { faceFrame } from '../../styles/dutch/facade.js';
import { person, rng } from './town.js';

const Y = GROUND + 0.05, CELL = 110;
const OUT = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] };
const faceRot = (nx, nz) => Math.atan2(-nx, -nz);
const inside = (x, z) => Math.hypot(x, z) < RADIUS - 76 && z > C[1] + 27;
const base = (id, elements, c) => ({ id, style: 'life', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [20, -207], facing: 'n' }, center: c, near: 175 });

export function quayLife() {
  const rand = rng(1671), cells = new Map();
  const put = (e) => {
    const at = e.at, k = Math.floor((at[0] + RADIUS) / CELL) + ',' + Math.floor((at[1] + RADIUS) / CELL);
    if (!cells.has(k)) cells.set(k, []); cells.get(k).push(e);
  };
  const P = (k, x, z, rot, ex) => put(person(rand, k, [x, z], rot, ex));
  // the lanterns: one every 24 m along the water's edge of every quay street, clear of the bridges
  for (const R of RINGS) for (const s of [-1, 1]) {
    const r = R + s * (CANAL_W / 2 + QUAY + 0.9);
    for (let a = 0.06 + rand() * 0.02; a < Math.PI - 0.05; a += 24 / r) {
      const x = C[0] + Math.cos(a) * r, z = C[1] + Math.sin(a) * r;
      if (!inside(x, z) || BRIDGE_ANGLES.some((b) => Math.abs(b - a) * R < 9) || inRect(DAM, x, z, 6)) continue;
      put({ t: 'street_lamp', at: [x, z], y: GROUND, h: 4.3 });
    }
  }
  // what stands and happens before the houses
  for (const l of lots()) {
    const [x0, z0, x1, z1] = l.rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    if (!inside(cx, cz) || inRect(DAM, cx, cz, 14)) continue;
    const F = faceFrame(l.rect, l.front), [nx, nz] = OUT[l.front], w = F.w, rr = rand(), ro = faceRot(nx, nz), rs = faceRot(-nx, -nz);
    const at = (u, d) => F.at(u, d), alongRot = Math.atan2(-nz, nx) + Math.PI / 2;
    if (rr < 0.12) put({ t: 'bench', at: at(w * 0.5 + (rand() - 0.5) * 2, 4.3), y: Y, rot: ro, len: 1.7, back: true });
    else if (rr < 0.2) put({ t: 'barrel', at: at(w * (0.2 + rand() * 0.6), 4.1), y: Y, n: 2 + (rand() < 0.4 ? 1 : 0), seed: Math.floor(rand() * 1e6), rot: rand() });
    else if (rr < 0.28) put({ t: 'firewood', at: at(w * (0.25 + rand() * 0.5), 4.0), y: Y, rot: alongRot, len: 1.5, seed: Math.floor(rand() * 1e6) });
    else if (rr < 0.34) put({ t: rand() < 0.5 ? 'sacks' : 'crates', at: at(w * (0.25 + rand() * 0.5), 3.9), y: Y, n: 3 + Math.floor(rand() * 3), seed: Math.floor(rand() * 1e6), rot: rand() });
    else if (rr < 0.39) put({ t: 'handcart', at: at(w * (0.3 + rand() * 0.4), 3.8), y: Y, rot: alongRot, seed: Math.floor(rand() * 1e6) });
    const rp = rand();
    if (rp < 0.14) {                                                             // neighbours in talk by the stoop
      const u = w * (0.2 + rand() * 0.6), d = 2.7, [px, pz] = at(u, d), a = rand() * 6.28;
      for (let q = 0; q < 2; q++) { const dx = Math.cos(a + q * Math.PI) * 0.55, dz = Math.sin(a + q * Math.PI) * 0.55; P(q ? 'wife' : rand() < 0.5 ? 'lady' : 'burgher', px + dx, pz + dz, Math.atan2(-dx, -dz) + Math.PI, { pose: q ? 'stand' : 'talk' }); }
    } else if (rp < 0.22) {                                                      // a maid sweeping her step
      const [px, pz] = at(w * (0.3 + rand() * 0.4), 2.3); P('wife', px, pz, rs + (rand() - 0.5) * 0.6, { carry: 'besom' });
    } else if (rp < 0.27) {                                                      // an angler on his stool at the quay's edge
      const [px, pz] = at(w * (0.3 + rand() * 0.4), 4.75);
      put({ t: 'stool', at: [px, pz], y: Y, rot: ro });
      P('worker', px, pz, ro, { pose: 'sit_low' });
    } else if (rp < 0.31) {                                                      // a child at its play
      const [px, pz] = at(w * (0.2 + rand() * 0.6), 3.2); P('worker', px, pz, rand() * 6.28, { child: true });
    }
  }
  // the Dam: its lanterns, a lute-player with his listeners, a water-carrier, children and a dog
  for (const [x, z] of [[-26, -209.2], [-4, -209.2], [24.5, -209.2], [38.5, -232], [38.5, -214], [-28.5, -250], [-28.5, -228]]) put({ t: 'street_lamp', at: [x, z], y: GROUND, h: 4.3 });
  { const x = -17, z = -225; P('burgher', x, z, 0, { pose: 'lute', hat: 'brim' });
    for (const [dx, dz] of [[-1.3, 1.2], [0, 1.8], [1.4, 1.1], [2.3, 0.2]]) P(rand() < 0.5 ? 'wife' : rand() < 0.5 ? 'worker' : 'lady', x + dx, z + dz, Math.atan2(-(-dx), -(-dz)) + Math.PI, { pose: 'stand' }); }
  P('wife', 29, -236, 1.0, { carry: 'pails' }); P('worker', 4.5, -222, 0.4, { carry: 'sack' });
  for (const [x, z] of [[7, -219], [15, -231], [-8, -214]]) P('worker', x, z, rand() * 6.28, { child: true });
  put({ t: 'animal', kind: 'dog', at: [27, -227], y: Y, rot: 2.1, seed: 78 }); put({ t: 'animal', kind: 'dog', at: [-12, -240], y: Y, rot: 0.3, seed: 79 });
  for (const [x, z] of [[12, -214], [-20, -214.5], [33, -243]]) put({ t: 'handcart', at: [x, z], y: Y, rot: rand() * 3, seed: Math.floor(rand() * 1e6) });
  // rowing boats mid-canal near the centre, a rower in each
  let k = 0;
  for (const R of RINGS.slice(0, 3)) for (const a of [0.55, 1.0, 1.5, 1.95, 2.4]) {
    if (BRIDGE_ANGLES.some((b) => Math.abs(b - a) * R < 14) || (k++ % 2)) continue;
    const x = C[0] + Math.cos(a) * R, z = C[1] + Math.sin(a) * R;
    if (!inside(x, z)) continue;
    put({ t: 'boat', kind: 'rowboat', at: [x, z], y: WATER, rot: -a, len: 5.2, seed: Math.floor(rand() * 1e9) });
    P('worker', x, z, -a, { y: WATER + 0.02, pose: 'row', carry: 'oars' });
  }
  const plans = [];
  for (const [key, E] of cells) { const [i, j] = key.split(',').map(Number); plans.push(base(`amsterdam-quay-${key}`, E, [(i + 0.5) * CELL - RADIUS, (j + 0.5) * CELL - RADIUS])); }
  return plans;
}
