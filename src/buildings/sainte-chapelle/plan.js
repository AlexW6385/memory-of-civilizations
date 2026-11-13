// The Sainte-Chapelle, Paris, as consecrated in 1248 — plan data from
// docs/buildings/sainte-chapelle.md (§4). Local coordinates: origin on the axis at the inner face
// of the west wall, +x east (the apse), +z south; y = 0 at the courtyard. Metres.

import { SITES } from '../../world/regions.js';
import './style.js';

const E = [];
const add = (o) => (E.push(o), o);
const pwall = (o) => add({ t: 'planar_wall', ...o });
const floor = (rect, y, mat, extra = {}) => add({ t: 'floor', rect, y, mat, ...extra });
const D2R = Math.PI / 180;

const HW = 5.35;                     // half the inner width
const BAY = 6.9, NB = 4, XA = BAY * NB;   // four straight bays; the apse begins at x = 27.6
const T = 0.7;                       // wall thickness (the walls are mostly glass between piers)
const UP = 7.6;                      // upper chapel floor
const LV = 6.6;                      // lower chapel vault crown
const SPR = 22.8, CROWN = UP + 20.5; // upper vaults
const EAVE = 27.0, RIDGE = 42.5;
const APSE = { sides: 7, a0: -90, a1: 90 };
const apsePt = (k, r) => { const a = (APSE.a0 + (APSE.a1 - APSE.a0) * k / APSE.sides) * D2R; return [XA + Math.cos(a) * r, Math.sin(a) * r]; };
const RAP = HW / Math.cos(Math.PI / 14);
export const GAL = { x0: -5.2, x1: -0.6, z0: -34 };   // the king's gallery, north from the upper porch's landing (local)   // apse corner radius for an inner apothem of HW

// ── the courtyard of the palace ─────────────────────────────────────────────
floor([-40, -32, 52, 46], 0, 'travertine', { th: 0.3 });

// ── floors ───────────────────────────────────────────────────────────────────
floor([0, -HW, XA + HW, HW], 0.15, 'marble_floor', { th: 0.3 });
floor([-4.5, -5.7, 0, 5.7], 0.15, 'marble_floor', { th: 0.3 });                 // lower porch
add({ t: 'slab', rect: [0, -HW - T, XA, HW + T], y0: LV, y1: UP - 0.1, mat: 'limestone', holes: [] });
floor([0, -HW, XA + HW, HW], UP, 'proconnesian', { th: 0.25 });
floor([-4.5, -9.6, 0, 5.7], UP, 'marble_floor', { th: 0.25 });                    // upper porch and the stair's landing
add({ t: 'block', rect: [-4.5, -9.6, -1.3, -5.7], y0: 0, y1: UP - 0.25, mat: 'limestone' });

// ── the lower chapel: two rows of slender columns, rib vaults, small windows ─
for (const sz of [-1, 1]) for (let k = 1; k < NB; k++) add({ t: 'column', at: [k * BAY, sz * 2.95], y: 0.15, h: 3.45, d: 0.42, shaftMat: k % 2 ? 'paint_fleur' : 'paint_castle' });
for (let k = 0; k < NB; k++) {
  add({ t: 'rib_vault', rect: [k * BAY, -2.95, (k + 1) * BAY, 2.95], spring: 3.6, crown: LV, f: 0.7, mat: 'vault_stars', ribMat: 'paint_castle' });
  for (const sz of [-1, 1]) add({ t: 'rib_vault', rect: [k * BAY, Math.min(sz * 2.95, sz * HW), (k + 1) * BAY, Math.max(sz * 2.95, sz * HW)], spring: 3.6, crown: 5.4, f: 0.8, mat: 'vault_stars', ribMat: 'paint_castle', transverse: false });
}
add({ t: 'apse_vault', c: [XA, 0], R: HW, a0: -90, a1: 90, sides: 7, spring: 3.6, crown: LV, mat: 'vault_stars', ribMat: 'paint_castle' });

