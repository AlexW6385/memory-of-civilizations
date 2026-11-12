// The precinct's fixtures at eye level (docs/settlements/tenochtitlan.md §13): the braziers (tlexictli) kept burning at the Templo Mayor's
// stair, and the offerings the worshippers leave — heaps of marigold (cempasuchitl), balls of copal on a leaf, bundles of bark paper, a
// bundle of fuel sticks. `mx_dress { items: [[kind, x, z, rot]] }`; kits cached, laid as instances within a short reach.

import { lathe } from '../../core/geom.js';
import { carved } from '../maya/meso.js';
import { inst } from './street.js';

/** The brazier: a basalt bowl on a stepped foot, glowing coals, a heap of copal and the ash; 1.0 m. */
const brazier = () => carved('mx-tlexictli', (k) => {
  k.geo('stucco_pale', lathe([[0.001, 0], [0.42, 0], [0.42, 0.12], [0.001, 0.12]], 12));
  k.geo('basalt', lathe([[0.2, 0.12], [0.14, 0.3], [0.16, 0.62], [0.42, 0.78], [0.46, 0.98], [0.36, 0.98], [0.001, 0.86]], 12));
  k.geo('flame', lathe([[0.3, 0.92], [0.001, 1.05]], 9));
  k.geo('plaster_grey', lathe([[0.34, 0.9], [0.001, 0.93]], 9));
});
/** A heap of marigolds and a ball or two of copal on a leaf. */
const flowers = (mat) => carved('mx-flowers:' + mat, (k) => {
  k.geo('lotus_leaf', lathe([[0.001, 0], [0.34, 0.01], [0.3, 0.03], [0.001, 0.025]], 9));
  k.geo(mat, lathe([[0.28, 0.01], [0.22, 0.07], [0.12, 0.13], [0.001, 0.16]], 9));
  k.geo('stucco_pale', lathe([[0.001, 0.0], [0.07, 0.03], [0.06, 0.1], [0.001, 0.11]], 7).translate(0.36, 0.02, 0.1));
});
/** A bundle of bark-paper strips tied with fibre, standing against a block, and a bundle of fuel sticks. */
const paper = () => carved('mx-paper', (k) => {
  k.bx('cloth_white', -0.16, 0.16, 0, 0.55, -0.1, 0.1); k.bx('rope_fibre', -0.17, 0.17, 0.2, 0.24, -0.11, 0.11); k.bx('cloth_red', -0.1, 0.1, 0.55, 0.62, -0.06, 0.06);
  for (let i = 0; i < 6; i++) k.seg('timber', [0.3 + i * 0.05, 0, -0.1 + i * 0.04], [0.5 + i * 0.05, 0.12, 0.35 + i * 0.03], 0.025, 0.025);
});

export function mxDress(el, ctx) {
  const { bag, col } = ctx;
  for (const [kind, x, z, rot] of el.items) {
    if (kind === 'brazier') { inst(bag, brazier(), x, 0.03, z, rot ?? 0, 1, 90); col.circle(x, z, 0.46, 0, 1.0); }
    else if (kind === 'flowers') inst(bag, flowers('cloth_ochre'), x, 0.03, z, rot ?? 0, 1, 60);
    else if (kind === 'roses') inst(bag, flowers('cloth_red'), x, 0.03, z, rot ?? 0, 1, 60);
    else if (kind === 'paper') inst(bag, paper(), x, 0.03, z, rot ?? 0, 1, 60);
  }
}
