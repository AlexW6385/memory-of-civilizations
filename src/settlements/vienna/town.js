// The town of Vienna in 1902 (docs/settlements/vienna.md §2, §5): granite-set streets with their kerbs and the Ring's promenades,
// the tenements of the Gründerzeit and the Biedermeier houses between, Wagner's two houses on the Wienzeile, the Naschmarkt over the
// walled Wien with its bridges and the Stadtbahn's ledge, the Karlsplatz with Wagner's pavilions and the Karlskirche, the Opera, the
// trams, Fiakers, gas lamps and advertising columns; houses in two levels of detail (src/settlements/lod.js).
import { lodTiles } from '../lod.js';
import { subtractRects } from '../../core/build.js';
import '../../styles/viennese/index.js';
import { RADIUS, EW, NS, WIEN, LEDGE, BRIDGES, OPERA, KARLSKIRCHE, PAVILIONS, PATHS, SQUARE, NASCH, PROMENADE, RING_TRACKS, CAFE, SEC, WING, lots, yards, paving, inRect, onStreet, inLot } from './layout.js';

const base = (id, elements, extra = {}) => ({ id, style: 'viennese', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, -64], facing: 's' }, ...extra });
const cut = (rs, holes) => rs.flatMap((r) => subtractRects(r, holes)).filter((r) => r[2] - r[0] > 0.3 && r[3] - r[1] > 0.3);
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const inCore = (x, z, r) => Math.hypot(x, z) < r;

/** The streets: carriageways of granite setts (the Ring in asphalt), flagstone pavements, the market's promenade, the garden paths. */
function streets() {
  const { drive, walk } = paving(), E = [];
  for (const d of drive) E.push({ t: 'floor', rect: d.r, y: 0.03, th: 0.2, mat: d.ring ? 'asphalt' : 'granite_block' });
  const kerbs = [...drive.map((d) => d.r)];
  for (const r of walk) E.push({ t: 'floor', rect: r, y: 0.11, th: 0.2, mat: 'flagstone' });
  // the promenade of the Naschmarkt along the Wien, between the Wienzeile and the channel's north wall
  for (const r of cut([PROMENADE], [...kerbs, ...walk])) E.push({ t: 'floor', rect: r, y: 0.11, th: 0.2, mat: 'flagstone' });
  // the paths of the Karlsplatz and of the garden behind the Secession (axis-parallel runs of pebbles)
  for (const { w, pts } of PATHS) for (let i = 0; i + 1 < pts.length; i++) {
    const [ax, az] = pts[i], [bx, bz] = pts[i + 1];
    E.push({ t: 'floor', rect: [Math.min(ax, bx) - w / 2, Math.min(az, bz) - w / 2, Math.max(ax, bx) + w / 2, Math.max(az, bz) + w / 2], y: 0.04, th: 0.15, mat: 'pebbles' });
  }
  // the court round the Karlskirche's steps
  E.push({ t: 'floor', rect: [KARLSKIRCHE[0] - 40, KARLSKIRCHE[1] - 16, KARLSKIRCHE[0] - 33, KARLSKIRCHE[1] + 16], y: 0.06, th: 0.2, mat: 'flagstone' });
  return base('vienna-streets', E, { rooms: [{ id: 'Ring', rect: [-120, -246, 120, -214], y: 0.03, kind: 'open' }] });
}

/** The Wien between its granite walls, the Stadtbahn on its ledge, the road bridges. */
function wien() {
  const gaps = BRIDGES.map((x) => [x - 7.5, x + 7.5]);
  const E = [{ t: 'wien_channel', x0: WIEN.x0, x1: WIEN.x1, z0: WIEN.z0, z1: WIEN.z1, top: 0, bed: WIEN.bed, ledge: { z0: LEDGE.z0, z1: LEDGE.z1, y: LEDGE.y }, gaps }];
  for (const x of BRIDGES) E.push({ t: 'wien_bridge', x, z0: WIEN.z0, z1: WIEN.z1, zEnd: LEDGE.z1, w: 14, top: 0 });
  return base('vienna-wien', E);
}

