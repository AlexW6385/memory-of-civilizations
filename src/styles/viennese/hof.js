// The Höfe of the blocks (docs/settlements/vienna.md §12): behind the street houses lies the yard, paved in granite setts and reached by
// the Durchhaus passage; plain rear wings of three floors stand along its long sides with their Pawlatschen galleries, and in it the
// things of a tenement's common life — the carpet-beating frame, the washing line with its wash, the dustbins, the firewood and coal
// store, a bench under the tree, a hand-cart, the pump or well, the Bassena's tap, pots by the doors.
import { box, lathe, rod, frustum } from '../../core/geom.js';
import { faceFrame, fbox } from '../dutch/facade.js';
import { rng, rearFace } from './detail.js';
import { sashWindow } from './mietshaus.js';

/** hof_wing: { rect, front, seed, storeys, simple } — a plain wing of the yard, its face (with galleries) to the yard. */
export function hofWing(el, { bag, col }) {
  const r = rng(el.seed || 1), y = el.y ?? 0, n = el.storeys ?? 3, f = el.front ?? 's', F = faceFrame(el.rect, f), [x0, z0, x1, z1] = el.rect;
  const floors = [0]; for (let i = 1; i < n; i++) floors.push(3.7 + (i - 1) * 3.3);
  const H = floors[n - 1] + 3.3, mat = ['stucco_pale', 'plaster_grey', 'stucco_cream', 'stucco_ochre'][Math.floor(r() * 4)];
  bag.add(mat, box(x0, y - 0.6, z0, x1, y + H, z1)); col.rect(el.rect, y - 0.6, y + H);
  if (!el.simple) rearFace(bag, F, y, { n, floors, H, r, lod: 1, gallery: true }, sashWindow);
  const along = f === 'n' || f === 's', D = F.D, rh = Math.min(3.4, D * 0.5);
  bag.add(r() < 0.8 ? 'roof_tile' : 'slate', frustum([x0 - (along ? 0 : 0.3), z0 - (along ? 0.3 : 0), x1 + (along ? 0 : 0.3), z1 + (along ? 0.3 : 0)], y + H, y + H + rh, ...(along ? [0, 0, D / 2 + 0.2, D / 2 + 0.2] : [D / 2 + 0.2, D / 2 + 0.2, 0, 0])));
  const c = F.at(F.w * (0.2 + r() * 0.6), -D / 2);
  bag.add('brick_baked', box(c[0] - 0.35, y + H, c[1] - 0.35, c[0] + 0.35, y + H + rh + 1.0, c[1] + 0.35));
}

