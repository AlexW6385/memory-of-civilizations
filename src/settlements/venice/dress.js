// Venice about 1500 — the dressing of the town at eye level (docs/settlements/venice.md §5b): the fronts of the houses in the streets and
// calli (signs, lanterns, washing out of the windows, pots at the doors, benches, crates and barrels, firewood, ladders), the piazza's
// life (the booths of the cloth and spice merchants under the Procuratie, the banner masts before San Marco, groups of people, pigeons),
// the boats tied along the fondamente with their cargo. Pure data, derived from layout.js; the builders are the shared `life` style's.

import { GROUND, SEA, RADIUS, PIAZZA, PIAZZETTA, BASILICA, CLOCK, MERCERIA, BASIN_Z, RIALTO, lots, inLot, inRect, wet, rivePieces, wells, bands } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
const plan = (id, elements, center, near, bounds = [-RADIUS, -RADIUS, RADIUS, RADIUS]) => ({ id, style: 'life', origin: [0, 0], base: 0, yaw: 0, feature: true, entrance: { at: [0, 0], facing: 'n' }, bounds, rooms: [], elements, center, near });
const pick = (r, a) => a[Math.floor(r() * a.length)];
const CLOTH = ['cloth_black', 'cloth_brown', 'cloth_red', 'cloth_indigo', 'cloth_white', 'cloth_green', 'cloth_ochre'];
const person = (r, at, rot, o = {}) => ({ t: 'figure', at, rot, y: GROUND, seed: Math.floor(r() * 1e9), dress: 'robe', legs: 'hose', cloth: pick(r, CLOTH), cloth2: pick(r, ['cloth_black', 'cloth_brown', 'cloth_red', 'cloth_white']),
  skin: 'skin_light', hat: pick(r, ['cap', 'cap', 'none', 'veil']), over: pick(r, ['cape', 'none', 'sash']), pose: 'stand', ...o });

