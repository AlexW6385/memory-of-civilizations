// The routes walk-check follows into the opened places of the visitor's walk (walk.js): the whole way from the arrival to the market tower, and in at the
// door of each opened place on it — the service quarters' row and store houses, the avenue's offices, the East Market's shops (in at the counter's flap).
// A pure function of the layout; the doors are read from the style's own builders (houseDoors) and from the shop row's own numbers (market.js).
import { lots, inService, serviceKind, enterable, wardKind, rankOf, marketShops, EAST_MARKET, WEST_MARKET } from './layout.js';
import { WALK, ARRIVAL, WALK_REACH, OFFICE_REACH, walkDistance, frontPoint } from './walk.js';
import { houseDoors } from '../../styles/hanlodge/index.js';
import { STYLES } from '../../core/build.js';
import { lotFrame } from '../../styles/han/kit.js';

const NOOP = new Proxy({}, { get: () => () => {} });
const frame = (rect, front) => lotFrame({ bag: NOOP, col: NOOP }, rect, front);
const SEED_SHOP = 700;                                                 // the East Market's shop rows (town.js)

/** The whole way: the arrival at the ramp's head to the market tower (one route, y0 the arrival's floor). */
export function mainRoute() {
  const r = [[ARRIVAL[0], ARRIVAL[1]], [-110, -91.5], [-110, -76], [-60, -75.75], [-36.5, -75.75], [-33, -80], [-33, -104], [100, -104], [150, -104], [150, -262], [190, -262], [190, -280], [203, -280], [252, -280]];
  r.y0 = 7.3;
  return r;
}

/** The branch to the first lane of the south row's second ward (through the palace's south gate). */
export function wardRoute() {
  const r = [[ARRIVAL[0], ARRIVAL[1]], [-110, -91.5], [-110, -76], [-110, 126], [-124, 126], [-124, 162.4], [-111, 162.4], [-20, 162.4]];
  r.y0 = 7.3;
  return r;
}
/** The branch to the West Market: round the terrace by the east, out at the palace's north gate, in at the market's east gate and along its cross lane. */
export function westRoute() {
  const r = [[ARRIVAL[0], ARRIVAL[1]], [-110, -91.5], [-110, -76], [-60, -75.75], [-36.5, -75.75], [-33, -80], [-33, -104], [-33, -244.5], [-110, -244.5], [-110, -262], [-55, -262], [-55, -330], [-70, -330], [-122, -330]];
  r.y0 = 7.3;
  return r;
}

/**
 * The solid things of a built lot (what its builder tells the collision world), recorded against a stand-in: [{ x0, z0, x1, z1 }] over the walker's height.
 * The route of a court is found on these (a breadth-first search on a 0.25 m grid, the body 0.42 m wide), so it goes round the annex, the screen and the stones.
 */
