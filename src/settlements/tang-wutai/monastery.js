// Foguang Monastery's other buildings (docs/settlements/tang-wutai.md §11): the Hall of Manjusri (Wenshu) on the north side of the
// middle terrace, with its statue of the bodhisattva on his lion, the bell pavilion on the south side, the incense
// burners before the two halls, the side stairs that join the three levels at their ends. Elements of the
// `chinese` style in settlement coordinates (+x east, +z south); the terraces themselves are the hall plan's.

const Y = 6.5;                              // the middle terrace's paving
const F = Y + 0.5;                          // the Manjusri hall's floor on its platform
export const WENSHU = { x0: 4, x1: 22, zb: -45.5, zf: -36.5, F };
export const BELL = [14, 38];
export const CENSERS = [[41, 0, 13], [13, -31.6, Y]];              // [x, z, y of the ground it stands on]

function wenshuHall() {
  const E = [], add = (o) => (E.push(o), o);
  const { x0, x1, zb, zf } = WENSHU, H = 4.8, bay = (x1 - x0) / 5, xs = Array.from({ length: 6 }, (_, k) => x0 + k * bay), cx = (x0 + x1) / 2;
  // platform (0.5 high, faced with dressed stone), its paving, the front flight
  add({ t: 'block', rect: [x0 - 1.6, zb - 1.7, x1 + 1.6, zf + 1.3], y0: Y - 0.2, y1: F - 0.15, mat: 'limestone' });
  add({ t: 'floor', rect: [x0 - 1.6, zb - 1.7, x1 + 1.6, zf + 1.3], y: F, mat: 'sandstone_floor', th: 0.15 });
  add({ t: 'stair', rect: [cx - 1.8, zf + 1.3, cx + 1.8, zf + 2.3], dir: 'n', y0: Y, y1: F, riser: 0.167, base: Y, mat: 'limestone' });
  // columns on stone bases, the bracket sets over them (a simple set between the columns on the front), the beams
  for (const z of [zb, zf]) for (const x of xs) add({ t: 'column', at: [x, z], y: F, h: H, d: 0.46 });
  for (const z of [zb, zf]) for (let k = 0; k < 6; k++) add({ t: 'tang_bracket_set', at: [xs[k], z], y: F + H, dir: [0, z === zf ? 1 : -1], kind: 'column' });
  for (let k = 0; k < 5; k++) add({ t: 'tang_bracket_set', at: [(xs[k] + xs[k + 1]) / 2, zf], y: F + H + 0.82, dir: [0, 1], kind: 'between', post: 0.82 });
  for (const z of [zb, zf]) { add({ t: 'block', rect: [x0 - 0.3, z - 0.17, x1 + 0.3, z + 0.17], y0: F + H - 0.42, y1: F + H, mat: 'timber_red', collide: false }); add({ t: 'block', rect: [x0 - 0.1, z - 0.08, x1 + 0.1, z + 0.08], y0: F + H, y1: F + H + 2.5, mat: 'paint_white', collide: false }); }
  for (const x of [x0, x1]) { add({ t: 'block', rect: [x - 0.17, zb - 0.3, x + 0.17, zf + 0.3], y0: F + H - 0.42, y1: F + H, mat: 'timber_red', collide: false }); add({ t: 'block', rect: [x - 0.08, zb - 0.1, x + 0.08, zf + 0.1], y0: F + H, y1: F + H + 2.5, mat: 'paint_white', collide: false }); }
  // walls: back and sides closed; the front a door in the middle bay and a barred window in each of the others
  const C = 0.26, th = 0.5;
  add({ t: 'wall', a: [x0 + C, zb], b: [x1 - C, zb], th, y0: F, y1: F + H - 0.42, openings: [], mat: 'plaster_white' });
  for (const x of [x0, x1]) add({ t: 'wall', a: [x, zb + C], b: [x, zf - C], th, y0: F, y1: F + H - 0.42, openings: [], mat: 'plaster_white' });
  for (let k = 0; k < 5; k++) {
    const a = xs[k] + C, b = xs[k + 1] - C, mid = (a + b) / 2, door = k === 2, L = b - a;
    add({ t: 'wall', a: [a, zf], b: [b, zf], th, y0: F, y1: F + H - 0.42, openings: [door ? { at: L / 2, w: 2.6, h: 3.6, y0: F } : { at: L / 2, w: 2.0, h: 1.7, y0: F + 1.2 }], mat: 'plaster_white' });
    if (door) add({ t: 'tang_door', at: [mid, zf], axis: 'x', y: F, w: 2.6, h: 3.6, th, out: 1 });
    else add({ t: 'tang_window', at: [mid, zf], axis: 'x', y: F + 1.2, w: 2.0, h: 1.7, th });
  }
  // the ceiling (a ping'an of red boards over a grid of strips), the altar and Manjusri on his lion with his attendants
  add({ t: 'tang_pingan', rect: [x0 + 0.3, zb + 0.3, x1 - 0.3, zf - 0.3], y: F + H + 1.0, pitch: 0.3 });
  add({ t: 'block', rect: [x0 + 1.2, zb + 0.5, x1 - 1.2, zb + 4.6], y0: F, y1: F + 0.7, mat: 'limestone', walk: false });
  const A = F + 0.7, S = [0, 1];
  add({ t: 'obj', kind: 'mount', at: [cx, zb + 2.5], y: A, animal: 'lion', dir: S, rider: 3.4 });
  for (const s of [-1, 1]) {
    add({ t: 'obj', kind: 'statue', at: [cx + s * 3.0, zb + 2.7], y: A, type: 'bodhisattva', h: 3.7, dir: S, robe: 'clay_green', robe2: 'clay_robe' });
    add({ t: 'obj', kind: 'statue', at: [cx + s * 4.9, zb + 2.2], y: A, type: 'king', h: 4.1, dir: S, robe: 'clay_green', robe2: 'clay_robe' });
    add({ t: 'obj', kind: 'statue', at: [cx + s * 1.5, zb + 1.1], y: A, type: 'kneel', h: 1.95, dir: S, robe: 'clay_green', robe2: 'clay_robe' });
    add({ t: 'tang_lamp', at: [cx + s * 1.9, zf - 3.2], y: F, h: 1.25 });
  }
  // furnishing: the dado of red earth paint round the inside of the walls, the offering table before the altar with its
  // cloth and two oil lamps, kneeling mats, a path of worn slabs from the door, long banners at the sides [inferred: usual furnishing]
  for (const [r] of [[[x0 + 0.3, zb + 0.25, x1 - 0.3, zb + 0.29]], [[x0 + 0.25, zb + 0.3, x0 + 0.29, zf - 0.3]], [[x1 - 0.29, zb + 0.3, x1 - 0.25, zf - 0.3]]]) {
    add({ t: 'block', rect: r, y0: F, y1: F + 1.15, mat: 'wall_red', collide: false });
    add({ t: 'block', rect: [r[0] - (r[2] - r[0] > 1 ? 0 : 0.01), r[1] - (r[3] - r[1] > 1 ? 0 : 0.01), r[2] + (r[2] - r[0] > 1 ? 0 : 0.01), r[3] + (r[3] - r[1] > 1 ? 0 : 0.01)], y0: F + 1.15, y1: F + 1.22, mat: 'timber_red', collide: false });
  }
  add({ t: 'block', rect: [cx - 1.4, zb + 5.2, cx + 1.4, zb + 6.0], y0: F + 0.82, y1: F + 0.92, mat: 'timber_red' });
  for (const sx of [-1, 1]) for (const sz of [0.12, 0.68]) add({ t: 'block', rect: [cx + sx * 1.25 - 0.07, zb + 5.2 + sz - 0.07, cx + sx * 1.25 + 0.07, zb + 5.2 + sz + 0.07], y0: F, y1: F + 0.82, mat: 'timber_red', collide: false });
  add({ t: 'block', rect: [cx - 1.3, zb + 5.28, cx + 1.3, zb + 5.92], y0: F + 0.7, y1: F + 0.82, mat: 'timber_red', collide: false });
  add({ t: 'block', rect: [cx - 0.5, zb + 5.3, cx + 0.5, zb + 5.9], y0: F + 0.92, y1: F + 0.935, mat: 'cloth_red', collide: false });
  for (const sx of [-1, 1]) add({ t: 'tang_lamp', at: [cx + sx * 0.95, zb + 5.6], y: F + 0.92, h: 0.5 });
  for (const sx of [-1, 0, 1]) add({ t: 'block', rect: [cx + sx * 1.5 - 0.4, zb + 6.7, cx + sx * 1.5 + 0.4, zb + 7.4], y0: F, y1: F + 0.06, mat: 'cloth_ochre', collide: false });
  for (let z = zb + 7.8; z < zf - 0.3; z += 1.1) for (const r of [-0.6, 0.6]) add({ t: 'block', rect: [cx + r - 0.55, z + 0.03, cx + r + 0.55, Math.min(zf - 0.28, z + 1.07)], y0: F, y1: F + 0.012 + ((Math.round(z * 3) + (r > 0 ? 1 : 0)) % 3) * 0.005, mat: 'bluestone', collide: false });
  for (const sx of [-1, 1]) add({ t: 'block', rect: [cx + sx * 6.4 - 0.3, zb + 4.9, cx + sx * 6.4 + 0.3, zb + 4.92], y0: F + 1.3, y1: F + H + 0.95, mat: sx < 0 ? 'cloth_red' : 'cloth_ochre', collide: false });
  // the roof: a hipped roof of grey tiles, eaves 3 m past the column line on rafters, chiwei at the ridge's ends
  add({ t: 'hip_roof', c: [cx, (zb + zf) / 2], A: (x1 - x0) / 2 + 3.0, B: (zf - zb) / 2 + 3.0, y: F + H + 2.6, rise: 3.6, eaveSlope: 0.3, pow: 1.6, lift: 0.5, mat: 'tile_grey', soffit: 'timber_red', rafters: { out: 3.0, sp: 0.32 }, tangChiwei: 1.6 });
  return E;
}

