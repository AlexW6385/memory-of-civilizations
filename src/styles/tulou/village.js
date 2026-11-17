// The village round the landmark: square tulou, farm buildings, the slab bridge over the stream.
import { STYLES } from '../../core/build.js';
import { box, frustum, rod, fromTriangles, lathe } from '../../core/geom.js';
import { Matrix4 } from '../../core/three.js';
import { hexa, lbox } from './geo.js';
import { zslab } from './hall.js';
import { squareRings } from './square.js';

const EARTH = 'mud_plaster', TIMBER = 'timber', TILE = 'tile_grey';
const turn = (x, z, q) => (q === 0 ? [x, z] : q === 1 ? [-z, x] : q === 2 ? [-x, -z] : [z, -x]);

/** A square ring roof about (cx, cz): outer eave half-size hO at yO, ridge hR at yR, inner eave hI at yI, thickness t. */
function squareRoof(bag, cx, cz, hO, yO, hR, yR, hI, yI, t) {
  for (let q = 0; q < 4; q++) {
    const T = (x, y, z) => { const [a, b] = turn(x, z, q); return [cx + a, y, cz + b]; };
    for (const [h0, y0, h1, y1] of [[hO, yO, hR, yR], [hR, yR, hI, yI]]) {
      bag.add(TILE, hexa([T(-h0, y0, h0), T(h0, y0, h0), T(h1, y1, h1), T(-h1, y1, h1)], [T(-h0, y0 - t, h0), T(h0, y0 - t, h0), T(h1, y1 - t, h1), T(-h1, y1 - t, h1)]));
      bag.add(TIMBER, hexa([T(-h0, y0 - t, h0), T(h0, y0 - t, h0), T(h1, y1 - t, h1), T(-h1, y1 - t, h1)], [T(-h0, y0 - t - 0.05, h0), T(h0, y0 - t - 0.05, h0), T(h1, y1 - t - 0.05, h1), T(-h1, y1 - t - 0.05, h1)]));
    }
    bag.add('tile_dark', hexa([T(-hR, yR + 0.12, hR), T(hR, yR + 0.12, hR), T(hR - 0.5, yR + 0.12, hR - 0.5), T(-hR + 0.5, yR + 0.12, hR - 0.5)], [T(-hR, yR - 0.02, hR), T(hR, yR - 0.02, hR), T(hR - 0.5, yR - 0.02, hR - 0.5), T(-hR + 0.5, yR - 0.02, hR - 0.5)]));
  }
}

/**
 * tulou_enclosure: { c, half, floors, gate: 's' } — a square tulou, simpler than the landmark (docs §4.2): rammed-earth walls on a
 * cobble plinth leaning in, dark window slits on the upper storeys, a gate in the south wall, a skin of boards on the court
 * with its galleries, a ring roof of tiles, a well in the cobbled court.
 */
