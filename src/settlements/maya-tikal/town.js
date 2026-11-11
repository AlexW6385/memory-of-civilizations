// The town round the Great Plaza (docs/settlements/maya-tikal.md §5): the causeways and Temple IV at the end of Tozzer, the two
// reservoirs, the market on the East Plaza, and the patio groups in the forest — a plastered court, a shrine on its east side,
// houses of poles, daub and palm thatch on low rubble platforms round it — with their people; the rites on the temples, a game in
// the ball court, the palace rooms occupied.

import { RADIUS, PLAZA, groups, CAUSEWAYS, CW_H, RESERVOIRS, resDist, T1, T2, T4, BALL, CA } from './layout.js';
import { ground } from './ground.js';
import { SOUTH_RANGE, STEP_PALACE } from './plan.js';
import { frame } from '../../styles/tikal/kit.js';

const base = (id, elements, style = 'tikal') => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-18, 28], facing: 'n' } });
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const face = (dx, dz) => Math.atan2(-dx, -dz);                       // a figure faces −z when rot = 0

function groupElements(g) {
  const [x0, z0, x1, z1] = g.rect, E = [];
  E.push({ t: 'lane', rect: [x0, z0, x1, z1], y: 0.1, mat: 'lime_plaster' });
  for (const h of g.houses) E.push({ t: 'k_house', c: h.c, w: h.w, d: h.d, door: h.door, seed: h.seed, kitchen: h.kitchen });
  // the shrine on the east side: a platform with a small stepped altar on it
  const [sx, sz] = g.shrine;
  E.push({ t: 'block', rect: [sx - 2.2, sz - 2.2, sx + 2.2, sz + 2.2], y0: 0, y1: 1.3, batter: [1.4, 1.4, 1.4, 1.4], mat: 'lime_plaster', collide: false, walk: true });
  E.push({ t: 'block', rect: [sx - 0.9, sz - 0.9, sx + 0.9, sz + 0.9], y0: 1.3, y1: 1.9, batter: [0.2, 0.2, 0.2, 0.2], mat: 'stucco_red', collide: true });
  return E;
}
function groupLife(g, rand, L, P) {
  const [x0, z0] = g.rect;
  for (const h of g.houses) {
    // goods on the platform by the door
    const s = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] }[h.door], hw = h.w / 2 + 0.4, hd = h.d / 2 + 0.4;
    const px = h.c[0] + s[0] * (s[0] ? hw : 0) + (s[0] ? 0 : (rand() - 0.5) * 2.4), pz = h.c[1] + s[1] * (s[1] ? hd : 0) + (s[1] ? 0 : (rand() - 0.5) * 2.4);
    const r = rand();
    if (r < 0.3) L.push({ t: 'pot', kind: rand() < 0.5 ? 'water_pot' : 'dark_pot', n: 1 + Math.floor(rand() * 2), at: [px, pz], y: 0.42, seed: h.seed });
    else if (r < 0.55) L.push({ t: 'basket', n: 1, at: [px, pz], y: 0.42, seed: h.seed, goods: 'cloth_ochre' });
    else if (r < 0.7) L.push({ t: 'firewood', at: [px, pz], y: 0.42, rot: s[0] ? 0 : Math.PI / 2, len: 1.2, seed: h.seed });
    // a person in the patio, by trade
    if (rand() < 0.45) {
      const q = [h.c[0] + s[0] * (hw + 1.8 + rand()) , h.c[1] + s[1] * (hd + 1.8 + rand())];
      P.push(person(rand, q[0], q[1], 0.1, face(-s[0], -s[1]), rand() < 0.65 ? { woman: true, pose: rand() < 0.4 ? 'kneel' : 'stand', over: 'none' } : {}));
    }
  }
  void x0; void z0;
}
function person(rand, x, z, y, rot, o = {}) {
  const woman = o.woman ?? rand() < 0.5, skin = rand() < 0.7 ? 'skin_dark' : 'skin_medium';
  const pick = (a) => a[Math.floor(rand() * a.length)];
  return { t: 'figure', at: [x, z], y, rot, h: woman ? 1.5 : 1.6, seed: Math.floor(rand() * 1e9), dress: woman ? 'robe' : 'loincloth', ...(woman ? {} : { top: 'bare' }), cloth: 'cloth_white', cloth2: pick(['cloth_red', 'cloth_ochre', 'cloth_white', 'cloth_blue']), skin, hat: 'none', hair: woman ? pick(['long', 'bun']) : 'long', hairMat: 'hair_dark', feet: 'bare', legs: 'bare', over: woman ? 'none' : pick(['cape', 'sash', 'none']), pose: 'stand', ...o };
}
const priest = (rand, x, z, y, rot, o = {}) => person(rand, x, z, y, rot, { woman: false, cloth: 'cloth_white', cloth2: 'cloth_red', over: 'cloak', hat: 'cap', hatMat: 'stucco_leaf', ...o });

