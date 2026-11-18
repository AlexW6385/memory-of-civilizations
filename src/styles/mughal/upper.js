// The upper floors of the Taj Ganj's open houses (docs/settlements/mughal-agra.md §16): for a house with `el.up` ('merchant' | 'craft' |
// 'tenement' | 'shop', see the settlement's layout.js) the timber stair goes on from floor to floor and out onto the roof through a
// stair head (mumty); every upper floor has its well (a hole in the slab over the stair's top) and its room, furnished by use; the
// jharokha's door stands open and one steps out onto the balcony (the shops' loggia can be stepped onto too); the roof is a terrace
// with a parapet, a mat, water jars, a charpoy and a washing line. Built in the house's local frame (front z = 0, body at −z; see
// townhouse.js), which calls `openUp` in place of the shut slabs, the solid third storey and the roof.

import { box, lathe, frustum, rod } from '../../core/geom.js';
import * as F from './furnish.js';

const R = 'sandstone_red', FH = 3.5, UH = 3.1, T = 0.4, PT = 0.3, PH = 0.9, NS = 15, RUN = 0.27;
const noTop = (x0, y0, z0, x1, y1, z1) => frustum([x0, z0, x1, z1], y0, y1, 0, 0, 0, 0, { noTop: true });
/** A number in [0, 1) from a piece's own place (never a counter or a shared generator). */
const hash = (...a) => { let h = 2166136261; for (const v of a) { h ^= Math.round(v * 1000) | 0; h = Math.imul(h, 16777619); } return ((h >>> 0) % 10000) / 10000; };
const pick = (list, ...at) => list[Math.floor(hash(...at) * list.length) % list.length];

/** The well of the stair in each floor's slab: the corner at the back of the left wall, over the stair's top. */
export const wellOf = (L) => ({ x0: -L.hw + T, x1: -L.hw + T + 1.05, z0: -L.D + T, z1: -L.D + T + 2.75 });
/** The stair head on the roof: over the well and a landing beside it, its door on the front. */
export const mumtyOf = (L) => { const w = wellOf(L); return { x0: -L.hw - 0.05, x1: w.x1 + 1.4, z0: -L.D, z1: w.z1 + 0.3 }; };

/** The ceiling slab at y with the stair's well cut in it (its floor a collider); joists under it. */
function slabWell(E, y, zr) {
  const { B, C, L } = E, { hw, D, mat } = L, w = wellOf(L);
  B.add(mat, box(-hw + T, y - 0.25, w.z1, hw - T, y, zr)); B.add(mat, box(w.x1, y - 0.25, -D + T, hw - T, y, w.z1));
  C.floor([-hw + T, w.z1, hw - T, zr], y); C.floor([w.x1, -D + T, hw - T, w.z1], y);
  for (let z = -D + T + 0.9; z < zr - 0.2; z += 1.1) B.add('wood_dark', box(z > w.z1 + 0.1 ? -hw + T : w.x1, y - 0.4, z - 0.07, hw - T, y - 0.25, z + 0.07));
}

/** One flight of timber, from the floor at Y0 to the one at Y1 = Y0 + UH, up the left wall toward the back (NS treads). */
function flight(E, Y0, Y1) {
  const { B, C, L } = E, { D } = L, w = wellOf(L), rise = (Y1 - Y0) / NS, zb = w.z0 + NS * RUN;
  for (let i = 0; i < NS; i++) B.add('wood_dark', box(w.x0, Y0, zb - (i + 1) * RUN, w.x1, Y0 + rise * (i + 1), zb - i * RUN));
  C.ramp([w.x0, w.z0, w.x1, zb], Y0, Y1, 0, -1);
  // the rail on the open side: a round handrail sloping with the treads, on slender posts (no flat top to stand on)
  const x = w.x1 - 0.02, zr0 = zb - 0.3, zr1 = w.z1 + 0.1, yAt = (z) => Y0 + rise * ((zb - z) / RUN + 1);
  B.add('wood_dark', rod([x, yAt(zr0) + 0.95, zr0], [x, yAt(zr1) + 0.95, zr1], 0.03, 5));
  for (let z = zr0; z > zr1; z -= 4 * RUN) B.add('wood_dark', rod([x, yAt(z), z], [x, yAt(z) + 0.95, z], 0.022, 4));
  void D;
}

