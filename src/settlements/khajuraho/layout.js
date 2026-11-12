// Khajuraho about 1050 — the layout (docs/settlements/khajuraho.md §2): the Western Group of the
// Chandela temples on their terraces — Kandariya Mahadeva, the Jagadambi and Chitragupta temples
// in a row to its north, Lakshmana with its four corner shrines, Vishvanatha with two; the
// Shivsagar tank to the south; the village to the east among mango and neem trees. Pure data.
// +x east, +z south.

export const RADIUS = 360;
export const TEMPLES = [
  { c: [-70, -60], len: 24, w: 13, h: 27, jagati: 4, spires: 84, interior: true, frieze: true },   // Kandariya Mahadeva, its 84 spires
  { c: [-70, -14], len: 16, w: 9, h: 22, jagati: 3.5 },      // Jagadambi
  { c: [-70, 26], len: 16, w: 9, h: 22, jagati: 3.5 },       // Chitragupta
  // Lakshmana on its great platform (10 ft high, its sides carved with the life of the kingdom), a shrine at each corner
  { c: [20, -90], len: 22, w: 12, h: 28, jagati: 3.1, corners: true, frieze: true, terrace: [7, -103, 50, -77] },
  { c: [40, -10], len: 20, w: 11, h: 27, jagati: 4, corners: true, terrace: [28, -22, 67, 2] },   // Vishvanatha
];
/** The Varaha pavilion facing Lakshmana across the way east of its stair. */
export const VARAHA = [62, -95, 74, -85];
export const TANK = { c: [40, 150], r: [75, 38], level: -1.5 };
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
export const tankD = (x, z) => (Math.hypot((x - TANK.c[0]) / TANK.r[0], (z - TANK.c[1]) / TANK.r[1]) - 1) * Math.min(...TANK.r);
export const inTank = (x, z) => tankD(x, z) < 0;
export function height(x, z) {
  const d = tankD(x, z);
  return (d < 6 ? -3.5 * smooth(6, -2, d) : 0) * (1 - smooth(RADIUS - 40, RADIUS - 5, Math.hypot(x, z)));
}
/** The tank's water: out to where its sloping sides come up to the water's level. */
export const inTankWater = (x, z) => tankD(x, z) < 6 && height(x, z) < TANK.level;
export const nearTemple = (x, z, m = 0) => TEMPLES.some((t) => x > t.c[0] - t.w - m && x < t.c[0] + t.len + 12 + m && Math.abs(z - t.c[1]) < t.w + m);
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

