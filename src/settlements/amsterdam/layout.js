// Amsterdam about 1670 — the layout (docs/settlements/amsterdam.md §2): the city's half-rings of canals
// round the old centre on the IJ — the Singel, Herengracht, Keizersgracht and Prinsengracht; the Dam
// with the new Town Hall and the Nieuwe Kerk; the Westerkerk on the Prinsengracht; tall gabled houses
// along every canal under rows of elms; the IJ harbour full of ships to the north. Compressed (the
// rings are about 1.5 km across). Pure data. +x east, +z south (the IJ to the north).

export const RADIUS = 400;
export const C = [0, -300];                                 // the rings' centre, on the IJ's shore
export const RINGS = [130, 185, 240, 295];                  // the canals' radii
export const CANAL_W = 22;
export const DAM = [-30, -255, 40, -205];
export const HALL = [-75, -262, -30, -205];
export const IJ_Z = -290;
/** The Damrak: the Amstel's old mouth, the harbour running from the IJ up to the Dam (its head at the Dam's north edge). */
export const DAMRAK = [14, IJ_Z - 8, 28, -257];
/** The Weigh House (Waag, 1565) on the Dam, before the Town Hall's north wing (docs §5.4). */
export const WAAG = [-20, -253, -2, -241];
/** The fish market along the Damrak's head. */
export const FISH = [13, -255, 39, -247];
/** The Nieuwe Kerk, east of the Dam. */
export const NIEUWE_KERK = [48, -261, 70, -215];
export const WATER = -1.0, GROUND = 1.0;
export const QUAY = 1.0;                                    // the quay walls' line: this far beyond the canals' nominal edge
export const BRIDGE_ANGLES = [0.35, 0.8, 1.25, 1.7, 2.15, 2.6];
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
const rc = (x, z) => Math.hypot(x - C[0], z - C[1]);
/** How far into water: a canal of the rings, or the IJ. */
export function wet(x, z) {
  const r = rc(x, z), inDisc = Math.hypot(x, z) < RADIUS - 60 || z < IJ_Z;     // (the IJ runs on to a shore by the disc's edge)
  let d = Math.min(...RINGS.map((R) => Math.abs(r - R) - CANAL_W / 2));
  if (z < C[1] + 20) d = 9;                                  // the rings end at the IJ
  d = Math.min(d, z - IJ_Z);
  { const [x0, z0, x1, z1] = DAMRAK, ox = Math.max(x0 - x, 0, x - x1), oz = Math.max(z0 - z, 0, z - z1);
    d = Math.min(d, ox || oz ? Math.hypot(ox, oz) : Math.max(x0 - x, x - x1, z0 - z, z - z1)); }
  return inDisc ? d : 9;
}
export function height(x, z) {
  const w = wet(x, z), r = Math.hypot(x, z);
  // the quays stand in brick walls at the canal's edge (wet = QUAY): level ground to the wall, the bed beyond it
  const h = w > QUAY + 0.05 ? GROUND : w > QUAY - 0.9 ? GROUND + (WATER - 1.8 - GROUND) * smooth(QUAY + 0.05, QUAY - 0.9, w) : WATER - 1.8;
  return h * (1 - smooth(RADIUS - 60, RADIUS - 15, r)) + 0;
}
export const inWater = (x, z) => wet(x, z) < QUAY - 0.1 && height(x, z) < WATER;
export const westerkerk = () => { const a = Math.PI * 0.62, R = RINGS[3] + CANAL_W / 2 + 14; return [C[0] + Math.cos(a) * R, C[1] + Math.sin(a) * R]; };
/** The Westerkerk's nave behind its tower: 22 m wide, 52 long, two transepts (docs §1: 58 × 29 m with the tower). */
export const westerNave = () => { const [x, z] = westerkerk(); return [x - 11, z + 4.5, x + 11, z + 56.5]; };
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
let LOTS = null;
/**
 * The houses that close the Dam (docs §5.5): a row along its north side between the Town Hall's corner and
 * the Damrak, their fronts to the square; and a row along the Damrak's east quay, their fronts to the water
 * (some of them warehouses). Explicit, so that the ring rows keep clear of them.
 */
