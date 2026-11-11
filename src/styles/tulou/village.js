// The village round the landmark: square tulou, farm buildings, the slab bridge over the stream.
import { box, frustum, rod, fromTriangles } from '../../core/geom.js';
import { Matrix4 } from '../../core/three.js';
import { hexa, lbox } from './geo.js';
import { zslab } from './hall.js';

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
 * tulou_square: { c, half, floors, gate: 's' } — a square tulou, simpler than the landmark (docs §4.2): rammed-earth walls on a
 * cobble plinth leaning in, dark window slits on the upper storeys, a gate in the south wall, a skin of boards on the court
 * with its galleries, a ring roof of tiles, a well in the cobbled court.
 */
export function tulouSquare(el, { bag, col }) {
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
  // window slits on the upper floors, every 3.6 m
  for (let k = 2; k < K; k++) for (let q = 0; q < 4; q++) for (let s = -h + 3; s < h - 2; s += 3.6) {
    const y = k * st + 1.0, [a, b] = turn(s, h - 0.25, q), [a2, b2] = turn(s, h + 0.4, q);
    const x0 = Math.min(a, a2) - (q % 2 ? 0 : 0.27), x1 = Math.max(a, a2) + (q % 2 ? 0 : 0.27), z0 = Math.min(b, b2) - (q % 2 ? 0.27 : 0), z1 = Math.max(b, b2) + (q % 2 ? 0.27 : 0);
    if (q === 2 && Math.abs(s) < 3) continue;
    bag.add('opening', box(cx + x0 + (q === 1 ? -0.2 : q === 3 ? 0.2 : 0), y, cz + z0 + (q === 2 ? -0.2 : q === 0 ? 0.2 : 0), cx + x1 + (q === 1 ? -0.2 : q === 3 ? 0.2 : 0), y + 0.65, cz + z1 + (q === 2 ? -0.2 : q === 0 ? 0.2 : 0)));
  }
  // the gate: granite frame, lintel, hood, doors open; the passage through the board skin
  B('granite_block', -gw - 0.3, 0, hin - 0.3, -gw, 3.4, h + 0.2); B('granite_block', gw, 0, hin - 0.3, gw + 0.3, 3.4, h + 0.2); B('granite_block', -gw - 0.3, 3.4, hin - 0.3, gw + 0.3, 3.75, h + 0.2);
  B(TILE, -gw - 0.8, 3.95, h - 0.1, gw + 0.8, 4.05, h + 1.0); B('lacquer_black', -0.9, 3.8, h + 0.0, 0.9, 4.2, h + 0.06);
  for (const s of [-1, 1]) { B(TIMBER, s > 0 ? gw - 0.16 : -gw, 0, hin + 0.2, s > 0 ? gw : -gw + 0.16, 3.2, h - 0.35); for (const y of [0.5, 1.6, 2.7]) B('iron', s > 0 ? gw - 0.19 : -gw - 0.03, y, hin + 0.2, s > 0 ? gw + 0.03 : -gw + 0.19, y + 0.12, h - 0.35); col.rect([cx + (s > 0 ? gw : -gw - 0.3), cz + hin - 0.3, cx + (s > 0 ? gw + 0.3 : -gw), cz + h + 0.2], 0, 3.4); }
  // the court: cobbles, the skin of boards (the rooms' fronts) with galleries on its floors and a gate passage
  B('pebbles', -hf, 0, -hf, hf, 0.03, hf); B('bluestone', -1.0, 0.03, 0, 1.0, 0.06, h);
  const skin = (r) => { for (const rr of r) { bag.add(TIMBER, box(cx + rr[0], 0, cz + rr[1], cx + rr[2], top - 0.3, cz + rr[3])); col.rect([cx + rr[0], cz + rr[1], cx + rr[2], cz + rr[3]], 0, top); } };
  skin([[-hf - 0.12, -hf - 0.12, hf + 0.12, -hf], [-hf - 0.12, hf, -gw, hf + 0.12], [gw, hf, hf + 0.12, hf + 0.12], [-hf - 0.12, -hf, -hf, hf], [hf, -hf, hf + 0.12, hf]]);
  for (const s of [-1, 1]) { B(TIMBER, s > 0 ? gw : -gw - 0.12, 0, hf, s > 0 ? gw + 0.12 : -gw, 3.0, hin); col.rect([cx + (s > 0 ? gw : -gw - 0.12), cz + hf, cx + (s > 0 ? gw + 0.12 : -gw), cz + hin], 0, 3.4); }
  for (let k = 1; k < K; k++) { const y = k * st; B(TIMBER, -hf, y - 0.25, -hf + 0.0, hf, y, -hr); B(TIMBER, -hf, y - 0.25, hr, hf, y, hf); B(TIMBER, -hf, y - 0.25, -hr, -hr, y, hr); B(TIMBER, hr, y - 0.25, -hr, hf, y, hr); }
  // the court's posts and rails
  for (let k = 1; k < K; k++) { const y = k * st; B(TIMBER, -hr, y + 1.0, -hr, hr, y + 1.05, -hr + 0.05); B(TIMBER, -hr, y + 1.0, hr - 0.05, hr, y + 1.05, hr); B(TIMBER, -hr, y + 1.0, -hr, -hr + 0.05, y + 1.05, hr); B(TIMBER, hr - 0.05, y + 1.0, -hr, hr, y + 1.05, hr); }
  for (let q = 0; q < 4; q++) for (let s = -hr; s <= hr + 0.01; s += (2 * hr) / 6) { const [a, b] = turn(s, hr, q); B('timber_red', a - 0.1, 0, b - 0.1, a + 0.1, top - 0.1, b + 0.1); }
  squareRoof(bag, cx, cz, h + 1.9, top - 0.6, (hin + hf) / 2, top + 1.7, hr - 1.6, top - 0.3, 0.1);
}

