// Benin City about 1600 — the animals (src/engine/fauna.js; docs/settlements/benin-city.md §8): swallows and swifts over the great
// street and the market, dark kites (the engine's dark birds) circling over the palace and the Iya, small birds on the red earth and
// the thatch (sparrow stand-ins for weaverbirds), an egret at the ditch.
import { PALACE, MARKET, GATES, crest, lots, GREAT, GATE_X, SHEDS, BAYS } from './layout.js';
import { frame } from '../../styles/greek/agora.js';

const flights = [
  { kind: 'swallow', n: 6, lane: { a: [-240, 57], b: [240, 57] }, y: [3, 20], speed: 9, half: 30 },
  { kind: 'swallow', n: 5, loop: { c: [(MARKET[0] + MARKET[2]) / 2, (MARKET[1] + MARKET[3]) / 2], a: [60, 40], rot: 0.2 }, y: [4, 16], speed: 8 },
  { kind: 'crow', n: 4, loop: { c: [(PALACE[0] + PALACE[2]) / 2, (PALACE[1] + PALACE[3]) / 2], a: [80, 60], rot: 0.1 }, y: [45, 28], speed: 8 },
  { kind: 'crow', n: 3, loop: { c: [0, 0], a: [250, 230], rot: 0.5 }, y: [60, 35], speed: 8 },
];
const perches = [];
for (const [x, z] of [[-65, 20], [-30, 52], [40, 60], [98, 20], [98, -60], [160, 20], [150, -50], [-200, 57], [-90, 100], [60, 110], [20, 20], [-120, 28]]) perches.push({ kind: 'sparrow', x, z, y: 0.05, rot: x * 0.07, range: [1.5, 1.3] });
// sparrows on the thatch ridges of the houses about the great street, on the palace wall's coping, on the red earth before the doors
{
  const near = lots().filter((l) => Math.hypot((l.rect[0] + l.rect[2]) / 2 + 65, (l.rect[1] + l.rect[3]) / 2 - 80) < 150);
  near.forEach((l, i) => {
    const F = frame(l.rect, l.front), p = F.P(F.L * (0.3 + 0.4 * ((i * 7) % 5) / 5), 2.7), top = (l.chief ? 3.8 + 2.9 + 2.6 : 3.1 + 2.9) + 0.1;
    if (i % 2 === 0) perches.push({ kind: 'sparrow', x: p[0], z: p[1], y: top, rot: i, range: [F.L * 0.3, 0], alert: 5 });
    else { const q = F.P(F.L * 0.5 + 3.5, -2.2); perches.push({ kind: 'sparrow', x: q[0], z: q[1], y: 0.12, rot: i * 1.3, range: [1.6, 1.4], alert: 4 }); }
  });
  for (const x of [-120, -95, -40, -15]) perches.push({ kind: 'sparrow', x, z: PALACE[3] - 0.6, y: 3.8 + 0.22, rot: 0, range: [4, 0], alert: 5 });
  for (const x of [-130, -20, 40]) perches.push({ kind: 'sparrow', x, z: GREAT[1] + 3, y: 0.05, rot: x, range: [2.5, 1.5] });
}
// on the new roofs: the ridges of the waiting sheds, the eaves of the bays on the palace wall, the porch beam and the gate's ridge
for (const sh of SHEDS) { const [x0, z0, x1, z1] = sh.rect; perches.push({ kind: 'sparrow', x: (x0 + x1) / 2, z: (z0 + z1) / 2, y: 4.62, rot: x0, range: [(x1 - x0) * 0.35, 0], alert: 5 }); perches.push({ kind: 'sparrow', x: x1 + 0.3, z: z1 + 0.4, y: 0.12, rot: x1, range: [1.8, 1.4], alert: 4 }); }
BAYS.forEach((b, i) => { if (i % 3 === 0) perches.push({ kind: 'sparrow', x: b.rect[0] + 2.5, z: 3.2, y: 2.62, rot: i, range: [2, 0], alert: 4 }); });
for (const s of [-1, 1]) { perches.push({ kind: 'sparrow', x: GATE_X + s * 6.5, z: 2.9, y: 5.28, rot: s, range: [2.4, 0], alert: 6 }); perches.push({ kind: 'sparrow', x: GATE_X + s * 6, z: -5.5, y: 13.0, rot: s, range: [3, 0], alert: 8 }); }
{ const g = GATES[2], th = Math.atan2(g.at[1], g.at[0]), r = crest(th) + 16; perches.push({ kind: 'egret', x: Math.cos(th) * r + 12, z: Math.sin(th) * r, y: -3.4, rot: 0, stay: [60, 200], gone: [60, 160], alert: 10 }); }
export default { fish: [], flights, perches };
