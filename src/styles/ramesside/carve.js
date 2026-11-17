// The carved surfaces of the two temples that the first pass left bare (docs/settlements/abu-simbel.md §16): the side and back faces of the Osiride
// pillars, the walls of the door passage and of the narrow passages between the halls, the walls of the side chambers (the treasuries), the Small
// Temple's door passage and its chamber, and the stele of the marriage with the Hittite princess cut in the rock south of the façade.
// Everything lies on a face, proud of it by a few centimetres (egyptian/objects.js: wallReliefs, figure).

import { box } from '../../core/geom.js';
import { cavettoProfile } from '../egyptian/trim.js';
import { wallReliefs, figure } from '../egyptian/objects.js';
import { extrudeProfile } from './util.js';
import { greatRooms, greatChambers, smallRooms, SMALL_CHAMBERS, HALL1 } from './dims.js';

/** The relief on the wall of a passage or room: a thin wrapper that keeps to the walls' own arguments. */
const rel = (bag, a, b, n, y, v0, top, reg, extra = {}) => wallReliefs({ a, b, n, y, v0, top, reg, inward: 1, gods: 'paint', ...extra }, { bag });

/** The Great Temple's carving beyond the halls' great walls; fx the façade's x, z0 the axis' z (0). */
export function carveGreat(bag, col, fx) {
  const X = (d) => fx - d, R = greatRooms(), H = HALL1;
  // ── the Osiride pillars: the face toward the side aisle carries the king embraced by the gods, the faces along the nave's aisles the registers of offerings
  const y1 = R[1].y0;
  for (const d of H.pillars) for (const s of [-1, 1]) {
    const xc = X(d), zo = s * H.z1;
    rel(bag, [xc - H.w / 2, zo], [xc + H.w / 2, zo], [0, s], y1, 1.0, 8.6, 1.9);
    // the two flanks (the nave side is hidden by the statue, 0.6 m is left clear of it)
    const za = s > 0 ? H.z0 + 0.62 : -H.z1, zb = s > 0 ? H.z1 : -H.z0 - 0.62;
    for (const e of [-1, 1]) rel(bag, [xc + e * H.w / 2, za], [xc + e * H.w / 2, zb], [e, 0], y1, 1.0, 8.6, 1.5);
  }
  // ── the passages: the king led in by the gods, to the hall and the sanctuary
  R.forEach((r, i) => {
    if (r.kind !== 'pass') return;
    const a = X(r.d1) + 0.15, b = i === 0 ? X(r.d0) + 0.15 : X(r.d0) - 0.15;
    const top = Math.min(r.y1 - 0.9, i === 0 ? 6.0 : r.y1 - 0.9), reg = i === 0 ? 2.5 : top - 1.0 > 3.3 ? 2.2 : 1.7;
    for (const s of [-1, 1]) rel(bag, [a, s * r.zh], [i === 0 ? b - 0.15 : b, s * r.zh], [0, -s], r.y0, 1.0, top, reg);
  });
  // ── the side chambers: offering scenes on the end walls and on the back wall above the bench
  const vault = (c) => c.y1 - 0.5;
  for (const c of greatChambers()) for (const s of [-1, 1]) {
    const zb = s * c.z1, za = s * c.z0, lo = Math.min(za, zb), hi = Math.max(za, zb);
    rel(bag, [X(c.d1), zb], [X(c.d0), zb], [0, -s], c.y0, 1.1, vault(c), 1.2);
    rel(bag, [X(c.d1), lo], [X(c.d1), hi], [1, 0], c.y0, 1.1, vault(c), 1.2);
    rel(bag, [X(c.d0), lo], [X(c.d0), hi], [-1, 0], c.y0, 1.1, vault(c), 1.2);
  }
  stele(bag, col, fx, 24.5);
}

/**
 * The stele of the marriage of Ramesses with the daughter of Hattusili III, in year 34, cut in the rock face south of the façade (the text is recorded as
 * on the façade, its exact place is ours): a plinth, a frame with a cavetto lintel, the king offering before the god above the lines of text.
 */
function stele(bag, col, fx, zc) {
  const x = fx - 0.02, W = 1.1, y0 = 0.35, y1 = 4.1;
  bag.add('sandstone_dressed', box(x, 0, zc - W - 0.3, x + 0.62, y0, zc + W + 0.3)); col.rect([x, zc - W - 0.3, x + 0.62, zc + W + 0.3], 0, y0);
  for (const s of [-1, 1]) bag.add('sandstone_dressed', box(x, y0, zc + s * W - (s > 0 ? 0.0 : 0.2), x + 0.24, y1, zc + s * W + (s > 0 ? 0.2 : 0.0)));
  bag.add('sandstone_dressed', box(x, y0, zc - W, x + 0.2, y0 + 0.16, zc + W));
  bag.add('sandstone_dressed', extrudeProfile(cavettoProfile(0.4, 0.3, 0.1), x + 0.24, y1, zc - W - 0.2, zc + W + 0.2, 1));
  // the field: a panel of the stone, slightly recessed behind the frame's face, the scene and the lines of text on it
  bag.add('sandstone_floor', box(x, y0 + 0.16, zc - W, x + 0.15, y1, zc + W));
  const place = (u, v, w) => [x + 0.15 + w, v, zc + u];
  figure(bag, 'sandstone_relief', 'offer', place, -0.5, y1 - 1.25, 0.95, 1, 0.04);
  figure(bag, 'sandstone_relief', 'god', place, 0.5, y1 - 1.25, 0.95, -1, 0.04);
  for (let k = 0; k < 9; k++) bag.add('sandstone_relief', box(x + 0.15, y0 + 0.38 + k * 0.23, zc - W + 0.2, x + 0.19, y0 + 0.38 + k * 0.23 + 0.09, zc + W - 0.2));
  col.rect([x, zc - W - 0.2, x + 0.3, zc + W + 0.2], y0, y1);
}

/** The Small Temple's carving: the door passage and the chambers off the hall; ZS the axis' z. */
export function carveSmall(bag, fx, zs) {
  const X = (d) => fx - d, R = smallRooms();
  const r = R[0];
  for (const s of [-1, 1]) rel(bag, [X(r.d1) + 0.15, zs + s * r.zh], [X(r.d0) + 0.1, zs + s * r.zh], [0, -s], r.y0, 0.9, 4.0, 1.7);
  const p = R[2];
  for (const s of [-1, 1]) rel(bag, [X(p.d1) + 0.1, zs + s * p.zh], [X(p.d0) - 0.1, zs + s * p.zh], [0, -s], p.y0, 0.9, 3.3, 1.2);
  for (const c of SMALL_CHAMBERS) for (const s of [-1, 1]) {
    const zb = zs + s * c.z1, lo = zs + Math.min(s * c.z0, s * c.z1), hi = zs + Math.max(s * c.z0, s * c.z1);
    rel(bag, [X(c.d1), zb], [X(c.d0), zb], [0, -s], c.y0, 1.0, c.y1 - 0.4, 1.1);
    rel(bag, [X(c.d1), lo], [X(c.d1), hi], [1, 0], c.y0, 1.0, c.y1 - 0.4, 1.1);
    rel(bag, [X(c.d0), lo], [X(c.d0), hi], [-1, 0], c.y0, 1.0, c.y1 - 0.4, 1.1);
  }
}
