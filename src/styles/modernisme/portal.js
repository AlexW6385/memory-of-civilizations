// The portals of the Eixample's ordinary houses (docs/settlements/barcelona.md §5e): a ground floor with a real doorway —
// the open doors of the portal, a vestibule tiled to the shoulder with its mailboxes, lamp and potted palm, a glazed inner
// door and the stair hall beyond it (a flight of marble steps with an iron rail and a lamp on the newel). Three fronts by
// the plot's seed (a plain lintel with a rectangular fanlight, an elliptical fanlight under a stone hood, an iron gate under
// a keystone), three floors, three dados. The walls and the doorway are built whole (plan and collision); the vestibule's
// furnishing is a kit of copies seen within a few tens of metres (as the shops' is).
import { box, lathe, rod, fromTriangles } from '../../core/geom.js';
import { Matrix4 } from '../../core/three.js';

const IRON = 'iron', S = 'limestone_yellow';
const both = (t) => { const o = [...t]; for (let i = 0; i < t.length; i += 9) o.push(...t.slice(i, i + 3), ...t.slice(i + 6, i + 9), ...t.slice(i + 3, i + 6)); return o; };
const rng = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
/** The vestibule's size: half width, depth to the inner door's face, the inner door's wall, the hall's depth; the doorway's half width and height. */
export const HW = 1.3, VD = 3.4, PW = 0.3, HD = 3.0, OW = 0.95, OH = 3.9, FW = 0.5;
export const portalVariant = (seed) => (((seed >>> 0) * 2654435761) >>> 0) % 3;

