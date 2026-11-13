// Jerusalem about 700 — the life of the open houses and the pilgrims (docs/settlements/jerusalem.md §5a, §10a):
// in each open house the porous water jar on its stand by the door, storage jars, sacks and baskets in the
// store, cooking pots by the oven, a quern; the women at the oven and the jar, the man of the house, a child,
// a donkey at its manger in the court of one. Christian pilgrims with their staffs climbing to the Holy
// Sepulchre from the Cardo and in its atrium; Muslim pilgrims at the Dome of the Rock's west door and on its
// platform. Pure data (life style).

import { SEPULCHRE, SEP_Y, SEP_STAIR, CARDO, CARDO_Y, HARAM, LODGES } from './layout.js';
import { openLayout } from '../../styles/islamic/house.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const CL = ['cloth_white', 'cloth_brown', 'cloth_indigo', 'cloth_ochre', 'cloth_black', 'linen', 'cloth_red'];

export function houseLife(houses) {
  const L = [], rand = rng(707), pick = (a) => a[Math.floor(rand() * a.length)];
  const person = (at, y, rot, o = {}) => L.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: pick(CL), cloth2: pick(CL), skin: 'skin_medium', hat: 'none', hatMat: 'cloth_white', feet: 'bare', ...o });
  houses.forEach((h, i) => {
    const { F, court: [cx0, cz0, cx1, cz1], room: [rx0, rz0, rx1, rz1], store: [sx0, sz0, sx1, sz1], door: [dx, dz] } = openLayout(h);
    // the zir by the inside of the door, a cup on its board; a water pot beside it
    L.push({ t: 'pot', kind: 'zir', at: [dx + 1.1, cz1 - 0.45], y: F, seed: i * 10 + 1 });
    L.push({ t: 'pot', kind: 'water_pot', at: [dx + 1.7, cz1 - 0.4], y: F, seed: i * 10 + 2 });
    // the store: two big jars, a row of amphorae, sacks of grain, baskets
    L.push({ t: 'pot', kind: 'pithos', at: [sx0 + 0.55, sz1 - 0.6], y: F, seed: i * 10 + 3 });
    L.push({ t: 'pot', kind: 'pithos', at: [sx0 + 0.55, sz1 - 1.6], y: F, seed: i * 10 + 4 });
    for (let k = 0; k < 4; k++) L.push({ t: 'pot', kind: 'amphora', at: [sx1 - 0.3, sz1 - 0.5 - k * 0.48], y: F, seed: i * 10 + 5 + k });
    L.push({ t: 'sacks', n: 4, at: [(sx0 + sx1) / 2, sz0 + 2.6], y: F, rot: Math.PI / 2, seed: i * 10 + 9 });
    L.push({ t: 'basket', n: 2, at: [(sx0 + sx1) / 2 + 0.2, sz1 - 2.8], y: F, seed: i * 10 + 11 });
    // by the oven: the cooking pots, firewood, a stool
    L.push({ t: 'pot', kind: 'dark_pot', at: [cx1 - 1.9, cz1 - 0.45], y: F, seed: i * 10 + 12 });
    L.push({ t: 'pot', kind: 'dark_pot', at: [cx1 - 2.35, cz1 - 0.5], y: F, seed: i * 10 + 13 });
    L.push({ t: 'firewood', at: [cx1 - 0.35, cz1 - 2.1], y: F, rot: Math.PI / 2, len: 1.2, seed: i });
    L.push({ t: 'stool', at: [cx1 - 1.3, cz1 - 1.6], y: F, rot: 0.6, seed: i * 10 + 14 });
    // the household: a woman at the oven, another drawing water at the cistern or carrying a jar, the man in
    // the main room's door, a child in the court
    person([cx1 - 1.4, cz1 - 1.0], F, -2.4, { pose: 'squat', hat: 'veil', hatMat: pick(['cloth_white', 'cloth_indigo', 'cloth_black']) });
    if (i % 2) person([cx1 - 1.3, cz0 + 2.2], F, 0.4, { hat: 'veil', hatMat: 'cloth_white', carry: 'pot' });
    person([(rx0 + rx1) / 2 + 1.1, rz1 + 1.3], F, Math.PI * 0.95, { hat: 'turban', beard: true, pose: rand() < 0.5 ? 'talk' : 'stand' });
    if (i % 2 === 0) person([(cx0 + cx1) / 2 - 0.6, (cz0 + cz1) / 2 + 0.3], F, rand() * 6, { child: true });
    // in the main room, seated on the mattress at the back
    person([(rx0 + rx1) / 2 + 1.2, rz0 + 0.5], F + 0.16, Math.PI, { pose: 'sit_ground', hat: i % 2 ? 'turban' : 'veil', hatMat: 'cloth_white' });
    // a donkey at its manger in one court
    if (i === 1) {
      L.push({ t: 'trough', at: [cx0 + 1.4, cz0 + 0.5], y: F, rot: 0, len: 1.4, seed: 71 });
      L.push({ t: 'animal', kind: 'donkey', at: [cx0 + 1.4, cz0 + 1.6], y: F, rot: Math.PI, graze: true, seed: 72 });
    }
  });
  return L;
}

