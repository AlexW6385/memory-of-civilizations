// The dress of the Weiyang terrace's faces (docs/settlements/han-changan.md §4b): the ribs of timber (the lashed posts of the rammed-earth formwork,
// left standing in the face of a Han platform as pilasters) every 7.5 m up each tier, the rain gullies running down from the coping, the gilt
// finials on the ramp's balustrade posts. The terrace itself is the han_terrace's (src/styles/han/hall.js).
import { box, lathe } from '../../core/geom.js';

const rngOf = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); };

/** hanl_terrace_dress: { tiers: [{ r, top }], ramp: { x: [x0, x1], z0, z1 }, seed } */
export function terraceDress(el, ctx) {
  const { bag } = ctx, rand = rngOf(el.seed ?? 3), rp = el.ramp, cx = (rp.x[0] + rp.x[1]) / 2;
  el.tiers.forEach((t, i) => {
    const [x0, z0, x1, z1] = t.r, prev = i ? el.tiers[i - 1].top : 0, y0 = prev + 0.4, y1 = t.top - 0.34;
    const along = (a, b, fn) => { const n = Math.max(2, Math.round((b - a) / 7.5)); for (let k = 0; k <= n; k++) fn(a + 1.2 + (b - a - 2.4) * k / n, k, n); };
    // the south face (z1), toward the forecourt: not across the ramp
    along(x0, x1, (x) => {
      if (Math.abs(x - cx) < 7) return;
      bag.add('timber_red', box(x - 0.25, y0, z1 + 0.07, x + 0.25, y1, z1 + 0.27));
      if (rand() < 0.7) bag.add('plaster_streak', box(x + 0.5 + rand() * 2.2, y1 - 1.6 - rand() * 0.8, z1 + 0.02, x + 0.95 + rand() * 2.2, y1 + 0.05, z1 + 0.04));
    });
    // the east and west faces
    for (const [xf, sg] of [[x0, -1], [x1, 1]]) along(z0, z1, (z) => {
      bag.add('timber_red', box(sg < 0 ? xf - 0.27 : xf + 0.07, y0, z - 0.25, sg < 0 ? xf - 0.07 : xf + 0.27, y1, z + 0.25));
      if (rand() < 0.7) { const zz = z + 0.5 + rand() * 2.2; bag.add('plaster_streak', box(sg < 0 ? xf - 0.04 : xf + 0.02, y1 - 1.6 - rand() * 0.8, zz, sg < 0 ? xf - 0.02 : xf + 0.04, y1 + 0.05, zz + 0.45)); }
    });
  });
  // the gilt finials (a lotus bud on a collar) on the ramp's balustrade posts
  const crown = el.tiers[el.tiers.length - 1];
  for (const x of rp.x) for (let z = rp.z1; z > rp.z0; z -= 3) {
    const h = crown.top * (rp.z1 - z) / (rp.z1 - rp.z0) + 1.0;
    bag.add('gilt_bronze', lathe([[0.001, h], [0.13, h], [0.13, h + 0.05], [0.07, h + 0.08], [0.1, h + 0.16], [0.06, h + 0.3], [0.001, h + 0.38]], 8, null, x, 0, z));
  }
}
