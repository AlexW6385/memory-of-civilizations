// Conques about 1120 — the layout (docs/settlements/conques.md §2): a steep hillside facing south
// over the gorge of the Dourdou. The abbey church of Sainte-Foy on its terrace in the middle, the
// cloister to its south; the village on terraced shelves above and below it: each shelf (a "band", 22 m
// down the slope) holds a lane of cobbles with a row of houses on either side, held up on the downhill
// side by a retaining wall; stair streets climb across the shelves; the Dourdou at the bottom with its
// bridge. Pure data. +x east, +z south.

export const RADIUS = 360;
export const ABBEY = { origin: [-20, 0], terrace: [-50, -35, 60, 60] };
export const RIVER = { z: 235, w: 24, level: -44, bed: -48 };
export const BRIDGE = { x: -80 };
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
const riverZ = (x) => RIVER.z + 14 * Math.sin(x / 90);

// ── the shelves ──────────────────────────────────────────────────────────────
/** 14 bands of 22 m from z = −132: [0, 9] the north row, [9, 12] the lane, [12, 20.3] the south row, [20.7, 21.9] the retaining wall. */
export const BAND = { z0: -132, P: 22, n: 14, lane: [9, 12], wall: [20.7, 21.9], ramp: [20.8, 21.8] };
/** x of the stair streets (the middle one, −80, is the pilgrims' way up from the bridge: the Rue Charlemagne). */
export const STAIRS = [-134, -80, 88, 138];
export const STAIR = { tread: 2.2, cheek: 0.5, gap: 1.7 };       // half the clear width between the houses: the stair 1.1, a cheek 0.5, 0.1 over
const natural = (x, z) => {
  const rz = riverZ(x);
  let h = z < 0 ? -z * 0.13 : z < rz ? RIVER.level * (z / rz) ** 1.3 : RIVER.bed + (z - rz) * 0.5;
  if (z > rz - RIVER.w / 2 && z < rz + RIVER.w / 2) h = RIVER.bed;
  return h;
};
export const bandZ = (k) => BAND.z0 + BAND.P * k;
export const laneZ = (k) => bandZ(k) + (BAND.lane[0] + BAND.lane[1]) / 2;
const LEVEL = Array.from({ length: BAND.n }, (_, k) => natural(0, laneZ(k)));
/** The level of shelf k (its lane, its rows). */
export const level = (k) => LEVEL[Math.max(0, Math.min(BAND.n - 1, k))];
/** The shelf level at z: flat across each band, a step down at its retaining wall. */
export function shelf(z) {
  const k = Math.max(0, Math.min(BAND.n - 1, Math.floor((z - BAND.z0) / BAND.P))), u = z - bandZ(k) - 0 * 0;
  return LEVEL[k] + (k + 1 < BAND.n ? (LEVEL[k + 1] - LEVEL[k]) * smooth(BAND.ramp[0], BAND.ramp[1], u) : 0);
}
/** The stair street's profile: the lane's level at the lanes, a straight ramp between them. */
function stairProfile(z) {
  const k = Math.max(0, Math.min(BAND.n - 1, Math.floor((z - BAND.z0 - BAND.lane[1]) / BAND.P)));
  const a = laneZ(k) + 1.5, b = laneZ(k + 1) - 1.5;
  if (z <= a) return LEVEL[k];
  if (k + 1 >= BAND.n || z >= b) return LEVEL[Math.min(k + 1, BAND.n - 1)];
  return LEVEL[k] + (LEVEL[k + 1] - LEVEL[k]) * (z - a) / (b - a);
}
const stairW = (x) => { let w = 1; for (const sx of STAIRS) w = Math.min(w, smooth(STAIR.tread / 2 - 0.05, STAIR.tread / 2 + STAIR.cheek + 0.05, Math.abs(x - sx))); return w; };