/** Street furniture: gas lamps, advertising columns, trams on the Ring, Fiakers at their rank and by the Opera, benches, kiosks. */
function furniture() {
  const E = [], rand = rng(1902);
  const crossing = (x, z) => NS.some((s) => Math.abs(x - s.x) < s.w / 2 + 2 && z >= s.z0 && z <= s.z1) && EW.some((e) => Math.abs(z - e.z) < e.w / 2 + 1);
  const free = (x, z) => !inLot(x, z, 0.4) && !crossing(x, z) && !inRect([-31, -54, 31, -12], x, z, 1);
  // gas lamps along the kerbs of the older streets, staggered; electric arc lamps on the Ring's promenades
  for (const s of EW) {
    const ring = s.name === 'ring', gap = ring ? 26 : 34, off = ring ? 3.2 : 1.1;
    for (let x = s.x0 + 8; x < s.x1; x += gap) for (const [sg, ph] of [[-1, 0], [1, gap / 2]]) {
      const px = x + ph, pz = s.z + sg * (s.w / 2 - off);
      if (!inCore(px, pz, RADIUS - 50) || !free(px, pz) || px > s.x1 - 4 || (pz > 50 && pz < 62 && px < -60 && px > -252)) continue;
      if (Math.abs(px) > 150 && Math.abs(pz) > 80 && rand() < 0.5) continue;
      E.push({ t: 'gaslamp', at: [px, pz], y: 0.11 });
    }
  }
  for (const s of NS) for (let z = s.z0 + 10; z < s.z1; z += 44) for (const sg of [-1, 1]) {
    const px = s.x + sg * (s.w / 2 - 1.1), pz = z + (sg > 0 ? 22 : 0);
    if (!inCore(px, pz, RADIUS - 60) || !free(px, pz) || (pz > 56 && pz < 90) || inRect([62, -53, 246, 30], px, pz, 1)) continue;
    E.push({ t: 'gaslamp', at: [px, pz], y: 0.11 });
  }
  // the Karlsplatz: lamps along the main walk, benches by the paths
  for (let x = 70; x < 195; x += 25) for (const sg of [-1, 1]) E.push({ t: 'gaslamp', at: [x, -7 + sg * 2.6], y: 0.03 });
  for (const [x, z, rot] of [[84, -3.4, 0], [84, -10.6, 0], [130, -3.4, 0], [130, -10.6, 0], [165, -3.4, 0], [165, -10.6, 0], [112 + 2.6, -40, Math.PI / 2], [112 - 2.6, 20, Math.PI / 2], [150 + 2.6, -30, Math.PI / 2], [150 - 2.6, -20, Math.PI / 2], [140, 5, 0], [160, 11.4, 0]]) E.push({ t: 'park_bench', at: [x, z], y: 0.03, rot });
  // the garden behind the Secession
  for (const [x, z, rot] of [[-30, -4, Math.PI / 2], [-22, -4, -Math.PI / 2], [30, 6, Math.PI / 2], [22, 6, -Math.PI / 2], [-10, 3.4, 0], [10, -1.4, 0], [-10, 12, 0], [10, 12, 0]]) E.push({ t: 'park_bench', at: [x, z], y: 0.03, rot });
  for (const x of [-26, 26]) E.push({ t: 'gaslamp', at: [x + 1.8, 5], y: 0.03 });
  // advertising columns and newspaper kiosks at the busy corners
  const cs = [];
  for (const e of EW) for (const n of NS) if (n.z0 <= e.z && n.z1 >= e.z && e.name !== 'ring') cs.push([n.x + n.w / 2 + 2.0, e.z - e.w / 2 + 1.5, n.x, e.z]);
  cs.sort((a, b) => Math.hypot(a[2], a[3]) - Math.hypot(b[2], b[3]));
  let k = 0;
  for (const [x, z] of cs) {
    if (k > 22 || Math.hypot(x, z) > 240 || (z > 50 && z < 95) || !free(x, z + 0.0) || onStreet(x, z, -3.2)) continue;
    E.push(k % 3 === 2 ? { t: 'kiosk', at: [x, z], y: 0.11, rot: 0, seed: k } : { t: 'litfass', at: [x, z], y: 0.11, seed: k }); k++;
  }
  // the Ring: two tracks, two trams standing at the stops, benches under the trees, the Fiaker rank before the Opera
  E.push({ t: 'tram_rails', z: -230, x0: -326, x1: 326, tracks: RING_TRACKS, y: 0.03 });
  E.push({ t: 'tram', at: [-95, RING_TRACKS[0]], rot: 0, y: 0.03, seed: 1 }, { t: 'tram', at: [118, RING_TRACKS[1]], rot: Math.PI, y: 0.03, seed: 2 });
  for (const x of [-150, -100, -50, 0, 50, 100, 150]) { E.push({ t: 'park_bench', at: [x + 6, -207.4], y: 0.11, rot: 0 }, { t: 'park_bench', at: [x - 6, -252.6], y: 0.11, rot: Math.PI }); }
  const rank = [[-44, -216], [-33, -216], [-22, -216], [-11, -216]];
  rank.forEach(([x, z], i) => {
    E.push({ t: 'fiaker', at: [x, z], rot: 0, y: 0.03, seed: i });
    for (const q of [-0.55, 0.55]) E.push({ t: 'animal', kind: 'horse', at: [x + 3.2, z + q], y: 0.03, rot: -Math.PI / 2, seed: i * 2 + (q > 0 ? 1 : 0), graze: false });
  });
  // a Fiaker at the Secession's street and one at the Karlsplatz
  E.push({ t: 'fiaker', at: [-48, -57.2], rot: 0, y: 0.03, seed: 9 });
  for (const q of [-0.55, 0.55]) E.push({ t: 'animal', kind: 'horse', at: [-48 + 3.2, -57.2 + q], y: 0.03, rot: -Math.PI / 2, seed: 20 + (q > 0 ? 1 : 0), graze: false });
  const ok = E.filter((e) => !e.at || Math.hypot(e.at[0], e.at[1]) < RADIUS - 8);
  return [base('vienna-furniture', ok.filter((e) => e.t !== 'animal')), base('vienna-horses', ok.filter((e) => e.t === 'animal'), { style: 'life' })];
}