export function tulouSquare(el, ctx) {
  const { bag, col } = ctx;
  const [cx, cz] = el.c, h = el.half, K = el.floors, st = 3.3, top = K * st, th = 1.4, lean = 0.3, hin = h - th, hf = hin - 3.6, hr = hf - 1.5;
  const B = (m, x0, y0, z0, x1, y1, z1) => bag.add(m, box(cx + x0, y0, cz + z0, cx + x1, y1, cz + z1));
  const gw = 1.2;
  // the walls: four leaning frusta; the south one cut by the gate
  const F = (r, ix0, ix1, iz0, iz1) => bag.add(EARTH, frustum([cx + r[0], cz + r[1], cx + r[2], cz + r[3]], 1.0, top, ix0, ix1, iz0, iz1));
  F([-h, -h, h, -hin], lean, lean, lean, 0); F([-h, hin, -gw, h], lean, 0, 0, lean); F([gw, hin, h, h], 0, lean, 0, lean);
  F([-h, -hin, -hin, hin], lean, 0, 0, 0); F([hin, -hin, h, hin], 0, lean, 0, 0);
  bag.add(EARTH, frustum([cx - gw, cz + hin, cx + gw, cz + h], 3.4, top, 0, 0, 0, lean));
  for (const r of [[-h, -h, h, -hin], [-h, hin, -gw - 0.3, h], [gw + 0.3, hin, h, h], [-h, -hin, -hin, hin], [hin, -hin, h, hin]]) { bag.add('granite_block', box(cx + r[0] - 0.05, 0, cz + r[1] - 0.05, cx + r[2] + 0.05, 1.0, cz + r[3] + 0.05)); }
  col.rect([cx - h, cz - h, cx + h, cz - hin], 0, top); col.rect([cx - h, cz + hin, cx - gw, cz + h], 0, top); col.rect([cx + gw, cz + hin, cx + h, cz + h], 0, top);
  col.rect([cx - h, cz - hin, cx - hin, cz + hin], 0, top); col.rect([cx + hin, cz - hin, cx + h, cz + hin], 0, top);
  // the gate: granite frame, lintel, hood, doors open; the passage through the board skin
  B('granite_block', -gw - 0.3, 0, hin - 0.3, -gw, 3.4, h + 0.2); B('granite_block', gw, 0, hin - 0.3, gw + 0.3, 3.4, h + 0.2); B('granite_block', -gw - 0.3, 3.4, hin - 0.3, gw + 0.3, 3.75, h + 0.2);
  B(TILE, -gw - 0.8, 3.95, h - 0.1, gw + 0.8, 4.05, h + 1.0); B('lacquer_black', -0.9, 3.8, h + 0.0, 0.9, 4.2, h + 0.06);
  for (const s of [-1, 1]) { B(TIMBER, s > 0 ? gw - 0.16 : -gw, 0, hin + 0.2, s > 0 ? gw : -gw + 0.16, 3.2, h - 0.35); for (const y of [0.5, 1.6, 2.7]) B('iron', s > 0 ? gw - 0.19 : -gw - 0.03, y, hin + 0.2, s > 0 ? gw + 0.03 : -gw + 0.19, y + 0.12, h - 0.35); col.rect([cx + (s > 0 ? gw : -gw - 0.3), cz + hin - 0.3, cx + (s > 0 ? gw + 0.3 : -gw), cz + h + 0.2], 0, 3.4); }
  // the court: cobbles and the bluestone way from the gate; the ring of rooms, galleries and stairs (square.js)
  B('pebbles', -hf, 0, -hf, hf, 0.03, hf); B('bluestone', -1.0, 0.03, 0, 1.0, 0.06, h);
  const hM = (hin + hf) / 2, hI = hr - 1.6, yI = top - 0.3, yR = top + 1.7, yO = top - 0.6, hO = h + 1.9;
  const roofAt = (z) => (z >= hM ? yR - (yR - yO) * (z - hM) / (hO - hM) : yR - (yR - yI) * (hM - z) / (hM - hI)) - 0.16;
  squareRings(ctx, { cx, cz, h, hin, hf, hr, K, st, top, gw, roofAt });
  squareRoof(bag, cx, cz, h + 1.9, top - 0.6, (hin + hf) / 2, top + 1.7, hr - 1.6, top - 0.3, 0.1);
}

