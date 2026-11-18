// The furnishing of the upper rooms of an opened tenement (docs/settlements/vienna.md §14), by the room's use. Every piece is a handful of
// boxes in the room's own coordinates (s across the house from the hall, d depth, v up from the floor); pieces that would stand in a
// door's lane (upper.js) are left out. [inferred from period interiors: Viennese flats of 1900, the Zimmer-Küche of the Bassena type]
import { FURNITURE } from '../modernisme/furniture.js';

export function furnish(E) {
  const { X, C, rooms, clear, r, light, floors, CEIL2, S0, S1, FW, lod, ctx, Pw, y } = E;
  const pick = (a) => a[Math.floor(r() * a.length)];
  // a piece's frame: x along its length, z across (back at z = 0), placed at (s0, d0) with the length along s ('s') or d ('d'); sx, sz flip
  const pc = (ax, s0, d0, V, sx = 1, sz = 1) => {
    const m = (x, z) => (ax === 's' ? [s0 + sx * x, d0 + sz * z] : [s0 + sz * z, d0 + sx * x]);
    return {
      b: (mat, x0, x1, v0, v1, z0, z1) => { const [pa, da] = m(x0, z0), [pb, db] = m(x1, z1); X(mat, pa, pb, V + v0, V + v1, da, db); },
      c: (x0, x1, z0, z1, h) => { const [pa, da] = m(x0, z0), [pb, db] = m(x1, z1); C(pa, pb, da, db, V, V + h); },
    };
  };
  const spot = (ax, s0, d0, len, dep, sx, sz) => { const a = m2(ax, s0, d0, 0, 0, sx, sz), b = m2(ax, s0, d0, len, dep, sx, sz); return clear(a[0], b[0], a[1], b[1]); };
  const m2 = (ax, s0, d0, x, z, sx, sz) => (ax === 's' ? [s0 + sx * x, d0 + sz * z] : [s0 + sz * z, d0 + sx * x]);
  const put = (ax, s0, d0, V, len, dep, sx, sz, fn) => { if (spot(ax, s0, d0, len, dep, sx, sz)) fn(pc(ax, s0, d0, V, sx, sz)); };

  const chair = (p, x, z, back = 1, m = 'wood_dark') => {                       // a bentwood chair at (x, z) of the piece's frame, its back to +z (back = 1) or -z
    for (const [a, b] of [[0, 0], [0.4, 0], [0, 0.4], [0.4, 0.4]]) p.b(m, x + a, x + a + 0.04, 0, 0.45, z + b, z + b + 0.04);
    p.b(m, x, x + 0.44, 0.45, 0.49, z, z + 0.44);
    const zb = back > 0 ? z + 0.4 : z; p.b(m, x, x + 0.04, 0.49, 0.95, zb, zb + 0.04); p.b(m, x + 0.4, x + 0.44, 0.49, 0.95, zb, zb + 0.04); p.b(m, x, x + 0.44, 0.88, 0.95, zb, zb + 0.04);
    p.c(x, x + 0.44, z, z + 0.44, 0.5);
  };
  const table = (p, x, z, len, wid, h = 0.76, top = 'wood_ochre', cloth = null) => {
    for (const [a, b] of [[0.05, 0.05], [len - 0.1, 0.05], [0.05, wid - 0.1], [len - 0.1, wid - 0.1]]) p.b('wood_dark', x + a, x + a + 0.05, 0, h - 0.05, z + b, z + b + 0.05);
    p.b(top, x, x + len, h - 0.05, h, z, z + wid);
    if (cloth) { p.b(cloth, x - 0.02, x + len + 0.02, h - 0.3, h - 0.05, z - 0.02, z + 0.0); p.b(cloth, x - 0.02, x + len + 0.02, h - 0.3, h - 0.05, z + wid, z + wid + 0.02); }
    p.c(x, x + len, z, z + wid, h);
  };
  const bed = (p, len = 2.0, wid = 1.0, cov = 'cloth_red', fine = true) => {
    p.b('wood_dark', 0, 0.07, 0, 1.2, 0, wid); p.b('wood_dark', len - 0.05, len, 0, 0.65, 0, wid);
    p.b('wood_dark', 0, len, 0.2, 0.42, 0, 0.05); p.b('wood_dark', 0, len, 0.2, 0.42, wid - 0.05, wid);
    p.b('linen', 0.07, len - 0.05, 0.42, 0.62, 0.05, wid - 0.05);
    p.b(cov, 0.55, len - 0.05, 0.62, 0.7, 0.03, wid - 0.03);
    if (fine) { p.b('cloth_white', 0.1, 0.5, 0.62, 0.78, 0.1, wid - 0.1); p.b('gilt_bronze', 0.0, 0.07, 1.2, 1.26, 0.2, wid - 0.2); }
    p.c(0, len, 0, wid, 1.2);
  };
  const wardrobe = (p, len = 1.4, dep = 0.6) => {
    p.b('wood_dark', 0, len, 0.08, 2.15, 0, dep); p.b('wood_dark', -0.04, len + 0.04, 2.15, 2.28, -0.02, dep + 0.03);
    p.b('wood_painted', 0.05, len / 2 - 0.03, 0.3, 2.0, dep, dep + 0.025); p.b('wood_painted', len / 2 + 0.03, len - 0.05, 0.3, 2.0, dep, dep + 0.025);
    p.b('gold', len / 2 - 0.07, len / 2 - 0.04, 1.0, 1.15, dep + 0.025, dep + 0.04); p.b('gold', len / 2 + 0.04, len / 2 + 0.07, 1.0, 1.15, dep + 0.025, dep + 0.04);
    p.c(-0.04, len + 0.04, -0.02, dep + 0.03, 2.28);
  };
  const stove = (p) => {                                                           // the tiled stove (Kachelofen) 0.75 square, 2.3 high
    p.b('granite_grey', 0, 0.75, 0, 0.14, 0, 0.75); p.b('glaze_white', 0.03, 0.72, 0.14, 2.05, 0.03, 0.72);
    for (const v of [0.8, 1.45]) p.b('glaze_green', 0.0, 0.75, v, v + 0.07, 0.0, 0.75);
    p.b('gold', -0.02, 0.77, 2.05, 2.15, -0.02, 0.77); p.b('glaze_white', 0.2, 0.55, 2.15, 2.5, 0.2, 0.55);
    p.b('iron', 0.25, 0.5, 0.35, 0.6, 0.72, 0.76); p.c(0, 0.75, 0, 0.75, 2.3);
  };
  const sofa = (p, len = 1.9) => {
    p.b('wood_dark', 0.02, len - 0.02, 0.1, 0.3, 0.02, 0.8); p.b('cloth_maroon', 0, len, 0.3, 0.5, 0.22, 0.85); p.b('cloth_maroon', 0, len, 0.3, 1.0, 0, 0.22);
    p.b('cloth_maroon', 0, 0.18, 0.5, 0.72, 0.22, 0.85); p.b('cloth_maroon', len - 0.18, len, 0.5, 0.72, 0.22, 0.85); p.b('wood_dark', 0, len, 1.0, 1.08, 0, 0.2);
    p.c(0, len, 0, 0.85, 1.05);
  };
  const picture = (s, d, ax, v, w, h, canvas = 'cloth_green') => {                // a framed picture on a wall: ax 's' = the wall runs along s at depth d (facing +d)
    if (ax === 's') { X('gold', s - w / 2, s + w / 2, v, v + h, d, d + 0.05); X(canvas, s - w / 2 + 0.06, s + w / 2 - 0.06, v + 0.06, v + h - 0.06, d + 0.05, d + 0.06); }
    else { X('gold', s, s + 0.05, v, v + h, d - w / 2, d + w / 2); X(canvas, s + 0.05, s + 0.06, v + 0.06, v + h - 0.06, d - w / 2 + 0.06, d + w / 2 - 0.06); }
  };
  const mirror = (s, d, v, w, h) => { X('wood_dark', s - w / 2, s + w / 2, v, v + h, d, d + 0.06); X('mirror_tin', s - w / 2 + 0.05, s + w / 2 - 0.05, v + 0.05, v + h - 0.05, d + 0.06, d + 0.065); };
  const carpet = (R, m, i = 0.7) => X(m, R.s0 + i, R.s1 - i, R.V, R.V + 0.012, R.dR + i, R.dF - i);
  const chandelier = (R, s, d, drop = 1.2) => {
    const top = R.k === 1 ? floors[2] - 0.14 : CEIL2;
    X('gold', s - 0.02, s + 0.02, top - drop, top, d - 0.02, d + 0.02); X('gold', s - 0.4, s + 0.4, top - drop, top - drop + 0.04, d - 0.02, d + 0.02); X('gold', s - 0.02, s + 0.02, top - drop, top - drop + 0.04, d - 0.4, d + 0.4);
    for (const [a, b] of [[-0.4, 0], [0.4, 0], [0, -0.4], [0, 0.4]]) X('lamp_white', s + a - 0.05, s + a + 0.05, top - drop + 0.04, top - drop + 0.2, d + b - 0.05, d + b + 0.05);
    light(s, top - drop - 0.1, d, '#ffd9a0', 8, 12);
  };
  const shelves = (p, len, mats, levels = [1.2, 1.7, 2.2]) => {
    p.b('wood_dark', 0, len, 0.0, levels[levels.length - 1] + 0.1, 0, 0.03);
    for (const v of levels) { p.b('wood_dark', 0, len, v, v + 0.035, 0, 0.3); for (let x = 0.08; x < len - 0.2; x += 0.2 + (r() * 0.15)) p.b(pick(mats), x, x + 0.1 + r() * 0.1, v + 0.035, v + 0.2 + r() * 0.15, 0.04, 0.24); }
    p.c(0, len, 0, 0.3, levels[levels.length - 1] + 0.1);
  };
  const sparherd = (p) => {
    p.b('iron', 0, 0.9, 0, 0.82, 0, 0.6); p.b('steel_grey', -0.02, 0.92, 0.82, 0.86, -0.02, 0.62); p.b('iron', 0.1, 0.3, 0.86, 0.88, 0.12, 0.32); p.b('iron', 0.4, 0.6, 0.86, 0.88, 0.12, 0.32);
    p.b('steel_grey', 0.5, 0.85, 0.25, 0.65, 0.6, 0.63); p.b('steel_grey', 0.0, 0.9, 0.5, 0.53, 0.6, 0.65);
    p.b('iron', 0.1, 0.22, 0.86, 2.9, 0.1, 0.22); p.c(0, 0.9, 0, 0.6, 2.9);
  };
  const dresser = (p, len = 1.2) => {
    p.b('wood_painted', 0, len, 0, 0.9, 0, 0.5); p.b('wood_painted', 0.03, len - 0.03, 0.9, 2.0, 0.0, 0.28); p.b('wood_dark', -0.02, len + 0.02, 0.9, 0.94, 0.0, 0.52);
    for (const v of [1.15, 1.6]) for (let x = 0.12; x < len - 0.15; x += 0.22) p.b('glaze_white', x, x + 0.16, v, v + 0.03, 0.28, 0.3);
    p.c(0, len, 0, 0.5, 2.0);
  };
  const bench = (p, x, z, len, wid = 0.6, h = 0.9) => {                              // a workbench, with its vice
    for (const [a, b] of [[0.05, 0.05], [len - 0.1, 0.05], [0.05, wid - 0.1], [len - 0.1, wid - 0.1]]) p.b('wood_dark', x + a, x + a + 0.07, 0, h - 0.07, z + b, z + b + 0.07);
    p.b('wood_ochre', x, x + len, h - 0.07, h, z, z + wid); p.b('iron', x + 0.1, x + 0.28, h, h + 0.14, z + wid - 0.1, z + wid - 0.02); p.c(x, x + len, z, z + wid, h + 0.14);
  };
  const washstand = (p) => {
    p.b('wood_dark', 0, 1.0, 0, 0.82, 0, 0.5); p.b('marble', -0.02, 1.02, 0.82, 0.86, -0.02, 0.52); p.b('glaze_white', 0.3, 0.7, 0.86, 0.92, 0.1, 0.42);
    p.b('glaze_white', 0.78, 0.9, 0.86, 1.06, 0.15, 0.3); p.b('wood_dark', 0.2, 0.8, 1.3, 1.95, 0.0, 0.04); p.b('mirror_tin', 0.24, 0.76, 1.35, 1.9, 0.04, 0.05); p.c(0, 1.0, 0, 0.5, 0.9);
  };

  for (const R of rooms) {
    const V = R.V, W2 = R.s1 - R.s0, mid = (R.s0 + R.s1) / 2, dm = (R.dR + R.dF) / 2;
    switch (R.type) {
      case 'salon': {
        carpet(R, pick(['cloth_red', 'cloth_maroon', 'cloth_blue']));
        put('s', R.s1 - 0.95, R.dR, V, 0.75, 0.75, 1, 1, stove);
        put('d', R.s1, R.dR + 1.3, V, 2.0, 0.85, 1, -1, (p) => sofa(p));
        put('d', R.s0, R.dR + 1.3, V, 1.5, 0.6, 1, 1, (p) => { p.b('lacquer_black', 0.0, 1.5, 0.12, 1.2, 0, 0.6); p.b('lacquer_black', -0.03, 1.53, 1.2, 1.25, -0.03, 0.62); p.b('lacquer_black', 0.05, 1.45, 0.7, 0.76, 0.6, 0.85); p.b('paint_white', 0.1, 1.4, 0.76, 0.79, 0.62, 0.82); p.b('lacquer_black', 0.15, 1.35, 1.0, 1.2, 0, 0.06); p.c(0, 1.5, 0, 0.85, 1.25); });
        { const t = pc('s', mid - 0.55, dm - 0.2, V); table(t, 0, 0, 1.1, 1.1, 0.74, 'marble', pick(['cloth_red', 'cloth_green'])); chair(t, 0.3, -0.5, -1); chair(t, 0.3, 1.2, 1); chair(t, -0.55, 0.35, 1); chair(t, 1.2, 0.35, 1); }
        chandelier(R, mid, dm);
        picture(R.s0 + 1.95, R.dR, 's', 1.7, 0.8, 0.6); picture(R.s1 - 1.4, R.dR, 's', 1.5, 0.5, 0.7, 'cloth_maroon');
        mirror(R.s0 + 0.0 + 0.02, R.dR + 0.6, 1.0, 0.1, 0.1);
        break;
      }
      case 'vorz': {
        put('s', R.s0 + 0.35, R.dR, V, 1.6, 0.5, 1, 1, (p) => { p.b('wood_dark', 0, 1.6, 1.5, 1.58, 0, 0.04); for (let x = 0.2; x < 1.5; x += 0.3) p.b('iron', x, x + 0.03, 1.4, 1.5, 0.04, 0.12); p.b('wood_dark', 0, 1.6, 0.0, 0.45, 0.02, 0.4); p.b('cloth_green', 0.02, 1.58, 0.45, 0.5, 0.02, 0.4); p.c(0, 1.6, 0, 0.4, 0.5); mirror(R.s0 + 1.0, R.dR + 0.02, 1.6, 0.6, 0.7); });
        put('s', R.s1 - 0.5, R.dR + 0.2, V, 0.3, 0.3, 1, 1, (p) => { p.b('iron', 0, 0.3, 0, 0.6, 0, 0.3); p.c(0, 0.3, 0, 0.3, 0.6); });
        break;
      }
      case 'speise': {
        carpet(R, 'cloth_maroon', 0.9);
        { const sx = R.s1 - 1.55, t = pc('d', sx, R.dF - 1.3, V, -1, 1); table(t, 0, 0, 2.0, 0.95, 0.76, 'wood_ochre', 'cloth_white'); for (const x of [0.35, 1.15]) { chair(t, x, -0.5, -1); chair(t, x, 1.0, 1); } }
        put('d', R.s1, R.dR + 0.5, V, 1.6, 0.55, 1, -1, (p) => { p.b('wood_dark', 0, 1.6, 0, 0.95, 0, 0.55); p.b('marble', -0.02, 1.62, 0.95, 0.99, -0.02, 0.57); p.b('wood_dark', 0.1, 1.5, 1.0, 2.1, 0, 0.3); for (let x = 0.2; x < 1.4; x += 0.28) p.b('glaze_white', x, x + 0.2, 1.4, 1.43, 0, 0.3); p.c(0, 1.6, 0, 0.55, 2.1); });
        chandelier(R, mid + 0.4, dm, 1.0);
        break;
      }
      case 'schlaf': {
        carpet(R, 'cloth_green', 0.9);
        put('d', R.s1, R.dR + 0.3, V, 2.05, 1.05, 1, -1, (p) => bed(p, 2.05, 1.05, pick(['cloth_red', 'cloth_blue', 'cloth_maroon'])));
        if (W2 > 4.6) put('d', R.s0, R.dR + 0.3, V, 2.05, 1.05, 1, 1, (p) => bed(p, 2.05, 1.05, pick(['cloth_red', 'cloth_blue', 'cloth_maroon'])));
        put('s', mid - 0.5, R.dR, V, 1.4, 0.6, 1, 1, (p) => wardrobe(p, 1.4));
        put('s', R.s0 + 0.2, R.dF - 0.5, V, 1.0, 0.5, 1, 1, (p) => washstand(p));
        picture(mid, R.dF, 's', 1.6, 0.7, 0.5, 'cloth_blue');
        break;
      }
      case 'billard': {
        const nT = FW > 6.2 ? 2 : 1;
        for (let k = 0; k < nT; k++) put('d', R.s0 + 1.1 + k * 2.4, R.dF - 1.3, V, 2.7, 1.5, -1, 1, (p) => {
          for (const [a, b] of [[0.1, 0.1], [2.4, 0.1], [0.1, 1.2], [2.4, 1.2]]) p.b('wood_dark', a, a + 0.2, 0, 0.78, b, b + 0.2);
          p.b('wood_dark', 0, 2.7, 0.78, 0.9, 0, 1.5); p.b('cloth_green', 0.14, 2.56, 0.9, 0.93, 0.14, 1.36);
          for (const [a, b] of [[0.8, 0.5], [1.0, 0.9], [1.9, 0.7]]) p.b(['paint_white', 'cloth_red', 'paint_ochre'][Math.floor(a * 3) % 3], a, a + 0.06, 0.93, 0.99, b, b + 0.06);
          p.b('cloth_green', 0.2, 2.5, 2.1, 2.3, 0.2, 1.3); p.b('gold', 0.2, 2.5, 2.3, 2.34, 0.2, 1.3); p.b('iron', 0.3, 0.32, 2.3, 3.4, 0.7, 0.72); p.b('iron', 2.3, 2.32, 2.3, 3.4, 0.7, 0.72);
          p.c(0, 2.7, 0, 1.5, 0.95);
        });
        for (let k = 0; k < 3; k++) { const s = R.s1 - 1.0, d = R.dR + 1.0 + k * 1.2; if (clear(s - 0.7, s + 0.7, d - 0.7, d + 0.7)) FURNITURE.terrace_set({ at: [...Pw(s, d)], y: y + V, seed: k + 3 }, ctx); }
        put('d', R.s1, R.dR + 0.3, V, 2.8, 0.55, -1, -1, (p) => { p.b('cloth_maroon', 0, 2.8, 0.3, 0.55, 0, 0.5); p.b('cloth_maroon', 0, 2.8, 0.55, 1.0, 0, 0.12); p.b('wood_dark', 0, 2.8, 0.0, 0.3, 0.05, 0.45); });
        put('s', mid - 1.0, R.dR, V, 2.0, 0.1, 1, 1, () => mirror(mid, R.dR, 1.2, 2.0, 1.4));
        picture(R.s0 + 2.0, R.dF - 0.01 - 0.05, 's', 1.9, 0.9, 0.6);
        chandelier(R, mid, dm - 2.0, 1.1);
        for (let k = 0; k < 4; k++) X('wood_dark', R.s0 + 0.04, R.s0 + 0.1, 1.2, 2.0, R.dR + 1.5 + k * 0.5 + 0.2, R.dR + 1.5 + k * 0.5 + 0.55);   // the newspaper holders on the wall
        break;
      }
      case 'buffet': {
        put('d', R.s1, R.dR + 0.4, V, 3.6, 0.7, 1, -1, (p) => { p.b('wood_dark', 0, 3.6, 0, 1.0, 0, 0.7); p.b('marble', -0.02, 3.62, 1.0, 1.04, -0.02, 0.72); p.b('steel_grey', 0.3, 0.8, 1.04, 1.7, 0.1, 0.5); p.b('gilt_bronze', 0.45, 0.65, 1.7, 1.9, 0.2, 0.4); for (let x = 1.2; x < 3.3; x += 0.25) p.b('glaze_white', x, x + 0.12, 1.04, 1.12, 0.2, 0.32); p.c(0, 3.6, 0, 0.7, 1.9); });
        put('d', R.s0, R.dR + 0.4, V, 1.8, 0.4, 1, 1, (p) => shelves(p, 1.8, ['glaze_white', 'paint_white', 'glaze_green']));
        break;
      }
      case 'werkstatt': {
        const gd = pick(['cloth_blue', 'cloth_brown', 'cloth_brown', 'hide_brown']);
        put('s', R.s0 + 0.9, R.dF - 1.25, V, 2.0, 0.7, 1, 1, (p) => bench(p, 0, 0, 2.0, 0.7));
        if (W2 > 5.2) put('s', R.s1 - 2.9, R.dF - 1.25, V, 2.0, 0.7, 1, 1, (p) => bench(p, 0, 0, 2.0, 0.7));
        put('d', R.s1, R.dR + 0.3, V, 3.2, 0.3, 1, -1, (p) => shelves(p, 3.2, [gd, 'cloth_white', 'cloth_red', 'wood_ochre', 'hide_brown']));
        put('s', R.s0 + 0.9, R.dR + 0.4, V, 0.4, 0.4, 1, 1, (p) => { p.b('wood_dark', 0.1, 0.3, 0, 0.9, 0.1, 0.3); p.b('cloth_white', 0.0, 0.4, 0.9, 1.45, 0.0, 0.4); p.b('wood_dark', 0.15, 0.25, 1.45, 1.65, 0.15, 0.25); p.c(0, 0.4, 0, 0.4, 1.65); });
        { const t = pc('s', mid - 0.6, dm - 0.3, V); table(t, 0, 0, 1.6, 0.9, 0.85, 'wood_ochre'); t.b(gd, 0.2, 0.9, 0.85, 0.95, 0.1, 0.7); }
        light(mid, floors[2] - 1.3, dm, '#ffd9a0', 7, 11);
        break;
      }
      case 'wohnkueche': {
        put('s', R.s1 - 0.9, R.dR, V, 0.9, 0.6, 1, 1, sparherd);
        put('s', R.s0 + 0.2, R.dR, V, 1.2, 0.5, 1, 1, (p) => dresser(p, 1.2));
        { const t = pc('s', mid - 0.6, dm - 0.5, V); table(t, 0, 0, 1.3, 0.85, 0.76, 'wood_ochre', 'cloth_white'); chair(t, 0.1, -0.55, -1); chair(t, 0.8, -0.55, -1); chair(t, 0.45, 0.95, 1); }
        light(mid, floors[2] - 1.5, dm, '#ffd9a0', 6, 10);
        break;
      }
      case 'kammer': {
        put('d', R.s1, R.dR + 0.3, V, 2.0, 1.0, 1, -1, (p) => bed(p, 2.0, 1.0, 'cloth_green', false));
        put('s', R.s0 + 0.3, R.dR, V, 1.3, 0.6, 1, 1, (p) => wardrobe(p, 1.3));
        put('s', R.s0 + 2.0, R.dR, V, 0.9, 0.5, 1, 1, (p) => { p.b('wood_dark', 0, 0.9, 0, 0.5, 0, 0.5); p.b('wood_dark', 0, 0.9, 0.5, 0.58, 0, 0.5); p.c(0, 0.9, 0, 0.5, 0.6); });
        break;
      }
      case 'gast': {
        const a = R.alt ?? 0;
        put('d', R.s1, R.dR + 0.4, V, 2.0, 1.0, 1, -1, (p) => bed(p, 2.0, 1.0, pick(['cloth_blue', 'cloth_maroon', 'cloth_red']), a !== 2));
        put('s', R.s0 + 0.2, R.dR, V, 1.0, 0.5, 1, 1, (p) => washstand(p));
        put('s', R.s0 + 1.5, R.dR, V, 1.2, 0.6, 1, 1, (p) => wardrobe(p, 1.2));
        { const t = pc('s', R.s0 + 0.3, R.dF - 1.2, V); table(t, 0, 0, 0.8, 0.8, 0.74, 'wood_ochre'); chair(t, 0.15, 0.85, 1); }
        if (a === 1) light(mid, floors[2] - 1.4, dm, '#ffd9a0', 6, 10);
        break;
      }
      case 'gang': {
        for (let q = 0; q < 3; q++) X(['cloth_red', 'cloth_green'][q & 1], R.s0 + 0.2, R.s1 - 0.2, V, V + 0.012, R.dR + 0.5, R.dF - 0.5);
        break;
      }
      case 'zimmer': {
        put('d', R.s1, R.dR + 0.3, V, 2.0, 1.0, 1, -1, (p) => bed(p, 2.0, 1.0, 'cloth_red', false));
        put('d', R.s0, R.dR + 0.3, V, 2.0, 1.0, 1, 1, (p) => bed(p, 2.0, 1.0, 'cloth_ochre', false));
        put('s', R.s1 - 2.2, R.dR, V, 0.75, 0.75, 1, 1, (p) => stove(p));
        put('s', R.s0 + 2.0, R.dR, V, 1.3, 0.6, 1, 1, (p) => wardrobe(p, 1.3));
        { const t = pc('s', mid - 0.5, dm - 0.2, V); table(t, 0, 0, 1.0, 0.8, 0.76, 'wood_ochre', 'cloth_white'); chair(t, 0.0, -0.5, -1); chair(t, 0.5, 0.85, 1); }
        put('s', mid + 0.7, R.dF - 1.0, V, 0.6, 0.9, 1, 1, (p) => { p.b('wood_dark', 0, 0.55, 0.15, 0.4, 0, 0.9); p.b('cloth_white', 0.04, 0.5, 0.4, 0.5, 0.04, 0.85); p.b('wood_dark', 0, 0.55, 0.0, 0.12, 0.05, 0.85); p.c(0, 0.55, 0, 0.9, 0.55); });   // the cradle
        X('wood_dark', R.s1 - 1.2, R.s1 - 1.15, 2.3 + V, 2.6 + V, R.dR + 0.02, R.dR + 0.07); X('gold', R.s1 - 1.28, R.s1 - 1.07, 2.45 + V, 2.5 + V, R.dR + 0.02, R.dR + 0.07);
        light(mid, floors[3] - 1.3, dm, '#ffd9a0', 5, 9);
        break;
      }
      case 'kueche': {
        put('s', R.s0 + 0.2, R.dR, V, 0.9, 0.6, 1, 1, sparherd);
        put('d', R.s1, R.dR + 0.4, V, 1.2, 0.5, 1, -1, (p) => dresser(p, 1.2));
        { const t = pc('s', mid - 0.4, dm - 0.5, V); table(t, 0, 0, 1.0, 0.7, 0.76, 'wood_ochre'); chair(t, 0.0, -0.5, -1); chair(t, 0.5, -0.5, -1); }
        put('s', R.s0 + 1.4, R.dR + 0.0, V, 0.5, 0.5, 1, 1, (p) => { p.b('steel_grey', 0, 0.5, 0, 0.3, 0, 0.5); p.c(0, 0.5, 0, 0.5, 0.3); });
        for (let k = 0; k < 4; k++) X('steel_grey', R.s0 + 1.5 + k * 0.3, R.s0 + 1.7 + k * 0.3, V + 1.5, V + 1.7, R.dR + 0.02, R.dR + 0.12);
        X('iron', R.s0 + 1.4, R.s0 + 2.8, V + 1.7, V + 1.73, R.dR + 0.02, R.dR + 0.06);
        break;
      }
      case 'kabinett': {
        put('d', R.s1, R.dR + 0.3, V, 2.0, 0.9, 1, -1, (p) => bed(p, 2.0, 0.9, 'cloth_brown', false));
        put('s', R.s0 + 0.1, R.dR, V, 0.95, 0.5, 1, 1, (p) => { p.b('wood_dark', 0, 0.95, 0, 0.6, 0, 0.5); p.b('wood_dark', 0, 0.95, 0.6, 0.66, 0, 0.5); p.c(0, 0.95, 0, 0.5, 0.66); });
        break;
      }
      case 'kammer2': {
        put('s', R.s0 + 0.2, R.dR, V, 1.5, 0.6, 1, 1, (p) => { p.b('wood_ochre', 0, 1.5, 0, 0.5, 0, 0.6); for (let x = 0; x < 1.4; x += 0.22) p.b('wood_dark', x, x + 0.18, 0.5, 0.68, 0.05, 0.55); p.c(0, 1.5, 0, 0.6, 0.7); });
        put('d', R.s1, R.dR + 0.3, V, 1.2, 0.8, 1, -1, (p) => { p.b('steel_grey', 0, 1.2, 0, 0.55, 0, 0.8); p.b('wood_dark', 0.0, 1.2, 0.55, 0.6, 0, 0.8); p.c(0, 1.2, 0, 0.8, 0.6); });
        put('s', R.s0 + 2.2, R.dR, V, 1.0, 0.6, 1, 1, (p) => { p.b('wood_dark', 0, 1.0, 0, 0.7, 0, 0.6); p.b('cloth_brown', 0.05, 0.95, 0.7, 0.8, 0.05, 0.55); p.c(0, 1.0, 0, 0.6, 0.8); });
        break;
      }
      default:
    }
  }
}
