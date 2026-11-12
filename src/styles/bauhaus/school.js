// The Bauhaus building, Dessau, 1926 (docs/settlements/bauhaus-dessau.md §1–§2, §6): the workshop wing with its glass curtain wall,
// the bridge over Kothener Strasse, the north wing, the festive block (Aula, stage, canteen) and the Prellerhaus with its balconies —
// every part enterable and furnished. Plan coordinates: +x east, +z south, metres.
import { S, wall, slab, rail, scissor, chair, stool, table, pendant, bench, loom, machine, saw, boards, desk, cabinet, board, easel, bed, vitrine, rng } from './kit.js';
import { LV, PL, B } from '../../settlements/bauhaus-dessau/layout.js';

const TH = 0.3, F0 = LV.f0, F1 = LV.f1, F2 = LV.f2, FR = LV.roof;
const WHITE = 'plaster_white';
const DOOR_H = 2.4;

/** Ribbon windows along a wall from u0 to u1: panes of width w between piers, skipping the spans in `skip`. */
function ribbon(u0, u1, y0, y1, o = {}) {
  const sill = o.sill ?? 0.95, head = o.head ?? 0.55, w = o.w ?? 2.2, pier = o.pier ?? 0.8, skip = o.skip ?? [], out = [];
  const n = Math.max(1, Math.floor((u1 - u0 - pier) / (w + pier)));
  const step = (u1 - u0 - pier) / n;
  for (let i = 0; i < n; i++) {
    const a = u0 + pier + i * step - pier / 2 + pier / 2, b = a + step - pier;
    if (b - a < 0.5) continue;
    if (skip.some(([s0, s1]) => !(b < s0 - 0.15 || a > s1 + 0.15))) continue;
    out.push({ u0: a, u1: b, y0: y0 + sill, y1: y1 - head, kind: 'win' });
  }
  return out;
}
/** One side of a rectangle's storey y0..y1: its wall with ribbon windows, plus the given doors ([u0, u1, height]). */
function side(sk, rect, which, y0, y1, o = {}) {
  const [x0, z0, x1, z1] = rect, th = o.th ?? TH, h = which === 'n' || which === 's';
  const a = which === 'n' ? [x0 + th, z0 + th / 2] : which === 's' ? [x0 + th, z1 - th / 2] : which === 'w' ? [x0 + th / 2, z0] : [x1 - th / 2, z0];
  const b = which === 'n' ? [x1 - th, z0 + th / 2] : which === 's' ? [x1 - th, z1 - th / 2] : which === 'w' ? [x0 + th / 2, z1] : [x1 - th / 2, z1];
  const out = which === 'n' ? [0, -1] : which === 's' ? [0, 1] : which === 'w' ? [-1, 0] : [1, 0];
  const doors = (o.doors ?? []).map(([u0, u1, hh = DOOR_H]) => ({ u0, u1, y1: y0 + hh, kind: 'door' }));
  const u0 = h ? a[0] : a[1], u1 = h ? b[0] : b[1];
  const wins = o.win === false ? [] : ribbon(u0 + 0.2, u1 - 0.2, y0, y1, { ...(o.rib ?? {}), skip: [...doors.map((d) => [d.u0, d.u1]), ...(o.skip ?? [])] });
  wall(sk, { a, b, th, y0, y1, mat: o.mat ?? WHITE, openings: [...doors, ...wins, ...(o.gaps ?? [])], out });
}
/** An inner wall on x = c (z from a to b) or z = c, with doors ([u0, u1]) from the floor y to y + h. */
function part(sk, axis, c, a, b, y, h, doors = [], o = {}) {
  const ops = doors.map(([u0, u1, hh = DOOR_H]) => ({ u0, u1, y1: y + hh, kind: 'door' }));
  wall(sk, { a: axis === 'x' ? [c, a] : [a, c], b: axis === 'x' ? [c, b] : [b, c], th: o.th ?? 0.2, y0: y, y1: y + h, mat: o.mat ?? WHITE, openings: ops });
  if (o.band) {       // a band of colour along the wall, both faces
    const t = (o.th ?? 0.2) / 2 + 0.01;
    for (const [u0, u1] of spans(a, b, doors)) {
      if (axis === 'x') sk.b(o.band, c - t, y + 0.0, u0, c + t, y + 1.05, u1); else sk.b(o.band, u0, y + 0.0, c - t, u1, y + 1.05, c + t);
    }
  }
}
function spans(a, b, doors) {
  const cuts = [a, ...doors.flatMap(([u0, u1]) => [u0, u1]), b].sort((p, q) => p - q), out = [];
  for (let i = 0; i + 1 < cuts.length; i += 2) if (cuts[i + 1] - cuts[i] > 0.2) out.push([cuts[i], cuts[i + 1]]);
  return out;
}
/** Visual steps climbing y0 → y1 along `dir` over the rect, with a ramp collider (the walker steps up them). */
function steps(sk, rect, y0, y1, dir, mat = 'concrete_light') {
  const n = Math.max(2, Math.round((y1 - y0) / 0.2)), alongX = dir === 'e' || dir === 'w', L = alongX ? rect[2] - rect[0] : rect[3] - rect[1];
  for (let i = 0; i < n; i++) {
    const f0 = i / n, f1 = (i + 1) / n, t = y0 + (y1 - y0) * f1;
    const a = dir === 'e' || dir === 's' ? L * f0 : L * (1 - f1), b = dir === 'e' || dir === 's' ? L * f1 : L * (1 - f0);
    if (alongX) sk.b(mat, rect[0] + a, y0 - 0.05, rect[1], rect[0] + b, t, rect[3]); else sk.b(mat, rect[0], y0 - 0.05, rect[1] + a, rect[2], t, rect[1] + b);
  }
  sk.col.ramp(rect, y0, y1, dir);
}
/** A flat roof: the asphalt slab, a low parapet round it (blocking), the holes left open. */
function roof(sk, rect, y, holes = [], parapet = 0.55) {
  slab(sk, [rect[0] + 0.05, rect[1] + 0.05, rect[2] - 0.05, rect[3] - 0.05], y, holes, { mat: 'concrete_light', top: 'asphalt' });
  const [x0, z0, x1, z1] = rect, t = 0.22, py = y + 0.03;
  sk.s(WHITE, x0, py, z0, x1, py + parapet, z0 + t); sk.s(WHITE, x0, py, z1 - t, x1, py + parapet, z1);
  sk.s(WHITE, x0, py, z0 + t, x0 + t, py + parapet, z1 - t); sk.s(WHITE, x1 - t, py, z0 + t, x1, py + parapet, z1 - t);
  sk.b('concrete_light', x0 - 0.04, py + parapet, z0 - 0.04, x1 + 0.04, py + parapet + 0.05, z0 + t + 0.04);
  sk.b('concrete_light', x0 - 0.04, py + parapet, z1 - t - 0.04, x1 + 0.04, py + parapet + 0.05, z1 + 0.04);
}
/** A floor covering over a slab (visual only), `mat` over the rect at y. */
const cover = (sk, rect, y, mat) => sk.b(mat, rect[0], y, rect[1], rect[2], y + 0.012, rect[3]);

