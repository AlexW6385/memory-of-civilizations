// The town's houses (docs/settlements/cahokia.md §5), four of them opened and furnished (§5.1), and the
// life of the plaza and the yards (§5.2): chunkey played on the plaza's yards with the crowd along
// their banks, people on the ramp up Monks Mound, women at work at the house doors, dogs.
import { RADIUS, PLAZA, lots, height, onMound, inLot } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const face = (from, to) => Math.atan2(-(to[0] - from[0]), -(to[1] - from[1]));     // a figure faces −z when rot = 0
const base = (id, elements, style = 'mississippian') => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-25, -5], facing: 'n' } });
const near = () => lots().map((l, k) => [k, Math.hypot((l.rect[0] + l.rect[2]) / 2 + 25, (l.rect[1] + l.rect[3]) / 2 + 5)]).sort((a, b) => a[1] - b[1]).slice(0, 4).map(([k]) => k);
export async function houses() {
  // the four houses nearest the ramp below Monks Mound are opened and furnished
  const all = lots().map((l) => ({ ...l }));
  for (const k of near()) all[k].open = true;
  const plans = [];
  for (let i = 0; i < all.length; i += 250) plans.push(base(`cahokia-houses-${i / 250}`, all.slice(i, i + 250).map((l) => ({ t: 'miss_house', ...l }))));
  return [...plans, base('cahokia-people', life(), 'life')];
}

/** The people and dogs. Men in the breechcloth, some with a mantle of skin; women in a wrap skirt of woven fibre with a mantle over the shoulders [inferred]. */
function life() {
  const rand = rng(1175), E = [];
  const skin = () => (rand() < 0.7 ? 'skin_medium' : 'skin_dark');
  const man = (at, y, rot, o = {}) => { const sk = skin(), cape = rand() < 0.25; E.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: 'loincloth', cloth: 'hide_tan', cloth2: cape ? 'hide_brown' : 'hide_tan', over: cape ? 'cape' : 'none', skin: sk, hat: 'none', feet: 'shod', hair: rand() < 0.5 ? 'topknot' : 'bun', beard: false, ...o }); };
  const woman = (at, y, rot, o = {}) => E.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: 'wrap', cloth: ['cloth_brown', 'hide_tan', 'cloth_ochre', 'cloth_black'][Math.floor(rand() * 4)], cloth2: 'hide_tan', over: rand() < 0.6 ? 'shawl' : 'none', skin: skin(), hat: 'none', feet: 'shod', hair: 'long', beard: false, ...o });
  // chunkey: at the head of each yard two players with their poles, one stone rolling down it; the crowd along the banks
  for (const [r, axis] of [[[12, 20, 48, 24], 'x'], [[-80, 92, -44, 96], 'x'], [[58, 104, 62, 140], 'z']]) {
    const [x0, z0, x1, z1] = r, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    const head = axis === 'x' ? [x0 + 3, cz] : [cx, z0 + 3], down = axis === 'x' ? [x1, cz] : [cx, z1];
    for (const s of [-0.7, 0.7]) { const at = axis === 'x' ? [head[0], cz + s] : [cx + s, head[1]]; man(at, 0, face(at, down), { carry: 'pole', len: 1.8, pose: 'stand', over: 'none' }); }
    const n = 22;
    for (let k = 0; k < n; k++) {
      const f = 0.05 + 0.9 * k / n + (rand() - 0.5) * 0.02, side = k % 2 ? 1 : -1, off = 2.6 + rand() * 1.2;
      const at = axis === 'x' ? [x0 + (x1 - x0) * f, (side > 0 ? z1 : z0) + side * off] : [(side > 0 ? x1 : x0) + side * off, z0 + (z1 - z0) * f];
      const look = axis === 'x' ? [at[0], cz] : [cx, at[1]];
      (rand() < 0.65 ? man : woman)(at, 0, face(at, look) + (rand() - 0.5) * 0.5, rand() < 0.3 ? { pose: 'squat' } : rand() < 0.3 ? { pose: 'talk' } : {});
    }
  }
  // people on the plaza and on the ramp up the mound
  for (let k = 0; k < 40; k++) {
    const x = PLAZA[0] + 8 + rand() * (PLAZA[2] - PLAZA[0] - 16), z = PLAZA[1] + 8 + rand() * (PLAZA[3] - PLAZA[1] - 16);
    if (E.some((e) => Math.hypot(e.at[0] - x, e.at[1] - z) < 2.5) || Math.hypot(x, z - 55) < 3) continue;
    (rand() < 0.5 ? man : woman)([x, z], 0, rand() * 6.28, rand() < 0.3 ? { carry: 'basket' } : {});
  }
  for (const z of [-44, -52, -61, -70, -112, -125, -138]) { const at = [-25 + (rand() - 0.5) * 3, z]; man(at, height(at[0], at[1]), (rand() < 0.7 ? 0 : Math.PI) + (rand() - 0.5) * 0.3); }
  // at the open houses: a woman at the hearth inside, another at the mortar or the pots by the door
  const L = lots();
  for (const k of near()) {
    const l = L[k], [x0, z0, x1, z1] = l.rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, F = l.y + 0.04;
    const at = [cx - 0.75, cz + 0.6]; woman(at, F, face(at, [cx, cz + 0.15]), { pose: 'kneel', over: 'none' });
    const d = [cx - 1.6, z1 + 1.4]; (rand() < 0.5 ? woman : man)(d, height(d[0], d[1]), face(d, [cx + 3, z1 + 6]), { pose: rand() < 0.5 ? 'squat' : 'stand' });
  }
  // round the other houses, here and there: people at the door, pots, firewood, a dog
  let n = 0;
  for (const l of L) {
    if (n > 140) break;
    const [x0, z0, x1, z1] = l.rect, cx = (x0 + x1) / 2, r = rand();
    if (r > 0.18) continue;
    const at = [x1 + 1.3, (z0 + z1) / 2 + (rand() - 0.5) * 2];
    if (onMound(at[0], at[1]) || inLot(at[0], at[1], 0.8)) continue;
    const y = height(at[0], at[1]); n++;
    const q = rand();
    if (q < 0.35) (rand() < 0.6 ? woman : man)(at, y, rand() * 6.28, rand() < 0.4 ? { pose: 'squat' } : {});
    else if (q < 0.55) E.push({ t: 'pot', kind: 'dark_pot', n: 2 + Math.floor(rand() * 2), at, y, seed: n });
    else if (q < 0.75) E.push({ t: 'firewood', at, y, rot: rand() * 3, len: 1.5, seed: n });
    else if (q < 0.85) E.push({ t: 'basket', n: 2, at, y, seed: n, goods: 'cloth_ochre' });
    else E.push({ t: 'animal', kind: 'dog', at, y, rot: rand() * 6.28, seed: n });
    void cx;
  }
  for (let k = 0; k < 10; k++) { const at = [PLAZA[0] + 10 + rand() * 200, PLAZA[1] + 10 + rand() * 170]; E.push({ t: 'animal', kind: 'dog', at, y: 0, rot: rand() * 6.28, seed: 100 + k }); }
  return E;
}
