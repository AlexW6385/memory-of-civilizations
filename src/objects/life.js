// Life in the settlements (DESIGN §5 "Objects of use", "Figures and life"): a pass over a built
// settlement that puts the things of daily use where they would be — pots, baskets, firewood,
// ladders and laundry by the house doors; carts, barrows, beasts and a few still figures in the
// streets; stalls with their goods in the market squares; boats moored along the shores. What is
// used where comes from the settlement's kit (its culture and time); where it goes is read from
// its plans (the footprints of every building) and its ground (water, slope). Deterministic.

import { LIFE_KINDS, boatFloat } from './index.js';
import { buildPlan, toWorld } from '../core/build.js';
import { ARRIVALS } from '../planet/arrivals.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const hash = (str) => { let h = 2166136261; for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };
const pick = (rand, list) => { const tot = list.reduce((a, [, w]) => a + w, 0); let r = rand() * tot; for (const it of list) { r -= it[1]; if (r <= 0) return it; } return list[list.length - 1]; };

// ---- the kits: what each culture and time uses ------------------------------------------------
const F = (dress, cloths, skin, hats, extra = {}) => ({ dress, cloths, skin, hats, ...extra });
const KITS = {
  mediterranean: {
    fronts: [['laundry_pole', 1, 2], ['shop_sign:board', 0.4, 1]],
    door: [['lantern:oil', 0.7], ['pot:amphora', 3], ['pot:pithos', 1], ['basket', 2], ['bench', 1.5], ['stool', 0.6], ['sweeper', 0.3], ['firewood', 1], ['ladder', 0.6], ['laundry', 0.8]],
    street: [['cart', 1], ['animal:donkey', 2], ['animal:goat', 1], ['animal:dog', 0.6], ['animal:cat', 0.5], ['chickens', 0.8], ['chickens:pigeon', 0.4], ['sacks', 1], ['well', 0.2], ['figure', 2.5]],
    stall: ['heap', 'greens', 'fish', 'bread', 'bolts', 'pottery', 'pot:amphora'], produce: ['cloth_maroon', 'cloth_green', 'cloth_red', 'cloth_ochre'], boats: ['rowboat'], awnings: ['cloth_white', 'cloth_ochre', 'cloth_red'],
    figures: F(['robe', 'tunic'], ['cloth_white', 'cloth_ochre', 'cloth_brown', 'cloth_red', 'cloth_indigo'], ['skin_medium', 'skin_light'], ['none', 'none', 'veil', 'cap'], { carry: ['none', 'none', 'none', 'none', 'none', 'sack', 'pot'], broom: 'besom', hair: ['short', 'short', 'bun', 'long'], beard: 0.5, over: ['cape', 'sash', 'none', 'cape'], hairs: [['hide_black', 0.7], ['hide_brown', 0.7]] }),
  },
  near_east: {
    fronts: [['hang_lantern:white', 0.25, 1], ['laundry_pole', 0.5, 2]],
    door: [['lantern:oil', 0.7], ['pot:water_pot', 2], ['pot:zir', 1.2], ['pot:pithos', 1], ['basket', 2], ['sacks', 1], ['bench', 1], ['stool', 0.5], ['sweeper', 0.3], ['laundry', 0.6]],
    // the street dogs of Cairo and Istanbul, ownerless and fed by the quarter; pigeons about the mosques' courts and the squares
    street: [['animal:donkey', 2.5], ['animal:camel', 1.2], ['animal:goat', 1.2], ['animal:sheep', 0.8], ['animal:dog', 0.8], ['animal:cat', 0.6], ['chickens', 0.6], ['chickens:pigeon', 0.6], ['sacks', 1], ['figure', 2.5]],
    stall: ['spice', 'spice', 'heap', 'bolts', 'pottery', 'baskets', 'bread'], mats: 0.2, produce: ['cloth_red', 'cloth_ochre', 'cloth_maroon', 'cloth_green'], boats: ['dhow', 'reed'], awnings: ['cloth_white', 'cloth_ochre', 'cloth_indigo'],
    figures: F(['robe'], ['cloth_white', 'cloth_ochre', 'cloth_brown', 'cloth_indigo', 'cloth_black'], ['skin_medium', 'skin_dark'], ['turban', 'veil', 'veil', 'none'], { carry: ['none', 'none', 'none', 'none', 'none', 'sack', 'bundle', 'pot'], broom: 'broom', hair: ['short', 'long'], beard: 0.65, over: ['sash', 'cape', 'none', 'sash'] }),
  },
  egypt: {
    door: [['lantern:oil', 0.7], ['pot:water_pot', 3], ['pot:dark_pot', 1.5], ['basket', 2], ['sacks', 1], ['firewood', 0.4]],
    street: [['animal:donkey', 2], ['animal:ox', 1], ['animal:goat', 1.2], ['animal:dog', 0.4], ['animal:cat', 0.6], ['chickens', 0.5], ['chickens:goose', 0.5], ['sacks', 1.2], ['well', 0.25], ['figure', 2.5]],
    stall: ['heap', 'bread', 'fish', 'pottery', 'baskets'], mats: 0.4, produce: ['cloth_green', 'cloth_maroon', 'cloth_ochre'], boats: ['reed', 'barge'], awnings: ['cloth_white', 'reed_mat'],
    // the wrapped linen kilt (shendyt) and the loincloth of the labourers, bare above the waist; the women's
    // sheath dress on two straps; the broad collar; wigs and shaven heads; barefoot
    // (https://en.wikipedia.org/wiki/Clothing_in_ancient_Egypt)
    figures: F(['shendyt', 'shendyt', 'sheath', 'loincloth', 'shendyt', 'sheath'], ['linen', 'cloth_white', 'linen'], ['skin_medium', 'skin_dark'], ['none'], { carry: ['none', 'none', 'none', 'basket', 'pot'], hair: ['short', 'wig', 'shaven', 'wig', 'short'], beard: 0, feet: 'bare', cloths2: ['cloth_indigo', 'cloth_green', 'cloth_red', 'cloth_white'], overs: { shendyt: ['belt', 'belt', 'wesekh'], sheath: ['none', 'wesekh'], loincloth: ['none'] } }),
  },
  east_asia: {
    fronts: [['hang_lantern:paper', 1.4, 1], ['shop_sign', 1, 1], ['laundry_pole', 1, 2]],
    door: [['lantern:paper', 1.6], ['pot:glazed_jar', 2], ['pot:vat', 1.5], ['pot:blue_jar', 1], ['basket', 2.5], ['firewood', 1.5], ['bench', 1.2], ['stool', 1], ['sweeper', 0.5], ['laundry', 1], ['ladder', 0.5]],
    street: [['barrow', 1.5], ['cart', 0.6], ['animal:ox', 0.8], ['animal:buffalo', 0.5], ['animal:dog', 0.6], ['animal:cat', 0.3], ['chickens', 0.8], ['chickens:duck', 0.5], ['chickens:goose', 0.3], ['sacks', 0.6], ['well', 0.2], ['figure', 3]],
    stall: ['greens', 'greens', 'fish', 'heap', 'baskets', 'pottery', 'bolts'], mats: 0.15, produce: ['cloth_ochre', 'cloth_red', 'cloth_green', 'glaze_yellow'], pottery: 'glaze_white', boats: ['sampan'], awnings: ['cloth_indigo', 'reed_mat', 'cloth_white'],
    figures: F(['robe', 'trousers'], ['cloth_indigo', 'cloth_grey', 'cloth_brown', 'cloth_white', 'cloth_black'], ['skin_light', 'skin_medium'], ['straw', 'cap', 'none', 'none'], { carry: ['pole', 'pails', 'bundle', 'sack', 'none', 'none', 'none', 'none'], broom: 'broom', hair: ['bun', 'bun', 'short'], beard: 0.12, over: ['collar', 'collar', 'sash'] }),
  },
  tibet: {
    door: [['lantern:oil', 0.4], ['firewood', 1.5], ['basket', 2], ['pot:dark_pot', 1.5], ['sacks', 1]],
    street: [['animal:yak', 3], ['animal:goat', 1], ['animal:sheep', 1.2], ['animal:dog', 0.8], ['sacks', 0.8], ['figure', 3]],
    stall: ['basket', 'cloth', 'produce', 'pot:dark_pot'], mats: 0.6, boats: [], awnings: ['cloth_red', 'cloth_ochre', 'cloth_white'],
    figures: F(['robe'], ['cloth_brown', 'cloth_red', 'cloth_black', 'cloth_ochre', 'cloth_grey'], ['skin_medium', 'skin_dark'], ['cap', 'none', 'brim', 'none'], { carry: ['none', 'none', 'none', 'bundle'], hair: ['long', 'bun', 'short'], beard: 0.1, over: ['sash', 'sash', 'collar'] }),
  },
  japan: {
    fronts: [['hang_lantern:white', 1, 1], ['shop_sign', 0.7, 1]],
    door: [['lantern:white', 1.6], ['pot:dark_pot', 2], ['rain_tub', 0.6], ['basket', 2.5], ['firewood', 1.5], ['bench', 1.5], ['sweeper', 0.5], ['laundry', 0.5], ['ladder', 0.5]],
    street: [['barrow', 0.4], ['handcart', 0.6], ['cart', 0.5], ['animal:ox', 0.7], ['animal:horse', 0.5], ['animal:dog', 0.5], ['animal:cat', 0.4], ['well', 0.2], ['figure', 3]],
    stall: ['greens', 'fish', 'fish', 'baskets', 'pottery', 'heap'], produce: ['cloth_ochre', 'cloth_red', 'cloth_green'], pottery: 'pottery_dark', boats: ['sampan', 'rowboat'], awnings: ['cloth_indigo', 'reed_mat'],
    figures: F(['robe'], ['cloth_indigo', 'cloth_grey', 'cloth_brown', 'cloth_black', 'cloth_white'], ['skin_light'], ['straw', 'none', 'none'], { carry: ['pole', 'pails', 'bundle', 'none', 'none', 'none'], broom: 'broom', hair: ['bun', 'bun', 'short'], beard: 0.05, over: ['collar', 'collar', 'sash'] }),
  },
  south_asia: {
    fronts: [['laundry_pole', 0.8, 2], ['hang_lantern:white', 0.4, 1]],
    door: [['lantern:oil', 0.7], ['pot:water_pot', 2.2], ['pot:matka', 1.3], ['basket', 2], ['firewood', 0.8], ['bench', 0.8], ['stool', 0.6], ['sweeper', 0.3], ['laundry', 1]],
    street: [['cart', 1.2], ['animal:zebu', 2.2], ['animal:buffalo', 0.8], ['animal:goat', 1], ['animal:dog', 0.6], ['chickens', 0.4], ['well', 0.25], ['figure', 3]],
    stall: ['spice', 'heap', 'greens', 'bolts', 'pottery', 'pot:water_pot'], mats: 0.5, produce: ['cloth_ochre', 'cloth_green', 'cloth_red', 'glaze_yellow'], boats: ['rowboat'], awnings: ['cloth_red', 'cloth_ochre', 'cloth_white'],
    figures: F(['wrap', 'robe'], ['cloth_white', 'cloth_red', 'cloth_ochre', 'cloth_green', 'cloth_indigo'], ['skin_medium', 'skin_dark'], ['turban', 'veil', 'none'], { carry: ['pot', 'headload', 'wood_head', 'basket', 'none', 'none', 'none', 'none'], broom: 'broom', hair: ['bun', 'long', 'short'], beard: 0.4, feet: 'bare', over: ['shawl', 'sash', 'none'], tops: { wrap: ['bare', '', ''] }, overs: { wrap: ['shawl', 'shawl', 'none'] } }),
  },
  southeast_asia: {
    door: [['lantern:oil', 0.7], ['pot:dark_pot', 2.5], ['basket', 3], ['firewood', 1], ['ladder', 1]],
    street: [['cart', 1], ['animal:buffalo', 1.5], ['animal:zebu', 1], ['chickens', 1.2], ['chickens:duck', 0.7], ['animal:pig', 0.6], ['animal:dog', 0.5], ['figure', 2.5]],
    stall: ['heap', 'melons', 'greens', 'fish', 'baskets', 'pottery'], mats: 0.5, produce: ['glaze_yellow', 'cloth_green', 'cloth_red', 'cloth_ochre'], pottery: 'pottery_dark', boats: ['canoe', 'sampan'], awnings: ['reed_mat', 'cloth_ochre'],
    figures: F(['wrap'], ['cloth_ochre', 'cloth_red', 'cloth_brown', 'cloth_white'], ['skin_medium', 'skin_dark'], ['none', 'none', 'cap'], { carry: ['pole', 'basket', 'none'] , hair: ['bun', 'long', 'short'], beard: 0.05, feet: 'bare', tops: { wrap: ['bare', 'bare', ''] }, overs: { wrap: ['none', 'none', 'sash'] } }),
  },
  europe_medieval: {
    fronts: [['shop_sign:board', 1, 1], ['laundry_pole', 0.4, 2]],
    door: [['lantern:iron', 0.7], ['barrel', 2], ['crates', 1], ['firewood', 2], ['bench', 1.2], ['stool', 0.5], ['sweeper', 0.4], ['ladder', 0.8], ['laundry', 0.8], ['basket', 1]],
    street: [['cart', 2], ['handcart', 0.8], ['barrow:front', 0.6], ['animal:horse', 1.2], ['animal:pig', 0.8], ['animal:dog', 0.6], ['animal:cat', 0.4], ['chickens', 1], ['chickens:goose', 0.4], ['chickens:duck', 0.3], ['chickens:pigeon', 0.4], ['sacks', 1], ['barrel', 1], ['well', 0.25], ['figure', 2.5]],
    stall: ['bread', 'heap', 'melons', 'fish', 'pottery', 'bolts', 'baskets'], produce: ['cloth_red', 'cloth_green', 'cloth_ochre'], pottery: 'pottery_dark', boats: ['rowboat', 'barge'], awnings: ['cloth_red', 'cloth_white', 'cloth_green', 'cloth_ochre'],
    figures: F(['robe', 'tunic'], ['cloth_brown', 'cloth_grey', 'cloth_red', 'cloth_green', 'cloth_indigo', 'cloth_white'], ['skin_light'], ['cap', 'none', 'veil', 'brim'], { carry: ['none', 'none', 'none', 'none', 'none', 'none', 'sack', 'yoke', 'bundle'], broom: 'besom', hair: ['short', 'short', 'long'], beard: 0.35, legs: 'hose', over: ['cape', 'sash', 'none', 'none'], hairs: [['hide_black', 0.7], ['hide_brown', 0.75], ['hide_brown', 0.6], ['hide_tan', 0.8]] }),
  },
  europe_early_modern: {
    fronts: [['shop_sign:board', 1, 1], ['laundry_pole', 0.5, 2]],
    door: [['lantern:iron', 0.7], ['barrel', 2], ['crates', 1.5], ['bench', 1.5], ['stool', 0.4], ['sweeper', 0.4], ['firewood', 0.8], ['ladder', 0.5], ['basket', 1]],
    street: [['cart', 2], ['handcart', 1], ['barrow:front', 0.6], ['animal:horse', 1.5], ['animal:dog', 0.6], ['animal:cat', 0.4], ['chickens:pigeon', 0.6], ['barrel', 1], ['sacks', 0.8], ['well', 0.15], ['figure', 3]],
    stall: ['heap', 'melons', 'greens', 'fish', 'bread', 'bolts'], produce: ['cloth_red', 'cloth_green', 'cloth_ochre', 'glaze_yellow'], boats: ['rowboat', 'barge'], awnings: ['cloth_white', 'cloth_red', 'cloth_green'],
    figures: F(['robe', 'trousers'], ['cloth_black', 'cloth_brown', 'cloth_red', 'cloth_indigo', 'cloth_grey'], ['skin_light'], ['brim', 'cap', 'none', 'veil'], { carry: ['none', 'none', 'none', 'none', 'none', 'none', 'sack', 'yoke'], broom: 'besom', hair: ['short', 'long', 'short'], beard: 0.15, legs: 'hose', over: ['cape', 'none', 'sash', 'cape'], hairs: [['hide_black', 0.7], ['hide_brown', 0.75], ['hide_brown', 0.6], ['hide_tan', 0.8]] }),
  },
  americas: {
    door: [['pot:dark_pot', 2.5], ['pot:water_pot', 1.5], ['basket', 2.5], ['firewood', 1], ['ladder', 0.6]],
    // no chickens before 1492: the turkey, kept for its meat, eggs and feathers in Mesoamerica and by the Pueblos
    // (https://en.wikipedia.org/wiki/Domestic_turkey; https://phys.org/news/2016-11-turkeys-major-ancestral-pueblo-life.html)
    street: [['animal:dog', 1.2], ['chickens:turkey', 0.6], ['basket', 1], ['pot:dark_pot', 1], ['figure', 3]],
    stall: ['basket', 'produce', 'pot:dark_pot', 'cloth'], mats: 0.85, boats: ['canoe'], awnings: ['cloth_white', 'reed_mat'],
    // the men's loincloth (maxtlatl, ex) with a cloak knotted at the shoulder (tilmatli), the women's huipil
    // (a tunic) and wrapped skirt
    figures: F(['loincloth', 'loincloth', 'tunic', 'wrap'], ['cloth_white', 'cloth_ochre', 'cloth_red', 'cloth_brown'], ['skin_medium', 'skin_dark'], ['none', 'none', 'cap'], { carry: ['basket', 'pot', 'bundle', 'none', 'none'], hair: ['long', 'bun', 'short'], beard: 0, feet: 'bare', over: ['sash', 'none'], overs: { loincloth: ['cape', 'none', 'cape'], wrap: ['none', 'shawl'] } }),
  },
  andes: {
    door: [['pot:dark_pot', 2], ['basket', 2], ['firewood', 1]],
    street: [['animal:llama', 3], ['animal:dog', 0.4], ['figure', 2.5]],
    stall: ['basket', 'produce', 'cloth'], mats: 0.8, boats: [], awnings: ['cloth_red'],
    // the q'ipi, the load wrapped in a cloth on the back and knotted at the chest
    figures: F(['tunic', 'wrap'], ['cloth_red', 'cloth_ochre', 'cloth_brown', 'cloth_black'], ['skin_medium'], ['cap', 'none'], { carry: ['bundle', 'none', 'none', 'none'], hair: ['short', 'long'], beard: 0, over: ['none'] }),
  },
  africa: {
    door: [['lantern:oil', 0.7], ['pot:water_pot', 3], ['pot:dark_pot', 2], ['basket', 2.5], ['firewood', 1]],
    street: [['animal:goat', 2], ['animal:zebu', 1], ['animal:sheep', 0.8], ['chickens', 1], ['animal:donkey', 0.6], ['animal:dog', 0.4], ['figure', 3]],
    stall: ['heap', 'fish', 'pottery', 'bolts', 'baskets', 'spice'], mats: 0.6, produce: ['cloth_red', 'cloth_ochre', 'cloth_green'], spices: ['cloth_red', 'cloth_ochre', 'cloth_white', 'cloth_brown'], boats: ['canoe', 'dhow'], awnings: ['cloth_white', 'reed_mat', 'cloth_indigo'],
    figures: F(['wrap', 'robe'], ['cloth_white', 'cloth_indigo', 'cloth_ochre', 'cloth_red'], ['skin_dark'], ['none', 'turban', 'veil'], { carry: ['pot', 'basket', 'headload', 'wood_head', 'none', 'none'], hair: ['short', 'short', 'bun'], beard: 0.3, feet: 'bare', over: ['shawl', 'sash', 'none'] }),
  },
  pacific: {
    door: [['basket', 3], ['firewood', 1.5], ['pot:dark_pot', 0.2]],
    street: [['chickens', 1.2], ['animal:dog', 0.6], ['basket', 1], ['figure', 2.5]],
    stall: [], boats: ['canoe'], awnings: [],
    // the loincloth (Rapa Nui's hami) or a skirt of bark cloth or flax, bare above the waist; a cloak of
    // bark cloth or flax over the shoulders (the Māori kākahu)
    figures: F(['loincloth', 'wrap', 'loincloth'], ['cloth_brown', 'cloth_ochre', 'hide_tan', 'cloth_white'], ['skin_medium', 'skin_dark'], ['none'], { hair: ['bun', 'long', 'short'], beard: 0.3, feet: 'bare', over: ['none'], tops: { wrap: ['bare', 'bare', ''] }, overs: { loincloth: ['none', 'none', 'cape'], wrap: ['none', 'cape'] } }),
  },
  north: {
    door: [['lantern:iron', 0.7], ['firewood', 3], ['barrel', 1.5], ['basket', 1], ['bench', 1], ['sweeper', 0.3], ['ladder', 0.5]],
    street: [['cart', 1], ['animal:horse', 1], ['animal:sheep', 1.5], ['animal:goat', 0.8], ['haystack', 1.2], ['animal:dog', 0.5], ['animal:cat', 0.3], ['chickens', 0.5], ['chickens:goose', 0.5], ['well', 0.25], ['figure', 2]],
    stall: ['basket', 'produce', 'cloth'], boats: ['rowboat'], awnings: ['cloth_red', 'cloth_white'],
    figures: F(['robe', 'tunic'], ['cloth_brown', 'cloth_grey', 'cloth_red', 'cloth_white', 'cloth_indigo'], ['skin_light'], ['cap', 'none', 'veil'], { carry: ['none', 'none', 'none', 'none', 'none', 'sack', 'yoke', 'bundle'], broom: 'besom', hair: ['short', 'long', 'long'], beard: 0.5, legs: 'hose', over: ['cape', 'sash', 'none'], hairs: [['hide_tan', 0.9], ['hide_brown', 0.75], ['hide_tan', 1.05], ['hide_black', 0.7]] }),
  },
  venice: {
    fronts: [['laundry_pole', 1.2, 2], ['shop_sign:board', 0.5, 1]],
    door: [['lantern:iron', 0.7], ['barrel', 2], ['crates', 1.5], ['bench', 1], ['stool', 0.6], ['sweeper', 0.4], ['basket', 1], ['laundry', 1.2], ['pot:water_pot', 0.6]],
    // the pigeons of the campi and of the Piazza
    street: [['barrel', 1], ['sacks', 1], ['crates', 0.8], ['animal:dog', 0.4], ['animal:cat', 0.7], ['chickens:pigeon', 1], ['well', 0.3], ['figure', 4]],
    stall: ['fish', 'fish', 'heap', 'greens', 'bolts', 'bread'], produce: ['cloth_red', 'cloth_green', 'cloth_ochre', 'glaze_yellow'], boats: ['gondola', 'gondola', 'rowboat', 'barge'], awnings: ['cloth_red', 'cloth_white', 'cloth_ochre'],
    figures: F(['robe'], ['cloth_black', 'cloth_red', 'cloth_brown', 'cloth_indigo', 'cloth_white'], ['skin_light'], ['cap', 'veil', 'none'], { carry: ['none', 'none', 'none', 'none', 'none', 'yoke', 'sack'], broom: 'besom', bucket: 'bronze', hair: ['short', 'long'], beard: 0.2, legs: 'hose', over: ['cape', 'cape', 'none', 'sash'], hairs: [['hide_black', 0.7], ['hide_brown', 0.7]] }),
  },
  industrial: {
    fronts: [['shop_sign:board', 0.8, 1]],
    door: [['lantern:iron', 0.7], ['barrel', 1.5], ['crates', 1.5], ['bench', 1], ['street_lamp', 0.4], ['pot:dark_pot', 0.5]],
    street: [['cart', 2], ['handcart', 1.4], ['animal:horse', 1.5], ['animal:dog', 0.4], ['animal:cat', 0.3], ['chickens:pigeon', 0.5], ['street_lamp', 0.6], ['figure', 3], ['sacks', 0.6]],
    stall: ['produce', 'cloth', 'basket'], boats: ['barge', 'rowboat'], awnings: ['cloth_green', 'cloth_white', 'cloth_red'],
    figures: F(['trousers', 'robe'], ['cloth_black', 'cloth_grey', 'cloth_brown', 'cloth_indigo'], ['skin_light'], ['brim', 'brim', 'cap', 'none'], { carry: ['none', 'none', 'none', 'none', 'none', 'none', 'sack'], broom: 'besom', hair: ['short', 'short', 'bun'], beard: 0.4, over: ['none'], hairs: [['hide_black', 0.7], ['hide_brown', 0.75], ['hide_tan', 0.85], ['hide_grey', 1.1]] }),
  },
  modern: {
    door: [['street_lamp', 0.6], ['bench', 1], ['crates', 0.5]],
    street: [['car', 4], ['street_lamp', 2], ['bench', 0.8], ['chickens:pigeon', 0.4], ['figure', 3]],
    stall: ['produce', 'cloth'], boats: ['ferry', 'rowboat'], awnings: ['cloth_green', 'cloth_red', 'cloth_white'],
    figures: F(['trousers', 'robe'], ['cloth_black', 'cloth_grey', 'cloth_indigo', 'cloth_brown', 'cloth_red'], ['skin_light', 'skin_medium'], ['brim', 'none', 'none'], { hair: ['short', 'short', 'long'], beard: 0.1, over: ['none'], hairs: [['hide_black', 0.7], ['hide_brown', 0.75], ['hide_tan', 0.9], ['hide_grey', 1.1]] }),
  },
};
// a settlement's own departures from its kit
const KIT_OVER = {
  // Amsterdam on its piles drew its goods on sledges, not carts (coaches taxed and few; docs/settlements/amsterdam.md §5.6),
  // and drew its water from rain cisterns and the water boats, not from draw-wells in the street
  // Sumerian Ur: the men bare above a wrapped skirt to the shin (the fleeced kaunakes), heads shaven; the
  // women in a robe over one shoulder, the hair in a bun (the Standard of Ur, the Ur statues)
  // (no camels or chickens yet in the Ur of c. 2050 BC: both came to Mesopotamia a millennium and more later)
  ur: { street: [['animal:donkey', 2.5], ['animal:goat', 1.2], ['animal:sheep', 1], ['animal:dog', 0.6], ['chickens:pigeon', 0.4], ['sacks', 1], ['figure', 2.5]], figures: F(['wrap', 'wrap', 'robe'], ['cloth_white', 'linen', 'cloth_ochre', 'cloth_brown'], ['skin_medium'], ['none'], { hair: ['shaven', 'shaven', 'bun', 'long'], beard: 0.4, feet: 'bare', over: ['shawl', 'sash'], tops: { wrap: ['bare'] }, overs: { wrap: ['none', 'belt'] } }) },
  // Neolithic Britain (c. 2500 BC): no market stalls, carts, horses, wells or fowl; sheep, dogs and people, firewood and baskets at the doors
  stonehenge: { stall: [], mats: 0, door: [['firewood', 3], ['basket', 1.5], ['sweeper', 0.2]], street: [['animal:sheep', 1.5], ['animal:dog', 0.6], ['firewood', 0.6], ['figure', 2]] },
  // Minoan Knossos: the men's loincloth and kilt, bare above the waist, long-haired, beardless; the women's
  // long robes (the frescoes: the Cupbearer, the Prince of the Lilies)
  knossos: { figures: F(['loincloth', 'shendyt', 'robe', 'robe'], ['cloth_white', 'cloth_red', 'cloth_ochre', 'cloth_indigo'], ['skin_medium'], ['none'], { hair: ['long', 'long', 'bun'], beard: 0, feet: 'bare', over: ['sash', 'none', 'cape'], overs: { shendyt: ['belt'], loincloth: ['none'] }, hairs: [['hide_black', 0.7], ['hide_brown', 0.6]] }) },
  // Great Zimbabwe: aprons and loincloths of hide, bare above the waist, a hide cloak on some
  'great-zimbabwe': { figures: F(['loincloth', 'loincloth', 'wrap'], ['hide_tan', 'hide_brown', 'cloth_ochre'], ['skin_dark'], ['none'], { hair: ['short', 'short', 'bun'], beard: 0.3, feet: 'bare', over: ['none'], tops: { wrap: ['bare', ''] }, overs: { loincloth: ['none', 'none', 'cape'], wrap: ['none'] } }) },
  // the Māori of the later 18th century (docs/settlements/maori.md): men's and women's garments much alike —
  // a cloak (kahu) of flax fibre, pale with dark borders, or for chiefs of dog skin, over the shoulders, and
  // about the waist a kilt of free-hanging flax strands (the rāpaki; the piupiu proper is post-contact) or a
  // wrapped garment; the high-born men's hair twisted into a topknot, a comb (heru) of wood or bone in it;
  // barefoot (Te Ara, "Māori clothing and adornment – kākahu Māori": https://teara.govt.nz/en/maori-clothing-and-adornment-kakahu-maori;
  // Wikipedia, "Māori traditional textiles": https://en.wikipedia.org/wiki/M%C4%81ori_traditional_textiles). Unlike Rapa
  // Nui's hami and bark cloth (the pacific kit): no loincloths in sight, a cloak on most, the topknot.
  maori: { street: [['animal:dog', 0.8], ['basket', 1], ['figure', 2.5]], figures: F(['strands', 'strands', 'wrap'], ['cloth_ochre', 'cloth_brown', 'linen', 'cloth_ochre'], ['skin_medium'], ['none'], { hair: ['topknot', 'topknot', 'long', 'long'], comb: 0.4, beard: 0.15, feet: 'bare', tops: { wrap: ['bare', ''] }, cloths2: ['linen', 'cloth_ochre', 'cloth_brown', 'cloth_black', 'hide_white', 'linen'], overs: { strands: ['cloak', 'cloak', 'cloak', 'none'], wrap: ['cloak', 'cloak', 'none'] }, hairs: [['hide_black', 0.7], ['hide_black', 0.6]] }) },
  // Joseon Seoul: the men's jige (A-frame) on the back; the women carrying on the head, the water jar (dongi) and the basket
  // on a ring pad (https://en.wikipedia.org/wiki/Jige)
  'joseon-seoul': { fig: { carry: ['jige', 'jige', 'jige', 'basket', 'pot', 'none', 'none', 'none', 'none'] } },
  // the Polynesians brought the chicken and the rat to Rapa Nui, and no dog; to Aotearoa the dog (kurī) and the rat,
  // and no chicken (https://en.wikipedia.org/wiki/Easter_Island; https://en.wikipedia.org/wiki/Kur%C4%AB)
  'rapa-nui': { street: [['chickens', 1.4], ['basket', 1], ['figure', 2.5]] },
  amsterdam: { street: [['sledge', 2], ['animal:horse', 0.8], ['animal:dog', 0.6], ['barrel', 1.2], ['sacks', 0.8], ['figure', 3]] },
};
// the draw-well of each kit (src/objects/index.js well): its kind, its curb, a roof over it
//   windlass — the European draw-well, a drum and crank on two posts, often under a little gabled roof;
//     without the roof the Chinese lulu (辘轳) on its stone curb
//   pulley — a gallows with a pulley block: the Mediterranean and the Near East; in Japan the tsurube
//     on its square wooden curb (igeta), a little roof over the pulley
//   shaduf — the counterpoised sweep (Egypt; India's dhenkli; the Russian zhuravl over a log well)
//   open — a curb, a bucket and a coil of rope on it: Venice's vere da pozzo over the cisterns
const WELL = {
  mediterranean: { kind: 'pulley', mat: 'limestone' }, near_east: { kind: 'pulley', mat: 'limestone' }, egypt: { kind: 'shaduf', mat: 'mudbrick' },
  east_asia: { kind: 'windlass', mat: 'bluestone' }, japan: { kind: 'pulley', mat: 'timber', square: true, roof: true }, south_asia: { kind: 'shaduf', mat: 'brick' },
  europe_medieval: { kind: 'windlass', mat: 'limestone', roof: true }, europe_early_modern: { kind: 'windlass', mat: 'limestone', roof: true },
  north: { kind: 'windlass', mat: 'log_pine', square: true, roof: true }, venice: { kind: 'open', mat: 'limestone', mould: true },
};
const WELL_OF = { muscovy: { kind: 'shaduf', mat: 'log_pine', square: true, bucket: 'timber', weight: 'rock_boulder' }, 'joseon-seoul': { kind: 'open', mat: 'granite_korea' } };
const KIT_OF = {
  athens: 'mediterranean', rome: 'mediterranean', constantinople: 'mediterranean', knossos: 'mediterranean', florence: 'europe_early_modern', venice: 'venice', 'baroque-rome': 'europe_early_modern',
  jerusalem: 'near_east', petra: 'near_east', ur: 'near_east', babylon: 'near_east', persepolis: 'near_east', isfahan: 'near_east', 'mamluk-cairo': 'near_east', 'ottoman-istanbul': 'near_east', granada: 'near_east',
  giza: 'egypt', 'abbasid-baghdad': 'near_east', mycenae: 'mediterranean', delphi: 'mediterranean', shibam: 'near_east', catalhoyuk: 'near_east', 'mongol-karakorum': 'tibet', fez: 'near_east', thebes: 'egypt', 'abu-simbel': 'egypt', 'muromachi-kyoto': 'japan', dunhuang: 'east_asia', 'timurid-samarkand': 'near_east', shaolin: 'east_asia',
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
  angkor: [[-195, -4, -152, 4], [-148, -4, -80, 4], [-225, -70, -200, 70]],
  'qing-beijing': [[-40, 210, 40, 300], [-60, 128, 60, 172], [-70, 30, 70, 98]], jerusalem: [[-145, -195, 145, 195, 14]], persepolis: [],
};
// the open rooms that hold a market: named so (whole words), and not the ceremonial places — a temple's
// plaza, a sacred precinct, a court (a palace's or a mosque's court has no stalls). A plan's room may say
// so itself (`market: true | false`); else the settlements whose plazas were ceremonial are listed:
// Teotihuacan's Moon Plaza and the Street of the Dead (its market, if any, the Great Compound); the
// sacred precinct of Tenochtitlan (the market was at Tlatelolco); Chichen Itza's Great Plaza (the
// "Mercado" stood south of it); Machu Picchu's Sacred Plaza; Taos Pueblo's dance plaza; Westminster's
// Parliament Square (a garden square from 1868).
const MARKET = /\b(square|piazza|plaza|market|agora|forum|maidan|bazaar|parvis|dam|rows)\b/i;
const CEREMONIAL = /sacred|ceremon|precinct|temple|sanctuar|shrine|court|\bmoon\b|\bsun\b/i;
const NO_MARKET = { teotihuacan: /./, tenochtitlan: /./, 'chichen-itza': /^plaza$/, 'machu-picchu': /./, taos: /./, london: /parliament/i };
export function isMarketRoom(id, room) {
  if (room.market !== undefined) return !!room.market;
  const name = `${room.id ?? ''} ${room.name?.en ?? room.name ?? ''}`;
  return MARKET.test(room.id ?? '') && !CEREMONIAL.test(name) && !NO_MARKET[id]?.test(room.id ?? '');
}
const FLAT = /paving|road|street|causeway|terrace|lane|sacbe|field|parterre|garden|park|lawn|water|cells|pavement|plaza|square|flag|carpet|bed\b|floor|ground|court\b|lamp/i;
const HOUSE = /house|hut|home|insula|siheyuan|hanok|machiya|compound|izba|shop|cottage|_block|skyscraper|dwelling/i;
const SKIP = /water|paving|park|wall|bridge|viaduct|wharf|fence|field|terrace|platform|road|street|canal|moat|ditch|bank|rim|pool|tank|lake|garden|parterre|ramp|stair|causeway|track|esplanade|precinct|enclosure|palisade|ring|circle|avenue|barrow|mound|cells/i;

