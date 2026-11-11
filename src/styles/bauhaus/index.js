// Bauhaus architecture of Dessau, 1926 (docs/settlements/bauhaus-dessau.md): the school's white cubes and glass curtain wall, the rendered
// tenements of the town, the Masters' Houses, the Törten rows.
import { registerStyle, STYLES } from '../../core/build.js';
import '../qing/index.js';
import { bauhausSchool } from './school.js';
import { HOUSE_ELEMENTS } from './houses.js';

registerStyle('bauhaus', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, bauhaus_school: bauhausSchool, ...HOUSE_ELEMENTS },
  objects: {},
});
