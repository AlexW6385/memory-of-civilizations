// Shibam c. 1700 — the sultan's palace seen from the square (docs/settlements/shibam.md §21). The palace's front is a wall 44 m wide and 18 m high of
// brown mud below and lime above; this dresses it as a palace: lime pilasters dividing it into bays and carried up through the parapet as piers with
// horns, a great portal round the door (two jamb piers, a carved cedar lintel, a stepped lime crest with dentils), a smear of lamp soot over the door and
// drifts of wind-blown dust at the feet of the piers. Everything [inferred] (forms of Hadhrami palaces and the town's own lime work, §12-§14).
// Built in lime_plaster, cedar, wood_dark and mud_plaster, which the palace's plan already holds, so it costs no draw; no collision (the pilasters
// stand 0.25 m out from the wall, the portal's jambs outside the door's 3.2 m lane). The wall leans in by K*(0.55..1.55) per metre by a hash of its
// corner (index.js `tower_house`): the pieces follow it in slices so that none floats.
import '../../styles/hadhrami/index.js';
import { box } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { topOf, K } from '../../styles/hadhrami/dims.js';

const hs = (x, z, s = 0) => { let h = Math.imul(Math.round(x * 16) + 0x9e3779b1, 0x85ebca6b) ^ Math.imul(Math.round(z * 16) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(s + 1, 0x27d4eb2f); h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15; return (h >>> 0) / 4294967296; };

/** shb_palacedress: { box (the palace's rectangle; not `rect`, which life.js reads as a house), storeys, out? } — the palace's south face. */
function palaceDress({ box: R, storeys = 6, out = 0.25 }, { bag }) {
  const [x0, z0, , z1] = R, k = K * (0.55 + 1.0 * hs(x0, z0, 1)), top = topOf(storeys), L = 'lime_plaster';
  const face = (y) => z1 - k * y;                       // the wall's face at height y (leaning north, -z, as it rises)
  // a vertical member between x a and b from y0 to y1, protruding `p` from the face, in slices of 1.5 m so that it follows the lean
  const member = (a, b, y0, y1, p, mat = L) => { for (let y = y0; y < y1 - 1e-6; y += 1.5) { const ye = Math.min(y1, y + 1.5); bag.add(mat, box(a, y, face(ye) - 0.1, b, ye, face(y) + p)); } };
  const hw = 0.3;
  // pilasters dividing the front into bays, from the plinth to the parapet, each with a base block and a cap; a pier with its horn above the parapet
  for (const x of [-18.4, -7.4, 7.4, 18.4]) {
    member(x - hw, x + hw, 0, top + 0.9, out);
    bag.add(L, box(x - hw - 0.1, 0, face(0) - 0.1, x + hw + 0.1, 0.9, face(0) + out + 0.1));
    bag.add(L, box(x - hw - 0.08, top - 0.5, face(top) - 0.1, x + hw + 0.08, top - 0.3, face(top) + out + 0.08));
    const f = face(top + 0.9) + out;
    bag.add(L, box(x - hw - 0.06, top + 0.9, f - 0.5, x + hw + 0.06, top + 1.0, f + 0.08)); bag.add(L, box(x - 0.18, top + 1.0, f - 0.4, x + 0.18, top + 1.45, f - 0.05)); bag.add(L, box(x - 0.08, top + 1.45, f - 0.3, x + 0.08, top + 1.8, f - 0.12));
  }
  // the portal: two jamb piers either side of the door's lane, a carved cedar lintel with bosses, a crest in three steps with dentils
  const pj = 6.3, po = 0.5;
  for (const s of [-1, 1]) {
    const a = s > 0 ? 2.25 : -3.05, b = a + 0.8;
    member(a, b, 0, pj, po);
    bag.add(L, box(a - 0.1, 0, face(0) - 0.1, b + 0.1, 0.7, face(0) + po + 0.1));
    for (let q = 0; q < 8; q++) bag.add('wood_dark', box(s > 0 ? a + 0.1 : b - 0.25, 0.7 + q * 0.62, face(0) + po, s > 0 ? a + 0.25 : b - 0.1, 0.85 + q * 0.62, face(0) + po + 0.06));
  }
  const fp = face(pj) + po;
  bag.add('cedar', box(-3.05, pj - 0.1, face(pj) - 0.1, 3.05, pj + 0.35, fp + 0.05));
  for (let q = -9; q <= 9; q++) bag.add('wood_dark', box(q * 0.32 - 0.07, pj + 0.0, fp + 0.05, q * 0.32 + 0.07, pj + 0.25, fp + 0.1));
  bag.add(L, box(-3.3, pj + 0.35, face(pj) - 0.1, 3.3, pj + 0.6, fp + 0.2));
  for (let q = -10; q <= 10; q++) bag.add(L, box(q * 0.3 - 0.07, pj + 0.6, fp + 0.1, q * 0.3 + 0.07, pj + 0.78, fp + 0.24));
  bag.add(L, box(-2.7, pj + 0.6, face(pj) - 0.1, 2.7, pj + 1.0, fp + 0.1)); bag.add(L, box(-2.0, pj + 1.0, face(pj) - 0.1, 2.0, pj + 1.35, fp)); bag.add(L, box(-1.2, pj + 1.35, face(pj) - 0.1, 1.2, pj + 1.7, fp - 0.1)); bag.add(L, box(-0.5, pj + 1.7, face(pj) - 0.1, 0.5, pj + 2.0, fp - 0.2));
  bag.add('wood_dark', box(-0.35, pj + 0.7, fp + 0.1, 0.35, pj + 0.9, fp + 0.14));
  // lamp soot: a tongue of dark over the door's head where the hall's lamps and the cressets' smoke reach, narrowing upward
  for (let q = 0; q < 4; q++) { const w = 1.1 - q * 0.22, y = 3.9 + q * 0.55; bag.add('wood_dark', box(-w, y, face(y) - 0.02, w, y + 0.55, face(y) + 0.012)); }
  // dust: wind-blown drifts of the wadi's sand at the feet of the piers and the jambs, a low wedge each (mud_plaster, lighter than the wall's wet foot)
  for (const x of [-18.4, -7.4, 7.4, 18.4, -2.65, 2.65]) { const d = 0.28 + 0.2 * hs(x, z1, 3), w = x === -2.65 || x === 2.65 ? 0.7 : 0.95; bag.add('mud_plaster', box(x - w, 0, face(0) + out + 0.1, x + w, 0.07, face(0) + out + 0.1 + d)); bag.add('mud_plaster', box(x - w * 0.6, 0.07, face(0) + out + 0.1, x + w * 0.6, 0.13, face(0) + out + 0.1 + d * 0.5)); }
}

let done = false;
export function registerPalace() { if (done) return; done = true; STYLES.hadhrami.elements.shb_palacedress = palaceDress; }
registerPalace();
