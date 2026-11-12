// Southern Song Lin'an — the entertainment ground (瓦子, wazi), the gates of the wards (坊门) and the
// sunshades and lamp strings over the Imperial Way (docs/settlements/song-hangzhou.md §24).
//
//   hz_wazi      { rect, gates, y, seed }   the walled ground with its theatre (勾栏), bleachers, fence, banners
//   hz_span      { x0, x1, z, y, kind, seed } poles either side of the Way with a cloth sunshade or a string of lamps between
//   hz_fanggate  { at, y, seed }            a timber gate over a lane's mouth, a name board under its hood
//   wazi plans:  the performers, the audience, the stalls and the storyteller's ring (life style)
//
// Registered into the song style's element table (like townscape.js), so that the town's plans can use them.
import { STYLES } from '../../core/build.js';
import { box, lathe, rod, fromTriangles } from '../../core/geom.js';
import '../../styles/song/index.js';
import { gableRoof } from './townscape.js';
import { WAZI, spans, fangGates, IMPERIAL } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const ly = (prof, seg = 8, x = 0, y = 0, z = 0) => lathe(prof, seg, null, x, y, z);

/** A lantern of paper hung with its top at y: a ribbed body, red caps, a tassel. */
function lamp(bag, x, y, z, k = 1) {
  bag.add('lamp_paper', ly([[0.001, -0.3 * k], [0.09 * k, -0.27 * k], [0.15 * k, -0.15 * k], [0.16 * k, -0.07 * k], [0.12 * k, -0.01 * k], [0.001, 0]], 8, x, y, z));
  bag.add('lacquer_red', ly([[0.001, 0.0], [0.06 * k, 0.0], [0.07 * k, 0.03 * k], [0.001, 0.03 * k]], 8, x, y, z));
  bag.add('lacquer_red', ly([[0.001, -0.3 * k], [0.05 * k, -0.3 * k], [0.001, -0.33 * k]], 6, x, y, z));
  bag.add('cloth_red', rod([x, y - 0.33 * k, z], [x, y - 0.5 * k, z], 0.008, 4));
}
/** A rope from a to b sagging by `sag` in the middle (a polyline of rods). Returns the points. */
function rope(bag, a, b, sag, r = 0.012, mat = 'rope_fibre', n = 10) {
  const pts = [];
  for (let i = 0; i <= n; i++) { const t = i / n; pts.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - sag * 4 * t * (1 - t), a[2] + (b[2] - a[2]) * t]); }
  for (let i = 0; i < n; i++) bag.add(mat, rod(pts[i], pts[i + 1], r, 4));
  return pts;
}

// ── the sunshades and lamp strings ─────────────────────────────────────────────────────────────────
/**
 * hz_span { x0, x1, z, y (the pole tops), kind: 'shade' | 'lamps', seed }: a bamboo pole at each side of the Way, a stay rope from the pole's foot to a
 * stone, and between the tops either a sunshade (two ropes 2.2 m apart with a strip of cloth laid between them in bands of two colours, sagging) or a
 * single rope with a string of paper lanterns on short cords [inferred: the Song shops' awnings and the night markets' lamps, §24].
 */
function span(el, { bag, col }) {
  const rand = rng(el.seed || 1), x0 = el.x0, x1 = el.x1, z = el.z, y = el.y ?? 5.4, y0 = el.y0 ?? 0;
  for (const x of [x0, x1]) {
    bag.add('bamboo_culm', rod([x, y0, z], [x, y0 + y + 0.2, z], 0.055, 6));
    bag.add('iron', rod([x, y0 + y - 0.05, z], [x, y0 + y + 0.08, z], 0.07, 6));
    bag.add('granite_grey', box(x - 0.2, y0, z - 0.2, x + 0.2, y0 + 0.28, z + 0.2));
    col.circle(x, z, 0.2, y0, y0 + y);
  }
  const sag = 0.35;
  if (el.kind === 'shade') {
    const w = 2.2, a = [x0, y0 + y, 0], b = [x1, y0 + y, 0], bands = ['cloth_white', 'cloth_indigo', 'cloth_white', 'cloth_red'], k0 = Math.floor(rand() * 4), n = 12;
    const L = (zz) => [[x0, y0 + y, zz], [x1, y0 + y, zz]];
    for (const dz of [-w / 2, w / 2]) rope(bag, L(z + dz)[0], L(z + dz)[1], sag, 0.014, 'rope_fibre', n);
    void a; void b;
    const P = (i, dz) => { const t = i / n; return [x0 + (x1 - x0) * t, y0 + y - sag * 4 * t * (1 - t) - 0.06, z + dz]; };
    const bw = 2;
    for (let i = 0; i < n; i++) {
      const m = bands[(k0 + Math.floor(i / bw)) % 4], p0 = P(i, -w / 2), p1 = P(i + 1, -w / 2), q0 = P(i, w / 2), q1 = P(i + 1, w / 2);
      // sloping a little toward the sides, both faces
      const lo = (p) => [p[0], p[1] - 0.12, p[2]];
      const t = [];
      for (const [A, B, C, D] of [[p0, p1, q1, q0]]) { t.push(...A, ...B, ...C, ...A, ...C, ...D); t.push(...A, ...C, ...B, ...A, ...D, ...C); }
      bag.add(m, fromTriangles(t));
      // the fringe: a valance hanging from each long edge
      for (const [A, B] of [[p0, p1], [q0, q1]]) { const f = [...A, ...lo(B), ...B, ...A, ...lo(A), ...lo(B)]; f.push(...A, ...B, ...lo(B), ...A, ...lo(B), ...lo(A)); bag.add(m, fromTriangles(f)); }
    }
  } else {
    const pts = rope(bag, [x0, y0 + y, z], [x1, y0 + y, z], sag, 0.014, 'rope_fibre', 14);
    for (let i = 1; i < pts.length - 1; i++) if (i % 2 === 1) { const p = pts[i]; lamp(bag, p[0], p[1] - 0.05, p[2] + (i % 4 === 1 ? 0.0 : 0.0), 1 + 0.15 * ((i >> 1) % 2)); }
  }
}

