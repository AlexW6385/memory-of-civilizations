// Timurid architecture of Samarkand (c. 1400–1430; docs/settlements/timurid-samarkand.md §4): buff fired brick
// whose faces are covered in banna'i (glazed bricks laid in geometric and Kufic patterns), haft-rang and mosaic
// tile; the huge pishtaq with its pointed iwan and muqarnas half-dome; ribbed turquoise domes on tall drums;
// tiled minarets; madrasas of two storeys of cells round a court with an iwan on each side and domed halls at
// the corners. The element kit of the Safavid and Mughal styles (read-only) supplies houses, bazaar streets and
// the recessed arches; the rest is built here.

import { Shape, Path, ExtrudeGeometry } from '../../core/three.js';
import { registerStyle, STYLES, orientedBox } from '../../core/build.js';
import { box, lathe, fromTriangles } from '../../core/geom.js';
import { arcadeWall } from '../mughal/index.js';
import '../safavid/index.js';
import { B, LAP, TUR, CRE, WHI, unit, away, solid, wallRun, bannai, ribbedDome, tiledMinaret, deck, bar, boxR } from './kit.js';
import { madrasa } from './madrasa.js';
import { bibiKhanym, gurEAmir, observatory, chorsu, shopRow, domeBlock, nicheWall, khanqah } from './monuments.js';

/**
 * pishtaq: the great portal frame a→b { y, h, facing (a point on the public side), iwan: { w, h, depth, pass, doorH },
 * depth (the mass behind), th, minarets: { h, r } }: the buff face with the pointed iwan in its middle (its half-dome
 * ribbed in lapis over cells of muqarnas), banna'i bands up both sides, over the arch and across the top, banna'i
 * fields in the spandrels and the wings, blind arched niches in two tiers either side, the mass behind it.
 */
