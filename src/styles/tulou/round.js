// A round tulou (docs/settlements/hakka-tulou.md §4.1): the rammed-earth ring on its cobble plinth, leaning
// in, windowless below; inside it the ring of rooms on each floor, doors on the gallery, the galleries
// themselves on their posts with a railing, two stair bays, the ring roof of tiles; for the landmark a
// second ring of two storeys; the court with its cobbles and wells. Everything walkable is given its
// floors and obstacles. `full: false` builds the simpler neighbour (a solid ring of room fronts, only the
// court to walk).
import { STYLES } from '../../core/build.js';
import { box, disc, lathe, rod } from '../../core/geom.js';
import { DEG, P, hexa, sector, slope, lbox, frameOf, prism, plank } from './geo.js';
import { furnishRooms } from './rooms.js';

const EARTH = 'mud_plaster', INNER = 'earth_wall', TIMBER = 'timber', TILE = 'tile_grey';
const GATE_H = 3.4;

export function roofer(R, o) {
  const ro = o.ro, ye = o.ye, rr = o.rr, yr = o.yr, ri = o.ri, yi = o.yi;
  return (r) => (r >= rr ? yr - (yr - ye) * Math.min(1, (r - rr) / (ro - rr)) : yr - (yr - yi) * Math.min(1, (rr - r) / (rr - ri)));
}

/** The ring roof over rings of radius [ri…ro]: tile slabs on a soffit of boards, a ridge of dark tiles. */
export function ringRoof(bag, c, n, o) {
  const da = 2 * Math.PI / n;
  for (let i = 0; i < n; i++) {
    const a0 = (i - 0.5) * da - 0.0008, a1 = (i + 0.5) * da + 0.0008;
    bag.add(TILE, slope(c, o.ro, o.ye, o.rr, o.yr, 0.1, a0, a1));
    bag.add(TILE, slope(c, o.rr, o.yr, o.ri, o.yi, 0.1, a0, a1));
    bag.add(TIMBER, slope(c, o.ro, o.ye - 0.1, o.rr, o.yr - 0.1, 0.05, a0, a1));
    bag.add(TIMBER, slope(c, o.rr, o.yr - 0.1, o.ri, o.yi - 0.1, 0.05, a0, a1));
    bag.add('tile_dark', slope(c, o.rr + 0.35, o.yr + 0.09, o.rr - 0.35, o.yr + 0.09, 0.14, a0, a1));
  }
  // the rafters under the soffit: one in every second sector, a purlin ring under the ridge
  for (let i = 0; i < n; i += 2) {
    const a = i * da, p = (r, y) => { const [x, z] = P(c, r, a); return [x, y, z]; };
    bag.add(TIMBER, rod(p(o.ro - 0.2, o.ye - 0.18), p(o.rr, o.yr - 0.2), 0.05, 5));
    bag.add(TIMBER, rod(p(o.rr, o.yr - 0.2), p(o.ri + 0.2, o.yi - 0.18), 0.05, 5));
  }
}

