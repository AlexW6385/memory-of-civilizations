// The enthroned ruler of the roof combs of Temples I and II in stucco relief, as modelled volumes (docs/settlements/maya-tikal.md §15): crossed
// legs, torso in his cloak with the jade pectoral, arms, head with ear flares and the tall headdress of mask and plumes. Reduced detail: the comb
// is 40 m up. The bench stays boxes (comb.js). Figure frame: x right, y up, w out of the niche; s = scale.

import { Sculpt, blob, tube } from '../nabataean/sculpt.js';

export function sculptKing(bag, F, ub, c, nBot, s) {
  const P = (x, y, w) => { const p = F.P(ub - w * s, c + x * s); return [p[0], nBot + y * s, p[1]]; };
  const mk = () => new Sculpt(([x, y, w]) => P(x, y, w)), S = { r: mk(), o: mk(), b: mk(), j: mk(), l: mk(), c: mk() };
  const bl = (m, cc, r) => blob(S[m], cc, r, 3, 6), tb = (m, pts) => tube(S[m], pts, { seg: 6, sub: 1, capN: 1 });
  bl('r', [0, 1.02, 0.33], [0.55, 0.17, 0.27]);                                           // crossed legs
  for (const sg of [-1, 1]) bl('o', [sg * 0.44, 1.02, 0.4], [0.15, 0.13, 0.14]);          // bare knees
  bl('r', [0, 1.62, 0.28], [0.42, 0.5, 0.24]);                                            // the torso in his cloak
  bl('j', [0, 1.74, 0.5], [0.28, 0.2, 0.04]);                                             // the pectoral
  for (const sg of [-1, 1]) tb('o', [[sg * 0.46, 1.95, 0.28, 0.1], [sg * 0.58, 1.55, 0.34, 0.09], [sg * 0.3, 1.38, 0.5, 0.09]]);   // the arms, the hands on the knees
  bl('o', [0, 2.36, 0.3], [0.24, 0.28, 0.23]);                                            // the head
  bl('o', [0, 2.3, 0.5], [0.07, 0.1, 0.1]);                                               // the nose
  for (const sg of [-1, 1]) bl('b', [sg * 0.28, 2.34, 0.3], [0.08, 0.12, 0.05]);          // the ear flares
  bl('c', [0, 2.86, 0.3], [0.5, 0.25, 0.2]);                                              // the headdress' band
  bl('r', [0, 3.35, 0.3], [0.42, 0.3, 0.2]);                                              // the mask on it
  for (let i = -3; i <= 3; i++) tb(i % 2 ? 'l' : 'b', [[i * 0.12, 3.5, 0.26, 0.07], [i * 0.24, 4.0 - Math.abs(i) * 0.05, 0.28, 0.07], [i * 0.3, 4.3 - Math.abs(i) * 0.1, 0.28, 0.06]]);   // the plumes
  for (const sg of [-1, 1]) tb('l', [[sg * 0.55, 3.0, 0.22, 0.09], [sg * 0.8, 2.3, 0.26, 0.09], [sg * 0.85, 1.7, 0.26, 0.08]]);   // the long side plumes
  const M = { r: 'stucco_red', o: 'stucco_ochre', b: 'maya_blue', j: 'inlay_jade', l: 'stucco_leaf', c: 'limestone_carved' };
  for (const k in S) if (S[k].pos.length) bag.add(M[k], S[k].geometry());
}
