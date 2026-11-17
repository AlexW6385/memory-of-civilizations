// The insides of the lesser halls of Gyeongbokgung (docs/settlements/joseon-seoul.md §15), drawn in the shell of a ming_hall of the same rect:
// the king's and the queen's halls (Gangnyeongjeon, Gyotaejeon) and the residences of Geoncheonggung — a wooden hall (daecheong) in the middle
// of the front, the bedchamber behind it, rooms of attendants on both sides, partitions of paper and wood on the posts' lines with a sliding
// door where the rooms lead on; Sajeongjeon — the throne hall (throne_hall draws its dais, screen and ceiling) with a room each side;
// the offices (ministries and halls of the court) with their desks along the walls; the stores of the service ranges with racks of goods.
// Local frame: a across the hall's front, b from the back wall toward the front (the door side).

import { box, lathe } from '../../core/geom.js';
import { atFloor, furn } from './house.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const { bandaji, twoTier, bedding, screen, desk, cushion, soban, brazier, lantern, bookcase } = furn;

/** The bays of a ming_hall of this rect, as that style counts them: [along the long side, across it]. */
export function baysOf(rect, bays) {
  const [x0, z0, x1, z1] = rect, Lx = x1 - x0, Lz = z1 - z0, along = Lx >= Lz;
  return bays ?? [Math.max(1, 2 * Math.round(((along ? Lx : Lz) / 3.6 - 1) / 2) + 1), Math.max(1, Math.round((along ? Lz : Lx) / 3.4))];
}
const jar = (bag, col, x, z, y, r = 0.26, h = 0.6) => { bag.add('pottery_dark', lathe([[r * 0.55, 0], [r * 0.95, h * 0.35], [r, h * 0.55], [r * 0.7, h * 0.9], [r * 0.55, h], [0.001, h]], 10, null, x, y, z)); col.circle(x, z, r, y, y + h); };

