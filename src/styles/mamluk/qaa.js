// A Cairene merchant's house about 1363 with its qa'a, furnished (docs/settlements/mamluk-cairo.md §10). The qa'a
// is "a living space with two iwans facing each other on the main axis"; between them the durqa'a, the entry to the
// qa'a, "one step lower and has a higher ceiling", usually roofed with a lantern or a dome; the badhahanj (malqaf), an
// open shaft over one of the iwans, turns the wind down into it; the Qa'a of Muhibb al-Din (1350) is a rare merchant's
// dwelling of the kind [stated: MIT 4.615, "Mamluk domestic architecture"]. The qa'a and takhtabush are the men's
// reception rooms on the ground floor, the takhtabush a receiving place off the court [stated: Wikipedia "Residential
// architecture in Historic Cairo"]. Built with the shared courtyard house (src/styles/mughal/courthouse.js).

import { box, lathe, rod, fromTriangles } from '../../core/geom.js';
import { courtHouse } from '../mughal/courthouse.js';
import * as F from '../mughal/furnish.js';

const S = 'limestone_yellow';

/**
 * cairo_qaa: { rect, entry ('e' | 'w' | 'n' | 's'), seed } — a court house of stone: the bent entrance; the court
 * paved in flags with a well-head and water jars; on the north the qa'a, its durqa'a paved in coloured marble round an
 * octagonal fountain under a lantern of wooden lattice, the two iwans raised a step either side, spread with carpets,
 * cushioned benches along their walls, a brass tray on its stand, a shelf (suffa) of china and brass on colonnettes,
 * the beams of the iwans' fronts on carved corbels, a glass lamp hung in the lantern; the malqaf over the west iwan;
 * on the south the takhtabush, open to the court by a wide arch on a column, a bench in it.
 */
