// Maya–Toltec architecture of Chichén Itzá (10th–11th c.; docs/settlements/chichen-itza.md §4–§5):
// stepped pyramids of terraces each with a sloping base and a vertical panel, stairs with
// balustrades ending in serpent heads, temples on top with doorways divided by serpent columns,
// lime plaster painted red; colonnades of square pillars carved with warriors under flat beamed
// roofs; the ball court with its high walls, benches and stone rings; low platforms with stairs on
// four sides; raised white roads (sacbe); in the town, oval houses of rubble and wattle under
// steep palm thatch, their lots enclosed by dry-stone walls.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, lathe, fromTriangles } from '../../core/geom.js';
import '../qing/index.js';
import { beamTris, flipTris } from '../ming/index.js';
import { serpentHeadKit, chaacKit, chacmoolKit, Kit } from './meso.js';

const L = 'limestone_maya';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** A frustum over a square or rectangle: from half-sizes (a0, b0) at y0 to (a1, b1) at y1, centred at (cx, cz). */
function frust(bag, mat, cx, cz, a0, b0, a1, b1, y0, y1) {
  const B = [[-a0, -b0], [a0, -b0], [a0, b0], [-a0, b0]], T = [[-a1, -b1], [a1, -b1], [a1, b1], [-a1, b1]], t = [];
  const P = (q, y) => [cx + q[0], y, cz + q[1]];
  for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; t.push(...P(B[i], y0), ...P(T[i], y1), ...P(T[j], y1), ...P(B[i], y0), ...P(T[j], y1), ...P(B[j], y0)); }
  t.push(...P(T[0], y1), ...P(T[3], y1), ...P(T[2], y1), ...P(T[0], y1), ...P(T[2], y1), ...P(T[1], y1));
  bag.add(mat, fromTriangles(t.concat(flipTris(t))));
}

/** A feathered serpent's head at the foot of a balustrade, its jaws facing out along dir, the back of its block at (x, z) (meso.js). */
function serpentHead(bag, x, z, dir, y, s = 1, opts) {
  const [dx, dz] = dir;
  serpentHeadKit(opts).emit(bag, x - dx * 0.3 * s, y, z - dz * 0.3 * s, dx, dz, s);
}

/**
 * m_pyramid: a stepped pyramid { c, base (half-size at the foot), top (half-size at the top),
 * h, tiers, stairs ('nesw' — which sides have a stairway), stairW, serpents (sides with serpent
 * heads), temple: { w, d, h, doors } on top }. Each tier: a sloping base and a vertical panel set
 * a little in; the stairs climb the whole height between balustrades.
 */
