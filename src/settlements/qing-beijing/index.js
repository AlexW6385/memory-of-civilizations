// Ming–Qing Beijing: the Outer Court of the Forbidden City and the lanes of courtyard houses round it.
// Music: the palace's courts keep the court's ritual music (courtMusic); the lanes and the avenue the street's (streetMusic).
import '../../styles/qing/index.js';
import './style.js';
import './hallwork.js';
import './terrace.js';
import './roofwork.js';
import './bronzes.js';
import './hexirelief.js';
import './bracket.js';
import './thronework.js';
import palace from './plan.js';
import { palaceNight } from './nightwork.js';
import { palacePlaques } from './plaques.js';
import { courtMusic, streetMusic } from './music.js';
// the palace's night: lanterns under the gate and hall eaves, the guards' lamps, the embers (nightwork.js, docs §39)
palace.elements.push({ t: 'bj_night_palace', list: palaceNight() });
// the plaques of the three great halls, in gilt on blue (plaques.js, docs §42)
palace.elements.push({ t: 'bj_plaque', list: palacePlaques() });
export { town } from './town.js';
export const music = streetMusic;
export const landmarks = [{ plan: palace, music: courtMusic }];
