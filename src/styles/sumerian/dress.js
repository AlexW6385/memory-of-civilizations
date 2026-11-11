// The eye-level dress of Ur's house fronts (docs/settlements/ur.md §5.6): what stands and hangs at a door in the
// lane — the brick bench, the water jars, fuel and palm ribs, the reed-mat awning on two palm poles, the rack of
// drying fish or dates, bundles of reeds leaning on the wall, the lamp ledge with its soot — the wares of a trade
// before its door, and the weather on the walls: the salt band at the foot (rising damp in a plain of salt), patches
// where the plaster has fallen and bare brick shows, the streaks of rain running from the parapet. Roof life
// (sleeping mats, reed bundles, jars: the roof was where the family slept in summer). All of it small: drawn near.

import { box, lathe, fromTriangles } from '../../core/geom.js';
import { beamTris } from '../ming/index.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const jarP = (s) => [[0.001, 0], [0.1 * s, 0], [0.13 * s, 0.03], [0.24 * s, 0.25 * s], [0.25 * s, 0.42 * s], [0.18 * s, 0.6 * s], [0.09 * s, 0.68 * s], [0.11 * s, 0.74 * s], [0.08 * s, 0.75 * s], [0.07 * s, 0.7 * s], [0.001, 0.68 * s]];

/** A face frame: world point of (u along the face, v out from it, y). */
function faceFrame([x0, z0, x1, z1], f) {
  return f === 'n' ? { P: (u, v) => [u, z0 - v], a: [x0, x1], n: [0, -1] }
    : f === 's' ? { P: (u, v) => [u, z1 + v], a: [x0, x1], n: [0, 1] }
      : f === 'w' ? { P: (u, v) => [x0 - v, u], a: [z0, z1], n: [-1, 0] }
        : { P: (u, v) => [x1 + v, u], a: [z0, z1], n: [1, 0] };
}

/**
 * dressFront: { rect, face (the wall that has the door), dc (the door's middle along it, world), trade, seed, foot (the
 * height of the baked footing), H (the wall's height), near (full dress, else only the door's), other faces: weather only }.
 */
