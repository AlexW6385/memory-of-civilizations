// The upper floor of the enterable houses of Constantinople (docs/settlements/constantinople.md §4.11): from the store a timber stair of
// one straight flight rises along the east party wall to a landing in the hall of the floor above; round the hall the rooms, cut off by
// light plastered partitions with doors (a curtain at each), by use: the reception room (triclinium) on the street with the door-windows
// to the maenianum, a second room beside it, two chambers behind, the hall itself for the household's daily work; in the merchant's house
// and the tenement a second stair leads on to the flat roof with its parapet and sun-room (heliakon). All of it is drawn in the house's
// own frame (u from the west wall, v from the north wall; the street is at v = 14), by the house's kind: merchant's house, tenement,
// inn, shop with dwelling (bakery), craftsman's house (weaver, potter, smith). Pieces take the house's own meshes in (no draw of their own).
import { frustum, box, rod, lathe } from '../../core/geom.js';
import { subtractRects } from '../../core/build.js';

const PT = 0.25, DH = 2.1;
/** Where the second stair (to the roof) stands, in u and v of the house: its ramp's rectangle. */
export const STAIR2 = { u0: 12.4, u1: 13.9, v0: 1.2, v1: 6.9 };
/** A box with no top face (rails: nothing to stand on). */
const rb = (x0, y0, z0, x1, y1, z1) => frustum([x0, z0, x1, z1], y0, y1, 0, 0, 0, 0, { noTop: true });
const hs = (n, s) => { let h = (Math.floor(n * 37.1) * 73856093) ^ (Math.floor(s * 53.3) * 19349663); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };

/** The kinds of upper floor by the house's variant (and its key's parity for the family houses). */
export const upKind = (variant, i = 0) => (variant === 'tavern' ? 'inn' : variant === 'bakery' ? 'shop' : variant === 'home' ? (i % 2 ? 'tenement' : 'merchant') : 'craft');
export const hasTerrace = (kind) => kind === 'merchant' || kind === 'tenement';

/** The upper floor: partitions, doors, rails, windows' reveals, the rooms furnished by kind, the roof terrace. G: the house's numbers; K: the style's small things. */
export function upperFloor(ctx, G, K) {
  const { bag, col } = ctx, { x0, z0, x1, z1, Yf, H2, kind, seed } = G;
  const { put, wallRun, kline, table, chest, stool, bench, lampstand, brazier, icon, shelves, pithos, amphora, bowlP, ly, pushLight } = K;
  const X = (u) => x0 + u, Z = (v) => z0 + v, Yc = Yf + H2 - 0.1, V = 14;
  const bk = (u0, v0, u1, v1, h) => col.rect([X(u0), Z(v0), X(u1), Z(v1)], Yf, Yf + h);
  const at = (f, u, v, yaw = 0, ...a) => put(bag, f, X(u), Yf, Z(v), yaw, ...a);
  const onWall = (f, u, v, y, yaw, ...a) => put(bag, f, X(u), Yf + y, Z(v), yaw, ...a);
  const lamp = (u, v, h = 1.7, i = 3.5, d = 8) => { at(lampstand, u, v, 0, h); pushLight(ctx, [X(u), Yf + h + 0.3, Z(v)], i, d); };
  // — the partitions of plastered boards on a frame, with their doors (a jamb, a lintel, a curtain drawn aside)
  const door = (a, b, s0, w, curtain, side) => {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, p = (s) => [a[0] + ux * s, a[1] + uz * s];
    const J = (s, d) => { const q = p(s + d * 0.05); bag.add('timber', box(q[0] - 0.09 - 0.0, Yf, q[1] - 0.09, q[0] + 0.09, Yf + DH, q[1] + 0.09)); };
    J(s0, -1); J(s0 + w, 1);
    const q0 = p(s0 - 0.04), q1 = p(s0 + w + 0.04); bag.add('timber', box(Math.min(q0[0], q1[0]) - 0.1, Yf + DH, Math.min(q0[1], q1[1]) - 0.1, Math.max(q0[0], q1[0]) + 0.1, Yf + DH + 0.12, Math.max(q0[1], q1[1]) + 0.1));
    const c = p(side > 0 ? s0 + w - 0.2 : s0 + 0.2), t = [0.1, 0.1];
    if (curtain) bag.add(curtain, box(c[0] - (ux ? 0.2 : 0.14) * 1, Yf + 0.25, c[1] - (uz ? 0.2 : 0.14), c[0] + (ux ? 0.2 : 0.14), Yf + DH, c[1] + (uz ? 0.2 : 0.14)));
    void t;
  };
  const part = (a, b, ops, curtains) => {
    wallRun(bag, col, a, b, PT, Yf, Yc, 'plaster', ops.map(([s0, w]) => ({ s0, s1: s0 + w, y0: Yf, y1: Yf + DH })));
    ops.forEach(([s0, w], i) => door(a, b, s0, w, curtains[i % curtains.length], i % 2 ? 1 : -1));
    // a dado of boards low on the partition, both faces
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
    let s = 0;
    for (const [s0, w] of [...ops].sort((p, q) => p[0] - q[0]).concat([[L, 0]])) {
      if (s0 - s > 0.3) { const p0 = [a[0] + ux * s, a[1] + uz * s], p1 = [a[0] + ux * s0, a[1] + uz * s0], q = PT / 2 + 0.03;
        bag.add('wood_ochre', box(Math.min(p0[0], p1[0]) - (uz ? q : 0), Yf, Math.min(p0[1], p1[1]) - (ux ? q : 0), Math.max(p0[0], p1[0]) + (uz ? q : 0), Yf + 0.9, Math.max(p0[1], p1[1]) + (ux ? q : 0))); }
      s = s0 + w;
    }
  };
  const cl = ['cloth_maroon', 'cloth_indigo', 'cloth_ochre'], ch = (i) => cl[Math.floor(hs(seed, i) * 3)];
  const uA = 6.45, vB = 4.85, vC = 9.325, uD = 10.6;
  part([X(uA), Z(0.6)], [X(uA), Z(vC)], [[1.8, 0.95], [5.4, 0.95]], [ch(1), ch(2)]);                 // west chambers / hall: doors at v 2.4 and 6.0
  part([X(0.6), Z(vB)], [X(uA - PT / 2), Z(vB)], [], []);                                                // the wall between the two chambers
  part([X(0.6), Z(vC)], [X(17.4), Z(vC)], [[7.4, 0.95], [13.4, 0.95]], [ch(3), ch(4)]);                // hall / the rooms on the street: doors at u 8.0 and 14.0
  part([X(uD), Z(vC)], [X(uD), Z(13.4)], [[0.875, 0.95]], [ch(5)]);                                      // between the street room and the one beside it
  // — the stair's rail round the hole's west edge; the landing
  rail(bag, col, [X(15.35), Z(0.6)], [X(15.35), Z(6.8)], Yf, 'z');
  // — reveals of the windows and door-windows of the street wall, from the room: a sill board, a lintel board, jambs, the shutters folded back
  const wallV = V - 0.6;
  for (const [u0, u1, sill] of [[2.8, 4.2, 0], [8.9, 10.3, 0], [5.8, 6.8, 0.9], [12.3, 13.3, 0.9]]) {
    const y0 = Yf + sill, y1 = Yf + (sill ? 2.4 : 2.5);
    bag.add('timber', box(X(u0) - 0.08, y1, Z(wallV) - 0.06, X(u1) + 0.08, y1 + 0.12, Z(wallV) + 0.01));
    if (sill) bag.add('timber', box(X(u0) - 0.1, y0 - 0.06, Z(wallV) - 0.12, X(u1) + 0.1, y0, Z(wallV) + 0.01));
    for (const [a0, a1] of [[u0 - 0.08, u0], [u1, u1 + 0.08]]) bag.add('timber', box(X(a0), y0, Z(wallV) - 0.06, X(a1), y1, Z(wallV) + 0.01));
    for (const s of [-1, 1]) { const a = s < 0 ? u0 - 0.5 : u1 + 0.08; bag.add('shutter_brown', box(X(a), y0 + 0.05, Z(wallV) - 0.05, X(a + 0.42), y1 - 0.05, Z(wallV) - 0.01)); }
  }
  // — the rooms by kind
  const KIND = { merchant, tenement, inn, shop: craft, craft }[kind] ?? merchant;
  KIND({ ...K, bag, col, at, onWall, lamp, bk, X, Z, Yf, seed, G, ctx });
  // — the hall: what every house has there, by the stair's head: a lamp and an icon
  onWall(icon, 6.72, 4.3, 1.35, -Math.PI / 2, 0.5, 0.7);
}

