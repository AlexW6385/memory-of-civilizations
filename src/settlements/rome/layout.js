// Rome under Hadrian, about AD 128 — the layout (docs/settlements/rome.md §2): the Campus Martius.
// The Pantheon in the middle facing north over its colonnaded forecourt; the Baths of Agrippa
// behind it to the south; the Saepta Julia's long porticoed enclosure to the east, the Via Lata
// beyond; the Stadium of Domitian to the west; the Tiber's bend at the west edge; insulae in the
// blocks between. Pure data. +x east, +z south.

export const RADIUS = 420;
export const PANTHEON = [-48, -165, 48, 32];                  // the plan's bounds (rotunda at the origin, forecourt north)
export const BATHS = [-70, 48, 70, 150];
export const SAEPTA = [78, -230, 138, 90];
export const STADIUM = [-290, -175, -184, 100];
export const FORUM = [-152, -158, -56, -70];                  // the square west of the Pantheon's forecourt, a temple at its west end
export const TEMPLE = [-150, -127, -114, -101];               // the podium, facing east onto the square
export const PISTRINUM = [80, 149, 94, 160];                  // the mill-bakery on the street at the south
export const LATRINE = [100, 152, 109, 160];
export const VIA_LATA = { x: 175, w: 10 };
export const TIBER = { x: -370, w: 46, level: -5 };
/** Rows of tabernae under flats: both sides of the Via Lata and the north side of the street before the Pantheon. */
let ROWS = null;
export function rows() {
  if (ROWS) return ROWS;
  ROWS = [];
  const rand = rng(77), xs = VIA_LATA.x, hw = VIA_LATA.w / 2;
  for (let z = -160, k = 0; z < 140; z += 26, k++) {
    ROWS.push({ rect: [xs - hw - 8.4, z, xs - hw - 0.4, z + 22], front: 'e', seed: Math.floor(rand() * 1e6) });
    ROWS.push({ rect: [xs + hw + 0.4, z, xs + hw + 8.4, z + 22], front: 'w', seed: Math.floor(rand() * 1e6) });
  }
  for (let x = -178; x < 66; x += 26) {
    if (x + 22 > -42 && x < -12) continue;
    if (inRect(FORUM, x + 11, -190, 10)) continue;
    ROWS.push({ rect: [x, -188.5, x + 22, -180.5], front: 's', seed: Math.floor(rand() * 1e6) });
  }
  return ROWS;
}
/** Fountains in the gaps between the rows, on both sides of the Via Lata, and in the forum. */
export function fountains() {
  const out = [], xs = VIA_LATA.x, hw = VIA_LATA.w / 2;
  for (const z of [-111, -33, 45, 123]) { out.push({ at: [xs - hw - 1.4, z + 2], rot: Math.PI / 2, kind: 'lacus' }); }
  for (const z of [-137, -59, 19, 97]) out.push({ at: [xs + hw + 1.4, z + 2], rot: -Math.PI / 2, kind: 'lacus' });
  out.push({ at: [-84, -114], rot: 0, kind: 'round' });
  return out;
}
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
const riverX = (z) => TIBER.x + 28 * Math.sin(z / 120);
export const inRiver = (x, z) => Math.abs(x - riverX(z)) < TIBER.w / 2 - 3 && Math.hypot(x, z) < RADIUS - 30;
export function height(x, z) {
  const d = Math.abs(x - riverX(z)), edge = smooth(RADIUS - 70, RADIUS - 25, Math.hypot(x, z));
  const bed = (TIBER.level - 3) * smooth(TIBER.w / 2 + 6, TIBER.w / 2 - 4, d) * (1 - edge);
  return bed;
}
export const onStreet = (x, z, m = 0) => Math.abs(x - VIA_LATA.x) < VIA_LATA.w / 2 + m || (Math.abs(z + 175) < 5 + m && x > -184 && x < 175) || (Math.abs(z - 165) < 5 + m && x > -184);
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const overlaps = (a, b, m) => a[0] < b[2] + m && a[2] > b[0] - m && a[1] < b[3] + m && a[3] > b[1] - m;
let LOTS = null;
/** Insulae in blocks between the streets. */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(128);
  for (let x = -RADIUS + 20; x < RADIUS - 20; x += 26) for (let z = -RADIUS + 20; z < RADIUS - 20; z += 24) {
    const w = 18 + rand() * 5, d = 16 + rand() * 5, cx = x + w / 2, cz = z + d / 2;
    if (Math.hypot(cx, cz) > RADIUS - 45 || [PANTHEON, BATHS, SAEPTA, STADIUM, FORUM, PISTRINUM, LATRINE].some((r) => inRect(r, cx, cz, 18)) || rows().some((r) => overlaps(r.rect, [x, z, x + w, z + d], 3)) || onStreet(cx, cz, 14)) continue;
    if (Math.abs(cx - riverX(cz)) < TIBER.w / 2 + 22) continue;
    if (rand() < 0.12) { GARDENS.push({ rect: [x, z, x + w, z + d], seed: Math.floor(rand() * 1e6) }); continue; }
    LOTS.push({ rect: [x, z, x + w, z + d], seed: Math.floor(rand() * 1e6) });
  }
  return LOTS;
}
let GARDENS = [];
/** The walled gardens (horti) in the blocks left empty by the insulae: planted with trees, laid out with a pool, a pergola and beds. */
export function gardens() { lots(); return GARDENS; }
export const inGarden = (x, z, m = 0) => gardens().some((g) => inRect(g.rect, x, z, m));
/** The inhabited belt: paved alleys between the blocks, no wild planting. */
export const urban = (x, z) => Math.hypot(x, z) < RADIUS - 45 && Math.abs(x - riverX(z)) > TIBER.w / 2 + 6;
/** The alleys between the rows of tabernae, closed at the street by a wall with an arched passage, or (at a fountain) by the back of a recess. */
let FILLS = null;
export function fills() {
  if (FILLS) return FILLS;
  FILLS = [];
  const fs = fountains(), has = (side, za, zb) => fs.some((f) => (side === 'e' ? f.rot > 0 : f.rot < 0) && f.at[1] > za && f.at[1] < zb && f.kind === 'lacus');
  const R = rows(), xs = VIA_LATA.x, hw = VIA_LATA.w / 2;
  for (let z = -160; z + 26 < 140; z += 26) {
    FILLS.push({ rect: [xs - hw - 8.4, z + 22, xs - hw - 0.4, z + 26], front: 'e', fountain: has('e', z + 22, z + 26), seed: z * 7 + 1 });
    FILLS.push({ rect: [xs + hw + 0.4, z + 22, xs + hw + 8.4, z + 26], front: 'w', fountain: has('w', z + 22, z + 26), seed: z * 7 + 2 });
  }
  const north = R.filter((r) => r.front === 's').sort((a, b) => a.rect[0] - b.rect[0]);
  for (let i = 0; i + 1 < north.length; i++) if (Math.abs(north[i + 1].rect[0] - north[i].rect[2] - 4) < 0.01) FILLS.push({ rect: [north[i].rect[2], -188.5, north[i + 1].rect[0], -180.5], front: 's', fountain: false, seed: i * 13 + 5 });
  return FILLS;
}
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));
