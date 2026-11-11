// Hanyang in the 1880s (docs/settlements/joseon-seoul.md §5, §12): the hanok quarters round the
// palace; Jongno with its licensed shops (sijeon) and the bell pavilion; the street life of the
// avenue and Jongno — men in white coats and black horsehair hats, women under the green cloak
// (jangot), porters with their A-frames (jige), oxen loaded with brushwood; and the court in session (§11): the officials standing in their ranks at the rank stones of the throne court — the
// civil officials on the east, the military on the west, the first four ranks in the red court robe
// (jobok) with the gilt coronet, the lower ranks in the black robe (dallyeong) with the black hat —
// and the guards at Gwanghwamun and Geunjeongmun with their spears, in black felt hats.
import { RADIUS, lots, SHOPS, BELL, JONGNO, AVENUE, YANGBAN } from './layout.js';
const base = (id, elements) => ({ id, style: 'joseon', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 70], facing: 'n' } });
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

function court() {
  const rand = rng(1430), L = [];
  const skin = () => (rand() < 0.6 ? 'skin_light' : 'skin_medium');
  // the rank stones stand at x = ±7.5, z = 59 + 2.25 i (plan.js), the first rank nearest the hall;
  // the officials of each rank in a short row behind (outside) their stone, facing the throne
  for (let i = 0; i < 12; i++) for (const sx of [-1, 1]) {
    const high = i < 4, z = 59 + i * 2.25, n = high ? 2 : 3;
    for (let k = 0; k < n; k++) {
      if (!high && rand() < 0.2) continue;
      L.push({ t: 'figure', at: [sx * (8.6 + k * 1.05), z + (rand() - 0.5) * 0.15], y: 0.04, rot: (rand() - 0.5) * 0.08, seed: Math.floor(rand() * 1e9),
        dress: 'robe', cloth: high ? 'cloth_red' : 'cloth_black', cloth2: high ? 'cloth_indigo' : 'cloth_black', skin: skin(), hat: 'cap', hatMat: high ? 'gilt_bronze' : 'lacquer_black',
        over: 'belt', arms: 'clasp', beard: rand() < 0.6, h: 1.62 + rand() * 0.1 });
    }
  }
  // the guards: two by two at the gates, spears grounded
  const guard = (x, z, rot) => L.push({ t: 'figure', at: [x, z], y: 0.04, rot, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: 'cloth_indigo', cloth2: 'cloth_red', skin: skin(),
    hat: 'brim', hatMat: 'cloth_black', pose: 'staff', carry: 'staff', len: 2.6, staffMat: 'timber', over: 'belt', h: 1.66 + rand() * 0.08 });
  for (const sx of [-1, 1]) {
    guard(sx * 4.2, 97.5, Math.PI); guard(sx * 6.0, 97.5, Math.PI); // before Geunjeongmun, facing south
    guard(sx * 10.5, 246, Math.PI); guard(sx * 5.2, 246, Math.PI);   // before Gwanghwamun, facing the avenue
  }
  return { ...base('joseon-seoul-court', L), style: 'life', center: [0, 150], near: 300 };
}

// Jongno's shop rows, cut into blocks by the lanes running south, and the bell pavilion at the corner
const blocksOf = () => {
  const out = [];
  for (const [x0, z0, x1, z1] of SHOPS) {
    let x = x0, k = 0;
    while (x < x1 - 8) { const xe = Math.min(x1, x + 20.8), nb = Math.max(1, Math.round((xe - x) / 2.6)); out.push({ rect: [x, z0, xe, z1], k: k++, nb, bw: (xe - x) / nb }); x = xe + 3.2; }
  }
  return out;
};
function jongno() {
  const L = [];
  for (const b of blocksOf()) L.push({ t: 'sijeon', rect: b.rect, front: 'n', seed: 1880 + 7 * b.k + Math.round(b.rect[0]) });
  L.push({ t: 'bell_pavilion', rect: BELL });
  return { ...base('joseon-seoul-jongno', L), feature: false };
}

