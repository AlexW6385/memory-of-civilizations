// Joseon architecture (docs/settlements/joseon-seoul.md §4, §12): palace halls of the qing/ming
// vocabulary with a Joseon palette — grey tiles, red columns, dancheong in green and blue, granite
// platforms — and hanok houses: L- and U-shaped wings round a yard in a walled lot, tiled or
// thatched. The buildings and things of Gojong's palace and the 1880s town are in gojong.js.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, lathe, fromTriangles } from '../../core/geom.js';
import { rectRoof, beamTris, withPal, latticeBay } from '../ming/index.js';
import '../qing/index.js';
import { roofOrnaments, Parts, limb } from '../qing/carving.js';
import { dapo, dapoHeight, meoricho, muryangRoof, postLines } from './dancheong.js';
import { GOJONG } from './gojong.js';
import { yangbanHouse, officeRange } from './house.js';

export const JPAL = { wood: 'paint_dancheong', column: 'lacquer_red', soffit: 'paint_dancheong', base: 'granite_korea', floor: 'granite_korea', lattice: 'lattice_red', leaky: 'lattice_red', plaster: 'plaster_white', plinth: 'granite_korea', roof: 'tile_grey' };
const withJ = (fn) => (el, ctx) => fn({ ...el, pal: { ...JPAL, ...(el.pal || {}) } }, ctx);
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function roof(bag, [x0, z0, x1, z1], y, o, kind, rise, mat, alongZ, soffit = 'paint_dancheong') {
  const w = x1 - x0 + 2 * o, d = z1 - z0 + 2 * o, az = alongZ ?? d > w;
  rectRoof({ c: [(x0 + x1) / 2, (z0 + z1) / 2], A: (az ? d : w) / 2, B: (az ? w : d) / 2, y, rise: rise ?? Math.min(w, d) * 0.3, kind, sweep: 0.6, p: 1.5, alongZ: az, curl: false, mat, soffit }, bag);
}

/** ming_hall with el.orn (Joseon): the roof drawn here without curled ridge ends, to carry its white ridges, chwidu and japsang. */
function hallOrn(el, ctx) {
  const base = STYLES.qing.elements.ming_hall;
  if (!el.orn && !el.muryang && !el.dapo) return base(el, ctx);
  base({ ...el, roof: 'none' }, ctx);
  const [x0, z0, x1, z1] = el.rect, along = x1 - x0 >= z1 - z0, o = el.eave ?? 1.25, L = along ? x1 - x0 : z1 - z0, D = along ? z1 - z0 : x1 - x0;
  const fy = el.y + (el.H ?? 4.2), bk = el.dapo ? dapoHeight(el.dapo) : 0, posts = postLines(el);
  const r = { c: [(x0 + x1) / 2, (z0 + z1) / 2], A: L / 2 + o, B: D / 2 + o, y: fy - 0.25 + bk, rise: el.rise ?? (D / 2 + o) * 0.62, kind: el.muryang ? 'xieshan' : (el.roof || 'xieshan'), sweep: el.sweep ?? 1.0, alongZ: !along, mat: el.pal.roof, soffit: el.pal.soffit, curl: false };
  // moru dancheong on the beam under the eaves; the dapo bracket sets over it
  if (!el.simple) meoricho(ctx.bag, el.rect, posts, fy - 0.55, fy - 0.17, 0.14);
  if (bk) dapo(ctx.bag, el.rect, posts, fy - 0.17, el.dapo, (d) => r.y + r.rise * Math.pow(Math.max(0, (o - d) / r.B), 1.7) - 0.14);
  // the king's and queen's halls have no main ridge (the king being the dragon himself)
  if (el.muryang) muryangRoof({ ...r, plaster: el.pal.plaster }, ctx.bag); else rectRoof(r, ctx.bag);
  roofOrnaments(ctx.bag, r, { mat: el.pal.roof, joseon: true, white: !el.muryang, ends: !el.muryang, figures: el.orn?.figures ?? 5 });
}

/**
 * hanok: a house in its walled lot { rect, seed, thatch } (docs/settlements/joseon-seoul.md §5, §12):
 * an L- or U-shaped range of rooms on a stone base; toward the yard the posts with lattice doors
 * papered inside (changho) and a narrow wooden veranda (toenmaru) along them, an open-fronted hall
 * (daecheong) in the main range's middle bay; the back and the ends plastered white over the stone,
 * greyed by damp along the foot; tiled (or thatched) roofs; a low chimney at a wing's end; the crock
 * terrace (jangdokdae) in a corner of the yard with its earthenware jars of soy, paste and kimchi;
 * the lot's wall of fieldstone below and plaster above under a coping, its gate under a little roof.
 */
