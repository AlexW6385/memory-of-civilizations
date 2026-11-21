// Elements of Tang Chang'an that the shared Tang style does not have (the style stays as the other Tang places use it): registered as the
// style 'tang-changan', the Tang style's elements plus these. The settlement's plans name this style.
import '../../styles/tang/index.js';
import { registerStyle, STYLES } from '../../core/build.js';
import { daciHall } from './hall.js';
import { registerNight } from './night.js';
import { box } from '../../core/geom.js';
import { framePt } from './walk.js';
import { pagodaWear } from './wear.js';

/**
 * The Tang shop row for the walker: (1) the red tag hung from each signboard is raised clear of a head (it hung to 2.1 m in the door bay's line and
 * shut the door to the roof check); (2) the lane before each door bay (1.9 m wide, from the platform's edge out 3 m) is kept free of the frontage's
 * racks, pots and stoves, in the picture and in the colliders, so that every unit with a door can be walked into (docs §21).
 */
function shopRow(el, ctx) {
  const f = el.front || 's', al = f === 'n' || f === 's', W = al ? el.foot[2] - el.foot[0] : el.foot[3] - el.foot[1], D = al ? el.foot[3] - el.foot[1] : el.foot[2] - el.foot[0];
  const hw = W - 1.6, hd = D - 1.6, nbT = el.units.reduce((n, u) => n + u.nb, 0), bay = hw / nbT, P = framePt([(el.foot[0] + el.foot[2]) / 2, (el.foot[1] + el.foot[3]) / 2], f), lanes = [];
  let k = 0;
  for (const u of el.units) {
    if (u.nb >= 3) { const xd = -hw / 2 + (k + Math.floor(u.nb / 2) + 0.5) * bay, a = P([xd - 0.95, hd / 2 + 0.85]), b = P([xd + 0.95, hd / 2 + 3.4]); lanes.push([Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]); }
    k += u.nb;
  }
  const inLane = (x, z) => lanes.some((r) => x > r[0] && x < r[2] && z > r[1] && z < r[3]);
  const real = ctx.bag, rcol = ctx.col;
  const bag = new Proxy(real, { get(t, key) {
    if (key !== 'add') return t[key];
    return (mat, g) => {
      if (g?.attributes?.position) {
        g.computeBoundingBox(); const b = g.boundingBox;
        if (mat === 'cloth_red' && b.max.x - b.min.x < 0.08 && b.max.z - b.min.z < 0.08 && Math.abs(b.min.y - 2.1) < 0.01 && Math.abs(b.max.y - 2.5) < 0.01) return t.add(mat, box(b.min.x, 2.3, b.min.z, b.max.x, 2.5, b.max.z));
        if (b.min.y < 1.9 && inLane((b.min.x + b.max.x) / 2, (b.min.z + b.max.z) / 2) && b.max.x - b.min.x < 3.2 && b.max.z - b.min.z < 3.2) return undefined;
      }
      return t.add(mat, g);
    };
  } });
  const col = new Proxy(rcol, { get(t, key) {
    const v = t[key];
    if (key === 'circle') return (x, z, r, y0, y1) => (inLane(x, z) ? undefined : t.circle(x, z, r, y0, y1));
    if (key === 'rect') return (r, y0, y1) => (inLane((r[0] + r[2]) / 2, (r[1] + r[3]) / 2) && r[2] - r[0] < 3.2 && r[3] - r[1] < 3.2 ? undefined : t.rect(r, y0, y1));
    return typeof v === 'function' ? v.bind(t) : v;
  } });
  return STYLES.tang.elements.tang_shop_row(el, { ...ctx, bag, col });
}

/** tc_keepers { list: [figure parameters] }: the shopkeepers, built into the near plan of the shops they stand in (a life element's figures reach 170 m wherever they stand). */
function keepers(el, ctx) {
  const fig = STYLES.life?.elements?.figure;
  if (!fig) return;
  for (const f of el.list) fig({ ...f }, { bag: ctx.bag, col: ctx.col });
}

registerStyle('tang-changan', { ...STYLES.tang, elements: { ...STYLES.tang.elements, daci_hall: daciHall, tang_shop_row: shopRow, tc_keepers: keepers, tc_pagoda_wear: pagodaWear } });
registerNight();
