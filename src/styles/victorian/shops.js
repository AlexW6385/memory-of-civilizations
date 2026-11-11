// The streets of Victorian London about 1870 (docs/settlements/london.md §6): the shop fronts with their plate glass,
// pilasters, fascia boards and gilt lettering, blinds and hanging signs (a draper's, a grocer's, a butcher's, a chemist's
// with its show-globes, a baker's, a pawnbroker's three balls, a bootmaker's, a barber's pole); the public houses (gin
// palaces) at the corners, their polished granite and etched glass, the great gas lamp over the door; the better
// terraces with their bays, stucco porches and iron balconies; the street furniture (pillar box, drinking fountain,
// bollard, coal-hole cover, gas lamp). Every building is drawn in a frame of the lot: u along the street from the lot's
// west edge, d outward from the front wall (negative inside).

import { box, lathe, rod } from '../../core/geom.js';
import { hexa } from './street.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const pick = (rand, a) => a[Math.floor(rand() * a.length)];
function frameOf(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, f = el.front, y = el.y ?? 0, zf = f === 's' ? z1 : z0, sg = f === 's' ? 1 : -1;
  const B = (m, u0, u1, ya, yb, d0, d1) => { const a = zf + sg * d0, b = zf + sg * d1; bag.add(m, box(x0 + u0, ya, Math.min(a, b), x0 + u1, yb, Math.max(a, b))); };
  const C = (u0, u1, ya, yb, d0, d1) => { const a = zf + sg * d0, b = zf + sg * d1; col.rect([x0 + u0, Math.min(a, b), x0 + u1, Math.max(a, b)], ya, yb); };
  const W = (u, yy, d) => [x0 + u, yy, zf + sg * d];                              // a point in the world
  const L = (m, prof, n, u, yy, d) => bag.add(m, lathe(prof, n, null, x0 + u, yy, zf + sg * d));
  return { x0, z0, x1, z1, f, y, Wd: x1 - x0, D: z1 - z0, zf, sg, B, C, W, L, bag, col };
}
const BRICKS = [['brick', 0.5], ['brick_buff', 0.3], ['brick_grey', 0.2]];
const brickOf = (rand) => { let r = rand(); for (const [m, p] of BRICKS) { if ((r -= p) < 0) return m; } return 'brick'; };

/** a sash window: stucco surround, the glass, the centre muntin and meeting rail, the stone sill and lintel */
function sash(F, u, y0, hh, o = {}) {
  const { B } = F, hw = (o.w ?? 1.0) / 2;
  if (o.simple) { B('opening', u - hw, u + hw, y0, y0 + hh, 0.0, 0.05); return; }
  B('plaster_white', u - hw - 0.1, u + hw + 0.1, y0 - 0.06, y0 + hh + 0.12, -0.02, 0.04);
  B('opening', u - hw, u + hw, y0, y0 + hh, 0.04, 0.07);
  B('plaster_white', u - 0.025, u + 0.025, y0, y0 + hh, 0.07, 0.09);
  B('plaster_white', u - hw, u + hw, y0 + hh * 0.5 - 0.03, y0 + hh * 0.5 + 0.03, 0.07, 0.09);
  B(o.sill ?? 'limestone', u - hw - 0.14, u + hw + 0.14, y0 - 0.12, y0 - 0.04, 0, 0.14);
  B(o.lintel ?? 'limestone', u - hw - 0.12, u + hw + 0.12, y0 + hh + 0.12, y0 + hh + 0.3, -0.02, 0.08);
}
/** the roof, the cornice, the chimney stacks with their pots: the same for every house of a row */
function roofAndStacks(F, mat, H, rand, simple) {
  const { bag, x0, z0, x1, z1, y, Wd, D, W } = F, top = y + H;
  bag.add('plaster_white', box(x0 - 0.15, top - 0.4, z0 - 0.15, x1 + 0.15, top, z1 + 0.15));
  // the slate roof ridged along the street (a hip at neither end: the next house's roof continues it)
  bag.add('slate', hexa([[x0 - 0.2, top, z0 - 0.2], [x1 + 0.2, top, z0 - 0.2], [x1 + 0.2, top, z1 + 0.2], [x0 - 0.2, top, z1 + 0.2]], [[x0 - 0.2, top + D * 0.32, (z0 + z1) / 2 - 0.15], [x1 + 0.2, top + D * 0.32, (z0 + z1) / 2 - 0.15], [x1 + 0.2, top + D * 0.32, (z0 + z1) / 2 + 0.15], [x0 - 0.2, top + D * 0.32, (z0 + z1) / 2 + 0.15]]));
  const k = Math.max(1, Math.round(Wd / 5.5)), tp = top + D * 0.32 + 1.4;
  for (let i = 0; i < k; i++) {
    const u = x0 + i * Wd / k, c = [u - 0.5, (z0 + z1) / 2 - 0.4, u + 0.5, (z0 + z1) / 2 + 0.4];
    bag.add(mat, box(c[0], top, c[1], c[2], tp, c[3]));
    if (simple) continue;
    bag.add('limestone', box(c[0] - 0.08, tp - 0.25, c[1] - 0.08, c[2] + 0.08, tp - 0.1, c[3] + 0.08));
    bag.add(mat, box(c[0] - 0.04, tp - 0.1, c[1] - 0.04, c[2] + 0.04, tp + 0.05, c[3] + 0.04));
    const np = 2 + Math.floor(rand() * 3);
    for (let j = 0; j < np; j++) { const t = (j + 0.5) / np - 0.5; bag.add('terracotta', lathe([[0.14, 0], [0.12, 0.25], [0.11, 0.55], [0.14, 0.63], [0.11, 0.68]], 6, null, u + t * 0.85, tp + 0.05, (z0 + z1) / 2)); }
  }
  void W;
}
/** the area railings with their spear heads along the front, the stone steps to the door at u */
function railings(F, uDoor, y) {
  const { B, Wd } = F;
  B('iron', 0, Wd, y + 0.9, y + 0.95, 1.5, 1.55); B('iron', 0, Wd, y + 0.1, y + 0.14, 1.5, 1.55);
  for (let u = 0.15; u < Wd; u += 0.3) if (Math.abs(u - uDoor) > 0.75) B('iron', u - 0.012, u + 0.012, y, y + 1.0, 1.5, 1.55);
  // the area's coal-hole cover in the pavement
  B('iron', uDoor + 1.2, uDoor + 1.7, y + 0.0, y + 0.015, 1.7, 2.2);
}

