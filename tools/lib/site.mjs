// A settlement of its own (src/settlements/<id>/) in Node, for the checks: its plans, and the
// collision world the viewer walks it in (src/engine/world.js, Settlement) — its ground on its
// disc, its water, and every plan's colliders and top field (roofs, wall tops, terraces).

import { MODULES, GROUNDS } from '../../src/settlements/grounds.js';
import { SITES } from '../../src/planet/sites.js';
import { ARRIVALS } from '../../src/planet/arrivals.js';
import { buildPlan } from '../../src/core/build.js';
import { CollisionWorld, topField } from '../../src/core/collide.js';

export const SETTLEMENTS = Object.keys(MODULES);
export const isSettlement = (id) => !!MODULES[id];
export const radiusOf = (id) => SITES.find((s) => s.id === id)?.radius ?? 400;
export const arrivalOf = (id) => ARRIVALS[id];

/** The settlement's module and its plans: { mod, landmarks: [{ plan, music }], town: [plan] }. */
export async function sitePlans(id) {
  const mod = await MODULES[id]();
  return { mod, landmarks: mod.landmarks || [], town: mod.town ? await mod.town() : [] };
}

const TCELL = 16;

/**
 * A collision world whose top fields are indexed by place: a settlement has hundreds of plans,
 * and the base class looks through all of their fields at every query. Same answers.
 */
export class SiteWorld extends CollisionWorld {
  constructor() { super(); this.topGrid = new Map(); }
  add(c) {
    super.add(c);
    const T = c.tops;
    if (!T) return;
    const x1 = T.x0 + T.w * T.res, z1 = T.z0 + T.h * T.res;
    for (let i = Math.floor((T.x0 - 1) / TCELL); i <= Math.floor((x1 + 1) / TCELL); i++) {
      for (let j = Math.floor((T.z0 - 1) / TCELL); j <= Math.floor((z1 + 1) / TCELL); j++) {
        const k = i + ',' + j;
        (this.topGrid.get(k) || this.topGrid.set(k, []).get(k)).push(T);
      }
    }
  }
  _withTops(x, z, f) {
    const all = this.tops;
    this.tops = this.topGrid.get(Math.floor(x / TCELL) + ',' + Math.floor(z / TCELL)) || [];
    try { return f(); } finally { this.tops = all; }
  }
  topAt(x, z, r, maxY) { return this._withTops(x, z, () => super.topAt(x, z, r, maxY)); }
  inShell(x, z, r, y0, y1, climb) { return this._withTops(x, z, () => super.inShell(x, z, r, y0, y1, climb)); }
}

/**
 * The settlement as the viewer walks it: its ground inside its disc (nothing beyond: the checks
 * stay on the disc), its water, and every plan built (one at a time, the geometry let go once its
 * top field is made). onError(plan, error) for a plan that does not build (default: thrown).
 * Returns { cw, landmarks, town, radius, arrival, failed: [[planId, message]] }.
 */
export async function siteWorld(id, { tops = true, onPlan = null } = {}) {
  const G = GROUNDS[id], radius = radiusOf(id);
  const { mod, landmarks, town } = await sitePlans(id);
  const cw = new SiteWorld();
  cw.terrain = (x, z) => (Math.hypot(x, z) < radius ? G.height(x, z) : -Infinity);
  cw.water = (x, z, y) => Math.hypot(x, z) < radius && G.water(x, z, y);
  cw.waterLevel = (x, z) => (Math.hypot(x, z) < radius ? G.waterLevel(x, z) : -Infinity);
  const failed = [];
  for (const plan of [...landmarks.map((l) => l.plan), ...town]) {
    if (plan.nocollide) continue;
    let built;
    try { built = buildPlan(plan, { detail: true }); } catch (e) { failed.push([plan.id, e.message]); continue; }
    if (tops) built.colliders.tops = await topField(built.parts);
    cw.add(built.colliders);
    for (const { geometry } of built.parts) geometry.dispose();
    built = null;
    onPlan?.(plan);
  }
  return { cw, mod, landmarks, town, radius, arrival: arrivalOf(id), failed };
}
