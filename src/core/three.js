// The three.js classes the builders use (src/core, src/objects, src/styles), through one module so
// that the same code runs in the page, in Node and in a worker (src/engine/build-worker.js): a
// worker has no import map, so it names the library's URL in THREE_CORE_URL before importing the
// builders. Builders import from here, never from 'three' directly (tests/worker.test.mjs).

const T = await import(globalThis.THREE_CORE_URL ?? 'three');

export const { BufferAttribute, BufferGeometry, Color, ExtrudeGeometry, Float32BufferAttribute, Matrix4, Path, Quaternion, Shape, Vector3 } = T;
