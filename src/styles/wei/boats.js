// Boats of Ye (docs/settlements/wei-ye.md §5.2): the war and training craft of the Xuanwu pond (Cao Cao dug it in 203 to drill his fleet) and the working boats of
// the Zhang River — the ferry, the fishing skiff with its net hung to dry, the grain barge under a mat roof. Each is a hull of slices of timber (wide amidships,
// narrow and lifting at the ends), a deck, and its gear; `yaw` 0 has the bow toward +x; `y` is the water.
import { box, lathe, place, clothBox, addCloth } from '../../core/geom.js';

export function boat(el, ctx) {
  const { bag } = ctx, [x, z] = el.at, y = el.y, L = el.len ?? 8, B = el.beam ?? L * 0.2, yaw = el.yaw ?? 0, kind = el.kind ?? 'skiff';
  const put = (mat, g) => bag.add(mat, place(g, x, y, z, -yaw));            // local x forward (bow +x), z across
  const N = 10;
  for (let i = 0; i < N; i++) {
    const t0 = i / N, t1 = (i + 1) / N, tm = (t0 + t1) / 2, u0 = -L / 2 + L * t0, u1 = -L / 2 + L * t1;
    const w = B / 2 * Math.pow(Math.max(0.12, 1 - Math.pow(2 * tm - 1, 4)), 0.55), lift = 0.5 * Math.pow(Math.abs(2 * tm - 1), 3);
    put(i % 2 ? 'timber' : 'wood_dark', box(u0, -0.28, -w, u1 + 0.01, 0.38 + lift, w));
    put('timber', box(u0, 0.0, -w - 0.03, u1 + 0.01, 0.12, w + 0.03));
    put('wood_dark', box(u0, -0.28 + 0.62, -w + 0.1, u1, 0.38 + lift + 0.001, w - 0.1));
  }
  put('wood_ochre', box(-L * 0.42, 0.37, -B / 2 * 0.85, L * 0.42, 0.4, B / 2 * 0.85));      // the floor boards
  const thwart = (u) => put('wood_ochre', box(u - 0.12, 0.4, -B / 2 * 0.8, u + 0.12, 0.5, B / 2 * 0.8));
  for (let k = -1; k <= 1; k++) thwart(k * L * 0.22);
  if (kind === 'skiff') {
    // the net (hemp, drying on two poles over the stern), a bamboo pole, a basket, a cormorant-less stern oar
    put('timber', box(-L * 0.46, 0.5, -0.04, -L * 0.4, 2.0, 0.04)); put('timber', box(-L * 0.2, 0.5, -0.04, -L * 0.14, 2.0, 0.04));
    const g = clothBox(-L * 0.4, 1.0, 0.0, -L * 0.17, 2.0, 0.03, 0.3); place(g, x, y, z, -yaw); addCloth(bag, 'cloth_grey', g, y + 2.0);
    put('wicker', lathe([[0.2, 0.4], [0.3, 0.75], [0.001, 0.75]], 8, null, L * 0.2, 0, 0.2));
    put('wood_dark', box(-L * 0.5 - 0.9, 0.55, -0.05, -L * 0.3, 0.62, 0.05));
  } else if (kind === 'ferry') {
    for (const s of [-1, 1]) put('timber', box(-L * 0.4, 0.4, s * B * 0.42 - 0.04, L * 0.4, 1.0, s * B * 0.42 + 0.04));
    put('wood_dark', box(-L * 0.52 - 1.4, 0.7, -0.06, -L * 0.3, 0.8, 0.06));
    put('wood_dark', box(L * 0.52 - 0.3, 0.5, -0.05, L * 0.5 + 1.4, 0.55, 0.05));
  } else if (kind === 'barge') {
    // a roof of woven reed mats over the middle, the sacks of grain under it, a long sweep at the stern
    put('timber', box(-L * 0.3, 0.4, -B * 0.4 - 0.04, -L * 0.3 + 0.08, 1.6, -B * 0.4 + 0.04)); put('timber', box(L * 0.2, 0.4, -B * 0.4 - 0.04, L * 0.2 + 0.08, 1.6, -B * 0.4 + 0.04));
    put('timber', box(-L * 0.3, 0.4, B * 0.4 - 0.04, -L * 0.3 + 0.08, 1.6, B * 0.4 + 0.04)); put('timber', box(L * 0.2, 0.4, B * 0.4 - 0.04, L * 0.2 + 0.08, 1.6, B * 0.4 + 0.04));
    put('reed_mat', box(-L * 0.33, 1.6, -B * 0.5, L * 0.23, 1.7, B * 0.5)); put('reed_mat', box(-L * 0.3, 1.7, -B * 0.32, L * 0.2, 1.95, B * 0.32));
    for (let k = 0; k < 6; k++) put('sacking', box(-L * 0.28 + (k % 3) * 1.0, 0.4, -B * 0.3 + Math.floor(k / 3) * 0.7, -L * 0.28 + (k % 3) * 1.0 + 0.8, 0.9, -B * 0.3 + Math.floor(k / 3) * 0.7 + 0.55));
    put('wood_dark', box(-L * 0.5 - 1.8, 0.7, -0.07, -L * 0.3, 0.8, 0.07));
  } else if (kind === 'war') {
    // the fighting ship of the pond: a raised screen of ox-hide shields along both sides, a mast with the red banner, oar-ports, a fighting deck
    for (const s of [-1, 1]) { put('hide_brown', box(-L * 0.4, 0.4, s * B * 0.46 - 0.05, L * 0.4, 1.3, s * B * 0.46 + 0.05)); for (let k = 0; k < 8; k++) put('iron', box(-L * 0.38 + k * L * 0.1 - 0.04, 0.9, s * B * 0.46 - 0.07, -L * 0.38 + k * L * 0.1 + 0.04, 1.1, s * B * 0.46 + 0.07)); }
    put('timber', lathe([[0.1, 0.4], [0.07, 7.5]], 6, null, L * 0.1, 0, 0));
    const g = clothBox(L * 0.1 + 0.05, 5.4, -0.02, L * 0.1 + 0.05 + 2.2, 7.3, 0.02, 0.3); place(g, x, y, z, -yaw); addCloth(bag, 'cloth_red', g, y + 7.3);
    put('timber_red', box(-L * 0.2, 0.4, -B * 0.3, L * 0.05, 2.1, B * 0.3)); put('tile_dark', box(-L * 0.23, 2.1, -B * 0.36, L * 0.08, 2.25, B * 0.36));
  }
}
