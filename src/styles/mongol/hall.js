// The Chinese-type halls of Karakorum (docs/settlements/mongol-karakorum.md §4, §5, §6): rammed-earth podium, red timber
// columns on stone bases, plastered infill, a tiled roof with upswept corners. Möngke's palace (a nave and two aisles
// between two rows of pillars, three doors to the south, the dais at the north), the Great Hall (38 m square, 64 column
// bases, a stupa), the small temple halls, gate pavilions and storehouses.
import { rectRoof } from '../ming/index.js';
import { buddha } from '../chinese/index.js';
import { box, rod, lathe, obox, rng } from './util.js';

const COL = 'lacquer_red', EARTH = 'earth_wall', STONE = 'granite_grey';
const OUT = { s: [0, 1, 'n'], n: [0, -1, 's'], e: [1, 0, 'w'], w: [-1, 0, 'e'] };

/** A rammed-earth podium (x0,z0,x1,z1) to height h with a stone coping and stairs [{ side, c, w }] up its faces. */
export function podium(bag, col, rect, h, stairs = []) {
  const [x0, z0, x1, z1] = rect, k = 0.34;
  bag.add(EARTH, box(x0, -0.5, z0, x1, h - 0.14, z1));
  for (const [a, b, c, d] of [[x0, z0, x1, z0 + 0.34], [x0, z1 - 0.34, x1, z1], [x0, z0 + 0.34, x0 + 0.34, z1 - 0.34], [x1 - 0.34, z0 + 0.34, x1, z1 - 0.34]]) bag.add(STONE, box(a, h - 0.14, b, c, h, d));
  bag.add('flagstone', box(x0 + 0.34, h - 0.14, z0 + 0.34, x1 - 0.34, h - 0.02, z1 - 0.34));
  col.floor(rect, h); if (h > 0.3) col.rect(rect, -0.5, h - 0.3);
  for (const s of stairs) {
    const [ox, oz, asc] = OUT[s.side ?? 's'], n = Math.max(2, Math.round(h / 0.17)), w = s.w;
    const base = s.side === 's' ? z1 : s.side === 'n' ? z0 : s.side === 'e' ? x1 : x0;
    for (let i = 0; i < n; i++) {
      const top = h * (i + 1) / n, d = (n - i) * k;
      const r = ox ? [Math.min(base, base + ox * d), s.c - w / 2, Math.max(base, base + ox * d), s.c + w / 2] : [s.c - w / 2, Math.min(base, base + oz * d), s.c + w / 2, Math.max(base, base + oz * d)];
      bag.add(STONE, box(r[0], -0.1, r[1], r[2], top, r[3]));
    }
    const d = n * k, r = ox ? [Math.min(base, base + ox * d), s.c - w / 2, Math.max(base, base + ox * d), s.c + w / 2] : [s.c - w / 2, Math.min(base, base + oz * d), s.c + w / 2, Math.max(base, base + oz * d)];
    col.ramp(r, 0, h, asc);
  }
}
const rectFor = (x0, y0, z0, x1, y1, z1) => [x0, z0, x1, z1];

