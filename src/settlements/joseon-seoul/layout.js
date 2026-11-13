// Joseon Hanyang (c. 1888) — the layout (docs/settlements/joseon-seoul.md §2, §12): Gyeongbokgung as
// rebuilt in 1865–68 on its north–south axis inside its wall, Gyeonghoeru's pond to the west,
// Hyangwonji with its round island north of it and Geoncheonggung beyond, Amisan's terraces behind
// the queen's hall, the avenue of the ministries south of Gwanghwamun ending at Jongno with its
// shops, hanok quarters round about, the ground rising toward Bugaksan in the north.
// Pure data. +x east, +z south.

export const RADIUS = 400;
export const PALACE = [-200, -300, 200, 236];
export const POND = [-172, -48, -78, 42];
export const ISLAND = [-145, -30, -105, 22];
export const AVENUE = [-14, 236, 14, 380];
export const MINISTRIES = [[-120, 252, -26, 300], [26, 252, 120, 300], [-120, 306, -26, 350], [26, 306, 120, 350]];
export const STREAM = { z0: 128, z1: 136 };
// Hyangwonji (4,605 m² in fact; ours about 4,350 m²) and its round island; Geoncheonggung north of it
export const HYANG = [-150, -182, -82, -118];
export const HISLE = { c: [-116, -150], r: 8 };
export const GEONCHEONG = [-178, -290, -62, -196];
// Amisan: the faces of its four terrace walls (z), their tops, the half-width of the terraces
export const AMISAN = { faces: [-204, -212, -220, -228], levels: [0.9, 1.8, 2.7, 3.6], hw: 42, back: -246 };
// Jongno: the street east and west from the avenue's end, the shop rows (sijeon) along its south side
export const JONGNO = [-150, 352, 150, 362];
export const SHOPS = [[-138, 362, -20, 368], [34, 362, 138, 368]];
// the yangban house you can walk into (styles/joseon/house.js), east of the ministries
export const YANGBAN = [148, 252, 171, 274];
export const BELL = [20, 362.5, 30, 368];
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
export const inPond = (x, z) => inRect(POND, x, z) && !inRect(ISLAND, x, z);
export const inHyang = (x, z) => inRect(HYANG, x, z) && Math.hypot(x - HISLE.c[0], z - HISLE.c[1]) > HISLE.r - 0.3;
/** Amisan's ground: the terraces stepping up northward (each step 1.5 m behind its wall's face, inside the wall), the mound falling away behind and at the sides. */
export function amisan(x, z) {
  const { faces, levels, hw, back } = AMISAN, ax = Math.abs(x);
  if (z > faces[0] || ax > 62 || z < -290) return 0;
  const hill = levels[3] * smooth(faces[3] - 4, back, z) * (1 - smooth(-252, -278, z));
  if (ax > hw) return hill * (1 - smooth(hw, 60, ax));
  if (z > faces[3] - 8) { let h = 0; for (let k = 0; k < 4; k++) if (z < faces[k] - 1.5) h = levels[k]; return h; }
  return levels[3] * (1 - smooth(-252, -278, z));
}
export const inStream = (x, z) => z > STREAM.z0 && z < STREAM.z1 && x > -150 && x < 150;
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
let LOTS = null;
/** Hanok lots of 16–24 m on lanes outside the palace wall and the ministries. */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(1430), S = 26;
  for (let x = -RADIUS; x < RADIUS; x += S) for (let z = -RADIUS; z < RADIUS; z += S) {
    // lots fill their cell right up to the lanes (2.6 m, the cell's seams): house walls make the street's two sides continuous
    const w = 20 + rand() * 2.4, d = 19.4 + rand() * 3, x0 = x + 2.8 + rand() * (22.4 - w) * 0.4, z0 = z + 2.8 + rand() * (22.4 - d) * 0.4, r = [x0, z0, x0 + w, z0 + d], cx = (r[0] + r[2]) / 2, cz = (r[1] + r[3]) / 2;
    if (Math.max(...[[r[0], r[1]], [r[2], r[1]], [r[0], r[3]], [r[2], r[3]]].map(([a, b]) => Math.hypot(a, b))) > RADIUS - 26) continue;
    if (inRect(PALACE, cx, cz, w / 2 + 10) || inRect(AVENUE, cx, cz, w / 2 + 3) || inRect([-160, 346, 160, 376], cx, cz, w / 2 + 2) || MINISTRIES.some((m) => inRect(m, cx, cz, w / 2 + 3))) continue;
    if (inRect(YANGBAN, cx, cz, w / 2 + 2)) continue;
    rand();
    LOTS.push({ rect: r, seed: Math.floor(rand() * 1e6), thatch: Math.hypot(cx, cz) > 300 ? rand() < 0.6 : rand() < 0.2 });
  }
  return LOTS;
}
let GRID = null;
export function inLot(x, z, m = 0) {
  if (!GRID) { GRID = new Map(); for (const h of lots()) for (let i = Math.floor((h.rect[0] - 3) / 26); i <= Math.floor((h.rect[2] + 3) / 26); i++) for (let j = Math.floor((h.rect[1] - 3) / 26); j <= Math.floor((h.rect[3] + 3) / 26); j++) { const k = i + ',' + j; if (!GRID.has(k)) GRID.set(k, []); GRID.get(k).push(h); } }
  const l = GRID.get(Math.floor(x / 26) + ',' + Math.floor(z / 26));
  return !!l && l.some((h) => inRect(h.rect, x, z, m));
}
/** The hanok lot whose rectangle holds the point, or null. */
export function lotAt(x, z, m = 0) {
  inLot(0, 0);
  const l = GRID.get(Math.floor(x / 26) + ',' + Math.floor(z / 26));
  return (l && l.find((h) => inRect(h.rect, x, z, m))) || null;
}
/** The lanes between the hanok lots (the 3 m gaps of the 26 m grid), cut where the palace, the ministries, Jongno and the yangban house stand: rectangles [x0, z0, x1, z1]. */
export function lanes() {
  const out = [], S = 26, blocked = (x, z) => inRect(PALACE, x, z, 6) || MINISTRIES.some((m) => inRect(m, x, z, 4)) || inRect(YANGBAN, x, z, 3) || inRect(AVENUE, x, z, 1) || inRect([-160, 346, 160, 376], x, z, 0) || z < -285 || Math.hypot(x, z) > RADIUS - 10;
  for (let g = -RADIUS; g < RADIUS; g += S) {
    for (let t = -RADIUS; t < RADIUS; t += S) {
      const mv = [g + 26.5, t + 13], mh = [t + 13, g + 26.5];
      if (!blocked(...mv)) out.push([g + 25.2, t, g + 27.8, t + S]);
      if (!blocked(...mh)) out.push([t, g + 25.2, t + S, g + 27.8]);
    }
  }
  return out;
}

