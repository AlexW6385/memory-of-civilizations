// Paris in 1248 (docs/settlements/paris.md §2–§4): the Sainte-Chapelle (the full building of the
// previous design, src/buildings/sainte-chapelle) in the palace court; the palace's great hall and
// towers; Notre-Dame and its parvis; the bridges; the river.

import { RADIUS, CHAPEL, CATHEDRAL, PALACE, BRIDGES, NORTH_ARM, SOUTH_ARM, ISLAND, RIVER } from './layout.js';
import chapelPlan from '../../buildings/sainte-chapelle/plan.js';

const g = RIVER.ground;
export const city = {
  id: 'paris-cite', style: 'gothic', origin: [0, 0], base: 0, yaw: 0, feature: true,
  entrance: { at: [0, -60], facing: 'w' }, bounds: [PALACE[0] - 2, PALACE[1] - 2, CATHEDRAL[2] + 22, PALACE[3] + 2], rooms: [],
  elements: [
    { t: 'notre_dame', rect: CATHEDRAL, y: g },
    { t: 'great_hall', rect: [-290, -88, -230, -58], h: 16, y: g },
    { t: 'great_hall', rect: [-150, -60, -118, 40], h: 12, y: g },
    { t: 'tower', at: [-300, -85], r: 5, h: 22, roof: 10, y: g }, { t: 'tower', at: [-260, -92], r: 6, h: 24, roof: 11, y: g }, { t: 'tower', at: [-215, -92], r: 6, h: 24, roof: 11, y: g },
    { t: 'tower', at: [-120, -88], r: 5, h: 26, roof: 12, y: g },
  ],
};
// the bridges (docs/settlements/paris.md §2a): stone, on round arches with cutwaters, lined with houses;
// mills hung on the Grand Pont's downstream face. The houses are timber houses (style vernacular) on the deck's strips.
const PONTS = [
  { name: 'grand', b: BRIDGES[0], n: 7, mills: [-148, -130.7] },
  { name: 'petit', b: BRIDGES[1], n: 5, mills: [] },
];
const DECK = g + 0.4, BW = 9, STREET = 6;
export const bridges = PONTS.map(({ name, b, n, mills }) => {
  const z0 = b.arm[1] - 4, z1 = b.arm[3] + 4;
  const els = [{ t: 'pont', rect: [b.x - BW, z0, b.x + BW, z1], y: DECK, bed: RIVER.bed, water: RIVER.level, n, abut: 5, street: STREET }];
  for (const zm of mills) els.push({ t: 'mill_pendant', at: [b.x - BW, zm], dir: -1, w: 5.5, y: DECK, water: RIVER.level, bed: RIVER.bed });
  return { id: `paris-pont-${name}`, style: 'gothic', origin: [0, 0], base: 0, yaw: 0, feature: true, entrance: { at: [b.x, (z0 + z1) / 2], facing: 'n' }, bounds: [b.x - BW - 8, z0, b.x + BW + 8, z1], rooms: [], elements: els };
});
/** The houses on the bridges: narrow lots along both sides of the street, their fronts to it, none where a mill stands. */
export function bridgeHouses() {
  let seed = 1250;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const els = [];
  for (const { b, mills } of PONTS) {
    const za = b.arm[1] + 2, zb = b.arm[3] - 2;
    for (const side of [-1, 1]) for (let z = za; z < zb - 4;) {
      const w = 5 + rnd() * 2, zc = z + w / 2;
      if (side < 0 && mills.some((m) => zc > m - 3.8 && zc < m + 6.8)) { z += 1; continue; }
      const xo = side < 0 ? b.x - BW : b.x + STREET / 2, rect = [xo, z, xo + (BW - STREET / 2), Math.min(z + w, zb) - 0.2];
      els.push({ t: 'house_timber', rect, y: DECK, foot: DECK, seed: Math.floor(rnd() * 1e6), front: side < 0 ? 'e' : 'w', storeys: 3 + (rnd() < 0.4 ? 1 : 0) });
      z += w;
    }
  }
  return { id: 'paris-bridge-houses', style: 'vernacular', origin: [0, 0], base: 0, yaw: 0, feature: true, entrance: { at: [0, -135], facing: 'n' }, bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], rooms: [], elements: els };
}
// boats on the Seine: moored along the Right Bank's strand upstream of the Grand Pont (the port of the Grève),
// a few under way, two at the Left Bank
export const boats = {
  id: 'paris-boats', style: 'gothic', origin: [0, 0], base: 0, yaw: 0, feature: true, entrance: { at: [0, -135], facing: 'n' }, bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], rooms: [],
  elements: [
    [40, -159.5, 0, 13, 'casks'], [56, -160, 0.05, 11, 'wood'], [72, -159.5, -0.04, 12, 'sacks'], [88, -160.2, 0, 13, 'casks'], [104, -159.6, 0.03, 10, ''],
    [150, -158.5, 0.1, 12, 'wood'], [60, -132, 0.12, 12, 'sacks'], [-70, -140, -0.08, 11, 'casks'], [40, 145.5, 0, 11, 'wood'], [-40, 145.8, 0.04, 10, ''],
  ].map(([x, z, yaw, len, load]) => ({ t: 'boat_seine', at: [x, z], yaw, len, load, water: RIVER.level })),
};
// the Seine's two arms
export const river = {
  id: 'paris-seine', style: 'ming', origin: [0, 0], base: 0, yaw: 0, feature: true,
  entrance: { at: [0, -60], facing: 'w' }, bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], rooms: [],
  elements: [NORTH_ARM, SOUTH_ARM].map((a) => ({ t: 'water_rect', rect: [-(RADIUS - 72), a[1] + 2, RADIUS - 72, a[3] - 2], y: RIVER.level })),
};
void ISLAND;
export const chapel = { ...chapelPlan, origin: CHAPEL.origin, base: g, district: undefined, view: [CHAPEL.origin[0] - 20, CHAPEL.origin[1] - 12, CHAPEL.origin[0] + 38, CHAPEL.origin[1] + 12] };
export default chapel;