/** A straight wall a→b (plan), thickness th, y0..y1, with openings [{ at, w, h, y0 }] (door/window), in mat; colliders; returns nothing. */
export function wallRun(bag, col, a, b, th, y0, y1, mat, ops = [], opMat = null) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, P = (s) => [a[0] + ux * s, a[1] + uz * s];
  const piece = (s0, s1, p0, p1) => { if (s1 - s0 < 1e-3 || p1 - p0 < 1e-3) return; bag.add(mat, obox(P(s0), P(s1), th, p0, p1)); col.segment(P(s0), P(s1), th, p0, p1); };
  let s = 0;
  for (const o of [...ops].sort((p, q) => p.at - q.at)) {
    const s0 = o.at - o.w / 2, s1 = o.at + o.w / 2, sill = o.y0 ?? y0;
    piece(s, s0, y0, y1);
    if (sill > y0) piece(s0, s1, y0, sill);
    piece(s0, s1, sill + o.h, y1);
    if (opMat && o.lat) bag.add(opMat, obox(P(s0 + 0.04), P(s1 - 0.04), 0.06, sill + 0.05, sill + o.h - 0.05));
    s = s1;
  }
  piece(s, L, y0, y1);
}
/** A column on a stone base (drum), shaft in COL; with a capital block and the bracket set above. */
function pillar(bag, col, x, z, y, h, d = 0.56) {
  bag.add(STONE, lathe([[d * 0.85, 0], [d * 0.85, 0.1], [d * 0.7, 0.3], [0.001, 0.3]], 12, null, x, y, z));
  bag.add(COL, lathe([[d / 2, 0], [d / 2 * 0.92, h - 0.3], [0.001, h - 0.3]], 12, null, x, y + 0.3, z));
  bag.add('paint_caihua', box(x - d * 0.75, y + h - 0.3, z - d * 0.75, x + d * 0.75, y + h, z + d * 0.75));
  col?.circle(x, z, d / 2, y, y + h);
}
/** Beams across the tops of the columns on a grid, and the brackets of the eaves: xs, zs the column lines. */
function frame(bag, y, xs, zs, bw = 0.34) {
  for (const x of xs) bag.add(COL, obox([x, zs[0]], [x, zs[zs.length - 1]], bw, y - 0.5, y));
  for (const z of zs) bag.add(COL, obox([xs[0], z], [xs[xs.length - 1], z], bw, y - 0.9, y - 0.5 + 0.0));
}

/**
 * palace_hall: Möngke's hall [stated: Rubruck: "like a church, with a middle nave and two sides beyond two rows of pillars, three
 * doors to the south"; inferred: the Chinese-type vocabulary of the excavated Great Hall]. { c: [cx, zFront], y (floor) }
 * Bays across 4.8 + 7.2 + 4.8 (16.8 m), seven bays of 4.8 m deep (33.6 m); the dais at the north end.
 */
