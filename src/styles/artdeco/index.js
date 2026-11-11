// New York Art Deco and Beaux-Arts (1900s–1930s; docs/settlements/new-york.md §4): towers of steel
// clad in limestone and brick that step back as they rise under the zoning law of 1916; the Empire
// State Building's setbacks, shaft and mooring mast; the Chrysler Building's stainless crown of
// sunbursts and its spire; the Beaux-Arts of Grand Central and the Public Library; loft buildings
// with water tanks on their roofs; the steel viaduct of the elevated railway.

import { diner, walkup } from './rooms.js';
import { registerStyle, STYLES } from '../../core/build.js';
import { box, frustum, lathe, rod, fromTriangles } from '../../core/geom.js';
import '../qing/index.js';
import { empireState } from './esb.js';
import { elTrack, elTrain } from './el.js';
import { grandCentral } from './gct.js';
import { laundry, newsstand } from './street.js';
import { turned } from './turn.js';
import { pavement, curb } from './pave.js';
import { rowhouses, castIronFront, chimney, bulkhead, subwayEntrance, face } from './blocks.js';
import { shopName, shopSign, bladeText, nearEntrance, rng as rng2 } from './dress.js';

const LS = 'facade_limestone', CH = 'steel_chrome';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const block = (bag, mat, [x0, z0, x1, z1], y0, y1) => bag.add(mat, box(x0, y0, z0, x1, y1, z1));
const inset = ([x0, z0, x1, z1], ix, iz = ix) => [x0 + ix, z0 + iz, x1 - ix, z1 - iz];
/** A water tank on its stilts, the New York roof's mark: a timber platform on a braced steel frame, the
 * tub of upright staves bound by steel hoops, a conical roof with a vent, a ladder up the side. */
function tank(bag, x, y, z, r = 2.2) {
  const H = 3.2, k = r * 0.62;
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) bag.add('iron', box(x + dx * k - 0.11, y, z + dz * k - 0.11, x + dx * k + 0.11, y + H, z + dz * k + 0.11));
  for (const yy of [y + 1.1, y + 2.4]) { bag.add('iron', box(x - k, yy - 0.06, z - k - 0.05, x + k, yy + 0.06, z - k + 0.05)); bag.add('iron', box(x - k, yy - 0.06, z + k - 0.05, x + k, yy + 0.06, z + k + 0.05)); bag.add('iron', box(x - k - 0.05, yy - 0.06, z - k, x - k + 0.05, yy + 0.06, z + k)); bag.add('iron', box(x + k - 0.05, yy - 0.06, z - k, x + k + 0.05, yy + 0.06, z + k)); }
  for (const sx of [-1, 1]) { bag.add('iron', rod([x + sx * k, y + 0.1, z - k], [x + sx * k, y + H - 0.1, z + k], 0.03, 4)); bag.add('iron', rod([x - k, y + 0.1, z + sx * k], [x + k, y + H - 0.1, z + sx * k], 0.03, 4)); }
  bag.add('timber', box(x - r - 0.1, y + H, z - r - 0.1, x + r + 0.1, y + H + 0.2, z + r + 0.1));
  bag.add('tar_wood', lathe([[r * 0.97, 0], [r, 2.0], [r * 0.98, 4.2], [r * 1.04, 4.25], [r * 1.04, 4.3], [0.001, 4.3]], 16, (th) => 1 + 0.012 * Math.cos(th * 16), x, y + H + 0.2, z));
  for (const hy of [0.4, 1.1, 1.9, 2.8, 3.7]) bag.add('iron', lathe([[r + 0.04, 0], [r + 0.04, 0.06], [r * 0.9, 0.06]], 16, null, x, y + H + 0.2 + hy, z));
  bag.add('tar_wood', lathe([[r * 1.08, 0], [r * 1.08, 0.08], [0.25, 1.25], [0.25, 1.3], [0.001, 1.3]], 16, null, x, y + H + 4.5, z));
  bag.add('iron', lathe([[0.18, 0], [0.18, 0.45], [0.32, 0.5], [0.001, 0.75]], 8, null, x, y + H + 5.75, z));
  for (const sx of [-0.25, 0.25]) bag.add('iron', box(x + sx - 0.025, y, z + r + 0.12, x + sx + 0.025, y + H + 4.4, z + r + 0.17));
  for (let yy = y + 0.4; yy < y + H + 4.3; yy += 0.35) bag.add('iron', box(x - 0.25, yy - 0.015, z + r + 0.13, x + 0.25, yy + 0.015, z + r + 0.16));
}
/** A fire escape down a street front (the face at o, outward sg, along x if `along`): a balcony of iron grating at each floor
 * with its railing, a stair between each, a drop ladder over the shop front. */
