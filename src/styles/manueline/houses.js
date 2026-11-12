// The houses of Lisbon about 1520 (docs/settlements/manueline-lisbon.md §8): the tall merchants' houses of the Rua Nova with arched
// shop fronts, stone-framed twin-light windows with hoods, iron balconies and lattice rótulas, hipped or gabled tile roofs;
// the narrow houses of the Alfama stepped up the hill; the low whitewashed houses of the fishermen at Belém. Weathering by damp,
// rain streaks, patches of bare masonry and tiles of two ages. Element `manu_house` { rect, front, y, plinth, seed, kind, simple,
// open (a furnished ground storey and chamber you can walk into), use (the shop's trade or 'home') }.
import { box, fromTriangles, frustum } from '../../core/geom.js';
import { archWall } from '../gothic/nd-interior.js';
import { frame } from '../greek/agora.js';
import { rng, pick, gable } from './util.js';
import { kit, shop, home } from './interiors.js';

const WALLS = ['plaster_white', 'plaster_white', 'limewash_yellow', 'plaster_ochre', 'stucco_rose', 'stucco_pale', 'limewash_white', 'stucco_cream', 'plaster_white', 'stucco_siena', 'limewash_red'];
const SHUT = ['shutter_green', 'shutter_brown', 'shutter_grey', 'shutter_green'];
const DIR = { '0,1': 's', '0,-1': 'n', '1,0': 'e', '-1,0': 'w' };

/** A hipped roof over rect from y0, rising `rise`, eaves overhanging by oh. */
function hip(bag, mat, rect, y0, rise, oh) {
  const r = [rect[0] - oh, rect[1] - oh, rect[2] + oh, rect[3] + oh], m = Math.min(r[2] - r[0], r[3] - r[1]) / 2;
  bag.add(mat, frustum(r, y0, y0 + rise, m, m, m, m, { noBottom: true }));
}