/** A rail along a line (world a → b) on the floor at y: posts, a top rail (no top face), a middle rail; blocks the way. */
export function rail(bag, col, a, b, y, ax, h = 1.0) {
  const [x0, z0] = a, [x1, z1] = b, t = 0.07, n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, z1 - z0) / 1.1));
  for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n, z = z0 + (z1 - z0) * i / n; bag.add('wood_dark', rb(x - t, y, z - t, x + t, y + h, z + t)); }
  const lo = (c0, c1) => [Math.min(c0, c1), Math.max(c0, c1)];
  const [xa, xb] = lo(x0, x1), [za, zb] = lo(z0, z1);
  for (const [yy, hh] of [[h - 0.07, 0.07], [0.45, 0.05]]) bag.add('timber', rb(xa - (ax === 'z' ? 0.04 : 0), y + yy, za - (ax === 'x' ? 0.04 : 0), xb + (ax === 'z' ? 0.04 : 0), y + yy + hh, zb + (ax === 'x' ? 0.04 : 0)));
  for (let i = 1; i < n * 4; i++) { const f = i / (n * 4), x = x0 + (x1 - x0) * f, z = z0 + (z1 - z0) * f; bag.add('wood_dark', rb(x - 0.02, y + 0.1, z - 0.02, x + 0.02, y + h - 0.07, z + 0.02)); }
  col.rect([xa - 0.08, za - 0.08, xb + 0.08, zb + 0.08], y, y + h);
}