/** Plaster on the inside of a room's walls (the lower part darkened by hands and smoke). */
function lining(B, L, y0, y1) {
  const a = -L.hw + T, b = L.hw - T, z0 = -L.D + T;
  B.add('lime_plaster', box(a, y0, z0, a + 0.03, y1, -0.5)); B.add('lime_plaster', box(b - 0.03, y0, z0, b, y1, -0.5)); B.add('lime_plaster', box(a + 0.03, y0, z0, b - 0.03, y1, z0 + 0.03));
  B.add('earth_wall', box(a + 0.03, y0, z0 + 0.03, b - 0.03, y0 + 0.5, z0 + 0.05));
}
/** A charpoy (F.charpoy) a hand's width longer or shorter by its place, its webbing of sacking cord: no two bed-frames of the town are one shape. */
function bed(B, C, x, y, z, yaw, { quilt = 'cloth_indigo' } = {}) {
  const L = 1.84 + hash(x, z, 1) * 0.12, W = 0.86 + hash(x, z, 2) * 0.08, h = 0.45, c = Math.cos(yaw), s = Math.sin(yaw), P = (u, v) => [x + u * c + v * s, z - u * s + v * c];
  F.charpoyLegs(B, x, y, z, yaw, { L, W, h });
  const bx = (m, u0, y0, v0, u1, y1, v1) => { const a = P(u0, v0), b = P(u1, v1); B.add(m, box(Math.min(a[0], b[0]), y + y0, Math.min(a[1], b[1]), Math.max(a[0], b[0]), y + y1, Math.max(a[1], b[1]))); };
  for (const q of [-1, 1]) { bx('timber', -L / 2, h - 0.1, q * W / 2 - 0.03, L / 2, h - 0.04, q * W / 2 + 0.03); bx('timber', q * L / 2 - 0.03, h - 0.1, -W / 2, q * L / 2 + 0.03, h - 0.04, W / 2); }
  bx('sacking', -L / 2 + 0.03, h - 0.075, -W / 2 + 0.03, L / 2 - 0.03, h - 0.06, W / 2 - 0.03);
  bx(quilt, -L * 0.4, h - 0.05, -W * 0.42, L * 0.4, h + 0.02, W * 0.42);
  bx('cloth_white', -L * 0.45, h + 0.02, -0.2, -L * 0.45 + 0.4, h + 0.1, 0.2);
  C.circle(x, z, 0.85, y, y + h);
}
const niche = (B, x, y, z) => { B.add(R, box(x - 0.2, y + 1.3, z + 0.03, x + 0.2, y + 1.36, z + 0.22)); B.add('plaster_grey', box(x - 0.12, y + 1.4, z + 0.03, x + 0.12, y + 2.0, z + 0.05)); F.oilLamp(B, [], x, y + 1.36, z + 0.14, 'terracotta', 0); };
const chestAt = (E, x, y, z, w, d, h, yaw) => { F.chest(E.B, x, y, z, w, d, h, yaw); const c = Math.abs(Math.cos(yaw)), s = Math.abs(Math.sin(yaw)); E.C.rect([x - (w * c + d * s) / 2, z - (w * s + d * c) / 2, x + (w * c + d * s) / 2, z + (w * s + d * c) / 2], y, y + h); };

