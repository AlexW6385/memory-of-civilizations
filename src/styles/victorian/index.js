// Victorian Gothic Revival and the Victorian terrace (London about 1870; docs/settlements/london.md
// §4): the Palace of Westminster's long river front of pale limestone in bays of tall windows and
// pinnacles, the Victoria Tower, the Clock Tower with its four faces and spire, the central spire;
// the brick terraces with slate roofs, chimney stacks and bay windows.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, frustum, lathe } from '../../core/geom.js';
import '../gothic/town.js';
import '../vernacular/index.js';

const S = 'limestone_yellow', SL = 'slate';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const pinnacle = (bag, x, y, z, s = 0.6, h = 3) => { bag.add(S, box(x - s / 2, y, z - s / 2, x + s / 2, y + h * 0.4, z + s / 2)); bag.add(S, lathe([[s * 0.5, 0], [0.001, h * 0.6]], 4, null, x, y + h * 0.4, z)); };
/** river_front: a long Gothic Revival range { rect, h, y, face ('e'…) } — bays of tall windows, pinnacles, a steep roof of iron tiles. */
function riverFront(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = el.h ?? 22, f = el.face ?? 'e';
  bag.add(S, box(x0, y - 0.5, z0, x1, y + h, z1)); col.rect(el.rect, y, y + h); col.floor(el.rect, y + h);
  const along = f === 'n' || f === 's', L = along ? x1 - x0 : z1 - z0, n = Math.floor(L / 4.5);
  for (let i = 0; i <= n; i++) {
    const u = (along ? x0 : z0) + i * L / n, px = along ? u : (f === 'e' ? x1 : x0), pz = along ? (f === 's' ? z1 : z0) : u;
    bag.add(S, box(px - 0.35, y, pz - 0.35, px + 0.35, y + h + 1, pz + 0.35)); pinnacle(bag, px, y + h + 1, pz, 0.7, 3.5);
    if (i < n) for (const yy of [y + 3, y + 9, y + 15]) { const m = u + L / n / 2, q = f === 'e' ? [x1 - 0.02, m - 1, x1 + 0.06, m + 1] : f === 'w' ? [x0 - 0.06, m - 1, x0 + 0.02, m + 1] : f === 's' ? [m - 1, z1 - 0.02, m + 1, z1 + 0.06] : [m - 1, z0 - 0.06, m + 1, z0 + 0.02]; bag.add('opening', box(q[0], yy, q[1], q[2], yy + 4.2, q[3])); }
  }
  const w = along ? z1 - z0 : x1 - x0;
  bag.add('lead', frustum([x0 + 1, z0 + 1, x1 - 1, z1 - 1], y + h, y + h + w * 0.35, along ? 0 : w / 2 - 1.05, along ? 0 : w / 2 - 1.05, along ? w / 2 - 1.05 : 0, along ? w / 2 - 1.05 : 0));
}
/** gothic_tower: { c, s, h, y, clock, spire, crown } — a square tower with corner turrets, tracery panels, the clock stage, a spire or a crown of pinnacles. */
function gothicTower(el, { bag, col }) {
  const [x, z] = el.c, s = el.s ?? 12, h = el.h ?? 96, y = el.y ?? 0, body = el.clock ? h * 0.58 : h * 0.86;
  bag.add(S, box(x - s / 2, y - 0.5, z - s / 2, x + s / 2, y + body, z + s / 2)); col.rect([x - s / 2, z - s / 2, x + s / 2, z + s / 2], y, y + h);
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const tx = x + dx * s / 2, tz = z + dz * s / 2; bag.add(S, lathe([[s * 0.09, 0], [s * 0.09, body + 2]], 8, null, tx, y, tz)); pinnacle(bag, tx, y + body + 2, tz, s * 0.12, s * 0.5); }
  for (const f of 'nsew') for (let k = 0; k < 6; k++) { const yy = y + body * (0.12 + k * 0.14), q = f === 'n' ? [x - s * 0.3, z - s / 2 - 0.06, x + s * 0.3, z - s / 2 + 0.02] : f === 's' ? [x - s * 0.3, z + s / 2 - 0.02, x + s * 0.3, z + s / 2 + 0.06] : f === 'w' ? [x - s / 2 - 0.06, z - s * 0.3, x - s / 2 + 0.02, z + s * 0.3] : [x + s / 2 - 0.02, z - s * 0.3, x + s / 2 + 0.06, z + s * 0.3]; bag.add('opening', box(q[0], yy, q[1], q[2], yy + body * 0.07, q[3])); }
  if (el.clock) {
    const cy = y + body, cs = s * 1.08;
    bag.add(S, box(x - cs / 2, cy, z - cs / 2, x + cs / 2, cy + h * 0.12, z + cs / 2));
    for (const [nx, nz] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) { const fx = x + nx * (cs / 2 + 0.05), fz = z + nz * (cs / 2 + 0.05); bag.add('plaster_white', box(fx - (nz ? cs * 0.35 : 0.04), cy + h * 0.02, fz - (nx ? cs * 0.35 : 0.04), fx + (nz ? cs * 0.35 : 0.04), cy + h * 0.02 + cs * 0.7, fz + (nx ? cs * 0.35 : 0.04))); bag.add('gilt_bronze', box(fx - (nz ? 0.15 : 0.08), cy + h * 0.02 + cs * 0.35, fz - (nx ? 0.15 : 0.08), fx + (nz ? 0.15 : 0.08), cy + h * 0.02 + cs * 0.62, fz + (nx ? 0.15 : 0.08))); }
    bag.add(S, box(x - s * 0.42, cy + h * 0.12, z - s * 0.42, x + s * 0.42, cy + h * 0.2, z + s * 0.42));
    bag.add('lead', frustum([x - s * 0.45, z - s * 0.45, x + s * 0.45, z + s * 0.45], cy + h * 0.2, y + h - 3, s * 0.44, s * 0.44, s * 0.44, s * 0.44));
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
  for (let i = 0; i <= k; i++) { const u = (along ? x0 : z0) + i * L / k, c = along ? [u - 0.5, (z0 + z1) / 2 - 0.4, u + 0.5, (z0 + z1) / 2 + 0.4] : [(x0 + x1) / 2 - 0.4, u - 0.5, (x0 + x1) / 2 + 0.4, u + 0.5]; bag.add(mat, box(c[0], y + H, c[1], c[2], y + H + D * 0.32 + 1.4, c[3])); }
}
registerStyle('victorian', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.gothic.elements, river_front: riverFront, gothic_tower: gothicTower, terrace_house: terraceHouse, bridge_stone: STYLES.vernacular?.elements?.bridge_stone },
  objects: {},
});