// ── the things of the rooms ───────────────────────────────────────────────────
const bed = (Q, w = 1.1, l = 2.0, c = 'cloth_indigo') => {
  Q.add('wood_dark', box(-w / 2, 0.2, -l / 2, w / 2, 0.42, l / 2));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) Q.add('wood_dark', box(sx * (w / 2 - 0.05) - 0.04, 0, sz * (l / 2 - 0.05) - 0.04, sx * (w / 2 - 0.05) + 0.04, 0.2, sz * (l / 2 - 0.05) + 0.04));
  Q.add('wood_dark', box(-w / 2, 0.42, -l / 2 - 0.03, w / 2, 0.95, -l / 2 + 0.03));
  Q.add('cloth_white', box(-w / 2 + 0.03, 0.42, -l / 2 + 0.05, w / 2 - 0.03, 0.55, l / 2 - 0.03));
  Q.add(c, box(-w / 2 + 0.02, 0.55, -0.15, w / 2 - 0.02, 0.62, l / 2 - 0.02));
  Q.add('cloth_white', box(-w / 2 + 0.12, 0.55, -l / 2 + 0.1, w / 2 - 0.12, 0.68, -l / 2 + 0.5));
};
const pallet = (Q, c = 'cloth_brown') => { Q.add('sacking', box(-0.5, 0, -0.95, 0.5, 0.14, 0.95)); Q.add(c, box(-0.48, 0.14, -0.2, 0.48, 0.2, 0.93)); Q.add('cloth_white', box(-0.4, 0.14, -0.9, 0.4, 0.24, -0.55)); };
const loom = (Q, c = 'cloth_ochre') => {
  for (const s of [-1, 1]) Q.add('timber', box(s * 0.8 - 0.06, 0, -0.1, s * 0.8 + 0.06, 1.9, 0.1));
  Q.add('timber', box(-0.86, 1.8, -0.1, 0.86, 1.9, 0.1)); Q.add('timber', box(-0.86, 0.9, -0.08, 0.86, 0.96, 0.08));
  for (let a = -0.7; a < 0.75; a += 0.08) Q.add('cloth_white', box(a - 0.01, 0.4, 0.0, a + 0.01, 1.8, 0.02));
  Q.add(c, box(-0.7, 0.2, 0.05, 0.7, 0.8, 0.16));
  for (const a of [-0.55, -0.2, 0.2, 0.55]) Q.add('terracotta', box(a - 0.04, 0.1, -0.02, a + 0.04, 0.4, 0.02));   // the loom weights
};
const sacks = (Q, n = 3, c = 'sacking') => { for (let i = 0; i < n; i++) Q.add(c, box(-0.3 + (i % 2) * 0.62 - 0.0, Math.floor(i / 2) * 0.5, -0.2 + (i % 2) * 0.05, 0.3 + (i % 2) * 0.62 - 0.0, Math.floor(i / 2) * 0.5 + 0.5, 0.2 + (i % 2) * 0.05)); };
const bolts = (Q, cs) => cs.forEach((c, i) => Q.add(c, box(-0.4 + (i % 3) * 0.5 - 0.22, Math.floor(i / 3) * 0.28, -0.3, -0.4 + (i % 3) * 0.5 + 0.22, Math.floor(i / 3) * 0.28 + 0.26, 0.3)));
const jar = (Q, r = 1) => Q.add('terracotta', lathe([[0.1 * r, 0], [0.2 * r, 0.12 * r], [0.22 * r, 0.3 * r], [0.12 * r, 0.5 * r], [0.14 * r, 0.56 * r], [0.001, 0.56 * r]], 10));
const writing = (Q) => {   // a writing table: scrolls, an ink pot and a balance
  Q.add('linen', box(-0.5, 0.75, -0.2, -0.1, 0.8, 0.2)); Q.add('cloth_white', box(0.0, 0.75, -0.1, 0.3, 0.84, 0.1));
  Q.add('bronze', rod([0.55, 0.78, 0], [0.55, 1.05, 0], 0.012, 5)); Q.add('bronze', rod([0.4, 1.04, 0], [0.7, 1.04, 0], 0.01, 5));
  for (const s of [-1, 1]) Q.add('bronze', box(0.55 + s * 0.15 - 0.05, 0.9, -0.05, 0.55 + s * 0.15 + 0.05, 0.92, 0.05));
};

// ── the kinds ─────────────────────────────────────────────────────────────────
// each takes the helpers and fills the rooms: NW and SW chambers, the hall (west part), the street room W (triclinium or family room), the room E beside it.
function triclinium({ at, bk, lamp, onWall, kline, lampstand, brazier, icon, chest, put, bag, X, Z, Yf, ly }) {
    at((Q) => { Q.add('marble_smooth', ly([[0.001, 0.72], [0.9, 0.72], [0.9, 0.78], [0.001, 0.78]], 24)); Q.add('wood_dark', ly([[0.2, 0], [0.12, 0.3], [0.14, 0.7], [0.001, 0.7]], 10)); }, 5.4, 11.6);
  bk(4.5, 10.7, 6.3, 12.5, 0.8);
  at((Q) => kline(Q, 1.9, 0.8, 'cloth_maroon'), 5.4, 10.1, 0);
  at((Q) => kline(Q, 1.9, 0.8, 'cloth_green'), 3.85, 11.6, Math.PI / 2); bk(3.45, 10.65, 4.25, 12.55, 0.5);
  at((Q) => kline(Q, 1.9, 0.8, 'cloth_red'), 6.95, 11.6, Math.PI / 2); bk(6.55, 10.65, 7.35, 12.55, 0.5);
  bk(4.45, 9.7, 6.35, 10.5, 0.5);
  at(brazier, 1.3, 12.8); bk(0.95, 12.45, 1.65, 13.15, 0.6);
  lamp(7.9, 13.0, 1.8);
  onWall(icon, 3.0, 9.47, 1.5, Math.PI, 0.6, 0.8);
  at((Q) => chest(Q, 0.9, 0.5, 0.55), 1.4, 10.1, 0); bk(0.95, 9.85, 1.85, 10.35, 0.55);
}

