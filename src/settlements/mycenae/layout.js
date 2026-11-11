// Mycenae about 1250 BC (docs/settlements/mycenae.md §2): the citadel on its rocky ridge between two ravines, its Cyclopean circuit with the
// Lion Gate in the west wall (z = 0) and the north gate, the approach ramp from the west between the bastion and the wall's end, Grave
// Circle A inside the gate to the south, the stepped road climbing east to the palace on the summit, the Treasury of Atreus outside the
// walls to the south-west, the lower town's houses on the slopes. Pure data and the terrain's height. Metres; +x east, +z south, y up.

export const RADIUS = 190;
/** The Lion Gate's threshold, the palace platform, and the wall's thickness. */
export const GATE_Y = 6, PAL_Y = 22.5, TH = 6;
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
const sm = smooth, lerp = (a, b, t) => a + (b - a) * t, gauss = (x, c, w) => Math.exp(-(((x - c) / w) ** 2));
export function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

// ── the citadel's circuit (centre line of the wall), clockwise on the map from the Lion Gate's north end ──
export const CIRCUIT = [[-89, -11], [-62, -32], [-28, -43], [10, -47], [58, -51], [100, -47], [118, -30], [120, 0], [110, 28], [86, 48], [50, 56], [10, 58], [-30, 52], [-62, 50], [-89, 36], [-89, 11]];
/** The gates: segment index (from CIRCUIT[i] to the next), distance along it, clear width, height. */
export const LION = { x: -89, z: 0, w: 3.1, h: 2.95 };
export const NORTH_GATE = { seg: 3, s: 14, w: 1.7, h: 2.7 };
/** The bastion and the end of the main wall that form the approach court (15 × 7.23 m), west of the gate wall. */
export const BASTION = [-107, 3.6, -92, 10.8], STUB = [-107, -11, -92, -3.6];
/** Grave Circle A: centre, the circle's inner diameter 27.5 m. */
export const GCA = { x: -66, z: 25, r: 13.75, y: 8.0 };
/** The Treasury of Atreus: the tholos centre, the floor, the dromos running west from the façade. */
export const TREAS = { x: -62, z: 108, R: 7.3, H: 13.2, y: 0, door: 5.4, front: 10.5, dromos: 36 };
TREAS.xf = TREAS.x - TREAS.R - 5.4;     // the façade: the doorway 5.4 m deep before the dome
TREAS.x0 = TREAS.xf - TREAS.dromos;      // the dromos' open end

// ── the terrain ────────────────────────────────────────────────────────────────────────
const YIN = [[-110, 5.6], [-92, 6], [-60, 8.3], [-20, 13.8], [10, 19.2], [30, 22], [45, 22.5], [100, 22.5], [125, 20.5], [160, 14]];
/** The citadel's interior ground along its length. */
export function yIn(x) {
  if (x <= YIN[0][0]) return YIN[0][1];
  for (let i = 1; i < YIN.length; i++) if (x <= YIN[i][0]) return lerp(YIN[i - 1][1], YIN[i][1], sm(YIN[i - 1][0], YIN[i][0], x));
  return YIN[YIN.length - 1][1];
}
/** The ramp to the Lion Gate: 6 % up from the west. */
export const approachY = (x) => GATE_Y - 0.06 * Math.max(0, -92 - x);

/** Signed distance (m) from the circuit's centre line: negative inside. */
export function sdCircuit(x, z) {
  let d = Infinity, ins = false;
  const n = CIRCUIT.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const [ax, az] = CIRCUIT[j], [bx, bz] = CIRCUIT[i];
    if ((az > z) !== (bz > z) && x < ((bx - ax) * (z - az)) / (bz - az) + ax) ins = !ins;
    const vx = bx - ax, vz = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * vx + (z - az) * vz) / (vx * vx + vz * vz)));
    d = Math.min(d, Math.hypot(x - ax - vx * t, z - az - vz * t));
  }
  return ins ? -d : d;
}
/** The ground away from the citadel: ravines to the north (z ≈ −80) and the south (z ≈ 80), hills beyond, the lower town's slope falling west. */
function background(x, z) {
  return 2.2 + 4.5 * sm(95, 170, z) + 5 * sm(-110, -190, z) - 5.5 * gauss(z, -78, 20) - 4.5 * gauss(z, 80, 16) * sm(-60, 0, x) - 1.4 * sm(-110, -190, x);
}
/** Levelled pads (the ground under the buildings): rect or circle, level, margin of the blend. */
const PADS = [
  { rect: [26, -30, 92, 34], y: PAL_Y - 0.12, m: 6 },
  { rect: [-92, -5, -83, 5], y: GATE_Y - 0.12, m: 2.5 },
  { circle: [GCA.x, GCA.z, 15.6], y: GCA.y - 0.1, m: 6 },
];
export const HOUSE_PADS = [];             // the citadel's houses add theirs (lots)
/** Where the dromos runs: |dz| < 5 is the cut. */
const dromosTop = (x) => TREAS.y + 0.5 + (TREAS.front - 0.5) * Math.max(0, Math.min(1, (x - TREAS.x0) / TREAS.dromos));
const MOUND_R = 40, MOUND_H = 15.4;
// the dromos' floor is the ground at its open end
TREAS.y = Math.round(background(TREAS.x0 - 3, TREAS.z) * 10) / 10;

