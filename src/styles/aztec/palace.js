// The rooms of Moctezuma's palace (docs/settlements/tenochtitlan.md §11, §15): the ranges round the two courts were
// not solid. Cortés: "a hundred rooms twenty-two feet in length"... "so many apartments"; Díaz: the great houses had
// rooms for the lords, the councils, the courts of justice, the storehouses, the armoury, the house of birds, the kitchens.
// Here every range is hollow: two rows of rooms, the front row opening through doorways framed in red beams on the porticoes
// of the courts, the back row through the front one; each room furnished by its use — hall of council (mats, braziers, the
// lords seated), kitchen (hearth, comal, metate, the cooks), store (jars, bales, chests), armoury (racks of macuahuitl,
// shields, spears), treasury (chests of cloth, feathers), feather and stone workshops, sleeping rooms.

import { STYLES } from '../../core/build.js';
import { box, lathe, fromTriangles } from '../../core/geom.js';
import { carved } from '../maya/meso.js';
import { hearthKit, ollaKit, storeJarKit, bowlsKit, bedKit, soot } from '../maya/household.js';
import { inst, featherKit, lapidaryKit, stringKit, matLean } from './street.js';
import { mxPeople } from './life.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const W = 'plaster_white', R = 'stucco_red', FL = 'stucco';
const OUT = { n: [0, -1], s: [0, 1], w: [-1, 0], e: [1, 0] };
const B = (bag, mat, r, y0, y1) => bag.add(mat, box(r[0], y0, r[1], r[2], y1, r[3]));
/** The rect of a band along side f of r, from depth v0 to v1 inward and a0 to a1 along it. */
function band(r, f, v0, v1, a0, a1) {
  const [x0, z0, x1, z1] = r;
  if (f === 'n') return [a0, z0 + v0, a1, z0 + v1];
  if (f === 's') return [a0, z1 - v1, a1, z1 - v0];
  if (f === 'w') return [x0 + v0, a0, x0 + v1, a1];
  return [x1 - v1, a0, x1 - v0, a1];
}

const chest = () => carved('mx-chest2', (k) => { k.bx('wicker', -0.4, 0.4, 0, 0.42, -0.25, 0.25); k.bx('reed_mat', -0.42, 0.42, 0.42, 0.48, -0.27, 0.27); k.bx('cloth_red', -0.1, 0.1, 0.2, 0.3, 0.25, 0.27); });
const bale = (m) => carved('mx-bale:' + m, (k) => { k.bx(m, -0.35, 0.35, 0, 0.36, -0.25, 0.25); k.bx('rope_fibre', -0.36, 0.36, 0.14, 0.17, -0.26, 0.26); k.bx(m, -0.3, 0.3, 0.36, 0.6, -0.22, 0.22); });
const brazier = () => carved('mx-brazier2', (k) => { k.geo('pottery_dark', lathe([[0.2, 0], [0.12, 0.25], [0.12, 0.6], [0.34, 0.74], [0.36, 0.9], [0.28, 0.9], [0.001, 0.8]], 12)); k.geo('flame', lathe([[0.2, 0.85], [0.001, 0.93]], 8)); });
/** A rack of macuahuitl (the wooden sword set with obsidian blades), spears and round shields (chimalli) on a frame. */
const arms = () => carved('mx-arms', (k) => {
  for (const x of [-0.9, 0.9]) k.bx('timber', x - 0.05, x + 0.05, 0, 1.5, -0.05, 0.05);
  k.seg('timber', [-0.95, 1.4, 0], [0.95, 1.4, 0], 0.04, 0.04); k.seg('timber', [-0.95, 0.7, 0], [0.95, 0.7, 0], 0.04, 0.04);
  for (let i = 0; i < 6; i++) { const x = -0.7 + i * 0.28; k.seg('timber', [x, 1.35, 0.06], [x + 0.03, 0.5, 0.1], 0.05, 0.015); k.seg('obsidian', [x + 0.065, 1.2, 0.06], [x + 0.08, 0.6, 0.1], 0.01, 0.025); }
  for (const [x, m] of [[-0.45, 'stucco_red'], [0.0, 'maya_blue'], [0.45, 'paint_ochre']]) { k.disc('hide_tan', x, 1.05, 0.14, 0.27, 0.04, 14); k.disc(m, x, 1.05, 0.18, 0.2, 0.02, 14); k.disc('stucco_pale', x, 1.05, 0.2, 0.07, 0.02, 10); }
  for (const x of [-1.15, 1.15]) k.seg('timber', [x, 0, 0.1], [x + 0.05, 2.1, 0.15], 0.018, 0.018);
});
/** A low seat of woven reed (icpalli) for a lord. */
const seat = () => carved('mx-seat2', (k) => { k.bx('reed_mat', -0.8, 0.8, 0, 0.03, -0.7, 0.7); k.bx('reed_mat', -0.32, 0.32, 0.03, 0.34, -0.3, 0.3); k.bx('reed_mat', -0.34, 0.34, 0.34, 1.1, -0.34, -0.28); });
const metate = () => carved('mx-metate2', (k) => { for (const [x, z] of [[-0.14, -0.2], [0.14, -0.2], [0, 0.22]]) k.bx('basalt', x - 0.04, x + 0.04, 0, z < 0 ? 0.13 : 0.2, z - 0.04, z + 0.04); k.seg('basalt', [0, 0.15, -0.27], [0, 0.24, 0.27], 0.17, 0.035); });

