// The Muromachi machiya (docs/settlements/muromachi-kyoto.md §5): posts and boards under a gabled roof of planks weighted with
// stones — or of bark, or of straw for the poor — one storey, a third of them with the low second storey (tsuishi nikai)
// under a pent hood; the front a shop with its hinged shutter (tsuri-mise) propped up and its noren, or closed: shuttered,
// latticed, or a plank door; the earth passage (doma) with its kitchen range along one side; open inside with the trade's
// goods. Built facing +z (the street).
import { local, tatami, quad2, rng, WD, TM } from './kit.js';
import { trade as buildTrade, TRADES } from './trades.js';

export { TRADES };
const WALLS = ['planks_grey', 'planks_grey', 'mud_plaster', 'plaster_grey'];

/** The dimensions a house gets from its seed: the same for the house and for its dressing (fronts.js). */
export function dims(seed) {
  const r = rng(seed || 1), v = rng((seed || 1) * 7 + 3);
  const wi = Math.floor(r() * 4), H = 3.0 + r() * 0.5, rise = 1.4 + r() * 0.5;
  const two = v() < 0.3, roof = v() < 0.7 ? 'plank' : v() < 0.7 ? 'bark' : 'straw', front = Math.floor(v() * 3), hood = v() < 0.6, moss = v() < 0.5;
  return { wi, H, rise, two, roof, front, hood, moss, HU: two ? 1.9 : 0, top: H + (two ? 1.9 : 0) };
}

function plankRoof(T, B, w, d, yE, rise, o, kind, moss, r) {
  const zr = -d / 2, zf = o, zbk = -d - 0.8, X = w / 2 + 0.45, top = [], und = [], gab = [];
  const mat = kind === 'bark' ? 'roof_bark' : kind === 'straw' ? 'thatch' : 'planks_grey';
  const th = kind === 'straw' ? 0.22 : 0.18;
  quad2(top, [-X, yE, zf], [X, yE, zf], [X, yE + rise, zr], [-X, yE + rise, zr]);
  quad2(top, [-X, yE + rise, zr], [X, yE + rise, zr], [X, yE, zbk], [-X, yE, zbk]);
  quad2(und, [-X, yE - th, zf], [X, yE - th, zf], [X, yE + rise - th, zr], [-X, yE + rise - th, zr]);
  quad2(und, [-X, yE + rise - th, zr], [X, yE + rise - th, zr], [X, yE - th, zbk], [-X, yE - th, zbk]);
  quad2(und, [-X, yE - th, zf], [X, yE - th, zf], [X, yE, zf], [-X, yE, zf]); quad2(und, [-X, yE - th, zbk], [X, yE - th, zbk], [X, yE, zbk], [-X, yE, zbk]);
  for (const sx of [-1, 1]) { const x = sx * (w / 2 - 0.02); quad2(gab, [x, yE, zf - 0.3], [x, yE, zbk + 0.2], [x, yE + rise - 0.2, zr], [x, yE + rise - 0.2, zr]); }
  T(mat, top); T('timber', und); T(kind === 'straw' ? 'thatch' : 'planks_grey', gab);
  B(kind === 'straw' ? 'thatch' : WD, -X - 0.1, yE + rise - 0.02, zr - 0.12, X + 0.1, yE + rise + 0.1, zr + 0.12);
  // the weathering: patches of moss on the north-facing pitch and eaves, new boards where the roof was mended
  if (moss) for (let q = 0; q < 2; q++) {
    const u0 = -X + 0.3 + r() * (2 * X - 1.6), u1 = u0 + 0.7 + r() * 1.0, side = q ? -1 : 1, t0 = 0.55 + r() * 0.2, t1 = t0 + 0.2;
    const zA = side > 0 ? zr + (zf - zr) * t0 : zr + (zbk - zr) * t0, zB = side > 0 ? zr + (zf - zr) * t1 : zr + (zbk - zr) * t1, yA = yE + rise * (1 - t0) + 0.03, yB = yE + rise * (1 - t1) + 0.03, tq = [];
    quad2(tq, [Math.max(-X, u0), yA, zA], [Math.min(X, u1), yA, zA], [Math.min(X, u1), yB, zB], [Math.max(-X, u0), yB, zB]); T('sod', tq);
  }
  if (kind === 'plank' && r() < 0.45) {
    const u0 = -X + r() * (X), u1 = Math.min(X, u0 + 1.2), t0 = 0.1, t1 = 0.4, zA = zr + (zf - zr) * t0, zB = zr + (zf - zr) * t1, yA = yE + rise * (1 - t0) + 0.025, yB = yE + rise * (1 - t1) + 0.025, tq = [];
    quad2(tq, [u0, yA, zA], [u1, yA, zA], [u1, yB, zB], [u0, yB, zB]); T('timber', tq);
  }
  if (kind === 'plank') {
    const sl = 0;
    for (const side of [1, -1]) for (let q = 0; q < 3; q++) {
      const t = 0.2 + q * 0.28, z = side > 0 ? zr + (zf - zr) * t : zr + (zbk - zr) * t, y = yE + rise * (1 - t);
      for (let x = -w / 2 + 0.35 + r() * 0.3; x < w / 2 - 0.25; x += 0.75 + r() * 0.3) B('granite_grey', x, y - 0.02, z - 0.12, x + 0.22 + r() * 0.12, y + 0.1 + r() * 0.05, z + 0.12);
    }
    void sl;
  } else if (kind === 'straw') for (let x = -w / 2; x < w / 2; x += 0.9) B('thatch', x, yE + rise - 0.02, zr - 0.1, x + 0.12, yE + rise + 0.24, zr + 0.1);     // the ridge crossed by split bamboo, its ends crossed
}