// ── the fronts ────────────────────────────────────────────────────────────────
const SIDES = [
  { n: [1, 0], rot: Math.PI / 2, wall: (l) => l.rect[2], span: (l) => [l.rect[1], l.rect[3]], at: (w, s) => [w + 0.02, s], t: [0, 1] },
  { n: [-1, 0], rot: -Math.PI / 2, wall: (l) => l.rect[0], span: (l) => [l.rect[1], l.rect[3]], at: (w, s) => [w - 0.02, s], t: [0, 1] },
  { n: [0, 1], rot: 0, wall: (l) => l.rect[3], span: (l) => [l.rect[0], l.rect[2]], at: (w, s) => [s, w + 0.02], t: [1, 0] },
  { n: [0, -1], rot: Math.PI, wall: (l) => l.rect[1], span: (l) => [l.rect[0], l.rect[2]], at: (w, s) => [s, w - 0.02], t: [1, 0] },
];
/** How deep the open ground in front of a wall is at the points s0 … s1 (0.6, 1.7, 3.2 or more). */
function clearance(sd, w, s0, s1) {
  let best = 3.2;
  for (const s of [s0, (s0 + s1) / 2, s1]) for (const d of [0.7, 1.7, 3.2]) {
    const x = sd.n[0] ? w + sd.n[0] * d : s, z = sd.n[0] ? s : w + sd.n[1] * d;
    if (inLot(x, z, 0.15) || wet(x, z) < 1.2 || Math.hypot(x, z) > RADIUS - 72) { best = Math.min(best, d === 0.7 ? 0.3 : d === 1.7 ? 0.7 : 1.7); break; }
  }
  return best;
}
function frontsOf(l) {
  const r = rng(l.seed + 77), E = [], front = l.front;
  for (const sd of SIDES) {
    const w = sd.wall(l), [s0, s1] = sd.span(l), len = s1 - s0, c = clearance(sd, w, s0 + 1, s1 - 1);
    if (c < 0.6) continue;
    const isFront = (front === 'n' && sd.n[1] === -1) || (front === 's' && sd.n[1] === 1);
    const P = (u, d = 0) => { const a = sd.at(w, s0 + u); return [a[0] + sd.n[0] * d, a[1] + sd.n[1] * d]; };
    const rot = sd.rot;
    if (c >= 1.7 && r() < (isFront ? 0.5 : 0.65)) E.push({ t: 'shop_sign', board: true, at: P(len * (0.12 + 0.2 * r())), y: GROUND + 0.2, rot, h: 3.0 + r() * 0.5, seed: Math.floor(r() * 1e6) });
    if (c >= 1.7 && r() < 0.4) E.push({ t: 'laundry_pole', at: P(len * (0.25 + 0.5 * r())), y: GROUND + 4.35, rot, seed: Math.floor(r() * 1e6) });
    if (r() < 0.3) E.push({ t: 'lantern', kind: 'iron', at: P(len * (0.8 + 0.12 * r()), 0.06), y: GROUND, rot: rot + Math.PI, h: 2.6, });
    if (isFront) for (const k of [-1, 1]) if (r() < 0.8) E.push({ t: 'pot', kind: pick(r, ['water_pot', 'dark_pot', 'glazed_jar', 'blue_jar']), at: P(len / 2 + k * 1.0, 0.35), y: GROUND, rot: r() * 6, n: 1 + Math.floor(r() * 2), seed: Math.floor(r() * 1e6) });
    else if (r() < 0.5) E.push({ t: 'pot', kind: pick(r, ['water_pot', 'dark_pot', 'glazed_jar']), at: P(len * (0.15 + 0.7 * r()), 0.35), y: GROUND, rot: r() * 6, n: 2, seed: Math.floor(r() * 1e6) });
    if (c >= 1.7 && r() < 0.28) E.push({ t: 'bench', at: P(len * (0.65 + 0.2 * r()), 0.28), y: GROUND, rot, len: 1.7, back: r() < 0.5 });
    if (c >= 1.7 && r() < 0.42) {
      const u = len * (0.1 + 0.15 * r()), kind = pick(r, ['crates', 'barrel', 'sacks', 'basket', 'firewood']);
      E.push({ t: kind, at: P(u, 0.55), y: GROUND, rot: r() * 6, seed: Math.floor(r() * 1e6), ...(kind === 'sacks' ? { n: 3 } : {}) });
      if (r() < 0.5) E.push({ t: pick(r, ['barrel', 'crates']), at: P(u + 0.9, 0.5), y: GROUND, rot: r() * 6, seed: Math.floor(r() * 1e6) });
    }
    if (c >= 3.2 && r() < 0.14) E.push({ t: 'ladder', at: P(len * (0.4 + 0.2 * r()), 0.2), y: GROUND, rot, seed: Math.floor(r() * 1e6) });
    if (c >= 3.2 && r() < 0.1) E.push({ t: 'handcart', at: P(len * (0.5 + 0.3 * r()), 1.3), y: GROUND, rot: rot + Math.PI / 2, seed: Math.floor(r() * 1e6) });
    if (c >= 3.2 && r() < 0.09) E.push({ t: 'rain_tub', at: P(len * (0.3 + 0.4 * r()), 0.7), y: GROUND, rot, seed: Math.floor(r() * 1e6) });
    if (c >= 3.2 && r() < 0.2) E.push(person(r, P(len * (0.2 + 0.6 * r()), 1.5 + r()), rot + (r() - 0.5), { pose: r() < 0.5 ? 'talk' : 'stand', carry: r() < 0.25 ? 'basket' : 'none' }));
  }
  return E;
}

