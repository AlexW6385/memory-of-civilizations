// The keepers of the enterable shops (docs/settlements/mamluk-cairo.md §19.3): one man seated cross-legged on the floor of each front room, built into near plans
// (a life element's figures reach 170 m wherever they stand; these show within 80 m). Place, dress and trade-hat follow the shop's own position alone.
import { STYLES } from '../../core/build.js';
import { shops, SHOP, tradeOf } from './layout.js';
import { hashAt } from './nightlight.js';
import './house.js';

const CL = ['cloth_white', 'cloth_white', 'cloth_white'];
/** Where the keeper of a shop of rect r (front on side f) sits: beside the walked lane (1.3 m from its middle), 2.5 m in from the front plane, facing the street. */
export function keeperAt(r, f) {
  const [x0, z0, x1, z1] = r, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, s = hashAt(cx, cz, 41) < 0.5 ? -1 : 1, d = 2.5, a = 1.3 * s;
  const [x, z, dx, dz] = f === 'e' ? [x1 - d, cz + a, 1, 0] : f === 'w' ? [x0 + d, cz + a, -1, 0] : f === 's' ? [cx + a, z1 - d, 0, 1] : [cx + a, z0 + d, 0, -1];
  return { at: [x, z], rot: -Math.atan2(dx, dz), seed: Math.floor(hashAt(cx, cz, 43) * 1e9), cloth: CL[Math.floor(hashAt(cx, cz, 47) * 3)] };
}
/** All keepers: the merchant's shop and the open shops of the market streets and the rows. */
export function keepers() {
  return [{ r: SHOP, f: 'e' }, ...shops().open.map((l) => ({ r: l.rect, f: l.front || 's' }))].map(({ r, f }) => keeperAt(r, f));
}
/** cairo_keepers { list }: a seated man each (the life style's figure builder, into this plan's bag and colliders). */
function keeperEl(el, ctx) {
  const fig = STYLES.life?.elements?.figure;
  if (!fig) return;
  for (const k of el.list) fig({ t: 'figure', at: k.at, y: 0.33, rot: k.rot, seed: k.seed, skin: 'skin_medium', dress: 'robe', cloth: k.cloth, cloth2: 'cloth_white', over: 'sash', hat: 'turban', hatMat: 'cloth_white', hair: 'short', man: true, pose: 'cross', carry: 'none' }, { bag: ctx.bag, col: ctx.col });
}
STYLES['mamluk-cairo'].elements.cairo_keepers = keeperEl;
/** The keepers in plans of 100 m cells, shown within 70 m. */
export function keeperPlans(base) {
  const cells = new Map();
  for (const k of keepers()) { const key = Math.floor(k.at[0] / 100) + ',' + Math.floor(k.at[1] / 100); if (!cells.has(key)) cells.set(key, []); cells.get(key).push(k); }
  return [...cells].map(([key, list]) => { const [i, j] = key.split(',').map(Number); return { ...base('mamluk-cairo-keepers-' + key, [{ t: 'cairo_keepers', list }]), style: 'mamluk-cairo', center: [i * 100 + 50, j * 100 + 50], near: 40 + 36, nocollide: false }; });
}
void tradeOf;
