// Modern Sydney, 1973 — the layout (docs/settlements/sydney.md §2): the harbour across the north;
// Bennelong Point running out into it with the Opera House on its podium; Sydney Cove and Circular
// Quay with the ferry wharves and the Cahill Expressway; Dawes Point and the Rocks on the west, the
// Harbour Bridge springing north from them to Milsons Point; Farm Cove and the Botanic Garden on
// the east; the city's towers to the south. The Opera House at true size; the bridge at about half
// scale (its 503 m arch → 260 m); the city compressed. Pure data. +x east, +z south.

export const RADIUS = 460;
export const LEVEL = -2.4;
export const OPERA = { rect: [58, -250, 142, -128], stair: 22, h: 9 };
export const BENNELONG = [40, -275, 160, -90];
export const COVE = [-45, -100, 40, -8];
export const FARM = [168, -100, 300, -38];
/** Mrs Macquarie's Point, closing Farm Cove on the east (the view of the Opera House across the cove's mouth). */
export const MACQUARIE = [212, -150, 340, -92];
export const DAWES = [-265, -140, -105, -90];
export const NORTH = [-320, -560, -20, -385];
export const BRIDGE = { x: -150, z0: -372, z1: -112, rise: 56, depth0: 28.5, depth1: 9, deck: 26, w: 25, truss: 7.5, approach: 70, pylon: 46 };
export const QUAY = [-60, 2, 52, 30];                         // the Cahill Expressway over the station
export const AUSTRALIA_SQ = [-70, 230];
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
/** Signed distance into a rect with rounded corners (positive inside). */
function sdRect([x0, z0, x1, z1], x, z, round = 12) {
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, hx = (x1 - x0) / 2 - round, hz = (z1 - z0) / 2 - round;
  const qx = Math.abs(x - cx) - hx, qz = Math.abs(z - cz) - hz;
  return -(Math.hypot(Math.max(qx, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, qz), 0) - round);
}
/** How far (m) into the land; negative in the water. */
export function shore(x, z) {
  // (the coves' rects carried out past the harbour line, so that their water joins the harbour's without a sill at the mouth)
  let d = Math.min(z + 100, -sdRect([COVE[0], COVE[1] - 40, COVE[2], COVE[3]], x, z, 20), -sdRect([FARM[0], FARM[1] - 40, FARM[2], FARM[3]], x, z, 28));
  for (const [r, k] of [[BENNELONG, 30], [DAWES, 14], [NORTH, 20], [MACQUARIE, 12]]) d = Math.max(d, sdRect(r, x, z, k));
  return d;
}
export const inWater = (x, z) => shore(x, z) < 0 && Math.hypot(x, z) < RADIUS - 50;
export function height(x, z) {
  const d = shore(x, z), edge = smooth(RADIUS - 60, RADIUS - 25, Math.hypot(x, z));
  let land = 3 + 9 * smooth(-60, -200, x) * smooth(120, 20, z) + 4 * smooth(60, 300, z);         // the Rocks' sandstone ridge, the city rising south
  land += (QUAY_LAND - land) * smooth(16, 4, z) * smooth(-30, -14, z) * smooth(-62, -50, x) * smooth(56, 44, x);   // Circular Quay's frontage, low by the wharves' decks
  // the shore is the sea wall (§6): the land runs out level to the wall's back and drops steeply behind its face (d = -1)
  const h = -7 + (land + 7) * smooth(-1.6, 0.6, d);
  return h * (1 - edge);
}
const QUAY_LAND = 1.35;
/** The sea wall's face line (d = -1) in the disc: polylines with the landward normal and the coping's height at each point. */
export function seawalls() {
  const S = 1.5, X0 = -RADIUS, nx = Math.ceil(2 * RADIUS / S), nz = Math.ceil((RADIUS + 40) / S);
  const f = new Float32Array((nx + 1) * (nz + 1));
  for (let k = 0; k <= nz; k++) for (let i = 0; i <= nx; i++) f[k * (nx + 1) + i] = shore(X0 + i * S, X0 + k * S) + 1;
  const F = (i, k) => f[k * (nx + 1) + i];
  // marching squares: each cell's crossing points on its edges, keyed by the edge
  const pt = new Map(), adj = new Map();
  const ept = (key, a, b, ax, az, bx, bz) => { if (!pt.has(key)) { const t = a / (a - b); pt.set(key, [ax + (bx - ax) * t, az + (bz - az) * t]); } return key; };
  const link = (p, q) => { for (const [a, b] of [[p, q], [q, p]]) { if (!adj.has(a)) adj.set(a, []); adj.get(a).push(b); } };
  for (let k = 0; k < nz; k++) for (let i = 0; i < nx; i++) {
    const v = [F(i, k), F(i + 1, k), F(i + 1, k + 1), F(i, k + 1)], x = X0 + i * S, z = X0 + k * S;
    const c = [[x, z], [x + S, z], [x + S, z + S], [x, z + S]], keys = [`h${i},${k}`, `v${i + 1},${k}`, `h${i},${k + 1}`, `v${i},${k}`];
    const cross = [];
    for (let e = 0; e < 4; e++) { const a = v[e], b = v[(e + 1) % 4]; if ((a < 0) !== (b < 0)) cross.push(ept(keys[e], a, b, ...c[e], ...c[(e + 1) % 4])); }
    if (cross.length === 2) link(cross[0], cross[1]);
    else if (cross.length === 4) { link(cross[0], cross[1]); link(cross[2], cross[3]); }
  }
  // chain the segments into polylines, cut where they leave the disc's built water
  const used = new Set(), runs = [], inside = ([x, z]) => Math.hypot(x, z) < RADIUS - 58;
  for (const start of adj.keys()) {
    if (used.has(start)) continue;
    // walk to one end first (or round a loop), then back along the whole chain
    let a = start, prev = null;
    for (let g = 0; g < 1e5; g++) { const nb = adj.get(a).filter((q) => q !== prev); if (!nb.length || nb[0] === start) break; prev = a; a = nb[0]; }
    const chain = [a]; used.add(a); prev = null;
    for (let g = 0; g < 1e5; g++) { const nb = adj.get(a).filter((q) => q !== prev && !used.has(q)); if (!nb.length) break; prev = a; a = nb[0]; used.add(a); chain.push(a); }
    let cur = [];
    for (const key of chain) { const p = pt.get(key); if (inside(p)) cur.push(p); else { if (cur.length > 2) runs.push(cur); cur = []; } }
    if (cur.length > 2) runs.push(cur);
  }
  // thin the points (keep the line within 8 cm), then the landward normals (mitred) and the coping's height
  const simplify = (P, tol) => {
    const keep = new Uint8Array(P.length); keep[0] = keep[P.length - 1] = 1;
    const rec = (i0, i1) => { let m = -1, dm = tol; const [ax, az] = P[i0], [bx, bz] = P[i1], L = Math.hypot(bx - ax, bz - az) || 1e-9;
      for (let i = i0 + 1; i < i1; i++) { const d = Math.abs((bx - ax) * (az - P[i][1]) - (ax - P[i][0]) * (bz - az)) / L; if (d > dm) { dm = d; m = i; } }
      if (m > 0) { keep[m] = 1; rec(i0, m); rec(m, i1); } };
    rec(0, P.length - 1); return P.filter((_, i) => keep[i]);
  };
  return runs.map((P0) => {
    const P = simplify(P0, 0.08), out = [P[0]];
    for (let i = 1; i < P.length; i++) { const L = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]), n = Math.ceil(L / 4); for (let s = 1; s <= n; s++) out.push([P[i - 1][0] + (P[i][0] - P[i - 1][0]) * s / n, P[i - 1][1] + (P[i][1] - P[i - 1][1]) * s / n]); }
    const seg = (i) => { const a = out[i], b = out[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [-(b[1] - a[1]) / L, (b[0] - a[0]) / L]; };
    const mid = out[Math.floor(out.length / 2)], s0 = seg(Math.min(Math.floor(out.length / 2), out.length - 2));
    const sg = shore(mid[0] + s0[0] * 2, mid[1] + s0[1] * 2) > shore(mid[0] - s0[0] * 2, mid[1] - s0[1] * 2) ? 1 : -1;
    const n = out.map((_, i) => { const a = i > 0 ? seg(i - 1) : seg(0), b = i < out.length - 1 ? seg(i) : seg(out.length - 2); let mx = a[0] + b[0], mz = a[1] + b[1]; const m = Math.hypot(mx, mz) || 1; mx /= m; mz /= m; const cs = Math.max(0.5, mx * a[0] + mz * a[1]); return [sg * mx / cs, sg * mz / cs]; });
    const top = out.map(([x, z], i) => height(x + n[i][0] * 2, z + n[i][1] * 2));
    return { pts: out.map(([x, z]) => [+x.toFixed(2), +z.toFixed(2)]), n: n.map(([a, b]) => [+a.toFixed(3), +b.toFixed(3)]), top: top.map((v) => +v.toFixed(2)) };
  });
}
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
export const GARDEN = [150, -38, 420, 150];
export const STREETS_X = [-250, -180, -110, -40, 30, 100];       // George, Pitt and the rest, running south
export const STREETS_Z = [70, 140, 210, 280, 350];
const onStreet = (x, z) => STREETS_X.some((s) => Math.abs(x - s) < 9) || STREETS_Z.some((s) => Math.abs(z - s) < 8);
let LOTS = null;
/** The city's buildings: sandstone terraces in the Rocks, office towers of the 1960s and 70s among older blocks in the city. */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(1973);
  for (let x = -RADIUS + 20; x < RADIUS - 20; x += 16) for (let z = -120; z < RADIUS - 20; z += 16) {
    const w = 11 + rand() * 4, d = 11 + rand() * 4, cx = x + 8, cz = z + 8;
    if (Math.hypot(cx, cz) > RADIUS - 45 || shore(cx, cz) < 10 || inRect(GARDEN, cx, cz, 4) || inRect(MACQUARIE, cx, cz, 4) || inRect(QUAY, cx, cz, 10) || inRect(BENNELONG, cx, cz, 4) || onStreet(cx, cz)
      || Math.abs(cx - BRIDGE.x) < 31 && cz < -30 || Math.hypot(cx - AUSTRALIA_SQ[0], cz - AUSTRALIA_SQ[1]) < 34 || rand() < 0.12) continue;
    const rocks = cx < -100 && cz < 70, ys = [height(cx - w / 2, cz - d / 2), height(cx + w / 2, cz - d / 2), height(cx - w / 2, cz + d / 2), height(cx + w / 2, cz + d / 2)];
    let h, mat;
    if (rocks) {
      // the Rocks: a short terrace of two-storey houses facing the lane, or by the harbour a sandstone bond store (§5a)
      const seed = Math.floor(rand() * 1e6), store = cz < -60 && rand() < 0.5;
      LOTS.push({ t: 'rocks_terrace', rect: [x, z, x + w, z + d], y: Math.max(...ys), y0: Math.min(...ys), front: Math.floor((z + 1000) / 16) % 2 ? 's' : 'n', kind: store ? 'store' : 'terrace', seed });
      continue;
    }
    h = 15 + rand() * 30; mat = ['facade_buff', 'facade_grey', 'facade_limestone'][Math.floor(rand() * 3)]; if (rand() < 0.22) { h = 60 + rand() * 90; mat = rand() < 0.6 ? 'facade_glass' : 'facade_grey'; }
    LOTS.push({ rect: [x, z, x + w, z + d], y: Math.max(...ys), h: Math.round(h), mat, seed: Math.floor(rand() * 1e6), tanks: false });
  }
  // shop fronts only on the faces with a street or a lane of at least 3 m before them
  for (const l of LOTS) {
    if (l.t) continue;
    const [x0, z0, x1, z1] = l.rect, clear = (r) => !LOTS.some((o) => o !== l && o.rect[0] < r[2] && o.rect[2] > r[0] && o.rect[1] < r[3] && o.rect[3] > r[1]);
    l.shops = [['n', [x0, z0 - 3, x1, z0]], ['s', [x0, z1, x1, z1 + 3]], ['w', [x0 - 3, z0, x0, z1]], ['e', [x1, z0, x1 + 3, z1]]].filter(([, r]) => clear(r)).map(([f]) => f).join('');
  }
  // the two rooms one can walk into (rooms.js, §1f): a tenant's terrace house in the Rocks and an espresso bar near the quay
  const clearR = (l, r) => !LOTS.some((o) => o !== l && o.rect[0] < r[2] && o.rect[2] > r[0] && o.rect[1] < r[3] && o.rect[3] > r[1]);
  const strip = (l, f) => { const [x0, z0, x1, z1] = l.rect; return f === 'n' ? [x0, z0 - 3, x1, z0] : [x0, z1, x1, z1 + 3]; };
  const best = (cands, tx, tz) => cands.sort((a, b) => Math.hypot(a.rect[0] - tx, a.rect[1] - tz) - Math.hypot(b.rect[0] - tx, b.rect[1] - tz))[0];
  const terr = best(LOTS.filter((l) => l.t === 'rocks_terrace' && l.kind === 'terrace' && clearR(l, strip(l, l.front)) && shore((l.rect[0] + l.rect[2]) / 2, l.front === 'n' ? l.rect[1] - 2 : l.rect[3] + 2) > 8
    && l.y + 0.5 - height(l.rect[0] + 0.85, l.front === 'n' ? l.rect[1] - 1.2 : l.rect[3] + 1.2) < 1.4), -170, 10);
  if (terr) { terr.enter = 0; terr.gy = height(terr.rect[0] + 0.85, terr.front === 'n' ? terr.rect[1] - 1.2 : terr.rect[3] + 1.2); }
  const AMP = [-40, 30, 20, 76];
  const cafe = best(LOTS.filter((l) => !l.t && !inRect(AMP, (l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2, 14) && !LOTS.some((o) => o !== l && o.rect[0] < l.rect[2] + 0.5 && o.rect[2] > l.rect[0] - 0.5 && o.rect[1] < l.rect[3] + 0.5 && o.rect[3] > l.rect[1] - 0.5 && false)
    && ['n', 's'].some((f) => clearR(l, strip(l, f))) && l.rect[2] - l.rect[0] >= 11), -10, 90);
  if (cafe) {
    const f = clearR(cafe, strip(cafe, 'n')) ? 'n' : 's', [x0, z0, x1, z1] = cafe.rect, du = (x1 - x0) * 0.62;
    Object.assign(cafe, { t: 'espresso_bar', front: f, gy: height(x0 + du, f === 'n' ? z0 - 1.2 : z1 + 1.2), wall: 'brick' });
  }
  return LOTS;
}
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));