// ── the workshop wing ─────────────────────────────────────────────────────────────────────────
function workshopWing(sk) {
  const [x0, z0, x1, z1] = B.ww, F = [F0, F1, F2, FR];
  // ground plinth and floor
  sk.b('concrete_light', x0, 0, z0, x1, F0, z1); sk.fl([x0, z0, x1, z1], F0);
  // stair hall at the corridor's south end: two lanes of a scissor stair from the ground to the roof
  const L1 = [-3.9, -2.4], L2 = [-2.4, -0.9], ZA = 25, ZB = 33;
  const holes = scissor(sk, { l1: L1, l2: L2, za: ZA, zb: ZB, ys: [F0, F1, F2, FR] });
  for (let k = 1; k <= 2; k++) slab(sk, [x0 + 0.05, z0 + 0.05, x1 - 0.05, z1 - 0.05], F[k], [holes[k]], { mat: 'concrete_light' });
  roof(sk, [x0, z0, x1, z1], FR, [holes[3]]);
  rail(sk, [L1[0], ZA], [L2[1], ZA], FR, 'steel_chrome'); // the roof edge of the stair hole's open end
  // the glass curtain wall on the west face: panes, mullions every 1.25 m, transoms at every floor and sill
  // (the glass is drawn only where it covers the slab edges and the sills — the dark bands of the photographs; between them the panes are left open to the eye
  // so that the workshops behind the wall read from the street: the palette's glass is opaque)
  for (const [ya, yb] of [[F0, F0 + 0.95], [F1 - 0.55, F1 + 0.35], [F2 - 0.55, F2 + 0.35], [FR - 0.95, FR]]) sk.pane('glass_outer', { alongX: false, x: x0, u0: z0 + 0.05, u1: z1 - 0.05, y0: ya, y1: yb, n: -1 });
  // sky-reflecting upper lights: every third bay's panes at the heads of the 2nd and 3rd floors, tilted open (the louvred sashes, opened by a mechanism)
  for (const y of [F1 + 2.2, F2 + 2.2]) for (let u = z0 + 1.3; u + 1.25 < z1; u += 3.75) sk.pane('glass_outer', { alongX: false, x: x0 - 0.02, u0: u, u1: u + 1.25 - 0.06, y0: y, y1: y + 0.9, n: -1 });
  for (let u = z0 + 0.05; u <= z1 + 0.01; u += 1.25) sk.b('steel_grey', x0 - 0.07, F0, u - 0.03, x0 + 0.03, FR, u + 0.03);
  for (const y of [F0 + 0.0, F1 - 0.6, F1 + 0.9, F1 + 2.2, F2 - 0.6, F2 + 0.9, F2 + 2.2, FR - 0.06]) sk.b('steel_grey', x0 - 0.07, y, z0, x0 + 0.03, y + 0.07, z1);
  sk.b('steel_grey', x0 - 0.07, F0 + 1.0, z0, x0 + 0.03, F0 + 1.07, z1);
  sk.col.segment([x0 + 0.02, z0], [x0 + 0.02, z1], 0.12, 0, FR + 1);
  // the north, south and east walls, storey by storey
  for (let k = 0; k < 3; k++) {
    const y0 = F[k], y1 = F[k + 1];
    side(sk, B.ww, 'n', y0, y1, { doors: k === 0 ? [] : [[-8, -5.6]] });
    side(sk, B.ww, 's', y0, y1, { skip: [[L1[0] - 0.6, L2[1] + 0.6]] });
    side(sk, B.ww, 'e', y0, y1, { doors: k === 0 ? [[8, 10.4], [22, 24.6]] : [] });
    if (k > 0) slab(sk, [x0, z0, x0 + 0.05, z1], y0, []); // (the slab's glass-side edge is behind the glass)
  }
  // floor coverings and rooms
  const rooms = [[x0, 4, 1, 14], [x0, 14, -4.55, 24], [x0, 24, -4.55, 34]];
  for (let k = 0; k < 3; k++) {
    const y = F[k];
    for (const r of rooms) cover(sk, [r[0] + 0.05, r[1] + 0.2, r[2] - 0.2, r[3] - 0.2], y + 0.0, k === 0 ? 'concrete_light' : 'wood_ochre');
    // partitions: the workshops' wall to the corridor (x −4.4) with a door each, their wall to each other (z 24), the north wall of the first (z 14)
    part(sk, 'x', -4.4, 14, 34, y, 4.1, k === 0 ? [[17, 19], [28, 30]] : [[17, 19]], { band: k === 0 ? 'paint_cab_yellow' : k === 1 ? 'car_blue' : 'car_red' });
    part(sk, 'z', 24, x0 + 0.15, -4.5, y, 4.1, [[-12, -10]]);
    part(sk, 'z', 14, x0 + 0.15, -4.5, y, 4.1, [[-10, -8]]);
  }
  // the stair hall: a colour on the wall of the stair
  sk.b('car_red', -4.5, F0, 25, -4.46, F0 + 1.4, 33);
  // GROUND: the vestibule with the exhibition of the school's goods, carpentry in two bays
  {
    const y = F0;
    for (const [a, b, c, d] of [[-14, 5.6, -12.6, 6.8], [-10.8, 5.6, -9.4, 6.8], [-14, 11, -12.6, 12.2], [-10.8, 11, -9.4, 12.2]]) vitrine(sk, a, b, c, d, y, 'steel_chrome');
    for (const z of [8, 9.5]) { chair(sk, -14.5, y, z, 1); chair(sk, -3, y, z, 3); }
    table(sk, -6.5, 7.2, -5.2, 8.0, y, 0.45, 'wood_painted', 'steel_chrome');
    // carpentry A: two benches, a circular saw, boards, a stool at each
    bench(sk, -15.2, 17.0, -12.0, 18.1, y); bench(sk, -15.2, 20.4, -12.0, 21.5, y); saw(sk, -9, y, 20.5);
    boards(sk, -16.4, 22.6, -14.4, 23.8, y, 9); boards(sk, -7, 14.5, -5.2, 15.7, y, 6);
    for (const [x, z] of [[-13.6, 18.7], [-13.6, 22.1], [-11, 18.0]]) stool(sk, x, y, z);
    // carpentry B: machines (a lathe, a planer, a band saw) along the glass, benches, tool cabinets on the partition
    machine(sk, -14.5, y, 26.5, 1.8, 'steel_grey'); machine(sk, -14.5, y, 30.2, 1.6, 'steel_grey'); saw(sk, -9.5, y, 27.5);
    bench(sk, -11, 31, -7.6, 32.1, y);
    cabinet(sk, -8.2, 24.2, -5.2, 24.9, y, 1.9, 'wood_painted', 's');
    stool(sk, -9.8, y, 29.6); stool(sk, -7.5, y, 30.3);
    pendant(sk, -10, F1 - 0.3, 18.5, 0.6, false); pendant(sk, -10, F1 - 0.3, 29, 0.6, true);
  }
  // FIRST FLOOR: the lecture hall (benches, a blackboard), the weaving workshop in two bays
  {
    const y = F1;
    board(sk, { alongX: true, c: 13.9, u0: -15.5, u1: -6.5, y0: y + 1.0, y1: y + 2.4, sgn: -1 });
    for (const z of [6.0, 7.7, 9.4, 11.1]) for (const x of [-15.2, -10.4]) { table(sk, x, z, x + 3.6, z + 0.5, y, 0.74); stool(sk, x + 0.9, y, z + 0.95); stool(sk, x + 2.7, y, z + 0.95); }
    for (const [x, z, c] of [[-14.5, 16.8, 'cloth_red'], [-11, 16.8, 'cloth_blue'], [-7.4, 16.8, 'cloth_ochre'], [-14.5, 21.6, 'cloth_green'], [-11, 21.6, 'cloth_red'], [-7.4, 21.6, 'cloth_indigo']]) loom(sk, x, y, z, c);
    for (const [x, z, c] of [[-14.5, 26.6, 'cloth_ochre'], [-11, 26.6, 'cloth_red'], [-14.5, 31.4, 'cloth_blue']]) loom(sk, x, y, z, c);
    table(sk, -9, 30.8, -5.4, 31.8, y, 0.8, 'wood_ochre', 'timber');   // the dyer's and cutter's table with bolts of cloth
    for (const [i, c] of ['cloth_red', 'cloth_ochre', 'cloth_blue', 'cloth_green'].entries()) sk.b(c, -9 + i * 0.85, y + 0.8, 30.9, -9 + i * 0.85 + 0.7, y + 0.95, 31.7);
    cabinet(sk, -8.2, 24.2, -5.2, 24.9, y, 1.9, 'wood_painted', 's');
    pendant(sk, -10, F2 - 0.3, 19, 0.6, false);
  }
  // SECOND FLOOR: the exhibition hall (folding partition), the metal workshop with Brandt's lamps, the wall-painting workshop
  {
    const y = F2;
    for (const [a, b, c, d] of [[-14.5, 6, -13.3, 7.2], [-11.5, 6, -10.3, 7.2], [-8.5, 6, -7.3, 7.2], [-14.5, 11, -13.3, 12.2], [-11.5, 11, -10.3, 12.2]]) vitrine(sk, a, b, c, d, y, 'steel_chrome');
    sk.b('cloth_white', -17 + 0.2, y, 8.9, -16.9, y + 3.2, 9.1);
    for (const x of [-15, -12.5]) bench(sk, x - 1.1, 15.8, x + 1.1, 16.9, y);
    bench(sk, -15.4, 19.6, -12.4, 20.7, y); bench(sk, -9.2, 15.8, -6.6, 16.9, y, false);
    machine(sk, -8.5, y, 22.2, 1.6, 'steel_grey');
    sk.b('iron', -14.2, y, 22.0, -13.4, y + 0.75, 22.8); sk.b('iron', -14.45, y + 0.75, 21.9, -13.15, y + 0.85, 22.9);    // the anvil
    for (const x of [-14.6, -12.3, -10.0, -7.7]) pendant(sk, x, F2 + 3.6, 18.3, 1.0, x === -12.3 || x === -7.7);
    for (const [x, z, c] of [[-14.8, 26.8, 'car_red'], [-12.2, 28.8, 'car_blue'], [-9.6, 26.8, 'paint_cab_yellow']]) easel(sk, x, y, z, c);
    table(sk, -8.6, 31.0, -5.4, 32.0, y, 0.8, 'paint_white', 'steel_chrome');
    for (const [i, c] of ['car_red', 'car_blue', 'paint_cab_yellow', 'cloth_green', 'car_black'].entries()) sk.b(c, -8.4 + i * 0.6, y + 0.8, 31.2, -8.4 + i * 0.6 + 0.5, y + 0.84, 31.8);
    cabinet(sk, -8.2, 24.2, -5.2, 24.9, y, 1.9, 'wood_painted', 's');
  }
  // the corridors: a Breuer bench by the stair, notice boards, the school's lettering
  for (const y of [F0, F1, F2]) {
    sk.b('wood_painted', 0.2, y + 0.42, 16.5, 0.7, y + 0.46, 19.5); chair(sk, 0.45, y, 20.6, 3);
    board(sk, { alongX: false, c: 0.7, u0: 15.5, u1: 20.5, y0: y + 1.2, y1: y + 2.0, sgn: -1, mat: 'cloth_brown' });
  }
  // BAUHAUS in tall letters down the west wing's north end (black strips on the plaster, outside)
  for (let i = 0; i < 7; i++) { const z = z0 + 0.5 + i * 0.0; void z; }
}

