// The gates of the apartment compounds (docs/settlements/teotihuacan.md §16): a compound had one entrance serving many households
// [stated: sci.news, "Teotihuacan is Unique among Ancient Mesoamerican Cities"], and its fronts differ by what the household could afford and
// how near the avenue it stood. The rule (gateKind): a wealth drawn from the compound's seed and its nearness to the avenue sets the gate —
//   plain      the doorway in the blank wall under its painted lintel (the poorer and the farther);
//   porch      a flat-roofed porch of two square piers before the door, a plastered bench on either side;
//   gatehouse  a block built out from the wall, higher than it, with a vaulted-over passage through it, a red cornice and a crest of almenas.
// And the wall's finish by the seed too: ochre plaster, lime-white, or the lower metre painted red under white. [inferred: the types after the entrances
// of the excavated compounds, simplified; which household had which]
import { box } from '../../core/geom.js';
import { fig } from './street.js';

const RD = 'stucco_red', WH = 'stucco_pale', S = 'stucco_ochre';
/** The wall plaster of the finishes 0, 1, 2 (the third has the red dado, see dado()). */
export const FINISH = ['stucco_ochre', 'stucco_pale', 'stucco_ochre'];
function h01(seed, k) { let s = (Math.imul(seed ^ k, 2654435761) >>> 0); s = Math.imul(s ^ (s >>> 15), 2246822519) >>> 0; return (s >>> 0) / 4294967296; }

/** { kind, finish } of the compound with `seed` whose rect's centre is at x (its distance from the avenue's axis counts). */
export function gateKind(seed, cx) {
  const prox = Math.max(0, 1 - Math.abs(cx) / 260), wealth = 0.6 * h01(seed, 17) + 0.4 * prox;
  return { kind: wealth < 0.38 ? 'plain' : wealth < 0.66 ? 'porch' : 'gatehouse', finish: Math.floor(h01(seed, 91) * 3) };
}
/** Half the width the gate takes along the wall, for the things set out by it to keep clear of. */
export const gateHalf = (kind) => (kind === 'gatehouse' ? 5.2 : kind === 'porch' ? 4.2 : 2.2);

/** The red dado under white on every outer face but where the gate is (finish 2): `faces` as FACES in street.js, 1.2 m high. */
export function dado(ctx, rect, gate, kindHalf) {
  const { bag } = ctx, [x0, z0, x1, z1] = rect, t = 0.03, h = 1.25, gw = kindHalf, xm = (x0 + x1) / 2, zm = (z0 + z1) / 2;
  const run = (a, b, c, ax, out) => {            // along ax from a to b at the wall's outer face c, standing out `out` (+1 | −1)
    const lo = c + (out > 0 ? 0 : -t), hi = c + (out > 0 ? t : 0);
    bag.add(RD, ax === 'x' ? box(a, 0.15, lo, b, h, hi) : box(lo, 0.15, a, hi, h, b));
    bag.add(WH, ax === 'x' ? box(a, h, lo, b, h + 0.07, hi) : box(lo, h, a, hi, h + 0.07, b));
  };
  const parts = (i, a0, a1, mid) => (i === gate ? [[a0, mid - gw], [mid + gw, a1]] : [[a0, a1]]);
  for (const [a, b] of parts(0, x0 + 0.1, x1 - 0.1, xm)) run(a, b, z0, 'x', -1);
  for (const [a, b] of parts(1, x0 + 0.1, x1 - 0.1, xm)) run(a, b, z1, 'x', 1);
  for (const [a, b] of parts(2, z0 + 0.1, z1 - 0.1, zm)) run(a, b, x0, 'z', -1);
  for (const [a, b] of parts(3, z0 + 0.1, z1 - 0.1, zm)) run(a, b, x1, 'z', 1);
}

