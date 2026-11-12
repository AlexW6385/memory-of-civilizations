// The courtyard houses of Karakorum's quarters (docs/settlements/mongol-karakorum.md §3, §6, §11): a walled court of sun-dried brick, the house
// along the back with a door, latticed windows and a flat roof on poplar beams, a furnished room (or two, and a stair to an upper room in the
// taller ones), the court dressed at eye level (oven, dung-cake stack, jars, a bench, a ladder, a laundry line, a cheese rack), and the weathering
// of mud brick in a dry wind (patches where the plaster has fallen, cracks, a slumped breach in a wall with its rubble). { rect, gate, seed, floors, dome }
import { rectRoof } from '../ming/index.js';
import { addCloth, clothBox } from '../../core/geom.js';
import { box, rod, lathe, obox, rng, TAU } from './util.js';
import { wallRun } from './hall.js';
import { Local, frontFrame } from './local.js';

/** Dress a set of local-coordinate rooms with the furniture of a trade; room = [u0, v0, u1, v1] (v negative inside), floor at y. */
export function furnishRoom(L, kind, room, y, rand, H = 3.2) {
  const [u0, v0, u1, v1] = room, W = u1 - u0, cu = (u0 + u1) / 2;
  const backV = Math.min(v0, v1), frontV = Math.max(v0, v1);
  const carpets = ['cloth_red', 'cloth_blue', 'cloth_green', 'cloth_ochre', 'cloth_maroon', 'cloth_indigo'];
  const pc = () => carpets[Math.floor(rand() * carpets.length)];
  // a felt-and-carpet floor in two layers, a lamp from the beam
  L.box('cloth_ochre', u0 + 0.3, backV + 0.4, u1 - 0.3, frontV - 0.5, y, y + 0.012);
  L.box(pc(), u0 + 0.7, backV + 0.9, u1 - 0.7, frontV - 1.0, y + 0.012, y + 0.024);
  L.box(pc(), u0 + 1.0, backV + 1.2, u1 - 1.0, frontV - 1.3, y + 0.024, y + 0.034);
  L.rod('iron', [cu, y + H - 0.25, (backV + frontV) / 2], [cu, y + H - 0.9, (backV + frontV) / 2], 0.008, 3);
  L.lathe('lamp_paper', [[0.001, 0], [0.15, 0.1], [0.15, 0.3], [0.001, 0.4]], 8, cu, (backV + frontV) / 2, y + H - 1.3);
  // the niche shelf in the back wall with jars, a hanging cloth
  for (let k = 0; k < 3; k++) {
    const nu = u0 + 0.8 + k * (W - 1.6) / 2;
    L.box('opening', nu - 0.35, backV + 0.02, nu + 0.35, backV + 0.14, y + 1.0, y + 1.7);
    L.box('timber', nu - 0.4, backV + 0.02, nu + 0.4, backV + 0.18, y + 0.98, y + 1.0);
    L.lathe(k % 2 ? 'glaze_blue' : 'glaze_green', [[0.001, 0], [0.09, 0.03], [0.11, 0.14], [0.06, 0.24], [0.07, 0.28], [0.001, 0.28]], 8, nu, backV + 0.1, y + 1.0);
  }
  L.box(pc(), u0 + 0.5, backV + 0.02, u0 + 2.1, backV + 0.05, y + 1.9, y + 2.9);
  if (kind === 'merchant') {
    // bales of cloth in stacks, a trader's scale-table, a strongbox, rolled carpets leaning in the corner, sacks of spice
    for (let k = 0; k < 3; k++) for (let s = 0; s < 3 - k; s++) {
      L.box(['cloth_red', 'cloth_blue', 'cloth_white', 'cloth_ochre'][(k + s) % 4], u1 - 1.5 + k * 0.0 - 0.0, backV + 0.4 + k * 0.9, u1 - 0.5, backV + 1.2 + k * 0.9, y + s * 0.38, y + s * 0.38 + 0.36, s === 0);
    }
    L.box('wood_dark', u0 + 0.5, backV + 0.5, u0 + 1.7, backV + 1.3, y, y + 0.8, true);
    L.box('gilt_bronze', u0 + 0.52, backV + 1.3, u0 + 1.68, backV + 1.33, y + 0.5, y + 0.58);
    L.lathe('bronze', [[0.001, 0], [0.12, 0.01], [0.12, 0.03], [0.001, 0.03]], 8, u0 + 1.1, backV + 0.9, y + 0.8);
    for (let k = 0; k < 4; k++) L.rod(['cloth_red', 'cloth_blue', 'cloth_green', 'cloth_maroon'][k], [u0 + 0.3 + k * 0.17, y, backV + 0.22], [u0 + 0.3 + k * 0.17 + 0.06, y + 1.4, backV + 0.3], 0.07, 6);
    for (let k = 0; k < 3; k++) L.lathe('sacking', [[0.001, 0], [0.26, 0.02], [0.3, 0.2], [0.22, 0.4], [0.001, 0.44]], 8, cu - 0.6 + k * 0.6, backV + 0.5, y);
  } else if (kind === 'craft') {
    // a loom: two uprights, beams, the warp, the web half woven; a stool, a heap of wool, a spindle, a trough of dye
    const lu = cu - 0.2, lv = backV + 1.3;
    L.rod('timber', [lu - 0.9, y, lv], [lu - 0.9, y + 1.6, lv], 0.05, 5); L.rod('timber', [lu + 0.9, y, lv], [lu + 0.9, y + 1.6, lv], 0.05, 5);
    L.rod('timber', [lu - 0.9, y + 1.5, lv], [lu + 0.9, y + 1.5, lv], 0.04, 5); L.rod('timber', [lu - 0.9, y + 0.3, lv], [lu + 0.9, y + 0.3, lv], 0.04, 5);
    for (let k = 0; k < 11; k++) L.rod('linen', [lu - 0.8 + k * 0.16, y + 0.3, lv], [lu - 0.8 + k * 0.16, y + 1.5, lv], 0.004, 3);
    L.box('cloth_red', lu - 0.8, lv - 0.01, lu + 0.8, lv + 0.01, y + 0.32, y + 0.8);
    L.box('cloth_blue', lu - 0.8, lv - 0.01, lu + 0.8, lv + 0.01, y + 0.8, y + 0.95);
    L.box('timber', lu - 0.3, lv + 0.7, lu + 0.3, lv + 1.1, y, y + 0.38, true);
    for (let k = 0; k < 3; k++) L.lathe('cloth_white', [[0.001, 0], [0.3, 0.02], [0.34, 0.18], [0.2, 0.3], [0.001, 0.32]], 8, u1 - 0.8, backV + 0.6 + k * 0.7, y);
    L.box('wood_dark', u0 + 0.4, backV + 0.4, u0 + 1.4, backV + 1.1, y, y + 0.45, true);
    L.box('cloth_indigo', u0 + 0.5, backV + 0.5, u0 + 1.3, backV + 1.0, y + 0.44, y + 0.46);
  } else {
    // the family room: a sleeping platform under felts along the back, cushions, painted chests, a low table with bowls, a brazier
    L.box('mudbrick', u1 - 2.2, backV + 0.3, u1 - 0.3, backV + 2.2, y, y + 0.5, true);
    L.box('cloth_ochre', u1 - 2.2, backV + 0.3, u1 - 0.3, backV + 2.2, y + 0.5, y + 0.54);
    L.box(pc(), u1 - 2.0, backV + 0.5, u1 - 0.6, backV + 1.9, y + 0.54, y + 0.57);
    for (let k = 0; k < 2; k++) L.box(pc(), u1 - 1.4 + k * 0.7, backV + 0.4, u1 - 1.0 + k * 0.7, backV + 0.9, y + 0.57, y + 0.7);
    for (let k = 0; k < 2; k++) { L.box(k ? 'lacquer_red' : 'paint_ochre', u0 + 0.4, backV + 0.4 + k * 1.1, u0 + 1.2, backV + 1.3 + k * 1.1, y, y + 0.62, true); L.box('gilt_bronze', u0 + 0.4, backV + 0.4 + k * 1.1, u0 + 1.22, backV + 1.3 + k * 1.1, y + 0.48, y + 0.54); }
    L.box('lacquer_red', cu - 0.45, backV + 2.1, cu + 0.45, backV + 3.1, y, y + 0.36, true);
    for (let k = 0; k < 3; k++) L.lathe('silver', [[0.001, 0], [0.07, 0.02], [0.09, 0.1], [0.001, 0.1]], 8, cu - 0.25 + k * 0.25, backV + 2.6, y + 0.36);
    L.lathe('bronze', [[0.001, 0], [0.22, 0.04], [0.28, 0.2], [0.001, 0.2]], 10, u0 + 1.1, frontV - 1.5, y + 0.28);
    L.rod('iron', [u0 + 0.9, y, frontV - 1.7], [u0 + 0.95, y + 0.3, frontV - 1.6], 0.015, 3); L.rod('iron', [u0 + 1.3, y, frontV - 1.7], [u0 + 1.25, y + 0.3, frontV - 1.6], 0.015, 3);
    L.circle(u0 + 1.1, frontV - 1.5, 0.3, y, y + 0.5);
    L.lathe('flame', [[0.07, 0], [0.04, 0.08], [0.001, 0.14]], 6, u0 + 1.1, frontV - 1.5, y + 0.3);
  }
}

