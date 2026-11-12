// Dessau around the Bauhaus (docs/settlements/bauhaus-dessau.md §3–§4, §7, §11): the tenement blocks with their shops, pubs and flats (every ground floor enterable),
// the Masters' Houses in the pine grove, the Törten rows and the Konsum, the street's kerbs and furniture, the lamps, cars and bicycles, and the people — students at
// the looms, the benches and the stairs, townspeople on the pavements, queues at the shops, children in the lane. Several plans (the four quarters, the grove, the estate)
// so that each builds in turn and the viewer culls them by distance.
import { RADIUS, LV, PL, B, ROADS, ROAD_K, ROAD_M, ROAD_KV, ROAD_E, FOOT, MASTERS, TORTEN, TORTEN_FRONT, KONSUM, lots, inRoad, inLot, inMasters, inSchool, inTorten, inRect } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
const bboxOf = (rects, m = 6) => { const b = [1e9, 1e9, -1e9, -1e9]; for (const r of rects) { b[0] = Math.min(b[0], r[0]); b[1] = Math.min(b[1], r[1]); b[2] = Math.max(b[2], r[2]); b[3] = Math.max(b[3], r[3]); } return [b[0] - m, b[1] - m, b[2] + m, b[3] + m]; };
const plan = (id, style, elements, rects, o = {}) => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: rects && rects.length ? bboxOf(rects) : [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [4, 9.2], facing: 'w' }, ...o });
const pick = (r, a) => a[Math.floor(r() * a.length) % a.length];
const quad = (x, z) => (x < 0 ? 0 : 1) + (z < 0 ? 0 : 2);
const RK = RADIUS - 10;
const NEAR = 150;     // m from a quarter's middle: the town's houses in full inside, simple beyond

/** The kerbs of every street along both its edges (cut where another street crosses), as thin rectangles, split at the quarter axes. */
function kerbs() {
  const out = [], T = 0.18;
  for (const r of ROADS) {
    const alongX = r[2] - r[0] > r[3] - r[1];
    for (const side of [0, 1]) {
      const c = alongX ? (side ? r[3] : r[1]) : (side ? r[2] : r[0]), a0 = alongX ? r[0] : r[1], a1 = alongX ? r[2] : r[3];
      // the chord of the disc at this line
      const h = Math.sqrt(Math.max(0, RK * RK - c * c));
      let pieces = [[Math.max(a0, -h), Math.min(a1, h)]];
      for (const q of ROADS) {
        if (q === r) continue;
        const qx = q[2] - q[0] > q[3] - q[1];
        if (qx === alongX) continue;
        const lo = qx ? q[1] : q[0], hi = qx ? q[3] : q[2];
        if (c < lo + 0.01 || c > hi - 0.01) continue;
        const cut = qx ? [q[0] - FOOT, q[2] + FOOT] : [q[1] - FOOT, q[3] + FOOT];
        pieces = pieces.flatMap(([p0, p1]) => (cut[1] <= p0 || cut[0] >= p1 ? [[p0, p1]] : [[p0, Math.min(p1, cut[0])], [Math.max(p0, cut[1]), p1]].filter(([u, v]) => v - u > 0.5)));
      }
      for (const [p0, p1] of pieces) for (const [u0, u1] of (p0 < 0 && p1 > 0 ? [[p0, 0], [0, p1]] : [[p0, p1]])) {
        if (u1 - u0 < 0.5) continue;
        const o = side ? [c, c + T] : [c - T, c];                    // the kerb lies outside the roadway
        out.push(alongX ? [u0, o[0], u1, o[1]] : [o[0], u0, o[1], u1]);
      }
    }
  }
  return out;
}

