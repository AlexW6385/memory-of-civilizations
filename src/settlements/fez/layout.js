// Fez el-Bali about 1350 — the layout (docs/settlements/fez.md §2): the medina in its valley under the
// Marinids. The Oued Fes runs west to east between stone quays across the south of the disc; the
// Talaa Kebira runs west to east along the north side of the valley from Bab Bou Jeloud (west) down
// to the Qarawiyyin (east), the Bou Inania madrasa on its south side, the funduq on its north side,
// the covered Attarine souk and the Kissaria at its east end; the Talaa Seghira parallel to it behind
// the madrasa; the Chouara tannery on the river's north bank east of the Qarawiyyin; between them the
// blocks of courtyard houses (riads) cut by the rows of lanes and by the derbs (dead-end lanes),
// round them the wall. Pure data, deterministic. +x east, +z south.

export const RADIUS = 330;
export const WALL_R = 304;                // the city wall (centre line)
export const CITY_R = 296;                // houses' centres lie inside this
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

// ——— the river
export const RIVER = { w: 5.6, bed: -2.4, water: -1.75, quay: 1.9, strip: 7.5 };
export const riverZ = (x) => 108 + 9 * Math.sin(x / 60 + 0.7);
export const riverD = (x, z) => Math.abs(z - riverZ(x));
export const inRiver = (x, z, m = 0) => riverD(x, z) < RIVER.w / 2 + m && Math.hypot(x, z) < RADIUS - 30;
/** The bridges over the Oued Fes: x of the deck's axis, its width. */
export const BRIDGES = [{ x: -75, w: 3.2 }, { x: 56, w: 3.6 }, { x: 152, w: 3.4 }, { x: 255, w: 3.0 }];
export const onBridge = (x, z) => BRIDGES.some((b) => Math.abs(x - b.x) < b.w / 2 + 0.3);

// ——— the sites (rects [x0, z0, x1, z1])
export const SITES = {
  bou: [-150, -19, -115, 20.5],                  // the Bou Inania madrasa, 35 × 39.5 (§4)
  daMagana: [-147, -38, -122, -23],              // the Dar al-Magana, facing it across the Talaa Kebira
  funduq: [-66, -56, -34, -23],                  // a funduq on the north side of the Talaa Kebira
  qar: [128, -44, 196, 22],                      // the Qarawiyyin: sahn, prayer hall, minaret (§5)
  seffarine: [88, 26, 116, 52],                  // the Place Seffarine, the coppersmiths
  tannery: [212, 46, 270, 92],                   // the Chouara tannery (§6)
  mosque: [4, -44, 30, -23],                     // a quarter mosque with its Marinid minaret on the Talaa Kebira
};
// the lanes that are streets by name (centre line z or x, width)
export const K = { z: -21, w: 4.0 };             // Talaa Kebira
export const S = { z: 22, w: 3.0 };              // Talaa Seghira
/** The covered souks: lane a→b along one axis, clear width, depth of the shops either side. */
export const SOUKS = [
  { id: 'attarine', a: [46, K.z], b: [128, K.z], w: K.w, depth: 3.4, gaps: [[82.2, 85.8], [110.2, 113.8]], trades: ['spice', 'perfume', 'henna', 'spice', 'candle', 'spice'], covered: true },
  { id: 'kissaria-a', a: [48, -2], b: [127, -2], w: 3.2, depth: 3.2, gaps: [[82.2, 85.8], [110.2, 113.8]], trades: ['cloth', 'cloth', 'slipper', 'cloth', 'embroidery', 'cloth'], covered: true },
  { id: 'kissaria-b', a: [84, -15.5], b: [84, 19], w: 3.0, depth: 3.0, gaps: [[-3.8, -0.2]], trades: ['slipper', 'cloth', 'cloth', 'brass'], covered: true },
  { id: 'kissaria-c', a: [112, -15.5], b: [112, 19], w: 3.0, depth: 3.0, gaps: [[-3.8, -0.2]], trades: ['cloth', 'leather', 'slipper', 'cloth'], covered: true },
];
const soukRect = (s) => {
  const [ax, az] = s.a, [bx, bz] = s.b, h = s.w / 2 + s.depth;
  return Math.abs(az - bz) < 0.1 ? [Math.min(ax, bx), az - h, Math.max(ax, bx), az + h] : [ax - h, Math.min(az, bz), ax + h, Math.max(az, bz)];
};
export const soukRects = () => SOUKS.map(soukRect);

