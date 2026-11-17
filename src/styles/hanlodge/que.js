// The Han que, the great gate tower (docs/settlements/han-changan.md §5c): the earthen shaft on a stepped plinth, red at its foot, bound by timber ribs and
// ties, its faces in plastered panels with a painted frieze, a false door on the outer face; two tiers of eaves — the skirt roof halfway up the shaft,
// the pavilion's roof above — each carried on a cascade of bracket arms, each ending in round tile ends with their characters; the open pavilion railed
// in lattice with the bronze phoenix on its ridge; the lower subsidiary tower (zi que) beside it, with its own roof. The roofs are han/kit.js's hipLite.
import { box, lathe } from '../../core/geom.js';
import { limb } from '../qing/carving.js';
import { hipLite } from '../han/kit.js';
import { phoenix } from './hall.js';
import { Mesh, wadang, bracketSet, faceOf, balustradeRun } from './detail.js';

/** hanl_que: { at [x, z], sub [sx, sz] (the direction of the subsidiary tower, one axis ±1), h (the main shaft), face [fx, fz] (the way the phoenix and the door look) } */
export function que(el, ctx) {
  const { bag, col } = ctx, M = new Mesh(), [x, z] = el.at, h = el.h ?? 11, a = 2.8, [sx, sz] = el.sub ?? [1, 0], [fx, fz] = el.face ?? [1, 0];
  const sub = { a: 1.8, h: h * 0.45 }; sub.x = x + sx * (a + sub.a); sub.z = z + sz * (a + sub.a);
  // the plinth: two steps of dressed stone round both towers
  const pl = (cx, cz, aa, hy, y1) => { const r = [cx - aa - hy, cz - aa - hy, cx + aa + hy, cz + aa + hy]; M.box('bluestone', r[0], -0.3, r[1], r[2], y1, r[3]); col.rect(r, -0.3, y1); };
  pl(x, z, a, 1.0, 0.2); pl(x, z, a, 0.55, 0.5); pl(sub.x, sub.z, sub.a, 1.0, 0.2); pl(sub.x, sub.z, sub.a, 0.55, 0.5);
  const sides = [['n', 0, -1], ['s', 0, 1], ['w', -1, 0], ['e', 1, 0]];
  const faceFor = (cx, cz, aa, [dx, dz]) => faceOf(dx ? (dx > 0 ? 'e' : 'w') : dz > 0 ? 's' : 'n', dx ? cx + dx * aa : cz + dz * aa);
  /** a shaft: earth, red foot, ties, ribs with their gaps (the bracket zone), panels, frieze */
  const shaft = (cx, cz, aa, hh, y0b, y1b, withDoor) => {
    M.box('earth_wall', cx - aa, 0.5, cz - aa, cx + aa, hh, cz + aa); col.rect([cx - aa, cz - aa, cx + aa, cz + aa], 0.5, hh);
    M.box('palace_wall', cx - aa - 0.05, 0.5, cz - aa - 0.05, cx + aa + 0.05, 1.5, cz + aa + 0.05);
    for (const ty of [2.9]) M.box('timber_red', cx - aa - 0.1, ty, cz - aa - 0.1, cx + aa + 0.1, ty + 0.3, cz + aa + 0.1);
    for (const [, dx, dz] of sides) {
      const f = faceFor(cx, cz, aa, [dx, dz]);
      const Bx = (u0, yy0, n0, u1, yy1, n1, mat) => { const p0 = f.P(u0, n0, yy0), p1 = f.P(u1, n1, yy1); M.box(mat, Math.min(p0[0], p1[0]), Math.min(p0[1], p1[1]), Math.min(p0[2], p1[2]), Math.max(p0[0], p1[0]), Math.max(p0[1], p1[1]), Math.max(p0[2], p1[2])); };
      const uc = dx ? cz : cx, ribs = [-aa + 0.25, 0, aa - 0.25].map((u) => uc + u);
      const seg = (ya, yb) => { for (const u of ribs) Bx(u - 0.17, ya, -0.02, u + 0.17, yb, 0.16, 'timber_red'); };
      seg(1.5, y0b - 0.4); seg(y1b + 0.3, hh - 0.35);
      // plastered panels between the ribs, red-bordered, below and above the bracket zone; the painted frieze under the brackets
      const panel = (u0, u1, ya, yb) => {
        if (yb - ya < 0.8) return;
        Bx(u0, ya, 0, u1, yb, 0.05, 'lime_plaster'); Bx(u0, ya, 0, u1, ya + 0.1, 0.07, 'palace_wall'); Bx(u0, yb - 0.1, 0, u1, yb, 0.07, 'palace_wall');
        Bx(u0, ya, 0, u0 + 0.1, yb, 0.07, 'palace_wall'); Bx(u1 - 0.1, ya, 0, u1, yb, 0.07, 'palace_wall');
      };
      for (let k = 0; k < 2; k++) { const u0 = ribs[k] + 0.3, u1 = ribs[k + 1] - 0.3; panel(u0, u1, 3.4, y0b - 0.7); panel(u0, u1, y1b + 0.5, hh - 0.7); }
      Bx(uc - aa + 0.05, y0b - 0.4, 0, uc + aa - 0.05, y0b, 0.1, 'paint_caihua');
      Bx(uc - aa + 0.05, y0b - 0.4, 0, uc + aa - 0.05, y0b - 0.34, 0.12, 'gilt_bronze');
      if (withDoor && dx === fx && dz === fz) {
        // the false door on the outer face: two red leaves under a timber lintel, rows of gilt studs, a stone threshold
        Bx(uc - 0.9, 0.5, 0, uc + 0.9, 3.0, 0.1, 'lacquer_red'); Bx(uc - 0.02, 0.5, 0, uc + 0.02, 3.0, 0.13, 'lacquer_black');
        Bx(uc - 1.05, 0.5, 0, uc - 0.9, 3.15, 0.14, 'timber_red'); Bx(uc + 0.9, 0.5, 0, uc + 1.05, 3.15, 0.14, 'timber_red'); Bx(uc - 1.1, 3.0, 0, uc + 1.1, 3.25, 0.16, 'timber_red');
        for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) for (const s of [-1, 1]) Bx(uc + s * (0.2 + c * 0.27) - 0.05, 0.8 + r * 0.55, 0, uc + s * (0.2 + c * 0.27) + 0.05, 0.9 + r * 0.55, 0.14, 'gilt_bronze');
      }
    }
    M.box('tile_grey', cx - aa - 0.12, hh - 0.2, cz - aa - 0.12, cx + aa + 0.12, hh, cz + aa + 0.12);                   // a cornice course at the shaft's head
  };
  /** the brackets of a roof round a shaft (cx, cz, aa), base y0, and the roof over them */
  const roofOver = (cx, cz, aa, y0, reach, perFace, eaveY, ov, rise, lift) => {
    for (const [, dx, dz] of sides) {
      const f = faceFor(cx, cz, aa, [dx, dz]), uc = dx ? cz : cx;
      for (const u of perFace) bracketSet(M, f, uc + u, y0, reach);
    }
    hipLite({ c: [cx, cz], A: aa + ov, B: aa + ov, y: eaveY, rise, lift, pow: 1.15, mat: 'tile_grey', soffit: 'timber_red', noChiwei: true, alongZ: false }, ctx);
    wadang(M, cx, cz, aa + ov, aa + ov, eaveY, lift, 0.5, 0.19, 'e');
    for (const sxx of [-1, 1]) for (const szz of [-1, 1]) {                                                                // the upturned hip-ends
      const e = aa + ov, p = [cx + sxx * e, eaveY + lift - 0.05, cz + szz * e];
      M.geo('tile_dark', limb([p[0] - sxx * 0.3, p[1] + 0.05, p[2] - szz * 0.3], [p[0] + sxx * 0.25, p[1] + 0.4, p[2] + szz * 0.25], 0.16, 0.05, 6));
    }
    return eaveY + rise;
  };
  const hs = h * 0.66;
  // the main shaft: the skirt roof halfway up on its brackets
  shaft(x, z, a, h, hs - 1.9, hs - 0.65, true);
  roofOver(x, z, a, hs - 1.5, 1.3, [-1.35, 1.35], hs, 1.7, 1.4, 0.3);
  // the subsidiary tower: one roof, a finial on its apex
  shaft(sub.x, sub.z, sub.a, sub.h + 0.8, sub.h - 1.5, sub.h - 0.1, false);
  const apex = roofOver(sub.x, sub.z, sub.a, sub.h - 0.9, 1.0, [0], sub.h + 0.4, 1.3, 1.3, 0.3);
  M.box('tile_dark', sub.x - 0.22, apex - 0.1, sub.z - 0.22, sub.x + 0.22, apex + 0.8, sub.z + 0.22);
  M.geo('gilt_bronze', lathe([[0.001, apex + 0.8], [0.2, apex + 0.8], [0.12, apex + 1.0], [0.16, apex + 1.2], [0.001, apex + 1.6]], 8, null, sub.x, 0, sub.z));
  // the crowning pavilion: open, posts and architrave, a lattice balustrade, its own bracket cascade under the second roof
  const A = a + 0.2, H = 2.9, y = h, post = (px, pz) => { M.geo('timber_red', lathe([[0.27, 0], [0.25, H]], 8, null, px, y, pz)); M.box('timber_red', px - 0.34, y + H, pz - 0.34, px + 0.34, y + H + 0.26, pz + 0.34); M.geo('gilt_bronze', lathe([[0.26, 0.5], [0.3, 0.53], [0.3, 0.63], [0.26, 0.66]], 8, null, px, y, pz)); };
  for (const px of [-A, 0, A]) for (const pz of [-A, 0, A]) if (px || pz) post(x + px, z + pz);
  M.box('timber_red', x - A - 0.3, y + H - 0.4, z - A - 0.3, x + A + 0.3, y + H, z + A + 0.3);
  M.box('timber', x - A - 0.3, y + H, z - A - 0.3, x + A + 0.3, y + H + 0.28, z + A + 0.3);
  col.rect([x - A, z - A, x + A, z + A], y, y + H);
  M.box('bluestone', x - A - 0.4, y, z - A - 0.4, x + A + 0.4, y + 0.04, z + A + 0.4);
  const q = A - 0.12;
  for (const [p0, p1] of [[[x - q, z - q], [x + q, z - q]], [[x - q, z + q], [x + q, z + q]], [[x - q, z - q], [x - q, z + q]], [[x + q, z - q], [x + q, z + q]]]) balustradeRun(M, p0, p1, y + 0.04, y + 0.04, { step: 2.0, h: 0.95 });
  const y0p = y + H + 0.28;
  for (const [, dx, dz] of sides) {
    const f = faceFor(x, z, A, [dx, dz]), uc = dx ? z : x;
    for (const u of [-A, -A / 2, 0, A / 2, A]) bracketSet(M, f, uc + u, y0p, 1.45);
  }
  const eaveY = y0p + 1.05, rise = 2.3;
  hipLite({ c: [x, z], A: A + 1.7, B: A + 1.7, y: eaveY, rise, lift: 0.4, pow: 1.2, mat: 'tile_grey', soffit: 'timber_red', noChiwei: true, alongZ: false }, ctx);
  wadang(M, x, z, A + 1.7, A + 1.7, eaveY, 0.4, 0.5, 0.19, 'e');
  for (const sxx of [-1, 1]) for (const szz of [-1, 1]) { const e = A + 1.7, p = [x + sxx * e, eaveY + 0.35, z + szz * e]; M.geo('tile_dark', limb([p[0] - sxx * 0.3, p[1] + 0.05, p[2] - szz * 0.3], [p[0] + sxx * 0.3, p[1] + 0.45, p[2] + szz * 0.3], 0.18, 0.05, 6)); }
  const top = eaveY + rise;
  M.box('tile_dark', x - 0.25, top - 0.1, z - 0.25, x + 0.25, top + 0.8, z + 0.25);
  M.flush(bag);
  phoenix(bag, x, top + 0.8, z, fx, fz, 0.85);
  void box;
}
