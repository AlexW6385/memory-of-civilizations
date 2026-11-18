// A row of tabernae with its dwellings opened (docs/settlements/rome.md §4.16): the ground floor is the shops of the shared
// `taberna_row` (built by it, four shops); a fifth bay holds the street door and the timber stair to the flats; above, the
// pergula/first floor and the second floor are walkable: a hall (medianum) along the back with four rooms off it, windows with
// real reveals, a balcony (maenianum) over the street, poorer rooms on the second floor; the third storey stays a mass.
import { STYLES } from '../../core/build.js';
import '../../styles/roman/street.js';
import { hip } from '../../styles/roman/street.js';
import { makeT, frameOf, slab, wall, flight, flightRail, fence, windowDress, balcony, hash } from './upper.js';

export const F1 = 3.85, F2 = 6.85, F3 = 9.85, S0 = 17.6, RW = 22, RD = 8;
const ROOMS = [[0.4, 4.25], [4.55, 8.65], [8.95, 13.05], [13.35, 17.3]];
const YA = 0.9, WH = 1.2;

/** A row's rect with its stair bay (4.4 m at the high-u end) cut off: what the shared builder gets. */
function narrow(rect, f) { const r = [...rect]; if (f === 's' || f === 'n') r[2] -= 4.4; else r[3] -= 4.4; return r; }
/** The shared builder's own geometry above the shops (the mass of flats, the hip, the joists, the windows between the floors, the balcony inside the wall) is left out: it is built here, hollow. */
function filtered(ctx, y, F, ns) {
  const rint = F.R(0, RW, 0.6, RD), H = 3.7 + ns * 3.1, band = ns === 3 ? 9.9 : 9.3;
  const gone = (g) => {
    if (!g.boundingBox) g.computeBoundingBox();
    const b = g.boundingBox;
    if (b.min.y < y + 3.19) return false;
    const inside = b.max.x > rint[0] && b.min.x < rint[2] && b.max.z > rint[1] && b.min.z < rint[3];
    return inside || (b.min.y >= y + 3.65 && b.max.y <= y + band);
  };
  void H;
  const bag = new Proxy(ctx.bag, { get(t, k) { if (k === 'add') return (m, g) => { if (!gone(g)) t.add(m, g); }; const v = t[k]; return typeof v === 'function' ? v.bind(t) : v; } });
  const col = new Proxy(ctx.col, { get(t, k) { if (k === 'rect') return (r, y0, y1) => { if (y0 < y + 3.19) t.rect(r, y0, y1); }; const v = t[k]; return typeof v === 'function' ? v.bind(t) : v; } });
  return { ...ctx, bag, col };
}
export function rowLayout(seed, ns) {
  const roles1 = ['sleep', 'work', 'living', 'store'], k = Math.floor(hash(seed, 1, 2) * 4);
  const r1 = roles1.map((_, i) => roles1[(i + k) % 4]);
  // the rooms over the balcony (2, 3) are living and sleeping rooms
  r1[2] = hash(seed, 3) < 0.5 ? 'living' : 'sleep'; r1[3] = r1[2] === 'living' ? 'sleep' : 'living';
  const r2 = ROOMS.map((_, i) => (i === 1 ? 'store' : 'cenaculum'));
  return { r1, r2, ns };
}
export function rowRooms(seed, ns) {
  const L = rowLayout(seed, ns), out = [];
  ROOMS.forEach(([a, b], i) => { for (const [yf, role] of [[F1, L.r1[i]], [F2, L.r2[i]]]) out.push({ rect: [a, b, 0.5, 5.25], door: 'd1', dc: (b - a) / 2, y: yf, role }); });
  return out;
}

