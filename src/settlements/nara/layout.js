// Nara in 752 — the layout (docs/settlements/nara.md §2): Tōdai-ji at the eastern edge of the
// capital, the Great Buddha Hall in its corridored court, the Middle Gate south of it, the Great
// South Gate beyond, the twin seven-storey pagodas in their own courts east and west, the lecture
// hall and monks' quarters to the north; the grassy slope of Wakakusa rising to the east; the
// capital's blocks to the west and south on a grid of streets (docs/settlements/nara.md §11–§12). Pure data. +x east, +z south.

export const RADIUS = 340;
export const HALL = [-43, -85, 43, -35];
export const COURT = [-85, -120, 85, 40];
export const SOUTH_GATE = [-15, 140, 15, 152];
export const PAGODAS = [[-120, 90], [120, 90]];
export const TEMPLE = [-150, -190, 150, 160];
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
/** Level in the temple; the hills rising east (Wakakusa) and north-east. */
export function height(x, z) {
  const hill = 45 * smooth(165, 300, x) + 15 * smooth(-200, -380, z) * smooth(-50, 200, x);
  return (inRect(TEMPLE, x, z, 6) ? 0 : hill) * (1 - smooth(RADIUS - 120, RADIUS - 15, Math.hypot(x, z)));
}
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

// ── the capital's grid: avenues every 80 m (the axis avenue 18 m wide, the rest 10), blocks between them ──
const XL = [-320, -240, -160, -80, 0, 80, 160], ZL = [-320, -240, -160, -80, 0, 80, 160, 240, 320];
const half = (v, axis) => (axis === 'x' && v === 0 ? 9 : 5);
export const KOFUKU = { block: [-235, 5, -165, 75] };       // Kōfuku-ji's walled precinct (the block's rect, inner side of the walls)
export const MARKET = { block: [9, 165, 75, 235] };         // the East Market's square
const sameRect = (a, b) => a.every((v, i) => v === b[i]);
let BL = null;
/** The blocks: { rect, kind: 'ward' | 'kofuku' | 'market' }, those clear of the temple, within the radius and on level ground. */
export function blocks() {
  if (BL) return BL;
  BL = [];
  for (let i = 0; i < XL.length - 1; i++) for (let j = 0; j < ZL.length - 1; j++) {
    const r = [XL[i] + half(XL[i], 'x') + 0, ZL[j] + 5, XL[i + 1] - half(XL[i + 1], 'x'), ZL[j + 1] - 5];
    const cx = (r[0] + r[2]) / 2, cz = (r[1] + r[3]) / 2;
    if (inRect(TEMPLE, cx, cz, 8) || [[r[0], r[1]], [r[2], r[1]], [r[0], r[3]], [r[2], r[3]]].some(([x, z]) => inRect(TEMPLE, x, z, 2))) continue;
    if (Math.hypot(cx, cz) > RADIUS - 42 || Math.max(Math.hypot(r[0], r[1]), Math.hypot(r[2], r[3]), Math.hypot(r[0], r[3]), Math.hypot(r[2], r[1])) > RADIUS - 6 || height(cx, cz) > 1.5 || cx > 150) continue;
    const kind = sameRect(r, KOFUKU.block) ? 'kofuku' : sameRect(r, MARKET.block) ? 'market' : 'ward';
    BL.push({ rect: r, kind });
  }
  return BL;
}
let ST = null;
/** The streets: the strips between the blocks, as rects (only where a block stands beside them). */
export function streets() {
  if (ST) return ST;
  const seen = new Set(); ST = [];
  const add = (r) => { const k = r.join(','); if (!seen.has(k)) { seen.add(k); ST.push(r); } };
  for (const { rect: r } of blocks()) {
    const xa = XL.find((x) => x + half(x, 'x') === r[0]), xb = XL.find((x) => x - half(x, 'x') === r[2]), za = ZL.find((z) => z + 5 === r[1]), zb = ZL.find((z) => z - 5 === r[3]);
    add([xa - half(xa, 'x'), r[1] - 5, r[0], r[3] + 5]); add([r[2], r[1] - 5, xb + half(xb, 'x'), r[3] + 5]);
    add([r[0] - 5, za - 5, r[2] + 5, r[1]]); add([r[0] - 5, r[3], r[2] + 5, zb + 5]);
  }
  return ST;
}
export const inStreet = (x, z, m = 0) => streets().some((r) => inRect(r, x, z, m));
export const inBlock = (x, z, m = 0) => blocks().some((b) => inRect(b.rect, x, z, m));

let LOTS = null, WALLS = null, YARDS = null;
function build() {
  LOTS = []; WALLS = []; YARDS = [];
  const rand = rng(752);
  for (const { rect: [bx0, bz0, bx1, bz1], kind } of blocks()) {
    const cx = (bx0 + bx1) / 2, cz = (bz0 + bz1) / 2;
    if (kind === 'market') continue;
    // the tsuiji (earthen wall with a tiled coping) round the block, a gate in the middle of each side but the bare ones
    const G = (a, b, at) => ({ a, b, gate: at });
    WALLS.push(G([bx0, bz0], [bx1, bz0], [cx, bz0]), G([bx1, bz0], [bx1, bz1], [bx1, cz]), G([bx1, bz1], [bx0, bz1], [cx, bz1]), G([bx0, bz1], [bx0, bz0], [bx0, cz]));
    if (kind === 'kofuku') continue;
    // houses in four rows on two lanes (the rows face the lanes), a garden with a well between the pairs
    const rows = [[3, 's'], [17, 'n'], [44, 's'], [58, 'n']];
    for (const [off, front] of rows) {
      let x = bx0 + 3 + rand() * 2;
      while (x < bx1 - 12) {
        const w = 8.6 + rand() * 2.6, d = 8 + rand() * 1.4, z0 = front === 's' ? bz0 + off : bz0 + off + 9 - d;
        if (x + w > bx1 - 3) break;
        if (rand() > 0.22) LOTS.push({ rect: [x, z0, x + w, z0 + d], seed: Math.floor(rand() * 1e6), y: 0, foot: -0.2, front });
        x += w + 1.0 + rand() * 1.2;
      }
    }
    YARDS.push([cx + (rand() - 0.5) * 20, bz0 + 35]);
  }
  // the East Market's rim: a few shop houses on the square's north and west edges (the square is left open)
  const [mx0, mz0, mx1] = MARKET.block;
  for (let x = mx0 + 2; x < mx1 - 10; x += 10.5 + rand() * 1.5) LOTS.push({ rect: [x, mz0 + 1, x + 9.5, mz0 + 9.5], seed: Math.floor(rand() * 1e6), y: 0, foot: -0.2, front: 's', shop: true });
}
/** Houses of the capital on the grid's blocks. */
export function lots() { if (!LOTS) build(); return LOTS; }
/** The walls round the blocks: { a, b, gate: [x, z] }. */
export function walls() { if (!WALLS) build(); return WALLS; }
export function yards() { if (!YARDS) build(); return YARDS; }
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));
