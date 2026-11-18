// The sculpture's plans in levels of detail by the visitor's distance (docs/settlements/chichen-itza.md §18): each group of carvings is a plan shown within
// `near` of its centre (the engine hides it beyond, src/engine/world.js), so a level adds no draw to the arrival's frame:
//   beyond 45 m  the far forms the landmark's plan carries (farElements: cheap masses of the style's own stone and red lying inside the modelled carvings); the flat panels of the style under the overlays;
//   within 45 m  the modelled carvings (`base`): heads, columns, the chacmool, the Atlanteans, the pillars' warriors, the ball court's reliefs and rings;
//   within 16 m  their fine detail (`fine`, added on top): rows of teeth, goggles, headdresses, atlatls and darts, ornaments.
import { RADIUS } from './layout.js';

const base = (id, elements, o = {}) => ({ id, style: 'maya', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 62], facing: 'n' }, ...o });
const NEAR = 45, FINE = 18;

/** A group of carvings: `mk(part)` the modelled elements within NEAR (base) and within FINE (fine). */
function group(id, center, { mk, near = NEAR, fine = FINE, fineToo = true }) {
  const out = [];
  out.push(base(`${id}-mid`, mk('base'), { near, center, nocollide: true }));
  if (fineToo) out.push(base(`${id}-fine`, mk('fine'), { near: fine, center, nocollide: true }));
  return out;
}

/** The far forms (`part: 'far'`) the landmark's plan carries: the cheap stone and red masses that lie inside the modelled carvings (they add no draw: the plan's own materials). */
export function farElements() {
  const out = [];
  for (const g of [castilloData(), warriorsData()]) {
    for (const h of g.heads) out.push({ t: 'cz_serpent_head', ...h, part: 'far' });
    for (const c of g.cols) out.push({ t: 'cz_serpent_column', ...c, part: 'far' });
    if (g.chac) out.push({ t: 'cz_chacmool', ...g.chac, part: 'far' });
  }
  return out;
}

// ---- El Castillo's north stair and its temple door (the stair: the plan's m_pyramid with serpents: ''; its geometry in carved.js's comments) ----
const CAST = { stairHeads: [[5.0, -36.27], [-5.0, -36.27]], cols: [[1.25, -6.75], [-1.25, -6.75]], y1: 24.4, H: 3.72 };
function castilloData() {
  return { heads: CAST.stairHeads.map(([x, z]) => ({ at: [x, z], dir: [0, -1], y: 0 })), cols: CAST.cols.map(([x, z]) => ({ at: [x, z], dir: [0, -1], y: CAST.y1, H: CAST.H })) };
}
function castillo() {
  const { heads, cols } = castilloData();
  return group('cz-castillo-n', [0, -22], {
    mk: (part) => [...heads.map((h) => ({ t: 'cz_serpent_head', ...h, part })), ...cols.map((c) => ({ t: 'cz_serpent_column', ...c, part, nocollide: true }))],
  });
}

// ---- the Temple of the Warriors: the stair's heads, the door's columns, the chacmool, the Atlanteans ----
const WAR = { c: [112, -14], y: 13, y1: 13.4, H: 4.03 };
function warriorsData() {
  return { heads: [-1, 1].map((s) => ({ at: [89.84, -14 - s * 5.1], dir: [-1, 0], y: 0 })), cols: [[101.5, -12.75], [101.5, -15.25]].map(([x, z]) => ({ at: [x, z], dir: [-1, 0], y: WAR.y1, H: WAR.H })), chac: { at: [99.5, -14], dir: [-1, 0], y: WAR.y } };
}
function warriors() {
  const { heads, cols, chac } = warriorsData();
  const az = Array.from({ length: 6 }, (_, i) => -16.25 + i * 0.9), atl = [];
  for (const x of [119.7, 121.2]) for (const z of az) atl.push([x, z, -1, 0]);
  return group('cz-warriors', [105, -14], {
    mk: (part) => [...heads.map((h) => ({ t: 'cz_serpent_head', ...h, part })), ...cols.map((c) => ({ t: 'cz_serpent_column', ...c, part, nocollide: true })), { t: 'cz_chacmool', ...chac, part, nocollide: true },
      { t: 'cz_atlanteans', list: atl, y: WAR.y1 + 0.03, part }],
  });
}

// ---- the pillars: carved faces over the colonnades' and the front hall's, in cells of about eight ----
function pillars() {
  const list = [], P = (x, z, y, sc = 1) => list.push([x, z, y, sc]);
  const colonnade = ([x0, z0, x1, z1], rows, cols, h = 4.2) => {
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) P(x0 + (x1 - x0) * (i + 0.5) / cols, z0 + (z1 - z0) * (j + 0.5) / rows, 0.6 + Math.max(0.2, (h - 0.4 - 2.8) / 2));
  };
  colonnade([62, -36, 86, 8], 8, 4); colonnade([84, 28, 164, 46], 4, 20); colonnade([146, -36, 164, 28], 10, 3);
  for (const z of [-6, -2, 2, 6]) P(107.8, -14 + z * 8.4 / 8, WAR.y1 + 0.03 + 0.4);
  const cells = new Map();
  for (const p of list) { const k = `${Math.floor(p[0] / 14)},${Math.floor(p[1] / 11)}`; if (!cells.has(k)) cells.set(k, []); cells.get(k).push(p); }
  const out = [];
  for (const [k, ps] of cells) {
    const c = [ps.reduce((a, p) => a + p[0], 0) / ps.length, ps.reduce((a, p) => a + p[1], 0) / ps.length];
    out.push(...group(`cz-pillars-${k}`, c, { near: 38, fine: 15, mk: (part) => [{ t: 'cz_pillars', list: ps, part }] }));
  }
  return out;
}

