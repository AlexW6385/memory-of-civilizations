// Justinian's Constantinople about 562 — the layout (docs/settlements/constantinople.md §2): the
// first hill. Hagia Sophia in the middle with its atrium on the west; the Augustaion square south
// of it with the Milion; Hagia Eirene to the north; the Baths of Zeuxippus and the Hippodrome to
// the south-west; the Great Palace's terraces stepping down to the south-east; the Mese leaving
// west past the Forum of Constantine and its column; houses all round; the ground falling toward
// the sea on the east and south. Pure data. +x east, +z south.
// The Mese leaves the Milion at the Augustaion's north-west corner, runs west between Hagia Sophia
// and the Baths of Zeuxippus, turns north round the baths and runs west again past the north end of
// the Hippodrome (its carceres) to the Forum of Constantine: a dog-leg that keeps the true order of
// the buildings in the compressed plan [inferred].

export const RADIUS = 420;
export const SOPHIA = [-106, -52, 48, 102];                 // the plan's bounds (origin at the dome's centre)
export const AUGUSTAION = [-60, 110, 40, 175];
export const EIRENE = [-50, -150, 30, -95];
export const ZEUXIPPUS = [-170, 120, -80, 200];
export const HIPPODROME = [-290, 62, -195, 360];
export const PALACE = [60, 140, 260, 330];
export const MESE = { w: 12, path: [[-60, 110], [-180, 110], [-180, 40], [-RADIUS, 40]] };
export const MILION = [-90, 110];
/** The paved court between Hagia Sophia's south front and the Augustaion proper: the pilgrims' market, shops under porticoes on its west and east. */
export const FORECOURT = [-54, 42, 42, 108];
/** Where the plane trees of the garden court west of the forecourt's shops grow (ground.js). */
export const GARDEN_COURT = [-100, 40, -66, 100];
export const FORUM = { c: [-345, 30], r: 36 };
/** On the Augustaion's east side the Senate house (its portico west of the rect), on its south-east corner the Chalke (§4.4). */
export const SENATE = [16, 112, 40, 138];
export const CHALKE = { c: [28, 159] };
const KEEP = [[3, 110, 42, 140], [19, 143, 37, 175], [37, 150, 60, 168]];
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
/** The hill without the palace's terraces: level round Hagia Sophia, falling toward the sea to the east and south-east, back up to the rim's level at the edge. */
function natural(x, z) {
  const fall = -14 * smooth(120, 330, x + z * 0.5), r = Math.hypot(x, z);
  return fall * (1 - smooth(RADIUS - 70, RADIUS - 5, r));
}
/** The Great Palace's four courts (plan.js) and what stands on them: each is a level terrace cut into the slope. */
export const COURTS = [[60, 140, 150, 220], [160, 150, 250, 230], [70, 235, 160, 325], [170, 240, 255, 325]];
export const COURT_KINDS = ['porticus', 'thermae', 'thermae', 'porticus'];
/** The floor level of each court: the slope's height at its centre, to the half metre. */
export const COURT_Y = COURTS.map((r) => Math.round(natural((r[0] + r[2]) / 2, (r[1] + r[3]) / 2) * 2) / 2);
const TERRACE_EDGE = 8, PAVING = 0.3;
const COURTS_BOX = [Math.min(...COURTS.map((r) => r[0])) - TERRACE_EDGE, Math.min(...COURTS.map((r) => r[1])) - TERRACE_EDGE, Math.max(...COURTS.map((r) => r[2])) + TERRACE_EDGE, Math.max(...COURTS.map((r) => r[3])) + TERRACE_EDGE];
/** The ground: the hill with each court's terrace in it, the paving's slabs standing PAVING over the terrace; within TERRACE_EDGE of a court the slope blends into its level. */
export function height(x, z) {
  const h = natural(x, z);
  if (x < COURTS_BOX[0] || z < COURTS_BOX[1] || x > COURTS_BOX[2] || z > COURTS_BOX[3]) return h;
  let num = h, den = 1;
  for (let i = 0; i < COURTS.length; i++) {
    const r = COURTS[i], d = Math.hypot(Math.max(r[0] - x, 0, x - r[2]), Math.max(r[1] - z, 0, z - r[3])), y = COURT_Y[i] - PAVING;
    if (d < 1e-3) return y;
    if (d >= TERRACE_EDGE) continue;
    const t = d / TERRACE_EDGE, k = ((1 - t) / t) ** 2;
    num += k * y; den += k;
  }
  return num / den;
}
const segDist = (x, z, [ax, az], [bx, bz]) => { const dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz))); return Math.hypot(x - ax - dx * t, z - az - dz * t); };
export const onMese = (x, z, m = 0) => MESE.path.slice(1).some((b, i) => segDist(x, z, MESE.path[i], b) < MESE.w / 2 + m);
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
// The city's grid of lanes (docs §2, §14): north-south lanes every 41 m (one slot of 36 m is the Mese's own corridor at
// x = -180), east-west lanes every 35 m (those at z = 40 and z = 110 are the Mese's). Between two east-west lanes two
// rows of houses stand back to back, 15 m deep: the north row facing the lane at its north, the south row the one at
// its south; the houses of a row share their side walls, so a lane is a continuous front on both sides.
export const LANE = 5, PX = 41, PZ = 35, X0 = -159.5, Z0 = 40, ROW = 15;
export const xl = (k) => X0 + PX * k;
export const zl = (j) => Z0 + PZ * j;
const mod = (a, n) => ((a % n) + n) % n;
/** Whether (x, z) is on a lane (within m of its edge) of the grid, inside the built area. */
export function onLane(x, z, m = 0) {
  if (Math.hypot(x, z) > RADIUS - 40) return false;
  const dx = Math.min(mod(x - X0, PX), PX - mod(x - X0, PX)), dz = Math.min(mod(z - Z0, PZ), PZ - mod(z - Z0, PZ));
  return dx < LANE / 2 + m || dz < LANE / 2 + m;
}
const EXCL = () => [SOPHIA, AUGUSTAION, EIRENE, ZEUXIPPUS, HIPPODROME, PALACE, ...KEEP];
const excluded = (r) => EXCL().some((e) => r[0] < e[2] + 3 && r[2] > e[0] - 3 && r[1] < e[3] + 3 && r[3] > e[1] - 3)
  || [[r[0], r[1]], [r[2], r[1]], [r[0], r[3]], [r[2], r[3]], [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2]].some(([x, z]) => onMese(x, z, 11) || Math.hypot(x - FORUM.c[0], z - FORUM.c[1]) < FORUM.r + 9);
