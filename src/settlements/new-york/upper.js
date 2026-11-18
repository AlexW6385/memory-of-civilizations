// The upper floors of the shop lots (docs/settlements/new-york.md §1p). The shop below is built as before (the style's `skyscraper`,
// in the lot narrowed by the stair hall's strip); here the solid body above its ceiling is taken out and built again as two storeys
// of rooms with a stair hall at one end: the street door beside the shop, a steep straight stair (39°) up past the second floor to the
// third, a door from the hall at each landing, the rooms by the trade below (the family's flat, the offices, the loft, the rooming
// house), windows that are real openings in the 0.3 m wall, and, where the full form of the block put a fire escape on the front, a
// window at its deck on the third floor that can be stepped through. Above the third floor the body is solid as before.
// Laid out in the lot's frame: u along the street face (mirrored so that the hall is always at low u), v inward from the face.
import { box, rod, lathe as lathe0 } from '../../core/geom.js';
import { face } from '../../styles/artdeco/blocks.js';
import { SW, narrowRect, adsOf, stripRect } from './upper-plan.js';

const T = 0.3, S = 3.08, SL = 0.8, V0 = 0.9, DOOR = 0.9;
const SC = 'stucco_cream', PL = 'plaster_white';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/** Heights of the opened floors above the street (the shop's ceiling at 4.5, boards 2 cm over it). */
export const levels = (y) => { const Y2 = y + 4.52, Y3 = Y2 + S; return { Y2, Y3, Yt: Y3 + S - 0.25 }; };
/** A hash of a point in [0, 1): the pieces repeated about a house (a window's panes, a bed, a stool) differ by a few millimetres and a hair's turn, so that the bag does not take them for one prototype (src/core/geom.js: every axis-aligned box of a material is one; each prototype of twelve copies is a mesh of its own, and the settlement is at its cap). */
const lathe = (prof, seg, mod, x, y, z) => lathe0(prof.map(([r, h]) => [r * (1 + 0.04 * (hash(x, y, z) - 0.5)), h]), seg, mod, x, y, z);
export const hash = (x, y, z) => { const s = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453; return s - Math.floor(s); };
export function vary(g, k) {
  g.computeBoundingBox(); const b = g.boundingBox, cx = (b.min.x + b.max.x) / 2, cy = (b.min.y + b.max.y) / 2, cz = (b.min.z + b.max.z) / 2;
  const h1 = hash(cx, cy, cz + k), h2 = hash(cy, cz, cx + k), h3 = hash(cz, cx, cy + k), e = 0.003;
  const sx = b.max.x - b.min.x, sy = b.max.y - b.min.y, sz = b.max.z - b.min.z;
  g.translate(-cx, -cy, -cz); g.scale(1 + e * h1 / Math.max(sx, 0.02), 1 + e * h2 / Math.max(sy, 0.02), 1 + e * h3 / Math.max(sz, 0.02)); g.rotateY(1.6e-4 + 1.6e-4 * h1); g.translate(cx, cy, cz);
  return g;
}
const nUnits = (W, t) => Math.max(1, Math.round(W / t));

/**
 * The rooms of the two floors in the lot's local u (hall at low u): { f2: [rooms], f3: [rooms], corr2: [v0, v1], corr3: [v0, v1] }; a room
 * { type, u0, u1, v0, v1, door: 'v1' | 'v0' | null (the boundary its door is in), du (the door's u), win: 'front' | 'rear' | null }.
 */
export function layoutOf(use, L, ext) {
  const a = SW + T, b = L - T, W = b - a, f2 = [], f3 = [];
  const split = (n) => Array.from({ length: n }, (_, i) => [a + W * i / n, a + W * (i + 1) / n]);
  const TY = {
    flat: { f: ['parlour', 'bedroom'], k: ['kitchen', 'bedroom', 'bath', 'storage'], s3: ['parlour', 'bedroom'], i3: ['kitchen', 'bedroom'] },
    office: { f: ['wait', 'office'], k: ['office', 'files', 'office'], s3: ['office', 'wait'], i3: ['files', 'office'] },
    rooming: { f: ['room', 'room'], k: ['room', 'bath', 'room'], s3: ['room', 'room'], i3: ['room', 'room'] },
    loft: {},
  }[use];
  if (use === 'loft') {
    f2.push({ type: 'cutting', u0: a, u1: b, v0: T, v1: 5.45, door: null, win: 'front' }, { type: 'sewing', u0: a, u1: b, v0: 7.5, v1: ext - T, door: null, win: 'rear' });
    f3.push({ type: 'pressing', u0: a, u1: b, v0: T, v1: 9.3, door: null, win: 'front' });
    if (ext - T - 11.9 >= 2.5) f3.push({ type: 'storage', u0: a, u1: b, v0: 11.9, v1: ext - T, door: null, win: 'rear' });
    return { f2, f3, corr2: null, corr3: null };
  }
  const c2 = [5.85, 7.15], c3 = [9.7, ext - T >= 14.4 ? 11.9 : ext - T];
  split(nUnits(W, 4.8)).forEach(([u0, u1], i) => f2.push({ type: TY.f[i % TY.f.length], u0, u1, v0: T, v1: c2[0], door: 'v1', du: (u0 + u1) / 2, win: 'front' }));
  split(nUnits(W, 4.8)).forEach(([u0, u1], i) => f2.push({ type: TY.k[i % TY.k.length], u0, u1, v0: c2[1], v1: ext - T, door: 'v0', du: (u0 + u1) / 2, win: 'rear' }));
  split(nUnits(W, 4.8)).forEach(([u0, u1], i) => {
    f3.push({ type: TY.s3[i % TY.s3.length], u0, u1, v0: T, v1: 4.9, door: 'v1', du: (u0 + u1) / 2, win: 'front' });
    f3.push({ type: TY.i3[i % TY.i3.length], u0, u1, v0: 4.9, v1: c3[0], door: 'v1', du: (u0 + u1) / 2, win: null });
  });
  if (c3[1] < ext - T - 1.5) split(nUnits(W, 4.8)).forEach(([u0, u1], i) => f3.push({ type: i % 2 ? 'bath' : 'storage', u0, u1, v0: c3[1], v1: ext - T, door: 'v0', du: (u0 + u1) / 2, win: 'rear' }));
  return { f2, f3, corr2: c2, corr3: c3 };
}

