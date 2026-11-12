// Sanchi in the 1st century — the layout (docs/settlements/sanchi.md §2): the flat-topped hill
// rising from the plain of the Betwa, the Great Stupa and its companions and monasteries on the
// summit; the processional path climbing the north slope; the village at the hill's foot to the
// south and east; fields and tanks on the plain. Pure data. +x east, +z south.

export const RADIUS = 300;
export const TOP = 22;
export const SUMMIT = { c: [0, 0], half: [95, 95], round: 40 };
export const PATH = { x: 0, w: 5 };                         // up the north slope
/** The pilgrims' stair up the south slope from the village to the summit's south approach (x = 0, 6 m wide, z 94 → 126). */
export const STAIR = { x: 0, w: 3, z0: 94, z1: 126 };
/** The tank (a reservoir of the plain, its ghat on the north bank) south-east of the village; the water's level. */
export const TANK = { c: [100, 214], r: [30, 18], level: -1.4 };
/** The pilgrims' rest house and the tree shrine at the stair's foot. */
export const HALL = [-27, 133, -10, 143];
export const SHRINE = { c: [19, 139], r: 3.2 };
/** The foot of the north path (the settlement's entrance): a small plaza, a rest hall and stalls for those who come that way. */
export const NORTH = { plaza: [-9, -190, 9, -171], hall: [-30, -189, -15, -179], stalls: [[-10.5, -176, 'e', 'water'], [10.5, -176, 'w', 'flowers'], [-10.5, -183, 'e', 'flowers'], [10.5, -183, 'w', 'lamps']] };
export const tankD = (x, z) => (Math.hypot((x - TANK.c[0]) / TANK.r[0], (z - TANK.c[1]) / TANK.r[1]) - 1) * Math.min(...TANK.r);
export const inTank = (x, z) => tankD(x, z) < 0;
/** Stupa 2 on its built terrace at the foot of the west slope, against the hill (docs/settlements/sanchi.md §10). */
export const STUPA2 = { c: [-140, 0], terrace: [-156, -16, -124, 16], y: 1.5 };
/** Temple 40 on the summit, south-east of the Great Stupa (its platform 41.76 × 27.74 m). */
export const TEMPLE40 = { c: [40, 62], rect: [40 - 21.2, 62 - 14.2, 40 + 21.2, 62 + 14.2] };
/** A second, western monastery on the summit (its entrance on the west side), the form of the first. */
export const VIHARA2 = [-66, 2, -36, 32];
/** Small votive stupas on the summit (the hill is crowded with them), clear of the monuments and the ways: [x, z, scale]. */
export const VOTIVE = [[-48, -34, 0.13], [-44, -18, 0.11], [-40, 52, 0.12], [24, -56, 0.1], [74, 6, 0.12], [-72, -66, 0.1], [66, -70, 0.11], [-24, 62, 0.09]];
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
/** Outside distance from the summit's rounded square (0 on it). */
export function out(x, z) {
  const [hx, hz] = SUMMIT.half, r = SUMMIT.round, dx = Math.max(Math.abs(x - SUMMIT.c[0]) - (hx - r), 0), dz = Math.max(Math.abs(z - SUMMIT.c[1]) - (hz - r), 0);
  return Math.max(0, Math.hypot(dx, dz) - r);
}
export function height(x, z) {
  const d = out(x, z);
  let h = TOP * smooth(30, 0, d);
  // the path: a gentler ramp down the north slope
  if (Math.abs(x - PATH.x) < PATH.w + 3 && z < -SUMMIT.half[1] + 5) {
    const ramp = TOP * smooth(SUMMIT.half[1] + 75, SUMMIT.half[1] - 5, -z), k = smooth(PATH.w + 3, PATH.w, Math.abs(x - PATH.x));
    h = h * (1 - k) + Math.max(ramp, h * 0) * k;
  }
  // the south stair: the slope cut to a straight line from the summit's edge to the plain, so that the treads lie on it
  if (Math.abs(x - STAIR.x) < STAIR.w + 3 && z > STAIR.z0 - 4 && z < STAIR.z1 + 6) {
    const ramp = TOP * Math.max(0, Math.min(1, (STAIR.z1 - z) / (STAIR.z1 - STAIR.z0))), k = smooth(STAIR.w + 3, STAIR.w, Math.abs(x - STAIR.x));
    h = h * (1 - k) + ramp * k;
  }
  // Stupa 2's terrace: the ground kept under its paving
  if (inRect(STUPA2.terrace, x, z, 0.5)) h = Math.min(h, STUPA2.y - 0.3);
  const dt = tankD(x, z);
  if (dt < 6) h -= 3.4 * smooth(6, -2, dt);
  return h * (1 - smooth(RADIUS - 40, RADIUS - 5, Math.hypot(x, z)));
}
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const hash = (a) => { let s = Math.imul(a | 0, 2654435761) >>> 0; s ^= s >>> 15; s = Math.imul(s, 2246822519) >>> 0; return (s >>> 0) / 4294967296; };

