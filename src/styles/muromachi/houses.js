// The Muromachi machiya (docs/settlements/muromachi-kyoto.md §5): one storey of posts and boards, a gabled roof of planks
// weighted with stones, the shop front with its hinged shutter (tsuri-mise) propped up and its noren, the earth passage
// (doma) along one side; open inside as a shop with the mats, the hearth and the goods of its trade. Built facing +z (the street).
import { fromTriangles } from '../../core/geom.js';
import { local, tatami, quad2, rng, WD, TM } from './kit.js';

const WALLS = ['planks_grey', 'planks_grey', 'mud_plaster', 'plaster_grey'];
export const TRADES = ['cloth', 'sake', 'pottery', 'rice', 'tea', 'lacquer'];

/** The gabled roof of planks with its stones: ridge along x at z = −d/2, eaves out by o in front, rear one; returns nothing. */
function plankRoof(T, B, w, d, yE, rise, o, stones, r) {
  const zr = -d / 2, zf = o, zb = -d - 0.8, X = w / 2 + 0.45, top = [], und = [], gab = [];
  quad2(top, [-X, yE, zf], [X, yE, zf], [X, yE + rise, zr], [-X, yE + rise, zr]);
  quad2(top, [-X, yE + rise, zr], [X, yE + rise, zr], [X, yE, zb], [-X, yE, zb]);
  quad2(und, [-X, yE - 0.18, zf], [X, yE - 0.18, zf], [X, yE + rise - 0.18, zr], [-X, yE + rise - 0.18, zr]);
  quad2(und, [-X, yE + rise - 0.18, zr], [X, yE + rise - 0.18, zr], [X, yE - 0.18, zb], [-X, yE - 0.18, zb]);
  quad2(und, [-X, yE - 0.18, zf], [X, yE - 0.18, zf], [X, yE, zf], [-X, yE, zf]); quad2(und, [-X, yE - 0.18, zb], [X, yE - 0.18, zb], [X, yE, zb], [-X, yE, zb]);
  for (const sx of [-1, 1]) { const x = sx * (w / 2 - 0.02); quad2(gab, [x, yE, zf - 0.3], [x, yE, zb + 0.2], [x, yE + rise - 0.2, zr], [x, yE + rise - 0.2, zr]); }
  T('planks_grey', top); T('timber', und); T('planks_grey', gab);
  B(WD, -X - 0.1, yE + rise - 0.02, zr - 0.12, X + 0.1, yE + rise + 0.1, zr + 0.12);
  if (stones) {
    const sl = rise / (-zr + zf) * 1;
    for (const side of [1, -1]) for (let q = 0; q < 3; q++) {
      const t = 0.2 + q * 0.28, z = side > 0 ? zr + (zf - zr) * t : zr + (zb - zr) * t, y = yE + rise * (1 - t);
      for (let x = -w / 2 + 0.35 + r() * 0.3; x < w / 2 - 0.25; x += 0.75 + r() * 0.3) B('granite_grey', x, y - 0.02 + (side > 0 ? 0 : 0), z - 0.12, x + 0.22 + r() * 0.12, y + 0.1 + r() * 0.05, z + 0.12);
    }
    void sl;
  }
}

