// Angkor — the far copies of the village's houses and sugar palms (DESIGN §3.3, §8). The village is cut into 100 m tiles, each
// built twice (town.js): in full (the khmer style's stilt_house with its interiors, goods, door leaf, shutters; the sugar_palm
// with its thirty fans) when the visitor is near, and in these simple solid forms beyond: the same footprint, floor height,
// posts, walls, roof and deck, the same materials, no interiors, no colliders, one merged piece per material per house.
// Elements added to the khmer style (names ak_far_*); the style itself is untouched.

import { STYLES } from '../../core/build.js';
import '../../styles/khmer/index.js';
import { box, lathe, fromTriangles } from '../../core/geom.js';
import { beamTris } from '../../styles/ming/index.js';
import { merge } from '../../objects/kit.js';
import { frame, boxR, houseUp, variantOf } from '../../styles/khmer/village.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** ak_far_house: { rect, front, seed, kind, variant } as stilt_house, without what is only seen close. */
function farHouse(el, { bag }) {
  const rand = rng(el.seed || 1), { F, W, R, hF, hS } = frame(el.rect, el.front), kind = el.kind ?? 'plain', variant = variantOf(el);
  const up = houseUp(el), wallH = kind === 'small' ? 2.0 : variant === 'tile' ? 2.45 : 2.25, top = up + wallH;
  rand();
  const w0 = rand() < 0.5, wall = variant === 'tile' ? 'timber_red' : variant === 'porch' ? 'planks_grey' : variant === 'shop' ? 'wood_ochre' : w0 ? 'reed_mat' : 'timber';
  const th = 0.07, deck = kind === 'small' ? 0 : 0.95, doorW = 0.5, doorH = 1.85;
  const timber = [], walls = [];
  // the posts (the corner ones, to the eaves; the rest are hidden under the floor or too thin to show from 170 m), four-sided
  const nu = hS > 2.3 ? 3 : 2, nv = hF > 3 ? 4 : 3;
  for (let i = 0; i <= nv; i++) for (let j = 0; j <= nu; j++) {
    const v = -hF + 2 * hF * i / nv, u = -hS + 2 * hS * j / nu, corner = (i === 0 || i === nv) && (j === 0 || j === nu), [x, z] = W(u, v);
    if (corner) timber.push(box(x - 0.11, 0, z - 0.11, x + 0.11, top, z + 0.11));
  }
  // the floor, the walls as one solid (the door's frame, 0.1 m proud, is a pixel at 170 m: left out)
  timber.push(boxR(R(-hS - 0.12, hS + 0.12, -hF - 0.12, hF + 0.12), up - 0.15, up));
  walls.push(boxR(R(-hS - th / 2, hS + th / 2, -hF - th / 2, hF + th / 2), up, top));
  // the deck and the stair as one board
  if (deck) {
    const vd = hF + deck, dw = Math.min(hS, 1.7), run = 0.34, nSteps = Math.ceil(up / 0.3), t = [];
    timber.push(boxR(R(-dw, dw, hF, vd), up - 0.15, up));
    const a = W(0, vd), b = W(0, vd + run * nSteps);
    beamTris(t, [a[0], up - 0.05, a[1]], [b[0], 0.1, b[1]], 0.5, 0.06);
    timber.push(fromTriangles(t));
  }
  // the roof of palm thatch (or tile), as the full house's, with its ridge roll and crossed finials
  const long = el.rect[2] - el.rect[0] >= el.rect[3] - el.rect[1];
  const cx = (el.rect[0] + el.rect[2]) / 2, cz = (el.rect[1] + el.rect[3]) / 2, A = (long ? el.rect[2] - el.rect[0] : el.rect[3] - el.rect[1]) / 2 + 0.85, B = (long ? el.rect[3] - el.rect[1] : el.rect[2] - el.rect[0]) / 2 + 0.95, rise2 = B * 1.15;
  const tiled = variant === 'tile';
  if (tiled) {
    // the hipped tile roof as four planes, seen from either side (the full house's has its ridge and edge tiles; from 170 m they are the same roof)
    const P = (u, v, h) => (long ? [cx + u, h, cz + v] : [cx + v, h, cz + u]), ry = top + rise2 * 0.8, rl = Math.max(0, A - B * 0.9), T = [];
    const tri = (a, b, c) => T.push(...a, ...b, ...c, ...a, ...c, ...b);
    for (const sg of [-1, 1]) { const e0 = P(-A, sg * B, top), e1 = P(A, sg * B, top), r0 = P(-rl, 0, ry), r1 = P(rl, 0, ry); tri(e0, e1, r1); tri(e0, r1, r0); }
    for (const sg of [-1, 1]) { const e0 = P(sg * A, -B, top), e1 = P(sg * A, B, top), r = P(sg * rl, 0, ry); tri(e0, e1, r); }
    bag.add('roof_tile', fromTriangles(T));
  }
  else {
    // the thatch: two sloping sheets (seen from either side) and the gable ends closed, a dozen triangles where the full roof has some five hundred
    const P = (u, v, h) => (long ? [cx + u, h, cz + v] : [cx + v, h, cz + u]), ry = top + rise2, T = [];
    const tri = (a, b, c) => T.push(...a, ...b, ...c, ...a, ...c, ...b);
    for (const sg of [-1, 1]) { const e0 = P(-A, sg * B, top), e1 = P(A, sg * B, top), r0 = P(-A, 0, ry), r1 = P(A, 0, ry); tri(e0, e1, r1); tri(e0, r1, r0); }
    for (const sg of [-1, 1]) tri(P(sg * A, -B, top), P(sg * A, B, top), P(sg * A, 0, ry));
    bag.add('thatch_palm', fromTriangles(T));
  }
  // (the ridge roll, 0.2 m, and the crossed finials, a metre high, are 1 to 5 pixels from 170 m: left out of the far form)
  // (one piece per material per house, each unlike its neighbours', so that nothing is instanced and the tile merges into one draw)
  bag.add(wall, merge(walls));
  bag.add('timber', merge(timber));
  void F;
}

