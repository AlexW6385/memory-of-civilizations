// The sculpture of the axis in levels of detail by the visitor's distance (docs/settlements/thebes.md §14): plans shown near (`near`) or far (`far`) of their
// centre, which the viewer batches per material (src/engine/merge.js), so a level costs no draws of its own where a tile of the town already has the material.
//   the ram sphinxes: the first form beyond 40 m; the modelled animal within 40 m; its fine detail (eye, toes, beads, signs) within 16 m;
//   the colossi of the second pylon: modelled always, their face, fingers and the princess's face within 28 m;
//   the pylons' sunk reliefs at one fineness; the hall's columns' painted reliefs within 34 m (beyond, the column's own flat figures).
// (A level that replaces another needs its own materials in the batch of its own: the rams' first form is the only one kept, as it brings few.)
import { AVENUE, RADIUS, PYLON2, PYLON3, HALL, sphinxes } from './layout.js';

const base = (id, elements, o = {}) => ({ id, style: 'newkingdom', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-200, 0], facing: 'e' }, ...o });
const NEAR_RAM = 40, FINE_RAM = 16;

/** The plans of the ram sphinxes: for each slot of the avenue (its two rams) the three levels. */
export function ramPlans() {
  const slots = new Map();
  for (const s of sphinxes()) { const k = s.x.toFixed(2); if (!slots.has(k)) slots.set(k, []); slots.get(k).push(s); }
  const out = [];
  for (const [k, list] of slots) {
    const x = list[0].x, c = [x, 0], el = (t, extra = {}) => list.map((s) => ({ t, at: [s.x, s.z], y: 0.02, yaw: s.side > 0 ? Math.PI : 0, ...extra }));
    out.push(base(`thebes-ram-far-${k}`, el('nk_ram', { planter: false }), { far: NEAR_RAM, center: c, nocollide: true }));
    out.push(base(`thebes-ram-mid-${k}`, el('nk_ram_a'), { near: NEAR_RAM, center: c }));
    out.push(base(`thebes-ram-fine-${k}`, el('nk_ram_b'), { near: FINE_RAM, center: c, nocollide: true }));
  }
  return out;
}
export const planters = () => sphinxes().map((s) => ({ t: 'nk_planter', at: [s.x + 3.45, s.z], y: 0.02, seed: Math.round(s.x * 3 + s.z) }));

/** The standing colossi of the second pylon (the plan's local frame, turned 90°: world x = −lz, z = lx): modelled, and within 28 m their face, fingers and the princess's face. */
export function colossusPlans() {
  const lz = -PYLON2.x0 + 3.4, g = 5, ds = [-1, 1].map((s) => s * (g + 5.5)), c = [PYLON2.x0 - 3.4, 0], o = { yaw: 90, center: c };
  const el = (sculpt) => ds.map((lx) => ({ t: 'nk_colossus', at: [lx, lz], y: 0, yaw: 0, h: 11, sculpt }));
  return [base('thebes-colossi', el('mid'), o), base('thebes-colossi-fine', el('fine'), { ...o, near: 28, nocollide: true })];
}

/** The sunk reliefs of a pylon's front (the plan's local frame). */
export function pylonReliefPlans(name, p, half, g, h, flags, res = 1) {
  const b = Math.min(3, h * 0.08), zf = -p.x0, els = [-1, 1].map((s) => {
    const tw = half - g, niches = flags ? [0.28, 0.72].map((f) => s * (g + tw * f)).sort((a, c) => a - c) : [];
    const x0 = s < 0 ? -half + b + 1 : g + 1, x1 = s < 0 ? -g - 1 : half - b - 1;
    return { t: 'nk_pylon_relief', x0, x1, z: zf, h, b, y0: 0, dirIn: -s, niches, res };
  });
  return [base(`thebes-${name}-reliefs`, els, { yaw: 90, center: [p.x0, 0], nocollide: true })];
}

/** The painted reliefs of the hall's columns, in tiles of about 20 m (the plan's local frame). */
export function columnPlans() {
  const zB = -HALL.x0, NV = 5.6, navZ = Array.from({ length: 6 }, (_, k) => zB - 4.4 - 8.8 * k), aisleZ = Array.from({ length: 9 }, (_, k) => zB - 3.7 - 5.7 * k), rows = [12.0, 18.2, 24.4, 30.6, 36.8, 43.0, 49.2];
  const cols = [];
  for (const s of [-1, 1]) for (const z of navZ) cols.push({ t: 'nk_column_art', at: [s * NV, z], h: 21, d: 3.57, cap: 'open', cell: 0.13 });
  rows.forEach((lx, i) => { for (const s of [-1, 1]) for (let k = 0; k < 9; k++) { if (i === 0 && (k === 0 || k === 8)) continue; cols.push({ t: 'nk_column_art', at: [s * lx, aisleZ[k]], h: 14, d: 2.74, cap: 'bud', cell: 0.1 }); } });
  const tiles = new Map();
  for (const e of cols) { const k = `${Math.floor(e.at[0] / 20)},${Math.floor(e.at[1] / 20)}`; if (!tiles.has(k)) tiles.set(k, []); tiles.get(k).push(e); }
  return [...tiles].map(([k, list]) => {
    const cx = list.reduce((a, e) => a + e.at[0], 0) / list.length, cz = list.reduce((a, e) => a + e.at[1], 0) / list.length;
    return base(`thebes-hall-art-${k}`, list, { yaw: 90, near: 34, center: [-cz, cx], nocollide: true });
  });
}
void AVENUE; void PYLON3;
