// The beacon tower (fengsui) and its garrison yard north of the town (docs/settlements/dunhuang.md §13): a tapering tower of
// rammed earth with courses of reed between the layers, a parapet and a signal hearth on its top, a ladder, a flag pole;
// beside it a walled yard (wu) with a guard room (kang, stove, spear rack, drum, lamp), a horse lean-to, a well place and
// stacks of signal fuel. Local frame: the yard's centre at `at`, the gate in the south wall (+z), the guard room in the west,
// the tower against the north wall.
import { box, frustum, lathe, fromTriangles, quad, rod } from '../../core/geom.js';
import { rng } from '../../settlements/dunhuang/layout.js';
import { oilLamp } from './caves.js';

const WALL = 'earth_wall', FOOT = 'banco_rough';

function beacon(el, ctx) {
  const { bag, col } = ctx, [bx, bz] = el.at, r = rng(el.seed || 9);
  const S = (m, x0, y0, z0, x1, y1, z1, solid = true) => { bag.add(m, box(bx + x0, y0, bz + z0, bx + x1, y1, bz + z1)); if (solid) col.rect([bx + x0, bz + z0, bx + x1, bz + z1], y0, y1); };
  const B = (m, x0, y0, z0, x1, y1, z1) => S(m, x0, y0, z0, x1, y1, z1, false);
  const Y = 9.0, T = 0.7, WH = 2.3;                    // the yard's half-side, the wall's thickness and height
  // ── the yard wall: a footing course, the rammed wall, merlons along the top; the gate in the south wall (x ±1.1)
  const wallRun = (x0, z0, x1, z1) => {
    S(FOOT, x0, 0, z0, x1, 0.5, z1); S(WALL, x0, 0.5, z0, x1, WH, z1);
    const alongX = x1 - x0 > z1 - z0, L = alongX ? x1 - x0 : z1 - z0;
    for (let q = 0.3; q < L - 0.6; q += 1.3) { const a = q + 0.15 * r(); alongX ? B(WALL, x0 + a, WH, z0 + 0.1, x0 + a + 0.6, WH + 0.45, z1 - 0.1) : B(WALL, x0 + 0.1, WH, z0 + a, x1 - 0.1, WH + 0.45, z0 + a + 0.6); }
    // courses of ramming every 0.8 m, as shallow grooves
    for (let y = 1.1; y < WH; y += 0.8) alongX ? (B('banco_rough', x0, y, z0 - 0.02, x1, y + 0.05, z0 + 0.01), B('banco_rough', x0, y, z1 - 0.01, x1, y + 0.05, z1 + 0.02)) : (B('banco_rough', x0 - 0.02, y, z0, x0 + 0.01, y + 0.05, z1), B('banco_rough', x1 - 0.01, y, z0, x1 + 0.02, y + 0.05, z1));
  };
  wallRun(-Y, -Y, Y, -Y + T); wallRun(-Y, -Y, -Y + T, Y); wallRun(Y - T, -Y, Y, Y);
  wallRun(-Y, Y - T, -1.3, Y); wallRun(1.3, Y - T, Y, Y);
  // the gate: two posts and a lintel of poplar, a threshold of stones; the leaves open
  for (const s of [-1, 1]) S('timber', s * 1.3 - 0.14, 0, Y - T - 0.05, s * 1.3 + 0.14, 2.7, Y + 0.05);
  B('timber', -1.45, 2.3, Y - T - 0.05, 1.45, 2.55, Y + 0.05);
  // ── the tower: a frustum 5.2 m square at the foot, 3.4 m at 8.4 m, in rammed layers with a course of reed brush every 0.45 m
  const tz = -Y + T + 3.3, TH = 8.4, IN = 0.9, base = 2.6;
  bag.add(WALL, frustum([bx - base, bz + tz - base, bx + base, bz + tz + base], 0.3, TH, IN, IN, IN, IN));
  S(FOOT, -base - 0.15, 0, tz - base - 0.15, base + 0.15, 0.3, tz + base + 0.15);
  col.rect([bx - base + 0.2, bz + tz - base + 0.2, bx + base - 0.2, bz + tz + base - 0.2], 0.3, TH);
  for (let y = 0.8; y < TH - 0.2; y += 0.45) {
    const inset = IN * (y - 0.3) / (TH - 0.3), h = base - inset + 0.035, y1 = y + 0.05 + 0.03 * r();
    B('thatch', -h, y, tz - h, h, y1, tz - h + 0.01); B('thatch', -h, y, tz + h - 0.01, h, y1, tz + h); B('thatch', -h, y, tz - h, -h + 0.01, y1, tz + h); B('thatch', h - 0.01, y, tz - h, h, y1, tz + h);
  }
  // the foot eaten by wind-blown sand, a mended patch, a crack
  for (const k of [-1.6, 0.4, 1.9]) B('banco_rough', k, 0.3, tz + base + 0.0, k + 0.9, 1.0, tz + base + 0.05);
  B('mud_plaster', -1.2, 2.2, tz + base - 0.08, 0.1, 3.4, tz + base - 0.05); B('wood_dark', 0.9, 3.0, tz + base - 0.12, 0.95, 5.6, tz + base - 0.1);
  // the top: a floor of beams, a parapet 0.9 m high with a gap on the south for the roof door, a signal hearth, stacked fuel, a flag pole
  const tt = base - IN + 0.15;
  S(WALL, -tt, TH, tz - tt, tt, TH + 0.3, tz + tt);
  const par = (x0, z0, x1, z1) => S(WALL, x0, TH + 0.3, z0, x1, TH + 1.2, z1);
  par(-tt, tz - tt, tt, tz - tt + 0.35); par(-tt, tz - tt, -tt + 0.35, tz + tt); par(tt - 0.35, tz - tt, tt, tz + tt);
  par(-tt, tz + tt - 0.35, -0.6, tz + tt); par(0.6, tz + tt - 0.35, tt, tz + tt);
  for (const x of [-tt + 0.2, tt - 0.55]) B(WALL, x, TH + 1.2, tz - tt, x + 0.35, TH + 1.55, tz - tt + 0.35);
  const hx = bx - 0.6, hz = bz + tz - 0.3;
  bag.add('iron', lathe([[0.001, 0], [0.5, 0.02], [0.62, 0.3], [0.5, 0.34], [0.001, 0.26]], 12, null, hx, TH + 0.3, hz));
  for (let k = 0; k < 7; k++) { const a = k * 0.9; bag.add('log_pine', rod([hx + Math.cos(a) * 0.2, TH + 0.5, hz + Math.sin(a) * 0.2], [hx + Math.cos(a) * 0.45, TH + 0.9, hz + Math.sin(a) * 0.45], 0.05, 5)); }
  for (const [dx, dz] of [[0.95, -0.55], [1.0, 0.25], [-1.0, 0.3]]) bag.add('thatch', lathe([[0.001, 0], [0.5, 0], [0.45, 0.4], [0.25, 0.8], [0.001, 0.95]], 9, null, bx + dx, TH + 0.3, bz + tz + dz));
  const px = bx + 1.2, pz = bz + tz - 1.2;
  bag.add('timber', rod([px, TH + 0.3, pz], [px, TH + 4.6, pz], 0.05, 6));
  const fl = [], a = [px, TH + 4.5, pz], b = [px + 1.6, TH + 4.5, pz], c = [px + 1.6, TH + 3.6, pz], d = [px, TH + 3.6, pz];
  quad(fl, a, b, c, d); quad(fl, d, c, b, a); bag.add('cloth_red+wind', fromTriangles(fl));
  // the ladder: two poles leaning on the tower's south face from the yard to the roof door, rungs every 0.35 m
  const lz0 = bz + tz + base + 1.7, lz1 = bz + tz + (base - IN) + 0.2, lx = bx - 0.1;
  for (const s of [-0.35, 0.35]) bag.add('log_pine', rod([lx + s, 0.0, lz0], [lx + s, TH + 0.9, lz1], 0.05, 5));
  for (let q = 0.5; q < TH + 0.5; q += 0.35) { const f = q / (TH + 0.9), zz = lz0 + (lz1 - lz0) * f; bag.add('log_pine', rod([lx - 0.35, q, zz], [lx + 0.35, q, zz], 0.025, 4)); }
  // ── the guard room in the yard's west: earth walls 0.5 thick, a door to the yard (east), a flat roof with a parapet
  const rx0 = -Y + T, rx1 = rx0 + 5.0, rz0 = 0.8, rz1 = 4.8, th = 0.5, hh = 2.9, dz = 2.8;      // the door's centre z
  S(FOOT, rx0, 0, rz0, rx1, 0.5, rz0 + th); S(FOOT, rx0, 0, rz1 - th, rx1, 0.5, rz1); S(FOOT, rx0, 0, rz0, rx0 + th, 0.5, rz1);
  S(WALL, rx0, 0.5, rz0, rx1, hh, rz0 + th); S(WALL, rx0, 0.5, rz1 - th, rx1, hh, rz1); S(WALL, rx0, 0.5, rz0, rx0 + th, hh, rz1);
  S(FOOT, rx1 - th, 0, rz0, rx1, 0.5, dz - 0.55); S(FOOT, rx1 - th, 0, dz + 0.55, rx1, 0.5, rz1);
  S(WALL, rx1 - th, 0.5, rz0, rx1, hh, dz - 0.55); S(WALL, rx1 - th, 0.5, dz + 0.55, rx1, hh, rz1); S(WALL, rx1 - th, 2.1, dz - 0.55, rx1, hh, dz + 0.55);
  for (const s of [-1, 1]) B('timber_red', rx1 - 0.02, 0, dz + s * 0.55 - (s > 0 ? 0.0 : 0.1) + (s > 0 ? 0.0 : 0.0), rx1 + 0.1, 2.15, dz + s * 0.55 + (s > 0 ? 0.1 : 0.0));
  B('timber_red', rx1 - 0.02, 2.05, dz - 0.65, rx1 + 0.1, 2.15, dz + 0.65);
  B('mudbrick', rx0 + th, -0.03, rz0 + th, rx1 - th, 0.08, rz1 - th); col.floor([bx + rx0 + th, bz + rz0 + th, bx + rx1 - th, bz + rz1 - th], 0.08);
  B('mudbrick', rx1 - th, -0.03, dz - 0.55, rx1 + 0.7, 0.08, dz + 0.55); col.floor([bx + rx1 - th, bz + dz - 0.55, bx + rx1 + 0.7, bz + dz + 0.55], 0.08);
  for (let x = rx0 + 0.55; x < rx1 - 0.4; x += 0.55) B('timber', x - 0.07, hh - 0.2, rz0 + th, x + 0.07, hh, rz1 - th);    // the poles of the ceiling under the roof
  B(FOOT, rx0, hh, rz0, rx1, hh + 0.25, rz1); col.floor([bx + rx0 + 0.3, bz + rz0 + 0.3, bx + rx1 - 0.3, bz + rz1 - 0.3], hh + 0.25);
  for (const [x0, z0, x1, z1] of [[rx0, rz0, rx1, rz0 + 0.3], [rx0, rz1 - 0.3, rx1, rz1], [rx0, rz0, rx0 + 0.3, rz1], [rx1 - 0.3, rz0, rx1, rz1]]) B(WALL, x0, hh + 0.25, z0, x1, hh + 0.65, z1);
  // furniture: the kang along the west wall with the stove at its north end and the flue's soot, a low table and lamp, a spear rack, a signal drum, jars
  const ix0 = rx0 + th, ix1 = rx1 - th, iz0 = rz0 + th, iz1 = rz1 - th;
  S('mudbrick', ix0, 0.08, iz0 + 0.9, ix0 + 1.6, 0.63, iz1);
  B('reed_mat', ix0 + 0.05, 0.63, iz0 + 0.95, ix0 + 1.55, 0.66, iz1 - 0.05); B('cloth_brown', ix0 + 0.15, 0.66, iz0 + 1.1, ix0 + 1.45, 0.72, iz1 - 0.2); B('cloth_ochre', ix0 + 0.15, 0.72, iz1 - 0.9, ix0 + 0.7, 0.8, iz1 - 0.25);
  S('banco', ix0, 0.08, iz0, ix0 + 0.9, 0.85, iz0 + 0.8);
  bag.add('iron', lathe([[0.001, 0], [0.18, 0.02], [0.26, 0.12], [0.2, 0.26], [0.001, 0.28]], 10, null, bx + ix0 + 0.45, 0.85, bz + iz0 + 0.4));
  B('lacquer_black', ix0 + 0.02, 0.85, iz0 + 0.05, ix0 + 0.08, hh, iz0 + 0.75);
  S('timber', ix0 + 2.0, 0.34, rz0 + 1.1, ix0 + 2.7, 0.38, rz0 + 1.9);
  for (const [a2, b2] of [[0, 0], [1, 0], [0, 1], [1, 1]]) B('timber', ix0 + 2.05 + a2 * 0.55, 0.0, rz0 + 1.15 + b2 * 0.7, ix0 + 2.1 + a2 * 0.55, 0.34, rz0 + 1.2 + b2 * 0.7);
  oilLamp(ctx, bx + ix0 + 2.35, 0.38, bz + rz0 + 1.45, 0.3, 1.8, 6.5);
  bag.add('pottery_dark', lathe([[0.001, 0], [0.08, 0], [0.1, 0.04], [0.001, 0.05]], 8, null, bx + ix0 + 2.5, 0.38, bz + rz0 + 1.7));
  S('timber', ix0 + 2.2, 0.08, iz0 + 0.05, ix0 + 3.6, 0.1, iz0 + 0.2, false);
  for (let k = 0; k < 4; k++) {
    const x = ix0 + 2.3 + k * 0.32, zq = bz + iz0 + 0.13;
    bag.add('log_pine', rod([bx + x, 0.08, zq], [bx + x + 0.05, 2.15, zq], 0.022, 5)); bag.add('iron', lathe([[0.001, 0], [0.035, 0], [0.001, 0.26]], 5, null, bx + x + 0.05, 2.14, zq));
  }
  B('timber', ix0 + 2.1, 1.1, iz0, ix0 + 3.7, 1.16, iz0 + 0.12); B('timber', ix0 + 2.1, 1.7, iz0, ix0 + 3.7, 1.76, iz0 + 0.12);
  { const dx = bx + ix1 - 0.5, dzz = bz + iz1 - 0.45; bag.add('wood_dark', lathe([[0.001, 0], [0.34, 0.02], [0.38, 0.3], [0.34, 0.58], [0.001, 0.6]], 12, null, dx, 0.08, dzz)); bag.add('hide_tan', lathe([[0.001, 0], [0.34, 0], [0.001, 0.01]], 12, null, dx, 0.68, dzz)); col.circle(dx, dzz, 0.4, 0.08, 0.68); }
  bag.add('pottery_dark', lathe([[0.001, 0], [0.2, 0.02], [0.3, 0.28], [0.22, 0.52], [0.14, 0.58], [0.001, 0.58]], 10, null, bx + ix1 - 0.5, 0.08, bz + iz0 + 0.5)); col.circle(bx + ix1 - 0.5, bz + iz0 + 0.5, 0.3, 0.08, 0.6);
  ctx.lights?.push({ at: [bx + ix0 + 2.4, 1.8, bz + (rz0 + rz1) / 2], color: '#ffc27a', intensity: 1.5, distance: 6 });
  // ── the horse lean-to along the yard's east wall: four poles, a thatched roof, a manger of planks; the horses are the town's life list
  const ex = Y - T - 2.2;
  for (const z of [-1.0, 1.4, 3.8, 6.2]) for (const x of [ex, ex + 2.0]) bag.add('log_pine', rod([bx + x, 0, bz + z], [bx + x, 2.3, bz + z], 0.08, 6));
  S('thatch', ex - 0.2, 2.3, -1.2, ex + 2.3, 2.5, 6.4, false);
  S('timber', ex + 1.7, 0.45, -0.6, ex + 2.0, 0.75, 5.8, false);
  // ── signal fuel in stacks along the yard's north wall (brush and dung cakes), a heap of ashes
  for (const x of [2.4, 3.6, 5.2]) bag.add('thatch', lathe([[0.001, 0], [0.8, 0], [0.7, 0.7], [0.4, 1.3], [0.001, 1.5]], 9, null, bx + x + 1.6, 0, bz - Y + T + 0.9));
  // the yard floor: a worn path from the gate to the room's door and the ladder
  B('banco_smooth', -1.0, 0.0, tz + base + 0.3, 1.0, 0.012, Y - T);
  B('banco_smooth', rx1, 0.0, dz - 0.5, 0.0, 0.012, dz + 0.5);
}

export const BEACON_ELEMENTS = { dh_beacon: beacon };