// what stands and hangs before the shops: cloth banners on their brackets at the party walls, paper lanterns over the maru,
// the pots and baskets of the trade on the paving, a dog asleep in the sun
function shopfronts() {
  const rand = rng(1894), L = [];
  for (const b of blocksOf()) {
    const [x0, z0] = b.rect;
    for (let k = 0; k <= b.nb; k++) if (k % 3 === 0 && k < b.nb) L.push({ t: 'shop_sign', at: [x0 + k * b.bw + 0.12, z0 - 0.1], y: 0.42, rot: Math.PI, h: 2.0, len: 0.95, out: 0.85, cloth: ['cloth_indigo', 'cloth_white', 'cloth_red', 'cloth_ochre'][Math.floor(rand() * 4)], letters: 2 + Math.floor(rand() * 2) });
    for (let k = 0; k < b.nb; k++) {
      const xa = x0 + k * b.bw + 0.12;
      if (rand() < 0.5) L.push({ t: 'hang_lantern', at: [xa + 0.35, z0 - 0.3], y: 0.42 + 2.08, rot: 0, kind: rand() < 0.6 ? 'paper' : 'white', drop: 0.15, seed: 1 });
      const r = rand(), px = xa + 0.4 + rand() * 0.9, pz = z0 - 1.25 - rand() * 0.4;
      if (r < 0.28) L.push({ t: 'pot', kind: rand() < 0.5 ? 'dark_pot' : 'vat', at: [px, pz], y: 0.03, rot: rand() * 6.28, n: 1 + Math.floor(rand() * 3), seed: Math.floor(rand() * 1e9) });
      else if (r < 0.5) L.push({ t: 'basket', at: [px, pz], y: 0.03, rot: rand() * 6.28, n: 1 + Math.floor(rand() * 3), seed: Math.floor(rand() * 1e9) });
      else if (r < 0.62) L.push({ t: 'sacks', at: [px, pz], y: 0.03, rot: Math.PI, n: 2 + Math.floor(rand() * 4), seed: Math.floor(rand() * 1e9) });
      else if (r < 0.7) L.push({ t: 'stool', at: [px, pz], y: 0.03, rot: rand() * 6.28 });
    }
  }
  for (const x of [-112, -48, 60, 118]) L.push({ t: 'animal', kind: 'dog', at: [x, JONGNO[1] + 1.6], y: 0.03, rot: rand() * 6.28, seed: Math.floor(rand() * 1e9), graze: false, mat: rand() < 0.5 ? 'hide_tan' : 'hide_white' });
  return { ...base('joseon-seoul-shopfronts', L), style: 'life', feature: false, center: [0, 357], near: 260 };
}

