// The torii and shrine hall, the Noh stage with its bridge and three pines, the tea hut with its roji, the stone-lined
// stream and its bridges (docs/settlements/muromachi-kyoto.md §5).
import { STYLES } from '../../core/build.js';
import { box, lathe } from '../../core/geom.js';
import { local, tatami, quad2, rng, WD, PL, BARK, TM } from './kit.js';

function torii(el, ctx) {
  local(el, ctx, ({ B, L, col }, y0) => {
    const s = el.s ?? 1, hw = 2.1 * s, h = 4.6 * s, r = 0.26 * s;
    for (const sx of [-1, 1]) { L('lacquer_red', [[r * 1.25, 0], [r * 1.25, 0.25], [r, 0.3], [r * 0.9, h]], 14, sx * hw, y0, 0); B('granite_grey', sx * hw - r * 1.6, y0 - 0.1, -r * 1.6, sx * hw + r * 1.6, y0 + 0.1, r * 1.6); col.circle(sx * hw, 0, r * 1.2, y0, y0 + h); }
    B('lacquer_red', -hw - r * 1.2, y0 + h * 0.74, -0.15 * s, hw + r * 1.2, y0 + h * 0.74 + 0.28 * s, 0.15 * s);                          // the tie beam (nuki)
    B('lacquer_black', -hw - 1.5 * s, y0 + h + 0.14 * s, -0.3 * s, hw + 1.5 * s, y0 + h + 0.34 * s, 0.3 * s);                           // the lintel (kasagi)
    B('lacquer_black', -hw - 1.3 * s, y0 + h + 0.34 * s, -0.25 * s, hw + 1.3 * s, y0 + h + 0.46 * s, 0.25 * s);
    B('lacquer_red', -hw - 1.5 * s, y0 + h + 0.34 * s, -0.3 * s, -hw - 1.2 * s, y0 + h + 0.55 * s, 0.3 * s); B('lacquer_red', hw + 1.2 * s, y0 + h + 0.34 * s, -0.3 * s, hw + 1.5 * s, y0 + h + 0.55 * s, 0.3 * s);
    B('lacquer_red', -hw - r, y0 + h - 0.2 * s, -0.2 * s, hw + r, y0 + h + 0.14 * s, 0.2 * s);                                          // the shimaki under it
    B('wood_painted', -0.28 * s, y0 + h * 0.74 + 0.28 * s, -0.04, 0.28 * s, y0 + h * 0.74 + 1.0 * s, 0.04);                             // the tablet
  });
}

function shrineHall(el, ctx) {
  local(el, ctx, ({ bag, col, B, L }, y0) => {
    const w = el.w ?? 9, d = el.d ?? 6, hw = w / 2, F = 1.0, H = 3.0, y1 = y0 + F;
    for (let i = 0; i <= 4; i++) for (const z of [-d, 0]) { const x = -hw + i * w / 4; B('granite_grey', x - 0.2, y0, z - 0.2 - d / 2 + d / 2 * 0, x + 0.2, y0 + 0.3, z + 0.2); B('cedar', x - 0.11, y0 + 0.3, z - 0.11, x + 0.11, y1 + H, z + 0.11); }
    B(TM, -hw - 0.5, y1 - 0.25, -d - 0.4, hw + 0.5, y1, 0.9);
    B('cedar', -hw, y1, -d - 0.04, hw, y1 + H, -d + 0.08); for (const sx of [-1, 1]) B('cedar', sx > 0 ? hw - 0.08 : -hw, y1, -d, sx > 0 ? hw : -hw + 0.08, y1 + H, 0);
    B('opening', -hw + 0.4, y1, -0.25, hw - 0.4, y1 + H - 0.5, -0.15); B(WD, -hw, y1 + H - 0.4, -0.3, hw, y1 + H, 0.1);
    for (let x = -hw + 0.4; x < hw - 0.3; x += 1.2) B('koshi', x, y1, -0.14, x + 0.04, y1 + 2.4, -0.1);
    col.rect([-hw, -d - 0.05, hw, -0.4], y0, y1 + H); col.floor([-hw - 0.5, -0.4, hw + 0.5, 0.9], y1);
    for (let k = 0; k < 3; k++) B('granite_grey', -1.1, y0 + k * (F / 3), 0.9 + (2 - k) * 0.35, 1.1, y0 + (k + 1) * (F / 3), 0.9 + (3 - k) * 0.35);
    col.ramp([-1.1, 0.9, 1.1, 1.95], y0, y1, 'n');
    B('lacquer_red', -hw - 0.5, y1, 0.85, hw + 0.5, y1 + 0.82, 0.92); B(WD, -0.5, y1 + 0.05, 0.3, 0.5, y1 + 0.45, 0.9);               // the rail, the offering box (saisen)
    STYLES.japanese.elements.irimoya({ c: [0, -d / 2 + 0.2], A: hw + 1.3, B: d / 2 + 1.5, y: y1 + H + 0.2, rise: 2.8, lift: 0.5, gable: 0.4, mat: BARK, soffit: TM }, { bag, col });
    for (const sx of [-1, 1]) for (const dz of [-0.5, 0.5]) B('cedar', sx * (hw + 0.1 - 0.0) - 0.04 + dz * 0.0, y1 + H + 2.9, -d / 2 + 0.2 + dz * 0.25 - 0.02, sx * (hw + 0.1) + 0.04, y1 + H + 3.7, -d / 2 + 0.2 + dz * 0.25 + 0.02);   // the crossed finials (chigi), approximated
    for (let k = 0; k < 5; k++) { B('rope_fibre', -2 + k * 1.0 - 0.5, y1 + H - 0.6, 0.55, -2 + k * 1.0 + 0.5, y1 + H - 0.52, 0.6); B('cloth_white', -2 + k * 1.0, y1 + H - 1.0, 0.56, -2 + k * 1.0 + 0.12, y1 + H - 0.6, 0.58); }
  });
}