// ── the piazza ────────────────────────────────────────────────────────────────
function piazza() {
  const r = rng(1509), E = [], [x0, z0, x1, z1] = PIAZZA;
  const wl = wells().map((w) => w.at);
  const free = (x, z, m = 1.4) => !wl.some(([a, b]) => Math.hypot(a - x, b - z) < m + 1.2) && !inRect([BASILICA.c[0] - BASILICA.s - 13, z0, x1, z1], x, z, 0) && !inRect([CLOCK[0] - 1, CLOCK[1] - 2, CLOCK[2] + 1, CLOCK[3] + 8], x, z, 0);
  // the booths of the cloth and spice merchants and the money-changers' tables before the arcades of the long sides, their fronts to the square
  for (const [zz, rot, front] of [[z0 + 5.3, 0, 1], [z1 - 5.3, Math.PI, -1]]) for (let x = x0 + 14, k = 0; x < x1 - 36; x += 7.4, k++) {
    if (!free(x, zz, 2) || (k % 5 === 4)) continue;
    E.push({ t: 'stall', at: [x, zz], rot: rot + Math.PI / 2 * 0, seed: 300 + k + (front > 0 ? 0 : 50), awning: pick(r, ['cloth_red', 'cloth_white', 'cloth_ochre', 'cloth_indigo', 'cloth_green']), goods: pick(r, [['bolts', 'bolts', 'baskets'], ['spice', 'baskets', 'pottery'], ['bolts', 'pottery', 'bolts'], ['spice', 'spice', 'baskets']]), w: 2.8, d: 1.3 });
    E.push(person(r, [x + (r() - 0.5) * 2, zz + front * 1.9], rot + Math.PI, { pose: 'stand', hat: 'cap' }));
    if (r() < 0.6) E.push(person(r, [x + 1.1 + r(), zz + front * 2.7], rot + 2.6 + r(), { pose: r() < 0.5 ? 'talk' : 'stand' }));
  }
  // the three tall masts before San Marco (the banners of the Republic: Cyprus, Candia, the Morea hung from them on feast days) with their stepped bases of stone
  const bx = BASILICA.c[0] - BASILICA.s - 13 - 12;
  for (const dz of [-14, 0, 14]) {
    E.push({ t: 'sacks', at: [bx + 2.6, BASILICA.c[1] + dz + 1.4], y: GROUND, rot: r() * 6, n: 2, seed: 11 + dz });
  }
  // people across the square: gentlemen in pairs, a friar and a merchant, women with baskets, porters crossing, a boy with a dog nearby
  const arr = [-60, -5];
  const ring = (n, rmin, rmax, a0, a1) => { for (let i = 0; i < n; i++) {
    const a = a0 + (a1 - a0) * r(), d = rmin + (rmax - rmin) * Math.sqrt(r()), x = arr[0] + Math.cos(a) * d, z = arr[1] + Math.sin(a) * d;
    if (!inRect(PIAZZA, x, z, -6) || !free(x, z)) continue;
    const kind = r();
    const base = person(r, [x, z], r() * 6.28, kind < 0.2 ? { hat: 'turban', over: 'sash', beard: true, cloth: pick(r, ['cloth_ochre', 'cloth_green', 'cloth_white']) } : kind < 0.3 ? { hat: 'none', hair: 'shaven', cloth: 'cloth_brown', cloth2: 'cloth_brown' } : kind < 0.55 ? { hat: 'veil', cloth: pick(r, ['cloth_red', 'cloth_indigo', 'cloth_green']), over: 'shawl', hair: 'bun' } : { cloth: 'cloth_black', hat: 'cap', over: 'cape' });
    E.push({ ...base, pose: r() < 0.4 ? 'talk' : 'stand' });
    if (base.pose === 'talk' || r() < 0.4) E.push(person(r, [x + Math.cos(base.rot + 2.7) * 1.1, z + Math.sin(base.rot + 2.7) * 1.1], base.rot + Math.PI * 0.9, { pose: 'talk' }));
  } };
  ring(22, 8, 55, -1.6, 1.6); ring(16, 30, 100, -1.2, 1.2); ring(18, 6, 70, 1.6, 4.7);
  for (let i = 0; i < 9; i++) E.push({ t: 'chickens', kind: 'pigeon', n: 8 + Math.floor(r() * 7), at: [x0 + 20 + r() * (x1 - x0 - 50), z0 + 8 + r() * (z1 - z0 - 16)], seed: 70 + i });
  return plan('venice-piazza-life', E, [(x0 + x1) / 2, (z0 + z1) / 2], 300, [x0 - 18, z0 - 20, x1 + 2, z1 + 16]);
}
/** The Piazzetta and the Molo: porters, crates and barrels set down from the galleys' boats, the booths of the Piazzetta's side, people looking at the water. */
function piazzetta() {
  const r = rng(1514), E = [], [x0, z0, x1, z1] = PIAZZETTA;
  for (let z = z0 + 14, k = 0; z < z1 - 22; z += 8, k++) {
    E.push({ t: 'stall', at: [x0 + 3.2, z], rot: -Math.PI / 2, seed: 500 + k, awning: pick(r, ['cloth_white', 'cloth_red', 'cloth_ochre']), goods: pick(r, [['bread', 'baskets'], ['greens', 'heap'], ['pottery', 'baskets'], ['bolts', 'baskets']]), w: 2.8, d: 1.3 });
    E.push(person(r, [x0 + 5.2, z + (r() - 0.5)], Math.PI / 2, { hat: 'cap' }));
  }
  for (let i = 0; i < 10; i++) { const x = x0 + 8 + r() * (x1 - x0 - 16), z = z0 + 20 + r() * (z1 - z0 - 36); E.push(person(r, [x, z], r() * 6.28, { pose: r() < 0.5 ? 'talk' : 'stand', carry: r() < 0.2 ? 'sack' : 'none' })); }
  for (let i = 0; i < 7; i++) {
    const x = [34, 44, 54, 64, 90, 110, 130][i], zz = BASIN_Z - 3.5;
    E.push({ t: pick(r, ['crates', 'barrel', 'sacks', 'basket']), at: [x + r(), zz - r() * 1.2], y: GROUND, rot: r() * 6, seed: 900 + i });
    if (i % 2 === 0) E.push(person(r, [x + 1.4, zz - 2], Math.PI * (0.2 + r() * 0.4), { carry: 'sack', hat: 'cap' }));
  }
  for (let i = 0; i < 4; i++) E.push({ t: 'chickens', kind: 'pigeon', n: 9 + i, at: [x0 + 10 + i * 12, z0 + 30 + i * 9], seed: 400 + i });
  return plan('venice-piazzetta-life', E, [(x0 + x1) / 2 + 40, (z0 + z1) / 2], 240, [x0 - 4, z0, x1 + 80, z1 + 14]);
}