// ── the gate of a ward ───────────────────────────────────────────────────────────────────────────────
/**
 * hz_fanggate { at: [x, z], seed }: the lane runs east–west through it (8 m wide); two timber posts on granite feet either side of the lane, a tie beam
 * at 3.5 m, a lintel under a small gable hood of dark tiles, a board hanging from the beam (the ward's name, unreadable), two lanterns [inferred: Song
 * Lin'an's wards (坊) kept their names on gates (坊额) though the old walled wards were gone; the form is the usual timber gate].
 */
function fangGate(el, { bag, col }) {
  const [x, z] = el.at, y0 = el.y ?? 0, h = 4.5, half = 3.7, rand = rng(el.seed || 1);
  for (const s of [-1, 1]) {
    const zz = z + s * half;
    bag.add('granite_grey', box(x - 0.34, y0, zz - 0.34, x + 0.34, y0 + 0.4, zz + 0.34));
    bag.add('lacquer_red', rod([x, y0 + 0.4, zz], [x, y0 + h, zz], 0.15, 8));
    bag.add('granite_grey', box(x - 0.2, y0 + 0.4, zz - 0.2 + s * 0.3, x + 0.2, y0 + 1.2, zz + 0.2 + s * 0.3));          // the bracing stone leaning on the post's outer face
    col.circle(x, zz, 0.34, y0, y0 + h);
  }
  bag.add('lacquer_red', box(x - 0.14, y0 + 3.45, z - half - 0.3, x + 0.14, y0 + 3.7, z + half + 0.3));                  // the tie beam
  bag.add('lacquer_red', box(x - 0.2, y0 + h - 0.3, z - half - 0.55, x + 0.2, y0 + h, z + half + 0.55));                  // the lintel
  gableRoof(bag, [x - 0.8, z - half - 0.5, x + 0.8, z + half + 0.5], y0 + h, 0.85, 0.5, false, 'plaster_white');
  // the board: black lacquer, a white border and three white strokes standing for its characters
  const bx0 = x - 0.07, bx1 = x + 0.07, bz = (z - 1.0), bw = 2.0, by = y0 + 2.55;
  for (const sx of [-1, 1]) bag.add('rope_fibre', rod([x + sx * 0.0, y0 + 3.45, bz + 0.1], [x, by + 0.75, bz + 0.1], 0.01, 4));
  bag.add('lacquer_black', box(bx0, by, bz, bx1, by + 0.75, bz + bw));
  bag.add('paint_white', box(bx1, by + 0.04, bz + 0.04, bx1 + 0.012, by + 0.71, bz + bw - 0.04));
  bag.add('lacquer_black', box(bx1, by + 0.07, bz + 0.07, bx1 + 0.014, by + 0.68, bz + bw - 0.07));
  for (let k = 0; k < 3; k++) { const c = bz + 0.35 + k * 0.65; bag.add('paint_white', box(bx1 + 0.014, by + 0.16, c - 0.16, bx1 + 0.03, by + 0.6, c + 0.16)); bag.add('lacquer_black', box(bx1 + 0.03, by + 0.2 + (k % 2) * 0.05, c - 0.1, bx1 + 0.04, by + 0.56, c + 0.1)); }
  for (const s of [-1, 1]) lamp(bag, x + 0.45, y0 + 3.45, z + s * (half - 0.7), 1.1);
  void rand;
}