/** The hillside: terraced inside the village, the natural slope outside it, falling south to the river, the far bank rising again. */
export function height(x, z) {
  let h;
  if (inRect(ABBEY.terrace, x, z)) h = 0;
  else {
    h = natural(x, z);
    const r = Math.hypot(x, z), v = (1 - smooth(175, 235, r)) * smooth(BAND.z0 - 6, BAND.z0 + 4, z) * (1 - smooth(bandZ(BAND.n) - 6, bandZ(BAND.n) + 4, z));
    if (v > 0) {
      const w = stairW(x), ht = stairProfile(z) * (1 - w) + shelf(z) * w;
      h += (ht - h) * v;
    }
    const t = Math.max(Math.abs(Math.max(ABBEY.terrace[0] - x, x - ABBEY.terrace[2], 0)), Math.abs(Math.max(ABBEY.terrace[1] - z, z - ABBEY.terrace[3], 0)));
    h *= smooth(0, 12, t);
  }
  return h * (1 - smooth(RADIUS - 90, RADIUS - 10, Math.hypot(x, z)));
}
export const inRiver = (x, z) => Math.abs(z - riverZ(x)) < RIVER.w / 2 - 2 && Math.hypot(x, z) < RADIUS - 95;
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

// ── the village ──────────────────────────────────────────────────────────────
const VILLAGE_R = 160;                                  // the houses stand within this (the class's 190 m with the gardens beyond)
const TERRACE_MARGIN = 13;                              // the slope under the terrace's edge (12 m) is not built on
/** The pilgrims' way: up the Rue Charlemagne's stair from the bridge, along the lane to the terrace's west edge (the shops stand along it). */
export const PILGRIM_WAY = { stair: STAIRS[1], z: [-30, 90], lane: [STAIRS[1], -62, laneZ(6)] };
/** The pilgrims' hostel, on the north side of the lane at the foot of the terrace, and the fountains. */
export const HOSTEL = { rect: [-78.3, bandZ(6) + 0.5, -63.3, bandZ(6) + BAND.lane[0]], front: 's' };
export const FOUNTAINS = [
  { id: 'plo', rect: [-48.9, -23.6, -47.6, -20.4], front: 'e', y: 0 },                                               // the Plò, beside the church's square (the spring "in front of the doors of the basilica")
  { id: 'fumouze', rect: [97, bandZ(8) + BAND.lane[1] + 0.4, 101.2, bandZ(8) + BAND.lane[1] + 1.7], front: 'n', y: level(8) },     // on the south side of the lane at the Porte de Fumouze
  { id: 'barry', rect: [-93.2, 187.4, -91.9, 190.6], front: 'e', y: null },                                                        // beside the road down to the bridge, near the lower suburb's workshops
];
const reserved = () => [HOSTEL.rect, [97, bandZ(8) + BAND.lane[1] + 0.2, 101.4, bandZ(8) + BAND.lane[1] + 3.4]];
/** The Rue Charlemagne's gate, a barrel-vaulted passage over the stair street below the last shelf (Porte du Barry). */
export const GATE = { x: STAIRS[1], z: bandZ(BAND.n) - 8, w: 4.6 };

