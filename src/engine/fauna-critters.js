// The animals of a garden and a street (ducks afloat, a crane, hens, a cat, a dog, cormorants on a
// boat's rail, a caged songbird, swallows at their nest, a kingfisher): ONE mesh, one draw, for
// every animal of a settlement. Each animal is a model (critter-models.js) copied once into the
// mesh with its own numbers stamped on its vertices (place, size, the loop it swims, the range it
// walks …), and the vertex shader runs its behaviour (critter-poses.js: the same code the tests step
// through on numbers) from the clock and the visitor's position, then bends its neck, head, tail,
// legs and wings about their joints. Nothing is moved on the CPU: update() only stamps the clock,
// the visitor, the hour and the season. A settlement lists them as `critters` in its fauna.js:
//   { type:'floaters', models:['mandarin_drake','mandarin_hen'], area, dist, margin, a:[ax,az], ratio, speed, y, raft? }
//       a loop of the water the animals share (as the fish's), the models going round it side by side
//   { model, at:[x,y,z], rot, ...}  any other single animal: `range` [a,b] and tau/speed/stride (a walker: crane, hen_*,
//       rooster, grazer: horse_*, ox_*, zebu_*, donkey_*, sheep_*), range [far, near] (cat_*, dog: the distance the head lifts and the dog stands), cycle (cormorant),
//       cycle + flight + radius + side (swallow_nest), water [x, z, y] + cycle (kingfisher); fishing_craft and cagebird as props
import * as THREE from 'three/webgpu';
import { attribute, uniform, vec3, float, positionGeometry, sin, cos, normalize, dot, max, mix, smoothstep, step, abs, renderGroup, faceDirection, length, select } from 'three/tsl';
import { ENV } from './env.js';
import { MODELS } from './critter-models.js';
import { FARM_GAIT, farmKind } from './critter-models-farm.js';
import { POSES, KIND, context, RIG_FIELDS, TAU } from './critter-poses.js';
import { X } from './critter-math.js';

const MODEL_KIND = {
  mandarin_drake: 'duck', mandarin_hen: 'duck', duck_white: 'duck', duck_brown: 'duck', crane: 'crane', hen_brown: 'hen', hen_white: 'hen', rooster: 'rooster',
  cat_tabby: 'cat', cat_orange: 'cat', dog: 'dog', cormorant: 'cormorant', fishing_craft: 'craft', cagebird: 'cagebird', swallow_nest: 'swallow', kingfisher: 'kingfisher',
};
Object.assign(MODEL_KIND, { pigeon_grey: 'hen', pigeon_white: 'hen', pigeon_dark: 'hen', goose_white: 'hen', goose_grey: 'hen' });      // (the town's birds on the ground walk and peck as the fowl do)
MODEL_KIND.turkey = 'hen'; MODEL_KIND.turkey_ocellated = 'hen';                                                                                                    // (Tenochtitlan's turkeys walk and peck as the fowl do)
Object.assign(MODEL_KIND, { goat_black: 'dog', goat_white: 'dog' });                                                      // (Bhaktapur's goats lie down and stand on the dog's rig)
MODEL_KIND.mastiff = 'dog';                                                                                                           // (Lhasa's chained mastiffs lie down and stand on the dog's rig)
Object.assign(MODEL_KIND, { llama_brown: 'dog', llama_white: 'dog', llama_pied: 'dog', cuy: 'dog' });                       // (Machu Picchu's llamas and guinea pigs, on the dog's rig)
Object.assign(MODEL_KIND, { camel_dun: 'dog', camel_dark: 'dog' });   // (Dunhuang's Bactrian camels kneel and stand on the dog's rig)
Object.assign(MODEL_KIND, { pig_black: 'dog', pig_spotted: 'dog', cow_bali: 'dog' });   // (the Balinese village's pigs and cattle lie down and stand on the dog's rig)
MODEL_KIND.buffalo_water = 'dog';   // (the Hakka tulou's water buffalo lie down and stand on the dog's rig; model in critter-models-hakka.js)
MODEL_KIND.gull_silver = 'hen';   // (Sydney's silver gulls walk and peck as the fowl do)
MODEL_KIND.noddy = 'hen'; MODEL_KIND.kiore = 'dog';   // (Rapa Nui's noddies walk and peck as the fowl do; its rats stand and lie down on the dog's rig)
Object.assign(MODEL_KIND, { pig_dark: 'dog', pig_pale: 'dog', rook: 'hen' });   // (Stonehenge's pigs lie down and stand on the dog's rig; its rooks walk and peck as the fowl do)
MODEL_KIND.goose_magpie = 'hen';   // (Ubirr's magpie geese walk and peck as the fowl do; the model is added from critter-models-kakadu.js)
// (the farm animals of critter-models-farm.js: horses, oxen and zebu, donkeys, sheep; they walk, graze and look up on the grazer pose)
for (const n of Object.keys(MODELS)) if (farmKind(n)) MODEL_KIND[n] = 'grazer';
/** Out at night too (a cat and a dog asleep, a cage hung out, the craft)? */
const NIGHT = { cat: 1, dog: 1, cagebird: 1, craft: 1 };
const REACH = 95;

