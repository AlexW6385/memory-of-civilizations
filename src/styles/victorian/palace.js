// The Palace of Westminster's ranges (docs/settlements/london.md §1, §4): Barry's symmetrical river front
// with Pugin's Perpendicular detail — rhythmic buttresses rising into pinnacles, square-headed windows of
// two lights with tracery in their heads under label moulds, the close panelling of blind tracery between
// the storeys with carved shields, an openwork parapet, projecting pavilions with octagonal turrets, and
// the roofs of galvanised cast-iron plates with iron cresting.

import { box, frustum, lathe } from '../../core/geom.js';
import { faceFrame, prism, fbox, ngon } from '../dutch/facade.js';

const S = 'limestone_yellow';

/** river_front: { rect, h, y, face, pavilions: [[u0, u1]…] (metres along the face), turrets } */
export function riverFront(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = el.h ?? 22, f = el.face ?? 'e', F = faceFrame(el.rect, f), L = F.w, k = h / 22;
  bag.add(S, box(x0, y - 0.5, z0, x1, y + h, z1)); col.rect(el.rect, y - 0.5, y + h); col.floor(el.rect, y + h);
  const A = (m, ...r) => bag.add(m, fbox(F, y, ...r)), P = (m, pts, d0, d1) => bag.add(m, prism(F, y, pts, d0, d1));
  const n = Math.max(2, Math.round(L / 4.4)), bw = L / n, pav = el.pavilions ?? [];
  const proj = (u) => (pav.some(([a, b]) => u > a + 0.01 && u < b - 0.01) ? 2.4 : 0);
  const rows = [[1.8, 4.9], [6.3, 10.0], [11.5, 14.9], [16.4, 18.9]].map(([a, b]) => [a * k, b * k]);
  A(S, -0.3, L + 0.3, -0.5, 1.2, 0, 0.5);                                                   // the plinth on the terrace
  // what stands out from the wall is solid too: the plinth, the pavilions' bays, the buttresses
  const solid = (u0, u1, d0, d1, y0, y1) => { const a = F.at(u0, d0), b = F.at(u1, d1); col.rect([Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])], y0, y1); };
  solid(-0.3, L + 0.3, 0, 0.5, y - 0.5, y + 1.2);
  for (let i = 0; i < n; i++) {
    const u0 = i * bw, u1 = u0 + bw, um = (u0 + u1) / 2, p = proj(um), top = h + (p ? 1.6 : 0);
    if (p) A(S, u0, u1, 0, top, 0, p); if (p) solid(u0, u1, 0, p, y, y + top);
    // the window of each storey: two lights, a transom, cusped heads, the label over it
    const ww = Math.min(0.72, bw / 2 - 0.8);
    // the panelling runs the full height: shafts at the windows' edges and between the bays' halves
    for (const e of [um - 2 * ww - 0.32, um + 2 * ww + 0.32]) A(S, e - 0.07, e + 0.07, 1.2, top - 0.2, p, p + 0.12);
    for (const [v0, v1] of rows) {
      A(S, um - 2 * ww - 0.3, um + 2 * ww + 0.3, v0 - 0.25, v1 + 0.2, p, p + 0.08);
      A('opening', um - 2 * ww, um + 2 * ww, v0, v1, p + 0.06, p + 0.11);
      for (const u of [um - 2 * ww, um, um + 2 * ww]) A(S, u - 0.09, u + 0.09, v0, v1, p + 0.08, p + 0.2);
      const vt = v0 + (v1 - v0) * 0.62; A(S, um - 2 * ww, um + 2 * ww, vt - 0.07, vt + 0.07, p + 0.08, p + 0.18);
      for (const c of [um - ww, um + ww]) for (const s of [-1, 1]) {                               // cusps: the corners of each light filled to a pointed head
        const e = c + s * (ww - 0.09), m = 0.5;
        P(S, [[e, v1], [e - s * m, v1], [e, v1 - m * 0.9]].sort((a, b) => a[0] - b[0]), p + 0.08, p + 0.16);
      }
      A(S, um - 2 * ww - 0.4, um + 2 * ww + 0.4, v1 + 0.2, v1 + 0.38, p, p + 0.22);                // the label mould and its stops
      for (const s of [-1, 1]) A(S, um + s * (2 * ww + 0.3) - 0.1, um + s * (2 * ww + 0.3) + 0.1, v1 - 0.45, v1 + 0.38, p, p + 0.22);
    }
    // the close panelling between the storeys: narrow blind panels with a carved shield in the middle
    for (let r = 0; r < rows.length; r++) {
      const v0 = rows[r][1] + 0.45, v1 = r + 1 < rows.length ? rows[r + 1][0] - 0.3 : h - 1.5;
      if (v1 - v0 < 0.6) continue;
      const np = 6, pw = (bw - 1.0) / np;
      for (let j = 0; j <= np; j++) { const u = u0 + 0.5 + j * pw; A(S, u - 0.06, u + 0.06, v0, v1, p, p + 0.13); }
      A(S, u0 + 0.5, u1 - 0.5, v0 - 0.06, v0, p, p + 0.1); A(S, u0 + 0.5, u1 - 0.5, v1, v1 + 0.06, p, p + 0.1);
      for (let j = 0; j < np; j++) { const u = u0 + 0.5 + (j + 0.5) * pw; P(S, [[u - pw / 2 + 0.05, v1 - 0.01], [u, v1 - Math.min(0.35, (v1 - v0) * 0.4)], [u + pw / 2 - 0.05, v1 - 0.01]], p, p + 0.06); }
      const sv = (v0 + v1) / 2, sh = Math.min(0.7, (v1 - v0) * 0.7);
      if (r < 3) P(S, [[um - sh * 0.4, sv + sh / 2], [um + sh * 0.4, sv + sh / 2], [um + sh * 0.4, sv - sh * 0.1], [um, sv - sh / 2], [um - sh * 0.4, sv - sh * 0.1]], p + 0.08, p + 0.16);
    }
    // the openwork parapet: panels pierced with quatrefoils, a coping
    A(S, u0, u1, top - 0.2, top + 1.0, p - 0.3, p + 0.1);
    for (let j = 0; j < 3; j++) { const u = u0 + (j + 0.5) * bw / 3; P('opening', ngon(u, top + 0.4, 0.28, 4).map(([a, b]) => [a, b]), p + 0.1, p + 0.12); P(S, ngon(u, top + 0.4, 0.09, 8), p + 0.12, p + 0.16); }
    A(S, u0 - 0.02, u1 + 0.02, top + 1.0, top + 1.15, p - 0.35, p + 0.18);
  }
  // the buttresses at the bays' edges, set back at each storey, each ending in a crocketed pinnacle
  for (let i = 0; i <= n; i++) {
    const u = i * bw, p = Math.max(proj(u - 0.1), proj(u + 0.1)), top = h + (p ? 1.6 : 0);
    A(S, u - 0.36, u + 0.36, 0, top + 1.2, p, p + 0.7);
    solid(u - 0.36, u + 0.36, 0, p + 0.7, y, y + top + 1.2);
    for (const [, v1] of rows) A(S, u - 0.42, u + 0.42, v1 + 0.5, v1 + 0.75, p, p + 0.8);
    pinnacle(bag, F, y, u, top + 1.2, p + 0.35, 0.6, 3.6);
  }
  // pavilions: an octagonal turret at each corner, rising above the parapet under a cap of iron plates
  if (el.turrets !== false) for (const [a, b] of pav) for (const u of [a, b]) {
    const [tx, tz] = F.at(u, 2.4 - 0.4), r = 0.95;
    bag.add(S, lathe([[r, 0], [r, h + 5.5]], 8, null, tx, y, tz));
    col.circle(tx, tz, r + 0.12, y, y + h + 1.6);
    for (const v of [h * 0.33, h * 0.62, h + 1.6]) bag.add(S, lathe([[r + 0.12, 0], [r + 0.12, 0.3]], 8, null, tx, y + v, tz));
    for (let j = 0; j < 8; j++) { const t = (j + 0.5) * Math.PI / 4; bag.add('opening', box(tx + Math.cos(t) * r * 0.93 - 0.12, y + h + 2.4, tz + Math.sin(t) * r * 0.93 - 0.12, tx + Math.cos(t) * r * 0.93 + 0.12, y + h + 4.6, tz + Math.sin(t) * r * 0.93 + 0.12)); }
    bag.add('iron_galv', lathe([[r + 0.15, 0], [r * 0.9, 1.0], [r * 0.45, 2.4], [0.12, 3.6], [0.001, 4.0]], 8, null, tx, y + h + 5.5, tz));
    bag.add('gilt_bronze', lathe([[0.001, 0], [0.12, 0.2], [0.001, 0.5]], 6, null, tx, y + h + 9.4, tz));
  }
  // the roof of cast-iron plates, its iron cresting along the ridge
  const along = f === 'n' || f === 's', w = along ? z1 - z0 : x1 - x0, rh = w * 0.38;
  bag.add('iron_galv', frustum([x0 + 0.5, z0 + 0.5, x1 - 0.5, z1 - 0.5], y + h, y + h + rh, along ? 0 : w / 2 - 0.55, along ? 0 : w / 2 - 0.55, along ? w / 2 - 0.55 : 0, along ? w / 2 - 0.55 : 0));
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, len = along ? x1 - x0 - 1 : z1 - z0 - 1;
  for (let t = -len / 2 + 0.3; t < len / 2; t += 0.6) { const px = along ? cx + t : cx, pz = along ? cz : cz + t; bag.add('iron', box(px - 0.03, y + h + rh - 0.05, pz - 0.03, px + 0.03, y + h + rh + 0.55, pz + 0.03)); }
  bag.add('iron', along ? box(x0 + 0.5, y + h + rh + 0.4, cz - 0.03, x1 - 0.5, y + h + rh + 0.46, cz + 0.03) : box(cx - 0.03, y + h + rh + 0.4, z0 + 0.5, cx + 0.03, y + h + rh + 0.46, z1 - 0.5));
}

/** A pinnacle on frame F at (u, v), standing d out: a shaft with gablets, a crocketed spirelet and finial. */
function pinnacle(bag, F, y, u, v, d, s, hh) {
  const [x, z] = F.at(u, d);
  bag.add(S, box(x - s / 2, y + v, z - s / 2, x + s / 2, y + v + hh * 0.35, z + s / 2));
  bag.add(S, lathe([[s * 0.62, 0], [0.001, hh * 0.65]], 4, null, x, y + v + hh * 0.35, z).rotateY(0));
  for (let j = 1; j < 4; j++) { const vv = y + v + hh * 0.35 + j * hh * 0.15, r = s * 0.62 * (1 - j * 0.15 / 0.65) + 0.06; bag.add(S, box(x - r, vv, z - 0.04, x + r, vv + 0.1, z + 0.04)); bag.add(S, box(x - 0.04, vv, z - r, x + 0.04, vv + 0.1, z + r)); }
  bag.add(S, lathe([[0.001, 0], [0.1, 0.1], [0.001, 0.3]], 6, null, x, y + v + hh, z));
}
