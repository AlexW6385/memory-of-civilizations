// The houses of the citadel and the lower town (docs/settlements/mycenae.md §5): a rubble socle, mudbrick walls plastered, timber ties, small
// windows, a flat clay roof with a parapet and a spout; the granary; the workshops' yards (kiln, pithoi, loom, oil press).

import { box, lathe, place } from '../../core/geom.js';
import { rng, mergeG } from './util.js';
import { mapper, furnisher, FIT } from './furnish.js';

const WALLS = ['mud_plaster', 'lime_plaster_rough', 'plaster_ochre', 'mud_plaster', 'mudbrick'];
const DOOR = { n: [0, -1], s: [0, 1], w: [-1, 0], e: [1, 0] };

/** A thin box laid on a face: along u from u0 to u1 (distance from the face's start), proud by `t`. */
function onFace(rect, f, u0, u1, ya, yb, t, off = 0) {
  const [x0, z0, x1, z1] = rect;
  if (f === 'n') return box(x0 + u0, ya, z0 - t - off, x0 + u1, yb, z0 - off);
  if (f === 's') return box(x0 + u0, ya, z1 + off, x0 + u1, yb, z1 + t + off);
  if (f === 'w') return box(x0 - t - off, ya, z0 + u0, x0 - off, yb, z0 + u1);
  return box(x1 + off, ya, z0 + u0, x1 + t + off, yb, z0 + u1);
}
const lenOf = (rect, f) => (f === 'n' || f === 's' ? rect[2] - rect[0] : rect[3] - rect[1]);

/**
 * house: { rect, y (floor), face (the door's side), storeys, seed, kind ('house' | 'cult' | 'store' | 'workshop'), trade, gd (the ground at the door), lit, low }
 * A house you can walk into: a rubble socle, mudbrick walls plastered, a door with its steps, small windows with shutters, a front room with the hearth
 * and a back room (a stair to the loft in two-storey houses), furnished; a flat clay roof on beams with a smoke hole, a parapet and a spout.
 */
