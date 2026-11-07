// The village round the churches (docs/settlements/lalibela.md §5): round stone houses with conical thatch;
// and the people of the churches (§10): pilgrims wrapped in white in the pits, the trenches and on
// the rims looking down, priests among them holding their hand crosses.
import { RADIUS, PITS, PRECINCT, cutDepth, houses, slope, inRect } from './layout.js';
const base = (id, elements, style = 'zagwe') => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-240, 100], facing: 's' } });
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

function people() {
  const rand = rng(1221), L = [], Z = [];
  const yAt = (x, z) => { const d = cutDepth(x, z), pit = Object.values(PITS).some((p) => inRect(p.rect, x, z, -3)); return -d + (pit ? 0.15 : 0); };
  const face = (from, to) => Math.atan2(-(to[0] - from[0]), -(to[1] - from[1]));       // a figure faces −z when rot = 0
  const pilgrim = (at, rot, pose = 'stand') => L.push({ t: 'figure', at, y: yAt(...at), rot, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: 'cloth_white', cloth2: 'cloth_white', hat: rand() < 0.75 ? 'veil' : 'none', hatMat: 'cloth_white', skin: 'skin_dark', pose });
  const priestAt = (at, y, rot) => {
    const H = 1.68, k = H / 1.65;
    L.push({ t: 'figure', at, y, rot, h: H, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: rand() < 0.5 ? 'cloth_white' : 'cloth_ochre', cloth2: 'cloth_ochre', hat: 'turban', hatMat: 'cloth_white', skin: 'skin_dark', pose: 'talk' });
    // the cross in the raised right hand (the figure's 'talk' hand, turned and placed as the figure is)
    const hx = 0.152 * k, hz = -0.33 * k, c = Math.cos(rot), s = Math.sin(rot);
    Z.push({ t: 'hand_cross', at: [at[0] + hx * c + hz * s, at[1] - hx * s + hz * c], y: y + 1.09 * k, rot });
  };
  const priest = (at, rot) => priestAt(at, yAt(...at), rot);
  // Bete Giyorgis: pilgrims in the pit's four re-entrant corners round the cross, a priest at the west door
  const G = PITS.giyorgis, gc = [(G.rect[0] + G.rect[2]) / 2, (G.rect[1] + G.rect[3]) / 2];
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const c = [gc[0] + sx * 9, gc[1] + sz * 9];
    for (let k = 0; k < 3; k++) { const p = [c[0] + (rand() - 0.5) * 3, c[1] + (rand() - 0.5) * 3]; pilgrim(p, face(p, gc) + (rand() - 0.5) * 0.6, k === 2 ? 'sit_ground' : 'stand'); }
  }
  priest([gc[0] - 9.2, gc[1] - 6.5], face([gc[0] - 9.2, gc[1] - 6.5], [gc[0] - 11, gc[1] + 2]));
  // on the rim to the north, pilgrims sitting and looking down into the pit
  for (let k = 0; k < 6; k++) { const p = [G.rect[0] + 4 + k * 4.5 + rand(), G.rect[1] - 2.8]; pilgrim(p, face(p, [p[0], p[1] + 5]), rand() < 0.6 ? 'sit_ground' : 'stand'); }
  // in the trench leading down, a file of pilgrims going in
  for (let k = 0; k < 5; k++) { const p = [-255 + k * 7 + rand() * 2, 128 + (rand() - 0.5) * 1.5]; pilgrim(p, face(p, [p[0] + 5, p[1]])); }
  // Bete Medhane Alem: pilgrims in the court along its south side and at the trench from the north, two priests
  const M = PITS.medhane, mc = [(M.rect[0] + M.rect[2]) / 2, (M.rect[1] + M.rect[3]) / 2];
  for (let k = 0; k < 9; k++) { const p = [M.rect[0] + 5 + k * 4.6 + rand(), M.rect[3] - 5.2 + rand() * 1.5]; pilgrim(p, face(p, mc) + (rand() - 0.5) * 0.5, k % 4 === 1 ? 'sit_ground' : 'stand'); }
  for (let k = 0; k < 4; k++) { const p = [8 + rand() * 4, -140 + k * 6]; pilgrim(p, face(p, [p[0], p[1] + 5])); }
  priest([mc[0] - 4, M.rect[3] - 6.2], face([mc[0] - 4, M.rect[3] - 6.2], [mc[0] - 4, M.rect[3] - 2]));
  priest([M.rect[0] + 4.2, mc[1] + 2], face([M.rect[0] + 4.2, mc[1] + 2], mc));
  // inside Bete Medhane Alem (§11): mats down the nave, the sanctuary's curtain across its east end,
  // pilgrims seated on the mats facing it, a priest before it with his cross, drums laid by a pillar
  { const yf = -M.depth + 0.95, cx = mc[0], cz = mc[1];
    for (const [a, b] of [[-11.6, -6.5], [-6.0, -0.9], [-0.4, 4.7]]) Z.push({ t: 'floor_mat', rect: [cx + a, cz - 1.3, cx + b, cz + 1.3], y: yf });
    Z.push({ t: 'curtain', a: [cx + 10.66, cz - 1.55], b: [cx + 10.66, cz + 1.55], y: yf, h: 3.6, mat: 'cloth_red' });
    for (let k = 0; k < 10; k++) { const p = [cx - 10 + (k % 5) * 3 + rand() * 0.6, cz + (k < 5 ? -0.6 : 0.6) + (rand() - 0.5) * 0.3]; L.push({ t: 'figure', at: p, y: yf + 0.015, rot: -Math.PI / 2 + (rand() - 0.5) * 0.3, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: 'cloth_white', cloth2: 'cloth_white', hat: rand() < 0.7 ? 'veil' : 'none', hatMat: 'cloth_white', skin: 'skin_dark', pose: 'sit_ground' }); }
    priestAt([cx + 9.6, cz + 0.3], yf, Math.PI / 2);
    Z.push({ t: 'kebero', at: [cx + 8.4, cz - 4.2], y: yf, rot: 0.3 }, { t: 'kebero', at: [cx + 8.5, cz - 3.2], y: yf, rot: -0.2 }); }
  // in Bete Maryam's north court: deacons in a row before the church shaking their sistra, one with
  // the kebero slung before him, a priest leading them
  { const P2 = PITS.maryam, y = -P2.depth + 0.15, zr = P2.rect[1] + 4.6;
    for (let k = 0; k < 6; k++) {
      const at = [73.2 + k * 1.05, zr + (rand() - 0.5) * 0.2], rot = Math.PI + (rand() - 0.5) * 0.2, H = 1.62 + rand() * 0.08, kk = H / 1.65, c = Math.cos(rot), s = Math.sin(rot);
      const drum = k === 2;
      L.push({ t: 'figure', at, y, rot, h: H, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: 'cloth_white', cloth2: k % 2 ? 'cloth_ochre' : 'cloth_white', hat: 'turban', hatMat: 'cloth_white', skin: 'skin_dark', pose: drum ? 'stand' : 'talk', arms: drum ? 'row' : undefined });
      if (drum) Z.push({ t: 'kebero', at, y: y + (kk - 1) * 0.9, rot, held: true });
      else { const hx = 0.152 * kk, hz = -0.33 * kk; Z.push({ t: 'sistrum', at: [at[0] + hx * c + hz * s, at[1] - hx * s + hz * c], y: y + 1.09 * kk, rot }); }
    }
    priestAt([71.6, zr + 0.4], y, Math.PI - 0.5); }
  return [base('lalibela-people', L, 'life'), base('lalibela-crosses', Z)];
}

export async function town() {
  const all = houses(), plans = [];
  for (let i = 0; i < all.length; i += 140) plans.push(base(`lalibela-village-${i / 140}`, all.slice(i, i + 140).map((h) => ({ t: 'tukul', ...h, y: slope(h.c[0], h.c[1]), yard: Math.hypot(h.c[0], h.c[1]) < PRECINCT - h.r - 5 }))));
  return [...plans, ...people()];
}
