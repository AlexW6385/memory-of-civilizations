// The interiors of the Palace and the Abbey in their own plans, built only when the visitor is near (docs/settlements/london.md §12).
// An element built with `pass: 'shell'` keeps every piece but those in the inside materials (the walls, vaults, windows and roofs
// every distance sees, and the colliders); the same element with `pass: 'inside'` keeps only the pieces in them (floors' marble and tiles,
// cloth, leather, paint, statues, monuments, chandeliers) and no colliders. Each of those materials costs a draw in the frame
// only while the near plan is shown.
export const INSIDE = new Set(['marble_floor', 'opus_sectile', 'marble', 'marble_dark', 'marble_smooth', 'marble_pink', 'breccia_red', 'serpentine', 'giallo',
  'tile_dark', 'tile_cream', 'glaze_red', 'glaze_yellow', 'mosaic_gold', 'mosaic_green', 'mosaic_silver',
  'cloth_red', 'cloth_blue', 'cloth_black', 'cloth_green', 'cloth_ochre', 'cloth_indigo', 'cloth_brown', 'cloth_white', 'cloth_maroon', 'cloth_grey',
  'paint_ochre', 'paint_blue', 'paint_white', 'skin_light', 'hide_brown', 'hide_black', 'reed_mat', 'leather_bench', 'ceiling_coffer', 'clay_gilt',
  'lamp_glass', 'bronze', 'linen', 'wicker', 'lacquer_black', 'gold', 'granite_black', 'flame', 'wood_dark']);
const NOOP = new Proxy({}, { get: () => () => undefined });
/** Wrap an element builder so that `el.pass` ('shell' | 'inside') selects the pieces it keeps. */
export const passes = (build) => (el, ctx) => {
  if (!el.pass) return build(el, ctx);
  const keep = el.pass === 'inside';
  const bag = new Proxy(ctx.bag, { get(t, k) { const v = t[k]; if (k === 'add') return (mat, g) => (INSIDE.has(mat) === keep ? t.add(mat, g) : undefined);
    if (k === 'addInstance') return (mat, g, m, o) => (INSIDE.has(o?.real ?? mat) === keep ? t.addInstance(mat, g, m, o) : undefined); return typeof v === 'function' ? v.bind(t) : v; } });
  return build(el, { ...ctx, bag, col: keep ? NOOP : ctx.col, lights: keep ? ctx.lights : [] });
};
