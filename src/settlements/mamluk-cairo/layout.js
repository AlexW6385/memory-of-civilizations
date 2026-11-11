// Mamluk Cairo about 1363 — the layout (docs/settlements/mamluk-cairo.md §2): the Madrasa of
// Sultan Hasan below the Citadel, facing the Rumayla square; the Citadel on its spur of the
// Muqattam to the east, walled with round towers, the Mosque of al-Nasir Muhammad inside; the
// dense city of mud-brick and stone houses round about. Pure data. +x east, +z south.

export const RADIUS = 480;
export const HASAN = { rect: [-75, 6, 75, 74], court: [-17, 24, 17, 56], tomb: [-16, 74, 16, 106] };
export const SQUARE = [80, -80, 170, 120];
export const CITADEL = { c: [280, 0], r: 105, top: 36 };
// the road up to the Citadel from the Rumayla: round the spur's western face, from the square's south-east
// corner (angle 140°, measured from +x toward +z round the Citadel's centre) to the gate at 220° (the north-west,
// where Bab al-Mudarraj stands), 8 m wide, its surface rising evenly to the top as it nears the walls
export const ROAD = { a0: 140, a1: 220, r0: 150, r1: 98, w: 4 };
/** The road's centre at angle a (degrees): [radius, height], or null outside its span. */
export function roadAt(a) {
  if (a < ROAD.a0 || a > ROAD.a1) return null;
  const t = (a - ROAD.a0) / (ROAD.a1 - ROAD.a0), r = ROAD.r0 + (ROAD.r1 - ROAD.r0) * t;
  return [r, CITADEL.top * Math.min(1, (ROAD.r0 - r) / (ROAD.r0 - CITADEL.r))];
}
const angleOf = (x, z) => { const a = Math.atan2(z - CITADEL.c[1], x - CITADEL.c[0]) * 180 / Math.PI; return a < 0 ? a + 360 : a; };
/** Is (x, z) on the road (within its width plus m)? */
export function onRoad(x, z, m = 0) { const q = roadAt(angleOf(x, z)); return !!q && Math.abs(Math.hypot(x - CITADEL.c[0], z - CITADEL.c[1]) - q[0]) < ROAD.w + m; }
// the covered market street north from the madrasa's portal (its axis at x = −37.5)
export const SUQ = [-45, -116, -30, -14];
// sabil-kuttabs on street corners: the crossing of the two lanes west of the madrasa, and the square's north-west corner
export const SABILS = [[-155.5, -115.5], [-165, -130], [74, -86], [-147, -222]];
// the merchant's house with its qa'a, open and furnished (docs/settlements/mamluk-cairo.md §10): west of the covered
// market street, its door on the lane beside it
export const QAA = [-69, -70, -47, -48];
// The Bayn al-Qasrayn (docs/settlements/mamluk-cairo.md §11): the widened stretch of the Qasaba (al-Mu'izz street, the lane
// at x = −160) with the complexes of Qalawun, al-Nasir Muhammad and Barquq on its west side, the Khan of al-Khalili on its east.
export const BAYN = [-174, -330, -146, -176];
export const QALAWUN = [-200, -245, -174, -178];
export const NASIR = [-198, -284, -174, -245];
export const BARQUQ = [-200, -326, -174, -284];
export const KHAN = [-146, -308, -104, -264];
// the khan's lanes: two covered market streets north–south behind it, a cross lane, the bath on the Qasaba south of the Bayn, the shop you can enter
export const SUQ2 = [-96, -312, -81, -190];
export const SUQ3 = [-74, -300, -59, -190];
export const CROSS = [-150, -195, -50, -185];
export const HAMMAM = [-155.5, -166, -131.5, -142];
export const SHOP = [-173, -165, -164, -156.5];
export const STALLS = [{ at: [-143.6, -240], face: 'w' }, { at: [92, 30], face: 'n' }];
export const STREETS = [[-164, -440, -156, 440], [-440, -125, 170, -115], [-45, -16, 100, -6], BAYN, SUQ, SUQ2, SUQ3, CROSS, SQUARE];
const KEEP = [BAYN, QALAWUN, NASIR, BARQUQ, KHAN, SUQ2, SUQ3, CROSS, HAMMAM, SHOP];
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
export function height(x, z) {
  const d = Math.hypot(x - CITADEL.c[0], z - CITADEL.c[1]);
  let h = CITADEL.top * smooth(CITADEL.r + 40, CITADEL.r, d);
  // the road: cut into the slope and built up on it, level across, blended into the hill beyond its walls
  const q = roadAt(angleOf(x, z));
  if (q) { const e = Math.abs(d - q[0]); if (e < ROAD.w + 1.5) h = q[1] + (h - q[1]) * smooth(ROAD.w, ROAD.w + 1.5, e); }
  return h * (1 - smooth(RADIUS - 50, RADIUS - 5, Math.hypot(x, z)));
}
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
// ── the city's blocks (docs/settlements/mamluk-cairo.md §13): houses in continuous rows, wall to wall, two rows back to back
// between the lanes; the lane the rows' fronts look on is 4.4–5 m wide (the upper storeys and mashrabiyas lean out over it),
// the gap behind 2 m; now and then a cross alley (derb) 2.4 m wide; the Qasaba and the east–west street are lined with
// shop fronts. The E–W street (z −125…−115) is the centre line from which the rows run north and south.
const MAIN = [[-164, -440, -156, 440], [-440, -125, 170, -115]];
const BLOCK = [[-90, -10, 90, 120, 6], [SQUARE[0], SQUARE[1], SQUARE[2], SQUARE[3], 4], [-45, -16, 100, -6, 1], BAYN.concat(1), SUQ.concat(1.5), SUQ2.concat(1), SUQ3.concat(1), CROSS.concat(1),
  QALAWUN.concat(2), NASIR.concat(2), BARQUQ.concat(2), KHAN.concat(2), HAMMAM.concat(2), SHOP.concat(2), QAA.concat(1.5)];