// the settlements that hung their washing across the lanes, from window to window or on poles laid from wall to
// wall: p the share of house fronts that do, y the height of the line over the street, the wash's longest drop, the
// most lines. Venice's calli and rii; Rome's Trastevere and the lanes of the Regola; the lanes of Cairo; the lanes
// of the Jiangnan towns, the poles of bamboo across them (https://historywalksvenice.com/tag/bigolo-yoke; [inferred]
// from the views of the period and the custom that lasted into the photographs of the nineteenth century)
const ACROSS = {
  venice: { p: 0.16, y: [4.6, 5.4], drop: 0.95, max: 60 }, 'baroque-rome': { p: 0.1, y: [4.6, 5.4], drop: 0.95, max: 45 },
  'mamluk-cairo': { p: 0.08, y: [4.9, 5.4], drop: 0.8, max: 40 },
  'song-hangzhou': { p: 0.12, y: [4.5, 4.9], drop: 0.85, max: 45, pole: true }, 'ming-suzhou': { p: 0.14, y: [4.5, 4.9], drop: 0.85, max: 40, pole: true }, 'song-kaifeng': { p: 0.1, y: [4.5, 4.9], drop: 0.85, max: 40, pole: true },
};
// how far the wall of each face of a house stands inside its rectangle at the height of a line, and how far things
// stand out beyond the rectangle there (the jettied upper storeys and the mashrabiyas of Cairo, the balconies,
// sills and shutters of the Italian fronts): [inset, out], from the builders (src/styles/vernacular/houses-med.js,
// house-mamluk.js; src/styles/ming/index.js houseJiangnan: the upper lattice 0.9 m in from the front, the back wall 0.25)
const FACES = {
  house_med: (f, h) => (h.variant === 'ottoman' ? [0, 1.5] : [0, f === 'front' ? 0.9 : 0.1]),
  house_mamluk: (f) => [0, f === 'front' ? 1.6 : 0.1],
  house_jiangnan: (f) => (f === 'front' ? [0.9, 0.25] : f === 'back' ? [0.25, 0.1] : [0, 0.1]),
  house_song: (f) => (f === 'front' ? [0.9, 0.25] : [0, 0.1]),
};

