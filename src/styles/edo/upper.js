// The upper floor of the enterable machiya (docs/settlements/edo-himeji.md §5.8): the steep chest-stair (kaidan-dansu) climbing
// from the room behind the shop, the opening in the floor above it with its rails, the front room over the shop with its slatted
// windows (or its balcony with a railing over the street), the room behind, the ceiling of boards under the tiled roof; furnished by
// use — a merchant's house, a shop with the family's rooms, a craftsman's workroom, a storehouse floor, a tenement let to lodgers,
// a teahouse's guest rooms. Drawn in the house's own frame (u along the front, q in from the street); only for houses that carry `up`.
import { box, frustum, lathe, rod } from '../../core/geom.js';
import { subtractRects } from '../../core/build.js';
import { tatami } from './rooms.js';
import { barrel, chochin } from './town.js';

const PL = 'plaster_castle', WD = 'wood_dark', TL = 'tile_grey', TB = 'timber';
const hs = (...a) => { let h = 2166136261; for (const v of a) { h ^= Math.round(v * 1000) | 0; h = Math.imul(h, 16777619); } return ((h >>> 0) % 10000) / 10000; };

/** The house's upper-floor plan as pure data (the same in the style, the settlement's walks and its rooms); null where the lot is too shallow. */
export function upPlan(el, r, H1, H2) {
  const [x0, , x1] = r, f = el.front || 's', s = f === 's' ? 1 : -1, fz = f === 's' ? r[3] : r[1], dep = Math.abs(r[3] - r[1]);
  if (dep < 9.5 || x1 - x0 < 5.4) return null;
  const t = 0.15, tf = 0.22, ua = x0 + t, ub = x1 - t, qb = dep - t, du = ua + 1.55, qm = Math.min(4.6, dep * 0.45), fl = 0.45;
  const Yf = H1 + 0.05, Yc = H1 + H2 - 0.12, N = 12, q0 = qm + 1.0, q1 = q0 + 2.88;
  const uB = ub - 0.4, uA = uB - 1.2, kind = el.up;
  return { kind, f, s, fz, dep, x0, x1, t, tf, ua, ub, qb, du, qm, fl, H1, H2, Yf, Yc, N, q0, q1, uA, uB, W: ub - ua,
    hole: [uA - 0.4, ub, q0 + 0.55, q1], balcony: kind === 'inn' || kind === 'merchant', door: [ua + 0.45, ua + 1.45],
    Z: (q) => fz - s * q, dir: s > 0 ? 'n' : 's' };
}

/** A walk from the street to a window of the front room, as world waypoints. */
export function upRoute(P) {
  const { Z, ua, ub, uA, uB, qm, q0, q1, door, W } = P, uc = (uA + uB) / 2, ud = (door[0] + door[1]) / 2, uw = ua + W * 0.4;
  return [[ua + 0.8, Z(-3)], [ua + 0.8, Z(2.0)], [ua + 0.8, Z(qm + 0.7)], [uc, Z(qm + 0.7)], [uc, Z(q0 + 1.0)], [uc, Z(q1 + 0.5)], [ud, Z(q1 + 0.5)], [ud, Z(qm - 0.5)], [uw, Z(2.2)], [uw, Z(1.0)]].map(([x, z]) => [x, z]);
}
/** The rooms of the floor (rect, y) for the plan's room list. */
export function upRooms(P) {
  const { ua, ub, tf, qm, qb, Z, Yf } = P, R = (u0, u1, q0, q1) => [u0, Math.min(Z(q0), Z(q1)), u1, Math.max(Z(q0), Z(q1))];
  return [{ rect: R(ua + 0.3, ub - 0.3, tf + 0.3, qm - 0.3), y: Yf }, { rect: R(ua + 0.3, ub - 0.3, qm + 0.4, qb - 0.3), y: Yf }];
}