function pine(B, L, x, y, z, s = 1, tiers = 3) {
  L('bark_pine', [[0.14 * s, 0], [0.1 * s, 0.6 * s], [0.08 * s, 1.1 * s]], 8, x, y, z);
  for (let k = 0; k < tiers; k++) L('cloth_green', [[0.001, 0], [(0.9 - k * 0.2) * s, 0.0], [(0.8 - k * 0.2) * s, 0.22 * s], [0.001, 0.3 * s]], 10, x + (k % 2 ? 0.15 : -0.1) * s, y + (0.7 + k * 0.28) * s, z);
}

function nohStage(el, ctx) {
  local(el, ctx, ({ bag, col, B, L, T }, y0) => {
    const h = 2.85, F = 0.95, y1 = y0 + F, H = 3.3;
    B('pebbles', -h - 6, y0 - 0.1, h, h + 7, y0 + 0.05, h + 5);                                                   // the white gravel before the stage
    for (const [x, z] of [[-h, -h], [h, -h], [-h, h], [h, h]]) { B('granite_grey', x - 0.25, y0, z - 0.25, x + 0.25, y0 + 0.3, z + 0.25); B('cedar', x - 0.12, y0 + 0.3, z - 0.12, x + 0.12, y1 + H, z + 0.12); col.circle(x, z, 0.17, y0, y1 + H); }
    B('cedar', -h, y1 - 0.3, -h, h, y1, h);                                                                           // the stage's floor of polished cypress
    for (let x = -h + 0.4; x < h; x += 0.4) B(WD, x, y1, -h, x + 0.012, y1 + 0.002, h);
    col.floor([-h, -h, h, h], y1);
    // the musicians' seat at the rear, the chorus seat to the right, the bridge to the left rear
    B('cedar', -h, y1 - 0.3, -h - 1.9, h, y1, -h); col.floor([-h, -h - 1.9, h, -h], y1);
    B('cedar', h, y1 - 0.3, -1.6, h + 1.5, y1, 1.6); col.floor([h, -1.6, h + 1.5, 1.6], y1);
    B('cedar', -h - 8.2, y1 - 0.3, -h - 1.9, -h, y1, -h + 1.7); col.floor([-h - 8.2, -h - 1.9, -h, -h + 1.7], y1);
    for (let k = 0; k < 4; k++) B(WD, -h - 8.0 + k * 2.2, y0 + 0.2, -h - 1.8, -h - 7.8 + k * 2.2, y1 - 0.3, -h - 1.6);
    B(WD, -h - 8.2, y1, -h + 1.7, -h, y1 + 0.55, -h + 1.76); col.rect([-h - 8.2, -h + 1.66, -h, -h + 1.8], y1, y1 + 0.5);    // the bridge's rail on the audience side
    for (let k = 0; k < 3; k++) { B('pebbles', -h - 2.6 - k * 2.4 - 0.6, y0 - 0.05, -h + 1.8, -h - 2.6 - k * 2.4 + 0.6, y0 + 0.06, -h + 3.0); pine(B, L, -h - 2.6 - k * 2.4, y0 + 0.05, -h + 2.4, 0.9); col.circle(-h - 2.6 - k * 2.4, -h + 2.4, 0.5, y0, y0 + 1.5); }
    // the mirror room at the far end of the bridge: a little house with the five-colour curtain
    { const x0 = -h - 10.6, x1 = -h - 8.2; B(WD, x0, y0, -h - 1.9, x1, y1, -h + 1.7); B('cedar', x0, y1, -h - 1.9, x1, y1 + 2.6, -h + 1.7); col.rect([x0, -h - 1.9, x1, -h + 1.7], y0, y1 + 2.7);
      STYLES.japanese.elements.irimoya({ c: [(x0 + x1) / 2, -h - 0.1], A: 1.9, B: 2.9, y: y1 + 2.6, rise: 1.4, lift: 0.3, gable: 0.5, mat: BARK, soffit: TM, alongZ: true }, { bag, col });
      const cl = ['cloth_green', 'cloth_red', 'cloth_white', 'cloth_ochre', 'cloth_indigo']; for (let k = 0; k < 5; k++) B(cl[k], x1 + 0.01, y1 + 0.2, -h - 1.5 + k * 0.6, x1 + 0.05, y1 + 2.1, -h - 0.9 + k * 0.6); }
    // the roof on its four posts, the painted pine on the back board (kagami-ita), the little door (kirido)
    B('wood_painted', -h + 0.3, y1 + 0.1, -h - 1.85, h - 0.3, y1 + 2.8, -h - 1.78);
    B('lacquer_black', -0.12, y1 + 0.4, -h - 1.78, 0.12, y1 + 1.9, -h - 1.76);
    for (const [x, y, rr] of [[-1.3, 2.0, 1.0], [1.2, 2.2, 1.1], [0, 2.55, 1.0], [-0.8, 1.45, 0.7], [0.9, 1.5, 0.7]]) B('cloth_green', x - rr / 2, y1 + y - 0.1, -h - 1.775, x + rr / 2, y1 + y + 0.1, -h - 1.765);
    B('lacquer_black', h + 0.5, y1 + 0.4, -h - 1.9, h + 1.3, y1 + 1.4, -h - 1.84);                                    // (the kirido, in the rear wall's right end)
    STYLES.japanese.elements.irimoya({ c: [0.3, 0.0], A: h + 1.7, B: h + 1.5, y: y1 + H, rise: 3.1, lift: 0.6, gable: 0.4, mat: BARK, soffit: TM }, { bag, col });
    // the stage's front steps (shirasu-bashigo): a short flight
    for (let k = 0; k < 3; k++) B(TM, -0.7, y0 + k * 0.3, h + (2 - k) * 0.4, 0.7, y0 + (k + 1) * 0.3 - 0.0, h + (3 - k) * 0.4);
    col.ramp([-0.7, h, 0.7, h + 1.2], y0, y1 - 0.05, 'n');
    void T; void PL; void tatami; void quad2; void rng;
  });
}