/**
 * terrace_house (the town's ordinary house, a richer version): { rect, seed, front, storeys, y } — London stock brick (sooted
 * grey in places) or red, a stucco cornice and parapet, sash windows with stone sills and lintels, the door with its fanlight
 * under a stucco surround up two steps; by the seed plain, with a ground-floor bay, or stucco-fronted with a columned porch
 * carrying an iron balcony; area railings, a chimney stack on each party wall with its pots.
 */
export function terraceRich(el, ctx, base) {
  if (el.open || el.simple || (el.front !== 'n' && el.front !== 's')) return base(el, ctx);
  const F = frameOf(el, ctx), rand = rng(el.seed || 1), { B, C, bag, col, Wd, D, y, x0, z0, x1, z1 } = F;
  const n = el.storeys ?? 3, st = 3.2, H = n * st, mat = brickOf(rand), type = rand() < 0.33 ? 'bay' : rand() < 0.3 ? 'stucco' : 'plain';
  const uD = Wd / 4, uW = 3 * Wd / 4;
  bag.add(mat, box(x0, y - 0.5, z0, x1, y + H, z1)); col.rect(el.rect, y - 0.5, y + H);
  if (type === 'stucco') {
    // the ground floor rusticated in stucco, a banded plinth
    B('stucco_cream', 0, Wd, y - 0.1, y + st, 0, 0.06);
    for (let b = 0.5; b < st - 0.3; b += 0.42) B('plaster_white', 0, Wd, y + b, y + b + 0.03, 0.06, 0.075);
  } else B('limestone', 0, Wd, y - 0.1, y + 0.5, 0, 0.05);
  // string courses at the floors
  for (let s = 1; s < n; s++) B(type === 'stucco' && s === 1 ? 'stucco_cream' : 'plaster_white', 0, Wd, y + s * st - 0.1, y + s * st + 0.1, 0, 0.07);
  // the door: surround, panelled leaf, the fanlight, a brass knocker; two steps
  B('plaster_white', uD - 0.65, uD + 0.65, y + 0.4, y + 3.15, -0.02, 0.05);
  B('wood_dark', uD - 0.5, uD + 0.5, y + 0.4, y + 2.45, 0.05, 0.1);
  for (const [a, b] of [[0.55, 1.2], [1.3, 2.3]]) for (const sd of [-1, 1]) B('wood_dark', sd < 0 ? uD - 0.4 : uD + 0.04, sd < 0 ? uD - 0.04 : uD + 0.4, y + 0.4 + a, y + 0.4 + b, 0.1, 0.13);
  B('opening', uD - 0.5, uD + 0.5, y + 2.5, y + 2.95, 0.05, 0.08); B('plaster_white', uD - 0.025, uD + 0.025, y + 2.5, y + 2.95, 0.08, 0.1);
  B('gold', uD - 0.04, uD + 0.04, y + 1.7, y + 1.82, 0.13, 0.16);
  B('limestone', uD - 0.7, uD + 0.7, y - 0.3, y + 0.2, 0, 0.95); B('limestone', uD - 0.7, uD + 0.7, y - 0.3, y + 0.4, 0, 0.5);
  if (type === 'stucco') {
    // the porch: two columns, an entablature, the iron balcony round its flat roof, the first-floor window to the floor
    for (const sd of [-1, 1]) { F.L('plaster_white', [[0.2, 0], [0.17, 0.2], [0.14, 0.3], [0.13, 2.7], [0.17, 2.8], [0.2, 2.9]], 10, uD + sd * 0.78, y + 0.4, 1.05); }
    B('plaster_white', uD - 1.05, uD + 1.05, y + 3.0, y + 3.35, 0.0, 1.3);
    B('plaster_white', uD - 1.1, uD + 1.1, y + 3.35, y + 3.4, -0.0, 1.35);
    const by = y + 3.4;
    B('iron', uD - 1.05, uD + 1.05, by + 0.95, by + 1.0, 1.28, 1.3); for (const sd of [-1, 1]) B('iron', uD + sd * 1.05 - (sd > 0 ? 0.02 : 0), uD + sd * 1.05 + (sd < 0 ? 0.02 : 0), by + 0.95, by + 1.0, 0.0, 1.3);
    for (let u = uD - 1.0; u < uD + 1.02; u += 0.2) B('iron', u - 0.01, u + 0.01, by, by + 0.95, 1.28, 1.3);
    C(uD - 0.15 - 0.78, uD + 0.15 - 0.78, y, y + 3, 0.9, 1.2); C(uD - 0.15 + 0.78, uD + 0.15 + 0.78, y, y + 3, 0.9, 1.2);
  } else railings(F, uD, y);
  // windows: ground floor, then each floor above
  for (let s = 0; s < n; s++) for (let i = 0; i < 2; i++) {
    const u = i === 0 ? uD : uW, hh = s === 0 ? 1.8 : s === 1 ? 2.2 : 1.8, y0 = y + s * st + (s === 0 ? 0.6 : 0.9);
    if (s === 0 && i === 0) continue;
    if (s === 0 && type === 'bay') {
      // a square bay: stucco dado, three glazed faces between posts, a lead roof
      B('plaster_white', u - 1.05, u + 1.05, y, y + 0.75, 0, 0.8);
      B('opening', u - 0.85, u + 0.85, y + 0.75, y + 2.55, 0.74, 0.77);
      B('opening', u - 1.0, u - 0.97, y + 0.75, y + 2.55, 0.08, 0.74); B('opening', u + 0.97, u + 1.0, y + 0.75, y + 2.55, 0.08, 0.74);
      for (const sd of [-1, 1]) B('plaster_white', u + sd * 1.0 - 0.06, u + sd * 1.0 + 0.06, y + 0.75, y + 2.75, 0.68, 0.8);
      for (const sd of [-1, 1]) B('plaster_white', u + sd * 0.3 - 0.03, u + sd * 0.3 + 0.03, y + 0.75, y + 2.55, 0.74, 0.8);
      B('plaster_white', u - 0.85, u + 0.85, y + 1.6, y + 1.65, 0.77, 0.8);
      B('plaster_white', u - 1.1, u + 1.1, y + 2.55, y + 2.78, -0.0, 0.88); B('slate', u - 1.05, u + 1.05, y + 2.78, y + 2.84, 0.0, 0.84);
      C(u - 1.05, u + 1.05, y, y + 2.85, 0, 0.8);
      continue;
    }
    const balc = type === 'stucco' && s === 1 && i === 1;
    sash(F, u, y0, balc ? 2.6 : hh, { lintel: type === 'stucco' ? 'plaster_white' : 'limestone' });
    if (balc || (s === 1 && rand() < 0.25)) { B('iron', u - 0.8, u + 0.8, y0 + 0.05, y0 + 0.09, 0.25, 0.28); for (let q = u - 0.76; q < u + 0.78; q += 0.17) B('iron', q - 0.01, q + 0.01, y0 - 0.5, y0 + 0.9, 0.25, 0.28); B('iron', u - 0.8, u + 0.8, y0 + 0.9, y0 + 0.94, 0.25, 0.28); }
  }
  roofAndStacks(F, mat, H, rand, false);
}

