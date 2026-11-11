// The houses of Lisbon about 1520 (docs/settlements/manueline-lisbon.md §8): the tall merchants' houses of the Rua Nova with
// arched shop fronts and stone-framed windows, lattice balconies over the street, tile roofs of low pitch; the narrow houses of the
// Alfama stepped up the hill; the low whitewashed houses of the fishermen at Belém. Element `manu_house` { rect, front, y, plinth, seed, kind, simple }.
import { box, lathe, fromTriangles } from '../../core/geom.js';
import { archWall } from '../gothic/nd-interior.js';
import { frame } from '../greek/agora.js';
import { rng, pick, gable, addBox } from './util.js';

const WALLS = ['plaster_white', 'plaster_white', 'limewash_yellow', 'plaster_ochre', 'stucco_rose', 'stucco_pale', 'limewash_white', 'stucco_cream', 'plaster_white'];
const SHUT = ['shutter_green', 'shutter_brown', 'shutter_grey', 'shutter_green'];
export function manuHouse(el, ctx) {
  const { bag, col } = ctx, rand = rng(el.seed || 1), y = el.y ?? 0, F = frame(el.rect, el.front ?? 's'), { L, D } = F, simple = !!el.simple;
  const kind = el.kind ?? 'merchant', plinth = el.plinth ?? 0.6;
  const n = kind === 'merchant' ? 3 + (rand() < 0.4 ? 1 : 0) : kind === 'alfama' ? 2 + Math.floor(rand() * 3) : 1 + (rand() < 0.4 ? 1 : 0);
  const h0 = kind === 'merchant' ? 3.9 : 3.0, hs = kind === 'merchant' ? 3.4 : 3.0, H = h0 + (n - 1) * hs;
  const wall = pick(rand, WALLS), shut = pick(rand, SHUT), cap = kind === 'merchant' ? 'limestone' : 'plaster_white';
  const R = (u0, v0, u1, v1, y0, y1, m, solid = false) => { const r = F.R(u0, v0, u1, v1); bag.add(m, box(r[0], y + y0, r[1], r[2], y + y1, r[3])); if (solid) col.rect(r, y + y0, y + y1); return r; };
  // body: foundation to the lot's lowest ground, then the plinth, the plastered storeys
  const body = F.R(0, 0, L, D);
  col.rect(body, y - plinth, y + H + 1);
  bag.add('limestone', box(body[0], y - plinth, body[1], body[2], y + 0.7, body[3]));
  // the front: the ground storey in segments around the shop arches / door, upper storeys plain with window overlays
  const shop = kind !== 'fisher' && (kind === 'merchant' ? rand() < 0.85 : rand() < 0.3), th = 0.5;
  const ops = [];
  if (kind === 'merchant' && L > 7.5) { const nA = L > 10.5 ? 2 : 1, wA = L / (nA + 1); for (let k = 0; k < nA; k++) ops.push({ uc: wA * (k + 1) - (nA === 2 ? 0.6 : -0.9) * (k ? -1 : 1) * 0, r: 1.15, sill: y, spring: y + 2.0, f: 0.5 }); }
  const doorU = shop && ops.length ? (ops.length === 2 ? L - 1.3 : L * 0.22) : L * (0.25 + rand() * 0.5);
  if (shop && ops.length) { if (ops.length === 1) ops[0].uc = L * 0.62; else { ops[0].uc = L * 0.3; ops[1].uc = L * 0.62; } }
  const tri = [];
  if (!simple && ops.length && shop) {
    archWall(tri, (u, yy, d) => F.P(u, d).length && [F.P(u, d)[0], yy, F.P(u, d)[1]], { u0: 0, u1: L, d0: 0, d1: th, y0: y + 0.7, y1: y + h0, openings: ops, n: 6 });
    bag.add(wall, fromTriangles(tri));
    // the dark of the shop behind its arch
    for (const o of ops) { const r = F.R(o.uc - o.r, th - 0.02, o.uc + o.r, th + 0.04); bag.add('opening', box(r[0], y + 0.0, r[1], r[2], y + 3.4, r[3])); }
    R(0, th, L, D, 0.7, h0, wall, false);
  } else R(0, 0, L, D, 0.7, h0, wall, false);
  R(0, 0, L, D, h0, H, wall, false);
  // quoins and the cornice
  for (const [u0, u1] of [[0, 0.45], [L - 0.45, L]]) R(u0 - 0.03, -0.03, u1 + 0.03, 0.4, 0, H, cap, false);
  R(-0.08, -0.4, L + 0.08, D + 0.08, H - 0.28, H + 0.12, 'limestone', false);
  // the door: stone frame, leaf set back
  { const du = doorU, dw = 1.1;
    R(du - dw / 2 - 0.2, -0.12, du + dw / 2 + 0.2, 0.15, 0.0, 2.55, 'limestone'); R(du - dw / 2 - 0.25, -0.15, du + dw / 2 + 0.25, 0.15, 2.4, 2.75, 'limestone');
    R(du - dw / 2, -0.02, du + dw / 2, 0.2, 0.0, 2.4, 'wood_dark'); }
  if (simple) { roof(); return; }
  // upper windows: stone frame, dark glass, shutters; a lattice balcony (rótula) on the first floor of the street front for merchants
  const wn = Math.max(1, Math.floor((L - 1.2) / 2.6));
  for (let s = 1; s < n; s++) {
    const yy = h0 + (s - 1) * hs + 0.8;
    for (let k = 0; k < wn; k++) {
      const u = 0.6 + (k + 0.5) * (L - 1.2) / wn - 0.45;
      if (kind !== 'fisher' || true) {
        R(u - 0.18, -0.12, u + 0.9 + 0.18, 0.12, yy - 0.15, yy + 1.5 + 0.2, 'limestone');
        R(u, -0.1, u + 0.9, 0.16, yy, yy + 1.5, 'opening');
        if (rand() < 0.6) { R(u - 0.5, -0.1, u - 0.05, 0.1, yy, yy + 1.5, shut); R(u + 0.95, -0.1, u + 1.4, 0.1, yy, yy + 1.5, shut); }
      }
    }
    if (kind === 'merchant' && s === 1 && rand() < 0.55) {
      const u0 = Math.max(0.5, L * 0.3), u1 = Math.min(L - 0.5, u0 + Math.min(4.5, L - 1));
      R(u0, -1.0, u1, 0.0, yy - 0.3, yy - 0.05, 'timber'); R(u0, -1.0, u1, -0.9, yy - 0.05, yy + 1.45, 'wood_painted'); R(u0, -1.0, u0 + 0.1, 0.0, yy - 0.05, yy + 1.45, 'wood_painted'); R(u1 - 0.1, -1.0, u1, 0.0, yy - 0.05, yy + 1.45, 'wood_painted');
      for (let u = u0 + 0.2; u < u1 - 0.2; u += 0.3) R(u, -1.02, u + 0.06, -0.9, yy + 0.2, yy + 1.4, 'timber');
      R(u0 - 0.05, -1.05, u1 + 0.05, 0.0, yy + 1.45, yy + 1.58, 'timber');
    }
  }
  // the ground storey of poor houses: a small barred window
  if (!shop) R(doorU > L / 2 ? 0.7 : L - 1.7, -0.08, doorU > L / 2 ? 1.5 : L - 0.9, 0.12, 1.3, 2.0, 'opening');
  roof();
  function roof() {
    const alongX = F.alongX, r = body, tile = kind === 'fisher' && rand() < 0.4 ? 'thatch' : 'roof_tile';
    const rise = kind === 'alfama' ? 1.1 : 1.6;
    gable(bag, tile, [r[0] + 0.0, r[1] + 0.0, r[2] - 0.0, r[3] - 0.0], y + H + 0.12, Math.min(rise, (alongX ? (r[3] - r[1]) : (r[2] - r[0])) * 0.34), alongX, 0.45);
    if (!simple && rand() < 0.5) { const [cx, cz] = F.P(L * (0.2 + 0.6 * rand()), D * 0.5); bag.add('brick', box(cx - 0.3, y + H, cz - 0.3, cx + 0.3, y + H + 2.4, cz + 0.3)); bag.add('brick', box(cx - 0.4, y + H + 2.4, cz - 0.4, cx + 0.4, y + H + 2.55, cz + 0.4)); }
  }
}
