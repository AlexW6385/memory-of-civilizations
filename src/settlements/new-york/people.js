// The people of the shop rooms (docs/settlements/new-york.md §16): the keeper behind the counter, a customer or two across it
// (seated on the stools at the fountain and the lunch counter), the barbers at their chairs, the cashier of the automat — built into
// the near form of the lot, with the room, so that they show only where the room does (a life element's figures reach 170 m).
// Pure functions of the lot (its seed): no counters, no Math.random. Grid frame.
import { frontPoint } from './layout.js';
import { narrowRect } from './upper-plan.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const DR = ['cloth_black', 'cloth_grey', 'cloth_black', 'cloth_grey'];
const WHITE = ['bakery', 'deli', 'drug', 'lunch', 'butcher', 'automat'], APRON = ['tailor', 'shoe', 'deli', 'bakery', 'lunch', 'butcher', 'grocer', 'hardware'];

/** The figures (parameters of the life style's `figure`) of a lot with a shop room, in the grid's frame. */
export function shopPeople(el) {
  const rect = el.up ? narrowRect(el) : el.rect, f = el.front, k = el.room.kind, rand = rng((el.seed >>> 0) ^ 0x1934), out = [];
  const L = rect[2] - rect[0], Dr = el.room.depth, mid = L / 2, dC = Dr - 3.1, F = (el.y ?? 0) + 0.06;
  const pick = (a) => a[Math.floor(rand() * a.length)];
  const P = (u, d, o) => { const [x, z] = frontPoint(rect, f, u, -d); return { t: 'figure', at: [x, z], y: F + (o.pose === 'sit' ? 0.16 : 0), seed: Math.floor(rand() * 1e9), skin: pick(['skin_light', 'skin_light', 'skin_medium']), ...o, rot: (o.rot ?? 0) + (f === 's' ? Math.PI : 0) }; };
  const keeper = { dress: 'trousers', cloth: WHITE.includes(k) ? 'cloth_white' : pick(DR), cloth2: 'cloth_white', hat: k === 'bakery' || k === 'lunch' || k === 'butcher' ? 'cap' : 'none', hatMat: 'cloth_white', over: APRON.includes(k) ? 'apron' : 'none' };
  const cust = (u, d, o = {}) => P(u, d, { dress: rand() < 0.35 ? 'robe' : 'trousers', cloth: pick(DR), cloth2: 'cloth_white', hat: 'brim', hatMat: pick(['cloth_black', 'cloth_grey']), rot: Math.PI, ...o });
  if (k === 'barber') {
    const n = Math.max(2, Math.min(3, Math.floor((L - 0.6 - 0.8 - 2) / 1.8)));
    for (let i = 0; i < n; i++) { const u = 0.7 + 1.2 + i * ((L - 1.4 - 2.4) / Math.max(1, n - 1)); out.push(P(u + 0.7, Dr - 1.7, { ...keeper, cloth: 'cloth_white', over: 'apron', hat: 'none', rot: Math.PI / 2 })); if (i < 2) out.push(P(u, Dr - 1.7, { dress: 'trousers', cloth: pick(DR), cloth2: 'cloth_white', hat: 'none', pose: 'sit', rot: Math.PI })); }
  } else if (k === 'automat') {
    out.push(P(el.room.door === 1 ? 1.4 : L - 1.4, 1.05, { ...keeper, cloth: 'cloth_grey', rot: Math.PI }));
    for (let u = 1.5; u < L - 2.5; u += 3.8) out.push(cust(u + 0.5, 2.0, { pose: 'sit', rot: rand() * 6 }));
  } else {
    out.push(P(mid + (rand() - 0.5) * 2, k === 'fabric' || k === 'hardware' ? dC + 1.0 : Dr - 1.5, keeper));
    if (k === 'drug' || k === 'lunch') { out.push(cust(mid - 1.2, dC - 0.55, { pose: 'sit' })); out.push(cust(mid + 0.6, dC - 0.55, { pose: 'sit', dress: 'trousers' })); }
    else out.push(cust(mid + (rand() - 0.5) * 3, dC - 0.9));
    if (rand() < 0.6) out.push(cust(mid + (rand() < 0.5 ? -2.2 : 2.2), 2.4 + rand() * 1.5, { rot: rand() * 6 }));
  }
  return out;
}
