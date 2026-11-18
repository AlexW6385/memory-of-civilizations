// The fine sculpture of the Great Temple, shown by the visitor's distance (docs/settlements/abu-simbel.md §17): plans shown within `near` metres of their
// centre, which the viewer batches per material (src/engine/merge.js). The figures themselves (Osiride pillars, gods, Ra-Horakhty, the royal family) stand
// in the temple's own plan in their volumes; here are
//   their fine additions (painted eyes and brows, bands of the nemes, pleats, beads, fingers) within 15 m,
//   the captives of the colossi's thrones within 30 m (the arrival is 43 m from the façade, so the façade's plans are not built there),
//   the Battle of Kadesh within 40 m of the middle of its wall.
import { FX, RADIUS } from './layout.js';
import { greatRooms, HALL1, GREAT_FACADE, FLOOR } from '../../styles/ramesside/dims.js';

const base = (id, elements, o = {}) => ({ id, style: 'ramesside', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [FX + 44, 0], facing: 'w' }, nocollide: true, ...o });
const EAST = -Math.PI / 2;

export function sculptPlans() {
  const out = [], X = (d) => FX - d, R = greatRooms(), y1 = R[1].y0, G = GREAT_FACADE, X0 = FX + 1.0;
  // the Osiride pillars' fine additions, one plan to a statue
  HALL1.pillars.forEach((d, i) => {
    for (const s of [-1, 1]) out.push(base(`abu-simbel-osiride-${i}${s > 0 ? 's' : 'n'}`, [{ t: 'ab_fig', kind: 'osiride', fine: true, at: [X(d), s * HALL1.statueZ], y: y1, yaw: s > 0 ? 0 : Math.PI, crown: s > 0 ? 'white' : 'double' }], { near: 15, center: [X(d), s * HALL1.statueZ] }));
  });
  // the four gods of the sanctuary
  { const xb = X(61.7) + 0.3, y = R[7].y0;
    out.push(base('abu-simbel-gods-fine', [['ra', 1.5], ['ramesses', 0.5], ['amun', -0.5], ['ptah', -1.5]].map(([g, z]) => ({ t: 'ab_fig', kind: 'god', god: g, fine: true, at: [xb, z], y, yaw: EAST })), { near: 15, center: [xb, 0] })); }
  // Ra-Horakhty of the niche
  { const nb = FX - 2.3;
    out.push(base('abu-simbel-ra-fine', [{ t: 'ab_fig', kind: 'ra', fine: true, at: [nb + 0.4, 0], y: 9.4, yaw: EAST }], { near: 14, center: [nb + 0.4, 0] })); }
  // the royal family at the colossi's feet: fine additions; the captives of the thrones' bases
  const outer = (zc) => Math.abs(zc) > 10, kinds = ['queen', 'prince', 'princess'];
  G.colossi.forEach((zc, i) => {
    const el = [];
    [[-3.12, -3.2], [3.12, -3.2], [0, -5.0]].forEach(([lx, lz], k) => {
      const kind = outer(zc) ? (k < 2 ? 'queen' : 'princess') : (k < 2 ? kinds[1 + ((i + k) % 2)] : 'princess');
      el.push({ t: 'ab_fig', kind: 'royal', who: kind, fine: true, at: [X0 - lz, zc + lx], y: 0.5, yaw: EAST, k: kind === 'queen' ? 1 : kind === 'princess' ? 0.86 : 0.8 });
    });
    out.push(base(`abu-simbel-royal-fine-${i}`, el, { near: 14, center: [X0 + 4, zc] }));
    out.push(base(`abu-simbel-captives-${i}`, [{ t: 'ab_captives', x0: X0, zc, y: 0.62 }], { near: 30, center: [X0 + 1, zc] }));
  });
  // the Battle of Kadesh
  out.push(base('abu-simbel-kadesh', [{ t: 'ab_kadesh', x: X(8.3), y: y1, z: -8.35, v0: 3.35, W: 17.4, H: 5.35 }], { near: 40, center: [X(17), -8.35] }));
  void FLOOR;
  return out;
}
