// The architecture of Ye under Cao Cao (docs/settlements/wei-ye.md §5): late Eastern Han timber and rammed earth. The Han elements (walls, gates,
// houses, offices, shops, hall, corridor, pond; src/styles/han, read-only) are used as they are; this style adds the battered terraces with their
// stairs and storerooms, the tiered tower, the skyway and the river.
import { registerStyle } from '../../core/build.js';
import { STYLES } from '../../core/build.js';
import '../han/index.js';
import { terrace, tower, skyway, river } from './terrace.js';
import { prop } from './props.js';
import { boat } from './boats.js';

registerStyle('wei', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.han.elements, wei_terrace: terrace, wei_tower: tower, wei_skyway: skyway, wei_river: river, wei_prop: prop, wei_boat: boat },
  objects: {},
});
