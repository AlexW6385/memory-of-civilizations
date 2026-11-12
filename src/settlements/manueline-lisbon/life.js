// The goods and the people of Lisbon about 1520 (docs/settlements/manueline-lisbon.md §6–§8): every house front dressed at eye level
// (signs, pots, benches, stalls, firewood, washing, a dog or a cat), the shopkeepers in the open shops, the plaza of the Jerónimos
// with its pilgrims, beggars and friars, the Terreiro do Paço as a market, the quay with its porters, the yard's workers, the
// beach at Belém with its nets and drying fish, the Alfama's lanes. Elements of style `life`, in tiles of 100 m.
import { RADIUS, GROUND, QUAY, RUA_NOVA, TERREIRO, YARD, PLAZA, SQUARE, ZS, SHIPS, height, lots, onStreet, inRect, wet, shore, inLot } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const CL = ['cloth_indigo', 'cloth_brown', 'cloth_ochre', 'cloth_red', 'cloth_green', 'cloth_grey', 'cloth_white', 'cloth_maroon', 'cloth_blue'];
const DARK = ['cloth_black', 'cloth_maroon', 'cloth_indigo', 'cloth_brown', 'cloth_green', 'cloth_grey'];
const FR = { n: [0, -1], s: [0, 1] };
const g = GROUND;