// ── the bridge ────────────────────────────────────────────────────────────────────────────────
function bridge(sk) {
  const [x0, z0, x1, z1] = B.bridge;
  for (const x of [x0 + 0.3, x1 - 0.9, (x0 + x1) / 2 - 0.3]) for (const z of [z0 + 0.1, z1 - 0.7]) sk.s('concrete_light', x, 0, z, x + 0.6, F1 - 0.3, z + 0.6);
  for (const [k, y] of [[1, F1], [2, F2]]) {
    slab(sk, [x0, z0, x1, z1], y, [], { mat: 'concrete_light' });
    side(sk, B.bridge, 'w', y, y + 4.1, { th: 0.3 }); side(sk, B.bridge, 'e', y, y + 4.1, { th: 0.3 });
    cover(sk, [x0 + 0.3, z0, x1 - 0.3, z1], y, 'wood_ochre');
    void k;
  }
  roof(sk, [x0, z0, x1, z1], FR);
  // the lower level: the administration (desks with typewriters, filing cabinets, a counter); the upper: Gropius's building office
  {
    const y = F1;
    for (const [x, z, r] of [[-12.6, -6.5, 0], [-9.6, -6.5, 0], [-12.6, -1.5, 0], [-9.6, -1.5, 0]]) desk(sk, x, y, z, r, 'office');
    cabinet(sk, -14.5, -9.6, -11.2, -9.0, y, 1.9, 'wood_painted', 's'); cabinet(sk, -14.5, 3.2, -11.2, 3.8, y, 1.9, 'wood_painted', 'n');
    sk.s('wood_ochre', -4.5, y, -8.5, -3.8, y + 1.05, -4.0); sk.s('wood_ochre', -4.5, y, -1.5, -3.8, y + 1.05, 2.5);
    pendant(sk, -10, F2 - 0.3, -2, 0.7, true);
  }
  {
    const y = F2;
    table(sk, -12.5, -6.5, -8, -4.5, y, 0.8, 'wood_ochre', 'steel_chrome');           // the long plan table, a plan unrolled on it
    sk.b('paint_white', -12.2, y + 0.8, -6.3, -8.3, y + 0.82, -4.7);
    for (const [x, z, r] of [[-12.6, 0.2, 0], [-9.6, 0.2, 0], [-6.8, -7, 0]]) desk(sk, x, y, z, r, 'draft');
    chair(sk, -10.3, y, -3.6, 0); chair(sk, -12.5, y, -3.7, 0);
    cabinet(sk, -14.5, -9.6, -11.2, -9.0, y, 1.9, 'wood_painted', 's');
    pendant(sk, -10, FR - 0.3, -2, 0.7, true);
  }
}

