// The ground storeys of Versailles' town houses, furnished (docs/settlements/versailles.md §5, "Inside the shops"):
// each trade's room — the baker's oven and kneading trough, the tavern's tables and casks, the draper's bolts of cloth,
// the apothecary's jars, the cobbler's bench, the perruquier's wigs on their blocks, the cutler's grinding wheel, the
// vintner's casks, the bookseller's shelves, the butcher's hooks, the hatter's blocks, the chandler's candles — and the
// plain house (bed with its curtains, table, hearth, dresser) and the hotel's vestibule. Local frame: u along the
// front (the shop's opening at the left, the door at the right, so the counter runs on the left and an aisle on the
// right), v in from the front; heights from the floor.

const pickOf = (rand, l) => l[Math.floor(rand() * l.length)];

export function furnish(use, c) {
  const { B, Rd, Lt, L, D, T, y, fy, ST0, rand, door } = c;
  const b = (mat, u0, v0, u1, v1, ya, yb, col = false) => B(mat, u0, v0, u1, v1, fy + ya, fy + yb, col);
  const lt = (mat, prof, u, v, ya = 0, seg = 10) => Lt(mat, prof, u, v, fy + ya, seg);
  const rd = (mat, a, bb, r, seg = 6) => Rd(mat, [a[0], fy + a[1], a[2]], [bb[0], fy + bb[1], bb[2]], r, seg);
  const CH = ST0 - 0.3 - 0.14;                                                       // headroom under the beams
  const aisle0 = door - 0.9;                                                         // the aisle at the door (the counter keeps to the other side)
  const left = door > L / 2;                                                         // the shop opening is on the other side from the door
  // mirror u when the door is on the left, so that the room is laid out as if the door were on the right
  const U = (u) => (left ? u : L - u);
  const bu = (mat, u0, v0, u1, v1, ya, yb, col = false) => { const a = U(u0), e = U(u1); b(mat, Math.min(a, e), v0, Math.max(a, e), v1, ya, yb, col); };
  const lu = (mat, prof, u, v, ya = 0, seg = 10) => lt(mat, prof, U(u), v, ya, seg);
  const ru = (mat, a, bb, r, seg) => rd(mat, [U(a[0]), a[1], a[2]], [U(bb[0]), bb[1], bb[2]], r, seg);
  void aisle0;
  const W = L - T, back = D - T;

  const table = (u, v, w, d, h, mat = 'wood_dark') => {
    bu(mat, u - w / 2, v - d / 2, u + w / 2, v + d / 2, h - 0.06, h, true);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) bu(mat, u + sx * (w / 2 - 0.08) - 0.04, v + sz * (d / 2 - 0.08) - 0.04, u + sx * (w / 2 - 0.08) + 0.04, v + sz * (d / 2 - 0.08) + 0.04, 0, h - 0.06);
  };
  const stool = (u, v, h = 0.45) => { lu('timber', [[0.16, 0], [0.15, h - 0.04], [0.19, h - 0.04], [0.19, h], [0.001, h]], u, v, 0, 8); };
  const chair = (u, v, dir = 1) => { stool(u, v); bu('timber', u - 0.19, v + dir * 0.16, u + 0.19, v + dir * 0.2, 0.45, 0.95); };
  const shelf = (mat, u0, u1, v, h, levels) => { for (let k = 0; k < levels; k++) bu(mat, u0, v - 0.3, u1, v, 0.5 + k * ((h - 0.5) / levels) - 0.03, 0.5 + k * ((h - 0.5) / levels), k === 0); bu(mat, u0, v - 0.3, u0 + 0.05, v, 0, h); bu(mat, u1 - 0.05, v - 0.3, u1, v, 0, h); };
  const jar = (mat, u, v, ya, r = 0.07, h = 0.22) => lu(mat, [[r * 0.7, 0], [r, h * 0.2], [r, h * 0.7], [r * 0.5, h * 0.92], [0.001, h]], u, v, ya, 8);
  const hearth = (u, w = 1.6) => {
    bu('brick', u - w / 2, back - 0.8, u + w / 2, back, 0, 0.5, true); bu('brick', u - w / 2 - 0.1, back - 0.85, u + w / 2 + 0.1, back, 1.7, 2.1);
    for (const sg of [-1, 1]) bu('brick', u + sg * (w / 2) - 0.1, back - 0.8, u + sg * (w / 2) + 0.1, back, 0.5, 1.7);
    bu('brick', u - w / 2 + 0.2, back - 0.5, u + w / 2 - 0.2, back, 2.1, CH);                      // the hood
    bu('flame', u - 0.3, back - 0.4, u + 0.3, back - 0.1, 0.5, 0.65);
    ru('iron', [u - 0.55, 1.55, back - 0.5], [u + 0.55, 1.55, back - 0.5], 0.02, 5);
    lu('pottery_dark', [[0.12, 0], [0.22, 0.1], [0.24, 0.24], [0.16, 0.34], [0.001, 0.34]], u, back - 0.5, 1.2, 9);
  };
  const counter = (u0, u1, v, h = 1.0) => { bu('wood_dark', u0, v, u1, v + 0.6, 0, h, true); bu('timber', u0 - 0.04, v - 0.04, u1 + 0.04, v + 0.64, h, h + 0.05); };
  const wallShelves = (u0, u1, levels, fill) => {
    for (let k = 0; k < levels; k++) { const ya = 0.7 + k * 0.5; bu('wood_dark', u0, back - 0.32, u1, back, ya, ya + 0.04); if (fill) for (let u = u0 + 0.15; u < u1 - 0.1; u += fill.step) fill.put(u, back - 0.18, ya + 0.04, k); }
    bu('wood_dark', u0, back - 0.32, u0 + 0.05, back, 0.7, 0.7 + levels * 0.5); bu('wood_dark', u1 - 0.05, back - 0.32, u1, back, 0.7, 0.7 + levels * 0.5);
  };
  const barrel = (u, v, ya = 0, r = 0.32, h = 0.8) => { lu('timber', [[r * 0.82, 0], [r, h * 0.3], [r * 1.04, h * 0.5], [r, h * 0.7], [r * 0.82, h], [0.001, h]], u, v, ya, 10); for (const g of [0.22, 0.78]) lu('iron', [[r * (0.9 + (g > 0.5 ? 0 : 0.05)), h * g - 0.02], [r * (0.93 + 0.05), h * g + 0.02]], u, v, ya, 10); };
  const cask = (u, v, ya, len = 1.0, r = 0.36) => { ru('timber', [u - len / 2, ya + r, v], [u + len / 2, ya + r, v], r, 10); for (const g of [-0.3, 0.3]) ru('iron', [u + g * len - 0.02, ya + r, v], [u + g * len + 0.02, ya + r, v], r * 1.03, 10); };
  const sack = (u, v, mat = 'sacking') => lu(mat, [[0.001, 0], [0.22, 0.02], [0.26, 0.2], [0.2, 0.42], [0.1, 0.55], [0.001, 0.58]], u, v, 0, 8);
  const lamp = (u, v) => { ru('iron', [u, CH, v], [u, CH - 0.3, v], 0.008, 4); lu('lamp_glass', [[0.001, 0], [0.09, 0.05], [0.1, 0.2], [0.001, 0.26]], u, v, CH - 0.56, 8); };
  const bed = (u, v) => {
    bu('wood_dark', u - 0.75, v, u + 0.75, v + 2.0, 0, 0.4, true); bu('cloth_white', u - 0.7, v + 0.05, u + 0.7, v + 1.95, 0.4, 0.55); bu('cloth_red', u - 0.72, v + 0.7, u + 0.72, v + 1.95, 0.55, 0.62); bu('cloth_white', u - 0.5, v + 0.08, u + 0.5, v + 0.5, 0.55, 0.68);
    for (const [pu, pv] of [[-0.78, 0], [0.78, 0], [-0.78, 1.98], [0.78, 1.98]]) bu('wood_dark', u + pu - 0.04, v + pv - 0.04, u + pu + 0.04, v + pv + 0.04, 0, 2.0);
    bu('wood_dark', u - 0.8, v - 0.02, u + 0.8, v + 0.04, 1.96, 2.04); bu('cloth_red', u - 0.78, v + 0.02, u - 0.7, v + 1.96, 0.9, 2.0); bu('cloth_red', u + 0.7, v + 0.02, u + 0.78, v + 1.96, 0.9, 2.0);
  };
  const buffet = (u, v) => { bu('wood_dark', u - 0.7, v, u + 0.7, v + 0.5, 0, 1.9, true); bu('timber', u - 0.66, v - 0.02, u + 0.66, v, 1.0, 1.04); for (const k of [-0.4, 0, 0.4]) { jar('glaze_white', u + k, v - 0.05, 1.04, 0.07, 0.1); jar('pottery_dark', u + k * 0.8, v - 0.05, 1.45, 0.08, 0.2); } };
  const books = (u0, u1, v, ya, hh) => { for (let u = u0; u < u1 - 0.04; u += 0.05 + rand() * 0.04) bu(pickOf(rand, ['cloth_brown', 'cloth_red', 'cloth_indigo', 'hide_tan', 'cloth_green', 'cloth_black']), u, v - 0.24, u + 0.04 + rand() * 0.02, v - 0.02, ya, ya + hh * (0.7 + rand() * 0.3)); };

  // the rooms
  const common = () => { for (let k = 0; k < 2; k++) lamp(W * (0.35 + k * 0.4), D * 0.4); };
  switch (use) {
    case 'baker': {
      counter(0.5, L * 0.64, 2.0); for (let u = 0.8; u < L * 0.6; u += 0.45) { bu('wood_ochre', u, 2.15, u + 0.34, 2.45, 1.05, 1.17); bu('paint_ochre', u + 0.05, 2.2, u + 0.29, 2.4, 1.17, 1.26); }
      // the oven: a brick dome with its mouth, in the back corner by the aisle
      bu('brick', L - 3.1, back - 2.6, L - 0.5, back, 0, 0.9, true); lu('brick', [[1.2, 0], [1.2, 0.5], [0.9, 1.0], [0.5, 1.35], [0.001, 1.5]], L - 1.8, back - 1.3, 0.9, 14); bu('opening', L - 2.1, back - 2.6, L - 1.5, back - 2.55, 0.9, 1.4); bu('iron', L - 2.2, back - 2.62, L - 1.4, back - 2.58, 1.4, 1.46); bu('flame', L - 2.0, back - 2.55, L - 1.6, back - 2.5, 0.95, 1.25);
      bu('wood_dark', 0.5, back - 1.0, 2.3, back, 0, 0.8, true); bu('timber', 0.45, back - 1.05, 2.35, back + 0.0, 0.8, 0.85);       // the kneading trough
      wallShelves(0.6, L * 0.55, 3, { step: 0.55, put: (u, v, ya) => { bu('wood_ochre', u - 0.2, v - 0.1, u + 0.2, v + 0.1, ya, ya + 0.14); } });
      for (let k = 0; k < 4; k++) sack(L - 0.7 - k * 0.5, 3.6 + (k % 2) * 0.3);
      ru('timber', [L - 3.3, 1.2, back - 2.5], [L - 3.3, 2.9, back - 2.5 + 0.0], 0.03, 5); bu('wood_dark', L - 3.35, back - 3.5, L - 3.2, back - 2.8, 0.9, 2.1);   // the peel against the wall
      break;
    }
    case 'tavern': {
      for (let k = 0; k < 3; k++) for (const v of [2.0, 3.6]) { const u = 0.9 + k * 2.1; if (u > L - 3.2) continue; table(u, v, 1.4, 0.7, 0.78); for (const s of [-1, 1]) bu('timber', u - 0.7, v + s * 0.55 - 0.13, u + 0.7, v + s * 0.55 + 0.13, 0.42, 0.46, true); bu('pottery_dark', u - 0.3, v - 0.05, u - 0.18, v + 0.05, 0.78, 0.9); jar('glaze_white', u + 0.25, v, 0.78, 0.05, 0.12); }
      counter(0.4, L * 0.7, back - 1.8, 1.05); for (let u = 0.8; u < L * 0.65; u += 0.5) jar('pottery_dark', u, back - 1.5, 1.05, 0.07, 0.26);
      for (let k = 0; k < 3; k++) cask(0.9 + k * 1.1, back - 0.45, 0.25, 1.0, 0.36);
      bu('wood_dark', 0.4, back - 0.35, L * 0.4, back, 0, 0.25); hearth(L - 1.6, 1.8);
      for (let k = 0; k < 5; k++) { lu('hide_brown', [[0.001, 0], [0.09, 0.04], [0.1, 0.2], [0.05, 0.34], [0.001, 0.38]], L - 3.2 + k * 0.45, back - 1.2, CH - 0.8, 8); ru('wood_dark', [L - 3.2 + k * 0.45, CH - 0.4, back - 1.2], [L - 3.2 + k * 0.45, CH, back - 1.2], 0.008, 3); }
      common(); break;
    }
    case 'draper': {
      counter(0.5, L * 0.66, 2.0); bu('gilt_bronze', 0.7, 2.1, L * 0.5, 2.18, 1.05, 1.08);    // the ell rod laid along the counter
      for (let r = 0; r < 4; r++) for (let u = 0.7; u < L - 1.6; u += 0.5) { const mat = pickOf(rand, ['cloth_red', 'cloth_indigo', 'cloth_green', 'cloth_ochre', 'cloth_white', 'cloth_brown', 'cloth_blue', 'cloth_maroon']); bu(mat, u, back - 0.45, u + 0.44, back - 0.04, 0.15 + r * 0.5, 0.15 + r * 0.5 + 0.38, r === 0); }
      for (let r = 0; r < 4; r++) bu('wood_dark', 0.5, back - 0.5, L - 1.4, back - 0.02, r * 0.5 + 0.1, r * 0.5 + 0.15);
      chair(L * 0.3, 3.3); table(L * 0.3 + 0.9, 3.4, 0.6, 0.6, 0.65); common(); break;
    }
    case 'apothecary': {
      counter(0.5, L * 0.62, 2.0); lu('bronze', [[0.001, 0], [0.12, 0.02], [0.14, 0.1], [0.1, 0.14], [0.001, 0.14]], 1.0, 2.3, 1.05, 10); lu('bronze', [[0.001, 0], [0.07, 0.3], [0.001, 0.32]], 1.7, 2.3, 1.05, 6);   // mortar and pestle
      ru('bronze', [2.2, 1.9, 2.3], [3.0, 1.9, 2.3], 0.012, 4); ru('iron', [2.6, 1.9, 2.3], [2.6, CH, 2.3], 0.008, 4); lu('bronze', [[0.001, 0], [0.12, 0.01], [0.001, 0.03]], 2.2, 2.3, 1.85, 8); lu('bronze', [[0.001, 0], [0.12, 0.01], [0.001, 0.03]], 3.0, 2.3, 1.85, 8);   // the scales
      wallShelves(0.5, L - 1.4, 4, { step: 0.28, put: (u, v, ya) => jar(pickOf(rand, ['glaze_white', 'glaze_blue', 'pottery_dark', 'glaze_green']), u, v, ya, 0.07, 0.2 + rand() * 0.1) });
      for (let k = 0; k < 6; k++) { ru('iron', [1.0 + k * 0.7, CH, 3.4], [1.0 + k * 0.7, CH - 0.5, 3.4], 0.006, 3); lu('lotus_leaf', [[0.001, 0], [0.1, 0.05], [0.07, 0.4], [0.001, 0.46]], 1.0 + k * 0.7, 3.4, CH - 0.95, 6); }   // herbs hung to dry
      lu('bronze', [[0.3, 0], [0.38, 0.4], [0.3, 0.8], [0.12, 1.0], [0.001, 1.2]], L - 1.4, back - 0.8, 0, 10); bu('brick', L - 1.9, back - 1.3, L - 0.9, back - 0.3, 0, 0.25);  // the still
      ru('hide_tan', [L * 0.3, CH - 0.6, 3.6], [L * 0.3 + 1.0, CH - 0.85, 3.6], 0.12, 8);                   // the stuffed crocodile of an apothecary's ceiling
      common(); break;
    }
    case 'cobbler': {
      counter(0.5, L * 0.5, 2.0, 0.9); for (let k = 0; k < 6; k++) { bu('hide_brown', 0.7 + k * 0.38, 2.15, 0.7 + k * 0.38 + 0.14, 2.45, 0.95, 1.05); bu('hide_black', 0.7 + k * 0.38, 2.15, 0.7 + k * 0.38 + 0.12, 2.3, 1.05, 1.13); }
      wallShelves(0.5, L - 1.4, 3, { step: 0.34, put: (u, v, ya) => { bu(pickOf(rand, ['hide_brown', 'hide_black', 'hide_tan']), u - 0.12, v - 0.14, u + 0.12, v + 0.0, ya, ya + 0.18); } });
      stool(L * 0.45, 3.4, 0.38); bu('wood_dark', L * 0.45 + 0.4, 3.0, L * 0.45 + 1.3, 3.7, 0, 0.7, true); for (let k = 0; k < 4; k++) lu('timber', [[0.04, 0], [0.06, 0.1], [0.03, 0.22], [0.001, 0.24]], L * 0.45 + 0.6 + k * 0.18, 3.35, 0.7, 6);
      bu('hide_brown', L - 1.6, back - 0.9, L - 0.6, back - 0.1, 0, 0.5); bu('hide_tan', L - 1.5, back - 0.8, L - 0.7, back - 0.2, 0.5, 0.6); common(); break;
    }
    case 'barber': {
      // the perruquier-barber: wigs on blocks along the wall, the chair with its headrest, the basin and the mirror
      for (let k = 0; k < 7; k++) { const u = 0.7 + k * 0.62; if (u > L - 1.6) break; lu('wood_painted', [[0.001, 0], [0.07, 0.05], [0.09, 0.2], [0.06, 0.28], [0.001, 0.3]], u, back - 0.25, 1.35, 8); lu(pickOf(rand, ['hair_dark', 'hide_brown', 'hide_tan', 'hide_white']), [[0.001, 0.02], [0.18, 0.1], [0.24, 0.4], [0.2, 0.7], [0.12, 0.76], [0.001, 0.4]], u, back - 0.25, 1.28, 9); bu('wood_dark', u - 0.2, back - 0.35, u + 0.2, back, 1.15, 1.2); }
      bu('wood_dark', 0.5, back - 0.35, L - 1.4, back, 0.0, 1.15, false);
      bu('mirror_tin', L * 0.35, back - 0.03, L * 0.35 + 0.8, back, 1.3, 2.3); bu('gilt_bronze', L * 0.35 - 0.05, back - 0.05, L * 0.35 + 0.85, back - 0.03, 1.25, 2.35);
      chair(L * 0.45, 3.4, -1); bu('wood_dark', L * 0.45 - 0.2, 3.5, L * 0.45 + 0.2, 3.58, 0.95, 1.4); bu('wood_dark', L * 0.45 + 0.7, 3.2, L * 0.45 + 1.1, 3.6, 0, 0.85, true); lu('bronze', [[0.001, 0], [0.2, 0.01], [0.24, 0.08], [0.001, 0.1]], L * 0.45 + 0.9, 3.4, 0.85, 10);
      counter(0.5, L * 0.4, 2.0, 0.85); common(); break;
    }
    case 'cutler': {
      counter(0.5, L * 0.62, 2.0); for (let k = 0; k < 10; k++) { bu('silver', 0.8 + k * 0.28, 2.1, 0.82 + k * 0.28, 2.5, 1.05, 1.06); bu('wood_dark', 0.8 + k * 0.28, 2.5, 0.84 + k * 0.28, 2.65, 1.05, 1.07); }
      for (let r = 0; r < 3; r++) for (let k = 0; k < 14; k++) { const u = 0.6 + k * 0.3; if (u > L - 1.8) break; bu('silver', u, back - 0.06, u + 0.025, back, 0.9 + r * 0.45, 1.2 + r * 0.45); bu('wood_dark', u, back - 0.06, u + 0.03, back, 0.8 + r * 0.45, 0.9 + r * 0.45); }
      // the grinding wheel on its frame, a trough of water under it
      bu('timber', L - 2.4, back - 1.6, L - 0.8, back - 1.4, 0, 0.8); bu('timber', L - 2.4, back - 0.8, L - 0.8, back - 0.6, 0, 0.8); ru('granite_grey', [L - 1.6, 0.85, back - 1.5], [L - 1.6, 0.85, back - 0.7], 0.0, 4); lu('granite_grey', [[0.45, 0], [0.45, 0.1], [0.001, 0.1]], L - 1.6, back - 1.1, 0.8, 16);
      bu('wood_dark', L - 2.2, back - 1.5, L - 1.0, back - 0.7, 0.8, 0.85); bu('iron', L - 3.4, back - 0.8, L - 2.8, back - 0.3, 0, 0.55, true); bu('iron', L - 3.5, back - 0.9, L - 2.7, back - 0.2, 0.55, 0.65);   // the anvil
      common(); break;
    }
    case 'vintner': {
      for (let k = 0; k < 4; k++) { cask(0.9 + k * 1.15, back - 0.45, 0, 1.0, 0.36); cask(0.9 + k * 1.15, back - 0.45, 0.72, 1.0, 0.36); }
      for (let k = 0; k < 3; k++) barrel(0.7 + k * 0.75, 4.0, 0, 0.32, 0.85);
      counter(0.5, L * 0.6, 2.0); for (let u = 0.8; u < L * 0.58; u += 0.32) jar('glaze_green', u, 2.3, 1.05, 0.05, 0.3);
      table(L * 0.35, 3.4, 1.2, 0.7, 0.8); for (const s of [-1, 1]) stool(L * 0.35 + s * 0.5, 3.4 + 0.7); lu('bronze', [[0.001, 0], [0.12, 0.0], [0.04, 0.12], [0.03, 0.2], [0.001, 0.2]], L * 0.35, 3.4, 0.8, 8);
      common(); break;
    }
    case 'bookseller': {
      for (let r = 0; r < 5; r++) { bu('wood_dark', 0.5, back - 0.3, L - 1.4, back, 0.3 + r * 0.42 - 0.03, 0.3 + r * 0.42); books(0.55, L - 1.45, back, 0.3 + r * 0.42, 0.34); }
      table(L * 0.4, 2.6, 2.2, 0.9, 0.85, 'timber'); bu('cloth_red', L * 0.4 - 0.9, 2.3, L * 0.4 + 0.9, 2.9, 0.85, 0.87);
      for (let k = 0; k < 6; k++) bu(pickOf(rand, ['cloth_brown', 'cloth_indigo', 'hide_tan', 'cloth_red']), L * 0.4 - 0.8 + k * 0.3, 2.35, L * 0.4 - 0.55 + k * 0.3, 2.75, 0.87, 0.87 + 0.05 + (k % 3) * 0.04);
      bu('wood_dark', L * 0.4 + 0.4, 3.6, L * 0.4 + 0.85, 3.9, 0, 1.2); bu('paint_white', L * 0.4 + 0.42, 3.62, L * 0.4 + 0.83, 3.88, 1.2, 1.22); chair(L * 0.4 - 0.7, 3.6, -1);
      lu('wood_ochre', [[0.001, 0], [0.18, 0.12], [0.2, 0.3], [0.12, 0.45], [0.001, 0.48]], L * 0.4 - 0.6, 2.6, 0.87, 12);                  // a globe
      common(); break;
    }
    case 'butcher': {
      bu('marble', 0.5, 2.0, L * 0.62, 2.7, 0.0, 0.95, true); bu('marble_smooth', 0.45, 1.95, L * 0.62 + 0.05, 2.75, 0.95, 1.0);
      for (let k = 0; k < 4; k++) bu('cloth_red', 0.8 + k * 0.7, 2.2, 0.8 + k * 0.7 + 0.4, 2.5, 1.0, 1.1);
      ru('iron', [0.5, CH - 0.1, 3.6], [L - 1.4, CH - 0.1, 3.6], 0.025, 5); ru('iron', [0.5, CH - 0.1, 4.6], [L - 1.4, CH - 0.1, 4.6], 0.025, 5);
      for (let k = 0; k < 6; k++) for (const v of [3.6, 4.6]) { const u = 0.8 + k * 1.0; if (u > L - 1.6) break; ru('iron', [u, CH - 0.1, v], [u, CH - 0.4, v], 0.008, 3); lu(k % 2 ? 'cloth_red' : 'hide_tan', [[0.001, 0], [0.14, 0.1], [0.19, 0.5], [0.12, 0.95], [0.001, 1.1]], u, v, CH - 1.5, 8); }
      lu('wood_dark', [[0.3, 0], [0.3, 0.8], [0.001, 0.8]], L * 0.3, 4.2, 0, 10);                                                    // the block
      for (let k = 0; k < 8; k++) lu('cloth_red', [[0.001, 0], [0.04, 0.02], [0.04, 0.5], [0.001, 0.52]], 1.0 + k * 0.45, back - 0.3, CH - 0.6, 5);   // sausages
      common(); break;
    }
    case 'hatter': {
      counter(0.5, L * 0.58, 2.0); for (let k = 0; k < 5; k++) { lu('cloth_black', [[0.2, 0], [0.32, 0.0], [0.32, 0.02], [0.12, 0.05], [0.12, 0.22], [0.001, 0.24]], 0.9 + k * 0.62, 2.3, 1.05, 12); }
      for (let r = 0; r < 4; r++) for (let u = 0.6; u < L - 1.6; u += 0.5) { const ya = 0.6 + r * 0.5; if (u === 0.6) bu('wood_dark', 0.5, back - 0.32, L - 1.4, back, ya - 0.03, ya); lu(r % 2 ? 'cloth_black' : 'cloth_brown', [[0.12, 0], [0.11, 0.18], [0.001, 0.2]], u + 0.1, back - 0.18, ya, 8); lu('wood_painted', [[0.18, 0], [0.18, 0.02], [0.001, 0.02]], u + 0.1, back - 0.18, ya + 0.1, 8); }
      bu('mirror_tin', L * 0.5, back - 0.03, L * 0.5 + 0.7, back, 1.2, 2.2); stool(L * 0.45, 3.4); common(); break;
    }
    case 'chandler': {
      counter(0.5, L * 0.6, 2.0); for (let k = 0; k < 8; k++) bu('paint_white', 0.8 + k * 0.28, 2.2, 0.83 + k * 0.28, 2.25, 1.05, 1.3);
      for (let r = 0; r < 4; r++) { bu('wood_dark', 0.5, back - 0.32, L - 1.4, back, 0.6 + r * 0.5, 0.64 + r * 0.5); for (let u = 0.6; u < L - 1.6; u += 0.2) bu('paint_white', u, back - 0.2, u + 0.05, back - 0.15, 0.64 + r * 0.5, 0.64 + r * 0.5 + 0.3 + rand() * 0.04); }
      for (let k = 0; k < 6; k++) { ru('wood_dark', [0.8 + k * 0.8, CH, 3.5], [0.8 + k * 0.8, CH - 0.35, 3.5], 0.01, 3); for (let j = 0; j < 5; j++) ru('paint_white', [0.7 + k * 0.8 + j * 0.05, CH - 0.35, 3.5], [0.7 + k * 0.8 + j * 0.05, CH - 0.8, 3.5], 0.02, 5); }
      lu('pottery_dark', [[0.4, 0], [0.5, 0.3], [0.45, 0.8], [0.001, 0.8]], L - 1.4, back - 1.0, 0, 12);                                // the tallow vat
      for (let k = 0; k < 3; k++) bu('cloth_white', L - 2.8, back - 2.0 + k * 0.3, L - 2.4, back - 1.8 + k * 0.3, 0, 0.18);
      common(); break;
    }
    // ── the service yards of the gardens (docs/settlements/versailles.md §5d): the gardeners', fountain-keepers', sculptors', joiners' and guards' rooms ──
    case 'gardener': {
      // the head gardener's lodge: table and stools, the hearth, a bed; his tools on the wall, onions and herbs hung from the beams, bulbs in sacks, a basket of apples
      table(L * 0.4, D * 0.42, 1.5, 0.8, 0.78); for (const [a, c2] of [[-0.95, 0], [0.95, 0], [0, 0.65]]) stool(L * 0.4 + a, D * 0.42 + c2);
      lu('glaze_white', [[0.001, 0], [0.1, 0.01], [0.12, 0.1], [0.07, 0.16], [0.001, 0.16]], L * 0.4 - 0.2, D * 0.42, 0.78, 8); lu('pottery_dark', [[0.001, 0], [0.09, 0], [0.1, 0.12], [0.06, 0.2], [0.001, 0.2]], L * 0.4 + 0.3, D * 0.42, 0.78, 8);
      hearth(L - 1.7); bed(0.9, back - 2.1);
      for (let k = 0; k < 7; k++) { const u = 2.2 + k * 0.42; if (u > L - 3.0) break; ru('wood_dark', [u, 0.1, back - 0.1], [u, 1.95, back - 0.1], 0.02, 4); bu('iron', u - (k % 3 === 0 ? 0.2 : 0.12), back - 0.15, u + (k % 3 === 0 ? 0.2 : 0.12), back - 0.07, 1.9, 1.96); }
      ru('wood_dark', [2.0, 1.1, back - 0.06], [L - 3.0, 1.1, back - 0.06], 0.015, 4);
      for (let k = 0; k < 6; k++) { const u = 1.0 + k * 0.9; if (u > L - 2.6) break; ru('rope_fibre', [u, CH, 3.0 + (k % 2) * 0.8], [u, CH - 0.5, 3.0 + (k % 2) * 0.8], 0.01, 3); lu(k % 2 ? 'cloth_ochre' : 'lotus_leaf', [[0.001, 0], [0.09, 0.05], [0.1, 0.2], [0.001, 0.32]], u, 3.0 + (k % 2) * 0.8, CH - 0.82, 7); }
      for (let k = 0; k < 3; k++) sack(0.5 + k * 0.45, 4.1 + (k % 2) * 0.35);
      lu('wicker', [[0.001, 0], [0.22, 0.01], [0.3, 0.2], [0.28, 0.24], [0.001, 0.24]], 1.9, 4.2, 0, 10); lu('paint_ochre', [[0.001, 0.12], [0.2, 0.18], [0.001, 0.3]], 1.9, 4.2, 0.1, 8);
      lu('pottery_dark', [[0.12, 0], [0.18, 0.2], [0.16, 0.3], [0.001, 0.3]], L - 0.6, 3.2, 0, 8);       // a watering pot
      common(); break;
    }
    case 'tools': {
      // the tool house: barrows, ladders, stacked flower pots, racks of spades and shears, seed sacks, stakes and a bench
      counter(0.5, L * 0.5, 2.0, 0.9);
      for (let k = 0; k < 5; k++) lu('terracotta', [[0.001, 0], [0.12, 0], [0.18, 0.2], [0.001, 0.2]], 0.9 + k * 0.55, 2.3, 0.9, 8);
      for (let r = 0; r < 3; r++) for (let k = 0; k < 4 - r; k++) lu('terracotta', [[0.001, 0], [0.15, 0], [0.22, 0.26], [0.001, 0.26]], 0.7 + k * 0.5 + r * 0.25, back - 0.4, r * 0.26, 8);
      for (let k = 0; k < 2; k++) { const u = L * 0.35 + k * 1.9, v = 4.2; bu('wood_dark', u - 0.4, v - 0.55, u + 0.4, v + 0.2, 0.35, 0.6, true); lu('timber', [[0.3, 0], [0.3, 0.06], [0.001, 0.06]], u, v - 0.7, 0.05, 12); ru('wood_dark', [u - 0.25, 0.6, v + 0.2], [u - 0.2, 0.9, v + 1.1], 0.02, 4); ru('wood_dark', [u + 0.25, 0.6, v + 0.2], [u + 0.2, 0.9, v + 1.1], 0.02, 4); }
      for (let k = 0; k < 8; k++) { const u = 1.2 + k * 0.4; if (u > L * 0.75) break; ru('wood_dark', [u, 0.1, back - 0.1], [u, 1.9, back - 0.1], 0.02, 4); bu('iron', u - 0.1, back - 0.14, u + 0.1, back - 0.07, 1.8, 1.95); }
      for (const sg of [0, 1]) { ru('wood_dark', [L - 0.9 - sg * 0.4, 0, back - 0.4], [L - 1.3 - sg * 0.4, 2.3, back - 0.9], 0.03, 4); }
      for (let k = 0; k < 6; k++) bu('wood_dark', L - 1.2 - 0.04 * k, back - 0.9 + k * 0.1, L - 0.85, back - 0.86 + k * 0.1, 0.3 + k * 0.35, 0.34 + k * 0.35);
      for (let k = 0; k < 4; k++) sack(1.0 + k * 0.5, back - 1.2); for (let k = 0; k < 10; k++) ru('timber', [0.5 + k * 0.06, 0, back - 2.2], [0.5 + k * 0.06, 1.1, back - 2.2], 0.02, 4);
      common(); break;
    }
    case 'sculptor': {
      // the sculptors' atelier: blocks of marble, a figure half out of its block, plaster casts on stands, the bench of chisels and mallets, a model in clay
      for (const [u, v, w, d, h] of [[1.6, back - 1.3, 1.5, 1.1, 1.4], [L - 3.6, back - 1.2, 1.2, 1.0, 1.0], [3.4, back - 1.1, 1.0, 0.9, 0.7]]) { bu('marble', u - w / 2, v - d / 2, u + w / 2, v + d / 2, 0, h, true); bu('marble_smooth', u - w / 2 + 0.05, v - d / 2 + 0.05, u + w / 2 - 0.05, v + d / 2 - 0.05, h, h + 0.02); }
      bu('timber', L * 0.5 - 0.7, 3.6, L * 0.5 + 0.7, 4.8, 0, 0.45, true);                                    // the stand, and on it the figure being carved
      lu('marble_smooth', [[0.001, 0], [0.3, 0.02], [0.3, 0.6], [0.34, 0.9], [0.22, 1.1], [0.13, 1.2], [0.11, 1.4], [0.13, 1.55], [0.1, 1.68], [0.001, 1.72]], L * 0.5, 4.2, 0.45, 12);
      lu('marble', [[0.001, 0], [0.38, 0], [0.38, 0.55], [0.001, 0.55]], L * 0.5, 4.2, 0.45, 8);
      for (let k = 0; k < 4; k++) { const u = 0.8 + k * 0.7; bu('wood_dark', u - 0.2, 2.5, u + 0.2, 2.9, 0, 1.2 + (k % 2) * 0.1, true); lu('plaster_white', [[0.001, 0], [0.12, 0.02], [0.16, 0.2], [0.12, 0.32], [0.001, 0.34]], u, 2.7, 1.2 + (k % 2) * 0.1, 8); }
      counter(L * 0.5 + 1.2, L - 2.4, 3.3, 0.9); for (let k = 0; k < 8; k++) { bu('iron', L * 0.5 + 1.4 + k * 0.28, 3.45, L * 0.5 + 1.45 + k * 0.28, 3.75, 0.95, 0.96 + 0.01); bu('wood_dark', L * 0.5 + 1.4 + k * 0.28, 3.75, L * 0.5 + 1.47 + k * 0.28, 3.9, 0.95, 0.98); }
      wallShelves(0.5, L * 0.45, 2, { step: 0.4, put: (u, v, ya) => lu('plaster_white', [[0.001, 0], [0.1, 0.02], [0.12, 0.14], [0.08, 0.24], [0.001, 0.26]], u, v, ya, 8) });
      bu('wood_dark', L - 1.6, back - 2.2, L - 0.5, back - 1.4, 0, 0.8, true); lu('pottery_dark', [[0.001, 0], [0.22, 0], [0.26, 0.18], [0.001, 0.26]], L - 1.05, back - 1.8, 0.8, 9);   // the clay
      bu('cloth_white', 1.0, back - 0.04, 2.6, back, 1.1, 2.0); bu('wood_dark', 0.95, back - 0.06, 2.65, back - 0.04, 1.05, 2.05);   // a drawing pinned on a board
      bu('plaster_white', L * 0.5 - 1.4, 3.4, L * 0.5 + 1.4, 5.0, 0.0, 0.02);                              // the dust on the floor
      common(); break;
    }
    case 'guard': {
      // the Cent-Suisses' guardroom: benches and a table with the dice, the halberds in their rack, a drum, coats and helmets on pegs, bunks, a stove
      table(L * 0.45, D * 0.4, 1.8, 0.8, 0.78); for (const s of [-1, 1]) bu('timber', L * 0.45 - 0.9, D * 0.4 + s * 0.65 - 0.13, L * 0.45 + 0.9, D * 0.4 + s * 0.65 + 0.13, 0.42, 0.46, true);
      for (let k = 0; k < 3; k++) bu('paint_white', L * 0.45 - 0.5 + k * 0.4, D * 0.4 - 0.1, L * 0.45 - 0.42 + k * 0.4, D * 0.4 - 0.02, 0.78, 0.84); lu('pottery_dark', [[0.001, 0], [0.07, 0], [0.08, 0.12], [0.001, 0.14]], L * 0.45 + 0.6, D * 0.4 + 0.1, 0.78, 8);
      bu('wood_dark', 0.5, back - 0.45, 3.4, back, 0, 0.1); for (let k = 0; k < 6; k++) { const u = 0.8 + k * 0.45; ru('wood_dark', [u, 0.1, back - 0.2], [u, 2.3, back - 0.2], 0.018, 4); bu('iron', u - 0.1, back - 0.3, u + 0.1, back - 0.12, 2.1, 2.3); bu('iron', u - 0.02, back - 0.3, u + 0.02, back - 0.12, 2.3, 2.45); }
      lu('wood_painted', [[0.001, 0], [0.3, 0.02], [0.32, 0.3], [0.001, 0.32]], 4.4, back - 0.8, 0, 12); lu('cloth_white', [[0.001, 0.32], [0.3, 0.32], [0.001, 0.33]], 4.4, back - 0.8, 0, 12);   // the drum
      for (let k = 0; k < 4; k++) { const u = 5.4 + k * 0.7; if (u > L - 3.2) break; bu(['cloth_red', 'cloth_blue', 'cloth_white', 'cloth_red'][k], u, back - 0.08, u + 0.5, back - 0.02, 0.9, 1.9); lu('iron', [[0.001, 0], [0.12, 0], [0.13, 0.08], [0.001, 0.16]], u + 0.25, back - 0.2, 1.9, 8); }
      bed(L - 1.1, 1.6); bu('wood_dark', L - 1.9, 1.6, L - 0.3, 3.7, 1.3, 1.35);                                     // a bunk over a bed
      hearth(L * 0.45 + 3.0, 1.4);
      common(); break;
    }
    case 'fountain': {
      // the fontainiers' room: the plan of the waterworks on the table, lead pipes in racks, bronze jets and cocks, the lead-melting furnace, coils of leather hose
      table(L * 0.4, D * 0.4, 2.2, 1.0, 0.82); bu('cloth_white', L * 0.4 - 1.05, D * 0.4 - 0.45, L * 0.4 + 1.05, D * 0.4 + 0.45, 0.82, 0.835);
      for (const [a, b2] of [[-0.8, -0.3], [-0.2, 0.2], [0.4, -0.1], [0.8, 0.3]]) bu('prussian_blue', L * 0.4 + a, D * 0.4 + b2, L * 0.4 + a + 0.5, D * 0.4 + b2 + 0.04, 0.835, 0.84);
      for (let k = 0; k < 4; k++) ru('lead', [0.6, 0.15 + k * 0.2, back - 0.3 - (k % 2) * 0.2], [L * 0.5, 0.15 + k * 0.2, back - 0.3 - (k % 2) * 0.2], 0.09, 8);
      for (let k = 0; k < 5; k++) { const u = 1.0 + k * 0.5; lu('bronze', [[0.001, 0], [0.05, 0], [0.04, 0.12], [0.07, 0.2], [0.03, 0.34], [0.001, 0.36]], u, back - 0.3, 1.0, 8); }
      bu('wood_dark', 0.5, back - 0.5, L * 0.5 + 0.5, back, 0.0, 1.0, true);
      bu('brick', L - 2.6, back - 1.6, L - 0.6, back - 0.4, 0, 0.9, true); lu('iron', [[0.5, 0], [0.55, 0.12], [0.001, 0.12]], L - 1.6, back - 1.0, 0.9, 10); bu('flame', L - 1.9, back - 1.3, L - 1.3, back - 0.7, 0.9, 1.0);   // the lead pot
      for (let k = 0; k < 3; k++) lu('hide_brown', [[0.001, 0], [0.3, 0], [0.32, 0.12], [0.001, 0.14]], L - 1.0 - k * 0.1, 4.2 + k * 0.1, k * 0.14, 12);        // coils of hose
      barrel(L * 0.6, back - 0.5); barrel(L * 0.6 + 0.8, back - 0.5);
      for (let k = 0; k < 3; k++) lu('bronze', [[0.001, 0], [0.5, 0.05], [0.5, 0.14], [0.001, 0.14]], 1.2 + k * 0.7, 4.3, 0, 12);         // basins' covers
      common(); break;
    }
    case 'orangery': {
      // the tub store: orange trees in their green boxes wintering, a stove, watering cans, pruning tools, straw mats and soil sacks
      for (let k = 0; k < 6; k++) { const u = 1.2 + (k % 3) * 1.9, v = 3.4 + Math.floor(k / 3) * 2.2; if (u > L - 3.2) continue; bu('shutter_green', u - 0.4, v - 0.4, u + 0.4, v + 0.4, 0, 0.7, true); bu('paint_white', u - 0.42, v - 0.42, u + 0.42, v - 0.38, 0.6, 0.7); ru('bark_dark', [u, 0.7, v], [u, 1.5, v], 0.05, 6); lu('lotus_leaf', [[0.001, 0], [0.45, 0.2], [0.55, 0.55], [0.4, 0.95], [0.001, 1.05]], u, v, 1.3, 9); for (const [a, c2] of [[0.25, 0.1], [-0.2, 0.3], [0.1, -0.35]]) lu('paint_ochre', [[0.001, 0], [0.08, 0.05], [0.001, 0.14]], u + a, v + c2, 1.7, 6); }
      counter(0.5, L * 0.5, 2.0, 0.9); for (let k = 0; k < 4; k++) lu('pottery_dark', [[0.12, 0], [0.18, 0.2], [0.16, 0.3], [0.001, 0.3]], 0.9 + k * 0.5, 2.3, 0.9, 8);
      bu('iron', L - 1.9, back - 1.5, L - 0.6, back - 0.4, 0, 1.2, true); ru('iron', [L - 1.2, 1.2, back - 0.9], [L - 1.2, CH, back - 0.9], 0.07, 8); bu('flame', L - 1.4, back - 1.5, L - 1.0, back - 1.46, 0.3, 0.5);   // the stove and its pipe
      for (let k = 0; k < 4; k++) bu('reed_mat', 0.5, back - 1.4 + k * 0.0, 2.3, back - 0.2, k * 0.08, k * 0.08 + 0.07);
      for (let k = 0; k < 3; k++) sack(3.0 + k * 0.5, back - 0.6, 'sacking');
      ru('wood_dark', [L * 0.5, 1.0, back - 0.06], [L - 2.2, 1.0, back - 0.06], 0.015, 4); for (let k = 0; k < 5; k++) { bu('iron', L * 0.5 + 0.2 + k * 0.3, back - 0.12, L * 0.5 + 0.3 + k * 0.3, back - 0.06, 0.55, 1.0); }
      common(); break;
    }
    case 'bearers': {
      // the chair-bearers' room: the sedan chairs in blue, their poles and straps on the wall, the bearers' blue coats, a bench and a small stove
      for (const [u, v] of [[1.7, 3.6], [L - 1.7, 3.6]]) {
        bu('paint_blue', u - 0.45, v - 0.45, u + 0.45, v + 0.45, 0.45, 1.5, true); bu('cloth_white', u - 0.3, v - 0.4, u + 0.3, v - 0.44 + 0.01, 0.7, 1.35); bu('gilt_bronze', u - 0.47, v - 0.47, u + 0.47, v - 0.45, 1.46, 1.52);
        bu('paint_blue', u - 0.5, v - 0.5, u + 0.5, v + 0.5, 1.5, 1.6); bu('opening', u - 0.3, v - 0.46, u + 0.3, v - 0.44, 0.75, 1.35); bu('cloth_red', u - 0.4, v - 0.4, u + 0.4, v + 0.4, 0.4, 0.46);
        for (const sg of [-1, 1]) ru('wood_dark', [u + sg * 0.55, 0.75, v - 1.1], [u + sg * 0.55, 0.75, v + 1.1], 0.03, 5);
      }
      for (let k = 0; k < 4; k++) { const u = L * 0.5 - 1.5 + k * 1.0; ru('wood_dark', [u, 0.1, back - 0.1], [u, 1.8, back - 0.1], 0.015, 4); bu(k % 2 ? 'cloth_blue' : 'cloth_indigo', u - 0.28, back - 0.1, u + 0.28, back - 0.04, 0.8, 1.7); }
      bu('timber', 0.5, back - 0.5, L - 0.5, back, 0.42, 0.46, true); bu('wood_dark', 0.5, back - 0.5, 0.6, back, 0, 0.42); bu('wood_dark', L - 0.6, back - 0.5, L - 0.5, back, 0, 0.42);
      for (let k = 0; k < 2; k++) lu('glass_lamp', [[0.001, 0], [0.09, 0.05], [0.1, 0.2], [0.001, 0.26]], 0.9 + k * (L - 1.8), 6.4, 1.0, 8);
      hearth(L * 0.5, 1.4);
      common(); break;
    }
    case 'joiner': {
      // the joiner's shop: a bench with its vice, planks stacked to dry, garden trellis and tubs in the making, a foot lathe, saws and planes on the wall
      counter(0.5, L * 0.55, 2.0, 0.9); bu('iron', 1.2, 2.1, 1.5, 2.4, 0.9, 1.0); for (let k = 0; k < 4; k++) bu('wood_ochre', 2.2 + k * 0.4, 2.2, 2.5 + k * 0.4, 2.5, 0.9, 0.97 + k * 0.02);
      for (let k = 0; k < 7; k++) bu(k % 2 ? 'wood_ochre' : 'timber', 0.5, back - 1.0 + (k % 2) * 0.0, L * 0.4, back - 0.1, k * 0.09, k * 0.09 + 0.08);
      for (let k = 0; k < 3; k++) { const u = L * 0.55 + k * 1.1; ru('timber', [u, 0, 4.4], [u + 0.4, 2.0, 4.0], 0.03, 4); }
      for (let k = 0; k < 3; k++) bu('lattice', L * 0.55, back - 0.5 - k * 0.12, L * 0.55 + 2.4, back - 0.46 - k * 0.12, 0.0, 1.8 - 0.1 * k);
      bu('wood_dark', L - 2.6, 3.3, L - 1.0, 3.6, 0.65, 0.7, true); for (const sx of [0, 1]) bu('wood_dark', L - 2.6 + sx * 1.5, 3.3, L - 2.5 + sx * 1.5, 3.6, 0, 0.65); lu('timber', [[0.001, 0], [0.4, 0], [0.4, 0.06], [0.001, 0.06]], L - 1.0, 3.5, 0.3, 12);
      ru('wood_dark', [0.9, 1.1, back - 0.06], [L * 0.45, 1.1, back - 0.06], 0.015, 4); for (let k = 0; k < 7; k++) bu('iron', 1.0 + k * 0.4, back - 0.12, 1.4 + k * 0.4, back - 0.06, 1.15, 1.9 - (k % 2) * 0.3);
      barrel(L - 1.2, 5.8, 0, 0.3, 0.8); barrel(L - 0.6, 5.2, 0, 0.3, 0.8);
      bu('wood_ochre', L * 0.3, 3.4, L * 0.3 + 2.0, 4.2, 0, 0.02);                                              // shavings
      common(); break;
    }
    case 'hotel': {
      // the vestibule of a hotel particulier: marble floor, a long table with chairs, the hearth with its mirror, hung pictures
      table(L / 2, D * 0.45, 3.0, 1.0, 0.85, 'lacquer_chestnut'); bu('cloth_red', L / 2 - 1.5, D * 0.45 - 0.5, L / 2 + 1.5, D * 0.45 + 0.5, 0.85, 0.87);
      for (let k = 0; k < 4; k++) for (const s of [-1, 1]) chair(L / 2 - 1.1 + k * 0.75, D * 0.45 + s * 0.85, -s);
      hearth(L / 2, 2.0); bu('mirror_tin', L / 2 - 0.7, back - 0.04, L / 2 + 0.7, back, 2.15, 2.9); bu('gilt_bronze', L / 2 - 0.78, back - 0.06, L / 2 + 0.78, back - 0.04, 2.1, 2.95);
      for (const u of [1.2, L - 2.6]) { bu('cloth_indigo', u, back - 0.06, u + 1.4, back, 1.0, 2.4); bu('gilt_bronze', u - 0.06, back - 0.08, u + 1.46, back - 0.06, 0.95, 2.45); }
      lamp(L * 0.3, D * 0.5); lamp(L * 0.7, D * 0.5); for (const u of [1.0, L - 1.0]) lu('glaze_blue', [[0.12, 0], [0.22, 0.2], [0.2, 0.55], [0.1, 0.7], [0.001, 0.72]], u, 1.6, 0, 10);
      break;
    }
    default: {
      // a home: the table and stools, the hearth, the bed with its curtains, a dresser, a spinning wheel, a cradle
      table(L * 0.45, D * 0.45, 1.3, 0.8, 0.78); for (const [a, c2] of [[-0.9, 0], [0.9, 0], [0, -0.65], [0, 0.65]]) stool(L * 0.45 + a, D * 0.45 + c2);
      jar('terracotta', L * 0.45 - 0.2, D * 0.45, 0.78, 0.09, 0.3); jar('glaze_white', L * 0.45 + 0.25, D * 0.45 - 0.1, 0.78, 0.1, 0.06);
      hearth(L - 1.7); bed(0.9, back - 2.1); buffet(L * 0.4, back - 0.5);
      lu('wood_dark', [[0.28, 0], [0.28, 0.05], [0.001, 0.05]], 1.0, 1.5, 0.0, 10); lu('timber', [[0.02, 0], [0.02, 0.9]], 1.0, 1.5, 0.05, 5);      // the spinning wheel's wheel (stood in)
      bu('wood_dark', 2.2, 1.0, 2.8, 1.5, 0, 0.3); bu('cloth_white', 2.25, 1.05, 2.75, 1.45, 0.3, 0.38);
      sack(W - 0.4, 1.2); common(); break;
    }
  }
}