function merchant(S) {
  const { at, bk, lamp, onWall, put, bag, col, X, Z, Yf, ly } = S;
    triclinium(S);
  // E: the counting room: a writing table and stool, a shelf of amphorae, chests, sacks
  at((Q) => { S.table(Q, 1.6, 0.7, 0.78); writing(Q); }, 13.2, 11.0); bk(12.4, 10.65, 14.0, 11.35, 0.8); at(S.stool, 13.2, 11.9);
  at((Q) => { const ys = S.shelves(Q, 1.8, 2.0, 4); for (const yy of ys.slice(0, 3)) for (let a = -0.6; a < 0.7; a += 0.6) Q.add('terracotta', ly([[0.04, 0], [0.1, 0.1], [0.14, 0.26], [0.06, 0.42], [0.001, 0.46]], 8).translate(a, yy, 0)); }, 17.15, 12.0, Math.PI / 2); bk(16.95, 11.1, 17.4, 12.9, 2.0);
  at((Q) => S.chest(Q, 0.9, 0.5, 0.55), 16.4, 9.95, 0); bk(15.95, 9.7, 16.85, 10.2, 0.55);
  at((Q) => sacks(Q, 3), 16.0, 12.9); bk(15.5, 12.6, 16.6, 13.2, 0.5);
  lamp(11.3, 12.9, 1.6, 3, 7);
  // SW: the bedroom
  at((Q) => bed(Q, 1.1, 2.0, 'cloth_indigo'), 1.3, 7.1); bk(0.75, 6.1, 1.85, 8.1, 0.6);
  at((Q) => S.chest(Q, 0.9, 0.5, 0.55), 4.4, 8.75, 0); bk(3.95, 8.5, 4.85, 9.0, 0.55);
  at((Q) => S.chest(Q, 0.8, 0.5, 0.5), 3.2, 5.35, 0); bk(2.8, 5.1, 3.6, 5.6, 0.5);
  lamp(2.9, 8.9, 1.5, 3.5, 8);
  onWall(S.icon, 0.64, 7.1, 1.4, -Math.PI / 2, 0.5, 0.7);
  // NW: the strongroom: chests, jars, sacks, a shelf
  for (const u of [1.5, 3.0, 4.5]) { at((Q) => S.chest(Q, 0.9, 0.55, 0.6), u, 1.15, 0); bk(u - 0.45, 0.9, u + 0.45, 1.4, 0.6); }
  at((Q) => sacks(Q, 4), 5.0, 3.9); bk(4.6, 3.6, 5.7, 4.2, 0.5);
  at(S.pithos, 1.4, 3.9); col.circle(X(1.4), Z(3.9), 0.45, Yf, Yf + 1.2);
  at((Q) => { const ys = S.shelves(Q, 1.8, 2.0, 4); for (const yy of ys.slice(0, 3)) for (let a = -0.6; a < 0.7; a += 0.6) Q.add('terracotta', ly([[0.04, 0], [0.1, 0.1], [0.14, 0.26], [0.06, 0.42], [0.001, 0.46]], 8).translate(a, yy, 0)); }, 0.8, 2.6, -Math.PI / 2); bk(0.6, 1.7, 1.0, 3.5, 2.0);
  // the hall: the household's loom and table
  at((Q) => loom(Q, 'cloth_ochre'), 8.3, 1.0); bk(7.4, 0.8, 9.2, 1.2, 1.9); at(S.stool, 8.3, 1.95);
  at((Q) => S.table(Q, 1.5, 0.8, 0.78), 9.2, 4.6); bk(8.45, 4.2, 9.95, 5.0, 0.8); at((Q) => S.bench(Q, 1.5), 9.2, 5.5); at((Q) => S.bench(Q, 1.5), 9.2, 3.7);
  at((Q) => { for (let i = 0; i < 3; i++) S.bowlP(Q, i % 2 ? 'glaze_white' : 'glaze_green'); }, 9.0, 4.6);
  for (const v of [1.5, 2.5]) { at(S.pithos, 14.6, v); col.circle(X(14.6), Z(v), 0.45, Yf, Yf + 1.2); }
  lamp(11.2, 8.7, 1.8, 4, 9);
}

function tenement(S) {
  const { at, bk, lamp, onWall, col, X, Z, Yf, ly } = S;
    // W: the first family's room: a table with benches, a bed against the west wall, a brazier, an icon
  at((Q) => S.table(Q, 1.5, 0.8, 0.78), 5.2, 11.3); bk(4.45, 10.9, 5.95, 11.7, 0.8); at((Q) => S.bench(Q, 1.5), 5.2, 10.4); at((Q) => S.bench(Q, 1.5), 5.2, 12.2);
  at((Q) => bed(Q, 1.1, 2.0, 'cloth_ochre'), 1.25, 11.9); bk(0.7, 10.9, 1.8, 12.9, 0.6);
  at(S.brazier, 7.6, 12.6); bk(7.25, 12.25, 7.95, 12.95, 0.6);
  at((Q) => S.chest(Q, 0.9, 0.5, 0.55), 1.4, 10.0, 0); bk(0.95, 9.75, 1.85, 10.25, 0.55);
  onWall(S.icon, 2.5, 9.47, 1.5, Math.PI, 0.5, 0.7); lamp(8.2, 10.6, 1.6, 3, 7);
  // E: the second family: a bed, a cooking place, a table, pots
  at((Q) => bed(Q, 1.1, 2.0, 'cloth_green'), 16.75, 12.3); bk(16.2, 11.3, 17.3, 13.3, 0.6);
  at((Q) => { Q.add('brick', box(-0.7, 0, -0.45, 0.7, 0.85, 0.45)); Q.add('iron', box(-0.45, 0.85, -0.25, 0.45, 0.9, 0.25)); Q.add('flame', box(-0.3, 0.9, -0.15, 0.3, 0.97, 0.15)); }, 11.6, 13.0); bk(10.95, 12.5, 12.25, 13.4, 0.9);
  at((Q) => S.table(Q, 1.2, 0.7, 0.78), 14.6, 11.0); bk(14.0, 10.65, 15.2, 11.35, 0.8); at(S.stool, 14.6, 11.9);
  at((Q) => { jar(Q, 1); }, 15.4, 9.9); at((Q) => { jar(Q, 1.2); }, 11.4, 10.1);
  lamp(11.5, 11.4, 1.6, 3, 7);
  // SW: a lodger: a bed and a chest; NW: another, a loom and a pallet
  at((Q) => bed(Q, 1.1, 2.0, 'cloth_red'), 1.3, 7.1); bk(0.75, 6.1, 1.85, 8.1, 0.6);
  at((Q) => S.chest(Q, 0.9, 0.5, 0.55), 3.6, 8.75, 0); bk(3.15, 8.5, 4.05, 9.0, 0.55); lamp(2.9, 8.9, 1.5, 3, 7);
  at((Q) => pallet(Q, 'cloth_brown'), 1.2, 3.4); bk(0.7, 2.4, 1.7, 4.4, 0.25);
  at((Q) => loom(Q, 'cloth_red'), 4.0, 1.0); bk(3.1, 0.8, 4.9, 1.2, 1.9); at(S.stool, 4.0, 1.95);
  at((Q) => sacks(Q, 2), 5.2, 4.0); bk(4.8, 3.7, 5.9, 4.3, 0.5);
  // the hall: the washing place of the floor: a trough, jars, a line with cloth
  at((Q) => { Q.add('wood_dark', box(-0.6, 0, -0.25, 0.6, 0.6, 0.25)); Q.add('water', box(-0.52, 0.55, -0.17, 0.52, 0.58, 0.17)); }, 9.0, 1.0); bk(8.4, 0.75, 9.6, 1.25, 0.6);
  for (const [u, v] of [[10.5, 1.0], [14.6, 1.5], [14.6, 2.5]]) { at(S.pithos, u, v); col.circle(X(u), Z(v), 0.45, Yf, Yf + 1.2); }
  at((Q) => S.bench(Q, 1.8), 9.0, 6.0, 0); lamp(11.2, 8.7, 1.8, 3.5, 8);
}

