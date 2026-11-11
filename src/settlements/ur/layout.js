// Ur of the Third Dynasty (c. 2050 BC) — the layout (docs/settlements/ur.md §2): the temenos with
// the ziggurat on its terrace, the Court of Nanna before it, the Giparu and the palace; a quarter of
// courtyard houses on lanes round it; the harbour on the west. Pure data. +x east, +z south; the
// precinct turned so that the ziggurat's front faces our north.

export const RADIUS = 380;
export const TEMENOS = [-140, -170, 130, 120];
export const TERRACE = { rect: [-62, -72, 62, 50], y: 2.5 };
export const COURT = [-50, -140, 50, -78];
export const GIPARU = [60, 40, 122, 104];
export const PALACE = [70, -158, 122, -64];
export const STORES = [-130, 40, -82, 108];
/** The market square before the temenos's north gate (docs/settlements/ur.md §5.2). */
export const MARKET = [-44, -217, 42, -178];
/** The houses on the square's north side that can be entered, furnished (§5.1): their seeds, the street door toward the square. */
const OPEN = new Set([987775, 589524, 632118]);
/** Where the scribal school's house stands: the lot nearest to this point west of the market square. */
export const SCHOOL_AT = [-62, -200];
export const HARBOUR = { rect: [-376, -150, -282, 70], bed: -3, water: -1.2 };
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
export const inHarbour = (x, z) => inRect(HARBOUR.rect, x, z) && Math.hypot(x, z) < RADIUS - 24;

