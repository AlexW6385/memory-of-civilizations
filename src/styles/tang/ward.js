// The ward (fang) and its gates: rammed-earth walls 3.2 m high, battered, capped with tile; the gate: two piers of rammed
// earth, a timber deck across the passage, a three-bay gate building on it with owl tails; the drum pavilion.

import { box, frustum } from '../../core/geom.js';
import { inFrame, YAW } from './kit.js';
import { buildHall } from './hall.js';

/** fang_wall { a, b (axis-aligned), h (3.2), th (2.6), gaps: [[s0, s1]] (distance from a) }: the wall in pieces between the gaps. */
export function fangWall(el, { bag, col }) {
  const [ax, az] = el.a, [bx, bz] = el.b, h = el.h ?? 3.2, th = el.th ?? 2.6, bt = 0.38, along = Math.abs(bx - ax) > Math.abs(bz - az);
  const L = along ? Math.abs(bx - ax) : Math.abs(bz - az), sgn = along ? Math.sign(bx - ax) : Math.sign(bz - az);
  const gaps = (el.gaps || []).slice().sort((p, q) => p[0] - q[0]);
  const piece = (s0, s1) => {
    if (s1 - s0 < 0.3) return;
    const u0 = Math.min(s0, s1), u1 = Math.max(s0, s1);
    const r = along ? [Math.min(ax + sgn * u0, ax + sgn * u1), az - th / 2, Math.max(ax + sgn * u0, ax + sgn * u1), az + th / 2] : [ax - th / 2, Math.min(az + sgn * u0, az + sgn * u1), ax + th / 2, Math.max(az + sgn * u0, az + sgn * u1)];
    const b = along ? [0, 0, bt, bt] : [bt, bt, 0, 0];
    bag.add('earth_wall', frustum(r, 0, h, ...b, { noBottom: true }));
    const c = along ? [r[0] - 0.05, r[1] + bt - 0.18, r[2] + 0.05, r[3] - bt + 0.18] : [r[0] + bt - 0.18, r[1] - 0.05, r[2] - bt + 0.18, r[3] + 0.05];
    bag.add('tile_grey', frustum(c, h, h + 0.32, along ? 0 : 0.1, along ? 0 : 0.1, along ? 0.1 : 0, along ? 0.1 : 0, {}));
    col.rect(r, 0, h + 0.3);
  };
  let s = 0;
  for (const [g0, g1] of gaps) { piece(s, g0); s = g1; }
  piece(s, L);
}

/**
 * fang_gate { c, axis ('x': a wall running east–west with the passage along z; 'z': the wall runs north–south), w (passage, 6.4), T (wall thickness 2.6) }.
 * Local frame: x along the wall, z through it.
 */
export function fangGate(el, ctx) {
  const w = el.w ?? 6.4, T = el.T ?? 2.6, P = 3.4, ph = 3.5, D = T + 1.2, W = w + 2 * P;
  inFrame(ctx, el.c, el.axis === 'z' ? YAW.e : YAW.s, (L) => {
    const { bag, col } = L;
    for (const s of [-1, 1]) {
      const r = [s > 0 ? w / 2 : -w / 2 - P, -D / 2, s > 0 ? w / 2 + P : -w / 2, D / 2];
      bag.add('earth_wall', frustum(r, 0, ph, 0.18, 0.18, 0.18, 0.18, { noBottom: true })); col.rect(r, 0, ph + 0.1);
    }
    // the deck across the passage (its soffit of timber) and the great lintel; the gate building on it
    bag.add('timber', box(-W / 2, ph, -D / 2, W / 2, ph + 0.5, D / 2));
    bag.add('timber_red', box(-w / 2 - 0.3, ph - 0.45, -D / 2 + 0.1, w / 2 + 0.3, ph, D / 2 - 0.1));
    col.rect([-W / 2, -D / 2, W / 2, D / 2], ph + 0.0, ph + 0.5);
    buildHall(L, { w: W - 1.0, d: 5.2, y: ph + 0.5, plat: 0.14, H: 3.0, nb: 3, kind: 'open', det: 1, bh: 0.95, over: 1.9, steps: false, roof: 'hip', through: true, pal: { plinth: 'timber' } });
    // the door leaves, swung back against the piers (open), with their iron studs
    for (const s of [-1, 1]) bag.add('wood_dark', box(s * (w / 2 - 0.02) - 0.07, 0, -D / 2 + 0.1, s * (w / 2 - 0.02) + 0.07, ph - 0.5, -D / 2 + 1.55));
  });
}

/** drum_tower { c, face }: a platform of rammed earth with the pavilion of the street drum on it. */
export function drumTower(el, ctx) {
  inFrame(ctx, el.c, YAW[el.face || 's'], (L) => {
    const { bag, col } = L, S = 4.6;
    bag.add('earth_wall', frustum([-S, -S, S, S], 0, 4.6, 0.5, 0.5, 0.5, 0.5, { noBottom: true })); col.rect([-S, -S, S, S], 0, 4.6);
    bag.add('brick_grey', box(-S - 0.1, 0, S - 0.1, S + 0.1, 0.5, S + 0.1)); 
    buildHall(L, { w: 7.2, d: 7.2, y: 4.6, plat: 0.2, H: 3.6, nb: 3, kind: 'open', det: 1, bh: 1.1, over: 2.1, steps: false, roof: 'hip', big: true, through: true, sides: false });
    // the great drum on its stand, seen between the columns
    bag.add('lacquer_red', box(-0.9, 4.8, -0.9, 0.9, 5.0, 0.9)); bag.add('hide_tan', box(-0.85, 5.0, -0.3, 0.85, 6.6, 0.3));
  });
}

export const WARD_ELEMENTS = { fang_wall: fangWall, fang_gate: fangGate, drum_tower: drumTower };