function rng(seed) { let s = seed >>> 0 || 1; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const hashPos = (x, z) => { const k = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453; return k - Math.floor(k); };

/** A loop of the water for floaters (as the fish's): [cx, cz, ax, az] or null. */
export function fitLoop(dist, rect, amax, ratio, k, rot, margin, rand, minA = 2) {
  const cr = Math.cos(rot), sr = Math.sin(rot);
  for (let tries = 0; tries < 300; tries++) {
    const cx = rect[0] + (rect[2] - rect[0]) * rand(), cz = rect[1] + (rect[3] - rect[1]) * rand();
    if (dist(cx, cz) > -margin - 0.8) continue;
    for (let ax = amax[0]; ax >= minA; ax *= 0.88) {
      const az = Math.min(ax * ratio, amax[1]);
      let ok = true;
      for (let i = 0; i < 96 && ok; i++) {
        const th = (i / 96) * TAU, lx = ax * Math.sin(th), lz = az * Math.sin(k * th + 0.7);
        if (dist(cx + lx * cr - lz * sr, cz + lx * sr + lz * cr) > -margin) ok = false;
      }
      if (ok) return [cx, cz, ax, az];
    }
  }
  return null;
}

/** The instances a settlement's `critters` list stands for: { model, kind, groups: [a, b, c, d, e] each of four numbers }. */
export function expandCritters(list, site) {
  const rand = rng(4421 + (site?.id?.length ?? 7)), out = [];
  for (const sp of list) {
    if (sp.type === 'floaters') {
      const k = sp.k ?? 1, rot = sp.rot ?? rand() * TAU, loop = sp.loop ?? fitLoop(sp.dist, sp.area, sp.a, sp.ratio ?? 0.5, k, rot, sp.margin ?? 1.4, rand, sp.minA ?? 2);
      if (!loop) continue;
      const Tc = sp.cycle ? sp.cycle[0] + (sp.cycle[1] - sp.cycle[0]) * rand() : 15 + rand() * 6, meanR = Math.max(loop[2], loop[3]) * 0.8;
      const dTh = ((sp.speed ?? 0.3) * Tc / Math.max(2, meanR)) * (rand() < 0.5 ? 1 : -1), ph = rand() * TAU, grp = rand();
      sp.models.forEach((model, i) => {
        const raft = sp.raft, along = raft ? (rand() - 0.5) * 2.4 : i === 0 ? 0.24 : -0.2, across = raft ? (rand() - 0.5) * 1.1 : i === 0 ? 0 : 0.42 * (i % 2 ? 1 : -1);
        out.push({ model, kind: 'duck', groups: [[KIND.duck, rand(), (sp.size ?? 1) * (0.96 + 0.08 * rand()), 0], [raft ? 1 : 0, sp.y, 0, 0], loop, [dTh, ph + (raft ? (rand() - 0.5) * 0.2 : 0), rot, k], [along, across, Tc, raft ? grp + (rand() - 0.5) * 0.15 : grp]] });
      });
      continue;
    }
    const kind = MODEL_KIND[sp.model], [x, y, z] = sp.at, rot = sp.rot ?? 0, seed = hashPos(x, z);
    if (!kind) throw new Error(`critter model ${sp.model}?`);
    const a = [KIND[kind], seed, (sp.size ?? 1) * (0.97 + 0.06 * hashPos(z, x)), NIGHT[kind] ?? 0], b = [x, y, z, rot];
    let c = [0, 0, 0, 0], d = [0, 0, 0, 0];
    if (kind === 'crane') { c = [...(sp.range ?? [6, 2]), sp.tau ?? 50, sp.speed ?? 0.42]; d = [sp.stride ?? 0.7, 0, 0, 0]; }
    else if (kind === 'hen' || kind === 'rooster') { c = [...(sp.range ?? [2.5, 2]), sp.tau ?? 14, sp.speed ?? 0.5]; d = [sp.stride ?? 0.22, 0, 0, 0]; }
    else if (kind === 'grazer') { const G = FARM_GAIT[farmKind(sp.model)]; c = [...(sp.range ?? [4, 3]), sp.tau ?? 30, sp.speed ?? G.speed]; d = [sp.stride ?? G.stride, sp.swing ?? G.swing, sp.graze ?? G.graze, 0]; }
    else if (kind === 'cat') c = [...(sp.range ?? [7, 2.5]), 0, 0];
    else if (kind === 'dog') c = [...(sp.range ?? [9, 3.5]), 0, 0];
    else if (kind === 'cormorant') c = [sp.cycle ?? 52, 0, 0, 0];
    else if (kind === 'swallow') { c = [sp.cycle ?? 36, sp.flight ?? 9, sp.radius ?? 6, sp.side ?? 1]; d = [sp.rise ?? 1.6, 0, 0, 0]; }
    else if (kind === 'kingfisher') { c = [sp.water[0], sp.water[1], sp.cycle ?? 34, 0]; d = [sp.water[2], 0, 0, 0]; }
    out.push({ model: sp.model, kind, groups: [a, b, c, d, [0, 0, 0, 0]] });
  }
  return out;
}

const STATIC = 19, INST = 20;
/** The geometry: every instance's model copied in, its numbers on every vertex. */
function buildGeometry(inst) {
  const cache = new Map(), get = (n) => cache.get(n) || (cache.set(n, MODELS[n]()), cache.get(n));
  let total = 0; for (const i of inst) total += get(i.model).n;
  const S = new Float32Array(total * STATIC), N = new Float32Array(total * INST), index = [];
  let v0 = 0;
  for (const i of inst) {
    const m = get(i.model);
    for (let v = 0; v < m.n; v++) {
      const o = (v0 + v) * STATIC;
      S.set(m.pos.slice(v * 3, v * 3 + 3), o); S.set(m.nrm.slice(v * 3, v * 3 + 3), o + 3); S.set(m.col.slice(v * 3, v * 3 + 3), o + 6); S[o + 9] = m.part[v];
      S.set(m.pv.slice(v * 3, v * 3 + 3), o + 10); S.set(m.pv2.slice(v * 3, v * 3 + 3), o + 13); S.set(m.pv3.slice(v * 3, v * 3 + 3), o + 16);
      const q = (v0 + v) * INST; i.groups.forEach((g, k) => { for (let j = 0; j < 4; j++) N[q + k * 4 + j] = g[j] ?? 0; });
    }
    for (const k of m.idx) index.push(v0 + k);
    v0 += m.n;
  }
  const g = new THREE.BufferGeometry(), sb = new THREE.InterleavedBuffer(S, STATIC), nb = new THREE.InterleavedBuffer(N, INST);
  g.setAttribute('position', new THREE.InterleavedBufferAttribute(sb, 3, 0));
  for (const [n, d, o] of [['nrm', 3, 3], ['cp', 4, 6], ['pv', 3, 10], ['pv2', 3, 13], ['pv3', 3, 16]]) g.setAttribute(n, new THREE.InterleavedBufferAttribute(sb, d, o));
  for (const [k, n] of ['ia', 'ib', 'ic', 'id', 'ie'].entries()) g.setAttribute(n, new THREE.InterleavedBufferAttribute(nb, 4, k * 4));
  g.setIndex(index);
  return g;
}

// ── the shader ───────────────────────────────────────────────────────────────
const U = { t: uniform(0), cam: uniform(new THREE.Vector3()), day: uniform(1), summer: uniform(1) };
for (const u of Object.values(U)) u.setGroup(renderGroup);
const nd = (v) => (typeof v === 'number' ? float(v) : v);

function critterMaterial(kinds) {
  const cp = attribute('cp', 'vec4'), nrm = attribute('nrm', 'vec3'), pv = attribute('pv', 'vec3'), pv2 = attribute('pv2', 'vec3'), pv3 = attribute('pv3', 'vec3');
  const A = ['ia', 'ib', 'ic', 'id', 'ie'].map((n) => attribute(n, 'vec4')), grp = A.map((v) => [v.x, v.y, v.z, v.w]);
  const part = cp.w, kind = A[0].x;
  const eqp = (k) => step(abs(part.sub(k)), 0.5), eqk = (k) => step(abs(kind.sub(k)), 0.5);
  // the poses of the kinds present, blended by kind
  const ctx = context(U.t, [U.cam.x, U.cam.y, U.cam.z], grp), R = {};
  for (const f of RIG_FIELDS) R[f] = float(0);
  for (const k of kinds) {
    // (selected, not multiplied: another kind's pose on this kind's numbers may be a NaN, which must not leak)
    const p = POSES[KIND[k]](ctx), m = eqk(KIND[k]).greaterThan(0.5);
    for (const f of RIG_FIELDS) R[f] = select(m, nd(p[f].v), R[f]);
  }
  const isProp = eqp(10).add(eqp(12)), nonProp = float(1).sub(isProp);
  const pi = Math.PI;
  const legPhase = [0, pi, pi, 0];
  const sum = (list) => list.reduce((a, [k, v]) => a.add(eqp(k).mul(v)), float(0));
  // angles of each part at each joint: stage 1 about pv, stage 2 about pv2, stage 3 about pv3
  const legP = (k) => R.la.mul(sin(R.lp.add(legPhase[k - 4]))).add(k === 4 ? R.scr.negate() : 0);
  const s1 = {
    p: sum([[1, R.n1p], [2, R.n2p], [3, R.tp], [4, legP(4)], [5, legP(5)], [6, legP(6)], [7, legP(7)]]),
    y: sum([[1, R.n1y], [2, R.n2y], [3, R.ty], [8, R.ws], [9, R.ws.negate()]]),
    r: sum([[8, R.wf], [9, R.wf.negate()]]),
  };
  const s2 = { p: sum([[2, R.n1p], [11, R.n2p]]), y: sum([[2, R.n1y], [11, R.n2y]]) };
  const s3 = { p: eqp(11).mul(R.n1p), y: eqp(11).mul(R.n1y) };
  const rot = (v, piv, pitch, yaw, roll) => {
    let q = v.sub(piv), c = cos(pitch), s = sin(pitch);
    q = vec3(q.x.mul(c).add(q.y.mul(s)), q.y.mul(c).sub(q.x.mul(s)), q.z);
    c = cos(yaw); s = sin(yaw); q = vec3(q.x.mul(c).sub(q.z.mul(s)), q.y, q.x.mul(s).add(q.z.mul(c)));
    if (roll) { c = cos(roll); s = sin(roll); q = vec3(q.x, q.y.mul(c).sub(q.z.mul(s)), q.y.mul(s).add(q.z.mul(c))); }
    return q.add(piv);
  };
  const f12 = smoothstep(0.03, 0.2, R.pop), f13 = R.fish.add(R.paw);
  const isLeg = step(3.5, part).mul(step(part, 7.5));
  const sx = mix(float(1), f13, eqp(13)).mul(mix(float(1), f12, eqp(12)));
  const sy = float(1).sub(isLeg.mul(R.lc)).mul(mix(float(1), R.eye, eqp(11))).mul(sx);
  const zero = vec3(0, 0, 0);
  const yawOnly = (v, a) => vec3(v.x.mul(cos(a)).sub(v.z.mul(sin(a))), v.y, v.x.mul(sin(a)).add(v.z.mul(cos(a))));
  const pitchA = R.bp.mul(nonProp).add(R.swayp.mul(isProp)), rollA = R.br.mul(nonProp).add(R.sway.mul(isProp));
  const body = (v, isPoint) => {
    let q = v;
    if (isPoint) q = pv.add(q.sub(pv).mul(vec3(sx, sy, sx)));
    q = rot(q, isPoint ? pv : zero, s1.p, s1.y, s1.r);
    q = rot(q, isPoint ? pv2 : zero, s2.p, s2.y, null);
    q = rot(q, isPoint ? pv3 : zero, s3.p, s3.y, null);
    if (isPoint) q = vec3(q.x, q.y.mul(float(1).add(R.breath.mul(nonProp))).add(eqp(12).mul(R.pop).mul(0.025)), q.z);
    q = yawOnly(q, R.oyaw.mul(nonProp));
    if (isPoint) q = q.add(vec3(R.ox, R.oy, 0).mul(nonProp));
    return rot(q, zero, pitchA, float(0), rollA);
  };
  const lp = body(positionGeometry, true), ln = body(nrm, false);
  // the root: place, heading, size, and whether it is out (the hour, the season, the distance)
  const psi = R.psi.mul(nonProp).add(A[1].w.mul(isProp)), Xr = R.X.mul(nonProp).add(A[1].x.mul(isProp)), Yr = R.Y.mul(nonProp).add(A[1].y.mul(isProp)), Zr = R.Z.mul(nonProp).add(A[1].z.mul(isProp));
  const dcam = length(vec3(Xr, Yr, Zr).sub(U.cam));
  const gate = A[0].w.add(float(1).sub(A[0].w).mul(U.day)).mul(mix(float(1), U.summer, eqk(KIND.swallow)));
  const scale = A[0].z.mul(R.vis).mul(gate).mul(float(1).sub(smoothstep(REACH * 0.7, REACH, dcam)));
  const cy = cos(psi), sy2 = sin(psi);
  const world = (v) => vec3(v.x.mul(cy).sub(v.z.mul(sy2)), v.y, v.x.mul(sy2).add(v.z.mul(cy)));
  const m = new THREE.MeshBasicNodeMaterial({ side: THREE.DoubleSide });
  m.positionNode = vec3(Xr, Yr, Zr).add(world(lp).mul(scale));
  const nW = normalize(world(ln)).mul(faceDirection);
  const sun = max(dot(nW, ENV.sunDir), 0), hemi = nW.y.mul(0.5).add(0.5);
  const light = ENV.fogColor.mul(hemi.mul(0.35).add(0.3)).add(ENV.nightFill.mul(hemi.mul(0.3).add(0.2))).add(ENV.sunColor.mul(sun.mul(0.75).add(0.12)));
  m.colorNode = cp.xyz.mul(light);
  m.fog = false;
  return m;
}

/** Build the critters of a settlement: { mesh, update(dt, camera in the site's frame, sun y, winter) } or null. */
export function buildCritters(list, site) { return buildFromInstances(expandCritters(list, site)); }
/** The same from instances already expanded (tools/critter-shot.mjs keeps its own). */
export function buildFromInstances(inst) {
  if (!inst.length) return null;
  const kinds = [...new Set(inst.map((i) => i.kind))];
  const mesh = new THREE.Mesh(buildGeometry(inst), critterMaterial(kinds));
  mesh.name = 'fauna:critters'; mesh.frustumCulled = false;
  const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  return {
    mesh, instances: inst,
    update(T, cam, sunY, winter) {
      U.t.value = T; U.cam.value.copy(cam);
      U.day.value = sm(0.03, 0.16, sunY); U.summer.value = 1 - sm(0.25, 0.6, winter);
    },
  };
}
export { X };
