// The great stucco masks of the stairs (docs/settlements/maya-tikal.md §15): the long-nosed god as modelled sculpture, not plates: a
// brow that rolls over deep eye sockets with their eyeballs, cheeks, the long curled nose, an upper lip over a fanged mouth, ear
// flares of round spools, a headband with a jewel; painted red and cream, with blue sockets and jade. Built from volumes with smooth
// normals (src/styles/nabataean/sculpt.js), each material one geometry. el.lod: 'full' (rounder, with teeth and pupils), 'mid', 'far'.

import { box } from '../../core/geom.js';
import { Sculpt, blob, tube, torus } from '../nabataean/sculpt.js';
import { frame, RED } from './kit.js';
import { gather } from './carve.js';

const CRM = 'limestone_carved', BLU = 'maya_blue', JAD = 'inlay_jade';

/** k_mask { c, face, y, s, lod }: the mask on a stair's flank, its panel's front 0.45 m proud of the wall. */
export function mask(el, { bag: out }) {
  const bag = gather(out), lod = el.lod ?? 'mid', F = frame(el.face, ...el.c), y = el.y ?? 0, s = el.s ?? 1, hi = lod === 'full';
  const B = (m, u0, u1, v0, v1, ya, yb) => { const r = F.R(u0 * s, u1 * s, v0 * s, v1 * s); bag.add(m, box(r[0], y + ya * s, r[1], r[2], y + yb * s, r[3])); };
  B(RED, -0.45, 0.2, -1.3, 1.3, 0, 2.5);                                                               // the panel
  B(CRM, -0.5, 0.2, -1.4, -1.25, 0, 2.6); B(CRM, -0.5, 0.2, 1.25, 1.4, 0, 2.6); B(CRM, -0.5, 0.2, -1.4, 1.4, 2.5, 2.65); B(CRM, -0.5, 0.2, -1.4, 1.4, 0, 0.12);   // its frame
  const seg = hi ? 8 : 5, nlat = hi ? 4 : 3, nlon = hi ? 8 : 5, sb = hi ? 2 : 1;
  const P = (x, yy, w) => { const p = F.P(-(0.45 + w) * s, x * s); return [p[0], y + yy * s, p[1]]; };           // figure (x right on the wall, y, w out of the panel) → world
  const mk = () => new Sculpt(([x, yy, w]) => P(x, yy, w));
  const S = { r: mk(), c: mk(), b: mk(), j: mk() };
  const bl = (m, c, r) => blob(S[m], c, r, nlat, nlon);
  const tb = (m, pts, o = {}) => tube(S[m], pts, { seg, sub: sb, capN: 1, ...o });
  for (const sg of [-1, 1]) {
    // the brow: a heavy roll over the eye with the scroll curling up at its outer end
    tb('c', [[sg * 0.12, 1.88, 0.2, 0.15, 0.12], [sg * 0.55, 1.98, 0.24, 0.16, 0.13], [sg * 0.98, 1.94, 0.2, 0.14, 0.12], [sg * 1.14, 2.14, 0.15, 0.11, 0.1], [sg * 1.02, 2.3, 0.12, 0.08, 0.08]]);
    // the eye: a blue socket sunk under the brow, the white eyeball and its pupil
    bl('b', [sg * 0.62, 1.4, 0.1], [0.38, 0.27, 0.12]);
    bl('c', [sg * 0.62, 1.4, 0.16], [0.27, 0.2, 0.12]);
    if (hi) { bl('r', [sg * 0.62, 1.4, 0.26], [0.1, 0.1, 0.06]); bl('j', [sg * 0.62, 1.4, 0.3], [0.045, 0.045, 0.03]); }
    // the cheek, full, and the cheek's line
    bl('r', [sg * 0.72, 0.94, 0.16], [0.46, 0.34, 0.2]);
    // the ear flare: a round spool on a post, a jade bead in its middle
    torus(S.c, [sg * 1.18, 0.92, 0.12], [1, 0, 0], [0, 1, 0], 0.26, 0.07, { seg: hi ? 14 : 8, sec: hi ? 5 : 4 });
    bl('j', [sg * 1.18, 0.92, 0.17], [0.14, 0.14, 0.07]);
    bl('b', [sg * 1.18, 0.92, 0.1], [0.19, 0.19, 0.05]);
    // the corner fangs, curving down from the mouth
    tb('c', [[sg * 0.55, 0.62, 0.3, 0.08], [sg * 0.62, 0.4, 0.34, 0.075], [sg * 0.56, 0.2, 0.32, 0.05]]);
  }
  // the long curled nose: down from the bridge, out, and up in a curl with the nostrils
  tb('c', [[0, 1.55, 0.18, 0.18, 0.15], [0, 1.22, 0.4, 0.2, 0.17], [0, 0.88, 0.62, 0.2, 0.17], [0, 0.6, 0.6, 0.18, 0.16], [0, 0.45, 0.42, 0.14, 0.13]]);
  bl('c', [0, 0.55, 0.68], [0.28, 0.14, 0.15]);
  for (const sg of [-1, 1]) bl('r', [sg * 0.15, 0.52, 0.8], [0.07, 0.05, 0.04]);                  // the nostrils
  // the upper lip, the mouth and the lower lip
  tb('r', [[-0.7, 0.5, 0.26, 0.1, 0.09], [-0.3, 0.46, 0.38, 0.11, 0.09], [0.3, 0.46, 0.38, 0.11, 0.09], [0.7, 0.5, 0.26, 0.1, 0.09]]);
  bl('b', [0, 0.32, 0.16], [0.6, 0.12, 0.08]);
  tb('r', [[-0.56, 0.2, 0.22, 0.09, 0.08], [-0.2, 0.13, 0.3, 0.1, 0.08], [0.2, 0.13, 0.3, 0.1, 0.08], [0.56, 0.2, 0.22, 0.09, 0.08]]);
  if (hi) for (let i = 0; i < 6; i++) bl('c', [-0.4 + i * 0.16, 0.34, 0.27], [0.065, 0.1, 0.05]);   // the teeth
  // the headband across the brow with the trefoil jewel
  tb('b', [[-1.12, 2.2, 0.1, 0.12, 0.09], [-0.5, 2.28, 0.14, 0.12, 0.09], [0.5, 2.28, 0.14, 0.12, 0.09], [1.12, 2.2, 0.1, 0.12, 0.09]]);
  bl('j', [0, 2.24, 0.26], [0.17, 0.17, 0.09]);
  if (hi) for (const sg of [-1, 1]) bl('r', [sg * 0.23, 2.26, 0.22], [0.09, 0.09, 0.06]);
  // the flames of the forehead
  for (let i = -2; i <= 2; i++) bl('r', [i * 0.28, 2.42 - Math.abs(i) * 0.03, 0.1], [0.11, 0.09, 0.07]);
  const M = { r: RED, c: CRM, b: BLU, j: JAD };
  for (const k in S) if (S[k].pos.length) out.add(M[k], S[k].geometry());
  bag.flush();
}
