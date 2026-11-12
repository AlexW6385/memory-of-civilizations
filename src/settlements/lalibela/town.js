// The village round the churches (docs/settlements/lalibela.md §5): round stone houses with conical thatch;
// and the people of the churches (§10): pilgrims wrapped in white in the pits, the trenches and on
// the rims looking down, priests among them holding their hand crosses.
import { RADIUS, POOL, PITS, PRECINCT, TERR, cutDepth, houses, compounds, slope, inRect } from './layout.js';
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
  // a procession in Medhane Alem's south court (§14), going west along the church: the processional cross, priests in white
  // under the velvet umbrellas their deacons hold, deacons with sistra behind
  { const zp = M.rect[3] - 8.6, rot = Math.PI / 2, y = yAt(mc[0], zp), hand = (at, k = 1) => { const hx = 0.152 * k, hz = -0.33 * k, c = Math.cos(rot), s = Math.sin(rot); return [at[0] + hx * c + hz * s, at[1] - hx * s + hz * c]; };
    const fig = (at, cl, H = 1.66, hat = 'turban') => L.push({ t: 'figure', at, y, rot, h: H, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: cl, cloth2: 'cloth_ochre', hat, hatMat: 'cloth_white', skin: 'skin_dark', pose: 'talk' });
    const x0 = mc[0] + 12;
    let at = [x0, zp]; fig(at, 'cloth_white'); Z.push({ t: 'proc_cross', at: hand(at), y: y + 1.09 * 1.66 / 1.65, rot });
    for (const [dx, cl, vel, trim] of [[-3.2, 'cloth_white', 'cloth_red', 'cloth_ochre'], [-7.4, 'cloth_ochre', 'cloth_blue', 'cloth_white']]) {
      const pr = [x0 + dx, zp + 0.55], ho = [x0 + dx, zp - 0.45];
      fig(pr, cl, 1.7); fig(ho, 'cloth_white', 1.6); Z.push({ t: 'umbrella', at: hand(ho, 1.6 / 1.65), y: y + 1.09 * 1.6 / 1.65, rot, mat: vel, trim });
      if (dx === -3.2) Z.push({ t: 'hand_cross', at: hand(pr, 1.7 / 1.65), y: y + 1.09 * 1.7 / 1.65, rot });
    }
    for (let k = 0; k < 2; k++) { at = [x0 - 10.2 - k * 1.1, zp + (k ? 0.5 : -0.4)]; fig(at, 'cloth_white', 1.6); Z.push({ t: 'sistrum', at: hand(at, 1.6 / 1.65), y: y + 1.09 * 1.6 / 1.65, rot }); } }
  // inside Bete Giyorgis (§13): pilgrims seated on the mats of the west arm facing the sanctuary's curtain, a priest before it
  { const yf = -G.depth + 0.15 + 1.8 + 0.015;
    for (let k = 0; k < 5; k++) { const p = [gc[0] - 9 + (k % 3) * 2.2 + rand() * 0.4, gc[1] + (k < 3 ? -0.7 : 0.8) + (rand() - 0.5) * 0.2]; L.push({ t: 'figure', at: p, y: yf, rot: -Math.PI / 2 + (rand() - 0.5) * 0.3, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: 'cloth_white', cloth2: 'cloth_white', hat: rand() < 0.7 ? 'veil' : 'none', hatMat: 'cloth_white', skin: 'skin_dark', pose: 'sit_ground' }); }
    priestAt([gc[0] + 5.4, gc[1] + 0.3], yf - 0.015, Math.PI / 2); }
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
  // at the Jordan's pool: women washing white cloth at its kerb, a priest with his cross at the steps, a pilgrim waiting his turn
  { const [px0, pz0, px1, pz1] = POOL;
    for (let k = 0; k < 4; k++) { const p = [px0 + 4 + k * 6.5 + rand(), pz1 + 0.9 + rand() * 0.3]; L.push({ t: 'figure', at: p, y: yAt(...p), rot: 0, seed: Math.floor(rand() * 1e9), dress: 'robe', over: 'shawl', cloth: 'cloth_white', cloth2: 'cloth_ochre', hat: 'veil', hatMat: 'cloth_white', hair: 'bun', skin: 'skin_dark', feet: 'bare', pose: 'squat' }); }
    priestAt([px1 + 2.8, (pz0 + pz1) / 2 + 1.6], yAt(px1 + 2.8, (pz0 + pz1) / 2 + 1.6), Math.PI / 2);
    for (let k = 0; k < 2; k++) pilgrim([px1 + 4.2 + k * 0.9, (pz0 + pz1) / 2 + 2.6 + k * 0.4], -Math.PI / 2, 'sit_ground');
    for (let k = 0; k < 3; k++) { const p = [px0 + 5 + k * 9, pz1 + 0.6]; Z.push({ t: 'cloth_pile', at: p, y: yAt(...p) }); } }
  return [base('lalibela-people', L, 'life'), base('lalibela-crosses', Z)];
}

