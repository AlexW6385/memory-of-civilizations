// Bianjing's own townscape pieces on top of the Song vocabulary (src/styles/song): the commoners' houses (houses.js).
import { STYLES, registerStyle } from '../../core/build.js';
import '../../styles/song/index.js';
import { houseSong } from './houses.js';
import { bianRevetment, wharf } from './banks.js';

registerStyle('kaifeng-site', { ...STYLES.song, elements: { ...STYLES.song.elements, house_song: houseSong, bian_revetment: bianRevetment, wharf } });
