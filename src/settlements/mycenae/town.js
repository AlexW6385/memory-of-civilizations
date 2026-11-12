// Mycenae — the townscape (docs/settlements/mycenae.md §5, §9): the houses of the citadel and the lower town, the workshops with their yards,
// the people at the gate, on the ramp, in the Great Court and the megaron, in the lanes; the herds and the donkeys.

import { RADIUS, LANES, RAMP, lots, PALACE, PAL_Y, GATE_Y, GCA, TREAS, rng, terrain, onLane, BASTION, STUB, inHouse, sdCircuit } from './layout.js';
import { ground } from './ground.js';

const base = (id, style, elements) => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-107, 0], facing: 'e' } });
const h = (x, z) => ground.height(x, z);
const CL = ['cloth_white', 'cloth_red', 'cloth_ochre', 'cloth_indigo', 'cloth_brown'];

/** The frame of a lot: (u along the front from its left end, v out from the door wall, negative outside) in the plan. */
function frame(l) {
  const [x0, z0, x1, z1] = l.rect, f = l.face;
  const P = (u, v) => (f === 'n' ? [x0 + u, z0 + v] : f === 's' ? [x0 + u, z1 - v] : f === 'w' ? [x0 + v, z0 + u] : [x1 - v, z0 + u]);
  const rot = f === 'n' || f === 's' ? 0 : Math.PI / 2;
  const face = { n: Math.PI, s: 0, w: -Math.PI / 2, e: Math.PI / 2 }[f];     // a figure's turn to look out of the door (+z is its front at rot 0)
  return { P, rot, face, W: l.W };
}

function yards() {
  const Y = [], rand = rng(77), K = { potter: 'kiln', smith: 'pithoi', weaver: 'loom', oil: 'press', ivory: 'pithoi', perfume: 'pithoi' };
  for (const l of lots()) {
    if (l.kind !== 'workshop' || !l.court) continue;
    const c = l.court, at = [(c[0] + c[2]) / 2, (c[1] + c[3]) / 2];
    const fr = frame(l), u = l.du < l.W / 2 ? l.W * 0.72 : l.W * 0.28, p = fr.P(u, -1.9);
    void at; void rand;
    Y.push({ t: 'yard', kind: K[l.trade] ?? 'pithoi', at: p, y: l.y - 0.02, seed: l.seed });
  }
  return Y;
}