export function house(el, ctx) {
  const { bag, col, lights } = ctx, y = el.y, rand = rng(el.seed ?? 1), kind = el.kind ?? 'house', face = el.face ?? 'n';
  const m = mapper(el.rect, face), { W, D, B, R } = m;
  const st = (kind === 'house' || kind === 'magazine' || kind === 'suite') ? (el.storeys ?? 1) : 1, SH = el.sh ?? 2.95, T = 0.45, H = st * SH, low = el.low ?? y - 3.5;
  const wallMat = kind === 'cult' || kind === 'magazine' || kind === 'suite' ? 'lime_plaster' : WALLS[Math.floor(rand() * WALLS.length)];
  const G = new Map(), add = (mat, g) => { if (!G.has(mat)) G.set(mat, []); G.get(mat).push(g); };
  const Bm = (mat, ...a) => add(mat, B(...a));
  const solid = (u0, v0, u1, v1, ya, yb) => col.rect(R(u0, v0, u1, v1), ya, yb);
  // ── the openings of each wall ──
  const wide = kind === 'workshop' || kind === 'store' || kind === 'magazine', dw = el.dw ?? (wide ? 1.5 : 1.05), dh = el.dh ?? 2.15;
  const du = el.du ?? Math.max(dw / 2 + T + 0.3, Math.min(W - dw / 2 - T - 0.3, W * (rand() < 0.5 ? 0.3 : 0.7) + (rand() - 0.5) * 0.8));
  const two = (kind === 'house' || kind === 'suite') && D >= 6.6 && W >= 6.8, Vp = two ? Math.round(D * 0.55 * 2) / 2 : -1, pu = W - du < W / 2 ? W - du : W - du;
  const wins = (axis, len, ya, extra = []) => {
    // small windows spaced along a wall, avoiding the openings given
    const out = [];
    for (let u = 1.4 + rand() * 0.8; u < len - 1.2; u += 2.6 + rand() * 1.6) {
      if (extra.some((o) => Math.abs(o - u) < 1.3)) continue;
      out.push({ c: u, w: 0.5 + rand() * 0.25, y0: ya + 1.15, y1: ya + 1.95 });
    }
    return out;
  };
  // run a wall of the given extent with openings, as boxes (and colliders) from ya to yb
  const wall = (axis, fixed0, fixed1, s0, s1, ya, yb, ops, mat = wallMat) => {
    const list = ops.slice().sort((p, q) => p.c - q.c);
    const pcs = (a, b, y0, y1) => {
      if (b - a < 1e-3 || y1 - y0 < 1e-3) return;
      if (axis === 'u') { add(mat, B(a, y0, fixed0, b, y1, fixed1)); solid(a, fixed0, b, fixed1, y0, y1); }
      else { add(mat, B(fixed0, y0, a, fixed1, y1, b)); solid(fixed0, a, fixed1, b, y0, y1); }
    };
    let c = s0;
    for (const o of list) {
      const a = o.c - o.w / 2, b = o.c + o.w / 2;
      pcs(c, a, ya, yb);
      if (o.y0 > ya) pcs(a, b, ya, o.y0);
      pcs(a, b, o.y1, yb);
      c = b;
    }
    pcs(c, s1, ya, yb);
  };
  const front = [{ c: du, w: dw, y0: y, y1: y + dh }];
  const fwin = wins('u', W, y, [du]).filter((o) => Math.abs(o.c - du) > dw / 2 + 0.9 && o.c > 1.2 && o.c < W - 1.2);
  const doorU = Vp > 0 ? Math.max(1.4, Math.min(W - 1.4, W - du)) : -1;
  // ── foundation, floor, socle ──
  bag.add('rubble', B(-0.0, low, 0, W, y - 0.02, D));
  const socle = [];
  const sock = (u0, v0, u1, v1) => socle.push(B(u0, low, v0, u1, y + 0.55, v1));
  sock(-0.1, -0.1, du - dw / 2, 0.05); sock(du + dw / 2, -0.1, W + 0.1, 0.05); sock(-0.1, D - 0.05, W + 0.1, D + 0.1); sock(-0.1, -0.1, 0.05, D + 0.1); sock(W - 0.05, -0.1, W + 0.1, D + 0.1);
  // wall faces: the socle is the lower course of the walls (the piece overlaps the wall by a few cm)
  add('rubble', mergeG(socle));
  const floorMat = kind === 'cult' ? 'lime_plaster' : (kind === 'workshop' || kind === 'store' ? 'mud_plaster' : 'plaster_ochre');
  add(floorMat, B(T, y - 0.05, T, W - T, y, D - T));
  col.floor(R(T, T, W - T, D - T), y);
  col.floor(R(du - dw / 2, -0.45, du + dw / 2, T + 0.05), y);                     // the threshold
  // ── the walls, ground floor ──
  const sideWins = (len) => wins('v', len, y);
  wall('u', 0, T, 0, W, y, y + SH - 0.4, [...front, ...fwin.map((o) => ({ ...o }))]);
  wall('u', D - T, D, 0, W, y, y + SH - 0.4, kind === 'store' || kind === 'magazine' ? [] : wins('u', W, y).slice(0, 2));
  const sideV = (u0, u1) => wall('v', u0, u1, T, D - T, y, y + SH - 0.4, kind === 'store' || kind === 'magazine' ? [] : sideWins(D).filter((o) => o.c > T + 0.8 && o.c < D - T - 0.8).slice(0, 2));
  sideV(0, T); sideV(W - T, W);
  if (Vp > 0) wall('u', Vp - 0.15, Vp + 0.15, T, W - T, y, y + SH - 0.4, [{ c: doorU, w: 1.0, y0: y, y1: y + 2.1 }], 'mud_plaster');
  // ── storeys: the floor slab (with a stairwell), the upper walls ──
  const rooms = [];
  const ceilY = y + SH - 0.4;
  if (st > 1) {
    // the stair runs along the back wall from u = T + 0.1 up toward +u; the slab has the hole over it
    const sx0 = T + 0.15, L = 4.4, sv0 = D - T - 1.0, sv1 = D - T;
    const nst = Math.round(SH / 0.19), run = L / nst;
    for (let i = 0; i < nst - 1; i++) add('timber', B(sx0 + i * run, y, sv0, sx0 + L, y + (i + 1) * (SH / nst), sv1));
    col.ramp(R(sx0, sv0, sx0 + L, sv1), y, y + SH, m.dirU);
    // the slab round the hole (the hole is the stair's footprint plus a little)
    const hole = [sx0 - 0.05, sv0 - 0.05, sx0 + L + 0.05, sv1 + 0.0];
    const slab = [[T, T, W - T, hole[1]], [T, hole[1], hole[0], D - T], [hole[2], hole[1], W - T, D - T]];
    for (const [a, b, c, d] of slab) { add('timber', B(a, ceilY - 0.12, b, c, ceilY, d)); add('earth_wall', B(a, ceilY, b, c, y + SH, d)); col.floor(R(a, b, c, d), y + SH); }
    add('timber', B(hole[0], ceilY - 0.12, hole[1] - 0.02, hole[2], y + SH, hole[1] + 0.02));     // the stairwell's rail
    const y2 = y + SH;
    wall('u', 0, T, 0, W, y2 - 0.4, y2 + SH - 0.4, [{ c: du, w: 0.8, y0: y2 + 0.5, y1: y2 + 1.9 }, ...fwin.filter((o) => Math.abs(o.c - du) > 1.2).map((o) => ({ ...o, y0: y2 + 1.1, y1: y2 + 1.9 }))]);
    wall('u', D - T, D, 0, W, y2 - 0.4, y2 + SH - 0.4, [{ c: W * 0.3, w: 0.6, y0: y2 + 1.1, y1: y2 + 1.9 }, { c: W * 0.7, w: 0.6, y0: y2 + 1.1, y1: y2 + 1.9 }]);
    for (const [a, b] of [[0, T], [W - T, W]]) wall('v', a, b, T, D - T, y2 - 0.4, y2 + SH - 0.4, [{ c: D * 0.45, w: 0.6, y0: y2 + 1.1, y1: y2 + 1.9 }]);
    rooms.push({ id: 'the loft', rect: R(T, T, W - T, D - T), y: y2, kind: 'inner' });
    const FL = F_(y2); if (kind === 'magazine') FIT.archive(FL, { u0: T + 0.1, v0: T + 0.1, u1: W - T - 0.1, v1: D - T - 0.1 }); else FIT.loft(FL, { u0: T + 0.1, v0: T + 0.1, u1: W - T - 0.1, v1: D - T - 0.1 }, { sy: y2 }); FL.done();
  }
  const top = y + H;
  // ── the roof: beams, clay, a parapet, the smoke hole over the hearth ──
  const hv = Vp > 0 ? Vp / 2 : D / 2, hu = W / 2, hole2 = kind === 'store' || kind === 'magazine' ? null : [hu - 0.32, hv - 0.32, hu + 0.32, hv + 0.32];
  const slabs = hole2 && st === 1 ? [[0, 0, W, hole2[1]], [0, hole2[1], hole2[0], hole2[3]], [hole2[2], hole2[1], W, hole2[3]], [0, hole2[3], W, D]] : [[0, 0, W, D]];
  for (const [a, b, c, d] of slabs) { add('timber', B(a, top - 0.4, b, c, top - 0.28, d)); add('earth_wall', B(a - 0.06, top - 0.28, b - 0.06, c + 0.06, top, d + 0.06)); }
  if (hole2 && st === 1) add('mud_plaster', mergeG([B(hole2[0] - 0.12, top, hole2[1] - 0.12, hole2[2] + 0.12, top + 0.3, hole2[1]), B(hole2[0] - 0.12, top, hole2[3], hole2[2] + 0.12, top + 0.3, hole2[3] + 0.12), B(hole2[0] - 0.12, top, hole2[1], hole2[0], top + 0.3, hole2[3]), B(hole2[2], top, hole2[1], hole2[2] + 0.12, top + 0.3, hole2[3])]));
  // parapet, thicker than a hand, a spout of clay in the front wall
  add(wallMat, mergeG([B(-0.06, top, -0.06, W + 0.06, top + 0.42, 0.2), B(-0.06, top, D - 0.2, W + 0.06, top + 0.42, D + 0.06), B(-0.06, top, 0.2, 0.2, top + 0.42, D - 0.2), B(W - 0.2, top, 0.2, W + 0.06, top + 0.42, D - 0.2)]));
  add('terracotta', B(W * 0.65, top - 0.05, -0.38, W * 0.65 + 0.2, top + 0.08, 0.12));
  // beam ends of the roof along the front and the sides, and the stringcourse
  const ends = [];
  for (let u = 0.35; u < W - 0.2; u += 0.62) ends.push(B(u - 0.07, top - 0.38, -0.1, u + 0.07, top - 0.24, 0.02));
  for (let v = 0.35; v < D - 0.2; v += 0.62) ends.push(B(-0.1, top - 0.38, v - 0.07, 0.02, top - 0.24, v + 0.07), B(W - 0.02, top - 0.38, v - 0.07, W + 0.1, top - 0.24, v + 0.07));
  add('timber', mergeG(ends));
  // timber ties in the wall courses (front and sides)
  const ties = [];
  for (let s = 0; s < st; s++) { const ya = y + 0.62 + s * SH, yb = ya + 0.1; ties.push(B(0.0, ya, -0.05, du - dw / 2 - 0.05, yb, 0.0), B(du + dw / 2 + 0.05, ya, -0.05, W, yb, 0.0), B(-0.05, ya, 0.0, 0.0, yb, D), B(W, ya, 0.0, W + 0.05, yb, D)); }
  add('timber', mergeG(ties));
  // ── the door: frame, lintel, threshold, steps; some with the leaf open ──
  add('timber', mergeG([B(du - dw / 2 - 0.13, y, -0.12, du - dw / 2, y + dh + 0.14, 0.03), B(du + dw / 2, y, -0.12, du + dw / 2 + 0.13, y + dh + 0.14, 0.03), B(du - dw / 2 - 0.13, y + dh, -0.12, du + dw / 2 + 0.13, y + dh + 0.16, 0.03)]));
  add('limestone_yellow', B(du - dw / 2 - 0.1, y - 0.12, -0.45, du + dw / 2 + 0.1, y + 0.02, 0.0));
  if (rand() < 0.5) add('timber', B(du + dw / 2 + 0.02, y, -0.5, du + dw / 2 + 0.07, y + dh - 0.05, -0.0));
  if (rand() < 0.3) add('plaster_white', mergeG([B(du - dw / 2 - 0.3, y, -0.02, du - dw / 2 - 0.13, y + dh + 0.3, 0.012), B(du + dw / 2 + 0.13, y, -0.02, du + dw / 2 + 0.3, y + dh + 0.3, 0.012)]));
  add('pottery_dark', B(du - dw / 2 - 0.1, y + dh + 0.16, -0.02, du + dw / 2 + 0.1, y + dh + 0.55, 0.01));     // the soot over the door
  // the steps from the lane up to the threshold
  const rise = y - (el.gd ?? y - 0.1);
  if (rise > 0.12) {
    const n = Math.min(6, Math.ceil(rise / 0.19)), tread = 0.36, w2 = dw + 0.3;
    for (let j = 1; j < n; j++) add('limestone_yellow', B(du - w2 / 2, y - rise - 0.4, -j * tread - 0.45, du + w2 / 2, y - j * (rise / n), -(j - 1) * tread - 0.45));
    col.ramp(R(du - w2 / 2, -n * tread - 0.45, du + w2 / 2, -0.0), y - rise, y, m.dirV);
  }
  // ── the front by rule (docs/settlements/mycenae.md §13): porch, quoins, dado, frieze ──
  const fk = el.front ?? 'plain';
  if (fk === 'porch') {
    // two posts of painted timber tapering downward on stone bases, a beam and a clay canopy over the door; a bench of mudbrick and a water jar in its shade
    const u1 = du - dw / 2 - 1.0, u2 = du + dw / 2 + 1.0, vp = -1.35, ph = 2.42, posts = [], caps = [], yb0 = Math.min(y - 0.1, (el.gd ?? y - 0.1) - 0.3);
    for (const u of [u1, u2]) {
      const [x, z] = m.P(u, vp);
      add('limestone_yellow', lathe([[0.27, 0], [0.27, y + 0.16 - yb0], [0.2, y + 0.2 - yb0], [0.001, y + 0.2 - yb0]], 8, null, x, yb0, z));
      posts.push(lathe([[0.001, 0], [0.085, 0.01], [0.09, 0.2], [0.115, ph - 0.25], [0.001, ph - 0.25]], 10, null, x, y + 0.15, z));
      caps.push(lathe([[0.1, 0], [0.17, 0.05], [0.2, 0.12], [0.17, 0.17], [0.001, 0.17]], 10, null, x, y + 0.15 + ph - 0.25, z));
      col.circle(x, z, 0.28, yb0, y + ph + 0.2);
    }
    add('paint_minoan_red', mergeG(posts)); add('pottery_dark', mergeG(caps));
    add('timber', B(u1 - 0.25, y + ph + 0.1, vp - 0.12, u2 + 0.25, y + ph + 0.34, vp + 0.12));
    add('earth_wall', B(u1 - 0.4, y + ph + 0.34, vp - 0.35, u2 + 0.4, y + ph + 0.52, 0.04));
    add(wallMat, mergeG([B(u1 - 0.4, y + ph + 0.52, vp - 0.35, u2 + 0.4, y + ph + 0.7, vp - 0.2), B(u1 - 0.4, y + ph + 0.52, vp - 0.35, u1 - 0.25, y + ph + 0.7, 0.04), B(u2 + 0.25, y + ph + 0.52, vp - 0.35, u2 + 0.4, y + ph + 0.7, 0.04)]));
    const ends = []; for (let v = vp + 0.1; v < -0.05; v += 0.5) ends.push(B(u1 - 0.45, y + ph + 0.12, v - 0.05, u1 - 0.25, y + ph + 0.3, v + 0.05), B(u2 + 0.25, y + ph + 0.12, v - 0.05, u2 + 0.45, y + ph + 0.3, v + 0.05));
    add('timber', mergeG(ends));
    const bu0 = du > W / 2 ? u1 + 0.1 : u2 - 0.65;
    add('mudbrick', B(bu0, yb0, -0.62, bu0 + 0.55, y + 0.42, -0.2)); solid(bu0, -0.62, bu0 + 0.55, -0.2, yb0, y + 0.42);
    const [jx, jz] = m.P(bu0 + 0.27, -0.41); add('terracotta', lathe([[0.001, 0], [0.1, 0.02], [0.17, 0.2], [0.11, 0.38], [0.08, 0.42], [0.001, 0.42]], 8, null, jx, y + 0.42, jz));
  } else if (fk === 'quoin' || fk === 'both') {
    // dressed corner stones, long and short in turn, up the front's two ends (and round the corner a little)
    const q = [], hq = H - 0.45;
    for (let k = 0, ya = y + 0.55; ya < y + hq; k++, ya += 0.44) {
      const a = k % 2 ? 0.95 : 0.5, b = k % 2 ? 0.5 : 0.95;
      q.push(B(-0.05, ya, -0.05, a, ya + 0.41, 0.0), B(-0.05, ya, 0.0, 0.0, ya + 0.41, b * 0.6), B(W - a, ya, -0.05, W + 0.05, ya + 0.41, 0.0), B(W, ya, 0.0, W + 0.05, ya + 0.41, b * 0.6));
    }
    add('limestone_yellow', mergeG(q));
  }
  if (fk === 'dado' || fk === 'both') {
    // a painted band along the front above the socle, broken by the door, one to a storey
    const bands = [];
    for (let s2 = 0; s2 < st; s2++) { const ya = y + 0.78 + s2 * SH; bands.push(B(0.12, ya, -0.02, du - dw / 2 - 0.35, ya + 0.14, 0.0), B(du + dw / 2 + 0.35, ya, -0.02, W - 0.12, ya + 0.14, 0.0)); }
    add(rand() < 0.5 ? 'paint_minoan_red' : 'paint_ochre', mergeG(bands));
  }
  if (fk === 'frieze') {
    // the painted frieze under the parapet: blue and ochre blocks between white joints, as on the palaces' walls
    const blue = [], och = [], wh = [], yf = top - 0.88;
    for (let u = 0.3; u < W - 0.55; u += 0.56) {
      if (Math.abs(u + 0.28 - du) < dw / 2 + 0.5) continue;
      blue.push(B(u, yf, -0.02, u + 0.26, yf + 0.38, 0.0)); och.push(B(u + 0.32, yf, -0.02, u + 0.5, yf + 0.38, 0.0)); wh.push(B(u + 0.26, yf, -0.02, u + 0.32, yf + 0.38, 0.0), B(u + 0.5, yf, -0.02, u + 0.56, yf + 0.38, 0.0));
    }
    if (blue.length) { add('egyptian_blue', mergeG(blue)); add('paint_ochre', mergeG(och)); add('plaster_white', mergeG(wh)); }
  }
  // window frames and open shutters on the front
  const wf = [], sh = [];
  for (const o of fwin) {
    wf.push(B(o.c - o.w / 2 - 0.08, o.y0 - 0.1, -0.08, o.c + o.w / 2 + 0.08, o.y0, 0.02), B(o.c - o.w / 2 - 0.08, o.y1, -0.08, o.c + o.w / 2 + 0.08, o.y1 + 0.08, 0.02));
    sh.push(B(o.c - o.w / 2 - 0.34, o.y0, -0.05, o.c - o.w / 2 - 0.08, o.y1, -0.01), B(o.c + o.w / 2 + 0.08, o.y0, -0.05, o.c + o.w / 2 + 0.34, o.y1, -0.01));
  }
  if (wf.length) { add('timber', mergeG(wf)); add(rand() < 0.5 ? 'paint_minoan_red' : 'timber', mergeG(sh)); }
  // ── weathering at eye level: the plaster fallen to show the brick, rain streaks, damp at the foot ──
  const wr = [], st2 = [], dp = [];
  for (let i = 0; i < 3 + Math.floor(rand() * 3); i++) { const u = rand() * (W - 1.6) + 0.4; if (Math.abs(u - du) < dw) continue; const yy = y + 0.6 + rand() * 1.4, ww = 0.3 + rand() * 0.7; wr.push(B(u, yy, -0.02, u + ww, yy + 0.25 + rand() * 0.5, 0.0)); }
  for (const o of fwin) st2.push(B(o.c - 0.05, Math.max(o.y0 - 0.9, y + 1.0), -0.03, o.c + 0.07, o.y0 - 0.1, -0.012));
  for (let u = 0.7; u < W - 2; u += 1.3 + rand() * 1.2) dp.push(B(u, y + 0.55, -0.011, u + 0.9 + rand() * 0.8, y + 0.9 + rand() * 0.3, 0.0));
  add('mudbrick', mergeG(wr)); if (st2.length) add('plaster_streak', mergeG(st2)); add('plaster_damp', mergeG(dp));
  // ── the roof's own things: jars, fuel, a drying mat, a ladder against the wall ──
  const rt = top + 0.42, rr = [];
  if (rand() < 0.7) { const [x, z] = m.P(W * 0.2 + rand() * W * 0.5, D * 0.3 + rand() * D * 0.4); for (let k = 0; k < 2 + Math.floor(rand() * 2); k++) bag.add('terracotta', lathe([[0.2, 0], [0.38, 0.25], [0.45, 0.6], [0.38, 1.0], [0.24, 1.15], [0.27, 1.22], [0.001, 1.22]].map(([r, h]) => [r * 0.6, h * 0.6]), 8, null, x + k * 0.6, top, z + (k % 2) * 0.3)); }
  if (rand() < 0.5) { const u = W * 0.1 + rand() * W * 0.5; for (let k = 0; k < 4; k++) rr.push(B(u, top + k * 0.1, D * 0.55, u + 1.2 - k * 0.1, top + k * 0.1 + 0.1, D * 0.55 + 0.8)); add('timber', mergeG(rr)); }
  if (rand() < 0.4) { const u = W * 0.3 + rand() * W * 0.3; add('reed_mat', B(u, top, D * 0.2, u + 1.6, top + 0.04, D * 0.2 + 1.1)); add('cloth_ochre', B(u + 0.2, top + 0.04, D * 0.2 + 0.2, u + 0.4, top + 0.07, D * 0.2 + 0.4)); }
  if (st === 1 && rand() < 0.45) { const u = W * (0.15 + rand() * 0.7), r = [B(u, y - 0.1, -0.2, u + 0.05, top + 0.8, -0.14), B(u + 0.4, y - 0.1, -0.2, u + 0.45, top + 0.8, -0.14)]; for (let k = 0; k < 9; k++) r.push(B(u, y + 0.2 + k * 0.38, -0.2, u + 0.45, y + 0.26 + k * 0.38, -0.14)); add('timber', mergeG(r)); }
  // ── the inside ──
  const door = du, fr = { u0: T + 0.1, v0: T + 0.1, u1: W - T - 0.1, v1: (Vp > 0 ? Vp - 0.25 : D - T - 0.1) };
  const F = F_(y), lit = !!el.lit;
  if (kind === 'cult') FIT.cult(F, { u0: T, v0: T, u1: W - T, v1: D - T });
  else if (kind === 'store' || kind === 'magazine') FIT.store(F, { u0: T, v0: T, u1: W - T, v1: D - T }, { door, stairs: st > 1 });
  else if (kind === 'guard') FIT.guard(F, { u0: T, v0: T, u1: W - T, v1: D - T });
  else if (kind === 'suite') { FIT.workshop(F, { u0: T, v0: T, u1: W - T, v1: Vp - 0.25 }, { trade: el.trade ?? 'ivory', light: lit }); FIT.guest(F, { u0: T + 0.1, v0: Vp + 0.25, u1: W - T - 0.1, v1: D - T - 0.1 }, { stairs: st > 1 }); }
  else if (kind === 'workshop') FIT.workshop(F, { u0: T, v0: T, u1: W - T, v1: D - T }, { trade: el.trade ?? 'potter', light: lit });
  else {
    FIT.living(F, fr, { light: lit, door });
    if (Vp > 0) FIT.sleeping(F, { u0: T + 0.1, v0: Vp + 0.25, u1: W - T - 0.1, v1: D - T - 0.1 }, { stairs: st > 1 });
  }
  F.done();
  // the sill stone at the back door and the interior's room records
  rooms.push({ id: kind === 'store' ? 'a storehouse' : kind === 'workshop' ? `a ${el.trade ?? 'potter'}'s workshop` : kind === 'cult' ? 'a shrine' : 'a house', rect: R(T, T, W - T, D - T), y, kind: 'inner' });
  for (const [mat, list] of G) bag.add(mat, mergeG(list));
  void lights;
  // helper: a furnisher on a floor of height yy
  function F_(yy) { return furnisher(ctx, m, yy, rand); }
}