function mPyramid(el, { bag, col }) {
  const [cx, cz] = el.c, n = el.tiers, H = el.h, A0 = el.base, A1 = el.top, sw = (el.stairW ?? 8.8) / 2;
  const th = H / n;
  for (let k = 0; k < n; k++) {
    // each tier: a sloping base, a vertical panel with a moulding, and a ledge before the next
    const a0 = A0 - (A0 - A1) * k / n, a1 = A0 - (A0 - A1) * (k + 1) / n, y0 = k * th, step = a0 - a1;
    const ap = a0 - step * 0.42;
    frust(bag, L, cx, cz, a0, a0, ap, ap, y0, y0 + th * 0.55);                                                    // the talud
    frust(bag, L, cx, cz, ap, ap, ap - step * 0.04, ap - step * 0.04, y0 + th * 0.55, y0 + th * 0.9);             // the panel
    frust(bag, L, cx, cz, ap + step * 0.06, ap + step * 0.06, ap + step * 0.06, ap + step * 0.06, y0 + th * 0.9, y0 + th);   // the moulding
    // the panels on each tier's face: recessed rectangles in a row, the stair's run left clear
    if (!el.simple) {
      const pw = 2.2, py0 = y0 + th * 0.6, py1 = y0 + th * 0.86, d = ap - step * 0.04 + 0.05;
      for (const [fx, fz] of [[0, -1], [0, 1], [1, 0], [-1, 0]]) {
        const m = Math.floor((2 * d) / (pw + 0.9));
        for (let i = 0; i < m; i++) {
          const u = -d + (i + 0.5) * (2 * d) / m;
          if (Math.abs(u) < sw + 1.6) continue;
          const [qx, qz] = fz ? [cx + u, cz + fz * d] : [cx + fx * d, cz + u];
          const t = 0.2, d0 = 0.15, bar = (u0, u1, v0, v1) => bag.add(L, fz ? box(qx + u0, v0, qz - d0, qx + u1, v1, qz + d0) : box(qx - d0, v0, qz + u0, qx + d0, v1, qz + u1));
          bar(-pw / 2, pw / 2, py0, py0 + t); bar(-pw / 2, pw / 2, py1 - t, py1); bar(-pw / 2, -pw / 2 + t, py0 + t, py1 - t); bar(pw / 2 - t, pw / 2, py0 + t, py1 - t);
        }
      }
    }
    col.rect([cx - a0, cz - a0, cx + a0, cz + a0], y0 - 0.3, y0 + th - 0.31);
    col.floor([cx - a1, cz - a1, cx + a1, cz + a1], y0 + th);
  }
  // the stairways and their balustrades; a temple on top
  const sides = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] };
  for (const k of el.stairs || 'nesw') {
    const [dx, dz] = sides[k], nx = -dz, nz = dx;
    const foot = A0 + 1.2, head = A1 - 0.2, steps = el.steps ?? 91;
    // the stair as a sloping mass with treads
    const t = [];
    for (let i = 0; i < steps; i++) {
      const f0 = i / steps, f1 = (i + 1) / steps, d0 = foot - (foot - head) * f0, d1 = foot - (foot - head) * f1, y1 = H * f1;
      const P = (d, o, y) => [cx + dx * d + nx * o, y, cz + dz * d + nz * o];
      const q = [P(d0, -sw, y1), P(d1, -sw, y1), P(d1, sw, y1), P(d0, sw, y1)];
      t.push(...q[0], ...q[3], ...q[2], ...q[0], ...q[2], ...q[1]);                                          // the tread
      const r = [P(d0, -sw, H * f0), P(d0, sw, H * f0), P(d0, sw, y1), P(d0, -sw, y1)];
      t.push(...r[0], ...r[1], ...r[2], ...r[0], ...r[2], ...r[3]);                                          // the riser
    }
    bag.add(L, fromTriangles(t.concat(flipTris(t))));
    // the balustrades: sloping slabs on either side, a serpent head at their foot where asked
    for (const s of [-1, 1]) {
      const b = [], o = s * (sw + 0.6);
      beamTris(b, [cx + dx * (foot + 0.4) + nx * o, 0, cz + dz * (foot + 0.4) + nz * o], [cx + dx * head + nx * o, H, cz + dz * head + nz * o], 0.6, 1.0);
      bag.add(L, fromTriangles(b));
      if ((el.serpents || '').includes(k)) serpentHead(bag, cx + dx * (foot + 1.0) + nx * o, cz + dz * (foot + 1.0) + nz * o, [dx, dz], 0, 1);
    }
    // walking up: a ramp over the stair's footprint
    const r = dx ? [Math.min(cx + dx * foot, cx + dx * head), cz - sw, Math.max(cx + dx * foot, cx + dx * head), cz + sw] : [cx - sw, Math.min(cz + dz * foot, cz + dz * head), cx + sw, Math.max(cz + dz * foot, cz + dz * head)];
    col.ramp(r, 0, H, k === 'n' ? 's' : k === 's' ? 'n' : k === 'e' ? 'w' : 'e');
  }
  if (el.temple) mTemple({ ...el.temple, c: el.c, y: H }, { bag, col });
}