function machiya(el, ctx) {
  local(el, ctx, ({ bag, col, B, T, L }, y0) => {
    const r = rng(el.seed || 1), w = el.w ?? 6, d = el.d ?? 11, wm = WALLS[Math.floor(r() * 4)], H = 3.0 + r() * 0.5, rise = 1.4 + r() * 0.5, open = !!el.open;
    const hw = w / 2, fl = 0.45, doma = 1.6, trade = el.trade || TRADES[Math.floor(r() * TRADES.length)];
    // the foot, posts and beams
    for (const sx of [-1, 1]) B('granite_block', sx * hw - 0.2, y0, -0.2, sx * hw + 0.2, y0 + 0.2, 0.2);
    B('granite_block', -hw, y0, -d, hw, y0 + 0.14, -d + 0.1);
    for (const sx of [-1, 1]) { B(WD, sx * hw - 0.09, y0 + 0.2, -0.1, sx * hw + 0.09, y0 + H, 0.1); B(WD, sx * hw - 0.09, y0 + 0.14, -d + 0.1, sx * hw + 0.09, y0 + H, -d + 0.3); }
    B(WD, -hw - 0.05, y0 + H - 0.28, -0.1, hw + 0.05, y0 + H, 0.14);                                  // the head beam
    B(WD, -hw - 0.05, y0 + H - 0.28, -d, -hw + 0.1, y0 + H, 0); B(WD, hw - 0.1, y0 + H - 0.28, -d, hw + 0.05, y0 + H, 0);
    // the side walls and the back
    for (const sx of [-1, 1]) B(wm, sx > 0 ? hw - 0.1 : -hw, y0 + 0.14, -d + 0.1, sx > 0 ? hw : -hw + 0.1, y0 + H - 0.28, -0.1);
    B(wm, -hw, y0 + 0.14, -d, hw, y0 + H - 0.28, -d + 0.1);
    for (let z = -2.2; z > -d + 0.5; z -= 2.2) for (const sx of [-1, 1]) B(WD, sx * hw - 0.07, y0 + 0.14, z - 0.07, sx * hw + 0.07, y0 + H - 0.28, z + 0.07);
    col.rect([-hw, -d, -hw + 0.12, 0], y0, y0 + H); col.rect([hw - 0.12, -d, hw, 0], y0, y0 + H); col.rect([-hw, -d, hw, -d + 0.12], y0, y0 + H);
    // the roof
    plankRoof(T, B, w, d, y0 + H, rise, 1.0, true, r);
    for (let x = -hw - 0.3; x <= hw + 0.3; x += 0.6) B(WD, x - 0.04, y0 + H - 0.4, 0.1, x + 0.04, y0 + H - 0.22, 1.0);          // the rafter ends under the front eave
    col.rect([-hw, -d, hw, 0], y0 + H, y0 + H + rise);
    if (!open) {
      // closed front: boards on the posts, a door leaf, a noren
      B(wm, -hw + 0.1, y0 + 0.14, -0.1, hw - 0.1, y0 + H - 0.28, 0.02);
      B(TM, hw - doma - 0.4, y0 + 0.14, 0.02, hw - 0.3, y0 + 2.2, 0.08);
      B('cloth_indigo', hw - doma - 0.3, y0 + 0.9, 0.1, hw - 0.4, y0 + 2.1, 0.12);
      col.rect([-hw, -0.1, hw, 0.05], y0, y0 + H); col.floor([-hw, -d, hw, 0], y0 + fl);
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
      B(TM, x0, y0 + 0.82, 0.0, x1, y0 + 0.9, 0.55);                                                    // the counter board
      B(WD, x0, y0, 0.0, x1, y0 + 0.82, 0.1);
      col.rect([x0, 0.0, x1, 0.55], y0, y0 + 0.95); col.rect([x0 - 0.05, 0.9, x0 + 0.1, 1.06], y0, y0 + 2.4); }
    // the noren over the doma's mouth: indigo panels with a white mark, and a sign board on its post
    { const n = 3, wd = (doma - 0.2) / n; for (let k = 0; k < n; k++) { const a = hw - doma + 0.1 + k * wd; B('cloth_indigo', a + 0.01, y0 + 1.15, 0.03, a + wd - 0.01, y0 + H - 0.3, 0.06); B('cloth_white', a + wd / 2 - 0.1, y0 + H - 0.9, 0.062, a + wd / 2 + 0.1, y0 + H - 0.55, 0.066); } B(WD, hw - doma, y0 + H - 0.32, 0.0, hw - 0.05, y0 + H - 0.28, 0.1);
      B(WD, hw + 0.25, y0, 0.55, hw + 0.31, y0 + 1.1, 0.61); B('wood_painted', hw + 0.1, y0 + 1.1, 0.5, hw + 0.46, y0 + 1.9, 0.56); B('lacquer_black', hw + 0.22, y0 + 1.25, 0.58, hw + 0.34, y0 + 1.75, 0.59); }
    // the back of the shop: sliding screens between it and the rooms behind, one drawn aside
    for (let k = 0; k < 4; k++) if (k !== 1) { const a = x0 + k * (x1 - x0) / 4; B('shoji', a + 0.02, y0 + fl, -d + 2.4, a + (x1 - x0) / 4 - 0.02, y0 + H - 0.4, -d + 2.43); }
    // the hearth (irori) in the room behind, a kettle on its hook; a shelf with bowls
    { const cx = (x0 + x1) / 2, cz = -d + 1.4; for (const [a, b, c, e] of [[-0.45, -0.45, 0.45, -0.38], [-0.45, 0.38, 0.45, 0.45], [-0.45, -0.38, -0.38, 0.38], [0.38, -0.38, 0.45, 0.38]]) B(WD, cx + a, y0 + fl - 0.04, cz + b, cx + c, y0 + fl + 0.05, cz + e);
      B('plaster_grey', cx - 0.38, y0 + fl - 0.03, cz - 0.38, cx + 0.38, y0 + fl, cz + 0.38); B('flame', cx - 0.05, y0 + fl, cz - 0.05, cx + 0.05, y0 + fl + 0.07, cz + 0.05);
      L('iron', [[0.001, 0], [0.14, 0.03], [0.17, 0.12], [0.1, 0.2], [0.001, 0.21]], 10, cx, y0 + fl + 0.55, cz); B(WD, cx - 0.01, y0 + fl + 0.76, cz - 0.01, cx + 0.01, y0 + H - 0.4, cz + 0.01);
      for (let k = 0; k < 3; k++) L('pottery_dark', [[0.001, 0], [0.05, 0], [0.08, 0.06], [0.001, 0.05]], 8, x0 + 0.5 + k * 0.3, y0 + fl + 0.9, -d + 0.3);
      B(TM, x0 + 0.3, y0 + fl + 0.86, -d + 0.15, x0 + 1.3, y0 + fl + 0.9, -d + 0.45); }
    // the trade
    const g = (m, a, b, c, dd, e, f) => B(m, a, b, c, dd, e, f);
    if (trade === 'cloth') { const cols = ['cloth_indigo', 'cloth_red', 'linen', 'cloth_brown', 'cloth_green', 'cloth_ochre']; for (let s = 0; s < 3; s++) for (let k = 0; k < 6; k++) g(cols[(k + s) % 6], x0 + 0.2 + k * 0.32, y0 + fl + 0.1 + s * 0.4, -qm - 0.05 - 0.02, x0 + 0.5 + k * 0.32, y0 + fl + 0.3 + s * 0.4 + (k % 2) * 0.06, -qm + 0.3); B(WD, x0 + 0.1, y0 + fl, -qm - 0.08, x1 - 0.1, y0 + fl + 1.3, -qm - 0.04); }
    else if (trade === 'sake') { for (let k = 0; k < 4; k++) { L('timber', [[0.001, 0], [0.28, 0], [0.32, 0.25], [0.33, 0.5], [0.3, 0.8], [0.001, 0.8]], 12, x0 + 0.5 + k * 0.62, y0 + fl, -qm - 0.45); L('iron', [[0.3, 0.2], [0.33, 0.2], [0.33, 0.24], [0.3, 0.24]], 12, x0 + 0.5 + k * 0.62, y0 + fl, -qm - 0.45); } B('lacquer_black', x0 + 0.3, y0 + fl, -1.4, x0 + 1.1, y0 + fl + 0.3, -0.8); }
    else if (trade === 'pottery') { for (let s = 0; s < 3; s++) { B(TM, x0 + 0.2, y0 + fl + s * 0.45, -qm - 0.1 + s * 0.0, x1 - 0.2, y0 + fl + s * 0.45 + 0.04, -qm + 0.3); for (let k = 0; k < 6; k++) L(s === 1 ? 'glaze_green' : 'pottery_dark', [[0.001, 0], [0.07, 0], [0.12, 0.1], [0.08, 0.2], [0.001, 0.2]], 8, x0 + 0.4 + k * 0.38, y0 + fl + s * 0.45 + 0.04, -qm + 0.1); } }
    else if (trade === 'rice') { for (let s = 0; s < 3; s++) for (let k = 0; k < 3 - s; k++) { const gg = []; B('thatch', x0 + 0.2 + k * 0.7 + s * 0.35, y0 + fl + 0.03 + s * 0.42, -qm - 0.3, x0 + 0.8 + k * 0.7 + s * 0.35, y0 + fl + 0.03 + s * 0.42 + 0.4, -qm + 0.3); void gg; } }
    else if (trade === 'tea') { B(TM, x0 + 0.1, y0 + fl, -1.5, x1 - 0.1, y0 + fl + 0.1, -0.7); B('cloth_red', x0 + 0.12, y0 + fl + 0.1, -1.48, x1 - 0.12, y0 + fl + 0.13, -0.72); L('iron', [[0.001, 0], [0.12, 0.02], [0.16, 0.12], [0.1, 0.2], [0.001, 0.22]], 10, x1 - 0.5, y0 + fl, -0.5); for (let k = 0; k < 3; k++) L('glaze_white', [[0.001, 0], [0.04, 0], [0.06, 0.05], [0.001, 0.05]], 8, x0 + 0.4 + k * 0.25, y0 + fl + 0.1, -1.1); }
    else { for (let s = 0; s < 3; s++) { B(TM, x0 + 0.2, y0 + fl + s * 0.45, -qm - 0.1, x1 - 0.2, y0 + fl + s * 0.45 + 0.04, -qm + 0.3); for (let k = 0; k < 5; k++) L(k % 2 ? 'lacquer_red' : 'lacquer_black', [[0.001, 0], [0.06, 0], [0.1, 0.06], [0.11, 0.1], [0.001, 0.08]], 10, x0 + 0.4 + k * 0.42, y0 + fl + s * 0.45 + 0.04, -qm + 0.1); } }
    col.rect([x0, -qm - 0.1, x1, -qm + 0.35], y0 + fl, y0 + fl + 1.4);
  });
}

