// The Umayyad city (Jerusalem about 700; docs/settlements/jerusalem.md §4–§5): flat-roofed stone
// houses, some with a small dome, round courtyards; the hypostyle congregational mosque with its
// gabled timber roofs and a dome before the mihrab. Registered into the `islamic` style.

import { STYLES } from '../../core/build.js';
import { box, frustum, lathe } from '../../core/geom.js';
import './index.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/** levant_house: { rect, seed, y } — rooms of limestone round a court, flat roofs with parapets, sometimes a little dome. */
function house(el, { bag, col }) {
  const rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = 3.6 + (rand() < 0.4 ? 3.2 : 0), d = Math.min(4.5, (z1 - z0) * 0.4);
  const parts = [[x0, z0, x1, z0 + d], [x0, z0 + d, x0 + d, z1], [x1 - d, z0 + d, x1, z1], [x0 + d, z1 - 0.7, x1 - d, z1]];
  parts.forEach((r, i) => {
    const hh = i === 0 ? h : i === 3 ? 2.6 : 3.6;
    bag.add('limestone', box(r[0], y - 0.6, r[1], r[2], y + hh, r[3])); col.rect(r, y - 0.6, y + hh); col.floor(r, y + hh);
    if (i < 3 && !el.simple) bag.add('limestone', box(r[0] - 0.05, y + hh, r[1] - 0.05, r[2] + 0.05, y + hh + 0.5, r[3] + 0.05));
  });
  if (rand() < 0.45) { const cx = (x0 + x1) / 2, cz = z0 + d / 2, r = Math.min(d, x1 - x0) * 0.35; bag.add('plaster', lathe([[r, 0], [r * 0.9, r * 0.45], [r * 0.55, r * 0.85], [0.001, r]], 12, null, cx, y + h, cz)); }
}
/**
 * A reused column as the Umayyads set them up: a square plinth, an Attic base, a monolithic shaft
 * (of whatever marble or granite came to hand) and a Corinthian capital, simplified; an impost
 * block on it. { at, y, h (to the top of the capital), d, shaft (material) }.
 */
function reusedColumn(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, H = el.h, R = el.d / 2;
  const pl = R * 0.5, bh = R * 0.5, ch = R * 2.2, sh = H - pl - bh - ch;
  bag.add('marble', box(x - R * 1.4, y, z - R * 1.4, x + R * 1.4, y + pl, z + R * 1.4));
  bag.add('marble', lathe([[R * 1.36, 0], [R * 1.38, bh * 0.3], [R * 1.2, bh * 0.45], [R * 1.12, bh * 0.6], [R * 1.18, bh * 0.75], [R * 1.04, bh * 0.95], [R * 1.0, bh]], 20, null, x, y + pl, z));
  bag.add(el.shaft || 'marble_smooth', lathe([[R, 0], [R * 0.98, sh * 0.3], [R * 0.92, sh * 0.75], [R * 0.86, sh * 0.97], [R * 0.92, sh], [0.001, sh]], 16, null, x, y + pl + bh, z));
  // the capital: a bell with two rows of acanthus, the corners rolled into volutes, under the abacus
  const t = R * 0.86, leaves = (th, i, r, yy) => {
    const row = yy < ch * 0.4 ? 0 : 1, lobe = Math.abs(Math.cos((th + row * Math.PI / 8) * 4)) ** 0.6;
    const tip = Math.max(0, Math.sin(Math.PI * (row ? (yy - ch * 0.32) / (ch * 0.4) : yy / (ch * 0.4))));
    return 1 + 0.18 * lobe * tip;
  };
  bag.add('marble', lathe([[t, 0], [t * 1.04, ch * 0.2], [t * 1.1, ch * 0.4], [t * 1.16, ch * 0.58], [t * 1.28, ch * 0.74], [t * 1.4, ch * 0.84], [0.001, ch * 0.84]], 32, leaves, x, y + H - ch, z));
  const a = R * 1.45;
  bag.add('marble', box(x - a, y + H - ch * 0.16, z - a, x + a, y + H, z + a));
  for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) bag.add('marble', lathe([[0.001, 0], [R * 0.3, R * 0.05], [R * 0.32, R * 0.3], [0.001, R * 0.36]], 8, null, x + sx * a * 0.92, y + H - ch * 0.42, z + sz * a * 0.92));
  col.circle(x, z, R * 1.2, y, y + H);
}

