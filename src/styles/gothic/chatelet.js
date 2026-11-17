// The Châtelets of Paris about 1248 (docs/settlements/paris.md §1e): the Grand Châtelet at the Right Bank end of the Grand Pont and
// the smaller Petit Châtelet at the Left Bank end of the Petit Pont — the two gates by which one entered the Cité, each a stone
// block cut through by a long vaulted passage (the street runs through it), flanked by round towers on the bridge side, under
// steep slate roofs and a crenellated bridging block. The Grand Châtelet is the seat of the prévôt: its west block holds his
// court (the auditoire, with the dais and the bar) and the clerks' room (the greffe), entered from the passage; its east block
// is the prison, shut. Registered into the `gothic` style.
// chatelet { rect [x0, z0, x1, z1] (the passage runs along z, at the middle of x), y, pw (its width), h (the walls to the parapet),
// court (build the prévôt's rooms), south (the bridge side: 's' = z1, 'n' = z0), towers [[x, z, r, h, roof], …] }

import { STYLES } from '../../core/build.js';
import { box, lathe, rod, fromTriangles } from '../../core/geom.js';
import { planarWall, archRise, archHalf } from '../byzantine/index.js';
import { prism } from './notre-dame.js';
import './index.js';
import { tableAt } from './hall-interior.js';

const L = 'limestone';
const G = () => STYLES.gothic.elements;

