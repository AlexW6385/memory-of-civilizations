// The life of the Campus Martius under Hadrian (docs/settlements/rome.md §10): street vendors with their stalls and
// trays along the Via Lata (bread, vegetables, pots, cloth), a litter carried by six bearers along the street north of
// the Pantheon with an attendant walking before it, citizens in the toga and people in tunics in the street and the
// forecourt; the keeper behind his counter in the thermopolium of the house by the forecourt, a customer at it.

import { VIA_LATA, INN, inn2, FULLER, height, riverEdge, riverX, rows, STADIUM, SAEPTA, BATHS, FORUM } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
export const DOMUS = [-36, -208, -17.9, -189.4];
export const LITTER = { at: [-92, -175], rot: Math.PI / 2 };                // going east along the street

export function life() {
  const rand = rng(128), L = [], seed = () => Math.floor(rand() * 1e9);
  const togate = (at, rot, o = {}) => L.push({ t: 'figure', at, y: o.y ?? height(at[0], at[1]), rot, seed: seed(), skin: 'skin_light', dress: 'robe', cloth: 'cloth_white', cloth2: 'cloth_white', over: 'cloak', hair: 'short', beard: rand() < 0.5 ? 1 : 0, hat: 'none', pose: 'stand', ...o });
  const tunic = (at, rot, o = {}) => L.push({ t: 'figure', at, y: o.y ?? height(at[0], at[1]), rot, seed: seed(), skin: rand() < 0.7 ? 'skin_light' : 'skin_medium', dress: 'tunic', legs: 'bare',
    cloth: ['cloth_brown', 'cloth_ochre', 'linen', 'cloth_red', 'cloth_grey'][Math.floor(rand() * 5)], over: 'belt', hair: 'short', beard: rand() < 0.4 ? 1 : 0, hat: 'none', pose: 'stand', ...o });
  const woman = (at, rot, o = {}) => L.push({ t: 'figure', at, y: o.y ?? height(at[0], at[1]), rot, seed: seed(), skin: 'skin_light', dress: 'robe', cloth: ['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_green'][Math.floor(rand() * 4)], cloth2: 'cloth_white', over: 'shawl', hair: 'bun', hat: rand() < 0.5 ? 'veil' : 'none', pose: 'stand', ...o });
  // the Via Lata: stalls on both sides of the street, the vendor behind each, buyers before it
  const GOODS = [['bread', 'baskets'], ['greens', 'heap'], ['pottery', 'pot:amphora'], ['bolts', 'bolts'], ['fish', 'baskets']];
  for (let z = -330; z < 330; z += 14 + rand() * 18) {
    for (const side of [-1, 1]) {
      if (rand() < 0.4) continue;
      const x = VIA_LATA.x + side * (VIA_LATA.w / 2 - 1.0), face = side > 0 ? -Math.PI / 2 : Math.PI / 2, g = GOODS[Math.floor(rand() * GOODS.length)];
      L.push({ t: 'stall', at: [x, z], y: height(x, z), rot: face + Math.PI, seed: seed(), w: 2.0, d: 0.9, awning: ['cloth_white', 'cloth_ochre', 'cloth_red'][Math.floor(rand() * 3)], goods: g });
      tunic([x + side * 0.9, z + (rand() - 0.5)], face + Math.PI, { pose: rand() < 0.4 ? 'sit' : 'stand' });
      if (rand() < 0.6) (rand() < 0.5 ? woman : togate)([x - side * 1.4, z + (rand() - 0.5) * 1.5], face);
    }
    // people walking the street, now and then a donkey with its load
    const x = VIA_LATA.x + (rand() - 0.5) * 4;
    if (rand() < 0.15) { L.push({ t: 'animal', kind: 'donkey', at: [x, z + 6], y: height(x, z + 6), rot: rand() < 0.5 ? 0 : Math.PI, seed: seed(), gear: true }); tunic([x + 0.8, z + 7.2], 0, { carry: 'staff' }); }
    else (rand() < 0.4 ? togate : rand() < 0.5 ? woman : tunic)([x, z + 7], rand() < 0.5 ? 0 : Math.PI, { pose: rand() < 0.3 ? 'talk' : 'stand' });
  }
  // the litter: six bearers, three under each pole, the pole on the right shoulder; an attendant clearing the way
  {
    const [cx, cz] = LITTER.at, a = LITTER.rot, f = [-Math.sin(a), -Math.cos(a)], r = [Math.cos(a), -Math.sin(a)];   // forward (the figure's −z), right
    const P = (u, v) => [cx + r[0] * u + f[0] * v, cz + r[1] * u + f[1] * v];
    for (const pole of [-0.55, 0.55]) for (const v of [1.75, -1.75, 0]) {
      if (v === 0) continue;
      tunic(P(pole - 0.2, v), a, { y: height(cx, cz), h: 1.72, pose: 'stand', arms: 'sack', cloth: 'cloth_red', skin: 'skin_medium', beard: 0 });
    }
    for (const pole of [-0.55, 0.55]) tunic(P(pole - 0.2, 2.35), a, { y: height(cx, cz), h: 1.72, pose: 'stand', arms: 'sack', cloth: 'cloth_red', skin: 'skin_dark', beard: 0 });
    tunic(P(0, 4.6), a, { y: height(cx, cz), carry: 'staff', cloth: 'cloth_white' });
  }
  // the street north of the Pantheon and its forecourt: a few citizens and passers-by
  for (let k = 0; k < 18; k++) {
    const x = -170 + rand() * 330, z = -178 + rand() * 6;
    if (Math.abs(x - LITTER.at[0]) < 6) continue;
    (rand() < 0.35 ? togate : rand() < 0.5 ? woman : tunic)([x, z], rand() < 0.5 ? Math.PI / 2 : -Math.PI / 2, { pose: rand() < 0.3 ? 'talk' : 'stand' });
  }
  // the forecourt: knots of citizens and a few passers-by at 12-60 m from where the visitor arrives (0, -120), none within 12 m
  for (let k = 0, n = 0; n < 16 && k < 200; k++) {
    const x = -34 + rand() * 68, z = -146 + rand() * 80, d = Math.hypot(x, z + 120);
    if (d < 12) continue;
    n++;
    const f = rand();
    (f < 0.5 ? togate : f < 0.75 ? woman : tunic)([x, z], rand() * 6.28, { pose: rand() < 0.5 ? 'talk' : 'stand' });
    if (rand() < 0.5) togate([x + 1.1, z + 0.4], rand() * 6.28, { pose: 'talk' });
  }
  // the thermopolium: the keeper behind the counter, a customer before it with a cup
  const [X0, , , Z1] = DOMUS;
  tunic([X0 + 0.6 + 1.6, Z1 - 0.6 - 2.3], Math.PI, { y: 0, cloth: 'cloth_brown' });
  tunic([X0 + 0.6 + 2.0, Z1 - 0.6 - 0.7], 0, { y: 0, pose: 'talk' });
  // before the shops of the rows: keepers and buyers talking on the footway, a dog or a cat on a threshold, children
  for (const r of rows()) {
    const [x0, z0, x1, z1] = r.rect, f = r.front, W = f === 'e' || f === 'w' ? z1 - z0 : x1 - x0, nb = Math.max(2, Math.round(W / 4.4)), bw = W / nb;
    const rot = f === 'e' ? -Math.PI / 2 : f === 'w' ? Math.PI / 2 : f === 's' ? Math.PI : 0;
    const P = (u, d) => f === 'e' ? [x1 - d, z0 + u] : f === 'w' ? [x0 + d, z0 + u] : f === 's' ? [x0 + u, z1 - d] : [x0 + u, z0 + d];
    for (let i = 0; i < nb; i++) {
      const uc = (i + 0.5) * bw, q = rand();
      if (q < 0.34) { const p = P(uc + (rand() - 0.5) * 1.2, -1.25); tunic(p, rot, { pose: 'stand', cloth: 'cloth_brown' }); const p2 = P(uc + (rand() < 0.5 ? -0.9 : 0.9), -1.9); (rand() < 0.5 ? woman : rand() < 0.5 ? togate : tunic)(p2, rot + Math.PI + (rand() - 0.5) * 0.8, { pose: 'talk' }); }
      else if (q < 0.5) { const p = P(uc + 1.0, -0.9); L.push({ t: 'animal', kind: rand() < 0.6 ? 'dog' : 'cat', at: p, y: 0, rot: rot + (rand() - 0.5), seed: seed() }); }
      else if (q < 0.6) { const p = P(uc - 1.0, -1.6); tunic(p, rot + 1.0 + rand(), { h: 1.2, pose: 'stand', cloth: 'linen' }); }
    }
  }
  // the forecourt's dressing: benches between the columns of the side porticoes, pigeons on the paving, a garland seller and a
  // votive stall near the steps, a water seller's cart; all 14 m or more from the arrival (0, -120) and clear of its view
  {
    for (const sx of [-1, 1]) for (let z = -138; z < -60; z += 11.5) {
      L.push({ t: 'bench', at: [sx * 37.4, z], y: 0, rot: sx > 0 ? -Math.PI / 2 : Math.PI / 2, seed: seed(), len: 1.8 });
      if (rand() < 0.45) tunic([sx * 36.4, z + 1.6], sx > 0 ? Math.PI / 2 : -Math.PI / 2, { pose: 'sit' });
      if (rand() < 0.35) L.push({ t: 'pot', kind: 'amphora', at: [sx * 38.4, z + 4], y: 0, rot: 0, n: 2, seed: seed() });
    }
    for (const [x, z] of [[-9, -96], [12, -84], [-18, -112], [24, -104], [-26, -78], [6, -134]]) L.push({ t: 'chickens', kind: 'pigeon', n: 5, at: [x, z], y: 0, rot: rand() * 6.28, seed: seed() });
    for (const [x, z, g, aw] of [[-27, -72, ['heap', 'greens'], 'cloth_green'], [27, -72, ['baskets', 'bread'], 'cloth_ochre'], [-30, -122, ['pottery', 'pot:amphora'], 'cloth_red']]) {
      L.push({ t: 'stall', at: [x, z], y: 0, rot: x < 0 ? Math.PI / 2 : -Math.PI / 2, seed: seed(), w: 2.2, d: 0.9, awning: aw, goods: g });
      tunic([x + (x < 0 ? 1.0 : -1.0), z], x < 0 ? -Math.PI / 2 : Math.PI / 2, { pose: 'stand' });
      woman([x + (x < 0 ? -1.4 : 1.4), z + 0.6], x < 0 ? Math.PI / 2 : -Math.PI / 2, { pose: 'talk', carry: 'basket' });
    }
    L.push({ t: 'handcart', at: [21, -128], y: 0, rot: 0.4, seed: seed() }); tunic([22.8, -126.8], -2, { carry: 'staff' });
    L.push({ t: 'barrel', at: [-23, -132], y: 0, rot: 0, seed: seed(), n: 3 });
  }
  // before the shops of the rows: amphorae, barrels, crates and firewood at the doors, a lamp in the street at each second row
  for (const r of rows()) {
    const [x0, z0, x1, z1] = r.rect, f = r.front, W = f === 'e' || f === 'w' ? z1 - z0 : x1 - x0, nb = Math.max(2, Math.round(W / 4.4)), bw = W / nb;
    const rot = f === 'e' ? -Math.PI / 2 : f === 'w' ? Math.PI / 2 : f === 's' ? Math.PI : 0;
    const P = (u, d) => f === 'e' ? [x1 - d, z0 + u] : f === 'w' ? [x0 + d, z0 + u] : f === 's' ? [x0 + u, z1 - d] : [x0 + u, z0 + d];
    for (let i = 0; i < nb; i++) {
      const q = rand(), uc = (i + 0.5) * bw;
      if (q < 0.22) L.push({ t: 'pot', kind: 'amphora', at: P(uc - 1.4, -0.7), y: 0, rot: 0, n: 3, seed: seed() });
      else if (q < 0.36) L.push({ t: 'barrel', at: P(uc - 1.3, -0.7), y: 0, rot, seed: seed(), n: 2 });
      else if (q < 0.48) L.push({ t: 'crates', at: P(uc + 1.4, -0.7), y: 0, rot, seed: seed(), n: 2 });
      else if (q < 0.58) L.push({ t: 'firewood', at: P(uc - 1.4, -0.8), y: 0, rot, seed: seed(), len: 1.2 });
      else if (q < 0.66) L.push({ t: 'basket', at: P(uc + 1.4, -0.7), y: 0, rot, n: 2, seed: seed(), goods: 'cloth_green' });
    }
  }
  // the stadium: spectators on the tiers (the games are not on; a few hundred would be too many: forty about the near end), runners on the track
  {
    const [x0, z0, x1, z1] = STADIUM, t = 28, rows_ = 14, pod = 2.2, T2 = 18, ax0 = x0 + t, ax1 = x1 - t, sd = t - 5.4, rowTop = (i) => pod + (T2 - pod) * (i + 1) / rows_;
    for (let k = 0; k < 44; k++) {
      const i = 2 + Math.floor(rand() * 11), west = rand() < 0.5, oM = sd * (i + 0.5) / rows_, z = z0 + t + 25 + rand() * 120, x = west ? ax0 - oM : ax1 + oM;
      (rand() < 0.4 ? togate : rand() < 0.5 ? woman : tunic)([x, z], west ? -Math.PI / 2 : Math.PI / 2, { y: rowTop(i), pose: 'sit' });
    }
    const mx = (ax0 + ax1) / 2;
    for (let k = 0; k < 6; k++) tunic([mx - 8 + k * 3.2, z1 - t - 12 - (k % 2) * 3], 0, { y: 0, cloth: 'linen', pose: k % 3 === 0 ? 'talk' : 'stand', arms: 'hang' });
  }
  // the Saepta: buyers and sellers in the court, the dealers before the shops under the portico
  {
    const mx = (SAEPTA[0] + SAEPTA[2]) / 2;
    for (let k = 0; k < 26; k++) { const z = SAEPTA[1] + 14 + rand() * 292, x = mx + (rand() - 0.5) * 26; (rand() < 0.45 ? togate : rand() < 0.5 ? woman : tunic)([x, z], rand() * 6.28, { y: 0.03, pose: rand() < 0.4 ? 'talk' : 'stand' }); }
    for (let z = SAEPTA[1] + 40; z < SAEPTA[3] - 30; z += 52) { L.push({ t: 'stall', at: [mx + 12, z], y: 0.03, rot: Math.PI / 2, seed: seed(), w: 2.4, d: 1.0, awning: ['cloth_white', 'cloth_ochre', 'cloth_red'][Math.floor(rand() * 3)], goods: GOODS[Math.floor(rand() * GOODS.length)] }); tunic([mx + 13.2, z], Math.PI / 2, { y: 0.03, pose: 'sit' }); }
  }
  // the baths: bathers (in a wrap of linen) in the palaestrae and on the benches of the frigidarium, a strigil-bearing slave
  {
    const cx = (BATHS[0] + BATHS[2]) / 2, mz = (BATHS[1] + BATHS[3]) / 2;
    for (let k = 0; k < 12; k++) { const west = k % 2, x = cx + (west ? -1 : 1) * (38 + rand() * 24), z = mz + (rand() - 0.5) * 60; tunic([x, z], rand() * 6.28, { y: 0.02, cloth: 'linen', pose: rand() < 0.5 ? 'talk' : 'stand' }); }
    for (let k = 0; k < 9; k++) { const x = cx + (rand() - 0.5) * 40, z = BATHS[1] + 14 + rand() * 20; tunic([x, z], rand() * 6.28, { y: 0.04, cloth: 'linen', pose: k % 3 ? 'stand' : 'sit' }); }
    for (let k = 0; k < 5; k++) tunic([cx - 10 + k * 5, BATHS[1] + 80 + rand() * 5], rand() * 6.28, { y: 0.04, cloth: 'linen', pose: 'stand' });
  }
  // the forum: citizens in knots before the temple and the rostrum, a boy with a dog, an orator
  {
    const [fx0, fz0, fx1, fz1] = FORUM, my = (fz0 + fz1) / 2;
    for (let k = 0; k < 14; k++) togate([fx1 - 30 + rand() * 20, my + (rand() - 0.5) * 26], Math.PI / 2 + (rand() - 0.5) * 0.8, { pose: rand() < 0.5 ? 'talk' : 'stand' });
    togate([fx1 - 22, my], Math.PI / 2, { y: 2.0, pose: 'talk', h: 1.78 });
    for (let k = 0; k < 6; k++) tunic([fx0 + 30 + rand() * 40, fz0 + 12 + rand() * 60], rand() * 6.28, { pose: 'stand' });
    L.push({ t: 'animal', kind: 'dog', at: [fx0 + 50, my + 5], y: 0, rot: 1.0, seed: seed() });
  }
  // the inn: the keeper behind the counter, drinkers at the tables, the groom with a donkey in the stable, a guest in the court
  for (const IR of [INN, inn2()?.rect]) if (IR) {
    const W = (r, u, d) => [r[0] + u, r[3] - d], A = (r, u, d, rot, o = {}) => ({ at: W(r, u, d), rot, y: 0, ...o });
    const t = (o, f = tunic) => f(o.at, o.rot, o);
    t(A(IR, 2.4, 4.2, -Math.PI / 2, { cloth: 'cloth_brown', arms: 'hang' }));
    t(A(IR, 5.9, 5.0, Math.PI, { pose: 'sit' })); t(A(IR, 4.1, 5.0, 0, { pose: 'sit' }));
    t(A(IR, 6.9, 7.0, Math.PI, { pose: 'sit' })); t(A(IR, 4.4, 7.7, Math.PI / 2, { pose: 'sit' }), woman);
    t(A(IR, 7.9, 3.3, Math.PI / 2, { pose: 'talk' }), togate); t(A(IR, 6.1, 3.3, -Math.PI / 2, { pose: 'sit' }));
    L.push({ t: 'animal', kind: 'donkey', at: W(IR, 13.4, 1.8), y: 0, rot: Math.PI / 2, seed: seed(), gear: true });
    L.push({ t: 'animal', kind: 'donkey', at: W(IR, 13.4, 5.6), y: 0, rot: Math.PI / 2, seed: seed(), gear: false });
    t(A(IR, 15.5, 3.4, 0, { carry: 'basket', arms: 'hang', cloth: 'cloth_grey' }));
    t(A(IR, 8.8, 11.0, 0, { pose: 'talk' }), woman); t(A(IR, 10.8, 12.2, Math.PI, { pose: 'stand' }));
    L.push({ t: 'chickens', at: W(IR, 5.0, 11.4), y: 0, rot: 0, seed: seed() });
  }
  // the fuller's: the workmen treading cloth in the vats (hitched up tunics, hands on the rim), the master at the counter, a boy with the cloth
  {
    const W = (r, u, d) => [r[0] + u, r[3] - d];
    for (let r = 0; r < 2; r++) for (let k = 0; k < 3; k++) if ((r + k) % 3 !== 2) tunic(W(FULLER, 2.2 + k * 2.2, 8.0 + r * 3.6), (r + k) * 1.7, { y: 0.63, cloth: 'cloth_grey', arms: 'hang' });
    tunic(W(FULLER, 3.4, 0.8), 0, { y: 0, cloth: 'cloth_brown' }); togate(W(FULLER, 3.6, -1.3), Math.PI, { y: 0, pose: 'talk' });
    tunic(W(FULLER, FULLER[2] - FULLER[0] - 6.0, 10.0), -Math.PI / 2, { y: 0, carry: 'basket', arms: 'hang', cloth: 'cloth_ochre', h: 1.2 });
    woman(W(FULLER, 14.5, 13.0), 1.0, { y: 0, carry: 'basket', arms: 'hang' });
  }
  // the Tiber: barges moored along the quay with their cargo of amphorae and sacks and a boatman, a fisherman in a skiff and
  // a man poling a barge up the stream, washerwomen kneeling at the landings, porters carrying amphorae along the quay, crane hands
  {
    const E = riverEdge(1), lev = -5, QY = 0.06;
    const tan = (i) => { const a = E[Math.max(0, i - 1)], b = E[Math.min(E.length - 1, i + 1)]; return Math.atan2(b[0] - a[0], b[1] - a[1]); };
    for (const i of [2, 7, 12, 17, 26, 30]) {
      if (!E[i]) continue;
      const rot = tan(i) + Math.PI, at = [E[i][0] - 2.3, E[i][1]], deck = lev + 0.5;
      L.push({ t: 'boat', kind: 'barge', at, y: lev, rot, len: 11 + (i % 3) });
      L.push({ t: 'pot', kind: 'amphora', at: [at[0] - 0.3, at[1] - 1.5], y: deck, rot: 0, n: 7, seed: seed() }, { t: 'pot', kind: 'amphora', at: [at[0] + 0.3, at[1] + 1.8], y: deck, rot: 0, n: 6, seed: seed() });
      L.push({ t: 'sacks', at: [at[0], at[1] + 0.2], y: deck, rot: Math.PI / 2, n: 5, seed: seed() });
      tunic([at[0] + 0.5, at[1] + 4.2], rot, { y: deck, carry: 'staff', arms: 'punt', cloth: 'cloth_grey' });
    }
    for (const i of [5, 15, 22]) if (E[i]) {      // fishermen in skiffs out on the water
      const at = [E[i][0] - 9 - (i % 4), E[i][1]], rot = tan(i) + (i % 2) * Math.PI;
      L.push({ t: 'boat', kind: i % 2 ? 'canoe' : 'rowboat', at, y: lev, rot });
      tunic([at[0], at[1] - 0.2], rot, { y: lev + 0.25, pose: 'sit', cloth: 'cloth_brown' });
    }
    for (const i of [4, 14, 24]) if (E[i]) {      // laundresses on their knees at the foot of the landing
      for (let k = 0; k < 2; k++) {
        const at = [E[i][0] - 2.5, E[i][1] + (k ? 1.2 : -1.2)];
        woman(at, -Math.PI / 2, { y: QY - 1.5, pose: 'kneel' });
        L.push({ t: 'basket', at: [at[0] + 0.9, at[1]], y: QY - 0.9, rot: 0, n: 1, seed: seed(), goods: 'cloth_white' });
      }
    }
    for (let k = 0; k < 14; k++) {                // porters with amphorae along the quay, hands at the cranes
      const i = 1 + Math.floor(rand() * (E.length - 2)); if (!E[i]) continue;
      tunic([E[i][0] + 3 + rand() * 6, E[i][1] + (rand() - 0.5) * 6], rand() * 6.28, { y: QY, carry: 'sack', arms: 'sack', pose: rand() < 0.3 ? 'talk' : 'stand' });
    }
    for (const i of [9, 20]) if (E[i]) { for (const dz of [-1.5, 1.5]) tunic([E[i][0] + 5.5 - 0.5, E[i][1] + dz * 0.5], -Math.PI / 2, { y: QY, cloth: 'cloth_ochre' }); L.push({ t: 'animal', kind: 'donkey', at: [E[i][0] + 9, E[i][1] + 3], y: QY, rot: 1.2, seed: seed(), gear: true }); }
    void riverX;
  }
  return L;
}

export const lifePlan = () => ({ id: 'rome-life', style: 'life', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: life(), rooms: [], bounds: [-420, -420, 420, 420], entrance: { at: [0, -200], facing: 's' } });
