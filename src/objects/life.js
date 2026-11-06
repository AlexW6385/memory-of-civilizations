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
    fronts: [['laundry_pole', 1, 2], ['shop_sign:board', 0.4, 1]],
    door: [['lantern:oil', 0.7], ['pot:amphora', 3], ['pot:pithos', 1], ['basket', 2], ['bench', 1.5], ['firewood', 1], ['ladder', 0.6], ['laundry', 0.8]],
    street: [['cart', 1], ['animal:donkey', 2], ['animal:goat', 1], ['animal:dog', 0.6], ['chickens', 0.8], ['sacks', 1], ['figure', 2.5]],
    stall: ['pot:amphora', 'basket', 'produce', 'cloth'], boats: ['rowboat'], awnings: ['cloth_white', 'cloth_ochre', 'cloth_red'],
    figures: F(['robe', 'tunic'], ['cloth_white', 'cloth_ochre', 'cloth_brown', 'cloth_red', 'cloth_indigo'], ['skin_medium', 'skin_light'], ['none', 'none', 'veil', 'cap'], { hair: ['short', 'short', 'bun', 'long'], beard: 0.5, over: ['cape', 'sash', 'none', 'cape'], hairs: [['hide_black', 0.7], ['hide_brown', 0.7]] }),
  },
  near_east: {
    fronts: [['hang_lantern:white', 0.25, 1], ['laundry_pole', 0.5, 2]],
    door: [['lantern:oil', 0.7], ['pot:water_pot', 3], ['pot:pithos', 1], ['basket', 2], ['sacks', 1], ['bench', 1], ['laundry', 0.6]],
    street: [['animal:donkey', 2.5], ['animal:camel', 1.2], ['animal:goat', 1.2], ['animal:sheep', 0.8], ['chickens', 0.6], ['sacks', 1], ['figure', 2.5]],
    stall: ['pot:water_pot', 'basket', 'produce', 'cloth'], boats: ['dhow', 'reed'], awnings: ['cloth_white', 'cloth_ochre', 'cloth_indigo'],
    figures: F(['robe'], ['cloth_white', 'cloth_ochre', 'cloth_brown', 'cloth_indigo', 'cloth_black'], ['skin_medium', 'skin_dark'], ['turban', 'veil', 'veil', 'none'], { hair: ['short', 'long'], beard: 0.65, over: ['sash', 'cape', 'none', 'sash'] }),
  },
  egypt: {
    door: [['lantern:oil', 0.7], ['pot:water_pot', 3], ['pot:dark_pot', 1.5], ['basket', 2], ['sacks', 1], ['firewood', 0.4]],
    street: [['animal:donkey', 2], ['animal:ox', 1], ['animal:goat', 1.2], ['chickens', 0.5], ['sacks', 1.2], ['figure', 2.5]],
    stall: ['pot:water_pot', 'basket', 'produce'], boats: ['reed', 'barge'], awnings: ['cloth_white', 'reed_mat'],
    figures: F(['wrap', 'tunic'], ['cloth_white', 'cloth_white', 'linen'], ['skin_medium', 'skin_dark'], ['none', 'none', 'cap'], { hair: ['short', 'long', 'short'], beard: 0, feet: 'bare', over: ['sash', 'none'] }),
  },
  east_asia: {
    fronts: [['hang_lantern:paper', 1.4, 1], ['shop_sign', 1, 1], ['laundry_pole', 1, 2]],
    door: [['lantern:paper', 1.6], ['pot:glazed_jar', 3], ['pot:blue_jar', 1], ['basket', 2.5], ['firewood', 1.5], ['bench', 1.2], ['laundry', 1], ['ladder', 0.5]],
    street: [['barrow', 1.5], ['cart', 0.6], ['animal:ox', 0.8], ['animal:buffalo', 0.5], ['animal:dog', 0.6], ['chickens', 0.8], ['sacks', 0.6], ['figure', 3]],
    stall: ['pot:glazed_jar', 'basket', 'produce', 'cloth'], boats: ['sampan'], awnings: ['cloth_indigo', 'reed_mat', 'cloth_white'],
    figures: F(['robe', 'trousers'], ['cloth_indigo', 'cloth_grey', 'cloth_brown', 'cloth_white', 'cloth_black'], ['skin_light', 'skin_medium'], ['straw', 'cap', 'none', 'none'], { carry: ['pole', 'basket', 'none', 'none'] , hair: ['bun', 'bun', 'short'], beard: 0.12, over: ['collar', 'collar', 'sash'] }),
  },
  tibet: {
    door: [['lantern:oil', 0.4], ['firewood', 1.5], ['basket', 2], ['pot:dark_pot', 1.5], ['sacks', 1]],
    street: [['animal:yak', 3], ['animal:goat', 1], ['animal:sheep', 1.2], ['animal:dog', 0.8], ['sacks', 0.8], ['figure', 3]],
    stall: ['basket', 'cloth', 'produce', 'pot:dark_pot'], boats: [], awnings: ['cloth_red', 'cloth_ochre', 'cloth_white'],
    figures: F(['robe'], ['cloth_brown', 'cloth_red', 'cloth_black', 'cloth_ochre', 'cloth_grey'], ['skin_medium', 'skin_dark'], ['cap', 'none', 'brim', 'none'], { hair: ['long', 'bun', 'short'], beard: 0.1, over: ['sash', 'sash', 'collar'] }),
  },
  japan: {
    fronts: [['hang_lantern:white', 1, 1], ['shop_sign', 0.7, 1]],
    door: [['lantern:white', 1.6], ['pot:dark_pot', 2], ['basket', 2.5], ['firewood', 1.5], ['bench', 1.5], ['ladder', 0.5]],
    street: [['barrow', 0.4], ['cart', 0.5], ['animal:ox', 0.7], ['animal:horse', 0.5], ['animal:dog', 0.5], ['figure', 3]],
    stall: ['basket', 'produce', 'cloth', 'pot:dark_pot'], boats: ['sampan', 'rowboat'], awnings: ['cloth_indigo', 'reed_mat'],
    figures: F(['robe'], ['cloth_indigo', 'cloth_grey', 'cloth_brown', 'cloth_black', 'cloth_white'], ['skin_light'], ['straw', 'none', 'none'], { carry: ['pole', 'none', 'none'] , hair: ['bun', 'bun', 'short'], beard: 0.05, over: ['collar', 'collar', 'sash'] }),
  },
  south_asia: {
    fronts: [['laundry_pole', 0.8, 2], ['hang_lantern:white', 0.4, 1]],
    door: [['lantern:oil', 0.7], ['pot:water_pot', 3.5], ['basket', 2], ['firewood', 0.8], ['bench', 0.8], ['laundry', 1]],
    street: [['cart', 1.2], ['animal:zebu', 2.2], ['animal:buffalo', 0.8], ['animal:goat', 1], ['animal:dog', 0.6], ['figure', 3]],
    stall: ['pot:water_pot', 'basket', 'produce', 'cloth'], boats: ['rowboat'], awnings: ['cloth_red', 'cloth_ochre', 'cloth_white'],
    figures: F(['wrap', 'robe'], ['cloth_white', 'cloth_red', 'cloth_ochre', 'cloth_green', 'cloth_indigo'], ['skin_medium', 'skin_dark'], ['turban', 'veil', 'none'], { carry: ['pot', 'none', 'none'] , hair: ['bun', 'long', 'short'], beard: 0.4, feet: 'bare', over: ['shawl', 'sash', 'none'] }),
  },
  southeast_asia: {
    door: [['lantern:oil', 0.7], ['pot:dark_pot', 2.5], ['basket', 3], ['firewood', 1], ['ladder', 1]],
    street: [['cart', 1], ['animal:buffalo', 1.5], ['animal:zebu', 1], ['chickens', 1.2], ['animal:pig', 0.6], ['figure', 2.5]],
    stall: ['basket', 'produce', 'pot:dark_pot'], boats: ['canoe', 'sampan'], awnings: ['reed_mat', 'cloth_ochre'],
    figures: F(['wrap'], ['cloth_ochre', 'cloth_red', 'cloth_brown', 'cloth_white'], ['skin_medium', 'skin_dark'], ['none', 'none', 'cap'], { carry: ['pole', 'basket', 'none'] , hair: ['bun', 'long', 'short'], beard: 0.05, feet: 'bare' }),
  },
  europe_medieval: {
    fronts: [['shop_sign:board', 1, 1], ['laundry_pole', 0.4, 2]],
    door: [['lantern:iron', 0.7], ['barrel', 2], ['crates', 1], ['firewood', 2], ['bench', 1.2], ['ladder', 0.8], ['laundry', 0.8], ['basket', 1]],
    street: [['cart', 2], ['animal:horse', 1.2], ['animal:pig', 0.8], ['animal:dog', 0.6], ['chickens', 1], ['sacks', 1], ['barrel', 1], ['figure', 2.5]],
    stall: ['basket', 'produce', 'cloth', 'pot:dark_pot'], boats: ['rowboat', 'barge'], awnings: ['cloth_red', 'cloth_white', 'cloth_green', 'cloth_ochre'],
    figures: F(['robe', 'tunic'], ['cloth_brown', 'cloth_grey', 'cloth_red', 'cloth_green', 'cloth_indigo', 'cloth_white'], ['skin_light'], ['cap', 'none', 'veil', 'brim'], { hair: ['short', 'short', 'long'], beard: 0.35, legs: 'hose', over: ['cape', 'sash', 'none', 'none'], hairs: [['hide_black', 0.7], ['hide_brown', 0.75], ['hide_brown', 0.6], ['hide_tan', 0.8]] }),
  },
  europe_early_modern: {
    fronts: [['shop_sign:board', 1, 1], ['laundry_pole', 0.5, 2]],
    door: [['lantern:iron', 0.7], ['barrel', 2], ['crates', 1.5], ['bench', 1.5], ['firewood', 0.8], ['ladder', 0.5], ['basket', 1]],
    street: [['cart', 2], ['animal:horse', 1.5], ['animal:dog', 0.6], ['barrel', 1], ['sacks', 0.8], ['figure', 3]],
    stall: ['basket', 'produce', 'cloth'], boats: ['rowboat', 'barge'], awnings: ['cloth_white', 'cloth_red', 'cloth_green'],
    figures: F(['robe', 'trousers'], ['cloth_black', 'cloth_brown', 'cloth_red', 'cloth_indigo', 'cloth_grey'], ['skin_light'], ['brim', 'cap', 'none', 'veil'], { hair: ['short', 'long', 'short'], beard: 0.15, legs: 'hose', over: ['cape', 'none', 'sash', 'cape'], hairs: [['hide_black', 0.7], ['hide_brown', 0.75], ['hide_brown', 0.6], ['hide_tan', 0.8]] }),
  },
  americas: {
    door: [['pot:dark_pot', 2.5], ['pot:water_pot', 1.5], ['basket', 2.5], ['firewood', 1], ['ladder', 0.6]],
    street: [['animal:dog', 1.2], ['chickens', 0.6], ['basket', 1], ['pot:dark_pot', 1], ['figure', 3]],
    stall: ['basket', 'produce', 'pot:dark_pot', 'cloth'], boats: ['canoe'], awnings: ['cloth_white', 'reed_mat'],
    figures: F(['wrap', 'tunic'], ['cloth_white', 'cloth_ochre', 'cloth_red', 'cloth_brown'], ['skin_medium', 'skin_dark'], ['none', 'none', 'cap'], { carry: ['basket', 'pot', 'none', 'none'] , hair: ['long', 'bun', 'short'], beard: 0, feet: 'bare', over: ['sash', 'none'] }),
  },
  andes: {
    door: [['pot:dark_pot', 2], ['basket', 2], ['firewood', 1]],
    street: [['animal:llama', 3], ['animal:dog', 0.4], ['figure', 2.5]],
    stall: ['basket', 'produce', 'cloth'], boats: [], awnings: ['cloth_red'],
    figures: F(['tunic', 'wrap'], ['cloth_red', 'cloth_ochre', 'cloth_brown', 'cloth_black'], ['skin_medium'], ['cap', 'none'], { hair: ['short', 'long'], beard: 0, over: ['none'] }),
  },
  africa: {
    door: [['lantern:oil', 0.7], ['pot:water_pot', 3], ['pot:dark_pot', 2], ['basket', 2.5], ['firewood', 1]],
    street: [['animal:goat', 2], ['animal:zebu', 1], ['animal:sheep', 0.8], ['chickens', 1], ['animal:donkey', 0.6], ['figure', 3]],
    stall: ['pot:water_pot', 'basket', 'produce', 'cloth'], boats: ['canoe', 'dhow'], awnings: ['cloth_white', 'reed_mat', 'cloth_indigo'],
    figures: F(['wrap', 'robe'], ['cloth_white', 'cloth_indigo', 'cloth_ochre', 'cloth_red'], ['skin_dark'], ['none', 'turban', 'veil'], { carry: ['pot', 'basket', 'none'] , hair: ['short', 'short', 'bun'], beard: 0.3, feet: 'bare', over: ['shawl', 'sash', 'none'] }),
  },
  pacific: {
    door: [['basket', 3], ['firewood', 1.5], ['pot:dark_pot', 0.2]],
    street: [['chickens', 1.2], ['animal:dog', 0.6], ['basket', 1], ['figure', 2.5]],
    stall: [], boats: ['canoe'], awnings: [],
    figures: F(['wrap'], ['cloth_brown', 'cloth_ochre', 'hide_tan'], ['skin_medium', 'skin_dark'], ['none'], { hair: ['bun', 'long', 'short'], beard: 0.3, feet: 'bare', over: ['none'] }),
  },
  north: {
    door: [['lantern:iron', 0.7], ['firewood', 3], ['barrel', 1.5], ['basket', 1], ['bench', 1], ['ladder', 0.5]],
    street: [['cart', 1], ['animal:horse', 1], ['animal:sheep', 1.5], ['animal:goat', 0.8], ['haystack', 1.2], ['animal:dog', 0.5], ['figure', 2]],
    stall: ['basket', 'produce', 'cloth'], boats: ['rowboat'], awnings: ['cloth_red', 'cloth_white'],
    figures: F(['robe', 'tunic'], ['cloth_brown', 'cloth_grey', 'cloth_red', 'cloth_white', 'cloth_indigo'], ['skin_light'], ['cap', 'none', 'veil'], { hair: ['short', 'long', 'long'], beard: 0.5, legs: 'hose', over: ['cape', 'sash', 'none'], hairs: [['hide_tan', 0.9], ['hide_brown', 0.75], ['hide_tan', 1.05], ['hide_black', 0.7]] }),
  },
  venice: {
    fronts: [['laundry_pole', 1.2, 2], ['shop_sign:board', 0.5, 1]],
    door: [['lantern:iron', 0.7], ['barrel', 2], ['crates', 1.5], ['bench', 1], ['basket', 1], ['laundry', 1.2], ['pot:water_pot', 0.6]],
    street: [['barrel', 1], ['sacks', 1], ['crates', 0.8], ['animal:dog', 0.4], ['well', 0.3], ['figure', 4]],
    stall: ['basket', 'produce', 'cloth'], boats: ['gondola', 'gondola', 'rowboat', 'barge'], awnings: ['cloth_red', 'cloth_white', 'cloth_ochre'],
    figures: F(['robe'], ['cloth_black', 'cloth_red', 'cloth_brown', 'cloth_indigo', 'cloth_white'], ['skin_light'], ['cap', 'veil', 'none'], { hair: ['short', 'long'], beard: 0.2, legs: 'hose', over: ['cape', 'cape', 'none', 'sash'], hairs: [['hide_black', 0.7], ['hide_brown', 0.7]] }),
  },
  industrial: {
    fronts: [['shop_sign:board', 0.8, 1]],
    door: [['lantern:iron', 0.7], ['barrel', 1.5], ['crates', 1.5], ['bench', 1], ['street_lamp', 0.4], ['pot:dark_pot', 0.5]],
    street: [['cart', 2], ['animal:horse', 1.5], ['street_lamp', 0.6], ['figure', 3], ['sacks', 0.6]],
    stall: ['produce', 'cloth', 'basket'], boats: ['barge', 'rowboat'], awnings: ['cloth_green', 'cloth_white', 'cloth_red'],
    figures: F(['trousers', 'robe'], ['cloth_black', 'cloth_grey', 'cloth_brown', 'cloth_indigo'], ['skin_light'], ['brim', 'brim', 'cap', 'none'], { hair: ['short', 'short', 'bun'], beard: 0.4, over: ['none'], hairs: [['hide_black', 0.7], ['hide_brown', 0.75], ['hide_tan', 0.85], ['hide_grey', 1.1]] }),
  },
  modern: {
    door: [['street_lamp', 0.6], ['bench', 1], ['crates', 0.5]],
    street: [['car', 4], ['street_lamp', 2], ['bench', 0.8], ['figure', 3]],
    stall: ['produce', 'cloth'], boats: ['ferry', 'rowboat'], awnings: ['cloth_green', 'cloth_red', 'cloth_white'],
    figures: F(['trousers', 'robe'], ['cloth_black', 'cloth_grey', 'cloth_indigo', 'cloth_brown', 'cloth_red'], ['skin_light', 'skin_medium'], ['brim', 'none', 'none'], { hair: ['short', 'short', 'long'], beard: 0.1, over: ['none'], hairs: [['hide_black', 0.7], ['hide_brown', 0.75], ['hide_tan', 0.9], ['hide_grey', 1.1]] }),
  },
};
const KIT_OF = {
  athens: 'mediterranean', rome: 'mediterranean', constantinople: 'mediterranean', knossos: 'mediterranean', florence: 'europe_early_modern', venice: 'venice', 'baroque-rome': 'europe_early_modern',
  jerusalem: 'near_east', petra: 'near_east', ur: 'near_east', babylon: 'near_east', persepolis: 'near_east', isfahan: 'near_east', 'mamluk-cairo': 'near_east', 'ottoman-istanbul': 'near_east', granada: 'near_east',
  giza: 'egypt', edfu: 'egypt',
  'tang-wutai': 'east_asia', 'song-kaifeng': 'east_asia', 'song-hangzhou': 'east_asia', 'ming-suzhou': 'east_asia', 'qing-beijing': 'east_asia', 'joseon-seoul': 'east_asia', lhasa: 'tibet',
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
  giza: [[130, -100, 200, -70], [-120, 90, 120, 130], [300, 70, 350, 110]],
  edfu: [],
  angkor: [[-195, -4, -152, 4], [-148, -4, -80, 4], [-225, -70, -200, 70]],
  'qing-beijing': [[-40, 210, 40, 300], [-60, 128, 60, 172], [-70, 30, 70, 98]], jerusalem: [[-145, -195, 145, 195, 14]], persepolis: [],
};
const MARKET = /square|piazza|plaza|market|agora|forum|maidan|bazaar|parvis|street|dam|rows/i;     // (not courts: a palace's or a mosque's court has no stalls)
const FLAT = /paving|road|street|causeway|terrace|lane|sacbe|field|parterre|garden|park|lawn|water|cells|pavement|plaza|square|flag|carpet|bed\b|floor|ground|court\b|lamp/i;
const HOUSE = /house|hut|home|insula|siheyuan|hanok|machiya|compound|izba|shop|cottage|_block|skyscraper|dwelling/i;
const SKIP = /water|paving|park|wall|bridge|viaduct|wharf|fence|field|terrace|platform|road|street|canal|moat|ditch|bank|rim|pool|tank|lake|garden|parterre|ramp|stair|causeway|track|esplanade|precinct|enclosure|palisade|ring|circle|avenue|barrow|mound|cells/i;

