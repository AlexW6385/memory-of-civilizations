// The street at the arrival (docs/settlements/barcelona.md §12): the Marina's junction with the cross street, seen from the east kerb
// looking at the Nativity façade — the works' hoarding along the block's edge with its gate, the newspaper kiosk and its readers, the
// visitors at the kerb looking up, a cab rank, a fruiterer, a porter's handcart, a tram standing up the street, the masons on the
// scaffolds of the towers. Positions follow layout.js (the Marina at x = PITCH × 2.5, the cross street at z = −PITCH / 2).
import { PITCH, BLOCK, SAGRADA, height } from './layout.js';
import { scaffoldSpots } from '../../styles/modernisme/nativity.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const XM = PITCH * 2.5;                                   // the Marina's middle
const EDGE = SAGRADA[0] + BLOCK / 2;                      // the works' east edge, on the Marina's west house line
const SOUTH = SAGRADA[1] + BLOCK / 2;                     // the works' south edge, on the cross street
const Y = (x, z) => height(x, z);
const faceTo = (a, b) => Math.atan2(-(b[0] - a[0]), -(b[1] - a[1]));      // the figure's front is −z: its turn to face from a toward b

/** The hoarding round the works on the Marina and the cross street, its gate at the walk to the façade (z = the temple's). */
export function worksElements() {
  const gz = SAGRADA[1], g = [[(SOUTH - gz) - 3.2, (SOUTH - gz) + 3.2]];
  return [
    { t: 'works_fence', a: [EDGE + 0.15, SOUTH], b: [EDGE + 0.15, SAGRADA[1] - BLOCK / 2], y: Y, gates: g, h: 1.5, seed: 11 },
    { t: 'works_fence', a: [SAGRADA[0] - BLOCK / 2, SOUTH + 0.15], b: [EDGE + 0.15, SOUTH + 0.15], y: Y, gates: [], h: 1.5, seed: 12 },
  ];
}