export function palaceHall(el, { bag, col, lights }) {
  const [cx, zF] = el.c, Y = el.y ?? 1.6, W = 16.8, D = 33.6, x0 = cx - W / 2, x1 = cx + W / 2, z0 = zF - D, H = 5.6;
  const xs = [x0, x0 + 4.8, x0 + 12, x1], zs = Array.from({ length: 8 }, (_, k) => z0 + k * 4.8), T = 0.34;
  const doors = [{ at: 2.4, w: 2.4, h: 4.0, lat: true }, { at: 8.4, w: 3.6, h: 4.4, lat: true }, { at: 14.4, w: 2.4, h: 4.0, lat: true }];
  podium(bag, col, [x0 - 2.7, z0 - 2.7, x1 + 2.7, zF + 2.7], Y, [{ side: 's', c: cx, w: 5.6 }, { side: 's', c: cx - 6.0, w: 3.0 }, { side: 's', c: cx + 6.0, w: 3.0 }]);
  const F = Y + 0.04;
  bag.add('timber', box(x0, Y - 0.1, z0, x1, F, zF)); col.floor([x0, z0, x1, zF], F);
  // the walls: plastered timber; the long sides with latticed windows between the columns, the doors to the south
  wallRun(bag, col, [x0, zF], [x1, zF], T, F, Y + H, 'timber_red', doors, 'lattice_red');
  wallRun(bag, col, [x0, z0], [x1, z0], T, F, Y + H, 'timber_red');
  for (const X of [x0, x1]) wallRun(bag, col, [X, z0], [X, zF], T, F, Y + H, 'timber_red', zs.slice(0, -1).map((z, k) => ({ at: 2.4 + 4.8 * k, w: 2.2, h: 2.2, y0: 1.5, lat: true })).concat([]), 'lattice_red');
  // the pillars: the outer lines stand in the walls, the two inner rows on the nave
  for (const x of xs) for (const z of zs) pillar(bag, col, x, z, F, H);
  frame(bag, Y + H, xs, zs);
  // the ceiling of painted panels over the whole hall
  bag.add('ceiling_painted', box(x0, Y + H, z0, x1, Y + H + 0.14, zF));
  // hangings of silk and cloth of gold on the inside of the walls, between the columns
  const hang = ['cloth_red', 'cloth_ochre', 'cloth_blue', 'cloth_red', 'cloth_ochre', 'cloth_blue', 'cloth_red'];
  for (let k = 0; k < 7; k++) {
    const za = zs[k] + 0.55, zb = zs[k + 1] - 0.55;
    for (const [X, s] of [[x0, 1], [x1, -1]]) { bag.add(hang[k], box(Math.min(X + s * (T / 2), X + s * (T / 2 + 0.03)), F + 0.5, za, Math.max(X + s * (T / 2), X + s * (T / 2 + 0.03)), Y + H - 0.9, zb)); bag.add('gold', box(Math.min(X + s * (T / 2 + 0.03), X + s * (T / 2 + 0.045)), F + 0.5, za, Math.max(X + s * (T / 2 + 0.03), X + s * (T / 2 + 0.045)), F + 0.6, zb)); }
  }
  // the dais: the khan "on a high and raised place" at the north end, two stairs up from the nave
  const DH = 1.25, dz1 = z0 + 6.2;
  bag.add(COL, box(x0 + T / 2, F, z0 + T / 2, x1 - T / 2, F + DH - 0.06, dz1)); bag.add('timber', box(x0 + T / 2, F + DH - 0.06, z0 + T / 2, x1 - T / 2, F + DH, dz1));
  bag.add('gold', box(x0 + T / 2, F + DH - 0.22, dz1, x1 - T / 2, F + DH - 0.14, dz1 + 0.02));
  col.rect([x0, z0, x1, dz1], F, F + DH - 0.3); col.floor([x0 + 0.2, z0 + 0.2, x1 - 0.2, dz1], F + DH);
  for (const sx of [cx - 3.0, cx + 3.0]) {
    const n = 7, k = 0.34;
    for (let i = 0; i < n; i++) bag.add('timber', box(sx - 0.8, F, dz1 - 0.0, sx + 0.8, F + DH * (i + 1) / n, dz1 + (n - i) * k));
    col.ramp([sx - 0.8, dz1, sx + 0.8, dz1 + n * k], F, F + DH, 'n');
  }
  // the throne: a gilded seat with its back, cushions, a canopy of red silk; the great cloth behind
  { const ty = F + DH, tz = z0 + 2.2;
    bag.add('gold', box(cx - 1.1, ty, tz - 0.7, cx + 1.1, ty + 0.45, tz + 0.7)); bag.add('cloth_red', box(cx - 1.0, ty + 0.45, tz - 0.6, cx + 1.0, ty + 0.55, tz + 0.6));
    bag.add('gilt_bronze', box(cx - 1.1, ty + 0.45, tz - 0.78, cx + 1.1, ty + 1.7, tz - 0.62));
    bag.add('cloth_red', box(cx - 5.5, ty + 0.8, z0 + T / 2, cx + 5.5, Y + H - 0.5, z0 + T / 2 + 0.03));
    bag.add('gold', box(cx - 5.5, Y + H - 0.62, z0 + T / 2 + 0.03, cx + 5.5, Y + H - 0.5, z0 + T / 2 + 0.05));
    col.rect([cx - 1.1, tz - 0.7, cx + 1.1, tz + 0.7], ty, ty + 1.7);
    for (const s of [-1, 1]) { bag.add('cloth_ochre', box(cx + s * 2.4 - 0.55, ty, tz - 0.4, cx + s * 2.4 + 0.55, ty + 0.4, tz + 0.4)); col.rect([cx + s * 2.4 - 0.55, tz - 0.4, cx + s * 2.4 + 0.55, tz + 0.4], ty, ty + 0.4); }
  }
  // felt carpets along the nave, benches on both sides (the men on the khan's right, the women on the left), low tables with silver
  bag.add('cloth_blue', box(cx - 3.4, F, dz1 + 3.0, cx + 3.4, F + 0.012, zF - 0.5)); bag.add('cloth_red', box(cx - 3.0, F + 0.012, dz1 + 3.2, cx + 3.0, F + 0.024, zF - 0.7));
  for (const [bx, s] of [[x0 + 1.9, 1], [x1 - 1.9, -1]]) for (let k = 0; k < 3; k++) {
    const z = dz1 + 3.0 + k * 6.5;
    bag.add('timber', box(bx - 0.55, F, z, bx + 0.55, F + 0.42, z + 4.6)); bag.add(k % 2 ? 'cloth_green' : 'cloth_blue', box(bx - 0.5, F + 0.42, z + 0.05, bx + 0.5, F + 0.48, z + 4.55));
    col.rect([bx - 0.55, z, bx + 0.55, z + 4.6], F, F + 0.48);
    const tx = bx + s * 1.5; bag.add('lacquer_red', box(tx - 0.4, F, z + 0.6, tx + 0.4, F + 0.5, z + 4.0)); col.rect([tx - 0.4, z + 0.6, tx + 0.4, z + 4.0], F, F + 0.5);
    for (let m = 0; m < 3; m++) bag.add('silver', lathe([[0.001, 0], [0.07, 0.02], [0.09, 0.12], [0.001, 0.12]], 8, null, tx, F + 0.5, z + 1.0 + m * 1.0));
  }
  // the lamps: hanging from the beams along the nave
  for (const z of [zs[2], zs[4], zs[6]]) for (const x of [xs[1], xs[2]]) { bag.add('iron', rod([x, Y + H - 0.9, z], [x, Y + H - 1.5, z], 0.01, 3)); bag.add('lamp_paper', lathe([[0.001, 0], [0.2, 0.12], [0.2, 0.4], [0.001, 0.5]], 10, null, x, Y + H - 2.0, z)); lights?.push({ at: [x, Y + H - 1.8, z], color: '#ffd9a0', intensity: 2.2, distance: 12 }); }
  // the great eaves
  const ov = 2.5;
  rectRoof({ c: [cx, (z0 + zF) / 2], A: D / 2 + ov, B: W / 2 + ov, y: Y + H + 0.3, rise: 5.2, kind: 'xieshan', alongZ: true, sweep: 1.0, mat: 'tile_green', soffit: COL }, bag);
  eaveBrackets(bag, x0 - 0.0, x1, z0, zF, Y + H);
  // the ridge's ornaments: gilt finials
  for (const z of [z0 + 4, zF - 4]) bag.add('gilt_bronze', lathe([[0.001, 0], [0.22, 0.05], [0.12, 0.5], [0.2, 0.9], [0.001, 1.2]], 8, null, cx, Y + H + 0.3 + 5.0, z));
}
function eaveBrackets(bag, x0, x1, z0, z1, y) {
  for (let x = x0 + 1.2; x < x1; x += 2.4) { bag.add('paint_caihua', box(x - 0.3, y + 0.0, z1 + 0.18, x + 0.3, y + 0.35, z1 + 0.5)); bag.add('paint_caihua', box(x - 0.3, y + 0.0, z0 - 0.5, x + 0.3, y + 0.35, z0 - 0.18)); }
}