export function dressFront({ bag, col }, o) {
  const rand = rng((o.seed || 1) * 7 + 3), { rect, face, dc, H } = o, near = o.near !== false;
  const all = ['n', 's', 'w', 'e'];
  for (const f of all) {
    const F = faceFrame(rect, f), [a0, a1] = F.a, len = a1 - a0, [nx, nz] = F.n, isDoor = f === face;
    const fb = (mat, u0, v0, u1, v1, y0, y1) => { const p = F.P(u0, v0), q = F.P(u1, v1); bag.add(mat, box(Math.min(p[0], q[0]), y0, Math.min(p[1], q[1]), Math.max(p[0], q[0]), y1, Math.max(p[1], q[1]))); };
    const fl = (mat, prof, u, v, y, seg = 10) => { const [x, z] = F.P(u, v); bag.add(mat, lathe(prof, seg, null, x, y, z)); };
    const fbeam = (mat, u0, v0, y0, u1, v1, y1, w, h) => { const p = F.P(u0, v0), q = F.P(u1, v1), T = []; beamTris(T, [p[0], y0, p[1]], [q[0], y1, q[1]], w, h); bag.add(mat, fromTriangles(T)); };
    const fcol = (u0, v0, u1, v1, h) => { const p = F.P(u0, v0), q = F.P(u1, v1); col.rect([Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])], 0, h); };
    const clear = (u, w) => !isDoor || Math.abs(u - dc) > w + 0.65;
    // the weather: the salt band, the patches, the streaks (walls longer than 3 m)
    if (len > 3 && o.weather !== false) {
      const foot = o.foot ?? 0.9, gaps = isDoor ? [[dc - 0.65, dc + 0.65]] : [];
      let u = a0 + 0.2;
      for (const [g0, g1] of [...gaps, [a1 - 0.2, a1 - 0.2]]) { if (g0 - u > 0.3) fb('plaster_damp', u, 0.0, g0, 0.012, foot - 0.05, foot + 0.4 + rand() * 0.25); u = g1; }
      const np = near ? 2 + Math.floor(rand() * 3) : 1;
      for (let k = 0; k < np; k++) {
        const u0 = a0 + 0.4 + rand() * (len - 1.8), w = 0.35 + rand() * 0.9, h = 0.3 + rand() * 0.6, y = 1.0 + rand() * Math.min(2.2, H - 2.2);
        if (isDoor && Math.abs(u0 + w / 2 - dc) < w / 2 + 0.9) continue;
        fb('mudbrick', u0, 0.026, u0 + w, 0.038, y, y + h);
        if (rand() < 0.6) fb('plaster_damp', u0 - 0.1, 0.013, u0 + w + 0.1, 0.025, y - 0.06, y + h + 0.06);
      }
      if (near) for (let k = 0; k < 2; k++) {
        const u0 = a0 + 0.5 + rand() * (len - 1.2), h = 1.3 + rand() * 1.6;
        if (isDoor && Math.abs(u0 - dc) < 0.9) continue;
        fb('plaster_streak', u0, 0.039, u0 + 0.16, 0.05, H - h, H);
      }
    }
    if (!isDoor || !near) continue;
    // the door's dress: two to four things either side, by the trade (or by the house)
    const room = (s) => (s < 0 ? dc - 0.9 - a0 - 0.3 : a1 - 0.3 - dc - 0.9);
    const sides = rand() < 0.5 ? [-1, 1] : [1, -1];
    const place = (kind, s) => {
      const base = dc + s * (0.95 + rand() * 0.25);
      if (room(s) < 1.1) return;
      const sg = s;
      switch (kind) {
        case 'bench': { const l = Math.min(room(s) - 0.2, 1.1 + rand() * 0.6), u0 = Math.min(base, base + sg * l), u1 = Math.max(base, base + sg * l); fb('mud_plaster', u0, 0, u1, 0.4, 0, 0.4); fb('brick_baked', u0 - 0.02, -0.0, u1 + 0.02, 0.42, 0.38, 0.42); fcol(u0, 0, u1, 0.4, 0.42);
          if (rand() < 0.5) fl('terracotta', jarP(0.7), (u0 + u1) / 2, 0.2, 0.42, 10); break; }
        case 'jars': { const n = 2 + Math.floor(rand() * 2); for (let k = 0; k < n; k++) fl(rand() < 0.2 ? 'pottery_dark' : 'terracotta', jarP(0.8 + rand() * 0.55), base + sg * (0.2 + k * 0.38), 0.25 + (k % 2) * 0.1, 0, 12); fcol(base, 0.0, base + sg * (0.3 + n * 0.38), 0.55, 0.9); break; }
        case 'fuel': { for (let k = 0; k < 6; k++) fl('pottery_dark', [[0.001, 0], [0.13, 0.005], [0.14, 0.035], [0.001, 0.04]], base + sg * 0.2, 0.22, k * 0.04, 10);
          for (let k = 0; k < 5; k++) fbeam('palm_trunk', base + sg * (0.5 + k * 0.07), 0.08, 1.4, base + sg * (0.55 + k * 0.07), 0.38, 0.05, 0.022, 0.04); break; }
        case 'reeds': { for (let k = 0; k < 5; k++) fbeam('reed_mat', base + sg * (0.2 + k * 0.1), 0.05, 1.9, base + sg * (0.22 + k * 0.1), 0.34, 0.05, 0.05, 0.09); break; }
        case 'rack': { const u0 = base, u1 = base + sg * Math.min(1.6, room(s) - 0.2); for (const u of [u0, u1]) fb('palm_trunk', u - 0.03, 0.4, u + 0.03, 0.46, 0, 1.6);
          fbeam('palm_trunk', u0, 0.43, 1.55, u1, 0.43, 1.55, 0.02, 0.04); for (let u = Math.min(u0, u1) + 0.1; u < Math.max(u0, u1) - 0.1; u += 0.22) fb(rand() < 0.5 ? 'hide_grey' : 'cloth_ochre', u, 0.41, u + 0.14, 0.45, 0.85, 1.5); break; }
        case 'lamp': { const u = base - sg * 0.2; fb('mud_plaster', u - 0.15, 0, u + 0.15, 0.2, 1.55, 1.62); fl('terracotta', [[0.001, 0], [0.05, 0.005], [0.06, 0.03], [0.03, 0.045], [0.001, 0.04]], u, 0.1, 1.62, 8); fb('flame', u - 0.01, 0.09, u + 0.01, 0.11, 1.66, 1.7); fb('pottery_dark', u - 0.2, 0.052, u + 0.2, 0.062, 1.7, 2.4); break; }
        case 'mat': { const u0 = base, u1 = base + sg * Math.min(1.6, room(s) - 0.1); fb('reed_mat', u0, 0.1, u1, 0.9, 0, 0.014); break; }
        default: break;
      }
    };
    // by the trade
    const tr = o.trade;
    if (tr === 'potter') { place('mat', sides[0]); const u = dc + sides[0] * 1.2; for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) fl('terracotta', jarP(0.7), u + sides[0] * (0.15 + i * 0.32), 0.3 + j * 0.3, 0.014, 10); place('jars', sides[1]); }
    else if (tr === 'baker') { place('bench', sides[0]); place('fuel', sides[1]); place('lamp', sides[0]); }
    else if (tr === 'brewer') { place('jars', sides[0]); place('bench', sides[1]); }
    else if (tr === 'fisher') { place('rack', sides[0]); place('reeds', sides[1]); place('mat', sides[1]); }
    else if (tr === 'reeder') { place('reeds', sides[0]); place('reeds', sides[1]); place('bench', sides[0]); }
    else if (tr === 'weaver') { place('bench', sides[0]); place('lamp', sides[1]); const u = dc + sides[1] * 1.2; if (room(sides[1]) > 1.4) { fbeam('timber', u, 0.2, 2.0, u + sides[1] * 1.0, 0.2, 2.0, 0.015, 0.03); for (const [k, c] of ['cloth_red', 'cloth_indigo', 'cloth_ochre'].entries()) fb(c, u + sides[1] * (0.1 + k * 0.3), 0.18, u + sides[1] * (0.3 + k * 0.3), 0.22, 1.0, 1.95); } }
    else if (tr === 'smith') { place('fuel', sides[0]); place('lamp', sides[1]); place('jars', sides[1]); }
    else if (tr === 'granary') { place('bench', sides[0]); place('jars', sides[1]); }
    else {
      const kinds = ['bench', 'jars', 'fuel', 'reeds', 'rack', 'lamp', 'mat', 'jars'];
      const n = 2 + Math.floor(rand() * 2);
      for (let k = 0; k < n; k++) place(kinds[Math.floor(rand() * kinds.length)], sides[k % 2]);
    }
    // the awning: a reed mat on two palm poles over the door, sloping down to the lane (about one house in three)
    if (rand() < 0.34) {
      const w = 1.1, u0 = dc - w, u1 = dc + w, T = [], A = F.P(u0, 0), B = F.P(u1, 0), C = F.P(u1, 0.9), D = F.P(u0, 0.9);
      const quad = [[A[0], 2.75, A[1]], [B[0], 2.75, B[1]], [C[0], 2.3, C[1]], [D[0], 2.3, D[1]]];
      T.push(...quad[0], ...quad[1], ...quad[2], ...quad[0], ...quad[2], ...quad[3], ...quad[0], ...quad[2], ...quad[1], ...quad[0], ...quad[3], ...quad[2]);
      bag.add('reed_mat', fromTriangles(T));
      for (const u of [u0 + 0.05, u1 - 0.05]) fb('palm_trunk', u - 0.04, 0.86, u + 0.04, 0.94, 0, 2.32);
      fbeam('palm_trunk', u0, 0.9, 2.3, u1, 0.9, 2.3, 0.03, 0.05);
    }
  }
}

