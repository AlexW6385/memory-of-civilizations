// Machu Picchu (c. 1450–1530) — the layout of the settlement (docs/settlements/machu-picchu.md §2):
// the town on its saddle between the peaks of Machu Picchu (south, +z) and Huayna Picchu (north, -z), the
// Main Plaza in the middle, the Sacred sector and the Temple of the Sun on the west, the houses in
// kanchas on both sides, terraces stepping down every flank, the canyon of the Urubamba below and
// the mountains beyond. Pure data. Coordinates: metres, +x east, +z south... the ridge runs along z.

export const RADIUS = 330;
export const SITE = { a: 95, b: 175 };                     // the saddle's top: an ellipse (x half-width, z half-length)
export const TERRACE = { w: 3, h: 2.6, n: 15 };           // terraces round it: 3 m deep, 2.6 m high, 15 of them
export const PLAZA = [-18, -52, 22, 8];
export const PEAKS = [{ c: [0, -208], r: 88, h: 175 }, { c: [-14, 208], r: 88, h: 205 }];   // Huayna Picchu (north), Machu Picchu mountain (south)
export const HILL = { c: [-45, -82], r: 16, n: 5 };       // the Intihuatana's hill, north-west of the Main Plaza: five terraces of 2.2 m
/** The knoll at the saddle's south end, under Machu Picchu mountain, with the Guardhouse on top: six terraces of 2.2 m. */
export const KNOLL = { c: [-20, 138], r: 19.5, n: 6 };
/** A terraced hill's height at (x, z): 2.2 m a terrace, each ring 2.4 m in from the one below (the ring walls stand on these radii). */
export const hillRing = (H, k) => H.r + 6 - 2.4 * (k + 1);
export function hillHeight(H, x, z) { const d = Math.hypot(x - H.c[0], z - H.c[1]); return 2.2 * Math.max(0, Math.min(H.n, Math.floor((H.r + 6 - d) / 2.4))); }
/**
 * The south end of the town: the town wall across the saddle with the main gate; before it the dry ditch along
 * a fault line that parts the urban sector from the agricultural [stated: peru-explorer]; south of it the fields
 * and the five storehouses [stated: "five storerooms" in the agricultural sector — peru-explorer].
 */