export function pilgrims() {
  const L = [], rand = rng(680), pick = (a) => a[Math.floor(rand() * a.length)];
  const pil = (at, y, rot, o = {}) => L.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: pick(['cloth_brown', 'cloth_grey', 'linen', 'cloth_black']), cloth2: pick(['cloth_brown', 'linen']), skin: pick(['skin_light', 'skin_medium']), hat: pick(['cap', 'none', 'veil']), hatMat: pick(['cloth_brown', 'linen', 'cloth_black']), over: 'cloak', pose: 'staff', staffMat: 'timber', feet: 'shod', ...o });
  // the stair up from the Cardo to the church's terrace: pilgrims climbing, one resting on the steps
  const sx1 = SEPULCHRE[2], sx0 = sx1 - SEP_STAIR, cz = (SEPULCHRE[1] + SEPULCHRE[3]) / 2;
  for (let k = 0; k < 5; k++) { const x = sx1 - 2 - k * 3.1, z = cz + (rand() - 0.5) * 6, f = (sx1 - x) / SEP_STAIR; pil([x, z], CARDO_Y + (SEP_Y - CARDO_Y) * f - 0.3 + 0.15, Math.PI / 2 + (rand() - 0.5) * 0.3); }
  // on the Cardo before the propylaea, a group just arrived
  for (let k = 0; k < 4; k++) pil([CARDO.x - 3 - rand() * 3, cz + (k - 1.5) * 1.4], CARDO_Y, Math.PI / 2 + (rand() - 0.5) * 0.8, k === 2 ? { pose: 'talk' } : {});
  // in the atrium before the basilica's doors, kneeling and standing
  for (let k = 0; k < 6; k++) pil([sx0 - 4 - rand() * 6, cz + (k - 2.5) * 2.2 + (rand() - 0.5)], SEP_Y, Math.PI / 2, k % 3 === 0 ? { pose: 'kneel', arms: 'pray' } : {});
  // the Dome of the Rock: pilgrims at its west door and on its platform (the platform 4 m above the esplanade)
  const yP = HARAM.top + 4, oz = -20, MU = ['cloth_white', 'cloth_white', 'linen', 'cloth_brown', 'cloth_indigo'];
  const mus = (at, rot, o = {}) => L.push({ t: 'figure', at, y: yP, rot, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: pick(MU), cloth2: pick(MU), skin: 'skin_medium', hat: pick(['turban', 'turban', 'veil']), hatMat: 'cloth_white', feet: 'bare', ...o });
  for (const [x, z, rot, o] of [[-31.5, oz - 3.8, Math.PI / 2, {}], [-32.2, oz + 4.2, Math.PI / 2, { pose: 'talk' }], [-36, oz + 9, 1.2, {}], [-40, oz - 12, 0.9, {}], [-44, oz + 14, 2.0, {}], [-29.5, oz + 6.5, Math.PI / 2, { pose: 'kneel', arms: 'pray' }]]) mus([x, z], -rot, o);
  return L;
}

