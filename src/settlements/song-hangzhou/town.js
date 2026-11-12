// The riverside quarter (docs/settlements/song-hangzhou.md §5, §10): shophouses and tea houses of the
// Jiangnan type; and the day of the tide — the coloured stands of the great houses along the flood
// wall below the pagoda, the crowd on the wall looking out for the bore, tea tables on the road; the
// peddlers come to the riverbank for the crowd: stalls along the foot of the flood wall, hawkers with
// their shoulder poles, a fruit seller under a parasol.
import { RADIUS, LEVEL, WALL, ROAD, PAGODA, CANAL, CANAL_BRIDGES, CITY, GATE, LAKE_GATE, WATER_GATE, WEST_LAKE, lakeDepth, TAFANG, TAFANG_FRONT, WATCH_TOWERS, lots, streets, wells, riverTeaHouses } from './layout.js';
import { lifePlans, interiorLots } from './life.js';
import './townscape.js';
import './houses.js';
import { streetsideElements } from './houses.js';
import * as LAYOUT from './layout.js';
import { RIVER_BOATS, CANAL_BOATS } from './plan.js';
const base = (id, elements, style = 'song') => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-110, 136], facing: 'n' } });
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const CLOTH = ['cloth_indigo', 'cloth_white', 'cloth_grey', 'cloth_brown', 'cloth_white', 'cloth_black', 'cloth_red', 'cloth_green'];
const faceTo = ([dx, dz]) => Math.atan2(-dx, -dz);

