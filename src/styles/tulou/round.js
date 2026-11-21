// A round tulou (docs/settlements/hakka-tulou.md §4.1): the rammed-earth ring on its cobble plinth, leaning
// in, windowless below; inside it the ring of rooms on each floor, doors on the gallery, the galleries
// themselves on their posts with a railing, two stair bays, the ring roof of tiles; for the landmark a
// second ring of two storeys; the court with its cobbles and wells. Everything walkable is given its
// floors and obstacles. `full: false` builds the simpler neighbour (a solid ring of room fronts, only the
// court to walk).
import { STYLES } from '../../core/build.js';
import { box, disc, lathe, rod } from '../../core/geom.js';
import { DEG, P, hexa, sector, slope, lbox, frameOf, prism, plank } from './geo.js';
import { furnishRooms, fillRoom } from './rooms.js';
import { roofRows, cobbleFoot, windowHood, jbox, lslab, couplet, rnd } from './detail.js';

const EARTH = 'mud_plaster', INNER = 'earth_wall', TIMBER = 'timber', TILE = 'tile_grey';
const GATE_H = 3.4;

const hash = (i, s) => { let h = Math.imul(i + 1, 374761393) ^ Math.imul(s + 7, 668265263); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };

/** Weathering of one wall sector by damp and rain: the splashed foot, lichen, pale rain tails under the sills, lime patches where it was mended. */
function weather(bag, c, ro, a0, a1, i, sills) {
  const da = a1 - a0, patch = (m, y0, y1, f0, f1) => bag.add(m, sector(c, ro(y0) + 0.04, ro(y0) - 0.04, ro(y1) + 0.04, ro(y1) - 0.04, y0, y1, a0 + da * f0, a0 + da * f1));
  const r1 = hash(i, 1), r2 = hash(i, 2), r3 = hash(i, 3), r4 = hash(i, 4);
  patch('banco_rough', 1.3, 1.65 + 0.7 * r1, 0, 1);                         // the foot, darkened by splash
  if (r2 < 0.4) patch('plaster_damp', 1.7 + r1 * 0.5, 2.2 + r2 * 1.5, 0.15 + r3 * 0.3, 0.45 + r3 * 0.4);      // lichen
  if (r4 < 0.14) patch('lime_plaster_rough', 1.9 + r3, 2.9 + r3, 0.2, 0.8);          // a mended patch
  else if (r4 < 0.2) patch('banco_rough', 2.6, 3.6 + r3, 0.3, 0.55);             // earth laid bare
  for (const [s0] of sills) if (hash(i, Math.round(s0 * 10)) < 0.55) patch('plaster_streak', s0 - 1.7, s0, 0.4, 0.6);   // the rain tail under a window
}

export function roofer(R, o) {
  const ro = o.ro, ye = o.ye, rr = o.rr, yr = o.yr, ri = o.ri, yi = o.yi;
  return (r) => (r >= rr ? yr - (yr - ye) * Math.min(1, (r - rr) / (ro - rr)) : yr - (yr - yi) * Math.min(1, (rr - r) / (rr - ri)));
}

/** The ring roof over rings of radius [ri…ro]: tile slabs on a soffit of boards, a ridge of dark tiles. */
export function ringRoof(bag, c, n, o, rows = false) {
  const da = 2 * Math.PI / n;
  for (let i = 0; i < n; i++) {
    const a0 = (i - 0.5) * da - 0.0008, a1 = (i + 0.5) * da + 0.0008;
    bag.add(TILE, slope(c, o.ro, o.ye, o.rr, o.yr, 0.1, a0, a1));
    bag.add(TILE, slope(c, o.rr, o.yr, o.ri, o.yi, 0.1, a0, a1));
    bag.add(TIMBER, slope(c, o.ro, o.ye - 0.1, o.rr, o.yr - 0.1, 0.05, a0, a1));
    bag.add(TIMBER, slope(c, o.rr, o.yr - 0.1, o.ri, o.yi - 0.1, 0.05, a0, a1));
    bag.add('tile_dark', slope(c, o.rr + 0.35, o.yr + 0.09, o.rr - 0.35, o.yr + 0.09, 0.14, a0, a1));
    // the eave: a drip row of darker tile ends along the edge and a fascia board under it
    const yAt = (r) => o.ye + (o.yr - o.ye) * (o.ro - r) / (o.ro - o.rr);
    bag.add('tile_dark', slope(c, o.ro, o.ye + 0.035, o.ro - 0.4, yAt(o.ro - 0.4) + 0.035, 0.07, a0, a1));
    bag.add('wood_dark', sector(c, o.ro + 0.01, o.ro - 0.05, o.ro + 0.01, o.ro - 0.05, o.ye - 0.26, o.ye - 0.02, a0, a1));
  }
  // the rafters under the soffit: one in every second sector, a purlin ring under the ridge
  if (rows) roofRows(bag, c, n, o, 7, true);
  for (let i = 0; i < n; i += 2) {
    const a = i * da, p = (r, y) => { const [x, z] = P(c, r, a); return [x, y, z]; };
    if (!rows) bag.add(TIMBER, rod(p(o.ro - 0.2, o.ye - 0.18), p(o.rr, o.yr - 0.2), 0.05, 5));
    bag.add(TIMBER, rod(p(o.rr, o.yr - 0.2), p(o.ri + 0.2, o.yi - 0.18), 0.05, 5));
  }
}