// ── the shops ────────────────────────────────────────────────────────────────
// by trade: the fascia's paint, the blind's two colours, the window's goods
const TRADE = {
  draper: { fascia: 'paint_blue', awn: ['cloth_white', 'cloth_blue'], goods: ['cloth_red', 'cloth_blue', 'cloth_red', 'cloth_green', 'cloth_white', 'cloth_red', 'hide_tan'], kind: 'bolts' },
  grocer: { fascia: 'shutter_green', awn: ['cloth_white', 'cloth_green'], goods: ['wicker', 'wicker', 'timber', 'cloth_white', 'cloth_white'], kind: 'jars' },
  butcher: { fascia: 'wall_red', awn: ['cloth_white', 'cloth_blue'], goods: ['hide_tan', 'cloth_red', 'cloth_white'], kind: 'hooks' },
  chemist: { fascia: 'lacquer_black', awn: null, goods: ['glaze_blue', 'glaze_blue', 'glaze_blue', 'cloth_white'], kind: 'carboys' },
  baker: { fascia: 'shutter_brown', awn: ['cloth_red', 'cloth_white'], goods: ['hide_tan', 'wicker', 'hide_black'], kind: 'loaves' },
  pawnbroker: { fascia: 'lacquer_black', awn: null, goods: ['gold', 'wood_dark', 'cloth_red', 'gold', 'cloth_green'], kind: 'boxes' },
  bootmaker: { fascia: 'shutter_brown', awn: ['hide_tan', 'cloth_red'], goods: ['hide_black', 'hide_black', 'hide_tan'], kind: 'boots' },
  barber: { fascia: 'lacquer_black', awn: null, goods: ['hide_black', 'hide_black', 'cloth_white'], kind: 'wigs' },
  tobacconist: { fascia: 'shutter_brown', awn: ['cloth_red', 'cloth_white'], goods: ['wood_dark', 'cloth_red', 'timber', 'cloth_red'], kind: 'boxes' },
  greengrocer: { fascia: 'shutter_green', awn: ['cloth_red', 'cloth_white'], goods: ['cloth_green', 'cloth_red', 'cloth_red', 'wicker'], kind: 'baskets' },
};
/** gilt lettering on a board: blocks of letters' height and varying width with gaps, in the middle of u0..u1 */
function lettering(F, rand, u0, u1, ya, yb, d, m = 'gold') {
  const n = 5 + Math.floor(rand() * 5), cw = 0.16, w = Math.min(u1 - u0 - 0.4, n * 0.27); let u = (u0 + u1) / 2 - w / 2;
  for (let i = 0; i < n; i++) { const lw = cw * (0.7 + rand() * 0.5); F.B(m, u, u + lw, ya, yb, d, d + 0.012); u += w / n; }
}
/** the goods behind the plate glass, by kind, on three tiers between u0..u1, d from the wall to the glass */
function goods(F, tr, rand, u0, u1, dBack, dFront, y) {
  const { B, L } = F, G = tr.goods, tiers = [0.78, 1.42, 2.0];
  for (const ty of tiers) B('timber', u0, u1, y + ty - 0.04, y + ty, dBack, dFront - 0.04);
  B('wood_dark', u0, u1, y + 0.7, y + 2.6, dBack - 0.01, dBack + 0.02);                    // the dark back of the window
  for (const [ti, ty] of tiers.entries()) {
    if (ti === 2 && tr.kind !== 'bolts' && tr.kind !== 'jars' && tr.kind !== 'boxes') continue;
    for (let u = u0 + 0.2; u < u1 - 0.2; u += 0.3 + rand() * 0.25) {
      const m = pick(rand, G), d = dBack + 0.06 + rand() * (dFront - dBack - 0.25);
      switch (tr.kind) {
        case 'bolts': { const h = 0.35 + rand() * 0.3; B(m, u - 0.09, u + 0.09, y + ty, y + ty + h, d, d + 0.2); if (rand() < 0.5) B(pick(rand, G), u - 0.1, u + 0.1, y + ty + h, y + ty + h + 0.12, d - 0.01, d + 0.21); break; }
        case 'jars': if (rand() < 0.55) L(m === 'cloth_white' ? 'cloth_white' : 'glaze_blue', [[0.001, 0], [0.07, 0.01], [0.075, 0.2], [0.05, 0.24], [0.001, 0.25]], 8, u, y + ty, d + 0.1); else B(m, u - 0.12, u + 0.12, y + ty, y + ty + 0.22, d, d + 0.25); break;
        case 'hooks': break;
        case 'carboys': if (ti > 0) L(pick(rand, G), [[0.001, 0], [0.07, 0.01], [0.08, 0.14], [0.05, 0.22], [0.02, 0.28], [0.03, 0.34]], 8, u, y + ty, d + 0.08); break;
        case 'loaves': L(m, [[0.001, 0], [0.13, 0.02], [0.14, 0.09], [0.1, 0.17], [0.001, 0.2]], 8, u, y + ty, d + 0.1); break;
        case 'boots': B(m, u - 0.05, u + 0.05, y + ty, y + ty + 0.28, d, d + 0.1); B(m, u - 0.05, u + 0.12, y + ty, y + ty + 0.08, d, d + 0.1); break;
        case 'wigs': L('hide_black', [[0.001, 0], [0.09, 0.02], [0.11, 0.12], [0.06, 0.22], [0.001, 0.24]], 8, u, y + ty, d + 0.1); break;
        case 'baskets': B('wicker', u - 0.17, u + 0.17, y + ty, y + ty + 0.16, d, d + 0.3); B(m === 'wicker' ? 'cloth_green' : m, u - 0.15, u + 0.15, y + ty + 0.16, y + ty + 0.22, d + 0.02, d + 0.28); break;
        default: B(m, u - 0.1, u + 0.1, y + ty, y + ty + 0.12 + rand() * 0.3, d, d + 0.18);
      }
    }
  }
  if (tr.kind === 'hooks') {
    // the butcher's rail with carcasses and joints hanging, the marble slab below
    B('iron', u0, u1, y + 2.35, y + 2.4, dBack + 0.1, dBack + 0.14);
    for (let u = u0 + 0.3; u < u1 - 0.3; u += 0.42) { const hh = 0.5 + rand() * 0.4; B(rand() < 0.5 ? 'hide_tan' : 'cloth_red', u - 0.11, u + 0.11, y + 2.35 - hh, y + 2.35, dBack + 0.06, dBack + 0.2); B('cloth_white', u - 0.1, u + 0.1, y + 2.35 - hh, y + 2.35 - hh + 0.06, dBack + 0.05, dBack + 0.21); }
    B('cloth_white', u0, u1, y + 0.85, y + 0.9, dBack, dFront - 0.04);
  }
}
/** the striped blind: stripes of cloth sloping from the cornice out to the front bar, a valance, iron arms; u0..u1 */
function awning(F, tr, u0, u1, yTop, proj, rand) {
  const { W, bag, B } = F, [c1, c2] = tr.awn, sw = 0.46, yBot = yTop - 0.75, nS = Math.max(2, Math.round((u1 - u0) / sw));
  for (let k = 0; k < nS; k++) {
    const a = u0 + (u1 - u0) * k / nS, b = u0 + (u1 - u0) * (k + 1) / nS, m = k % 2 ? c2 : c1;
    bag.add(m, hexa([W(a, yTop, 0.1), W(b, yTop, 0.1), W(b, yBot, proj), W(a, yBot, proj)], [W(a, yTop + 0.02, 0.1), W(b, yTop + 0.02, 0.1), W(b, yBot + 0.02, proj), W(a, yBot + 0.02, proj)]));
    B(m, a, b, yBot - 0.22, yBot + 0.02, proj - 0.01, proj + 0.01);
  }
  B('iron', u0, u1, yBot + 0.02, yBot + 0.05, proj - 0.02, proj + 0.01);
  for (const u of [u0 + 0.05, u1 - 0.05]) bag.add('iron', rod(W(u, yTop - 0.05, 0.15), W(u, yBot - 0.15, proj), 0.018, 4));
  void rand;
}
/** the pavement's tiered stands of baskets and crates before the greengrocer's and the grocer's */
function pavementGoods(F, tr, rand, u0, u1, y) {
  const { B } = F;
  B('timber', u0, u1, y + 0.55, y + 0.6, 0.45, 1.05); for (const u of [u0 + 0.05, u1 - 0.07]) B('wood_dark', u, u + 0.05, y, y + 0.6, 0.5, 1.0);
  for (let u = u0 + 0.12; u < u1 - 0.3; u += 0.36) { const m = pick(rand, tr.goods.filter((g) => g !== 'wicker')); B('wicker', u, u + 0.3, y + 0.6, y + 0.78, 0.55, 0.95); B(m === 'wicker' ? 'cloth_green' : m, u + 0.02, u + 0.28, y + 0.78, y + 0.84, 0.57, 0.93); }
}
/** the hanging sign on its bracket, by trade: the pawnbroker's three balls, the barber's pole, the bootmaker's boot, else a board */
function hangingSign(F, tr, tname, rand, uS, y) {
  const { B, L } = F, d1 = 1.15, ys = y + 3.1;
  B('iron', uS - 0.02, uS + 0.02, ys, ys + 0.05, 0.0, d1);
  switch (tname) {
    case 'pawnbroker': for (const [du, dy] of [[-0.18, 0], [0.18, 0], [0, 0.3]]) L('gold', [[0.001, -0.14], [0.14, 0], [0.001, 0.14]], 10, uS + du, ys - 0.3 + dy + 0.14 - 0.0 + 0.0, d1 - 0.1 - 0.12); B('iron', uS - 0.01, uS + 0.01, ys - 0.45, ys, d1 - 0.22, d1 - 0.2); break;
    case 'barber': { const bx = uS, h = 0.9; for (let k = 0; k < 6; k++) B(k % 2 ? 'cloth_red' : 'cloth_white', bx - 0.06, bx + 0.06, ys - h + k * h / 6, ys - h + (k + 1) * h / 6, d1 - 0.12, d1); B('gold', bx - 0.08, bx + 0.08, ys - h - 0.04, ys - h, d1 - 0.14, d1 + 0.02); B('gold', bx - 0.08, bx + 0.08, ys, ys + 0.04, d1 - 0.14, d1 + 0.02); break; }
    case 'bootmaker': B('hide_black', uS - 0.1, uS + 0.1, ys - 0.7, ys - 0.1, d1 - 0.1, d1 + 0.1); B('hide_black', uS - 0.1, uS + 0.5, ys - 0.7, ys - 0.45, d1 - 0.1, d1 + 0.1); B('hide_black', uS - 0.1, uS + 0.5, ys - 0.75, ys - 0.7, d1 - 0.1, d1 + 0.1); break;
    default: B(tr.fascia, uS - 0.04, uS + 0.04, ys - 0.7, ys - 0.05, d1 - 0.5, d1 + 0.4); lettering(F, rand, uS, uS, ys - 0.6, ys - 0.25, d1 + 0.4, 'gold');
  }
}