/**
 * The lodges of the Haram's servants (layout.js LODGES): by the use of each, what stands in its rooms and before its door and who is in
 * it: the oil store (jars along the wall, the clerk with his tally), the wick-makers (flax in baskets, a man twisting wicks), the glass-lamp
 * makers (the little furnace in the court, lamps cooling on a board), the perfumers (censers, jars of ointment), the gatekeepers (their
 * staffs, a bench, a tray of bread), and the servants' dwellings. Pure data (life style) and the awnings and shelves (islamic style).
 */
export function lodgeLife() {
  const L = [], rand = rng(711), pick = (a) => a[Math.floor(rand() * a.length)];
  const person = (at, y, rot, o = {}) => L.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: pick(CL), cloth2: pick(CL), skin: 'skin_medium', hat: 'turban', hatMat: 'cloth_white', hair: 'short', beard: rand() < 0.6, feet: 'bare', ...o });
  const wm = (at, y, rot, o = {}) => person(at, y, rot, { hat: 'veil', hatMat: pick(['cloth_white', 'cloth_indigo', 'cloth_black']), beard: false, hair: 'long', ...o });
  const lay = LODGES.map((l) => ({ ...l, ...openLayout({ rect: l.rect, y: HARAM.top, y1: HARAM.top }) }));
  lay.forEach((h, i) => {
    const { F, court: [cx0, cz0, cx1, cz1], room: [rx0, rz0, rx1, rz1], store: [sx0, sz0, sx1, sz1], door: [dx, dz], use } = h, rm = (rx0 + rx1) / 2;
    const sd = (k) => i * 10 + k;
    L.push({ t: 'pot', kind: 'zir', at: [dx + 1.1, cz1 - 0.45], y: F, seed: sd(1) });
    if (use === 'oil') {
      for (let k = 0; k < 5; k++) L.push({ t: 'pot', kind: 'pithos', at: [rx0 + 1.1 + k * 1.15, rz0 + 0.75], y: F, seed: sd(2 + k) });
      for (let k = 0; k < 6; k++) L.push({ t: 'pot', kind: 'amphora', at: [sx1 - 0.35, sz1 - 0.5 - k * 0.5], y: F, seed: sd(8 + k) });
      L.push({ t: 'pot', kind: 'pithos', at: [sx0 + 0.6, sz1 - 0.7], y: F, seed: sd(14) }); L.push({ t: 'pot', kind: 'pithos', at: [sx0 + 0.6, sz1 - 1.7], y: F, seed: sd(15) });
      L.push({ t: 'goods_mat', at: [rm + 1.0, rz1 - 1.4], y: F, rot: 0, goods: ['baskets'], seed: sd(16) });
      person([rm + 1.0, rz1 - 1.4], F, Math.PI, { pose: 'sit_ground', cloth: 'cloth_brown' });          // the clerk with his tally
      person([cx0 + 2.0, cz0 + 2.5], F, 1.2, { carry: 'pot', cloth: 'cloth_ochre' });
      L.push({ t: 'pot', kind: 'pithos', at: [dx - 2.6, dz + 1.0], y: F, seed: sd(17) }); L.push({ t: 'pot', kind: 'pithos', at: [dx + 2.6, dz + 1.0], y: F, seed: sd(18) }); L.push({ t: 'sacks', n: 3, at: [dx + 3.6, dz + 1.2], y: F, rot: 0.3, seed: sd(19) });
    } else if (use === 'wick') {
      for (let k = 0; k < 4; k++) L.push({ t: 'basket', n: 2, at: [rx0 + 1.2 + k * 1.3, rz0 + 0.8], y: F, seed: sd(2 + k) });
      L.push({ t: 'sacks', n: 4, at: [(sx0 + sx1) / 2, sz0 + 2.4], y: F, rot: Math.PI / 2, seed: sd(8) });
      L.push({ t: 'goods_mat', at: [rm, rz0 + 2.0], y: F, rot: 0, goods: ['bolts'], seed: sd(9) });
      person([rm - 0.4, rz0 + 2.3], F + 0.02, Math.PI, { pose: 'sit_ground', cloth: 'cloth_grey', hat: 'cap', hatMat: 'cloth_white' });          // twisting wicks of flax
      wm([rm + 1.2, rz0 + 2.0], F + 0.02, Math.PI, { pose: 'sit_ground' });
      L.push({ t: 'basket', n: 3, at: [dx - 2.4, dz + 1.0], y: F, seed: sd(10) });
      L.push({ t: 'stool', at: [dx + 2.4, dz + 1.0], y: F, rot: 0.4, seed: sd(11) });
    } else if (use === 'glass') {
      L.push({ t: 'pot', kind: 'dark_pot', at: [cx1 - 1.9, cz1 - 0.45], y: F, seed: sd(2) }); L.push({ t: 'pot', kind: 'dark_pot', at: [cx1 - 2.4, cz1 - 0.5], y: F, seed: sd(3) }); L.push({ t: 'pot', kind: 'dark_pot', at: [cx1 - 2.9, cz1 - 0.5], y: F, seed: sd(4) });
      L.push({ t: 'firewood', at: [cx1 - 0.35, cz1 - 2.1], y: F, rot: Math.PI / 2, len: 1.6, seed: sd(5) });
      person([cx1 - 1.6, cz1 - 1.3], F, -2.5, { pose: 'squat', cloth: 'cloth_grey', hat: 'cap', hatMat: 'cloth_white' });          // the glassblower at his furnace
      for (let k = 0; k < 3; k++) L.push({ t: 'pot', kind: pick(['glazed_jar', 'water_pot', 'blue_jar']), at: [rx0 + 1.0 + k * 1.2, rz0 + 0.7], y: F, seed: sd(6 + k) });
      L.push({ t: 'sacks', n: 3, at: [(sx0 + sx1) / 2, sz0 + 2.6], y: F, rot: Math.PI / 2, seed: sd(9) });     // sand and ash
      person([rm + 1.4, rz0 + 1.2], F + 0.02, Math.PI, { pose: 'sit_ground', cloth: 'cloth_ochre', hat: 'cap', hatMat: 'cloth_white' });
      L.push({ t: 'goods_mat', at: [dx - 2.6, dz + 1.2], y: F, rot: 0, goods: ['pottery'], seed: sd(10) });
    } else if (use === 'perfume') {
      for (let k = 0; k < 4; k++) L.push({ t: 'pot', kind: pick(['blue_jar', 'glazed_jar', 'water_pot']), at: [rx0 + 1.0 + k * 1.1, rz0 + 0.75], y: F, seed: sd(2 + k) });
      L.push({ t: 'sacks', n: 2, at: [(sx0 + sx1) / 2, sz0 + 2.6], y: F, rot: Math.PI / 2, seed: sd(8) });
      L.push({ t: 'goods_mat', at: [rm + 0.2, rz1 - 1.6], y: F, rot: 0, goods: ['spice'], seed: sd(9) });
      person([rm + 0.2, rz1 - 1.6], F, Math.PI, { pose: 'sit_ground', cloth: 'cloth_white' });          // the attendant who prepares the incense
      person([cx0 + 2.2, cz0 + 2.6], F, 0.5, { cloth: 'cloth_white', hatMat: 'cloth_white' });
      L.push({ t: 'lantern', at: [dx + 2.8, dz + 0.8], y: F, seed: sd(10) });
    } else if (use === 'gate') {
      L.push({ t: 'stool', at: [rm - 1.2, rz1 - 1.5], y: F, rot: 0.3, seed: sd(2) }); L.push({ t: 'stool', at: [rm + 1.4, rz1 - 1.4], y: F, rot: -0.3, seed: sd(3) });
      L.push({ t: 'goods_mat', at: [rm, rz0 + 1.8], y: F, rot: 0, goods: ['bread'], seed: sd(4) });
      person([rm - 1.2, rz1 - 1.5], F + 0.4, Math.PI, { pose: 'sit', cloth: 'cloth_brown' });
      person([dx - 1.6, dz + 1.2], F, Math.PI, { pose: 'staff', cloth: 'cloth_brown', cloth2: 'cloth_white' });
      person([dx + 1.6, dz + 1.3], F, Math.PI, { pose: 'staff', cloth: 'cloth_indigo', cloth2: 'cloth_white' });
      L.push({ t: 'bench', at: [dx + 4.4, dz + 0.9], y: F, rot: 0, len: 2.0, seed: sd(5) });
    } else {
      L.push({ t: 'pot', kind: 'water_pot', at: [dx + 1.7, cz1 - 0.4], y: F, seed: sd(2) });
      L.push({ t: 'pot', kind: 'pithos', at: [sx0 + 0.55, sz1 - 0.6], y: F, seed: sd(3) });
      for (let k = 0; k < 4; k++) L.push({ t: 'pot', kind: 'amphora', at: [sx1 - 0.3, sz1 - 0.5 - k * 0.48], y: F, seed: sd(5 + k) });
      L.push({ t: 'sacks', n: 4, at: [(sx0 + sx1) / 2, sz0 + 2.6], y: F, rot: Math.PI / 2, seed: sd(9) });
      L.push({ t: 'pot', kind: 'dark_pot', at: [cx1 - 1.9, cz1 - 0.45], y: F, seed: sd(12) }); L.push({ t: 'firewood', at: [cx1 - 0.35, cz1 - 2.1], y: F, rot: Math.PI / 2, len: 1.2, seed: sd(13) });
      wm([cx1 - 1.4, cz1 - 1.0], F, -2.4, { pose: 'squat' });
      person([rm + 1.1, rz1 + 1.3], F, Math.PI * 0.95, { pose: 'talk' });
      person([rm + 1.2, rz0 + 0.6], F + 0.16, Math.PI, { pose: 'sit_ground', hat: 'veil', hatMat: 'cloth_white' });
      if (i % 2) person([(cx0 + cx1) / 2 - 0.6, (cz0 + cz1) / 2 + 0.3], F, rand() * 6, { child: true });
    }
  });
  return L;
}

