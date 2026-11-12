// Street, yard and water pieces of Muromachi Kyoto (docs/settlements/muromachi-kyoto.md §5): the stone-edged gutter under the eaves,
// vegetable beds in the yards, the steps down to the stream, stones set in a garden or an islet, the bell tower (shōrō) of a
// temple, a woodshed, a rack for drying straw and cloth.
import { box, lathe } from '../../core/geom.js';
import { quad2, eaveRing, rng, WD, TM, BARK } from './kit.js';

const bx = (bag, m, x0, y0, z0, x1, y1, z1) => bag.add(m, box(Math.min(x0, x1), y0, Math.min(z0, z1), Math.max(x0, x1), y1, Math.max(z0, z1)));

/** gutter: { a, b (along x or z), y } — a drain of earth between two courses of stone, 0.4 m wide, with a slab over it every so often. */
function gutter(el, { bag }) {
  const [ax, az] = el.a, [cx, cz] = el.b, y = el.y ?? 0, alongX = Math.abs(cx - ax) > Math.abs(cz - az), h = 0.05, w = 0.2;
  if (alongX) {
    bx(bag, 'silt', ax, y, az - w, cx, y + 0.012, az + w);
    bx(bag, 'granite_grey', ax, y, az - w - 0.1, cx, y + h, az - w); bx(bag, 'granite_grey', ax, y, az + w, cx, y + h, az + w + 0.1);
    for (let x = ax + 3; x < cx - 1; x += 6 + (Math.round(x * 7) % 5)) bx(bag, 'granite_block', x, y, az - w - 0.1, x + 0.9, y + h + 0.02, az + w + 0.1);
  } else {
    bx(bag, 'silt', ax - w, y, az, ax + w, y + 0.012, cz);
    bx(bag, 'granite_grey', ax - w - 0.1, y, az, ax - w, y + h, cz); bx(bag, 'granite_grey', ax + w, y, az, ax + w + 0.1, y + h, cz);
    for (let z = az + 3; z < cz - 1; z += 6 + (Math.round(z * 7) % 5)) bx(bag, 'granite_block', ax - w - 0.1, y, z, ax + w + 0.1, y + h + 0.02, z + 0.9);
  }
}

/** veg_bed: { rect, y, rows, seed } — ridges of earth with a green crop (daikon, greens, millet) in rows along the long side. */
function vegBed(el, { bag }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, r = rng(el.seed || 1), alongX = x1 - x0 > z1 - z0, crop = ['sod', 'cloth_green', 'flax_leaf', 'sod'][Math.floor(r() * 4)];
  const n = Math.max(2, Math.round((alongX ? z1 - z0 : x1 - x0) / 0.7));
  for (let k = 0; k < n; k++) {
    const f = (k + 0.5) / n, c = alongX ? z0 + (z1 - z0) * f : x0 + (x1 - x0) * f, hw = 0.2, hgt = 0.12 + r() * 0.04;
    if (alongX) { bx(bag, 'silt', x0, y, c - hw, x1, y + 0.09, c + hw); bx(bag, crop, x0 + 0.05, y + 0.09, c - hw * 0.7, x1 - 0.05, y + 0.09 + hgt, c + hw * 0.7); }
    else { bx(bag, 'silt', c - hw, y, z0, c + hw, y + 0.09, z1); bx(bag, crop, c - hw * 0.7, y + 0.09, z0 + 0.05, c + hw * 0.7, y + 0.09 + hgt, z1 - 0.05); }
  }
}

/** stream_steps: { at: [x, z], side ('w' | 'e'), top, level } — three broad stone steps down the wall of the stream to the water. */
function streamSteps(el, { bag }) {
  const [x, z] = el.at, s = el.side === 'e' ? -1 : 1, top = el.top ?? 0.15, lv = el.level ?? -0.55, hw = el.w ?? 1.3;
  for (let k = 0; k < 3; k++) { const t = top - (top - lv) * k / 3; bx(bag, 'granite_block', Math.min(x + s * k * 0.65, x + s * (k + 1) * 0.65), t - 0.5, z - hw, Math.max(x + s * k * 0.65, x + s * (k + 1) * 0.65), t, z + hw); }
}

