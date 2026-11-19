// The rooms of the ten houses added after the first sixteen (uphouses.js HOUSEHOLDS; docs/settlements/ming-suzhou.md §22), by household:
// the boatman's, the tea house with its storyteller's table, the silk weaver's with his drawloom, the inn with its kitchen and guest
// rooms, the scholar-official's, the woodblock printer's, the grocer's with the family behind the shop, a merchant family's house, the
// jade cutter's and the tinsmith's. Same frame as rooms.js (a along the front from the stair's end, b from the front line to the back).
// Kept clear: the lane b 1.4–2.2 from the door to the stair's foot and a 1.65–2.15 up to b 4.7 beside the stair; in a waterside house the
// way to the back door (diagonal in the narrow ones, through the partition's doorway at a 1.6–2.5 and along LANE in the wide ones, then
// the strip bc ± 0.7 to the door); above, the way from the stair's top by the stair room's side to the gallery door.
// Everything is boxes (B, F) and lathe pieces (lat, latF) gathered into the house's materials: pieces under 0.4 m sent apart would make one
// detail mesh, and so one draw, per material per plan (about +33 at the arrival), so F and latF are B and lat for now. `k` is rooms.js's kit.

export const HOUSEHOLD_USES = ['boatman', 'teahouse', 'drawloom', 'lodging', 'scholar', 'printer', 'grocer', 'dwelling', 'jade', 'tinsmith'];

/** The small objects every household keeps, and the larger things the households share (stove, water jar, shrine shelf, washstand). */
function things(c, k) {
  const { B, blk, F, latF, lat } = c;
  const t = {};
  t.bowl = (mat, a, b, yy, s = 1) => latF(mat, [[0.05 * s, 0], [0.13 * s, 0.065 * s], [0.001, 0.03 * s]], 7, a, b, yy);
  t.cup = (a, b, yy) => latF('glaze_white', [[0.03, 0], [0.042, 0.07], [0.001, 0.02]], 6, a, b, yy);
  t.teapot = (a, b, yy, mat = 'pottery_dark') => latF(mat, [[0.07, 0.0], [0.1, 0.07], [0.09, 0.13], [0.001, 0.16]], 7, a, b, yy);
  /** A pair of cloth shoes by a bed, one turned over the other's toe. */
  t.pair = (a, b, yy) => { F(a, b, a + 0.07, b + 0.2, yy, yy + 0.07, 'cloth_black'); F(a + 0.1, b + 0.06, a + 0.17, b + 0.26, yy, yy + 0.07, 'cloth_black'); };
  t.book = (a, b, yy, mat = 'cloth_indigo', n = 1) => { for (let q = 0; q < n; q++) F(a, b, a + 0.2, b + 0.14, yy + q * 0.03, yy + q * 0.03 + 0.028, q % 2 ? 'cloth_white' : mat); };
  /** The thread-bound ledger and the abacus on a counter whose top is yy. */
  t.ledger = (a, b, yy) => { F(a, b, a + 0.22, b + 0.3, yy, yy + 0.03, 'cloth_white'); F(a, b, a + 0.22, b + 0.3, yy, yy + 0.008, 'cloth_indigo'); F(a + 0.28, b + 0.05, a + 0.32, b + 0.28, yy, yy + 0.012, 'wood_dark'); };
  t.abacus = (a, b, yy) => { F(a, b, a + 0.34, b + 0.14, yy, yy + 0.04, 'wood_dark'); for (let q = 0; q < 6; q++) F(a + 0.03 + q * 0.05, b + 0.02, a + 0.045 + q * 0.05, b + 0.12, yy + 0.04, yy + 0.07, 'wood_dark'); };
  /** A wash basin on a stand, a towel on its rail. */
  t.washstand = (a, b, yy) => {
    for (const [da, db] of [[-0.2, -0.17], [0.2, -0.17], [-0.2, 0.17], [0.2, 0.17]]) B(a + da - 0.02, b + db - 0.02, a + da + 0.02, b + db + 0.02, yy, yy + 0.7, 'lacquer_chestnut');
    B(a - 0.23, b - 0.2, a + 0.23, b + 0.2, yy + 0.7, yy + 0.74, 'lacquer_chestnut'); B(a - 0.2, b - 0.17, a + 0.2, b + 0.17, yy + 0.3, yy + 0.33, 'lacquer_chestnut');
    latF('glaze_white', [[0.1, 0], [0.21, 0.1], [0.001, 0.04]], 8, a, b, yy + 0.74);
    B(a - 0.2, b + 0.15, a + 0.2, b + 0.17, yy + 0.74, yy + 1.15, 'lacquer_chestnut'); F(a - 0.14, b + 0.12, a + 0.14, b + 0.15, yy + 0.8, yy + 1.1, 'cloth_white');
    blk(a - 0.25, b - 0.22, a + 0.25, b + 0.22, yy, yy + 1.15);
  };
  /** Split firewood stacked in rows (a0..a1 × b0..b1), n high. */
  t.wood = (a0, b0, a1, b1, yy, n = 2) => { for (let r = 0; r < n; r++) for (let q = 0; a0 + q * 0.17 + 0.15 <= a1 + 0.001; q++) F(a0 + q * 0.17, b0, a0 + q * 0.17 + 0.15, b1, yy + r * 0.14, yy + r * 0.14 + 0.13, 'timber'); blk(a0, b0, a1, b1, yy, yy + n * 0.14); };
  /** A big water jar with a wooden lid and a gourd ladle across it. */
  t.waterJar = (a, b, yy, s = 2.4) => {
    k.jar('pottery_dark', a, b, yy, s); lat('timber', [[0.001, 0.36 * s], [0.1 * s, 0.355 * s], [0.1 * s, 0.375 * s], [0.001, 0.385 * s]], 9, a, b, yy);
    F(a - 0.12, b - 0.015, a + 0.2, b + 0.015, yy + 0.385 * s, yy + 0.385 * s + 0.03, 'bamboo_culm'); blk(a - 0.17 * s, b - 0.17 * s, a + 0.17 * s, b + 0.17 * s, yy, yy + 0.36 * s);
  };
  /** The kitchen corner against the back wall (at ib): the stove a0..a1 with two woks and the chimney, the chopping block on its stump beside it, a rack of bowls over it. */
  t.kitchen = (a0, a1, ib, yy) => {
    k.stove(a0, ib - 1.0, a1, ib - 0.08, yy);
    B(a1 + 0.08, ib - 0.5, a1 + 0.5, ib - 0.1, yy, yy + 0.7, 'timber'); blk(a1 + 0.08, ib - 0.5, a1 + 0.5, ib - 0.1, yy, yy + 0.7);          // the chopping block
    F(a1 + 0.15, ib - 0.42, a1 + 0.42, ib - 0.38, yy + 0.7, yy + 0.72, 'iron'); F(a1 + 0.3, ib - 0.3, a1 + 0.33, ib - 0.2, yy + 0.7, yy + 0.86, 'wood_dark');     // the cleaver
    B(a1 + 0.05, ib - 0.12, a1 + 0.65, ib - 0.08, yy + 1.5, yy + 1.55, 'wood_dark'); for (let q = 0; q < 4; q++) t.bowl(q % 2 ? 'glaze_white' : 'glaze_blue', a1 + 0.17 + q * 0.14, ib - 0.1, yy + 1.55, 1.0);
    t.bowl('glaze_white', a0 + 0.2, ib - 0.5, yy + 0.9, 1.2);
  };
  /** A stove against the east wall (at ae): the brick body at b0..b1, a pot and a kettle, the chimney to the ceiling. */
  t.stoveE = (ae, b0, b1, yy, top = 3.2) => {
    B(ae - 0.9, b0, ae, b1, yy, yy + 0.85, 'brick_grey'); B(ae - 0.93, b0 - 0.03, ae, b1 + 0.03, yy + 0.85, yy + 0.9, 'granite_grey');
    k.jar('iron', ae - 0.5, b0 + 0.3, yy + 0.9, 1.5); k.jar('iron', ae - 0.5, b1 - 0.28, yy + 0.9, 1.2);
    B(ae - 0.4, b0 + 0.1, ae, b1 - 0.1, yy + 0.9, yy + top, 'brick_grey'); B(ae - 0.9, (b0 + b1) / 2 - 0.15, ae - 0.87, (b0 + b1) / 2 + 0.15, yy + 0.2, yy + 0.5, 'iron');
    blk(ae - 0.9, b0, ae, b1, yy, yy + 0.9);
  };
  /** The ancestors' shelf against a wall at b = bw (dir −1 : the wall is behind, toward +b; dir +1 : toward −b): a high shelf with three tablets, a table under it with an incense burner, two red candles and offerings. */
  t.shrine = (a0, a1, bw, yy, dir = -1, hw = 0.7) => {
    const m = (a0 + a1) / 2, d = 0.28, bb0 = dir < 0 ? bw - d : bw, bb1 = dir < 0 ? bw : bw + d, bm = (bb0 + bb1) / 2;
    B(a0, bb0, a1, bb1, yy + 1.55, yy + 1.6, 'lacquer_chestnut');
    for (const s of [-1, 0, 1]) { F(m + s * 0.2 - 0.045, bm - 0.02, m + s * 0.2 + 0.045, bm + 0.02, yy + 1.6, yy + 1.82, 'lacquer_black'); F(m + s * 0.2 - 0.047, bm - 0.022, m + s * 0.2 + 0.047, bm + 0.022, yy + 1.78, yy + 1.82, 'lacquer_red'); }
    B(a0 + 0.04, bb0, a0 + 0.08, bb1, yy + 1.2, yy + 1.55, 'lacquer_chestnut'); B(a1 - 0.08, bb0, a1 - 0.04, bb1, yy + 1.2, yy + 1.55, 'lacquer_chestnut');
    const tb0 = dir < 0 ? bw - 0.5 : bw, tb1 = dir < 0 ? bw : bw + 0.5, tm = (tb0 + tb1) / 2;
    k.table(m - hw, tb0, m + hw, tb1, yy, 0.9, 'lacquer_chestnut');
    lat('bronze', [[0.001, 0], [0.07, 0.01], [0.09, 0.07], [0.08, 0.11], [0.001, 0.11]], 8, m, tm, yy + 0.9);
    for (const s of [-1, 1]) { const cx = m + s * Math.min(0.4, hw - 0.15); F(cx - 0.015, tm - 0.015, cx + 0.015, tm + 0.015, yy + 0.93, yy + 1.13, 'cloth_red'); F(cx - 0.04, tm - 0.04, cx + 0.04, tm + 0.04, yy + 0.9, yy + 0.93, 'bronze'); }
    t.bowl('glaze_white', m - 0.22, tm + 0.08, yy + 0.9, 1.0); t.bowl('glaze_white', m + 0.2, tm - 0.1, yy + 0.9, 1.0);
  };
  t.armchair = (a, b, yy) => {
    B(a - 0.28, b - 0.25, a + 0.28, b + 0.25, yy + 0.45, yy + 0.5, 'lacquer_chestnut');
    for (const [da, db] of [[-0.26, -0.23], [0.22, -0.23], [-0.26, 0.19], [0.22, 0.19]]) B(a + da, b + db, a + da + 0.04, b + db + 0.04, yy, yy + 0.45, 'lacquer_chestnut');
    B(a - 0.28, b + 0.2, a + 0.28, b + 0.25, yy + 0.5, yy + 1.05, 'lacquer_chestnut'); B(a - 0.28, b - 0.25, a - 0.24, b + 0.25, yy + 0.5, yy + 0.75, 'lacquer_chestnut'); B(a + 0.24, b - 0.25, a + 0.28, b + 0.25, yy + 0.5, yy + 0.75, 'lacquer_chestnut');
    blk(a - 0.28, b - 0.25, a + 0.28, b + 0.25, yy, yy + 1.05);
  };
  t.teaSet = (a, b, yy, mat) => { t.teapot(a, b, yy, mat); t.cup(a - 0.2, b - 0.08, yy); t.cup(a + 0.2, b + 0.1, yy); };
  return t;
}

