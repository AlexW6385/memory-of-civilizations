// The houses of the wards (docs/settlements/han-changan.md §5, §6): rammed-earth walls under a tile cap round the lot, a little gatehouse
// on the lane, a yard, and the buildings of the Han tomb models — the hall (tang) of three bays under a gabled tile roof, a side
// wing, the watch-tower house (lou) of two storeys with its hipped roof, the granary. In a lot's frame u runs along the lane and v
// from the lane into the lot (the front is the side the door is on). Four kinds: court, row, tower, and the office (shu) of the avenue.
import { box, lathe } from '../../core/geom.js';
import { rng, lotFrame, eaveTilesGable, roofs } from './kit.js';
import { furnish, KINDS } from './interiors.js';
import { frontDress, yardDress } from './dress.js';

const WALLS = ['earth_wall', 'earth_wall', 'lime_plaster', 'mud_plaster', 'earth_wall'];

function perimeter(F, W, D, h, gateU, gateW, wm, noFront = false) {
  const t = 0.5;
  if (noFront) {
    F.b(wm, 0, 0, D - t, W, h, D); F.b(wm, 0, 0, 0.2, t, h, D - t); F.b(wm, W - t, 0, 0.2, W, h, D - t);
    F.b('tile_grey', -0.1, h, D - t - 0.1, W + 0.1, h + 0.28, D + 0.1, false); F.b('tile_grey', -0.1, h, 0.2, t + 0.1, h + 0.28, D - t, false); F.b('tile_grey', W - t - 0.1, h, 0.2, W + 0.1, h + 0.28, D - t, false);
    return;
  }
  F.b(wm, 0, 0, 0, gateU - gateW / 2, h, t); F.b(wm, gateU + gateW / 2, 0, 0, W, h, t);
  F.b(wm, 0, 0, D - t, W, h, D); F.b(wm, 0, 0, t, t, h, D - t); F.b(wm, W - t, 0, t, W, h, D - t);
  const cap = (u0, v0, u1, v1) => F.b('tile_grey', u0, h, v0, u1, h + 0.28, v1, false);
  cap(-0.1, -0.1, gateU - gateW / 2, t + 0.1); cap(gateU + gateW / 2, -0.1, W + 0.1, t + 0.1); cap(-0.1, D - t - 0.1, W + 0.1, D + 0.1); cap(-0.1, t, t + 0.1, D - t); cap(W - t - 0.1, t, W + 0.1, D - t);
  // the gate: two posts, a lintel, a small tiled roof, the leaves left open
  F.b('timber_red', gateU - gateW / 2 - 0.2, 0, -0.1, gateU - gateW / 2 + 0.1, h + 0.7, t + 0.1); F.b('timber_red', gateU + gateW / 2 - 0.1, 0, -0.1, gateU + gateW / 2 + 0.2, h + 0.7, t + 0.1);
  F.b('timber_red', gateU - gateW / 2 - 0.2, h + 0.3, -0.12, gateU + gateW / 2 + 0.2, h + 0.7, t + 0.12, false);
  F.b('lacquer_black', gateU - gateW / 2 + 0.1, 0, -0.25, gateU - gateW / 2 + 0.2, h - 0.25, 0.9, false);
  F.roof('gable_roof_c', gateU, t / 2, gateW / 2 + 1.0, 1.7, h + 0.72, 1.5, { mat: 'tile_grey', soffit: 'timber_red', noHorns: true });
}