/** The dress of every front at eye level: the pots, benches, fuel, laundry and baskets of each house, the goods of each trade (instanced street life). */
function dress() {
  const E = [], rand = rng(4242), put = (t, at, rot, o = {}) => E.push({ t, at, y: h(...at), rot, seed: Math.floor(rand() * 1e9), ...o });
  for (const l of lots()) {
    if (l.kind === 'granary') continue;
    const fr = frame(l), W = l.W, du = l.du, dw = l.dw, side = du < W / 2 ? 1 : -1, P = fr.P, c = l.court ? 3.4 : 0;
    const near = (uu) => Math.abs(uu - du) > dw / 2 + 0.7 && uu > 0.6 && uu < W - 0.6;
    const at = (uu, v) => P(uu, v - c * 0);
    const v0 = l.court ? -0.55 : -0.62;
    // pots by the door
    const kinds = ['pithos', 'amphora', 'water_pot', 'dark_pot'];
    if (l.kind !== 'cult') put('pot', at(du + side * (dw / 2 + 0.75), v0), 0, { kind: kinds[Math.floor(rand() * 4)], n: 1 + Math.floor(rand() * 3) });
    if (rand() < 0.55) put('pot', at(du - side * (dw / 2 + 0.7), v0 - 0.1), 0, { kind: rand() < 0.5 ? 'water_pot' : 'amphora', n: 2 });
    if (rand() < 0.55) { const uu = du - side * (dw / 2 + 1.9); if (near(uu)) put('bench', at(uu, v0 - 0.1), fr.rot, { len: 1.5, mat: 'mudbrick' }); }
    if (rand() < 0.5) { const uu = side > 0 ? W - 1.1 : 1.1; if (near(uu)) put('firewood', at(uu, v0 + 0.1), fr.rot, { len: 1.2 }); }
    if (rand() < 0.5) { const uu = du + side * (dw / 2 + 2.0); if (near(uu)) put(rand() < 0.5 ? 'basket' : 'sacks', at(uu, v0), fr.rot, { n: 2 }); }
    if (W > 7 && rand() < 0.3) put('laundry', at(W / 2 + (rand() - 0.5), -1.25), fr.rot, { len: 3 });
    if (rand() < 0.28) { const uu = du + side * (dw / 2 + 3.0); if (near(uu)) put('chickens', at(uu, -1.0), rand() * 6, { kind: 'hen' }); }
    if (rand() < 0.2) { const uu = du - side * (dw / 2 + 2.9); if (near(uu)) put('drying_tray', at(uu, -0.9), rand() * 6); }
    // the trade's goods before the shop
    if (l.kind === 'workshop') {
      const g = { potter: () => { for (let k = 0; k < 5; k++) put('pot', at(du + (k - 2) * 0.7, -1.5 - (k % 2) * 0.45), 0, { kind: ['water_pot', 'amphora', 'dark_pot', 'water_pot', 'pithos'][k], n: 2 }); },
        smith: () => { put('crates', at(du - 1.3, -1.2), fr.rot, { n: 2 }); put('barrel', at(du + 1.4, -1.1), 0, { n: 1 }); },
        weaver: () => { put('laundry', at(W / 2, -1.5), fr.rot, { len: 3.5 }); put('basket', at(du + 1.3, -1.0), 0, { n: 3 }); },
        oil: () => { for (let k = 0; k < 3; k++) put('pot', at(du + (k - 1) * 1.0, -1.4), 0, { kind: 'pithos', n: 1 }); put('sacks', at(du + 2.2, -1.1), fr.rot, { n: 3 }); },
        ivory: () => { put('crates', at(du - 1.2, -1.1), fr.rot, { n: 1 }); put('basket', at(du + 1.2, -1.0), 0, { n: 1 }); },
        perfume: () => { for (let k = 0; k < 4; k++) put('pot', at(du + (k - 1.5) * 0.6, -1.3 - (k % 2) * 0.3), 0, { kind: 'water_pot', n: 1 }); } }[l.trade];
      g?.();
    }
    if (l.kind === 'store') put('sacks', at(du + 1.4, v0), fr.rot, { n: 4 });
  }
  // the Great Court: oil and wine jars by the magazines' doors, stone benches along the wings, a brazier-stand, the tally-keepers' stools
  const cp = (t, x, z, rot, o = {}) => E.push({ t, at: [x, z], y: PAL_Y, rot, seed: Math.floor(rand() * 1e9), ...o });
  cp('pot', 38.4, 15.35, 0, { kind: 'pithos', n: 3 }); cp('pot', 44.2, 15.3, 0, { kind: 'amphora', n: 4 }); cp('pot', 50.5, 15.4, 0, { kind: 'pithos', n: 2 });
  cp('bench', 34.2, 15.45, 0, { len: 2.2, mat: 'limestone_yellow' }); cp('bench', 47.8, 15.45, 0, { len: 2.2, mat: 'limestone_yellow' });
  cp('pot', 38.2, -9.5, 0, { kind: 'amphora', n: 3 }); cp('pot', 44.6, -9.5, 0, { kind: 'pithos', n: 2 }); cp('sacks', 48.5, -9.4, 0, { n: 4 });
  cp('pot', 56.9, -6.0, 0, { kind: 'pithos', n: 2 }); cp('pot', 56.9, 12.5, 0, { kind: 'water_pot', n: 3 }); cp('basket', 31.5, 4.0, 0, { n: 3 });
  cp('stool', 43.2, 14.8, 0, {}); cp('stool', 44.4, 14.9, 0, {});
  // offerings at the shaft graves of the circle: jars and bowls at the stelae's feet, a basket of grain
  for (const [gx, gz] of [[-5.2, -3.4], [0.3, -6.4], [5.0, -1.8], [-2.2, 2.6], [3.6, 5.6], [-6.0, 4.6]]) E.push({ t: 'pot', at: [GCA.x + gx + 0.4, GCA.z + gz + 1.5], y: GCA.y + 0.03, rot: 0, seed: Math.floor(rand() * 1e9), kind: rand() < 0.5 ? 'water_pot' : 'amphora', n: 2 });
  E.push({ t: 'basket', at: [GCA.x + 6.4, GCA.z - 5.5], y: GCA.y + 0.03, rot: 0, seed: 4, n: 2 });
  return E;
}