// ── the wazi ─────────────────────────────────────────────────────────────────────────────────────────
const GATE_W = 4.2;
/** The fence's runs (a wall of planks 2.7 m high on a stone footing with a coping, a post every 2.4 m), cut where the gates are. */
function fence(bag, col, y0, rect, gates) {
  const [x0, z0, x1, z1] = rect, H = 2.7, T = 0.14;
  const runs = [];
  const cut = (lo, hi, holes) => { let segs = [[lo, hi]]; for (const [a, b] of holes) segs = segs.flatMap(([p, q]) => (b <= p || a >= q ? [[p, q]] : [[p, a], [b, q]].filter(([m, n]) => n - m > 0.3))); return segs; };
  const hs = gates.filter((g) => g.side === 's').map((g) => [g.at - GATE_W / 2, g.at + GATE_W / 2]);
  const he = gates.filter((g) => g.side === 'e').map((g) => [g.at - GATE_W / 2, g.at + GATE_W / 2]);
  for (const [a, b] of cut(x0, x1, [])) runs.push([a, z0 - T / 2, b, z0 + T / 2]);                 // north
  for (const [a, b] of cut(x0, x1, hs)) runs.push([a, z1 - T / 2, b, z1 + T / 2]);                 // south
  runs.push([x0 - T / 2, z0, x0 + T / 2, z1]);                                                      // west
  for (const [a, b] of cut(z0, z1, he)) runs.push([x1 - T / 2, a, x1 + T / 2, b]);                 // east
  for (const r of runs) {
    bag.add('granite_grey', box(r[0] - 0.05, y0, r[1] - 0.05, r[2] + 0.05, y0 + 0.35, r[3] + 0.05));
    bag.add('wood_dark', box(r[0], y0 + 0.35, r[1], r[2], y0 + H, r[3]));
    bag.add('timber', box(r[0] - 0.05, y0 + H, r[1] - 0.05, r[2] + 0.05, y0 + H + 0.08, r[3] + 0.05));
    col.rect(r, y0, y0 + H + 0.08);
    const alongX = r[2] - r[0] > r[3] - r[1], L = alongX ? r[2] - r[0] : r[3] - r[1];
    for (let t = 0; t <= L + 0.01; t += Math.max(1.8, L / Math.round(L / 2.4))) { const px = alongX ? r[0] + Math.min(t, L) : (r[0] + r[2]) / 2, pz = alongX ? (r[1] + r[3]) / 2 : r[1] + Math.min(t, L); bag.add('timber', box(px - 0.1, y0 + 0.35, pz - 0.1, px + 0.1, y0 + H + 0.05, pz + 0.1)); }
  }
}
/** A gate's posts and the beam over it with a hanging red cloth valance and a board. */
function gateway(bag, col, y0, g, rect) {
  const [x0, z0, x1, z1] = rect, h = 3.9, W = GATE_W;
  const at = (a) => (g.side === 's' ? [a, z1] : [x1, a]);
  for (const s of [-1, 1]) { const [px, pz] = at(g.at + s * W / 2); bag.add('granite_grey', box(px - 0.3, y0, pz - 0.3, px + 0.3, y0 + 0.45, pz + 0.3)); bag.add('lacquer_red', rod([px, y0 + 0.45, pz], [px, y0 + h, pz], 0.15, 8)); col.circle(px, pz, 0.3, y0, y0 + h); }
  const [ax, az] = at(g.at - W / 2 - 0.4), [bx, bz] = at(g.at + W / 2 + 0.4);
  bag.add('lacquer_red', box(Math.min(ax, bx) - (g.side === 'e' ? 0.15 : 0), y0 + h, Math.min(az, bz) - (g.side === 's' ? 0.15 : 0), Math.max(ax, bx) + (g.side === 'e' ? 0.15 : 0), y0 + h + 0.3, Math.max(az, bz) + (g.side === 's' ? 0.15 : 0)));
  // the board over the gate, black with a white rim and white strokes; the red valance under the beam, scalloped
  const mid = at(g.at), alongX = g.side === 's';
  const bw = 2.6, bh = 0.7, by = y0 + h + 0.34;
  if (alongX) { bag.add('lacquer_black', box(mid[0] - bw / 2, by, mid[1] - 0.05, mid[0] + bw / 2, by + bh, mid[1] + 0.05)); bag.add('paint_white', box(mid[0] - bw / 2 + 0.05, by + 0.05, mid[1] + 0.05, mid[0] + bw / 2 - 0.05, by + bh - 0.05, mid[1] + 0.058)); bag.add('lacquer_black', box(mid[0] - bw / 2 + 0.1, by + 0.1, mid[1] + 0.058, mid[0] + bw / 2 - 0.1, by + bh - 0.1, mid[1] + 0.066)); for (let k = 0; k < 2; k++) bag.add('paint_white', box(mid[0] - 0.8 + k * 1.0, by + 0.17, mid[1] + 0.066, mid[0] - 0.2 + k * 1.0, by + bh - 0.17, mid[1] + 0.074)); }
  else { bag.add('lacquer_black', box(mid[0] - 0.05, by, mid[1] - bw / 2, mid[0] + 0.05, by + bh, mid[1] + bw / 2)); bag.add('paint_white', box(mid[0] - 0.058, by + 0.05, mid[1] - bw / 2 + 0.05, mid[0] - 0.05, by + bh - 0.05, mid[1] + bw / 2 - 0.05)); bag.add('lacquer_black', box(mid[0] - 0.066, by + 0.1, mid[1] - bw / 2 + 0.1, mid[0] - 0.058, by + bh - 0.1, mid[1] + bw / 2 - 0.1)); for (let k = 0; k < 2; k++) bag.add('paint_white', box(mid[0] - 0.074, by + 0.17, mid[1] - 0.8 + k * 1.0, mid[0] - 0.066, by + bh - 0.17, mid[1] - 0.2 + k * 1.0)); }
  for (let i = 0; i < 6; i++) {
    const t = (i + 0.5) / 6, a = g.at - W / 2 + W * t, [vx, vz] = at(a);
    if (alongX) bag.add('cloth_red', fromTriangles([vx - 0.3, y0 + h, vz, vx + 0.3, y0 + h, vz, vx, y0 + h - 0.45, vz, vx - 0.3, y0 + h, vz, vx, y0 + h - 0.45, vz, vx + 0.3, y0 + h, vz]));
    else bag.add('cloth_red', fromTriangles([vx, y0 + h, vz - 0.3, vx, y0 + h, vz + 0.3, vx, y0 + h - 0.45, vz, vx, y0 + h, vz - 0.3, vx, y0 + h - 0.45, vz, vx, y0 + h, vz + 0.3]));
  }
  void x0; void z0;
}
/** A bench of the audience: a plank 2.2 × 0.3 on four legs with a stretcher. */
function bench(bag, x, y, z, len = 2.2) {
  bag.add('timber', box(x - len / 2, y + 0.42, z - 0.15, x + len / 2, y + 0.46, z + 0.15));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) bag.add('wood_dark', box(x + sx * (len / 2 - 0.12) - 0.025, y, z + sz * 0.1 - 0.025, x + sx * (len / 2 - 0.12) + 0.025, y + 0.42, z + sz * 0.1 + 0.025));
  bag.add('wood_dark', box(x - len / 2 + 0.1, y + 0.17, z - 0.015, x + len / 2 - 0.1, y + 0.2, z + 0.015));
}