export const TOWN_WALL = { z: 84, gate: 2 }, DITCH = { z: 89, top: 3, bottom: 1, depth: 2, x0: -80 };
export const FIELDS = [-90, 93, 90, 116];
export const STORES = Array.from({ length: 5 }, (_, i) => [16 + i * 7.6, 96, 21.4 + i * 7.6, 100.2]);
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
const TOMB = [-45.5, 12.5, -22.5, 31.5];
/** Ground built over, where no grass grows: the canal, the fountains' courts, the cave under the Torreón, the Sacred Rock's base and the wayronas' floors. */
let PAVED = null;
export function paved(x, z) {
  if (!PAVED) {
    PAVED = fountains().map((f) => [f.c[0] - f.d / 2 - 1.1, f.c[1] - f.w / 2 - 0.5, f.c[0] + f.d / 2 + 0.2, f.c[1] + f.w / 2 + 0.5]);
    PAVED.push([-32.5, 22.4, -26.5, 27.6], [SACRED_ROCK.c[0] - 4.4, SACRED_ROCK.c[1] - 1.4, SACRED_ROCK.c[0] + 4.4, SACRED_ROCK.c[1] + 1.4]);
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

let HOUSES = null, KWALLS = null, KANCHAS = null;
/**
 * The houses in their kanchas: "three (or more)" one-room buildings round a patio, the whole walled, a single
 * gateway into it [stated: World History Encyclopedia, "Inca Architecture"]; the kanchas in rows with lanes
 * between, their gates to the Main Plaza's side; single houses where a kancha does not fit. Each kancha: a long
 * house across its back, a house on each side, the patio before them open to the gate [inferred: the
 * arrangement, after the kanchas of the eastern sector]. The kancha wall runs only where no house stands: the
 * houses' back walls are its line. { rect, front, seed } for the houses; kanchaWalls() the walls.
 */
export function houses() {
  if (HOUSES) return HOUSES;
  HOUSES = []; KWALLS = []; KANCHAS = [];
  const rand = rng(1450), taken = [];
  const clear = (r, m) => {
    const cx = (r[0] + r[2]) / 2, cz = (r[1] + r[3]) / 2, cs = [[r[0], r[1]], [r[2], r[1]], [r[0], r[3]], [r[2], r[3]], [cx, r[1]], [cx, r[3]], [r[0], cz], [r[2], cz]];
    if (cs.some(([x, z]) => outside(x, z) > -m)) return false;
    if (cs.some(([x, z]) => inRect(PLAZA, x, z, 6) || inRect([-62, -66, -10, 50], x, z) || inRect(ROCK_COURT, x, z, 1) || inRect(TOMB, x, z, 3))) return false;
    if (cs.some(([x, z]) => Math.hypot(x - HILL.c[0], z - HILL.c[1]) < HILL.r + 7 || Math.hypot(x - KNOLL.c[0], z - KNOLL.c[1]) < KNOLL.r + 9)) return false;
    if (cs.some(([px, pz]) => nearCanal(px, pz, 1.8) || pz > TOWN_WALL.z - 6)) return false;
    return !taken.some((t) => r[0] < t[2] + 2 && r[2] > t[0] - 2 && r[1] < t[3] + 2 && r[3] > t[1] - 2);
  };
  const th = 0.7;
  for (const [X0, X1, gate] of [[-86, -22, 'e'], [26, 88, 'w']]) {
    for (let z = -152; z < 160; z += 27) for (let x = X0; x < X1; x += 22.5) {
      const r = [x, z, x + 20, z + 24];
      if (!clear(r, 3) || rand() < 0.12) continue;
      taken.push(r);
      // kancha-local: u across the gate side (along z), v from the gate side (0) to the back (D)
      const A = 24, D = 20, gx = gate === 'e' ? r[2] : r[0], sv = gate === 'e' ? -1 : 1;
      const P = (u, v) => [gx + sv * v, r[1] + u];
      const R = (u0, v0, u1, v1) => { const a = P(u0, v0), b = P(u1, v1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
      const bd = 5.6 + rand() * 1, bu0 = 2 + rand() * 2, bu1 = A - 2 - rand() * 2;
      const sl = 7 + rand() * 2, sd = 5 + rand() * 0.8, sv1 = D - bd - 1 - rand() * 1.5, sv0 = sv1 - sl;
      const seed = () => Math.floor(rand() * 1e6);
      KANCHAS.push({ rect: r, at: P, inward: [sv, 0] });
      HOUSES.push({ rect: R(bu0, D - bd, bu1, D), front: gate, seed: seed() });
      HOUSES.push({ rect: R(0, sv0, sd, sv1), front: 's', seed: seed() });
      HOUSES.push({ rect: R(A - sd, sv0, A, sv1), front: 'n', seed: seed() });
      // the walls: the gate side and the back run past the corners; the sides stop at the corner lines, a little lower
      const seg = (a, b, y1, door) => KWALLS.push({ a: P(...a), b: P(...b), y1, door });
      const hth = th / 2;
      seg([-hth - 0.05, 0], [A + hth + 0.05, 0], 2.4, { at: A / 2 + hth + 0.05, w: 1.15, h: 1.95, jamb: rand() < 0.3 });
      seg([-hth - 0.05, D], [bu0 - hth + 0.12, D], 2.4);
      seg([bu1 + hth - 0.12, D], [A + hth + 0.05, D], 2.4);
      for (const u of [0, A]) { seg([u, 0], [u, sv0 - hth + 0.12], 2.36); seg([u, sv1 + hth - 0.12], [u, D], 2.36); }
    }
  }
  // the town wall from the canal to the saddle's east edge, its gateway double-jambed, the stone ring over the lintel
  { const z = TOWN_WALL.z, xe = SITE.a * Math.sqrt(1 - (z / SITE.b) ** 2), x0 = xAt(-1.2, z) + 1.4;
    KWALLS.push({ a: [x0, z], b: [xe - 0.3, z], y1: 3.0, w: 0.45, door: { at: TOWN_WALL.gate - x0, w: 1.5, h: 2.5, jamb: true, ring: true } }); }
  // single houses where no kancha fits, as before
  for (const [X0, X1, front] of [[-84, -24, 'e'], [28, 86, 'w']]) {
    for (let z = -150; z < 160; z += 15) for (let x = X0; x < X1; x += 13) {
      const w = 6 + rand() * 3, d = 9 + rand() * 3, r = [x, z, x + w, z + d];
      if (!clear(r, 6) || rand() < 0.25) continue;
      taken.push(r);
      HOUSES.push({ rect: r, front: rand() < 0.7 ? front : (rand() < 0.5 ? 'n' : 's'), seed: Math.floor(rand() * 1e6) });
    }
  }
  return HOUSES;
}
/** The kanchas' walls: { a, b, y1 (height), door ({ at, w, h, jamb } along a→b) }. */
export function kanchaWalls() { houses(); return KWALLS; }
/** The kanchas: { rect, at (u across the gate side, v in from it → a plan point), inward (gate to back) }. */
export function kanchas() { houses(); return KANCHAS; }
/** The ploughed strips on the terraces: [the angle the team starts at, the terrace level, the number of men] (people.js). */
export const PLOUGH = [[0.32, 2, 4], [Math.PI - 0.42, 3, 5], [-0.5, 1, 3]];
/** Is (x, z) in a ploughed strip: on its terrace, from a little before the team to a few metres past it. */
export function ploughed(x, z) {
  const d = outside(x, z);
  if (d < 0.5 || d > TERRACE.w * 3) return false;
  const j = Math.floor(d / TERRACE.w) + 1, f = d - TERRACE.w * (j - 1);
  if (f < 0.75 || f > TERRACE.w - 0.45) return false;
  const t = Math.atan2(z / (SITE.b + d), x / (SITE.a + d));
  return PLOUGH.some(([t0, jj, n]) => { if (jj !== j) return false; const sg = Math.sign(Math.cos(t0)) || 1, len = (n * 1.35 + 9) / (SITE.b + d); const u = (t - t0) * sg; return u > -2.5 / (SITE.b + d) && u < len; });
}
const nearWall = (x, z, m) => kanchaWalls().some(({ a, b }) => { const dx = b[0] - a[0], dz = b[1] - a[1], l2 = dx * dx + dz * dz, t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / l2)); return Math.hypot(x - a[0] - dx * t, z - a[1] - dz * t) < m; });
export const inHouse = (x, z, m = 0) => houses().some((h) => inRect(h.rect, x, z, m)) || nearWall(x, z, 0.5 + m);
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