/** tile_hall: a small hall { rect, y, nx (bays across, odd), H, kind ('hip' | 'xieshan' | 'gable'), mat (roof), walls, altar ('buddha'|'idol'|null), seed }. Door in the middle bay of the south side. */
export function tileHall(el, { bag, col, lights }) {
  const [x0, z0, x1, z1] = el.rect, Y = el.y ?? 0.7, H = el.H ?? 4.2, nx = el.nx ?? 3, T = 0.3, F = Y + 0.04, wallM = el.wallMat ?? 'plaster_white';
  podium(bag, col, [x0 - 1.4, z0 - 1.4, x1 + 1.4, z1 + 1.9], Y, [{ side: 's', c: (x0 + x1) / 2, w: Math.min(4.2, (x1 - x0) / nx * 1.4) }]);
  bag.add('timber', box(x0, Y - 0.1, z0, x1, F, z1)); col.floor([x0, z0, x1, z1], F);
  const bw = (x1 - x0) / nx, dw = Math.min(2.4, bw * 0.7);
  wallRun(bag, col, [x0, z1], [x1, z1], T, F, Y + H, wallM, [{ at: (x1 - x0) / 2, w: dw, h: Math.min(3.2, H - 0.7), lat: true }], 'lattice_red');
  wallRun(bag, col, [x0, z0], [x1, z0], T, F, Y + H, wallM);
  for (const X of [x0, x1]) wallRun(bag, col, [X, z0], [X, z1], T, F, Y + H, wallM, el.windows ? [{ at: (z1 - z0) / 2, w: 1.0, h: 1.2, y0: 1.5, lat: true }] : [], 'lattice');
  const nz = Math.max(1, Math.round((z1 - z0) / bw));
  for (let i = 0; i <= nx; i++) for (let k = 0; k <= nz; k++) if (i === 0 || i === nx || k === 0 || k === nz) pillar(bag, null, x0 + i * bw, z0 + k * (z1 - z0) / nz, F, H, 0.42);
  bag.add('ceiling_painted', box(x0, Y + H, z0, x1, Y + H + 0.1, z1));
  const ov = 1.7;
  rectRoof({ c: [(x0 + x1) / 2, (z0 + z1) / 2], A: (x1 - x0) / 2 + ov, B: (z1 - z0) / 2 + ov, y: Y + H + 0.2, rise: Math.min(3.2, (z1 - z0) * 0.3 + 1.4), kind: el.kind ?? 'hip', sweep: 0.7, mat: el.mat ?? 'tile_grey', soffit: COL }, bag);
  if (el.altar === 'buddha') {
    const cx = (x0 + x1) / 2; bag.add('granite_grey', box(cx - 1.4, F, z0 + 0.5, cx + 1.4, F + 0.45, z0 + 2.6)); col.rect([cx - 1.4, z0 + 0.5, cx + 1.4, z0 + 2.6], F, F + 0.45);
    buddha({ at: [cx, z0 + 1.6], y: F + 0.45, h: 2.6, dir: [0, 1], robe: 'clay_robe' }, { bag });
    for (const s of [-1, 1]) { bag.add('cloth_red', box(cx + s * 1.7 - 0.06, F + 0.2, z0 + 0.5, cx + s * 1.7 + 0.06, F + 2.8, z0 + 0.56)); }
    lights?.push({ at: [cx, F + 1.3, z0 + 3.4], color: '#ffb45a', intensity: 2, distance: 8 });
    bag.add('bronze', lathe([[0.001, 0], [0.18, 0.02], [0.14, 0.3], [0.001, 0.3]], 8, null, cx, F, z0 + 3.4));
  }
}

