// Worker: builds tiles of the planet's ground off the main thread (src/planet/chunk.js).
import { setLand } from './land.js';
import { initRelief } from './relief.js';
import { buildTile } from './chunk.js';

self.onmessage = (e) => {
  const m = e.data;
  if (m.land) { setLand(m.land); initRelief(); self.postMessage({ ready: true }); return; }
  const t = buildTile(m.f, m.L, m.i, m.j, m.n);
  const bufs = [t.position.buffer, t.normal.buffer, t.ground.buffer, t.ground2.buffer, t.ground3.buffer, t.index.buffer];
  if (t.water) bufs.push(t.water.position.buffer, t.water.depth.buffer, t.water.index.buffer);
  self.postMessage({ key: m.key, ...t }, bufs);
};
