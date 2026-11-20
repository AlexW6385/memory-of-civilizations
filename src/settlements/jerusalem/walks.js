// The visitor's walk (docs/settlements/jerusalem.md §12.1): routes from the street into the places that stand open along it — the Cardo's shops,
// the market street's shops, the open houses' court and main room, the servants' lodges on the Haram. Local to the Dome's plan (the landmark
// carries the walks, as upWalks in town.js does), each with the height of its start. Pure data and functions of layout.js.
import { HARAM, CARDO, height } from './layout.js';
import { allColonnades, colKey, shopsOf, TRADES_OF } from './shopline.js';
import { openHouses, houseRooms } from './soundmap.js';
import { LODGES } from './layout.js';

/** One route: the points are world [x, z]; y0 the ground at the first. */
function route(pts, y0, origin, base) { const r = pts.map(([x, z]) => [x, z - origin[1]]); r.y0 = y0 - base; return r; }

/** The open shops of the colonnades, [{ el, sh, P (frame → world) }] with the trade named. */
function openShops() {
  const out = [];
  for (const el of allColonnades()) {
    const codes = TRADES_OF[colKey(el)];
    if (!codes) continue;
    const [ax, az] = el.a, [bx, bz] = el.b, L = Math.hypot(bx - ax, bz - az), u = [(bx - ax) / L, (bz - az) / L], n = [-u[1], u[0]], side = el.side ?? 1;
    const P = (s, t) => [ax + u[0] * s + n[0] * t * side, az + u[1] * s + n[1] * t * side];
    for (const sh of shopsOf(el, codes)) if (sh.trade) out.push({ el, sh, P, s: (sh.i + 0.5) * sh.w });
  }
  return out;
}

/** The route into a shop: from the road before it, over the portico and the threshold, through the door's middle, into the room as far as its shelves allow. */
export function shopRoute(q, origin, base) {
  const D = q.el.depth ?? 5, f1 = D + 0.6, tb = D + (q.el.shops ?? 5.5) - 0.6, s = q.s;
  const pts = [q.P(s, -1.6), q.P(s, D - 0.5), q.P(s, f1 + 1.0), q.P(s, tb - 1.3)];
  return route(pts, height(...pts[0]), origin, base);
}

/** The shops walked: four on the Cardo (four trades), two in the market street. */
export function shopsWalked() {
  const all = openShops(), seen = new Set(), pick = [];
  const d = (c) => (q) => Math.hypot(q.sh.door[0] - c[0], q.sh.door[1] - c[1]);
  // one trade each, spread along the Cardo: south of the Sepulchre's stair on the west side, north of the street's mouth on the east, and two between
  for (const c of [[CARDO.x - 6.5, -150], [CARDO.x + 6.5, -60], [CARDO.x - 6.5, 60], [CARDO.x + 6.5, 150]]) {
    const q = all.filter((m) => Math.abs(m.sh.door[0] - CARDO.x) < 20 && !seen.has(m.sh.trade)).sort((p, r) => d(c)(p) - d(c)(r))[0];
    if (q) { seen.add(q.sh.trade); pick.push(q); }
  }
  const street = all.filter((q) => Math.abs(q.sh.door[0] - CARDO.x) >= 20 && Math.abs(q.sh.door[1]) < 12).sort((a, b) => d([-190, 0])(a) - d([-190, 0])(b));
  seen.clear(); pick.push(...street.filter((q) => { if (seen.has(q.sh.trade)) return false; seen.add(q.sh.trade); return true; }).slice(0, 2));
  return pick;
}

/** The route into an open house: from the lane through the door, across the court to the main room's door and in. The rooms are the style's. */
function houseRoute(rect, ys, origin, base) {
  const { court: [cx0, cz0, cx1, cz1], room } = houseRooms({ rect }), dc = (cx0 + cx1) / 2, mid = (rect[0] + rect[2]) / 2, z1 = rect[3];
  const pts = [[dc, z1 + 1.3], [dc, cz1 - 0.9], [mid, cz0 + 1.3], [mid, room[3] - 1.2]];
  return route(pts, ys, origin, base);
}

/** The open houses without a stair walked in (the ones with a stair have their route up it in town.js): the three nearest the market street's mouth. */
export function housesWalked() {
  const c = [-185, -30];
  // (where the lane falls a metre below the court the door's steps are a climb the walk does not make: those houses are left)
  const drop = (h) => Math.max(h.lot.y, ...[[h.rect[0], h.rect[1]], [h.rect[2], h.rect[1]], [h.rect[0], h.rect[3]], [h.rect[2], h.rect[3]]].map(([a, b]) => height(a, b))) + 0.05 - height((h.rect[0] + h.rect[2]) / 2, h.rect[3] + 0.8);
  return openHouses().filter((h) => !h.up && drop(h) < 0.5).sort((a, b) => Math.hypot((a.rect[0] + a.rect[2]) / 2 - c[0], a.rect[3] - c[1]) - Math.hypot((b.rect[0] + b.rect[2]) / 2 - c[0], b.rect[3] - c[1])).slice(0, 3);
}

/** The lodges walked in: the oil store, the wick-makers and the glass-lamp makers. */
export function lodgesWalked() { return LODGES.filter((l) => ['oil', 'wick', 'glass'].includes(l.use)).filter((l, i, a) => a.findIndex((m) => m.use === l.use) === i); }

/** Every route of the visitor's walk, local to the plan at `origin` with ground `base`. */
export function visitWalks(origin, base) {
  const out = [];
  for (const q of shopsWalked()) out.push(shopRoute(q, origin, base));
  for (const h of housesWalked()) out.push(houseRoute(h.rect, height((h.rect[0] + h.rect[2]) / 2, h.rect[3] + 0.8), origin, base));
  for (const l of lodgesWalked()) out.push(houseRoute(l.rect, HARAM.top, origin, base));
  return out;
}
