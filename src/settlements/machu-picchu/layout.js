// Machu Picchu (c. 1450–1530) — the layout of the settlement (docs/settlements/machu-picchu.md §2):
// the town on its saddle between the peaks of Machu Picchu (south, +z) and Huayna Picchu (north, -z), the
// Main Plaza in the middle, the Sacred sector and the Temple of the Sun on the west, the houses in
// kanchas on both sides, terraces stepping down every flank, the canyon of the Urubamba below and
// the mountains beyond. Pure data. Coordinates: metres, +x east, +z south... the ridge runs along z.

export const RADIUS = 330;
export const SITE = { a: 95, b: 175 };                     // the saddle's top: an ellipse (x half-width, z half-length)
export const TERRACE = { w: 3, h: 2.6, n: 15 };           // terraces round it: 3 m deep, 2.6 m high, 15 of them
export const PLAZA = [-18, -8, 22, 52];
export const PEAKS = [{ c: [0, -208], r: 88, h: 175 }, { c: [-14, 208], r: 88, h: 205 }];   // Huayna Picchu (north), Machu Picchu mountain (south)
export const HILL = { c: [-45, 82], r: 16, h: 11 };       // the Intihuatana's hill
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;

/** Distance (m) outside the saddle's ellipse, measured as the growth s of the half-axes that brings (x, z) on to it (negative inside). */
export function outside(x, z) {
  const f = (s) => (x / (SITE.a + s)) ** 2 + (z / (SITE.b + s)) ** 2 - 1;
  if (f(0) <= 0) { let lo = -SITE.a + 1, hi = 0; for (let i = 0; i < 18; i++) { const m = (lo + hi) / 2; if (f(m) > 0) lo = m; else hi = m; } return hi; }
  let lo = 0, hi = 600; for (let i = 0; i < 22; i++) { const m = (lo + hi) / 2; if (f(m) > 0) lo = m; else hi = m; } return hi;
}
/** The terrace level (0, 1, …) at distance d outside the ellipse, or -1 past the terraces. */
export const terraceAt = (d) => (d < 0 ? 0 : d < TERRACE.w * TERRACE.n ? Math.floor(d / TERRACE.w) + 1 : -1);
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** The Sacred Rock (its centre) and the two wayronas facing each other across its court, open to it. */
export const SACRED_ROCK = { c: [12, -147.5], wayronas: [[[0, -144, 5, -134], 'e'], [[19, -144, 24, -134], 'w']] };
const ROCK_COURT = [-2, -152, 26, -131];

