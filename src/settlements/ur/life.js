// The life of Ur's streets beyond what the generic pass puts down (docs/settlements/ur.md §5.2): a scribe
// with his tablets by the temenos's north gate and a man dictating to him; a train of donkeys with their
// packs and drivers coming down the north street to the market (the beasts of burden of Ur III: asses,
// not camels); a shepherd with sheep and goats; porters carrying jars up from the moored boats on the quay;
// a fisherman mending his net. Figures and beasts are a 'life' plan; the scribe's mat and tablets, the
// net and the stacked jars are the 'sumerian' style's (`scribe_kit`, `quay_goods`).
import { MARKET, HARBOUR } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const N = 0, S = Math.PI, E = -Math.PI / 2, W = Math.PI / 2;             // a figure's rot to face north, south, east, west

export function urLife() {
  const rand = rng(2051), figures = [], gear = [], seed = () => Math.floor(rand() * 1e9);
  const man = (at, y, rot, o = {}) => figures.push({ t: 'figure', at, y, rot, seed: seed(), dress: 'wrap', top: 'bare', cloth: ['cloth_white', 'linen', 'cloth_ochre'][Math.floor(rand() * 3)], over: 'belt', hair: 'shaven', beard: rand() < 0.4, skin: 'skin_medium', hat: 'none', feet: 'bare', ...o });
  // the scribe by the gate, cross-legged on his mat facing the man who dictates; a second client waits
  const [gx, gz] = [-15.5, -181.5];
  gear.push({ t: 'scribe_kit', at: [gx, gz], y: 0, rot: N });
  man([gx, gz], 0.03, N, { pose: 'cross', dress: 'robe', top: '', cloth: 'linen', over: 'shawl', cloth2: 'cloth_white', hair: 'shaven', beard: false, h: 1.66 });
  man([gx + 0.1, gz - 1.7], 0, S, { pose: 'talk', dress: 'robe', top: '', cloth: 'cloth_ochre', over: 'shawl', cloth2: 'cloth_brown', hair: 'long', beard: true, carry: 'staff', len: 1.5, staffMat: 'wood_dark' });
  man([gx - 1.3, gz - 2.6], 0, S + 0.4, { pose: 'stand', arms: 'clasp' });
  // the donkeys coming down the north street, loaded, with their drivers
  for (let k = 0; k < 4; k++) {
    const z = -262 + k * 3.1, x = -4.5 + (k % 2) * 0.6;
    figures.push({ t: 'animal', kind: 'donkey', at: [x, z], y: 0, rot: S + (rand() - 0.5) * 0.15, seed: seed(), gear: true });
  }
  man([-3.4, -250.6], 0, S, { carry: 'staff', len: 1.6, staffMat: 'wood_dark', pose: 'staff' });
  man([-5.6, -264.8], 0, S + 0.1, { carry: 'staff', len: 1.5, staffMat: 'wood_dark', pose: 'staff', over: 'shawl', top: '' });
  // a shepherd with a few sheep and goats at the square's west end, bound for the temple's pens
  const [sx, sz] = [MARKET[0] + 5, MARKET[3] - 6];
  man([sx + 2.2, sz + 0.4], 0, E, { carry: 'staff', len: 1.7, pose: 'staff', staffMat: 'wood_dark', over: 'shawl', top: '', cloth: 'cloth_brown' });
  for (let k = 0; k < 7; k++) figures.push({ t: 'animal', kind: k < 5 ? 'sheep' : 'goat', at: [sx - k * 0.9 + (rand() - 0.5) * 0.8, sz + (rand() - 0.5) * 2.6], y: 0, rot: E + (rand() - 0.5) * 0.8, seed: seed() });
  // the quay: porters carrying jars up from the boats, jars stacked, a fisherman mending his net
  const qx = HARBOUR.rect[2], bx = qx + 3.6;                         // the quay's middle (its top 0.6 m up), the ground behind it
  for (const [z, rot, carry] of [[-94, E, 'pot'], [-91.5, W, 'none'], [-58.5, E, 'pot'], [-10, E, 'basket'], [-6.5, W, 'pot']]) man([qx + (rand() - 0.5) * 0.8, z], 0.6, rot, { carry });
  gear.push({ t: 'quay_goods', at: [bx, -97], y: 0, rot: W, kind: 'jars' }, { t: 'quay_goods', at: [bx, -55], y: 0, rot: W, kind: 'reeds' }, { t: 'quay_goods', at: [bx + 0.4, 24], y: 0, rot: E, kind: 'net' });
  man([bx + 0.4, 25.7], 0, N, { pose: 'sit_ground' });
  // the market: sellers squatting behind their mats of goods — fish from the marshes, dates, onions and greens,
  // bread, pots, baskets — and a few stalls shaded by reed mats on poles, in two rows either side of the way to the gate
  const WARES = [['fish', 'heap'], ['heap', 'baskets'], ['greens', 'heap'], ['bread', 'baskets'], ['pottery', 'pottery'], ['baskets', 'fish'], ['heap', 'greens']];
  let w = 0;
  for (const z of [-189, -204]) for (const x of [-38, -32, -26, -19, 13, 19, 25, 31, 37]) {
    if (rand() < 0.15) continue;
    const g = WARES[w++ % WARES.length], south = z > -195, srot = south ? S : N, rot = south ? N : S, back = south ? 1.0 : -1.0;   // the stall's front and the seller face the aisle
    if ((w % 4) === 0) {
      figures.push({ t: 'stall', at: [x, z], y: 0, rot: srot, seed: seed(), awning: 'reed_mat', stripe: null, goods: g, w: 2.4, d: 1.2 });
      man([x + 0.3, z + back * 1.3], 0, rot, { pose: 'stand', arms: 'clasp' });
    } else {
      figures.push({ t: 'goods_mat', at: [x, z], y: 0, rot, seed: seed(), goods: g, mat: 'reed_mat' });
      man([x - 0.2, z + back * 0.95], 0, rot, rand() < 0.5 ? { pose: 'squat' } : { pose: 'sit_ground', dress: 'robe', top: '', cloth: 'cloth_white', over: 'shawl', cloth2: 'cloth_ochre', hair: 'bun', beard: false, h: 1.5 });
    }
    // a buyer at every other one
    if (rand() < 0.5) man([x + (rand() - 0.5), z - back * 1.6], 0, rot + S + (rand() - 0.5) * 0.5, { pose: rand() < 0.5 ? 'talk' : 'stand', carry: rand() < 0.3 ? 'basket' : 'none' });
  }
  // two women with jars on their heads crossing the square, children by the houses
  figures.push({ t: 'figure', at: [6, -196], y: 0, rot: E + 0.3, seed: seed(), dress: 'robe', cloth: 'cloth_white', cloth2: 'cloth_ochre', over: 'shawl', hair: 'bun', skin: 'skin_medium', feet: 'bare', carry: 'pot', h: 1.52 });
  figures.push({ t: 'figure', at: [7.1, -195.2], y: 0, rot: E + 0.2, seed: seed(), dress: 'robe', cloth: 'linen', cloth2: 'cloth_brown', over: 'shawl', hair: 'bun', skin: 'skin_medium', feet: 'bare', h: 1.5 });
  figures.push({ t: 'figure', at: [-20.5, -219.2], y: 0, rot: S, seed: seed(), child: true, dress: 'wrap', top: 'bare', cloth: 'linen', hair: 'shaven', feet: 'bare' });
  return { figures, gear };
}
