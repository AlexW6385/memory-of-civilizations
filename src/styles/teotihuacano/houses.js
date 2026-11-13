// The houses of those who serve the avenue and its temples (docs/settlements/teotihuacan.md §5b): not whole apartment compounds but their
// smaller kin — one block of rooms behind a portico on a low plastered platform: the priest's house (higher, its roof crowned with almenas, a shrine
// behind the middle door), the dwelling (a sleeping room and a kitchen), the workshop house (obsidian, pottery or weaving at the front, a store behind).
// Built from the same room blocks as the compounds' (rooms.js): a doorway into each room from the portico, plastered walls with a red dado, a
// roof of beams, the hearth and the jars, the lamp, the people at home. Some stand in a low-walled forecourt with a gate.
import { box, frustum } from '../../core/geom.js';
import { porticoRooms } from './rooms.js';
import { ttStair } from './index.js';
import { put, waterJarKit, storeJarKit } from '../maya/household.js';
import { rng } from './street.js';

const S = 'stucco_ochre', RD = 'stucco_red', WH = 'stucco_pale';
const DIR = { e: [1, 0], w: [-1, 0], s: [0, 1], n: [0, -1] };

/**
 * tt_house { rect (the block with its portico), face ('e' | 'w' | 'n' | 's': the portico's side), y (the ground it stands on), kind ('lodge' | 'dwelling' | 'workshop' | 'potter' | 'weaver'),
 * seed, yard (a walled forecourt, metres deep, 0 for none), simple }.
 */