/** The tea hut { at, facing }: a 4½-mat room under a thatched hip roof, earth walls with a bamboo-latticed window, a low sliding door; inside the sunken hearth, the kettle, a scroll and a flower. */
function teaHut(el, ctx) {
  local(el, ctx, ({ bag, col, B, L }, y0) => {
    const hw = 1.65, F = 0.45, y1 = y0 + F, H = 2.3;
    for (const [x, z] of [[-hw, -hw], [hw, -hw], [-hw, hw], [hw, hw]]) { B('granite_grey', x - 0.16, y0, z - 0.16, x + 0.16, y0 + 0.3, z + 0.16); B('bamboo_culm', x - 0.07, y0 + 0.3, z - 0.07, x + 0.07, y1 + H, z + 0.07); }
    B(TM, -hw - 0.1, y1 - 0.15, -hw - 0.1, hw + 0.1, y1, hw + 0.1);
    B('earth_wall', -hw, y1, -hw, hw, y1 + H - 0.1, -hw + 0.12);                                      // the back
    B('earth_wall', -hw, y1, -hw, -hw + 0.12, y1 + H - 0.1, hw);
    B('earth_wall', hw - 0.12, y1, -hw, hw, y1 + 0.75, hw); B('earth_wall', hw - 0.12, y1 + 1.55, -hw, hw, y1 + H - 0.1, hw); B('earth_wall', hw - 0.12, y1 + 0.75, -hw, hw, y1 + 1.55, -0.6); B('earth_wall', hw - 0.12, y1 + 0.75, 0.6, hw, y1 + 1.55, hw);
    for (let k = 0; k < 5; k++) { B('bamboo_culm', hw - 0.1, y1 + 0.75, -0.6 + k * 0.3, hw - 0.06, y1 + 1.55, -0.57 + k * 0.3); } B('shoji', hw - 0.08, y1 + 0.75, -0.6, hw - 0.05, y1 + 1.55, 0.6);
    // the front: an earth wall with the low sliding door (shoji, 0.85 × 1.75), a window above
    B('earth_wall', -hw, y1, hw - 0.12, -0.45, y1 + H - 0.1, hw); B('earth_wall', 0.45, y1, hw - 0.12, hw, y1 + H - 0.1, hw); B('earth_wall', -0.45, y1 + 1.75, hw - 0.12, 0.45, y1 + H - 0.1, hw);
    B('shoji', -0.4, y1, hw - 0.08, 0.4, y1 + 1.75, hw - 0.05); B(WD, -0.45, y1 + 1.75, hw - 0.14, 0.45, y1 + 1.82, hw + 0.02);
    col.rect([-hw, -hw, hw, -hw + 0.12], y0, y1 + H); col.rect([-hw, -hw, -hw + 0.12, hw], y0, y1 + H); col.rect([hw - 0.12, -hw, hw, hw], y0, y1 + H);
    col.rect([-hw, hw - 0.12, -0.45, hw], y0, y1 + H); col.rect([0.45, hw - 0.12, hw, hw], y0, y1 + H);
    B('bamboo_culm', -hw, y1 + H - 0.14, -hw - 0.1, hw, y1 + H, hw + 0.1);
    // the room: mats (4½: the four and the half in the centre with the sunken hearth)
    tatami(B, -hw + 0.12, hw - 0.12, -hw + 0.12, hw - 0.12, y1, true);
    B(WD, -0.3, y1 - 0.02, -0.3, 0.3, y1 + 0.004, 0.3); B('plaster_grey', -0.24, y1 - 0.02, -0.24, 0.24, y1 + 0.003, 0.24); B('flame', -0.04, y1 + 0.002, -0.04, 0.04, y1 + 0.05, 0.04);
    L('iron', [[0.001, 0], [0.12, 0.02], [0.16, 0.1], [0.11, 0.18], [0.001, 0.19]], 10, 0, y1 + 0.35, 0); B(WD, -0.01, y1 + 0.54, -0.01, 0.01, y1 + H - 0.2, 0.01);
    col.floor([-hw + 0.1, -hw + 0.1, hw - 0.1, hw - 0.1], y1);
    // on the back wall: the hanging scroll, a bamboo vase with one flower; the utensils on the mat
    B('cloth_ochre', -0.2, y1 + 0.6, -hw + 0.12, 0.2, y1 + 1.7, -hw + 0.14); B('linen', -0.16, y1 + 0.7, -hw + 0.14, 0.16, y1 + 1.6, -hw + 0.15);
    B('bamboo_culm', 0.55, y1 + 0.0, -hw + 0.2, 0.62, y1 + 0.35, -hw + 0.27); B('cloth_red', 0.56, y1 + 0.35, -hw + 0.21, 0.61, y1 + 0.48, -hw + 0.26);
    L('glaze_green', [[0.001, 0], [0.05, 0], [0.09, 0.06], [0.001, 0.07]], 10, -0.6, y1, -0.7); L('pottery_dark', [[0.001, 0], [0.04, 0], [0.06, 0.08], [0.04, 0.1], [0.001, 0.1]], 8, -0.8, y1, -0.5);
    // the step stone, the roof
    B('granite_grey', -0.55, y0, hw + 0.2, 0.55, y0 + 0.2, hw + 0.7); col.ramp([-0.55, hw, 0.55, hw + 0.7], y0, y1 - 0.15, 'n');
    STYLES.japanese.elements.irimoya({ c: [0, 0], A: hw + 0.9, B: hw + 0.9, y: y1 + H - 0.05, rise: 1.9, lift: 0.1, gable: 1, mat: 'thatch', soffit: 'thatch', gableMat: 'thatch' }, { bag, col });
  });
}