function chatelet(el, ctx) {
  const { bag, col, lights } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y, T = 1.2, h = el.h ?? 11.5, pw = el.pw ?? 4.6, hp = pw / 2;
  const WY = (l) => l.filter((yy) => yy + 1.5 < h), xc = (x0 + x1) / 2, top = y + h, a = { r: hp, spring: y + 3.6, pointed: 0.8, sill: y }, FL = y + 0.15;
  const wx = xc - hp, ex = xc + hp, court = !!el.court;
  bag.add(L, box(x0 - 0.4, y - 0.7, z0 - 0.4, x1 + 0.4, y + 0.4, z1 + 0.4));
  // ── the end faces (north z0, south z1): the whole width, pierced by the passage's pointed arch, with small windows above
  for (const [zf, n] of [[z0 + T / 2, -1], [z1 - T / 2, 1]]) {
    const arches = [{ ...a, uc: xc - x0 }];
    const wins = [];
    for (const uc of [(wx - x0) / 2, (x1 - ex) / 2 + (ex - x0)]) for (const yy of WY([5.6, 8.6])) { arches.push({ uc, r: 0.32, spring: y + yy + 1.0, sill: y + yy, pointed: 0.8 }); wins.push([uc, yy]); }
    for (const uc of [(xc - x0)]) for (const yy of WY([8.0])) { arches.push({ uc: uc - 1.2, r: 0.3, spring: y + yy + 0.9, sill: y + yy, pointed: 0.8 }, { uc: uc + 1.2, r: 0.3, spring: y + yy + 0.9, sill: y + yy, pointed: 0.8 }); wins.push([uc - 1.2, yy], [uc + 1.2, yy]); }
    bag.add(L, planarWall({ o: [x0, zf], u: [1, 0], th: T, u0: 0, u1: x1 - x0, y0: y, y1: top, arches }));
    for (const [uc, yy] of wins) bag.add('opening', box(x0 + uc - 0.3, y + yy, zf + (n < 0 ? -T / 2 + 0.05 : T / 2 - 0.12), x0 + uc + 0.3, y + yy + 1.2, zf + (n < 0 ? -T / 2 + 0.12 : T / 2 - 0.05)));
    // the arch's moulded band, string courses at the floors, the gate's sill
    const S = [], sb = (xa, xb, yy) => S.push(...box(xa, yy, zf + n * (T / 2 - 0.02) - (n > 0 ? 0 : 0.18), xb, yy + 0.25, zf + n * (T / 2 - 0.02) + (n > 0 ? 0.18 : 0)).attributes.position.array);
    for (const yy of [y + 5.2, y + 8.2]) { sb(x0 - 0.1, wx, yy); sb(ex, x1 + 0.1, yy); }
    sb(x0 - 0.1, x1 + 0.1, top - 0.4);
    bag.add(L, fromTriangles(S));
    col.rect([x0, zf - T / 2, wx, zf + T / 2], y - 0.7, top); col.rect([ex, zf - T / 2, x1, zf + T / 2], y - 0.7, top);
    col.rect([wx, zf - T / 2, ex, zf + T / 2], y + 4.4, top);
    // the gate leaves folded back flat against the passage walls, iron-bound
    for (const s of [-1, 1]) { const xs = xc + s * (hp - 0.02); bag.add('wood_dark', box(Math.min(xs, xs - s * 0.1), y, zf - 0.5 + n * 0.0, Math.max(xs, xs - s * 0.1), y + 3.2, zf + 0.5 - 0.0)); for (const yy of [0.5, 1.6, 2.7]) bag.add('iron', box(Math.min(xs - s * 0.01, xs - s * 0.13), y + yy, zf - 0.48, Math.max(xs - s * 0.01, xs - s * 0.13), y + yy + 0.1, zf + 0.48)); }
  }
  // ── the long outer walls (x0, x1) and the passage's walls (wx, ex)
  // the west wall: the court's windows; the east wall: slits (the prison)
  { const wl = []; for (let u = 4.5; u < z1 - z0 - 3; u += 4.5) wl.push(u);
    bag.add(L, planarWall({ o: [x0 + T / 2, z0], u: [0, 1], th: T, u0: T, u1: z1 - z0 - T, y0: y, y1: top, arches: wl.map((uc, i) => ({ uc, r: court ? 0.62 : 0.3, spring: y + (court ? 4.8 : 4.0), sill: y + (court ? 2.4 : 2.0), pointed: 0.8 })).concat(wl.flatMap((uc) => WY([6.4, 9.0]).map((yy) => ({ uc, r: 0.3, spring: y + yy + 1.0, sill: y + yy, pointed: 0.8 })))) }));
    for (const uc of wl) { if (court) G().gothic_window({ o: [x0 + T / 2, z0], u: [0, 1], uc, w: 1.24, sill: y + 2.4, spring: y + 4.8, f: 0.8, lancets: 2, inSide: -1, bar: 0.08 }, ctx); else bag.add('opening', box(x0 + 0.05, y + 2.0, z0 + uc - 0.3, x0 + T - 0.05, y + 4.9, z0 + uc + 0.3)); for (const yy of WY([6.4, 9.0])) bag.add('opening', box(x0 + 0.05, y + yy, z0 + uc - 0.3, x0 + T - 0.05, y + yy + 1.3, z0 + uc + 0.3)); }
    col.rect([x0, z0, x0 + T, z1], y - 0.7, top);
    bag.add(L, planarWall({ o: [x1 - T / 2, z0], u: [0, 1], th: T, u0: T, u1: z1 - z0 - T, y0: y, y1: top, arches: wl.map((uc) => ({ uc, r: 0.2, spring: y + 3.4, sill: y + 2.2, pointed: 0.8 })).concat(wl.flatMap((uc) => WY([6.4, 9.0]).map((yy) => ({ uc, r: 0.3, spring: y + yy + 1.0, sill: y + yy, pointed: 0.8 })))) }));
    for (const uc of wl) { bag.add('opening', box(x1 - T + 0.05, y + 2.2, z0 + uc - 0.2, x1 - 0.05, y + 3.8, z0 + uc + 0.2)); for (let k = -1; k <= 1; k++) bag.add('iron', rod([x1 + 0.0, y + 2.2, z0 + uc + k * 0.1], [x1 + 0.0, y + 3.7, z0 + uc + k * 0.1], 0.012, 4)); for (const yy of WY([6.4, 9.0])) bag.add('opening', box(x1 - T + 0.05, y + yy, z0 + uc - 0.3, x1 - 0.05, y + yy + 1.3, z0 + uc + 0.3)); }
    col.rect([x1 - T, z0, x1, z1], y - 0.7, top);
  }
  // the east block is solid between its walls; the west's rooms are hollow
  bag.add(L, box(ex, y - 0.7, z0 + T - 0.1, x1 - T + 0.1, top - 0.3, z1 - T + 0.1)); col.rect([ex, z0, x1, z1], y - 0.7, top);
  // the passage's side walls (with the courts' doors cut in the west one) and the passage floor and vault
  const door = (zc) => ({ uc: zc - z0, r: 0.75, spring: y + 2.4, sill: y + 0.15, pointed: 0.8 });
  const doors = court ? [el.doors?.[0] ?? (z0 + 11), el.doors?.[1] ?? (z0 + 22)] : [];
  bag.add(L, planarWall({ o: [wx - T / 2, z0], u: [0, 1], th: T, u0: T, u1: z1 - z0 - T, y0: y, y1: a.spring + archRise(a) + 0.2, arches: doors.map((zc) => door(zc)) }));
  bag.add(L, box(wx - T, a.spring + archRise(a) + 0.2, z0 + T - 0.1, wx, top - 0.3, z1 - T + 0.1));
  { let zp = z0; for (const zc of [...doors].sort((p, q) => p - q)) { col.rect([wx - T, zp, wx, zc - 0.75], y - 0.7, top); col.rect([wx - T, zc - 0.75, wx, zc + 0.75], y + 2.6, top); zp = zc + 0.75; } col.rect([wx - T, zp, wx, z1], y - 0.7, top); }
  // the vault of the passage (a barrel of dressed stone), ribbed at every 4.5 m, with the portcullis slot
  { const rows = [], N = 12, Ln = z1 - z0, nb = Math.round((Ln - 2 * T) / 4.5);
    const prof = (zz) => { const r = []; for (let i = 0; i <= N; i++) { const dy = archRise(a) * i / N, hw = archHalf(a, dy); r.push([xc - hw, a.spring + dy, zz]); } for (let i = N; i >= 0; i--) { const dy = archRise(a) * i / N, hw = archHalf(a, dy); r.push([xc + hw, a.spring + dy, zz]); } return r; };
    for (let k = 0; k <= nb; k++) rows.push(prof(z0 + T + (Ln - 2 * T) * k / nb));
    const tris = [];
    for (let i = 0; i < rows.length - 1; i++) for (let j = 0; j < rows[i].length - 1; j++) {
      const p = rows[i][j], q = rows[i + 1][j], r2 = rows[i + 1][j + 1], s = rows[i][j + 1];
      for (const t of [[p, q, r2], [p, r2, s]]) { const ux = t[1][0] - t[0][0], uy = t[1][1] - t[0][1], uz = t[1][2] - t[0][2], vx = t[2][0] - t[0][0], vy = t[2][1] - t[0][1], vz = t[2][2] - t[0][2], ny = uz * vx - ux * vz; tris.push(...(ny > 0 ? [...t[0], ...t[2], ...t[1]] : [...t[0], ...t[1], ...t[2]])); }
    }
    bag.add(L, fromTriangles(tris));
    // transverse ribs and the iron portcullis raised in its slot at the north end (its teeth hang in the vault)
    for (let k = 1; k < nb; k++) { const rw = prof(z0 + T + (Ln - 2 * T) * k / nb); for (let i = 0; i < rw.length - 1; i++) bag.add(L, rod([rw[i][0], rw[i][1] - 0.1, rw[i][2]], [rw[i + 1][0], rw[i + 1][1] - 0.1, rw[i + 1][2]], 0.13, 5)); }
    const pz = z0 + T + 0.5;
    for (let u = -hp + 0.4; u < hp - 0.3; u += 0.4) bag.add('iron', rod([xc + u, a.spring + archHalf2(a, Math.abs(u)) - 0.3, pz], [xc + u, a.spring + archHalf2(a, Math.abs(u)) + 0.9, pz], 0.025, 4));
  }
  // the passage's paving: a crown of cobbles, the gutter, worn by wheels; the foot of the walls in a stone kerb
  bag.add('pebbles', box(wx, y - 0.02, z0 + T, ex, y + 0.02, z1 - T));
  bag.add('flagstone', box(xc - 0.25, y + 0.01, z0 + T, xc + 0.25, y + 0.05, z1 - T));
  for (const s of [-1, 1]) bag.add(L, box(xc + s * (hp - 0.3) - 0.3, y, z0 + T, xc + s * (hp - 0.3) + 0.3, y + 0.14, z1 - T));
  // an iron lantern in the vault's middle, and a lit niche
  bag.add('iron', rod([xc, a.spring + archRise(a) - 0.05, (z0 + z1) / 2], [xc, a.spring + archRise(a) - 0.9, (z0 + z1) / 2], 0.015, 4));
  bag.add('glass_lamp', box(xc - 0.1, a.spring + archRise(a) - 1.3, (z0 + z1) / 2 - 0.1, xc + 0.1, a.spring + archRise(a) - 0.9, (z0 + z1) / 2 + 0.1));
  lights.push({ at: [xc, a.spring + archRise(a) - 1.1, (z0 + z1) / 2], color: '#ffc27a', intensity: 2.5, distance: 10 });

  // ── the roofs: the blocks under steep slate roofs along z, behind a crenellated parapet; the bridging block's terrace
  const Wd = (wx - x0), rg = 6.0, R1 = [];
  for (const [xa, xb] of [[x0 - 0.3, wx + 0.1], [ex - 0.1, x1 + 0.3]]) { const R = []; prism(R, [[xa, top - 0.2, z0 - 0.3], [xb, top - 0.2, z0 - 0.3], [(xa + xb) / 2, top + rg, z0 - 0.3]], [0, 0, z1 - z0 + 0.6]); bag.add('slate', fromTriangles(R)); bag.add('lead', rod([(xa + xb) / 2, top + rg + 0.03, z0 - 0.2], [(xa + xb) / 2, top + rg + 0.03, z1 + 0.2], 0.12, 6)); }
  void Wd; void R1;
  bag.add('lead', box(wx, top - 0.3, z0 + T, ex, top - 0.05, z1 - T));
  const M = [];
  for (const zf of [z0, z1 - 0.4]) for (let x = wx + 0.2; x < ex - 0.4; x += 1.2) M.push(...box(x, top - 0.05, zf + 0.2, x + 0.6, top + 0.95, zf + 0.6).attributes.position.array);
  bag.add(L, fromTriangles(M));
  // dormer windows in the roofs' faces and a finial at each ridge's ends
  for (const [xa, xb] of [[x0 - 0.3, wx + 0.1], [ex - 0.1, x1 + 0.3]]) for (const f of [0.25, 0.55, 0.8]) {
    const zz = z0 + (z1 - z0) * f, xm = (xa + xb) / 2;
    for (const s of [-1, 1]) {
      const xs = xm + s * (xb - xa) * 0.27, ys = top - 0.2 + rg * 0.46, D = [], xe = xs + s * 0.5;
      bag.add(L, box(xs - 0.4, ys - 0.5, zz - 0.4, xs + 0.4, ys + 1.0, zz + 0.4));
      bag.add('opening', box(Math.min(xs + s * 0.4, xs + s * 0.46), ys + 0.1, zz - 0.25, Math.max(xs + s * 0.4, xs + s * 0.46), ys + 0.85, zz + 0.25));
      prism(D, [[xe, ys + 1.0, zz - 0.5], [xe, ys + 1.0, zz + 0.5], [xe, ys + 1.55, zz]], [-s * 1.0, 0, 0]);
      bag.add('slate', fromTriangles(D));
    }
  }
  for (const [xm, zz] of [[(x0 + wx) / 2, z0 - 0.2], [(x0 + wx) / 2, z1 + 0.2], [(ex + x1) / 2, z0 - 0.2], [(ex + x1) / 2, z1 + 0.2]]) bag.add('lead', lathe([[0.12, 0], [0.16, 0.3], [0.05, 0.9], [0.001, 1.4]], 6, null, xm, top + rg, zz));

  // ── the towers on the bridge side
  for (const [tx, tz, r, th, roof] of el.towers || []) G().palace_tower({ at: [tx, tz], y, ground: y, r, h: th, roof, face: el.face ?? 0 }, ctx);

  // ── the prévôt's rooms in the west block
  if (court) {
    const ix0 = x0 + T, ix1 = wx - T, zs = el.part ?? (z0 + 15.3);              // the partition between the court and the greffe
    bag.add('flagstone', box(ix0, y - 0.1, z0 + T, ix1, FL, z1 - T));
    col.floor([ix0, z0 + T, ix1, zs - 0.3], FL); col.floor([ix0, zs + 0.3, ix1, z1 - T], FL);
    // the partition with a door; the ceiling on its beams; the mass above
    const pdoor = (ix0 + ix1) / 2;
    bag.add(L, box(ix0, y, zs - 0.3, pdoor - 0.8, y + 5.0, zs + 0.3)); bag.add(L, box(pdoor + 0.8, y, zs - 0.3, ix1, y + 5.0, zs + 0.3)); bag.add(L, box(pdoor - 0.8, y + 2.6, zs - 0.3, pdoor + 0.8, y + 5.0, zs + 0.3));
    col.rect([ix0, zs - 0.3, pdoor - 0.8, zs + 0.3], FL, y + 5.0); col.rect([pdoor + 0.8, zs - 0.3, ix1, zs + 0.3], FL, y + 5.0); col.rect([pdoor - 0.8, zs - 0.3, pdoor + 0.8, zs + 0.3], y + 2.6, y + 5.0);
    bag.add('timber', box(ix0, y + 5.0, z0 + T, ix1, y + 5.3, z1 - T));
    for (let z = z0 + T + 1.0; z < z1 - T; z += 1.6) bag.add('wood_dark', box(ix0, y + 4.6, z - 0.14, ix1, y + 5.0, z + 0.14));
    bag.add('wood_dark', box((ix0 + ix1) / 2 - 0.18, y + 4.3, z0 + T, (ix0 + ix1) / 2 + 0.18, y + 5.0, z1 - T));
    bag.add(L, box(ix0 - 0.1, y + 5.3, z0 + T - 0.1, ix1 + 0.1, top - 0.3, z1 - T + 0.1));
    // the leaves of the doors off the passage, standing open
    for (const zc of doors) bag.add('wood_dark', box(wx - T + 0.05, y + 0.15, zc + 0.75, wx - T + 0.13, y + 2.3, zc + 1.45));
    // ── the auditoire: the prévôt's dais at the north end under a cloth of estate, the bar, the benches, the desks of the clerks
    const dxm = (ix0 + ix1) / 2, zn = z0 + T;
    bag.add(L, box(ix0 + 0.8, FL, zn, ix1 - 0.8, FL + 0.28, zn + 3.4));
    bag.add(L, box(ix0 + 1.0, FL + 0.28, zn, ix1 - 1.0, FL + 0.5, zn + 2.6));
    col.rect([ix0 + 0.8, zn, ix1 - 0.8, zn + 3.4], FL, FL + 0.28); col.floor([ix0 + 0.8, zn, ix1 - 0.8, zn + 3.4], FL + 0.28); col.rect([ix0 + 1.0, zn, ix1 - 1.0, zn + 2.6], FL + 0.28, FL + 0.5); col.floor([ix0 + 1.0, zn, ix1 - 1.0, zn + 2.6], FL + 0.5);
    bag.add('cloth_red', box(ix0 + 1.2, FL + 0.5, zn + 0.5, ix1 - 1.2, FL + 0.52, zn + 2.4));
    // the prévôt's bench: a long seat with a high panelled back, the chair at its middle taller, with a gabled top
    bag.add('wood_dark', box(ix0 + 1.3, FL + 0.5, zn + 0.1, ix1 - 1.3, FL + 1.0, zn + 0.75)); bag.add('cloth_red', box(ix0 + 1.35, FL + 1.0, zn + 0.15, ix1 - 1.35, FL + 1.06, zn + 0.7));
    bag.add('wood_dark', box(ix0 + 1.3, FL + 1.0, zn + 0.08, ix1 - 1.3, FL + 2.9, zn + 0.2));
    for (let x = ix0 + 1.5; x < ix1 - 1.4; x += 0.7) bag.add('timber', box(x, FL + 1.1, zn + 0.2, x + 0.05, FL + 2.7, zn + 0.24));
    { const g = []; prism(g, [[dxm - 0.8, FL + 2.9, zn + 0.08], [dxm + 0.8, FL + 2.9, zn + 0.08], [dxm, FL + 3.8, zn + 0.08]], [0, 0, 0.14]); bag.add('gold', fromTriangles(g)); }
    col.rect([ix0 + 1.3, zn + 0.05, ix1 - 1.3, zn + 0.8], FL + 0.5, FL + 3.0);
    // the cloth of estate on the wall: blue with gilt fleurs-de-lis; above it a crucifix
    bag.add('paint_fleur', box(ix0 + 1.2, FL + 1.2, zn - 0.04, ix1 - 1.2, FL + 4.2, zn)); bag.add('gold', box(ix0 + 1.2, FL + 4.2, zn - 0.06, ix1 - 1.2, FL + 4.3, zn)); bag.add('gold', box(ix0 + 1.2, FL + 1.1, zn - 0.06, ix1 - 1.2, FL + 1.2, zn));
    bag.add('wood_dark', box(dxm - 0.05, FL + 4.45, zn - 0.05, dxm + 0.05, FL + 5.0, zn)); bag.add('wood_dark', box(dxm - 0.28, FL + 4.8, zn - 0.05, dxm + 0.28, FL + 4.9, zn));
    // the clerks' tables below the dais, and the accused's stool; the bar (a rail of turned posts) across the room, a gap for the door
    for (const s of [-1, 1]) {
      const cx = dxm + s * 1.9, cz = zn + 4.3;
      bag.add('wood_dark', box(cx - 0.9, FL + 0.74, cz - 0.45, cx + 0.9, FL + 0.8, cz + 0.45));
      for (const a2 of [-0.8, 0.8]) for (const b of [-0.35, 0.35]) bag.add('wood_dark', box(cx + a2 - 0.04, FL, cz + b - 0.04, cx + a2 + 0.04, FL + 0.74, cz + b + 0.04));
      bag.add('cloth_green', box(cx - 0.8, FL + 0.8, cz - 0.4, cx + 0.8, FL + 0.82, cz + 0.4));
      bag.add('ivory', box(cx - 0.5, FL + 0.82, cz - 0.25, cx - 0.1, FL + 0.84, cz + 0.2)); bag.add('ivory', box(cx + 0.1, FL + 0.82, cz - 0.2, cx + 0.45, FL + 0.835, cz + 0.2));
      bag.add('iron', lathe([[0.001, 0], [0.03, 0.01], [0.03, 0.07], [0.001, 0.07]], 6, null, cx + 0.7, FL + 0.82, cz - 0.2));
      for (const b of [-0.4, 0.4]) bag.add('timber', box(cx - 0.4, FL, cz + b * 2.1 - 0.17 + 0.0, cx + 0.4, FL + 0.46, cz + b * 2.1 + 0.17));
      col.rect([cx - 0.95, cz - 1.2, cx + 0.95, cz + 1.2], FL, FL + 0.9);
    }
    { const bz = zn + 6.6;
      bag.add('wood_dark', box(ix0 + 0.05, FL + 0.95, bz - 0.05, dxm - 1.0, FL + 1.05, bz + 0.05)); bag.add('wood_dark', box(dxm + 1.0, FL + 0.95, bz - 0.05, ix1 - 0.05, FL + 1.05, bz + 0.05));
      for (let x = ix0 + 0.1; x < ix1; x += 0.45) { if (x > dxm - 1.1 && x < dxm + 1.1) continue; bag.add('wood_dark', lathe([[0.04, 0], [0.04, 0.9], [0.06, 1.0]], 6, null, x, FL, bz)); }
      col.rect([ix0, bz - 0.06, dxm - 1.0, bz + 0.06], FL, FL + 1.05); col.rect([dxm + 1.0, bz - 0.06, ix1, bz + 0.06], FL, FL + 1.05);
      bag.add('wood_dark', box(dxm - 0.25, FL, bz - 1.8, dxm + 0.25, FL + 0.45, bz - 1.3));                              // the accused's stool, before the prévôt
      for (let r = 0; r < 4; r++) for (const s of [-1, 1]) { const bx = dxm + s * 2.6; bag.add('timber', box(bx - 1.1, FL + 0.4, bz + 1.1 + r * 1.2, bx + 1.1, FL + 0.45, bz + 1.1 + r * 1.2 + 0.4)); for (const q of [-0.9, 0.9]) bag.add('wood_dark', box(bx + q - 0.04, FL, bz + 1.15 + r * 1.2, bx + q + 0.04, FL + 0.4, bz + 1.15 + r * 1.2 + 0.36)); col.rect([bx - 1.1, bz + 1.1 + r * 1.2, bx + 1.1, bz + 1.5 + r * 1.2], FL, FL + 0.5); }
    }
    // the stove: a brazier by the west wall; the corona of candles over the bar
    bag.add('iron', lathe([[0.001, 0.4], [0.3, 0.5], [0.42, 0.72], [0.38, 0.76], [0.001, 0.62]], 10, null, ix0 + 0.9, FL, zn + 9.8)); bag.add('flame', lathe([[0.001, 0.7], [0.3, 0.72], [0.001, 0.78]], 8, null, ix0 + 0.9, FL, zn + 9.8)); col.circle(ix0 + 0.9, zn + 9.8, 0.45, FL, FL + 0.8);
    { const cy = y + 4.5, cz = zn + 6.0, N = 12, r = 0.9;
      for (let i = 0; i < N; i++) { const a1 = i / N * Math.PI * 2, b1 = (i + 1) / N * Math.PI * 2; bag.add('iron', rod([dxm + Math.cos(a1) * r, cy - 1.4, cz + Math.sin(a1) * r], [dxm + Math.cos(b1) * r, cy - 1.4, cz + Math.sin(b1) * r], 0.035, 4)); bag.add('ivory', lathe([[0.035, 0], [0.035, 0.22], [0.001, 0.22]], 6, null, dxm + Math.cos(a1) * r, cy - 1.36, cz + Math.sin(a1) * r)); bag.add('flame', lathe([[0.001, 0], [0.02, 0.04], [0.001, 0.1]], 5, null, dxm + Math.cos(a1) * r, cy - 1.14, cz + Math.sin(a1) * r)); }
      bag.add('iron', rod([dxm, cy - 0.4, cz], [dxm, cy, cz], 0.02, 4));
      for (const q of [0, Math.PI / 2, Math.PI, 3 * Math.PI / 2]) bag.add('iron', rod([dxm + Math.cos(q) * r, cy - 1.4, cz + Math.sin(q) * r], [dxm, cy - 0.4, cz], 0.015, 4));
      lights.push({ at: [dxm, cy - 1.1, cz], color: '#ffc27a', intensity: 3, distance: 11 }); }
    // ── the greffe: shelves of registers along the walls, a table with the clerks' stools, a strongbox, a lectern
    const gz0 = zs + 0.3, gz1 = z1 - T, gx = (ix0 + ix1) / 2;
    for (const [xs, s] of [[ix0, 1], [ix1, -1]]) {
      for (let k = 0; k < 4; k++) { const yy = FL + 0.4 + k * 0.5; bag.add('wood_dark', box(Math.min(xs, xs + s * 0.4), yy, gz0 + 1.2, Math.max(xs, xs + s * 0.4), yy + 0.05, gz1 - 1.0));
        for (let z = gz0 + 1.3; z < gz1 - 1.2; z += 0.17) bag.add(['hide_brown', 'hide_tan', 'cloth_red', 'hide_grey'][Math.floor(((z * 31 + k * 7) % 4 + 4) % 4)], box(Math.min(xs + s * 0.03, xs + s * 0.34), yy + 0.05, z, Math.max(xs + s * 0.03, xs + s * 0.34), yy + 0.4 - (k % 2) * 0.05, z + 0.12)); }
      bag.add('wood_dark', box(Math.min(xs, xs + s * 0.4), FL, gz0 + 1.2, Math.max(xs, xs + s * 0.4), FL + 0.4, gz1 - 1.0));
      col.rect([Math.min(xs, xs + s * 0.4), gz0 + 1.2, Math.max(xs, xs + s * 0.4), gz1 - 1.0], FL, FL + 2.4);
    }
    tableAt(bag, col, gx - 3, gx + 3, (gz0 + gz1) / 2 + 0.3, () => 0.3, FL);
    bag.add('wood_dark', box(gx - 1.3, FL, gz0 + 1.5, gx - 0.5, FL + 0.9, gz0 + 2.1)); col.rect([gx - 1.3, gz0 + 1.5, gx - 0.5, gz0 + 2.1], FL, FL + 0.95);       // the lectern's chest
    bag.add('iron', box(gx + 0.7, FL, gz1 - 1.6, gx + 1.5, FL + 0.7, gz1 - 0.9)); bag.add('wood_dark', box(gx + 0.68, FL + 0.7, gz1 - 1.62, gx + 1.52, FL + 0.8, gz1 - 0.88)); col.rect([gx + 0.7, gz1 - 1.6, gx + 1.5, gz1 - 0.9], FL, FL + 0.8);   // the strongbox
    { const cy = y + 4.5, cz = (gz0 + gz1) / 2 + 0.3; bag.add('iron', rod([gx, cy, cz], [gx, cy - 1.2, cz], 0.015, 4)); bag.add('glass_lamp', box(gx - 0.1, cy - 1.6, cz - 0.1, gx + 0.1, cy - 1.2, cz + 0.1)); lights.push({ at: [gx, cy - 1.4, cz], color: '#ffc27a', intensity: 2.4, distance: 8 }); }
  }
  // the foundation's rect (the ground floor of the east block and the court's footprint are already solid); the rooms' floors are above
  col.rect([x0, z0, wx, z1], y - 0.7, y - 0.25);
}
const archHalf2 = (a, hw) => { let lo = 0, hi = archRise(a); for (let i = 0; i < 24; i++) { const mid = (lo + hi) / 2; if (archHalf(a, mid) > hw) lo = mid; else hi = mid; } return hi; };

STYLES.gothic.elements.chatelet = chatelet;
