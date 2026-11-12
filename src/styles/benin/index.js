// The Benin style (Benin City about 1600; docs/settlements/benin-city.md): red clay in ridged bands, roofs of palm thatch and shingle,
// galleries on brass-sheathed pillars hung with plaques, impluvia in the courts, turrets with brass snakes and birds, the clay altar
// with its cast heads and carved tusks, the guild yards, the market stalls, the gates and the double palisade of the Iya.
import { registerStyle } from '../../core/build.js';
import { PALACE_EL } from './palace.js';
import { HOUSES } from './house.js';
import { TOWN_EL } from './town.js';
import { STREET_EL } from './street.js';

export const benin = { elements: { ...PALACE_EL, ...HOUSES, ...TOWN_EL, ...STREET_EL } };
registerStyle('benin', benin);