export function joseonInner(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, H = el.H ?? 4.6, front = el.front || 's', rand = rng(el.seed || 5);
  const [nb, nd] = baysOf(el.rect, el.bays), Lx = x1 - x0, Lz = z1 - z0, fy = y + 0.03;
  const crossLen = front === 's' ? Lx : Lz, depthLen = front === 's' ? Lz : Lx;
  const P = (a, b) => (front === 's' ? [x0 + a, z0 + b] : front === 'e' ? [x0 + b, z0 + a] : [x1 - b, z0 + a]);
  const R = (a0, b0, a1, b1) => { const p = P(a0, b0), q = P(a1, b1); return [Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])]; };
  const ctxAt = (oa, ob) => {
    const Pp = (a, b) => P(oa + a, ob + b), Rr = (a0, b0, a1, b1) => R(oa + a0, ob + b0, oa + a1, ob + b1);
    const B = (m, a0, b0, a1, b1, ya, yb, c = false) => { const r = Rr(a0, b0, a1, b1); bag.add(m, box(r[0], ya, r[1], r[2], yb, r[3])); if (c) col.rect(r, ya, yb); };
    return { bag, col, P: Pp, R: Rr, B, rand };
  };
  const kind = el.kind;
  atFloor(fy, () => {
    if (kind === 'office' || kind === 'store') {
      const ctx = ctxAt(0.32, 0.32), w = crossLen - 0.64, d = depthLen - 0.64;
      ctx.B('planks_grey', 0, 0, w, d, y + 0.012, fy);
      col.floor(R(0.32, 0.32, crossLen - 0.32, depthLen - 0.32), fy);
      if (kind === 'office') office(ctx, w, d, front === 's', bag, col);
      else store(ctx, w, d, bag, col);
      return;
    }
    // the grid of the rooms (front 's' only): the posts' lines
    const xs = [], zs = [];
    for (let i = 0; i <= nb; i++) xs.push(x0 + Lx * i / nb);
    for (let j = 0; j <= nd; j++) zs.push(z0 + Lz * j / nd);
    const c = Math.floor(nb / 2), rs = Math.ceil(nd / 2), reg = [];
    const mk = (id, c0, c1, r0, r1, type) => reg.push({ id, c0, c1, r0, r1, type });
    if (kind === 'throne') { mk('T', c - 1, c + 1, 0, nd - 1, 'throne'); }
    else { mk('bed', c - 1, c + 1, 0, rs - 1, 'bed'); mk('hall', c - 1, c + 1, rs, nd - 1, 'hall'); }
    mk('Wr', 0, c - 2, 0, rs - 1, 'room'); mk('Wf', 0, c - 2, rs, nd - 1, 'room'); mk('Er', c + 2, nb - 1, 0, rs - 1, 'room'); mk('Ef', c + 2, nb - 1, rs, nd - 1, 'room');
    const owner = (i, j) => reg.find((r) => i >= r.c0 && i <= r.c1 && j >= r.r0 && j <= r.r1);
    const doors = kind === 'throne' ? [['Wr', 'T'], ['Wf', 'T'], ['Er', 'T'], ['Ef', 'T'], ['Wr', 'Wf'], ['Er', 'Ef']] : [['bed', 'hall'], ['Wr', 'bed'], ['Er', 'bed'], ['Wf', 'hall'], ['Ef', 'hall'], ['Wr', 'Wf'], ['Er', 'Ef']];
    const PH = Math.min(2.9, H - 0.5), edges = [];
    for (let i = 1; i < nb; i++) for (let j = 0; j < nd; j++) { const a = owner(i - 1, j), b = owner(i, j); if (a !== b) edges.push({ v: true, a, b, at: xs[i], s0: zs[j], s1: zs[j + 1], key: j }); }
    for (let j = 1; j < nd; j++) for (let i = 0; i < nb; i++) { const a = owner(i, j - 1), b = owner(i, j); if (a !== b) edges.push({ v: false, a, b, at: zs[j], s0: xs[i], s1: xs[i + 1], key: i }); }
    // one doorway per pair that leads on: the unit of the shared border nearest its middle (the later of two), 1.3 m wide at the unit's middle
    const doorOf = new Map();
    for (const [p, q] of doors) {
      const list = edges.filter((e) => (e.a.id === p && e.b.id === q) || (e.a.id === q && e.b.id === p));
      if (list.length) doorOf.set(list[Math.floor(list.length / 2)], true);
    }
    for (const e of edges) {
      const dw = doorOf.get(e) ? 1.3 : 0, m = (e.s0 + e.s1) / 2, seg = (u0, u1, ya, yb, mat, t) => bag.add(mat, e.v ? box(e.at - t, ya, u0, e.at + t, yb, u1) : box(u0, ya, e.at - t, u1, yb, e.at + t));
      const panel = (u0, u1) => {
        seg(u0, u1, fy, fy + 0.45, 'wood_dark', 0.05); seg(u0, u1, fy + 0.45, PH - 0.3, 'shoji', 0.03); seg(u0, u1, PH - 0.3, y + PH, 'timber', 0.06);
        const n = Math.max(1, Math.round((u1 - u0) / 1.2)); for (let k = 0; k <= n; k++) { const u = u0 + (u1 - u0) * k / n; seg(u - 0.03, u + 0.03, fy + 0.45, PH - 0.3, 'timber', 0.055); }
        const A = e.v ? [e.at, u0] : [u0, e.at], Bp = e.v ? [e.at, u1] : [u1, e.at];
        col.segment(A, Bp, 0.1, fy, y + PH);
      };
      if (!dw) panel(e.s0, e.s1);
      else {
        panel(e.s0, m - dw / 2); panel(m + dw / 2, e.s1);
        seg(m - dw / 2, m + dw / 2, y + 2.05, y + PH, 'plaster_white', 0.05); seg(m - dw / 2, m + dw / 2, y + 2.0, y + 2.08, 'timber', 0.07);
        for (const u of [m - dw / 2, m + dw / 2]) seg(u - 0.04, u + 0.04, fy, y + 2.08, 'timber', 0.07);
      }
    }
    // floors, ceilings and what stands in each region
    for (const r of reg) {
      const ins = 0.3, ra = [xs[r.c0] + (r.c0 === 0 ? ins : 0.08), zs[r.r0] + (r.r0 === 0 ? ins : 0.08), xs[r.c1 + 1] - (r.c1 === nb - 1 ? ins : 0.08), zs[r.r1 + 1] - (r.r1 === nd - 1 ? ins : 0.08)];
      const w = ra[2] - ra[0], d = ra[3] - ra[1], ctx = ctxAt(ra[0] - x0, ra[1] - z0), c0 = w / 2;
      if (r.type !== 'throne') { bag.add(r.type === 'hall' ? 'wood_dark' : 'wood_ochre', box(ra[0], y + 0.012, ra[1], ra[2], fy, ra[3])); col.floor(ra, fy); }
      if (r.type === 'bed' || r.type === 'room') bag.add('paint_white', box(ra[0], y + PH, ra[1], ra[2], y + PH + 0.03, ra[3]));
      if (r.type === 'bed') {
        const queen = el.who === 'queen';
        screen(ctx, c0 - 1.9, c0 + 1.9, 0.3, 1.75);                                         // the screen behind the bed, the bedding before it
        bedding(ctx, c0 - 0.75, 0.75, fy, 1.1, 0.55); bedding(ctx, c0 + 0.75, 0.75, fy, 1.1, 0.55);
        twoTier(ctx, 1.2, 0.3); bandaji(ctx, 2.6, 0.3, 0.9, 0.42, 0.78);
        if (queen) { twoTier(ctx, w - 1.2, 0.3); bookcase(ctx, w - 2.6, 0.3, 1.0, 0.34, 2); dressing(ctx, w); } else { bookcase(ctx, w - 1.2, 0.3, 1.0, 0.34, 3); desk(ctx, w - 2.6, 0.5); }
        cushion(ctx, c0 - 2.0, 3.0, 0.8); soban(ctx, c0 - 1.0, 3.2); brazier(ctx, c0 + 2.0, 3.3);
        lantern(ctx, 0.8, d - 1.6); lantern(ctx, w - 0.8, d - 1.6);
      } else if (r.type === 'hall') {
        screen(ctx, 1.2, 4.2, 0.3, 1.6); screen(ctx, w - 4.2, w - 1.2, 0.3, 1.6);
        jar(bag, col, ra[0] + 0.8, ra[1] + d - 1.0, fy, 0.3, 0.7);
        const [tx, tz] = ctx.P(c0 - 0.9, d * 0.55); ctx.B('lacquer_red', c0 - 0.9 - 0.0, d * 0.55 - 0.45, c0 + 0.9, d * 0.55 + 0.45, fy + 0.3, fy + 0.34, true); for (const sx of [-1, 1]) for (const sz of [-1, 1]) ctx.B('lacquer_red', c0 + sx * 0.8 - 0.03, d * 0.55 + sz * 0.38 - 0.03, c0 + sx * 0.8 + 0.03, d * 0.55 + sz * 0.38 + 0.03, fy, fy + 0.3);
        void tx; void tz;
        lantern(ctx, 1.0, d - 1.4); lantern(ctx, w - 1.0, d - 1.4);
      } else if (r.type === 'room') {
        // attendants' rooms: mats on the floor, bedding in rows against the back wall, chests, a desk or two, the brazier and the lantern
        ctx.B('reed_mat', 1.0, 1.3, w - 1.0, d * 0.62, fy + 0.004, fy + 0.016);
        for (let k = 0; k < 3; k++) bedding(ctx, 1.4 + k * 1.3, 0.35, fy, 0.85, 0.4);
        bandaji(ctx, w - 1.6, 0.3, 0.9, 0.42, 0.78); twoTier(ctx, w - 3.0, 0.3);
        desk(ctx, 1.4, 2.4, 0.9, 0.46); cushion(ctx, 1.85, 3.3, 0.7); brazier(ctx, w * 0.55, d * 0.55); lantern(ctx, w - 0.7, d * 0.6);
      }
    }
    void c;
  });
}
// the queen's side of the bedchamber: a sewing basket and a low dressing table
function dressing(ctx, w) {
  const { B } = ctx, fy = furn.floor(), a = w * 0.5 + 2.2;
  B('wicker', a, 1.9, a + 0.4, 2.3, fy, fy + 0.15);
  B('lacquer_black', a + 0.8, 1.9, a + 1.5, 2.3, fy + 0.3, fy + 0.34); for (const dx of [0.85, 1.45]) for (const dz of [1.95, 2.25]) B('lacquer_black', a + dx - 0.025, dz - 0.025, a + dx + 0.025, dz + 0.025, fy, fy + 0.3);
  B('gilt_bronze', a + 1.0, 2.0, a + 1.3, 2.04, fy + 0.34, fy + 0.62);
}