function damLots(rand) {
  const out = [];
  // the south side: two houses west of the street to the Singel, six between it and the street east of them
  for (const [a, b] of [[-30, -18.5], [-9.5, 27]]) for (let x = a; ;) { const w = 6 + rand() * 1.6; if (x + w > b) break; out.push({ rect: [x, -203, x + w, -191], front: 'n', storeys: 4 + (rand() < 0.5 ? 1 : 0), seed: Math.floor(rand() * 1e6), y: GROUND }); x += w; }
  for (let x = -29; ;) { const w = 6 + rand() * 1.6; if (x + w > 11.6) break; out.push({ rect: [x, -273, x + w, -262], front: 's', storeys: 4 + (rand() < 0.5 ? 1 : 0), seed: Math.floor(rand() * 1e6), y: GROUND }); x += w; }
  for (let z = -287; ;) { const w = 5.8 + rand() * 1.4; if (z + w > -262.5) break; out.push({ rect: [34, z, 46, z + w], front: 'w', storeys: 4, seed: Math.floor(rand() * 1e6), y: GROUND, gable: rand() < 0.5 ? 'spout' : undefined }); z += w; }
  return out;
}
/** Houses in rows on both banks of every canal, their fronts to the water; those backing on the Dam turned to face it. */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(1670), wk = westerkerk();
  LOTS.push(...damLots(rng(1665)));
  const bands = [[RINGS[0] - CANAL_W / 2 - 18, -1], ...RINGS.flatMap((R) => [[R - CANAL_W / 2 - 8 - 6, -1], [R + CANAL_W / 2 + 8, 1]])];
  for (const [R, side] of bands) {
    for (let a = 0.05; a < Math.PI - 0.05;) {
      const w = 6 + rand() * 2.5, x = C[0] + Math.cos(a) * (R + 7), z = C[1] + Math.sin(a) * (R + 7);
      a += w / (R + 7);
      if (Math.hypot(x, z) > RADIUS - 70 || z < C[1] + 26 || inRect([DAM[0] - 50, DAM[1] - 10, DAM[2] + 10, DAM[3] + 10], x, z) || Math.hypot(x - wk[0], z - wk[1]) < 16 || inRect(westerNave(), x, z, 12) || inRect(NIEUWE_KERK, x, z, 8) || BRIDGE_ANGLES.some((b) => Math.abs(b - a) * (R + 7) < 7 + w / 2) || rand() < 0.06) continue;
      const nx = Math.cos(a), nz = Math.sin(a), alongX = Math.abs(nz) > Math.abs(nx);
      let front = alongX ? (nz * side > 0 ? 'n' : 's') : (nx * side > 0 ? 'w' : 'e');
      const rect = alongX ? [x - w / 2, z - 6, x + w / 2, z + 6] : [x - 6, z - w / 2, x + 6, z + w / 2];
      // a house whose back would be to the Dam turns its front to the square (its back is then to the quay)
      { const back = { n: [x, rect[3] + 3], s: [x, rect[1] - 3], e: [rect[0] - 3, z], w: [rect[2] + 3, z] }[front]; if (inRect(DAM, back[0], back[1], 8)) front = { n: 's', s: 'n', e: 'w', w: 'e' }[front]; }
      if (LOTS.some((l) => !(rect[2] <= l.rect[0] || rect[0] >= l.rect[2] || rect[3] <= l.rect[1] || rect[1] >= l.rect[3]))) continue;
      if ([[rect[0], rect[1]], [rect[2], rect[1]], [rect[0], rect[3]], [rect[2], rect[3]]].some(([p, q]) => wet(p, q) < 3)) continue;
      LOTS.push({ rect, front, storeys: 4 + (rand() < 0.4 ? 1 : 0), seed: Math.floor(rand() * 1e6), y: GROUND });
    }
  }
  return LOTS;
}
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));
