// Mexica architecture of Tenochtitlan (1487–1519; docs/settlements/tenochtitlan.md §4): the Templo
// Mayor — four sloping terraces stuccoed white, two stairways side by side on the west between
// balustrades that steepen near the top and end in serpent heads, the twin shrines (Tlaloc's
// painted blue and white, Huitzilopochtli's red and white) with their tall roofs; the round
// temple of Ehecatl; the ballcourt; the serpent wall; palaces and houses of plastered adobe round
// patios; the canals, their walls and canoes (from the ming style).

import { registerStyle, STYLES } from '../../core/build.js';
import { box, frustum, lathe, fromTriangles } from '../../core/geom.js';
import { beamTris } from '../ming/index.js';
import '../maya/index.js';
import '../../objects/index.js';
import { Kit, carved, serpentHeadKit, chacmoolKit } from '../maya/meso.js';
import { calli, tecpan, tzompantli, chinampaHouse, mesoPlants } from './houses.js';
import { shrineInterior, huehuetl } from './shrines.js';
import { mxPeople } from './life.js';
import { calliFront, huerto } from './street.js';
import { tianguis } from './market.js';
import { eagleHouse, calmecac, coatepantli, enclosure, ehecatl, mxTemple, causewayStakes } from './precinct.js';

const W = 'plaster_white', R = 'stucco_red', B = 'maya_blue';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const stairs = (el, ctx) => STYLES.qing.elements.stairs(el, ctx);
/** A serpent's head in plaster at (x, y, z), jaws toward (dx, dz) (meso.js); `kind`: 'tlaloc' (goggled) or 'feathered'. */
export function serpentHead(bag, x, y, z, dx, dz, s = 1, kind = 'feathered') {
  serpentHeadKit({ stone: W, goggles: kind === 'tlaloc', plumes: kind !== 'tlaloc' }).emit(bag, x - dx * 0.3 * s, y, z - dz * 0.3 * s, dx, dz, s);
}

/**
 * Treads up a stair { rect, y0, y1, dir (the way up) }: each a block a little deeper than its riser,
 * in `mat`, with a band of `riser` paint on its face where given (Tlaloc's stair blue and white).
 */
export function treads(bag, col, [x0, z0, x1, z1], y0, y1, dir, mat, riser = null) {
  const alongZ = dir === 'n' || dir === 's', len = alongZ ? z1 - z0 : x1 - x0, n = Math.max(1, Math.round((y1 - y0) / 0.22)), rs = (y1 - y0) / n;
  for (let k = 0; k < n; k++) {
    const f0 = k / n, f1 = (k + 1) / n, yy = y0 + rs * (k + 1), yl = Math.max(y0 - 0.1, yy - rs - 0.3);
    const r = dir === 'n' ? [x0, z1 - len * f1, x1, z1 - len * f0] : dir === 's' ? [x0, z0 + len * f0, x1, z0 + len * f1] : dir === 'e' ? [x0 + len * f0, z0, x0 + len * f1, z1] : [x1 - len * f1, z0, x1 - len * f0, z1];
    bag.add(mat, frustum(r, yl, yy, 0, 0, 0, 0, { noBottom: k > 0 }));
    if (riser) {
      const e = 0.02, b0 = yy - rs * 0.8, b1 = yy - rs * 0.25;
      bag.add(riser, dir === 'e' ? box(r[0] - e, b0, r[1], r[0] + 0.02, b1, r[3]) : dir === 'w' ? box(r[2] - 0.02, b0, r[1], r[2] + e, b1, r[3]) : dir === 'n' ? box(r[0], b0, r[3] - 0.02, r[2], b1, r[3] + e) : box(r[0], b0, r[1] - e, r[2], b1, r[1] + 0.02));
    }
  }
  col.ramp([x0, z0, x1, z1], y0, y1, dir);
}