/** The geometry of the theatre in the rect's frame: where the stage stands etc. is a function of the rect (kept in `wazi()` so the plans find the same places). */
export function wazi(rect = WAZI.rect) {
  const [x0, z0, x1, z1] = rect, cx = 72;
  const stage = { rect: [cx - 7, z0 + 0.6, cx + 7, z0 + 8.6], h: 1.15, steps: [cx - 1.5, cx + 1.5] };
  const gal = { w: [x0 + 0.7, z0 + 9.2, x0 + 6.0, z0 + 20.0], e: [x1 - 6.0, z0 + 9.2, x1 - 0.7, z0 + 20.0] };
  // the audience's benches: five rows, split by the central aisle
  const benches = [];
  for (let r = 0; r < 5; r++) for (const side of [-1, 1]) for (let k = 0; k < 2; k++) benches.push([cx + side * (1.4 + 1.2 + k * 2.4 + 0.1) - side * 0, z0 + 10.2 + r * 1.55, 2.2]);
  const aisle = [cx - 1.3, cx + 1.3];
  const stalls = [[x0 + 4.2, z1 - 1.8], [x0 + 8.4, z1 - 1.8], [cx + 6.5, z1 - 1.8], [cx + 10.7, z1 - 1.8]];
  const ring = { c: [x0 + 8, z1 - 7.6], r: 3.2 };            // the storyteller's ring
  const booth = [x1 - 4.4, z1 - 6.4];                          // the puppeteer's booth
  return { stage, gal, benches, aisle, stalls, ring, booth, cx };
}

