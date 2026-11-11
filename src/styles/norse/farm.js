// Norse Norway — the inside and the dressing of the farms (docs/settlements/norse-borgund.md §1, "The tun
// deepened"): the barn's threshing floor, hay mow and byre, the loft's upper room, the smithy's forge, the
// open wood shed, the churchyard's graves and stone path, the doorsteps, chopping blocks, troughs and
// racks of the yards, the net rack at the landing. Helpers come from index.js (no import cycle).
import { box, lathe, rod, fromTriangles } from '../../core/geom.js';

const W = 'tar_wood', LOG = 'log_pine';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** The (a, b) frame of a log house's inside: a along the ridge, b across it, so one plan serves both orientations. */
function frame(bag, col, o) {
  const [x0, z0, x1, z1] = o.rect, { fl, top, ridge, alongX, wt } = o;
  const ix0 = x0 + wt, iz0 = z0 + wt, ix1 = x1 - wt, iz1 = z1 - wt, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  const A0 = alongX ? ix0 : iz0, A1 = alongX ? ix1 : iz1, B0 = alongX ? iz0 : ix0, B1 = alongX ? iz1 : ix1, am = alongX ? cx : cz, bm = alongX ? cz : cx;
  const P = (a, v, b) => (alongX ? [a, v, b] : [b, v, a]);
  const BX = (m, a0, a1, v0, v1, b0, b1) => { const cl = (v, lo, hi) => Math.max(lo, Math.min(hi, v)); a0 = cl(a0, A0 + 0.012, A1 - 0.012); a1 = cl(a1, A0 + 0.012, A1 - 0.012); b0 = cl(b0, B0 + 0.012, B1 - 0.012); b1 = cl(b1, B0 + 0.012, B1 - 0.012); v1 = Math.min(v1, top - 0.012); const p = P(Math.min(a0, a1), Math.min(v0, v1), Math.min(b0, b1)), q = P(Math.max(a0, a1), Math.max(v0, v1), Math.max(b0, b1)); bag.add(m, box(Math.min(p[0], q[0]), p[1], Math.min(p[2], q[2]), Math.max(p[0], q[0]), q[1], Math.max(p[2], q[2]))); };
  const R2 = (a0, a1, b0, b1) => { const p = P(Math.min(a0, a1), 0, Math.min(b0, b1)), q = P(Math.max(a0, a1), 0, Math.max(b0, b1)); return [Math.min(p[0], q[0]), Math.min(p[2], q[2]), Math.max(p[0], q[0]), Math.max(p[2], q[2])]; };
  const CR = (a0, a1, b0, b1, v0, v1) => col.rect(R2(a0, a1, b0, b1), v0, v1);
  const FL = (a0, a1, b0, b1, y) => col.floor(R2(a0, a1, b0, b1), y);
  const lat = (m, prof, seg, a, v, b) => { const p = P(a, v, b); bag.add(m, lathe(prof, seg, null, p[0], p[1], p[2])); };
  const RD = (m, a0, v0, b0, a1, v1, b1, r, seg = 5) => bag.add(m, rod(P(a0, v0, b0), P(a1, v1, b1), r, seg));
  const doorB = o.door && ((alongX && o.door.face[0] === 'z') || (!alongX && o.door.face[0] === 'x')) ? (o.door.face.endsWith('0') ? B0 : B1) : null;
  return { A0, A1, B0, B1, am, bm, P, BX, CR, FL, lat, RD, doorB, fl, top, ridge, wt, alongX };
}
/** A b coordinate d inside from the door's wall. */
const nearB = (f, d) => (f.doorB === f.B0 ? f.B0 + d : f.B1 - d);