function inn(S) {
  const { at, bk, lamp, onWall, col, X, Z, Yf, ly } = S;
    // NW and SW: guest rooms of two beds each, a chest, a jug on a stand
  for (const v of [1.5, 3.4]) { at((Q) => bed(Q, 1.1, 2.0, v < 2 ? 'cloth_indigo' : 'cloth_green'), 2.1, v, Math.PI / 2); bk(1.0, v - 0.55, 3.2, v + 0.55, 0.6); }
  at((Q) => S.chest(Q, 0.9, 0.5, 0.55), 5.3, 1.1, 0); bk(4.85, 0.85, 5.75, 1.35, 0.55); lamp(4.6, 4.2, 1.5, 3, 7);
  for (const v of [5.9, 8.1]) { at((Q) => bed(Q, 1.1, 2.0, v < 7 ? 'cloth_red' : 'cloth_ochre'), 2.1, v, Math.PI / 2); bk(1.0, v - 0.55, 3.2, v + 0.55, 0.6); }
  at((Q) => S.chest(Q, 0.9, 0.5, 0.55), 5.3, 8.75, 0); bk(4.85, 8.5, 5.75, 9.0, 0.55); lamp(4.4, 5.3, 1.5, 3, 7);
  onWall(S.icon, 0.64, 7.0, 1.5, -Math.PI / 2, 0.5, 0.7);
  // W: the common room: two long tables with benches, a hearth, wine jars, lamps
  for (const [u, v] of [[3.3, 10.9], [6.4, 12.1]]) { at((Q) => S.table(Q, 2.2, 0.8, 0.78), u, v); bk(u - 1.1, v - 0.4, u + 1.1, v + 0.4, 0.8); at((Q) => S.bench(Q, 2.0), u, v - 0.75); at((Q) => S.bench(Q, 2.0), u, v + 0.75);
    at((Q) => { S.bowlP(Q, 'glaze_white'); }, u - 0.5, v); at((Q) => { S.bowlP(Q, 'glaze_green'); }, u + 0.4, v + 0.1); }
  at(S.brazier, 1.2, 12.9); bk(0.85, 12.55, 1.55, 13.25, 0.6);
  for (const v of [9.9]) { at(S.pithos, 1.3, v); col.circle(X(1.3), Z(v), 0.45, Yf, Yf + 1.2); }
  lamp(7.9, 10.1, 1.8, 4, 9); onWall(S.icon, 4.0, 9.47, 1.5, Math.PI, 0.5, 0.7);
  // E: the kitchen: a brick stove, a table, jars, sacks and a rack of cups
  at((Q) => { Q.add('brick', box(-0.8, 0, -0.5, 0.8, 0.9, 0.5)); Q.add('iron', box(-0.5, 0.9, -0.3, 0.5, 0.96, 0.3)); Q.add('flame', box(-0.3, 0.96, -0.15, 0.3, 1.03, 0.15)); Q.add('brick', box(-0.5, 0.96, 0.2, 0.5, 2.4, 0.5)); }, 16.4, 12.85); bk(15.6, 12.3, 17.2, 13.4, 0.9);
  at((Q) => S.table(Q, 1.8, 0.9, 0.85), 13.6, 11.4); bk(12.7, 10.95, 14.5, 11.85, 0.85);
  for (const u of [11.4, 12.2]) { at((Q) => jar(Q, 1.1), u, 13.0); col.circle(X(u), Z(13.0), 0.3, Yf, Yf + 0.7); }
  at((Q) => sacks(Q, 3), 16.3, 10.1); bk(15.8, 9.8, 16.9, 10.4, 0.5);
  // the hall: benches for waiting guests, a lamp
  at((Q) => S.bench(Q, 2.0), 10.2, 1.0, 0); at((Q) => S.bench(Q, 2.0), 7.8, 5.0, Math.PI / 2); bk(7.55, 4.0, 8.05, 6.0, 0.45);
  lamp(11.0, 8.7, 1.8, 3.5, 8);
}

