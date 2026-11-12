// The houses of Machu Picchu in their kanchas (docs/settlements/machu-picchu.md §5).
import { laneLevel, STORES, RADIUS, TERRACE, SITE, TOWN_WALL, CONDOR, houses, kanchas, kanchaWalls, outside } from './layout.js';
import { ground } from './ground.js';
import { people } from './people.js';

const base = (id, elements) => ({ id, style: 'inca', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [2, 110], facing: 'n' } });
export async function town() {
  const all = houses(), plans = [];
  for (let i = 0; i < all.length; i += 50) plans.push(base(`machu-picchu-houses-${i / 50}`, all.slice(i, i + 50).map((h) => {
    const [x0, z0, x1, z1] = h.rect, y = Math.min(ground.height(x0, z0), ground.height(x1, z0), ground.height(x0, z1), ground.height(x1, z1));
    // the houses a little different in height, by their seeds
    return { t: 'inca_house', ...h, y, h: 2.45 + (h.seed % 9) * 0.07 };
  })));
  // the strings of maize cobs under the eaves, either side of the door, on about half the houses
  { const items = [];
    for (const h of all) {
      if (h.seed % 2) continue;
      const [x0, z0, x1, z1] = h.rect, f = h.front, out = { e: [1, 0], w: [-1, 0], n: [0, -1], s: [0, 1] }[f], cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, hy = Math.min(ground.height(x0, z0), ground.height(x1, z1));
      const L = f === 'n' || f === 's' ? x1 - x0 : z1 - z0; if (L < 4.2) continue;
      const edge = f === 'e' ? [x1, cz] : f === 'w' ? [x0, cz] : f === 'n' ? [cx, z0] : [cx, z1], t = [-out[1], out[0]], sg = h.seed % 4 === 0 ? 1 : -1;
      items.push({ at: [edge[0] + out[0] * 0.4 + t[0] * 1.35 * sg, edge[1] + out[1] * 0.4 + t[1] * 1.35 * sg], n: out, y: hy + 2.15, len: 1.0 });
    }
    plans.push(base('machu-picchu-cobs', [{ t: 'inca_cobs', items }])); }
  // the patios' things
  plans.push(base('machu-picchu-patios', kanchas().map((K, i) => {
    const r = K.rect, gateE = K.inward[0] < 0, gx = gateE ? r[2] : r[0], gz = r[1] + K.A / 2;
    return { t: 'inca_patio', o: [gx, gz], d: [K.inward[0], 0], A: K.A, D: K.D, sd: K.sd, sv0: K.sv0, sv1: K.sv1, bd: K.bd, weaver: i % 5 !== 0, y: ground.height(gx + K.inward[0] * 4, gz), seed: 500 + i };
  })));
  // the Temple of the Condor's rock and its walls
  { const [cx, cz] = CONDOR.c, c = Math.cos(CONDOR.yaw), s = Math.sin(CONDOR.yaw), y = ground.height(cx, cz), P = (u, w) => [cx + u * c + w * s, cz - u * s + w * c];
    const E = [{ t: 'condor_temple', c: CONDOR.c, yaw: CONDOR.yaw, y }];
    for (const [a, b, h] of [[[-5.6, -2.4], [5.6, -2.4], 2.6], [[-5.6, -2.4], [-5.6, 2.0], 1.9], [[5.6, -2.4], [5.6, 2.0], 1.9]]) E.push({ t: 'stone_block', a: P(...a), b: P(...b), w: 0.38, y0: y - 0.3, y1: y + h });
    plans.push(base('machu-picchu-condor', E)); }
  // the kanchas' walls, battered, of rough stones, each with its gateway
  const walls = kanchaWalls().map(({ a, b, y1, door, w = 0.35 }) => {
    // the wall stands on its platform and holds it up: down past the lane's ground beside it, the stones facing the drop
    const yp = Math.min(ground.height(...a), ground.height(...b)), mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2, dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz) || 1;
    let yl = yp;
    for (const sg of [-1, 1]) for (const t of [0, 1]) yl = Math.min(yl, ground.height(a[0] + dx * t * 0.5 + dx * 0.25 - (dz / L) * 1.3 * sg, a[1] + dz * t * 0.5 + dz * 0.25 + (dx / L) * 1.3 * sg));
    const y0 = Math.min(yp, yl) - 0.3;
    return { t: 'stone_block', a, b, w, y0, y1: yp + y1, door: door && { ...door, h: door.h + (yp - 0.3 - y0) } };
  });
  // the people and their animals (style 'life'), their tools and looms (style 'inca')
  const P = people();
  plans.push({ ...base('machu-picchu-people', P.figures), style: 'life', center: [0, 0], near: 420 });
  plans.push(base('machu-picchu-gear', P.gear));
  // the cloud forest's tree ferns and bromeliads on the slopes below the terraces and round the peaks (§7.1)
  { const r = ((s) => () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296))(9031), P = [];
    for (let k = 0; k < 2600 && P.length < 700; k++) {
      const x = (r() * 2 - 1) * (RADIUS - 20), z = (r() * 2 - 1) * (RADIUS - 20), d = outside(x, z);
      if (Math.hypot(x, z) > RADIUS - 20 || d < TERRACE.w * TERRACE.n + 1.5 || d > TERRACE.w * TERRACE.n + 70) continue;
      const fern = r() < 0.45;
      P.push([fern ? 'fern' : 'bromeliad', x, z, ground.height(x, z) - (fern ? 0.1 : 0.03), fern ? 0.8 + r() * 0.5 : 0.8 + r() * 0.8, r() * 6.28, Math.floor(r() * 3)]);
    }
    plans.push(base('machu-picchu-cloud-forest', [{ t: 'inca_plants', plants: P }])); }
  // the storehouses' goods, the Main Temple's offerings, a feast on the plaza
  { const E = STORES.map((r, i) => ({ t: 'inca_goods', rect: r, y: 0, front: 'n', seed: 300 + i }));
    E.push({ t: 'inca_offerings', at: [-42, -55.1], y: 0.6 + 0.95, yaw: 0, w: 4.2, seed: 8 });
    E.push({ t: 'inca_feast', c: [4, -24], y: ground.height(4, -24), seed: 12 });
    plans.push(base('machu-picchu-goods', E)); }
  // the flagged road in from the gate to the plaza and the paved gates of the kanchas
  { const E = [{ t: 'lane', rect: [0.4, 8.5, 3.6, TOWN_WALL.z - 0.4], y: 0.025, mat: 'granite_rough' }, { t: 'lane', rect: [0.4, 93.4, 3.6, 120], y: 0.025, mat: 'granite_rough' }];
    for (const K of kanchas()) {
      const r = K.rect, gateE = K.inward[0] < 0, gx = gateE ? r[2] : r[0], gz = (r[1] + r[3]) / 2, ox = gateE ? 1 : -1, lane = gateE ? [r[2] + 0.25, r[1] + 1, r[2] + 1.75, r[3] - 1] : [r[0] - 1.75, r[1] + 1, r[0] - 0.25, r[3] - 1];
      const yl = laneLevel(gx + ox * 2.4, gz), up = K.lv - yl;
      // the stair from the lane up to the gate's sill (the platform stands RAISE and the bands' fall above the lane), 1.3 m wide, the lane's flagstones beside it
      if (up > 0.1) E.push({ t: 'stairs', rect: gateE ? [gx + 0.05, gz - 0.65, gx + 2.3, gz + 0.65] : [gx - 2.3, gz - 0.65, gx - 0.05, gz + 0.65], y0: yl, y1: K.lv, dir: gateE ? 'w' : 'e', mat: 'granite_rough' });
      const ok = [[lane[0], lane[1]], [lane[2], lane[1]], [lane[0], lane[3]], [lane[2], lane[3]], [(lane[0] + lane[2]) / 2, (lane[1] + lane[3]) / 2]].every(([x, z]) => !all.some((h) => x > h.rect[0] - 0.3 && x < h.rect[2] + 0.3 && z > h.rect[1] - 0.3 && z < h.rect[3] + 0.3) && outside(x, z) < -2 && Math.abs(ground.height(x, z) - yl) < 0.08);
      if (ok && up <= 0.1) E.push({ t: 'lane', rect: lane, y: yl + 0.025, mat: 'granite_rough' });
    }
    plans.push(base('machu-picchu-lanes', E)); }
  for (let i = 0; i < walls.length; i += 120) plans.push(base(`machu-picchu-kancha-walls-${i / 120}`, walls.slice(i, i + 120)));
  return plans;
}
