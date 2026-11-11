// The town of Delphi (docs/settlements/delphi.md §4.5, §8): the houses of the Delphians on their terraces west and east of the
// sanctuary, and the people of the oracle: pilgrims and consultants on the Sacred Way, the priests and the Pythia's escort at the
// temple, the goat for the sacrifice, the washers at the Castalian spring, the sellers at the gate, athletes in the stadium.
import { RADIUS, lots, height, pathAt, WAY, WAY2, TT_Y, TEMPLE, ALTAR, SPRING, STADIUM, STADIUM_Y, FC, FC_Y, THEATRE, TREASURIES, STOA, TT, inRect } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
const base = (id, style, elements) => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [98, 134], facing: 'n' } });
const face = (dx, dz) => Math.atan2(-dx, -dz);                      // a figure faces −z when rot = 0
const wayAt = (P, s) => { let acc = 0; for (let i = 0; i + 1 < P.length; i++) { const L = Math.hypot(P[i + 1][0] - P[i][0], P[i + 1][1] - P[i][1]); if (acc + L >= s) { const t = (s - acc) / L; return [P[i][0] + (P[i + 1][0] - P[i][0]) * t, P[i][1] + (P[i + 1][1] - P[i][1]) * t, Math.atan2(P[i + 1][0] - P[i][0], P[i + 1][1] - P[i][1])]; } acc += L; } return P[P.length - 1].concat(0); };