const TEMPLATES = [[12, 12, 12], [18, 18], [9, 13, 14], [10, 16, 10], [14, 8, 14], [18, 9, 9], [9, 9, 18], [13, 10, 13], [18, 18], [20, 16], [21, 15]];
/** The special rects (enterable buildings): chapel and bath, taking a little more depth than a row. */
export const SPECIAL = { home: [-148, 65, 'home'], tavern: [-122, 65, 'tavern'], chapel: [-147, 29, 'chapel'], bath: [-150, -6, 'bath'], bakery: [-148, 100, 'bakery'], weaver: [-235, 0, 'weaver'], home2: [-100, 28, 'home'], home3: [-200, 160, 'home'] };
let LOTS = null, BLOCKS = null, SPEC = null;
const KINDS = { chapel: [19, 17], bath: [15, 17] };
export function lots() {
  if (LOTS) return LOTS;
  LOTS = []; BLOCKS = []; SPEC = {};
  const rand = rng(562), all = [];
  const kmin = Math.floor((-RADIUS + 40 - X0) / PX), kmax = Math.ceil((RADIUS - 40 - X0) / PX), jmin = Math.floor((-RADIUS + 40 - Z0) / PZ), jmax = Math.ceil((RADIUS - 40 - Z0) / PZ);
  for (let k = kmin; k <= kmax; k++) for (let j = jmin; j <= jmax; j++) {
    const bx = xl(k) + LANE / 2, bz = zl(j) + LANE / 2, br = [bx, bz, bx + PX - LANE, bz + 2 * ROW], mid = [bx + 18, bz + ROW];
    if (Math.hypot(mid[0], mid[1]) > RADIUS - 44) continue;
    const gr = rand(), garden = gr < (Math.hypot(...mid) < 230 ? 0.1 : 0.34) && !Object.values(SPECIAL).some(([tx, tz]) => Math.hypot(tx - mid[0], tz - mid[1]) < 45);
    if (garden && !excluded(br)) { BLOCKS.push({ rect: br, k, j, seed: Math.floor(rand() * 1e6) }); continue; }
    for (const row of [0, 1]) {
      const z0 = bz + row * ROW, z1 = z0 + ROW; let tpl = TEMPLATES[Math.floor(rand() * TEMPLATES.length)];
      if (row && Object.values(SPECIAL).some(([tx, tz]) => Math.abs(tx - mid[0]) < 20 && Math.abs(tz - (z0 + ROW / 2)) < 14)) { const near = Object.values(SPECIAL).filter(([tx, tz]) => Math.abs(tx - mid[0]) < 20 && Math.abs(tz - (z0 + ROW / 2)) < 14); tpl = near.some((q) => KINDS[q[2]]) ? [21, 15] : [18, 18]; }
      let x = bx;
      tpl.forEach((w, i) => {
        const x0 = x, x1 = x + w; x += w;
        const rect = [x0, z0, x1, z1], seed = Math.floor(rand() * 1e6);
        if (excluded(rect)) return;
        const ys = [[x0, z0], [x1, z0], [x0, z1], [x1, z1]].map(([a, b]) => height(a, b));
        all.push({ rect, seed, y: Math.min(...ys), front: row ? 's' : 'n', abut: { w: i > 0, e: i < tpl.length - 1 }, row, k, j });
      });
    }
  }
  // the special buildings: the nearest south-row lots wide enough (houses of 18 × 14), the chapel and the bath cut out of a block
  const taken = new Set();
  for (const [key, [tx, tz, kind]] of Object.entries(SPECIAL)) {
    const need = KINDS[kind];
    const cand = all.filter((l) => !taken.has(l) && l.row === 1 && l.rect[2] - l.rect[0] >= (need ? need[0] : 18) - 0.01).map((l) => [Math.hypot((l.rect[0] + l.rect[2]) / 2 - tx, (l.rect[1] + l.rect[3]) / 2 - tz), l]).sort((a, b) => a[0] - b[0]);
    if (!cand.length) continue;
    const l = cand[0][1]; taken.add(l);
    const [x0, , x1, z1] = l.rect, d = need ? need[1] : 14, w = need ? need[0] : 18;
    SPEC[key] = { rect: [x0, z1 - d, x0 + w, z1], y: l.y, kind, front: 's', lot: l };
  }
  for (const l of all) {
    if (taken.has(l)) continue;
    let r = l.rect;
    for (const s of Object.values(SPEC)) if (r[0] < s.rect[2] + 0.2 && r[2] > s.rect[0] - 0.2 && r[1] < s.rect[3] && r[3] > s.rect[1]) {
      if (s.rect[1] > r[1] + 7 && s.rect[1] < r[3]) r = [r[0], r[1], r[2], s.rect[1] - 0.3]; else r = null;
      if (!r) break;
    }
    if (r) LOTS.push({ ...l, rect: r });
  }
  // the rest of a special lot's row (when the special is narrower than its lot) stays a house
  for (const s of Object.values(SPEC)) { const l = s.lot, x1 = s.rect[2]; if (l.rect[2] - x1 > 5) LOTS.push({ ...l, rect: [x1, l.rect[1], l.rect[2], l.rect[3]], abut: { w: true, e: l.abut.e } }); }
  return LOTS;
}
/** The walled gardens that fill some blocks (a whole block: vines, fruit trees, a well). */
export function gardens() { lots(); return BLOCKS; }
export function special() { lots(); return SPEC; }
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m)) || Object.values(special()).some((s) => inRect(s.rect, x, z, m));
