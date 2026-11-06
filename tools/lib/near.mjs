// What of a settlement lies near a point (tools/showroom.mjs --site): its plans within a distance,
// the town's cut down to their elements within it. Shared by the showroom's page and the tests.
//
// The town's plans cover the whole disc (their bounds are the settlement's), so a town plan is cut
// down to the elements near the point, by the points each is placed by (rect, at, c, a, b, pts,
// path); an element without any is kept. A landmark is kept whole if its bounds come within reach
// (trim 'all': cut down too; 'none': every plan within reach by its bounds, whole).
import { toWorld } from '../../src/core/build.js';

const isPt = (v) => Array.isArray(v) && v.length >= 2 && Number.isFinite(v[0]) && Number.isFinite(v[1]);

/** The rectangle [x0, z0, x1, z1] (plan coordinates) of the points an element is placed by, or null. */
export function extent(el) {
  const P = [];
  if (Array.isArray(el.rect) && el.rect.length === 4 && el.rect.every(Number.isFinite)) P.push([el.rect[0], el.rect[1]], [el.rect[2], el.rect[3]]);
  for (const k of ['at', 'c', 'a', 'b']) if (isPt(el[k])) P.push(el[k]);
  for (const k of ['pts', 'path']) if (Array.isArray(el[k])) for (const q of el[k]) if (isPt(q)) P.push(q);
  if (!P.length) return null;
  let x0 = Infinity, z0 = Infinity, x1 = -Infinity, z1 = -Infinity;
  for (const [x, z] of P) { x0 = Math.min(x0, x); z0 = Math.min(z0, z); x1 = Math.max(x1, x); z1 = Math.max(z1, z); }
  return [x0, z0, x1, z1];
}

/** Horizontal distance from (x, z) in the settlement's frame to a rectangle of a plan's coordinates. */
export function distance(plan, [x0, z0, x1, z1], x, z) {
  let a = Infinity, b = Infinity, c = -Infinity, d = -Infinity;
  for (const [px, pz] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) {
    const w = toWorld(plan, px, pz);
    a = Math.min(a, w[0]); b = Math.min(b, w[2]); c = Math.max(c, w[0]); d = Math.max(d, w[2]);
  }
  return Math.hypot(Math.max(a - x, 0, x - c), Math.max(b - z, 0, z - d));
}

/**
 * entries: [{ plan, landmark, ...anything }]. Returns the entries near (x, z), each with its plan
 * cut down where need be (a copy: the original is untouched), and counts of the elements.
 */
export function nearPlans(entries, x, z, radius, trim = 'town') {
  const out = [];
  let kept = 0, total = 0;
  for (const e of entries) {
    const plan = e.plan;
    total += plan.elements.length;
    if (distance(plan, plan.bounds, x, z) > radius) continue;
    if (trim === 'none' || (e.landmark && trim !== 'all')) { out.push(e); kept += plan.elements.length; continue; }
    const els = plan.elements.filter((el) => { const r = extent(el); return !r || distance(plan, r, x, z) <= radius; });
    if (!els.length) continue;
    kept += els.length;
    out.push({ ...e, plan: els.length === plan.elements.length ? plan : { ...plan, elements: els } });
  }
  return { entries: out, kept, total };
}