function tideDay() {
  const S = [], L = [], rand = rng(1165), pick = (a) => a[Math.floor(rand() * a.length)], yW = 1.0, zc = (WALL.z0 + WALL.z1) / 2;
  const person = (at, y, rot, extra = {}) => L.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: rand() < 0.75 ? 'robe' : 'trousers', cloth: pick(CLOTH), cloth2: pick(CLOTH), skin: 'skin_light', hat: pick(['none', 'cap', 'cap', 'brim', 'veil']), carry: 'none', ...extra });
  // the stands along the wall, either side of the pagoda's stair; people seated in them, the crowd at the wall's edge
  for (let x = -200; x < CANAL.x0 - 20; x += 7.5) {
    if (Math.abs(x - PAGODA.c[0]) < 9) continue;
    if (rand() < 0.55) {
      S.push({ t: 'view_tent', at: [x, zc - 0.6], y: yW, w: 5, d: 3.2, h: 2.4, cloth: pick(['cloth_red', 'cloth_green', 'cloth_ochre', 'cloth_indigo', 'cloth_red']), trim: pick(['cloth_white', 'cloth_ochre', 'cloth_red']), open: 's' });
      for (const dx of [-1.4, 0, 1.4]) if (rand() < 0.75) person([x + dx, zc - 1.0], yW, faceTo([0, 1]), { pose: 'sit', dress: 'robe' });
    }
    for (let k = 0; k < 3; k++) if (rand() < 0.7) person([x + (rand() - 0.5) * 6, WALL.z1 - 1.2 - rand() * 0.6], yW, faceTo([(rand() - 0.5) * 0.6, 1]), { pose: rand() < 0.4 ? 'talk' : 'stand' });
  }
  // tea tables on the road before the tea houses, people at them
  for (const l of lots()) {
    if (l.front !== 's' || !l.shop || l.rect[3] < ROAD.z0 - 1 || rand() > 0.4) continue;
    const c = [(l.rect[0] + l.rect[2]) / 2, ROAD.z0 + 2.2];
    if (Math.hypot(...c) > RADIUS - 35) continue;
    L.push({ t: 'tea_table', at: c, c, r: 1.1, y: LEVEL.street + 0.04, rot: 0, seed: Math.floor(rand() * 1e9) });
    for (const [dx, dz] of [[0.85, 0], [-0.85, 0], [0, 0.85]]) if (rand() < 0.7) person([c[0] + dx, c[1] + dz], LEVEL.street + 0.04, faceTo([-dx, -dz]), { pose: 'sit', dress: 'robe' });
  }
  // people on the road walking to the river
  for (let k = 0; k < 40; k++) { const x = -190 + rand() * 300; if (Math.abs(x - (CANAL.x0 + CANAL.x1) / 2) < 10) continue; person([x, ROAD.z0 + 4.5 + rand() * 4], LEVEL.street + 0.04, faceTo([rand() < 0.5 ? 1 : -1, 0.3]), { carry: pick(['none', 'none', 'basket', 'pole']) }); }
  // the riverbank market of the tide day: stalls at the foot of the flood wall facing the road, the
  // sellers behind them, buyers before; hawkers with their poles set down; a parasol over a fruit seller
  const zs = WALL.z0 - 1.6, yR = LEVEL.street + 0.04;
  for (let x = -196; x < CANAL.x0 - 14; x += 6.5 + rand() * 4) {
    if (Math.abs(x - PAGODA.c[0]) < 10) continue;
    const r = rand();
    if (r < 0.6) {
      const W = 2.2 + rand() * 0.8;
      L.push({ t: 'stall', at: [x, zs], y: yR, rot: Math.PI, w: W, d: 1.3, awning: pick(['cloth_white', 'cloth_indigo', 'cloth_ochre', 'cloth_white']), stripe: rand() < 0.4 ? pick(['cloth_red', 'cloth_indigo']) : undefined, goods: pick([['produce', 'basket'], ['dark_pot', 'water_pot', 'basket'], ['cloth', 'basket'], ['produce', 'produce', 'basket']]), seed: Math.floor(rand() * 1e9) });
      person([x + (rand() - 0.5) * W * 0.5, zs + 0.95], yR, faceTo([0, -1]), { dress: pick(['robe', 'trousers']), hat: pick(['none', 'cap']), pose: rand() < 0.5 ? 'talk' : 'stand' });
      if (rand() < 0.7) person([x + (rand() - 0.5) * W * 0.7, zs - 1.9 - rand() * 0.5], yR, faceTo([(rand() - 0.5) * 0.4, 1]), { pose: rand() < 0.5 ? 'talk' : 'stand' });
    } else if (r < 0.85) {
      // a hawker squatting by the two baskets of his shoulder pole
      for (const dx of [-0.55, 0.55]) L.push({ t: 'basket', at: [x + dx, zs + 0.2], y: yR, rot: rand() * 6.28, n: 1, seed: Math.floor(rand() * 1e9) });
      person([x, zs + 0.85], yR, faceTo([0, -1]), { pose: 'squat', dress: 'trousers', cloth: pick(['cloth_brown', 'cloth_grey', 'cloth_indigo']), hat: pick(['straw', 'none']) });
    } else {
      S.push({ t: 'parasol', at: [x, zs + 0.3], y: yR, h: 2.3, r: 1.3, cloth: pick(['cloth_white', 'cloth_ochre']) });
      for (const dx of [-0.5, 0.3]) L.push({ t: 'basket', at: [x + dx, zs - 0.2], y: yR, rot: rand() * 6.28, n: 2, seed: Math.floor(rand() * 1e9) });
      person([x + 0.2, zs + 0.7], yR, faceTo([0, -1]), { pose: 'squat', dress: 'robe', hat: 'none' });
    }
  }
  teaInside(S, L, rand, person);
  // the shops' name boards over their fronts, on the beam over the opening; the tea houses' on their front beam
  const tea = new Set([...teaHouses(), ...Object.entries(interiorLots()).filter(([k]) => k !== 'house').flatMap(([, v]) => v)]), F = { s: [0, 1], n: [0, -1], e: [1, 0], w: [-1, 0] };
  for (const l of lots()) {
    if (!l.shop) continue;
    const [x0, z0, x1, z1] = l.rect, o = F[l.front], len = o[0] ? z1 - z0 : x1 - x0, edge = [o[0] > 0 ? x1 : o[0] < 0 ? x0 : (x0 + x1) / 2, o[1] > 0 ? z1 : o[1] < 0 ? z0 : (z0 + z1) / 2];
    const n = Math.min(Math.floor((len - 1.6) / 0.36), 2 + (l.seed % 4)), back = tea.has(l) ? 0.435 : 0.505;
    if (n < 2) continue;
    S.push({ t: 'shop_plaque', at: [edge[0] - o[0] * back, edge[1] - o[1] * back], y: LEVEL.street, yb: tea.has(l) ? 3.3 : 2.28, rot: Math.atan2(o[0], o[1]), n: tea.has(l) ? 2 : n, scheme: tea.has(l) ? 0 : [0, 0, 1, 2][(l.seed >> 2) % 4], seed: l.seed >> 5 });
  }
  return [base('song-hangzhou-stands', S), base('song-hangzhou-tide-crowd', L, 'life')];
}