// ── boats tied along the fondamente ───────────────────────────────────────────
/** Barges with their cargo, fishing boats, small boats tied stern-in to the quays, a boatman or a washerwoman on the quay, here and there. */
function moored() {
  const r = rng(1521), E = [], used = [], pcs = rivePieces();
  for (const [px, pz, wx, wz] of pcs) {
    if (r() > (Math.hypot(px + 60, pz + 5) < 160 ? 0.16 : 0.09) || Math.hypot(px, pz) > RADIUS - 85) continue;
    if (used.some(([a, b]) => Math.hypot(a - px, b - pz) < 22)) continue;
    if (Math.abs(px - RIALTO.x) < 40 && Math.abs(pz - RIALTO.z) < 45) continue;                    // the market has its own
    const k = r(), kind = k < 0.4 ? 'barge' : k < 0.8 ? 'rowboat' : 'sampan', len = kind === 'barge' ? 11 : kind === 'rowboat' ? 5.2 : 7.5;
    const width = kind === 'barge' ? 1.6 : 0.9;
    // at the quay's face, the boat lying along it; its centre half its width out from the face
    const qx = px + wx * (width + 0.25), qz = pz + wz * (width + 0.25);
    if (wet(qx, qz) > -1.2 || wet(qx + wz * len / 2, qz - wx * len / 2) > -0.8 || wet(qx - wz * len / 2, qz + wx * len / 2) > -0.8) continue;
    used.push([px, pz]);
    const rot = Math.atan2(-wz, wx);                                       // the boat's long axis (local z) along the quay
    E.push({ t: 'boat', kind: kind === 'sampan' ? 'rowboat' : kind, at: [qx, qz], y: kind === 'barge' ? SEA + 0.15 : SEA - 0.05, rot: Math.atan2(-wz, wx) + 0 * rot, len, seed: Math.floor(r() * 1e6) });
    if (kind === 'barge') for (let q = 0; q < 3; q++) E.push({ t: ['crates', 'barrel', 'sacks'][q], at: [px - wx * 0.5 - wz * (q - 1) * 1.6, pz - wz * 0.5 + wx * (q - 1) * 1.6], y: GROUND, rot: r() * 6, seed: q + 5 });
    if (r() < 0.55) E.push(person(r, [px - wx * 1.0 + wz * 2.2, pz - wz * 1.0 - wx * 2.2], Math.atan2(wx, wz), { carry: kind === 'barge' ? 'sack' : 'basket', hat: 'cap', pose: 'stand' }));
  }
  return plan('venice-moored', E, [0, 0], 300);
}


// ── more of the piazza, within sight of the arrival (docs/settlements/venice.md §5b) ─────────────────────────────────────────
/**
 * The square as Gentile Bellini painted it (the Procession of the Relic, 1496): hawkers sitting on their mats at the foot of the arcades
 * with their wares spread, a mountebank on his bench with his audience (the charlatans of the piazza sold their elixirs from a bench; the
 * Procuratie's arcades sheltered the money-changers), water-carriers with the yoke, friars and beggars, children, dogs and cats, men
 * feeding the pigeons. Kept clear of the arrival's first 8 m.
 */
