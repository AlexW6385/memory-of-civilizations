// The market with its standard weights and measures, the figure-makers' workshops, the imperial road and its stations
// (docs/settlements/qin-xianyang.md §2, §6): the walled market (shi) with four gates and its tower, the standards on their table
// before the tower, the balances at the stalls; the workshops of the figure-makers (clay, bodies, heads, the kiln, the painting
// shed, the sledges); the road's emperor's lane with the ruts of one gauge, its low banks, the road-station pavilions.
import { box, lathe, frustum, rod, quad, fromTriangles } from '../../core/geom.js';
import { hipRoof } from '../chinese/index.js';
import { rng } from '../../objects/kit.js';
import { MARKET, TOWER, MWALL, ROAD } from '../../settlements/qin-xianyang/layout.js';
import { frame, JAR, gable } from './houses.js';
import { soldier } from './warriors.js';

const ball = (r, n = 8) => lathe(Array.from({ length: 6 }, (_, i) => { const t = i / 5 * Math.PI; return [Math.max(0.001, Math.sin(t) * r), r - Math.cos(t) * r]; }), n);

/** qin_scale: { at [x, z], y, rot } — a balance on a post with its stone weights and a sheng measure, as at every counter of the market. */
export function qinScale(el, { bag }) {
  const [x, z] = el.at, y = el.y ?? 0, c = Math.cos(el.rot ?? 0), s = Math.sin(el.rot ?? 0), P = (u, v) => [x + u * c + v * s, z - u * s + v * c];
  const [px, pz] = P(0, 0);
  bag.add('timber', box(px - 0.03, y, pz - 0.03, px + 0.03, y + 0.5, pz + 0.03));
  bag.add('bronze', rod([P(-0.3, 0)[0], y + 0.5, P(-0.3, 0)[1]], [P(0.3, 0)[0], y + 0.5, P(0.3, 0)[1]], 0.012, 5));
  for (const sd of [-1, 1]) { const [qx, qz] = P(sd * 0.3, 0); bag.add('bronze', lathe([[0.001, 0], [0.09, 0.02], [0.1, 0.045], [0.001, 0.03]], 8, null, qx, y + 0.33, qz)); bag.add('iron', box(qx - 0.004, y + 0.37, qz - 0.004, qx + 0.004, y + 0.5, qz + 0.004)); }
  for (let i = 0; i < 3; i++) { const [qx, qz] = P(0.45 + i * 0.12, 0.05); bag.add('granite_grey', lathe([[0.001, 0], [0.04 + i * 0.01, 0.01], [0.03 + i * 0.008, 0.05 + i * 0.01], [0.001, 0.06 + i * 0.01]], 7, null, qx, y, qz)); }
  const [mx, mz] = P(-0.5, 0.08); bag.add('bronze', box(mx - 0.06, y, mz - 0.06, mx + 0.06, y + 0.1, mz + 0.06));
}

/** qin_standards: { at [x, z], rot } — the standards before the market tower: stone weights from a dan to a jin, bronze sheng and dou measures, a chi rod, the edict board. */
export function qinStandards(el, { bag, col }) {
  const [x, z] = el.at;
  bag.add('lacquer_black', box(x - 2.2, 0.62, z - 0.6, x + 2.2, 0.72, z + 0.6));
  for (const [dx, dz] of [[-2, -0.5], [2, -0.5], [-2, 0.5], [2, 0.5]]) bag.add('lacquer_black', box(x + dx - 0.06, 0, z + dz - 0.06, x + dx + 0.06, 0.62, z + dz + 0.06));
  col.rect([x - 2.2, z - 0.6, x + 2.2, z + 0.6], 0, 0.72);
  [0.34, 0.27, 0.21, 0.16, 0.12, 0.09].forEach((r, i) => bag.add('granite_grey', lathe([[r * 1.1, 0], [r, r * 0.9], [r * 0.7, r * 1.6], [r * 0.25, r * 1.8], [0.001, r * 1.8]], 10, null, x - 1.8 + i * 0.5, 0.72, z - 0.25)));   // the stone weights, a ring on the knob
  [[0.2, 0.14], [0.15, 0.1], [0.11, 0.08]].forEach(([w, h], i) => { bag.add('bronze', box(x + 0.3 + i * 0.45, 0.72, z - 0.3, x + 0.3 + i * 0.45 + w, 0.72 + h, z - 0.3 + w)); bag.add('bronze', box(x + 0.3 + i * 0.45 + w, 0.72 + h * 0.4, z - 0.3 + w * 0.3, x + 0.3 + i * 0.45 + w + 0.07, 0.72 + h * 0.6, z - 0.3 + w * 0.7)); });
  bag.add('timber', box(x - 1.6, 0.72, z + 0.2, x + 0.2, 0.745, z + 0.28));                                  // the chi rod
  bag.add('bronze', box(x + 0.6, 0.72, z + 0.18, x + 1.4, 0.76, z + 0.4));                                   // a bronze plate: the edict
  bag.add('planks_grey', box(x - 1.2, 0, z + 1.4, x + 1.2, 1.8, z + 1.55)); bag.add('paint_white', box(x - 1.0, 0.7, z + 1.37, x + 1.0, 1.6, z + 1.4));   // the notice board
  for (const s of [-1, 1]) bag.add('timber', box(x + s * 1.25 - 0.06, 0, z + 1.38, x + s * 1.25 + 0.06, 2.0, z + 1.58));
  col.rect([x - 1.3, z + 1.38, x + 1.3, z + 1.58], 0, 2);
}