/** The tea houses on the road below the pagoda (layout.js). */
export const teaHouses = riverTeaHouses;
/** Inside each tea house: tea tables with their benches, customers seated round them, the host at the counter. */
function teaInside(S, L, rand, person) {
  for (const l of teaHouses()) {
    const [x0, z0, x1, z1] = l.rect, cx = (x0 + x1) / 2 - 0.6, Y = LEVEL.street + 0.45;
    S.push({ t: 'tea_house', rect: l.rect, y: LEVEL.street, seed: l.seed });
    for (const zz of [z0 + 4.4, z0 + 8.2]) {
      L.push({ t: 'tea_table', at: [cx, zz], y: Y, rot: 0, seed: Math.floor(rand() * 1e9) });
      for (const [dx, dz] of [[0.85, 0], [-0.85, 0], [0, 0.85], [0, -0.85]]) if (rand() < 0.6) person([cx + dx, zz + dz], Y, faceTo([-dx, -dz]), { pose: 'sit', dress: 'robe', hat: rand() < 0.6 ? 'cap' : 'none' });
    }
    person([x1 - 1.15, z0 + 6], Y, faceTo([-1, 0]), { pose: 'stand', dress: 'robe', cloth: 'cloth_white', cloth2: 'cloth_black', hat: 'cap' });
  }
}

/**
 * The boats' people (§11): on the river boats the steersman at the stern and a hand at the bow — on
 * those under sail a third at the mast, on those moored by the wall one sitting on the deck; on the
 * canal boats the boatman at the stern's sculling oar, a passenger under the awning on some.
 */
function boatPeople() {
  const L = [], rand = rng(1200), pick = (a) => a[Math.floor(rand() * a.length)];
  const hand = (at, y, rot, extra = {}) => L.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: 'trousers', cloth: pick(['cloth_brown', 'cloth_grey', 'cloth_indigo', 'cloth_white']), cloth2: pick(['cloth_brown', 'cloth_grey']), skin: 'skin_medium', hat: pick(['straw', 'none', 'cap']), hair: 'bun', ...extra });
  for (const [x, z, d, L0] of RIVER_BOATS) {
    const len = L0 + 4, H = len / 2, yw = LEVEL.river, sheer = (t) => yw + 0.95 + 0.35 * t * t + (t > 0 ? 0.7 : 0.45) * t ** 6, deck = (t) => sheer(t) - 0.3;
    const at = (t) => [x + d * t * H, z];
    hand(at(-0.8), deck(-0.8), faceTo([d, 0]), { pose: 'pull' });                                       // at the tiller
    hand(at(0.72), deck(0.72), faceTo([d, (rand() - 0.5) * 0.6]), { pose: rand() < 0.5 ? 'stand' : 'talk' });
    if (z > 165) hand([x - d * 0.6, z + 0.5], deck(0) , faceTo([0, -1]), { pose: 'brace', carry: 'rope' });
    else hand([x + d * 0.3 * H, z - 0.4], deck(0.3), faceTo([0, 1]), { pose: 'cross', dress: 'robe' });
  }
  for (const [z, d] of CANAL_BOATS) {
    const len = 7, x = (CANAL.x0 + CANAL.x1) / 2 + (d > 0 ? -2 : 2), yw = LEVEL.canal, s = -0.38 * len;
    const stern = [x, z + d * s], ys = yw + 0.5 + 0.32 * Math.pow(0.76, 2.2) - 0.06;
    hand(stern, ys, faceTo([0, d]) + (rand() - 0.5) * 0.5, { pose: 'row' });
    L.push({ t: 'oar', at: [x, z + d * (s - 0.45)], y: ys - 0.1, rot: d > 0 ? Math.PI : 0, seed: 5 });
    if (rand() < 0.6) hand([x, z + d * 0.6], yw + 0.07, faceTo([0, d]), { pose: 'low', dress: 'robe', hat: 'cap', cloth: pick(['cloth_indigo', 'cloth_white']) });
  }
  return { ...base('song-hangzhou-boat-people', L, 'life'), center: [0, 120] };
}


/**
 * The city and the lake (docs/settlements/song-hangzhou.md §12): the wall with its two gates, bastions and
 * parapets, the streets' paving, the wells, the fire-watch towers, the storehouses and landings on the
 * canal, the lake with the Su Causeway, its bridges, lotus and boats.
 */
