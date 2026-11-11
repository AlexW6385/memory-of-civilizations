// The Small Temple of Nefertari and Hathor (docs/settlements/abu-simbel.md §4): a façade of seven recesses and four buttresses cut in the
// cliff, in each recess a standing colossus (Ramesses, Nefertari, Ramesses on either side of the door, the king in the white crown on the
// south and the double crown on the north), the children at their feet; inside, a hall of six Hathor pillars, the vestibule, and the
// sanctuary with Hathor as the cow coming out of the rock.

import { box, frustum, place, lathe } from '../../core/geom.js';
import { cavettoProfile } from '../egyptian/trim.js';
import { wallReliefs } from '../egyptian/objects.js';
import { royalStatue, standing, hathorHead, hathorCow } from './statues.js';
import { rockWithRooms, extrudeProfile, carve } from './util.js';
import { put } from './great.js';
import { smallRooms, SMALL_PILLARS, SMALL_CHAMBERS, SMALL_FACADE, FLOOR, cliffTop } from './dims.js';

const EAST = -Math.PI / 2;

export function smallTemple(el, { bag, col, lights }) {
  const FX = el.fx, ZS = el.z, X = (d) => FX - d, S = SMALL_FACADE, lean = S.lean / S.H, front = (y) => FX - lean * y;
  const rooms = smallRooms(), HC = Math.min(cliffTop(ZS), 30), zc = (z) => ZS + z;

  // ── the rock and the rooms ──
  const voids = rooms.map((r) => [X(r.d1), r.y0, zc(-r.zh), r.d0 === 0 ? FX + 0.2 : X(r.d0), r.y1, zc(r.zh)]);
  for (const c of SMALL_CHAMBERS) for (const s of [-1, 1]) {
    const z = (a, b) => (s > 0 ? [zc(a), zc(b)] : [zc(-b), zc(-a)]);
    const [za, zb] = z(c.z0, c.z1), [da, db] = z(c.from - 0.02, c.z0 + 0.02);
    voids.push([X(c.d1), c.y0, za, X(c.d0), c.y1, zb], [X(c.door[1]), c.y0, da, X(c.door[0]), c.y0 + c.door[2], db]);
  }
  const outer = [[FX - 40, -1, ZS - 16, FX - 5, HC, ZS + 16], [FX - 5, S.H, ZS - 16, FX - 1.2, HC, ZS + 16],
    [FX - 5, -1, ZS - 16, FX, HC, ZS - S.half], [FX - 5, -1, ZS + S.half, FX, HC, ZS + 16]];
  rockWithRooms(bag, outer, voids, {});
  const E = voids.map((v) => [v[0] - 0.04, v[1] - 0.04, v[2] - 0.04, v[3] + 0.04, v[4] + 0.04, v[5] + 0.04]);
  for (const b of carve(outer, E)) if (b[3] - b[0] > 1e-3 && b[4] - b[1] > 1e-3 && b[5] - b[2] > 1e-3) col.rect([b[0], b[2], b[3], b[5]], b[1], b[4]);
  for (let j = 1; j <= 3; j++) { const x1 = FX - 40 - 13 * (j - 1), x0 = x1 - 13, top = HC * (1 - j / 4); bag.add('sandstone_yellow', box(x0, -1, ZS - 16, x1, top, ZS + 16)); col.rect([x0, ZS - 16, x1, ZS + 16], -1, top); }

  // ── the façade: buttresses and recesses ──
  const xBack = FX - 5;
  const piece = (za, zb, y0, y1, recess = 0) => {
    const rect = [xBack, ZS + za, front(y0) - recess, ZS + zb];
    bag.add('sandstone_dressed', frustum(rect, y0, y1, 0, lean * (y1 - y0), 0, 0, { noBottom: y0 <= 0 }));
    col.rect(rect, y0, y1);
  };
  const edges = [[S.door, S.door + S.bw], [S.door + S.bw + S.nw, S.door + 2 * S.bw + S.nw], [S.door + 2 * S.bw + 2 * S.nw, S.door + 3 * S.bw + 2 * S.nw], [S.door + 3 * S.bw + 3 * S.nw, S.half]];
  for (const s of [-1, 1]) {
    for (const [a, b] of edges) piece(s > 0 ? a : -b, s > 0 ? b : -a, 0, S.H);                     // the buttresses
    for (let k = 0; k < 3; k++) {
      const a = S.door + S.bw + k * (S.bw + S.nw), b = a + S.nw;
      piece(s > 0 ? a : -b, s > 0 ? b : -a, 0, S.top, S.niche);                                       // the recess' back
      piece(s > 0 ? a : -b, s > 0 ? b : -a, S.top, S.H);                                              // the lintel over it
    }
  }
  piece(-S.door, S.door, 4.6, S.H);                                                                   // over the door
  bag.add('sandstone_dressed', extrudeProfile(cavettoProfile(0.8, 0.7, 0.2), front(S.H), S.H, ZS - S.half, ZS + S.half, 1));   // the cornice
  // the statues in the recesses
  const X0 = FX - S.niche + 0.9, kids = ['prince', 'princess'];
  for (const s of [-1, 1]) S.niches.forEach(([c, kind], i) => {
    const z = ZS + s * c;
    put(bag, standing(kind, 10.5, s > 0 ? 'white' : 'double'), X0, 0, z, EAST, 1);
    col.rect([X0 - 1.2, z - 1.5, X0 + 1.8, z + 1.5], 0, 10.5);
    for (const q of [-1, 1]) put(bag, royalStatue(kids[(i + (q > 0 ? 1 : 0)) % 2]), X0 + 1.1, 0.4, z + q * 1.0, EAST, 1.0);   // the children at their feet
  });

  // ── inside ──
  const F = (i) => rooms[i].y0;
  rooms.forEach((r, i) => {
    const x0 = X(r.d1), x1 = r.d0 === 0 ? FX + 0.2 : X(r.d0), za = zc(-r.zh), zb = zc(r.zh);
    if (r.kind === 'pass' && i > 0) {
      const to = F(i + 1);
      col.ramp([x0, za, x1, zb], r.y0, to, 'w'); bag.add('sandstone_floor', box(x0, r.y0 - 0.01, za, x1, to, zb));
    } else col.floor([x0, za, x1, zb], r.y0);
    bag.add('vault_stars', box(x0, r.y1 - 0.03, za, x1, r.y1 - 0.01, zb));
  });
  for (const c of SMALL_CHAMBERS) for (const s of [-1, 1]) {
    const za = s > 0 ? zc(c.z0) : zc(-c.z1), zb = s > 0 ? zc(c.z1) : zc(-c.z0);
    col.floor([X(c.d1), za, X(c.d0), zb], c.y0);
    col.floor([X(c.door[1]), s > 0 ? zc(c.from - 0.05) : zc(-c.z0 - 0.05), X(c.door[0]), s > 0 ? zc(c.z0 + 0.05) : zc(-c.from + 0.05)], c.y0);
    bag.add('vault_stars', box(X(c.d1), c.y1 - 0.03, za, X(c.d0), c.y1 - 0.01, zb));
    const bz = s > 0 ? zc(c.z1 - 0.3) : zc(-c.z1 + 0.3);
    bag.add('sandstone_dressed', box(X(c.d1) + 0.1, c.y0, bz - 0.3, X(c.d0) - 0.1, c.y0 + 0.4, bz + 0.3)); col.rect([X(c.d1) + 0.1, bz - 0.3, X(c.d0) - 0.1, bz + 0.3], c.y0, c.y0 + 0.4);
    bag.add('terracotta', lathe([[0.001, 0], [0.14, 0.03], [0.22, 0.25], [0.2, 0.42], [0.12, 0.5], [0.14, 0.56], [0.001, 0.56]], 10, null, X(c.d1) + 0.6, c.y0 + 0.4, bz));
  }
  // the hall's six pillars with Hathor's head (the cow-eared goddess facing toward the door and toward the sanctuary) over a shaft carved with the queen
  const P = SMALL_PILLARS, H = rooms[1].y1, yF = F(1), shaft = H - 2.0;
  for (const d of P.d) for (const s of [-1, 1]) {
    const xc = X(d), z = ZS + s * P.z, w = P.w;
    bag.add('sandstone_dressed', box(xc - w / 2, yF, z - w / 2, xc + w / 2, yF + shaft - 0.0, z + w / 2));
    col.rect([xc - w / 2, z - w / 2, xc + w / 2, z + w / 2], yF, H);
    put(bag, hathorHead(w), xc, yF + shaft, z, EAST, 1); put(bag, hathorHead(w), xc, yF + shaft, z, Math.PI / 2, 1);
    for (const e of [-s]) wallReliefs({ a: [xc - w / 2, z + e * w / 2], b: [xc + w / 2, z + e * w / 2], n: [0, e], y: yF, v0: 0.4, top: shaft - 0.1, reg: 1.5, inward: -1, gods: 'paint' }, { bag });
  }
  for (const s of [-1, 1]) wallReliefs({ a: [X(5), ZS + s * 4.1], b: [X(14.8), ZS + s * 4.1], n: [0, -s], y: yF, v0: 0.7, top: 5.0, reg: 2.1, inward: 1, gods: 'paint' }, { bag });
  wallReliefs({ a: [X(5), ZS - 4.1], b: [X(5), ZS + 4.1], n: [-1, 0], y: yF, v0: 0.7, top: 5.0, reg: 2.1, inward: 1, gaps: [[4.1 - 1.1, 4.1 + 1.1]], gods: 'paint' }, { bag });
  wallReliefs({ a: [X(14.8), ZS - 4.1], b: [X(14.8), ZS + 4.1], n: [1, 0], y: yF, v0: 0.7, top: 5.0, reg: 2.1, inward: 1, gaps: [[4.1 - 1.1, 4.1 + 1.1]], gods: 'paint' }, { bag });
  // the vestibule: the papyrus offered to Hathor as a cow; the sanctuary: the cow herself
  const yV = F(3), yS = F(5);
  wallReliefs({ a: [X(16.8), ZS - 3.6], b: [X(16.8), ZS + 3.6], n: [-1, 0], y: yV, v0: 0.6, top: 4.3, reg: 1.9, inward: 1, gaps: [[3.6 - 1.1, 3.6 + 1.1]], gods: 'paint' }, { bag });
  wallReliefs({ a: [X(20), ZS - 3.6], b: [X(20), ZS + 3.6], n: [1, 0], y: yV, v0: 0.6, top: 4.3, reg: 1.9, inward: 1, gaps: [[3.6 - 1.0, 3.6 + 1.0]], gods: 'paint' }, { bag });
  for (const s of [-1, 1]) wallReliefs({ a: [X(21.5), ZS + s * 1.8], b: [X(25.2), ZS + s * 1.8], n: [0, -s], y: yS, v0: 0.5, top: 3.5, reg: 1.4, inward: 1, gods: 'gold' }, { bag });
  { const xb = X(25.2);
    bag.add('sandstone_dressed', box(xb, yS, ZS - 0.85, xb + 1.9, yS + 0.18, ZS + 0.85));
    put(bag, hathorCow(), xb + 1.45, yS + 0.18, ZS, EAST, 1);
    for (const s of [-1, 1]) { bag.add('sandstone_dressed', box(xb, yS, ZS + s * 1.0 - 0.1, xb + 1.9, yS + 3.0, ZS + s * 1.0 + 0.1)); col.rect([xb, ZS + s * 1.0 - 0.1, xb + 1.9, ZS + s * 1.0 + 0.1], yS, yS + 3.0); }
    bag.add('sandstone_dressed', box(xb, yS + 3.0, ZS - 1.1, xb + 1.9, yS + 3.2, ZS + 1.1));
    col.rect([xb, ZS - 0.85, xb + 1.9, ZS + 0.85], yS, yS + 2.0);
    lights.push({ at: [X(23.5), yS + 1.3, ZS + 1.4], color: '#ffb46b', intensity: 2.5, distance: 7 });
    bag.add('bronze', lathe([[0.2, 0], [0.18, 0.04], [0.05, 0.12], [0.035, 0.3], [0.035, 1.05], [0.07, 1.09], [0.16, 1.17], [0.14, 1.19]], 12, null, X(23.5), yS, ZS + 1.4)); col.circle(X(23.5), ZS + 1.4, 0.2, yS, yS + 1.3);
  }
  lights.push({ at: [X(10), yF + 2.6, ZS + 3.4], color: '#ffb46b', intensity: 3, distance: 8 }, { at: [X(10), yF + 2.6, ZS - 3.4], color: '#ffb46b', intensity: 3, distance: 8 });
  void place;
}