// ── walls: lower and upper, the long sides ───────────────────────────────────
// Outside, between the buttresses with their crocketed pinnacles, each upper window has its moulded frame and over it a
// crocketed gable (gâble) with a trefoil, standing in front of the openwork balustrade along the cornice at the roof's
// foot; the lower chapel's windows are spherical triangles (§4, "The flanks and the roof").
const BTOP = (d, steps = 3) => d * (1 - (steps - 1) / (steps + 0.5));   // the depth of a buttress's top step
for (const sz of [-1, 1]) {
  const z = sz * (HW + T / 2), inS = -sz, out = [0, sz];
  const lowCircles = [], upArches = [];
  for (let k = 0; k < NB; k++) {
    lowCircles.push({ uc: (k + 0.5) * BAY, yc: 3.0, r: 1.1 });
    upArches.push({ uc: (k + 0.5) * BAY, r: 2.45, spring: SPR, sill: 11.0, pointed: 0.75 });
  }
  pwall({ o: [0, z], u: [1, 0], th: T, u0: -0.35, u1: XA, y0: 0, y1: UP, circles: lowCircles, mat: 'limestone' });
  pwall({ o: [0, z], u: [1, 0], th: T, u0: -0.35, u1: XA, y0: UP, y1: EAVE, arches: upArches, mat: 'limestone', collide: false });
  // painted dado below the windows, with its stone bench
  pwall({ o: [0, z + inS * (T / 2 + 0.03)], u: [1, 0], th: 0.06, u0: 0, u1: XA, y0: UP, y1: 11.0, mat: 'paint_castle', collide: false });
  add({ t: 'block', rect: [0, Math.min(z + inS * T / 2, z + inS * (T / 2 + 0.5)), XA, Math.max(z + inS * T / 2, z + inS * (T / 2 + 0.5))], y0: UP, y1: UP + 0.45, mat: 'limestone' });
  // the blind arcade over the bench, bay by bay, with its medallions of the martyrs; the royal oratories in the third bay
  for (let k = 0; k < NB; k++) add({ t: 'sc_dado', o: [0, z + inS * (T / 2 + 0.06)], u: [1, 0], n: [0, inS], u0: k * BAY + 0.42, u1: (k + 1) * BAY - 0.42, y0: UP + 0.45, y1: 11.0, count: 5, niche: k === 2 ? 2 : -1 });
  for (let k = 0; k < NB; k++) {
    const uc = (k + 0.5) * BAY;
    add({ t: 'gothic_window', o: [0, z], u: [1, 0], uc, w: 4.9, sill: 11.0, spring: SPR, f: 0.75, lancets: 4, inSide: inS });
    add({ t: 'sc_window_frame', o: [0, z], u: [1, 0], n: out, d0: T / 2, arch: { uc, r: 2.45, spring: SPR, pointed: 0.75 }, sill: 11.0 });
    add({ t: 'sc_tri_window', o: [0, z], u: [1, 0], uc, yc: 3.0, r: 1.1, inSide: inS });
    add({ t: 'sc_gable', o: [0, z], u: [1, 0], n: out, uc, w: 5.0, y0: EAVE + 0.04, h: 5.4, d: T / 2 + 0.6 });
    add({ t: 'sc_balustrade', o: [0, z], u: [1, 0], u0: k === 0 ? -0.35 : k * BAY + 0.95, u1: (k + 1) * BAY - 0.95, y: EAVE + 0.04, h: 0.9, d: sz * (T / 2 + 0.2) });
  }
  // the piers between the windows: shafts inside, buttresses outside with their pinnacles
  for (let k = 0; k <= NB; k++) {
    const x = k * BAY;
    if (k > 0) for (const dz of [-0.35, 0, 0.35]) add({ t: 'column', at: [x + dz, z + inS * (T / 2 + 0.18)], y: UP + 0.45, h: SPR - UP - 0.45, d: 0.2, shaftMat: 'paint_fleur' });
    if (k > 0) {
      add({ t: 'buttress', at: [x, z - inS * T / 2], dir: [0, -inS], w: 1.9, d: 3.3, y0: 0, y1: EAVE + 1.0, steps: 3, pinnacle: 0 });
      add({ t: 'sc_pinnacle', at: [x, z - inS * (T / 2 + BTOP(3.3) / 2)], y: EAVE + 1.0, w: 1.3, h: 6.6 });
    }
  }
  add({ t: 'sc_cornice', o: [0, z], u: [1, 0], n: out, u0: -0.35, u1: XA, y: EAVE + 0.04, d0: T / 2, p: 0.95 });
}