/**
 * Pier midpoints (the doorway centres between the porticoes' piers) along side f of a court c: as in houses.js's portico().
 */
export function pierMids(c, f, pd, skip = null) {
  const alongX = f === 'n' || f === 's', a0 = alongX ? c[0] : c[1] + pd + 0.45, a1 = alongX ? c[2] : c[3] - pd - 0.45, L = a1 - a0, n = Math.max(2, Math.round(L / 3.3)), out = [];
  for (let i = 0; i < n; i++) { const u = a0 + 0.4 + (i + 0.5) * (L - 0.8) / n; if (skip && Math.abs(u - skip) < 2.4) continue; out.push(u); }
  return out;
}

/** A wall run along `axis` ('x': from a to b at z in [c, c+t]) with gaps [[g0, g1]] left for doors; y0 to y1. */
function wallRun(ctx, axis, c, t, a, b, y0, y1, gaps = [], mat = W) {
  const { bag, col } = ctx, pieces = []; let u = a;
  for (const [g0, g1] of [...gaps].sort((p, q) => p[0] - q[0])) { if (g0 > u) pieces.push([u, g0]); u = Math.max(u, g1); }
  if (b > u) pieces.push([u, b]);
  for (const [p, q] of pieces) { const r = axis === 'x' ? [p, c, q, c + t] : [c, p, c + t, q]; B(bag, mat, r, y0, y1); col.rect(r, y0, y1); }
}

/**
 * hollow(ctx, r, rows, o): a range of rooms in rect r, floor at o.Y, roof at o.y1. rows: [{ f (the side its doors open on), doors
 * ([u] along that side, or null to space them), avoid ([[u0, u1]] kept free of doors), roles }]; one row = its rooms and a
 * back row behind them (joined by inner doors) when deep, two rows = back to back (each with its own doors).
 */
