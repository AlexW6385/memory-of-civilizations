// Abbasid Baghdad — the life of the streets and the halls (docs/settlements/abbasid-baghdad.md §6–§9): the keepers in their shop bays, scribes and
// scholars at the House of Wisdom's desks, the caliph and his court in the audience chamber, guards at the gates, worshippers in the mosque,
// porters and boatmen at the jetties, water-carriers, women with jars, donkeys and camels, goods in the streets. Still figures and objects
// of use (src/objects); the walkers are the movers'.
import { lodTiles } from '../lod.js';
import { ALL_SUQS, C, PALACE, MOSQUE, LIBRARY, SUQS, RC, RIVER, CANAL, JETTIES, jettyAt, riverX, lots, inRect } from './layout.js';
import { KHAN_RECT, HAMMAM_RECT, WORKSHOPS, CANAL_BRIDGES, moored } from './layout.js';
import { frontElements, esplanadeElements } from './fronts.js';
import { suqKeepers } from '../../styles/abbasid/market.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const face = (from, to) => Math.atan2(-(to[0] - from[0]), -(to[1] - from[1]));       // a figure faces −z when rot = 0
const CL = ['cloth_white', 'cloth_ochre', 'cloth_brown', 'cloth_indigo', 'cloth_green', 'cloth_grey', 'cloth_maroon', 'cloth_white'];
const BLACK = 'cloth_black';

