// Fewer plans for the same picture (the budget of DESIGN §8 counts a mesh for every material of every plan).
// The viewer already merges the plans that are always shown (no near or far radius) per material settlement-wide
// (src/engine/merge.js), so plans of one style and one set of bounds that are always shown can be one plan with
// no change to what is drawn: the elements go in one after another, in the order of the plans.
const extra = (p) => Object.keys(p).filter((k) => !['id', 'style', 'elements', 'rooms', 'bounds', 'origin', 'base', 'yaw', 'feature', 'entrance'].includes(k));

/** The plans with the always-shown ones of one style and bounds joined (the first of each group keeps its id and place). */
export function mergeAlways(plans) {
  const out = [], first = new Map();
  for (const p of plans) {
    if (p.style === 'life' || p.near || p.far || p.center || extra(p).length || p.id === 'ming-suzhou-garden') { out.push(p); continue; }
    // (a feature plan's bounds are not read by the viewer, which skips such plans in locate(); the joined plan gets the union)
    const k = `${p.style}|${p.feature ? '' : p.bounds}|${p.base}|${p.yaw}|${p.origin}|${p.feature}`;
    const q = first.get(k);
    if (!q) { first.set(k, p); out.push(p); continue; }
    q.elements = q.elements.concat(p.elements);
    q.rooms = (q.rooms || []).concat(p.rooms || []);
    if (p.bounds && q.bounds) q.bounds = [Math.min(q.bounds[0], p.bounds[0]), Math.min(q.bounds[1], p.bounds[1]), Math.max(q.bounds[2], p.bounds[2]), Math.max(q.bounds[3], p.bounds[3])];
  }
  return out;
}