/**
 * hypostyle: the Aqsa mosque as rebuilt under ʿAbd al-Malik and al-Walid { rect, y, aisles (odd), bay } —
 * aisles running north–south toward the qibla (south), the central one a wide, high nave; arcades of
 * round arches on reused columns tied by timber beams; a gabled timber roof over each aisle sheathed
 * in lead, with painted timber ceilings beneath; clerestory windows over the nave; a door into every
 * aisle in the north façade; arched windows high in the side and qibla walls; a dome on a drum over the
 * square bay before the mihrab; reed mats on the floor and lamps hung in the nave.
 */
function hypostyle(el, ctx) {
  const { bag, col } = ctx, E = STYLES.islamic.elements, OB = { ...STYLES.byzantine?.objects, ...STYLES.islamic.objects };
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, n = el.aisles ?? 11, T = 1.4, rand = rng(705);
  const zi0 = z0 + T, zi1 = z1 - T, nb = Math.round((zi1 - zi0) / (el.bay ?? 4.9)), b = (zi1 - zi0) / nb;
  const cw = 2 * b, xi0 = x0 + T, xi1 = x1 - T, sw = (xi1 - xi0 - cw) / (n - 1), cx = (x0 + x1) / 2;
  const S = y + 5.9, CH = y + 5.5, Ha = y + 9.2, Hn = y + 13.2, zb = zi1 - cw;
  // the arcade lines (x of each), outward from the nave
  const lines = [];
  for (let k = 0; k < (n - 1) / 2; k++) { lines.push(cx - cw / 2 - k * sw); lines.push(cx + cw / 2 + k * sw); }
  const shafts = ['marble_smooth', 'proconnesian', 'marble_dark', 'granite_grey', 'giallo', 'pavonazzetto'];
  const pw = (o) => E.planar_wall({ mat: 'limestone', ...o }, ctx);
  for (const lx of lines) {
    const nave = Math.abs(Math.abs(lx - cx) - cw / 2) < 0.01;
    const arches = [];
    const last = nave ? nb - 2 : nb;
    for (let k = 0; k < last; k++) arches.push({ uc: zi0 + (k + 0.5) * b, r: (b - 0.95) / 2, spring: S });
    if (nave) arches.push({ uc: zb + b, r: b - 0.85, spring: S + 0.6 });          // one wide arch into the dome bay
    const top = nave ? Hn : Ha + 0.5;
    const holes = nave ? Array.from({ length: nb - 2 }, (_, k) => ({ u0: zi0 + (k + 0.5) * b - 0.55, u1: zi0 + (k + 0.5) * b + 0.55, y0: Ha + 0.9, y1: Ha + 2.6 })) : [];
    pw({ o: [lx, 0], u: [0, 1], th: 0.9, u0: zi0, u1: zi1, y0: y, y1: top, arches, arcade: true, noEnds: true, holes });
    for (let k = 1; k < nb; k++) {
      const zc = zi0 + k * b;
      if (nave && k === nb - 2) { bag.add('limestone', box(lx - 0.7, y, zc - 0.7, lx + 0.7, S + 0.6, zc + 0.7)); col.rect([lx - 0.7, zc - 0.7, lx + 0.7, zc + 0.7], y, S); continue; }
      if (nave && k === nb - 1) continue;
      reusedColumn({ at: [lx, zc], y, h: CH - y, d: 0.62, shaft: shafts[Math.floor(rand() * shafts.length)] }, ctx);
      bag.add('limestone', box(lx - 0.48, CH, zc - 0.48, lx + 0.48, S, zc + 0.48));     // the impost
    }
    // the tie-beam along the arcade at the springing, from wall to wall
    bag.add('cedar', box(lx - 0.22, S - 0.28, zi0, lx + 0.22, S - 0.02, nave ? zb - 0.7 : zi1));
  }
  // the outer walls: east and west with arched windows high up; north with a door into every aisle; the qibla wall
  const aisleC = [];
  { const xs = [xi0, ...lines.slice().sort((p, q) => p - q), xi1]; for (let i = 0; i < xs.length - 1; i++) aisleC.push([(xs[i] + xs[i + 1]) / 2, xs[i + 1] - xs[i]]); }
  const win = Array.from({ length: nb }, (_, k) => ({ uc: zi0 + (k + 0.5) * b, r: 0.75, spring: y + 6.6, sill: y + 4.6 }));
  for (const wx of [x0 + T / 2, x1 - T / 2]) pw({ o: [wx, 0], u: [0, 1], th: T, u0: z0, u1: z1, y0: y - 0.5, y1: Ha + 0.5, arches: win });
  const doors = aisleC.map(([c, w]) => { const big = w > sw + 0.5; return { uc: c - x0, r: big ? 2.0 : 1.35, spring: y + (big ? 4.6 : 3.4), sill: y }; });
  const lights = aisleC.map(([c, w]) => ({ uc: c - x0, r: w > sw + 0.5 ? 0.9 : 0.6, spring: y + 7.4, sill: y + 6.1 }));
  pw({ o: [x0, z0 + T / 2], u: [1, 0], th: T, u0: T, u1: x1 - x0 - T, y0: y - 0.5, y1: Ha + 0.5, arches: [...doors, ...lights] });
  pw({ o: [x0, z0 + T / 2], u: [1, 0], th: T, u0: cx - x0 - cw / 2 - 0.45, u1: cx - x0 + cw / 2 + 0.45, y0: Ha + 0.5, y1: Hn, holes: [{ u0: cx - x0 - 1.2, u1: cx - x0 + 1.2, y0: Ha + 1.2, y1: Ha + 3.0 }] });
  const qwin = aisleC.filter(([c]) => Math.abs(c - cx) > 1).map(([c]) => ({ uc: c - x0, r: 0.7, spring: y + 6.8, sill: y + 4.8 }));
  pw({ o: [x0, z1 - T / 2], u: [1, 0], th: T, u0: T, u1: x1 - x0 - T, y0: y - 0.5, y1: Ha + 0.5, arches: qwin });
  pw({ o: [x0, z1 - T / 2], u: [1, 0], th: T, u0: cx - x0 - cw / 2 - 0.45, u1: cx - x0 + cw / 2 + 0.45, y0: Ha + 0.5, y1: Hn });
  // corners: the end walls overlap the side walls' ends
  // the transverse arch before the dome bay
  pw({ o: [cx - cw / 2, zb], u: [1, 0], th: 0.9, u0: 0.45, u1: cw - 0.45, y0: y, y1: Hn, arches: [{ uc: cw / 2, r: cw / 2 - 1.05, spring: S + 0.6 }], arcade: true });
  // the floor, and reed mats down each aisle
  bag.add('flagstone', box(x0 + 0.1, y - 0.3, z0 + 0.1, x1 - 0.1, y + 0.05, z1 - 0.1)); col.floor([x0, z0, x1, z1], y + 0.05);
  for (const [c, w] of aisleC) bag.add('reed_mat', box(c - w / 2 + 0.75, y + 0.05, zi0 + 2.5, c + w / 2 - 0.75, y + 0.075, zi1 - 1.6));
  // the ceilings, painted timber, and the gabled roofs sheathed in lead
  const xs = [xi0 - T / 2, ...lines.slice().sort((p, q) => p - q), xi1 + T / 2];
  for (let i = 0; i < xs.length - 1; i++) {
    const a = xs[i], c = xs[i + 1], nave = Math.abs((a + c) / 2 - cx) < 0.1, h0 = nave ? Hn : Ha + 0.5, za = z0 - 0.35, zz = nave ? zb - 0.45 : z1 + 0.35;
    const ia = a + (i === 0 ? T / 2 : 0.45), ic = c - (i === xs.length - 2 ? T / 2 : 0.45);
    bag.add('ceiling_painted', box(ia, (nave ? Hn : Ha) - 0.3, zi0, ic, nave ? Hn : Ha, nave ? zb - 0.45 : zi1));
    const w = c - a, rise = w * 0.32;
    bag.add('timber', frustum([a - 0.02, za + 0.02, c + 0.02, zz - 0.02], h0, h0 + rise - 0.06, w / 2, w / 2, 0, 0));
    bag.add('lead', frustum([a, za, c, zz], h0 + 0.03, h0 + rise, w / 2, w / 2, 0, 0, { noBottom: true }));
  }
  // the dome bay: a ring over the corners (squinch zone), the drum with its windows, the dome
  const dc = [cx, zb + cw / 2], Rd = cw / 2 - 0.45;
  E.ring_slab({ c: dc, outer: { n: 4, a: cw / 2 + 0.45 }, inner: { n: 0, a: Rd }, y0: Hn - 0.6, y1: Hn, mat: 'limestone' }, ctx);
  E.ring_slab({ c: dc, outer: { n: 4, a: cw / 2 + 0.47 }, inner: { n: 0, a: Rd + 0.82 }, y0: Hn, y1: Hn + 0.04, mat: 'lead' }, ctx);
  E.arc_wall({ c: dc, r0: Rd, r1: Rd + 0.8, a0: 0, a1: 360, y0: Hn, y1: Hn + 3.4, mat: 'limestone', collide: false, step: 4, gaps: Array.from({ length: 12 }, (_, k) => ({ a: 15 + 30 * k, w: 0.8, y0: Hn + 1.0, y1: Hn + 2.7 })) }, ctx);
  E.arc_wall({ c: dc, r0: Rd + 0.75, r1: Rd + 1.05, a0: 0, a1: 360, y0: Hn + 3.25, y1: Hn + 3.55, mat: 'limestone', collide: false, step: 4 }, ctx);
  const shell = (R, H, k = 14) => { const p = []; for (let i = 0; i <= k; i++) { const t = (i / k) * Math.PI / 2; p.push([R * Math.cos(t) + 0.0001, H * Math.sin(t) ** 0.9]); } return p; };
  E.lathe_shell({ c: dc, y: Hn + 3.4, profile: shell(Rd, Rd * 0.92), seg: 48, inward: true, mat: 'mosaic_gold' }, ctx);
  E.lathe_shell({ c: dc, y: Hn + 3.4, profile: [...shell(Rd + 0.82, Rd * 1.08 + 0.75), [0.0001, Rd * 1.08 + 0.9]], seg: 48, mat: 'lead' }, ctx);
  bag.add('gilt_bronze', lathe([[0.18, 0], [0.1, 0.4], [0.24, 0.65], [0.08, 0.9], [0.03, 1.6], [0.001, 1.65]], 10, null, dc[0], Hn + 3.4 + Rd * 1.08 + 0.85, dc[1]));
  // the mihrab in the middle of the qibla wall; lamps hung down the nave
  OB.mihrab({ at: [cx, zi1 - 0.9], y, w: 1.6, h: 3.4, d: 0.6 }, ctx);
  if (OB.polykandelon) for (let k = 1; k < nb - 2; k += 3) OB.polykandelon({ at: [cx, zi0 + (k + 0.5) * b], y: y + 4.6, r: 0.8, n: 12, top: Hn - 0.3 }, ctx);
}
Object.assign(STYLES.islamic.elements, { levant_house: house, hypostyle, reused_column: reusedColumn });