/** The people at their places: warriors at the gate, a priestess at the circle, the wanax's household in the court and the hall, scribes, porters, women at the houses. */
function people() {
  const rand = rng(1251), T = [], seed = () => Math.floor(rand() * 1e9);
  const man = (at, y, rot, o = {}) => T.push({ t: 'figure', at, y, rot, seed: seed(), skin: 'skin_medium', dress: 'shendyt', cloth: CL[Math.floor(rand() * 5)], over: 'belt', hair: 'long', beard: rand() < 0.5, feet: 'bare', hat: 'none', pose: 'stand', ...o });
  const woman = (at, y, rot, o = {}) => T.push({ t: 'figure', at, y, rot, seed: seed(), skin: 'skin_light', dress: 'robe', cloth: CL[Math.floor(rand() * 4)], cloth2: 'cloth_white', over: 'sash', hair: rand() < 0.5 ? 'long' : 'bun', feet: 'bare', hat: 'none', pose: 'stand', ...o });
  // the gate's guards, spears upright, either side of the passage inside
  for (const z of [-2.6, 2.6]) man([-83.5, z], GATE_Y, -Math.PI / 2, { carry: 'staff', pose: 'staff', len: 1.9, dress: 'tunic', cloth: 'cloth_red', beard: true });
  // the priestess at Grave Circle A, a pair of attendants
  woman([GCA.x + 2.2, GCA.z - 1.5], GCA.y + 0.03, 0, { pose: 'pray', cloth: 'cloth_indigo', cloth2: 'cloth_ochre' });
  woman([GCA.x - 2.5, GCA.z + 3.0], GCA.y + 0.03, 1.2, { carry: 'pot' }); woman([GCA.x + 4.5, GCA.z + 4.0], GCA.y + 0.03, 3.4);
  // the Great Court: people crossing and talking, bearers with jars
  const [cx0, cz0, cx1, cz1] = PALACE.court;
  for (let k = 0; k < 12; k++) {
    const x = cx0 + 2 + rand() * (cx1 - cx0 - 4), z = cz0 + 3 + rand() * (cz1 - cz0 - 5);
    if (Math.hypot(x - 43.5, z - 3) < 2) continue;
    (rand() < 0.4 ? woman : man)([x, z], PAL_Y, rand() * 6.28, rand() < 0.3 ? { pose: 'talk' } : rand() < 0.3 ? { carry: 'pot' } : {});
  }
  // the tally-keepers at the magazine door, a guard at the propylon and one at each wing's door
  man([43.2, 14.2], PAL_Y, Math.PI, { pose: 'sit_low', dress: 'tunic', cloth: 'cloth_white' }); man([44.4, 14.3], PAL_Y, Math.PI + 0.3, { pose: 'sit_low', dress: 'tunic', cloth: 'cloth_ochre' });
  for (const z of [-0.9, 6.9]) man([26.5, z], PAL_Y, -Math.PI / 2, { carry: 'staff', pose: 'staff', len: 1.9, dress: 'tunic', cloth: 'cloth_red', beard: true });
  man([39.4, -8.6], PAL_Y, 0, { pose: 'talk' }); man([40.6, -8.4], PAL_Y, Math.PI, { pose: 'talk', cloth: 'cloth_indigo' });
  // in the megaron: the wanax's attendants by the hearth, a cupbearer at the offering table, a scribe seated in the vestibule
  const M = PALACE.megaron, hx = M.x0 + 6.4 + 0.9 + 3.7 + 0.9 + 6.05;
  man([hx - 2.8, M.ax - 0.8], PAL_Y, -1.2, { pose: 'talk', cloth: 'cloth_red' }); man([hx - 3.9, M.ax - 0.6], PAL_Y, 1.2, { pose: 'talk', cloth: 'cloth_white' });
  woman([hx + 3.4, M.z1 - 1.3], PAL_Y, Math.PI, { carry: 'pot', cloth: 'cloth_red' });
  man([M.x0 + 6.4 + 2.6, M.z1 - 1.6], PAL_Y, -Math.PI / 2, { pose: 'sit_low', dress: 'tunic', cloth: 'cloth_ochre' });
  // the ramp: porters with jars and sacks going up, an ox-cart's driver and the ox
  for (let k = 0; k < RAMP.length - 1; k++) {
    const [ax, az] = RAMP[k], [bx, bz] = RAMP[k + 1];
    for (const t of [0.3, 0.75]) {
      const Lk = Math.hypot(bx - ax, bz - az), sd = rand() < 0.5 ? -1 : 1, off = sd * (1.7 + rand() * 0.6);        // to either side of the middle line, which is left free to walk
      const x = ax + (bx - ax) * t - ((bz - az) / Lk) * off, z = az + (bz - az) * t + ((bx - ax) / Lk) * off, up = rand() < 0.6;
      (rand() < 0.4 ? woman : man)([x, z], h(x, z), up ? -Math.atan2(bz - az, bx - ax) - Math.PI / 2 : -Math.atan2(bz - az, bx - ax) + Math.PI / 2, { carry: rand() < 0.5 ? 'pot' : 'sack' });
    }
  }
  // the lanes of the lower town: women at the doors, men with baskets, children, a boy with goats
  for (const l of lots()) {
    if (l.inside || rand() < 0.45) continue;
    const [x0, z0, x1, z1] = l.rect, o = { n: [(x0 + x1) / 2 + 1, z0 - 1.5], s: [(x0 + x1) / 2 + 1, z1 + 1.5], w: [x0 - 1.5, (z0 + z1) / 2 + 1], e: [x1 + 1.5, (z0 + z1) / 2 + 1] }[l.face === 'n' ? 'n' : l.face === 's' ? 's' : l.face === 'w' ? 'w' : 'e'];
    if (onLane(...o, 0)) continue;
    const r = rand();
    if (r < 0.45) woman(o, h(...o), rand() * 6.28, rand() < 0.5 ? { pose: 'kneel' } : { carry: 'basket' });
    else if (r < 0.75) man(o, h(...o), rand() * 6.28, { carry: rand() < 0.5 ? 'sack' : 'none', pose: rand() < 0.4 ? 'talk' : 'stand' });
    else woman(o, h(...o), rand() * 6.28, { child: true, h: 1.1 });
  }
  // ── the approach road: the traffic of a great house's gate, the road's whole length in the arrival's view ──
  const road = LANES[0];
  const onRoad = (x, off) => { let z = -2; for (let i = 0; i < road.length - 1; i++) { const [ax, az] = road[i], [bx, bz] = road[i + 1]; if (x >= Math.min(ax, bx) && x <= Math.max(ax, bx)) { z = az + (bz - az) * (x - ax) / (bx - ax || 1); break; } } return [x, z + off]; };
  for (let x = -186; x < -112; x += 3.4 + rand() * 3) {
    let [px, pz] = onRoad(x, (rand() < 0.5 ? -1 : 1) * (0.9 + rand() * 1.5)); if (Math.abs(pz) < 1.9) pz = pz >= 0 ? 2.0 : -2.0; const east = rand() < 0.55, rot = east ? Math.PI / 2 : -Math.PI / 2, k = rand();
    if (k < 0.3) (rand() < 0.5 ? man : woman)([px, pz], h(px, pz), rot, { carry: ['sack', 'pot', 'basket'][Math.floor(rand() * 3)] });
    else if (k < 0.5) woman([px, pz], h(px, pz), rot, { carry: 'pot' });
    else if (k < 0.65) { man([px, pz], h(px, pz), rot + 0.4, { pose: 'talk' }); man([px + 1.0, pz + 0.2], h(px + 1, pz), rot + 2.9, { pose: 'talk' }); }
    else if (k < 0.8) man([px, pz], h(px, pz), rot, { dress: 'loincloth', cloth: 'cloth_brown', carry: 'staff', pose: 'staff', len: 1.7 });
    else woman([px, pz], h(px, pz), rot, { child: true, h: 1.05 });
  }
  // sentries on the bastion and on the end of the wall, spears upright, looking down the road
  for (const [x, z, y] of [[-102, 6, GATE_Y + 6.2], [-97, 8.5, GATE_Y + 6.2], [-100, -8, GATE_Y + 7.0], [-95, -6, GATE_Y + 7.0]]) man([x, z], y, -Math.PI / 2 + (rand() - 0.5) * 0.5, { carry: 'staff', pose: 'staff', len: 1.9, dress: 'tunic', cloth: 'cloth_red', beard: true });
  void BASTION; void STUB;
  // the workers at the shops: the potter at his kiln, the weaver at the loom, the smith at the door, the oil-presser with his sacks
  for (const l of lots()) {
    if (l.kind !== 'workshop' || rand() < 0.15) continue;
    const fr = frame(l), du = l.du, W = l.W, o = { potter: ['squat', 0.0], smith: ['stand', 0.6], weaver: ['sit_ground', 0.0], oil: ['stand', 0.0], ivory: ['sit_low', 0.0], perfume: ['stand', 0.0] }[l.trade] ?? ['stand', 0];
    const u = l.du < W / 2 ? W * 0.72 - 0.9 : W * 0.28 + 0.9, p = fr.P(u, l.court ? -2.2 : -1.0);
    man(p, h(...p), fr.face + (rand() - 0.5), { pose: o[0], dress: l.trade === 'smith' ? 'loincloth' : 'shendyt', cloth: 'cloth_brown' });
    if (rand() < 0.6) { const q = fr.P(du + 1.1, -1.2); woman(q, h(...q), fr.face + 0.4, rand() < 0.5 ? { carry: 'pot' } : { pose: 'talk' }); }
    void o; void W;
  }
  // the grave circle's visitors and the dromos of the Treasury: a procession of mourners with offerings, a priest
  for (let k = 0; k < 4; k++) woman([TREAS.x0 + 10 + k * 3.4, TREAS.z + (k % 2 ? 1.2 : -1.2)], TREAS.y + 0.3 + 0.0, Math.PI / 2, { carry: k % 2 ? 'pot' : 'basket', cloth: 'cloth_white', cloth2: 'cloth_indigo' });
  void GCA;
  // the caravan halt and the stalls on the verges (see verge()): drovers resting, the sellers, a pair of buyers, a child with the donkeys
  {
    const rz = roadZ;
    man([-126.3, rz(-126.3) - 4.0], h(-126.3, rz(-126.3) - 4.0), 0.8, { pose: 'squat', dress: 'loincloth', cloth: 'cloth_brown' });
    man([-120.4, rz(-120.4) - 4.1], h(-120.4, rz(-120.4) - 4.1), -2.2, { pose: 'sit_ground', dress: 'tunic' });
    man([-123.2, rz(-123.2) - 3.9], h(-123.2, rz(-123.2) - 3.9), 2.9, { pose: 'talk' }); man([-122.0, rz(-122.0) - 3.8], h(-122.0, rz(-122.0) - 3.8), 0.2, { pose: 'talk', cloth: 'cloth_indigo' });
    woman([-126.5, rz(-126.5) + 4.8], h(-126.5, rz(-126.5) + 4.8), Math.PI, { pose: 'stand' }); man([-118.5, rz(-118.5) + 5.0], h(-118.5, rz(-118.5) + 5.0), Math.PI, { pose: 'sit_low' });
    woman([-122.6, rz(-122.6) + 3.9], h(-122.6, rz(-122.6) + 3.9), 3.6, { pose: 'kneel' }); woman([-130, rz(-130) + 3.6], h(-130, rz(-130) + 3.6), -1.0, { child: true, h: 1.1 });
    man([-115.5, rz(-115.5) + 3.5], h(-115.5, rz(-115.5) + 3.5), 1.5, { pose: 'talk' }); woman([-114.4, rz(-114.4) + 3.6], h(-114.4, rz(-114.4) + 3.6), -1.6, { pose: 'talk', carry: 'basket' });
  }
  // nobody within a few metres of the arrival (-136, 0), none straddling the lens
  return T.filter((f) => !(f.t === 'figure' && f.at[0] > -150 && f.at[0] < -118 && Math.hypot(f.at[0] + 136, f.at[1]) < 8));
}
function beasts() {
  const rand = rng(1252), L = [];
  // donkeys on the road to the gate and goats on the slope above the lower town, a dog or two at the doors
  for (const [x, z] of [[-170, 4], [-142, -4], [-125, 3.5]]) L.push({ t: 'animal', kind: 'donkey', at: [x, z], y: h(x, z), rot: rand() * 6.28, seed: Math.floor(rand() * 1e6), gear: true });
  for (let k = 0; k < 14; k++) { const x = -175 + rand() * 60, z = -70 + rand() * 40; if (Math.hypot(x, z) < RADIUS - 15) L.push({ t: 'animal', kind: rand() < 0.6 ? 'goat' : 'sheep', at: [x, z], y: h(x, z), rot: rand() * 6.28, seed: k + 5 }); }
  for (const l of lots().filter((q) => !q.inside).slice(0, 10)) { const x = (l.rect[0] + l.rect[2]) / 2, z = (l.rect[1] + l.rect[3]) / 2 + (l.rect[3] - l.rect[1]) / 2 + 2; L.push({ t: 'animal', kind: 'dog', at: [x, z], y: h(x, z), rot: rand() * 6.28, seed: l.seed % 97 }); }
  // more dogs at the doors, a pig or two and goats behind the houses of the lower town, a laden donkey train and an ox-cart on the road
  const out = lots().filter((q) => !q.inside && q.kind !== 'granary');
  for (const l of out.slice(10, 34)) { const fr = frame(l), p = fr.P(l.du + (rand() < 0.5 ? 2 : -2), -1.5); L.push({ t: 'animal', kind: 'dog', at: p, y: h(...p), rot: rand() * 6.28, seed: l.seed % 97 }); }
  for (const l of out.filter((_, i) => i % 5 === 2)) { const fr = frame(l), p = fr.P(l.W * 0.5, l.face === 'n' || l.face === 's' ? -(l.rect[3] - l.rect[1]) - 2.5 : -(l.rect[2] - l.rect[0]) - 2.5); if (inHouse(...p, 1) || onLane(...p, 2)) continue; for (let k = 0; k < 2; k++) L.push({ t: 'animal', kind: rand() < 0.5 ? 'goat' : (rand() < 0.5 ? 'pig' : 'sheep'), at: [p[0] + k * 1.2, p[1] + k * 0.6], y: h(p[0] + k * 1.2, p[1] + k * 0.6), rot: rand() * 6.28, seed: k + l.seed % 31 }); }
  L.push({ t: 'cart', at: [-172, 1.6], y: h(-172, 1.6), rot: 0, seed: 12, beast: 'ox', load: 'sacks' });
  for (const [x, z] of [[-182, -1.4], [-180, -2.4], [-178.6, -1.2]]) L.push({ t: 'animal', kind: 'donkey', at: [x, z], y: h(x, z), rot: -Math.PI / 2, seed: Math.floor(x), gear: true });
  void TREAS; void LANES; void terrain;
  return L;
}

