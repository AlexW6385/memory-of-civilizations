// Generates room impulse responses off the main thread (src/engine/acoustics.js impulseResponse is
// pure). Message in: { id, A, sr }; message out: { id, ch: [Float32Array, Float32Array] }, the
// arrays transferred, not copied. No three.js here.
import { impulseResponse } from './acoustics.js';

self.onmessage = (e) => {
  const { id, A, sr } = e.data;
  const ch = impulseResponse(A, sr);
  self.postMessage({ id, ch }, ch.map((c) => c.buffer));
};
