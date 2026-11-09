// The settlement cards of the globe map (DESIGN §4.1): name and era come from sites.js; here the
// short plain text of each settlement, in English and Chinese, written from its dossier and its
// row in DESIGN §7. Description only: background, time, civilization, style, the main sights.
// One file per part of the world (src/planet/cards/), merged here.

import { CARDS as ASIA } from './cards/asia.js';
import { CARDS as WORLD } from './cards/world.js';

/** id → { en: [paragraphs], zh: [paragraphs] } */
export const CARDS = { ...ASIA, ...WORLD };
