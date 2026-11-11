// The VOC's warehouses on the IJ about 1670 (docs/settlements/amsterdam.md §5.11): long brick pakhuizen of three
// floors under a steep tiled roof, their long fronts to the quay; on every floor a row of loading hatches (luiken)
// one over another on the hoisting axis, small barred or shuttered windows between them; sandstone quoins, string
// courses and lintels, iron wall anchors at the floors; on the roof the hoist gables (hijsgevels) with their hatches
// and the projecting beam, pulley and hook; the goods on the quay. In some the ground floor is open to the visitor,
// its floor of planks, its posts and beams, the casks, sacks, bales and chests stacked along the walls.

import { box, lathe } from '../../core/geom.js';
import { faceFrame, prism, fbox, sideprism, bar } from './facade.js';

const ST = 'sandstone_dressed';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

export const WH = { g: 4.0, s: 3.1, floors: 3, plinth: 0.5, bay: 4.3 };

/**
 * voc_warehouse: { rect (its long side to the quay on `front`), front ('n'|'s'|'e'|'w'), y, seed, open }.
 * 10.2 m to the eaves over a plinth, the ridge about 5 m above.
 */
export function vocWarehouse(el, { bag, col }) {
  const rand = rng(el.seed || 1), y = el.y ?? 0, f = el.front ?? 'n', F = faceFrame(el.rect, f), w = F.w, D = F.D;
  const H = WH.g + WH.s * (WH.floors - 1), rh = D * 0.46, open = !!el.open;
  const A = (m, ...r) => bag.add(m, fbox(F, y, ...r)), Pz = (m, pts, d0, d1) => bag.add(m, prism(F, y, pts, d0, d1));
  const nr = (p, q) => [Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])];
  const C = (u0, u1, d0, d1, v0, v1) => col.rect(nr(F.at(u0, d0), F.at(u1, d1)), y + v0, y + v1);
  const P3 = (u, d, v) => { const [x, z] = F.at(u, d); return [x, y + v, z]; };
  const brickM = rand() < 0.75 ? 'brick' : 'brick_baked';
  const nb = Math.max(3, Math.round(w / WH.bay)), pitch = w / nb, hatchBay = (i) => i % 2 === (nb % 2 ? 0 : 1);
  const leafM = rand() < 0.5 ? 'shutter_green' : 'shutter_brown', doorH = 3.1, dw = 1.0, T = 0.6, fl = 0.18;

  // ---- the shell ------------------------------------------------------------------------------
  const fv = (k) => (k === 0 ? 0 : WH.g + WH.s * (k - 1));                // the floors' levels: 0, g, g + s
  if (!open) { A(brickM, 0, w, -0.5, H, -D, 0); C(0, w, -D, 0, -0.5, H + rh * 0.5); }
  else {
    // the walls round the ground floor, the front with a door in every hatch bay; the floors above solid
    A(brickM, 0, w, -0.5, WH.g - 0.2, -D, -D + T); C(0, w, -D, -D + T, -0.5, WH.g);
    for (const [a, b] of [[0, T], [w - T, w]]) { A(brickM, a, b, -0.5, WH.g - 0.2, -D, 0); C(a, b, -D, 0, -0.5, WH.g); }
    let cur = T;
    for (let i = 0; i < nb; i++) {
      if (!hatchBay(i)) continue;
      const u = (i + 0.5) * pitch;
      if (u - dw > cur) { A(brickM, cur, u - dw, -0.5, WH.g - 0.2, -T, 0); C(cur, u - dw, -T, 0, -0.5, WH.g); }
      A(brickM, u - dw, u + dw, fl + doorH, WH.g - 0.2, -T, 0);                                  // over the door
      cur = u + dw;
    }
    if (cur < w - T) { A(brickM, cur, w - T, -0.5, WH.g - 0.2, -T, 0); C(cur, w - T, -T, 0, -0.5, WH.g); }
    A(brickM, 0, w, WH.g - 0.2, H, -D, 0);                                                       // the floors above
    C(0, w, -D, 0, WH.g - 0.2, H + rh * 0.5);
    // the ground floor: planks on sleepers, the ceiling of boards on its beams, the posts, the goods
    const g0 = F.at(T, -T), g1 = F.at(w - T, -D + T);
    col.floor(nr(g0, g1), y + fl);
    A('planks_grey', T, w - T, fl - 0.1, fl, -D + T, -T);
    A('planks_grey', T, w - T, WH.g - 0.45, WH.g - 0.2, -D + T, -T);
    for (let u = T + 0.6; u < w - T; u += 1.2) A('timber', u - 0.1, u + 0.1, WH.g - 0.85, WH.g - 0.45, -D + T, -T);        // the joists across
    for (const d of [-D * 0.33, -D * 0.67]) {
      A('timber', T, w - T, WH.g - 1.25, WH.g - 0.85, d - 0.17, d + 0.17);                                                // the summer beams along
      for (let u = T + pitch * 0.5; u < w - T; u += pitch) {
        A('timber', u - 0.17, u + 0.17, fl, WH.g - 1.25, d - 0.17, d + 0.17); C(u - 0.17, u + 0.17, d - 0.17, d + 0.17, fl, WH.g - 1.2);
        A(ST, u - 0.24, u + 0.24, fl, fl + 0.22, d - 0.24, d + 0.24);
      }
    }
    // the goods along the walls (their own aisles between): casks, sacks, bales, chests
    const lathes = (m, pr, x, yy, z, rot = 0) => { const g = lathe(pr, 12, null, 0, 0, 0); if (rot) g.rotateZ(rot); g.translate(x, yy, z); bag.add(m, g); };
    for (let k = 0; k < Math.floor((w - 2 * T - 2) / 1.5); k++) {
      const u = T + 1.2 + k * 1.5, r = rand();
      if (r < 0.3) {                                                                      // two tiers of casks against the back wall
        for (const [dd, tier] of [[-D + T + 0.5, 0], [-D + T + 0.5, 1]]) { const [x, z] = F.at(u, dd); lathes('wood_painted', [[0.27, -0.42], [0.33, -0.2], [0.35, 0], [0.33, 0.2], [0.27, 0.42], [0.001, 0.42]], x, y + fl + 0.42 + tier * 0.8, z); }
        C(u - 0.4, u + 0.4, -D + T, -D + T + 1.0, fl, fl + 1.7);
      } else if (r < 0.55) {                                                              // sacks piled
        A('sacking', u - 0.55, u + 0.55, fl, fl + 0.5, -D + T + 0.1, -D + T + 1.0); A('sacking', u - 0.4, u + 0.4, fl + 0.5, fl + 0.95, -D + T + 0.2, -D + T + 0.9);
        C(u - 0.55, u + 0.55, -D + T, -D + T + 1.1, fl, fl + 0.95);
      } else if (r < 0.75) {                                                              // bales corded
        A('cloth_brown', u - 0.5, u + 0.5, fl, fl + 0.7, -D + T + 0.1, -D + T + 0.9); A('rope_fibre', u - 0.51, u + 0.51, fl + 0.3, fl + 0.34, -D + T + 0.09, -D + T + 0.91);
        C(u - 0.5, u + 0.5, -D + T, -D + T + 1.0, fl, fl + 0.7);
      } else if (r < 0.9) {                                                               // chests bound in iron
        A('wood_dark', u - 0.5, u + 0.5, fl, fl + 0.6, -D + T + 0.1, -D + T + 0.8); A('iron', u - 0.51, u + 0.51, fl + 0.1, fl + 0.16, -D + T + 0.09, -D + T + 0.81); A('iron', u - 0.51, u + 0.51, fl + 0.44, fl + 0.5, -D + T + 0.09, -D + T + 0.81);
        C(u - 0.5, u + 0.5, -D + T, -D + T + 0.9, fl, fl + 0.6);
      }
    }
    // a pair of cask rows by the east end and a counting table with the ledger by the first door
    for (let k = 0; k < 3; k++) { const [x, z] = F.at(w - T - 0.5, -D * 0.2 - k * 1.5); lathes('wood_painted', [[0.27, -0.42], [0.33, -0.2], [0.35, 0], [0.33, 0.2], [0.27, 0.42], [0.001, 0.42]], x, y + fl + 0.42, z); C(w - T - 0.9, w - T - 0.1, -D * 0.2 - k * 1.5 - 0.4, -D * 0.2 - k * 1.5 + 0.4, fl, fl + 0.9); }
    { const u = T + 1.0, d = -2.2; A('wood_dark', u - 0.5, u + 0.5, fl + 0.75, fl + 0.8, d - 0.4, d + 0.4); for (const [a, b] of [[-0.45, -0.35], [0.4, 0.5]]) for (const [c, e] of [[-0.35, -0.25], [0.3, 0.4]]) A('wood_dark', u + a, u + b, fl, fl + 0.75, d + c, d + e);
      A('paint_white', u - 0.2, u + 0.15, fl + 0.8, fl + 0.82, d - 0.2, d + 0.15); C(u - 0.5, u + 0.5, d - 0.4, d + 0.4, fl, fl + 0.85); }
    // the light: the barred windows between the doors (below) and the doors themselves, standing open
  }

  // ---- the face: plinth, bays, string courses, quoins, anchors ---------------------------------
  const face = (G, isLong, own) => {
    const gw = G.w, FA = (m, ...r) => bag.add(m, fbox(G, y, ...r)), FP = (m, pts, d0, d1) => bag.add(m, prism(G, y, pts, d0, d1));
    const n = Math.max(2, Math.round(gw / WH.bay)), p = gw / n, hb = (i) => (n % 2 ? i % 2 === 0 : i % 2 === 1);
    FA('bluestone', -0.06, gw + 0.06, -0.3, WH.plinth, 0, 0.09);
    for (const v of [WH.g - 0.12, WH.g + WH.s - 0.12]) FA(ST, -0.05, gw + 0.05, v, v + 0.24, 0, 0.1);                                      // the string courses at the floors
    for (let k = 0; k < 3; k++) for (const fv0 of [0.9, WH.g + 0.5, WH.g + WH.s + 0.5]) { void k; }
    FA(ST, -0.1, gw + 0.1, H - 0.1, H + 0.04, 0, 0.16);                                                                                          // the cornice, a timber one over it
    FA('timber', -0.3, gw + 0.3, H + 0.04, H + 0.34, 0, 0.4);
    // quoins, long and short, up the corners
    for (let k = 0; ; k++) { const v = WH.plinth + k * 0.66; if (v > H - 0.3) break; for (const [a, b] of [[-0.02, k % 2 ? 0.55 : 0.95], [gw - (k % 2 ? 0.55 : 0.95), gw + 0.02]]) FA(ST, a, b, v, Math.min(H - 0.1, v + 0.62), 0, 0.04); }
    for (let i = 0; i < n; i++) {
      const u = (i + 0.5) * p, door = hb(i) && (isLong || true);
      if (door) {
        // the ground door: its lintel and the relieving arch over it, the leaves (open ones stand folded back), the threshold
        const open0 = own && !(el.openLeaves === false) && open && isLong;
        FA(ST, u - dw - 0.2, u + dw + 0.2, fl + doorH, fl + doorH + 0.26, 0, 0.12);
        FA('brick_baked', u - dw - 0.2, u + dw + 0.2, fl + doorH + 0.26, fl + doorH + 0.5, 0, 0.05);
        for (const s of [-1, 1]) FA(ST, s < 0 ? u - dw - 0.22 : u + dw, s < 0 ? u - dw : u + dw + 0.22, 0.0, fl + doorH, 0, 0.1);
        FA(ST, u - dw, u + dw, 0, fl, -0.1, 0.4);                                                                                              // the sill step
        if (!open0) {
          for (const s of [-1, 1]) { const a = Math.min(u, u + s * dw), b = Math.max(u, u + s * dw); FA(leafM, a, b, fl, fl + doorH, -0.02, 0.07); for (const v of [0.6, 1.5, 2.4]) FA('iron', s < 0 ? u - dw + 0.05 : u + 0.05, s < 0 ? u - 0.05 : u + dw - 0.05, fl + v, fl + v + 0.08, 0.07, 0.1); }
          FA('iron', u - 0.015, u + 0.015, fl, fl + doorH, 0.07, 0.1);
        } else {
          for (const s of [-1, 1]) { const e = u + s * (dw + 0.06); FA(leafM, Math.min(e, e + s * 0.04), Math.max(e, e + s * 0.04), fl, fl + doorH, 0.08, 0.08 + dw); }
        }
      } else {
        // between the doors: a barred window, high in the wall, its stone sill and lintel and a shutter hung open
        FA(ST, u - 0.55, u + 0.55, 1.65, 1.77, 0, 0.1); FA(ST, u - 0.55, u + 0.55, 2.85, 3.0, 0, 0.08);
        FA('opening', u - 0.42, u + 0.42, 1.77, 2.85, -0.02, 0.03);
        for (let k = 1; k < 5; k++) { const a = u - 0.42 + k * 0.84 / 5; FA('iron', a - 0.012, a + 0.012, 1.77, 2.85, 0.03, 0.06); }
        FA('wood_dark', u - 0.42, u + 0.42, 2.0, 2.04, 0.03, 0.05);
      }
      // the upper floors: the hatch on every hoist bay, one over another (the double leaves closed, strapped, a stone lintel), the small shuttered window between
      for (let s = 1; s < WH.floors; s++) {
        const v0 = fv(s) + 0.25;
        if (door) {
          FA(ST, u - 0.85, u + 0.85, v0 - 0.12, v0, 0, 0.1); FA(ST, u - 0.88, u + 0.88, v0 + 2.2, v0 + 2.42, 0, 0.1);
          FA('brick_baked', u - 0.88, u + 0.88, v0 + 2.42, v0 + 2.62, 0, 0.05);
          for (const sd of [-1, 1]) { const a = Math.min(u, u + sd * 0.78), b = Math.max(u, u + sd * 0.78); FA(leafM, a, b, v0, v0 + 2.2, -0.02, 0.06); for (const v of [0.45, 1.65]) FA('iron', sd < 0 ? u - 0.74 : u + 0.04, sd < 0 ? u - 0.04 : u + 0.74, v0 + v, v0 + v + 0.07, 0.06, 0.085); }
          FA('iron', u - 0.015, u + 0.015, v0, v0 + 2.2, 0.06, 0.085);
        } else {
          FA(ST, u - 0.5, u + 0.5, v0 + 0.4, v0 + 0.52, 0, 0.1); FA(ST, u - 0.5, u + 0.5, v0 + 1.62, v0 + 1.78, 0, 0.08);
          FA('opening', u - 0.36, u + 0.36, v0 + 0.52, v0 + 1.62, -0.02, 0.03);
          if (rand() < 0.6) for (const sd of [-1, 1]) FA('shutter_brown', Math.min(u, u + sd * 0.36), Math.max(u, u + sd * 0.36), v0 + 0.52, v0 + 1.62, 0.03, 0.06); else for (let k = 1; k < 4; k++) { const a = u - 0.36 + k * 0.18; FA('wood_painted', a - 0.012, a + 0.012, v0 + 0.52, v0 + 1.62, 0.03, 0.06); }
        }
        // the wall anchors at the floor under each opening (pairs of iron bars, the anchor plate)
        if (i > 0) for (const uu of [i * p]) { const v = fv(s) - 0.05; FA('iron', uu - 0.03, uu + 0.03, v - 0.4, v + 0.4, 0, 0.05); FA('iron', uu - 0.16, uu + 0.16, v - 0.03, v + 0.03, 0, 0.06); }
      }
    }
  };
  face(F, true, true);
  face(faceFrame(el.rect, { n: 's', s: 'n', e: 'w', w: 'e' }[f]), true, false);
  for (const e of f === 'n' || f === 's' ? ['e', 'w'] : ['n', 's']) face(faceFrame(el.rect, e), false, false);

  // ---- the roof, the gable ends, the hoist gables ------------------------------------------------
  const ov = 0.4, m = (rh - 0.1) / (D / 2 + ov), vEave = H + 0.34;
  bag.add('roof_tile', sideprism(F, y, [[-D - ov, vEave], [ov, vEave], [-D / 2, vEave + (rh - 0.1) * 1.0 + 0.0]], 0.5, w - 0.5));
  { const g0 = vEave + m * ov + 0.02;                                                                                                           // the brick gable ends, a little proud of the tiles
    for (const [a, b] of [[0, 0.5], [w - 0.5, w]]) {
      bag.add(brickM, sideprism(F, y, [[-D, H], [0, H], [0, g0], [-D / 2, vEave + rh - 0.1 + 0.18], [-D, g0]], a, b));
      const um = (a + b) / 2, apex = vEave + rh - 0.1 + 0.18;
      bag.add(ST, bar(P3(um, 0.04, g0 - 0.02), P3(um, -D / 2, apex + 0.06), 0.2, 0.14)); bag.add(ST, bar(P3(um, -D - 0.04, g0 - 0.02), P3(um, -D / 2, apex + 0.06), 0.2, 0.14));
    }
  }
  bag.add('roof_ridge', box(...(() => { const p = P3(0.45, -D / 2 - 0.2, vEave + rh - 0.1 - 0.05), q = P3(w - 0.45, -D / 2 + 0.2, vEave + rh - 0.1 + 0.12); return [Math.min(p[0], q[0]), p[1], Math.min(p[2], q[2]), Math.max(p[0], q[0]), q[1], Math.max(p[2], q[2])]; })()));
  // the hoist gables over the hoist bays: the brick front on the wall line, the hatch, the tiled roof running back into the main roof, the beam
  const hoists = []; for (let i = 0; i < nb; i++) if (hatchBay(i)) hoists.push((i + 0.5) * pitch);
  const every = hoists.length > 5 ? 2 : 1;
  for (let k = 0; k < hoists.length; k += every) {
    const u = hoists[k], v0 = vEave, hw = 0.95, wall = 1.7, top = 2.5;
    Pz(brickM, [[u - hw, v0], [u + hw, v0], [u + hw, v0 + wall], [u, v0 + top], [u - hw, v0 + wall]], -0.3, 0.02);
    for (const s of [-1, 1]) A(brickM, s < 0 ? u - hw : u + hw - 0.25, s < 0 ? u - hw + 0.25 : u + hw, v0, v0 + wall, -3.0, -0.3);                  // the cheeks
    bag.add('roof_tile', prism(F, y, [[u - hw - 0.1, v0 + wall - 0.12], [u + hw + 0.1, v0 + wall - 0.12], [u, v0 + top + 0.08]], -3.4, -0.3));
    Pz(ST, [[u - 0.7, v0 + 0.18], [u + 0.7, v0 + 0.18], [u + 0.7, v0 + 0.26], [u - 0.7, v0 + 0.26]], 0.02, 0.07);
    for (const s of [-1, 1]) A(leafM, Math.min(u, u + s * 0.62), Math.max(u, u + s * 0.62), v0 + 0.26, v0 + 1.5, 0.02, 0.07);
    A('iron', u - 0.015, u + 0.015, v0 + 0.26, v0 + 1.5, 0.07, 0.09);
    // the hoisting beam out of the gable's apex, its pulley, the rope and the hook above the hatch
    bag.add('timber', bar(P3(u, -0.5, v0 + top - 0.28), P3(u, 1.45, v0 + top - 0.28), 0.17, 0.22));
    bag.add('timber', bar(P3(u, 1.0, v0 + top - 0.5), P3(u, 1.4, v0 + top - 0.3), 0.08, 0.1));
    bag.add('iron', bar(P3(u - 0.07, 1.4, v0 + top - 0.55), P3(u + 0.07, 1.4, v0 + top - 0.55), 0.22, 0.2));
    bag.add('rope_fibre', bar(P3(u, 1.38, v0 + top - 0.6), P3(u, 0.3, v0 + 1.7), 0.03));
    bag.add('iron', bar(P3(u, 0.3, v0 + 1.72), P3(u, 0.3, v0 + 1.55), 0.05));
  }
  // chimneys: none (a warehouse kept no fire); the lightning is not yet known
  void rand;
}