// the lanes of the hanok quarters, dressed at eye level: against each lot's outer wall the firewood and jars,
// baskets, sacks and drying trays of the household, a bench by the gate, paper lanterns hung at the gate's eave,
// a hen or a dog about; in tiles of 100 m, drawn within 230 m
function lanedress() {
  const tiles = new Map(), rand = rng(1888 ^ 0x5a5a);
  const put = (e, x, z) => { const k = Math.floor(x / 100) + ',' + Math.floor(z / 100); if (!tiles.has(k)) tiles.set(k, []); tiles.get(k).push(e); };
  const sd = () => Math.floor(rand() * 1e9);
  for (const l of lots()) {
    const [x0, z0, x1, z1] = l.rect, xc = (x0 + x1) / 2;
    if (Math.hypot(xc, (z0 + z1) / 2) > 330 && rand() < 0.4) continue;
    // the gate: a lantern at each side of its little roof, a bench or a pair of jars beside it
    const lant = rand() < 0.7 ? 'white' : 'paper';
    put({ t: 'hang_lantern', at: [xc + 1.35, z1 + 0.62], y: 2.38, rot: 0, kind: lant, drop: 0.12, seed: 1 }, xc, z1);
    const side = rand() < 0.5 ? -1 : 1, gx = xc + side * (2.6 + rand() * 2.5), gz = z1 + 0.75;
    const r = rand();
    if (r < 0.25) { put({ t: 'bench', at: [gx, gz + 0.1], y: 0.03, rot: 0, len: 1.6 }, gx, gz); if (rand() < 0.6) put({ t: 'figure', at: [gx + 0.3, gz + 0.1], y: 0.04, rot: Math.PI, seed: sd(), dress: 'robe', cloth: rand() < 0.5 ? 'cloth_white' : 'linen', skin: 'skin_medium', hat: rand() < 0.6 ? 'brim' : 'none', hatMat: 'lacquer_black', pose: 'sit', beard: true, h: 1.6, hair: 'topknot' }, gx, gz); }
    else if (r < 0.55) put({ t: 'pot', kind: 'dark_pot', at: [gx, gz + 0.1], y: 0.03, rot: rand() * 6.28, n: 2 + Math.floor(rand() * 3), seed: sd() }, gx, gz);
    else if (r < 0.75) put({ t: 'firewood', at: [gx, gz + 0.15], y: 0.03, rot: Math.PI / 2, len: 1.5, seed: sd() }, gx, gz);
    else put({ t: 'drying_tray', at: [gx, gz + 0.45], y: 0.03, rot: rand() * 6.28, seed: sd() }, gx, gz);
    // the other walls: one or two things each, against the wall's outer face
    for (const [a, b, nx, nz] of [[[x0, z0], [x1, z0], 0, -1], [[x0, z0], [x0, z1], -1, 0], [[x1, z0], [x1, z1], 1, 0], [[x0, z1], [x1, z1], 0, 1]]) {
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]), n = a[1] === z1 && b[1] === z1 ? 1 : 1 + (rand() < 0.5 ? 1 : 0);
      for (let q = 0; q < n; q++) {
        if (rand() < 0.35) continue;
        const t = 2 + rand() * (len - 4);
        if (nz === 1 && Math.abs(a[0] + t - xc) < 3.5) continue;
        const px = a[0] + (b[0] - a[0]) * t / len + nx * 0.75, pz = a[1] + (b[1] - a[1]) * t / len + nz * 0.75, along = nz !== 0 ? 0 : Math.PI / 2, k = rand();
        if (k < 0.28) put({ t: 'firewood', at: [px, pz], y: 0.03, rot: nz !== 0 ? Math.PI / 2 : 0, len: 1.25 + rand() * 0.5, seed: sd() }, px, pz);
        else if (k < 0.5) put({ t: 'pot', kind: rand() < 0.4 ? 'vat' : 'dark_pot', at: [px, pz], y: 0.03, rot: rand() * 6.28, n: 1 + Math.floor(rand() * 3), seed: sd() }, px, pz);
        else if (k < 0.62) put({ t: 'basket', at: [px, pz], y: 0.03, rot: rand() * 6.28, n: 1 + Math.floor(rand() * 2), seed: sd() }, px, pz);
        else if (k < 0.72) put({ t: 'sacks', at: [px, pz], y: 0.03, rot: along, n: 2 + Math.floor(rand() * 3), seed: sd() }, px, pz);
        else if (k < 0.8 && l.thatch) put({ t: 'haystack', at: [px + nx * 0.6, pz + nz * 0.6], y: 0.03, rot: rand() * 6.28, seed: sd() }, px, pz);
        else if (k < 0.88) put({ t: 'chickens', at: [px + nx * 0.5, pz + nz * 0.5], y: 0.03, rot: rand() * 6.28, n: 3, kind: 'hen', seed: sd() }, px, pz);
        else if (k < 0.94) put({ t: 'animal', kind: 'dog', at: [px + nx * 0.5, pz + nz * 0.5], y: 0.03, rot: rand() * 6.28, seed: sd(), graze: false, mat: rand() < 0.5 ? 'hide_tan' : 'hide_brown' }, px, pz);
        else put({ t: 'bench', at: [px + nx * 0.2, pz + nz * 0.2], y: 0.03, rot: along, len: 1.4 }, px, pz);
      }
    }
  }
  return [...tiles].map(([k, list]) => { const [i, j] = k.split(',').map(Number); return { ...base(`joseon-seoul-lanedress-${k}`, list), style: 'life', feature: false, center: [i * 100 + 50, j * 100 + 50], near: 230 }; });
}