/** Street furniture: drains, manholes, pillars, kiosks, post boxes, hydrants, benches, bins, name plates, pumps, goals. */
function streetStuff() {
  const rand = rng(77), drains = [], manholes = [], items = [], R = RK - 6, inD = (x, z) => Math.hypot(x, z) < R;
  for (const r of ROADS) {
    const alongX = r[2] - r[0] > r[3] - r[1];
    for (let s = -R + 9; s < R; s += 28) for (const side of [0, 1]) {
      const x = alongX ? s + (side ? 11 : 0) : (side ? r[2] - 0.5 : r[0] + 0.5), z = alongX ? (side ? r[3] - 0.5 : r[1] + 0.5) : s + (side ? 11 : 0);
      if (inD(x, z) && inRect(r, x, z, -0.2) && !ROADS.some((q) => q !== r && inRect(q, x, z, FOOT))) drains.push([x, z, alongX]);
    }
    for (let s = -R + 20; s < R; s += 46) { const x = alongX ? s : (r[0] + r[2]) / 2, z = alongX ? (r[1] + r[3]) / 2 : s; if (inD(x, z) && !ROADS.some((q) => q !== r && inRect(q, x, z, 1))) manholes.push([x, z]); }
  }
  const at = (k, x, z, rot = 0) => { if (inD(x, z) && !inSchool(x, z, 2) && !inLot(x, z, 0.3)) items.push({ k, at: [x, z], rot }); };
  const Mw = ROAD_M[0] - FOOT / 2, Me = ROAD_M[2] + FOOT / 2, Kn = ROAD_K[1] - FOOT / 2, Ks = ROAD_K[3] + FOOT / 2, Vw = ROAD_KV[0] - FOOT / 2, Ve = ROAD_KV[2] + FOOT / 2, En = ROAD_E[1] - FOOT / 2, Es = ROAD_E[3] + FOOT / 2;
  for (const [x, z] of [[Mw, Kn - 0.2], [Ve, Kn - 0.2], [Mw, En], [Ve, En], [100, Kn]]) at('pillar', x, z);
  for (const [x, z] of [[Mw, Ks], [Ve, Ks], [60, En]]) at('kiosk', x, z);
  for (const [x, z] of [[Mw + 0.4, -50], [Mw + 0.4, 50], [Ve - 0.4, -50], [Ve - 0.4, 130], [120, Kn], [140, Es], [Me - 0.4, -130], [Vw + 0.4, 60]]) at('postbox', x, z);
  for (const [x, z] of [[Mw + 0.4, -100], [Mw + 0.4, 100], [Me - 0.4, -60], [Me - 0.4, 100], [Ve - 0.4, -90], [40, Kn], [40, Ks], [-60, Es]]) at('hydrant', x, z);
  for (const z of [-40, -80, -120, -160]) at('bench', Me, z, Math.PI / 2);
  for (const z of [30, 70, 110, 150]) at('bench', Mw, z, Math.PI / 2);
  for (const x of [90, 130, 170]) at('bench', x, Ks, 0);
  for (const [x, z, a] of [[Me, -45, 0], [Mw, 33, 0], [Kn - 0.2, 100, 0], [Ks, 90, 0]]) at('bin', x, z, a);
  for (const [x, z] of [[Mw, Ks + 0.3], [Mw, Kn - 0.4], [Ve, Ks + 0.3], [Ve, En], [Vw, Kn - 0.4]]) at('sign', x + 0.9, z, 0);
  for (const [x, z] of [[Me, -100], [Ve + 0.3, 20], [100, Ks + 0.5]]) at('pump', x, z);
  for (const [x, z] of [[Mw + 0.8, 8], [Ve - 0.8, 8], [60, En + 0.6]]) at('rack', x, z, Math.PI / 2);
  items.push({ k: 'goal', at: [56, 22], dir: -1 }, { k: 'goal', at: [136, 22], dir: 1 });
  void rand;
  return { drains, manholes, items };
}