/** The builder: the style's `skyscraper` for the lot, upper floors opened. */
export function withUpstairs(orig) {
  return (el, ctx) => {
    const o = el.up;
    if (!o) return orig(el, ctx);
    const { bag, col, lights } = ctx, y = el.y ?? 0, h = el.h, mat = el.mat;
    const seen = { deck: null };
    const pbag = Object.create(bag);
    pbag.add = (m, g) => {
      if (!g) return;
      if (m === mat || m === 'iron') {
        g.computeBoundingBox(); const b = g.boundingBox;
        if (m === mat && Math.abs(b.min.y - (y + 4.5)) < 1e-4 && Math.abs(b.max.y - (y + h)) < 1e-4) return;           // the solid body over the shop's ceiling
        if (m === 'iron' && !seen.deck && Math.abs(b.max.y - (y + 7.6)) < 1e-4 && Math.abs(b.min.y - (y + 7.52)) < 1e-4) seen.deck = [b.min.x, b.max.x];   // the fire escape's first deck
      }
      bag.add(m, g);
    };
    const pcol = Object.create(col);
    pcol.rect = (rc, y0, y1) => { if (Math.abs(y0 - (y + 4.5)) < 1e-4 && Math.abs(y1 - (y + h)) < 1e-4) return; col.rect(rc, y0, y1); };
    orig({ ...el, rect: narrowRect(el), ads: adsOf(el) }, { ...ctx, bag: pbag, col: pcol });
    build(el, o, bag, col, lights, seen.deck);
  };
}