/** The room over the ground room (UY its floor): by the household's use. fx0: the left edge of the furniture, clear of the stair's lane. */
function room(E, kind, UY, level) {
  const { B, C, L, el } = E, { hw, D } = L, ix1 = hw - T, back = -D + T, w = wellOf(L), fx0 = w.x1 + 1.35, sd = el.seed | 0;
  const quilt = (x, z) => pick(['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_maroon'], x, z);
  const use = kind === 'merchant' ? (level === 1 ? 'sit' : 'strong') : kind === 'craft' ? (level === 1 ? 'work' : 'sleep') : kind === 'tenement' ? (level === 1 ? 'sleep' : 'store') : 'stock';
  lining(B, L, UY, UY + UH - 0.25);
  niche(B, w.x1 + 0.9, UY, back);
  if (use === 'sleep') {
    // the sleeping room: a dhurrie, charpoys with their quilts and pillows, the bedding folded on a shelf, a chest, the jar of water
    F.kilim(B, (fx0 + ix1) / 2, UY + 0.016, back + 4.4, Math.min(3.0, ix1 - fx0 - 0.3), 2.6, 0, ['cloth_red', 'cloth_white', 'cloth_indigo', 'cloth_ochre']);
    for (const [x, z] of [[ix1 - 0.6, back + 1.3], [ix1 - 0.6, back + 3.4], [ix1 - 1.75, back + 1.3]]) { if (x < fx0 + 0.45) continue; bed(B, C, x, UY, z, Math.PI / 2, { quilt: quilt(x, z) }); }
    B.add('wood_dark', box(fx0 + 0.3, UY + 1.55, back + 0.03, fx0 + 2.4, UY + 1.6, back + 0.4));
    F.bolts(B, fx0 + 0.9, UY + 1.6, back + 0.2, 4, 0, ['cloth_red', 'cloth_white', 'cloth_indigo', 'cloth_ochre'], 0.5); F.bolts(B, fx0 + 1.8, UY + 1.6, back + 0.2, 3, 0, ['cloth_white', 'cloth_ochre', 'cloth_maroon'], 0.5);
    chestAt(E, ix1 - 0.4, UY, back + 6.0, 0.9, 0.5, 0.55, Math.PI / 2); F.waterJar(B, fx0 + 0.3, UY, back + 6.2, 0.9, 'terracotta');
  } else if (use === 'store') {
    // the store: bales and jars, trunks, grain in a bin, a rope strung across with the household's clothes
    for (let i = 0; i < 3; i++) { F.bale(B, ix1 - 0.6, UY, back + 1.0 + i * 0.8, 0.6, 0.55, 0.7, 0, pick(['sacking', 'cloth_white', 'cloth_ochre'], i, back)); C.rect([ix1 - 0.9, back + 0.65 + i * 0.8, ix1, back + 1.35 + i * 0.8], UY, UY + 0.6); }
    chestAt(E, ix1 - 0.4, UY, back + 4.0, 0.9, 0.55, 0.6, Math.PI / 2); F.pots(B, ix1 - 0.8, UY, back + 5.2, 0, 4); F.waterJar(B, ix1 - 0.45, UY, back + 6.2, 0.9, 'terracotta');
    B.add('sacking', box(fx0, UY + 2.25, back + 3.0, ix1 - 0.1, UY + 2.28, back + 3.03));
    for (let i = 0; i < 4; i++) B.add(['cloth_white', 'cloth_red', 'cloth_ochre', 'cloth_indigo'][i], box(fx0 + 0.3 + i * 0.7, UY + 1.5, back + 3.0, fx0 + 0.7 + i * 0.7, UY + 2.25, back + 3.03));
  } else if (use === 'sit') {
    // the room for guests: a dhurrie with bolsters along the wall, a tray table, the hookah, a Qur'an on its stand, a chest
    F.kilim(B, (fx0 + ix1) / 2, UY + 0.016, back + 3.6, Math.min(3.2, ix1 - fx0), 4.4, 0, ['cloth_maroon', 'cloth_white', 'cloth_ochre', 'cloth_indigo']);
    for (let i = 0; i < 3; i++) F.bolster(B, ix1 - 0.3, UY + 0.03, back + 1.6 + i * 1.0, 0.9, 0.13, Math.PI / 2, ['cloth_red', 'cloth_ochre', 'cloth_indigo'][i], 'cloth_ochre');
    F.trayTable(B, (fx0 + ix1) / 2, UY, back + 3.6, { r: 0.34, h: 0.3, seed: sd }); F.hookah(B, (fx0 + ix1) / 2 + 0.7, UY + 0.012, back + 4.2, 0.3);
    F.rahle(B, ix1 - 0.8, UY + 0.012, back + 5.6, -Math.PI / 2, {}); chestAt(E, ix1 - 0.4, UY, back + 6.6, 0.9, 0.5, 0.55, Math.PI / 2);
  } else if (use === 'work') {
    // the workroom: the sewing and finishing of the house's cloth — the worker's mat with its cushion, a lamp on a stand, bolts on a shelf, spools in a tray, garments on a rope
    F.reedMat(B, (fx0 + ix1) / 2, UY, back + 3.8, Math.min(2.2, ix1 - fx0), 2.0, 0);
    F.cushion(B, (fx0 + ix1) / 2, UY + 0.012, back + 3.8, 0.7, 0.6, 0.1, 0, 'cloth_ochre');
    F.trayTable(B, (fx0 + ix1) / 2 + 0.5, UY, back + 3.0, { r: 0.28, h: 0.2, things: false, seed: sd }); F.oilLamp(B, [], (fx0 + ix1) / 2 + 0.5, UY + 0.2, back + 3.0, 'bronze', 0);
    B.add('wood_dark', box(fx0, UY + 1.45, back + 0.03, ix1, UY + 1.5, back + 0.4)); B.add('wood_dark', box(fx0, UY + 0.95, back + 0.03, ix1, UY + 1.0, back + 0.4));
    for (let i = 0; i < 4; i++) { F.bolts(B, fx0 + 0.6 + i * 0.9, UY + 1.5, back + 0.2, 3 + (i % 2), 0, ['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_white', 'cloth_ochre', 'cloth_maroon'], 0.5); if (fx0 + 0.6 + i * 0.9 < ix1 - 0.4) F.bolts(B, fx0 + 0.6 + i * 0.9, UY + 1.0, back + 0.2, 2, 0, ['cloth_maroon', 'cloth_white', 'cloth_indigo'], 0.5); }
    B.add('sacking', box(fx0, UY + 2.3, back + 5.2, ix1 - 0.1, UY + 2.33, back + 5.23));
    for (let i = 0; i < 4; i++) B.add(pick(['cloth_white', 'cloth_red', 'cloth_ochre', 'cloth_ochre', 'cloth_indigo'], fx0 + i, back), box(fx0 + 0.3 + i * 0.75, UY + 1.3, back + 5.2, fx0 + 0.75 + i * 0.75, UY + 2.3, back + 5.23));
    chestAt(E, ix1 - 0.4, UY, back + 6.4, 0.9, 0.5, 0.55, Math.PI / 2);
  } else if (use === 'strong') {
    // the strongroom: iron-bound chests along the walls, bales, a ledger on its stand with a lamp, a balance, jars
    for (const [x, z, k] of [[ix1 - 0.4, back + 1.0, 0], [ix1 - 0.4, back + 2.2, 1], [ix1 - 0.4, back + 3.4, 0]]) chestAt(E, x, UY, z, 1.0, 0.55, 0.6 + k * 0.1, Math.PI / 2);
    for (let i = 0; i < 2; i++) { F.bale(B, fx0 + 0.5 + i * 0.9, UY, back + 0.5, 0.8, 0.55, 0.7, 0, 'cloth_white'); C.rect([fx0 + 0.1 + i * 0.9, back + 0.15, fx0 + 0.9 + i * 0.9, back + 0.85], UY, UY + 0.6); }
    F.rahle(B, (fx0 + ix1) / 2, UY + 0.012, back + 4.8, Math.PI, {}); F.oilLamp(B, [], (fx0 + ix1) / 2 + 0.6, UY + 0.012, back + 4.8, 'bronze', 0);
    F.reedMat(B, (fx0 + ix1) / 2, UY, back + 4.8, 1.8, 1.4, 0); F.pots(B, ix1 - 0.8, UY, back + 6.2, 0, 3); F.waterJar(B, fx0 + 0.3, UY, back + 6.3, 0.9, 'terracotta');
  } else {
    // the shop's stock: the trade's goods by the walls, bales and sacks stacked
    const trade = L.trade;
    for (let i = 0; i < 3; i++) {
      const z = back + 1.0 + i * 1.5, x = ix1 - 0.55;
      if (trade === 'cloth' || trade === 'carpets') { F.bolts(B, x, UY, z, 5, Math.PI / 2, undefined, 0.6); F.rolledCarpets(B, x - 0.2, UY + 0.45, z, 3, 1.0, 0); }
      else if (trade === 'brass') F.copperware(B, x, UY, z, Math.PI / 2, sd + i, 3);
      else if (trade === 'spice') F.spiceSacks(B, x, UY, z, Math.PI / 2, 3);
      else F.pots(B, x, UY, z, Math.PI / 2, 3);
      C.rect([x - 0.4, z - 0.6, x + 0.4, z + 0.6], UY, UY + 0.5);
    }
    for (let i = 0; i < 3; i++) F.bale(B, fx0 + 0.5 + i * 0.95, UY, back + 0.55, 0.8, 0.6, 0.7, 0, pick(['sacking', 'cloth_white', 'cloth_ochre'], i, UY));
    for (let i = 0; i < 3; i++) C.rect([fx0 + 0.1 + i * 0.95, back + 0.2, fx0 + 0.9 + i * 0.95, back + 0.9], UY, UY + 0.6);
    chestAt(E, (fx0 + ix1) / 2, UY, back + 5.0, 0.9, 0.5, 0.6, 0); F.waterJar(B, fx0 + 0.3, UY, back + 6.0, 0.9, 'terracotta');
  }
}