/**
 * A drawloom (hua lou ji), the great loom of the brocade weavers: a frame 1.0 m wide and 3.2 m long, the flower tower over its back end
 * with the figure harness hanging from it and the draw-boy's seat, the weaver's board and the treadles at the front. The cloth beam at the
 * front carries the part woven (red, with a repeat in gilt thread), the warp beyond it still bare white threads: a piece half done.
 * (a, b0) is the west-front corner of the frame.
 */
function drawloom(c, a, b0, yy) {
  const { B, blk, F } = c, w = 1.0, b1 = b0 + 3.2, H = 2.55, tb = b1 - 1.1, wd = 'lacquer_chestnut';
  for (const [pa, pb] of [[a, b0], [a + w - 0.1, b0], [a, b1 - 0.1], [a + w - 0.1, b1 - 0.1]]) B(pa, pb, pa + 0.1, pb + 0.1, yy, yy + 1.3, wd);
  for (const pa of [a, a + w - 0.1]) { B(pa, b0, pa + 0.1, b1, yy + 1.2, yy + 1.3, wd); B(pa, b0, pa + 0.1, b1, yy + 0.4, yy + 0.46, wd); }
  B(a, b0, a + w, b0 + 0.1, yy + 1.2, yy + 1.3, wd); B(a, b1 - 0.1, a + w, b1, yy + 1.2, yy + 1.3, wd);
  for (const pa of [a - 0.02, a + w - 0.08]) { B(pa, tb, pa + 0.1, tb + 0.1, yy, yy + H, wd); B(pa, tb + 1.0, pa + 0.1, tb + 1.1, yy, yy + H, wd); B(pa, tb, pa + 0.1, tb + 1.1, yy + H - 0.1, yy + H, wd); }
  B(a - 0.02, tb, a + w + 0.02, tb + 0.08, yy + H - 0.12, yy + H, 'wood_dark'); B(a + 0.02, tb + 0.15, a + w - 0.02, tb + 0.95, yy + 2.0, yy + 2.05, 'timber');      // the draw-boy's plank
  for (let q = 0; q < 9; q++) { const pa = a + 0.1 + q * ((w - 0.2) / 8); F(pa, tb + 0.5 + (q % 3) * 0.02, pa + 0.012, tb + 0.512 + (q % 3) * 0.02, yy + 1.34, yy + H - 0.12, 'cloth_red'); }   // the harness cords
  for (let q = 0; q < 14; q++) { const pa = a + 0.12 + q * ((w - 0.24) / 13); F(pa, b0 + 1.3, pa + 0.012, b1 - 0.1, yy + 1.3, yy + 1.312, 'cloth_white'); }                     // the bare warp
  B(a + 0.1, b0 + 0.1, a + w - 0.1, b0 + 1.3, yy + 1.3, yy + 1.33, 'cloth_red');                                                                                              // the part woven
  for (let q = 0; q < 5; q++) F(a + 0.2 + (q % 2) * 0.3, b0 + 0.2 + q * 0.2, a + 0.32 + (q % 2) * 0.3, b0 + 0.28 + q * 0.2, yy + 1.33, yy + 1.338, 'gilt_bronze');
  B(a + 0.05, b0 - 0.12, a + w - 0.05, b0 + 0.03, yy + 1.18, yy + 1.3, 'timber');                                                                                              // the breast beam
  B(a + 0.05, b0 - 0.5, a + w - 0.05, b0 - 0.2, yy + 0.42, yy + 0.47, 'timber'); for (const pa of [a + 0.1, a + w - 0.14]) B(pa, b0 - 0.46, pa + 0.04, b0 - 0.24, yy, yy + 0.42, 'wood_dark');   // the weaver's board
  for (const pa of [a + 0.25, a + 0.65]) B(pa, b0 - 0.1, pa + 0.1, b0 + 0.9, yy + 0.06, yy + 0.1, 'wood_dark');                                                             // the treadles
  blk(a, b0 - 0.5, a + w, b1, yy, yy + 1.4); blk(a - 0.02, tb, a + w + 0.02, tb + 1.1, yy, yy + H);
}

