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
  // a frame on each face: u along it, d outward from it; R(u0, u1, y0, y1, d0, d1) is a box in that frame
  const frame = (face) => {
    const along = face === 'n' || face === 's', o = face === 'n' ? z0 : face === 's' ? z1 : face === 'w' ? x0 : x1, sg = face === 'n' || face === 'w' ? -1 : 1;
    return (u0, u1, y0, y1, d0, d1) => { const a = o + sg * d0, b = o + sg * d1; return along ? box(u0, y0, Math.min(a, b), u1, y1, Math.max(a, b)) : box(Math.min(a, b), y0, u0, Math.max(a, b), y1, u1); };
  };
  // the bays: pilasters standing out between them; in each, tiers of paired windows — the lower square
  // under grilles, the upper with pointed heads — and a muqarnas cap stepping out at the top of the bay
  const pm = f === 'n' || f === 's' ? (x0 + x1) / 2 - (x1 - x0) * 0.25 : (z0 + z1) / 2;
  const inPortal = (face, u, half) => face === f && Math.abs(u - pm) < 5 + half + 0.6;
  for (const face of 'nsew') {
    const R = frame(face), along = face === 'n' || face === 's', a0 = along ? x0 : z0, L = along ? x1 - x0 : z1 - z0, n = Math.floor(L / 7);
    for (let i = 0; i <= n; i++) { const u = a0 + i * L / n; if (!inPortal(face, u, 0.7)) bag.add(S, R(u - 0.7, u + 0.7, y, y + h - 1.6, 0, 0.45)); }
    for (let i = 0; i < n; i++) {
      const u = a0 + (i + 0.5) * L / n, bw = L / n / 2 - 0.9;
      if (inPortal(face, u, bw)) continue;
      for (const [yy, hh, pointed] of [[y + 4, 4.2, false], [y + 13, 5.5, true], [y + 23, 4.8, true]]) for (const s2 of [-0.9, 0.9]) {
        bag.add('opening', R(u + s2 - 0.55, u + s2 + 0.55, yy, yy + hh, -0.02, 0.05));
        bag.add(S, R(u + s2 - 0.75, u + s2 + 0.75, yy - 0.25, yy, 0, 0.12));
        if (pointed) bag.add(S, R(u + s2 - 0.28, u + s2 + 0.28, yy + hh, yy + hh + 0.5, -0.02, 0.06));
        if (!pointed) for (let g = 1; g < 4; g++) bag.add('iron', R(u + s2 - 0.55, u + s2 + 0.55, yy + g * hh / 4 - 0.03, yy + g * hh / 4 + 0.03, 0.05, 0.1));
      }
      for (let k = 0; k < 4; k++) bag.add(S, R(u - bw + k * 0.25, u + bw - k * 0.25, y + h - 5.5 + k * 0.9, y + h - 4.6 + k * 0.9, 0, 0.12 + k * 0.1));
    }
  }
  // the portal: two piers standing out from the face, the hood of muqarnas stepping out across the top
  // of the recess between them, the door at the back under a grilled window, frames of moulding
  const R = frame(f), m = f === 'n' || f === 's' ? (x0 + x1) / 2 - (x1 - x0) * 0.25 : (z0 + z1) / 2, ph = h * 1.05, D = 3, W = 5;
  for (const s2 of [-1, 1]) bag.add(S, R(s2 < 0 ? m - W : m + W - 1.6, s2 < 0 ? m - W + 1.6 : m + W, y - 0.5, y + ph, 0, D));
  bag.add(S, R(m - W, m + W, y + ph * 0.8, y + ph, 0, D));
  bag.add(S, R(m - W - 0.3, m + W + 0.3, y + ph - 1.2, y + ph - 0.6, D - 0.2, D + 0.3));
  for (let k = 0; k < 7; k++) {
    const yy = y + ph * 0.58 + k * (ph * 0.22) / 7, out = D * (k + 1) / 7, n2 = 7 - Math.floor(k / 2);
    for (let i = 0; i < n2; i++) { const u0 = m - W + 1.6 + i * (2 * W - 3.2) / n2, u1 = u0 + (2 * W - 3.2) / n2 - 0.08; bag.add(S, R(u0, u1, yy, yy + ph * 0.22 / 7, 0, out)); }
  }
  bag.add('opening', R(m - 1.3, m + 1.3, y, y + 5.2, -0.02, 0.06));
  bag.add(S, R(m - 1.7, m + 1.7, y + 5.2, y + 5.9, 0, 0.2));
  bag.add('opening', R(m - 1.0, m + 1.0, y + 7.5, y + 10.5, -0.02, 0.06));
  for (let g = 1; g < 5; g++) bag.add('iron', R(m - 1.0, m + 1.0, y + 7.5 + g * 0.6 - 0.03, y + 7.5 + g * 0.6 + 0.03, 0.06, 0.1));
  for (const s2 of [-1, 1]) bag.add(S, R(s2 < 0 ? m - W + 1.6 : m + W - 1.9, s2 < 0 ? m - W + 1.9 : m + W - 1.6, y, y + ph * 0.58, 0, 0.3));
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