// the people of the streets: men in the white coat (durumagi) and the black gat, women under the green
// jangot, children; merchants sitting on their shop floors; porters with A-frames walking or resting;
// oxen under brushwood led by their farmers
function street() {
  const rand = rng(1888), P = [], J = [];
  const skin = () => (rand() < 0.6 ? 'skin_light' : 'skin_medium');
  const man = (x, z, rot, extra = {}) => P.push({ t: 'figure', at: [x, z], y: 0.03, rot, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: rand() < 0.8 ? 'cloth_white' : 'linen', cloth2: 'cloth_white',
    skin: skin(), hat: 'brim', hatMat: 'lacquer_black', over: 'none', beard: rand() < 0.5, h: 1.6 + rand() * 0.1, ...extra });
  const woman = (x, z, rot, extra = {}) => P.push({ t: 'figure', at: [x, z], y: 0.03, rot, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: rand() < 0.7 ? 'cloth_white' : 'cloth_indigo', cloth2: 'cloth_white',
    skin: 'skin_light', hat: 'veil', hatMat: 'cloth_green', over: 'none', beard: false, h: 1.5 + rand() * 0.06, ...extra });
  const porter = (x, z, rot, load, down = false) => {
    const seed = Math.floor(rand() * 1e9);
    if (down) {
      J.push({ t: 'jige', at: [x + Math.sin(rot) * 0.9, z + Math.cos(rot) * 0.9], y: 0.03, rot: rot + Math.PI, load, down: true, seed });
      P.push({ t: 'figure', at: [x, z], y: 0.03, rot, seed, dress: 'trousers', cloth: 'cloth_white', cloth2: 'linen', skin: 'skin_medium', hat: 'none', hair: 'topknot', pose: 'squat', carry: 'none', beard: rand() < 0.4, h: 1.62 });
    } else {
      P.push({ t: 'figure', at: [x, z], y: 0.03, rot, seed, dress: 'trousers', cloth: 'cloth_white', cloth2: 'linen', skin: 'skin_medium', hat: rand() < 0.5 ? 'none' : 'straw', hatMat: 'thatch', hair: 'topknot', carry: 'staff', pose: 'staff', len: 1.0, staffMat: 'timber', beard: rand() < 0.4, h: 1.62 });
      J.push({ t: 'jige', at: [x, z], y: 0.03, rot, load, seed });
    }
  };
  const ox = (x, z, rot) => {
    const seed = Math.floor(rand() * 1e9), r = rng(seed); r(); const size = 0.92 + r() * 0.16;
    P.push({ t: 'animal', kind: 'ox', at: [x, z], y: 0.03, rot, seed, graze: false, mat: 'hide_tan' });
    J.push({ t: 'ox_load', at: [x, z], y: 0.03, rot, h: 1.42 * size - 0.02, seed });
    // the farmer leading it by the nose rope, a step ahead and to the side
    man(x - Math.sin(rot) * 1.6 + Math.cos(rot) * 0.7, z - Math.cos(rot) * 1.6 - Math.sin(rot) * 0.7, rot, { hat: 'straw', hatMat: 'thatch', dress: 'trousers', cloth2: 'linen' });
  };
  // Jongno: merchants on their shop floors, buyers before them, people walking both ways
  const [jx0, jz0, jx1, jz1] = JONGNO;
  const shopx = [];
  for (const b of blocksOf()) for (let k = 0; k < b.nb; k++) shopx.push([b.rect[0] + k * b.bw + 0.12 + (b.bw - 0.24 - 0.95) / 2, b.rect[1], b.rect[0] + (k + 1) * b.bw - 0.12 - 0.5]);
  for (const [x, z0, xin] of shopx) {
    // the shopkeeper on his maru (seen over the goods), a customer or two before it, a boy by the bay's way in now and then
    if (rand() < 0.15) P.push({ t: 'figure', at: [xin, z0 + 2.2], y: 0.42, rot: Math.PI, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: 'cloth_white', skin: skin(), hat: 'brim', hatMat: 'lacquer_black', beard: rand() < 0.6, h: 1.62, pose: 'stand' });
    if (rand() < 0.45) P.push({ t: 'figure', at: [x, z0 + 0.75], y: 0.88, rot: 0, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: 'cloth_white', skin: skin(), hat: 'brim', hatMat: 'lacquer_black', pose: 'cross', beard: rand() < 0.6, h: 1.62 });
    if (rand() < 0.3) (rand() < 0.65 ? man : woman)(x + (rand() - 0.5), z0 - 1.1 - rand() * 0.5, Math.PI + (rand() - 0.5) * 0.6);
  }
  for (let k = 0; k < 46; k++) {
    const x = jx0 + 12 + rand() * (jx1 - jx0 - 24), z = jz0 + 1.5 + rand() * (jz1 - jz0 - 3), rot = rand() < 0.5 ? Math.PI / 2 : -Math.PI / 2;
    if (Math.abs(x) < 16) continue;
    const r = rand();
    if (r < 0.5) man(x, z, rot + (rand() - 0.5) * 0.4, rand() < 0.15 ? { pose: 'talk' } : {});
    else if (r < 0.72) woman(x, z, rot + (rand() - 0.5) * 0.4, rand() < 0.3 ? { carry: 'basket' } : {});
    else if (r < 0.84) P.push({ t: 'figure', at: [x, z], y: 0.03, rot, seed: Math.floor(rand() * 1e9), child: true, dress: 'trousers', cloth: 'cloth_white', cloth2: 'cloth_white', skin: 'skin_light', hair: 'long', h: 1.1 + rand() * 0.2 });
    else porter(x, z, rot, ['brush', 'sack', 'jars', 'wood'][Math.floor(rand() * 4)]);
  }
  for (const x of [-120, -64, 52, 108]) porter(x, jz1 - 0.6, Math.PI, ['brush', 'wood', 'sack', 'jars'][Math.floor(rand() * 4)], true);
  for (const [x, z, rot] of [[-96, 355, -Math.PI / 2], [74, 358.5, Math.PI / 2], [128, 354.5, -Math.PI / 2]]) ox(x, z, rot);
  // the avenue of the ministries: officials' servants, porters, an ox, people coming and going
  const [ax0, az0, ax1, az1] = AVENUE;
  for (let k = 0; k < 22; k++) {
    const x = ax0 + 2 + rand() * (ax1 - ax0 - 4), z = az0 + 18 + rand() * (az1 - az0 - 24), rot = rand() < 0.5 ? 0 : Math.PI;
    const r = rand();
    if (r < 0.6) man(x, z, rot + (rand() - 0.5) * 0.5); else if (r < 0.75) woman(x, z, rot); else porter(x, z, rot, ['brush', 'wood', 'sack'][Math.floor(rand() * 3)]);
  }
  ox(7, 300, Math.PI);
  return [{ ...base('joseon-seoul-street', P), style: 'life', center: [0, 330], near: 260 }, { ...base('joseon-seoul-loads', J), feature: false, center: [0, 330], near: 260 }];
}

export async function town() {
  const all = lots(), plans = [];
  for (let i = 0; i < all.length; i += 80) plans.push(base(`joseon-seoul-hanok-${i / 80}`, all.slice(i, i + 80).map((l) => ({ t: 'hanok', ...l, simple: true }))));
  plans.push({ ...base('joseon-seoul-yangban', [{ t: 'yangban_house', rect: YANGBAN, seed: 1888 }]), feature: false });
  plans.push(court(), jongno(), shopfronts(), ...lanedress(), ...street());
  return plans;
}