export function makeFarm({ hexa, logRod }) {
  const put = (bag, mat, g, el, dy = 0) => { const c = Math.cos(el.rot ?? 0), s = Math.sin(el.rot ?? 0), p = g.attributes.position, n = g.attributes.normal;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setXYZ(i, x * c + z * s + el.at[0], p.getY(i) + dy, -x * s + z * c + el.at[1]);
      if (n) { const nx = n.getX(i), nz = n.getZ(i); n.setXYZ(i, nx * c + nz * s, n.getY(i), -nx * s + nz * c); } }
    p.needsUpdate = true; bag.add(mat, g); };

  /** A tool hung on the wall b by its pegs: at (a, v), standing out from the wall by s (±1 into the room). */
  function tool(f, kind, a, v, b, s) {
    const { RD, BX } = f;
    if (kind === 'scythe') { RD(W, a, v - 0.9, b + s * 0.07, a, v + 0.95, b + s * 0.07, 0.016); BX('iron', a - 0.45, a + 0.02, v + 0.9, v + 0.94, b + s * 0.05, b + s * 0.09); BX(W, a - 0.06, a + 0.06, v + 0.2, v + 0.26, b + s * 0.02, b + s * 0.12); }
    else if (kind === 'rake') { RD(W, a, v - 0.9, b + s * 0.07, a, v + 0.8, b + s * 0.07, 0.016); BX(W, a - 0.22, a + 0.22, v + 0.78, v + 0.82, b + s * 0.05, b + s * 0.09); for (let k = -3; k <= 3; k++) BX(W, a + k * 0.07 - 0.008, a + k * 0.07 + 0.008, v + 0.62, v + 0.78, b + s * 0.06, b + s * 0.08); }
    else if (kind === 'flail') { RD(W, a, v - 0.8, b + s * 0.07, a, v + 0.8, b + s * 0.07, 0.017); RD(W, a, v + 0.8, b + s * 0.07, a + 0.1, v + 1.45, b + s * 0.07, 0.025); }
    else if (kind === 'axe') { RD(W, a, v - 0.4, b + s * 0.06, a, v + 0.4, b + s * 0.06, 0.02); BX('iron', a - 0.11, a + 0.02, v + 0.3, v + 0.42, b + s * 0.04, b + s * 0.08); }
    else if (kind === 'hammer') { RD(W, a, v - 0.25, b + s * 0.06, a, v + 0.25, b + s * 0.06, 0.018); BX('iron', a - 0.08, a + 0.08, v + 0.22, v + 0.3, b + s * 0.03, b + s * 0.09); }
    else if (kind === 'tongs') { RD('iron', a - 0.03, v - 0.35, b + s * 0.06, a, v + 0.3, b + s * 0.06, 0.01, 4); RD('iron', a + 0.03, v - 0.35, b + s * 0.06, a, v + 0.3, b + s * 0.06, 0.01, 4); }
    BX('iron', a - 0.03, a + 0.03, v + 0.3, v + 0.34, b + s * 0.0, b + s * 0.04);
  }

  /** barnInside: the threshing floor across the middle, the hay mow on one side, the byre with its stalls on the other. */
  function barnInside(bag, col, o) {
    const f = frame(bag, col, o), { A0, A1, B0, B1, am, bm, BX, CR, FL, RD, lat, doorB, fl, top } = f;
    const rand = rng(o.seed || 5), far = doorB === B0 ? B1 : B0, s = far === B1 ? -1 : 1, mowSide = ((o.seed || 0) % 2) ? 1 : -1;
    // earth floor, the plank threshing floor across it
    BX('silt', A0, A1, fl - 0.05, fl, B0, B1); FL(A0, A1, B0, B1, fl);
    BX('timber', am - 1.6, am + 1.6, fl, fl + 0.03, B0, B1);
    for (let k = -3; k <= 3; k++) BX(W, am + k * 0.45 - 0.01, am + k * 0.45 + 0.01, fl + 0.03, fl + 0.035, B0, B1);
    // tie beams under the roof
    for (let a = A0 + 0.9; a < A1 - 0.5; a += 2.4) BX(W, a - 0.1, a + 0.1, top - 0.28, top, B0, B1);
    // the hay mow: stacked up to the beams on its side, loose hay pulled out on the floor, a slatted front
    const m0 = mowSide > 0 ? am + 1.6 : A0, m1 = mowSide > 0 ? A1 : am - 1.6, mf = mowSide > 0 ? m0 : m1;
    for (let k = 0; k < 3; k++) { const w = (m1 - m0) / 3, a0 = mowSide > 0 ? m0 + k * w : m1 - (k + 1) * w; const tall = (mowSide > 0 ? k === 2 : k === 0) ? 2.3 : k === 1 ? 1.7 : 1.1; BX('thatch', a0 + 0.06, a0 + w - 0.02, fl, fl + tall, B0 + 0.06, B1 - 0.06); }
    BX('thatch', mf - mowSide * 0.4, mf, fl + 0.02, fl + 0.12, B0 + 0.4, B1 - 1.2);
    CR(m0, m1, B0, B1, fl, fl + 2.3);
    for (let b = B0 + 0.2; b < B1; b += 0.55) RD(W, mf, fl, b, mf, fl + 1.3, b, 0.035);
    BX(W, mf - 0.04, mf + 0.04, fl + 1.28, fl + 1.34, B0, B1);
    // the byre on the other side: stall boards from the far wall, the manger and the hay rack over it
    const y0 = mowSide > 0 ? A0 : am + 1.6, y1 = mowSide > 0 ? am - 1.6 : A1, n = Math.max(2, Math.floor((y1 - y0) / 1.25)), w = (y1 - y0) / n, sd = 2.0;
    for (let k = 0; k <= n; k++) { const a = y0 + k * w; RD(W, a, fl, far, a, fl + 1.25, far, 0.045, 6); RD(W, a, fl, far + s * sd, a, fl + 1.1, far + s * sd, 0.045, 6); BX(W, a - 0.025, a + 0.025, fl + 0.35, fl + 1.15, far, far + s * sd); CR(a - 0.05, a + 0.05, Math.min(far, far + s * sd), Math.max(far, far + s * sd), fl, fl + 1.2); }
    BX(W, y0, y1, fl + 0.5, fl + 0.55, far, far + s * 0.42); BX(W, y0, y1, fl, fl + 0.5, far + s * 0.38, far + s * 0.42);
    for (let k = 0; k < n; k++) { const a = y0 + (k + 0.5) * w; BX('thatch', a - 0.3, a + 0.3, fl + 0.55, fl + 0.7, far + s * 0.05, far + s * 0.38); BX(W, a - 0.3, a + 0.3, fl + 1.5, fl + 1.55, far + s * 0.05, far + s * 0.18); BX('thatch', a - 0.28, a + 0.28, fl + 1.55, fl + 1.85, far + s * 0.06, far + s * 0.2); BX('thatch', a - 0.4, a + 0.4, fl, fl + 0.04, far + s * 0.7, far + s * 1.7); }
    // the loft of poles over the byre half, and its ladder
    BX(W, y0, y1, fl + 2.3, fl + 2.38, B0, B1);
    for (const b of [B0 + 0.3, B1 - 0.3]) BX(W, y0, y1, fl + 2.2, fl + 2.3, b - 0.07, b + 0.07);
    { const la = mowSide > 0 ? y1 : y0, sg = mowSide > 0 ? 1 : -1, nb = nearB(f, 1.3), nb2 = nearB(f, 1.65);
      for (const bb of [nb, nb2]) RD(W, la - sg * 0.25, fl, bb, la - sg * 0.02, fl + 2.38, bb, 0.03);
      for (let v = fl + 0.3; v < fl + 2.3; v += 0.3) RD(W, la - sg * 0.2, v, nb, la - sg * 0.2, v, nb2, 0.015); }
    // tools on the walls beside the door; sacks of grain, a winnowing basket and a wooden shovel on the floor
    const kinds = ['scythe', 'rake', 'flail', 'rake', 'scythe'];
    for (let k = 0; k < 5; k++) tool(f, kinds[k], am - 2.2 + k * 0.55 + (mowSide > 0 ? -0.3 : 0.3), fl + 1.45, far, s);
    const sa = am + (mowSide > 0 ? -2.3 : 2.3);
    for (let k = 0; k < 3; k++) { const b = nearB(f, 0.6 + k * 0.3), a = sa + (rand() - 0.5) * 0.3; BX('sacking', a - 0.26, a + 0.26, fl, fl + 0.7, b - 0.18, b + 0.18); lat('sacking', [[0.001, 0.66], [0.1, 0.66], [0.05, 0.78], [0.001, 0.8]], 6, a, fl, b); }
    CR(sa - 0.4, sa + 0.4, nearB(f, 0.3), nearB(f, 1.7), fl, fl + 0.8);
    lat('wicker', [[0.28, 0.04], [0.36, 0.14], [0.37, 0.2], [0.001, 0.2]], 10, am + 1.1, fl + 0.03, bm + 0.3);
    RD(W, am + 0.9, fl + 0.02, bm + 0.8, am + 0.9, fl + 0.5, bm + 1.2, 0.02); BX(W, am + 0.84, am + 0.98, fl + 0.45, fl + 0.5, bm + 1.18, bm + 1.4);
    void top;
  }

  /** loftInside: the storehouse's upper room — the family's valuables: chests, kegs, bolts of cloth, hung meat, a bed for a guest, the clothes on their pegs. */
  function loftInside(bag, col, o) {
    const f = frame(bag, col, o), { A0, A1, B0, B1, am, bm, BX, CR, FL, RD, lat, fl, top, doorB } = f;
    const rand = rng(o.seed || 9), far = doorB === B0 ? B1 : B0, s = far === B1 ? -1 : 1;
    BX('timber', A0, A1, fl, fl + 0.03, B0, B1); FL(A0, A1, B0, B1, fl + 0.03);
    // the guest's bed against the far wall: a frame, a straw tick, skins, a bolster
    BX(W, A0 + 0.05, A0 + 1.95, fl, fl + 0.38, far + s * 0.04, far + s * 0.8); BX('thatch', A0 + 0.1, A0 + 1.9, fl + 0.38, fl + 0.46, far + s * 0.08, far + s * 0.76); BX('hide_white', A0 + 0.3, A0 + 1.9, fl + 0.46, fl + 0.5, far + s * 0.1, far + s * 0.74); BX('linen', A0 + 0.1, A0 + 0.5, fl + 0.46, fl + 0.58, far + s * 0.1, far + s * 0.74);
    CR(A0 + 0.05, A0 + 1.95, Math.min(far + s * 0.04, far + s * 0.8), Math.max(far + s * 0.04, far + s * 0.8), fl, fl + 0.5);
    // two iron-bound chests, a row of kegs, bolts of homespun on a shelf
    for (const [a, b, mt] of [[A1 - 0.55, far + s * 0.4, 'wood_dark'], [A1 - 0.55, far + s * 1.1, 'timber']]) { BX(mt, a - 0.4, a + 0.4, fl, fl + 0.5, b - 0.28, b + 0.28); BX(mt, a - 0.42, a + 0.42, fl + 0.5, fl + 0.56, b - 0.3, b + 0.3); for (const da of [-0.25, 0.25]) BX('iron', a + da - 0.025, a + da + 0.025, fl, fl + 0.565, b - 0.31, b + 0.31); CR(a - 0.42, a + 0.42, b - 0.3, b + 0.3, fl, fl + 0.56); }
    for (let k = 0; k < 3; k++) lat('wood_dark', [[0.12, 0], [0.17, 0.15], [0.19, 0.3], [0.17, 0.45], [0.12, 0.5], [0.001, 0.5]], 9, A0 + 0.3 + k * 0.5, fl, far + s * 1.35);
    CR(A0 + 0.1, A0 + 1.5, far + s * 1.15, far + s * 1.55, fl, fl + 0.5);
    BX(W, am - 0.2, am + 0.9, fl + 1.1, fl + 1.14, far + s * 0.02, far + s * 0.38);
    for (let k = 0; k < 4; k++) BX(['cloth_brown', 'cloth_red', 'linen', 'cloth_indigo'][k], am - 0.18 + k * 0.28, am + 0.06 + k * 0.28, fl + 1.14, fl + 1.34, far + s * 0.04, far + s * 0.34);
    // the clothes on their pegs, the hung meat from the beam over the middle
    for (let k = 0; k < 3; k++) { const a = am - 0.8 + k * 0.7, mm = ['cloth_green', 'cloth_brown', 'cloth_grey'][k]; BX('iron', a - 0.02, a + 0.02, fl + 1.65, fl + 1.69, far, far + s * 0.07); BX(mm, a - 0.25, a + 0.25, fl + 0.7, fl + 1.64, far + s * 0.05, far + s * 0.1); }
    BX(W, A0, A1, top - 0.2, top, bm - 0.07, bm + 0.07);
    for (let k = 0; k < 4; k++) { const a = A0 + 0.5 + k * 0.7; RD('rope_fibre', a, top - 0.2, bm, a + (rand() - 0.5) * 0.05, top - 0.75, bm, 0.02, 5); BX('hide_brown', a - 0.06, a + 0.06, top - 1.35, top - 0.75, bm - 0.05, bm + 0.05); }
    lat('iron', [[0.001, 0], [0.04, 0], [0.04, 0.5], [0.1, 0.52], [0.001, 0.52]], 7, A1 - 0.4, fl, bm - 0.3 * s);
  }

  /** smithyInside: the forge, the bellows, the anvil on its block, the quenching tub, the coal, tools on the wall. */
  function smithyInside(bag, col, o) {
    const f = frame(bag, col, o), { A0, A1, B0, B1, am, bm, BX, CR, FL, RD, lat, fl, top, doorB } = f;
    const far = doorB === B0 ? B1 : B0, s = far === B1 ? -1 : 1;
    BX('silt', A0, A1, fl - 0.05, fl, B0, B1); FL(A0, A1, B0, B1, fl);
    for (const b of [B0, B1]) BX('bark_dark', A0 + 0.01, A1 - 0.01, fl + 0.9, top, b === B0 ? b + 0.005 : b - 0.015, b === B0 ? b + 0.015 : b - 0.005);
    // the forge against the far wall: a stone hearth hip high under its hood of clay and wattle, the glowing coals
    const fa = A0 + 1.1, fb = far + s * 0.75;
    BX('rubble', fa - 0.8, fa + 0.8, fl, fl + 0.85, fb - 0.75, fb + 0.75); BX('pottery_dark', fa - 0.55, fa + 0.55, fl + 0.85, fl + 0.88, fb - 0.5, fb + 0.5);
    BX('flame', fa - 0.2, fa + 0.2, fl + 0.88, fl + 0.93, fb - 0.2, fb + 0.2); lat('flame', [[0.001, 0], [0.16, 0.02], [0.1, 0.16], [0.001, 0.3]], 7, fa, fl + 0.88, fb);
    BX('pottery_dark', fa - 0.7, fa + 0.7, fl + 1.95, top - 0.05, far + s * 0.02, far + s * 0.5); BX('pottery_dark', fa - 0.5, fa + 0.5, fl + 1.5, fl + 1.95, far + s * 0.02, far + s * 0.4);
    CR(fa - 0.8, fa + 0.8, fb - 0.75, fb + 0.75, fl, fl + 0.9);
    // the bellows: leather bags on a frame, the nozzle into the fire
    { const ba = fa + 1.35, b0 = far + s * 0.3, b1 = far + s * 1.0; BX(W, ba - 0.35, ba + 0.35, fl + 0.7, fl + 0.76, b0, b1); BX('hide_brown', ba - 0.3, ba + 0.3, fl + 0.76, fl + 0.96, far + s * 0.4, far + s * 0.9); RD('iron', ba - 0.3, fl + 0.85, far + s * 0.65, fa + 0.55, fl + 0.88, far + s * 0.65, 0.03, 6);
      BX(W, ba - 0.3, ba + 0.3, fl + 0.96, fl + 1.0, far + s * 0.42, far + s * 0.88); RD(W, ba + 0.3, fl + 0.9, far + s * 0.65, ba + 0.55, fl + 1.5, far + s * 0.65, 0.02);
      CR(ba - 0.35, ba + 0.35, b0, b1, fl, fl + 1.0); }
    // the anvil on its stump, the quenching tub, the coal, a bench with a vice
    { const aa = am + 0.6, ab = bm; lat(W, [[0.001, 0], [0.32, 0], [0.3, 0.55], [0.001, 0.55]], 10, aa, fl, ab); BX('iron', aa - 0.28, aa + 0.28, fl + 0.55, fl + 0.62, ab - 0.08, ab + 0.08); BX('iron', aa - 0.12, aa + 0.12, fl + 0.5, fl + 0.55, ab - 0.12, ab + 0.12); BX('iron', aa + 0.28, aa + 0.45, fl + 0.57, fl + 0.62, ab - 0.03, ab + 0.03);
      CR(aa - 0.33, aa + 0.33, ab - 0.33, ab + 0.33, fl, fl + 0.62); }
    { const ta = A1 - 0.55, tb = far + s * 0.6; lat('wood_dark', [[0.001, 0], [0.34, 0], [0.38, 0.5], [0.34, 0.5], [0.34, 0.06], [0.001, 0.06]], 12, ta, fl, tb); lat('water', [[0.001, 0.42], [0.33, 0.42]], 10, ta, fl, tb); CR(ta - 0.4, ta + 0.4, tb - 0.4, tb + 0.4, fl, fl + 0.5); }
    for (let k = 0; k < 14; k++) lat('bitumen', [[0.001, 0], [0.1, 0.01], [0.07, 0.1], [0.001, 0.12]], 5, A1 - 0.4 - (k % 5) * 0.12 - (k >> 2) * 0.06, fl + (k > 9 ? 0.1 : 0), nearB(f, 0.5) + (k % 3) * 0.1 * -s);
    { const b0 = nearB(f, 0.1), b1 = nearB(f, 0.4); BX(W, A0 + 0.1, A0 + 1.5, fl + 0.82, fl + 0.88, b0, b1); for (const a of [A0 + 0.2, A0 + 1.4]) BX(W, a - 0.04, a + 0.04, fl, fl + 0.82, b0, b1); BX('iron', A0 + 0.4, A0 + 0.5, fl + 0.88, fl + 1.05, b0, b1); CR(A0 + 0.1, A0 + 1.5, b0, b1, fl, fl + 0.9); }
    ['hammer', 'tongs', 'hammer', 'tongs', 'axe'].forEach((k, i) => tool(f, k, am - 0.6 + i * 0.45, fl + 1.5, far, s));
    BX(W, A0, A1, top - 0.28, top, B0, B1);
  }

  /** shed: { rect, y, foot, seed } — an open wood shed: log posts, a lean roof of boards under sod, the split firewood stacked in rows against the back. */
  function shed(el, { bag, col }) {
    const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, foot = el.foot ?? y - 0.3, rand = rng(el.seed || 3), alongX = x1 - x0 >= z1 - z0;
    const hi = 2.35, lo = 1.9, LA = alongX ? x1 - x0 : z1 - z0, LB = alongX ? z1 - z0 : x1 - x0;
    const P = (a, b) => (alongX ? [x0 + a, z0 + b] : [x0 + b, z0 + a]);
    const np = Math.max(2, Math.round(LA / 2.4) + 1);
    for (let k = 0; k < np; k++) for (const [b, h] of [[0.15, hi], [LB - 0.15, lo]]) {
      const [px, pz] = P(0.15 + k * (LA - 0.3) / (np - 1), b);
      bag.add('rubble', box(px - 0.2, foot, pz - 0.2, px + 0.2, y + 0.1, pz + 0.2)); bag.add(LOG, logRod([px, y + 0.06, pz], [px, y + h, pz], 0.12, 7)); col.circle(px, pz, 0.14, foot, y + h);
    }
    const ya = y + hi, yb = y + lo;
    const S = (a0, b0, a1, b1, v0, v1) => { const p = P(a0, b0), q = P(a1, b1); bag.add(W, box(Math.min(p[0], q[0]), v0, Math.min(p[1], q[1]), Math.max(p[0], q[0]), v1, Math.max(p[1], q[1]))); };
    S(0, 0, LA, 0.3, ya - 0.1, ya + 0.08); S(0, LB - 0.3, LA, LB, yb - 0.1, yb + 0.08);
    const t = 0.16, A = -0.3, Bn = LA + 0.3, q = (a, b, v) => { const p = P(a, b); return [p[0], v, p[1]]; };
    const mk = (mat, dv) => bag.add(mat, hexa([q(A, -0.35, ya + 0.04 + dv), q(Bn, -0.35, ya + 0.04 + dv), q(Bn, LB + 0.35, yb + 0.04 + dv), q(A, LB + 0.35, yb + 0.04 + dv), q(A, -0.35, ya + 0.04 + dv + t), q(Bn, -0.35, ya + 0.04 + dv + t), q(Bn, LB + 0.35, yb + 0.04 + dv + t), q(A, LB + 0.35, yb + 0.04 + dv + t)]));
    mk(W, 0); mk('sod', 0.16);
    S(0, 0.0, LA, 0.08, y + 0.03, ya - 0.04);
    for (let row = 0; row < 7; row++) for (let a = 0.35; a < LA - 0.3; a += 0.17) {
      if (row >= 5 && rand() < 0.5) continue; if (rand() < 0.04) continue;
      const p = P(a + (row % 2) * 0.08 + (rand() - 0.5) * 0.02, 0.18 + (rand() - 0.5) * 0.02), r = P(a + (row % 2) * 0.08, 0.95 + rand() * 0.1), vv = y + 0.12 + row * 0.27;
      bag.add(rand() < 0.15 ? 'bark_birch' : LOG, logRod([p[0], vv, p[1]], [r[0], vv, r[1]], 0.075, 5));
    }
    { const p = P(0.3, 0.1), r = P(LA - 0.3, 1.0); col.rect([Math.min(p[0], r[0]), Math.min(p[1], r[1]), Math.max(p[0], r[0]), Math.max(p[1], r[1])], y, y + 2); }
    { const [bx, bz] = P(LA * 0.5, LB * 0.7); bag.add(LOG, lathe([[0.001, 0], [0.26, 0], [0.24, 0.5], [0.001, 0.5]], 10, null, bx, y, bz)); bag.add('iron', box(bx - 0.1, y + 0.5, bz - 0.01, bx + 0.02, y + 0.62, bz + 0.01)); bag.add(W, rod([bx, y + 0.5, bz], [bx - 0.05, y + 0.9, bz + 0.3], 0.02, 5)); col.circle(bx, bz, 0.27, y, y + 0.5); }
  }

  /** yard_props: { items: [{ k, at, y, rot, seed }] } — doorsteps, chopping blocks, troughs, grindstones, cairns, tubs, drying racks, bark piles, benches, ladders. */
  function yardProps(el, { bag, col }) {
    for (const it of el.items) {
      const rand = rng(it.seed || 3), [x, z] = it.at, y = it.y ?? 0, loc = { at: it.at, rot: it.rot ?? 0 };
      if (it.k === 'step') {
        put(bag, 'flagstone', box(-0.55, -0.3, -0.35, 0.55, 0.06, 0.35), loc, y);
        put(bag, 'schist_rubble', box(-0.3, -0.3, 0.3, 0.45, 0.02, 0.75), loc, y);
      } else if (it.k === 'block') {
        bag.add(LOG, lathe([[0.001, 0], [0.27, 0], [0.25, 0.52], [0.001, 0.52]], 10, null, x, y, z));
        bag.add('iron', box(x - 0.11, y + 0.52, z - 0.012, x + 0.02, y + 0.64, z + 0.012));
        bag.add(W, rod([x, y + 0.52, z], [x - 0.05, y + 0.95, z + 0.28], 0.02, 5)); col.circle(x, z, 0.28, y, y + 0.5);
        for (let k = 0; k < 9; k++) { const a = rand() * 6.28, d = 0.4 + rand() * 0.9; bag.add('bark_birch', box(x + Math.cos(a) * d - 0.05, y, z + Math.sin(a) * d - 0.02, x + Math.cos(a) * d + 0.05, y + 0.03, z + Math.sin(a) * d + 0.02)); }
        for (let k = 0; k < 3; k++) bag.add(LOG, logRod([x + 0.5 + k * 0.1, y + 0.08, z + 0.6], [x + 0.9 + k * 0.1, y + 0.08, z + 0.7 + k * 0.05], 0.06, 5));
      } else if (it.k === 'trough') {
        put(bag, 'wood_dark', box(-0.9, 0.0, -0.22, 0.9, 0.34, 0.22), loc, y + 0.12); put(bag, 'water', box(-0.84, 0.3, -0.16, 0.84, 0.31, 0.16), loc, y + 0.12);
        for (const sx of [-0.65, 0.65]) put(bag, 'rubble', box(sx - 0.2, 0, -0.2, sx + 0.2, 0.14, 0.2), loc, y);
        const c = Math.cos(it.rot ?? 0), sn = Math.sin(it.rot ?? 0); col.segment([x - c * 0.9, z + sn * 0.9], [x + c * 0.9, z - sn * 0.9], 0.45, y, y + 0.5);
      } else if (it.k === 'grind') {
        bag.add(W, box(x - 0.45, y, z - 0.05, x - 0.35, y + 0.95, z + 0.05)); bag.add(W, box(x + 0.35, y, z - 0.05, x + 0.45, y + 0.95, z + 0.05)); bag.add(W, box(x - 0.45, y + 0.3, z - 0.3, x + 0.45, y + 0.36, z + 0.3));
        bag.add('granite_grey', lathe([[0.001, -0.06], [0.34, -0.06], [0.34, 0.06], [0.001, 0.06]], 14).rotateZ(Math.PI / 2).translate(x, y + 0.8, z)); col.circle(x, z, 0.5, y, y + 1);
      } else if (it.k === 'cairn') {
        for (let k = 0; k < 12; k++) { const a = rand() * 6.28, d = rand() * 0.9, r = 0.18 + rand() * 0.2, hh = Math.max(0, 0.6 - d * 0.55); bag.add(rand() < 0.5 ? 'rubble' : 'schist_rubble', lathe([[0.001, 0], [r, 0.04], [r * 0.9, r * 0.9], [0.001, r * 1.1]], 6, null, x + Math.cos(a) * d, y + hh, z + Math.sin(a) * d)); }
        col.circle(x, z, 1.0, y, y + 0.7);
      } else if (it.k === 'tub') {
        bag.add('wood_dark', lathe([[0.001, 0], [0.4, 0], [0.45, 0.7], [0.001, 0.7]], 12, null, x, y, z)); bag.add('water', lathe([[0.001, 0.62], [0.42, 0.62]], 12, null, x, y, z)); col.circle(x, z, 0.45, y, y + 0.7);
        bag.add('wood_dark', lathe([[0.001, 0], [0.14, 0], [0.17, 0.26], [0.001, 0.26]], 8, null, x + 0.7, y, z + 0.2));
      } else if (it.k === 'rack') {
        const L = it.len ?? 3.2, c = Math.cos(it.rot ?? 0), sn = Math.sin(it.rot ?? 0), A = [x - c * L / 2, z + sn * L / 2], B = [x + c * L / 2, z - sn * L / 2];
        for (const [px, pz] of [A, B]) { bag.add(LOG, logRod([px, y - 0.2, pz], [px, y + 1.9, pz], 0.06, 6)); col.circle(px, pz, 0.08, y, y + 1.9); }
        bag.add(LOG, logRod([A[0], y + 1.85, A[1]], [B[0], y + 1.85, B[1]], 0.04, 5)); bag.add(LOG, logRod([A[0], y + 1.45, A[1]], [B[0], y + 1.45, B[1]], 0.035, 5));
        for (let k = 0; k < 4; k++) {
          const t = (0.12 + k * 0.22 + rand() * 0.04) * L, w = 0.45 + rand() * 0.3, px = A[0] + (B[0] - A[0]) * t / L, pz = A[1] + (B[1] - A[1]) * t / L, h = 0.9 + rand() * 0.4;
          const mat = ['linen', 'cloth_brown', 'cloth_grey', 'cloth_white'][k], dx = c * w / 2, dz = -sn * w / 2, yt = y + 1.83;
          const p1 = [px - dx, yt, pz - dz], p2 = [px + dx, yt, pz + dz], p3 = [px + dx, yt - h, pz + dz], p4 = [px - dx, yt - h * (0.9 + rand() * 0.1), pz - dz];
          bag.add(mat, fromTriangles([...p1, ...p2, ...p3, ...p1, ...p3, ...p4, ...p1, ...p3, ...p2, ...p1, ...p4, ...p3]));
        }
      } else if (it.k === 'bark') {
        for (let k = 0; k < 8; k++) bag.add('bark_birch', lathe([[0.05, 0], [0.07, 0.8], [0.001, 0.8]], 6).rotateZ(Math.PI / 2).translate(x - 0.4, y + 0.07 + (k >> 2) * 0.13, z + (k % 4) * 0.14 - 0.2));
      } else if (it.k === 'bench') {
        const L = 1.6, c = Math.cos(it.rot ?? 0), sn = Math.sin(it.rot ?? 0);
        put(bag, W, box(-L / 2, 0.42, -0.17, L / 2, 0.47, 0.17), loc, y); for (const sx of [-L / 2 + 0.2, L / 2 - 0.2]) put(bag, W, box(sx - 0.04, 0, -0.14, sx + 0.04, 0.42, 0.14), loc, y);
        col.segment([x - c * L / 2, z + sn * L / 2], [x + c * L / 2, z - sn * L / 2], 0.4, y, y + 0.5);
      } else if (it.k === 'ladder') {
        const dx = Math.cos(it.rot ?? 0), dz = -Math.sin(it.rot ?? 0), px = -dz, pz = dx;
        for (const sd of [-0.22, 0.22]) bag.add(LOG, rod([x + px * sd, y, z + pz * sd], [x + px * sd + dx * 0.9, y + 3.0, z + pz * sd + dz * 0.9], 0.035, 5));
        for (let v = 0.35; v < 2.9; v += 0.33) bag.add(W, rod([x - px * 0.22 + dx * 0.9 * v / 3, y + v, z - pz * 0.22 + dz * 0.9 * v / 3], [x + px * 0.22 + dx * 0.9 * v / 3, y + v, z + pz * 0.22 + dz * 0.9 * v / 3], 0.02, 4));
      }
    }
  }

  /** graves: { items: [{ at, y, rot, k ('cross' | 'mound' | 'slab'), seed }] } — the churchyard: low turf mounds with wooden crosses weathered grey and leaning. */
  function graves(el, { bag, col }) {
    for (const it of el.items) {
      const [x, z] = it.at, y = it.y ?? 0, rand = rng(it.seed || 3), loc = { at: it.at, rot: it.rot ?? 0 };
      if (it.k === 'mound') put(bag, 'sod', lathe([[0.001, 0.0], [0.5, 0.0], [0.42, 0.12], [0.001, 0.2]], 8).scale(1, 1, 2.0), loc, y - 0.02);
      else if (it.k === 'cross') {
        const lean = (rand() - 0.5) * 0.18, hh = 0.95 + rand() * 0.4, ar = 0.2 + rand() * 0.06;
        const g = box(-0.035, 0, -0.035, 0.035, hh, 0.035); g.rotateZ(lean); put(bag, rand() < 0.3 ? 'wood_dark' : 'planks_grey', g, loc, y);
        const g2 = box(-0.03, hh * 0.68, -ar, 0.03, hh * 0.68 + 0.06, ar); g2.rotateZ(lean); put(bag, 'planks_grey', g2, loc, y);
        col.circle(x, z, 0.09, y, y + 0.5);
      } else if (it.k === 'slab') {
        put(bag, 'granite_grey', box(-0.22, 0, -0.04, 0.22, 0.75 + rand() * 0.2, 0.04), loc, y - 0.05); col.circle(x, z, 0.2, y, y + 0.6);
      }
    }
  }

  /** slab_path: { pts, y, w, seed } — a path of flat stones laid along a line, irregular, sunk a little in the turf. */
  function slabPath(el, { bag }) {
    const rand = rng(el.seed || 3), yf = typeof el.y === 'function' ? el.y : () => el.y ?? 0, w = el.w ?? 1.3;
    for (let i = 0; i + 1 < el.pts.length; i++) {
      const [ax, az] = el.pts[i], [bx, bz] = el.pts[i + 1], L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L;
      for (let u = 0.2; u < L - 0.2; u += 0.45 + rand() * 0.35) {
        const side = (rand() - 0.5) * (w * 0.5), l = 0.5 + rand() * 0.35, ww = 0.4 + rand() * 0.3, cx = ax + ux * u - uz * side, cz = az + uz * u + ux * side;
        const g = box(-l / 2, 0, -ww / 2, l / 2, 0.08, ww / 2); g.rotateY(-Math.atan2(uz, ux) + (rand() - 0.5) * 0.5); g.translate(cx, yf(cx, cz) - 0.03, cz);
        bag.add(rand() < 0.7 ? 'flagstone' : 'schist_rubble', g);
      }
    }
  }

  /** net_rack: { pts: [a, b], y } — two posts with a pole between and a fishing net hung to dry, floats along its head. */
  function netRack(el, { bag, col }) {
    const [a, b] = el.pts, y = typeof el.y === 'function' ? el.y : () => el.y ?? 0, rand = rng(el.seed || 3), h = el.h ?? 2.1, L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    for (const p of [a, b]) { bag.add(LOG, logRod([p[0], y(...p) - 0.3, p[1]], [p[0], y(...p) + h, p[1]], 0.07, 6)); col.circle(p[0], p[1], 0.09, y(...p), y(...p) + h); }
    const ya = y(...a) + h - 0.05, yb = y(...b) + h - 0.05;
    bag.add(LOG, logRod([a[0], ya, a[1]], [b[0], yb, b[1]], 0.045, 5));
    const n = Math.round(L / 0.25), T = [];
    for (let k = 0; k < n; k++) {
      if (k % 4 === 3) continue;
      const t0 = k / n, t1 = (k + 1) / n, d0 = 1.25 + rand() * 0.2, d1 = 1.25 + rand() * 0.2, p0 = [a[0] + (b[0] - a[0]) * t0, a[1] + (b[1] - a[1]) * t0], p1 = [a[0] + (b[0] - a[0]) * t1, a[1] + (b[1] - a[1]) * t1], yy0 = ya + (yb - ya) * t0, yy1 = ya + (yb - ya) * t1;
      T.push(p0[0], yy0, p0[1], p1[0], yy1, p1[1], p1[0], yy1 - d1, p1[1], p0[0], yy0, p0[1], p1[0], yy1 - d1, p1[1], p0[0], yy0 - d0, p0[1], p0[0], yy0, p0[1], p1[0], yy1 - d1, p1[1], p1[0], yy1, p1[1], p0[0], yy0, p0[1], p0[0], yy0 - d0, p0[1], p1[0], yy1 - d1, p1[1]);
    }
    if (T.length) bag.add('rope_fibre', fromTriangles(T));
    for (let k = 0; k < L / 0.6; k++) { const t = (k + 0.5) * 0.6 / L, p = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; bag.add('bark_birch', lathe([[0.001, 0], [0.06, 0.03], [0.05, 0.1], [0.001, 0.12]], 6, null, p[0], ya + (yb - ya) * t - 0.1, p[1])); }
  }

  return { interiors: { barn: barnInside, loft: loftInside, smithy: smithyInside }, elements: { shed, yard_props: yardProps, graves, slab_path: slabPath, net_rack: netRack } };
}