/**
 * A shrine on the Templo Mayor { rect, y, h, roofH, god }, its door to the west: plastered walls, the
 * doorway framed, the tall roof stage and its crest. Tlaloc's painted with blue stripes, his roof blue
 * with rows of white rings (chalchihuitl, precious water); Huitzilopochtli's painted red, his roof
 * white carved with rows of skulls; both crested with merlons.
 */
function shrine(bag, col, [x0, z0, x1, z1], y, h, roofH, god) {
  const tl = god === 'tlaloc', wall = tl ? W : R, zc = (z0 + z1) / 2, dw = 1.3, dh = h * 0.72;
  // the thick walls of rubble round the god's chamber, the door a deep passage through the west one (shrines.js)
  const I = [x0 + 3, zc - 4.2, x1 - 3, zc + 4.2];
  for (const r of [[x0, z0, x1, I[1]], [x0, I[3], x1, z1], [I[2], I[1], x1, I[3]], [x0, I[1], I[0], zc - dw], [x0, zc + dw, I[0], I[3]]]) { bag.add(wall, box(r[0], y, r[1], r[2], y + h, r[3])); col.rect(r, y, y + h); }
  bag.add(wall, box(x0, y + dh, zc - dw, I[0], y + h, zc + dw));
  shrineInterior(bag, col, I, y, h, god);
  if (tl) {
    // the blue stripes, upright, round all four walls
    for (let x = x0 + 0.5; x < x1 - 0.3; x += 0.9) for (const z of [z0, z1]) bag.add(B, box(x, y + 0.3, z - 0.03, x + 0.4, y + h - 0.2, z + 0.03));
    for (let z = z0 + 0.5; z < z1 - 0.3; z += 0.9) { if (Math.abs(z + 0.2 - zc) < dw + 0.4) continue; bag.add(B, box(x0 - 0.03, y + 0.3, z, x0 + 0.03, y + h - 0.2, z + 0.4)); bag.add(B, box(x1 - 0.03, y + 0.3, z, x1 + 0.03, y + h - 0.2, z + 0.4)); }
  }
  // the doorway: its dark opening, the jambs and the lintel standing out
  for (const s of [-1, 1]) bag.add(tl ? W : 'plaster_white', box(x0 - 0.18, y, zc + s * dw - (s > 0 ? 0 : 0.35), x0 + 0.02, y + dh, zc + s * dw + (s > 0 ? 0.35 : 0)));
  bag.add(tl ? W : 'plaster_white', box(x0 - 0.2, y + dh, zc - dw - 0.35, x0 + 0.02, y + dh + 0.45, zc + dw + 0.35));
  // the roof stage: a cornice, the tall upper walls, the crest
  const ry = y + h, rt = ry + roofH, roof = tl ? B : W;
  bag.add(tl ? W : 'plaster_white', box(x0 - 0.35, ry, z0 - 0.35, x1 + 0.35, ry + 0.35, z1 + 0.35));
  bag.add(roof, box(x0 - 0.15, ry + 0.35, z0 - 0.15, x1 + 0.15, rt, z1 + 0.15));
  const motif = tl
    ? carved('tm-ring', (k) => k.disc(W, 0, 0, 0, 0.26, 0.06, 12, 0.13))
    : carved('tm-skull', (k) => { k.fz('plaster_white', [-0.2, 0.2, -0.22, 0.2], [-0.16, 0.16, -0.18, 0.17], 0, 0.14); for (const sx of [-1, 1]) k.bx('paint_minoan_black', sx * 0.08 - 0.05, sx * 0.08 + 0.05, -0.02, 0.07, 0.13, 0.16); k.bx('paint_minoan_black', -0.025, 0.025, -0.12, -0.06, 0.13, 0.16); });
  for (const [ry0, row] of [[ry + 0.35 + (roofH - 0.35) * 0.3, 0], [ry + 0.35 + (roofH - 0.35) * 0.7, 1]]) {
    for (let x = x0 + 0.5 + row * 0.4; x < x1 - 0.4; x += 0.8) { motif.emit(bag, x, ry0, z0 - 0.15, 0, -1); motif.emit(bag, x, ry0, z1 + 0.15, 0, 1); }
    for (let z = z0 + 0.5 + row * 0.4; z < z1 - 0.4; z += 0.8) { motif.emit(bag, x0 - 0.15, ry0, z, -1, 0); motif.emit(bag, x1 + 0.15, ry0, z, 1, 0); }
  }
  bag.add(tl ? W : 'plaster_white', box(x0 - 0.3, rt, z0 - 0.3, x1 + 0.3, rt + 0.3, z1 + 0.3));
  const n = Math.max(3, Math.round((z1 - z0) / 1.3));
  for (let i = 0; i < n; i++) for (const xx of [x0 + 0.2, x1 - 0.2]) { const z = z0 + (z1 - z0) * (i + 0.5) / n; bag.add(W, box(xx - 0.2, rt + 0.3, z - 0.28, xx + 0.2, rt + 1.2, z + 0.28)); bag.add(tl ? B : R, box(xx - 0.22, rt + 0.6, z - 0.1, xx + 0.22, rt + 0.9, z + 0.1)); }
  for (let x = x0 + 0.9; x < x1 - 0.6; x += 1.3) for (const zz of [z0 + 0.2, z1 - 0.2]) { bag.add(W, box(x - 0.28, rt + 0.3, zz - 0.2, x + 0.28, rt + 1.2, zz + 0.2)); bag.add(tl ? B : R, box(x - 0.1, rt + 0.6, zz - 0.22, x + 0.1, rt + 0.9, zz + 0.22)); }
  col.floor([x0, z0, x1, z1], rt + 0.3);
}

