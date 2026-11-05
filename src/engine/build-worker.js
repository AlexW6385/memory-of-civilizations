// Worker: a settlement's townscape is laid out and every plan of it built off the main thread
// (DESIGN §8: loading never costs a frame more than 4 ms). The page sends { init: three's URL },
// then jobs { job, id } (a settlement of its own); the worker answers { job, count } and then, plan
// by plan, { job, index, header, built } — the plan without its elements, and its geometry as
// transferable arrays (merged parts, instanced prototypes, lights, colliders with the top field).
// { cancel: job } stops a job between plans (the settlement was let go of).

let ready = null;
const cancelled = new Set();
let build, collide, grounds;

self.onmessage = async (e) => {
  const d = e.data;
  if (d.init) {
    self.THREE_CORE_URL = d.init;
    ready = (async () => {
      build = await import('../core/build.js');
      collide = await import('../core/collide.js');
      await import('../objects/index.js');
      grounds = await import('../settlements/grounds.js');
    })();
    ready.catch((err) => self.postMessage({ fatal: String(err?.stack || err) }));
    return;
  }
  if (d.cancel !== undefined) { cancelled.add(d.cancel); return; }
  const { job, id } = d;
  try {
    await ready;
    let mod;
    for (let i = 0; ; i++) { try { mod = await grounds.MODULES[id](); break; } catch (err) { if (i >= 3) throw err; await new Promise((r) => setTimeout(r, 600 * (i + 1))); } }
    const town = await mod.town();
    if (cancelled.has(job)) return done(job);
    const plans = [...mod.landmarks.map((p) => p.plan), ...town];
    self.postMessage({ job, count: plans.length, landmarks: mod.landmarks.length });
    for (let i = 0; i < plans.length; i++) {
      if (cancelled.has(job)) return done(job);
      const plan = plans[i];
      const out = await buildOne(plan);
      self.postMessage({ job, index: i, header: header(plan), built: out.built }, out.transfer);
    }
    done(job);
  } catch (err) {
    self.postMessage({ job, error: String(err?.stack || err) });
  }
};

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
  const tops = plan.nocollide ? null : await collide.topField(b.instanced.length ? build.flatParts(b) : b.parts);
  if (tops) transfer.push(tops.data.buffer, tops.under.buffer);
  const parts = b.parts.map(({ mat, geometry, detail }) => {
    const pos = geometry.attributes.position.array, nor = geometry.attributes.normal.array;
    const bb = geometry.boundingBox, bs = geometry.boundingSphere;
    transfer.push(pos.buffer, nor.buffer);
    return { mat, detail, pos, nor, box: [bb.min.x, bb.min.y, bb.min.z, bb.max.x, bb.max.y, bb.max.z], sphere: [bs.center.x, bs.center.y, bs.center.z, bs.radius] };
  });
  const instanced = b.instanced.map((p) => {
    const g = p.geometry, pos = g.attributes.position.array, nor = g.attributes.normal.array, index = g.index.array;
    transfer.push(pos.buffer, nor.buffer, index.buffer, p.matrices.buffer);
    if (p.colors) transfer.push(p.colors.buffer);
    if (p.reach) transfer.push(p.reach.buffer);
    return { mat: p.mat, key: p.key, detail: p.detail, pos, nor, index, matrices: p.matrices, colors: p.colors, reach: p.reach, reals: p.reals };
  });
  b.colliders.tops = tops;
  return { built: { parts, instanced, lights: b.lights, colliders: b.colliders }, transfer: [...new Set(transfer)] };
}
