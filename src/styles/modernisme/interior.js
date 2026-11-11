// A house of the Eixample you can walk into (docs/settlements/barcelona.md §6): on the Passeig's west side, in the gap
// of a block, a house of five bays with, from the street, a café (three bays: two arched windows and the door, marble
// tables, bentwood chairs, the bar with its mirrored back-bar, a billiard table), the portal with its stair hall (two
// flights of marble up a light well lined in blue tile, a glazed lantern on the roof), a confectioner's shop, and over them
// the principal floor's flat: a vestibule, the salon (the corner fireplace nook, a piano, a sofa, the swirl plaster
// ceiling), the dining room, a bedroom and a kitchen at the back. Everything is built in the house's own frame (a along the
// front, b inward from the street line, y up) and set in the world once. The front faces east (+x).
import { box, lathe, rod, fromTriangles, quad } from '../../core/geom.js';

const T = 0.3;                                              // party and partition walls
const W = 16, D = 18;
const IRON = 'iron';

/** casa_cafe: { fx (x of the street front), z0 (z where its north end stands), y (the street's level), h (the house's height), seed }; H the style's helpers. */
export function casaCafe(el, ctx, H) {
  const { bag, col, lights } = ctx;
  const fx = el.fx, Z0 = el.z0, y = el.y ?? 0, hh = el.h ?? 21.1, F0 = y + 0.12, PF = y + 7.4, mat = 'stucco_pale';
  const X = (b) => fx - b, Z = (a) => Z0 + a;
  const bx = (m, a0, b0, a1, b1, y0, y1) => { if (a1 - a0 < 1e-4 || b1 - b0 < 1e-4 || y1 - y0 < 1e-4) return; bag.add(m, box(Math.min(X(b0), X(b1)), y0, Math.min(Z(a0), Z(a1)), Math.max(X(b0), X(b1)), y1, Math.max(Z(a0), Z(a1)))); };
  const ob = (a0, b0, a1, b1, y0, y1) => col.rect([X(b0), Z(a0), X(b1), Z(a1)], y0, y1);
  const solid = (m, a0, b0, a1, b1, y0, y1, collide = true) => { bx(m, a0, b0, a1, b1, y0, y1); if (collide) ob(a0, b0, a1, b1, y0, y1); };
  const lat = (m, prof, a, b, yy, seg = 12) => bag.add(m, lathe(prof, seg, null, X(b), yy, Z(a)));
  const rd = (m, p, q, r, seg = 6) => bag.add(m, rod([X(p[1]), p[2], Z(p[0])], [X(q[1]), q[2], Z(q[0])], r, seg));       // points are [a, b, y]
  const circ = (a, b, r, y0, y1) => col.circle(X(b), Z(a), r, y0, y1);
  const light = (a, b, yy, color = '#ffc98a', intensity = 7, distance = 9) => lights?.push({ at: [X(b), yy, Z(a)], color, intensity, distance });

  /** A wall along a (at depth b) or along b (at a), th thick, y0…y1, with door-like cuts [{ c, w, y0, y1 }] (the wall continues over and under them). */
  const wall = (m, along, at, s0, s1, th, y0, y1, cuts = [], collide = true) => {
    const put = (p0, p1, z0, z1) => { if (p1 - p0 < 1e-3 || z1 - z0 < 1e-3) return; if (along === 'a') solid(m, p0, at - th / 2, p1, at + th / 2, z0, z1, collide); else solid(m, at - th / 2, p0, at + th / 2, p1, z0, z1, collide); };
    let s = s0;
    for (const c of [...cuts].sort((p, q) => p.c - q.c)) {
      const c0 = c.c - c.w / 2, c1 = c.c + c.w / 2, cy0 = c.y0 ?? y0, cy1 = c.y1 ?? y1;
      put(s, c0, y0, y1); if (cy0 > y0 + 1e-3) put(c0, c1, y0, cy0); put(c0, c1, cy1, y1); s = c1;
    }
    put(s, s1, y0, y1);
  };

  // ── the shell ──────────────────────────────────────────────────────────────────────────────────
  const fr = H.frame([fx, Z0], [fx, Z0 + W]);
  // the ground floor and the stair hall's floor; the entresol's mass over them
  bx('granite_grey', 0, 0, W, 0.5, y - 1.25, y + 0.45);
  const WELL = { a0: 9.55, a1: 12.6, b0: 4.5, b1: 15.2 };
  bx('marble_floor', 0, 0.5, W, D - 0.4, y - 0.4, F0);
  col.floor([X(D - 0.4), Z(0), X(0.5), Z(W)], F0);
  // the front wall: real openings, the stone of the house; piers and lintels
  const facade = [];
  // ground floor: the café's two arched windows and its door, the portal, the shop's window and its door
  const CW = [[0.8, 2.4], [6.8, 2.4]];
  const frontCuts = [
    ...CW.map(([a0, w]) => ({ c: a0 + w / 2, w, y0: y + 0.85, y1: y + 3.55 })), { c: 4.8, w: 1.9, y0: F0, y1: y + 3.5 },
    { c: 11.2, w: 2.0, y0: F0, y1: y + 3.7 },
    { c: 13.75, w: 1.6, y0: y + 0.55, y1: y + 3.3 }, { c: 15.3, w: 0.95, y0: F0, y1: y + 3.3 },
    // the principal floor: a window to each bay
    ...[0, 1, 2, 3, 4].map((i) => ({ c: 1.6 + 3.2 * i, w: 1.4, y0: PF + 0.06, y1: PF + 0.06 + 2.85 })),
  ];
  // the front wall is one piece to the roof, cut by the openings (the cuts pierce only their own heights)
  const cutWall = () => {
    const segs = [], ops = frontCuts.map((c) => ({ a0: c.c - c.w / 2, a1: c.c + c.w / 2, y0: c.y0, y1: c.y1 }));
    const edges = [...new Set([0, W, ...ops.flatMap((o) => [o.a0, o.a1])])].sort((p, q) => p - q);
    const levels = [y - 1.25, ...new Set(ops.flatMap((o) => [o.y0, o.y1]))].sort((p, q) => p - q);
    levels.push(y + hh);
    for (let i = 0; i + 1 < edges.length; i++) for (let j = 0; j + 1 < levels.length; j++) {
      const am = (edges[i] + edges[i + 1]) / 2, ym = (levels[j] + levels[j + 1]) / 2;
      if (ops.some((o) => am > o.a0 && am < o.a1 && ym > o.y0 && ym < o.y1)) continue;
      segs.push([edges[i], edges[i + 1], levels[j], levels[j + 1]]);
    }
    // merge the cells of a column that touch (same a-range, consecutive levels)
    const out = []; segs.sort((p, q) => p[0] - q[0] || p[2] - q[2]);
    for (const s of segs) { const l = out[out.length - 1]; if (l && l[0] === s[0] && l[1] === s[1] && Math.abs(l[3] - s[2]) < 1e-6) l[3] = s[3]; else out.push([...s]); }
    return out;
  };
  for (const [a0, a1, y0, y1] of cutWall()) { bx(mat, a0, 0, a1, 0.5, y0, y1); ob(a0, 0, a1, 0.5, y0, y1); }
  // the back wall (the court side), with its windows at the café, the kitchen and the bedroom
  const backCuts = [{ c: 2.3, w: 1.6, y0: y + 1.1, y1: y + 3.4 }, { c: 6.7, w: 1.6, y0: y + 1.1, y1: y + 3.4 }, { c: 2.3, w: 1.4, y0: PF + 0.8, y1: PF + 3.0 }, { c: 6.7, w: 1.4, y0: PF + 0.8, y1: PF + 3.0 }, { c: 14.4, w: 1.2, y0: PF + 1.0, y1: PF + 3.0 }];
  {
    const ops = backCuts.map((c) => ({ a0: c.c - c.w / 2, a1: c.c + c.w / 2, y0: c.y0, y1: c.y1 }));
    const edges = [...new Set([0, W, ...ops.flatMap((o) => [o.a0, o.a1])])].sort((p, q) => p - q), levels = [y - 1.25, ...new Set(ops.flatMap((o) => [o.y0, o.y1])), y + hh].sort((p, q) => p - q);
    const segs = [];
    for (let i = 0; i + 1 < edges.length; i++) for (let j = 0; j + 1 < levels.length; j++) {
      const am = (edges[i] + edges[i + 1]) / 2, ym = (levels[j] + levels[j + 1]) / 2;
      if (ops.some((o) => am > o.a0 && am < o.a1 && ym > o.y0 && ym < o.y1)) continue;
      segs.push([edges[i], edges[i + 1], levels[j], levels[j + 1]]);
    }
    segs.sort((p, q) => p[0] - q[0] || p[2] - q[2]);
    const out = []; for (const s of segs) { const l = out[out.length - 1]; if (l && l[0] === s[0] && l[1] === s[1] && Math.abs(l[3] - s[2]) < 1e-6) l[3] = s[3]; else out.push([...s]); }
    for (const [a0, a1, y0, y1] of out) { bx(mat, a0, D - 0.4, a1, D, y0, y1); ob(a0, D - 0.4, a1, D, y0, y1); }
    for (const c of backCuts) { bx('wood_painted', c.c - c.w / 2, D - 0.2, c.c + c.w / 2, D - 0.17, c.y0, c.y1); bx('glass_outer', c.c - c.w / 2 + 0.05, D - 0.24, c.c + c.w / 2 - 0.05, D - 0.22, c.y0 + 0.05, c.y1 - 0.05); }
  }
  // the mass over the principal floor, round the light well's shaft up to the roof; the roof's tile and parapet come with the front
  const ceilTop = y + 11.0;
  bx(mat, 0, 0.5, WELL.a0 - 0.05, D - 0.4, ceilTop, y + hh); bx(mat, WELL.a1 + 0.05, 0.5, W, D - 0.4, ceilTop, y + hh);
  bx(mat, WELL.a0 - 0.05, 0.5, WELL.a1 + 0.05, WELL.b0, ceilTop, y + hh); bx(mat, WELL.a0 - 0.05, WELL.b1, WELL.a1 + 0.05, D - 0.4, ceilTop, y + hh);
  // (the neighbours' flanks are the party walls: the gap's sides at a = 0 and a = W)
  // the roof: terrace floor over the mass; the shaft's glazed lantern
  bx('slate', 0, 0.5, W, D - 0.4, y + hh - 0.02, y + hh);
  col.floor([X(D - 0.4), Z(0), X(0.5), Z(W)], y + hh);
  const ls = { a0: WELL.a0 - 0.05, a1: WELL.a1 + 0.05, b0: WELL.b0, b1: WELL.b1 };
  bx('wood_painted', ls.a0, ls.b0, ls.a1, ls.b1, y + hh, y + hh + 0.35);
  bx('glass_outer', ls.a0 + 0.15, ls.b0 + 0.15, ls.a1 - 0.15, ls.b1 - 0.15, y + hh + 0.34, y + hh + 0.38);
  ob(ls.a0, ls.b0, ls.a1, ls.b1, y + hh, y + hh + 0.4);
  // (the lantern's glass is a flat pane: the tortoise-shell skylights of Casa Batlló stand for the idea; the shaft below is open to it)

  // the party walls of the hall and the partitions (stone from the ground to the principal floor's ceiling), inside faces lined
  const A1 = 9.4, A2 = 12.75;
  wall('stucco_cream', 'b', A1, 0.5, D - 0.4, T, y - 0.3, ceilTop, [{ c: 2.3, w: 1.15, y0: PF, y1: PF + 2.55 }]);
  wall('stucco_cream', 'b', A2, 0.5, D - 0.4, T, y - 0.3, ceilTop, [{ c: 2.3, w: 1.15, y0: PF, y1: PF + 2.55 }]);

  // floors and ceilings: the ground floor's ceiling and the entresol's mass (solid), the principal floor's slab round the shaft
  const mass = (a0, b0, a1, b1) => { bx('plaster_white', a0, b0, a1, b1, y + 4.45, PF - 0.02); };
  mass(0.05, 0.5, A1 - T / 2, D - 0.4); mass(A1 + T / 2, 0.5, A2 - T / 2, WELL.b0); mass(A1 + T / 2, WELL.b1, A2 - T / 2, D - 0.4); mass(A2 + T / 2, 0.5, W - 0.05, D - 0.4);
  const slab = (m, a0, b0, a1, b1) => { bx(m, a0, b0, a1, b1, PF - 0.02, PF - 0.0); };
  void slab;
  // principal floor surfaces: parquet in the salon, dining room and bedroom, hydraulic tile in the vestibule and the kitchen
  const FL = PF;
  bx('wood_ochre', 0.05, 0.5, A1 - T / 2, D - 0.4, PF - 0.02, FL); bx('wood_ochre', A2 + T / 2, 0.5, W - 0.05, 7.6, PF - 0.02, FL);
  bx('tile_cream', A2 + T / 2, 7.9, W - 0.05, D - 0.4, PF - 0.02, FL);
  bx('tile_cream', A1 + T / 2, 0.5, A2 - T / 2, WELL.b0, PF - 0.02, FL);
  col.floor([X(D - 0.4), Z(0.05), X(0.5), Z(A1 - T / 2)], FL); col.floor([X(D - 0.4), Z(A2 + T / 2), X(0.5), Z(W - 0.05)], FL); col.floor([X(WELL.b0), Z(A1 + T / 2), X(0.5), Z(A2 - T / 2)], FL);
  // the principal floor's ceiling (the swirl plaster of the salon is below)
  bx('plaster_white', 0.05, 0.5, A1 - T / 2, D - 0.4, ceilTop - 0.18, ceilTop); bx('plaster_white', A2 + T / 2, 0.5, W - 0.05, D - 0.4, ceilTop - 0.18, ceilTop); bx('plaster_white', A1 + T / 2, 0.5, A2 - T / 2, WELL.b0, ceilTop - 0.18, ceilTop);
  // the sealed back of the stair hall (behind the landing)
  solid('stucco_cream', A1 + T / 2, WELL.b1, A2 - T / 2, D - 0.4, y, PF, false);
  // interior partitions of the flat at the back: the bedroom and the kitchen cut off from the front rooms
  wall('stucco_cream', 'a', 7.75, 0.05, A1 - T / 2, 0.2, PF, ceilTop, [{ c: 2.4, w: 1.1, y0: PF, y1: PF + 2.5 }]);
  wall('stucco_cream', 'a', 7.75, A2 + T / 2, W - 0.05, 0.2, PF, ceilTop, [{ c: 14.1, w: 1.1, y0: PF, y1: PF + 2.5 }]);

  // the shaft: blue tile above the principal floor, white below
  const lining = (m, y0, y1) => {
    bx(m, WELL.a0, WELL.b0, WELL.a0 + 0.04, WELL.b1, y0, y1); bx(m, WELL.a1 - 0.04, WELL.b0, WELL.a1, WELL.b1, y0, y1);
    bx(m, WELL.a0, WELL.b1 - 0.04, WELL.a1, WELL.b1, y0, y1); bx(m, WELL.a0, WELL.b0, WELL.a1, WELL.b0 + 0.04, PF, y1);
  };
  lining('tile_white', F0, PF); lining('tile_turquoise', PF, y + hh);
  // the stair: two flights of 22 steps (stepped slabs, so that there is air under them), a landing at the back
  const N = 22, rise = (PF - F0) / 2, r = rise / N, run = (WELL.b1 - 2.2 - WELL.b0) / N;        // flights from b 4.5 to b 13
  const flight = (aa, ab, upToward, yStart) => {
    for (let i = 0; i < N; i++) {
      const t0 = i * run, t1 = (i + 1) * run, top = yStart + (i + 1) * r;
      const [b0, b1] = upToward > 0 ? [WELL.b0 + t0, WELL.b0 + t1] : [WELL.b1 - 2.2 - t1, WELL.b1 - 2.2 - t0];
      bx('marble', aa, b0, ab, b1, top - 0.42, top);
      bx('marble_floor', aa, b0 - (upToward > 0 ? 0 : 0.0), ab, b1, top - 0.02, top);
    }
    const bb = upToward > 0 ? [WELL.b0, WELL.b1 - 2.2] : [WELL.b1 - 2.2, WELL.b0];
    col.ramp([X(Math.max(...bb)), Z(aa), X(Math.min(...bb)), Z(ab)], yStart, yStart + rise, upToward > 0 ? 'w' : 'e');
  };
  flight(9.65, 10.9, 1, F0);
  flight(11.25, 12.5, -1, F0 + rise);
  // the landing
  bx('marble', WELL.a0, WELL.b1 - 2.2, WELL.a1, WELL.b1, F0 + rise - 0.42, F0 + rise); bx('marble_floor', WELL.a0, WELL.b1 - 2.2, WELL.a1, WELL.b1, F0 + rise - 0.02, F0 + rise);
  col.floor([X(WELL.b1), Z(WELL.a0), X(WELL.b1 - 2.2), Z(WELL.a1)], F0 + rise);
  // the balustrade: a wrought-iron rail on each flight's open side, the stair-head's guard, and the central wall of rail for the collision
  const rail = (a, bA, yA, bB, yB) => {
    rd(IRON, [a, bA, yA + 0.92], [a, bB, yB + 0.92], 0.022, 6);
    const n = Math.round(Math.abs(bB - bA) / 0.16);
    for (let k = 0; k <= n; k++) { const b = bA + (bB - bA) * k / n, yy = yA + (yB - yA) * k / n; rd(IRON, [a, b, yy], [a, b, yy + 0.92], k % 4 === 0 ? 0.02 : 0.009, 5); }
  };
  rail(11.07, WELL.b0, F0 + 2 * rise, WELL.b1 - 2.2, F0 + rise);     // (between the flights: the second flight's left)
  rail(11.07, WELL.b0, F0, WELL.b1 - 2.2, F0 + rise);
  for (let k = 0; k <= 5; k++) { const a = 9.6 + k * 0.29; rd(IRON, [a, WELL.b0, PF], [a, WELL.b0, PF + 0.95], 0.011, 5); }
  rd(IRON, [9.6, WELL.b0, PF + 0.95], [11.07, WELL.b0, PF + 0.95], 0.024, 6);
  ob(11.04, WELL.b0, 11.1, WELL.b1 - 2.2, F0, PF + 1.0);
  ob(9.55, WELL.b0 - 0.05, 11.1, WELL.b0 + 0.05, PF, PF + 1.0);

  // ── the street front: upper floors, cornice and parapet as the other houses'; the windows' frames and glass ─────────
  H.streetFront(bag, fr, 0, W, y, hh, mat, H.rng(el.seed ?? 5), false, { own: true });
  H.courtFront(bag, fr, 0, W, y, hh, D, H.rng((el.seed ?? 5) + 3), 3);
  H.roofTop(bag, fr, 0, W, y, hh, D, (el.seed ?? 5) * 13 + 7);
  const F = fr.F;
  // the café's two arched windows and its door: moulded stone frames, the glazing in wood with an arched fanlight of coloured glass
  const arch = (a0, w, y0, y1) => {
    const ac = a0 + w / 2, rr = w / 2, ys = y1 - rr * 0.0;
    bag.add('limestone_yellow', F(a0 - 0.22, a0 + 0.02, 0, 0.2, y0 - 0.1, y1 + 0.12)); bag.add('limestone_yellow', F(a0 + w - 0.02, a0 + w + 0.22, 0, 0.2, y0 - 0.1, y1 + 0.12));
    bag.add('limestone_yellow', F(a0 - 0.22, a0 + w + 0.22, 0, 0.2, y1, y1 + 0.34));                   // the arched head's lintel, stepped
    bag.add('limestone_yellow', F(ac - rr * 0.6, ac + rr * 0.6, 0, 0.26, y1 + 0.34, y1 + 0.5));
    void ys;
  };
  for (const [a0, w] of CW) {
    arch(a0, w, y + 0.85, y + 3.55);
    bag.add('limestone_yellow', F(a0 - 0.1, a0 + w + 0.1, 0, 0.16, y + 0.78, y + 0.9));
    bag.add('wood_painted', F(a0, a0 + w, -0.46, -0.36, y + 0.85, y + 0.98)); bag.add('wood_painted', F(a0, a0 + w, -0.46, -0.36, y + 2.75, y + 2.85));
    for (let m = 0; m <= 2; m++) { const s = a0 + m * w / 2; bag.add('wood_painted', F(s - 0.04 + (m === 0 ? 0.04 : m === 2 ? -0.04 : 0), s + 0.04 + (m === 0 ? 0.04 : m === 2 ? -0.04 : 0), -0.46, -0.36, y + 0.85, y + 3.55)); }
    bag.add('glass_outer', F(a0 + 0.04, a0 + w - 0.04, -0.43, -0.41, y + 0.98, y + 2.75));
    bag.add('stained_glass', F(a0 + 0.04, a0 + w - 0.04, -0.43, -0.41, y + 2.85, y + 3.55));
    // the whiplash in the fanlight: three iron curves
    for (let k = 0; k < 3; k++) { const s = a0 + 0.4 + k * (w - 0.8) / 2; bag.add(IRON, F(s - 0.015, s + 0.015, -0.47, -0.45, y + 2.85, y + 3.55)); }
  }
  // the café door: leaves folded back, a fanlight, the step
  arch(3.85, 1.9, F0, y + 3.5);
  bag.add('wood_painted', F(3.85, 3.97, -0.5, 0, F0, y + 3.5)); bag.add('wood_painted', F(5.67, 5.79, -0.5, 0, F0, y + 3.5));
  bag.add('glass_outer', F(3.97, 4.15, -0.44, -0.42, F0 + 0.1, y + 2.9)); bag.add('glass_outer', F(5.49, 5.67, -0.44, -0.42, F0 + 0.1, y + 2.9));
  bag.add('stained_glass', F(3.97, 5.67, -0.44, -0.42, y + 3.0, y + 3.5));
  bag.add('granite_grey', F(3.6, 6.0, 0.0, 0.5, y - 0.2, y + 0.07));
  // the portal: the iron-and-glass doors open against the jambs, the fanlight, the step
  bag.add('limestone_yellow', F(9.85, 10.1, 0, 0.26, y + 0.4, y + 3.9)); bag.add('limestone_yellow', F(12.3, 12.55, 0, 0.26, y + 0.4, y + 3.9));
  bag.add('limestone_yellow', F(9.85, 12.55, 0, 0.3, y + 3.7, y + 4.1));
  bag.add('wood_dark', F(10.2, 10.3, -0.5, 0, F0, y + 3.7)); bag.add('wood_dark', F(12.1, 12.2, -0.5, 0, F0, y + 3.7));
  bag.add('stained_glass', F(10.3, 12.1, -0.44, -0.42, y + 3.0, y + 3.7));
  bag.add('granite_grey', F(10.0, 12.4, 0.0, 0.5, y - 0.2, y + 0.07));
  // the shop: its window and its door in the wooden front (a plate-glass window, the fascia with its lettering band), a stone step
  bag.add('wood_painted', F(12.95, 14.55, -0.46, -0.36, y + 0.55, y + 0.7)); bag.add('wood_painted', F(12.95, 14.55, -0.46, -0.36, y + 3.1, y + 3.3));
  for (const s of [12.95, 13.75, 14.5]) bag.add('wood_painted', F(s - 0.04, s + 0.04, -0.46, -0.36, y + 0.55, y + 3.3));
  bag.add('glass_outer', F(12.99, 14.46, -0.43, -0.41, y + 0.7, y + 3.1));
  bag.add('wood_painted', F(12.85, 15.9, 0.0, 0.1, y + 3.3, y + 4.1)); bag.add('cloth_maroon', F(12.95, 15.8, 0.1, 0.12, y + 3.45, y + 3.95));
  bag.add('glass_outer', F(14.9, 15.7, -0.43, -0.41, F0 + 0.1, y + 3.0)); bag.add('wood_painted', F(14.85, 14.93, -0.46, -0.36, F0, y + 3.3)); bag.add('wood_painted', F(15.7, 15.78, -0.46, -0.36, F0, y + 3.3));
  bag.add('granite_grey', F(14.7, 16.0, 0.0, 0.5, y - 0.2, y + 0.07));
  // the principal floor's windows: stone sill, lintel and pediment as the other houses', the glazing with its stained-glass transom
  for (let i = 0; i < 5; i++) {
    const sc = 1.6 + 3.2 * i, y0 = PF + 0.06, y1 = y0 + 2.85;
    bag.add('limestone_yellow', F(sc - 0.88, sc + 0.88, 0, 0.18, y1, y1 + 0.42)); bag.add('limestone_yellow', F(sc - 1.0, sc + 1.0, 0, 0.26, y1 + 0.42, y1 + 0.54));
    bag.add('limestone_yellow', F(sc - 0.88, sc - 0.7, 0, 0.14, y0, y1)); bag.add('limestone_yellow', F(sc + 0.7, sc + 0.88, 0, 0.14, y0, y1));
    bag.add('wood_painted', F(sc - 0.7, sc + 0.7, -0.4, -0.32, y0, y0 + 0.08)); bag.add('wood_painted', F(sc - 0.7, sc + 0.7, -0.4, -0.32, y0 + 2.0, y0 + 2.06)); bag.add('wood_painted', F(sc - 0.04, sc + 0.04, -0.4, -0.32, y0, y1));
    bag.add('glass_outer', F(sc - 0.66, sc + 0.66, -0.37, -0.35, y0 + 0.08, y0 + 2.0));
    bag.add('stained_glass', F(sc - 0.66, sc + 0.66, -0.37, -0.35, y0 + 2.06, y1));
  }

  // ── the café ───────────────────────────────────────────────────────────────────────────────────
  const cA0 = 0.05, cA1 = A1 - T / 2, cB0 = 0.5, cB1 = D - 0.4;
  // the floor: a chequer of cream and dark-red tile with a border of blue, on the marble slab
  {
    const Tq = [], u = 0.6, y1 = F0 + 0.006;
    const sq = (a0, b0, a1, b1) => quad(Tq, [X(b0), y1, Z(a0)], [X(b0), y1, Z(a1)], [X(b1), y1, Z(a1)], [X(b1), y1, Z(a0)]);
    for (let i = 0; i < Math.floor((cA1 - cA0 - 0.4) / u); i++) for (let j = 0; j < Math.floor((cB1 - cB0 - 0.4) / u); j++) if ((i + j) % 2) sq(cA0 + 0.2 + i * u, cB0 + 0.2 + j * u, cA0 + 0.2 + (i + 1) * u, cB0 + 0.2 + (j + 1) * u);
    bag.add('cotto_floor', fromTriangles(Tq));
    const gb = (a0, b0, a1, b1) => bx('glaze_blue', a0, b0, a1, b1, F0 - 0.1, F0 + 0.012);
    gb(cA0 + 0.055, cB0, cA1 - 0.055, cB0 + 0.12); gb(cA0 + 0.055, cB1 - 0.17, cA1 - 0.055, cB1 - 0.055); gb(cA0 + 0.055, cB0, cA0 + 0.17, cB1 - 0.055); gb(cA1 - 0.17, cB0, cA1 - 0.055, cB1 - 0.055);
  }
  // wainscot and walls: oak panelling to 1.4 m, a plain stucco above, a frieze, a painted-wood coffered ceiling
  const wains = (a0, b0, a1, b1) => { bx('wood_dark', a0, b0, a1, b1, F0 + 0.006, F0 + 1.4); bx('wood_ochre', a0 - (a1 - a0 < 0.1 ? 0.01 : 0), b0 - (b1 - b0 < 0.1 ? 0.01 : 0), a1 + (a1 - a0 < 0.1 ? 0.01 : 0), b1 + (b1 - b0 < 0.1 ? 0.01 : 0), F0 + 1.4, F0 + 1.46); };
  wains(cA0, 1.0, cA0 + 0.05, cB1); wains(cA1 - 0.05, 0.9, cA1, cB1); wains(cA0, cB1 - 0.05, cA1, cB1);
  bx('stucco_cream', cA0, 1.0, cA0 + 0.03, cB1, F0 + 1.46, y + 4.45); bx('stucco_cream', cA1 - 0.03, 0.5, cA1, cB1, F0 + 1.46, y + 4.45); bx('stucco_cream', cA0, cB1 - 0.03, cA1, cB1, F0 + 1.46, y + 4.45);
  // the front wall's inner face above the windows
  bx('stucco_cream', cA0, 0.5, cA1, 0.53, y + 3.6, y + 4.45);
  for (let i = 1; i < 4; i++) bx('wood_dark', cA0, 0.5 + i * 4.3 - 0.07, cA1, 0.5 + i * 4.3 + 0.07, y + 4.28, y + 4.45);        // the ceiling's beams across
  for (let i = 1; i < 3; i++) bx('wood_dark', cA0 + i * 3.1 - 0.07, cB0, cA0 + i * 3.1 + 0.07, cB1, y + 4.3, y + 4.45);
  bx('cloth_ochre', cA0 + 0.1, cB0 + 0.1, cA1 - 0.1, cB1 - 0.1, y + 4.44, y + 4.452);                                                                   // (the painted ceiling between the beams)
  // two cast-iron columns on the middle line, with their capitals, carrying a beam across
  for (const a of [3.1, 6.2]) {
    lat(IRON, [[0.19, 0], [0.16, 0.1], [0.12, 0.3], [0.1, 0.5], [0.1, 3.6], [0.13, 3.75], [0.2, 3.95], [0.28, 4.05], [0.28, 4.2], [0.001, 4.2]], a, 7.6, F0, 12);
    circ(a, 7.6, 0.2, F0, F0 + 4.3);
  }
  bx(IRON, 2.9, 7.45, 6.5, 7.75, y + 4.15, y + 4.45);
  // the mirrors along the long wall: three tall panels in carved frames (the left party wall), the right wall hung with gilt-framed ones
  for (let k = 0; k < 3; k++) { const b0 = 1.3 + k * 2.1; bx('wood_ochre', cA0 + 0.03, b0, cA0 + 0.08, b0 + 1.7, F0 + 1.5, F0 + 3.6); bx('mirror_tin', cA0 + 0.08, b0 + 0.1, cA0 + 0.1, b0 + 1.6, F0 + 1.6, F0 + 3.5); bx('gilt_bronze', cA0 + 0.08, b0, cA0 + 0.12, b0 + 0.1, F0 + 1.5, F0 + 3.6); bx('gilt_bronze', cA0 + 0.08, b0 + 1.6, cA0 + 0.12, b0 + 1.7, F0 + 1.5, F0 + 3.6); }
  for (let k = 0; k < 3; k++) { const b0 = 2.0 + k * 2.6; bx('gilt_bronze', cA1 - 0.07, b0, cA1 - 0.03, b0 + 1.2, F0 + 1.9, F0 + 3.1); bx('mirror_tin', cA1 - 0.08, b0 + 0.08, cA1 - 0.07, b0 + 1.12, F0 + 1.98, F0 + 3.02); }
  // the banquette: leather seat and back along the right wall from b 1.8 to 11.2
  solid('wood_dark', cA1 - 0.62, 1.8, cA1 - 0.05, 11.2, F0, F0 + 0.4, false); bx('leather_bench', cA1 - 0.6, 1.8, cA1 - 0.14, 11.2, F0 + 0.4, F0 + 0.56); bx('leather_bench', cA1 - 0.2, 1.8, cA1 - 0.08, 11.2, F0 + 0.56, F0 + 1.05);
  for (let k = 0; k <= 12; k++) { const b = 1.8 + k * 0.79; bx('gilt_bronze', cA1 - 0.22, b - 0.015, cA1 - 0.07, b + 0.015, F0 + 0.8, F0 + 0.83); }
  col.rect([X(11.2), Z(cA1 - 0.62), X(1.8), Z(cA1)], F0, F0 + 1.0);
  // the bar along the left side, b 8…16: the counter (oak, a marble top, a brass foot rail), the back-bar with its mirror and its bottles
  solid('wood_dark', 1.6, 8.0, 2.35, 16.4, F0 + 0.007, F0 + 1.02);
  bx('marble', 1.5, 7.9, 2.45, 16.5, F0 + 1.02, F0 + 1.07);
  for (let k = 0; k < 10; k++) { const b = 8.4 + k * 0.8; bx('wood_ochre', 2.35, b, 2.37, b + 0.6, F0 + 0.2, F0 + 0.85); }
  rd('bronze', [2.62, 8.0, F0 + 0.18], [2.62, 16.4, F0 + 0.18], 0.028, 8);
  for (let k = 0; k < 6; k++) { const b = 8.4 + k * 1.6; rd('bronze', [2.62, b, F0], [2.62, b, F0 + 0.18], 0.02, 6); }
  // (the barman's gate: the counter stops 0.8 m short of the front end)
  solid('wood_dark', cA0 + 0.03, 8.0, 0.62, 16.4, F0 + 0.007, F0 + 1.0);                                      // the back-bar's cupboards
  bx('wood_ochre', cA0 + 0.03, 8.0, 0.66, 16.4, F0 + 1.0, F0 + 1.06);
  bx('wood_ochre', cA0 + 0.03, 8.0, 0.14, 16.4, F0 + 1.06, F0 + 3.7);                                  // the frame of the mirror, to the cornice
  bx('mirror_tin', cA0 + 0.14, 8.1, cA0 + 0.16, 16.3, F0 + 1.2, F0 + 3.4);
  for (let k = 0; k < 4; k++) bx('wood_ochre', cA0 + 0.1, 8.0 + k * 2.1, cA0 + 0.2, 8.1 + k * 2.1, F0 + 1.1, F0 + 3.5);   // pilasters
  bx('wood_ochre', cA0 + 0.03, 8.0, 0.62, 16.4, F0 + 1.85, F0 + 1.9); bx('wood_ochre', cA0 + 0.03, 8.0, 0.5, 16.4, F0 + 2.55, F0 + 2.6);
  // the bottles on the shelves (a hundred, in rows) and the glasses on the counter
  {
    const BOT = ['glaze_green', 'glaze_white', 'glaze_red', 'glaze_blue', 'pottery_dark'];
    for (const sy of [1.9, 2.6]) for (let k = 0; k < 24; k++) { const b = 8.25 + k * 0.33; lat(BOT[(k * 7 + (sy > 2 ? 3 : 0)) % 5], [[0.001, 0], [0.04, 0], [0.045, 0.16], [0.03, 0.22], [0.016, 0.3], [0.016, 0.34], [0.001, 0.34]], 0.3, b, F0 + sy + 0.0, 7); }
    for (let k = 0; k < 14; k++) lat('glass_lamp', [[0.001, 0], [0.03, 0], [0.036, 0.09], [0.001, 0.09]], 2.05 + (k % 2) * 0.14, 8.6 + k * 0.52, F0 + 1.07, 7);
    // the coffee urns: two copper vessels on the counter with their taps, a siphon
    for (const b of [9.1, 13.6]) { lat('bronze', [[0.001, 0], [0.16, 0], [0.19, 0.12], [0.2, 0.34], [0.14, 0.46], [0.07, 0.5], [0.001, 0.52]], 2.0, b, F0 + 1.07, 12); lat('bronze', [[0.03, 0.5], [0.02, 0.56], [0.001, 0.58]], 2.0, b, F0 + 1.07, 8); rd('bronze', [2.2, b, F0 + 1.2], [2.3, b, F0 + 1.2], 0.014, 5); }
  }
  // the tables: round marble tops on iron feet, bentwood chairs (three at each, none on the wall's side)
  const chair = (a, b, fa, fb) => {
    const sy = F0 + 0.46, o = 0.17;
    lat('wood_dark', [[0.001, 0], [0.2, 0], [0.205, 0.03], [0.2, 0.05], [0.001, 0.05]], a, b, sy - 0.05, 10);
    for (const [sa, sb] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) rd('wood_dark', [a + sa * o, b + sb * o, F0], [a + sa * o * 0.9, b + sb * o * 0.9, sy - 0.04], 0.013, 5);
    // the back: two uprights from the rear and a bent hoop
    const ra = a - fa * o * 1.05, rb = b - fb * o * 1.05, ta = fb, tb = fa;
    for (const s of [-1, 1]) rd('wood_dark', [ra + ta * s * 0.15, rb + tb * s * 0.15, sy], [ra + ta * s * 0.15, rb + tb * s * 0.15, sy + 0.45], 0.012, 5);
    rd('wood_dark', [ra - ta * 0.17, rb - tb * 0.17, sy + 0.44], [ra + ta * 0.17, rb + tb * 0.17, sy + 0.44], 0.014, 5);
    rd('wood_dark', [ra - ta * 0.16, rb - tb * 0.16, sy + 0.24], [ra + ta * 0.16, rb + tb * 0.16, sy + 0.24], 0.01, 5);
  };
  const table = (a, b, sides = [[1, 0], [-1, 0], [0, 1], [0, -1]]) => {
    lat('marble', [[0.001, 0.72], [0.37, 0.72], [0.38, 0.735], [0.35, 0.755], [0.001, 0.755]], a, b, F0, 14);
    lat(IRON, [[0.15, 0], [0.04, 0.03], [0.03, 0.6], [0.06, 0.7], [0.001, 0.72]], a, b, F0, 8);
    for (let k = 0; k < 3; k++) { const th = k * 2.094 + 0.6; rd(IRON, [a, b, F0 + 0.03], [a + Math.cos(th) * 0.26, b + Math.sin(th) * 0.26, F0 + 0.01], 0.014, 5); }
    circ(a, b, 0.4, F0, F0 + 0.8);
    lat('cloth_white', [[0.001, 0.757], [0.05, 0.757], [0.05, 0.762], [0.001, 0.762]], a + 0.1, b - 0.08, F0, 8);
    for (const [fa, fb] of sides) chair(a + fa * 0.62, b + fb * 0.62, -fa, -fb);
  };
  table(1.5, 2.0, [[1, 0], [0, 1], [0, -1]]); table(7.5, 2.0, [[-1, 0], [0, 1], [0, -1]]);
  table(1.5, 4.7, [[1, 0], [0, 1], [0, -1]]); table(7.4, 4.7, [[-1, 0], [0, 1], [0, -1]]);
  table(7.4, 7.1, [[-1, 0], [0, 1], [0, -1]]); table(7.4, 9.5, [[-1, 0], [0, 1], [0, -1]]);
  table(4.6, 9.4, [[1, 0], [-1, 0], [0, -1]]); table(4.6, 11.9, [[1, 0], [-1, 0], [0, 1], [0, -1]]); table(7.4, 12.0, [[-1, 0], [0, 1], [0, -1]]);
  // the billiard table at the back: a bed of green cloth in an oak frame on four turned legs, a lamp over it
  {
    const a0 = 3.7, a1 = 5.3, b0 = 14.0, b1 = 16.7;
    bx('wood_dark', a0, b0, a1, b1, F0 + 0.78, F0 + 0.86); bx('cloth_green', a0 + 0.1, b0 + 0.1, a1 - 0.1, b1 - 0.1, F0 + 0.86, F0 + 0.88);
    bx('wood_dark', a0, b0, a0 + 0.1, b1, F0 + 0.86, F0 + 0.94); bx('wood_dark', a1 - 0.1, b0, a1, b1, F0 + 0.86, F0 + 0.94); bx('wood_dark', a0, b0, a1, b0 + 0.1, F0 + 0.86, F0 + 0.94); bx('wood_dark', a0, b1 - 0.1, a1, b1, F0 + 0.86, F0 + 0.94);
    for (const [a, b] of [[a0 + 0.14, b0 + 0.14], [a1 - 0.14, b0 + 0.14], [a0 + 0.14, b1 - 0.14], [a1 - 0.14, b1 - 0.14]]) lat('wood_dark', [[0.06, 0], [0.06, 0.1], [0.04, 0.2], [0.07, 0.4], [0.05, 0.6], [0.08, 0.78]], a, b, F0, 8);
    ob(a0, b0, a1, b1, F0, F0 + 0.95);
    for (const [a, b, c] of [[4.5, 14.6, 'cloth_red'], [4.4, 15.4, 'glaze_white'], [4.6, 16.0, 'cloth_ochre']]) lat(c, [[0.001, 0], [0.028, 0.02], [0.028, 0.056], [0.001, 0.058]], a, b, F0 + 0.88, 8);
    lat(IRON, [[0.015, 0], [0.015, 0.9], [0.001, 0.9]], 4.5, 15.35, F0 + 3.55, 5);
    bx('wood_dark', 3.4, 14.1, 3.55, 16.6, F0 + 1.5, F0 + 1.56);               // the cue rack on the wall's side
    for (let k = 0; k < 4; k++) rd('wood_ochre', [3.62, 14.3 + k * 0.55, F0 + 0.4], [3.52, 14.3 + k * 0.55, F0 + 1.55], 0.012, 5);
  }
  // the newspaper rack by the door (poles of wood with the sheets on them), the coat-stand, a tall palm in a pot at the front
  for (let k = 0; k < 4; k++) { bx('wood_dark', 0.12, 1.3 + k * 0.3, 0.3, 1.34 + k * 0.3, F0 + 1.6, F0 + 1.64); bx('paint_white', 0.12, 1.1 + k * 0.3, 0.4, 1.22 + k * 0.3, F0 + 1.0, F0 + 1.5); }
  lat('wood_dark', [[0.2, 0], [0.04, 0.03], [0.03, 1.7], [0.06, 1.8], [0.001, 1.85]], 3.0, 1.2, F0, 8); for (let k = 0; k < 4; k++) { const th = k * Math.PI / 2; rd('bronze', [3.0, 1.2, F0 + 1.7], [3.0 + Math.cos(th) * 0.22, 1.2 + Math.sin(th) * 0.22, F0 + 1.8], 0.012, 5); }
  lat('terracotta', [[0.2, 0], [0.26, 0.3], [0.24, 0.55], [0.001, 0.55]], 8.7, 0.9, F0, 10); lat('palm_leaf', [[0.02, 0.5], [0.4, 1.0], [0.55, 1.5], [0.001, 1.7]], 8.7, 0.9, F0 + 0.1, 8);
  // the hanging lamps: bell shades of glass on brass chains, and the iron wall lights of the first bay
  for (const [a, b] of [[2.4, 3.5], [6.9, 3.5], [4.7, 9.5], [4.7, 13.5], [2.0, 12.0], [7.2, 11.0]]) {
    rd('bronze', [a, b, y + 4.3], [a, b, y + 3.45], 0.008, 4);
    lat('lamp_glass', [[0.001, 0], [0.06, 0.02], [0.26, 0.16], [0.28, 0.2], [0.24, 0.2], [0.001, 0.05]], a, b, y + 3.25, 12);
    lat('bronze', [[0.001, 0.18], [0.07, 0.19], [0.001, 0.24]], a, b, y + 3.25, 8);
  }
  light(2.4, 3.5, y + 3.0, '#ffd6a0', 7, 10); light(6.9, 3.5, y + 3.0, '#ffd6a0', 7, 10); light(4.7, 9.5, y + 3.0, '#ffd6a0', 7, 10); light(4.7, 13.5, y + 3.0, '#ffd6a0', 7, 10);

  // ── the stair hall (the portal) ─────────────────────────────────────────────────────────────────
  const hA0 = A1 + T / 2, hA1 = A2 - T / 2;
  {
    const Tq = [], u = 0.5, y1 = F0 + 0.006;
    for (let i = 0; i < 6; i++) for (let j = 0; j < 9; j++) if ((i + j) % 2) { const a0 = hA0 + 0.02 + i * u, b0 = 0.5 + j * u; quad(Tq, [X(b0), y1, Z(a0)], [X(b0), y1, Z(a0 + u)], [X(b0 + u), y1, Z(a0 + u)], [X(b0 + u), y1, Z(a0)]); }
    bag.add('glaze_blue', fromTriangles(Tq));
  }
  bx('wood_dark', hA0, 0.5, hA0 + 0.04, WELL.b0, F0, F0 + 1.5); bx('wood_dark', hA1 - 0.04, 0.5, hA1, WELL.b0, F0, F0 + 1.5);
  bx('tile_white', hA0 + 0.0, 0.5, hA0 + 0.03, WELL.b0, F0 + 1.5, y + 4.45); bx('tile_white', hA1 - 0.03, 0.5, hA1, WELL.b0, F0 + 1.5, y + 4.45);
  // an iron lantern on a bracket in the vestibule, the letter-boxes and a bench
  rd(IRON, [hA1 - 0.05, 2.4, F0 + 2.8], [hA1 - 0.4, 2.4, F0 + 2.8], 0.02, 5); lat('lamp_glass', [[0.04, 0], [0.12, 0.05], [0.12, 0.3], [0.04, 0.36], [0.001, 0.4]], hA1 - 0.4, 2.4, F0 + 2.45, 8);
  light(hA1 - 0.4, 2.4, F0 + 2.6, '#ffcf96', 5, 8);
  for (let k = 0; k < 4; k++) bx('bronze', hA0 + 0.02, 1.4 + k * 0.3, hA0 + 0.1, 1.6 + k * 0.3, F0 + 1.3, F0 + 1.45);
  light(11.1, 9.0, F0 + 2.0, '#cfe0ff', 4, 9); light(11.1, 12.0, PF + 2.0, '#d8e6ff', 5, 10);
  // wall lamp on the landing
  light(11.1, 14.4, F0 + rise + 2.0, '#ffd6a0', 4, 7);

  // ── the shop: a confectioner's (xocolateria-pastisseria), a.12.9…16, b 0.5…7.4 ─────────────────────
  const sA0 = A2 + T / 2, sA1 = W - 0.05, sB1 = 7.5;
  {
    const Tq = [], u = 0.45, y1 = F0 + 0.02;
    for (let i = 0; i < 6; i++) for (let j = 0; j < 14; j++) if ((i + j) % 2) { const a0 = sA0 + 0.0 + i * u, b0 = 0.55 + j * u; if (a0 + u <= sA1 && b0 + u <= sB1) quad(Tq, [X(b0), y1, Z(a0)], [X(b0), y1, Z(a0 + u)], [X(b0 + u), y1, Z(a0 + u)], [X(b0 + u), y1, Z(a0)]); }
    bag.add('cotto_floor', fromTriangles(Tq));
  }
  wall('stucco_cream', 'a', sB1, sA0, sA1, 0.2, y, y + 4.45);                                           // the back of the shop (the workroom beyond)
  bx('stucco_cream', sA0, 0.5, sA1, 0.53, y + 3.3, y + 4.45); bx('stucco_cream', sA1 - 0.03, 0.5, sA1, sB1, F0, y + 4.45); bx('stucco_cream', sA0, 0.5, sA0 + 0.03, sB1, F0, y + 4.45);
  bx('tile_white', sA1 - 0.07, 1.8, sA1 - 0.035, sB1 - 0.1, F0 + 1.0, F0 + 2.0);
  // the shelves on the partition: five tiers of boxes, tins and glass jars of sweets
  bx('wood_ochre', sA0 + 0.0, 1.0, sA0 + 0.4, sB1 - 0.1, F0, F0 + 0.7); ob(sA0, 1.0, sA0 + 0.4, sB1 - 0.1, F0, F0 + 2.6);
  bx('wood_ochre', sA0 + 0.0, 1.0, sA0 + 0.35, sB1 - 0.1, F0 + 0.7, F0 + 2.6);
  for (let k = 0; k < 5; k++) bx('wood_dark', sA0, 1.0, sA0 + 0.4, sB1 - 0.1, F0 + 0.7 + k * 0.38, F0 + 0.73 + k * 0.38);
  {
    const GOODS = ['lacquer_red', 'cloth_green', 'cloth_indigo', 'cloth_maroon', 'gilt_bronze', 'cloth_ochre'];
    for (let t = 0; t < 4; t++) for (let k = 0; k < 11; k++) {
      const b = 1.15 + k * 0.56, g = GOODS[(k * 5 + t * 3) % 6], yy = F0 + 0.73 + (t + 0.0) * 0.38 + 0.0;
      if ((k + t) % 3 === 0) lat('glass_lamp', [[0.001, 0], [0.07, 0], [0.09, 0.1], [0.08, 0.2], [0.05, 0.22], [0.001, 0.22]], sA0 + 0.2, b, yy + 0.38 + 0.0 - 0.38 + 0.0, 8);
      else bx(g, sA0 + 0.08, b - 0.16, sA0 + 0.3, b + 0.16, yy + 0.0, yy + 0.2);
    }
  }
  // the counter: marble over a panelled body, with a glass case on it, a pair of brass scales, the till, jars
  solid('wood_dark', 14.35, 2.2, 15.0, 6.6, F0 + 0.005, F0 + 0.96); bx('marble', 14.3, 2.15, 15.05, 6.65, F0 + 0.96, F0 + 1.0);
  for (let k = 0; k < 4; k++) bx('wood_ochre', 14.33, 2.4 + k * 1.0, 14.35, 3.2 + k * 1.0, F0 + 0.15, F0 + 0.85);
  bx('wood_painted', 14.4, 2.3, 14.95, 4.6, F0 + 1.0, F0 + 1.05); bx('glass_outer', 14.44, 2.34, 14.91, 4.56, F0 + 1.05, F0 + 1.5); bx('wood_painted', 14.4, 2.3, 14.95, 4.6, F0 + 1.5, F0 + 1.54);
  for (const b of [2.4, 3.0, 3.6, 4.2]) bx('wood_painted', 14.4, b - 0.015, 14.95, b + 0.015, F0 + 1.05, F0 + 1.5);
  for (let k = 0; k < 6; k++) { lat('cloth_maroon', [[0.001, 0], [0.09, 0.0], [0.09, 0.05], [0.001, 0.055]], 14.55, 2.5 + k * 0.32, F0 + 1.05, 8); lat('cloth_ochre', [[0.001, 0], [0.07, 0.0], [0.07, 0.04], [0.001, 0.045]], 14.75, 2.6 + k * 0.32, F0 + 1.05, 8); }
  lat('bronze', [[0.001, 0], [0.12, 0], [0.12, 0.02], [0.04, 0.03], [0.04, 0.3], [0.001, 0.3]], 14.7, 5.4, F0 + 1.0, 8); bx('bronze', 14.55, 5.1, 14.85, 5.35, F0 + 1.0, F0 + 1.25);
  for (let k = 0; k < 3; k++) { lat('glass_lamp', [[0.001, 0], [0.08, 0], [0.1, 0.12], [0.001, 0.24]], 14.7, 6.0 + k * 0.17, F0 + 1.0, 8); }
  lat('wood_dark', [[0.001, 0], [0.18, 0], [0.19, 0.02], [0.18, 0.04], [0.001, 0.04]], 14.7, 6.3, F0 + 1.0, 10);
  lat('lamp_glass', [[0.001, 0], [0.06, 0.02], [0.2, 0.14], [0.001, 0.14]], 14.1, 3.6, y + 3.4, 10); rd('bronze', [14.1, 3.6, y + 4.45], [14.1, 3.6, y + 3.54], 0.007, 4); light(14.1, 3.6, y + 3.2, '#ffd6a0', 5, 7);
  // a stand of cakes by the window and chocolate boxes in the window
  lat('wood_dark', [[0.2, 0], [0.04, 0.03], [0.04, 0.8], [0.3, 0.84], [0.3, 0.88], [0.001, 0.88]], 13.5, 0.95, F0, 10);
  for (let k = 0; k < 4; k++) lat(k % 2 ? 'cloth_maroon' : 'cloth_ochre', [[0.001, 0.88], [0.13, 0.88], [0.13, 0.96], [0.001, 0.98]], 13.5 + Math.cos(k * 1.57) * 0.16, 0.95 + Math.sin(k * 1.57) * 0.16, F0 + 0.0, 8);
  circ(13.5, 0.95, 0.3, F0, F0 + 0.9);

  // ── the principal floor's flat ──────────────────────────────────────────────────────────────────
  const s0 = 0.05, s1 = A1 - T / 2, fl = PF;
  // walls of the salon: an oak dado, a frieze of plaster waves, curtains at the windows, doors with arched frames of wavy oak
  const lineRoom = (a0, b0, a1, b1, dado = 1.0) => {
    bx('wood_dark', a0, b0, a0 + 0.04, b1, fl, fl + dado); bx('wood_dark', a1 - 0.04, b0, a1, b1, fl, fl + dado); bx('wood_dark', a0, b1 - 0.04, a1, b1, fl, fl + dado);
    bx('wood_ochre', a0, b0, a0 + 0.06, b1, fl + dado, fl + dado + 0.05); bx('wood_ochre', a1 - 0.06, b0, a1, b1, fl + dado, fl + dado + 0.05);
    bx('lime_plaster', a0, b0, a0 + 0.03, b1, fl + dado + 0.05, ceilTop - 0.18); bx('lime_plaster', a1 - 0.03, b0, a1, b1, fl + dado + 0.05, ceilTop - 0.18); bx('lime_plaster', a0, b1 - 0.03, a1, b1, fl + dado + 0.05, ceilTop - 0.18);
    bx('lime_plaster', a0, b0, a1, b0 + 0.03, fl + 2.95, ceilTop - 0.18);
  };
  lineRoom(s0, 0.5, s1, 7.6);
  // the wavy frames of the doors (stucco and oak rolled round the opening: a bent lintel of three segments and rounded jambs)
  const doorFrame = (aa, bb, along) => {
    const w = 1.15, y0 = fl, y1 = fl + 2.55;
    if (along === 'b') { bx('wood_ochre', aa - 0.2, bb - w / 2 - 0.1, aa + 0.2, bb - w / 2 + 0.02, y0, y1 + 0.1); bx('wood_ochre', aa - 0.2, bb + w / 2 - 0.02, aa + 0.2, bb + w / 2 + 0.1, y0, y1 + 0.1); bx('wood_ochre', aa - 0.2, bb - w / 2 - 0.1, aa + 0.2, bb + w / 2 + 0.1, y1, y1 + 0.14); bx('wood_ochre', aa - 0.17, bb - w * 0.3, aa + 0.17, bb + w * 0.3, y1 + 0.14, y1 + 0.24); }
    else { bx('wood_ochre', aa - w / 2 - 0.1, bb - 0.2, aa - w / 2 + 0.02, bb + 0.2, y0, y1 + 0.1); bx('wood_ochre', aa + w / 2 - 0.02, bb - 0.2, aa + w / 2 + 0.1, bb + 0.2, y0, y1 + 0.1); bx('wood_ochre', aa - w / 2 - 0.1, bb - 0.2, aa + w / 2 + 0.1, bb + 0.2, y1, y1 + 0.14); bx('wood_ochre', aa - w * 0.3, bb - 0.17, aa + w * 0.3, bb + 0.17, y1 + 0.14, y1 + 0.24); }
  };
  doorFrame(A1, 2.3, 'b'); doorFrame(A2, 2.3, 'b'); doorFrame(2.4, 7.75, 'a'); doorFrame(14.1, 7.75, 'a');
  // curtains at the three salon windows, the stained-glass light through the transoms
  for (let i = 0; i < 3; i++) { const sc = 1.6 + 3.2 * i; for (const sg of [-1, 1]) bx('cloth_maroon', sc + sg * 0.75 - 0.18, 0.54, sc + sg * 0.75 + 0.18, 0.66, fl + 0.3, fl + 3.1); bx('wood_dark', sc - 0.95, 0.5, sc + 0.95, 0.64, fl + 3.1, fl + 3.14); }
  // the swirl plaster ceiling: concentric rings round a rose, as a whirlpool, with the lamp at its middle
  for (let k = 0; k < 5; k++) lat('plaster_white', [[0.45 + k * 0.38, 0], [0.45 + k * 0.38, -0.025 - 0.015 * ((k + 1) % 2)], [0.28 + k * 0.38, -0.05]], 4.65, 3.5, ceilTop - 0.18, 24);
  lat('plaster_white', [[0.001, 0], [0.28, 0], [0.22, -0.12], [0.001, -0.14]], 4.65, 3.5, ceilTop - 0.18, 16);
  rd('bronze', [4.65, 3.5, ceilTop - 0.3], [4.65, 3.5, ceilTop - 0.9], 0.012, 5);
  lat('lamp_glass', [[0.001, 0], [0.1, 0.02], [0.34, 0.2], [0.37, 0.26], [0.001, 0.0]], 4.65, 3.5, ceilTop - 1.45, 14);
  for (let k = 0; k < 5; k++) { const th = k * 1.257; lat('lamp_glass', [[0.001, 0], [0.05, 0.03], [0.001, 0.1]], 4.65 + Math.cos(th) * 0.3, 3.5 + Math.sin(th) * 0.3, ceilTop - 1.25, 8); }
  light(4.65, 3.5, ceilTop - 1.4, '#ffd9a8', 9, 12);
  // the corner fireplace nook (the mushroom of Casa Batlló's courting corner): a rounded hood of white plaster on a bench, a hearth with a glow
  {
    const ca = 0.9, cb = 6.4;
    bx('plaster_white', s0, 5.4, 1.9, 7.55, fl, fl + 0.45);                         // the bench's plinth
    bx('wood_ochre', s0, 5.5, 1.8, 7.5, fl + 0.45, fl + 0.5);
    lat('plaster_white', [[0.001, 0.5], [0.62, 0.5], [0.66, 0.9], [0.52, 1.4], [0.7, 1.85], [0.98, 2.1], [0.94, 2.25], [0.001, 2.3]], ca, cb, fl, 20);
    lat('flame', [[0.001, 0.52], [0.3, 0.52], [0.26, 0.9], [0.001, 0.92]], ca, cb, fl, 10);
    ob(s0, 5.4, 1.9, 7.55, fl, fl + 1.0);
    light(ca + 0.1, cb, fl + 0.9, '#ff9a4a', 4, 5);
    bx('mirror_tin', s0 + 0.06, 6.0, s0 + 0.08, 6.8, fl + 1.5, fl + 2.6);
  }
  // the piano: an upright against the party wall, black, its lid, keys and a stool
  { const b0 = 1.8, b1 = 3.4, a0 = s0 + 0.05, a1 = s0 + 0.7;
    solid('lacquer_black', a0, b0, a1, b1, fl, fl + 1.3); bx('lacquer_black', a0, b0 - 0.03, a1 + 0.12, b1 + 0.03, fl + 1.3, fl + 1.36); bx('paint_white', a1, b0 + 0.1, a1 + 0.22, b1 - 0.1, fl + 0.78, fl + 0.82); bx('lacquer_black', a1, b0 + 0.1, a1 + 0.26, b1 - 0.1, fl + 0.82, fl + 0.86);
    for (let k = 0; k < 13; k++) bx('lacquer_black', a1, b0 + 0.18 + k * 0.1, a1 + 0.12, b0 + 0.22 + k * 0.1, fl + 0.82, fl + 0.88);
    bx('wood_dark', a1, b0 + 0.05, a1 + 0.3, b0 + 0.09, fl, fl + 0.78); bx('wood_dark', a1, b1 - 0.09, a1 + 0.3, b1 - 0.05, fl, fl + 0.78);
    lat('wood_dark', [[0.001, 0.46], [0.2, 0.46], [0.2, 0.5], [0.001, 0.5]], 1.4, 2.6, fl, 10); for (const [da, db] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) rd('wood_dark', [1.4 + da * 0.12, 2.6 + db * 0.12, fl], [1.4 + da * 0.12, 2.6 + db * 0.12, fl + 0.46], 0.016, 5);
    bx('gilt_bronze', a1 - 0.1, b0 + 0.2, a1 - 0.02, b0 + 0.45, fl + 1.0, fl + 1.2); bx('gilt_bronze', a1 - 0.1, b1 - 0.45, a1 - 0.02, b1 - 0.2, fl + 1.0, fl + 1.2); }
  // a sofa and two armchairs round a low round table on a Persian rug, a standing lamp
  bx('cloth_red', 3.0, 3.6, 7.0, 6.7, fl, fl + 0.012); bx('cloth_indigo', 3.2, 3.8, 6.8, 6.5, fl + 0.012, fl + 0.016);
  { const sofa = (a0, a1, b, depth = 0.8) => { solid('wood_dark', a0, b, a1, b + depth, fl, fl + 0.38, false); bx('cloth_maroon', a0 + 0.05, b + 0.05, a1 - 0.05, b + depth - 0.05, fl + 0.38, fl + 0.55); bx('wood_dark', a0, b + depth - 0.16, a1, b + depth, fl + 0.38, fl + 1.0); bx('cloth_maroon', a0 + 0.06, b + depth - 0.2, a1 - 0.06, b + depth - 0.1, fl + 0.55, fl + 0.95); for (const e of [a0, a1 - 0.14]) bx('wood_dark', e, b, e + 0.14, b + depth, fl + 0.38, fl + 0.66); col.rect([X(b + depth), Z(a0), X(b), Z(a1)], fl, fl + 1.0); };
    sofa(3.4, 5.4, 6.55); sofa(5.8, 6.8, 6.55); }
  for (const [a, b] of [[3.4, 4.1], [6.6, 4.1]]) { solid('wood_dark', a - 0.4, b - 0.4, a + 0.4, b + 0.4, fl, fl + 0.4, false); bx('cloth_maroon', a - 0.35, b - 0.35, a + 0.35, b + 0.35, fl + 0.4, fl + 0.55); bx('wood_dark', a - 0.4, b - 0.4, a + 0.4, b - 0.28, fl + 0.4, fl + 0.95); col.rect([X(b + 0.4), Z(a - 0.4), X(b - 0.4), Z(a + 0.4)], fl, fl + 0.95); }
  lat('wood_dark', [[0.001, 0.44], [0.4, 0.44], [0.4, 0.48], [0.001, 0.48]], 5.0, 5.0, fl, 14); lat('wood_dark', [[0.05, 0], [0.04, 0.44]], 5.0, 5.0, fl, 8); lat('cloth_white', [[0.001, 0.482], [0.2, 0.482], [0.2, 0.488], [0.001, 0.488]], 5.0, 5.0, fl, 10); circ(5.0, 5.0, 0.4, fl, fl + 0.5);
  lat('bronze', [[0.18, 0], [0.03, 0.04], [0.025, 1.5], [0.001, 1.52]], 8.4, 6.9, fl, 8); lat('lamp_white', [[0.001, 1.38], [0.18, 1.4], [0.3, 1.7], [0.001, 1.72]], 8.4, 6.9, fl, 12); light(8.4, 6.9, fl + 1.6, '#ffd2a0', 5, 8); circ(8.4, 6.9, 0.2, fl, fl + 1.8);
  // pictures on the walls, a mirror on the stair-side wall
  for (const [b, w] of [[4.0, 0.7], [5.3, 0.9]]) { bx('gilt_bronze', s1 - 0.06, b, s1 - 0.03, b + w, fl + 1.5, fl + 2.3); bx('paint_blue', s1 - 0.075, b + 0.06, s1 - 0.06, b + w - 0.06, fl + 1.56, fl + 2.24); }

  // the vestibule: a hall table with a mirror, a hat-stand, the stair's well beyond (the stair-head's guard is built above)
  { bx('wood_dark', 10.3, 0.7, 11.5, 1.1, fl, fl + 0.8); circ(10.9, 0.9, 0.55, fl, fl + 0.8); bx('mirror_tin', 10.35, 0.55, 11.45, 0.57, fl + 1.2, fl + 2.2); bx('wood_ochre', 10.3, 0.5, 11.5, 0.56, fl + 1.1, fl + 2.3); bx('mirror_tin', 10.34, 0.56, 11.46, 0.58, fl + 1.2, fl + 2.2);
    bx('stucco_cream', A1 + T / 2, 0.5, A2 - T / 2, 0.53, fl + 0.0, ceilTop - 0.18);
    bx('tile_turquoise', hA0, 0.55, hA0 + 0.03, 4.5, fl, fl + 1.3); bx('tile_turquoise', hA1 - 0.03, 0.55, hA1, 4.5, fl, fl + 1.3);
    light(11.1, 2.5, fl + 2.4, '#ffd3a0', 5, 8); }

  // the dining room: an oval table of oak with eight chairs, a sideboard with plates, a hanging lamp, the window light
  const dA0 = A2 + T / 2, dA1 = W - 0.05;
  lineRoom(dA0, 0.5, dA1, 7.65, 1.1);
  { const ta = 14.45, tb = 3.6;
    lat('wood_dark', [[0.001, 0.76], [0.7, 0.76], [0.74, 0.8], [0.001, 0.8]], ta, tb, fl, 18);
    lat('wood_dark', [[0.2, 0], [0.1, 0.1], [0.1, 0.7], [0.001, 0.76]], ta, tb, fl, 10);
    circ(ta, tb, 0.75, fl, fl + 0.85);
    lat('cloth_white', [[0.001, 0.801], [0.66, 0.801], [0.7, 0.797]], ta, tb, fl, 18);
    for (let k = 0; k < 6; k++) { const th = k * Math.PI / 3 + 0.3, ca = ta + Math.cos(th) * 1.02, cb = tb + Math.sin(th) * 1.02; chair(ca, cb, -Math.cos(th), -Math.sin(th)); lat('glaze_white', [[0.001, 0.8], [0.12, 0.8], [0.13, 0.81], [0.001, 0.81]], ta + Math.cos(th) * 0.5, tb + Math.sin(th) * 0.5, fl, 8); }
    lat('glaze_blue', [[0.001, 0.8], [0.1, 0.84], [0.12, 0.98], [0.07, 1.04], [0.001, 1.04]], ta, tb, fl, 10); }
  { solid('wood_dark', 13.2, 6.2, 15.7, 7.3, fl, fl + 1.0); bx('wood_ochre', 13.15, 6.15, 15.75, 7.35, fl + 1.0, fl + 1.05); bx('wood_dark', 13.2, 7.1, 15.7, 7.3, fl + 1.05, fl + 2.1); bx('mirror_tin', 13.3, 7.06, 15.6, 7.1, fl + 1.3, fl + 2.0);
    for (let k = 0; k < 5; k++) lat('glaze_white', [[0.14, 0], [0.14, 0.02], [0.001, 0.02]], 13.55 + k * 0.45, 6.8, fl + 1.05, 10); }
  rd('bronze', [14.45, 3.6, ceilTop - 0.18], [14.45, 3.6, ceilTop - 0.75], 0.01, 4); lat('lamp_glass', [[0.001, 0], [0.09, 0.02], [0.3, 0.18], [0.001, 0.2]], 14.45, 3.6, ceilTop - 1.2, 12); light(14.45, 3.6, ceilTop - 1.3, '#ffd6a0', 8, 10);
  for (const sg of [-1, 1]) bx('cloth_green', 14.4 + sg * 0.75 - 0.18, 0.54, 14.4 + sg * 0.75 + 0.18, 0.66, fl + 0.3, fl + 3.1);
  // the bedroom (back left): a double bed with a carved head of oak in an alcove, a wardrobe with a mirrored door, a washstand, a chair
  const bB0 = 7.85, bB1 = D - 0.4;
  lineRoom(s0, bB0, s1, bB1, 1.2);
  { solid('wood_dark', 3.2, 15.2, 5.8, 17.5, fl, fl + 0.5, false); bx('cloth_white', 3.25, 15.25, 5.75, 17.2, fl + 0.5, fl + 0.7); bx('cloth_red', 3.25, 15.9, 5.75, 17.0, fl + 0.7, fl + 0.76); bx('cloth_white', 3.35, 17.0, 5.65, 17.4, fl + 0.7, fl + 0.88);
    bx('wood_dark', 3.2, 17.4, 5.8, 17.55, fl + 0.5, fl + 1.7); for (let k = 0; k < 7; k++) lat('wood_dark', [[0.001, 0], [0.05, 0], [0.05, 0.12], [0.001, 0.14]], 3.5 + k * 0.33, 17.45, fl + 1.7, 8);
    col.rect([X(17.55), Z(3.2), X(15.2), Z(5.8)], fl, fl + 1.2);
    solid('wood_dark', 6.6, 16.2, 8.9, 17.55, fl, fl + 2.3); bx('mirror_tin', 6.7, 16.18, 8.8, 16.2, fl + 0.3, fl + 2.1); bx('wood_ochre', 6.6, 16.15, 8.9, 16.2, fl + 2.3, fl + 2.45);
    solid('wood_dark', 0.3, 12.0, 1.0, 13.2, fl, fl + 0.85); bx('marble', 0.28, 11.98, 1.02, 13.22, fl + 0.85, fl + 0.9); lat('glaze_white', [[0.001, 0], [0.16, 0.03], [0.2, 0.14], [0.001, 0.14]], 0.65, 12.6, fl + 0.9, 10); bx('mirror_tin', 0.12, 12.0, 0.14, 13.1, fl + 1.3, fl + 2.1); bx('wood_ochre', 0.1, 11.95, 0.16, 13.15, fl + 1.25, fl + 1.3);
    chair(1.4, 10.0, 1, 0); }
  bx('cloth_indigo', 2.2, 11.0, 6.5, 15.0, fl, fl + 0.012);
  light(4.5, 11.5, ceilTop - 1.2, '#ffd9b0', 6, 9);
  // the kitchen (back right): the iron range with its pots and hood, a scrubbed table, a sink, shelves of crockery, white tile
  lineRoom(dA0, 7.9, dA1, bB1, 1.2);
  bx('tile_white', dA0, 7.95, dA0 + 0.05, bB1, fl + 0.0, fl + 2.2); bx('tile_white', dA1 - 0.05, 7.95, dA1, bB1, fl, fl + 2.2); bx('tile_white', dA0, bB1 - 0.05, dA1, bB1, fl, fl + 2.2);
  { solid('brick_grey', 13.2, 16.0, 14.6, 17.5, fl, fl + 0.85); bx(IRON, 13.15, 15.95, 14.65, 17.55, fl + 0.85, fl + 0.92); for (const [a, b] of [[13.6, 16.5], [14.2, 16.5], [13.9, 17.0]]) { lat(IRON, [[0.001, 0], [0.16, 0.0], [0.19, 0.12], [0.19, 0.2], [0.001, 0.2]], a, b, fl + 0.92, 10); }
    bx('iron', 13.15, 17.2, 14.65, 17.5, fl + 0.92, fl + 2.5); bx('wood_dark', 13.3, 15.9, 14.5, 15.95, fl + 0.3, fl + 0.6); bx('flame', 13.4, 15.89, 14.4, 15.9, fl + 0.32, fl + 0.5);
    rd(IRON, [13.0, 17.45, fl + 1.6], [14.8, 17.45, fl + 1.6], 0.02, 5); for (let k = 0; k < 4; k++) lat('bronze', [[0.001, 0], [0.12, 0.0], [0.13, 0.1], [0.12, 0.14], [0.001, 0.14]], 13.35 + k * 0.4, 17.4, fl + 1.1, 8);
    solid('wood_ochre', 14.7, 10.5, 15.5, 12.2, fl, fl + 0.88); bx('wood_dark', 14.65, 10.45, 15.55, 12.25, fl + 0.88, fl + 0.92); lat('pottery_dark', [[0.001, 0], [0.12, 0], [0.14, 0.2], [0.001, 0.2]], 15.1, 11.0, fl + 0.92, 8); lat('glaze_white', [[0.001, 0], [0.14, 0.0], [0.15, 0.04], [0.001, 0.06]], 15.1, 11.7, fl + 0.92, 8);
    solid('tile_white', 15.3, 13.4, 15.9, 14.6, fl, fl + 0.9); bx('iron', 15.35, 13.55, 15.85, 14.45, fl + 0.9, fl + 0.94); rd('bronze', [15.75, 14.0, fl + 0.94], [15.75, 14.0, fl + 1.2], 0.016, 5);
    bx('wood_ochre', dA1 - 0.3, 10.0, dA1 - 0.04, 13.0, fl + 1.5, fl + 1.55); bx('wood_ochre', dA1 - 0.3, 10.0, dA1 - 0.04, 13.0, fl + 1.95, fl + 2.0); for (let k = 0; k < 8; k++) { lat('glaze_white', [[0.001, 0], [0.09, 0], [0.11, 0.03], [0.001, 0.03]], dA1 - 0.15, 10.2 + k * 0.35, fl + 1.55 + (k % 2) * 0.45, 8); }
    lat('lamp_glass', [[0.001, 0], [0.05, 0.02], [0.2, 0.12], [0.001, 0.12]], 14.4, 11.5, fl + 2.55, 10); rd('bronze', [14.4, 11.5, ceilTop - 0.18], [14.4, 11.5, fl + 2.65], 0.007, 4); light(14.4, 11.5, fl + 2.45, '#ffe0b0', 5, 8); }
  // the ceilings' lights
  light(13.9, 3.0, fl + 1.2, '#ffe6c0', 3, 6);

  // ceiling of the shaft's upper vestibule gets its ring as well: none (open to the lantern). The kitchen's and bedroom's ceilings are the slab above.
  return { fr };
}
