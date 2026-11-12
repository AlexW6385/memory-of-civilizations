// The pā (docs/settlements/maori.md §2–§4): palisades round the summit and along each terrace's
// edge, with gateways where the path climbs through; fighting stages at the palisades; the
// chief's carved house and pātaka on the summit; the outer palisade beyond the ditch.

import { HILL, PATH, village, height } from './layout.js';

const E = [], [hx, hz] = HILL.c;
/** A ring of palisade at radius r on height y, with a gap (and a gateway) where the path crosses. */
function ring(r, y, h, gate = true) {
  const n = Math.max(12, Math.round(r * Math.PI * 2 / 8)), gap = (PATH.w / 2 + 1.4) / r;
  for (let i = 0; i < n; i++) {
    let a0 = i / n * Math.PI * 2, a1 = (i + 1) / n * Math.PI * 2;
    const south = Math.PI / 2;                                   // the path leaves toward +z
    if (Math.abs(((a0 + a1) / 2 - south + Math.PI * 3) % (Math.PI * 2) - Math.PI) < gap + Math.PI / n) {
      if (a0 < south - gap && a1 > south - gap) a1 = south - gap; else if (a0 < south + gap && a1 > south + gap) a0 = south + gap; else continue;
    }
    E.push({ t: 'palisade', a: [hx + Math.cos(a0) * r, hz + Math.sin(a0) * r], b: [hx + Math.cos(a1) * r, hz + Math.sin(a1) * r], y, h, center: [hx, hz] });
    if (i % 7 === 3) E.push({ t: 'stage', c: [hx + Math.cos((a0 + a1) / 2) * (r - 2.5), hz + Math.sin((a0 + a1) / 2) * (r - 2.5)], y, h: h + 1.5 });
  }
  if (gate) E.push({ t: 'waharoa', c: [hx, hz + r], yaw: Math.PI, y: Math.max(y, height(PATH.x, hz + r) - 0.15), h: 4.4 });   // the gate stands on the path's ramp, which climbs through the terrace's edge
}
ring(HILL.tihi - 1.5, HILL.top, 3.6);
for (const [, r1, y] of HILL.rings) ring(r1 - 2, y, 3.8);
ring(HILL.ditch + 5, 0, 4.2);
// the chief's house and pātaka on the summit
const v = village();
E.push({ t: 'whare', ...v.houses[0] });
E.push({ t: 'pataka', ...v.pataka[0] });

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const H0 = v.houses[0];
// the chief's house is a hall (the voices indoors, reverberant); the summit and the terraces open air
const rooms = [
  room('chief-house', [H0.c[0] - H0.w / 2 + 0.2, H0.c[1] - H0.l / 2 + 0.3, H0.c[0] + H0.w / 2 - 0.2, H0.c[1] + H0.l / 2 - 1.8], HILL.top, 'hall'),
  room('tihi', [hx - 20, hz - 20, hx + 20, hz + 20], HILL.top, 'open'),
];
const walks = [[[0, 170], [0, hz + HILL.ditch + 10], [0, hz + 60], [0, hz + HILL.tihi - 4]]];
walks[0].y0 = 0;

export const pa = {
  id: 'maori-pa',
  name: { en: 'A pā by Lake Rotorua', zh: '罗托鲁瓦湖畔的毛利堡寨' },
  era: { en: 'Aotearoa, later 18th century', zh: '奥特亚罗瓦，18世纪后期' },
  style: 'maori',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [0, 165], facing: 'n' },
  bounds: [hx - 132, hz - 132, hx + 132, hz + 132],
  view: [hx - 22, hz - 22, hx + 22, hz + 22],
  viewY: HILL.top,
  bakeTop: 52,
  elements: E,
  rooms,
  walks,
};
export default pa;