// ── the apse: seven sides, each with its window ─────────────────────────────
for (let k = 0; k < APSE.sides; k++) {
  const ri = RAP + 0.0;
  const a = apsePt(k, ri + T / 2 / Math.cos(Math.PI / 14)), b = apsePt(k + 1, ri + T / 2 / Math.cos(Math.PI / 14));
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), u = [(b[0] - a[0]) / L, (b[1] - a[1]) / L];
  const ext = 0.12;
  pwall({ o: a, u, th: T, u0: -ext, u1: L + ext, y0: 0, y1: UP, mat: 'limestone' });
  pwall({ o: a, u, th: T, u0: -ext, u1: L + ext, y0: UP, y1: EAVE, arches: [{ uc: L / 2, r: 1.05, spring: 24.4, sill: 12.0, pointed: 0.8 }], mat: 'limestone', collide: false });
  // inward is to the left of the direction of travel round the apse (counter-clockwise seen from above)
  add({ t: 'gothic_window', o: a, u, uc: L / 2, w: 2.1, sill: 12.0, spring: 24.4, f: 0.8, lancets: 2, inSide: 1 });
  const n = [-u[1], u[0]], out = [u[1], -u[0]];
  pwall({ o: [a[0] + n[0] * (T / 2 + 0.03), a[1] + n[1] * (T / 2 + 0.03)], u, th: 0.06, u0: 0, u1: L, y0: UP, y1: 12.0, mat: 'paint_castle', collide: false });
  add({ t: 'sc_dado', o: [a[0] + n[0] * (T / 2 + 0.06), a[1] + n[1] * (T / 2 + 0.06)], u, n, u0: 0.3, u1: L - 0.3, y0: UP, y1: 12.0, count: 2, niche: -1 });
  add({ t: 'sc_window_frame', o: a, u, n: out, d0: T / 2, arch: { uc: L / 2, r: 1.05, spring: 24.4, pointed: 0.8 }, sill: 12.0 });
  add({ t: 'sc_cornice', o: a, u, n: out, u0: -ext, u1: L + ext, y: EAVE + 0.04, d0: T / 2, p: 0.95 });
  add({ t: 'sc_balustrade', o: a, u, u0: 0.75, u1: L - 0.75, y: EAVE + 0.04, h: 0.9, d: -(T / 2 + 0.2) });
  add({ t: 'sc_gable', o: a, u, n: out, uc: L / 2, w: 2.0, y0: EAVE + 0.04, h: 3.6, d: T / 2 + 0.6 });
  // a buttress at each corner of the apse, pointing outward, with its pinnacle
  const c = apsePt(k + 1, RAP + T), dir = [(c[0] - XA), c[1]], dl = Math.hypot(...dir), dn = [dir[0] / dl, dir[1] / dl];
  if (k < APSE.sides - 1) {
    add({ t: 'buttress', at: c, dir: dn, w: 1.5, d: 3.0, y0: 0, y1: EAVE + 1.0, steps: 3, pinnacle: 0 });
    add({ t: 'sc_pinnacle', at: [c[0] + dn[0] * BTOP(3.0) / 2, c[1] + dn[1] * BTOP(3.0) / 2], y: EAVE + 1.0, w: 1.1, h: 5.8 });
  }
}
add({ t: 'rib_vault', rect: [0, -HW, BAY, HW], spring: SPR, crown: CROWN, f: 0.7, mat: 'vault_stars', ribMat: 'paint_castle' });
for (let k = 1; k < NB; k++) add({ t: 'rib_vault', rect: [k * BAY, -HW, (k + 1) * BAY, HW], spring: SPR, crown: CROWN, f: 0.7, mat: 'vault_stars', ribMat: 'paint_castle' });
add({ t: 'apse_vault', c: [XA, 0], R: HW, a0: -90, a1: 90, sides: 7, spring: SPR, crown: CROWN, mat: 'vault_stars', ribMat: 'paint_castle' });

