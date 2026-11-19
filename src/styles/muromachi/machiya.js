// The Muromachi machiya (docs/settlements/muromachi-kyoto.md §5): posts and boards under a gabled roof of planks weighted with
// stones — or of bark, or of straw for the poor — one storey, a third of them with the low second storey (tsuishi nikai)
// under a pent hood; the front a shop with its hinged shutter (tsuri-mise) propped up and its noren, or closed: shuttered,
// latticed, or a plank door; the earth passage (doma) with its kitchen range along one side; open inside with the trade's
// goods. Built facing +z (the street).
import { local, tatami, quad2, rng, WD, TM } from './kit.js';
import { trade as buildTrade, TRADES } from './trades.js';
import { upWindows, upFront, upperRooms } from './upper.js';

export { TRADES };
const WALLS = ['planks_grey', 'planks_grey', 'mud_plaster', 'plaster_grey'];
// A late Muromachi house is known by its curtain (noren), not by a signboard (JAANUS, kanban: none in the rakuchū rakugai-zu): the cloth and
// the mark on it by trade [inferred], and a few trades hang their goods from the eave.
import { markAt } from './script.js';
/** The character on the curtain of a trade whose character is drawn and verified (script.js): the sake-seller's 酒, the tea-seller's 茶, the rice-dealer's 米, the draper's 布, the pawnbroker's 當, the potter's 瓷, the lacquerer's 漆. */
const MARK = { sake: '酒', tea: '茶', rice: '米', cloth: '布', doso: '當', pottery: '瓷', lacquer: '漆' };
const NOREN = { sake: ['cloth_white', 'cloth_indigo'], tea: ['cloth_red', 'cloth_white'], food: ['cloth_red', 'cloth_white'], dye: ['cloth_indigo', 'cloth_white'], cloth: ['cloth_ochre', 'cloth_indigo'], pottery: ['cloth_brown', 'cloth_white'], rice: ['cloth_white', 'cloth_brown'], lacquer: ['cloth_maroon', 'cloth_white'], paper: ['cloth_white', 'cloth_black'], sandals: ['cloth_brown', 'cloth_white'], doso: ['cloth_black', 'cloth_white'], smith: ['cloth_grey', 'cloth_white'], wood: ['cloth_green', 'cloth_white'] };

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


/** The room between the shop and the rooms behind (docs §10b): what a household of this seed keeps in it, on the side away from the doma, clear of the
 * screens' opening: a loom, a low desk with the ledgers, a meal laid out, or the chests and a folding screen. [inferred: the contents of a town house] */