// ── the north wing ────────────────────────────────────────────────────────────────────────────
function northWing(sk) {
  const [x0, z0, x1, z1] = B.nw, F = [F0, F1, F2, FR];
  sk.b('concrete_light', x0, 0, z0, x1, F0, z1); sk.fl([x0, z0, x1, z1], F0);
  const L1 = [-16.2, -14.7], L2 = [-14.7, -13.2], ZA = -27.4, ZB = -19.4;
  const holes = scissor(sk, { l1: L1, l2: L2, za: ZA, zb: ZB, ys: [F0, F1, F2, FR] });
  for (let k = 1; k <= 2; k++) slab(sk, [x0 + 0.05, z0 + 0.05, x1 - 0.05, z1 - 0.05], F[k], [holes[k]], { mat: 'concrete_light' });
  roof(sk, [x0, z0, x1, z1], FR, [holes[3]]);
  const COLS = [[-11, 0.5], [0.5, 12], [12, 23.5], [23.5, 35]];
  for (let k = 0; k < 3; k++) {
    const y = F[k], y1 = F[k + 1];
    side(sk, B.nw, 'n', y, y1, { rib: { w: 2.6, pier: 0.7 } });
    side(sk, B.nw, 's', y, y1, { doors: k === 0 ? [[8, 10.4]] : [], gaps: [], skip: k === 0 ? [] : [[-8, -5.6]], ...(k === 0 ? {} : { doors: [[-8, -5.6]] }) });
    side(sk, B.nw, 'w', y, y1, { rib: { w: 2.4, pier: 0.8 } }); side(sk, B.nw, 'e', y, y1);
    // the corridor's wall (z −13) with a door to each room, the stair hall's wall (x −11) open at the corridor
    part(sk, 'z', -13, -11, x1 - 0.15, y, 4.1, COLS.map(([a, b]) => [(a + b) / 2 - 0.5, (a + b) / 2 + 0.5]), { band: k === 0 ? 'paint_cab_yellow' : k === 1 ? 'car_blue' : 'car_red' });
    part(sk, 'x', -11, z0 + 0.15, -13.1, y, 4.1);
    for (const x of [0.5, 12, 23.5]) part(sk, 'x', x, z0 + 0.15, -13.1, y, 4.1);
    for (const [a, b] of COLS) cover(sk, [a + 0.15, z0 + 0.3, b - 0.15, -13.2], y, 'wood_ochre');
    // the rooms
    COLS.forEach(([a, b], i) => {
      const cx = (a + b) / 2, library = k === 1 && i >= 2;
      board(sk, { alongX: true, c: -13.1, u0: cx - 1.9, u1: cx + 1.9, y0: y + 1.0, y1: y + 2.3, sgn: -1 });
      if (library) {
        // shelves along the east and west walls, reading tables with Breuer chairs
        for (const sx of [a + 0.4, b - 0.8]) cabinet(sk, sx, -27.3, sx + 0.4, -18, y, 2.1, 'wood_painted', sx < cx ? 'e' : 'w');
        for (const zz of [-24.5, -21.5, -18]) { table(sk, cx - 1.5, zz, cx + 1.5, zz + 0.8, y, 0.74); for (const s of [-1, 1]) chair(sk, cx + s * 0.8, y, zz + 1.25, 0); }
        sk.b('car_red', cx - 1, y + 0.9, -27.5, cx + 1, y + 1.7, -27.45);
        { const rr = rng(i * 13 + 5); bookRows(sk, a + 0.8, -27.1, -18.2, y, 2.1, 1, rr); bookRows(sk, b - 0.8, -27.1, -18.2, y, 2.1, -1, rr); }
      } else {
        const tz = [-26.5, -23.5, -20.5, -17.5];
        for (const z of tz) for (const dx of [-2.6, 0.2]) { table(sk, cx + dx - 0.4, z, cx + dx + 1.2, z + 0.7, y, 0.76); stool(sk, cx + dx + 0.2, y, z + 1.1); stool(sk, cx + dx + 0.9, y, z + 1.1); }
      }
      if (i === 1 && k !== 1) pendant(sk, cx, y + 3.7, -21, 0.9, k === 2);
    });
    // the stair hall's furniture, a bench between the stair and the corridor
    sk.b('wood_painted', -16.4, y + 0.42, -17.5, -15.0, y + 0.46, -17.0);
  }
  // an entrance canopy over the door on Kothener Strasse
  sk.b('concrete_light', 6.6, 3.3, z1 - 0.0, 12.0, 3.45, z1 + 1.6); sk.b('steel_grey', 6.65, 3.45, z1 + 1.55, 11.95, 3.55, z1 + 1.6);
  sk.k(6.6, 3.3, z1, 12.0, 3.5, z1 + 1.6);
}

