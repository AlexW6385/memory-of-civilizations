// The architecture of a Balinese village (docs/settlements/bali-village.md §3–§5): brick and carved volcanic stone, thatch of alang-alang and black ijuk,
// split gate, roofed gate, meru towers, bale pavilions, the kulkul tower, family compounds with their gates, the banjar's wantilan with its gamelan,
// subak channels and flooded paddies, penjors.
import { registerStyle } from '../../core/build.js';
import { wall, candiBentar, kori, padmasana, shrine, gate } from './stone.js';
import { meru, kulkul, bale, wantilan, paon, lumbung, house } from './bale.js';
import { compound } from './compound.js';
import { shop } from './shops.js';
import { water, channel, footbridge, subakShrine, penjor, offerings, banyanSeat } from './land.js';

registerStyle('balinese', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: {
    bali_wall: wall, bali_candi_bentar: candiBentar, bali_kori: kori, bali_padmasana: padmasana, bali_shrine: shrine, bali_gate: gate,
    bali_meru: meru, bali_kulkul: kulkul, bali_bale: bale, bali_wantilan: wantilan, bali_paon: paon, bali_lumbung: lumbung, bali_house: house,
    bali_compound: compound, bali_shop: shop, bali_water: water, bali_channel: channel, bali_footbridge: footbridge, bali_subak_shrine: subakShrine, bali_penjor: penjor,
    bali_offerings: offerings, bali_banyan_seat: banyanSeat,
  },
  objects: {},
});
