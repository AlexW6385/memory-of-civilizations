// The Haram al-Sharif furnished (docs/settlements/jerusalem.md §1d, §10b): the paved walks from the platform's
// stairs to the gates and the Aqsa, cistern heads, the Aqsa's minbar, lamps, Qur'an stands and prayer mats; and
// the life of the esplanade and platform: attendants sweeping, circles round a reader, pilgrims at prayer,
// gatekeepers at the gates, worshippers at the Aqsa's rows. Pure data.

import { HARAM, AQSA, HGATES, height } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const T = HARAM.top, PY = T + 4, FY = T + 0.05;
const [hx0, hz0, hx1, hz1] = HARAM.rect;
/** The Dome's platform in world coordinates (the Dome stands at z = −20; its platform 140 × 120 m, 4 m above the esplanade). */
export const PLATFORM = [-70, -80, 70, 40];
const inPlat = (x, z, m = 0) => x > PLATFORM[0] + m && x < PLATFORM[2] - m && z > PLATFORM[1] + m && z < PLATFORM[3] - m;

/** The Aqsa's aisle centres and the dome bay (as hypostyle lays them out): aisles[i] is an x, width(i) its width. */
export function aqsaLayout() {
  const [x0, z0, x1, z1] = AQSA, Tw = 1.4, zi0 = z0 + Tw, zi1 = z1 - Tw, nb = Math.round((zi1 - zi0) / 4.9), b = (zi1 - zi0) / nb, cw = 2 * b;
  const sw = (x1 - x0 - 2 * Tw - cw) / 10, cx = (x0 + x1) / 2, list = [{ x: cx, w: cw }];
  for (let k = 0; k < 5; k++) for (const s of [-1, 1]) list.push({ x: cx + s * (cw / 2 + k * sw + sw / 2), w: sw });
  list.sort((p, q) => p.x - q.x);
  return { zi0, zi1, zb: zi1 - cw, b, cw, sw, cx, aisles: list.map((l) => l.x), width: (i) => list[i].w };
}

/** The islamic plan's elements: walks, kerbs, cisterns, mats, minbar, lamps. */
/** The paved walks' rectangles (planting keeps off them). */
export const WALKS = [];
export function haramFurnish() {
  WALKS.length = 0;
  const E = [], rand = rng(731);
  const walkR = (r) => WALKS.push(r);
  const walk = (r, mat = 'flagstone', dy = 0) => { if (!dy) walkR(r); E.push({ t: 'floor', rect: r, y: T + 0.02 + dy, mat, th: 0.3 }); };
  const edge = (r) => E.push({ t: 'block', rect: r, y0: T - 0.2, y1: T + 0.05, mat: 'limestone_carved', collide: false });
  const strip = (r, horiz) => { walk(r); if (horiz) { edge([r[0], r[1] - 0.25, r[2], r[1]]); edge([r[0], r[3], r[2], r[3] + 0.25]); } else { edge([r[0] - 0.25, r[1], r[0], r[3]]); edge([r[2], r[1], r[2] + 0.25, r[3]]); } };
  // the walks: west from the platform's west stair to the gate's stair head, round to the gate; south to the Aqsa; east to the Golden Gate
  strip([hx0 + 0.5, -23, -77.5, -17], true);
  strip([-123, -17, -117, 4], false); strip([hx0 + 0.5, -3, -117, 3], true);
  strip([-3.5, 47.5, 3.5, 96], false);
  strip([77.5, -23, hx1 - 3, -17], true);
  strip([hx1 - 33, -38, hx1 - 3, -32], true); strip([hx1 - 33, -32, hx1 - 27, -23], false);
  strip([-3.5, -87.5 - 40, 3.5, -87.5], false);
  // the court before the Aqsa's north façade: a wide pavement of flags in bands of marble
  walk([-46, 96, 46, AQSA[1]], 'flagstone'); walk([-44, 98, 44, 100.4], 'marble_floor', 0.01); walk([-44, 113.6, 44, 116], 'marble_floor', 0.01);
  for (const x of [-30, -15, 15, 30]) walk([x - 0.5, 100.4, x + 0.5, 113.6], 'marble_floor', 0.01);
  // cisterns (the esplanade's old cisterns under the paving): a round head and its lid, set on the paving, a trough by it
  for (const [x, z] of [[-95, 70], [100, 60], [-100, -140], [85, -150], [-60, 150], [120, 150], [110, -80]]) E.push({ t: 'cistern_head', at: [x, z], y: T });
  // the Aqsa's furniture: the minbar by the mihrab on its right (west), Qur'an stands at the columns, lamps over the aisles, mats in rows
  const A = aqsaLayout();
  E.push({ t: 'minbar', at: [A.cx - 3.4, A.zi1 - 0.2 - 3.6], dir: [0, 1], y: FY, steps: 8, L: 3.6, W: 1.0 });
  for (const [i, ax] of A.aisles.entries()) {
    const wd = A.width(i), nave = Math.abs(ax - A.cx) < 0.1;
    // rows of mats down each aisle: a mat for every worshipper, a hand's breadth apart, the rows facing south
    const x0 = ax - wd / 2 + 1.2, x1 = ax + wd / 2 - 1.2, nx = Math.max(2, Math.floor((x1 - x0) / 0.85));
    for (let r = 0; r < 7; r++) {
      const z = (nave ? A.zi0 + 3 : A.zi0 + 4) + r * 2.3;
      if (z > A.zb - 2 && nave) break;
      for (let k = 0; k < nx; k++) { const px = x0 + (x1 - x0) * (k + 0.5) / nx; if ((k + r * 3 + i) % 4 === 0) continue; E.push({ t: 'block', rect: [px - 0.38, z - 0.62, px + 0.38, z + 0.62], y0: FY, y1: FY + 0.018, mat: ['reed_mat', 'reed_mat', 'cloth_red', 'cloth_indigo'][(k + r + i) % 4], collide: false }); }
    }
    // lamps hung over the aisle from its painted ceiling (the aisle's ceiling is 8.9 m over the floor): three in each side aisle
    if (!nave) for (let k = 0; k < 3; k++) E.push({ t: 'lamp_chain', at: [ax, A.zi0 + 8 + k * 22], y: T + 8.9, drop: 3.4 + 1.9 + rand() * 0.3, n: 2, dir: [0, 1] });
  }
  // Qur'an stands: one before every second column of the nave's arcades, facing east or west
  for (const s of [-1, 1]) for (let k = 2; k < 12; k += 3) E.push({ t: 'quran_stand', at: [A.cx + s * (A.cw / 2 + 1.0), A.zi0 + (k + 0.5) * A.b], dir: [-s, 0], y: FY });
  // censers before the doors
  E.push({ t: 'censer', at: [A.cx + 2.2, AQSA[1] + 3.5], y: FY }); E.push({ t: 'censer', at: [A.cx - 2.2, AQSA[1] + 3.5], y: FY });
  return E;
}

