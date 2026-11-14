// Victorian Gothic Revival and the Victorian terrace (London about 1870; docs/settlements/london.md
// §4): the Palace of Westminster's long river front of pale limestone in bays of tall windows and
// pinnacles, the Victoria Tower, the Clock Tower with its four faces and spire, the central spire;
// the brick terraces with slate roofs, chimney stacks and bay windows.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, frustum, lathe } from '../../core/geom.js';
import '../gothic/town.js';
import '../vernacular/index.js';
import { riverFront } from './palace.js';
import { ironBridge, embankment } from './bridge.js';
import { abbey } from './abbey.js';
import { westminsterHall } from './hall.js';
import { stStephens, centralLobby, commons, lords } from './interior.js';
import { clockDial } from './dial.js';
import { faceFrame } from '../dutch/facade.js';
import { terraceRich, shopHouse, pub, pillarBox, drinkingFountain, bollard, trestleStall } from './shops.js';
import { parliamentSquare, barrelOrgan, punchBooth } from './square.js';
import { hansomCab, omnibus, gasLamp, paddleSteamer, lighter, steamboatPier, sailingBarge, wherry, riverStairs } from './street.js';

const S = 'limestone_yellow', SL = 'slate';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const pinnacle = (bag, x, y, z, s = 0.6, h = 3) => { bag.add(S, box(x - s / 2, y, z - s / 2, x + s / 2, y + h * 0.4, z + s / 2)); bag.add(S, lathe([[s * 0.5, 0], [0.001, h * 0.6]], 4, null, x, y + h * 0.4, z)); };
/** gothic_tower: { c, s, h, y, clock, spire, crown } — a square tower with corner turrets, tracery panels, the clock stage, a spire or a crown of pinnacles. */
function gothicTower(el, { bag, col }) {
  const [x, z] = el.c, s = el.s ?? 12, h = el.h ?? 96, y = el.y ?? 0, body = el.clock ? h * 0.58 : h * 0.86;
  bag.add(S, box(x - s / 2, y - 0.5, z - s / 2, x + s / 2, y + body, z + s / 2)); col.rect([x - s / 2 - 0.2, z - s / 2 - 0.2, x + s / 2 + 0.2, z + s / 2 + 0.2], y, y + h);
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const tx = x + dx * s / 2, tz = z + dz * s / 2; bag.add(S, lathe([[s * 0.09, 0], [s * 0.09, body + 2]], 8, null, tx, y, tz)); col.circle(tx, tz, s * 0.09 + 0.05, y, y + body + 2); pinnacle(bag, tx, y + body + 2, tz, s * 0.12, s * 0.5); }
  // each face in a frame: R(u0, u1, y0, y1, d0, d1) a box with u along the face, d outward from it
  const face = (f) => { const sg = f === 'n' || f === 'w' ? -1 : 1, along = f === 'n' || f === 's', o = along ? z + sg * s / 2 : x + sg * s / 2, c = along ? x : z;
    return (u0, u1, y0, y1, d0, d1) => { const a = o + sg * d0, b = o + sg * d1; return along ? box(c + u0, y0, Math.min(a, b), c + u1, y1, Math.max(a, b)) : box(Math.min(a, b), y0, c + u0, Math.max(a, b), y1, c + u1); }; };
  // the faces in storeys of Perpendicular panelling: tall narrow panels between mullions, a string course
  // over each storey, the windows dark within the panels
  const storeys = el.clock ? 7 : 8, sh = (body - 2) / storeys;
  for (const f of 'nsew') {
    const R = face(f), np = 4, pw = s * 0.62 / np;
    for (let k = 0; k < storeys; k++) {
      const y0 = y + 2 + k * sh;
      bag.add(S, R(-s / 2, s / 2, y0 + sh - 0.35, y0 + sh, 0, 0.18));
      for (let i = 0; i <= np; i++) { const u = -s * 0.31 + i * pw; bag.add(S, R(u - 0.09, u + 0.09, y0 + 0.2, y0 + sh - 0.35, 0, 0.12)); }
      if (k % 2 === 1 || k === storeys - 1) for (let i = 0; i < np; i++) { const u = -s * 0.31 + (i + 0.5) * pw; bag.add('opening', R(u - pw * 0.3, u + pw * 0.3, y0 + sh * 0.25, y0 + sh * 0.8, -0.02, 0.04)); }
    }
  }
  if (el.clock) {
    const cy = y + body, cs = s * 1.08, ch = h * 0.12;
    bag.add(S, box(x - cs / 2, cy, z - cs / 2, x + cs / 2, cy + ch, z + cs / 2));
    // the dials: 7 m of opal glass in their iron frames, the gilt surrounds with blue corners, the hands, the prayer below
    for (const f of 'nsew') clockDial(bag, faceFrame([x - cs / 2, z - cs / 2, x + cs / 2, z + cs / 2], f), cs / 2, cy + ch * 0.5 + 0.3, 3.5);
    // the belfry: an open arcade of pointed openings on each face, louvres within; pinnacles at its corners
    const by = cy + ch, bh = h * 0.08, bs = s * 0.88;
    bag.add(S, box(x - bs / 2, by, z - bs / 2, x + bs / 2, by + bh, z + bs / 2));
    for (const f of 'nsew') {
      const sg = f === 'n' || f === 'w' ? -1 : 1, along = f === 'n' || f === 's', o = along ? z + sg * bs / 2 : x + sg * bs / 2;
      for (let i = -1; i <= 1; i++) {
        const u = i * bs * 0.3, w = bs * 0.11;
        const B = (u0, u1, y0, y1, d0, d1) => { const a = o + sg * d0, b = o + sg * d1; return along ? box(x + u0, y0, Math.min(a, b), x + u1, y1, Math.max(a, b)) : box(Math.min(a, b), y0, z + u0, Math.max(a, b), y1, z + u1); };
        bag.add('opening', B(u - w, u + w, by + bh * 0.15, by + bh * 0.8, -0.02, 0.04));
        for (let l = 1; l < 6; l++) bag.add('lead', B(u - w, u + w, by + bh * (0.15 + l * 0.11) - 0.05, by + bh * (0.15 + l * 0.11) + 0.05, 0.05, 0.12));
      }
    }
    for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) pinnacle(bag, x + dx * bs / 2, by + bh, z + dz * bs / 2, s * 0.08, s * 0.45);
    bag.add('iron_galv', frustum([x - s * 0.45, z - s * 0.45, x + s * 0.45, z + s * 0.45], by + bh, y + h - 3, s * 0.44, s * 0.44, s * 0.44, s * 0.44));
    // small gabled lucarnes on the spire
    for (const f of 'nsew') { const R = face(f); const yy = by + bh + (h - 3 - body - ch - bh) * 0.25; bag.add('iron_galv', R(-0.8, 0.8, yy, yy + 2.4, -s * 0.17, -s * 0.05)); }
    bag.add('gilt_bronze', lathe([[0.3, 0], [0.15, 3], [0.001, 3.6]], 6, null, x, y + h - 3, z));
  } else if (el.spire) bag.add('lead', lathe([[s * 0.5, 0], [0.001, h - body]], 8, null, x, y + body, z));
  else { bag.add(S, box(x - s / 2 - 0.3, y + body, z - s / 2 - 0.3, x + s / 2 + 0.3, y + body + 1, z + s / 2 + 0.3)); bag.add('iron', lathe([[0.1, 0], [0.08, h - body]], 6, null, x, y + body, z)); }
}
/** terrace_house: { rect, seed, front, storeys, y } — brick, a slate roof running along the street, chimney stacks, a bay window. */
function terraceHouseBase(el, { bag, col }) {
  const rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, n = el.storeys ?? 3, st = 3.2, H = n * st, f = el.front ?? 's', along = f === 'n' || f === 's';
  const mat = rand() < 0.3 ? 'brick_buff' : 'brick';
  const open = el.open && !el.simple && along;
  if (open) { bag.add(mat, box(x0, y + st, z0, x1, y + H, z1)); col.rect(el.rect, y + st, y + H); terraceInterior(el, { bag, col }, mat, st); }
  else { bag.add(mat, box(x0, y - 0.5, z0, x1, y + H, z1)); col.rect(el.rect, y - 0.5, y + H); }
  const L = along ? x1 - x0 : z1 - z0, D = along ? z1 - z0 : x1 - x0, k = Math.max(1, Math.round(L / 5.5));
  for (let s = 0; s < n; s++) for (let i = 0; i < k * 2; i++) {
    const u = (along ? x0 : z0) + (i + 0.5) * L / (k * 2), yy = y + s * st + (s === 0 ? 0.6 : 0.9);
    // the stucco surround, the sash window within it (prouder), its bars; the door with its fanlight on the ground floor
    const fr = (d0, d1, m) => (f === 's' ? [u - 0.55 - m, z1 + d0, u + 0.55 + m, z1 + d1] : f === 'n' ? [u - 0.55 - m, z0 - d1, u + 0.55 + m, z0 - d0] : f === 'e' ? [x1 + d0, u - 0.55 - m, x1 + d1, u + 0.55 + m] : [x0 - d1, u - 0.55 - m, x0 - d0, u + 0.55 + m]);
    const door = s === 0 && i % 2 === 0, hh = door ? 2.6 : s === 1 ? 2.2 : 1.8, y0 = door ? y + 0.4 : yy;
    const a1 = fr(-0.02, 0.05, 0.1), a2 = fr(0.05, 0.08, -0.04), bar = fr(0.08, 0.1, -0.5);
    if (el.simple) { bag.add('opening', box(a2[0], y0, a2[1], a2[2], y0 + hh, a2[3])); continue; }
    if (open && s === 0) {
      // the open house's ground floor: the doorway and the window are real openings (terraceInterior); here only their
      // stucco surrounds as strips round them, the fanlight, the sash bars over the glass, the stone steps
      const strip = (u0, u1, ya, yb) => { const r = fr(-0.02, 0.05, 0.1); bag.add('plaster_white', box(Math.max(r[0], u0), ya, r[1], Math.min(r[2], u1), yb, r[3])); };
      strip(u - 0.65, u - 0.55, y0 - 0.1, y0 + hh + 0.1); strip(u + 0.55, u + 0.65, y0 - 0.1, y0 + hh + 0.1); strip(u - 0.65, u + 0.65, y0 + hh, y0 + hh + 0.1);
      if (door) { strip(u - 0.65, u + 0.65, y0 + hh * 0.78, y0 + hh * 0.8); const st2 = fr(0.0, 0.9, 0.15), st3 = fr(0.0, 0.45, 0.15); bag.add('limestone', box(st2[0], y - 0.3, st2[1], st2[2], y + 0.2, st2[3])); bag.add('limestone', box(st3[0], y + 0.2, st3[1], st3[2], y + 0.4, st3[3])); }
      else { strip(u - 0.65, u + 0.65, y0 - 0.1, y0); bag.add('plaster_white', box(bar[0], y0, bar[1], bar[2], y0 + hh, bar[3])); const hb = fr(0.08, 0.1, -0.04); bag.add('plaster_white', box(hb[0], y0 + hh / 2 - 0.03, hb[1], hb[2], y0 + hh / 2 + 0.03, hb[3])); }
      continue;
    }
    bag.add('plaster_white', box(a1[0], y0 - 0.1, a1[1], a1[2], y0 + hh + (s === 1 ? 0.35 : 0.1), a1[3]));
    bag.add(door ? 'wood_dark' : 'opening', box(a2[0], y0, a2[1], a2[2], y0 + hh * (door ? 0.78 : 1), a2[3]));
    if (door) { bag.add('opening', box(a2[0], y0 + hh * 0.8, a2[1], a2[2], y0 + hh, a2[3])); const st2 = fr(0.0, 0.9, 0.15); bag.add('limestone', box(st2[0], y - 0.3, st2[1], st2[2], y + 0.4, st2[3])); }
    else { bag.add('plaster_white', box(bar[0], y0, bar[1], bar[2], y0 + hh, bar[3])); const hb = fr(0.08, 0.1, -0.04); bag.add('plaster_white', box(hb[0], y0 + hh / 2 - 0.03, hb[1], hb[2], y0 + hh / 2 + 0.03, hb[3])); }
  }
  // a stucco cornice and parapet; the area railings in front
  bag.add('plaster_white', box(x0 - 0.15, y + H - 0.4, z0 - 0.15, x1 + 0.15, y + H, z1 + 0.15));
  if (open) bag.add('plaster_white', f === 's' ? box(x0 - 0.05, y + 0.3, z1 - 0.3, x1 + 0.05, y + 0.6, z1 + 0.05) : box(x0 - 0.05, y + 0.3, z0 - 0.05, x1 + 0.05, y + 0.6, z0 + 0.3));   // the plinth band only along the front, the house being hollow
  else bag.add('plaster_white', box(x0 - 0.05, y + 0.3, z0 - 0.05, x1 + 0.05, y + 0.6, z1 + 0.05));
  { const off = 1.5, rl = f === 's' ? [x0, z1 + off, x1, z1 + off + 0.05] : f === 'n' ? [x0, z0 - off - 0.05, x1, z0 - off] : f === 'e' ? [x1 + off, z0, x1 + off + 0.05, z1] : [x0 - off - 0.05, z0, x0 - off, z1];
    bag.add('iron', box(rl[0], y + 0.9, rl[1], rl[2], y + 0.95, rl[3]));
    if (!el.simple) for (let u = (along ? x0 : z0) + 0.15; u < (along ? x1 : z1); u += 0.3) bag.add('iron', along ? box(u - 0.012, y, rl[1], u + 0.012, y + 1.0, rl[3]) : box(rl[0], y, u - 0.012, rl[2], y + 1.0, u + 0.012)); }
  bag.add(SL, frustum([x0 - 0.2, z0 - 0.2, x1 + 0.2, z1 + 0.2], y + H, y + H + D * 0.32, along ? 0 : D / 2 + 0.15, along ? 0 : D / 2 + 0.15, along ? D / 2 + 0.15 : 0, along ? D / 2 + 0.15 : 0));
  // the chimney stacks on the party walls (one per wall: the neighbour's is the same stack), a stone
  // coping and a row of terracotta pots, one for each flue
  for (let i = 0; i < k; i++) {
    const u = (along ? x0 : z0) + i * L / k, c = along ? [u - 0.5, (z0 + z1) / 2 - 0.4, u + 0.5, (z0 + z1) / 2 + 0.4] : [(x0 + x1) / 2 - 0.4, u - 0.5, (x0 + x1) / 2 + 0.4, u + 0.5], top = y + H + D * 0.32 + 1.4;
    bag.add(mat, box(c[0], y + H, c[1], c[2], top, c[3]));
    if (el.simple) continue;
    bag.add('limestone', box(c[0] - 0.08, top - 0.25, c[1] - 0.08, c[2] + 0.08, top - 0.1, c[3] + 0.08));
    bag.add(mat, box(c[0] - 0.04, top - 0.1, c[1] - 0.04, c[2] + 0.04, top + 0.05, c[3] + 0.04));
    const np = 2 + Math.floor(rand() * 3);
    for (let j = 0; j < np; j++) { const t = (j + 0.5) / np - 0.5, px = along ? u + t * 0.85 : (x0 + x1) / 2, pz = along ? (z0 + z1) / 2 : u + t * 0.85; bag.add('terracotta', lathe([[0.14, 0], [0.12, 0.25], [0.11, 0.55], [0.14, 0.63], [0.11, 0.68]], 6, null, px, top + 0.05, pz)); }
  }
}
/**
 * The ground floor of an open terrace house about 1870 (docs/settlements/london.md §5a), its front 's' or 'n': walls of
 * brick a brick and a half thick; the door from the steps into the hall along the party wall on the door's side, the
 * stair rising in it toward the back; the front parlour beside the hall, kept for Sundays and visitors — wallpaper below
 * the picture rail and a plain frieze over it, a large carpet, the black grate with coloured tiles either side and its
 * fender, the mantelpiece under a velvet drape with the clock and two vases, the black and gold over-mantel mirror, a suite
 * of a sofa and two armchairs, upright chairs, occasional tables (one with three twisted legs), the aspidistra in its
 * ornate pot, prints on the picture rail, lace across the lower half of the window, a gasolier; the back room where the
 * family lived: the black range in the chimney breast, the dresser with its plates, the table under a cloth with chairs.
 */