export async function lifePlan() {
  const rand = rng(762), P = [], plans = [];
  const pick = (a) => a[Math.floor(rand() * a.length)];
  const skin = () => pick(['skin_medium', 'skin_medium', 'skin_dark', 'skin_light']);
  // men: the long tunic (qamis) with a sash, a turban; women: a long dress and a veil; porters: a short tunic, the head bound; the court in black
  const man = (at, y, rot, o = {}) => P.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: pick(CL), cloth2: pick(CL), over: pick(['sash', 'sash', 'cloak', 'none']), skin: skin(), hat: 'turban', hatMat: pick(['cloth_white', 'cloth_white', 'cloth_ochre', 'cloth_indigo']), feet: 'shod', hair: 'short', beard: rand() < 0.7, ...o });
  const woman = (at, y, rot, o = {}) => P.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: pick(['cloth_indigo', 'cloth_black', 'cloth_maroon', 'cloth_green', 'cloth_brown']), cloth2: pick(CL), over: 'shawl', skin: skin(), hat: 'veil', feet: 'shod', hair: 'long', beard: false, h: 1.52 + rand() * 0.1, ...o });
  const porter = (at, y, rot, o = {}) => P.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: 'tunic', legs: 'bare', cloth: pick(['cloth_brown', 'cloth_ochre', 'cloth_grey', 'cloth_white']), cloth2: pick(['cloth_brown', 'cloth_grey']), over: 'belt', skin: 'skin_dark', hat: 'cap', feet: 'bare', hair: 'short', beard: rand() < 0.5, ...o });
  const guard = (at, y, rot, o = {}) => P.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: BLACK, cloth2: 'cloth_grey', over: 'sash', skin: skin(), hat: 'cap', hatMat: 'cloth_black', feet: 'shod', hair: 'short', beard: rand() < 0.6, pose: 'stand', carry: 'staff', arms: 'staff', ...o });
  // ── the keepers: in each bay, cross-legged on the rug behind the counter, facing the street ──
  ALL_SUQS.forEach((s) => {
    for (const k of suqKeepers({ rect: s.rect })) {
      if (rand() < 0.22) continue;
      const rot = face(k.at, [k.at[0] + k.toward[0], k.at[1] + k.toward[1]]);
      man(k.at, 0, rot, { pose: 'cross', over: pick(['sash', 'none']), beard: rand() < 0.8 });
    }
  });
  // buyers at the stalls, in the suq streets and at the crossings (a few; the walkers are the movers')
  for (const s of ALL_SUQS) {
    const horiz = s.rect[2] - s.rect[0] > s.rect[3] - s.rect[1], L = horiz ? s.rect[2] - s.rect[0] : s.rect[3] - s.rect[1];
    for (let k = 0; k < Math.floor(L / 14); k++) {
      const u = 6 + k * 14 + rand() * 4, c = horiz ? [s.rect[0] + u, (s.rect[1] + s.rect[3]) / 2] : [(s.rect[0] + s.rect[2]) / 2, s.rect[1] + u], sd = rand() < 0.5 ? -1 : 1;
      const at = horiz ? [c[0], c[1] + sd * 1.8] : [c[0] + sd * 1.8, c[1]], to = horiz ? [at[0], at[1] + sd * 4] : [at[0] + sd * 4, at[1]];
      (rand() < 0.3 ? woman : man)(at, 0, face(at, to), { pose: rand() < 0.6 ? 'talk' : 'stand' });
    }
  }
  // ── the House of Wisdom: scribes at the desks, scholars at the central table ──
  {
    const [lx, lz] = [(LIBRARY[0] + LIBRARY[2]) / 2, (LIBRARY[1] + LIBRARY[3]) / 2], mid = -11.18;
    for (const sx of [-1, 1]) for (const dx of [-1.0, 0.9]) {
      const at = [lx + sx * 8.5 + dx, lz + mid + 2.2]; man(at, 0.03, 0, { pose: 'cross', hat: rand() < 0.5 ? 'turban' : 'cap', cloth: pick(['cloth_white', 'cloth_ochre', 'cloth_grey', 'cloth_indigo']) });
    }
    man([lx - 0.6, lz + mid + 3.0], 0.03, 0, { pose: 'cross', cloth: 'cloth_white', beard: true });
    man([lx + 0.8, lz + mid + 3.0], 0.03, 0, { pose: 'cross', cloth: 'cloth_indigo', hat: 'cap', beard: true });
    // a scholar before the globe, one reaching down a codex from the cupboards, one at the lectern of the court's portico
    man([lx - 12.5, lz + mid + 1.2], 0, -Math.PI / 2, { pose: 'talk' }); man([lx - 14.5, lz + mid + 1.2], 0, Math.PI / 2, { pose: 'talk', cloth: 'cloth_grey' });
    man([lx + 6, lz - 14.1], 0.03, 0, { pose: 'stand', cloth: 'cloth_maroon' });
    for (const sx of [-1, 1]) man([lx + sx * 16.2 + (sx < 0 ? 0.3 : -0.3), lz + 4.7], 0, sx < 0 ? Math.PI / 2 : -Math.PI / 2, { pose: 'cross' });
  }
  // ── the palace: the caliph on his dais, officials, guards at the gate and the iwan ──
  {
    const [px, pz] = C, chamber = [px, pz - 9.6];
    man([chamber[0], chamber[1] - 5.25], 1.58, Math.PI, { pose: 'cross', cloth: BLACK, cloth2: 'cloth_ochre', over: 'cloak', hat: 'cap', hatMat: 'cloth_black', beard: true });
    for (const sx of [-1, 1]) for (let k = 0; k < 4; k++) man([chamber[0] + sx * 5.4, chamber[1] - 3.2 + k * 1.8], 0.4, sx < 0 ? -Math.PI / 2 : Math.PI / 2, { pose: k % 2 ? 'cross' : 'talk', cloth: BLACK, cloth2: pick(CL), hat: 'cap', hatMat: 'cloth_black' });
    guard([chamber[0] - 1.6, chamber[1] - 6.2], 0.4, 0); guard([chamber[0] + 1.6, chamber[1] - 6.2], 0.4, 0);
    for (const sx of [-1, 1]) { guard([px + sx * 5.0, pz + 15.4], 0.05, Math.PI); guard([px + sx * 3.2, pz + 36 - 0.5], 0, Math.PI); guard([px + sx * 4.8, pz + 38.4], 0, Math.PI); }
  }
  // ── the gates: two guards at each main gate; a muhtasib's clerk by the east gate ──
  for (const f of RC.gates) {
    const a = f * Math.PI / 180, r = RC.main + 9.5, t = [-Math.sin(a), Math.cos(a)];
    for (const s of [-1, 1]) guard([C[0] + Math.cos(a) * r + t[0] * s * 4.0, C[1] + Math.sin(a) * r + t[1] * s * 4.0], 0, face([0, 0], [Math.cos(a), Math.sin(a)]) + Math.PI);
  }
  // ── the mosque: worshippers in rows at the qibla, a reciter, one asleep in the shade of the riwaq ──
  {
    const [mx, mz] = [(MOSQUE[0] + MOSQUE[2]) / 2, (MOSQUE[1] + MOSQUE[3]) / 2];
    for (let r = 0; r < 2; r++) for (let k = 0; k < 6; k++) if (rand() < 0.8) man([mx - 6 + k * 2.1 + rand() * 0.2, mz + 19.5 + r * 1.6], 0.05, Math.PI, { pose: r ? 'kneel' : 'pray', arms: 'pray', over: 'none' });
    man([mx + 8, mz + 12], 0.05, Math.PI, { pose: 'sit_ground', hat: 'turban', cloth: 'cloth_white' }); man([mx - 13, mz + 14], 0.05, 0.3, { pose: 'sit_ground', cloth: 'cloth_grey' });
    man([mx + 5.4, mz + 22.6], 0.05, Math.PI, { pose: 'cross', cloth: 'cloth_indigo' });
    man([mx + 18, mz - 20], 0, -Math.PI / 2, { pose: 'sit_ground', cloth: 'cloth_brown' });
  }
  // ── the river: porters and boatmen at the jetties, a fisherman and washerwomen at the banks, camels on the Khurasan road ──
  for (const j of JETTIES) {
    const J = jettyAt(j), x = J.a[0] + J.dir * 2;
    porter([x + J.dir * 5.5, j.z + 0.4], -0.2, J.dir > 0 ? Math.PI / 2 : -Math.PI / 2, { carry: 'sack', arms: 'sack' }); man([x + J.dir * 3.5, j.z - 0.6], -0.2, J.dir > 0 ? -Math.PI / 2 : Math.PI / 2, { pose: 'talk' });
    if (rand() < 0.6) porter([x + J.dir * 8.5, j.z - 0.5], -0.2, J.dir > 0 ? -Math.PI / 2 : Math.PI / 2, { pose: 'squat' });
  }
  for (let k = 0; k < 6; k++) { const z = -160 + k * 85 + rand() * 20, x = riverX(z) - RIVER.w / 2 - 5; woman([x, z], 0, Math.PI / 2, { pose: 'squat', hat: 'veil' }); woman([x - 0.9, z + 1.0], 0, Math.PI / 2, { pose: 'squat' }); }
  // ── the street: water-carriers, women with jars, children, sellers of sherbet, along the avenues, the esplanade, Karkh's lanes ──
  const spots = [];
  for (let k = 0; k < 40; k++) {
    const a = rand() * Math.PI * 2, r = 60 + rand() * 140, x = C[0] + Math.cos(a) * r, z = C[1] + Math.sin(a) * r;
    if (!inRect(PALACE, x, z, 8) && !inRect(MOSQUE, x, z, 4) && !inRect(LIBRARY, x, z, 4)) spots.push([x, z]);
  }
  for (const [x, z] of spots) { const q = rand(), rot = rand() * 6.28; if (q < 0.25) woman([x, z], 0, rot, { carry: 'pot', arms: 'head' }); else if (q < 0.45) porter([x, z], 0, rot, { carry: 'sack', arms: 'sack' }); else if (q < 0.7) man([x, z], 0, rot, { pose: 'talk' }); else if (q < 0.85) woman([x, z], 0, rot, { child: true, h: 1.1 }); else man([x, z], 0, rot); }
  // ── beasts and goods ──
  const E = [];
  const donkeyAt = (x, z, rot, seed) => E.push({ t: 'animal', kind: 'donkey', at: [x, z], y: 0, rot, seed, gear: true });
  for (let k = 0; k < 16; k++) { const a = rand() * Math.PI * 2, r = 215 + rand() * 40, x = C[0] + Math.cos(a) * r, z = C[1] + Math.sin(a) * r; if (!lots().some((l) => inRect(l.rect, x, z, 3))) donkeyAt(x, z, rand() * 6.28, k + 3); }
  for (const [x, z] of [[-110, 420], [-110, 500], [-60, 372], [-230, 372], [30, 372], [-110, 340]]) donkeyAt(x + (rand() - 0.5) * 3, z, rand() * 6.28, Math.floor(rand() * 99));
  for (let k = 0; k < 6; k++) E.push({ t: 'animal', kind: 'camel', at: [C[0] + RC.main + 14 + k * 3.2, C[1] + 11 + (k % 2) * 2], y: 0, rot: 1.57, seed: 40 + k, gear: true });
  for (let k = 0; k < 4; k++) E.push({ t: 'animal', kind: 'camel', at: [190 + k * 3.2, 82 + (k % 2) * 2], y: 0, rot: 1.0, seed: 60 + k });
  for (const x of [C[0] - 131, C[0] - 126, C[0] - 121]) E.push({ t: 'animal', kind: 'horse', at: [x, C[1] - 120 + 8], y: 0, rot: 3.14, seed: Math.round(x), gear: true });
  for (let k = 0; k < 10; k++) { const a = rand() * Math.PI * 2, r = 80 + rand() * 120; E.push({ t: 'animal', kind: rand() < 0.7 ? 'dog' : 'cat', at: [C[0] + Math.cos(a) * r, C[1] + Math.sin(a) * r], y: 0, rot: rand() * 6.28, seed: k + 11 }); }
  // goods at the suq ends, the quay and the crossings: jars, baskets, sacks, a handcart, a well with a water-lifting sweep (shaduf) on the east bank
  const potAt = (x, z, kind, n = 1) => E.push({ t: 'pot', kind, n, at: [x, z], y: 0, seed: Math.round(x * 3 + z) });
  for (const s of SUQS) { potAt(s.rect[0] - 1.2, s.rect[1] + 2, 'water_pot'); E.push({ t: 'sacks', at: [s.rect[2] + 1.0, s.rect[3] - 2], y: 0, rot: 0.2, n: 3, seed: Math.round(s.rect[0]) }); E.push({ t: 'basket', at: [s.rect[0] - 1.0, s.rect[3] - 2.5], y: 0, seed: Math.round(s.rect[1]), n: 2, goods: 'cloth_ochre' }); }
  for (const j of JETTIES.slice(0, 7)) { const J = jettyAt(j); E.push({ t: 'sacks', at: [J.a[0] - J.dir * 2.6, j.z + 2.5], y: 0, rot: 0.3, n: 4, seed: Math.round(j.z) }); potAt(J.a[0] - J.dir * 2.4, j.z - 2.6, 'water_pot', 2); E.push({ t: 'barrel', at: [J.a[0] - J.dir * 3.6, j.z + 3.4], y: 0, seed: Math.round(j.z) + 1 }); }
  E.push({ t: 'well', kind: 'shaduf', at: [riverX(20) + RIVER.w / 2 + 12, 20], y: 0, rot: 3.14 }, { t: 'well', kind: 'shaduf', at: [riverX(-180) + RIVER.w / 2 + 12, -180], y: 0, rot: 3.14 }, { t: 'well', kind: 'open', at: [C[0] + 30, C[1] + 80], y: 0 }, { t: 'well', kind: 'open', at: [C[0] - 90, C[1] + 90], y: 0 });
  E.push({ t: 'handcart', at: [-98, 330], y: 0, rot: 0.2, seed: 1 }, { t: 'handcart', at: [-98, 460], y: 0, rot: -0.1, seed: 2 });
  { const f = frontElements(); E.push(...f.E, ...esplanadeElements()); for (const p of f.P) man(p.at, p.y, p.rot, { pose: p.pose, over: 'none' }); }
  // ── the khan: camels couched in the court with their loads, donkeys at the back, merchants and a driver; the hammam's bathers; the workshops' keepers ──
  {
    const kx = (KHAN_RECT[0] + KHAN_RECT[2]) / 2, kz = (KHAN_RECT[1] + KHAN_RECT[3]) / 2;
    for (const [dx, dz, rot, k] of [[-5, -4.5, 1.2, 1], [5.5, 5.0, -1.3, 2], [-5.5, 6.5, 1.9, 3], [6, -6, 0.4, 4]]) E.push({ t: 'animal', kind: 'camel', at: [kx + dx, kz + dz], y: 0, rot, seed: 300 + k, gear: true });
    for (let k = 0; k < 3; k++) E.push({ t: 'animal', kind: 'donkey', at: [kx - 6 + k * 6, kz + 16.2], y: 0, rot: 0, seed: 310 + k, gear: true });
    for (const [dx, dz] of [[-9, 2], [9, -3], [-2.5, 7], [3, -8]]) { E.push({ t: 'sacks', at: [kx + dx, kz + dz], y: 0, rot: rand() * 3, n: 5, seed: Math.round(dx * 7 + dz) }); }
    E.push({ t: 'barrel', at: [kx + 10, kz + 9], y: 0, seed: 5 }, { t: 'barrel', at: [kx - 10.5, kz - 8], y: 0, seed: 6 });
    man([kx - 2.6, kz - 5.5], 0, 0.6, { pose: 'talk', cloth: 'cloth_green' }); man([kx - 3.8, kz - 4.6], 0, -1.0, { pose: 'talk', cloth: 'cloth_maroon' }); porter([kx + 4.2, kz + 4.4], 0, 2.5, { carry: 'sack', arms: 'sack' });
    man([kx + 7.5, kz + 1], 0, -1.57, { pose: 'cross', cloth: 'cloth_indigo' });
    const hx = (HAMMAM_RECT[0] + HAMMAM_RECT[2]) / 2, hz = (HAMMAM_RECT[1] + HAMMAM_RECT[3]) / 2;
    for (const [dx, dz] of [[-3, 9], [2.5, 8], [-1, 4]]) P.push({ t: 'figure', at: [hx + dx, hz + dz], y: 0, rot: rand() * 6, seed: Math.floor(rand() * 1e9), dress: 'tunic', legs: 'bare', cloth: 'cloth_white', cloth2: 'cloth_white', over: 'none', skin: skin(), hat: 'none', feet: 'bare', hair: 'short', beard: rand() < 0.6, pose: 'sit_ground' });
    for (const w of WORKSHOPS) { const wx = (w.rect[0] + w.rect[2]) / 2, wz = (w.rect[1] + w.rect[3]) / 2; man([wx + 1.2, wz + 1.0], 0, 0, { pose: w.kind === 'perfumer' ? 'cross' : 'stand', cloth: pick(CL), over: 'sash' }); if (w.kind !== 'coppersmith') porter([wx - 1.5, wz + 2.2], 0, 3.14, { pose: 'stand' }); }
    for (const x of [-110]) void x;
  }
  // ── the water's edge: fishermen in the moored quffas, ducks and geese on the banks and the canal's quay, a boat yard's fire and fuel at the canal's end ──
  for (const b of moored()) if (b.kind === 'quffa' && rand() < 0.45) man([b.at[0], b.at[1]], -1.5 + 0.28, rand() * 6.28, { pose: 'cross', cloth: pick(['cloth_brown', 'cloth_grey', 'cloth_ochre']), hat: 'cap', over: 'none' });
  for (const z of [-170, -40, 100, 215, 280, 420]) { const x = riverX(z) - RIVER.w / 2 - 3.5; E.push({ t: 'chickens', kind: z % 2 ? 'duck' : 'goose', n: 5, at: [x, z + 3], y: 0, seed: z }); }
  for (const x of [-330, -200, -60, 80]) E.push({ t: 'chickens', kind: 'duck', n: 4, at: [x, CANAL.z - 9.2], y: 0, seed: x });
  E.push({ t: 'firewood', at: [-342, CANAL.z - 11], y: 0, rot: 0, len: 1.6, seed: 3 }, { t: 'firewood', at: [-342, CANAL.z - 12.6], y: 0, rot: 0, len: 1.6, seed: 4 }, { t: 'barrel', at: [-338, CANAL.z - 11], y: 0, seed: 8 }, { t: 'barrel', at: [-337, CANAL.z - 12.4], y: 0, seed: 9 });
  porter([-340, CANAL.z - 9.8], 0, 1.0, { pose: 'squat' }); porter([-336, CANAL.z - 10.4], 0, -2.0, { pose: 'stand' });
  void CANAL_BRIDGES;
  const base = (id, style, elements) => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-520, -520, 520, 520], entrance: { at: [C[0], C[1] + 60], facing: 'n' } });
  plans.push(base('abbasid-baghdad-people', 'life', [...P, ...E]));
  void lodTiles; void CANAL;
  return plans;
}