function middleRoom(kind, { B, L, T, col }, { x1, f0, zA, trade }, v) {
  const fx1 = x1 - 0.12, fx0 = x1 - 1.4, z1 = zA, z0 = zA - 1.4, mid = (fx0 + fx1) / 2;
  const cl = ['cloth_ochre', 'cloth_indigo', 'cloth_green', 'cloth_maroon'][Math.floor(v() * 4)];
  if (kind === 1) {                                                                        // a floor loom (jibata)
    for (const px of [fx0 + 0.15, fx1 - 0.15]) for (const pz of [z0 + 0.15, z1 - 0.15]) B(WD, px - 0.035, f0, pz - 0.035, px + 0.035, f0 + 1.15, pz + 0.035);
    for (const px of [fx0 + 0.15, fx1 - 0.15]) { B(WD, px - 0.03, f0 + 1.1, z0 + 0.12, px + 0.03, f0 + 1.17, z1 - 0.12); B(WD, px - 0.03, f0 + 0.45, z0 + 0.12, px + 0.03, f0 + 0.5, z1 - 0.12); }
    B(WD, fx0 + 0.12, f0 + 0.82, z0 + 0.12, fx1 - 0.12, f0 + 0.9, z0 + 0.2); B('linen', fx0 + 0.15, f0 + 0.83, z0 + 0.2, fx1 - 0.15, f0 + 0.89, z0 + 0.3);       // the warp beam with the yarn on it
    B(WD, fx0 + 0.12, f0 + 0.66, z1 - 0.22, fx1 - 0.12, f0 + 0.74, z1 - 0.14); B(cl, fx0 + 0.15, f0 + 0.67, z1 - 0.2, fx1 - 0.15, f0 + 0.73, z1 - 0.16);              // the cloth beam, the cloth wound on it
    for (let x = fx0 + 0.2; x < fx1 - 0.15; x += 0.07) B('linen', x, f0 + 0.76, z0 + 0.3, x + 0.012, f0 + 0.775, z1 - 0.7);                                          // the warp threads
    B(cl, fx0 + 0.2, f0 + 0.76, z1 - 0.7, fx1 - 0.2, f0 + 0.78, z1 - 0.25);                                                                                      // the woven part
    B(WD, fx0 + 0.15, f0 + 0.92, z0 + 0.4, fx1 - 0.15, f0 + 0.99, z0 + 0.5);                                                                                     // the beater (ō)
    B(TM, mid - 0.4, f0, z1 - 0.05, mid + 0.4, f0 + 0.26, z1 + 0.32);                                                                                           // the weaver's bench
    for (const px of [fx0 + 0.15, fx1 - 0.15]) for (const pz of [z0 + 0.15, z1 - 0.15]) col.rect([px - 0.05, pz - 0.05, px + 0.05, pz + 0.05], f0, f0 + 1.17);    // the four posts stop the walker; the frame between them is open
  } else if (kind === 2) {                                                                  // the ledgers
    B(WD, mid - 0.45, f0 + 0.3, z0 + 0.15, mid + 0.45, f0 + 0.35, z0 + 0.65); for (const px of [-0.4, 0.4]) for (const pz of [0.2, 0.6]) B(WD, mid + px - 0.03, f0, z0 + pz - 0.03 - 0.0, mid + px + 0.03, f0 + 0.3, z0 + pz + 0.03);
    B('lacquer_black', mid - 0.4, f0 + 0.35, z0 + 0.25, mid - 0.15, f0 + 0.39, z0 + 0.55); B('iron', mid - 0.35, f0 + 0.39, z0 + 0.3, mid - 0.2, f0 + 0.4, z0 + 0.45);   // the ink-stone box
    for (let k = 0; k < 3; k++) B('paint_white', mid + 0.05 + k * 0.0, f0 + 0.35 + k * 0.045, z0 + 0.22, mid + 0.35, f0 + 0.395 + k * 0.045, z0 + 0.58);       // the ledgers (fukuro-toji), stacked
    B('bamboo_culm', mid - 0.1, f0 + 0.352, z0 + 0.45, mid + 0.0, f0 + 0.362, z0 + 0.5 + 0.18);
    B('cloth_maroon', mid - 0.35, f0, z0 + 0.8, mid + 0.35, f0 + 0.06, z0 + 1.3);                                                                                 // the cushion
    L('pottery_dark', [[0.001, 0], [0.14, 0], [0.2, 0.1], [0.19, 0.22], [0.001, 0.22]], 10, fx1 - 0.25, f0, z1 - 0.25);                                          // a hand brazier (hibachi)
    col.rect([mid - 0.5, z0 + 0.1, mid + 0.5, z0 + 0.7], f0, f0 + 0.4);
  } else if (kind === 3) {                                                                  // a meal laid on low trays
    for (const dz of [0.25, 0.95]) { const tz = z0 + dz;
      B('lacquer_red', mid - 0.22, f0 + 0.1, tz - 0.17, mid + 0.22, f0 + 0.14, tz + 0.17); for (const sx of [-1, 1]) for (const sz of [-1, 1]) B('lacquer_black', mid + sx * 0.18 - 0.02, f0, tz + sz * 0.13 - 0.02, mid + sx * 0.18 + 0.02, f0 + 0.1, tz + sz * 0.13 + 0.02);
      for (const [bx, bz, bm] of [[-0.1, -0.06, 'glaze_white'], [0.1, -0.06, 'lacquer_black'], [0.0, 0.08, 'glaze_white']]) L(bm, [[0.001, 0], [0.05, 0], [0.07, 0.06], [0.001, 0.06]], 8, mid + bx, f0 + 0.14, tz + bz);
      B('wood_dark', mid + 0.12, f0 + 0.14, tz + 0.1, mid + 0.14, f0 + 0.145, tz + 0.2);
      B('cloth_maroon', mid - 0.3, f0, tz + 0.35, mid + 0.3, f0 + 0.05, tz + 0.65 - (dz > 0.5 ? 0.1 : 0.0)); }
    L('pottery_dark', [[0.001, 0], [0.06, 0], [0.09, 0.1], [0.04, 0.2], [0.03, 0.26], [0.001, 0.26]], 8, fx1 - 0.2, f0, z1 - 0.2);                                   // a flask
    col.rect([mid - 0.25, z0 + 0.05, mid + 0.25, z0 + 1.15], f0, f0 + 0.2);
  } else if (kind === 4) {                                                                  // chests and a folding screen (byōbu)
    B('lacquer_black', fx0 + 0.1, f0, z0 + 0.1, fx1 - 0.1, f0 + 0.55, z0 + 0.65); B('lacquer_chestnut', fx0 + 0.15, f0 + 0.55, z0 + 0.15, fx1 - 0.15, f0 + 0.95, z0 + 0.6);
    for (const [yy, hh] of [[0.12, 0.2], [0.62, 0.2]]) B('iron', mid - 0.07, f0 + yy + 0.1, z0 + 0.65, mid + 0.07, f0 + yy + 0.1 + hh * 0.3, z0 + 0.67);
    col.rect([fx0 + 0.1, z0 + 0.1, fx1 - 0.1, z0 + 0.65], f0, f0 + 0.95);
    const t = [], pw = 0.34, y0s = f0 + 0.04, y1s = f0 + 1.35; let zz = z0 + 0.8, ph = 1;
    for (let k = 0; k < 4; k++) { const xa = fx0 + 0.1 + k * pw, xb = xa + pw; quad2(t, [xa, y0s, zz + (k % 2 ? 0 : 0.14)], [xb, y0s, zz + (k % 2 ? 0.14 : 0)], [xb, y1s, zz + (k % 2 ? 0.14 : 0)], [xa, y1s, zz + (k % 2 ? 0 : 0.14)]); }
    T('paint_white', t); void ph;
    for (let k = 0; k <= 4; k++) { const xa = fx0 + 0.1 + k * pw, zq = zz + (k % 2 ? 0.14 : 0); B(WD, xa - 0.012, y0s, zq - 0.012, xa + 0.012, y1s, zq + 0.012); }
    B('cloth_black', fx0 + 0.22, f0 + 0.55, zz + 0.0, fx0 + 0.55, f0 + 0.57, zz + 0.145);
    col.rect([fx0 + 0.1, z0 + 0.75, fx1 - 0.1, z0 + 1.0], f0, f0 + 1.3);
  }
  void trade;
}

