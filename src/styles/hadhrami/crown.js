// The skyline, the foot and the door of the arrival's tower house (docs/settlements/shibam.md §13): the parapet with its lime cap and the raised
// teeth along it, stepped corner piers, the stair-head standing over the stair, palm-trunk spouts with their rain runnels, the lime bands
// at every floor and the lime edging of the corner, the stone footing's courses and ledge, the carved surround of the street door.
// Everything lands in materials the plan already has (lime_plaster, mud_plaster, schist_rubble, cedar, wood_dark, timber, iron),
// each piece a millimetre or two off its neighbour so the bag merges them; the few spouts and runnels are the town's shared pieces merged in, not instanced.
import { box } from '../../core/geom.js';
import { Matrix4 } from '../../core/three.js';
import { K, ys, houseDims } from './dims.js';
import { spoutPieces } from './parts.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

export function crown(ctx, el, D, top) {
  const { bag, col } = ctx, [X0, Z0, X1, Z1] = el.rect, n = el.storeys ?? 7, [I0, I1] = D.I, r = rng(((el.seed || 5) * 7919) >>> 0);
  const t = K * top, a0 = X0 + t, b0 = Z0 + t, a1 = X1 - t, b1 = Z1 - t, pt = 0.34, L = 'lime_plaster';
  const j = () => (r() - 0.5) * 0.004;
  const put = (pieces, x, y, z, nx, nz) => { const m = new Matrix4().makeRotationY(Math.atan2(nx, nz)).setPosition(x, y, z); for (const [mat, g] of pieces) bag.add(mat, g.clone().applyMatrix4(m)); };

  // ── the head: the lime cap (nurah) over the whole parapet with its drip, the teeth, the stepped piers ──
  const cy = top + 1.0, o = 0.05;
  bag.add(L, box(a0 - o, cy, b0 - o, a1 + o, cy + 0.07, b0 + pt + 0.02)); bag.add(L, box(a0 - o, cy + j(), b1 - pt - 0.02, a1 + o, cy + 0.07, b1 + o));
  bag.add(L, box(a0 - o, cy, b0 + pt + 0.02, a0 + pt + 0.02, cy + 0.07, b1 - pt - 0.02)); bag.add(L, box(a1 - pt - 0.02, cy, b0 + pt + 0.02, a1 + o, cy + 0.07, b1 - pt - 0.02));
  // the teeth: small stepped blocks, 0.36 wide every 0.95 m, a lower step under each, skipping the piers and the stair-head
  for (let x = a0 + 1.0; x < a1 - 1.2; x += 0.95) {
    for (const [z0, z1] of [[b0, b0 + pt], [b1 - pt, b1]]) {
      if (z0 === b0 && x < I0 + 3.2) continue;
      bag.add(L, box(x, cy + 0.07, z0 + 0.02, x + 0.36 + j(), cy + 0.36, z1 - 0.02)); bag.add(L, box(x - 0.03, cy + 0.07, z0, x + 0.39, cy + 0.14, z1));
    }
  }
  for (let z = b0 + 1.0; z < b1 - 1.2; z += 0.95) for (const [x0, x1] of [[a0, a0 + pt], [a1 - pt, a1]]) {
    if (x0 === a0 && z < I1 + 3.9) continue;
    bag.add(L, box(x0 + 0.02, cy + 0.07, z, x1 - 0.02, cy + 0.36, z + 0.36 + j())); bag.add(L, box(x0, cy + 0.07, z - 0.03, x1, cy + 0.14, z + 0.39));
  }
  // piers: the 0.6 m pier of open.js (to top+1.5) gets a step, a cap and a small horn
  for (const [cx, cz] of [[a0, b0], [a1 - 0.6, b0], [a0, b1 - 0.6], [a1 - 0.6, b1 - 0.6]]) {
    bag.add(L, box(cx - 0.05, top + 1.5, cz - 0.05, cx + 0.65, top + 1.58, cz + 0.65)); bag.add(L, box(cx + 0.08, top + 1.58, cz + 0.08, cx + 0.52, top + 1.9 + j(), cz + 0.52)); bag.add(L, box(cx + 0.03, top + 1.9, cz + 0.03, cx + 0.57, top + 1.97, cz + 0.57));
  }

  // ── the stair-head: the stair comes out of the roof under a little roofed house, open to the south ──
  { const sx0 = a0, sz0 = b0, sx1 = I0 + 2.4 + 0.3, sz1 = I1 + 3.6 + 0.3, H = 2.45;
    // the west and north walls stand up from the parapet, the east wall stands on the roof beside the hole
    bag.add(L, box(sx0, top + 1.0, sz0, sx0 + pt, top + H, sz1)); col.rect([sx0, sz0, sx0 + pt, sz1], top + 1.0, top + H);
    bag.add(L, box(sx0 + pt, top + 1.0, sz0, sx1, top + H, sz0 + pt)); col.rect([sx0 + pt, sz0, sx1, sz0 + pt], top + 1.0, top + H);
    bag.add(L, box(sx1 - 0.3, top, sz0 + pt, sx1, top + H, sz1)); col.rect([sx1 - 0.3, sz0 + pt, sx1, sz1], top, top + H);
    // the roof slab with its edge, the cap and the drip, a door-head over the south side
    bag.add('mud_plaster', box(sx0 - 0.04, top + H, sz0 - 0.04, sx1 + 0.06, top + H + 0.3, sz1 + 0.12));
    bag.add(L, box(sx0 - 0.1, top + H + 0.3, sz0 - 0.1, sx1 + 0.12, top + H + 0.37, sz1 + 0.18));
    for (const [px, pz] of [[sx0 - 0.04, sz0 - 0.04], [sx1 - 0.4, sz0 - 0.04], [sx0 - 0.04, sz1 - 0.4], [sx1 - 0.4, sz1 - 0.4]]) bag.add(L, box(px, top + H + 0.37, pz, px + 0.5, top + H + 0.62 + j(), pz + 0.5));
    // a small window in the north wall's inner face is not wanted (it would be the parapet's back): the lime frame of the door instead
    bag.add('timber', box(sx0 + pt, top + 2.12, sz1 - 0.12, sx1 - 0.3, top + H, sz1 + 0.06));
    bag.add('opening', box(sx0 + pt + 0.5, top + 0.9, sz0 + pt - 0.02, sx0 + pt + 1.1, top + 1.4, sz0 + pt)); }

  // ── the spouts of palm trunk through the parapet on the north and west faces, and the lime runnel the rain draws under each ──
  const faceW = (y) => X0 + K * y, faceN = (y) => Z0 + K * y;
  for (const x of [a0 + 3.3, a0 + 6.2, a0 + 8.6]) {
    put(spoutPieces(), x, top + 0.2, faceN(top + 0.2) - 0.0, 0, -1);
    bag.add(L, box(x - 0.15, top + 0.0, b0 - 0.02, x + 0.15, top + 0.04, b0 + 0.1)); bag.add(L, box(x - 0.15, top + 0.36, b0 - 0.02, x + 0.15, top + 0.41, b0 + 0.1));
    for (let q = 0; q < 2; q++) { const y1 = top - 0.2 - q * 0.9, f = faceN(y1 - 0.8); bag.add(L, box(x - 0.1 + q * 0.03, y1 - 0.8, f - 0.012, x + 0.1 - q * 0.03, y1, f + 0.003 + j())); }
  }
  for (const z of [b0 + 5.0, b0 + 7.4]) {
    put(spoutPieces(), faceW(top + 0.2), top + 0.2, z, -1, 0);
    bag.add(L, box(a0 - 0.02, top + 0.0, z - 0.15, a0 + 0.1, top + 0.04, z + 0.15)); bag.add(L, box(a0 - 0.02, top + 0.36, z - 0.15, a0 + 0.1, top + 0.41, z + 0.15));
    for (let q = 0; q < 2; q++) { const y1 = top - 0.2 - q * 0.9, f = faceW(y1 - 0.8); bag.add(L, box(f - 0.012, y1 - 0.8, z - 0.1 + q * 0.03, f + 0.003 + j(), y1, z + 0.1 - q * 0.03)); }
  }

  // ── the floors' string courses (a lime band at each floor line, a drip under it), and the lime edging of the north-west corner ──
  for (let s = 1; s < n - 1; s++) {
    const y = ys(s) - 0.42, q = K * y, p = 0.045;
    if (s === n - 2) continue;
    bag.add(L, box(X0 + q - p, y, Z0 + q - p, X1 - K * y, y + 0.1, Z0 + q + 0.002)); bag.add(L, box(X0 + q - p, y + j(), Z0 + q, X0 + q + 0.002, y + 0.1, Z1 - K * y));
    bag.add(L, box(X0 + q - p - 0.025, y - 0.04, Z0 + q - p - 0.025, X0 + q + 0.3, y, Z0 + q + 0.002)); bag.add(L, box(X0 + q - p - 0.025, y - 0.04 + j(), Z0 + q, X0 + q + 0.002, y, Z1 - K * y));
  }
  for (let s = 0; s < n - 2; s++) {
    const y0 = s === 0 ? 1.1 : ys(s), y1 = ys(s + 1), q = K * y0;
    bag.add(L, box(X0 + q - 0.04, y0, Z0 + q - 0.04, X0 + q + 0.34, y1, Z0 + q + 0.003)); bag.add(L, box(X0 + q - 0.04 + j(), y0, Z0 + q, X0 + q + 0.003, y1, Z0 + q + 0.34));
  }

  // ── the footing: a lime ledge on the plinth's head, and the rough courses of the stone (west either side of the door, and north) ──
  { const dz = D.doorZ, q = K * 1.1;
    bag.add(L, box(X0 - 0.13, 1.1, Z0 - 0.13, X1, 1.18, Z0 + q + 0.002));
    bag.add(L, box(X0 - 0.13, 1.1 + j(), Z0 - 0.1, X0 + q + 0.002, 1.18, dz - 0.75)); bag.add(L, box(X0 - 0.13, 1.1, dz + 0.75, X0 + q + 0.002, 1.18, Z1));
    const R = 'schist_rubble', row = (y0, h, k) => {
      // stones of 0.3–0.8 m, joggled, set a little proud of the plinth's face
      for (let u = X0 + 0.1; u < X1 - 0.1;) { const w = 0.3 + r() * 0.5, hh = h * (0.85 + r() * 0.3); bag.add(R, box(u, y0, Z0 - 0.15 - r() * 0.03, Math.min(u + w - 0.03, X1 - 0.1), y0 + hh, Z0 - 0.07)); u += w; }
      for (const [za, zb] of [[Z0 + 0.1, dz - 0.8], [dz + 0.8, Z1 - 0.1]]) for (let u = za; u < zb - 0.2;) { const w = 0.3 + r() * 0.5, hh = h * (0.85 + r() * 0.3); bag.add(R, box(X0 - 0.15 - r() * 0.03, y0, u, X0 - 0.07, y0 + hh, Math.min(u + w - 0.03, zb))); u += w; }
      void k;
    };
    [0.05, 0.37, 0.69, 0.97].forEach((y, i) => row(y, 0.3, i)); }

  // ── the street door's surround: carved jamb posts with bosses, a crest of three lime steps over the hood ──
  { const dz = D.doorZ, xo = X0 - 0.2, C = 'cedar', W = 'wood_dark';
    for (const s of [-1, 1]) {
      const zc = dz + s * 0.66, za = zc - 0.07, zb = zc + 0.07;
      bag.add(C, box(X0 - 0.17, 0.1, za, X0 - 0.07, 2.32, zb));
      for (let k = 0; k < 7; k++) bag.add(W, box(X0 - 0.2, 0.28 + k * 0.3, zc - 0.045, X0 - 0.17, 0.4 + k * 0.3, zc + 0.045));
      bag.add(L, box(X0 - 0.22, 0, zc - 0.1 - 0.04 * s - 0.0, X0 - 0.07, 0.1, zc + 0.1));
    }
    // the crest over the hood (hood tops at 2.77): three steps and a lozenge of dark wood in the middle
    bag.add(L, box(X0 - 0.12, 2.77, dz - 0.68, X0 - 0.02, 2.95, dz + 0.68)); bag.add(L, box(X0 - 0.1, 2.95, dz - 0.5, X0 - 0.02, 3.1, dz + 0.5)); bag.add(L, box(X0 - 0.08, 3.1, dz - 0.3, X0 - 0.02, 3.22, dz + 0.3));
    bag.add(L, box(X0 - 0.14, 3.22, dz - 0.16, X0 - 0.02, 3.28, dz + 0.16));
    for (const [yy, h] of [[2.8, 0.1], [2.98, 0.1]]) for (let k = -2; k <= 2; k++) bag.add(W, box(X0 - 0.135, yy + j(), dz + k * 0.25 - 0.05, X0 - 0.12, yy + h, dz + k * 0.25 + 0.05));
    bag.add(W, box(X0 - 0.12, 3.12, dz - 0.07, X0 - 0.1, 3.2, dz + 0.07)); bag.add(W, box(X0 - 0.12, 3.14, dz - 0.14, X0 - 0.1, 3.18, dz + 0.14));
    void xo; }
  void I1;
}