// ---- the Great Ball Court: the reliefs of the benches and the rings ----
function ballcourt() {
  const [x0, z0, x1, z1] = [-133, -110, -97, 36], zc = (z0 + z1) / 2, bw = 4.5, sl = 1.6, b0 = 0.4, b1 = 1.75, a = Math.atan2(b1 - b0, sl), ca = Math.cos(a), sa = Math.sin(a), out = [];
  for (const s of [-1, 1]) {
    const xi = s < 0 ? x0 : x1, X = (u) => xi - s * u, V = [s * ca, sa, 0], N = [-s * sa, ca, 0], U = [0, 0, s];
    for (let i = 0; i < 6; i++) {
      const zp = zc + (i - 2.5) * 15.5, O = [X(bw) + V[0] * 0.06 - N[0] * 0.01, b0 + V[1] * 0.06 - N[1] * 0.01, zp];
      const c = [X(bw) - s * 0.8, zp], g = (part) => [{ t: 'cz_ball_panel', O, U, V, N, part }];
      out.push(...group(`cz-ball-${s < 0 ? 'w' : 'e'}${i}`, c, { near: 36, fine: 14, mk: g }));
    }
    out.push(base(`cz-ring-${s < 0 ? 'w' : 'e'}`, [{ t: 'cz_ball_ring', at: [xi - s * 0.1, zc], y: 6.2, dir: [-s, 0] }], { near: 45, center: [xi, zc], nocollide: true }));
  }
  return out;
}

// ---- the Tzompantli: bands of skulls on a continuous slab over the old rows ----
function tzompantli() {
  const [cx, cz] = [-58, -52], BZ = 22, BX = 5.5, SX = 4, SZ = 8, gap = 3.4, out = [];
  const segs = [
    [[cx - BX, cz - BZ + 0.4], [0, 1], [-1, 0], 2 * BZ - 0.8], [[cx - BX + 0.4, cz - BZ], [1, 0], [0, -1], 2 * BX - 0.8], [[cx - BX + 0.4, cz + BZ], [1, 0], [0, 1], 2 * BX - 0.8],
    [[cx + BX, cz - BZ + 0.4], [0, 1], [1, 0], BZ - SZ - 0.8], [[cx + BX, cz + SZ + 0.4], [0, 1], [1, 0], BZ - SZ - 0.8],
    [[cx + BX + 0.4, cz - SZ], [1, 0], [0, -1], SX - 0.8], [[cx + BX + 0.4, cz + SZ], [1, 0], [0, 1], SX - 0.8],
    [[cx + BX + SX, cz - SZ + 0.4], [0, 1], [1, 0], SZ - gap - 0.4], [[cx + BX + SX, cz + gap], [0, 1], [1, 0], SZ - gap - 0.4],
  ];
  const rows = [[0.72, 0], [1.4, 0], [1.9, 0], [2.54, 0.22]];
  segs.forEach(([p, dir, nv, len], si) => {
    // chunks of at most 22 m, each a plan of its own
    const nc = Math.ceil(len / 22), cl = len / nc;
    for (let c = 0; c < nc; c++) {
      const bands = [];
      for (const [y, u] of rows) {
        let d = dir, o = [p[0] + dir[0] * c * cl + nv[0] * u, p[1] + dir[1] * c * cl + nv[1] * u];
        // keep the frame right-handed (x along d, y up, z out): d × up must point out
        const cy = [-d[1], 0, d[0]];          // d × (0, 1, 0) = (−dz, 0, dx)
        if (cy[0] * nv[0] + cy[2] * nv[1] < 0) { d = [-d[0], -d[1]]; o = [o[0] + dir[0] * cl, o[1] + dir[1] * cl]; }
        bands.push([o[0], y, o[1], d[0], d[1], nv[0], nv[1], cl]);
      }
      const mid = [p[0] + dir[0] * (c + 0.5) * cl + nv[0] * 0.3, p[1] + dir[1] * (c + 0.5) * cl + nv[1] * 0.3];
      out.push(...group(`cz-tzomp-${si}-${c}`, mid, { near: 40, fine: 15, mk: (part) => [{ t: 'cz_skulls', bands, part }] }));
    }
  });
  return out;
}

// ---- the Platform of the Eagles and Jaguars: the eagles and the jaguars with their hearts, over the old panels ----
function eaglesPlatform() {
  const [cx, cz] = [-48, -12], a = 7, H = 3.2, steps = Math.round(H / 0.25), step = 0.6, ap = a - step * 0.42, pd = ap - step * 0.04 - 0.002, py0 = H * 0.55 + 0.06, sw = 2, edge = sw + 1.2 + 0.25, uc = edge + 0.15 + 1.15, els = [];
  void steps;
  for (const [fx, fz] of [[0, -1], [0, 1], [1, 0], [-1, 0]]) for (const sd of [-1, 1]) {
    const f = fz ? sd * fz * -1 : sd * fx, x = fz ? cx + sd * uc : cx + fx * pd, z = fz ? cz + fz * pd : cz + sd * uc;
    els.push({ what: sd < 0 ? 'eagle' : 'jaguar', f, at: [x, z], y: py0, dir: [fx, fz] });
  }
  return group('cz-eagles', [cx, cz], { near: 40, fine: 15, mk: (part) => els.map((e) => ({ t: 'cz_animal_panel', ...e, part })) });
}

/** All the sculpture plans. */
export function sculptPlans() { return [...castillo(), ...warriors(), ...pillars(), ...ballcourt(), ...tzompantli(), ...eaglesPlatform()]; }
