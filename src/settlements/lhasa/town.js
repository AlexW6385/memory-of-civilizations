// Shöl and the valley's farmsteads (docs/settlements/lhasa.md §5): whitewashed flat-roofed houses round
// their courtyards; the printing house on Shöl's south-east corner; and the people (§12): monks in
// their red robes in the Deyang Shar, below the palace and on the frontage roof; pilgrims walking the
// circuit round the palace clockwise, turning their hand prayer wheels; the printers at their benches.
import { RADIUS, POND, PRINTERY, BENCHES, lots, pondDist, inLot, inRect, SHOL } from './layout.js';
import { ground } from './ground.js';
const base = (id, elements, style = 'tibetan') => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-4, 60], facing: 'n' } });
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const face = (from, to) => Math.atan2(-(to[0] - from[0]), -(to[1] - from[1]));       // a figure faces −z when rot = 0

function people() {
  const rand = rng(1694), L = [], W = [];
  const pick = (a) => a[Math.floor(rand() * a.length)];
  // monks: the maroon skirt and shawl (zen) over the shirt, heads shaven; the odd one in the yellow outer robe (chögu)
  const monk = (at, y, rot, pose = 'stand') => L.push({ t: 'figure', at, y, rot, h: 1.6 + rand() * 0.14, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: 'cloth_red', cloth2: rand() < 0.15 ? 'cloth_ochre' : 'cloth_red', over: rand() < 0.75 ? 'cape' : 'sash', skin: pick(['skin_medium', 'skin_medium', 'skin_dark']), hat: 'none', hair: 'shaven', hairMat: 'hair_dark', beard: false, feet: 'shod', pose });
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
  const free = (x, z) => !inLot(x, z, 1.5) && !inRect(SHOL, x, z, 3) && pondDist(x, z) > 2 && Math.hypot(x, z) < RADIUS - 20;
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
    L.push({ t: 'figure', at: p, y: yf, rot: face(p, [bx, bz]), h: 1.6 + rand() * 0.1, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: rand() < 0.5 ? 'cloth_red' : pick(['cloth_brown', 'cloth_grey']), cloth2: 'cloth_red', over: 'sash', skin: 'skin_medium', hat: 'none', hair: rand() < 0.5 ? 'shaven' : 'short', hairMat: 'hair_dark', beard: false, feet: 'shod', pose: 'sit' });
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
  return [...plans, ...people()];
}