function craft(S) {
  const { at, bk, lamp, onWall, col, X, Z, Yf, ly, G } = S;
    const V = G.variant;
  // SW: the bedroom of the family; W: the dayroom: a table with benches, a couch, a brazier, an icon
  at((Q) => bed(Q, 1.1, 2.0, 'cloth_indigo'), 1.3, 7.1); bk(0.75, 6.1, 1.85, 8.1, 0.6);
  at((Q) => S.chest(Q, 0.9, 0.5, 0.55), 4.4, 8.75, 0); bk(3.95, 8.5, 4.85, 9.0, 0.55); lamp(2.9, 8.9, 1.5, 3.5, 8);
  onWall(S.icon, 0.64, 7.1, 1.4, -Math.PI / 2, 0.5, 0.7);
  at((Q) => S.table(Q, 1.6, 0.8, 0.78), 5.0, 11.3); bk(4.2, 10.9, 5.8, 11.7, 0.8); at((Q) => S.bench(Q, 1.6), 5.0, 10.4); at((Q) => S.bench(Q, 1.6), 5.0, 12.2);
  at((Q) => S.kline(Q, 1.9, 0.8, 'cloth_green'), 1.3, 12.2, Math.PI / 2); bk(0.9, 11.25, 1.7, 13.15, 0.5);
  at(S.brazier, 7.6, 12.7); bk(7.25, 12.35, 7.95, 13.05, 0.6);
  onWall(S.icon, 3.0, 9.47, 1.5, Math.PI, 0.5, 0.7); lamp(8.0, 10.5, 1.7, 3.5, 8);
  // the hall: a stool and a table with the day's small work
  at((Q) => S.table(Q, 1.3, 0.7, 0.78), 9.2, 4.5); bk(8.55, 4.15, 9.85, 4.85, 0.8); at(S.stool, 9.2, 5.4); at(S.stool, 9.2, 3.6);
  for (const [u, v] of [[14.6, 1.5], [14.6, 2.5]]) { at(S.pithos, u, v); col.circle(X(u), Z(v), 0.45, Yf, Yf + 1.2); }
  lamp(11.2, 8.7, 1.8, 3.5, 8);
  // NW: the store; E: the workroom, by the trade
  if (V === 'bakery') {
    for (const [u, v] of [[1.4, 1.2], [2.3, 1.2], [3.2, 1.2], [1.4, 2.2], [2.3, 2.2]]) { at((Q) => sacks(Q, 2, 'cloth_white'), u, v); }
    bk(0.9, 0.85, 3.7, 2.6, 1.0);
    at((Q) => { const ys = S.shelves(Q, 2.0, 2.0, 4); for (const yy of ys) for (let a = -0.8; a < 0.9; a += 0.3) Q.add('wicker', ly([[0.001, 0], [0.12, 0.02], [0.14, 0.07], [0.001, 0.1]], 8).translate(a, yy, 0)); }, 4.2, 0.8, Math.PI); bk(3.2, 0.6, 5.2, 1.0, 2.0);
    at((Q) => S.table(Q, 2.2, 0.9, 0.85), 14.0, 11.0); bk(12.9, 10.55, 15.1, 11.45, 0.9); at((Q) => { for (let i = 0; i < 6; i++) Q.add('wicker', ly([[0.001, 0], [0.17, 0.02], [0.2, 0.08], [0.001, 0.12]], 10).translate(-0.7 + (i % 3) * 0.7, 0.85, -0.2 + Math.floor(i / 3) * 0.4)); }, 14.0, 11.0);
    at((Q) => { Q.add('wood_dark', box(-0.9, 0.55, -0.4, 0.9, 0.62, 0.4)); for (const s of [-1, 1]) for (const t of [-1, 1]) Q.add('wood_dark', box(s * 0.8 - 0.05, 0, t * 0.3 - 0.05, s * 0.8 + 0.05, 0.55, t * 0.3 + 0.05)); Q.add('linen', box(-0.7, 0.62, -0.3, 0.1, 0.7, 0.3)); }, 16.2, 13.0); bk(15.2, 12.6, 17.2, 13.4, 0.9);
  } else if (V === 'weaver') {
    at((Q) => bolts(Q, ['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_green', 'cloth_maroon', 'cloth_white']), 1.8, 1.4); bk(1.1, 1.0, 2.7, 1.8, 0.6);
    at((Q) => sacks(Q, 4, 'cloth_white'), 4.8, 1.3); bk(4.4, 1.0, 5.5, 1.6, 1.0);
    for (const [u, c] of [[13.4, 'cloth_red'], [15.8, 'cloth_indigo']]) { at((Q) => loom(Q, c), u, 10.1 + (u > 14 ? 0.2 : 0)); bk(u - 0.9, 9.9, u + 0.9, 10.5, 1.9); at(S.stool, u, 11.0); }
    at((Q) => { for (let i = 0; i < 3; i++) Q.add('terracotta', ly([[0.2, i * 0.5], [0.34, i * 0.5 + 0.25], [0.3, i * 0.5 + 0.5]], 10)); }, 12.0, 13.0);
    at((Q) => { for (const [i, c] of ['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_green'].entries()) Q.add('wicker', ly([[0.001, 0], [0.2, 0.02], [0.24, 0.12], [0.001, 0.16]], 8).translate(i * 0.45, 0, 0)), Q.add(c, ly([[0.001, 0.12], [0.18, 0.13], [0.001, 0.28]], 8).translate(i * 0.45, 0, 0)); }, 14.3, 12.9);
  } else if (V === 'potter') {
    at((Q) => sacks(Q, 4, 'sacking'), 1.6, 1.3); bk(1.0, 1.0, 2.7, 1.7, 1.0);
    for (const u of [4.0]) at((Q) => { const ys = S.shelves(Q, 1.8, 2.0, 4); for (const yy of ys) for (let a = -0.7; a < 0.8; a += 0.3) Q.add(hs(u, a) < 0.5 ? 'terracotta' : 'glaze_green', ly([[0.001, 0], [0.07, 0], [0.1, 0.1], [0.07, 0.2], [0.001, 0.2]], 8).translate(a, yy, 0)); }, u, 0.8, Math.PI), bk(u - 0.9, 0.6, u + 0.9, 1.0, 2.0);
    for (const [u, v, rot] of [[13.0, 13.0, Math.PI], [15.2, 13.0, Math.PI]]) { at((Q) => { const ys = S.shelves(Q, 1.8, 2.0, 4); for (const yy of ys) for (let a = -0.7; a < 0.8; a += 0.3) Q.add(hs(u, a + yy) < 0.5 ? 'terracotta' : 'glaze_white', ly([[0.001, 0], [0.07, 0], [0.1, 0.1], [0.07, 0.2], [0.001, 0.2]], 8).translate(a, yy, 0)); }, u, v, rot); bk(u - 0.9, v - 0.2, u + 0.9, v + 0.2, 2.0); }
    at((Q) => { Q.add('wood_dark', box(-0.3, 0, -0.3, 0.3, 0.06, 0.3)); Q.add('terracotta', ly([[0.001, 0.62], [0.3, 0.62], [0.3, 0.68], [0.001, 0.68]], 14)); Q.add('timber', ly([[0.04, 0.06], [0.04, 0.62]], 6)); }, 14.0, 10.6); bk(13.7, 10.3, 14.3, 10.9, 0.7); at(S.stool, 14.0, 11.3);
  } else {   // smith
    at((Q) => { for (let i = 0; i < 6; i++) Q.add('iron', box(-0.5, i * 0.05, -0.04 + (i % 2) * 0.02, 0.5, i * 0.05 + 0.05, 0.04 + (i % 2) * 0.02)); }, 2.0, 1.3); bk(1.4, 1.0, 2.6, 1.6, 0.3);
    at((Q) => sacks(Q, 4, 'sacking'), 4.6, 1.3); bk(4.0, 1.0, 5.2, 1.6, 1.0);
    at((Q) => { for (let a = -0.9; a < 1.0; a += 0.3) Q.add('iron', rod([a, 0.2, 0], [a + 0.05, 1.3, 0.05], 0.025, 5)); Q.add('wood_dark', box(-1.0, 1.55, -0.04, 1.0, 1.62, 0.04)); }, 14.0, 13.3, Math.PI);
    at((Q) => S.table(Q, 1.8, 0.9, 0.85), 14.0, 11.0); bk(13.1, 10.55, 14.9, 11.45, 0.85); at((Q) => { for (let a = -0.6; a < 0.7; a += 0.4) Q.add('iron', box(a - 0.1, 0.85, -0.05, a + 0.1, 0.9, 0.05)); }, 14.0, 11.0);
  }
  void col;
}