/** The Coyolxauhqui stone (3.5 m across), flat at the foot of Huitzilopochtli's stair: the goddess dismembered, in low relief. */
const coyolxauhqui = () => carved('coyolxauhqui', (k) => {
  k.geo('andesite', lathe([[0.001, 0], [1.75, 0], [1.75, 0.3], [0.001, 0.3]], 32));
  const r = 'stucco_pale', y = 0.3, t = 0.07;
  k.seg(r, [-0.15, y, -0.1], [0.3, y, 0.25], 0.32, t);                        // the torso
  k.seg(r, [0.35, y, 0.35], [0.95, y, 0.5], 0.17, t);                         // the limbs, cut apart, scattered round
  k.seg(r, [-0.55, y, 0.55], [-1.1, y, 0.75], 0.16, t);
  k.seg(r, [0.75, y, -0.45], [1.2, y, -0.1], 0.16, t);
  k.seg(r, [-0.7, y, -0.55], [-1.2, y, -0.2], 0.15, t);
  k.seg(r, [-0.45, y, -0.55], [-0.05, y, -0.95], 0.26, t);                   // the head with its headdress
  for (let i = 0; i < 5; i++) { const a = -2.4 + i * 0.25; k.seg(r, [-0.25 + Math.cos(a) * 0.3, y, -0.75 + Math.sin(a) * 0.3], [-0.25 + Math.cos(a) * 0.62, y, -0.75 + Math.sin(a) * 0.62], 0.05, t); }
  for (let i = 0; i < 6; i++) { const a = i * 1.05 + 0.3; k.seg(r, [Math.cos(a) * 1.25, y, Math.sin(a) * 1.25], [Math.cos(a) * 1.45, y, Math.sin(a) * 1.45], 0.1, t); }   // the bells and knots at the rim
});

/** The sacrificial stone (techcatl): a low block with a rounded, ridged top. */
const techcatl = () => carved('techcatl', (k) => {
  k.bx('basalt', -0.3, 0.3, 0, 0.55, -0.22, 0.22);
  k.fy('basalt', [-0.3, 0.3, -0.22, 0.22], [-0.3, 0.3, -0.05, 0.05], 0.55, 0.85);
});