export function tulouRound(el, ctx) {
  const { bag, col } = ctx;
  const c = el.c, R = el.R, n = el.n, da = 2 * Math.PI / n, fl = el.floors, K = fl.length, full = !!el.full;
  const wallIn = el.wallIn ?? R - 1.5, front = el.front ?? wallIn - 4.0, rail = el.rail ?? front - 1.7, lean = el.lean ?? 0.38;
  const topFl = fl[K - 1], ceil = topFl + 3.0;
  const rf = { ro: R + 1.9, ye: topFl + 2.6, rr: (front + wallIn) / 2 + 0.3, yr: el.ridge ?? topFl + 5.3, ri: rail - 2.0, yi: topFl + 3.0 };
  const roofY = roofer(R, rf);
  const H0 = ceil + 0.6;
  const ro = (y) => R - lean * Math.min(y, H0) / H0;
  const yTopO = roofY(ro(H0)) - 0.16, yTopI = roofY(wallIn) - 0.16;
  const gates = (el.gates ?? [90]).map((g) => Math.round(g * DEG / da));
  const wi = el.windowsFrom ?? 2;
  const idx = (i) => ((i % n) + n) % n;
  const isGate = (i) => gates.includes(idx(i));
  const bays = full ? (el.bays ?? [0, 180]).map((g) => Math.round(g * DEG / da)) : [];
  const isBay = (i) => bays.some((b) => Math.abs(((i - b + n * 1.5) % n) - n / 2) <= 1);
  const jambs = [];

  // ── the wall: granite plinth, rammed earth leaning in, small windows from the third storey up ──
  const sills = []; for (let k = wi; k < K; k++) sills.push([fl[k] + 1.0, fl[k] + 1.65]);
  for (let i = 0; i < n; i++) {
    const a0 = (i - 0.5) * da, a1 = (i + 0.5) * da, ac = i * da;
    if (isGate(i)) {
      bag.add(EARTH, sector(c, ro(GATE_H), wallIn, ro(yTopO), wallIn, GATE_H, [yTopO, yTopI], a0, a1));
      continue;
    }
    bag.add('granite_block', sector(c, R + 0.07, wallIn, ro(1.3) + 0.04, wallIn, 0, 1.3, a0, a1));
    let y = 1.3;
    if (full || el.windows) for (const [s0, s1] of sills) {
      bag.add(EARTH, sector(c, ro(y), wallIn, ro(s0), wallIn, y, s0, a0, a1));
      // the window: two piers beside a 0.5 m opening, a timber lintel and sill
      const hw = 0.27 / ro(s0);
      bag.add(EARTH, sector(c, ro(s0), wallIn, ro(s1), wallIn, s0, s1, a0, ac - hw));
      bag.add(EARTH, sector(c, ro(s0), wallIn, ro(s1), wallIn, s0, s1, ac + hw, a1));
      bag.add(TIMBER, sector(c, ro(s1) + 0.03, wallIn - 0.1, ro(s1) + 0.03, wallIn - 0.1, s1 - 0.1, s1, ac - hw, ac + hw));
      bag.add(TIMBER, sector(c, ro(s0) + 0.03, wallIn - 0.1, ro(s0) + 0.03, wallIn - 0.1, s0, s0 + 0.07, ac - hw, ac + hw));
      y = s1;
    }
    bag.add(EARTH, sector(c, ro(y), wallIn, ro(yTopO), wallIn, y, [yTopO, yTopI], a0, a1));
    // the tamped lifts, faint darker courses every 0.7 m (not across the windows)
    if (full || el.windows) for (let yy = 1.3 + 0.7; yy < yTopO - 0.5; yy += 0.7) {
      if (sills.some(([s0, s1]) => yy + 0.1 > s0 - 0.02 && yy < s1 + 0.02)) continue;
      bag.add('banco_rough', sector(c, ro(yy) + 0.03, ro(yy) - 0.05, ro(yy + 0.09) + 0.03, ro(yy + 0.09) - 0.05, yy, yy + 0.09, a0, a1));
    }
    // the wall as an obstacle (the chord of its middle line)
    const rm = (ro(0) + wallIn) / 2, [p0, p1] = [P(c, rm, a0), P(c, rm, a1)];
    col.segment(p0, p1, ro(0) - wallIn + 0.1, 0, topFl + 4);
  }
  // the gates: granite frame, lintel, tile hood, plank doors standing open against the passage walls
  for (const g of gates) {
    const a = g * da, phi = Math.PI / 2 - a, W = frameOf(c[0], c[1], phi), small = g * da > Math.PI * 1.2 || el.smallGate;
    const hw = el.gateW ? el.gateW / 2 : 1.2, rz0 = wallIn - 0.4, rz1 = R + 0.2;
    for (const s of [-1, 1]) bag.add('granite_block', lbox(c[0], c[1], phi, s > 0 ? hw : -hw - 0.3, 0, rz0, s > 0 ? hw + 0.3 : -hw, GATE_H, rz1));
    bag.add('granite_block', lbox(c[0], c[1], phi, -hw - 0.3, GATE_H, rz0, hw + 0.3, GATE_H + 0.35, rz1));
    bag.add('lacquer_black', lbox(c[0], c[1], phi, -0.9, GATE_H + 0.4, R - 0.05 - lean * 0.3, 0.9, GATE_H + 0.8, R - 0.0));
    bag.add('gilt_bronze', lbox(c[0], c[1], phi, -0.6, GATE_H + 0.52, R - 0.0, 0.6, GATE_H + 0.68, R + 0.03));
    bag.add(TILE, lbox(c[0], c[1], phi, -hw - 0.8, GATE_H + 0.9, R - 0.1, hw + 0.8, GATE_H + 1.0, R + 1.0));
    bag.add('tile_dark', lbox(c[0], c[1], phi, -hw - 0.85, GATE_H + 1.0, R + 0.9, hw + 0.85, GATE_H + 1.1, R + 1.0));
    for (const s of [-1, 1]) {
      bag.add(TIMBER, lbox(c[0], c[1], phi, s > 0 ? hw - 0.16 : -hw, 0, R - 1.55, s > 0 ? hw : -hw + 0.16, 3.2, R - 0.35));
      for (const y of [0.5, 1.6, 2.7]) bag.add('iron', lbox(c[0], c[1], phi, s > 0 ? hw - 0.19 : -hw - 0.03 + 0.0, y, R - 1.55, s > 0 ? hw + 0.03 : -hw + 0.19, y + 0.12, R - 0.35));
      const q0 = W(s * (hw + 0.15), rz0), q1 = W(s * (hw + 0.15), rz1);
      col.segment(q0, q1, 0.3, 0, GATE_H);
    }
    void small;
    // the rules of conduct, a board beside the gate [stated: NatGeo]
    bag.add('lacquer_black', lbox(c[0], c[1], phi, hw + 0.5, 1.5, R - lean * 0.12, hw + 1.2, 2.4, R + 0.04));
    bag.add('cloth_white', lbox(c[0], c[1], phi, hw + 0.58, 1.58, R + 0.03, hw + 1.12, 2.32, R + 0.05));
  }

  // ── the court: cobbles to the room fronts, a bluestone way from the gate to the hall ──
  bag.add('pebbles', disc(front, 0.02, 72, c[0], c[1]));
  if (full) {
    const phiS = 0;                                                                       // the south gate's axis is +z
    bag.add('bluestone', lbox(c[0], c[1], phiS, -1.1, 0.02, el.hall ? el.hall[3] + 0.3 : 0, 1.1, 0.06, R));
  } else bag.add('bluestone', lbox(c[0], c[1], 0, -1.0, 0.02, 0, 1.0, 0.05, R));

  // ── the ring of rooms ──
  const sRoom = full || el.rooms;
  const wedge = (a0, a1, rA, rB) => [P(c, rA, a0), P(c, rA, a1), P(c, rB, a1), P(c, rB, a0)];
  const furn = [];
  for (let k = 0; k < K; k++) {
    const y = fl[k], hTop = y + 2.95;
    for (let i = 0; i < n; i++) {
      const a0 = (i - 0.5) * da, a1 = (i + 0.5) * da;
      const bay = isBay(i), gate = isGate(i);
      if (!sRoom) {
        // the simpler tulou: the ring of rooms is a skin of boards on the court side with its floors' rims; only the gate passes
        if (k === 0) {
          if (gate) {
            const phi = Math.PI / 2 - i * da, W = frameOf(c[0], c[1], phi);
            for (const sg of [-1, 1]) { bag.add(TIMBER, lbox(c[0], c[1], phi, sg > 0 ? 1.12 : -1.24, 0, front - 0.05, sg > 0 ? 1.24 : -1.12, 3.0, wallIn)); col.segment(W(sg * 1.18, front - 0.05), W(sg * 1.18, wallIn), 0.14, 0, 3.4); }
          } else {
            bag.add(TIMBER, sector(c, front + 0.12, front, front + 0.12, front, 0, ceil, a0, a1));
            col.segment(P(c, front + 0.06, a0), P(c, front + 0.06, a1), 0.3, 0, ceil);
          }
        } else {
          bag.add(TIMBER, prism(wedge(a0, a1, rail, front), y - 0.26, y));
          const m0 = P(c, rail + 0.04, a0), m1 = P(c, rail + 0.04, a1);
          bag.add(TIMBER, rod([m0[0], y + 1.05, m0[1]], [m1[0], y + 1.05, m1[1]], 0.035, 5));
          bag.add(TIMBER, rod([m0[0], y + 0.5, m0[1]], [m1[0], y + 0.5, m1[1]], 0.025, 4));
          if (!gate) { const b = P(c, front + 0.13, (a0 + a1) / 2); void b; }
        }
        continue;
      }
      // floor of the room and its gallery (from the second floor up); the ground floor: the cobbles and an earth floor
      if (k === 0) { if (!gate) bag.add('ground', prism(wedge(a0, a1, front, wallIn + 0.05), 0, 0.025)); }
      else if (!bay) {
        const pts = wedge(a0, a1, rail, wallIn + 0.3);
        bag.add(TIMBER, prism(pts, y - 0.26, y));
        const xs = pts.map((q) => q[0]), zs = pts.map((q) => q[1]);
        col.floor([Math.min(...xs), Math.min(...zs), Math.max(...xs), Math.max(...zs)], y);
        // the railing along the gallery's edge: a rail, a lower bar, three balusters
        const m0 = P(c, rail + 0.04, a0), m1 = P(c, rail + 0.04, a1);
        bag.add(TIMBER, rod([m0[0], y + 1.05, m0[1]], [m1[0], y + 1.05, m1[1]], 0.035, 5));
        bag.add(TIMBER, rod([m0[0], y + 0.55, m0[1]], [m1[0], y + 0.55, m1[1]], 0.025, 4));
        for (let b = 1; b < 4; b++) { const pb = P(c, rail + 0.04, a0 + (a1 - a0) * b / 4); bag.add(TIMBER, rod([pb[0], y, pb[1]], [pb[0], y + 1.05, pb[1]], 0.018, 4)); }
        col.segment(P(c, rail, a0), P(c, rail, a1), 0.12, y, y + 1.1);
      }
      // the partition on the boundary at a1, between this room and the next
      const skipPart = (bay && isBay(i + 1)) || (k === 0 && (gate || isGate(i + 1)));
      if (!skipPart) { const q0 = P(c, front, a1), q1 = P(c, wallIn, a1); bag.add(TIMBER, plank(q0, q1, y, hTop, 0.1)); col.segment(q0, q1, 0.1, y, hTop); }
      if (gate && k === 0) {
        // the passage through the ring: straight boarded walls
        const phi = Math.PI / 2 - i * da, W = frameOf(c[0], c[1], phi);
        for (const sg of [-1, 1]) { bag.add(TIMBER, lbox(c[0], c[1], phi, sg > 0 ? 1.12 : -1.24, 0, front - 0.05, sg > 0 ? 1.24 : -1.12, 3.0, wallIn)); col.segment(W(sg * 1.18, front - 0.05), W(sg * 1.18, wallIn), 0.14, 0, 3.4); }
        continue;
      }
      if (bay) continue;
      // the front wall on the gallery, with a door in it; over the top room a fascia up to the roof, and the ceiling
      const q0 = P(c, front, a0), q1 = P(c, front, a1), L = Math.hypot(q1[0] - q0[0], q1[1] - q0[1]), ux = (q1[0] - q0[0]) / L, uz = (q1[1] - q0[1]) / L;
      const d0 = L / 2 - 0.62, d1 = L / 2 + 0.62, at = (d) => [q0[0] + ux * d, q0[1] + uz * d];
      bag.add(TIMBER, plank(q0, at(d0), y, hTop, 0.08)); bag.add(TIMBER, plank(at(d1), q1, y, hTop, 0.08)); bag.add(TIMBER, plank(at(d0), at(d1), y + 2.1, hTop, 0.08));
      col.segment(q0, at(d0), 0.08, y, hTop); col.segment(at(d1), q1, 0.08, y, hTop);
      for (const q of [at(d0), at(d1)]) bag.add('wood_dark', box(q[0] - 0.045, y, q[1] - 0.045, q[0] + 0.045, y + 2.1, q[1] + 0.045));
      if (k === K - 1) {
        bag.add(TIMBER, prism(wedge(a0, a1, front, front + 0.08), hTop, roofY(front) - 0.16));
        bag.add(TIMBER, prism(wedge(a0, a1, front, wallIn), hTop, hTop + 0.1));
      }
      if (el.furnish?.some((f) => f.k === k && f.i === idx(i))) furn.push({ k, i, a: i * da, kind: el.furnish.find((f) => f.k === k && f.i === idx(i)).kind });
    }
  }
  // the gallery posts: one to each room, ground to roof, red-brown; beams along each floor's rim
  for (let i = 0; i < n; i++) {
    const a = (i + 0.5) * da, p = P(c, rail - 0.02, a), top = roofY(rail - 0.02) - 0.12;
    bag.add('timber_red', box(p[0] - 0.1, 0, p[1] - 0.1, p[0] + 0.1, top, p[1] + 0.1));
    col.circle(p[0], p[1], 0.12, 0, topFl + 3);
  }
  for (let k = 1; k < K; k++) for (let i = 0; i < n; i++) {
    if (isBay(i) && full) continue;
    const a0 = (i - 0.5) * da, a1 = (i + 0.5) * da, q0 = P(c, rail - 0.02, a0), q1 = P(c, rail - 0.02, a1);
    bag.add('timber_red', rod([q0[0], fl[k] - 0.22, q0[1]], [q1[0], fl[k] - 0.22, q1[1]], 0.08, 5));
  }

  // ── the stair bays: three straight flights, alternating, in the bay against the wall ──
  if (full) for (const b of bays) {
    const s = Math.cos(b * da) > 0 ? 1 : -1, hz = 2.85, X0 = s > 0 ? wallIn - 2.2 : -wallIn + 0.3, X1 = X0 + 1.9;
    for (let k = 0; k < K - 1; k++) {
      const yA = fl[k], yB = fl[k + 1], N = Math.round((yB - yA) / 0.185), rise = (yB - yA) / N, run = 2 * hz / N, up = k % 2 === 0 ? -1 : 1;    // -1: ascending toward the north
      for (let q = 0; q < N; q++) {
        const zA = up < 0 ? hz - q * run : -hz + q * run, zB = up < 0 ? zA - run : zA + run, ty = yA + (q + 1) * rise;
        bag.add(TIMBER, box(X0, ty - 0.05, Math.min(zA, zB) - 0.02, X1, ty, Math.max(zA, zB) + 0.02));
        bag.add('wood_dark', box(X0, ty - rise, Math.min(zA, zB) - 0.02, X1, ty - 0.05, Math.min(zA, zB) + 0.01));
      }
      for (const xs of [X0, X1 - 0.07]) bag.add(TIMBER, rod([xs + 0.035, yA - 0.1, up < 0 ? hz : -hz], [xs + 0.035, yB - 0.1, up < 0 ? -hz : hz], 0.05, 5));
      col.ramp([X0, -hz, X1, hz], yA, yB, up < 0 ? 'n' : 's');
      const xr = s > 0 ? X0 : X1, za = up < 0 ? hz : -hz, zb = -za;
      bag.add(TIMBER, rod([xr, yA + 0.95, za], [xr, yB + 0.95, zb], 0.03, 5));
      for (let q = 0; q <= 4; q++) { const f = q / 4, yy = yA + (yB - yA) * f, zz = za + (zb - za) * f; bag.add(TIMBER, rod([xr, yy, zz], [xr, yy + 0.95, zz], 0.02, 4)); }
    }
    // the floors round the stairwell: the lobby in front of it and the strips at the hole's two ends
    for (let k = 1; k < K; k++) {
      const y = fl[k];
      const A = s > 0 ? [rail, -3.9, X0 - 0.1, 3.9] : [X1 + 0.1, -3.9, -rail, 3.9];
      const B1 = s > 0 ? [X0 - 0.1, -3.9, wallIn + 0.3, -hz] : [-wallIn - 0.3, -3.9, X1 + 0.1, -hz];
      const B2 = s > 0 ? [X0 - 0.1, hz, wallIn + 0.3, 3.9] : [-wallIn - 0.3, hz, X1 + 0.1, 3.9];
      for (const r of [A, B1, B2]) { bag.add(TIMBER, box(r[0], y - 0.26, r[1], r[2], y, r[3])); col.floor(r, y); }
      const xr = s > 0 ? rail : -rail;
      bag.add(TIMBER, rod([xr, y + 1.05, -3.9], [xr, y + 1.05, 3.9], 0.035, 5));
      bag.add(TIMBER, rod([xr, y + 0.55, -3.9], [xr, y + 0.55, 3.9], 0.025, 4));
      col.segment([xr, -3.9], [xr, 3.9], 0.12, y, y + 1.1);
    }
    bag.add('ground', box(s > 0 ? front : -wallIn - 0.05, 0, -3.9, s > 0 ? wallIn + 0.05 : -front, 0.025, 3.9));
  }

  // ── the ring roof, the second ring, the furnished rooms ──
  ringRoof(bag, c, n, rf);
  if (el.ring2) ring2(el, ctx);
  if (furn.length) furnishRooms(el, ctx, { front, wallIn, n, da, fl, c, furn });
}