function hanok(el, { bag, col }) {
  const rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, W = x1 - x0, D = z1 - z0, thatch = el.thatch ?? rand() < 0.35;
  const d = Math.min(5, D * 0.32), mat = thatch ? 'thatch' : 'tile_grey', h = 2.6, yb = 0.6;
  const wings = [[x0 + 1.5, z0 + 1.5, x1 - 1.5, z0 + 1.5 + d, 's']];                    // the main range along the north side, facing the yard
  if (rand() < 0.7) wings.push([x0 + 1.5, z0 + 1.5 + d, x0 + 1.5 + d * 0.9, z1 - 3, 'e']);
  if (!thatch && rand() < 0.5) wings.push([x1 - 1.5 - d * 0.9, z0 + 1.5 + d, x1 - 1.5, z1 - 4, 'w']);
  for (const [i, wg] of wings.entries()) {
    const r = wg.slice(0, 4), face = wg[4], along = face === 's';
    bag.add('granite_korea', box(r[0] - 0.3, 0, r[1] - 0.3, r[2] + 0.3, yb, r[3] + 0.3));
    // the core of the rooms, set back from the yard front by the veranda's depth
    const v = 0.8, core = face === 's' ? [r[0], r[1], r[2], r[3] - v] : face === 'e' ? [r[0], r[1], r[2] - v, r[3]] : [r[0] + v, r[1], r[2], r[3]];
    bag.add('plaster_white', box(core[0], yb, core[1], core[2], yb + h, core[3]));
    bag.add('plaster_damp', box(core[0] - 0.012, yb, core[1] - 0.012, core[2] + 0.012, yb + 0.45, core[3] + 0.012));
    col.rect(core, 0, yb + h);
    // the posts along the yard front and the lattice doors between them, the veranda boards
    const n = Math.max(2, Math.round((along ? r[2] - r[0] : r[3] - r[1]) / 2.4)), L0 = along ? r[0] : r[1], L1 = along ? r[2] : r[3];
    const fl = face === 's' ? r[3] : face === 'e' ? r[2] : r[0], fc = face === 's' ? core[3] : face === 'e' ? core[2] : core[0], sg = face === 'w' ? -1 : 1;
    const P = (t, off) => (along ? [t, fl - 0.12 * sg + off] : [fl - 0.12 * sg + off, t]);
    for (let k = 0; k <= n; k++) {
      const t = L0 + (L1 - L0) * k / n, [px, pz] = P(t, 0);
      bag.add('timber', box(px - 0.1, yb, pz - 0.1, px + 0.1, yb + h, pz + 0.1));
      if (k < n) {
        const ta = t + 0.12, tb = L0 + (L1 - L0) * (k + 1) / n - 0.12, hall = i === 0 && n >= 3 && k === Math.floor(n / 2);
        const a = along ? [ta, fc + 0.03 * sg] : [fc + 0.03 * sg, ta], b = along ? [tb, fc + 0.03 * sg] : [fc + 0.03 * sg, tb];
        if (hall) {
          // the daecheong: open to the yard, its board floor and the dark of the hall behind
          const [qa, qb] = along ? [[ta, fc - 1.2], [tb, fc + 0.02]] : sg > 0 ? [[fc - 1.2, ta], [fc + 0.02, tb]] : [[fc - 0.02, ta], [fc + 1.2, tb]];
          bag.add('opening', box(Math.min(qa[0], qb[0]), yb + 0.5, Math.min(qa[1], qb[1]), Math.max(qa[0], qb[0]), yb + h - 0.35, Math.max(qa[1], qb[1])));
        } else latticeBay(bag, null, a, b, yb + 0.4, h - 0.55, rand() < 0.4 ? 'window' : 'door', 0.04);
      }
    }
    const t = [];
    beamTris(t, along ? [L0, yb + h - 0.28, fl - 0.12 * sg] : [fl - 0.12 * sg, yb + h - 0.28, L0], along ? [L1, yb + h - 0.28, fl - 0.12 * sg] : [fl - 0.12 * sg, yb + h - 0.28, L1], 0.11, 0.28);
    bag.add('timber', fromTriangles(t));
    const vr = face === 's' ? [r[0], core[3], r[2], r[3] + 0.1] : face === 'e' ? [core[2], r[1], r[2] + 0.1, r[3]] : [r[0] - 0.1, r[1], core[0], r[3]];
    bag.add('timber', box(vr[0], yb + 0.32, vr[1], vr[2], yb + 0.4, vr[3]));
    col.floor(vr, yb + 0.4);
    roof(bag, r, yb + h - 0.05, 0.9, thatch ? 'hip' : 'xieshan', Math.min(r[2] - r[0], r[3] - r[1]) * (thatch ? 0.5 : 0.42), mat, !along, 'timber');
    // a low chimney of stone and mud off the end of the range (the ondol's flue comes out there)
    if (i === 0) {
      const cx = rand() < 0.5 ? r[0] - 0.75 : r[2] + 0.75, cz = r[1] + 0.6;
      if (cx > x0 + 0.5 && cx < x1 - 0.5) { bag.add('schist_rubble', box(cx - 0.3, 0, cz - 0.3, cx + 0.3, 1.5, cz + 0.3)); bag.add('pottery_dark', lathe([[0.14, 0], [0.12, 0.35], [0.001, 0.35]], 8, null, cx, 1.5, cz)); col.rect([cx - 0.3, cz - 0.3, cx + 0.3, cz + 0.3], 0, 1.5); }
    }
  }
  // the crock terrace in the yard's south-east corner: a stone step, jars in rows
  const jx = x1 - 4.2, jz = z1 - 2.6;
  if (jx > x0 + 2 + d && rand() < 0.85) {
    bag.add('granite_korea', box(jx - 1.3, 0, jz - 0.8, jx + 1.3, 0.25, jz + 0.8));
    col.rect([jx - 1.3, jz - 0.8, jx + 1.3, jz + 0.8], 0, 0.9);
    for (let a = 0; a < 3; a++) for (let b = 0; b < 2; b++) {
      if (rand() < 0.2) continue;
      const big = b === 0, rr = big ? 0.3 : 0.22, hh = big ? 0.68 : 0.48, x = jx - 0.85 + a * 0.85 + (rand() - 0.5) * 0.08, z = jz - 0.35 + b * 0.7;
      bag.add('pottery_dark', lathe([[rr * 0.55, 0], [rr * 0.95, hh * 0.35], [rr, hh * 0.55], [rr * 0.7, hh * 0.9], [rr * 0.55, hh], [0.001, hh]], 10, null, x, 0.25, z));
      bag.add('pottery_dark', lathe([[rr * 0.62, 0], [rr * 0.58, 0.05], [0.001, 0.09]], 10, null, x, 0.25 + hh, z));
    }
  }
  // the lot's wall (fieldstone below, plaster above, a coping) and its gate on the south under a little roof
  const xc = (x0 + x1) / 2;
  for (const [a, b] of [[[x0, z0], [x1, z0]], [[x0, z0], [x0, z1]], [[x1, z0], [x1, z1]], [[x0, z1], [xc - 1.2, z1]], [[xc + 1.2, z1], [x1, z1]]]) {
    const t = []; beamTris(t, [a[0], 0, a[1]], [b[0], 0, b[1]], 0.27, 0.95); bag.add('schist_rubble', fromTriangles(t));
    const u = []; beamTris(u, [a[0], 0.95, a[1]], [b[0], 0.95, b[1]], 0.25, 0.95); bag.add('plaster_grey', fromTriangles(u));
    const c = []; beamTris(c, [a[0], 1.9, a[1]], [b[0], 1.9, b[1]], 0.4, 0.25); bag.add(thatch ? 'thatch' : 'tile_grey', fromTriangles(c));
    col.segment(a, b, 0.5, 0, 2.1);
  }
  for (const sx of [-1, 1]) bag.add('timber', box(xc + sx * 1.2 - 0.1, 0, z1 - 0.1, xc + sx * 1.2 + 0.1, 2.5, z1 + 0.1));
  bag.add('timber', box(xc - 1.4, 2.35, z1 - 0.12, xc + 1.4, 2.55, z1 + 0.12));
  roof(bag, [xc - 1.3, z1 - 0.5, xc + 1.3, z1 + 0.5], 2.5, 0.5, thatch ? 'hip' : 'gable', 0.7, mat, false, 'timber');
  // the gate's two plank leaves (daemun), one swung back against the wall, the other half open, an iron ring on each; a threshold stone
  {
    const open = rand() < 0.5, hw = 1.2;
    bag.add('granite_korea', box(xc - hw, 0, z1 - 0.2, xc + hw, 0.08, z1 + 0.2));
    bag.add('planks_grey', box(xc - hw - 0.04, 0.1, z1 - 0.9, xc - hw + 0.04, 2.3, z1 - 0.1));
    if (open) bag.add('planks_grey', box(xc + hw - 0.04, 0.1, z1 - 0.9, xc + hw + 0.04, 2.3, z1 - 0.1));
    else { bag.add('planks_grey', box(xc + 0.04, 0.1, z1 - 0.05, xc + hw - 0.02, 2.3, z1 + 0.03)); bag.add('iron', box(xc + 0.2, 1.2, z1 + 0.03, xc + 0.3, 1.3, z1 + 0.05)); }
    bag.add('planks_grey', box(xc - hw + 0.02, 0.1, z1 - 0.05, xc - 0.04, 2.3, z1 + 0.03)); bag.add('iron', box(xc - 0.3, 1.2, z1 + 0.03, xc - 0.2, 1.3, z1 + 0.05));
    if (!open) col.rect([xc - hw, z1 - 0.1, xc + hw, z1 + 0.1], 0, 2.3);
  }
  // a storehouse (gwangchae) against the street wall, west or east of the gate: plastered walls on a stone foot, its own little roof
  if (rand() < 0.55) {
    const jxc = x1 - 4.2, west = rand() < 0.5 || xc + 6 > jxc - 1.3, sx0 = west ? xc - 5.8 : xc + 2.2, rr = [sx0, z1 - 2.5, sx0 + 3.6, z1 - 0.3];
    bag.add('granite_korea', box(rr[0] - 0.1, 0, rr[1] - 0.1, rr[2] + 0.1, 0.35, rr[3]));
    bag.add('plaster_white', box(rr[0], 0.35, rr[1], rr[2], 2.2, rr[3] - 0.15)); bag.add('plaster_damp', box(rr[0] - 0.01, 0.35, rr[1] - 0.01, rr[2] + 0.01, 0.75, rr[3] - 0.14));
    bag.add('planks_grey', box(rr[0] + 1.1, 0.35, rr[1] - 0.04, rr[0] + 2.5, 2.0, rr[1])); bag.add('timber', box(rr[0], 2.0, rr[1] - 0.06, rr[2], 2.2, rr[1]));
    col.rect(rr, 0, 2.3);
    roof(bag, [rr[0], rr[1], rr[2], rr[3] - 0.1], 2.15, 0.45, thatch ? 'hip' : 'xieshan', 0.8, mat, false, 'timber');
  }
  // peppers, corn and persimmons strung under the eave of the main range: red and ochre strings along its veranda
  {
    const r = wings[0], zf = r[3] - 0.8 + 0.1, nstr = 3 + Math.floor(rand() * 5);
    for (let q = 0; q < nstr; q++) {
      const x = r[0] + 1 + rand() * (r[2] - r[0] - 2), m = ['cloth_red', 'cloth_ochre', 'cloth_red'][Math.floor(rand() * 3)];
      bag.add('rope_fibre', box(x - 0.01, yb + h - 1.1, zf - 0.01, x + 0.01, yb + h - 0.3, zf + 0.01));
      for (let k = 0; k < 4; k++) bag.add(m, box(x - 0.05, yb + h - 0.85 + k * 0.15, zf - 0.05, x + 0.05, yb + h - 0.72 + k * 0.15, zf + 0.05));
    }
  }
}

const hanokPal = { wood: 'timber', column: 'timber', soffit: 'timber', lattice: 'shoji', plaster: 'plaster_white', base: 'granite_korea' };
registerStyle('joseon', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: {
    ...STYLES.qing.elements,
    ...Object.fromEntries(['ming_hall', 'qing_hall', 'ming_gallery', 'palace_wall', 'terrace', 'stairs', 'ming_pavilion', 'corner_tower', 'throne_hall'].filter((k) => STYLES.qing.elements[k]).map((k) => [k, withJ(STYLES.qing.elements[k])])),
    ming_hall: withJ(withPal(hallOrn)),
    ...Object.fromEntries(Object.entries(GOJONG).map(([k, f]) => [k, withJ(withPal(f))])),
    yangban_house: (el, ctx) => withPal(yangbanHouse)({ ...el, pal: { ...hanokPal, ...(el.pal || {}) } }, ctx),
    joseon_precinct_range: (el, ctx) => withPal(officeRange)({ ...el, pal: { ...hanokPal, ...(el.pal || {}) } }, ctx),
    hanok: (el, ctx) => withPal(hanok)({ ...el, pal: { ...hanokPal, ...(el.pal || {}) } }, ctx),
  },
  objects: {},
});