// ── the festive block ─────────────────────────────────────────────────────────────────────────
function festBlock(sk) {
  const [x0, z0, x1, z1] = B.fest, top = 4.2, y = F0;
  sk.b('concrete_light', x0, 0, z0, x1, F0, z1); sk.fl([x0, z0, x1, z1], F0);
  roof(sk, [x0, z0, x1, z1], top);
  // the outer walls: north on the court (clerestory ribbon), south with the Aula's tall glazing, east shared with the Prellerhaus
  wall(sk, { a: [x0, z0 + 0.15], b: [x1, z0 + 0.15], th: TH, y0: y, y1: top, mat: WHITE, out: [0, -1], openings: [{ u0: 3.4, u1: 5.6, y1: y + DOOR_H, kind: 'door' }, ...ribbon(x0 + 6, x1 - 1, y, top, { sill: 1.5, head: 0.4, w: 2.6, pier: 0.7 })] });
  wall(sk, { a: [x0, z1 - 0.15], b: [x1, z1 - 0.15], th: TH, y0: y, y1: top, mat: WHITE, out: [0, 1], openings: [...ribbon(x0 + 0.6, x1 - 0.6, y, top, { sill: 0.7, head: 0.45, w: 3.2, pier: 0.7 })] });
  wall(sk, { a: [x1 - 0.15, z0], b: [x1 - 0.15, z1], th: 0.3, y0: y, y1: top, mat: WHITE, openings: [{ u0: 24, u1: 26.4, y1: y + DOOR_H, kind: 'door' }] });
  // the inner walls: foyer | Aula | stage | canteen, wide openings on festive occasions (here: always open)
  part(sk, 'x', 7, z0 + 0.3, z1 - 0.3, y, top - y, [[18.5, 29.5, 3.2]]);
  part(sk, 'x', 25, z0 + 0.3, z1 - 0.3, y, top - y, [[17, 31, 3.4]]);
  part(sk, 'x', 33, z0 + 0.3, z1 - 0.3, y, top - y, [[17, 31, 3.4]]);
  for (const [a, b] of [[x0 + 0.2, 7], [7, 25], [33, x1 - 0.2]]) cover(sk, [a + 0.1, z0 + 0.3, b - 0.1, z1 - 0.3], y, a === 7 ? 'wood_ochre' : 'concrete_light');
  // the stage: raised 0.9 m, curtains folded at the proscenium, steps from the Aula and the canteen
  const sy = y + 0.9;
  sk.b('wood_painted', 25.1, y, z0 + 0.3, 32.9, sy, z1 - 0.3); sk.fl([25.1, z0 + 0.3, 32.9, z1 - 0.3], sy);
  cover(sk, [25.1, z0 + 0.3, 32.9, z1 - 0.3], sy, 'wood_ochre');
  steps(sk, [23.8, 21, 25.1, 24.5], y, sy, 'e'); steps(sk, [32.9, 21, 34.2, 24.5], y, sy, 'w');
  for (const z of [17.3, 30.0]) sk.s('cloth_red', 25.2, sy, z - 0.0, 25.8, sy + 3.0, z + 0.9);
  sk.b('cloth_grey', 32.5, sy, 17, 32.7, sy + 3.1, 31);
  pendant(sk, 29, top - 0.1, 21, 0.6, true); pendant(sk, 29, top - 0.1, 27, 0.6, false);
  // the Aula: rows of Breuer chairs facing the stage, a centre aisle, lamps
  for (let r = 0; r < 6; r++) for (let c = 0; c < 6; c++) for (const base of [15.3, 25.4]) chair(sk, 10 + r * 1.35, y, base + c * 1.0, 1);
  sk.b('wood_painted', 8.2, y, 15.3, 9.0, y + 0.45, 31.5); sk.k(8.2, y, 15.3, 9.0, y + 0.45, 31.5);
  for (const x of [11, 17]) pendant(sk, x, top - 0.1, 24, 0.7, x === 11);
  // the foyer: coat rails, a bench, the cloakroom hatch
  sk.b('steel_chrome', 1.4, y + 1.7, 15.0, 6.6, y + 1.74, 15.04); for (let i = 0; i < 12; i++) sk.b(i % 3 ? 'cloth_grey' : 'cloth_brown', 1.6 + i * 0.4, y + 0.6, 14.85, 1.8 + i * 0.4, y + 1.7, 15.1);
  sk.b('wood_painted', 2.2, y + 0.42, 32.4, 5.6, y + 0.46, 33.0);
  // the canteen: tables with tubular chairs, the serving hatch on the stage wall
  for (const x of [34.6, 37.7]) for (const z of [15.5, 19, 28.2, 31.4]) {
    table(sk, x, z, x + 0.75, z + 1.9, y, 0.74, 'wood_painted', 'steel_chrome');
    for (const s of [0, 1]) { chair(sk, x - 0.45, y, z + 0.4 + s * 1.1, 1); chair(sk, x + 1.2, y, z + 0.5 + s * 1.1, 3); }
  }
  sk.s('steel_grey', 33.2, y, 14.4, 40.6, y + 1.0, 15.0); sk.b('steel_chrome', 33.2, y + 1.0, 14.4, 40.6, y + 1.05, 15.0);
  pendant(sk, 36, top - 0.1, 24, 0.7, true);
}