function machiya(el, ctx) {
  local(el, ctx, ({ bag, col, B, T, L }, y0) => {
    const D = dims(el.seed), r = rng(el.seed || 1), w = el.w ?? 6, d = el.d ?? 11, wm = WALLS[D.wi], H = D.H, HT = D.top, rise = D.rise, open = !!el.open;
    r(); r(); r();
    const hw = w / 2, fl = 0.45, doma = 1.6, trade = el.trade || TRADES[Math.floor(r() * TRADES.length)], yT = y0 + HT;
    // the foot, posts and beams (the posts run up through the low second storey)
    for (const sx of [-1, 1]) B('granite_block', sx * hw - 0.2, y0, -0.2, sx * hw + 0.2, y0 + 0.2, 0.2);
    B('granite_block', -hw, y0, -d, hw, y0 + 0.14, -d + 0.1);
    for (const sx of [-1, 1]) { B(WD, sx * hw - 0.09, y0 + 0.2, -0.1, sx * hw + 0.09, yT, 0.1); B(WD, sx * hw - 0.09, y0 + 0.14, -d + 0.1, sx * hw + 0.09, yT, -d + 0.3); }
    B(WD, -hw - 0.05, yT - 0.28, -0.1, hw + 0.05, yT, 0.14);
    B(WD, -hw - 0.05, yT - 0.28, -d, -hw + 0.1, yT, 0), B(WD, hw - 0.1, yT - 0.28, -d, hw + 0.05, yT, 0);
    // the side walls and the back
    for (const sx of [-1, 1]) B(wm, sx > 0 ? hw - 0.1 : -hw, y0 + 0.14, -d + 0.1, sx > 0 ? hw : -hw + 0.1, yT - 0.28, -0.1);
    B(wm, -hw, y0 + 0.14, -d, hw, yT - 0.28, -d + 0.1);
    for (let z = -2.2; z > -d + 0.5; z -= 2.2) for (const sx of [-1, 1]) B(WD, sx * hw - 0.07, y0 + 0.14, z - 0.07, sx * hw + 0.07, yT - 0.28, z + 0.07);
    // the sides weather: a dark band of splashed earth at the foot
    for (const sx of [-1, 1]) B('plaster_damp', sx > 0 ? hw - 0.02 : -hw - 0.02, y0 + 0.14, -d + 0.1, sx > 0 ? hw + 0.02 : -hw + 0.02, y0 + 0.7, -0.1);
    col.rect([-hw, -d, -hw + 0.12, 0], y0, yT); col.rect([hw - 0.12, -d, hw, 0], y0, yT); col.rect([-hw, -d, hw, -d + 0.12], y0, yT);
    plankRoof(T, B, w, d, yT, rise, 1.0, D.roof, D.moss, r);
    for (let x = -hw - 0.3; x <= hw + 0.3; x += 0.6) B(WD, x - 0.04, yT - 0.4, 0.1, x + 0.04, yT - 0.22, 1.0);          // the rafter ends under the front eave
    col.rect([-hw, -d, hw, 0], yT, yT + rise);
    // the low second storey: plaster between the posts, two slit windows with lattice, the pent hood over the shop below
    if (D.two) {
      const yb = y0 + H;
      B('plaster_grey', -hw + 0.1, yb, -0.1, hw - 0.1, yT - 0.28, 0.03);
      B('plaster_streak', -hw + 0.1, yb + 0.1, 0.03, hw - 0.1, yb + 0.5, 0.034);
      B(WD, -hw - 0.05, yb - 0.02, -0.1, hw + 0.05, yb + 0.16, 0.2);
      const nw = Math.max(2, Math.floor(w / 2.2));
      for (let k = 0; k < nw; k++) { const xc = -hw + (k + 0.5) * w / nw; B(WD, xc - 0.62, yb + 0.55, 0.0, xc + 0.62, yb + 1.25, 0.1); B('koshi', xc - 0.54, yb + 0.6, 0.1, xc + 0.54, yb + 1.2, 0.14); }
      const hd = [], hu = []; quad2(hd, [-hw - 0.35, yb + 0.02, 0.0], [hw + 0.35, yb + 0.02, 0.0], [hw + 0.35, yb - 0.3, 1.0], [-hw - 0.35, yb - 0.3, 1.0]); T('planks_grey', hd);
      quad2(hu, [-hw - 0.35, yb - 0.04, 0.0], [hw + 0.35, yb - 0.04, 0.0], [hw + 0.35, yb - 0.36, 1.0], [-hw - 0.35, yb - 0.36, 1.0]); T('timber', hu);
      for (let x = -hw; x <= hw + 0.01; x += 0.7) B(WD, x - 0.04, yb - 0.34, 0.8, x + 0.04, yb - 0.3, 1.0);
      for (const sx of [-1, 1]) B(WD, sx * (hw + 0.28) - 0.04, y0 + 2.1, 0.92, sx * (hw + 0.28) + 0.04, yb - 0.32, 1.0);
    } else if (D.hood && !open) {
      // a small hood (hisashi) over the door
      const hd = [], hu = []; quad2(hd, [hw - doma - 0.5, y0 + 2.6, 0.0], [hw - 0.1, y0 + 2.6, 0.0], [hw - 0.1, y0 + 2.35, 0.9], [hw - doma - 0.5, y0 + 2.35, 0.9]); T('planks_grey', hd);
      quad2(hu, [hw - doma - 0.5, y0 + 2.56, 0.0], [hw - 0.1, y0 + 2.56, 0.0], [hw - 0.1, y0 + 2.31, 0.9], [hw - doma - 0.5, y0 + 2.31, 0.9]); T('timber', hu);
    }
    if (!open) {
      const sx0 = -hw + 0.1, sx1 = hw - doma - 0.45;
      if (D.front === 0) {
        // the shop shut: the hinged leaves of the shutter closed over the front, battens across
        B(WD, sx0, y0 + 0.14, -0.1, hw - 0.1, y0 + 0.5, 0.04);
        B(wm, sx0, y0 + 0.5, -0.1, hw - 0.1, y0 + (D.two ? H : H) - 0.28, 0.02);
        for (let x = sx0 + 0.05; x < sx1; x += 0.95) B('planks_grey', x, y0 + 0.5, 0.02, Math.min(sx1, x + 0.9), y0 + 2.3, 0.06);
        for (let x = sx0 + 0.05; x < sx1; x += 0.95) B(WD, x + 0.02, y0 + 1.1, 0.06, Math.min(sx1, x + 0.88), y0 + 1.16, 0.09);
      } else if (D.front === 1) {
        // a plastered wainscot and a latticed window of bamboo (komai) over it
        B('plaster_grey', sx0, y0 + 0.14, -0.1, hw - 0.1, y0 + 0.95, 0.04); B('plaster_damp', sx0, y0 + 0.14, 0.04, hw - 0.1, y0 + 0.5, 0.045);
        B(wm, sx0, y0 + 0.95, -0.1, hw - 0.1, y0 + H - 0.28, 0.02);
        B(WD, sx0 + 0.2, y0 + 0.95, 0.0, sx1 - 0.1, y0 + 1.0, 0.1); B(WD, sx0 + 0.2, y0 + 2.15, 0.0, sx1 - 0.1, y0 + 2.2, 0.1);
        B('koshi', sx0 + 0.25, y0 + 1.0, 0.04, sx1 - 0.15, y0 + 2.15, 0.08);
      } else {
        B(WD, sx0, y0 + 0.14, -0.1, hw - 0.1, y0 + 0.5, 0.04);
        B(wm, sx0, y0 + 0.5, -0.1, hw - 0.1, y0 + H - 0.28, 0.02);
        B(WD, sx0 + 0.2, y0 + 1.6, 0.02, sx1 - 0.2, y0 + 1.66, 0.07); B('shoji', sx0 + 0.25, y0 + 1.1, 0.03, sx1 - 0.25, y0 + 1.6, 0.05);   // a paper window, shutters of the sort left open a hand
      }
      B(TM, hw - doma - 0.4, y0 + 0.14, 0.02, hw - 0.3, y0 + 2.2, 0.08);
      B(el.trade === 'tea' ? 'cloth_red' : 'cloth_indigo', hw - doma - 0.3, y0 + 0.9, 0.1, hw - 0.4, y0 + 2.1, 0.12);
      B(WD, hw - doma - 0.4, y0 + 2.2, 0.0, hw - 0.28, y0 + 2.28, 0.1);
      col.rect([-hw, -0.1, hw, 0.05], y0, yT); col.floor([-hw, -d, hw, 0], y0 + fl);
      return;
    }
    // ---- the open shop: the doma on the east side, the raised floor of mats beside it
    B('silt', hw - doma, y0, -d + 0.15, hw - 0.1, y0 + 0.03, 0); col.floor([hw - doma, -d + 0.15, hw - 0.1, 0], y0 + 0.03);
    const x0 = -hw + 0.12, x1 = hw - doma;
    B(TM, x0, y0, -d + 0.1, x1, y0 + fl - 0.05, -0.15); B(WD, x0, y0 + fl - 0.12, -0.35, x1, y0 + fl - 0.04, -0.15);
    const qm = Math.min(4.2, d * 0.4);
    tatami(B, x0 + 0.02, x1 - 0.02, -qm, -0.4, y0 + fl, true);
    B(TM, x0, y0 + fl - 0.05, -qm - 0.02, x1, y0 + fl, -qm + 0.02);
    tatami(B, x0 + 0.02, x1 - 0.02, -d + 0.15, -qm - 0.02, y0 + fl, true);
    col.floor([x0, -d + 0.15, x1, -0.15], y0 + fl);
    B(WD, x1 - 0.04, y0, -d + 0.1, x1 + 0.04, y0 + fl, -0.15);                                         // the step along the doma
    // the folding shutter (tsuri-mise) propped up over the front, the counter board below it
    { const t = []; quad2(t, [x0, y0 + 1.5, 0.0], [x1, y0 + 1.5, 0.0], [x1, y0 + 2.45, 1.1], [x0, y0 + 2.45, 1.1]); T('planks_grey', t);
      const t2 = []; quad2(t2, [x0, y0 + 1.46, 0.0], [x1, y0 + 1.46, 0.0], [x1, y0 + 2.41, 1.1], [x0, y0 + 2.41, 1.1]); T(TM, t2);
      for (const x of [x0 + 0.05, x1 - 0.05]) B(WD, x - 0.03, y0, 1.0, x + 0.03, y0 + 2.42, 1.06);
      B(TM, x0, y0 + 0.82, 0.0, x1, y0 + 0.9, 0.55);
      B(WD, x0, y0, 0.0, x1, y0 + 0.82, 0.1);
      B(wm, x0, y0 + H - 0.7, -0.1, x1, y0 + H - 0.28, 0.02);
      col.rect([x0, 0.0, x1, 0.55], y0, y0 + 0.95); col.rect([x0 - 0.05, 0.9, x0 + 0.1, 1.06], y0, y0 + 2.4); }
    // the noren over the doma's mouth: indigo panels with a white mark, and a sign board on its post
    { const n = 3, wd = (doma - 0.2) / n; for (let k = 0; k < n; k++) { const a = hw - doma + 0.1 + k * wd; B('cloth_indigo', a + 0.01, y0 + 1.15, 0.03, a + wd - 0.01, y0 + H - 0.3, 0.06); B('cloth_white', a + wd / 2 - 0.1, y0 + H - 0.9, 0.062, a + wd / 2 + 0.1, y0 + H - 0.55, 0.066); } B(WD, hw - doma, y0 + H - 0.32, 0.0, hw - 0.05, y0 + H - 0.28, 0.1);
      B(WD, hw + 0.25, y0, 0.55, hw + 0.31, y0 + 1.1, 0.61); B('wood_painted', hw + 0.1, y0 + 1.1, 0.5, hw + 0.46, y0 + 1.9, 0.56); B('lacquer_black', hw + 0.22, y0 + 1.25, 0.58, hw + 0.34, y0 + 1.75, 0.59); }
    // the back of the shop: sliding screens between it and the rooms behind, one drawn aside
    for (let k = 0; k < 4; k++) if (k !== 1) { const a = x0 + k * (x1 - x0) / 4; B('shoji', a + 0.02, y0 + fl, -d + 2.4, a + (x1 - x0) / 4 - 0.02, y0 + H - 0.4, -d + 2.43); }
    // the hearth (irori) in the room behind, a kettle on its hook; a shelf with bowls; a chest and the folded bedding along the back
    { const cx = (x0 + x1) / 2, cz = -d + 1.4; for (const [a, b, c, e] of [[-0.45, -0.45, 0.45, -0.38], [-0.45, 0.38, 0.45, 0.45], [-0.45, -0.38, -0.38, 0.38], [0.38, -0.38, 0.45, 0.38]]) B(WD, cx + a, y0 + fl - 0.04, cz + b, cx + c, y0 + fl + 0.05, cz + e);
      B('plaster_grey', cx - 0.38, y0 + fl - 0.03, cz - 0.38, cx + 0.38, y0 + fl, cz + 0.38); B('flame', cx - 0.05, y0 + fl, cz - 0.05, cx + 0.05, y0 + fl + 0.07, cz + 0.05);
      L('iron', [[0.001, 0], [0.14, 0.03], [0.17, 0.12], [0.1, 0.2], [0.001, 0.21]], 10, cx, y0 + fl + 0.55, cz); B(WD, cx - 0.01, y0 + fl + 0.76, cz - 0.01, cx + 0.01, yT - 0.4, cz + 0.01);
      for (let k = 0; k < 3; k++) L('pottery_dark', [[0.001, 0], [0.05, 0], [0.08, 0.06], [0.001, 0.05]], 8, x0 + 0.5 + k * 0.3, y0 + fl + 0.9, -d + 0.3);
      B(WD, cx + 0.85, y0 + fl, cz + 0.55, cx + 1.05, y0 + fl + 0.08, cz + 0.75); B('lamp_white', cx + 0.88, y0 + fl + 0.08, cz + 0.58, cx + 1.02, y0 + fl + 0.5, cz + 0.72); B(WD, cx + 0.85, y0 + fl + 0.5, cz + 0.55, cx + 1.05, y0 + fl + 0.54, cz + 0.75);   // the standing lantern (andon), lit
      B(TM, x0 + 0.3, y0 + fl + 0.86, -d + 0.15, x0 + 1.3, y0 + fl + 0.9, -d + 0.45);
      B('lacquer_black', x1 - 1.4, y0 + fl, -d + 0.15, x1 - 0.4, y0 + fl + 0.7, -d + 0.65); B('iron', x1 - 1.38, y0 + fl + 0.5, -d + 0.65, x1 - 0.42, y0 + fl + 0.54, -d + 0.67);        // the chest (tansu)
      B('cloth_indigo', x1 - 0.5, y0 + fl, -d + 0.8, x1 - 0.1, y0 + fl + 0.5, -d + 1.9); B('cloth_white', x1 - 0.5, y0 + fl + 0.5, -d + 0.8, x1 - 0.1, y0 + fl + 0.58, -d + 1.9);   // the folded bedding
      B(TM, x0 + 0.1, y0 + fl + 1.9, -d + 0.16, x0 + 0.9, y0 + fl + 1.95, -d + 0.4); B('plaster_white', x0 + 0.15, y0 + fl + 1.95, -d + 0.2, x0 + 0.85, y0 + fl + 2.1, -d + 0.36);   // the god-shelf (kamidana)
    }
    // the doma: the kitchen range (kamado) at the back, the water jar, jars along the wall, a broom, a straw hat on its peg
    { const a = hw - doma + 0.12, b = hw - 0.14;
      B('granite_block', a, y0 + 0.03, -d + 0.25, b, y0 + 0.75, -d + 1.15); B('plaster_grey', a - 0.02, y0 + 0.75, -d + 0.22, b + 0.02, y0 + 0.82, -d + 1.18); B('flame', (a + b) / 2 - 0.1, y0 + 0.82, -d + 0.55, (a + b) / 2 + 0.1, y0 + 0.88, -d + 0.8);
      L('iron', [[0.001, 0], [0.2, 0.02], [0.24, 0.12], [0.2, 0.2], [0.001, 0.2]], 10, (a + b) / 2, y0 + 0.82, -d + 0.7);
      L('pottery_dark', [[0.001, 0], [0.22, 0], [0.3, 0.2], [0.3, 0.55], [0.22, 0.7], [0.001, 0.7]], 10, a + 0.3, y0 + 0.03, -d + 1.9); L('wicker', [[0.001, 0], [0.2, 0], [0.24, 0.3], [0.001, 0.3]], 8, a + 0.3, y0 + 0.03, -d + 2.7);
      B('bamboo_culm', b - 0.05, y0 + 0.03, -d + 3.3, b - 0.01, y0 + 1.5, -d + 3.34); B('thatch', b - 0.2, y0 + 1.5, -d + 3.25, b, y0 + 1.58, -d + 3.45);
      if (d > 10) L('pottery_dark', [[0.001, 0], [0.18, 0], [0.24, 0.2], [0.2, 0.4], [0.001, 0.4]], 8, a + 0.6, y0 + 0.03, -d + 4.2);
      B(WD, x1, y0 + 0.03, -d + 0.5, x1 + 0.04, y0 + 2.4, -d + 0.54); }
    // the loft over the back rooms (a floor of boards over the rear, its edge showing, a ladder)
    if (D.two) { B(TM, x0, y0 + H - 0.1, -d + 0.1, x1, y0 + H, -d / 2); B(WD, x0, y0 + H - 0.2, -d / 2, x1, y0 + H, -d / 2 + 0.1); for (let k = 0; k < 8; k++) B(WD, x1 - 0.5 + 0.0, y0 + fl + k * 0.37, -d / 2 + 0.2, x1 - 0.2, y0 + fl + k * 0.37 + 0.06, -d / 2 + 0.3); }
    buildTrade(trade, { B, L }, { x0, x1, y0, fl, qm, d, H, r });
    col.rect([x0, -qm - 0.1, x1, -qm + 0.35], y0 + fl, y0 + fl + 1.4);
  });
}
export const machiyaElements = { machiya_m: machiya };