export function lifeElements() {
  const L = [], rand = rng(1521), pick = (a) => a[Math.floor(rand() * a.length)], seed = () => Math.floor(rand() * 1e9);
  const skin = () => pick(['skin_light', 'skin_light', 'skin_light', 'skin_medium', 'skin_dark']);
  const person = (at, y, rot, extra = {}) => L.push({ t: 'figure', at, y, rot, seed: seed(), dress: 'tunic', cloth: pick(CL), cloth2: pick(CL), skin: skin(), hat: pick(['none', 'cap', 'cap', 'brim']), over: pick(['cape', 'belt', 'none']), carry: 'none', ...extra });
  const merchant = (at, y, rot, e = {}) => person(at, y, rot, { dress: 'robe', cloth: pick(DARK), cloth2: 'cloth_black', hat: 'cap', over: 'cape', hair: 'short', beard: rand() < 0.6, ...e });
  const noble = (at, y, rot, e = {}) => person(at, y, rot, { dress: 'tunic', legs: 'hose', cloth: pick(['cloth_red', 'cloth_blue', 'cloth_green', 'cloth_maroon', 'cloth_black']), cloth2: 'cloth_black', hat: 'brim', over: 'cape', hair: 'short', ...e });
  const woman = (at, y, rot, e = {}) => person(at, y, rot, { dress: 'robe', cloth: pick(['cloth_brown', 'cloth_ochre', 'cloth_red', 'cloth_indigo', 'cloth_green', 'cloth_white']), cloth2: 'cloth_white', hat: 'veil', over: 'shawl', hair: 'bun', ...e });
  const friar = (at, y, rot, e = {}) => person(at, y, rot, { dress: 'robe', cloth: 'cloth_white', cloth2: 'cloth_black', over: 'cape', hat: 'none', hair: 'shaven', ...e });
  const labourer = (at, y, rot, e = {}) => person(at, y, rot, { dress: 'tunic', cloth: pick(['cloth_brown', 'cloth_ochre', 'cloth_grey', 'cloth_white']), hat: pick(['cap', 'none']), over: 'belt', hair: 'short', ...e });
  const child = (at, y, rot, e = {}) => person(at, y, rot, { dress: 'tunic', child: true, hat: 'none', over: 'none', ...e });
  const faceTo = ([dx, dz]) => Math.atan2(-dx, -dz);
  const ok = ([x, z]) => Math.hypot(x, z) < RADIUS - 40 && wet(x, z) > 2;
  const crowd = (n, rect, y, mix) => { for (let k = 0; k < n; k++) { const p = [rect[0] + rand() * (rect[2] - rect[0]), rect[1] + rand() * (rect[3] - rect[1])]; if (!ok(p) || inLot(p[0], p[1], 0.3)) continue; mix(p, y, rand() * 6.28); } };

  // ── the house fronts
  for (const l of lots()) {
    if (l.kind === 'yard') {
      const [x0, z0, x1, z1] = l.rect, fz = l.front === 'n' ? z0 : z1, n = FR[l.front];
      if (rand() < 0.5) L.push({ t: 'chickens', at: [(x0 + x1) / 2, (z0 + z1) / 2], y: height((x0 + x1) / 2, (z0 + z1) / 2), rot: rand() * 6, seed: seed(), n: 4 });
      if (rand() < 0.5) L.push({ t: 'laundry', at: [(x0 + x1) / 2, (z0 + z1) / 2 + 2], y: height((x0 + x1) / 2, (z0 + z1) / 2), rot: 0, len: Math.min(6, x1 - x0 - 2), seed: seed() });
      void fz; void n;
      continue;
    }
    const [x0, z0, x1, z1] = l.rect, n = FR[l.front], fz = l.front === 'n' ? z0 : z1, w = x1 - x0;
    const P = (t, off) => [x0 + w * t, fz + n[1] * off], mid = P(0.5, 0);
    if (!ok(mid) || !onStreet(P(0.5, 2.0)[0], P(0.5, 2.0)[1], 0.5)) continue;
    const y = height(mid[0], mid[1]), rot = Math.atan2(n[0], n[1]);
    if (l.open) {
      // the shopkeeper behind his counter, a customer at it; a lamp over the door
      const inV = l.front === 'n' ? 1 : -1, fy = l.y + 0.45, kp = [x0 + w * 0.5, fz + inV * 4.0];
      if (l.use !== 'home') { merchant(kp, fy, faceTo(n), { pose: 'stand' }); if (rand() < 0.7) noble([x0 + w * 0.4, fz + inV * 1.5], fy, faceTo([-n[0], -n[1]]), { pose: 'talk' }); }
      else { woman([x0 + w * 0.5, fz + inV * 5.5], fy, rand() * 6, { pose: 'stand' }); if (rand() < 0.6) child([x0 + w * 0.3, fz + inV * 4.5], fy, rand() * 6); }
    }
    if (l.kind === 'merchant') {
      if (!l.open && rand() < 0.8) L.push({ t: 'shop_sign', board: true, at: P(0.62, 0.06), y, rot, h: 3.1, seed: seed() });
      if (l.open) L.push({ t: 'shop_sign', board: true, at: P(0.88, 0.06), y, rot, h: 3.3, seed: seed() });
      if (rand() < 0.7) L.push({ t: 'stall', at: P(0.2 + rand() * 0.6, 1.8), y, rot, awning: pick(CL), stripe: pick(['cloth_white', 'cloth_ochre']), goods: pick([['blue_jar', 'glazed_jar'], ['cloth'], ['produce'], ['basket'], ['amphora', 'water_pot']]), seed: seed() });
      if (rand() < 0.55) L.push({ t: 'crates', at: P(0.9, 0.9), y, rot: 0, n: 3, seed: seed() });
      if (rand() < 0.5) L.push({ t: 'barrel', at: P(0.06, 0.8), y, rot: 0, n: 2, seed: seed() });
      if (rand() < 0.4) L.push({ t: 'pot', kind: pick(['water_pot', 'glazed_jar', 'pithos']), at: P(0.1, 0.5), y, rot: 0, n: 1, seed: seed() });
      if (rand() < 0.35) L.push({ t: 'bench', at: P(0.4, 0.5), y, rot: rot + Math.PI / 2 * 0, len: 1.8, seed: seed() });
      if (rand() < 0.5) merchant(P(0.3 + rand() * 0.4, 3.4), y, faceTo(n), { pose: rand() < 0.5 ? 'talk' : 'stand' });
      if (rand() < 0.3) woman(P(0.5 + rand() * 0.3, 3.0), y, rand() * 6, { carry: pick(['basket', 'pot']) });
      if (rand() < 0.18) L.push({ t: 'animal', kind: pick(['dog', 'cat']), at: P(0.7, 1.2), y, rot: rand() * 6.28, seed: seed() });
      if (rand() < 0.2) L.push({ t: 'laundry_pole', at: P(0.3 + rand() * 0.4, -0.5), y: y + 7.2, rot, len: 1.4, prop: false, seed: seed() });
    } else if (l.kind === 'alfama') {
      if (rand() < 0.45) L.push({ t: 'laundry', at: P(0.5, 2.0), y, rot: 0, len: Math.min(w, 5), seed: seed() });
      if (rand() < 0.4) L.push({ t: 'laundry_pole', at: P(0.3 + rand() * 0.4, -0.5), y: y + 4.6 + (rand() < 0.5 ? 3 : 0), rot, len: 1.3, prop: false, seed: seed() });
      if (rand() < 0.6) L.push({ t: 'pot', kind: pick(['water_pot', 'glazed_jar', 'dark_pot']), at: P(0.15, 0.5), y, rot: 0, n: 2, seed: seed() });
      if (rand() < 0.3) L.push({ t: 'firewood', at: P(0.85, 0.5), y, rot, len: 1.3, seed: seed() });
      if (rand() < 0.3) L.push({ t: 'stool', at: P(0.5, 0.8), y, rot, seed: seed() });
      if (rand() < 0.3) woman(P(0.5, 0.8), y, faceTo(n), { pose: 'sit_low', over: 'shawl' });
      if (rand() < 0.15) L.push({ t: 'animal', kind: pick(['dog', 'goat', 'donkey', 'cat']), at: P(0.7, 2.0), y, rot: rand() * 6.28, seed: seed() });
      if (rand() < 0.15) L.push({ t: 'chickens', at: P(0.4, 1.8), y, rot: rand() * 6, seed: seed(), n: 3 });
      if (rand() < 0.2) L.push({ t: 'ladder', at: P(0.8, 0.3), y, rot, len: 3, seed: seed() });
    } else {
      if (rand() < 0.5) L.push({ t: 'basket', at: P(0.3, 0.8), y, rot: 0, n: 2, seed: seed(), goods: 'hide_tan' });
      if (rand() < 0.45) L.push({ t: 'laundry', at: P(0.5, 2.2), y, rot: 0, len: 4, seed: seed() });
      if (rand() < 0.4) L.push({ t: 'firewood', at: P(0.8, 0.5), y, rot, len: 1.3, seed: seed() });
      if (rand() < 0.3) L.push({ t: 'pot', kind: 'pithos', at: P(0.1, 0.6), y, rot: 0, n: 1, seed: seed() });
      if (rand() < 0.35) labourer(P(0.5, 1.8), y, faceTo(n), { pose: 'sit_low', carry: 'none' });
      if (rand() < 0.25) L.push({ t: 'animal', kind: pick(['dog', 'cat', 'donkey']), at: P(0.6, 2.2), y, rot: rand() * 6.28, seed: seed() });
    }
  }
  // ── the streets: walkers and talkers, porters, a dog; the cross streets and Rua Nova
  const along = (rect, step, f) => { const horiz = rect[2] - rect[0] > rect[3] - rect[1]; for (let s = (horiz ? rect[0] : rect[1]) + 3; s < (horiz ? rect[2] : rect[3]) - 3; s += step * (0.6 + rand() * 0.8)) { const c = horiz ? [s, (rect[1] + rect[3]) / 2 + (rand() - 0.5) * (rect[3] - rect[1]) * 0.6] : [(rect[0] + rect[2]) / 2 + (rand() - 0.5) * (rect[2] - rect[0]) * 0.6, s]; if (ok(c) && onStreet(c[0], c[1], 0)) f(c, horiz ? (rand() < 0.5 ? 0 : Math.PI) + Math.PI / 2 : (rand() < 0.5 ? 0 : Math.PI)); } };
  along(RUA_NOVA, 5, (c, r) => {
    const k = rand(), y = height(c[0], c[1]);
    if (k < 0.2) merchant(c, y, r); else if (k < 0.32) noble(c, y, r); else if (k < 0.5) woman(c, y, r, { carry: pick(['basket', 'pot', 'none']) });
    else if (k < 0.62) labourer(c, y, r, { carry: 'sack' }); else if (k < 0.72) { merchant(c, y, r, { pose: 'talk' }); merchant([c[0] + 0.7, c[1] + 0.2], y, r + 3, { pose: 'talk' }); }
    else if (k < 0.8) person(c, y, r, { dress: 'tunic', skin: 'skin_dark', cloth: 'cloth_grey', hat: 'none', carry: 'pot', over: 'none' });   // a slave with a water jar
    else if (k < 0.88) L.push({ t: 'animal', kind: pick(['dog', 'donkey']), at: c, y, rot: r, seed: seed() });
    else if (k < 0.94) L.push({ t: 'handcart', at: c, y, rot: r, seed: seed() });
    else friar(c, y, r, { cloth: 'cloth_brown', cloth2: 'cloth_brown', hair: 'shaven' });
  });
  for (const z of ZS) along([-300, z - 2, 280, z + 2], 9, (c, r) => { const y = height(c[0], c[1]), k = rand(); if (k < 0.35) woman(c, y, r, { carry: pick(['basket', 'pot']) }); else if (k < 0.6) labourer(c, y, r); else if (k < 0.75) child(c, y, r); else if (k < 0.9) L.push({ t: 'animal', kind: pick(['dog', 'cat', 'goat', 'donkey']), at: c, y, rot: r, seed: seed() }); else merchant(c, y, r); });
  // ── the plaza of the Jerónimos: the arrival. Pilgrims, beggars at the portal's steps, friars, candle-sellers, a water-seller, children
  const px = -206;
  for (const [p, r] of [[[px - 5, 52], 3.1], [[px + 4, 56], 2.6], [[px + 8, 49], 3.4], [[px - 12, 60], 1.4]]) friar(p, g + 0.05, r, { pose: pick(['stand', 'talk']) });
  for (const p of [[px - 4.4, 47], [px + 4.6, 47.4], [px - 8, 47.2]]) person(p, g + 0.05, 3.1, { dress: 'robe', cloth: 'cloth_grey', hat: 'none', over: 'none', pose: 'sit_ground', hair: 'long', beard: true });
  for (let k = 0; k < 8; k++) { const p = [px - 16 + k * 4 + rand() * 2, 62 + rand() * 4]; (k % 2 ? woman : merchant)(p, g + 0.05, faceTo([0, -1]) + (rand() - 0.5), { pose: 'stand' }); }   // pilgrims facing the portal
  crowd(26, [PLAZA[0] + 8, 46, PLAZA[2] - 8, 112], g + 0.05, (p, y, r) => { const k = rand(); if (k < 0.2) merchant(p, y, r); else if (k < 0.4) woman(p, y, r, { carry: pick(['basket', 'none', 'none']) }); else if (k < 0.5) noble(p, y, r); else if (k < 0.62) labourer(p, y, r); else if (k < 0.74) child(p, y, r); else if (k < 0.82) friar(p, y, r); else person(p, y, r, { dress: 'robe', hat: 'veil', cloth: 'cloth_black', over: 'shawl', hair: 'bun', pose: 'talk' }); });
  for (const [dx, dz, c] of [[-26, 66, 'cloth_white'], [-12, 76, 'cloth_ochre'], [14, 72, 'cloth_red'], [28, 64, 'cloth_white'], [-40, 82, 'cloth_green'], [34, 84, 'cloth_ochre']]) { L.push({ t: 'stall', at: [px + dx, dz], y: g + 0.04, rot: 0, awning: c, stripe: 'cloth_white', goods: pick([['produce'], ['basket'], ['blue_jar', 'glazed_jar']]), seed: seed() }); person([px + dx, dz - 1.4], g + 0.04, 0, { dress: 'robe', hat: 'veil', over: 'apron', cloth: pick(CL), hair: 'bun' }); }
  L.push({ t: 'well', at: [px - 30, 96], y: g + 0.04, kind: 'windlass', roof: true, mat: 'limestone', square: false });
  for (const [dx, dz] of [[-8, 100], [12, 98]]) { L.push({ t: 'bench', at: [px + dx, dz], y: g + 0.04, rot: 0, len: 2.2, seed: seed() }); woman([px + dx, dz - 0.2], g + 0.04, 0, { pose: 'sit' }); merchant([px + dx + 0.7, dz - 0.2], g + 0.04, 0.3, { pose: 'sit' }); }
  for (const p of [[px - 36, 90], [px + 38, 100], [px - 4, 88]]) L.push({ t: 'chickens', kind: 'pigeon', at: p, y: g + 0.04, rot: rand() * 6, seed: seed(), n: 7 });
  for (const [dx, dz] of [[-20, 104], [24, 108]]) { L.push({ t: 'cart', at: [px + dx, dz], y: g + 0.04, rot: 1.3, kind: 'two', load: 'sacks', beast: 'ox', seed: seed() }); labourer([px + dx + 2.8, dz - 0.4], g + 0.04, 2, { pose: 'stand' }); }
  L.push({ t: 'animal', kind: 'donkey', at: [px + 22, 54], y: g + 0.04, rot: 2, seed: seed() }, { t: 'animal', kind: 'dog', at: [px - 18, 58], y: g + 0.04, rot: 1, seed: seed() }, { t: 'animal', kind: 'dog', at: [px + 6, 90], y: g + 0.04, rot: 3, seed: seed() });
  // ── the Terreiro do Paço: a market of stalls and trestles, porters, merchants talking, soldiers at the palace loggia, a crier
  const [t0, t1, t2, t3] = TERREIRO;
  for (let r = 0; r < 3; r++) for (let k = 0; k < 7; k++) {
    const p = [t0 + 10 + k * 14.5 + (r % 2) * 5, 36 + r * 14];
    L.push({ t: 'stall', at: p, y: g + 0.04, rot: 0, awning: pick(CL), stripe: pick(['cloth_white', 'cloth_ochre']), goods: pick([['produce'], ['basket'], ['blue_jar', 'glazed_jar'], ['cloth'], ['amphora', 'water_pot']]), seed: seed() });
    person([p[0], p[1] - 1.3], g + 0.04, 0, { dress: pick(['robe', 'tunic']), hat: pick(['veil', 'cap']), over: 'apron', cloth: pick(CL), hair: pick(['bun', 'short']) });
    if (rand() < 0.6) { L.push({ t: 'crates', at: [p[0] + 1.8, p[1] + 0.5], y: g + 0.04, rot: 0.2, n: 3, seed: seed() }); }
    if (rand() < 0.6) crowd(1, [p[0] - 1, p[1] + 2.5, p[0] + 2, p[1] + 4], g + 0.04, (q, y, r2) => (rand() < 0.5 ? merchant : woman)(q, y, r2 + 3));
  }
  crowd(30, [t0 + 6, t1 + 6, t2 - 6, t3 - 8], g + 0.04, (p, y, r) => { const k = rand(); if (k < 0.3) merchant(p, y, r); else if (k < 0.5) noble(p, y, r); else if (k < 0.7) woman(p, y, r, { carry: pick(['basket', 'none']) }); else if (k < 0.85) labourer(p, y, r, { carry: 'sack' }); else child(p, y, r); });
  for (const [x, z] of [[(t0 + t2) / 2 - 12, 40], [(t0 + t2) / 2 + 18, 44]]) { merchant([x, z], g + 0.04, 0, { pose: 'talk' }); merchant([x + 0.8, z], g + 0.04, 3.3, { pose: 'talk' }); merchant([x + 0.4, z + 0.8], g + 0.04, 5, { pose: 'talk' }); }
  for (const x of [t0 + 12, t0 + 22, t0 + 32, t0 + 42]) person([x, 30], g + 0.04, 0, { dress: 'tunic', legs: 'hose', cloth: 'cloth_maroon', hat: 'brim', over: 'cape', carry: 'staff', pose: 'staff', beard: false });   // the guard at the palace
  for (let k = 0; k < 4; k++) L.push({ t: 'handcart', at: [t0 + 14 + k * 24, 82], y: g + 0.04, rot: rand() * 6, seed: seed() });
  // ── the quay: bales, barrels, porters with sacks, a cart with its ox, fishwives with baskets, a gang hauling a rope, gulls' fish, dogs
  const qz = QUAY[1] - 1.2;
  for (let x = QUAY[0] + 8; x < QUAY[2] - 8; x += 5 + rand() * 7) {
    const p = [x, qz - rand() * 2.8], k = rand();
    if (!ok(p) || inRect(PLAZA, p[0], p[1])) continue;
    if (k < 0.18) L.push({ t: 'barrel', at: p, y: g + 0.04, rot: 0, n: 3, seed: seed() });
    else if (k < 0.34) L.push({ t: 'sacks', at: p, y: g + 0.04, rot: rand() * 3, n: 5, seed: seed() });
    else if (k < 0.48) L.push({ t: 'crates', at: p, y: g + 0.04, rot: 0, n: 4, seed: seed() });
    else if (k < 0.55) L.push({ t: 'cart', at: p, y: g + 0.04, rot: Math.PI / 2, kind: 'two', load: 'barrels', beast: 'ox', seed: seed() });
    else if (k < 0.68) labourer(p, g + 0.04, rand() * 6.28, { carry: 'sack' });
    else if (k < 0.78) person(p, g + 0.04, rand() * 6.28, { dress: 'tunic', skin: 'skin_dark', cloth: 'cloth_grey', hat: 'none', carry: 'sack', over: 'none' });
    else if (k < 0.88) woman(p, g + 0.04, rand() * 6.28, { carry: 'basket' });
    else person(p, g + 0.04, rand() * 6.28, { dress: 'tunic', legs: 'hose', cloth: pick(['cloth_white', 'cloth_blue']), hat: 'cap', over: 'belt' });
  }
  for (const x of [20, 100, 220]) for (let k = 0; k < 4; k++) person([x + k * 1.1, qz - 1], g + 0.04, 0, { dress: 'tunic', cloth: 'cloth_brown', hat: 'cap', over: 'belt', pose: 'pull', carry: 'rope', hair: 'short' });
  for (const x of [-60, 50, 190]) L.push({ t: 'animal', kind: 'dog', at: [x, qz - 2], y: g + 0.04, rot: rand() * 6, seed: seed() });
  // ── the yard: sawyers, caulkers, a pitch fire with its kettle, rope-makers walking backwards, apprentices, barrels of pitch, tool chests
  crowd(20, [YARD[0] + 8, YARD[1] + 8, YARD[2] - 8, YARD[3] - 12], g + 0.03, (p, y, r) => labourer(p, y, r, { over: 'apron', hat: 'cap', pose: rand() < 0.4 ? 'talk' : 'stand' }));
  for (let k = 0; k < 6; k++) { L.push({ t: 'barrel', at: [YARD[0] + 14 + k * 3.2, YARD[1] + 18], y: g + 0.03, rot: 0, n: 2, seed: seed() }); }
  for (let k = 0; k < 4; k++) { L.push({ t: 'crates', at: [YARD[0] + 20 + k * 22, YARD[1] + 38], y: g + 0.03, rot: 0.3, n: 3, seed: seed() }); }
  for (let k = 0; k < 3; k++) L.push({ t: 'firewood', at: [YARD[0] + 10 + k * 30, YARD[1] + 44], y: g + 0.03, rot: 0, len: 1.6, seed: seed() });
  // ── the beach at Belém: nets drying on poles, fish on racks, fishermen mending, fishwives with baskets, children
  for (let x = -250; x < -105; x += 11 + rand() * 9) {
    const z = shore(x) - 7 - rand() * 4, p = [x, z], y = height(x, z);
    if (!ok(p) || inRect(PLAZA, x, z) && z > PLAZA[3] - 6) continue;
    const k = rand();
    if (k < 0.3) L.push({ t: 'wash_line', at: p, y: y + 1.8, rot: 0, len: 5, pole: true, seed: seed() });
    else if (k < 0.5) L.push({ t: 'drying_tray', at: p, y, rot: rand() * 6, seed: seed() });
    else if (k < 0.7) { labourer(p, y, rand() * 6, { pose: 'sit_low', hat: 'cap' }); L.push({ t: 'basket', at: [x + 0.8, z], y, rot: 0, n: 2, seed: seed() }); }
    else if (k < 0.85) woman(p, y, rand() * 6, { carry: 'basket', over: 'apron' });
    else child(p, y, rand() * 6);
  }
  // ── the water's edge of the quay: a washerwoman at the steps' foot, men fishing with a line from the stones
  for (const x of [-80, 40, 140]) { const p = [x, QUAY[1] - 0.2]; person(p, g + 0.04, 0.0, { dress: 'tunic', cloth: 'cloth_brown', hat: 'brim', over: 'belt', pose: 'sit_low', hair: 'short' }); }
  // tile them
  const tiles = new Map();
  for (const e of L) { const k = `${Math.floor(e.at[0] / 100)},${Math.floor(e.at[1] / 100)}`; if (!tiles.has(k)) tiles.set(k, []); tiles.get(k).push(e); }
  return tiles;
}
void SQUARE; void SHIPS;
