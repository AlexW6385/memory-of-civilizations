// The eye-level dressing of a canal house's front about 1670 (docs/settlements/amsterdam.md §5.14): the shop
// whose lower shutter folds down as the counter and whose upper one is propped as an awning (Vermeer's *Little
// Street*, De Hooch), its wares and its hanging board sign; the cellar hatch (kelderluik) in the pavement;
// a bay tree in a tub by the stoop; a bench against the wall; the damp rising in the brick at the foot.

import { box, lathe } from '../../core/geom.js';
import { fbox, sideprism, ngon } from './facade.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const TRADES = [
  { name: 'baker', board: 'wood_ochre', dev: 'pretzel' },
  { name: 'draper', board: 'cloth_red', dev: 'ell' },
  { name: 'grocer', board: 'cloth_green', dev: 'cheese' },
  { name: 'apothecary', board: 'cloth_white', dev: 'mortar' },
];

/** frontDress(bag, F, y, o): o = { w, base, bays, bw, door (the door's bay), warehouse, open, seed }. */
export function frontDress(bag, F, y, o) {
  if (o.warehouse) return;
  const r = rng(o.seed * 17 + 3), A = (m, ...q) => bag.add(m, fbox(F, y, ...q)), S = (m, pts, u0, u1) => bag.add(m, sideprism(F, y, pts, u0, u1));
  const L = (m, prof, u, v, d, seg = 10) => { const [x, z] = F.at(u, d); bag.add(m, lathe(prof, seg, null, x, y + v, z)); };
  const free = []; for (let i = 0; i < o.bays; i++) if (i !== o.door) free.push(i);
  // the damp rising in the brick at the foot of the front, and a soot-dark streak under a sill here and there
  if (r() < 0.7) A('plaster_damp', 0.0, o.w, o.base - 0.02, o.base + 0.45, 0, 0.012);
  const shopBay = !o.open && r() < 0.3 ? free[Math.floor(r() * free.length)] : -1;
  if (shopBay >= 0) {
    const t = TRADES[Math.floor(r() * TRADES.length)], u = (shopBay + 0.5) * o.bw, hw = 0.62, cv = o.base + 0.42;
    // the lower shutter folded down to the horizontal as the counter, on two brackets; its apron
    A('wood_dark', u - hw, u + hw, cv, cv + 0.05, 0, 0.62);
    for (const s of [-1, 1]) S('wood_dark', [[0.02, cv - 0.38], [0.5, cv], [0.02, cv]], u + s * (hw - 0.08) - 0.025, u + s * (hw - 0.08) + 0.025);
    // the upper shutter propped open as an awning on two poles
    S('wood_dark', [[0, cv + 2.0], [1.0, cv + 1.62], [1.0, cv + 1.68], [0, cv + 2.06]], u - hw, u + hw);
    for (const s of [-1, 1]) A('wood_dark', u + s * (hw - 0.04) - 0.02, u + s * (hw - 0.04) + 0.02, cv + 0.05, cv + 1.64, 0.96, 1.0);
    A('iron', u - hw, u + hw, cv + 1.62, cv + 1.64, 0.99, 1.01);
    // the wares
    if (t.name === 'baker') for (let k = 0; k < 6; k++) L('hide_tan', [[0.001, 0], [0.1, 0.02], [0.12, 0.07], [0.07, 0.12], [0.001, 0.13]], u - 0.45 + k * 0.18, cv + 0.05, 0.2 + (k % 2) * 0.2, 8);
    else if (t.name === 'draper') for (let k = 0; k < 5; k++) A(['cloth_red', 'cloth_indigo', 'cloth_white', 'cloth_ochre', 'cloth_green'][k], u - hw + 0.04 + k * 0.23, u - hw + 0.24 + k * 0.23, cv + 0.05, cv + 0.17 + (k % 2) * 0.1, 0.1, 0.5);
    else if (t.name === 'grocer') for (let k = 0; k < 4; k++) for (let q = 0; q <= k % 2; q++) L('paint_ochre', [[0.001, 0], [0.17, 0], [0.18, 0.06], [0.16, 0.12], [0.001, 0.12]], u - 0.4 + k * 0.27, cv + 0.05 + q * 0.12, 0.3, 12);
    else for (let k = 0; k < 5; k++) L(k & 1 ? 'glaze_blue' : 'glaze_white', [[0.001, 0], [0.06, 0], [0.07, 0.1], [0.04, 0.16], [0.05, 0.2], [0.001, 0.2]], u - 0.45 + k * 0.22, cv + 0.05, 0.25 + (k % 2) * 0.12, 8);
    // the hanging board on its iron bracket out of the pier beside the window: edge-on to the wall, its device in gilt
    const pu = u + o.bw / 2 < o.w - 0.25 ? u + o.bw / 2 : u - o.bw / 2, sv = cv + 2.55;
    S('iron', [[0, sv], [1.15, sv], [1.15, sv + 0.04], [0, sv + 0.04]], pu - 0.02, pu + 0.02);
    S('iron', [[0.05, sv - 0.5], [0.7, sv + 0.02], [0.05, sv - 0.46]].slice(0, 3), pu - 0.015, pu + 0.015);
    S(t.board, [[0.45, sv - 0.75], [1.05, sv - 0.75], [1.05, sv - 0.1], [0.45, sv - 0.1]], pu - 0.03, pu + 0.03);
    for (const [dd, vv] of [[0.5, sv], [1.0, sv]]) A('iron', pu - 0.004, pu + 0.004, sv - 0.1, sv, dd - 0.004, dd + 0.004);
    S('gilt_bronze', ngon(0.75, sv - 0.42, t.dev === 'pretzel' ? 0.2 : 0.17, 8), pu - 0.045, pu + 0.045);
    if (t.dev === 'pretzel') S(t.board, ngon(0.75, sv - 0.42, 0.08, 8), pu - 0.05, pu + 0.05);
  }
  // the cellar hatch before a basement window: two slanting leaves with iron straps
  if (r() < 0.4) {
    const cand = free.filter((i) => i !== shopBay);
    if (cand.length) {
      const u = (cand[Math.floor(r() * cand.length)] + 0.5) * o.bw;
      for (const s of [-1, 1]) {
        const a = s < 0 ? u - 0.46 : u + 0.02, b = a + 0.44;
        S('wood_dark', [[0.12, 0.52], [1.1, 0.0], [1.1, 0.07], [0.12, 0.59]], a, b);
        for (const dd of [0.45, 0.8]) S('iron', [[dd, 0.52 * (1.1 - dd) / 0.98 + 0.07], [dd + 0.04, 0.52 * (1.1 - dd - 0.04) / 0.98 + 0.07], [dd + 0.04, 0.52 * (1.1 - dd - 0.04) / 0.98 + 0.085], [dd, 0.52 * (1.1 - dd) / 0.98 + 0.085]], a, b);
      }
    }
  }
  // a bay tree in a tub beside the stoop
  if (r() < 0.4 && o.door >= 0) {
    const u = (o.door + 0.5) * o.bw + (o.door === 0 ? 1.55 : -1.55);
    if (u > 0.4 && u < o.w - 0.4) {
      L('wood_dark', [[0.001, 0], [0.26, 0], [0.3, 0.3], [0.3, 0.34], [0.25, 0.34], [0.25, 0.3], [0.001, 0.3]], u, 0, 0.55, 12);
      L('bark_dark', [[0.03, 0.3], [0.03, 1.1], [0.001, 1.12]], u, 0, 0.55, 5);
      L('cloth_green', [[0.001, 0], [0.34, 0.12], [0.42, 0.4], [0.3, 0.7], [0.001, 0.78]], u, 1.0, 0.55, 10);
    }
  }
  // a bench against the front
  if (r() < 0.18 && free.length) {
    const u = (free[free.length - 1] + 0.5) * o.bw;
    A('wood_dark', u - 0.7, u + 0.7, 0.44, 0.49, 0.08, 0.52); for (const s of [-1, 1]) A('wood_dark', u + s * 0.6 - 0.04, u + s * 0.6 + 0.04, 0, 0.44, 0.12, 0.48);
  }
  void box;
}
