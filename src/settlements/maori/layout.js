// A pā by Lake Rotorua in the later 18th century — the layout (docs/settlements/maori.md §2): a
// volcanic hill on the lake's south shore, cut into terraces — the summit (tihi) where the chief
// lives, three terraces below it, each edged with a palisade, a ditch and bank round the foot; a
// path climbing straight up the south face through gateways; the kāinga (open village), kūmara
// gardens and pits on the flat; canoes on the lake shore to the north. Pure data. +x east, +z south.

export const RADIUS = 330;
export const HILL = { c: [0, 10], tihi: 26, rings: [[26, 54, 30], [54, 82, 20], [82, 110, 10]], top: 40, foot: 116, ditch: 124 };
export const LANES = HILL.rings.map(([, r1]) => r1 - 7);   // the walk along each terrace, behind the fighting stages (kept clear of houses)
export const LAKE = { z: -175, level: -1.5 };                 // the shore runs along z ≈ −175 (the lake to the north)
export const PATH = { x: 0, w: 3.2 };                         // up the south face
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
export const shoreZ = (x) => LAKE.z + 14 * Math.sin(x / 41) + 6 * Math.sin(x / 13 + 2);
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
/** An oriented footprint (the house, its porch yard before the door) and a test of two of them with a margin. */
function foot(c, yaw, w, l, pad = 0.6, front = 3.2) {
  const fx = -Math.sin(yaw), fz = -Math.cos(yaw), ox = c[0] + fx * front / 2, oz = c[1] + fz * front / 2;
  return { c: [ox, oz], ax: [Math.cos(yaw), -Math.sin(yaw)], az: [Math.sin(yaw), Math.cos(yaw)], hw: w / 2 + pad, hl: (l + front) / 2 + pad };
}
function overlap(p, q, m) {
  for (const A of [p, q]) for (const ax of [A.ax, A.az]) {
    const d = (q.c[0] - p.c[0]) * ax[0] + (q.c[1] - p.c[1]) * ax[1];
    const rp = p.hw * Math.abs(p.ax[0] * ax[0] + p.ax[1] * ax[1]) + p.hl * Math.abs(p.az[0] * ax[0] + p.az[1] * ax[1]);
    const rq = q.hw * Math.abs(q.ax[0] * ax[0] + q.ax[1] * ax[1]) + q.hl * Math.abs(q.az[0] * ax[0] + q.az[1] * ax[1]);
    if (Math.abs(d) > rp + rq + m) return false;
  }
  return true;
}
/**
 * Houses, storehouses and pits on the terraces (rows along each ring, the doors outward) and in the kāinga (whānau
 * compounds: three to six houses facing one yard with its cooking place, a pātaka and a pit by it); gardens; canoes.
 * Houses are placed by their true footprints (an oriented box with the porch yard) so that fronts run close but never overlap.
 */