/** The roof terrace of the merchant's house and the tenement: its deck (a hole for the second stair), the parapet, the rails of the stair, the sun-room. */
export function terrace(ctx, G, K) {
  const { bag, col } = ctx, { x0, z0, x1, z1, Yf, H2, upperM, kind } = G, Yd = Yf + H2 + 0.3, X = (u) => x0 + u, Z = (v) => z0 + v;
  const hole = [X(STAIR2.u0 - 0.4), Z(STAIR2.v0), X(STAIR2.u1 + 0.4), Z(STAIR2.v1)];   // (0.4 m clear of the ramp each side: the head must not meet the slab's edge)
  const inner = [x0 + 0.6, z0 + 0.6, x1 - 0.6, z1 - 0.6];
  for (const r of subtractRects(inner, [hole])) bag.add('ceiling_painted', box(r[0], Yf + H2 - 0.1, r[1], r[2], Yf + H2, r[3]));
  const slab = [x0 - 0.12, z0 - 0.12, x1 + 0.12, z1];
  for (const r of subtractRects(slab, [hole])) { bag.add('limestone', box(r[0], Yf + H2 + 0.02, r[1], r[2], Yd, r[3])); }
  for (const r of subtractRects([x0, z0, x1, z1], [hole])) col.floor(r, Yd);
  // the parapet, 1 m, with a coping
  const t = 0.4, par = [[x0, z1 - t, x1, z1], [x0, z0, x1, z0 + t], [x0, z0 + t, x0 + t, z1 - t], [x1 - t, z0 + t, x1, z1 - t]];
  for (const p of par) { bag.add(upperM, box(p[0], Yd, p[1], p[2], Yd + 0.95, p[3])); col.rect(p, Yd, Yd + 1.0); bag.add('limestone', box(p[0] - 0.04, Yd + 0.95, p[1] - 0.04, p[2] + 0.04, Yd + 1.03, p[3] + 0.04)); }
  // scuppers: a stone spout through the parapet at the south corners
  for (const u of [3.0, 15.0]) bag.add('limestone', box(X(u) - 0.1, Yd + 0.02, z1 - 0.1, X(u) + 0.1, Yd + 0.14, z1 + 0.35));
  K.stair(bag, col, [X(STAIR2.u0), Z(STAIR2.v0), X(STAIR2.u1), Z(STAIR2.v1)], Yf, Yd, 's');
  rail(bag, col, [X(STAIR2.u0 - 0.55), Z(STAIR2.v0)], [X(STAIR2.u0 - 0.55), Z(STAIR2.v1)], Yd, 'z');
  rail(bag, col, [X(STAIR2.u1 + 0.55), Z(STAIR2.v0)], [X(STAIR2.u1 + 0.55), Z(STAIR2.v1)], Yd, 'z');
  // the sun-room (heliakon): four posts and a lean-to of tiles against the north parapet, a couch, a table, a lamp stand
  const P = [[1.4, 1.3, 2.9], [5.8, 1.3, 2.9], [1.4, 4.9, 2.3], [5.8, 4.9, 2.3]];
  for (const [u, v, h] of P) { bag.add('timber', box(X(u) - 0.08, Yd, Z(v) - 0.08, X(u) + 0.08, Yd + h, Z(v) + 0.08)); col.circle(X(u), Z(v), 0.1, Yd, Yd + h); }
  bag.add('timber', box(X(1.4) - 0.12, Yd + 2.9, Z(1.3) - 0.12, X(5.8) + 0.12, Yd + 3.02, Z(1.3) + 0.12));
  bag.add('timber', box(X(1.4) - 0.12, Yd + 2.3, Z(4.9) - 0.12, X(5.8) + 0.12, Yd + 2.42, Z(4.9) + 0.12));
  K.put(bag, (Q) => Q.add('roof_tile', K.solid8([[-0.4, 3.05, -1.4], [4.8, 3.05, -1.4], [4.8, 2.45, 4.0], [-0.4, 2.45, 4.0], [-0.4, 3.17, -1.4], [4.8, 3.17, -1.4], [4.8, 2.57, 4.0], [-0.4, 2.57, 4.0]])), X(1.4), Yd, Z(2.6) + 0.0, 0);
  K.put(bag, (Q) => K.kline(Q, 1.9, 0.8, 'cloth_ochre'), X(3.6), Yd, Z(2.1), 0); col.rect([X(2.65), Z(1.7), X(4.55), Z(2.5)], Yd, Yd + 0.5);
  K.put(bag, (Q) => K.table(Q, 0.9, 0.6, 0.7), X(3.6), Yd, Z(3.6), 0); col.rect([X(3.15), Z(3.3), X(4.05), Z(3.9)], Yd, Yd + 0.7);
  K.pushLight(ctx, [X(3.6), Yd + 1.9, Z(3.6)], 2.5, 7);
  // the washing line on the east side: two poles on stone feet and cloth hung over a cord, jars and a pot
  const cloths = ['cloth_white', 'cloth_indigo', 'cloth_ochre', 'cloth_white'], l0 = Z(2.2), l1 = Z(10.4), uL = X(15.2);
  for (const z of [l0, l1]) { bag.add('timber', box(uL - 0.05, Yd, z - 0.05, uL + 0.05, Yd + 1.9, z + 0.05)); bag.add('limestone', box(uL - 0.2, Yd, z - 0.2, uL + 0.2, Yd + 0.2, z + 0.2)); col.circle(uL, z, 0.2, Yd, Yd + 1.9); }
  bag.add('wicker', rb(uL - 0.015, Yd + 1.8, l0, uL + 0.015, Yd + 1.83, l1));
  cloths.forEach((c, i) => { const z = l0 + 1.1 + i * 1.8; bag.add(c, box(uL - 0.02, Yd + 0.75, z, uL + 0.02, Yd + 1.8, z + 1.0)); });
  K.put(bag, K.pithos, X(16.4), Yd, Z(9.6), 0); col.circle(X(16.4), Z(9.6), 0.45, Yd, Yd + 1.2);
  K.put(bag, K.amphora, X(16.4), Yd, Z(8.6), 0, 1.2);
  void kind;
}