/** The roof terrace by the house's use: a mat with cushions, water jars on stands, a charpoy to sleep on in the hot season, a washing line, dung cakes drying. */
function terrace(E, H) {
  const { B, C, L, el } = E, { hw, D } = L, ix1 = hw - T, m = mumtyOf(L), kind = el.up, ztop = -D + 3.4;
  const zf = -1.4, z0 = Math.max(m.z1 + 0.9, ztop);
  // the mat and cushions at the roof's middle, a tray and the hookah
  const mx = 0.5 + hash(el.rect[0], el.rect[1]) * 0.4 - 0.2;
  F.kilim(B, mx, H + 0.016, (z0 + zf) / 2 - 0.2, Math.min(2.6, hw), 1.8, 0, ['cloth_red', 'cloth_white', 'cloth_indigo', 'cloth_ochre']);
  for (const s of [-1, 1]) F.cushion(B, mx + s * 0.95, H + 0.02, (z0 + zf) / 2 - 0.2, 0.55, 0.55, 0.12, 0, pick(['cloth_red', 'cloth_ochre', 'cloth_indigo'], mx, s));
  if (kind === 'merchant' || kind === 'shop') { F.trayTable(B, mx, H + 0.02, (z0 + zf) / 2 - 0.2, { r: 0.3, h: 0.26, seed: el.seed | 0 }); F.hookah(B, mx + 0.45, H + 0.03, (z0 + zf) / 2 + 0.3, 0.3); }
  // the charpoy for sleeping out, along the right parapet clear of the chhatri's corner
  const cz = Math.min(zf - 1.4, (z0 + zf) / 2 + 2.2);
  bed(B, C, ix1 - 0.6, H, cz, Math.PI / 2, { quilt: pick(['cloth_red', 'cloth_indigo', 'cloth_ochre'], ix1, cz) });
  // the water jars on their stands by the stair head's door, and a second row
  F.waterJar(B, m.x1 + 0.55, H, m.z1 + 0.5, 0.95, 'terracotta'); C.circle(m.x1 + 0.55, m.z1 + 0.5, 0.35, H, H + 1.3);
  if (kind !== 'craft') { F.waterJar(B, m.x1 + 1.25, H, m.z1 + 0.5, 0.85, 'terracotta'); C.circle(m.x1 + 1.25, m.z1 + 0.5, 0.35, H, H + 1.3); }
  // dung cakes drying in a heap at the back corner (the tenement's and the craftsman's fuel), the shop's stock under a cloth
  if (kind === 'tenement' || kind === 'craft') for (let i = 0; i < 3; i++) for (let k = 0; k < 4 - i; k++) B.add('mud_plaster', lathe([[0.001, 0], [0.13, 0], [0.14, 0.02], [0.12, 0.04], [0.001, 0.04]], 8, null, ix1 - 1.9 - i * 0.14 - k * 0.27, H + i * 0.04, -D + PT + 0.45));
  else for (let i = 0; i < 2; i++) { F.bale(B, ix1 - 1.4 - i * 0.9, H, -D + PT + 0.6, 0.8, 0.55, 0.7, 0, pick(['sacking', 'cloth_white'], i, kind === 'shop' ? 1 : 2)); C.rect([ix1 - 1.8 - i * 0.9, -D + PT + 0.25, ix1 - 1.0 - i * 0.9, -D + PT + 0.95], H, H + 0.6); }
  // the washing line: two poles and a rope across, the household's cloth hung from it
  const lz = zf - 0.3, lx0 = m.x1 + 0.9, lx1 = Math.min(ix1 - 1.5, lx0 + 4.2);
  if (lx1 - lx0 > 1.6) {
    for (const x of [lx0, lx1]) { B.add('wood_dark', lathe([[0.001, 0], [0.05, 0], [0.04, 1.9], [0.001, 1.95]], 6, null, x, H, lz)); C.circle(x, lz, 0.06, H, H + 1.95); }
    B.add('sacking', box(lx0, H + 1.8, lz - 0.01, lx1, H + 1.83, lz + 0.01));
    const n = Math.floor((lx1 - lx0) / 0.7);
    for (let i = 0; i < n; i++) { const x = lx0 + 0.25 + i * 0.7, hgt = 0.7 + hash(x, lz) * 0.5; B.add(pick(['cloth_white', 'cloth_red', 'cloth_ochre', 'cloth_indigo', 'cloth_ochre', 'cloth_white'], x, lz), box(x, H + 1.8 - hgt, lz - 0.012, x + 0.5, H + 1.8, lz + 0.012)); }
  }
}

