// The far tiles of the townscape (seen from beyond 220 m): the materials of a house collapse to a handful (walls in their tints, the
// two roofs, one dark for openings and ironwork), so that a far tile is a dozen meshes instead of fifty (DESIGN §8 mesh budget).
const FAR = {
  limestone: 'stucco_pale', granite_grey: 'stucco_pale', granite_block: 'stucco_pale', flagstone: 'stucco_pale', marble: 'stucco_pale', sandstone_white: 'stucco_pale', stucco_rose: 'stucco_cream', stucco_saffron: 'stucco_ochre',
  plaster_white: 'stucco_pale', plaster_grey: 'stucco_pale', plaster_damp: 'stucco_pale', plaster_streak: 'stucco_pale', paint_white: 'stucco_pale', linen: 'stucco_pale', cloth_white: 'stucco_pale', glaze_white: 'stucco_pale',
  tile_dark: 'slate', lead: 'slate', terracotta: 'roof_tile', brick_baked: 'roof_tile', glaze_red: 'roof_tile', cotto_floor: 'roof_tile',
  wood_dark: 'opening', wood_ochre: 'opening', wood_painted: 'opening', iron: 'opening', iron_galv: 'opening', steel_grey: 'opening', lacquer_black: 'opening', shutter_green: 'opening', glass_outer: 'opening', glass_lamp: 'opening', lamp_glass: 'opening', lamp_white: 'opening',
  cloth_green: 'opening', cloth_red: 'opening', cloth_blue: 'opening', cloth_ochre: 'opening', cloth_maroon: 'opening', cloth_brown: 'opening', cloth_black: 'opening', cloth_grey: 'opening',
  paint_ochre: 'opening', paint_blue: 'opening', glaze_green: 'opening', hide_black: 'opening', hide_brown: 'opening', hide_tan: 'opening', sacking: 'opening', wicker: 'opening', rope_fibre: 'opening', mirror_tin: 'opening',
  gold: 'stucco_cream', gilt_bronze: 'stucco_cream',
};
/** The middle ring (lod 1, beyond 170 m of the Secession): the shops' minor materials fold into their nearest sibling. */
const MID = {
  limestone: 'sandstone_white', marble: 'sandstone_white', plaster_white: 'stucco_pale', plaster_grey: 'stucco_pale', plaster_damp: 'stucco_pale', plaster_streak: 'stucco_pale', linen: 'stucco_pale', cloth_white: 'stucco_pale', glaze_white: 'stucco_pale', cloth_grey: 'stucco_pale',
  lead: 'slate', terracotta: 'roof_tile', cotto_floor: 'roof_tile', glaze_red: 'cloth_red', cloth_maroon: 'cloth_red', cloth_ochre: 'paint_ochre', cloth_brown: 'wood_dark', cloth_black: 'lacquer_black',
  iron_galv: 'iron', steel_grey: 'iron', hide_black: 'lacquer_black', hide_brown: 'wood_dark', hide_tan: 'wood_ochre', sacking: 'wood_ochre', wicker: 'wood_ochre', rope_fibre: 'wood_ochre', mirror_tin: 'opening', glass_outer: 'opening', glass_lamp: 'opening', lamp_glass: 'opening', lamp_white: 'paint_white',
  wood_painted: 'paint_ochre', wood_ochre: 'paint_ochre', paint_blue: 'cloth_blue', granite_block: 'granite_grey', flagstone: 'granite_grey', gilt_bronze: 'gold', shutter_green: 'cloth_green',
};
/** The core: only the near-twins fold (flashing lead into slate, galvanised into iron, the odd fibres into one). */
const CORE = {
  lead: 'slate', plaster_grey: 'plaster_white', rope_fibre: 'wood_ochre', sacking: 'wood_ochre', wicker: 'wood_ochre', marble: 'sandstone_white', glaze_white: 'paint_white',
  steel_grey: 'iron', iron_galv: 'iron', mirror_tin: 'glass_outer', hide_tan: 'hide_brown', cloth_brown: 'hide_brown',
};
/** Wrap an element builder so that, with `el.simple` (the far tile), its materials are the few of FAR. */
export function farWrap(fn) {
  return (el, ctx) => {
    const MAP = el.simple ? FAR : el.lod === 1 ? MID : CORE;
    if (!MAP) return fn(el, ctx);
    const bag = Object.create(ctx.bag), add = ctx.bag.add;
    bag.add = (m, g) => add.call(ctx.bag, MAP[m] ?? m, g);
    bag.addInstance = (m, g, mx, o = {}) => ctx.bag.addInstance(MAP[m] ?? m, g, mx, { ...o, real: MAP[o.real ?? m] ?? o.real ?? m });
    return fn(el, { ...ctx, bag });
  };
}
