import { lodTiles } from '../lod.js';
// The town (docs/settlements/versailles.md §5); the court in the gardens (§5a): courtiers walking and talking on
// the terrace before the garden front and down the walk between the basins of the water parterre, others at the
// Latona basin; on the Grand Canal the gondolas sent by Venice (1674) with their gondoliers, and the King's rowing boats.
import { RADIUS, RISE, LATONA, LATONA_Y, CANAL, STABLES, PLACE, lots } from './layout.js';
const base = (id, elements, style = 'vernacular') => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [180, 0], facing: 'w' } });
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const face = (from, to) => Math.atan2(-(to[0] - from[0]), -(to[1] - from[1]));       // a figure faces −z when rot = 0

function court() {
  const rand = rng(1690), L = [];
  const pick = (a) => a[Math.floor(rand() * a.length)];
  const COATS = ['cloth_red', 'cloth_indigo', 'cloth_brown', 'cloth_green', 'cloth_grey', 'cloth_black'], GOWNS = ['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_green', 'cloth_white', 'cloth_grey'];
  const man = (at, y, rot, pose = 'stand') => L.push({ t: 'figure', at, y, rot, h: 1.66 + rand() * 0.12, seed: Math.floor(rand() * 1e9), dress: 'tunic', cloth: pick(COATS), cloth2: 'cloth_white', skin: 'skin_light', hat: 'brim', hatMat: 'cloth_black', pose });
  const lady = (at, y, rot, pose = 'stand') => L.push({ t: 'figure', at, y, rot, h: 1.55 + rand() * 0.1, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: pick(GOWNS), cloth2: pick(['cloth_white', 'cloth_ochre']), skin: 'skin_light', hat: 'none', pose });
  const group = (c, y, n) => {
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2 + rand() * 0.6, p = [c[0] + Math.cos(a) * 0.75, c[1] + Math.sin(a) * 0.75];
      (k % 2 ? lady : man)(p, y, face(p, c), k === 0 ? 'talk' : 'stand');
    }
  };
  // the terrace before the garden front
  for (const z of [-38, -21, -6, 12, 29, 44]) group([-7.5 - rand() * 2.5, z + rand() * 3], RISE + 0.04, 2 + Math.floor(rand() * 2));
  // strolling down the walk between the two basins, toward Latona (kept off the axis, clear of the arrival's view)
  for (let k = 0; k < 6; k++) { const p = [-46 + k * 5 + rand() * 2, (k % 2 ? 1 : -1) * (2.5 + rand() * 0.7)]; (k % 3 === 1 ? lady : man)(p, RISE + 0.04, face(p, [p[0] - 5, p[1]])); }
  // round the Latona basin
  for (const a of [0.4, 2.2, 3.6, 5.1]) { const c = [LATONA[0] + Math.cos(a) * 17.5, LATONA[1] + Math.sin(a) * 17.5]; group(c, LATONA_Y, 2); }
  return base('versailles-court', L, 'life');
}

