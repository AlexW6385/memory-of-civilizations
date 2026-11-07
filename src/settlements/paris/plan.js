// Paris in 1248 (docs/settlements/paris.md §2–§4): the Sainte-Chapelle (the full building of the
// previous design, src/buildings/sainte-chapelle) in the palace court; the palace's great hall and
// towers; Notre-Dame and its parvis; the bridges; the river.

import { RADIUS, CHAPEL, CATHEDRAL, PALACE, GARDEN, QUAY, BRIDGES, NORTH_ARM, SOUTH_ARM, ISLAND, RIVER, PARVIS, height, inLot } from './layout.js';
import chapelPlan from '../../buildings/sainte-chapelle/plan.js';

const g = RIVER.ground;
export const city = {
  id: 'paris-cite', style: 'gothic', origin: [0, 0], base: 0, yaw: 0, feature: true,
  entrance: { at: [0, -60], facing: 'w' }, bounds: [PALACE[0] - 2, PALACE[1] - 2, CATHEDRAL[2] + 22, PALACE[3] + 2], rooms: [],
  elements: [
    { t: 'notre_dame', rect: CATHEDRAL, y: g },
    // the palace (docs/settlements/paris.md §1c): the Grand-Salle north-west of the chapel, the king's gallery reaching it from
    // the chapel's upper porch (the chapel's plan); the towers on the Seine; the enclosure on the Barillerie with its gate
    { t: 'palace_hall', rect: [-265, -72, -199, -44], h: 17, floor: 6, y: g, gap: -203 },
    { t: 'palace_tower', at: [-262, -104.5], y: RIVER.bed + 0.5, ground: g, r: 5.0, h: 24.5, roof: 11, face: -Math.PI / 2 },     // Tour Bonbec
    { t: 'palace_tower', at: [-236, -104.5], y: RIVER.bed + 0.5, ground: g, r: 5.3, h: 27.5, roof: 13, face: -Math.PI / 2 },     // Tour César
    { t: 'palace_tower', at: [-222, -104.5], y: RIVER.bed + 0.5, ground: g, r: 5.3, h: 27.5, roof: 13, face: -Math.PI / 2 },     // Tour d'Argent
    { t: 'palace_wall', a: [-112, -100], b: [-112, 58], y: g, h: 8, th: 1.6, gates: [{ at: 100, w: 4 }] },
    { t: 'palace_tower', at: [-112, -6.5], y: g, r: 3.2, h: 14, roof: 7, face: 0 }, { t: 'palace_tower', at: [-112, 6.5], y: g, r: 3.2, h: 14, roof: 7, face: 0 },
    { t: 'palace_tower', at: [-112, 58], y: g, r: 3.0, h: 12, roof: 6.5, face: Math.PI / 4 },
    { t: 'quay', ...QUAY, bed: RIVER.bed - 0.5, water: RIVER.level, stairs: [-250, -180, -140], posts: [-300, -288, -276, -244, -210, -196, -166, -154, -126] },
    // the king's garden: its wall with a door toward the palace, beds of herbs, roses and lilies, the vine arbour, the well
    { t: 'garden_wall', rect: GARDEN, y: g, h: 3.2, gates: [{ side: 'e', at: 30, w: 2.4 }, { side: 'w', at: 30, w: 2.0 }] },
    { t: 'garden_arbour', a: [-298, -10], b: [-273, -10], w: 2.6, h: 2.5, y: g },
    { t: 'garden_well', at: [-288, 20], y: g },
    ...gardenBeds(),
  ],
};
function gardenBeds() {
  const els = [], kinds = ['herbs', 'herbs', 'roses', 'herbs', 'lilies', 'herbs'];
  let i = 0;
  for (const zb of [-34, -30.6, -27.2, -23.8, -20.4, -17, -6, -2.6, 0.8, 4.2, 7.6, 11, 30, 33.4, 36.8, 40.2])
    for (const xb of [-298, -292.4, -286.8, -281.2]) {
      els.push({ t: 'garden_bed', rect: [xb, zb, xb + 4.0, zb + 1.6], y: g, seed: 31 + i * 7, kind: kinds[i++ % kinds.length] });
    }
  return els;
}
// the boats moored at the palace's quay
const quayBoats = [[-314, 0.02, 11, 'casks'], [-300, -0.03, 12, 'wood'], [-286, 0, 10, ''], [-197, 0.04, 12, 'sacks'], [-165, -0.02, 11, 'casks'], [-152, 0, 10, 'wood'], [-124, 0.03, 12, '']];
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
// the life of the streets (docs/settlements/paris.md §2b): the money-changers' and goldsmiths' boards along the Grand Pont,
// each with its man on a stool behind it and a customer or two before it; canons of Notre-Dame by the parvis; a water
// porter; pigs loose on the banks and by the Petit Pont, dogs
function lrng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const faceTo = (from, to) => Math.atan2(-(to[0] - from[0]), -(to[1] - from[1]));
export function streetLife() {
  const rand = lrng(1249), T = [], L = [];
  const CL = ['cloth_brown', 'cloth_grey', 'cloth_red', 'cloth_green', 'cloth_ochre', 'cloth_indigo'], pick = (a) => a[Math.floor(rand() * a.length)];
  const fig = (at, y, rot, o = {}) => L.push({ t: 'figure', at, y, rot, h: 1.58 + rand() * 0.16, seed: Math.floor(rand() * 1e9), dress: rand() < 0.5 ? 'robe' : 'tunic', cloth: pick(CL), cloth2: pick(CL), skin: 'skin_light', hat: pick(['cap', 'none', 'brim', 'cap']), hatMat: pick(['cloth_brown', 'cloth_red', 'cloth_black']), legs: 'hose', feet: 'shod', ...o });
  const gp = PONTS[0].b, deck = DECK;
  for (const [side, zs] of [[-1, [-158, -122, -114]], [1, [-160, -150, -138, -126, -116]]]) for (const z of zs) {
    const x = gp.x + side * 2.0, a = side < 0 ? -Math.PI / 2 : Math.PI / 2, seed = Math.floor(rand() * 1000);
    T.push({ t: 'changer_table', at: [x, z], y: deck, rot: a, seed });
    const back = [x + side * 0.55, z], rot = Math.PI - a;
    L.push({ t: 'bench', at: [back[0] + side * 0.1, z], y: deck, rot, len: 1.0 });
    fig(back, deck, rot, { pose: 'sit', dress: 'robe', hat: 'cap', cloth: pick(['cloth_red', 'cloth_indigo', 'cloth_green', 'cloth_brown']) });
    if (rand() < 0.7) { const at = [x - side * 1.05, z + (rand() - 0.5) * 0.6]; fig(at, deck, faceTo(at, [x, z]), { pose: rand() < 0.5 ? 'talk' : 'stand' }); }
  }
  // canons of Notre-Dame in black copes, talking at the north edge of the parvis by the cloister
  for (const [x, z] of [[132, 43.4], [133.4, 44.1], [118, 43]]) fig([x, z], height(x, z), faceTo([x, z], [132.7, 43.8]) + (x < 125 ? 2 : 0), { dress: 'robe', cloth: 'cloth_black', cloth2: 'cloth_white', hat: 'cap', hatMat: 'cloth_black', pose: 'talk', over: 'cape', legs: undefined });
  // a water porter coming up from the river by the Petit Pont, his yoke and buckets
  { const at = [104, 99]; fig(at, height(...at), Math.PI, { carry: 'pole', dress: 'tunic', cloth: 'cloth_brown', hat: 'cap' }); }
  // pigs rooting loose on the strands and by the bridges' feet (one tripped a king's son's horse on a quay in 1131); dogs
  let n = 0;
  for (let k = 0; k < 400 && n < 12; k++) {
    const x = -260 + rand() * 520, z = rand() < 0.5 ? -175 - rand() * 30 : 155 + rand() * 30;
    if (inLot(x, z, 1.5) || Math.abs(x - BRIDGES[0].x) < 12 || Math.abs(x - BRIDGES[1].x) < 12 || Math.hypot(x, z) > RADIUS - 50) continue;
    L.push({ t: 'animal', kind: n < 9 ? 'pig' : 'dog', at: [x, z], y: height(x, z), rot: rand() * 6.28, seed: Math.floor(rand() * 1e9), mat: n < 9 && rand() < 0.6 ? 'hide_black' : undefined });
    n++;
  }
  const P = (id, els, style) => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, entrance: { at: [0, -135], facing: 'n' }, bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], rooms: [], elements: els });
  void PARVIS;
  return [P('paris-changers', T, 'gothic'), P('paris-street-life', L, 'life')];
}

// boats on the Seine: moored along the Right Bank's strand upstream of the Grand Pont (the port of the Grève),
// a few under way, two at the Left Bank
export const boats = {
  id: 'paris-boats', style: 'gothic', origin: [0, 0], base: 0, yaw: 0, feature: true, entrance: { at: [0, -135], facing: 'n' }, bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], rooms: [],
  elements: [
    [40, -159.5, 0, 13, 'casks'], [56, -160, 0.05, 11, 'wood'], [72, -159.5, -0.04, 12, 'sacks'], [88, -160.2, 0, 13, 'casks'], [104, -159.6, 0.03, 10, ''],
    [150, -158.5, 0.1, 12, 'wood'], [60, -132, 0.12, 12, 'sacks'], [-70, -140, -0.08, 11, 'casks'], [40, 145.5, 0, 11, 'wood'], [-40, 145.8, 0.04, 10, ''],
  ].map(([x, z, yaw, len, load]) => ({ t: 'boat_seine', at: [x, z], yaw, len, load, water: RIVER.level }))
    .concat(quayBoats.map(([x, yaw, len, load]) => ({ t: 'boat_seine', at: [x, QUAY.z - 1.9], yaw, len, load, water: RIVER.level }))),
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
