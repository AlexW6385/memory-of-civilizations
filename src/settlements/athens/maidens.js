// The porch of the maidens of the Erechtheion, with the korai rebuilt (docs/settlements/athens.md §4g): each a woman
// in the peplos with the cloth falling in deep columnar folds on her weight-bearing leg, the free knee forward, the
// overfold with its belt, her braided hair in a thick rope down her back, and on her head the capital — the echinus
// carved with egg-and-dart over a bead-and-reel, a square abacus. The porch (parapet, architrave of three fasciae, rosettes,
// dentils, cornice) is the greek style's `caryatid_porch` built with no figures in it.
import { STYLES } from '../../core/build.js';
import { box, lathe } from '../../core/geom.js';
import '../../styles/greek/index.js';
import { peplosFigure, placeFigure } from '../../buildings/parthenon/figures.js';
import { merge } from '../../styles/greek/columns.js';

const MAT = { cloth: 'marble_smooth', skin: 'marble_smooth', hair: 'marble_smooth', trim: 'marble_smooth', dark: 'marble_dark', metal: 'marble_smooth' };

/** The capital on a maiden's head: an echinus with egg-and-dart over a bead-and-reel, a square abacus. */
function capital(bag, x, y, z, ch) {
  // the egg-and-dart: eggs as swellings of the echinus (a mod of the radius), 16 round, then the cushion's straight upper edge
  bag.push(lathe([[0.17, 0], [0.175, ch * 0.08], [0.2, ch * 0.2], [0.245, ch * 0.4], [0.268, ch * 0.54], [0.272, ch * 0.64], [0.001, ch * 0.65]], 48, (th, i) => (i >= 2 && i <= 5 ? 1 + 0.045 * Math.max(0, Math.cos(th * 16)) : 1), x, y + ch * 0.12, z));
  // the bead-and-reel round the neck of the capital: beads and discs alternating
  const n = 24, R = 0.168;
  for (let k = 0; k < n; k++) {
    const a = (k / n) * Math.PI * 2, bx = x + Math.cos(a) * R, bz = z + Math.sin(a) * R;
    bag.push(lathe([[0.001, 0], [k % 2 ? 0.026 : 0.017, ch * 0.03], [k % 2 ? 0.03 : 0.018, ch * 0.07], [k % 2 ? 0.02 : 0.016, ch * 0.12], [0.001, ch * 0.13]], 6, null, bx, y, bz));
  }
  bag.push(lathe([[0.15, ch * 0.0], [0.18, ch * 0.0], [0.18, ch * 0.12], [0.15, ch * 0.12]], 16, null, x, y, z));
  bag.push(box(x - 0.31, y + ch * 0.76, z - 0.31, x + 0.31, y + ch, z + 0.31));
  // the abacus' upper moulding
  bag.push(box(x - 0.315, y + ch * 0.76, z - 0.315, x + 0.315, y + ch * 0.82, z + 0.315));
}

function athensCaryatidPorch(el, ctx) {
  const { bag, col } = ctx;
  STYLES.greek.elements.caryatid_porch({ ...el, cols: [] }, ctx);
  const py = el.y + el.parapet, fh = el.h * 0.86, ch = el.h - fh;
  const caps = [], by = {};
  for (const [x, z, mir] of el.cols) {
    // the three maidens of the west rest on the right leg, the three of the east on the left (mir = east)
    const fig = peplosFigure({ weight: mir ? 'l' : 'r', hair: 'rope', n: 14, folds: 16,
      arms: mir
        ? { l: [[0.14, 0.62, -0.005], [0.15, 0.49, 0.06]], r: [[-0.14, 0.62, 0.01], [-0.115, 0.52, 0.115]] }
        : { r: [[-0.14, 0.62, -0.005], [-0.15, 0.49, 0.06]], l: [[0.14, 0.62, 0.01], [0.115, 0.52, 0.115]] } });
    const g = placeFigure(fig, fh / 0.99, x, py, z, 0);
    for (const k of Object.keys(g)) (by[MAT[k]] ??= []).push(g[k]);
    capital(caps, x, py + fh * 0.985, z, el.h - fh * 0.985);
    col.circle(x, z, 0.28, py, py + el.h);
  }
  (by.marble_smooth ??= []).push(...caps);
  for (const m of Object.keys(by)) bag.add(m, merge(by[m]));
}
STYLES.greek.elements.athens_caryatid_porch = athensCaryatidPorch;
export default athensCaryatidPorch;