/** The west stair's fountains: the court of each, on its terrace level j, south of the stair (z > 0) but the first, north of it. */
const xAt = (d, z) => -(SITE.a + d) * Math.sqrt(1 - (z / (SITE.b + d)) ** 2);
export function fountains() {
  const out = [], zc = 2.6;
  for (let i = 0; i < 16; i++) {
    const j = Math.max(1, i), z = i === 0 ? -zc : zc, dBack = TERRACE.w * (j - 1) + 0.95, dFront = TERRACE.w * j - 0.3, d = dFront - dBack, x = xAt((dBack + dFront) / 2, z);
    out.push({ c: [x, z], y: -TERRACE.h * j, ox: -1, oz: 0, w: 2.0, d });
  }
  return out;
}
/** The canal: from the foot of the mountain to the south, along the saddle's west edge 1.2 m in, to the head of the terrace wall over the first fountain. */
let CANAL = null;
export function canal() {
  if (CANAL) return CANAL;
  const pts = [];
  for (let z = 158.2; z >= -2.6; z -= 1.5) pts.push([xAt(-1.2, z), z]);
  pts.push([xAt(-1.2, -2.6), -2.6], [xAt(-0.6, -2.6), -2.6], [xAt(0.25, -2.6), -2.6]);
  CANAL = pts;
  return pts;
}
const nearCanal = (x, z, m) => { if (x > -36 || z < -4 || z > 161) return false; const p = canal(); for (let i = 0; i + 1 < p.length; i++) { const [ax, az] = p[i], [bx, bz] = p[i + 1], dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / l2)); if (Math.hypot(x - ax - dx * t, z - az - dz * t) < m) return true; } return false; };
const TOMB = [-45.5, -31.5, -22.5, -12.5];
/** Ground built over, where no grass grows: the canal, the fountains' courts, the cave under the Torreón, the Sacred Rock's base and the wayronas' floors. */
let PAVED = null;
export function paved(x, z) {
  if (!PAVED) {
    PAVED = fountains().map((f) => [f.c[0] - f.d / 2 - 1.1, f.c[1] - f.w / 2 - 0.5, f.c[0] + f.d / 2 + 0.2, f.c[1] + f.w / 2 + 0.5]);
    PAVED.push([-32.5, -21.6, -26.5, -16.4], [SACRED_ROCK.c[0] - 4.4, SACRED_ROCK.c[1] - 1.4, SACRED_ROCK.c[0] + 4.4, SACRED_ROCK.c[1] + 1.4]);
    for (const [r] of SACRED_ROCK.wayronas) PAVED.push([r[0] - 1.4, r[1] - 1.4, r[2] + 1.4, r[3] + 1.4]);
  }
  return PAVED.some((r) => inRect(r, x, z)) || nearCanal(x, z, 0.3);
}
/** The canal and the fountains as elements (the ground's height passed in, for the canal to lie on). */
export function waterworks(height) {
  const p = canal(), n = p.length;
  const pts = p.map(([x, z], i) => [x, z, i >= n - 2 ? 0.06 : height(x, z)]);
  const [hx, hz] = p[0];
  return [
    // where the canal comes out at the foot of the mountain: a short wall holding the slope [inferred, after the spring's collection wall — waterhistory.org]
    { t: 'stone_block', a: [hx - 2.2, hz + 0.45], b: [hx + 2.2, hz + 0.45], w: 0.45, y0: -0.6, y1: 1.4 },
    { t: 'inca_canal', pts },
    ...fountains().map((f) => ({ t: 'inca_fountain', ...f })),
  ];
}

let HOUSES = null;
/** The houses in their kanchas: { rect, front, seed } in the west and east sectors. */
export function houses() {
  if (HOUSES) return HOUSES;
  HOUSES = [];
  const rand = rng(1450);
  for (const [X0, X1, front] of [[-84, -24, 'e'], [28, 86, 'w']]) {
    for (let z = -150; z < 160; z += 15) for (let x = X0; x < X1; x += 13) {
      const w = 6 + rand() * 3, d = 9 + rand() * 3, r = [x, z, x + w, z + d];
      const cx = x + w / 2, cz = z + d / 2;
      if (outside(cx, cz) > -6 || inRect(PLAZA, cx, cz, 6)) continue;
      if (Math.hypot(cx - HILL.c[0], cz - HILL.c[1]) < HILL.r + 6) continue;
      if (inRect([-62, -40, -10, 60], cx, cz)) continue;                      // the Temple of the Sun and the Sacred Plaza
      if (rand() < 0.2) continue;
      const f = rand() < 0.7 ? front : (rand() < 0.5 ? 'n' : 's'), seed = Math.floor(rand() * 1e6);
      if (inRect(ROCK_COURT, cx, cz, 0) || inRect(TOMB, cx, cz, 6)) continue;                // the Sacred Rock's court, the Torreón's rock
      if ([[x, z], [x + w, z], [x, z + d], [x + w, z + d], [cx, z], [cx, z + d]].some(([px, pz]) => nearCanal(px, pz, 1.8))) continue;   // clear of the canal
      HOUSES.push({ rect: r, front: f, seed });
    }
  }
  return HOUSES;
}
export const inHouse = (x, z, m = 0) => houses().some((h) => inRect(h.rect, x, z, m));
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