/** The roji garden { rect, seed }: stepping stones, a stone basin (tsukubai) with its bamboo spout, a lantern, moss. */
function roji(el, ctx) {
  local(el, ctx, ({ B, L, col }, y0) => {
    const r = rng(el.seed || 5);
    let x = 0, z = 1.2;
    for (let k = 0; k < 9; k++) { x += (r() - 0.5) * 0.7; z += 0.7 + r() * 0.2; const R = 0.22 + r() * 0.1; L('granite_grey', [[0.001, -0.05], [R, -0.05], [R * 1.05, 0.04], [R * 0.9, 0.09], [0.001, 0.09]], 8, x, y0, z); }
    L('granite_grey', [[0.001, 0], [0.3, 0], [0.32, 0.28], [0.22, 0.3], [0.2, 0.36], [0.001, 0.36]], 10, x + 1.0, y0, z - 3.1); L('water', [[0.001, 0.3], [0.2, 0.3]], 10, x + 1.0, y0, z - 3.1);
    B('bamboo_culm', x + 1.4, y0 + 0.2, z - 3.1, x + 1.9, y0 + 0.26, z - 3.04); col.circle(x + 1.0, z - 3.1, 0.35, y0, y0 + 0.4);
  });
}

/** A stone-lined stream { x0, x1 (the water's edges), z0, z1, level, bed, top }: granite banks and the water. */
function stream(el, { bag, col }) {
  const { x0, x1, z0, z1, level, bed, top } = el, T = el.th ?? 0.5;
  bag.add('granite_block', box(x0 - T, bed, z0, x0, top, z1)); bag.add('granite_block', box(x1, bed, z0, x1 + T, top, z1));
  bag.add('silt', box(x0, bed - 0.3, z0, x1, bed, z1));
  bag.add('water', box(x0, level - 0.05, z0, x1, level, z1));
  for (const [a, b] of [[x0 - T, x0], [x1, x1 + T]]) col.rect([a, z0, b, z1], bed, top);
  col.rect([x0, z0, x1, z1], bed - 0.3, level - 0.5);
}

