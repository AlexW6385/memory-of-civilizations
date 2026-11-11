// The architecture of Ubirr (docs/settlements/kakadu.md): the sandstone outlier with its overhanging shelters and painted walls, the rock
// steps, the family's bark shelters and fire, and the plants of the floodplain. The `life` style's figures and animals are used by the town's plans.
import { registerStyle } from '../../core/build.js';
import '../../objects/index.js';
import { rockMass, rockSteps, boulders } from './rock.js';
import { gallery } from './gallery.js';
import { paperbark, pandanus, termite, lilies, hut, leanto, fire, rack } from './camp.js';

registerStyle('kakadu', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ka_rock: rockMass, ka_steps: rockSteps, ka_boulders: boulders, ka_gallery: gallery, ka_paperbark: paperbark, ka_pandanus: pandanus, ka_termite: termite, ka_lilies: lilies, ka_hut: hut, ka_leanto: leanto, ka_fire: fire, ka_rack: rack },
  objects: {},
});
