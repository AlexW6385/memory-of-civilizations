// Southern Song Lin'an — the enterable dwellings of the lanes (docs/settlements/song-hangzhou.md §28–§29).
//
// Beyond the Imperial Way most houses of the town are shut shells (`hz_house`). The lanes' lots chosen in life.js
// (`dwellingLots()`) are built here instead as houses that can be walked into, each by its own rule:
//
//   dwellingSpec(lot)     the lot's plan, decided from its width, depth, trade and seed: one of five fronts
//                         (door, boards, open, lattice, court), the position of the doorway, the depth of the
//                         building (deep lots keep a walled back yard), the partition between the front room and
//                         the rear room, the use of each room;
//   hz_dwelling           (style song) the shell: plinth and floor, party walls, partition, front, roof, yard;
//   hz_dwelling_in        (style life) the furniture and the people of both rooms.
//
// Local frame of the shell: a across the lot, b = D/2 − w where w runs from the street edge (0) to the back (D); the
// shell is built centred on the lot and turned to its front like hz_shell (src/styles/song/hangzhou.js).
import { STYLES } from '../../core/build.js';
import { box, lathe, rod, fromTriangles } from '../../core/geom.js';
import { Matrix4 } from '../../core/three.js';
import { rectRoof } from '../../styles/ming/index.js';
import { Parts, ball, limb } from '../../styles/qing/carving.js';
import { table, chair, stool, teabowl, vase, scroll, lantern, couch, qinTable, altar, shelf } from './interiors.js';
import '../../styles/song/index.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const H = 3.5, TH = 0.25;
const SHUT = ['timber', 'wood_dark', 'timber'];
const ly = (prof, seg = 10, x = 0, y = 0, z = 0) => lathe(prof, seg, null, x, y, z);

/** The plan of a dwelling from its lot { rect, front, seed, shop }: pure and deterministic, shared by the shell and the furniture. */
export function dwellingSpec(l) {
  const [x0, z0, x1, z1] = l.rect, f = l.front || 's', along = f === 'n' || f === 's';
  const L = along ? x1 - x0 : z1 - z0, D = along ? z1 - z0 : x1 - x0, r = rng((l.seed || 1) * 7 + 13), sgn = () => (r() < 0.5 ? -1 : 1);
  let ft;
  if (l.shop) ft = r() < 0.5 ? 'boards' : 'open';
  else if (D >= 13.5 && L >= 6.5) { const q = r(); ft = q < 0.45 ? 'court' : q < 0.75 ? 'lattice' : 'door'; }
  else if (L >= 6.5) ft = r() < 0.4 ? 'lattice' : 'door';
  else ft = 'door';
  const GW = { door: 1.4, boards: 2.1, open: 2.5, lattice: 1.7, court: 1.6 }, gw = GW[ft];
  const off = (w) => sgn() * (0.6 + r() * Math.max(0, (L - w - 2.6) / 2 - 0.6));
  const da = off(gw);
  const hallFt = ft === 'court' ? (r() < 0.5 ? 'door' : 'lattice') : ft, hallGw = ft === 'court' ? (hallFt === 'door' ? 1.4 : 1.7) : gw;
  const dh = ft === 'court' ? off(hallGw) : da;
  const Cd = ft === 'court' ? 3.4 : 0, avail = D - Cd - 0.5;
  let Bd = avail;
  if (avail >= 12) Bd = Math.min(avail - 2.8, 9.5 + r() * 2);
  const Yd = avail - Bd, wB = Cd + 0.5 + Bd, Wd = L - 0.5;
  const Rp = Math.max(2.8, Math.min(4.2, Bd * 0.42)), Fd = Bd - Rp - 0.16;
  const sA = sgn(), sB = sgn();
  const pa = sA * (Wd / 2 - 0.9 - r() * 0.35), pb = sB * (Wd / 2 - 0.75 - r() * 0.3);
  const frontKind = l.shop ? ['printer', 'bamboo', 'lantern', 'cooper'][Math.floor(r() * 4)] : (r() < 0.4 ? 'weaver' : 'hall');
  const rearKind = r() < 0.5 ? 'kitchen' : 'bedchamber';
  const wash = (() => { const q = r(); return q < 0.62 ? 'plaster_white' : q < 0.87 ? 'plaster_streak' : 'plaster_damp'; })();
  const roofMat = r() < 0.18 ? 'tile_grey' : 'tile_dark';
  return { f, L, D, ft, gw, da, hallFt, hallGw, dh, Cd, Bd, Yd, wB, Wd, Rp, Fd, pa, pb, frontKind, rearKind, wash, roofMat };
}

const YAW = { s: 0, n: Math.PI, e: Math.PI / 2, w: -Math.PI / 2 };