/** stone_group: { at, y, seed, n, k } — a few weathered stones set together (a garden's, an islet's), the tallest a hand-span out of the rest. */
function stoneGroup(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, r = rng(el.seed || 1), n = el.n ?? 3, k = el.k ?? 1;
  for (let i = 0; i < n; i++) {
    const a = r() * 6.28, d = i ? 0.5 + r() * 0.7 : 0, h = (0.5 + r() * 0.7) * k * (i ? 0.7 : 1.2), rad = (0.3 + r() * 0.3) * k;
    bag.add(i % 2 ? 'granite_grey' : 'rock_boulder', lathe([[0.001, -0.1], [rad, -0.1], [rad * 1.05, h * 0.35], [rad * 0.8, h * 0.8], [rad * 0.4, h], [0.001, h * 1.02]], 7, null, x + Math.cos(a) * d * k, y, z + Math.sin(a) * d * k).scale(1, 1, 0.8));
  }
  col.circle(x, z, 0.8 * k, y, y + 1.2 * k);
}

/** shoro: { at, y } — the bell tower of a temple: a stone footing, four posts with tie beams, a hipped roof of bark, the bronze bell hung from the beam. */
function shoro(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, h = 2.9, a = 1.25, T = (m, t) => bag.add(m, fromTri(t));
  bx(bag, 'granite_block', x - a - 0.5, y, z - a - 0.5, x + a + 0.5, y + 0.4, z + a + 0.5);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { bx(bag, 'granite_block', x + sx * a - 0.2, y + 0.4, z + sz * a - 0.2, x + sx * a + 0.2, y + 0.55, z + sz * a + 0.2); bx(bag, WD, x + sx * a - 0.1, y + 0.55, z + sz * a - 0.1, x + sx * a + 0.1, y + 0.4 + h, z + sz * a + 0.1); }
  for (const yy of [y + 0.9, y + h + 0.1]) { bx(bag, WD, x - a - 0.1, yy, z - a - 0.07, x + a + 0.1, yy + 0.18, z - a + 0.07); bx(bag, WD, x - a - 0.1, yy, z + a - 0.07, x + a + 0.1, yy + 0.18, z + a + 0.07); bx(bag, WD, x - a - 0.07, yy, z - a, x - a + 0.07, yy + 0.18, z + a); bx(bag, WD, x + a - 0.07, yy, z - a, x + a + 0.07, yy + 0.18, z + a); }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) for (const [p, q] of [[0.1, 0.5]]) bx(bag, WD, x + sx * (a - 0.1 - q), y + h - 0.2, z + sz * a - 0.04, x + sx * (a - 0.1 - p), y + h + 0.1, z + sz * a + 0.04);
  bx(bag, WD, x - 0.05, y + h - 0.1, z - a, x + 0.05, y + h + 0.1, z + a);
  bag.add('bronze', lathe([[0.001, 0], [0.34, 0.05], [0.4, 0.2], [0.42, 0.6], [0.4, 0.95], [0.37, 1.05], [0.001, 1.07]], 14, null, x, y + h - 1.05, z));
  bx(bag, WD, x + 0.3, y + h - 1.1, z + a * 0.0, x + 1.0, y + h - 1.08, z + 0.05);
  const ctx = { bag, col }; void ctx;
  const tris = [], und = [];
  const e = a + 1.1, yE = y + h + 0.45, yR = y + h + 1.9;
  const P = (px, py, pz) => [x + px, py, z + pz];
  quad2(tris, P(-e, yE, e), P(e, yE, e), P(0.001, yR, 0.001), P(0.001, yR, 0.001)); quad2(tris, P(e, yE, e), P(e, yE, -e), P(0.001, yR, 0.001), P(0.001, yR, 0.001));
  quad2(tris, P(e, yE, -e), P(-e, yE, -e), P(0.001, yR, 0.001), P(0.001, yR, 0.001)); quad2(tris, P(-e, yE, -e), P(-e, yE, e), P(0.001, yR, 0.001), P(0.001, yR, 0.001));
  quad2(und, P(-e, yE - 0.2, e), P(e, yE - 0.2, e), P(e, yE - 0.2, -e), P(-e, yE - 0.2, -e));
  bag.add(BARK, fromTri(tris)); bag.add(TM, fromTri(und));
  col.rect([x - a - 0.2, z - a - 0.2, x + a + 0.2, z + a + 0.2], y, y + h + 1);
}
import { fromTriangles as fromTri } from '../../core/geom.js';

