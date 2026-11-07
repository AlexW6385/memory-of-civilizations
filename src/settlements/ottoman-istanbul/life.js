// The life of the Süleymaniye's quarter about 1560 (docs/settlements/ottoman-istanbul.md §10): the coffee house's
// company — men seated on the benches, two at backgammon, one reading, the coffee-maker at his hearth and a boy
// serving; porters (hamal) with their loads on their backs in the avenues by the shops; water carriers (saka) with
// the waterskin; donkeys bringing firewood to the soup kitchen; horses held at the outer court's gate.

import { RADIUS, height, COFFEE, IMARET, ARASTA, PRECINCT } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

export function life() {
  const rand = rng(1560), L = [], pick = (a) => a[Math.floor(rand() * a.length)];
  const Y = (x, z) => height(x, z) + 0.04;
  /** A man in a long robe (kaftan) with a sash and a white turban, or a woman in her cloak (ferace) and veil. */
  const person = (at, rot, o = {}) => {
    const woman = !o.man && rand() < 0.2;
    L.push({ t: 'figure', at, y: Y(at[0], at[1]), rot, seed: Math.floor(rand() * 1e9), skin: rand() < 0.7 ? 'skin_light' : 'skin_medium', dress: 'robe',
      ...(woman ? { cloth: pick(['cloth_black', 'cloth_indigo', 'cloth_brown']), cloth2: 'cloth_white', hat: 'veil', hair: 'long' }
        : { cloth: pick(['cloth_red', 'cloth_green', 'cloth_indigo', 'cloth_brown', 'cloth_ochre', 'cloth_maroon']), cloth2: pick(['cloth_white', 'cloth_ochre']), over: 'sash', hat: 'turban', hatMat: 'cloth_white', hair: 'short', beard: true }),
      pose: rand() < 0.3 ? 'talk' : 'stand', ...o });
  };
  // the coffee house (kahve.js's frame: front on the east, u along +z, v from the front (+x) to the back (−x))
  const c = COFFEE(), [x0, z0, x1, z1] = c.rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, hw = (z1 - z0) / 2 - 0.2, hd = (x1 - x0) / 2 - 0.2;
  const W = (u, v) => [cx - v, cz + u], fy = c.y + 0.45, seat = fy + 0.55;
  const sit = (u, v, rot, o = {}) => { const p = W(u, v); L.push({ t: 'figure', at: p, y: seat, rot, seed: Math.floor(rand() * 1e9), skin: 'skin_light', dress: 'robe', cloth: pick(['cloth_red', 'cloth_green', 'cloth_indigo', 'cloth_maroon', 'cloth_brown']), cloth2: 'cloth_white', over: 'sash', hat: 'turban', hatMat: 'cloth_white', hair: 'short', beard: true, pose: 'cross', ...o }); };
  // on the back bench (facing the front, +x), on the side benches (facing across)
  sit(-1.4, hd - 0.18 - 0.45, -Math.PI / 2); sit(-0.5, hd - 0.18 - 0.45, -Math.PI / 2); sit(0.6, hd - 0.18 - 0.45, -Math.PI / 2);
  sit(-hw + 0.18 + 0.45, -1.2, Math.PI); sit(-hw + 0.18 + 0.45, 0.2, Math.PI, { arms: 'pray' });
  sit(hw - 0.18 - 0.45, 0.2, 0); sit(hw - 2.35, 0.2, Math.PI, { y: fy + 0.01 });             // the backgammon players either side of the stool
  { const p = W(-hw + 1.0, hd - 1.2); person(p, -Math.PI / 2 + 0.6, { man: true, y: fy, cloth: 'cloth_white', cloth2: 'cloth_brown', over: 'apron' }); }      // the coffee-maker by his hearth
  { const p = W(0.6, -0.4); L.push({ t: 'figure', at: p, y: fy, rot: Math.PI / 2, seed: Math.floor(rand() * 1e9), child: true, skin: 'skin_light', dress: 'robe', cloth: 'cloth_white', cloth2: 'cloth_red', over: 'sash', hat: 'cap', hatMat: 'cloth_red', hair: 'short', pose: 'stand' }); }
  // porters in the avenues before the shops, bent under their loads; buyers at the shops
  for (const sx of [-1, 1]) {
    const xa = sx * 76, xb = sx * (Math.abs(ARASTA.w) - ARASTA.d);
    for (let k = 0; k < 3; k++) { const x = xa + (xb - xa) * (0.3 + rand() * 0.4), z = ARASTA.z0 + rand() * (ARASTA.z1 - ARASTA.z0); person([x, z], rand() < 0.5 ? 0 : Math.PI, { man: true, carry: 'bundle', loadCloth: pick(['sacking', 'cloth_brown', 'cloth_indigo']), cloth: 'cloth_brown', cloth2: 'cloth_white' }); }
    for (let k = 0; k < 5; k++) { const z = ARASTA.z0 + 3 + rand() * (ARASTA.z1 - ARASTA.z0 - 6); person([xb + sx * -1.2, z], sx > 0 ? -Math.PI / 2 : Math.PI / 2); }
  }
  // water carriers with their skins at the outer court's north gate, a woman with her jar
  for (const [x, z] of [[-9, PRECINCT[1] - 4], [10, PRECINCT[1] - 6]]) person([x, z], rand() * 6.28, { man: true, carry: 'bundle', loadCloth: 'hide_brown', cloth: 'cloth_brown', cloth2: 'cloth_white' });
  // firewood for the soup kitchen's ovens: donkeys with panniers and their driver at its gate (on the west, the avenue)
  for (let k = 0; k < 3; k++) L.push({ t: 'animal', kind: 'donkey', at: [IMARET[0] - 3.5, IMARET[1] + 12 + k * 2.4], y: Y(IMARET[0] - 3.5, IMARET[1] + 12 + k * 2.4), rot: Math.PI, seed: Math.floor(rand() * 1e9), gear: true });
  person([IMARET[0] - 4.6, IMARET[1] + 10], Math.PI, { man: true, pose: 'staff', cloth: 'cloth_brown' });
  { const x = IMARET[0] - 2.2, z = IMARET[1] + 18; L.push({ t: 'firewood', at: [x, z], y: Y(x, z), rot: 0, seed: 7 }); }
  // horses held at the outer court's north gate
  for (const x of [-16, -13]) { const z = PRECINCT[1] - 10; L.push({ t: 'animal', kind: 'horse', at: [x, z], y: Y(x, z), rot: 0, seed: Math.floor(rand() * 1e9), gear: true }); person([x + 0.9, z + 0.4], 0, { man: true, cloth: 'cloth_red' }); }
  return L;
}
export const lifePlan = () => ({ id: 'ottoman-istanbul-life', style: 'life', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: life(), rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, -100], facing: 's' } });