function build(el, o, bag, col, lights, deck) {
  const y = el.y ?? 0, h = el.h, mat = el.mat, F = face(el.rect, el.front), L = F.L, ext = F.ext, flip = o.end === 'hi', { Y2, Y3, Yt } = levels(y);
  const r = rng((el.seed || 1) ^ 0x9e3779b1), pk = (a) => a[Math.floor(r() * a.length)];
  const iv = (u0, u1) => (flip ? [L - u1, L - u0] : [u0, u1]);
  const B = (m, u0, u1, y0, y1, v0, v1) => { if (y1 - y0 < 1e-4 || u1 - u0 < 1e-4 || v1 - v0 < 1e-4) return; const [a, b] = iv(u0, u1); bag.add(m, vary(F.R(a, b, y0, y1, -v1, -v0), 1)); };
  const C = (u0, u1, v0, v1, y0, y1) => { const [a, b] = iv(u0, u1); col.rect(F.rc(a, b, -v1, -v0), y0, y1); };
  const Fl = (u0, u1, v0, v1, yy) => { const [a, b] = iv(u0, u1); col.floor(F.rc(a, b, -v1, -v0), yy); };
  const Pt = (u, v, yy) => F.P(flip ? L - u : u, -v, yy);
  const rampDir = el.front === 'n' ? 's' : 'n';
  const { f2, f3, corr2, corr3 } = layoutOf(o.use, L, ext), a = SW + T, b = L - T;
  const dEnd = ext - T;
  const stairY = (v) => y + 0.06 + SL * (v - V0), vTop = V0 + (Y3 - y - 0.06) / SL;
  const H2o = [Y2 + 0, Y3], door2 = [6.02, 6.92], door3 = [vTop - 0.45, vTop + 0.45];

  // ── the cap: the floors above are solid as before, under a plaster ceiling ──
  B(mat, 0, L, Yt, y + h, 0, ext); C(0, L, 0, ext, Yt, y + h);
  B(PL, T, L - T, Yt - 0.03, Yt, T, dEnd);

  // ── the slabs and boards: the third floor's, the second's boards over the shop's ceiling; the hall's with the stair's holes ──
  B(PL, a, b, Y3 - 0.25, Y3 - 0.02, T, dEnd); B('timber', a, b, Y3 - 0.02, Y3, T, dEnd); Fl(a, b, T, dEnd, Y3);
  B('timber', a, b, y + 4.5, Y2, T, dEnd); Fl(a, b, T, dEnd, Y2);
  const h2a = 3.55, h2b = 6.8, h3a = 7.4;
  B(PL, T, SW, y + 4.25, y + 4.5, T, h2a); B(PL, T, SW, y + 4.25, y + 4.5, h2b, dEnd); B('timber', T, SW, y + 4.5, Y2, h2b, dEnd);
  B(PL, T, SW, Y3 - 0.25, Y3 - 0.02, T, h3a); B(PL, T, SW, Y3 - 0.25, Y3, vTop, dEnd); B('timber', T, SW, Y3 - 0.02, Y3, T, h3a); B('timber', T, SW, Y3 - 0.02, Y3, vTop, dEnd);
  Fl(T, SW, h2b, dEnd, Y2); Fl(T, SW, vTop, dEnd, Y3); 

  // ── the walls from the shop's ceiling to the cap: mat outside, plaster within ──
  const wallV = (u0, u1, y0, y1, v0, v1, inside, gaps = []) => {            // a wall along v at u0..u1, plastered on the `inside` (+1: toward +u, −1: toward −u)
    let v = v0;
    const cut = [...gaps].sort((p, q) => p[0] - q[0]);
    const seg = (va, vb) => { if (vb - va < 1e-3) return; const m = inside > 0 ? [u0, u1 - 0.03, u1 - 0.03, u1] : [u0 + 0.03, u1, u0, u0 + 0.03]; B(mat, m[0], m[1], y0, y1, va, vb); B(SC, m[2], m[3], y0, y1, va, vb); C(u0, u1, va, vb, y0, y1); };
    for (const [ga, gb, top] of cut) { seg(v, ga); if (top) { B(SC, u0, u1, top, y1, ga, gb); } v = gb; }
    seg(v, v1);
  };
  // the party wall at the hall's outer side (from the pavement), the far party wall
  { const m = [0, T - 0.03, T - 0.03, T]; B(mat, m[0], m[1], y - 0.5, Yt, 0, ext); B(SC, m[2], m[3], y + 0.06, Yt, T, dEnd); C(0, T, 0, ext, y - 0.5, Yt); }
  wallV(L - T, L, y + 4.5, Yt, 0, ext, -1);
  // the hall's wall to the dwelling, a door at each landing
  wallV(SW, a, y + 4.5, Yt, 0, ext, +1, [[door2[0], door2[1], Y2 + 2.1], [door3[0], door3[1], Y3 + 2.1]]);
  { let v = T; for (const [ga, gb] of [door2, door3, [dEnd, dEnd]]) { B(SC, SW - 0.03, SW, y + 4.5, Yt, v, ga); v = gb; } }      // (the hall's plaster on the same wall, round the doors)

  // ── the front and rear walls with their windows ──
  const winsFront = { 2: [], 3: [] }, winsRear = { 2: [], 3: [] };
  const wins = (rooms, which, k) => { for (const rm of rooms) if (rm.win === which) { const n = Math.max(1, Math.round((rm.u1 - rm.u0) / 3.4)), w = rm.win === 'front' || o.use !== 'loft' ? 1.25 : 1.6; for (let i = 0; i < n; i++) { const c = rm.u0 + (rm.u1 - rm.u0) * (i + 0.5) / n; (which === 'front' ? winsFront : winsRear)[k].push([c - w / 2, c + w / 2, 0.85]); } } };
  wins(f2, 'front', 2); wins(f2, 'rear', 2); wins(f3, 'front', 3); wins(f3, 'rear', 3);
  // the door-window to the fire escape's deck on the third floor
  let deckU = null;
  if (deck) {
    const du = [deck[0] - el.rect[0], deck[1] - el.rect[0]], [d0, d1] = flip ? [L - du[1], L - du[0]] : du;
    deckU = [d0, d1];
    const cand = winsFront[3].find(([p, q]) => (p + q) / 2 > d0 + 0.55 && (p + q) / 2 < d1 - 0.55);
    if (cand) { cand[2] = 0.4; cand.door = true; }
  }
  const wallH = (v0, v1, mIn, wl, k, ws, front) => {       // a wall along u at v0..v1 (inner face on `mIn`: 0 = at v0 side)
    const u0 = 0, u1 = L, sorted = ws.slice().sort((p, q) => p[0] - q[0]);
    const yb = k === 2 ? y + 4.5 : Y3 - S + 2.45, yk = k === 2 ? Y2 : Y3, yh = yk + 2.45;
    const mats = (ya, yz, ua, ub) => { if (yz - ya < 1e-3 || ub - ua < 1e-3) return; const cv = mIn === 1 ? [v0, v1 - 0.03, v1 - 0.03, v1] : [v0 + 0.03, v1, v0, v0 + 0.03]; B(mat, ua, ub, ya, yz, cv[0], cv[1]); B(SC, ua, ub, ya, yz, cv[2], cv[3]); C(ua, ub, v0, v1, ya, yz); };
    let u = u0;
    for (const [p, q, sill] of sorted) { mats(yb, yk + 0.85, u, p); mats(yk + 0.85, yh, u, p); mats(yb, yk + sill, p, q); u = q; }
    mats(yb, yk + 0.85, u, u1); mats(yk + 0.85, yh, u, u1);
    mats(yh, k === 2 ? Y3 - S + 2.45 + 0 : Yt, u0, u1);
    for (const [p, q, sill] of sorted) {
      const dr = ws.find((w) => w === [p, q, sill]);
      void dr;
      const gl = sill > 0.5;
      if (gl) {
        const vm = (v0 + v1) / 2;
        B('glass_outer', p + 0.04, q - 0.04, yk + sill + 0.06, yk + 2.4, vm - 0.01, vm + 0.01);
        B('paint_white', (p + q) / 2 - 0.02, (p + q) / 2 + 0.02, yk + sill + 0.06, yk + 2.4, vm - 0.03, vm + 0.03);
        B('paint_white', p + 0.04, q - 0.04, yk + 1.55, yk + 1.59, vm - 0.03, vm + 0.03);
        B('paint_white', p, p + 0.05, yk + sill, yk + 2.45, vm - 0.04, vm + 0.04); B('paint_white', q - 0.05, q, yk + sill, yk + 2.45, vm - 0.04, vm + 0.04);
      }
      if (front && sill > 0.5) { B('limestone', p - 0.1, q + 0.1, yk + 0.77, yk + 0.85, -0.12, 0.12); B('limestone', p - 0.1, q + 0.1, yk + 2.45, yk + 2.62, -0.06, 0.12); }
      if (gl && mIn === 0) { B('paint_white', p + 0.06, p + 0.3, yk + 0.95, yk + 2.4, v0 + 0.0, v0 + 0.02); B('paint_white', q - 0.3, q - 0.06, yk + 0.95, yk + 2.4, v0 + 0.0, v0 + 0.02); }
    }
  };
  // (the plaster side is inside: for the front wall the inner face is at v1 = T, for the rear at v0 = dEnd)
  for (const [k, ws] of [[2, winsFront[2]], [3, winsFront[3]]]) wallH(0, T, 1, 0, k, ws, true);
  for (const [k, ws] of [[2, winsRear[2]], [3, winsRear[3]]]) wallH(dEnd, ext, 0, 0, k, ws, false);

  // ── the fire escape's deck as a floor, its rails as obstacles ──
  if (deckU) {
    const [d0, d1] = deckU; Fl(d0, d1, -1.25, -0.02, y + 7.6);
    C(d0, d1, -1.26, -1.19, y + 7.6, y + 8.55); C(d0, d0 + 0.06, -1.25, -0.02, y + 7.6, y + 8.55); C(d1 - 0.06, d1, -1.25, -0.02, y + 7.6, y + 8.55);
  }

  // ── the partitions of the floors ──
  const part = (yk, rooms, bounds) => {
    const ceil = yk + S - 0.25, doorsAt = (v, side) => rooms.filter((rm) => rm.door === side && Math.abs((side === 'v1' ? rm.v1 : rm.v0) - v) < 1e-3).map((rm) => [rm.du - DOOR / 2, rm.du + DOOR / 2]);
    for (const [v, side] of bounds) {
      const gaps = doorsAt(v, side).sort((p, q) => p[0] - q[0]);
      let u = a;
      for (const [p, q] of [...gaps, [b, b]]) {
        if (p - u > 0.01) { B(SC, u, p, yk, ceil, v - 0.06, v + 0.06); C(u, p, v - 0.06, v + 0.06, yk, ceil); }
        if (q > p) { B(SC, p, q, yk + 2.1, ceil, v - 0.06, v + 0.06); B('wood_painted', q - 0.02, q + 0.02, yk, yk + 2.05, v - 0.06, v + 0.5); }
        u = q;
      }
    }
    for (const rm of rooms) {
      if (rm.u0 > a + 0.01) { B(SC, rm.u0 - 0.06, rm.u0 + 0.06, yk, ceil, rm.v0, rm.v1); C(rm.u0 - 0.06, rm.u0 + 0.06, rm.v0, rm.v1, yk, ceil); }
    }
  };
  if (corr2) part(Y2, f2, [[corr2[0], 'v1'], [corr2[1], 'v0']]);
  else { /* the loft: open to its ends */ }
  if (corr3) part(Y3, f3, [[4.9, 'v1'], [corr3[0], 'v1'], ...(corr3[1] < dEnd ? [[corr3[1], 'v0']] : [])]);

  // ── the stair hall: the street door and the hall floor on the ground, the treads, the hand rails, the walls' plaster ──
  const sU0 = 0.42, sU1 = 1.72, m = SW;
  B(mat, 0, 0.4, y - 0.5, y + 4.5, 0, T); B(mat, 1.7, m, y - 0.5, y + 4.5, 0, T); B(mat, 0.4, 1.7, y + 3.3, y + 4.5, 0, T);
  C(0, 0.4, 0, T, y - 0.5, y + 4.5); C(1.7, m, 0, T, y - 0.5, y + 4.5); C(0.4, 1.7, 0, T, y + 3.3, y + 4.5);
  B('granite_grey', 0, 0.4, y - 0.5, y + 0.8, -0.15, T); B('granite_grey', 1.7, m, y - 0.5, y + 0.8, -0.15, T);
  B('wood_dark', 0.4, 0.46, y, y + 2.6, 0, T); B('wood_dark', 1.64, 1.7, y, y + 2.6, 0, T); B('wood_dark', 0.4, 1.7, y + 2.6, y + 2.7, 0, T);
  B('glass_outer', 0.46, 1.64, y + 2.7, y + 3.3, 0.12, 0.15);
  B('gold', 1.72, 1.78, y + 1.3, y + 1.45, -0.02, 0.0); B('limestone', 0, m, y + 3.7, y + 4.3, -0.4, 0); B('limestone', 0, m, y + 4.3, y + 4.5, -0.5, 0);
  B(SC, SW - 0.03, SW, y + 0.06, y + 4.25, T, dEnd);
  B('wood_dark', T, SW, y - 0.3, y + 0.06, T, dEnd); Fl(T, SW, 0.0, 0.9, y + 0.06);
  B(mat, 0, m, y - 0.5, y + 4.5, dEnd, ext); C(0, m, dEnd, ext, y - 0.5, y + 4.5);
  // treads: each a box from the floor under it to the line of the stair
  const dv = 0.24, nT = Math.ceil((vTop - V0) / dv);
  for (let i = 0; i < nT; i++) {
    const va = V0 + i * dv, vb = Math.min(vTop, va + dv), top = stairY((va + vb) / 2), base = va >= h2b - 0.01 ? y + 4.5 : y + 0.06;
    B('timber', sU0, sU1, base, Math.max(top, base + 0.02), va, vb);
    C(sU0, sU1, va, vb, base, Math.max(top, base + 0.02));       // (each tread an obstacle whose top is stepped onto: in the turned grid a ramp is cut into strips that jump by more than a step, and thin floors are dropped)
  }
  // the thresholds at the two doors, the hand rails on the walls
  Fl(1.7, a, door2[0], door2[1], Y2); Fl(1.7, a, door3[0], door3[1], Y3);
  for (const u of [0.36, SW - 0.04]) bag.add('wood_dark', rod(Pt(u, V0, y + 1.0), Pt(u, vTop, Y3 + 0.95), 0.025, 4));
  lights.push({ at: Pt(1.0, 2.5, y + 3.3), color: '#ffd29a', intensity: 1.3, distance: 6 });
  lights.push({ at: Pt(1.0, 8.5, Y2 + 2.6), color: '#ffd29a', intensity: 1.2, distance: 6 });

  // ── the hall's cornice, frieze and course, its end of the lot's roof (the shop's own cover the rest of the width) ──
  const top = y + h;
  B(mat, -0.5, SW - 0.5, top - 0.2, top + 0.8, -0.5, ext + 0.5); B('limestone', -0.2, SW - 0.2, top - 1.6, top - 0.2, -0.2, ext + 0.2);
  if (h > 20) B('limestone', -0.25, SW - 0.25, y + 12.2, y + 12.8, -0.25, ext + 0.25);
  B('tar_wood', 0, SW, top + 0.8, top + 0.84, 0, ext);

  // ── the furnishing ──
  const ctx = { B, C, bag, col, Pt, r, pk, ext, S };
  for (const [yk, rooms] of [[Y2, f2], [Y3, f3]]) for (const rm of rooms) furnish(ctx, rm, yk, o.use);
  // light: one over each floor's middle
  for (const yk of [Y2, Y3]) lights.push({ at: Pt((a + b) / 2, yk === Y2 ? 3.0 : 4.5, yk + 2.5), color: '#ffe0b0', intensity: 1.5, distance: 8 });
}

