// Giza — the ration stalls of the king's works (docs/settlements/giza.md §19): three places where the gangs drew their bread and beer, with
// their keepers, a scribe tallying, and the workers waiting. Pure data: the stalls (x, z, rot: customers stand on the frame's +v side) and the people.
import { ground } from './ground.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const face = (from, to) => Math.atan2(-(to[0] - from[0]), -(to[1] - from[1]));     // a figure faces −z when rot = 0

/** The stalls: the works' (beside the first lodgings, east of the arrival), the valley's (on the way down to the harbour), the town's (inside the gate street). */
export const STALLS = [
  { at: [252, -66], rot: Math.PI / 2, seed: 1, name: 'works' },
  { at: [336, 16], rot: Math.PI, seed: 2, name: 'valley' },
  { at: [17, 165], rot: Math.PI / 2, seed: 3, name: 'town' },
];
const pt = (S, u, v) => { const c = Math.cos(S.rot), s = Math.sin(S.rot); return [S.at[0] + c * u - s * v, S.at[1] + s * u + c * v]; };
for (const S of STALLS) S.y = ground.height(S.at[0], S.at[1]);

/** The keepers and the waiting: figures of a `life` plan. */
export function rationLife() {
  const rand = rng(2591), L = [];
  const fig = (S, u, v, toward, o) => { const p = pt(S, u, v), q = pt(S, toward[0], toward[1]); L.push({ t: 'figure', at: p, y: ground.height(p[0], p[1]), rot: face(p, q), seed: Math.floor(rand() * 1e9), dress: 'wrap', top: 'bare', cloth: 'cloth_white', skin: 'skin_medium', hat: 'none', hair: 'short', hairMat: 'hair_dark', feet: 'bare', carry: 'none', pose: 'stand', ...o }); };
  for (const S of STALLS) {
    fig(S, -0.35, -0.66, [-0.35, 1], { over: 'sash', pose: 'talk', hair: 'shaven' });                 // the keeper, behind the counter, handing over a loaf
    fig(S, 1.19, -0.785, [1.19, 0], { over: 'sash', pose: 'sit' });                                     // the scribe on his stool, tallying
    fig(S, -0.6, 1.25, [-0.6, 0], { carry: 'basket' });
    fig(S, 0.9, 1.4, [0.9, 0], { carry: 'pot', dress: 'wrap' });
    if (S.seed !== 2) fig(S, 0.1, 2.3, [0.1, 0], { pose: 'stand', carry: 'basket' });
  }
  return L;
}