/** The approach road's centre line z at x (layout LANES[0]). */
function roadZ(x) { const road = LANES[0]; for (let i = 0; i < road.length - 1; i++) { const [ax, az] = road[i], [bx, bz] = road[i + 1]; if (x >= Math.min(ax, bx) && x <= Math.max(ax, bx)) return az + (bz - az) * (x - ax) / (bx - ax || 1); } return -2; }
/** The caravan halt and the wayside stalls on the verges of the last 80 m before the gate: tethered pack-asses with their loads and a trough, a stall of pots and
 *  cloth, goods on mats, wood and straw, a jar-seller's row; the people at them are in people(). */
function verge() {
  const E = [], rand = rng(5150), put = (t, x, dz, rot, o = {}) => { const z = roadZ(x) + dz; E.push({ t, at: [x, z], y: h(x, z), rot, seed: Math.floor(rand() * 1e9), ...o }); };
  // north verge: the halt (donkeys tethered nose to the wall, packs off, a trough and a stack of fodder)
  for (const [x, dz] of [[-128, -5.3], [-125.4, -6.0], [-122.6, -5.4], [-119.6, -6.2]]) put('animal', x, dz, Math.PI + (rand() - 0.5) * 0.8, { kind: 'donkey', gear: rand() < 0.5, seed: Math.floor(x * 7) });
  put('sacks', -126.6, -4.7, 0.4, { n: 4 }); put('sacks', -121, -4.8, -0.3, { n: 3 }); put('crates', -123.8, -4.6, 0.1, { n: 2 });
  put('trough', -123.9, -7.6, 0, {}); put('haystack', -116, -8.6, 0, {}); put('firewood', -128.2, -7.4, 0, { len: 1.4 });
  put('barrel', -118.4, -4.7, 0, { n: 2 });
  // south verge: the stall of the potter and the cloth-seller, the jar-seller's row, goods on mats, a boy's basket of figs
  put('stall', -126.5, 5.9, Math.PI, { w: 2.8, d: 1.5, awning: 'cloth_ochre', stripe: 'cloth_red' });
  put('stall', -118.5, 6.1, Math.PI, { w: 2.6, d: 1.4, awning: 'cloth_white', stripe: 'cloth_indigo' });
  for (let k = 0; k < 6; k++) put('pot', -131 + k * 0.62, 4.4 + (k % 2) * 0.35, 0, { kind: ['pithos', 'amphora', 'water_pot', 'dark_pot', 'amphora', 'water_pot'][k], n: 1 + (k % 3) });
  put('goods_mat', -122.5, 4.9, 0.1, { goods: ['basket', 'heap', 'basket'] }); put('goods_mat', -113.4, 5.2, -0.1, { goods: ['basket'] });
  put('basket', -121.4, 5.7, 0, { n: 3 }); put('stool', -125.6, 4.6, 0, {}); put('stool', -117.4, 4.9, 0, {});
  put('drying_tray', -129.2, 6.9, 0.5, {}); put('drying_tray', -115.2, 7.2, 1.1, {});
  // a drystone terrace wall's gaps filled with piled stone and a stack of cut wood at the foot of the bastion's ramp-side
  put('firewood', -112.6, -6.3, 0.1, { len: 1.6 }); put('sacks', -112.0, 6.4, 0.2, { n: 3 });
  return E;
}