function fabric() {
  const E = [], rand = rng(1089), top = CITY.h, th = CITY.th, zs = CITY.zs, zn = CITY.zn, b = 2.5;
  const wallBlock = (rect, batter) => E.push({ t: 'block', walk: true, rect, y0: -0.5, y1: top, mat: 'earth_wall', batter });
  const xw = CITY.xw + th / 2, X1 = CITY.x1;
  const pr = (a, c, y, extra = {}) => E.push({ t: 'song_parapet', a, b: c, y, th: 0.55, h: 1.5, ...extra });
  const cut = (lo, hi, holes) => { let segs = [[lo, hi]]; for (const [h0, h1] of holes) segs = segs.flatMap(([p, q]) => (h1 <= p || h0 >= q ? [[p, q]] : [[p, h0], [h1, q]].filter(([m, n]) => n - m > 1.5))); return segs; };
  // ---- the south and north walls: pieces from the west wall to the gate, on to the water gate, over the canal, to the east end
  const SB = [58, 190, 270, 362, 452], NB = [190, 270, 362, 452];
  const sideWall = (zc, gate, along, bast, outSign, towerFront) => {
    const z0 = zc - th / 2, z1 = zc + th / 2, pieces = [[xw, gate.rect[0]], [gate.rect[2], WATER_GATE[0]], [WATER_GATE[1], X1]];
    for (const [a, c] of pieces) wallBlock([a, z0, c, z1], [0, 0, b, b]);
    E.push({ t: 'block', walk: true, rect: [WATER_GATE[0], z0, WATER_GATE[1], z1], y0: 4.6, y1: top, mat: 'brick_grey', batter: [0, 0, b, b] });
    E.push({ t: 'hz_gate', rect: gate.rect, w: gate.w, spring: 4.4, rise: 3.0, H: gate.H, outer: outSign > 0 ? 's' : 'n', seed: Math.round(zc) });
    E.push({ t: 'ming_hall', rect: [gate.rect[0] + 3, zc - 6, gate.rect[2] - 3, zc + 6], y: gate.H, H: 5.4, front: towerFront, four: true, roof: 'xieshan', plat: 0.3, eave: 1.7, sweep: 0.9 });
    // bastions (mamian) on the outer face, with their parapets; the main parapets cut where they stand
    const zOutFace = outSign > 0 ? z1 : z0, zOutLine = zOutFace - outSign * (b + 0.05), zInLine = (outSign > 0 ? z0 : z1) + outSign * (b + 0.05);
    for (const x of bast) {
      const o = outSign > 0 ? [zOutFace - b - 0.6, zOutFace + 6] : [zOutFace - 6, zOutFace + b + 0.6];
      E.push({ t: 'block', walk: true, rect: [x - 7, o[0], x + 7, o[1]], y0: -0.5, y1: top, mat: 'earth_wall', batter: [0.8, 0.8, outSign > 0 ? 0 : 1.6, outSign > 0 ? 1.6 : 0] });
      const zf = outSign > 0 ? o[1] : o[0], sd = Math.round(x * 3 + zc);
      E.push({ t: 'hz_wall_skin', a: [x - 7, zf], b: [x + 7, zf], n: outSign, off: zf, batter: 1.6, yBase: -0.5, y0: -0.1, y1: top, seed: sd });
      for (const sx of [-1, 1]) E.push({ t: 'hz_wall_skin', a: [x + sx * 7, o[0]], b: [x + sx * 7, o[1]], n: sx, off: x + sx * 7, batter: 0.8, yBase: -0.5, y0: -0.1, y1: top, seed: sd + sx });
      const zo = outSign > 0 ? o[1] - 1.7 : o[0] + 1.7, zi = outSign > 0 ? o[0] + 0.6 : o[1] - 0.6;
      pr([x - 6.2, zo], [x + 6.2, zo], top); pr([x - 6.45, zi], [x - 6.45, zo], top); pr([x + 6.45, zi], [x + 6.45, zo], top);
    }
    const holes = [[gate.rect[0], gate.rect[2]], ...bast.map((x) => [x - 7.1, x + 7.1])];
    for (const [a, c] of [pieces[0], pieces[1], [WATER_GATE[0], WATER_GATE[1]], pieces[2]]) for (const [p, q] of cut(a, c, holes)) { pr([p, zOutLine - outSign * 0.3 + outSign * 0.3], [q, zOutLine], top); pr([p, zInLine], [q, zInLine], top, { inner: true }); }
  };
  // the brick facing on both faces of each run (not at the gates, the bastions or the water gate's bridge)
  const skin = (zc, gate, bast, outSign) => {
    const faces = [[zc + th / 2, 1], [zc - th / 2, -1]];
    for (const [zf, n] of faces) {
      const outer = n === outSign, holes = [[gate.rect[0] - 0.5, gate.rect[2] + 0.5], [WATER_GATE[0], WATER_GATE[1]], ...(outer ? bast.map((x) => [x - 7.6, x + 7.6]) : [])];
      for (const [p, q] of cut(xw, X1, holes)) E.push({ t: 'hz_wall_skin', a: [p, zf], b: [q, zf], n, off: zf, batter: b, yBase: -0.5, y0: -0.1, y1: top, seed: Math.round(zf + p) });
    }
  };
  skin(zs, GATE, SB, 1); skin(zn, LAKE_GATE, NB, -1);
  sideWall(zs, GATE, 'z', SB, 1, 's');
  sideWall(zn, LAKE_GATE, 'z', NB, -1, 'n');
  // ---- the west wall between them, with its bastions and parapets
  const xa = CITY.xw - th / 2, xb = CITY.xw + th / 2, wz0 = zn + th / 2, wz1 = zs - th / 2, WB = [-80, -125, -170];
  wallBlock([xa, wz0, xb, wz1], [b, b, 0, 0]);
  for (const z of WB) { E.push({ t: 'block', walk: true, rect: [xa - 5.4, z - 7, xb - b - 0.6, z + 7], y0: -0.5, y1: top, mat: 'earth_wall', batter: [1.6, 0, 0.8, 0.8] }); pr([xa - 3.7, z - 6.2], [xa - 3.7, z + 6.2], top); pr([xa - 5.4 + 0.6, z - 6.45], [xa - 3.7, z - 6.45], top); pr([xa - 5.4 + 0.6, z + 6.45], [xa - 3.7, z + 6.45], top); }
  for (const [p, q] of cut(wz0, wz1, WB.map((z) => [z - 7.1, z + 7.1]))) { pr([xa + b + 0.05, p], [xa + b + 0.05, q], top); pr([xb - b - 0.05, p], [xb - b - 0.05, q], top, { inner: true }); }
  for (const [xf, n, holes] of [[xb, 1, []], [xa, -1, WB.map((z) => [z - 7.6, z + 7.6])]]) for (const [p, q] of cut(wz0, wz1, holes)) E.push({ t: 'hz_wall_skin', a: [xf, p], b: [xf, q], n, off: xf, batter: b, yBase: -0.5, y0: -0.1, y1: top, seed: Math.round(p + xf) });
  // the paving through the gates and on the shore before the lake gate
  for (const [g, zc] of [[GATE, zs], [LAKE_GATE, zn]]) E.push({ t: 'paving', rect: [g.x - g.w / 2, zc - th / 2 - 0.2, g.x + g.w / 2, zc + th / 2 + 0.2], y: LEVEL.street + 0.04, th: 0.3 });
  // ---- the streets' paving
  for (const s of streets()) E.push({ t: 'paving', rect: s.r, y: LEVEL.street + 0.04, th: 0.3 });
  // the Imperial Way's own surface: slabs at the sides, the gravel between, the ruts and the drain covers
  streets().filter((s) => s.kind === 'imperial').forEach((s, i) => { if (s.r[3] - s.r[1] > 8) E.push({ t: 'hz_imperial_way', rect: s.r, y: LEVEL.street + 0.04, seed: 31 + i }); });
  // ---- wells in the lanes
  for (const p of wells()) E.push({ t: 'town_well', at: p, y: LEVEL.street + 0.04, rot: rand() * 6.28 });
  // ---- the fire-watch towers (wang huo lou): a brick base, a timber room under a hipped roof, on the Imperial Way's corners
  for (const [x0, zz0, x1, zz1] of WATCH_TOWERS) {
    const cx = (x0 + x1) / 2, cz = (zz0 + zz1) / 2;
    E.push({ t: 'block', rect: [x0, zz0, x1, zz1], y0: -0.3, y1: 5.8, mat: 'brick_grey', batter: [0.35, 0.35, 0.35, 0.35] });
    E.push({ t: 'ming_pavilion', c: [cx, cz], shape: 'square', w: 5.4, d: 5.4, y: 5.8, H: 3.4, open: [0, 1, 2, 3], plat: 0.3 });
  }
  // ---- the storehouses on the canal (tafang) with their loading platforms: sacks and jars on them
  TAFANG.forEach((r, i) => {
    const f = TAFANG_FRONT[i];
    E.push({ t: 'tafang', rect: r, y: LEVEL.street, front: f, seed: i });
    const px = f === 'w' ? r[0] - 1.1 : r[2] + 1.1, rot = f === 'w' ? Math.PI / 2 : -Math.PI / 2;
    for (let z = r[1] + 5; z < r[3] - 6; z += 14) E.push(rand() < 0.5 ? { t: 'sack_pile', at: [px, z], y: LEVEL.street + 0.38, rot, rows: [3, 2] } : { t: 'jar_heap', at: [px, z], y: LEVEL.street + 0.38, rot, n: 4, rows: 2 });
  });
  // ---- landings down to the canal on both banks: granite steps
  for (const west of [true, false]) {
    for (let z = -420; z < 120; z += 31 + rand() * 12) {
      if (CANAL_BRIDGES.some((bz) => Math.abs(bz - z) < 12) || Math.abs(z - zs) < 18 || Math.abs(z - zn) < 18) continue;
      const fx = west ? CANAL.x0 + 0.35 : CANAL.x1 - 0.35, dir = [west ? 1 : -1, 0], hl = rand() < 0.4 ? 2.2 : 1.1;
      E.push({ t: 'water_steps', a: [fx, z - hl], b: [fx, z + hl], dir, y: LEVEL.street, water: LEVEL.canal, double: hl > 2, moor: true });
    }
  }
  // ---- the West Lake: its water over the bowl the ground makes (the causeway, pavilion and jetty are the landmark's), lotus in the shallows
  E.push({ t: 'water_rect', rect: WEST_LAKE.rect, y: WEST_LAKE.level });
  const shallows = (x, z) => { const d = lakeDepth(x, z); return d > WEST_LAKE.waterDepth + 1 && d < WEST_LAKE.waterDepth + 18; };
  for (const [cx, cz, r, n] of [[60, -290, 16, 70], [-60, -305, 16, 70], [-180, -300, 16, 70], [-290, -330, 14, 60]]) E.push({ t: 'lotus', c: [cx, cz], r, n, y: WEST_LAKE.level, seed: Math.floor(Math.abs(cx) * 7 + 3), inside: shallows });
  return base('song-hangzhou-city', E);
}

