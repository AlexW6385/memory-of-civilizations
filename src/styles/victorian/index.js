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
import { hansomCab, omnibus, gasLamp, paddleSteamer, lighter, steamboatPier } from './street.js';

const S = 'limestone_yellow', SL = 'slate';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const pinnacle = (bag, x, y, z, s = 0.6, h = 3) => { bag.add(S, box(x - s / 2, y, z - s / 2, x + s / 2, y + h * 0.4, z + s / 2)); bag.add(S, lathe([[s * 0.5, 0], [0.001, h * 0.6]], 4, null, x, y + h * 0.4, z)); };
/** gothic_tower: { c, s, h, y, clock, spire, crown } — a square tower with corner turrets, tracery panels, the clock stage, a spire or a crown of pinnacles. */
function gothicTower(el, { bag, col }) {
  const [x, z] = el.c, s = el.s ?? 12, h = el.h ?? 96, y = el.y ?? 0, body = el.clock ? h * 0.58 : h * 0.86;
  bag.add(S, box(x - s / 2, y - 0.5, z - s / 2, x + s / 2, y + body, z + s / 2)); col.rect([x - s / 2, z - s / 2, x + s / 2, z + s / 2], y, y + h);
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const tx = x + dx * s / 2, tz = z + dz * s / 2; bag.add(S, lathe([[s * 0.09, 0], [s * 0.09, body + 2]], 8, null, tx, y, tz)); pinnacle(bag, tx, y + body + 2, tz, s * 0.12, s * 0.5); }
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
function terraceHouse(el, { bag, col }) {
  const rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, n = el.storeys ?? 3, st = 3.2, H = n * st, f = el.front ?? 's', along = f === 'n' || f === 's';
  const mat = rand() < 0.3 ? 'brick_buff' : 'brick';
  bag.add(mat, box(x0, y - 0.5, z0, x1, y + H, z1)); col.rect(el.rect, y - 0.5, y + H);
  const L = along ? x1 - x0 : z1 - z0, D = along ? z1 - z0 : x1 - x0, k = Math.max(1, Math.round(L / 5.5));
  for (let s = 0; s < n; s++) for (let i = 0; i < k * 2; i++) {
    const u = (along ? x0 : z0) + (i + 0.5) * L / (k * 2), yy = y + s * st + (s === 0 ? 0.6 : 0.9);
    // the stucco surround, the sash window within it (prouder), its bars; the door with its fanlight on the ground floor
    const fr = (d0, d1, m) => (f === 's' ? [u - 0.55 - m, z1 + d0, u + 0.55 + m, z1 + d1] : f === 'n' ? [u - 0.55 - m, z0 - d1, u + 0.55 + m, z0 - d0] : f === 'e' ? [x1 + d0, u - 0.55 - m, x1 + d1, u + 0.55 + m] : [x0 - d1, u - 0.55 - m, x0 - d0, u + 0.55 + m]);
    const door = s === 0 && i % 2 === 0, hh = door ? 2.6 : s === 1 ? 2.2 : 1.8, y0 = door ? y + 0.4 : yy;
    const a1 = fr(-0.02, 0.05, 0.1), a2 = fr(0.05, 0.08, -0.04), bar = fr(0.08, 0.1, -0.5);
    if (el.simple) { bag.add('opening', box(a2[0], y0, a2[1], a2[2], y0 + hh, a2[3])); continue; }
    bag.add('plaster_white', box(a1[0], y0 - 0.1, a1[1], a1[2], y0 + hh + (s === 1 ? 0.35 : 0.1), a1[3]));
    bag.add(door ? 'wood_dark' : 'opening', box(a2[0], y0, a2[1], a2[2], y0 + hh * (door ? 0.78 : 1), a2[3]));
    if (door) { bag.add('opening', box(a2[0], y0 + hh * 0.8, a2[1], a2[2], y0 + hh, a2[3])); const st2 = fr(0.0, 0.9, 0.15); bag.add('limestone', box(st2[0], y - 0.3, st2[1], st2[2], y + 0.4, st2[3])); }
    else { bag.add('plaster_white', box(bar[0], y0, bar[1], bar[2], y0 + hh, bar[3])); const hb = fr(0.08, 0.1, -0.04); bag.add('plaster_white', box(hb[0], y0 + hh / 2 - 0.03, hb[1], hb[2], y0 + hh / 2 + 0.03, hb[3])); }
  }
  // a stucco cornice and parapet; the area railings in front
  bag.add('plaster_white', box(x0 - 0.15, y + H - 0.4, z0 - 0.15, x1 + 0.15, y + H, z1 + 0.15));
  bag.add('plaster_white', box(x0 - 0.05, y + 0.3, z0 - 0.05, x1 + 0.05, y + 0.6, z1 + 0.05));
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
registerStyle('victorian', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.gothic.elements, river_front: riverFront, iron_bridge: ironBridge, embankment, abbey, westminster_hall: westminsterHall, st_stephens: stStephens, central_lobby: centralLobby, commons, lords, hansom_cab: hansomCab, omnibus, gas_lamp: gasLamp, paddle_steamer: paddleSteamer, lighter, steamboat_pier: steamboatPier, gothic_tower: gothicTower, terrace_house: terraceHouse, bridge_stone: STYLES.vernacular?.elements?.bridge_stone },
  objects: {},
});