export function tulouRound(el, ctx) {
  const { bag, col } = ctx, LF = STYLES.life.elements;
  const c = el.c, R = el.R, n = el.n, da = 2 * Math.PI / n, fl = el.floors, K = fl.length, full = !!el.full;
  const wallIn = el.wallIn ?? R - 1.5, front = el.front ?? wallIn - 4.0, rail = el.rail ?? front - 1.7, lean = el.lean ?? 0.38;
  const topFl = fl[K - 1], ceil = topFl + 3.0;
  const rf = { ro: R + 1.9, ye: topFl + 2.6, rr: (front + wallIn) / 2 + 0.3, yr: el.ridge ?? topFl + 5.3, ri: rail - 0.9, yi: topFl + 3.2 };
  const roofY = roofer(R, rf);
  const H0 = ceil + 0.6;
  const ro = (y) => R - lean * Math.min(y, H0) / H0;
  const yTopO = roofY(ro(H0)) - 0.16, yTopI = roofY(wallIn) - 0.16;
  const gates = (el.gates ?? [90]).map((g) => Math.round(g * DEG / da));
  const wi = el.windowsFrom ?? 2;
  const idx = (i) => ((i % n) + n) % n;
  const isGate = (i) => gates.includes(idx(i));
  const bays = (full || el.stairs) ? (el.bays ?? [0, 180]).map((g) => Math.round(g * DEG / da)) : [];
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
    if (full || el.windows) {
      bag.add('banco_rough', sector(c, R - 0.0, wallIn, ro(1.3) - 0.0, wallIn, 0, 1.3, a0, a1));
      cobbleFoot(bag, c, ro, a0, a1, i);
    } else bag.add('granite_block', sector(c, R + 0.07, wallIn, ro(1.3) + 0.04, wallIn, 0, 1.3, a0, a1));
    let y = 1.3;
    if (full || el.windows) for (const [s0, s1] of sills) {
      const topW = s0 > fl[K - 1];
      bag.add(EARTH, sector(c, ro(y), wallIn, ro(s0), wallIn, y, s0, a0, a1));
      // the window: two piers beside a 0.5 m opening, a timber lintel and sill
      const hw = 0.27 / ro(s0);
      bag.add(EARTH, sector(c, ro(s0), wallIn, ro(s1), wallIn, s0, s1, a0, ac - hw));
      bag.add(EARTH, sector(c, ro(s0), wallIn, ro(s1), wallIn, s0, s1, ac + hw, a1));
      bag.add(TIMBER, sector(c, ro(s1) + 0.03, wallIn - 0.1, ro(s1) + 0.03, wallIn - 0.1, s1 - 0.1, s1, ac - hw, ac + hw));
      bag.add(TIMBER, sector(c, ro(s0) + 0.03, wallIn - 0.1, ro(s0) + 0.03, wallIn - 0.1, s0, s0 + 0.07, ac - hw, ac + hw));
      // three bars across the opening, a dark recess behind; on the top floor two narrow gun ports either side
      { const rb = (ro(s0) + wallIn) / 2; for (const f of [-0.55, 0, 0.55]) { const [bx, bz] = P(c, rb, ac + hw * f); bag.add(TIMBER, rod([bx, s0, bz], [bx, s1, bz], 0.017, 4)); } }
      if (topW) for (const off of [-0.3, 0.3]) {
        const gy = s0 + 0.45, gh = 0.07 / ro(gy), ag = ac + off * da;
        bag.add('opening', sector(c, ro(gy + 0.3) + 0.01, ro(gy) - 0.05, ro(gy + 0.3) + 0.01, ro(gy) - 0.05, gy, gy + 0.3, ag - gh, ag + gh));
        bag.add('opening', sector(c, wallIn + 0.01, wallIn - 0.03, wallIn + 0.01, wallIn - 0.03, gy, gy + 0.3, ag - gh, ag + gh));
      }
      if (full) windowHood(bag, c, ro, ac, s0, s1, i, Math.round(s0));
      y = s1;
    }
    bag.add(EARTH, sector(c, ro(y), wallIn, ro(yTopO), wallIn, y, [yTopO, yTopI], a0, a1));
    // the tamped lifts, faint darker courses every 0.7 m (not across the windows)
    if (full || el.windows) for (let yy = 1.3 + 0.7; yy < yTopO - 0.5; yy += 0.7) {
      if (sills.some(([s0, s1]) => yy + 0.1 > s0 - 0.02 && yy < s1 + 0.02)) continue;
      bag.add('banco_rough', sector(c, ro(yy) + 0.03, ro(yy) - 0.05, ro(yy + 0.09) + 0.03, ro(yy + 0.09) - 0.05, yy, yy + 0.09, a0, a1));
    }
    if (full || el.windows) weather(bag, c, ro, a0, a1, i, sills);
    // the wall as an obstacle (the chord of its middle line)
    const rm = (ro(0) + wallIn) / 2, [p0, p1] = [P(c, rm, a0), P(c, rm, a1)];
    col.segment(p0, p1, ro(0) - wallIn + 0.1, 0, topFl + 4);
  }
  // the gates: a granite frame of dressed blocks with a stepped lintel, a pitched tile hood on corbels, the name board, plank doors
  // shod with iron and studded, standing open against the passage walls, the couplets, the rules board, the worn threshold
  for (const g of gates) {
    const a = g * da, phi = Math.PI / 2 - a, W = frameOf(c[0], c[1], phi), small = g * da > Math.PI * 1.2 || el.smallGate;
    const hw = el.gateW ? el.gateW / 2 : 1.2, rz0 = wallIn - 0.4, rz1 = R + 0.2, J = (x0, y0, z0, x1, y1, z1, sd, m = 'granite_block') => bag.add(m, jbox(c[0], c[1], phi, x0, y0, z0, x1, y1, z1, g * 97 + sd));
    for (const s of [-1, 1]) {
      bag.add('granite_block', lbox(c[0], c[1], phi, s > 0 ? hw : -hw - 0.3, 0, rz0, s > 0 ? hw + 0.3 : -hw, GATE_H, rz1));
      // the jamb dressed in courses of long and short blocks (the joints are shadow lines), an outer stone frame stepped beyond it
      const x0 = s > 0 ? hw : -hw - 0.3, x1 = x0 + 0.3, courses = [0.0, 0.62, 1.14, 1.9, 2.42, 2.95, GATE_H];
      for (let q = 0; q < courses.length - 1; q++) {
        const long = q % 2 === 0, e = long ? 0.0 : 0.17, xa = s > 0 ? x0 : x0 + e, xb = s > 0 ? x1 - e : x1;
        J(xa + 0.008, courses[q] + 0.008, rz1, xb - 0.008, courses[q + 1] - 0.008, rz1 + 0.03 + (q % 3) * 0.008, 10 + q * 3 + (s > 0 ? 1 : 0));
        if (!long) J(s > 0 ? x1 - 0.15 + 0.008 : x0 + 0.008, courses[q] + 0.008, rz1, s > 0 ? x1 - 0.008 : x0 + 0.15 - 0.008, courses[q + 1] - 0.008, rz1 + 0.03 + (q % 3) * 0.008, 60 + q);
      }
      const o0 = s > 0 ? hw + 0.3 : -hw - 0.3 - 0.2, o1 = o0 + 0.2;
      J(o0, 0, R - 0.12, o1, GATE_H + 0.35, R + 0.07, 80 + (s > 0 ? 1 : 0));
      J(o0 + 0.02, 0.0, R + 0.07, o1 - 0.02, GATE_H + 0.33, R + 0.09, 82 + (s > 0 ? 1 : 0));
    }
    // the lintel: one long stone, a second course above it stepped out, and a moulded cornice under the hood
    bag.add('granite_block', lbox(c[0], c[1], phi, -hw - 0.3, GATE_H, rz0, hw + 0.3, GATE_H + 0.35, rz1));
    J(-hw - 0.5, GATE_H, R - 0.12, hw + 0.5, GATE_H + 0.35, R + 0.2, 90);
    J(-hw - 0.55, GATE_H + 0.35, R - 0.1, hw + 0.55, GATE_H + 0.45, R + 0.26, 91);
    J(-hw - 0.62, GATE_H + 0.45, R - 0.1, hw + 0.62, GATE_H + 0.52, R + 0.34, 92);
    // the name board between lintel and hood: black lacquer with a gilt frame and gilt strokes for the characters
    bag.add('lacquer_black', lbox(c[0], c[1], phi, -1.0, GATE_H + 0.6, R - 0.12 - lean * 0.3, 1.0, GATE_H + 1.1, R + 0.05));
    for (const [x0, y0, x1, y1] of [[-1.0, GATE_H + 0.6, 1.0, GATE_H + 0.66], [-1.0, GATE_H + 1.04, 1.0, GATE_H + 1.1], [-1.0, GATE_H + 0.66, -0.94, GATE_H + 1.04], [0.94, GATE_H + 0.66, 1.0, GATE_H + 1.04]]) J(x0, y0, R + 0.05, x1, y1, R + 0.075, 100 + Math.round(x0 * 7 + y0), 'gilt_bronze');
    for (let q = 0; q < 4; q++) {
      const cx0 = -0.62 + q * 0.34;
      for (let s = 0; s < 4; s++) {
        const hor = rnd(g + q, 3 + s) < 0.55, u = (rnd(g + q, 13 + s) - 0.5) * 0.12, v = (rnd(g + q, 23 + s) - 0.5) * 0.14;
        if (hor) J(cx0 + u - 0.09, GATE_H + 0.85 + v - 0.012, R + 0.05, cx0 + u + 0.09, GATE_H + 0.85 + v + 0.012, R + 0.063, 200 + q * 5 + s, 'gilt_bronze');
        else J(cx0 + u - 0.012, GATE_H + 0.85 + v - 0.11, R + 0.05, cx0 + u + 0.012, GATE_H + 0.85 + v + 0.11, R + 0.063, 230 + q * 5 + s, 'gilt_bronze');
      }
    }
    // the hood: a pitched slab of tile with a dark drip edge, a ridge tile at the wall, rows of cover tiles, a soffit and corbel arms
    const hy0 = GATE_H + 1.75, hy1 = GATE_H + 1.22, hz1 = R + 1.25, hx = hw + 1.0;
    bag.add('tile_grey', lslab(c[0], c[1], phi, -hx, hx, R - 0.1, hy0, hz1, hy1, 0.09));
    bag.add('timber', lslab(c[0], c[1], phi, -hx + 0.05, hx - 0.05, R - 0.05, hy0 - 0.09, hz1 - 0.05, hy1 - 0.09, 0.05));
    bag.add('tile_dark', lslab(c[0], c[1], phi, -hx - 0.06, hx + 0.06, hz1 - 0.34, hy1 + (hy0 - hy1) * 0.34 / 1.35 + 0.02, hz1 + 0.06, hy1 + 0.03, 0.08));
    bag.add('tile_dark', lslab(c[0], c[1], phi, -hx - 0.06, hx + 0.06, R - 0.12, hy0 + 0.14, R + 0.2, hy0 + 0.06, 0.12));
    for (let q = 0; q < 17; q++) {
      const x = -hx + 0.16 + q * (2 * hx - 0.32) / 16;
      bag.add('tile_dark', lslab(c[0], c[1], phi, x - 0.05 - rnd(q, g) * 0.004, x + 0.05, R + 0.1, hy0 + 0.1 - 0.02, hz1 - 0.34, hy1 + (hy0 - hy1) * 0.34 / 1.35 + 0.07, 0.07 + rnd(q, g + 3) * 0.003));
    }
    for (const sx of [-1, 1]) {
      for (const [x, z0, z1] of [[sx * (hx - 0.22), R - 0.1, R + 1.05], [sx * 0.5, R - 0.1, R + 0.95]]) {
        J(x - 0.06, hy0 - 0.9, z0, x + 0.06, hy0 - 0.78, z0 + 0.14, 300 + Math.round(x * 10), 'timber');
        bag.add('timber_red', lslab(c[0], c[1], phi, x - 0.06, x + 0.06, z0, hy0 - 0.78, z1, hy1 - 0.12, 0.1));
        J(x - 0.075, hy1 - 0.36, z1 - 0.13, x + 0.075, hy1 - 0.12, z1 - 0.02, 310 + Math.round(x * 10), 'timber');
      }
      // the corner tip of the eave turned up a hand
      J(sx * hx - (sx > 0 ? 0.42 : -0.02), hy1 + 0.02, hz1 - 0.1, sx * hx + (sx > 0 ? 0.02 : 0.42), hy1 + 0.2, hz1 + 0.2, 320 + sx, 'tile_grey');
    }
    // the doors: leaves 0.12 thick lying along the passage walls, boarded, strapped and studded with iron, a bronze boss and pull
    for (const s of [-1, 1]) {
      const xf = s > 0 ? hw - 0.12 : -hw, xi = s > 0 ? hw - 0.12 : -hw + 0.12, fs = s > 0 ? -1 : 1;
      bag.add('timber', lbox(c[0], c[1], phi, xf, 0, R - 1.55, xf + 0.12, 3.2, R - 0.35));
      for (let b = 1; b < 6; b++) J(xi + fs * 0.0 - (s > 0 ? 0.008 : -0.0), 0.0, R - 1.55 + b * 0.2 - 0.006, xi + (s > 0 ? -0.012 : 0.012), 3.2, R - 1.55 + b * 0.2 + 0.006, 400 + b + (s > 0 ? 9 : 0), 'wood_dark');
      for (const y of [0.5, 1.6, 2.7]) {
        bag.add('iron', lbox(c[0], c[1], phi, s > 0 ? hw - 0.15 : -hw - 0.03 + 0.0, y, R - 1.55, s > 0 ? hw + 0.03 : -hw + 0.15, y + 0.12, R - 0.35));
        for (let q = 0; q < 6; q++) {
          const z = R - 1.5 + q * 0.2 + 0.05 * rnd(q, y * 10);
          J(xi + (s > 0 ? -0.036 : 0.0), y + 0.025, z, xi + (s > 0 ? 0.0 : 0.036), y + 0.095, z + 0.07, 500 + q + Math.round(y * 5) + (s > 0 ? 40 : 0), 'iron');
        }
      }
      J(xi + (s > 0 ? -0.04 : 0.0), 1.2, R - 1.05, xi + (s > 0 ? 0.0 : 0.04), 1.35, R - 0.9, 600 + (s > 0 ? 1 : 0), 'bronze');
      J(xi + (s > 0 ? -0.07 : 0.0), 1.02, R - 0.99, xi + (s > 0 ? 0.0 : 0.07), 1.18, R - 0.96, 602 + (s > 0 ? 1 : 0), 'bronze');
      const q0 = W(s * (hw + 0.15), rz0), q1 = W(s * (hw + 0.15), rz1);
      col.segment(q0, q1, 0.3, 0, GATE_H);
    }
    void small;
    // red couplets (strokes for the characters) on the granite jambs, a strip of red paper over the lintel, two lanterns under the hood, the worn threshold and its step
    for (const sg of [-1, 1]) {
      bag.add('lacquer_red', lbox(c[0], c[1], phi, sg > 0 ? hw + 0.05 : -hw - 0.25, 0.9, R + 0.25, sg > 0 ? hw + 0.25 : -hw - 0.05, 3.0, R + 0.28));
      couplet(bag, c, phi, sg > 0 ? hw + 0.05 : -hw - 0.25, sg > 0 ? hw + 0.25 : -hw - 0.05, 0.9, 3.0, R + 0.28, g * 3 + (sg > 0 ? 1 : 0));
    }
    bag.add('cloth_red', lbox(c[0], c[1], phi, -hw, GATE_H - 0.5, R + 0.25, hw, GATE_H - 0.2, R + 0.275));
    bag.add('granite_block', lbox(c[0], c[1], phi, -hw - 0.3, 0, R - 0.3, hw + 0.3, 0.14, R + 1.4));
    bag.add('granite_block', lbox(c[0], c[1], phi, -hw - 0.1, 0, R + 1.4, hw + 0.1, 0.07, R + 1.85));
    for (const sg of [-1, 1]) { const q = W(sg * (hw + 0.1), R + 0.9); LF.hang_lantern({ t: 'hang_lantern', at: q, y: hy1 - 0.5, rot: 0, seed: g }, ctx); }
    // the rules of conduct, a board beside the gate [stated: NatGeo], its lines of script
    bag.add('lacquer_black', lbox(c[0], c[1], phi, hw + 0.6, 1.5, R - lean * 0.12, hw + 1.3, 2.4, R + 0.04));
    bag.add('cloth_white', lbox(c[0], c[1], phi, hw + 0.68, 1.58, R + 0.03, hw + 1.22, 2.32, R + 0.05));
    for (let q = 0; q < 7; q++) J(hw + 0.74, 2.2 - q * 0.1, R + 0.05, hw + 0.74 + 0.18 + rnd(q, g) * 0.22, 2.2 - q * 0.1 + 0.02, R + 0.058, 700 + q, 'iron');
  }

  // the apron of cobbles round the foot, on which the lane's life stands
  if (full || el.windows) for (let i = 0; i < n; i++) { const a0 = (i - 0.5) * da, a1 = (i + 0.5) * da; bag.add('pebbles', sector(c, R + (full ? 2.2 : 1.4), R - 0.1, R + (full ? 2.2 : 1.4), R - 0.1, -0.05, 0.03, a0, a1)); }
  // ── the court: cobbles to the room fronts, a bluestone way from the gate to the hall ──
  bag.add('pebbles', disc(front, 0.02, 72, c[0], c[1]));
  if (full) {
    const phiS = 0;                                                                       // the south gate's axis is +z
    // the way: two columns of bluestone slabs laid in bond with joints and a granite kerb each side; the stone gutter ring under the inner eave
    {
      const z0 = el.hall ? el.hall[3] + 0.3 : 0, zEnd = wallIn;
      let z = z0, q = 0;
      while (z < zEnd - 0.2) {
        for (const [xa, xb, off] of [[-1.1, -0.03, 0], [0.03, 1.1, 0.8]]) {
          const zs = Math.max(z0, z - off + (off ? 0 : 0)), L = 1.5 + rnd(q, 3) * 0.5, ze = Math.min(zEnd, z + L - off);
          if (ze - zs > 0.3) bag.add('bluestone', jbox(c[0], c[1], 0, xa, 0.02, zs + 0.02, xb, 0.06 + (rnd(q, 5) - 0.5) * 0.006, ze - 0.02, 800 + q));
          q++;
        }
        z += 1.5 + rnd(q, 4) * 0.5;
      }
      for (const x of [-1.2, 1.1]) bag.add('granite_block', jbox(c[0], c[1], 0, x, 0.02, z0, x + 0.1, 0.1, R + 0.1, 900 + (x > 0 ? 1 : 0)));
      const G = 96, dg = 2 * Math.PI / G, rg = rail - 1.0;
      for (let q2 = 0; q2 < G; q2++) {
        const am = (q2 + 0.5) * dg, d90 = Math.abs(((am - Math.PI / 2 + 3 * Math.PI) % (2 * Math.PI)) - Math.PI), d270 = Math.abs(((am - 1.5 * Math.PI + 3 * Math.PI) % (2 * Math.PI)) - Math.PI);
        if (Math.min(d90, d270) < 0.06) continue;
        for (const [r0, r1] of [[rg - 0.12, rg + 0.03], [rg + 0.38, rg + 0.53]]) bag.add('granite_block', sector(c, r1, r0, r1, r0, 0.0, 0.07 + rnd(q2, r0 * 9) * 0.004, q2 * dg, (q2 + 1) * dg + 0.0006));
      }
    }
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
      {
        // red couplets either side of the door and a paper strip over it; on some rooms a lantern or a pole of washing over the gallery
        const ph = Math.PI / 2 - i * da, mid = P(c, front, i * da), hz = hash(i * 5 + k, 9), W2 = frameOf(mid[0], mid[1], ph);
        if (L > 2.0) for (const sg of [-1, 1]) bag.add('lacquer_red', lbox(mid[0], mid[1], ph, sg > 0 ? 0.74 : -0.88, y + 0.9, -0.09, sg > 0 ? 0.88 : -0.74, y + 2.0, -0.03));
        if (L > 2.0) bag.add('cloth_red', lbox(mid[0], mid[1], ph, -0.5, y + 2.18, -0.09, 0.5, y + 2.3, -0.03));
        const ceilY = k < K - 1 ? fl[k + 1] - 0.3 : hTop + 0.05;
        if (hz < 0.2) LF.hang_lantern({ t: 'hang_lantern', at: W2(0, -0.8), y: ceilY, rot: 0, seed: i }, ctx);
        else if (hz < 0.36 && k > 0 && k < K - 1) LF.laundry_pole({ t: 'laundry_pole', at: W2(1.1, 0), y: y + 3.0, rot: ph + Math.PI, len: 1.4, seed: i * 3 + k }, ctx);
        else if (hz < 0.44 && k > 0) LF.basket({ t: 'basket', at: W2(-1.0, -0.65), y, rot: ph, n: 2, seed: i + k }, ctx);
      }
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
    bag.add('timber', box(p[0] - 0.08, 0, p[1] - 0.08, p[0] + 0.08, top, p[1] + 0.08));
    col.circle(p[0], p[1], 0.12, 0, topFl + 3);
  }
  for (let k = 1; k < K; k++) for (let i = 0; i < n; i++) {
    if (isBay(i) && full) continue;
    const a0 = (i - 0.5) * da, a1 = (i + 0.5) * da, q0 = P(c, rail - 0.02, a0), q1 = P(c, rail - 0.02, a1);
    bag.add('timber', rod([q0[0], fl[k] - 0.22, q0[1]], [q1[0], fl[k] - 0.22, q1[1]], 0.08, 5));
  }

  // ── the stair bays: three straight flights, alternating, in the bay against the wall ──
  const cx = c[0], cz = c[1];
  for (const b of bays) {
    const s = Math.cos(b * da) > 0 ? 1 : -1, hz = Math.min(2.85, front * 0.3), X0 = s > 0 ? wallIn - 2.2 : -wallIn + 0.3, X1 = X0 + 1.9, hl = hz + 1.05;
    for (let k = 0; k < K - 1; k++) {
      const yA = fl[k], yB = fl[k + 1], N = Math.round((yB - yA) / 0.185), rise = (yB - yA) / N, run = 2 * hz / N, up = k % 2 === 0 ? -1 : 1;    // -1: ascending toward the north
      for (let q = 0; q < N; q++) {
        const zA = up < 0 ? hz - q * run : -hz + q * run, zB = up < 0 ? zA - run : zA + run, ty = yA + (q + 1) * rise;
        bag.add(TIMBER, box(cx + X0, ty - 0.05, cz + Math.min(zA, zB) - 0.02, cx + X1, ty, cz + Math.max(zA, zB) + 0.02));
        bag.add('wood_dark', box(cx + X0, ty - rise, cz + Math.min(zA, zB) - 0.02, cx + X1, ty - 0.05, cz + Math.min(zA, zB) + 0.01));
      }
      for (const xs of [X0, X1 - 0.07]) bag.add(TIMBER, rod([cx + xs + 0.035, yA - 0.1, cz + (up < 0 ? hz : -hz)], [cx + xs + 0.035, yB - 0.1, cz + (up < 0 ? -hz : hz)], 0.05, 5));
      col.ramp([cx + X0, cz - hz, cx + X1, cz + hz], yA, yB, up < 0 ? 'n' : 's');
      const xr = cx + (s > 0 ? X0 : X1), za = cz + (up < 0 ? hz : -hz), zb = cz + (up < 0 ? -hz : hz);
      bag.add(TIMBER, rod([xr, yA + 0.95, za], [xr, yB + 0.95, zb], 0.03, 5));
      for (let q = 0; q <= 4; q++) { const f = q / 4, yy = yA + (yB - yA) * f, zz = za + (zb - za) * f; bag.add(TIMBER, rod([xr, yy, zz], [xr, yy + 0.95, zz], 0.02, 4)); }
    }
    // the floors round the stairwell: the lobby in front of it and the strips at the hole's two ends
    for (let k = 1; k < K; k++) {
      const y = fl[k];
      const A = s > 0 ? [rail, -hl, X0 - 0.1, hl] : [X1 + 0.1, -hl, -rail, hl];
      const B1 = s > 0 ? [X0 - 0.1, -hl, wallIn + 0.3, -hz] : [-wallIn - 0.3, -hl, X1 + 0.1, -hz];
      const B2 = s > 0 ? [X0 - 0.1, hz, wallIn + 0.3, hl] : [-wallIn - 0.3, hz, X1 + 0.1, hl];
      for (const r of [A, B1, B2]) { bag.add(TIMBER, box(cx + r[0], y - 0.26, cz + r[1], cx + r[2], y, cz + r[3])); col.floor([cx + r[0], cz + r[1], cx + r[2], cz + r[3]], y); }
      const xr = cx + (s > 0 ? rail : -rail);
      bag.add(TIMBER, rod([xr, y + 1.05, cz - hl], [xr, y + 1.05, cz + hl], 0.035, 5));
      bag.add(TIMBER, rod([xr, y + 0.55, cz - hl], [xr, y + 0.55, cz + hl], 0.025, 4));
      col.segment([xr, cz - hl], [xr, cz + hl], 0.12, y, y + 1.1);
    }
    bag.add('ground', box(cx + (s > 0 ? front : -wallIn - 0.05), 0, cz - hl, cx + (s > 0 ? wallIn + 0.05 : -front), 0.025, cz + hl));
  }

  // ── the ring roof, the second ring, the furnished rooms ──
  ringRoof(bag, c, n, rf, full);
  if (el.ring2) ring2(el, ctx);
  if (furn.length) furnishRooms(el, ctx, { front, wallIn, n, da, fl, c, furn });
}