function fireEscape(bag, along, o, sg, u0, u1, y0, top, step = 3.4) {
  const B = (a0, a1, d0, d1, ya, yb) => { const p = o + sg * d0, q = o + sg * d1; return along ? box(a0, ya, Math.min(p, q), a1, yb, Math.max(p, q)) : box(Math.min(p, q), ya, a0, Math.max(p, q), yb, a1); };
  const P = (a, d, yy) => along ? [a, yy, o + sg * d] : [o + sg * d, yy, a];
  let flip = false;
  for (let yy = y0; yy < top - 1.5; yy += step) {
    bag.add('iron', B(u0, u1, 0.02, 1.25, yy - 0.08, yy));
    bag.add('iron', B(u0, u1, 1.2, 1.25, yy + 0.92, yy + 0.98));
    bag.add('iron', B(u0, u1, 1.21, 1.24, yy + 0.4, yy + 0.43));
    for (const a of [u0, u1 - 0.05]) { bag.add('iron', B(a, a + 0.05, 0.02, 1.25, yy + 0.92, yy + 0.98)); bag.add('iron', B(a, a + 0.05, 1.2, 1.25, yy, yy + 0.92)); }
    for (let a = u0 + 0.45; a < u1 - 0.2; a += 0.45) bag.add('iron', B(a - 0.015, a + 0.015, 1.21, 1.24, yy, yy + 0.92));
    if (yy + step < top - 1.5) {
      const a0 = flip ? u1 - 0.4 : u0 + 0.4, a1 = flip ? u0 + 1.2 : u1 - 1.2;
      bag.add('iron', rod(P(a0, 0.35, yy + step), P(a1, 0.35, yy + 0.02), 0.04, 4)); bag.add('iron', rod(P(a0, 0.95, yy + step), P(a1, 0.95, yy + 0.02), 0.04, 4));
      for (let k = 1; k < 10; k++) { const f = k / 10, a = a0 + (a1 - a0) * f, hh = yy + step - (step - 0.02) * f; bag.add('iron', rod(P(a, 0.35, hh), P(a, 0.95, hh), 0.025, 4)); }
      flip = !flip;
    }
  }
  const a = (u0 + u1) / 2 + 0.6;
  for (const d of [0.5, 0.9]) bag.add('iron', box(...(along ? [a + (d - 0.7) - 0.02, y0 - 2.6, o + sg * 0.9 - 0.02, a + (d - 0.7) + 0.02, y0, o + sg * 0.9 + 0.02] : [o + sg * 0.9 - 0.02, y0 - 2.6, a + (d - 0.7) - 0.02, o + sg * 0.9 + 0.02, y0, a + (d - 0.7) + 0.02])));
  for (let yy = y0 - 2.4; yy < y0; yy += 0.4) bag.add('iron', along ? box(a - 0.2, yy - 0.015, o + sg * 0.9 - 0.015, a + 0.2, yy + 0.015, o + sg * 0.9 + 0.015) : box(o + sg * 0.9 - 0.015, yy - 0.015, a - 0.2, o + sg * 0.9 + 0.015, yy + 0.015, a + 0.2));
}
const PLAIN = 'limestone';
/** Ground-floor shops (docs/settlements/new-york.md §1d): on the granite base course, each shop a plate-glass window
 * on a low stall riser, its door at one end with a transom, a chrome bar over the glass; over some a canvas awning
 * on its iron frame, sloping out to a scalloped valance; from some a painted blade sign on brackets; the fascia over
 * all. Only on the faces in `faces` (the street fronts; not the party walls or the back). */