function hzWazi(el, { bag, col }) {
  const rect = el.rect, y0 = el.y ?? 0, W = wazi(rect), { stage, gal, benches, cx } = W, [x0, z0, x1, z1] = rect, rand = rng(el.seed || 7);
  fence(bag, col, y0, rect, el.gates ?? WAZI.gates);
  for (const g of el.gates ?? WAZI.gates) gateway(bag, col, y0, g, rect);
  // ---- the stage (the 勾栏: the name is "railings"): a platform of planks, the railing round its front and sides, the roof on six posts, the back wall with its two curtained doors
  const [sx0, sz0, sx1, sz1] = stage.rect, sh = stage.h, yd = y0 + sh;
  bag.add('granite_grey', box(sx0 - 0.1, y0 - 0.2, sz0 - 0.1, sx1 + 0.1, y0 + 0.3, sz1 + 0.1));
  bag.add('wood_dark', box(sx0, y0 + 0.3, sz0, sx1, yd - 0.07, sz1));
  bag.add('timber', box(sx0 - 0.02, yd - 0.07, sz0 - 0.02, sx1 + 0.02, yd, sz1 + 0.02));
  for (let x = sx0 + 1.0; x < sx1; x += 1.0) bag.add('wood_dark', box(x - 0.006, yd, sz0, x + 0.006, yd + 0.003, sz1));                       // plank joints
  col.rect([sx0, sz0, sx1, sz1], y0 - 0.2, yd - 0.05);
  col.floor([sx0, sz0, sx1, sz1], yd);
  // the front fascia: a red band with a gilt line, a scalloped valance of red cloth hung from it
  bag.add('lacquer_red', box(sx0, y0 + 0.5, sz1 + 0.012, sx1, yd - 0.08, sz1 + 0.03));
  bag.add('gilt_bronze', box(sx0, y0 + 0.62, sz1 + 0.03, sx1, y0 + 0.66, sz1 + 0.04));
  // three steps in the middle of the front
  for (let k = 1; k <= 3; k++) { const top = y0 + 0.383 * k, d = 0.42 * (4 - k), r = [stage.steps[0], sz1 + 0.03, stage.steps[1], sz1 + 0.03 + d]; bag.add('granite_grey', box(r[0], y0 - 0.05, r[1], r[2], top, r[3])); col.floor(r, top); }
  // the railing: posts every 1.4 m with lotus caps, two red rails, open at the steps
  const rail = (ax, az, bx, bz) => {
    const n = Math.max(1, Math.round(Math.hypot(bx - ax, bz - az) / 1.4));
    for (let i = 0; i <= n; i++) { const t = i / n, px = ax + (bx - ax) * t, pz = az + (bz - az) * t; if (px > stage.steps[0] - 0.2 && px < stage.steps[1] + 0.2 && Math.abs(pz - sz1) < 0.3) continue; bag.add('lacquer_red', rod([px, yd, pz], [px, yd + 0.95, pz], 0.045, 6)); bag.add('gilt_bronze', ly([[0.001, 0], [0.06, 0.02], [0.05, 0.08], [0.001, 0.1]], 6, px, yd + 0.95, pz)); }
    for (const h of [0.45, 0.82]) bag.add('lacquer_red', box(Math.min(ax, bx) - 0.02, yd + h, Math.min(az, bz) - 0.02, Math.max(ax, bx) + 0.02, yd + h + 0.05, Math.max(az, bz) + 0.02));
  };
  rail(sx0 + 0.15, sz1 - 0.15, stage.steps[0] - 0.25, sz1 - 0.15); rail(stage.steps[1] + 0.25, sz1 - 0.15, sx1 - 0.15, sz1 - 0.15);
  rail(sx0 + 0.15, sz0 + 0.3, sx0 + 0.15, sz1 - 0.15); rail(sx1 - 0.15, sz0 + 0.3, sx1 - 0.15, sz1 - 0.15);
  // the roof: six posts, the beams, brackets under the eave, a gable (xuanshan) of dark tiles with a ridge of lighter ones
  const hp = 3.9, yw = yd + hp;
  for (const px of [sx0 + 0.35, sx0 + (sx1 - sx0) / 3 + 0.2, sx0 + 2 * (sx1 - sx0) / 3 - 0.2, sx1 - 0.35]) {
    for (const pz of [sz1 - 0.45, sz0 + 0.4]) { bag.add('granite_grey', ly([[0.001, 0], [0.24, 0], [0.2, 0.12], [0.001, 0.12]], 8, px, yd, pz)); bag.add('lacquer_red', rod([px, yd + 0.12, pz], [px, yw, pz], 0.13, 8)); col.circle(px, pz, 0.15, yd, yw); }
  }
  for (const pz of [sz1 - 0.45, sz0 + 0.4]) { bag.add('lacquer_red', box(sx0 + 0.2, yw - 0.4, pz - 0.12, sx1 - 0.2, yw, pz + 0.12)); bag.add('lacquer_red', box(sx0 + 0.2, yw - 0.75, pz - 0.05, sx1 - 0.2, yw - 0.65, pz + 0.05)); }
  for (const px of [sx0 + 0.35, sx1 - 0.35]) bag.add('lacquer_red', box(px - 0.12, yw - 0.4, sz0 + 0.4, px + 0.12, yw, sz1 - 0.45));
  for (let x = sx0 + 0.9; x < sx1 - 0.5; x += 1.35) for (const pz of [sz1 - 0.45]) { bag.add('timber', box(x - 0.06, yw - 0.02, pz - 0.5, x + 0.06, yw + 0.12, pz + 0.1)); bag.add('timber', box(x - 0.1, yw - 0.1, pz - 0.2, x + 0.1, yw - 0.02, pz + 0.16)); }
  gableRoof(bag, [sx0 - 0.1, sz0 - 0.3, sx1 + 0.1, sz1 + 0.2], yw, 1.9, 1.2, true, 'plaster_white');
  // a board of the theatre's name under the ridge front, black with a white border
  bag.add('lacquer_black', box(cx - 1.6, yw - 0.02 + 0.05, sz1 + 0.3 - 0.0, cx + 1.6, yw + 0.7, sz1 + 0.34));
  bag.add('paint_white', box(cx - 1.55, yw + 0.1, sz1 + 0.34, cx + 1.55, yw + 0.65, sz1 + 0.348));
  bag.add('lacquer_black', box(cx - 1.48, yw + 0.17, sz1 + 0.348, cx + 1.48, yw + 0.58, sz1 + 0.356));
  for (let k = 0; k < 2; k++) bag.add('paint_white', box(cx - 1.0 + k * 1.1, yw + 0.22, sz1 + 0.356, cx - 0.2 + k * 1.1, yw + 0.53, sz1 + 0.364));
  // the back wall (planks) with two doorways at the ends — "go out as a general, come in as a minister" (出将入相) — each with a curtain, and red hangings between
  const bz = sz0 + 0.1;
  const pieces = [[sx0 + 0.1, sx0 + 1.55], [sx0 + 3.35, sx1 - 3.35], [sx1 - 1.55, sx1 - 0.1]];
  for (const [a, b] of pieces) { bag.add('wood_dark', box(a, yd, bz, b, yw - 0.4, bz + 0.15)); col.rect([a, bz, b, bz + 0.15], yd, yw); }
  for (const dx of [sx0 + 2.45, sx1 - 2.45]) { bag.add('wood_dark', box(dx - 0.95, yw - 1.1, bz, dx + 0.95, yw - 0.4, bz + 0.15)); for (const q of [0, 1]) bag.add(q ? 'cloth_indigo' : 'cloth_red', box(dx - 0.9 + q * 0.9, yd + 0.05, bz + 0.16, dx - 0.0 + q * 0.9 - (q ? 0.0 : 0.0), yd + 2.5 - 0.05 * q, bz + 0.185)); }
  for (const [i, c] of ['cloth_red', 'cloth_ochre', 'cloth_red'].entries()) { const a = sx0 + 4.0 + i * 2.0; bag.add(c, box(a, yd + 0.5, bz + 0.16, a + 1.75, yw - 0.9, bz + 0.18)); bag.add('gilt_bronze', box(a + 0.08, yd + 0.58, bz + 0.18, a + 1.67, yd + 0.62, bz + 0.186)); }
  for (const s of [-1, 1]) { const px = s < 0 ? sx0 + 0.1 : sx1 - 0.1; bag.add('wood_dark', box(px - 0.075, yd, sz0 + 0.1, px + 0.075, yw - 0.4, sz0 + 2.8)); col.rect([px - 0.075, sz0 + 0.1, px + 0.075, sz0 + 2.8], yd, yw); }
  // a tall bamboo pole with a long red pennant at each front corner of the stage and a pair of lanterns on the eave
  for (const px of [sx0 - 0.9, sx1 + 0.9]) {
    bag.add('bamboo_culm', rod([px, y0, sz1 + 0.8], [px, y0 + 8.2, sz1 + 0.8], 0.05, 6)); col.circle(px, sz1 + 0.8, 0.1, y0, y0 + 8);
    bag.add('cloth_red', fromTriangles([px, y0 + 8.0, sz1 + 0.8, px + (px < cx ? 0.05 : -0.05), y0 + 8.0, sz1 + 0.8 + 0.01, px, y0 + 4.9, sz1 + 0.8, px, y0 + 8.0, sz1 + 0.8, px, y0 + 4.9, sz1 + 0.8, px + (px < cx ? 0.05 : -0.05), y0 + 8.0, sz1 + 0.8 + 0.01]));
    bag.add('cloth_red', box(px - 0.01, y0 + 5.0, sz1 + 0.8 - 0.4, px + 0.01, y0 + 8.0, sz1 + 0.8));
    bag.add('cloth_white', box(px - 0.012, y0 + 5.3, sz1 + 0.8 - 0.4, px + 0.012, y0 + 5.9, sz1 + 0.8));
  }
  for (let x = sx0 + 1.2; x < sx1; x += 2.3) lamp(bag, x, yw - 0.5, sz1 + 0.2, 1.1);
  // ---- the bleachers on both sides (腰棚: the raised seats along the theatre's sides): two tiers of plank seats under a lean-to roof on posts
  for (const [side, r] of [[-1, gal.w], [1, gal.e]]) {
    const [gx0, gz0, gx1, gz1] = r, inner = side < 0 ? gx1 : gx0, outer = side < 0 ? gx0 : gx1;
    const t1 = [Math.min(inner, inner - side * 2.6), gz0, Math.max(inner, inner - side * 2.6), gz1], t2 = [Math.min(outer, outer + side * 2.7), gz0, Math.max(outer, outer + side * 2.7), gz1];
    const a = (q) => [Math.min(q[0], q[2]), q[1], Math.max(q[0], q[2]), q[3]];
    const R1 = a([inner, gz0, inner - side * 2.7, gz1]), R2 = a([inner - side * 2.7, gz0, outer, gz1]);
    void t1; void t2;
    bag.add('wood_dark', box(R1[0], y0, R1[1], R1[2], y0 + 0.5, R1[3])); bag.add('timber', box(R1[0], y0 + 0.5, R1[1], R1[2], y0 + 0.55, R1[3])); col.rect(R1, y0, y0 + 0.55);
    bag.add('wood_dark', box(R2[0], y0, R2[1], R2[2], y0 + 1.0, R2[3])); bag.add('timber', box(R2[0], y0 + 1.0, R2[1], R2[2], y0 + 1.05, R2[3])); col.rect(R2, y0, y0 + 1.05);
    // posts at the front edge and a roof sloping back to the fence
    const fx = inner, bx = outer;
    for (let z = gz0 + 0.3; z <= gz1 + 0.01; z += (gz1 - gz0 - 0.6) / 4) { bag.add('lacquer_red', rod([fx, y0 + 0.55, z], [fx, y0 + 3.5, z], 0.09, 6)); col.circle(fx, z, 0.1, y0, y0 + 3.5); }
    bag.add('lacquer_red', box(Math.min(fx, bx) - 0.0, y0 + 3.35, gz0, Math.max(fx, bx), y0 + 3.5, gz0 + 0.12)); bag.add('lacquer_red', box(Math.min(fx, bx), y0 + 3.35, gz1 - 0.12, Math.max(fx, bx), y0 + 3.5, gz1));
    bag.add('lacquer_red', box(fx - 0.1, y0 + 3.4, gz0, fx + 0.1, y0 + 3.55, gz1));
    const hi = 4.7, lo = 3.5, o = 0.5, ex = fx - side * -0.0;
    const A = [fx + side * -o * -1 * -0.0, 0];
    void A; void ex;
    const f = fx + (side < 0 ? 0.6 : -0.6) * -1, b = bx;          // roof from the front edge (low) to the fence (high)
    const tri = [], dn = [];
    const P = (x, y, z) => [x, y, z];
    const fe = side < 0 ? fx + 0.7 : fx - 0.7;                   // the eave overhangs the aisle by 0.7 m
    const q = [P(fe, y0 + lo - 0.2, gz0 - 0.3), P(b, y0 + hi, gz0 - 0.3), P(b, y0 + hi, gz1 + 0.3), P(fe, y0 + lo - 0.2, gz1 + 0.3)];
    tri.push(...q[0], ...q[1], ...q[2], ...q[0], ...q[2], ...q[3]); dn.push(...q[0], ...q[2], ...q[1], ...q[0], ...q[3], ...q[2]);
    const up = side < 0 ? 1 : -1;
    void up;
    // normals: whichever way they were wound, both faces are laid, the top one tiled and the underside timber
    bag.add('tile_dark', fromTriangles(tri)); bag.add('tile_dark', fromTriangles(dn));
    void f;
    // the gentry's seats at the front (lantern-back chairs would stand here; benches serve the rest): a bench on each tier
    for (let z = gz0 + 1.2; z < gz1 - 0.8; z += 2.5) { bench(bag, (R1[0] + R1[2]) / 2 + 0.0, y0 + 0.55, z, 2.2); }
    for (let z = gz0 + 1.2; z < gz1 - 0.8; z += 2.5) bench(bag, (R2[0] + R2[2]) / 2, y0 + 1.05, z, 2.2);
  }
  // ---- the audience's benches in the open before the stage
  for (const [bx, bz, len] of benches) bench(bag, bx, y0, bz, len);
  // ---- the puppeteer's booth (a frame hung with red cloth, a little stage opening high up) and the storyteller's table with its stool
  const [px, pz] = W.booth;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) bag.add('bamboo_culm', rod([px + sx * 0.8, y0, pz + sz * 0.6], [px + sx * 0.8, y0 + 2.5, pz + sz * 0.6], 0.04, 5));
  bag.add('cloth_red', box(px - 0.84, y0, pz + 0.6, px + 0.84, y0 + 1.4, pz + 0.64)); bag.add('cloth_red', box(px - 0.84, y0, pz - 0.64, px + 0.84, y0 + 2.5, pz - 0.6));
  bag.add('cloth_red', box(px - 0.84, y0, pz - 0.64, px - 0.8, y0 + 2.5, pz + 0.64)); bag.add('cloth_red', box(px + 0.8, y0, pz - 0.64, px + 0.84, y0 + 2.5, pz + 0.64));
  bag.add('cloth_ochre', box(px - 0.9, y0 + 2.5, pz - 0.7, px + 0.9, y0 + 2.56, pz + 0.7));
  bag.add('cloth_indigo', box(px - 0.84, y0 + 1.4, pz + 0.6, px + 0.84, y0 + 1.95, pz + 0.64)); bag.add('paint_white', box(px - 0.5, y0 + 1.5, pz + 0.64, px + 0.5, y0 + 1.85, pz + 0.645));
  bag.add('cloth_red', box(px - 0.84, y0 + 1.95, pz + 0.6, px + 0.84, y0 + 2.5, pz + 0.64));
  col.rect([px - 0.9, pz - 0.7, px + 0.9, pz + 0.7], y0, y0 + 2.5);
  const [rx, rz] = W.ring.c;
  bag.add('timber', box(rx - 0.55, y0 + 0.72, rz - 0.3, rx + 0.55, y0 + 0.78, rz + 0.3));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) bag.add('wood_dark', box(rx + sx * 0.5 - 0.03, y0, rz + sz * 0.25 - 0.03, rx + sx * 0.5 + 0.03, y0 + 0.72, rz + sz * 0.25 + 0.03));
  bag.add('cloth_indigo', box(rx - 0.56, y0 + 0.5, rz + 0.3, rx + 0.56, y0 + 0.78, rz + 0.32));
  bag.add('wood_dark', box(rx - 0.07, y0 + 0.78, rz - 0.08, rx + 0.07, y0 + 0.86, rz + 0.04));                                   // the block (醒木)
  bag.add('timber', box(rx + 0.25, y0 + 0.78, rz - 0.12, rx + 0.55, y0 + 0.795, rz + 0.12));                                      // a folded fan
  col.rect([rx - 0.6, rz - 0.34, rx + 0.6, rz + 0.34], y0, y0 + 0.8);
  // a banner pole by the storyteller's ring and one by each gate
  for (const [bx, bz, h, c] of [[rx - 2.2, rz - 1.2, 5.2, 'cloth_white'], [rx + 1.9, rz + 1.1, 4.6, 'cloth_ochre']]) { bag.add('bamboo_culm', rod([bx, y0, bz], [bx, y0 + h, bz], 0.04, 5)); bag.add(c, box(bx - 0.008, y0 + h - 1.8, bz - 0.55, bx + 0.008, y0 + h - 0.15, bz)); col.circle(bx, bz, 0.08, y0, y0 + h); }
  void rand;
}

