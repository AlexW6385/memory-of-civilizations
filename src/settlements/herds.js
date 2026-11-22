// The herds, flocks and yard groups of the settlements as moving animals (src/engine/critter-models-farm.js, the grazer pose): the still animal figures of a
// settlement's plans that stand about unharnessed (not drawing a cart, ridden or laden) are taken out of the plans here and put back as critters by the
// settlement's fauna.js. The table (herds-data.js) is made by tools/herds-gen.mjs from the plans as they are: one row per animal of a chosen group, in world
// metres, [kind, x, z, y, rot, model, range]; a row with no model is a still animal that is dropped without a critter (a group is thinned to eight). The plans
// are filtered after they are built, so no random stream of any builder changes. Pure data and plain arithmetic: the workers import it.
import { HERDS } from './herds-data.js';

/** Is the global switch on? (the generator turns it off to read the plans as they are built) */
export const herds = { on: true };

const near = (a, b) => Math.abs(a - b) < 0.04;
/** A plan element's place in the world: the plan's origin and yaw (as src/core/build.js toWorld). */
function world(plan, x, z) {
  const [ox, oz] = plan.origin || [0, 0], a = -(plan.yaw || 0) * Math.PI / 180, c = Math.round(Math.cos(a)), s = Math.round(Math.sin(a));
  return [ox + c * x + s * z, oz - s * x + c * z];
}

/** The settlement's plans without the animals its fauna.js draws as critters. */
export function dropHerds(id, plans) {
  const rows = HERDS[id];
  if (!rows || !herds.on) return plans;
  const left = rows.map((r) => r);
  return plans.map((p) => {
    if (!p.elements?.some((e) => e.t === 'animal')) return p;
    const els = p.elements.filter((e) => {
      if (e.t !== 'animal') return true;
      const [x, z] = world(p, e.at[0], e.at[1]), k = left.findIndex((r) => r && r[0] === e.kind && near(r[1], x) && near(r[2], z));
      if (k < 0) return true;
      left[k] = null;
      return false;
    });
    return els.length === p.elements.length ? p : { ...p, elements: els };
  });
}

/** The critters of the settlement's herds (for its fauna.js): `critters.push(...herdCritters(id))`. */
export function herdCritters(id) {
  const out = [];
  (HERDS[id] || []).forEach(([, x, z, y, rot, model, range], i) => {
    if (!model) return;
    out.push(model.startsWith('goat') ? { model, at: [x, y, z], rot, range: [9, 3.2] } : { model, at: [x, y, z], rot, range: [range, range * 0.7], tau: 26 + (i % 7) * 2.5 });
  });
  return out;
}