const AWN = ['cloth_green', 'cloth_red', 'cloth_ochre'], SIGN = ['wood_painted', 'paint_white', 'shutter_green'];
function storefronts(bag, [x0, z0, x1, z1], y, rand, faces = 'nsew') {
  for (const f of 'nsew') {
    if (!faces.includes(f)) continue;
    const along = f === 'n' || f === 's', L = along ? x1 - x0 : z1 - z0, a0 = along ? x0 : z0, o = f === 'n' ? z0 : f === 's' ? z1 : f === 'w' ? x0 : x1, sg = f === 'n' || f === 'w' ? -1 : 1;
    const R = (u0, u1, y0, y1, d0, d1) => { const a = o + sg * d0, b = o + sg * d1; return along ? box(a0 + u0, y0, Math.min(a, b), a0 + u1, y1, Math.max(a, b)) : box(Math.min(a, b), y0, a0 + u0, Math.max(a, b), y1, a0 + u1); };
    const Pt = (u, d, yy) => along ? [a0 + u, yy, o + sg * d] : [o + sg * d, yy, a0 + u];
    const n = Math.max(1, Math.floor(L / 6)), FF = face([x0, z0, x1, z1], f), full = nearEntrance((x0 + x1) / 2, (z0 + z1) / 2);
    for (let i = 0; i < n; i++) {
      const u0 = i * L / n + 0.6, u1 = (i + 1) * L / n - 0.6, dl = rand() < 0.5, du0 = dl ? u0 : u1 - 1.1, du1 = du0 + 1.1;
      const g0 = dl ? u0 + 1.25 : u0, g1 = dl ? u1 : u1 - 1.25;
      bag.add('wood_painted', R(g0, g1, y + 0.3, y + 0.8, 0.15, 0.24));                         // the stall riser
      bag.add('glass_outer', R(g0, g1, y + 0.8, y + 3.2, 0.15, 0.18));                          // the plate glass
      bag.add('steel_chrome', R(g0, g1, y + 3.2, y + 3.3, 0.15, 0.22));
      bag.add('opening', R(du0, du1, y + 0.02, y + 2.4, 0.15, 0.17));                           // the door
      bag.add('glass_outer', R(du0, du1, y + 2.55, y + 3.2, 0.15, 0.18));                       // its transom
      bag.add('wood_painted', R(du0 - 0.08, du1 + 0.08, y + 2.4, y + 2.55, 0.15, 0.22));
      bag.add('opening', R(u0, u1, y + 3.3, y + 3.6, 0.15, 0.17));
      const sr = rng2(Math.floor(x0 * 131 + z0 * 71 + i * 17) + f.charCodeAt(0)), shop = shopName(x0, z0, sr);
      shopSign(bag, FF, u0, u1, y, shop, g0, g1, full, sr);
      if (rand() < 0.35) {                                                                       // the awning
        const T = [], m = AWN[Math.floor(rand() * AWN.length)], dO = 1.7, yi = y + 3.55, yo = y + 2.95, yv = y + 2.65;
        const q = (A, B, C, D) => T.push(...A, ...B, ...C, ...A, ...C, ...D, ...A, ...C, ...B, ...A, ...D, ...C);
        q(Pt(u0, 0.2, yi), Pt(u1, 0.2, yi), Pt(u1, dO, yo), Pt(u0, dO, yo));
        const nv = Math.max(2, Math.round((u1 - u0) / 0.45));
        for (let k = 0; k < nv; k++) { const a = u0 + (u1 - u0) * k / nv, b = u0 + (u1 - u0) * (k + 1) / nv, c = (a + b) / 2; q(Pt(a, dO, yo), Pt(b, dO, yo), Pt(b, dO, yv + 0.08), Pt(a, dO, yv + 0.08)); T.push(...Pt(a, dO, yv + 0.08), ...Pt(b, dO, yv + 0.08), ...Pt(c, dO, yv), ...Pt(a, dO, yv + 0.08), ...Pt(c, dO, yv), ...Pt(b, dO, yv + 0.08)); }
        for (const u of [u0, u1]) T.push(...Pt(u, 0.2, yi), ...Pt(u, dO, yo), ...Pt(u, 0.2, yo + 0.25), ...Pt(u, 0.2, yi), ...Pt(u, 0.2, yo + 0.25), ...Pt(u, dO, yo));
        bag.add(m, fromTriangles(T));
        for (const u of [u0 + 0.05, u1 - 0.05]) bag.add('iron', rod(Pt(u, 0.2, yo + 0.1), Pt(u, dO - 0.05, yo - 0.02), 0.02, 4));
      }
      if (rand() < 0.18) {                                                                       // the blade sign
        const u = rand() < 0.5 ? u0 + 0.3 : u1 - 0.3, m = SIGN[Math.floor(rand() * SIGN.length)], yb = y + 4.6 + rand() * 1.2, hh = 1.4 + rand() * 1.4;
        bag.add(m, along ? box(a0 + u - 0.06, yb, Math.min(o + sg * 0.5, o + sg * 1.6), a0 + u + 0.06, yb + hh, Math.max(o + sg * 0.5, o + sg * 1.6)) : box(Math.min(o + sg * 0.5, o + sg * 1.6), yb, a0 + u - 0.06, Math.max(o + sg * 0.5, o + sg * 1.6), yb + hh, a0 + u + 0.06));
        if (full) bladeText(bag, FF, f, u, 0.5, 1.6, yb, hh, ['HOTEL', 'CAFE', 'BAR', 'DRUGS', 'BANK', 'CLUB', 'INN', 'SHOES', 'HATS', 'LUNCH'][Math.floor(rand() * 10)], 'gold');
        else for (const k of [0.25, 0.5, 0.75]) bag.add('gilt_bronze', along ? box(a0 + u - 0.075, yb + hh * k - 0.07, Math.min(o + sg * 0.62, o + sg * 1.48), a0 + u + 0.075, yb + hh * k + 0.07, Math.max(o + sg * 0.62, o + sg * 1.48)) : box(Math.min(o + sg * 0.62, o + sg * 1.48), yb + hh * k - 0.07, a0 + u - 0.075, Math.max(o + sg * 0.62, o + sg * 1.48), yb + hh * k + 0.07, a0 + u + 0.075));
        for (const yy of [yb + 0.15, yb + hh - 0.15]) bag.add('iron', rod(Pt(u, 0.0, yy), Pt(u, 0.5, yy), 0.03, 4));
      }
    }
    bag.add(PLAIN, R(0, L, y + 3.7, y + 4.3, 0, 0.4));
  }
}
/** Vertical piers standing out from a stage's faces, the windows between them in recessed strips. */
function piers(bag, [x0, z0, x1, z1], y0, y1) {
  for (const f of 'nsew') {
    const along = f === 'n' || f === 's', L = along ? x1 - x0 : z1 - z0, a0 = along ? x0 : z0, o = f === 'n' ? z0 : f === 's' ? z1 : f === 'w' ? x0 : x1, sg = f === 'n' || f === 'w' ? -1 : 1;
    const n = Math.max(2, Math.round(L / 3.2));
    for (let i = 0; i <= n; i++) {
      const u = a0 + i * L / n, a = o, b = o + sg * 0.35;
      bag.add(PLAIN, along ? box(u - 0.3, y0, Math.min(a, b), u + 0.3, y1 + 0.4, Math.max(a, b)) : box(Math.min(a, b), y0, u - 0.3, Math.max(a, b), y1 + 0.4, u + 0.3));
    }
  }
}
/**
 * The soot of a city burning coal (docs/settlements/new-york.md §1g) on a low building's street front: the sheltered band
 * under the cornice's frieze blackened, its lower edge ragged where the rain has washed it; the dark streaks run down
 * from it at the party walls; brick goes near black, the buff and limestone fronts a grey grime.
 */