/** The settlement's footprints on a half-metre grid, in settlement coordinates. */
class Grid {
  constructor(R, c = 0.5) { this.c = c; this.R = Math.ceil(R); this.n = Math.ceil(this.R * 2 / c); this.a = new Uint8Array(this.n * this.n); }
  cell(v) { return Math.floor((v + this.R) / this.c); }
  get(x, z) { const i = this.cell(x), j = this.cell(z); return i < 0 || j < 0 || i >= this.n || j >= this.n ? 1 : this.a[j * this.n + i]; }
  clear([x0, z0, x1, z1]) { const i0 = Math.max(0, this.cell(x0)), i1 = Math.min(this.n - 1, this.cell(x1)), j0 = Math.max(0, this.cell(z0)), j1 = Math.min(this.n - 1, this.cell(z1)); for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) this.a[j * this.n + i] = 0; }
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
const OWN_FRONTS = new Set(['ming-suzhou']);          // settlements that dress their own house fronts (their town.js)
const TOWN_LANDMARKS = new Set(['machu-picchu-town', 'taos-pueblo']);
const isFull = (plan, R) => TOWN_LANDMARKS.has(plan.id) || (plan.bounds && plan.bounds[2] - plan.bounds[0] >= R * 1.5);

/** The plans of a settlement's life, from its landmarks, its townscape and its ground. */
export function lifePlans(id, R, landmarks, town, G) {
  const kit = KITS[KIT_OF[id] ?? 'mediterranean'], rand = rng(hash(id)), grid = new Grid(R + 2), egrid = new Grid(R + 2), houses = [], squares = [], strollAreas = [];
  let lmSquare = false;
  // every footprint: whole landmark bounds, the townscape's elements
  for (const plan of [...landmarks, ...town]) {
    if (!isFull(plan, R) && plan.bounds) grid.fill(rectOf(plan, plan.bounds).map((v, i) => v + (i < 2 ? -1 : 1)), 1);
    for (const room of plan.rooms ?? []) {
      if (room.kind !== 'open' || !room.rect) continue;
      if (MARKET.test(room.id ?? '')) { squares.push({ rect: rectOf(plan, room.rect), y: room.y ?? 0 }); if (landmarks.includes(plan)) lmSquare = true; }
      // the other open places of a landmark (precincts, terraces, gardens, plazas): people about in them
      else if (landmarks.includes(plan)) strollAreas.push({ rect: rectOf(plan, room.rect), y: (room.y ?? 0) + (plan.base ?? 0), garden: /garden|parterre/i.test(room.id ?? ''), court: /court/i.test(room.id ?? '') });
    }
    const full = isFull(plan, R);
    // an element whose rectangle holds one of the plan's open rooms (a block round its court) is marked first,
    // then the room cleared again, so that people can stand in the court; the rest are marked after
    const open = (plan.rooms ?? []).filter((q) => q.kind === 'open' && q.rect).map((q) => rectOf(plan, q.rect));
    const holds = (el) => el.rect && open.some((o) => { const r = rectOf(plan, el.rect); return r[0] <= o[0] - 0.5 && r[1] <= o[1] - 0.5 && r[2] >= o[2] + 0.5 && r[3] >= o[3] + 0.5 && (r[2] - r[0]) * (r[3] - r[1]) < R * R; });
    const ordered = [...(plan.elements ?? [])].sort((a, b) => holds(b) - holds(a)), nHold = ordered.filter(holds).length;
    let seen = 0;
    for (const el of ordered) {
      if (seen++ === nHold && nHold) for (const o of open) { egrid.clear(o); if (full) grid.clear(o); }
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
      if ((HOUSE.test(el.t) || !SKIP.test(el.t)) && w * d >= 10 && w * d <= 6000 && w > 2 && d > 2) houses.push({ r, front: el.front, y: el.y, storeys: el.storeys ?? (el.h && el.h > 5 ? 2 : 1), shop: !!el.shop });
    }
  }
  // the landmarks' paved floors (forecourts, plazas raised a little): figures and stalls stand on them
  const floors = [], built = [];
  if (MARKETS[id]?.length || PEOPLE[id]?.length || lmSquare) for (const plan of landmarks) { try { const b = buildPlan(plan); built.push([plan, b]); for (const f of b.colliders.floors) if (f.y1 === undefined) floors.push(f); } catch (e) { /* a plan that cannot build here keeps the ground */ } }
  const ground = (x, z) => G.height(x, z);
  const H = (x, z) => { const g = ground(x, z); let y = g; for (const f of floors) { const r = f.rect; if (x >= r[0] && x <= r[2] && z >= r[1] && z <= r[3] && f.y > y && f.y < g + 2.5) y = f.y; } return y; };
  // what the landmarks really put on their open places (a chunkey yard's banks, a fountain's basin, a
  // statue's plinth: things wider than their plan rectangles): every triangle standing above the ground
  // or the floor within the market squares and the gathering places is marked taken
  const watch = [...squares.map((q) => q.rect), ...(MARKETS[id] ?? []), ...(PEOPLE[id] ?? [])];
  const W0 = watch.reduce((u, r) => [Math.min(u[0], r[0] - 3), Math.min(u[1], r[1] - 3), Math.max(u[2], r[2] + 3), Math.max(u[3], r[3] + 3)], [Infinity, Infinity, -Infinity, -Infinity]);
  const HN = Math.ceil(R + 30) * 2, hgrid = new Float32Array(HN * HN).fill(NaN);
  // the height under a point, on a one-metre lattice, cached
  const Hc = (x, z) => { const i = Math.floor(x + HN / 2), j = Math.floor(z + HN / 2); if (i < 0 || j < 0 || i >= HN || j >= HN) return H(x, z); let v = hgrid[j * HN + i]; if (v !== v) { v = H(i - HN / 2 + 0.5, j - HN / 2 + 0.5); hgrid[j * HN + i] = v; } return v; };
  // a coarse mask (4 m) of the watched places, widened by 10 m (a triangle is found by its first corner)
  const MR = Math.ceil(R + 30), MN = Math.ceil(MR * 2 / 4), mask = new Uint8Array(MN * MN);
  for (const r of watch) for (let j = Math.max(0, Math.floor((r[1] - 10 + MR) / 4)); j <= Math.min(MN - 1, Math.floor((r[3] + 10 + MR) / 4)); j++) for (let i = Math.max(0, Math.floor((r[0] - 10 + MR) / 4)); i <= Math.min(MN - 1, Math.floor((r[2] + 10 + MR) / 4)); i++) mask[j * MN + i] = 1;
  if (watch.length) for (const [plan, b] of built) {
    const [ox, oz] = plan.origin ?? [0, 0], a = -(plan.yaw ?? 0) * Math.PI / 180, c = Math.round(Math.cos(a)), sn = Math.round(Math.sin(a)), by = plan.base ?? 0;
    for (const part of b.parts) {
      if (!part.geometry.boundingBox) part.geometry.computeBoundingBox();
      const bb = part.geometry.boundingBox, qa = [ox + c * bb.min.x + sn * bb.min.z, oz - sn * bb.min.x + c * bb.min.z], qb = [ox + c * bb.max.x + sn * bb.max.z, oz - sn * bb.max.x + c * bb.max.z];
      if (Math.max(qa[0], qb[0]) < W0[0] - 10 || Math.min(qa[0], qb[0]) > W0[2] + 10 || Math.max(qa[1], qb[1]) < W0[1] - 10 || Math.min(qa[1], qb[1]) > W0[3] + 10) continue;
      const P = part.geometry.attributes.position.array;
      for (let i = 0; i < P.length; i += 9) {
        { const x = ox + c * P[i] + sn * P[i + 2], z = oz - sn * P[i] + c * P[i + 2], mi = Math.floor((x + MR) / 4), mj = Math.floor((z + MR) / 4); if (mi < 0 || mj < 0 || mi >= MN || mj >= MN || !mask[mj * MN + mi] || egrid.get(x, z)) continue; }
        let x0 = Infinity, z0 = Infinity, x1 = -Infinity, z1 = -Infinity;
        for (let k = 0; k < 9; k += 3) { const lx = P[i + k], lz = P[i + k + 2], x = ox + c * lx + sn * lz, z = oz - sn * lx + c * lz; if (x < x0) x0 = x; if (x > x1) x1 = x; if (z < z0) z0 = z; if (z > z1) z1 = z; }
        if (x1 < W0[0] || x0 > W0[2] || z1 < W0[1] || z0 > W0[3] || (x1 - x0) * (z1 - z0) > 400) continue;
        if (!watch.some((r) => x1 > r[0] - 3 && x0 < r[2] + 3 && z1 > r[1] - 3 && z0 < r[3] + 3)) continue;
        let up = false;
        for (let k = 0; k < 9 && !up; k += 3) { const lx = P[i + k], lz = P[i + k + 2], x = ox + c * lx + sn * lz, z = oz - sn * lx + c * lz; if (by + P[i + k + 1] > Hc(x, z) + 0.2) up = true; }
        if (up) { egrid.fill([x0 - 0.3, z0 - 0.3, x1 + 0.3, z1 + 0.3]); grid.fill([x0 - 0.3, z0 - 0.3, x1 + 0.3, z1 + 0.3]); }
      }
    }
  }
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
    if (t === 'cart') {
      // a wagon in the towns of wheeled traffic; a horse or a donkey in the shafts of some two-wheeled carts
      const k = KIT_OF[id] ?? 'mediterranean', heavy = /europe_early_modern|industrial/.test(k);
      if (heavy && rand() < 0.35) el.kind = 'four';
      else if (rand() < 0.4) { const b = /europe|north|industrial|venice/.test(k) ? 'horse' : /mediterranean|near_east|africa|east_asia|egypt/.test(k) ? 'donkey' : null; if (b) el.beast = b; }
    }
    if (t === 'figure') { Object.assign(el, dressed(kit, rand)); if (extra.pose) el.carry = 'none'; if (extra.carry) el.carry = extra.carry; if (extra.y !== undefined) el.y = extra.y; }
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
  // on the house fronts, above the street: lanterns under the eaves, shop signs out on brackets, washing on poles out of upper windows
  const fronted = [];
  if (kit.fronts?.length && !OWN_FRONTS.has(id)) for (const h of houses) {
    if (!sides[h.front] || rand() > (h.shop ? 0.7 : 0.25)) continue;
    const [x0, z0, x1, z1] = h.r, [nx, nz] = sides[h.front], L = nx ? z1 - z0 : x1 - x0, rot = Math.atan2(nx, nz), yb = h.y ?? H((x0 + x1) / 2, (z0 + z1) / 2);
    const P = (t, off) => (nx ? [(nx > 0 ? x1 : x0) + nx * off, z0 + (z1 - z0) * t] : [x0 + (x1 - x0) * t, (nz > 0 ? z1 : z0) + nz * off]);
    if (!inside(...P(0.5, 0)) || L < 3) continue;
    const opts = kit.fronts.filter(([, , ms]) => (h.storeys ?? 1) >= ms), tot = opts.reduce((a, o) => a + o[1], 0);
    let u = rand() * tot, spec = null; for (const o of opts) { if ((u -= o[1]) <= 0) { spec = o[0]; break; } }
    if (!spec) continue;
    const [t, sub] = spec.split(':'), seed = Math.floor(rand() * 1e9), sf = rand() < 0.5 ? 0.12 : 0.88, lf = 0.3 + rand() * 0.4;
    const spot = t === 'shop_sign' ? P(sf, 0) : t === 'laundry_pole' ? P(lf, 0) : P(0.5, 0);
    if (fronted.some((q) => Math.hypot(q[0] - spot[0], q[1] - spot[1]) < 3.2)) continue;
    fronted.push(spot);
    if (t === 'hang_lantern') for (const f of L > 6 && sub === 'paper' ? [0.3, 0.7] : [0.5]) els.push({ t, at: P(f, 0.25), y: yb + 2.75, rot, kind: sub, seed: 1 });
    else if (t === 'shop_sign') els.push({ t, at: P(sf, -0.05), y: yb, rot, h: sub === 'board' ? 3.1 : 2.75, board: sub === 'board', len: 1 + rand() * 0.6, cloth: sub === 'board' ? undefined : ['cloth_indigo', 'cloth_white', 'cloth_ochre', 'cloth_black'][Math.floor(rand() * 4)], seed });
    else if (t === 'laundry_pole') els.push({ t, at: P(lf, -0.05), y: yb + 4.1, rot, len: 1.3 + rand() * 0.5, prop: false, seed });
  }
  // crafts at the doors: a potter among his pots, a basket-maker, a dyer's cloth on lines, a carpenter's timber
  const CRAFT = { east_asia: ['potter', 'basket', 'dyer', 'carpenter'], japan: ['potter', 'basket', 'carpenter'], south_asia: ['potter', 'dyer', 'basket'], southeast_asia: ['potter', 'basket'], near_east: ['potter', 'dyer', 'carpenter'], egypt: ['potter', 'basket'], africa: ['potter', 'basket', 'dyer'], americas: ['potter', 'basket'], andes: ['potter', 'dyer'], mediterranean: ['potter', 'carpenter'], europe_medieval: ['carpenter', 'potter', 'cooper'], europe_early_modern: ['cooper', 'carpenter'], venice: ['cooper', 'carpenter'], north: ['carpenter'], pacific: ['basket'] }[KIT_OF[id] ?? 'mediterranean'] ?? [];
  if (CRAFT.length) for (const h of houses) {
    if (!sides[h.front] || rand() > 0.07) continue;
    const [x0, z0, x1, z1] = h.r, [nx, nz] = sides[h.front], t = 0.3 + rand() * 0.4, off = 1.6;
    const x = nx ? (nx > 0 ? x1 + off : x0 - off) : x0 + (x1 - x0) * t, z = nz ? (nz > 0 ? z1 + off : z0 - off) : z0 + (z1 - z0) * t, b = [x - 1.4, z - 1.4, x + 1.4, z + 1.4];
    if (!inside(x, z) || !grid.free(b) || wet(x, z) || !flat(x, z, 1.2)) continue;
    const face = Math.atan2(nx, nz) + Math.PI, ux = nz, uz = -nx, craft = CRAFT[Math.floor(rand() * CRAFT.length)];
    const P = (u, v) => [x + ux * u + nx * v, z + uz * u + nz * v];
    if (craft === 'potter') { put('figure', ...P(0, 0), face, { pose: 'squat' }); for (let q = 0; q < 5; q++) put('pot:' + ['water_pot', 'dark_pot', 'water_pot', 'amphora'][q % 4], ...P(-1.1 + q * 0.5, (q % 2) * 0.5 - 0.3), rand() * 6.28); put('pot:pithos', ...P(1.2, 0.4), 0); }
    else if (craft === 'basket') { put('figure', ...P(0, 0), face, { pose: 'sit' }); for (let q = 0; q < 4; q++) put('basket', ...P(-1 + q * 0.6, -0.5 + (q % 2) * 0.4), rand() * 6.28); }
    else if (craft === 'dyer') { put('laundry', ...P(0, 0.3), face + Math.PI / 2); put('pot:dark_pot', ...P(-1.1, -0.6), 0); put('figure', ...P(0.9, -0.6), face + 0.8, { pose: 'stand' }); }
    else if (craft === 'carpenter') { put('firewood', ...P(-0.9, 0), face); put('ladder', ...P(1.1, 0.4), face); put('figure', ...P(0.2, -0.4), face, { pose: 'squat' }); }
    else if (craft === 'cooper') { for (let q = 0; q < 4; q++) put('barrel', ...P(-1 + q * 0.65, (q % 2) * 0.4), rand() * 6.28); put('figure', ...P(0.3, -0.7), face, { pose: 'stand' }); }
    grid.fill(b, 2);
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
      if (u < x1 - x0) { x = x0 + u; z = z0 + 4; rot = 0; } else if ((u -= x1 - x0) < z1 - z0) { x = x1 - 4; z = z0 + u; rot = -Math.PI / 2; } else if ((u -= z1 - z0) < x1 - x0) { x = x0 + u; z = z1 - 4; rot = Math.PI; } else { u -= x1 - x0; x = x0 + 4; z = z0 + u; rot = Math.PI / 2; }
      const s = 2.2, box = [x - s, z - s, x + s, z + s];
      if (!inside(x, z, 20) || !grid.free(box) || !egrid.free(box) || wet(x, z) || !flat(x, z, 1.6)) continue;
      els.push({ t: 'stall', at: [x, z], y: H(x, z), rot, seed: Math.floor(rand() * 1e9), awning: kit.awnings[Math.floor(rand() * kit.awnings.length)], goods: kit.stall });
      grid.fill(box, 2); egrid.fill(box, 2);
      // the seller squatting by the stall, a customer in front
      if (rand() < 0.75) put('figure', x - Math.sin(rot) * 1.55, z - Math.cos(rot) * 1.55, rot + Math.PI + (rand() - 0.5) * 0.4, { pose: rand() < 0.25 ? 'squat' : rand() < 0.5 ? 'talk' : 'stand' });
      if (rand() < 0.7) tryPut('figure', x + Math.sin(rot) * 2.4, z + Math.cos(rot) * 2.4, rot + (rand() - 0.5) * 0.6, { pose: rand() < 0.5 ? 'talk' : 'stand' });
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
    const cap = Math.max(25, Math.min(110, Math.round((x1 - x0) * (z1 - z0) / 420)));
    for (const [x, z] of cand) {
      if (n >= cap) break;
      const px = x + (rand() - 0.5) * 1.5, pz = z + (rand() - 0.5) * 1.5, rot = (Math.floor((z - z0) / 9) % 2) * Math.PI, b = [px - 1.8, pz - 1.4, px + 1.8, pz + 1.4];
      if (!inside(px, pz, 20) || !egrid.free(b) || !grid.free(b) && false || wet(px, pz) || !flat(px, pz, 1.6)) continue;
      els.push({ t: 'stall', at: [px, pz], y: H(px, pz), rot, seed: Math.floor(rand() * 1e9), awning: kit.awnings[Math.floor(rand() * kit.awnings.length)], goods: kit.stall });
      egrid.fill(b, 2); grid.fill(b, 2); n++;
      if (rand() < 0.7) { const fx = px - Math.sin(rot) * 1.55, fz = pz - Math.cos(rot) * 1.55; if (egrid.free([fx - 0.3, fz - 0.3, fx + 0.3, fz + 0.3]) || rand() < 0.5) { put('figure', fx, fz, rot + Math.PI + (rand() - 0.5) * 0.4, { pose: rand() < 0.25 ? 'squat' : rand() < 0.5 ? 'talk' : 'stand' }); egrid.fill([fx - 0.3, fz - 0.3, fx + 0.3, fz + 0.3], 2); } }
      for (let q = 0; q < 2; q++) if (rand() < 0.6) { const fx = px + (rand() - 0.5) * 3, fz = pz + Math.cos(rot) * (2.6 + rand() * 1.2), bb = [fx - 0.35, fz - 0.35, fx + 0.35, fz + 0.35]; if (egrid.free(bb)) { put('figure', fx, fz, rot + (rand() - 0.5), { pose: rand() < 0.4 ? 'talk' : 'stand' }); egrid.fill(bb, 2); } }
    }
  }
  // people in the open places of the landmarks: knots talking, some walking with loads (the listed places, then the
  // landmarks' other open rooms, more thinly; a terrace well above the ground keeps its own height)
  const areas = (PEOPLE[id] ?? []).map((a) => ({ a, k: 300 }));
  if (!PEOPLE[id]) for (const sa of strollAreas) { const [x0, z0, x1, z1] = sa.rect, g = ground((x0 + x1) / 2, (z0 + z1) / 2); areas.push({ a: [x0, z0, x1, z1, sa.y - g > 0.25 ? sa.y : undefined], k: sa.garden ? 900 : sa.court ? 260 : 550 }); }
  for (const { a: [x0, z0, x1, z1, yOver], k: per } of areas) {
    const cap = Math.max(per > 300 ? 4 : 10, Math.min(per > 300 ? 40 : 70, Math.round((x1 - x0) * (z1 - z0) / per)));
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
  // work in the fields: people hoeing or bent over the crop in twos and threes, an ox or buffalo, a basket at the field's edge
  if (G.cover) {
    const beast = { east_asia: 'buffalo', southeast_asia: 'buffalo', south_asia: 'zebu', japan: 'ox' }[KIT_OF[id]] ?? 'ox';
    let nf = 0;
    for (let tries = 0; tries < 5000 && nf < 45; tries++) {
      const a = rand() * 6.28, r = Math.sqrt(rand()) * (R - 35), x = Math.cos(a) * r, z = Math.sin(a) * r, g = ground(x, z), c = G.cover(x, z, g);
      if (!c || !(c.fields > 0.45)) continue;
      if (!grid.free([x - 4, z - 4, x + 4, z + 4])) continue;
      const n = 1 + Math.floor(rand() * 3), rot = rand() * 6.28;
      let ok = 0;
      for (let q = 0; q < n; q++) { const px = x + Math.cos(rot) * q * 1.8, pz = z + Math.sin(rot) * q * 1.8; if (wet(px, pz) && KIT_OF[id] !== 'east_asia') continue; if (Math.hypot(px, pz) > R - 30) continue; put('figure', px, pz, rot + (rand() - 0.5) * 0.6, rand() < 0.65 ? { carry: 'hoe' } : { pose: 'squat', carry: 'none' }); ok++; }
      if (!ok) continue;
      grid.fill([x - 4, z - 4, x + 4, z + 4], 2); nf++;
      if (rand() < 0.3) put('animal:' + beast, x + Math.cos(rot + 1.6) * 4, z + Math.sin(rot + 1.6) * 4, rot);
      if (rand() < 0.5) put('basket', x - Math.cos(rot) * 1.5, z - Math.sin(rot) * 1.5, 0);
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
      const brot = land === null ? a : land + Math.PI / 2, wy = G.waterLevel(x, z) - 0.25;
      els.push({ t: 'boat', kind, at: [x, z], y: wy, rot: brot, seed: Math.floor(rand() * 1e9) });
      // by a boat moored at the shore: its goods set down on land, porters with poles and baskets
      if (land !== null && rand() < 0.45) {
        const lx = x + Math.cos(land) * 5.5, lz = z + Math.sin(land) * 5.5, gb = [lx - 1.5, lz - 1.5, lx + 1.5, lz + 1.5];
        if (!wet(lx, lz) && grid.free(gb) && flat(lx, lz, 1)) {
          const goods = /^(europe|venice|north|industrial|modern)/.test(KIT_OF[id] ?? '') ? ['sacks', 'crates', 'barrel'] : ['sacks', 'basket', 'pot'];
          for (let q = 0; q < 3; q++) { const gx = lx + (rand() - 0.5) * 2, gz = lz + (rand() - 0.5) * 2; put(goods[q % goods.length], gx, gz, rand() * 6.28); }
          for (let q = 0; q < 2; q++) if (rand() < 0.75) { const gx = lx + Math.cos(land + 1.6 * (q ? 1 : -1)) * 1.8, gz = lz + Math.sin(land + 1.6 * (q ? 1 : -1)) * 1.8; if (!wet(gx, gz)) put('figure', gx, gz, rand() * 6.28, { carry: KIT_OF[id] === 'east_asia' ? 'pole' : rand() < 0.5 ? 'basket' : 'none' }); }
          grid.fill(gb, 2);
        }
      }
      // the crew: someone standing at the stern (the gondolier, the boatman at his oar), or sitting amidships
      if (kind !== 'ferry' && kind !== 'dhow' && rand() < 0.6) {
        const dx = Math.sin(brot), dz = Math.cos(brot), stand = kind === 'gondola' || kind === 'sampan' || rand() < 0.4, f = stand ? 0.4 : 0.05;
        put('figure', x + dx * len * f, z + dz * len * f, brot + Math.PI + (rand() - 0.5) * 0.5, { y: wy + (stand ? 0.28 : 0.15), ...(stand ? {} : { pose: 'sit' }) });
        if (kind === 'sampan') els.push({ t: 'oar', at: [x + dx * (len * 0.43 + 0.2), z + dz * (len * 0.43 + 0.2)], y: wy + 0.3, rot: brot + Math.PI, seed: 3 });
      }
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
  const o = { dress: c(f.dress), cloth: c(f.cloths), cloth2: c(f.cloths), skin: c(f.skin), hat: c(f.hats), carry: f.carry ? c(f.carry) : 'none' };
  // the region's hair, beards, second garment, legs and feet (where the kit says)
  if (f.hair) o.hair = c(f.hair);
  if (f.beard !== undefined) o.beard = o.hat !== 'veil' && o.hair !== 'long' && o.hair !== 'bun' && rand() < f.beard;
  if (f.over && o.dress === 'robe') o.over = c(f.over);
  if (f.legs && o.dress === 'tunic') o.legs = f.legs;
  if (f.feet) o.feet = f.feet;
  const [hm, hs] = f.hairs ? c(f.hairs) : ['hide_black', 0.7];
  o.hairMat = hm; o.hairShade = hs;
  return o;
}

const DONE = new Map();
/** The settlement's module with its life added to its townscape. */
/** A test for the paved ways of some plans (lanes, paving, causeways, paths): nothing grows on them. */
const PAVED = /^(lane|paving|brick_paving|causeway|sacbe|path)$/;
export function pavedTest(plans) {
  const shapes = [];
  for (const plan of plans) {
    const a = (plan.yaw || 0) * Math.PI / 180, c = Math.cos(a), sn = Math.sin(a), [ox, oz] = plan.origin || [0, 0];
    const local = (x, z) => { const dx = x - ox, dz = z - oz; return [dx * c + dz * sn, -dx * sn + dz * c]; };
    for (const e of plan.elements || []) {
      if (!PAVED.test(e.t)) continue;
      if (e.rect) { const [x0, z0, x1, z1] = e.rect; shapes.push({ local, rect: [Math.min(x0, x1) - 0.4, Math.min(z0, z1) - 0.4, Math.max(x0, x1) + 0.4, Math.max(z0, z1) + 0.4] }); }
      else if (e.a && e.b) shapes.push({ local, segs: [[e.a, e.b]], w: (e.w || 3) / 2 + 0.4 });
      else if (e.pts) shapes.push({ local, segs: e.pts.slice(1).map((q, i) => [e.pts[i], q]), w: (e.w || 2) / 2 + 0.4 });
    }
  }
  if (!shapes.length) return null;
  const near = ([px, pz], [[ax, az], [bx, bz]], w) => {
    const dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz || 1)));
    return Math.hypot(px - ax - dx * t, pz - az - dz * t) < w;
  };
  return (x, z) => shapes.some((sh) => {
    const p = sh.local(x, z);
    return sh.rect ? p[0] > sh.rect[0] && p[0] < sh.rect[2] && p[1] > sh.rect[1] && p[1] < sh.rect[3] : sh.segs.some((g) => near(p, g, sh.w));
  });
}

export function withLife(id, mod, G, R) {
  if (DONE.has(id)) return DONE.get(id);
  // keep the plants off the paved ways of the landmarks
  const paved = G && !G.pavedMask && pavedTest(mod.landmarks.map((l) => l.plan));
  if (paved) {
    const plant = G.planting;
    G.planting = (x, z, p) => (paved(x, z) ? null : plant(x, z, p));
    G.pavedMask = true;
  }
  const out = { ...mod, town: async () => { const town = await mod.town(); return [...town, ...lifePlans(id, R, mod.landmarks.map((l) => l.plan), town, G)]; } };
  let cached = null;
  const once = { ...out, town: () => (cached ??= out.town()) };
  DONE.set(id, once);
  return once;
}
