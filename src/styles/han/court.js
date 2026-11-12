// The Weiyang forecourt's furniture (docs/settlements/han-changan.md §5b): along the paved axis the bronze ding in pairs, the drums on their posts,
// banners, lamp trees and steles; the stone-and-timber waiting sheds under the corridors; the chariot park of the west and east courts.
import { box } from '../../core/geom.js';
import { ding, drumPost, banner, lampTree, stele, chariot, rngOf, qbox } from './props.js';

/** han_court: { ax, z0, z1 (the paved axis from the ramp's foot z0 to the gate z1, z0 < z1), seed } */
export function court(el, ctx) {
  const { bag, col } = ctx, ax = el.ax, rand = rngOf(el.seed ?? 5);
  const solid = (x, z, r, h) => col.circle(x, z, r, 0, h);
  // at the ramp's foot: a pair of ding and a pair of drums; lamp trees and steles down the axis
  for (const s of [-1, 1]) {
    ding(bag, ax + s * 9, 0.03, el.z0 + 6, 1.1); solid(ax + s * 9, el.z0 + 6, 0.7, 1.4);
    drumPost(bag, ax + s * 14, 0.03, el.z0 + 9, 0, 1); solid(ax + s * 14, el.z0 + 9, 0.8, 1.2);
    for (let z = el.z0 + 18; z < el.z1 - 6; z += 14) {
      lampTree(bag, ax + s * 7.5, 0.03, z); solid(ax + s * 7.5, z, 0.25, 1.8);
      banner(bag, ax + s * 11, 0.03, z + 7, 6.4, ((z / 14) | 0) % 2 ? 'cloth_red' : 'cloth_black', 0, 1.1); solid(ax + s * 11, z + 7, 0.12, 6);
    }
    for (const z of [el.z0 + 34, el.z0 + 72]) { stele(bag, ax + s * 20, 0.03, z, 0); solid(ax + s * 20, z, 0.6, 2.2); }
    // a low stone curb along each side of the paved way
    bag.add('bluestone', box(ax + s * 6.3 - 0.15, 0, el.z0 + 14, ax + s * 6.3 + 0.15, 0.22, el.z1 - 2));
  }
  // the waiting sheds (lushe) for the officials at court: open-fronted roofed benches under the corridors' inner side
  for (const s of [-1, 1]) {
    const x = ax + s * 77.2;
    for (let z = el.z0 + 12; z < el.z1 - 30; z += 24) {
      qbox(bag, 'wood_dark', x, z, 0, -0.2, 0.0, 0, 0.2, 0.45, 4); qbox(bag, 'reed_mat', x, z, 0, -0.2, 0.45, 0.2, 0.2, 0.48, 3.8);
    }
  }
  // the chariot park: rows of carriages, poles toward the axis, in the two courts
  for (const s of [-1, 1]) {
    for (let i = 0; i < 6; i++) for (let j = 0; j < 2; j++) {
      const x = ax + s * (30 + i * 6.5) + (rand() - 0.5) * 0.6, z = el.z1 - 64 - j * 7, yaw = s < 0 ? 0 : Math.PI;
      chariot(bag, x, 0, z, yaw + (rand() - 0.5) * 0.12, (i + j) % 2 === 0, (i + j) % 3 ? 'lacquer_black' : 'lacquer_red');
      col.rect([x - 1.1, z - 1.1, x + 1.1, z + 1.1], 0, 1.1);
    }
  }
}
