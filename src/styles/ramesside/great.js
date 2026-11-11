// The Great Temple of Ramesses II at Abu Simbel (docs/settlements/abu-simbel.md §3): the façade cut in the cliff, leaning back, the four seated
// colossi with the small royal figures at their feet, the niche of Ra-Horakhty over the door, the frieze of cobras and the cornice with its
// twenty-two baboons; behind it the halls cut in the rock — the hall of the eight Osiride pillars with the Battle of Kadesh, the second
// hall, the vestibule, the sanctuary with its four seated gods, the side chambers. Rock with rooms cut in it (util.js rockWithRooms).

import { box, frustum, place, rod, lathe } from '../../core/geom.js';
import { cavettoProfile } from '../egyptian/trim.js';
import { figure, wallReliefs, astroCeiling } from '../egyptian/objects.js';
import { colossus, royalStatue, baboon, uraeus, osiride, seatedGod, standing } from './statues.js';
import { kadesh, campaigns } from './reliefs.js';
import { rockWithRooms, extrudeProfile, turnedBag, rng, carve } from './util.js';
import { greatRooms, greatChambers, HALL1, HALL2, GREAT_FACADE, FLOOR, cliffTop } from './dims.js';

/** Place a statue's parts (material → geometries) at (x, y, z) turned by yaw (a fresh copy each time: build the statue anew). */
export function put(bag, parts, x, y, z, yaw = 0, s = 1) {
  for (const [m, list] of Object.entries(parts)) for (const g of list) bag.add(m, place(g, x, y, z, yaw, s));
}
const EAST = -Math.PI / 2, WEST = Math.PI / 2;

/** A bronze lamp on a stand, its flame the light. */
function lamp(bag, col, lights, x, z, y0, y = 1.5, intensity = 4) {
  bag.add('bronze', lathe([[0.2, 0], [0.18, 0.04], [0.05, 0.12], [0.035, 0.3], [0.035, y - y0 - 0.2], [0.07, y - y0 - 0.16], [0.16, y - y0 - 0.08], [0.14, y - y0 - 0.06]], 12, null, x, y0, z));
  col.circle(x, z, 0.2, y0, y);
  lights.push({ at: [x, y + 0.08, z], color: '#ffb46b', intensity, distance: 9 });
}

