// The three.js classes the builders use (src/core, src/objects, src/styles), through one module so
// that the same code runs in the page, in Node and in a worker (src/engine/build-worker.js): a
// worker has no import map, so the builders name the library by a relative path — the copy of
// three.js the site serves (src/vendor/three, the same file the page's import map points at, so
// the page holds one copy of the classes). Builders import from here, never from 'three' directly
// (tests/worker.test.mjs). (A top-level await here, used before, broke the start in Safari.)

export { BufferAttribute, BufferGeometry, Color, ExtrudeGeometry, Float32BufferAttribute, Matrix4, Path, Quaternion, Shape, Vector3 } from '../vendor/three/build/three.core.js';
