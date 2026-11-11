// The streets, the market well, the landing and the harbour office of Mohenjo-daro (docs/settlements/mohenjo-daro.md §2, §6).
import { box, lathe, frustum } from '../../core/geom.js';
import { Fr, rng, wellAt } from './kit.js';

const jar = (bag, mat, x, y, z, s = 1) => bag.add(mat, lathe([[0.07 * s, 0], [0.2 * s, 0.12 * s], [0.24 * s, 0.3 * s], [0.19 * s, 0.5 * s], [0.1 * s, 0.6 * s], [0.12 * s, 0.66 * s], [0.001, 0.66 * s]], 8, null, x, y, z));

/** indus_streets: { streets: [rect], lanes: [rect] } — the covered brick drains along the streets' edges with their manholes, along the lanes' edges the house drains. */
export function streets(el, ctx) {
  const { bag } = ctx;
  const strip = (x0, z0, x1, z1, h) => bag.add('brick_baked', box(x0, 0, z0, x1, h, z1));
  for (const [x0, z0, x1, z1] of el.streets) {
    const alongZ = z1 - z0 > x1 - x0, w = alongZ ? x1 - x0 : z1 - z0, off = 0.9, dw = 0.6;
    for (const s of [-1, 1]) {
      if (alongZ) { const x = s < 0 ? x0 + off : x1 - off - dw; strip(x, z0, x + dw, z1, 0.08); for (let z = z0 + 7; z < z1 - 3; z += 14) bag.add('bitumen', box(x + 0.05, 0.08, z, x + dw - 0.05, 0.11, z + 0.5)); }
      else { const z = s < 0 ? z0 + off : z1 - off - dw; strip(x0, z, x1, z + dw, 0.08); for (let x = x0 + 7; x < x1 - 3; x += 14) bag.add('bitumen', box(x, 0.08, z + 0.05, x + 0.5, 0.11, z + dw - 0.05)); }
    }
    void w;
  }
  for (const [x0, z0, x1, z1] of el.lanes) {
    const alongZ = z1 - z0 > x1 - x0;
    for (const s of [-1, 1]) {
      if (alongZ) { const x = s < 0 ? x0 + 0.12 : x1 - 0.47; strip(x, z0, x + 0.35, z1, 0.06); }
      else { const z = s < 0 ? z0 + 0.12 : z1 - 0.47; strip(x0, z, x1, z + 0.35, 0.06); }
    }
  }
}

/** indus_market: { rect, well: [x, z] } — the market place: paved in brick, the great well with its troughs, a ring of stone weights, the posts of the stalls. */
export function market(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, [wx, wz] = el.well, rand = rng(3);
  bag.add('brick_paving', box(x0, -0.08, z0, x1, 0.03, z1)); col.floor(el.rect, 0.03);
  bag.add('brick_baked', lathe([[2.4, 0], [2.4, 0.7], [2.1, 0.78], [1.5, 0.78], [1.5, 0.3], [0.001, 0.3]], 24, null, wx, 0, wz));
  bag.add('brick_paving', lathe([[4.6, 0], [4.6, 0.06], [2.4, 0.08], [2.4, 0]], 24, null, wx, 0.03, wz));
  col.circle(wx, wz, 2.5, 0, 0.75);
  for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + 0.4, tx = wx + Math.cos(a) * 3.8, tz = wz + Math.sin(a) * 3.8; bag.add('mudbrick', box(tx - 0.9, 0.03, tz - 0.35, tx + 0.9, 0.5, tz + 0.35)); bag.add('water', box(tx - 0.8, 0.45, tz - 0.25, tx + 0.8, 0.47, tz + 0.25)); col.rect([tx - 0.9, tz - 0.35, tx + 0.9, tz + 0.35], 0.03, 0.5); }
  // the stalls: four posts and a reed-mat shade each, goods on the ground mats, ranged along the sides
  const stall = (x, z, rot, goods) => {
    for (const dx of [-1.3, 1.3]) for (const dz of [-0.8, 0.8]) { bag.add('timber', box(x + dx - 0.06, 0, z + dz - 0.06, x + dx + 0.06, 2.3, z + dz + 0.06)); }
    bag.add('reed_mat', box(x - 1.5, 2.3, z - 1.0, x + 1.5, 2.36, z + 1.0));
    bag.add('reed_mat', box(x - 1.2, 0.03, z - 0.6, x + 1.2, 0.07, z + 0.6));
    for (let k = 0; k < 5; k++) {
      const gx = x - 1.0 + k * 0.5, gz = z + (k % 2 ? 0.2 : -0.2);
      if (goods === 'grain') bag.add('sacking', lathe([[0.3, 0], [0.32, 0.2], [0.15, 0.3], [0.001, 0.32]], 8, null, gx, 0.07, gz));
      else if (goods === 'pots') jar(bag, k % 2 ? 'terracotta' : 'pottery_dark', gx, 0.07, gz, 1.2);
      else if (goods === 'beads') bag.add('inlay_carnelian', box(gx - 0.08, 0.07, gz - 0.08, gx + 0.08, 0.12, gz + 0.08));
      else if (goods === 'cloth') bag.add(['cloth_white', 'cloth_indigo', 'cloth_red', 'cloth_ochre', 'cloth_white'][k], box(gx - 0.2, 0.07, gz - 0.2, gx + 0.2, 0.2 + 0.05 * k, gz + 0.2));
      else bag.add('wicker', lathe([[0.2, 0], [0.26, 0.15], [0.001, 0.15]], 8, null, gx, 0.07, gz));
    }
    void rot;
  };
  const kinds = ['grain', 'pots', 'beads', 'cloth', 'baskets', 'grain', 'pots'];
  let i = 0;
  for (let x = x0 + 5; x < x1 - 4; x += 7) { stall(x, z0 + 2.2, 0, kinds[i++ % 7]); stall(x, z1 - 2.2, 0, kinds[i++ % 7]); }
  for (let z = z0 + 9; z < z1 - 8; z += 7) { stall(x0 + 2.2, z, 0, kinds[i++ % 7]); stall(x1 - 2.2, z, 0, kinds[i++ % 7]); }
  void rand;
}

