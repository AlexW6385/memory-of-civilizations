// Hanyang in the 1880s (docs/settlements/joseon-seoul.md §5, §12): the hanok quarters round the
// palace; Jongno with its licensed shops (sijeon) and the bell pavilion; the street life of the
// avenue and Jongno — men in white coats and black horsehair hats, women under the green cloak
// (jangot), porters with their A-frames (jige), oxen loaded with brushwood; and the court in session (§11): the officials standing in their ranks at the rank stones of the throne court — the
// civil officials on the east, the military on the west, the first four ranks in the red court robe
// (jobok) with the gilt coronet, the lower ranks in the black robe (dallyeong) with the black hat —
// and the guards at Gwanghwamun and Geunjeongmun with their spears, in black felt hats.
import { RADIUS, lots, SHOPS, BELL, JONGNO, AVENUE } from './layout.js';
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
function jongno() {
  const L = [];
  for (const [x0, z0, x1, z1] of SHOPS) {
    let x = x0, k = 0;
    while (x < x1 - 8) { const xe = Math.min(x1, x + 20.8); L.push({ t: 'sijeon', rect: [x, z0, xe, z1], front: 'n', seed: 1880 + 7 * k++ + Math.round(x) }); x = xe + 3.2; }
  }
  L.push({ t: 'bell_pavilion', rect: BELL });
  return { ...base('joseon-seoul-jongno', L), feature: false };
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
  for (const [x0, z0, x1] of SHOPS) for (let x = x0 + 1.3; x < x1 - 1; x += 2.6) {
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
  plans.push(court(), jongno(), ...street());
  return plans;
}
