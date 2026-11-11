// A pylon of the Karnak axis (docs/settlements/thebes.md §5): two battered towers with their torus roll and cavetto cornice,
// flagstaff niches in the face and the colossal reliefs (the egyptian vocabulary's pylon_tower), the gate between them half the
// towers' height under its own lintel mass with the winged disc and the registers of offering scenes, the cedar doors
// open against the reveals, the cedar flagstaffs with their banners, the colossi at the gate.
// Local frame: the axis along z, the façade on the +z side (front 'zp'), the towers' rect [−half, z0, half, z1].
import { pylonTower, wingedDiscObj, gateReliefs, doorLeaves } from '../egyptian/objects.js';
import { trim } from '../egyptian/trim.js';
import { box } from '../../core/geom.js';
import { flagstaff, colossus } from './monuments.js';

/** nk_pylon: { z0, z1, half, g (half the gate), h, b (batter), gateH, flags (poles), simple, colossi, y0 } */
export function nkPylon(el, ctx) {
  const { bag, col } = ctx;
  const { z0, z1, half, h } = el, g = el.g ?? 4, b = el.b ?? Math.min(3, h * 0.08), y0 = el.y0 ?? 0, gateH = el.gateH ?? Math.round(h / 2);
  const mat = el.mat ?? 'sandstone', simple = !!el.simple;
  for (const s of [-1, 1]) {
    const rect = s < 0 ? [-half, z0, -g, z1] : [g, z0, half, z1], tw = half - g;
    const niches = el.flags ? [0.28, 0.72].map((f) => ({ x: s * (g + tw * f), w: 1.6, depth: 0.7, top: h * 0.68 })) : [];
    pylonTower({ rect, y0, h, batter: b, front: 'zp', batterEnds: s < 0 ? [b, 0] : [0, b], niches, trim: { torus: 0.45, cornice: Math.min(2.4, h * 0.07) }, mat, towardDoor: -s, simple, reliefs: !simple }, ctx);
    for (const n of niches) flagstaff({ at: [n.x, z1 - 0.15], y: y0, h: el.poleH ?? 40, side: s }, ctx);
  }
  // the gate: the passage between the towers, the lintel mass over it, its own cornice
  const top = Math.round(h * 0.86);
  bag.add(mat, box(-g, y0 + gateH, z0 + 0.4, g, y0 + top, z1 - 0.4));
  col.rect([-g, z0 + 0.4, g, z1 - 0.4], y0 + gateH, y0 + top);
  trim({ t: 'block', rect: [-g - 0.3, z0 + 0.4, g + 0.3, z1 - 0.4], y0: y0 + gateH, y1: y0 + top, mat, trim: { torus: 0.4, cornice: Math.min(2.0, h * 0.06), corners: false } }, ctx);
  doorLeaves({ at: [0, z1 - 1.6], y: y0, yaw: Math.PI, w: g * 2 - 0.4, h: gateH - 1.2, th: 0.28, depth: 0.25 }, ctx);
  if (!simple) {
    wingedDiscObj({ at: [0, z1 - 0.4], y: y0 + gateH + 0.3, w: g * 2 - 0.8, h: 2.2, yaw: 0 }, ctx);
    wingedDiscObj({ at: [0, z0 + 0.4], y: y0 + gateH + 0.3, w: g * 2 - 0.8, h: 2.2, yaw: Math.PI }, ctx);
    gateReliefs({ z: z1 - 0.4, face: 'zp', y: y0, x0: -g + 0.2, x1: g - 0.2, door: [-g + 0.2, g - 0.2], doorTop: gateH, from: gateH + 3, top: top - 0.8 }, ctx);
  }
  if (el.colossi) for (const s of [-1, 1]) colossus({ at: [s * (g + 5.5), z1 + 3.4], y: y0, yaw: 0, h: el.colossi }, ctx);
}