export function hollow(ctx, r, rows, o) {
  const { bag, col } = ctx, { Y, y1 } = o, rand = rng(o.seed || 1), tw = 0.6, hw = y1 - Y - 0.5, dh = 2.6, dw = 1.5, red = 'timber_red';
  const [x0, z0, x1, z1] = r, W0 = x1 - x0, D0 = z1 - z0;
  // the roof slab and the floor
  B(bag, W, r, y1 - 0.5, y1); col.floor(r, y1); B(bag, FL, [x0 + 0.02, z0 + 0.02, x1 - 0.02, z1 - 0.02], Y, Y + 0.035);
  // the outer walls
  const front0 = rows.map((q) => q.f);
  const two = rows.length === 2, deep = (rows[0].f === 'e' || rows[0].f === 'w' ? W0 : D0), rowD = two || deep < 9.5 ? (two ? deep / 2 : deep) : deep / 2, single = !two && deep < 9.5;
  const faceDoors = {};
  const cellsOf = (q) => {
    const alongX = q.f === 'n' || q.f === 's', A0 = (alongX ? x0 : z0) + tw, A1 = (alongX ? x1 : z1) - tw;
    let ds = (q.doors ?? []).filter((u) => u > A0 + 1.3 && u < A1 - 1.3 && !(q.avoid ?? []).some(([a, b]) => u > a - dw && u < b + dw));
    if (!q.doors) { const n = Math.max(1, Math.round((A1 - A0) / 6.2)); ds = Array.from({ length: n }, (_, i) => A0 + (i + 0.5) * (A1 - A0) / n).filter((u) => !(q.avoid ?? []).some(([a, b]) => u > a - dw && u < b + dw)); }
    // thin the doors so that the rooms are 4.5 m or more across
    const keep = []; for (const u of ds) if (!keep.length || u - keep[keep.length - 1] >= 4.6) keep.push(u);
    const cuts = [A0]; for (let i = 0; i + 1 < keep.length; i++) cuts.push((keep[i] + keep[i + 1]) / 2); cuts.push(A1);
    return { keep, cuts, A0, A1, alongX };
  };
  const rowInfo = rows.map(cellsOf);
  // perimeter: each face's wall, with its doors where a row opens on it
  for (const f of ['n', 's', 'w', 'e']) {
    const alongX = f === 'n' || f === 's', q = band(r, f, 0, tw, alongX ? x0 : z0 + tw, alongX ? x1 : z1 - tw);
    const ri = rows.findIndex((w) => w.f === f), gaps = ri >= 0 ? rowInfo[ri].keep.map((u) => [u - dw / 2, u + dw / 2]) : [];
    const [a, b] = alongX ? [q[0], q[2]] : [q[1], q[3]], c = alongX ? q[1] : q[0];
    wallRun(ctx, alongX ? 'x' : 'z', c, tw, a, b, Y, Y + dh, gaps);
    wallRun(ctx, alongX ? 'x' : 'z', c, tw, a, b, Y + dh, Y + hw);
    // the doorways framed in red beams, a mat laid in each
    for (const [g0, g1] of gaps) {
      const jam = (u0, u1) => B(bag, red, band(r, f, -0.1, 0.12, u0, u1), Y, Y + dh + 0.25);
      jam(g0 - 0.22, g0); jam(g1, g1 + 0.22); B(bag, red, band(r, f, -0.1, 0.12, g0 - 0.22, g1 + 0.22), Y + dh, Y + dh + 0.25);
      B(bag, 'reed_mat', band(r, f, -0.9, 1.2, g0 + 0.05, g1 - 0.05), Y + 0.02, Y + 0.04);
    }
  }
  // the rows: partitions between the rooms, the back row, the furnishing
  const roomsOut = [];
  rows.forEach((q, ri) => {
    const info = rowInfo[ri], f = q.f;
    const d0 = tw, d1 = single ? deep - tw : (two ? deep / 2 - 0.25 : rowD - 0.25);
    for (let i = 1; i + 1 < info.cuts.length; i++) {
      const u = info.cuts[i], pr = band(r, f, tw - 0.01, single ? deep - tw + 0.01 : (two ? deep / 2 + 0.01 : deep - tw + 0.01), u - 0.2, u + 0.2);
      B(bag, W, pr, Y, Y + hw); col.rect(pr, Y, Y + hw);
    }
    // the back row (a deep range with one row of doors): a wall between, its doors, the back rooms
    let back = null;
    if (!single && !two) {
      const wy = band(r, f, deep / 2 - 0.25, deep / 2 + 0.25, info.A0, info.A1);
      const gaps = info.keep.map((u) => [u - dw / 2, u + dw / 2]), alongX = info.alongX;
      const [a, b] = alongX ? [wy[0], wy[2]] : [wy[1], wy[3]], c = alongX ? wy[1] : wy[0];
      wallRun(ctx, alongX ? 'x' : 'z', c, 0.5, a, b, Y, Y + dh, gaps); wallRun(ctx, alongX ? 'x' : 'z', c, 0.5, a, b, Y + dh, Y + hw);
      for (const [g0, g1] of gaps) { B(bag, red, band(r, f, deep / 2 - 0.3, deep / 2 + 0.3, g0 - 0.18, g0), Y, Y + dh + 0.2); B(bag, red, band(r, f, deep / 2 - 0.3, deep / 2 + 0.3, g1, g1 + 0.18), Y, Y + dh + 0.2); B(bag, red, band(r, f, deep / 2 - 0.3, deep / 2 + 0.3, g0 - 0.18, g1 + 0.18), Y + dh, Y + dh + 0.2); }
      for (let i = 1; i + 1 < info.cuts.length; i++) { const u = info.cuts[i], pr = band(r, f, deep / 2 + 0.24, deep - tw + 0.01, u - 0.2, u + 0.2); B(bag, W, pr, Y, Y + hw); col.rect(pr, Y, Y + hw); }
      back = { v0: deep / 2 + 0.25, v1: deep - tw };
    }
    // beams under the roof and the furnishing of each room
    for (let i = 0; i + 1 < info.cuts.length; i++) {
      const a = info.cuts[i] + (i ? 0.2 : 0), b = info.cuts[i + 1] - (i + 2 < info.cuts.length ? 0.2 : 0);
      const roles = q.roles ?? ['hall'], role = roles[(i + ri) % roles.length];
      const rooms = [{ v0: tw, v1: single ? deep - tw : two ? deep / 2 - 0.25 : deep / 2 - 0.25, a, b, role, door: true }];
      if (back) rooms.push({ v0: back.v0, v1: back.v1, a, b, role: q.back ? q.back[(i + ri) % q.back.length] : 'store', door: false });
      for (const rm of rooms) {
        const rr = band(r, f, rm.v0, rm.v1, a, b), alongX = info.alongX, n = Math.max(3, Math.round((b - a) / 0.65));
        for (let k = 0; k < n; k++) { const u = a + (k + 0.5) * (b - a) / n, vr = band(r, f, rm.v0, rm.v1, u - 0.08, u + 0.08); B(bag, 'viga', vr, Y + hw - 0.2, Y + hw); }
        void rr; void alongX;
        furnish(ctx, { r, f, ...rm, Y, seed: Math.floor(rand() * 1e6) }, rand);
        roomsOut.push(rm.role);
      }
    }
  });
  void front0; void faceDoors;
  return roomsOut;
}