/** The settlement's footprints on a half-metre grid, in settlement coordinates. */
class Grid {
  constructor(R, c = 0.5) { this.c = c; this.R = Math.ceil(R); this.n = Math.ceil(this.R * 2 / c); this.a = new Uint8Array(this.n * this.n); }
  cell(v) { return Math.floor((v + this.R) / this.c); }
  get(x, z) { const i = this.cell(x), j = this.cell(z); return i < 0 || j < 0 || i >= this.n || j >= this.n ? 1 : this.a[j * this.n + i]; }
  clear([x0, z0, x1, z1]) { const i0 = Math.max(0, this.cell(x0)), i1 = Math.min(this.n - 1, this.cell(x1)), j0 = Math.max(0, this.cell(z0)), j1 = Math.min(this.n - 1, this.cell(z1)); for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) this.a[j * this.n + i] = 0; }
  fill([x0, z0, x1, z1], v = 1) { const i0 = Math.max(0, this.cell(x0)), i1 = Math.min(this.n - 1, this.cell(x1)), j0 = Math.max(0, this.cell(z0)), j1 = Math.min(this.n - 1, this.cell(z1)); for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) this.a[j * this.n + i] = Math.max(this.a[j * this.n + i], v); }
  /** Mark the cells whose centres lie inside a convex polygon (settlement coordinates, either winding). */
  fillPoly(poly, v = 1) {
    const xs = poly.map((p) => p[0]), zs = poly.map((p) => p[1]), i0 = Math.max(0, this.cell(Math.min(...xs))), i1 = Math.min(this.n - 1, this.cell(Math.max(...xs))), j0 = Math.max(0, this.cell(Math.min(...zs))), j1 = Math.min(this.n - 1, this.cell(Math.max(...zs)));
    const n = poly.length, inPoly = (x, z) => { let pos = false, neg = false; for (let k = 0; k < n; k++) { const [ax, az] = poly[k], [bx, bz] = poly[(k + 1) % n], c = (bx - ax) * (z - az) - (bz - az) * (x - ax); if (c > 0) pos = true; else if (c < 0) neg = true; if (pos && neg) return false; } return true; };
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) if (inPoly((i + 0.5) * this.c - this.R, (j + 0.5) * this.c - this.R)) this.a[j * this.n + i] = Math.max(this.a[j * this.n + i], v);
  }
  free([x0, z0, x1, z1]) { const i0 = this.cell(x0), i1 = this.cell(x1), j0 = this.cell(z0), j1 = this.cell(z1); if (i0 < 0 || j0 < 0 || i1 >= this.n || j1 >= this.n) return false; for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) if (this.a[j * this.n + i]) return false; return true; }
}
/** A plan's point (local x, z) in settlement coordinates: as the plan is built (src/core/build.js toWorld), its origin and quarter-turn yaw. */
function toSettle(plan, x, z) { const w = toWorld(plan, x, z); return [w[0], w[2]]; }
/** A point of a `turned` element's frame (src/styles/artdeco/turn.js) in its plan's: turned by `a` as makeRotationY(a). */
const turnPoint = (a, x, z) => { const c = Math.cos(a), s = Math.sin(a); return [c * x + s * z, -s * x + c * z]; };
const rectOf = (plan, [x0, z0, x1, z1]) => { const a = toSettle(plan, x0, z0), b = toSettle(plan, x1, z1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
// landmarks whose plan is the town itself (their elements are read like a townscape's)
const OWN_FRONTS = new Set(['ming-suzhou']);          // settlements that dress their own house fronts (their town.js)
const TOWN_LANDMARKS = new Set(['machu-picchu-town', 'taos-pueblo']);
const isFull = (plan, R) => TOWN_LANDMARKS.has(plan.id) || (plan.bounds && plan.bounds[2] - plan.bounds[0] >= R * 1.5);

/** The plans of a settlement's life, from its landmarks, its townscape and its ground. */
export function lifePlans(id, R, landmarks, town, G) {
  const kit = { ...KITS[KIT_OF[id] ?? 'mediterranean'], ...KIT_OVER[id] };
  if (kit.fig) kit.figures = { ...kit.figures, ...kit.fig };
  const rand = rng(hash(id)), grid = new Grid(R + 2), egrid = new Grid(R + 2), houses = [], squares = [], strollAreas = [];
  let lmSquare = false;
  // the lots of a `turned` element (New York's grid, 29° off the axes): each house kept in its own frame —
  // its rectangle and front in the grid's, `T` its points into the settlement's, `ang` the turn of
  // what is placed by it — and its footprint marked as the turned rectangle it is
  const turnedLots = (plan, el, full) => {
    const a = el.angle ?? 0, ang = a - (plan.yaw || 0) * Math.PI / 180, T = (x, z) => toSettle(plan, ...turnPoint(a, x, z));
    // (widened by 0.55 m: the 0.3 m kept clear round every footprint, and the half cell that marking a
    // rectangle's whole cells adds, so that the turned lots keep the clearance of the square ones)
    const quad = ([x0, z0, x1, z1], m) => [[x0 - m, z0 - m], [x1 + m, z0 - m], [x1 + m, z1 + m], [x0 - m, z1 + m]].map(([x, z]) => T(x, z));
    for (const e of el.elements ?? []) {
      if (e.t === 'turned') continue;
      let r = null;
      if (e.rect) r = [Math.min(e.rect[0], e.rect[2]), Math.min(e.rect[1], e.rect[3]), Math.max(e.rect[0], e.rect[2]), Math.max(e.rect[1], e.rect[3])];
      else if (e.c && (e.r || e.s)) { const h = (e.r ?? e.s / 2) + 0.5; r = [e.c[0] - h, e.c[1] - h, e.c[0] + h, e.c[1] + h]; }
      if (!r || FLAT.test(e.t)) continue;
      const w = r[2] - r[0], d = r[3] - r[1];
      if (w * d > R * R) continue;
      egrid.fillPoly(quad(r, 0.55));
      if (!full) continue;
      grid.fillPoly(quad(r, 0.55));
      if ((HOUSE.test(e.t) || !SKIP.test(e.t)) && w * d >= 10 && w * d <= 6000 && w > 2 && d > 2) houses.push({ r, front: e.front, y: e.y, storeys: e.storeys ?? (e.h && e.h > 5 ? 2 : 1), shop: !!e.shop, T, ang });
    }
  };
  // every footprint: whole landmark bounds, the townscape's elements
  for (const plan of [...landmarks, ...town]) {
    if (!isFull(plan, R) && plan.bounds) grid.fill(rectOf(plan, plan.bounds).map((v, i) => v + (i < 2 ? -1 : 1)), 1);
    for (const room of plan.rooms ?? []) {
      if (room.kind !== 'open' || !room.rect) continue;
      if (isMarketRoom(id, room)) { squares.push({ rect: rectOf(plan, room.rect), y: room.y ?? 0 }); if (landmarks.includes(plan)) lmSquare = true; }
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
      if (el.t === 'turned') { turnedLots(plan, el, full); continue; }
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
      if ((HOUSE.test(el.t) || !SKIP.test(el.t)) && w * d >= 10 && w * d <= 6000 && w > 2 && d > 2) houses.push({ r, front: el.front, y: el.y, storeys: el.storeys ?? (el.h && el.h > 5 ? 2 : 1), shop: !!el.shop, t: el.t, variant: el.variant });
    }
  }
  // the arrival point (src/planet/arrivals.js): the visitor is set down there, so nothing of the street life stands
  // within ~2 m of it (a figure was found standing on Wutai's arrival)
  const AR = ARRIVALS[id], AR_CLEAR = 2;
  if (AR) { const b = [AR[0] - AR_CLEAR, AR[2] - AR_CLEAR, AR[0] + AR_CLEAR, AR[2] + AR_CLEAR]; grid.fill(b, 1); egrid.fill(b, 1); }
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
  // (the built parts are already placed: their positions are settlement coordinates, the plan's base included)
  if (watch.length) for (const [, b] of built) {
    for (const part of b.parts) {
      if (!part.geometry.boundingBox) part.geometry.computeBoundingBox();
      const bb = part.geometry.boundingBox;
      if (bb.max.x < W0[0] - 10 || bb.min.x > W0[2] + 10 || bb.max.z < W0[1] - 10 || bb.min.z > W0[3] + 10) continue;
      const P = part.geometry.attributes.position.array;
      for (let i = 0; i < P.length; i += 9) {
        { const x = P[i], z = P[i + 2], mi = Math.floor((x + MR) / 4), mj = Math.floor((z + MR) / 4); if (mi < 0 || mj < 0 || mi >= MN || mj >= MN || !mask[mj * MN + mi] || egrid.get(x, z)) continue; }
        const x0 = Math.min(P[i], P[i + 3], P[i + 6]), x1 = Math.max(P[i], P[i + 3], P[i + 6]), z0 = Math.min(P[i + 2], P[i + 5], P[i + 8]), z1 = Math.max(P[i + 2], P[i + 5], P[i + 8]);
        if (x1 < W0[0] || x0 > W0[2] || z1 < W0[1] || z0 > W0[3] || (x1 - x0) * (z1 - z0) > 400) continue;
        if (!watch.some((r) => x1 > r[0] - 3 && x0 < r[2] + 3 && z1 > r[1] - 3 && z0 < r[3] + 3)) continue;
        let up = false;
        for (let k = 0; k < 9 && !up; k += 3) if (P[i + k + 1] > Hc(P[i + k], P[i + k + 2]) + 0.2) up = true;
        if (up) { egrid.fill([x0 - 0.3, z0 - 0.3, x1 + 0.3, z1 + 0.3]); grid.fill([x0 - 0.3, z0 - 0.3, x1 + 0.3, z1 + 0.3]); }
      }
    }
  }
  const wet = (x, z) => { const l = G.waterLevel(x, z); return Number.isFinite(l) && ground(x, z) < l + 0.05; };
  const flat = (x, z, s = 1.2) => Math.abs(H(x + s, z) - H(x - s, z)) < 0.5 && Math.abs(H(x, z + s) - H(x, z - s)) < 0.5;
  const inside = (x, z, m = 30) => Math.hypot(x, z) < R - m;
  const els = [];
  const wareOpts = Object.fromEntries(['produce', 'pottery', 'spices'].filter((k) => kit[k]).map((k) => [k, kit[k]]));
  // (`ax`: the turn of the frame whose axes a car, a cart or a stall keeps to)
  const put = (kindSpec, x, z, rot, extra = {}, ax = 0) => {
    const [t, sub] = kindSpec.split(':');
    if (!LIFE_KINDS.includes(t)) return;
    const el = { t, at: [x, z], y: H(x, z), rot, seed: Math.floor(rand() * 1e9), ...extra };
    if (sub) el.kind = sub;
    if (t === 'well') Object.assign(el, WELL_OF[id] ?? WELL[KIT_OF[id] ?? 'mediterranean'] ?? WELL.mediterranean, extra);
    if (t === 'sledge' && rand() < 0.5) el.beast = 'horse';                  // the sleigh-man walks at his horse's head
    if (t === 'handcart') Object.assign(el, wareOpts);
    if (t === 'car' || t === 'cart' || t === 'sledge' || t === 'stall' || t === 'handcart') el.rot = ax + Math.round((rot - ax) / (Math.PI / 2)) * Math.PI / 2 + (t === 'cart' || t === 'sledge' ? (rand() - 0.5) * 0.3 : 0);   // along the street's axes
    if (t === 'car') el.era = id === 'sydney' ? 1970 : 1930;
    if (t === 'cart') {
      // a wagon in the towns of wheeled traffic; a horse or a donkey in the shafts of some two-wheeled carts
      const k = KIT_OF[id] ?? 'mediterranean', heavy = /europe_early_modern|industrial/.test(k);
      if (heavy && rand() < 0.35) el.kind = 'four';
      else if (rand() < 0.4) { const b = /europe|north|industrial|venice/.test(k) ? 'horse' : /mediterranean|near_east|africa|east_asia|egypt/.test(k) ? 'donkey' : null; if (b) el.beast = b; }
    }
    if (t === 'chickens' && sub === 'pigeon') el.n = 5 + Math.floor(rand() * 7);
    if (t === 'figure') {
      Object.assign(el, dressed(kit, rand, rng((el.seed ^ 0x9e3779b9) >>> 0))); if (extra.pose) el.carry = 'none'; if (extra.carry) el.carry = extra.carry; if (extra.y !== undefined) el.y = extra.y;
      if (el.carry === 'yoke' && kit.figures.bucket) el.bucketMat = kit.figures.bucket;
      if (el.child && extra.pose && extra.pose !== 'squat') delete el.child;          // no child on a bench built for grown-ups, at a craft, at work
    }
    els.push(el);
  };
  const sz = (t) => ({ stool: 0.6, sweeper: 0.85, wash_line: 0, goods_mat: 1.1, cart: 2.2, handcart: 1.6, rain_tub: 0.7, sledge: 2.2, stall: 2.2, animal: 1.4, haystack: 1.6, car: 2.6, laundry: 1.8, well: (WELL_OF[id] ?? WELL[KIT_OF[id]])?.kind === 'shaduf' ? 3.1 : 1.1, figure: 0.5, bench: 1, firewood: 1, crates: 0.8, ladder: 0.5, street_lamp: 0.4 }[t.split(':')[0]] ?? 0.6);
  const tryPut = (spec, x, z, rot, extra, k = 1, ax = 0) => {
    const s = sz(spec) * k, box = [x - s, z - s, x + s, z + s];
    if (!inside(x, z) || !grid.free(box) || wet(x, z) || !flat(x, z, s)) return false;
    put(spec, x, z, rot, extra, ax); grid.fill(box, 2); return true;
  };
  // goods set out on a mat on the ground, the seller sitting cross-legged or squatting behind them (−z), facing them
  const matGoods = [...new Set((kit.stall ?? []).map((g) => (g === 'produce' ? 'heap' : g === 'cloth' ? 'bolts' : g.startsWith('pot:') ? g.slice(4) : g)))];
  const matCloth = { andes: 'cloth_red', americas: 'reed_mat' }[KIT_OF[id]] ?? 'reed_mat';
  const putMat = (x, z, rot, both = false) => {
    const box = [x - 1.25, z - 1.25, x + 1.25, z + 1.25];
    if (!inside(x, z, 20) || !grid.free(box) || (both && !egrid.free(box)) || wet(x, z) || !flat(x, z, 1.2)) return false;
    els.push({ t: 'goods_mat', at: [x, z], y: H(x, z), rot, seed: Math.floor(rand() * 1e9), goods: matGoods.length ? matGoods : ['heap', 'baskets'], mat: matCloth, ...wareOpts });
    if (rand() < 0.85) put('figure', x - Math.sin(rot) * 0.95, z - Math.cos(rot) * 0.95, rot + Math.PI + (rand() - 0.5) * 0.3, { pose: rand() < 0.6 ? 'cross' : 'squat' });
    grid.fill(box, 2); if (both) egrid.fill(box, 2);
    return true;
  };
  // a flock of pigeons on an open place (the kits that have them in their streets)
  const pigeonsIn = kit.street.some(([s]) => s === 'chickens:pigeon');
  const flocks = ([x0, z0, x1, z1], per) => { if (!pigeonsIn) return; const n = Math.min(8, Math.floor((x1 - x0) * (z1 - z0) / per)); for (let q = 0, t = 0; q < n && t < n * 6; t++) { const x = x0 + 4 + rand() * (x1 - x0 - 8), z = z0 + 4 + rand() * (z1 - z0 - 8), b = [x - 1.6, z - 1.6, x + 1.6, z + 1.6]; if (!inside(x, z, 20) || !egrid.free(b) || !grid.free(b) || wet(x, z) || !flat(x, z, 1.5)) continue; put('chickens:pigeon', x, z, 0); grid.fill(b, 2); egrid.fill(b, 2); q++; } };
  // by the doors
  const sides = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] };
  // (a house's rectangle and front are in its frame: `T` its points into the settlement's, `ang` its turn; most houses' frame is the settlement's)
  const ID = (x, z) => [x, z];
  for (const h of houses) {
    if (rand() > 0.45) continue;
    const T = h.T ?? ID, ang = h.ang ?? 0;
    const [x0, z0, x1, z1] = h.r, order = sides[h.front] ? [h.front, ...'nsew'.replace(h.front, '')] : [...'nsew'].sort(() => rand() - 0.5);
    const n = 1 + Math.floor(rand() * 2);
    for (let k = 0; k < n; k++) {
      const [spec] = pick(rand, kit.door), t = 0.15 + rand() * 0.7;
      for (const f of order) {
        const [nx, nz] = sides[f], off = 0.25 + sz(spec) * 0.7 + rand() * 0.2;
        const [x, z] = T(nx ? (nx > 0 ? x1 + off : x0 - off) : x0 + (x1 - x0) * t, nz ? (nz > 0 ? z1 + off : z0 - off) : z0 + (z1 - z0) * t);
        const out = (nx ? Math.PI / 2 : 0) + (nx > 0 || nz > 0 ? Math.PI : 0) + ang;           // the turn of a figure facing out to the street
        // someone sitting out at the door on a low stool, facing the street; someone sweeping before the door, along the wall
        if (spec === 'stool') { if (tryPut('stool', x, z, out, {}, 0.7, ang)) { if (rand() < 0.75) put('figure', x, z, out, { pose: 'sit_low' }); break; } continue; }
        if (spec === 'sweeper') { if (kit.figures.broom && tryPut('figure', x, z, out + Math.PI / 2 * (rand() < 0.5 ? 1 : -1), { carry: kit.figures.broom }, 1.6, ang)) break; continue; }
        if (tryPut(spec, x, z, (nx ? Math.PI / 2 : 0) + ang, {}, 0.7, ang)) {
          // someone sitting on the bench, or squatting at the pots and baskets
          if (spec === 'bench' && rand() < 0.45) put('figure', x, z, (nx ? Math.PI / 2 : 0) + (nx > 0 || nz > 0 ? Math.PI : 0) + ang, { pose: 'sit' });
          else if (/^pot|^basket/.test(spec) && rand() < 0.18) { const ox = nx ? nx * 0.9 : 0.9, oz = nz ? nz * 0.9 : 0; const [dx, dz] = h.T ? turnPoint(ang, ox, oz) : [ox, oz]; tryPut('figure', x + dx, z + dz, Math.atan2(dx, dz), { pose: 'squat' }); }
          break;
        }
      }
    }
  }
  // on the house fronts, above the street: lanterns under the eaves, shop signs out on brackets, washing on poles out of upper windows
  const fronted = [];
  if (kit.fronts?.length && !OWN_FRONTS.has(id)) for (const h of houses) {
    if (!sides[h.front] || rand() > (h.shop ? 0.7 : 0.25)) continue;
    const T = h.T ?? ID, [x0, z0, x1, z1] = h.r, [nx, nz] = sides[h.front], L = nx ? z1 - z0 : x1 - x0, rot = Math.atan2(nx, nz) + (h.ang ?? 0), yb = h.y ?? H(...T((x0 + x1) / 2, (z0 + z1) / 2));
    const P = (t, off) => T(...(nx ? [(nx > 0 ? x1 : x0) + nx * off, z0 + (z1 - z0) * t] : [x0 + (x1 - x0) * t, (nz > 0 ? z1 : z0) + nz * off]));
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
  // washing hung across the lanes between the upper storeys, from wall to wall (the settlements where it was the custom)
  const AX = ACROSS[id];
  if (AX) {
    const hmap = new Map(), key = (i, j) => i * 100003 + j;
    const ok = (h) => !h.T && FACES[h.t] && (h.storeys ?? 1) >= 2;
    for (const h of houses) if (ok(h)) for (let i = Math.floor(h.r[0] / 8); i <= Math.floor(h.r[2] / 8); i++) for (let j = Math.floor(h.r[1] / 8); j <= Math.floor(h.r[3] / 8); j++) { const k = key(i, j); if (!hmap.has(k)) hmap.set(k, []); hmap.get(k).push(h); }
    const houseAt = (x, z) => (hmap.get(key(Math.floor(x / 8), Math.floor(z / 8))) ?? []).find((h) => x >= h.r[0] - 0.05 && x <= h.r[2] + 0.05 && z >= h.r[1] - 0.05 && z <= h.r[3] + 0.05);
    // a face of a house: its front, its back or a side, as seen along (dx, dz) out of it
    const faceOf = (h, dx, dz) => { const [fx, fz] = sides[h.front] ?? [0, 0]; return fx === dx && fz === dz ? 'front' : fx === -dx && fz === -dz ? 'back' : 'side'; };
    const lines = [];
    for (const h of houses) {
      if (lines.length >= AX.max || !ok(h) || !sides[h.front] || rand() > AX.p) continue;
      // (most from the front; a side or the back where the houses stand close)
      const fc = rand() < 0.6 ? h.front : 'nsew'[Math.floor(rand() * 4)];
      const [x0, z0, x1, z1] = h.r, [nx, nz] = sides[fc], t = 0.25 + rand() * 0.5;
      const near = nx ? (nx > 0 ? x1 : x0) : (nz > 0 ? z1 : z0), sx = nx ? near : x0 + (x1 - x0) * t, sz0 = nz ? near : z0 + (z1 - z0) * t;
      // out across the lane to the next footprint: a house of the kind, two storeys or more, wide enough there
      let hit = null, d = 0.9;                                   // (past the near house's own margin in the grid)
      for (; d <= 8.5 && !hit; d += 0.25) if (grid.get(sx + nx * d, sz0 + nz * d) === 1) hit = houseAt(sx + nx * (d + 0.5), sz0 + nz * (d + 0.5)) ?? -1;
      if (!hit || hit === -1 || hit === h || (nx ? sz0 < hit.r[1] + 0.6 || sz0 > hit.r[3] - 0.6 : sx < hit.r[0] + 0.6 || sx > hit.r[2] - 0.6)) continue;
      const far = nx > 0 ? hit.r[0] : nx < 0 ? hit.r[2] : nz > 0 ? hit.r[1] : hit.r[3], gap = Math.abs(far - near);
      const [inN, outN] = FACES[h.t](faceOf(h, nx, nz), h), [inF, outF] = FACES[hit.t](faceOf(hit, -nx, -nz), hit);
      if (gap < 1.5 || gap - outN - outF < 1.2 || gap > 7.5) continue;
      const yb = Math.max(h.y ?? H(sx, sz0), hit.y ?? H(sx + nx * gap, sz0 + nz * gap)), y = yb + AX.y[0] + rand() * (AX.y[1] - AX.y[0]);
      // (the lengths in quarter metres, rounded up, so that lines of a length share their shape; the ends always inside the walls)
      const q = (v) => Math.ceil(v * 4 - 1e-6) / 4, ea = q(inN + 0.15), eb = q(inF + 0.15), len = q(gap + ea + eb);
      const mid = [sx + nx * (len / 2 - ea), sz0 + nz * (len / 2 - ea)];
      if (lines.some((p) => Math.hypot(p[0] - mid[0], p[1] - mid[1]) < 3.5) || fronted.some((p) => Math.hypot(p[0] - sx, p[1] - sz0) < 2)) continue;
      lines.push(mid);
      els.push({ t: 'wash_line', at: mid, y, rot: Math.atan2(-nz, nx), len, emb: [ea, eb], clear: [q(Math.max(0.3, inN + outN + 0.25)), q(Math.max(0.3, inF + outF + 0.25))], pole: !!AX.pole, drop: AX.drop, seed: Math.floor(rand() * 1e9) });
    }
  }
  // crafts at the doors: a potter among his pots, a basket-maker, a dyer's cloth on lines, a carpenter's timber
  const CRAFT = { east_asia: ['potter', 'basket', 'dyer', 'carpenter'], japan: ['potter', 'basket', 'carpenter'], south_asia: ['potter', 'dyer', 'basket'], southeast_asia: ['potter', 'basket'], near_east: ['potter', 'dyer', 'carpenter'], egypt: ['potter', 'basket'], africa: ['potter', 'basket', 'dyer'], americas: ['potter', 'basket'], andes: ['potter', 'dyer'], mediterranean: ['potter', 'carpenter'], europe_medieval: ['carpenter', 'potter', 'cooper'], europe_early_modern: ['cooper', 'carpenter'], venice: ['cooper', 'carpenter'], north: ['carpenter'], pacific: ['basket'] }[KIT_OF[id] ?? 'mediterranean'] ?? [];
  if (CRAFT.length) for (const h of houses) {
    if (!sides[h.front] || rand() > 0.07) continue;
    const T = h.T ?? ID, ang = h.ang ?? 0, [x0, z0, x1, z1] = h.r, t = 0.3 + rand() * 0.4, off = 1.6;
    const [lx, lz] = sides[h.front], [nx, nz] = h.T ? turnPoint(ang, lx, lz) : [lx, lz];
    const [x, z] = T(lx ? (lx > 0 ? x1 + off : x0 - off) : x0 + (x1 - x0) * t, lz ? (lz > 0 ? z1 + off : z0 - off) : z0 + (z1 - z0) * t), b = [x - 1.4, z - 1.4, x + 1.4, z + 1.4];
    if (!inside(x, z) || !grid.free(b) || wet(x, z) || !flat(x, z, 1.2)) continue;
    const face = Math.atan2(nx, nz) + Math.PI, ux = nz, uz = -nx, craft = CRAFT[Math.floor(rand() * CRAFT.length)];
    const P = (u, v) => [x + ux * u + nx * v, z + uz * u + nz * v];
    if (craft === 'potter') { put('figure', ...P(0, 0), face, { pose: 'squat' }); for (let q = 0; q < 5; q++) put('pot:' + ['water_pot', 'dark_pot', 'water_pot', 'amphora'][q % 4], ...P(-1.1 + q * 0.5, (q % 2) * 0.5 - 0.3), rand() * 6.28); put('pot:pithos', ...P(1.2, 0.4), 0); }
    else if (craft === 'basket') { put('figure', ...P(0, 0), face, { pose: 'sit_ground' }); for (let q = 0; q < 4; q++) put('basket', ...P(-1 + q * 0.6, -0.5 + (q % 2) * 0.4), rand() * 6.28); }
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
    const [x0, z0, x1, z1] = h.r, a = rand() * 6.28, d = 3 + rand() * 6, ax = h.ang ?? 0, [cx, cz] = (h.T ?? ID)((x0 + x1) / 2 + Math.cos(a) * ((x1 - x0) / 2 + d), (z0 + z1) / 2 + Math.sin(a) * ((z1 - z0) / 2 + d));
    const [spec] = pick(rand, rand() < 0.35 ? kit.door : kit.street);
    if (spec === 'stool') continue;                                          // (a stool only by a door)
    if (spec === 'sweeper') { if (kit.figures.broom && tryPut('figure', cx, cz, rand() * 6.28, { carry: kit.figures.broom }, 1.6, ax)) k++; continue; }
    if (kit.mats && rand() < 0.05 * kit.mats) { if (putMat(cx, cz, Math.round(rand() * 4) * Math.PI / 2 + ax)) k++; continue; }
    if (spec === 'figure' && rand() < 0.45) {
      // a knot of two or three talking, facing each other
      const n = 2 + (rand() < 0.35 ? 1 : 0), a0 = rand() * 6.28;
      let ok = 0;
      for (let q = 0; q < n; q++) { const a = a0 + q * 6.28 / n, x = cx + Math.cos(a) * 0.55, z = cz + Math.sin(a) * 0.55; if (tryPut('figure', x, z, Math.atan2(x - cx, z - cz), { pose: q === 0 ? 'talk' : 'stand' }, 0.5)) ok++; }
      if (ok) k++;
    } else if (kit.stall.length && rand() < 0.07) {
      // a stall set out in the street, facing the way
      if (tryPut('stall', cx, cz, Math.round(rand() * 4) * Math.PI / 2 + ax, { awning: kit.awnings[Math.floor(rand() * kit.awnings.length)], goods: kit.stall, ...wareOpts }, 1, ax)) k++;
    } else if (tryPut(spec, cx, cz, rand() * 6.28, {}, 1, ax)) k++;
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
      if (kit.mats && rand() < kit.mats) { putMat(x, z, rot, true); continue; }
      if (!inside(x, z, 20) || !grid.free(box) || !egrid.free(box) || wet(x, z) || !flat(x, z, 1.6)) continue;
      els.push({ t: 'stall', at: [x, z], y: H(x, z), rot, seed: Math.floor(rand() * 1e9), awning: kit.awnings[Math.floor(rand() * kit.awnings.length)], goods: kit.stall, ...wareOpts });
      grid.fill(box, 2); egrid.fill(box, 2);
      // the seller squatting by the stall, a customer in front
      if (rand() < 0.75) put('figure', x - Math.sin(rot) * 1.55, z - Math.cos(rot) * 1.55, rot + Math.PI + (rand() - 0.5) * 0.4, { pose: rand() < 0.25 ? 'squat' : rand() < 0.5 ? 'talk' : 'stand' });
      if (rand() < 0.7) tryPut('figure', x + Math.sin(rot) * 2.4, z + Math.cos(rot) * 2.4, rot + (rand() - 0.5) * 0.6, { pose: rand() < 0.5 ? 'talk' : 'stand' });
    }
    for (let k = 0; k < 12; k++) tryPut('figure', x0 + 8 + rand() * (x1 - x0 - 16), z0 + 8 + rand() * (z1 - z0 - 16), rand() * 6.28);
    flocks(sq.rect, 500);
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
      if (kit.mats && rand() < kit.mats) { if (putMat(px, pz, rot, true)) n++; continue; }
      if (!inside(px, pz, 20) || !egrid.free(b) || !grid.free(b) && false || wet(px, pz) || !flat(px, pz, 1.6)) continue;
      els.push({ t: 'stall', at: [px, pz], y: H(px, pz), rot, seed: Math.floor(rand() * 1e9), awning: kit.awnings[Math.floor(rand() * kit.awnings.length)], goods: kit.stall, ...wareOpts });
      egrid.fill(b, 2); grid.fill(b, 2); n++;
      if (rand() < 0.7) { const fx = px - Math.sin(rot) * 1.55, fz = pz - Math.cos(rot) * 1.55; if (egrid.free([fx - 0.3, fz - 0.3, fx + 0.3, fz + 0.3]) || rand() < 0.5) { put('figure', fx, fz, rot + Math.PI + (rand() - 0.5) * 0.4, { pose: rand() < 0.25 ? 'squat' : rand() < 0.5 ? 'talk' : 'stand' }); egrid.fill([fx - 0.3, fz - 0.3, fx + 0.3, fz + 0.3], 2); } }
      for (let q = 0; q < 2; q++) if (rand() < 0.6) { const fx = px + (rand() - 0.5) * 3, fz = pz + Math.cos(rot) * (2.6 + rand() * 1.2), bb = [fx - 0.35, fz - 0.35, fx + 0.35, fz + 0.35]; if (egrid.free(bb)) { put('figure', fx, fz, rot + (rand() - 0.5), { pose: rand() < 0.4 ? 'talk' : 'stand' }); egrid.fill(bb, 2); } }
    }
    flocks([x0, z0, x1, z1], 900);
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
    if (yOver === undefined) flocks([x0, z0, x1, z1], 1400);
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
      const brot = land === null ? a : land + Math.PI / 2, wy = G.waterLevel(x, z) + boatFloat(kind);      // its sheer a freeboard above the water
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
        const pole = stand && (kind === 'reed' || kind === 'canoe');                 // the reed boat and the canoe poled from the stern
        put('figure', x + dx * len * f, z + dz * len * f, brot + Math.PI + (rand() - 0.5) * 0.5, { y: wy + (stand ? 0.28 : 0.15), ...(stand ? (pole ? { pose: 'punt', poleMat: 'timber' } : {}) : { pose: 'sit' }) });
        if (kind === 'sampan') els.push({ t: 'oar', at: [x + dx * (len * 0.43 + 0.2), z + dz * (len * 0.43 + 0.2)], y: wy + 0.3, rot: brot + Math.PI, seed: 3 });
      }
      grid.fill(box, 2); nb++;
    }
  }
  // (and what was put without asking the grid: kept off the arrival point too; the lines and poles overhead may cross it)
  if (AR) for (let i = els.length - 1; i >= 0; i--) { const e = els[i]; if (e.t !== 'wash_line' && e.t !== 'laundry_pole' && Math.hypot(e.at[0] - AR[0], e.at[1] - AR[2]) < AR_CLEAR + sz(e.t) * 0.5) els.splice(i, 1); }
  // as plans of a few hundred objects each
  // as plans of one 100 m tile each, so that what is out of view or far is not drawn
  const tiles = new Map();
  for (const e of els) { const k = `${Math.floor(e.at[0] / 100)},${Math.floor(e.at[1] / 100)}`; if (!tiles.has(k)) tiles.set(k, []); tiles.get(k).push(e); }
  const plans = [];
  for (const [k, list] of tiles) { const [i, j] = k.split(',').map(Number); plans.push({ id: `${id}-street-life-${k}`, center: [i * 100 + 50, j * 100 + 50], near: 230, style: 'life', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: list, rooms: [], bounds: [-R, -R, R, R], entrance: { at: [0, 0], facing: 'n' } }); }
  return plans;
}
function dressed(kit, rand, r2 = null) {
  const f = kit.figures, c = (l) => l[Math.floor(rand() * l.length)];
  const o = { dress: c(f.dress), cloth: c(f.cloths), cloth2: c(f.cloths), skin: c(f.skin), hat: c(f.hats), carry: f.carry ? c(f.carry) : 'none' };
  // the region's hair, beards, second garment, legs and feet (where the kit says)
  if (f.hair) o.hair = c(f.hair);
  if (f.beard !== undefined) o.beard = o.hat !== 'veil' && o.hair !== 'long' && o.hair !== 'bun' && rand() < f.beard;
  if (f.over && o.dress === 'robe') o.over = c(f.over);
  // the kits that say so: the second garment by dress, a bare chest, the colours of the second cloth
  if (f.overs?.[o.dress]) o.over = c(f.overs[o.dress]);
  if (f.tops?.[o.dress]) { const t = c(f.tops[o.dress]); if (t) o.top = t; }
  if (f.cloths2) o.cloth2 = c(f.cloths2);
  if (f.legs && o.dress === 'tunic') o.legs = f.legs;
  if (f.feet) o.feet = f.feet;
  if (f.comb && o.hair === 'topknot' && rand() < f.comb) o.comb = true;
  const [hm, hs] = f.hairs ? c(f.hairs) : ['hide_black', 0.7];
  o.hairMat = hm; o.hairShade = hs;
  // the variety of a crowd (drawn from a stream of its own, so that what the kit draws stays as it was): the hair's
  // shade a little lighter or darker; the grey or white hair of the old; children among the grown-ups, bareheaded,
  // carrying nothing, beardless (a kit may give its own share: `children`)
  if (r2) {
    const v = 0.9 + r2() * 0.2; o.hairShade = hs * v;
    if (r2() < (f.children ?? 0.12)) { o.child = true; o.carry = 'none'; o.beard = false; if (o.hat !== 'veil' && o.hat !== 'straw') o.hat = 'none'; }
    else if (r2() < 0.1 && o.hat !== 'veil') { o.hairMat = r2() < 0.6 ? 'hide_grey' : 'hide_white'; o.hairShade = 0.95 + r2() * 0.15; }
  }
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
