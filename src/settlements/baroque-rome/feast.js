// The papal-blessing day (docs/settlements/baroque-rome.md §5, "The papal blessing day"): the piazza on a feast, the
// crowd gathered to be blessed from the Loggia — pilgrim parties, townsfolk, mothers with children, friars and
// priests, in the black of the seicento and the brown of the pilgrim's cape, most turned toward the church, some
// kneeling; a confraternity's procession halted on its way to the steps (the cross, the gonfalone, the pairs of
// brothers in their sacks, the canons, the baldacchino with its four bearers and the Swiss about it); more coaches
// standing in the oval and before the steps; the fair's stalls; beggars; the Swiss cordon before the steps.
// Pure data. Everything is kept off the walk through the oval (the arrival's way to the obelisk and the steps) and
// at least ~6 m from the arrival; the figures are the shared objects' (life), the coaches, the canopy and the banners
// the baroque style's.

import { OVAL, FRONT_X, FLOOR, inOval } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const at = (x, z, rot, lx, lz) => [x + lx * Math.cos(rot) + lz * Math.sin(rot), z - lx * Math.sin(rot) + lz * Math.cos(rot)];
const WEST = Math.PI / 2;                                    // facing the church (−x)

/** Adds the day's life to L (figures, animals, stalls; the life plan) and C (coaches, canopy, banners; the baroque plan). `coachAt` is street.js's. */
export function feast({ L, C, coachAt, arrival }) {
  const rand = rng(1671);
  let sd = 61000;
  const taken = L.filter((e) => e.at).map((e) => e.at);       // what stands already (figures, stalls, animals, props)
  const keep = (x, z, r = 0.8) => { for (const [a, b] of taken) if ((a - x) ** 2 + (b - z) ** 2 < r * r) return false; return true; };
  const take = (x, z) => taken.push([x, z]);
  // the ways kept open: the walk round the obelisk and up to the steps (src/settlements/baroque-rome/plan.js) and a free ring about the arrival
  const WALK = [[125, 0], [58, 0], [56, -11], [24, -11], [22, 0], [FRONT_X + 26, 0]];
  const segD = (x, z, [ax, az], [bx, bz]) => { const dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz))); return Math.hypot(x - ax - t * dx, z - az - t * dz); };
  const onWalk = (x, z) => WALK.slice(1).some((p, i) => segD(x, z, WALK[i], p) < 1.7);
  const blocked = (x, z) => (arrival && Math.hypot(x - arrival[0], z - arrival[1]) < 7)
    || Math.hypot(x - OVAL.c[0], z - OVAL.c[1]) < 11 || Math.hypot(x - OVAL.c[0], z - OVAL.c[1] - 42) < 10 || Math.hypot(x - OVAL.c[0], z - OVAL.c[1] + 42) < 10 || onWalk(x, z);

  // ---- coaches standing in the oval and before the steps, each with its coachman, horses and footmen ----
  const coaches = [
    [84, -19, WEST + 0.12, { footmen: true, cloth: 'cloth_red', livery: 'cloth_red' }],
    [74, 21, -WEST + 0.2, { body: 'wood_painted', cloth: 'cloth_blue', livery: 'cloth_blue', horse: 'hide_grey', footmen: true }],
    [57, 36, WEST - 0.15, { cloth: 'cloth_maroon', livery: 'cloth_maroon', horse: 'hide_brown' }],
    [62, -34, WEST + 0.3, { body: 'wood_painted', cloth: 'cloth_green', livery: 'cloth_green', footmen: true }],
    [14, 24, WEST, { footmen: true, cloth: 'cloth_red', livery: 'cloth_red', horse: 'hide_grey' }],
    [8, -30, WEST - 0.1, { cloth: 'cloth_indigo', livery: 'cloth_indigo', horse: 'hide_black', footmen: true }],
    [-46, -32, WEST + 0.05, { footmen: true, cloth: 'cloth_red', livery: 'cloth_red' }],
    [-44, 30, WEST - 0.08, { cloth: 'cloth_maroon', livery: 'cloth_maroon', horse: 'hide_brown', footmen: true }],
  ];
  for (const [x, z0, rot, o] of coaches) {
    let z = z0;
    for (let k = 0; k < 5; k++) {                              // nudge it off whatever stands there (the coach and its horses: 8 m along its way)
      let free = true;
      for (let q = -5; q <= 2.6; q += 1) { const [px, pz] = at(x, z, rot, 0, q); if (!keep(px, pz, 1.7) || onWalk(px, pz)) free = false; }
      if (free) break;
      z += (k % 2 ? 1 : -1) * 3 * (k + 1) / 2 * Math.sign(z0 || 1);
    }
    coachAt(x, z, rot, o);
    for (let q = -5; q <= 2.6; q += 1) take(...at(x, z, rot, 0, q));
    for (const q of [-4, -2, 0, 2]) take(...at(x, z, rot, 1.2, q)), take(...at(x, z, rot, -1.2, q));
  }

  // ---- the people ----
  const SK = () => (rand() < 0.82 ? 'skin_light' : 'skin_medium');
  const person = (x, z, rot, kind, o = {}) => {
    const base = { t: 'figure', at: [x, z], y: o.y ?? 0, rot, seed: (sd += 7), skin: SK() };
    const pick = (a) => a[Math.floor(rand() * a.length)];
    let e;
    switch (kind) {
      case 'pilgrim': e = { dress: 'robe', legs: 'hose', cloth: pick(['cloth_brown', 'cloth_grey', 'cloth_black', 'cloth_ochre', 'cloth_brown']), cloth2: 'cloth_brown', hat: rand() < 0.75 ? 'brim' : 'veil', over: 'cape', carry: rand() < 0.65 ? 'staff' : 'none', pose: 'stand' }; break;
      case 'burgher': e = { dress: 'robe', legs: 'hose', cloth: pick(['cloth_black', 'cloth_black', 'cloth_indigo', 'cloth_brown']), cloth2: pick(['cloth_black', 'cloth_grey']), hat: 'brim', over: 'cloak', pose: rand() < 0.5 ? 'talk' : 'stand' }; break;
      case 'woman': e = { dress: 'robe', cloth: pick(['cloth_black', 'cloth_maroon', 'cloth_indigo', 'cloth_green', 'cloth_ochre', 'cloth_brown']), cloth2: pick(['cloth_white', 'cloth_black', 'cloth_red']), hat: 'veil', over: 'shawl', pose: rand() < 0.5 ? 'talk' : 'stand' }; break;
      case 'mother': e = { dress: 'robe', cloth: pick(['cloth_maroon', 'cloth_indigo', 'cloth_green', 'cloth_brown']), cloth2: 'cloth_white', hat: 'veil', over: 'shawl', carry: 'child', pose: 'stand' }; break;
      case 'artisan': e = { dress: 'tunic', legs: 'hose', cloth: pick(['cloth_brown', 'cloth_grey', 'cloth_ochre', 'cloth_indigo', 'cloth_green']), cloth2: pick(['cloth_white', 'cloth_brown']), hat: 'cap', over: 'apron', pose: rand() < 0.4 ? 'talk' : 'stand' }; break;
      case 'friar': e = { dress: 'robe', cloth: 'cloth_brown', cloth2: 'cloth_white', hat: 'none', over: 'sash', hair: 'shaven', pose: rand() < 0.5 ? 'talk' : 'stand' }; break;
      case 'priest': e = { dress: 'robe', cloth: 'cloth_black', cloth2: 'cloth_white', hat: 'brim', over: 'sash', pose: 'stand' }; break;
      case 'child': e = { dress: 'tunic', legs: 'hose', cloth: pick(['cloth_ochre', 'cloth_green', 'cloth_red', 'cloth_blue']), cloth2: 'cloth_white', hat: rand() < 0.5 ? 'cap' : 'none', over: 'none', child: true, pose: 'stand' }; break;
      case 'kneeler': e = { dress: 'robe', legs: 'hose', cloth: pick(['cloth_brown', 'cloth_black', 'cloth_grey', 'cloth_maroon']), cloth2: 'cloth_brown', hat: rand() < 0.5 ? 'veil' : 'none', over: 'cape', pose: 'kneel', arms: 'pray' }; break;
      default: e = { dress: 'robe', cloth: 'cloth_black', pose: 'stand' };
    }
    L.push({ ...base, ...e, ...o });
    take(x, z);
  };
  const KINDS = [['pilgrim', 4.2], ['burgher', 2], ['woman', 2.6], ['mother', 0.8], ['artisan', 1.6], ['friar', 0.8], ['priest', 0.6], ['child', 1.1]];
  const KT = KINDS.reduce((s, [, w]) => s + w, 0);
  const anyKind = () => { let r = rand() * KT; for (const [k, w] of KINDS) { if ((r -= w) < 0) return k; } return 'pilgrim'; };
  const cluster = (cx, cz, n, face) => {
    let placed = 0;
    for (let tries = 0; placed < n && tries < n * 14; tries++) {
      const a = rand() * Math.PI * 2, r = Math.sqrt(rand()) * (0.9 + n * 0.28), x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r;
      if (!keep(x, z, 0.78) || blocked(x, z) || !inOval(x, z, -5)) continue;
      const kind = anyKind();
      // most face the Loggia; a talking knot faces its own middle; a child looks anywhere
      const rot = kind === 'child' || rand() < 0.28 ? Math.atan2(cx - x, cz - z) + Math.PI + (rand() - 0.5) * 0.5 : face + (rand() - 0.5) * 0.7;
      person(x, z, rot, kind);
      placed++;
    }
  };
  // the gathered crowd: thickest from the oval's mouth to the obelisk (6–70 m from the arrival), thinner toward the steps
  const spots = [];
  for (let k = 0; k < 400 && spots.length < 26; k++) {
    const x = 100 - rand() * rand() * 120 - rand() * 14, z = (rand() - 0.5) * 2 * (28 + (100 - x) * 0.32);
    if (!inOval(x, z, -8) || blocked(x, z) || spots.some(([a, b]) => (a - x) ** 2 + (b - z) ** 2 < 36)) continue;
    spots.push([x, z]);
  }
  // (and the near ground first: knots of ten to thirty metres from the arrival, beside the way and before the first stalls)
  for (const [x, z, n] of [[95, -13, 5], [93, 14, 5], [87, -9.5, 4], [86, 10, 5], [100, -25, 5], [99, 26, 4], [79, -15, 6], [78, 15, 5], [70, -6, 4], [70, 8, 4], [102, -9, 3], [103, 10, 3], [94, -5.5, 3], [93, 6.5, 3]]) cluster(x, z, n, WEST);
  for (const [x, z] of spots) cluster(x, z, 4 + Math.floor(rand() * 5), WEST);
  // before the steps: the faithful packed on the retta and the foot of the stairs, facing the Loggia (far: seen as a mass)
  for (let k = 0; k < 95; k++) {
    const x = FRONT_X + 24 + rand() * 30, z = (rand() - 0.5) * 2 * 40;
    if (!keep(x, z, 0.85) || onWalk(x, z) || (x > FRONT_X + 30 && Math.abs(z) > 24 && rand() < 0.5)) continue;
    const kind = rand() < 0.28 ? 'kneeler' : anyKind();
    person(x, z, WEST + (rand() - 0.5) * 0.5, kind);
  }
  // the Swiss cordon at the foot of the steps, facing the crowd, their halberds in hand
  for (let z = -30; z <= 30; z += 10) {
    if (Math.abs(z) < 4) continue;
    L.push({ t: 'figure', at: [FRONT_X + 25, z], y: 0, rot: -WEST, seed: (sd += 7), skin: 'skin_light', pose: 'stand', dress: 'tunic', legs: 'hose', cloth: 'cloth_red', cloth2: 'cloth_ochre', hat: 'cap', over: 'cape', carry: 'staff', len: 2.3 }); take(FRONT_X + 25, z);
  }

  // ---- the procession: halted on its way, in two files along the north side of the way, going west to the steps ----
  const PZ = -7.4, PX0 = 50;                                    // the cross at the head (x 50), the tail near x 93
  const walk = (x, z, kind, o = {}) => { person(x, z, WEST, kind, { pose: 'stand', ...o }); };
  const brother = (x, z, o = {}) => person(x, z, WEST, 'default', { dress: 'robe', legs: 'hose', cloth: o.cloth ?? 'cloth_white', cloth2: 'cloth_black', hat: 'veil', over: 'sash', pose: 'stand', ...o });
  C.push({ t: 'proc_cross', at: [PX0, PZ], rot: 0, y: 0 });
  person(PX0, PZ, WEST, 'default', { dress: 'robe', cloth: 'cloth_black', cloth2: 'cloth_white', hat: 'none', over: 'cape', carry: 'staff', len: 1.4, arms: 'staff' });
  for (const s of [-1, 1]) person(PX0 + 1.5, PZ + s * 1.2, WEST, 'default', { dress: 'robe', cloth: 'cloth_red', cloth2: 'cloth_white', hat: 'none', over: 'cape', hair: 'short', carry: 'staff', len: 2.0, arms: 'staff' });
  // the brothers of the confraternity in their sacks, in pairs, with the gonfalone
  for (let i = 0; i < 7; i++) {
    const x = PX0 + 5 + i * 1.7;
    for (const s of [-1, 1]) brother(x, PZ + s * 1.05);
  }
  C.push({ t: 'gonfalone', at: [PX0 + 9.5, PZ], rot: 0, y: 0, cloth: 'cloth_red' });
  person(PX0 + 9.5, PZ, WEST, 'default', { dress: 'robe', legs: 'hose', cloth: 'cloth_white', cloth2: 'cloth_red', hat: 'veil', over: 'sash', pose: 'stand' });
  C.push({ t: 'gonfalone', at: [PX0 + 4.0, PZ + 3.2], rot: 0, y: 0, cloth: 'cloth_blue' });
  person(PX0 + 4.0, PZ + 3.2, WEST, 'default', { dress: 'robe', legs: 'hose', cloth: 'cloth_white', cloth2: 'cloth_blue', hat: 'veil', over: 'sash', pose: 'stand' });
  // the canons and the chaplains in their cottas, then the baldacchino with its bearers, the officiant and the Swiss about it
  for (let i = 0; i < 4; i++) for (const s of [-1, 1]) person(PX0 + 18 + i * 1.7, PZ + s * 1.05, WEST, 'default', { dress: 'robe', cloth: 'cloth_black', cloth2: 'cloth_white', hat: i % 2 ? 'cap' : 'none', over: 'cape', hair: 'short', pose: 'stand' });
  const BX = PX0 + 28.5;
  C.push({ t: 'baldachin', at: [BX, PZ], rot: Math.PI / 2, y: 0, cloth: 'cloth_white', w: 2.4, d: 1.6 });
  for (const [dx, dz] of [[-0.95, -0.65], [0.95, -0.65], [-0.95, 0.65], [0.95, 0.65]]) person(BX + dx, PZ + dz, WEST, 'default', { dress: 'robe', legs: 'hose', cloth: 'cloth_black', cloth2: 'cloth_grey', hat: 'brim', over: 'cloak', pose: 'stand', hair: 'long' });
  person(BX, PZ, WEST, 'default', { dress: 'robe', cloth: 'cloth_white', cloth2: 'cloth_red', hat: 'cap', over: 'cape', hair: 'short', pose: 'stand', h: 1.7 });
  for (const [dx, s] of [[-2.0, -1], [-2.0, 1], [2.1, -1], [2.1, 1]]) L.push({ t: 'figure', at: [BX + dx, PZ + s * 2.0], y: 0, rot: WEST, seed: (sd += 7), skin: 'skin_light', pose: 'stand', dress: 'tunic', legs: 'hose', cloth: 'cloth_red', cloth2: 'cloth_ochre', hat: 'cap', over: 'cape', carry: 'staff', len: 2.3 });
  // the rear: the cardinal's household, gentlemen in black, a priest or two, pilgrims trailing in
  for (let i = 0; i < 5; i++) for (const s of [-1, 1]) if (rand() < 0.85) person(BX + 4.5 + i * 1.8, PZ + s * 1.1, WEST, i < 2 ? 'burgher' : 'pilgrim');
  // the kneelers along the way, bowed as the Sacrament passes, and the children held up to see
  for (const [cx, cz] of [[PX0 + 22, PZ - 3.6], [PX0 + 30, PZ - 3.6], [PX0 + 12, PZ - 3.8], [PX0 + 26, PZ + 3.4], [PX0 + 14, PZ + 3.5]]) {
    for (let i = 0; i < 4; i++) { const x = cx + (i - 1.5) * 1.1, z = cz + (rand() - 0.5) * 0.8; if (!keep(x, z, 0.8) || onWalk(x, z)) continue; person(x, z, cz < PZ ? Math.PI : 0, 'kneeler'); }
  }

  // ---- the fair at the oval's mouth: stalls of medals and rosaries, chestnuts and water, holy prints; sellers, buyers, beggars ----
  const stall = (x, z, rot, goods, awning) => {
    C.length && void 0;
    L.push({ t: 'stall', at: [x, z], rot, seed: (sd += 5), awning, goods, w: 2.4, d: 1.2 });
    L.push({ t: 'figure', at: at(x, z, rot, 0, -1.25), y: 0, rot: rot + Math.PI, seed: (sd += 7), skin: SK(), pose: 'stand', dress: rand() < 0.5 ? 'tunic' : 'robe', legs: 'hose', cloth: 'cloth_brown', cloth2: 'cloth_white', hat: rand() < 0.5 ? 'cap' : 'veil', over: 'apron' });
    L.push({ t: 'figure', at: at(x, z, rot, 0.4, 1.6), y: 0, rot, seed: (sd += 7), skin: SK(), pose: 'talk', dress: 'robe', legs: 'hose', cloth: 'cloth_black', cloth2: 'cloth_grey', hat: 'brim', over: 'cloak' });
    L.push({ t: 'figure', at: at(x, z, rot, -0.7, 1.9), y: 0, rot: rot + 0.4, seed: (sd += 7), skin: SK(), pose: 'stand', dress: 'robe', cloth: 'cloth_indigo', cloth2: 'cloth_white', hat: 'veil', over: 'shawl' });
    take(x, z);
  };
  for (const [x, z, rot, g, aw] of [[93, -29, WEST, ['basket', 'cloth'], 'cloth_white'], [90, 31, -WEST, ['bread', 'basket'], 'cloth_ochre'], [68, 52, WEST, ['cloth', 'basket'], 'cloth_red'], [66, -50, -WEST, ['heap', 'basket'], 'cloth_white'], [31, -52, WEST, ['basket', 'cloth'], 'cloth_ochre']]) if (keep(x, z, 2.4) && inOval(x, z, -4)) stall(x, z, rot, g, aw);
  L.push({ t: 'handcart', at: [88, 6.2], y: 0, rot: WEST, seed: (sd += 3), load: 'baskets' });
  L.push({ t: 'figure', at: [88, 7.9], y: 0, rot: Math.PI, seed: (sd += 7), skin: 'skin_medium', pose: 'stand', dress: 'tunic', legs: 'hose', cloth: 'cloth_ochre', cloth2: 'cloth_brown', hat: 'cap', over: 'apron' });
  L.push({ t: 'figure', at: [90.5, 8.6], y: 0, rot: Math.PI + 0.6, seed: (sd += 7), skin: 'skin_light', pose: 'talk', dress: 'robe', cloth: 'cloth_maroon', cloth2: 'cloth_white', hat: 'veil', over: 'shawl' });
  for (const [x, z] of [[96, 2.4], [103.5, -3.2]]) L.push({ t: 'figure', at: [x, z], y: 0, rot: WEST * 2 + 0.4, seed: (sd += 7), skin: 'skin_medium', pose: 'ground', dress: 'robe', cloth: 'cloth_grey', cloth2: 'cloth_brown', hat: 'cap', over: 'none' });     // beggars at the mouth, turned to the arrival
  for (const [x, z, r] of [[34, 7.5, 3], [58, 6.5, -2.4], [-30, -14, 0.6]]) if (keep(x, z, 1) && !onWalk(x, z)) L.push({ t: 'figure', at: [x, z], y: 0, rot: r, seed: (sd += 7), skin: 'skin_medium', pose: 'ground', dress: 'robe', cloth: 'cloth_brown', cloth2: 'cloth_grey', hat: 'none', over: 'none' });
  // birds and dogs where the crowd thins
  for (const [x, z, n] of [[80, -4, 11], [48, 13, 9], [24, -18, 10], [-20, 16, 12], [66, -8, 8]]) if (!blocked(x, z)) L.push({ t: 'chickens', kind: 'pigeon', n, at: [x, z], y: 0, rot: rand() * 6, seed: (sd += 3) });
  for (const [x, z] of [[82, 12], [30, -26], [-18, 24]]) L.push({ t: 'animal', kind: 'dog', at: [x, z], y: 0, rot: rand() * 6, seed: (sd += 3) });
}