/** Build the porch or the gatehouse on face `gate` (0 north, 1 south, 2 west, 3 east) of `rect`; the door's middle at mid. */
export function gateFront(ctx, rect, gate, kind, seed, simple = false) {
  if (kind === 'plain') return;
  const { bag, col } = ctx, [x0, z0, x1, z1] = rect, [nx, nz] = [[0, -1], [0, 1], [-1, 0], [1, 0]][gate], ax = gate < 2 ? 'x' : 'z';
  const c = [z0, z1, x0, x1][gate], mid = ax === 'x' ? (x0 + x1) / 2 : (z0 + z1) / 2;
  // a box in the gate's frame: u across (from the door's middle), d out from the wall's face
  const B = (mat, u0, u1, d0, d1, y0, y1) => {
    const p = ax === 'x' ? [mid + u0, c + nz * d0, mid + u1, c + nz * d1] : [c + nx * d0, mid + u0, c + nx * d1, mid + u1];
    const lo = [Math.min(p[0], p[2]), Math.min(p[1], p[3])], hi = [Math.max(p[0], p[2]), Math.max(p[1], p[3])];
    bag.add(mat, box(lo[0], y0, lo[1], hi[0], y1, hi[1])); return [lo[0], lo[1], hi[0], hi[1]];
  };
  const Pt = (u, d) => (ax === 'x' ? [mid + u, c + nz * d] : [c + nx * d, mid + u]);
  const yawF = Math.atan2(-nx, -nz);
  if (kind === 'porch') {
    B(WH, -3.2, 3.2, 0.5, 2.6, 0, 0.04);                                                    // the plastered floor
    for (const s of [-1, 1]) {                                                              // the piers, a red foot on each
      const r = B(S, s * 3.0 - 0.25, s * 3.0 + 0.25, 2.1, 2.6, 0.5, 2.95); B(RD, s * 3.0 - 0.28, s * 3.0 + 0.28, 2.07, 2.63, 0, 0.5); col.rect(r, 0, 3.2);
      const r2 = B(S, s * 1.55, s * 2.85, 0.55, 1.1, 0, 0.5); B(RD, s * 1.55, s * 2.85, 0.55, 1.1, 0.5, 0.56); col.rect(r2, 0, 0.56);                // the bench
    }
    B(S, -3.4, 3.4, 0, 2.7, 2.95, 3.18);                                                    // the roof
    B(RD, -3.45, 3.45, 2.62, 2.78, 2.62, 3.22);                                             // the red fascia
    for (let i = 0; i < 6; i++) { const u = -2.75 + i * 1.1; B(S, u - 0.26, u + 0.26, 2.52, 2.68, 3.22, 3.7); B(RD, u - 0.13, u + 0.13, 2.5, 2.7, 3.45, 3.62); }   // the almenas
    // someone on the bench by chance
    const q = h01(seed, 5);
    if (q < 0.5 && !simple) { const [px, pz] = Pt((q < 0.25 ? -1 : 1) * 2.2, 0.8); fig(ctx, { who: q < 0.12 || q > 0.4 ? 'elder' : 'man', at: [px, pz], y: 0, rot: yawF, seed: seed + 3, pose: 'sit' }); }
    return;
  }
  // the gatehouse: two blocks and a lintel with the passage between, a cornice and the crest
  const pw = 0.9, W = 3.7, D = 3.2, top = 3.6;
  const a = B(S, -W, -pw, 0, D, 0, top), b = B(S, pw, W, 0, D, 0, top); col.rect(a, 0, top + 0.4); col.rect(b, 0, top + 0.4);
  B(S, -pw, pw, 0, D, 2.85, top);                                                          // the lintel over the passage
  B(RD, -W - 0.06, W + 0.06, -0.0, D + 0.06, top, top + 0.35);                               // the red cornice
  B(WH, -W - 0.06, W + 0.06, -0.0, D + 0.06, top + 0.35, top + 0.4);                          // its white cap
  for (const s of [-1, 1]) { const u0 = s > 0 ? pw - 0.03 : -pw, u1 = s > 0 ? pw : -pw + 0.03; B(RD, u0, u1, 0, D, 0.12, 1.15); B(WH, u0, u1, 0, D, 1.15, 1.2); }   // the red dado of the passage
  B('andesite', -pw, pw, 0, 0.7, 0, 0.12);                                                 // the threshold stone
  // the crest of almenas along the front and the two sides (the door's side open to the wall)
  const am = (u, d, alongX) => { const w = 0.26, e = 0.1; B(S, alongX ? u - w : u - e, alongX ? u + w : u + e, alongX ? d - e : d - w, alongX ? d + e : d + w, top + 0.4, top + 0.95); B(RD, alongX ? u - 0.13 : u - 0.12, alongX ? u + 0.13 : u + 0.12, alongX ? d - 0.12 : d - 0.13, alongX ? d + 0.12 : d + 0.13, top + 0.62, top + 0.82); };
  for (let i = 0; i < 6; i++) am(-W + 0.6 + i * (2 * W - 1.2) / 5, D - 0.15, true);
  for (const s of [-1, 1]) for (let i = 0; i < 2; i++) am(s * (W - 0.15), 0.9 + i * 1.3, false);
  // the front painted in a red band with the stepped frets in white along it
  B(RD, -W + 0.4, W - 0.4, D, D + 0.04, 3.0, 3.45);
  for (let i = 0; i < 6; i++) { const u = -3.0 + i * 1.2; B(WH, u - 0.36, u + 0.36, D + 0.04, D + 0.06, 3.07, 3.12); B(WH, u - 0.36, u + 0.36, D + 0.04, D + 0.06, 3.33, 3.38); B(WH, u - 0.36, u - 0.28, D + 0.04, D + 0.06, 3.12, 3.33); B(WH, u + 0.28, u + 0.36, D + 0.04, D + 0.06, 3.12, 3.33); B(WH, u - 0.12, u + 0.12, D + 0.04, D + 0.06, 3.2, 3.26); }
}
