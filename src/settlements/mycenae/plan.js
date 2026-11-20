// The citadel of Mycenae as the landmark (docs/settlements/mycenae.md §4.1–§4.4): the Cyclopean circuit, the Lion Gate with its bastion and approach court,
// the north gate, Grave Circle A, the granary, the palace round its Great Court on the summit and the megaron with its hall (the enterable interior).

import { walkRoutes } from './walkroutes.js';
import { lotPoint } from './layout.js';
import { CIRCUIT, GATE_Y, PAL_Y, LION, BASTION, STUB, GCA, GRANARY, PALACE, TH, approachY, yIn, wallRuns, NORTH_GATE, RAMP, terrain } from './layout.js';

const E = [];
const { runs, gate } = wallRuns();
runs.forEach((r, i) => E.push({ t: 'wall_run', a: r.a, b: r.b, th: TH, y0: r.y0, y1: r.y1, yi: r.yi, ashlar: r.ashlar, seed: 100 + i, ext: 1.7 }));
E.push({ t: 'north_gate', at: gate.at, u: gate.u, n: gate.n, w: NORTH_GATE.w, h: NORTH_GATE.h, th: TH, y: gate.y, y0: gate.y0, y1: gate.y1, yi: gate.y, seed: 900 });
// the Lion Gate, the bastion on the right and the end of the main wall on the left, the court between them
E.push({ t: 'lion_gate', x: LION.x - TH / 2, z: 0, y: GATE_Y, w: LION.w, h: LION.h, th: TH, y1: GATE_Y + 8.6, seed: 5, zExt: 11 });
E.push({ t: 'wall_run', a: [BASTION[0], (BASTION[1] + BASTION[3]) / 2], b: [BASTION[2], (BASTION[1] + BASTION[3]) / 2], th: BASTION[3] - BASTION[1], y0: approachY(BASTION[0]) - 1.2, y1: GATE_Y + 6.2, yi: approachY(BASTION[0]) - 1.2, ashlar: true, seed: 31, ext: 0, caps: [true, false] });
E.push({ t: 'wall_run', a: [STUB[0], (STUB[1] + STUB[3]) / 2], b: [STUB[2], (STUB[1] + STUB[3]) / 2], th: STUB[3] - STUB[1], y0: approachY(STUB[0]) - 1.2, y1: GATE_Y + 7.0, yi: approachY(STUB[0]) - 1.2, ashlar: true, seed: 32, ext: 0, caps: [true, false] });
// the paved court between the stub and the bastion, and the stepped road up past Grave Circle A to the palace: the centre lines sampled a metre apart on the ground
const along = (P, x0, x1) => { const out = []; let acc = 0; for (let i = 0; i + 1 < P.length; i++) { const L = Math.hypot(P[i + 1][0] - P[i][0], P[i + 1][1] - P[i][1]), ux = (P[i + 1][0] - P[i][0]) / L, uz = (P[i + 1][1] - P[i][1]) / L; for (let s = 0; s < L; s += 1.3) { const x = P[i][0] + (P[i + 1][0] - P[i][0]) * s / L, z = P[i][1] + (P[i + 1][1] - P[i][1]) * s / L; if (x >= x0 && x <= x1) out.push([Math.round(x * 100) / 100, Math.round(z * 100) / 100, Math.round(Math.max(...[-2.3, -1.15, 0, 1.15, 2.3].map((v) => terrain(x - uz * v, z + ux * v))) * 100) / 100]); } acc += L; } void acc; return out; };
E.push({ t: 'ramp', pts: along([[-107, 0], [-92, 0]], -107, -92).map(([x, z]) => [x, z, approachY(x)]), w: 6.6, kerb: false, seed: 41 });
E.push({ t: 'ramp', pts: along(RAMP, -85, 22), w: 4.6, kerb: true, seed: 42 });
// the passage's floor inside the gate
E.push({ t: 'floor', rect: [-86, -1.55, -82, 1.55], y: GATE_Y, th: 0.4, mat: 'flagstone' });
E.push({ t: 'granary', rect: GRANARY, y: GATE_Y + 0.1, face: 'n', seed: 7, du: 5, dw: 2.2, dh: 2.45 });
E.push({ t: 'grave_circle', c: [GCA.x, GCA.z], r: GCA.r, y: GCA.y, entrance: Math.atan2(0 - GCA.z, LION.x - GCA.x), seed: 9 });