export function ttHouse(el, ctx) {
  const { bag, col } = ctx, rand = rng(el.seed || 1), r = el.rect, [x0, z0, x1, z1] = r, y = el.y ?? 0, [fx, fz] = DIR[el.face];
  const kind = el.kind || 'dwelling', lodge = kind === 'lodge', ph = lodge ? 1.1 : 0.5, rh = lodge ? 3.6 : 3.0, pd = lodge ? 2.8 : 2.4;
  const edge = fx ? (fx > 0 ? x1 : x0) : (fz > 0 ? z1 : z0), L = fx ? z1 - z0 : x1 - x0;
  // the platform, plastered; the colour of its talud differs from house to house
  bag.add(lodge ? RD : kind === 'dwelling' ? WH : S, frustum(r, y, y + ph, 0, 0, 0, 0, { noBottom: true })); col.rect(r, y, y + ph); col.floor(r, y + ph);
  if (el.simple) { bag.add(S, box(x0 + 0.6, y + ph, z0 + 0.6, x1 - 0.6, y + rh, z1 - 0.6)); col.rect([x0 + 0.6, z0 + 0.6, x1 - 0.6, z1 - 0.6], y + ph, y + rh); return; }
  const mx = (x0 + x1) / 2, mz = (z0 + z1) / 2, sw = Math.min(1.6, L * 0.14);
  ttStair({ rect: fx ? [fx > 0 ? edge : edge - ph * 1.6, mz - sw, fx > 0 ? edge + ph * 1.6 : edge, mz + sw] : [mx - sw, fz > 0 ? edge : edge - ph * 1.6, mx + sw, fz > 0 ? edge + ph * 1.6 : edge], y0: y + 0.06, y1: y + ph, dir: { e: 'w', w: 'e', s: 'n', n: 's' }[el.face], mat: S }, ctx);
  // the rooms behind the portico, each with its doorway on it, furnished
  const back = fx ? (fx > 0 ? [x0, z0, x1 - pd, z1] : [x0 + pd, z0, x1, z1]) : (fz > 0 ? [x0, z0, x1, z1 - pd] : [x0, z0 + pd, x1, z1]);
  const nr = L > 11.5 ? 3 : 2;
  const roles = lodge ? (nr === 3 ? ['sleep', 'shrine', 'sleep'] : ['shrine', 'sleep'])
    : kind === 'workshop' ? ['workshop', 'store'] : kind === 'potter' ? ['potter', 'store'] : kind === 'weaver' ? ['weaver', 'sleep'] : (nr === 3 ? ['sleep', 'kitchen', 'store'] : ['sleep', 'kitchen']);
  porticoRooms(ctx, back, [fx, fz], y + ph, y + rh - 0.45, roles, rand);
  bag.add(S, box(x0, y + rh - 0.45, z0, x1, y + rh, z1)); col.floor(r, y + rh);
  for (const t of [1 / 3, 2 / 3]) {
    const u = (fx ? z0 : x0) + L * t, [px, pz] = fx ? [edge - fx * 0.45, u] : [u, edge - fz * 0.45];
    bag.add(S, box(px - 0.3, y + ph, pz - 0.3, px + 0.3, y + rh - 0.45, pz + 0.3)); bag.add(RD, box(px - 0.32, y + ph, pz - 0.32, px + 0.32, y + ph + 0.5, pz + 0.32));
    col.rect([px - 0.3, pz - 0.3, px + 0.3, pz + 0.3], y + ph, y + rh);
  }
  bag.add(RD, box(x0 - 0.03, y + rh - 0.45, z0 - 0.03, x1 + 0.03, y + rh - 0.2, z1 + 0.03));       // the painted cornice band
  if (lodge) for (let t = 0.6; t < L - 0.4; t += 1.2) {                                            // the crest of almenas over the portico
    const [ax, az] = fx ? [edge - fx * 0.25, (z0 + t)] : [(x0 + t), edge - fz * 0.25];
    bag.add(S, box(ax - (fx ? 0.09 : 0.3), y + rh, az - (fx ? 0.3 : 0.09), ax + (fx ? 0.09 : 0.3), y + rh + 0.7, az + (fx ? 0.3 : 0.09)));
    bag.add(RD, box(ax - (fx ? 0.11 : 0.12), y + rh + 0.25, az - (fx ? 0.12 : 0.11), ax + (fx ? 0.11 : 0.12), y + rh + 0.55, az + (fx ? 0.12 : 0.11)));
  }
  // jars by the stair, a bench of plaster on the other side
  const sideU = (fx ? mz : mx) + (rand() < 0.5 ? -1 : 1) * (sw + 1.2), [jx, jz] = fx ? [edge + fx * 0.9, sideU] : [sideU, edge + fz * 0.9];
  put(bag, waterJarKit(), jx, y, jz, 0); col.circle(jx, jz, 0.33, y, y + 0.8);
  put(bag, storeJarKit(), jx + (fx ? 0 : 0.7), y, jz + (fx ? 0.7 : 0), 0); col.circle(jx + (fx ? 0 : 0.7), jz + (fx ? 0.7 : 0), 0.28, y, y + 0.6);
  // the walled forecourt: a low plastered wall on three sides with a gate in the front, its lintel painted
  const yd = el.yard ?? 0;
  if (yd > 0) {
    const t = 0.35, wh = 1.1, gw = 0.9, [ox, oz] = fx ? [edge + fx * yd, mz] : [mx, edge + fz * yd];
    const wall = (a, b, c, d) => { bag.add(S, box(a, y, b, c, y + wh, d)); col.rect([a, b, c, d], y, y + wh); bag.add(RD, box(a - 0.03, y + wh, b - 0.03, c + 0.03, y + wh + 0.1, d + 0.03)); };
    if (fx) {
      const xa = Math.min(edge, edge + fx * yd), xb = Math.max(edge, edge + fx * yd);
      wall(xa, z0, xb, z0 + t); wall(xa, z1 - t, xb, z1);                                           // the sides
      wall(fx > 0 ? ox - t : ox, z0, fx > 0 ? ox : ox + t, mz - gw); wall(fx > 0 ? ox - t : ox, mz + gw, fx > 0 ? ox : ox + t, z1);
      bag.add(RD, box(fx > 0 ? ox - t - 0.04 : ox - 0.04, y + 1.9, mz - gw - 0.2, fx > 0 ? ox + 0.04 : ox + t + 0.04, y + 2.2, mz + gw + 0.2));
      for (const s of [-1, 1]) bag.add(S, box(fx > 0 ? ox - t : ox, y + wh, mz + s * gw - (s > 0 ? 0 : 0.2), fx > 0 ? ox : ox + t, y + 1.9, mz + s * gw + (s > 0 ? 0.2 : 0)));
    } else {
      const za = Math.min(edge, edge + fz * yd), zb = Math.max(edge, edge + fz * yd);
      wall(x0, za, x0 + t, zb); wall(x1 - t, za, x1, zb);
      wall(x0, fz > 0 ? oz - t : oz, mx - gw, fz > 0 ? oz : oz + t); wall(mx + gw, fz > 0 ? oz - t : oz, x1, fz > 0 ? oz : oz + t);
      bag.add(RD, box(mx - gw - 0.2, y + 1.9, fz > 0 ? oz - t - 0.04 : oz - 0.04, mx + gw + 0.2, y + 2.2, fz > 0 ? oz + 0.04 : oz + t + 0.04));
      for (const s of [-1, 1]) bag.add(S, box(mx + s * gw - (s > 0 ? 0 : 0.2), y + wh, fz > 0 ? oz - t : oz, mx + s * gw + (s > 0 ? 0.2 : 0), y + 1.9, fz > 0 ? oz : oz + t));
    }
  }
}
