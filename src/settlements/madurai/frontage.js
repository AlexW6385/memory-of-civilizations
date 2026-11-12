// Madurai about 1650 — the street frontage at eye level (docs/settlements/madurai.md §12): what stands before the
// shops and houses of the rows nearest the temple, by trade — jasmine and garland baskets before the flower sellers,
// brass pots stacked before the vessel shops, sacks of grain, bolts of cloth in baskets, a coconut-seller's heap; the
// water pot by the house door; the kolam of rice flour drawn on the swept ground at the doorsteps at dawn; and the
// festival of Chithirai's pandal arches over the south street: bamboo poles at the street's edges with garlands of
// marigold and strings of mango leaves (toran) swagged between them, over the way from the south gopuram. Pure
// data from layout.js, no randomness outside a seeded generator.
import { WALL, GATES, lots, lotMap, outside } from './layout.js';

const NEAR = 105;                                   // m from the temple wall: the rows with the dressing
const base = (id, elements) => ({ id, style: 'dravidian', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-400, -400, 400, 400], entrance: { at: [-20, 200], facing: 'n' } });

/** The kolam: a cross of white rice-flour lines in a ring of dots, flat on the ground (1.3 m across). */
function kolam(E, [x, z], s = 1) {
  const a = 0.62 * s, w = 0.045 * s, y0 = 0, y1 = 0.02;
  for (const r of [[x - a, z - w, x + a, z + w], [x - w, z - a, x + w, z + a]]) E.push({ t: 'block', rect: r, y0, y1, mat: 'plaster_white', collide: false });
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const c = [x + dx * a * 0.62, z + dz * a * 0.62], d = 0.07 * s; E.push({ t: 'block', rect: [c[0] - d, c[1] - d, c[0] + d, c[1] + d], y0, y1, mat: 'plaster_white', collide: false }); }
  for (const [dx, dz] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) { const c = [x + dx * a * 1.0, z + dz * a * 1.0], d = 0.06 * s; E.push({ t: 'block', rect: [c[0] - d, c[1] - d, c[0] + d, c[1] + d], y0, y1, mat: 'plaster_white', collide: false }); }
}

/** A pandal arch across the street at z: two poles, a garland of marigold beads in a sag between them, mango-leaf toran hanging from it. */
function arch(E, x, z, half, h = 6) {
  for (const sx of [-1, 1]) E.push({ t: 'block', rect: [x + sx * half - 0.09, z - 0.09, x + sx * half + 0.09, z + 0.09], y0: 0, y1: h, mat: 'timber' });
  const N = 22, BEAD = ['cloth_ochre', 'cloth_ochre', 'cloth_red', 'cloth_ochre', 'cloth_white'];
  for (let k = 0; k <= N; k++) {
    const t = k / N, px = x - half + t * 2 * half, sag = 0.95 * Math.sin(Math.PI * t), py = h - 0.15 - sag;
    E.push({ t: 'block', rect: [px - 0.14, z - 0.14, px + 0.14, z + 0.14], y0: py - 0.26, y1: py + 0.04, mat: BEAD[k % BEAD.length], collide: false });
    if (k % 2 === 1 && k > 1 && k < N - 1) E.push({ t: 'block', rect: [px - 0.05, z - 0.02, px + 0.05, z + 0.02], y0: py - 0.95, y1: py - 0.26, mat: 'cloth_green', collide: false });
  }
}

