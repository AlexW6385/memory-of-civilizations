// Minoan architecture (Neopalatial, about 1600 BC; docs/settlements/knossos.md §4): wings of
// several storeys round a central court; a base of gypsum ashlar, upper walls of rubble and timber
// plastered ochre; porticoes of red columns tapering downward with black cushion capitals; flat
// roofs edged with horns of consecration; stepped theatral areas; the town's two-storey houses with
// red-framed windows.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, lathe } from '../../core/geom.js';
import '../qing/index.js';

const G = 'gypsum_minoan', P = 'plaster_ochre', RED = 'paint_minoan_red', BLK = 'paint_minoan_black';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function column(bag, col, x, z, y, h, r = 0.35) {
  bag.add(G, lathe([[r * 1.6, 0], [r * 1.6, 0.25]], 10, null, x, y, z));
  bag.add(RED, lathe([[r * 0.85, 0], [r * 1.15, h - 0.7]], 10, null, x, y + 0.25, z));
  bag.add(BLK, lathe([[r * 1.2, 0], [r * 1.7, 0.2], [r * 1.7, 0.35], [r * 1.25, 0.45]], 10, null, x, y + h - 0.45, z));
  bag.add(BLK, box(x - r * 1.7, y + h - 0.02, z - r * 1.7, x + r * 1.7, y + h + 0.25, z + r * 1.7));
  col.circle(x, z, r * 1.2, y, y + h);
}
const horns = (bag, x, y, z, s = 1, alongX = true) => {
  const w = 0.9 * s, t = 0.25 * s;
  bag.add('plaster', box(x - (alongX ? w : t), y, z - (alongX ? t : w), x + (alongX ? w : t), y + 0.3 * s, z + (alongX ? t : w)));
  for (const k of [-1, 1]) { const ox = alongX ? k * w * 0.8 : 0, oz = alongX ? 0 : k * w * 0.8; bag.add('plaster', box(x + ox - t, y + 0.3 * s, z + oz - t, x + ox + t, y + 1.0 * s, z + oz + t)); }
};

/** wing: a block of storeys { rect, y, storeys, sh (storey height), windows ('nesw'), horns, roof walkable }. */
function wing(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, n = el.storeys ?? 2, sh = el.sh ?? 3.6, H = n * sh, rand = rng(el.seed || 3);
  bag.add(G, box(x0, y - 2, z0, x1, y + 1.2, z1));
  bag.add(P, box(x0 + 0.05, y + 1.2, z0 + 0.05, x1 - 0.05, y + H, z1 - 0.05));
  col.rect(el.rect, y - 2, y + H); col.floor(el.rect, y + H);
  // timber bands between storeys and the roof's edge
  for (let k = 1; k <= n; k++) bag.add(k === n ? 'plaster' : 'timber', box(x0 - 0.06, y + k * sh - 0.3, z0 - 0.06, x1 + 0.06, y + k * sh, z1 + 0.06));
  if (!el.simple) {
    // windows in red frames on the outer faces
    const faces = el.windows ?? 'nesw';
    for (const f of faces) {
      const alongX = f === 'n' || f === 's', L = alongX ? x1 - x0 : z1 - z0, m = Math.floor(L / 4.2);
      for (let k = 1; k < n; k++) for (let i = 0; i < m; i++) {
        if (rand() < 0.35) continue;
        const u = (alongX ? x0 : z0) + (i + 0.5) * L / m, yy = y + k * sh + 0.9;
        const r = f === 'n' ? [u - 0.6, z0 - 0.08, u + 0.6, z0 + 0.02] : f === 's' ? [u - 0.6, z1 - 0.02, u + 0.6, z1 + 0.08] : f === 'w' ? [x0 - 0.08, u - 0.6, x0 + 0.02, u + 0.6] : [x1 - 0.02, u - 0.6, x1 + 0.08, u + 0.6];
        bag.add(RED, box(r[0], yy - 0.1, r[1], r[2], yy + 1.5, r[3]));
        const d = 0.04, ri = alongX ? [r[0] + 0.15, r[1] - d, r[2] - 0.15, r[3] + d] : [r[0] - d, r[1] + 0.15, r[2] + d, r[3] - 0.15];
        bag.add('opening', box(ri[0], yy + 0.05, ri[1], ri[2], yy + 1.35, ri[3]));
      }
    }
    // the timber frame showing in the plaster (posts and rails), and a painted frieze of running spirals under the roof's edge
    for (const f of 'nesw') {
      const alongX = f === 'n' || f === 's', L = alongX ? x1 - x0 : z1 - z0, a0 = alongX ? x0 : z0, fp = f === 'n' ? z0 : f === 's' ? z1 : f === 'w' ? x0 : x1, sg = f === 'n' || f === 'w' ? -1 : 1;
      const at = (u0, u1, v0, v1, d) => { const p0 = fp + sg * 0.02, p1 = fp + sg * d; const q = alongX ? [a0 + u0, Math.min(p0, p1), a0 + u1, Math.max(p0, p1)] : [Math.min(p0, p1), a0 + u0, Math.max(p0, p1), a0 + u1]; return box(q[0], v0, q[1], q[2], v1, q[3]); };
      const mw = Math.max(1, Math.floor(L / 4.2));
      for (let i = 0; i <= mw; i++) { const u = Math.min(L - 0.2, Math.max(0.05, i * L / mw - 0.07)); bag.add('timber', at(u, u + 0.14, y + 1.2, y + H - 0.3, 0.05)); }
      const m = Math.floor(L / 0.6);
      for (let i = 0; i < m; i++) bag.add(i % 3 === 0 ? 'paint_blue' : i % 3 === 1 ? RED : 'paint_ochre', at(i * L / m, (i + 1) * L / m - 0.04, y + H - 0.85, y + H - 0.35, 0.09));
    }
    if (el.horns !== false) {
      for (let x = x0 + 2; x < x1 - 1; x += 4) { horns(bag, x, y + H, z0 + 0.4); horns(bag, x, y + H, z1 - 0.4); }
      for (let z = z0 + 2; z < z1 - 1; z += 4) { horns(bag, x0 + 0.4, y + H, z, 1, false); horns(bag, x1 - 0.4, y + H, z, 1, false); }
    }
  }
}

