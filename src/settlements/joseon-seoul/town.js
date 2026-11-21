// Hanyang in the 1880s (docs/settlements/joseon-seoul.md §5, §12): the hanok quarters round the
// palace; Jongno with its licensed shops (sijeon) and the bell pavilion; the street life of the
// avenue and Jongno — men in white coats and black horsehair hats, women under the green cloak
// (jangot), porters with their A-frames (jige), oxen loaded with brushwood; and the court in session (§11): the officials standing in their ranks at the rank stones of the throne court — the
// civil officials on the east, the military on the west, the first four ranks in the red court robe
// (jobok) with the gilt coronet, the lower ranks in the black robe (dallyeong) with the black hat —
// and the guards at Gwanghwamun and Geunjeongmun with their spears, in black felt hats.
import { courtPlans } from './court.js';
import { officePlans } from './offices.js';
import { RADIUS, lots, SHOPS, BELL, JONGNO, AVENUE, YANGBAN } from './layout.js';
import { ground } from './ground.js';
import { homeLayout, classOf } from '../../styles/joseon/home.js';
import { blocksOf, shopsOf, enterable } from './openwalk.js';
import { lanternHalos } from './nightlight.js';
import { rangeFrame } from '../../styles/joseon/house.js';
const base = (id, elements) => ({ id, style: 'joseon', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 70], facing: 'n' } });
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

// Jongno's shop rows, cut into blocks by the lanes running south, and the bell pavilion at the corner (blocksOf: openwalk.js)
function jongno() {
  const L = [];
  for (const b of blocksOf()) L.push({ t: 'sijeon', rect: b.rect, front: 'n', seed: 1880 + 7 * b.k + Math.round(b.rect[0]), wide: b.wide });
  L.push({ t: 'bell_pavilion', rect: BELL });
  return { ...base('joseon-seoul-jongno', L), feature: false };
}

