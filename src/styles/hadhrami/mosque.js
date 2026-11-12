// The Friday mosque of Shibam (docs/settlements/shibam.md §2): a whitewashed mudbrick mosque squeezed among the towers, a court
// before a flat-roofed prayer hall on piers and beams of palm trunk, and a tall square minaret in stages.
import { box, rod, lathe } from '../../core/geom.js';
import { frustum } from '../../core/geom.js';

/** mosque_hall: { rect (the hall's interior), y, roofY } — square piers in two rows, palm-trunk beams, a flat roof, the mihrab niche in the west wall and a timber minbar. */
function mosqueHall(el, { bag, col, lights }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0.06, R = el.roofY ?? 5.6;
  const xs = [x0 + (x1 - x0) * 0.33, x0 + (x1 - x0) * 0.72];
  for (const x of xs) for (let z = z0 + 3.5; z < z1 - 2; z += 4.2) { bag.add('lime_plaster', box(x - 0.4, y - 0.05, z - 0.4, x + 0.4, R - 0.45, z + 0.4)); col.rect([x - 0.4, z - 0.4, x + 0.4, z + 0.4], y, R); bag.add('lime_plaster', box(x - 0.55, R - 0.75, z - 0.55, x + 0.55, R - 0.45, z + 0.55)); }
  for (let z = z0 + 0.6; z < z1; z += 1.1) bag.add('palm_trunk', rod([x0 - 0.1, R - 0.55, z], [x1 + 0.1, R - 0.55, z], 0.11, 7));
  for (const x of xs) bag.add('timber', box(x - 0.2, R - 0.45, z0, x + 0.2, R - 0.2, z1));
  bag.add('mud_plaster', box(x0 - 0.1, R - 0.2, z0 - 0.1, x1 + 0.1, R, z1 + 0.1));
  // the mihrab: a niche in the west wall's thickness, framed in lime, and the minbar beside it
  const mz = (z0 + z1) / 2;
  bag.add('lime_plaster', box(x0, y, mz - 1.2, x0 + 0.1, 3.4, mz + 1.2)); bag.add('opening', box(x0 + 0.1, y, mz - 0.8, x0 + 0.14, 2.8, mz + 0.8));
  for (let k = 0; k < 5; k++) bag.add('cedar', box(x0 + 0.2, y, mz + 1.6 + k * 0.0, x0 + 0.9 - k * 0.1, y + 0.3 + k * 0.28, mz + 2.5)), void k;
  col.rect([x0 + 0.2, mz + 1.6, x0 + 0.9, mz + 2.5], y, y + 1.7);
  for (let k = 0; k < 4; k++) lights.push({ at: [xs[k % 2], R - 1.0, z0 + 6 + Math.floor(k / 2) * 12], color: '#ffd9a0', intensity: 1.6, distance: 9 });
  // prayer rugs in rows before the mihrab, the Qur'an stands along the qibla wall, the shoe rack at the open side, brass lamps hung from the beams, a carved band
  for (let r = 0; r < 3; r++) for (let z = z0 + 2.2; z < z1 - 2; z += 1.0) bag.add(['cloth_green', 'cloth_red', 'cloth_maroon'][(((r + Math.floor(z)) % 3) + 3) % 3], box(x0 + 1.4 + r * 1.3, y + 0.02, z, x0 + 2.4 + r * 1.3, y + 0.035, z + 0.7));
  for (let z = z0 + 2.5; z < z1 - 2; z += 3.2) { if (Math.abs(z - mz) < 3) continue; for (const q of [-1, 1]) bag.add('wood_dark', rod([x0 + 0.5, y, z + q * 0.2], [x0 + 0.5, y + 0.4, z - q * 0.2], 0.02, 4)); bag.add('cedar', box(x0 + 0.38, y + 0.38, z - 0.28, x0 + 0.65, y + 0.42, z + 0.28)); }
  bag.add('timber', box(x1 - 0.5, y, z0 + 3, x1 - 0.1, y + 0.9, z0 + 6)); col.rect([x1 - 0.5, z0 + 3, x1 - 0.1, z0 + 6], y, y + 0.9); for (let k = 0; k < 3; k++) bag.add('timber', box(x1 - 0.5, y + 0.28 + k * 0.28, z0 + 3, x1 - 0.1, y + 0.3 + k * 0.28, z0 + 6));
  for (let k = 0; k < 5; k++) bag.add('leather_bench', box(x1 - 0.45, y + 0.3, z0 + 3.1 + k * 0.5, x1 - 0.15, y + 0.32, z0 + 3.4 + k * 0.5)), void k;
  bag.add('cedar', box(x0, R - 1.5, z0, x0 + 0.12, R - 0.9, z1)); for (let z = z0 + 0.6; z < z1 - 0.3; z += 0.9) bag.add('wood_dark', box(x0 + 0.1, R - 1.4, z, x0 + 0.13, R - 1.0, z + 0.45));
  for (let k = 0; k < 4; k++) { const lx = xs[k % 2], lz = z0 + 6 + Math.floor(k / 2) * 12; bag.add('iron', rod([lx, R - 0.55, lz], [lx, R - 1.2, lz], 0.008, 3)); bag.add('bronze', lathe([[0.001, 0], [0.12, 0.05], [0.18, 0.2], [0.1, 0.34], [0.001, 0.36]], 9, null, lx, R - 1.55, lz)); }
  // mats in rows
  for (let z = z0 + 1; z < z1 - 1; z += 1.4) bag.add('reed_mat', box(x0 + 1.2, y, z, x1 - 0.5, y + 0.02, z + 1.0));
}
/** minaret: { c, w, h } a tower of three stages, each narrower, lime-white, slit windows, a gallery under a small lantern. */
function minaret(el, { bag, col }) {
  const [cx, cz] = el.c, w = el.w ?? 3.8, h = el.h ?? 27;
  const stages = [[0, h * 0.55, w], [h * 0.55, h * 0.85, w * 0.72], [h * 0.85, h, w * 0.52]];
  stages.forEach(([ya, yb, ww], i) => {
    const hw = ww / 2, ins = i === 0 ? 0.35 : 0.12;
    bag.add(i === 0 ? 'mud_plaster' : 'lime_plaster', frustum([cx - hw, cz - hw, cx + hw, cz + hw], ya, yb, ins, ins, ins, ins, { noBottom: i === 0 }));
    bag.add('lime_plaster', box(cx - hw - 0.08, yb - 0.25, cz - hw - 0.08, cx + hw + 0.08, yb, cz + hw + 0.08));
    for (let k = 0; k < 3; k++) { const yy = ya + (yb - ya) * (0.25 + 0.25 * k); for (const [dx, dz] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) bag.add('opening', dx ? box(cx + dx * (hw - 0.02), yy, cz - 0.12, cx + dx * (hw + 0.03), yy + 0.55, cz + 0.12) : box(cx - 0.12, yy, cz + dz * (hw - 0.02), cx + 0.12, yy + 0.55, cz + dz * (hw + 0.03))); }
  });
  const g = w * 0.52 / 2;
  for (const [a, b, c, d] of [[-g, -g, g, -g + 0.2], [-g, g - 0.2, g, g], [-g, -g, -g + 0.2, g], [g - 0.2, -g, g, g]]) bag.add('lime_plaster', box(cx + a - 0.1, h, cz + b - 0.1, cx + c + 0.1, h + 0.9, cz + d + 0.1));
  bag.add('lime_plaster', box(cx - g * 0.6, h, cz - g * 0.6, cx + g * 0.6, h + 2.2, cz + g * 0.6)); bag.add('lime_plaster', box(cx - g * 0.8, h + 2.2, cz - g * 0.8, cx + g * 0.8, h + 2.4, cz + g * 0.8));
  col.rect([cx - w / 2, cz - w / 2, cx + w / 2, cz + w / 2], -1, h + 2.4);
}
export const MOSQUE_ELEMENTS = { mosque_hall: mosqueHall, minaret };