/**
 * The palace's offices in the Heungnyemun court (docs/settlements/joseon-seoul.md §17): ranges of rooms with their backs to the cross wall of
 * the court (north of the Geumcheon) and to the stream's south bank, fronts to the south, on the outer sides of the officials' horses and
 * grooms: the clerks' offices, the guard-rooms of the gate, the waiting rooms of the officials, the pantries of the grooms and servants.
 * Each { org (the back's left end), face, L, kinds (the rooms by bay), use, seed } for styles/joseon/house.js's `joseon_range`. [inferred: their place and size]
 */
export const OFFICES = (() => {
  const BAY = 2.7, K = {
    clerk: [['sarangbang', 2], ['daecheong', 1], ['sarangbang', 2]], guard: [['kitchen', 1], ['room', 1], ['daecheong', 2]], wait: [['daecheong', 2], ['sarangbang', 2], ['room', 1]],
    store: [['kitchen', 1], ['daecheong', 2], ['room', 2]], clerk4: [['sarangbang', 2], ['daecheong', 2]], guard5: [['kitchen', 1], ['room', 2], ['daecheong', 2]],
    office: [['sarangbang', 2], ['room', 1], ['daecheong', 2]], pantry: [['kitchen', 1], ['daecheong', 2], ['room', 1]], room5: [['room', 2], ['sarangbang', 2], ['daecheong', 1]], serv: [['kitchen', 1], ['room', 1], ['sarangbang', 2]],
  };
  const out = [];
  const add = (x0, z, use, seed) => { const kinds = K[use], nb = kinds.reduce((a, k) => a + k[1], 0); out.push({ org: [x0, z], face: 's', L: nb * BAY, kinds, use, seed }); return x0 + nb * BAY; };
  const addW = (xEnd, z, use, seed) => { const nb = K[use].reduce((a, k) => a + k[1], 0); add(xEnd - nb * BAY, z, use, seed); return xEnd - nb * BAY; };
  // the row against the cross wall (z 92), east and west of the gate hall and the horses' standing
  let x = 38; x = add(x, 95.6, 'clerk', 1701) + 2.4; x = add(x, 95.6, 'guard', 1702) + 2.4; add(x, 95.6, 'wait', 1703);
  x = -38; x = addW(x, 95.6, 'store', 1704) - 2.4; x = addW(x, 95.6, 'clerk4', 1705) - 2.4; addW(x, 95.6, 'guard5', 1710);
  // the row on the stream's south bank
  x = 40; x = add(x, 141, 'office', 1706) + 2.4; add(x, 141, 'pantry', 1707);
  x = -40; x = addW(x, 141, 'room5', 1708) - 2.4; addW(x, 141, 'serv', 1709);
  return out;
})();
