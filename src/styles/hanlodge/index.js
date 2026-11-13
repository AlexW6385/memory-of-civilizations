// The service quarters of Han Chang'an's Weiyang Palace below the terrace (docs/settlements/han-changan.md §6c): the clerks', guards' and
// stewards' houses that a visitor walks into. The wards' houses (src/styles/han/houses.js, read-only here) are walled blocks with a prop-hall;
// these are the same houses built to be entered: the hall has a doorway, a floor and a ceiling and a household in it. Four fronts:
//   court  — a walled yard behind a gatehouse, the hall across the yard, a granary on posts, a side wing sometimes;
//   row    — the hall itself on the lane, its door in the front wall, a short yard behind;
//   shop   — the hall's front open between posts under a tiled awning, a counter on the lane (the stewards' stores);
//   lou    — a hall with a second storey over its back half, a red balcony, a hipped upper roof.
// Built in a lot's frame (u along the lane, v into the lot; han/kit.js lotFrame). The Han kit, interiors and dress are used read-only.
import { registerStyle } from '../../core/build.js';
import { box, lathe } from '../../core/geom.js';
import '../han/index.js';
import { rng, lotFrame, eaveTilesGable } from '../han/kit.js';
import { furnish, KINDS } from '../han/interiors.js';
import { frontDress, yardDress } from '../han/dress.js';

const WALLS = ['earth_wall', 'lime_plaster', 'mud_plaster', 'earth_wall', 'lime_plaster'];

function perimeter(F, W, D, h, gateU, gateW, wm, noFront = false) {
  const t = 0.5, cap = (u0, v0, u1, v1) => F.b('tile_grey', u0, h, v0, u1, h + 0.28, v1, false);
  F.b(wm, 0, 0, D - t, W, h, D); F.b(wm, 0, 0, noFront ? 0.2 : t, t, h, D - t); F.b(wm, W - t, 0, noFront ? 0.2 : t, W, h, D - t);
  cap(-0.1, D - t - 0.1, W + 0.1, D + 0.1); cap(-0.1, noFront ? 0.2 : t, t + 0.1, D - t); cap(W - t - 0.1, noFront ? 0.2 : t, W + 0.1, D - t);
  if (noFront) return;
  F.b(wm, 0, 0, 0, gateU - gateW / 2, h, t); F.b(wm, gateU + gateW / 2, 0, 0, W, h, t);
  cap(-0.1, -0.1, gateU - gateW / 2, t + 0.1); cap(gateU + gateW / 2, -0.1, W + 0.1, t + 0.1);
  // the gate: two posts, a lintel, a small tiled roof, the leaves left open
  F.b('timber_red', gateU - gateW / 2 - 0.2, 0, -0.1, gateU - gateW / 2 + 0.1, h + 0.7, t + 0.1); F.b('timber_red', gateU + gateW / 2 - 0.1, 0, -0.1, gateU + gateW / 2 + 0.2, h + 0.7, t + 0.1);
  F.b('timber_red', gateU - gateW / 2 - 0.2, h + 0.3, -0.12, gateU + gateW / 2 + 0.2, h + 0.7, t + 0.12, false);
  F.b('lacquer_black', gateU - gateW / 2 + 0.1, 0, -0.25, gateU - gateW / 2 + 0.2, h - 0.25, 0.9, false);
  F.roof('gable_roof_c', gateU, t / 2, gateW / 2 + 1.0, 1.7, h + 0.72, 1.5, { mat: 'tile_grey', soffit: 'timber_red', noHorns: true });
}

/**
 * An enterable hall: walls on a low platform, a doorway of width dw in the front wall (v0) at u = du (a shop's is the whole front between posts),
 * lattice windows, a ceiling at H - 0.3 (so the eaves over the platform's kerb do not shut the doorway), a gabled or hipped tile roof.
 * Returns the door's u.
 */
