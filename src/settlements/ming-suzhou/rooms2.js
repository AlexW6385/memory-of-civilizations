// The rooms of the seven narrow houses added to the climbable row (docs/settlements/ming-suzhou.md §20), by use:
// the wine shop, the pawnshop, the noodle house, the embroiderer's, the potter's, the ironmonger's, and the
// fan and umbrella maker's. They stand in the same frame as rooms.js (a along the front from the door's end, b from
// the street to the back wall; the lane b 1.5–2.1 from the door to the stair's foot, and above it the way from the
// stair's top by (1.9, 3.4) to the gallery door, are kept clear). Every piece is a box or a lathe piece gathered by
// the house's builder; colliders for what one would walk into. `k` is rooms.js's kit.

const SIGNS = {
  wine: 'a shop for wine, by the jar and by the bowl',
  pawn: 'the pawnshop',
  food: 'a noodle house',
  silk: 'the embroiderer',
  pottery: 'the potter',
  iron: 'the ironmonger',
  fans: 'the fan and umbrella maker',
};
export const NEW_USES = Object.keys(SIGNS);

/** The abacus and the steelyard on the counter, kept over the counter whatever the house's width (the counter ends at cEnd). */
function counterSigns(c, cEnd) {
  const { B, y0 } = c;
  B(0.4, 0.58, 0.74, 0.72, y0 + 1.0, y0 + 1.04, 'wood_dark');
  for (let q = 0; q < 6; q++) B(0.43 + q * 0.05, 0.6, 0.445 + q * 0.05, 0.7, y0 + 1.04, y0 + 1.08, 'wood_dark');
  const a1 = Math.min(1.5, cEnd - 0.12);
  if (a1 > 0.95) { B(0.9, 0.62, a1, 0.64, y0 + 1.15, y0 + 1.17, 'iron'); B(1.0, 0.6, 1.04, 0.66, y0 + 1.0, y0 + 1.15, 'timber'); }
}

/** A big wine jar with a red cloth cap bound over its mouth, standing at (a, b). */
function wineJar(c, k, a, b, s = 2.3) {
  const { y0, lat, blk } = c;
  k.jar('pottery_dark', a, b, y0, s);
  lat('cloth_red', [[0.001, 0.36 * s - 0.01], [0.075 * s, 0.36 * s - 0.01], [0.085 * s, 0.36 * s + 0.03], [0.05 * s, 0.36 * s + 0.07], [0.001, 0.36 * s + 0.08]], 9, a, b, y0);
  lat('lacquer_chestnut', [[0.075 * s, 0.36 * s - 0.05], [0.082 * s, 0.36 * s - 0.04], [0.075 * s, 0.36 * s - 0.03]], 9, a, b, y0);
  blk(a - 0.2 * s * 0.45, b - 0.2 * s * 0.45, a + 0.2 * s * 0.45, b + 0.2 * s * 0.45, y0, y0 + 0.36 * s);
}