function machiya(el, ctx) {
  local(el, ctx, ({ bag, col, B, T, L }, y0) => {
    const D = dims(el.seed), r = rng(el.seed || 1), w = el.w ?? 6, d = el.d ?? 11, wm = WALLS[D.wi], H = D.H, HT = D.top, rise = D.rise, open = !!el.open;
    r(); r(); r();
    const hw = w / 2, fl = 0.45, doma = 1.6, trade = el.trade || TRADES[Math.floor(r() * TRADES.length)], yT = y0 + HT;
    // the front of an open house: the shop (the hinged shutter propped up) or the dwelling (the front shut, the earth passage open) — one in three by seed
    const up = !!el.up && D.two && open, wins = up ? upWindows(w, hw - doma) : [];
    const shutFront = !open || (el.front ? el.front === 'shut' : (el.seed >>> 2) % 3 === 1);
    const [nb, nm] = NOREN[trade] || ['cloth_indigo', 'cloth_white'], sg = rng((el.seed || 1) * 13 + 1);
    const noren = (top) => { const n = 3, wd = (doma - 0.2) / n; for (let k = 0; k < n; k++) { const a = hw - doma + 0.1 + k * wd; B(nb, a + 0.01, y0 + 1.15, 0.03, a + wd - 0.01, top, 0.06); if (!MARK[trade]) B(nm, a + wd / 2 - 0.1, top - 0.6, 0.062, a + wd / 2 + 0.1, top - 0.25, 0.066); else if (k === 1) bag.add(nm, markAt(MARK[trade], a + wd / 2, top - 0.43, 0.0625, 0.34, !!el.mirror)); } };   // (the trade's character on the middle panel, in the second colour; the others plain)
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
      if (up) upFront({ B }, { hw, y0, H, yT, wins });
      else { B('plaster_grey', -hw + 0.1, yb, -0.1, hw - 0.1, yT - 0.28, 0.03);
      B('plaster_streak', -hw + 0.1, yb + 0.1, 0.03, hw - 0.1, yb + 0.5, 0.034); }
      B(WD, -hw - 0.05, yb - 0.02, -0.1, hw + 0.05, yb + 0.16, 0.2);
      const nw = Math.max(2, Math.floor(w / 2.2));
      if (!up) for (let k = 0; k < nw; k++) { const xc = -hw + (k + 0.5) * w / nw; B(WD, xc - 0.62, yb + 0.55, 0.0, xc + 0.62, yb + 1.25, 0.1); B('koshi', xc - 0.54, yb + 0.6, 0.1, xc + 0.54, yb + 1.2, 0.14); }
      const hd = [], hu = []; quad2(hd, [-hw - 0.35, yb + 0.02, 0.0], [hw + 0.35, yb + 0.02, 0.0], [hw + 0.35, yb - 0.3, 1.0], [-hw - 0.35, yb - 0.3, 1.0]); T('planks_grey', hd);
      quad2(hu, [-hw - 0.35, yb - 0.04, 0.0], [hw + 0.35, yb - 0.04, 0.0], [hw + 0.35, yb - 0.36, 1.0], [-hw - 0.35, yb - 0.36, 1.0]); T('timber', hu);
      for (let x = -hw; x <= hw + 0.01; x += 0.7) B(WD, x - 0.04, yb - 0.34, 0.8, x + 0.04, yb - 0.3, 1.0);
      for (const sx of [-1, 1]) B(WD, sx * (hw + 0.28) - 0.04, y0 + 2.1, 0.92, sx * (hw + 0.28) + 0.04, yb - 0.32, 1.0);
    } else if (D.hood && shutFront) {
      // a small hood (hisashi) over the door
      const hd = [], hu = []; quad2(hd, [hw - doma - 0.5, y0 + 2.6, 0.0], [hw - 0.1, y0 + 2.6, 0.0], [hw - 0.1, y0 + 2.35, 0.9], [hw - doma - 0.5, y0 + 2.35, 0.9]); T('planks_grey', hd);
      quad2(hu, [hw - doma - 0.5, y0 + 2.56, 0.0], [hw - 0.1, y0 + 2.56, 0.0], [hw - 0.1, y0 + 2.31, 0.9], [hw - doma - 0.5, y0 + 2.31, 0.9]); T('timber', hu);
    }
    // what a house shows in front besides its curtain: goods hung from the eave by trade, a blind of split bamboo (sudare) over some shops
    { const hx = hw - 1.25, hy = y0 + H - 0.4, z = 0.8, rope = (len) => B('rope_fibre', hx - 0.01, hy - len, z - 0.01, hx + 0.01, hy, z + 0.01);
      if (trade === 'sake') { rope(0.25); L('sod', [[0.001, 0], [0.16, 0.06], [0.25, 0.24], [0.17, 0.43], [0.001, 0.5]], 10, hx, hy - 0.75, z); }
      else if (trade === 'pottery') { for (const [dy, k] of [[0.3, 1], [0.7, 0.8], [1.05, 0.7]]) L('pottery_dark', [[0.001, 0], [0.09 * k, 0], [0.13 * k, 0.1 * k], [0.09 * k, 0.2 * k], [0.001, 0.22 * k]], 8, hx, hy - dy - 0.2, z); B('rope_fibre', hx - 0.01, hy - 1.2, z - 0.01, hx + 0.01, hy, z + 0.01); }
      else if (trade === 'sandals') { B(WD, hx - 0.4, hy - 0.04, z - 0.02, hx + 0.4, hy, z + 0.02); for (let k = 0; k < 6; k++) B('thatch', hx - 0.36 + k * 0.14, hy - 0.5 - (k % 2) * 0.08, z - 0.03, hx - 0.26 + k * 0.14, hy - 0.04, z + 0.03); }
      else if (trade === 'smith') { B('iron', hx - 0.35, hy - 0.04, z - 0.02, hx + 0.35, hy, z + 0.02); for (let k = 0; k < 4; k++) B('iron', hx - 0.3 + k * 0.2 - 0.015, hy - 0.4 - (k % 2) * 0.12, z - 0.015, hx - 0.3 + k * 0.2 + 0.015, hy - 0.04, z + 0.015); B('iron', hx + 0.22, hy - 0.5, z - 0.05, hx + 0.34, hy - 0.4, z + 0.05); }
      else if (trade === 'cloth') { B(WD, hx - 0.3, hy - 0.04, z - 0.02, hx + 0.3, hy, z + 0.02); B('cloth_ochre', hx - 0.26, hy - 1.25, z - 0.01, hx + 0.26, hy - 0.04, z + 0.01); B('cloth_indigo', hx - 0.26, hy - 0.5, z - 0.012, hx + 0.26, hy - 0.4, z + 0.012); }
      else if (trade === 'lacquer') { rope(0.3); L('lacquer_red', [[0.001, 0], [0.1, 0.01], [0.15, 0.06], [0.16, 0.1], [0.001, 0.1]], 12, hx, hy - 0.42, z); }
      if (!shutFront && sg() < 0.3) { for (const h of [0.15, 1.0]) B(WD, -hw + 0.1, y0 + 2.42 - h * 0.7 - 0.0, 1.07, hw - doma - 0.5, y0 + 2.44 - h * 0.7, 1.1); B('koshi', -hw + 0.1, y0 + 1.7, 1.065, hw - doma - 0.5, y0 + 2.42, 1.085); }
    }
    if (shutFront) {
      const sx0 = -hw + 0.1, sx1 = hw - doma - 0.45, xr = open ? hw - doma - 0.4 : hw - 0.1;      // an open house keeps its earth passage open to the street
      if (D.front === 0) {
        // the shop shut: the hinged leaves of the shutter closed over the front, battens across
        B(WD, sx0, y0 + 0.14, -0.1, xr, y0 + 0.5, 0.04);
        B(wm, sx0, y0 + 0.5, -0.1, xr, y0 + (D.two ? H : H) - 0.28, 0.02);
        for (let x = sx0 + 0.05; x < sx1; x += 0.95) B('planks_grey', x, y0 + 0.5, 0.02, Math.min(sx1, x + 0.9), y0 + 2.3, 0.06);
        for (let x = sx0 + 0.05; x < sx1; x += 0.95) B(WD, x + 0.02, y0 + 1.1, 0.06, Math.min(sx1, x + 0.88), y0 + 1.16, 0.09);
      } else if (D.front === 1) {
        // a plastered wainscot and a latticed window of bamboo (komai) over it
        B('plaster_grey', sx0, y0 + 0.14, -0.1, xr, y0 + 0.95, 0.04); B('plaster_damp', sx0, y0 + 0.14, 0.04, xr, y0 + 0.5, 0.045);
        B(wm, sx0, y0 + 0.95, -0.1, xr, y0 + H - 0.28, 0.02);
        B(WD, sx0 + 0.2, y0 + 0.95, 0.0, sx1 - 0.1, y0 + 1.0, 0.1); B(WD, sx0 + 0.2, y0 + 2.15, 0.0, sx1 - 0.1, y0 + 2.2, 0.1);
        B('koshi', sx0 + 0.25, y0 + 1.0, 0.04, sx1 - 0.15, y0 + 2.15, 0.08);
      } else {
        B(WD, sx0, y0 + 0.14, -0.1, xr, y0 + 0.5, 0.04);
        B(wm, sx0, y0 + 0.5, -0.1, xr, y0 + H - 0.28, 0.02);
        B(WD, sx0 + 0.2, y0 + 1.6, 0.02, sx1 - 0.2, y0 + 1.66, 0.07); B('shoji', sx0 + 0.25, y0 + 1.1, 0.03, sx1 - 0.25, y0 + 1.6, 0.05);   // a paper window, shutters of the sort left open a hand
      }
      B(WD, hw - doma - 0.4, y0 + 2.2, 0.0, hw - 0.28, y0 + 2.28, 0.1);
      if (!open) {
        B(TM, hw - doma - 0.4, y0 + 0.14, 0.02, hw - 0.3, y0 + 2.2, 0.08);
        B(nb, hw - doma - 0.3, y0 + 0.9, 0.1, hw - 0.4, y0 + 2.1, 0.12);
        col.rect([-hw, -0.1, hw, 0.05], y0, yT); col.floor([-hw, -d, hw, 0], y0 + fl);
        return;
      }
      // the dwelling: the plank wall stops at the passage, whose mouth is hung with the curtain; the wall above it closes under the eave
      B(wm, xr, y0 + 2.28, -0.1, hw - 0.1, y0 + H - 0.28, 0.02); B(WD, xr - 0.02, y0 + 0.14, -0.1, xr + 0.1, y0 + 2.2, 0.06);
      noren(y0 + 2.15);
      col.rect([-hw, -0.1, xr, 0.05], y0, yT); col.rect([xr, -0.1, hw, 0.05], y0 + 2.28, yT);
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
    // the folding shutter (tsuri-mise) propped up over the front, the counter board below it; the curtain over the doma's mouth, cut to the trade
    if (!shutFront) {
      { const t = []; quad2(t, [x0, y0 + 1.5, 0.0], [x1, y0 + 1.5, 0.0], [x1, y0 + 2.45, 1.1], [x0, y0 + 2.45, 1.1]); T('planks_grey', t);
        const t2 = []; quad2(t2, [x0, y0 + 1.46, 0.0], [x1, y0 + 1.46, 0.0], [x1, y0 + 2.41, 1.1], [x0, y0 + 2.41, 1.1]); T(TM, t2);
        for (const x of [x0 + 0.05, x1 - 0.05]) B(WD, x - 0.03, y0, 1.0, x + 0.03, y0 + 2.42, 1.06);
        B(TM, x0, y0 + 0.82, 0.0, x1, y0 + 0.9, 0.55);
        B(WD, x0, y0, 0.0, x1, y0 + 0.82, 0.1);
        B(wm, x0, y0 + H - 0.7, -0.1, x1, y0 + H - 0.28, 0.02);
        col.rect([x0, 0.0, x1, 0.55], y0, y0 + 0.95); col.rect([x0 - 0.05, 0.9, x0 + 0.1, 1.06], y0, y0 + 2.4); }
      noren(y0 + H - 0.3); B(WD, hw - doma, y0 + H - 0.32, 0.0, hw - 0.05, y0 + H - 0.28, 0.1);
    }
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
    if (D.two && !up) { B(TM, x0, y0 + H - 0.1, -d + 0.1, x1, y0 + H, -d / 2); B(WD, x0, y0 + H - 0.2, -d / 2, x1, y0 + H, -d / 2 + 0.1); for (let k = 0; k < 8; k++) B(WD, x1 - 0.5 + 0.0, y0 + fl + k * 0.37, -d / 2 + 0.2, x1 - 0.2, y0 + fl + k * 0.37 + 0.06, -d / 2 + 0.3); }
    buildTrade(trade, { B, L, col }, { x0, x1, y0, fl, qm, d, H, r });
    if (up) upperRooms({ B, T, col }, { hw, d, y0, H, yT, rise, x1, qm, fl, trade, keeper: !!el.keeper, seed: el.seed || 1, wins });
    else { const v = rng((el.seed || 1) * 29 + 11), kind = trade === 'dye' ? 0 : Math.floor(v() * 5); if (kind) middleRoom(kind, { B, L, T, col }, { x1, f0: y0 + fl, zA: -(qm + 1.5), trade }, v); }
  });
}
export const machiyaElements = { machiya_m: machiya };