/** A hall of three bays: plaster walls on a low platform, a door and lattice windows on the front (v0), a gabled roof with the ridge along u. */
function hallBlock(F, u0, u1, v0, v1, H, wm, door, open, rand) {
  const w = u1 - u0, t = 0.4, P = 0.3, doorW = 1.7, du = u0 + w * (0.4 + rand() * 0.2);
  F.b('brick_paving', u0 - 0.5, 0, v0 - 0.9, u1 + 0.5, P, v1 + 0.2, false);
  F.floor(u0 - 0.5, v0 - 0.9, u1 + 0.5, v1 + 0.2, P);
  F.b('wood_dark', u0 + t, P, v0 + t, u1 - t, P + 0.03, v1 - t, false);
  // the walls: back, the two sides, the front with its door
  F.b(wm, u0, P, v1 - t, u1, H, v1); F.b(wm, u0, P, v0, u0 + t, H, v1); F.b(wm, u1 - t, P, v0, u1, H, v1);
  if (door) {
    F.b(wm, u0, P, v0, du - doorW / 2, H, v0 + t); F.b(wm, du + doorW / 2, P, v0, u1, H, v0 + t); F.b(wm, du - doorW / 2, P + 2.2, v0, du + doorW / 2, H, v0 + t);
    F.b('timber_red', du - doorW / 2 - 0.1, P, v0 - 0.05, du - doorW / 2 + 0.06, P + 2.2, v0 + t + 0.05, false); F.b('timber_red', du + doorW / 2 - 0.06, P, v0 - 0.05, du + doorW / 2 + 0.1, P + 2.2, v0 + t + 0.05, false);
    F.b('lacquer_black', du - doorW / 2 + 0.05, P, v0 + 0.05, du - doorW / 2 + 0.1 + (open ? 0 : 0.8), P + 2.1, v0 + 0.1 + (open ? 0.8 : 0), false);
  } else F.b(wm, u0, P, v0, u1, H, v0 + t);
  // lattice windows between the posts on the front and the sides
  const win = (u, v, alongU, len) => (alongU ? F.b('lattice', u - len / 2, P + 1.0, v - 0.04, u + len / 2, P + 2.1, v + 0.04, false) : F.b('lattice', u - 0.04, P + 1.0, v - len / 2, u + 0.04, P + 2.1, v + len / 2, false));
  for (const uu of [u0 + w * 0.18, u1 - w * 0.18]) if (Math.abs(uu - du) > 1.7) win(uu, v0 - 0.01, true, 1.4);
  win(u0 - 0.01, (v0 + v1) / 2, false, 1.4); win(u1 + 0.01, (v0 + v1) / 2, false, 1.4);
  // the posts and architrave showing under the eave on the front, the timber frame's red
  for (const uu of [u0 + 0.12, u0 + w / 3, u0 + 2 * w / 3, u1 - 0.12]) F.b('timber_red', uu - 0.14, P, v0 - 0.2, uu + 0.14, H, v0 + 0.08, false);
  F.b('timber_red', u0, H - 0.4, v0 - 0.22, u1, H, v0 + 0.08, false);
  const ov = 1.1, A = w / 2 + 0.9, B = (v1 - v0) / 2 + ov, el = F.roof('gable_roof_c', (u0 + u1) / 2, (v0 + v1) / 2, A, B, H + 0.1, 1.7 + B * 0.12, { mat: 'tile_grey', soffit: 'timber_red', noHorns: true });
  if (el.alongZ === false || el.alongZ === undefined) { const c = el.c; eaveTilesGable(F.bag, c[0], c[1], el.A, el.B, H + 0.1); }
  F.col.rect(F.R(u0, v0, u1, v1), P, H);
  return du;
}
function sideWing(F, u0, u1, v0, v1, H, wm) {
  const t = 0.4, P = 0.25;
  F.b('brick_paving', u0 - 0.3, 0, v0 - 0.3, u1 + 0.3, P, v1 + 0.3, false);
  F.b(wm, u0, P, v0, u1, H, v0 + t); F.b(wm, u0, P, v1 - t, u1, H, v1); F.b(wm, u0, P, v0, u0 + t, H, v1); F.b(wm, u1 - t, P, v0 + t, u1, H, v1 - t);
  F.b('lattice', u0 + 0.5, P + 1.0, v0 + t - 0.06, u1 - 0.5, P + 2.0, v0 + t + 0.02, false);
  F.roof('gable_roof_c', (u0 + u1) / 2, (v0 + v1) / 2, (u1 - u0) / 2 + 0.7, (v1 - v0) / 2 + 0.9, H + 0.05, 1.4, { mat: 'tile_grey', soffit: 'timber_red', noHorns: true });
}
/** The two-storey watch-tower house (lou): plaster walls, a balcony of red rails under the upper eave, a hipped roof over a smaller upper storey. */
function louBlock(F, cu, cv, a, H1, H2, wm, seed = 1, lights = []) {
  const P = 0.3, t = 0.4, dw = 0.8;
  F.b('brick_paving', cu - a - 0.4, 0, cv - a - 0.4, cu + a + 0.4, P, cv + a + 0.4, false);
  F.floor(cu - a, cv - a, cu + a, cv + a, P);
  // the ground floor is a room: walls round it, a door in the front (toward the lane), a slab over it
  F.b(wm, cu - a, P, cv + a - t, cu + a, P + H1 - 0.3, cv + a); F.b(wm, cu - a, P, cv - a, cu - a + t, P + H1 - 0.3, cv + a); F.b(wm, cu + a - t, P, cv - a, cu + a, P + H1 - 0.3, cv + a);
  F.b(wm, cu - a, P, cv - a, cu - dw, P + H1 - 0.3, cv - a + t); F.b(wm, cu + dw, P, cv - a, cu + a, P + H1 - 0.3, cv - a + t); F.b(wm, cu - dw, P + 2.3, cv - a, cu + dw, P + H1 - 0.3, cv - a + t);
  F.b('timber_red', cu - dw - 0.1, P, cv - a - 0.05, cu - dw + 0.07, P + 2.3, cv - a + t + 0.05, false); F.b('timber_red', cu + dw - 0.07, P, cv - a - 0.05, cu + dw + 0.1, P + 2.3, cv - a + t + 0.05, false);
  F.b('wood_dark', cu - a + t, P, cv - a + t, cu + a - t, P + 0.03, cv + a - t, false);
  F.b(wm, cu - a, P + H1 - 0.3, cv - a, cu + a, P + H1, cv + a);
  furnish(F, 'granary', cu - a + t + 0.2, cu + a - t - 0.2, cv - a + t + 0.2, cv + a - t - 0.2, P + 0.03, seed + 9, lights, false);
  F.b('lime_plaster', cu - a - 0.03, P, cv - a - 0.03, cu + a + 0.03, P + 0.8, cv + a + 0.03, false);
  F.b('lattice', cu - a * 0.4, P + 1.2, cv - a - 0.05, cu + a * 0.4, P + 2.5, cv - a + 0.03, false);
  F.roof('hip_roof', cu, cv, a + 1.1, a + 1.1, P + H1, 1.1, { mat: 'tile_grey', soffit: 'timber_red', noChiwei: true, lift: 0.3, pow: 1.1 });
  const y2 = P + H1 + 0.5, b = a * 0.74;
  F.b('timber_red', cu - b - 0.1, y2, cv - b - 0.1, cu + b + 0.1, y2 + 0.18, cv + b + 0.1, false);
  F.b(wm, cu - b, y2 + 0.18, cv - b, cu + b, y2 + 0.18 + H2, cv + b);
  F.b('lattice', cu - b * 0.5, y2 + 1.1, cv - b - 0.05, cu + b * 0.5, y2 + 2.1, cv - b + 0.03, false);
  F.b('lattice', cu - b - 0.05, y2 + 1.1, cv - b * 0.5, cu - b + 0.03, y2 + 2.1, cv + b * 0.5, false);
  F.roof('hip_roof', cu, cv, b + 1.3, b + 1.3, y2 + 0.18 + H2, 2.0, { mat: 'tile_grey', soffit: 'timber_red', noChiwei: true, lift: 0.4, pow: 1.15 });
  F.b('tile_dark', cu - 0.22, y2 + 0.18 + H2 + 1.95, cv - 0.22, cu + 0.22, y2 + 0.18 + H2 + 2.7, cv + 0.22, false);
}