// what stands and hangs before the shops: cloth banners on their brackets at the party walls, paper lanterns over the maru,
// the pots and baskets of the trade on the paving, a dog asleep in the sun
function shopfronts() {
  const rand = rng(1894), L = [];
  for (const b of blocksOf()) {
    const [x0, z0] = b.rect;
    const wd = new Set(b.wide);
    for (let k = 0; k <= b.nb; k++) if (k % 3 === 0 && k < b.nb) (wd.has(k - 1) ? (() => {}) : (e) => L.push(e))({ t: 'shop_sign', at: [x0 + k * b.bw + 0.12, z0 - 0.1], y: 0.42, rot: Math.PI, h: 2.0, len: 0.95, out: 0.85, cloth: ['cloth_indigo', 'cloth_white', 'cloth_red', 'cloth_ochre'][Math.floor(rand() * 4)], letters: 2 + Math.floor(rand() * 2) });
    for (let k = 0; k < b.nb; k++) {
      const xa = x0 + k * b.bw + 0.12, wayK = wd.has(k - 1);      // (the second bay of a two-bay shop: its right end is the way in, kept clear)
      if (rand() < 0.5) L.push({ t: 'hang_lantern', at: [xa + 0.35, z0 - 0.3], y: 0.42 + 2.08, rot: 0, kind: rand() < 0.6 ? 'paper' : 'white', drop: 0.15, seed: 1 });
      const r = rand(), px = xa + 0.4 + rand() * 0.9 - (wayK ? 0.9 : 0), pz = z0 - 1.25 - rand() * 0.4;
      if (r < 0.28) L.push({ t: 'pot', kind: rand() < 0.5 ? 'dark_pot' : 'vat', at: [px, pz], y: 0.03, rot: rand() * 6.28, n: 1 + Math.floor(rand() * 3), seed: Math.floor(rand() * 1e9) });
      else if (r < 0.5) L.push({ t: 'basket', at: [px, pz], y: 0.03, rot: rand() * 6.28, n: 1 + Math.floor(rand() * 3), seed: Math.floor(rand() * 1e9) });
      else if (r < 0.62) L.push({ t: 'sacks', at: [px, pz], y: 0.03, rot: Math.PI, n: 2 + Math.floor(rand() * 4), seed: Math.floor(rand() * 1e9) });
      else if (r < 0.7) L.push({ t: 'stool', at: [px, pz], y: 0.03, rot: rand() * 6.28 });
    }
  }
  // the public wells of Jongno (stone curb, rope and bucket) on the street's north edge, clear of the way along it [inferred: Hanyang's streets had public wells]
  for (const x of [-84, 74]) L.push({ t: 'well', kind: 'open', mat: 'granite_korea', at: [x, JONGNO[1] + 1.4], y: 0.03 });
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
  // (every bay draws its dice as before, so the rest of the street keeps its people; those at a two-bay shop's second bay or its way in are dropped)
  const shopx = [];
  for (const b of blocksOf()) { const wd = new Set(b.wide); for (let k = 0; k < b.nb; k++) shopx.push([b.rect[0] + k * b.bw + 0.12 + (b.bw - 0.24 - 0.95) / 2, b.rect[1], b.rect[0] + (k + 1) * b.bw - 0.12 - 0.5, wd.has(k), wd.has(k - 1)]); }
  const lanes = blocksOf().flatMap((b) => shopsOf(b).filter((q) => q.open).map((q) => q.xin));
  for (const [x, z0, xin, opened, second] of shopx) {
    const hold = P.length;
    // the shopkeeper on his maru (seen over the goods), a customer or two before it, a boy by the bay's way in now and then
    if (rand() < 0.15) (opened ? (() => {}) : (e) => P.push(e))({ t: 'figure', at: [xin, z0 + 2.2], y: 0.42, rot: Math.PI, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: 'cloth_white', skin: skin(), hat: 'brim', hatMat: 'lacquer_black', beard: rand() < 0.6, h: 1.62, pose: 'stand' });
    if (rand() < 0.45) (opened ? (() => {}) : (e) => P.push(e))({ t: 'figure', at: [x, z0 + 0.75], y: 0.88, rot: 0, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: 'cloth_white', skin: skin(), hat: 'brim', hatMat: 'lacquer_black', pose: 'cross', beard: rand() < 0.6, h: 1.62 });
    if (rand() < 0.3) (rand() < 0.65 ? man : woman)(x + (rand() - 0.5), z0 - 1.1 - rand() * 0.5, Math.PI + (rand() - 0.5) * 0.6);
    if (second) P.length = hold;
  }
  for (let k = 0; k < 46; k++) {
    const x = jx0 + 12 + rand() * (jx1 - jx0 - 24), z = jz0 + 1.5 + rand() * (jz1 - jz0 - 3), rot = rand() < 0.5 ? Math.PI / 2 : -Math.PI / 2;
    if (Math.abs(x) < 16) continue;
    // (kept off the lanes of the shops that can be walked into: a figure there would stop the walker at the way in)
    const xx = lanes.some((q) => Math.abs(x - q) < 1.3) ? x + 2.6 : x;
    const r = rand();
    if (r < 0.5) man(xx, z, rot + (rand() - 0.5) * 0.4, rand() < 0.15 ? { pose: 'talk' } : {});
    else if (r < 0.72) woman(xx, z, rot + (rand() - 0.5) * 0.4, rand() < 0.3 ? { carry: 'basket' } : {});
    else if (r < 0.84) P.push({ t: 'figure', at: [xx, z], y: 0.03, rot, seed: Math.floor(rand() * 1e9), child: true, dress: 'trousers', cloth: 'cloth_white', cloth2: 'cloth_white', skin: 'skin_light', hair: 'long', h: 1.1 + rand() * 0.2 });
    else porter(xx, z, rot, ['brush', 'sack', 'jars', 'wood'][Math.floor(rand() * 4)]);
  }
  for (const x0 of [-120, -64, 52, 108]) { const x = lanes.some((q) => Math.abs(x0 - q) < 1.6) ? x0 + 3.2 : x0; porter(x, jz1 - 0.6, Math.PI, ['brush', 'wood', 'sack', 'jars'][Math.floor(rand() * 4)], true); }
  for (const [x, z, rot] of [[-96, 355, -Math.PI / 2], [74, 354.2, Math.PI / 2], [128, 354.5, -Math.PI / 2]]) ox(x, z, rot);
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

// the households: in some houses a woman at the kitchen's stove, an old man on his cushion in the men's room or the main room, a child in the yard
function homefolk() {
  const rand = rng(1888 ^ 0x1234), F = [], sd = () => Math.floor(rand() * 1e9);
  for (const l of lots()) {
    if (!enterable(l)) continue;
    const L = homeLayout({ ...l, cls: classOf(l) }), FL = 0.5;
    for (const r of L.ranges) {
      const f = rangeFrame(r), { P, spans } = f, s = r.face === 's', dir = (a, b) => (s ? [a, b] : r.face === 'e' ? [b, a] : [-b, a]), face = ([dx, dz]) => Math.atan2(-dx, -dz);
      const fig = (u, v, toward, extra = {}) => { const p = P(u, v); const q = r.face === 'w' ? [p[0], p[1]] : p; F.push({ t: 'figure', at: q, y: extra.y ?? FL + 0.04, rot: face(dir(...toward)), seed: sd(), dress: 'robe', cloth: 'cloth_white', cloth2: 'cloth_white', skin: rand() < 0.6 ? 'skin_light' : 'skin_medium', hat: 'none', hair: 'topknot', beard: false, h: 1.6, ...extra }); };
      for (const sp of spans) {
        const c = (sp.a0 + sp.a1) / 2;
        if (sp.kind === 'kitchen' && rand() < 0.55) fig(sp.a1 - 2.2 < sp.a0 + 0.4 ? sp.a0 + 0.5 : sp.a1 - 2.2, 1.25, [1, 0], { pose: 'squat', y: 0, hair: 'bun', cloth: 'cloth_green', skin: 'skin_light' });
        else if ((sp.kind === 'sarangbang' || (sp.kind === 'room' && r.role === 'main' && L.cls === 'poor')) && rand() < 0.5) fig(c, 1.15, [0, 1], { pose: 'cross', arms: 'cross', y: FL + 0.1, hat: rand() < 0.6 ? 'brim' : 'none', hatMat: 'lacquer_black', beard: true, h: 1.62 });
        else if (sp.kind === 'daecheong' && r.role === 'main' && rand() < 0.3) fig(c + 0.4, 1.6, [0, 1], { pose: 'cross', arms: 'cross', y: FL + 0.03, hair: 'bun', cloth: 'cloth_white', skin: 'skin_light', h: 1.5 });
      }
    }
    if (rand() < 0.3) { const [x0, z0, x1, z1] = l.rect; F.push({ t: 'figure', at: [(x0 + x1) / 2 + 2 + rand() * 3, z1 - 4.5 - rand() * 2], y: 0.03, rot: rand() * 6.28, seed: sd(), child: true, dress: 'trousers', cloth: 'cloth_white', cloth2: 'cloth_white', skin: 'skin_light', hair: 'long', h: 1.1 + rand() * 0.15 }); }
  }
  const tiles = new Map();
  for (const e of F) { const k = Math.floor(e.at[0] / 100) + ',' + Math.floor(e.at[1] / 100); if (!tiles.has(k)) tiles.set(k, []); tiles.get(k).push(e); }
  return [...tiles].map(([k, list]) => { const [i, j] = k.split(',').map(Number); return { ...base(`joseon-seoul-homefolk-${k}`, list), style: 'life', feature: false, center: [i * 100 + 50, j * 100 + 50], near: 200 }; });
}

// the light of the houses (nightlight.js `seoul_glow`): the halo of every house's lit windows, lanterns and kitchen fire, in plans of their own, tiles of 128 m,
// drawn within 190 m of the visitor (a plan's halo is one draw wherever its bounds meet the view: not in the houses' own plans, which span the town)
function glowPlans() {
  const tiles = new Map(), T = 128;
  for (const l of lots()) {
    const k = Math.floor((l.rect[0] + l.rect[2]) / 2 / T) + ',' + Math.floor((l.rect[1] + l.rect[3]) / 2 / T);
    if (!tiles.has(k)) tiles.set(k, []);
    // (the lot's rectangle goes under `box`: a `rect` would be read by the street-life pass (src/objects/life.js) as one more house)
    const { rect, ...rest } = l;
    tiles.get(k).push(enterable(l) ? { t: 'seoul_glow', of: 'hanok_home', box: rect, ...rest, cls: classOf(l) } : { t: 'seoul_glow', of: 'hanok', box: rect, ...rest, simple: true });
  }
  // the shops' lamps and the bell pavilion's windows (the jongno plan carries no halo: one draw more at the arrival)
  for (const e of [...blocksOf().map((b) => ({ t: 'seoul_glow', of: 'sijeon', box: b.rect, front: 'n', seed: 1880 + 7 * b.k + Math.round(b.rect[0]), wide: b.wide })), { t: 'seoul_glow', of: 'bell_pavilion', box: BELL }]) {
    const k = Math.floor((e.box[0] + e.box[2]) / 2 / T) + ',' + Math.floor((e.box[1] + e.box[3]) / 2 / T);
    if (!tiles.has(k)) tiles.set(k, []);
    tiles.get(k).push(e);
  }
  return [...tiles].map(([k, list]) => { const [i, j] = k.split(',').map(Number); return { ...base(`joseon-seoul-glow-${k}`, list), feature: false, center: [i * T + T / 2, j * T + T / 2], near: 190 }; });
}

// the keepers of the shops that can be walked into, built into plans of their own that are drawn only near the visitor (life figures reach 170 m):
// each sits cross-legged on his maru facing the street, an apprentice or a customer beside him in some shops [inferred: Jongno's shops were run from the maru]
function keeperPlans() {
  const tiles = new Map(), T = 128, rand = rng(1888 ^ 0x6b6b), sd = () => Math.floor(rand() * 1e9);
  const put = (e) => { const k = Math.floor(e.at[0] / T) + ',' + Math.floor(e.at[1] / T); if (!tiles.has(k)) tiles.set(k, []); tiles.get(k).push(e); };
  const sit = (x, z, extra = {}) => put({ t: 'figure', at: [x, z], y: 0.88, rot: 0, seed: sd(), dress: 'robe', cloth: rand() < 0.8 ? 'cloth_white' : 'linen', cloth2: 'cloth_white', skin: rand() < 0.6 ? 'skin_light' : 'skin_medium', hat: 'brim', hatMat: 'lacquer_black', pose: 'cross', beard: rand() < 0.6, h: 1.62, ...extra });
  for (const b of blocksOf()) for (const sh of shopsOf(b).filter((q) => q.open)) {
    const xm = sh.x1 - 1.7;
    sit(xm - 1.3, sh.z + 0.65);
    if (rand() < 0.5) sit(xm - 0.45, sh.z + 0.65, { hat: 'none', hair: 'topknot', beard: false, h: 1.45, arms: 'cross' });
  }
  return [...tiles].map(([k, list]) => { const [i, j] = k.split(',').map(Number); return { ...base(`joseon-seoul-keepers-${k}`, list), style: 'life', feature: false, center: [i * T + T / 2, j * T + T / 2], near: 90 }; });
}

export async function town() {
  const all = lots(), plans = [], shells = all.filter((l) => !enterable(l)), homes = all.filter(enterable);
  for (let i = 0; i < shells.length; i += 80) plans.push(base(`joseon-seoul-hanok-${i / 80}`, shells.slice(i, i + 80).map((l) => ({ t: 'hanok', ...l, simple: true }))));
  for (let i = 0; i < homes.length; i += 12) plans.push(base(`joseon-seoul-homes-${i / 12}`, homes.slice(i, i + 12).map((l) => ({ t: 'hanok_home', ...l, cls: classOf(l) }))));
  plans.push({ ...base('joseon-seoul-yangban', [{ t: 'yangban_house', rect: YANGBAN, seed: 1888 }]), feature: false });
  plans.push(...courtPlans(), ...officePlans(), jongno(), shopfronts(), ...lanedress(), ...street(), ...homefolk(), ...keeperPlans(), ...glowPlans());
  // the light of the lanterns the life plans hang (nightlight.js): gathered into the glow plans by place (a halo is one draw in each plan that has any),
  // so the lane and street plans carry none of their own
  const T = 128, glow = new Map(plans.filter((p) => /-glow-/.test(p.id)).map((p) => [p.id.split('-glow-')[1], p]));
  const into = new Map();
  for (const p of plans) {
    if (p.style !== 'life' || /office/.test(p.id)) continue;
    for (const h of lanternHalos(p.elements)) { const k = Math.floor(h.x / T) + ',' + Math.floor(h.z / T); if (!into.has(k)) into.set(k, []); into.get(k).push(h); }
  }
  for (const [k, list] of into) {
    let g = glow.get(k);
    if (!g) { const [i, j] = k.split(',').map(Number); g = { ...base(`joseon-seoul-glow-${k}`, []), feature: false, center: [i * T + T / 2, j * T + T / 2], near: 190 }; plans.push(g); }
    g.elements.push({ t: 'seoul_halo', list });
  }
  return plans;
}