import { streetPlans } from './street.js';
import { wazisStatic, waziLife } from './wazi.js';

export async function town() {
  const chosen = interiorLots(), tea = new Set(teaHouses()), inter = new Set(Object.values(chosen).flat());
  const all = lots().filter((l) => !tea.has(l) && !inter.has(l)), plans = [];
  const order = [...all].sort((a, b) => b.detail - a.detail);
  const N = 120;
  for (let i = 0; i < order.length; i += N) plans.push(base(`song-hangzhou-houses-${i / N}`, order.slice(i, i + N).map((l) => ({ t: 'hz_house', y: LEVEL.street, ...l, simple: l.detail === 0 ? true : undefined }))));
  plans.push(base('song-hangzhou-streetside', streetsideElements(LAYOUT)));
  // the lots the life furnishes (life.js): their shells raised here, the floor 0.45 m over the street; the furniture is the life's
  const shells = [];
  for (const [kind, list] of Object.entries(chosen)) for (const l of list) shells.push({ t: 'hz_shell', rect: l.rect, front: l.front, y: LEVEL.street, kind, seed: l.seed, roof: l.roof });
  plans.push(base('song-hangzhou-shells', shells));
  plans.push(fabric(), ...tideDay(), boatPeople(), ...lifePlans(base));
  plans.push(...streetPlans(base));
  // the entertainment ground, the Way's sunshades and the ward gates (§24)
  plans.push(base('song-hangzhou-wazi', wazisStatic(LEVEL.street)));
  plans.push({ ...base('song-hangzhou-wazi-life', waziLife(LEVEL.street), 'life'), center: [72, -140], near: 200, rooms: [{ id: 'hz-wazi', rect: [66, -153, 78, -127], y: LEVEL.street, kind: 'winehouse' }] });
  return plans;
}