/** The stair head (mumty) over the well: walls and a slab roof with a small dome, a door in front onto the roof. */
function mumty(E, H) {
  const { B, C, L } = E, { hw, D, mat, accent } = L, m = mumtyOf(L), w = wellOf(L), h = 2.4, dr = [w.x1 + 0.1, w.x1 + 1.0];
  const walls = (x0, z0, x1, z1, y0, y1) => { B.add(mat, box(x0, y0, z0, x1, y1, z1)); C.rect([x0, z0, x1, z1], y0, y1); };
  walls(m.x0, -D, m.x1, -D + PT, H + PH, H + h);                                   // the back, on the parapet
  walls(m.x0, -D + PT, -hw + PT, m.z1, H + PH, H + h);                             // the left, on the parapet
  walls(m.x1 - 0.3, -D + PT, m.x1, m.z1, H, H + h);                                // the right
  walls(m.x0, m.z1 - 0.3, dr[0], m.z1, H, H + h); walls(dr[1], m.z1 - 0.3, m.x1, m.z1, H, H + h);   // the front, the door between
  B.add(mat, box(dr[0], H + 2.05, m.z1 - 0.3, dr[1], H + h, m.z1));                // (the lintel)
  B.add(R, box(dr[0] - 0.1, H + 2.0, m.z1 - 0.34, dr[1] + 0.1, H + 2.08, m.z1 + 0.08)); B.add(R, box(dr[0] - 0.1, 0 + H, m.z1 - 0.3, dr[0], H + 2.0, m.z1 + 0.06)); B.add(R, box(dr[1], H, m.z1 - 0.3, dr[1] + 0.1, H + 2.0, m.z1 + 0.06));
  B.add(accent, box(m.x0 - 0.1, H + h, -D - 0.1, m.x1 + 0.1, H + h + 0.14, m.z1 + 0.15));
  const cx = (m.x0 + m.x1) / 2, cz = (-D + m.z1) / 2;
  B.add('marble', lathe([[1.1, 0], [1.18, 0.12], [0.85, 0.42], [0.4, 0.7], [0.001, 0.86]], 12, null, cx, H + h + 0.14, cz));
  B.add('gilt_bronze', lathe([[0.04, 0], [0.025, 0.2], [0.001, 0.26]], 6, null, cx, H + h + 0.14 + 0.84, cz));
  // the door's leaf stands open against its reveal; a lamp niche inside the landing
  B.add('wood_dark', box(dr[0] + 0.012, H + 0.1, m.z1 - 0.3, dr[0] + 0.06, H + 2.0, m.z1 - 0.02));
}