function bellPavilion() {
  const E = [], add = (o) => (E.push(o), o), [cx, cz] = BELL, h = 3.1, hw = 2.6;
  add({ t: 'block', rect: [cx - hw - 1.0, cz - hw - 1.0, cx + hw + 1.0, cz + hw + 1.0], y0: Y - 0.2, y1: Y + 0.33, mat: 'limestone' });
  add({ t: 'floor', rect: [cx - hw - 1.0, cz - hw - 1.0, cx + hw + 1.0, cz + hw + 1.0], y: Y + 0.45, mat: 'sandstone_floor', th: 0.12 });
  add({ t: 'stair', rect: [cx - 1.0, cz - hw - 2.0, cx + 1.0, cz - hw - 1.0], dir: 's', y0: Y, y1: Y + 0.45, riser: 0.15, base: Y, mat: 'limestone' });
  const F2 = Y + 0.45, cols = [[-hw, -hw], [hw, -hw], [-hw, hw], [hw, hw]];
  for (const [a, b] of cols) add({ t: 'column', at: [cx + a, cz + b], y: F2, h: h, d: 0.4 });
  for (const [a, b] of cols) add({ t: 'tang_bracket_set', at: [cx + a, cz + b], y: F2 + h, dir: [Math.sign(a) / Math.SQRT2, Math.sign(b) / Math.SQRT2], kind: 'corner' });
  for (const s of [-1, 1]) {
    add({ t: 'block', rect: [cx - hw - 0.25, cz + s * hw - 0.16, cx + hw + 0.25, cz + s * hw + 0.16], y0: F2 + h - 0.4, y1: F2 + h, mat: 'timber_red', collide: false });
    add({ t: 'block', rect: [cx + s * hw - 0.16, cz - hw - 0.25, cx + s * hw + 0.16, cz + hw + 0.25], y0: F2 + h - 0.4, y1: F2 + h, mat: 'timber_red', collide: false });
    // low rails between the columns: a seat board and a bar (the bell is out of reach, not out of sight)
    add({ t: 'block', rect: [cx - hw + 0.2, cz + s * hw - 0.04, cx + hw - 0.2, cz + s * hw + 0.04], y0: F2 + 0.9, y1: F2 + 1.0, mat: 'timber_red', collide: false });
    add({ t: 'block', rect: [cx + s * hw - 0.04, cz - hw + 0.2, cx + s * hw + 0.04, cz + hw - 0.2], y0: F2 + 0.9, y1: F2 + 1.0, mat: 'timber_red', collide: false });
  }
  // the bell on its beam: a great bronze bell, the striking log slung beside it on two ropes
  add({ t: 'block', rect: [cx - hw, cz - 0.14, cx + hw, cz + 0.14], y0: F2 + h - 0.78, y1: F2 + h - 0.42, mat: 'timber_red', collide: false });
  add({ t: 'obj', kind: 'bell', at: [cx, cz], y: F2 + h - 0.78 - 1.5 });
  add({ t: 'hip_roof', c: [cx, cz], A: hw + 1.9, B: hw + 1.9, y: F2 + h + 2.2, rise: 2.5, eaveSlope: 0.3, pow: 1.6, lift: 0.4, mat: 'tile_grey', soffit: 'timber_red', rafters: { out: 1.9, sp: 0.32 }, tangChiwei: 0.5, noChiwei: false });
  return E;
}

