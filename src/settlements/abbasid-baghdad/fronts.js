// Abbasid Baghdad — the fronts of the houses at eye level, the street furniture of the lanes and the esplanade (docs/settlements/abbasid-baghdad.md §12):
// by the door of each house a water jar, a stack of palm-rib fuel, a pile of sacks, a mat of goods, hens, a stool with a man sitting; an oil
// lamp on its post; on the flat roofs washing on poles; at the esplanade's roads the shade stalls of the water-sellers. Placed from the lots'
// own door (the same rule as the house style: the door's offset from the seed), so nothing floats and nothing stands in a doorway.
import { rng } from '../../styles/abbasid/kit.js';
import { C, RC, lots, AVENUES, ROADS_IN, ESPLANADE, inRect } from './layout.js';
import { houseToWorld } from './town.js';

const YAW = { s: 0, n: Math.PI, e: Math.PI / 2, w: -Math.PI / 2 };
const CL = ['cloth_white', 'cloth_ochre', 'cloth_brown', 'cloth_indigo', 'cloth_green', 'cloth_grey', 'cloth_maroon'];

/** A lot's door in local frame: offset along the front, depth to the front wall, width. */
export function doorOf(l) {
  const turned = l.face === 's' || l.face === 'n', w = turned ? l.rect[2] - l.rect[0] : l.rect[3] - l.rect[1], d = turned ? l.rect[3] - l.rect[1] : l.rect[2] - l.rect[0];
  const r = rng(l.seed); r();
  return { ox: (r() < 0.5 ? -1 : 1) * Math.min(w / 4, 3.2), w, d, hw: w / 2, hd: d / 2 };
}

export function frontElements() {
  const E = [], P = [], rand = (() => { let s = 4242; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); })();
  const pick = (a) => a[Math.floor(rand() * a.length)];
  for (const l of lots()) {
    if (l.plot < 0) continue;
    const { ox, w, hw, hd } = doorOf(l), rot = YAW[l.face], st = l.storeys ?? 1, H = st * 3.5 + 0.2;
    const at = (x, z) => houseToWorld(l, x, hd + z), seed = l.seed;
    const side = rand() < 0.5 ? -1 : 1, free = (x) => Math.abs(x) < hw - 0.7;
    // beside the door: a water jar or two, a stack of fuel, sacks
    const xj = ox + side * 1.6;
    if (free(xj) && rand() < 0.75) E.push({ t: 'pot', kind: pick(['zir', 'water_pot', 'pithos', 'vat']), n: 1 + Math.floor(rand() * 2), at: at(xj, 0.5), y: 0, seed: seed + 1 });
    const xf = ox - side * 2.6;
    if (free(xf) && rand() < 0.5) E.push({ t: 'firewood', at: at(xf, 0.35), y: 0, rot: rot + Math.PI / 2, len: 1.5, seed });
    else if (free(xf) && rand() < 0.5) E.push({ t: 'sacks', at: at(xf, 0.4), y: 0, rot, n: 2 + Math.floor(rand() * 3), seed });
    // an oil lamp on a post beside the door of one house in three, a mat of goods or hens before others
    if (rand() < 0.33 && free(ox - side * 1.4)) E.push({ t: 'lantern', kind: 'oil', h: 2.2, at: at(ox - side * 1.4, 0.05), y: 0, rot, seed });
    const q = rand();
    if (q < 0.18 && free(ox + side * 3)) E.push({ t: 'chickens', kind: pick(['hen', 'hen', 'duck', 'pigeon']), n: 4, at: at(ox + side * 3, 1.3), y: 0, seed });
    else if (q < 0.34 && free(ox + side * 3.2)) E.push({ t: 'goods_mat', at: at(ox + side * 3.2, 0.8), y: 0, rot, goods: ['heap', 'basket'], seed });
    else if (q < 0.44 && free(ox + side * 2.8)) { const [x, z] = at(ox + side * 2.8, 0.7); E.push({ t: 'stool', at: [x, z], y: 0, rot: rot + Math.PI }); P.push({ at: [x, z], y: 0, rot: rot, pose: 'sit_low' }); }
    else if (q < 0.5) { const [x, z] = at(ox + side * 2.4, 1.2); E.push({ t: 'animal', kind: 'donkey', at: [x, z], y: 0, rot: rot + 1.57, seed, gear: true }); }
    // washing on a line between props on the flat roof of the front range, a few houses in the ring and in Karkh
    if (w >= 10 && rand() < 0.3) E.push({ t: 'laundry', at: houseToWorld(l, (rand() - 0.5) * 3, hd - Math.min(3.6, 2 * hd * 0.25) / 2), y: H + 0.12, rot, len: 4, seed });
  }
  return { E, P };
}