function piazzaMore() {
  const r = rng(1511), E = [], [x0, z0, x1, z1] = PIAZZA, arr = [-60, -5];
  const ok = (x, z, m = 8) => Math.hypot(x - arr[0], z - arr[1]) > m && inRect(PIAZZA, x, z, -3) && !wells().some((w) => Math.hypot(w.at[0] - x, w.at[1] - z) < 1.6) && !inRect([BASILICA.c[0] - BASILICA.s - 13, z0, x1, z1], x, z, 0) && !inRect([CLOCK[0] - 1, CLOCK[1] - 2, CLOCK[2] + 1, CLOCK[3] + 8], x, z, 0);
  const add = (e) => { if (ok(e.at[0], e.at[1], e.t === 'figure' || e.t === 'animal' ? 8 : 9)) E.push(e); };
  // hawkers on their mats at the foot of the arcades, north and south sides, their backs to the columns
  for (const [zz, rot, front] of [[z0 + 1.7, Math.PI, 1], [z1 - 1.7, 0, -1]]) for (let x = x0 + 6, k = 0; x < x1 - 40; x += 5.2 + r() * 3, k++) {
    if (k % 3 === 2) continue;
    add({ t: 'goods_mat', at: [x, zz + front * 1.1], y: GROUND, rot: 0, seed: Math.floor(r() * 1e6), goods: pick(r, [['bread', 'heap'], ['pottery', 'baskets'], ['greens', 'basket'], ['bolts', 'basket'], ['fish', 'heap']]) });
    add(person(r, [x + (r() - 0.5), zz + front * 1.1 - 0.9 * front * 0.0], rot, { pose: 'sit_ground', hat: pick(r, ['cap', 'veil', 'none']), cloth: pick(r, ['cloth_brown', 'cloth_ochre', 'cloth_indigo', 'cloth_red']) }));
  }
  // the benches under the arcades, an old man or two on them; iron lanterns on the corners of the Procuratie
  for (const [zz, rot] of [[z0 + 0.6, Math.PI], [z1 - 0.6, 0]]) for (let x = x0 + 12; x < x1 - 40; x += 21 + r() * 6) {
    add({ t: 'bench', at: [x, zz], y: GROUND, rot, len: 1.8, back: true });
    if (r() < 0.6) add(person(r, [x, zz], rot, { pose: 'sit', hat: 'cap', cloth: 'cloth_black' }));
  }
  // the mountebank on his bench, the crowd about him
  { const sx = -33, sz = 12;
    add({ t: 'bench', at: [sx, sz], y: GROUND, rot: Math.PI / 2, len: 1.6 });
    add(person(r, [sx, sz], Math.PI / 2, { pose: 'talk', y: GROUND + 0.45, hat: 'cap', cloth: 'cloth_red', cloth2: 'cloth_ochre', over: 'cape', beard: true }));
    for (let k = 0; k < 9; k++) { const a = -Math.PI * 0.8 + k / 8 * Math.PI * 1.6, d = 2.4 + (k % 3) * 0.8, px = sx + Math.cos(a) * d, pz = sz + Math.sin(a) * d; add(person(r, [px, pz], Math.atan2(sx - px, sz - pz) + Math.PI, { pose: k % 4 === 1 ? 'talk' : 'stand', hat: pick(r, ['cap', 'cap', 'none', 'veil']) })); }
  }
  // a second knot of listeners about a friar preaching on the steps of a cart, nearer the campanile
  { const sx = -8, sz = 16;
    add(person(r, [sx, sz], Math.PI * 0.5, { hat: 'none', hair: 'shaven', cloth: 'cloth_brown', cloth2: 'cloth_brown', carry: 'staff', pose: 'talk' }));
    for (let k = 0; k < 6; k++) { const a = r() * 6.28, d = 1.8 + r() * 2, px = sx + Math.cos(a) * d, pz = sz + Math.sin(a) * d; add(person(r, [px, pz], Math.atan2(sx - px, sz - pz) + Math.PI, { pose: 'stand', hat: pick(r, ['cap', 'veil']) })); }
  }
  // water-carriers, porters with sacks, women with baskets, children in the open middle of the square
  for (let i = 0; i < 46; i++) {
    const x = x0 + 14 + r() * (x1 - x0 - 50), z = z0 + 8 + r() * (z1 - z0 - 18), k = r();
    if (k < 0.12) add(person(r, [x, z], r() * 6.28, { carry: 'pails', hat: 'cap', cloth: 'cloth_brown' }));
    else if (k < 0.24) add(person(r, [x, z], r() * 6.28, { carry: 'sack', hat: 'cap', dress: 'tunic' }));
    else if (k < 0.38) add(person(r, [x, z], r() * 6.28, { carry: 'basket', hat: 'veil', cloth: pick(r, ['cloth_red', 'cloth_indigo', 'cloth_green']), over: 'shawl', hair: 'bun' }));
    else if (k < 0.5) add(person(r, [x, z], r() * 6.28, { child: true, hat: 'cap', dress: 'tunic' }));
    else if (k < 0.58) add({ t: 'animal', kind: 'dog', at: [x, z], y: GROUND, rot: r() * 6, seed: Math.floor(r() * 1e6) });
    else if (k < 0.62) add({ t: 'animal', kind: 'cat', at: [x, z], y: GROUND, rot: r() * 6, seed: Math.floor(r() * 1e6) });
    else add(person(r, [x, z], r() * 6.28, { pose: r() < 0.5 ? 'talk' : 'stand', cloth: 'cloth_black', hat: 'cap', over: 'cape' }));
  }
  // the pigeon-feeders: a woman scattering grain, birds crowding about her, and more across the paving
  for (const [x, z] of [[-110, 18], [-85, -22], [-20, -20]]) { add(person(r, [x, z], r() * 6.28, { hat: 'veil', cloth: 'cloth_ochre', over: 'shawl', hair: 'bun' })); add({ t: 'chickens', kind: 'pigeon', n: 14, at: [x + 0.8, z - 0.6], y: GROUND, seed: Math.floor(x * 3 + z) }); }
  for (let i = 0; i < 8; i++) add({ t: 'chickens', kind: 'pigeon', n: 8 + Math.floor(r() * 8), at: [x0 + 10 + r() * (x1 - x0 - 50), z0 + 6 + r() * (z1 - z0 - 12)], y: GROUND, seed: 600 + i });
  return plan('venice-piazza-more', E, [(x0 + x1) / 2, (z0 + z1) / 2], 300, [x0 - 18, z0 - 20, x1 + 2, z1 + 16]);
}