/** granary: { rect, y } — a long storehouse with a stone base, closed walls, a door, the clay roof (pithoi of wheat inside). */
export function granary(el, ctx) {
  const { bag } = ctx;
  house({ ...el, kind: 'store', face: el.face ?? 'n', low: el.y - 1.5 }, ctx);
  const [x0, , x1, z1] = el.rect;
  for (let x = x0 + 1; x < x1 - 0.8; x += 1.4) bag.add('terracotta', lathe([[0.2, 0], [0.38, 0.25], [0.45, 0.6], [0.38, 1.0], [0.24, 1.15], [0.27, 1.22], [0.001, 1.22]], 12, null, x, el.y, z1 + 1.0));
}

/** yard: { kind ('kiln' | 'pithoi' | 'loom' | 'press'), at: [x, z], y, rot, seed } — the small works that stand by a workshop. */
export function yard(el, { bag, col }) {
  const [x, z] = el.at, y = el.y, rand = rng(el.seed ?? 1);
  if (el.kind === 'kiln') {
    bag.add('mudbrick', lathe([[1.1, 0], [1.05, 0.5], [0.8, 1.1], [0.35, 1.5], [0.28, 1.6], [0.001, 1.6]], 14, null, x, y, z));
    bag.add('opening', box(x - 0.3, y + 0.1, z + 0.95, x + 0.3, y + 0.7, z + 1.05));
    bag.add('pottery_dark', lathe([[0.3, 1.58], [0.28, 1.7], [0.001, 1.7]], 8, null, x, y, z));
    col.circle(x, z, 1.15, y, y + 1.6);
    for (let i = 0; i < 6; i++) bag.add('terracotta', lathe([[0.001, 0], [0.12, 0.03], [0.17, 0.2], [0.1, 0.34], [0.001, 0.34]], 8, null, x + 2.0 + (i % 3) * 0.5, y, z - 0.4 + Math.floor(i / 3) * 0.5));
  } else if (el.kind === 'pithoi') {
    for (let i = 0; i < 6; i++) {
      const px = x + (i % 3) * 1.0, pz = z + Math.floor(i / 3) * 1.0, s = 0.9 + rand() * 0.25;
      bag.add('terracotta', lathe([[0.2, 0], [0.38, 0.25], [0.45, 0.6], [0.38, 1.0], [0.24, 1.15], [0.27, 1.22], [0.001, 1.22]].map(([r, hh]) => [r * s, hh * s]), 12, null, px, y, pz));
      col.circle(px, pz, 0.42 * s, y, y + 1.2 * s);
    }
  } else if (el.kind === 'loom') {
    // the warp-weighted loom: two posts and a beam, the threads, the clay weights at their ends
    bag.add('timber', mergeG([box(x - 0.8, y, z - 0.05, x - 0.7, y + 1.9, z + 0.05), box(x + 0.7, y, z - 0.05, x + 0.8, y + 1.9, z + 0.05), box(x - 0.85, y + 1.8, z - 0.06, x + 0.85, y + 1.9, z + 0.06)]));
    bag.add('cloth_ochre', box(x - 0.7, y + 0.45, z - 0.01, x + 0.7, y + 1.8, z + 0.01));
    const w = []; for (let i = 0; i < 12; i++) w.push(box(x - 0.66 + i * 0.12, y + 0.3, z - 0.04, x - 0.58 + i * 0.12, y + 0.45, z + 0.04));
    bag.add('terracotta', mergeG(w)); col.rect([x - 0.85, z - 0.1, x + 0.85, z + 0.1], y, y + 1.9);
  } else if (el.kind === 'threshing') {
    // a threshing floor (docs §13): a round of paved and beaten ground ringed with boulders, the post at its middle, sheaves and a heap of straw at the edge, winnowing fork and fan, baskets and sacks of grain
    const R = el.r ?? 4.6, y0 = y - 1.1, ring = [], sheaf = [], stalk = [], tools = [];
    bag.add('flagstone', lathe([[R, 0], [R, y - y0], [0.001, y - y0]], 24, null, x, y0, z));
    bag.add('mud_plaster', lathe([[R - 0.5, y - y0 + 0.003], [R - 0.5, y - y0 + 0.012], [0.001, y - y0 + 0.012]], 24, null, x, y0, z));
    for (let i = 0; i < 28; i++) { const a = (i / 28) * Math.PI * 2, rr = 0.25 + rand() * 0.12; ring.push(place(box(-rr, y0, -rr * 0.8, rr, y + 0.15 + rand() * 0.12, rr * 0.8), x + Math.cos(a) * (R + 0.1), 0, z + Math.sin(a) * (R + 0.1), -a + rand() * 0.4)); }
    bag.add('rock_boulder', mergeG(ring));
    bag.add('timber', lathe([[0.1, 0], [0.09, 1.7], [0.001, 1.75]], 8, null, x, y + 0.012, z)); col.circle(x, z, 0.14, y, y + 1.7);
    bag.add('rope_fibre', box(x - 0.01, y + 0.3, z, x + 2.3, y + 0.33, z + 0.01));
    for (let k = 0; k < 14; k++) { const a = 0.4 + (k / 14) * 4.6 + rand() * 0.2, rr = R - 0.9 - rand() * 0.6; sheaf.push(lathe([[0.17, 0], [0.12, 0.45], [0.1, 0.7], [0.001, 0.9]], 7, null, x + Math.cos(a) * rr, y + 0.012, z + Math.sin(a) * rr)); }
    bag.add('thatch', mergeG(sheaf));
    for (let k = 0; k < 4; k++) { const a = 4.7 + k * 0.3, rr = R - 0.5; stalk.push(lathe([[0.7 - k * 0.1, 0], [0.5 - k * 0.08, 0.35 + k * 0.1], [0.001, 0.7 + k * 0.2]], 9, null, x + Math.cos(a) * rr, y + 0.012, z + Math.sin(a) * rr)); }
    bag.add('ichu', mergeG(stalk));
    // the winnowing fork leaning on the post and a fan (a shallow basket) with grain, baskets and sacks at the ring's edge
    const fx = x + 0.5, fz = z + 0.35;
    tools.push(box(fx, y + 0.012, fz, fx + 0.05, y + 1.5, fz + 0.05), box(fx - 0.12, y + 1.5, fz, fx + 0.17, y + 1.55, fz + 0.05), box(fx - 0.12, y + 1.55, fz, fx - 0.09, y + 1.8, fz + 0.05), box(fx + 0.14, y + 1.55, fz, fx + 0.17, y + 1.8, fz + 0.05), box(fx + 0.01, y + 1.55, fz, fx + 0.04, y + 1.82, fz + 0.05));
    bag.add('timber', mergeG(tools));
    bag.add('wicker', lathe([[0.45, 0], [0.4, 0.07], [0.001, 0.05]], 12, null, x - 1.5, y + 0.012, z + 1.0));
    bag.add('plaster_ochre', lathe([[0.38, 0.055], [0.001, 0.1]], 10, null, x - 1.5, y + 0.012, z + 1.0));
    bag.add('wicker', mergeG([lathe([[0.22, 0], [0.34, 0.2], [0.36, 0.45], [0.001, 0.45]], 8, null, x - 3.6, y + 0.012, z - 1.8), lathe([[0.22, 0], [0.34, 0.2], [0.36, 0.45], [0.001, 0.45]], 8, null, x - 3.1, y + 0.012, z - 2.4)]));
    for (let k = 0; k < 3; k++) bag.add('sacking', box(x + 2.4 + k * 0.5, y + 0.012, z - 3.5 + (k % 2) * 0.3, x + 2.8 + k * 0.5, y + 0.52, z - 3.1 + (k % 2) * 0.3));
    col.circle(x + 2.6, z - 3.3, 0.7, y, y + 0.6);
  } else if (el.kind === 'oven') {
    // a clay bread-oven: a dome on a base of stones with its mouth turned to the rot, a slab before it, the wood and the baker's peel, a kneading trough
    const rot = el.rot ?? 0, P = (g) => place(g, x, 0, z, rot), y0 = y - 0.4;
    bag.add('rubble', P(box(-0.8, y0, -0.8, 0.8, y + 0.38, 0.8)));
    bag.add('mudbrick', P(lathe([[0.74, 0], [0.72, 0.3], [0.5, 0.62], [0.2, 0.82], [0.001, 0.9]], 14, null, 0, y + 0.38, 0)));
    bag.add('pottery_dark', P(box(-0.22, y + 0.46, 0.5, 0.22, y + 0.86, 0.72)));
    bag.add('limestone_yellow', P(box(-0.5, y0, 0.78, 0.5, y + 0.38, 1.25)));
    bag.add('timber', P(mergeG([box(-0.02, y + 0.39, 0.85, 0.02, y + 0.41, 2.1), box(-0.14, y + 0.39, 2.1, 0.14, y + 0.41, 2.3)])));
    bag.add('timber', P(mergeG([box(0.95, y0, 0.2, 1.7, y + 0.35, 0.4), box(0.95, y0, 0.45, 1.7, y + 0.35, 0.65), box(0.95, y + 0.35, 0.2, 1.7, y + 0.7, 0.4), box(1.0, y + 0.7, 0.28, 1.65, y + 1.05, 0.38)])));
    bag.add('terracotta', P(lathe([[0.001, 0], [0.3, 0.02], [0.42, 0.22], [0.38, 0.28], [0.001, 0.2]], 10, null, -1.5, y, 0.6)));
    col.circle(x, z, 1.0, y0, y + 1.0);
  } else if (el.kind === 'arbour') {
    // a vine arbour on four posts: rails, a roof of vine over them with leaves and grapes, a table and two stools beneath
    const rot = el.rot ?? 0, P = (g) => place(g, x, 0, z, rot), post = [], rail = [], leaf = [], fruit = [], hh = 2.3;
    for (const [a, b] of [[-1.3, -2.0], [1.3, -2.0], [-1.3, 2.0], [1.3, 2.0]]) { post.push(box(a - 0.07, y - 0.3, b - 0.07, a + 0.07, y + hh, b + 0.07)); col.circle(...(() => { const c = Math.cos(rot), sn = Math.sin(rot); return [x + c * a + sn * b, z - sn * a + c * b]; })(), 0.1, y, y + hh); }
    for (const b of [-2.0, 2.0]) rail.push(box(-1.45, y + hh, b - 0.06, 1.45, y + hh + 0.1, b + 0.06));
    for (let b = -1.8; b <= 1.8; b += 0.45) rail.push(box(-1.4, y + hh + 0.1, b - 0.025, 1.4, y + hh + 0.15, b + 0.025));
    for (let i = 0; i < 46; i++) leaf.push(box(-1.4 + rand() * 2.5, y + hh + 0.12 + rand() * 0.1, -2.0 + rand() * 3.6, -1.4 + rand() * 2.5 + 0.5, y + hh + 0.15 + rand() * 0.14, -2.0 + rand() * 3.6 + 0.4));
    for (let i = 0; i < 16; i++) { const a = -1.1 + rand() * 2.2, b = -1.8 + rand() * 3.6; fruit.push(lathe([[0.05, 0], [0.06, -0.09], [0.001, -0.2]], 5, null, a, y + hh, b)); }
    bag.add('timber', P(mergeG([...post, ...rail]))); bag.add('cloth_green', P(mergeG(leaf))); bag.add('paint_minoan_black', P(mergeG(fruit)));
    bag.add('timber', P(mergeG([box(-0.5, y + 0.66, -0.4, 0.5, y + 0.72, 0.4), ...[[-0.45, -0.35], [0.45, -0.35], [-0.45, 0.35], [0.45, 0.35]].map(([a, b]) => box(a - 0.03, y, b - 0.03, a + 0.03, y + 0.66, b + 0.03)), box(-0.9, y + 0.3, -0.15, -0.55, y + 0.34, 0.15), box(0.55, y + 0.3, -0.15, 0.9, y + 0.34, 0.15)])));
    bag.add('terracotta', P(lathe([[0.001, 0], [0.12, 0.02], [0.17, 0.2], [0.1, 0.38], [0.001, 0.4]], 8, null, 0.1, y + 0.72, 0.0)));
    col.rect([x - 0.55, z - 0.55, x + 0.55, z + 0.55], y, y + 0.75);
  } else {
    // the oil press: a stone basin, a beam weighted by a stone, jars
    bag.add('limestone_yellow', lathe([[0.9, 0], [0.9, 0.5], [0.6, 0.5], [0.6, 0.35], [0.001, 0.35]], 12, null, x, y, z));
    bag.add('timber', mergeG([box(x - 0.1, y, z - 0.1, x + 0.1, y + 1.6, z + 0.1), box(x - 0.3, y + 1.0, z - 0.12, x + 2.6, y + 1.2, z + 0.12)]));
    bag.add('rock_boulder', box(x + 2.3, y + 0.35, z - 0.3, x + 2.9, y + 1.0, z + 0.3));
    col.circle(x, z, 0.95, y, y + 0.5);
    bag.add('terracotta', lathe([[0.001, 0], [0.14, 0.03], [0.22, 0.25], [0.2, 0.42], [0.12, 0.5], [0.001, 0.5]], 10, null, x - 1.3, y, z + 0.3));
  }
  void place;
}