/**
 * A feathered-serpent column (the Castillo's and the Warriors' doorways): the head on the floor with
 * its jaws open toward (dx, dz), the body rising as a square shaft banded with feathers, the rattle
 * tail bent out at the top under the lintel, its rattles turned up.
 */
function serpentColumn(bag, x, z, [dx, dz], y, H) {
  const k = new Kit(), top = H - 0.55;
  k.bx(L, -0.42, 0.42, 0.9, top, -0.42, 0.42);                                                         // the body
  for (let yy = 1.2; yy < top - 0.2; yy += 0.42) {                                                     // the bands of feathers
    k.bx('stucco_red', -0.46, 0.46, yy, yy + 0.12, -0.46, 0.46);
    k.fz(L, [-0.36, 0.36, yy + 0.12, yy + 0.3], [-0.3, 0.3, yy + 0.12, yy + 0.22], 0.42, 0.5);
  }
  k.bx(L, -0.46, 0.46, top, H, -0.6, 0.62);                                                            // the tail, bent out under the lintel
  k.fz(L, [-0.4, 0.4, top + 0.05, H], [-0.32, 0.32, top + 0.12, H], 0.62, 1.2);
  for (let i = 0; i < 4; i++) { const zz = 0.72 + i * 0.13; k.bx('stucco_red', -0.44 + i * 0.02, 0.44 - i * 0.02, top + 0.02, H - 0.03, zz, zz + 0.06); }   // the rattles
  k.emit(bag, x, y, z, dx, dz);
  serpentHead(bag, x + dx * 0.4, z + dz * 0.4, [dx, dz], y, 0.64);
}

/**
 * m_temple: the temple on a pyramid or a platform { c, y, w, d, h, doors (the side of the main
 * doorway: 'n'…), serpentCols, masks (the rain god's masks on the frieze), chacmool }: thick walls of plastered stone, doorways on all four sides (three
 * bays at the front, divided by serpent columns), a frieze, a flat roof with a crest of merlons.
 */