/** The dry-stone walls that edge the lanes where no house does (terraces and fields), broken at the cross lanes, at houses and by gates now and then. */
function nearLane(x, z) {
  for (let li = 0; li < LANES.length; li++) {
    const lane = LANES[li], m = li === 0 ? 3.5 : 2.0;
    for (let i = 0; i < lane.length - 1; i++) {
      const [ax, az] = lane[i], [bx, bz] = lane[i + 1], vx = bx - ax, vz = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * vx + (z - az) * vz) / (vx * vx + vz * vz)));
      if (Math.hypot(x - ax - vx * t, z - az - vz * t) < m) return true;
    }
  }
  return false;
}
function laneWalls() {
  const E = [], rand = rng(606), courts = lots().filter((l) => l.court).map((l) => l.court);
  const free = (x, z) => !(inHouse(x, z, 1.1) || courts.some((c) => x > c[0] - 1.2 && x < c[2] + 1.2 && z > c[1] - 1.2 && z < c[3] + 1.2) || nearLane(x, z) || sdCircuit(x, z) < 8
    || Math.hypot(x, z) > RADIUS - 24 || (x > TREAS.x0 - 10 && x < TREAS.xf + 6 && Math.abs(z - TREAS.z) < 16) || Math.hypot(x - TREAS.x, z - TREAS.z) < 30);
  LANES.forEach((lane, li) => {
    for (let i = 0; i < lane.length - 1; i++) {
      const [ax, az] = lane[i], [bx, bz] = lane[i + 1], L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L;
      for (const side of [-1, 1]) {
        const off = (li === 0 ? 3.9 : 2.4) * side;
        let run = [];
        const flush = () => { if (run.length > 1) E.push({ t: 'dry_wall', pts: run, ys: run.map(([x, z]) => h(x, z)), h: 0.85 + rand() * 0.3, th: 0.55, seed: Math.floor(rand() * 1e6) }); run = []; };
        for (let s = 0; s <= L; s += 1.3) {
          const x = ax + ux * s - uz * off, z = az + uz * s + ux * off;
          if (!free(x, z) || rand() < 0.012) { flush(); continue; }
          run.push([x, z]);
        }
        flush();
      }
    }
  });
  return E;
}