function buildings() {
  const L = lots(), groups = [[], [], [], []], rects = [[], [], [], []], houses = [[], [], [], []];
  for (const l of L) { const q = quad((l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2); const h = { t: 'dessau_house', rect: l.rect, front: l.front, storeys: l.storeys, shop: l.shop, roof: l.roof, modern: l.modern, seed: l.seed }; groups[q].push(h); houses[q].push(h); rects[q].push(l.rect); }
  // the street's kerbs and furniture, divided by quarter
  const K = kerbs(), S = streetStuff(), by = [{ kerbs: [], drains: [], manholes: [], items: [] }, { kerbs: [], drains: [], manholes: [], items: [] }, { kerbs: [], drains: [], manholes: [], items: [] }, { kerbs: [], drains: [], manholes: [], items: [] }];
  for (const k of K) { const q = quad((k[0] + k[2]) / 2, (k[1] + k[3]) / 2); by[q].kerbs.push(k); rects[q].push(k); }
  for (const d of S.drains) { const q = quad(d[0], d[1]); by[q].drains.push(d); rects[q].push([d[0], d[1], d[0], d[1]]); }
  for (const m of S.manholes) { const q = quad(m[0], m[1]); by[q].manholes.push(m); rects[q].push([m[0], m[1], m[0], m[1]]); }
  for (const it of S.items) { const q = quad(it.at[0], it.at[1]); by[q].items.push(it); rects[q].push([it.at[0], it.at[1], it.at[0], it.at[1]]); }
  // bicycles: racks by the school's doors, leaning against the pavements' kerbs, along the lots' fronts
  const rand = rng(1926), bic = [[], [], [], []];
  const bike = (x, z, rot) => { if (!inSchool(x, z, 0.2) || (x > 2 && x < 8.5 && z > 11)) bic[quad(x, z)].push({ t: 'bicycle', at: [x, z], rot, y: 0 }); };
  for (let i = 0; i < 14; i++) bike(2.8 + (i % 7) * 0.55, 12.0 + Math.floor(i / 7) * 0.5, Math.PI / 2 + (rand() - 0.5) * 0.2);
  for (let i = 0; i < 12; i++) bike(ROAD_M[0] - 1.0 + rand() * 0.1, -150 + i * 26 + rand() * 6, 0);
  for (let i = 0; i < 10; i++) bike(60 + i * 12, ROAD_K[3] + 0.6, Math.PI / 2);
  for (let i = 0; i < 8; i++) bike(ROAD_KV[2] + 1.0, -150 + i * 40 + rand() * 6, 0);
  bic.forEach((b, q) => { groups[q].push(...b); b.forEach((e) => rects[q].push([e.at[0], e.at[1], e.at[0], e.at[1]])); });
  const plans = [];
  for (let q = 0; q < 4; q++) {
    groups[q].push({ t: 'dessau_street', seed: 7 + q, ...by[q], field: q === 3 ? [52, 4, 140, 40] : null });
    if (q === 3) rects[q].push([52, 4, 140, 40]);
    // each quarter twice (DESIGN §3.3): in full for when the visitor is within NEAR of its middle, and as the far view (houses simple, no street furniture) beyond
    const b = bboxOf(rects[q], 0), center = [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2];
    plans.push(plan(`dessau-town-${q}`, 'bauhaus', groups[q], rects[q], { near: NEAR, center }));
    plans.push(plan(`dessau-town-${q}-far`, 'bauhaus', houses[q].map((h) => ({ ...h, simple: true })), rects[q], { far: NEAR, center, nocollide: true }));
  }
  // the Masters' Houses in the pines; Törten's rows and the Konsum
  plans.push(plan('dessau-masters', 'bauhaus', MASTERS.map((h) => ({ t: 'bauhaus_master', rect: h.rect, kind: h.kind, id: h.id, seed: h.seed })), MASTERS.map((h) => h.rect)));
  const tor = TORTEN.map((r, i) => ({ t: 'torten_row', rect: r, n: 14, front: TORTEN_FRONT[i], seed: 40 + i }));
  plans.push(plan('dessau-torten', 'bauhaus', [...tor, { t: 'konsum', rect: KONSUM, seed: 9 }], [...TORTEN.map((r, i) => [r[0] - 3, r[1] - 9, r[2] + 3, r[3] + 9]), KONSUM]));
  return plans;
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
  const park = [[ROAD_M[0] + 1.3, -120, 0], [ROAD_M[2] - 1.3, 92, 0], [ROAD_M[0] + 1.3, 110, 0], [90, ROAD_K[1] + 1.3, Math.PI / 2], [150, ROAD_K[3] - 1.3, Math.PI / 2], [ROAD_KV[2] - 1.3, -60, 0], [20, ROAD_E[1] + 1.3, Math.PI / 2], [110, ROAD_E[3] - 1.3, Math.PI / 2], [57, MASTERS[0].rect[3] + 6.5, 0.3]];
  park.forEach(([x, z, r], i) => { if (!inSchool(x, z, 3)) P.push({ t: 'car', at: [x, z], y: 0, rot: r + (i % 2 ? Math.PI : 0), seed: i + 5, era: 1930 }); });
  P.push({ t: 'handcart', at: [ROAD_M[0] + 1.6, -60], y: 0, rot: 0, seed: 3 }, { t: 'cart', at: [ROAD_KV[0] + 1.8, 40], y: 0, rot: 0, seed: 4, kind: 'two', beast: 'horse', load: 'sacks' });
  P.push({ t: 'handcart', at: [ROAD_M[2] - 1.6, -110], y: 0, rot: 3.14, seed: 8 }, { t: 'cart', at: [ROAD_K[1] + 1.8, 120], y: 0, rot: 1.57, seed: 5, kind: 'two', beast: 'horse', load: 'barrels' });
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
    if (!l.shop || rand() < 0.15) continue;
    const [x0, z0, x1, z1] = l.rect, alongX = l.front === 'n' || l.front === 's', at = alongX ? [(x0 + x1) / 2 - 2, l.front === 'n' ? z0 - 1.9 : z1 + 1.9] : [l.front === 'w' ? x0 - 1.9 : x1 + 1.9, (z0 + z1) / 2 - 2];
    const rot = alongX ? (l.front === 'n' ? 0 : Math.PI) : (l.front === 'w' ? 1.57 : -1.57);
    woman(at, rot, { hat: 'cap', carry: 'basket', hair: 'bun', cloth: pick(rand, ['cloth_brown', 'cloth_grey', 'cloth_green']), pose: 'stand' });
    if (rand() < 0.6) fig([at[0] + (alongX ? 0.8 : 0), at[1] + (alongX ? 0 : 0.8)], rot + 3.14, { hat: 'brim', cloth: 'cloth_black', pose: 'talk' });
    if (rand() < 0.35) P.push({ t: 'chickens', kind: 'pigeon', at: [at[0] + (alongX ? 3 : (l.front === 'w' ? -1.5 : 1.5)), at[1] + (alongX ? (l.front === 'n' ? -0.5 : 0.5) : 3)], n: 5, seed: l.seed % 977, spread: 1.8 });
  }
  // the newspaper kiosks: a man reading at each, a woman waiting; the pump: a boy with a bucket; children at play
  for (const [x, z] of [[ROAD_M[0] - FOOT / 2, ROAD_K[3] + FOOT / 2], [ROAD_KV[2] + FOOT / 2, ROAD_K[3] + FOOT / 2], [60, ROAD_E[1] - FOOT / 2]]) { fig([x + 1.6, z + 0.3], 2.0, { hat: 'brim', cloth: 'cloth_black', pose: 'stand' }); woman([x - 1.5, z - 0.3], 1.2, { hat: 'cap', carry: 'basket', pose: 'stand' }); }
  for (let k = 0; k < 14; k++) {
    const x = -60 + rand() * 120, z = -150 + rand() * 300;
    if (inRoad(x, z, 0) || inLot(x, z, 1) || inSchool(x, z, 3) || inMasters(x, z, 2) || inTorten(x, z, 0) || Math.hypot(x, z) > F) continue;
    P.push({ t: 'animal', kind: k % 5 === 0 ? 'cat' : 'dog', at: [x, z], y: 0, rot: rand() * 6.28, seed: k + 3 });
  }
  // the pavements: children at hopscotch (chalk squares), a skipping rope, a hoop
  for (const [x, z] of [[ROAD_M[0] - 1.2, -30], [ROAD_KV[2] + 1.2, 25], [ROAD_M[2] + 1.2, -70], [ROAD_KV[0] - 1.2, 45]]) {
    for (let i = 0; i < 4; i++) P.push({ t: 'figure', at: [x + (i % 2) * 0.9, z + Math.floor(i / 2) * 0.9], y: 0, rot: rand() * 6.28, seed: Math.floor(rand() * 1e9), dress: i % 2 ? 'robe' : 'trousers', cloth: pick(rand, ['cloth_blue', 'cloth_red', 'cloth_brown', 'cloth_ochre']), cloth2: 'cloth_grey', skin: 'skin_light', hat: i % 2 ? 'none' : 'cap', hair: 'short', hairMat: 'hair_dark', feet: i % 3 ? 'shod' : 'bare', s: 0.62, pose: 'stand' });
  }
  // Törten: the housewives at the fences, a man digging, hens in the runs, washing; the Konsum's customers
  const tz = (i) => TORTEN[i];
  for (let i = 0; i < 3; i++) {
    const r = tz(i), s = TORTEN_FRONT[i] === 's', lane = s ? r[3] + 1.4 : r[1] - 1.4;
    for (let k = 0; k < 4; k++) { const x = r[0] + 6 + k * 15 + rand() * 4; const o = { hat: 'cap', carry: k % 2 ? 'basket' : undefined, hair: 'bun', cloth: pick(rand, ['cloth_brown', 'cloth_grey', 'cloth_green', 'cloth_blue']), pose: 'stand' }; woman([x, lane], s ? 0 : Math.PI, o); }
    for (let k = 0; k < 2; k++) { const x = r[0] + 10 + k * 28 + rand() * 6, gz = s ? r[1] - 3 : r[3] + 3; fig([x, gz], rand() * 6.28, { hat: 'cap', cloth: pick(rand, ['cloth_indigo', 'cloth_brown']), pose: 'stand' }); }
    P.push({ t: 'chickens', at: [r[0] + 20, s ? r[1] - 5 : r[3] + 5], n: 5, seed: 11 + i, kind: 'hen' }, { t: 'chickens', at: [r[0] + 48, s ? r[1] - 5 : r[3] + 5], n: 4, seed: 21 + i, kind: 'hen' });
  }
  for (let k = 0; k < 6; k++) { const x = KONSUM[0] + 3 + rand() * 9, z = KONSUM[3] + 1.8; (k % 2 ? woman : fig)([x, z], 0, { hat: 'cap', carry: k % 2 ? 'basket' : undefined, pose: 'stand' }); }
  return P;
}

export async function town() {
  const plans = buildings();
  const lifePlan = plan('dessau-people', 'life', life(), null);
  return [...plans, lifePlan];
}