/** han_house: { rect, front, kind ('court' | 'row' | 'tower'), seed, open } */
export function house(el, ctx) {
  const rand = rng(el.seed), F = lotFrame(ctx, el.rect, el.front), W = F.W, D = F.D, wm = WALLS[Math.floor(rand() * WALLS.length)], H = 3.3 + rand() * 0.3;
  const gateU = Math.max(1.6, Math.min(W - 1.6, W * (0.25 + 0.5 * rand()))), kind = el.kind;
  if (kind === 'row') {
    // a single hall on the lane's side with a short yard behind: the poorer house
    perimeter(F, W, D, 2.3, gateU, 1.7, wm, true);
    const hv = 1.4;
    const du = hallBlock(F, 0.5, W - 0.5, hv, hv + 6.4, H - 0.2, wm, true, el.open, rand);
    furnish(F, KINDS[(el.seed >> 3) % KINDS.length], 0.9, W - 0.9, hv + 0.4, hv + 6.0, 0.33, el.seed, ctx.lights, el.open);
    frontDress(F, W, D, gateU, 1.7, 2.3, el.seed, 'row');
    yardDress(F, W, D, hv + 6.4, el.seed);
    // a granary on posts, a well-curb and a mortar in the yard
    F.b('bluestone', W - 2.6, 0, D - 3.2, W - 0.9, 0.6, D - 1.5);
    F.b('timber', 0.8, 0, D - 2.8, 2.6, 0.5, D - 0.8, false);
    void du;
    return;
  }
  perimeter(F, W, D, 2.5, gateU, 1.8, wm);
  frontDress(F, W, D, gateU, 1.8, 2.5, el.seed, kind);
  if (kind === 'tower') {
    const a = Math.min(2.8, (W - 3.4) / 2);
    louBlock(F, W - a - 1.0, 5.6 + a, a, 3.4, 3.0, wm, el.seed, ctx.lights);
    const hu1 = Math.max(5.5, W - 2 * a - 3.0);
    hallBlock(F, 1.0, hu1, D - 7.0, D - 0.9, H - 0.2, wm, true, el.open, rand);
    furnish(F, KINDS[(el.seed >> 3) % KINDS.length], 1.4, hu1 - 0.4, D - 6.6, D - 1.3, 0.33, el.seed, ctx.lights, el.open);
    F.b('bluestone', 1.2, 0, 1.5, 2.8, 0.5, 3.1);
    yardDress(F, W, D, D - 7.4, el.seed);
    return;
  }
  // the court house: the hall at the back across the yard, a wing along one side, a well
  const hallV0 = D - 7.8;
  hallBlock(F, 1.0, W - 1.0, hallV0, D - 0.9, H, wm, true, el.open, rand);
  furnish(F, KINDS[(el.seed >> 3) % KINDS.length], 1.4, W - 1.4, hallV0 + 0.4, D - 1.3, 0.33, el.seed, ctx.lights, el.open);
  yardDress(F, W, D, hallV0, el.seed);
  if (rand() < 0.75) { const left = rand() < 0.5; sideWing(F, left ? 0.8 : W - 4.2, left ? 4.2 : W - 0.8, 3.4, hallV0 - 1.6, H - 0.5, wm); }
  F.b('bluestone', W / 2 - 0.6 + (rand() - 0.5) * 2, 0, hallV0 - 3.4, W / 2 + 0.6 + (rand() - 0.5) * 2, 0.6, hallV0 - 2.2);
}

/** han_office: { rect, seed } — an office (shu) on the great avenue: a walled compound with its gate on the south and a hall with a desk and shelves (open). */
export function office(el, ctx) {
  const [x0, z0, x1, z1] = el.rect, rand = rng(el.seed), W = x1 - x0, cx = (x0 + x1) / 2;
  const F = lotFrame(ctx, el.rect, 's');
  perimeter(F, W, z1 - z0, 2.6, W / 2, 4.2, 'earth_wall');
  ctx.style.elements.han_hall({ cx, z1: z1 - 7.2, bays: 3, bayW: 4.2, depth: 2, depthW: 5.6, floor: 0.6, h: 4.2, base: 0.6, roof: 'gable', rise: 2.0, overhang: 2.2, ap: 1.0, furnish: 'office', seed: el.seed, open: [1, 1] }, ctx);
  void rand;
}