/** A house of the court: shell with door and windows, the room(s), the stair and upper room when `floors` > 1. Returns the roof height. */
function houseBody(L, o) {
  const { W, D, floors, mat, rand, kind } = o;
  const T = 0.5, hh = floors > 1 ? 6.2 : 3.6, FY = 3.5;
  const dc = W * (0.22 + rand() * 0.2);
  const ops = [{ at: dc, w: 1.3, h: 2.4 }];
  for (const f of [0.17, 0.83]) if (Math.abs(W * f - dc) > 1.6) ops.push({ at: W * f, w: 0.9, h: 1.0, y0: 1.2, lat: true });
  // shell: front (door and windows), back, the two ends
  L.wall(mat, 0, -T / 2, W, -T / 2, T, 0, hh, ops, 'lattice');
  L.wall(mat, 0, -D + T / 2, W, -D + T / 2, T, 0, hh);
  L.wall(mat, T / 2, 0, T / 2, -D, T, 0, hh); L.wall(mat, W - T / 2, 0, W - T / 2, -D, T, 0, hh);
  // the door's timber frame and leaf standing open, a painted lintel
  { const u = dc; L.box('wood_dark', u - 0.72, -0.06, u - 0.62, 0.12, 0, 2.45); L.box('wood_dark', u + 0.62, -0.06, u + 0.72, 0.12, 0, 2.45); L.box("wood_dark", u - 0.72, -0.06, u + 0.72, 0.12, 2.4, 2.55);
    L.box('tile_turquoise', u - 0.72, 0.12, u + 0.72, 0.14, 2.55, 2.75); L.slab('wood_dark', u - 0.5, 0.2, u - 0.5, 1.0, 0.04, 0, 2.3); }
  // floors and the roof/ceiling
  const room = [T, -D + T, W - T, -T];
  L.box('mud_plaster', room[0], room[1], room[2], room[3], -0.2, 0.03); L.floor(room[0], room[1], room[2], room[3], 0.03);
  const partition = W >= 10.5, pu = partition ? Math.round(W * 0.62) : W - T;
  if (partition) {
    L.wall(mat, pu, -T, pu, -D + T, 0.4, 0, floors > 1 ? FY : hh - 0.2, [{ at: 1.3, w: 1.3, h: 2.2 }]);
    // the kitchen room: a hearth with a cauldron and a chimney of mud brick, water jars, firewood, sacks of millet
    const ku0 = pu + 0.3, ku1 = W - T;
    L.box('mudbrick', ku0, -D + T, ku0 + 1.6, -D + T + 1.2, 0, 0.8, true);
    L.lathe('iron', [[0.001, 0], [0.26, 0.02], [0.32, 0.18], [0.26, 0.34], [0.001, 0.34]], 10, ku0 + 0.8, -D + T + 0.6, 0.8);
    L.lathe('flame', [[0.1, 0], [0.05, 0.12], [0.001, 0.24]], 6, ku0 + 0.8, -D + T + 0.6, 0.78);
    L.light(ku0 + 0.8, 1.3, -D + T + 0.8, '#ff9a4a', 1.2, 5);
    for (let k = 0; k < 3; k++) L.lathe('terracotta', [[0.06, 0], [0.18, 0.08], [0.22, 0.22], [0.16, 0.36], [0.08, 0.4], [0.001, 0.42]], 8, ku0 + 2.3 + k * 0.42, -D + T + 0.35, 0);
    L.col.rect(L.R(ku0 + 2.05, -D + T, ku0 + 3.5, -D + T + 0.7), 0, 0.45);
    for (let k = 0; k < 6; k++) L.rod('bark_dark', [ku0 + 1.75, 0.2 + Math.floor(k / 3) * 0.3, -D + T + 0.1 + (k % 3) * 0.17], [ku0 + 2.0, 0.2 + Math.floor(k / 3) * 0.3, -D + T + 0.1 + (k % 3) * 0.17], 0.07, 5);
    furnishRoom(L, kind, [T, -D + T, pu - 0.2, -T], 0.03, rand, hh);
  } else furnishRoom(L, kind, room, 0.03, rand, hh);
  L.light((room[0] + (partition ? pu : room[2])) / 2, 2.4, -D / 2);
  // ceiling: poplar poles across with a mat of reeds and earth above (the beams seen from below)
  const ceilY = floors > 1 ? FY - 0.2 : hh - 0.25;
  if (floors === 1) {
    L.box('timber', T, -D + T, W - T, -T, ceilY, hh, false);
    for (let u = 0.9; u < W - 0.5; u += 0.7) L.box('cedar', u - 0.06, -D + T, u + 0.06, -T, ceilY - 0.12, ceilY);
    L.box('wood_dark', T, -D + T, W - T, -T, ceilY - 0.02, ceilY);
  } else {
    // the stair in the kitchen strip up to the upper floor along the partition, the landing at the back
    const su1 = W - T, su0 = su1 - 1.25, v0s = -0.9, v1s = -D + 2.0;
    const n = 20;
    for (let i = 0; i < n; i++) { const a = v0s + (v1s - v0s) * i / n, b = v0s + (v1s - v0s) * (i + 1) / n; L.box('timber', su0, Math.min(a, b), su1, Math.max(a, b), 0.03, 0.03 + (FY - 0.03) * (i + 1) / n); }
    L.ramp(su0, v1s, su1, v0s, 0.03, FY, '-v');
    L.box('wood_dark', su0 - 0.06, v1s, su0, v0s, 1.0, 1.1);
    // the upper floor: planks on beams, open over the stair only up to its top
    const slabs = [[T, -D + T, su0, -T], [su0, -D + T, su1, v1s], [su0, v0s, su1, -T]];
    for (const [a, b, c, d] of slabs) { if (c - a < 0.05) continue; L.box('timber', a, b, c, d, FY - 0.2, FY); L.floor(a, b, c, d, FY); }
    // the upper room: carpets, cushions, a low bench under the windows, a lamp; ceiling and roof beams
    L.box('cloth_red', T + 0.8, -D + T + 0.8, pu - 0.8, -T - 1.0, FY, FY + 0.012);
    L.box('cloth_blue', T + 1.2, -D + T + 1.2, pu - 1.2, -T - 1.4, FY + 0.012, FY + 0.024);
    for (let k = 0; k < 4; k++) L.box(['cloth_green', 'cloth_ochre', 'cloth_red', 'cloth_blue'][k], T + 0.5 + k * 0.7, -D + T + 0.3, T + 1.0 + k * 0.7, -D + T + 0.8, FY, FY + 0.18);
    L.box('timber', T, -D + T, W - T, -T, hh - 0.25, hh);
    L.light(pu / 2, FY + 2.2, -D / 2, '#ffcf86', 1.4, 7);
    for (let u = 0.9; u < W - 0.5; u += 0.7) L.box('cedar', u - 0.06, -D + T, u + 0.06, -T, hh - 0.37, hh - 0.25);
  }
  // the roof: beam ends through the face, the edge course, a low parapet, a drain spout, a drying hide on the roof edge
  L.box('brick_buff', -0.05, 0.05, W + 0.05, -D - 0.05, hh, hh + 0.12);
  L.box('mud_plaster', 0, 0, W, -0.35, hh + 0.12, hh + 0.7); L.box('mud_plaster', 0, -D + 0.35, W, -D, hh + 0.12, hh + 0.7);
  L.box('mud_plaster', 0, -0.35, 0.35, -D + 0.35, hh + 0.12, hh + 0.7); L.box('mud_plaster', W - 0.35, -0.35, W, -D + 0.35, hh + 0.12, hh + 0.7);
  for (let u = 0.6; u < W - 0.3; u += 0.7) L.rod('cedar', [u, hh - 0.25, 0], [u, hh - 0.25, 0.4], 0.07, 5);
  { const su = W * (0.2 + rand() * 0.6); L.box('wood_dark', su - 0.07, 0.3, su + 0.07, 0, hh - 0.2, hh - 0.05); L.box('wood_dark', su - 0.07, 0.3, su + 0.07, 0.2, hh - 0.05, hh - 0.0); }
  // weathering: patches where the plaster has fallen to show the brick, a dark base band, cracks, and bleached stripes under the roof
  L.box('mudbrick', 0.0, 0.02, W, -0.02, 0, 0.45);
  for (let k = 0; k < 5; k++) { const u = 0.5 + rand() * (W - 1.5), w = 0.4 + rand() * 0.9, y = 0.5 + rand() * (hh - 1.5), h = 0.3 + rand() * 0.7; if (Math.abs(u - dc) < 1.4 && y < 2.6) continue; L.box('mudbrick', u, 0.025, u + w, 0.0, y, y + h); }
  for (let k = 0; k < 4; k++) { const u = 0.8 + rand() * (W - 1.6); if (Math.abs(u - dc) < 1.0) continue; L.box('bark_dark', u, 0.02, u + 0.025, 0.0, 0.8 + rand() * 1.0, 2.0 + rand() * 1.4); }
  L.box('plaster_white', 0, 0.02, W, -0.01, hh - 0.35, hh - 0.2);
  return { hh, dc };
}

