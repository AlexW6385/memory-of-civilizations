// Mamluk architecture (14th c.; docs/settlements/mamluk-cairo.md §4): the great madrasa-mosque as a
// cliff of cut stone — tall recessed window bays, a crown of crenellations over a muqarnas cornice,
// the deep portal; the dome of the founder's tomb on a drum of stepped corners; minarets in tiers
// (square, octagonal, round) with balconies and a bulbous top; the Citadel's walls and towers on its
// spur; the city's houses (src/styles/vernacular's mud-brick house).

import { registerStyle, STYLES } from '../../core/build.js';
import { box, lathe } from '../../core/geom.js';
import '../qing/index.js';

const S = 'limestone_yellow';
function crest(bag, r, y, mat = S) {
  const [x0, z0, x1, z1] = r;
  bag.add(mat, box(x0 - 0.9, y - 1.6, z0 - 0.9, x1 + 0.9, y, z1 + 0.9));            // the muqarnas cornice (a projecting band)
  for (const [a, b, alongX] of [[x0, x1, true], [z0, z1, false]]) {
    const n = Math.floor((b - a) / 2.2);
    for (let i = 0; i < n; i += 2) {
      const u0 = a + i * (b - a) / n, u1 = u0 + (b - a) / n;
      for (const s of [0, 1]) { const q = alongX ? [u0, s ? z1 : z0 - 0.4, u1, s ? z1 + 0.4 : z0] : [s ? x1 : x0 - 0.4, u0, s ? x1 + 0.4 : x0, u1]; bag.add(mat, box(q[0], y, q[1], q[2], y + 1.3, q[3])); bag.add(mat, lathe([[0.5, 0], [0.001, 0.8]], 6, null, (q[0] + q[2]) / 2, y + 1.3, (q[1] + q[3]) / 2)); }
    }
  }
}
/** mamluk_minaret: { c, h, y } — square, octagonal and round tiers, balconies, a bulb. */
function minaret(el, { bag, col }) {
  const [x, z] = el.c, y = el.y ?? 0, h = el.h ?? 70, r = el.r ?? 3;
  bag.add(S, box(x - r, y - 0.5, z - r, x + r, y + h * 0.35, z + r)); col.rect([x - r, z - r, x + r, z + r], y, y + h * 0.9);
  bag.add(S, lathe([[r * 1.35, 0], [r * 1.35, 1.3], [r * 0.85, 1.3]], 8, null, x, y + h * 0.35, z));
  bag.add(S, lathe([[r * 0.85, 0], [r * 0.8, h * 0.28]], 8, null, x, y + h * 0.35 + 1.3, z));
  bag.add(S, lathe([[r * 1.2, 0], [r * 1.2, 1.2], [r * 0.6, 1.2]], 12, null, x, y + h * 0.64, z));
  bag.add(S, lathe([[r * 0.6, 0], [r * 0.55, h * 0.18]], 12, null, x, y + h * 0.64 + 1.2, z));
  for (const [dx, dz] of [[-0.35, -0.35], [0.35, -0.35], [-0.35, 0.35], [0.35, 0.35]]) bag.add(S, lathe([[0.25, 0], [0.25, h * 0.06]], 6, null, x + dx * r, y + h * 0.84, z + dz * r));
  bag.add(S, lathe([[r * 0.7, 0], [r * 0.8, r * 0.5], [r * 0.5, r * 1.1], [0.001, r * 1.4]], 12, null, x, y + h * 0.9, z));
}
/** mamluk_dome: { c, r, y, drum } — a stone dome on a drum, its zone of transition as stepped corners. */
function dome(el, { bag, col }) {
  const [x, z] = el.c, r = el.r, y = el.y ?? 0, dr = el.drum ?? r * 0.5;
  bag.add(S, box(x - r * 1.1, y, z - r * 1.1, x + r * 1.1, y + dr * 0.6, z + r * 1.1));
  bag.add(S, lathe([[r * 1.08, 0], [r * 1.02, dr * 0.4]], 8, null, x, y + dr * 0.6, z));
  bag.add(S, lathe([[r, 0], [r, dr * 0.4]], 16, null, x, y + dr, z));
  bag.add('stucco', lathe([[r * 0.98, 0], [r * 0.95, r * 0.35], [r * 0.8, r * 0.7], [r * 0.5, r * 0.95], [0.001, r * 1.08]], 24, null, x, y + dr * 1.4, z));
  bag.add('bronze', lathe([[0.15, 0], [0.4, 0.6], [0.05, 1.6], [0.001, 2]], 6, null, x, y + dr * 1.4 + r * 1.08, z));
  col.circle(x, z, r * 1.1, y, y + dr);
}
/** madrasa_block: { rect, h, y, portal ('n'|'s'|'e'|'w'), court (rect of the open court) } — the sheer stone block with window bays, the crown, the portal recess. */
function block(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = el.h ?? 36, f = el.portal ?? 'n', court = el.court;
  const parts = court ? [[x0, z0, x1, court[1]], [x0, court[3], x1, z1], [x0, court[1], court[0], court[3]], [court[2], court[1], x1, court[3]]] : [[x0, z0, x1, z1]];
  for (const r of parts) { if (r[2] - r[0] < 0.5 || r[3] - r[1] < 0.5) continue; bag.add(S, box(r[0], y - 0.5, r[1], r[2], y + h, r[3])); col.rect(r, y, y + h); }
  if (court) { bag.add('marble', box(court[0], y - 0.3, court[1], court[2], y + 0.06, court[3])); col.floor(court, y + 0.06); }
  crest(bag, [x0, z0, x1, z1], y + h);
  // the tall recessed window bays
  for (const face of 'nsew') {
    const along = face === 'n' || face === 's', L = along ? x1 - x0 : z1 - z0, n = Math.floor(L / 7);
    for (let i = 0; i < n; i++) {
      const u = (along ? x0 : z0) + (i + 0.5) * L / n;
      for (const [yy, hh] of [[y + 4, 6], [y + 14, 7], [y + 25, 6]]) {
        const q = face === 'n' ? [u - 1.6, z0 - 0.06, u + 1.6, z0 + 0.02] : face === 's' ? [u - 1.6, z1 - 0.02, u + 1.6, z1 + 0.06] : face === 'w' ? [x0 - 0.06, u - 1.6, x0 + 0.02, u + 1.6] : [x1 - 0.02, u - 1.6, x1 + 0.06, u + 1.6];
        bag.add('opening', box(q[0], yy, q[1], q[2], yy + hh, q[3]));
      }
    }
  }
  // the portal: a tall recess with its half-dome hood
  const m = f === 'n' || f === 's' ? (x0 + x1) / 2 - (x1 - x0) * 0.25 : (z0 + z1) / 2, ph = h * 1.05;
  const q = f === 'n' ? [m - 5, z0 - 3, m + 5, z0 + 0.02] : f === 's' ? [m - 5, z1 - 0.02, m + 5, z1 + 3] : f === 'w' ? [x0 - 3, m - 5, x0 + 0.02, m + 5] : [x1 - 0.02, m - 5, x1 + 3, m + 5];
  bag.add(S, box(q[0], y - 0.5, q[1], q[2], y + ph, q[3]));
  bag.add('opening', box(q[0] + (f === 'w' || f === 'e' ? 0 : 1.5), y, q[1] + (f === 'n' || f === 's' ? 0 : 1.5), q[2] - (f === 'w' || f === 'e' ? 0 : 1.5), y + ph * 0.8, q[3] - (f === 'n' || f === 's' ? 0 : 1.5)));
}
/** citadel_wall: a→b { h, th, y } with round towers. */
function citadelWall(el, { bag, col }) {
  const [ax, az] = el.a, [bx, bz] = el.b, h = el.h ?? 12, th = el.th ?? 3, y = el.y ?? 0, L = Math.hypot(bx - ax, bz - az);
  const r = [Math.min(ax, bx) - th / 2, Math.min(az, bz) - th / 2, Math.max(ax, bx) + th / 2, Math.max(az, bz) + th / 2];
  bag.add(S, box(r[0], y - 2, r[1], r[2], y + h, r[3])); col.rect(r, y - 2, y + h); col.floor(r, y + h);
  const n = Math.max(1, Math.floor(L / 30));
  for (let i = 0; i <= n; i++) { const x = ax + (bx - ax) * i / n, z = az + (bz - az) * i / n; bag.add(S, lathe([[th * 1.6, 0], [th * 1.5, h + 3 + 2]], 16, null, x, y - 2, z)); col.circle(x, z, th * 1.6, y - 2, y + h + 3); }
}
registerStyle('mamluk', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, mamluk_minaret: minaret, mamluk_dome: dome, madrasa_block: block, citadel_wall: citadelWall },
  objects: {},
});
