// Dessau around the Bauhaus (docs/settlements/bauhaus-dessau.md §3–§4, §7): the tenement blocks with their shops, the Masters' Houses in the pine
// grove, the Törten rows, the street's lamps, cars and bicycles, and the people — students at the looms, the benches and the stairs, townspeople on the pavements.
import { RADIUS, LV, PL, B, ROAD_K, ROAD_M, ROAD_KV, ROAD_E, FOOT, MASTERS, TORTEN, lots, inRoad, inLot, inMasters, inSchool } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
const base = (id, style, elements, o = {}) => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [4, 9.2], facing: 'w' }, ...o });
const pick = (r, a) => a[Math.floor(r() * a.length) % a.length];

function buildings() {
  const E = [];
  for (const l of lots()) E.push({ t: 'dessau_house', rect: l.rect, front: l.front, storeys: l.storeys, shop: l.shop, roof: l.roof, modern: l.modern, seed: l.seed });
  for (const h of MASTERS) E.push({ t: 'bauhaus_master', rect: h.rect, kind: h.kind, seed: h.seed });
  TORTEN.forEach((r, i) => E.push({ t: 'torten_row', rect: [r[0], r[1], r[2], r[3]], n: 8, seed: 40 + i }));
  // bicycles: racks by the school's doors, leaning against the pavements' kerbs, along the lots' fronts
  const rand = rng(1926);
  for (let i = 0; i < 14; i++) E.push({ t: 'bicycle', at: [2.8 + (i % 7) * 0.55, 12.0 + Math.floor(i / 7) * 0.5], rot: Math.PI / 2 + (rand() - 0.5) * 0.2, y: 0 });
  for (let i = 0; i < 10; i++) E.push({ t: 'bicycle', at: [-40 + rand() * 0.1, -150 + i * 30 + rand() * 6], rot: 0, y: 0 });
  for (let i = 0; i < 8; i++) E.push({ t: 'bicycle', at: [60 + i * 14, 6.4], rot: Math.PI / 2, y: 0 });
  return E;
}

