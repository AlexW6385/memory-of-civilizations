// Round the hall (docs/settlements/thebes.md §2, §6–§8): the enclosure wall of Karnak and its gateway, the avenue of ram sphinxes
// from the quay, the forecourt, the sanctuary and the festival hall, the sacred lake and its palms, the storerooms; the Nile quay with
// its boats and the market; the town of mudbrick houses and the workshop street; the priests, scribes and workers.

import { RADIUS, RIVER, QUAY, QUAY_STAIRS, ENCL, ENCL_TH, LAKE, LAKE_Y, LAKE_BED, SANCT, FESTIVAL, MAGAZINES, AVENUE, MARKET, TEMPLE_GATE, PYLON2, lots, sphinxes } from './layout.js';
import { boatFloat } from '../../objects/index.js';
import { propPlans } from './props.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
const base = (id, elements, o = {}) => ({ id, style: 'newkingdom', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-200, 0], facing: 'e' }, ...o });
const face = (from, to) => Math.atan2(-(to[0] - from[0]), -(to[1] - from[1]));
const pick = (rand, a) => a[Math.floor(rand() * a.length) % a.length];

/** The people: priests in the hall and the courts, scribes at the gateway, porters and boatmen on the quay, the artisans at their trades. */
function people() {
  const rand = rng(1251), L = [];
  const fig = (at, rot, o) => L.push({ t: 'figure', at, y: 0, rot, seed: Math.floor(rand() * 1e9), dress: 'shendyt', top: 'bare', cloth: 'cloth_white', skin: 'skin_medium', hat: 'none', hair: 'short', hairMat: 'hair_dark', feet: 'bare', carry: 'none', pose: 'stand', ...o });
  // the priests: shaven, in white, leopard-skin sashes for the sem-priest; some with the censer or the staff, in the hall and between the pylons
  const priest = (at, rot, o = {}) => fig(at, rot, { dress: 'shendyt', hair: 'shaven', over: 'sash', ...o });
  for (const [x, z, r, o] of [[-92, 1.8, 0, { pose: 'staff', carry: 'staff', len: 1.7 }], [-84, -1.6, Math.PI, { pose: 'talk' }], [-84, -0.2, 0, { pose: 'talk' }], [-72, 2.0, 1.2, {}], [-66, -1.8, 2.6, { pose: 'staff', carry: 'staff', len: 1.7 }], [-55, 1.4, Math.PI, { pose: 'talk' }], [-55, 2.9, Math.PI * 1.5, { pose: 'talk' }], [-108, 3, 0, {}], [-100, -3, -Math.PI / 2, {}], [-24, 0.5, 0, { pose: 'staff', carry: 'staff', len: 1.7 }], [-9, 3, Math.PI, {}], [30, -2, 1.7, {}]]) priest([x, z], r, o);
  // the king's officials before the second pylon; the scribes squatting with the palette at the gateway and in the market
  for (const [x, z, r] of [[-140, -4, 0.3], [-136, 4.2, 2.9]]) fig([x, z], r, { dress: 'wrap', over: 'sash', hair: 'long', pose: 'staff', carry: 'staff', len: 1.7 });
  for (const [x, z] of [[-160, -12], [-158, 11], [-226, 23.2], [-212, 50.5], [-160, 28]]) fig([x, z], rand() * 6.28, { dress: 'shendyt', pose: 'squat', hair: 'short' });
  // the quay: the porters with sacks and jars, the stevedores, the overseer, the women at the water's edge
  for (let k = 0; k < 9; k++) { const z = -100 + rand() * 230, x = QUAY.x + 2 + rand() * 3, r = rand() * 6.28; fig([x, z], r, { carry: pick(rand, ['sack', 'pot', 'basket', 'sack']), cloth: pick(rand, ['cloth_white', 'cloth_ochre', 'linen']) }); }
  for (const z of [-96, -30, 12, 62, 100]) { fig([QUAY.x + 1.2, z], Math.PI / 2, { pose: 'staff', carry: 'staff', over: 'sash', len: 1.7 }); fig([QUAY.x + 1.6, z + 1.1], Math.PI * 0.6, { pose: 'talk' }); }
  for (const z of [-60, 36, 112]) for (const dz of [0, 0.9]) fig([QUAY.x - 5.1 + 0, z + dz], -Math.PI / 2, { dress: 'sheath', hair: 'long', pose: 'kneel', h: 1.52 });
  // the market: sellers sitting behind their stalls, facing the buyers
  for (const [z, dz, rot] of [[26.5, -0.9, Math.PI], [33.5, 0.9, 0], [39.5, -0.9, Math.PI], [46, 0.9, 0]]) for (let x = MARKET[0] + 3; x < MARKET[2] - 2; x += 8) if (rand() < 0.8) fig([x + 0.4, z + dz], rot, { dress: rand() < 0.5 ? 'sheath' : 'shendyt', hair: rand() < 0.5 ? 'long' : 'short', pose: 'squat' });
  // the workshop street: each trade's worker at the bench, wheel or loom
  for (const l of lots()) if (l.trade) {
    const [x0, z0, x1, z1] = l.rect, n = l.front === 'n', zz = (d) => (n ? z0 + d : z1 - d), xx = (u) => x0 + u, rot = n ? 0 : Math.PI;
    if (l.trade === 'potter') fig([xx(1.35), zz(2.2)], n ? Math.PI : 0, { pose: 'kneel' });
    else if (l.trade === 'weaver') fig([xx(2.7), zz(3.4)], rot, { dress: 'sheath', hair: 'long', pose: 'kneel', h: 1.52 });
    else if (l.trade === 'carpenter') fig([xx(2.2), zz(3.4)], rot, { pose: 'kneel' });
    else if (l.trade === 'mason') fig([xx(2.8), zz(1.5)], n ? Math.PI : 0, { pose: 'kneel' });
    else if (l.trade === 'baker') fig([xx(2.3), zz(3.4)], rot, { dress: 'sheath', hair: 'long', pose: 'kneel', h: 1.52 });
    else if (l.trade === 'smith') fig([xx(3.2), zz(2.6)], rot, { pose: 'kneel' });
    else if (l.trade === 'leather') fig([xx(2.2), zz(3.4)], rot, { pose: 'stand' });
  }
  return L;
}