/** The chamber tombs cut into the north-west slope, their facades turned down the hill; the spring's basin at the cross of the lanes. */
function hillside() {
  const E = [], rand = rng(910), found = [];
  const grad = (x, z) => [(h(x + 1, z) - h(x - 1, z)) / 2, (h(x, z + 1) - h(x, z - 1)) / 2];
  for (let tries = 0; tries < 400 && found.length < 5; tries++) {
    const x = -150 + rand() * 55, z = -98 + rand() * 40;
    if (onLane(x, z, 6) || inHouse(x, z, 4) || sdCircuit(x, z) < 20 || found.some(([a, b]) => Math.hypot(a - x, b - z) < 16)) continue;
    const [gx, gz] = grad(x, z), g = Math.hypot(gx, gz);
    if (g < 0.13 || g > 0.9) continue;
    found.push([x, z, Math.atan2(-gx, -gz)]);
  }
  for (const [x, z, rot] of found) { const px = x + Math.sin(rot) * 1.0, pz = z + Math.cos(rot) * 1.0; E.push({ t: 'chamber_tomb', at: [px, pz], y: h(px, pz), rot, seed: Math.floor(rand() * 1e6) }); }
  for (const [x, z] of [[-126, 7], [-124, 9], [-140, 4], [-128, -8]]) {
    if (inHouse(x, z, 3) || onLane(x, z, 2.6)) continue;
    E.push({ t: 'basin', at: [x, z], y: h(x, z) + 0.05, rot: 0, seed: 3 });
    break;
  }
  return E;
}

