// Abbasid Baghdad about 800 — the layout (docs/settlements/abbasid-baghdad.md §2): Mansur's Round City on the Tigris's west bank,
// compressed to a radius of 300 m (the real one is some 1.2 km): the palace of the Golden Gate with its Green Dome and the Great
// Mosque at the centre, the esplanade round them, the inner wall, the ring of houses, the main wall with four gates, the fasil, the
// outer wall and the moat; the House of Wisdom on the esplanade; Karkh to the south beyond the Isa canal with its markets; the
// river suburb and the bridges of boats on the Tigris, east. The city is turned so that its gates, in reality on the diagonals, face
// the cardinal points: Khurasan east (toward the river), Basra south (toward Karkh), Kufa west, Sham north. Pure data. +x east, +z south.

export const RADIUS = 520;
export const C = [-110, -60];                       // the Round City's centre
export const RC = { outer: 298, outerTh: 3, outerH: 8, fasil: 284, main: 270, mainTh: 14, mainH: 20, ringOut: 262, ringIn: 214, inner: 208, innerTh: 5, innerH: 11, moat0: 306, moat1: 320, moatY: -1.5, moatBed: -3.2, gates: [0, 90, 180, 270] };
export const GATE = { W: 30.5, D: 16, w: 6.5, hh: 7.5, H: 20 };
export const WATER = -1.5;
// the landmark and what stands on the esplanade (rects [x0, z0, x1, z1])
export const PALACE = [C[0] - 38, C[1] - 38, C[0] + 38, C[1] + 38];
export const MOSQUE = [C[0] - 97, C[1] - 4, C[0] - 45, C[1] + 48];
export const LIBRARY = [C[0] + 50, C[1] - 40, C[0] + 90, C[1] - 6];
// the esplanade's service courts: the horse-guard barracks (north-west, toward the Sham gate), the diwans (offices), the kitchens, the children's palaces
export const SERVICE = [
  { rect: [C[0] - 150, C[1] - 150, C[0] - 100, C[1] - 108], use: 'barracks', face: 's', storeys: 1 },
  { rect: [C[0] - 150, C[1] + 70, C[0] - 104, C[1] + 112], use: 'diwan', face: 'n', storeys: 2 },
  { rect: [C[0] + 104, C[1] + 70, C[0] + 150, C[1] + 112], use: 'diwan', face: 'n', storeys: 2 },
  { rect: [C[0] + 104, C[1] - 150, C[0] + 148, C[1] - 104], use: 'kitchen', face: 's', storeys: 1 },
  { rect: [C[0] + 98, C[1] + 6, C[0] + 142, C[1] + 44], use: 'children', face: 'w', storeys: 2 },
  { rect: [C[0] - 144, C[1] - 56, C[0] - 108, C[1] - 8], use: 'children', face: 'e', storeys: 2 },
];
// the Tigris (its middle line) and the canal
export const RIVER = { w: 100, bed: -4.5, water: WATER };
export const riverX = (z) => 325 + 18 * Math.sin((z + 60) / 170);
export const BRIDGES = [{ z: C[1], name: 'Khurasan' }, { z: 392, name: 'Karkh' }];
export const CANAL = { z: 300, w: 14, bed: -3.2, water: WATER, x0: -430, x1: 0 };      // the Isa canal, running from the west to the Tigris
export const canalEnd = () => riverX(CANAL.z) - RIVER.w / 2;
export const CANAL_BRIDGES = [-110, -250, 40, 170];
// the markets of Karkh (docs §7): the main suq south from the canal bridge, the cross suq
export const SUQS = [
  { rect: [-117, 318, -103, 356], trades: ['paper'], name: 'warraqin' },
  { rect: [-117, 364, -103, 402], trades: ['spice'], name: 'attarin' },
  { rect: [-117, 410, -103, 448], trades: ['cloth'], name: 'bazzazin' },
  { rect: [-117, 456, -103, 494], trades: ['money', 'copper'], name: 'sarrafin' },
  { rect: [-262, 378, -124, 392], trades: ['copper', 'pottery'], name: 'saffarin' },
  { rect: [-96, 378, 46, 392], trades: ['fruit', 'grain'], name: 'fruit and grain' },
  { rect: [60, 318, 74, 356], trades: ['cloth', 'paper'], name: 'second row' },
];
// the inner ring's avenues, from the inner wall's gate road to the main wall's gate: arcaded streets of shops (docs §4, §12)
export const AVENUE_SUQS = [
  { rect: [C[0] - 262, C[1] - 7, C[0] - 216, C[1] + 7], trades: ['copper', 'pottery', 'grain'], name: 'west avenue' },
  { rect: [C[0] + 216, C[1] - 7, C[0] + 262, C[1] + 7], trades: ['cloth', 'spice', 'fruit'], name: 'east avenue' },
  { rect: [C[0] - 7, C[1] - 262, C[0] + 7, C[1] - 216], trades: ['paper', 'money', 'spice'], name: 'north avenue' },
  { rect: [C[0] - 7, C[1] + 216, C[0] + 7, C[1] + 262], trades: ['fruit', 'cloth', 'pottery', 'grain'], name: 'south avenue' },
];
export const ALL_SUQS = [...SUQS, ...AVENUE_SUQS];
// more to enter in Karkh, on the canal's quay street (their fronts to the north): the khan, the hammam and four workshops (docs §12)
export const KHAN_RECT = [-66, 314, -30, 354];
export const HAMMAM_RECT = [-14, 314, 0, 340];
export const WORKSHOPS = [{ rect: [14, 314, 24, 326], kind: 'bakery' }, { rect: [28, 314, 38, 326], kind: 'coppersmith' }, { rect: [42, 314, 52, 326], kind: 'perfumer' }, { rect: [-96, 314, -86, 326], kind: 'potter' }];
export const ENTERABLE = [KHAN_RECT, HAMMAM_RECT, ...WORKSHOPS.map((w) => w.rect)];
export const SHOP = [-148, 318, -138, 336];           // the bookseller's shop you can enter (a house-like room beside the paper suq)
// streets (rects) the walkers use and the lots keep clear of
const rc = (x0, z0, x1, z1) => [x0, z0, x1, z1];
export const AVENUES = [rc(C[0] - 270, C[1] - 7, C[0] - RC.inner, C[1] + 7), rc(C[0] + RC.inner, C[1] - 7, C[0] + 270, C[1] + 7), rc(C[0] - 7, C[1] - 270, C[0] + 7, C[1] - RC.inner), rc(C[0] - 7, C[1] + RC.inner, C[0] + 7, C[1] + 270)];
export const ROADS_IN = [rc(C[0] - 5, C[1] + 38, C[0] + 5, C[1] + RC.inner), rc(C[0] + 38, C[1] - 5, C[0] + RC.inner, C[1] + 5), rc(C[0] - RC.inner, C[1] - 5, C[0] - 38, C[1] + 5), rc(C[0] - 5, C[1] - RC.inner, C[0] + 5, C[1] - 38)];
// outside the walls: the roads from the gates over the causeways
export const ROADS_OUT = [rc(C[0] + 270, C[1] - 8, 272, C[1] + 8), rc(C[0] - 8, C[1] + 270, C[0] + 8, CANAL.z - 7), rc(C[0] - 8, 318, C[0] + 8, 494), rc(C[0] - 330, C[1] - 8, C[0] - 270, C[1] + 8), rc(C[0] - 8, C[1] - 330, C[0] + 8, C[1] - 270)];
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
export const rad = (x, z) => Math.hypot(x - C[0], z - C[1]);
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** Is a point on a gate's causeway (the moat is crossed by the earth there)? The gates face the cardinal points. */
export function onCauseway(x, z) {
  const dx = x - C[0], dz = z - C[1];
  return Math.min(Math.abs(dx), Math.abs(dz)) < 12;
}
export function inMoat(x, z) { const r = rad(x, z); return r > RC.moat0 - 0.5 && r < RC.moat1 + 0.5 && !onCauseway(x, z); }
export const inRiver = (x, z, m = 0) => Math.abs(x - riverX(z)) < RIVER.w / 2 + m;
export const inCanal = (x, z, m = 0) => Math.abs(z - CANAL.z) < CANAL.w / 2 + m && x > CANAL.x0 && x < canalEnd() + 1;

