// Shöl and the valley's farmsteads (docs/settlements/lhasa.md §5): whitewashed flat-roofed houses round
// their courtyards; the printing house on Shöl's south-east corner; and the people (§12): monks in
// their red robes in the Deyang Shar, below the palace and on the frontage roof; pilgrims walking the
// circuit round the palace clockwise, turning their hand prayer wheels; the printers at their benches.
import { RADIUS, POND, STREET, shops, PRINTERY, BENCHES, CHAPEL, lots, pondDist, inLot, inRect, SHOL } from './layout.js';
import { ground } from './ground.js';
import { teaSeats } from '../../styles/tibetan/index.js';
import { dressing } from './dress.js';
const base = (id, elements, style = 'tibetan') => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-4, 60], facing: 'n' } });
/** The street's incense burner and the tethered yaks (x, z, rot), by the booths and in the lane. */
export const SANG = [-3.4, 166];
export const YAKS = [[6.4, 136, 1.2], [-6.5, 136.5, 4.4], [-2.2, 119, 0.3], [1.6, 119.8, 2.9], [-3.4, 190, 5.0]];
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const face = (from, to) => Math.atan2(-(to[0] - from[0]), -(to[1] - from[1]));       // a figure faces −z when rot = 0

function people() {
  const rand = rng(1694), L = [], W = [];
  const pick = (a) => a[Math.floor(rand() * a.length)];
  // monks: the maroon skirt and shawl (zen) over the shirt, heads shaven; the odd one in the yellow outer robe (chögu)
  const monk = (at, y, rot, pose = 'stand') => L.push({ t: 'figure', at, y, rot, h: 1.6 + rand() * 0.14, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: 'cloth_maroon', cloth2: rand() < 0.15 ? 'cloth_ochre' : 'cloth_maroon', over: rand() < 0.75 ? 'cape' : 'sash', skin: pick(['skin_medium', 'skin_medium', 'skin_dark']), hat: 'none', hair: 'shaven', hairMat: 'hair_dark', beard: false, feet: 'shod', pose });
  // pilgrims: the long chuba of wool or sheepskin belted with a sash, fur or felt hats, women in the striped apron; the
  // prayer wheel turning in the right hand (the forearm raised), walking the circuit sunwise
  const pilgrim = (at, rot, o = {}) => {
    const y = ground.height(...at), H = 1.52 + rand() * 0.2, k = H / 1.65, woman = rand() < 0.45, wheel = o.wheel ?? rand() < 0.8;
    L.push({ t: 'figure', at, y, rot, h: H, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: pick(['cloth_brown', 'cloth_black', 'cloth_grey', 'hide_tan', 'cloth_brown']), cloth2: pick(['cloth_red', 'cloth_green', 'cloth_ochre', 'paint_blue']),
      over: woman ? pick(['apron', 'sash']) : 'sash', skin: pick(['skin_medium', 'skin_dark']), hat: woman ? pick(['none', 'none', 'cap']) : pick(['brim', 'cap', 'none']), hatMat: pick(['hide_brown', 'cloth_brown', 'hide_white', 'cloth_red']),
      hair: woman ? pick(['long', 'bun']) : pick(['long', 'short']), hairMat: 'hair_dark', beard: !woman && rand() < 0.15, feet: 'shod', pose: wheel ? 'talk' : o.pose ?? 'stand' });
    if (!wheel) return;
    // the fist of the raised right forearm (the figure's 'talk' arm), the wheel upright in it
    const hx = 0.162 * k, hz = -0.327 * k, c = Math.cos(rot), s = Math.sin(rot);
    W.push({ t: 'mani_wheel', at: [at[0] + hx * c + hz * s, at[1] - hx * s + hz * c], y: y + 1.116 * k, rot: rand() * 6.28 });
  };
  // the circuit round the palace and Shöl (sunwise: west along the south, north up the west side, east behind
  // the hill, south down the east side), the pilgrims in twos and threes along it
  const free = (x, z) => !inLot(x, z, 1.5) && !inRect(SHOL, x, z, 3) && !inRect(CHAPEL, x, z, 1.2) && pondDist(x, z) > 2 && Math.hypot(x, z) < RADIUS - 20;
  const legs = [
    { a: [150, 222], b: [-190, 222] }, { a: [-213, 200], b: [-213, -40] },
    { a: [-150, -215], b: [150, -215] }, { a: [213, -40], b: [213, 200] },
  ];
  for (const { a, b } of legs) {
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]), dir = [(b[0] - a[0]) / len, (b[1] - a[1]) / len], rot = face([0, 0], dir);
    for (let d = 8 + rand() * 10; d < len - 5; d += 14 + rand() * 22) {
      const n = 1 + Math.floor(rand() * 3);
      for (let i = 0; i < n; i++) {
        const side = (i - (n - 1) / 2) * 0.9 + (rand() - 0.5) * 0.3, back = i * 0.7 * (rand() - 0.3);
        const x = a[0] + dir[0] * (d - back) - dir[1] * side, z = a[1] + dir[1] * (d - back) + dir[0] * side;
        if (free(x, z)) pilgrim([x, z], rot + (rand() - 0.5) * 0.2);
      }
    }
  }
  // pilgrims below the palace and at the outer pillar, looking up; one resting
  for (const p of [[-14, 50], [-12, 51.5], [8, 49], [10, 50.5], [-30, 58], [-28, 59]]) pilgrim(p, face(p, [p[0], 0]) + (rand() - 0.5) * 0.5);
  for (const p of [[5, 236], [6, 240.5]]) pilgrim(p, face(p, [-1, 238]), { wheel: rand() < 0.5 });
  // monks: in the Deyang Shar (on the court's raised floor at 70 m), in knots and talking
  for (const [x, z, n] of [[124, -62, 4], [136, -54, 3], [128, -71, 2], [140, -66, 3]]) for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2 + rand(), p = [x + Math.cos(t) * 1.1, z + Math.sin(t) * 1.1];
    monk(p, 70, face(p, [x, z]) + (rand() - 0.5) * 0.3, rand() < 0.5 ? 'talk' : 'stand');
  }
  // on the frontage roof watching the court below, and walking below the palace from the stairs
  for (const x of [-48, -46.8, -36, 18, 19.3, 30]) { const p = [x + rand() * 0.6, 26.2 + rand() * 0.6]; monk(p, 24, face(p, [p[0], 60]) + (rand() - 0.5) * 0.4); }
  for (const p of [[-96, 52], [-94.8, 52.6], [62, 55], [90, 51], [91.2, 52], [-60, 57], [40, 58]]) monk(p, 0, face(p, [p[0] + (rand() - 0.5) * 30, 120]), rand() < 0.4 ? 'talk' : 'stand');
  // the printers: two at each bench, sitting facing each other across it; a monk carrying blocks between the racks
  const yf = 3.86;
  for (const [bx, bz] of BENCHES) for (const sg of [-1, 1]) {
    const p = [bx + sg * 0.92, bz];
    L.push({ t: 'figure', at: p, y: yf, rot: face(p, [bx, bz]), h: 1.6 + rand() * 0.1, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: rand() < 0.5 ? 'cloth_maroon' : pick(['cloth_brown', 'cloth_grey']), cloth2: 'cloth_maroon', over: 'sash', skin: 'skin_medium', hat: 'none', hair: rand() < 0.5 ? 'shaven' : 'short', hairMat: 'hair_dark', beard: false, feet: 'shod', pose: 'cross' });
  }
  monk([PRINTERY[0] + 22.5, PRINTERY[1] + 3.6], yf, face([0, 0], [1, 0]));
  return [base('lhasa-people', L, 'life'), base('lhasa-wheels', W)];
}