function canal() {
  const L = [], y = -1.05, X = CANAL.x0 - 10;
  // two gondolas along the canal, a gondolier standing at each stern; two of the King's rowing boats
  for (const [x, z, rot] of [[X, -7, Math.PI / 2], [X - 1, 9.5, -Math.PI / 2 + 0.2]]) {
    L.push({ t: 'boat', kind: 'gondola', at: [x, z], y, rot });
    const s = 4.2, c = Math.cos(rot), sn = Math.sin(rot);
    L.push({ t: 'figure', at: [x + s * sn, z + s * c], y: y + 0.32, rot: rot + Math.PI, h: 1.7, seed: 77 + Math.round(x), dress: 'tunic', cloth: 'cloth_black', cloth2: 'cloth_white', skin: 'skin_medium', hat: 'cap', hatMat: 'cloth_red', pose: 'stand' });
    L.push({ t: 'oar', at: [x + (s + 0.6) * sn, z + (s + 0.6) * c], y: y + 0.6, rot: rot + Math.PI / 2 });
  }
  L.push({ t: 'boat', kind: 'rowboat', len: 6, at: [X + 3, 14], y, rot: Math.PI / 2 - 0.15 });
  L.push({ t: 'boat', kind: 'rowboat', len: 6, at: [X - 4, -14], y, rot: Math.PI / 2 + 0.3 });
  // at the landing: a rowing boat and a gondola moored by the steps, their painters to the posts, a boatman waiting on the quay
  L.push({ t: 'boat', kind: 'rowboat', len: 5, at: [CANAL.end + 7.0, -1.5], y, rot: Math.PI / 2 + 0.05 });
  L.push({ t: 'boat', kind: 'gondola', at: [CANAL.end + 9.0, 5.5], y, rot: -Math.PI / 2 - 0.04 });
  L.push({ t: 'figure', at: [CANAL.end - 1.6, -4.5], y: 0.12, rot: -Math.PI / 2, h: 1.72, seed: 1684, dress: 'tunic', cloth: 'cloth_indigo', cloth2: 'cloth_white', skin: 'skin_light', hat: 'brim', hatMat: 'cloth_black', pose: 'stand' });
  // on the quay behind the landing (§5c): the boatmen's barrels and crates, sacks and a hand-cart, a bench, anglers on the steps' head with their lines, a woman with her basket
  const qx = CANAL.end - 4.2, f = (o) => L.push({ t: 'figure', y: 0.12, legs: 'hose', skin: 'skin_light', dress: 'tunic', cloth2: 'cloth_white', hat: 'brim', hatMat: 'thatch', ...o });
  L.push({ t: 'barrel', at: [qx - 1.5, -9.5], y: 0.12, rot: 0.3, seed: 1 }, { t: 'barrel', at: [qx - 2.4, -9.0], y: 0.12, rot: 1.1, seed: 2 }, { t: 'barrel', at: [qx - 1.2, 10.2], y: 0.12, rot: 0.2, seed: 3 },
    { t: 'crates', at: [qx - 2.6, 8.4], y: 0.12, rot: 0.2, seed: 4 }, { t: 'crates', at: [qx - 3.4, 9.2], y: 0.12, rot: 0.9, seed: 5 }, { t: 'sacks', at: [qx - 2.0, -6.2], y: 0.12, rot: 0.5, seed: 6 },
    { t: 'handcart', at: [qx - 4.5, 3.6], y: 0.12, rot: 1.9, seed: 7 }, { t: 'bench', at: [qx - 7.2, -3.6], y: 0.12, rot: Math.PI / 2, len: 2.0 });
  f({ at: [CANAL.end - 0.9, -11.6], rot: -Math.PI / 2, seed: 41, h: 1.68, cloth: 'cloth_brown', pose: 'sit_low' }); f({ at: [CANAL.end - 0.9, 12.4], rot: -Math.PI / 2, seed: 42, h: 1.72, cloth: 'cloth_grey', pose: 'sit_low' });
  f({ at: [CANAL.end - 0.9, -14.4], rot: -Math.PI / 2, seed: 43, h: 1.4, cloth: 'cloth_green', pose: 'sit_low' });
  f({ at: [qx - 3.0, 5.2], rot: 2.4, seed: 44, h: 1.7, cloth: 'cloth_indigo', pose: 'stand', carry: 'sack' });
  L.push({ t: 'figure', at: [qx - 6.0, -1.2], y: 0.12, rot: 1.2, h: 1.55, seed: 45, dress: 'robe', cloth: 'cloth_brown', cloth2: 'cloth_white', skin: 'skin_light', hat: 'veil', carry: 'basket', pose: 'stand' });
  for (const [x, z, r] of [[CANAL.end + 7.6, -12.5, Math.PI / 2 - 0.1], [CANAL.end + 11, 12.8, -Math.PI / 2 + 0.15]]) L.push({ t: 'boat', kind: 'rowboat', len: 5, at: [x, z], y, rot: r });
  return base('versailles-canal-boats', L, 'life');
}

