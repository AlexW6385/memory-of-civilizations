import { openLots, lodTiles } from '../lod.js';
// The village (docs/settlements/conques.md §1f–§1h, §5): houses of schist and yellow stone with lauze roofs in rows
// along the cobbled lanes of the terraced shelves, stair streets between them, retaining walls, walled gardens, the
// pilgrims' hostel, the shops along the pilgrims' way with their goods, the fountains, the gate; and its people
// (§5a): pilgrims on the road to Santiago before the west portal, monks of the abbey, the hostel's guests.
import { RADIUS, ABBEY, BAND, STAIRS, STAIR, GATE, FOUNTAINS, HOSTEL, PILGRIM_WAY, lots, gardens, lanes, stairs, level, laneZ, bandZ, shelf, height, inRect } from './layout.js';
import { shopPoint } from '../../styles/romanesque/village.js';

const base = (id, elements, style = 'vernacular') => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-40, 0], facing: 'e' } });
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
const face = (from, to) => Math.atan2(-(to[0] - from[0]), -(to[1] - from[1]));       // a figure faces −z when rot = 0

/** Lanes, stairs, retaining walls, gardens, fountains, the gate and the road down to the bridge (style romanesque). */
function works() {
  const E = [], hw = STAIR.tread / 2;
  // the cobbled lanes, broken at the stair streets
  for (const l of lanes()) {
    let x = l.x0;
    for (const sx of STAIRS.filter((s) => s > l.x0 && s < l.x1)) { if (sx - hw > x) E.push({ t: 'calade', x0: x, x1: sx - hw, z: l.z, y: level(l.k), w: 3 }); x = sx + hw; }
    if (l.x1 > x) E.push({ t: 'calade', x0: x, x1: l.x1, z: l.z, y: level(l.k), w: 3 });
  }
  for (const s of stairs()) {
    const landings = [], steps = [];
    for (let k = s.k0; k <= s.k1; k++) landings.push({ z: laneZ(k), y: level(k) + 0.035 });
    for (let k = s.k0; k < s.k1; k++) steps.push({ z0: laneZ(k) + 1.5, z1: laneZ(k + 1) - 1.5, y0: level(k) + 0.035, y1: level(k + 1) + 0.035 });
    E.push({ t: 'stairs', x: s.x, landings, steps, shelf });
  }
  // the retaining walls at the lower edge of each shelf, but at the stairs and the slope under the terrace
  const t = ABBEY.terrace;
  for (let k = 0; k + 1 < BAND.n; k++) {
    const za = bandZ(k) + BAND.wall[0], zb = bandZ(k) + BAND.wall[1], zm = (za + zb) / 2;
    const xr = Math.sqrt(Math.max(0, 174 ** 2 - zm * zm));
    if (xr < 8) continue;
    const cuts = STAIRS.map((sx) => [sx - hw - STAIR.cheek - 0.05, sx + hw + STAIR.cheek + 0.05]);
    if (zm > t[1] - 14 && zm < t[3] + 14) cuts.push([t[0] - 14, t[2] + 14]);
    cuts.sort((a, b) => a[0] - b[0]);
    let x = -xr;
    for (const [a, b] of [...cuts, [xr, xr + 1]]) {
      if (b <= x) continue;
      if (a > x + 1) E.push({ t: 'retain', rect: [x, za, Math.min(a, xr), zb], y0: level(k + 1) - 0.9, y1: level(k) });
      x = Math.max(x, b);
    }
  }
  for (const g of gardens()) E.push({ t: 'jardin', ...g });
  for (const f of FOUNTAINS) E.push({ t: 'fontaine', ...f, y: f.y ?? height((f.rect[0] + f.rect[2]) / 2, (f.rect[1] + f.rect[3]) / 2) });
  E.push({ t: 'porte', x: GATE.x, z: GATE.z, y: level(BAND.n - 1), w: GATE.w });
  // the road from the gate down the slope to the bridge's abutment, laid on the ground
  const pts = []; for (let z = GATE.z + 1.9; z < 205.4; z += 2.5) pts.push([GATE.x, z, height(GATE.x, z)]);
  E.push({ t: 'strip', pts, w: 2.4 });
  return { id: 'conques-works', style: 'romanesque', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: E, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-40, 0], facing: 'e' } };
}