/** The house's way up, in plan (u, v of the house) from the street, as a walk-check route in world coordinates; `g`: { x0, z0, x1, z1, dc, variant, kind, y }. */
export function upWalks(g) {
  const { x0, z0, dc, variant, kind, y } = g, X = (u) => x0 + u, Z = (v) => z0 + v, du = dc - x0;
  const W = (...p) => p.map(([u, v]) => [X(u), Z(v)]);
  // the ground floor's west half by the trade, to the door in the partition
  const via = {
    home: [[du, 12.4], [8.4, 11.0], [8.4, 6.2]],
    tavern: [[du, 12.7], [3.8, 12.7], [3.8, 10.8], [4.45, 8.8], [4.45, 5.3], [8.3, 6.2]],
    bakery: [[du, 12.4], [6.6, 10.5], [6.6, 6.2]],
    weaver: [[du, 12.4], [6.6, 10.5], [6.6, 6.2]],
    potter: [[du, 12.4], [6.6, 10.5], [6.6, 6.2]],
    smith: [[du, 12.4], [7.9, 10.5], [7.9, 6.2]],
  }[variant] ?? [[du, 12.4], [8.4, 11.0], [8.4, 6.2]];
  const up = [[10.3, 6.2], [14.0, 4.0], [14.5, 1.0], [16.6, 1.0], [16.6, 3.5], [16.6, 6.5], [16.6, 8.2]];
  const hall = [[8.5, 8.2], [7.4, 6.5], [4.2, 6.5], [7.4, 6.5], [8.5, 8.2], [8.5, 10.3], [9.6, 12.2], [9.6, 14.7]];
  const r1 = [[du, 16.5], [du, 13.6], ...via, ...up, ...hall];
  const routes = [Object.assign(W(...r1), { y0: y })];
  if (hasTerrace(kind)) {
    routes.push(Object.assign(W([16.6, 8.2], [11.6, 7.6], [11.6, 1.6], [12.9, 1.6], [12.9, 4.5], [12.9, 7.6], [10.0, 8.2], [7.2, 3.0]), { y0: y + 4.0 }));
  }
  return routes;
}