export function manuHouse(el, ctx) {
  const { bag, col, lights } = ctx, rand = rng(el.seed || 1), y = el.y ?? 0, F = frame(el.rect, el.front ?? 's'), { L, D } = F, simple = !!el.simple;
  const kind = el.kind ?? 'merchant', plinth = el.plinth ?? 0.6, open = !!el.open && !simple;
  const n = open && kind === 'fisher' ? 1 : kind === 'merchant' ? 3 + (rand() < 0.4 ? 1 : 0) : kind === 'alfama' ? 2 + Math.floor(rand() * 3) : 1 + (rand() < 0.4 ? 1 : 0);
  const h0 = kind === 'merchant' ? 3.9 : 3.0, hs = kind === 'merchant' ? 3.4 : 3.0, H = h0 + (n - 1) * hs;
  const wall = pick(rand, WALLS), shut = pick(rand, SHUT), cap = kind === 'merchant' ? 'limestone' : 'plaster_white';
  const R = (u0, v0, u1, v1, y0, y1, m, solid = false) => { const r = F.R(u0, v0, u1, v1); bag.add(m, box(r[0], y + y0, r[1], r[2], y + y1, r[3])); if (solid) col.rect(r, y + y0, y + y1); return r; };
  const T = 0.5, fy = y + 0.45;
  // ── body
  const body = F.R(0, 0, L, D);
  if (open) col.rect(body, y - plinth, y + 0.3); else col.rect(body, y - plinth, y + H + 1);
  if (open) bag.add('limestone', box(body[0] - 0.04, y - plinth, body[1] - 0.04, body[2] + 0.04, y + 0.36, body[3] + 0.04)); else bag.add('limestone', box(body[0], y - plinth, body[1], body[2], y + 0.7, body[3]));
  // the ground storey's shop arches / door (merchants), windows
  const shopF = kind !== 'fisher' && (kind === 'merchant' ? rand() < 0.9 : rand() < 0.3);
  const ops = [];
  if (kind === 'merchant' && L > 7.5) {
    if (open) ops.push({ uc: L * 0.5, r: 1.3, sill: y + 0.3, spring: y + 2.2, f: 0.5 });
    else { const nA = L > 10.5 ? 2 : 1; if (nA === 1) ops.push({ uc: L * 0.62, r: 1.15, sill: y, spring: y + 2.0, f: 0.5 }); else { ops.push({ uc: L * 0.3, r: 1.15, sill: y, spring: y + 2.0, f: 0.5 }, { uc: L * 0.62, r: 1.15, sill: y, spring: y + 2.0, f: 0.5 }); } }
  }
  const doorU = open ? (ops.length ? L * 0.5 : L * 0.5) : shopF && ops.length ? (ops.length === 2 ? L - 1.3 : L * 0.22) : L * (0.25 + rand() * 0.5);
  // windows' places on the upper storeys
  const wn = Math.max(1, Math.floor((L - 1.2) / 2.6)), WW = 0.9 + (rand() < 0.35 ? 0.3 : 0), WH = kind === 'merchant' ? 1.7 : 1.4;
  const wu = (k) => 0.6 + (k + 0.5) * (L - 1.2) / wn - WW / 2;
  const sillAt = (s) => h0 + (s - 1) * hs + 0.8;
  const hoods = kind === 'merchant' && rand() < 0.7;
  if (!open) {
    const tri = [];
    if (!simple && ops.length && shopF) {
      archWall(tri, (u, yy, d) => { const p = F.P(u, d); return [p[0], yy, p[1]]; }, { u0: 0, u1: L, d0: 0, d1: 0.5, y0: y + 0.7, y1: y + h0, openings: ops, n: 6 });
      bag.add(wall, fromTriangles(tri));
      for (const o of ops) { const r = F.R(o.uc - o.r, 0.48, o.uc + o.r, 0.54); bag.add('opening', box(r[0], y, r[1], r[2], y + 3.4, r[3])); }
      R(0, 0.5, L, D, 0.7, h0, wall);
    } else R(0, 0, L, D, 0.7, h0, wall);
    R(0, 0, L, D, h0, H, wall);
  } else {
    // hollow: ground storey front with its arch, side and back walls, the partition, the floors
    const tri = [], arch = ops.length ? ops : [{ uc: L * 0.5, r: 1.0, sill: y + 0.3, spring: y + 2.0, f: 0.5 }];
    archWall(tri, (u, yy, d) => { const p = F.P(u, d); return [p[0], yy, p[1]]; }, { u0: 0, u1: L, d0: 0, d1: T, y0: y + 0.3, y1: y + h0, openings: arch, n: 6 });
    bag.add(wall, fromTriangles(tri));
    const a = arch[0], ju = a.uc - a.r, jv = a.uc + a.r;
    col.rect(F.R(0, 0, ju, T), y, y + H + 1); col.rect(F.R(jv, 0, L, T), y, y + H + 1); col.rect(F.R(ju, 0, jv, T), y + 2.8, y + H + 1);
    for (const [u0, v0, u1, v1] of [[0, 0, T, D], [L - T, 0, L, D], [0, D - T, L, D]]) { R(u0, v0, u1, v1, 0.3, H, wall); col.rect(F.R(u0, v0, u1, v1), y, y + H + 1); }
    // inner whitewash
    R(T, T, L - T, T + 0.02, 0.3, h0 + hs, 'limewash_white'); R(T, D - T - 0.02, L - T, D - T, 0.3, h0 + hs, 'limewash_white');
    R(T, T, T + 0.02, D - T, 0.3, h0 + hs, 'limewash_white'); R(L - T - 0.02, T, L - T, D - T, 0.3, h0 + hs, 'limewash_white');
    // floor, step, ceiling beams
    R(T, T, L - T, D - T, 0.3, 0.45, 'cotto_floor'); col.floor(F.R(T, T, L - T, D - T), fy);
    R(a.uc - a.r, -0.7, a.uc + a.r, 0, 0.0, 0.22, 'limestone'); col.floor(F.R(a.uc - a.r, -0.7, a.uc + a.r, 0), y + 0.22);
    R(a.uc - a.r - 0.3, -0.2, a.uc + a.r + 0.3, 0.02, 0.0, 0.5, 'limestone');
    // upper front wall: with windows cut through
    const holes = [];
    for (let s = 1; s < n; s++) for (let k = 0; k < wn; k++) holes.push({ u0: wu(k), u1: wu(k) + WW, b: sillAt(s), t: sillAt(s) + WH });
    holes.sort((p, q) => p.u0 - q.u0);
    let u = 0;
    R(0, 0, L, T, h0, sillAt(1), wall);
    for (const hh of holes) { /* full-height strips between holes */ }
    const strips = [[0, holes.length ? holes[0].u0 : L]];
    for (let i = 0; i < holes.length; i++) strips.push([holes[i].u1, holes[i + 1] ? holes[i + 1].u0 : L]);
    for (const [a0, a1] of strips) R(a0, 0, a1, T, sillAt(1), H, wall);
    for (const hh of holes) {
      // between storeys over each window to the next sill
      const next = hh.t + (hs - WH);
      R(hh.u0, 0, hh.u1, T, hh.t, Math.min(next, H), wall);
      R(hh.u0, 0, hh.u1, 0.08, hh.b, hh.t, 'opening'); R(hh.u0, T - 0.1, hh.u1, T - 0.03, hh.b, hh.t, 'daylight_plain');
    }
    col.rect(F.R(0, 0, L, T), y + h0, y + H + 1);
    u = 0; void u;
    // the first floor: the slab with the stair's well, beams under it, the ceiling above
    const stairV0 = 7.6, stairV1 = Math.min(D - 6, 13.4), hasStair = n > 1;
    const slab = (u0, v0, u1, v1) => { if (u1 - u0 < 0.05 || v1 - v0 < 0.05) return; R(u0, v0, u1, v1, h0 - 0.25, h0, 'timber'); col.floor(F.R(u0, v0, u1, v1), y + h0); };
    if (hasStair) {
      slab(T, T, L - T, stairV0); slab(T + 1.4, stairV0, L - T, D - T); slab(T, stairV1, T + 1.4, D - T);
      // the stair: steps rising toward the front, along the left wall
      const nS = 13, dir = DIR[`${F.out[0]},${F.out[1]}`];
      col.ramp(F.R(T, stairV0, T + 1.4, stairV1), fy, y + h0, dir);
      for (let k = 0; k < nS; k++) { const v1 = stairV1 - k * (stairV1 - stairV0) / nS, v0 = v1 - (stairV1 - stairV0) / nS, top = 0.45 + (k + 1) * (h0 - 0.45) / nS; R(T, v0, T + 1.4, v1, 0.3, top, 'timber'); }
      for (let k = 0; k <= 4; k++) { const vv = stairV0 + k * (stairV1 - stairV0) / 4; R(T + 1.36, vv - 0.03, T + 1.42, vv + 0.03, 0.45 + (stairV1 - vv) / (stairV1 - stairV0) * (h0 - 0.45), 1.4 + (stairV1 - vv) / (stairV1 - stairV0) * (h0 - 0.45), 'wood_dark'); }
      // the chamber above: a bed, a chest, a table by the window, a bench
      const k2 = kit(ctx, F, y + h0 + 0.0, rand);
      if (L > 6) { k2.bed(L - T - 1.1, T + 0.4, 1.5, 2.1); k2.chest(T + 2.6, T + 0.5, 1.0, 0.5); k2.table(L * 0.5, T + 1.0, 1.1, 0.7); k2.stool(L * 0.5, T + 1.8); }
      k2.bed(L - T - 1.1, D - T - 2.5, 1.5, 2.1); k2.chest(T + 2.4, D - T - 0.5, 1.1, 0.5);
      { const pl = F.P(L / 2, 2.5); lights.push({ at: [pl[0], y + h0 + 2.3, pl[1]], color: '#ffc27a', intensity: 4, distance: 8 }); }
    }
    // ceiling of the chamber's storey and the mass above
    R(T, T, L - T, D - T, h0 + hs - 0.05, h0 + hs, 'plaster_white');
    for (let v = T + 0.6; v < D - T; v += 0.9) R(T, v - 0.08, L - T, v + 0.08, h0 + hs - 0.25, h0 + hs - 0.05, 'wood_dark');
    if (H > h0 + hs) R(T, T, L - T, D - T, h0 + hs, H, wall);
    // ground ceiling beams (under the first floor)
    for (let u2 = T + 0.7; u2 < L - T; u2 += 0.9) R(u2 - 0.08, T, u2 + 0.08, D - T, h0 - 0.5, h0 - 0.25, 'wood_dark');
    if (!hasStair) { R(T, T, L - T, D - T, h0 - 0.05, h0, 'plaster_white'); }
    // ── the rooms
    const K = kit(ctx, F, fy, rand), vp = 7.0;
    const pu = [0, 0, 0];
    void pu;
    // partition with an arched door and a narrow side door
    const dw = 1.6, du = L * 0.5;
    R(T, vp, du - dw / 2, vp + 0.4, 0.3, h0 - 0.25, 'limewash_white', true); R(du + dw / 2, vp, L - T, vp + 0.4, 0.3, h0 - 0.25, 'limewash_white', true);
    R(du - dw / 2, vp, du + dw / 2, vp + 0.4, 2.55, h0 - 0.25, 'limewash_white'); col.rect(F.R(du - dw / 2, vp, du + dw / 2, vp + 0.4), y + 3.0, y + H + 1);
    for (const s of [du - dw / 2 - 0.1, du + dw / 2]) R(s, vp - 0.05, s + 0.1, vp + 0.45, 0.3, 2.65, 'limestone');
    const use = el.use ?? 'home';
    if (use !== 'home') { shop(K, F, L, vp - 0.2, use, rand); }
    else home(K, F, L, T, vp - 0.1, kind, rand);
    // hall behind the partition: a table, a barrel, the stair's foot; the kitchen at the back with its hearth
    const kv0 = Math.min(D - 7, stairV1 + 0.5);
    K.hearth(L * 0.5, D - T, 1.9);
    K.table(L * 0.5 - 1.1, (kv0 + D - T) / 2 - 0.3, 1.6, 0.85); K.stool(L * 0.5 - 1.9, (kv0 + D - T) / 2 - 0.3); K.stool(L * 0.5 - 0.3, (kv0 + D - T) / 2 + 0.3);
    for (let k = 0; k < 3; k++) K.barrel(L - T - 0.5, kv0 + 0.5 + k * 0.75, 0, 0.28, 0.75);
    for (let k = 0; k < 4; k++) K.sack(L - T - 1.5, kv0 + 0.4 + k * 0.5, 0);
    K.A('wood_dark', T, D - T - 1.0, T + 0.5, D - T - 0.1, 0, 1.8, true);
    for (const hh of [0.6, 1.1, 1.6]) K.A('timber', T, D - T - 1.0, T + 0.5, D - T - 0.1, hh - 0.02, hh + 0.02);
    if (D > 14) { K.crate(T + 1.0, kv0 + 0.3, 0); K.crate(T + 1.0, kv0 + 0.3, 0.5, 0.5); K.coil(T + 1.3, kv0 + 1.4, 0); }
    // the rear window and the light of the hall
    R(L * 0.25, D - T - 0.1, L * 0.25 + 1.0, D - T - 0.04, 1.1, 2.4, 'daylight_plain'); R(L * 0.7, D - T - 0.1, L * 0.7 + 1.0, D - T - 0.04, 1.1, 2.4, 'daylight_plain');
    const p1 = F.P(L / 2, 3.2), p2 = F.P(L / 2, vp + 4);
    lights.push({ at: [p1[0], fy + 2.3, p1[1]], color: '#ffc27a', intensity: 5, distance: 9 }, { at: [p2[0], fy + 2.3, p2[1]], color: '#ffb866', intensity: 4, distance: 9 });
    // the shop's own lamp hung inside the arch
  }
  // ── the street front: quoins, cornice, damp, streaks, patches
  for (const [u0, u1] of [[0, 0.45], [L - 0.45, L]]) R(u0 - 0.03, -0.03, u1 + 0.03, 0.4, 0, H - 0.3, cap);
  R(-0.08, -0.4, L + 0.08, D + 0.08, H - 0.28, H + 0.12, 'limestone');
  if (!simple) {
    R(0.45, -0.03, L - 0.45, 0.03, 0.8, 1.5 + rand() * 0.4, 'plaster_damp');
    for (let s = 1; s < n; s++) if (rand() < 0.6) { const k = Math.floor(rand() * wn); R(wu(k) + 0.1, -0.045, wu(k) + 0.1 + 0.3, 0.06, sillAt(s) - 1.7, sillAt(s) - 0.2, 'plaster_streak'); }
    if (rand() < 0.4) { const u0 = 0.7 + rand() * Math.max(0.1, L - 2.4); R(u0, -0.06, u0 + 0.9, 0.09, 0.9, 1.5, rand() < 0.5 ? 'brick' : 'rubble'); }
    if (rand() < 0.4) { const u0 = L * rand(); R(u0, -0.045, u0 + 0.2, 0.12, H - 2.5, H - 0.4, 'plaster_streak'); }
  }
  // the door: stone frame, leaf set back (shut, or open on its own step in open houses)
  { const dw2 = 1.1, du2 = doorU;
    if (!open) {
      R(du2 - dw2 / 2 - 0.2, -0.12, du2 + dw2 / 2 + 0.2, 0.15, 0.0, 2.55, 'limestone'); R(du2 - dw2 / 2 - 0.25, -0.15, du2 + dw2 / 2 + 0.25, 0.15, 2.4, 2.75, 'limestone');
      R(du2 - dw2 / 2, -0.02, du2 + dw2 / 2, 0.2, 0.0, 2.4, 'wood_dark');
      if (!simple) for (let k = 0; k < 3; k++) for (let j = 0; j < 4; j++) R(du2 - 0.4 + k * 0.4, -0.04, du2 - 0.34 + k * 0.4, -0.02, 0.5 + j * 0.5, 0.56 + j * 0.5, 'iron');
    } else { R(doorU - 1.55, -0.12, doorU - 1.3, 0.0, 0.0, 3.4, 'limestone'); R(doorU + 1.3, -0.12, doorU + 1.55, 0.0, 0.0, 3.4, 'limestone'); R(doorU - 1.6, -0.15, doorU + 1.6, 0.0, 3.4, 3.7, 'limestone'); }
  }
  if (simple) { roofOver(); return; }
  // upper windows: stone frame, hood, mullion, shutters; an iron balcony or a lattice rótula on the first floor of merchants
  for (let s = 1; s < n; s++) {
    const yy = sillAt(s);
    for (let k = 0; k < wn; k++) {
      const u = wu(k);
      if (!open) { R(u, -0.1, u + WW, 0.16, yy, yy + WH, 'opening'); }
      R(u - 0.15, -0.12, u, 0.12, yy - 0.15, yy + WH + 0.15, 'limestone'); R(u + WW, -0.12, u + WW + 0.15, 0.12, yy - 0.15, yy + WH + 0.15, 'limestone');
      R(u - 0.2, -0.16, u + WW + 0.2, 0.12, yy - 0.2, yy - 0.05, 'limestone'); R(u - 0.15, -0.12, u + WW + 0.15, 0.12, yy + WH, yy + WH + 0.15, 'limestone');
      if (hoods) R(u - 0.28, -0.2, u + WW + 0.28, 0.1, yy + WH + 0.15, yy + WH + 0.27, 'limestone_carved');
      if (WW > 1.1) R(u + WW / 2 - 0.04, -0.12, u + WW / 2 + 0.04, 0.1, yy, yy + WH, 'limestone');
      if (rand() < 0.6) { R(u - 0.5, -0.1, u - 0.05, 0.1, yy, yy + WH, shut); R(u + WW + 0.05, -0.1, u + WW + 0.5, 0.1, yy, yy + WH, shut); }
      if (kind === 'merchant' && s === 1 && wn > 1 && k !== 1 && !open && rand() < 0.45) {
        const bw = 0.62, bd = 0.5, uc = u + WW / 2;
        R(uc - bw - 0.1, -bd, uc + bw + 0.1, 0, yy - 0.3, yy - 0.2, 'limestone');
        R(uc - bw - 0.1, -bd, uc + bw + 0.1, -bd + 0.03, yy + 0.85, yy + 0.9, 'iron'); R(uc - bw - 0.1, -bd, uc - bw - 0.07, 0, yy + 0.85, yy + 0.9, 'iron'); R(uc + bw + 0.07, -bd, uc + bw + 0.1, 0, yy + 0.85, yy + 0.9, 'iron');
        for (let b = uc - bw; b <= uc + bw + 0.01; b += 0.14) R(b - 0.012, -bd, b + 0.012, -bd + 0.025, yy - 0.2, yy + 0.85, 'iron');
      }
    }
    if (kind === 'merchant' && s === 1 && !open && rand() < 0.4) {
      const u0 = Math.max(0.5, L * 0.3), u1 = Math.min(L - 0.5, u0 + Math.min(4.5, L - 1));
      R(u0, -1.0, u1, 0.0, yy - 0.3, yy - 0.05, 'timber'); R(u0, -1.0, u1, -0.9, yy - 0.05, yy + 1.45, 'wood_painted'); R(u0, -1.0, u0 + 0.1, 0.0, yy - 0.05, yy + 1.45, 'wood_painted'); R(u1 - 0.1, -1.0, u1, 0.0, yy - 0.05, yy + 1.45, 'wood_painted');
      for (let uu = u0 + 0.2; uu < u1 - 0.2; uu += 0.3) R(uu, -1.02, uu + 0.06, -0.9, yy + 0.2, yy + 1.4, 'timber');
      R(u0 - 0.05, -1.05, u1 + 0.05, 0.0, yy + 1.45, yy + 1.58, 'timber');
    }
  }
  if (!shopF && !open) R(doorU > L / 2 ? 0.7 : L - 1.7, -0.08, doorU > L / 2 ? 1.5 : L - 0.9, 0.12, 1.3, 2.0, 'opening');
  // the shop's stone bench and its leaves folded back beside the arch
  if (shopF && ops.length && !open) for (const o of ops) { R(o.uc - o.r - 0.3, -0.4, o.uc - o.r, 0, 0.0, 0.5, 'limestone'); R(o.uc + o.r, -0.06, o.uc + o.r + 0.5, 0.06, 0.4, 2.6, 'wood_dark'); }
  roofOver();
  function roofOver() {
    const alongX = F.alongX, r = body, aged = rand() < 0.25, tile = kind === 'fisher' && rand() < 0.3 ? 'thatch' : aged ? 'tile_dark' : 'roof_tile';
    const short = Math.min(r[2] - r[0], r[3] - r[1]);
    if (kind === 'merchant' && rand() < 0.45 && L < D) hip(bag, tile, r, y + H + 0.12, Math.min(2.2, short * 0.3), 0.55);
    else {
      const along = kind === 'merchant' ? alongX : rand() < 0.45 ? !alongX : alongX;
      gable(bag, tile, r, y + H + 0.12, Math.min(kind === 'alfama' ? 1.1 : 1.6, (along ? r[3] - r[1] : r[2] - r[0]) * 0.34), along, 0.45);
    }
    // the ridge's stain and the eaves' tile course
    if (!simple && rand() < 0.5) { const [cx, cz] = F.P(L * (0.2 + 0.6 * rand()), D * 0.5); bag.add('brick', box(cx - 0.3, y + H, cz - 0.3, cx + 0.3, y + H + 2.4, cz + 0.3)); bag.add('brick', box(cx - 0.4, y + H + 2.4, cz - 0.4, cx + 0.4, y + H + 2.55, cz + 0.4)); }
    if (!simple && kind === 'merchant' && rand() < 0.2) { const [cx, cz] = F.P(L * 0.5, D * 0.5); bag.add('timber', box(cx - 1.4, y + H + 1.0, cz - 1.4, cx + 1.4, y + H + 1.08, cz + 1.4)); for (const [a, b] of [[-1.3, -1.3], [1.3, -1.3], [-1.3, 1.3], [1.3, 1.3]]) bag.add('timber', box(cx + a - 0.05, y + H + 0.1, cz + b - 0.05, cx + a + 0.05, y + H + 1.0, cz + b + 0.05)); }   // a roof terrace (mirante)
  }
}