/** Street furniture of the esplanade and the avenues: shade stalls of the water-sellers at the roads, benches of brick at the palace's wall, wells. */
export function esplanadeElements() {
  const E = [], rand = (() => { let s = 99; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); })();
  for (const [dx, dz, rot] of [[-12, 70, 0], [12, 70, 0], [-12, -75, Math.PI], [12, -75, Math.PI], [95, 12, -Math.PI / 2], [-95, 12, Math.PI / 2], [95, -12, -Math.PI / 2], [-95, -12, Math.PI / 2], [140, 12, -Math.PI / 2], [-140, 12, Math.PI / 2]])
    E.push({ t: 'stall', at: [C[0] + dx, C[1] + dz], y: 0, rot, w: 2.6, d: 1.4, awning: pick2(rand), goods: ['zir', 'water_pot'], seed: Math.round(dx * 3 + dz) });
  // benches under the palace wall and along the roads, brick-built resting places
  for (const sx of [-1, 1]) for (const z of [48, 70, 100]) E.push({ t: 'bench', at: [C[0] + sx * 10.5, C[1] + z], y: 0, rot: sx * Math.PI / 2, len: 2.0, mat: 'brick_buff' });
  for (const s of AVENUES) { void s; }
  void RC; void ROADS_IN; void inRect;
  return E;
}
const pick2 = (r) => ['cloth_white', 'cloth_ochre', 'cloth_indigo', 'cloth_green'][Math.floor(r() * 4)];