/** A fence of split bamboo (kakine) a → b, h high: posts, rails, upright culms; with the ground height y. */
function bambooFence(el, { bag, col }) {
  const [ax, az] = el.a, [bx, bz] = el.b, L = Math.hypot(bx - ax, bz - az), h = el.h ?? 1.5, y = el.y ?? 0, u = [(bx - ax) / L, (bz - az) / L], n = Math.max(1, Math.round(L / 2));
  const t = []; const bx3 = (x0, y0, z0, x1, y1, z1) => bag.add('bamboo_culm', box3(x0, y0, z0, x1, y1, z1));
  for (let i = 0; i <= n; i++) { const x = ax + u[0] * L * i / n, z = az + u[1] * L * i / n; bag.add(WD, box3(x - 0.05, y, z - 0.05, x + 0.05, y + h + 0.1, z + 0.05)); }
  const alongX = Math.abs(u[0]) > Math.abs(u[1]);
  for (const hy of [0.25, h * 0.55, h - 0.05]) bx3(Math.min(ax, bx) - (alongX ? 0 : 0.04), y + hy, Math.min(az, bz) - (alongX ? 0.04 : 0), Math.max(ax, bx) + (alongX ? 0 : 0.04), y + hy + 0.05, Math.max(az, bz) + (alongX ? 0.04 : 0));
  for (let s = 0.12; s < L; s += 0.14) { const x = ax + u[0] * s, z = az + u[1] * s; bx3(x - 0.025, y, z - 0.025, x + 0.025, y + h, z + 0.025); }
  col.segment(el.a, el.b, 0.2, y, y + h); void t;
}
import { box as box3 } from '../../core/geom.js';
void fromTriangles;
export const houseElements = { machiya_m: machiya, bamboo_fence: bambooFence };
