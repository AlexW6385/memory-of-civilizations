// Abbasid Baghdad — the townscape (docs/settlements/abbasid-baghdad.md §2–§9): the three round walls with their gates and the moat, the
// houses (courtyard houses by rule, in 100 m tiles near and far), the esplanade's service courts, the markets of Karkh as suq rows with the
// bookseller's shop to enter, the Isa canal with its bridges and barges, the Tigris with its bridges of boats, jetties and boats,
// and the people and goods of the streets (a life plan).
import '../../styles/abbasid/index.js';
import '../../objects/index.js';
import { suqKeepers } from '../../styles/abbasid/market.js';
import { khanRooms, hammamRooms, worldRect, KHAN, HAMMAM } from '../../styles/abbasid/khan.js';
import { KHAN_RECT, HAMMAM_RECT, WORKSHOPS, ALL_SUQS, RADIUS, RC, GATE, C, PALACE, MOSQUE, LIBRARY, SUQS, SHOP, RIVER, CANAL, CANAL_BRIDGES, BRIDGES, WATER, JETTIES, lots, moored, jettyAt, riverX, canalEnd, inRect } from './layout.js';
import { lifePlan } from './life.js';

const base = (id, elements, style = 'abbasid') => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [C[0], C[1] + 60], facing: 'n' } });
const YAW = { s: 0, n: Math.PI, e: Math.PI / 2, w: -Math.PI / 2 };
/** A local point of a house (its rect's middle, turned by its face) in the world. */
export function houseToWorld(l, x, z) {
  const cx = (l.rect[0] + l.rect[2]) / 2, cz = (l.rect[1] + l.rect[3]) / 2, a = YAW[l.face], c = Math.round(Math.cos(a)), s = Math.round(Math.sin(a));
  return [cx + x * c + z * s, cz - x * s + z * c];
}
/** The houses in 200 m tiles, each built near and far (like ../lod.js, whose tiles are 100 m): the plans share their materials, so fewer meshes. */
function bigTiles(id, style, elements, { near = 270, R = 460, entrance, size = 200 } = {}) {
  const tiles = new Map();
  for (const e of elements) {
    const x = (e.rect[0] + e.rect[2]) / 2, z = (e.rect[1] + e.rect[3]) / 2, k = `${Math.floor(x / size)},${Math.floor(z / size)}`;
    if (!tiles.has(k)) tiles.set(k, []);
    tiles.get(k).push(e);
  }
  const plans = [];
  for (const [k, list] of tiles) {
    const [i, j] = k.split(',').map(Number), center = [i * size + size / 2, j * size + size / 2];
    const b = { style, origin: [0, 0], base: 0, yaw: 0, feature: true, rooms: [], bounds: [-R, -R, R, R], entrance, center };
    plans.push({ ...b, id: `${id}-${k}`, near, elements: list });
    plans.push({ ...b, id: `${id}-${k}-far`, far: near, elements: list.map((e) => ({ ...e, simple: true })), nocollide: true });
  }
  return plans;
}
const norm = (a, b) => [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])];

/** The houses kept open: ring houses on the south avenue and in Karkh, each with its north range and both side ranges hollow and furnished (§10). */
const OPEN_AT = [[C[0] + 24, C[1] + 232], [C[0] - 30, C[1] + 232], [C[0] + 232, C[1] + 30], [C[0] - 232, C[1] - 30], [-60, 352], [-190, 355], [30, 430], [-60, 520]];
export function openHouses() {
  const used = new Set(), out = [];
  for (const want of OPEN_AT) {
    const l = lots().filter((q) => !used.has(q) && q.plot >= 0 && q.rect[2] - q.rect[0] >= 12 && q.rect[3] - q.rect[1] >= 15 && (q.face === 'n' || q.face === 's' || out.length > 3)).sort((p, q) => Math.hypot((p.rect[0] + p.rect[2]) / 2 - want[0], (p.rect[1] + p.rect[3]) / 2 - want[1]) - Math.hypot((q.rect[0] + q.rect[2]) / 2 - want[0], (q.rect[1] + q.rect[3]) / 2 - want[1]))[0];
    if (l) { used.add(l); out.push(l); }
  }
  return out;
}
export const openHouse = () => openHouses()[0];

