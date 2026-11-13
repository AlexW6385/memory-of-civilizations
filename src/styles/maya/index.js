// Maya–Toltec architecture of Chichén Itzá (10th–11th c.; docs/settlements/chichen-itza.md §4–§5):
// stepped pyramids of terraces each with a sloping base and a vertical panel, stairs with
// balustrades ending in serpent heads, temples on top with doorways divided by serpent columns,
// lime plaster painted red; colonnades of square pillars carved with warriors under flat beamed
// roofs; the ball court with its high walls, benches and stone rings; low platforms with stairs on
// four sides; raised white roads (sacbe); in the town, oval houses of rubble and wattle under
// steep palm thatch, their lots enclosed by dry-stone walls.

import { registerStyle, STYLES, subtractRects } from '../../core/build.js';
import { venusPanelKit, jawsPanelKit, cornice } from './venus.js';
import { hearthKit, ollaKit, metateKit, waterJarKit, bedKit, storeJarKit, put } from './household.js';
import { mesoPlants } from './plants.js';
import { box, lathe, fromTriangles, orientOutward } from '../../core/geom.js';
import '../qing/index.js';
import { beamTris, flipTris } from '../ming/index.js';
import { serpentHeadKit, chaacKit, chacmoolKit, warriorPanelKit, Kit } from './meso.js';
import { emitFrame, ballPanelKit, ringKit, jaguarThroneKit } from './ballcourt.js';
import { warriorsInterior, mOffering } from './sanctuary.js';
import { mayaTownElements } from './town.js';
import { castilloInterior } from './interior.js';

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
  const th = H / n, STEP = (A0 - A1) / n, bw = 1.2;
  const sides = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] };
  // the stairways stand out from the faces: their line runs parallel to the tiers' feet, far enough out that every
  // tread clears the tier's moulding below it (the moulding stands 0.64 of a tier's step in from its foot)
  const m = 0.64 * STEP + 0.2, foot = A0 + m + (el.stairOut ?? 0), head = A1 + m, mould = A1 + 0.64 * STEP;
  const stairRect = (k) => {
    const [dx, dz] = sides[k], o = sw + bw, a = Math.min(cx + dx * foot, cx + dx * (A1 - 1)), b = Math.max(cx + dx * foot, cx + dx * (A1 - 1));
    return dx ? [a - 0.5, cz - o, b + 0.5, cz + o] : [cx - o, Math.min(cz + dz * foot, cz + dz * (A1 - 1)) - 0.5, cx + o, Math.max(cz + dz * foot, cz + dz * (A1 - 1)) + 0.5];
  };
  const holes = [...(el.stairs || 'nesw')].map((k) => { const r = stairRect(k), o = sw; return sides[k][0] ? [r[0], cz - o, r[2], cz + o] : [cx - o, r[1], cx + o, r[3]]; });
  for (let k = 0; k < n; k++) {
    // each tier: a sloping base, a vertical panel with a moulding, and a ledge before the next
    const a0 = A0 - (A0 - A1) * k / n, a1 = A0 - (A0 - A1) * (k + 1) / n, y0 = k * th, step = a0 - a1;
    const ap = a0 - step * 0.42;
    frust(bag, L, cx, cz, a0, a0, ap, ap, y0, y0 + th * 0.55);                                                    // the talud
    frust(bag, L, cx, cz, ap, ap, ap - step * 0.04, ap - step * 0.04, y0 + th * 0.55, y0 + th * 0.9);             // the panel
    frust(bag, L, cx, cz, ap + step * 0.06, ap + step * 0.06, ap + step * 0.06, ap + step * 0.06, y0 + th * 0.9, y0 + th);   // the moulding
    // the panels on each tier's face: recessed rectangles in a row, the stair's run left clear
    if (el.venus) {
      // the Platform of Venus (venus.js): panels of Venus as a Year Bundle alternating with the god in the serpent's jaws, the serpent with fish along the cornice
      const pd = ap - step * 0.04 - 0.002, py0 = y0 + th * 0.6, cd = ap + step * 0.06, ch = th * 0.1, edge = sw + bw + 0.25;
      for (const [fx, fz] of [[0, -1], [0, 1], [1, 0], [-1, 0]]) for (const sd of [-1, 1]) {
        const at = (u, dd) => (fz ? [cx + sd * u, cz + fz * dd] : [cx + fx * dd, cz + sd * u]);
        for (let i = 0; i < 3; i++) { const u = edge + 1.4 + i * 2.75, [x, z] = at(u, pd); if (u + 1.1 < ap - 0.2) ((i + (sd > 0 ? 1 : 0)) % 2 ? jawsPanelKit : venusPanelKit)().emit(bag, x, py0, z, fx, fz); }
        const len = ap - 0.15 - edge, [x, z] = at(edge + len / 2, cd);
        cornice(len, ch).emit(bag, x, y0 + th * 0.9, z, fx, fz);
      }
    } else if (!el.simple) {
      const pw = 2.2, py0 = y0 + th * 0.6, py1 = y0 + th * 0.86, d = ap - step * 0.04 + 0.05;
      for (const [fx, fz] of [[0, -1], [0, 1], [1, 0], [-1, 0]]) {
        const mm = Math.floor((2 * d) / (pw + 0.9));
        for (let i = 0; i < mm; i++) {
          const u = -d + (i + 0.5) * (2 * d) / mm;
          if (Math.abs(u) < sw + bw + pw / 2 + 0.3) continue;
          const [qx, qz] = fz ? [cx + u, cz + fz * d] : [cx + fx * d, cz + u];
          const t = 0.2, d0 = 0.15, bar = (u0, u1, v0, v1) => bag.add(L, fz ? box(qx + u0, v0, qz - d0, qx + u1, v1, qz + d0) : box(qx - d0, v0, qz + u0, qx + d0, v1, qz + u1));
          bar(-pw / 2, pw / 2, py0, py0 + t); bar(-pw / 2, pw / 2, py1 - t, py1); bar(-pw / 2, -pw / 2 + t, py0 + t, py1 - t); bar(pw / 2 - t, pw / 2, py0 + t, py1 - t);
        }
      }
    }
    // the tier as an obstacle, except over the stairs (which are walked)
    for (const r of subtractRects([cx - a0, cz - a0, cx + a0, cz + a0], holes)) col.rect(r, y0 - 0.3, y0 + th - 0.31);
    col.floor([cx - a1, cz - a1, cx + a1, cz + a1], y0 + th);
  }
  // the stairways: a solid mass standing out of the face, its treads and risers on top, a balustrade on either
  // side whose foot carries the serpent's head where asked; a temple on top
  for (const k of el.stairs || 'nesw') {
    const [dx, dz] = sides[k], nx = -dz, nz = dx, steps = el.steps ?? 91, dIn = A1 - 1;
    const P = (d, o, y) => [cx + dx * d + nx * o, y, cz + dz * d + nz * o];
    // a prism over the (d, y) polygon `poly` (convex) between offsets o0 and o1
    const prism = (mat, poly, o0, o1) => {
      const t = [], q = (a, b, c, e) => t.push(...a, ...b, ...c, ...a, ...c, ...e);
      for (let i = 1; i + 1 < poly.length; i++) { t.push(...P(poly[0][0], o0, poly[0][1]), ...P(poly[i][0], o0, poly[i][1]), ...P(poly[i + 1][0], o0, poly[i + 1][1])); t.push(...P(poly[0][0], o1, poly[0][1]), ...P(poly[i][0], o1, poly[i][1]), ...P(poly[i + 1][0], o1, poly[i + 1][1])); }
      for (let i = 0; i < poly.length; i++) { const a = poly[i], b = poly[(i + 1) % poly.length]; q(P(a[0], o0, a[1]), P(b[0], o0, b[1]), P(b[0], o1, b[1]), P(a[0], o1, a[1])); }
      bag.add(mat, fromTriangles(orientOutward(t)));
    };
    // the mass under the stair's line, back into the pyramid's core (hidden there), the full width with the balustrades
    prism(L, [[foot, -0.2], [foot, 0], [head, H], [mould, H], [dIn, H - 1.2], [dIn, -0.2]], -(sw + bw), sw + bw);
    // the treads and risers: each step a closed wedge sitting on the line
    const t = [];
    for (let i = 0; i < steps; i++) {
      const f0 = i / steps, f1 = (i + 1) / steps, d0 = foot - (foot - head) * f0, d1 = foot - (foot - head) * f1, y0 = H * f0, y1 = H * f1;
      const e = sw + 0.05, A = P(d0, -e, y0), B = P(d0, -e, y1), C = P(d1, -e, y1), A2 = P(d0, e, y0), B2 = P(d0, e, y1), C2 = P(d1, e, y1);
      t.push(...A, ...B, ...C, ...A2, ...C2, ...B2);                                                         // the wedge's ends
      t.push(...B, ...B2, ...C2, ...B, ...C2, ...C);                                                         // the tread
      t.push(...A, ...A2, ...B2, ...A, ...B2, ...B);                                                         // the riser
    }
    // turn every face of the wedges outward (each wedge's own centre: the riser faces out, the tread up)
    for (let i = 0; i < t.length; i += 9 * 6) { const w = t.slice(i, i + 9 * 6); orientOutward(w); for (let j = 0; j < w.length; j++) t[i + j] = w[j]; }
    bag.add(L, fromTriangles(t));
    // the balustrades: on the stair's line, a metre high, ending in a block at the foot
    for (const s of [-1, 1]) {
      const [o0, o1] = s < 0 ? [-(sw + bw), -sw] : [sw, sw + bw];
      prism(L, [[foot, 0], [foot + 0.4, 0], [foot + 0.4, 1.2], [head, H + 1.0], [head, H]], o0, o1);
      if ((el.serpents || '').includes(k)) serpentHead(bag, cx + dx * (foot + 1.0) + nx * s * (sw + bw / 2), cz + dz * (foot + 1.0) + nz * s * (sw + bw / 2), [dx, dz], 0, 1);
    }
    // walking up: a ramp over the stair's footprint, then the step onto the top
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
    const front = k === el.doors, door = front ? Math.min(len * 0.6, 7.5) : el.inner ? 0 : 2.4;   // a temple with a sanctuary inside is closed but at its front
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
  if (el.furnish === 'castillo') castilloInterior(bag, col, { cx, cz, w, d, y: y1, H: wallH, wt });
  if (el.inner === 'warriors' && el.doors === 'w') warriorsInterior(bag, col, { cx, cz, w, d, y: y1, H: wallH, wt }, warriorPillar);
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
 * A straight flight of steps up to a wall top or a terrace { foot [x, z] (the middle of the lowest step's
 * front), dir [dx, dz] (the way up, along an axis), w (the flight's width), H, steps }: a solid mass under the
 * stair's line, closed wedge steps on it, plain balustrades either side; walked as a ramp.
 */
function flight(bag, col, foot, [dx, dz], w, H, steps, run = 0.3, back = 1.0, y0 = 0) {
  const nx = -dz, nz = dx, hw = w / 2, bw = 0.6, Lr = steps * run;
  const P = (d, o, y) => [foot[0] + dx * d + nx * o, y0 + y, foot[1] + dz * d + nz * o];
  const prism = (poly, o0, o1) => {
    const t = [], q = (a, b, c, e) => t.push(...a, ...b, ...c, ...a, ...c, ...e);
    for (let i = 1; i + 1 < poly.length; i++) { t.push(...P(poly[0][0], o0, poly[0][1]), ...P(poly[i][0], o0, poly[i][1]), ...P(poly[i + 1][0], o0, poly[i + 1][1])); t.push(...P(poly[0][0], o1, poly[0][1]), ...P(poly[i][0], o1, poly[i][1]), ...P(poly[i + 1][0], o1, poly[i + 1][1])); }
    for (let i = 0; i < poly.length; i++) { const a = poly[i], b = poly[(i + 1) % poly.length]; q(P(a[0], o0, a[1]), P(b[0], o0, b[1]), P(b[0], o1, b[1]), P(a[0], o1, a[1])); }
    bag.add(L, fromTriangles(orientOutward(t)));
  };
  prism([[0, -0.2], [0, 0], [Lr, H - 0.02], [Lr + back, H - 0.02], [Lr + back, -0.2]], -(hw + bw), hw + bw);
  const t = [];
  for (let i = 0; i < steps; i++) {
    const d0 = i * run, d1 = (i + 1) * run, y0 = H * i / steps, y1 = H * (i + 1) / steps, e = hw + 0.05;
    const w6 = [];
    const A = P(d0, -e, y0), B = P(d0, -e, y1), C = P(d1, -e, y1), A2 = P(d0, e, y0), B2 = P(d0, e, y1), C2 = P(d1, e, y1);
    w6.push(...A, ...B, ...C, ...A2, ...C2, ...B2, ...B, ...B2, ...C2, ...B, ...C2, ...C, ...A, ...A2, ...B2, ...A, ...B2, ...B);
    t.push(...orientOutward(w6));
  }
  bag.add(L, fromTriangles(t));
  for (const s of [-1, 1]) prism([[0, 0], [-0.3, 0], [-0.3, 1.1], [Lr, H + 0.9], [Lr, H - 0.02]], s < 0 ? -(hw + bw) : hw, s < 0 ? -hw : hw + bw);
  const r = [Math.min(foot[0], foot[0] + dx * Lr) - (dx ? 0 : hw), Math.min(foot[1], foot[1] + dz * Lr) - (dz ? 0 : hw), Math.max(foot[0], foot[0] + dx * Lr) + (dx ? 0 : hw), Math.max(foot[1], foot[1] + dz * Lr) + (dz ? 0 : hw)];
  col.ramp(r, y0, y0 + H, dx > 0 ? 'e' : dx < 0 ? 'w' : dz > 0 ? 's' : 'n');
}

/** A square pillar with a warrior carved on each face, on a floor at y { x, z, y, h } (the colonnades, the Lower Temple of the Jaguars). */
function warriorPillar(bag, col, x, z, y, h) {
  bag.add(L, box(x - 0.4, y, z - 0.4, x + 0.4, y + h, z + 0.4));
  bag.add('stucco_red', box(x - 0.5, y + h - 0.4, z - 0.5, x + 0.5, y + h, z + 0.5));
  for (const [fx, fz] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) warriorPanelKit().emit(bag, x + fx * 0.4, y + Math.max(0.2, (h - 0.4 - 2.8) / 2), z + fz * 0.4, fx, fz, Math.min(1, (h - 0.6) / 2.9));
  col.rect([x - 0.4, z - 0.4, x + 0.4, z + 0.4], y, y + h);
}

/**
 * m_ballcourt: the Great Ball Court { rect (the playing alley, long along z), wallH, bench, wallLen }: the two
 * platforms, 95 m long, along the alley's middle with their high inner walls, the slanted benches at their feet
 * carved with six panels each (the ball players and the sacrifice), a ring carved with twined serpents high on
 * each wall's middle; the North and South Temples at the ends; on the east platform's south end the Upper
 * Temple of the Jaguars, looking over the court between serpent columns, its stair up from the south; under it,
 * facing out over the plaza, the Lower Temple of the Jaguars with its carved pillars and the jaguar throne.
 */
function mBallcourt(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, H = el.wallH ?? 8.5, bw = el.bench ?? 4.5, T = 11;
  const zc = (z0 + z1) / 2, WL = el.wallLen ?? 95, wz0 = zc - WL / 2, wz1 = zc + WL / 2;
  const sl = 1.6, b0 = 0.4, b1 = 1.75, a = Math.atan2(b1 - b0, sl), ca = Math.cos(a), sa = Math.sin(a);
  for (const s of [-1, 1]) {
    const xi = s < 0 ? x0 : x1, xo = xi + s * T;                      // the inner face, the outer face
    const [xa, xb] = s < 0 ? [xo, xi] : [xi, xo];
    bag.add(L, box(xa, 0, wz0, xb, H, wz1));
    col.rect([xa, wz0, xb, wz1], 0, H);
    col.floor([xa, wz0, xb, wz1], H);
    // the bench: a low upright face, the slanted face with the panels, a ledge back to the wall
    const X = (u) => xi - s * u, poly = [[-0.05, 0], [bw, 0], [bw, b0], [bw - sl, b1], [-0.05, b1]], t = [];
    for (let i = 1; i + 1 < poly.length; i++) for (const z of [wz0, wz1]) t.push(X(poly[0][0]), poly[0][1], z, X(poly[i][0]), poly[i][1], z, X(poly[i + 1][0]), poly[i + 1][1], z);
    for (let i = 0; i < poly.length; i++) { const p = poly[i], q = poly[(i + 1) % poly.length]; t.push(X(p[0]), p[1], wz0, X(q[0]), q[1], wz0, X(q[0]), q[1], wz1, X(p[0]), p[1], wz0, X(q[0]), q[1], wz1, X(p[0]), p[1], wz1); }
    bag.add(L, fromTriangles(orientOutward(t)));
    col.rect([Math.min(X(0), X(bw)), wz0, Math.max(X(0), X(bw)), wz1], 0, b1);
    // the six relief panels on the slanted face
    const V = [s * ca, sa, 0], N = [-s * sa, ca, 0], U = [0, 0, s];
    for (let i = 0; i < 6; i++) {
      const zp = zc + (i - 2.5) * 15.5, O = [X(bw) + V[0] * 0.06 - N[0] * 0.01, b0 + V[1] * 0.06 - N[1] * 0.01, zp];
      emitFrame(ballPanelKit(12, 1.95), bag, O, U, V, N);
    }
    // the ring, high on the wall's middle, its hole facing across the court
    ringKit().emit(bag, xi + s * 0.03, el.ringY ?? 6.2, zc, -s, 0);
  }
  // the end temples (north and south), on low platforms
  for (const [zt, k] of [[z0 - 8, 'n'], [z1 + 8, 's']]) {
    const cx = (x0 + x1) / 2;
    bag.add(L, box(cx - 12, 0, zt - 6, cx + 12, 3.2, zt + 6));
    col.rect([cx - 12, zt - 6, cx + 12, zt + 6], 0, 2.9);
    col.floor([cx - 12, zt - 6, cx + 12, zt + 6], 3.2);
    mTemple({ c: [cx, zt], y: 3.2, w: 14, d: 7, h: 5.5, doors: k === 'n' ? 's' : 'n', serpentCols: false }, ctx);
  }
  // the Upper Temple of the Jaguars on the east platform's south end, its serpent columns toward the court;
  // the steep stair up to it from the south
  const ut = wz1 - 6;
  mTemple({ c: [x1 + T / 2, ut], y: H, w: 9, d: 8, h: 5.5, doors: 'w' }, ctx);
  flight(bag, col, [x1 + T / 2, wz1 + Math.round(H / 0.25) * 0.3], [0, -1], 4.4, H, Math.round(H / 0.25));
  // the Lower Temple of the Jaguars at the platform's outer foot, facing the plaza: two carved pillars in its
  // doorway, the jaguar throne before it
  const lw = 4, lx = x1 + T + lw - 0.5;
  mTemple({ c: [lx, ut], y: 0, w: 2 * lw, d: 10, h: 5, doors: 'e', serpentCols: false }, ctx);
  for (const dz of [-1, 1]) warriorPillar(bag, col, lx + lw, ut + dz * 1.0, 0.4, 5 * 0.62);
  jaguarThroneKit().emit(bag, lx + lw + 2.2, 0, ut, 1, 0);
  col.rect([lx + lw + 1.85, ut - 0.8, lx + lw + 2.55, ut + 0.8], 0, 0.8);
}

/** A sector of a round wall, r0…r1 from (cx, cz), angles a0…a1 (radians, from +x toward +z), y0…y1, as a closed solid. */
function arcWall(bag, mat, cx, cz, r0, r1, a0, a1, y0, y1, seg = 0) {
  const n = seg || Math.max(2, Math.ceil((a1 - a0) / 0.13)), t = [], q = (a, b, c, e) => t.push(...a, ...b, ...c, ...a, ...c, ...e);
  const P = (r, a, y) => [cx + r * Math.cos(a), y, cz + r * Math.sin(a)];
  for (let i = 0; i < n; i++) {
    const u0 = a0 + (a1 - a0) * i / n, u1 = a0 + (a1 - a0) * (i + 1) / n;
    q(P(r1, u0, y0), P(r1, u1, y0), P(r1, u1, y1), P(r1, u0, y1));                                      // outer
    q(P(r0, u1, y0), P(r0, u0, y0), P(r0, u0, y1), P(r0, u1, y1));                                      // inner
    q(P(r0, u0, y1), P(r1, u0, y1), P(r1, u1, y1), P(r0, u1, y1));                                      // top
    q(P(r0, u1, y0), P(r1, u1, y0), P(r1, u0, y0), P(r0, u0, y0));                                      // bottom
  }
  q(P(r0, a0, y0), P(r1, a0, y0), P(r1, a0, y1), P(r0, a0, y1)); q(P(r1, a1, y0), P(r0, a1, y0), P(r0, a1, y1), P(r1, a1, y1));   // the ends
  // each quad was wound for an outward normal seen from outside; fix any the other way round (r0 may be 0)
  bag.add(mat, fromTriangles(t.concat(flipTris(t))));
}
/** A round wall r0…r1 between y0 and y1 with openings of width w (metres at r1) centred at the angles `at`. */
function ringWithGaps(bag, mat, cx, cz, r0, r1, y0, y1, at, w) {
  const half = w / 2 / r1, gaps = at.map((a) => [a - half, a + half]).sort((p, q) => p[0] - q[0]);
  for (let i = 0; i < gaps.length; i++) { const a = gaps[i][1], b = i + 1 < gaps.length ? gaps[i + 1][0] : gaps[0][0] + 2 * Math.PI; arcWall(bag, mat, cx, cz, r0, r1, a, b, y0, y1); }
}

/**
 * m_caracol: El Caracol, the round observatory { c, rot (unused: the stair faces west) }: the lower platform
 * (52 × 67 m, 6 m high) with its broad west stair; the upper platform with its own stair; on it the round base
 * and the tower — an outer wall with four doorways to the cardinal points round a gallery, an inner wall with
 * four doorways turned 45° round a second gallery, the solid core with the spiral stair; a frieze with the
 * rain god's mask over each outer doorway; on the roof the upper chamber with its narrow sighting shafts.
 */
function mCaracol(el, { bag, col }) {
  const [cx, cz] = el.c, H1 = 6, ax = 26, az = 33.5;
  // the lower platform: a battered face, a projecting cornice
  frust(bag, L, cx, cz, ax, az, ax - 0.5, az - 0.5, 0, H1 - 0.5);
  frust(bag, L, cx, cz, ax - 0.3, az - 0.3, ax - 0.3, az - 0.3, H1 - 0.5, H1);
  col.rect([cx - ax, cz - az, cx + ax, cz + az], 0, H1 - 0.31);
  col.floor([cx - ax + 0.3, cz - az + 0.3, cx + ax - 0.3, cz + az - 0.3], H1);
  flight(bag, col, [cx - ax - 24 * 0.3, cz], [1, 0], 14, H1, 24, 0.3, 1.0);
  // the upper platform, set back toward the east, its stair from the west
  const ux = cx + 6, H2 = 4, bx = 12, bz = 13;
  frust(bag, L, ux, cz, bx, bz, bx - 0.3, bz - 0.3, H1, H1 + H2 - 0.45);
  frust(bag, L, ux, cz, bx - 0.15, bz - 0.15, bx - 0.15, bz - 0.15, H1 + H2 - 0.45, H1 + H2);
  col.rect([ux - bx, cz - bz, ux + bx, cz + bz], H1, H1 + H2 - 0.31);
  col.floor([ux - bx + 0.2, cz - bz + 0.2, ux + bx - 0.2, cz + bz - 0.2], H1 + H2);
  flight(bag, col, [ux - bx - 16 * 0.3, cz], [1, 0], 8, H2, 16, 0.3, 1.0, H1);
  // the round base (16 m across) and the tower (11 m)
  const y0 = H1 + H2, R0 = 8, yb = y0 + 1.2;
  arcWall(bag, L, ux, cz, 0, R0, 0, 2 * Math.PI, y0 - 0.2, yb - 0.25, 64);
  arcWall(bag, L, ux, cz, 0, R0 + 0.2, 0, 2 * Math.PI, yb - 0.3, yb, 64);
  col.circle(ux, cz, R0, y0, yb - 0.3);
  col.floor([ux - R0 * 0.7, cz - R0 * 0.7, ux + R0 * 0.7, cz + R0 * 0.7], yb);
  const Ro = 5.5, wt = 0.8, Ri = 3.7, Rc = 1.9, yl = yb + 2.6, yr = yb + 3.7, yf = yb + 5.3;
  const card = [0, Math.PI / 2, Math.PI, 1.5 * Math.PI], diag = card.map((a) => a + Math.PI / 4);
  ringWithGaps(bag, L, ux, cz, Ro - wt, Ro, yb, yl, card, 1.5);                        // the outer wall, its four doorways
  arcWall(bag, L, ux, cz, Ro - wt, Ro, 0, 2 * Math.PI, yl - 0.02, yr, 64);              // over the lintels
  for (const a of card) bag.add('timber', box(...(() => { const x = ux + Math.cos(a) * (Ro - wt / 2), z = cz + Math.sin(a) * (Ro - wt / 2), ex = Math.abs(Math.cos(a)) > 0.5 ? wt / 2 + 0.02 : 1.0, ez = Math.abs(Math.cos(a)) > 0.5 ? 1.0 : wt / 2 + 0.02; return [x - ex, yl - 0.2, z - ez, x + ex, yl, z + ez]; })()));
  ringWithGaps(bag, L, ux, cz, Ri - wt, Ri, yb, yl, diag, 1.1);                        // the inner wall, its doorways turned
  arcWall(bag, L, ux, cz, Ri - wt, Ri, 0, 2 * Math.PI, yl - 0.02, yr, 48);
  arcWall(bag, L, ux, cz, 0, Rc, 0, 2 * Math.PI, yb, yr, 32);                          // the core, the spiral stair inside it
  arcWall(bag, 'stucco', ux, cz, 0, Ro - wt + 0.01, 0, 2 * Math.PI, yr - 0.3, yr, 48); // the galleries' ceiling
  col.circle(ux, cz, Ro, yb, yr);
  // the frieze: a moulding, a plain band with the rain god's mask over each outer doorway, a cornice
  arcWall(bag, L, ux, cz, Ro - 0.4, Ro + 0.15, 0, 2 * Math.PI, yr - 0.05, yr + 0.25, 64);
  arcWall(bag, 'stucco_red', ux, cz, Ro - 0.4, Ro, 0, 2 * Math.PI, yr + 0.2, yf - 0.25, 64);
  arcWall(bag, L, ux, cz, Ro - 0.4, Ro + 0.2, 0, 2 * Math.PI, yf - 0.3, yf, 64);
  for (const a of card) chaacKit().emit(bag, ux + Math.cos(a) * (Ro - 0.04), yr + 0.28, cz + Math.sin(a) * (Ro - 0.04), Math.cos(a), Math.sin(a), 0.62);
  arcWall(bag, L, ux, cz, 0, Ro - 0.39, 0, 2 * Math.PI, yr - 0.15, yf - 0.05, 48);     // the roof's fill
  col.floor([ux - 3.8, cz - 3.8, ux + 3.8, cz + 3.8], yf - 0.05);
  // the upper chamber: a small round room, its wall pierced by narrow sighting shafts
  const Rt = 2.6, yt0 = yf, ys = yf + 1.2, ys1 = yf + 1.8, yt1 = yf + 2.6;
  arcWall(bag, L, ux, cz, Rt - 0.6, Rt, 0, 2 * Math.PI, yt0 - 0.1, ys, 40);
  ringWithGaps(bag, L, ux, cz, Rt - 0.6, Rt, ys - 0.01, ys1 + 0.01, [Math.PI * 1.06, Math.PI * 0.8, Math.PI * 1.3, Math.PI * 1.85, Math.PI * 0.2], 0.3);
  arcWall(bag, L, ux, cz, Rt - 0.6, Rt, 0, 2 * Math.PI, ys1, yt1, 40);
  arcWall(bag, L, ux, cz, 0, Rt + 0.15, 0, 2 * Math.PI, yt1 - 0.02, yt1 + 0.3, 40);
  arcWall(bag, 'lacquer_black', ux, cz, 0, Rt - 0.59, 0, 2 * Math.PI, yt0 - 0.08, yt0, 24);   // the dark floor inside
  col.circle(ux, cz, Rt, yt0, yt1);
}

/** m_colonnade: rows of square pillars, each face carved with a warrior, under a flat roof of beams and plaster { rect, rows, cols, h, warriors }. */
function mColonnade(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, h = el.h ?? 4.2, y = el.y ?? 0;
  bag.add(L, box(x0 - 0.5, y - 0.3, z0 - 0.5, x1 + 0.5, y + 0.6, z1 + 0.5));
  col.floor([x0 - 0.5, z0 - 0.5, x1 + 0.5, z1 + 0.5], y + 0.6);
  for (let i = 0; i < el.cols; i++) for (let j = 0; j < el.rows; j++) {
    const x = x0 + (x1 - x0) * (i + 0.5) / el.cols, z = z0 + (z1 - z0) * (j + 0.5) / el.rows;
    bag.add(L, box(x - 0.4, y + 0.6, z - 0.4, x + 0.4, y + 0.6 + h, z + 0.4));
    bag.add('stucco_red', box(x - 0.5, y + 0.6 + h - 0.4, z - 0.5, x + 0.5, y + 0.6 + h, z + 0.5));
    // a warrior carved on each face, between a plain base and the capital
    if (el.warriors !== false) for (const [fx, fz] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) warriorPanelKit().emit(bag, x + fx * 0.4, y + 0.6 + Math.max(0.2, (h - 0.4 - 2.8) / 2), z + fz * 0.4, fx, fz, Math.min(1, (h - 0.6) / 2.9));
    col.rect([x - 0.4, z - 0.4, x + 0.4, z + 0.4], y, y + h);
  }
  if (el.roof !== false) {
    bag.add('timber', box(x0 - 0.3, y + 0.6 + h, z0 - 0.3, x1 + 0.3, y + 0.85 + h, z1 + 0.3));
    bag.add('stucco', box(x0 - 0.4, y + 0.85 + h, z0 - 0.4, x1 + 0.4, y + 1.25 + h, z1 + 0.4));
  }
}

/** m_platform: a low square platform with stairs on its sides { c, a (half-size), h, stairs } (the Platform of Venus, the Tzompantli). */
function mPlatform(el, ctx) {
  const steps = Math.round(el.h / 0.25);
  mPyramid({ c: el.c, venus: el.venus, base: el.a, top: el.a - 0.6, h: el.h, tiers: 1, stairs: el.stairs || 'nesw', stairW: el.stairW ?? 4, steps, serpents: el.serpents, stairOut: el.stairOut ?? Math.max(0, steps * 0.27 - 0.6) }, ctx);
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
function mayaHouse(el, ctx) {
  const { bag, col } = ctx, [cx, cz] = el.c, a = el.a, b = el.b, alongX = el.dir !== 'z', rand = rng(el.seed || 1);
  const sx = alongX ? 1 : b / a, sz = alongX ? b / a : 1;
  const oval = (th) => { const c = Math.cos(th), s = Math.sin(th); return 1 / Math.hypot(c / sx, s / sz); };
  const P = (th, r, y) => [cx + Math.cos(th) * r * oval(th), y, cz + Math.sin(th) * r * oval(th)];
  const F = 0.45, wall = rand() < 0.5 ? 'stucco_warm' : 'lime_plaster', T = 0.16, top = 2.44;
  bag.add('rubble', lathe([[a * 1.04, -0.1], [a * 1.04, F - 0.03], [0.001, F - 0.03]], 24, oval, cx, 0, cz));
  bag.add('mud_plaster', lathe([[a - T / a * a, F - 0.03], [a - T, F], [0.001, F]], 24, oval, cx, 0, cz));     // the beaten earth floor
  // the wall of wattle and daub with its two doorways in the middle of the long sides, each 1.0 m wide, 1.85 high
  const doors = alongX ? [Math.PI / 2, -Math.PI / 2] : [0, Math.PI], dw = 0.5 / Math.min(a, b), dh = F + 1.85, N = 40;
  const t = [], q = (p1, p2, p3, p4) => t.push(...p1, ...p2, ...p3, ...p1, ...p3, ...p4);
  const inDoor = (th) => doors.some((d) => Math.abs(Math.atan2(Math.sin(th - d), Math.cos(th - d))) < dw);
  for (let i = 0; i < N; i++) {
    const t0 = (i / N) * 2 * Math.PI, t1 = ((i + 1) / N) * 2 * Math.PI, mid = (t0 + t1) / 2, y0 = inDoor(mid) ? dh : F;
    const ro = a, ri = a - T;
    q(P(t0, ro, y0), P(t1, ro, y0), P(t1, ro, top), P(t0, ro, top));            // outer face
    q(P(t1, ri, y0), P(t0, ri, y0), P(t0, ri, top), P(t1, ri, top));            // inner face
    q(P(t0, ri, top), P(t0, ro, top), P(t1, ro, top), P(t1, ri, top));          // the wall head
    if (y0 > F) q(P(t0, ro, y0), P(t0, ri, y0), P(t1, ri, y0), P(t1, ro, y0));   // the lintel's underside
    const nxt = inDoor(((i + 1.5) / N) * 2 * Math.PI), prv = inDoor(((i - 0.5) / N) * 2 * Math.PI);
    if (!inDoor(mid) && nxt) q(P(t1, ro, F), P(t1, ri, F), P(t1, ri, dh), P(t1, ro, dh));    // the jambs
    if (!inDoor(mid) && prv) q(P(t0, ri, F), P(t0, ro, F), P(t0, ro, dh), P(t0, ri, dh));
    if (!inDoor(mid)) col.segment([P(t0, a - T / 2, 0)[0], P(t0, a - T / 2, 0)[2]], [P(t1, a - T / 2, 0)[0], P(t1, a - T / 2, 0)[2]], T, 0, top);
  }
  bag.add(wall, flipGeo(fromTriangles(t)));
  // the roof of palm thatch, hipped at the rounded ends, its underside seen from within; the ridge pole
  const prof = [[a * 1.25, 1.9], [a * 0.95, 2.6], [a * 0.55, 3.8], [a * 0.12, 5.0], [0.001, 5.2]];
  bag.add('thatch_palm', lathe(prof, 24, oval, cx, 0, cz));
  bag.add('thatch_palm', flipGeo(lathe(prof.map(([r, y]) => [Math.max(0.001, r - 0.12), y - 0.1]), 24, oval, cx, 0, cz)));
  { const e = lathe([[a * 1.25, 1.9], [a * 1.25 - 0.12, 1.8]], 24, oval, cx, 0, cz); bag.add('thatch_palm', e); bag.add('thatch_palm', flipGeo(e.clone())); }   // the eaves' edge, closing the two skins
  col.floor([cx - (alongX ? a : b) * 0.7, cz - (alongX ? b : a) * 0.7, cx + (alongX ? a : b) * 0.7, cz + (alongX ? b : a) * 0.7], F);
  // a step stone before each doorway
  for (const d of doors) { const p = P(d, a + 0.3, 0); bag.add('rubble', box(p[0] - 0.45, -0.05, p[2] - 0.3, p[0] + 0.45, 0.22, p[2] + 0.3)); col.floor([p[0] - 0.45, p[2] - 0.3, p[0] + 0.45, p[2] + 0.3], 0.22); }
  mayaHouseThings(ctx, el, P, alongX, F, a, b, rand);
}
/** A geometry's faces turned the other way (the inner skin of a roof seen from below). */
function flipGeo(g) {
  const p = g.attributes.position.array, t = [];
  for (let i = 0; i < p.length; i += 9) t.push(p[i], p[i + 1], p[i + 2], p[i + 6], p[i + 7], p[i + 8], p[i + 3], p[i + 4], p[i + 5]);
  return fromTriangles(t);
}
/**
 * The things of a Maya house (Joya de Cerén: sleeping mats on the floor, some seventy cooking vessels to a household,
 * manos and metates, hearths; the Yucatec house of poles and thatch): at one rounded end the hearth of three stones
 * with the comal and the ollas round it, the metate, the water jar; at the other the sleeping mats with blankets;
 * stored jars and a basket by the wall.
 */
function mayaHouseThings(ctx, el, P, alongX, F, a, b, rand) {
  const { bag, col } = ctx, L = STYLES.life.elements, endA = alongX ? 0 : Math.PI / 2, endB = endA + Math.PI, f = F;
  const [hx, , hz] = P(endA, a - 1.0, f); put(bag, hearthKit('rubble'), hx, f, hz, 0); col.circle(hx, hz, 0.45, f, f + 0.3);
  ctx.lights?.push({ at: [hx, f + 0.9, hz], color: '#ff9a4a', intensity: 2.4, distance: 6 });      // the hearth's fire lights the house
  for (const [da, r] of [[0.5, a - 1.0], [-0.5, a - 1.0]]) { const p = P(endA + da, r, f); put(bag, ollaKit(), ...p, 0); }
  const m = P(endA + (alongX ? 1.15 : 1.15), a - 0.75, f); put(bag, metateKit(), m[0], f, m[2], alongX ? Math.PI : -Math.PI / 2);
  const w = P(endA - 1.2, a - 0.55, f); put(bag, waterJarKit(), ...w, 0); col.circle(w[0], w[2], 0.33, f, f + 0.8);
  const bd = P(endB, a - 1.3, f); put(bag, bedKit(rand() < 0.7 ? 'cloth_white' : 'cloth_ochre', 'cloth_red'), bd[0], f, bd[2], alongX ? Math.PI / 2 : 0);
  const sj = P(endB + 0.9, a - 0.5, f); put(bag, storeJarKit(), ...sj, 0);
  L.basket({ at: [P(endB - 0.9, a - 0.55, f)[0], P(endB - 0.9, a - 0.55, f)[2]], y: f, seed: el.seed, n: 1 }, ctx);
  if (rand() < 0.4) { const k = P(endA + 1.15, a - 1.35, f); L.figure({ at: [k[0], k[2]], y: f, rot: alongX ? 0 : Math.PI / 2, seed: el.seed, pose: 'kneel', dress: 'robe', cloth: 'cloth_white', skin: 'skin_dark', hair: 'long', hairMat: 'hair_dark', feet: 'bare', legs: 'bare', over: 'none' }, ctx); }
}

/** m_ball: the solid rubber ball of the game { at, y, r } (about 0.3 m across). */
function mBall(el, { bag }) {
  const r = el.r ?? 0.15, n = 8, p = [];
  for (let i = 0; i <= n; i++) { const a = -Math.PI / 2 + Math.PI * i / n; p.push([Math.max(0.001, Math.cos(a) * r), r + Math.sin(a) * r]); }
  bag.add('rubber', lathe(p, 12, null, el.at[0], el.y ?? 0, el.at[1]));
}

/** petate: a woven palm mat laid on the ground { at [x, z], y, w, d, rot } (the market's sellers sit behind theirs). */
function petate(el, { bag }) {
  const g = box(-el.w / 2, 0, -el.d / 2, el.w / 2, 0.015, el.d / 2); if (el.rot) g.rotateY(el.rot);
  bag.add('reed_mat', g.translate(el.at[0], el.y ?? 0, el.at[1]));
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
    m_pyramid: mPyramid, m_temple: mTemple, m_ballcourt: mBallcourt, m_colonnade: mColonnade, m_platform: mPlatform, m_caracol: mCaracol, sacbe, maya_house: mayaHouse, albarrada, petate, m_offering: mOffering, meso_plants: mesoPlants, m_ball: mBall,
    ...mayaTownElements,
  },
  objects: {},
});