function tabernaUp(el, ctx) {
  const f = el.front ?? 's', y = el.y ?? 0, ns = el.storeys ?? 3, P = frameOf(el), H = 3.7 + ns * 3.1, top = ns === 3 ? F3 : H;
  const T = makeT(ctx, y, P);
  // the ground floor and the dressing of the shops: the shared builder, on the rect without the stair bay
  const el0 = { ...el, rect: narrow(el.rect, f), n: 4 };
  STYLES.roman.elements.taberna_row(el0, filtered(ctx, y, T, ns));
  const door = (uc, yf, hw = 0.6) => ({ a: uc - hw, b: uc + hw, ya: yf, yb: yf + 2.2 });
  // the front: windows over the shops' doors on the first floor, balcony doors for rooms 2 and 3, small windows on the second
  const fh = [], bh = [];
  ROOMS.forEach(([a, b], i) => {
    const uc = (a + b) / 2;
    fh.push(i >= 2 ? door(uc, F1) : { a: uc - 0.55, b: uc + 0.55, ya: F1 + YA, yb: F1 + YA + WH });
    fh.push({ a: uc - 0.5, b: uc + 0.5, ya: F2 + YA, yb: F2 + YA + WH });
  });
  const front = [...fh];
  wall(T, 'brick', true, 0, 0.5, 0, S0, 3.7, top, front);
  // the bay: door on the street, windows lighting the stair
  const bayF = [{ a: 17.95, b: 19.75, ya: -0.4, yb: 2.9 }, { a: 20.3, b: 20.9, ya: F1 + 1.0, yb: F1 + 1.9 }, { a: 20.3, b: 20.9, ya: F2 + 1.0, yb: F2 + 1.9 }];
  wall(T, 'brick', true, 0, 0.5, S0, RW, -0.4, top, bayF);
  T.B('travertine', 17.85, 19.85, -0.1, 0.5, -0.05, 0.04); T.B('travertine', 17.8, 19.9, -0.08, 0.5, 2.9, 3.2);
  for (const s of [17.8, 19.8]) T.B('brick', s - 0.13, s + 0.13, -0.1, 0.05, 0, 2.9);
  // the back, the ends, the wall to the bay, the partitions, the wall of the hall
  const backH = [];
  for (const c of [3, 8.5, 14]) for (const yf of [F1, F2]) backH.push({ a: c - 0.3, b: c + 0.3, ya: yf + 1.2, yb: yf + 2.0 });
  wall(T, 'brick', true, RD - 0.45, 0.45, 0, S0, 3.7, top, backH);
  wall(T, 'brick', true, RD - 0.45, 0.45, S0, RW, -0.4, top, [{ a: 20.3, b: 20.9, ya: F1 + 1.0, yb: F1 + 1.9 }, { a: 20.3, b: 20.9, ya: F2 + 1.0, yb: F2 + 1.9 }]);
  wall(T, 'brick', false, 0, 0.4, 0, RD, 3.7, top);
  wall(T, 'brick', false, RW - 0.4, 0.4, 0, RD, -0.4, top);
  wall(T, 'stucco_rome', false, 17.3, 0.3, 0.5, RD - 0.45, 3.7, top, [{ a: 6.1, b: 7.1, ya: F1, yb: F1 + 2.15 }, { a: 6.1, b: 7.1, ya: F2, yb: F2 + 2.15 }]);
  for (const u of [4.25, 8.65, 13.05]) wall(T, 'stucco_rome', false, u, 0.3, 0.5, 5.25, 3.7, top);
  const hd = [];
  ROOMS.forEach(([a, b]) => { const uc = (a + b) / 2; hd.push({ a: uc - 0.55, b: uc + 0.55, ya: F1, yb: F1 + 2.15 }, { a: uc - 0.55, b: uc + 0.55, ya: F2, yb: F2 + 2.15 }); });
  wall(T, 'stucco_rome', true, 5.25, 0.3, 0.4, 17.3, 3.7, top, hd);
  // the floors: first and second over the dwelling, and over the bay with the stair's openings
  const holeA = [17.75, 18.75, 0.5, 5.3], holeB = [20.4, 21.4, 1.7, 5.4];
  slab(T, [0.4, 17.3, 0.5, RD - 0.45], F1);
  slab(T, [17.6, 21.6, 0.5, RD - 0.45], F1, [holeA]);
  slab(T, [0.4, 17.3, 0.5, RD - 0.45], F2);
  slab(T, [17.6, 21.6, 0.5, RD - 0.45], F2, [holeB]);
  // the ground of the bay, the street stair, the second flight, their rails
  T.B('flagstone', S0, 21.6, 0.5, RD - 0.45, -0.3, 0.0); T.col.floor(T.R(S0, 21.6, 0.5, RD - 0.45), y + 0.02);
  const A = { u0: 17.75, u1: 18.75, d0: 0.7, d1: 5.3, up: '+d', yA: 0, yB: F1, n: 19 };
  flight(T, A); flightRail(T, A, 18.75, 1);
  const Bf = { u0: 20.4, u1: 21.4, d0: 1.7, d1: 5.4, up: '-d', yA: F1, yB: F2, n: 15 };
  flight(T, Bf); flightRail(T, Bf, 20.4, -1); fence(T, 20.4, 5.4, 21.4, 5.4, F2);
  // the balcony over the street from the rooms 2 and 3, the windows' dressing
  balcony(T, 9.2, 17.1, F1);
  ROOMS.forEach(([a, b], i) => { const uc = (a + b) / 2; if (i < 2) windowDress(T, uc, 0.55, F1 + YA, F1 + YA + WH, hash(uc, F1, el.seed ?? 0)); windowDress(T, uc, 0.5, F2 + YA, F2 + YA + WH, hash(uc, F2, el.seed ?? 0)); });
  // the top: a mass of the third storey, or the ceiling under the roof; the hip over all
  if (ns === 3) { T.B('brick', 0, RW, 0, RD, F3, H, true); for (let u = 0.65; u < 21.5; u += 0.75) T.B('wood_dark', u - 0.07, u + 0.07, 0.5, RD - 0.45, F3 - 0.3, F3); }
  else { T.B('timber', 0.4, 21.6, 0.5, RD - 0.45, H - 0.15, H); for (let u = 0.65; u < 21.5; u += 0.75) T.B('wood_dark', u - 0.07, u + 0.07, 0.5, RD - 0.45, H - 0.45, H - 0.15); }
  hip(ctx, T.R(0, RW, 0, RD), y + H, Math.min(RW, RD) * 0.2);
  // the cornice over the bay (the shared builder's stops at the fourth shop)
  T.B('brick', 17.85, RW + 0.25, -0.05, 0.26, H - 0.34, H - 0.12); T.B('travertine', 17.85, RW + 0.4, -0.05, 0.4, H - 0.12, H);
}
STYLES.roman.elements.taberna_up = tabernaUp;

/** The furnishing plan element of an opened row: rooms of both floors, the halls, the lobby of the bay. */
export function rowFurnElement(row) {
  const rooms = rowRooms(row.seed, row.storeys ?? 3);
  return { t: 'up_cells', rect: row.rect, front: row.front, y: 0, rooms, halls: [{ rect: [0.4, 17.3, 5.55, 7.55], y: F1 }, { rect: [0.4, 17.3, 5.55, 7.55], y: F2 }] };
}
