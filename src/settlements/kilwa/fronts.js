// Kilwa about 1330 — the life at the doors (docs/settlements/kilwa.md §18): men sitting on the baraza benches in the
// morning and the evening, women with jars at the doors, children, a goat tied at a post, hens in the alley, firewood
// by the hearths, sacks and baskets before the shops; the pounding of grain. One life-style plan; positions come from the
// houses' own facts (houseFacts: where the door is, which side the front faces), never hard-coded.
import { lots, height, inRect, STREETS } from './layout.js';
import { houseFacts } from '../../styles/swahili/house.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const faceTo = (from, to) => Math.atan2(-(to[0] - from[0]), -(to[1] - from[1]));
let CACHE = null;
export function fronts() {
  if (CACHE) return CACHE;
  const L = [], rand = rng(1801), pick = (a) => a[Math.floor(rand() * a.length)];
  const fig = (at, y, face, o = {}) => L.push({ t: 'figure', at, y, rot: faceTo(at, face), seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: pick(['cloth_white', 'cloth_white', 'cloth_indigo', 'cloth_ochre']), cloth2: 'cloth_white', skin: pick(['skin_dark', 'skin_dark', 'skin_medium']), hat: 'cap', hatMat: 'cloth_white', hair: 'short', hairMat: 'hair_dark', beard: rand() < 0.4, feet: 'bare', over: pick(['sash', 'none']), carry: 'none', pose: 'stand', ...o });
  const woman = (at, y, face, o = {}) => fig(at, y, face, { dress: 'wrap', top: undefined, hat: 'veil', over: 'shawl', hair: 'bun', beard: false, cloth: pick(['cloth_indigo', 'cloth_red', 'cloth_ochre', 'cloth_green', 'cloth_maroon']), cloth2: 'cloth_white', h: 0.93, ...o });
  for (const l of lots()) {
    if (l.dh > 140) continue;
    const f = houseFacts({ ...l }), [x0, , x1] = l.rect, out = f.out, zf = f.front, y = l.y + 0.05, d = f.doorX, near = l.dh < 100;
    const yl = (z) => height(d, z);
    const alleyZ = zf + out * 1.5;
    // the baraza benches (house.js: 1.5 m long either side of the door, if they fit): a man or two sitting
    const benches = [-1, 1].map((s) => { const a = s < 0 ? d - 2.25 : d + 0.75, b = a + 1.5; return a > x0 + 0.1 && b < x1 - 0.1 ? (a + b) / 2 : null; }).filter((v) => v !== null);
    const r = rand();
    if (near && benches.length && r < 0.42) {
      const bx = pick(benches), z = zf + out * 0.22, hour = rand() < 0.5;
      fig([bx, z], y, [bx, z + out * 5], { pose: 'sit', over: 'none', hat: pick(['cap', 'cap', 'turban']) });
      if (rand() < 0.5) fig([bx + 0.62, z], y, [bx + 0.3, z + out * 5], { pose: hour ? 'sit' : 'sit', over: 'none' });
    } else if (near && r < 0.6) woman([d + (rand() < 0.5 ? -1 : 1) * 1.2, alleyZ], yl(alleyZ), [d, zf], { carry: pick(['pot', 'none', 'basket']), pose: 'stand' });
    else if (near && r < 0.7) {
      // a woman on a low stool pounding or sorting grain, a child by her
      const x = d + (rand() < 0.5 ? -1 : 1) * 1.4;
      L.push({ t: 'stool', at: [x, alleyZ + out * 0.3], y: yl(alleyZ), rot: 0, seed: l.seed });
      woman([x, alleyZ + out * 0.3], yl(alleyZ), [x, alleyZ + out * 5], { pose: 'sit_low' });
      fig([x + 0.7, alleyZ + out * 0.3], yl(alleyZ), [x, alleyZ + out * 0.3], { pose: 'stand', dress: 'wrap', top: 'bare', hat: 'none', over: 'none', h: 0.62, cloth: 'cloth_white' });
    }
    // animals and things in the alley, against the wall
    const r2 = rand();
    if (near && r2 < 0.16) L.push({ t: 'animal', kind: 'goat', at: [d + pick([-2.6, 2.6]), zf + out * 0.9], y: yl(zf + out * 0.9), rot: rand() * 6.28, seed: l.seed + 4 });
    else if (near && r2 < 0.3) L.push({ t: 'chickens', n: 3, at: [d + pick([-2.2, 2.2]), zf + out * 1.1], y: yl(zf + out * 1.1), seed: l.seed + 5 });
    else if (r2 < 0.38 && f.trade === 'cook') L.push({ t: 'firewood', at: [d + pick([-2.4, 2.4]), zf + out * 0.45], y: yl(zf + out * 0.45), rot: out > 0 ? 0 : Math.PI, len: 1.4, seed: l.seed });
    if (f.duka && near) {
      L.push({ t: 'sacks', n: 3, at: [d + pick([-2.6, 2.6]), zf + out * 0.5], y: yl(zf + out * 0.5), rot: 0.3, seed: l.seed + 6 });
      fig([d + 1.1, zf + out * 1.2], yl(zf + out * 1.2), [d, zf], { pose: 'talk', carry: 'none' });
    }
  }
  void inRect; void STREETS;
  return (CACHE = L);
}