export function makePortals(H) {
  const KITS = new Map(), UNIT = box(0, 0, 0, 1, 1, 1), TURNED = new Map();
  const turned = (prof, seg) => { const k = `${seg}|${JSON.stringify(prof)}`; let g = TURNED.get(k); if (!g) TURNED.set(k, (g = lathe(prof, seg))); return g; };
  const kit = (key, build) => { let k = KITS.get(key); if (!k) { k = []; build({ box: (m, x0, y0, z0, x1, y1, z1) => k.push([m, null, [x0, y0, z0, x1, y1, z1]]), lathe: (m, prof, seg, x, y, z) => k.push([m, turned(prof, seg), null, [x, y, z]]), add: (m, g) => k.push([m, g.index ? g.toNonIndexed() : g]) }); KITS.set(key, k); } return k; };
  const setKit = (bag, fr, pieces, s, y, reach) => {
    const q = fr.at(s, 0), M = new Matrix4().makeRotationY(Math.atan2(-fr.u[1], fr.u[0])).setPosition(q[0], y, q[1]);
    for (const [m, g, bb, at] of pieces) {
      if (at) { const T = new Matrix4().makeTranslation(...at); if (bag.addInstance) bag.addInstance(m, g, M.clone().multiply(T), { reach }); else bag.add(m, g.clone().applyMatrix4(M.clone().multiply(T))); continue; }
      if (!g && bb) {
        if (!bag.addInstance) { bag.add(m, box(...bb).applyMatrix4(M)); continue; }
        const L = new Matrix4().makeTranslation(bb[0], bb[1], bb[2]).multiply(new Matrix4().makeScale(bb[3] - bb[0], bb[4] - bb[1], bb[5] - bb[2]));
        bag.addInstance(m, UNIT, M.clone().multiply(L), { reach }); continue;
      }
      if (bag.addInstance) bag.addInstance(m, g, M.clone(), { reach }); else bag.add(m, g.clone().applyMatrix4(M));
    }
  };

  // ── the vestibule and the stair hall, in the portal's own frame: x across (0 at the doorway's middle), z inward from the wall's face, y up from the street ──
  const DADO = [['glaze_white', 'glaze_green'], ['tile_turquoise', 'tile_cream'], ['tile_cream', 'glaze_green']];
  const furnish = (v, open = false) => kit(`portal|${v}|${open}`, (b) => {
    const Y0 = 0.12, Z0 = FW, Z1 = VD, Z2 = VD + PW, Z3 = VD + PW + HD, [d1, d2] = DADO[v];
    const bx = (m, x0, x1, z0, z1, y0, y1) => b.box(m, x0, y0, z0, x1, y1, z1);
    const rd = (m, p, q, r, seg = 5) => b.add(m, rod([p[0], p[2], p[1]], [q[0], q[2], q[1]], r, seg));        // (x, z, y)
    // the floor's pattern (a cement-tile floor: a border and a field), over the slab of the walls
    const E = 0.012, bd = 0.14;
    bx('tile_grey', -HW, HW, Z0, Z0 + bd, Y0, Y0 + E); bx('tile_grey', -HW, HW, Z1 - bd, Z1, Y0, Y0 + E); bx('tile_grey', -HW, -HW + bd, Z0, Z1, Y0, Y0 + E); bx('tile_grey', HW - bd, HW, Z0, Z1, Y0, Y0 + E);
    if (v === 0) { const cw = (2 * HW - 2 * bd) / 4, cd = (Z1 - Z0 - 2 * bd) / 4; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) if ((i + j) % 2) bx('terracotta', -HW + bd + i * cw, -HW + bd + (i + 1) * cw, Z0 + bd + j * cd, Z0 + bd + (j + 1) * cd, Y0, Y0 + E); }
    else if (v === 1) { bx('terracotta', -0.5, 0.5, Z0 + bd, Z1 - bd, Y0, Y0 + E); bx('tile_grey', -0.38, 0.38, Z0 + bd + 0.12, Z1 - bd - 0.12, Y0, Y0 + E * 1.5); bx('terracotta', -0.18, 0.18, Z0 + bd + 0.3, Z1 - bd - 0.3, Y0, Y0 + E * 2); }
    else { b.lathe('terracotta', [[0.001, Y0], [0.62, Y0], [0.62, Y0 + E], [0.001, Y0 + E]], 8, 0, 0, (Z0 + Z1) / 2); b.lathe('tile_grey', [[0.62, Y0], [0.78, Y0], [0.78, Y0 + E * 1.5], [0.62, Y0 + E * 1.5]], 8, 0, 0, (Z0 + Z1) / 2); }
    // the walls: a dado of glazed tiles to the shoulder with a border band and a rail, plaster above, a limestone skirting, the cornice and a ceiling rose
    for (const sg of [-1, 1]) {
      const xa = sg * HW, xb = sg * (HW - 0.03), lo = Math.min(xa, xb), hi = Math.max(xa, xb);
      bx(d1, lo, hi, Z0, Z1, Y0 + 0.14, 1.34); bx(d2, lo, hi, Z0, Z1, 1.34, 1.44); bx('wood_painted', sg > 0 ? hi - 0.07 : lo, sg > 0 ? hi : lo + 0.07, Z0, Z1, 1.44, 1.5);
      bx('limestone', sg > 0 ? lo - 0.005 : lo, sg > 0 ? hi : hi + 0.005, Z0, Z1, Y0, Y0 + 0.14); bx('plaster_white', lo, hi, Z0, Z1, 1.5, 4.12);
      for (let k = 0; k < 4; k++) bx(d2, sg > 0 ? lo - 0.006 : lo, sg > 0 ? hi : hi + 0.006, Z0 + 0.3 + k * 0.7, Z0 + 0.42 + k * 0.7, 0.45, 1.3);                               // (the border tiles' vertical band, between the panels)
    }
    for (const [xa, xb] of open ? [[-HW, -0.55], [0.55, HW]] : [[-HW, HW]]) {
    bx(d1, xa, xb, Z1 - 0.03, Z1, Y0 + 0.14, 1.34); bx(d2, xa, xb, Z1 - 0.03, Z1, 1.34, 1.44); bx('wood_painted', xa, xb, Z1 - 0.07, Z1, 1.44, 1.5); bx('plaster_white', xa, xb, Z1 - 0.03, Z1, 1.5, 4.12);
    bx('limestone', xa, xb, Z1 - 0.035, Z1, Y0, Y0 + 0.14);
    }
    bx('plaster_white', -HW, HW, Z0, Z1, 4.12, 4.2); bx('limestone', -HW, HW, Z0, Z0 + 0.12, 4.0, 4.12); bx('limestone', -HW, -HW + 0.12, Z0, Z1, 4.0, 4.12); bx('limestone', HW - 0.12, HW, Z0, Z1, 4.0, 4.12); bx('limestone', -HW, HW, Z1 - 0.12, Z1, 4.0, 4.12);
    b.lathe('plaster_white', [[0.001, 4.12], [0.4, 4.12], [0.42, 4.08], [0.3, 4.05], [0.15, 4.04], [0.001, 4.03]], 10, 0, 0, (Z0 + Z1) / 2);
    // the lamp: an iron stem from the rose and a globe of glass
    rd(IRON, [0, (Z0 + Z1) / 2, 4.04], [0, (Z0 + Z1) / 2, 3.55], 0.012, 4); b.lathe('lamp_glass', [[0.001, 3.55], [0.06, 3.52], [0.12, 3.4], [0.13, 3.25], [0.09, 3.12], [0.04, 3.06], [0.001, 3.05]], 8, 0, 0, (Z0 + Z1) / 2);
    // the mailboxes on the left wall (two rows of four brass doors on a board) and the bell plate by the door
    bx('wood_dark', -HW + 0.03, -HW + 0.07, Z0 + 0.45, Z0 + 1.65, 1.55, 2.15);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) bx('gilt_bronze', -HW + 0.07, -HW + 0.095, Z0 + 0.52 + i * 0.29, Z0 + 0.72 + i * 0.29, 1.62 + j * 0.28, 1.84 + j * 0.28);
    // the potted palm in the right corner (a terracotta pot, a tuft of fronds)
    b.lathe('terracotta', [[0.001, Y0], [0.17, Y0], [0.24, Y0 + 0.36], [0.27, Y0 + 0.38], [0.27, Y0 + 0.44], [0.22, Y0 + 0.44], [0.001, Y0 + 0.4]], 8, 0.9, 0, Z1 - 0.5);
    for (let k = 0; k < 7; k++) { const a = k / 7 * Math.PI * 2, r = 0.3 + (k % 2) * 0.08, cx = 0.9, cz = Z1 - 0.5, h = 0.44 + 0.12; rd('cloth_green', [cx, cz, h], [cx + Math.cos(a) * r * 0.5, cz + Math.sin(a) * r * 0.5, h + 0.75 + (k % 3) * 0.14], 0.018, 4); rd('cloth_green', [cx + Math.cos(a) * r * 0.5, cz + Math.sin(a) * r * 0.5, h + 0.75 + (k % 3) * 0.14], [cx + Math.cos(a) * r, cz + Math.sin(a) * r, h + 0.5 + (k % 3) * 0.1], 0.016, 4); }
    // the doorway's step, the fanlight's glass and iron (rectangular, elliptical or a gate's overthrow), the plate and the bell-pull on the right pillar
    bx('granite_grey', -1.15, 1.15, -0.55, 0.0, -0.25, 0.1);
    if (v === 0) { bx(IRON, -OW, OW, 0.16, 0.2, 2.95, 3.0); bx('glass_outer', -OW, OW, 0.17, 0.19, 3.0, OH); for (const x of [-0.5, 0, 0.5]) bx(IRON, x - 0.015, x + 0.015, 0.16, 0.2, 3.0, OH); }
    else if (v === 1) {
      const cy = 3.0, a = OW, bb = OH - cy, el = (t) => [a * Math.cos(t), cy + bb * Math.sin(t)];
      for (let i = 0; i < 12; i++) { const p0 = el((i / 12) * Math.PI), p1 = el(((i + 1) / 12) * Math.PI); rd(IRON, [p0[0], 0.18, p0[1]], [p1[0], 0.18, p1[1]], 0.014, 4); }
      for (let k = 1; k < 6; k++) { const p = el((k / 6) * Math.PI); rd(IRON, [0, 0.18, cy], [p[0], 0.18, p[1]], 0.01, 4); }
      bx(IRON, -OW, OW, 0.17, 0.19, cy - 0.03, cy + 0.02);
      bx('glass_outer', -OW + 0.12, OW - 0.12, 0.185, 0.195, cy + 0.02, OH - 0.2);
    } else { bx(IRON, -OW, OW, 0.16, 0.2, 3.55, 3.6); for (let i = 0; i < 9; i++) bx(IRON, -OW + 0.1 + i * 0.21 - 0.012, -OW + 0.1 + i * 0.21 + 0.012, 0.16, 0.2, 3.6, OH); }
    bx('gilt_bronze', 1.05 - 0.07, 1.05 + 0.07, -0.235, -0.22, 1.55, 1.75); bx('gilt_bronze', 1.05 - 0.025, 1.05 + 0.025, -0.24, -0.22, 1.3, 1.4);
    // the doors of the portal, open against the walls of the vestibule (a leaf of panels, or iron and glass, or boards studded with nails)
    for (const sg of [-1, 1]) {
      const x0 = sg * (OW - 0.0), x1 = sg * (OW + 0.05), lo = Math.min(x0, x1), hi = Math.max(x0, x1);
      if (v === 1) { bx(IRON, lo, hi, Z0 + 0.02, Z0 + 0.98, Y0, 0.4); bx(IRON, lo, hi, Z0 + 0.02, Z0 + 0.98, 2.9, 3.0); bx('glass_outer', lo + 0.015, hi - 0.015, Z0 + 0.06, Z0 + 0.94, 0.4, 2.9); for (let k = 0; k <= 4; k++) bx(IRON, lo - 0.005, hi + 0.005, Z0 + 0.02 + k * 0.23, Z0 + 0.04 + k * 0.23, 0.4, 2.9); }
      else { bx('wood_dark', lo, hi, Z0 + 0.02, Z0 + 0.98, Y0, 3.0); for (const [y0, y1] of [[0.3, 1.3], [1.45, 2.85]]) bx(v === 2 ? 'wood_ochre' : 'wood_painted', sg > 0 ? hi : lo - 0.012, sg > 0 ? hi + 0.012 : lo, Z0 + 0.12, Z0 + 0.88, y0, y1);
        if (v === 2) for (let i = 0; i < 4; i++) for (let j = 0; j < 7; j++) bx(IRON, sg > 0 ? hi : lo - 0.01, sg > 0 ? hi + 0.01 : lo, Z0 + 0.15 + i * 0.2, Z0 + 0.19 + i * 0.2, 0.3 + j * 0.4, 0.34 + j * 0.4); }
    }
    if (open) {
      // the inner door stands open: a frame of wood in the partition's doorway, a glazed transom over it, the leaves folded back
      for (const x of [-0.55, 0.5]) bx('wood_painted', x, x + 0.05, Z1, Z2, Y0, 2.7);
      bx('wood_painted', -0.55, 0.55, Z1, Z2, 2.65, 2.7);
      for (const sg of [-1, 1]) { bx('wood_painted', sg > 0 ? 0.55 : -0.6, sg > 0 ? 0.6 : -0.55, Z1 - 0.5, Z1, Y0, 2.6); bx('glass_outer', sg > 0 ? 0.56 : -0.59, sg > 0 ? 0.59 : -0.56, Z1 - 0.45, Z1 - 0.05, 0.5, 2.5); }
    } else {
    // the glazed inner door in its partition (a pair of leaves, wooden frames, glass, iron scrolls) and the stair hall's lining
    bx('wood_painted', -0.55, 0.55, Z1, Z2, Y0, Y0 + 0.4);
    for (const x of [-0.55, -0.03, 0.51]) bx('wood_painted', x, x + 0.04, Z1, Z2, Y0 + 0.4, 2.7);
    bx('wood_painted', -0.55, 0.55, Z1, Z2, 2.7 - 0.05, 2.7); bx('wood_painted', -0.55, 0.55, Z1, Z2, 1.55, 1.6);
    bx('glass_outer', -0.5, -0.05, Z1 + 0.1, Z1 + 0.14, Y0 + 0.45, 2.65); bx('glass_outer', -0.01, 0.5, Z1 + 0.1, Z1 + 0.14, Y0 + 0.45, 2.65);
    for (const x of [-0.45, -0.3, -0.15, 0.1, 0.25, 0.4]) bx(IRON, x - 0.008, x + 0.008, Z1 - 0.03, Z1, 0.6, 2.4);
    for (const x of [-0.27, 0.28]) b.lathe(IRON, [[0.001, 1.0], [0.05, 1.0], [0.05, 1.04], [0.001, 1.04]], 6, x, 0, Z1 - 0.04);
    bx('gilt_bronze', 0.0, 0.03, Z1 - 0.02, Z1, 0.95, 1.05);
    // the hall: plaster to the dado line, tiled dado, a floor, the stair's flight of marble steps up the left wall to a landing, the rail and the lamp
    bx('plaster_white', -HW, -HW + 0.03, Z2, Z3, 1.5, 4.12); bx('plaster_white', HW - 0.03, HW, Z2, Z3, 1.5, 4.12); bx(d1, -HW, -HW + 0.03, Z2, Z3, Y0 + 0.14, 1.34); bx(d1, HW - 0.03, HW, Z2, Z3, Y0 + 0.14, 1.34); bx(d1, -HW, HW, Z3 - 0.03, Z3, Y0 + 0.14, 1.34);
    bx(d2, -HW, -HW + 0.03, Z2, Z3, 1.34, 1.44); bx(d2, HW - 0.03, HW, Z2, Z3, 1.34, 1.44); bx(d2, -HW, HW, Z3 - 0.03, Z3, 1.34, 1.44); bx('plaster_white', -HW, HW, Z3 - 0.03, Z3, 1.5, 4.12);
    const n = 8, run = 0.27;
    for (let k = 0; k < n; k++) bx('marble', -HW + 0.03, -0.2, Z2 + 0.15 + k * run, Z2 + 0.15 + (k + 1) * run, Y0, Y0 + 0.18 * (k + 1));
    bx('marble', -HW + 0.03, HW - 0.03, Z2 + 0.15 + n * run, Z3 - 0.03, Y0, Y0 + 0.18 * n);
    for (let k = 0; k <= n; k++) bx(IRON, -0.21, -0.19, Z2 + 0.15 + k * run, Z2 + 0.17 + k * run, Y0 + 0.18 * Math.min(k + 1, n), Y0 + 0.18 * Math.min(k + 1, n) + 0.88);
    rd('wood_dark', [-0.2, Z2 + 0.15, Y0 + 0.18 + 0.9], [-0.2, Z2 + 0.15 + n * run, Y0 + 0.18 * n + 0.9], 0.03, 5);
    b.lathe(IRON, [[0.001, Y0], [0.06, Y0], [0.04, Y0 + 0.2], [0.05, Y0 + 1.0], [0.001, Y0 + 1.04]], 6, -0.2, 0, Z2 + 0.1);
    b.lathe('lamp_glass', [[0.001, Y0 + 1.04], [0.1, Y0 + 1.1], [0.12, Y0 + 1.28], [0.07, Y0 + 1.42], [0.001, Y0 + 1.44]], 8, -0.2, 0, Z2 + 0.1);
    bx('wood_dark', 0.3, 1.0, Z3 - 0.1, Z3 - 0.03, Y0 + 1.44, Y0 + 3.5);                                                                    // the door at the landing, to the porter's rooms
    bx('plaster_white', -HW, HW, Z2, Z3, 4.12, 4.2);
    }
  });
  /** The doorway's stone front (seen from afar; one shape a variant, of the stone alone): pillars, the lintel and what stands on it; the elliptical fanlight's plate for the second. */
  const front = (v) => H.proto(`portalf|${v}`, (b, { F }) => {
    for (const e of [-1, 1]) b.add(S, F(e * 1.1 - 0.15, e * 1.1 + 0.15, 0.06, 0.22, 0.4, OH));
    b.add(S, F(-1.3, 1.3, 0.076, 0.28, OH, OH + 0.45));
    if (v === 0) b.add(S, F(-1.05, 1.05, 0.1, 0.3, OH + 0.45, 4.58));
    else if (v === 1) {
      // the stone about an elliptical fanlight, in the doorway's head (z > 0 is into the wall in this frame)
      const T = [], N = 10, cy = 3.0, a = OW, bb = OH - cy, P = (x, y) => [x, y, 0.05];
      for (const sg of [-1, 1]) for (let i = 0; i < N; i++) {
        const t0 = (i / N) * Math.PI / 2, t1 = ((i + 1) / N) * Math.PI / 2;
        T.push(...P(sg * a * Math.cos(t0), cy + bb * Math.sin(t0)), ...P(sg * a * Math.cos(t1), cy + bb * Math.sin(t1)), ...P(sg * a, OH));
      }
      b.add(S, fromTriangles(both(T)));
      b.add(S, F(-0.9, 0.9, 0.1, 0.36, OH + 0.45, 4.58));
    } else {
      b.add(S, F(-0.35, 0.35, 0.1, 0.34, OH - 0.2, OH + 0.45)); b.add('limestone', F(-0.22, 0.22, 0.34, 0.37, OH - 0.1, OH + 0.3));
      b.add(S, F(-1.4, 1.4, 0.08, 0.5, OH + 0.45, 4.58));
    }
  });

  /**
   * The wall of a portal's bay, s from pc − HW to pc + HW (the plot's side pieces are the caller's): jambs, the head, the vestibule's and the
   * hall's ceiling, the partition with its doorway, the back; the floor's slab and colliders; the kit of the furnishing.
   * ceil: the y the mass above the ceiling ends at on this plot (the roof's level, or the shops' upper mass's foot).
   */
  function mass(ctx, fr, pc, D, y, ceil, mat, yS, v, lamp = true, open = false) {
    const { bag, col, lights } = ctx, F = fr.F, FL = yS + 0.12;
    const wr = (s0, s1, t0, t1, y0, y1) => { const p = fr.at(s0, t0), q = fr.at(s1, t1); col.rect([p[0], p[1], q[0], q[1]], y0, y1); };
    const wall = (s0, s1, t0, t1, y0, y1) => { bag.add(mat, F(s0, s1, t0, t1, y0, y1)); wr(s0, s1, t0, t1, y0, y1); };
    const b0 = y - 1.2, a = pc - HW, c = pc + HW, ZB = open ? 9.1 : VD + PW + HD;
    for (const e of [-1, 1]) wall(e > 0 ? pc + OW : a, e > 0 ? c : pc - OW, -FW, 0, b0, ceil);              // the jambs
    wall(pc - OW, pc + OW, -FW, 0, yS + OH, ceil);                                                         // over the doorway
    wall(a, c, open ? -(VD + PW) : -ZB, -FW, yS + 4.2, ceil);                                                                  // over the vestibule and the hall
    for (const e of [-1, 1]) wall(e > 0 ? pc + 0.55 : a, e > 0 ? c : pc - 0.55, -(VD + PW), -VD, b0, yS + 4.2);   // the partition's sides
    wall(pc - 0.55, pc + 0.55, -(VD + PW), -VD, yS + 2.7, yS + 4.2);                                       // …and over its door
    if (!open) wr(pc - 0.55, pc + 0.55, -(VD + PW), -VD, FL, yS + 2.7);   // (the door itself shut: glass and iron, no way through)
    wall(a, c, -D, -ZB, b0, ceil);                                                                         // the back
    // the floor: a slab of cement tile under the vestibule, the hall and the doorway
    bag.add('tile_cream', F(a, c, -ZB, -FW, yS - 0.4, FL)); bag.add('tile_cream', F(pc - OW, pc + OW, -FW, 0.02, yS - 0.4, FL));
    const p = fr.at(a, -(VD)), q = fr.at(c, 0.15); col.floor([p[0], p[1], q[0], q[1]], FL);
    setKit(bag, fr, furnish(v, open), pc, yS, 45);
    // the vestibule's potted palm
    const pot = fr.at(pc + 0.9, -(VD - 0.5)); col.rect([pot[0] - 0.28, pot[1] - 0.28, pot[0] + 0.28, pot[1] + 0.28], FL, FL + 1.5);
    if (lights && lamp) { const l = fr.at(pc, -2.0); lights.push({ at: [l[0], yS + 3.2, l[1]], color: '#ffd9a0', intensity: 4, distance: 6 }); }
  }
  return { mass, front };
}