// ── the shell ──────────────────────────────────────────────────────────────────────────────────
function shell(el, ctx) {
  const S = dwellingSpec(el), { L, D, ft, gw, da, Cd, Bd, Yd, wB, Rp, pa, pb, wash } = S, f = S.f, yaw = YAW[f];
  const [x0, z0, x1, z1] = el.rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, M = new Matrix4().makeRotationY(yaw).setPosition(cx, 0, cz);
  const rect = ([a, b, c, d]) => { const p = [[a, b], [c, d]].map(([u, v]) => [cx + u * Math.cos(yaw) + v * Math.sin(yaw), cz - u * Math.sin(yaw) + v * Math.cos(yaw)]); return [Math.min(p[0][0], p[1][0]), Math.min(p[0][1], p[1][1]), Math.max(p[0][0], p[1][0]), Math.max(p[0][1], p[1][1])]; };
  const bag = { add: (m, g) => ctx.bag.add(m, g.applyMatrix4(M)) };
  const E = 0.2, infl = (r) => [r[0] - E, r[1] - E, r[2] + E, r[3] + E];   // the colliders stand 0.2 m proud of the walls they follow, so that no free spot lies within a cell of the drawn wall
  const col = { floor: (r, y) => ctx.col.floor(rect(r), y), rect: (r, a, b) => ctx.col.rect(rect(r), a, b), wall: (r, a, b, nl, nr) => { const q = infl(r); if (nl) q[0] = r[0]; if (nr) q[2] = r[2]; ctx.col.rect(rect(q), a, b); } };
  const y = el.y ?? 0, Y = y + 0.45, A0 = -L / 2, A1 = L / 2, bw = (w) => D / 2 - w, rand = rng((el.seed || 1) + 5);
  const bx = (a0, a1, w0, w1, h0, h1, mat) => bag.add(mat, box(a0, Y + h0, bw(w1), a1, Y + h1, bw(w0)));
  const wall = (a0, a1, w0, w1, h, mat = wash, nl = false, nr = false) => { if (a1 - a0 < 0.02) return; bx(a0, a1, w0, w1, 0, h, mat); bag.add('plaster_grey', box(a0 - 0.01, Y, bw(w1) - 0.01, a1 + 0.01, Y + 0.35, bw(w0) + 0.01)); col.wall([a0, bw(w1), a1, bw(w0)], Y, Y + h, nl, nr); };
  const post = (a, w, h) => { bx(a - 0.1, a + 0.1, w - 0.1, w + 0.1, 0, h, 'lacquer_chestnut'); col.wall([a - 0.1, bw(w + 0.1), a + 0.1, bw(w - 0.1)], Y, Y + h); };
  // floor over the building (and the court), plinth under it
  bag.add('granite_block', box(A0, y - 0.4, bw(wB), A1, Y - 0.04, bw(0)));
  bag.add('brick_paving', box(A0 + 0.02, Y - 0.04, bw(wB) + 0.02, A1 - 0.02, Y, bw(0) - 0.02));
  col.floor([A0, bw(wB), A1, bw(0)], Y);
  // the step before the way in from the street (and the court's gate)
  const step = (c, w) => { bag.add('granite_block', box(c - w / 2 - 0.1, y + 0.03, bw(0), c + w / 2 + 0.1, y + 0.12, bw(-0.45))); col.floor([c - w / 2 - 0.1, bw(0), c + w / 2 + 0.1, bw(-0.45)], y + 0.12); };
  // party walls, the back wall
  wall(A0, A0 + TH, 0, wB, H); wall(A1 - TH, A1, 0, wB, H);
  if (Yd > 0) {
    wall(A0 + TH, pb - 0.65, wB - TH, wB, H, wash, false, true); wall(pb + 0.65, A1 - TH, wB - TH, wB, H, wash, true); bx(pb - 0.65, pb + 0.65, wB - TH, wB, 2.2, H, wash);
    for (const s of [-1, 1]) bx(pb + s * 0.65 - (s > 0 ? 0 : 0.08), pb + s * 0.65 + (s > 0 ? 0.08 : 0), wB - TH - 0.03, wB + 0.03, 0, 2.2, 'lacquer_chestnut');
    // two treads down to the yard
    bag.add('granite_block', box(pb - 0.7, y + 0.03, bw(wB + 0.55), pb + 0.7, y + 0.25, bw(wB))); col.floor([pb - 0.7, bw(wB + 0.55), pb + 0.7, bw(wB)], y + 0.25);
  } else wall(A0 + TH, A1 - TH, wB - TH, wB, H);
  // the partition between the rooms (a doorway at pa, the head and posts of timber)
  { const wb = wB - TH, w1 = wb - Rp, w0 = w1 - 0.16;
    wall(A0 + TH, pa - 0.65, w0, w1, H, wash, false, true); wall(pa + 0.65, A1 - TH, w0, w1, H, wash, true); bx(pa - 0.65, pa + 0.65, w0, w1, 2.3, H, wash);
    for (const s of [-1, 1]) bx(pa + s * 0.65 - (s > 0 ? 0 : 0.07), pa + s * 0.65 + (s > 0 ? 0.07 : 0), w0 - 0.03, w1 + 0.03, 0, 2.3, 'lacquer_chestnut');
    bx(pa - 0.72, pa + 0.72, w0 - 0.03, w1 + 0.03, 2.3, 2.42, 'lacquer_chestnut');
    // tie beams over the front room, the partition and the rear room
    for (const w of [w0 - (S.Fd) / 2 - 0.1, w1 + Rp / 2]) bx(A0 + TH, A1 - TH, w - 0.08, w + 0.08, H - 0.3, H - 0.12, 'timber'); }
  // the front: the gate wall of a court, or the building's own front
  const facade = (type, wf, gc, gwid, Hh) => {
    const g0 = gc - gwid / 2, g1 = gc + gwid / 2, a0 = A0 + TH, a1 = A1 - TH;
    if (type === 'door') {
      wall(a0, g0, wf, wf + TH, Hh, wash, false, true); wall(g1, a1, wf, wf + TH, Hh, wash, true); bx(g0, g1, wf, wf + TH, 2.45, Hh, wash);
      bx(g0 - 0.1, g0, wf - 0.04, wf + TH + 0.04, 0, 2.45, 'lacquer_chestnut'); bx(g1, g1 + 0.1, wf - 0.04, wf + TH + 0.04, 0, 2.45, 'lacquer_chestnut'); bx(g0 - 0.12, g1 + 0.12, wf - 0.05, wf + TH + 0.05, 2.4, 2.55, 'lacquer_chestnut');
      bx(g0 - 0.5, g1 + 0.5, wf - 0.55, wf + 0.05, 2.58, 2.68, 'tile_dark'); bx(g0 - 0.5, g1 + 0.5, wf - 0.55, wf + 0.05, 2.5, 2.58, 'timber');
      if (Hh >= H) for (const [s0, s1] of [[a0, g0], [g1, a1]]) { const wc = (s0 + s1) / 2; if (s1 - s0 < 1.7) continue;
        bx(wc - 0.5, wc + 0.5, wf - 0.04, wf + 0.02, 1.0, 2.3, 'lacquer_chestnut'); bx(wc - 0.44, wc + 0.44, wf - 0.05, wf - 0.0, 1.06, 2.24, 'lattice'); bx(wc - 0.55, wc + 0.55, wf - 0.12, wf + 0.02, 0.92, 1.0, 'granite_grey'); }
      step(gc, gwid); return;
    }
    if (type === 'boards') {
      bx(a0, a1, wf - 0.1, wf + TH + 0.05, H - 0.45, H, 'wood_dark');
      for (const [s0, s1, nl, nr] of [[a0, g0, false, true], [g1, a1, true, false]]) {
        if (s1 - s0 < 0.1) continue;
        bx(s0, s1, wf, wf + TH * 0.6, 0.18, H - 0.45, 'wood_dark'); bx(s0, s1, wf - 0.06, wf + TH, 0, 0.18, 'granite_grey'); col.wall([s0, bw(wf + TH * 0.6), s1, bw(wf - 0.06)], Y, Y + H - 0.45, nl, nr);
        for (let a = s0 + 0.02, i = 0; a + 0.28 < s1; a += 0.32, i++) { if ((i * 7 + Math.floor(rand() * 5)) % 9 === 4) continue; bx(a, a + 0.28, wf - 0.03, wf, 0.18, H - 0.45, SHUT[i % 3]); }
      }
      bx(g0 - 0.1, g0, wf - 0.06, wf + TH, 0.18, H - 0.45, 'timber'); bx(g1, g1 + 0.1, wf - 0.06, wf + TH, 0.18, H - 0.45, 'timber');
      step(gc, gwid); return;
    }
    if (type === 'open') {
      for (const [s0, s1, nl, nr] of [[a0, g0 - 0.1, false, true], [g1 + 0.1, a1, true, false]]) {
        if (s1 - s0 < 0.1) continue;
        bx(s0, s1, wf, wf + 0.2, 0, 0.9, 'timber'); bx(s0, s1, wf - 0.04, wf + 0.2, 0.9, 0.95, 'wood_dark'); bx(s0, s1, wf, wf + 0.12, 0.95, H - 0.8, 'lattice'); col.wall([s0, bw(wf + 0.2), s1, bw(wf)], Y, Y + H - 0.8, nl, nr);
      }
      post(g0 - 0.1, wf + 0.1, H - 0.45); post(g1 + 0.1, wf + 0.1, H - 0.45);
      bx(a0, a1, wf - 0.12, wf + 0.12, H - 0.45, H, 'lacquer_chestnut'); bx(a0, a1, wf - 0.02, wf + 0.02, H - 0.8, H - 0.45, 'lattice_red');
      step(gc, gwid); return;
    }
    // lattice: full-height lattice leaves (geshan) either side of the doorway under a pent eave, plaster beyond
    for (const [s0, s1, dir] of [[a0, g0, -1], [g1, a1, 1]]) {
      const lw = Math.min(1.6, Math.max(0, s1 - s0 - 0.4)), l0 = dir < 0 ? g0 - lw : g1, l1 = dir < 0 ? g0 : g1 + lw;
      if (dir < 0) wall(s0, l0, wf, wf + TH, Hh); else wall(l1, s1, wf, wf + TH, Hh);
      if (lw > 0.1) { bx(l0, l1, wf, wf + 0.1, 0, 0.2, 'lacquer_chestnut'); bx(l0, l1, wf, wf + 0.1, 0.2, 2.5, 'lattice_red'); bx(l0, l1, wf - 0.02, wf + 0.12, 2.5, 2.6, 'lacquer_chestnut'); for (let k = 0; k <= Math.round(lw / 0.4); k++) { const a = l0 + (l1 - l0) * k / Math.round(lw / 0.4); bx(a - 0.03, a + 0.03, wf - 0.03, wf + 0.13, 0, 2.6, 'lacquer_chestnut'); }
        col.wall([l0, bw(wf + 0.12), l1, bw(wf - 0.02)], Y, Y + 2.6, dir > 0, dir < 0); }
    }
    bx(g0, g1, wf, wf + TH, 2.6, Hh, wash); bx(g0 - 0.12, g0, wf - 0.04, wf + TH + 0.04, 0, 2.6, 'lacquer_chestnut'); bx(g1, g1 + 0.12, wf - 0.04, wf + TH + 0.04, 0, 2.6, 'lacquer_chestnut');
    bx(a0, a1, wf - 0.7, wf + 0.1, 2.9, 3.0, 'tile_dark'); bx(a0, a1, wf - 0.7, wf - 0.5, 2.8, 2.9, 'timber'); bx(a0, a1, wf - 0.05, wf + 0.1, 2.6, 2.9, 'timber');
    step(gc, gwid);
  };
  const hall = ft === 'court' ? S.hallFt : ft, wf = Cd, gcHall = ft === 'court' ? S.dh : da, gwHall = ft === 'court' ? S.hallGw : gw;
  facade(hall, wf, gcHall, gwHall, H);
  if (ft === 'court') {
    // the gate wall and its little roof; the court between, paved, walled on both sides, open to the sky
    const Hg = 3.1;
    facade('door', 0, da, 1.4, Hg);
    bx(A0 + TH, A1 - TH, 0, TH, Hg, Hg + 0.08, 'tile_dark');
    rectRoof({ c: [da, bw(0.1)], A: 1.4 / 2 + 0.85, B: 0.95, alongZ: false, y: Y + Hg + 0.02, rise: 0.55, kind: 'gable', sweep: 0.1, mat: 'tile_dark', soffit: 'timber', p: 1.4, curl: false }, bag);
    for (const s of [-1, 1]) bx(A0 + (s < 0 ? 0 : L - TH) - 0.03, A0 + (s < 0 ? TH : L) + 0.03, 0, Cd, H, H + 0.08, 'tile_dark');
    bag.add('bluestone', box(A0 + TH, Y, bw(Cd), A1 - TH, Y + 0.02, bw(TH)));
    // a jar of water and a pot of plum in the court
    bag.add('pottery_dark', ly([[0.001, 0], [0.2, 0], [0.34, 0.12], [0.4, 0.4], [0.3, 0.7], [0.2, 0.8], [0.001, 0.8]], 8, (da > 0 ? A0 + 0.7 : A1 - 0.7), Y + 0.02, bw(Cd - 0.6))); col.rect([(da > 0 ? A0 + 0.3 : A1 - 1.1), bw(Cd - 0.2), (da > 0 ? A0 + 1.1 : A1 - 0.3), bw(Cd - 1.0)], Y, Y + 0.8);
  }
  // the roof of the building: a gable roof along the front, eaves 0.55 m out (not at the gate or the court)
  {
    const wf0 = Cd, B = (wB - wf0) / 2 + 0.55, cb = D / 2 - (wf0 + wB) / 2, rise = Math.min(0.3 * (wB - wf0), 3.0), A = L / 2 + 0.25, yR = Y + H - 0.05;
    rectRoof({ c: [0, cb], A, B, alongZ: false, y: yR, rise, kind: 'gable', sweep: 0.15, mat: S.roofMat, soffit: 'timber', p: 1.4, curl: false }, bag);
    const prof = (b) => { const t = Math.max(0, Math.min(1, (B - Math.abs(b - cb)) / B)); return yR + rise * Math.pow(t, 1.4); };
    const n = 14;
    for (const [a0, a1] of [[A0, A0 + TH], [A1 - TH, A1]]) for (let i = 0; i < n; i++) {
      const w0 = wf0 + (wB - wf0) * i / n, w1 = wf0 + (wB - wf0) * (i + 1) / n, top = Math.min(prof(bw(w0)), prof(bw(w1))) - 0.14;
      if (top > Y + H + 0.02) bag.add(wash, box(a0, Y + H, bw(w1), a1, top, bw(w0)));
    }
  }
  // the back yard: walls, paving, a water jar, firewood, a vegetable bed, a drying frame
  if (Yd > 0) {
    const wy = 2.8, yw0 = wB, yw1 = D;
    for (const [a0, a1, w0, w1] of [[A0, A0 + TH, yw0, yw1], [A1 - TH, A1, yw0, yw1], [A0 + TH, A1 - TH, yw1 - TH, yw1]]) bag.add('brick_grey', box(a0 - 0.01, y, bw(w1) - 0.01, a1 + 0.01, Y + 0.02, bw(w0) + 0.01));
    wall(A0, A0 + TH, yw0, yw1, wy); wall(A1 - TH, A1, yw0, yw1, wy); wall(A0 + TH, A1 - TH, yw1 - TH, yw1, wy);
    for (const [a0, a1, w0, w1] of [[A0 - 0.03, A0 + TH + 0.03, yw0, yw1], [A1 - TH - 0.03, A1 + 0.03, yw0, yw1], [A0 + TH, A1 - TH, yw1 - TH - 0.03, yw1]]) bag.add('tile_dark', box(a0, y + wy + 0.45 - 0.0, bw(w1), a1, y + wy + 0.53, bw(w0)));
    bag.add('brick_grey', box(A0 + TH, y, bw(yw1 - TH), A1 - TH, y + 0.03, bw(yw0)));
    const jx = pb > 0 ? A0 + TH + 0.6 : A1 - TH - 0.6, jw = yw0 + 0.7;
    bag.add('pottery_dark', ly([[0.001, 0], [0.2, 0], [0.34, 0.12], [0.4, 0.4], [0.3, 0.7], [0.2, 0.8], [0.001, 0.8]], 8, jx, y + 0.03, bw(jw))); col.rect([jx - 0.4, bw(jw + 0.4), jx + 0.4, bw(jw - 0.4)], y, y + 0.85);
    // firewood: rows of split logs against the back wall
    const fx0 = pb > 0 ? A1 - TH - 1.6 : A0 + TH + 0.1, fw = yw1 - TH - 0.45;
    for (let r = 0; r < 4; r++) for (let k = 0; k < 6 - (r > 1 ? 1 : 0); k++) bag.add('bark_dark', rod([fx0 + 0.1 + k * 0.25 + (r % 2) * 0.1, y + 0.08 + r * 0.15, bw(fw)], [fx0 + 0.1 + k * 0.25 + (r % 2) * 0.1, y + 0.08 + r * 0.15, bw(fw - 0.4)], 0.065, 5));
    col.rect([fx0, bw(fw + 0.1), fx0 + 1.6, bw(fw - 0.5)], y, y + 0.7);
    // the vegetable bed: a timber kerb, earth, greens
    const vz0 = yw0 + 1.7, vz1 = Math.min(yw1 - TH - 1.0, vz0 + 1.8);
    if (vz1 - vz0 > 0.8) { const va0 = pb > 0 ? A1 - TH - 2.4 : A0 + TH + 0.2, va1 = va0 + 2.2; bag.add('timber', box(va0, y, bw(vz1), va1, y + 0.16, bw(vz0))); bag.add('ground', box(va0 + 0.06, y + 0.05, bw(vz1) + 0.06, va1 - 0.06, y + 0.14, bw(vz0) - 0.06));
      for (let i = 0; i < 7; i++) for (let j = 0; j < 3; j++) bag.add(j % 2 ? 'glaze_green' : 'lotus_leaf', ball(0.1, 0.07, 0.1, 6, 3).translate(va0 + 0.25 + i * 0.28, y + 0.17, bw(vz0 + 0.3 + j * ((vz1 - vz0 - 0.5) / 2)))); }
  }
}
STYLES.song.elements.hz_dwelling = shell;