/** indus_quay: { x0, x1, z0, z1, top, bed, level, stairs: [z] } — the landing: a platform of baked brick down to the river bed, stairs into the water, bollards, the warehouse row behind. */
export function quay(el, ctx) {
  const { bag, col } = ctx, { x0, x1, z0, z1, top, bed, level } = el;
  bag.add('brick_baked', box(x0, bed, z0, x1, top, z1)); col.rect([x1 - 0.5, z0, x1, z1], bed, top);
  bag.add('brick_paving', box(x0, top - 0.04, z0, x1, top + 0.02, z1)); col.floor([x0, z0, x1 - 0.5, z1], top + 0.02);
  bag.add('brick_baked', box(x1 - 0.5, top, z0, x1, top + 0.3, z1), false);
  el.stairs.forEach((zc) => {
    const w = 3, n = 11, rise = (top + 0.02 - (level - 0.5)) / n, run = 0.5;
    for (let i = 0; i < n; i++) bag.add('brick_baked', box(x1, level - 0.5 + i * rise, zc - w, x1 + run * (n - i), level - 0.5 + (i + 1) * rise, zc + w));
    col.ramp([x1, zc - w, x1 + run * n, zc + w], level - 0.5, top + 0.02, 'w');
  });
  for (let z = z0 + 6; z < z1 - 4; z += 9) {
    if (el.stairs.some((s) => Math.abs(s - z) < 6)) continue;
    bag.add('timber', lathe([[0.16, 0], [0.18, 0.5], [0.22, 0.58], [0.001, 0.6]], 8, null, x1 - 0.8, top, z)); bag.add('rope_fibre', lathe([[0.17, 0.2], [0.2, 0.22], [0.2, 0.36], [0.17, 0.38]], 8, null, x1 - 0.8, top, z)); col.circle(x1 - 0.8, z, 0.25, top, top + 0.6);
  }
}

/** indus_office: { rect } — the harbour office: a brick room with a counter, baskets of clay sealings and a seal press, jars and weights, a doorway toward the town (west) and an open front toward the quay (east). */
export function office(el, ctx) {
  const { bag, col, lights } = ctx, [x0, z0, x1, z1] = el.rect, H = 3.2, t = 0.5, my = (z0 + z1) / 2;
  const seg = (r, y0, y1, m = 'brick_baked') => { bag.add(m, box(r[0], y0, r[1], r[2], y1, r[3])); col.rect(r, y0, y1); };
  bag.add('brick_paving', box(x0, -0.1, z0, x1, 0.04, z1)); col.floor(el.rect, 0.04);
  seg([x0, z0, x1, z0 + t], 0, H); seg([x0, z1 - t, x1, z1], 0, H);
  seg([x0, z0 + t, x0 + t, my - 0.7], 0, H); seg([x0, my + 0.7, x0 + t, z1 - t], 0, H); seg([x0, my - 0.7, x0 + t, my + 0.7], 2.1, H);
  seg([x1 - t, z0 + t, x1 - t + 0.0 + t * 0.5, z0 + 2.6], 0, H); seg([x1 - t, z1 - 2.6, x1, z1 - t], 0, H);
  bag.add('mud_plaster', box(x0 - 0.1, H, z0 - 0.1, x1 + 0.1, H + 0.4, z1 + 0.1)); col.floor(el.rect, H + 0.4);
  seg([x0 + 2, my - 1.2, x0 + 2.8, my + 1.2], 0, 1.0, 'mudbrick');
  for (let k = 0; k < 4; k++) bag.add('soapstone', box(x0 + 2.1 + (k % 2) * 0.3, 1.0, my - 0.8 + k * 0.4, x0 + 2.35 + (k % 2) * 0.3, 1.05, my - 0.6 + k * 0.4));
  for (let k = 0; k < 5; k++) { bag.add('wicker', lathe([[0.2, 0], [0.26, 0.2], [0.001, 0.2]], 8, null, x1 - 2.2, 0.04, z0 + 1.6 + k * 0.9)); }
  for (let k = 0; k < 4; k++) jar(bag, k % 2 ? 'terracotta' : 'pottery_dark', x0 + 1.2 + k * 0.7, 0.04, z1 - 1.2, 1.6);
  for (let k = 0; k < 5; k++) bag.add('granite_grey', box(x1 - 4.5 + k * 0.25, 0.04, z1 - 1.3, x1 - 4.35 + k * 0.25, 0.04 + 0.08 + 0.03 * k, z1 - 1.15));
  lights.push({ at: [(x0 + x1) / 2, 2.4, my], color: '#ffd9a0', intensity: 3, distance: 9 });
}