export async function town() {
  const all = lots(), plans = [];
  const near = (r) => pathAt((r[0] + r[2]) / 2, (r[1] + r[3]) / 2, WAY)[0] < 50 || inRect(FC, (r[0] + r[2]) / 2, (r[1] + r[3]) / 2, 40);
  for (let i = 0; i < all.length; i += 40) plans.push(base(`delphi-houses-${i / 40}`, 'delphi', all.slice(i, i + 40).map((l) => ({ t: 'greek_house', simple: true, near: near(l.rect), ...l }))));
  const rand = rng(400), L = [], seed = () => Math.floor(rand() * 1e9);
  const citizen = (at, rot, o = {}) => L.push({ t: 'figure', at, y: o.y ?? height(at[0], at[1]), rot, seed: seed(), skin: 'skin_medium', dress: 'robe', cloth: ['cloth_white', 'linen', 'cloth_ochre'][Math.floor(rand() * 3)], cloth2: ['cloth_white', 'cloth_brown', 'cloth_indigo', 'cloth_red'][Math.floor(rand() * 4)], over: 'cloak', hair: 'short', beard: 1, hat: rand() < 0.25 ? 'brim' : 'none', pose: 'stand', ...o });
  const worker = (at, rot, o = {}) => L.push({ t: 'figure', at, y: o.y ?? height(at[0], at[1]), rot, seed: seed(), skin: 'skin_medium', dress: 'tunic', legs: 'bare', cloth: ['cloth_brown', 'cloth_grey', 'linen', 'cloth_ochre'][Math.floor(rand() * 4)], over: 'belt', hair: 'short', beard: 0.5, hat: rand() < 0.2 ? 'cap' : 'none', feet: 'bare', pose: 'stand', ...o });
  const woman = (at, rot, o = {}) => L.push({ t: 'figure', at, y: o.y ?? height(at[0], at[1]), rot, seed: seed(), skin: 'skin_light', dress: 'robe', cloth: ['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_white'][Math.floor(rand() * 4)], cloth2: 'cloth_white', over: 'shawl', hair: 'bun', hat: rand() < 0.5 ? 'veil' : 'none', pose: 'stand', ...o });
  const priest = (at, rot, o = {}) => L.push({ t: 'figure', at, y: o.y ?? height(at[0], at[1]), rot, seed: seed(), skin: 'skin_medium', dress: 'robe', cloth: 'cloth_white', cloth2: 'cloth_white', over: 'cloak', hair: 'short', beard: 1, hat: 'none', pose: 'stand', ...o });
  // pilgrims climbing the Sacred Way in twos and threes, some with a goat on a cord, one leading a donkey with the gifts
  const WL = 464;
  for (let k = 0; k < 40; k++) {
    const s = 12 + rand() * 330, [x, z, yaw] = wayAt(WAY, s), off = (rand() < 0.5 ? -1 : 1) * (2.6 + rand() * 0.8), nx = Math.cos(yaw), nz = -Math.sin(yaw);
    const at = [x + nx * off, z + nz * off], r = rand(), rot = yaw + Math.PI + (rand() - 0.5) * 0.5;
    if (pathAt(at[0], at[1], WAY)[0] < 2.4 || TREASURIES.some((t) => inRect(t.rect, at[0], at[1], 2.5)) || inRect(STOA, at[0], at[1], 2.5) || inRect(TT, at[0], at[1], 1)) continue;
    if (r < 0.4) citizen(at, rot, { carry: rand() < 0.4 ? 'staff' : 'none' });
    else if (r < 0.6) woman(at, rot, { carry: 'none' });
    else if (r < 0.8) { citizen(at, rot, { pose: 'talk' }); const b = [at[0] + Math.sin(rot) * -1.1, at[1] + Math.cos(rot) * -1.1]; citizen(b, face(at[0] - b[0], at[1] - b[1]), { pose: 'talk' }); }
    else { worker(at, rot, { carry: 'staff' }); L.push({ t: 'animal', kind: 'goat', at: [at[0] - Math.sin(rot) * 1.3, at[1] - Math.cos(rot) * 1.3], y: height(at[0], at[1]), rot, seed: k }); }
  }
  void WL;
  { const [x, z, yaw] = wayAt(WAY, 190), ox = x + Math.cos(yaw) * 3.2, oz = z - Math.sin(yaw) * 3.2; L.push({ t: 'animal', kind: 'donkey', at: [ox, oz], y: height(ox, oz), rot: yaw + Math.PI, seed: 5, gear: true }); worker([ox + Math.sin(yaw) * 1.4, oz + Math.cos(yaw) * 1.4], yaw + Math.PI, { carry: 'staff' }); }
  // the terrace: the priests in white before the altar of the Chians, the sacrifice's goat, a consultant praying, others waiting by the temple steps
  { const [ax, az] = ALTAR.c;
    priest([ax - 4.4, az - 0.9], Math.PI / 2 * -1 - 0, { y: TT_Y, pose: 'stand', hat: 'none' });
    priest([ax - 4.2, az + 1.2], -Math.PI / 2, { y: TT_Y, pose: 'talk' });
    L.push({ t: 'animal', kind: 'goat', at: [ax - 5.4, az + 0.2], y: TT_Y, rot: Math.PI / 2, seed: 77 });
    citizen([ax - 6.3, az - 1.3], -Math.PI / 2, { y: TT_Y, pose: 'pray', cloth: 'cloth_ochre' });
    for (let k = 0; k < 7; k++) citizen([ax + 5 + rand() * 7, az - 6 + rand() * 12], face(-1, 0) + (rand() - 0.5), { y: TT_Y, pose: rand() < 0.5 ? 'talk' : 'stand' });
    // the Pythia's escort at the temple's steps: a veiled woman in purple between two priests
    woman([TEMPLE.X + 5.8, TEMPLE.cz + 4.5], Math.PI / 2, { y: TT_Y, cloth: 'cloth_maroon', cloth2: 'cloth_maroon', hat: 'veil' });
    priest([TEMPLE.X + 5.8, TEMPLE.cz + 3.3], Math.PI / 2, { y: TT_Y }); priest([TEMPLE.X + 5.8, TEMPLE.cz + 5.7], Math.PI / 2, { y: TT_Y });
    // inside: a priest at the hearth, a consultant waiting in the cella
    priest([-0.4, TEMPLE.cz + 1.6], Math.PI * 0.75, { y: TT_Y + 1.55 });
    citizen([6.2, TEMPLE.cz + 0.4], Math.PI / 2, { y: TT_Y + 1.55, pose: 'pray' });
    // in the adyton: the Pythia on her tripod? no: she is shown standing at the omphalos, veiled, a laurel bough in her hand
    woman([-18.9, TEMPLE.cz - 3.4], -Math.PI / 2, { y: TT_Y + 0.45, cloth: 'cloth_maroon', cloth2: 'cloth_maroon', hat: 'veil' });
  }
  // the spring: women and men washing and drinking at the basin, a girl with a hydria going up
  { const [x0, z0, x1, z1] = SPRING;
    for (let k = 0; k < 4; k++) woman([x0 - 1.0, z0 + 3 + k * 3.2], Math.PI / 2 * 1, { y: height(x0 - 1, z0 + 3), carry: k === 2 ? 'pot' : 'none' });
    citizen([x0 - 4, 0], Math.PI / 2, { pose: 'talk' }); citizen([x0 - 5.2, 0.8], -Math.PI / 2, { pose: 'talk' });
    worker([x0 - 7, -5], 0, { carry: 'pot' });
    void x1; void z1; }
  // the gate: the sellers at their stalls, buyers, a boy
  [[101.9, 113.2], [101.9, 120.2], [90.2, 117.2], [90.2, 124.2], [107.7, 125.2]].forEach(([x, z], i) => { worker([x, z + 1.0], face(0, 1), { y: FC_Y, beard: 0.9 }); if (i < 4) citizen([x + (i % 2 ? -1.2 : 1.2), z + 2.6], face(0, -1), { y: FC_Y, pose: 'talk' }); });
  for (let k = 0; k < 6; k++) citizen([100 + rand() * 40, 112 + rand() * 18], rand() * 6.28, { y: FC_Y });
  L.push({ t: 'animal', kind: 'donkey', at: [118, 124], y: FC_Y, rot: 1.0, seed: 9, gear: true });
  // the stadium: runners on the track, a trainer with his staff, the judge on his stone seat
  { const [x0, z0, x1, z1] = STADIUM;
    for (let k = 0; k < 4; k++) L.push({ t: 'figure', at: [x1 - 4 - k * 0.3, z0 + 4 + k * 4.5], y: STADIUM_Y, rot: face(-1, 0), seed: seed(), skin: 'skin_medium', dress: 'loincloth', cloth: 'linen', hair: 'short', beard: 0, hat: 'none', feet: 'bare', pose: 'stand' });
    citizen([x1 - 12, (z0 + z1) / 2 - 5], face(1, 0), { y: STADIUM_Y, carry: 'staff', cloth: 'cloth_white' });
    citizen([x1 - 40.5, z0 + 0.1], face(0, 1), { y: STADIUM_Y + 0.9, pose: 'sit', cloth: 'cloth_white' });
    for (let k = 0; k < 5; k++) citizen([x0 + 10 + rand() * 90, z0 - 1.5 - rand() * 3], face(0, 1), { pose: rand() < 0.5 ? 'sit_ground' : 'stand' }); }
  // the theatre's benches: a few on the earth bank
  { const [cx, cz] = THEATRE.c;
    for (let k = 0; k < 6; k++) { const d = 8 + rand() * 12, a = (rand() - 0.5) * 1.8, x = cx + Math.sin(a) * d, z = cz - Math.cos(a) * d; citizen([x, z], face(cx - x, cz - z), { y: height(x, z) + 0.4, pose: 'sit_low' }); } }
  // goats on the slope above the village, a goatherd
  for (let k = 0; k < 6; k++) { const x = -150 + rand() * 40, z = 20 + rand() * 60; L.push({ t: 'animal', kind: 'goat', at: [x, z], y: height(x, z), rot: rand() * 6.28, seed: 40 + k }); }
  worker([-140, 50], 1, { carry: 'staff' });
  plans.push({ ...base('delphi-life', 'life', L), rooms: [] });
  void WAY2;
  return plans;
}
