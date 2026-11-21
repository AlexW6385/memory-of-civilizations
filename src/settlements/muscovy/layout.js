// Muscovy about 1600 — the layout (docs/settlements/muscovy.md §2): the Kremlin's triangle on its
// hill, the river Moskva below its south wall; Cathedral Square inside — the Dormition, the
// Archangel, the Annunciation, Ivan the Great's bell tower, the Palace of Facets — and the wooden
// palaces and courts; Red Square along the east wall with the Lobnoye Mesto, the trading rows on its
// east side and St Basil's at its south end above the river; the log houses of Kitai-gorod east and
// of Zamoskvorechye across the river. Distances compressed (the Kremlin's sides ~700 m → ~350 m).
// Pure data. +x east, +z south.

export const RADIUS = 420;
export const KREMLIN = [[-80, -185], [-25, 175], [-320, 175]];          // the north (Arsenal) corner, the south-east, the south-west
export const SPASSKY = [0, 0.42];                                        // the Spassky gate on the east wall (side 0, at t)
export const SQUARE = [-12, -150, 66, 150];                              // Red Square
export const BASIL = [26, 128];
export const LOBNOYE = [20, 72];
export const ROWS = [72, -140, 92, 90];
export const CATHEDRALS = { dormition: [-190, -10, -158, 18], archangel: [-150, 40, -126, 62], annunciation: [-210, 40, -192, 58], ivan: [-140, 0], facets: [-238, -8, -214, 16] };
// the moat (the Alevizov ditch) along the wall on the square: d0…d1 metres out from the wall's line, from z0 to z1
export const MOAT = { d0: 10, d1: 24, z0: -168, z1: 166, level: -4.5, bed: -7 };
// the tented log churches of the posad parishes (Kitai-gorod, Zamoskvorechye): [x, z, yaw]
export const CHURCHES = [[168, -92, 0], [-96, 336, 0], [196, 96, Math.PI], [-165, -228, Math.PI / 2], [270, -20, 0], [24, 330, 0]];
// the wall of Kitai-gorod (1535–38): from the Kremlin's north corner out and round the trading posad to the river
export const KITAI = [[-76, -192], [-40, -266], [252, -266], [252, 214]];
export const KITAI_GATES = [[1, 0.28], [2, 0.335], [2, 0.627], [2, 0.773]];
export const nearKitai = (x, z, m) => { for (let i = 0; i + 1 < KITAI.length; i++) { const a = KITAI[i], b = KITAI[i + 1], L2 = (b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2, t = Math.max(0, Math.min(1, ((x - a[0]) * (b[0] - a[0]) + (z - a[1]) * (b[1] - a[1])) / L2)); if (Math.hypot(x - a[0] - t * (b[0] - a[0]), z - a[1] - t * (b[1] - a[1])) < m) return true; } return false; };
export const NIKOLSKY = [0, 0.12];
export const wallX = (z) => KREMLIN[0][0] + (KREMLIN[1][0] - KREMLIN[0][0]) * (z - KREMLIN[0][1]) / (KREMLIN[1][1] - KREMLIN[0][1]);
export const gateZ = (t) => KREMLIN[0][1] + (KREMLIN[1][1] - KREMLIN[0][1]) * t;
export const inMoat = (x, z, m = 0) => z > MOAT.z0 - m && z < MOAT.z1 + m && x - wallX(z) > MOAT.d0 - m && x - wallX(z) < MOAT.d1 + m;
export const RIVER = { z: 250, w: 90, level: -7, bed: -10 };
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const riverZ = (x) => RIVER.z + 14 * Math.sin(x / 120);
export const inRiver = (x, z) => Math.abs(z - riverZ(x)) < RIVER.w / 2 - 3 && Math.hypot(x, z) < RADIUS - 50;
/** Inside the Kremlin's triangle (m metres in from its walls; negative m reaches out). */
export function inKremlin(x, z, m = 0) {
  for (let i = 0; i < 3; i++) {
    const a = KREMLIN[i], b = KREMLIN[(i + 1) % 3], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const side = ((b[0] - a[0]) * (z - a[1]) - (b[1] - a[1]) * (x - a[0])) / L;    // > 0 inside (the polygon runs clockwise in x-east, z-south)
    if (side < m) return false;
  }
  return true;
}
// the Borovitsky hill: the Kremlin stands ~8 m above the square's level, falling to the river
export function height(x, z) {
  const dr = Math.abs(z - riverZ(x)), edge = smooth(RADIUS - 70, RADIUS - 40, Math.hypot(x, z));
  const hill = 6 * smooth(-30, -120, x) * smooth(200, 150, z);
  const bank = -4 * smooth(170, RIVER.z - RIVER.w / 2 - 4, z) * smooth(RIVER.z + RIVER.w / 2 + 30, RIVER.z + RIVER.w / 2 + 4, z);
  const river = (RIVER.bed - bank) * smooth(RIVER.w / 2 + 6, RIVER.w / 2 - 6, dr);
  const d = x - wallX(z), carve = smooth(MOAT.d0, MOAT.d0 + 0.5, d) * smooth(MOAT.d1, MOAT.d1 - 0.5, d) * smooth(MOAT.z0, MOAT.z0 + 0.5, z) * smooth(MOAT.z1, MOAT.z1 - 0.5, z);
  const h = (hill + bank + river) * (1 - edge);
  return h + (MOAT.bed - h) * carve;
}
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
export const reserved = (cx, cz) => nearKitai(cx, cz, 10) || CHURCHES.some((c) => Math.hypot(cx - c[0], cz - c[1]) < 17) || inRect(SQUARE, cx, cz, 6) || Math.hypot(cx - BASIL[0], cz - BASIL[1]) < 34 || inRect(ROWS, cx, cz, 6)
  || Object.values(CATHEDRALS).some((r) => r.length === 4 ? inRect(r, cx, cz, 14) : Math.hypot(cx - r[0], cz - r[1]) < 22)
  || (inKremlin(cx, cz, -14) && !inKremlin(cx, cz, 12)) || Math.abs(cz - riverZ(cx)) < RIVER.w / 2 + 8
  || (cz > KREMLIN[0][1] - 10 && cz < KREMLIN[1][1] + 10 && cx > wallX(cz) && cx < SQUARE[0] + 6);      // the open field cleared before the wall (1493–95), the moat in it
let LOTS = null;
/** The log houses: courts of the boyars inside the Kremlin, the posad outside. */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(1600);
  for (let x = -RADIUS + 20; x < RADIUS - 20; x += 14) for (let z = -RADIUS + 20; z < RADIUS - 20; z += 14) {
    const w = 8 + rand() * 4, d = 6 + rand() * 3, rot = rand() < 0.5, cx = x + 7, cz = z + 7;
    if (Math.hypot(cx, cz) > RADIUS - 45 || reserved(cx, cz) || Math.abs((cz + 420) % 70 - 35) < 4 || Math.abs((cx + 420) % 84 - 42) < 4 || rand() < 0.15) continue;
    if (inKremlin(cx, cz, 12) && (Math.abs(cx + 170) < 70 && Math.abs(cz - 20) < 55)) continue;  // Cathedral Square and round it
    const hw = (rot ? d : w) / 2, hd = (rot ? w : d) / 2, ys = [height(cx - hw, cz - hd), height(cx + hw, cz - hd), height(cx - hw, cz + hd), height(cx + hw, cz + hd)];
    LOTS.push({ rect: [cx - hw, cz - hd, cx + hw, cz + hd], y: Math.max(...ys), foot: Math.min(...ys) - 0.4, kind: rand() < 0.12 ? 'barn' : 'stue', roof: 'planks_grey', seed: Math.floor(rand() * 1e6) });
  }
  return LOTS;
}
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));