/** The goods and signs of the shops, the props of the lanes: instanced life elements (style life) and the staffs for sale (romanesque). */
function goods() {
  const rand = rng(1121), L = [], S = [];
  const kinds = ['shells', 'staffs', 'bread', 'cloth', 'pots'];
  for (const l of lots()) {
    const [x0, z0, x1, z1] = l.rect, f = l.front, along = f === 's' || f === 'n', Lw = along ? x1 - x0 : z1 - z0;
    const P = (u, v) => (f === 's' ? [x1 - u, z1 - v] : f === 'n' ? [x0 + u, z0 + v] : f === 'e' ? [x1 - v, z0 + u] : [x0 + v, z1 - u]);
    const out = { s: 0, n: Math.PI, e: Math.PI / 2, w: -Math.PI / 2 }[f];
    if (l.shop) {
      const sp = shopPoint(l), a0 = sp.a0, kind = kinds[l.seed % kinds.length], top = l.y + 0.96, dir = l.seed % 2 ? 1 : -1;
      const at = (u, v) => P(a0 + u, v);
      if (kind === 'shells') { L.push({ t: 'basket', at: at(-0.6, 0.15), y: top, rot: out, n: 2, seed: l.seed, goods: 'ivory' }); L.push({ t: 'basket', at: at(0.55, 0.2), y: top, rot: out, n: 1, seed: l.seed + 1, goods: 'ivory' }); }
      else if (kind === 'staffs') { L.push({ t: 'basket', at: at(-0.5, 0.2), y: top, rot: out, n: 2, seed: l.seed, goods: 'wood_ochre' }); }
      else if (kind === 'bread') { L.push({ t: 'basket', at: at(-0.6, 0.15), y: top, rot: out, n: 2, seed: l.seed, goods: 'hide_tan' }); L.push({ t: 'basket', at: at(0.5, 0.2), y: top, rot: out, n: 2, seed: l.seed + 2, goods: 'hide_tan' }); }
      else if (kind === 'cloth') { L.push({ t: 'basket', at: at(-0.5, 0.2), y: top, rot: out, n: 2, seed: l.seed, goods: 'cloth_red' }); L.push({ t: 'basket', at: at(0.5, 0.2), y: top, rot: out, n: 1, seed: l.seed + 3, goods: 'cloth_ochre' }); }
      else L.push({ t: 'pot', at: at(-0.5, 0.2), y: top, rot: out, n: 3, seed: l.seed });
      L.push({ t: 'pot', at: at(0.6, 0.3), y: top, rot: out, n: 2, seed: l.seed + 5 });
      L.push({ t: 'barrel', at: P(a0 - dir * 2.0, -0.55), y: l.y, rot: out, n: 1, seed: l.seed });
      L.push({ t: 'sacks', at: P(a0 - dir * 1.5, -0.55), y: l.y, rot: out, n: 3, seed: l.seed + 7 });
      L.push({ t: 'shop_sign', at: P(a0 + dir * 1.72, 0), y: l.y, h: 2.85, rot: out, cloth: ['cloth_red', 'cloth_indigo', 'cloth_green', 'cloth_ochre'][l.seed % 4], len: 0.8, out: 0.9, letters: 2 });
      // staffs for sale, stood against the pier beside the arch
      for (let k = 0; k < 4; k++) { const [px, pz] = P(a0 - dir * 1.62 - k * 0.07, -0.18 - (k % 2) * 0.06); S.push({ t: 'bourdon', at: [px, pz], y: l.y, h: 1.7 + rand() * 0.25 }); }
    } else if (!l.hostel && Lw > 4 && rand() < 0.4) {
      // the door's front: firewood stacked against the wall, a tub, a bench, a barrow, hens
      const u = rand() < 0.5 ? 0.5 : Lw - 0.5, pick = rand();
      if (pick < 0.35) L.push({ t: 'firewood', at: P(u, -0.3), y: l.y, rot: out + Math.PI / 2, len: 1.2, seed: l.seed });
      else if (pick < 0.6) L.push({ t: 'barrel', at: P(u, -0.45), y: l.y, rot: out, n: 1, seed: l.seed });
      else if (pick < 0.8) L.push({ t: 'bench', at: P(Lw / 2, -0.4), y: l.y, rot: out + Math.PI, len: 1.6 });
      else L.push({ t: 'chickens', at: P(Lw / 2, -1.0), y: l.y, rot: out, n: 4, kind: 'hen', seed: l.seed });
    }
  }
  // by the hostel: a bench, water barrels, firewood against the end wall
  const [hx0, hz0, hx1, hz1] = HOSTEL.rect;
  L.push({ t: 'bench', at: [hx0 + 4, hz1 + 0.5], y: level(6), rot: Math.PI, len: 2.0 });
  L.push({ t: 'barrel', at: [hx1 - 1.5, hz1 + 0.45], y: level(6), rot: 0, n: 2, seed: 4 });
  L.push({ t: 'firewood', at: [hx0 + 0.2, hz0 + 4], y: level(6), rot: Math.PI / 2, len: 1.6, seed: 3 });
  return [base('conques-goods', L, 'life'), base('conques-wares', S, 'romanesque')];
}

