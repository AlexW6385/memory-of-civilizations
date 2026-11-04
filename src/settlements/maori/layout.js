// A pā by Lake Rotorua in the later 18th century — the layout (docs/settlements/maori.md §2): a
// volcanic hill on the lake's south shore, cut into terraces — the summit (tihi) where the chief
// lives, three terraces below it, each edged with a palisade, a ditch and bank round the foot; a
// path climbing straight up the south face through gateways; the kāinga (open village), kūmara
// gardens and pits on the flat; canoes on the lake shore to the north. Pure data. +x east, +z south.

export const RADIUS = 330;
export const HILL = { c: [0, 10], tihi: 26, rings: [[26, 54, 30], [54, 82, 20], [82, 110, 10]], top: 40, foot: 116, ditch: 124 };
export const LAKE = { z: -175, level: -1.5 };                 // the shore runs along z ≈ −175 (the lake to the north)
export const PATH = { x: 0, w: 3.2 };                         // up the south face
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
const shoreZ = (x) => LAKE.z + 14 * Math.sin(x / 41) + 6 * Math.sin(x / 13 + 2);
/** The terraced hill (flat terraces, steep scarps), the ditch at its foot, the path's ramp, the shore. */
export function height(x, z) {
  const r = Math.hypot(x - HILL.c[0], z - HILL.c[1]);
  let h = 0;
  if (r < HILL.tihi) h = HILL.top;
  else if (r < HILL.foot) {
    for (const [r0, r1, y] of HILL.rings) if (r >= r0 && r < r1) {
      // each terrace flat, its outer scarp a steep slope down to the next
      const up = r0 === HILL.tihi ? HILL.top : HILL.rings.find((q) => q[1] === r0)[2];
      h = y + (up - y) * smooth(r0 + 3, r0 - 0.5, r);
    }
  } else h = 10 * smooth(HILL.foot + 1, HILL.foot - 4, r);
  h -= 2.2 * smooth(4, 0, Math.abs(r - HILL.ditch));          // the ditch
  // the path up the south face: a ramp from the ditch to the summit's edge
  if (Math.abs(x - PATH.x) < PATH.w / 2 + 2 && z > HILL.c[1] && r > HILL.tihi - 2 && r < HILL.ditch + 6) {
    const ramp = HILL.top * smooth(HILL.ditch + 6, HILL.tihi, r) ** 0.85, k = smooth(PATH.w / 2 + 2, PATH.w / 2, Math.abs(x - PATH.x));
    h = h * (1 - k) + ramp * k;
  }
  const sz = shoreZ(x), lake = smooth(sz + 6, sz - 10, z);
  h = h * (1 - lake) + (LAKE.level - 4) * lake;
  return h * (1 - smooth(RADIUS - 40, RADIUS - 5, Math.hypot(x, z))) + 0;
}
export const inLake = (x, z) => z < shoreZ(x) - 3;
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
let V = null;
/** Houses, storehouses and pits on the terraces and in the kāinga; gardens; canoes. */
export function village() {
  if (V) return V;
  const rand = rng(1769), out = { houses: [], pataka: [], pits: [], gardens: [], waka: [] };
  const taken = [], free = (x, z, m) => !taken.some(([a, b, q]) => Math.hypot(a - x, b - z) < q + m) && Math.abs(x - PATH.x) > PATH.w + m + 1;
  const put = (list, o, m) => { list.push(o); taken.push([o.c[0], o.c[1], m]); };
  const [hx, hz] = HILL.c;
  // the chief's house on the summit, a pātaka by it
  put(out.houses, { c: [hx - 6, hz - 4], yaw: Math.PI, w: 5, l: 9, rank: 2, y: HILL.top }, 7);
  put(out.pataka, { c: [hx + 8, hz - 2], yaw: Math.PI, y: HILL.top }, 3);
  // houses and pits on the terraces, facing outward
  for (const [r0, r1, y] of HILL.rings) for (let k = 0; k < 60; k++) {
    const a = rand() * Math.PI * 2, rr = r0 + 6 + rand() * (r1 - r0 - 12), x = hx + Math.cos(a) * rr, z = hz + Math.sin(a) * rr;
    if (!free(x, z, 4)) continue;
    if (rand() < 0.55) put(out.houses, { c: [x, z], yaw: Math.atan2(-(x - hx), -(z - hz)) + Math.PI, w: 3.4 + rand(), l: 5 + rand() * 2, y }, 5);
    else put(out.pits, { c: [x, z], y }, 2.5);
  }
  // the kāinga on the flat to the east and west, with pātaka and pits; gardens beyond
  for (let k = 0; k < 2000 && out.houses.length < 90; k++) {
    const x = -280 + rand() * 560, z = -150 + rand() * 400, r = Math.hypot(x - hx, z - hz);
    if (r < HILL.ditch + 12 || Math.hypot(x, z) > RADIUS - 40 || inLake(x, z + 15) || !free(x, z, 5)) continue;
    if (Math.abs(x) < 120 && z > 140) continue;                            // the gardens south of the path
    const t = rand();
    if (t < 0.7) put(out.houses, { c: [x, z], yaw: rand() * Math.PI * 2, w: 3.2 + rand(), l: 4.8 + rand() * 2, y: 0 }, 5);
    else if (t < 0.82) put(out.pataka, { c: [x, z], yaw: rand() * Math.PI * 2, y: 0 }, 3);
    else put(out.pits, { c: [x, z], y: 0 }, 2.5);
  }
  for (let k = 0; k < 6; k++) { const x = -120 + k * 45 + rand() * 10; out.waka.push({ c: [x, shoreZ(x) + 7], yaw: Math.PI / 2 + (rand() - 0.5) * 0.4, l: 10 + rand() * 6, y: 0 }); }
  return (V = out);
}
export const inGarden = (x, z) => Math.abs(x) < 120 && z > 150 && Math.hypot(x, z) < RADIUS - 40;