/** The lower suburb's works (docs/settlements/conques.md §1k): a tanner's yard west of the road, a mill on the bank upstream of the washing-place. */
export const TANNERY = { rect: [-112, 195, -97, 205] };
const MILL_X = -27;
export const MILL = { cx: MILL_X, w: 6.4, d: 5.6, z1: riverZ(MILL_X) - 10.9, wheelR: 2.1 };
MILL.rect = [MILL_X - MILL.w / 2, MILL.z1 - MILL.d, MILL_X + MILL.w / 2, MILL.z1];
const maxH = (r, m = 0) => { let h = -Infinity; for (let x = r[0] - m; x <= r[2] + m; x += 1) for (let z = r[1] - m; z <= r[3] + m; z += 1) h = Math.max(h, height(x, z)); return h; };
/** The level of each yard: the highest ground in it and a margin north, so the terrace stands flush with the slope above it. */
export const worksLevel = () => ({ tannery: maxH([TANNERY.rect[0], TANNERY.rect[1] - 1.5, TANNERY.rect[2], TANNERY.rect[3]]) + 0.1, mill: maxH([MILL.rect[0] - 0.5, MILL.rect[1] - 3.0, MILL.rect[2] + 0.5, MILL.rect[3] - 1.0]) + 0.1 });
/** Places where nothing is planted: the works with their margins. */
export const WORKS = [[TANNERY.rect[0] - 1.5, TANNERY.rect[1] - 2.5, TANNERY.rect[2] + 2, TANNERY.rect[3] + 1.5], [MILL.rect[0] - 2.5, MILL.rect[1] - 4, MILL.rect[2] + 2.5, MILL.rect[3] + 0.5]];

