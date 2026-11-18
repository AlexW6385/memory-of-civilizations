// Which lots are the houses you can walk into (shared by the town's plans and the walk-check routes).
import { ARRIVAL, lots, shops, SABILS } from './layout.js';
const dist = (l, [x, z]) => Math.hypot((l.rect[0] + l.rect[2]) / 2 - x, (l.rect[1] + l.rect[3]) / 2 - z);
let CACHE = null;
export function pickHomes() {
  if (CACHE) return CACHE;
  const all = lots();
  // the corner lot nearest each sabil's place becomes the sabil-kuttab, its corner the one nearest the crossing
  const taken = new Map();
  for (const p of SABILS) { const l = all.filter((q) => !taken.has(q)).sort((a, b) => dist(a, p) - dist(b, p))[0]; taken.set(l, p); }
  const { fronts, open } = shops();
  const openSet = new Set(open), frontSet = new Set(fronts.filter((l) => !openSet.has(l)));
  const rest = all.filter((l) => !taken.has(l) && !openSet.has(l));
  // houses you can walk into (house.js): in the 200 m cells that hold four or more open shops (their plan and materials are shared),
  // beyond 120 m of the arrival, at most three to a cell and 45 m apart
  const cellN = new Map(); open.forEach((l) => { const k = Math.floor(l.rect[0] / 200) + ',' + Math.floor(l.rect[1] / 200); cellN.set(k, (cellN.get(k) || 0) + 1); });
  const shopCells = new Set([...cellN].filter(([, n]) => n >= 4).map(([k]) => k));
  const cen = (l) => [(l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2];
  const wide = (l) => { const e = l.front === 'e' || l.front === 'w'; return (e ? l.rect[3] - l.rect[1] : l.rect[2] - l.rect[0]) >= 11 && (e ? l.rect[2] - l.rect[0] : l.rect[3] - l.rect[1]) >= 9.5; };   // room for the stair (house.js)
  const adist = (l) => Math.hypot(cen(l)[0] - ARRIVAL[0], cen(l)[1] - ARRIVAL[1]);
  const cellOf = (l) => Math.floor(l.rect[0] / 200) + ',' + Math.floor(l.rect[1] / 200);
  const cand = rest.filter((l) => !frontSet.has(l) && !l.yard && wide(l) && shopCells.has(cellOf(l)) && adist(l) > 120).sort((a, b) => (a.seed % 977) - (b.seed % 977));
  const homes = [], perCell = new Map();
  for (const l of cand) {
    const k = cellOf(l), c = cen(l);
    if ((perCell.get(k) || 0) >= 3 || homes.some((h) => Math.hypot(cen(h)[0] - c[0], cen(h)[1] - c[1]) < 45)) continue;
    perCell.set(k, (perCell.get(k) || 0) + 1); homes.push(l);
  }
  // and the houses nearest the arrival (within 115 m, 26 m apart, in a cell that has shops), the first ones a visitor comes to
  const near = rest.filter((l) => !frontSet.has(l) && !l.yard && wide(l) && cellN.has(cellOf(l)) && adist(l) <= 115).sort((a, b) => adist(a) - adist(b));
  for (const l of near) { if (homes.filter((h) => adist(h) <= 115).length >= 5) break; const c = cen(l); if (homes.some((h) => Math.hypot(cen(h)[0] - c[0], cen(h)[1] - c[1]) < 26)) continue; homes.push(l); }
  return (CACHE = { all, taken, fronts, open, openSet, frontSet, rest, homes });
}