/** The things in a room: a frame in the face's own terms (u along, v inward from the face's inner side). */
function furnish(ctx, c, rand) {
  const { bag, col } = ctx, { r, f, v0, v1, a, b, role } = c, Y = c.Y + 0.035, [dx, dz] = OUT[f], alongX = f === 'n' || f === 's';
  const at = (u, v) => { const q = band(r, f, v, v, u, u); return [alongX ? q[0] : q[0], alongX ? q[1] : q[1]]; };
  const yawIn = Math.atan2(-dx, -dz), yawOut = Math.atan2(dx, dz), D = v1 - v0, Lw = b - a, m = (a + b) / 2, rr = rng(c.seed);
  const L = STYLES.life.elements;
  const P = (u, v) => { const p = at(u, v); return [p[0], p[1]]; };
  const people = [];
  const nobles = (who, u, v, rot, extra) => { const p = P(u, v); people.push([p[0], p[1], Y, rot, who, c.seed + people.length * 3 + 1, extra]); };
  const jars = (v, kit, step = 0.62) => { for (let u = a + 0.5; u < b - 0.4; u += step) { const p = P(u, v); inst(bag, kit, p[0], Y, p[1], 0, 1, 70); col.circle(p[0], p[1], 0.25, Y, Y + 0.7); } };
  const back = v1 - 0.35;
  if (role === 'hall') {
    const p0 = P(m, v0 + D * 0.5), p1 = P(m, v0 + D * 0.5);
    const rect = band(r, f, v0 + 0.4, v1 - 0.4, a + 0.4, b - 0.4);
    B(bag, 'reed_mat', rect, Y + 0.02, Y + 0.04);
    for (const u of [a + 0.7, b - 0.7]) { const p = P(u, back); inst(bag, brazier(), p[0], Y, p[1], 0, 1, 70); col.circle(p[0], p[1], 0.35, Y, Y + 0.9); }
    for (const u of [m - 0.9, m + 0.9]) { const p = P(u, back - 0.6); inst(bag, seat(), p[0], Y + 0.04, p[1], yawIn, 1, 70); }
    nobles('noble', m - 0.9, back - 0.55, yawIn, { pose: 'cross' }); nobles('noble', m + 0.9, back - 0.55, yawIn, { pose: 'cross' });
    if (rr() < 0.5) nobles('guard', a + 0.6, v0 + 0.5, yawIn);
    void p0; void p1;
  } else if (role === 'kitchen') {
    const h = P(a + 1.0, back), ys = Y + 3.4;
    inst(bag, hearthKit('andesite'), h[0], Y, h[1], yawIn, 1, 80); col.circle(h[0], h[1], 0.5, Y, Y + 0.3);
    soot(bag, [h[0], Y + 4.3, h[1]], [0, -1, 0], 2.0, 1.6, c.seed); void ys;
    for (const [u, v] of [[a + 2.0, back], [a + 1.0, back - 1.1], [b - 1.0, back]]) { const p = P(u, v); inst(bag, ollaKit(), p[0], Y, p[1], 0, 1.1, 70); col.circle(p[0], p[1], 0.3, Y, Y + 0.6); }
    const mp = P(b - 1.4, back - 0.7); inst(bag, metate(), mp[0], Y, mp[1], yawIn, 1.2, 70);
    nobles('cook', b - 1.4, back - 1.6, yawOut, {}); if (Lw > 5) nobles('cook', a + 2.4, back - 1.2, yawIn, {});
    const w = P(m, v0 + 0.8); L.firewood({ at: w, y: Y, rot: alongX ? 0 : Math.PI / 2, seed: c.seed, len: 1.2, h: 0.7 }, ctx);
  } else if (role === 'store') {
    jars(back, storeJarKit(), 0.7);
    for (let u = a + 0.6; u < b - 0.5; u += 1.0) { const p = P(u, back - 1.2); inst(bag, rr() < 0.5 ? bale(rr() < 0.5 ? 'cloth_white' : 'cloth_ochre') : chest(), p[0], Y, p[1], yawIn + (rr() - 0.5) * 0.4, 1, 70); col.circle(p[0], p[1], 0.35, Y, Y + 0.6); }
    const p = P(b - 0.8, v0 + 1.0); L.sacks({ at: p, y: Y, n: 3, seed: c.seed }, ctx);
    if (rr() < 0.4) nobles('man', a + 0.8, v0 + 1.2, yawIn);
  } else if (role === 'sleep') {
    for (const u of Lw > 6 ? [a + 1.2, m, b - 1.2] : [a + 1.2, b - 1.2]) { const p = P(u, back - 0.5); inst(bag, bedKit(rr() < 0.6 ? 'cloth_white' : 'cloth_ochre', rr() < 0.5 ? 'cloth_red' : 'cloth_indigo'), p[0], Y, p[1], yawIn, 1, 70); }
    const p = P(a + 0.6, v0 + 1.2); inst(bag, chest(), p[0], Y, p[1], yawIn, 1, 70);
    const q = P(b - 0.6, v0 + 1.0); inst(bag, bowlsKit('paint_ochre'), q[0], Y, q[1], 0, 1, 60);
  } else if (role === 'armoury') {
    for (let u = a + 1.4; u < b - 0.9; u += 2.2) { const p = P(u, back); inst(bag, arms(), p[0], Y, p[1], yawIn, 1, 70); col.circle(p[0], p[1], 0.6, Y, Y + 1.6); }
    nobles('guard', m, v0 + 0.8, yawIn);
  } else if (role === 'treasury') {
    for (let u = a + 0.6; u < b - 0.5; u += 0.9) for (const v of [back, back - 0.8]) { const p = P(u, v); inst(bag, rr() < 0.55 ? chest() : bale(rr() < 0.5 ? 'cloth_red' : 'cloth_blue'), p[0], Y, p[1], yawIn, 1, 70); col.circle(p[0], p[1], 0.35, Y, Y + 0.6); }
    nobles('guard', a + 0.7, v0 + 0.6, yawIn);
  } else if (role === 'workshop') {
    const p = P(m, back - 0.7); inst(bag, rr() < 0.5 ? featherKit() : lapidaryKit(), p[0], Y, p[1], yawIn, 1, 70); col.circle(p[0], p[1], 0.6, Y, Y + 0.9);
    nobles('featherer', m + 0.1, back - 1.6, yawOut, {});
    const q = P(a + 0.5, v0 + 0.9); inst(bag, matLean(), q[0], Y, q[1], yawOut, 1, 60);
  } else if (role === 'aviary') {
    // the house of birds (Cortés, Díaz): cages of reed with the birds of the country, a keeper
    for (let u = a + 0.9; u < b - 0.6; u += 1.1) { const p = P(u, back - 0.2); inst(bag, cage(), p[0], Y, p[1], yawIn, 1, 70); col.circle(p[0], p[1], 0.4, Y, Y + 0.9); }
    nobles('man', m, v0 + 1.0, yawIn);
  }
  if (people.length) mxPeople({ people }, ctx);
}
const cage = () => carved('mx-cage', (k) => {
  k.bx('timber', -0.4, 0.4, 0, 0.5, -0.3, 0.3); k.bx('timber', -0.42, 0.42, 0.5, 0.56, -0.32, 0.32);
  for (let i = 0; i < 9; i++) { const x = -0.38 + i * 0.095; for (const z of [-0.29, 0.29]) k.bx('reed_mat', x - 0.01, x + 0.01, 0.56, 1.1, z - 0.01, z + 0.01); }
  k.bx('timber', -0.42, 0.42, 1.1, 1.15, -0.32, 0.32);
  for (const [x, m] of [[-0.2, 'maya_blue'], [0.05, 'stucco_red'], [0.25, 'clay_green']]) k.geo(m, lathe([[0.001, 0], [0.06, 0.04], [0.04, 0.14], [0.001, 0.16]], 7).translate(x, 0.56, 0)); // the birds
});
void stringKit;