// ── the west front: portals, the rose, the gable; the two-storey porch; turrets ─
pwall({ o: [-T / 2, -HW - T], u: [0, 1], th: T, u0: 0, u1: 2 * (HW + T), y0: 0, y1: UP, arches: [{ uc: HW + T, r: 1.3, spring: 3.3, sill: 0.15, pointed: 0.8 }], mat: 'limestone' });
pwall({ o: [-T / 2, -HW - T], u: [0, 1], th: T, u0: 0, u1: 2 * (HW + T), y0: UP, y1: EAVE, arches: [{ uc: HW + T, r: 1.3, spring: UP + 3.3, sill: UP, pointed: 0.8 }], circles: [{ uc: HW + T, yc: 19.6, r: 4.3 }], mat: 'limestone' });
add({ t: 'rose', o: [-T / 2, -HW - T], u: [0, 1], uc: HW + T, yc: 19.6, r: 4.3, spokes: 12, inSide: -1 });
add({ t: 'gable', o: [-T / 2, -HW - T], u: [0, 1], uc: HW + T, w: 2 * (HW + T) + 0.6, y0: EAVE, h: RIDGE - EAVE - 0.6, th: T });
add({ t: 'obj', kind: 'doors', at: [-0.1, 0], y: 0.15, yaw: Math.PI / 2, w: 2.5, h: 3.9, th: 0.12, depth: 0 });
add({ t: 'obj', kind: 'doors', at: [-0.1, 0], y: UP, yaw: Math.PI / 2, w: 2.5, h: 3.9, th: 0.12, depth: 0 });
// the porch: three arches below and above, its floors, the roof of the upper porch
for (const [y0, y1, sp] of [[0, UP, 3.6], [UP, 13.0, UP + 3.4]]) {
  pwall({ o: [-4.85, -5.7], u: [0, 1], th: 0.7, u0: 0, u1: 11.4, y0, y1, arches: [1.9, 5.7, 9.5].map((uc) => ({ uc, r: 1.5, spring: sp, pointed: 0.8, sill: y0 > 0 ? y0 + 1.0 : y0 })), mat: 'limestone' });
  for (const sz of [-1, 1]) if (!(sz < 0 && y0 > 0)) pwall({ o: [-4.85, sz * 5.7], u: [1, 0], th: 0.7, u0: 0, u1: 4.5, y0, y1, arches: [{ uc: 2.3, r: 1.3, spring: sp, pointed: 0.8, sill: y0 > 0 ? y0 + 1.0 : y0 }], mat: 'limestone' });
}
add({ t: 'gable_roof', x0: -5.2, x1: -0.35, z0: -6.1, z1: 6.1, y: 13.0, ridge: 16.0, mat: 'lead' });
// the two west turrets
for (const sz of [-1, 1]) add({ t: 'sc_turret', at: [0.5, sz * 7.9], y: 0, r: 1.35, h: 33.5, spire: 6.5 });
// the portals' sculpture: the Virgin below, the Last Judgement above; the balustrade at the foot of the gable;
// gablets and pinnacles over the porch's upper arches
const WO = [-T / 2, -HW - T];
add({ t: 'sc_portal', o: WO, u: [0, 1], th: T, base: 0.15, arch: { uc: HW + T, r: 1.3, spring: 3.3, pointed: 0.8 }, doorTop: 0.15 + 3.9, kind: 'virgin' });
add({ t: 'sc_portal', o: WO, u: [0, 1], th: T, base: UP, arch: { uc: HW + T, r: 1.3, spring: UP + 3.3, pointed: 0.8 }, doorTop: UP + 3.9, kind: 'judgement' });
add({ t: 'sc_front', o: WO, u: [0, 1], uc: HW + T, eave: EAVE + 0.9, gw: 2 * (HW + T), th: T, rose: { yc: 19.6, r: 4.3 } });
add({ t: 'sc_balustrade', o: WO, u: [0, 1], u0: 0, u1: 2 * (HW + T), y: EAVE, h: 0.9, d: T / 2 + 0.1 });
for (const uc of [1.9, 5.7, 9.5]) add({ t: 'sc_gablet', o: [-4.85, -5.7], u: [0, 1], uc, w: 3.3, y0: 12.6, h: 2.5, d: 0.45, pinnacles: uc === 5.7 ? [] : [uc < 5 ? 0.12 : 11.28], pinH: 1.4 });
// the stair from the courtyard to the upper porch, with its parapets and blind arcading; and from the porch's landing the
// king's gallery (the galerie des Merciers) runs north on its arcade to the palace's Grand-Salle
add({ t: 'stair', rect: [-17.9, -9.6, -4.5, -7.6], dir: 'e', y0: 0, y1: UP, riser: 0.169, base: 0, mat: 'limestone' });
// the courtyard's paving under the stair and its parapets (the parapets' footings stand on it)
floor([-18.3, -10.2, -4.5, -7.0], 0.04, 'limestone', { th: 0.08 });
add({ t: 'sc_stair_rail', a: [-17.9, 0, -7.4], b: [-4.5, UP, -7.4], h: 1.0, th: 0.3 });
add({ t: 'sc_stair_rail', a: [-17.9, 0, -9.8], b: [-5.2, UP - 0.53, -9.8], h: 1.0, th: 0.3 });
add({ t: 'sc_stair_arcade', o: [-17.9, -7.6], u: [1, 0], n: [0, 1], u0: 0.3, u1: 13.4, y0: 0, ya: 0, yb: UP, d0: 0.02 });
add({ t: 'sc_stair_arcade', o: [-17.9, -9.6], u: [1, 0], n: [0, -1], u0: 0.3, u1: 12.7, y0: 0, ya: 0, yb: UP - 0.53, d0: 0.02 });
add({ t: 'sc_gallery', rect: [GAL.x0, GAL.z0, GAL.x1, -9.6], y: 0, fl: UP, h: 5.6 });