/** Is (x, z) on a street of the grid (the cells left free between the houses), 14 m wide? */
export const onStreetX = (x) => Math.abs((x + 420) % 84 - 42) < 7;
export const onStreetZ = (z) => Math.abs((z + 420) % 70 - 35) < 7;
/** Where the street paving and the walkers' ways stop: the outer rim, the reserved sites, the river, the houses. */
export const streetSkip = (x, z) => Math.hypot(x, z) > RADIUS - 55 || reserved(x, z) || inRiver(x, z) || inLot(x, z, -0.5);
/** The streets of the grid as straight segments { a, b } (their middle lines), cut where they are not open. */
export function streetSegments(step = 4) {
  const S = [], R = RADIUS - 55;
  const scan = (line, mk) => {
    let run = null;
    for (let u = -R; u <= R + 0.01; u += step) {
      const [x, z] = mk(u), ok = !streetSkip(x, z);
      if (ok && !run) run = [u, u];
      if (ok) run[1] = u;
      if ((!ok || u + step > R) && run) { if (run[1] - run[0] >= 12) S.push({ a: mk(run[0]), b: mk(run[1]) }); run = null; }
    }
  };
  for (let x = -378; x < R; x += 84) if (x > -R) scan(x, (u) => [x, u]);
  for (let z = -385; z < R; z += 70) if (z > -R) scan(z, (u) => [u, z]);
  return S;
}

