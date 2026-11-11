// The life of Cairo's streets about 1363 (docs/settlements/mamluk-cairo.md §10): the sellers sitting on their stone
// benches (mastaba) before their shops in the covered market street, buyers before them, porters with sacks on their
// shoulders; water carriers (saqqa) with the goatskin on the back, one leading a camel loaded with water skins;
// donkeys saddled for hire with their boys at the market street's north end and on the Rumayla; a string of camels
// with bales coming down the road from the Citadel; in the open house, the merchant on his iwan and a servant.

import { RADIUS, SUQ, SUQ2, SUQ3, SQUARE, QAA, SHOP, STALLS, KHAN, HAMMAM, BAYN, height, shops, lanes, yards, lots } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

export function life() {
  const rand = rng(1363), L = [], pick = (a) => a[Math.floor(rand() * a.length)];
  const Y = (x, z) => height(x, z) + 0.04;
  /** A man in a long robe (jubba) with a turban, the sleeves wide, or a woman wrapped in her black or white izar and veiled. */
  const person = (at, rot, o = {}) => {
    const woman = !o.man && rand() < 0.2;
    L.push({ t: 'figure', at, y: o.y ?? Y(at[0], at[1]), rot, seed: Math.floor(rand() * 1e9), skin: rand() < 0.6 ? 'skin_medium' : 'skin_dark', dress: 'robe',
      ...(woman ? { cloth: pick(['cloth_black', 'cloth_white', 'cloth_indigo']), cloth2: 'cloth_white', hat: 'veil', hair: 'long' }
        : { cloth: pick(['cloth_white', 'cloth_indigo', 'cloth_brown', 'cloth_ochre', 'cloth_white', 'cloth_green']), cloth2: pick(['cloth_white', 'cloth_ochre']), over: 'sash', hat: 'turban', hatMat: pick(['cloth_white', 'cloth_white', 'cloth_indigo']), hair: 'short', beard: true }),
      pose: rand() < 0.3 ? 'talk' : 'stand', ...o });
  };
  // the covered market streets (mamluk index.js suq_covered: the shops' fronts at x = S[0] + 5 and S[2] − 5): the khan's two as well
  for (const S of [SUQ, SUQ2, SUQ3]) {
    const D = (S[2] - S[0] - 5) / 2, n = Math.floor((S[3] - S[1]) / 3), w = (S[3] - S[1]) / n;
    for (const side of [-1, 1]) for (let i = 0; i < n; i++) {
      const zc = S[1] + (i + 0.5) * w, xf = side < 0 ? S[0] + D : S[2] - D, out = side < 0 ? 1 : -1;
      if (rand() < 0.7) person([xf + out * 0.4, zc + 0.6], out > 0 ? -Math.PI / 2 : Math.PI / 2, { man: true, pose: 'cross', y: 0.7 });
      if (rand() < 0.3) person([xf + out * 1.4, zc], out > 0 ? Math.PI / 2 : -Math.PI / 2);
    }
    const sx = (S[0] + S[2]) / 2;
    for (let k = 0; k < 3; k++) person([sx + (rand() - 0.5) * 2, S[1] + 10 + rand() * (S[3] - S[1] - 20)], rand() < 0.5 ? 0 : Math.PI, { man: true, carry: 'sack', cloth: 'cloth_brown', cloth2: 'cloth_white' });
  }
  const sx = (SUQ[0] + SUQ[2]) / 2;
  // water carriers with the goatskin on the back (Lane: "in an earthen vessel, or a goat's skin, on the back")
  for (const [x, z] of [[sx + 1.2, SUQ[1] + 30], [sx - 1, SUQ[3] - 25], [SQUARE[0] + 6, -40], [-60, QAA[3] + 3.5]]) person([x, z], rand() * 6.28, { man: true, carry: 'bundle', loadCloth: 'hide_brown', cloth: 'cloth_brown', cloth2: 'cloth_white' });
  // a camel loaded with water skins, its driver, on the square
  { const x = SQUARE[0] + 12, z = -20; L.push({ t: 'animal', kind: 'camel', at: [x, z], y: Y(x, z), rot: Math.PI / 2, seed: 41, gear: true }); person([x + 0.8, z - 1.6], Math.PI / 2, { man: true, pose: 'staff', cloth: 'cloth_brown' }); }
  // donkeys saddled for hire, their boys, at the market street's north gate and on the square
  for (const [x, z, r] of [[sx + 3.5, SUQ[1] - 5, 0.3], [sx + 5.2, SUQ[1] - 4.2, -0.2], [SQUARE[0] + 8, 60, 1.5], [SQUARE[0] + 8, 62.4, 1.6]]) { L.push({ t: 'animal', kind: 'donkey', at: [x, z], y: Y(x, z), rot: r, seed: Math.floor(rand() * 1e9), gear: true }); if (rand() < 0.7) person([x + 0.7, z + 0.5], r, { man: true, child: rand() < 0.5, cloth: 'cloth_indigo', cloth2: 'cloth_white', hat: 'cap', hatMat: 'cloth_white' }); }
  // a string of camels with bales on the square below the Citadel's road
  for (let k = 0; k < 4; k++) { const x = SQUARE[2] - 12 - k * 2.6, z = SQUARE[3] - 18 - k * 1.2; L.push({ t: 'animal', kind: 'camel', at: [x, z], y: Y(x, z), rot: -Math.PI / 2 + 0.4, seed: Math.floor(rand() * 1e9), gear: true }); }
  person([SQUARE[2] - 9.5, SQUARE[3] - 17], -Math.PI / 2 + 0.4, { man: true, pose: 'staff', cloth: 'cloth_brown' });
  // the open house: the merchant seated on the west iwan's bench, his servant in the court by the well
  { const [x0, z0, x1] = QAA; person([x0 + 4.3, z0 + 3.4], -Math.PI / 2, { man: true, pose: 'cross', y: 0.6 + 0.32 + 0.1, cloth: 'cloth_green', cloth2: 'cloth_white' }); person([x0 + 6.5, z0 + 9.5], 0, { man: true, cloth: 'cloth_white' }); void x1; }
  // the Bayn al-Qasrayn (docs §12): a scholar seated on the bench at Qalawun's portal, talk before the complexes, a water
  // carrier, a donkey with its boy, porters crossing, a mamluk in his tall cap with a staff
  const faceTo = (dx, dz) => -Math.atan2(dx, dz);
  person([-173.55, -216.5 - 3.4], faceTo(1, 0), { man: true, pose: 'cross', y: 0.55, cloth: 'cloth_white', cloth2: 'cloth_white', hatMat: 'cloth_white' });
  person([-172.8, -216.5 + 3.4], faceTo(1, 0), { man: true, pose: 'cross', y: 0.55 });
  for (const [x, z, r] of [[-168, -222, 1.6], [-167.2, -220.8, -1.4], [-163, -260, 0.3], [-161.7, -258.6, 3.4], [-150, -250, 1.0], [-148.8, -251.3, 4.2]]) person([x, z], r, { man: true, pose: 'talk' });
  person([-160, -205], 0.2, { man: true, carry: 'bundle', loadCloth: 'hide_brown', cloth: 'cloth_brown', cloth2: 'cloth_white' });
  person([-157, -300], Math.PI, { man: true, pose: 'staff', cloth: 'cloth_red', cloth2: 'cloth_ochre', hatMat: 'cloth_red' });
  { const x = -149, z = -196; L.push({ t: 'animal', kind: 'donkey', at: [x, z], y: Y(x, z), rot: 1.1, seed: 77, gear: true }); person([x + 0.8, z + 0.6], 1.1, { man: true, child: true, cloth: 'cloth_indigo', cloth2: 'cloth_white', hat: 'cap', hatMat: 'cloth_white' }); }
  // the sherbet and fuqqa' sellers behind their counters, a customer drinking
  for (const s2 of STALLS) { const [x, z] = s2.at, dx = s2.face === 'e' ? 1 : s2.face === 'w' ? -1 : 0, dz = s2.face === 's' ? 1 : s2.face === 'n' ? -1 : 0; person([x - dx * 0.3 + (dz ? 0.4 : 0), z - dz * 0.3 + (dx ? 0.4 : 0)], faceTo(dx, dz), { man: true, cloth: 'cloth_white', cloth2: 'cloth_red', over: 'sash' }); person([x + dx * 1.3, z + dz * 1.3 + (dx ? -0.3 : 0)], faceTo(-dx, -dz), { man: true }); }
  // the khan's court: kneeling camels with their bales, the merchants, the camel-driver, a donkey
  { const c = [KHAN[0] + 22, (KHAN[1] + KHAN[3]) / 2];
    for (const [dx, dz, r] of [[-6, 0, 0.3], [6, 1, 2.9], [0, 8, 1.6]]) { const x = c[0] + dx, z = c[1] + dz; L.push({ t: 'animal', kind: 'camel', at: [x, z], y: Y(x, z), rot: r, seed: Math.floor(rand() * 1e9), gear: true }); }
    L.push({ t: 'animal', kind: 'donkey', at: [c[0] - 7, c[1] + 6], y: Y(c[0] - 7, c[1] + 6), rot: 0.8, seed: 79, gear: true });
    person([c[0] - 3, c[1] + 3], 2.4, { man: true, pose: 'talk', cloth: 'cloth_green', cloth2: 'cloth_white' }); person([c[0] - 4.2, c[1] + 2.4], -0.7, { man: true, cloth: 'cloth_indigo' });
    person([c[0] + 4, c[1] - 3], 0.3, { man: true, pose: 'staff', cloth: 'cloth_brown' }); person([c[0] + 2, c[1] + 6], 1.0, { man: true, carry: 'sack', cloth: 'cloth_brown', cloth2: 'cloth_white' }); }
  // the shop: the merchant on his mat behind the counter, a customer before it
  { const x1 = SHOP[2], z0 = SHOP[1], Ls = SHOP[3] - SHOP[1]; person([x1 - 4.5, z0 + Ls / 2 - 1.4], faceTo(1, 0), { man: true, pose: 'cross', y: 0.2 + 0.01 + 0.12, cloth: 'cloth_ochre', cloth2: 'cloth_white' }); person([x1 - 1.3, z0 + Ls / 2 + 1.9], faceTo(-1, 0), { man: true, cloth: 'cloth_indigo' }); }
  // the bath: the attendant on the maslakh's platform, a bather wrapped in towels by the fountain, the masseur in the hot room
  { const [X0, Z0] = HAMMAM; person([X0 + 1.5, Z0 + 6], faceTo(1, 0), { man: true, pose: 'cross', y: 0.55, cloth: 'cloth_white', cloth2: 'cloth_blue' }); person([X0 + 6.5, Z0 + 11], faceTo(0, -1), { man: true, cloth: 'cloth_blue', cloth2: 'cloth_white', hat: 'turban', hatMat: 'cloth_blue' });
    person([X0 + 18, Z0 + 12.4], faceTo(1, 0), { man: true, cloth: 'cloth_white', cloth2: 'cloth_blue', hat: 'turban', hatMat: 'cloth_white' }); }
  // the market streets' shop fronts (cairo_shopfront): the seller cross-legged on a mastaba, now and then a buyer before him
  { const dirs = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] }, { fronts, open } = shops(), pr = rng(4242);
    const at = (l, u, d) => { const [x0, z0, x1, z1] = l.rect, f = l.front, v = -d; return f === 's' ? [x1 - u, z1 - v] : f === 'n' ? [x0 + u, z0 + v] : f === 'e' ? [x1 - v, z0 + u] : [x0 + v, z1 - u]; };
    for (const l of fronts) {
      if (open.includes(l) || pr() < 0.25) continue;
      const Lw = l.front === 'n' || l.front === 's' ? l.rect[2] - l.rect[0] : l.rect[3] - l.rect[1], c0 = Lw > 7 ? 1.6 : 0.3, N = Math.max(2, Math.floor((Lw - c0 - 0.3) / 2.8)), cw = (Lw - c0 - 0.3) / N, [dx, dz] = dirs[l.front];
      const i = Math.floor(pr() * N), u = c0 + (i + 0.5) * cw, [x, z] = at(l, u, 0.1);
      person([x, z], faceTo(dx, dz), { man: true, pose: 'cross', y: 0.58 + 0.01, cloth: pick(['cloth_white', 'cloth_ochre', 'cloth_brown', 'cloth_green']) });
      if (pr() < 0.35) { const j = (i + 1) % N, [bx, bz] = at(l, c0 + (j + 0.5) * cw, -1.4); person([bx, bz], faceTo(-dx, -dz), pr() < 0.3 ? { pose: 'talk' } : {}); }
    }
    for (const l of open) { const [x, z] = at(l, (l.front === 'n' || l.front === 's' ? l.rect[2] - l.rect[0] : l.rect[3] - l.rect[1]) / 2 - 1.4, -4.2); person([x, z], faceTo(dx0(l), dz0(l)), { man: true, pose: 'cross', y: 0.2 + 0.01 + 0.12, cloth: pick(['cloth_ochre', 'cloth_white', 'cloth_green']) }); const [bx, bz] = at(l, (l.front === 'n' || l.front === 's' ? l.rect[2] - l.rect[0] : l.rect[3] - l.rect[1]) / 2 + 1.0, -1.4); person([bx, bz], faceTo(-dx0(l), -dz0(l)), {}); }
    function dx0(l) { return dirs[l.front][0]; } function dz0(l) { return dirs[l.front][1]; }
  }
  // the lanes: neighbours talking at the doors, children at play, a donkey with its boy, a woman with a jar on her head, a porter
  { const ln = lanes().filter((l) => l.kind === 'lane'), lr = rng(777);
    for (const l of ln) for (let x = l.r[0] + 10; x < l.r[2] - 10; x += 22 + lr() * 26) {
      const z = (l.r[1] + l.r[3]) / 2 + (lr() - 0.5) * 1.6, k = lr();
      if (Math.hypot(x, z) > 330) continue;
      if (k < 0.35) { person([x, z], lr() * 6.28, { pose: 'talk' }); person([x + 0.9, z + 0.4], lr() * 6.28, { pose: 'talk' }); }
      else if (k < 0.6) { for (let c = 0; c < 2; c++) person([x + c * 1.1, z + (c ? 0.5 : -0.3)], lr() * 6.28, { man: true, child: true, cloth: pick(['cloth_white', 'cloth_ochre', 'cloth_brown']), cloth2: 'cloth_white', hat: 'cap', hatMat: 'cloth_white' }); }
      else if (k < 0.8) { L.push({ t: 'animal', kind: 'donkey', at: [x, z], y: Y(x, z), rot: lr() * 6.28, seed: Math.floor(lr() * 1e9), gear: true }); person([x + 0.8, z + 0.5], 0.5, { man: true, child: lr() < 0.5, cloth: 'cloth_indigo', cloth2: 'cloth_white', hat: 'cap', hatMat: 'cloth_white' }); }
      else person([x, z], lr() * 6.28, { man: true, carry: 'sack', cloth: 'cloth_brown', cloth2: 'cloth_white' });
    }
    // the yards: a donkey under the shed, the keeper by the well
    let n = 0; for (const r of yards()) { if (n++ % 3 || Math.hypot(r[0], r[1]) > 300) continue; const x = r[0] + (r[2] - r[0]) * 0.72, z = r[1] + (r[3] - r[1]) * 0.6; L.push({ t: 'animal', kind: n % 2 ? 'donkey' : 'goat', at: [x, z], y: Y(x, z), rot: lr() * 6.28, seed: Math.floor(lr() * 1e9) }); }
  }
  // the Rumayla: horse-copers and buyers, a man with a hawk, children at the trough, more camels kneeling in the fodder
  for (const [x, z] of [[128, -50], [132, -54], [148, 70], [152, 74], [104, -60]]) person([x, z], rand() * 6.28, { man: true, pose: 'talk' });
  for (const [x, z, r] of [[160, -58, 0.5], [163, -26, 2.5], [101, 94, 4]]) L.push({ t: 'animal', kind: 'camel', at: [x - 3, z + 2], y: Y(x, z), rot: r, seed: Math.floor(rand() * 1e9), gear: true });
  void BAYN; void lots;
  return L;
}
export const lifePlan = () => ({ id: 'mamluk-cairo-life', style: 'life', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: life(), rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-37, -30], facing: 's' } });
