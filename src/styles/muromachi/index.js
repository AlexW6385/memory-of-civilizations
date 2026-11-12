// Muromachi Kyoto, c. 1490 (docs/settlements/muromachi-kyoto.md): Zen temples of the Higashiyama culture — the Kannon-den
// of Jishō-ji, the Tōgu-dō with its 4½-mat Dōjinsai, the Ryōan-ji hōjō and its rock garden — and the town: the machiya of
// boards under stone-weighted plank roofs, the tea hut, the shrine with its torii and Noh stage. Gates, walls, railings
// and the roofs of the Japanese styles are read from `japanese` and `edo`.
import { registerStyle, STYLES } from '../../core/build.js';
import '../japanese/index.js';
import '../edo/index.js';
import { ginkakuElements } from './ginkaku.js';
import { zenElements } from './zen.js';
import { houseElements } from './houses.js';
import { sacredElements } from './sacred.js';
import { streetElements } from './street.js';
import { gardenElements } from './garden.js';

registerStyle('muromachi', {
  column: () => {}, trim: () => {}, opening: () => {},
  elements: { ...STYLES.edo.elements, ...STYLES.japanese.elements, ...ginkakuElements, ...zenElements, ...houseElements, ...sacredElements, ...streetElements, ...gardenElements },
  objects: {},
});