/** farmhouse: { c: [x, z], w, d, rot (0 | 1: a quarter turn) } — a pigsty or barn of rammed earth under a gabled tile roof, one side open under the eave. */
export function farmhouse(el, ctx) {
  const { bag, col } = ctx;
  const [cx, cz] = el.c, w = el.w, d = el.d, q = el.rot ? Math.PI / 2 : 0, H = 2.6;
  const L = (m, x0, y0, z0, x1, y1, z1) => bag.add(m, lbox(cx, cz, q, x0, y0, z0, x1, y1, z1));
  L('granite_block', -w / 2 - 0.05, 0, -d / 2 - 0.05, w / 2 + 0.05, 0.6, -d / 2 + 0.5); L('granite_block', -w / 2 - 0.05, 0, -d / 2 - 0.05, -w / 2 + 0.5, 0.6, d / 2 + 0.05); L('granite_block', w / 2 - 0.5, 0, -d / 2 - 0.05, w / 2 + 0.05, 0.6, d / 2 + 0.05);
  L('granite_block', -w / 2 - 0.05, 0, d / 2 - 0.5, -0.8, 0.6, d / 2 + 0.05); L('granite_block', 0.8, 0, d / 2 - 0.5, w / 2 + 0.05, 0.6, d / 2 + 0.05); L('granite_block', -0.9, 0, d / 2 - 0.5, 0.9, 0.08, d / 2 + 0.4);
  L(EARTH, -w / 2, 0.6, -d / 2, w / 2, H, -d / 2 + 0.5); L(EARTH, -w / 2, 0.6, -d / 2, -w / 2 + 0.5, H, d / 2); L(EARTH, w / 2 - 0.5, 0.6, -d / 2, w / 2, H, d / 2);
  L(EARTH, -w / 2, 0.6, d / 2 - 0.5, -0.8, H, d / 2); L(EARTH, 0.8, 0.6, d / 2 - 0.5, w / 2, H, d / 2); L(EARTH, -0.8, 2.1, d / 2 - 0.5, 0.8, H, d / 2);
  const c = Math.cos(q), s = Math.sin(q);
  const Pw = (x, z) => [cx + x * c + z * s, cz - x * s + z * c], seg = (x0, z0, x1, z1) => col.segment(Pw(x0, z0), Pw(x1, z1), 0.5, 0, H);
  seg(-w / 2, -d / 2 + 0.25, w / 2, -d / 2 + 0.25);                                 // the back wall
  seg(-w / 2, d / 2 - 0.25, -0.8, d / 2 - 0.25); seg(0.8, d / 2 - 0.25, w / 2, d / 2 - 0.25);       // the front, open at the door
  seg(-w / 2 + 0.25, -d / 2, -w / 2 + 0.25, d / 2); seg(w / 2 - 0.25, -d / 2, w / 2 - 0.25, d / 2);   // the two ends
  // the gabled roof: ridge along x, the eaves 0.9 m out
  const roof = (m, zA, yA, zB, yB, t) => { const geo = zslab(-w / 2 - 0.9, w / 2 + 0.9, zA, yA, zB, yB, t); geo.applyMatrix4(new Matrix4().makeRotationY(q).setPosition(cx, 0, cz)); bag.add(m, geo); };
  roof(TILE, -d / 2 - 0.9, H + 0.1, 0, H + 1.4, 0.1); roof(TILE, d / 2 + 0.9, H + 0.1, 0, H + 1.4, 0.1);
  L('tile_dark', -w / 2 - 0.9, H + 1.3, -0.15, w / 2 + 0.9, H + 1.55, 0.15);
  farmInterior(el, ctx, { cx, cz, q, w, d, H });
}

/**
 * The inside of a farm building (docs §4.6), by `el.kind`: 0 the pigsty (two pens of straw with their pigs, the trough, the swill
 * barrel), 1 the buffalo shed (a tethered buffalo at its manger, the plough, the yoke, the harrow, straw), 2 the tea shed (racks of
 * bamboo trays, a firing stove with its wok, baskets of leaf), 3 the barn (grain bins, sacks, the foot-lever rice pestle and mortar,
 * a winnowing fan). Local frame as the building's: the door in the +z wall, the aisle along x = 0 kept clear.
 */
