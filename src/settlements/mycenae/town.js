// Mycenae — the townscape (docs/settlements/mycenae.md §5, §9): the houses of the citadel and the lower town, the workshops with their yards,
// the people at the gate, on the ramp, in the Great Court and the megaron, in the lanes; the herds and the donkeys.

import { RADIUS, LANES, RAMP, lots, PALACE, PAL_Y, GATE_Y, GCA, TREAS, rng, terrain, onLane } from './layout.js';
import { ground } from './ground.js';

const base = (id, style, elements) => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-107, 0], facing: 'e' } });
const h = (x, z) => ground.height(x, z);
const CL = ['cloth_white', 'cloth_red', 'cloth_ochre', 'cloth_indigo', 'cloth_brown'];

function yards() {
  const Y = [], rand = rng(77);
  for (const l of lots()) {
    if (l.kind !== 'workshop') continue;
    const [x0, z0, x1, z1] = l.rect, k = ['kiln', 'pithoi', 'loom', 'press'][Math.floor(rand() * 4)];
    const out = { n: [(x0 + x1) / 2, z0 - 2.6], s: [(x0 + x1) / 2, z1 + 2.4], w: [x0 - 2.6, (z0 + z1) / 2], e: [x1 + 2.4, (z0 + z1) / 2] }[l.face === 'n' ? 'n' : l.face === 's' ? 's' : l.face === 'w' ? 'w' : 'e'];
    Y.push({ t: 'yard', kind: k, at: out, y: h(...out) + 0.02, seed: l.seed });
  }
  return Y;
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
  return T;
}
function beasts() {
  const rand = rng(1252), L = [];
  // donkeys on the road to the gate and goats on the slope above the lower town, a dog or two at the doors
  for (const [x, z] of [[-170, 4], [-142, -4], [-125, 3.5]]) L.push({ t: 'animal', kind: 'donkey', at: [x, z], y: h(x, z), rot: rand() * 6.28, seed: Math.floor(rand() * 1e6), gear: true });
  for (let k = 0; k < 14; k++) { const x = -175 + rand() * 60, z = -70 + rand() * 40; if (Math.hypot(x, z) < RADIUS - 15) L.push({ t: 'animal', kind: rand() < 0.6 ? 'goat' : 'sheep', at: [x, z], y: h(x, z), rot: rand() * 6.28, seed: k + 5 }); }
  for (const l of lots().filter((q) => !q.inside).slice(0, 10)) { const x = (l.rect[0] + l.rect[2]) / 2, z = (l.rect[1] + l.rect[3]) / 2 + (l.rect[3] - l.rect[1]) / 2 + 2; L.push({ t: 'animal', kind: 'dog', at: [x, z], y: h(x, z), rot: rand() * 6.28, seed: l.seed % 97 }); }
  void TREAS; void LANES; void terrain;
  return L;
}

export async function town() {
  const plans = [], L = lots();
  const kindEl = (l) => (l.kind === 'granary' ? null : { t: 'house', rect: l.rect, y: l.y, face: l.face, storeys: l.storeys, seed: l.seed, kind: l.kind, ...(l.inside ? { low: l.y - 2.5 } : {}) });
  const els = L.map(kindEl).filter(Boolean);
  for (let i = 0; i < els.length; i += 16) plans.push(base(`mycenae-houses-${i / 16}`, 'mycenaean', els.slice(i, i + 16)));
  plans.push(base('mycenae-yards', 'mycenaean', yards()));
  plans.push(base('mycenae-people', 'life', people()));
  plans.push(base('mycenae-beasts', 'life', beasts()));
  return plans;
}