let LOTS_CACHE = null;
/** The terrain's height (before the disc's edge is faded to 0 by ground.js). */
export function terrain(x, z) {
  const d = sdCircuit(x, z), yi = yIn(x);
  let h;
  if (d <= -TH / 2 - 0.5) h = yi;
  else if (d < TH / 2 + 0.5) h = yi - 6 * sm(0, 1, (d + TH / 2 + 0.5) / (TH + 1));
  else {
    const ho = yi - 6 - 0.45 * (d - TH / 2 - 0.5), bg = background(x, z), k = 2.5;
    h = Math.max(ho, bg) + k * 0.25 * Math.exp(-Math.abs(ho - bg) / k);       // a soft maximum: the slope eases into the ravine floor
  }
  // the approach to the Lion Gate
  if (x < -86 && x > -200) { const w = 1 - sm(10, 24, Math.abs(z)); if (w > 0) h = lerp(h, approachY(x), w * (x > -92 ? 1 : 1)); }
  for (const P of PADS) {
    const dd = P.circle ? Math.hypot(x - P.circle[0], z - P.circle[1]) - P.circle[2] : -Math.min(x - P.rect[0], P.rect[2] - x, z - P.rect[1], P.rect[3] - z);
    if (dd < P.m) h = lerp(P.y, h, sm(0, P.m, Math.max(0, dd)));
  }
  for (const L of lotsInside()) {
    const dd = -Math.min(x - L.rect[0], L.rect[2] - x, z - L.rect[1], L.rect[3] - z);
    if (dd < 2) h = lerp(L.y - 0.1, h, sm(0, 2, Math.max(0, dd)));
  }
  // the Treasury: the mound over the dome, the dromos cut with its floor and the ground rising to the walls' tops
  const r = Math.hypot(x - TREAS.x, z - TREAS.z);
  if (r < MOUND_R) h = Math.max(h, TREAS.y + 0.2 + MOUND_H * (1 - (r / MOUND_R) ** 2));
  const dz = Math.abs(z - TREAS.z);
  if (x > TREAS.x0 - 6 && x < TREAS.xf + 0.5 && dz < 11) {
    const top = dromosTop(Math.max(x, TREAS.x0)) - 0.1, edge = Math.min(sm(TREAS.x0 - 6, TREAS.x0, x), 1);
    let g = h;
    if (dz <= 5.2) g = dz <= 3.1 ? TREAS.y - 0.1 : top;
    else g = lerp(top, h, sm(5.2, 11, dz));
    h = lerp(h, g, edge);
  }
  return h;
}
function lotsInside() { return LOTS_CACHE ? LOTS_CACHE.filter((l) => l.inside) : []; }
/** The terrain a house's floor must clear: the highest of the footprint's corners and centre. */
const high = (r) => Math.max(terrain(r[0], r[1]), terrain(r[2], r[1]), terrain(r[0], r[3]), terrain(r[2], r[3]), terrain((r[0] + r[2]) / 2, (r[1] + r[3]) / 2));