/**
 * shop_house: { rect, seed, front, storeys, y, trade } — a terrace house with a shop on the ground floor: pilasters on plinths with
 * console brackets, the plate-glass window with its mullions and transom lights over a panelled stallriser, the goods of the trade
 * behind the glass, the recessed-looking door with its fanlight, the fascia board with the shopkeeper's name in gilt lettering under a
 * cornice, a striped blind for some, a hanging sign; above, sash windows in brick.
 */
export function shopHouse(el, ctx, base) {
  if (el.simple || (el.front !== 'n' && el.front !== 's')) return base(el, ctx);
  const F = frameOf(el, ctx), rand = rng(el.seed || 1), { B, C, bag, col, Wd, y, x0, z0, x1, z1 } = F;
  const tn = el.trade ?? 'grocer', tr = TRADE[tn], g0 = 3.8, n = el.storeys ?? 3, st = 3.2, H = g0 + (n - 1) * st, mat = brickOf(rand);
  const left = rand() < 0.5, dw = 1.0, uDoor = left ? 0.42 + dw / 2 + 0.05 : Wd - 0.42 - dw / 2 - 0.05;
  const wu0 = left ? 0.42 + dw + 0.2 : 0.5, wu1 = left ? Wd - 0.5 : Wd - 0.42 - dw - 0.2;
  bag.add(mat, box(x0, y - 0.5, z0, x1, y + H, z1)); col.rect(el.rect, y - 0.5, y + H);
  const bayD = 0.42;
  // pilasters on plinths, the console brackets carrying the cornice
  for (const [a, b] of [[0.0, 0.42], [Wd - 0.42, Wd]]) {
    B('plaster_white', a - 0.02, b + 0.02, y, y + 0.35, 0, bayD - 0.1); B(tr.fascia, a, b, y + 0.35, y + g0 - 1.12, 0, bayD - 0.12);
    B('gold', a - 0.02, b + 0.02, y + g0 - 1.12, y + g0 - 1.0, 0, bayD - 0.08);                    // the capital's gilt band
    B('plaster_white', a - 0.03, b + 0.03, y + g0 - 1.0, y + g0 - 0.7, 0, bayD + 0.02);                         // the console bracket
  }
  // the fascia board with its lettering, the cornice, the blind's roller box
  B(tr.fascia, 0, Wd, y + g0 - 1.0, y + g0 - 0.28, 0, bayD); B('gold', 0, Wd, y + g0 - 1.0, y + g0 - 0.97, bayD - 0.01, bayD + 0.01); B('gold', 0, Wd, y + g0 - 0.31, y + g0 - 0.28, bayD - 0.01, bayD + 0.01);
  lettering(F, rand, 0.42, Wd - 0.42, y + g0 - 0.88, y + g0 - 0.45, bayD, 'gold');
  B('plaster_white', -0.05, Wd + 0.05, y + g0 - 0.28, y + g0, 0, bayD + 0.14); B('plaster_white', -0.08, Wd + 0.08, y + g0, y + g0 + 0.1, 0, bayD + 0.17);
  // the stallriser, the plate-glass window: a bottom rail, transom, mullions
  B('wood_dark', wu0 - 0.04, wu1 + 0.04, y, y + 0.7, 0, bayD - 0.04);
  B('plaster_white', wu0 - 0.04, wu1 + 0.04, y + 0.62, y + 0.7, bayD - 0.04, bayD);
  const open = !(tn === 'butcher');
  goods(F, tr, rand, wu0, wu1, 0.04, bayD - 0.05, y);
  if (open) {
    B('glass_outer', wu0, wu1, y + 0.7, y + 2.55, bayD - 0.03, bayD - 0.015);
    B('glass_outer', wu0, wu1, y + 2.62, y + g0 - 1.05, bayD - 0.03, bayD - 0.015);
    B('plaster_white', wu0 - 0.04, wu1 + 0.04, y + 2.55, y + 2.62, bayD - 0.04, bayD);                       // the transom
    const nm = Math.max(1, Math.round((wu1 - wu0) / 1.6)); for (let i = 0; i <= nm; i++) { const u = wu0 + (wu1 - wu0) * i / nm; B('plaster_white', u - 0.035, u + 0.035, y + 0.7, y + g0 - 1.05, bayD - 0.04, bayD); }
    B('plaster_white', wu0 - 0.04, wu1 + 0.04, y + g0 - 1.1, y + g0 - 1.0, bayD - 0.04, bayD);
  } else {
    // the butcher's front stands open under its blind: no glass, a pair of posts
    for (const u of [wu0, wu1]) B('plaster_white', u - 0.04, u + 0.04, y + 0.7, y + g0 - 1.0, bayD - 0.06, bayD);
  }
  // the door: a leaf with a glazed upper panel and a panelled lower, the fanlight, the brass plate; a worn step
  B('wood_dark', uDoor - dw / 2 - 0.04, uDoor + dw / 2 + 0.04, y, y + g0 - 1.0, 0, bayD - 0.1);
  B('wood_dark', uDoor - dw / 2, uDoor + dw / 2, y, y + 2.45, bayD - 0.1, bayD - 0.05); B('glass_outer', uDoor - dw / 2 + 0.1, uDoor + dw / 2 - 0.1, y + 0.95, y + 2.35, bayD - 0.05, bayD - 0.035);
  B('glass_outer', uDoor - dw / 2, uDoor + dw / 2, y + 2.55, y + g0 - 1.05, bayD - 0.09, bayD - 0.075); B('gold', uDoor + dw / 2 - 0.2, uDoor + dw / 2 - 0.12, y + 1.0, y + 1.2, bayD - 0.04, bayD - 0.02);
  B('limestone', uDoor - dw / 2, uDoor + dw / 2, y - 0.1, y + 0.03, 0, bayD + 0.25);
  if (tn === 'chemist') for (const [i, m] of ['lamp_glass', 'lamp_glass'].entries()) F.L(m, [[0.001, 0], [0.1, 0.02], [0.17, 0.18], [0.19, 0.3], [0.14, 0.44], [0.06, 0.52], [0.05, 0.62]], 10, wu0 + (wu1 - wu0) * (0.3 + 0.4 * i), y + 0.78 + 0.0, 0.2);
  // the blind and the pavement goods
  if (tr.awn && rand() < 0.7) awning(F, tr, 0.0, Wd, y + g0 + 0.05, 1.45, rand);
  else if (tn === 'greengrocer' || tn === 'grocer') pavementGoods(F, tr, rand, wu0 + 0.2, Math.min(wu1, wu0 + 3.2), y);
  if (['pawnbroker', 'barber', 'bootmaker'].includes(tn) || rand() < 0.5) hangingSign(F, tr, tn, rand, uDoor + (left ? -0.5 : 0.5), y);
  C(0, Wd, y, y + g0, 0, bayD + 0.02);
  // the cornice carrying the first floor's brick, the first-floor string, the upper windows
  B('plaster_white', 0, Wd, y + g0 + 0.1, y + g0 + 0.3, 0, 0.06);
  for (let s = 1; s < n; s++) for (const u of [Wd * 0.27, Wd * 0.73]) sash(F, u, y + g0 + (s - 1) * st + 0.55, s === 1 ? 2.2 : 1.8);
  for (let s = 2; s < n; s++) B('plaster_white', 0, Wd, y + g0 + (s - 1) * st - 0.1, y + g0 + (s - 1) * st + 0.1, 0, 0.06);
  roofAndStacks(F, mat, H, rand, false);
}

