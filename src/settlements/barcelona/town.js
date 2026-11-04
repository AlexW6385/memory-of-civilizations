// The Eixample's blocks (docs/settlements/barcelona.md §5).
import { RADIUS, BLOCK, blocks, height } from './layout.js';
export async function town() {
  const els = blocks().filter((b) => !b.special).map((b) => ({ t: 'eixample_block', c: b.c, s: BLOCK, d: 18, ch: 12, h: 19.2, y: height(...b.c), seed: b.seed, simple: true }));
  return [{ id: 'barcelona-eixample', style: 'modernisme', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: els, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 46], facing: 'n' } }];
}