// ---- the lesser shrines: hollow chambers with the god on his dais -------------------------------------------------
const idol = (god) => carved('mx-idol:' + god, (k) => {
  k.bx('stucco_pale', -0.9, 0.9, 0, 0.7, -0.7, 0.7);
  if (god === 'sun') {
    k.bx('paint_ochre', -0.35, 0.35, 0.7, 1.7, -0.2, 0.25); k.geo('inlay_yellow', lathe([[0.001, 0], [0.6, 0], [0.62, 0.1], [0.001, 0.1]], 16).rotateX(Math.PI / 2).translate(0, 2.1, 0.3));
    for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8; k.seg('stucco_saffron', [Math.cos(a) * 0.62, 2.1 + Math.sin(a) * 0.62, 0.3], [Math.cos(a) * 0.95, 2.1 + Math.sin(a) * 0.95, 0.3], 0.05, 0.04, 0.02, 0.03); }
  } else if (god === 'tezcatlipoca') {
    k.bx('paint_minoan_black', -0.4, 0.4, 0.7, 1.8, -0.25, 0.3); k.bx('paint_minoan_black', -0.28, 0.28, 1.8, 2.3, -0.2, 0.25);
    k.geo('obsidian', lathe([[0.001, 0], [0.22, 0], [0.22, 0.05], [0.001, 0.05]], 12).rotateX(Math.PI / 2).translate(0, 1.2, 0.31));
    for (const s of [-1, 1]) k.bx('stucco_saffron', s * 0.28 - 0.04, s * 0.28 + 0.04, 1.85, 2.25, 0.25, 0.3);
  } else { k.bx('basalt', -0.4, 0.4, 0.7, 1.6, -0.3, 0.3); k.bx('basalt', -0.3, 0.3, 1.6, 2.1, -0.25, 0.25); k.bx('maya_blue', -0.3, 0.3, 1.9, 2.0, 0.25, 0.28); }
});
/**
 * shrineChamber(ctx, rect, y, h, door, god, wall): the walls of a shrine round a chamber (rect = the outer walls), a doorway 1.6 m wide
 * on side `door`, the floor, the god on a dais at the back with braziers either side, a mat and offerings, a priest; roof slab at y + h.
 */
