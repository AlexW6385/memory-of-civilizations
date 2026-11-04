// Norse Norway about 1250 — the layout (docs/settlements/norse-borgund.md §2): the floor of the
// Lærdal valley with the river on its south side; Borgund's stave church on a low rise on the north
// side of the floor, its bell house and fenced churchyard; farms (tun) of log buildings round their
// yards along the floor and on the foot of the slopes; fields between; the steep wooded sides rising
// all round (the ground comes up to RIM at the disc's edge). Pure data. +x east, +z south.

export const RADIUS = 360;
export const RIM = 45;
export const CHURCH = [0, -30];
export const BELL = [-26, -42];
export const YARD = [-22, -52, 22, -8];                      // the churchyard
export const RIVER = { z: 140, w: 26, level: -3, bed: -5 };
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const riverZ = (x) => RIVER.z + 16 * Math.sin(x / 85);
export const inRiver = (x, z) => Math.abs(z - riverZ(x)) < RIVER.w / 2 - 2 && Math.hypot(x, z) < RADIUS - 50;
function land(x, z) {
  const north = RIM * smooth(-110, -310, z), south = RIM * smooth(190, 330, z), edge = RIM * smooth(RADIUS - 90, RADIUS - 5, Math.hypot(x, z));
  const rise = 1.5 * Math.exp(-((x - CHURCH[0]) ** 2 + (z - CHURCH[1]) ** 2) / 1800);
  return Math.max(north, south, edge) + rise;
}
export function height(x, z) {
  const d = Math.abs(z - riverZ(x)), carve = smooth(RIVER.w / 2 + 6, RIVER.w / 2 - 4, d) * (1 - smooth(RADIUS - 70, RADIUS - 40, Math.hypot(x, z)));
  const h = land(x, z);
  return h + (RIVER.bed - h) * carve;
}
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
// the farms: their yards' centres; each a dwelling, a loft, a barn and byre, a smaller house or two
export const FARMS = [[-150, -60], [-95, 40], [80, -70], [150, 30], [-210, 70], [220, -40], [40, 70], [-40, 95]];
let BUILT = null;
export function buildings() {
  if (BUILT) return BUILT;
  BUILT = [];
  FARMS.forEach(([fx, fz], i) => {
    const rand = rng(1250 + i * 17);
    const spots = [[0, -10, 'stue', 9, 5.5], [11, -2, 'loft', 3.6, 3.6], [-12, 2, 'barn', 11, 6.5], [2, 10, 'barn', 8, 5], [-4, -1, 'stue', 6, 4.5], [12, 10, 'loft', 3.2, 3.2]];
    const n = 4 + Math.floor(rand() * 3);
    for (let k = 0; k < n; k++) {
      const [dx, dz, kind, w, d] = spots[k], rot = rand() < 0.5;
      const cx = fx + dx + (rand() - 0.5) * 2, cz = fz + dz + (rand() - 0.5) * 2, hw = (rot ? d : w) / 2, hd = (rot ? w : d) / 2;
      const ys = [height(cx - hw, cz - hd), height(cx + hw, cz - hd), height(cx - hw, cz + hd), height(cx + hw, cz + hd)];
      BUILT.push({ rect: [cx - hw, cz - hd, cx + hw, cz + hd], y: Math.max(...ys), foot: Math.min(...ys) - 0.4, kind, seed: Math.floor(rand() * 1e6) });
    }
  });
  return BUILT;
}
export const inBuilding = (x, z, m = 0) => buildings().some((b) => inRect(b.rect, x, z, m));
export const inFarm = (x, z, m = 0) => FARMS.some(([fx, fz]) => Math.hypot(x - fx, z - fz) < 22 + m);