const overlap = (a, b, m = 0) => a[0] < b[2] + m && a[2] > b[0] - m && a[1] < b[3] + m && a[3] > b[1] - m;
const UP_MAX = 30, UP_R = 95;                         // how many houses have their upper floor open, within what distance of the arrival
let LOTS = null, GARDENS = null;
function build() {
  LOTS = []; GARDENS = [];
  const rand = rng(1120);
  const route = (cx, cz) => Math.min(
    Math.abs(cx - PILGRIM_WAY.stair) + (cz > PILGRIM_WAY.z[0] && cz < PILGRIM_WAY.z[1] ? 0 : 60),
    Math.hypot(Math.max(PILGRIM_WAY.lane[0] - cx, cx - PILGRIM_WAY.lane[1], 0), cz - PILGRIM_WAY.lane[2]) + 8);
  for (let k = 0; k < BAND.n; k++) {
    const z0 = bandZ(k), y = level(k);
    for (const side of ['n', 's']) {
      // the north row faces south onto the lane; the south row faces north
      const front = side === 'n' ? 's' : 'n';
      const zf = side === 'n' ? z0 + BAND.lane[0] : z0 + BAND.lane[1];
      let x = -175;
      while (x < 175) {
        // a stair street cuts the row
        const st = STAIRS.find((sx) => x + 4.5 > sx - STAIR.gap && x < sx + STAIR.gap);
        if (st !== undefined) { x = st + STAIR.gap + 0.05; continue; }
        const w = 4.7 + rand() * 4.6, d = side === 'n' ? 7.0 + rand() * 1.4 : 6.8 + rand() * 1.4;
        let x1 = x + w;
        const cut = STAIRS.find((sx) => sx - STAIR.gap > x + 3.8 && sx - STAIR.gap < x1);
        if (cut !== undefined) x1 = cut - STAIR.gap - 0.05;
        const rect = side === 'n' ? [x, zf - d, x1, zf] : [x, zf, x1, zf + d];
        const cx = (x + x1) / 2, cz = (rect[1] + rect[3]) / 2, r = Math.hypot(cx, cz);
        x = x1 + 0.12 + (rand() < 0.25 ? 0.5 : 0);
        if (r > VILLAGE_R || x1 - rect[0] < 3.6 || inRect(ABBEY.terrace, cx, cz, TERRACE_MARGIN) || inRect(ABBEY.terrace, rect[0], cz, TERRACE_MARGIN) || inRect(ABBEY.terrace, rect[2], cz, TERRACE_MARGIN)) continue;
        if (reserved().some((q) => overlap(rect, q, 0.2))) continue;
        const dens = r < 100 ? 1 : 1 - 0.62 * smooth(100, VILLAGE_R, r);
        const seed = Math.floor(rand() * 1e9);
        if (rand() > dens) { if (r > 110) GARDENS.push({ rect: [rect[0], rect[1], rect[2], rect[3]], front, y, seed, k }); continue; }
        const Lw = rect[2] - rect[0], poor = r > 115 || rand() < 0.2;
        let storeys = poor ? (rand() < 0.5 ? 1 : 2) : rand() < 0.7 ? 2 : rand() < 0.5 ? 3 : 1;
        const near = route(cx, cz), shop = near < 36 && Lw >= 4.4 && rand() < 0.8;
        if (shop) storeys = Math.max(2, storeys);
        LOTS.push({
          rect, y, foot: y, front, seed, storeys, k,
          G: shop ? 2.9 : storeys === 1 ? 2.45 + rand() * 0.2 : 2.75 + rand() * 0.2, G2: 2.35 + rand() * 0.15,
          pitch: 0.95 + rand() * 0.2, ridgeAlong: Lw >= 6.2 || rand() < 0.55,
          stone: rand() < 0.22 ? 'limestone_yellow' : 'schist_rubble', twin: rand() < 0.35, gallery: storeys > 1 && rand() < 0.22, dormer: rand() < 0.3,
          shop, perron: front === 's' && storeys > 1 && Lw >= 7.4 && !shop && rand() < 0.55,
        });
      }
    }
  }
  // the hostel: a long hall of two floors
  const [hx0, hz0, hx1, hz1] = HOSTEL.rect;
  LOTS.push({ rect: [hx0, hz0, hx1, hz1], y: level(6), foot: level(6), front: 's', seed: 77, storeys: 2, k: 6, G: 3.1, G2: 2.5, pitch: 0.9, ridgeAlong: true, stone: 'schist_rubble', twin: true, gallery: false, dormer: false, shop: false, hostel: true });
  // the plots left between the houses (under the terrace's slope, and where a lot was too narrow): kitchen gardens where the shelf is flat
  const rowsOf = new Map();
  for (const l of [...LOTS, ...GARDENS]) { const key = l.k !== undefined ? l.k * 2 + (l.front === 's' ? 0 : 1) : null; if (key === null) continue; if (!rowsOf.has(key)) rowsOf.set(key, []); rowsOf.get(key).push(l); }
  for (const [key, list] of rowsOf) {
    list.sort((a, b) => a.rect[0] - b.rect[0]);
    for (let i = 0; i + 1 < list.length; i++) {
      const a = list[i], b = list[i + 1], g0 = a.rect[2], g1 = b.rect[0], W = g1 - g0, north = a.front === 's', zf = north ? a.rect[3] : a.rect[1];
      if (W < 5.6) continue;
      const n = Math.ceil(W / 9), w = W / n;
      for (let q = 0; q < n; q++) {
        const rect = north ? [g0 + q * w + 0.2, zf - 7.2, g0 + (q + 1) * w - 0.2, zf] : [g0 + q * w + 0.2, zf, g0 + (q + 1) * w - 0.2, zf + 7.2];
        const cx = (rect[0] + rect[2]) / 2, cz = (rect[1] + rect[3]) / 2;
        if (Math.hypot(cx, cz) > 150 || STAIRS.some((sx) => sx + STAIR.gap + 0.3 > rect[0] && sx - STAIR.gap - 0.3 < rect[2])) continue;
        let flat = true;
        for (let u = 0; u <= 4 && flat; u++) for (let v = 0; v <= 2; v++) if (Math.abs(height(rect[0] + (rect[2] - rect[0]) * u / 4, rect[1] + (rect[3] - rect[1]) * v / 2) - a.y) > 0.3) flat = false;
        if (flat && !inRect(ABBEY.terrace, cx, cz, 2)) GARDENS.push({ rect, front: north ? 's' : 'n', y: a.y, seed: Math.floor(rand() * 1e9) });
      }
    }
  }
  // the kinds of house, by their place (docs/settlements/conques.md §1k): rich ashlar houses near the church, barn-houses on the outer rows,
  // vintners' houses (the vine country, cellars in the rock) among them, herders on the high rows, fishers on the low rows toward the river
  const rk = rng(2718);
  for (const l of LOTS) {
    if (l.hostel || l.shop) continue;
    const [x0, z0, x1, z1] = l.rect, Lw = x1 - x0, cz = (z0 + z1) / 2, r = Math.hypot((x0 + x1) / 2, cz), roll = rk();
    if (l.perron) continue;
    if (r < 92 && Lw >= 7.0 && roll < 0.5) { l.kind = 'ashlar'; l.stone = 'limestone_yellow'; l.twin = true; l.storeys = Math.max(2, l.storeys); }
    else if (r >= 95 && Lw >= 6.2 && roll < 0.3) { l.kind = 'grange'; l.storeys = 2; l.G = 3.7; l.gallery = false; l.twin = false; }
    else if (r >= 50 && Lw >= 5.6 && roll >= 0.3 && roll < 0.5) l.kind = 'vintner';
    else if (cz < 30 && r > 70 && Lw >= 5.2 && roll >= 0.5 && roll < 0.66) l.kind = 'herder';
    else if (cz > 90 && Lw >= 5.2 && roll >= 0.5 && roll < 0.72) l.kind = 'fisher';
  }
  // chimneys: a stack at one end of the roof, set against the gable
  for (const l of LOTS) {
    const [x0, z0, x1, z1] = l.rect, f = l.front, along = f === 's' || f === 'n', Lw = along ? x1 - x0 : z1 - z0, D = along ? z1 - z0 : x1 - x0;
    const u = Lw > 6 && l.seed % 3 ? Lw - 0.8 : 0.8, v = D * 0.45;
    l.chim = f === 's' ? [x1 - u, z1 - v] : f === 'n' ? [x0 + u, z0 + v] : f === 'e' ? [x1 - v, z0 + u] : [x0 + v, z1 - u];
  }
  // the trades of the shops (a stream of its own: the lots stay as they were) — a pilgrim's town: its goods first
  const rt = rng(4711), TR = ['shells', 'staffs', 'bread', 'cloth', 'pots', 'tavern', 'smith', 'weaver'];
  for (const l of LOTS) if (l.shop) l.trade = TR[(l.seed + Math.floor(rt() * 3)) % TR.length];
  // the lots nearest the arrival, whose insides can be entered: the hostel, the shops along the pilgrims' way (each of the
  // trades once) and homes of two kinds
  const ax = -47, az = 12, dist = (l) => Math.hypot((l.rect[0] + l.rect[2]) / 2 - ax, (l.rect[1] + l.rect[3]) / 2 - az);
  const ok = (l) => !l.hostel && l.rect[2] - l.rect[0] >= (l.shop ? 5.4 : 4.6) && l.rect[3] - l.rect[1] >= 6.6 && l.storeys > 1;
  const sorted = LOTS.filter(ok).sort((a, b) => dist(a) - dist(b));
  const seen = new Set(), shops = [];
  for (const l of sorted.filter((q) => q.shop)) { if (shops.length >= 14) break; if (seen.has(l.trade) && shops.length < TR.length) continue; seen.add(l.trade); shops.push(l); }
  for (const l of sorted.filter((q) => q.shop && !shops.includes(q))) { if (shops.length >= 12) break; shops.push(l); }
  const homes = sorted.filter((l) => !l.shop && !l.perron).slice(0, 10);
  for (const l of shops) l.open = 'shop';
  homes.forEach((l, i) => { l.open = 'home'; l.homeKind = i % 3; });
  LOTS.find((l) => l.hostel).open = 'hostel';
  // beyond the first rows: the houses with a trade of their own, and a share of the others, can be entered too, furnished by their kind
  const KINDHOME = { grange: 4, vintner: 3, herder: 5, fisher: 6 }, ro = rng(3141);
  let more = 0, plain = 0;
  for (const l of LOTS) {
    if (l.open || l.hostel || l.shop || l.perron) continue;
    const [x0, z0, x1, z1] = l.rect, r = Math.hypot((x0 + x1) / 2, (z0 + z1) / 2), roll = ro();
    if (r > 150 || x1 - x0 < (l.kind === 'grange' ? 6.2 : 4.8) || z1 - z0 < 6.6) continue;
    const want = l.kind ? roll < 0.8 : roll < 0.2;
    if (!want || more >= 70) continue;
    l.open = 'home'; l.homeKind = KINDHOME[l.kind] ?? plain++ % 3; more++;
  }
  // the upper floors (docs/settlements/conques.md §1m): the open houses nearest the arrival, each by its kind, some with a balcony onto the lane
  const UPKIND = { ashlar: 'merchant', grange: 'hay', vintner: 'vintner', herder: 'herder', fisher: 'fisher' }, HOMEUP = ['family', 'spinner', 'farmer'];
  let ups = 0;
  for (const l of [...LOTS].filter((q) => q.open && q.storeys > 1).sort((a2, b2) => dist(a2) - dist(b2))) {
    if (ups >= UP_MAX || dist(l) > UP_R) break;
    l.up = l.hostel ? 'hostel' : l.open === 'shop' ? (l.trade === 'tavern' ? 'inn' : 'shop') : UPKIND[l.kind] ?? HOMEUP[l.homeKind % 3];
    l.bal = l.up === 'inn' || l.up === 'merchant' || l.up === 'hostel' || l.gallery || (l.up === 'shop' && l.seed % 3 === 0);
    ups++;
  }
}
/** The houses (and the hostel) on the shelves. */
export function lots() { if (!LOTS) build(); return LOTS; }
/** The yards and orchards where the outer rows have a gap: walled plots. */
export function gardens() { if (!GARDENS) build(); return GARDENS; }
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m)) || gardens().some((l) => inRect(l.rect, x, z, m));

