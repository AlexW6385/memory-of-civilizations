// The village round the churches (docs/settlements/lalibela.md §5): round stone houses with conical thatch;
// and the people of the churches (§10): pilgrims wrapped in white in the pits, the trenches and on
// the rims looking down, priests among them holding their hand crosses.
import { RADIUS, PITS, cutDepth, houses, slope, inRect } from './layout.js';
const base = (id, elements, style = 'zagwe') => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-240, 100], facing: 's' } });
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

function people() {
  const rand = rng(1221), L = [], Z = [];
  const yAt = (x, z) => { const d = cutDepth(x, z), pit = Object.values(PITS).some((p) => inRect(p.rect, x, z, -3)); return -d + (pit ? 0.15 : 0); };
  const face = (from, to) => Math.atan2(-(to[0] - from[0]), -(to[1] - from[1]));       // a figure faces −z when rot = 0
  const pilgrim = (at, rot, pose = 'stand') => L.push({ t: 'figure', at, y: yAt(...at), rot, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: 'cloth_white', cloth2: 'cloth_white', hat: rand() < 0.75 ? 'veil' : 'none', hatMat: 'cloth_white', skin: 'skin_dark', pose });
  const priest = (at, rot) => {
    const H = 1.68, k = H / 1.65, y = yAt(...at);
    L.push({ t: 'figure', at, y, rot, h: H, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: rand() < 0.5 ? 'cloth_white' : 'cloth_ochre', cloth2: 'cloth_ochre', hat: 'turban', hatMat: 'cloth_white', skin: 'skin_dark', pose: 'talk' });
    // the cross in the raised right hand (the figure's 'talk' hand, turned and placed as the figure is)
    const hx = 0.152 * k, hz = -0.33 * k, c = Math.cos(rot), s = Math.sin(rot);
    Z.push({ t: 'hand_cross', at: [at[0] + hx * c + hz * s, at[1] - hx * s + hz * c], y: y + 1.09 * k, rot });
  };
  // Bete Giyorgis: pilgrims in the pit's four re-entrant corners round the cross, a priest at the west door
  const G = PITS.giyorgis, gc = [(G.rect[0] + G.rect[2]) / 2, (G.rect[1] + G.rect[3]) / 2];
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const c = [gc[0] + sx * 9, gc[1] + sz * 9];
    for (let k = 0; k < 3; k++) { const p = [c[0] + (rand() - 0.5) * 3, c[1] + (rand() - 0.5) * 3]; pilgrim(p, face(p, gc) + (rand() - 0.5) * 0.6, k === 2 ? 'sit' : 'stand'); }
  }
  priest([gc[0] - 9.2, gc[1] - 6.5], face([gc[0] - 9.2, gc[1] - 6.5], [gc[0] - 11, gc[1] + 2]));
  // on the rim to the north, pilgrims sitting and looking down into the pit
  for (let k = 0; k < 6; k++) { const p = [G.rect[0] + 4 + k * 4.5 + rand(), G.rect[1] - 1.2]; pilgrim(p, face(p, [p[0], p[1] + 5]), rand() < 0.6 ? 'sit' : 'stand'); }
  // in the trench leading down, a file of pilgrims going in
  for (let k = 0; k < 5; k++) { const p = [-255 + k * 7 + rand() * 2, 128 + (rand() - 0.5) * 1.5]; pilgrim(p, face(p, [p[0] + 5, p[1]])); }
  // Bete Medhane Alem: pilgrims in the court along its south side and at the trench from the north, two priests
  const M = PITS.medhane, mc = [(M.rect[0] + M.rect[2]) / 2, (M.rect[1] + M.rect[3]) / 2];
  for (let k = 0; k < 9; k++) { const p = [M.rect[0] + 5 + k * 4.6 + rand(), M.rect[3] - 5.2 + rand() * 1.5]; pilgrim(p, face(p, mc) + (rand() - 0.5) * 0.5, k % 4 === 1 ? 'sit' : 'stand'); }
  for (let k = 0; k < 4; k++) { const p = [8 + rand() * 4, -140 + k * 6]; pilgrim(p, face(p, [p[0], p[1] + 5])); }
  priest([mc[0] - 4, M.rect[3] - 6.2], face([mc[0] - 4, M.rect[3] - 6.2], [mc[0] - 4, M.rect[3] - 2]));
  priest([M.rect[0] + 4.2, mc[1] + 2], face([M.rect[0] + 4.2, mc[1] + 2], mc));
  return [base('lalibela-people', L, 'life'), base('lalibela-crosses', Z)];
}

export async function town() {
  const all = houses(), plans = [];
  for (let i = 0; i < all.length; i += 140) plans.push(base(`lalibela-village-${i / 140}`, all.slice(i, i + 140).map((h) => ({ t: 'tukul', ...h, y: slope(h.c[0], h.c[1]) }))));
  return [...plans, ...people()];
}