// ── the Merceria ───────────────────────────────────────────────────────────────────────────────────────────────────────────────
/** The Merceria behind the Clock Tower (§5b): Venice's shopping street — booths of the haberdashers, mercers and spicers along both sides, signs on the booths' backs, lanterns, the crowd going through. */
function merceria() {
  const r = rng(1496), E = [], [x0, z0, x1, z1] = MERCERIA, zA = z0 + 6, zB = z1 - 12;
  const aw = ['cloth_red', 'cloth_white', 'cloth_ochre', 'cloth_indigo', 'cloth_green'], gd = [['bolts', 'bolts', 'baskets'], ['spice', 'baskets', 'pottery'], ['bolts', 'pottery'], ['spice', 'spice', 'baskets'], ['bread', 'baskets']];
  for (let z = zA, k = 0; z < zB; z += 6.4, k++) {
    if (k % 6 === 5) continue;
    E.push({ t: 'stall', at: [x0 + 1.9, z], rot: -Math.PI / 2, seed: 800 + k, awning: pick(r, aw), goods: pick(r, gd), w: 2.8, d: 1.2 });
    E.push(person(r, [x0 + 1.4, z], Math.PI / 2, { hat: 'cap' }));
    E.push({ t: 'stall', at: [x1 - 1.9, z + 3.1], rot: Math.PI / 2, seed: 850 + k, awning: pick(r, aw), goods: pick(r, gd), w: 2.8, d: 1.2 });
    E.push(person(r, [x1 - 1.4, z + 3.1], -Math.PI / 2, { hat: 'veil' }));
    if (r() < 0.55) E.push(person(r, [x0 + 4.4 + (r() - 0.5), z + (r() - 0.5) * 2], -Math.PI / 2 + (r() - 0.5), { pose: r() < 0.5 ? 'talk' : 'stand', carry: r() < 0.3 ? 'basket' : 'none' }));
    if (r() < 0.55) E.push(person(r, [x1 - 4.4 + (r() - 0.5), z + 3.1 + (r() - 0.5) * 2], Math.PI / 2 + (r() - 0.5), { pose: r() < 0.5 ? 'talk' : 'stand', carry: r() < 0.3 ? 'sack' : 'none' }));
    if (k % 2 === 0) E.push({ t: 'shop_sign', board: true, at: [x0 + 1.4, z], y: GROUND + 0.2, rot: -Math.PI / 2, h: 3.1, seed: 900 + k });
    if (k % 2 === 1) E.push({ t: 'shop_sign', board: true, at: [x1 - 1.4, z + 3.1], y: GROUND + 0.2, rot: Math.PI / 2, h: 3.1, seed: 950 + k });
  }
  for (let z = zA + 3; z < zB; z += 19) E.push({ t: 'lantern', kind: 'iron', at: [x0 + 0.12, z], y: GROUND, rot: -Math.PI / 2, h: 2.7 }, { t: 'lantern', kind: 'iron', at: [x1 - 0.12, z + 9], y: GROUND, rot: Math.PI / 2, h: 2.7 });
  for (let i = 0; i < 14; i++) E.push(person(r, [x0 + 5 + r() * (x1 - x0 - 10), zA + r() * (zB - zA)], r() * 6.28, { carry: pick(r, ['none', 'none', 'basket', 'sack', 'pails']), pose: r() < 0.3 ? 'talk' : 'stand' }));
  E.push({ t: 'animal', kind: 'dog', at: [x0 + 7, zA + 22], y: GROUND, rot: 2, seed: 41 }, { t: 'animal', kind: 'cat', at: [x1 - 1, zA + 11], y: GROUND, rot: 4, seed: 42 });
  return plan('venice-merceria', E, [(x0 + x1) / 2, (z0 + z1) / 2], 200, [x0 - 2, z0 - 2, x1 + 2, z1 + 2]);
}

