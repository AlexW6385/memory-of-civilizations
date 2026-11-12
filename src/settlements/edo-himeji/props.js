// Edo Himeji — the small things of the street at eye level (docs/settlements/edo-himeji.md §5.7), built in style `life`
// (instances of shared shapes, in tiles of 100 m that cull by distance): firewood, fire tubs, pots, baskets, benches and
// handcarts before the merchants' fronts, cats on the pent roofs, dogs in the street; at the samurai gates a lantern, a
// fire tub, a horse at the hitching post; at the moat's landings baskets and tubs.
import { lots, furniture, STREET, MIDDLE, LEVEL, RADIUS, HON, NINO } from './layout.js';
import { yashikiParts } from '../../styles/edo/yard.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

export function props() {
  const rand = rng(1648), E = [], pick = (a) => a[Math.floor(rand() * a.length)];
  const H1 = 3.2;
  for (const l of lots()) {
    const [x0, z0, x1, z1] = l.rect;
    if (Math.hypot((x0 + x1) / 2, (z0 + z1) / 2) > RADIUS - 24) continue;
    if (l.t === 'machiya') {
      const s = l.front === 's' ? 1 : -1, fz = s > 0 ? z1 : z0, rot = s > 0 ? 0 : Math.PI, Z = (q) => fz + s * q, W = x1 - x0, sd = Math.floor(rand() * 1e9);
      const r = rand();
      if (r < 0.25) E.push({ t: 'firewood', at: [x1 - 0.9, Z(1.0)], rot: Math.PI / 2, len: 1.25, seed: sd });
      else if (r < 0.45) E.push({ t: 'rain_tub', at: [x0 + 1.0, Z(1.6)], seed: sd });
      else if (r < 0.62) E.push({ t: 'pot', kind: pick(['dark_pot', 'glazed_jar', 'blue_jar']), at: [x0 + 0.9, Z(1.0)], n: 2, seed: sd });
      else if (r < 0.74 && l.trade !== 'tea') E.push({ t: 'bench', at: [x0 + W * 0.5, Z(1.0)], rot: Math.PI / 2 + (s > 0 ? 0 : 0), len: 1.6, seed: sd });
      else if (r < 0.82) E.push({ t: 'handcart', at: [x0 + W * 0.5, Z(2.6)], rot: Math.PI / 2, seed: sd });
      else if (r < 0.9) E.push({ t: 'basket', at: [x1 - 1.1, Z(1.1)], n: 3, seed: sd });
      if (rand() < 0.3) E.push({ t: 'animal', kind: 'cat', at: [x0 + 0.6 + rand() * (W - 1.2), Z(0.5)], y: H1 + 0.05 + 0.2, rot: rand() * 6.28, seed: sd });
      if (rand() < 0.05) E.push({ t: 'animal', kind: 'dog', at: [x0 + W / 2, Z(3.4)], rot: rand() * 6.28, seed: sd });
    } else {
      const P = yashikiParts(l), g = P.g, along = g === 'n' || g === 's', gc = along ? (P.gate[0] + P.gate[2]) / 2 : (P.gate[1] + P.gate[3]) / 2;
      const fq = g === 's' ? z1 : g === 'n' ? z0 : g === 'e' ? x1 : x0, sg = g === 's' || g === 'e' ? 1 : -1;
      const pt = (u, q) => (along ? [u, fq + sg * q] : [fq + sg * q, u]), faceOut = g === 's' ? 0 : g === 'n' ? Math.PI : g === 'e' ? Math.PI / 2 : -Math.PI / 2;
      E.push({ t: 'lantern', kind: 'paper', at: pt(gc - P.gw - 0.9, 0.7), h: 2.2, rot: faceOut, seed: 1 }, { t: 'lantern', kind: 'paper', at: pt(gc + P.gw + 0.9, 0.7), h: 2.2, rot: faceOut, seed: 2 });
      const r = rand();
      if (r < 0.3) E.push({ t: 'rain_tub', at: pt(gc - 3.4, 1.1), seed: l.seed });
      if (r > 0.65) E.push({ t: 'animal', kind: 'horse', at: pt(gc + 3.8, 1.5), rot: faceOut + Math.PI / 2, seed: l.seed });
      if (r > 0.3 && r < 0.45) E.push({ t: 'animal', kind: 'dog', at: pt(gc + 2.6, 2.3), rot: rand() * 6.28, seed: l.seed });
    }
  }
  // the landings on the middle moat: baskets of washed greens, a tub
  for (const f of furniture()) if (f.t === 'landing') {
    E.push({ t: 'basket', at: [f.x - 2.3, f.z0 - 0.7], n: 2, seed: Math.floor(f.x) }, { t: 'rain_tub', at: [f.x + 2.4, f.z0 - 0.8], seed: Math.floor(f.x) + 1 });
  }
  // the Honmaru and Ninomaru as the visitor arrives: a horse at the wall with its groom, fire tubs by the stair and under the pines,
  // a bench in the pines' shade, baskets and a pot by the kura (the castle's own stores stand on the Ninomaru)
  { const h = HON.top, n = NINO.top;
    E.push({ t: 'animal', kind: 'horse', at: [22.5, -12.2], y: h, rot: Math.PI / 2 + 0.3, seed: 77 });
    for (const [x, z] of [[-38.2, -24.2], [-23.8, -24.2]]) E.push({ t: 'rain_tub', at: [x, z], y: h, seed: Math.floor(x) });
    E.push({ t: 'bench', at: [-70.6, -17], y: h, rot: Math.PI / 2, len: 1.6, seed: 5 }, { t: 'rain_tub', at: [-19, -112], y: h, seed: 8 });
    E.push({ t: 'basket', at: [-92, 12.5], y: n, n: 3, seed: 3 }, { t: 'pot', kind: 'blue_jar', at: [-84, 12.5], y: n, n: 2, seed: 4 }, { t: 'firewood', at: [-100.5, 6], y: n, rot: 0, len: 1.4, seed: 9 });
    E.push({ t: 'lantern', kind: 'paper', at: [-38.8, -21.2], y: h, h: 2.2, rot: 0, seed: 11 }, { t: 'lantern', kind: 'paper', at: [-23.2, -21.2], y: h, h: 2.2, rot: 0, seed: 12 }); }
  const tiles = new Map();
  for (const e of E) { const k = Math.floor(e.at[0] / 100) + ',' + Math.floor(e.at[1] / 100); if (!tiles.has(k)) tiles.set(k, []); tiles.get(k).push(e); }
  return [...tiles].map(([k, elements]) => { const [i, j] = k.split(',').map(Number); return { id: `edo-himeji-props-${k}`, style: 'life', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 240], facing: 'n' }, center: [i * 100 + 50, j * 100 + 50], near: 230 }; });
}
void STREET; void MIDDLE; void LEVEL;