/**
 * templo_mayor: { c, w (east–west), d (north–south), h, terraces, top: { w, d } }: the terraces, the
 * two stairways on the west, the balustrades and serpent heads, the two shrines and their braziers.
 */
function temploMayor(el, { bag, col }) {
  const [cx, cz] = el.c, n = el.terraces ?? 4, H = el.h, [w0, d0] = [el.w / 2, el.d / 2], [w1, d1] = [el.top.w / 2, el.top.d / 2];
  for (let k = 0; k < n; k++) {
    const t0 = k / n, t1 = (k + 1) / n, y0 = H * t0, y1 = H * t1;
    const a = [w0 - (w0 - w1) * t0, d0 - (d0 - d1) * t0], b = [w0 - (w0 - w1) * t1, d0 - (d0 - d1) * t1];
    const ledge = 1.6, ix = a[0] - b[0] - ledge, iz = a[1] - b[1] - ledge;
    bag.add(W, frustum([cx - a[0], cz - a[1], cx + a[0], cz + a[1]], y0, y1, ix, ix, iz, iz));
    col.rect([cx - a[0] + ix * 0.5, cz - a[1] + iz * 0.5, cx + a[0] - ix * 0.5, cz + a[1] - iz * 0.5], y0, y1);
    col.floor([cx - a[0] + ix, cz - a[1] + iz, cx + a[0] - ix, cz + a[1] - iz], y1);
    bag.add(R, box(cx - a[0] + ix - 0.05, y1 - 0.6, cz - a[1] + iz - 0.05, cx + a[0] - ix + 0.05, y1 - 0.2, cz + a[1] - iz + 0.05));
  }
  // the stairways on the west face, side by side: Tlaloc's (north) blue and white, Huitzilopochtli's
  // (south) red; their balustrades steepen into a dado near the top and end at the foot in serpent
  // heads — Tlaloc's goggled, Huitzilopochtli's feathered
  const run = H * 0.9, sx1 = cx - w1, sx0 = sx1 - run;
  for (const s of [-1, 1]) {
    const tl = s < 0, zc = cz + s * d1 * 0.45, sw = d1 * 0.32;
    treads(bag, col, [sx0, zc - sw, sx1 + 0.5, zc + sw], 0, H, 'e', tl ? W : R, tl ? B : null);
    for (const e of [-1, 1]) {
      const z = zc + e * (sw + 0.9), t = [];
      t.push(sx0, 0, z - 0.9, sx0, 0, z + 0.9, sx1, H + 1, z + 0.9, sx0, 0, z - 0.9, sx1, H + 1, z + 0.9, sx1, H + 1, z - 0.9);
      t.push(sx0, 0, z - 0.9, sx1, H + 1, z - 0.9, sx1, 0, z - 0.9, sx0, 0, z + 0.9, sx1, 0, z + 0.9, sx1, H + 1, z + 0.9);
      bag.add(W, fromTriangles(t.concat(t.slice().reverse())));
      bag.add(tl ? B : R, box(sx1 - 3, H - 2, z - 1, sx1, H + 1.6, z + 1));
      serpentHead(bag, sx0 - 0.4, 0, z, -1, 0, 1.1, tl ? 'tlaloc' : 'feathered');
      col.segment([sx0, z], [sx1, z], 1.8, 0, H + 1);
    }
  }
  // the shrines: Tlaloc to the north (left, facing the temple), Huitzilopochtli to the south; before
  // Tlaloc's door the chacmool, before Huitzilopochtli's the sacrificial stone; braziers at the stairheads
  const sy = H, sd = d1 * 0.38, sxw = cx - w1 * 0.55;
  shrine(bag, col, [sxw, cz - d1 * 0.85, cx + w1 * 0.55, cz - d1 * 0.85 + 2 * sd], sy, 6, 4.5, 'tlaloc');
  shrine(bag, col, [sxw, cz + d1 * 0.85 - 2 * sd, cx + w1 * 0.55, cz + d1 * 0.85], sy, 6, 4.5, 'huitzilopochtli');
  chacmoolKit('andesite').emit(bag, sxw - 2.2, sy, cz - d1 * 0.85 + sd, -1, 0, 1.05);
  techcatl().emit(bag, sxw - 2.2, sy, cz + d1 * 0.85 - sd, 0, 1);
  col.rect([sxw - 2.7, cz - d1 * 0.85 + sd - 0.9, sxw - 1.7, cz - d1 * 0.85 + sd + 0.9], sy, sy + 1);
  for (const s of [-1, 1]) bag.add('basalt', lathe([[0.9, 0], [1.2, 0.9], [0.8, 1.1], [0.001, 1.1]], 12, null, cx - w1 + 2, sy, cz + s * d1 * 0.45 + s * (d1 * 0.32 + 2.6)));
  // the huehuetl beside Huitzilopochtli's door, beaten from the summit
  huehuetl(bag, sxw - 1.2, sy, cz + d1 * 0.85 - 2 * sd + 1.0); col.circle(sxw - 1.2, cz + d1 * 0.85 - 2 * sd + 1.0, 0.4, sy, sy + 1.2);
  // the Coyolxauhqui stone at the foot of Huitzilopochtli's stair
  coyolxauhqui().emit(bag, sx0 - 4.5, 0, cz + d1 * 0.45, 0, 1);
  col.circle(sx0 - 4.5, cz + d1 * 0.45, 1.75, 0, 0.37);
}