export function shrineChamber(ctx, rect, y, h, door, god, wall = W) {
  const { bag, col } = ctx, T = 0.9, dh = 2.7, dw = 1.6, [x0, z0, x1, z1] = rect, alongX = door === 'n' || door === 's';
  const [dx, dz] = OUT[door], yawOut = Math.atan2(dx, dz);
  const q = band(rect, door, 0, T, alongX ? x0 : z0, alongX ? x1 : z1), m = alongX ? (x0 + x1) / 2 : (z0 + z1) / 2;
  for (const f of ['n', 's', 'w', 'e']) {
    const fa = f === 'n' || f === 's', w = band(rect, f, 0, T, fa ? x0 : z0 + T, fa ? x1 : z1 - T), [a, b] = fa ? [w[0], w[2]] : [w[1], w[3]], c = fa ? w[1] : w[0];
    if (f === door) { wallRun(ctx, fa ? 'x' : 'z', c, T, a, b, y, y + dh, [[m - dw / 2, m + dw / 2]], wall); wallRun(ctx, fa ? 'x' : 'z', c, T, a, b, y + dh, y + h, [], wall); } else wallRun(ctx, fa ? 'x' : 'z', c, T, a, b, y, y + h, [], wall);
  }
  void q;
  B(bag, 'stucco_pale', band(rect, door, T, 99, 0, 0).length ? [x0 + T, z0 + T, x1 - T, z1 - T] : rect, y, y + 0.04);
  B(bag, wall, [x0, z0, x1, z1], y + h, y + h + 0.01);
  const inner = [x0 + T, z0 + T, x1 - T, z1 - T], dep = alongX ? inner[3] - inner[1] : inner[2] - inner[0], P = (u, v) => { const p = band(inner, door, v, v, u, u); return [p[0], p[1]]; };
  const back = dep - 0.9, yawIn = yawOut + Math.PI;
  // vigas, the soot over the braziers
  for (let u = (alongX ? inner[0] : inner[1]) + 0.5; u < (alongX ? inner[2] : inner[3]) - 0.3; u += 0.8) B(bag, 'viga', band(inner, door, 0, dep, u - 0.1, u + 0.1), y + h - 0.25, y + h);
  const pe = P(m, back - 0.5); B(bag, wall === W ? 'stucco_red' : 'stucco_pale', [pe[0] - 1.6, pe[1] - 1.6, pe[0] + 1.6, pe[1] + 1.6], y + 0.04, y + 0.5);
  col.rect([pe[0] - 1.6, pe[1] - 1.6, pe[0] + 1.6, pe[1] + 1.6], y, y + 0.5);
  inst(bag, idol(god), pe[0], y + 0.5, pe[1], yawIn, 1, 120); col.circle(pe[0], pe[1], 0.9, y, y + 3);
  for (const s of [-1, 1]) { const p = P(m + s * 1.8, back - 2.2); inst(bag, brazier(), p[0], y, p[1], 0, 1, 90); col.circle(p[0], p[1], 0.35, y, y + 0.9); }
  const mp = band(inner, door, 0.8, back - 3.4, m - 1.2, m + 1.2); B(bag, 'reed_mat', mp, y + 0.04, y + 0.06);
  const p = P(m + 1.0, back - 3.0);
  mxPeople({ people: [[p[0], p[1], y, yawIn, 'priest', Math.floor(x0 * 3 + z0)]] }, ctx);
}
/** mx_pyramid: a stepped pyramid of the Maya kit with a hollow shrine on its top { c, ..., shrine: { w, d, h, door, god } }. */
export function mxPyramid(el, ctx) {
  STYLES.maya.elements.m_pyramid({ ...el, temple: undefined }, ctx);
  const s = el.shrine, [cx, cz] = el.c;
  shrineChamber(ctx, [cx - s.w / 2, cz - s.d / 2, cx + s.w / 2, cz + s.d / 2], el.h, s.h, s.door, s.god, s.god === 'sun' ? R : W);
  const { bag } = ctx;
  B(bag, W, [cx - s.w / 2 - 0.3, cz - s.d / 2 - 0.3, cx + s.w / 2 + 0.3, cz + s.d / 2 + 0.3], el.h + s.h, el.h + s.h + 0.4);
  for (let t = -s.w / 2 + 0.6; t < s.w / 2; t += 1.4) for (const zz of [cz - s.d / 2, cz + s.d / 2 - 0.5]) B(bag, W, [cx + t - 0.3, zz, cx + t + 0.3, zz + 0.5], el.h + s.h + 0.4, el.h + s.h + 1.3);
}

