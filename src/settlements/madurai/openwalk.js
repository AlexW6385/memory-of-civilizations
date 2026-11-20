// The visitor's walk (docs/settlements/madurai.md §21): from the arrival on the south axial street, routes from the street over the
// thinnai or the shop's platform, through the 1.6 m doorway into the furnished front room, for the houses, shops and a court house nearest
// the arrival (the first rows, hollow and furnished: §14). Pure data of layout.js; the doorway's place is that of interiors.js `plan`.
import { lots, lotMap, outside, RADIUS } from './layout.js';

const ARR = [-20, 170];
const TH = 0.32;

/** Where a lot's doorway is along the street (u) and how deep its front room is, from the builders' own rules. */
function doorOf(l, W) {
  if (l.kind === 'court') return W / 2;
  if (l.kind === 'shop') return l.trade === 'sweets' ? 1.35 : W - 1.35;
  return W / 2;
}

/** About `n` routes (local [x, z] waypoints) into opened houses, shops and a court house near the arrival, of different kinds and streets. */
export function visitorRoutes(n = 12) {
  const dist = (l) => Math.hypot((l.rect[0] + l.rect[2]) / 2 - ARR[0], (l.rect[1] + l.rect[3]) / 2 - ARR[1]);
  const open = lots().filter((l) => ['house', 'shop', 'agra', 'court'].includes(l.kind) && outside((l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2) < 120 && dist(l) < 110 && lotMap(l).W > 4.2)
    .sort((a, b) => dist(a) - dist(b));
  const picked = [], count = { house: 0, shop: 0, agra: 0, court: 0 }, cap = { house: 5, shop: 5, agra: 2, court: 1 };
  for (const l of open) {
    if (picked.length >= n) break;
    if (count[l.kind] >= cap[l.kind]) continue;
    if (picked.some((p) => Math.hypot(p.rect[0] - l.rect[0], p.rect[1] - l.rect[1]) < 14)) continue;      // spread along the streets
    picked.push(l); count[l.kind]++;
  }
  const routes = [];
  for (const l of picked) {
    const { W, map } = lotMap(l), u = doorOf(l, W), ver = l.kind === 'shop' ? 2.3 : l.kind === 'court' ? 2.0 : 1.9 + 0.15;
    const pts = [[u, -2.2], [u, -0.4], [u, ver * 0.5], [u, ver + TH + 0.9], [u, ver + TH + 1.9]];
    routes.push(pts.map(([uu, v]) => { const [x, z] = map(uu, v); return [x, z]; }));
  }
  void RADIUS;
  return routes;
}