/** portico: a row of red columns { a, b, y, h, n, depth, side (+1/−1: which way the roof runs back) } with a lintel and a roof. */
function portico(el, { bag, col }) {
  const [ax, az] = el.a, [bx, bz] = el.b, y = el.y ?? 0, h = el.h ?? 3.4, n = el.n ?? 4, dp = el.depth ?? 3, s = el.side ?? 1;
  const L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, nx = -uz * s, nz = ux * s;
  bag.add(G, box(Math.min(ax, bx, ax + nx * dp, bx + nx * dp) - 0.3, y - 0.4, Math.min(az, bz, az + nz * dp, bz + nz * dp) - 0.3, Math.max(ax, bx, ax + nx * dp, bx + nx * dp) + 0.3, y, Math.max(az, bz, az + nz * dp, bz + nz * dp) + 0.3));
  for (let i = 0; i < n; i++) { const t = (i + 0.5) / n; column(bag, col, ax + ux * L * t, az + uz * L * t, y, h); }
  const r = [Math.min(ax, bx, ax + nx * dp, bx + nx * dp), Math.min(az, bz, az + nz * dp, bz + nz * dp), Math.max(ax, bx, ax + nx * dp, bx + nx * dp), Math.max(az, bz, az + nz * dp, bz + nz * dp)];
  bag.add('timber', box(r[0] - 0.2, y + h + 0.25, r[1] - 0.2, r[2] + 0.2, y + h + 0.7, r[3] + 0.2));
  bag.add('plaster', box(r[0] - 0.3, y + h + 0.7, r[1] - 0.3, r[2] + 0.3, y + h + 1.0, r[3] + 0.3)); col.floor(r, y + h + 1.0);
}

/** steps: a stepped area { rect, y0, n, rise, dir ('n'|'s'|'e'|'w': which way they climb) } of gypsum. */
function steps(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, n = el.n ?? 6, rise = el.rise ?? 0.3, y0 = el.y0 ?? 0;
  for (let i = 0; i < n; i++) {
    const f0 = i / n, f1 = (i + 1) / n, y = y0 + (i + 1) * rise;
    const r = el.dir === 'n' ? [x0, z1 - (z1 - z0) * f1, x1, z1 - (z1 - z0) * f0] : el.dir === 's' ? [x0, z0 + (z1 - z0) * f0, x1, z0 + (z1 - z0) * f1] : el.dir === 'e' ? [x0 + (x1 - x0) * f0, z0, x0 + (x1 - x0) * f1, z1] : [x1 - (x1 - x0) * f1, z0, x1 - (x1 - x0) * f0, z1];
    const full = el.dir === 'n' ? [x0, z0, x1, r[3]] : el.dir === 's' ? [x0, r[1], x1, z1] : el.dir === 'e' ? [r[0], z0, x1, z1] : [x0, z0, r[2], z1];
    bag.add(G, box(full[0], y0 - 0.5, full[1], full[2], y, full[3])); col.floor(r, y);
  }
}

/** minoan_house: { rect, seed, y }: two storeys of plaster over a gypsum base, red-framed windows, a flat roof. */
function house(el, ctx) {
  const rand = rng(el.seed || 1);
  wing({ rect: el.rect, y: el.y ?? 0, storeys: rand() < 0.6 ? 2 : 3, sh: 3.0, windows: 'nesw', horns: false, seed: el.seed, simple: el.simple }, ctx);
}

registerStyle('minoan', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, wing, portico, steps, minoan_house: house },
  objects: {},
});