// ── the roof, the spire ──────────────────────────────────────────────────────
// the roof springs behind the balustrade (the gutter's walk between them); its lead in sheets with rolls, the gilt crest of
// fleurs-de-lis, the archangel Michael at the east end of the ridge; the flèche of oak and lead
const RZ = HW + T - 0.1, RY = EAVE + 0.06;
add({ t: 'gable_roof', x0: -0.6, x1: XA, z0: -RZ, z1: RZ, y: RY, ridge: RIDGE, mat: 'lead', ends: false });
add({ t: 'apse_roof', c: [XA, 0], R: RAP + T - 0.05, a0: -90, a1: 90, sides: 7, y: RY, ridge: RIDGE, mat: 'lead' });
add({ t: 'sc_roof_dress', x0: -0.6, x1: XA, z0: -RZ, z1: RZ, e: RY + 0.25, ridge: RIDGE, crestEnd: XA - 0.8, angel: [XA - 0.35, 0], apse: { c: [XA, 0], R: RAP + T - 0.05, y: RY, sides: 7, a0: -90, a1: 90 } });
add({ t: 'sc_fleche', at: [XA - 3.0, 0], y: RIDGE - 4.0, ridge: RIDGE, h: 33, r: 1.5 });

// ── the upper chapel's furnishings: the tribune of the relics, the altar, the apostles ─
add({ t: 'block', rect: [29.4, -1.9, 31.6, 1.9], y0: UP, y1: UP + 2.6, mat: 'limestone' });
for (const [x, z] of [[29.5, -1.8], [31.5, -1.8], [29.5, 1.8], [31.5, 1.8]]) add({ t: 'column', at: [x, z], y: UP + 2.6, h: 3.2, d: 0.18, shaftMat: 'gold' });
add({ t: 'gable_roof', x0: 29.2, x1: 31.8, z0: -2.1, z1: 2.1, y: UP + 5.8, ridge: UP + 7.4, mat: 'gold' });
add({ t: 'block', rect: [30.0, -0.9, 31.0, 0.9], y0: UP + 2.6, y1: UP + 3.5, mat: 'gold', collide: false });
add({ t: 'block', rect: [26.4, -1.2, 27.6, 1.2], y0: UP, y1: UP + 1.05, mat: 'marble_smooth' });
{
  const piers = [];
  for (let k = 1; k <= NB; k++) for (const sz of [-1, 1]) piers.push([k * BAY, sz * (HW - 0.35)]);
  for (let k = 1; k < APSE.sides; k += 1.0) piers.push(apsePt(k, RAP - 0.35));
  for (const [x, z] of piers.slice(0, 12)) add({ t: 'statue_el', at: [x, z], y: UP + 3.6, h: 1.85, robe: 'paint_robe' });
}