/** The service houses of the south gate road: goods and figures before each front (clear of the awning or arcade), by kind; and who is inside. Local frame of each building: the street at +z. */
export function esplanadeShopFronts() {
  const E = [], P = [], I = [], rand = (() => { let s = 5151; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); })();
  ESPLANADE.forEach((b, i) => {
    const l = { rect: b.rect, face: b.face }, turned = b.face === 's' || b.face === 'n', w = turned ? b.rect[2] - b.rect[0] : b.rect[3] - b.rect[1], d = turned ? b.rect[3] - b.rect[1] : b.rect[2] - b.rect[0], hw = w / 2, hd = d / 2;
    const rot = YAW[b.face], deep = b.front === 'awning' ? 2.4 : b.front === 'portico' ? 2.9 : 0.8, at = (x, z) => houseToWorld(l, x, hd + z), seed = 700 + i;
    const side = i % 2 ? 1 : -1, xs = side * Math.min(hw - 1.2, 3.8);
    switch (b.kind) {
      case 'bakery': E.push({ t: 'sacks', at: at(xs, deep + 0.4), y: 0, rot, n: 4, seed }, { t: 'firewood', at: at(-xs, deep + 0.5), y: 0, rot: rot + Math.PI / 2, len: 1.8, seed }); break;
      case 'guard': { E.push({ t: 'stool', at: at(2.2, 1.2), y: 0, rot: rot + Math.PI }); const [x, z] = at(2.2, 1.2); P.push({ at: [x, z], y: 0, rot: rot + Math.PI, pose: 'sit_low' }); break; }
      case 'diwan': E.push({ t: 'goods_mat', at: at(xs, 1.4), y: 0, rot, goods: ['basket'], seed }); break;
      case 'perfumer': E.push({ t: 'pot', kind: 'water_pot', n: 2, at: at(xs, deep + 0.5), y: 0, seed }, { t: 'lantern', kind: 'oil', h: 2.2, at: at(-xs, deep + 0.4), y: 0, rot, seed }); break;
      case 'kitchen': E.push({ t: 'firewood', at: at(xs, 0.8), y: 0, rot: rot + Math.PI / 2, len: 1.6, seed }, { t: 'pot', kind: 'zir', n: 2, at: at(-xs, 0.7), y: 0, seed }, { t: 'chickens', kind: 'hen', n: 4, at: at(0, 3.0), y: 0, seed }); break;
      case 'store': E.push({ t: 'pot', kind: 'zir', n: 2, at: at(xs, 0.9), y: 0, seed }, { t: 'pot', kind: 'water_pot', n: 2, at: at(-xs, 1.0), y: 0, seed: seed + 1 }, { t: 'sacks', at: at(xs + side * 1.4, 1.6), y: 0, rot, n: 3, seed }); break;
      case 'coppersmith': E.push({ t: 'pot', kind: 'vat', n: 2, at: at(xs, 1.4), y: 0, seed }, { t: 'goods_mat', at: at(-xs, 1.6), y: 0, rot, goods: ['heap'], seed }); break;
      case 'stable': E.push({ t: 'animal', kind: 'donkey', at: at(xs, deep + 0.6), y: 0, rot: rot + 1.57, seed, gear: true }, { t: 'firewood', at: at(-xs, deep + 0.6), y: 0, rot, len: 1.4, seed }); break;
      case 'treasury': E.push({ t: 'lantern', kind: 'oil', h: 2.2, at: at(2.0, 0.4), y: 0, rot, seed }); break;
      case 'reception': { const [x, z] = at(2.6, 1.0); E.push({ t: 'stool', at: [x, z], y: 0, rot: rot + Math.PI }); P.push({ at: [x, z], y: 0, rot: rot + Math.PI, pose: 'sit_low' }); E.push({ t: 'goods_mat', at: at(-2.6, 1.4), y: 0, rot, goods: ['basket'], seed }); break; }
      case 'potter': E.push({ t: 'pot', kind: 'pithos', n: 2, at: at(xs, deep + 0.5), y: 0, seed }, { t: 'pot', kind: 'water_pot', n: 2, at: at(-xs, deep + 0.5), y: 0, seed: seed + 3 }); break;
      case 'bedroom': E.push({ t: 'animal', kind: 'donkey', at: at(xs, 2.0), y: 0, rot: rot + 1.0, seed, gear: true }, { t: 'sacks', at: at(-xs, 0.6), y: 0, rot, n: 2, seed }); break;
      default: break;
    }
    // who is inside: the keeper facing the street a little inside the door (the furniture stands at the back and the sides)
    const inside = (x, z, o = {}) => I.push({ at: houseToWorld(l, x, hd - z), rot: rot + Math.PI, ...o });
    const k = b.kind;
    if (k === 'reception') { I.push({ at: houseToWorld(l, -0.9, -0.3), rot: rot + Math.PI / 2 * (b.face === 'e' ? 1 : -1) + Math.PI, pose: 'cross', talk: true }, { at: houseToWorld(l, 0.9, 0.1), rot: rot, pose: 'cross', talk: true }); }
    else if (k === 'guard') inside(1.6, 2.4, { guard: true });
    else if (k !== 'store' && k !== 'bedroom') inside(1.7 * (i % 2 ? -1 : 1), 2.3, { pose: k === 'diwan' || k === 'perfumer' ? 'cross' : 'stand' });
    void rand;
  });
  return { E, P, I };
}