/** qin_market: {} — the market: its paving, the wall with four gates, the tower. */
export function qinMarket(el, { bag, col }) {
  const [x0, z0, x1, z1] = MARKET, { th, h, gw } = MWALL;
  bag.add('brick_grey', box(x0, -0.1, z0, x1, 0.03, z1));
  // the walls, cut at the gates (north and south at x = −30, west and east at z = 58)
  const seg = (a, b, c, d) => { if (c - a < 0.1 || d - b < 0.1) return; bag.add('earth_wall', box(a, 0, b, c, h, d)); col.rect([a, b, c, d], 0, h); bag.add('tile_grey', box(a - 0.25, h, b - 0.25, c + 0.25, h + 0.3, d + 0.25)); };
  const gx = MWALL.gates.n[0], gz = MWALL.gates.w[0];
  seg(x0 - th, z0 - th, gx - gw / 2, z0); seg(gx + gw / 2, z0 - th, x1 + th, z0); seg(x0 - th, z1, gx - gw / 2, z1 + th); seg(gx + gw / 2, z1, x1 + th, z1 + th);
  seg(x0 - th, z0, x0, gz - gw / 2); seg(x0 - th, gz + gw / 2, x0, z1); seg(x1, z0, x1 + th, gz - gw / 2); seg(x1, gz + gw / 2, x1 + th, z1);
  // gatehouses: two posts and a tiled lintel roof at each gate
  const gate = (cx, cz, alongX) => {
    const hw = gw / 2 + 0.6;
    for (const s of [-1, 1]) { const px = alongX ? cx + s * hw : cx, pz = alongX ? cz : cz + s * hw; bag.add('timber_red', box(px - 0.4, 0, pz - 0.4, px + 0.4, 4.4, pz + 0.4)); col.rect([px - 0.4, pz - 0.4, px + 0.4, pz + 0.4], 0, 4.4); }
    bag.add('lacquer_black', box(alongX ? cx - hw - 0.5 : cx - 0.5, 4.2, alongX ? cz - 0.5 : cz - hw - 0.5, alongX ? cx + hw + 0.5 : cx + 0.5, 4.7, alongX ? cz + 0.5 : cz + hw + 0.5));
    hipRoof({ c: [cx, cz], A: alongX ? hw + 1.6 : 2.6, B: alongX ? 2.6 : hw + 1.6, y: 4.7, rise: 1.6, lift: 0.2, pow: 1.3, mat: 'tile_dark', soffit: 'timber_red', ridgeMat: 'tile_dark', noChiwei: true, alongZ: !alongX }, { bag });
  };
  gate(gx, z0 - th / 2, true); gate(gx, z1 + th / 2, true); gate(x0 - th / 2, gz, false); gate(x1 + th / 2, gz, false);
  // the tower: a base of beaten earth with its stair, an upper room of timber walled in vermilion, a hipped roof and the market's flag
  const { x, z, w, h: H } = TOWER, hw = w / 2, bh = 4.2;
  bag.add('earth_wall', frustum([x - hw, z - hw, x + hw, z + hw], 0, bh, 0.5, 0.5, 0.5, 0.5, { noBottom: true })); col.rect([x - hw, z - hw, x + hw, z + hw], 0, bh);
  col.floor([x - hw, z - hw, x + hw, z + hw], bh);
  bag.add('brick_grey', box(x - hw + 0.4, bh, z - hw + 0.4, x + hw - 0.4, bh + 0.08, z + hw - 0.4));
  for (let i = 0; i < 24; i++) bag.add('brick_grey', box(x - 1.6, 0, z + hw + 4.8 - (i + 1) * 0.2, x + 1.6, (i + 1) * bh / 24, z + hw + 4.8 - i * 0.2));
  col.ramp([x - 1.6, z + hw, x + 1.6, z + hw + 4.8], 0, bh, 'n');
  const uy = bh + 0.08, ch = H - bh - 3;
  for (const dx of [-1, 1]) for (const dz of [-1, 1]) { bag.add('timber_red', lathe([[0.3, 0], [0.27, ch]], 10, null, x + dx * (hw - 0.8), uy, z + dz * (hw - 0.8))); col.circle(x + dx * (hw - 0.8), z + dz * (hw - 0.8), 0.32, uy, uy + ch); }
  for (const [a, b, c2, d] of [[x - hw + 0.8, z - hw + 0.8, x + hw - 0.8, z - hw + 1.1], [x - hw + 0.8, z + hw - 1.1, x + hw - 0.8, z + hw - 0.8]]) bag.add('palace_wall', box(a, uy, b, c2, uy + 1.1, d));
  bag.add('lacquer_black', box(x - hw + 0.6, uy + ch, z - hw + 0.6, x + hw - 0.6, uy + ch + 0.5, z + hw - 0.6));
  for (const s of [-1, 1]) bag.add('lacquer_black', box(x + s * (hw - 0.8) - 0.12, uy + 0.02, z - hw + 0.8 - 0.05, x + s * (hw - 0.8) + 0.12, uy + 1.15, z + hw - 0.8 + 0.05));
  hipRoof({ c: [x, z], A: hw + 2.2, B: hw + 2.2, y: uy + ch + 0.6, rise: 3.0, lift: 0.5, pow: 1.3, mat: 'tile_dark', soffit: 'timber_red', ridgeMat: 'tile_dark', noChiwei: true }, { bag });
  bag.add('timber', box(x - 0.08, uy + ch + 3.5, z - 0.08, x + 0.08, H + 4.5, z + 0.08));
  bag.add('cloth_black', box(x + 0.08, H + 2.4, z - 0.02, x + 1.9, H + 4.4, z + 0.02));
  // the officers' booth under the tower's stair, and standards on their table
  qinStandards({ at: [x, z + hw + 7.5] }, { bag, col });
}