export async function town() {
  const all = lots(), plans = [];
  for (let i = 0; i < all.length; i += 130) plans.push(base(`lhasa-houses-${i / 130}`, all.slice(i, i + 130).map((l) => ({ t: 'tibetan_house', ...l }))));
  // the printing house on Shöl's south-east corner
  plans.push(base('lhasa-parkhang', [{ t: 'parkhang', rect: PRINTERY, y: 0, seed: 1690, benches: BENCHES }]));
  // the pond behind the palace, where the earth for the Potala's mortar was dug (later the Lukhang's lake)
  plans.push(base('lhasa-pond', [{ t: 'water_cells', rect: [POND.c[0] - POND.rx - 2, POND.c[1] - POND.rz - 2, POND.c[0] + POND.rx + 2, POND.c[1] + POND.rz + 2], y: POND.level, cell: 1.5, inside: (x, z) => pondDist(x, z) < 0.6 }]));
  // on the pilgrims' circuit: the rows of prayer wheels along its north leg behind the hill (on the
  // walkers' right as they go sunwise), and the chapel of the great prayer wheel on its west leg (§13)
  const gy = (x, z) => ground.height(x, z);
  plans.push(base('lhasa-circuit', [
    { t: 'mani_gallery', a: [-150, -211.2], b: [-24, -211.2], y: gy, side: -1 },
    { t: 'mani_gallery', a: [24, -211.2], b: [150, -211.2], y: gy, side: -1 },
    { t: 'lhakhang', rect: CHAPEL, y: gy((CHAPEL[0] + CHAPEL[2]) / 2, (CHAPEL[1] + CHAPEL[3]) / 2), door: 'w' },
  ]));
  // the street's shops, booths, the flags across it, the yaks, the pilgrims prostrating
  const sh = shops(), rand = rng(77), E = [];
  for (const s of sh) E.push(s.kind === 'stall' ? { t: 'stall', at: s.at, rot: s.rot, w: s.w, y: 0, seed: s.seed, goods: s.goods } : { t: 'tibetan_shop', rect: s.rect, door: s.door, kind: s.kind, y: 0, seed: s.seed });
  for (const z of [78, 88, 98, 108, 118, 156, 167, 178, 190, 199]) E.push({ t: 'flag_line', a: [STREET[0] - 0.4, z], b: [STREET[2] + 0.4, z + 1.5], y0: 8.2, y1: 8.4, sag: 0.8, poles: ![78, 88, 98, 108, 118, 178, 190].includes(z) });
  E.push({ t: 'sangkhang', at: SANG, rot: 0 });
  plans.push(base('lhasa-shops', E));
  // sangkhang in the street, its smoke (smoke.js)
  plans.push(base('lhasa-street-life', [
    ...YAKS.map(([x, z, rot], i) => ({ t: 'animal', kind: 'yak', at: [x, z], y: 0, rot, seed: 40 + i, graze: false })),
  ], 'life'));
  // patrons on the tea houses' benches, sharing tables and talking
  const seated = [];
  for (const s of sh) if (s.kind === 'tea') for (const q of teaSeats({ rect: s.rect, door: s.door }, rand)) {
    const woman = rand() < 0.3;
    seated.push({ t: 'figure', at: q.at, y: 0, rot: q.rot, h: 1.5 + rand() * 0.2, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: rand() < 0.2 ? 'cloth_maroon' : ['cloth_brown', 'cloth_black', 'cloth_grey', 'hide_tan'][Math.floor(rand() * 4)], cloth2: ['cloth_red', 'cloth_green', 'cloth_ochre', 'paint_blue'][Math.floor(rand() * 4)], over: woman ? 'apron' : 'sash', skin: rand() < 0.5 ? 'skin_medium' : 'skin_dark', hat: woman ? 'none' : rand() < 0.5 ? 'cap' : 'none', hatMat: 'hide_brown', hair: woman ? 'bun' : 'short', hairMat: 'hair_dark', beard: false, feet: 'shod', pose: 'sit' });
  }
  // the keepers of the trading houses, standing behind their counters looking out at the street (the room's frame as styles/tibetan/shops.js has it:
  // u along the front from its middle, v in from the front face; the counter across the room at v = 0.7 + 1.7 … 2.4, the free floor behind it)
  for (const q of sh) {
    if (q.kind !== 'trade' || q.seed % 3 === 2) continue;
    const NORM = { s: [0, 1], n: [0, -1], e: [1, 0], w: [-1, 0] }[q.door], [x0, z0, x1, z1] = q.rect, Fp = q.door === 'e' ? [x1, (z0 + z1) / 2] : [x0, (z0 + z1) / 2];
    const P = (u, v) => [Fp[0] + -NORM[1] * u - NORM[0] * v, Fp[1] + NORM[0] * u - NORM[1] * v], at = P(0.5 + (q.seed % 5) * 0.12, 3.55), woman = q.seed % 4 === 0;
    seated.push({ t: 'figure', at, y: 0.04, rot: Math.atan2(-NORM[0], -NORM[1]), h: 1.5 + rand() * 0.15, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: woman ? 'cloth_black' : ['cloth_brown', 'cloth_grey', 'hide_tan'][q.seed % 3], cloth2: ['cloth_red', 'cloth_green', 'cloth_ochre'][q.seed % 3], over: woman ? 'apron' : 'sash', skin: 'skin_medium', hat: woman ? 'none' : 'cap', hatMat: 'cloth_brown', hair: woman ? 'long' : 'short', hairMat: 'hair_dark', beard: false, feet: 'shod', pose: 'stand' });
  }
  plans.push(base('lhasa-patrons', seated, 'life'));
  // eye-level dressing of the lanes and the street's fronts, tiled 100 m with the plans drawn near (as Suzhou's life)
  const dr = dressing(), tile = (list, style, name) => {
    const tiles = new Map();
    for (const e of list) { const p = e.at ?? e.a, k = `${Math.floor(p[0] / 100)},${Math.floor(p[1] / 100)}`; if (!tiles.has(k)) tiles.set(k, []); tiles.get(k).push(e); }
    return [...tiles].map(([k, els]) => { const [i, j] = k.split(',').map(Number); return { ...base(`lhasa-${name}-${k}`, els, style), center: [i * 100 + 50, j * 100 + 50], near: 230 }; });
  };
  plans.push(...tile(dr.dung, 'tibetan', 'dung'), ...tile(dr.flags, 'tibetan', 'lane-flags'), ...tile(dr.life, 'life', 'lane-life'));
  return [...plans, ...people()];
}
