// Fez about 1350 — the animals (src/engine/fauna.js; docs/settlements/fez.md §8): swifts and house martins screaming over the roofs and the
// minarets at dusk, jackdaws and crows over the tannery and the hills, house sparrows on the lanes' stones, in the courts and the sahn,
// an egret on the river's quay. No fish: the Oued Fes is drawn but not swum in.
import { SITES, riverZ, siteY, ground0, RADIUS, inLot } from './layout.js';
import { houseList } from './houses.js';
import { openWalks } from './openwalk.js';
import { planOf } from '../../styles/marinid/house.js';
import { frame } from '../../styles/mamluk/kit.js';

const fish = [];
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
const flights = [
  { kind: 'swallow', n: 6, loop: { c: [mid(SITES.qar)[0], mid(SITES.qar)[1] - 6], a: [60, 40], rot: 0.1 }, y: [24, 42], speed: 11 },      // swifts round the Qarawiyyin's minaret
  { kind: 'swallow', n: 5, loop: { c: [-132, 0], a: [40, 30], rot: -0.2 }, y: [20, 36], speed: 11 },                                       // round the Bou Inania's
  { kind: 'swallow', n: 4, lane: { a: [-280, riverZ(-280)], b: [280, riverZ(280)] }, y: [1.5, 6], speed: 9 },                                 // house martins low over the river
  { kind: 'swallow', n: 4, loop: { c: [0, -40], a: [120, 50], rot: 0.3 }, y: [14, 30], speed: 9 },
  { kind: 'crow', n: 6, loop: { c: [mid(SITES.tannery)[0], mid(SITES.tannery)[1]], a: [50, 35], rot: 0.4 }, y: [16, 30], speed: 8 },     // jackdaws over the tannery
  { kind: 'crow', n: 5, loop: { c: [-120, -150], a: [110, 60], rot: -0.3 }, y: [34, 58], speed: 8 },
];
flights.push(
  { kind: 'swallow', n: 5, lane: { a: [-290, -21], b: [40, -21] }, y: [7, 14], speed: 10 },                                              // swifts down the Talaa Kebira's slot of sky
  { kind: 'swallow', n: 4, lane: { a: [-290, 22], b: [90, 22] }, y: [7, 13], speed: 10 },
  { kind: 'swallow', n: 4, loop: { c: [-60, -40], a: [40, 24], rot: 0.2 }, y: [18, 30], speed: 10 },
  { kind: 'crow', n: 4, loop: { c: [100, 60], a: [90, 40], rot: -0.2 }, y: [28, 46], speed: 8 },
);
const perches = [];
const sp = (x, z, y = ground0(x, z) + 0.05, rot = 0.3 + (Math.abs(x) * 7 % 3)) => perches.push({ kind: 'sparrow', x, z, y, rot, range: [1.4, 1.2] });
const b = SITES.bou, q = SITES.qar, yb = siteY('bou') + 0.05, yq = siteY('qar') + 0.05;
for (const [x, z] of [[-139, -3], [-126, 6], [-135, 9], [-128, -5]]) sp(x, z, yb);
for (const [x, z] of [[q[0] + 40, q[1] + 12], [q[0] + 30, q[1] + 18], [q[0] + 44, q[1] + 8]]) sp(x, z, yq);
for (let x = -280; x < 280; x += 17) sp(x + 1.3, -21 + (x % 3 ? 1.5 : -1.5)); for (let x = -250; x < 250; x += 37) sp(x + 3, -21 + (x % 2 ? 1.1 : -1.1));
for (let x = -200; x < 240; x += 53) { const z = riverZ(x) - 5.2; sp(x, z); }
for (let x = -270; x < 270; x += 23) { const z = riverZ(x) + (x % 2 ? 4.3 : -4.3); sp(x, z); }
{ const x = 190, z = riverZ(x) - 4.4; perches.push({ kind: 'egret', x, z, y: ground0(x, z), rot: Math.PI / 2, stay: [60, 200], gone: [60, 160], alert: 10 }); }
void RADIUS; void b;

// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; docs/settlements/fez.md §16.2) ──
// House martins' nests under the madrasa's hall canopy over the court; cats in the corners of the dukkans' cells; hens and a cock in the funduq's court; pigeons
// at the Place Seffarine, the Qarawiyyin's sahn and the tannery's walks; birds in cages under the awnings of three dukkans. [inferred throughout]
const critters = [];
const hash = (x, z, s = 0) => { const k = Math.sin(x * 12.9898 + z * 78.233 + s * 37.719) * 43758.5453; return k - Math.floor(k); };
// the martins' nests: on the cedar corbels under the canopy of the prayer hall's front (madrasa.js zH = court's south edge + 0.7; hallfront.js canopy at y + 5.2, corbels every 0.55 m from gx0 + 0.3), open to the court
{ const gx0 = b[0] + 6.4, gx1 = b[2] - 6.4, u0 = gx0 + 0.3, u1 = gx1 - 0.3, n = Math.max(2, Math.round((u1 - u0) / 0.55)), zH = b[3] - 9.6 - 0.7 + 0.7, yy = siteY('bou') + 5.0;
  for (const [i, side] of [[11, 1], [27, -1]]) critters.push({ model: 'swallow_nest', at: [u0 + (u1 - u0) * i / n, yy, zH - 0.3], rot: -Math.PI / 2, cycle: 33 + 4 * side, flight: 8, radius: 7, side, rise: -3.2 }); }
// cats: in the corner of a dukkan's cell, on its floor, by the jamb (a share of the bays, by the bay's own place; not in the cells the visitor enters)
const ROUTES = openWalks().flat();
for (const h of houseList()) {
  if (!h.shops || Math.hypot(h.rect[0], h.rect[1]) > 250) continue;
  const P = planOf(h), fr = frame(h.rect, h.door), [nx, nz] = fr.N;
  for (const bay of P.bays) {
    const w = bay.u1 - bay.u0, c = fr.P((bay.u0 + bay.u1) / 2, 0);
    if (w < 2.2 || hash(c[0], c[1], 3) > 0.095) continue;
    const q = fr.P(bay.u0 + 0.4, -1.05);
    if (ROUTES.some((p) => Math.hypot(p[0] - q[0], p[1] - q[1]) < 1.8)) continue;
    critters.push({ model: hash(c[0], c[1], 5) < 0.5 ? 'cat_tabby' : 'cat_orange', at: [q[0], h.y + 0.3, q[1]], rot: Math.atan2(nz, nx) + (hash(c[1], c[0]) - 0.5) * 0.8, range: [7, 2.5] });
  }
}
// hens and a cock in the funduq's court (court [-62, -52, -38, -30.4]: its south-west corner, clear of the donkeys' line and the way to the basin)
{ const f = SITES.funduq, yf = siteY('funduq') + 0.05, cx = f[0] + 10.5, cz = f[3] - 9.6;
  for (const [m, dx, dz, sz] of [['rooster', 0, 0, 1], ['hen_brown', 1.1, -0.7, 1], ['hen_white', -0.9, -0.9, 1], ['hen_brown', 0.5, 0.9, 0.96]]) critters.push({ model: m, at: [cx + dx, yf, cz + dz], rot: hash(cx + dx, cz) * 6.28, range: [3.0, 1.2], size: sz }); }
// pigeons on the paving: the Place Seffarine, the Qarawiyyin's sahn, the tannery's north walk
{ const sq = SITES.seffarine, q = SITES.qar, t = SITES.tannery;
  const groups = [[sq[0] + 14, sq[1] + 12, ground0(102, 39) + 0.05, 5], [q[0] + (q[2] - q[0]) / 14 * 7 - 3, q[1] + 15, siteY('qar') + 0.05, 5], [t[0] + 18, t[1] + 5, siteY('tannery'), 4], [t[0] + 44, t[1] + 6, siteY('tannery'), 4]];
  for (const [x, z, y, n] of groups) for (let k = 0; k < n; k++) { const px = x + (hash(x + k, z) - 0.5) * 4.4, pz = z + (hash(x, z + k) - 0.5) * 3.2; critters.push({ model: ['pigeon_grey', 'pigeon_white', 'pigeon_dark', 'pigeon_grey'][k % 4], at: [px, y, pz], rot: hash(pz, px) * 6.28, range: [2.4, 1.6] }); } }
// caged songbirds under the awnings of three dukkans of the better trades near the Talaa Kebira, hung from the lintel's front
{ let k = 0;
  const L = houseList().filter((h) => h.shops && Math.abs((h.door === 'n' ? h.rect[1] : h.door === 's' ? h.rect[3] : 99) + 21) < 4 && h.rect[0] > -140 && h.rect[2] < 125 && h.laneW >= 2.4).sort((a, c) => hash(a.seed, 1) - hash(c.seed, 1));
  for (const h of L) {
    if (k >= 3) break;
    const P = planOf(h), fr = frame(h.rect, h.door), bay = P.bays.find((q) => ['books', 'perfume', 'dates', 'spice', 'cloth', 'slipper', 'brass'].includes(q.trade) && q.u1 - q.u0 >= 2.2);
    if (!bay) continue;
    const p = fr.P(bay.u0 + 0.6, 0.32);
    critters.push({ model: 'cagebird', at: [p[0], h.y + 2.7, p[1]], rot: 0 }); k++;
  }
}
void inLot;
export default { fish, flights, perches, critters };