// ── the streets (docs/settlements/khajuraho.md §13): the pilgrims' road from the temples east through the bazaar,
// lanes crossing it every 48 m, the way down to the tank. axis 'x': runs east-west at z = c; 'z': north-south at x = c.
const LX = [88, 136, 184, 232, 280], LZ = [-86, -38, 58];
export const STREETS = [
  { id: 'road', axis: 'x', c: 10, w: 8, a: -30, b: 316, kind: 'main', from: -26 },
  // the pilgrims' approach: a lane along Kandariya's axis from the road's bend to the stair of its terrace, shops of flowers, ghee and sweets on both sides
  { id: 'approach', axis: 'x', c: -60, w: 5, a: -30, b: 22, kind: 'main', from: -26, lotsTo: 24 },
  { id: 'ns14', axis: 'z', c: 26, w: 4, a: -62, b: 6, kind: 'lane' },
  { id: 'tankway', axis: 'z', c: 40, w: 4, a: 14, b: 104, kind: 'lane', from: 20 },
  ...LX.map((c) => ({ id: 'ns' + c, axis: 'z', c, w: c === 88 ? 5 : 4, a: -134, b: 106, kind: 'lane' })),
  ...LZ.map((c) => ({ id: 'ew' + c, axis: 'x', c, w: 4, a: 90, b: 294, kind: 'lane' })),
  { id: 'ew106', axis: 'x', c: 106, w: 4, a: 90, b: 200, kind: 'lane' },
];
export const streetRect = (s, m = 0) => (s.axis === 'x' ? [s.a, s.c - s.w / 2 - m, s.b, s.c + s.w / 2 + m] : [s.c - s.w / 2 - m, s.a, s.c + s.w / 2 + m, s.b]);
export const onStreet = (x, z, m = 0) => STREETS.some((s) => inRect(streetRect(s), x, z, m));
const CORE = [160, 10];
/** The pilgrims' lane sells what is carried up to the god: flowers, ghee and oil for the lamps, sweets (prasad), lamps and pots, cloth. */
const APPROACH_TRADES = ['flowers', 'sweets', 'oil', 'flowers', 'potter', 'sweets', 'cloth', 'flowers'];
const hash = (a) => { let s = Math.imul(a | 0, 2654435761) >>> 0; s ^= s >>> 15; s = Math.imul(s, 2246822519) >>> 0; return (s >>> 0) / 4294967296; };
const BLOCKED = () => [...TEMPLES.map((t) => { const T = t.terrace || [t.c[0] - t.w * 0.85, t.c[1] - t.w * 0.95, t.c[0] + t.len + 4, t.c[1] + t.w * 0.95]; return [T[0] - 4, T[1] - 4, T[2] + t.jagati * 2.2 + 6, T[3] + 4]; }), [VARAHA[0] - 5, VARAHA[1] - 5, VARAHA[2] + 5, VARAHA[3] + 5]];
const overlap = (a, b, m = 0) => a[0] < b[2] + m && a[2] > b[0] - m && a[1] < b[3] + m && a[3] > b[1] - m;
let LOTS = null, YARDS = null;
/** The buildings: rows along both sides of each street, their fronts a verandah's width (1.2 m) back from the street's edge. */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = []; YARDS = [];
  const rand = rng(1050), blocked = BLOCKED(), placed = [];
  const free = (r, s) => {
    if (Math.hypot((r[0] + r[2]) / 2, (r[1] + r[3]) / 2) > RADIUS - 48) return false;
    if (tankD((r[0] + r[2]) / 2, (r[1] + r[3]) / 2) < 14 || [[r[0], r[1]], [r[2], r[1]], [r[0], r[3]], [r[2], r[3]]].some(([x, z]) => tankD(x, z) < 10)) return false;
    for (const b of blocked) if (overlap(r, b)) return false;
    for (const o of STREETS) if (o !== s && overlap(r, streetRect(o, 0.3))) return false;
    for (const p of placed) if (overlap(r, p, 0.25)) return false;
    return true;
  };
  for (const s of STREETS) {
    for (const side of [-1, 1]) {
      let t = Math.max(s.a, s.from ?? s.a) + 1 + rand() * 2;
      while (t < (s.lotsTo ?? s.b) - 4) {
        const main = s.kind === 'main', r0 = rand();
        const kind = s.id === 'approach' ? (r0 < 0.86 ? 'shop' : 'haveli') : main ? (r0 < 0.58 ? 'shop' : r0 < 0.76 ? 'haveli' : r0 < 0.9 ? 'home' : 'mud') : (r0 < 0.4 ? 'home' : r0 < 0.7 ? 'mud' : r0 < 0.78 ? 'haveli' : r0 < 0.88 ? 'hut' : r0 < 0.95 ? 'shed' : 'shop');
        const w = kind === 'shop' ? 3.6 + rand() * 1.6 : kind === 'haveli' ? 6.5 + rand() * 1.5 : kind === 'shed' ? 5 + rand() * 2 : 4.4 + rand() * 2.4;
        const d = kind === 'haveli' ? 8 + rand() * 1.5 : 6.2 + rand() * 1.6, off = s.w / 2 + 1.2;
        const u0 = t, u1 = t + w;
        const r = s.axis === 'x' ? (side < 0 ? [u0, s.c - off - d, u1, s.c - off] : [u0, s.c + off, u1, s.c + off + d]) : (side < 0 ? [s.c - off - d, u0, s.c - off, u1] : [s.c + off, u0, s.c + off + d, u1]);
        const front = s.axis === 'x' ? (side < 0 ? 's' : 'n') : (side < 0 ? 'e' : 'w');
        const cx = (r[0] + r[2]) / 2, cz = (r[1] + r[3]) / 2, dc = Math.hypot(cx - CORE[0], cz - CORE[1]);
        const keep = !main && dc > 70 ? hash(Math.floor(cx * 3) * 977 + Math.floor(cz * 3)) > smooth(70, 150, dc) * 0.75 : true;
        const ok = free(r, s);
        if (ok) {
          placed.push(r);
          if (keep) {
            const seed = Math.floor(rand() * 1e6), dTemple = Math.hypot(cx - 30, cz - 10);
            const open = s.id === 'approach' ? kind === 'shop' : (kind === 'shop' || kind === 'home' || kind === 'haveli') && dTemple < 150 && rand() < (kind === 'shop' ? 0.8 : 0.45);
            LOTS.push({ rect: r, seed, y: 0, foot: -0.2, front, kind, open, street: s.id, main, trade: s.id === 'approach' ? APPROACH_TRADES[seed % 8] : ['grain', 'potter', 'cloth', 'oil', 'sweets', 'smith', 'flowers', 'grain', 'potter', 'cloth'][seed % 10] });
          }
        }
        t = ok ? u1 + 0.15 + (rand() < 0.08 ? 2.5 : 0) : t + 0.8;
      }
    }
  }
  // a few farmsteads on the plain beyond the village
  for (let k = 0; k < 120 && LOTS.length < 9999; k++) {
    const a = rand() * 6.28, rr = 196 + rand() * 90, x = Math.cos(a) * rr + 60, z = Math.sin(a) * rr * 0.9;
    if (x < 200 || Math.hypot(x, z) > RADIUS - 50) continue;
    const w = 5 + rand() * 2, r = [x, z, x + w, z + 6.5];
    if (placed.some((p) => overlap(r, p, 14)) || STREETS.some((s) => overlap(r, streetRect(s, 8)))) continue;
    placed.push(r);
    LOTS.push({ rect: r, seed: Math.floor(rand() * 1e6), y: 0, foot: -0.2, front: ['n', 's', 'e', 'w'][Math.floor(rand() * 4)], kind: rand() < 0.5 ? 'mud' : 'hut', farm: true });
    if (LOTS.length > 600) break;
  }
  // the yards between the rows: cells of the 48 m grid not covered by a building
  for (const cx of [112, 160, 208, 256]) for (const cz of [-62, -14, 34, 82]) {
    const r = [cx - 9, cz - 9, cx + 9, cz + 9];
    if (placed.some((p) => overlap(r, p, 1.5)) || STREETS.some((s) => overlap(r, streetRect(s, 1))) || Math.hypot(cx - CORE[0], cz - CORE[1]) > 150) continue;
    YARDS.push({ rect: r, seed: Math.floor(rand() * 1e6) });
  }
  return LOTS;
}
export function yards() { lots(); return YARDS; }
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m)) || YARDS.some((y) => inRect(y.rect, x, z, m));