// ── the Prellerhaus ───────────────────────────────────────────────────────────────────────────
function prellerhaus(sk) {
  const [x0, z0, x1, z1] = B.pre, XB = 49.7, main = [x0, z0, XB, z1], F = [PL.f0, PL.f1, PL.f2, PL.f3, PL.f4, PL.roof];
  const L1 = [41.4, 42.9], L2 = [42.9, 44.4], ZA = 26, ZB = 32, CX = 44.4;
  sk.b('concrete_light', x0, 0, z0, XB, F[0], z1); sk.fl([x0, z0, XB, z1], F[0]);
  const holes = scissor(sk, { l1: L1, l2: L2, za: ZA, zb: ZB, ys: F.slice(0, 5) });
  for (let k = 1; k <= 4; k++) slab(sk, [x0 + 0.05, z0 + 0.05, XB - 0.05, z1 - 0.05], F[k], [holes[k]], { mat: 'concrete_light' });
  roof(sk, main, F[5]);
  const SZ = (z1 - 0.3 - (z0 + 0.3)) / 7;
  for (let k = 0; k < 5; k++) {
    const y = F[k], y1 = F[k + 1], studios = k > 0;
    side(sk, main, 'n', y, y1, { rib: { w: 1.6, pier: 0.7 } });
    side(sk, main, 's', y, y1, { rib: { w: 1.6, pier: 0.7 } });
    const doors = studios ? Array.from({ length: 7 }, (_, i) => z0 + 0.3 + i * SZ + SZ / 2 - 0.8).map((c) => [c, c + 1.6, 2.4]) : [[20, 22.4], [12, 13.4]];
    side(sk, main, 'e', y, y1, { doors: studios ? doors : [[12, 13.6]], rib: { w: 1.2, pier: 0.5, sill: 1.0 } });
    side(sk, main, 'w', y, y1, { doors: k === 0 ? [[24, 26.4]] : [], rib: { w: 1.4, pier: 0.7 } });
    // the corridor's wall with a door to each studio
    const cdoors = studios ? Array.from({ length: 7 }, (_, i) => z0 + 0.3 + i * SZ + SZ / 2 - 0.45).map((c) => [c, c + 0.9]) : [[14, 15.4], [24, 25.4]];
    part(sk, 'x', CX, z0 + 0.15, z1 - 0.15, y, y1 - y, cdoors, { th: 0.2 });
    cover(sk, [x0 + 0.3, z0 + 0.3, CX - 0.1, z1 - 0.3], y, 'concrete_light');
    if (studios) {
      for (let i = 1; i < 7; i++) part(sk, 'z', z0 + 0.3 + i * SZ, CX + 0.1, XB - 0.15, y, y1 - y, [], { th: 0.15 });
      for (let i = 0; i < 7; i++) {
        const za = z0 + 0.3 + i * SZ, zb = za + SZ, zm = (za + zb) / 2, r = rng(k * 17 + i + 3);
        cover(sk, [CX + 0.15, za + 0.1, XB - 0.15, zb - 0.1], y, 'wood_ochre');
        cabinet(sk, CX + 0.12, za + 0.1, CX + 0.6, za + 1.2, y, 2.2, 'wood_painted', 'e');
        bed(sk, 45.2, za + 0.12, y, ['cloth_red', 'cloth_ochre', 'cloth_blue', 'cloth_green'][Math.floor(r() * 4)], false);
        table(sk, 47.9, zm + 0.5, 49.0, zm + 1.3, y, 0.74, 'wood_painted', 'steel_chrome');
        chair(sk, 47.3, y, zm + 0.9, 1);
        stool(sk, 46.2, y, zb - 0.55);
        // the balcony
        const b0 = za + 0.2, b1 = zb - 0.2;
        slab(sk, [XB, b0, x1, b1], y, [], { mat: 'concrete_light', th: 0.2 });
        rail(sk, [x1 - 0.05, b0], [x1 - 0.05, b1], y); rail(sk, [XB, b0 + 0.05], [x1 - 0.05, b0 + 0.05], y); rail(sk, [XB, b1 - 0.05], [x1 - 0.05, b1 - 0.05], y);
        sk.b('car_red', x1 - 0.1, y + 0.4, b0, x1, y + 0.9, b1);
        // the balcony's furnishing: tubular chairs and a little table, a window box of geraniums on the rail, a rug or a blanket aired over it, a bicycle against the wall
        const q = rng(k * 31 + i * 7 + 5);
        if (q() < 0.55) { chair(sk, x1 - 0.55, y, zm - 0.35, 1); if (q() < 0.5) chair(sk, x1 - 0.55, y, zm + 0.45, 1); }
        if (q() < 0.4) { sk.b('wood_painted', x1 - 0.7, y + 0.36, zm - 0.2, x1 - 0.3, y + 0.4, zm + 0.2); sk.rod('steel_chrome', [x1 - 0.5, y, zm], [x1 - 0.5, y + 0.36, zm], 0.02, 4); }
        if (q() < 0.6) { sk.b('wood_dark', x1 - 0.32, y + 1.0, b0 + 0.3, x1 - 0.06, y + 1.2, b1 - 0.3); sk.b('cloth_green', x1 - 0.3, y + 1.2, b0 + 0.34, x1 - 0.08, y + 1.45, b1 - 0.34); for (let u = b0 + 0.45; u < b1 - 0.4; u += 0.45) sk.b(q() < 0.6 ? 'car_red' : 'paint_white', x1 - 0.26, y + 1.45, u, x1 - 0.12, y + 1.58, u + 0.2); }
        else if (q() < 0.7) sk.b(['cloth_red', 'cloth_blue', 'cloth_ochre', 'cloth_white'][Math.floor(q() * 4)], x1 - 0.12, y + 0.45, b0 + 0.25, x1 - 0.04, y + 1.12, b1 - 0.25);
      }
    } else {
      part(sk, 'z', 22, CX + 0.1, XB - 0.15, y, y1 - y, [[CX + 0.2, CX + 1.4]]);
      // the gymnasium: wall bars, a vaulting horse, a mat; the baths: tubs and a bench
      for (let i = 0; i < 6; i++) sk.b('timber', 45.0 + i * 0.9, y, 8.5, 45.1 + i * 0.9, y + 2.4, 8.6);
      for (let j = 0; j < 8; j++) sk.b('timber', 45.0, y + 0.3 + j * 0.3, 8.45, 49.3, y + 0.33 + j * 0.3, 8.5);
      sk.s('wood_ochre', 46.0, y, 13.5, 47.6, y + 1.1, 14.3); sk.b('car_blue', 46.0, y, 16.5, 48.4, y + 0.15, 18.5);
      for (const z of [24, 26.6, 29.2, 31.8]) { sk.s('glaze_white', 45.2, y, z, 47.1, y + 0.6, z + 1.2); sk.b('water', 45.3, y + 0.5, z + 0.1, 47.0, y + 0.52, z + 1.1); }
      sk.b('wood_painted', 48.4, y + 0.42, 23.2, 49.2, y + 0.46, 32); sk.k(48.4, y, 23.2, 49.2, y + 0.46, 32);
    }
  }
  // the ground terrace on the south-east
  sk.b('concrete_light', XB, 0, z0 + 3, x1 + 1.5, F0, z1 - 3); sk.fl([XB, z0 + 3, x1 + 1.5, z1 - 3], F0);
}