// ── the lots ──
// Double rows of houses between narrow lanes, each lot fronting a lane (or an avenue): a row facing north and the row behind it facing
// south, the next lane, and so on. `zone` decides whether a lot's rectangle is inside the district.
function rows({ x0, x1, z0, z1, dir = 1, dep = [16, 21], wd = [11, 17], lane = 3.6, seed, ok }) {
  const rand = rng(seed), out = [];
  let z = z0 + (dir > 0 ? 0 : 0);
  // dir +1: rows go south from z0 (the first lane at z0); dir −1: rows go north from z0
  for (let row = 0; ; row++) {
    const d = dep[0] + rand() * (dep[1] - dep[0]), face = (row % 2 === 0) === (dir > 0) ? 'n' : 's';
    const za = dir > 0 ? z : z - d, zb = dir > 0 ? z + d : z;
    if ((dir > 0 && za > z1) || (dir < 0 && zb < z1)) break;
    let x = x0;
    while (x < x1) {
      const w = wd[0] + rand() * (wd[1] - wd[0]), r = [x, za, x + w, zb];
      if (ok(r)) out.push({ rect: r, face, seed: Math.floor(rand() * 1e6), y: 0, storeys: rand() < 0.4 ? 2 : 1, tower: false, plot: row });
      x += w;
    }
    // after a back-to-back pair comes a lane
    z = dir > 0 ? z + d + (row % 2 === 1 ? lane : 0) : z - d - (row % 2 === 1 ? lane : 0);
  }
  return out;
}
const rectsOverlap = (a, b, m = 0) => a[0] < b[2] + m && a[2] > b[0] - m && a[1] < b[3] + m && a[3] > b[1] - m;
const corners = (r) => [[r[0], r[1]], [r[2], r[1]], [r[0], r[3]], [r[2], r[3]]];
let LOTS = null;
/** The houses of the whole settlement. */
export function lots() {
  if (LOTS) return LOTS;
  const keepOut = [PALACE, MOSQUE, LIBRARY, ...SERVICE.map((s) => s.rect), ...AVENUES, ...ROADS_IN, ...ROADS_OUT, ...SUQS.map((s) => s.rect), SHOP, ...ENTERABLE];
  const ringOk = (r) => corners(r).every(([x, z]) => { const q = rad(x, z); return q > RC.ringIn - 1.5 && q < RC.ringOut + 0.8; }) && !keepOut.some((k) => rectsOverlap(r, k, 1));
  const all = [];
  // the ring: north half going north from the avenue, south half going south (x spans the whole ring)
  all.push(...rows({ x0: C[0] - 270, x1: C[0] + 270, z0: C[1] - 9, z1: C[1] - 280, dir: -1, seed: 762, ok: ringOk, dep: [12, 17], wd: [9, 14] }));
  all.push(...rows({ x0: C[0] - 270, x1: C[0] + 270, z0: C[1] + 9, z1: C[1] + 280, dir: 1, seed: 763, ok: ringOk, dep: [12, 17], wd: [9, 14] }));
  // Karkh: blocks between the suqs, each with double rows from its north street
  const inDisc = (r) => corners(r).every(([x, z]) => Math.hypot(x, z) < RADIUS - 28);
  const zoneOk = (Z) => (r) => r[0] >= Z[0] && r[2] <= Z[2] && r[1] >= Z[1] - 0.1 && r[3] <= Z[3] && inDisc(r) && !keepOut.some((k) => rectsOverlap(r, k, 2));
  [[-330, 313, -121, 377], [-100, 313, 57, 377], [78, 313, 330, 500], [-330, 393, -121, 500], [-100, 393, 70, 500]].forEach((Z, i) => all.push(...rows({ x0: Z[0], x1: Z[2], z0: Z[1], z1: Z[3], dir: 1, seed: 773 + i, ok: zoneOk(Z), dep: [13, 18], wd: [10, 16] })));
  // the north side of the canal, between the moat and the canal: a strip of warehouses and quarters (the Karkh bank)
  all.push(...rows({ x0: -330, x1: 205, z0: 296, z1: 262, dir: -1, seed: 774, ok: (r) => r[3] < CANAL.z - 9 && corners(r).every(([x, z]) => rad(x, z) > RC.moat1 + 4 && Math.hypot(x, z) < RADIUS - 28) && !keepOut.some((k) => rectsOverlap(r, k, 2)) }));
  // the river suburb (the Khurasan road to the bridge): between the moat and the Tigris
  all.push(...rows({ x0: 214, x1: 268, z0: -200, z1: 160, dir: 1, seed: 800, ok: (r) => corners(r).every(([x, z]) => x < riverX(z) - RIVER.w / 2 - 6 && rad(x, z) > RC.moat1 + 4 && Math.hypot(x, z) < RADIUS - 24) && !keepOut.some((k) => rectsOverlap(r, k, 3)) && !(r[1] < C[1] + 10 && r[3] > C[1] - 10), wd: [10, 15] }));
  // the east bank
  all.push(...rows({ x0: riverX(0) + 60, x1: 470, z0: -220, z1: 200, dir: 1, seed: 801, ok: (r) => corners(r).every(([x, z]) => x > riverX(z) + RIVER.w / 2 + 8 && Math.hypot(x, z) < RADIUS - 26) && !(r[1] < C[1] + 12 && r[3] > C[1] - 12) && !(r[1] < 392 + 12 && r[3] > 392 - 12), wd: [11, 17] }));
  // the esplanade's service courts
  for (const s of SERVICE) all.push({ rect: s.rect, face: s.face, seed: Math.round(s.rect[0] * 7 + s.rect[1]), y: 0, storeys: s.storeys, tower: s.use === 'children', plot: -1, use: s.use });
  // tidy: a lot must not overlap another (the rows do not; the clipped edges might) — drop later ones that do
  LOTS = [];
  for (const l of all) if (!LOTS.some((m) => rectsOverlap(l.rect, m.rect, 0.2))) LOTS.push(l);
  // the open house: the ring house nearest the south avenue's east side, 2 storeys with a hollow north range (docs §10)
  return LOTS;
}
let BUCKET = null;
export function inLot(x, z, m = 0) {
  if (!BUCKET) { BUCKET = new Map(); for (const l of lots()) { const [a, b, c, d] = l.rect; for (let i = Math.floor(a / 40); i <= Math.floor(c / 40); i++) for (let j = Math.floor(b / 40); j <= Math.floor(d / 40); j++) { const k = i + ',' + j; if (!BUCKET.has(k)) BUCKET.set(k, []); BUCKET.get(k).push(l); } } }
  const list = BUCKET.get(Math.floor(x / 40) + ',' + Math.floor(z / 40));
  return !!list && list.some((l) => inRect(l.rect, x, z, m));
}
/** The streets (the lanes and avenues) as rectangles for the walkers: the avenues, the inner roads, the roads out, the suqs, the canal quay streets, and the bridges' roads. */
export function streets() {
  const out = [];
  for (const r of [...AVENUES, ...ROADS_IN, ...ROADS_OUT]) out.push({ r, weight: 1.4, market: 0.4, kind: 'street' });
  for (const s of ALL_SUQS) out.push({ r: s.rect, weight: 3, market: 1.5, kind: 'street' });
  // the esplanade: a loop of open ground round the palace (the guards, officials, scribes crossing)
  out.push({ r: rc(C[0] - 150, C[1] + 42, C[0] + 150, C[1] + 56), weight: 2.4, market: 0.5, kind: 'street' }, { r: rc(C[0] + 42, C[1] - 150, C[0] + 56, C[1] + 150), weight: 0.8, market: 0.1, kind: 'street' }, { r: rc(C[0] - 150, C[1] - 56, C[0] + 150, C[1] - 42), weight: 0.8, market: 0.1, kind: 'street' }, { r: rc(C[0] - 56, C[1] - 150, C[0] - 42, C[1] + 150), weight: 0.8, market: 0.1, kind: 'street' });
  // the quay street along the north bank of the canal and the road along the Tigris's west bank
  out.push({ r: rc(-330, CANAL.z - 14, canalEnd() - 4, CANAL.z - 8), weight: 1.0, market: 0.8, kind: 'street' });
  out.push({ r: rc(-330, CANAL.z + 8, canalEnd() - 4, CANAL.z + 14), weight: 0.8, market: 0.8, kind: 'street' });
  return out;
}