/** The Naschmarkt: two rows of stalls across the aisle, cross-passages every few stalls, a Marktamt hut at the east end. */
function naschmarkt() {
  const E = [], rand = rng(77);
  for (const row of NASCH.rows) {
    let x = NASCH.x0 + 1, i = 0;
    while (x < NASCH.x1 - 3) {
      const w = 3.0 + Math.floor(rand() * 3) * 0.5;
      if (NS.some((s) => x + w > s.x - s.w / 2 - 1 && x < s.x + s.w / 2 + 1) || i % 6 === 5) { x += i % 6 === 5 ? 2.4 : w; i++; continue; }
      E.push({ t: 'naschmarkt_stall', rect: [x, row.z0, x + w, row.z1], front: row.front, y: 0.11, seed: Math.floor(rand() * 1e5) });
      x += w + 0.3; i++;
    }
  }
  return base('vienna-naschmarkt', E, { rooms: [{ id: 'Naschmarkt', rect: [NASCH.x0, 54.5, NASCH.x1, 56.7], y: 0.11, kind: 'open', market: true }] });
}

function karlsplatz() {
  const E = [{ t: 'opera', rect: OPERA, y: 0 }, { t: 'karlskirche', at: KARLSKIRCHE, y: 0 }];
  const rooms = [];
  for (const [x, z, rot] of PAVILIONS) {
    E.push({ t: 'stadtbahn_pavilion', at: [x, z], rot, y: 0 });
    rooms.push({ id: `Stadtbahn station ${rooms.length + 1}`, rect: [x - 5.0, z - 3.0, x + 5.0, z + 3.0], y: 0.2, kind: 'inner' });
  }
  rooms.push({ id: 'Karlsplatz', rect: [64, -52, 190, 29], y: 0.03, kind: 'open' }, { id: 'garden behind the Secession', rect: [SQUARE[0], SQUARE[1], SQUARE[2], SQUARE[3]], y: 0.03, kind: 'open' });
  return base('vienna-karlsplatz', E, { rooms });
}

/** The yards behind the street houses, their paving and common life, and the rear wings along their long sides (gapped at the passages' mouths). */
function hofs() {
  const out = [], rand = rng(1115);
  for (const yd of yards()) {
    const [x0, z0, x1, z1] = yd.rect, lod = Math.hypot((x0 + x1) / 2, (z0 + z1) / 2) > 170 ? 1 : 0;
    out.push({ t: 'hof_yard', rect: yd.rect, seed: 100 + yd.i, mouths: yd.mouths, y: 0, wing: WING + 2, lod });
    for (const [nz0, nz1, front] of [[z0 + 2, z0 + 2 + WING, 's'], [z1 - 2 - WING, z1 - 2, 'n']]) {
      let x = x0 + 2;
      while (x < x1 - 4.5) {
        const w = Math.min(x1 - 2 - x, 8 + Math.floor(rand() * 5) + rand());
        const rect = [x, nz0, x + w, nz1];
        const hit = yd.mouths.some((q) => !(rect[2] <= q[0] - 1.2 || rect[0] >= q[2] + 1.2 || rect[3] <= q[1] - 1.2 || rect[1] >= q[3] + 1.2));
        if (!hit && w > 4) out.push({ t: 'hof_wing', rect, front, seed: Math.floor(rand() * 1e6), storeys: 2 + (rand() < 0.5 ? 1 : 0), y: 0, lod });
        x += w;
      }
    }
  }
  return out;
}

export async function town() {
  const plans = [streets(), wien(), ...furniture(), naschmarkt(), karlsplatz()];
  const els = lots().map((l) => ({ t: 'mietshaus', rect: l.rect, front: l.front, kind: l.kind, storeys: l.storeys, seed: l.seed, y: 0, side: l.side, lod: l.lod, faience: l.faience, medallions: l.medallions, mat: l.mat, passage: l.passage, yardAt: l.yardAt, open: l.open }));
  els.push(...hofs());
  plans.push(...lodTiles('vienna-houses', 'viennese', els, { R: RADIUS }));
  void CAFE; void SEC;
  return plans;
}