/** The Place d'Armes (§5b): its cobbles, the sentry boxes at the gate and the corners, the posts and chains along its edges; the market stalls of the town's purveyors, troughs for the coaches' horses, benches, the people about them. */
function place() {
  const rand = rng(1671), [x0, z0, x1, z1] = PLACE, gx = 152;
  const E = [{ t: 'floor', rect: [gx, z0, x1, z1], y: RISE + 0.03, th: 0.3, mat: 'pebbles' }];
  for (const z of [-34, 34, 0]) E.push({ t: 'floor', rect: [gx, z - 0.4, x1 - 6, z + 0.4], y: RISE + 0.05, th: 0.3, mat: 'flagstone' });          // the gutters of dressed stone
  E.push({ t: 'guerites', y: RISE, at: [[gx + 2.5, -9.5, -Math.PI / 2], [gx + 2.5, 9.5, -Math.PI / 2], [gx + 4, z0 + 4, Math.PI], [gx + 4, z1 - 4, 0], [x1 - 14, z0 + 3, Math.PI], [x1 - 14, z1 - 3, 0]] });
  const post = [];
  for (const sz of [-1, 1]) for (let x = gx + 8; x < x1 - 4; x += 4.5) post.push([x, sz * (z1 - 1.0)]);
  for (const sz of [-1, 1]) for (let z = 14; z < z1 - 8; z += 4.5) post.push([gx + 1.2, sz * z]);
  E.push({ t: 'bornes', h: () => RISE, at: post });
  const L = [], fig = (o) => L.push({ t: 'figure', y: RISE, dress: 'tunic', legs: 'hose', skin: 'skin_light', hat: 'brim', hatMat: 'cloth_black', ...o });
  const aw = ['cloth_white', 'cloth_red', 'cloth_green', 'cloth_ochre'], goods = [['bread'], ['greens', 'heap'], ['fish'], ['bolts'], ['melons', 'greens'], ['pottery'], ['bread', 'bolts']];
  let k = 0;
  for (const sz of [-1, 1]) for (let x = gx + 12; x < x1 - 24; x += 7.5, k++) {
    const z = sz * (z1 - 7), rot = sz < 0 ? 0 : Math.PI;
    L.push({ t: 'stall', at: [x, z], y: RISE, rot, seed: 400 + k, awning: aw[k % 4], goods: goods[k % goods.length], w: 2.6 });
    fig({ at: [x + 0.2, z - sz * 1.2], rot: rot + Math.PI, seed: 500 + k, h: 1.62 + rand() * 0.1, cloth: ['cloth_brown', 'cloth_grey', 'cloth_indigo'][k % 3], cloth2: 'cloth_white', pose: 'stand', over: 'apron' });
    if (rand() < 0.7) fig({ at: [x - 0.3 + rand() * 0.6, z + sz * 2.5], rot, seed: 600 + k, h: 1.6, dress: k % 2 ? 'robe' : 'tunic', cloth: ['cloth_red', 'cloth_green', 'cloth_brown'][k % 3], cloth2: 'cloth_white', pose: rand() < 0.4 ? 'talk' : 'stand', carry: k % 3 === 0 ? 'basket' : 'none' });
  }
  // troughs and a bench or two by the stables' wall, the coachmen waiting with their horses
  for (const sz of [-1, 1]) { L.push({ t: 'trough', at: [x1 - 20, sz * 12], y: RISE, rot: 0, mat: 'limestone' }); L.push({ t: 'bench', at: [x1 - 3, sz * 4], y: RISE, rot: Math.PI / 2, len: 2.2, back: true }); }
  for (const [x, z, r] of [[x1 - 26, -4, 0.5], [x1 - 32, 5, 2.2], [x1 - 14, 8, 4]]) fig({ at: [x, z], rot: r, seed: Math.floor(x * 5 + z), h: 1.7, cloth: 'cloth_brown', cloth2: 'cloth_grey', pose: 'talk', over: 'cape' });
  for (const [x, z, r, s] of [[x1 - 22, -9, 1.2, 7], [x1 - 18, 14, -0.4, 8]]) L.push({ t: 'animal', kind: 'horse', at: [x, z], y: RISE, rot: r, seed: s, mat: 'hide_brown', graze: false, gear: true });
  L.push({ t: 'animal', kind: 'dog', at: [gx + 30, -8], y: RISE, rot: 1, seed: 3 }, { t: 'animal', kind: 'dog', at: [gx + 60, 20], y: RISE, rot: 3, seed: 4 });
  return [{ id: 'versailles-place', style: 'classical_fr', origin: [0, 0], base: 0, yaw: 0, feature: true, entrance: { at: [180, 0], facing: 'w' }, bounds: [gx - 10, z0 - 5, x1 + 10, z1 + 5], rooms: [], elements: E, center: [180, 0], near: 300 },
    { id: 'versailles-place-life', style: 'life', origin: [0, 0], base: 0, yaw: 0, feature: true, entrance: { at: [180, 0], facing: 'w' }, bounds: [gx - 10, z0 - 5, x1 + 10, z1 + 5], rooms: [], elements: L, center: [180, 0], near: 300 }];
}

export async function houses() {
  const all = lots(), plans = [];
  const tiles = lodTiles('versailles-houses', 'classical_fr', all.map((l) => ({ t: 'fr_house', ...l, shop: false })), { R: RADIUS });
  // the open houses' rooms (their sound is the chamber's: a lute, the street muffled)
  for (const p of tiles) if (!p.far) p.rooms = p.elements.filter((e) => e.open).map((e) => ({ id: `${e.use} ${Math.round(e.rect[0])},${Math.round(e.rect[1])}`, rect: [e.rect[0] + 0.4, e.rect[1] + 0.4, e.rect[2] - 0.4, e.rect[3] - 0.4], y: e.y + 0.14, kind: e.use === 'hotel' ? 'hall' : 'chamber' }));
  plans.push(...tiles);
  plans.push({ id: 'versailles-stables', style: 'classical_fr', origin: [0, 0], base: 0, yaw: 0, feature: true, entrance: { at: [180, 0], facing: 'w' }, bounds: [150, -100, 300, 100], rooms: [], center: [240, 0], near: 320,
    elements: STABLES.map((s) => ({ t: 'ecurie', ...s, y: RISE })) });
  return [...plans, ...place(), court(), canal()];
}
