// Elements of Tang Chang'an that the shared Tang style does not have (the style stays as the other Tang places use it): registered as the
// style 'tang-changan', the Tang style's elements plus these. The settlement's plans name this style.
import '../../styles/tang/index.js';
import { registerStyle, STYLES } from '../../core/build.js';
import { daciHall } from './hall.js';
import { registerNight } from './night.js';

registerStyle('tang-changan', { ...STYLES.tang, elements: { ...STYLES.tang.elements, daci_hall: daciHall } });
registerNight();