/** The still life of the compounds: animals in the pens and about the yards, hens, a woman at her work by the kitchen door, a man on the stone seat. */
function village() {
  const rand = rng(2112), out = [[], [], [], []], P = [];
  const fig = (L, at, rot, pose, o = {}) => L.push({ t: 'figure', at, y: slope(...at), rot, seed: Math.floor(rand() * 1e9), dress: 'robe', over: 'shawl', cloth: 'cloth_white', cloth2: rand() < 0.4 ? 'cloth_ochre' : 'cloth_white', hat: 'none', skin: 'skin_dark', feet: 'bare', pose, ...o });
  for (const q of compounds()) {
    const L = out[quad(...q.c)], u = [Math.cos(q.gate), Math.sin(q.gate)], v = [-u[1], u[0]], M = q.main, md = M.door ?? q.gate, mu = [Math.cos(md), Math.sin(md)], mv = [-mu[1], mu[0]];
    const an = (kind, at, o = {}) => L.push({ t: 'animal', kind, at, y: slope(...at), rot: rand() * 6.28, seed: Math.floor(rand() * 1e9), ...o });
    if (q.pen) {
      const n = 3 + Math.floor(rand() * 3), cow = rand() < 0.35;
      for (let k = 0; k < n; k++) { const a = rand() * 6.28, d = rand() * 1.5; an(cow && k < 2 ? 'zebu' : rand() < 0.6 ? 'goat' : 'sheep', [q.pen[0] + Math.cos(a) * d, q.pen[1] + Math.sin(a) * d]); }
    }
    if (rand() < 0.7) L.push({ t: 'chickens', at: [q.c[0] + v[0] * q.R * 0.3, q.c[1] + v[1] * q.R * 0.3], y: slope(q.c[0] + v[0] * q.R * 0.3, q.c[1] + v[1] * q.R * 0.3), rot: rand() * 6.28, seed: Math.floor(rand() * 1e9), n: 3 + Math.floor(rand() * 4), kind: 'hen' });
    if (rand() < 0.3) an('donkey', [q.c[0] + u[0] * q.R * 0.5 + v[0] * q.R * 0.5, q.c[1] + u[1] * q.R * 0.5 + v[1] * q.R * 0.5]);
    if (rand() < 0.3) an('dog', [M.c[0] + mu[0] * (M.r + 1.5) + mv[0] * 2.6, M.c[1] + mu[1] * (M.r + 1.5) + mv[1] * 2.6]);
    if (rand() < 0.45) fig(L, [M.c[0] + mu[0] * (M.r + 1.2) + mv[0] * 0.2, M.c[1] + mu[1] * (M.r + 1.2) + mv[1] * 0.2], Math.atan2(-mu[0], -mu[1]) + 3.14 * 0 + Math.PI, 'squat', { hat: 'veil', hair: 'bun', over: 'shawl' });
    if (rand() < 0.35) fig(L, [M.c[0] + mu[0] * (M.r + 0.55) - mv[0] * 1.9, M.c[1] + mu[1] * (M.r + 0.55) - mv[1] * 1.9], Math.atan2(-mu[0], -mu[1]) + Math.PI, 'sit_low', { hat: rand() < 0.4 ? 'turban' : 'none', hatMat: 'cloth_white', beard: 0.6, hair: 'short', over: 'cape' });
    if (rand() < 0.4) fig(L, [q.c[0] + u[0] * q.R * 0.55 - v[0] * 1.2, q.c[1] + u[1] * q.R * 0.55 - v[1] * 1.2], rand() * 6.28, 'stand', { h: 1.1, over: 'none', hair: 'short', cloth: rand() < 0.5 ? 'cloth_ochre' : 'cloth_white' });
  }
  for (let k = 0; k < 4; k++) P.push(base(`lalibela-hamlet-life-${k}`, out[k], 'life'));
  return P;
}
const quad = (x, z) => (x < 0 ? 0 : 1) + (z < 0 ? 0 : 2);
export async function town() {
  const all = houses(), plans = [], Q = [[], [], [], []], Y = [[], [], [], []];
  for (const h of all) {
    if (h.enter) { Q[quad(...h.c)].push({ t: 'hut', c: h.c, r: h.r, y: slope(h.c[0], h.c[1]), door: h.door, seed: h.seed, kind: h.enter }); continue; }
    Q[quad(...h.c)].push({ t: 'tukul', c: h.c, r: h.r, storeys: h.storeys, seed: h.seed, door: h.door, y: slope(h.c[0], h.c[1]), yard: h.kind === 'lone' && Math.hypot(h.c[0], h.c[1]) < PRECINCT - h.r - 5 });
  }
  for (const q of compounds()) Y[quad(...q.c)].push({ t: 'yard', c: q.c, R: q.R, gate: q.gate, seed: q.seed, stone: q.stone, main: { c: q.main.c, r: q.main.r, door: q.main.door }, granary: q.granary, pen: q.pen });
  for (let k = 0; k < 4; k++) plans.push(base(`lalibela-village-${k}`, Q[k]), base(`lalibela-yards-${k}`, Y[k]));
  // the terraces: each riser's wall in four arcs
  for (let k = 0; k < 4; k++) {
    const E = [];
    for (let n = 0; n < TERR.n; n++) E.push({ t: 'terrace', n, from: -Math.PI + k * Math.PI / 2, to: -Math.PI + (k + 1) * Math.PI / 2 });
    plans.push(base(`lalibela-terraces-${k}`, E));
  }
  return [...plans, ...village(), ...people()];
}
