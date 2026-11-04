// Life in the settlements (DESIGN §5 "Objects of use", "Figures and life"): a pass over a built
// settlement that puts the things of daily use where they would be — pots, baskets, firewood,
// ladders and laundry by the house doors; carts, barrows, beasts and a few still figures in the
// streets; stalls with their goods in the market squares; boats moored along the shores. What is
// used where comes from the settlement's kit (its culture and time); where it goes is read from
// its plans (the footprints of every building) and its ground (water, slope). Deterministic.

import { LIFE_KINDS } from './index.js';
import { buildPlan } from '../core/build.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const hash = (str) => { let h = 2166136261; for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };
const pick = (rand, list) => { const tot = list.reduce((a, [, w]) => a + w, 0); let r = rand() * tot; for (const it of list) { r -= it[1]; if (r <= 0) return it; } return list[list.length - 1]; };

// ---- the kits: what each culture and time uses ------------------------------------------------
const F = (dress, cloths, skin, hats, extra = {}) => ({ dress, cloths, skin, hats, ...extra });
const KITS = {
  mediterranean: {
    door: [['lantern:oil', 0.7], ['pot:amphora', 3], ['pot:pithos', 1], ['basket', 2], ['bench', 1.5], ['firewood', 1], ['ladder', 0.6], ['laundry', 0.8]],
    street: [['cart', 1], ['animal:donkey', 2], ['animal:goat', 1], ['animal:dog', 0.6], ['chickens', 0.8], ['sacks', 1], ['figure', 2.5]],
    stall: ['pot:amphora', 'basket', 'produce', 'cloth'], boats: ['rowboat'], awnings: ['cloth_white', 'cloth_ochre', 'cloth_red'],
    figures: F(['robe', 'tunic'], ['cloth_white', 'cloth_ochre', 'cloth_brown', 'cloth_red', 'cloth_indigo'], ['skin_medium', 'skin_light'], ['none', 'none', 'veil', 'cap']),
  },
  near_east: {
    door: [['lantern:oil', 0.7], ['pot:water_pot', 3], ['pot:pithos', 1], ['basket', 2], ['sacks', 1], ['bench', 1], ['laundry', 0.6]],
    street: [['animal:donkey', 2.5], ['animal:camel', 1.2], ['animal:goat', 1.2], ['animal:sheep', 0.8], ['chickens', 0.6], ['sacks', 1], ['figure', 2.5]],
    stall: ['pot:water_pot', 'basket', 'produce', 'cloth'], boats: ['dhow', 'reed'], awnings: ['cloth_white', 'cloth_ochre', 'cloth_indigo'],
    figures: F(['robe'], ['cloth_white', 'cloth_ochre', 'cloth_brown', 'cloth_indigo', 'cloth_black'], ['skin_medium', 'skin_dark'], ['turban', 'veil', 'veil', 'none']),
  },
  egypt: {
    door: [['lantern:oil', 0.7], ['pot:water_pot', 3], ['pot:dark_pot', 1.5], ['basket', 2], ['sacks', 1], ['firewood', 0.4]],
    street: [['animal:donkey', 2], ['animal:ox', 1], ['animal:goat', 1.2], ['chickens', 0.5], ['sacks', 1.2], ['figure', 2.5]],
    stall: ['pot:water_pot', 'basket', 'produce'], boats: ['reed', 'barge'], awnings: ['cloth_white', 'reed_mat'],
    figures: F(['wrap', 'tunic'], ['cloth_white', 'cloth_white', 'linen'], ['skin_medium', 'skin_dark'], ['none', 'none', 'cap']),
  },
  east_asia: {
    door: [['lantern:paper', 1.6], ['pot:glazed_jar', 3], ['pot:blue_jar', 1], ['basket', 2.5], ['firewood', 1.5], ['bench', 1.2], ['laundry', 1], ['ladder', 0.5]],
    street: [['barrow', 1.5], ['cart', 0.6], ['animal:ox', 0.8], ['animal:buffalo', 0.5], ['animal:dog', 0.6], ['chickens', 0.8], ['sacks', 0.6], ['figure', 3]],
    stall: ['pot:glazed_jar', 'basket', 'produce', 'cloth'], boats: ['sampan'], awnings: ['cloth_indigo', 'reed_mat', 'cloth_white'],
    figures: F(['robe', 'trousers'], ['cloth_indigo', 'cloth_grey', 'cloth_brown', 'cloth_white', 'cloth_black'], ['skin_light', 'skin_medium'], ['straw', 'cap', 'none', 'none'], { carry: ['pole', 'basket', 'none', 'none'] }),
  },
  japan: {
    door: [['lantern:white', 1.6], ['pot:dark_pot', 2], ['basket', 2.5], ['firewood', 1.5], ['bench', 1.5], ['ladder', 0.5]],
    street: [['barrow', 0.4], ['cart', 0.5], ['animal:ox', 0.7], ['animal:horse', 0.5], ['animal:dog', 0.5], ['figure', 3]],
    stall: ['basket', 'produce', 'cloth', 'pot:dark_pot'], boats: ['sampan', 'rowboat'], awnings: ['cloth_indigo', 'reed_mat'],
    figures: F(['robe'], ['cloth_indigo', 'cloth_grey', 'cloth_brown', 'cloth_black', 'cloth_white'], ['skin_light'], ['straw', 'none', 'none'], { carry: ['pole', 'none', 'none'] }),
  },
  south_asia: {
    door: [['lantern:oil', 0.7], ['pot:water_pot', 3.5], ['basket', 2], ['firewood', 0.8], ['bench', 0.8], ['laundry', 1]],
    street: [['cart', 1.2], ['animal:zebu', 2.2], ['animal:buffalo', 0.8], ['animal:goat', 1], ['animal:dog', 0.6], ['figure', 3]],
    stall: ['pot:water_pot', 'basket', 'produce', 'cloth'], boats: ['rowboat'], awnings: ['cloth_red', 'cloth_ochre', 'cloth_white'],
    figures: F(['wrap', 'robe'], ['cloth_white', 'cloth_red', 'cloth_ochre', 'cloth_green', 'cloth_indigo'], ['skin_medium', 'skin_dark'], ['turban', 'veil', 'none'], { carry: ['pot', 'none', 'none'] }),
  },
  southeast_asia: {
    door: [['lantern:oil', 0.7], ['pot:dark_pot', 2.5], ['basket', 3], ['firewood', 1], ['ladder', 1]],
    street: [['cart', 1], ['animal:buffalo', 1.5], ['animal:zebu', 1], ['chickens', 1.2], ['animal:pig', 0.6], ['figure', 2.5]],
    stall: ['basket', 'produce', 'pot:dark_pot'], boats: ['canoe', 'sampan'], awnings: ['reed_mat', 'cloth_ochre'],
    figures: F(['wrap'], ['cloth_ochre', 'cloth_red', 'cloth_brown', 'cloth_white'], ['skin_medium', 'skin_dark'], ['none', 'none', 'cap'], { carry: ['pole', 'basket', 'none'] }),
  },
  europe_medieval: {
    door: [['lantern:iron', 0.7], ['barrel', 2], ['crates', 1], ['firewood', 2], ['bench', 1.2], ['ladder', 0.8], ['laundry', 0.8], ['basket', 1]],
    street: [['cart', 2], ['animal:horse', 1.2], ['animal:pig', 0.8], ['animal:dog', 0.6], ['chickens', 1], ['sacks', 1], ['barrel', 1], ['figure', 2.5]],
    stall: ['basket', 'produce', 'cloth', 'pot:dark_pot'], boats: ['rowboat', 'barge'], awnings: ['cloth_red', 'cloth_white', 'cloth_green', 'cloth_ochre'],
    figures: F(['robe', 'tunic'], ['cloth_brown', 'cloth_grey', 'cloth_red', 'cloth_green', 'cloth_indigo', 'cloth_white'], ['skin_light'], ['cap', 'none', 'veil', 'brim']),
  },
  europe_early_modern: {
    door: [['lantern:iron', 0.7], ['barrel', 2], ['crates', 1.5], ['bench', 1.5], ['firewood', 0.8], ['ladder', 0.5], ['basket', 1]],
    street: [['cart', 2], ['animal:horse', 1.5], ['animal:dog', 0.6], ['barrel', 1], ['sacks', 0.8], ['figure', 3]],
    stall: ['basket', 'produce', 'cloth'], boats: ['rowboat', 'barge'], awnings: ['cloth_white', 'cloth_red', 'cloth_green'],
    figures: F(['robe', 'trousers'], ['cloth_black', 'cloth_brown', 'cloth_red', 'cloth_indigo', 'cloth_grey'], ['skin_light'], ['brim', 'cap', 'none', 'veil']),
  },
  americas: {
    door: [['pot:dark_pot', 2.5], ['pot:water_pot', 1.5], ['basket', 2.5], ['firewood', 1], ['ladder', 0.6]],
    street: [['animal:dog', 1.2], ['chickens', 0.6], ['basket', 1], ['pot:dark_pot', 1], ['figure', 3]],
    stall: ['basket', 'produce', 'pot:dark_pot', 'cloth'], boats: ['canoe'], awnings: ['cloth_white', 'reed_mat'],
    figures: F(['wrap', 'tunic'], ['cloth_white', 'cloth_ochre', 'cloth_red', 'cloth_brown'], ['skin_medium', 'skin_dark'], ['none', 'none', 'cap'], { carry: ['basket', 'pot', 'none', 'none'] }),
  },
  andes: {
    door: [['pot:dark_pot', 2], ['basket', 2], ['firewood', 1]],
    street: [['animal:llama', 3], ['animal:dog', 0.4], ['figure', 2.5]],
    stall: ['basket', 'produce', 'cloth'], boats: [], awnings: ['cloth_red'],
    figures: F(['tunic', 'wrap'], ['cloth_red', 'cloth_ochre', 'cloth_brown', 'cloth_black'], ['skin_medium'], ['cap', 'none']),
  },
  africa: {
    door: [['lantern:oil', 0.7], ['pot:water_pot', 3], ['pot:dark_pot', 2], ['basket', 2.5], ['firewood', 1]],
    street: [['animal:goat', 2], ['animal:zebu', 1], ['animal:sheep', 0.8], ['chickens', 1], ['animal:donkey', 0.6], ['figure', 3]],
    stall: ['pot:water_pot', 'basket', 'produce', 'cloth'], boats: ['canoe', 'dhow'], awnings: ['cloth_white', 'reed_mat', 'cloth_indigo'],
    figures: F(['wrap', 'robe'], ['cloth_white', 'cloth_indigo', 'cloth_ochre', 'cloth_red'], ['skin_dark'], ['none', 'turban', 'veil'], { carry: ['pot', 'basket', 'none'] }),
  },
  pacific: {
    door: [['basket', 3], ['firewood', 1.5], ['pot:dark_pot', 0.2]],
    street: [['chickens', 1.2], ['animal:dog', 0.6], ['basket', 1], ['figure', 2.5]],
    stall: [], boats: ['canoe'], awnings: [],
    figures: F(['wrap'], ['cloth_brown', 'cloth_ochre', 'hide_tan'], ['skin_medium', 'skin_dark'], ['none']),
  },
  north: {
    door: [['lantern:iron', 0.7], ['firewood', 3], ['barrel', 1.5], ['basket', 1], ['bench', 1], ['ladder', 0.5]],
    street: [['cart', 1], ['animal:horse', 1], ['animal:sheep', 1.5], ['animal:goat', 0.8], ['haystack', 1.2], ['animal:dog', 0.5], ['figure', 2]],
    stall: ['basket', 'produce', 'cloth'], boats: ['rowboat'], awnings: ['cloth_red', 'cloth_white'],
    figures: F(['robe', 'tunic'], ['cloth_brown', 'cloth_grey', 'cloth_red', 'cloth_white', 'cloth_indigo'], ['skin_light'], ['cap', 'none', 'veil']),
  },
  venice: {
    door: [['lantern:iron', 0.7], ['barrel', 2], ['crates', 1.5], ['bench', 1], ['basket', 1], ['laundry', 1.2], ['pot:water_pot', 0.6]],
    street: [['barrel', 1], ['sacks', 1], ['crates', 0.8], ['animal:dog', 0.4], ['well', 0.3], ['figure', 4]],
    stall: ['basket', 'produce', 'cloth'], boats: ['gondola', 'gondola', 'rowboat', 'barge'], awnings: ['cloth_red', 'cloth_white', 'cloth_ochre'],
    figures: F(['robe'], ['cloth_black', 'cloth_red', 'cloth_brown', 'cloth_indigo', 'cloth_white'], ['skin_light'], ['cap', 'veil', 'none']),
  },
  industrial: {
    door: [['lantern:iron', 0.7], ['barrel', 1.5], ['crates', 1.5], ['bench', 1], ['street_lamp', 0.4], ['pot:dark_pot', 0.5]],
    street: [['cart', 2], ['animal:horse', 1.5], ['street_lamp', 0.6], ['figure', 3], ['sacks', 0.6]],
    stall: ['produce', 'cloth', 'basket'], boats: ['barge', 'rowboat'], awnings: ['cloth_green', 'cloth_white', 'cloth_red'],
    figures: F(['trousers', 'robe'], ['cloth_black', 'cloth_grey', 'cloth_brown', 'cloth_indigo'], ['skin_light'], ['brim', 'brim', 'cap', 'none']),
  },
  modern: {
    door: [['street_lamp', 0.6], ['bench', 1], ['crates', 0.5]],
    street: [['car', 4], ['street_lamp', 2], ['bench', 0.8], ['figure', 3]],
    stall: ['produce', 'cloth'], boats: ['ferry', 'rowboat'], awnings: ['cloth_green', 'cloth_red', 'cloth_white'],
    figures: F(['trousers', 'robe'], ['cloth_black', 'cloth_grey', 'cloth_indigo', 'cloth_brown', 'cloth_red'], ['skin_light', 'skin_medium'], ['brim', 'none', 'none']),
  },
};
const KIT_OF = {
  athens: 'mediterranean', rome: 'mediterranean', constantinople: 'mediterranean', knossos: 'mediterranean', florence: 'europe_early_modern', venice: 'venice', 'baroque-rome': 'europe_early_modern',
  jerusalem: 'near_east', petra: 'near_east', ur: 'near_east', babylon: 'near_east', persepolis: 'near_east', isfahan: 'near_east', 'mamluk-cairo': 'near_east', 'ottoman-istanbul': 'near_east', granada: 'near_east',
  giza: 'egypt', edfu: 'egypt',
  'tang-wutai': 'east_asia', 'song-kaifeng': 'east_asia', 'song-hangzhou': 'east_asia', 'ming-suzhou': 'east_asia', 'qing-beijing': 'east_asia', 'joseon-seoul': 'east_asia', lhasa: 'east_asia',
  'heian-uji': 'japan', nara: 'japan', 'edo-himeji': 'japan',
  sanchi: 'south_asia', madurai: 'south_asia', khajuraho: 'south_asia', 'mughal-agra': 'south_asia',
  angkor: 'southeast_asia', borobudur: 'southeast_asia',
  paris: 'europe_medieval', conques: 'europe_medieval', amsterdam: 'europe_early_modern', versailles: 'europe_early_modern', muscovy: 'north', 'norse-borgund': 'north', stonehenge: 'north',
  'chichen-itza': 'americas', teotihuacan: 'americas', tenochtitlan: 'americas', taos: 'americas', cahokia: 'americas', 'machu-picchu': 'andes',
  djenne: 'africa', lalibela: 'africa', 'great-zimbabwe': 'africa', kilwa: 'africa',
  'rapa-nui': 'pacific', maori: 'pacific',
  london: 'industrial', barcelona: 'industrial', 'new-york': 'modern', sydney: 'modern',
};
// the great market squares (settlement coordinates), from each settlement's layout
const MARKETS = {
  isfahan: [[-70, -280, 70, 240]], athens: [[-285, -230, -165, -115]], 'mamluk-cairo': [[85, -75, 165, 115]], venice: [[-145, -35, 20, 25]],
  djenne: [[42, -43, 113, 43]], florence: [[5, 115, 105, 200]], paris: [[102, -38, 148, 38]], muscovy: [[-8, -140, 62, 110]], amsterdam: [], cahokia: [[-110, -35, 110, 145]],
};
// open places inside the landmarks where people gather (no stalls): forecourts, plazas, precincts
const PEOPLE = {
  rome: [[-40, -160, 40, -60]], 'chichen-itza': [[-150, -140, 170, 120]], teotihuacan: [[-70, -262, 70, -196], [-18, -190, 18, 380]], tenochtitlan: [[-145, -145, 145, 145]],
  babylon: [[-105, -55, 105, 145]], 'ottoman-istanbul': [[-70, -90, 70, 85]], ur: [[-48, -138, 48, -80]], london: [[-58, -213, 38, -152]],
  'qing-beijing': [], jerusalem: [[-145, -195, 145, 195, 14]], persepolis: [],
};
const MARKET = /square|piazza|plaza|market|agora|forum|maidan|bazaar|parvis|court|forecourt|street|dam|rows/i;
const FLAT = /paving|road|street|field|parterre|garden|park|lawn|water|cells|pavement|plaza|square|flag|carpet|bed\b|floor|ground|court\b|lamp/i;
const HOUSE = /house|hut|home|insula|siheyuan|hanok|machiya|compound|izba|shop|cottage|_block|skyscraper|dwelling/i;
const SKIP = /water|paving|park|wall|bridge|viaduct|wharf|fence|field|terrace|platform|road|street|canal|moat|ditch|bank|rim|pool|tank|lake|garden|parterre|ramp|stair|causeway|track|esplanade|precinct|enclosure|palisade|ring|circle|avenue|barrow|mound|cells/i;