// ── the public house ─────────────────────────────────────────────────────────
const PUB_NAMES = 'ABCDEFGHIJKLMNOPRSTUW';
/**
 * pub: { rect, seed, front, y, corner: 'e'|'w' } — a gin-palace pub of three storeys at the corner of two streets: polished red granite
 * pilasters on a granite stallriser, wide windows of etched glass in mahogany frames (lit at night), the fascia with its name in
 * large gilt letters, a great gas lamp on its bracket over the double doors and lamps on the pilasters, a painted board hanging from
 * an iron bracket; above, sash windows under stucco hoods; the side along the cross street in the same manner.
 */
export function pub(el, ctx, base) {
  if (el.simple || (el.front !== 'n' && el.front !== 's')) return base(el, ctx);
  const F = frameOf(el, ctx), rand = rng(el.seed || 1), { B, C, bag, col, Wd, y, x0, z0, x1, z1, L } = F;
  const g0 = 4.0, n = 3, st = 3.3, H = g0 + (n - 1) * st, mat = brickOf(rand), bayD = 0.3;
  bag.add(mat, box(x0, y - 0.5, z0, x1, y + H, z1)); col.rect(el.rect, y - 0.5, y + H);
  const east = el.corner === 'e', uDoor = east ? Wd - 1.3 : 1.3;
  // granite pilasters on plinths: at the ends, the corner and between the windows
  const bays = Math.max(2, Math.round((Wd - 2.6) / 2.4)), cuts = [];
  const gx = [0.0, Wd - 0.4, ...Array.from({ length: bays - 1 }, (_, i) => 0.4 + (Wd - 2.8) * (i + 1) / bays)].sort((a, b) => a - b);
  for (const a of gx) {
    B('granite_red', a - 0.02, a + 0.42, y, y + 0.3, 0, bayD); B('granite_red', a, a + 0.4, y + 0.3, y + g0 - 1.0, 0, bayD - 0.04); B('gold', a - 0.02, a + 0.42, y + g0 - 1.1, y + g0 - 1.0, 0, bayD);
    B('plaster_white', a - 0.03, a + 0.43, y + g0 - 1.0, y + g0 - 0.7, 0, bayD + 0.04);
    L('lamp_glass', [[0.001, 0], [0.12, 0.05], [0.18, 0.2], [0.14, 0.34], [0.001, 0.38]], 10, a + 0.2, y + g0 + 0.1, 0.14); B('iron', a + 0.16, a + 0.24, y + g0, y + g0 + 0.1, 0.1, 0.18);
    cuts.push(a);
  }
  // the fascia: a deep dark board with the name in large gilt letters, a cornice over it
  const fasc = pick(rand, ['lacquer_black', 'shutter_green', 'paint_blue', 'wall_red']);
  B(fasc, 0, Wd, y + g0 - 1.0, y + g0 - 0.2, 0, bayD); B('gold', 0, Wd, y + g0 - 1.0, y + g0 - 0.97, bayD - 0.01, bayD + 0.01); B('gold', 0, Wd, y + g0 - 0.23, y + g0 - 0.2, bayD - 0.01, bayD + 0.01);
  { const nn = 6 + Math.floor(rand() * 4), w = Math.min(Wd - 1.2, nn * 0.4); let u = Wd / 2 - w / 2; for (let i = 0; i < nn; i++) { B('gold', u, u + 0.26, y + g0 - 0.9, y + g0 - 0.35, bayD, bayD + 0.015); if (rand() < 0.5) B(fasc, u + 0.08, u + 0.18, y + g0 - 0.78, y + g0 - 0.45, bayD + 0.015, bayD + 0.02); u += w / nn; } }
  B('plaster_white', -0.05, Wd + 0.05, y + g0 - 0.2, y + g0, 0, bayD + 0.18); B('plaster_white', -0.08, Wd + 0.08, y + g0, y + g0 + 0.1, 0, bayD + 0.22);
  // the windows between the pilasters: a granite stallriser, mahogany frames, etched glass above clear glass; the double doors at the corner
  const wins = [], edges = [...cuts.map((a) => [a, a + 0.4])];
  for (let i = 0; i + 1 < edges.length; i++) { const a = edges[i][1], b = edges[i + 1][0]; if (b - a > 0.8) wins.push([a, b]); }
  for (const [a, b] of wins) {
    const door = uDoor > a && uDoor < b;
    B('granite_red', a, b, y, y + 0.8, 0, bayD - 0.06);
    if (door) {
      B('wood_dark', uDoor - 0.8, uDoor + 0.8, y, y + g0 - 1.0, 0, bayD - 0.08);
      for (const sd of [-1, 1]) { B('wood_dark', sd < 0 ? uDoor - 0.78 : uDoor + 0.02, sd < 0 ? uDoor - 0.02 : uDoor + 0.78, y, y + 2.5, bayD - 0.08, bayD - 0.03); B('lamp_glass', sd < 0 ? uDoor - 0.62 : uDoor + 0.18, sd < 0 ? uDoor - 0.18 : uDoor + 0.62, y + 0.9, y + 2.3, bayD - 0.03, bayD - 0.015); B('gold', sd < 0 ? uDoor - 0.14 : uDoor + 0.1, sd < 0 ? uDoor - 0.1 : uDoor + 0.14, y + 1.0, y + 1.3, bayD - 0.03, bayD - 0.0); }
      B('lamp_glass', uDoor - 0.78, uDoor + 0.78, y + 2.55, y + g0 - 1.05, bayD - 0.1, bayD - 0.085);
      B('limestone', uDoor - 0.9, uDoor + 0.9, y - 0.1, y + 0.03, 0, bayD + 0.35);
      // the great gas lamp over the door on its iron bracket: a lantern of glass in a cast frame under a crown
      B('iron', uDoor - 0.03, uDoor + 0.03, y + g0 + 0.2, y + g0 + 0.26, 0.0, 1.0); B('iron', uDoor - 0.02, uDoor + 0.02, y + g0 + 0.26, y + g0 + 1.0, 0.0, 0.04);
      L('iron', [[0.001, 0], [0.3, 0.0], [0.34, 0.1], [0.34, 0.1]], 8, uDoor, y + g0 + 0.2, 1.0);
      L('lamp_glass', [[0.26, 0], [0.34, 0.1], [0.34, 0.6], [0.26, 0.68]], 8, uDoor, y + g0 + 0.3, 1.0); L('iron', [[0.4, 0], [0.3, 0.1], [0.12, 0.28], [0.001, 0.34]], 8, uDoor, y + g0 + 0.95, 1.0);
      continue;
    }
    B('glass_outer', a + 0.05, b - 0.05, y + 0.8, y + 2.45, bayD - 0.08, bayD - 0.06);
    B('lamp_glass', a + 0.05, b - 0.05, y + 2.5, y + g0 - 1.05, bayD - 0.08, bayD - 0.06);                    // the etched upper lights, lit at night
    B('wood_dark', a, b, y + 0.8, y + 0.9, bayD - 0.1, bayD - 0.03); B('wood_dark', a, b, y + 2.45, y + 2.55, bayD - 0.1, bayD - 0.03); B('wood_dark', a, b, y + g0 - 1.1, y + g0 - 1.0, bayD - 0.1, bayD - 0.03);
    const nm = Math.max(1, Math.round((b - a) / 1.2)); for (let i = 1; i < nm; i++) { const u = a + (b - a) * i / nm; B('wood_dark', u - 0.04, u + 0.04, y + 0.8, y + g0 - 1.0, bayD - 0.1, bayD - 0.03); }
  }
  C(0, Wd, y, y + g0, 0, bayD + 0.02);
  // the board hanging on an iron bracket from the corner's first floor: a painted sign with gilt lettering
  const uS = east ? Wd - 0.2 : 0.2, ys = y + g0 + 0.6;
  B('iron', uS - 0.02, uS + 0.02, ys + 1.2, ys + 1.25, 0.0, 1.4); B('iron', uS - 0.02, uS + 0.02, ys - 0.05, ys + 1.25, 1.0, 1.04);
  B(pick(rand, ['paint_blue', 'wall_red', 'shutter_green', 'shutter_brown']), uS - 0.03, uS + 0.03, ys, ys + 1.1, 0.5, 1.4); B('gold', uS - 0.05, uS + 0.05, ys - 0.03, ys, 0.5, 1.4); B('gold', uS - 0.05, uS + 0.05, ys + 1.1, ys + 1.13, 0.5, 1.4);
  for (let i = 0; i < 4; i++) B('gold', uS - 0.05, uS + 0.05, ys + 0.2 + i * 0.22, ys + 0.3 + i * 0.22, 0.65, 1.25 - (i % 2) * 0.3);
  // upper floors: stucco hoods over the first-floor windows, plain sashes above; a string course at each floor
  B('limestone', 0, Wd, y + g0 + 0.1, y + g0 + 0.3, 0, 0.06);
  const nw = Math.max(2, Math.round(Wd / 2.6));
  for (let s = 1; s < n; s++) for (let i = 0; i < nw; i++) {
    const u = (i + 0.5) * Wd / nw, y0 = y + g0 + (s - 1) * st + 0.6, hh = s === 1 ? 2.3 : 1.9;
    sash(F, u, y0, hh, { w: 0.95, lintel: s === 1 ? 'plaster_white' : 'limestone' });
    if (s === 1) { B('plaster_white', u - 0.75, u + 0.75, y0 + hh + 0.3, y0 + hh + 0.42, -0.02, 0.16); B('plaster_white', u - 0.6, u + 0.6, y0 + hh + 0.42, y0 + hh + 0.52, -0.02, 0.12); }
  }
  B('plaster_white', 0, Wd, y + g0 + st - 0.1, y + g0 + st + 0.1, 0, 0.06);
  // the side along the cross street: the ground floor's glazing, a side door, the upper windows in rows
  const sx = east ? x1 : x0, so = east ? 1 : -1, SB = (m, v0, v1, ya, yb, d0, d1) => { const a = sx + so * d0, b = sx + so * d1, za = F.f === 's' ? z1 - v1 : z0 + v0, zb = F.f === 's' ? z1 - v0 : z0 + v1; bag.add(m, box(Math.min(a, b), ya, za, Math.max(a, b), yb, zb)); };
  const D = F.D;
  SB('granite_red', 0.2, D - 0.5, y, y + 0.8, 0, 0.22); SB('wood_dark', 0.2, D - 0.5, y + 0.8, y + 0.9, 0, 0.24);
  for (let v = 0.6; v + 1.9 < D - 0.5; v += 2.8) { SB('glass_outer', v, v + 1.9, y + 0.9, y + 2.45, 0, 0.03); SB('lamp_glass', v, v + 1.9, y + 2.5, y + 3.0, 0, 0.03); SB('wood_dark', v - 0.05, v, y + 0.9, y + 3.0, 0, 0.06); SB('wood_dark', v + 1.9, v + 1.95, y + 0.9, y + 3.0, 0, 0.06); }
  SB('wood_dark', D / 2 - 0.5, D / 2 + 0.5, y, y + 2.5, 0, 0.04);
  for (let s = 1; s < n; s++) for (let v = 1.0; v < D - 0.8; v += 3.1) SB('opening', v, v + 0.9, y + g0 + (s - 1) * st + 0.6, y + g0 + (s - 1) * st + 0.6 + (s === 1 ? 2.3 : 1.9), 0, 0.05);
  roofAndStacks(F, mat, H, rand, false);
}

