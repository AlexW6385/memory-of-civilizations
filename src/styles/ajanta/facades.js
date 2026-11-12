// The carved faces of Cave 1 and Cave 19 (docs/settlements/ajanta.md §3, §4, §12), made legible from across the gorge:
// a pale rock-cut frame of pilasters, architrave, a frieze of chaitya-window arches over an ochre ground and a
// dentilled cornice round the painted vihara's porch; round the chaitya hall's great horseshoe window a white surround
// with six niches of seated Buddhas, a row of small arches and a cornice. Coordinates are world; the face is at x = XF
// looking east, pieces stand out of it (+x).
import { box, lathe, clothBox, addCloth } from '../../core/geom.js';
import { XF, FLOOR, C1, C19 } from '../../settlements/ajanta/layout.js';
import { PAL, wall, lotusBand } from './paint.js';

const W = 'sandstone_white', S = 'sandstone_carved', OCH = 'plaster_ochre', RED = 'clay_robe';

/** A horseshoe-arch relief on the plane x = x0 centred at z = zc: centre height yc, inner radius r, band bw, standing t out; legs drop below yc; a dark fill and a white seated figure inside. */
function arch(bag, x0, zc, yc, r, bw, t, drop, fig = true) {
  const R = r + bw, n = 12, dz = (2 * R) / n;
  for (let i = 0; i < n; i++) {
    const z = -R + i * dz, m = Math.abs(z + dz / 2);
    if (m >= R) continue;
    const top = yc + Math.sqrt(R * R - m * m), bot = m < r ? yc + Math.sqrt(r * r - m * m) : yc - drop;
    bag.add(W, box(x0, bot, zc + z, x0 + t, top, zc + z + dz));
    if (m < r) bag.add(RED, box(x0, yc - drop, zc + z, x0 + t * 0.4, bot, zc + z + dz));
  }
  if (fig) {
    const s = r * 0.9;
    bag.add('paint_white', lathe([[0.001, 0], [0.34 * s, 0.02], [0.3 * s, 0.26 * s], [0.15 * s, 0.5 * s], [0.12 * s, 0.62 * s], [0.001, 0.74 * s]], 8, null, x0 + t * 0.5, yc - drop, zc));
  }
}

/** Cave 1: the carved frame of the painted vihara's porch. */
function facade1(ctx) {
  const { bag, col } = ctx, y = FLOOR[1], zc = C1.z, xo = XF + 0.6, xi = XF - 0.5;
  for (const s of [-1, 1]) {
    const z = zc + s * 13.0;
    bag.add(W, box(xi, y, z - 0.55, xo, y + 9.3, z + 0.55));
    bag.add(S, box(xi, y + 8.5, z - 0.8, xo + 0.25, y + 9.3, z + 0.8));
    bag.add(S, box(xi, y, z - 0.75, xo + 0.15, y + 0.6, z + 0.75));
    col.rect([xi, z - 0.8, xo + 0.25, z + 0.8], y, y + 9.3);
  }
  bag.add(W, box(xi, y + 5.6, zc - 13.6, xo, y + 6.5, zc + 13.6));               // architrave
  bag.add(OCH, box(xi, y + 6.5, zc - 13.6, xo, y + 8.7, zc + 13.6));             // the ground of the frieze
  for (let i = 0; i < 11; i++) arch(bag, xo, zc - 11 + i * 2.2, y + 7.6, 0.62, 0.3, 0.22, 0.95);
  for (let i = 0; i <= 11; i++) bag.add(S, box(xo, y + 6.6, zc - 12.1 + i * 2.2 - 0.07, xo + 0.12, y + 8.6, zc - 12.1 + i * 2.2 + 0.07));
  bag.add(W, box(xi, y + 8.7, zc - 14.0, xo + 0.9, y + 9.25, zc + 14.0));         // cornice
  bag.add('tuff_moai', box(xi, y + 8.5, zc - 14.0, xo + 0.7, y + 8.7, zc + 14.0));
  for (let z = zc - 13.6; z < zc + 13.6; z += 0.55) bag.add(S, box(xo, y + 8.3, z, xo + 0.62, y + 8.5, z + 0.26));
  const P = wall(bag, xo, zc + 13.6, [1, 0], y + 5.6, 27.2, 0.04);
  lotusBand(P, 0, 27.2, 0.12, 0.82, 1, 0);
  P.flush();
  // valances of dyed cloth between the six pillars (pillars at zc - 10 + 4i)
  const CL = ['cloth_red', 'cloth_ochre', 'cloth_indigo', 'cloth_ochre', 'cloth_red'];
  for (let i = 0; i < 5; i++) {
    const za = zc - 10 + 4 * i + 0.5, zb = zc - 10 + 4 * (i + 1) - 0.5;
    addCloth(bag, CL[i], clothBox(XF - 0.1, y + 4.0, za, XF - 0.04, y + 4.9, zb), y + 4.9);
  }
}