function office(ctx, w, d, wide, bag, col) {
  const { B, rand } = ctx, fy = furn.floor();
  // desks along both side walls facing the aisle (or, if the hall is wide, along the back wall), each with its cushion, the four friends and a pile of papers
  const n = Math.max(2, Math.floor((wide ? w : d) / 3.2));
  for (let k = 0; k < n; k++) {
    const u = 1.6 + k * ((wide ? w : d) - 3.2) / Math.max(1, n - 1);
    if (wide) { desk(ctx, u, 0.6, 0.9, 0.46); cushion(ctx, u, 1.9, 0.7); } else {
      for (const side of [0, 1]) { const a = side ? w - 1.3 : 1.3; desk2(ctx, a, u, side); }
    }
  }
  screen(ctx, wide ? w / 2 - 1.6 : 1.0, wide ? w / 2 + 1.6 : 3.8, wide ? 0.3 : d - 0.5, 1.6);
  bookcase(ctx, wide ? 1.2 : 0.7, wide ? 0.3 : 0.3, 1.0, 0.34, 3); bookcase(ctx, wide ? w - 1.2 : w - 0.7, 0.3, 1.0, 0.34, 3);
  brazier(ctx, wide ? w * 0.3 : w / 2 - 1.2, wide ? 3.0 : d * 0.4); lantern(ctx, wide ? w * 0.7 : w / 2 + 1.2, wide ? 3.0 : d * 0.7);
  void rand; void bag; void col; void B; void fy;
}
// a desk set sideways against a side wall of the aisle (a = across, u = along the depth): the desk's front toward the aisle
function desk2(ctx, a, u, side) {
  const { B } = ctx, fy = furn.floor(), s = side ? -1 : 1;
  B('timber', a - 0.23 * s - 0.0, u - 0.45, a + 0.23 * s, u + 0.45, fy + 0.28, fy + 0.32);
  for (const dz of [-0.4, 0.4]) for (const dx of [-0.2, 0.2]) B('timber', a + dx * s - 0.03, u + dz - 0.03, a + dx * s + 0.03, u + dz + 0.03, fy, fy + 0.28);
  B('paint_white', a - 0.15 * s, u - 0.3, a + 0.05 * s, u + 0.1, fy + 0.32, fy + 0.325); B('lacquer_black', a + 0.1 * s, u + 0.15, a + 0.2 * s, u + 0.35, fy + 0.32, fy + 0.36);
  B('cloth_red', a + 0.7 * s - 0.35, u - 0.35, a + 0.7 * s + 0.35, u + 0.35, fy + 0.0, fy + 0.07);
}
function store(ctx, w, d, bag, col) {
  const { B, rand } = ctx, fy = furn.floor(), n = Math.max(3, Math.floor(w / 3.4));
  for (let k = 0; k < n; k++) {
    const a = 0.4 + k * (w - 1.2) / n + 0.3, rw = 2.4, goods = Math.floor(rand() * 3);
    B('timber', a, 0.1, a + 0.06, 0.6, fy, fy + 1.9); B('timber', a + rw - 0.06, 0.1, a + rw, 0.6, fy, fy + 1.9);
    col.rect(ctx.R(a, 0.1, a + rw, 0.6), fy, fy + 1.9);
    for (let s = 0; s < 3; s++) {
      const sy = fy + 0.3 + s * 0.65; B('timber', a, 0.1, a + rw, 0.6, sy, sy + 0.04);
      if (goods === 0) for (let q = 0; q < 3; q++) B('sacking', a + 0.1 + q * 0.75, 0.15, a + 0.75 + q * 0.75, 0.55, sy + 0.04, sy + 0.4);
      else if (goods === 1) for (let q = 0; q < 4; q++) jar(bag, col, ctx.P(a + 0.35 + q * 0.58, 0.35)[0], ctx.P(a + 0.35 + q * 0.58, 0.35)[1], sy + 0.04, 0.17, 0.4);
      else for (let q = 0; q < 5; q++) B(['cloth_white', 'cloth_indigo', 'cloth_red', 'cloth_ochre', 'cloth_white'][q], a + 0.1 + q * 0.45, 0.2, a + 0.5 + q * 0.45, 0.5, sy + 0.04, sy + 0.3);
    }
  }
  for (let k = 0; k < 3; k++) jar(bag, col, ctx.P(w * (0.3 + 0.25 * k), d * 0.5)[0], ctx.P(w * (0.3 + 0.25 * k), d * 0.5)[1], fy, 0.3, 0.7);
  lantern(ctx, w * 0.5, d - 1.0);
}