// ── the palace ──
const [cx0, cz0, cx1, cz1] = PALACE.court, M = PALACE.megaron, PY = PAL_Y;
E.push({ t: 'court', rect: PALACE.court, y: PY, altar: [43.5, 3] });
// the court's west wall with the propylon's door; the wings round the court
E.push({ t: 'wall', a: [29.6, -28], b: [29.6, 30], th: 0.8, y0: PY - 0.3, y1: PY + 4.4, mat: 'lime_plaster', openings: [{ at: 31, w: 2.6, h: 3.4 }] });
E.push({ t: 'propylon', rect: PALACE.propylon, y: PY });
// the wings are houses of the palace you can enter from the Great Court: the magazines of oil and wine with the archive above, the suites with a workshop, a bath and a loft
let wing = (rect, face, du, kind, o = {}) => E.push({ t: 'house', rect, face, du, kind, y: PY, gd: PY, storeys: 2, sh: 3.3, dw: 2.2, dh: 2.9, lit: true, ...o });
const wings = [];
const wing0 = wing;
wing = (rect, face, du, kind, o = {}) => { wings.push({ rect, face, du }); wing0(rect, face, du, kind, o); };
wing([30, 16, 56, 30], 'n', 11, 'magazine', { seed: 2 });
wing([30, -28, 56, -10], 's', 11, 'suite', { seed: 1, trade: 'ivory' });
wing([56, -28, 84, M.z0], 'w', -6 - -28, 'magazine', { seed: 3 });
wing([56, M.z1, 84, 30], 'w', 12.5 - M.z1, 'suite', { seed: 4, trade: 'perfume' });
E.push({ t: 'palace_wing', rect: [M.x1, M.z0, 84, M.z1], y: PY, h: 6.6, faces: 'e', seed: 5 });
// the megaron's walls: the sides, the back, the porch's back wall and the hall's front wall with their doors
const wy0 = PY - 0.4, wy1 = PY + 6.0, th = M.th, wall = (a, b, o) => E.push({ t: 'wall', a, b, th, y0: wy0, y1: wy1, mat: 'lime_plaster', ...o });
wall([M.x0, M.z0 + th / 2], [M.x1, M.z0 + th / 2]);
wall([M.x0, M.z1 - th / 2], [M.x1, M.z1 - th / 2]);
wall([M.x1 - th / 2, M.z0], [M.x1 - th / 2, M.z1]);
const xP = M.x0 + 6.4, xH = xP + 0.9 + 3.7 + 0.9;
wall([xP + th / 2, M.z0], [xP + th / 2, M.z1], { openings: [{ at: M.ax - M.z0, w: 2.6, h: 3.5 }] });
wall([xH - th / 2, M.z0], [xH - th / 2, M.z1], { openings: [{ at: M.ax - M.z0, w: 2.6, h: 3.5 }] });
E.push({ t: 'megaron', ...M, y: PY, seed: 3 });
// the way up to the propylon: three steps of limestone across the last of the ramp
E.push({ t: 'stair', rect: [18, 0.5, 24, 5.5], dir: 'e', y0: yIn(18) + 0.2, y1: PY, riser: 0.2, base: yIn(18) - 1, mat: 'limestone_yellow' });

