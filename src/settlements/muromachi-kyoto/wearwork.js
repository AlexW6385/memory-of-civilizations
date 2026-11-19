// Muromachi Kyoto: where the stone is worn and mossy (docs/settlements/muromachi-kyoto.md §12). Feet wear a dish into the middle of every tread of the
// stream's steps and of the Tōgu-dō's (cut into the steps themselves: street.js, zen.js); damp and shade bring moss to the Tōgu-dō's lower
// tread and along the outer course of the stone gutters (here). (Moss on the stream's steps was tried and given up: it was three more draws.) Everything by the hash of its place: no counters, no Math.random.
import { hashAt } from './nightlight.js';
import { GINKAKU } from './layout.js';

/** Moss on the two granite treads before the Tōgu-dō (the hall faces east; the steps lead up westward). */
export function togudoWear() {
  const [ax, az] = GINKAKU.togudo, h = 3.5;
  return [0, 1].map((k) => ({ t: 'kyoto_wear', kind: 'tread', at: [ax + h + 1.3 + (1.5 - k) * 0.35, az], y: 0.33 * (k + 1), rot: Math.PI, d: 0.35, w: 1.8, moss: k === 0 }));
}
/** Moss on the outer course of the stone gutters (the `gutter` elements), a cushion now and then. */
export function gutterMoss(gutters) {
  const E = [];
  for (const g of gutters) {
    if (g.t !== 'gutter') continue;
    const [ax, az] = g.a, [bx, bz] = g.b, alongX = Math.abs(bx - ax) > Math.abs(bz - az), L = alongX ? Math.abs(bx - ax) : Math.abs(bz - az), y = g.y ?? 0;
    for (let a = 1.5 + hashAt(ax, az, 7) * 5; a < L - 1; a += 5 + hashAt(ax + a, az, 8) * 6) {
      const x = alongX ? Math.min(ax, bx) + a : ax, z = alongX ? az : Math.min(az, bz) + a, side = hashAt(x, z, 9) < 0.5 ? -1 : 1;
      if (hashAt(x, z, 10) > 0.25) continue;
      E.push({ t: 'kyoto_wear', kind: 'moss', at: alongX ? [x, z + side * 0.25] : [x + side * 0.25, z], y: y + 0.05, r: 0.16 + hashAt(x, z, 11) * 0.16 });
    }
  }
  return E;
}
