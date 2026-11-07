// Building off the main thread (src/engine/build-worker.js): a small pool of workers, one
// settlement job each. If the workers cannot start (no module workers, the library not reachable),
// `ok` turns false and the world builds on the main thread as before.

import * as THREE from 'three/webgpu';

/** A job silent this long (ms) has failed (the first answer includes laying out the town). */
const STALL = 25000;

export class Builder {
  constructor(n = 2) {
    this.jobs = new Map();
    this.next = 1;
    this.ok = typeof Worker !== 'undefined' && new URLSearchParams(location.search).get('worker') !== '0';
    if (!this.ok) return;
    // the library's URL as the page's import map names it (the worker has none)
    let url = null;
    try { url = new URL(JSON.parse(document.querySelector('script[type="importmap"]').textContent).imports.three, location.href).href.replace(/three\.webgpu\.js$/, 'three.core.js'); } catch { /* no import map */ }
    if (!url) { this.ok = false; return; }
    this.timer = setInterval(() => this.watch(), 2000);
    this.workers = Array.from({ length: n }, () => {
      const w = new Worker(new URL('./build-worker.js', import.meta.url), { type: 'module' });
      w.load = 0;
      w.onmessage = (e) => this.receive(e.data);
      w.onerror = (e) => { console.warn('build worker failed', e.message); this.fail(); };
      w.postMessage({ init: url });
      return w;
    });
  }

  fail() {
    this.ok = false;
    clearInterval(this.timer);
    for (const j of this.jobs.values()) j.reject(new Error('build worker failed'));
    this.jobs.clear();
  }

  /**
   * Lay out and build a settlement of its own. onCount(count, landmarks) once, then onPlan(index,
   * header, built) for each plan as it comes (awaited one after another, in no fixed order).
   * Returns { done, cancel }.
   */
  settlement(id, onCount, onPlan) {
    // the plans are shared out between the workers (each lays out the town itself, the same way,
    // and builds every n-th plan); the page takes them as they come
    let chain = Promise.resolve(), counted = false;
    const subs = this.workers.map((w, part) => {
      const job = this.next++;
      w.load++;
      const done = new Promise((resolve, reject) => {
        this.jobs.set(job, {
          worker: w, reject, heard: performance.now(),
          on: (d) => {
            if (d.fatal || d.error) { reject(new Error(d.fatal || d.error)); return; }
            if (d.count !== undefined) { if (!counted) { counted = true; chain = chain.then(() => onCount(d.count, d.landmarks)); } }
            else if (d.index !== undefined) chain = chain.then(() => onPlan(d.index, d.header, rebuild(d.built)));
            else if (d.done) chain.then(resolve, reject);
          },
        });
      }).finally(() => { w.load--; this.jobs.delete(job); });
      w.postMessage({ job, id, part, of: this.workers.length });
      return { job, w, done };
    });
    return {
      done: Promise.all(subs.map((x) => x.done)).then(() => chain),
      cancel: () => { for (const x of subs) x.w.postMessage({ cancel: x.job }); },
    };
  }

  /**
   * A worker that falls silent (killed for its memory, a module that never arrives) would leave a
   * settlement unbuilt for ever: a job that hears nothing for STALL ms fails, the workers are let go
   * of, and the world builds on the main thread from then on.
   */
  watch() {
    const now = performance.now();
    for (const j of this.jobs.values()) {
      if (now - j.heard > STALL) {
        console.warn('build worker silent for', Math.round((now - j.heard) / 1000), 's: building in the page');
        for (const w of this.workers) w.terminate();
        this.fail();
        return;
      }
    }
  }

  /** Fetch these settlements' modules in the workers when they have no job (into the cache). */
  warm(ids) {
    if (!this.ok) return;
    ids.forEach((id, i) => this.workers[i % this.workers.length].postMessage({ warm: id }));
  }

  receive(d) {
    const j = this.jobs.get(d.job);
    if (j) j.heard = performance.now();
    if (d.fatal) { console.warn('build worker:', d.fatal); this.fail(); return; }
    this.jobs.get(d.job)?.on(d);
  }
}

/** The worker's arrays as geometries again (bounds as the worker computed them). */
function rebuild(b) {
  const parts = b.parts.map(({ mat, detail, shadowBig, pos, nor, index, box, sphere }) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('normal', new THREE.BufferAttribute(nor, 3, nor instanceof Int16Array));
    if (index) g.setIndex(new THREE.BufferAttribute(index, 1, index instanceof Uint16Array));
    g.boundingBox = new THREE.Box3(new THREE.Vector3(box[0], box[1], box[2]), new THREE.Vector3(box[3], box[4], box[5]));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(sphere[0], sphere[1], sphere[2]), sphere[3]);
    return { mat, detail, shadowBig, geometry: g };
  });
  const instanced = b.instanced.map(({ mat, key, detail, big, lod, pos, nor, index, matrices, colors, reach, reals }) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    g.setIndex(new THREE.BufferAttribute(index, 1, index instanceof Uint16Array));
    g.computeBoundingBox(); g.computeBoundingSphere();
    // its coarse versions, made in the worker (merge.js, life-instances.js use them)
    if (lod !== undefined) g.userData.coarse = lod;
    return { mat, key, detail, big, geometry: g, matrices, colors, reach, reals };
  });
  return { parts, instanced, lights: b.lights, colliders: b.colliders };
}