// ——— the ground
const bank = (x, z) => {
  const rz = riverZ(x), dz = z - rz, side = dz < 0 ? 0.045 * -dz : 0.05 * dz;
  return Math.min(side, 15) - 0.018 * (x * smooth(14, 90, Math.abs(dz)));
};
function baseGround(x, z) {
  const d = riverD(x, z), h = bank(x, z);
  const c = RIVER.w / 2;
  if (d < c) return RIVER.bed;
  if (d < c + 0.9) return RIVER.bed + (bank(x, riverZ(x) + Math.sign(z - riverZ(x)) * (c + 0.9)) - RIVER.bed) * smooth(c, c + 0.9, d);
  return h;
}
/** The ground without the houses' levelling (where a lot's floor is taken from). */
export const ground0 = baseGround;

// ——— rows and lots
const BAND_DEPTHS = [30, 26, 36, 32, 28, 38, 34, 30];
function rows() {
  const R = [];
  // north of the Talaa Kebira
  let z = K.z, i = 0;
  const rand = rng(1350);
  R.push({ z: K.z, w: K.w, name: 'talaa kebira' });
  while (z > -RADIUS + 20) { z -= BAND_DEPTHS[i++ % BAND_DEPTHS.length] + rand() * 6; if (z > -RADIUS + 14) R.push({ z: Math.round(z * 2) / 2, w: 2.4 }); }
  R.push({ z: S.z, w: S.w, name: 'talaa seghira' });
  R.push({ z: 58, w: 2.6 }); R.push({ z: 88, w: 2.4 });
  // south of the river
  z = 128; i = 3;
  R.push({ z, w: 2.4, south: true });
  while (z < RADIUS - 24) { z += BAND_DEPTHS[i++ % BAND_DEPTHS.length] + rand() * 6; if (z < RADIUS - 20) R.push({ z: Math.round(z * 2) / 2, w: 2.4, south: true }); }
  return R.sort((a, b) => a.z - b.z);
}
const ROWS = rows();
export const ROWS_LIST = ROWS;

const rectsOverlap = (a, b, m = 0) => a[0] < b[2] + m && a[2] > b[0] - m && a[1] < b[3] + m && a[3] > b[1] - m;
/** The strips of the river and its quay lanes, in 20 m pieces. */
function riverStrips() {
  const out = [];
  for (let x = -RADIUS; x < RADIUS; x += 16) { const zr = Math.max(riverZ(x), riverZ(x + 16)), zl = Math.min(riverZ(x), riverZ(x + 16)); out.push([x, zl - RIVER.strip, x + 16, zr + RIVER.strip]); }
  return out;
}
const RIVER_STRIPS = riverStrips();
/** The rects the houses keep clear (with their margin: the lanes round them are the lots' own). */
function reserved() {
  const out = [];
  for (const [k, r] of Object.entries(SITES)) out.push({ id: k, r: k === 'seffarine' ? [r[0] - 3.8, r[1] - 0.4, r[2] + 3.8, r[3] + 3.8] : [r[0] - 0.4, r[1] - 0.4, r[2] + 0.4, r[3] + 0.4] });
  SOUKS.forEach((s, i) => out.push({ id: s.id, r: soukRect(s) }));
  RIVER_STRIPS.forEach((r, i) => out.push({ id: 'river' + i, r }));
  return out;
}
export const RESERVED = reserved();
export const inReserved = (x, z, m = 0) => RESERVED.some((q) => !q.id.startsWith('river') && inRect(q.r, x, z, m));