// ── the palace: two towers by the water ─────────────────────────────────────
add({ t: 'sc_keep', at: [8, 38], y: 0, r: 4.2, h: 22, roof: 11, roofMat: 'slate' });
add({ t: 'sc_keep', at: [30, 40], y: 0, r: 4.6, h: 24, roof: 12, roofMat: 'slate' });

// ── rooms and walks ──────────────────────────────────────────────────────────
// sealed: its openings glazed or small, the town outside not drawn from within (src/engine/world.js seal)
const room = (id, rect, y, kind, sealed) => ({ id, rect, y, kind, ...(sealed ? { sealed } : {}) });
const rooms = [
  room('courtyard', [-35, 10, -10, 30], 0, 'open'),
  room('lower-chapel', [4, -2, 24, 2], 0.15, 'hall'),
  room('upper-porch', [-4, -4, -1.2, 4], UP, 'open'),
  room('kings-gallery', [-4.4, -32, -1.4, -11], UP, 'hall'),
  room('upper-chapel', [4, -3, 26, 3], UP, 'hall', true),
];
const walks = [
  // from the courtyard into the lower chapel and along it
  [[-30, 0], [-12, 0], [-6, 0], [-2.5, 0], [1.5, 0], [10, 0], [24, 0], [30, 0]],
  // up the stair to the upper porch and into the upper chapel, round to the apse (straight along the landing past the stair parapet's end post before turning in, not across its corner)
  [[-22, -8.6], [-18.5, -8.6], [-4.8, -8.6], [-3.2, -8.6], [-2.6, -7.2], [-2.6, 0], [1.5, 0], [12, 0], [12, -3.6], [24, -3.6], [24, 3.6], [12, 3.6], [12, 0]],
  // up the stair and along the king's gallery
  [[-22, -8.6], [-18.5, -8.6], [-4.8, -8.6], [-2.9, -8.6], [-2.9, -12], [-2.9, -32]],
];
walks[0].y0 = 0; walks[1].y0 = 0; walks[2].y0 = 0;

export const sainteChapelle = {
  id: 'sainte-chapelle',
  name: { en: 'The Sainte-Chapelle, Paris', zh: '巴黎圣礼拜堂' },
  era: { en: 'Rayonnant Gothic, 1242–1248', zh: '辐射式哥特，1242—1248年' },
  style: 'gothic-chapelle',
  district: 'francia',
  ...SITES['sainte-chapelle'],
  entrance: { at: [-34, 0], facing: 'e' },
  bounds: [-40, -36, 52, 46],
  bakeBounds: [-20, -12, 38, 12],
  bakeTop: 44,
  bakeSpacing: 1.0,
  elements: E,
  rooms,
  walks,
};

export default sainteChapelle;