// ── the houses ─────────────────────────────────────────────────────────────────────────
// inside the walls: set by hand along the road (north and south of it) and round the palace; their floors are set from the interior ground
const INSIDE = [
  [-78, -29, -66, -19, 'house'], [-62, -26, -50, -14, 'house'], [-46, -32, -34, -20, 'house'], [-30, -30, -18, -16, 'house'], [-14, -33, -2, -20, 'house'], [2, -36, 24, -22, 'store'],
  [-48, 11, -38, 22, 'house'], [-34, 12, -22, 26, 'cult'], [-20, 10, -8, 24, 'cult'], [-46, 28, -32, 42, 'house'], [-28, 30, -14, 44, 'house'], [-10, 28, 6, 44, 'house'], [8, 30, 22, 46, 'house'],
  [88, -30, 102, -14, 'house'], [90, 0, 106, 14, 'store'], [86, 22, 100, 36, 'house'],
];
/** The granary just inside the gate, to the right of the way, against the wall. */
export const GRANARY = [-84, 4.5, -74, 12.5];
export const PALACE = { court: [30, -10, 56, 16], megaron: { x0: 56, x1: 80.9, z0: -2.9, z1: 8.9, th: 0.9, ax: 3 }, propylon: [24, 0.2, 29.2, 5.8] };
/** The lots of houses: { rect, kind, y (floor), seed, inside, face } — inside the walls and on the slopes of the lower town. */
export function lots() {
  if (LOTS_CACHE) return LOTS_CACHE;
  LOTS_CACHE = [];
  const rand = rng(1250);
  for (const [x0, z0, x1, z1, kind] of INSIDE) {
    const cx = (x0 + x1) / 2, y = Math.round((yIn(cx) + 0.05) * 4) / 4;
    LOTS_CACHE.push({ rect: [x0, z0, x1, z1], kind, y, seed: Math.floor(rand() * 1e6), inside: true, face: z0 < 0 ? 's' : 'n', storeys: kind === 'store' ? 1 : (rand() < 0.45 ? 2 : 1) });
  }
  LOTS_CACHE.push({ rect: GRANARY, kind: 'granary', y: GATE_Y + 0.1, seed: 7, inside: true, face: 'n', storeys: 1 });
  // the lower town: along lanes, houses facing the lane
  const placed = [];
  const clear = (r) => !(sdCircuit((r[0] + r[2]) / 2, (r[1] + r[3]) / 2) < 22 || inTreasury(r) || placed.some((p) => !(r[2] + 1.5 < p[0] || r[0] - 1.5 > p[2] || r[3] + 1.5 < p[1] || r[1] - 1.5 > p[3]))
    || Math.hypot((r[0] + r[2]) / 2, (r[1] + r[3]) / 2) > RADIUS - 28 || onLane(...[(r[0] + r[2]) / 2, (r[1] + r[3]) / 2], 2.6) || inRect(BASTION, (r[0] + r[2]) / 2, (r[1] + r[3]) / 2, 22) || inRect(STUB, (r[0] + r[2]) / 2, (r[1] + r[3]) / 2, 14)
    || (Math.abs((r[1] + r[3]) / 2) < 6 && (r[0] + r[2]) / 2 > -170));
  for (const lane of LANES) {
    for (let i = 0; i < lane.length - 1; i++) {
      const [ax, az] = lane[i], [bx, bz] = lane[i + 1], L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L;
      for (const side of [-1, 1]) {
        let s = 3 + rand() * 4;
        while (s < L - 6) {
          const w = 7 + rand() * 5, d = 6 + rand() * 4, off = 2.6 + rand() * 1.2;
          const c = [ax + ux * (s + w / 2) - uz * side * (off + d / 2), az + uz * (s + w / 2) + ux * side * (off + d / 2)];
          const alongX = Math.abs(ux) > Math.abs(uz), r = alongX ? [c[0] - w / 2, c[1] - d / 2, c[0] + w / 2, c[1] + d / 2] : [c[0] - d / 2, c[1] - w / 2, c[0] + d / 2, c[1] + w / 2];
          s += w + 1 + rand() * 2.5;
          if (rand() < 0.1 || !clear(r)) continue;
          placed.push(r);
          const face = alongX ? (side > 0 ? 'n' : 's') : (side > 0 ? 'w' : 'e');
          const kind = rand() < 0.14 ? 'workshop' : 'house';
          LOTS_CACHE.push({ rect: r, kind, y: Math.round((high(r) + 0.15) * 4) / 4, seed: Math.floor(rand() * 1e6), inside: false, face: (face === 'n' ? 's' : face === 's' ? 'n' : face === 'w' ? 'e' : 'w'), storeys: rand() < 0.35 ? 2 : 1 });
        }
      }
    }
  }
  return LOTS_CACHE;
}
const inTreasury = (r) => { const cx = (r[0] + r[2]) / 2, cz = (r[1] + r[3]) / 2; return Math.hypot(cx - TREAS.x, cz - TREAS.z) < MOUND_R + 6 || (cx < TREAS.xf + 4 && cx > TREAS.x0 - 8 && Math.abs(cz - TREAS.z) < 14); };
/** Lanes of the lower town: from the approach road west of the Lion Gate, to the Treasury, round the south and the west slope. Polylines [x, z]. */
export const LANES = [
  [[-190, 0], [-160, -2], [-130, -2], [-107, 0]],                           // the approach (the main road)
  [[-165, -2], [-168, -40], [-150, -75]],                                   // north-west up the slope
  [[-150, 0], [-160, 35], [-150, 70], [-128, 100], [-112, 108]],            // south-west to the Treasury's dromos
  [[-150, 35], [-118, 50], [-98, 62]],                                      // the south-west terraces
  [[-20, 84], [20, 92], [60, 100], [100, 98]],                              // along the south ravine's far side
  [[20, 92], [30, 120], [60, 140]],
];
/** Is (x, z) within m of a lane's centre line? */
export function onLane(x, z, m = 1.6) {
  for (const lane of LANES) for (let i = 0; i < lane.length - 1; i++) {
    const [ax, az] = lane[i], [bx, bz] = lane[i + 1], vx = bx - ax, vz = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * vx + (z - az) * vz) / (vx * vx + vz * vz)));
    if (Math.hypot(x - ax - vx * t, z - az - vz * t) < m) return true;
  }
  return false;
}
/** The road up through the citadel from the gate to the palace (the stepped ramp, 5 m wide): [x, z] points. */
export const RAMP = [[-86, 0], [-70, -4], [-52, -7], [-30, -8], [-10, -4], [8, 0], [24, 3]];
export function onRamp(x, z, m = 0) {
  for (let i = 0; i < RAMP.length - 1; i++) {
    const [ax, az] = RAMP[i], [bx, bz] = RAMP[i + 1], vx = bx - ax, vz = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * vx + (z - az) * vz) / (vx * vx + vz * vz)));
    if (Math.hypot(x - ax - vx * t, z - az - vz * t) < 2.6 + m) return true;
  }
  return false;
}
export const inCitadel = (x, z, m = 0) => sdCircuit(x, z) < -m;
export const inHouse = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));

