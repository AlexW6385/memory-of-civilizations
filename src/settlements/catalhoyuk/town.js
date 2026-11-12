// Çatalhöyük — the town's life (docs/settlements/catalhoyuk.md §5, §7, §8): people on the roofs (the roofscape is the street) and
// in the courts, a woman grinding in the storeroom of the opened house, another sitting on the platform, sheep, goats and cattle
// in the pens, dogs, the people of the middens. Dress after [inferred] §7: wraps and skirts of hide and woven fibre, leopard-skin
// cloaks for a few, no hats, bare feet, hair loose, ochre on the skin.
import { CW, CD, X0, Z0, KIND, TOP, LANDMARK, PENS, ST, ENTER, TRADE, MARSH, colX, rowZ } from './layout.js';
import { landings } from './plan.js';
import { cellGeom } from '../../styles/catal/cell.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const plan = (id, style, elements) => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-130, -130, 130, 130], entrance: { at: [0, 30], facing: 'n' } });

const z1c = (i) => rowZ(i) + CD[i];

const face0 = (dx, dz) => Math.atan2(dx, dz);
export async function town() {
  const rand = rng(6500), P = [], E = [];
  const skin = () => (rand() < 0.75 ? 'skin_medium' : 'skin_dark');
  const woman = (at, y, rot, o = {}) => P.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: 'wrap', cloth: ['hide_tan', 'hide_brown', 'cloth_white', 'hide_grey', 'cloth_ochre'][Math.floor(rand() * 5)], cloth2: 'cloth_ochre', over: 'none', top: rand() < 0.4 ? 'bare' : undefined, skin: skin(), hat: 'none', feet: 'bare', hair: 'long', beard: false, ...o });
  const man = (at, y, rot, o = {}) => { const leo = rand() < 0.2; P.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: 'loincloth', cloth: leo ? 'hide_tan' : 'hide_brown', cloth2: leo ? 'hide_brown' : 'hide_tan', over: leo ? 'cloak' : 'none', skin: skin(), hat: 'none', feet: 'bare', hair: 'long', beard: rand() < 0.4, ...o }); };
  // the opened house: a woman grinding at the quern in the storeroom, one sitting on the east platform, a child by the hearth
  const [lx0, lz0] = LANDMARK.rect, T = 0.45, ix0 = lx0 + T, iz0 = lz0 + T, mx1 = ix0 + 4.9, sx0 = mx1 + 0.4, bx = lx0 + 8.4 - T - 1.05;
  woman([bx + 0.35, iz0 + 4.88], 0.05, Math.PI, { pose: 'kneel', over: 'none' });
  woman([ix0 + 4.1, iz0 + 2.6], 0.45, -Math.PI / 2, { pose: 'sit_ground', over: 'none' });
  woman([ix0 + 1.1, iz0 + 3.55], 0.05, 0, { pose: 'sit_ground', child: true, h: 0.6, over: 'none' });
  // on the roofs: a figure at a corner of a house, sitting or standing; now and then two talking
  for (let i = 0; i < KIND.length; i++) for (let j = 0; j < KIND[0].length; j++) {
    const k = KIND[i][j], x0 = colX(j), z0 = rowZ(i);
    if (k === 'h' && rand() < 0.5) {
      const y = TOP[i][j] + 0.09, at = [x0 + 0.8 + rand() * 0.4, z0 + CD[i] - 0.9 - rand() * 0.5], rot = rand() * 6.28;
      const r = rand();
      if (r < 0.3) woman(at, y, rot, { pose: 'sit_ground' });
      else if (r < 0.5) woman(at, y, rot, { carry: 'basket' });
      else if (r < 0.62) { woman(at, y, rot, { child: true, h: 1.1 }); }
      else if (r < 0.85) man(at, y, rot, rand() < 0.5 ? { pose: 'talk' } : {});
      else man(at, y, rot, { pose: 'squat' });
    } else if (k === 'c') {
      const cx = x0 + CW[j] / 2, cz = z0 + CD[i] / 2, tr = TRADE[i][j];
      if (tr === 0) {
        woman([cx - 1.0, cz + 0.5], 0, Math.PI, { pose: 'kneel', over: 'none' });                 // at the oven
        woman([cx + 0.3, cz + 1.9], 0, 0, { pose: 'kneel', over: 'none' });                          // at the grinding stone
      } else if (tr === 1) {
        woman([cx, cz + 0.5], 0, Math.PI, { pose: 'kneel', over: 'none' });                          // at the pots drying on the bench
        man([x0 + 1.9, z0 + 1.9], 0, 2.4, { pose: 'squat' });                                       // at the clay
      } else if (tr === 2) {
        man([cx - 0.9, cz + 0.8], 0, Math.PI, { pose: 'squat' });                                   // knapping at the anvil stone
        man([cx + 1.2, cz + 1.5], 0, Math.PI * 1.3, { pose: 'sit_ground' });
      } else if (tr === 3) {
        woman([cx, cz - 0.4], 0, Math.PI, {});                                       // scraping the hide on the frame
        woman([x0 + 1.2, z0 + 2.3], 0, 1.0, { pose: 'kneel', over: 'none' });
      } else {
        woman([cx - 0.2, cz + 0.9], 0, Math.PI, { pose: 'sit_ground', over: 'none' });                // plaiting a mat
        woman([cx + 1.2, cz + 1.0], 0, Math.PI * 0.8, { pose: 'sit_ground', over: 'none' });
      }
      if (rand() < 0.7) woman([cx + 1.5, cz - 1.8], 0, rand() * 6, { child: true, h: 0.9 });
      if (rand() < 0.5) E.push({ t: 'animal', kind: 'dog', at: [x0 + 1.0, z1c(i) - 0.9], y: 0, rot: rand() * 6, seed: i * 9 + j });
    } else if (k === 'm' && rand() < 0.6) {
      man([x0 + 1.0, z0 + 1.2], 0, rand() * 6, { carry: 'basket' });
    }
  }
  // the houses one can go down into: who is at home, by the house's trade
  for (const e of ENTER) {
    const G = cellGeom([colX(e.j), rowZ(e.i), colX(e.j) + CW[e.j], rowZ(e.i) + CD[e.i]], e.mirror), { lx, lz, W, D, S } = G, F = 0.05, face = (dx, dz) => Math.atan2(dx, dz);
    const [hx, hz] = G.hearth, [ox, oz] = G.oven;
    woman([hx + S * 0.2, hz - 0.65], F, face(0, 1), { pose: 'kneel', over: 'none' });                  // at the hearth
    if (rand() < 0.7) woman([lx(W - 0.7), lz(0.75)], 0.45 + F, face(-S, 0), { pose: 'sit_ground', over: 'none', ...(rand() < 0.5 ? { child: true, h: 0.6 } : {}) });   // on the north platform's end
    if (e.variant === 3) man([lx(1.6), lz(2.3) + 0.8], F, face(-S * 0.2, -1), { pose: 'squat' });       // at the knapper's anvil
    else if (e.variant === 4) woman([lx(W * 0.5 + 0.4), lz(D - 0.95)], F, face(0, 1), { pose: 'kneel', over: 'none' });   // at the quern
    else if (rand() < 0.6) woman([ox + S * 0.9, oz - 0.7], F, face(-S * 0.6, 0.6), { pose: 'kneel', over: 'none' });          // at the oven's mouth
  }
  // the marsh landings: a man poling a raft, a woman in the shallows with a basket, a child at the net, ducks on the water
  for (const L of landings) {
    const [x, z] = L.at, dx = Math.cos(L.toward), dz = Math.sin(L.toward), P = (s, t) => [x + dx * s - dz * t, z + dz * s + dx * t], W = MARSH.water;
    man(P(4.5, 1.8), W + 0.22, face0(dx, dz), { carry: 'pole' });
    woman(P(2.0, -1.0), W - 0.12, face0(dx, dz) + 0.6, { carry: 'basket' });
    woman(P(-3.0, 0.7), L.y, face0(-dz, dx), { child: true, h: 0.9 });
    man(P(-2.0, -1.8), L.y, face0(dx, dz) - 1, { pose: 'squat' });
    E.push({ t: 'chickens', kind: 'duck', n: 5, at: P(9, -3), y: W - 0.02, seed: 7 + Math.floor(x) });
  }
  // outside the town: people coming back from the marsh with reed bundles, a man leading sheep
  for (let q = 0; q < 6; q++) {
    const a = rand() * 6.28, r = 40 + rand() * 25, at = [Math.cos(a) * r, Math.sin(a) * r * 0.9 + 6];
    if (Math.abs(at[0]) < 36 && Math.abs(at[1] + 8) < 30) continue;
    (rand() < 0.5 ? woman : man)(at, 0, rand() * 6.28, { carry: rand() < 0.5 ? 'pole' : 'basket' });
  }
  // the pens: sheep and goats in one, cattle (the great aurochs' kin, dark and long-horned) in the other
  PENS.forEach((p, n) => {
    const [x0, z0, x1, z1] = p.rect;
    for (let q = 0; q < (n ? 5 : 9); q++) {
      const at = [x0 + 2 + rand() * (x1 - x0 - 4), z0 + 2 + rand() * (z1 - z0 - 4)];
      E.push({ t: 'animal', kind: n ? 'ox' : rand() < 0.5 ? 'sheep' : 'goat', at, y: 0.02, rot: rand() * 6.28, seed: q * 11 + n, mat: n ? 'hide_black' : undefined });
    }
    woman([p.gate === 'w' ? x0 - 1.5 : x1 + 1.5, (z0 + z1) / 2 + 1.2], 0, p.gate === 'w' ? Math.PI / 2 : -Math.PI / 2, {});
  });
  for (let q = 0; q < 6; q++) {
    const a = rand() * 6.28, r = 38 + rand() * 12;
    E.push({ t: 'animal', kind: 'dog', at: [Math.cos(a) * r * 1.1, Math.sin(a) * r * 0.8 + 4], y: 0, rot: rand() * 6.28, seed: q + 3 });
  }
  void ST; void X0; void Z0;
  return [plan('catalhoyuk-people', 'life', [...P, ...E])];
}