/** round_temple: Ehecatl's temple { c, r, h, front ('w') }: a round platform with a stair, the round shrine with a conical thatched roof. */
function roundTemple(el, { bag, col }) {
  const [cx, cz] = el.c, r = el.r, h = el.h;
  bag.add(W, lathe([[r + 2, 0], [r, h], [0.001, h]], 32, null, cx, 0, cz)); col.circle(cx, cz, r + 1, 0, h); col.floor([cx - r * 0.7, cz - r * 0.7, cx + r * 0.7, cz + r * 0.7], h);
  stairs({ rect: [cx - r - 2 - h * 1.2, cz - 2.5, cx - r + 0.6, cz + 2.5], y0: 0, y1: h, dir: 'e', mat: W }, { bag, col });
  bag.add(R, lathe([[r * 0.55, 0], [r * 0.55, 4], [0.001, 4]], 24, null, cx, h, cz)); col.circle(cx, cz, r * 0.55, h, h + 4);
  bag.add('thatch', lathe([[r * 0.7, 0], [0.001, r * 1.2]], 24, null, cx, h + 4, cz));
}

/** serpent_wall: the coatepantli a→b { h }: a plastered wall with serpent heads along its outer face. */
function serpentWall(el, { bag, col }) {
  const a = el.a, b = el.b, h = el.h ?? 3, t = [];
  beamTris(t, [a[0], 0, a[1]], [b[0], 0, b[1]], 0.8, h); bag.add(W, fromTriangles(t)); col.segment(a, b, 1.6, 0, h);
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, n = Math.floor(L / 3);
  const o = el.out ?? 1;
  for (let i = 1; i < n; i++) serpentHead(bag, a[0] + ux * i * L / n - uz * o * 1.2, 0, a[1] + uz * i * L / n + ux * o * 1.2, -uz * o, ux * o, 0.6);
}