/** farmhouse: { c: [x, z], w, d, rot (0 | 1: a quarter turn) } — a pigsty or barn of rammed earth under a gabled tile roof, one side open under the eave. */
export function farmhouse(el, { bag, col }) {
  const [cx, cz] = el.c, w = el.w, d = el.d, q = el.rot ? Math.PI / 2 : 0, H = 2.6;
  const L = (m, x0, y0, z0, x1, y1, z1) => bag.add(m, lbox(cx, cz, q, x0, y0, z0, x1, y1, z1));
  L('granite_block', -w / 2 - 0.05, 0, -d / 2 - 0.05, w / 2 + 0.05, 0.6, d / 2 + 0.05);
  L(EARTH, -w / 2, 0.6, -d / 2, w / 2, H, -d / 2 + 0.5); L(EARTH, -w / 2, 0.6, -d / 2, -w / 2 + 0.5, H, d / 2); L(EARTH, w / 2 - 0.5, 0.6, -d / 2, w / 2, H, d / 2);
  L(EARTH, -w / 2, 0.6, d / 2 - 0.5, -0.8, H, d / 2); L(EARTH, 0.8, 0.6, d / 2 - 0.5, w / 2, H, d / 2); L(EARTH, -0.8, 2.1, d / 2 - 0.5, 0.8, H, d / 2);
  const c = Math.cos(q), s = Math.sin(q);
  col.segment([cx + (-w / 2) * c, cz - (-w / 2) * s], [cx + (w / 2) * c, cz - (w / 2) * s], 0.5, 0, H);
  col.segment([cx + (-w / 2) * c + (d / 2) * s, cz - (-w / 2) * s + (d / 2) * c], [cx + (-0.8) * c + (d / 2) * s, cz - (-0.8) * s + (d / 2) * c], 0.5, 0, H);
  col.segment([cx + (0.8) * c + (d / 2) * s, cz - (0.8) * s + (d / 2) * c], [cx + (w / 2) * c + (d / 2) * s, cz - (w / 2) * s + (d / 2) * c], 0.5, 0, H);
  col.segment([cx + (-w / 2) * c - (d / 2) * s, cz - (-w / 2) * s - (d / 2) * c], [cx + (-w / 2) * c + (d / 2) * s, cz - (-w / 2) * s + (d / 2) * c], 0.5, 0, H);
  col.segment([cx + (w / 2) * c - (d / 2) * s, cz - (w / 2) * s - (d / 2) * c], [cx + (w / 2) * c + (d / 2) * s, cz - (w / 2) * s + (d / 2) * c], 0.5, 0, H);
  // the gabled roof: ridge along x, the eaves 0.9 m out
  const roof = (m, zA, yA, zB, yB, t) => { const geo = zslab(-w / 2 - 0.9, w / 2 + 0.9, zA, yA, zB, yB, t); geo.applyMatrix4(new Matrix4().makeRotationY(q).setPosition(cx, 0, cz)); bag.add(m, geo); };
  roof(TILE, -d / 2 - 0.9, H + 0.1, 0, H + 1.4, 0.1); roof(TILE, d / 2 + 0.9, H + 0.1, 0, H + 1.4, 0.1);
  L('tile_dark', -w / 2 - 0.9, H + 1.3, -0.15, w / 2 + 0.9, H + 1.55, 0.15);
  L('opening', -0.8, 0, d / 2 - 0.52, 0.8, 2.1, d / 2 - 0.45);
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