/** The boats: papyrus skiffs and cargo barges moored along the quay or at their landings. */
function boats() {
  const rand = rng(1252), L = [], W = RIVER.level;
  const bf = boatFloat('barge'), rf = boatFloat('reed');
  for (const [z, len] of [[-104, 12], [-48, 11], [26, 12], [100, 11], [128, 12]]) L.push({ t: 'boat', kind: 'barge', len, at: [QUAY.x - 4.2, z], y: W + bf, rot: 0, seed: Math.round(z * 3) });
  for (const [x, z] of [[-262, -80], [-261, -26], [-263, 52], [-262, 84], [-264, 114]]) L.push({ t: 'boat', kind: 'reed', len: 6.2 + rand() * 1.2, at: [x, z], y: W + rf, rot: 0.15 * (rand() - 0.5), seed: Math.round(x + z) });
  return L;
}
/** The market on the quay (§6.3): the stalls in two double rows. */
function market() {
  const rand = rng(1253), L = [], GOODS = [['bread', 'baskets'], ['fish', 'greens'], ['pottery', 'pottery'], ['bolts', 'heap'], ['melons', 'greens'], ['heap', 'baskets']];
  for (const [z, rot] of [[26.5, 0], [33.5, Math.PI], [39.5, 0], [46, Math.PI]]) for (let x = MARKET[0] + 3; x < MARKET[2] - 2; x += 4) {
    L.push({ t: 'stall', at: [x, z], y: 0, rot, seed: Math.floor(rand() * 1e9), awning: pick(rand, ['cloth_white', 'cloth_white', 'cloth_ochre', 'cloth_indigo', 'reed_mat']), stripe: null, goods: pick(rand, GOODS), w: 2.6, d: 1.3 });
  }
  return L;
}
let CACHE = null;
export async function town() {
  if (CACHE) return CACHE;
  const plans = [], [ex0, ez0, ex1, ez1] = ENCL;
  // the enclosure: the gate in the west wall is the propylon's, the postern gates north and south, the east gate
  plans.push(base('thebes-enclosure', [{ t: 'nk_enclosure', rect: ENCL, th: ENCL_TH, h: 12, gaps: [{ side: 'w', c: 0, w: 28 }, { side: 'n', c: 20, w: 7 }, { side: 's', c: 20, w: 7 }, { side: 'e', c: 0, w: 7 }] }]));
  // the gateway (a small pylon with flagstaffs): its own frame, the axis along −z through the wall
  plans.push({ ...base('thebes-gateway', [{ t: 'nk_pylon', z0: -ENCL_TH, z1: 0, half: 14, h: 15, g: TEMPLE_GATE.w / 2, gateH: 9, flags: true, poleH: 20, y0: 0 }]), origin: [ex0, 0], yaw: 90, bounds: [-16, -10, 16, 6], entrance: { at: [0, 4], facing: 'n' } });
  // the avenue of sphinxes: the paved way and the rams, heads toward the way
  plans.push(base('thebes-avenue', [{ t: 'floor', rect: [AVENUE.x0 - 4, -8.4, AVENUE.x1 + 1, 8.4], y: 0.02, mat: 'sandstone_floor', th: 0.4 }, ...sphinxes().map((s) => ({ t: 'nk_ram', at: [s.x, s.z], y: 0.02, yaw: s.side > 0 ? Math.PI : 0 }))]));
  // the forecourt before the second pylon: paved, the side colonnades
  {
    const E = [{ t: 'floor', rect: [ex0 + ENCL_TH, -56, PYLON2.x0, 56], y: 0.02, mat: 'sandstone_floor', th: 0.4 }];
    for (let x = ex0 + ENCL_TH + 8; x < PYLON2.x0 - 4; x += 6.2) for (const s of [-1, 1]) E.push({ t: 'nk_column', at: [x, s * 47], y: 0.02, h: 9.5, d: 1.5, cap: 'bud', scenes: 1, seed: 11 + (Math.round(x) % 4) });
    plans.push(base('thebes-forecourt', E));
  }
  plans.push(base('thebes-east', [{ t: 'nk_sanctuary', rect: SANCT, h: 9 }, { t: 'nk_festival', rect: FESTIVAL, h: 9.6 }, { t: 'floor', rect: [35, -26, 36, 26], y: 0.02, th: 0.4 }]));
  plans.push(base('thebes-lake', [{ t: 'nk_lake', rect: LAKE, y: LAKE_Y, bed: LAKE_BED, stairs: [[(LAKE[1] + LAKE[3]) / 2, 6]] }]));
  plans.push(base('thebes-magazines', [{ t: 'nk_magazines', rect: MAGAZINES, seed: 5 }]));
  plans.push(base('thebes-quay', [{ t: 'nk_quay', x: QUAY.x + 1, z0: QUAY.z0, z1: QUAY.z1, top: QUAY.top, stairs: QUAY_STAIRS }]));
  plans.push({ ...base('thebes-market', market()), style: 'life' });
  plans.push({ ...base('thebes-boats', boats()), style: 'life' });
  plans.push({ ...base('thebes-people', people()), style: 'life' });
  // the town
  const LOTS = lots(), K = { row: 'nk_row_house', court: 'nk_court_house', villa: 'nk_villa', granary: 'nk_granary', garden: 'nk_garden', workshop: 'nk_workshop' };
  for (let i = 0; i < LOTS.length; i += 70) plans.push(base(`thebes-town-${i / 70}`, LOTS.slice(i, i + 70).map((l) => ({ t: K[l.kind], rect: l.rect, front: l.front, seed: l.seed, open: l.open, trade: l.trade, lod: l.lod, shop: l.shop }))));
  for (const p of propPlans()) plans.push(base(p.id, [{ t: 'nk_props', items: p.items }]));
  void ez0; void ez1; void ex1;
  return (CACHE = plans);
}