Object.assign(STYLES.song.elements, { hz_wazi: hzWazi, hz_span: span, hz_fanggate: fangGate });

// ── the plans ───────────────────────────────────────────────────────────────────────────────────────
const CLOTH = ['cloth_indigo', 'cloth_white', 'cloth_grey', 'cloth_brown', 'cloth_white', 'cloth_black', 'cloth_green'];
const faceTo = ([dx, dz]) => Math.atan2(-dx, -dz);
/** The static plans of the three kinds (the wazi's frame, the sunshades over the Way, the ward gates): [{ t, … }] for the town's `base()`. */
export function wazisStatic(y0 = 0) {
  const S = [];
  S.push({ t: 'hz_wazi', rect: WAZI.rect, gates: WAZI.gates, y: y0, seed: 11 });
  S.push({ t: 'paving', rect: WAZI.rect, y: y0 + 0.04, th: 0.3 });
  const x0 = IMPERIAL[0] + 2.2, x1 = IMPERIAL[2] - 2.2;
  spans().forEach((s, i) => S.push({ t: 'hz_span', x0, x1, z: s.z, y: 5.5, kind: s.kind, seed: 40 + i }));
  fangGates().forEach((g, i) => S.push({ t: 'hz_fanggate', at: g.at, y: y0, seed: 90 + i }));
  return S;
}
/** The life of the wazi: the performers on the stage (a storyteller-singer, a drummer, a flautist, a lutenist, a dancer), the audience on benches and bleachers, the standing crowd, the stalls and the storyteller's ring. */
export function waziLife(y0 = 0) {
  const L = [], rand = rng(5150), pick = (a) => a[Math.floor(rand() * a.length)], seed = () => Math.floor(rand() * 1e9);
  const W = wazi(), { stage, gal, benches, cx } = W, [x0, z0, x1, z1] = WAZI.rect, yd = y0 + stage.h;
  const person = (at, y, rot, extra = {}) => L.push({ t: 'figure', at, y, rot, seed: seed(), dress: rand() < 0.72 ? 'robe' : 'trousers', cloth: pick(CLOTH), cloth2: pick(CLOTH), skin: rand() < 0.8 ? 'skin_light' : 'skin_medium', hat: pick(['none', 'cap', 'cap', 'straw']), carry: 'none', ...extra });
  const south = faceTo([0, 1]), north = faceTo([0, -1]);
  // on the stage: the players in the bright colours the audience came for (the edict's black and white was for the street, not the stage [inferred])
  const [sx0, sz0, sx1, sz1] = stage.rect;
  person([cx - 0.4, sz1 - 2.2], yd, south, { pose: 'folk', dress: 'robe', cloth: 'cloth_red', cloth2: 'cloth_ochre', hat: 'cap', skin: 'skin_light' });
  person([cx + 1.8, sz1 - 2.8], yd, south + 0.3, { pose: 'talk', dress: 'robe', cloth: 'cloth_green', cloth2: 'cloth_white', hat: 'cap' });
  person([cx - 3.0, sz0 + 1.6], yd, south, { pose: 'drum', dress: 'robe', cloth: 'cloth_indigo', hat: 'none' });
  person([cx + 3.2, sz0 + 1.6], yd, south, { pose: 'flute', dress: 'robe', cloth: 'cloth_brown', hat: 'cap' });
  person([cx + 5.0, sz0 + 1.8], yd, south - 0.3, { pose: 'lute', dress: 'robe', cloth: 'cloth_white', cloth2: 'cloth_red', hat: 'none', hair: 'bun', woman: true });
  person([cx - 5.2, sz0 + 1.8], yd, south + 0.3, { pose: 'sit', dress: 'robe', cloth: 'cloth_black', hat: 'cap' });
  // the benches: people seated along them facing the stage (one place in three left empty), children on the front row
  benches.forEach(([bx, bz, len], bi) => {
    for (let k = 0; k < 4; k++) if (rand() < 0.72) person([bx - len / 2 + 0.35 + k * (len - 0.7) / 3, bz + 0.0], y0, north, { pose: 'sit', child: bz < z0 + 11 && rand() < 0.3 });
    void bi;
  });
  // the bleachers: two tiers each side, a bench's worth of people on each, turned toward the stage
  for (const [side, r] of [[-1, gal.w], [1, gal.e]]) {
    const inner = side < 0 ? r[2] : r[0], outer = side < 0 ? r[0] : r[2];
    for (const [xx, yy] of [[inner - side * 1.35, y0 + 0.55], [(inner - side * 2.7 + outer) / 2, y0 + 1.05]]) {
      for (let z = r[1] + 1.2; z < r[3] - 0.8; z += 2.5) for (let k = 0; k < 3; k++) if (rand() < 0.75) person([xx, z - 0.7 + k * 0.7], yy, faceTo([-side * 0.8, -0.5]), { pose: 'sit', dress: 'robe', cloth: pick(['cloth_green', 'cloth_red', 'cloth_indigo', 'cloth_white', 'cloth_ochre']), hat: pick(['cap', 'cap', 'none']), woman: rand() < 0.35 });
    }
  }
  // the crowd standing behind the benches and about the gates
  for (let k = 0; k < 16; k++) person([cx - 6.5 + rand() * 13, z0 + 17.8 + rand() * 2.2], y0, north + (rand() - 0.5) * 0.7, { pose: rand() < 0.3 ? 'talk' : 'stand', carry: rand() < 0.2 ? pick(['basket', 'child']) : 'none' });
  // the storyteller (a man in a long robe with a fan) and his ring of listeners sitting on stools and the ground
  const [rx, rz] = W.ring.c;
  person([rx, rz - 0.85], y0, south, { pose: 'talk', dress: 'robe', cloth: 'cloth_grey', cloth2: 'cloth_black', hat: 'cap' });
  for (let k = 0; k < 9; k++) { const a = Math.PI * (0.15 + 0.7 * k / 8) + 0.0, d = 2.0 + (k % 2) * 0.7, p = [rx + Math.cos(a) * d * 1.1, rz + 0.3 + Math.sin(a) * d * 0.9]; person(p, y0, faceTo([rx - p[0], rz - 0.8 - p[1]]), { pose: k % 3 === 0 ? 'sit_ground' : 'stand', child: k % 4 === 1 }); }
  // the puppeteer behind his booth and the children before it
  const [bx, bz] = W.booth;
  person([bx, bz - 0.0], y0, south, { pose: 'stand', dress: 'trousers', cloth: 'cloth_brown', hat: 'none' });
  for (let k = 0; k < 5; k++) person([bx - 1.4 + k * 0.7, bz + 1.5 + (k % 2) * 0.5], y0, north, { pose: 'sit_ground', child: true });
  // the stalls along the south fence (tea, sweet cakes, pickled fruit, flowers) with their keepers, and customers
  const goods = [['produce', 'basket'], ['dark_pot', 'water_pot', 'basket'], ['cloth', 'basket'], ['produce', 'produce', 'basket']];
  W.stalls.forEach(([sx, sz], i) => {
    L.push({ t: 'stall', at: [sx, sz], y: y0, rot: Math.PI, w: 2.6, d: 1.3, awning: pick(['cloth_white', 'cloth_indigo', 'cloth_ochre', 'cloth_red']), stripe: i % 2 ? pick(['cloth_red', 'cloth_indigo']) : undefined, goods: goods[i % 4], seed: seed() });
    person([sx + (rand() - 0.5) * 0.8, sz + 0.95], y0, north, { pose: 'stand', dress: 'trousers', hat: 'cap' });
    if (rand() < 0.8) person([sx + (rand() - 0.5) * 1.2, sz - 1.6], y0, south + (rand() - 0.5) * 0.4, { pose: rand() < 0.5 ? 'talk' : 'stand', carry: rand() < 0.3 ? 'basket' : 'none' });
  });
  // the lanterns along the theatre's front eave and two baskets of peanuts and lotus roots at the gates
  for (let x = sx0 + 1.2; x < sx1; x += 2.3) L.push({ t: 'hang_lantern', at: [x, sz1 + 0.2], y: yd + 3.4, rot: 0, kind: 'paper', seed: 1 });
  for (const g of WAZI.gates) { const p = g.side === 's' ? [g.at + 2.6, z1 - 1.0] : [x1 - 1.0, g.at + 2.6]; L.push({ t: 'basket', at: p, y: y0, rot: 0.4, n: 2, seed: seed() }); person([p[0] + (g.side === 's' ? 0.5 : 0.0), p[1] + (g.side === 's' ? 0.0 : 0.5)], y0, g.side === 's' ? north : faceTo([1, 0]), { pose: 'squat', dress: 'trousers', hat: 'straw' }); }
  return L;
}
