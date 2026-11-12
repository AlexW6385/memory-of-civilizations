// The Dam's own fronts and crowd (docs/settlements/amsterdam.md §5.6, §5.14): the quay streets are dressed by quay.js, but the houses that close
// the Dam (the row on its south side, the Damrak's east row, the row behind the fish benches) and the square itself are dressed here — the
// stoops with their tubs, benches, baskets and casks, a maid scrubbing the step, neighbours in talk — and the square is given its small
// theatre: a quack's stage with its audience, the crier with his staff, the milkmaids with their pails, a beggar at the Weigh House steps,
// halberdiers at the Town Hall's door, children, dogs and pigeons. Explicit, derived from layout.js; a life plan like damLife's.
import { RADIUS, GROUND, DAM, HALL, WAAG, lots, inRect } from './layout.js';
import { faceFrame } from '../../styles/dutch/facade.js';
import { person, rng } from './town.js';

const Y = GROUND + 0.05;
const OUT = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] };
const faceRot = (nx, nz) => Math.atan2(-nx, -nz);
const ARR = [20, -210];

export function damDress() {
  const rand = rng(1672), E = [], P = (k, x, z, rot, ex) => E.push(person(rand, k, [x, z], rot, ex));
  const clear = (x, z) => Math.hypot(x - ARR[0], z - ARR[1]) > 6.5;
  // the fronts round the Dam: every house gets something at its door, and most two
  for (const l of lots()) {
    const [x0, z0, x1, z1] = l.rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    if (!inRect(DAM, cx, cz, 14) || Math.hypot(cx, cz) > RADIUS - 76) continue;
    const F = faceFrame(l.rect, l.front), [nx, nz] = OUT[l.front], w = F.w, ro = faceRot(nx, nz), rs = faceRot(-nx, -nz), at = (u, d) => F.at(u, d);
    const alongRot = Math.atan2(-nz, nx) + Math.PI / 2;
    const put = (e) => { if (clear(e.at[0], e.at[1])) E.push(e); };
    const a = rand();
    if (a < 0.25) put({ t: 'bench', at: at(w * 0.5 + (rand() - 0.5) * 2, 1.6), y: Y, rot: ro, len: 1.7, back: true });
    else if (a < 0.45) put({ t: 'barrel', at: at(w * (0.15 + rand() * 0.7), 1.3), y: Y, n: 2 + (rand() < 0.4 ? 1 : 0), seed: Math.floor(rand() * 1e6), rot: rand() });
    else if (a < 0.62) put({ t: 'basket', at: at(w * (0.2 + rand() * 0.6), 1.2), y: Y, n: 2 + Math.floor(rand() * 2), seed: Math.floor(rand() * 1e6) });
    else if (a < 0.78) put({ t: 'crates', at: at(w * (0.2 + rand() * 0.6), 1.3), y: Y, n: 3, seed: Math.floor(rand() * 1e6), rot: alongRot });
    else put({ t: 'firewood', at: at(w * (0.2 + rand() * 0.6), 1.2), y: Y, rot: alongRot, len: 1.4, seed: Math.floor(rand() * 1e6) });
    if (rand() < 0.5) put({ t: 'pot', kind: ['glazed_jar', 'dark_pot', 'water_pot'][Math.floor(rand() * 3)], at: at(w * (0.12 + rand() * 0.76), 0.9), y: Y, rot: rand() * 6, n: 1 + Math.floor(rand() * 2), seed: Math.floor(rand() * 1e6) });
    const p = rand();
    if (p < 0.22) {                                                    // a maid scrubbing her step, her bucket by her
      const [px, pz] = at(w * (0.3 + rand() * 0.4), 1.5); if (clear(px, pz)) { P('wife', px, pz, rs, { pose: 'squat' }); put({ t: 'barrel', at: at(w * 0.5 + 0.7, 1.4), y: Y, n: 1, seed: Math.floor(rand() * 1e6), rot: 0 }); }
    } else if (p < 0.42) {                                             // neighbours in talk at the door
      const [px, pz] = at(w * (0.2 + rand() * 0.6), 2.2), a0 = rand() * 6.28;
      for (let q = 0; q < 2; q++) { const dx = Math.cos(a0 + q * Math.PI) * 0.55, dz = Math.sin(a0 + q * Math.PI) * 0.55; if (clear(px + dx, pz + dz)) P(q ? 'wife' : rand() < 0.5 ? 'lady' : 'burgher', px + dx, pz + dz, Math.atan2(-dx, -dz) + Math.PI, { pose: q ? 'stand' : 'talk' }); }
    } else if (p < 0.5) {                                              // a child with a hoop of wood, at its play before the door
      const [px, pz] = at(w * (0.2 + rand() * 0.6), 3.0); if (clear(px, pz)) P('worker', px, pz, rand() * 6.28, { child: true });
    } else if (p < 0.58) {                                             // the old man on his bench
      const [px, pz] = at(w * 0.5, 1.5); if (clear(px, pz)) P('burgher', px, pz, ro, { pose: 'sit' });
    }
  }

  // the quack on his stage (the Dam's mountebanks sold their salves from a platform of casks and planks), his audience in a ring
  { const sx = 8, sz = -236;
    E.push({ t: 'crates', at: [sx - 0.375, sz], y: Y, n: 2, seed: 73, rot: 0 }, { t: 'barrel', at: [sx + 1.6, sz + 0.2], y: Y, n: 2, seed: 71, rot: 0.4 });
    P('burgher', sx - 0.375, sz, Math.PI, { pose: 'talk', y: Y + 0.55, hat: 'brim', cloth: 'cloth_red' });
    for (let k = 0; k < 8; k++) { const a = Math.PI * (0.15 + k / 7 * 0.7) + Math.PI, d = 2.6 + (k % 3) * 0.7, px = sx + Math.cos(a) * d, pz = sz + 0.3 - Math.sin(a) * d; P(['burgher', 'wife', 'worker', 'lady', 'worker'][k % 5], px, pz, Math.atan2(sx - px, sz - pz) + Math.PI, { pose: k % 4 === 1 ? 'talk' : 'stand' }); }
  }
  // the crier with his staff reading a proclamation before the Town Hall's door, a few listening
  P('burgher', -24.5, -226, -Math.PI / 2, { carry: 'staff', hat: 'brim', cloth: 'cloth_black' });
  for (const [x, z] of [[-21, -228], [-21.5, -224.6], [-19.6, -226.4], [-18.2, -229.2], [-18.8, -223.2]]) P(rand() < 0.4 ? 'wife' : 'worker', x, z, Math.atan2(-24.5 - x, -226 - z) + Math.PI, { pose: rand() < 0.3 ? 'talk' : 'stand' });
  // the halberdiers of the watch at the Town Hall's door (the vestibule's doors are in its east front)
  for (const z of [-239.5, -227.5]) P('burgher', HALL[2] + 2.6, z, Math.PI / 2, { carry: 'staff', hat: 'brim', cloth: 'cloth_brown', cloth2: 'cloth_red' });
  // the beggar on the Weigh House's steps, a boy with a basket of oranges, the knife-grinder's barrow
  P('worker', WAAG[2] + 1.6, WAAG[3] + 0.8, Math.PI * 0.9, { pose: 'sit_ground', hat: 'cap' });
  P('worker', 9, -213.5, 0.9, { child: true, carry: 'basket' });
  E.push({ t: 'barrow', at: [-12.5, -212.5], y: Y, rot: 0.5, seed: 12 }); P('worker', -13.8, -213.2, 1.6, { pose: 'stand', hat: 'cap' });
  // milkmaids with their pails on the yoke, women with baskets on their way to the Damrak
  for (const [x, z, r] of [[-3, -218, 1.2], [31, -239, -2.0], [-16, -243, 0.4]]) P('wife', x, z, r, { carry: 'pails' });
  for (const [x, z, r] of [[1.5, -245, 3.0], [22, -229, 2.4], [35, -226, -1.0], [-26, -216, 1.4]]) P('wife', x, z, r, { carry: 'basket' });
  // burghers in pairs strolling, a boy and his dog, dogs lying in the sun
  for (const [x, z, r] of [[-6, -231, 1.6], [12, -239, -1.3], [27, -219, 3.1], [-2, -214, 0.2], [-19, -245, 2.2]]) { P('burgher', x, z, r, { pose: 'talk' }); P(rand() < 0.5 ? 'lady' : 'wife', x + Math.sin(r + 2) * 1.1, z + Math.cos(r + 2) * 1.1, r + Math.PI * 0.9, { pose: 'talk' }); }
  E.push({ t: 'animal', kind: 'dog', at: [10.5, -214.4], y: Y, rot: 4.2, seed: 91 }, { t: 'animal', kind: 'dog', at: [-26, -236], y: Y, rot: 0.9, seed: 92 }, { t: 'animal', kind: 'cat', at: [-18.6, -203.8], y: Y, rot: 3.1, seed: 93, pose: 'sit' });
  // the pigeons of the Dam, about the Weigh House and the Town Hall's steps
  for (const [x, z] of [[-5, -233], [-26, -216], [15, -222], [26, -233], [-14, -222], [34, -214], [3, -240]]) E.push({ t: 'chickens', kind: 'pigeon', n: 8 + Math.floor(rand() * 6), at: [x, z], y: Y, seed: Math.floor(x * 13 - z) });
  return [{ id: 'amsterdam-dam-dress', style: 'life', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: E, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [20, -207], facing: 'n' }, center: [5, -235], near: 230 }];
}
