// Conques about 1120 (docs/settlements/conques.md §2–§4): the abbey church of Sainte-Foy (the full
// building of the previous design, src/buildings/sainte-foy-conques) on its terrace; the terrace's
// retaining wall; the bridge over the Dourdou; the river.

import { RADIUS, ABBEY, RIVER, BRIDGE, height } from './layout.js';
import foyPlan from '../../buildings/sainte-foy-conques/plan.js';

const [tx0, tz0, tx1, tz1] = ABBEY.terrace;
export const terrace = {
  id: 'conques-terrace', style: 'romanesque', origin: [0, 0], base: 0, yaw: 0, feature: true,
  entrance: { at: [ABBEY.origin[0] - 20, 0], facing: 'e' }, bounds: [tx0 - 2, tz0 - 2, tx1 + 2, tz1 + 8], rooms: [],
  elements: [{ t: 'block', rect: [tx0, tz1, tx1, tz1 + 2], y0: height(0, tz1 + 14) - 1, y1: 1.1, mat: 'schist_rubble' }],
};
const rz = RIVER.z + 14 * Math.sin(BRIDGE.x / 90);
// the bridge over the Dourdou (§1b): five round arches of 2.0, 3.8, 6.5, 10.3 and 6.6 m, the great one over the
// stream; the deck humped over it, meeting the banks at their own height (local x runs south across the river)
const PONT = { x0: -19, spans: [{ w: 2.0, pier: 2.0 }, { w: 3.8, pier: 2.2 }, { w: 6.5, pier: 2.4 }, { w: 10.3, pier: 2.4 }, { w: 6.6 }] };
const bankY = (lx) => height(BRIDGE.x, rz + lx);
export const bridge = {
  id: 'conques-bridge', style: 'romanesque', origin: [BRIDGE.x, rz], base: 0, yaw: 90, feature: true,
  entrance: { at: [0, 0], facing: 'n' }, bounds: [-24, -4, 24, 4], rooms: [],
  elements: [{ t: 'pont', ...PONT, y0: bankY(PONT.x0 - 1.5), y1: bankY(20.7), peak: [5.05, Math.max(RIVER.level + 0.4 + 5.15 + 0.7, bankY(PONT.x0 - 1.5), bankY(20.7)) + 0.5], bed: RIVER.bed - 1, w: 3.1 }],
};
export const river = {
  id: 'conques-river', style: 'ming', origin: [0, 0], base: 0, yaw: 0, feature: true,
  entrance: { at: [0, 0], facing: 'n' }, bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], rooms: [],
  elements: [{ t: 'water_cells', rect: [-(RADIUS - 95), RIVER.z - 30, RADIUS - 95, RIVER.z + 30], y: RIVER.level, cell: 1.5, inside: (x, z) => Math.abs(z - (RIVER.z + 14 * Math.sin(x / 90))) < RIVER.w / 2 - 1 && Math.hypot(x, z) < RADIUS - 95 }],
};
export const abbey = { ...foyPlan, origin: ABBEY.origin, base: 0, district: undefined, view: [ABBEY.origin[0] - 2, -18, ABBEY.origin[0] + 54, 30] };
export default abbey;
