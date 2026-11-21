// Elements of Abbasid Baghdad that the shared abbasid style does not have (the style stays as it is): registered as the style 'abbasid-baghdad',
// the abbasid elements plus these. Only the keepers' near plans (life.js keeperPlans) name it.
import '../../styles/abbasid/index.js';
import '../../objects/index.js';
import { registerStyle, STYLES } from '../../core/build.js';

/** bag_keepers { list: [figure parameters] }: the shopkeepers and the people of the rooms, built into a near plan (a life element's figures reach 170 m wherever they stand). */
function keepers(el, ctx) {
  const fig = STYLES.life?.elements?.figure;
  if (!fig) return;
  for (const f of el.list) fig({ ...f }, { bag: ctx.bag, col: ctx.col });
}
registerStyle('abbasid-baghdad', { ...STYLES.abbasid, elements: { ...STYLES.abbasid.elements, bag_keepers: keepers } });