// ── the village's streets (docs/settlements/sanchi.md §13): the pilgrims' road from the stair's foot south, the bazaar street
// across it, lanes and the way to the tank. axis 'x': runs east-west at z = c; 'z': north-south at x = c.
export const STREETS = [
  { id: 'pilgrim', axis: 'z', c: 0, w: 7, a: 127, b: 266, kind: 'main', from: 137 },
  { id: 'bazaar', axis: 'x', c: 150, w: 6, a: -125, b: 135, kind: 'main' },
  { id: 'e184', axis: 'x', c: 184, w: 4, a: -120, b: 140, kind: 'lane' },
  { id: 'e222', axis: 'x', c: 222, w: 4, a: -112, b: 62, kind: 'lane' },
  { id: 'n-72', axis: 'z', c: -72, w: 4, a: 153, b: 236, kind: 'lane' },
  { id: 'n-38', axis: 'z', c: -38, w: 3.5, a: 153, b: 236, kind: 'lane' },
  { id: 'n40', axis: 'z', c: 40, w: 3.5, a: 153, b: 236, kind: 'lane' },
  { id: 'n78', axis: 'z', c: 78, w: 3.5, a: 153, b: 190, kind: 'lane' },
  { id: 'tankway', axis: 'z', c: 100, w: 3.5, a: 153, b: 196, kind: 'lane' },
  { id: 'n-108', axis: 'z', c: -106, w: 3.5, a: 153, b: 232, kind: 'lane' },
];
export const streetRect = (s, m = 0) => (s.axis === 'x' ? [s.a, s.c - s.w / 2 - m, s.b, s.c + s.w / 2 + m] : [s.c - s.w / 2 - m, s.a, s.c + s.w / 2 + m, s.b]);
export const onStreet = (x, z, m = 0) => STREETS.some((s) => inRect(streetRect(s), x, z, m));
/** The plaza between the stair's foot and the first houses. */
export const PLAZA = [-12, 126, 12, 136];
const CORE = [0, 152];
const BLOCKED = () => [PLAZA, [HALL[0] - 2, HALL[1] - 2, HALL[2] + 2, HALL[3] + 2], [SHRINE.c[0] - SHRINE.r - 3, SHRINE.c[1] - SHRINE.r - 3, SHRINE.c[0] + SHRINE.r + 3, SHRINE.c[1] + SHRINE.r + 6]];
const overlap = (a, b, m = 0) => a[0] < b[2] + m && a[2] > b[0] - m && a[1] < b[3] + m && a[3] > b[1] - m;
const TRADES = ['flowers', 'lamps', 'incense', 'bowls', 'robes', 'ivory', 'grain', 'potter', 'cloth', 'sweets', 'flowers', 'lamps', 'smith', 'oil'];
let LOTS = null, YARDS = null;
/** The buildings: rows along both sides of each street, their fronts a verandah's width (1.2 m) back from the street's edge. */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = []; YARDS = [];
  const rand = rng(50), blocked = BLOCKED(), placed = [];
  const free = (r, s) => {
    const cx = (r[0] + r[2]) / 2, cz = (r[1] + r[3]) / 2;
    if (Math.hypot(cx, cz) > RADIUS - 44 || out(cx, cz) < 34) return false;
    if (tankD(cx, cz) < 16 || [[r[0], r[1]], [r[2], r[1]], [r[0], r[3]], [r[2], r[3]]].some(([x, z]) => tankD(x, z) < 12)) return false;
    for (const b of blocked) if (overlap(r, b)) return false;
    for (const o of STREETS) if (o !== s && overlap(r, streetRect(o, 0.3))) return false;
    for (const p of placed) if (overlap(r, p, 0.25)) return false;
    return true;
  };
  for (const s of STREETS) {
    for (const side of [-1, 1]) {
      let t = Math.max(s.a, s.from ?? s.a) + 1 + rand() * 2;
      while (t < s.b - 4) {
        const main = s.kind === 'main', r0 = rand();
        const kind = main ? (r0 < 0.55 ? 'shop' : r0 < 0.7 ? 'merchant' : r0 < 0.88 ? 'home' : 'mud') : (r0 < 0.4 ? 'home' : r0 < 0.68 ? 'mud' : r0 < 0.76 ? 'merchant' : r0 < 0.86 ? 'hut' : r0 < 0.93 ? 'shed' : 'shop');
        const w = kind === 'shop' ? 3.6 + rand() * 1.6 : kind === 'merchant' ? 6 + rand() * 1.5 : kind === 'shed' ? 5 + rand() * 2 : 4.4 + rand() * 2.4;
        const d = kind === 'merchant' ? 8 + rand() * 1.5 : 6.2 + rand() * 1.6, off = s.w / 2 + 1.2;
        const u0 = t, u1 = t + w;
        const r = s.axis === 'x' ? (side < 0 ? [u0, s.c - off - d, u1, s.c - off] : [u0, s.c + off, u1, s.c + off + d]) : (side < 0 ? [s.c - off - d, u0, s.c - off, u1] : [s.c + off, u0, s.c + off + d, u1]);
        const front = s.axis === 'x' ? (side < 0 ? 's' : 'n') : (side < 0 ? 'e' : 'w');
        const cx = (r[0] + r[2]) / 2, cz = (r[1] + r[3]) / 2, dc = Math.hypot(cx - CORE[0], cz - CORE[1]);
        const keep = !main && dc > 80 ? hash(Math.floor(cx * 3) * 977 + Math.floor(cz * 3)) > smooth(80, 175, dc) * 0.7 : true;
        const ok = free(r, s);
        if (ok) {
          placed.push(r);
          if (keep) {
            const seed = Math.floor(rand() * 1e6);
            const open = (kind === 'shop' || kind === 'home' || kind === 'merchant') && dc < 110 && rand() < (kind === 'shop' ? 0.75 : 0.4);
            LOTS.push({ rect: r, seed, y: 0, foot: -0.2, front, kind, open, street: s.id, main, trade: TRADES[seed % TRADES.length] });
          }
        }
        t = ok ? u1 + 0.15 + (rand() < 0.08 ? 2.5 : 0) : t + 0.8;
      }
    }
  }
  // a few farmsteads on the plain beyond the village
  for (let k = 0; k < 160; k++) {
    const a = rand() * 6.28, rr = 200 + rand() * 60, x = Math.cos(a) * rr, z = Math.sin(a) * rr;
    if (z < 120 || Math.hypot(x, z) > RADIUS - 50 || out(x, z) < 45) continue;
    const w = 5 + rand() * 2, r = [x, z, x + w, z + 6.5];
    if (placed.some((p) => overlap(r, p, 14)) || STREETS.some((s) => overlap(r, streetRect(s, 8))) || tankD(x, z) < 22) continue;
    placed.push(r);
    LOTS.push({ rect: r, seed: Math.floor(rand() * 1e6), y: 0, foot: -0.2, front: ['n', 's', 'e', 'w'][Math.floor(rand() * 4)], kind: rand() < 0.5 ? 'mud' : 'hut', farm: true });
  }
  // the yards between the rows: cells not covered by a building
  for (const [cz, hz] of [[167.5, 4.4], [203, 6.6], [237.5, 6]]) for (let cx = -122; cx < 125;) {
    let placedY = false;
    for (const w of [14, 10, 7]) {
      const r = [cx, cz - hz, cx + w, cz + hz];
      if (placed.some((p) => overlap(r, p, 0.4)) || STREETS.some((s) => overlap(r, streetRect(s, 0.6))) || tankD(cx + w / 2, cz) < 14 || Math.hypot(cx + w / 2 - CORE[0], cz - CORE[1]) > 170 || Math.hypot(r[2], r[3]) > RADIUS - 50) continue;
      YARDS.push({ rect: r, seed: Math.floor(rand() * 1e6) }); cx = r[2] + 1.2; placedY = true; break;
    }
    if (!placedY) cx += 2;
  }
  return LOTS;
}
export function yards() { lots(); return YARDS; }
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m)) || YARDS.some((y) => inRect(y.rect, x, z, m));
/** The tank's water: out to where its sloping sides come up to the water's level. */
export const inTankWater = (x, z) => tankD(x, z) < 6 && height(x, z) < TANK.level;
