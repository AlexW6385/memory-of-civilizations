// Mycenae about 1250 BC — three plans for the main room of a house instead of one (docs/settlements/mycenae.md §17.3). The style's `living` (furnish.js) lays every house's front
// room out alike (hearth in the middle, the pithoi at the door wall, the table at the back). Here a house keeps that plan for one in three, by the hash of its own place, and takes
// one of two others otherwise: (B) the hearth set back, the store jars along the back wall, the table on the side wall and a loom by the door wall's far corner; (C) the one-room
// house: the bed and chest in the back corner by the hearth, a bench down the door-side wall. The householders' one big room served for cooking, weaving, eating and sleeping
// [inferred: the plans of the excavated houses at Mycenae and Tiryns are not recorded here, §16 says so for all furnishing]. The door's lane (u of the door, the first 3.2 m inward) is
// kept free in every plan. Only the style's own furnisher calls are used (same materials), and rooms are built only in the near plans, so no draw is added. Nothing is imported
// from another settlement.
import '../../styles/mycenaean/index.js';
import { FIT } from '../../styles/mycenaean/furnish.js';
import { hashAt } from './nightlight.js';

let done = false;
export function registerRooms() {
  if (done) return; done = true;
  const base = FIT.living;
  FIT.living = function living(F, r, o = {}) {
    const { u0, v0, u1, v1 } = r, cu = (u0 + u1) / 2, cv = (v0 + v1) / 2, door = o.door ?? 0, light = !!o.light;
    const [px, , pz] = F.pp(cu, cv, 0), k = Math.floor(hashAt(px, pz, 77) * 3);
    if (k === 0 || v1 - v0 < 4.2 || u1 - u0 < 5.6) return base.call(this, F, r, o);
    const side = door < cu ? 1 : -1, ub = side > 0 ? u1 : u0, uw = side > 0 ? u0 : u1, rand = F.rand;
    const lo = (a, b) => [Math.min(a, b), Math.max(a, b)];
    if (k === 1) {
      F.hearth(cu, cv + 0.45, 0.6, light);
      F.pithos(ub - side * 0.5, v1 - 0.55, 1); F.pithos(ub - side * 1.35, v1 - 0.5, 0.85); F.amphora(ub - side * 2.05, v1 - 0.4, 1); F.amphora(ub - side * 2.45, v1 - 0.45, 0.9);
      F.table(ub - side * 0.75, cv - 0.2, 0.7, 1.1); F.stool(ub - side * 1.6, cv - 0.2); F.stool(ub - side * 0.75, cv + 0.85);
      F.loom(ub - side * 1.3, v0 + 0.3, ['cloth_ochre', 'cloth_red', 'cloth_indigo'][Math.floor(rand() * 3)], 1.4);
      F.shelf(...lo(uw + side * 0.3, uw + side * 2.3), v1 - 0.02, 1.45, 4, -1);
      F.quern(uw + side * 0.6, v1 - 0.75); F.basket(uw + side * 0.4, v1 - 1.6);
      for (let i = 0; i < 3; i++) F.hang(cu - 0.7 + i * 0.7 + rand() * 0.2, cv + 1.0 + (rand() - 0.5), 2.3);
    } else {
      F.hearth(cu, cv - 0.15, 0.6, light);
      const [b0, b1] = lo(ub - side * 2.3, ub - side * 0.12);
      F.bed(b0, v1 - 1.15, b1, v1 - 0.12, ['cloth_indigo', 'cloth_red', 'cloth_ochre'][Math.floor(rand() * 3)]);
      F.chest(ub - side * 0.6, v1 - 1.85);
      F.pithos(ub - side * 0.5, v0 + 0.55, 1); F.amphora(ub - side * 1.3, v0 + 0.4, 1);
      F.quern(ub - side * 0.6, cv - 0.1);
      F.table(cu + side * 1.5, v0 + 0.0 + 1.9, 1.1, 0.7); F.stool(cu + side * 0.85, v0 + 1.9); F.stool(cu + side * 2.15, v0 + 1.9);
      const [c0, c1] = lo(uw + side * 0.1, uw + side * 0.55);
      F.bench(c0, cv + 0.9, c1, v1 - 0.3, 0.42);
      F.shelf(...lo(uw + side * 0.9, uw + side * 2.9), v1 - 0.02, 1.45, 4, -1);
      F.basket(uw + side * 0.9, v1 - 0.5);
      for (let i = 0; i < 3; i++) F.hang(cu - 0.7 + i * 0.7 + rand() * 0.2, cv + (rand() - 0.5) * 1.5, 2.3);
    }
  };
}
registerRooms();