/** court_house: a palace or house round a patio { rect, h, ring, seed }: plastered adobe, flat roofs, a doorway, sometimes a red band. */
function courtHouse(el, { bag, col }) {
  const rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, d = el.ring ?? Math.min(3.6, Math.min(x1 - x0, z1 - z0) * 0.3), h = el.h ?? 3.2;
  for (const r of [[x0, z0, x1, z0 + d], [x0, z1 - d, x1, z1], [x0, z0 + d, x0 + d, z1 - d], [x1 - d, z0 + d, x1, z1 - d]]) { bag.add(W, box(r[0], 0, r[1], r[2], h, r[3])); col.rect(r, 0, h); col.floor(r, h); }
  if (el.band || rand() < 0.25) for (const [a, b] of [[[x0, z0], [x1, z0]], [[x0, z1], [x1, z1]], [[x0, z0], [x0, z1]], [[x1, z0], [x1, z1]]]) { const t = []; beamTris(t, [a[0], h - 0.5, a[1]], [b[0], h - 0.5, b[1]], 0.06, 0.35); bag.add(R, fromTriangles(t)); }
  bag.add('stucco', box(x0 + d, 0, z0 + d, x1 - d, 0.06, z1 - d));
  const t = [], side = Math.floor(rand() * 4), xc = (x0 + x1) / 2, zc = (z0 + z1) / 2, dw = el.ring ? 2 : 0.6;
  if (side === 0) beamTris(t, [xc - dw, 0, z0 - 0.04], [xc + dw, 0, z0 - 0.04], 0.03, 2.1);
  else if (side === 1) beamTris(t, [xc - dw, 0, z1 + 0.04], [xc + dw, 0, z1 + 0.04], 0.03, 2.1);
  else if (side === 2) beamTris(t, [x0 - 0.04, 0, zc - dw], [x0 - 0.04, 0, zc + dw], 0.03, 2.1);
  else beamTris(t, [x1 + 0.04, 0, zc - dw], [x1 + 0.04, 0, zc + dw], 0.03, 2.1);
  bag.add('lacquer_black', fromTriangles(t));
}

/**
 * ballcourt: the tlachtli { c, len, w, h } along x — an I-shaped court: the long alley between two
 * structures with vertical inner faces (their outer sides sloping), the wider end zones closed by
 * walls, the plaster floor with its line across the middle, and the two stone rings set upright in
 * the middle of the side walls, the ball passing through them across the court.
 */
function ballcourt(el, { bag, col }) {
  const [cx, cz] = el.c, L = el.len / 2, w = el.w / 2, h = el.h ?? 4, sw = 6, ez = 8, ew = w + sw + 3, t = 1.4;
  for (const s of [-1, 1]) { const r = [cx - L, cz + s * w + (s > 0 ? 0 : -sw), cx + L, cz + s * w + (s > 0 ? sw : 0)]; bag.add(W, frustum(r, 0, h, 0, 0, s > 0 ? 0 : 2.5, s > 0 ? 2.5 : 0)); col.rect(r, 0, h); col.floor([r[0], s > 0 ? r[1] : r[1] + 2.5, r[2], s > 0 ? r[3] - 2.5 : r[3]], h); bag.add(R, box(r[0], h - 0.45, s > 0 ? r[1] - 0.03 : r[3] - 0.02, r[2], h - 0.15, s > 0 ? r[1] + 0.02 : r[3] + 0.03)); }
  for (const s of [-1, 1]) {
    const xa = cx + s * L, xb = cx + s * (L + ez), xo = cx + s * (L + ez + t);
    const end = [Math.min(xb, xo), cz - ew - t, Math.max(xb, xo), cz + ew + t];
    bag.add(W, box(end[0], 0, end[1], end[2], h, end[3])); col.rect(end, 0, h); col.floor(end, h);
    for (const q of [-1, 1]) { const r = [Math.min(xa, xb), q < 0 ? cz - ew - t : cz + ew, Math.max(xa, xb), q < 0 ? cz - ew : cz + ew + t]; bag.add(W, box(r[0], 0, r[1], r[2], h, r[3])); col.rect(r, 0, h); col.floor(r, h); }
    // the stretch of wall closing each end zone back to the alley's structures
    for (const q of [-1, 1]) { const r = [Math.min(xa, xa + s * t), q < 0 ? cz - ew : cz + w + sw, Math.max(xa, xa + s * t), q < 0 ? cz - w - sw : cz + ew]; bag.add(W, box(r[0], 0, r[1], r[2], h, r[3])); col.rect(r, 0, h); }
    bag.add('stucco', box(Math.min(xa, xb), 0, cz - ew, Math.max(xa, xb), 0.05, cz + ew));
  }
  bag.add('stucco', box(cx - L, 0, cz - w, cx + L, 0.05, cz + w));
  bag.add(R, box(cx - 0.12, 0.05, cz - w, cx + 0.12, 0.065, cz + w));
  // the rings, set upright out of the middle of the side walls, their holes along the court
  const ring = carved('mx-tlachtli-ring', (k) => {
    k.bx('basalt', -0.5, 0.16, -0.13, 0.13, -0.11, 0.11);                        // the tenon into the wall
    k.disc('basalt', 0.7, 0, -0.15, 0.6, 0.3, 24, 0.21);
    for (const z0 of [-0.18, 0.15]) for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; k.disc('basalt', 0.7 + Math.cos(a) * 0.41, Math.sin(a) * 0.41, z0, 0.065, 0.03, 8); }
  });
  for (const s of [-1, 1]) ring.emit(bag, cx, h * 0.72, cz + s * w, s, 0);
}

