// Which of London's lots stand open, and which have their upper floors open (docs/settlements/london.md §5, §9): pure data of layout.js, shared by the town's
// plans (town.js), the walk routes (plan.js), the night (nightlight.js) and the sound map (soundmap.js), which must not load the builders.
import { BRIDGE, lots } from './layout.js';

/** Which buildings stand open (DESIGN §4.3): round the arrival on the bridge (ARRIVAL) the two pubs, nine shops of different trades and five
 *  houses nearest it, within 120 m on the Westminster side of the river and in Lambeth (§5a); and, along Bridge Street toward the square, a pub,
 *  three shops and two houses (the way on to Parliament Square). */
const ARRIVAL = [200, -170];
export function openSet(all) {
  const out = new Set(), cx = (l) => (l.rect[0] + l.rect[2]) / 2, cz = (l) => (l.rect[1] + l.rect[3]) / 2;
  const d = (l, p) => Math.hypot(cx(l) - p[0], cz(l) - p[1]), ok = (l) => l.rect[3] - l.rect[1] >= 8 && l.rect[2] - l.rect[0] >= 5;
  const near = (p, f, n, per = 99, rmax = 1e9) => { const seen = {}; for (const l of all.filter((q) => ok(q) && f(q) && !out.has(q) && d(q, p) < rmax).sort((a, b) => d(a, p) - d(b, p))) { const k = l.trade ?? 'x'; if ((seen[k] = (seen[k] ?? 0) + 1) > per) continue; out.add(l); if (--n === 0) break; } };
  near(ARRIVAL, (l) => l.pub, 2, 99, 118); near(ARRIVAL, (l) => l.shop, 9, 1, 118); near(ARRIVAL, (l) => !l.shop && !l.pub, 5, 99, 118);
  const A = [60, BRIDGE.z];
  near(A, (l) => l.pub, 1); near(A, (l) => l.shop, 3, 1);
  near([30, BRIDGE.z - 40], (l) => !l.shop && !l.pub, 2);
  // beyond the first 120 m (dossier §8): through the rest of the town within 340 m of the arrival, a house in each 100 m cell and a shop in each
  // 160 m cell stands open too, so that every quarter has its doors to try; the kinds of room follow the quarter (variantOf)
  const spread = (f, cell, rmax, cap) => { const taken = new Map(); for (const l of all.filter((q) => ok(q) && f(q) && !out.has(q) && d(q, ARRIVAL) < rmax && d(q, ARRIVAL) >= 118).sort((a, b) => a.seed - b.seed)) { const k = Math.floor(cx(l) / cell) + ',' + Math.floor(cz(l) / cell); if (!taken.has(k) && taken.size < cap) taken.set(k, l); } for (const l of taken.values()) out.add(l); };
  spread((l) => !l.shop && !l.pub, 120, 340, 30); spread((l) => l.shop, 200, 340, 6);
  return out;
}
/** The doors of a terrace come in pairs (the houses built two and two, mirrored about their party wall); the rooms of an open house follow
 *  its quarter: the better streets about Bridge Street and the square have the parlour or the dining room, the Lambeth side and the far streets
 *  a working family's lodging. */
export function mirrors(all) {
  const rows = new Map();
  for (const l of all) { const k = l.front + l.rect[1].toFixed(1); if (!rows.has(k)) rows.set(k, []); rows.get(k).push(l); }
  for (const row of rows.values()) { row.sort((a, b) => a.rect[0] - b.rect[0]); row.forEach((l, i) => { l.mirror = i % 2 === 1; }); }
}
export function variantOf(l) {
  const cx = (l.rect[0] + l.rect[2]) / 2, cz = (l.rect[1] + l.rect[3]) / 2, r = Math.hypot(cx - 60, cz - BRIDGE.z), k = l.seed % 6;
  if (cx > 262) return k < 4 ? 'lodging' : 'parlour';
  if (r < 130) return k % 2 ? 'dining' : 'parlour';
  if (r < 260) return ['parlour', 'lodging', 'dining', 'lodging', 'parlour', 'lodging'][k];
  return k < 4 ? 'lodging' : k === 4 ? 'parlour' : 'dining';
}
/** The open houses whose upper floors are open too (dossier §9): those nearest the arrival and along Bridge Street toward the square: houses of the three
 *  kinds of room, the shops of different trades, the pubs. */
export function upSet(all, open) {
  const out = new Set(), cx = (l) => (l.rect[0] + l.rect[2]) / 2, cz = (l) => (l.rect[1] + l.rect[3]) / 2, d = (l, p) => Math.hypot(cx(l) - p[0], cz(l) - p[1]);
  const cand = all.filter((l) => open.has(l) && (d(l, ARRIVAL) < 125 || d(l, [60, BRIDGE.z]) < 70));
  const take = (f, n, per = 99) => { const seen = {}; for (const l of cand.filter((q) => f(q) && !out.has(q)).sort((a, b) => Math.min(d(a, ARRIVAL), d(a, [60, BRIDGE.z])) - Math.min(d(b, ARRIVAL), d(b, [60, BRIDGE.z])))) { const k = (l.trade ?? '') + (l.pub ? 'pub' : '') + variantOf(l); if ((seen[k] = (seen[k] ?? 0) + 1) > per) continue; out.add(l); if (--n === 0) break; } };
  take((l) => l.pub, 2); take((l) => l.shop, 4, 1); take((l) => !l.shop && !l.pub, 7, 3);
  return out;
}
export function upLots() { const all = lots(); mirrors(all); const open = openSet(all); for (const l of open) l.variant = variantOf(l); return [...upSet(all, open)]; }

/** The lots with the doors' sides set, which are open and which have their upper floors open (as houses() builds them). */
export function nightLots() { const all = lots(); mirrors(all); const open = openSet(all); return { all, open, ups: upSet(all, open) }; }
