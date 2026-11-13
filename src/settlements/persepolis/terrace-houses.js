// Persepolis about 480 BC — the lodgings and workshops on the terrace south of the court (docs/settlements/persepolis.md §17):
// the arrival is on the terrace, where no ordinary houses stand, so the quarters that served the court are built and furnished
// here, in the mudbrick house of Parsa raised on the terrace's floor: the guards' lodging, the scribes', the royal bakers',
// the carpenters' and smiths' sheds for the works still going on, the cupbearers' wine store, the grain store, a potter's. Each is
// walked into (door, lit room, hearth, mats, chests, stores or the trade's goods), with its people.
import { TERRACE } from './layout.js';
import { houseDoor, houseRoom } from '../../styles/achaemenid/houses-data.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const T = TERRACE.h;
const KINDS = [['court', null], ['shop', 'baker'], ['home', null], ['shop', 'carpenter'], ['court', null], ['shop', 'smith'], ['home', null], ['shop', 'wine'], ['shop', 'grain'], ['shop', 'potter']];
let LOTS = null;
/** Lots in the terrace's frame (the plan stands at the terrace's height), fronts to the north, to the court. */
export function terraceLots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(481);
  let x = -147, i = 0;
  while (x < -36 && i < KINDS.length) {
    const [kind, trade] = KINDS[i], w = (kind === 'shop' ? 9.8 : 10.6) + rand() * 2.4, d = 11 + rand() * 2.2;
    LOTS.push({ rect: [x, -13, x + w, -13 + d], seed: Math.floor(rand() * 1e6), front: 'n', kind, trade, enter: true });
    x += w + 1.3; i++;
  }
  return LOTS;
}
export function terraceHouses() {
  const part = terraceLots();
  return {
    id: 'persepolis-terrace-houses', style: 'achaemenid', origin: [0, 0], base: T, yaw: 0, feature: true, entrance: { at: [-122, -60], facing: 'e' }, bounds: [-150, -16, -48, 4],
    elements: part.map((l) => ({ t: 'persian_house', ...l })),
    rooms: part.map((l, k) => { const r = houseRoom(l); return r && { id: `terrace-house-${k}`, rect: r, y: 0.08, kind: 'hall' }; }).filter(Boolean),
  };
}
/** The people at the doors and inside, and the goods before them (life style, at the terrace's height). */
export function terraceLife() {
  const rand = rng(4817), F = [], pick = (a) => a[Math.floor(rand() * a.length)], seed = () => Math.floor(rand() * 1e9);
  const CLOTH = ['cloth_white', 'cloth_ochre', 'cloth_brown', 'cloth_indigo', 'cloth_red', 'cloth_green', 'linen'];
  const person = (at, rot, o = {}) => {
    const w = o.woman, dress = w ? 'robe' : pick(['robe', 'robe', 'trousers']);
    F.push({ t: 'figure', at, y: T + (o.dy ?? 0), rot, seed: seed(), dress, cloth: o.cloth ?? pick(CLOTH), cloth2: pick(CLOTH), over: dress === 'robe' ? 'sash' : 'belt', hat: w ? 'veil' : o.hat ?? pick(['cap', 'cap', 'none']), hatMat: 'cloth_white', hair: w ? undefined : 'short', beard: !w, skin: 'skin_medium', feet: 'shod', h: w ? 1.52 + rand() * 0.1 : 1.64 + rand() * 0.14, ...(o.el ?? {}) });
  };
  const rotOut = (o) => Math.atan2(-o[0], -o[1]);
  terraceLots().forEach((l, k) => {
    const d = houseDoor(l), o = d.out, s = [-o[1], o[0]], [px, pz] = d.p, rot = rotOut(o);
    const at = (u, v) => [px + s[0] * u + o[0] * v, pz + s[1] * u + o[1] * v];
    const side = k % 2 ? 1 : -1;
    F.push({ t: 'pot', kind: k % 3 === 0 ? 'pithos' : 'water_pot', n: 2, at: at(side * (d.w / 2 + 0.7), 0.5), y: T, rot: 0, seed: seed() });
    if (l.kind === 'shop') {
      const g = { baker: ['firewood', 0], carpenter: ['firewood', 0], smith: ['crates', 2], wine: ['barrel', 3], grain: ['sacks', 3], potter: ['pot', 3] }[l.trade];
      const e = { t: g[0], n: g[1], at: at(-side * 2.6, 2.4), y: T, rot: rot + Math.PI / 2, seed: seed() };
      if (g[0] === 'pot') e.kind = 'pithos'; if (g[0] === 'firewood') e.len = 1.6;
      F.push(e);
      person(at(-0.2 + d.w * 0.25, -1.1), rot, { dy: 0.08, el: { pose: 'talk' } });         // the master inside, at his counter
      if (k % 2 === 0) person(at(-0.5, 2.2), rot + Math.PI, { woman: k % 4 === 0, el: { pose: 'stand' } });
    } else {
      F.push({ t: 'stool', at: at(-side * (d.w / 2 + 1.2), 1.0), y: T, rot, seed: seed() });
      person(at(-side * (d.w / 2 + 1.2), 1.0), rot + (rand() - 0.5) * 0.8, { woman: l.kind === 'home', el: { pose: 'sit_low' } });
      person(at(-1.0, -2.0 - rand() * 1.5), rand() * 6, { dy: 0.08, woman: l.kind === 'home', el: { pose: 'cross' } });
    }
  });
  return { id: 'persepolis-terrace-houses-life', style: 'life', origin: [0, 0], base: 0, yaw: 0, feature: true, entrance: { at: [-122, -60], facing: 'e' }, bounds: [-150, -20, -48, 6], rooms: [], elements: F, center: [-100, -6], near: 260 };
}
