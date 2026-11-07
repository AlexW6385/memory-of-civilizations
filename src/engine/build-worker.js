// Worker: a settlement's townscape is laid out and every plan of it built off the main thread
// (DESIGN §8: loading never costs a frame more than 4 ms). The page sends { init: three's URL },
// then jobs { job, id } (a settlement of its own); the worker answers { job, count } and then, plan
// by plan, { job, index, header, built } — the plan without its elements, and its geometry as
// transferable arrays (merged parts, instanced prototypes, lights, colliders with the top field).
// { cancel: job } stops a job between plans (the settlement was let go of).
//
// The coarse versions of the repeated pieces (src/engine/cells.js coarse: up to a quarter second
// for a plant of 1700 triangles) are made here too, once per shape and worker, and sent with
// each prototype: the page's merge (merge.js) and street life (life-instances.js) only use them.

let ready = null;
const cancelled = new Set();
let build, collide, grounds, cells, palette;
/** The coarse versions made, by shape (a hash of the prototype). */
const coarseCache = new Map();

self.onmessage = async (e) => {
  const d = e.data;
  if (d.init) {
    self.THREE_CORE_URL = d.init;
    ready = (async () => {
      build = await import('../core/build.js');
      collide = await import('../core/collide.js');
      await import('../objects/index.js');
      grounds = await import('../settlements/grounds.js');
      cells = await import('./cells.js');
      palette = await import('../core/palette.js');
    })();
    ready.catch((err) => self.postMessage({ fatal: String(err?.stack || err) }));
    return;
  }
  if (d.cancel !== undefined) { cancelled.add(d.cancel); return; }
  if (d.warm) { warmQueue.push(d.warm); pumpWarm(); return; }
  const { job, id, part = 0, of = 1 } = d;
  active++;
  try {
    await ready;
    let mod;
    for (let i = 0; ; i++) { try { mod = await grounds.MODULES[id](); break; } catch (err) { if (i >= 3) throw err; await new Promise((r) => setTimeout(r, 600 * (i + 1))); } }
    const town = await mod.town();
    if (cancelled.has(job)) return done(job);
    const plans = [...mod.landmarks.map((p) => p.plan), ...town];
    self.postMessage({ job, count: plans.length, landmarks: mod.landmarks.length });
    for (let i = part; i < plans.length; i += of) {
      if (cancelled.has(job)) return done(job);
      const plan = plans[i];
      const out = await buildOne(plan);
      self.postMessage({ job, index: i, header: header(plan), built: out.built }, out.transfer);
    }
    done(job);
  } catch (err) {
    self.postMessage({ job, error: String(err?.stack || err) });
  } finally { active--; }
};

// modules fetched ahead (Builder.warm), one at a time and only while no settlement is being built
const warmQueue = [];
let active = 0, warming = false;
async function pumpWarm() {
  if (warming) return;
  warming = true;
  try {
    await ready;
    while (warmQueue.length) {
      while (active > 0) await new Promise((r) => setTimeout(r, 250));
      const id = warmQueue.shift();
      try { await grounds.MODULES[id]?.(); } catch { /* fetched again when needed */ }
      await new Promise((r) => setTimeout(r, 30));
    }
  } finally { warming = false; }
}

function done(job) { cancelled.delete(job); self.postMessage({ job, done: true }); }

/** A plan without its elements, and without anything that cannot be sent (functions). */
function header(plan) {
  const h = {};
  for (const [k, v] of Object.entries(plan)) {
    if (k === 'elements' || typeof v === 'function') continue;
    try { structuredClone(v); h[k] = v; } catch { /* not sendable: not needed by the viewer */ }
  }
  return h;
}

async function buildOne(plan) {
  const b = build.buildPlan(plan, { instancing: true, detail: true });
  const transfer = [];
  const tops = plan.nocollide ? null : await collide.topField(build.flatParts(b));
  if (tops) transfer.push(tops.data.buffer, tops.under.buffer);
  const parts = b.parts.map(({ mat, geometry, detail, shadowBig }) => {
    const pos = geometry.attributes.position.array, nor = geometry.attributes.normal.array, index = geometry.index?.array ?? null;
    const bb = geometry.boundingBox, bs = geometry.boundingSphere;
    transfer.push(pos.buffer, nor.buffer);
    if (index) transfer.push(index.buffer);
    return { mat, detail, shadowBig, pos, nor, index, box: [bb.min.x, bb.min.y, bb.min.z, bb.max.x, bb.max.y, bb.max.z], sphere: [bs.center.x, bs.center.y, bs.center.z, bs.radius] };
  });
  const instanced = b.instanced.map((p) => {
    const g = p.geometry, pos = g.attributes.position.array, nor = g.attributes.normal.array, index = g.index.array;
    const lod = coarseOf(plan, p, transfer);
    transfer.push(pos.buffer, nor.buffer, index.buffer, p.matrices.buffer);
    if (p.colors) transfer.push(p.colors.buffer);
    if (p.reach) transfer.push(p.reach.buffer);
    return { mat: p.mat, key: p.key, detail: p.detail, big: p.big, lod, pos, nor, index, matrices: p.matrices, colors: p.colors, reach: p.reach, reals: p.reals };
  });
  b.colliders.tops = tops;
  return { built: { parts, instanced, lights: b.lights, colliders: b.colliders }, transfer: [...new Set(transfer)] };
}

/**
 * A prototype's coarse versions (cells.js), as the page uses them: for the street life the coarse
 * one alone ({ low }); for other plans, where it may be a fine piece at some copy's scale, the
 * whole set (coarseSet). undefined where none is wanted. Arrays copied for each plan (the cache
 * keeps its own; a buffer sent is gone from the worker).
 */
function coarseOf(plan, p, transfer) {
  const g = p.geometry, P = g.attributes.position.array, N = g.attributes.normal.array, I = g.index.array, life = plan.style === 'life';
  if (p.detail && !life) return undefined;
  if (!life) {
    if (!g.boundingBox) g.computeBoundingBox();
    const bb = g.boundingBox;
    if (!cells.mayBeFine(I.length / 3, [bb.max.x - bb.min.x, bb.max.y - bb.min.y, bb.max.z - bb.min.z], p.matrices)) return undefined;
  }
  const key = `${life ? 'l' : 'f'}|${p.mat}|${hash(P, I)}`;
  let c = coarseCache.get(key);
  if (!c) {
    c = life ? { low: cells.coarse(P, N, I) } : cells.coarseSet(P, N, I, palette.MATERIALS[p.mat]?.kind === 'metal');
    if (coarseCache.size > 4000) coarseCache.clear();
    coarseCache.set(key, c);
  }
  // (one copy of each version: a version that is two of them stays one object in the message)
  const made = new Map();
  const copy = (v) => {
    if (!v) return null;
    if (!made.has(v)) { const o = { pos: v.pos.slice(), nor: v.nor.slice(), index: v.index.slice() }; transfer.push(o.pos.buffer, o.nor.buffer, o.index.buffer); made.set(v, o); }
    return made.get(v);
  };
  return { low: copy(c.low), far: copy(c.far), shadow: copy(c.shadow), open: !!c.open };
}

/** A prototype's identity (FNV over its vertices' bits and its index). */
function hash(P, I) {
  let h = 2166136261 >>> 0;
  const U = new Uint32Array(P.buffer, P.byteOffset, P.length);
  for (let i = 0; i < U.length; i++) h = Math.imul(h ^ U[i], 16777619);
  for (let i = 0; i < I.length; i++) h = Math.imul(h ^ I[i], 16777619);
  return `${P.length}:${I.length}:${(h >>> 0).toString(36)}`;
}
