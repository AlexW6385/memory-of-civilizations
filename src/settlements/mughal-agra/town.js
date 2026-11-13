// Taj Ganj and the riverside (docs/settlements/mughal-agra.md §6): the town's houses with their balconies.
import { RADIUS, RIVER_Z, STREETS, houses, KATRAS, LODGES, HAVELI_OPEN, WORKSHOP, GWALKS, GW } from './layout.js';
import { lifePlan } from './life.js';
import { frameOf } from '../../styles/mughal/townhouse.js';
import { ground, LEVEL } from './ground.js';
const base = (id, elements) => ({ id, style: 'mughal', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 245], facing: 'n' } });
export async function town() {
  const all = houses(), plans = [];
  for (let i = 0; i < all.length; i += 120) plans.push(base(`mughal-agra-houses-${i / 120}`, all.slice(i, i + 120).map((h) => ({ t: 'haveli', ...h }))));
  // the streets' paved verges: a course of flagstones along each frontage (the middle stays beaten earth), clipped to the town's disc
  { const els = [], R2 = RADIUS - 14, VG = 1.5;
    for (const s of STREETS) {
      const [x0, z0, x1, z1] = s.rect, alongZ = z1 - z0 > x1 - x0, lim = (a, c) => Math.min(a, Math.sqrt(Math.max(0, R2 * R2 - c * c)));
      for (const side of [0, 1]) {
        const c = alongZ ? (side ? x1 - VG / 2 : x0 + VG / 2) : (side ? z1 - VG / 2 : z0 + VG / 2), ext = Math.sqrt(Math.max(0, R2 * R2 - c * c));
        const a0 = Math.max(alongZ ? z0 : x0, -ext), a1 = Math.min(alongZ ? z1 : x1, ext);
        if (a1 - a0 < 3) continue;
        els.push({ t: 'lane', rect: alongZ ? (side ? [x1 - VG, a0, x1, a1] : [x0, a0, x0 + VG, a1]) : (side ? [a0, z1 - VG, a1, z1] : [a0, z0, a1, z0 + VG]), y: 0.02, mat: 'sandstone_floor' });
        void lim;
      }
    }
    plans.push(base('mughal-agra-verges', els)); }
  // the flower beds of the garden's two northern quarters nearest the axes (§13): the sunken beds between the raised walks planted in
  // rows of marigold, rose and jasmine parallel to the channel, a path's width clear at the walks (the beds' trees and shrubs stand among them)
  { const els = [], cols = [[12.15, GWALKS[0] - GW], [GWALKS[0] + GW, GWALKS[1] - GW], [GWALKS[1] + GW, GWALKS[2] - GW]], rows = [[-12.15, -(GWALKS[0] - GW)], [-(GWALKS[0] + GW), -(GWALKS[1] - GW)], [-(GWALKS[1] + GW), -(GWALKS[2] - GW)], [-(GWALKS[2] + GW), -143]];
    const FL = ['cloth_ochre', 'cloth_red', 'cloth_white', 'cloth_ochre', 'cloth_maroon'];
    let n = 0;
    for (const sx of [-1, 1]) for (const [c0, c1] of cols.slice(0, 2)) for (const [r1, r0] of rows) {
      const z0 = Math.min(r0, r1) + 1.6, z1 = Math.max(r0, r1) - 1.6;
      for (let x = c0 + 1.8; x < c1 - 1.8; x += 2.6) {
        const xa = sx < 0 ? -(x + 0.7) : x, xb = sx < 0 ? -x : x + 0.7;
        els.push({ t: 'block', rect: [xa, z0, xb, z1], y0: -0.02, y1: 0.1 + (n % 3) * 0.03, mat: FL[n++ % FL.length], collide: false });
      }
    }
    plans.push(base('mughal-agra-parterres', els)); }
  // the houses' fronts dressed at eye level (instanced pieces of the street life)
  for (let i = 0; i < all.length; i += 140) plans.push({ ...base(`mughal-agra-fronts-${i / 140}`, all.slice(i, i + 140).map((h) => ({ t: 'mughal_front', ...h }))), style: 'life' });
  // the caravanserais and the open house (docs/settlements/mughal-agra.md §11)
  for (const k of KATRAS) { const [x0, z0, x1, z1] = k.rect; plans.push({ ...base(`mughal-agra-katra-${k.id}`, [{ t: 'katra', rect: k.rect, gate: k.gate, lit: 2 }]), bounds: [x0 - 6, z0 - 2, x1 + 6, z1 + 2], rooms: [{ id: 'sarai court', rect: [x0 + 1.6, z0 + 7.5, x1 - 1.6, z1 - 7.5], y: 0, kind: 'open' }] }); }
  { const [x0, z0, x1, z1] = HAVELI_OPEN; plans.push({ ...base('mughal-agra-haveli-open', [{ t: 'haveli_open', rect: HAVELI_OPEN, entry: 'w' }]), bounds: [x0 - 2, z0 - 2, x1 + 2, z1 + 2], rooms: [{ id: 'dalan', rect: [x0 + 3.4, z0 + 0.55, x1 - 3.8, z0 + 4.15], y: 0.45, kind: 'hall' }, { id: 'house court', rect: [x0 + 3.4, z0 + 4.6, x1 - 3.8, z1 - 3.4], y: 0, kind: 'open' }] }); }
  // the garden keepers' lodges (§13b): one plan of eight rooms, each lit and furnished
  plans.push({ ...base('mughal-agra-lodges', LODGES.map((l) => ({ t: 'garden_lodge', ...l }))), bounds: [-95, -150, 95, -10],
    rooms: LODGES.map((l) => { const f = frameOf(l.rect, l.front), r = f.rect([-f.W / 2 + 0.4, -f.D + 0.4, f.W / 2 - 0.4, -1.8]); return { id: `${l.kind} lodge`, rect: r, y: l.y + 0.04, kind: 'hall' }; }) });
  // the inlay workshop, open to the axis street (§12)
  { const [x0, z0, x1, z1] = WORKSHOP.rect;
    plans.push({ ...base('mughal-agra-workshop', [{ t: 'inlay_workshop', ...WORKSHOP, seed: 7 }]), bounds: [x0 - 2, z0 - 2, x1 + 2, z1 + 2], rooms: [{ id: 'inlay workshop', rect: [x0 + 0.4, z0 + 0.4, x1 - 0.4, z1 - 0.4], y: 0.35, kind: 'hall' }] }); }
  // the washermen's bank (§12): flat stones at the water's edge, cloth spread on the sand to dry
  { const els = [];
    for (let k = 0; k < 5; k++) els.push({ t: 'block', rect: [180.2 + k * 9, -254.6, 183.8 + k * 9, -253.8], y0: -0.02, y1: 0.12, mat: 'granite_grey', collide: false });
    const cl = ['cloth_white', 'cloth_red', 'cloth_ochre', 'cloth_indigo', 'cloth_white', 'cloth_green'];
    for (let k = 0; k < 14; k++) els.push({ t: 'block', rect: [178 + (k % 7) * 6.2, -251.4 + Math.floor(k / 7) * 2.6, 178 + (k % 7) * 6.2 + 3.2, -249.8 + Math.floor(k / 7) * 2.6], y0: 0, y1: 0.03, mat: cl[k % 6], collide: false });
    plans.push({ ...base('mughal-agra-dhobi', els), bounds: [172, -258, 228, -246] }); }
  // the Yamuna's water below the terrace, out to where its bed comes up by the disc's edge
  plans.push({ ...base('mughal-agra-yamuna', [{ t: 'water_cells', rect: [-RADIUS, -RADIUS, RADIUS, 0], y: LEVEL.water, cell: 2, inside: (x, z) => z < RIVER_Z + 8 && ground.height(x, z) < LEVEL.water }]), style: 'ming' });
  return [...plans, lifePlan()];
}