export function village() {
  if (V) return V;
  const rand = rng(1769), out = { houses: [], pataka: [], pits: [], gardens: [], waka: [], compounds: [] };
  const boxes = [], circles = [], hx0 = HILL.c[0], hz0 = HILL.c[1];
  const clearOf = (c, m) => !circles.some(([a, b, q]) => Math.hypot(a - c[0], b - c[1]) < q + m);
  const pathOk = (x, z, m) => Math.abs(x - PATH.x) > PATH.w / 2 + m;
  const laneHit = (f) => {
    const rs = [[1, 1], [1, -1], [-1, 1], [-1, -1]].map(([a, b]) => Math.hypot(f.c[0] + a * f.hw * f.ax[0] + b * f.hl * f.az[0] - hx0, f.c[1] + a * f.hw * f.ax[1] + b * f.hl * f.az[1] - hz0));
    const lo = Math.min(...rs), hi = Math.max(...rs);
    return LANES.some((q) => lo < q + 1.0 && hi > q - 1.0);
  };
  const house = (x, z, yaw, w, l, y, extra = {}, gap = 1.0) => {
    const f = foot([x, z], yaw, w, l);
    if (laneHit(f)) return false;
    if (boxes.some((b) => overlap(f, b, gap)) || !clearOf([x, z], l / 2)) return false;
    boxes.push(f); out.houses.push({ c: [x, z], yaw, w, l, y, ...(extra.rank === 1 ? { h: 1.5 } : {}), ...extra }); return true;
  };
  const solid = (list, x, z, y, r, extra = {}) => {
    if (laneHit({ c: [x, z], ax: [1, 0], az: [0, 1], hw: r, hl: r })) return false;
    if (boxes.some((b) => { const d = Math.hypot(b.c[0] - x, b.c[1] - z); return d < Math.max(b.hw, b.hl) + r && overlap(b, { c: [x, z], ax: [1, 0], az: [0, 1], hw: r, hl: r }, 0.6); })) return false;
    if (!clearOf([x, z], r)) return false;
    list.push({ c: [x, z], y, ...extra }); circles.push([x, z, r]); return true;
  };
  const [hx, hz] = HILL.c;
  // the chief's house on the summit, a pātaka by it
  const chief = { c: [hx - 6, hz - 4], yaw: Math.PI, w: 5, l: 9, h: 1.6, rank: 2, y: HILL.top };
  out.houses.push(chief); boxes.push(foot(chief.c, chief.yaw, 5, 9, 0.6, 4));
  out.pataka.push({ c: [hx + 8, hz - 2], yaw: Math.PI, y: HILL.top }); circles.push([hx + 8, hz - 2, 3]);
  // the terraces: rows along each ring, doors toward the summit, pits and pātaka between
  HILL.rings.forEach(([r0, r1, y], ri) => {
    for (const rr of (r1 - r0 < 15 ? [(r0 + r1) / 2] : [r0 + 10.5, r1 - 12])) {
      const step = 5.6 / rr, a0 = rand() * 6.28;
      for (let a = a0; a < a0 + Math.PI * 2; a += step * (1 + rand() * 0.5)) {
        const x = hx + Math.cos(a) * rr, z = hz + Math.sin(a) * rr, yaw = Math.atan2(-(x - hx), -(z - hz)) + Math.PI;
        if (!pathOk(x, z, 4 + 3) || Math.hypot(x, z) > RADIUS - 40) continue;
        const t = rand();
        if (t < 0.72) house(x, z, yaw, 3.3 + rand() * 1.0, 4.8 + rand() * 2.2, y, { rank: ri === 0 && rand() < 0.35 ? 1 : 0 });
        else if (t < 0.84) solid(out.pataka, x, z, y, 2.6, { yaw });
        else solid(out.pits, x, z, y, 2.4);
      }
    }
  });
  // the kāinga on the flat: compounds round their yards, east and west and south of the gardens' edge, gardens beyond
  const centres = [];
  for (let k = 0; k < 4000 && centres.length < 21; k++) {
    const x = -290 + rand() * 580, z = -150 + rand() * 410, r = Math.hypot(x - hx, z - hz);
    if (r < HILL.ditch + 24 || Math.hypot(x, z) > RADIUS - 52 || inLake(x, z + 24)) continue;
    if (Math.abs(x) < 125 && z > 138) continue;
    if (Math.abs(x - PATH.x) < 14) continue;
    if (centres.some(([a, b]) => Math.hypot(a - x, b - z) < 34)) continue;
    centres.push([x, z]);
  }
  for (const [cx, cz] of centres) {
    const n = 3 + Math.floor(rand() * 4), yr = 8.5 + rand() * 2, a0 = rand() * 6.28, comp = { c: [cx, cz], houses: [], r: yr };
    circles.push([cx, cz, 3.6]);
    for (let i = 0; i < n; i++) {
      const a = a0 + i / n * 6.28 + (rand() - 0.5) * 0.35, d = yr + 3.4, x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d;
      const yaw = Math.atan2(-(x - cx), -(z - cz)) + Math.PI + (rand() - 0.5) * 0.25;   // the door toward the yard
      if (inLake(x, z + 12) || Math.hypot(x, z) > RADIUS - 48) continue;
      const w = 3.2 + rand() * 1.0, l = 4.8 + rand() * 2.2;
      if (house(x, z, yaw, w, l, 0, { comp: out.compounds.length, rank: rand() < 0.06 ? 1 : 0 }, 0.4)) comp.houses.push(out.houses.length - 1);
    }
    if (comp.houses.length < 2) continue;
    // a pātaka and a pit on the yard's rim between houses
    for (let q = 0; q < 6; q++) { const a = rand() * 6.28, d = yr + 8 + rand() * 4, x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d; if (q % 2 ? solid(out.pits, x, z, 0, 2.4) : solid(out.pataka, x, z, 0, 2.6, { yaw: a + Math.PI })) if (q > 3) break; }
    out.compounds.push(comp);
  }
  for (let k = 0; k < 6; k++) { const x = -120 + k * 45 + rand() * 10; out.waka.push({ c: [x, shoreZ(x) + 7], yaw: Math.PI / 2 + (rand() - 0.5) * 0.4, l: 10 + rand() * 6, y: 0 }); }
  return (V = out);
}
export const inGarden = (x, z) => Math.abs(x) < 120 && z > 150 && Math.hypot(x, z) < RADIUS - 40;

/** Where the ground steams: hot pools and vents on the flat between the hill and the shore (the geothermal ground of Rotorua's south shore). */
export const VENTS = [[-150, -128], [-132, -122], [176, -118], [190, -96], [158, -135]];