/**
 * The upper floors, balcony and roof of a house with `el.up` (L: layoutOf; B, C: the house's bag and collider writers; frontWall and
 * roomWalls: its wall builders). Replaces the base's slab over the first upper room, its solid third storey, its roof floor and stair head.
 */
export function openUp(E) {
  const { B, C, L, el, frontWall, roomWalls } = E, { hw, D, st, mat, shop, variant, dx } = L, w = wellOf(L), H = FH + (st - 1) * UH, HL = FH + UH;
  // floors: the slab over the first upper room (the roof on two storeys), with the stair's well; a third storey where there is one
  slabWell(E, HL, -0.5);
  if (st === 3) {
    roomWalls(HL, H);
    const wh = [];
    for (let x = -hw + 1.3; x < hw - 0.8; x += 2.5) wh.push([x - 0.4, x + 0.4, HL + 0.75, HL + 2.1]);
    frontWall(HL, H, wh);
    slabWell(E, H, -0.5);
  }
  // the roof: floors on the wall tops and the slab round the well
  C.floor([-hw, w.z1, hw, 0], H); C.floor([w.x1, -D, hw, w.z1], H); C.floor([-hw, -D, w.x0, w.z1], H); C.floor([w.x0, -D, w.x1, -D + T], H);
  C.rect([-hw - 0.05, -0.3, hw + 0.05, 0], H, H + PH + 0.5); C.rect([-hw - 0.05, -D, hw + 0.05, -D + PT], H, H + PH + 0.5);
  C.rect([-hw - 0.05, -D + PT, -hw + PT, -0.3], H, H + PH + 0.5); C.rect([hw - PT, -D + PT, hw + 0.05, -0.3], H, H + PH + 0.5);
  // the stair: a flight from each floor to the next, and the stair head on the roof
  flight(E, FH, HL); if (st === 3) flight(E, HL, H);
  mumty(E, H); terrace(E, H);
  // the rooms by use (the shops' first upper room is the shop's own)
  if (!shop) room(E, el.up, FH, 1);
  if (st === 3) room(E, el.up, HL, 2);
  // the balcony: the jharokha's door stands open, two steps up from the room to its floor, a rail of lattice on three sides
  const jx = shop ? 0 : dx, y0 = FH + 0.55;
  if (variant === 'jharokha') {
    R_step(E, jx, y0);
    C.floor([jx - 1.15, -0.02, jx + 1.15, 0.92], y0);
    C.rect([jx - 1.48, 0.93, jx + 1.48, 1.17], y0, y0 + 1.9); for (const s of [-1, 1]) C.rect([jx + s * 1.2 - 0.07, 0.1, jx + s * 1.2 + 0.07, 1.0], y0, y0 + 1.9);
  } else if (variant === 'loggia') {
    // the loggia floor (0.2 above the room's), the columns and the low screen between them
    C.floor([-hw + 0.5, -0.02, hw - 0.5, 0.3], FH + 0.2); C.floor([-hw + 0.5, -0.5, hw - 0.5, -0.02], FH + 0.12);
    C.rect([-hw + 0.5, 0.3, hw - 0.5, 0.44], FH + 0.2, FH + 1.1);
    const xs = [-hw + 0.7, -hw / 3, hw / 3, hw - 0.7]; for (const x of xs) C.circle(x, 0.35, 0.2, FH + 0.2, FH + 2.5);
  }
  void el;
}

/** The steps from the room to the jharokha's floor (a stone sill in the wall's thickness), the door's leaves folded back against the reveal. */
function R_step(E, jx, y0) {
  const { B, C } = E;
  B.add(R, box(jx - 0.62, FH, -1.1, jx + 0.62, FH + 0.27, -0.55)); C.floor([jx - 0.6, -1.1, jx + 0.6, -0.55], FH + 0.27);
  B.add(R, box(jx - 0.62, FH, -0.55, jx + 0.62, y0 - 0.01, 0)); C.floor([jx - 0.6, -0.55, jx + 0.6, -0.02], y0 - 0.01);
  for (const s of [-1, 1]) {
    const a = jx + s * 0.55 - (s < 0 ? -0.012 : 0.062), b = a + 0.05;
    B.add('wood_dark', box(a, y0 + 0.1, -0.5, b, y0 + 1.5, -0.04));
  }
}