function hall(F, u0, u1, v0, v1, H, wm, o, rand) {
  const w = u1 - u0, t = 0.4, P = 0.3, dw = o.dw ?? 1.7, du = o.du ?? u0 + w * (0.4 + rand() * 0.2);
  F.b('brick_paving', u0 - 0.5, 0, v0 - 0.9, u1 + 0.5, P, v1 + 0.2, false);
  F.floor(u0 - 0.5, v0 - 0.9, u1 + 0.5, v1 + 0.2, P);
  F.b('wood_dark', u0 + t, P, v0 + t, u1 - t, P + 0.03, v1 - t, false);
  F.b(wm, u0, P, v1 - t, u1, H, v1); F.b(wm, u0, P, v0, u0 + t, H, v1); F.b(wm, u1 - t, P, v0, u1, H, v1);
  if (o.open) {
    // the shop: the front is a row of posts and a header, a shutter folded back at each end, the counter outside the middle
    F.b(wm, u0, P, v0, du - dw / 2, H, v0 + t); F.b(wm, du + dw / 2, P, v0, u1, H, v0 + t); F.b(wm, du - dw / 2, P + 2.2, v0, du + dw / 2, H, v0 + t);
    F.b('timber_red', du - dw / 2 - 0.1, P, v0 - 0.05, du - dw / 2 + 0.06, P + 2.2, v0 + t + 0.05, false); F.b('timber_red', du + dw / 2 - 0.06, P, v0 - 0.05, du + dw / 2 + 0.1, P + 2.2, v0 + t + 0.05, false);
  } else {
    F.b(wm, u0, P, v0, du - dw / 2, H, v0 + t); F.b(wm, du + dw / 2, P, v0, u1, H, v0 + t); F.b(wm, du - dw / 2, P + 2.2, v0, du + dw / 2, H, v0 + t);
    F.b('timber_red', du - dw / 2 - 0.1, P, v0 - 0.05, du - dw / 2 + 0.06, P + 2.2, v0 + t + 0.05, false); F.b('timber_red', du + dw / 2 - 0.06, P, v0 - 0.05, du + dw / 2 + 0.1, P + 2.2, v0 + t + 0.05, false);
    F.b('lacquer_black', du - dw / 2 + 0.05, P, v0 + 0.05, du - dw / 2 + 0.1, P + 2.1, v0 + 0.9, false);
  }
  const win = (u, v, alongU, len) => (alongU ? F.b('lattice', u - len / 2, P + 1.0, v - 0.04, u + len / 2, P + 2.1, v + 0.04, false) : F.b('lattice', u - 0.04, P + 1.0, v - len / 2, u + 0.04, P + 2.1, v + len / 2, false));
  for (const uu of [u0 + w * 0.18, u1 - w * 0.18]) if (Math.abs(uu - du) > dw / 2 + 0.8) win(uu, v0 - 0.01, true, 1.4);
  win(u0 - 0.01, (v0 + v1) / 2, false, 1.4); win(u1 + 0.01, (v0 + v1) / 2, false, 1.4);
  for (const uu of [u0 + 0.12, u0 + w / 3, u0 + 2 * w / 3, u1 - 0.12]) if (Math.abs(uu - du) > dw / 2 + 0.3) F.b('timber_red', uu - 0.14, P, v0 - 0.2, uu + 0.14, H, v0 + 0.08, false);
  F.b('timber_red', u0, H - 0.4, v0 - 0.22, u1, H, v0 + 0.08, false);
  // the ceiling under the roof: a slab over the room (a face above the head, so the eave over the kerb is not a shell)
  F.b(wm, u0 + t, H - 0.3, v0 + t, u1 - t, H - 0.1, v1 - t, false);
  F.col.floor(F.R(u0 + t, v0 + t, u1 - t, v1 - t), H - 0.1);
  const ov = o.ov ?? 1.1, A = w / 2 + 0.9, B = (v1 - v0) / 2 + ov;
  if (o.hip) F.roof('hip_roof', (u0 + u1) / 2, (v0 + v1) / 2, A, B, H + 0.1, 1.6 + B * 0.1, { mat: o.tile ?? 'tile_grey', soffit: 'timber_red', noChiwei: true, lift: 0.3, pow: 1.1 });
  else {
    const el = F.roof('gable_roof_c', (u0 + u1) / 2, (v0 + v1) / 2, A, B, H + 0.1, 1.7 + B * 0.12, { mat: o.tile ?? 'tile_grey', soffit: 'timber_red', noHorns: true });
    if (el.alongZ === false || el.alongZ === undefined) { const c = el.c; eaveTilesGable(F.bag, c[0], c[1], el.A, el.B, H + 0.1); }
  }
  return du;
}