/**
 * great_hall: the Great Hall of Karakorum [stated: DAI: 38 × 38 m, rammed-earth podium in alternating layers, 64 granite column bases,
 * a stupa presumably at the centre, Chinese-type roof tiles, four Buddhas on lotus thrones in the reconstruction]. { c: [cx, cz], y }
 */
export function greatHall(el, { bag, col, lights }) {
  const [cx, cz] = el.c, Y = el.y ?? 1.5, S = 5.2, N = 7, half = S * N / 2, x0 = cx - half, x1 = cx + half, z0 = cz - half, z1 = cz + half, H = 6.2, T = 0.4, F = Y + 0.04;
  podium(bag, col, [x0 - 2.6, z0 - 2.6, x1 + 2.6, z1 + 2.6], Y, [{ side: 's', c: cx, w: 6 }, { side: 'n', c: cx, w: 4 }, { side: 'e', c: cz, w: 4 }, { side: 'w', c: cz, w: 4 }]);
  bag.add('flagstone', box(x0, Y - 0.1, z0, x1, F, z1)); col.floor([x0, z0, x1, z1], F);
  const doorS = [{ at: half, w: 4.4, h: 4.6, lat: true }];
  wallRun(bag, col, [x0, z1], [x1, z1], T, F, Y + H, 'timber_red', doorS, 'lattice_red');
  wallRun(bag, col, [x0, z0], [x1, z0], T, F, Y + H, 'timber_red', [{ at: half, w: 2.4, h: 3.6 }]);
  for (const X of [x0, x1]) wallRun(bag, col, [X, z0], [X, z1], T, F, Y + H, 'timber_red', [{ at: half, w: 2.4, h: 3.6 }]);
  const xs = Array.from({ length: N + 1 }, (_, i) => x0 + i * S), zs = Array.from({ length: N + 1 }, (_, i) => z0 + i * S);
  for (const x of xs) for (const z of zs) { if (Math.abs(x - cx) < S * 1.1 && Math.abs(z - cz) < S * 1.1) continue; pillar(bag, col, x, z, F, H, 0.6); }
  frame(bag, Y + H, xs, zs, 0.4);
  // ceiling over the aisles, a square opening about the stupa
  const hole = [cx - 5.3, cz - 5.3, cx + 5.3, cz + 5.3];
  for (const r of [[x0, z0, x1, hole[1]], [x0, hole[3], x1, z1], [x0, hole[1], hole[0], hole[3]], [hole[2], hole[1], x1, hole[3]]]) bag.add('ceiling_coffer', box(r[0], Y + H, r[1], r[2], Y + H + 0.16, r[3]));
  // upper storey: walls round the opening, a second eave
  const U = 10.4, ux0 = cx - U, ux1 = cx + U, uz0 = cz - U, uz1 = cz + U, UH = 5.0;
  for (const [a, b] of [[[ux0, uz0], [ux1, uz0]], [[ux1, uz0], [ux1, uz1]], [[ux1, uz1], [ux0, uz1]], [[ux0, uz1], [ux0, uz0]]]) bag.add('timber_red', obox(a, b, T, Y + H, Y + H + UH));
  bag.add('ceiling_painted', box(ux0, Y + H + UH, uz0, ux1, Y + H + UH + 0.15, uz1));
  rectRoof({ c: [cx, cz], A: half + 2.7, B: half + 2.7, y: Y + H + 0.4, rise: 3.6, kind: 'hip', sweep: 1.2, mat: 'tile_green', soffit: COL, hole: [ux0 + 0.4, uz0 + 0.4, ux1 - 0.4, uz1 - 0.4] }, bag);
  rectRoof({ c: [cx, cz], A: U + 2.2, B: U + 2.2, y: Y + H + UH + 0.3, rise: 4.6, kind: 'hip', sweep: 1.0, mat: 'tile_green', soffit: COL }, bag);
  bag.add('gilt_bronze', lathe([[0.001, 0], [0.3, 0.1], [0.16, 0.7], [0.3, 1.3], [0.001, 1.9]], 8, null, cx, Y + H + UH + 4.9, cz));
  // the stupa: square base in steps, drum, dome, harmika, thirteen rings, the finial, in white lime with gilt
  const B0 = F;
  for (const [h, w] of [[0.5, 4.2], [0.5, 3.6], [0.5, 3.1]]) { bag.add('limewash_white', box(cx - w, B0, cz - w, cx + w, B0 + h, cz + w)); }
  col.rect([cx - 4.2, cz - 4.2, cx + 4.2, cz + 4.2], F, F + 1.5);
  bag.add('limewash_white', lathe([[2.5, 1.5], [2.5, 3.2], [2.1, 3.3]], 24, null, cx, B0, cz));
  bag.add('limewash_white', lathe([[2.1, 3.3], [3.0, 3.9], [3.2, 5.0], [2.6, 6.2], [1.2, 6.9], [0.7, 6.95]], 24, null, cx, B0, cz));
  bag.add('gilt_bronze', box(cx - 0.8, B0 + 6.9, cz - 0.8, cx + 0.8, B0 + 7.5, cz + 0.8));
  for (let k = 0; k < 13; k++) bag.add('gilt_bronze', lathe([[0.62 - k * 0.032, 0], [0.62 - k * 0.032, 0.07]], 12, null, cx, B0 + 7.5 + k * 0.17, cz));
  bag.add('gilt_bronze', rod([cx, B0 + 9.6, cz], [cx, B0 + 10.2, cz], 0.07, 6));
  for (const [dx, dz] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) { const bx = cx + dx * 6.4, bz = cz + dz * 6.4; bag.add('granite_grey', box(bx - 1.4, F, bz - 1.4, bx + 1.4, F + 0.5, bz + 1.4)); col.rect([bx - 1.4, bz - 1.4, bx + 1.4, bz + 1.4], F, F + 0.5); buddha({ at: [bx, bz], y: F + 0.5, h: 3.4, dir: [dx, dz], robe: 'clay_robe' }, { bag }); }
  lights?.push({ at: [cx, F + 4, cz], color: '#ffc77a', intensity: 3, distance: 22 });
  for (const [dx, dz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) lights?.push({ at: [cx + dx * 12, F + 3.4, cz + dz * 12], color: '#ffc77a', intensity: 2, distance: 14 });
}
void rectFor; void rng;