// ── the furniture ──────────────────────────────────────────────────────────────────────────────
const CL = ['cloth_indigo', 'cloth_white', 'cloth_grey', 'cloth_brown', 'cloth_white', 'cloth_black', 'cloth_green'];
const WD = 'lacquer_chestnut';

/** A brick range (zao) with two iron woks, one under a timber lid, the fire mouths on the −z face: 1.5 × 0.76 × 0.86. */
function range(P) {
  P.add('brick_grey', box(-0.75, 0, -0.38, 0.75, 0.8, 0.38)); P.add('plaster_grey', box(-0.78, 0.8, -0.41, 0.78, 0.86, 0.41));
  for (const s of [-1, 1]) {
    P.add('slate', box(s * 0.38 - 0.14, 0.1, -0.395, s * 0.38 + 0.14, 0.4, -0.375)); P.add('flame', box(s * 0.38 - 0.08, 0.12, -0.39, s * 0.38 + 0.08, 0.2, -0.375));
    P.add('iron', ly([[0.001, 0.0], [0.2, 0.03], [0.3, 0.12], [0.32, 0.17], [0.3, 0.17], [0.19, 0.05], [0.001, 0.02]], 10, s * 0.38, 0.86, 0));
  }
  P.add('timber', ly([[0.001, 0.12], [0.31, 0.0], [0.31, 0.03], [0.2, 0.1], [0.001, 0.12]], 10, 0.38, 0.9, 0)); P.add('timber', box(0.35, 1.0, -0.02, 0.41, 1.06, 0.02));
  P.add('slate', box(-0.7, 0.88, 0.34, 0.7, 1.7, 0.37));   // the soot over the stove
}
/** A chest (xiang) with iron straps (let into the body, not laid on its face), facing −z. */
function chest(P, w = 0.8, d = 0.45, h = 0.5) {
  P.add(WD, box(-w / 2, 0, -d / 2, w / 2, h, d / 2)); P.add('lacquer_black', box(-w / 2 - 0.01, h, -d / 2 - 0.01, w / 2 + 0.01, h + 0.04, d / 2 + 0.01));
  P.add('iron', box(-0.04, h * 0.5, -d / 2 - 0.025, 0.04, h * 0.75, -d / 2 + 0.01));
  for (const s of [-1, 1]) P.add('iron', box(s * (w / 2 - 0.1) - 0.02, 0.03, -d / 2 - 0.02, s * (w / 2 - 0.1) + 0.02, h + 0.02, -d / 2 + 0.01));
}
function waterJar(P, x = 0, z = 0) { P.add('pottery_dark', ly([[0.001, 0], [0.2, 0], [0.32, 0.12], [0.38, 0.35], [0.3, 0.62], [0.2, 0.72], [0.24, 0.76], [0.001, 0.76]], 9, x, 0, z)); P.add('timber', ly([[0.001, 0.77], [0.26, 0.77], [0.26, 0.8], [0.001, 0.82]], 9, x, 0, z)); }
function logs(P, w = 1.0) { for (let r = 0; r < 4; r++) for (let k = 0; k < Math.round(w / 0.2) - (r > 1 ? 1 : 0); k++) P.add('bark_dark', rod([-w / 2 + 0.1 + k * 0.2 + (r % 2) * 0.08, 0.06 + r * 0.12, -0.15], [-w / 2 + 0.1 + k * 0.2 + (r % 2) * 0.08, 0.06 + r * 0.12, 0.15], 0.055, 5).rotateX(0)); }
function chopBlock(P) { P.add('timber', ly([[0.001, 0], [0.22, 0], [0.22, 0.7], [0.001, 0.7]], 9)); P.add('iron', box(-0.12, 0.7, -0.02, 0.12, 0.84, 0.0)); P.add('timber', box(0.12, 0.7, -0.03, 0.26, 0.73, 0.0)); }
function fishString(P, x, y, z) { P.add('rope_fibre', rod([x, y, z], [x, y - 0.55, z], 0.008, 3)); for (let k = 0; k < 3; k++) P.add('hide_tan', box(x - 0.03, y - 0.2 - k * 0.17, z - 0.07, x + 0.03, y - 0.04 - k * 0.17, z + 0.07)); }
/** A canopy bed (jiazi chuang): platform, mattress, quilt, pillow, posts and a frame, a painted back, curtains tied back, 1.9 × 1.1 × 1.95; the back at +z. */
function bed(P) {
  P.add(WD, box(-0.95, 0.18, -0.55, 0.95, 0.42, 0.55)); for (const sx of [-1, 1]) for (const sz of [-1, 1]) P.add(WD, box(sx * 0.9 - 0.04, 0, sz * 0.5 - 0.04, sx * 0.9 + 0.04, 0.18, sz * 0.5 + 0.04));
  P.add('cloth_indigo', box(-0.92, 0.42, -0.52, 0.92, 0.5, 0.52)); P.add('cloth_red', box(-0.9, 0.5, -0.5, 0.25, 0.57, 0.5)); P.add('cloth_white', box(0.45, 0.5, -0.22, 0.85, 0.62, 0.22));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) P.add(WD, box(sx * 0.93 - 0.03, 0.42, sz * 0.53 - 0.03, sx * 0.93 + 0.03, 1.95, sz * 0.53 + 0.03));
  for (const sz of [-1, 1]) P.add(WD, box(-0.96, 1.88, sz * 0.53 - 0.025, 0.96, 1.95, sz * 0.53 + 0.025)); for (const sx of [-1, 1]) P.add(WD, box(sx * 0.93 - 0.025, 1.88, -0.53, sx * 0.93 + 0.025, 1.95, 0.53));
  P.add(WD, box(-0.95, 0.42, 0.5, 0.95, 1.5, 0.55)); P.add('paint_white', box(-0.85, 0.55, 0.45, 0.85, 1.4, 0.5));
  for (let k = 0; k < 3; k++) P.add('slate', fromTriangles([-0.6 + k * 0.5, 0.6, 0.448, -0.3 + k * 0.5, 0.6, 0.448, -0.45 + k * 0.5, 0.95 + (k % 2) * 0.15, 0.448]));
  for (const sx of [-1, 1]) P.add('linen', box(sx > 0 ? 0.79 : -0.93, 0.7, -0.585, sx > 0 ? 0.93 : -0.79, 1.88, -0.565));
  P.add('cloth_white', box(-0.95, 1.7, -0.585, 0.95, 1.88, -0.565));
}
function washStand(P) {
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) P.add('timber', box(sx * 0.25 - 0.015, 0, sz * 0.18 - 0.015, sx * 0.25 + 0.015, sz > 0 ? 1.45 : 0.75, sz * 0.18 + 0.015));
  P.add('timber', box(-0.27, 0.72, -0.2, 0.27, 0.75, 0.2)); P.add('timber', box(-0.26, 0.2, -0.17, 0.26, 0.22, 0.17)); P.add('timber', box(-0.27, 1.38, 0.16, 0.27, 1.42, 0.2));
  P.add('glaze_white', ly([[0.001, 0], [0.12, 0], [0.22, 0.1], [0.24, 0.13], [0.22, 0.13], [0.11, 0.03], [0.001, 0.02]], 10, 0, 0.75, 0)); P.add('linen', box(-0.2, 0.9, 0.17, 0.2, 1.38, 0.175));
}
function mirrorStand(P) { P.add(WD, box(-0.18, 0, -0.12, 0.18, 0.05, 0.12)); P.add(WD, box(-0.02, 0.05, -0.02, 0.02, 0.5, 0.02)); P.add(WD, box(-0.2, 0.48, -0.1, 0.2, 0.52, 0.1)); P.add('bronze', ly([[0.001, 0], [0.17, 0], [0.17, 0.012], [0.001, 0.012]], 14).rotateX(Math.PI / 2).translate(0, 0.72, -0.02)); P.add(WD, ly([[0.17, 0], [0.19, 0], [0.19, 0.02], [0.17, 0.02]], 14).rotateX(Math.PI / 2).translate(0, 0.72, -0.025)); P.add(WD, box(-0.02, 0.52, -0.02, 0.02, 0.56, 0.02)); }
function lampStand(P) { P.add('bronze', ly([[0.001, 0], [0.06, 0], [0.03, 0.12], [0.001, 0.14]], 8)); P.add('flame', ball(0.015, 0.025, 0.015, 5, 3).translate(0, 0.17, 0)); }
/** A foot-treadle loom as in the Gengzhi tu: four posts, side rails, the warp beam behind and the cloth beam before, two heddle frames, the batten, two treadles, the weaver's bench; the weaver faces −z. 1.3 × 1.5. */
function loom(P) {
  for (const sx of [-1, 1]) { P.add('timber', box(sx * 0.55 - 0.035, 0, -1.19, sx * 0.55 + 0.035, 1.5, -1.12)); P.add('timber', box(sx * 0.55 - 0.035, 0, -0.19, sx * 0.55 + 0.035, 1.2, -0.12)); P.add('timber', box(sx * 0.55 - 0.03, 1.1, -1.15, sx * 0.55 + 0.03, 1.16, -0.15)); P.add('timber', box(sx * 0.55 - 0.03, 0.05, -1.2, sx * 0.55 + 0.03, 0.1, -0.1)); }
  P.add('timber', rod([-0.6, 0.95, -1.1], [0.6, 0.95, -1.1], 0.06, 7)); P.add('timber', rod([-0.6, 0.85, -0.2], [0.6, 0.85, -0.2], 0.04, 6)); P.add('linen', rod([-0.5, 0.7, -0.05], [0.5, 0.7, -0.05], 0.07, 7));
  P.add('linen', box(-0.5, 0.9, -1.1, 0.5, 0.915, -0.2));
  for (const z of [-0.85, -0.72]) { P.add('timber', rod([-0.55, 1.4, z], [0.55, 1.4, z], 0.022, 5)); for (const sx of [-1, 1]) P.add('timber', box(sx * 0.5 - 0.01, 0.95, z - 0.01, sx * 0.5 + 0.01, 1.4, z + 0.01)); for (let k = 0; k < 11; k++) P.add('linen', box(-0.5 + k * 0.1 - 0.004, 0.95, z - 0.004, -0.5 + k * 0.1 + 0.004, 1.4, z + 0.004)); }
  P.add('timber', rod([-0.55, 1.3, -0.45], [0.55, 1.3, -0.45], 0.03, 6)); P.add('timber', rod([-0.55, 0.96, -0.45], [0.55, 0.96, -0.45], 0.03, 6)); for (const sx of [-1, 1]) P.add('timber', box(sx * 0.5 - 0.015, 0.96, -0.465, sx * 0.5 + 0.015, 1.3, -0.435)); for (let k = 0; k < 14; k++) P.add('bamboo_culm', box(-0.48 + k * 0.074 - 0.004, 0.96, -0.455, -0.48 + k * 0.074 + 0.004, 1.3, -0.445));
  P.add('timber', rod([-0.55, 0.06, -0.9], [0.55, 0.06, -0.9], 0.02, 5)); for (const sx of [-1, 1]) P.add('timber', box(sx * 0.22 - 0.1, 0.05, -0.9, sx * 0.22 + 0.1, 0.1, 0.15));
  P.add('timber', box(-0.45, 0.42, 0.15, 0.45, 0.46, 0.45)); for (const sx of [-1, 1]) for (const sz of [0.2, 0.4]) P.add('timber', box(sx * 0.4 - 0.02, 0, sz - 0.02, sx * 0.4 + 0.02, 0.42, sz + 0.02));
}
/** A silk reel: a six-armed frame on an axle between two posts, the reeling basin on a small brick stove beside it. */
function reel(P) {
  for (const sx of [-1, 1]) { P.add('timber', box(sx * 0.45 - 0.025, 0, -0.025, sx * 0.45 + 0.025, 0.9, 0.025)); P.add('timber', box(sx * 0.45 - 0.05, 0, -0.18, sx * 0.45 + 0.05, 0.04, 0.18)); }
  P.add('timber', rod([-0.46, 0.9, 0], [0.46, 0.9, 0], 0.02, 5));
  const tips = []; for (let k = 0; k < 6; k++) tips.push([0.9 + 0.36 * Math.cos(k * Math.PI / 3), 0.36 * Math.sin(k * Math.PI / 3)]);
  for (const a of [-0.33, 0.33]) for (const t of tips) P.add('timber', rod([a, 0.9, 0], [a, t[0], t[1]], 0.01, 4));
  for (const t of tips) P.add('timber', rod([-0.33, t[0], t[1]], [0.33, t[0], t[1]], 0.012, 4));
  for (let k = 0; k < 6; k++) { const t0 = tips[k], t1 = tips[(k + 1) % 6]; P.add('linen', rod([0, t0[0], t0[1]], [0, t1[0], t1[1]], 0.07, 5).scale(1, 1, 1)); }
}
function reelingStove(P) { P.add('brick_grey', box(-0.28, 0, -0.28, 0.28, 0.5, 0.28)); P.add('slate', box(-0.1, 0.08, -0.285, 0.1, 0.28, -0.28)); P.add('flame', box(-0.06, 0.1, -0.285, 0.06, 0.16, -0.28)); P.add('bronze', ly([[0.001, 0], [0.2, 0.03], [0.26, 0.12], [0.001, 0.13]].map((p) => [p[0], p[1]]), 10, 0, 0.5, 0)); for (let k = 0; k < 9; k++) P.add('linen', ball(0.03, 0.04, 0.03, 5, 3).translate(Math.cos(k * 2.4) * 0.1, 0.63, Math.sin(k * 2.4) * 0.1)); }
/** A rack of three round bamboo trays of silkworms on mulberry leaves (cansang), 1.0 × 0.7 × 1.8. */
function trayRack(P) {
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) P.add('bamboo_culm', rod([sx * 0.46, 0, sz * 0.3], [sx * 0.46, 1.8, sz * 0.3], 0.02, 5));
  for (const y of [0.35, 0.9, 1.45]) { for (const sz of [-1, 1]) P.add('bamboo_culm', rod([-0.46, y, sz * 0.3], [0.46, y, sz * 0.3], 0.018, 5)); P.add('wicker', ly([[0.001, 0.0], [0.4, 0.0], [0.43, 0.05], [0.4, 0.05], [0.001, 0.02]], 12, 0, y + 0.02, 0)); P.add('glaze_green', ly([[0.001, 0.03], [0.36, 0.03], [0.36, 0.045], [0.001, 0.05]], 12, 0, y + 0.02, 0)); for (let k = 0; k < 7; k++) P.add('linen', box(-0.25 + k * 0.08, y + 0.07, -0.12 + (k % 3) * 0.1, -0.2 + k * 0.08, y + 0.075, -0.1 + (k % 3) * 0.1)); }
}
function basket(P, x, y, z, r = 0.25, h = 0.28, fill = null) { P.add('wicker', ly([[0.001, 0], [r * 0.8, 0], [r, h * 0.9], [r * 0.95, h], [r * 0.85, h], [r * 0.7, h * 0.1], [0.001, 0.02]], 9, x, y, z)); if (fill) for (let k = 0; k < 8; k++) P.add(fill, ball(0.05, 0.045, 0.05, 5, 3).translate(x + Math.cos(k * 2.1) * r * 0.45, y + h * 0.85, z + Math.sin(k * 2.1) * r * 0.45)); }
function barrel(P, x, z, h = 0.8, r = 0.33) {
  const rr = (t) => r * (0.78 + 0.22 * Math.sin(Math.PI * t));
  const pts = [[0.001, 0]]; for (let i = 0; i <= 8; i++) pts.push([rr(i / 8), h * i / 8]); pts.push([0.001, h]);
  P.add('timber', ly(pts, 10, x, 0, z));
  for (const t of [0.12, 0.3, 0.7, 0.88]) { const q = rr(t) + 0.012; P.add('iron', ly([[q, h * t - 0.02], [q + 0.012, h * t - 0.02], [q + 0.012, h * t + 0.02], [q, h * t + 0.02]], 10, x, 0, z)); }
}
function paperSheet(P, a, y, z, w = 0.32, h = 0.45) { P.add('paint_white', box(a - w / 2, y - h, z - 0.003, a + w / 2, y, z + 0.003)); }