/** Builds the stair, the walls, floor, rooms and furnishings above the ground storey. { bag, col } the settlement tile's own. */
export function buildUp(el, { bag, col }, P) {
  const { s, Z, x0, x1, ua, ub, tf, qb, du, qm, fl, H1, H2, Yf, Yc, N, q0, q1, uA, uB, hole, kind, dep, W } = P;
  const rect = (u0, u1, a, b) => [Math.min(u0, u1), Math.min(Z(a), Z(b)), Math.max(u0, u1), Math.max(Z(a), Z(b))];
  const B = (m, u0, u1, v0, v1, a, b) => { const r = rect(u0, u1, a, b); bag.add(m, box(r[0], Math.min(v0, v1), r[1], r[2], Math.max(v0, v1), r[3])); };
  const BN = (m, u0, u1, v0, v1, a, b) => { const r = rect(u0, u1, a, b); bag.add(m, frustum(r, Math.min(v0, v1), Math.max(v0, v1), 0, 0, 0, 0, { noTop: true })); };
  const C = (u0, u1, a, b, v0, v1) => col.rect(rect(u0, u1, a, b), v0, v1);
  const L = (m, prof, seg, u, v, q) => bag.add(m, lathe(prof, seg, null, u, v, Z(q)));
  const Rod = (m, a, b, r) => bag.add(m, rod([a[0], a[1], Z(a[2])], [b[0], b[1], Z(b[2])], r, 6));
  const seed = hs(x0, P.fz);

  // ---- the chest-stair from the room behind the shop up to the floor above: closed steps (the mass is the stair), drawers in its open side
  const rise = (Yf - fl) / N, run = (q1 - q0) / N;
  for (let k = 0; k < N; k++) {
    const top = fl + (k + 1) * rise, qa = q0 + k * run, qe = qa + run;
    B(WD, uA, ub, fl, top - 0.04, qa, qe + 0.004); B(TB, uA, uB, top - 0.04, top, qa - 0.015, qe + 0.004);
    if ((k + (seed > 0.5 ? 1 : 0)) % 2 === 0 && k < N - 1) { B('lacquer_black', uA - 0.09, uA - 0.06, top - 0.2, top - 0.06, qa + 0.02, qe - 0.02); B('iron', uA - 0.1, uA - 0.09, top - 0.15, top - 0.11, qa + 0.09, qa + 0.15); }
  }
  B(WD, uA - 0.06, uA, fl, Yf - 0.04, q0, q1 + 0.0);                                           // the stringer on the open side
  col.ramp(rect(uA, uB, q0, q1), fl, Yf, P.dir);
  C(uA - 0.06, uA, q0, q1, fl, Yf); C(uB, ub, q0, q1, fl, Yf);                                  // the closed mass of the stair beside the way
  // ---- the walls above the shop: plaster on a timber band, the front with its windows or its balcony door
  const wall = (u0, u1, a, b) => { B(PL, u0, u1, H1, H1 + H2, a, b); C(u0, u1, a, b, H1, H1 + H2); };
  wall(x0, ua, 0, dep); wall(ub, x1, 0, dep);
  const wins = [], nW = W > 7.2 ? 3 : 2, ww = Math.min(1.5, W / nW - 1.1);
  for (let i = 0; i < nW; i++) { const c = x0 + (x1 - x0) * (i + 0.5) / nW; if (P.balcony && i === Math.floor(nW / 2) && nW === 3) continue; wins.push({ a: c - ww / 2, b: c + ww / 2, sill: Yf + 0.7, head: Yf + 1.65 }); }
  const xc = (x0 + x1) / 2, door = P.balcony ? { a: xc - 1.0, b: xc + 1.0, sill: Yf, head: Yf + 1.95, pass: true } : null;
  if (door) { // two windows beside the door
    wins.length = 0; const c1 = x0 + (xc - 1.0 - x0) / 2, c2 = x1 - (x1 - xc - 1.0) / 2, w2 = Math.min(1.3, (xc - 1.0 - x0) - 0.7);
    wins.push({ a: c1 - w2 / 2, b: c1 + w2 / 2, sill: Yf + 0.7, head: Yf + 1.65 }, { a: c2 - w2 / 2, b: c2 + w2 / 2, sill: Yf + 0.7, head: Yf + 1.65 });
  }
  const openings = [...wins, ...(door ? [door] : [])].sort((p, q) => p.a - q.a);
  { let u = x0;
    const seg = (a, b) => { if (b - a > 0.01) { B(PL, a, b, H1, H1 + H2, 0, tf); C(a, b, 0, tf, H1, H1 + H2); } };
    for (const o of openings) {
      seg(u, o.a); u = o.b;
      if (o.sill > H1 + 0.001) { B(PL, o.a, o.b, H1, o.sill, 0, tf); if (!o.pass) C(o.a, o.b, 0, tf, H1, o.sill); }
      B(PL, o.a, o.b, o.head, H1 + H2, 0, tf);
      if (!o.pass) C(o.a, o.b, 0, tf, o.sill, o.head);
      B(WD, o.a, o.b, o.head - 0.12, o.head, 0, tf + 0.02);                                        // the lintel board
      if (o.pass) { B(WD, o.a - 0.07, o.a, Yf, o.head, 0, tf + 0.02); B(WD, o.b, o.b + 0.07, Yf, o.head, 0, tf + 0.02); B(WD, o.a, o.b, Yf - 0.05, Yf, 0, tf); continue; }
      // a window: the plastered frame and the slats standing before the open reveal, the sill board, one paper door slid half across inside
      const k = Math.max(5, Math.round((o.b - o.a) / 0.14));
      for (let j = 0; j < k; j++) { const u2 = o.a + (j + 0.5) * (o.b - o.a) / k; B('koshi', u2 - 0.022, u2 + 0.022, o.sill, o.head, -0.09, -0.02); }
      B(PL, o.a - 0.14, o.b + 0.14, o.head, o.head + 0.14, -0.13, 0); B(PL, o.a - 0.17, o.b + 0.17, o.sill - 0.12, o.sill, -0.15, 0);
      B(PL, o.a - 0.14, o.a, o.sill, o.head, -0.13, 0); B(PL, o.b, o.b + 0.14, o.sill, o.head, -0.13, 0); B(TL, o.a - 0.2, o.b + 0.2, o.sill - 0.16, o.sill - 0.12, -0.17, 0);
      B(WD, o.a, o.b, o.sill, o.sill + 0.04, 0, tf + 0.02);
      B('shoji', o.a + 0.02, (o.a + o.b) / 2 + 0.05, o.sill + 0.04, o.head - 0.12, tf - 0.06, tf - 0.03); B(WD, o.a, o.b, o.sill + 0.04, o.sill + 0.07, tf - 0.07, tf - 0.02);
    }
    seg(u, x1);
  }
  // the back wall with one window onto the yard behind
  { const bw = { a: xc - 0.6, b: xc + 0.6, sill: Yf + 0.8, head: Yf + 1.7 };
    B(PL, ua, bw.a, H1, H1 + H2, qb, dep); B(PL, bw.b, ub, H1, H1 + H2, qb, dep); B(PL, bw.a, bw.b, H1, bw.sill, qb, dep); B(PL, bw.a, bw.b, bw.head, H1 + H2, qb, dep);
    C(ua, ub, qb, dep, H1, H1 + H2); B(WD, bw.a, bw.b, bw.sill, bw.sill + 0.04, qb - 0.02, dep); B(WD, bw.a, bw.b, bw.head - 0.1, bw.head, qb - 0.02, dep);
    for (let j = 0; j < 4; j++) B('koshi', bw.a + 0.1 + j * 0.33, bw.a + 0.14 + j * 0.33, bw.sill, bw.head, dep - 0.05, dep - 0.02); }
  // a wooden band (nageshi) round the room at head height
  for (const [u0, u1, a, b] of [[ua, ua + 0.03, tf, qb], [ub - 0.03, ub, tf, qb]]) B(WD, u0, u1, Yf + 1.8, Yf + 1.9, a, b);
  B(WD, ua, ub, Yf + 1.8, Yf + 1.9, qb - 0.03, qb); B(WD, ua, ub, Yf + 1.8, Yf + 1.9, tf, tf + 0.03);

  // ---- the ceiling of boards with its battens and cross beams; the floor: boards under the mats, the stair's opening, the partition
  B(TB, ua, ub, Yc - 0.06, Yc, tf, qb);
  for (let q = tf + 0.5; q < qb - 0.2; q += 0.9) B(WD, ua, ub, Yc - 0.1, Yc - 0.06, q - 0.03, q + 0.03);
  for (const q of [qm, qm + 3.2]) B(WD, ua, ub, Yc - 0.28, Yc - 0.06, q - 0.08, q + 0.08);
  const frontR = rect(ua, ub, tf, qm), backR = rect(ua, ub, qm + 0.05, qb), holeR = rect(hole[0], hole[1], hole[2], hole[3]);
  const back = subtractRects(backR, [holeR]);
  const matsFront = !(kind === 'craft' || kind === 'store' || kind === 'dwelling'), matsBack = kind !== 'store' && kind !== 'craft';
  col.floor(frontR, Yf); col.floor(rect(ua, ub, qm, qm + 0.05), Yf); bag.add(TB, box(ua, H1, rect(ua, ub, qm, qm + 0.05)[1], ub, Yf, rect(ua, ub, qm, qm + 0.05)[3]));
  const mats = (r) => { const [x_0, z_0, x_1, z_1] = r; tatami((m, u0, u1, v0, v1, a, b) => bag.add(m, box(Math.min(u0, u1), v0, Math.min(a, b), Math.max(u0, u1), v1, Math.max(a, b))), x_0 + 0.02, x_1 - 0.02, z_0 + 0.02, z_1 - 0.02, Yf); };
  const boards = (r) => bag.add(TB, box(r[0], H1, r[1], r[2], Yf, r[3]));
  (matsFront ? mats : boards)(frontR);
  for (const r of back) { col.floor(r, Yf); if (r[2] - r[0] > 0.5 && r[3] - r[1] > 0.5) (matsBack ? mats : boards)(r); }
  // the opening's rails on its three open sides (no top faces: one cannot stand on a rail), a trim round the edge
  const rail = (u0, u1, a, b) => {
    const along = Math.abs(u1 - u0) >= Math.abs(b - a), n = Math.max(1, Math.round((along ? u1 - u0 : b - a) / 1.1));
    BN(WD, u0 - 0.03, u1 + 0.03, Yf + 0.9, Yf + 0.96, a - 0.03, b + 0.03); BN(WD, u0 - 0.02, u1 + 0.02, Yf + 0.42, Yf + 0.46, a - 0.02, b + 0.02);
    B('koshi', u0 - 0.012, u1 + 0.012, Yf + 0.46, Yf + 0.9, a - 0.012, b + 0.012);
    for (let i = 0; i <= n; i++) { const u = along ? u0 + (u1 - u0) * i / n : u0, q = along ? a : a + (b - a) * i / n; B(WD, u - 0.04, u + 0.04, Yf, Yf + 1.0, q - 0.04, q + 0.04); }
    C(u0 - 0.04, u1 + 0.04, a - 0.04, b + 0.04, Yf, Yf + 1.0);
  };
  rail(hole[0], hole[1], hole[2], hole[2]); rail(hole[0], hole[0], hole[2], hole[3]);
  // the partition between the rooms: paper doors (fusuma) on a post-and-lintel frame, a doorway left open
  { const [d0, d1] = P.door, qp = qm + 0.025;
    for (const [a, b] of [[ua, d0], [d1, ub]]) {
      const n = Math.max(1, Math.round((b - a) / 0.9)), w = (b - a) / n;
      for (let i = 0; i < n; i++) B('shoji', a + i * w + 0.02, a + (i + 1) * w - 0.02, Yf + 0.06, Yf + 1.8, qp - 0.015, qp + 0.015);
      for (let i = 0; i <= n; i++) B(WD, a + i * w - 0.025, a + i * w + 0.025, Yf, Yf + 1.95, qp - 0.04, qp + 0.04);
      C(a, b, qp - 0.04, qp + 0.04, Yf, Yc);
    }
    B(WD, ua, ub, Yf + 1.8, Yf + 1.95, qp - 0.05, qp + 0.05); B('shoji', ua, ub, Yf + 1.95, Yc - 0.06, qp - 0.012, qp + 0.012); }

  // ---- things of the rooms (one hash of the house's own place chooses colours and sides)
  const q = { ucx: (ua + ub) / 2, e: ub, w: ua };
  const cush = (u, a, c = 'cloth_indigo') => B(c, u - 0.28, u + 0.28, Yf, Yf + 0.06, a - 0.28, a + 0.28);
  const table = (u, a, du2, dq, h = 0.3) => { B('lacquer_black', u - du2, u + du2, Yf + h - 0.05, Yf + h, a - dq, a + dq); for (const sx of [-1, 1]) for (const sz of [-1, 1]) B(WD, u + sx * (du2 - 0.06) - 0.03, u + sx * (du2 - 0.06) + 0.03, Yf, Yf + h - 0.05, a + sz * (dq - 0.06) - 0.03, a + sz * (dq - 0.06) + 0.03); C(u - du2, u + du2, a - dq, a + dq, Yf, Yf + h); };
  const tea = (u, v, a) => { L('pottery_dark', [[0.001, 0], [0.07, 0.0], [0.1, 0.08], [0.08, 0.15], [0.03, 0.17], [0.001, 0.17]], 8, u, v, a); for (const d of [-0.2, 0.2]) L('glaze_white', [[0.001, 0], [0.035, 0], [0.05, 0.05], [0.001, 0.05]], 8, u + d, v, a + 0.12); };
  const futon = (u, a, len = 1.9, w = 0.85, c = 'cloth_indigo') => { B('cloth_white', u - w / 2, u + w / 2, Yf, Yf + 0.07, a, a + len); B(c, u - w / 2 - 0.01, u + w / 2 + 0.01, Yf + 0.07, Yf + 0.11, a + 0.45, a + len - 0.03); B(TB, u - 0.13, u + 0.13, Yf + 0.07, Yf + 0.17, a + 0.06, a + 0.3); };
  const tansu = (u0, u1, a, b, h, face) => {   // face: 'w' toward low u, 'e' toward high u, 'n' toward the street (low q), 'b' toward the back
    B(WD, u0, u1, Yf, Yf + h, a, b); C(u0, u1, a, b, Yf, Yf + h);
    const rows = Math.max(2, Math.round(h / 0.3)), alongU = face === 'n' || face === 'b';
    for (let r2 = 0; r2 < rows; r2++) { const v = Yf + 0.12 + r2 * (h - 0.2) / rows;
      if (alongU) { const f = face === 'n' ? a : b, sg = face === 'n' ? -1 : 1; for (let u = u0 + 0.2; u < u1 - 0.15; u += 0.38) B('iron', u, u + 0.1, v, v + 0.05, f + (sg < 0 ? -0.025 : 0), f + (sg < 0 ? 0 : 0.025)); }
      else { const f = face === 'w' ? u0 : u1; for (let m = a + 0.2; m < b - 0.15; m += 0.38) B('iron', face === 'w' ? f - 0.025 : f, face === 'w' ? f : f + 0.025, v, v + 0.05, m, m + 0.1); }
      void r2; }
  };
  const andon = (u, a) => { B(WD, u - 0.16, u + 0.16, Yf, Yf + 0.04, a - 0.16, a + 0.16); B('shoji', u - 0.13, u + 0.13, Yf + 0.04, Yf + 0.52, a - 0.13, a + 0.13); for (const [du2, dq] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) B(WD, u + du2 * 0.13 - 0.015, u + du2 * 0.13 + 0.015, Yf + 0.04, Yf + 0.52, a + dq * 0.13 - 0.015, a + dq * 0.13 + 0.015); B(WD, u - 0.16, u + 0.16, Yf + 0.52, Yf + 0.56, a - 0.16, a + 0.16); C(u - 0.16, u + 0.16, a - 0.16, a + 0.16, Yf, Yf + 0.56); };
  const screen = (u0, u1, a, n = 4, h = 1.5) => { const w = (u1 - u0) / n; for (let i = 0; i < n; i++) B('wood_painted', u0 + i * w + 0.01, u0 + (i + 1) * w - 0.01, Yf, Yf + h, a + (i % 2 ? 0.12 : -0.12) - 0.015, a + (i % 2 ? 0.12 : -0.12) + 0.015); C(u0, u1, a - 0.15, a + 0.15, Yf, Yf + h); };
  const jar = (u, a, r = 0.22, v = Yf) => { L('pottery_dark', [[0.001, 0], [r * 0.8, 0.02], [r * 1.25, r * 1.1], [r * 1.1, r * 2.2], [r * 0.7, r * 2.7], [r * 0.75, r * 2.9], [0.001, r * 2.9]], 10, u, v, a); C(u - r, u + r, a - r, a + r, v, v + r * 2.9); };
  const pole = (a, v, u0, u1) => { Rod(WD, [u0, v, a], [u1, v, a], 0.035); };
  const lamp = (u, v, a) => chochin({ add: (m, g) => bag.add(m, g) }, u, v, Z(a), 0.15, 0.4);
  const ueast = ub - 0.35, uwest = ua + 0.35;
  const front = { u0: ua, u1: ub };
  void front;

  if (kind === 'merchant' || kind === 'inn') {
    // the guest room over the shop: low tables with the tea things, cushions, a screen, the scroll on the party wall over its low chest
    const tu = q.ucx + 0.9, ta = 2.6;
    table(tu, ta, 0.55, 0.4); tea(tu, Yf + 0.3, ta - 0.1);
    for (const [du2, dq] of [[-0.95, 0], [0.95, 0], [0, -0.75], [0, 0.75]]) cush(tu + du2, ta + dq);
    B('cloth_white', ub - 0.025, ub, Yf + 0.55, Yf + 1.75, 1.7, 2.5); B('cloth_indigo', ub - 0.03, ub - 0.025, Yf + 0.5, Yf + 1.8, 1.65, 2.55);
    B(WD, ub - 0.4, ub - 0.025, Yf, Yf + 0.42, 1.5, 2.7); C(ub - 0.4, ub - 0.025, 1.5, 2.7, Yf, Yf + 0.42); jar(ub - 0.22, 2.1, 0.09, Yf + 0.42);
    if (kind === 'inn') { screen(ub - 1.9, ub - 0.5, qm - 0.4); for (const k of [0, 1, 2]) L('glaze_white', [[0.001, 0], [0.04, 0], [0.05, 0.1], [0.025, 0.2], [0.02, 0.24], [0.001, 0.24]], 8, tu - 0.15 + k * 0.15, Yf + 0.3, ta + 0.3); }
    else { tansu(ub - 0.5, ub - 0.02, qm - 1.3, qm - 0.3, 1.15, 'w'); andon(uwest + 0.1, 1.0); }
    // the room behind: bedding laid out, a chest of drawers, a screen at the heads, a paper lamp
    if (kind === 'inn') {   // two small guest rooms side by side behind a paper wall, each with its futon
      const qa = q1 + 0.1, um = q.ucx; B('shoji', um - 0.02, um + 0.02, Yf + 0.06, Yf + 1.8, qa + 1.0, qb - 0.04); B(WD, um - 0.04, um + 0.04, Yf, Yf + 1.95, qa + 1.0 - 0.04, qa + 1.0 + 0.04); B(WD, um - 0.04, um + 0.04, Yf, Yf + 1.95, qb - 0.08, qb); B(WD, um - 0.04, um + 0.04, Yf + 1.8, Yf + 1.95, qa + 1.0, qb); C(um - 0.04, um + 0.04, qa + 1.0, qb, Yf, Yc);
      futon(um - 1.1, qb - 2.0); futon(um + 1.1 + (seed > 0.5 ? 0 : 0.3), qb - 2.0, 1.9, 0.85, 'cloth_black'); andon(um - 2.0 > ua + 0.3 ? um - 2.0 : ua + 0.4, qb - 0.5); tansu(ub - 0.5, ub - 0.02, qb - 1.2, qb - 0.2, 0.9, 'w');
    } else {
      futon(ua + 1.0, qb - 2.0); futon(ua + 2.0, qb - 2.0, 1.9, 0.85, 'cloth_black'); screen(ua + 0.5, ua + 2.5, qb - 0.2, 4, 1.4); tansu(ub - 1.9, ub - 0.3, qb - 0.55, qb - 0.05, 1.2, 'n'); andon(ua + 3.0, qb - 1.0);
    }
  } else if (kind === 'dwelling') {
    // the family's front room over the apothecary's shop: the sunken hearth with its hanging kettle, drug chests, jars, herbs drying under the ceiling beam
    const hu = q.ucx + 0.4, ha = 2.3;
    for (const [a0, a1, b0, b1] of [[hu - 0.6, hu + 0.6, ha - 0.6, ha - 0.5], [hu - 0.6, hu + 0.6, ha + 0.5, ha + 0.6], [hu - 0.6, hu - 0.5, ha - 0.5, ha + 0.5], [hu + 0.5, hu + 0.6, ha - 0.5, ha + 0.5]]) B(WD, a0, a1, Yf, Yf + 0.05, b0, b1);
    B('plaster_grey', hu - 0.5, hu + 0.5, Yf, Yf + 0.03, ha - 0.5, ha + 0.5); B('iron', hu - 0.14, hu + 0.14, Yf + 0.03, Yf + 0.07, ha - 0.14, ha + 0.14);
    Rod('iron', [hu, Yc - 0.28, ha], [hu, Yf + 0.62, ha], 0.012); L('iron', [[0.001, 0], [0.12, 0.02], [0.15, 0.1], [0.1, 0.18], [0.001, 0.2]], 10, hu, Yf + 0.4, ha);
    for (const [du2, dq] of [[-0.95, 0], [0.95, 0.1], [0, 0.9]]) cush(hu + du2, ha + dq);
    B(WD, ub - 0.5, ub - 0.02, Yf, Yf + 1.8, 0.8, qm - 0.3); C(ub - 0.5, ub - 0.02, 0.8, qm - 0.3, Yf, Yf + 1.8);
    for (let r2 = 0; r2 < 8; r2++) for (let c2 = 0; c2 < 5; c2++) { const a = 0.9 + c2 * ((qm - 0.5 - 0.9) / 5), b = a + (qm - 0.5 - 0.9) / 5 - 0.04; B('lacquer_black', ub - 0.53, ub - 0.5, Yf + 0.08 + r2 * 0.21, Yf + 0.26 + r2 * 0.21, a, b); B('iron', ub - 0.54, ub - 0.53, Yf + 0.14 + r2 * 0.21, Yf + 0.18 + r2 * 0.21, (a + b) / 2 - 0.03, (a + b) / 2 + 0.03); }
    B(WD, ua, ua + 0.3, Yf + 1.2, Yf + 1.25, 1.0, 3.0); for (let k = 0; k < 4; k++) L('glaze_white', [[0.001, 0], [0.06, 0], [0.08, 0.08], [0.05, 0.16], [0.001, 0.16]], 8, ua + 0.15, Yf + 1.25, 1.3 + k * 0.5);
    for (let k = 0; k < 5; k++) { const a = 0.8 + k * 0.7 + (hs(x0, k) - 0.5) * 0.1; Rod('iron', [q.ucx - 1.2, Yc - 0.3, a], [q.ucx - 1.2, Yc - 0.6, a], 0.008); B(TB, q.ucx - 1.28, q.ucx - 1.12, Yc - 1.0, Yc - 0.6, a - 0.08, a + 0.08); }
    B(WD, q.ucx - 1.3, q.ucx - 1.1, Yc - 0.32, Yc - 0.24, 0.6, 4.2);
    futon(ua + 0.9, qb - 2.0); futon(ua + 1.9, qb - 2.0, 1.9, 0.85, 'cloth_black'); futon(ua + 2.8, qb - 1.4, 1.3, 0.6); tansu(ub - 1.9, ub - 0.3, qb - 0.55, qb - 0.05, 1.1, 'n'); andon(ua + 3.6, qb - 0.7);
  } else if (kind === 'craft') {
    // the workroom on boards: the trade's work set out, drying poles, a bench with tools; the apprentices sleep in the room behind
    const tr = el.trade || 'dye';
    if (tr === 'dye') { for (const a of [1.2, 2.5]) { pole(a, Yc - 0.38, ua + 0.05, ub - 0.05); for (let k = 0; k < 6; k++) { const u = ua + 0.5 + k * ((ub - ua - 1.0) / 6); B(k % 3 ? 'cloth_indigo' : 'cloth_white', u, u + 0.4, Yf + 0.75, Yc - 0.4, a - 0.01, a + 0.01); } } B(WD, ub - 0.7, ub - 0.02, Yf, Yf + 0.7, 3.0, 4.2); C(ub - 0.7, ub - 0.02, 3.0, 4.2, Yf, Yf + 0.7); L('pottery_dark', [[0.001, 0], [0.25, 0], [0.3, 0.3], [0.001, 0.3]], 10, ub - 0.35, Yf + 0.7, 3.6); }
    else if (tr === 'oil') { for (let k = 0; k < 6; k++) jar(ub - 0.35, 0.9 + k * 0.55, 0.2); B(WD, ua + 0.2, ua + 0.5, Yf, Yf + 1.2, 2.0, 3.8); B(WD, ua + 0.2, ua + 1.6, Yf + 1.0, Yf + 1.2, 2.5, 3.2); C(ua + 0.2, ua + 0.5, 2.0, 3.8, Yf, Yf + 1.2); }
    else { for (let k = 0; k < 4; k++) barrel(bag, TB, ub - 0.45, Yf, Z(0.9 + k * 0.75), 0.26, 0.6); C(ub - 0.75, ub - 0.15, 0.6, 3.9, Yf, Yf + 0.7); for (let k = 0; k < 6; k++) B(TB, ua + 0.1 + k * 0.06, ua + 0.14 + k * 0.06, Yf, Yf + 1.4, 3.0, 3.35); }
    B(WD, ua + 1.9, ua + 3.3, Yf + 0.55, Yf + 0.62, qm - 0.9, qm - 0.3); for (const u of [ua + 1.95, ua + 3.2]) B(WD, u, u + 0.05, Yf, Yf + 0.55, qm - 0.85, qm - 0.35); C(ua + 1.9, ua + 3.3, qm - 0.9, qm - 0.3, Yf, Yf + 0.62);
    for (let k = 0; k < 3; k++) B('iron', ua + 2.1 + k * 0.3, ua + 2.14 + k * 0.3, Yf + 0.62, Yf + 0.64, qm - 0.75, qm - 0.4);
    futon(ua + 1.0, qb - 2.0); futon(ua + 2.0, qb - 2.0, 1.9, 0.85, 'cloth_black'); B('cloth_white', ub - 1.4, ub - 0.3, Yf, Yf + 0.5, qb - 1.0, qb - 0.3); B('cloth_indigo', ub - 1.4, ub - 0.3, Yf + 0.5, Yf + 0.8, qb - 1.0, qb - 0.3); C(ub - 1.4, ub - 0.3, qb - 1.0, qb - 0.3, Yf, Yf + 0.8);
  } else if (kind === 'store') {
    // the upper floor of a dealer's store: chests and sacks stacked along the party wall, casks on a rack, a night-watchman's bed in the room behind
    for (let k = 0; k < 4; k++) { const a = 0.7 + k * 0.85; B(TB, ub - 0.7, ub - 0.05, Yf, Yf + 0.5, a, a + 0.75); B(TB, ub - 0.6, ub - 0.15, Yf + 0.5, Yf + 0.95, a + 0.05, a + 0.7); B(WD, ub - 0.71, ub - 0.7, Yf + 0.2, Yf + 0.3, a + 0.3, a + 0.45); }
    C(ub - 0.7, ub - 0.05, 0.6, 4.2, Yf, Yf + 0.95);
    for (let k = 0; k < 3; k++) for (let j = 0; j < 3 - k; j++) B('cloth_white', ua + 0.1 + j * 0.62 + k * 0.31, ua + 0.65 + j * 0.62 + k * 0.31, Yf + k * 0.38, Yf + 0.38 + k * 0.38, 1.0, 1.9);
    C(ua + 0.1, ua + 2.0, 1.0, 1.9, Yf, Yf + 1.1);
    for (let k = 0; k < 3; k++) barrel(bag, TB, ua + 0.5 + k * 0.62, Yf, Z(3.4), 0.27, 0.62);
    C(ua + 0.2, ua + 2.2, 3.1, 3.7, Yf, Yf + 0.65);
    futon(ua + 1.0, qb - 2.0); andon(ua + 2.0, qb - 0.5); tansu(ub - 1.9, ub - 0.3, qb - 0.55, qb - 0.05, 1.0, 'n');
    B(WD, ub - 1.0, ub - 0.1, Yf, Yf + 0.4, q1 + 0.5, q1 + 1.3); C(ub - 1.0, ub - 0.1, q1 + 0.5, q1 + 1.3, Yf, Yf + 0.4);
  } else {
    // a tenement: the upper floor let to lodgers, a family in the front room (brazier, folded bedding, laundry on a pole), two lodgers in rooms behind paper walls
    L('pottery_dark', [[0.001, 0], [0.18, 0], [0.2, 0.14], [0.001, 0.14]], 10, ub - 0.7, Yf, 1.2); L('iron', [[0.001, 0], [0.1, 0.02], [0.14, 0.1], [0.07, 0.16], [0.001, 0.18]], 10, ub - 0.7, Yf + 0.14, 1.2); C(ub - 0.95, ub - 0.45, 0.95, 1.45, Yf, Yf + 0.3);
    table(q.ucx + 0.9, 2.5, 0.5, 0.35); tea(q.ucx + 0.9, Yf + 0.3, 2.4); cush(q.ucx + 0.1, 2.5); cush(q.ucx + 1.7, 2.5);
    B('cloth_white', ub - 0.9, ub - 0.02, Yf, Yf + 0.35, 3.2, 4.4); B('cloth_indigo', ub - 0.9, ub - 0.02, Yf + 0.35, Yf + 0.6, 3.2, 4.4); C(ub - 0.9, ub - 0.02, 3.2, 4.4, Yf, Yf + 0.6);
    pole(1.3, Yc - 0.4, ua + 0.05, ub - 0.05); for (let k = 0; k < 4; k++) { const u = ua + 0.8 + k * 0.45; B(k % 2 ? 'cloth_white' : 'cloth_indigo', u, u + 0.38, Yf + 0.9, Yc - 0.42, 1.29, 1.31); }
    const um = q.ucx, qa = q1 + 0.1; B('shoji', um - 0.02, um + 0.02, Yf + 0.06, Yf + 1.8, qa + 0.8, qb - 0.04); B(WD, um - 0.04, um + 0.04, Yf, Yf + 1.95, qa + 0.8 - 0.04, qa + 0.8 + 0.04); B(WD, um - 0.04, um + 0.04, Yf, Yf + 1.95, qb - 0.08, qb); B(WD, um - 0.04, um + 0.04, Yf + 1.8, Yf + 1.95, qa + 0.8, qb); C(um - 0.04, um + 0.04, qa + 0.8, qb, Yf, Yc);
    futon(um - 1.1, qb - 2.0); futon(um + 1.1, qb - 2.0, 1.9, 0.85, 'cloth_black'); tansu(ua + 0.1, ua + 0.6, qb - 1.2, qb - 0.2, 0.8, 'e'); andon(ub - 0.5, qb - 0.6);
  }
  // the front's balcony over the street: a floor of boards on joists reaching through the wall, a railing with a lattice, a lantern on an arm
  if (P.balcony) {
    const bo = 0.85, a0 = x0 + 0.05, a1 = x1 - 0.05;
    B(TB, a0, a1, Yf - 0.1, Yf, -bo, 0); col.floor(rect(a0, a1, -bo, 0), Yf); col.floor(rect(door.a, door.b, 0, tf), Yf);
    for (let u = a0 + 0.2; u < a1; u += 0.9) B(WD, u - 0.06, u + 0.06, Yf - 0.28, Yf - 0.1, -bo, 0.12);
    B(WD, a0 - 0.02, a1 + 0.02, Yf - 0.2, Yf - 0.08, -bo - 0.04, -bo);
    const post = (u, a) => B(WD, u - 0.045, u + 0.045, Yf, Yf + 1.05, a - 0.045, a + 0.045);
    const run = (u0, u1, a0q, a1q) => { BN(WD, u0, u1, Yf + 0.97, Yf + 1.03, a0q - 0.04, a1q + 0.04); BN(WD, u0, u1, Yf + 0.44, Yf + 0.48, a0q - 0.025, a1q + 0.025); B('koshi', u0, u1, Yf + 0.48, Yf + 0.97, a0q - 0.012, a1q + 0.012); C(u0 - 0.04, u1 + 0.04, a0q - 0.04, a1q + 0.04, Yf, Yf + 1.05); };
    const nP = Math.max(3, Math.round((a1 - a0) / 1.3));
    for (let i = 0; i <= nP; i++) post(a0 + 0.05 + (a1 - a0 - 0.1) * i / nP, -bo + 0.05);
    run(a0 + 0.05, a1 - 0.05, -bo + 0.05, -bo + 0.05);
    post(a0 + 0.05, -0.05); post(a1 - 0.05, -0.05); run(a0 + 0.05, a0 + 0.05, -bo + 0.05, -0.05); run(a1 - 0.05, a1 - 0.05, -bo + 0.05, -0.05);
    // a bench along the rail beside the door, a lantern hung from an arm on the corner post
    B(WD, a0 + 0.2, a0 + 1.4, Yf + 0.32, Yf + 0.38, -bo + 0.15, -bo + 0.5); for (const u of [a0 + 0.3, a0 + 1.3]) B(WD, u - 0.03, u + 0.03, Yf, Yf + 0.32, -bo + 0.2, -bo + 0.45); C(a0 + 0.2, a0 + 1.4, -bo + 0.15, -bo + 0.5, Yf, Yf + 0.38);
    B(WD, a1 - 0.05, a1 - 0.05 + 0.0 - 0.3, Yf + 1.3, Yf + 1.34, -bo + 0.03, -bo + 0.07); B(WD, a1 - 0.095, a1 - 0.005, Yf + 1.05, Yf + 1.34, -bo + 0.0, -bo + 0.09); lamp(a1 - 0.3, Yf + 1.3, -bo + 0.05);
  }
}