/**
 * The second ring: rooms of two storeys between r0 and r1; the ground floor walkable. The upper storey (g.up, docs §4.8) is open: a balcony
 * g.bal wide on the court, carried on posts, with its rail; a door in every room's front under a lattice; partitions up to the roof; the
 * floors colliders; each room furnished by its kind (g.kinds); two open stairs in the court (g.stair), straight flights with a landing
 * onto the balcony. Without `up` the upper storey stays closed behind a lattice front.
 */
function ring2(el, ctx) {
  const { bag, col } = ctx, g = el.ring2, c = el.c, n = g.n, da = 2 * Math.PI / n, [, f1] = g.floors, top = g.eave;
  const up = !!g.up, rb = g.r0 - (up ? g.bal ?? 1.5 : 0.9);
  const o = { ro: g.r1 + 1.0, ye: top - 0.15, rr: (g.r0 + g.r1) / 2 + 0.2, yr: g.ridge, ri: g.r0 - (up ? 1.8 : 1.1), yi: top + 0.15 };
  const roofY = roofer(g.r1, o);
  const pass = (i) => i % (n / 4) === 0, ri = g.r1 - 0.7;
  const wedge = (a0, a1, rA, rB) => [P(c, rA, a0), P(c, rA, a1), P(c, rB, a1), P(c, rB, a0)];
  // the stairs (two, the second the first turned half round the court): world rectangles, and the arc of the balcony's rail that the landing opens
  const S = g.stair, stairs = up && S ? [1, -1].map((s) => {
    const W = (X, Z) => [c[0] + s * X, c[1] + s * Z];
    const rect = (X0, Z0, X1, Z1) => { const a = W(X0, Z0), b = W(X1, Z1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
    const land = rect(S.X1, S.Zn, S.XL, S.Zs);
    let a0 = Infinity, a1 = -Infinity;
    for (let d = 0; d < 360; d += 0.1) { const [x, z] = P(c, rb, d * DEG); if (x >= land[0] && x <= land[2] && z >= land[1] && z <= land[3]) { a0 = Math.min(a0, d * DEG); a1 = Math.max(a1, d * DEG); } }
    return { s, W, rect, land, a0: a0 - 0.004, a1: a1 + 0.004 };
  }) : [];
  const inGap = (a, m = 0) => { const q = ((a % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI); return stairs.some((st) => q >= st.a0 - m && q <= st.a1 + m); };
  /** The part of [l, h] (angles) that the landings leave: the rail's pieces. */
  const railPieces = (l, h) => {
    if (l < 0) { l += 2 * Math.PI; h += 2 * Math.PI; }
    let ps = [[l, h]];
    for (const st of stairs) ps = ps.flatMap(([p, q]) => (st.a1 <= p || st.a0 >= q ? [[p, q]] : [...(st.a0 > p ? [[p, st.a0]] : []), ...(st.a1 < q ? [[st.a1, q]] : [])]));
    return ps.filter(([p, q]) => (q - p) * rb > 0.05);
  };
  for (let i = 0; i < n; i++) {
    const a0 = (i - 0.5) * da, a1 = (i + 0.5) * da, ac = i * da, ytO = roofY(g.r1) - 0.16, ytI = roofY(ri) - 0.16;
    // the upper floor, on a balcony projecting into the court
    bag.add(TIMBER, prism(wedge(a0, a1, rb, ri), f1 - 0.26, f1));
    if (up) {
      // the floor as colliders: the balcony strip and the room, each in slices (a bounding box of a slice overhangs little)
      for (const [rA, rB, ns] of [[rb, g.r0, 5], [g.r0, ri, 4]]) for (let q = 0; q < ns; q++) {
        const pts = wedge(a0 + (a1 - a0) * q / ns, a0 + (a1 - a0) * (q + 1) / ns, rA, rB), xs = pts.map((p) => p[0]), zs = pts.map((p) => p[1]);
        col.floor([Math.min(...xs), Math.min(...zs), Math.max(...xs), Math.max(...zs)], f1);
      }
      const b0 = P(c, rb - 0.02, a0), b1 = P(c, rb - 0.02, a1);
      bag.add('timber', rod([b0[0], f1 - 0.22, b0[1]], [b1[0], f1 - 0.22, b1[1]], 0.08, 5));
    }
    for (let b = 0; b < 3; b++) {
      const aa = a0 + (a1 - a0) * (b + 0.5) / 3;
      if (up && inGap(aa, 0.004)) continue;
      const p = P(c, rb, aa); bag.add('timber', box(p[0] - 0.04, f1, p[1] - 0.04, p[0] + 0.04, f1 + 1.0, p[1] + 0.04));
    }
    if (up) for (const [l, h] of railPieces(a0, a1)) {
      const m0 = P(c, rb, l), m1 = P(c, rb, h);
      bag.add(TIMBER, rod([m0[0], f1 + 1.0, m0[1]], [m1[0], f1 + 1.0, m1[1]], 0.035, 5));
      col.segment(m0, m1, 0.12, f1, f1 + 1.1);
    } else {
      const m0 = P(c, rb, a0), m1 = P(c, rb, a1);
      bag.add(TIMBER, rod([m0[0], f1 + 1.0, m0[1]], [m1[0], f1 + 1.0, m1[1]], 0.035, 5));
    }
    // the outer wall: granite foot, rammed earth; over a passage only the lintel course
    if (pass(i)) bag.add(EARTH, sector(c, g.r1, ri, g.r1, ri, 3.1, [ytO, ytI], a0, a1));
    else {
      bag.add('granite_block', sector(c, g.r1 + 0.04, ri, g.r1 + 0.04, ri, 0, 0.9, a0, a1));
      bag.add(EARTH, sector(c, g.r1, ri, g.r1, ri, 0.9, [ytO, ytI], a0, a1));
      col.segment(P(c, (g.r1 + ri) / 2, a0), P(c, (g.r1 + ri) / 2, a1), g.r1 - ri, 0, top);
      bag.add('ground', prism(wedge(a0, a1, g.r0, ri), 0, 0.025));
      // the room's front on the court, a door in it; above, the lattice (the upper storey of an open ring: its own front, below)
      const f0 = P(c, g.r0, a0), f1p = P(c, g.r0, a1), L = Math.hypot(f1p[0] - f0[0], f1p[1] - f0[1]), ux = (f1p[0] - f0[0]) / L, uz = (f1p[1] - f0[1]) / L, at = (d) => [f0[0] + ux * d, f0[1] + uz * d];
      const d0 = L / 2 - 0.62, d1 = L / 2 + 0.62;
      bag.add(TIMBER, plank(f0, at(d0), 0, f1, 0.08)); bag.add(TIMBER, plank(at(d1), f1p, 0, f1, 0.08)); bag.add(TIMBER, plank(at(d0), at(d1), 2.1, f1, 0.08));
      col.segment(f0, at(d0), 0.08, 0, f1); col.segment(at(d1), f1p, 0.08, 0, f1);
      for (const q of [at(d0), at(d1)]) bag.add('wood_dark', box(q[0] - 0.045, 0, q[1] - 0.045, q[0] + 0.045, 2.1, q[1] + 0.045));
      // the ground room, furnished (docs §4.8, §11: the inner ring's school and guest rooms): guest bedrooms, sitting rooms with the tea table, tool rooms
      if (up) { const rc0 = P(c, ri - 2.0, ac), hk = hash(i, 71); fillRoom(ctx, { ox: rc0[0], oz: rc0[1], phi: Math.PI / 2 - ac, y: 0 }, hk < 0.4 ? 'bedroom' : hk < 0.75 ? 'tea' : 'tools', { light: true, mirror: ((i * 5 + 1) % 4) < 2, seed: i * 17 + 7 }); }
      if (!up) {
        const sub = (s0, s1) => [P(c, g.r0, a0 + (a1 - a0) * s0), P(c, g.r0, a0 + (a1 - a0) * s1)];
        bag.add(TIMBER, plank(...sub(0, 1), f1, f1 + 0.9, 0.1));
        bag.add('lattice', plank(...sub(0.12, 0.88), f1 + 0.9, top - 0.45, 0.06));
        bag.add(TIMBER, plank(...sub(0, 1), top - 0.45, roofY(g.r0) - 0.16, 0.1));
      }
    }
    if (up) {
      // the upper front: boards either side of a door 1.24 wide, a header, a lattice transom, boards to the roof; couplets and a paper strip
      const q0 = P(c, g.r0, a0), q1 = P(c, g.r0, a1), L = Math.hypot(q1[0] - q0[0], q1[1] - q0[1]), ux = (q1[0] - q0[0]) / L, uz = (q1[1] - q0[1]) / L, at = (d) => [q0[0] + ux * d, q0[1] + uz * d];
      const d0 = L / 2 - 0.62, d1 = L / 2 + 0.62, yt = roofY(g.r0) - 0.16;
      bag.add(TIMBER, plank(q0, at(d0), f1, yt, 0.08)); bag.add(TIMBER, plank(at(d1), q1, f1, yt, 0.08));
      bag.add(TIMBER, plank(at(d0), at(d1), f1 + 2.1, f1 + 2.4, 0.08));
      bag.add('lattice', plank(at(d0), at(d1), f1 + 2.4, f1 + 3.1, 0.05));
      bag.add(TIMBER, plank(at(d0), at(d1), f1 + 3.1, yt, 0.08));
      col.segment(q0, at(d0), 0.08, f1, f1 + 3.3); col.segment(at(d1), q1, 0.08, f1, f1 + 3.3);
      for (const q of [at(d0), at(d1)]) bag.add('wood_dark', box(q[0] - 0.045, f1, q[1] - 0.045, q[0] + 0.045, f1 + 2.1, q[1] + 0.045));
      const ph = Math.PI / 2 - ac, mid = P(c, g.r0, ac);
      for (const sg of [-1, 1]) bag.add('lacquer_red', lbox(mid[0], mid[1], ph, sg > 0 ? 0.74 : -0.88, f1 + 0.9, -0.13, sg > 0 ? 0.88 : -0.74, f1 + 2.0, -0.06));
      bag.add('cloth_red', lbox(mid[0], mid[1], ph, -0.5, f1 + 2.18, -0.13, 0.5, f1 + 2.3, -0.06));
      // the partition on the boundary at a1, to the soffit
      const p0 = P(c, g.r0, a1), p1 = P(c, ri, a1), th = 0.1, L2 = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]), nx = -(p1[1] - p0[1]) / L2 * th / 2, nz = (p1[0] - p0[0]) / L2 * th / 2;
      const ring = (yp, yq, y0) => [[p0[0] - nx, yp, p0[1] - nz], [p0[0] + nx, yp, p0[1] + nz], [p1[0] + nx, yq, p1[1] + nz], [p1[0] - nx, yq, p1[1] - nz]].map((q) => (y0 === undefined ? q : [q[0], y0, q[2]]));
      bag.add(TIMBER, hexa(ring(roofY(g.r0) - 0.16, roofY(ri) - 0.16), ring(0, 0, f1)));
      col.segment(p0, p1, 0.1, f1, f1 + 3.3);
      // the room, furnished by its kind: the grain floor, sleeping rooms, a sitting room, a loom
      const rc = P(c, ri - 2.0, ac);
      fillRoom(ctx, { ox: rc[0], oz: rc[1], phi: ph, y: f1 }, g.kinds?.[i] ?? 'bedroom', { light: g.light?.[i] ?? true, mirror: ((i * 7 + 3) % 5) < 2, seed: i * 13 + 41 });
    } else if (!(pass(i) && pass(i + 1))) {
      // the partition on the boundary at a1 (the sides of the passages too)
      const q0 = P(c, g.r0, a1), q1 = P(c, ri, a1); bag.add(TIMBER, plank(q0, q1, 0, f1, 0.1)); col.segment(q0, q1, 0.1, 0, f1);
    }
    if (up && !(pass(i) && pass(i + 1))) { const q0 = P(c, g.r0, a1), q1 = P(c, ri, a1); bag.add(TIMBER, plank(q0, q1, 0, f1, 0.1)); col.segment(q0, q1, 0.1, 0, f1); }
  }
  // the posts under the balcony, up to the roof (none where a landing opens the rail)
  for (let i = 0; i < n; i++) {
    const aa = (i + 0.5) * da;
    if (up && inGap(aa, 0.012)) continue;
    const p = P(c, rb, aa); bag.add('timber', box(p[0] - 0.09, 0, p[1] - 0.09, p[0] + 0.09, roofY(rb) - 0.14, p[1] + 0.09)); col.circle(p[0], p[1], 0.11, 0, top);
  }
  for (const st of stairs) ringStair(ctx, g, st, f1);
  ringRoof(bag, c, n, o, true);
}

/** One open stair of the second ring: a straight flight along an axis from the court floor to the balcony's level, a landing onto the balcony. */
function ringStair({ bag, col }, g, st, f1) {
  const S = g.stair, { s, W } = st, N = 17, rise = f1 / N, run = (S.X1 - S.X0) / N, [zl, zh] = [S.Zn, S.Zs];
  const J = (m, x0, y0, z0, x1, y1, z1, sd) => { const a = W(x0, z0), b = W(x1, z1); bag.add(m, jbox(0, 0, 0, Math.min(a[0], b[0]), y0, Math.min(a[1], b[1]), Math.max(a[0], b[0]), y1, Math.max(a[1], b[1]), sd + (s > 0 ? 0 : 500))); };
  for (let q = 0; q < N; q++) {
    const xa = S.X0 + q * run, ty = (q + 1) * rise;
    J(TIMBER, xa, ty - 0.05, zl, xa + run + 0.03, ty, zh, q * 3);
    J('wood_dark', xa - 0.01, ty - rise, zl, xa + 0.02, ty - 0.05, zh, q * 3 + 1);
  }
  const r = st.rect(S.X0, zl, S.X1, zh);
  col.ramp(r, 0, f1, s > 0 ? 'e' : 'w');
  // stringers under the treads, the handrails on both sides with balusters
  for (const [z, hz] of [[zl + 0.06, zl + 0.04], [zh - 0.06, zh - 0.04]]) {
    const a = W(S.X0, z), b = W(S.X1, z), h0 = W(S.X0, hz), h1 = W(S.X1, hz);
    bag.add(TIMBER, rod([a[0], -0.02, a[1]], [b[0], f1 - 0.14, b[1]], 0.06, 5));
    bag.add(TIMBER, rod([h0[0], 0.95, h0[1]], [h1[0], f1 + 0.95, h1[1]], 0.03, 5));
    for (let q = 0; q <= 6; q++) { const f = q / 6, p = W(S.X0 + (S.X1 - S.X0) * f, hz); bag.add(TIMBER, rod([p[0], f1 * f, p[1]], [p[0], f1 * f + 0.95, p[1]], 0.02, 4)); }
  }
  // the landing, on two posts, with a rail on its open side
  J(TIMBER, S.X1, f1 - 0.26, zl, S.XL, f1, zh, 90);
  col.floor(st.land, f1);
  for (const [x, z, sd] of [[S.X1 + 0.12, zh - 0.1, 91], [S.XL - 0.12, zh - 0.1, 92]]) {
    J(TIMBER, x - 0.08, 0, z - 0.08, x + 0.08, f1 - 0.26, z + 0.08, sd);
    const p = W(x, z); col.circle(p[0], p[1], 0.11, 0, f1 - 0.3);
  }
  const l0 = W(S.X1, zh - 0.04), l1 = W(S.XL, zh - 0.04);
  bag.add(TIMBER, rod([l0[0], f1 + 0.95, l0[1]], [l1[0], f1 + 1.0, l1[1]], 0.035, 5));
  col.segment(l0, l1, 0.12, f1, f1 + 1.1);
  for (const x of [S.X1 + 0.35, S.XL - 0.35]) { const p = W(x, zh - 0.04); bag.add(TIMBER, rod([p[0], f1, p[1]], [p[0], f1 + 0.98, p[1]], 0.02, 4)); }
}