/** forecourt: { rect, face (the house's door side), y, du (the door's u along the front), seed } — the paved court before a workshop, walled low with a gap on the lane. */
export function forecourt(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, f = el.face, alongX = f === 'n' || f === 's', rand = rng(el.seed ?? 1);
  bag.add('rubble', box(x0, y - 2.2, z0, x1, y - 0.1, z1));
  bag.add('flagstone', box(x0, y - 0.1, z0, x1, y - 0.02, z1));
  col.floor(el.rect, y - 0.02);
  const T = 0.5, Hh = 0.95 + rand() * 0.2, gw = 1.1, g0 = (alongX ? x0 : z0) + (el.du ?? 3) - gw, g1 = g0 + gw * 2, rb = [], cap = [];
  const wallR = (r) => { rb.push(box(r[0], y - 0.6, r[1], r[2], y + Hh, r[3])); cap.push(box(r[0] - 0.04, y + Hh, r[1] - 0.04, r[2] + 0.04, y + Hh + 0.12, r[3] + 0.04)); col.rect(r, y, y + Hh + 0.12); };
  // the lane side, in two pieces round the gap; the two sides
  if (alongX) {
    const zf = f === 'n' ? [z0, z0 + T] : [z1 - T, z1];
    if (g0 > x0) wallR([x0, zf[0], g0, zf[1]]); if (g1 < x1) wallR([g1, zf[0], x1, zf[1]]);
    wallR([x0, z0, x0 + T, z1]); wallR([x1 - T, z0, x1, z1]);
  } else {
    const xf = f === 'w' ? [x0, x0 + T] : [x1 - T, x1];
    if (g0 > z0) wallR([xf[0], z0, xf[1], g0]); if (g1 < z1) wallR([xf[0], g1, xf[1], z1]);
    wallR([x0, z0, x1, z0 + T]); wallR([x0, z1 - T, x1, z1]);
  }
  bag.add('rubble', mergeG(rb)); bag.add('rock_boulder', mergeG(cap));
}