const KIOSK = [XM - 8.6, SAGRADA[1] + 29];
/** The people and things of the street at the arrival. */
export function arrivalLife() {
  const L = [], r = rng(1912), pick = (a) => a[Math.floor(r() * a.length)];
  const man = (o = {}) => ({ dress: 'trousers', cloth: pick(['cloth_black', 'cloth_grey', 'cloth_brown', 'cloth_indigo']), cloth2: pick(['cloth_black', 'cloth_grey']), hat: pick(['brim', 'brim', 'cap']), hatMat: pick(['cloth_black', 'cloth_grey', 'cloth_brown']), beard: r() < 0.5 ? 0.8 : 0, hair: 'short', ...o });
  const lady = (o = {}) => ({ dress: 'robe', cloth: pick(['cloth_white', 'cloth_maroon', 'cloth_indigo', 'cloth_grey', 'cloth_green']), cloth2: 'cloth_white', hat: 'brim', hatMat: pick(['cloth_white', 'cloth_black', 'cloth_maroon']), hair: 'bun', over: 'shawl', ...o });
  const worker = (o = {}) => ({ dress: 'trousers', cloth: pick(['cloth_indigo', 'cloth_brown', 'cloth_grey']), cloth2: 'cloth_red', over: 'sash', hat: 'cap', hatMat: 'cloth_grey', hair: 'short', beard: 0.3, ...o });
  const fig = (at, to, o, y = Y(at[0], at[1]) + 0.05) => L.push({ t: 'figure', at, y, rot: faceTo(at, to), seed: Math.floor(r() * 1e9), skin: 'skin_light', pose: 'stand', ...o });
  const FACADE = [SAGRADA[0] + 22, SAGRADA[1]];
  // the newspaper kiosk on the west pavement just north of the junction, the boy with his bundle, two gentlemen reading and talking
  fig([KIOSK[0] + 1.6, KIOSK[1] + 1.2], [XM + 14, SAGRADA[1] + 50], man({ hat: 'cap', cloth: 'cloth_grey', beard: 0, carry: 'bundle' }));
  fig([KIOSK[0] - 0.4, KIOSK[1] - 2.0], [KIOSK[0] + 0.6, KIOSK[1] - 2.6], man({ pose: 'talk' }));
  fig([KIOSK[0] + 0.5, KIOSK[1] - 2.6], [KIOSK[0] - 0.4, KIOSK[1] - 2.0], man({ pose: 'talk', beard: 0.8 }));
  // visitors at the works' hoarding looking up at the façade: a family and a priest
  const kx = EDGE + 2.0;
  fig([kx, SAGRADA[1] + 3.2], FACADE, man({ cloth: 'cloth_black', hat: 'brim' }));
  fig([kx + 0.2, SAGRADA[1] + 4.4], FACADE, lady({ carry: 'child' }));
  fig([kx + 0.1, SAGRADA[1] + 5.4], FACADE, { dress: 'trousers', cloth: 'cloth_grey', cloth2: 'cloth_grey', hat: 'cap', hatMat: 'cloth_grey', hair: 'short', h: 0.6 });
  fig([kx - 0.1, SAGRADA[1] - 6.5], FACADE, { dress: 'robe', cloth: 'cloth_black', cloth2: 'cloth_black', hat: 'brim', hatMat: 'cloth_black', hair: 'short', over: 'none' });
  // the gatekeeper at the gate of the works, a mason with a block on a handbarrow behind the hoarding
  fig([EDGE - 1.6, SAGRADA[1] - 2.3], [EDGE + 6, SAGRADA[1] - 2.3], worker({ pose: 'talk', cloth: 'cloth_brown' }));
  fig([EDGE - 2.4, SAGRADA[1] + 1.2], [EDGE - 2.4, SAGRADA[1] + 8], worker({ carry: 'sack' }));
  // the east pavement: a fruiterer's stall with its seller and a buyer, a woman with a basket
  const SX = XM + 8.4, SZ = SAGRADA[1] + 6;
  L.push({ t: 'stall', at: [SX - 0.2, SZ], y: Y(SX, SZ) + 0.05, rot: Math.PI / 2, w: 2.4, d: 1.1, goods: ['melons', 'greens'], awning: 'cloth_ochre', seed: 4101 });
  fig([SX - 1.4, SZ], [SX + 3, SZ], man({ cloth: 'cloth_white', over: 'apron', hat: 'cap', hatMat: 'cloth_brown' }));
  fig([SX + 1.9, SZ + 0.6], [SX - 1, SZ], lady({ carry: 'basket' }));
  fig([XM + 9.7, SAGRADA[1] + 22], [XM + 9.7, SAGRADA[1] + 40], lady({ cloth: 'cloth_ochre', carry: 'basket' }));
  // a porter's handcart of sacks at the west kerb south of the gate, its porter and a dog
  const HC = [EDGE + 2.4, SAGRADA[1] + 12];
  L.push({ t: 'handcart', at: HC, y: Y(...HC) + 0.04, rot: Math.PI, load: 'sacks', seed: 4102 });
  fig([HC[0] + 0.1, HC[1] - 1.7], [HC[0], HC[1] + 4], worker({ cloth: 'cloth_brown', hat: 'cap' }));
  L.push({ t: 'animal', kind: 'dog', at: [HC[0] + 1.0, HC[1] - 2.8], y: Y(HC[0], HC[1]) + 0.04, rot: 2.2, seed: 4103 });
  // pigeons on the paving of the junction's corner
  L.push({ t: 'chickens', kind: 'pigeon', at: [EDGE + 3.5, SOUTH - 3], y: Y(EDGE + 3.5, SOUTH - 3) + 0.04, seed: 4104 });
  // the masons on the boards of the façade's scaffolds (nativity.js, scaffoldSpots: the boards stand every 4 m, on the street side): two at the cypress's foot, three on the
  // lanterns' stumps, one on the Hope tower's cut-off head and one on the nearer inner tower's
  const g0 = Y(SAGRADA[0] + 22, SAGRADA[1]), spots = scaffoldSpots(SAGRADA[0] + 22, g0, SAGRADA[1]);
  const at = (dz, rel) => spots.find((q) => Math.abs(q[1] - SAGRADA[1] - dz) < 0.3 && Math.abs(q[2] - g0 - rel - 0.26) < 0.2);
  const picks = [[at(0, 42), -0.9, 1], [at(0, 46), 1.0, -1], [at(-14.25, 32), 0.9, 1], [at(-14.25, 36), -0.9, -1], [at(14.25, 32), 1.0, 1], [at(21, 47), -1.0, -1], [at(7.5, 67), 0.8, 1]];
  let k = 0;
  for (const [q, dz, face] of picks) {
    if (!q) continue;
    L.push({ t: 'figure', at: [q[0], q[1] + dz], y: q[2] + 0.01, rot: face > 0 ? Math.PI / 2 : Math.PI / 2 + 0.6, seed: Math.floor(r() * 1e9), skin: 'skin_light', pose: k++ % 2 ? 'talk' : 'stand', ...worker({ cloth: 'cloth_white' }) });
  }
  // lamps: the gas lamps of the corner
  for (const [x, z] of [[EDGE + 1.0, SOUTH - 3.2]]) L.push({ t: 'street_lamp', at: [x, z], y: Y(x, z), h: 4.2, seed: 4110 });
  return L;
}

/** A tram standing at the Marina's east track north of the gate (the walk to the façade stays clear), and two cabs at the east kerb. */
export function arrivalStreet() {
  const out = [{ t: 'kiosk', at: KIOSK, y: Y(...KIOSK), rot: 0.2, seed: 5 }], zt = SAGRADA[1] - 17;
  // the stone yard at the façade's foot, inside the hoarding: north and south of the walk to the gate (z = the temple's ±5)
  const yx = SAGRADA[0] + 22 + 8.8, yw = EDGE - 1.2 - yx;
  out.push({ t: 'stone_yard', at: [yx, SAGRADA[1] - 26], size: [yw, 21], y: Y(yx, SAGRADA[1]), seed: 31 }, { t: 'stone_yard', at: [yx, SAGRADA[1] + 6], size: [yw, 20], y: Y(yx, SAGRADA[1]), seed: 32 });
  out.push({ t: 'tram', at: [XM + 1.55, zt], y: Y(XM + 1.55, zt) + 0.03, rot: 0, kind: 'closed', wire: 5.87, seed: 4201 });
  for (const [z, s] of [[SAGRADA[1] + 25, 4202], [SAGRADA[1] + 31, 4203]]) { const x = XM + 6.2; out.push({ t: 'carriage', at: [x, z], y: Y(x, z), rot: 0, rect: [x - 0.9, z - 2.6, x + 0.9, z + 2.6], seed: s }); }
  return out;
}
