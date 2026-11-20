// Lhasa — the dressing of Shöl's lanes and the street's fronts at eye level (docs/settlements/lhasa.md §15): dung cakes
// drying on the whitewashed walls (the plateau's fuel), firewood and fodder stacked at the house feet, water jars,
// baskets, sacks and churns by the gates, prayer flags strung over the lanes from roof to roof, a dog asleep in the
// sun, a goat or a donkey tethered, an old woman on her stool at the gate; the trading houses' goods before their doors,
// their butter-lamp lanterns. All from layout.js (the lots and the shops), seeded; nothing hard-coded.
import { lots, shops, SHOL, inRect, STREET } from './layout.js';
import { ground } from './ground.js';
import { openWalks } from './upstairs.js';
import { placeWalks, shopWalks } from './openwalk.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const OUT = { s: [0, 1], n: [0, -1], e: [1, 0], w: [-1, 0] };
const face = (n) => Math.atan2(n[0], n[1]);
const ROT = { s: 0, n: Math.PI, e: Math.PI / 2, w: -Math.PI / 2 };

/** { dung: [...dung_wall], flags: [...flag_line] (tibetan style), life: [...] (life style) } */
let CACHE = null, ROUTES = null;
/** Is (x, z) within d of a route a visitor walks into an opened house (upstairs.js)? A prop at the foot of a wall is moved along the wall, or left out, where it would stand in the way. */
const onRoute = (x, z, d = 1.55) => (ROUTES ||= [...openWalks((px, pz) => ground.height(px, pz)), ...placeWalks(), ...shopWalks()]).some((w) => w.some((a, i) => {
  if (!i) return false;
  const b = w[i - 1], dx = a[0] - b[0], dz = a[1] - b[1], t = Math.max(0, Math.min(1, ((x - b[0]) * dx + (z - b[1]) * dz) / (dx * dx + dz * dz || 1)));
  return Math.hypot(b[0] + t * dx - x, b[1] + t * dz - z) < d;
}));
/** The dogs and goats of the lanes within 150 m of the lane's crossing are critters (fauna.js, with behaviour); the rest are still figures of the street life. */
const AT_LANE = (x, z) => Math.hypot(x, z - 134) < 150;
export function dressing() {
  if (CACHE) return CACHE;
  const rand = rng(1696), D = [], F = [], L = [], C = [];
  const pick = (a) => a[Math.floor(rand() * a.length)], sd = () => Math.floor(rand() * 1e9);
  const all = lots();
  for (const l of all) {
    const [x0, z0, x1, z1] = l.rect, inSh = inRect(SHOL, (x0 + x1) / 2, (z0 + z1) / 2), y = inSh ? 0 : ground.height((x0 + x1) / 2, (z0 + z1) / 2);
    if (Math.hypot((x0 + x1) / 2, (z0 + z1) / 2) > 330) continue;
    // the side faces (west, east) and the north face: long blank ground floors (the gate and its wall are on the south)
    const faces = [['e', [x1, 0], 1], ['w', [x0, 0], 1], ['n', [0, z0], 0]];
    const dungOn = rand() < 0.8 ? faces[Math.floor(rand() * faces.length)] : null;
    for (const [f, , ] of faces) {
      const n = OUT[f], along = f === 'n' ? [x0, x1] : [z0, z1], len = along[1] - along[0], cen = (k) => (f === 'n' ? [along[0] + k, z0] : [f === 'e' ? x1 : x0, along[0] + k]);
      const isDung = dungOn && dungOn[0] === f;
      if (isDung) { const w = 2.4 + rand() * 1.8, k = 2.5 + rand() * Math.max(0, len - 5 - w) + w / 2; D.push({ t: 'dung_wall', at: cen(Math.min(k, len - 2.2)), n: f, w, h: 0.8 + rand() * 0.6, y, seed: sd() }); }
      // at the house foot (not on the side of the gate: the south) — a stack, a jar, baskets
      const k = 2 + rand() * (len - 4);
      const r = rand(), at = cen(k), o = [at[0] + n[0] * 0.55, at[1] + n[1] * 0.55], P = (e) => { if (!onRoute(o[0] + n[0] * 0.9, o[1] + n[1] * 0.9)) L.push(e); };
      if (r < 0.32) P({ t: 'firewood', at: o, y, rot: f === 'n' ? 0 : Math.PI / 2, len: 1.3 + rand(), seed: sd() });
      else if (r < 0.5) P({ t: 'pot', kind: pick(['dark_pot', 'water_pot', 'dark_pot']), at: o, y, rot: rand() * 6.28, n: 1 + Math.floor(rand() * 3), seed: sd() });
      else if (r < 0.62) P({ t: 'basket', at: o, y, rot: rand() * 6.28, n: 1 + Math.floor(rand() * 2), seed: sd() });
      else if (r < 0.72) P({ t: 'sacks', at: o, y, rot: ROT[f], n: 2 + Math.floor(rand() * 2), seed: sd() });
      else if (r < 0.78) P({ t: 'barrel', at: o, y, rot: 0, n: 1 + Math.floor(rand() * 2), seed: sd() });
      // a second thing further along
      if (rand() < 0.4) { const k2 = 1.5 + rand() * (len - 3), a2 = cen(k2); if (!onRoute(a2[0] + n[0] * 1.2, a2[1] + n[1] * 1.2)) L.push({ t: pick(['basket', 'pot', 'firewood']), kind: 'dark_pot', at: [a2[0] + n[0] * 0.5, a2[1] + n[1] * 0.5], y, rot: f === 'n' ? 0 : Math.PI / 2, len: 1.0, seed: sd() }); }
    }
    // an old woman at her stool on a sunny wall (the east and south sides of the lanes), a dog in the lane, a goat or a donkey tied at the wall
    if (inSh) {
      const roll = rand();
      const zc = z0 + 3 + rand() * (z1 - z0 - 6);
      if (roll < 0.12) { const e = { t: 'animal', kind: 'dog', at: [x1 + 1.1, zc], y, rot: rand() * 6.28, seed: sd() }; (AT_LANE(...e.at) ? C : L).push(e); }
      else if (roll < 0.17) { const e = { t: 'animal', kind: 'goat', at: [x0 - 1.2, zc], y, rot: rand() * 6.28, seed: sd(), graze: false }; (AT_LANE(...e.at) ? C : L).push(e); }
      else if (roll < 0.2) L.push({ t: 'animal', kind: 'donkey', at: [x1 + 1.3, zc], y, rot: ROT.e + (rand() - 0.5), seed: sd(), graze: false });
      else if (roll < 0.3) {
        const at = [x1 + 0.7, zc];
        L.push({ t: 'stool', at, y, rot: ROT.e, seed: sd() });
        L.push({ t: 'figure', at, y, rot: ROT.e, h: 1.45 + rand() * 0.12, seed: sd(), dress: 'robe', cloth: pick(['cloth_black', 'cloth_brown', 'cloth_grey']), cloth2: pick(['cloth_red', 'cloth_green', 'cloth_ochre', 'paint_blue']), over: 'apron', skin: pick(['skin_medium', 'skin_dark']), hat: 'none', hair: 'bun', hairMat: 'hair_dark', beard: false, feet: 'shod', pose: 'sit' });
      }
    }
  }
  // prayer flags across the lanes between neighbouring houses of a row (roof corner to roof corner)
  const rows = new Map();
  for (const l of all) { const k = Math.round(l.rect[1] * 2); if (!rows.has(k)) rows.set(k, []); rows.get(k).push(l); }
  for (const row of rows.values()) {
    row.sort((a, b) => a.rect[0] - b.rect[0]);
    for (let i = 0; i + 1 < row.length; i++) {
      const a = row[i].rect, b = row[i + 1].rect, gap = b[0] - a[2];
      if (gap < 1.5 || gap > 4.5 || rand() > 0.5 || !inRect(SHOL, a[2], a[1])) continue;
      const z = Math.max(a[1], b[1]) + 1.6 + rand() * (Math.min(a[3], b[3]) - Math.max(a[1], b[1]) - 3.2);
      F.push({ t: 'flag_line', a: [a[2] - 0.1, z], b: [b[0] + 0.1, z + 0.5], y0: 6.35, y1: 6.35, sag: 0.35 });
    }
  }
  // the trading houses' fronts on the street: goods stacked at the door, a butter-lamp lantern and a sign; the keeper on his bench
  const E = { w: [-1, 0], e: [1, 0] };
  for (const s of shops()) {
    if (s.kind === 'stall') continue;
    const [x0, z0, x1, z1] = s.rect, fx = s.door === 'e' ? x1 : x0, n = E[s.door], zc = (z0 + z1) / 2, tea = s.kind === 'tea';
    const out = (d, dz) => [fx + n[0] * d, zc + dz], rot = ROT[s.door];
    L.push({ t: 'hang_lantern', at: out(0.05, -(z1 - z0) * 0.32), y: 3.1, rot, kind: 'paper', seed: 1 }, { t: 'hang_lantern', at: out(0.05, (z1 - z0) * 0.32), y: 3.1, rot, kind: 'paper', seed: 2 });
    if (tea) { L.push({ t: 'pot', kind: 'dark_pot', at: out(0.5, (z1 - z0) * 0.38), y: 0, rot: 0, n: 3, seed: s.seed }, { t: 'firewood', at: out(0.5, -(z1 - z0) * 0.4), y: 0, rot: Math.PI / 2, len: 1.5, seed: s.seed }); continue; }
    L.push({ t: 'sacks', at: out(0.7, -(z1 - z0) * 0.34), y: 0, rot, n: 4, seed: s.seed }, { t: 'basket', at: out(0.55, (z1 - z0) * 0.36), y: 0, rot: 0, n: 2, seed: s.seed + 1 }, { t: 'pot', kind: 'blue_jar', at: out(0.5, (z1 - z0) * 0.28), y: 0, rot: 0, seed: s.seed + 2 });
    if (rand() < 0.6) L.push({ t: 'goods_mat', at: out(1.1, (rand() - 0.5) * 2), y: 0, rot, seed: s.seed });
  }
  // the street's own: a woman with her basket, traders talking at the booths, a dog, pilgrims prostrating are in town.js
  void STREET;
  return (CACHE = { dung: D, flags: F, life: L, crit: C });
}