const CL = ['cloth_white', 'cloth_brown', 'cloth_indigo', 'cloth_ochre', 'cloth_grey', 'linen', 'cloth_red', 'cloth_green'];
/** The life plan's elements. */
export function haramLife() {
  const E = [], rand = rng(733), pick = (a) => a[Math.floor(rand() * a.length)];
  const person = (x, z, y, rot, o = {}) => E.push({ t: 'figure', at: [x, z], y, rot, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: pick(CL), cloth2: pick(CL), skin: 'skin_medium', hat: rand() < 0.5 ? 'turban' : 'none', hatMat: rand() < 0.6 ? 'cloth_white' : pick(CL), hair: 'short', beard: rand() < 0.6, ...o });
  const toward = (px, pz, cx, cz) => Math.atan2(-(cx - px), -(cz - pz));          // faces −z at 0: the turn that points at (cx, cz)
  // a circle round a reader: the teacher on a mat among six to ten seated on the ground, facing him
  const circle = (cx, cz, y, n) => {
    person(cx, cz, y, rand() * 6.28, { pose: 'cross', carry: 'none', hat: 'turban', hatMat: 'cloth_white', cloth: 'cloth_white', beard: true });
    for (let k = 0; k < n; k++) { const a = Math.PI * 0.25 + k * (Math.PI * 1.5) / n, r = 2.0 + (k % 2) * 0.6, px = cx + Math.cos(a) * r, pz = cz + Math.sin(a) * r; person(px, pz, y, toward(px, pz, cx, cz), { pose: 'cross', child: k % 5 === 4 }); }
  };
  const circles = [[-45, -55], [-55, 15], [42, 20], [55, -60], [30, -75], [-30, 30]];
  for (const [x, z] of circles) if (inPlat(x, z, 3)) circle(x, z, PY, 6 + Math.floor(rand() * 4));
  for (const [x, z] of [[-100, -100], [-100, 40], [100, -40], [-112, 120], [95, 100], [-70, 100]]) circle(x, z, T, 6 + Math.floor(rand() * 4));
  // attendants sweeping the platform and the esplanade (the cleaning of the Haram), incense carriers, a water carrier
  for (let k = 0; k < 14; k++) {
    const onP = k < 8, x = onP ? PLATFORM[0] + 6 + rand() * (PLATFORM[2] - PLATFORM[0] - 12) : hx0 + 20 + rand() * (hx1 - hx0 - 40), z = onP ? PLATFORM[1] + 6 + rand() * (PLATFORM[3] - PLATFORM[1] - 12) : -180 + rand() * 340;
    if ((onP && (Math.hypot(x, z + 20) < 28 || Math.hypot(x - 40, z + 2) < 9)) || (!onP && (inPlat(x, z, -6) || (Math.abs(x) < 46 && z > 112)))) continue;
    person(x, z, onP ? PY : T, rand() * 6.28, { carry: 'broom', cloth: pick(['cloth_grey', 'cloth_brown', 'linen']), hat: 'cap' });
  }
  // gatekeepers at the stairs and gates: two at each (ten to a gate by the tradition; the nearest few shown)
  for (const [x, z] of [[-67, -26], [-67, -14], [67, -26], [67, -14], [-3, 38], [3, 38], [-3, -78], [3, -78]])
    person(x, z, PY, rand() * 6.28, { carry: 'staff', cloth: 'cloth_white', cloth2: 'cloth_green', hat: 'turban', pose: 'staff' });
  for (const [x, z] of [[hx0 + 3, -3], [hx0 + 3, 3], [hx1 - 6, HGATES.golden - 4], [hx1 - 6, HGATES.golden + 4], [HGATES.double + 3, hz1 - 5], [HGATES.double - 3, hz1 - 5], [HGATES.triple + 3, hz1 - 5], [HGATES.triple - 3, hz1 - 5]])
    person(x, z, T, rand() * 6.28, { carry: 'staff', cloth: 'cloth_white', cloth2: 'cloth_green', hat: 'turban', pose: 'staff' });
  // pilgrims and townsmen strolling and standing in twos and threes across platform and esplanade
  for (let k = 0; k < 90; k++) {
    const onP = k < 45, x = onP ? PLATFORM[0] + 3 + rand() * 134 : hx0 + 8 + rand() * 284, z = onP ? PLATFORM[1] + 3 + rand() * 114 : hz0 + 8 + rand() * 384;
    if (onP ? Math.hypot(x, z + 20) < 27 || Math.hypot(x - 40, z + 2) < 9 : (inPlat(x, z, -5) || (Math.abs(x) < 46 && z > 112) || x > 150)) continue;
    const y = onP ? PY : T, rot = rand() * 6.28;
    const g = rand();
    if (g < 0.25) { person(x, z, y, rot, { pose: 'talk' }); person(x + 0.8, z + 0.3, y, rot + 2.8, { pose: 'talk' }); }
    else if (g < 0.4) person(x, z, y, rot, { pose: 'pray' });
    else if (g < 0.5) { person(x, z, y, rot, { carry: 'pot', hat: 'veil', cloth: 'cloth_indigo' }); }
    else person(x, z, y, rot, { pose: 'stand', carry: rand() < 0.12 ? 'staff' : 'none' });
  }
  // at the Aqsa: rows of worshippers at prayer in the aisles (facing south), readers at the stands, a man at the minbar's foot
  const A = aqsaLayout();
  A.aisles.forEach((ax, i) => {
    const wd = A.width(i), nave = Math.abs(ax - A.cx) < 0.1, x0 = ax - wd / 2 + 1.2, x1 = ax + wd / 2 - 1.2, nx = Math.max(2, Math.floor((x1 - x0) / 0.85));
    for (let r = 0; r < 4; r++) for (let k = 0; k < nx; k++) {
      if (rand() < 0.45) continue;
      const z = (nave ? A.zi0 + 3 : A.zi0 + 4) + r * 2.3 * (1 + i % 2), px = x0 + (x1 - x0) * (k + 0.5) / nx;
      if ((k + r * 3 + i) % 4 === 0 || (nave && z > A.zb - 2)) continue;
      person(px, z, FY, Math.PI, { pose: r % 2 ? 'kneel' : 'pray', arms: 'pray', hat: rand() < 0.7 ? 'turban' : 'none' });
    }
  });
  for (const s of [-1, 1]) for (let k = 2; k < 12; k += 3) person(A.cx + s * (A.cw / 2 + 2.0), A.zi0 + (k + 0.5) * A.b, FY, s > 0 ? Math.PI / 2 : -Math.PI / 2, { pose: 'cross' });
  // in the forecourt and at the doors
  for (let k = 0; k < 10; k++) person(-40 + rand() * 80, 100 + rand() * 16, T, rand() * 6.28, { pose: rand() < 0.3 ? 'talk' : 'stand' });
  // stray dogs at the Aqsa's door
  for (const [x, z] of [[-20, 117], [25, 117.5]]) E.push({ t: 'animal', kind: 'dog', at: [x, z], y: T, rot: rand() * 6.28, seed: Math.floor(rand() * 1e9) });
  void height;
  return E;
}
