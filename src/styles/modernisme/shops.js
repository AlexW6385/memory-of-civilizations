// The Eixample's shops you can walk into (docs/settlements/barcelona.md §9): on a plot's ground floor each bay beside the
// portal is a shop of its own — a wooden front with a bulkhead, glazed windows between stone piers and a door; a fascia
// board with gilt lettering; a blade sign on an iron bracket; goods on the pavement; inside, 8 m of floor under oak beams,
// shelves to the ceiling, a counter, the stock of its trade, a shopkeeper. Seven trades: grocer (colmado), baker (forn),
// wine shop (bodega), ironmonger (ferreteria), draper, chemist (farmacia), cobbler, barber. The furnishing is built once per
// trade and width in the shop's own frame (s along the front from the shop's left end, d inward from the street line, y up)
// and set by instancing; the walls, front and floor are exact for the plot.
import { box, lathe, rod } from '../../core/geom.js';

const IRON = 'iron';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** The trades: floor, wall lining, fascia board and lettering, the sign's symbol, the shopkeeper's dress. */
export const TRADES = {
  colmado:    { floor: 'cotto_floor', wall: 'lime_plaster',  fascia: 'cloth_green',  letters: 'gilt_bronze', wood: 'wood_dark', w: 3 },
  forn:       { floor: 'tile_cream',  wall: 'plaster_white', fascia: 'wood_dark',    letters: 'gilt_bronze', wood: 'wood_ochre', w: 2 },
  bodega:     { floor: 'cotto_floor', wall: 'lime_plaster',  fascia: 'cloth_maroon', letters: 'gilt_bronze', wood: 'wood_dark', w: 2 },
  ferreteria: { floor: 'cotto_floor', wall: 'plaster_grey',  fascia: 'cloth_indigo', letters: 'paint_white', wood: 'wood_dark', w: 1.5 },
  draperia:   { floor: 'wood_ochre',  wall: 'plaster_white', fascia: 'cloth_black',  letters: 'gilt_bronze', wood: 'wood_painted', w: 2 },
  farmacia:   { floor: 'marble_floor', wall: 'plaster_white', fascia: 'paint_white', letters: 'cloth_green', wood: 'wood_dark', w: 1 },
  sabater:    { floor: 'wood_ochre',  wall: 'lime_plaster',  fascia: 'cloth_brown',  letters: 'paint_white', wood: 'wood_dark', w: 1 },
  perruqueria: { floor: 'tile_cream', wall: 'plaster_white', fascia: 'cloth_blue',   letters: 'paint_white', wood: 'wood_painted', w: 1 },
};
const TRADE_LIST = Object.keys(TRADES);
const DD = 8.8;                                   // the inside face of the back wall, d from the street line
const FW = 0.5;                                   // the front wall's thickness
export const SHOP_DEPTH = DD;

/** The plan of a shop of width W whose door stands at dc from its left end (flipped when the door is at the right end). */
export function layout(W, dc) {
  const wide = W - (dc + 0.7) >= 2.5, lane = [dc - 0.7, dc + 0.7];
  const L = { W, dc, lane, wide, shelves: [], tables: [], cust: [] };
  if (wide) {
    L.shelves.push([W - 0.42, W, 1.0, DD - 0.4, 'd'], [0.42, W - 0.42, DD - 0.42, DD, 's'], [0, 0.42, 1.0, DD - 0.4, 'd']);
    L.counter = [W - 1.75, W - 1.05, 1.6, DD - 1.8]; L.keeper = [W - 0.72, (1.6 + DD - 1.8) / 2]; L.cust.push([W - 2.4, 3.2], [W - 2.4, 5.6]);
    const a0 = lane[1] + 0.25, a1 = W - 2.15, av = a1 - a0;
    if (av >= 1.0) { const tw = Math.min(1.3, av - 0.2), sc = (a0 + a1) / 2; L.tables.push([sc - tw / 2, sc + tw / 2, 2.4, 3.8]); if (W >= 7) L.tables.push([sc - tw / 2, sc + tw / 2, 5.4, 6.8]); if (W >= 7) L.cust.push([lane[1] + 0.2, 4.6]); }
  } else {
    L.shelves.push([0.42, W - 0.42, DD - 0.42, DD, 's'], [0, 0.42, 1.2, DD - 2.2, 'd'], [W - 0.42, W, 1.2, DD - 2.2, 'd']);
    L.counter = [0.5, W - 0.5, DD - 2.0, DD - 1.3]; L.keeper = [W / 2, DD - 0.9]; L.cust.push([dc, DD - 2.8]);
  }
  return L;
}

/** The trades of a plot's shops: pure, from the plot's seed (the same for the building and for the life that fills it). */
export function plotShops(p, nb, bw, on) {
  if (!on) return [];
  const door = Math.floor(nb / 2), r = rng((p.seed ^ 0x9e3779b1) >>> 0), out = [];
  const make = (i0, i1, side) => {
    if (i1 <= i0 || r() < 0.08) return;
    // (a trade by weight; none twice on one plot)
    let t, g = 0; do { t = TRADE_LIST[Math.floor(r() * TRADE_LIST.length)]; } while (out.some((o) => o.trade === t) && ++g < 6);
    const s0 = p.a + i0 * bw, s1 = p.a + i1 * bw, nbay = i1 - i0;
    out.push({ trade: t, s0, s1, nbay, bw, door: side === 'R' ? 'L' : 'R', seed: Math.floor(r() * 1e9) });         // the door at the end nearer the portal
  };
  make(0, door, 'L'); make(door + 1, nb, 'R');
  // (the door nearer the portal: a shop left of the portal has its door at its right end)
  return out;
}