export async function town() {
  const plans = [], L = lots().filter((l) => l.kind !== 'granary');
  // houses in tiles of 64 m (each tile a few merged draws, culled together)
  const tiles = new Map();
  for (const l of L) { const k = Math.floor(((l.rect[0] + l.rect[2]) / 2 + 256) / 96) + '_' + Math.floor(((l.rect[1] + l.rect[3]) / 2 + 256) / 96); if (!tiles.has(k)) tiles.set(k, []); tiles.get(k).push(l); }
  for (const [k, list] of tiles) {
    const els = [], rooms = [];
    for (const l of list) {
      const fr = frame(l), door = fr.P(l.du, -1.3), gd = ground.height(...door);
      els.push({ t: 'house', rect: l.rect, y: l.y, face: l.face, storeys: l.storeys, seed: l.seed, kind: l.kind, trade: l.trade, du: l.du, gd, lit: l.lit, ...(l.inside ? { low: l.y - 2.5 } : {}) });
      if (l.court) els.push({ t: 'forecourt', rect: l.court, face: l.face, y: l.y, du: l.du, seed: l.seed });
      const [x0, z0, x1, z1] = l.rect, st = l.kind === 'house' ? l.storeys : 1;
      const name = l.kind === 'store' ? 'a storehouse' : l.kind === 'workshop' ? `a ${l.trade}'s workshop` : l.kind === 'cult' ? 'a shrine' : l.kind === 'guard' ? 'the guard-room' : 'a house';
      rooms.push({ id: name, rect: [x0 + 0.5, z0 + 0.5, x1 - 0.5, z1 - 0.5], y: l.y, kind: 'inner' });
      if (st > 1) rooms.push({ id: 'the loft', rect: [x0 + 0.5, z0 + 0.5, x1 - 0.5, z1 - 0.5], y: l.y + 2.95, kind: 'inner' });
    }
    plans.push({ ...base(`mycenae-houses-${k}`, 'mycenaean', els), rooms });
  }
  // places kept free of the engine's street life: the Treasury's dromos and façade, the approach road's walking line
  plans.push(base('mycenae-keep', 'mycenaean', [{ t: 'precinct', rect: [TREAS.x0 - 3, TREAS.z - 7, TREAS.xf + 6, TREAS.z + 7] }, { t: 'precinct', rect: [-190, -3.2, -107, 2.2] }, { t: 'precinct', rect: [-107, -3.4, -84, 3.4] }, { t: 'precinct', rect: [24, 1.0, 80, 5.2] }, ...RAMP.slice(0, -1).map(([ax, az], i) => { const [bx, bz] = RAMP[i + 1]; return { t: 'precinct', rect: [Math.min(ax, bx) - 2.3, Math.min(az, bz) - 2.3, Math.max(ax, bx) + 2.3, Math.max(az, bz) + 2.3] }; })]));
  plans.push(base('mycenae-yards', 'mycenaean', yards()));
  plans.push(base('mycenae-walls', 'mycenaean', laneWalls()));
  plans.push(base('mycenae-hillside', 'mycenaean', hillside()));
  plans.push(base('mycenae-dress', 'life', [...dress(), ...verge()]));
  plans.push(base('mycenae-people', 'life', people()));
  plans.push(base('mycenae-beasts', 'life', beasts()));
  return plans;
}
