// The Ananda's sculpture (docs/settlements/bagan.md §14): one element, `bgn_orn`, builds one kind of carving. The temple builds the modelled form always (src/styles/burmese/temple.js);
// the settlement's plans (src/settlements/bagan/sculpt.js) add the fine extras within a few metres (`extra: true`: curls, toes, nails, teeth, bells) and the reliefs and plaques near.
//   kind 'buddha':  { c, f, side, pose, seed, extra }   the standing Buddha of a niche on its lotus
//   kind 'donors':  { c, f, side }                      the two kneeling donors at the west Buddha's feet
//   kind 'reliefs': { c, f, side, run }                 the corridor's and porch's stone reliefs of one run ('c-', 'c+', 'p-', 'p+') cut as scenes (near only)
//   kind 'plaques': { c, f, side, sg, v0, v1 }          the glazed Jataka plaques of one run of the plinth's side (near only)
//   kind 'lion' | 'guard': { c, f, side, u, v, s } in a side's frame, or { at: [x, z], rot, y, s }, `extra`, `col` (a collision rect for the plinth)
import { Kit, frameXf, worldXf, hash3 } from './sculpt.js';
import { Fr, sideFrame } from './kit.js';
import { standingBuddha, kneeler } from './figures.js';
import { reliefScene, plaque } from './relief.js';
import { chinthe as lionOf, guardian as guardOf } from './beasts.js';

const THRONE = 2.4, BV = 10.9, HW = 16.8, HI = 13.6, HO = 26.5;

/** The panels of one run of reliefs, as the temple's own plan places them (temple.js): [{ F, u, v, dir, k }]. */
export function reliefPanels(ctx, c, f, side, run) {
  const F = sideFrame(ctx, c, side), out = [], sg = run[1] === '-' ? -1 : 1;
  if (run[0] === 'c') {
    const a = sg < 0 ? [-13.4, -2.6] : [2.6, 13.4];
    for (let q = 0; q < 5; q++) { const u = a[0] + (q + 0.5) * ((a[1] - a[0]) / 5); out.push({ F, u, v: HW, dir: -1, k: q }, { F, u, v: HI, dir: 1, k: q + 1 }); }
  } else {
    const G = new Fr(ctx, F.o, F.V, [F.U[0] * sg, F.U[1] * sg]), a = HO + 1.2, b = 41.3 - 0.9;
    for (let q = 0; q < 9; q++) out.push({ F: G, u: a + (q + 0.5) * ((b - a) / 9), v: 3.6, dir: -1, k: q + (sg > 0 ? 3 : 0) });
  }
  return out;
}

export function orn(el, ctx) {
  const c = el.c, f = el.f ?? 1.2, side = el.side ?? 'w', F = c ? sideFrame(ctx, c, side) : null, bag = ctx.bag;
  switch (el.kind) {
    case 'buddha': {
      const K = new Kit(frameXf(F, 0, BV, (el.y0 ?? f) + THRONE + 0.36, 0, 1), !!el.extra);
      standingBuddha(K, el.pose, !!el.extra, el.seed ?? 1); K.emit(bag); break;
    }
    case 'donors': {
      for (const [i, s] of [[0, -1], [1, 1]]) {
        const K = new Kit(frameXf(F, s * 0.8, 12.32, f + THRONE, Math.PI + s * 0.5, 1));
        kneeler(K, i ? 'monk' : 'king', false); K.emit(bag);
      }
      break;
    }
    case 'reliefs': {
      const K = new Kit(null), S = K.S('sandstone_relief'), S2 = K.S('sandstone_dressed');
      for (const p of reliefPanels(ctx, c, f, side, el.run)) {
        const u0 = p.u, v0 = p.v, d = p.dir, F2 = p.F, y0 = f + 1.12;
        S.xf = S2.xf = (q) => { const [X, Z] = F2.pt(u0 + q[0], v0 + d * (0.05 + q[2])); return [X, y0 + q[1], Z]; };
        reliefScene(S, p.k + 2 * (hash3(u0, v0, p.k) > 0.6 ? 1 : 0) + Math.floor(u0 / 3), S2);
      }
      K.emit(bag); break;
    }
    case 'plaques': {
      const K = new Kit(null), n = Math.max(1, Math.floor((el.v1 - el.v0) / 0.5));
      for (let i = 0; i < n; i++) {
        const v = el.v0 + (i + 0.5) * ((el.v1 - el.v0) / n), g = Math.round(v * 10 + el.sg * 7 + (el.side.charCodeAt(0)) * 13), S = K.S(g % 9 === 8 ? 'glaze_white' : 'glaze_green'), sg = el.sg, sc = 0.78;
        S.xf = (q) => { const [X, Z] = F.pt(sg * (8.2 + q[2] * sc), v + q[0] * sc); return [X, 0.36 + q[1] * sc * 0.75, Z]; };
        plaque(S, (g >> 1) + Math.floor(hash3(v, sg, 1) * 6), Math.round(v * 3), g);
      }
      K.emit(bag); break;
    }
    case 'lion': {
      let xf, rect, y;
      if (el.at) { const [x, z] = el.at, s = el.s ?? 1; xf = worldXf(x, el.y ?? 0, z, el.rot ?? 0, s); const r = el.rot ?? 0, fx = Math.sin(r), fz = Math.cos(r); rect = [x - Math.abs(0.9 * s * fz) - Math.abs(1.0 * s * fx), z - Math.abs(0.9 * s * fx) - Math.abs(1.0 * s * fz), x + Math.abs(0.9 * s * fz) + Math.abs(1.0 * s * fx), z + Math.abs(0.9 * s * fx) + Math.abs(1.0 * s * fz)]; y = el.y ?? 0; }
      else { xf = frameXf(F, el.u, el.v, f, 0, el.s ?? 1); }
      const K = new Kit(xf, !!el.extra), seed = Math.round((el.at ? el.at[0] * 3 + el.at[1] : el.u * 5 + el.v));
      lionOf(K, !!el.extra, seed); K.emit(bag);
      if (el.col && rect) ctx.col.rect(rect, y, y + 0.82 * (el.s ?? 1) + 1.8 * (el.s ?? 1));
      break;
    }
    case 'guard': {
      const K = new Kit(frameXf(F, el.u, el.v, f, 0, el.s ?? 1));
      guardOf(K, false, Math.round(el.u * 7 + el.v)); K.emit(bag); break;
    }
    default: break;
  }
}