export function groundHouse(c, k) {
  const { B, blk, F, latF, lat, L, y0, ibB: ib, use, el } = c;
  const t = things(c, k), il = 0.3, ir = L - 0.3, back = !!el.water;
  const lampAt = (a, b, h = 2.35) => k.lamp(a, b, y0 + h);
  const front = (a = 1.3) => { t.ledger(a, 0.62, y0 + 1.0); t.abacus(a - 0.5, 0.62, y0 + 1.0); };
  // a board partition across the house at b = pb, a doorway at the stair's side (a 1.6–2.5) and one at the east end (from ir − 1.5)
  const part = (pb) => { for (const [a0, a1] of [[il - 0.05, 1.6], [2.5, ir - 1.5]]) { B(a0, pb - 0.05, a1, pb + 0.05, y0, y0 + 2.6, 'timber'); blk(a0, pb - 0.05, a1, pb + 0.05, y0, y0 + 2.6); } B(il - 0.05, pb - 0.05, ir + 0.05, pb + 0.05, y0 + 2.6, y0 + 3.2, 'timber'); };

  if (use === 'boatman') {
    // the boatman's house: a front room, the family's back room (stove, table, the oars and the net, the net hung to dry), the way along the east side to the back door and the canal
    t.kitchen(il + 0.05, 1.3, ib, y0); t.waterJar(0.55, ib - 1.65, y0, 2.0);
    k.table(0.35, 4.95, 1.25, 5.65, y0, 0.74, 'timber'); k.stool(0.8, 4.62, y0, 0.45, 0.15); k.stool(0.8, 6.0, y0, 0.45, 0.15);
    t.bowl('glaze_white', 0.6, 5.2, y0 + 0.74, 1.2); t.bowl('glaze_white', 0.95, 5.4, y0 + 0.74, 1.2); t.bowl('pottery_dark', 0.75, 5.5, y0 + 0.74, 1.4); F(0.8, 5.25, 0.83, 5.5, y0 + 0.74, y0 + 0.77, 'bamboo_culm'); F(0.86, 5.25, 0.89, 5.5, y0 + 0.74, y0 + 0.77, 'bamboo_culm');
    for (let q = 0; q < 3; q++) { const b = 6.3 + q * 0.14; B(0.3, b, 0.36, b + 0.05, y0, y0 + 2.2, 'bamboo_culm'); B(0.28, b - 0.02, 0.44, b + 0.07, y0 + 1.55, y0 + 2.2, 'timber'); }     // the oars, blades up, against the west wall
    blk(0.28, 6.25, 0.46, 6.8, y0, y0 + 2.2);
    B(il, 6.95, 1.6, 6.99, y0 + 2.3, y0 + 2.36, 'bamboo_culm'); B(il + 0.02, 6.96, 1.58, 6.98, y0 + 1.1, y0 + 2.3, 'thatch');                      // the net on its pole
    for (let q = 0; q < 5; q++) F(0.4 + q * 0.27, 6.93, 0.5 + q * 0.27, 7.0, y0 + 2.2, y0 + 2.27, 'thatch');
    B(0.26, 2.9, 0.3, 3.5, y0 + 1.0, y0 + 2.0, 'thatch'); latF('thatch', [[0.32, 0], [0.1, 0.1], [0.001, 0.15]], 10, 0.5, 3.2, y0 + 1.75);              // (the rain cape and the bamboo hat on the stair's wall)
    for (let q = 0; q < 3; q++) F(1.65 + q * 0.2, 3.0, 1.75 + q * 0.2, 3.35, y0 + 1.3, y0 + 1.7 + (q % 2) * 0.1, 'cloth_grey');
    B(1.55, 3.0, 2.5, 3.04, y0 + 1.7, y0 + 1.75, 'bamboo_culm');                                                                                       // fish hung to dry in the front room
    B(2.9, 2.8, ir, 3.5, y0, y0 + 0.4, 'thatch'); blk(2.9, 2.8, ir, 3.5, y0, y0 + 0.4); latF('thatch', [[0.17, 0], [0.19, 0.04], [0.17, 0.08], [0.001, 0.08]], 12, 3.15, 3.3, y0 + 0.4);   // the fish basket with a coil of rope on it
    lampAt(0.9, 6.0, 2.3);
  } else if (use === 'drawloom') {
    // the weaver's house: the drawloom along the west side of the long room, the skeins and the reel before it, the family's stove in the front room by the door
    drawloom(c, 0.35, 4.95, y0); k.stool(0.85, 4.38, y0, 0.45, 0.17, false);
    t.stoveE(ir, 2.6, 3.5, y0); t.waterJar(ir - 0.4, 3.95, y0, 2.0);
    k.table(2.5, 4.3, 3.3, 5.1, y0, 0.74, 'timber'); for (let q = 0; q < 3; q++) F(2.6 + q * 0.2, 4.4, 2.7 + q * 0.2, 5.0, y0 + 0.74, y0 + 0.78, ['cloth_red', 'cloth_ochre', 'cloth_indigo'][q]);   // skeins of dyed silk laid out
    B(2.6, 5.95, 2.68, 6.03, y0, y0 + 0.9, 'lacquer_chestnut'); B(2.4, 5.91, 2.88, 6.07, y0 + 0.88, y0 + 0.93, 'lacquer_chestnut');                       // the reeling frame
    for (const a of [2.44, 2.82]) B(a, 5.93, a + 0.04, 6.05, y0 + 0.93, y0 + 1.5, 'bamboo_culm'); for (let q = 0; q < 4; q++) F(2.42, 5.94, 2.9, 6.06, y0 + 1.2 + q * 0.07, y0 + 1.215 + q * 0.07, q % 2 ? 'cloth_white' : 'cloth_ochre');
    blk(2.4, 5.9, 2.9, 6.08, y0, y0 + 1.5);
    latF('thatch', [[0.001, 0], [0.16, 0], [0.2, 0.2], [0.001, 0.2]], 10, 3.0, 5.6, y0); for (let q = 0; q < 6; q++) latF('cloth_white', [[0.001, 0], [0.03, 0.02], [0.03, 0.05], [0.001, 0.07]], 6, 2.92 + (q % 3) * 0.08, 5.55 + Math.floor(q / 3) * 0.1, y0 + 0.2);   // cocoons in their basket
    t.bowl('glaze_white', 3.0, 4.7, y0 + 0.74, 1.2); t.teapot(2.8, 4.85, y0 + 0.74);
    lampAt(2.4, 7.0, 2.35);
  } else if (use === 'printer') {
    // the printer's: the cutter's bench with the block and its ink pad, the sheets hung on lines to dry, paper in reams, the leaves racked along the back wall
    k.table(0.35, 4.9, 1.2, 6.2, y0, 0.78, 'timber'); B(0.45, 5.0, 1.1, 5.55, y0 + 0.78, y0 + 0.83, 'wood_dark'); F(0.52, 5.1, 0.64, 5.45, y0 + 0.83, y0 + 0.85, 'cloth_black'); F(0.8, 5.1, 1.05, 5.4, y0 + 0.83, y0 + 0.9, 'timber');   // the block, the ink pad, the baren
    F(0.6, 5.65, 1.0, 6.1, y0 + 0.78, y0 + 0.795, 'cloth_white'); F(0.62, 5.67, 0.98, 6.08, y0 + 0.795, y0 + 0.81, 'cloth_white');
    k.stool(0.8, 4.6, y0, 0.45, 0.15); k.stool(0.8, 6.55, y0, 0.45, 0.15);
    k.shelves(il, 1.55, ib - 0.5, ib, y0, [0.45, 0.95, 1.45], 'books');
    for (const b of [7.2, 7.8]) { B(il, b, 1.55, b + 0.03, y0 + 2.25, y0 + 2.3, 'bamboo_culm'); for (let q = 0; q < 4; q++) B(il + 0.1 + q * 0.3, b - 0.005, il + 0.35 + q * 0.3, b + 0.035, y0 + 1.3 + (q % 2) * 0.05, y0 + 2.25, 'cloth_white'); }   // sheets hung on lines
    B(0.35, 8.3, 0.95, 8.9, y0, y0 + 0.5, 'paint_white'); B(0.4, 8.35, 0.9, 8.85, y0 + 0.5, y0 + 0.9, 'paint_white'); blk(0.35, 8.3, 0.95, 8.9, y0, y0 + 0.9);   // reams of paper
    t.bowl('pottery_dark', 1.2, 7.0, y0, 2.0);
    k.cabinet(2.65, 2.7, 3.0, 3.6, y0, 1.8, -1);
    for (let q = 0; q < 3; q++) F(1.45 + q * 0.01, 0.65, 1.95 + q * 0.01, 0.85, y0 + 1.0 + q * 0.012, y0 + 1.012 + q * 0.012, 'cloth_white');   // sheets on offer at the counter
    lampAt(0.8, 5.6, 2.3); front(1.3);
  } else if (use === 'tinsmith') {
    // the tinsmith's: the bench with its stake, snips and irons; the charcoal pan with the soldering irons, finished kettles hung from a pole, the coil of sheet, a second bench for the apprentice
    B(0.3, 2.9, ir - 0.2, 2.96, y0 + 2.4, y0 + 2.45, 'bamboo_culm');
    for (let q = 0; q < 10; q++) { const a = 0.5 + q * 0.58, h = 0.3 + (q % 3) * 0.1; B(a - 0.005, 2.92, a + 0.005, 2.94, y0 + 2.4 - h, y0 + 2.4, 'bamboo_culm'); latF('iron', [[0.08, 0], [0.13, 0.04], [0.13, 0.13], [0.07, 0.17], [0.001, 0.17]], 8, a, 2.93, y0 + 2.4 - h - 0.17); }
    k.table(0.4, 4.7, 2.3, 5.5, y0, 0.8, 'timber'); B(0.55, 4.82, 0.7, 4.97, y0 + 0.8, y0 + 0.86, 'iron'); F(0.9, 4.9, 1.25, 4.95, y0 + 0.8, y0 + 0.83, 'iron'); F(1.45, 5.0, 1.8, 5.04, y0 + 0.8, y0 + 0.82, 'iron'); F(1.65, 5.2, 1.95, 5.3, y0 + 0.8, y0 + 0.83, 'iron');
    lat('timber', [[0.001, 0], [0.2, 0], [0.22, 0.4], [0.001, 0.4]], 9, 1.45, 6.4, y0); B(1.3, 6.3, 1.6, 6.5, y0 + 0.4, y0 + 0.5, 'iron'); B(1.4, 6.35, 1.5, 6.45, y0 + 0.5, y0 + 0.62, 'iron'); blk(1.2, 6.2, 1.7, 6.6, y0, y0 + 0.62);   // the stake on its stump
    lat('pottery_dark', [[0.001, 0], [0.2, 0], [0.24, 0.08], [0.22, 0.16], [0.001, 0.16]], 10, 0.75, 6.5, y0); for (let q = 0; q < 4; q++) F(0.55 + q * 0.1, 6.45, 0.6 + q * 0.1, 6.6, y0 + 0.16, y0 + 0.18, 'cloth_black');     // the charcoal pan and its irons
    for (let q = 0; q < 3; q++) latF('iron', [[0.04, 0], [0.12, 0.02], [0.12, 0.12], [0.001, 0.14]], 8, 0.5 + q * 0.5, 4.2, y0);                       // finished basins on the floor
    k.table(4.2, 4.7, 5.9, 5.4, y0, 0.8, 'timber'); for (let q = 0; q < 3; q++) F(4.4 + q * 0.4, 4.85, 4.7 + q * 0.4, 5.25, y0 + 0.8, y0 + 0.82 + q * 0.01, 'iron'); k.stool(5.0, 4.3, y0, 0.4, 0.15, false);
    B(ir - 0.7, 3.4, ir, 4.1, y0, y0 + 0.9, 'iron'); blk(ir - 0.7, 3.4, ir, 4.1, y0, y0 + 0.9); latF('iron', [[0.001, 0], [0.2, 0.01], [0.2, 0.05], [0.001, 0.06]], 10, ir - 0.35, 3.75, y0 + 0.9);       // the coil of sheet
    t.stoveE(ir, 6.6, 7.5, y0); t.waterJar(ir - 1.4, 8.4, y0, 2.0); k.table(3.5, 8.0, 4.7, 8.8, y0, 0.74, 'timber'); t.bowl('glaze_white', 3.9, 8.4, y0 + 0.74, 1.2); t.bowl('glaze_white', 4.3, 8.5, y0 + 0.74, 1.2); k.stool(4.1, 9.2, y0, 0.45, 0.15); k.stool(3.3, 8.4, y0, 0.45, 0.15);
    k.stool(2.75, 5.1, y0, 0.4, 0.15, false); lampAt(1.3, 5.9, 2.3); front(1.3);
  } else if (use === 'jade') {
    // the jade cutter's: the treadle wheel at the window with its water trough, dishes of sand, rough stones and finished pieces on the shelf; the family's stove and table in the east
    k.table(il + 0.1, 4.7, il + 1.5, 5.45, y0, 0.82, 'timber');
    B(il + 0.45, 4.9, il + 0.5, 5.15, y0 + 0.82, y0 + 1.05, 'iron'); latF('iron', [[0.001, 0], [0.16, 0], [0.16, 0.012], [0.001, 0.012]], 14, il + 0.48, 5.02, y0 + 1.0);               // the wheel
    B(il + 0.2, 4.8, il + 0.9, 4.85, y0 + 0.2, y0 + 0.25, 'wood_dark'); B(il + 0.5, 5.35, il + 0.54, 5.38, y0, y0 + 0.82, 'wood_dark');                                      // the treadle bar
    for (const a of [il + 0.95, il + 1.2]) t.bowl('glaze_white', a, 5.1, y0 + 0.82, 1.1);
    B(il + 0.1, 5.7, il + 0.8, 6.15, y0, y0 + 0.4, 'timber'); blk(il + 0.1, 5.7, il + 0.8, 6.15, y0, y0 + 0.4); latF('glaze_blue', [[0.001, 0], [0.22, 0], [0.26, 0.1], [0.24, 0.12], [0.001, 0.09]], 10, il + 0.45, 5.92, y0 + 0.4);   // the trough
    k.stool(2.2, 5.1, y0, 0.45, 0.15, false);
    k.shelves(il, 3.0, ib - 0.5, ib, y0, [0.5, 1.15, 1.8], 'jars');
    for (let q = 0; q < 5; q++) F(il + 0.25 + q * 0.5, ib - 0.35, il + 0.41 + q * 0.5, ib - 0.2, y0 + 1.15, y0 + 1.27, q % 2 ? 'glaze_green' : 'glaze_white');         // pieces of jade, rough and cut
    k.table(4.2, 3.0, 5.3, 3.7, y0, 0.74, 'lacquer_chestnut'); t.teaSet(4.75, 3.35, y0 + 0.74); k.stool(3.7, 3.35, y0, 0.45, 0.15); k.stool(5.8, 3.35, y0, 0.45, 0.15);        // the customers' table
    t.stoveE(ir, 6.4, 7.3, y0); t.waterJar(ir - 1.4, 8.4, y0, 2.2); t.wood(ir - 1.6, 9.35, ir - 0.2, 9.6, y0, 3);
    k.table(5.6, 8.0, 7.0, 8.8, y0, 0.74, 'timber'); k.stool(6.3, 9.2, y0, 0.45, 0.15); k.stool(5.2, 8.4, y0, 0.45, 0.15); k.stool(7.4, 8.4, y0, 0.45, 0.15);
    for (let q = 0; q < 3; q++) t.bowl('glaze_white', 5.9 + q * 0.3, 8.4, y0 + 0.74, 1.2); t.teapot(6.5, 8.55, y0 + 0.74);
    t.shrine(4.0, 6.0, ib, y0, -1, 0.6);
    lampAt(il + 0.8, 5.0, 2.3); lampAt(6.3, 8.4, 2.3); front(1.3);
  } else if (use === 'grocer') {
    // the grocer's: shelves of caddies and jars, sacks, strings of dried goods under the beam; a partition with a doorway, behind it the family's table, stove and shrine
    front(1.3); k.shelves(il, 1.55, 4.45, 4.98, y0, [0.5, 1.15, 1.8], 'jars'); k.shelves(2.4, ir, 4.45, 4.98, y0, [0.5, 1.15, 1.8], 'jars');
    for (const [a0, a1] of [[il - 0.05, 1.6], [2.4, ir + 0.05]]) { B(a0, 5.0, a1, 5.1, y0, y0 + 2.6, 'timber'); blk(a0, 5.0, a1, 5.1, y0, y0 + 2.6); } B(il - 0.05, 5.0, ir + 0.05, 5.1, y0 + 2.6, y0 + 3.2, 'timber');
    k.sacks(2.4, 2.7, ir - 0.05, 3.5, y0, 3); t.bowl('pottery_dark', 2.2, 0.7, y0 + 1.0, 1.4);
    for (let q = 0; q < 5; q++) F(1.5 + q * 0.3, 2.45, 1.56 + q * 0.3, 2.51, y0 + 2.0 - (q % 2) * 0.1, y0 + 2.12, 'cloth_ochre'); B(1.4, 2.43, 3.2, 2.47, y0 + 2.12, y0 + 2.16, 'bamboo_culm');
    t.shrine(0.5, 1.5, 5.1, y0, 1, 0.5);
    t.kitchen(il + 0.05, 1.3, ib, y0); t.waterJar(ir - 0.45, ib - 0.55, y0, 2.2); t.wood(il, ib - 1.6, 1.1, ib - 1.3, y0, 3);
    k.table(0.5, 6.8, 1.5, 7.6, y0, 0.74, 'timber'); k.stool(1.0, 8.0, y0, 0.45, 0.15); k.stool(1.9, 7.2, y0, 0.45, 0.15); k.stool(1.0, 6.45, y0, 0.45, 0.15, false);
    t.bowl('glaze_white', 0.8, 7.1, y0 + 0.74, 1.2); t.bowl('glaze_white', 1.15, 7.25, y0 + 0.74, 1.2); t.teapot(1.2, 7.45, y0 + 0.74);
    t.washstand(ir - 0.4, 6.0, y0);
    lampAt(2.0, 3.0); lampAt(1.8, 7.5, 2.3);
  } else if (use === 'teahouse') {
    // the tea house over the water: tables and stools in the front room, the kettle stove and the shelves of caddies, the storyteller's table on a low platform in the back, a back door onto a deck over the canal
    t.stoveE(ir, 2.6, 3.4, y0); t.waterJar(ir - 0.4, 3.9, y0, 2.0);
    for (const [a, b] of [[3.3, 3.0], [4.7, 3.0], [3.9, 4.55]]) {
      k.table(a - 0.45, b - 0.4, a + 0.45, b + 0.4, y0, 0.76, 'lacquer_chestnut'); k.stool(a, b + 0.62, y0, 0.46, 0.15); if (a < 4) k.stool(a - 0.7, b, y0, 0.46, 0.15);
      t.teapot(a - 0.1, b, y0 + 0.76); t.cup(a + 0.12, b - 0.1, y0 + 0.76); t.cup(a + 0.2, b + 0.14, y0 + 0.76); t.cup(a - 0.25, b + 0.15, y0 + 0.76);
    }
    k.shelves(il, 4.4, ib - 0.5, ib, y0, [0.55, 1.2, 1.85], 'jars');
    // the storyteller's table: no performer, no instrument (pingtan as a stage art is no earlier than the late Ming); a cloth, a fan, a block of wood, a cup, a stool, on a platform 15 cm high
    const sa = 2.7, sb = 7.0;
    B(sa - 1.1, sb - 0.5, sa + 1.1, sb + 1.2, y0, y0 + 0.15, 'timber'); c.flr(sa - 1.1, sb - 0.5, sa + 1.1, sb + 1.2, y0 + 0.15); blk(sa - 1.1, sb - 0.5, sa + 1.1, sb + 1.2, y0, y0 + 0.15);
    k.table(sa - 0.5, sb - 0.1, sa + 0.5, sb + 0.4, y0 + 0.15, 0.82, 'lacquer_chestnut', false); B(sa - 0.48, sb - 0.08, sa + 0.48, sb + 0.38, y0 + 0.97, y0 + 0.98, 'cloth_red');
    F(sa - 0.3, sb + 0.05, sa - 0.1, sb + 0.2, y0 + 0.98, y0 + 1.0, 'bamboo_culm'); F(sa + 0.05, sb + 0.1, sa + 0.2, sb + 0.2, y0 + 0.98, y0 + 1.06, 'timber'); t.cup(sa + 0.3, sb + 0.15, y0 + 0.98);
    k.stool(sa, sb + 0.8, y0 + 0.15, 0.46, 0.17, false);
    t.washstand(0.6, 7.6, y0);
    lampAt(3.3, 3.9, 2.4); lampAt(sa, sb, 2.4); front(1.3);
  } else if (use === 'lodging') {
    // the inn: the desk at the door with the ledger and the key rack, the hall's tables, a partition, behind it the kitchen with two stoves, water jars, firewood and the staff's table, a lane to the back door
    t.ledger(1.3, 0.62, y0 + 1.0); t.abacus(0.8, 0.62, y0 + 1.0);
    for (let q = 0; q < 6; q++) F(il + 1.1 + q * 0.12, 2.45, il + 1.13 + q * 0.12, 2.48, y0 + 1.5, y0 + 1.75, 'lacquer_chestnut');   // pegs for the room keys
    for (const [a, b] of [[3.4, 3.1], [5.2, 3.1], [3.6, 4.5]]) { k.table(a - 0.45, b - 0.4, a + 0.45, b + 0.4, y0, 0.76, 'lacquer_chestnut'); k.stool(a - 0.7, b, y0, 0.46, 0.15); k.stool(a + 0.7, b, y0, 0.46, 0.15); k.stool(a, b + 0.62, y0, 0.46, 0.15); t.bowl('glaze_white', a - 0.15, b, y0 + 0.76, 1.2); t.bowl('glaze_white', a + 0.15, b + 0.1, y0 + 0.76, 1.2); t.teapot(a, b - 0.15, y0 + 0.76); }
    part(5.4);
    t.kitchen(il + 0.1, 1.5, ib, y0); t.kitchen(2.4, 3.5, ib, y0);
    t.waterJar(4.3, ib - 0.5, y0, 2.4); t.wood(il, ib - 1.7, 1.2, ib - 1.4, y0, 3);
    k.table(0.4, 6.8, 1.6, 7.6, y0, 0.74, 'timber'); k.stool(1.0, 8.0, y0, 0.45, 0.15); k.stool(0.7, 6.45, y0, 0.45, 0.15, false); k.stool(1.9, 7.2, y0, 0.45, 0.15);
    for (let q = 0; q < 3; q++) F(2.9 + q * 0.2, 6.5, 3.0 + q * 0.2, 6.65, y0 + 2.0 - (q % 2) * 0.2, y0 + 2.4, 'cloth_red'); B(2.8, 6.48, 3.8, 6.52, y0 + 2.38, y0 + 2.42, 'bamboo_culm');    // cured meat from the beam
    lampAt(3.6, 3.7); lampAt(1.2, 7.0, 2.3);
  } else if (use === 'scholar') {
    // the scholar-official's: the hall, the ancestors' shelf on the partition behind the long table, a square table and two armchairs; behind the partition a plain back room, the library and a writing table
    part(5.4);
    t.shrine(2.8, 4.7, 5.35, y0, -1);
    k.table(3.5, 3.1, 4.6, 3.8, y0, 0.78); t.armchair(3.0, 3.45, y0); t.armchair(5.1, 3.45, y0); t.teaSet(4.05, 3.45, y0 + 0.78, 'glaze_white');
    B(0.45, 5.33, 1.3, 5.38, y0 + 0.9, y0 + 2.3, 'stucco_cream'); B(0.5, 5.31, 1.25, 5.33, y0 + 1.0, y0 + 2.2, 'stucco_rose');           // a hanging scroll on the partition's west piece
    k.shelves(il, 2.3, ib - 0.5, ib, y0, [0.5, 1.15, 1.8], 'books');
    k.table(0.4, 7.0, 1.7, 7.7, y0, 0.78); t.book(0.6, 7.1, y0 + 0.78, 'cloth_indigo', 3); t.bowl('glaze_blue', 1.3, 7.3, y0 + 0.78, 1.0); k.stool(1.0, 6.45, y0, 0.46, 0.15, false);
    t.kitchen(3.0, 4.0, ib, y0); t.waterJar(4.5, ib - 0.6, y0, 2.0);
    lampAt(3.8, 3.0, 2.8); lampAt(1.0, 7.4, 2.3);
  } else if (use === 'dwelling') {
    // a merchant family's house: the front hall (the long table, the ancestors' shelf on the partition, armchairs), behind it the kitchen, the table, the washstand and the pantry shelves
    part(5.8);
    t.shrine(3.9, 5.9, 5.75, y0, -1);
    t.armchair(3.5, 3.4, y0); t.armchair(6.3, 3.4, y0);
    k.table(4.4, 3.0, 5.4, 3.8, y0, 0.78); t.teaSet(4.9, 3.4, y0 + 0.78, 'glaze_white');
    k.cabinet(ir - 0.55, 2.5, ir, 3.4, y0, 1.9, -1);
    t.kitchen(il + 0.2, 1.6, ib, y0); t.kitchen(3.0, 4.2, ib, y0); t.waterJar(5.4, ib - 0.5, y0, 2.4); t.waterJar(6.1, ib - 0.45, y0, 2.0); t.wood(6.8, ib - 0.6, 7.6, ib - 0.1, y0, 3);
    k.table(3.9, 8.2, 5.6, 9.1, y0, 0.74, 'timber'); for (const [a, b] of [[3.6, 8.65], [5.9, 8.65], [4.75, 9.5], [4.75, 7.85]]) k.stool(a, b, y0, 0.45, 0.15);
    for (let q = 0; q < 4; q++) t.bowl('glaze_white', 4.1 + q * 0.3, 8.65, y0 + 0.74, 1.2); t.teapot(4.75, 8.5, y0 + 0.74);
    k.shelves(ir - 1.4, ir, 6.4, 6.8, y0, [0.5, 1.15, 1.8], 'jars'); t.washstand(0.7, 8.0, y0);
    lampAt(4.9, 3.0, 2.8); lampAt(4.75, 8.2, 2.8);
    t.ledger(1.3, 0.62, y0 + 1.0);
  }
  void lat;
}