/** ak_far_palm: { at, y, s, rot, ladder } as sugar_palm: the trunk, a head of twelve fans, the dead leaves' skirt; as one merged piece per material. */
function farPalm(el, { bag }) {
  const [x, z] = el.at, y = el.y ?? 0, s = el.s ?? 1, rot = el.rot ?? 0, H = 15 * s, r = rng(Math.floor(Math.abs(x * 131 + z * 17) * 100) + 7);
  bag.add('palm_trunk', lathe([[0.36 * s, -0.2], [0.27 * s, 1.6 * s], [0.24 * s, H * 0.5], [0.26 * s, H * 0.85], [0.3 * s, H]], 6, null, x, y, z));
  bag.add('thatch_palm', lathe([[0.3 * s, H - 0.3 * s], [0.45 * s, H], [0.45 * s, H + 0.4 * s], [0.3 * s, H + 0.7 * s], [0.001, H + 0.75 * s]], 6, null, x, y, z));
  const T = [];
  const tri = (a, b, c) => T.push(...a, ...b, ...c, ...a, ...c, ...b);
  const n = 12;
  for (let k = 0; k < n; k++) {
    const az = rot + k * 2.39996 + r() * 0.2, el2 = -0.25 + (k / n) * 1.3, st = (1.4 + r() * 0.4) * s, fr = (1.05 + r() * 0.3) * s;
    const d = [Math.cos(az) * Math.cos(el2), Math.sin(el2), Math.sin(az) * Math.cos(el2)], b = [x + d[0] * 0.3 * s, y + H + 0.45 * s, z + d[2] * 0.3 * s];
    const c = [b[0] + d[0] * st, b[1] + d[1] * st, b[2] + d[2] * st], side = [-Math.sin(az), 0, Math.cos(az)];
    // the blade: a half-disc of radius fr beyond the stalk's end, from the crown, in three wedges
    const pts = [];
    for (let i = 0; i <= 3; i++) { const a = (i / 3 - 0.5) * 2.2; pts.push([c[0] + side[0] * Math.sin(a) * fr * 1.1 + d[0] * Math.cos(a) * fr * 0.8, c[1] + d[1] * Math.cos(a) * fr * 0.8 - 0.1 * s, c[2] + side[2] * Math.sin(a) * fr * 1.1 + d[2] * Math.cos(a) * fr * 0.8]); }
    for (let i = 0; i < 3; i++) tri(b, pts[i], pts[i + 1]);
  }
  bag.add('palm_leaf', fromTriangles(T));
}

Object.assign(STYLES.khmer.elements, { ak_far_house: farHouse, ak_far_palm: farPalm });