export function makeShops(H) {
  const { proto, put } = H;

  // ── a shop's furnishing in its own frame ──────────────────────────────────────────────────────
  const furnish = (trade, W, dc, flip) => proto(`shop|${trade}|${W.toFixed(1)}|${dc.toFixed(1)}|${flip ? 1 : 0}`, (b) => {
    const T = TRADES[trade], Ly = layout(W, dc), r = rng(Math.round(W * 10) * 131 + trade.length * 17 + (flip ? 5 : 0));
    const S = (s) => (flip ? W - s : s), Y0 = 0.12;
    const bx = (m, s0, s1, d0, d1, y0, y1) => { const a = S(s0), c = S(s1); b.add(m, box(Math.min(a, c), y0, d0, Math.max(a, c), y1, d1)); };
    const lat = (m, prof, s, d, y, seg = 7) => b.add(m, lathe(prof, seg, null, S(s), y, d));
    const rd = (m, p, q, rr, seg = 6) => b.add(m, rod([S(p[0]), p[2], p[1]], [S(q[0]), q[2], q[1]], rr, seg));
    const pick = (a) => a[Math.floor(r() * a.length)];
    const jar = (m, s, d, y, rr, h) => lat(m, [[0.001, 0], [rr, 0], [rr, h * 0.75], [rr * 0.55, h * 0.9], [rr * 0.6, h], [0.001, h]], s, d, y, 6);
    const bottle = (m, s, d, y, rr, h) => lat(m, [[0.001, 0], [rr, 0], [rr, h * 0.55], [rr * 0.3, h * 0.78], [rr * 0.3, h], [0.001, h]], s, d, y, 6);
    const barrel = (m, s, d, y, rr, h) => { lat(m, [[0.001, 0], [rr * 0.85, 0], [rr, h * 0.5], [rr * 0.85, h], [0.001, h]], s, d, y, 9); lat(IRON, [[rr * 0.86, h * 0.2], [rr * 0.92, h * 0.2], [rr * 0.92, h * 0.25], [rr * 0.86, h * 0.25]], s, d, y, 9); lat(IRON, [[rr * 0.86, h * 0.75], [rr * 0.92, h * 0.75], [rr * 0.92, h * 0.8], [rr * 0.86, h * 0.8]], s, d, y, 9); };
    const sack = (m, s, d, y) => lat(m, [[0.001, 0], [0.26, 0], [0.3, 0.2], [0.24, 0.5], [0.12, 0.62], [0.001, 0.6]], s, d, y, 7);
    const crateOf = (s, d, y, fruit) => { bx('wood_ochre', s - 0.25, s + 0.25, d - 0.17, d + 0.17, y, y + 0.2); for (let k = 0; k < 6; k++) lat(fruit[k % fruit.length], [[0.001, 0], [0.05, 0.03], [0.065, 0.07], [0.04, 0.115], [0.001, 0.12]], s - 0.16 + (k % 3) * 0.16, d - 0.07 + Math.floor(k / 3) * 0.14, y + 0.2, 6); };
    const cloths = ['cloth_red', 'cloth_blue', 'cloth_green', 'cloth_ochre', 'cloth_white', 'cloth_maroon', 'cloth_indigo', 'cloth_grey'];
    // the kinds of stock, a unit laid on a shelf's plank at (s, d, y)
    const stock = {
      colmado: (s, d, y, i, t) => { const k = (i + t) % 4; if (k === 0) jar('glaze_white', s, d, y, 0.075, 0.22); else if (k === 1) lat('steel_chrome', [[0.001, 0], [0.06, 0], [0.06, 0.12], [0.001, 0.12]], s, d, y, 6); else if (k === 2) bx(pick(['cloth_red', 'cloth_ochre', 'paint_white', 'cloth_green']), s - 0.08, s + 0.08, d - 0.06, d + 0.06, y, y + 0.17); else bottle('glaze_green', s, d, y, 0.04, 0.3); },
      forn: (s, d, y, i) => { rd(pick(['hide_tan', 'wood_ochre']), [s - 0.2, d, y + 0.08], [s + 0.2, d, y + 0.08], i % 3 === 0 ? 0.075 : 0.06, 6); },
      bodega: (s, d, y, i, t) => { if (t % 2) bottle('glaze_green', s, d, y, 0.045, 0.32); else jar('pottery_dark', s, d, y, 0.09, 0.26); },
      ferreteria: (s, d, y, i) => { const k = i % 4; if (k === 0) lat('iron_galv', [[0.001, 0], [0.11, 0], [0.13, 0.22], [0.001, 0.22]], s, d, y, 7); else if (k === 1) bx(IRON, s - 0.1, s + 0.1, d - 0.08, d + 0.08, y, y + 0.12); else if (k === 2) lat('rope_fibre', [[0.1, 0], [0.16, 0.02], [0.16, 0.12], [0.1, 0.14]], s, d, y, 8); else bx('wood_dark', s - 0.07, s + 0.07, d - 0.07, d + 0.07, y, y + 0.28); },
      draperia: (s, d, y, i, t) => { const m = cloths[(i * 3 + t * 5) % cloths.length]; rd(m, [s - 0.2, d, y + 0.1], [s + 0.2, d, y + 0.1], 0.1, 6); },
      farmacia: (s, d, y, i, t) => { const k = (i + t) % 3; if (k === 0) jar('glaze_white', s, d, y, 0.07, 0.24); else if (k === 1) jar('glaze_blue', s, d, y, 0.06, 0.2); else bottle('glass_topaz', s, d, y, 0.045, 0.28); },
      sabater: (s, d, y, i) => { const m = i % 2 ? 'hide_black' : 'hide_brown'; bx(m, s - 0.05, s + 0.05, d - 0.14, d + 0.14, y, y + 0.08); bx(m, s - 0.05, s + 0.05, d - 0.14, d - 0.04, y + 0.08, y + 0.17); },
      perruqueria: (s, d, y, i) => { if (i % 2) bottle('glaze_blue', s, d, y, 0.04, 0.22); else jar('glaze_white', s, d, y, 0.05, 0.12); },
    }[trade];
    const wood = T.wood;
    // shelves: uprights, planks, stock
    const TIERS = trade === 'perruqueria' ? [1.0, 1.5] : trade === 'sabater' ? [0.5, 1.0, 1.5, 2.0, 2.5] : [0.4, 0.95, 1.5, 2.05, 2.6];
    for (const [s0, s1, d0, d1, along] of Ly.shelves) {
      if (trade === 'perruqueria' && along === 'd') continue;
      const L = along === 'd' ? d1 - d0 : s1 - s0, n = Math.max(2, Math.round(L / 1.5)), cs = (s0 + s1) / 2, cd = (d0 + d1) / 2;
      for (let k = 0; k <= n; k++) { const u = L * k / n; if (along === 'd') bx(wood, s0, s1, d0 + u - 0.025, d0 + u + 0.025, Y0, 2.85); else bx(wood, s0 + u - 0.025, s0 + u + 0.025, d0, d1, Y0, 2.85); }
      TIERS.forEach((ty, t) => {
        if (along === 'd') bx(wood, s0, s1, d0, d1, ty - 0.03 + Y0, ty + Y0); else bx(wood, s0, s1, d0, d1, ty - 0.03 + Y0, ty + Y0);
        const step = trade === 'draperia' ? 0.42 : 0.2, m = Math.floor(L / step);
        for (let i = 0; i < m; i++) { const u = 0.15 + (L - 0.3) * i / Math.max(1, m - 1); if (r() < 0.07) continue; if (along === 'd') stock(cs, d0 + u, ty + Y0, i, t); else stock(s0 + u, cd, ty + Y0, i, t); }
      });
      bx(wood, along === 'd' ? s0 : s0, along === 'd' ? s1 : s1, along === 'd' ? d0 : d0, along === 'd' ? d1 : d1, 2.85 + Y0, 2.95 + Y0);
    }
    // the counter: carcass, top, a footrail, the trade's things on it
    const [c0, c1, e0, e1] = Ly.counter, topM = trade === 'bodega' ? 'steel_grey' : trade === 'farmacia' || trade === 'forn' ? 'marble' : 'wood_ochre';
    const alongS = c1 - c0 > e1 - e0;
    bx(wood, c0, c1, e0, e1, Y0, 0.98 + Y0); bx(topM, c0 - 0.03, c1 + 0.03, e0 - 0.03, e1 + 0.03, 0.98 + Y0, 1.03 + Y0);
    if (alongS) rd('gilt_bronze', [c0, e0 - 0.08, 0.2], [c1, e0 - 0.08, 0.2], 0.018, 5); else rd('gilt_bronze', [c0 - 0.08, e0, 0.2], [c0 - 0.08, e1, 0.2], 0.018, 5);
    const topAt = (u) => (alongS ? [c0 + 0.3 + u, (e0 + e1) / 2] : [(c0 + c1) / 2, e0 + 0.3 + u]);
    const cl = alongS ? c1 - c0 - 0.6 : e1 - e0 - 0.6, mk = (u) => topAt(Math.max(0, Math.min(cl, u)));
    const ty = 1.03 + Y0;
    if (trade === 'colmado') { let [s, d] = mk(cl * 0.2); bx(IRON, s - 0.14, s + 0.14, d - 0.1, d + 0.1, ty, ty + 0.04); lat('gilt_bronze', [[0.001, 0], [0.01, 0.3], [0.001, 0.3]], s, d, ty, 5); bx('gilt_bronze', s - 0.2, s + 0.2, d - 0.01, d + 0.01, ty + 0.3, ty + 0.32); [s, d] = mk(cl * 0.6); lat('hide_tan', [[0.001, 0], [0.2, 0], [0.2, 0.1], [0.001, 0.1]], s, d, ty, 10); [s, d] = mk(cl * 0.85); lat('hide_brown', [[0.001, 0], [0.09, 0.02], [0.1, 0.22], [0.04, 0.3], [0.001, 0.3]], s, d, ty, 7); }
    if (trade === 'forn') { const [s, d] = mk(cl * 0.5); bx('glass_outer', s - (alongS ? cl * 0.4 : 0.28), s + (alongS ? cl * 0.4 : 0.28), d - (alongS ? 0.28 : cl * 0.4), d + (alongS ? 0.28 : cl * 0.4), ty + 0.02, ty + 0.5); for (let k = 0; k < 5; k++) { const [a, c] = mk(cl * (0.15 + k * 0.17)); rd(pick(['hide_tan', 'wood_ochre']), [a - (alongS ? 0.1 : 0), c - (alongS ? 0 : 0.1), ty + 0.1], [a + (alongS ? 0.1 : 0), c + (alongS ? 0 : 0.1), ty + 0.1], 0.06, 6); } }
    if (trade === 'bodega') for (let k = 0; k < 3; k++) { const [s, d] = mk(cl * (0.2 + k * 0.3)); bottle('glaze_green', s, d, ty, 0.04, 0.3); jar('glaze_white', s + (alongS ? 0 : 0.15), d + (alongS ? 0.15 : 0), ty, 0.06, 0.12); }
    if (trade === 'ferreteria') { const [s, d] = mk(cl * 0.3); bx(IRON, s - 0.12, s + 0.12, d - 0.08, d + 0.08, ty, ty + 0.08); bx(IRON, s - 0.03, s + 0.03, d - 0.03, d + 0.03, ty + 0.08, ty + 0.3); for (let k = 0; k < 4; k++) { const [a, c] = mk(cl * (0.5 + k * 0.12)); lat('iron_galv', [[0.001, 0], [0.07, 0], [0.09, 0.15], [0.001, 0.15]], a, c, ty, 6); } }
    if (trade === 'draperia') { for (let k = 0; k < 3; k++) { const [s, d] = mk(cl * (0.2 + k * 0.3)); for (let j = 0; j < 4; j++) bx(cloths[(k * 3 + j) % cloths.length], s - 0.22, s + 0.22, d - 0.17, d + 0.17, ty + j * 0.05, ty + j * 0.05 + 0.045); } }
    if (trade === 'farmacia') { let [s, d] = mk(cl * 0.25); bx('gilt_bronze', s - 0.2, s + 0.2, d - 0.1, d + 0.1, ty, ty + 0.03); rd('gilt_bronze', [s - 0.18, d, ty + 0.35], [s + 0.18, d, ty + 0.35], 0.015, 5); rd('gilt_bronze', [s, d, ty + 0.03], [s, d, ty + 0.35], 0.015, 5); lat('gilt_bronze', [[0.001, 0], [0.07, 0.01], [0.08, 0.04], [0.001, 0.04]], s - 0.18, d, ty + 0.3, 7); lat('gilt_bronze', [[0.001, 0], [0.07, 0.01], [0.08, 0.04], [0.001, 0.04]], s + 0.18, d, ty + 0.3, 7); [s, d] = mk(cl * 0.65); lat('marble_dark', [[0.001, 0], [0.1, 0], [0.11, 0.1], [0.09, 0.1], [0.07, 0.03], [0.001, 0.03]], s, d, ty, 8); [s, d] = mk(cl * 0.85); lat('glaze_white', [[0.001, 0], [0.11, 0], [0.12, 0.1], [0.001, 0.1]], s, d, ty, 8); }
    if (trade === 'sabater') { const [s, d] = mk(cl * 0.5); bx('hide_brown', s - 0.3, s + 0.3, d - 0.2, d + 0.2, ty, ty + 0.03); for (let k = 0; k < 3; k++) { const [a, c] = mk(cl * (0.25 + k * 0.25)); bx('hide_black', a - 0.06, a + 0.06, c - 0.14, c + 0.14, ty + 0.03, ty + 0.12); } }
    if (trade === 'perruqueria') { const [s, d] = mk(cl * 0.3); jar('glaze_white', s, d, ty, 0.12, 0.1); bx('marble', s + 0.3, s + 0.6, d - 0.1, d + 0.1, ty, ty + 0.03); }
    // the floor: the trade's furniture
    const T0 = Ly.tables;
    const stool = (s, d, h = 0.46) => { lat(wood, [[0.001, h], [0.17, h], [0.17, h - 0.04], [0.001, h - 0.04]], s, d, Y0, 8); for (const [a, c] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) rd(wood, [s + a * 0.11, d + c * 0.11, Y0], [s + a * 0.13, d + c * 0.13, Y0 + h - 0.04], 0.012, 4); };
    const tbl = (s0, s1, d0, d1, top, m = wood, h = 0.8) => { bx(m, s0, s1, d0, d1, Y0 + h - 0.05, Y0 + h); for (const [a, c] of [[s0 + 0.06, d0 + 0.06], [s1 - 0.06, d0 + 0.06], [s0 + 0.06, d1 - 0.06], [s1 - 0.06, d1 - 0.06]]) bx(m, a - 0.03, a + 0.03, c - 0.03, c + 0.03, Y0, Y0 + h - 0.05); void top; };
    for (const [s0, s1, d0, d1] of T0) {
      const cs = (s0 + s1) / 2, cd = (d0 + d1) / 2;
      if (trade === 'colmado') { tbl(s0, s1, d0, d1); crateOf(cs - 0.28, cd, Y0 + 0.8, ['cloth_red', 'cloth_ochre']); crateOf(cs + 0.3, cd, Y0 + 0.8, ['cloth_green', 'cloth_ochre']); }
      else if (trade === 'forn') { tbl(s0, s1, d0, d1, 0, 'wood_ochre'); for (let k = 0; k < 4; k++) rd(pick(['hide_tan', 'wood_ochre']), [s0 + 0.2 + k * 0.28, cd - 0.2, Y0 + 0.9], [s0 + 0.2 + k * 0.28, cd + 0.2, Y0 + 0.9], 0.07, 6); lat('wicker', [[0.2, 0], [0.26, 0.2], [0.001, 0.2]], cs, cd + 0.5, Y0 + 0.8, 8); }
      else if (trade === 'bodega') { const sx = [cs - 0.4, cs + 0.4]; tbl(cs - 0.35, cs + 0.35, cd - 0.35, cd + 0.35, 0, 'wood_dark', 0.75); lat('glaze_white', [[0.001, 0], [0.04, 0], [0.04, 0.2], [0.001, 0.2]], cs, cd, Y0 + 0.75, 6); for (const sq of sx) stool(sq, cd); }
      else if (trade === 'ferreteria') { tbl(s0, s1, d0, d1, 0, 'wood_dark'); for (let k = 0; k < 4; k++) lat('iron_galv', [[0.001, 0], [0.12, 0], [0.14, 0.26], [0.001, 0.26]], s0 + 0.25 + k * 0.28, cd, Y0 + 0.8, 7); bx(IRON, cs - 0.3, cs + 0.3, d0 + 0.1, d0 + 0.3, Y0 + 0.8, Y0 + 0.9); }
      else if (trade === 'draperia') { tbl(s0, s1, d0, d1, 0, 'wood_painted'); for (let j = 0; j < 5; j++) bx(cloths[j % cloths.length], s0 + 0.1, s1 - 0.1, d0 + 0.1, d1 - 0.1, Y0 + 0.8 + j * 0.07, Y0 + 0.8 + j * 0.07 + 0.06); }
      else if (trade === 'farmacia') { bx('wood_dark', s0, s1, d0, d1, Y0, Y0 + 0.85); bx('glass_outer', s0, s1, d0, d1, Y0 + 0.85, Y0 + 1.25); for (let k = 0; k < 3; k++) jar('glaze_blue', s0 + 0.25 + k * 0.35, cd, Y0 + 0.85, 0.07, 0.2); }
      else if (trade === 'sabater') { tbl(s0, s1, d0, d1, 0, 'wood_dark'); for (let k = 0; k < 5; k++) { bx(k % 2 ? 'hide_black' : 'hide_brown', s0 + 0.15 + k * 0.2, s0 + 0.25 + k * 0.2, cd - 0.14, cd + 0.14, Y0 + 0.8, Y0 + 0.88); } stool(cs, d1 + 0.35); }
      else { stool(cs, cd, 0.55); tbl(s0, s1, d0, d0 + 0.5, 0, 'wood_painted', 0.5); }
    }
    // the trade's floor stock against the walls and the corners
    const fl = Ly.wide ? [Ly.lane[1] + 0.3, DD - 0.8] : [0.8, DD - 2.7];
    if (trade === 'colmado') { barrel('wood_dark', fl[0] + 0.1, 7.9, Y0, 0.34, 0.8); barrel('wood_ochre', fl[0] + 0.1, 7.1, Y0, 0.3, 0.7); sack('sacking', fl[0] + 0.8, 8.1, Y0); sack('sacking', fl[0] + 1.3, 8.2, Y0); sack('cloth_white', fl[0] + 1.05, 7.7, Y0); for (let k = 0; k < 3; k++) { rd('hide_brown', [0.3 + k * 0.28, 0.9, 4.05], [0.3 + k * 0.28, 0.9, 3.55], 0.07, 6); } for (let k = 0; k < 5; k++) rd('hide_brown', [Ly.W / 2 + k * 0.25 - 0.5, 4.3, 4.18], [Ly.W / 2 + k * 0.25 - 0.5, 4.3, 3.62], 0.06, 6); rd(IRON, [Ly.W / 2 - 0.7, 4.3, 4.18], [Ly.W / 2 + 0.7, 4.3, 4.18], 0.012, 4); }
    if (trade === 'forn') { const s = Ly.W / 2; bx('brick', s - 1.3, s + 1.3, DD - 1.7, DD, Y0, 1.5); bx('brick', s - 1.0, s + 1.0, DD - 1.5, DD, 1.5, 2.2); bx('wood_dark', s - 0.65, s + 0.65, DD - 1.72, DD - 1.69, Y0 + 0.5, Y0 + 1.1); bx('flame', s - 0.4, s + 0.4, DD - 1.7, DD - 1.69, Y0 + 0.6, Y0 + 0.95); bx('iron', s - 0.75, s + 0.75, DD - 1.74, DD - 1.7, Y0 + 0.45, Y0 + 0.5); bx('brick', s - 0.35, s + 0.35, DD - 1.2, DD - 0.6, 2.2, 4.2); for (let k = 0; k < 4; k++) sack('cloth_white', fl[0] + 0.15 + (k % 2) * 0.5, 7.6 + Math.floor(k / 2) * 0.55, Y0 + (k > 1 ? 0 : 0)); rd('wood_ochre', [s + 1.5, DD - 0.7, Y0], [s + 1.2, DD - 0.7, 2.0], 0.025, 5); bx('wood_ochre', s + 1.05, s + 1.35, DD - 0.85, DD - 0.55, 2.0, 2.04); }
    if (trade === 'bodega') for (let tier = 0; tier < 2; tier++) for (let k = 0; k < 3; k++) { const s = (Ly.wide ? Ly.lane[1] + 0.9 : 1.0) + k * 0.85, y0 = Y0 + 0.42 + tier * 0.8; rd('wood_dark', [s, DD - 0.7, y0], [s, DD - 0.7 - 0.0001, y0], 0.34, 9); rd('wood_dark', [s, DD - 1.9, y0], [s, DD - 0.3, y0], 0.34, 9); rd(IRON, [s, DD - 1.5, y0], [s, DD - 1.44, y0], 0.355, 9); rd(IRON, [s, DD - 0.8, y0], [s, DD - 0.74, y0], 0.355, 9); bx('wood_dark', s - 0.4, s + 0.4, DD - 1.9, DD - 0.3, y0 - 0.38, y0 - 0.34); }
    if (trade === 'ferreteria') { for (let k = 0; k < 6; k++) { const s = Ly.W - 1.0 - (Ly.wide ? 0 : 0.6) - k * 0.0; void s; } const hx = Ly.wide ? Ly.W - 0.45 : 0.45; for (let k = 0; k < 5; k++) lat('iron_galv', [[0.001, 0], [0.16, 0], [0.18, 0.3], [0.001, 0.3]], Ly.lane[1] + 0.4 + (k % 3) * 0.4, 7.9 - Math.floor(k / 3) * 0.4, Y0 + (k > 2 ? 0 : 0), 7); void hx; for (let k = 0; k < 4; k++) { const s = Ly.lane[1] + 0.3 + k * 0.5; lat(IRON, [[0.001, 0], [0.16, 0.0], [0.16, 0.03], [0.001, 0.03]], s, 3.2, 3.5, 8); rd(IRON, [s, 3.2, 3.55], [s, 3.2, 4.05], 0.008, 4); } }
    if (trade === 'draperia') { const s = Ly.wide ? Ly.lane[1] + 0.6 : Ly.W - 0.7; lat('wood_painted', [[0.001, 0], [0.18, 0], [0.04, 0.05], [0.04, 0.9], [0.001, 0.9]], s, 7.6, Y0, 7); lat('cloth_maroon', [[0.001, 0.9], [0.18, 0.95], [0.19, 1.25], [0.1, 1.5], [0.001, 1.5]], s, 7.6, Y0, 8); lat('skin_light', [[0.001, 1.5], [0.05, 1.5], [0.05, 1.6], [0.001, 1.6]], s, 7.6, Y0, 6); }
    if (trade === 'farmacia') { const hx = Ly.wide ? Ly.lane[1] + 0.6 : Ly.W - 0.7; for (let k = 0; k < 2; k++) lat('glaze_green', [[0.001, 0], [0.16, 0.02], [0.26, 0.28], [0.2, 0.55], [0.07, 0.65], [0.07, 0.8], [0.001, 0.8]], hx + k * 0.6, 8.2, Y0, 9); }
    if (trade === 'sabater') { const s = Ly.wide ? Ly.lane[1] + 0.7 : Ly.W - 0.9; bx('wood_dark', s - 0.6, s + 0.6, 7.5, 8.0, Y0, Y0 + 0.9); for (let k = 0; k < 4; k++) rd('hide_brown', [s - 0.45 + k * 0.3, 8.1, 3.3], [s - 0.45 + k * 0.3, 8.1, 2.6], 0.12, 5); stool(s, 6.8, 0.42); lat(IRON, [[0.001, 0], [0.1, 0], [0.1, 0.1], [0.001, 0.1]], s + 0.4, 7.7, Y0 + 0.9, 6); }
    if (trade === 'perruqueria') {
      const sx = Ly.wide ? [Ly.lane[1] + 0.6, Ly.lane[1] + 1.8] : [Ly.W - 0.9];
      for (const s of sx) { lat('cloth_red', [[0.001, 0], [0.28, 0], [0.28, 0.45], [0.001, 0.45]], s, 5.6, Y0, 8); bx('cloth_red', s - 0.26, s + 0.26, 5.6 + 0.2, 5.6 + 0.3, Y0 + 0.45, Y0 + 1.15); bx('cloth_red', s - 0.3, s - 0.24, 5.2, 5.9, Y0 + 0.6, Y0 + 0.65); bx('cloth_red', s + 0.24, s + 0.3, 5.2, 5.9, Y0 + 0.6, Y0 + 0.65); rd('steel_chrome', [s, 5.6, Y0], [s, 5.6, Y0 + 0.4], 0.03, 5); bx('mirror_tin', s - 0.5, s + 0.5, DD - 0.06, DD - 0.03, 1.1, 2.4); bx('gilt_bronze', s - 0.54, s + 0.54, DD - 0.07, DD - 0.02, 2.4, 2.46); bx('marble', s - 0.5, s + 0.5, DD - 0.5, DD - 0.1, 0.85, 0.9); bx(Ly.wood ?? 'wood_dark', s - 0.5, s + 0.5, DD - 0.5, DD - 0.1, Y0, 0.85); void 0; }
      lat('marble', [[0.001, 0], [0.2, 0.0], [0.2, 0.15], [0.001, 0.15]], Ly.W - 0.8, 3.0, Y0 + 0.75, 8);
    }
    // from the beams: lamps, in every shop
    for (const s of [Ly.W * 0.3, Ly.W * 0.7]) for (const d of [3.2, 6.2]) { rd(IRON, [s, d, 4.2], [s, d, 3.55], 0.01, 4); lat('lamp_glass', [[0.12, 3.35], [0.16, 3.4], [0.001, 3.55], [0.001, 3.35]], s, d, 0.0, 8); }
  });

  /** Goods and a bench at the front: set on the pavement before the shop (t > 0), and the blade sign on its bracket. */
  const dress = (trade, W, dc, flip) => proto(`shopfront|${trade}|${W.toFixed(1)}|${dc.toFixed(1)}|${flip ? 1 : 0}`, (b) => {
    const S = (s) => (flip ? W - s : s), r = rng(Math.round(W * 10) * 71 + trade.length * 13 + (flip ? 3 : 0)), T = TRADES[trade];
    const bx = (m, s0, s1, t0, t1, y0, y1) => { const a = S(s0), c = S(s1); b.add(m, box(Math.min(a, c), y0, -Math.max(t0, t1), Math.max(a, c), y1, -Math.min(t0, t1))); };
    const lat = (m, prof, s, t, y, seg = 7) => b.add(m, lathe(prof, seg, null, S(s), y, -t));
    const rd = (m, p, q, rr, seg = 6) => b.add(m, rod([S(p[0]), p[2], -p[1]], [S(q[0]), q[2], -q[1]], rr, seg));
    const wnd = dc + 0.9 + 0.3, far = W - 0.35;                   // the pavement before the windows (beyond the door's lane)
    const fruit = ['cloth_red', 'cloth_ochre', 'cloth_green'];
    const crate = (s, t, y, f) => { bx('wood_ochre', s - 0.27, s + 0.27, t - 0.19, t + 0.19, y, y + 0.22); if (f) for (let k = 0; k < 6; k++) lat(f[k % f.length], [[0.001, 0], [0.05, 0.03], [0.065, 0.07], [0.04, 0.115], [0.001, 0.12]], s - 0.17 + (k % 3) * 0.17, t - 0.08 + Math.floor(k / 3) * 0.16, y + 0.22, 6); };
    // the blade sign: an iron bracket out from the wall over the door, a board with the trade's mark on both faces
    const ds = dc, bt = 0.85, by = 2.95;
    rd(IRON, [ds - 0.7, 0.04, by + 0.55], [ds - 0.7, bt + 0.1, by + 0.55], 0.014, 5); rd(IRON, [ds - 0.7, 0.04, by + 0.1], [ds - 0.7, bt * 0.6, by + 0.5], 0.01, 4);
    rd(IRON, [ds - 0.7, 0.3, by + 0.55], [ds - 0.7, 0.3, by + 0.45], 0.005, 3);
    const board = (m, y0, y1, t0, t1) => b.add(m, box(S(ds - 0.7) - 0.02, y0, -t1, S(ds - 0.7) + 0.02, y1, -t0));
    const mark = (m, y0, y1, t0, t1) => b.add(m, box(S(ds - 0.7) - 0.032, y0, -t1, S(ds - 0.7) + 0.032, y1, -t0));
    board('wood_painted', by - 0.05, by + 0.5, 0.25, bt);
    ({
      colmado: () => { mark('cloth_green', by + 0.02, by + 0.43, 0.32, 0.78); mark('cloth_red', by + 0.1, by + 0.28, 0.4, 0.7); },
      forn: () => { mark('hide_tan', by + 0.15, by + 0.35, 0.3, 0.8); mark('wood_ochre', by + 0.2, by + 0.3, 0.38, 0.72); },
      bodega: () => { mark('cloth_maroon', by + 0.05, by + 0.4, 0.35, 0.75); mark('glaze_green', by + 0.15, by + 0.35, 0.45, 0.62); },
      ferreteria: () => { mark(IRON, by + 0.1, by + 0.4, 0.4, 0.7); mark('paint_white', by + 0.2, by + 0.3, 0.3, 0.8); },
      draperia: () => { mark('cloth_red', by + 0.05, by + 0.22, 0.3, 0.8); mark('cloth_blue', by + 0.26, by + 0.42, 0.3, 0.8); },
      farmacia: () => { mark('glaze_green', by + 0.04, by + 0.46, 0.5, 0.58); mark('glaze_green', by + 0.2, by + 0.3, 0.32, 0.76); },
      sabater: () => { mark('hide_black', by + 0.08, by + 0.38, 0.38, 0.5); mark('hide_black', by + 0.08, by + 0.2, 0.38, 0.75); },
      perruqueria: () => { mark('paint_white', by + 0.05, by + 0.42, 0.3, 0.8); mark('cloth_red', by + 0.18, by + 0.3, 0.3, 0.8); },
    })[trade]();
    // goods before the windows
    const w0 = Math.min(wnd, W - 1.0);
    if (trade === 'colmado') { bx('wood_dark', w0, w0 + 1.3, 0.3, 0.75, 0.7, 0.76); for (const t of [0.33, 0.7]) bx('wood_dark', w0 + 0.05, w0 + 0.1, t - 0.03, t + 0.03, 0, 0.7); crate(w0 + 0.35, 0.5, 0.76, fruit); crate(w0 + 0.95, 0.5, 0.76, ['cloth_green', 'cloth_ochre']); for (let k = 0; k < 3; k++) lat('sacking', [[0.001, 0], [0.26, 0], [0.3, 0.2], [0.22, 0.45], [0.001, 0.52]], far - 0.35 - k * 0.55, 0.4, 0, 7); }
    if (trade === 'forn') { bx('wood_ochre', w0, w0 + 1.2, 0.25, 0.7, 0.7, 0.75); lat('wicker', [[0.2, 0], [0.27, 0.22], [0.001, 0.22]], w0 + 0.3, 0.48, 0.75, 8); lat('wicker', [[0.2, 0], [0.27, 0.22], [0.001, 0.22]], w0 + 0.9, 0.48, 0.75, 8); for (let k = 0; k < 4; k++) rd('hide_tan', [w0 + 0.1 + k * 0.28, 0.4, 1.0], [w0 + 0.1 + k * 0.28, 0.58, 0.98], 0.05, 6); }
    if (trade === 'bodega') { for (let k = 0; k < 2; k++) { lat('wood_dark', [[0.001, 0], [0.3, 0], [0.35, 0.4], [0.3, 0.8], [0.001, 0.8]], w0 + 0.4 + k * 0.75, 0.55, 0, 9); lat(IRON, [[0.31, 0.15], [0.325, 0.15], [0.325, 0.2], [0.31, 0.2]], w0 + 0.4 + k * 0.75, 0.55, 0, 9); } if (W > 5) { lat('wood_dark', [[0.001, 0.72], [0.34, 0.72], [0.34, 0.76], [0.001, 0.76]], far - 0.4, 0.8, 0, 9); rd('wood_dark', [far - 0.4, 0.8, 0], [far - 0.4, 0.8, 0.72], 0.04, 5); } }
    if (trade === 'ferreteria') { rd('wood_dark', [w0, 0.18, 0], [w0, 0.18, 2.3], 0.03, 5); rd('wood_dark', [w0 + 1.4, 0.18, 0], [w0 + 1.4, 0.18, 2.3], 0.03, 5); rd('wood_dark', [w0, 0.18, 2.3], [w0 + 1.4, 0.18, 2.3], 0.03, 5); for (let k = 0; k < 5; k++) lat('iron_galv', [[0.001, 0], [0.13, 0.0], [0.15, 0.04], [0.001, 0.04]], w0 + 0.15 + k * 0.28, 0.2, 1.4 + (k % 2) * 0.35, 7); for (let k = 0; k < 3; k++) lat('iron_galv', [[0.001, 0], [0.12, 0], [0.14, 0.24], [0.001, 0.24]], w0 + 0.2 + k * 0.4, 0.55, 0, 7); }
    if (trade === 'draperia') { bx('wood_painted', w0, w0 + 1.3, 0.25, 0.5, 0, 1.1); for (let k = 0; k < 4; k++) bx(['cloth_red', 'cloth_blue', 'cloth_white', 'cloth_green'][k], w0 + 0.05 + k * 0.3, w0 + 0.3 + k * 0.3, 0.3, 0.46, 1.1, 1.5); }
    if (trade === 'farmacia') { bx('wood_dark', w0, w0 + 1.6, 0.25, 0.65, 0, 0.5); bx('wood_dark', w0, w0 + 1.6, 0.25, 0.65, 0.5, 0.55); }
    if (trade === 'sabater') { bx('wood_dark', w0, w0 + 1.2, 0.2, 0.6, 0.6, 0.65); for (const t of [0.25, 0.55]) bx('wood_dark', w0 + 0.05, w0 + 0.1, t - 0.02, t + 0.02, 0, 0.6); for (let k = 0; k < 5; k++) bx(k % 2 ? 'hide_black' : 'hide_brown', w0 + 0.1 + k * 0.22, w0 + 0.2 + k * 0.22, 0.28, 0.5, 0.65, 0.72); }
    if (trade === 'perruqueria') { const px = dc + 0.85; lat('iron', [[0.001, 0], [0.09, 0.0], [0.09, 0.05], [0.001, 0.05]], px, 0.2, 0, 8); for (let k = 0; k < 6; k++) rd(k % 2 ? 'paint_white' : 'cloth_red', [px, 0.2, 0.05 + k * 0.2], [px, 0.2, 0.25 + k * 0.2], 0.05, 6); lat('glass_lamp', [[0.001, 1.25], [0.06, 1.25], [0.06, 1.38], [0.001, 1.4]], px, 0.2, 0, 7); if (W > 4) { bx('wood_dark', w0 + 0.1, w0 + 1.3, 0.2, 0.6, 0.45, 0.5); for (const s of [w0 + 0.15, w0 + 1.25]) bx('wood_dark', s - 0.03, s + 0.03, 0.2, 0.6, 0, 0.45); } }
    void T; void r;
  });

  /** The wall lanterns, the pilasters and the colour bands of a plot's upper front are built in index.js; this builds the shops. */
  /**
   * The ground floor of a plot with shops (replacing its solid box): shop shells, the solid between them, the upper mass.
   * fr: the plot's front frame; a, b the plot's ends; D its depth; y the block's level; yAt(s) the street's level at s; h the roof; mat the stucco.
   */
  function mass(ctx, fr, a, b, D, y, h, mat, shops, yAt) {
    const { bag, col, lights } = ctx, F = fr.F;
    const wr = (s0, s1, t0, t1, y0, y1) => { const p = fr.at(s0, t0), q = fr.at(s1, t1); col.rect([p[0], p[1], q[0], q[1]], y0, y1); };
    const top = Math.max(y, ...shops.map((s) => yAt((s.s0 + s.s1) / 2))) + 4.3;
    bag.add(mat, F(a, b, -D, 0, top, y + h)); wr(a, b, -D, 0, top, y + h);
    let c = a;
    const solid = (s0, s1) => { if (s1 - s0 < 0.04) return; bag.add(mat, F(s0, s1, -D, 0, y - 1.2, top)); wr(s0, s1, -D, 0, y - 1.2, top); };
    for (const sh of shops) {
      solid(c, sh.s0); c = sh.s1;
      shell(ctx, fr, sh, D, y, top, mat, yAt((sh.s0 + sh.s1) / 2));
    }
    solid(c, b);
    void lights;
  }

  function shell(ctx, fr, sh, D, y, top, mat, yS) {
    const { bag, col, lights } = ctx, F = fr.F, T = TRADES[sh.trade], { s0, s1, bw } = sh, W = s1 - s0, flip = sh.door === 'R';
    const wr = (a0, a1, t0, t1, y0, y1) => { const p = fr.at(a0, t0), q = fr.at(a1, t1); col.rect([p[0], p[1], q[0], q[1]], y0, y1); };
    const dc = bw / 2, dS = flip ? s1 - dc : s0 + dc, FL = yS + 0.12, r = rng(sh.seed);
    // the back of the shop's ground floor (solid behind its wall), the front wall with its openings
    bag.add(mat, F(s0, s1, -D, -(DD + 0.02), y - 1.2, top)); wr(s0, s1, -D, -(DD + 0.02), y - 1.2, top);
    const cuts = [[dS - 0.62, dS + 0.62]];                              // the door
    const piers = [];
    for (let k = 1; k < sh.nbay; k++) piers.push(s0 + k * bw);
    // the wall: bulkhead, lintel, piers; collision all along except the door
    bag.add(mat, F(s0, dS - 0.62, -FW, 0, y - 1.2, yS + 0.85)); bag.add(mat, F(dS + 0.62, s1, -FW, 0, y - 1.2, yS + 0.85));
    bag.add(mat, F(s0, s1, -FW, 0, yS + 3.3, top));
    for (const p of piers) bag.add(mat, F(p - 0.22, p + 0.22, -FW, 0, yS + 0.85, yS + 3.3));
    wr(s0, dS - 0.62, -FW, 0, y - 1.2, top); wr(dS + 0.62, s1, -FW, 0, y - 1.2, top);
    // the end piers (the party walls' returns) as stone strips
    for (const e of [s0, s1 - 0.3]) bag.add('limestone_yellow', F(e, e + 0.3, 0, 0.1, yS + 0.45, yS + 4.3));
    // the wooden front: a bulkhead of panels, mullions, a transom, glass
    for (let k = 0; k < sh.nbay; k++) {
      const a0 = s0 + k * bw + (k === 0 ? 0.3 : 0.22), a1 = s0 + (k + 1) * bw - (k === sh.nbay - 1 ? 0.3 : 0.22);
      const parts = dS - 0.62 > a0 && dS + 0.62 < a1 ? [[a0, dS - 0.7], [dS + 0.7, a1]] : [[a0, a1]];
      for (const [p0, p1] of parts) {
        if (p1 - p0 < 0.3) continue;
        bag.add('wood_painted', F(p0, p1, 0, 0.1, yS + 0.1, yS + 0.9));                       // the bulkhead
        for (let u = p0 + 0.3; u < p1 - 0.2; u += 0.62) bag.add('wood_dark', F(u, u + 0.4, 0.1, 0.13, yS + 0.22, yS + 0.78));    // its panels
        bag.add('wood_painted', F(p0, p1, -0.05, 0.08, yS + 0.9, yS + 1.0)); bag.add('wood_painted', F(p0, p1, -0.05, 0.08, yS + 3.2, yS + 3.3));
        bag.add('glass_outer', F(p0, p1, -0.24, -0.2, yS + 1.0, yS + 3.2));
        const nm = Math.max(1, Math.round((p1 - p0) / 1.1));
        for (let m = 0; m <= nm; m++) { const u = p0 + (p1 - p0) * m / nm; bag.add('wood_painted', F(u - 0.04, u + 0.04, -0.08, 0.08, yS + 0.9, yS + 3.3)); }
        bag.add('wood_painted', F(p0, p1, -0.05, 0.06, yS + 2.5, yS + 2.56));
      }
    }
    // the door: open, a leaf folded into the room, a glass-and-wood transom, the granite step
    const lf = flip ? dS - 0.62 : dS + 0.62;
    bag.add('wood_painted', F(Math.min(lf, lf + (flip ? 0.05 : -0.05)), Math.max(lf, lf + (flip ? 0.05 : -0.05)), -1.3, -FW, yS + 0.12, yS + 3.0));
    bag.add('glass_outer', F(Math.min(lf, lf + (flip ? 0.065 : -0.065)) - 0.003, Math.max(lf, lf + (flip ? 0.065 : -0.065)) + 0.003, -1.1, -0.7, yS + 1.1, yS + 2.6));
    bag.add('wood_painted', F(dS - 0.62, dS + 0.62, -0.05, 0.08, yS + 3.05, yS + 3.3)); bag.add('glass_outer', F(dS - 0.58, dS + 0.58, -0.16, -0.12, yS + 3.1, yS + 3.28));
    bag.add('granite_grey', F(dS - 0.85, dS + 0.85, 0, 0.55, yS - 0.25, yS + 0.1));
    // the fascia board with its gilt letters and the cornice over it
    bag.add(T.fascia, F(s0 + 0.12, s1 - 0.12, 0.1, 0.2, yS + 3.45, yS + 4.12));
    bag.add('limestone_yellow', F(s0, s1, 0, 0.3, yS + 4.12, yS + 4.42)); bag.add('limestone_yellow', F(s0, s1, 0.02, 0.12, yS + 3.3, yS + 3.45));
    const nl = Math.floor((W - 1.2) / 0.34);
    for (let k = 0, x = s0 + (W - nl * 0.34) / 2; k < nl; k++, x += 0.34) { if (r() < 0.12) continue; const lw = 0.12 + r() * 0.1; bag.add(T.letters, F(x, x + lw, 0.2, 0.225, yS + 3.58, yS + 3.58 + 0.2 + (k % 3 === 0 ? 0.1 : 0))); }
    bag.add(T.letters, F(s0 + 0.2, s1 - 0.2, 0.2, 0.215, yS + 3.5, yS + 3.53)); bag.add(T.letters, F(s0 + 0.2, s1 - 0.2, 0.2, 0.215, yS + 4.06, yS + 4.09));
    // the room: floor, lining, ceiling with beams
    bag.add(T.floor, F(s0, s1, -DD, -FW, yS - 0.4, FL)); col.floor([...(() => { const p = fr.at(s0, -DD), q = fr.at(s1, 0.15); return [p[0], p[1], q[0], q[1]]; })()], FL);
    const lin = (a0, a1, t0, t1) => bag.add(T.wall, F(a0, a1, t0, t1, yS + 0.12, yS + 4.2));
    lin(s0, s0 + 0.04, -DD, -FW); lin(s1 - 0.04, s1, -DD, -FW); lin(s0, s1, -DD, -DD + 0.04);
    bag.add('wood_dark', F(s0, s1, -DD, -FW, yS + 0.12, yS + 0.3 + 0.0)); void 0;
    bag.add('plaster_white', F(s0, s1, -DD, -FW, yS + 4.18, top));
    for (let d = 1.6; d < DD - 0.5; d += 2.4) bag.add('wood_dark', F(s0, s1, -d - 0.14, -d + 0.14, yS + 3.95, yS + 4.18));
    // furnishing, dress, light
    const Ly = layout(W, dc);
    put(bag, fr, furnish(sh.trade, W, dc, flip), s0, yS, 70);
    put(bag, fr, dress(sh.trade, W, dc, flip), s0, yS, 70);
    // awning over the windows of some (never over the door's bay)
    // colliders of the furnishing in the shop's frame (the same layout as the furnishing was built from)
    const mapS = (s) => (flip ? s1 - s : s0 + s);
    const furn = (q0, q1, d0, d1, y1) => wr(Math.min(mapS(q0), mapS(q1)), Math.max(mapS(q0), mapS(q1)), -d1, -d0, FL, FL + y1);
    furn(...Ly.counter, 1.1); for (const sh2 of Ly.shelves) furn(sh2[0], sh2[1], sh2[2], sh2[3], 3.0); for (const t of Ly.tables) furn(...t, 0.9);
    if (sh.trade === 'forn') { const s = W / 2; furn(s - 1.3, s + 1.3, DD - 1.7, DD, 2.0); }
    if (lights) { const q = fr.at(s0 + W / 2, -4.0); lights.push({ at: [q[0], FL + 3.6, q[1]], color: '#ffc98a', intensity: 6, distance: 8 }); }
  }

  return { mass, layout, furnish, dress };
}

/** Where the people of a shop stand, in the plot frame: the shopkeeper behind the counter, a customer at it. */
export function shopPeople(sh) {
  const W = sh.s1 - sh.s0, flip = sh.door === 'R', Ly = layout(W, sh.bw / 2), out = [];
  const map = (s, d) => [flip ? sh.s1 - s : sh.s0 + s, -d];
  const [ks, kd] = Ly.keeper; out.push({ at: map(ks, kd), role: 'keeper', face: Ly.wide ? [flip ? 1 : -1, 0] : [0, 1] });
  for (const [cs, cd] of Ly.cust) out.push({ at: map(cs, cd), role: 'customer', face: Ly.wide ? [flip ? -1 : 1, 0] : [0, -1] });
  return out;
}