// ── by night (docs §16.2; nightlight.js): torches on the faces of the approach court, braziers in the Great Court and at the ramp, torches in the megaron's porch, the drovers' fire at the halt, lamps at the stalls ──
const NIGHT = [
  ...[-103.5, -97.5].map((x) => ({ t: 'my_torch', at: [x, STUB[3] + 0.0], y: approachY(x), mount: [0, 1] })),
  ...[-104.5, -98.5].map((x) => ({ t: 'my_torch', at: [x, BASTION[1] - 0.0], y: approachY(x), mount: [0, -1] })),
  { t: 'my_brazier', at: [-72.5, 0.6], y: terrain(-72.5, 0.6) },
  ...[[34, -6.2], [34, 12], [52.5, -6.2], [52.5, 11.6]].map(([x, z]) => ({ t: 'my_brazier', at: [x, z], y: PAL_Y })),
  ...[-1.0, 7.0].map((z) => ({ t: 'my_torch', at: [58.0, z], y: PAL_Y })),
  { t: 'my_fire', at: [-124.5, -5.4], y: terrain(-124.5, -5.4) },
  { t: 'my_lamp', at: [-129.0, 3.0], y: terrain(-129.0, 3.0) }, { t: 'my_lamp', at: [-120.3, 3.0], y: terrain(-120.3, 3.0) },
];
E.push(...NIGHT);

const room = (id, rect, y, kind, extra = {}) => ({ id, rect, y, kind, ...extra });
const wr = (id, r) => room(id, [r[0] + 0.5, r[1] + 0.5, r[2] - 0.5, r[3] - 0.5], PAL_Y, 'inner');
const rooms = [
  room('the Lion Gate', [-91, -1.5, -87, 1.5], GATE_Y, 'open'),
  room('the great court', [32, -9, 55, 15], PY, 'open'),
  room('the propylon', [25, 1.3, 28.8, 4.7], PY, 'open'),
  room('the porch', [M.x0 + 1.5, M.z0 + 1.2, xP - 0.2, M.z1 - 1.2], PY, 'hall'),
  room('the vestibule', [xP + 1.2, M.z0 + 1.2, xP + 4.6, M.z1 - 1.2], PY, 'hall'),
  room('the megaron', [xH + 1, M.z0 + 1.5, M.x1 - 1.8, M.z1 - 1.5], PY, 'hall'),
  wr('the south magazines', [30, 16, 56, 30]), wr('the north suite', [30, -28, 56, -10]), wr('the oil magazines', [56, -28, 84, M.z0]), wr('the perfume suite', [56, M.z1, 84, 30]),
  room('grave circle A', [GCA.x - 8, GCA.z - 8, GCA.x + 8, GCA.z + 8], GCA.y + 0.03, 'open'),
];
const walks = [[[-150, 0], [-107, 0], [-89, 0], [-80, -2], [-60, -6], [-30, -8], [-10, -4], [8, 0], [27, 3], [45, 3], [58, 3], [64, 3], [75, 3]]];
walks[0].y0 = approachY(-150);
for (const r of walkRoutes()) { const w = r.route; w.y0 = r.y0; walks.push(w); }
// into the four wings of the palace by their doors on the Great Court: the magazines and the suites
for (const { rect, face, du } of wings) {
  const P = (u, v) => lotPoint({ rect, face }, u, v), w = [P(du, -2.4), P(du, 0.3), P(du, 1.2), P(du, 1.9)];
  w.y0 = PAL_Y - 0.2; walks.push(w);
}
void CIRCUIT; void cx0; void cz0; void cx1; void cz1;

export const citadel = {
  id: 'mycenae-citadel',
  name: { en: 'The Citadel of Mycenae', zh: '迈锡尼卫城' },
  era: { en: 'Late Helladic IIIB, c. 1250 BC', zh: '后期希拉迪克IIIB期，约公元前1250年' },
  style: 'mycenaean',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [-107, 0], facing: 'e' },
  bounds: [-112, -62, 126, 66],
  view: [-107, -52, 120, 58],
  bakeTop: 40,
  elements: E,
  rooms,
  walks,
};
export default citadel;