/** Cave 19: the white surround of the great window, niches of Buddhas, the row of small arches and the cornice. */
function facade19(ctx) {
  const { bag, col } = ctx, y = FLOOR[1], zc = C19.z, xo = XF + 0.35, xi = XF - 0.5, hw = 4.7, SW = 7.5;
  bag.add(W, box(xi, y, zc - SW, xo, y + 10.2, zc - hw)); bag.add(W, box(xi, y, zc + hw, xo, y + 10.2, zc + SW));
  bag.add(W, box(xi, y + 7.9, zc - hw, xo, y + 10.2, zc + hw));
  for (const s of [-1, 1]) { bag.add(S, box(xi, y + 9.6, zc + (s > 0 ? hw : -SW - 0.25), xo + 0.2, y + 10.2, zc + (s > 0 ? SW + 0.25 : -hw))); col.rect([xi, zc + (s > 0 ? hw : -SW), xo, zc + (s > 0 ? SW : -hw)], y, y + 10.2); }
  // six niches with seated Buddhas on the flanks
  for (const s of [-1, 1]) for (let k = 0; k < 3; k++) {
    const z = zc + s * (hw + SW) / 2, y0 = y + 1.2 + k * 2.6;
    bag.add(RED, box(xo, y0, z - 0.95, xo + 0.1, y0 + 1.8, z + 0.95));
    bag.add(S, box(xo, y0 - 0.12, z - 1.1, xo + 0.22, y0, z + 1.1)); bag.add(S, box(xo, y0 + 1.8, z - 1.1, xo + 0.22, y0 + 1.95, z + 1.1));
    for (const q of [-1, 1]) bag.add(S, box(xo, y0, z + q * 1.0 - 0.08, xo + 0.22, y0 + 1.8, z + q * 1.0 + 0.08));
    bag.add('paint_white', lathe([[0.001, 0], [0.55, 0.02], [0.5, 0.45], [0.26, 0.9], [0.2, 1.1], [0.001, 1.3]], 9, null, xo + 0.35, y0 + 0.05, z));
    bag.add(PAL.ochre, lathe([[0.001, 0], [0.18, 0.02], [0.2, 0.18], [0.001, 0.22]], 8, null, xo + 0.34, y0 + 1.1, z));
  }
  // over the arch: an ochre band with seven small chaitya windows, then the cornice
  bag.add(OCH, box(xo, y + 8.0, zc - 5.4, xo + 0.08, y + 9.5, zc + 5.4));
  for (let i = 0; i < 7; i++) arch(bag, xo + 0.08, zc - 4.5 + i * 1.5, y + 8.75, 0.45, 0.2, 0.18, 0.6, false);
  bag.add(W, box(xi, y + 10.2, zc - 8.2, xo + 1.3, y + 10.75, zc + 8.2));
  bag.add('tuff_moai', box(xi, y + 10.0, zc - 8.2, xo + 1.1, y + 10.2, zc + 8.2));
  for (let z = zc - 7.9; z < zc + 7.9; z += 0.55) bag.add(S, box(xo, y + 9.8, z, xo + 1.0, y + 10.0, z + 0.26));
}

export function facades(ctx) { facade1(ctx); facade19(ctx); }