/** The ground inside the temenos left free by its great buildings, where the temple's workshops stand (docs/settlements/ur.md §5.5). */
export const TEMPLE_ZONES = [[-136, -164, -58, -82], [-136, -70, -68, 32], [72, -60, 126, 34], [-78, 58, 54, 112]];
function templeLots(out) {
  const rand = rng(2112), S = 15, trades = ['weaver', 'weaver', 'baker', 'brewer', 'granary', 'potter', 'smith', 'granary', 'weaver', 'baker'];
  let n = 0;
  for (const [zx0, zz0, zx1, zz1] of TEMPLE_ZONES) for (let x = zx0; x + S <= zx1 + 0.01; x += S) for (let z = zz0; z + S <= zz1 + 0.01; z += S) {
    const w = 10 + rand() * 3.2, d = 10 + rand() * 3.2, cx = x + S / 2 + (rand() - 0.5) * (S - w - 3), cz = z + S / 2 + (rand() - 0.5) * (S - d - 3), r = [cx - w / 2, cz - d / 2, cx + w / 2, cz + d / 2];
    if (r[1] < -12 && r[3] > -28 && r[2] > 60) continue;                                   // the east street's lane
    if (rand() < 0.1) continue;
    const seed = Math.floor(rand() * 1e6), tr = trades[n++ % trades.length], open = n % 3 === 0 && tr !== 'granary' || tr === 'granary' && n % 4 === 0;
    const face = Math.abs(cz) > Math.abs(cx - 0) ? (cz > -10 ? 'n' : 's') : (cx > 0 ? 'w' : 'e');
    out.push(open ? { rect: r, seed, open: true, temple: true, trade: tr, door: face } : { rect: r, seed, temple: true, trade: tr });
  }
}
let HOUSES = null;
/** Courtyard houses of 9–14 m on an irregular grid of lanes 2–4 m wide, outside the temenos and the harbour. */
export function houses() {
  if (HOUSES) return HOUSES;
  HOUSES = [];
  const rand = rng(2050), S = 16;
  for (let x = -RADIUS; x < RADIUS; x += S) for (let z = -RADIUS; z < RADIUS; z += S) {
    const w = 9 + rand() * 5, d = 9 + rand() * 5, ox = (rand() - 0.5) * (S - w - 2), oz = (rand() - 0.5) * (S - d - 2);
    const cx = x + S / 2 + ox, cz = z + S / 2 + oz, r = [cx - w / 2, cz - d / 2, cx + w / 2, cz + d / 2];
    if (Math.max(...[[r[0], r[1]], [r[2], r[1]], [r[0], r[3]], [r[2], r[3]]].map(([a, b]) => Math.hypot(a, b))) > RADIUS - 24) continue;
    if (inRect(TEMENOS, cx, cz, w / 2 + 6) || inRect(HARBOUR.rect, cx, cz, w / 2 + 12)) continue;
    if (Math.abs(cx) < 6 && cz < TEMENOS[1]) continue;               // the street to the north gate
    if (Math.abs(cz + 20) < 5 && cx > TEMENOS[2]) continue;          // the street to the east gate
    if (inRect(MARKET, cx, cz)) { rand(); rand(); continue; }
    if (rand() < 0.08) continue;
    const seed = Math.floor(rand() * 1e6);
    const open = OPEN.has(seed), big = Math.min(w, d) >= 10.8;
    // a public chapel (Woolley's "public chapels" stood at street corners): about one lot in twelve that is big enough, its door toward the temenos
    const chapel = !open && big && seed % 12 === 0, face = Math.abs(cz) > Math.abs(cx) ? (cz > 0 ? 'n' : 's') : (cx > 0 ? 'w' : 'e');
    HOUSES.push(open ? { rect: r, seed, open: true, door: 's', white: seed === 589524 } : chapel ? { rect: r, seed, chapel: true, door: face } : { rect: r, seed });
  }
  // the house of a scribal school beside the market: the lot nearest to SCHOOL_AT, entered, furnished with benches and clay bins (§5.4)
  let best = null, bd = 1e9;
  for (const h of HOUSES) if (!h.open && !h.chapel) { const dd = Math.hypot((h.rect[0] + h.rect[2]) / 2 - SCHOOL_AT[0], (h.rect[1] + h.rect[3]) / 2 - SCHOOL_AT[1]); if (dd < bd) { bd = dd; best = h; } }
  if (best) { best.open = true; best.school = true; best.door = 's'; }
  // the temple's workshops in the temenos's open ground (§5.5): lots on lanes, their own random stream (the town's stays as it was)
  templeLots(HOUSES);
  // the houses that can be entered, each of a trade, by the places where the trades were: the market, the north and east streets, the quay, the south road
  const mid = (h) => [(h.rect[0] + h.rect[2]) / 2, (h.rect[1] + h.rect[3]) / 2];
  const faceTo = (h, a) => { const [cx, cz] = mid(h), dx = a[0] - cx, dz = a[1] - cz; return Math.abs(dz) > Math.abs(dx) ? (dz > 0 ? 's' : 'n') : (dx > 0 ? 'e' : 'w'); };
  const taken = new Set();
  const pick = (anchor, trades) => {
    const c = HOUSES.filter((h) => !h.open && !h.chapel && !h.temple && !taken.has(h) && Math.min(h.rect[2] - h.rect[0], h.rect[3] - h.rect[1]) >= 10.2 && !inRect(MARKET, mid(h)[0], mid(h)[1], 3))
      .sort((p, q) => Math.hypot(mid(p)[0] - anchor[0], mid(p)[1] - anchor[1]) - Math.hypot(mid(q)[0] - anchor[0], mid(q)[1] - anchor[1]));
    trades.forEach((tr, i) => { const h = c[i]; if (!h) return; taken.add(h); h.open = true; h.trade = tr; h.door = faceTo(h, anchor); });
  };
  pick([0, -200], ['baker', 'brewer', 'weaver', 'smith', 'potter', 'baker', 'weaver', 'brewer', 'smith', 'potter', 'baker', 'granary']);
  pick([-270, -30], ['fisher', 'reeder', 'fisher', 'reeder', 'potter', 'fisher', 'reeder']);
  pick([190, -20], ['smith', 'potter', 'weaver', 'baker', 'brewer', 'smith']);
  pick([0, -270], ['baker', 'weaver', 'brewer', 'potter']);
  pick([0, 170], ['weaver', 'baker', 'potter', 'reeder', 'granary']);
  // the trade of some of the rest (the wares at their doors), and how fully each is dressed by its distance from the core
  for (const h of HOUSES) {
    const [cx, cz] = mid(h), d = Math.hypot(cx, cz + 120);
    h.lod = d < 200 ? 2 : d < 320 ? 1 : 0;
    if (!h.trade && !h.chapel && !h.open && h.seed % 7 === 0) h.trade = ['potter', 'weaver', 'baker', 'reeder', 'smith', 'brewer'][h.seed % 6];
  }
  return HOUSES;
}
let GRID = null;
export function inHouse(x, z, m = 0) {
  if (!GRID) { GRID = new Map(); for (const h of houses()) for (let i = Math.floor((h.rect[0] - 3) / 16); i <= Math.floor((h.rect[2] + 3) / 16); i++) for (let j = Math.floor((h.rect[1] - 3) / 16); j <= Math.floor((h.rect[3] + 3) / 16); j++) { const k = i + ',' + j; if (!GRID.has(k)) GRID.set(k, []); GRID.get(k).push(h); } }
  const l = GRID.get(Math.floor(x / 16) + ',' + Math.floor(z / 16));
  return !!l && l.some((h) => inRect(h.rect, x, z, m));
}