export const LANE_W = 4.6, BACK_W = 2.0, ALLEY_W = 2.4;
let LOTS = null, LANES = null, YARDS = null;
function build() {
  LOTS = []; LANES = []; YARDS = [];
  const rand = rng(1363), xmin = -RADIUS + 20, xmax = 170;
  // the rows: [z0, z1, front] from the street outward, alternating back gaps and fronts' lanes
  const rows = [];
  for (const dir of [1, -1]) {
    let z = dir > 0 ? -115 : -125, k = 0;
    for (;;) {
      const d = 9.5 + rand() * 1.5, a = dir > 0 ? z : z - d, b = dir > 0 ? z + d : z;
      if (Math.abs(dir > 0 ? b : a) > RADIUS - 45) break;
      // south of the street: n (street), s, n, s…; north of it: s (street), n, s, n…; the lane between a row and the next when the second faces the first
      rows.push({ z0: a, z1: b, front: (dir > 0) === (k % 2 === 0) ? 'n' : 's', k, dir });
      const lane = k % 2 === 1;                       // after the 2nd, 4th… row (k odd) a lane; after the 1st, 3rd… a back gap
      const gap = lane ? LANE_W + rand() * 0.4 : BACK_W;
      if (lane) LANES.push({ r: dir > 0 ? [xmin, b, xmax, b + gap] : [xmin, a - gap, xmax, a], kind: 'lane' }); else LANES.push({ r: dir > 0 ? [xmin, b, xmax, b + gap] : [xmin, a - gap, xmax, a], kind: 'back' });
      z = dir > 0 ? b + gap : a - gap; k++;
    }
  }
  // the blockers of a row: x-intervals [x0, x1, face] where the strip [z0, z1] meets a building, street or square (the Citadel's hill: a chord)
  const blockers = (z0, z1) => {
    const out = [];
    for (const m of MAIN) if (m[1] < z1 && m[3] > z0) out.push([m[0], m[2], m[0] === -164 ? 'q' : 's']);
    for (const [bx0, bz0, bx1, bz1, mg] of BLOCK) if (bz0 - mg < z1 + 0.5 && bz1 + mg > z0 - 0.5) out.push([bx0 - mg, bx1 + mg, bx0 === SQUARE[0] ? 'sq' : 'b']);
    const zc = Math.max(z0, Math.min(z1, CITADEL.c[1])), dz = Math.abs(zc - CITADEL.c[1]), R = CITADEL.r + 45;
    if (dz < R) { const ch = Math.sqrt(R * R - dz * dz); out.push([CITADEL.c[0] - ch, CITADEL.c[0] + ch, 'c']); }
    return out.sort((p, q) => p[0] - q[0]);
  };
  for (const row of rows) {
    const bl = blockers(row.z0, row.z1);
    // the free stretches of the row between the blockers
    const segs = []; let x = xmin, lb = null;
    for (const b of bl) { if (b[1] <= x) { lb = b; continue; } if (b[0] > x + 7.5) segs.push([x, Math.min(b[0], xmax), lb, b]); x = Math.max(x, b[1]); lb = b; }
    if (xmax - x > 7.5) segs.push([x, xmax, lb, null]);
    for (const [sx, ex, lbk, rbk] of segs) {
      if (ex - sx < 7.5 || (lbk?.[2] === 'c') || (rbk?.[2] === 'c' && false)) { if (ex - sx >= 4) YARDS.push([sx, row.z0, ex, row.z1]); continue; }
      // runs of 24–55 m between cross alleys, each cut into houses of 8.5–13 m, wall to wall
      let p = sx, first = true;
      while (p < ex - 0.01) {
        let q = Math.min(ex, p + 24 + rand() * 31);
        if (ex - q < 18) q = ex;                                   // no short tail run
        const len = q - p, n = Math.max(1, Math.round(len / 10.7)), ws = Array.from({ length: n }, () => 0.82 + rand() * 0.36), tot = ws.reduce((s, v) => s + v, 0);
        let x0 = p;
        for (let i = 0; i < n; i++) {
          const w = len * ws[i] / tot, x1 = x0 + w;
          let front = row.front;
          if (i === 0 && p === sx && (lbk?.[2] === 'q' || lbk?.[2] === 'sq')) front = 'w';
          if (i === n - 1 && q === ex && rbk?.[2] === 'q') front = 'e';
          const mid = [(x0 + x1) / 2, (row.z0 + row.z1) / 2];
          if (Math.hypot(mid[0], mid[1]) <= RADIUS - 45) LOTS.push({ rect: [x0, row.z0, x1, row.z1], seed: Math.floor(rand() * 1e6), y: 0, storeys: 2 + (rand() < 0.4 ? 1 : 0), court: null, front, plaster: rand(), row: row.k, dir: row.dir, street: row.k === 0 || front === 'w' || front === 'e' });
          x0 = x1;
        }
        p = q;
        if (p < ex - 12) { LANES.push({ r: [p, row.z0 - 0.2, p + ALLEY_W, row.z1 + 0.2], kind: 'alley' }); p += ALLEY_W; }
        first = false;
      }
      void first;
    }
  }
  // a few of the houses in the back rows are walled yards instead (a hosh with a palm, a well, a donkey's shed)
  for (const l of LOTS) if (!l.street && rand() < 0.07) l.yard = true;
}
export function lots() { if (!LOTS) build(); return LOTS; }
/** The lanes, back gaps and alleys of the blocks, cut where they run into buildings: [{ r: [x0, z0, x1, z1], kind }]. */
export function lanes() {
  if (!LOTS) build();
  if (LANES.cut) return LANES.cut;
  const out = [];
  for (const L of LANES) {
    if (L.kind === 'alley') { out.push(L); continue; }
    const [x0, z0, x1, z1] = L.r, cuts = [];
    for (const m of MAIN) if (m[1] < z1 && m[3] > z0) cuts.push([m[0], m[2]]);
    for (const [bx0, bz0, bx1, bz1, mg] of BLOCK) if (bz0 - mg < z1 && bz1 + mg > z0 && !(bx0 === SQUARE[0] || (bx0 === -90))) cuts.push([bx0 - mg, bx1 + mg]);
    for (const [bx0, bz0, bx1, bz1, mg] of BLOCK) if ((bx0 === -90 || bx0 === SQUARE[0]) && bz0 - mg < z1 && bz1 + mg > z0) cuts.push([bx0 - mg, bx1 + mg]);
    const zc = Math.max(z0, Math.min(z1, CITADEL.c[1])), dz = Math.abs(zc - CITADEL.c[1]), R = CITADEL.r + 45;
    if (dz < R) { const ch = Math.sqrt(R * R - dz * dz); cuts.push([CITADEL.c[0] - ch, CITADEL.c[0] + ch]); }
    cuts.sort((a, b) => a[0] - b[0]);
    let x = x0;
    for (const [c0, c1] of cuts) { if (c0 - x > 3) out.push({ r: [x, z0, c0, z1], kind: L.kind }); x = Math.max(x, c1); }
    if (x1 - x > 3) out.push({ r: [x, z0, x1, z1], kind: L.kind });
  }
  return (LANES.cut = out);
}
/** Walled yards (hosh) left among the blocks: [x0, z0, x1, z1]. */
export function yards() { if (!LOTS) build(); return [...YARDS, ...LOTS.filter((l) => l.yard).map((l) => l.rect)]; }
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));