function life() {
  const rand = rng(1927), P = [], F = RADIUS - 14;
  const fig = (at, rot, o = {}) => P.push({ t: 'figure', at, y: 0, rot, seed: Math.floor(rand() * 1e9), dress: 'trousers', cloth: pick(rand, ['cloth_grey', 'cloth_brown', 'cloth_indigo', 'cloth_black']), cloth2: pick(rand, ['cloth_grey', 'cloth_brown', 'cloth_black']), skin: 'skin_light', hat: 'none', hair: 'short', hairMat: pick(rand, ['hair_dark', 'hide_brown', 'hide_tan']), feet: 'shod', beard: false, ...o });
  const woman = (at, rot, o = {}) => fig(at, rot, { dress: 'robe', cloth: pick(rand, ['cloth_blue', 'cloth_ochre', 'cloth_red', 'cloth_green', 'cloth_white', 'cloth_grey']), over: 'none', hair: 'short', ...o });
  // the street's lamps: on the outer edge of each pavement, 32 m apart
  const lamp = (x, z) => { if (!inSchool(x, z, 2) && !inLot(x, z, 0.5) && Math.hypot(x, z) < F) P.push({ t: 'street_lamp', at: [x, z], y: 0, h: 4.6 }); };
  for (let z = -170; z <= 170; z += 32) { lamp(ROAD_M[0] - FOOT + 0.3, z); lamp(ROAD_M[2] + FOOT - 0.3, z + 16); lamp(ROAD_KV[0] - FOOT + 0.3, z + 8); lamp(ROAD_KV[2] + FOOT - 0.3, z + 24); }
  for (let x = -170; x <= 180; x += 32) { lamp(x, ROAD_K[1] - FOOT + 0.3); lamp(x + 16, ROAD_K[3] + FOOT - 0.3); lamp(x + 8, ROAD_E[3] + FOOT - 0.3); }
  // parked cars of 1927 (a Dixi, an Opel, a delivery van) at the kerbs, and a horse and cart
  const park = [[ROAD_M[0] + 1.3, -120, 0], [ROAD_M[2] - 1.3, 60, 0], [ROAD_M[0] + 1.3, 110, 0], [90, ROAD_K[1] + 1.3, Math.PI / 2], [150, ROAD_K[3] - 1.3, Math.PI / 2], [ROAD_KV[2] - 1.3, -60, 0], [20, ROAD_E[1] + 1.3, Math.PI / 2], [110, ROAD_E[3] - 1.3, Math.PI / 2]];
  park.forEach(([x, z, r], i) => { if (!inSchool(x, z, 3)) P.push({ t: 'car', at: [x, z], y: 0, rot: r + (i % 2 ? Math.PI : 0), seed: i + 5, era: 1930 }); });
  P.push({ t: 'handcart', at: [ROAD_M[0] + 1.6, -60], y: 0, rot: 0, seed: 3 }, { t: 'cart', at: [ROAD_KV[0] + 1.8, 40], y: 0, rot: 0, seed: 4, kind: 'two', beast: 'horse', load: 'sacks' });
  // the school: weavers at the looms (seated at their benches), carpenters at the benches, students at the lecture hall's stools, readers in the library,
  // the draughtsmen on the bridge, diners in the canteen, a figure at the Prellerhaus's balconies
  const F1 = LV.f1, F2 = LV.f2, F0 = LV.f0;
  for (const [x, z] of [[-14.5, 16.8], [-11, 16.8], [-14.5, 21.6], [-11, 21.6]]) woman([x, z + 0.65], 0, { y: F1, pose: 'sit' });
  for (const [x, z] of [[-14.5, 26.6], [-11, 26.6]]) woman([x, z + 0.65], 0, { y: F1, pose: 'sit', cloth: 'cloth_red' });
  for (const [x, z] of [[-14.3, 17.6], [-9, 19], [-12, 18.2]]) fig([x, z], 3.9 + x * 0.3, { y: F0, cloth: 'cloth_brown', cloth2: 'cloth_brown', pose: 'stand' });
  for (const [x, z] of [[-14.0, 32.0], [-9, 29]]) fig([x, z], 1.6, { y: F0, cloth: 'cloth_indigo', cloth2: 'cloth_indigo' });
  for (let i = 0; i < 6; i++) { const x = [-14.3, -9.5][i % 2] + (i % 2 ? 2.6 : 0.9), z = [6.0, 7.7, 9.4][Math.floor(i / 2)] + 0.95; (i % 3 ? woman : fig)([x, z], Math.PI, { y: F1, pose: 'sit' }); }
  for (const [x, z] of [[-14, 27.5], [-9.2, 27.0], [-11.5, 29.5]]) (rand() < 0.5 ? woman : fig)([x, z], 2 + x * 0.1, { y: F2, cloth: 'cloth_grey' });
  fig([-12.5, 17.0], 0, { y: F2, cloth: 'cloth_indigo', pose: 'stand' });
  for (const [x, z] of [[-12.6, -5.5], [-9.6, -5.5]]) woman([x, z + 0.85], 0, { y: F1, pose: 'sit' });
  fig([-10.3, -3.0], 0, { y: F2, cloth: 'cloth_grey', pose: 'stand' }); fig([-8.5, -5.2], 1.5, { y: F2, pose: 'stand' });
  for (const z of [-21.5, -18.5]) fig([17.5 + (z > -20 ? 1 : 0), z + 1.25], 0, { y: F1, pose: 'sit' });
  for (const [x, z, r] of [[34.15, 15.9, -1.57], [38.9, 16.4, 1.57], [34.15, 29.0, -1.57], [38.9, 32.0, 1.57]]) (rand() < 0.5 ? woman : fig)([x, z], r, { y: F0, pose: 'sit' });
  fig([48.6, 22.0], 1.57, { y: PL.f2, pose: 'stand' }); woman([50.4, 18], 1.57, { y: PL.f3, pose: 'stand' });
  // the forecourt and the door: groups talking, students with portfolios, the porter
  for (let k = 0; k < 10; k++) { const x = 2 + rand() * 30, z = -7 + rand() * 9; if (z > 3 || (x > 1 && z > -2 && x < 12)) continue; const r = rand() * 6.28; (k % 3 === 0 ? woman : fig)([x, z], r, { pose: k % 2 ? 'talk' : 'stand' }); }
  for (let k = 0; k < 6; k++) { const x = 3 + rand() * 10, z = 5 + rand() * 8; (k % 2 ? woman : fig)([x, z], rand() * 6.28, {}); }
  // the pavements of the town: shoppers with baskets at the shops, loiterers, children, dogs
  for (const l of lots()) {
    if (!l.shop || rand() < 0.2) continue;
    const [x0, z0, x1, z1] = l.rect, alongX = l.front === 'n' || l.front === 's', at = alongX ? [(x0 + x1) / 2, l.front === 'n' ? z0 - 1.6 : z1 + 1.6] : [l.front === 'w' ? x0 - 1.6 : x1 + 1.6, (z0 + z1) / 2];
    woman(at, alongX ? (l.front === 'n' ? 0 : Math.PI) : (l.front === 'w' ? 1.57 : -1.57), { hat: 'cap', carry: 'basket', hair: 'bun', cloth: pick(rand, ['cloth_brown', 'cloth_grey', 'cloth_green']) });
    P.push({ t: 'crates', at: [at[0] + (alongX ? 1.8 : 0), at[1] + (alongX ? 0 : 1.8)], y: 0, rot: rand() * 3, n: 3, seed: l.seed % 97 });
  }
  for (let k = 0; k < 9; k++) { const x = -60 + rand() * 120, z = -150 + rand() * 300; if (inRoad(x, z, 0) || inLot(x, z, 1) || inSchool(x, z, 3) || inMasters(x, z, 2) || Math.hypot(x, z) > F) continue; P.push({ t: 'animal', kind: 'dog', at: [x, z], y: 0, rot: rand() * 6.28, seed: k + 3 }); }
  return P;
}

export async function town() {
  return [base('dessau-town', 'bauhaus', buildings()), base('dessau-people', 'life', life())];
}
