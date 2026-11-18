// Worker: builds the chunks of the country along the roads (src/planet/roadside-build.js) off the main thread.
import { setLand } from './land.js';
import { initRelief } from './relief.js';
import { buildChunk } from './roadside-build.js';

self.onmessage = (e) => {
  const m = e.data;
  if (m.land) { setLand(m.land); initRelief(); self.postMessage({ ready: true }); return; }
  const d = buildChunk(m.ri, m.k, m.detail);
  const bufs = d ? [d.pos.buffer, d.nrm.buffer, d.col.buffer, d.alt.buffer, d.ses.buffer, d.idx.buffer, d.blockers.buffer] : [];
  self.postMessage({ key: m.key, detail: m.detail, data: d }, bufs);
};
