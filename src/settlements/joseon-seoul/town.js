// Hanyang's hanok quarters round the palace (docs/settlements/joseon-seoul.md §5), and the court in
// session (§11): the officials standing in their ranks at the rank stones of the throne court — the
// civil officials on the east, the military on the west, the first four ranks in the red court robe
// (jobok) with the gilt coronet, the lower ranks in the black robe (dallyeong) with the black hat —
// and the guards at Gwanghwamun and Geunjeongmun with their spears, in black felt hats.
import { RADIUS, lots } from './layout.js';
const base = (id, elements) => ({ id, style: 'joseon', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 70], facing: 'n' } });
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

function court() {
  const rand = rng(1430), L = [];
  const skin = () => (rand() < 0.6 ? 'skin_light' : 'skin_medium');
  // the rank stones stand at x = ±7.5, z = 59 + 2.25 i (plan.js), the first rank nearest the hall;
  // the officials of each rank in a short row behind (outside) their stone, facing the throne
  for (let i = 0; i < 12; i++) for (const sx of [-1, 1]) {
    const high = i < 4, z = 59 + i * 2.25, n = high ? 2 : 3;
    for (let k = 0; k < n; k++) {
      if (!high && rand() < 0.2) continue;
      L.push({ t: 'figure', at: [sx * (8.6 + k * 1.05), z + (rand() - 0.5) * 0.15], y: 0.04, rot: (rand() - 0.5) * 0.08, seed: Math.floor(rand() * 1e9),
        dress: 'robe', cloth: high ? 'cloth_red' : 'cloth_black', cloth2: high ? 'cloth_indigo' : 'cloth_black', skin: skin(), hat: 'cap', hatMat: high ? 'gilt_bronze' : 'lacquer_black',
        over: 'belt', arms: 'clasp', beard: rand() < 0.6, h: 1.62 + rand() * 0.1 });
    }
  }
  // the guards: two by two at the gates, spears grounded
  const guard = (x, z, rot) => L.push({ t: 'figure', at: [x, z], y: 0.04, rot, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: 'cloth_indigo', cloth2: 'cloth_red', skin: skin(),
    hat: 'brim', hatMat: 'cloth_black', pose: 'staff', carry: 'staff', len: 2.6, staffMat: 'timber', over: 'belt', h: 1.66 + rand() * 0.08 });
  for (const sx of [-1, 1]) {
    guard(sx * 4.2, 97.5, Math.PI); guard(sx * 6.0, 97.5, Math.PI); // before Geunjeongmun, facing south
    guard(sx * 10.5, 246, Math.PI); guard(sx * 5.2, 246, Math.PI);   // before Gwanghwamun, facing the avenue
  }
  return { ...base('joseon-seoul-court', L), style: 'life', center: [0, 150], near: 300 };
}

export async function town() {
  const all = lots(), plans = [];
  for (let i = 0; i < all.length; i += 80) plans.push(base(`joseon-seoul-hanok-${i / 80}`, all.slice(i, i + 80).map((l) => ({ t: 'hanok', ...l, simple: true }))));
  plans.push(court());
  return plans;
}