export function frontage() {
  const tiles = new Map(), blocks = [];
  const put = (x, z, e) => { const k = `${Math.floor(x / 100)},${Math.floor(z / 100)}`; if (!tiles.has(k)) tiles.set(k, []); tiles.get(k).push(e); };
  let s = 6150;
  const rand = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (const l of lots()) {
    if (l.kind === 'yard' || l.kind === 'hut' || l.kind === 'court') continue;
    const cx = (l.rect[0] + l.rect[2]) / 2, cz = (l.rect[1] + l.rect[3]) / 2;
    if (outside(cx, cz) > NEAR) continue;
    const { W, map } = lotMap(l), a = map(0, 0), b = map(0, -1), out = Math.atan2(-(b[0] - a[0]), -(b[1] - a[1])), r = rand();
    const sd = () => Math.floor(rand() * 1e9);
    // (in the street, at the foot of the platform: v −0.55; the street's edge verge is clear of walkers' lanes)
    const at = (u, v) => map(W * u, v);
    if (l.kind === 'shop') {
      const [u1, u2] = r < 0.5 ? [0.2, 0.78] : [0.28, 0.82];
      switch (l.trade) {
        case 'flowers': for (const u of [u1, u2]) put(...at(u, -0.55), { t: 'basket', n: 3, at: at(u, -0.55), y: 0, seed: sd(), goods: rand() < 0.7 ? 'cloth_white' : 'cloth_ochre' }); break;
        case 'pooja': put(...at(u1, -0.55), { t: 'pot', kind: 'water_pot', n: 3, at: at(u1, -0.55), y: 0, seed: sd() }); put(...at(u2, -0.55), { t: 'basket', n: 2, at: at(u2, -0.55), y: 0, seed: sd(), goods: 'cloth_red' }); break;
        case 'brass': for (const u of [u1, u2]) put(...at(u, -0.55), { t: 'pot', kind: 'water_pot', n: 4, at: at(u, -0.55), y: 0, seed: sd() }); break;
        case 'grain': for (const u of [u1, u2]) put(...at(u, -0.6), { t: 'sacks', n: 3, at: at(u, -0.6), y: 0, rot: out, seed: sd(), mat: 'sacking' }); break;
        case 'cloth': for (const u of [u1, u2]) put(...at(u, -0.55), { t: 'basket', n: 2, at: at(u, -0.55), y: 0, seed: sd(), goods: ['cloth_red', 'cloth_green', 'cloth_indigo', 'cloth_maroon'][Math.floor(rand() * 4)] }); break;
        case 'sweets': put(...at(u1, -0.6), { t: 'stool', at: at(u1, -0.6), y: 0, rot: out, seed: sd() }); put(...at(u2, -0.55), { t: 'pot', kind: 'dark_pot', n: 2, at: at(u2, -0.55), y: 0, seed: sd() }); break;
        case 'coconut': put(...at(u1, -0.55), { t: 'basket', n: 3, at: at(u1, -0.55), y: 0, seed: sd(), goods: 'cloth_ochre' }); put(...at(u2, -0.6), { t: 'sacks', n: 2, at: at(u2, -0.6), y: 0, rot: out, seed: sd(), mat: 'sacking' }); break;
        default: break;
      }
      if (r < 0.2) kolam(blocks, at(0.5, -1.15), 0.8);
    } else {
      if (r < 0.55) put(...at(0.1, -0.5), { t: 'pot', kind: r < 0.3 ? 'water_pot' : 'matka', n: 1 + (r < 0.15 ? 1 : 0), at: at(0.1, -0.5), y: 0, seed: sd() });
      if (r > 0.45 && r < 0.8) kolam(blocks, at(0.5 + (rand() - 0.5) * 0.3, -1.1), 1);
    }
  }
  // the pandal arches over the south street, between the arrival's stand (z 170) and the gopuram (z 118): the poles at the street's edges
  const arches = [WALL[3] + 18, WALL[3] + 30, WALL[3] + 42];
  for (const z of arches) arch(blocks, GATES.s[0], z, 5.4);
  const plans = [...tiles].map(([k, list]) => { const [i, j] = k.split(',').map(Number); return { ...base(`madurai-frontage-${k}`, list), style: 'life', center: [i * 100 + 50, j * 100 + 50], near: 230 }; });
  plans.push(base('madurai-frontage-ground', blocks));
  return plans;
}
