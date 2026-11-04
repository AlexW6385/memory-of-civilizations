// Neo-Babylonian architecture (6th c. BC; docs/settlements/babylon.md §4): the Mesopotamian mud-brick
// vocabulary (src/styles/sumerian) with Nebuchadnezzar's baked brick and glazed brick — the
// Ishtar Gate's towers in blue glaze with rows of beasts, crenellated; glazed walls along the
// Processional Way; the city's double walls with towers.

import { registerStyle, STYLES } from '../../core/build.js';
import { box } from '../../core/geom.js';
import '../sumerian/index.js';

const G = 'tile_lapis', B = 'brick_baked';
function crenels(bag, r, y, mat, step = 1.4) {
  const [x0, z0, x1, z1] = r, along = x1 - x0 > z1 - z0, L = along ? x1 - x0 : z1 - z0, n = Math.floor(L / step);
  for (let i = 0; i < n; i += 2) {
    const u0 = (along ? x0 : z0) + i * L / n, u1 = u0 + L / n;
    for (const s of [0, 1]) { const q = along ? [u0, s ? z1 - 0.6 : z0, u1, s ? z1 : z0 + 0.6] : [s ? x1 - 0.6 : x0, u0, s ? x1 : x0 + 0.6, u1]; bag.add(mat, box(q[0], y, q[1], q[2], y + 1.2, q[3])); bag.add(mat, box(q[0] + 0.15, y + 1.2, q[1] + 0.15, q[2] - 0.15, y + 1.7, q[3] - 0.15)); }
  }
}
/** A row of beasts on a glazed face: small raised yellow-brown panels at intervals. */
function beasts(bag, r, face, y, step = 3) {
  const [x0, z0, x1, z1] = r, along = face === 'n' || face === 's', L = along ? x1 - x0 : z1 - z0, n = Math.floor(L / step);
  for (let i = 0; i < n; i++) {
    const u = (along ? x0 : z0) + (i + 0.5) * L / n;
    const q = face === 'n' ? [u - 0.9, z0 - 0.08, u + 0.9, z0] : face === 's' ? [u - 0.9, z1, u + 0.9, z1 + 0.08] : face === 'w' ? [x0 - 0.08, u - 0.9, x0, u + 0.9] : [x1, u - 0.9, x1 + 0.08, u + 0.9];
    bag.add('paint_ochre', box(q[0], y, q[1], q[2], y + 1.2, q[3]));
  }
}
/** ishtar_gate: { c, dir ('ns': the way runs along z), w (the passage), d (depth), h (outer), h2 (inner) } — the outer and inner gates, their towers, the arched passage. */
function ishtarGate(el, { bag, col }) {
  const [cx, cz] = el.c, w = el.w ?? 5, D = el.d ?? 40, h = el.h ?? 14, h2 = el.h2 ?? 23, y = el.y ?? 0;
  const parts = [[cz - D / 2, cz - D / 2 + 14, h, 9], [cz - D / 2 + 16, cz + D / 2, h2, 12]];
  for (const [z0, z1, H, tw] of parts) {
    for (const s of [-1, 1]) {
      const r = s < 0 ? [cx - w / 2 - tw, z0, cx - w / 2, z1] : [cx + w / 2, z0, cx + w / 2 + tw, z1];
      bag.add(G, box(r[0], y - 0.5, r[1], r[2], y + H, r[3])); col.rect(r, y, y + H); col.floor(r, y + H);
      crenels(bag, r, y + H, G);
      for (let k = 0; k < 4; k++) beasts(bag, r, 'n', y + 2 + k * (H - 4) / 4), beasts(bag, r, 's', y + 2 + k * (H - 4) / 4);
      // the towers projecting at the corners
      for (const tz of [z0 - 1.5, z1 - 4.5]) { const t = [r[0] - 1.5, tz, r[2] + 1.5, tz + 6]; bag.add(G, box(t[0], y - 0.5, t[1], t[2], y + H + 2, t[3])); col.rect(t, y, y + H + 2); crenels(bag, t, y + H + 2, G); }
    }
    bag.add(G, box(cx - w / 2, y + H * 0.62, z0, cx + w / 2, y + H, z1));
  }
  bag.add(B, box(cx - w / 2, y - 0.3, cz - D / 2, cx + w / 2, y + 0.05, cz + D / 2)); col.floor([cx - w / 2, cz - D / 2, cx + w / 2, cz + D / 2], y + 0.05);
}
/** glazed_wall: a wall a→b { h, th } in glazed brick with a row of lions, crenellated. */
function glazedWall(el, { bag, col }) {
  const [ax, az] = el.a, [bx, bz] = el.b, th = el.th ?? 2.5, h = el.h ?? 8, y = el.y ?? 0;
  const r = [Math.min(ax, bx) - (ax === bx ? th / 2 : 0), Math.min(az, bz) - (az === bz ? th / 2 : 0), Math.max(ax, bx) + (ax === bx ? th / 2 : 0), Math.max(az, bz) + (az === bz ? th / 2 : 0)];
  bag.add(el.mat || G, box(r[0], y - 0.5, r[1], r[2], y + h, r[3])); col.rect(r, y, y + h);
  crenels(bag, r, y + h, el.mat || G);
  if (el.lions !== false) for (const f of ax === bx ? ['w', 'e'] : ['n', 's']) beasts(bag, r, f, y + 1.6, 4);
}
/** city_wall: a double wall with towers a→b { h, th, gap (between the two walls), y }. */
function cityWall(el, { bag, col }) {
  const [ax, az] = el.a, [bx, bz] = el.b, th = el.th ?? 6, h = el.h ?? 15, gap = el.gap ?? 12, y = el.y ?? 0, alongX = az === bz;
  for (const [o, hh, t] of [[0, h, th], [gap + th, h * 0.75, th * 0.65]]) {
    const r = alongX ? [Math.min(ax, bx), az - t / 2 + o, Math.max(ax, bx), az + t / 2 + o] : [ax - t / 2 + o, Math.min(az, bz), ax + t / 2 + o, Math.max(az, bz)];
    if (r[2] - r[0] < 0.5 || r[3] - r[1] < 0.5) continue;
    bag.add(B, box(r[0], y - 0.5, r[1], r[2], y + hh, r[3])); col.rect(r, y, y + hh); col.floor(r, y + hh); crenels(bag, r, y + hh, B, 1.6);
    const L = alongX ? r[2] - r[0] : r[3] - r[1], n = Math.floor(L / 20);
    for (let i = 0; i <= n; i++) { const u = (alongX ? r[0] : r[1]) + i * L / Math.max(1, n); const q = alongX ? [u - 4, r[1] - 2, u + 4, r[3] + 2] : [r[0] - 2, u - 4, r[2] + 2, u + 4]; bag.add(B, box(q[0], y - 0.5, q[1], q[2], y + hh + 3, q[3])); col.rect(q, y, y + hh + 3); }
  }
}
registerStyle('babylonian', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.sumerian.elements, ishtar_gate: ishtarGate, glazed_wall: glazedWall, city_wall: cityWall },
  objects: {},
});
