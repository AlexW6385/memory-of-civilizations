// The Edo compound (docs/settlements/benin-city.md §5): a gabled range on the street with its doorway open (no doors, Pinto), a
// passage to the court, ranges on three sides under lean-to roofs sloping to the impluvium, the back range higher with a verandah on
// posts; walls of red clay polished and ridged in bands; roofs of palm thatch (a chief's of shingle); a well and pots in the court.
import { fromTriangles, quad } from '../../core/geom.js';
import { frame } from '../greek/agora.js';
import { rng, wallMat, clayWall, gable, lean, pillar, box, lathe } from './kit.js';

/** benin_house: { rect, front ('n' | 's': the street), seed, y, chief, simple (far) }. */
function house(el, ctx) {
  const { bag, col } = ctx, rand = rng(el.seed || 1), y = el.y ?? 0, F = frame(el.rect, el.front ?? 's'), { L, D } = F, simple = el.simple, chief = !!el.chief;
  const wm = wallMat(rand), roof = chief ? 'roof_bark' : 'thatch_palm', P = F.P, R = F.R;
  const H1 = chief ? 3.8 : 3.1, Y = 0.25;
  const wall = (u0, v0, u1, v1, h, op = []) => { const a = P(u0, v0), b = P(u1, v1); clayWall(ctx, a, b, 0.55, y + Y, y + h, wm, op.map((o) => ({ ...o })), !simple); };
  const rr = (u0, v0, u1, v1) => R(u0, v0, u1, v1);
  const fd = 5.4, bd = 6.4, sw = 3.8, du = L * (0.3 + 0.4 * rand()), dw = 2.4;
  // the platform of beaten clay under all, the steps at the door
  bag.add('tuff_red', box(el.rect[0], y - 0.3, el.rect[1], el.rect[2], y + Y, el.rect[3])); col.floor(el.rect, y + Y);
  for (let i = 0; i < 2; i++) { const r = rr(du - 1.5 - i * 0.2, -0.5 - i * 0.45, du + dw + 1.5 + i * 0.2, 0); bag.add('tuff_red', box(r[0], y - 0.3, r[1], r[2], y + 0.12 + (1 - i) * 0.0 + (i ? 0 : 0.0), r[3])); col.floor(r, y + 0.12); }
  // the walls round the compound: the street front with the open doorway, the sides, the back
  wall(0, 0.3, L, 0.3, H1, [{ at: du + dw / 2, w: dw, h: 2.5 }]);
  wall(0.3, 0, 0.3, D, H1); wall(L - 0.3, 0, L - 0.3, D, H1);
  wall(0, D - 0.3, L, D - 0.3, H1 + 0.6, [{ at: L * 0.5, w: 1.4, h: 2.3 }]);
  // the front range: the cross wall to the court with the passage, a gable of thatch along the street
  wall(0, fd, L, fd, H1, [{ at: du + dw / 2, w: dw, h: 2.5 }]);
  gable(ctx, rr(0, 0, L, fd), y + H1, chief ? 2.4 : 2.9, roof, F.alongX ? 'x' : 'z', 0.55);
  bag.add('timber', box(...[rr(0, 0, L, fd)[0], y + H1 - 0.1, rr(0, 0, L, fd)[1], rr(0, 0, L, fd)[2], y + H1, rr(0, 0, L, fd)[3]]));
  // the side ranges (lean-to, sloping to the court) and the back range with its verandah
  const low = { n: 'zp', s: 'zn', e: 'xn', w: 'xp' };
  void low;
  const sideR = (u0, u1) => rr(u0, fd, u1, D - bd);
  const lowSide = (F.out[0] !== 0 ? F.out[0] > 0 ? 'xp' : 'xn' : 'xp');
  void lowSide;
  const sidesLow = (side) => { // the roof's low edge toward the court
    const o = F.out; // direction from the house toward the street
    if (o[1] !== 0) return side === 0 ? 'xp' : 'xn';
    return side === 0 ? 'zp' : 'zn';
  };
  lean(ctx, sideR(0, sw), sidesLow(0), y + H1 - 0.7, y + H1 + 0.7, roof, 0.4, !simple);
  lean(ctx, sideR(L - sw, L), sidesLow(1), y + H1 - 0.7, y + H1 + 0.7, roof, 0.4, !simple);
  const back = rr(0, D - bd, L, D), backLow = o2(F);
  lean(ctx, back, backLow, y + H1 - 0.5, y + H1 + 1.4, roof, 0.4, !simple);
  // the posts of the verandahs on the court's edge (the chief's sheathed in brass)
  const posts = [];
  const nb = Math.max(3, Math.round(L / 3.4));
  for (let i = 0; i <= nb; i++) posts.push([0.9 + i * (L - 1.8) / nb, D - bd + 0.3]);
  for (let v = fd + 1; v < D - bd - 1; v += 3.2) { posts.push([sw - 0.3, v], [L - sw + 0.3, v]); }
  for (const [u, v] of posts) {
    const [px, pz] = P(u, v);
    if (chief) pillar(ctx, px, pz, y + Y, H1 - 0.5, 0.18);
    else { bag.add('palm_trunk', lathe([[0.13, 0], [0.12, H1 - 0.5]], 6, null, px, y + Y, pz)); col.circle(px, pz, 0.14, y + Y, y + H1); }
  }
  // the court: an impluvium, a well-head, pots
  const cu = L / 2, cv = (fd + D - bd) / 2, iw = Math.min(3.0, (L - 2 * sw) * 0.4), id = Math.min(2.4, (D - bd - fd) * 0.4);
  if (iw > 1.2 && id > 1.2) {
    const out = rr(cu - iw / 2 - 0.35, cv - id / 2 - 0.35, cu + iw / 2 + 0.35, cv + id / 2 + 0.35), inn = rr(cu - iw / 2, cv - id / 2, cu + iw / 2, cv + id / 2);
    bag.add('stucco_red', box(out[0], y + Y, out[1], out[2], y + Y + 0.2, out[3])); col.rect(out, y + Y, y + Y + 0.4);
    bag.add('pottery_dark', box(inn[0], y + Y, inn[1], inn[2], y + Y + 0.21, inn[3]));
    const t = []; quad(t, [inn[0], y + Y + 0.22, inn[1]], [inn[0], y + Y + 0.22, inn[3]], [inn[2], y + Y + 0.22, inn[3]], [inn[2], y + Y + 0.22, inn[1]]);
    bag.add('water', fromTriangles(t));
  }
  if (!simple) {
    const [wx, wz] = P(sw + 1.4, fd + 1.5);
    bag.add('stucco_red', lathe([[0.55, 0], [0.5, 0.7], [0.38, 0.7], [0.001, 0.62]], 10, null, wx, y + Y, wz)); col.circle(wx, wz, 0.55, y + Y, y + Y + 0.7);
    const [px, pz] = P(L - sw - 1.2, fd + 1.4);
    bag.add('terracotta', lathe([[0.001, 0], [0.2, 0.02], [0.32, 0.3], [0.3, 0.55], [0.2, 0.68], [0.001, 0.66]], 8, null, px, y + Y, pz));
    const [qx, qz] = P(L - sw - 2.2, fd + 1.0);
    bag.add('pottery_dark', lathe([[0.001, 0], [0.16, 0.02], [0.26, 0.24], [0.24, 0.44], [0.001, 0.48]], 8, null, qx, y + Y, qz));
  }
}
function o2(F) { const o = F.out; return o[1] !== 0 ? (o[1] > 0 ? 'zp' : 'zn') : (o[0] > 0 ? 'xp' : 'xn'); }
export const HOUSES = { benin_house: house };
void gable;