/** Clip a lot against the reserved rects: the largest piece left, or null. */
function clip(lot, res) {
  let r = lot;
  for (const q of res) {
    if (!rectsOverlap(r, q.r, 0.2)) continue;
    const g = 0.6, P = [[r[0], r[1], Math.min(r[2], q.r[0] - g), r[3]], [Math.max(r[0], q.r[2] + g), r[1], r[2], r[3]], [r[0], r[1], r[2], Math.min(r[3], q.r[1] - g)], [r[0], Math.max(r[1], q.r[3] + g), r[2], r[3]]];
    let best = null, ba = 0;
    for (const p of P) { const w = p[2] - p[0], d = p[3] - p[1]; if (w >= 7 && d >= 8 && w * d > ba) { best = p; ba = w * d; } }
    if (!best) return null;
    r = best;
  }
  return r;
}

let CACHE = null;
/** { lots, lanes, fills, squares } — the whole fabric, computed once. */
export function fabric() {
  if (CACHE) return CACHE;
  const rand = rng(1351), lots = [], lanes = [], fills = [], squares = [];
  const res = RESERVED;
  // the row lanes
  for (const row of ROWS) {
    const r = [-RADIUS + 6, row.z - row.w / 2, RADIUS - 6, row.z + row.w / 2];
    // cut by the reserved rects that stop them
    let pieces = [[r[0], r[2]]];
    for (const q of res) {
      if (q.id.startsWith('river') || q.id.startsWith('kissaria-b') || q.id.startsWith('kissaria-c')) continue;
      if (!(q.r[1] < row.z + row.w / 2 && q.r[3] > row.z - row.w / 2)) continue;
      if (q.id === 'attarine' || q.id === 'kissaria-a') continue;
      pieces = pieces.flatMap(([a, b]) => (q.r[2] < a || q.r[0] > b ? [[a, b]] : [[a, Math.min(b, q.r[0])], [Math.max(a, q.r[2]), b]])).filter(([a, b]) => b - a > 3);
    }
    for (const [a, b] of pieces) lanes.push({ r: [a, row.z - row.w / 2, b, row.z + row.w / 2], w: row.w, kind: row.name ? 'street' : 'lane', axis: 'x' });
  }
  const riverIdx = (z, x) => z > riverZ(x) - 14 && z < riverZ(x) + 14;
  // the bands between two rows
  for (let i = 0; i + 1 < ROWS.length; i++) {
    const A = ROWS[i], B = ROWS[i + 1];
    const za = A.z + A.w / 2, zb = B.z - B.w / 2;
    if (zb - za < 12) continue;
    if (A.z < riverZ(0) - 10 && B.z > riverZ(0) + 10) continue;         // the band the river crosses: the quay lanes below stand for it
    // columns: x boundaries
    let x = -RADIUS + 10;
    const derbs = [];
    const spines = BRIDGES.map((b) => b.x);
    const cuts = [];
    while (x < RADIUS - 10) { x += 14 + rand() * 20; cuts.push(Math.round(x)); }
    for (const sp of spines) cuts.push(sp);
    cuts.sort((p, q) => p - q);
    const cols = []; let c0 = -RADIUS + 8;
    for (const c of cuts) {
      if (c - c0 < 11 && !spines.includes(c)) continue;
      if (c - c0 < 8) { c0 = c; continue; }
      if (c > RADIUS - 8) break;
      const dw = spines.includes(c) ? 2.6 : 1.5 + rand() * 0.5, type = spines.includes(c) ? 'through' : rand() < 0.35 ? 'through' : rand() < 0.5 ? 'from-n' : 'from-s';
      derbs.push({ x: c, w: dw, type, len: 0.55 + rand() * 0.35 });
      cols.push([c0, c - dw / 2]); c0 = c + dw / 2;
    }
    cols.push([c0, RADIUS - 8]);
    const band = zb - za;
    for (const d of derbs) {
      const L = d.type === 'through' ? band : band * d.len, z0 = d.type === 'from-s' ? zb - L : za, z1 = d.type === 'from-s' ? zb : za + L;
      const lane = { r: [d.x - d.w / 2, z0 - (d.type === 'from-s' ? 0 : A.w / 2), d.x + d.w / 2, z1 + (d.type === 'from-n' || d.type === 'from-s' ? 0 : B.w / 2)], w: d.w, kind: 'derb', axis: 'z' };
      if (!res.some((q) => !q.id.startsWith('river') && rectsOverlap(lane.r, q.r, -0.1))) lanes.push(lane);
      else continue;
      if (d.type !== 'through') fills.push({ rect: d.type === 'from-s' ? [d.x - d.w / 2, za, d.x + d.w / 2, z0] : [d.x - d.w / 2, z1, d.x + d.w / 2, zb] });
    }
    // the houses of each column
    for (const [xa, xb] of cols) {
      let cx = xa;
      while (cx < xb - 6) {
        let w = 9 + rand() * 7; if (xb - cx - w < 8) w = xb - cx;
        const stacked = band > 31 + rand() * 5;
        const parts = stacked ? [[za, za + band * (0.46 + rand() * 0.1), 's'], [0, zb, 'n']] : [[za, zb, rand() < 0.5 ? 's' : 'n']];
        if (stacked) parts[1][0] = parts[0][1];
        for (const [pa, pb, door] of parts) {
          const lot = [cx, pa, cx + w, pb];
          const mx = (lot[0] + lot[2]) / 2, mz = (lot[1] + lot[3]) / 2;
          if (Math.hypot(mx, mz) > CITY_R) continue;
          const r = clip(lot, res);
          if (!r) continue;
          // the door faces the row lane the lot stands on
          const dd = r[3] - r[1] > (r[2] - r[0]) * 1.9 ? (rand() < 0.5 ? 'e' : 'w') : door;
          lots.push({ rect: r.map((v) => Math.round(v * 20) / 20), door: dd === 's' ? 's' : dd === 'n' ? 'n' : dd, seed: Math.floor(rand() * 1e6), storeys: rand() < 0.5 ? 3 : rand() < 0.8 ? 2 : 4 });
        }
        cx += w;
      }
    }
  }
  // the lots' doors: toward a lane that really touches (a row lane above or below, else a derb at a side)
  const lanesN = lanes.filter((l) => l.axis === 'x'), lanesD = lanes.filter((l) => l.axis === 'z');
  const touches = (l, e, m = 0.7) => lanesN.some((q) => q.r[2] > l.rect[0] + 2 && q.r[0] < l.rect[2] - 2 && Math.abs((e === 'n' ? l.rect[1] : l.rect[3]) - (e === 'n' ? q.r[3] : q.r[1])) < m)
    || (e === 'w' || e === 'e') && lanesD.some((q) => q.r[3] > l.rect[1] + 2 && q.r[1] < l.rect[3] - 2 && Math.abs((e === 'w' ? l.rect[0] : l.rect[2]) - (e === 'w' ? q.r[2] : q.r[0])) < m);
  const kept = [];
  for (const l of lots) {
    const w = l.rect[2] - l.rect[0], d = l.rect[3] - l.rect[1];
    const order = l.door === 's' ? ['s', 'n', 'e', 'w'] : l.door === 'n' ? ['n', 's', 'e', 'w'] : [l.door, 'n', 's', l.door === 'e' ? 'w' : 'e'];
    const e = order.find((q) => touches(l, q));
    if (!e) { fills.push({ rect: l.rect }); continue; }
    l.door = e; l.w = w; l.d = d;
    kept.push(l);
  }
  // fountains and small squares where a through derb meets a row: a lot left out
  CACHE = { lots: kept, lanes, fills, squares };
  indexLots(kept, fills);
  return CACHE;
}
// ——— the houses' levelling: each lot's floor is level, the lane's ground meets it by its wall
const GRID = 8, LOTMAP = new Map();
function indexLots(lots, fills) {
  LOTMAP.clear();
  const put = (r, y) => { for (let i = Math.floor(r[0] / GRID); i <= Math.floor(r[2] / GRID); i++) for (let j = Math.floor(r[1] / GRID); j <= Math.floor(r[3] / GRID); j++) { const k = i + ',' + j; if (!LOTMAP.has(k)) LOTMAP.set(k, []); LOTMAP.get(k).push({ r, y }); } };
  for (const l of lots) { l.y = lotY(l); l.foot = Math.min(...corners(l.rect).map(([a, b]) => baseGround(a, b))) - 0.4; put(l.rect, l.y); }
  for (const f of fills) { f.y = lotY(f); put(f.rect, f.y); }
  for (const [id, r] of Object.entries(SITES)) { if (id === 'seffarine') continue; put(r, siteYraw(id)); }
}
const corners = (r) => [[r[0], r[1]], [r[2], r[1]], [r[0], r[3]], [r[2], r[3]]];
function lotY(l) {
  const r = l.rect, e = l.door ?? 's';
  const p = e === 's' ? [(r[0] + r[2]) / 2, r[3] + 1.2] : e === 'n' ? [(r[0] + r[2]) / 2, r[1] - 1.2] : e === 'w' ? [r[0] - 1.2, (r[1] + r[3]) / 2] : [r[2] + 1.2, (r[1] + r[3]) / 2];
  return Math.round((baseGround(p[0], p[1]) + 0.12) * 20) / 20;
}
const SITE_FRONT = { bou: [-132.5, -22], daMagana: [-134.5, -21], funduq: [-50, -21], qar: [126, -21], seffarine: [102, 24], tannery: [210, 62], mosque: [17, -21] };
function siteYraw(id) { const p = SITE_FRONT[id]; return Math.round((baseGround(p[0], p[1]) + (id === 'bou' ? 0.42 : id === 'qar' ? 0.3 : 0.12)) * 20) / 20; }
const SY = {};
export const siteY = (id) => (SY[id] ??= siteYraw(id));
export const lots = () => fabric().lots;
export const lanes = () => fabric().lanes;
/** The ground's height at (x, z): the base valley, level under a house, beyond the wall falling to the open country. */
export function height(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS) return 0;
  fabric();
  const k = Math.floor(x / GRID) + ',' + Math.floor(z / GRID), L = LOTMAP.get(k);
  let h = baseGround(x, z);
  if (L) for (const q of L) if (inRect(q.r, x, z)) { h = q.y; break; }
  return h * (1 - smooth(RADIUS - 34, RADIUS, r));
}
export const inLot = (x, z, m = 0) => { fabric(); const L = LOTMAP.get(Math.floor(x / GRID) + ',' + Math.floor(z / GRID)); return !!L && L.some((q) => inRect(q.r, x, z, m)); };
export const onLane = (x, z, m = 0) => fabric().lanes.some((l) => inRect(l.r, x, z, m)) || SOUKS.some((s) => inRect(soukRect(s), x, z, m));
export const MOSQUE_FRONT = SITE_FRONT.mosque;
/** The quay walls' top along the river on both banks. */
export const quayY = (x, side) => bank(x, riverZ(x) + side * (RIVER.w / 2 + 1.0));
/** The fountains set in the lanes' walls: [x, z, face of the wall they stand on ('n' = a wall to the north of the lane)]. */
export function fountains() {
  const out = [], { lots: L } = fabric(), rand = rng(77);
  for (const l of L) {
    if (rand() > 0.1 || Math.hypot(l.rect[0], l.rect[1]) > 290) continue;
    const e = l.door, r = l.rect;
    // on the wall beside the door, 2 m off its corner
    const f = e === 's' ? [r[0] + 1.6, r[3], 's'] : e === 'n' ? [r[0] + 1.6, r[1], 'n'] : e === 'e' ? [r[2], r[1] + 1.6, 'e'] : [r[0], r[1] + 1.6, 'w'];
    out.push({ at: [f[0], f[1]], face: f[2], y: l.y });
  }
  return out;
}