function mTemple(el, { bag, col }) {
  const [cx, cz] = el.c, y = el.y, w = el.w / 2, d = el.d / 2, h = el.h ?? 6, wt = 1.2;
  bag.add(L, box(cx - w - 0.6, y, cz - d - 0.6, cx + w + 0.6, y + 0.4, cz + d + 0.6));
  col.floor([cx - w - 0.6, cz - d - 0.6, cx + w + 0.6, cz + d + 0.6], y + 0.4);
  const wallH = h * 0.62, y1 = y + 0.4, sides = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] };
  // the walls with a doorway in the middle of each (the front with three, between serpent columns)
  for (const [k, a, b] of [['n', [cx - w, cz - d], [cx + w, cz - d]], ['s', [cx + w, cz + d], [cx - w, cz + d]], ['w', [cx - w, cz + d], [cx - w, cz - d]], ['e', [cx + w, cz - d], [cx + w, cz + d]]]) {
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / len, uz = (b[1] - a[1]) / len;
    const front = k === el.doors, door = front ? Math.min(len * 0.6, 7.5) : 2.4;
    for (const [s0, s1] of [[0, (len - door) / 2], [(len + door) / 2, len]]) {
      const p = [a[0] + ux * s0, a[1] + uz * s0], q = [a[0] + ux * s1, a[1] + uz * s1], t = [];
      beamTris(t, [p[0], y1, p[1]], [q[0], y1, q[1]], wt / 2, wallH);
      bag.add('stucco', fromTriangles(t));
      col.segment(p, q, wt, y1, y1 + wallH);
    }
    if (front && el.serpentCols !== false) for (const s of [-1, 1]) {
      const m = len / 2 + s * door / 6, px = a[0] + ux * m, pz = a[1] + uz * m;
      serpentColumn(bag, px, pz, sides[k], y1, wallH);
      col.rect([px - 0.45, pz - 0.45, px + 0.45, pz + 0.45], y1, y1 + wallH);
    }
  }
  // the lintels, the frieze (painted plaster, or stone carved with masks), the roof and its crest
  const fy0 = y1 + wallH, fy1 = y1 + h * 0.9;
  bag.add(el.masks ? L : 'stucco_red', box(cx - w - 0.2, fy0, cz - d - 0.2, cx + w + 0.2, fy1, cz + d + 0.2));
  if (el.masks) {
    // the rain god's long-nosed masks on the corners and the middle of each side (the Temple of the Warriors)
    bag.add('stucco_red', box(cx - w - 0.24, fy0, cz - d - 0.24, cx + w + 0.24, fy0 + 0.16, cz + d + 0.24));
    const ms = (fy1 - fy0 - 0.2) / 1.5, mw = 0.8 * ms;
    for (const k of 'nsew') {
      const [fx, fz] = sides[k], half = fx ? d : w, out = (fx ? w : d) + 0.2;
      for (const u of [-half + mw + 0.05, 0, half - mw - 0.05]) {
        if (u === 0 && k === el.doors) continue;
        const x = fx ? cx + fx * out : cx + u, z = fx ? cz + u : cz + fz * out;
        chaacKit().emit(bag, x, fy0 + 0.18, z, fx, fz, ms);
      }
    }
  } else bag.add('maya_blue', box(cx - w - 0.25, fy0 + 0.5, cz - d - 0.25, cx + w + 0.25, fy0 + 0.8, cz + d + 0.25));
  bag.add(L, box(cx - w - 0.3, fy1, cz - d - 0.3, cx + w + 0.3, y1 + h, cz + d + 0.3));
  for (let i = 0; i < Math.round(w * 2 / 1.2); i++) for (const z of [cz - d, cz + d]) {
    const x = cx - w + 0.6 + i * 1.2;
    bag.add('stucco', box(x - 0.3, y1 + h, z - 0.2, x + 0.3, y1 + h + 0.9, z + 0.2));
  }
  // the chacmool before the main doorway, looking out over the stair
  if (el.chacmool) {
    const [fx, fz] = sides[el.doors], off = (fx ? w : d) + 2.0;
    chacmoolKit().emit(bag, cx + fx * off, y, cz + fz * off, fx, fz, 1);
    col.rect(fx ? [cx + fx * off - 0.4, cz - 0.9, cx + fx * off + 0.4, cz + 0.9] : [cx - 0.9, cz + fz * off - 0.4, cx + 0.9, cz + fz * off + 0.4], y, y + 1);
  }
  col.floor([cx - w - 0.3, cz - d - 0.3, cx + w + 0.3, cz + d + 0.3], y1 + h);
}

/**
 * m_ballcourt: the Great Ball Court { rect (the playing alley: long along z), wallH, bench }: two
 * walls along its long sides with sloping benches at their feet, a stone ring high on each wall's
 * middle, small temples at both ends (north and south), and the Temple of the Jaguars on the east wall.
 */
