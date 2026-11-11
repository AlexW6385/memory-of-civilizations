// Norse Norway about 1250 — the layout (docs/settlements/norse-borgund.md §2): the floor of the
// Lærdal valley with the river on its south side; Borgund's stave church on a low rise on the north
// side of the floor, its bell house and fenced churchyard; farms (tun) of log buildings round their
// yards along the floor and on the foot of the slopes; fields between; the steep wooded sides rising
// all round (the ground comes up to RIM at the disc's edge). Pure data. +x east, +z south.

export const RADIUS = 360;
export const RIM = 45;
export const CHURCH = [0, -30];
export const BELL = [12, -13];                           // the stave bell tower stands south of the church
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
// the farms: their yards' centres; each a dwelling, two lofts, a barn and a byre, a wood shed and a second house (or the smith's)
export const FARMS = [[-150, -60], [-95, 40], [80, -70], [150, 30], [-210, 70], [220, -40], [40, 70], [-40, 95],
  [60, -24], [-62, -18], [-30, 40], [130, 100], [-215, -22], [268, 35], [-272, 36]];
export const SMITH_FARM = 8;      // the smith works at the farm nearest the church on the east (the priest's farm)
// one farm's plan about its yard (dx, dz from the yard's centre; w along x, d along z): the dwelling on the far side of the yard,
// the lofts either side of it, the barn and the byre across the ends, the shed and a second house on the near side
const TUN = [[0, -10, 'stue', 9, 5.5], [-9.5, -9, 'loft', 3.6, 3.6], [9.5, -9, 'loft', 3.4, 3.4], [-16, 2, 'barn', 6.5, 11], [16, 2, 'barn', 6.5, 10], [3.5, 13, 'shed', 7, 3.5], [-6, 12.5, 'stue', 6, 4.5]];
let BUILT = null;
export function buildings() {
  if (BUILT) return BUILT;
  BUILT = [];
  FARMS.forEach(([fx, fz], i) => {
    const rand = rng(1250 + i * 17), mir = i % 2 === 1 ? -1 : 1;
    TUN.forEach(([dx0, dz0, kind0, w0, d0], k) => {
      let kind = kind0;
      if (k === 6 && i === SMITH_FARM) kind = 'smithy';
      if ((k === 2 || k === 6) && kind !== 'smithy' && rand() < 0.25) return;       // not every farm has all
      const dx = dx0 * mir, cx = fx + dx + (rand() - 0.5) * 1.6, cz = fz + dz0 + (rand() - 0.5) * 1.6;
      const hw = w0 / 2, hd = d0 / 2, rect = [cx - hw, cz - hd, cx + hw, cz + hd];
      const ys = [height(rect[0], rect[1]), height(rect[2], rect[1]), height(rect[0], rect[3]), height(rect[2], rect[3])];
      const corners = [[rect[0], rect[1]], [rect[2], rect[1]], [rect[0], rect[3]], [rect[2], rect[3]]];
      if (corners.some(([x, z]) => inRiver(x, z) || Math.abs(z - riverZ(x)) < RIVER.w / 2 + 3) || Math.max(...ys) > 5 || Math.hypot(cx, cz) > RADIUS - 70) return;
      const alongX = w0 >= d0, front = alongX ? fz < cz : fx < cx;
      BUILT.push({ rect, y: Math.max(...ys), foot: Math.min(...ys) - 0.4, kind, front, farm: i, seed: Math.floor(rand() * 1e6) });
    });
  });
  // the summer farms (seter) on the slopes: a small smoke-room hut, a byre for the milking and a cheese store, round a trodden yard
  SETERS.forEach(([sx, sz], i) => {
    const rand = rng(777 + i);
    for (const [dx, dz, kind, w, d] of [[0, 0, 'stue', 5.2, 4.2], [-7.5, 3, 'barn', 5.6, 4.6], [6.5, 4.5, 'loft', 3.2, 3.2]]) {
      const cx = sx + dx, cz = sz + dz, rect = [cx - w / 2, cz - d / 2, cx + w / 2, cz + d / 2];
      const ys = [height(rect[0], rect[1]), height(rect[2], rect[1]), height(rect[0], rect[3]), height(rect[2], rect[3])];
      BUILT.push({ rect, y: Math.max(...ys), foot: Math.min(...ys) - 0.4, kind, front: false, farm: -1 - i, seed: Math.floor(rand() * 1e6) });
    }
  });
  return BUILT;
}
export const SETERS = [[-75, -122], [112, -124], [-200, -116]];
/** The door of a building: its place on the wall (x, z) and the way out (nx, nz). */
export function doorOf(b) {
  const [x0, z0, x1, z1] = b.rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, alongX = x1 - x0 >= z1 - z0;
  if (b.kind === 'loft') return { at: [cx, z1 + 0.95], n: [0, 1] };
  if (alongX) { const m = b.kind === 'barn' || b.kind === 'shed' ? 0 : -0.8; return b.front ? { at: [cx + m, z0], n: [0, -1] } : { at: [cx + m, z1], n: [0, 1] }; }
  return b.front ? { at: [x0, cz], n: [-1, 0] } : { at: [x1, cz], n: [1, 0] };
}
export const inBuilding = (x, z, m = 0) => buildings().some((b) => inRect(b.rect, x, z, m));
export const inFarm = (x, z, m = 0) => FARMS.some(([fx, fz]) => Math.hypot(x - fx, z - fz) < 26 + m);

// the river landing: a timber quay down the north bank where the river bends south-most-west (its bank runs east-west there,
// so the quay runs straight south into the water), a boathouse (naust) beside it
export const LANDING = (() => {
  const x = -133.5, rz = riverZ(x), top = rz - 19.5;
  return { x, top, y0: height(x, top), yd: RIVER.level + 0.75, rz, naust: [x - 11, rz - 20.5], naustRot: 0 };
})();
