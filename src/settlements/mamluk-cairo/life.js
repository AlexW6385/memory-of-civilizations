// The life of Cairo's streets about 1363 (docs/settlements/mamluk-cairo.md §10): the sellers sitting on their stone
// benches (mastaba) before their shops in the covered market street, buyers before them, porters with sacks on their
// shoulders; water carriers (saqqa) with the goatskin on the back, one leading a camel loaded with water skins;
// donkeys saddled for hire with their boys at the market street's north end and on the Rumayla; a string of camels
// with bales coming down the road from the Citadel; in the open house, the merchant on his iwan and a servant.

import { RADIUS, SUQ, SQUARE, QAA, height } from './layout.js';

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
  // the covered market street (mamluk index.js suq_covered: the shops' fronts at x = SUQ[0] + 5 and SUQ[2] − 5)
  const D = (SUQ[2] - SUQ[0] - 5) / 2, n = Math.floor((SUQ[3] - SUQ[1]) / 3), w = (SUQ[3] - SUQ[1]) / n;
  for (const side of [-1, 1]) for (let i = 0; i < n; i++) {
    const zc = SUQ[1] + (i + 0.5) * w, xf = side < 0 ? SUQ[0] + D : SUQ[2] - D, out = side < 0 ? 1 : -1;
    if (rand() < 0.7) person([xf + out * 0.4, zc + 0.6], out > 0 ? -Math.PI / 2 : Math.PI / 2, { man: true, pose: 'cross', y: 0.7 });
    if (rand() < 0.3) person([xf + out * 1.4, zc], out > 0 ? Math.PI / 2 : -Math.PI / 2);
  }
  const sx = (SUQ[0] + SUQ[2]) / 2;
  for (let k = 0; k < 3; k++) person([sx + (rand() - 0.5) * 2, SUQ[1] + 10 + rand() * (SUQ[3] - SUQ[1] - 20)], rand() < 0.5 ? 0 : Math.PI, { man: true, carry: 'sack', cloth: 'cloth_brown', cloth2: 'cloth_white' });
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
  return L;
}
export const lifePlan = () => ({ id: 'mamluk-cairo-life', style: 'life', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: life(), rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-37, -30], facing: 's' } });