function terraceInterior(el, { bag, col }, mat, st) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, f = el.front, L = x1 - x0, D = z1 - z0, T = 0.34, fy = y + 0.4;
  // (u along the street from x0, v in from the front face, height) → world
  const P = (u, v) => [x0 + u, f === 's' ? z1 - v : z0 + v];
  const B = (m, u0, u1, ya, yb, v0, v1) => { const a = P(u0, v0), b = P(u1, v1); bag.add(m, box(Math.min(a[0], b[0]), ya, Math.min(a[1], b[1]), Math.max(a[0], b[0]), yb, Math.max(a[1], b[1]))); };
  const C = (u0, u1, ya, yb, v0, v1) => { const a = P(u0, v0), b = P(u1, v1); col.rect([Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])], ya, yb); };
  const W = (m, u0, u1, ya, yb, v0, v1) => { B(m, u0, u1, ya, yb, v0, v1); C(u0, u1, ya, yb, v0, v1); };
  const du = L / 4, wu = 3 * L / 4, ceil = y + st;               // the door's and the window's centres (as on the front)
  // the shell: front wall with the doorway and the window, back wall with its window, the two party walls; the floor
  W(mat, 0, du - 0.55, y - 0.5, ceil, 0, T); W(mat, du + 0.55, wu - 0.55, y - 0.5, ceil, 0, T); W(mat, wu + 0.55, L, y - 0.5, ceil, 0, T);
  W(mat, du - 0.55, du + 0.55, fy + 2.6, ceil, 0, T);                                                  // over the door; the fanlight's glass under it
  B('glass_outer', du - 0.55, du + 0.55, fy + 2.05, fy + 2.6, 0.12, 0.135);
  W(mat, wu - 0.55, wu + 0.55, y - 0.5, y + 0.6, 0, T); W(mat, wu - 0.55, wu + 0.55, y + 2.4, ceil, 0, T);
  B('glass_outer', wu - 0.55, wu + 0.55, y + 0.6, y + 2.4, 0.1, 0.115); C(wu - 0.55, wu + 0.55, y + 0.6, y + 2.4, 0.05, 0.2);
  W(mat, 0, L, y - 0.5, ceil, D - T, D);
  W(mat, 0, 0.22, y - 0.5, ceil, T, D - T); W(mat, L - 0.22, L, y - 0.5, ceil, T, D - T);
  B('timber', 0.22, L - 0.22, y - 0.5, fy, T, D - T);
  { const a = P(0.22, T), b = P(L - 0.22, D - T); col.floor([Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])], fy); }
  B('timber', du - 0.55, du + 0.55, y - 0.5, fy, 0, T);                                                  // the threshold
  // the front door stands open, folded back against the hall wall
  B('wood_dark', du - 0.62, du - 0.57, fy, fy + 2.03, T, T + 0.95);
  // the hall: a partition along it with the parlour's door, the stair rising toward the back
  const hw = du + 0.6, pv = 4.6;                                                                       // the hall's inner side; the parlours' dividing wall
  W('stucco_cream', hw, hw + 0.12, fy, ceil, T, 1.5); W('stucco_cream', hw, hw + 0.12, fy + 2.1, ceil, 1.5, 2.4); W('stucco_cream', hw, hw + 0.12, fy, ceil, 2.4, 5.0);
  W('stucco_cream', hw, hw + 0.12, fy + 2.1, ceil, 5.0, 5.9); W('stucco_cream', hw, hw + 0.12, fy, ceil, 5.9, D - T);           // the back room's door from the hall
  const nst = 14, rise = (ceil - fy) / nst, run = 0.24, sv0 = D - T - 0.3 - nst * run;
  for (let k = 0; k < nst; k++) B('timber', 0.22, hw, fy, fy + rise * (k + 1), sv0 + k * run, sv0 + (k + 1) * run);
  C(0.22, hw, fy, ceil, sv0, D - T);
  B('wood_dark', hw - 0.06, hw - 0.02, fy + 0.2, fy + 1.1, sv0, D - T - 0.3);                          // the banister's rail on its balusters
  for (let k = 0; k < nst; k += 1) B('wood_dark', hw - 0.05, hw - 0.03, fy + rise * (k + 1), fy + rise * (k + 1) + 0.9, sv0 + k * run + 0.1, sv0 + k * run + 0.12);
  B('cloth_red', 0.4, hw - 0.1, fy + 0.002, fy + 0.01, T + 0.3, sv0);                                   // the hall's runner
  // the parlours' dividing wall with its door near the hall
  W('stucco_cream', hw + 0.12, hw + 0.25, fy, ceil, pv, pv + 0.14); W('stucco_cream', hw + 1.15, L - 0.22, fy, ceil, pv, pv + 0.14); W('stucco_cream', hw + 0.25, hw + 1.15, fy + 2.1, ceil, pv, pv + 0.14);
  // ── the front parlour (u hw+0.12 … L−0.22, v T … pv) ──
  const pu0 = hw + 0.12, pu1 = L - 0.22, pm = (pu0 + pu1) / 2, pr = fy + 2.45;
  for (const [u0, u1, v0, v1] of [[pu0, pu0 + 0.01, T, pv], [pu1 - 0.01, pu1, T, pv]]) { B('paint_fleur', u0, u1, fy, pr, v0, v1); B('stucco_cream', u0, u1, pr, ceil, v0, v1); }
  B('paint_fleur', pu0, pu1, fy, pr, pv - 0.01, pv); B('stucco_cream', pu0, pu1, pr, ceil, pv - 0.01, pv);
  // the front wall's inner face papered round the window
  B('paint_fleur', pu0, wu - 0.55, fy, pr, T, T + 0.01); B('paint_fleur', wu + 0.55, pu1, fy, pr, T, T + 0.01); B('paint_fleur', wu - 0.55, wu + 0.55, fy, y + 0.6, T, T + 0.01);
  B('stucco_cream', pu0, pu1, Math.max(pr, y + 2.4), ceil, T, T + 0.01); B('paint_fleur', wu - 0.55, wu + 0.55, y + 2.4, pr, T, T + 0.01);
  B('wood_dark', pu0, pu1, pr, pr + 0.04, pv - 0.03, pv); B('wood_dark', pu1 - 0.03, pu1, pr, pr + 0.04, T, pv); B('wood_dark', pu0, pu0 + 0.03, pr, pr + 0.04, T, pv);
  // the fireplace in the chimney breast on the party wall
  const cb = pu1 - 0.36, fv = (T + pv) / 2;
  B('cloth_red', pu0 + 0.3, cb - 0.56, fy + 0.001, fy + 0.009, T + 0.3, pv - 0.3);
  W(mat, cb, pu1, fy, ceil, fv - 0.8, fv + 0.8);
  B('paint_fleur', cb - 0.01, cb, fy, pr, fv - 0.8, fv + 0.8); B('stucco_cream', cb - 0.01, cb, pr, ceil, fv - 0.8, fv + 0.8);
  for (const [v0, v1] of [[fv - 0.81, fv - 0.8], [fv + 0.8, fv + 0.81]]) { B('paint_fleur', cb, pu1 - 0.01, fy, pr, v0, v1); B('stucco_cream', cb, pu1 - 0.01, pr, ceil, v0, v1); }
  B('iron', cb - 0.02, cb, fy, fy + 0.85, fv - 0.32, fv + 0.32);                                         // the black grate's register
  B('opening', cb - 0.025, cb - 0.02, fy + 0.15, fy + 0.62, fv - 0.22, fv + 0.22);
  for (const sd of [-1, 1]) B('tile_iznik', cb - 0.025, cb - 0.015, fy + 0.05, fy + 0.85, fv + sd * 0.32, fv + sd * 0.48);
  B('flame', cb - 0.15, cb - 0.05, fy + 0.18, fy + 0.3, fv - 0.15, fv + 0.15);
  B('marble_dark', cb - 0.12, cb, fy, fy + 1.0, fv - 0.62, fv - 0.48); B('marble_dark', cb - 0.12, cb, fy, fy + 1.0, fv + 0.48, fv + 0.62);
  B('marble_dark', cb - 0.22, cb, fy + 1.0, fy + 1.06, fv - 0.7, fv + 0.7);                              // the mantel shelf
  B('cloth_maroon', cb - 0.235, cb - 0.22, fy + 0.78, fy + 1.06, fv - 0.72, fv + 0.72);                    // the velvet drape, its gold daisies
  for (let k = -3; k <= 3; k++) B('gold', cb - 0.24, cb - 0.235, fy + 0.86, fy + 0.9, fv + k * 0.2 - 0.02, fv + k * 0.2 + 0.02);
  B('iron', cb - 0.5, cb - 0.46, fy, fy + 0.12, fv - 0.6, fv + 0.6); B('iron', cb - 0.5, cb - 0.12, fy, fy + 0.12, fv - 0.62, fv - 0.58); B('iron', cb - 0.5, cb - 0.12, fy, fy + 0.12, fv + 0.58, fv + 0.62);   // the fender
  B('wood_dark', cb - 0.13, cb - 0.03, fy + 1.06, fy + 1.36, fv - 0.1, fv + 0.1); B('gold', cb - 0.135, cb - 0.13, fy + 1.15, fy + 1.27, fv - 0.05, fv + 0.05);   // the clock
  for (const sd of [-1, 1]) { const p = P(cb - 0.1, fv + sd * 0.5); bag.add('glaze_blue', lathe([[0.04, 0], [0.06, 0.08], [0.03, 0.18], [0.045, 0.24], [0.001, 0.24]], 10, null, p[0], fy + 1.06, p[1])); }
  B('wood_dark', cb - 0.04, cb - 0.01, fy + 1.3, fy + 2.3, fv - 0.55, fv + 0.55); B('gold', cb - 0.05, cb - 0.04, fy + 1.33, fy + 2.27, fv - 0.52, fv + 0.52); B('mirror_tin', cb - 0.055, cb - 0.05, fy + 1.38, fy + 2.22, fv - 0.47, fv + 0.47);
  // the suite: the sofa against the dividing wall, two armchairs by the fire, upright chairs; brocade green and brown
  const seat = (u, v, w, dd, back, m, axis) => {
    const [ua, ub, va, vb] = axis === 'v' ? [u - dd / 2, u + dd / 2, v - w / 2, v + w / 2] : [u - w / 2, u + w / 2, v - dd / 2, v + dd / 2];
    B('wood_dark', ua, ub, fy, fy + 0.12, va, vb); B(m, ua, ub, fy + 0.12, fy + 0.44, va, vb);
    if (back) { const [a, b2, c, d] = back; B(m, a, b2, fy + 0.44, fy + 0.95, c, d); }
    C(ua, ub, fy, fy + 0.9, va, vb);
  };
  seat(pm - 0.2, pv - 0.42, 1.7, 0.75, [pm - 1.05, pm + 0.65, pv - 0.14, pv - 0.04], 'cloth_green');
  seat(cb - 1.2, fv - 0.9, 0.75, 0.75, [cb - 1.58, cb - 0.82, fv - 1.27, fv - 1.17], 'cloth_brown', 'v');
  seat(cb - 1.2, fv + 0.9, 0.75, 0.75, [cb - 1.58, cb - 0.82, fv + 1.17, fv + 1.27], 'cloth_brown', 'v');
  for (const v of [T + 0.45]) for (const u of [pu0 + 0.35]) { B('wood_dark', u - 0.2, u + 0.2, fy, fy + 0.45, v - 0.2, v + 0.2); B('wood_dark', u - 0.2, u + 0.2, fy + 0.45, fy + 1.0, v - 0.2, v - 0.16); C(u - 0.2, u + 0.2, fy, fy + 1, v - 0.2, v + 0.2); }
  // occasional tables: one round on three twisted legs by the window with the aspidistra; another by the sofa
  const tab = (u, v, r, h) => { const p = P(u, v); bag.add('wood_dark', lathe([[0.001, 0], [r, 0], [r, 0.03], [0.001, 0.03]], 14, null, p[0], fy + h, p[1])); for (let k = 0; k < 3; k++) { const a = k / 3 * Math.PI * 2; bag.add('wood_dark', lathe([[0.022, 0], [0.03, 0.15], [0.02, 0.3], [0.03, 0.45], [0.02, h]], 6, null, p[0] + Math.cos(a) * r * 0.5, fy, p[1] + Math.sin(a) * r * 0.5)); } C(u - r, u + r, fy, fy + h, v - r, v + r); };
  tab(wu - x0 * 0 + 0, T + 0.7, 0.32, 0.72);
  { const p = P(wu, T + 0.7); bag.add('glaze_blue', lathe([[0.08, 0], [0.12, 0.05], [0.14, 0.18], [0.16, 0.22], [0.001, 0.22]], 12, null, p[0], fy + 0.75, p[1]));
    for (let k = 0; k < 9; k++) { const a = k / 9 * Math.PI * 2, g = lathe([[0.001, 0], [0.035, 0.12], [0.03, 0.3], [0.001, 0.42]], 5); g.scale(1, 1, 0.25); g.rotateX(0.35 + (k % 3) * 0.2); g.rotateY(a); g.translate(p[0], fy + 0.95, p[1]); bag.add('lotus_leaf', g); } }
  tab(pm + 0.9, pv - 1.3, 0.25, 0.6);
  // the prints hung from the picture rail on the dividing wall
  for (const u of [pm - 0.7, pm + 0.6]) { B('wood_dark', u - 0.3, u + 0.3, fy + 1.45, fy + 2.05, pv - 0.04, pv - 0.015); B('linen', u - 0.24, u + 0.24, fy + 1.51, fy + 1.99, pv - 0.045, pv - 0.04); B('paint_robe', u - 0.12, u + 0.1, fy + 1.58, fy + 1.86, pv - 0.05, pv - 0.045); }
  // lace across the lower half of the window
  B('linen', wu - 0.55, wu + 0.55, y + 0.6, y + 1.5, T + 0.02, T + 0.025);
  // the gasolier: a brass rod from the ceiling rose, two arms with glass globes
  { const p = P(pm, (T + pv) / 2); bag.add('plaster_white', lathe([[0.25, 0], [0.2, -0.03], [0.001, -0.04]], 14, null, p[0], ceil, p[1])); bag.add('gilt_bronze', lathe([[0.012, 0], [0.012, 0.75]], 6, null, p[0], ceil - 0.75, p[1]));
    for (const sd of [-1, 1]) { B('gilt_bronze', pm - 0.01, pm + 0.01, ceil - 0.76, ceil - 0.74, (T + pv) / 2 + (sd < 0 ? -0.3 : 0), (T + pv) / 2 + (sd > 0 ? 0.3 : 0)); const q = P(pm, (T + pv) / 2 + sd * 0.3); bag.add('lamp_glass', lathe([[0.03, 0], [0.07, 0.05], [0.06, 0.13], [0.04, 0.15]], 10, null, q[0], ceil - 0.75, q[1])); } }
  // ── the back room (v pv … D−T) ──
  const bv0 = pv + 0.14, bv1 = D - T;
  for (const [u0, u1] of [[hw + 0.12, hw + 0.13], [L - 0.23, L - 0.22]]) { B('stucco_cream', u0, u1, fy + 1.0, ceil, bv0, bv1); B('wood_dark', u0, u1, fy, fy + 1.0, bv0, bv1); }
  B('wood_dark', hw + 0.12, L - 0.22, fy, fy + 0.008, bv0, bv1);
  const rv = (bv0 + bv1) / 2;
  W(mat, cb, L - 0.22, fy, ceil, rv - 0.75, rv + 0.75);
  B('iron', cb - 0.55, cb, fy, fy + 0.85, rv - 0.6, rv + 0.6);                                          // the range: oven, firebox, hob, its brass rail
  B('flame', cb - 0.56, cb - 0.55, fy + 0.4, fy + 0.6, rv - 0.12, rv + 0.12); B('gilt_bronze', cb - 0.6, cb - 0.58, fy + 0.7, fy + 0.72, rv - 0.6, rv + 0.6);
  B('iron', cb - 0.3, cb, fy + 0.85, fy + 1.6, rv - 0.3, rv + 0.3);
  { const p = P(cb - 0.3, rv + 0.25); bag.add('iron', lathe([[0.1, 0], [0.12, 0.05], [0.12, 0.18], [0.1, 0.2]], 10, null, p[0], fy + 0.85, p[1])); }   // the kettle on the hob
  // the dresser against the hall partition: cupboards below, shelves of plates above
  B('wood_dark', hw + 0.12, hw + 0.6, fy, fy + 0.9, bv1 - 1.6, bv1 - 0.2); C(hw + 0.12, hw + 0.6, fy, fy + 2.2, bv1 - 1.6, bv1 - 0.2);
  B('wood_dark', hw + 0.12, hw + 0.35, fy + 0.9, fy + 2.2, bv1 - 1.6, bv1 - 0.2);
  for (const yy of [1.3, 1.75]) { B('wood_dark', hw + 0.35, hw + 0.45, fy + yy, fy + yy + 0.025, bv1 - 1.6, bv1 - 0.2); for (let k = 0; k < 5; k++) { const p = P(hw + 0.37, bv1 - 1.45 + k * 0.27); const g = lathe([[0.001, 0], [0.11, 0.004], [0.12, 0.012], [0.001, 0.012]], 12); g.rotateZ(Math.PI / 2 - 0.15); g.translate(p[0], fy + yy + 0.13, p[1]); bag.add('glaze_white', g); } }
  // the table under its cloth with four chairs
  const tu = (hw + 0.6 + cb - 0.6) / 2;
  B('wood_dark', tu - 0.45, tu + 0.45, fy + 0.7, fy + 0.74, rv - 0.6, rv + 0.6); B('linen', tu - 0.5, tu + 0.5, fy + 0.74, fy + 0.745, rv - 0.65, rv + 0.65);
  for (const [a, b2] of [[-0.4, -0.55], [0.4, -0.55], [-0.4, 0.55], [0.4, 0.55]]) B('wood_dark', tu + a - 0.03, tu + a + 0.03, fy, fy + 0.7, rv + b2 - 0.03, rv + b2 + 0.03);
  C(tu - 0.5, tu + 0.5, fy, fy + 0.75, rv - 0.65, rv + 0.65);
  for (const sd of [-1, 1]) { const v = rv + sd * 0.85; B('wood_dark', tu - 0.2, tu + 0.2, fy + 0.43, fy + 0.47, v - 0.2, v + 0.2); for (const a of [-0.17, 0.17]) for (const b2 of [-0.17, 0.17]) B('wood_dark', tu + a - 0.02, tu + a + 0.02, fy, fy + 0.43, v + b2 - 0.02, v + b2 + 0.02); B('wood_dark', tu - 0.2, tu + 0.2, fy + 0.47, fy + 0.95, v + sd * 0.17, v + sd * 0.2); C(tu - 0.2, tu + 0.2, fy, fy + 0.9, v - 0.2, v + 0.2); }
}

registerStyle('victorian', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.gothic.elements, river_front: riverFront, iron_bridge: ironBridge, embankment, abbey, westminster_hall: westminsterHall, st_stephens: stStephens, central_lobby: centralLobby, commons, lords, hansom_cab: hansomCab, omnibus, gas_lamp: gasLamp, paddle_steamer: paddleSteamer, lighter, steamboat_pier: steamboatPier, sailing_barge: sailingBarge, wherry, river_stairs: riverStairs, gothic_tower: gothicTower, terrace_house: (el, c) => terraceRich(el, c, terraceHouseBase), shop_house: (el, c) => shopHouse(el, c, terraceHouseBase), pub: (el, c) => pub(el, c, terraceHouseBase), parliament_square: parliamentSquare, barrel_organ: barrelOrgan, punch_booth: punchBooth, pillar_box: pillarBox, drinking_fountain: drinkingFountain, bollard, trestle_stall: trestleStall, bridge_stone: STYLES.vernacular?.elements?.bridge_stone },
  objects: {},
});