/** A bronze incense burner (xianglu): a tripod cauldron with two handles on a stone base, a lid with a knob. */
function censer([x, z, y]) {
  return [
    { t: 'block', rect: [x - 0.9, z - 0.9, x + 0.9, z + 0.9], y0: y - 0.1, y1: y + 0.35, mat: 'limestone' },
    { t: 'obj', kind: 'censer', at: [x, z], y: y + 0.35 },
  ];
}

/**
 * The side stairs: at both ends of the front walls, flights from the courtyard to the middle terrace and from it to the upper
 * terrace, 4 m wide with a stone cheek wall each side (the front parapets are left open where they come up).
 */
function sideStairs() {
  const E = [];
  for (const s of [-1, 1]) {
    const z0 = s * 41 - 2, z1 = s * 41 + 2, zl = Math.min(z0, z1), zh = Math.max(z0, z1);
    E.push({ t: 'stair', rect: [-14, zl, -2, zh], dir: 'e', y0: 0, y1: 6.5, riser: 0.171, base: 0, mat: 'limestone' });
    E.push({ t: 'stair', rect: [18, zl, 30, zh], dir: 'e', y0: 6.5, y1: 13, riser: 0.171, base: 6.5, mat: 'limestone' });
    for (const [x0, x1, y0, y1] of [[-14, -2, 0, 6.5], [18, 30, 6.5, 13]]) for (const zz of [zl - 0.3, zh + 0.3]) for (let i = 0; i < 6; i++) {
      const t0 = i / 6, t1 = (i + 1) / 6;
      E.push({ t: 'block', rect: [x0 + (x1 - x0) * t0, zz - 0.3, x0 + (x1 - x0) * t1, zz + 0.3], y0: y0 - 0.1, y1: y0 + (y1 - y0) * t1 + 0.6, mat: 'limestone' });
    }
  }
  return E;
}

export const monasteryElements = () => [...wenshuHall(), ...bellPavilion(), ...CENSERS.flatMap(censer), ...sideStairs()];