/** A slab bridge over the stream { at: [x, z] (centre), across: 'x' (spans x), len, w, y }: granite slabs on two piers, no rails; or plank with rails when el.plank. */
function slabBridge(el, { bag, col }) {
  const [cx, cz] = el.at, L = el.len, w = el.w ?? 2.4, y = el.y ?? 0, ax = (el.across ?? 'x') === 'x';
  const r = ax ? [cx - L / 2, cz - w / 2, cx + L / 2, cz + w / 2] : [cx - w / 2, cz - L / 2, cx + w / 2, cz + L / 2];
  bag.add(el.plank ? 'timber' : 'granite_block', box(r[0], y - 0.3, r[1], r[2], y, r[3]));
  col.floor(r, y);
  if (el.plank) for (const s of [-1, 1]) {
    const a = ax ? [r[0], cz + s * w / 2] : [cx + s * w / 2, r[1]], b = ax ? [r[2], cz + s * w / 2] : [cx + s * w / 2, r[3]];
    bag.add('lacquer_red', box(Math.min(a[0], b[0]) - 0.04, y + 0.8, Math.min(a[1], b[1]) - 0.04, Math.max(a[0], b[0]) + 0.04, y + 0.88, Math.max(a[1], b[1]) + 0.04));
    for (let k = 0; k <= 4; k++) { const px = a[0] + (b[0] - a[0]) * k / 4, pz = a[1] + (b[1] - a[1]) * k / 4; bag.add('lacquer_red', box(px - 0.05, y, pz - 0.05, px + 0.05, y + 0.9, pz + 0.05)); }
    col.segment(a, b, 0.12, y, y + 0.9);
  }
  void lathe;
}

export const sacredElements = { torii, shrine_hall: shrineHall, noh_stage: nohStage, tea_hut: teaHut, roji, stream, slab_bridge: slabBridge };
