// The service yards of the gardens (docs/settlements/versailles.md §5d): the arrival stands among the parterres, where no house of the town
// reaches, so what can be entered near it is what stood in the gardens — the lodgings and workshops of the people who kept them. Two levelled
// yards behind the hornbeam walls either side of the Latona walk, each entered by its gate: the head gardener's lodge, the tool house, the
// sculptors' atelier, the chair-bearers' room; the Cent-Suisses' guardroom, the fontainiers' room, the orange tubs' store, the joiner's shop.
// Each is the classical_fr town house (`fr_house`, open: furnished by interiors.js), its own height, bays, colour and roof; people in some.
import { YARDS, YARD_Y as Y } from './layout.js';

const R = (x0, z0, x1, z1) => [x0, z0, x1, z1];
// south yard (z > 0): the row along the hedge faces the lane (front 's'), the row behind it faces back (front 'n'); the north yard mirrors it
export const SERVICE = [
  { use: 'gardener', rect: R(-120, 41, -108.5, 53), front: 's', storeys: 2, kind: 'house', wall: 'brick', seed: 1690, say: 'head gardener\'s lodge' },
  { use: 'tools', rect: R(-99.5, 41, -90, 53), front: 's', storeys: 1, kind: 'shop', wall: 'plaster_white', seed: 1691, say: 'tool house' },
  { use: 'sculptor', rect: R(-120, 62, -109, 74), front: 'n', storeys: 2, kind: 'shop', wall: 'limestone', seed: 1692, say: 'sculptors\' atelier' },
  { use: 'bearers', rect: R(-107.5, 62, -97, 74), front: 'n', storeys: 2, kind: 'hotel', seed: 1693, say: 'chair-bearers\' room' },
  { use: 'guard', rect: R(-120, -53, -111, -41), front: 'n', storeys: 1, kind: 'house', wall: 'brick_grey', seed: 1694, say: 'guardroom of the Cent-Suisses' },
  { use: 'fountain', rect: R(-101, -53, -90, -41), front: 'n', storeys: 2, kind: 'house', wall: 'stucco_cream', seed: 1695, say: 'fontainiers\' room' },
  { use: 'orangery', rect: R(-121, -74, -107.5, -62), front: 's', storeys: 1, kind: 'shop', wall: 'stucco_pale', seed: 1696, say: 'store of the orange tubs' },
  { use: 'joiner', rect: R(-106, -74, -96, -62), front: 's', storeys: 2, kind: 'shop', wall: 'stucco_siena', seed: 1697, say: 'joiner\'s shop' },
].map((b) => ({ ...b, trade: b.use, y: Y, foot: Y - 0.4 }));

const faceRot = (nx, nz) => Math.atan2(-nx, -nz);
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