// ── the lanes and the stairs ─────────────────────────────────────────────────
/** The lanes: [{ k, z, x0, x1 }] (their middle line z, between the stairs' ends; the lane is 3 m wide). Broken at the terrace. */
export function lanes() {
  const out = [];
  for (let k = 0; k < BAND.n; k++) {
    const z = laneZ(k), xr = Math.sqrt(Math.max(0, (VILLAGE_R + 6) ** 2 - z * z));
    if (xr < 10) continue;
    const t = ABBEY.terrace, inT = z > t[1] - TERRACE_MARGIN + 1 && z < t[3] + TERRACE_MARGIN - 1;
    const segs = inT ? [[-xr, t[0] - TERRACE_MARGIN + 0.5], [t[2] + TERRACE_MARGIN - 0.5, xr]] : [[-xr, xr]];
    for (const [a, b] of segs) if (b - a > 6) out.push({ k, z, x0: a, x1: b });
  }
  return out;
}
/** The stair streets: each from its first lane to its last, with its landings. [{ x, z0, z1, k0, k1 }] */
export function stairs() {
  return STAIRS.map((x) => {
    let k0 = 0, k1 = BAND.n - 1;
    while (k0 < BAND.n && Math.hypot(x, laneZ(k0)) > VILLAGE_R + 2) k0++;
    if (x !== STAIRS[1]) while (k1 > k0 && Math.hypot(x, laneZ(k1)) > VILLAGE_R + 2) k1--;
    return { x, k0, k1, z0: laneZ(k0), z1: laneZ(k1) };
  }).filter((s) => s.k1 > s.k0);
}
/** The streets as rectangles [x0, z0, x1, z1] (lanes and stairs, the parvis), for the walkers and the planting. */
export function streets() {
  const R = lanes().map((l) => [l.x0, l.z - 1.5, l.x1, l.z + 1.5]);
  for (const s of stairs()) R.push([s.x - 1.1, s.z0 - 1.5, s.x + 1.1, s.z1 + 1.5]);
  return R;
}
export const inStreet = (x, z, m = 0) => streets().some((r) => inRect(r, x, z, m));