function farmInterior(el, ctx, { cx, cz, q, w, d, H }) {
  const { bag, col } = ctx, LF = STYLES.life.elements, kind = el.kind ?? 0, c = Math.cos(q), s = Math.sin(q);
  const W = (x, z) => [cx + x * c + z * s, cz - x * s + z * c];
  const L = (m, x0, y0, z0, x1, y1, z1) => bag.add(m, lbox(cx, cz, q, x0, y0, z0, x1, y1, z1));
  const R = (x0, z0, x1, z1, y0, y1) => { const a = W(x0, z0), b = W(x1, z1); col.rect([a[0], a[1], b[0], b[1]], y0, y1); };
  const obj = (t, x, z, o = {}) => LF[t]({ t, at: W(x, z), y: 0, rot: q + (o.r ?? 0), ...o }, ctx);
  const hx = w / 2 - 0.5, zb = -d / 2 + 0.5, zf = d / 2 - 0.5, sd = Math.abs(Math.round(el.c[0] * 7 + el.c[1] * 3)) % 97;
  L('ground', -hx, 0, zb, hx, 0.03, zf);
  const fence = (x0, z0, x1, z1) => { L(TIMBER, x0, 0.62, z0, x1, 0.68, z1); L(TIMBER, x0, 0.28, z0, x1, 0.32, z1); R(x0 - 0.04, z0 - 0.04, x1 + 0.04, z1 + 0.04, 0, 0.7); };
  const post = (x, z, hgt = 0.8) => L(TIMBER, x - 0.04, 0, z - 0.04, x + 0.04, hgt, z + 0.04);
  if (kind === 0) {
    for (const sg of [-1, 1]) {
      const xa = sg * 1.05, xb = sg * hx;
      L('thatch', Math.min(xa, xb), 0.03, zb, Math.max(xa, xb), 0.07, 0.5);
      fence(xa - 0.03, zb, xa + 0.03, 0.5); fence(Math.min(xa, xb), 0.47, Math.max(xa, xb), 0.53);
      for (const z of [zb, 0.5]) post(xa, z);
      L(TIMBER, sg * 2.0 - 0.45, 0.1, zb + 0.15, sg * 2.0 + 0.45, 0.3, zb + 0.5); R(sg * 2.0 - 0.45, zb + 0.15, sg * 2.0 + 0.45, zb + 0.5, 0, 0.3);
      obj('animal', sg * 2.5, -0.9, { kind: 'pig', seed: sd + sg * 5, r: sg });
    }
    obj('barrel', hx - 0.5, zf - 0.1, { seed: sd }); { const a = W(hx - 0.5, zf - 0.1); col.circle(a[0], a[1], 0.4, 0, 0.9); }
    obj('firewood', -hx + 0.7, zf - 0.2, { len: 0.9, seed: sd });
  } else if (kind === 1) {
    // the stall on the left: a rail across, the manger on the back wall, the tethered buffalo; on the right the tools
    fence(-1.15, zb + 0.3, -1.1, 1.0); post(-1.12, zb + 0.3, 1.2); post(-1.12, 1.0, 1.2);
    L(TIMBER, -hx, 0.45, zb, -hx + 0.55, 0.85, 0.9); R(-hx, zb, -hx + 0.55, 0.9, 0, 0.9);
    L('thatch', -hx + 0.6, 0.03, zb, -1.15, 0.07, 1.0);
    obj('animal', -2.55, -0.2, { kind: 'buffalo', seed: sd + 2, r: Math.PI / 2 });
    // plough: beam, share, handle; yoke on a peg; harrow (a frame with iron teeth) leaned on the wall
    const rx = hx - 1.2;
    L(TIMBER, rx - 0.04, 0.3, zb + 0.5, rx + 0.04, 0.4, zb + 2.2); L(TIMBER, rx - 0.04, 0.3, zb + 0.5, rx + 0.04, 1.05, zb + 0.6); L('iron', rx - 0.08, 0, zb + 1.6, rx + 0.08, 0.3, zb + 1.95); R(rx - 0.15, zb + 0.4, rx + 0.15, zb + 2.2, 0, 0.5);
    L(TIMBER, hx - 0.2, 1.3, zb + 0.3, hx, 1.4, zb + 1.7); L(TIMBER, hx - 0.25, 1.2, zb + 0.3, hx - 0.2, 1.7, zb + 0.4); L(TIMBER, hx - 0.25, 1.2, zb + 1.6, hx - 0.2, 1.7, zb + 1.7);
    L(TIMBER, 1.2, 0.05, zb + 0.1, 3.0, 0.12, zb + 0.18); L(TIMBER, 1.2, 0.95, zb + 0.06, 3.0, 1.02, zb + 0.12); L(TIMBER, 1.2, 0.05, zb + 0.1, 1.28, 1.02, zb + 0.18); L(TIMBER, 2.92, 0.05, zb + 0.1, 3.0, 1.02, zb + 0.18);
    for (let t = 0; t < 7; t++) L('iron', 1.28 + t * 0.24, 0.0, zb + 0.12, 1.34 + t * 0.24, 0.1, zb + 0.16);
    R(1.2, zb + 0.05, 3.0, zb + 0.22, 0, 1.0);
    obj('haystack', hx - 0.8, zf - 0.7, { kind: 'pole', seed: sd });
  } else if (kind === 2) {
    // racks of bamboo trays along the back wall (three tiers, the trays with leaf), the firing stove and wok on the right, baskets of leaf
    for (const [x0, x1] of [[-hx, -0.2 - 0.9], [0.2 + 0.9, hx - 1.6]]) {
      for (const x of [x0 + 0.05, x1 - 0.05]) { L(TIMBER, x - 0.04, 0, zb, x + 0.04, 1.9, zb + 0.9); }
      for (const y of [0.5, 1.1, 1.7]) {
        L(TIMBER, x0, y - 0.04, zb, x1, y, zb + 0.9);
        L('wicker', x0 + 0.1, y, zb + 0.08, x1 - 0.1, y + 0.05, zb + 0.82);
        L(y > 1 ? 'cloth_green' : 'cloth_ochre', x0 + 0.25, y + 0.05, zb + 0.2, x1 - 0.25, y + 0.1, zb + 0.7);
      }
      R(x0, zb, x1, zb + 0.9, 0, 1.9);
    }
    const sx = hx - 0.8;
    L('brick_grey', sx - 0.6, 0, zb, sx + 0.6, 0.8, zb + 1.1); L('iron', sx - 0.4, 0.8, zb + 0.15, sx + 0.4, 0.86, zb + 0.95);
    bag.add('iron', lathe([[0.001, 0.0], [0.34, 0.1], [0.42, 0.22], [0.001, 0.22]], 12, null, W(sx, zb + 0.55)[0], 0.82, W(sx, zb + 0.55)[1]));
    L('wood_dark', sx - 0.65, 1.9, zb, sx + 0.65, 2.3, zb + 1.15); R(sx - 0.6, zb, sx + 0.6, zb + 1.1, 0, 0.9);
    obj('firewood', sx, zb + 1.5, { len: 0.8, seed: sd });
    obj('basket', -hx + 0.6, zf - 0.3, { n: 3, seed: sd }); obj('basket', hx - 0.6, zf - 0.3, { n: 2, seed: sd + 1 });
  } else {
    // the barn: two bins of boards along the back wall, sacks, the foot-lever pestle in its stone mortar, the winnowing fan on a peg
    for (const [x0, x1] of [[-hx, -0.3 - 0.7], [0.3 + 0.7, 0.3 + 0.7 + 1.8]]) { L(TIMBER, x0, 0, zb, x1, 1.0, zb + 1.1); L('wicker', x0 + 0.08, 1.0, zb + 0.08, x1 - 0.08, 1.04, zb + 1.02); R(x0, zb, x1, zb + 1.1, 0, 1.05); }
    obj('sacks', hx - 0.8, zb + 0.6, { n: 4, seed: sd }); { const a = W(hx - 0.8, zb + 0.6); col.circle(a[0], a[1], 0.55, 0, 0.8); }
    bag.add('granite_block', lathe([[0.001, 0], [0.3, 0], [0.3, 0.25], [0.2, 0.25], [0.2, 0.1], [0.001, 0.1]], 12, null, W(-hx + 0.8, zf - 0.9)[0], 0, W(-hx + 0.8, zf - 0.9)[1]));
    L(TIMBER, -hx + 0.74, 0.4, zf - 2.8, -hx + 0.86, 0.5, zf - 0.9); L('granite_block', -hx + 0.7, 0.45, zf - 1.1, -hx + 0.9, 0.62, zf - 0.7);
    L(TIMBER, -hx + 0.45, 0, zf - 2.8, -hx + 1.15, 0.4, zf - 2.7); R(-hx + 0.4, zf - 2.9, -hx + 1.2, zf - 0.55, 0, 0.6);
    bag.add('wicker', lathe([[0.4, 0], [0.38, 0.04], [0.001, 0.05]], 14).rotateX(Math.PI / 2).translate(...(() => { const p = W(0, zb + 0.06); return [p[0], 1.5, p[1]]; })()));
    obj('basket', 1.9, zf - 0.3, { n: 2, seed: sd + 4 });
  }
}