/** qin_workshop: { rect, front, seed, trade } — a figure-makers' yard: open to the street, a roofed shed behind, the trade's things between. */
export function qinWorkshop(el, ctx) {
  const { bag, col } = ctx, rand = rng(el.seed), F = frame(el.rect, el.front, bag, col, ctx.lights), W = F.W, D = F.D, T = el.trade ?? 'clay';
  const S = (u, v, o = {}) => soldier(bag, { at: [F.X(u), F.Z(v)], y: 0, rot: o.rot ?? (F.sg > 0 ? Math.PI : 0), kind: o.kind ?? 'arm', seed: Math.floor(rand() * 1e6), reach: 90, clay: o.clay, s: o.s ?? 1 });
  // the yard's fence: low walls of earth on three sides, the street side open but for two gate posts
  for (const [a, b, c, d] of [[0, 0, 0.5, D], [W - 0.5, 0, W, D], [0, D - 0.5, W, D]]) F.b('earth_wall', a, 0, b, c, 1.7, d);
  for (const u of [W * 0.25, W * 0.75]) F.b('timber_red', u - 0.2, 0, 0, u + 0.2, 2.8, 0.4);
  F.b('lacquer_black', W * 0.25, 2.6, -0.05, W * 0.75, 2.9, 0.45, false);
  // the shed at the back: posts, a thatched roof on a ridge, the floor of beaten earth
  const sv0 = D - 8, sh = 2.9;
  if (el.lit && el.open) F.light(W / 2, 2.5, sv0 + 3.5);
  for (let u = 1.5; u < W - 1; u += 4.8) for (const v of [sv0, D - 1.2]) F.b('timber', u - 0.12, 0, v - 0.12, u + 0.12, sh, v + 0.12);
  gable(F, 0.6, sv0 - 0.3, W - 0.6, D - 0.5, sh, 1.4, 'thatch', 0.6);
  const mid = W / 2;
  const sign = F.sg > 0 ? 1 : -1;
  void sign;
  if (T === 'clay') {
    // clay heaps, the treading floor ringed with a low wall, a trough, sieves, straw
    for (let i = 0; i < 3; i++) bag.add('mud_plaster', frustum([F.X(2 + i * 5.5) - 1.5, Math.min(F.Z(4.5), F.Z(8)) , F.X(2 + i * 5.5) + 1.8, Math.max(F.Z(4.5), F.Z(8))], 0, 1.1 + rand() * 0.6, 0.6, 0.7, 0.7, 0.7, { noBottom: true }));
    F.lathe('mud_plaster', [[3.0, 0], [3.0, 0.4], [2.6, 0.4]], mid, 0, 15, 20);
    F.b('timber', W - 4.5, 0, 6, W - 2.5, 0.6, 7.4);
    for (let i = 0; i < 3; i++) F.lathe('terracotta', JAR(0.3), 2 + i * 0.8, 0, D - 3, 9);
    for (let i = 0; i < 4; i++) F.b('thatch', 2 + i * 0.9, 0, 11 + (i % 2) * 0.4, 2.8 + i * 0.9, 0.4, 11.6 + (i % 2) * 0.4, false);
  } else if (T === 'body') {
    // the turntable with a hollow torso being coiled, legs standing in a row, bodies drying under the shed
    for (let k = 0; k < 2; k++) {
      const u = 4 + k * 7, v = D - 5;
      F.b('timber', u - 0.5, 0, v - 0.5, u + 0.5, 0.5, v + 0.5); F.lathe('timber', [[0.6, 0.5], [0.6, 0.58], [0.001, 0.58]], u, 0, v, 12);
      F.lathe('terracotta', [[0.28, 0.58], [0.3, 0.9], [0.27, 1.2], [0.001, 1.22 + k * 0.1]], u, 0, v, 12);
      for (let r = 0; r < 4; r++) F.lathe('mud_plaster', [[0.29, 0.62 + r * 0.22], [0.305, 0.64 + r * 0.22], [0.29, 0.66 + r * 0.22]], u, 0, v, 12);
    }
    for (let i = 0; i < 5; i++) { F.lathe('terracotta', [[0.14, 0], [0.12, 0.5], [0.001, 0.52]], 2 + i * 0.5, 0, 6, 8); F.lathe('terracotta', [[0.14, 0], [0.12, 0.5], [0.001, 0.52]], 2.25 + i * 0.5, 0, 6.4, 8); }
    for (let i = 0; i < 3; i++) S(W - 4 - i * 1.4, 10 + (i % 2) * 0.5, { clay: true, kind: i === 1 ? 'arm_spear' : 'inf' });
    F.b('cloth_grey', W - 8.3, 1.65, 9.2, W - 3.6, 1.7, 11.2, false);
  } else if (T === 'head') {
    // shelves of moulds and heads in the open shed, a bench with the finishing tools
    for (let r = 0; r < 3; r++) F.b('timber', 1.5, 0.5 + r * 0.7, D - 1.1, W - 1.5, 0.56 + r * 0.7, D - 0.5, false);
    for (let r = 0; r < 3; r++) for (let i = 0; i < 12; i++) { const u = 2 + i * ((W - 4) / 12); bag.add(r === 1 ? 'terracotta' : 'mud_plaster', ball(0.1).translate(F.X(u), 0.56 + r * 0.7 + 0.1, F.Z(D - 0.8))); }
    F.b('timber', 3, 0, 8, 7.5, 0.85, 9.2); for (let i = 0; i < 5; i++) bag.add('terracotta', ball(0.09).translate(F.X(3.6 + i * 0.8), 0.95, F.Z(8.6)));
    for (let i = 0; i < 6; i++) { F.b('terracotta', W - 8 + (i % 3) * 1.0, 0, 6 + Math.floor(i / 3) * 1.2, W - 7.5 + (i % 3) * 1.0, 0.3, 6.5 + Math.floor(i / 3) * 1.2, false); }
  } else if (T === 'kiln') {
    // the round updraught kiln of brick with its firing mouth and a chimney hole, the fuel stacked, finished figures cooling
    const ku = mid, kv = 12;
    F.lathe('brick_grey', [[2.7, 0], [2.7, 1.8], [2.3, 3.0], [1.4, 3.6], [0.6, 3.8], [0.45, 3.8]], ku, 0, kv, 20);
    col.circle(F.X(ku), F.Z(kv), 2.7, 0, 3.8);
    F.b('opening', ku - 0.6, 0.1, kv - 2.75, ku + 0.6, 1.2, kv - 2.6, false);
    F.b('iron', ku - 0.7, 1.2, kv - 2.78, ku + 0.7, 1.3, kv - 2.6, false);
    for (let r = 0; r < 4; r++) F.b('log_pine', 1.5, r * 0.3, 3, 6.5, r * 0.3 + 0.28, 4.8, false);
    for (let i = 0; i < 4; i++) S(W - 4 - i * 1.2, 4, { clay: true, kind: 'inf' });
  } else if (T === 'paint') {
    // the painting shed: pots of pigment on a low table, a lacquer pot, painted figures drying
    F.b('lacquer_black', 3, 0, D - 4, 9, 0.5, D - 2.8);
    [['paint_blue', 0], ['cloth_red', 1], ['cloth_green', 2], ['paint_white', 3], ['cloth_maroon', 4], ['paint_ochre', 5]].forEach(([m, i]) => bag.add(m, lathe([[0.001, 0.5], [0.11, 0.52], [0.12, 0.62], [0.1, 0.66], [0.001, 0.62]], 8, null, F.X(3.6 + i * 0.95), 0, F.Z(D - 3.4))));
    F.lathe('lacquer_black', [[0.001, 0], [0.25, 0.02], [0.3, 0.4], [0.2, 0.5], [0.001, 0.5]], 11, 0, D - 3.2, 10);
    for (let i = 0; i < 4; i++) S(3 + i * 1.5, 11, { kind: i % 2 ? 'arm' : 'inf_spear' });
    for (let i = 0; i < 2; i++) S(W - 4 - i * 1.4, 12, { kind: 'officer' });
  } else {
    // the sledges: finished figures in rows ready to be drawn to the pit, rollers, ropes
    for (let k = 0; k < 2; k++) {
      const u = 3 + k * 9;
      F.b('timber', u, 0.2, 7, u + 7, 0.34, 8.6, false); F.b('timber', u, 0, 7, u + 0.3, 0.2, 8.6, false); F.b('timber', u + 6.7, 0, 7, u + 7, 0.2, 8.6, false);
      for (let i = 0; i < 5; i++) S(u + 0.9 + i * 1.3, 7.8, { y: 0.34, kind: ['arm', 'inf_spear', 'arm_halberd', 'inf', 'arm_spear'][i] });
    }
    for (let i = 0; i < 4; i++) bag.add('log_pine', lathe([[0.14, 0], [0.14, 4]], 8).rotateZ(Math.PI / 2).translate(F.X(W * 0.4), 0.14, F.Z(15 + i * 1.0)).translate(-2, 0, 0));
  }
}