export function cairoQaa(el, { bag, col, lights }) {
  const M = { out: S, in: 'stucco_warm', floor: 'marble_floor', court: 'flagstone', ceiling: 'ceiling_painted', beam: 'wood_dark', leaf: 'wood_dark', lattice: 'lattice', base: 'mud_plaster', trim: 'limestone' };
  const d = { n: 7.0, s: 4.0, w: 3.6, e: 3.4 };
  const R = courtHouse(bag, col, {
    rect: el.rect, y: 0, th: 0.7, ti: 0.5, fh: 0.3, H: 5.2, d, mats: M,
    entry: { side: el.entry ?? 'e', span: [0.5, 0.9], at: 0.75, inner: 0.25, w: 1.3 },
    wings: {
      n: { kind: 'room', h: 7.6, arches: [{ at: 0.5, w: 1.5, h: 3.0 }], windows: [{ at: 0.2, w: 1.3, h: 1.9, sill: 1.5 }, { at: 0.8, w: 1.3, h: 1.9, sill: 1.5 }], lantern: { at: 0.5, w: 3.2 } },
      s: { kind: 'open', h: 5.2, arches: [{ at: 0.5, w: 5.0, h: 3.9 }] },
      w: { kind: 'solid', h: 5.2 }, e: { kind: 'solid', h: 5.2 },
    },
  });
  const q = R.n, [x0, z0, x1, z1] = q.room, y = q.y, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, top = q.top;
  // ---- the durqa'a: its floor of coloured marble (a star of eight in a square, a border of dark and rose), the fountain
  const dw = 2.0;                                                                             // the durqa'a's half length
  bag.add('marble_smooth', box(cx - dw, y, z0 + 0.03, cx + dw, y + 0.012, z1 - 0.03));
  for (const [m, a, yy] of [['marble_dark', 1.75, 0.02], ['marble_pink', 1.45, 0.028]]) bag.add(m, F.flatUp(Array.from({ length: 16 }, (_, k) => { const t = k / 16 * Math.PI * 2, r = k % 2 ? a * 0.72 : a; return [cx + Math.cos(t) * r, cz + Math.sin(t) * r]; }), y + yy));
  for (const s of [-1, 1]) bag.add('marble_dark', box(cx - dw, y + 0.004, s > 0 ? z1 - 0.33 : z0 + 0.03, cx + dw, y + 0.02, s > 0 ? z1 - 0.03 : z0 + 0.33));
  for (let k = 0; k < 8; k++) bag.add(k % 2 ? 'marble_pink' : 'marble_dark', box(cx - dw + k * dw / 4, y + 0.004, z0 + 0.36, cx - dw + (k + 1) * dw / 4 - 0.04, y + 0.02, z0 + 0.5));
  // the fountain (fisqiya): an octagonal basin of marble with a moulded rim, the water, a jet from a bronze spout
  bag.add('marble_smooth', lathe([[1.05, 0], [1.05, 0.24], [1.15, 0.28], [1.15, 0.34], [0.92, 0.34], [0.92, 0.08], [0.001, 0.08]], 8, null, cx, y + 0.028, cz));
  { const t = []; for (let k = 0; k < 8; k++) { const a0 = k / 8 * Math.PI * 2, a1 = (k + 1) / 8 * Math.PI * 2; t.push(cx, y + 0.3, cz, cx + Math.cos(a1) * 0.92, y + 0.3, cz + Math.sin(a1) * 0.92, cx + Math.cos(a0) * 0.92, y + 0.3, cz + Math.sin(a0) * 0.92); } bag.add('water', fromTriangles(t)); }
  bag.add('bronze', lathe([[0.06, 0], [0.04, 0.3], [0.08, 0.36], [0.02, 0.42], [0.001, 0.46]], 8, null, cx, y + 0.1, cz));
  bag.add('water_jet', lathe([[0.02, 0], [0.015, 0.4], [0.05, 0.48], [0.001, 0.55]], 6, null, cx, y + 0.56, cz));
  col.circle(cx, cz, 1.15, y, y + 0.36);
  // ---- the iwans: a step up of marble with a dark edge, carpets, benches along their walls with cushions
  for (const s of [-1, 1]) {
    const ia = s < 0 ? x0 : cx + dw, ib = s < 0 ? cx - dw : x1, iy = y + 0.3;
    bag.add('marble_floor', box(ia, y, z0, ib, iy, z1)); col.floor([ia, z0, ib, z1], iy);
    const edge = s < 0 ? ib : ia;
    bag.add('marble_dark', box(edge - 0.08, y, z0, edge + 0.08, iy + 0.02, z1));
    const iw = ib - ia, ic = (ia + ib) / 2;
    F.carpet(bag, ic, iy, cz, iw - 0.9, z1 - z0 - 1.9, 0, 'mamluk');
    const end = s < 0 ? ia : ib;
    F.divan(bag, null, [end, z0 + 0.1], [end, z1 - 0.1], iy, [cx, cz], { h: 0.32, depth: 0.8, base: 'wood_dark', mattress: 'cloth_red', backs: ['cloth_green', 'cloth_ochre', 'cloth_indigo'] });
    F.divan(bag, null, [end - s * 0.85, z0], [edge + s * 0.3, z0], iy, [cx, cz], { h: 0.32, depth: 0.75, base: 'wood_dark', mattress: 'cloth_indigo', backs: ['cloth_ochre', 'cloth_red'] });
    // the beam across the iwan's front, on corbels of three stepped tiers, painted
    const bx = edge;
    bag.add('wood_dark', box(bx - 0.14, top - 0.62, z0, bx + 0.14, top - 0.16, z1));
    bag.add('paint_blue', box(bx - 0.15, top - 0.5, z0 + 0.4, bx + 0.15, top - 0.42, z1 - 0.4));
    for (const zz of [z0, z1]) for (let k = 0; k < 3; k++) { const o = 0.18 + k * 0.16, sg = zz === z0 ? 1 : -1; bag.add('wood_dark', box(bx - 0.13, top - 0.62 - (k + 1) * 0.22, Math.min(zz, zz + sg * o), bx + 0.13, top - 0.62 - k * 0.22, Math.max(zz, zz + sg * o))); }
  }
  // the tray on its stand and the brass on the west iwan; the shelf (suffa) on two colonnettes against the court wall
  F.trayTable(bag, x0 + 1.7, y + 0.32, cz + 0.2, { r: 0.4, h: 0.38, seed: el.seed ?? 7 });
  F.ewer(bag, x1 - 1.4, y + 0.32, cz - 0.7, 1.0, 0.4);
  F.brazier(bag, null, x1 - 1.8, y + 0.32, cz + 0.6, 0.22);
  { const sz = z0 + 0.03, sy = y + 2.1;
    bag.add('marble_smooth', box(cx - 1.4, sy, sz, cx + 1.4, sy + 0.08, sz + 0.35));
    for (const s of [-1, 1]) bag.add('marble_column', lathe([[0.07, 0], [0.06, 0.1], [0.055, sy - y - 0.15], [0.09, sy - y - 0.05], [0.09, sy - y], [0.001, sy - y]], 8, null, cx + s * 1.25, y + 0.028, sz + 0.2));
    for (let k = 0; k < 6; k++) { const u = cx - 1.15 + k * 0.46; if (k % 2) bag.add('glaze_blue', lathe([[0.001, 0], [0.05, 0], [0.12, 0.06], [0.13, 0.08], [0.001, 0.02]], 12, null, u, sy + 0.08, sz + 0.18)); else bag.add(k === 2 ? 'bronze' : 'glaze_white', lathe([[0.001, 0], [0.05, 0], [0.09, 0.1], [0.08, 0.2], [0.04, 0.26], [0.05, 0.3], [0.001, 0.3]], 12, null, u, sy + 0.08, sz + 0.18)); }
  }
  // ---- the lantern (shukhshaykha) over the durqa'a: a drum of eight lattice panels on the roof's opening, a dome of boards
  const hole = q.hole, hy = q.h, Lh = 1.7, lr = (hole[2] - hole[0]) / 2;
  { const hc = [(hole[0] + hole[2]) / 2, (hole[1] + hole[3]) / 2];
    // the well of the opening down to the ceiling, lined
    for (const r of [[hole[0] - 0.05, hole[1] - 0.05, hole[2] + 0.05, hole[1]], [hole[0] - 0.05, hole[3], hole[2] + 0.05, hole[3] + 0.05], [hole[0] - 0.05, hole[1], hole[0], hole[3]], [hole[2], hole[1], hole[2] + 0.05, hole[3]]]) bag.add('wood_dark', box(r[0], top - 0.1, r[1], r[2], hy, r[3]));
    for (let k = 0; k < 8; k++) {
      const a0 = (k + 0.5) / 8 * Math.PI * 2, a1 = (k + 1.5) / 8 * Math.PI * 2, rr = lr / Math.cos(Math.PI / 8) * 0.98;
      const p0 = [hc[0] + Math.cos(a0) * rr, hc[1] + Math.sin(a0) * rr], p1 = [hc[0] + Math.cos(a1) * rr, hc[1] + Math.sin(a1) * rr];
      const t = []; quadV(t, p0, p1, hy + 0.15, hy + Lh - 0.15); bag.add('lattice', fromTriangles(t));
      bag.add('wood_dark', rod([p0[0], hy, p0[1]], [p0[0], hy + Lh, p0[1]], 0.05, 4));
    }
    bag.add('wood_dark', lathe([[lr * 1.12, 0], [lr * 1.12, 0.15], [lr * 0.95, 0.15], [lr * 0.95, 0]], 8, null, hc[0], hy, hc[1]));
    bag.add('wood_dark', lathe([[lr * 1.12, 0], [lr * 1.12, 0.15], [lr * 0.95, 0.15], [lr * 0.95, 0]], 8, null, hc[0], hy + Lh - 0.15, hc[1]));
    bag.add('wood_dark', lathe([[lr * 1.25, 0], [lr * 1.15, 0.3], [lr * 0.8, 0.8], [lr * 0.35, 1.05], [0.08, 1.12], [0.06, 1.35], [0.001, 1.4]], 16, null, hc[0], hy + Lh, hc[1]));
    bag.add('ceiling_painted', lathe([[0.001, 1.0], [lr * 0.3, 0.97], [lr * 0.75, 0.75], [lr * 1.05, 0.25], [lr * 1.1, 0.02]], 16, null, hc[0], hy + Lh - 0.03, hc[1]));
    F.mosqueLamp(bag, lights, hc[0], y + 3.3, hc[1], hy + Lh + 0.9, { enamel: true, k: 1.1, glow: 3, reach: 9 });
  }
  // the malqaf over the west iwan: a shaft rising from the roof, its mouth turned north under a sloping board roof
  { const mx = x0 + 1.6, mz = cz, mw = 1.2;
    bag.add(S, box(mx - mw / 2 - 0.15, hy, mz - mw / 2 - 0.15, mx - mw / 2, hy + 1.6, mz + mw / 2 + 0.15));
    bag.add(S, box(mx + mw / 2, hy, mz - mw / 2 - 0.15, mx + mw / 2 + 0.15, hy + 1.6, mz + mw / 2 + 0.15));
    bag.add(S, box(mx - mw / 2, hy, mz + mw / 2, mx + mw / 2, hy + 1.6, mz + mw / 2 + 0.15));
    const g = box(-mw / 2 - 0.25, 0, -0.04, mw / 2 + 0.25, 0.06, mw + 0.5); g.rotateX(0.5); g.translate(mx, hy + 1.6, mz - mw / 2 - 0.3); bag.add('wood_dark', g);
    bag.add('lattice', box(mx - mw / 2, hy + 0.2, mz - mw / 2 - 0.12, mx + mw / 2, hy + 1.4, mz - mw / 2 - 0.08));
  }
  // the qa'a's door on the court: a frame of dark and white marble, a lintel of joggled voussoirs in turn, a panel over it
  { const zf = q.room[3] + 0.5, ax = cx, hw = 0.75;
    for (const sg of [-1, 1]) for (let k = 0; k < 7; k++) bag.add(k % 2 ? 'marble_dark' : 'marble_smooth', box(ax + sg * hw - (sg > 0 ? 0 : 0.3), 0.04 + k * 0.5, zf, ax + sg * hw + (sg > 0 ? 0.3 : 0), 0.04 + (k + 1) * 0.5, zf + 0.06));
    for (let k = 0; k < 7; k++) { const u0 = ax - hw - 0.3 + k * (2 * hw + 0.6) / 7; bag.add(k % 2 ? 'marble_dark' : 'marble_smooth', box(u0, 3.54, zf, u0 + (2 * hw + 0.6) / 7, 4.1, zf + 0.06)); }
    bag.add('marble_pink', box(ax - hw - 0.3, 4.1, zf, ax + hw + 0.3, 4.6, zf + 0.06)); }
  // ---- the court: the well-head with its pulley frame, water jars on their stand; the takhtabush's column and bench
  const c = R.court, ccx = (c[0] + c[2]) / 2, ccz = (c[1] + c[3]) / 2;
  { const wx = c[0] + 1.3, wz = c[1] + 1.4;
    bag.add('marble_smooth', lathe([[0.55, 0], [0.55, 0.75], [0.62, 0.8], [0.62, 0.86], [0.42, 0.86], [0.42, 0.2], [0.001, 0.2]], 12, null, wx, 0.04, wz)); col.circle(wx, wz, 0.62, 0, 0.86);
    for (const s of [-1, 1]) bag.add('wood_dark', box(wx + s * 0.6 - 0.05, 0.04, wz - 0.05, wx + s * 0.6 + 0.05, 2.0, wz + 0.05));
    bag.add('wood_dark', box(wx - 0.65, 1.95, wz - 0.05, wx + 0.65, 2.05, wz + 0.05));
    bag.add('wood_dark', lathe([[0.001, -0.05], [0.12, -0.04], [0.12, 0.04], [0.001, 0.05]], 10).rotateZ(Math.PI / 2).translate(wx, 1.85, wz));
    bag.add('hide_tan', rod([wx, 1.8, wz + 0.1], [wx, 0.9, wz + 0.1], 0.008, 3)); }
  F.waterJar(bag, c[2] - 0.6, 0.04, c[1] + 0.7, 0.9); F.waterJar(bag, c[2] - 1.35, 0.04, c[1] + 0.7, 0.75);
  const t = R.s.room;
  F.divan(bag, col, [t[0] + 0.1, t[3]], [t[2] - 0.1, t[3]], R.s.y, [ccx, ccz], { h: 0.4, depth: 0.8, base: 'wood_dark', mattress: 'cloth_ochre', backs: ['cloth_red', 'cloth_green'] });
  F.reedMat(bag, (t[0] + t[2]) / 2, R.s.y, (t[1] + t[3]) / 2 - 0.4, t[2] - t[0] - 1.2, 1.6, 0);
}
/** A vertical quad from p0 to p1 between ya and yb, seen from both sides. */
function quadV(t, p0, p1, ya, yb) {
  const A = [p0[0], ya, p0[1]], B = [p1[0], ya, p1[1]], C = [p1[0], yb, p1[1]], D = [p0[0], yb, p0[1]];
  t.push(...A, ...B, ...C, ...A, ...C, ...D, ...A, ...C, ...B, ...A, ...D, ...C);
}