/** The settlement's footprints on a half-metre grid, in settlement coordinates. */
class Grid {
  constructor(R, c = 0.5) { this.c = c; this.R = Math.ceil(R); this.n = Math.ceil(this.R * 2 / c); this.a = new Uint8Array(this.n * this.n); }
  cell(v) { return Math.floor((v + this.R) / this.c); }
  get(x, z) { const i = this.cell(x), j = this.cell(z); return i < 0 || j < 0 || i >= this.n || j >= this.n ? 1 : this.a[j * this.n + i]; }
  fill([x0, z0, x1, z1], v = 1) { const i0 = Math.max(0, this.cell(x0)), i1 = Math.min(this.n - 1, this.cell(x1)), j0 = Math.max(0, this.cell(z0)), j1 = Math.min(this.n - 1, this.cell(z1)); for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) this.a[j * this.n + i] = Math.max(this.a[j * this.n + i], v); }
  free([x0, z0, x1, z1]) { const i0 = this.cell(x0), i1 = this.cell(x1), j0 = this.cell(z0), j1 = this.cell(z1); if (i0 < 0 || j0 < 0 || i1 >= this.n || j1 >= this.n) return false; for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) if (this.a[j * this.n + i]) return false; return true; }
}
/** A plan's point (local x, z) in settlement coordinates (origin and quarter-turn yaw). */
function toSettle(plan, x, z) {
  const [ox, oz] = plan.origin ?? [0, 0], yaw = ((((plan.yaw ?? 0) % 360) + 360) % 360);
  const [rx, rz] = yaw === 90 ? [z, -x] : yaw === 180 ? [-x, -z] : yaw === 270 ? [-z, x] : [x, z];
  return [ox + rx, oz + rz];
}
const rectOf = (plan, [x0, z0, x1, z1]) => { const a = toSettle(plan, x0, z0), b = toSettle(plan, x1, z1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
// landmarks whose plan is the town itself (their elements are read like a townscape's)
const TOWN_LANDMARKS = new Set(['machu-picchu-town', 'taos-pueblo']);
const isFull = (plan, R) => TOWN_LANDMARKS.has(plan.id) || (plan.bounds && plan.bounds[2] - plan.bounds[0] >= R * 1.5);

/** The plans of a settlement's life, from its landmarks, its townscape and its ground. */
export function lifePlans(id, R, landmarks, town, G) {
  const kit = KITS[KIT_OF[id] ?? 'mediterranean'], rand = rng(hash(id)), grid = new Grid(R + 2), egrid = new Grid(R + 2), houses = [], squares = [];
  // every footprint: whole landmark bounds, the townscape's elements
  for (const plan of [...landmarks, ...town]) {
    if (!isFull(plan, R) && plan.bounds) grid.fill(rectOf(plan, plan.bounds).map((v, i) => v + (i < 2 ? -1 : 1)), 1);
    for (const room of plan.rooms ?? []) if (room.kind === 'open' && room.rect && MARKET.test(room.id ?? '')) squares.push({ rect: rectOf(plan, room.rect), y: room.y ?? 0 });
    const full = isFull(plan, R);
    for (const el of plan.elements ?? []) {
      let r = null;
      if (el.rect) r = rectOf(plan, el.rect);
      else if (el.c && el.a && el.b) { const [x, z] = toSettle(plan, el.c[0], el.c[1]), h = Math.max(el.a, el.b); r = [x - h, z - h, x + h, z + h]; }
      else if (el.c && (el.r || el.s)) { const h = (el.r ?? el.s / 2) + 0.5, [x, z] = toSettle(plan, el.c[0], el.c[1]); r = [x - h, z - h, x + h, z + h]; }
      else if (el.pts) { for (let i = 0; i + 1 < el.pts.length; i++) { const a = toSettle(plan, ...el.pts[i]), b = toSettle(plan, ...el.pts[i + 1]), L = Math.hypot(b[0] - a[0], b[1] - a[1]); for (let t = 0; t <= L; t += 1) { const x = a[0] + (b[0] - a[0]) * t / L, z = a[1] + (b[1] - a[1]) * t / L; egrid.fill([x - 3, z - 3, x + 3, z + 3]); if (full) grid.fill([x - 3, z - 3, x + 3, z + 3]); } } continue; }
      else if (el.a && el.b && !el.c) { const a = toSettle(plan, ...el.a), b = toSettle(plan, ...el.b), L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, th = (el.th ?? 1) / 2 + 0.5; for (let t = 0; t <= L; t += 0.5) { const x = a[0] + (b[0] - a[0]) * t / L, z = a[1] + (b[1] - a[1]) * t / L; egrid.fill([x - th, z - th, x + th, z + th]); } continue; }
      if (!r) continue;
      const w = r[2] - r[0], d = r[3] - r[1];
      if (w * d > R * R) continue;                                          // a water or ground sheet over the disc
      if (FLAT.test(el.t)) continue;
      egrid.fill([r[0] - 0.3, r[1] - 0.3, r[2] + 0.3, r[3] + 0.3]);
      if (!full) continue;
      grid.fill([r[0] - 0.3, r[1] - 0.3, r[2] + 0.3, r[3] + 0.3]);
      if ((HOUSE.test(el.t) || !SKIP.test(el.t)) && w * d >= 10 && w * d <= 6000 && w > 2 && d > 2) houses.push({ r, front: el.front, y: el.y });
    }
  }
  // the landmarks' paved floors (forecourts, plazas raised a little): figures and stalls stand on them
  const floors = [];
  if (MARKETS[id]?.length || PEOPLE[id]?.length) for (const plan of landmarks) { try { for (const f of buildPlan(plan).colliders.floors) if (f.y1 === undefined) floors.push(f); } catch (e) { /* a plan that cannot build here keeps the ground */ } }
  const ground = (x, z) => G.height(x, z);
  const H = (x, z) => { const g = ground(x, z); let y = g; for (const f of floors) { const r = f.rect; if (x >= r[0] && x <= r[2] && z >= r[1] && z <= r[3] && f.y > y && f.y < g + 2.5) y = f.y; } return y; };
  const wet = (x, z) => { const l = G.waterLevel(x, z); return Number.isFinite(l) && ground(x, z) < l + 0.05; };
  const flat = (x, z, s = 1.2) => Math.abs(H(x + s, z) - H(x - s, z)) < 0.5 && Math.abs(H(x, z + s) - H(x, z - s)) < 0.5;
  const inside = (x, z, m = 30) => Math.hypot(x, z) < R - m;
  const els = [];
  const put = (kindSpec, x, z, rot, extra = {}) => {
    const [t, sub] = kindSpec.split(':');
    if (!LIFE_KINDS.includes(t)) return;
    const el = { t, at: [x, z], y: H(x, z), rot, seed: Math.floor(rand() * 1e9), ...extra };
    if (sub) el.kind = sub;
    if (t === 'car' || t === 'cart' || t === 'stall') el.rot = Math.round(rot / (Math.PI / 2)) * Math.PI / 2 + (t === 'cart' ? (rand() - 0.5) * 0.3 : 0);   // along the street's axes
    if (t === 'car') el.era = id === 'sydney' ? 1970 : 1930;
    if (t === 'figure') { Object.assign(el, dressed(kit, rand)); if (extra.pose) el.carry = 'none'; }
    els.push(el);
  };
  const sz = (t) => ({ cart: 2.2, stall: 2.2, animal: 1.4, haystack: 1.6, car: 2.6, laundry: 1.8, well: 1, figure: 0.5, bench: 1, firewood: 1, crates: 0.8, ladder: 0.5, street_lamp: 0.4 }[t.split(':')[0]] ?? 0.6);
  const tryPut = (spec, x, z, rot, extra, k = 1) => {
    const s = sz(spec) * k, box = [x - s, z - s, x + s, z + s];
    if (!inside(x, z) || !grid.free(box) || wet(x, z) || !flat(x, z, s)) return false;
    put(spec, x, z, rot, extra); grid.fill(box, 2); return true;
  };
  // by the doors
  const sides = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] };
  for (const h of houses) {
    if (rand() > 0.45) continue;
    const [x0, z0, x1, z1] = h.r, order = sides[h.front] ? [h.front, ...'nsew'.replace(h.front, '')] : [...'nsew'].sort(() => rand() - 0.5);
    const n = 1 + Math.floor(rand() * 2);
    for (let k = 0; k < n; k++) {
      const [spec] = pick(rand, kit.door), t = 0.15 + rand() * 0.7;
      for (const f of order) {
        const [nx, nz] = sides[f], off = 0.25 + sz(spec) * 0.7 + rand() * 0.2;
        const x = nx ? (nx > 0 ? x1 + off : x0 - off) : x0 + (x1 - x0) * t, z = nz ? (nz > 0 ? z1 + off : z0 - off) : z0 + (z1 - z0) * t;
        if (tryPut(spec, x, z, nx ? Math.PI / 2 : 0, {}, 0.7)) {
          // someone sitting on the bench, or squatting at the pots and baskets
          if (spec === 'bench' && rand() < 0.45) put('figure', x, z, (nx ? Math.PI / 2 : 0) + (nx > 0 || nz > 0 ? Math.PI : 0), { pose: 'sit' });
          else if (/^pot|^basket/.test(spec) && rand() < 0.18) { const ox = nx ? nx * 0.9 : 0.9, oz = nz ? nz * 0.9 : 0; tryPut('figure', x + ox, z + oz, Math.atan2(ox, oz), { pose: 'squat' }); }
          break;
        }
      }
    }
  }
  // in the streets: free ground near houses
  const area = houses.reduce((a, h) => a + Math.min(1200, (h.r[2] - h.r[0]) * (h.r[3] - h.r[1])), 0), nStreet = Math.min(900, Math.round(area / 200));
  for (let k = 0, tries = 0; k < nStreet && tries < nStreet * 12; tries++) {
    const h = houses[Math.floor(rand() * houses.length)];
    if (!h) break;
    const [x0, z0, x1, z1] = h.r, a = rand() * 6.28, d = 3 + rand() * 6, cx = (x0 + x1) / 2 + Math.cos(a) * ((x1 - x0) / 2 + d), cz = (z0 + z1) / 2 + Math.sin(a) * ((z1 - z0) / 2 + d);
    const [spec] = pick(rand, rand() < 0.35 ? kit.door : kit.street);
    if (spec === 'figure' && rand() < 0.45) {
      // a knot of two or three talking, facing each other
      const n = 2 + (rand() < 0.35 ? 1 : 0), a0 = rand() * 6.28;
      let ok = 0;
      for (let q = 0; q < n; q++) { const a = a0 + q * 6.28 / n, x = cx + Math.cos(a) * 0.55, z = cz + Math.sin(a) * 0.55; if (tryPut('figure', x, z, Math.atan2(x - cx, z - cz), { pose: q === 0 ? 'talk' : 'stand' }, 0.5)) ok++; }
      if (ok) k++;
    } else if (kit.stall.length && rand() < 0.07) {
      // a stall set out in the street, facing the way
      if (tryPut('stall', cx, cz, Math.round(rand() * 4) * Math.PI / 2, { awning: kit.awnings[Math.floor(rand() * kit.awnings.length)], goods: kit.stall })) k++;
    } else if (tryPut(spec, cx, cz, rand() * 6.28)) k++;
  }
  // the market squares: stalls along their edges, figures among them
  for (const sq of squares) {
    const [x0, z0, x1, z1] = sq.rect, per = 2 * (x1 - x0 + z1 - z0);
    if (!kit.stall.length || per < 40) continue;
    const n = Math.min(40, Math.floor(per / 14));
    for (let k = 0; k < n; k++) {
      let u = rand() * per, x, z, rot;
      if (u < x1 - x0) { x = x0 + u; z = z0 + 4; rot = Math.PI; } else if ((u -= x1 - x0) < z1 - z0) { x = x1 - 4; z = z0 + u; rot = -Math.PI / 2; } else if ((u -= z1 - z0) < x1 - x0) { x = x0 + u; z = z1 - 4; rot = 0; } else { u -= x1 - x0; x = x0 + 4; z = z0 + u; rot = Math.PI / 2; }
      const s = 2.2, box = [x - s, z - s, x + s, z + s];
      if (!inside(x, z, 20) || !grid.free(box) || wet(x, z) || !flat(x, z, 1.6)) continue;
      els.push({ t: 'stall', at: [x, z], y: H(x, z), rot, seed: Math.floor(rand() * 1e9), awning: kit.awnings[Math.floor(rand() * kit.awnings.length)], goods: kit.stall });
      grid.fill(box, 2);
      // the seller squatting by the stall, a customer in front
      if (rand() < 0.6) tryPut('figure', x - Math.cos(rot) * 1.9, z + Math.sin(rot) * 1.9, rot + Math.PI, { pose: 'squat' }, 0.5);
      if (rand() < 0.7) tryPut('figure', x + Math.sin(rot) * 2.4, z + Math.cos(rot) * 2.4, rot + Math.PI, { pose: rand() < 0.5 ? 'talk' : 'stand' });
    }
    for (let k = 0; k < 12; k++) tryPut('figure', x0 + 8 + rand() * (x1 - x0 - 16), z0 + 8 + rand() * (z1 - z0 - 16), rand() * 6.28);
  }
  // the great market squares: rows of stalls with aisles between, buyers and sellers among them
  for (const [x0, z0, x1, z1] of MARKETS[id] ?? []) {
    if (!kit.stall.length) break;
    let n = 0;
    const cand = [];
    for (let z = z0 + 5; z < z1 - 4; z += 9) for (let x = x0 + 4 + (Math.floor(z) % 2) * 3; x < x1 - 4; x += 6.5) cand.push([x, z]);
    for (let i = cand.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [cand[i], cand[j]] = [cand[j], cand[i]]; }
    const cap = Math.max(25, Math.min(180, Math.round((x1 - x0) * (z1 - z0) / 380)));
    for (const [x, z] of cand) {
      if (n >= cap) break;
      const px = x + (rand() - 0.5) * 1.5, pz = z + (rand() - 0.5) * 1.5, rot = (Math.floor((z - z0) / 9) % 2) * Math.PI, b = [px - 1.8, pz - 1.4, px + 1.8, pz + 1.4];
      if (!inside(px, pz, 20) || !egrid.free(b) || !grid.free(b) && false || wet(px, pz) || !flat(px, pz, 1.6)) continue;
      els.push({ t: 'stall', at: [px, pz], y: H(px, pz), rot, seed: Math.floor(rand() * 1e9), awning: kit.awnings[Math.floor(rand() * kit.awnings.length)], goods: kit.stall });
      egrid.fill(b, 2); grid.fill(b, 2); n++;
      if (rand() < 0.5) { const fx = px - Math.cos(rot) * 1.9, fz = pz + Math.sin(rot) * 1.9; if (egrid.free([fx - 0.3, fz - 0.3, fx + 0.3, fz + 0.3])) { put('figure', fx, fz, rot + Math.PI, { pose: 'squat' }); egrid.fill([fx - 0.3, fz - 0.3, fx + 0.3, fz + 0.3], 2); } }
      for (let q = 0; q < 2; q++) if (rand() < 0.6) { const fx = px + (rand() - 0.5) * 3, fz = pz + Math.cos(rot) * (2.6 + rand() * 1.2), bb = [fx - 0.35, fz - 0.35, fx + 0.35, fz + 0.35]; if (egrid.free(bb)) { put('figure', fx, fz, rot + Math.PI + (rand() - 0.5), { pose: rand() < 0.4 ? 'talk' : 'stand' }); egrid.fill(bb, 2); } }
    }
  }
  // people in the open places of the landmarks: knots talking, some walking with loads
  for (const [x0, z0, x1, z1, yOver] of PEOPLE[id] ?? []) {
    const cap = Math.max(10, Math.min(70, Math.round((x1 - x0) * (z1 - z0) / 300)));
    for (let k = 0, tries = 0; k < cap && tries < cap * 8; tries++) {
      const cx = x0 + rand() * (x1 - x0), cz = z0 + rand() * (z1 - z0);
      if (!inside(cx, cz, 20) || (yOver === undefined && wet(cx, cz))) continue;
      const n = rand() < 0.55 ? 2 + (rand() < 0.4 ? 1 : 0) : 1, a0 = rand() * 6.28;
      for (let q = 0; q < n; q++) {
        const a = a0 + q * 6.28 / n, r = n > 1 ? 0.55 : 0, x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r, b = [x - 0.35, z - 0.35, x + 0.35, z + 0.35];
        if (!egrid.free(b) || (yOver === undefined && !flat(x, z, 0.5))) continue;
        put('figure', x, z, n > 1 ? Math.atan2(x - cx, z - cz) : rand() * 6.28, { ...(n > 1 ? { pose: q === 0 ? 'talk' : 'stand' } : {}), ...(yOver !== undefined ? { y: yOver } : {}) });
        egrid.fill(b, 2); k++;
      }
    }
  }
  // boats along the shores
  if (kit.boats.length) {
    let nb = 0;
    for (let tries = 0; tries < 4000 && nb < 60; tries++) {
      const a = rand() * 6.28, r = Math.sqrt(rand()) * (R - 40), x = Math.cos(a) * r, z = Math.sin(a) * r;
      if (!wet(x, z)) continue;
      // near the shore: land within 7 m in some direction; lie along the shore
      let land = null;
      for (let q = 0; q < 8 && !land; q++) { const b = q / 8 * 6.28; if (!wet(x + Math.cos(b) * 7, z + Math.sin(b) * 7)) land = b; }
      if (land === null && rand() > 0.08) continue;
      const kind = kit.boats[Math.floor(rand() * kit.boats.length)], len = { dhow: 13, barge: 12, ferry: 22, gondola: 10.8, sampan: 7, canoe: 6 }[kind] ?? 4.5;
      const box = [x - len / 2, z - len / 2, x + len / 2, z + len / 2];
      if (!grid.free(box)) continue;
      let ok = true;
      for (const t of [-0.5, 0.5]) { const rot = land === null ? a : land + Math.PI / 2, px = x - Math.sin(rot) * len * t, pz = z - Math.cos(rot) * len * t; if (!wet(px, pz)) ok = false; }
      if (!ok) continue;
      els.push({ t: 'boat', kind, at: [x, z], y: G.waterLevel(x, z) - 0.25, rot: land === null ? a : land + Math.PI / 2, seed: Math.floor(rand() * 1e9) });
      grid.fill(box, 2); nb++;
    }
  }
  // as plans of a few hundred objects each
  // as plans of one 100 m tile each, so that what is out of view or far is not drawn
  const tiles = new Map();
  for (const e of els) { const k = `${Math.floor(e.at[0] / 100)},${Math.floor(e.at[1] / 100)}`; if (!tiles.has(k)) tiles.set(k, []); tiles.get(k).push(e); }
  const plans = [];
  for (const [k, list] of tiles) { const [i, j] = k.split(',').map(Number); plans.push({ id: `${id}-life-${k}`, center: [i * 100 + 50, j * 100 + 50], near: 230, style: 'life', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: list, rooms: [], bounds: [-R, -R, R, R], entrance: { at: [0, 0], facing: 'n' } }); }
  return plans;
}
function dressed(kit, rand) {
  const f = kit.figures, c = (l) => l[Math.floor(rand() * l.length)];
  return { dress: c(f.dress), cloth: c(f.cloths), cloth2: c(f.cloths), skin: c(f.skin), hat: c(f.hats), carry: f.carry ? c(f.carry) : 'none' };
}

const DONE = new Map();
/** The settlement's module with its life added to its townscape. */
export function withLife(id, mod, G, R) {
  if (DONE.has(id)) return DONE.get(id);
  const out = { ...mod, town: async () => { const town = await mod.town(); return [...town, ...lifePlans(id, R, mod.landmarks.map((l) => l.plan), town, G)]; } };
  let cached = null;
  const once = { ...out, town: () => (cached ??= out.town()) };
  DONE.set(id, once);
  return once;
}
