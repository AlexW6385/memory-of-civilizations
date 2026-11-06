// The riverside quarter (docs/settlements/song-hangzhou.md §5, §10): shophouses and tea houses of the
// Jiangnan type; and the day of the tide — the coloured stands of the great houses along the flood
// wall below the pagoda, the crowd on the wall looking out for the bore, tea tables on the road.
import { RADIUS, LEVEL, WALL, ROAD, PAGODA, CANAL, lots } from './layout.js';
const base = (id, elements, style = 'song') => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-110, 136], facing: 'n' } });
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const CLOTH = ['cloth_indigo', 'cloth_white', 'cloth_grey', 'cloth_brown', 'cloth_white', 'cloth_black', 'cloth_red', 'cloth_green'];
const faceTo = ([dx, dz]) => Math.atan2(-dx, -dz);

function tideDay() {
  const S = [], L = [], rand = rng(1165), pick = (a) => a[Math.floor(rand() * a.length)], yW = 1.0, zc = (WALL.z0 + WALL.z1) / 2;
  const person = (at, y, rot, extra = {}) => L.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: rand() < 0.75 ? 'robe' : 'trousers', cloth: pick(CLOTH), cloth2: pick(CLOTH), skin: 'skin_light', hat: pick(['none', 'cap', 'cap', 'brim', 'veil']), carry: 'none', ...extra });
  // the stands along the wall, either side of the pagoda's stair; people seated in them, the crowd at the wall's edge
  for (let x = -200; x < CANAL.x0 - 20; x += 7.5) {
    if (Math.abs(x - PAGODA.c[0]) < 9) continue;
    if (rand() < 0.55) {
      S.push({ t: 'view_tent', at: [x, zc - 0.6], y: yW, w: 5, d: 3.2, h: 2.4, cloth: pick(['cloth_red', 'cloth_green', 'cloth_ochre', 'cloth_indigo', 'cloth_red']), trim: pick(['cloth_white', 'cloth_ochre', 'cloth_red']), open: 's' });
      for (const dx of [-1.4, 0, 1.4]) if (rand() < 0.75) person([x + dx, zc - 1.0], yW, faceTo([0, 1]), { pose: 'sit', dress: 'robe' });
    }
    for (let k = 0; k < 3; k++) if (rand() < 0.7) person([x + (rand() - 0.5) * 6, WALL.z1 - 1.2 - rand() * 0.6], yW, faceTo([(rand() - 0.5) * 0.6, 1]), { pose: rand() < 0.4 ? 'talk' : 'stand' });
  }
  // tea tables on the road before the tea houses, people at them
  for (const l of lots()) {
    if (l.front !== 's' || !l.shop || l.rect[3] < ROAD.z0 - 1 || rand() > 0.4) continue;
    const c = [(l.rect[0] + l.rect[2]) / 2, ROAD.z0 + 2.2];
    if (Math.hypot(...c) > RADIUS - 35) continue;
    L.push({ t: 'tea_table', at: c, c, r: 1.1, y: LEVEL.street + 0.04, rot: 0, seed: Math.floor(rand() * 1e9) });
    for (const [dx, dz] of [[0.85, 0], [-0.85, 0], [0, 0.85]]) if (rand() < 0.7) person([c[0] + dx, c[1] + dz], LEVEL.street + 0.04, faceTo([-dx, -dz]), { pose: 'sit', dress: 'robe' });
  }
  // people on the road walking to the river
  for (let k = 0; k < 40; k++) { const x = -190 + rand() * 300; if (Math.abs(x - (CANAL.x0 + CANAL.x1) / 2) < 10) continue; person([x, ROAD.z0 + 4.5 + rand() * 6], LEVEL.street + 0.04, faceTo([rand() < 0.5 ? 1 : -1, 0.3]), { carry: pick(['none', 'none', 'basket', 'pole']) }); }
  return [base('song-hangzhou-stands', S), base('song-hangzhou-tide-crowd', L, 'life')];
}

export async function town() {
  const all = lots(), plans = [];
  for (let i = 0; i < all.length; i += 150) plans.push(base(`song-hangzhou-houses-${i / 150}`, all.slice(i, i + 150).map((l) => ({ t: 'house_jiangnan', y: LEVEL.street, ...l }))));
  plans.push(...tideDay());
  return plans;
}