/** hof_yard: { rect, seed, mouths: [rect…], simple } — the paving and the things of the common life. */
export function hofYard(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, r = rng(el.seed || 1);
  bag.add('granite_block', box(x0, y, z0, x1, y + 0.05, z1));
  if (el.simple) return;
  const clear = (x, z, m = 1.2) => !(el.mouths ?? []).some((q) => x > q[0] - m && x < q[2] + m && z > q[1] - m && z < q[3] + m);
  const W = x1 - x0, D = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, wing = el.wing ?? 5.6;
  // a gutter down the middle of the paving, of flagstones
  bag.add('flagstone', box(x0, y + 0.04, cz - 0.3, x1, y + 0.07, cz + 0.3));
  // the carpet-beating frame (Teppichklopfstange): two posts and a bar
  { const a = [x0 + W * 0.28, cz + D * 0.28]; if (clear(...a, 1.5)) { for (const s of [-1, 1]) { bag.add('iron', rod([a[0] + s * 1.2, y, a[1]], [a[0] + s * 1.2, y + 2.4, a[1]], 0.05, 6)); col.circle(a[0] + s * 1.2, a[1], 0.08, y, y + 2.4); } bag.add('iron', rod([a[0] - 1.2, y + 2.35, a[1]], [a[0] + 1.2, y + 2.35, a[1]], 0.04, 6)); bag.add('cloth_red', box(a[0] - 0.5, y + 1.35, a[1] - 0.02, a[0] + 0.5, y + 2.3, a[1] + 0.02)); } }
  // the washing line between two poles, the wash on it
  { const a = [x0 + W * 0.5, z0 + wing + 1.0], b = [x0 + W * 0.8, z0 + wing + 1.0]; for (const p of [a, b]) { bag.add('wood_dark', rod([p[0], y, p[1]], [p[0], y + 3.2, p[1]], 0.06, 6)); col.circle(p[0], p[1], 0.08, y, y + 3.2); } bag.add('rope_fibre', box(a[0], y + 3.05, a[1] - 0.01, b[0], y + 3.07, a[1] + 0.01));
    for (let k = 0; k < 7; k++) { const u = a[0] + 0.3 + k * (b[0] - a[0] - 0.6) / 6, w = 0.35 + r() * 0.25, h = 0.5 + r() * 0.5; bag.add(['cloth_white', 'cloth_white', 'linen', 'cloth_blue', 'cloth_red'][Math.floor(r() * 5)], box(u - w / 2, y + 3.06 - h, a[1] - 0.02, u + w / 2, y + 3.06, a[1] + 0.02)); } }
  // the dustbins (galvanised) and the firewood and coal store by a wing's end
  for (let k = 0; k < 3; k++) { const p = [x1 - 1.0 - k * 0.7, z1 - wing - 0.7]; if (!clear(...p)) continue; bag.add('iron_galv', lathe([[0.001, 0], [0.3, 0], [0.32, 0.8], [0.3, 0.82], [0.001, 0.82]], 10, null, p[0], y, p[1])); bag.add('iron_galv', lathe([[0.001, 0.82], [0.32, 0.82], [0.2, 0.92], [0.001, 0.95]], 10, null, p[0], y, p[1])); col.circle(p[0], p[1], 0.33, y, y + 0.9); }
  { const p = [x0 + 1.4, z1 - wing - 0.6]; if (clear(...p)) { for (let q = 0; q < 4; q++) for (let k = 0; k < 6; k++) bag.add('wood_ochre', box(p[0] + k * 0.2, y + q * 0.17, p[1] - 0.3, p[0] + k * 0.2 + 0.18, y + q * 0.17 + 0.15, p[1] + 0.3)); col.rect([p[0], p[1] - 0.3, p[0] + 1.2, p[1] + 0.3], y, y + 0.7); } }
  // the well with a pump (a cast-iron pump on a stone trough) and the Bassena's tap in the wall by it
  { const p = [x0 + W * 0.32, z0 + wing + 2.2]; if (clear(...p, 2)) { bag.add('granite_grey', lathe([[0.001, 0], [0.6, 0], [0.6, 0.55], [0.5, 0.6], [0.001, 0.6]], 12, null, p[0], y, p[1])); bag.add('iron', lathe([[0.001, 0.6], [0.14, 0.6], [0.09, 1.1], [0.07, 1.3], [0.001, 1.34]], 8, null, p[0], y, p[1])); bag.add('iron', rod([p[0], y + 1.15, p[1]], [p[0] + 0.4, y + 1.05, p[1]], 0.025, 5)); bag.add('iron', rod([p[0] - 0.4, y + 1.38, p[1]], [p[0] + 0.0, y + 1.3, p[1]], 0.02, 5)); col.circle(p[0], p[1], 0.62, y, y + 1.4); } }
  // a bench under the tree and a hand-cart by the wall, flowerpots by the doors
  { const p = [x1 - W * 0.22, cz + D * 0.1]; if (clear(...p)) { bag.add('wood_painted', box(p[0] - 0.8, y + 0.42, p[1] - 0.2, p[0] + 0.8, y + 0.48, p[1] + 0.2)); bag.add('wood_painted', box(p[0] - 0.8, y + 0.7, p[1] + 0.2, p[0] + 0.8, y + 0.78, p[1] + 0.24)); for (const s of [-1, 1]) bag.add('iron', box(p[0] + s * 0.7 - 0.03, y, p[1] - 0.18, p[0] + s * 0.7 + 0.03, y + 0.42, p[1] + 0.18)); col.rect([p[0] - 0.8, p[1] - 0.2, p[0] + 0.8, p[1] + 0.25], y, y + 0.8); } }
  { const p = [x0 + W * 0.7, z1 - wing - 1.2]; if (clear(...p)) { bag.add('wood_dark', box(p[0] - 0.5, y + 0.45, p[1] - 0.8, p[0] + 0.5, y + 0.55, p[1] + 0.8)); bag.add('wood_dark', box(p[0] - 0.5, y + 0.55, p[1] - 0.8, p[0] - 0.45, y + 0.85, p[1] + 0.8)); bag.add('wood_dark', box(p[0] + 0.45, y + 0.55, p[1] - 0.8, p[0] + 0.5, y + 0.85, p[1] + 0.8)); for (const s of [-1, 1]) bag.add('iron', lathe([[0.001, -0.03], [0.4, -0.03], [0.4, 0.03], [0.001, 0.03]], 12, null, 0, 0, 0).rotateZ(Math.PI / 2).translate(p[0] + s * 0.53, y + 0.4, p[1])); bag.add('wood_dark', box(p[0] - 0.03, y + 0.7, p[1] - 2.2, p[0] + 0.03, y + 0.75, p[1] - 0.8)); col.rect([p[0] - 0.5, p[1] - 0.8, p[0] + 0.5, p[1] + 0.8], y, y + 0.9); } }
  for (let k = 0; k < 6; k++) { const p = [x0 + 2 + r() * (W - 4), r() < 0.5 ? z0 + wing + 0.35 : z1 - wing - 0.35]; if (!clear(...p)) continue; bag.add('terracotta', lathe([[0.001, 0], [0.14, 0], [0.18, 0.3], [0.001, 0.3]], 8, null, p[0], y, p[1])); bag.add('cloth_green', lathe([[0.001, 0.3], [0.2, 0.3], [0.22, 0.55], [0.001, 0.62]], 8, null, p[0], y, p[1])); }
  void fbox;
}