export function upperHouse(c, k) {
  const { B, blk, F, latF, L, Y1, lay, ibB: back, use } = c;
  const t = things(c, k), y = Y1, e0 = lay.e0, e1 = lay.e1;
  const lampAt = (a, b, h = 2.0) => k.lamp(a, b, y + h);
  // a desk with its stool at the front window of the stair room (a < 1.3, b < 2.45: clear of the stairwell)
  const desk = (a0, b0, a1, b1, books) => { k.table(a0, b0, a1, b1, y, 0.76, 'lacquer_chestnut'); if (books) { t.book(a0 + 0.1, b0 + 0.1, y + 0.76, 'cloth_indigo', 3); t.book(a0 + 0.4, b0 + 0.15, y + 0.76, 'cloth_white', 2); } k.stool((a0 + a1) / 2, b1 + 0.3, y, 0.46, 0.15, false); };
  const bed = (a0, a1, canopy, quilt, bl = 2.05) => { k.bed(a0, back - bl, a1, back - 0.05, y, canopy, quilt); t.pair(a0 - 0.22, back - 0.45, y); };

  if (use === 'boatman') {
    bed(2.4, 3.35, false, 'cloth_indigo');
    k.chest(0.4, back - 0.55, 1.3, back - 0.08, y, 0.55); k.chest(0.4, back - 1.3, 1.1, back - 0.8, y, 0.5, 'wood_dark');
    B(0.3, 5.6, 2.2, 5.64, y + 2.1, y + 2.14, 'bamboo_culm'); B(0.32, 5.61, 2.18, 5.63, y + 1.1, y + 2.1, 'thatch');                      // the second net, drying under the roof
    latF('thatch', [[0.17, 0], [0.19, 0.04], [0.17, 0.08], [0.001, 0.08]], 12, 1.0, 6.5, y); t.bowl('pottery_dark', 1.0, 7.0, y, 1.4);
    desk(0.4, 1.3, 1.25, 1.85, false); t.bowl('glaze_white', 0.8, 1.55, y + 0.76, 1.2); F(0.55, 1.45, 0.95, 1.5, y + 0.76, y + 0.78, 'bamboo_culm');
    lampAt(1.9, back - 1.5, 2.1);
  } else if (use === 'drawloom') {
    // above the loom room: the warping frame (a beam on two posts with pegs, the warp laid on it in colours), the family's bed at the back
    bed(2.35, 3.3, false, 'cloth_red');
    B(0.4, 5.2, 0.5, 8.0, y + 0.6, y + 0.7, 'lacquer_chestnut'); for (const b of [5.2, 7.9]) B(0.38, b, 0.52, b + 0.1, y, y + 1.0, 'lacquer_chestnut');
    for (let q = 0; q < 8; q++) F(0.38, 5.3 + q * 0.33, 0.52, 5.34 + q * 0.33, y + 0.7, y + 0.95, 'wood_dark');
    for (let q = 0; q < 6; q++) F(0.55, 5.4 + q * 0.4, 0.6, 5.42 + q * 0.4, y + 0.7, y + 0.95, ['cloth_red', 'cloth_ochre', 'cloth_indigo', 'cloth_white', 'cloth_red', 'cloth_green'][q]);
    k.hanging(1.2, 2.2, 6.4, y, y + 2.3, ['cloth_red', 'cloth_ochre', 'cloth_indigo']);
    desk(0.4, 1.3, 1.25, 1.85, false); for (let q = 0; q < 3; q++) F(0.55 + q * 0.2, 1.4, 0.68 + q * 0.2, 1.7, y + 0.76, y + 0.8, ['cloth_red', 'cloth_ochre', 'cloth_indigo'][q]);
    lampAt(1.9, 6.0);
  } else if (use === 'printer') {
    // the stock: paper in reams and finished leaves stacked to the beams, the cutter's bed in the corner
    B(0.3, back - 1.6, 1.4, back - 0.05, y, y + 1.3, 'paint_white'); blk(0.3, back - 1.6, 1.4, back - 0.05, y, y + 1.3);
    for (let q = 0; q < 4; q++) B(0.3, back - 1.6 + q * 0.39, 1.4, back - 1.3 + q * 0.39, y + 1.3, y + 1.4 + (q % 2) * 0.1, 'cloth_indigo');
    bed(1.9, 3.0, false, 'cloth_grey');
    desk(0.4, 1.3, 1.25, 1.85, true); k.chest(0.3, 4.7, 0.9, 5.2, y, 0.45);
    k.hanging(1.6, 3.0, 5.5, y, y + 2.3, ['cloth_white', 'cloth_white', 'cloth_white']);
    lampAt(2.0, 6.0);
  } else if (use === 'tinsmith') {
    // the sleeping loft: the master's bed and the apprentice's mat, a bench of stock (pans and basins), a desk with the accounts
    bed(0.4, 1.5, false, 'cloth_brown'); k.bed(5.3, back - 2.05, 6.4, back - 0.05, y, false, 'cloth_grey'); t.pair(5.1, back - 0.45, y);
    B(2.4, back - 0.9, 4.8, back - 0.05, y, y + 0.5, 'timber'); for (let q = 0; q < 6; q++) latF('iron', [[0.001, 0], [0.12, 0], [0.14, 0.12], [0.001, 0.14]], 8, 2.65 + q * 0.38, back - 0.5, y + 0.5);
    blk(2.4, back - 0.9, 4.8, back - 0.05, y, y + 0.5);
    desk(0.4, 1.3, 1.25, 1.85, true); F(0.6, 1.45, 0.9, 1.5, y + 0.76, y + 0.78, 'iron');
    k.table(e0 + 1.0, 3.0, e0 + 2.0, 3.6, y, 0.76); t.ledger(e0 + 1.3, 3.1, y + 0.76); k.stool(e0 + 1.5, 3.95, y, 0.46, 0.15, false);
    lampAt(1.9, 6.0); lampAt(e0 + 1.5, 3.3, 2.1);
  } else if (use === 'jade') {
    bed(L - 1.4, L - 0.3, false, 'cloth_indigo');
    k.chest(0.4, back - 0.6, 1.4, back - 0.1, y, 0.55); k.cabinet(2.0, back - 0.6, 3.2, back - 0.1, y, 1.8, -1);
    desk(0.4, 1.3, 1.25, 1.85, false); for (let q = 0; q < 3; q++) F(0.55 + q * 0.2, 1.45, 0.68 + q * 0.2, 1.6, y + 0.76, y + 0.84, q % 2 ? 'glaze_green' : 'glaze_white');
    k.table(e0 + 1.0, 3.0, e0 + 2.2, 3.7, y, 0.76); t.teaSet(e0 + 1.6, 3.35, y + 0.76, 'glaze_white'); k.stool(e0 + 0.7, 3.35, y, 0.46, 0.15); k.stool(e0 + 2.5, 3.35, y, 0.46, 0.15);
    t.washstand(4.2, back - 0.4, y);
    lampAt(1.9, 6.0); lampAt(e0 + 1.6, 4.0, 2.1);
  } else if (use === 'grocer') {
    bed(L - 1.35, L - 0.3, true, 'cloth_indigo', 2.15);
    k.chest(0.4, back - 0.6, 1.4, back - 0.1, y, 0.55); t.washstand(1.0, back - 1.3, y);
    k.sacks(1.6, back - 1.0, 2.4, back - 0.1, y, 2, ['cloth_white', 'cloth_ochre']);
    desk(0.4, 1.3, 1.25, 1.85, true); k.hanging(1.6, 3.0, 6.0, y, y + 2.3, ['cloth_ochre', 'cloth_white']);
    lampAt(1.9, 6.0);
  } else if (use === 'teahouse') {
    // over the front room, low tables for a quieter pot; the family's bed alcove at the back of the east chamber, a cabinet and a chest
    for (const a of [e0 + 0.6, e0 + 2.4]) { k.table(a - 0.45, 2.6, a + 0.45, 3.2, y, 0.7, 'lacquer_chestnut'); t.teaSet(a, 2.9, y + 0.7); k.stool(a, 3.6, y, 0.46, 0.15, false); }
    bed(L - 1.5, L - 0.3, true, 'cloth_red', 2.15);
    k.cabinet(e0 + 0.2, back - 0.6, e0 + 1.5, back - 0.1, y, 1.9, -1); k.chest(e0 + 1.7, back - 0.55, e0 + 2.5, back - 0.1, y, 0.55); t.washstand(e0 + 3.0, back - 0.45, y);
    k.table(0.4, back - 1.6, 1.3, back - 0.9, y, 0.74); t.bowl('glaze_white', 0.8, back - 1.25, y + 0.74, 1.2);
    lampAt(e0 + 1.4, 3.6, 2.1); lampAt(L - 0.9, back - 1.5, 2.1);
  } else if (use === 'lodging') {
    // three guest rooms at the back, each a bed, a chest, a basin and a lamp, shoes by the bed; the landlord's desk at the front window
    const cuts = [0.3, 3.05, 5.0, e1];
    for (let q = 0; q < 3; q++) {
      const a0 = cuts[q], a1 = cuts[q + 1];
      if (q === 1) { B(5.0 - 0.04, back - 3.7, 5.0 + 0.04, back, y, y + 2.45, 'timber'); blk(5.0 - 0.04, back - 3.7, 5.0 + 0.04, back, y, y + 2.45); }
      bed(a1 - 1.15, a1 - 0.1, false, ['cloth_indigo', 'cloth_red', 'cloth_brown'][q], 2.0);
      k.chest(a0 + 0.12, back - 0.55, a0 + 0.9, back - 0.08, y, 0.5); t.washstand(a0 + 0.55, back - 1.5, y); lampAt((a0 + a1) / 2, back - 1.0, 2.1);
    }
    B(3.11, back - 3.7, e1, back - 3.66, y + 2.3, y + 2.45, 'timber');
    desk(e0 + 0.3, 2.6, e0 + 1.2, 3.1, true); k.table(e0 + 2.2, 2.6, e0 + 3.0, 3.1, y, 0.76); t.teaSet(e0 + 2.6, 2.85, y + 0.76); k.stool(e0 + 2.6, 3.5, y, 0.46, 0.15, false);
  } else if (use === 'scholar') {
    // the study over the hall (the books, the desk at the light) and the bed alcove at the back
    k.shelves(0.3, 2.3, back - 0.5, back, y, [0.45, 1.0, 1.55, 2.05], 'books');
    k.table(e0 + 0.5, 2.6, e0 + 1.7, 3.25, y, 0.78); B(e0 + 0.65, 2.7, e0 + 1.05, 3.1, y + 0.78, y + 0.82, 'cloth_white'); F(e0 + 0.8, 2.8, e0 + 0.84, 2.97, y + 0.82, y + 0.9, 'bamboo_culm'); F(e0 + 1.2, 2.75, e0 + 1.4, 2.9, y + 0.78, y + 0.84, 'wood_dark'); t.book(e0 + 1.4, 3.0, y + 0.78, 'cloth_indigo', 3);
    k.stool(e0 + 1.1, 3.65, y, 0.46, 0.17, false);
    bed(L - 1.6, L - 0.3, true, 'cloth_indigo', 2.15);
    k.cabinet(3.3, back - 0.6, 4.6, back - 0.1, y, 2.0, -1); t.washstand(5.0, back - 0.4, y);
    lampAt(e0 + 1.1, 3.0, 2.1); lampAt(L - 1.0, back - 1.8, 2.1);
  } else if (use === 'dwelling') {
    // two bedrooms behind a board partition at the back; the wife's room with her dressing table, the master's with a canopy bed; the study at the front
    const pb = 5.8;
    B(pb - 0.05, back - 4.0, pb + 0.05, back, y, y + 2.45, 'timber'); blk(pb - 0.05, back - 4.0, pb + 0.05, back, y, y + 2.45);
    bed(0.5, 1.9, true, 'cloth_red', 2.15); k.bed(pb + 0.3, back - 2.1, pb + 1.5, back - 0.05, y, true, 'cloth_indigo'); t.pair(pb + 1.65, back - 0.5, y);
    k.cabinet(2.3, back - 0.6, 3.6, back - 0.1, y, 2.0, -1); k.chest(pb + 1.7, back - 0.55, L - 0.3, back - 0.1, y, 0.55); t.washstand(pb + 0.7, back - 3.0, y);
    k.table(0.4, back - 3.3, 1.0, back - 2.7, y, 0.7); B(0.55, back - 3.2, 0.9, back - 2.8, y + 0.7, y + 1.15, 'lacquer_black'); B(0.53, back - 3.22, 0.55, back - 2.78, y + 0.7, y + 1.17, 'gilt_bronze');
    desk(e0 + 0.5, 2.6, e0 + 1.7, 3.2, true);
    lampAt(3.0, back - 1.8, 2.1); lampAt(pb + 0.9, back - 1.8, 2.1);
  }
  void blk; void e1; void L;
}

/** The first sixteen houses: the ledger beside the abacus on the shop counters. */
export function householdBits(c, k, floor) {
  const { use, y0 } = c;
  if (floor === 0 && ['rice', 'cloth', 'medicine', 'books', 'lacquer', 'inn'].includes(use)) things(c, k).ledger(1.18, 0.62, y0 + 1.0);
}
