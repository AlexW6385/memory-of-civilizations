// Classical Athens about 410 BC — the layout (docs/settlements/athens.md §2): the Acropolis rock in
// the middle (its summit 70 m above the town), the ramp climbing its west end to the Propylaia;
// the Areopagus to the north-west; the Agora beyond it with the Hephaisteion on its low hill and
// the Panathenaic Way running diagonally across to the Acropolis; houses packed all round. The
// Agora is brought nearer (it lies about 500 m from the Acropolis). Pure data. +x east, +z south.

export const RADIUS = 420;
export const ACRO = { c: [0, 0], r: [140, 72], top: 70, slope: 70 };
export const AREO = { c: [-175, -95], r: 38, h: 18 };
export const KOLONOS = { c: [-300, -250], r: 55, h: 10 };
export const AGORA = [-290, -235, -160, -110];
// the court north of the Erechtheion, about 3 m below the summit (the temple stands on the slope: its north and west
// sides about 3 m lower than the south and east), reached by a stair from the east
export const NCOURT = { rect: [14, -72, 48, -51.2], drop: 3, edge: -52.6 };      // the ground lowered under the temple's north side too; `edge` the court's south wall
export const RAMP = [[-310, 70], [-235, 45], [-175, 18], [-148, 2]];       // the Panathenaic ramp up the west end
export const WAY = [[-390, -330], [-260, -220], [-180, -60], [-210, 55], [-310, 70]];   // the Panathenaic Way from the Dipylon
// the south slope (docs/settlements/athens.md §4e): the theatre of Dionysos about 410 — an orchestra terrace 26 m
// across and the theatron above it, rows of wooden benches on an earth bank in three straight facets (the centre facing
// south, the wings turned 40° in), ending on the radial lines at 55° where the retaining walls stand; the Odeion of
// Pericles east of it (62.4 × 68.6 m); the sanctuary of Dionysos below the stage building. +x east, +z south.
export const THEATRE = { c: [72, 134], y: 1.0, r: 13, d0: 14.5, rows: 20, tread: 0.8, rise: 0.42, facets: [-40, 0, 40], end: 55 };
export const ODEION = { rect: [110, 108, 172.4, 176.6], y: 1.5 };
export const SLOPE = [35, 92, 182, 200];
// the quarters added in the fourth wave (docs/settlements/athens.md §11): the potters' quarter of the Kerameikos north of the
// Painted Stoa, the Academy's grove and gymnasium on the west edge, the South-East Fountain House and a row of workshops
// on the Agora's south side. +x east, +z south.
export const KERAMEIKOS = [-215, -300, -140, -248];
export const ACADEMY = [-380, -152, -312, -78];
export const FOUNTAIN = [-182, -132, -166, -124];
export const SHOPROW = [-216, -124.9, -188, -110];                                   // the south slope's buildings: no houses here
const RAD = Math.PI / 180;
/** The theatron's polygonal distance from the orchestra's centre (its rows are the lines of equal distance). */
export function theatreD(x, z, T = THEATRE) { const px = x - T.c[0], pz = z - T.c[1]; let D = -Infinity; for (const f of T.facets) D = Math.max(D, px * Math.sin(f * RAD) - pz * Math.cos(f * RAD)); return D; }
/** How far a point lies outside the theatron's end lines (0 between them). */
export function theatreOut(x, z, T = THEATRE) {
  const px = x - T.c[0], pz = z - T.c[1], al = Math.atan2(px, -pz), e = T.end * RAD;
  if (Math.abs(al) <= e) return 0;
  const s = Math.sign(al) || 1, dx = Math.sin(s * e), dz = -Math.cos(s * e), t = px * dx + pz * dz;
  return t <= 0 ? Math.hypot(px, pz) : Math.abs(px * dz - pz * dx);
}
/** The ground the theatre is cut to: under the orchestra, under each row, the walk behind the top row, a bank above. */
function theatreGround(x, z, T = THEATRE) {
  const D = theatreD(x, z, T), dN = T.d0 + T.rows * T.tread, yTop = T.y + T.rows * T.rise;
  const s = D < T.d0 ? T.y - 0.3 : D <= dN + 2.6 ? T.y + (Math.min(D, dN) - T.d0) / T.tread * T.rise - 0.6 : yTop + 1.0 + (D - dN - 2.6) * 2.0;
  return s + theatreOut(x, z, T) * 1.2;
}
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
function segDist(x, z, a, b) { const dx = b[0] - a[0], dz = b[1] - a[1], t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / (dx * dx + dz * dz))); return [Math.hypot(x - a[0] - dx * t, z - a[1] - dz * t), t]; }
export function pathAt(x, z, p) { let best = [Infinity, 0], acc = 0, total = 0; const L = []; for (let i = 0; i + 1 < p.length; i++) { L.push(Math.hypot(p[i + 1][0] - p[i][0], p[i + 1][1] - p[i][1])); total += L[i]; } for (let i = 0; i + 1 < p.length; i++) { const [d, t] = segDist(x, z, p[i], p[i + 1]); if (d < best[0]) best = [d, (acc + t * L[i]) / total]; acc += L[i]; } return best; }
/** How far inside the Acropolis's summit ellipse (1 at the rim, < 1 inside). */
export const acroE = (x, z) => Math.hypot((x - ACRO.c[0]) / ACRO.r[0], (z - ACRO.c[1]) / ACRO.r[1]);
export function height(x, z) {
  const e = acroE(x, z), dist = (e - 1) * Math.min(ACRO.r[0], ACRO.r[1]);
  let h = e <= 1 ? ACRO.top : ACRO.top * smooth(ACRO.slope, 0, dist) ** 1.6;
  if (e <= 1 && inRect(NCOURT.rect, x, z)) h = ACRO.top - NCOURT.drop - 0.15;
  const a = Math.hypot(x - AREO.c[0], z - AREO.c[1]) / AREO.r; if (a < 1) h = Math.max(h, AREO.h * smooth(1, 0.4, a));
  const k = Math.hypot(x - KOLONOS.c[0], z - KOLONOS.c[1]) / KOLONOS.r; if (k < 1) h = Math.max(h, KOLONOS.h * smooth(1, 0.3, k));
  // the ramp: rising evenly from the town to the Propylaia's foot
  const [d, t] = pathAt(x, z, RAMP);
  if (d < 12) { const ry = ACRO.top * smooth(0, 1, t) ** 1.0, w = smooth(12, 6, d); h = Math.max(h * (1 - w) + ry * w, h * (d < 6 ? 0 : 1)); if (d < 6) h = ry; }
  // the south slope: the theatre cut into the hill, the Odeion's floor levelled
  if (e > 1.02 && inRect(SLOPE, x, z, 30)) {
    h = Math.min(h, theatreGround(x, z));
    if (inRect(ODEION.rect, x, z, 0.6)) h = Math.min(h, ODEION.y - 0.4);
  }
  return h * (1 - smooth(RADIUS - 50, RADIUS - 5, Math.hypot(x, z)));
}
export const onWay = (x, z, m = 0) => pathAt(x, z, WAY)[0] < 5 + m;
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
let LOTS = null, HASH = null;
const CELL = 16;
const hkey = (cx, cz) => cx * 4096 + cz;
function hashAdd(l, i) { const [x0, z0, x1, z1] = l.rect; for (let cx = Math.floor(x0 / CELL); cx <= Math.floor(x1 / CELL); cx++) for (let cz = Math.floor(z0 / CELL); cz <= Math.floor(z1 / CELL); cz++) { const k = hkey(cx, cz); (HASH.get(k) || HASH.set(k, []).get(k)).push(i); } }
/** The house whose rectangle (grown by m) holds the point, or null. A spatial hash: cheap enough for the ground's per-sample cover and planting tests. */
export function lotAt(x, z, m = 0) {
  lots();
  for (let cx = Math.floor((x - m) / CELL); cx <= Math.floor((x + m) / CELL); cx++) for (let cz = Math.floor((z - m) / CELL); cz <= Math.floor((z + m) / CELL); cz++) {
    const a = HASH.get(hkey(cx, cz)); if (!a) continue;
    for (const i of a) if (inRect(LOTS[i].rect, x, z, m)) return LOTS[i];
  }
  return null;
}
export const SIMON = [-291, -107, -278, -93];
/** The points the open (walk-in) houses crowd round: the arrival, the Way and the Agora's edges, the road under the theatre. */
export const OPEN_CORES = [[-300, 70], [-262, 36], [-215, 20], [-200, 52], [-310, -60], [-330, -120], [-150, -150], [-195, -92], [-120, -20], [-60, 105], [60, 205]];
// the way the houses stand: the blocks are bands 27.4 m deep, two rows of houses back to back (the northern faces the lane on the
// north, the southern the lane on the south), lanes 3.6 m between the bands; along a band the houses stand wall to wall in runs
// of three to five, a cross-lane of 3.4 m between the runs; along the Way and the ramp the houses face the road itself (§5c)
const BAND = 27.4, LANE = 3.6, XLANE = 3.4;
const OFF = (p, r) => Math.hypot(...[p[0] - r[0], p[1] - r[1]]);
function blockedPt(x, z, loose) {
  return Math.hypot(x, z) > RADIUS - 40 || acroE(x, z) < (loose ? 1.12 : 1.6) || inRect(AGORA, x, z, 10) || inRect(SLOPE, x, z, 6) || pathAt(x, z, WAY)[0] < (loose ? 3.0 : 3.4) || pathAt(x, z, RAMP)[0] < (loose ? 3.0 : 9)
    || Math.hypot(x - AREO.c[0], z - AREO.c[1]) < AREO.r + 6 || Math.hypot(x - KOLONOS.c[0], z - KOLONOS.c[1]) < KOLONOS.r * 0.8
    || inRect(KERAMEIKOS, x, z, 10) || inRect(ACADEMY, x, z, 8) || inRect(FOUNTAIN, x, z, 6) || inRect(SHOPROW, x, z, 6) || inRect(SIMON, x, z, 2.5);
}
function rectFree(r, taken, loose = false) {
  const [x0, z0, x1, z1] = r;
  for (const x of [x0, (x0 + x1) / 2, x1]) for (const z of [z0, (z0 + z1) / 2, z1]) if (blockedPt(x, z, loose)) return false;
  for (const l of taken) { const q = l.rect; if (x0 < q[2] + 0.1 && x1 > q[0] - 0.1 && z0 < q[3] + 0.1 && z1 > q[1] - 0.1) return false; }
  return true;
}
/** 2: close to the visitor's ways (full dressing); 1: a few hundred metres round them; 0: the outer town. */
function tierOf(cx, cz) {
  const arr = Math.hypot(cx + 300, cz - 70), wy = pathAt(cx, cz, WAY)[0], rp = pathAt(cx, cz, RAMP)[0];
  if (arr < 70 || wy < 26 || rp < 26 || inRect(AGORA, cx, cz, 34) || inRect(SLOPE, cx, cz, 24) || OPEN_CORES.some((c) => OFF([cx, cz], c) < 34)) return 2;
  if (arr < 150 || wy < 70 || rp < 60 || inRect(AGORA, cx, cz, 90) || inRect(SLOPE, cx, cz, 70)) return 1;
  return 0;
}
const groundOf = (r) => { const ys = [[r[0], r[1]], [r[2], r[1]], [r[0], r[3]], [r[2], r[3]], [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2]].map(([a, b]) => height(a, b)); return [Math.min(...ys), Math.max(...ys)]; };
/** Courtyard houses: those facing the Way and the ramp, then the blocks of bands. Each { rect, front ('n'|'s'|'e'|'w'), seed, y, tier, open?, fall }. */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = []; HASH = new Map();
  const rand = rng(430), push = (l) => { l.tier = tierOf((l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2); LOTS.push(l); hashAdd(l, LOTS.length - 1); };
  const near = (x, z) => Math.min(...OPEN_CORES.map((c) => OFF([x, z], c)));
  // along the road: both sides, the fronts a street's width apart
  for (const path of [WAY, RAMP]) {
    for (let i = 0; i + 1 < path.length; i++) {
      const a = path[i], b = path[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]), tx = (b[0] - a[0]) / L, tz = (b[1] - a[1]) / L;
      for (const side of [-1, 1]) {
        const nx = -tz * side, nz = tx * side;                       // away from the road
        for (let s = 3; s < L - 3;) {
          const w = 9 + rand() * 3, d = 10 + rand() * 2.5, px = a[0] + tx * (s + w / 2), pz = a[1] + tz * (s + w / 2);
          const horiz = Math.abs(nz) > Math.abs(nx), front = horiz ? (nz > 0 ? 'n' : 's') : (nx > 0 ? 'w' : 'e');
          const ww = horiz ? w : d, dd = horiz ? d : w;
          let ok = null;
          for (let off = 3.6; off < 8 && !ok; off += 0.5) {
            const r = horiz ? [px - ww / 2, nz > 0 ? pz + off : pz - off - dd, px + ww / 2, nz > 0 ? pz + off + dd : pz - off] : [nx > 0 ? px + off : px - off - ww, pz - dd / 2, nx > 0 ? px + off + ww : px - off, pz + dd / 2];
            const corners = [[r[0], r[1]], [r[2], r[1]], [r[0], r[3]], [r[2], r[3]]];
            if (Math.min(...corners.map(([x, z]) => pathAt(x, z, path)[0])) >= 3.0) ok = r;
          }
          if (ok && rectFree(ok, LOTS, true)) {
            const [g0, g1] = groundOf(ok), fm = height((ok[0] + ok[2]) / 2 + (front === 'w' ? -ok[2] + ok[0] : front === 'e' ? ok[2] - ok[0] : 0) / 2, (ok[1] + ok[3]) / 2 + (front === 'n' ? ok[1] - ok[3] : front === 's' ? ok[3] - ok[1] : 0) / 2), y = Math.min(fm, g1) , fall = Math.max(0, y - g0);
            if (g1 - g0 <= 9 && fall <= 5) { push({ rect: ok, front, seed: Math.floor(rand() * 1e6), y, fall, road: true }); s += w + 0.25; continue; }
          }
          s += 4;
        }
      }
    }
  }
  // the bands
  let open = 0;
  for (let zb = -RADIUS + 18; zb < RADIUS - 40; zb += BAND + LANE) {
    for (let x = -RADIUS + 18; x < RADIUS - 30;) {
      const run = 3 + Math.floor(rand() * 3);
      for (let k = 0; k < run; k++) {
        const wantOpen = open < 26 && near(x + 6.5, zb + 7) < 80 + rand() * 90 && rand() < 0.42;
        const w = wantOpen ? 13 : 10.5 + rand() * 4, dA = wantOpen ? 14 : 11 + rand() * 4, dB = BAND - dA;
        const rA = [x, zb, x + w, zb + dA], rB = [x, zb + dA, x + w, zb + BAND];
        const cx = x + w / 2;
        for (const [r, front, isOpen] of [[rA, 'n', wantOpen], [rB, 's', false]]) {
          if (!rectFree(r, LOTS)) continue;
          const [g0, g1] = groundOf(r);
          if (g1 - g0 > 3.2 || rand() < 0.06) continue;
          if (isOpen) open++;
          push({ rect: r, front, seed: Math.floor(rand() * 1e6), y: g0, fall: g1 - g0, open: isOpen });
        }
        x += w + 0.12; void cx;
      }
      x += XLANE;
    }
  }
  return LOTS;
}
export const inLot = (x, z, m = 0) => !!lotAt(x, z, m);