export function groundExtra(c, k) {
  const { B, blk, L, y0, ibB: ib, use, lay } = c;
  const il = 1.45, ir = L - 0.3, mid = (il + ir) / 2, sb0 = ib - 0.45;
  const cEnd = lay.dc - 0.6 - 0.1;
  const lampAt = (a, b) => k.lamp(a, b, y0 + 2.45);
  if (use !== 'pawn') counterSigns(c, cEnd);
  if (use !== 'pawn') k.stool(Math.min(1.7, cEnd - 0.3), 1.12, y0, 0.45, 0.15, false);

  if (use === 'wine') {
    // the jars of wine in a row along the back wall under a plank of small pots, a table with a stool for the drinker, the ladles on the counter
    wineJar(c, k, il + 0.45, ib - 0.5, 2.3); wineJar(c, k, il + 1.2, ib - 0.5, 2.3);
    B(il, ib - 0.35, ir, ib - 0.02, y0 + 1.5, y0 + 1.55, 'wood_dark');
    for (let a = il + 0.2; a < ir - 0.1; a += 0.3) k.jar(['glaze_white', 'glaze_blue', 'pottery_dark'][Math.floor(k.hash(a, 9) * 2.99)], a, ib - 0.2, y0 + 1.55, 0.8);
    k.table(mid - 0.3, 2.45, mid + 0.35, 3.0, y0, 0.74, 'lacquer_chestnut'); k.stool(mid, 3.4, y0, 0.45, 0.15); k.bowl('glaze_white', mid - 0.05, 2.7, y0 + 0.74, 1.1); k.jar('glaze_blue', mid + 0.15, 2.6, y0 + 0.74, 0.6);
    for (let q = 0; q < 3; q++) k.bowl('glaze_white', 0.5 + q * 0.28, 0.65, y0 + 1.0, 0.9);
    B(1.3, 0.6, 1.34, 0.66, y0 + 1.0, y0 + 1.3, 'bamboo_culm');                                    // the ladle (jiu zhuo): a long bamboo handle
    lampAt(mid, 2.3);
  } else if (use === 'pawn') {
    // a high counter across the room (1.4 m) with a lattice grille over it and a hatch: the customer stands in the passage, the clerk behind on a tall stool
    const x0 = il, x1 = ir, hatch = [mid - 0.3, mid + 0.3];
    for (const [a0, a1] of [[x0, hatch[0]], [hatch[1], x1]]) {
      B(a0, 2.25, a1, 2.55, y0, y0 + 1.4, 'timber'); B(a0 - 0.02, 2.22, a1 + 0.02, 2.58, y0 + 1.4, y0 + 1.46, 'wood_dark');
      B(a0, 2.3, a1, 2.35, y0 + 1.46, y0 + 2.4, 'lattice');                                         // the grille
      blk(a0, 2.25, a1, 2.55, y0, y0 + 2.4);
    }
    B(hatch[0] - 0.04, 2.3, hatch[0], 2.4, y0 + 1.46, y0 + 2.4, 'lacquer_chestnut'); B(hatch[1], 2.3, hatch[1] + 0.04, 2.4, y0 + 1.46, y0 + 2.4, 'lacquer_chestnut');
    B(hatch[0] - 0.04, 2.3, hatch[1] + 0.04, 2.4, y0 + 1.9, y0 + 2.4, 'lacquer_chestnut');          // the hatch's lintel; below it the opening to hand a pledge over
    blk(hatch[0] - 0.04, 2.25, hatch[1] + 0.04, 2.55, y0 + 1.9, y0 + 2.4);
    // behind it: the clerk's tall stool and desk with the ledger and abacus, the iron-bound strongbox, the racks of pledges, a lamp
    k.stool(mid - 1.2, 3.1, y0, 0.78, 0.17, false);
    k.table(mid - 0.2, 3.0, mid + 0.8, 3.45, y0, 0.78, 'lacquer_chestnut', false); B(mid - 0.05, 3.1, mid + 0.3, 3.35, y0 + 0.78, y0 + 0.82, 'cloth_white'); B(mid + 0.4, 3.12, mid + 0.7, 3.25, y0 + 0.78, y0 + 0.84, 'wood_dark');
    k.chest(ir - 1.0, ib - 0.65, ir - 0.1, ib - 0.1, y0, 0.7, 'wood_dark'); B(ir - 1.0, ib - 0.1, ir - 0.1, ib - 0.08, y0 + 0.25, y0 + 0.3, 'iron');
    k.shelves(il + 0.05, ir - 1.2, ib - 0.5, ib, y0, [0.5, 1.15, 1.8], 'bolts');
    for (let q = 0; q < 8; q++) { const a = il + 0.2 + q * 0.28; B(a, ib - 0.48, a + 0.2, ib - 0.1, y0 + 2.05, y0 + 2.4, ['cloth_indigo', 'cloth_brown', 'cloth_ochre', 'thatch'][q % 4]); }   // bundles tied in cloth on the top shelf
    lampAt(mid, 3.0);
    // before the counter, in the passage, a plain bench for those who wait, and the notice (a board of the rates) on the wall
    B(il + 0.2, 4.0, il + 0.35, 4.01, y0, y0, 'wood_dark');
  } else if (use === 'food') {
    // a noodle house: the stove with its great pot and a stack of steamers, the rack of noodles drying, a table with stools, firewood and the water jar
    const sa = ir - 1.05;
    c.B(sa, ib - 0.9, ir, ib - 0.1, y0, y0 + 0.85, 'brick_grey'); B(sa - 0.03, ib - 0.93, ir + 0.03, ib - 0.07, y0 + 0.85, y0 + 0.9, 'granite_grey');
    k.jar('iron', sa + 0.5, ib - 0.5, y0 + 0.9, 2.2);
    for (let q = 0; q < 3; q++) { c.lat('timber', [[0.28, 0], [0.29, 0.02], [0.29, 0.1], [0.27, 0.11]], 12, sa + 0.5, ib - 0.5, y0 + 1.7 + q * 0.11); }
    B(sa + 0.2, ib - 0.35, ir - 0.1, ib, y0 + 0.9, y0 + 2.5, 'brick_grey');
    blk(sa, ib - 0.9, ir, ib - 0.1, y0, y0 + 0.9);
    for (let q = 0; q < 6; q++) B(il + 0.1 + (q % 3) * 0.2, ib - 0.45, il + 0.25 + (q % 3) * 0.2, ib - 0.05, y0 + Math.floor(q / 3) * 0.14, y0 + Math.floor(q / 3) * 0.14 + 0.13, 'timber');   // firewood
    k.jar('pottery_dark', il + 0.75, ib - 0.3, y0, 2.1);
    B(il + 0.0, 2.5, ir - 0.1, 2.54, y0 + 1.7, y0 + 1.74, 'bamboo_culm');                              // the pole of drying noodles
    for (let a = il + 0.15; a < ir - 0.2; a += 0.07) B(a, 2.51, a + 0.025, 2.53, y0 + 1.15 + k.hash(a, 4) * 0.12, y0 + 1.7, 'cloth_white');
    k.table(il + 0.1, 2.9, il + 0.85, 3.4, y0, 0.74, 'timber'); k.stool(il + 0.5, 3.75, y0, 0.45, 0.15); k.stool(il + 1.25, 3.15, y0, 0.45, 0.15);
    k.bowl('glaze_white', il + 0.35, 3.1, y0 + 0.74, 1.3); k.bowl('glaze_white', il + 0.6, 3.2, y0 + 0.74, 1.3); B(il + 0.7, 2.98, il + 0.76, 3.04, y0 + 0.74, y0 + 0.94, 'bamboo_culm');
    lampAt(mid, 2.9);
  } else if (use === 'silk') {
    // the embroiderer's: finished panels hung on the back wall, bolts of silk below, a frame with a piece half stitched, the thread rack
    const hang = [['cloth_red', 'gilt_bronze'], ['cloth_green', 'cloth_white'], ['cloth_indigo', 'gilt_bronze']];
    const pw = (ir - il - 0.2) / 3;
    hang.forEach(([ground, thread], q) => {
      const a = il + 0.1 + q * pw;
      B(a + 0.04, ib - 0.03, a + pw - 0.04, ib - 0.01, y0 + 1.1, y0 + 2.15, ground); B(a + 0.02, ib - 0.04, a + pw - 0.02, ib - 0.03, y0 + 2.15, y0 + 2.19, 'lacquer_chestnut'); B(a + 0.02, ib - 0.04, a + pw - 0.02, ib - 0.03, y0 + 1.06, y0 + 1.1, 'lacquer_chestnut');
      const ca = a + pw / 2;
      B(ca - 0.12, ib - 0.045, ca + 0.12, ib - 0.03, y0 + 1.45, y0 + 1.75, thread);                          // the motif: a flower, a bird, a medallion (blocks of thread)
      B(ca - 0.04, ib - 0.045, ca + 0.04, ib - 0.03, y0 + 1.75, y0 + 1.95, 'cloth_green');
      B(ca - 0.2, ib - 0.045, ca - 0.1, ib - 0.03, y0 + 1.3, y0 + 1.4, thread);
    });
    k.shelves(il, ir, ib - 0.45, ib, y0, [0.45, 0.8], 'bolts');
    // the embroidery frame (xiu beng): a stretched cloth in a rectangular frame on a stand, a stool before it
    const fa = mid, fb = 3.15;
    for (const s of [-1, 1]) B(fa + s * 0.34 - 0.03, fb - 0.04, fa + s * 0.34 + 0.03, fb + 0.04, y0, y0 + 1.05, 'lacquer_chestnut');
    B(fa - 0.4, fb - 0.04, fa + 0.4, fb + 0.04, y0 + 0.62, y0 + 0.68, 'lacquer_chestnut'); B(fa - 0.4, fb - 0.04, fa + 0.4, fb + 0.04, y0 + 1.0, y0 + 1.06, 'lacquer_chestnut');
    B(fa - 0.33, fb - 0.015, fa + 0.33, fb + 0.015, y0 + 0.68, y0 + 1.0, 'cloth_red'); B(fa - 0.2, fb - 0.02, fa + 0.0, fb + 0.02, y0 + 0.74, y0 + 0.9, 'cloth_green'); B(fa + 0.05, fb - 0.02, fa + 0.22, fb + 0.02, y0 + 0.78, y0 + 0.86, 'gilt_bronze');
    blk(fa - 0.4, fb - 0.06, fa + 0.4, fb + 0.06, y0, y0 + 1.06);
    k.stool(fa, fb + 0.55, y0, 0.4, 0.15, false);
    B(il + 0.05, 2.6, il + 0.1, 3.4, y0 + 1.5, y0 + 1.55, 'bamboo_culm');                                    // the thread rack: a pole with hanks
    for (let q = 0; q < 6; q++) B(il + 0.03, 2.65 + q * 0.12, il + 0.12, 2.7 + q * 0.12, y0 + 1.0 + k.hash(q, 5) * 0.15, y0 + 1.5, ['cloth_red', 'cloth_green', 'cloth_ochre', 'cloth_indigo', 'cloth_white', 'cloth_red'][q]);
    lampAt(mid, 2.4);
  } else if (use === 'pottery') {
    // the potter's: bowls and jars on the shelves, glazed jars on the floor, a crate of straw
    k.shelves(il, ir, sb0, ib, y0, [0.5, 1.15, 1.8], 'jars');
    for (const [a, b, r] of [[il + 0.35, 3.35, 2.4], [il + 1.0, 3.5, 2.0], [ir - 0.3, 3.3, 1.8]]) { k.jar(['glaze_blue', 'glaze_green', 'glaze_white'][Math.floor(k.hash(a, b) * 2.99)], a, b, y0, r); blk(a - 0.2, b - 0.2, a + 0.2, b + 0.2, y0, y0 + 0.8); }
    B(il + 0.1, 2.5, il + 0.9, 3.0, y0, y0 + 0.5, 'timber'); B(il + 0.15, 2.55, il + 0.85, 2.95, y0 + 0.5, y0 + 0.58, 'thatch'); for (let q = 0; q < 3; q++) k.bowl('glaze_white', il + 0.3 + q * 0.2, 2.75, y0 + 0.58, 1.3);
    blk(il + 0.1, 2.5, il + 0.9, 3.0, y0, y0 + 0.6);
    for (let q = 0; q < 4; q++) k.bowl('glaze_blue', 0.5 + q * 0.3, 0.65, y0 + 1.0, 1.2);
    lampAt(mid, 2.4);
  } else if (use === 'iron') {
    // the ironmonger's: pans and woks hung and stacked, a rack of blades and tools, a small anvil on its stump with hammer and tongs, a charcoal basket
    B(il, ib - 0.04, ir, ib, y0 + 0.9, y0 + 2.0, 'wood_dark');
    for (let q = 0; q < 6; q++) { const a = il + 0.2 + q * ((ir - il - 0.4) / 5); B(a - 0.04, ib - 0.07, a + 0.04, ib - 0.04, y0 + 1.15 + (q % 2) * 0.1, y0 + 1.8 - (q % 3) * 0.1, 'iron'); B(a - 0.02, ib - 0.07, a + 0.02, ib - 0.04, y0 + 1.8 - (q % 3) * 0.1, y0 + 1.9 - (q % 3) * 0.1, 'timber'); }
    for (const [a, h] of [[il + 0.35, 0], [il + 0.35, 0.1], [il + 1.0, 0]]) c.lat('iron', [[0.001, 0], [0.06, 0], [0.18, 0.05], [0.3, 0.17], [0.28, 0.18], [0.16, 0.09], [0.001, 0.06]], 12, a, ib - 0.45, y0 + h);
    blk(il + 0.05, ib - 0.8, il + 1.3, ib - 0.1, y0, y0 + 0.3);
    const aa = mid + 0.15, ab = 3.15;
    c.lat('timber', [[0.001, 0], [0.2, 0], [0.22, 0.4], [0.001, 0.4]], 9, aa, ab, y0);
    B(aa - 0.16, ab - 0.07, aa + 0.16, ab + 0.07, y0 + 0.4, y0 + 0.48, 'iron'); B(aa - 0.07, ab - 0.05, aa + 0.07, ab + 0.05, y0 + 0.48, y0 + 0.56, 'iron'); B(aa + 0.16, ab - 0.03, aa + 0.3, ab + 0.03, y0 + 0.43, y0 + 0.47, 'iron');
    B(aa - 0.24, ab + 0.12, aa - 0.04, ab + 0.15, y0 + 0.4, y0 + 0.43, 'iron'); B(aa - 0.24, ab + 0.12, aa - 0.2, ab + 0.15, y0 + 0.43, y0 + 0.5, 'iron');
    blk(aa - 0.22, ab - 0.22, aa + 0.22, ab + 0.22, y0, y0 + 0.56);
    c.lat('timber', [[0.001, 0], [0.14, 0], [0.2, 0.3], [0.17, 0.3], [0.12, 0.03], [0.001, 0.03]], 10, ir - 0.2, 3.8, y0);
    B(ir - 0.4, 3.6, ir, 4.0, y0, y0 + 0.02, 'cloth_black');
    lampAt(mid, 2.4);
  } else if (use === 'fans') {
    // the fan and umbrella maker's: oil-paper umbrellas open under the beams and in a stand, bundles of bamboo ribs, a rack of fans, a bale of paper
    for (const [a, b, m] of [[il + 0.5, 2.9, 'cloth_ochre'], [il + 1.4, 3.3, 'cloth_red'], [il + 2.2, 2.8, 'cloth_ochre'], [il + 1.1, 3.9, 'cloth_indigo']]) {
      c.lat(m, [[0.001, 0.0], [0.3, -0.12], [0.6, -0.34], [0.64, -0.4], [0.6, -0.4], [0.001, -0.3]], 14, a, b, y0 + 2.4);
      B(a - 0.012, b - 0.012, a + 0.012, b + 0.012, y0 + 2.4, y0 + 2.7, 'bamboo_culm');
    }
    for (let q = 0; q < 7; q++) { const a = ir - 0.15 - q * 0.1, b = ib - 0.15 - (q % 2) * 0.1; c.lat(q % 3 ? 'cloth_ochre' : 'cloth_red', [[0.03, 1.15], [0.05, 0.9], [0.001, 0.55]], 6, a, b, y0); B(a - 0.01, b - 0.01, a + 0.01, b + 0.01, y0, y0 + 1.2, 'bamboo_culm'); }
    B(ir - 0.8, ib - 0.35, ir, ib, y0, y0 + 0.12, 'timber'); blk(ir - 0.8, ib - 0.35, ir, ib, y0, y0 + 1.2);
    for (let q = 0; q < 9; q++) B(il + 0.15 + q * 0.04, ib - 0.1, il + 0.18 + q * 0.04, ib - 0.07, y0, y0 + 1.5 + (q % 3) * 0.05, 'bamboo_culm');    // bundled ribs leaning against the wall
    B(il + 0.1, ib - 0.1, il + 0.5, ib - 0.04, y0 + 0.3, y0 + 0.34, 'timber'); blk(il + 0.1, ib - 0.12, il + 0.5, ib - 0.02, y0, y0 + 1.6);
    k.table(il + 0.1, 3.5, il + 1.2, 4.0, y0, 0.76, 'timber'); for (let q = 0; q < 4; q++) B(il + 0.2 + q * 0.2, 3.6, il + 0.38 + q * 0.2, 3.9, y0 + 0.76, y0 + 0.78 + q * 0.012, 'paint_white');
    B(il + 1.5, 3.7, il + 2.3, 4.2, y0, y0 + 0.36, 'paint_white'); blk(il + 1.5, 3.7, il + 2.3, 4.2, y0, y0 + 0.36);                            // the bale of paper
    lampAt(mid, 2.5);
  }
  void SIGNS; void lay;
}

