// The parvis of Sainte-Foy about 1120 (docs/settlements/conques.md §1j): the terrace before the west front, the ground the pilgrims
// stood on — schist flags laid in courses along the way to the great portal, cobbled and trodden patches, grave slabs with their
// incised crosses (the burials of the abbey's lay people lay by the church), scallop shells dropped by pilgrims, moss and grass in the
// joints, a worn kerb along the terrace's edge. Registered into the `romanesque` style.

import { STYLES } from '../../core/build.js';
import { box } from '../../core/geom.js';
import './index.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
const hit = (a, b) => a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];

/** parvis_ground: { rect [x0, z0, x1, z1], y, seed, skip: [rects], way: [x0, z0, x1, z1] (the flagged way, along x), kerb: z or x lines [rects] } */
function parvisGround(el, { bag }) {
  const [X0, Z0, X1, Z1] = el.rect, y = el.y ?? 0, r = rng(el.seed || 11), skip = el.skip ?? [];
  const free = (a, b, c, d) => !skip.some((s) => hit([a, b, c, d], s));
  if (el.way) {
    const [x0, z0, x1, z1] = el.way, Wd = z1 - z0;
    bag.add('flagstone', box(x0, y + 0.012, z0, x1, y + 0.04, z1));
    for (let u = x0 + 0.8 + r() * 0.6; u < x1; u += 0.8 + r() * 1.2) bag.add('schist_rubble', box(u, y + 0.04, z0, u + 0.035, y + 0.047, z1));
    for (let v = 1.1; v < Wd - 0.3; v += 1.0 + r() * 0.5) bag.add('schist_rubble', box(x0, y + 0.04, z0 + v, x1, y + 0.047, z0 + v + 0.035));
    for (const z of [z0 - 0.15, z1 - 0.02]) bag.add('schist_rubble', box(x0, y, z, x1, y + 0.1, z + 0.17));
  }
  const n = Math.round(((X1 - X0) * (Z1 - Z0)) / 140);
  for (let i = 0; i < n; i++) {
    const x = X0 + r() * (X1 - X0), z = Z0 + r() * (Z1 - Z0), k = r(), a = 0.8 + r() * 2.6, b = 0.7 + r() * 2.0;
    if (!free(x, z, x + a, z + b) || (el.way && hit([x, z, x + a, z + b], [el.way[0], el.way[1] - 0.4, el.way[2], el.way[3] + 0.4]))) continue;
    if (k < 0.3) bag.add('pebbles', box(x, y + 0.006, z, x + a, y + 0.04, z + b));
    else if (k < 0.47) bag.add('silt', box(x, y + 0.006, z, x + a * 0.8, y + 0.03, z + b * 0.8));
    else if (k < 0.62) bag.add('sod', box(x, y + 0.006, z, x + a * 0.6, y + 0.035, z + b * 0.5));
    else if (k < 0.74) bag.add('plaster_damp', box(x, y + 0.006, z, x + a, y + 0.012, z + b));
    else if (k < 0.9) bag.add('flagstone', box(x, y + 0.008, z, x + a * 0.8, y + 0.03, z + b * 0.8));
    else {
      // a grave slab, its cross incised (two shallow bars of darker stone)
      const L = 1.9, W = 0.8;
      if (free(x, z, x + W, z + L)) { bag.add('limestone', box(x, y + 0.006, z, x + W, y + 0.07, z + L)); bag.add('schist_rubble', box(x + W / 2 - 0.03, y + 0.07, z + 0.35, x + W / 2 + 0.03, y + 0.076, z + L - 0.25)); bag.add('schist_rubble', box(x + 0.2, y + 0.07, z + 0.75, x + W - 0.2, y + 0.076, z + 0.81)); }
    }
  }
  // scallop shells dropped on the way (the pilgrims' badge), small and pale
  for (let i = 0; i < (el.shells ?? 14); i++) { const x = X0 + r() * (X1 - X0), z = Z0 + r() * (Z1 - Z0); if (free(x, z, x + 0.1, z + 0.1)) bag.add('ivory', box(x, y + 0.01, z, x + 0.09, y + 0.03, z + 0.08)); }
  // weeds in the joints along the terrace's edge: tufts of sod
  for (const e of el.edge ?? []) for (let i = 0; i < 10; i++) { const t = r(), x = e[0] + (e[2] - e[0]) * t, z = e[1] + (e[3] - e[1]) * t; bag.add('sod', box(x, y, z, x + 0.25 + r() * 0.3, y + 0.05 + r() * 0.05, z + 0.2 + r() * 0.25)); }
}

STYLES.romanesque.elements.parvis_ground = parvisGround;