// ── the calli: washing across the streets ───────────────────────────────────────────────────────────────────────────────────────
/** A line of washing hung from window to window across each street between the houses, about every 17 m along its run (Venice, Naples). */
function calli() {
  const r = rng(1522), tiles = new Map();
  for (const b of bands()) for (const [z0, z1] of b.runs) for (let z = z0 + 9 + r() * 6; z < z1 - 8; z += 15 + r() * 5) {
    const xm = (b.x0 + b.x1) / 2, k = `${Math.floor(xm / 100)},${Math.floor(z / 100)}`;
    if (!tiles.has(k)) tiles.set(k, []);
    const line = { t: 'wash_line', at: [xm, z], y: GROUND + 5.0 + r() * 1.8, rot: 0, len: +(b.x1 - b.x0 + 0.8).toFixed(2), emb: [0.25, 0.25], seed: Math.floor(r() * 1e6) };
    if (inLot(b.x0 - 0.8, z) && inLot(b.x1 + 0.8, z)) tiles.get(k).push(line);                  // only where a house stands at both ends of the line
  }
  return [...tiles].filter(([, E]) => E.length).map(([k, E]) => { const [i, j] = k.split(',').map(Number); return plan(`venice-calli-${k}`, E, [i * 100 + 50, j * 100 + 50], 150); });
}

/** Dressing plans: the fronts in 100 m tiles (near 180 m), the piazza, the Piazzetta, the boats. */
export function dressPlans() {
  const tiles = new Map();
  for (const l of lots()) {
    const x = (l.rect[0] + l.rect[2]) / 2, z = (l.rect[1] + l.rect[3]) / 2, k = `${Math.floor(x / 100)},${Math.floor(z / 100)}`;
    if (!tiles.has(k)) tiles.set(k, []);
    tiles.get(k).push(l);
  }
  const out = [];
  for (const [k, list] of tiles) {
    const [i, j] = k.split(',').map(Number), E = list.flatMap(frontsOf);
    if (E.length) out.push(plan(`venice-fronts-${k}`, E, [i * 100 + 50, j * 100 + 50], 190));
  }
  out.push(piazza(), piazzaMore(), merceria(), piazzetta(), moored(), ...calli());
  return out;
}
void MERCERIA; void PIAZZA;