/** woodshed: { at, y, rot } — a lean-to of planks against a wall, firewood stacked in it, a bundle of kindling at the side. */
function woodshed(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, c = Math.cos(el.rot ?? 0), s = Math.sin(el.rot ?? 0), P = (u, v) => [x + u * c + v * s, z - u * s + v * c];
  const box2 = (m, u0, y0, v0, u1, y1, v1) => { const a = P(u0, v0), b = P(u1, v1); bx(bag, m, a[0], y + y0, a[1], b[0], y + y1, b[1]); };
  for (const u of [-1.1, 1.1]) { box2(WD, u - 0.05, 0, 0.8, u + 0.05, 1.9, 0.9); box2(WD, u - 0.05, 0, -0.1, u + 0.05, 2.3, 0); }
  box2('planks_grey', -1.2, 1.9, -0.1, 1.2, 2.0, 1.0); box2('timber', -1.2, 1.85, -0.1, 1.2, 1.9, 1.0);
  for (let r = 0; r < 4; r++) for (let k = 0; k < 14; k++) box2('bark_pine', -1.0 + k * 0.15, r * 0.2, 0.05, -0.88 + k * 0.15, r * 0.2 + 0.17, 0.75);
  const a = P(-1.2, -0.1), b = P(1.2, 1.0); col.rect([Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])], y, y + 2.2);
}

/** drying_rack: { at, y, rot, len, cloth } — a frame of poles for hanging cloth or sheaves of rice to dry, the cloths hung along it. */
function dryingRack(el, { bag }) {
  const [x, z] = el.at, y = el.y ?? 0, c = Math.cos(el.rot ?? 0), s = Math.sin(el.rot ?? 0), L = el.len ?? 4, r = rng(el.seed || 1);
  const P = (u, v) => [x + u * c + v * s, z - u * s + v * c], box2 = (m, u0, y0, v0, u1, y1, v1) => { const a = P(u0, v0), b = P(u1, v1); bx(bag, m, a[0], y + y0, a[1], b[0], y + y1, b[1]); };
  for (let u = -L / 2; u <= L / 2 + 0.01; u += L / 2) box2('bamboo_culm', u - 0.04, 0, -0.04, u + 0.04, 2.2, 0.04);
  for (const yy of [1.5, 2.1]) box2('bamboo_culm', -L / 2, yy, -0.03, L / 2, yy + 0.06, 0.03);
  const cols = el.cloth ? [el.cloth, 'cloth_white'] : ['thatch', 'thatch'];
  for (let u = -L / 2 + 0.2; u < L / 2 - 0.3; u += 0.55) box2(el.cloth ? cols[Math.floor(r() * 2)] : 'thatch', u, 1.5 - (el.cloth ? 1.0 + r() * 0.3 : 0.45), -0.05, u + 0.4, 1.5, 0.05);
}
export const streetElements = { gutter, veg_bed: vegBed, stream_steps: streamSteps, stone_group: stoneGroup, shoro, woodshed, drying_rack: dryingRack };
void eaveRing;
