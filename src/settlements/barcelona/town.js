// The Eixample's blocks (docs/settlements/barcelona.md §5): every block a ring of houses round its
// court; Casa Milà's block keeps its north-west corner for the house, Casa Batlló's block a gap on
// the Passeig for it (both built with the landmark).
import { RADIUS, BLOCK, BATLLO, blocks, height } from './layout.js';
export async function town() {
  const els = blocks().filter((b) => b.special !== 'sagrada').map((b) => ({
    t: 'eixample_block', c: b.c, s: BLOCK, d: 18, ch: 12, y: height(...b.c), seed: b.seed,
    ...(b.special === 'pedrera' ? { cut: { corner: 3, a: 22, b: 22 } } : {}),
    ...(b.special === 'batllo' ? { gaps: [{ side: 1, s0: BATLLO.s0, s1: BATLLO.s1 }] } : {}),
  }));
  // in plans of a few blocks each, so that the town streams in pieces
  const plans = [];
  for (let i = 0; i < els.length; i += 6) plans.push({ id: `barcelona-eixample-${i / 6}`, style: 'modernisme', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: els.slice(i, i + 6), rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 46], facing: 'n' } });
  return plans;
}