function solids(el) {
  const out = [], col = { rect: (r, y0, y1) => { if (y1 > 0.5 && y0 < 1.8) out.push([r[0], r[1], r[2], r[3]]); }, circle: (x, z, r, y0, y1) => { if (y1 > 0.5 && y0 < 1.8) out.push([x - r, z - r, x + r, z + r]); }, floor() {}, ramp() {}, box() {} };
  const fn = STYLES.hanlodge.elements.hanl_house;
  fn(el, { bag: NOOP, col, lights: [], style: STYLES.hanlodge });
  return out;
}
/** A path (waypoints) from a to b across the lot's yard clear of `obs`, or null. */
function findPath(obs, a, b, box) {
  const C = 0.25, R = 0.45, [bx0, bz0, bx1, bz1] = box, nx = Math.ceil((bx1 - bx0) / C), nz = Math.ceil((bz1 - bz0) / C), blocked = new Uint8Array(nx * nz);
  for (const o of obs) for (let i = Math.max(0, Math.floor((o[0] - R - bx0) / C)); i <= Math.min(nx - 1, Math.floor((o[2] + R - bx0) / C)); i++) for (let j = Math.max(0, Math.floor((o[1] - R - bz0) / C)); j <= Math.min(nz - 1, Math.floor((o[3] + R - bz0) / C)); j++) blocked[i * nz + j] = 1;
  const cell = (p) => [Math.floor((p[0] - bx0) / C), Math.floor((p[1] - bz0) / C)], A = cell(a), B = cell(b);
  const prev = new Int32Array(nx * nz).fill(-2); prev[A[0] * nz + A[1]] = -1;
  blocked[A[0] * nz + A[1]] = 0; blocked[B[0] * nz + B[1]] = 0;
  const q = [A[0] * nz + A[1]];
  for (let h = 0; h < q.length; h++) {
    const k = q[h], i = Math.floor(k / nz), j = k % nz;
    if (i === B[0] && j === B[1]) break;
    for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const ii = i + di, jj = j + dj; if (ii < 0 || jj < 0 || ii >= nx || jj >= nz || blocked[ii * nz + jj] || prev[ii * nz + jj] !== -2) continue; prev[ii * nz + jj] = k; q.push(ii * nz + jj); }
  }
  if (prev[B[0] * nz + B[1]] === -2) return null;
  const cells = []; for (let k = B[0] * nz + B[1]; k !== -1; k = prev[k]) cells.push([bx0 + (Math.floor(k / nz) + 0.5) * C, bz0 + (k % nz + 0.5) * C]);
  cells.reverse();
  const clear = (p, r) => { const n = Math.ceil(Math.hypot(r[0] - p[0], r[1] - p[1]) / 0.2); for (let t = 0; t <= n; t++) { const x = p[0] + (r[0] - p[0]) * t / n, z = p[1] + (r[1] - p[1]) * t / n, i = Math.floor((x - bx0) / C), j = Math.floor((z - bz0) / C); if (blocked[i * nz + j]) return false; } return true; };
  const out = [cells[0]]; let at = 0;
  while (at < cells.length - 1) { let far = at + 1; for (let k = cells.length - 1; k > at; k--) if (clear(cells[at], cells[k])) { far = k; break; } out.push(cells[far]); at = far; }
  return out;
}
/** In at the lot's door: a row house or store at its own door, a court by its gate and across the yard (round what stands in it) to the hall's door. */
function houseRoute(l, kind, rank) {
  const el = { rect: l.rect, front: l.front, kind, seed: l.seed };
  if (rank !== undefined) el.rank = rank;
  const D = houseDoors(el), F = frame(l.rect, l.front);
  if (D.du === undefined) return null;
  let r;
  if (kind === 'court') {
    const g = D.gateU ?? D.du, pad = 3, a = F.pt(g, 1.6), b = F.pt(D.du, D.v0 - 1.0), obs = solids(el);
    const box = [l.rect[0] - 0.5, l.rect[1] - 0.5, l.rect[2] + 0.5, l.rect[3] + 0.5];
    // the hall's front wall and platform are in `obs`; the door's cell is left clear by the builder, the target stands before it
    const mid = findPath(obs, a, b, box);
    if (!mid) return null;
    r = [F.pt(g, -2.2), F.pt(g, 0.3), ...mid, F.pt(D.du, D.v0 + 0.4), F.pt(D.du, D.v0 + 2.2)]; void pad;
  } else r = [F.pt(D.du, -2.2), F.pt(D.du, 0.1), F.pt(D.du, D.v0 + 1.4), F.pt(D.du, D.v0 + 2.6)];
  r.y0 = 0; r.kind = kind; r.id = 'lot:' + l.seed;
  return r;
}

/** [{ kind, id, route: [[x, z], …], y0: 0 }] for each opened place on the walk. */
export function walkRoutes() {
  const out = [];
  // the service quarters' houses whose fronts give on the walk's lanes: a row house or a store is entered at its door off the lane
  for (const l of lots()) {
    if (!inService(l) || walkDistance(frontPoint(l)) > WALK_REACH) continue;
    const kind = serviceKind(l);
    if (kind !== 'row' && kind !== 'shop' && kind !== 'court') continue;
    const r = houseRoute(l, kind, undefined);
    if (r) out.push(r);
  }
  // the wards' houses built to be entered, on the first lane of the branch
  for (const l of lots()) {
    if (l.ward < 0 || !enterable(l) || l.rect[1] < 130 || l.rect[0] < -112 || l.rect[2] > -6 || walkDistance(frontPoint(l)) > 4.5) continue;
    const kind = wardKind(l);
    if (kind === 'lou') continue;
    const r = houseRoute(l, kind, rankOf(l));
    if (r) out.push(r);
  }
  // the avenue's offices: in at the compound's gate, across the yard to the hall's middle bay
  for (const l of lots()) {
    if (l.kind !== 'office') continue;
    const fp = frontPoint(l);
    if (walkDistance(fp) > OFFICE_REACH) continue;
    const cx = (l.rect[0] + l.rect[2]) / 2, z1 = l.rect[3], r = [[cx, z1 + 2.2], [cx, z1 - 3], [cx, z1 - 6.2], [cx, z1 - 9.5]];
    r.y0 = 0; r.kind = 'office'; r.id = 'lot:' + l.seed;
    out.push(r);
  }
  // the East Market's shops along the walked lanes, in at the counter's flap (the opening's middle) and to the table behind
  for (const [MK, SD] of [[EAST_MARKET, SEED_SHOP], [WEST_MARKET, 600]]) marketShops(MK, SD).forEach((row) => {
    const F = frame(row.rect, row.front), sw = (row.rect[2] - row.rect[0]) / row.n;
    for (let i = 0; i < row.n; i++) {
      const u0 = i * sw, mid = u0 + sw / 2, c = F.pt(mid, 0);
      if (walkDistance(c) > WALK_REACH + 1) continue;
      const r = [F.pt(mid, -2.4), F.pt(mid, 0.3), F.pt(mid, 2.0), F.pt(mid, 3.4)];
      r.y0 = 0; r.kind = 'market-shop'; r.id = `row:${row.seed}:${i}`;
      out.push(r);
    }
  });
  void WALK;
  return out;
}