// ── the trades of the shop fronts and which of them can be entered (docs §13)
const TRADES = [['spice', 3], ['cloth', 3], ['brass', 2], ['pottery', 2], ['grain', 2], ['sweets', 2], ['lamps', 1], ['butcher', 1]];
export function tradeOf(l) {
  const r = rng(l.seed + 11)(); let t = r * TRADES.reduce((a, [, w]) => a + w, 0);
  for (const [k, w] of TRADES) { t -= w; if (t <= 0) return k; }
  return 'spice';
}
let SHOPS = null;
/** The street lots (on the Qasaba and the E–W street) that are shop fronts, and of them the ones to enter: { fronts: [lot], open: [lot] }. */
export function shops() {
  if (SHOPS) return SHOPS;
  const all = lots().filter((l) => l.street && !l.yard && l.rect[2] - l.rect[0] >= 8 && l.rect[3] - l.rect[1] >= 9 && Math.hypot((l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2) < RADIUS - 70);
  const open = [], seen = new Set();
  for (const l of all.slice().sort((a, b) => (a.rect[0] + a.rect[1]) - (b.rect[0] + b.rect[1]))) {
    const c = [(l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2], key = Math.round(c[0] / 70) + ',' + Math.round(c[1] / 70);
    if (seen.has(key) || Math.hypot(c[0] + 160, c[1] + 120) > 260) continue;
    seen.add(key); open.push(l);
  }
  return (SHOPS = { fronts: all, open });
}
/** Sabats: rooms bridging the front lanes, where houses stand on both sides: [{ c: [x, z], span }]. */
export function sabats() {
  const out = [], rand = rng(777);
  for (const L of lanes()) {
    if (L.kind !== 'lane') continue;
    const [x0, z0, x1, z1] = L.r;
    for (let x = x0 + 14; x < x1 - 14; x += 38 + rand() * 30) {
      if (Math.hypot(x, (z0 + z1) / 2) > RADIUS - 70 || rand() < 0.35) continue;
      if (inLot(x, z0 - 1.0, 0) && inLot(x, z1 + 1.0, 0) && inLot(x - 1.6, z0 - 1.0) && inLot(x + 1.6, z1 + 1.0) && inLot(x + 1.6, z0 - 1.0) && inLot(x - 1.6, z1 + 1.0)) out.push({ c: [x, (z0 + z1) / 2], span: z1 - z0 + 1.0 });
    }
  }
  return out;
}