/** The market on the East Plaza: rows of sellers on palm mats with baskets and pots, buyers between. */
function market() {
  const rand = rng(1500), L = [], M = [], pick = (a) => a[Math.floor(rand() * a.length)], Y = 0.04, X0 = 88, Z0 = 26;
  M.push({ t: 'lane', rect: [84, 22, 140, 64], y: Y, mat: 'lime_plaster' });
  for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) {
    if (rand() < 0.12) continue;
    const x = X0 + c * 8.6 + (rand() - 0.5) * 1.4, z = Z0 + r * 9 + (rand() - 0.5) * 1;
    M.push({ t: 'petate', at: [x, z + 0.4], y: Y, w: 1.9, d: 1.2, rot: (rand() - 0.5) * 0.2 });
    L.push(person(rand, x, z - 0.55, Y, Math.PI, { pose: rand() < 0.6 ? 'squat' : 'sit_ground' }));
    for (let k = 0; k < 3; k++) {
      const at = [x - 0.6 + k * 0.6 + (rand() - 0.5) * 0.1, z + 0.45 + (rand() - 0.5) * 0.3];
      if (rand() < 0.55) L.push({ t: 'basket', at, y: Y + 0.015, seed: Math.floor(rand() * 1e6), goods: pick(['paint_ochre', 'cloth_red', 'pottery_dark', 'cloth_ochre', 'fresco_green']) });
      else L.push({ t: 'pot', kind: pick(['dark_pot', 'water_pot']), at, y: Y + 0.015, seed: Math.floor(rand() * 1e6) });
    }
  }
  for (let k = 0; k < 16; k++) L.push(person(rand, 86 + rand() * 52, 28.5 + Math.floor(rand() * 4) * 9 + (rand() - 0.5) * 2, Y, rand() * 6.28, { carry: pick(['basket', 'pot', 'none', 'none']), pose: rand() < 0.3 ? 'talk' : 'stand' }));
  return [{ ...base('maya-tikal-market', L), style: 'life' }, base('maya-tikal-market-mats', M)];
}