export function mudCompound(el, { bag, col, lights }) {
  const [x0, z0, x1, z1] = el.rect, rand = rng(el.seed || 5), gate = el.gate ?? 's', T = 0.45, WH = 2.9, floors = el.floors ?? 1, mat = rand() < 0.5 ? 'mudbrick' : 'mud_plaster';
  const gu = (gate === 's' || gate === 'n') ? (x0 + x1) / 2 + (rand() - 0.5) * (x1 - x0) * 0.3 : (z0 + z1) / 2 + (rand() - 0.5) * (z1 - z0) * 0.3;
  const gw = 2.2, gh = 2.5;
  const breach = rand() < 0.4 ? ['n', 's', 'e', 'w'].filter((s) => s !== gate)[Math.floor(rand() * 3)] : null;
  const run = (a, b, side) => {
    const along = side === 's' || side === 'n', pos = along ? a[0] : a[1], len = along ? b[0] - a[0] : b[1] - a[1];
    const ops = side === gate ? [{ at: gu - pos, w: gw, h: gh }] : [];
    if (side === breach) {
      // a slumped section: the wall down to a metre or so over three to four metres, the rubble heaped across it
      const at = len * (0.3 + rand() * 0.4), w = 3 + rand();
      ops.push({ at, w, h: WH - 1.1, y0: 1.1 });
      const c = along ? [a[0] + at, a[1]] : [a[0], a[1] + at];
      bag.add('mudbrick', lathe([[w * 0.55, 0], [w * 0.4, 0.5], [w * 0.2, 0.85], [0.001, 1.0]], 8, null, c[0], 0, c[1]));
      bag.add('mud_plaster', lathe([[w * 0.3, 0], [w * 0.2, 0.3], [0.001, 0.45]], 7, null, c[0] + (along ? 0.4 : 0), 0, c[1] + (along ? 0 : 0.4)));
    }
    wallRun(bag, col, a, b, T, 0, WH, mat, ops);
  };
  run([x0, z0], [x1, z0], 'n'); run([x0, z1], [x1, z1], 's'); run([x0, z0], [x0, z1], 'w'); run([x1, z0], [x1, z1], 'e');
  // the gate's lintel and hood
  { const o = gate === 's' ? [gu - 1.4, z1 - 0.3, gu + 1.4, z1 + 0.5] : gate === 'n' ? [gu - 1.4, z0 - 0.5, gu + 1.4, z0 + 0.3] : gate === 'e' ? [x1 - 0.3, gu - 1.4, x1 + 0.5, gu + 1.4] : [x0 - 0.5, gu - 1.4, x0 + 0.3, gu + 1.4];
    bag.add('timber', box(o[0], gh, o[1], o[2], gh + 0.3, o[3])); bag.add('mud_plaster', box(o[0], gh + 0.3, o[1], o[2], gh + 0.5, o[3])); }
  // the gate's leaves, one open (timber boards with iron studs), a mounting block of stone by it
  { const a = gate === 's' || gate === 'n' ? [gu - gw / 2, gate === 's' ? z1 : z0] : [gate === 'e' ? x1 : x0, gu - gw / 2];
    const b = gate === 's' || gate === 'n' ? [gu - gw / 2, gate === 's' ? z1 - 1.0 : z0 + 1.0] : [gate === 'e' ? x1 - 1.0 : x0 + 1.0, gu - gw / 2];
    bag.add('wood_dark', obox(a, b, 0.06, 0, gh - 0.1));
    const m = gate === 's' || gate === 'n' ? [gu + gw / 2 + 0.8, gate === 's' ? z1 + 0.5 : z0 - 0.5] : [gate === 'e' ? x1 + 0.5 : x0 - 0.5, gu + gw / 2 + 0.8];
    bag.add('granite_rough', box(m[0] - 0.35, 0, m[1] - 0.3, m[0] + 0.35, 0.45, m[1] + 0.3)); col.rect([m[0] - 0.35, m[1] - 0.3, m[0] + 0.35, m[1] + 0.3], 0, 0.45); }
  for (const [a, b] of [[[x0, z0], [x1, z0]], [[x0, z1], [x1, z1]], [[x0, z0], [x0, z1]], [[x1, z0], [x1, z1]]]) bag.add('brick_buff', obox(a, b, T + 0.12, WH, WH + 0.1));
  // the house
  const dd = gate === 's' ? [x0 + T, z0 + T, x1 - T, z0 + (z1 - z0) * 0.44] : gate === 'n' ? [x0 + T, z1 - (z1 - z0) * 0.44, x1 - T, z1 - T] : gate === 'e' ? [x0 + T, z0 + T, x0 + (x1 - x0) * 0.44, z1 - T] : [x1 - (x1 - x0) * 0.44, z0 + T, x1 - T, z1 - T];
  const F = frontFrame(dd, gate), L = new Local(bag, col, lights, F.O, F.U, F.V);
  const kind = ['family', 'merchant', 'craft', 'family'][Math.floor(rand() * 4)];
  const { hh, dc: doorU } = houseBody(L, { W: F.W, D: F.D, floors, mat, rand, kind });
  if (el.dome) {
    const [cx, cz] = L.P(F.W * 0.3, -F.D / 2), r = Math.min(2.6, Math.min(F.W, F.D) * 0.32);
    bag.add('brick_buff', lathe([[r, 0], [r, 0.5], [r * 0.9, 1.0], [r * 0.62, 1.7], [r * 0.2, 2.15], [0.001, 2.2]], 14, null, cx, hh + 0.12, cz));
    bag.add('gilt_bronze', lathe([[0.001, 0], [0.1, 0.04], [0.02, 0.5]], 6, null, cx, hh + 2.3, cz));
  }
  // the court (v > 0): oven, dung cakes, jars at the door, a bench, a ladder, laundry, a cheese rack, a felt-roofed store, a trough
  const Dc = (gate === 's' || gate === 'n' ? z1 - z0 : x1 - x0) - F.D - T;
  const side = rand() < 0.5 ? 1 : -1, uu = (f) => F.W * f;
  const ou = side > 0 ? 1.4 : F.W - 1.4, ov = Math.min(Dc - 1.2, 3.4);
  L.lathe('mudbrick', [[0.6, 0], [0.5, 0.5], [0.42, 0.85], [0.28, 1.0], [0.001, 1.02]], 10, ou, ov, 0); L.circle(ou, ov, 0.62, 0, 1.0);
  L.lathe('bark_dark', [[0.001, 0], [0.5, 0.01], [0.44, 0.3], [0.001, 0.4]], 8, ou + side * 1.2, ov + 0.2, 0);
  // dung cakes stacked against the court wall at the oven
  for (let k = 0; k < 4; k++) L.box('bark_dark', ou + side * 1.9 - 0.45, ov + 1.0 + 0.0, ou + side * 1.9 + 0.45, ov + 1.35, k * 0.14, k * 0.14 + 0.13);
  // the jars by the door, a water pot with its lid, a bench of timber
  const dcu = doorU;
  for (let k = 0; k < 3; k++) L.lathe(k === 1 ? 'glaze_blue' : 'terracotta', [[0.08, 0], [0.22, 0.1], [0.27, 0.28], [0.2, 0.46], [0.1, 0.52], [0.001, 0.52]], 8, dcu + 1.5 + k * 0.5, 0.7, 0);
  L.circle(dcu + 2.0, 0.7, 0.45, 0, 0.5);
  L.box('timber', dcu - 2.8, 0.55, dcu - 1.2, 0.95, 0.42, 0.48); L.box('wood_dark', dcu - 2.7, 0.6, dcu - 2.6, 0.9, 0, 0.42); L.box('wood_dark', dcu - 1.4, 0.6, dcu - 1.3, 0.9, 0, 0.42);
  L.col.rect(L.R(dcu - 2.8, 0.55, dcu - 1.2, 0.95), 0, 0.48);
  L.box('cloth_red', dcu - 2.7, 0.58, dcu - 1.8, 0.92, 0.48, 0.5);
  // a ladder of notched poplar up to the roof, leaning on the house front
  { const lu = side > 0 ? F.W - 1.4 : 1.4; L.rod('cedar', [lu - 0.22, 0, 1.0], [lu - 0.22, hh + 0.2, 0.05], 0.045, 5); L.rod('cedar', [lu + 0.22, 0, 1.0], [lu + 0.22, hh + 0.2, 0.05], 0.045, 5);
    for (let k = 1; k < 9; k++) { const t = k / 9.5, v = 1.0 - 0.95 * t; L.rod('timber', [lu - 0.22, t * (hh + 0.2), v], [lu + 0.22, t * (hh + 0.2), v], 0.025, 4); } }
  // a laundry line on two posts across the court, a cheese-drying rack (white curds laid on a cloth over a frame), a felt-roofed store
  if (Dc > 7) {
    const lv = Math.min(Dc - 1.5, 5.4), a = side > 0 ? F.W * 0.45 : 1.6, b = a + 4.0;
    L.rod('timber', [a, 0, lv], [a, 2.2, lv], 0.04, 5); L.rod('timber', [b, 0, lv], [b, 2.2, lv], 0.04, 5); L.rod('rope_fibre', [a, 2.15, lv], [b, 2.05, lv], 0.008, 3);
    for (let k = 0; k < 5; k++) { const m = L.P(a + 0.3 + k * 0.72, lv); const c = ['cloth_white', 'cloth_red', 'cloth_blue', 'cloth_ochre', 'cloth_green'][(k + Math.floor(rand() * 3)) % 5]; addCloth(bag, c, clothBox(m[0] - 0.22, 1.2 - (k % 2) * 0.2, m[1] - 0.03, m[0] + 0.22, 2.1, m[1] + 0.03, 0.3), 2.1); }
    L.circle(a, lv, 0.06, 0, 2.2); L.circle(b, lv, 0.06, 0, 2.2);
    const cu0 = side > 0 ? 1.6 : F.W - 3.4, cv = Math.min(Dc - 1.2, 2.2);
    L.box('timber', cu0, cv, cu0 + 1.8, cv + 0.9, 0.7, 0.75); for (const [du, dv] of [[0.05, 0.05], [1.65, 0.05], [0.05, 0.75], [1.65, 0.75]]) L.box('wood_dark', cu0 + du, cv + dv, cu0 + du + 0.1, cv + dv + 0.1, 0, 0.7);
    for (let k = 0; k < 7; k++) L.lathe('cloth_white', [[0.001, 0], [0.09, 0.01], [0.1, 0.05], [0.001, 0.07]], 6, cu0 + 0.2 + (k % 4) * 0.42, cv + 0.25 + Math.floor(k / 4) * 0.4, 0.75);
    L.col.rect(L.R(cu0, cv, cu0 + 1.8, cv + 0.9), 0, 0.75);
  }
  void TAU; void rectRoof; void rod;
}
