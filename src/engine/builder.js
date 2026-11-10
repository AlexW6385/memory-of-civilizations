// Building off the main thread (src/engine/build-worker.js): a small pool of workers, one
// settlement job each. If the workers cannot start (no module workers, the library not reachable),
// `ok` turns false and the world builds on the main thread as before.

import * as THREE from 'three/webgpu';
import { HITCH } from './hitch.js';

/** A job silent this long (ms) has failed. The worker beats every 2 s whenever it is not in the
 *  middle of one plan (build-worker.js; a plan takes a few seconds at most), so only a worker gone
 *  (the browser let it go for its memory) stays silent this long. */
const STALL = 40000;
/** Settlements built by the same workers before they are started afresh, when idle: a worker kept
 *  everything it ever loaded and, city after city, was let go of by the browser in mid-build. */
const FRESH_AFTER = 4;

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
    this.url = url; this.n = n; this.restarts = 0;
    this.spawn();
  }

  spawn() {
    this.workers = Array.from({ length: this.n }, () => {
      const w = new Worker(new URL('./build-worker.js', import.meta.url), { type: 'module' });
      w.load = 0;
      w.onmessage = (e) => { w.heard = performance.now(); this.receive(e.data); };
      w.onerror = (e) => { console.warn('build worker failed', e.message); this.restart(); };
      w.postMessage({ init: this.url });
      return w;
    });
  }

  /**
   * The workers let go of and new ones started (a worker killed for its memory falls silent; one
   * that failed to start throws): the jobs running fail with `restart` and are sent again by the
   * world (world.js load). After a few restarts the world builds on the main thread.
   */
  restart() {
    for (const w of this.workers) w.terminate();
    const jobs = [...this.jobs.values()];
    this.jobs.clear();
    if (++this.restarts > 3) { this.ok = false; clearInterval(this.timer); }
    else this.spawn();
    for (const j of jobs) j.reject(Object.assign(new Error('build worker restarted'), { restart: this.ok }));
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
            else if (d.index !== undefined) chain = chain.then(() => onPlan(d.index, d.header, HITCH.time('stream rebuild', () => rebuild(d.built))));
            else if (d.done) chain.then(resolve, reject);
          },
        });
      }).finally(() => { w.load--; this.jobs.delete(job); });
      w.postMessage({ job, id, part, of: this.workers.length });
      return { job, w, done };
    });
    this.built = (this.built || 0) + 1;
    return {
      done: Promise.all(subs.map((x) => x.done)).then(() => chain).finally(() => this.freshen()),
      cancel: () => { for (const x of subs) x.w.postMessage({ cancel: x.job }); },
    };
  }

  /**
   * A worker that falls silent (killed for its memory, a module that never arrives) would leave a
   * settlement unbuilt for ever: a job that hears nothing for STALL ms fails and the workers are
   * started again (restart).
   */
  watch() {
    const now = performance.now();
    for (const j of this.jobs.values()) {
      // (a job waits its turn while its worker builds another settlement's plans: what counts is
      // whether the worker itself has fallen silent — several settlements loading at once, one
      // waiting behind the others for over STALL, sent the whole world to the main thread)
      const heard = Math.max(j.heard, j.worker.heard ?? 0);
      if (now - heard > STALL) {
        console.warn('build worker silent for', Math.round((now - heard) / 1000), 's: workers started again');
        this.restart();
        return;
      }
    }
  }

  /** Fetch these settlements' modules in the workers when they have no job (into the cache). */
  warm(ids) {
    if (!this.ok) return;
    ids.forEach((id, i) => this.workers[i % this.workers.length].postMessage({ warm: id }));
  }

  /** Started afresh when idle after FRESH_AFTER settlements (see there). */
  freshen() {
    if (!this.ok || this.jobs.size || this.built < FRESH_AFTER) return;
    this.built = 0;
    for (const w of this.workers) w.terminate();
    this.spawn();
  }

  receive(d) {
    if (d.beat) return;
    const j = this.jobs.get(d.job);
    if (j) j.heard = performance.now();
    if (d.fatal) { console.warn('build worker:', d.fatal); this.fail(); return; }
    this.jobs.get(d.job)?.on(d);
  }
}

/** The worker's arrays as geometries again (bounds as the worker computed them). */
function rebuild(b) {
  const parts = b.parts.map(({ mat, detail, shadowBig, pos, nor, hang, index, box, sphere }) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('normal', new THREE.BufferAttribute(nor, 3, nor instanceof Int16Array));
    if (hang) g.setAttribute('hang', new THREE.BufferAttribute(hang, 1));
    if (index) g.setIndex(new THREE.BufferAttribute(index, 1, index instanceof Uint16Array));
    g.boundingBox = new THREE.Box3(new THREE.Vector3(box[0], box[1], box[2]), new THREE.Vector3(box[3], box[4], box[5]));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(sphere[0], sphere[1], sphere[2]), sphere[3]);
    return { mat, detail, shadowBig, geometry: g };
  });
  const instanced = b.instanced.map(({ mat, key, detail, big, first, lod, pos, nor, hang, index, matrices, colors, reach, reals }) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    if (hang) g.setAttribute('hang', new THREE.BufferAttribute(hang, 1));
    g.setIndex(new THREE.BufferAttribute(index, 1, index instanceof Uint16Array));
    g.computeBoundingBox(); g.computeBoundingSphere();
    // its coarse versions, made in the worker (merge.js, life-instances.js use them)
    if (lod !== undefined) g.userData.coarse = lod;
    return { mat, key, detail, big, first, geometry: g, matrices, colors, reach, reals };
  });
  return { parts, instanced, lights: b.lights, colliders: b.colliders };
}
