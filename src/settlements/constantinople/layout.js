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
export const FORUM = { c: [-345, 30], r: 36 };
/** On the Augustaion's east side the Senate house (its portico west of the rect), on its south-east corner the Chalke (§4.4). */
export const SENATE = [16, 112, 40, 138];
export const CHALKE = { c: [28, 159] };
const KEEP = [[3, 110, 42, 140], [19, 143, 37, 175], [37, 150, 60, 168]];
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
/** The hill: level round Hagia Sophia, falling toward the sea to the east and south-east, back up to the rim's level at the edge. */
export function height(x, z) {
  const fall = -14 * smooth(120, 330, x + z * 0.5), r = Math.hypot(x, z);
  return fall * (1 - smooth(RADIUS - 70, RADIUS - 5, r));
}
const segDist = (x, z, [ax, az], [bx, bz]) => { const dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz))); return Math.hypot(x - ax - dx * t, z - az - dz * t); };
export const onMese = (x, z, m = 0) => MESE.path.slice(1).some((b, i) => segDist(x, z, MESE.path[i], b) < MESE.w / 2 + m);
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
let LOTS = null;
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(562);
  for (let x = -RADIUS + 20; x < RADIUS - 20; x += 22) for (let z = -RADIUS + 20; z < RADIUS - 20; z += 20) {
    const w = 15 + rand() * 5, d = 13 + rand() * 5, cx = x + w / 2, cz = z + d / 2;
    if (Math.hypot(cx, cz) > RADIUS - 45 || [SOPHIA, AUGUSTAION, EIRENE, ZEUXIPPUS, HIPPODROME, PALACE, ...KEEP].some((r) => inRect(r, cx, cz, 16)) || onMese(cx, cz, 21) || Math.hypot(cx - FORUM.c[0], cz - FORUM.c[1]) < FORUM.r + 23) continue;
    if (rand() < 0.15) continue;
    const ys = [[x, z], [x + w, z], [x, z + d], [x + w, z + d]].map(([a, b]) => height(a, b));
    LOTS.push({ rect: [x, z, x + w, z + d], seed: Math.floor(rand() * 1e6), y: Math.min(...ys) });
  }
  return LOTS;
}
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));