// ── the boats at their moorings (docs §9): jetties on the west bank and the east, the canal's quays ──
export const JETTIES = [-150, -20, 70, 150, 260, 330, 440].map((z) => ({ west: true, z })).concat([-130, 20, 110, 300].map((z) => ({ west: false, z })));
export const jettyAt = (j) => ({ a: [j.west ? riverX(j.z) - RIVER.w / 2 - 3 : riverX(j.z) + RIVER.w / 2 + 3, j.z], len: 16, dir: j.west ? 1 : -1 });
/** The moored boats: at the jetties' sides, some quffas near them, cargo barges in the canal. */
export function moored() {
  const rand = rng(762), out = [];
  for (const j of JETTIES) {
    const J = jettyAt(j), xm = J.a[0] + J.dir * (J.len - 4.5);
    for (const s of [-1, 1]) if (rand() < 0.8) out.push({ at: [xm + J.dir * rand() * 2, j.z + s * 2.0], rot: Math.PI / 2, kind: 'zawraq', load: ['jars', 'sacks', 'melons', null][Math.floor(rand() * 4)], L: 8.5 + rand() * 2, B: 2.4, seed: Math.floor(rand() * 1e6) });
    for (let k = 0; k < 2; k++) if (rand() < 0.6) out.push({ at: [xm + J.dir * (-6 - k * 3.4), j.z + (rand() - 0.5) * 5], rot: 0, kind: 'quffa', load: rand() < 0.5, seed: Math.floor(rand() * 1e6) });
  }
  // the canal: barges tied along the south quay, bows to the west
  for (let k = 0; k < 8; k++) { const x = -380 + k * 56 + rand() * 20; if (CANAL_BRIDGES.some((b) => Math.abs(b - x) < 22)) continue; out.push({ at: [x, CANAL.z + 3.2], rot: Math.PI / 2, kind: 'zawraq', load: ['sacks', 'jars', 'melons'][k % 3], L: 10, B: 2.7, seed: 900 + k }); }
  return out;
}
export const MOORED_HULL = (b) => (b.kind === 'quffa' ? { hl: 1.5, hw: 1.5 } : { hl: (b.L ?? 9) / 2 + 0.3, hw: (b.B ?? 2.4) / 2 + 0.2 });
