// Sanchi in the 1st century (docs/settlements/sanchi.md §2–§4): the Great Stupa with its railings,
// gateways, companions, pillar and monasteries (the full building of the previous design,
// src/buildings/sanchi-great-stupa) on the summit.
import { TOP } from './layout.js';
import stupaPlan from '../../buildings/sanchi-great-stupa/plan.js';
export const stupa = { ...stupaPlan, origin: [0, 0], base: TOP, district: undefined, view: [-32, -32, 32, 32], viewY: TOP };
export default stupa;
