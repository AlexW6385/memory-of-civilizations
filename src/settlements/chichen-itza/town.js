// The town round the Great Plaza (docs/settlements/chichen-itza.md §6): house lots enclosed by
// dry-stone walls, each with one to three oval houses of wattle and thatch.

import { RADIUS, lots } from './layout.js';

const base = (id, elements) => ({ id, style: 'maya', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 62], facing: 'n' } });

function lotElements(l) {
  const [x0, z0, x1, z1] = l.rect, E = [], gw = 2.4;
  const sides = [[[x0, z0], [x1, z0]], [[x1, z0], [x1, z1]], [[x1, z1], [x0, z1]], [[x0, z1], [x0, z0]]];
  sides.forEach(([a, b], i) => {
    if (i !== l.gate) { E.push({ t: 'albarrada', pts: [a, b] }); return; }
    const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
    E.push({ t: 'albarrada', pts: [a, [m[0] - ux * gw, m[1] - uz * gw]] });
    E.push({ t: 'albarrada', pts: [[m[0] + ux * gw, m[1] + uz * gw], b] });
  });
  for (const h of l.houses) E.push({ t: 'maya_house', ...h });
  return E;
}

export async function town() {
  const all = lots(), plans = [];
  for (let i = 0; i < all.length; i += 30) plans.push(base(`chichen-itza-town-${i / 30}`, all.slice(i, i + 30).flatMap(lotElements)));
  return plans;
}