function mBallcourt(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, H = el.wallH ?? 8.5, bw = el.bench ?? 4.5, T = 11;
  for (const s of [-1, 1]) {
    const xi = s < 0 ? x0 : x1, xo = xi + s * T;                      // the inner face, the outer face
    const [xa, xb] = s < 0 ? [xo, xi] : [xi, xo];
    bag.add(L, box(xa, 0, z0, xb, H, z1));
    col.rect([xa, z0, xb, z1], 0, H);
    col.floor([xa, z0, xb, z1], H);
    // the bench: a sloping band at the wall's foot, carved with processions
    const t = [], xin = xi - s * bw;
    t.push(xin, 0, z0, xin, 0, z1, xi, 1.6, z1, xin, 0, z0, xi, 1.6, z1, xi, 1.6, z0);
    bag.add('rubble', fromTriangles(t.concat(flipTris(t))));
    // the ring: a stone ring standing out from the wall, high up, its hole facing across
    const ry = H - 1.6, zc = (z0 + z1) / 2;
    bag.add(L, lathe([[0.6, -0.15], [1.0, -0.15], [1.0, 0.15], [0.6, 0.15]], 20, null, 0, 0, 0).rotateZ(Math.PI / 2).translate(xi - s * 0.2, ry, zc));
  }
  // the end temples (north and south), on low platforms
  for (const [zc, k] of [[z0 - 8, 'n'], [z1 + 8, 's']]) {
    const cx = (x0 + x1) / 2;
    bag.add(L, box(cx - 12, 0, zc - 6, cx + 12, 3.2, zc + 6));
    col.rect([cx - 12, zc - 6, cx + 12, zc + 6], 0, 2.9);
    col.floor([cx - 12, zc - 6, cx + 12, zc + 6], 3.2);
    mTemple({ c: [cx, zc], y: 3.2, w: 14, d: 7, h: 5.5, doors: k === 'n' ? 's' : 'n', serpentCols: false }, ctx);
  }
  // the Temple of the Jaguars on the east wall
  mTemple({ c: [x1 + T / 2, (z0 + z1) / 2 - 18], y: H, w: 9, d: 8, h: 5.5, doors: 'w' }, ctx);
}

/** m_colonnade: rows of square pillars (carved with warriors) under a flat roof of beams and plaster { rect, rows, cols, h }. */
function mColonnade(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, h = el.h ?? 4.2, y = el.y ?? 0;
  bag.add(L, box(x0 - 0.5, y - 0.3, z0 - 0.5, x1 + 0.5, y + 0.6, z1 + 0.5));
  col.floor([x0 - 0.5, z0 - 0.5, x1 + 0.5, z1 + 0.5], y + 0.6);
  for (let i = 0; i < el.cols; i++) for (let j = 0; j < el.rows; j++) {
    const x = x0 + (x1 - x0) * (i + 0.5) / el.cols, z = z0 + (z1 - z0) * (j + 0.5) / el.rows;
    bag.add(L, box(x - 0.4, y + 0.6, z - 0.4, x + 0.4, y + 0.6 + h, z + 0.4));
    bag.add('stucco_red', box(x - 0.5, y + 0.6 + h - 0.4, z - 0.5, x + 0.5, y + 0.6 + h, z + 0.5));
    col.rect([x - 0.4, z - 0.4, x + 0.4, z + 0.4], y, y + h);
  }
  if (el.roof !== false) {
    bag.add('timber', box(x0 - 0.3, y + 0.6 + h, z0 - 0.3, x1 + 0.3, y + 0.85 + h, z1 + 0.3));
    bag.add('stucco', box(x0 - 0.4, y + 0.85 + h, z0 - 0.4, x1 + 0.4, y + 1.25 + h, z1 + 0.4));
  }
}

/** m_platform: a low square platform with stairs on its sides { c, a (half-size), h, stairs } (the Platform of Venus, the Tzompantli). */
function mPlatform(el, ctx) {
  mPyramid({ c: el.c, base: el.a, top: el.a - 0.6, h: el.h, tiers: 1, stairs: el.stairs || 'nesw', stairW: el.stairW ?? 4, steps: Math.round(el.h / 0.25), serpents: el.serpents }, ctx);
  if (el.skulls) {
    // the skull rack's walls: rows of carved skulls (a pattern of knobs)
    const [cx, cz] = el.c, a = el.a, { bag } = ctx;
    for (let i = 0; i < 14; i++) for (let j = 0; j < 4; j++) for (const s of [-1, 1]) {
      const x = cx - a + 0.6 + i * (2 * a - 1.2) / 13, y = 0.4 + j * (el.h - 0.6) / 4;
      bag.add('stucco', lathe([[0.001, 0], [0.18, 0.06], [0.2, 0.2], [0.001, 0.32]], 6, null, x, y, cz + s * (a + 0.12)));
    }
  }
}