// ── the furniture ──────────────────────────────────────────────────────────────
const GARMENT = ['cloth_grey', 'cloth_indigo', 'cloth_brown', 'cloth_black', 'cloth_red', 'cloth_ochre'], QUILT = ['cloth_red', 'cloth_ochre', 'cloth_indigo', 'cloth_brown', 'cloth_grey'];
export function furnish(G, rm, y, use) {
  const { B, C, bag, Pt, pk } = G, du = rm.du, W = rm.u1 - rm.u0, D = rm.v1 - rm.v0;
  const item = {
    bed: (x0, x1, v0, v1, wl, head) => { const hv = head ? [v0, v0 + 0.04] : [v1 - 0.04, v1]; B('wood_dark', x0, x1, y, y + 0.32, v0, v1); B('paint_white', x0 + 0.04, x1 - 0.04, y + 0.32, y + 0.42, v0 + 0.04, v1 - 0.04); B(pk(QUILT), x0 + 0.03, x1 - 0.03, y + 0.42, y + 0.47, head ? v0 + 0.55 : v0 + 0.04, head ? v1 - 0.02 : v1 - 0.55); B('paint_white', x0 + 0.1, x1 - 0.1, y + 0.42, y + 0.53, head ? v0 + 0.08 : v1 - 0.45, head ? v0 + 0.45 : v1 - 0.08); B('iron', x0, x1, y, y + 0.95, hv[0], hv[1]); C(x0, x1, v0, v1, y, y + 0.55); },
    dresser: (x0, x1, v0, v1) => { B('wood_dark', x0, x1, y, y + 0.95, v0, v1); B('wood_painted', x0 - 0.02, x1 + 0.02, y + 0.95, y + 0.98, v0 - 0.02, v1 + 0.02); for (let k = 0; k < 3; k++) B('steel_chrome', (x0 + x1) / 2 - 0.05, (x0 + x1) / 2 + 0.05, y + 0.2 + k * 0.28, y + 0.24 + k * 0.28, v0 - 0.03, v0); C(x0, x1, v0, v1, y, y + 0.98); },
    wardrobe: (x0, x1, v0, v1) => { B('wood_dark', x0, x1, y, y + 1.9, v0, v1); B('wood_painted', x0 + 0.04, x1 - 0.04, y + 0.1, y + 1.75, v0 - 0.02, v0); C(x0, x1, v0, v1, y, y + 1.9); },
    trunk: (x0, x1, v0, v1) => { B('wood_painted', x0, x1, y, y + 0.5, v0, v1); B('iron', x0 - 0.01, x1 + 0.01, y + 0.15, y + 0.2, v0 + 0.1, v1 - 0.1); C(x0, x1, v0, v1, y, y + 0.5); },
    sofa: (x0, x1, v0, v1, wl) => { B('cloth_brown', x0, x1, y, y + 0.45, v0, v1); B('cloth_brown', wl ? x0 : x1 - 0.2, wl ? x0 + 0.2 : x1, y + 0.45, y + 0.9, v0, v1); B('cloth_brown', x0, x1, y + 0.45, y + 0.65, v0, v0 + 0.15); B('cloth_brown', x0, x1, y + 0.45, y + 0.65, v1 - 0.15, v1); C(x0, x1, v0, v1, y, y + 0.9); },
    table: (x0, x1, v0, v1, wl, _h, cloth = 'paint_white') => { const [px, , pz] = Pt((x0 + x1) / 2, (v0 + v1) / 2, y); bag.add('wood_dark', lathe([[0.2, 0], [0.05, 0.04], [0.05, 0.72], [0.5, 0.72], [0.5, 0.77], [0.001, 0.77]], 12, null, px, y, pz)); bag.add(cloth, lathe([[0.001, 0.775], [0.46, 0.775], [0.46, 0.79], [0.001, 0.79]], 12, null, px, y, pz)); G.col.circle(px, pz, 0.52, y, y + 0.8);
      for (const [cu, cv] of [[(x0 + x1) / 2 - 0.72, (v0 + v1) / 2], [(x0 + x1) / 2 + 0.72, (v0 + v1) / 2], [(x0 + x1) / 2, v1 - 0.12]]) { B('wood_dark', cu - 0.2, cu + 0.2, y + 0.42, y + 0.46, cv - 0.2, cv + 0.2); B('wood_dark', cu - 0.2, cu + 0.2, y + 0.46, y + 0.9, cv + 0.17, cv + 0.2); C(cu - 0.2, cu + 0.2, cv - 0.2, cv + 0.2, y, y + 0.46); } },
    range: (x0, x1, v0, v1) => { B('iron', x0, x1, y, y + 0.85, v0, v1); B('iron', x0 - 0.03, x1 + 0.03, y + 0.85, y + 0.9, v0 - 0.03, v1 + 0.03); const [px, , pz] = Pt((x0 + x1) / 2, (v0 + v1) / 2, y); bag.add('iron', rod([px, y + 0.9, pz], [px, y + G.S - 0.25, pz], 0.06, 6)); C(x0, x1, v0, v1, y, y + 0.9); },
    icebox: (x0, x1, v0, v1) => { B('wood_painted', x0, x1, y, y + 1.35, v0, v1); B('steel_chrome', x0 + 0.05, x0 + 0.12, y + 0.9, y + 1.0, v0 - 0.02, v0); C(x0, x1, v0, v1, y, y + 1.35); },
    sink: (x0, x1, v0, v1) => { B('wood_painted', x0, x1, y, y + 0.8, v0, v1); B('paint_white', x0 - 0.02, x1 + 0.02, y + 0.8, y + 0.9, v0 - 0.02, v1 + 0.02); B('steel_chrome', x0 + 0.02, x0 + 0.1, y + 0.9, y + 1.15, (v0 + v1) / 2 - 0.02, (v0 + v1) / 2 + 0.02); C(x0, x1, v0, v1, y, y + 0.9); },
    tub: (x0, x1, v0, v1) => { B('paint_white', x0, x1, y, y + 0.55, v0, v1); B('wood_dark', x0 + 0.03, x1 - 0.03, y + 0.55, y + 0.6, v0 + 0.03, v1 - 0.03); C(x0, x1, v0, v1, y, y + 0.6); },
    toilet: (x0, x1, v0, v1) => { const [px, , pz] = Pt((x0 + x1) / 2, v0 + 0.3, y); bag.add('paint_white', lathe([[0.17, 0], [0.2, 0.2], [0.22, 0.4], [0.001, 0.41]], 10, null, px, y, pz)); B('paint_white', (x0 + x1) / 2 - 0.2, (x0 + x1) / 2 + 0.2, y + 1.3, y + 1.8, v0 - 0.0, v0 + 0.2); C((x0 + x1) / 2 - 0.25, (x0 + x1) / 2 + 0.25, v0, v0 + 0.55, y, y + 0.45); },
    desk: (x0, x1, v0, v1) => { B('wood_dark', x0, x1, y + 0.72, y + 0.77, v0, v1); B('wood_dark', x0, x0 + 0.06, y, y + 0.72, v0, v1); B('wood_dark', x1 - 0.06, x1, y, y + 0.72, v0, v1); B('iron', (x0 + x1) / 2 - 0.15, (x0 + x1) / 2 + 0.15, y + 0.77, y + 0.9, v0 + 0.3, v0 + 0.62); B('steel_chrome', x1 - 0.2, x1 - 0.12, y + 0.77, y + 1.0, v1 - 0.2, v1 - 0.12); const cv = v1 + 0.25, cu = (x0 + x1) / 2; B('wood_dark', cu - 0.2, cu + 0.2, y + 0.42, y + 0.46, cv - 0.2, cv + 0.2); B('wood_dark', cu - 0.2, cu + 0.2, y + 0.46, y + 0.9, cv + 0.17, cv + 0.2); C(x0, x1, v0, v1, y, y + 0.8); C(cu - 0.2, cu + 0.2, cv - 0.2, cv + 0.2, y, y + 0.46); },
    file: (x0, x1, v0, v1) => { B('iron', x0, x1, y, y + 1.35, v0, v1); for (let k = 0; k < 3; k++) B('steel_chrome', (x0 + x1) / 2 - 0.07, (x0 + x1) / 2 + 0.07, y + 0.25 + k * 0.4, y + 0.3 + k * 0.4, v0 - 0.02, v0); C(x0, x1, v0, v1, y, y + 1.35); },
    bench: (x0, x1, v0, v1, wl) => { B('wood_dark', x0, x1, y + 0.42, y + 0.47, v0, v1); B('wood_dark', wl ? x0 : x1 - 0.06, wl ? x0 + 0.06 : x1, y + 0.47, y + 0.95, v0, v1); B('wood_dark', x0, x1, y, y + 0.42, v0 + 0.05, v0 + 0.1); B('wood_dark', x0, x1, y, y + 0.42, v1 - 0.1, v1 - 0.05); C(x0, x1, v0, v1, y, y + 0.5); },
    sewing: (x0, x1, v0, v1) => { B('wood_dark', x0, x1, y + 0.78, y + 0.83, v0, v1); for (const [p, q] of [[x0, v0], [x1 - 0.05, v0], [x0, v1 - 0.05], [x1 - 0.05, v1 - 0.05]]) B('iron', p, p + 0.05, y, y + 0.78, q, q + 0.05); B('iron', (x0 + x1) / 2 - 0.15, (x0 + x1) / 2 + 0.15, y + 0.83, y + 1.05, v0 + 0.15, v0 + 0.45); B(pk(GARMENT), x0 + 0.05, x0 + 0.3, y + 0.83, y + 0.9, v1 - 0.4, v1 - 0.1); const [px, , pz] = Pt((x0 + x1) / 2, v1 + 0.25, y); bag.add('wood_dark', lathe([[0.15, 0], [0.04, 0.03], [0.04, 0.42], [0.17, 0.46], [0.001, 0.46]], 8, null, px, y, pz)); C(x0, x1, v0, v1, y, y + 0.9); G.col.circle(px, pz, 0.2, y, y + 0.46); },
    cutting: (x0, x1, v0, v1) => { B('wood_ochre', x0, x1, y + 0.88, y + 0.94, v0, v1); for (const [p, q] of [[x0 + 0.05, v0 + 0.05], [x1 - 0.1, v0 + 0.05], [x0 + 0.05, v1 - 0.1], [x1 - 0.1, v1 - 0.1]]) B('wood_dark', p, p + 0.05, y, y + 0.88, q, q + 0.05); for (let k = 0; k < 3; k++) B(pk(GARMENT), x0 + 0.1, x1 - 0.1, y + 0.94, y + 0.94 + 0.03 + k * 0.02, v0 + 0.3 + k * 0.9, v0 + 1.0 + k * 0.9); C(x0, x1, v0, v1, y, y + 0.95); },
    rack: (x0, x1, v0, v1) => { const cu = (x0 + x1) / 2; B('iron', cu - 0.03, cu + 0.03, y, y + 1.75, v0, v0 + 0.06); B('iron', cu - 0.03, cu + 0.03, y, y + 1.75, v1 - 0.06, v1); B('iron', cu - 0.02, cu + 0.02, y + 1.72, y + 1.76, v0, v1); for (let v = v0 + 0.15; v < v1 - 0.15; v += 0.2) B(pk(GARMENT), cu - 0.2, cu + 0.2, y + 0.55, y + 1.7, v, v + 0.07); C(x0, x1, v0, v1, y, y + 1.0); },
    shelf: (x0, x1, v0, v1, wl) => { B('wood_dark', x0, x1, y, y + 1.9, v0, v1); for (let k = 0; k < 4; k++) for (let v = v0 + 0.05; v < v1 - 0.25; v += 0.3) B(pk(GARMENT.concat(['paint_white', 'cloth_ochre'])), wl ? x0 + 0.05 : x1 - 0.4, wl ? x0 + 0.4 : x1 - 0.05, y + 0.1 + k * 0.45, y + 0.4 + k * 0.45, v, v + 0.25); C(x0, x1, v0, v1, y, y + 1.9); },
    crate: (x0, x1, v0, v1) => { B('wood_ochre', x0, x1, y, y + 0.6, v0, v1); B('wood_ochre', x0 + 0.1, x1 - 0.1, y + 0.6, y + 1.1, v0 + 0.1, v1 - 0.1); C(x0, x1, v0, v1, y, y + 1.1); },
    washstand: (x0, x1, v0, v1) => { B('wood_dark', x0, x1, y, y + 0.85, v0, v1); B('paint_white', x0 + 0.08, x1 - 0.08, y + 0.85, y + 0.93, v0 + 0.08, v1 - 0.08); const [px, , pz] = Pt((x0 + x1) / 2, (v0 + v1) / 2, y); bag.add('paint_white', lathe([[0.001, 0], [0.07, 0.01], [0.08, 0.2], [0.001, 0.22]], 8, null, px, y + 0.93, pz)); C(x0, x1, v0, v1, y, y + 0.93); },
    chair: (x0, x1, v0, v1, wl) => { B('wood_dark', x0, x1, y + 0.42, y + 0.46, v0, v1); B('wood_dark', wl ? x0 : x1 - 0.04, wl ? x0 + 0.04 : x1, y + 0.46, y + 0.9, v0, v1); C(x0, x1, v0, v1, y, y + 0.46); },
  };
  // [item, width (u), depth (v)] stacked along the wall away from the door; zone widths are clipped to the lane
  const SEQ = {
    bedroom: [[['bed', 1.0, 2.0], ['dresser', 0.5, 1.0]], [['wardrobe', 0.6, 1.1], ['trunk', 0.5, 0.9], ['bed', 1.0, 2.0]]],
    parlour: [[['sofa', 0.9, 1.9], ['dresser', 0.45, 1.2]], [['table', 1.5, 1.5], ['shelf', 0.4, 1.0]]],
    kitchen: [[['range', 0.7, 0.8], ['icebox', 0.6, 0.6], ['sink', 0.6, 1.1]], [['table', 1.5, 1.5], ['shelf', 0.4, 1.0]]],
    bath: [[['tub', 0.75, 1.6]], [['toilet', 0.6, 0.7], ['sink', 0.5, 0.7]]],
    storage: [[['crate', 0.9, 0.9], ['crate', 0.9, 0.9], ['trunk', 0.6, 0.9]], [['crate', 0.9, 0.9], ['trunk', 0.6, 0.9]]],
    wait: [[['bench', 0.5, 1.9], ['file', 0.5, 0.6]], [['bench', 0.5, 1.9], ['shelf', 0.4, 1.0]]],
    office: [[['desk', 0.8, 1.5], ['file', 0.5, 0.6], ['file', 0.5, 0.6]], [['desk', 0.8, 1.5], ['shelf', 0.4, 1.0]]],
    files: [[['file', 0.5, 0.6], ['file', 0.5, 0.6], ['file', 0.5, 0.6]], [['shelf', 0.4, 1.2], ['file', 0.5, 0.6], ['desk', 0.8, 1.5]]],
    room: [[['bed', 1.0, 2.0], ['washstand', 0.5, 0.6]], [['trunk', 0.5, 0.9], ['chair', 0.4, 0.4]]],
  };
  const stack = (zu0, zu1, wl, vFrom, vTo, seq) => {
    let v = vFrom; const dir = vTo > vFrom ? 1 : -1;
    for (const [name, w, d] of seq) {
      const ww = Math.min(w, zu1 - zu0); if (ww < Math.min(w, 0.45)) continue;
      const va = dir > 0 ? v : v - d, vb = dir > 0 ? v + d : v;
      if (va < Math.min(vFrom, vTo) - 0.01 || vb > Math.max(vFrom, vTo) + 0.01) break;
      const x0 = wl ? zu0 : zu1 - ww, x1 = x0 + ww;
      item[name](x0, x1, va, vb, wl, dir > 0);
      v += dir * (d + 0.15);
    }
  };
  const open = { cutting: 'cutting', sewing: 'sewing', pressing: 'pressing', storage: null };
  if (rm.type === 'cutting') {
    stack(rm.u0 + 0.12, rm.u0 + 3.2, true, rm.v0 + 0.5, rm.v1 - 0.1, [['cutting', 1.4, 3.0]]); stack(rm.u1 - 3.2, rm.u1 - 0.12, false, rm.v0 + 0.5, rm.v1 - 0.1, [['cutting', 1.4, 3.0]]);
    for (let u = rm.u0 + 0.5; u < rm.u1 - 1.2; u += 2.2) if (Math.abs(u + 0.35 - (rm.u0 + rm.u1) / 2) > 1.0) item.rack(u, u + 0.7, rm.v1 - 1.1, rm.v1 - 0.1);
  } else if (rm.type === 'sewing') {
    for (let u = rm.u0 + 0.5; u + 1.1 < rm.u1 - 0.3; u += 1.5) for (const v of [rm.v0 + 0.2, rm.v0 + 2.2]) if (v + 0.7 < rm.v1 - 0.6) item.sewing(u, u + 1.1, v, v + 0.7);
  } else if (rm.type === 'pressing') {
    for (let u = rm.u0 + 0.5; u < rm.u1 - 1.2; u += 2.2) if (Math.abs(u + 0.4 - (rm.u0 + rm.u1) / 2) > 1.1) { item.rack(u, u + 0.8, rm.v0 + 0.3, rm.v0 + 2.6); item.rack(u, u + 0.8, rm.v0 + 3.1, rm.v0 + 5.4); }
    item.shelf(rm.u1 - 0.55, rm.u1 - 0.1, rm.v0 + 6.2, rm.v0 + 8.4, false);
    for (let u = rm.u0 + 0.3; u < rm.u1 - 3; u += 1.1) if (Math.abs(u + 0.45 - (rm.u0 + rm.u1) / 2) > 1.1) item.crate(u, u + 0.9, rm.v1 - 1.1, rm.v1 - 0.2);
  } else if (SEQ[rm.type]) {
    const [Ls, Rs] = SEQ[rm.type], lane = 0.55, fromFar = rm.door === 'v1', vf = fromFar ? rm.v0 + 0.1 : rm.v1 - 0.1, vt = fromFar ? rm.v1 - 0.1 : rm.v0 + 0.1;
    const uc = du ?? (rm.u0 + rm.u1) / 2;
    stack(rm.u0 + 0.1, uc - lane, true, vf, vt, Ls); stack(uc + lane, rm.u1 - 0.1, false, vf, vt, Rs);
  }
  void open; void use; void W; void D;
}