/** hanl_house: { rect, front, kind ('court' | 'row' | 'shop' | 'lou'), seed } — a house of the service quarters, its hall enterable and lit. */
function house(el, ctx) {
  const rand = rng(el.seed), F = lotFrame(ctx, el.rect, el.front), W = F.W, D = F.D, wm = WALLS[el.seed % WALLS.length], kind = el.kind, H = 3.3 + rand() * 0.3;
  const gateU = Math.max(1.8, Math.min(W - 1.8, W * (0.25 + 0.5 * rand()))), room = KINDS[(el.seed >> 3) % KINDS.length];
  if (kind === 'court') {
    perimeter(F, W, D, 2.5, gateU, 1.8, wm);
    frontDress(F, W, D, gateU, 1.8, 2.5, el.seed, 'court');
    const hv = D - 7.8;
    hall(F, 1.0, W - 1.0, hv, D - 0.9, H, wm, {}, rand);
    furnish(F, room, 1.4, W - 1.4, hv + 0.4, D - 1.3, 0.33, el.seed, ctx.lights, true);
    yardDress(F, W, D, hv, el.seed);
    if (rand() < 0.75) {
      const left = rand() < 0.5, u0 = left ? 0.8 : W - 4.2, u1 = left ? 4.2 : W - 0.8, v0 = 3.4, v1 = hv - 1.6, Hw = H - 0.5, t = 0.4, Pw = 0.25;
      F.b('brick_paving', u0 - 0.3, 0, v0 - 0.3, u1 + 0.3, Pw, v1 + 0.3, false);
      F.b(wm, u0, Pw, v0, u1, Hw, v0 + t); F.b(wm, u0, Pw, v1 - t, u1, Hw, v1); F.b(wm, u0, Pw, v0, u0 + t, Hw, v1); F.b(wm, u1 - t, Pw, v0 + t, u1, Hw, v1 - t);
      F.b('lattice', u0 + 0.5, Pw + 1.0, v0 + t - 0.06, u1 - 0.5, Pw + 2.0, v0 + t + 0.02, false);
      F.roof('gable_roof_c', (u0 + u1) / 2, (v0 + v1) / 2, (u1 - u0) / 2 + 0.7, (v1 - v0) / 2 + 0.9, Hw + 0.05, 1.4, { mat: 'tile_grey', soffit: 'timber_red', noHorns: true });
    }
    F.b('bluestone', W / 2 - 0.6, 0, hv - 3.4, W / 2 + 0.6, 0.6, hv - 2.2);
    return;
  }
  if (kind === 'row') {
    perimeter(F, W, D, 2.3, gateU, 1.7, wm, true);
    const hv = 1.4;
    hall(F, 0.5, W - 0.5, hv, hv + 6.4, H - 0.2, wm, {}, rand);
    furnish(F, room, 0.9, W - 0.9, hv + 0.4, hv + 6.0, 0.33, el.seed, ctx.lights, true);
    frontDress(F, W, D, gateU, 1.7, 2.3, el.seed, 'row');
    yardDress(F, W, D, hv + 6.4, el.seed);
    F.b('bluestone', W - 2.6, 0, D - 3.2, W - 0.9, 0.6, D - 1.5);
    F.b('timber', 0.8, 0, D - 2.8, 2.6, 0.5, D - 0.8, false);
    return;
  }
  if (kind === 'shop') {
    // the stewards' store: the hall on the lane, hip-roofed, its front open under a deep awning, a counter and the goods before it
    perimeter(F, W, D, 2.3, gateU, 1.7, wm, true);
    const hv = 1.8, du = W / 2, dw = Math.min(3.4, W - 3.6);
    hall(F, 0.5, W - 0.5, hv, hv + 6.0, H - 0.1, wm, { open: true, dw, du, hip: true, ov: 1.6, tile: 'tile_dark' }, rand);
    F.b('lacquer_black', du - dw / 2 + 0.1, 0.3, hv - 0.55, du + dw / 2 - 0.1, 1.0, hv - 0.2, false);
    F.b('lacquer_red', du - dw / 2 + 0.05, 1.0, hv - 0.6, du + dw / 2 - 0.05, 1.06, hv - 0.15, false);
    furnish(F, room === 'dwelling' || room === 'scholar' ? 'granary' : room, 0.9, W - 0.9, hv + 0.4, hv + 5.6, 0.33, el.seed, ctx.lights, true);
    for (let k = 0; k < 3; k++) { const p = F.pt(0.9 + k * 0.5 + (k & 1) * 0.1, hv - 0.9); ctx.bag.add('sacking', lathe([[0.001, 0], [0.28, 0.04], [0.32, 0.26], [0.2, 0.55], [0.001, 0.6]], 7, null, p[0], 0.3, p[1])); }
    yardDress(F, W, D, hv + 6.0, el.seed);
    return;
  }
  // lou: the hall with a second storey over its back half (not entered), a balcony of red rails under the upper eave
  perimeter(F, W, D, 2.4, gateU, 1.8, wm);
  frontDress(F, W, D, gateU, 1.8, 2.4, el.seed, 'court');
  const hv = D - 8.2, P = 0.3, hb = hv + 3.4;
  hall(F, 1.0, W - 1.0, hv, D - 0.9, H, wm, { hip: false }, rand);
  furnish(F, room, 1.4, W - 1.4, hv + 0.4, D - 1.3, 0.33, el.seed, ctx.lights, true);
  const y2 = H + 0.5, b0 = 2.4, b1 = W - 2.4;
  F.b('timber_red', b0 - 0.1, y2, hb - 0.1, b1 + 0.1, y2 + 0.18, D - 1.6 + 0.1, false);
  F.b(wm, b0, y2 + 0.18, hb, b1, y2 + 0.18 + 2.6, D - 1.6);
  F.b('lattice', b0 + 0.6, y2 + 1.2, hb - 0.05, b1 - 0.6, y2 + 2.3, hb + 0.03, false);
  for (let k = 0; k <= 8; k++) { const u = b0 + (b1 - b0) * k / 8; F.b('timber_red', u - 0.05, y2 + 0.18, hb - 0.55, u + 0.05, y2 + 1.1, hb - 0.45, false); }
  F.b('timber_red', b0, y2 + 1.1, hb - 0.6, b1, y2 + 1.2, hb - 0.4, false);
  F.roof('hip_roof', (b0 + b1) / 2, (hb + D - 1.6) / 2, (b1 - b0) / 2 + 1.1, (D - 1.6 - hb) / 2 + 1.1, y2 + 0.18 + 2.6, 1.8, { mat: 'tile_grey', soffit: 'timber_red', noChiwei: true, lift: 0.3, pow: 1.1 });
  yardDress(F, W, D, hv, el.seed);
  void P; void box;
}

registerStyle('hanlodge', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { hanl_house: house },
  objects: {},
});