/** sacbe: a raised white road { a, b, w, h }: a causeway of rubble with a surface of lime plaster. */
function sacbe(el, { bag, col }) {
  const t = [], w = (el.w ?? 4.5) / 2, h = el.h ?? 0.8;
  beamTris(t, [el.a[0], -0.3, el.a[1]], [el.b[0], -0.3, el.b[1]], w, h + 0.3);
  bag.add('lime_plaster', fromTriangles(t));
  const L2 = Math.hypot(el.b[0] - el.a[0], el.b[1] - el.a[1]), n = Math.ceil(L2 / 2);
  for (let k = 0; k < n; k++) {
    const s = (k + 0.5) / n, x = el.a[0] + (el.b[0] - el.a[0]) * s, z = el.a[1] + (el.b[1] - el.a[1]) * s;
    const ux = Math.abs(el.b[0] - el.a[0]) / L2, uz = Math.abs(el.b[1] - el.a[1]) / L2;
    col.floor([x - uz * w - ux * 1.05, z - ux * w - uz * 1.05, x + uz * w + ux * 1.05, z + ux * w + uz * 1.05], h);
  }
}

/**
 * maya_house: an oval house { c, a, b (half-axes), dir (the long axis: 'x' | 'z'), seed }: a
 * footing of rubble, walls of wattle plastered with mud (here plaster), doors in the middle of the
 * long sides, a tall roof of palm thatch on the oval, hipped at the rounded ends.
 */
function mayaHouse(el, { bag, col }) {
  const [cx, cz] = el.c, a = el.a, b = el.b, alongX = el.dir !== 'z', rand = rng(el.seed || 1);
  const sx = alongX ? 1 : b / a, sz = alongX ? b / a : 1;
  const oval = (th) => { const c = Math.cos(th), s = Math.sin(th); return 1 / Math.hypot(c / sx, s / sz); };
  bag.add('rubble', lathe([[a * 1.04, -0.1], [a * 1.04, 0.45], [0.001, 0.45]], 24, oval, cx, 0, cz));
  bag.add(rand() < 0.5 ? 'stucco_warm' : 'lime_plaster', lathe([[a, 0.45], [a * 0.98, 2.2]], 24, oval, cx, 0, cz));
  bag.add('thatch_palm', lathe([[a * 1.25, 1.9], [a * 0.95, 2.6], [a * 0.55, 3.8], [a * 0.12, 5.0], [0.001, 5.2]], 24, oval, cx, 0, cz));
  // the doorway's dark opening on the long side
  const [dx, dz] = alongX ? [0, b] : [b, 0];
  bag.add('lacquer_black', box(cx + dx * 0.99 - (alongX ? 0.5 : 0.05), 0.45, cz + dz * 0.99 - (alongX ? 0.05 : 0.5), cx + dx * 0.99 + (alongX ? 0.5 : 0.05), 2.0, cz + dz * 0.99 + (alongX ? 0.05 : 0.5)));
  col.rect([cx - (alongX ? a : b), cz - (alongX ? b : a), cx + (alongX ? a : b), cz + (alongX ? b : a)], 0, 4);
}

/** albarrada: a dry-stone wall of rubble along a polyline { pts, h }. */
function albarrada(el, { bag, col }) {
  const h = el.h ?? 1.1;
  for (let i = 0; i + 1 < el.pts.length; i++) {
    const t = [], a = el.pts[i], b = el.pts[i + 1];
    beamTris(t, [a[0], 0, a[1]], [b[0], 0, b[1]], 0.35, h);
    bag.add('rubble', fromTriangles(t));
    col.segment(a, b, 0.7, 0, h);
  }
}

registerStyle('maya', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: {
    ...STYLES.qing.elements,
    m_pyramid: mPyramid, m_temple: mTemple, m_ballcourt: mBallcourt, m_colonnade: mColonnade, m_platform: mPlatform, sacbe, maya_house: mayaHouse, albarrada,
  },
  objects: {},
});