export async function town() {
  const plans = [], all = lots(), opens = openHouses();
  // ── the walls, gates and moat ──
  const walls = [];
  const gates = RC.gates;
  walls.push({ t: 'ring_wall', c: C, r: RC.outer, th: RC.outerTh, h: RC.outerH, mat: 'mudbrick', gap: 13, gates, n: 24, crenel: true, towers: { every: 3, r: 2.8, out: 3.2, h: 2 }, seed: 11 });
  walls.push({ t: 'ring_wall', c: C, r: RC.main, th: RC.mainTh, h: RC.mainH, mat: 'brick_baked', gap: GATE.W, gates, n: 24, crenel: true, loops: 6, band: true, towers: { every: 2, r: 4.4, out: 8.6, h: 3 }, seed: 12 });
  walls.push({ t: 'ring_wall', c: C, r: RC.inner, th: RC.innerTh, h: RC.innerH, mat: 'brick_baked', gap: 14, gates, n: 16, crenel: true, towers: { every: 2, r: 3.2, out: 4.2, h: 2 }, seed: 13 });
  walls.push({ t: 'moat', c: C, r0: RC.moat0, r1: RC.moat1, y: RC.moatY, gap: 24, gaps: gates, n: 20 });
  for (const f of gates) {
    const at = (r) => [C[0] + Math.cos(f * Math.PI / 180) * r, C[1] + Math.sin(f * Math.PI / 180) * r];
    walls.push({ t: 'round_gate', at: at(RC.main), face: f, ...GATE, kiosk: true, mat: 'brick_baked' });
    walls.push({ t: 'round_gate', at: at(RC.outer), face: f, D: 6, w: 5, hh: 6, H: 8.5, W: 13, kiosk: false, bast: 0, mat: 'mudbrick' });
    walls.push({ t: 'round_gate', at: at(RC.inner), face: f, D: 7, w: 5.5, hh: 6.5, H: 11, W: 14, kiosk: false, bast: 0, mat: 'brick_baked' });
  }
  plans.push({ ...base('abbasid-baghdad-walls', walls), bounds: [C[0] - 330, C[1] - 330, C[0] + 330, C[1] + 330] });
  // ── the houses, near and far ──
  const houses = all.filter((l) => !opens.includes(l)).map((l) => ({ t: 'abbasid_house', ...l }));
  plans.push(...bigTiles('abbasid-baghdad-houses', 'abbasid', houses, { R: RADIUS, entrance: { at: [C[0], C[1] + 60], facing: 'n' } }));
  // the open houses: court, north range and the side ranges, furnished
  opens.forEach((open, i) => {
    const w = (a, b) => houseToWorld(open, a, b), turned = open.face === 's' || open.face === 'n', sw = turned ? open.rect[2] - open.rect[0] : open.rect[3] - open.rect[1], sd = turned ? open.rect[3] - open.rect[1] : open.rect[2] - open.rect[0];
    const hw = sw / 2, hd = sd / 2, bd = Math.min(4.8, sd * 0.3), sdp = Math.min(3.4, sw * 0.22), fd = Math.min(3.6, sd * 0.25);
    const court = norm(w(-hw + sdp, -hd + bd), w(hw - sdp, hd - fd)), north = norm(w(-hw + 0.6, -hd + 0.6), w(hw - 0.6, -hd + bd));
    const west = norm(w(-hw + 0.6, -hd + 0.6), w(-hw + sdp, hd - fd)), east = norm(w(hw - sdp, -hd + 0.6), w(hw - 0.6, hd - fd));
    plans.push({ ...base(`abbasid-baghdad-open-house${i ? i : ''}`, [{ t: 'abbasid_house', ...open, open: true, storeys: 2, tower: i % 2 === 0 }]), bounds: [open.rect[0] - 3, open.rect[1] - 3, open.rect[2] + 3, open.rect[3] + 3],
      rooms: [{ id: 'house court', rect: court, y: 0, kind: 'open' }, { id: 'court room', rect: north, y: 0, kind: 'hall' }, { id: 'west range', rect: west, y: 0, kind: 'hall' }, { id: 'east range', rect: east, y: 0, kind: 'hall' }] });
  });
  // ── the markets: the suq rows, the bookseller's shop ──
  ALL_SUQS.forEach((s, i) => plans.push({ ...base(`abbasid-baghdad-suq${i}`, [{ t: 'suq_row', rect: s.rect, trades: s.trades, seed: 773 + i * 17, axis: s.rect[2] - s.rect[0] > s.rect[3] - s.rect[1] ? 'x' : 'z' }]), bounds: [s.rect[0] - 3, s.rect[1] - 3, s.rect[2] + 3, s.rect[3] + 3] }));
  plans.push({ ...base('abbasid-baghdad-shop', [{ t: 'abbasid_shop', rect: SHOP, face: 'e', y: 0, seed: 799 }]), bounds: [SHOP[0] - 3, SHOP[1] - 3, SHOP[2] + 3, SHOP[3] + 3], rooms: [{ id: 'bookshop', rect: [SHOP[0] + 0.6, SHOP[1] + 0.6, SHOP[2] - 0.6, SHOP[3] - 0.6], y: 0.02, kind: 'hall' }] });
  // ── the khan, the hammam, the workshops of the quay street ──
  {
    const ctr = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2], bnd = (r) => [r[0] - 3, r[1] - 3, r[2] + 3, r[3] + 3];
    const kc = ctr(KHAN_RECT), hc = ctr(HAMMAM_RECT);
    plans.push({ ...base('abbasid-baghdad-khan', [{ t: 'abbasid_khan', rect: KHAN_RECT, face: 'n', y: 0, seed: 71 }]), bounds: bnd(KHAN_RECT),
      rooms: [{ id: 'khan court', rect: worldRect('n', kc, [-KHAN.W / 2 + 6, -KHAN.D / 2 + 6, KHAN.W / 2 - 6, KHAN.D / 2 - 6]), y: 0, kind: 'open' }, ...khanRooms().map((r) => ({ id: r.id, rect: worldRect('n', kc, r.rect), y: 0, kind: 'hall' }))] });
    plans.push({ ...base('abbasid-baghdad-hammam', [{ t: 'abbasid_hammam', rect: HAMMAM_RECT, face: 'n', y: 0, seed: 88 }]), bounds: bnd(HAMMAM_RECT), rooms: hammamRooms().map((r) => ({ id: r.id, rect: worldRect('n', hc, r.rect), y: 0, kind: 'hall' })) });
    WORKSHOPS.forEach((w, i) => plans.push({ ...base(`abbasid-baghdad-work${i}`, [{ t: 'abbasid_workshop', rect: w.rect, face: 'n', kind: w.kind, y: 0, seed: 90 + i }]), bounds: bnd(w.rect), rooms: [{ id: `${w.kind} workshop`, rect: [w.rect[0] + 0.6, w.rect[1] + 0.6, w.rect[2] - 0.6, w.rect[3] - 0.6], y: 0, kind: 'hall' }] }));
  }
  // ── the water: the river, the canal, the bridges, the jetties and the boats ──
  const pts = []; for (let z = -540; z <= 540; z += 30) pts.push([riverX(z), z]);
  const river = [{ t: 'tigris', pts, w: RIVER.w + 3, y: WATER }, { t: 'canal', rect: [CANAL.x0, CANAL.z - CANAL.w / 2, canalEnd() + 2, CANAL.z + CANAL.w / 2], y: CANAL.water, bed: CANAL.bed, along: 'x' }];
  for (const x of CANAL_BRIDGES) river.push({ t: 'canal_bridge', at: [x, CANAL.z], span: CANAL.w, deck: 2.5, y: CANAL.water, rot: Math.PI / 2, width: 7 });
  for (const b of BRIDGES) river.push({ t: 'boat_bridge', a: [riverX(b.z) - RIVER.w / 2, b.z], b: [riverX(b.z) + RIVER.w / 2, b.z], w: 4.4, y: -0.1, water: WATER, bed: RIVER.bed, seed: b.z });
  for (const j of JETTIES) { const J = jettyAt(j); river.push({ t: 'jetty', a: J.a, len: J.len, dir: J.dir, y: -0.2, bed: RIVER.bed, w: 2.4 }); }
  for (const m of moored()) river.push({ t: 'moored_boat', ...m, y: WATER });
  plans.push({ ...base('abbasid-baghdad-water', river), bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS] });
  plans.push(...(await lifePlan()));
  return plans;
}
void inRect; void MOSQUE; void PALACE; void LIBRARY; void suqKeepers;
