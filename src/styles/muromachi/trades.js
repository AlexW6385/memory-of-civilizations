// The trades of the Muromachi machiya (docs/settlements/muromachi-kyoto.md §5.2): what each shop keeps on its floor and walls.
// Called from machiya.js with the shop's frame: B (box), L (lathe), the floor's x range [x0, x1], the height y0 of the street and
// fl of the raised floor, qm the depth of the front room of mats, d the house's depth, H the height of the eaves.
import { WD, TM } from './kit.js';

export const TRADES = ['cloth', 'sake', 'pottery', 'rice', 'tea', 'lacquer', 'smith', 'dye', 'paper', 'sandals', 'food', 'doso', 'wood'];
const bowl = (L, m, x, y, z, k = 1) => L(m, [[0.001, 0], [0.04 * k, 0], [0.06 * k, 0.05 * k], [0.001, 0.05 * k]], 8, x, y, z);

/** Builds the goods and the furniture of one trade. */
export function trade(kind, { B, L }, { x0, x1, y0, fl, qm, d, H, r }) {
  const g = B, Y = y0 + fl + 0.03, cx = (x0 + x1) / 2;
  if (kind === 'cloth') { const cols = ['cloth_indigo', 'cloth_red', 'linen', 'cloth_brown', 'cloth_green', 'cloth_ochre']; for (let s = 0; s < 3; s++) for (let k = 0; k < 6; k++) g(cols[(k + s) % 6], x0 + 0.2 + k * 0.32, Y + 0.1 + s * 0.4, -qm - 0.07, x0 + 0.5 + k * 0.32, Y + 0.3 + s * 0.4 + (k % 2) * 0.06, -qm + 0.3); B(WD, x0 + 0.1, Y, -qm - 0.08, x1 - 0.1, Y + 1.3, -qm - 0.04);
    for (let k = 0; k < 3; k++) B(k % 2 ? 'cloth_indigo' : 'cloth_red', x0 + 0.6 + k * 0.9, Y + 1.4, -qm + 0.05, x0 + 1.1 + k * 0.9, y0 + H - 0.5, -qm + 0.07); }   // bolts hung from the beam
  else if (kind === 'sake') { for (let k = 0; k < 4; k++) { L('timber', [[0.001, 0], [0.28, 0], [0.32, 0.25], [0.33, 0.5], [0.3, 0.8], [0.001, 0.8]], 12, x0 + 0.5 + k * 0.62, Y, -qm - 0.45); L('iron', [[0.3, 0.2], [0.33, 0.2], [0.33, 0.24], [0.3, 0.24]], 12, x0 + 0.5 + k * 0.62, Y, -qm - 0.45); } B('lacquer_black', x0 + 0.3, Y, -1.4, x0 + 1.1, Y + 0.3, -0.8);
    for (let k = 0; k < 3; k++) L('pottery_dark', [[0.001, 0], [0.12, 0], [0.16, 0.18], [0.1, 0.34], [0.001, 0.36]], 8, x0 + 0.5 + k * 0.45, Y, -qm + 0.9); }
  else if (kind === 'pottery') { for (let s = 0; s < 3; s++) { B(TM, x0 + 0.2, Y + s * 0.45, -qm - 0.1, x1 - 0.2, Y + s * 0.45 + 0.04, -qm + 0.3); for (let k = 0; k < 6; k++) L(s === 1 ? 'glaze_green' : 'pottery_dark', [[0.001, 0], [0.07, 0], [0.12, 0.1], [0.08, 0.2], [0.001, 0.2]], 8, x0 + 0.4 + k * 0.38, Y + s * 0.45 + 0.04, -qm + 0.1); }
    for (let k = 0; k < 3; k++) L('pottery_dark', [[0.001, 0], [0.2, 0], [0.26, 0.2], [0.2, 0.4], [0.001, 0.42]], 9, x0 + 0.5 + k * 0.7, Y, -0.9); }
  else if (kind === 'rice') { for (let s = 0; s < 3; s++) for (let k = 0; k < 3 - s; k++) B('thatch', x0 + 0.2 + k * 0.7 + s * 0.35, Y + 0.03 + s * 0.42, -qm - 0.3, x0 + 0.8 + k * 0.7 + s * 0.35, Y + 0.03 + s * 0.42 + 0.4, -qm + 0.3);
    B(TM, x0 + 0.3, Y, -1.5, x0 + 1.3, Y + 0.5, -0.8); B('thatch', x0 + 0.35, Y + 0.5, -1.45, x0 + 1.25, Y + 0.56, -0.85); }                      // the measuring box (masu) and the scale
  else if (kind === 'tea') { B(TM, x0 + 0.1, Y, -1.5, x1 - 0.1, Y + 0.1, -0.7); B('cloth_red', x0 + 0.12, Y + 0.1, -1.48, x1 - 0.12, Y + 0.13, -0.72); L('iron', [[0.001, 0], [0.12, 0.02], [0.16, 0.12], [0.1, 0.2], [0.001, 0.22]], 10, x1 - 0.5, Y, -0.5); for (let k = 0; k < 3; k++) L('glaze_white', [[0.001, 0], [0.04, 0], [0.06, 0.05], [0.001, 0.05]], 8, x0 + 0.4 + k * 0.25, Y + 0.1, -1.1);
    for (let k = 0; k < 4; k++) L('pottery_dark', [[0.001, 0], [0.1, 0], [0.13, 0.12], [0.08, 0.2], [0.001, 0.22]], 8, x0 + 0.4 + k * 0.4, Y + 0.9, -d + 0.35); }
  else if (kind === 'lacquer') { for (let s = 0; s < 3; s++) { B(TM, x0 + 0.2, Y + s * 0.45, -qm - 0.1, x1 - 0.2, Y + s * 0.45 + 0.04, -qm + 0.3); for (let k = 0; k < 5; k++) L(k % 2 ? 'lacquer_red' : 'lacquer_black', [[0.001, 0], [0.06, 0], [0.1, 0.06], [0.11, 0.1], [0.001, 0.08]], 10, x0 + 0.4 + k * 0.42, Y + s * 0.45 + 0.04, -qm + 0.1); } }
  else if (kind === 'smith') {
    // an earth floor at the front, the forge under the wall, the anvil on its stump, the tools on the wall, charcoal in baskets
    B('silt', x0 + 0.05, Y, -qm - 0.2, x1 - 0.1, Y + 0.025, -0.45);
    B('granite_block', x0 + 0.1, Y, -qm + 0.2, x0 + 1.5, Y + 0.7, -qm + 1.2); B('granite_black', x0 + 0.3, Y + 0.7, -qm + 0.35, x0 + 1.3, Y + 0.76, -qm + 1.05); B('flame', x0 + 0.65, Y + 0.76, -qm + 0.6, x0 + 0.95, Y + 0.84, -qm + 0.85);
    B(WD, x0 + 1.55, Y + 0.3, -qm + 0.3, x0 + 2.1, Y + 0.95, -qm + 0.85); B('plaster_grey', x0 + 1.55, Y + 0.95, -qm + 0.3, x0 + 2.1, Y + 1.5, -qm + 0.4);   // the bellows' box (fuigo) and its hood
    L('timber', [[0.001, 0], [0.2, 0], [0.22, 0.4], [0.001, 0.4]], 8, cx + 0.6, Y, -1.4); B('iron', cx + 0.45, Y + 0.4, -1.5, cx + 0.8, Y + 0.52, -1.3); B('iron', cx + 0.78, Y + 0.44, -1.44, cx + 0.95, Y + 0.48, -1.36);
    for (let k = 0; k < 6; k++) B('iron', x0 + 0.2 + k * 0.25, Y + 1.5 + (k % 2) * 0.1, -d + 0.14, x0 + 0.26 + k * 0.25, Y + 1.95, -d + 0.2);   // tongs and hammers on the back wall
    for (let k = 0; k < 2; k++) L('wicker', [[0.001, 0], [0.22, 0], [0.28, 0.3], [0.001, 0.3]], 8, x1 - 0.5, Y, -qm + 0.4 + k * 0.6);
    L('timber', [[0.001, 0], [0.3, 0], [0.34, 0.25], [0.001, 0.25]], 10, x1 - 0.6, Y, -0.7); }
  else if (kind === 'dye') {
    for (let k = 0; k < 3; k++) { const x = x0 + 0.55 + k * 0.85; L('pottery_dark', [[0.001, 0], [0.3, 0], [0.37, 0.3], [0.35, 0.6], [0.001, 0.6]], 12, x, Y, -qm - 0.2); L('cloth_indigo', [[0.001, 0.57], [0.33, 0.57], [0.33, 0.585], [0.001, 0.585]], 12, x, Y, -qm - 0.2); }
    B(WD, x0 + 0.1, y0 + H - 0.7, -qm - 1.2, x1 - 0.1, y0 + H - 0.62, -qm - 1.14);
    for (let k = 0; k < 4; k++) { const x = x0 + 0.35 + k * 0.7; B(k % 2 ? 'cloth_indigo' : 'cloth_white', x, Y + 0.75, -qm - 1.18, x + 0.5, y0 + H - 0.7, -qm - 1.15); }   // dyed cloth hung from a pole across the room
    B(TM, x0 + 0.2, Y, -1.4, x0 + 1.0, Y + 0.7, -0.7); B('cloth_indigo', x0 + 0.25, Y + 0.7, -1.35, x0 + 0.95, Y + 0.74, -0.75); }
  else if (kind === 'paper') {
    B(TM, x0 + 0.2, Y, -1.5, x1 - 0.3, Y + 0.7, -0.6); for (let k = 0; k < 3; k++) B('paint_white', x0 + 0.3 + k * 0.5, Y + 0.7, -1.4, x0 + 0.75 + k * 0.5, Y + 0.7 + 0.1 + k * 0.05, -0.95);
    L('timber', [[0.001, 0], [0.4, 0], [0.45, 0.4], [0.4, 0.5], [0.001, 0.5]], 12, x0 + 0.8, Y, -qm - 0.6);    // the vat
    for (let k = 0; k < 5; k++) { B(TM, x0 + 0.3 + k * 0.38, Y, -d + 0.15, x0 + 0.34 + k * 0.38, Y + 1.5, -d + 0.2); B('paint_white', x0 + 0.34 + k * 0.38, Y + 0.1, -d + 0.15, x0 + 0.6 + k * 0.38, Y + 1.4, -d + 0.17); }
    B(TM, x0 + 0.1, Y + 1.5, -d + 0.14, x1 - 0.1, Y + 1.55, -d + 0.2); }
  else if (kind === 'sandals') {
    B(WD, x0 + 0.1, Y + 1.6, -qm - 0.06, x1 - 0.1, Y + 1.64, -qm - 0.02); B(WD, x0 + 0.1, Y + 1.1, -qm - 0.06, x1 - 0.1, Y + 1.14, -qm - 0.02);
    for (let k = 0; k < 9; k++) for (const yy of [1.6, 1.1]) B('thatch', x0 + 0.2 + k * 0.27, Y + yy - 0.38, -qm - 0.1, x0 + 0.32 + k * 0.27, Y + yy, -qm - 0.03);   // straw sandals (waraji) hung in rows
    B(TM, x0 + 0.2, Y, -1.5, x0 + 1.3, Y + 0.3, -0.7); for (let k = 0; k < 3; k++) B('thatch', x0 + 0.3 + k * 0.3, Y + 0.3, -1.4, x0 + 0.5 + k * 0.3, Y + 0.34, -0.8); }
  else if (kind === 'food') {
    B(TM, x0 + 0.1, Y, -2.2, x1 - 0.1, Y + 0.42, -1.3);                                                       // the bench of the eating-room
    for (let k = 0; k < 3; k++) { bowl(L, 'glaze_white', x0 + 0.4 + k * 0.5, Y + 0.42, -1.75); B('pottery_dark', x0 + 0.34 + k * 0.5 + 0.1, Y + 0.42, -1.6, x0 + 0.5 + k * 0.5 + 0.1, Y + 0.425, -1.55); }
    L('pottery_dark', [[0.001, 0], [0.16, 0], [0.2, 0.15], [0.16, 0.3], [0.001, 0.3]], 10, x1 - 0.55, Y, -qm + 0.6);
    B(TM, x0 + 0.3, Y + 0.9, -d + 0.15, x0 + 1.7, Y + 0.94, -d + 0.45); for (let k = 0; k < 5; k++) bowl(L, 'glaze_white', x0 + 0.4 + k * 0.28, Y + 0.94, -d + 0.3, 1.2); }
  else if (kind === 'doso') {
    B(WD, x0 + 0.3, Y, -1.5, x1 - 0.3, Y + 0.7, -0.7); B('lacquer_black', x0 + 0.3, Y + 0.7, -1.5, x1 - 0.3, Y + 0.74, -0.7);
    B('iron', cx - 0.3, Y + 0.74, -1.2, cx + 0.3, Y + 0.78, -1.15); B('iron', cx - 0.02, Y + 0.78, -1.2, cx + 0.02, Y + 1.0, -1.15);     // the scales
    for (let k = 0; k < 3; k++) B('lacquer_black', x0 + 0.3 + k * 0.55, Y, -d + 0.2, x0 + 0.8 + k * 0.55, Y + 0.5 + (k % 2) * 0.25, -d + 0.8);  // the strong chests
    for (let k = 0; k < 3; k++) B('iron', x0 + 0.3 + k * 0.55, Y + 0.15, -d + 0.78, x0 + 0.8 + k * 0.55, Y + 0.2, -d + 0.82);
    for (let k = 0; k < 6; k++) B('bronze', x1 - 1.0 + k * 0.1, Y + 0.74, -1.4, x1 - 0.95 + k * 0.1, Y + 0.9, -1.0); }                        // strings of coins
  else if (kind === 'wood') {
    for (let s = 0; s < 4; s++) B(TM, x0 + 0.2, Y + s * 0.12, -qm - 0.5 + s * 0.02, x1 - 0.2, Y + s * 0.12 + 0.1, -qm + 0.2);
    for (let k = 0; k < 4; k++) L('cedar', [[0.001, 0], [0.12, 0], [0.12, 1.4], [0.001, 1.4]], 7, x0 + 0.4 + k * 0.3, Y, -d + 0.4);
    B('iron', x1 - 1.2, Y + 1.3, -d + 0.14, x1 - 0.3, Y + 1.36, -d + 0.2); B(TM, x1 - 1.0, Y + 0.5, -2.0, x1 - 0.2, Y + 0.94, -1.4); }
  void r;
}