/** The lodges' awnings, shelves and censers (islamic style elements, in the Haram's plan). */
export function lodgeFront() {
  const E = [], AW = ['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_white', 'cloth_green'];
  LODGES.forEach((l, i) => {
    const { F, room: [rx0, rz0, rx1, rz1], door: [dx, dz], use } = { ...l, ...openLayout({ rect: l.rect, y: HARAM.top, y1: HARAM.top }) };
    if (use === 'oil' || use === 'glass' || use === 'perfume' || use === 'wick') {
      E.push({ t: 'block', rect: [dx - 1.7, dz + 0.02, dx + 1.7, dz + 1.9], y0: F + 2.55, y1: F + 2.6, mat: AW[i % AW.length], collide: false });      // an awning of cloth over the door
      for (const s of [-1, 1]) E.push({ t: 'block', rect: [dx + s * 1.6 - 0.04, dz + 1.8, dx + s * 1.6 + 0.04, dz + 1.88], y0: F, y1: F + 2.57, mat: 'timber', collide: false });
    }
    if (use === 'glass') {                                              // lamps of glass cooling on a board along the main room's wall, the rows of bowls and bottles
      E.push({ t: 'block', rect: [rx0 + 0.5, rz1 - 0.55, rx1 - 0.5, rz1 - 0.15], y0: F + 0.5, y1: F + 0.55, mat: 'timber', collide: false });
      for (let k = 0; k < 8; k++) E.push({ t: 'block', rect: [rx0 + 0.8 + k * 0.55, rz1 - 0.5, rx0 + 1.05 + k * 0.55, rz1 - 0.25], y0: F + 0.55, y1: F + 0.55 + 0.14 + (k % 3) * 0.05, mat: 'glass_lamp', collide: false });
    }
    if (use === 'perfume') { E.push({ t: 'censer', at: [dx - 2.2, dz + 1.0], y: F }); E.push({ t: 'censer', at: [dx + 2.4, dz + 1.1], y: F }); }
    if (use === 'gate') for (const s of [-1, 1]) E.push({ t: 'block', rect: [dx + s * 1.9 - 0.06, dz + 0.0, dx + s * 1.9 + 0.06, dz + 0.9], y0: F, y1: F + 0.45, mat: 'limestone', collide: false });
  });
  return E;
}