/**
 * acalli: a dugout canoe { at, dir ([dx, dz]), len, y (water), seed, cargo }: hollowed from one trunk,
 * flat-bottomed and square-ended, the ends a little raised; a paddle across it, and cargo —
 * maize, chiles, pots, bundles of cloth or reeds — for the market (Cortés: streets "navigated by canoes").
 */
function acalli(el, { bag }) {
  const L = el.len ?? 6, B = Math.min(1.1, 0.55 + L * 0.06), D = 0.5, th = 0.07, rand = rng(el.seed || 7), k = new Kit(), wd = 'timber';
  const hl = L / 2, hb = B / 2, y0 = -0.32;                       // the hull from y0 (under water) to y0 + D
  k.bx(wd, -hb, hb, y0, y0 + th, -hl + 0.3, hl - 0.3);                                  // the bottom
  for (const sx of [-1, 1]) {                                                             // the sides
    k.bx(wd, sx > 0 ? hb - th : -hb, sx > 0 ? hb : -hb + th, y0, y0 + D, -hl + 0.3, hl - 0.3);
  }
  for (const sz of [-1, 1]) {                                                             // the square ends, rising a little and raked
    const zi = sz * (hl - 0.3), zo = sz * hl;
    const inn = [-hb, hb, y0 + 0.08, y0 + D + 0.06], out = [-hb * 0.82, hb * 0.82, y0 + 0.2, y0 + D + 0.12];
    if (sz > 0) k.fz(wd, inn, out, zi, zo); else k.fz(wd, out, inn, zo, zi);
  }
  k.seg('timber', [-0.15, y0 + D + 0.02, -hl * 0.4], [0.2, y0 + D + 0.02, hl * 0.25], 0.04, 0.02);   // the paddle, across
  k.bx('timber', 0.15, 0.3, y0 + D - 0.02, y0 + D + 0.04, hl * 0.25, hl * 0.25 + 0.4);
  // the cargo, laid along the hold
  const cargo = el.cargo ?? ['maize', 'chile', 'pots', 'cloth', 'reeds'][Math.floor(rand() * 5)];
  for (let i = 0; i < (cargo === 'none' ? 0 : Math.floor(L / 1.6)); i++) {
    const z = -hl + 1.0 + i * 1.5 + rand() * 0.2, yb = y0 + th;
    if (cargo === 'maize' || cargo === 'chile') k.fy(cargo === 'maize' ? 'paint_ochre' : 'stucco_red', [-hb + 0.1, hb - 0.1, z - 0.45, z + 0.45], [-0.08, 0.08, z - 0.1, z + 0.1], yb, yb + 0.55);
    else if (cargo === 'pots') k.geo('terracotta', lathe([[0.1, 0], [0.24, 0.12], [0.26, 0.3], [0.14, 0.44], [0.16, 0.5], [0.001, 0.5]], 10).translate(0, yb, z));
    else if (cargo === 'cloth') k.bx(rand() < 0.5 ? 'cloth_white' : 'cloth_ochre', -hb + 0.12, hb - 0.12, yb, yb + 0.35, z - 0.4, z + 0.35);
    else k.seg('reed_mat', [-0.25, yb + 0.18, z - 0.6], [-0.25 + rand() * 0.5, yb + 0.18, z + 0.6], 0.22, 0.17);
  }
  const [dx, dz] = el.dir ?? [1, 0];
  k.emit(bag, el.at[0], el.y ?? 0, el.at[1], dx, dz);
}