/** The wall's runs (about 5 m each): { a, b, n (outward), y0, y1, kind } with its heights from the ground. */
export function wallRuns() {
  const runs = [], n = CIRCUIT.length;
  let gate = null;
  for (let i = 0; i < n; i++) {
    const A = CIRCUIT[i], B = CIRCUIT[(i + 1) % n], L = Math.hypot(B[0] - A[0], B[1] - A[1]), ux = (B[0] - A[0]) / L, uz = (B[1] - A[1]) / L, nx = uz, nz = -ux;
    if (i === n - 1) continue;                                       // the west run holds the Lion Gate (its own element)
    const spans = NORTH_GATE.seg === i ? [[0, NORTH_GATE.s - 3], [NORTH_GATE.s + 3, L]] : [[0, L]];
    if (NORTH_GATE.seg === i) gate = { at: [A[0] + ux * NORTH_GATE.s, A[1] + uz * NORTH_GATE.s], u: [ux, uz], n: [nx, nz] };
    for (const [t0, t1] of spans) {
      const k = Math.max(1, Math.round((t1 - t0) / 5.2));
      for (let j = 0; j < k; j++) {
        const s0 = t0 + (t1 - t0) * j / k, s1 = t0 + (t1 - t0) * (j + 1) / k, a = [A[0] + ux * s0, A[1] + uz * s0], b = [A[0] + ux * s1, A[1] + uz * s1];
        const mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2;
        const extra = 6.3 * (1 - sm(0, 46, Math.min(Math.hypot(mx - CIRCUIT[0][0], mz - CIRCUIT[0][1]), Math.hypot(mx - CIRCUIT[n - 1][0], mz - CIRCUIT[n - 1][1]))));
        const outer = (p) => [p[0] + nx * (TH / 2 + 0.3), p[1] + nz * (TH / 2 + 0.3)];
        const low = Math.min(terrain(...outer(a)), terrain(...outer(b)), terrain(...outer([mx, mz])));
        runs.push({ a, b, n: [nx, nz], y0: low - 0.9, y1: yIn(mx) + 2.2 + extra, yi: yIn(mx), seg: i, ashlar: extra > 1.6 });
      }
    }
  }
  if (gate) { const m = gate.at; gate.y = yIn(m[0]); gate.y0 = terrain(m[0] + gate.n[0] * 3.3, m[1] + gate.n[1] * 3.3) - 0.9; gate.y1 = gate.y + 2.2; }
  return { runs, gate };
}