/** qin_road: { x0, x1 } — the imperial road: the emperor's lane along its middle, the ruts of one gauge, low banks of beaten earth on both edges. */
export function qinRoad(el, { bag }) {
  const { x0, x1 } = el, L = ROAD.lane;
  bag.add('earth_wall', box(x0, 0, -L, x1, 0.06, L));
  for (const z of [-2.1, 0, 2.1]) for (const s of [-1, 1]) bag.add('mud_plaster', box(x0, 0.06, z + s * 0.695 - 0.08, x1, 0.072, z + s * 0.695 + 0.08));        // the ruts: 6 chi apart
  for (const s of [-1, 1]) {
    bag.add('earth_wall', frustum([x0, s < 0 ? ROAD.z0 - 3 : ROAD.z1, x1, s < 0 ? ROAD.z0 : ROAD.z1 + 3], 0, 0.4, 0, 0, 1.2, 1.2, { noBottom: true }));
  }
}
/** qin_pavilion: { at [x, z], yaw } — a road station: four posts, a hipped roof, a bench and a stone weight-marker. */
export function qinPavilion(el, { bag, col }) {
  const [x, z] = el.at;
  bag.add('earth_wall', box(x - 3, 0, z - 3, x + 3, 0.5, z + 3)); col.floor([x - 3, z - 3, x + 3, z + 3], 0.5);
  for (const dx of [-2.3, 2.3]) for (const dz of [-2.3, 2.3]) { bag.add('timber_red', lathe([[0.22, 0], [0.2, 3.2]], 10, null, x + dx, 0.5, z + dz)); col.circle(x + dx, z + dz, 0.25, 0.5, 3.7); }
  bag.add('lacquer_black', box(x - 2.7, 3.6, z - 2.7, x + 2.7, 4.0, z + 2.7));
  hipRoof({ c: [x, z], A: 3.8, B: 3.8, y: 4.0, rise: 2.0, lift: 0.3, pow: 1.3, mat: 'tile_dark', soffit: 'timber_red', ridgeMat: 'tile_dark', noChiwei: true }, { bag });
  bag.add('timber', box(x - 1.2, 0.5, z + 1.6, x + 1.2, 1.0, z + 2.0));
  void quad; void fromTriangles;
}