/** Roof life on a house { wings: [[x0, z0, x1, z1]...] (the roofs), y (the roof's top), seed }: where the family slept in summer. */
export function roofLife({ bag }, { wings, y, seed }) {
  const rand = rng((seed || 1) * 13 + 5), w = wings.filter((r) => r[2] - r[0] > 2.2 && r[3] - r[1] > 1.6);
  if (!w.length) return;
  const n = 1 + Math.floor(rand() * 2);
  for (let k = 0; k < n; k++) {
    const r = w[Math.floor(rand() * w.length)], cx = r[0] + 0.9 + rand() * (r[2] - r[0] - 1.8), cz = r[1] + 0.7 + rand() * (r[3] - r[1] - 1.4), kind = rand();
    if (kind < 0.45) {     // a sleeping mat with a linen sheet and a bolster
      const alongX = rand() < 0.5, a = alongX ? [1.8, 0.8] : [0.8, 1.8];
      bag.add('reed_mat', box(cx - a[0] / 2, y, cz - a[1] / 2, cx + a[0] / 2, y + 0.02, cz + a[1] / 2));
      bag.add('linen', box(cx - a[0] / 2 + 0.05, y + 0.02, cz - a[1] / 2 + 0.05, cx + a[0] / 2 - 0.05, y + 0.07, cz + a[1] / 2 - 0.05));
      bag.add('cloth_ochre', box(cx - (alongX ? a[0] / 2 - 0.1 : 0.3), y + 0.07, cz - (alongX ? 0.3 : a[1] / 2 - 0.1), cx - (alongX ? a[0] / 2 - 0.4 : -0.3), y + 0.17, cz - (alongX ? -0.3 : a[1] / 2 - 0.4)));
    } else if (kind < 0.75) {  // bundles of reeds stacked for the next boat or roof
      for (let i = 0; i < 4; i++) { const T = []; beamTris(T, [cx - 0.9, y + (i > 2 ? 0.2 : 0), cz + (i % 3) * 0.2], [cx + 0.9, y + (i > 2 ? 0.2 : 0), cz + (i % 3) * 0.2], 0.09, 0.17); bag.add('reed_mat', fromTriangles(T)); }
    } else {     // a water jar in its ring stand under a wet cloth, a basket
      bag.add('terracotta', lathe(jarP(1.1), 12, null, cx, y, cz)); bag.add('terracotta', lathe([[0.2, 0], [0.2, 0.08], [0.14, 0.08]], 10, null, cx, y, cz));
      bag.add('wicker', lathe([[0.001, 0], [0.2, 0.01], [0.24, 0.3], [0.22, 0.31], [0.18, 0.04], [0.001, 0.04]], 12, null, cx + 0.6, y, cz + 0.2));
    }
  }
}