function pishtaq(el, { bag, col }) {
  const a = el.a, b = el.b, y = el.y ?? 0, h = el.h, D = el.depth ?? 10, iw = el.iwan, th = el.th ?? 1.2;
  const [ux, uz, L] = unit(a, b), [nx, nz] = away(a, b, el.facing), mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const inside = [mid[0] + nx * 100, mid[1] + nz * 100], out = [-nx, -nz];
  const idepth = iw.depth ?? 6;
  const arches = [{ at: L / 2, w: iw.w, h: iw.h, depth: idepth, alcove: 'rect', pass: !!iw.pass, domeMat: TUR, ribMat: LAP, cellMat: CRE, sideMat: 'tile_cream', backMat: 'tile_lapis' }];
  const holes = [{ at: L / 2, w: iw.w, h: iw.h }];
  const nw = Math.min((L - iw.w) / 2 - 3.2, iw.w * 0.5);
  if (nw > 1.5) for (const s of [-1, 1]) {
    const c = L / 2 + s * (iw.w / 2 + (L - iw.w) / 4);
    for (const [sill, hh] of [[0.9, iw.h * 0.36], [iw.h * 0.52, iw.h * 0.34]]) { arches.push({ at: c, w: nw, h: hh, sill, depth: 0.3, back: 'tile_lapis' }); holes.push({ at: c, w: nw, h: hh, sill }); }
  }
  arcadeWall(bag, col, a, b, y, h, th, B, arches, inside);
  if (iw.pass) {
    // the iwan's back wall with the door one walks through, and a low ceiling over the passage behind it
    const off = th / 2 + idepth + 0.2, c0 = [mid[0] + nx * off, mid[1] + nz * off], dw = Math.min(4.6, iw.w * 0.45), dh = iw.doorH ?? Math.min(iw.h * 0.4, 6);
    arcadeWall(bag, col, [c0[0] - ux * iw.w / 2, c0[1] - uz * iw.w / 2], [c0[0] + ux * iw.w / 2, c0[1] + uz * iw.w / 2], y, iw.h, 0.4, 'tile_cream', [{ at: iw.w / 2, w: dw, h: dh, pass: true }]);
    const p0 = [c0[0] + nx * 0.2, c0[1] + nz * 0.2], p1 = [mid[0] + nx * (th / 2 + D), mid[1] + nz * (th / 2 + D)];
    if (D > idepth + 1) bag.add('ceiling_painted', orientedBox(p0, p1, iw.w, y + dh + 1.6, y + dh + 1.7));
  }
  // banna'i, from the ground up
  const d = th / 2, N = out, sL = L / 2 - iw.w / 2, sR = L / 2 + iw.w / 2, gap = 0.3, bw = Math.min(1.6, iw.w * 0.11), vTop = iw.h + 0.6;
  const base = { a, b, n: N, d, y };
  const e0 = Math.max(0.6, sL - gap - bw), e1 = Math.min(L - 0.6, sR + gap + bw);
  bag.add('marble', orientedBox([a[0] + out[0] * (d + 0.05), a[1] + out[1] * (d + 0.05)], [b[0] + out[0] * (d + 0.05), b[1] + out[1] * (d + 0.05)], 0.12, y, y + 1.0));
  bannai(bag, { ...base, s0: sL - gap - bw, s1: sL - gap, v0: 1.05, v1: vTop, kind: 'kufic', base: LAP, ink: CRE, alt: WHI, ink2: TUR, cell: bw * 0.62, seed: 5 });
  bannai(bag, { ...base, s0: sR + gap, s1: sR + gap + bw, v0: 1.05, v1: vTop, kind: 'kufic', base: LAP, ink: CRE, alt: WHI, ink2: TUR, cell: bw * 0.62, seed: 9 });
  if (h > vTop + bw + 1.5) {
    bannai(bag, { ...base, s0: e0, s1: e1, v0: vTop, v1: vTop + bw, kind: 'kufic', base: LAP, ink: WHI, alt: CRE, ink2: TUR, cell: bw * 0.62, seed: 2 });
    // the spandrels beside the arch, the field over it up to the cornice
    bannai(bag, { ...base, s0: sL - gap, s1: sR + gap, v0: 1.05, v1: vTop, kind: 'diamond', base: TUR, ink: LAP, alt: WHI, ink2: CRE, cell: 0.7, holes: [holes[0]] });
    bannai(bag, { ...base, s0: e0, s1: e1, v0: vTop + bw + 0.05, v1: h - 1.5, kind: 'diamond', base: TUR, ink: LAP, alt: WHI, ink2: CRE, cell: Math.max(0.7, (e1 - e0) / 22), holes: [] });
  }
  // the wings: a diamond field between the niches, a chequer cornice along the top
  const wL = [0.5, e0 - 0.3], wR = [e1 + 0.3, L - 0.5];
  for (const [s0, s1] of [wL, wR]) if (s1 - s0 > 2.5) bannai(bag, { ...base, s0, s1, v0: 1.05, v1: h - 1.5, kind: 'diamond', base: B, ink: TUR, alt: CRE, ink2: LAP, cell: 0.8, holes: holes.slice(1).map((q) => ({ ...q })), seed: 4 });
  bannai(bag, { ...base, s0: 0.3, s1: L - 0.3, v0: h - 1.3, v1: h - 0.35, kind: 'checker', base: LAP, ink: TUR, alt: WHI, cell: 0.65 });
  bag.add('marble', orientedBox([a[0] + out[0] * (d + 0.06), a[1] + out[1] * (d + 0.06)], [b[0] + out[0] * (d + 0.06), b[1] + out[1] * (d + 0.06)], 0.2, y + h - 0.3, y + h));
  // the mass behind: the two sides, and the block over the iwan
  for (const [s0, s1] of [[0, L / 2 - iw.w / 2 - 0.2], [L / 2 + iw.w / 2 + 0.2, L]]) {
    const p = [a[0] + ux * (s0 + s1) / 2 + nx * (th / 2 + D / 2), a[1] + uz * (s0 + s1) / 2 + nz * (th / 2 + D / 2)], hl = (s1 - s0) / 2;
    bar(bag, col, el.massMat ?? B, [p[0] - ux * hl, p[1] - uz * hl], [p[0] + ux * hl, p[1] + uz * hl], D, y, y + h);
  }
  const top = y + (iw.sill ?? 0) + iw.h, c = [mid[0] + nx * (th / 2 + D / 2), mid[1] + nz * (th / 2 + D / 2)];
  bar(bag, col, el.massMat ?? B, [c[0] - ux * iw.w / 2, c[1] - uz * iw.w / 2], [c[0] + ux * iw.w / 2, c[1] + uz * iw.w / 2], D, top, y + h);
  if (el.minarets) for (const s of el.minarets.at ?? [0.03, 0.97]) tiledMinaret(bag, col, { c: [a[0] + ux * L * s + nx * 1.6, a[1] + uz * L * s + nz * 1.6], y: el.minarets.y ?? y, h: el.minarets.h, r: el.minarets.r });
  void ux; void Shape; void Path; void ExtrudeGeometry; void box; void lathe; void fromTriangles; void boxR; void deck; void solid; void wallRun;
}

registerStyle('timurid', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: {
    ...STYLES.safavid.elements,
    tim_pishtaq: pishtaq, tim_minaret: (el, { bag, col }) => tiledMinaret(bag, col, el),
    tim_dome: (el, { bag, col }) => ribbedDome(bag, col, el), tim_dome_block: domeBlock, niche_wall: nicheWall,
    tim_madrasa: madrasa, bibi_khanym: bibiKhanym, gur_e_amir: gurEAmir, observatory, chorsu, shop_row: shopRow, khanqah,
  },
  objects: {},
});