/** The people of the rites and the court: priests on the temples' terraces and on the stairs, crowds on the plaza, a game in the ball court. */
function people() {
  const rand = rng(750), L = [], B = [], pick = (a) => a[Math.floor(rand() * a.length)];
  // Temple I's terrace (34 m): priests before the shrine's door, facing the plaza; others on the stair
  for (const z of [-2.4, 2.4]) L.push(priest(rand, 54.7, z, T1.H, Math.PI / 2, { pose: z < 0 ? 'talk' : 'stand' }));
  for (const z of [-2.4, 2.4]) L.push(priest(rand, -45.2, z, T2.H, -Math.PI / 2, { pose: 'stand' }));
  const stair = (foot, head, H, zc, f, x0, rot) => ({ x: foot + (head - foot) * f + x0, y: H * f, z: zc, rot });
  for (const [f, dz, up] of [[0.18, -1.6, 1], [0.35, 1.7, 0], [0.55, -1.2, 1], [0.8, 1.5, 0]]) { const s = stair(34, 53.6, T1.H, dz, f, 0, up ? -Math.PI / 2 : Math.PI / 2); L.push(person(rand, s.x, s.z, s.y, s.rot, { woman: false })); }
  for (const [f, dz, up] of [[0.3, -2, 1], [0.7, 2.2, 0]]) { const s = stair(-34, -44.3, T2.H, dz, f, 0, up ? Math.PI / 2 : -Math.PI / 2); L.push(person(rand, s.x, s.z, s.y, s.rot, { woman: false })); }
  // the plaza
  const taken = [];
  for (let k = 0; k < 34; k++) {
    const x = -32 + rand() * 64, z = -34 + rand() * 68;
    if ((Math.abs(x) > 26 && Math.abs(z) < 9) || (Math.abs(x) < 7 && Math.abs(z) > 30) || Math.abs(z + 37.5) < 3 || [[-10, -20], [10, -20], [-10, 20], [10, 20]].some(([a, b]) => Math.hypot(a - x, b - z) < 2.5)) continue;
    if (taken.some(([a, b]) => Math.hypot(a - x, b - z) < 1.6)) continue;
    taken.push([x, z]);
    const r = rand();
    if (r < 0.28) L.push(person(rand, x, z, 0.04, rand() * 6.28, { woman: true, carry: pick(['pot', 'basket']) }));
    else if (r < 0.5) { const rot = rand() * 6.28; L.push(person(rand, x, z, 0.04, rot, { pose: 'talk' })); L.push(person(rand, x - Math.sin(rot) * 1.1, z - Math.cos(rot) * 1.1, 0.04, rot + Math.PI, { pose: 'stand' })); }
    else if (r < 0.62) L.push(person(rand, x, z, 0.04, rand() * 6.28, { woman: true, child: true, h: 1.1 }));
    else L.push(person(rand, x, z, 0.04, rand() * 6.28, { carry: pick(['none', 'sack', 'none']) }));
  }
  // before the North Acropolis: the rulers' retinue by the stelae
  for (const x of [-24, 24]) L.push(priest(rand, x, -34.4, 0.04, 0, { pose: 'talk' }));
  // the palaces: a noble on the bench of the south range's middle room, a scribe in the stepped palace's lowest room
  { const F = frame('n', ...SOUTH_RANGE.c), p = F.P(2.6, 1.5); L.push(person(rand, p[0], p[1], CA.H + 0.5, face(0, -1), { woman: false, pose: 'sit', over: 'cape', cloth2: 'cloth_blue' })); }
  { const F = frame('w', ...STEP_PALACE[0].c), p = F.P(3.4, 2.65); L.push(person(rand, p[0], p[1], CA.H + 0.5, face(-1, 0), { woman: false, pose: 'sit', hat: 'cap', hatMat: 'stucco_leaf' })); }
  // the game: two teams in the alley, hip guards and a cap; the ball between them; watchers on the two mounds (3.2 m)
  const [ax0, az0, ax1, az1] = BALL.alley, zc = (az0 + az1) / 2;
  for (const [side, c2] of [[-1, 'cloth_red'], [1, 'cloth_indigo']]) for (let i = 0; i < 3; i++) L.push(person(rand, ax0 + 1.5 + rand() * (ax1 - ax0 - 3), zc + side * (2.5 + i * 4 + rand() * 2), 0.03, side < 0 ? Math.PI : 0, { woman: false, cloth: 'cloth_white', cloth2: c2, over: 'belt', hat: i === 0 ? 'cap' : 'none', hatMat: 'stucco_leaf', pose: i === 1 ? 'kneel' : 'stand' }));
  B.push({ t: 'k_ball', at: [(ax0 + ax1) / 2 + 0.6, zc + 0.8], y: 0.04 });
  for (const [x, rot] of [[ax0 - 3, -Math.PI / 2], [ax1 + 3, Math.PI / 2]]) for (let i = 0; i < 7; i++) L.push(person(rand, x + (rand() - 0.5) * 1.0, az0 + 2 + i * 2.4 + rand(), 3.2, rot, { pose: rand() < 0.5 ? 'sit_ground' : rand() < 0.4 ? 'talk' : 'stand' }));
  return [{ ...base('maya-tikal-people', L), style: 'life' }, base('maya-tikal-ball', B)];
}

export async function town() {
  const plans = [], all = groups();
  const rand = rng(77);
  for (let i = 0; i < all.length; i += 10) {
    const chunk = all.slice(i, i + 10), P = [], L = [];
    for (const g of chunk) groupLife(g, rand, L, P);
    plans.push(base(`maya-tikal-town-${i / 10}`, chunk.flatMap(groupElements)));
    plans.push({ ...base(`maya-tikal-town-life-${i / 10}`, [...L, ...P]), style: 'life' });
  }
  // the causeways, Temple IV at the end of Tozzer
  plans.push(base('maya-tikal-causeways', [...CAUSEWAYS.map((c) => ({ t: 'k_causeway', pts: c.pts, w: c.w, h: CW_H })),
    { t: 'k_pyramid', ...T4, shrine: { chambers: 3, len: 8, comb: 20 } }]));
  // the reservoirs' water
  for (const R of RESERVOIRS) {
    const [cx, cz] = R.c, r = Math.max(R.a, R.b) + 2;
    plans.push({ ...base(`maya-tikal-water-${R.id}`, [{ t: 'water_cells', rect: [cx - r, cz - r, cx + r, cz + r], y: R.water, cell: 1, inside: (x, z) => resDist(R, x, z) < -0.3 && ground.height(x, z) < R.water + 0.3 }]), style: 'ming' });
  }
  plans.push(...market(), ...people());
  void PLAZA;
  return plans;
}