/** The first rooms' middles on each floor (local u, v) for the walk-check, and the lot's door and hall points. */
export function routeOf(el) {
  const o = el.up, F = face(el.rect, el.front), L = F.L, ext = F.ext, flip = o.end === 'hi', { Y2, Y3 } = levels(el.y ?? 0);
  const { f2, f3 } = layoutOf(o.use, L, ext), vTop = V0 + (Y3 - (el.y ?? 0) - 0.06) / SL;
  const pt = (u, v) => { const p = F.P(flip ? L - u : u, -v, 0); return [p[0], p[2]]; };
  const first = (rooms) => rooms.find((r) => r.win === 'front') ?? rooms[0], rm2 = first(f2), rm3 = first(f3);
  const c2 = rm2.du ?? (rm2.u0 + rm2.u1) / 2, c3 = rm3.du ?? (rm3.u0 + rm3.u1) / 2;
  const v2 = 6.47, door = (v) => pt(SW + 0.15, v);
  const pts = [pt(1.07, -2.5), pt(1.07, 0.2), pt(1.07, 1.3), pt(1.07, 4.2), pt(1.07, v2), door(v2), pt(c2, v2 - (o.use === 'loft' ? 0.0 : 0.0)), pt(c2, 2.5)];
  const up = [pt(c2, 6.47), pt(SW + 0.15, v2), pt(1.07, v2), pt(1.07, 9.0), pt(1.07, vTop - 0.1), pt(SW + 0.15, vTop - 0.05), pt(c3, vTop - 0.05)];
  if (o.use !== 'loft') up.push(pt(c3, 8.0), pt(c3, 4.9), pt(c3, 2.5)); else up.push(pt(c3, 5.0));
  return { y0: el.y ?? 0, pts, up, Y2, Y3 };
}
export { stripRect };