// ── the rooms ──────────────────────────────────────────────────────────────────────────────────
function room(el, S, ctx) {
  const yaw = YAW[S.f], cs = Math.cos(yaw), sn = Math.sin(yaw), [x0, z0, x1, z1] = el.rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, b0 = S.D / 2 - (S.wB - TH);
  const WC = (a, b) => [cx + a * cs + (b0 + b) * sn, cz - a * sn + (b0 + b) * cs], floor = (el.y ?? 0) + 0.45, Pa = new Parts(), figs = [];
  const put = (Q, a, b, yw = 0, up = 0) => Q.emit(Pa, a, up, b, yw);
  const rect = (a0, b0_, a1, b1, h) => { const p = WC(a0, b0_), q = WC(a1, b1); ctx.col?.rect([Math.min(p[0], q[0]) - 0.12, Math.min(p[1], q[1]) - 0.12, Math.max(p[0], q[0]) + 0.12, Math.max(p[1], q[1]) + 0.12], floor, floor + h); };
  const rr = rng((el.seed || 1) + 41);
  const person = (a, b, ta, tb, extra = {}) => { const p = WC(a, b), q = WC(a + ta, b + tb); figs.push({ t: 'figure', at: p, y: floor, rot: Math.atan2(-(q[0] - p[0]), -(q[1] - p[1])), seed: Math.floor(rng((el.seed ?? 1) + figs.length * 7)() * 1e9), skin: 'skin_light', carry: 'none', ...extra }); };
  const emit = () => { const o = WC(0, 0); Pa.emit(ctx.bag, o[0], floor, o[1], yaw); };
  return { put, rect, person, emit, figs, rr, Wd: S.Wd, Dp: S.Bd, Rp: S.Rp, f0: S.Rp + 0.16, Fd: S.Fd };
}
const sg = (v) => (v < 0 ? -1 : 1);
const faceYaw = (dx, dz) => Math.atan2(-dx, -dz);
const pick = (r, a) => a[Math.floor(r() * a.length)];
const maid = (r, extra = {}) => ({ dress: 'robe', cloth: pick(r, ['cloth_indigo', 'cloth_brown', 'cloth_grey', 'cloth_green']), cloth2: pick(r, CL), hat: 'none', hair: 'bun', ...extra });
const man = (r, extra = {}) => ({ dress: pick(r, ['robe', 'trousers']), cloth: pick(r, CL), cloth2: pick(r, CL), hat: pick(r, ['cap', 'none', 'cap']), ...extra });