/** The visitor's walk's lines [x, z] (openwalk.js): from the arrival south to St Basil's, the lane before the rows and its inner lanes, across the square to the Spassky bridge. */
export const WALK_LINES = () => {
  const zs = gateZ(SPASSKY[1]), xb = wallX(zs) + MOAT.d1 + 2;
  return [[[40, 20], [40, 96], [BASIL[0] + 8, BASIL[1] - 24]], [[68, -100], [68, 85]], [[68, 52.6], [90, 52.6]], [[77.5, -25], [77.5, 85]], [[87.5, -25], [87.5, 85]], [[40, 20], [xb + 3, zs]]];
};
const segD = (x, z, a, b) => { const dx = b[0] - a[0], dz = b[1] - a[1], t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / (dx * dx + dz * dz))); return Math.hypot(x - a[0] - t * dx, z - a[1] - t * dz); };
let WL = null;
/** True for a house within 30 m of the walk: every one of them stands open (the walk's houses are all furnished). */
const nearWalk = (x, z) => { WL = WL || WALK_LINES(); return WL.some((w) => w.some((_, i) => i < w.length - 1 && segD(x, z, w[i], w[i + 1]) < 30)); };
export const onWalk = (l) => l.kind !== 'barn' && nearWalk((l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2);
export const openIzba = (l) => { if (l.kind === 'barn') return false; const cx = (l.rect[0] + l.rect[2]) / 2, cz = (l.rect[1] + l.rect[3]) / 2, d = Math.hypot(cx - 40, cz - 20); if (nearWalk(cx, cz)) return true; return d < 90 ? l.seed % 2 === 0 : d < 200 ? l.seed % 2 === 1 : l.seed % 4 === 1; };
export function waysides() {
  const E = [], H = (i, j) => { let h = (i * 73856093) ^ (j * 19349663); h = Math.imul(h ^ (h >>> 13), 0x5bd1e995); return (h ^ (h >>> 15)) >>> 0; };
  for (let i = 0; i < 10; i++) for (let j = 0; j < 12; j++) {
    const sx = -378 + 84 * i, sz = -385 + 70 * j, h = H(i, j), k = h % 10;
    if (k > 5 || Math.hypot(sx, sz) > 340 || Math.hypot(sx - 40, sz - 20) < 45) continue;
    const ox = h & 16 ? 5.2 : -5.2, oz = h & 32 ? 5.2 : -5.2, x = sx + ox, z = sz + oz;
    const ok = [[0, 0], [1.6, 0], [-1.6, 0], [0, 1.6], [0, -1.6]].every(([a, b]) => !streetSkip(x + a, z + b) && !inLot(x + a, z + b, 1.2));
    if (!ok) continue;
    E.push({ t: 'wayside', kind: k < 3 ? 'well' : k < 5 ? 'chasovnya' : 'cross', c: [x, z], y: Math.max(height(x - 1, z - 1), height(x + 1, z + 1), height(x - 1, z + 1), height(x + 1, z - 1)), face: h & 64 ? (ox > 0 ? 3 : 1) : (oz > 0 ? 2 : 0) });
  }
  return E;
}