// ── the extras: the vertical lettering, the boiler house and its chimney, curtains behind the glass wall, books, hangings, a piano, weathering ──
const GLYPH = { B: ['110', '101', '110', '101', '110'], A: ['010', '101', '111', '101', '101'], U: ['101', '101', '101', '101', '111'], H: ['101', '101', '111', '101', '101'], S: ['011', '100', '010', '001', '110'] };
function lettering(sk) {
  // a plastered fin at the workshop wing's north-west corner, BAUHAUS down its north face in black blocks (docs §2, [inferred] from the photographs)
  const x0 = -17.95, x1 = -16.9, z0 = 3.55, z1 = B.ww[1] + 0.05, top = FR + 1.4, cell = 0.24;
  sk.s(WHITE, x0, 0, z0, x1, top, z1); sk.b('concrete_light', x0 - 0.04, top, z0 - 0.04, x1 + 0.04, top + 0.1, z1);
  let y = top - 0.9;
  for (const ch of 'BAUHAUS') {
    const g = GLYPH[ch];
    for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) if (g[r][c] === '1') { const xx = x1 - 0.12 - c * cell; sk.b('car_black', xx - cell + 0.02, y - (r + 1) * cell + 0.02, z0 - 0.04, xx - 0.02, y - r * cell - 0.02, z0 - 0.0); }
    y -= 5 * cell + 0.3;
  }
  sk.b('plaster_damp', x0 + 0.05, 0.3, z0 - 0.03, x1 - 0.05, 1.0, z0 + 0.01);
}
function boilerHouse(sk) {
  sk.s(WHITE, 40.5, 0, 36.2, 47.5, 4.0, 41.4); sk.b('concrete_light', 40.45, 4.0, 36.15, 47.55, 4.12, 41.45); sk.b('asphalt', 40.5, 4.12, 36.2, 47.5, 4.15, 41.4);
  sk.b('steel_grey', 41.2, 0.2, 36.17, 43.6, 2.4, 36.2); sk.b('steel_grey', 44.6, 0.2, 36.17, 46.8, 2.2, 36.2); sk.b('wood_dark', 44.9, 0, 36.15, 46.0, 2.1, 36.2);
  for (let u = 41.4; u < 47; u += 1.7) sk.pane('glass_outer', { alongX: true, x: 0, z: 36.16, u0: u, u1: u + 1.2, y0: 2.7, y1: 3.5, n: -1 });
  sk.lathe('concrete_light', [[0.95, 0], [0.9, 4.0], [0.62, 16.6], [0.7, 16.65], [0.7, 17.0], [0.001, 17.0]], 44, 4.15, 40, 14);
  sk.b('car_red', 43.3, 15.0, 39.3, 44.7, 15.4, 40.7);
  sk.k(43.1, 0, 39.1, 44.9, 17, 40.9); sk.b('plaster_streak', 40.6, 0.7, 36.14, 41.6, 3.9, 36.2); sk.b('plaster_damp', 40.6, 0.0, 36.14, 47.4, 0.6, 36.2);
  for (const x of [41.6, 46.4]) sk.b('iron_galv', x - 0.04, 0.2, 36.1, x + 0.04, 4.0, 36.16);
  sk.b('wood_ochre', 41.0, 0, 41.5, 47, 0.9, 42.0); for (let i = 0; i < 6; i++) sk.b('pottery_dark', 41.2 + i, 0.9, 41.55, 41.9 + i, 1.1, 41.95);   // coke heap, a stack of coal
}
function curtains(sk) {
  // summer curtains drawn behind the glass wall on some panes (docs §2: "curtains needed against summer sun")
  const r = rng(1926), [x0, z0, , z1] = B.ww;
  for (const [k, y] of [[0, F0], [1, F1], [2, F2]]) for (let u = z0 + 0.1; u + 2.4 < z1; u += 1.25) if (r() < 0.38 + k * 0.1) { const w = 1.25 * (1 + Math.floor(r() * 2)); sk.b(r() < 0.8 ? 'cloth_white' : 'cloth_ochre', x0 + 0.1, y + 0.4 + (r() < 0.3 ? 0.9 : 0), u + 0.04, x0 + 0.16, y + 3.9, Math.min(z1 - 0.1, u + w - 0.04)); u += w - 1.25; }
}
function bookRows(sk, x, z0, z1, y, h, face, r) {
  for (let k = 0; k < 5; k++) {
    const yy = y + 0.3 + k * (h - 0.5) / 5; sk.b('timber', face > 0 ? x : x - 0.02, yy, z0, face > 0 ? x + 0.02 : x, yy + 0.02, z1);
    for (let z = z0 + 0.05; z < z1 - 0.1; z += 0.06 + r() * 0.05) sk.b(['cloth_red', 'cloth_blue', 'cloth_brown', 'cloth_green', 'paint_white', 'cloth_ochre', 'cloth_black'][Math.floor(r() * 7)], face > 0 ? x : x - 0.28, yy + 0.02, z, face > 0 ? x + 0.28 : x, yy + 0.24 + r() * 0.06, z + 0.04 + r() * 0.04);
  }
}
function hangings(sk) {
  // woven hangings of the weaving workshop (Stölzl's school): striped panels on the walls of the vestibule, the exhibition hall and the foyer
  const r = rng(11), cols = ['cloth_red', 'cloth_ochre', 'cloth_blue', 'cloth_green', 'cloth_indigo', 'cloth_white', 'cloth_black'];
  const panel = (alongX, c, u0, u1, y0, y1, sgn) => { const n = 6; for (let i = 0; i < n; i++) { const a = u0 + (u1 - u0) * i / n, b = u0 + (u1 - u0) * (i + 1) / n, m = cols[Math.floor(r() * cols.length)]; if (alongX) sk.b(m, a, y0, c, b, y1, c + sgn * 0.03); else sk.b(m, c, y0, a, c + sgn * 0.03, y1, b); } };
  for (const y of [F0, F2]) { panel(true, 13.9, -15.6, -13.6, y + 1.0, y + 3.0, -1); panel(true, 13.9, -11.0, -9.4, y + 1.2, y + 2.8, -1); }
  panel(false, 6.9, 15.6, 18.4, F0 + 1.0, F0 + 3.0, 1); panel(false, 6.9, 27.0, 29.5, F0 + 1.2, F0 + 3.0, 1);
}
function piano(sk) {
  // the upright piano on the stage (the Bauhaus band played jazz at the school's parties), a drum and a stool
  const y = F0 + 0.9;
  sk.s('wood_dark', 32.3, y, 20.0, 32.9, y + 1.3, 21.8); sk.b('paint_white', 32.0, y + 0.72, 20.1, 32.3, y + 0.76, 21.7); sk.b('car_black', 32.0, y + 0.76, 20.4, 32.3, y + 0.8, 20.5);
  sk.s('wood_painted', 31.2, y, 20.5, 31.7, y + 0.45, 21.1);
  sk.lathe('wood_painted', [[0.3, 0], [0.3, 0.45], [0.001, 0.45]], 29.5, y, 28.5, 10); sk.lathe('steel_chrome', [[0.29, 0.45], [0.29, 0.47], [0.001, 0.47]], 29.5, y, 28.5, 10);
  sk.rod('iron', [28.8, y + 0.4, 26.5], [28.8, y + 1.3, 26.5], 0.012, 4); sk.lathe('steel_chrome', [[0.001, 0], [0.18, 0.02], [0.18, 0.04], [0.001, 0.05]], 28.8, y + 1.3, 26.5, 10);
}
function weathering(sk) {
  // rain streaks under the parapets and at the foot of the white walls, damp at the plinth
  const r = rng(77);
  const sides = [[B.nw[0], B.nw[2], B.nw[1], 'z', -1, FR], [B.nw[0], B.nw[2], B.nw[3], 'z', 1, FR], [B.fest[0] + 6, B.fest[2], B.fest[3], 'z', 1, 4.2], [B.pre[0], B.pre[2], B.pre[1], 'z', -1, PL.roof], [B.pre[0], B.pre[2], B.pre[3], 'z', 1, PL.roof]];
  for (const [a0, a1, c, , sg, top] of sides) {
    for (let x = a0 + 0.8; x < a1 - 0.8; x += 2.4 + r() * 2.4) if (r() < 0.8) { const h = 0.9 + r() * 1.8; sk.b('plaster_streak', x, top - h, c + (sg > 0 ? -0.01 : -0.03), x + 0.3 + r() * 0.5, top - 0.05, c + (sg > 0 ? 0.03 : 0.01)); }
    sk.b('plaster_damp', a0 + 0.2, F0, c + (sg > 0 ? -0.01 : -0.03), a1 - 0.2, F0 + 0.5, c + (sg > 0 ? 0.03 : 0.01));
  }
}

/** bauhaus_school: the whole building. */
export function bauhausSchool(el, ctx) {
  const sk = new S(ctx);
  workshopWing(sk); bridge(sk); northWing(sk); festBlock(sk); prellerhaus(sk);
  lettering(sk); boilerHouse(sk); curtains(sk); hangings(sk); piano(sk); weathering(sk);
  // the courtyard's paving, the entrance plinth steps and bicycle racks by the main door
  sk.b('concrete_light', 1.2, 0, 4.4, 8.0, 0.03, 13.8);
  for (let i = 0; i < 6; i++) { const x = 3 + i * 0.55; sk.rod('steel_chrome', [x, 0, 12.4], [x, 0.9, 12.4], 0.012, 4); }
}