// the rear rooms
function kitchen(R, S) {
  const { put, rect, person, Wd, Rp, rr } = R, ar = -sg(S.pb) * (Wd / 2 - 1.1), s = sg(ar);
  { const P = new Parts(); range(P); put(P, ar, 0.43, Math.PI); rect(ar - 0.78, 0.03, ar + 0.78, 0.82, 0.86); }
  person(ar, 1.35, 0, -1, maid(rr, { pose: 'stand', hat: 'none' }));
  { const P = new Parts(); waterJar(P); put(P, ar - s * 1.15, 0.5); rect(ar - s * 1.15 - 0.4, 0.1, ar - s * 1.15 + 0.4, 0.9, 0.85); }
  { const P = new Parts(); logs(P, 0.9); put(P, s * (Wd / 2 - 0.45), 1.9, Math.PI / 2); rect(s * (Wd / 2 - 0.45) - 0.2, 1.4, s * (Wd / 2 - 0.45) + 0.2, 2.4, 0.5); }
  { const P = new Parts(); chopBlock(P); put(P, -s * 0.45, 0.5); rect(-s * 0.45 - 0.24, 0.26, -s * 0.45 + 0.24, 0.74, 0.7); }
  { const P = new Parts(); table(P, 0.9, 0.6, 0.78); put(P, -sg(S.pa) * 0.9, Rp * 0.62); rect(-sg(S.pa) * 0.9 - 0.45, Rp * 0.62 - 0.3, -sg(S.pa) * 0.9 + 0.45, Rp * 0.62 + 0.3, 0.78);
    const B = new Parts(); for (let k = 0; k < 3; k++) teabowl(B, -0.2 + k * 0.2, 0.78, 0.0); put(B, -sg(S.pa) * 0.9, Rp * 0.62);
    for (const d of [-1, 1]) { const T = new Parts(); stool(T); put(T, -sg(S.pa) * 0.9 + d * 0.7, Rp * 0.62); rect(-sg(S.pa) * 0.9 + d * 0.7 - 0.2, Rp * 0.62 - 0.2, -sg(S.pa) * 0.9 + d * 0.7 + 0.2, Rp * 0.62 + 0.2, 0.44); } }
  { const P = new Parts(); shelf(P, 1.1, 3, 'bowls', (S.pa * 100) | 0); const a = -sg(S.pa) * (Wd / 2 - 0.75); put(P, a, Rp - 0.02); rect(a - 0.55, Rp - 0.2, a + 0.55, Rp, 1.4); }
  { const P = new Parts(); fishString(P, ar * 0.5, 3.2, Rp / 2); fishString(P, -ar * 0.2, 3.2, Rp / 2); put(P, 0, 0); }
}
function bedchamber(R, S) {
  const { put, rect, Wd, Rp } = R, ab = -sg(S.pb) * (Wd / 2 - 1.05), s = sg(ab);
  { const P = new Parts(); bed(P); put(P, ab, 0.6, Math.PI); rect(ab - 0.97, 0.04, ab + 0.97, 1.16, 1.95); }
  { const P = new Parts(); chest(P, 0.9, 0.45, 0.5); put(P, ab, 1.5, Math.PI); rect(ab - 0.45, 1.27, ab + 0.45, 1.73, 0.5); const M = new Parts(); mirrorStand(M); put(M, ab - 0.2, 1.5, Math.PI, 0.5); const L = new Parts(); lampStand(L); put(L, ab + 0.3, 1.5, 0, 0.5); }
  { const P = new Parts(); washStand(P); const a = -s * (Wd / 2 - 0.3); put(P, a, Rp - 0.9, faceYaw(s, 0)); rect(a - 0.22, Rp - 1.12, a + 0.22, Rp - 0.68, 1.45); }
  { const P = new Parts(); scroll(P, 0, 0, 0, 0.45, 1.3, S.pa | 0); put(P, -s * 0.5, 0.06, 0, 0.95); }
  { const P = new Parts(); basket(P, 0, 0, 0, 0.26, 0.3, 'cloth_white'); put(P, -s * 1.0, 1.0); rect(-s * 1.0 - 0.27, 0.73, -s * 1.0 + 0.27, 1.27, 0.3); }
}

