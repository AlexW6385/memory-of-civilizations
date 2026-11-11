// The surface of a rue of the Cité or the banks about 1250 (docs/settlements/paris.md §2c): a crown of rough cobbles down the
// middle, the kennel (the central gutter) in dressed stone, kerb stones at the house fronts, the mud at the edges
// with straw, dung, cabbage leaves, bones and a few planks laid as a crossing. { rect [x0, z0, x1, z1] (a street running along x),
// y, seed, simple? }. Registered into the `gothic` style.

import { STYLES } from '../../core/build.js';
import { box } from '../../core/geom.js';
import './index.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

function rue(el, { bag }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, zc = (z0 + z1) / 2, W = z1 - z0, r = rng(el.seed || 1);
  bag.add('pebbles', box(x0, y + 0.005, zc - W * 0.32, x1, y + 0.05, zc + W * 0.32));
  bag.add('flagstone', box(x0, y + 0.03, zc - 0.22, x1, y + 0.065, zc + 0.22));
  for (const z of [z0 + 0.12, z1 - 0.12]) bag.add('limestone', box(x0, y, z - 0.17, x1, y + 0.13, z + 0.17));
  if (el.simple) return;
  for (let x = x0 + 1 + r() * 3; x < x1 - 1; x += 3 + r() * 5) {
    const z = z0 + 0.5 + r() * (W - 1), k = r();
    if (k < 0.35) for (let i = 0; i < 5; i++) bag.add('thatch', box(x + r() * 0.5, y + 0.03, z + r() * 0.3, x + 0.2 + r() * 0.7, y + 0.045, z + 0.03 + r() * 0.07 + 0.1));
    else if (k < 0.6) bag.add('silt', box(x, y + 0.03, z, x + 0.3 + r() * 0.5, y + 0.07 + r() * 0.02, z + 0.3 + r() * 0.4));
    else if (k < 0.8) for (let i = 0; i < 3; i++) bag.add('flax_leaf', box(x + r() * 0.4, y + 0.03, z + r() * 0.4, x + 0.15 + r() * 0.25, y + 0.045, z + 0.15 + r() * 0.25));
    else if (k < 0.9) bag.add('plaster_damp', box(x, y + 0.03, z, x + 0.9 + r() * 0.9, y + 0.04, z + 0.6 + r() * 0.8));
    else for (let i = 0; i < 3; i++) bag.add('timber', box(x, y + 0.04, zc - W * 0.3 + i * 0.3, x + 0.14, y + 0.07, zc - W * 0.3 + i * 0.3 + 0.26 + W * 0.3));
  }
}
STYLES.gothic.elements.rue = rue;