export function upperExtra(c, k) {
  const { B, blk, L, Y1, lay, ibB, use } = c;
  const y = Y1, e0 = lay.e0, e1 = lay.e1, back = ibB, narrow = L < 5.5;
  const bedW = narrow ? 0.8 : 0.95;
  const a1 = e1 - 0.0, a0 = narrow ? Math.max(e0 + 0.6, a1 - bedW) : a1 - bedW;
  const desk = (x0, b0, x1, b1, books) => {
    k.table(x0, b0, x1, b1, y, 0.76, 'lacquer_chestnut');
    if (books) { B(x0 + 0.1, b0 + 0.1, x0 + 0.35, b0 + 0.35, y + 0.76, y + 0.9, 'cloth_indigo'); B(x0 + 0.4, b0 + 0.12, x0 + 0.6, b0 + 0.3, y + 0.76, y + 0.84, 'cloth_white'); }
    k.stool((x0 + x1) / 2, b1 + 0.3, y, 0.46, 0.15, false);
  };
  const quilt = { wine: 'cloth_indigo', pawn: 'cloth_indigo', food: 'cloth_brown', silk: 'cloth_red', pottery: 'cloth_indigo', iron: 'cloth_brown', fans: 'cloth_indigo' }[use];
  // the bed along the east wall, as the weaver's. In a narrow house the way from the stair's top (a 1.9, b 3.4–4.4) to the
  // gallery door runs between the bed and the stairwell, so the rest stands on the front landing (a 0.3–1.3, b 1.1–2.0), on
  // the back wall over the bed, and hangs from the beam
  k.bed(a0, 2.8, a1, back - 0.05, y, false, quilt);
  const shelf = (mats, kind) => {
    B(a0 - 0.02, back - 0.32, a1, back - 0.04, y + 1.45, y + 1.5, 'wood_dark');
    for (let q = 0; q < 3; q++) {
      const a = a0 + 0.15 + q * ((a1 - a0 - 0.3) / 2), m = mats[q % mats.length];
      if (kind === 'jar') k.jar(m, a, back - 0.18, y + 1.5, 0.9); else if (kind === 'bowl') k.bowl(m, a, back - 0.18, y + 1.5, 1.1); else B(a - 0.1, back - 0.3, a + 0.1, back - 0.06, y + 1.5, y + 1.72, m);
    }
  };
  if (use === 'wine') {
    shelf(['pottery_dark', 'glaze_white', 'glaze_blue'], 'jar');
    desk(0.4, 1.3, 1.25, 1.85, false); k.bowl('glaze_white', 1.0, 1.6, y + 0.76); k.jar('pottery_dark', 0.6, 1.5, y + 0.76, 0.7);
  } else if (use === 'pawn') {
    // the storeroom: the pledges kept in boxes and bundles on racks to the ceiling
    B(e0 + 0.1, back - 0.55, e1 - 1.05, back - 0.05, y, y + 2.0, 'lacquer_chestnut');
    for (let r = 0; r < 4; r++) for (let q = 0; q < Math.floor((e1 - e0 - 1.35) / 0.35); q++) B(e0 + 0.18 + q * 0.35, back - 0.55, e0 + 0.45 + q * 0.35, back - 0.4, y + 0.1 + r * 0.45, y + 0.4 + r * 0.45, ['cloth_indigo', 'cloth_indigo', 'cloth_brown', 'thatch', 'cloth_ochre'][(q + r) % 5]);
    blk(e0 + 0.1, back - 0.55, e1 - 1.05, back - 0.05, y, y + 2.0);
    k.chest(0.3, 1.95, 0.8, 2.5, y, 0.55, 'wood_dark'); desk(0.4, 1.3, 1.25, 1.85, true);
  } else if (use === 'food') {
    shelf(['pottery_dark', 'glaze_white'], 'jar');
    desk(0.4, 1.3, 1.25, 1.85, false); k.bowl('pottery_dark', 0.7, 1.5, y + 0.76, 1.2);
    k.hanging(a0, a1, 2.5, y, y + 2.3, ['cloth_white', 'cloth_indigo']);
  } else if (use === 'silk') {
    // the workroom: an embroidery frame at the front window to take the light, the silks hung to the east
    const fa = 0.62;
    for (const s of [-1, 1]) B(fa + s * 0.3 - 0.03, 1.3, fa + s * 0.3 + 0.03, 1.38, y, y + 1.0, 'lacquer_chestnut');
    B(fa - 0.36, 1.3, fa + 0.36, 1.38, y + 0.6, y + 0.66, 'lacquer_chestnut'); B(fa - 0.36, 1.3, fa + 0.36, 1.38, y + 0.95, y + 1.0, 'lacquer_chestnut');
    B(fa - 0.28, 1.33, fa + 0.28, 1.36, y + 0.66, y + 0.95, 'cloth_indigo'); B(fa - 0.15, 1.325, fa + 0.1, 1.365, y + 0.72, y + 0.88, 'cloth_red'); B(fa, 1.325, fa + 0.2, 1.365, y + 0.76, y + 0.84, 'gilt_bronze');
    blk(fa - 0.36, 1.28, fa + 0.36, 1.4, y, y + 1.0); k.stool(fa, 1.85, y, 0.4, 0.15, false);
    shelf(['cloth_red', 'cloth_green', 'cloth_ochre'], 'bolt');
  } else if (use === 'pottery') {
    shelf(['glaze_white', 'glaze_blue', 'glaze_green'], 'bowl');
    desk(0.4, 1.3, 1.25, 1.85, false); for (let q = 0; q < 3; q++) k.bowl('glaze_white', 0.6 + q * 0.15, 1.55, y + 0.76, 1.2);
  } else if (use === 'iron') {
    desk(0.4, 1.3, 1.25, 1.85, false); B(0.6, 1.45, 0.9, 1.6, y + 0.76, y + 0.8, 'iron');
    shelf(['iron', 'iron', 'timber'], 'bolt');
  } else if (use === 'fans') {
    // the umbrella maker's loft: sheets of oiled paper hung to dry over the bed's end, bundles of ribs on the back wall, the worktable
    k.hanging(a0 - 0.05, a1, 2.5, y, y + 2.3, ['paint_white', 'paint_white', 'paint_white']);
    for (let q = 0; q < 6; q++) B(a1 - 0.08 - q * 0.04, back - 0.12, a1 - 0.05 - q * 0.04, back - 0.09, y + 0.62, y + 2.0, 'bamboo_culm');
    desk(0.4, 1.3, 1.25, 1.85, true);
  }
  void blk;
}