// the front rooms
function hallRoom(R, S) {
  const { put, rect, person, Wd, Dp, f0, Fd, rr } = R, dc = S.ft === 'court' ? S.dh : S.da, free = -sg(S.pa);
  { const P = new Parts(); altar(P, 1.3); put(P, 0, f0 + 0.3, Math.PI); rect(-0.65, f0 + 0.1, 0.65, f0 + 0.5, 0.95); }
  for (let k = 0; k < (Wd / 2 > 2.4 ? 2 : 1); k++) { const P = new Parts(); scroll(P, 0, 0, 0, 0.45, 1.4, (S.pa * 37 | 0) + k); put(P, free * (1.25 + k * 0.7), f0 + 0.02, 0, 0.95); }
  { const T = new Parts(); table(T, 0.7, 0.5, 0.74); put(T, 0, f0 + 1.7); rect(-0.35, f0 + 1.45, 0.35, f0 + 1.95, 0.74); const V = new Parts(); teabowl(V, -0.1, 0.74, 0); teabowl(V, 0.1, 0.74, 0.05); vase(V, 0.22, 0.74, 0, 0.8); put(V, 0, f0 + 1.7); }
  for (const d of [-1, 1]) { const C = new Parts(); chair(C); put(C, d * 1.0, f0 + 1.7, faceYaw(-d, 0)); rect(d * 1.0 - 0.28, f0 + 1.44, d * 1.0 + 0.28, f0 + 1.96, 1.0); }
  if (rr() < 0.7) person(1.0, f0 + 1.7, -1, 0, man(rr, { pose: 'sit', dress: 'robe', hat: 'cap' }));
  const side = -sg(dc);
  if (Fd >= 5.4) { const P = new Parts(); couch(P, 1.9, 0.95); const a = side * (Wd / 2 - 0.55); put(P, a, f0 + Fd * 0.55, side < 0 ? -Math.PI / 2 : Math.PI / 2); rect(a - 0.52, f0 + Fd * 0.55 - 0.97, a + 0.52, f0 + Fd * 0.55 + 0.97, 0.98); }
  else { const P = new Parts(); chest(P, 0.9, 0.45, 0.5); const a = side * (Wd / 2 - 0.3); put(P, a, f0 + Fd * 0.6, faceYaw(-side, 0)); rect(a - 0.25, f0 + Fd * 0.6 - 0.46, a + 0.25, f0 + Fd * 0.6 + 0.46, 0.5); }
  if (Wd > 4.5) { const P = new Parts(); qinTable(P); const a = -side * (Wd / 2 - 0.3); put(P, a, f0 + 1.3, faceYaw(side, 0)); rect(a - 0.22, f0 + 0.88, a + 0.22, f0 + 1.72, 0.55); }
  for (const d of [-1, 1]) { const L = new Parts(); lantern(L, 0, H - 0.12, 0); put(L, d * Wd / 4, f0 + Fd / 2 + 0.1); }
}
function weaverRoom(R, S) {
  const { put, rect, person, Wd, f0, Fd, rr } = R, dc = S.ft === 'court' ? S.dh : S.da, sr = -sg(S.pa), sl = sr, al = sl * Math.min(Wd / 2 - 0.9, 1.5);
  const bl = f0 + 2.15;   // (the loom on the side away from the partition's doorway, before the tray rack)
  { const P = new Parts(); loom(P); put(P, al, bl); rect(al - 0.62, bl - 1.2, al + 0.62, bl + 0.1, 1.5); }
  person(al, bl + 0.3, 0, -1, maid(rr, { pose: 'sit' }));
  { const P = new Parts(); trayRack(P); const a = sr * (Wd / 2 - 0.8); put(P, a, f0 + 0.45); rect(a - 0.5, f0 + 0.05, a + 0.5, f0 + 0.85, 1.8); }
  { const P = new Parts(); reel(P); const a = -sl * (Wd / 2 - 0.55); put(P, a, f0 + Fd * 0.45, Math.PI / 2); rect(a - 0.42, f0 + Fd * 0.45 - 0.5, a + 0.42, f0 + Fd * 0.45 + 0.5, 1.3); const T = new Parts(); reelingStove(T); put(T, a, f0 + Fd * 0.45 + 1.0); rect(a - 0.3, f0 + Fd * 0.45 + 0.7, a + 0.3, f0 + Fd * 0.45 + 1.3, 0.5); }
  { const P = new Parts(); basket(P, 0, 0, 0, 0.26, 0.3, 'linen'); put(P, sl * (Wd / 2 - 0.4), f0 + 0.45); rect(sl * (Wd / 2 - 0.4) - 0.27, f0 + 0.18, sl * (Wd / 2 - 0.4) + 0.27, f0 + 0.72, 0.3); }
  for (let k = 0; k < 3; k++) { const L = new Parts(); lantern(L, 0, H - 0.12, 0); put(L, (k - 1) * Wd / 3, f0 + Fd / 2 + 0.1); }
}
function workRoom(R, S) {
  const { put, rect, person, Wd, f0, Fd, rr } = R, dc = S.da, side = -sg(dc), ab = side * Math.min(Wd / 2 - 1.3, 1.4), bb = f0 + Math.min(2.4, Fd * 0.55);
  const kind = S.frontKind;
  if (kind === 'printer') {
    { const P = new Parts(); table(P, 1.5, 0.62, 0.82); put(P, ab, bb); rect(ab - 0.75, bb - 0.31, ab + 0.75, bb + 0.31, 0.82);
      const T = new Parts(); T.add('timber', box(-0.55, 0.82, -0.2, -0.1, 0.87, 0.2)); T.add('slate', box(-0.5, 0.87, -0.15, -0.15, 0.875, 0.15)); T.add('paint_white', box(0.1, 0.82, -0.17, 0.5, 0.86, 0.17)); T.add('lacquer_black', ly([[0.001, 0], [0.05, 0], [0.05, 0.06], [0.001, 0.06]], 8, 0.62, 0.82, 0.1)); T.add('bamboo_culm', rod([0.62, 0.88, 0.1], [0.72, 0.9, 0.2], 0.01, 3)); put(T, ab, bb); }
    person(ab, bb + 0.75, 0, -1, man(rr, { pose: 'stand', hat: 'cap' }));
    { const P = new Parts(); shelf(P, Math.min(2.2, Wd / 2 + 0.2), 3, 'books', S.pa | 0); const a = -sg(S.pa) * (Wd / 2 - 0.2 - Math.min(2.2, Wd / 2 + 0.2) / 2); put(P, a, f0 + 0.02); rect(a - 1.1, f0 + 0.02, a + 1.1, f0 + 0.2, 1.4); }
    { const P = new Parts(); P.add('rope_fibre', rod([-Wd / 2, 2.3, 0], [Wd / 2, 2.3, 0], 0.008, 3)); for (let k = 0; k < 9; k++) paperSheet(P, -Wd / 2 + 0.7 + k * (Wd - 1.4) / 8, 2.29, 0.0); put(P, 0, f0 + Math.min(1.2, Fd * 0.3)); }
    { const P = new Parts(); P.add('paint_white', box(-0.22, 0, -0.15, 0.22, 0.2, 0.15)); stool(P); put(P, -side * (Wd / 2 - 0.6), f0 + Fd * 0.5); rect(-side * (Wd / 2 - 0.6) - 0.22, f0 + Fd * 0.5 - 0.22, -side * (Wd / 2 - 0.6) + 0.22, f0 + Fd * 0.5 + 0.22, 0.44); }
  } else if (kind === 'bamboo') {
    { const P = new Parts(); for (let k = 0; k < 8; k++) P.add('bamboo_culm', rod([k * 0.07, 0, 0.45 - k * 0.01], [k * 0.07, 2.25, 0.04], 0.025, 5)); const a = -sg(S.pa) * (Wd / 2 - 0.8); put(P, a, f0 + 0.0); rect(a - 0.1, f0 + 0.04, a + 0.6, f0 + 0.5, 0.8); }
    { const P = new Parts(); stool(P); put(P, ab, bb); rect(ab - 0.2, bb - 0.2, ab + 0.2, bb + 0.2, 0.44); const B = new Parts(); basket(B, 0.05, 0, -0.5, 0.3, 0.3); basket(B, -0.4, 0, -0.35, 0.22, 0.2); put(B, ab, bb); rect(ab - 0.8, bb - 0.85, ab + 0.35, bb - 0.2, 0.3); }
    person(ab, bb + 0.02, 0, -1, man(rr, { pose: 'sit', dress: 'trousers', hat: 'none' }));
    for (let k = 0; k < 3; k++) { const P = new Parts(); basket(P, 0, 0, 0, 0.3, 0.4); put(P, side * -(Wd / 2 - 0.5), f0 + 1.0 + k * 0.7); rect(side * -(Wd / 2 - 0.5) - 0.3, f0 + 0.7 + k * 0.7, side * -(Wd / 2 - 0.5) + 0.3, f0 + 1.3 + k * 0.7, 0.4); }
    for (let k = 0; k < 4; k++) { const P = new Parts(); P.add('rope_fibre', rod([0, 3.25, 0], [0, 2.8, 0], 0.008, 3)); basket(P, 0, 2.5, 0, 0.26, 0.3); put(P, (k - 1.5) * Wd / 4.5, f0 + Fd / 2 + 0.1); }
  } else if (kind === 'lantern') {
    for (let k = 0; k < 4; k++) { const P = new Parts(); lantern(P, 0, H - 0.12, 0, k % 3 === 0 ? 'lamp_white' : 'lamp_paper'); put(P, (k - 1.5) * Wd / 4.2, f0 + Fd / 2 + 0.1); }
    { const P = new Parts(); table(P, 1.5, 0.7, 0.8); put(P, ab, bb); rect(ab - 0.75, bb - 0.35, ab + 0.75, bb + 0.35, 0.8); const T = new Parts(); for (let k = 0; k < 4; k++) T.add('bamboo_culm', ly([[0.14, 0], [0.145, 0.01], [0.145, 0.3 + k * 0.01], [0.14, 0.3]], 10, -0.5 + k * 0.33, 0.8, 0)); T.add('pottery_dark', ly([[0.001, 0], [0.07, 0], [0.08, 0.1], [0.001, 0.1]], 8, 0.6, 0.8, 0.15)); for (let k = 0; k < 3; k++) T.add('paint_white', ly([[0.001, 0], [0.06, 0], [0.06, 0.4], [0.001, 0.4]], 8, -0.5 + k * 0.2, 0.8, 0.2)); put(T, ab, bb); }
    person(ab, bb + 0.65, 0, -1, man(rr, { pose: 'sit', hat: 'cap' })); { const P = new Parts(); stool(P); put(P, ab, bb + 0.65); }
    { const pa_ = -side * (Wd / 2 - 0.45), b0_ = f0 + 0.5, b1_ = f0 + Math.min(3.0, Fd - 1.4), P = new Parts();   // a pole on two posts along the side wall, the lanterns hung from it
      for (const bz of [b0_, b1_]) P.add('timber', rod([0, 0, bz], [0, 2.2, bz], 0.04, 5)); P.add('timber', rod([0, 2.2, b0_], [0, 2.2, b1_], 0.03, 5));
      for (let k = 0; k < 6; k++) { const bz = b0_ + 0.3 + k * (b1_ - b0_ - 0.6) / 5; lantern(P, 0, 2.2, bz, k % 2 ? 'lamp_paper' : 'lamp_white'); }
      put(P, pa_, 0); for (const bz of [b0_, b1_]) rect(pa_ - 0.06, bz - 0.06, pa_ + 0.06, bz + 0.06, 2.2); }
  } else {
    { const P = new Parts(); barrel(P, 0, 0, 0.8, 0.33); barrel(P, 0.7, 0, 0.8, 0.33); barrel(P, 0.35, 0.1, 0.8, 0.33); const a = -sg(S.pa) * (Wd / 2 - 1.1); put(P, a, f0 + 0.6); rect(a - 0.45, f0 + 0.2, a + 1.15, f0 + 1.0, 0.85); }
    { const P = new Parts(); for (let k = 0; k < 10; k++) P.add('timber', box(k * 0.075 - 0.34, 0, -0.01, k * 0.075 - 0.28, 1.05, 0.01).rotateX(-0.12)); const a = -sg(S.pa) * (Wd / 2 - 0.4); put(P, a, f0 + Fd * 0.6, -sg(a) * Math.PI / 2); rect(a - 0.25, f0 + Fd * 0.6 - 0.4, a + 0.25, f0 + Fd * 0.6 + 0.4, 1.0); }
    { const P = new Parts(); table(P, 1.4, 0.55, 0.8); put(P, ab, bb); rect(ab - 0.7, bb - 0.28, ab + 0.7, bb + 0.28, 0.8); const T = new Parts(); T.add('iron', box(-0.4, 0.8, -0.04, -0.1, 0.86, 0.04)); T.add('timber', box(0.1, 0.8, -0.1, 0.5, 0.84, 0.1)); T.add('iron', box(0.55, 0.8, 0.0, 0.7, 0.83, 0.04)); put(T, ab, bb); }
    person(ab, bb + 0.7, 0, -1, man(rr, { pose: 'stand', dress: 'trousers', hat: 'none' }));
    for (let k = 0; k < 2; k++) { const L = new Parts(); lantern(L, 0, H - 0.12, 0); put(L, (k - 0.5) * Wd / 2, f0 + Fd / 2 + 0.1); }
  }
}

function dwellingIn(el, ctx) {
  const S = dwellingSpec(el), R = room(el, S, ctx);
  if (S.rearKind === 'kitchen') kitchen(R, S); else bedchamber(R, S);
  if (S.frontKind === 'hall') hallRoom(R, S); else if (S.frontKind === 'weaver') weaverRoom(R, S); else workRoom(R, S);
  R.emit();
  return R.figs;
}
STYLES.life.elements.hz_dwelling_in = (el, ctx) => { for (const f of dwellingIn(el, ctx)) STYLES.life.elements.figure(f, ctx); };

/** The interior rectangle of a dwelling in the world (for the music zone): the building's room between its walls. */
export function dwellingRoomRect(l) {
  const S = dwellingSpec(l), [x0, z0, x1, z1] = l.rect, f = S.f, fw = S.Cd + TH, bi = S.wB - TH;
  return f === 's' ? [x0 + TH, z1 - bi, x1 - TH, z1 - fw] : f === 'n' ? [x0 + TH, z0 + fw, x1 - TH, z0 + bi] : f === 'e' ? [x1 - bi, z0 + TH, x1 - fw, z1 - TH] : [x0 + fw, z0 + TH, x0 + bi, z1 - TH];
}