// ── the street furniture ─────────────────────────────────────────────────────
/** pillar_box: { at, y } — the hexagonal Penfold box of bronze green with its acanthus cap and the slot (red from 1874, green about 1870) */
export function pillarBox(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, m = el.mat ?? 'glaze_blue';
  bag.add('iron', lathe([[0.26, 0], [0.26, 0.12]], 6, null, x, y, z)); bag.add(m, lathe([[0.24, 0.12], [0.22, 1.05], [0.24, 1.15], [0.2, 1.22], [0.12, 1.3], [0.06, 1.4], [0.001, 1.42]], 6, null, x, y, z));
  bag.add('opening', box(x - 0.1, y + 0.82, z + 0.19, x + 0.1, y + 0.86, z + 0.245)); bag.add('gold', box(x - 0.12, y + 0.7, z + 0.2, x + 0.12, y + 0.74, z + 0.24));
  col.circle?.([x, z], 0.28, y, y + 1.5);
}
/** drinking_fountain: { at, y } — the Metropolitan Free Drinking Fountain Association's granite fountain: a plinth, a basin, a pillar with its cup on a chain */
export function drinkingFountain(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0;
  bag.add('granite_grey', box(x - 0.6, y, z - 0.6, x + 0.6, y + 0.3, z + 0.6)); bag.add('granite_grey', box(x - 0.45, y + 0.3, z - 0.45, x + 0.45, y + 0.9, z + 0.45));
  bag.add('granite_red', lathe([[0.4, 0], [0.4, 0.15], [0.55, 0.28]], 8, null, x, y + 0.9, z)); bag.add('granite_grey', lathe([[0.001, 0], [0.18, 0], [0.16, 1.0], [0.22, 1.1], [0.001, 1.3]], 8, null, x, y + 0.9, z));
  bag.add('gold', box(x - 0.05, y + 1.1, z + 0.14, x + 0.05, y + 1.2, z + 0.28)); bag.add('opening', lathe([[0.001, 0], [0.38, 0.0]], 8, null, x, y + 1.03, z));
  col.rect([x - 0.6, z - 0.6, x + 0.6, z + 0.6], y, y + 2.2);
}
/** bollard: { at, y } — a cast-iron post of the kerb, a coal-hole's plate beside it */
export function bollard(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0;
  bag.add('iron', lathe([[0.1, 0], [0.09, 0.12], [0.07, 0.3], [0.1, 0.4], [0.1, 0.62], [0.06, 0.7], [0.001, 0.72]], 8, null, x, y, z)); col.circle?.([x, z], 0.12, y, y + 0.75);
}
/** street_stall: { at, y, rot } — a hot-chestnut / baked-potato can, a coster's trestle with a striped cloth: a small stall */
export function trestleStall(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, r = el.rot ?? 0, c = Math.cos(r), s = Math.sin(r), P = (a, b) => [x + a * c + b * s, z - a * s + b * c];
  const put = (m, a0, a1, y0, y1, b0, b1) => { const g = box(a0, y0, b0, a1, y1, b1); g.rotateY(r); g.translate(x, y, z); bag.add(m, g); };
  for (const sx of [-0.7, 0.7]) for (const sz of [-0.4, 0.4]) put('wood_dark', sx - 0.03, sx + 0.03, 0, 0.85, sz - 0.03, sz + 0.03);
  put('timber', -0.8, 0.8, 0.85, 0.9, -0.5, 0.5);
  for (let k = 0; k < 6; k++) put(k % 2 ? 'cloth_white' : 'cloth_red', -0.8 + k * 0.267, -0.533 + k * 0.267, 0.9, 0.92, -0.5, 0.5);
  for (let k = 0; k < 5; k++) put(el.goods ?? 'wicker', -0.6 + k * 0.3, -0.4 + k * 0.3, 0.92, 1.08, -0.2, 0.2);
  put('iron', -0.8, -0.74, 0.9, 1.9, -0.5, -0.44); put('iron', 0.74, 0.8, 0.9, 1.9, -0.5, -0.44);
  put('cloth_white', -0.82, 0.82, 1.9, 1.94, -0.55, 0.15);
  col.rect([x - 0.9, z - 0.6, x + 0.9, z + 0.6], y, y + 1.1); void P;
}
