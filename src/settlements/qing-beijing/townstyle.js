// Beijing's townscape vocabulary: the Qing style (src/styles/qing) with the lanes' courtyard houses of
// every gate rank, the shops of the shop street and the wells (houses.js, shopfront.js).
import { STYLES, registerStyle } from '../../core/build.js';
import '../../styles/qing/index.js';
import { withPal } from '../../styles/ming/index.js';
import { HOUSE } from '../../styles/qing/index.js';
import { hutongHouse } from './houses.js';
import { bjStreet, bjLane } from './street.js';
import { qingShop, shopYard, qingWell } from './shopfront.js';

const base = STYLES.qing;
registerStyle('beijing-site', {
  ...base,
  elements: {
    ...base.elements,
    hutong_house: (el, ctx) => withPal(hutongHouse)({ ...el, pal: HOUSE, simple: (el.lod ?? 0) > 0 }, ctx),
    qing_shop: (el, ctx) => withPal(qingShop)({ ...el, pal: HOUSE }, ctx),
    shop_yard: (el, ctx) => withPal(shopYard)({ ...el, pal: HOUSE }, ctx),
    qing_well: qingWell,
    bj_street: bjStreet,
    bj_lane: bjLane,
  },
});