/** The second ring: rooms of two storeys between r0 and r1: the ground floor walkable, the upper closed behind a lattice front. */
function ring2(el, ctx) {
  const { bag, col } = ctx, g = el.ring2, c = el.c, n = g.n, da = 2 * Math.PI / n, [, f1] = g.floors, top = g.eave;
  const o = { ro: g.r1 + 1.4, ye: top - 0.15, rr: (g.r0 + g.r1) / 2 + 0.2, yr: g.ridge, ri: g.r0 - 1.4, yi: top + 0.15 };
  const roofY = roofer(g.r1, o);
  const pass = (i) => i % (n / 4) === 0, ri = g.r1 - 0.7;
  const wedge = (a0, a1, rA, rB) => [P(c, rA, a0), P(c, rA, a1), P(c, rB, a1), P(c, rB, a0)];
  for (let i = 0; i < n; i++) {
    const a0 = (i - 0.5) * da, a1 = (i + 0.5) * da, ytO = roofY(g.r1) - 0.16, ytI = roofY(ri) - 0.16;
    // the upper floor, on a balcony projecting 0.9 m into the court
    bag.add(TIMBER, prism(wedge(a0, a1, g.r0 - 0.9, ri), f1 - 0.26, f1));
    for (let b = 0; b < 3; b++) { const p = P(c, g.r0 - 0.9, a0 + (a1 - a0) * (b + 0.5) / 3); bag.add('timber_red', box(p[0] - 0.04, f1, p[1] - 0.04, p[0] + 0.04, f1 + 1.0, p[1] + 0.04)); }
    const m0 = P(c, g.r0 - 0.9, a0), m1 = P(c, g.r0 - 0.9, a1);
    bag.add(TIMBER, rod([m0[0], f1 + 1.0, m0[1]], [m1[0], f1 + 1.0, m1[1]], 0.035, 5));
    // the outer wall: granite foot, rammed earth; over a passage only the lintel course
    if (pass(i)) bag.add(EARTH, sector(c, g.r1, ri, g.r1, ri, 3.1, [ytO, ytI], a0, a1));
    else {
      bag.add('granite_block', sector(c, g.r1 + 0.04, ri, g.r1 + 0.04, ri, 0, 0.9, a0, a1));
      bag.add(EARTH, sector(c, g.r1, ri, g.r1, ri, 0.9, [ytO, ytI], a0, a1));
      col.segment(P(c, (g.r1 + ri) / 2, a0), P(c, (g.r1 + ri) / 2, a1), g.r1 - ri, 0, top);
      bag.add('ground', prism(wedge(a0, a1, g.r0, ri), 0, 0.025));
      // the room's front on the court, a door in it; above, the lattice
      const f0 = P(c, g.r0, a0), f1p = P(c, g.r0, a1), L = Math.hypot(f1p[0] - f0[0], f1p[1] - f0[1]), ux = (f1p[0] - f0[0]) / L, uz = (f1p[1] - f0[1]) / L, at = (d) => [f0[0] + ux * d, f0[1] + uz * d];
      const d0 = L / 2 - 0.62, d1 = L / 2 + 0.62;
      bag.add(TIMBER, plank(f0, at(d0), 0, f1, 0.08)); bag.add(TIMBER, plank(at(d1), f1p, 0, f1, 0.08)); bag.add(TIMBER, plank(at(d0), at(d1), 2.1, f1, 0.08));
      col.segment(f0, at(d0), 0.08, 0, f1); col.segment(at(d1), f1p, 0.08, 0, f1);
      for (const q of [at(d0), at(d1)]) bag.add('wood_dark', box(q[0] - 0.045, 0, q[1] - 0.045, q[0] + 0.045, 2.1, q[1] + 0.045));
      const sub = (s0, s1) => [P(c, g.r0, a0 + (a1 - a0) * s0), P(c, g.r0, a0 + (a1 - a0) * s1)];
      bag.add(TIMBER, plank(...sub(0, 1), f1, f1 + 0.9, 0.1));
      bag.add('lattice', plank(...sub(0.12, 0.88), f1 + 0.9, top - 0.45, 0.06));
      bag.add(TIMBER, plank(...sub(0, 1), top - 0.45, roofY(g.r0) - 0.16, 0.1));
    }
    // the partition on the boundary at a1 (the sides of the passages too)
    if (!(pass(i) && pass(i + 1))) { const q0 = P(c, g.r0, a1), q1 = P(c, ri, a1); bag.add(TIMBER, plank(q0, q1, 0, f1, 0.1)); col.segment(q0, q1, 0.1, 0, f1); }
  }
  // the posts under the balcony, up to the roof
  for (let i = 0; i < n; i++) { const p = P(c, g.r0 - 0.9, (i + 0.5) * da); bag.add('timber_red', box(p[0] - 0.09, 0, p[1] - 0.09, p[0] + 0.09, roofY(g.r0 - 0.9) - 0.14, p[1] + 0.09)); col.circle(p[0], p[1], 0.11, 0, top); }
  ringRoof(bag, c, n, o);
}
export { lathe, STYLES };