/**
 * court_house { rect, h, ring, seed }: a house of a lord or an official round a patio (Cortés: the great lords' houses had "very
 * large and very good rooms" round gardens and courts): four ranges of rooms, each opening on the patio under the red band; a gateway
 * through the south range with a timber lintel; in the patio a pool of water, flowers, a tree's worth of maguey, servants, a lord.
 */
export function courtHouse(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, d = el.ring ?? 7, h = el.h ?? 3.8, rand = rng(el.seed || 1), xc = (x0 + x1) / 2;
  const o = { Y: 0, y1: h, seed: el.seed || 1 }, ww = 3.4;
  const roles = ['hall', 'store', 'sleep', 'kitchen'], pat = [x0 + d, z0 + d, x1 - d, z1 - d];
  hollow(ctx, [x0, z0, x1, z0 + d], [{ f: 's', doors: null, roles: ['hall', 'sleep', 'hall'], back: roles }], o);
  hollow(ctx, [x0, z0 + d, x0 + d, z1 - d], [{ f: 'e', doors: null, roles: ['store', 'kitchen', 'sleep'], back: roles }], o);
  hollow(ctx, [x1 - d, z0 + d, x1, z1 - d], [{ f: 'w', doors: null, roles: ['sleep', 'workshop', 'store'], back: roles }], o);
  hollow(ctx, [x0, z1 - d, xc - ww / 2, z1], [{ f: 'n', doors: null, roles: ['store', 'armoury'], back: roles }], o);
  hollow(ctx, [xc + ww / 2, z1 - d, x1, z1], [{ f: 'n', doors: null, roles: ['kitchen', 'store'], back: roles }], o);
  // the gateway through the south range
  B(bag, W, [xc - ww / 2, z1 - d, xc + ww / 2, z1], h - 0.5, h); col.floor([xc - ww / 2, z1 - d, xc + ww / 2, z1], h);
  B(bag, 'timber_red', [xc - ww / 2 - 0.2, z1 - 0.3, xc + ww / 2 + 0.2, z1 + 0.05], 2.7, 3.1);
  B(bag, 'stucco', [xc - ww / 2, z1 - d, xc + ww / 2, z1], 0, 0.03);
  // the red band along the roof's edge and the parapet
  for (const q of [[x0, z0, x1, z0 + 0.3], [x0, z1 - 0.3, x1, z1], [x0, z0 + 0.3, x0 + 0.3, z1 - 0.3], [x1 - 0.3, z0 + 0.3, x1, z1 - 0.3]]) B(bag, W, q, h, h + 0.5);
  if (el.band || rand() < 0.5) for (const q of [[x0 - 0.03, z0 - 0.03, x1 + 0.03, z0], [x0 - 0.03, z1, x1 + 0.03, z1 + 0.03], [x0 - 0.03, z0, x0, z1], [x1, z0, x1 + 0.03, z1]]) B(bag, R, q, h - 0.7, h - 0.3);
  // the patio: paved, a pool at its middle, flowers, maguey, the people
  B(bag, 'stucco', pat, 0, 0.05);
  const cx = (pat[0] + pat[2]) / 2, cz = (pat[1] + pat[3]) / 2;
  for (const q of [[cx - 3, cz - 2, cx + 3, cz - 1.6], [cx - 3, cz + 1.6, cx + 3, cz + 2], [cx - 3, cz - 1.6, cx - 2.6, cz + 1.6], [cx + 2.6, cz - 1.6, cx + 3, cz + 1.6]]) { B(bag, 'andesite', q, 0, 0.35); col.rect(q, 0, 0.35); }
  { const a = cx - 2.6, b = cz - 1.6, c = cx + 2.6, e = cz + 1.6, wy = 0.28; bag.add('water', fromTriangles([a, wy, b, a, wy, e, c, wy, e, a, wy, b, c, wy, e, c, wy, b])); }
  for (const [x, z] of [[pat[0] + 1.2, pat[1] + 1.2], [pat[2] - 1.2, pat[1] + 1.2]]) { B(bag, 'mud_plaster', [x - 0.9, z - 0.9, x + 0.9, z + 0.9], 0, 0.3); for (let i = 0; i < 5; i++) bag.add(i % 2 ? 'stucco_saffron' : 'stucco_rose', lathe([[0.1, 0], [0.12, 0.05], [0.001, 0.12]], 6, null, x - 0.6 + i * 0.3, 0.55, z)); }
  mxPeople({ people: [[cx - 4.5, cz + 0.5, 0, 1.2, 'noble', el.seed], [cx + 4.2, cz + 1, 0, 4.2, 'woman', el.seed + 1], [cx, cz + 3.4, 0, 3, 'sweeper', el.seed + 2], [xc, z1 - 1.2, 0, 0, 'guard', el.seed + 3], [cx + 3.4, cz - 3.4, 0, 2.0, 'child', el.seed + 4]] }, ctx);
}