/** The service houses in two levels (open and furnished near, plain far), their yards' cobbles, and the people and goods in and about them. */
export function servicePlans() {
  const base = (id, style, extra) => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, entrance: { at: [-104, 0], facing: 'n' }, bounds: [-135, -100, -75, 100], center: [-104, 0], ...extra });
  const open = SERVICE.map((b) => ({ t: 'fr_house', ...b, open: true }));
  const yards = YARDS.map((r) => ({ t: 'floor', rect: r, y: Y + 0.03, th: 0.3, mat: 'pebbles' }));
  const rooms = SERVICE.map((b) => ({ id: b.say, rect: [b.rect[0] + 0.4, b.rect[1] + 0.4, b.rect[2] - 0.4, b.rect[3] - 0.4], y: Y + 0.14, kind: b.use === 'bearers' || b.use === 'orangery' ? 'hall' : 'chamber' }));
  const rand = rng(1688), L = [];
  const fy = Y + 0.14;
  const fig = (o) => L.push({ t: 'figure', y: fy, dress: 'tunic', legs: 'hose', skin: 'skin_light', cloth2: 'cloth_white', hat: 'brim', hatMat: 'cloth_black', seed: Math.floor(rand() * 1e9), h: 1.62 + rand() * 0.14, pose: 'stand', ...o });
  const pos = (b, u, v) => (b.front === 's' ? [b.rect[2] - u, b.rect[3] - v] : [b.rect[0] + u, b.rect[1] + v]);
  const inside = (name, u, v, o) => { const b = SERVICE.find((q) => q.use === name), w = b.rect[2] - b.rect[0]; const p = pos(b, u === 'mid' ? w * 0.5 : u, v); fig({ at: p, rot: b.front === 's' ? 0 : Math.PI, ...o }); };
  inside('gardener', 4.6, 1.9, { cloth: 'cloth_brown', carry: 'hoe', hat: 'brim', hatMat: 'thatch' });
  inside('gardener', 6.2, 2.0, { cloth: 'cloth_green', dress: 'robe', hat: 'veil', hatMat: 'cloth_white', h: 1.55, pose: 'talk' });
  inside('sculptor', 'mid', 3.2, { cloth: 'cloth_white', cloth2: 'cloth_grey', hat: 'cap', hatMat: 'cloth_white', pose: 'talk' });
  inside('sculptor', 3.0, 4.4, { cloth: 'cloth_grey', cloth2: 'cloth_brown', hat: 'cap', hatMat: 'cloth_brown', carry: 'pole' });
  inside('bearers', 4.6, 7.2, { cloth: 'cloth_indigo', pose: 'talk' });
  inside('bearers', 5.6, 7.3, { cloth: 'cloth_blue', pose: 'stand' });
  inside('guard', 'mid', 2.2, { cloth: 'cloth_red', cloth2: 'cloth_white', h: 1.78, carry: 'pole' });
  inside('guard', 3.8, 2.4, { cloth: 'cloth_blue', cloth2: 'cloth_white', h: 1.76, pose: 'talk' });
  inside('fountain', 'mid', 2.9, { cloth: 'cloth_brown', cloth2: 'cloth_grey', hat: 'cap', hatMat: 'cloth_brown' });
  inside('orangery', 4.0, 3.3, { cloth: 'cloth_grey', cloth2: 'cloth_brown', hat: 'brim', hatMat: 'thatch', carry: 'pails' });
  inside('joiner', 'mid', 3.0, { cloth: 'cloth_brown', cloth2: 'cloth_ochre', hat: 'cap', hatMat: 'cloth_white', pose: 'sweep' });
  // the yards: a gardener with his barrow and his tubs, barrels and crates at the doors, a bench, the guards at the gate, a dog
  const prop = (o) => L.push({ y: Y, ...o });
  for (const s of [-1, 1]) {
    const zc = s * 57.5;
    prop({ t: 'barrow', at: [-95, zc + s * 3], rot: 0.4, seed: 8 + s }); prop({ t: 'barrel', at: [-115.5, zc + s * 2.2], n: 2, seed: 4, rot: 0.3 }); prop({ t: 'crates', at: [-90.8, zc - s * 3.6], rot: 0.2, seed: 5 });
    prop({ t: 'bench', at: [-104, s * 79], rot: s < 0 ? 0 : Math.PI, len: 1.8 }); prop({ t: 'sacks', at: [-98.5, s * 56.4], rot: 0.6, seed: 6 });
    fig({ y: Y, at: [-110, s * 57.8], rot: Math.PI / 2, cloth: 'cloth_grey', hat: 'brim', hatMat: 'thatch', carry: s > 0 ? 'sack' : 'basket', pose: 'stand' });
    fig({ y: Y, at: [-103, s * 38.6], rot: s > 0 ? 0 : Math.PI, cloth: 'cloth_red', cloth2: 'cloth_white', h: 1.78, carry: 'pole' });
    L.push({ t: 'animal', kind: 'dog', at: [-100.5, s * 58.6], y: Y, rot: 1.3, seed: 31 + s });
  }
  void faceRot;
  return [
    base('versailles-service', 'classical_fr', { near: 160, elements: [...yards, ...open], rooms }),
    base('versailles-service-far', 'classical_fr', { far: 160, nocollide: true, elements: SERVICE.map((b) => ({ t: 'fr_house', ...b, simple: true })) }),
    base('versailles-service-life', 'life', { near: 160, elements: L }),
  ];
}