/**
 * beam_bridge: a bridge of timbers over a canal { at, across ('x' | 'z': the way the canal is crossed),
 * span, width, y (the street) }: great beams laid from bank to bank, a deck of split planks across
 * them, kerb timbers at the edges (Cortés: bridges "composed of large pieces of timber"; they could be lifted).
 */
function beamBridge(el, { bag, col }) {
  const [x, z] = el.at, S = el.span / 2 + 1.0, Wd = el.width / 2, y = el.y ?? 0, k = new Kit();
  // in its own frame: z across the canal, x along the bank
  for (let i = 0; i < 5; i++) { const u = -Wd + 0.25 + i * (2 * Wd - 0.5) / 4; k.bx('timber', u - 0.18, u + 0.18, y - 0.38, y - 0.04, -S, S); }
  for (let j = 0; j < Math.round(2 * S / 0.32); j++) { const v = -S + j * 0.32; k.bx(j % 3 ? 'wood_dark' : 'timber', -Wd, Wd, y - 0.04, y + 0.06, v + 0.01, v + 0.3); }
  for (const sx of [-1, 1]) k.bx('timber', sx * Wd - (sx > 0 ? 0.22 : 0), sx * Wd + (sx > 0 ? 0 : 0.22), y + 0.06, y + 0.26, -S, S);
  const along = el.across === 'z';
  k.emit(bag, x, 0, z, along ? 0 : 1, along ? 1 : 0);
  col.floor(along ? [x - Wd, z - S, x + Wd, z + S] : [x - S, z - Wd, x + S, z + Wd], y + 0.06);
}

/** mx_canal_wall: a canal's retaining wall a→b { y (top), bed, th } of squared stone, a coping along its top. */
function canalWallMx(el, { bag }) {
  const t = [], c = [], th = el.th ?? 0.7, bed = el.bed ?? -2.4, top = el.y ?? 0.05;
  beamTris(t, [el.a[0], bed, el.a[1]], [el.b[0], bed, el.b[1]], th / 2, top - 0.12 - bed);
  bag.add('andesite', fromTriangles(t));
  beamTris(c, [el.a[0], top - 0.12, el.a[1]], [el.b[0], top - 0.12, el.b[1]], th / 2 + 0.06, 0.12);
  bag.add('basalt', fromTriangles(c));
}

registerStyle('aztec', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.maya.elements, templo_mayor: temploMayor, round_temple: roundTemple, serpent_wall: serpentWall, court_house: courtHouse, ballcourt, acalli, beam_bridge: beamBridge, mx_canal_wall: canalWallMx, tianguis, calli, tecpan, tzompantli, eagle_house: eagleHouse, calmecac, coatepantli, mx_enclosure: enclosure, ehecatl_temple: ehecatl, mx_temple: mxTemple, causeway_stakes: causewayStakes, mx_people: mxPeople, calli_front: calliFront, huerto, chinampa_house: chinampaHouse, meso_plants: mesoPlants },
  objects: {},
});