export function greatTemple(el, { bag, col, lights }) {
  const FX = el.fx, X = (d) => FX - d, HC = cliffTop(0), F0 = FLOOR, G = GREAT_FACADE, lean = G.lean / G.H;
  const front = (y) => FX - lean * y, rooms = greatRooms(), chambers = greatChambers();
  const F = { hall1: rooms[1].y0, hall2: rooms[3].y0, vest: rooms[5].y0, sanct: rooms[7].y0 };

  // ── the rock and the rooms cut in it ──
  const voids = rooms.map((r) => [X(r.d1), r.y0, -r.zh, r.d0 === 0 ? FX + 0.2 : X(r.d0), r.y1, r.zh]);
  for (const c of chambers) for (const s of [-1, 1]) {
    const z = (a, b) => (s > 0 ? [a, b] : [-b, -a]);
    const [za, zb] = z(c.z0, c.z1), [da, db] = z(c.from - 0.02, c.z0 + 0.02);
    voids.push([X(c.d1), c.y0, za, X(c.d0), c.y1, zb]);                                      // the chamber
    voids.push([X(c.door[1]), c.y0, da, X(c.door[0]), c.y0 + c.door[2], db]);                // its door
  }
  const outer = [[FX - 75, -1, -20, FX - 8, HC, 20], [FX - 8, 31, -20, FX - 3.5, HC, 20],
    [FX - 8, -1, -20, FX, HC, -19.1], [FX - 8, -1, 19.1, FX, HC, 20]];                      // the cliff either side of the façade
  // the rock itself: boxes (their rects and heights the walker's walls), the rooms' lining
  const rock = [];
  rockWithRooms(bag, outer, voids, {});
  // collision: the solid part (outer minus rooms) — the same decomposition without the lining
  { const E = voids.map((v) => [v[0] - 0.04, v[1] - 0.04, v[2] - 0.04, v[3] + 0.04, v[4] + 0.04, v[5] + 0.04]); rock.push(...carve(outer, E).filter((b) => b[3] - b[0] > 1e-3 && b[4] - b[1] > 1e-3 && b[5] - b[2] > 1e-3)); }
  for (const b of rock) col.rect([b[0], b[2], b[3], b[5]], b[1], b[4]);
  // behind the temple: the hill falling away in steps
  for (let j = 1; j <= 5; j++) {
    const x1 = FX - 75 - 13 * (j - 1), x0 = x1 - 13, top = HC * (1 - j / 6);
    bag.add('sandstone_yellow', box(x0, -1, -20, x1, top, 20)); col.rect([x0, -20, x1, 20], -1, top);
  }

  // ── the façade, leaning back, with the door and the niche (pieces on one leaning plane) ──
  const piece = (za, zb, y0, y1, xBack = FX - 8) => {
    const rect = [xBack, za, front(y0), zb];
    bag.add('sandstone_dressed', frustum(rect, y0, y1, 0, lean * (y1 - y0), 0, 0, { noBottom: y0 <= 0 }));
    col.rect(rect, y0, y1);
  };
  const half = G.half, dw = G.door, nH = 9.4, nT = 12.6, nz = 1.0;
  piece(-half, -dw, 0, G.H); piece(dw, half, 0, G.H);                                           // either side of the door
  piece(-dw, dw, G.doorH, nH);                                                                    // over the door
  piece(-dw, -nz, nH, nT); piece(nz, dw, nH, nT);                                                 // the posts of the niche
  piece(-dw, dw, nT, G.H);                                                                        // over the niche
  const nb = FX - 2.3;                                                                            // the niche's back
  bag.add('sandstone_dressed', box(FX - 8, nH, -nz, nb, nT, nz)); col.rect([FX - 8, -nz, nb, nz], nH, nT);
  // the cornice (a cavetto, 1.4 m) and the frieze of cobras under it, the baboons on it
  const cor = cavettoProfile(G.cornice, 1.1, 0.3);
  bag.add('sandstone_dressed', extrudeProfile(cor, front(G.H), G.H, -half, half, 1));
  const cobras = []; for (let z = -half + 0.4; z < half - 0.2; z += 0.62) cobras.push(z);
  for (const z of cobras) put(bag, uraeus(), front(29.5) - 0.02, 29.2, z, EAST, 1);
  const nBab = 22;
  for (let k = 0; k < nBab; k++) put(bag, baboon(), front(G.H) + 0.5, G.H + G.cornice, -half + (k + 0.5) * (2 * half / nBab), EAST, 1);
  // the door's own frame: a lintel of dressed stone proud of the face, jambs inside the passage
  bag.add('sandstone_dressed', box(front(G.doorH) - 0.1, G.doorH, -dw - 0.25, front(G.doorH) + 0.25, G.doorH + 0.3, dw + 0.25));
  // reliefs on the leaning face: the king offering Maat to Ra-Horakhty either side of his niche
  const face = (u, v, w) => [front(v) + 0.01 + w, v, u];
  figure(bag, 'sandstone_relief', 'offer', face, -1.95, 9.55, 2.3, 1, 0.08);
  figure(bag, 'sandstone_relief', 'offer', face, 1.95, 9.55, 2.3, -1, 0.08);
  // the god in his niche
  put(bag, standing('ra', 2.2), nb + 0.4, nH, 0, EAST, 1);
  // the colossi, and at their feet the royal family (queen mother and Nefertari at the outer ones, princes and princesses at the inner)
  const X0 = FX + 1.0, r = rng(1255), kinds = ['queen', 'prince', 'princess'];
  G.colossi.forEach((zc, i) => {
    put(bag, colossus(), X0, 0, zc, EAST, 1);
    col.rect([X0 - 1.8, zc - 3.7, X0 + 7.6, zc + 3.7], 0, 7.4); col.rect([X0 - 1.9, zc - 3.9, X0 + 1.2, zc + 3.9], 7.4, 17.5);
    const outer = Math.abs(zc) > 10;
    [[-3.12, -3.2], [3.12, -3.2], [0, -5.0]].forEach(([lx, lz], k) => {
      const kind = outer ? (k < 2 ? 'queen' : 'princess') : (k < 2 ? kinds[1 + ((i + k) % 2)] : 'princess');
      put(bag, royalStatue(kind), X0 - lz, 0.5, zc + lx, EAST, 1);
    });
  });
  void r;

  // ── inside ──
  const wall = (m, a, b) => bag.add(m, a);
  void wall;
  // floors: the rooms
  rooms.forEach((r, i) => {
    const x0 = X(r.d1), x1 = r.d0 === 0 ? FX + 0.2 : X(r.d0);
    if (r.kind === 'pass' && i > 0) {
      const to = i === 2 ? F.hall2 : i === 4 ? F.vest : F.sanct, len = r.d1 - r.d0, n = 2;
      col.ramp([x0, -r.zh, x1, r.zh], r.y0, to, 'w');
      for (let k = 0; k < n; k++) { const xa = X(r.d0 + len * (k + 1) / n), xb = X(r.d0 + len * k / n); bag.add('sandstone_floor', box(xa, r.y0 - 0.01, -r.zh, xb, r.y0 + (to - r.y0) * (k + 1) / n, r.zh)); }
    } else col.floor([x0, -r.zh, x1, r.zh], r.y0);
    // the ceilings painted as the night sky, the stars in yellow (the first hall's nave under the vultures, below)
    bag.add('vault_stars', box(x0, r.y1 - 0.03, -r.zh, x1, r.y1 - 0.01, r.zh));
  });
  for (const c of chambers) for (const s of [-1, 1]) {
    const za = s > 0 ? c.z0 : -c.z1, zb = s > 0 ? c.z1 : -c.z0;
    col.floor([X(c.d1), za, X(c.d0), zb], c.y0);
    col.floor([X(c.door[1]), s > 0 ? c.from - 0.05 : -c.z0 - 0.05, X(c.door[0]), s > 0 ? c.z0 + 0.05 : -c.from + 0.05], c.y0);
    bag.add('vault_stars', box(X(c.d1), c.y1 - 0.03, za, X(c.d0), c.y1 - 0.01, zb));
    // a treasury: a stone bench along the back wall, jars, a chest
    const bz = s > 0 ? c.z1 - 0.35 : -c.z1 + 0.35;
    bag.add('sandstone_dressed', box(X(c.d1) + 0.1, c.y0, bz - 0.35, X(c.d0) - 0.1, c.y0 + 0.45, bz + 0.35)); col.rect([X(c.d1) + 0.1, bz - 0.35, X(c.d0) - 0.1, bz + 0.35], c.y0, c.y0 + 0.45);
    for (let k = 0; k < 3; k++) { const jx = X(c.d1) + 0.5 + k * 0.7; bag.add('terracotta', lathe([[0.001, 0], [0.14, 0.03], [0.22, 0.25], [0.2, 0.42], [0.12, 0.5], [0.14, 0.56], [0.001, 0.56]], 10, null, jx, c.y0 + 0.45, bz)); }
  }

  // hall 1: the eight Osiride pillars (white crown on the south side, the double crown on the north: as the sources have it for the façade pairs reversed — §4.2)
  const H1 = HALL1;
  H1.pillars.forEach((d) => {
    const xc = X(d);
    for (const s of [-1, 1]) {
      const z0 = s * H1.z0, z1 = s * H1.z1, a = Math.min(z0, z1), b = Math.max(z0, z1);
      bag.add('sandstone_dressed', box(xc - H1.w / 2, F.hall1, a, xc + H1.w / 2, H1.H, b));
      put(bag, osiride(s > 0 ? 'white' : 'double'), xc, F.hall1, s * H1.statueZ, s > 0 ? 0 : Math.PI, 1);
      col.rect([xc - 1.0, Math.min(a, s * 3.48), xc + 1.0, Math.max(b, s * 3.48)], F.hall1, H1.H);
    }
  });
  // the nave's ceiling: vultures with spread wings and winged discs, flying toward the sanctuary
  { const x0 = X(26), x1 = X(8), zN = 3.4;
    astroCeiling({ y: 9.9, bays: [[-zN, x0, zN, x1, 'vultures']] }, { bag: turnedBag(bag) }); }
  // the walls: the Battle of Kadesh (north), the campaigns (south), the king before the gods (the ends)
  { const y = F.hall1;
    kadesh(bag, (u, v, d) => [X(8.3) - u, y + v, -8.35 + 0.012 + d], 0, 17.4, 3.35, 8.7, 1255);
    campaigns(bag, (u, v, d) => [X(8.3) - u, y + v, 8.35 - 0.012 - d], 0.3, 17.1, 3.4, 2, 2.2, 7);
    wallReliefs({ a: [X(8), -8.35], b: [X(8), 8.35], n: [-1, 0], y, v0: 1.0, top: 8.8, reg: 2.6, inward: 1, gaps: [[8.35 - 1.8, 8.35 + 1.8]], gods: 'paint' }, { bag });
    wallReliefs({ a: [X(26), -8.35], b: [X(26), 8.35], n: [1, 0], y, v0: 1.0, top: 8.8, reg: 2.6, inward: 1, gaps: [[8.35 - 1.8, 8.35 + 1.8]], gods: 'paint' }, { bag });
    // the dado under the great scenes: a frieze of coloured blocks
    const MAT = ['egyptian_blue', 'limewash_red', 'fresco_green', 'paint_ochre'];
    for (const sg of [-1, 1]) for (let k = 0, x = X(8.5); x > X(25.5); x -= 0.3, k++) bag.add(MAT[k % 4], box(x - 0.27, y + 0.05, sg > 0 ? 8.32 : -8.35, x - 0.03, y + 0.35, sg > 0 ? 8.35 : -8.32));
  }
  // lamps in the aisles
  for (const [d, s] of [[13, 1], [13, -1], [22, 1], [22, -1]]) lamp(bag, col, lights, X(d), s * 6.9, F.hall1, 1.5, 4);

  // hall 2: four square pillars carved with the king and Nefertari before the sacred barques
  for (const d of HALL2.pillars) for (const s of [-1, 1]) {
    const xc = X(d), w = HALL2.w, z = s * HALL2.z;
    bag.add('sandstone_dressed', box(xc - w / 2, F.hall2, z - w / 2, xc + w / 2, HALL2.H, z + w / 2)); col.rect([xc - w / 2, z - w / 2, xc + w / 2, z + w / 2], F.hall2, HALL2.H);
    for (const e of [1, -1]) wallReliefs({ a: [xc + e * w / 2, z - w / 2], b: [xc + e * w / 2, z + w / 2], n: [e, 0], y: F.hall2, v0: 1.2, top: 6.6, reg: 1.8, inward: 1, gods: 'paint' }, { bag });
  }
  for (const s of [-1, 1]) wallReliefs({ a: [X(30), s * 3.5], b: [X(41), s * 3.5], n: [0, -s], y: F.hall2, v0: 0.9, top: 7.0, reg: 2.0, inward: 1, gods: 'paint' }, { bag });
  lamp(bag, col, lights, X(35.5), 3.0, F.hall2, 1.4, 3); lamp(bag, col, lights, X(35.5), -3.0, F.hall2, 1.4, 3);
  // the vestibule: offerings of wine, milk, bread and flowers to the gods, a small figure of Maat to Thoth
  wallReliefs({ a: [X(45), -4.6], b: [X(45), 4.6], n: [-1, 0], y: F.vest, v0: 0.8, top: 6.0, reg: 2.6, inward: 1, gaps: [[4.6 - 1.8, 4.6 + 1.8]], gods: 'paint' }, { bag });
  wallReliefs({ a: [X(49.5), -4.6], b: [X(49.5), 4.6], n: [1, 0], y: F.vest, v0: 0.8, top: 6.0, reg: 2.6, inward: 1, gaps: [[4.6 - 1.7, 4.6 + 1.7]], gods: 'paint' }, { bag });
  for (const s of [-1, 1]) wallReliefs({ a: [X(45), s * 4.6], b: [X(49.5), s * 4.6], n: [0, -s], y: F.vest, v0: 0.8, top: 6.0, reg: 2.6, inward: 1, gaps: [[1.5, 3.1]], gods: 'paint' }, { bag });
  lamp(bag, col, lights, X(47.2), 2.6, F.vest, 1.4, 3);
  // the sanctuary: four seated gods side by side on a bench against the rock — Ra-Horakhty, the deified king, Amun-Ra, Ptah — an offering stone before them
  { const xb = X(61.7), y = F.sanct;
    [['ra', 1.5], ['ramesses', 0.5], ['amun', -0.5], ['ptah', -1.5]].forEach(([k, z]) => put(bag, seatedGod(k), xb + 0.3, y, z, EAST, 1));
    col.rect([xb, -2.0, xb + 1.3, 2.0], y, y + 2.4);
    bag.add('sandstone_dressed', box(X(58.6) - 0.5, y, -0.5, X(58.6) + 0.5, y + 0.9, 0.5)); col.rect([X(58.6) - 0.5, -0.5, X(58.6) + 0.5, 0.5], y, y + 0.9);   // the offering stone
    bag.add('gold', box(X(58.6) - 0.15, y + 0.9, -0.15, X(58.6) + 0.15, y + 0.96, 0.15));
    lamp(bag, col, lights, X(57.0), 1.4, y, 1.3, 2.5);
    for (const s of [-1, 1]) wallReliefs({ a: [X(54.5), s * 2.0], b: [X(61.7), s * 2.0], n: [0, -s], y, v0: 0.6, top: 3.6, reg: 1.5, inward: 1, gods: 'gold' }, { bag });
  }
}

void WEST; void seatedGod;