function soot(bag, [x0, z0, x1, z1], f, y, h, mat, rand) {
  const m = mat === 'facade_brick' ? 'pottery_dark' : 'plaster_damp', along = f === 'n' || f === 's', o = f === 'n' ? z0 : f === 's' ? z1 : f === 'w' ? x0 : x1, sg = f === 'n' || f === 'w' ? -1 : 1;
  const a0 = along ? x0 : z0, L = along ? x1 - x0 : z1 - z0, top = y + h - 1.6, low = y + 4.6;
  const put = (u0, u1, ya, yb) => { if (yb - ya < 0.05) return; const p = o + sg * 0.004, q = o + sg * 0.014; bag.add(m, along ? box(a0 + u0, ya, Math.min(p, q), a0 + u1, yb, Math.max(p, q)) : box(Math.min(p, q), ya, a0 + u0, Math.max(p, q), yb, a0 + u1)); };
  const n = Math.max(2, Math.round(L / 3));
  for (let i = 0; i < n; i++) put(i * L / n, (i + 1) * L / n, Math.max(low, top - 0.6 - rand() * 0.9), top);
  for (const u of [0.05, L - 0.55]) put(u, u + 0.5, Math.max(low, top - 4 - rand() * 6), Math.max(low, top - 0.6));
}
/** skyscraper: { rect, y, h, mat, seed } — a block that steps back as it rises when tall; a cornice or a crown; a tank on lower roofs. */
function skyscraper(el, { bag, col }) {
  const rand = rng(el.seed || 1), y = el.y ?? 0, h = el.h ?? 40, mat = el.mat ?? LS;
  let r = el.rect;
  if (el.row && el.front) {
    // a row of brownstones and brick houses (blocks.js); the corner's side faces keep their shops
    storefronts(bag, r, y, rand, (el.shops ?? '').replace(el.front, ''));
    rowhouses(bag, col, r, el.front, y, h, el.seed || 1);
    return;
  }
  col.rect(r, y - 0.5, y + h);
  storefronts(bag, r, y, rand, el.shops ?? 'nsew');
  if (h < 70) {
    block(bag, mat, r, y - 0.5, y + h);
    block(bag, 'granite_grey', inset(r, -0.15), y - 0.5, y + 4.5);
    block(bag, mat, inset(r, -0.5), y + h - 0.2, y + h + 0.8);
    block(bag, PLAIN, inset(r, -0.2), y + h - 1.6, y + h - 0.2);                // the frieze under the cornice
    if (h > 20) block(bag, PLAIN, inset(r, -0.25), y + 12.2, y + 12.8);              // a belt course over the base
    if (el.front) soot(bag, r, el.front, y, h, mat, rand);
    if (el.front && !el.iron && h > 14 && rand() < 0.55) { const r = el.rect, f = el.front, along = f === 'n' || f === 's', L = along ? r[2] - r[0] : r[3] - r[1], a0 = along ? r[0] : r[1], w = Math.min(7, L - 2), u0 = a0 + (L - w) / 2 + (rand() - 0.5) * (L - w - 1); fireEscape(bag, along, f === 'n' ? r[1] : f === 's' ? r[3] : f === 'w' ? r[0] : r[2], f === 'n' || f === 'w' ? -1 : 1, u0, u0 + w, y + 7.6, y + h); }
    if (el.iron && el.front && h > 14) castIronFront(bag, r, el.front, y, h - 1.2, rand);
    if (el.chimney) chimney(bag, el.chimney[0], y + h + 0.04, el.chimney[1], rand);
    if (h > 18 && rand() < 0.5) bulkhead(bag, (r[0] + r[2]) / 2 + (rand() - 0.5) * (r[2] - r[0]) * 0.5, y + h + 0.04, (r[1] + r[3]) / 2 + (rand() - 0.5) * 3, rand);
    if (el.tanks !== false && rand() < 0.4) tank(bag, (r[0] + r[2]) / 2 + (rand() - 0.5) * 4, y + h + 0.8, (r[1] + r[3]) / 2 + (rand() - 0.5) * 4);
    return;
  }
  // the setbacks: base, tower, top stage
  const base = 25 + rand() * 20, w = r[2] - r[0], d = r[3] - r[1];
  block(bag, mat, r, y - 0.5, y + base); block(bag, 'granite_grey', inset(r, -0.15), y - 0.5, y + 5);
  let yy = y + base;
  const steps = h > 150 ? 3 : 2;
  for (let s = 0; s < steps; s++) {
    const f = s === steps - 1 ? 1 : 0.55 + s * 0.25, top = y + h * f, k = 0.12 + s * 0.08;
    r = inset(r, w * k / 1.3, d * k / 1.3);
    if (r[2] - r[0] < 6 || r[3] - r[1] < 6) break;
    block(bag, mat, r, yy - 0.3, top);
    if (s === steps - 1 || s === 0) piers(bag, r, yy, top);
    block(bag, PLAIN, inset(r, -0.3), yy - 0.6, yy + 0.2);                          // the parapet at each setback
    yy = top;
  }
  if (h > 150) { const c = [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2], s0 = Math.min(r[2] - r[0], r[3] - r[1]) / 2; bag.add(rand() < 0.5 ? 'lead' : mat, frustum([c[0] - s0, c[1] - s0, c[0] + s0, c[1] + s0], yy, yy + s0 * 1.4, s0 * 0.9, s0 * 0.9, s0 * 0.9, s0 * 0.9, { noBottom: true })); }
  else block(bag, mat, inset(r, -0.4), yy - 0.2, yy + 0.8);
}
/** chrysler: { rect, y } — the base, the tower with its eagles, the stainless crown of seven tiers of sunbursts with triangular windows, the spire to 319 m. */
function chrysler(el, { bag, col }) {
  const r = el.rect, y = el.y ?? 0, cx = (r[0] + r[2]) / 2, cz = (r[1] + r[3]) / 2;
  block(bag, 'facade_grey', r, y - 0.5, y + 60); block(bag, 'granite_black', inset(r, -0.15), y - 0.5, y + 6); col.rect(r, y - 0.5, y + 60); col.floor(r, y + 60);
  const t1 = [cx - 18, cz - 18, cx + 18, cz + 18];
  block(bag, 'facade_grey', t1, y + 60, y + 120);
  // the radiator caps of 1929 at the corners of the 31st floor: a winged cap on a stepped base
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const px = cx + dx * 18, pz = cz + dz * 18, ang = Math.atan2(dx, dz);
    bag.add(CH, box(px - 1.3, y + 117, pz - 1.3, px + 1.3, y + 120.4, pz + 1.3));
    bag.add(CH, lathe([[0.9, 0], [0.9, 0.5], [0.7, 0.7], [0.75, 1.6], [0.5, 1.9], [0.001, 2.0]], 12, null, px, y + 120.4, pz));
    for (const s of [-1, 1]) { const g = fromTriangles(both3([0, 0.6, 0, s * 2.4, 2.2, -0.6, s * 2.0, 1.2, 0.4, 0, 0.6, 0, s * 2.0, 1.2, 0.4, 0, 1.6, 0.3])); g.rotateY(ang); g.translate(px, y + 120.4, pz); bag.add(CH, g); }
  }
  const t2 = [cx - 15, cz - 15, cx + 15, cz + 15];
  block(bag, 'facade_grey', t2, y + 120, y + 240);
  // the eagles at the corners of the 61st floor, leaning out diagonally over the street
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const ang = Math.atan2(dx, dz), g = [];
    const neck = rod([0, 0, 0], [0, 0.9, 3.4], 0.75, 10); g.push(neck);
    g.push(lathe([[0.001, -0.9], [0.8, -0.6], [0.95, 0], [0.8, 0.6], [0.001, 0.95]], 12).translate(0, 1.05, 3.6));
    g.push(rod([0, 1.0, 4.3], [0, 0.2, 5.4], 0.32, 8)); g.push(lathe([[0.32, 0], [0.001, 0.5]], 8).rotateX(Math.PI * 0.75).translate(0, 0.2, 5.4));
    g.push(box(-1.4, -0.9, -0.5, 1.4, 0.4, 1.0));
    for (const part of g) { part.rotateY(ang); part.translate(cx + dx * 15, y + 238, cz + dz * 15); bag.add(CH, part); }
  }
  // the crown: seven terraced arches on each face, a cruciform groin vault of riveted stainless steel in a
  // sunburst, triangular windows in each arch
  let yy = y + 240;
  const S = [13, 10.8, 9.0, 7.5, 6.2, 5.1, 4.2], HB = 2.0, V = [], W = [];
  for (let k = 0; k < 7; k++) {
    const s = S[k], top = yy + HB, ar = (u) => top + Math.sqrt(Math.max(0, s * s - u * u));
    // the four faces, each a wall with an arched head
    const N = 16;
    for (let q = 0; q < 4; q++) {
      const R = (u, v, o = 0) => { const a = q * Math.PI / 2, ca = Math.cos(a), sa = Math.sin(a); const lx = s + o, lz = u; return [cx + lx * ca - lz * sa, v, cz + lx * sa + lz * ca]; };
      for (let i = 0; i < N; i++) { const u0 = -s + 2 * s * i / N, u1 = -s + 2 * s * (i + 1) / N; V.push(...R(u0, yy - 0.3), ...R(u1, yy - 0.3), ...R(u1, ar(u1)), ...R(u0, yy - 0.3), ...R(u1, ar(u1)), ...R(u0, ar(u0))); }
      // the sunburst's ribs and the arch's rim
      for (let i = 0; i < 12; i++) {
        const f0 = Math.PI * i / 12, f1 = Math.PI * (i + 1) / 12, rr = s * 0.98;
        bag.add(CH, rod(R(-Math.cos(f0) * rr, top + Math.sin(f0) * rr, 0.08), R(-Math.cos(f1) * rr, top + Math.sin(f1) * rr, 0.08), 0.14, 5));
        if (i % 2 === 0 && i > 0) bag.add(CH, rod(R(-Math.cos(f0) * s * 0.35, top + Math.sin(f0) * s * 0.35, 0.05), R(-Math.cos(f0) * rr, top + Math.sin(f0) * rr, 0.05), 0.07, 4));
      }
      // the triangular windows, pointing out along the arch like rays
      const nw = Math.max(5, 9 - k);
      for (let i = 0; i < nw; i++) {
        const f = Math.PI * (i + 0.5) / nw, d = 0.16 * Math.PI / nw * 3, r0 = s * 0.5, r1 = s * 0.86;
        const A = R(-Math.cos(f - d) * r0, top + Math.sin(f - d) * r0, 0.04), B = R(-Math.cos(f + d) * r0, top + Math.sin(f + d) * r0, 0.04), C = R(-Math.cos(f) * r1, top + Math.sin(f) * r1, 0.04);
        W.push(...A, ...B, ...C, ...A, ...C, ...B);
      }
      // a band of windows in the wall under the arch
      for (let i = -2; i <= 2; i++) { const A = R(i * s * 0.32 - 0.3, yy + 0.4, 0.04), B = R(i * s * 0.32 + 0.3, yy + 0.4, 0.04), C = R(i * s * 0.32, yy + 1.7, 0.04); W.push(...A, ...B, ...C, ...A, ...C, ...B); }
    }
    // the groin vault between the faces
    const M = 14;
    for (let i = 0; i < M; i++) for (let j = 0; j < M; j++) {
      const P = (a, b) => { const x = -s + 2 * s * a / M, z = -s + 2 * s * b / M; return [cx + x, top + Math.sqrt(Math.max(0, s * s - Math.min(x * x, z * z))), cz + z]; };
      V.push(...P(i, j), ...P(i, j + 1), ...P(i + 1, j + 1), ...P(i, j), ...P(i + 1, j + 1), ...P(i + 1, j));
    }
    if (k < 6) yy = top + Math.sqrt(S[k] * S[k] - S[k + 1] * S[k + 1]) - 0.02;
    else yy = top + s;
  }
  bag.add(CH, fromTriangles(both3(V)));
  bag.add('glass_lamp', fromTriangles(W));
  // the spire, its foot hidden in the last vault
  bag.add(CH, lathe([[2.2, 0], [1.6, 4], [1.0, 9], [0.45, 20], [0.001, 319 - (yy - y) + 2]], 8, null, cx, yy - 2, cz));
}
/** Both faces of a triangle list. */
function both3(t) { const o = [...t]; for (let i = 0; i < t.length; i += 9) o.push(...t.slice(i, i + 3), ...t.slice(i + 6, i + 9), ...t.slice(i + 3, i + 6)); return o; }
/** beaux_arts: { rect, y, h, front ('n'|'s'|'e'|'w'), arches (count), cols (count), mat, attic } — a terminal or library: the rusticated block, the front of columns or great arched windows, the attic. */
function beauxArts(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = el.h ?? 28, mat = el.mat ?? 'limestone', f = el.front ?? 's';
  bag.add(mat, box(x0, y - 0.5, z0, x1, y + h, z1)); col.rect(el.rect, y - 0.5, y + h); col.floor(el.rect, y + h);
  bag.add(mat, box(x0 - 0.6, y + h, z0 - 0.6, x1 + 0.6, y + h + 1.5, z1 + 0.6));
  if (el.attic) bag.add(mat, box(x0 + 3, y + h + 1.5, z0 + 3, x1 - 3, y + h + 6, z1 - 3));
  const along = f === 'n' || f === 's', L = along ? x1 - x0 : z1 - z0, a0 = along ? x0 : z0, face = f === 'n' ? z0 : f === 's' ? z1 : f === 'w' ? x0 : x1, sg = f === 'n' || f === 'w' ? -1 : 1;
  const put = (u0, u1, v0, v1, m, dd = 0.06) => { const q = along ? [a0 + u0, face - (sg < 0 ? dd : 0), a0 + u1, face + (sg > 0 ? dd : 0)] : [face - (sg < 0 ? dd : 0), a0 + u0, face + (sg > 0 ? dd : 0), a0 + u1]; bag.add(m, box(q[0], y + v0, q[1], q[2], y + v1, q[3])); };
  const na = el.arches ?? 0;
  for (let i = 0; i < na; i++) { const u = L / 2 + (i - (na - 1) / 2) * L * 0.22; put(u - L * 0.08, u + L * 0.08, h * 0.2, h * 0.85, 'opening'); }
  const nc = el.cols ?? 0;
  for (let i = 0; i < nc; i++) { const u = L * 0.25 + i * L * 0.5 / Math.max(1, nc - 1), p = along ? [a0 + u, face + sg * 1.6] : [face + sg * 1.6, a0 + u]; bag.add(mat, lathe([[0.75, 0], [0.75, 0.5], [0.6, 0.8], [0.55, h * 0.62], [0.8, h * 0.66], [0.8, h * 0.7]], 12, null, p[0], y + h * 0.18, p[1])); }
  if (nc) put(L * 0.22, L * 0.78, h * 0.88, h * 0.95, mat, 2.2);
  put(L * 0.2, L * 0.8, -0.5, h * 0.18, mat, 3.5);                                            // the steps or the base
}
/** park: { rect, y } — a level lawn with paths (the trees come from the ground's planting). */
function park(el, { bag }) { const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0; bag.add('granite_grey', box(x0, y - 0.3, z0, x1, y + 0.25, z0 + 1.5)); bag.add('granite_grey', box(x0, y - 0.3, z1 - 1.5, x1, y + 0.25, z1)); }
registerStyle('artdeco', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, diner, walkup, skyscraper, empire_state: empireState, grand_central: grandCentral, laundry, newsstand, subway_entrance: subwayEntrance, pavement, curb, chrysler, beaux_arts: beauxArts, el_track: elTrack, el_train: elTrain, park, turned },
  objects: {},
});