function people() {
  const rand = rng(1120), L = [], S = [];
  const pick = (a) => a[Math.floor(rand() * a.length)];
  const pilgrim = (at, rot, pose = 'stand') => {
    const y = height(...at), H = 1.56 + rand() * 0.16, k = H / 1.65;
    L.push({ t: 'figure', at, y, rot, h: H, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: pick(['cloth_brown', 'cloth_grey', 'cloth_brown', 'cloth_ochre']), cloth2: pick(['cloth_grey', 'cloth_brown']), skin: 'skin_light', hat: rand() < 0.7 ? 'brim' : 'cap', hatMat: pick(['cloth_brown', 'cloth_black', 'cloth_grey']), pose });
    if (pose !== 'stand') return;
    // the staff in the right hand, its foot on the ground beside the right foot
    const hx = 0.235 * k, hz = -0.06 * k, c = Math.cos(rot), s = Math.sin(rot);
    S.push({ t: 'bourdon', at: [at[0] + hx * c + hz * s, at[1] - hx * s + hz * c], y, h: 1.75 + rand() * 0.2 });
  };
  const monk = (at, rot, pose = 'stand') => L.push({ t: 'figure', at, y: height(...at), rot, h: 1.62 + rand() * 0.12, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: 'cloth_black', cloth2: 'cloth_black', skin: 'skin_light', hat: 'veil', hatMat: 'cloth_black', pose });
  // before the west front: a knot of pilgrims looking up at the Judgement, two sitting on the terrace's edge
  const portal = [ABBEY.origin[0] + 1, 0];
  for (let k = 0; k < 9; k++) {
    const p = [ABBEY.origin[0] - 7 - rand() * 6, (rand() - 0.5) * 9];
    pilgrim(p, face(p, portal) + (rand() - 0.5) * 0.4);
  }
  for (const z of [-7.5, 6.8]) pilgrim([ABBEY.origin[0] - 12.5 + rand(), z], face([0, z], [0, 0]) + 0.6, 'sit_low');
  // monks at the cloister's west door and on the terrace south of the nave
  monk([ABBEY.origin[0] - 2.2, 16.2], face([0, 16.2], [1, 16.2]));
  monk([ABBEY.origin[0] - 2.4, 17.6], face([0, 17.6], [1, 16.6]), 'talk');
  monk([ABBEY.origin[0] - 6, 4.5], face([ABBEY.origin[0] - 6, 4.5], [ABBEY.origin[0] - 9, 2]), 'talk');
  // the hostel's door: two pilgrims resting on the bench, one standing with his staff
  const [hx0, , hx1, hz1] = HOSTEL.rect, yl = level(6);
  for (const dx of [4.4, 5.3]) { const at = [hx0 + dx, hz1 + 0.5]; L.push({ t: 'figure', at, y: yl, rot: Math.PI, h: 1.6, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: pick(['cloth_brown', 'cloth_grey']), cloth2: 'cloth_grey', skin: 'skin_light', hat: 'brim', hatMat: 'cloth_brown', pose: 'sit_low' }); }
  void hx1;
  pilgrim([hx0 + 9, hz1 + 1.6], face([0, 0], [-0.4, 1]));
  // inside the church: pilgrims kneeling in the choir aisles at the grilles, looking through at the Majesty, and in the ambulatory behind her; one standing with his staff
  const O = ABBEY.origin, maj = [O[0] + 41.8, O[1]];
  for (const [lx, lz] of [[35.2, -5.6], [37.4, -5.4], [36.3, 5.5], [38.6, 5.7], [48.2, -0.7], [48.1, 0.9]]) {
    const at = [O[0] + lx, O[1] + lz];
    L.push({ t: 'figure', at, y: 0, rot: face(at, maj), h: 1.58 + rand() * 0.14, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: pick(['cloth_brown', 'cloth_grey', 'cloth_ochre']), cloth2: 'cloth_grey', skin: 'skin_light', hat: rand() < 0.5 ? 'cap' : 'none', hatMat: 'cloth_brown', pose: 'kneel', arms: 'pray' });
  }
  { const at = [O[0] + 33.6, O[1] - 6.2]; L.push({ t: 'figure', at, y: 0, rot: face(at, maj), h: 1.66, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: 'cloth_brown', cloth2: 'cloth_grey', skin: 'skin_light', hat: 'brim', hatMat: 'cloth_black', pose: 'staff', carry: 'staff', len: 1.8 }); }
  return [base('conques-people', L, 'life'), base('conques-staffs', S, 'romanesque')];
}

export async function houses() {
  const all = lots(), open = new Map(all.filter((l) => l.open).map((l) => [l, l.open]));
  void openLots; void PILGRIM_WAY; void inRect;
  return lodTiles('conques-houses', 'romanesque', all.map((l) => ({ t: 'maison', ...l, ...(open.has(l) ? { open: l.open } : {}) })), { R: RADIUS, near: 230, entrance: { at: [-40, 0], facing: 'e' } });
}
export { works, goods, people };
