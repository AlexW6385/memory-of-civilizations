// The Dutch Golden Age (17th c.; docs/settlements/amsterdam.md §4): narrow, tall canal houses of dark
// brick with white-trimmed windows and gables — stepped, neck and bell — and hoisting beams; the
// Town Hall on the Dam, classical in pale stone with its cupola; the Westerkerk's tower in stacked
// stages; brick bridges over the canals; ships.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, frustum, lathe } from '../../core/geom.js';
import '../qing/index.js';

const B = 'brick', W = 'plaster_white';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/** canal_house: { rect (narrow front on `front`), storeys, seed, y } — a tall house, its gable to the canal. */
function canalHouse(el, { bag, col }) {
  const rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, n = el.storeys ?? 4, st = 3.1, H = n * st, f = el.front ?? 's';
  const mat = rand() < 0.2 ? 'brick_buff' : B;
  bag.add(mat, box(x0, y - 0.6, z0, x1, y + H, z1)); col.rect(el.rect, y - 0.6, y + H);
  const along = f === 'n' || f === 's', w = along ? x1 - x0 : z1 - z0, L = along ? z1 - z0 : x1 - x0;
  // windows with white frames on the front, a row per storey
  for (let s = 0; s < n; s++) for (let k = 0; k < 3; k++) {
    const u = (along ? x0 : z0) + (k + 0.5) * w / 3, yy = y + s * st + (s === 0 ? 0.3 : 0.7), hh = s === 0 ? 2.4 : 1.8;
    const q = f === 's' ? [u - 0.45, z1 - 0.02, u + 0.45, z1 + 0.06] : f === 'n' ? [u - 0.45, z0 - 0.06, u + 0.45, z0 + 0.02] : f === 'e' ? [x1 - 0.02, u - 0.45, x1 + 0.06, u + 0.45] : [x0 - 0.06, u - 0.45, x0 + 0.02, u + 0.45];
    bag.add(W, box(q[0] - 0.06, yy - 0.06, q[1] - 0.06, q[2] + 0.06, yy + hh + 0.06, q[3] + 0.06));
    bag.add('opening', box(q[0] + (along ? 0.06 : 0), yy, q[1] + (along ? 0 : 0.06), q[2] - (along ? 0.06 : 0), yy + hh, q[3] - (along ? 0 : 0.06)));
  }
  // the gable: stepped, neck or bell, and the roof behind it running back from the canal
  const kind = rand(), gh = w * 0.95, fz = f === 's' ? z1 : f === 'n' ? z0 : null, fx = f === 'e' ? x1 : f === 'w' ? x0 : null;
  const gbox = (u0, u1, y0, y1) => { const q = along ? [u0, fz - 0.4, u1, fz] : [fx - 0.4, u0, fx, u1]; if (f === 'n') { q[1] = z0; q[3] = z0 + 0.4; } if (f === 'w') { q[0] = x0; q[2] = x0 + 0.4; } bag.add(mat, box(q[0], y0, q[1], q[2], y1, q[3])); };
  const a = along ? x0 : z0;
  if (kind < 0.4) { for (let s = 0; s < 4; s++) { const inset = s * w * 0.12; gbox(a + inset, a + w - inset, y + H + s * gh / 4, y + H + (s + 1) * gh / 4); } }
  else if (kind < 0.75) { gbox(a + w * 0.28, a + w * 0.72, y + H, y + H + gh); gbox(a, a + w, y + H, y + H + gh * 0.25); }
  else { gbox(a + w * 0.15, a + w * 0.85, y + H, y + H + gh * 0.7); gbox(a + w * 0.3, a + w * 0.7, y + H + gh * 0.7, y + H + gh); }
  const r = [x0 + 0.2, z0 + 0.2, x1 - 0.2, z1 - 0.2];
  bag.add('roof_tile', frustum(r, y + H, y + H + gh * 0.95, along ? w / 2 - 0.25 : 0, along ? w / 2 - 0.25 : 0, along ? 0 : w / 2 - 0.25, along ? 0 : w / 2 - 0.25));
  bag.add('timber', box(...(along ? [a + w / 2 - 0.1, y + H + gh * 0.8, (fz ?? 0) - (f === 's' ? -0.9 : 0.9), a + w / 2 + 0.1, y + H + gh * 0.88, fz ?? 0] : [fx ?? 0, y + H + gh * 0.8, a + w / 2 - 0.1, (fx ?? 0) + (f === 'e' ? 0.9 : -0.9), y + H + gh * 0.88, a + w / 2 + 0.1])));
  void L;
}
/** town_hall: { rect, h, y } — the classical block in pale stone, pediments on the long fronts, the cupola. */
function townHall(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = el.h ?? 33, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  bag.add('sandstone_dressed', box(x0, y - 0.5, z0, x1, y + h, z1)); col.rect(el.rect, y, y + h); col.floor(el.rect, y + h);
  for (const f of 'ns') { const zf = f === 'n' ? z0 : z1, n = 23; for (let i = 0; i < n; i++) for (let k = 0; k < 4; k++) { const x = x0 + (i + 0.5) * (x1 - x0) / n; bag.add('opening', box(x - 0.6, y + 2 + k * 7.5, zf - (f === 'n' ? 0.06 : -0.02), x + 0.6, y + 5.5 + k * 7.5, zf + (f === 'n' ? 0.02 : 0.06))); } bag.add('sandstone_dressed', frustum([cx - 18, zf - 0.6, cx + 18, zf + 0.6], y + h, y + h + 7, 17.8, 17.8, 0, 0)); }
  bag.add('lead', frustum([x0, z0, x1, z1], y + h, y + h + 4, 3, 3, 3, 3));
  bag.add('sandstone_dressed', lathe([[5, 0], [5, 10], [5.6, 10.5]], 8, null, cx, y + h + 4, cz));
  bag.add('lead', lathe([[5.6, 0], [4.5, 3], [1.2, 6], [0.5, 9], [0.001, 10]], 8, null, cx, y + h + 14.5, cz));
}
/** stacked_tower: a church tower in stacked stages { c, s, h, y } — brick base, stone stages narrowing, the crown. */
function stackedTower(el, { bag, col }) {
  const [x, z] = el.c, s = el.s ?? 9, h = el.h ?? 85, y = el.y ?? 0;
  bag.add(B, box(x - s / 2, y - 0.5, z - s / 2, x + s / 2, y + h * 0.45, z + s / 2)); col.rect([x - s / 2, z - s / 2, x + s / 2, z + s / 2], y, y + h * 0.6);
  let yy = y + h * 0.45;
  for (const [r, hh] of [[s * 0.42, h * 0.14], [s * 0.36, h * 0.12], [s * 0.3, h * 0.1]]) { bag.add('sandstone_dressed', lathe([[r, 0], [r, hh], [r * 1.12, hh + 0.4]], 8, null, x, yy, z)); yy += hh + 0.4; }
  bag.add('lead', lathe([[s * 0.32, 0], [s * 0.2, h * 0.06], [0.4, h * 0.12], [0.001, h * 0.16]], 8, null, x, yy, z));
}
/** ship: a three-masted ship at anchor { at, dir, len, y }. */
function ship(el, ctx) {
  const { bag } = ctx, [x, z] = el.at, L = el.len ?? 30, y = el.y ?? 0, [dx, dz] = el.dir ?? [1, 0];
  STYLES.qing.elements.boat({ at: el.at, dir: el.dir ?? [1, 0], len: L, y }, ctx);
  for (const k of [-0.3, 0, 0.3]) bag.add('timber', lathe([[0.25, 0], [0.15, L * 0.8]], 6, null, x + dx * k * L, y + 1, z + dz * k * L));
}
registerStyle('dutch', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, canal_house: canalHouse, town_hall: townHall, stacked_tower: stackedTower, ship },
  objects: {},
});