/** slab_bridge: { a: [x, z0], b: [x, z1], y } — two granite slabs on stone abutments over the stream, the deck 0.1 above the bank. */
export function slabBridge(el, { bag, col }) {
  const [x, z0] = el.a, z1 = el.b[1], y = el.y ?? 0.1, w = el.w ?? 1.8;
  for (const z of [z0, z1]) { bag.add('granite_block', box(x - w / 2 - 0.1, -1.6, z - 0.7, x + w / 2 + 0.1, y - 0.28, z + 0.7)); }
  for (let k = 0; k < 2; k++) { const xa = x - w / 2 + k * w / 2; bag.add('granite_block', box(xa, y - 0.28, z0, xa + w / 2 - 0.02, y, z1)); }
  // a pier mid-stream when it is long
  if (z1 - z0 > 6) { const zm = (z0 + z1) / 2; bag.add('granite_block', box(x - w / 2, -1.6, zm - 0.35, x + w / 2, y - 0.28, zm + 0.35)); }
  col.floor([x - w / 2, z0, x + w / 2, z1], y);
}
void rod; void fromTriangles;

/** track: { rect, y, mat } — a paved way (bluestone slabs) laid on level ground; named a "track" so that the engine's street life keeps it clear. */
export function track(el, { bag }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0.04;
  bag.add(el.mat ?? 'bluestone', box(Math.min(x0, x1), y - 0.1, Math.min(z0, z1), Math.max(x0, x1), y, Math.max(z0, z1)));
}
