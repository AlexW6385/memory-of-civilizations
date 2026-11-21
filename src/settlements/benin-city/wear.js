// Benin City about 1600 — wear on what is walked (docs/settlements/benin-city.md §15.5): the hollow the feet have polished in each door-step of red earth, the worn
// patch inside the threshold, the beaten path to the furnace and the soot round its mouth in the casters' yards, the dark of the splashed water round the lane's water jars.
// Wraps the style's elements from here (the style's files stay as they were); pure functions of the element's own numbers, in materials the tiles already hold.
// Nothing is written anywhere: the Edo had no script to put on a tablet or a shop's board (§15.1), and no Latin or other lettering is guessed.
import '../../styles/benin/index.js';
import './walkwork.js';
import { box, lathe } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { frame } from '../../styles/greek/agora.js';
import { houseDoor } from '../../styles/benin/house.js';

let depth = 0;
const wrapHouse = (fn) => function worn(el, ctx) {
  const r = fn.call(this, el, ctx);
  if (depth > 0 || el.simple) return r;
  const F = frame(el.rect, el.front ?? 's'), H = houseDoor(el, F.L), y = el.y ?? 0, { bag } = ctx;
  const put = (mat, u0, v0, u1, v1, y0, y1) => { const [x0, z0, x1, z1] = F.R(u0, v0, u1, v1); bag.add(mat, box(x0, y0, z0, x1, y1, z1)); };
  // the door-step (top 0.12 above the street): polished darker where every foot lands, in a hollow wider toward the middle, the edge dulled
  put('scoria_red', H.door - 0.8, -0.85, H.door + 0.8, -0.12, y + 0.12, y + 0.126);
  put('scoria_red', H.door - 0.45, -0.7, H.door + 0.45, -0.25, y + 0.126, y + 0.131);
  // inside the threshold (the floor 0.25 above the street): the same polish and the dust of the street carried in
  put('scoria_red', H.door - 0.6, 0.3, H.door + 0.6, 0.95, y + 0.25, y + 0.256);
  return r;
};
const wrapYard = (fn) => function worn(el, ctx) {
  const r = fn.call(this, el, ctx);
  if (depth > 0 || el.simple) return r;
  const F = frame(el.rect, el.front), { D, L } = F, { bag } = ctx, put = (mat, u0, v0, u1, v1, y0, y1) => { const [x0, z0, x1, z1] = F.R(u0, v0, u1, v1); bag.add(mat, box(x0, y0, z0, x1, y1, z1)); };
  if ((el.kind ?? 'cast') === 'cast') {
    // the soot and ash round the furnace's mouth, the beaten path to it from the lane
    const [fx, fz] = F.P(4.2, D - 9);
    bag.add('obsidian', lathe([[0.9, 0.052], [1.7, 0.052], [1.7, 0.056], [0.9, 0.056]], 14, null, fx, 0, fz));
    put('scoria_red', 3.5, 4.0, 4.9, D - 10.2, 0.05, 0.054);
  }
  put('scoria_red', L / 2 - 0.9, 0.3, L / 2 + 0.9, 3.4, 0.05, 0.054);                  // the yard's gap on the lane: the earth trodden dark
  return r;
};

// the palace (landmark plan: only materials it already holds). Red earth wears smooth and dark where feet go: on the chalked way of the court of audience the red
// clay is trodden to the tuff beneath, in the great gallery the way from the court to the dais is polished and the dais's two treads are hollowed at their middle [inferred].
const wrapAudience = (fn) => function worn(el, ctx) {
  const r = fn.call(this, el, ctx);
  if (el.simple || depth > 0) return r;
  const { bag } = ctx, ax = el.axis, z0 = el.z0, z1 = el.z1;
  bag.add('tuff_red', box(ax - 0.75, 0.07, z1, ax + 0.75, 0.0725, z0));                  // the trodden middle of the way, its whole length
  bag.add('tuff_red', box(ax - 1.7, 0.07, z1, ax + 1.7, 0.0715, z1 + 5.5)); // wider where the way turns toward the great gallery
  bag.add('tuff_red', box(ax - 1.7, 0.07, z0 - 5.5, ax + 1.7, 0.0712, z0));                // and wider at the gate end, where those who come in gather and wait
  return r;
};
const wrapHall = (fn) => function worn(el, ctx) {
  const r = fn.call(this, el, ctx);
  if (el.simple || el.near === false || depth > 0) return r;
  const { bag } = ctx, [x0, z0, x1, z1] = el.rect, cx = (x0 + x1) / 2, Y = 0.35, dz1 = z0 + 5.4;
  bag.add('stucco_red', box(cx - 1.0, Y, dz1, cx + 1.0, Y + 0.006, z1 - 0.8));            // the way from the court to the dais, between the two rows of pillars
  bag.add('stucco_red', box(cx - 1.4, Y, dz1, cx + 1.4, Y + 0.004, dz1 + 1.5));           // widened before the dais, where those called forward stand
  bag.add('stucco_red', box(cx - 0.9, Y + 0.45, dz1 - 0.4, cx + 0.9, Y + 0.456, dz1));    // the lower tread, hollowed at its middle
  bag.add('stucco_red', box(cx - 0.8, Y + 0.9, dz1 - 1.2, cx + 0.8, Y + 0.906, dz1 - 0.4)); // the upper tread
  return r;
};

let done = false;
export function registerWear() {
  if (done) return; done = true;
  const E = STYLES.benin.elements;
  if (typeof E.benin_house === 'function') E.benin_house = wrapHouse(E.benin_house);
  if (typeof E.benin_audience === 'function') E.benin_audience = wrapAudience(E.benin_audience);
  if (typeof E.benin_hall === 'function') E.benin_hall = wrapHall(E.benin_hall);
  if (typeof E.caster_yard === 'function') E.caster_yard = wrapYard(E.caster_yard);
}
registerWear();
