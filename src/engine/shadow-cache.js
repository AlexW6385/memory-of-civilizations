// The sun's shadow cascades with their static casters cached (DESIGN §8).
//
// Most of what casts a shadow does not move: the buildings, the merged meshes, the ground's tiles,
// the life of the streets (chosen by distance, not animated). Each cascade keeps the depth (and the
// coloured light of stained glass) of its static casters in a map of its own, drawn again only
// when it would come out different: the sun has turned by more than the angle that moves a tall
// caster's shadow by half a texel of that cascade, the cascade's box has moved by a step (its
// centre is snapped to a sixteenth of its width, the box widened by that step so that the view's
// slice always lies inside it), its size changed, or the static casters themselves changed (a
// signature of every visible static caster — its id, layers, copies, draw range, index and matrix
// versions, place — taken once a frame). Otherwise the cached map is copied into the cascade's
// own and only the dynamic casters — those whose material moves its vertices (the plants swaying
// in the wind), or marked `userData.dynamic` — are drawn over it; a cascade with no dynamic caster
// in its layers is not drawn at all. Standing still, the cascades are what a full drawing gives,
// texel for texel: the cache holds exactly what that drawing would draw first.
//
// The cascades' cadence is kept from before: the first every frame, the second every second frame,
// the third every third (each map keeps the matrix it was drawn with).
//
// WebGPU only (the depth maps are depth32float, to be copyable); with the WebGL backend, or with
// `?shadowcache=0`, the cascades are drawn whole as before (with the same placement as before).

import * as THREE from 'three/webgpu';
import { CSMShadowNode } from 'three/addons/csm/CSMShadowNode.js';
import { HITCH } from './hitch.js';

/** The cascade's centre is snapped to its width over SNAP (and the box widened by one step). */
const SNAP = 16;
/**
 * The view's turn (rad) before the cascades follow it: each cascade is fitted to the view as it was
 * when last fitted, and kept while the view turns less than half of TURN from it (the boxes widened
 * so that the slice still lies inside). Turning on the spot drew every cascade again every frame —
 * about 400 shadow draws a frame at Suzhou, measured on the M2 — now once every TURN/2 of turning.
 * Quality: the cascades' texels about a fifth larger (decision 2026-11-09).
 */
const TURN = 0.42;
const WIDEN = 1 + Math.sin(TURN / 2);
const _held = new THREE.Matrix4(), _q = new THREE.Quaternion(), _p = new THREE.Vector3(), _s = new THREE.Vector3();
/** The height (m) of the tallest casters whose shadow may shift by half a texel before a redraw. */
const TALL = 40;

const _dir = new THREE.Vector3(), _orient = new THREE.Matrix4(), _orientInv = new THREE.Matrix4(), _toLight = new THREE.Matrix4();
const _box = new THREE.Box3(), _c = new THREE.Vector3(), _up = new THREE.Vector3(0, 1, 0), _eye = new THREE.Vector3();

/** Does this caster move its vertices by itself (so that its shadow must be drawn every time)? */
export function isDynamic(o) {
  if (o.userData.dynamic) return true;
  const m = o.material;
  if (!m) return false;
  // (a material marked staticShadow casts from a fixed shape: src/engine/flora/index.js)
  const moves = (x) => !x.userData?.staticShadow && !!(x.positionNode || x.castShadowPositionNode);
  return Array.isArray(m) ? m.some(moves) : moves(m);
}

export class CachedCSM extends CSMShadowNode {
  constructor(light, data, cache = true) {
    super(light, data);
    this.cache = cache;
    this.frameNo = 0;
    this.sig = 0;                          // the static casters' signature this frame
    this.dynMask = 0;                      // the layers of the dynamic casters visible this frame
    this.stats = { full: 0, cached: 0, skipped: 0 };
  }

  _init(builder) {
    super._init(builder);
    // copyable depth only on WebGPU (depth24plus cannot be copied)
    if (builder.renderer.backend?.isWebGPUBackend !== true) this.cache = false;
    this._shadowNodes.forEach((node, i) => {
      node._cascade = { i, owner: this, dirty: true, key: null, sig: null, dyn: false, rt: null };
      if (!this.cache) return;
      const setupRT = node.setupRenderTarget;
      node.setupRenderTarget = function (shadow, b) {
        const out = setupRT.call(this, shadow, b);
        out.depthTexture.type = THREE.FloatType;
        return out;
      };
      node.renderShadow = cachedRender;
    });
  }

  /** Widened by the snapping step, so that the slice still lies in the box wherever the snap puts it. */
  _updateShadowBounds() {
    super._updateShadowBounds();
    if (!this.cache) return;
    for (const L of this.lights) {
      const c = L.shadow.camera, w = (c.right - c.left) * SNAP / (SNAP - 1) * WIDEN;
      c.left = -w / 2; c.right = w / 2; c.top = w / 2; c.bottom = -w / 2;
      c.updateProjectionMatrix();
    }
  }

  updateBefore(frame) {
    const n = ++this.frameNo;
    const due = (i) => i === 0 || n % (i + 1) === 0;
    if (!this.cache) {
      super.updateBefore(frame);
      for (let i = 0; i < this.lights.length; i++) { const s = this.lights[i].shadow; s.autoUpdate = false; if (due(i)) s.needsUpdate = true; }
      return;
    }
    const t0 = HITCH.mark();
    const light = this.light, parent = light.parent, camera = this.camera;
    for (const L of this.lights) if (L.parent === null) { parent.add(L.target); parent.add(L); }
    this.signature(frame.scene ?? parent);
    _dir.subVectors(light.target.position, light.position).normalize();
    // the view's orientation as last fitted, at the view's present place
    camera.matrixWorld.decompose(_p, _q, _s);
    if (!this.heldQ || this.heldQ.angleTo(_q) > TURN / 2) (this.heldQ ||= new THREE.Quaternion()).copy(_q);
    _held.compose(_p, this.heldQ, _s);
    for (let i = 0; i < this.frustums.length; i++) {
      const L = this.lights[i], shadow = L.shadow, sc = shadow.camera, node = this._shadowNodes[i], C = node?._cascade;
      shadow.autoUpdate = false;
      if (!C) continue;
      const width = sc.right - sc.left, texel = width / shadow.mapSize.width, step = width / SNAP;
      // the sun's direction held until it has turned by the angle that moves a tall caster's
      // shadow by half a texel here
      // (in the first cascade, a few tens of metres across, nothing near 40 m tall stands as a rule:
      // the tip of a 40 m caster's shadow may step by a texel and a half there, an 8 m one's by a
      // third of a texel; that cascade, drawn every frame, was otherwise drawn again every third
      // frame as the sun moves)
      const slack = i === 0 ? 1.5 : 0.5;
      if (!C.dir || C.dir.angleTo(_dir) > slack * texel / TALL) (C.dir ||= new THREE.Vector3()).copy(_dir);
      _eye.copy(light.position);
      _orient.lookAt(_eye, _c.copy(_eye).add(C.dir), _up);
      _orientInv.copy(_orient).invert();
      _toLight.multiplyMatrices(_orientInv, _held);
      this.frustums[i].toSpace(_toLight, this._lsf ||= new this.frustums[i].constructor());
      const V = this._lsf.vertices;
      _box.makeEmpty();
      for (let j = 0; j < 4; j++) { _box.expandByPoint(V.near[j]); _box.expandByPoint(V.far[j]); }
      _box.getCenter(_c);
      // snapped: the box moves by whole steps (each a whole number of texels)
      const qx = Math.floor(_c.x / step), qy = Math.floor(_c.y / step), qz = Math.ceil((_box.max.z + this.lightMargin) / step);
      _c.set((qx + 0.5) * step, (qy + 0.5) * step, qz * step).applyMatrix4(_orient);
      const key = `${qx},${qy},${qz},${C.dir.x},${C.dir.y},${C.dir.z},${width},${sc.near},${sc.far},${sc.layers.mask},${shadow.mapSize.width}`;
      L.position.copy(_c);
      L.target.position.copy(_c).add(C.dir);
      L.updateMatrixWorld(); L.target.updateMatrixWorld();
      if (!due(i)) continue;
      C.dyn = (this.dynMask & sc.layers.mask) !== 0;
      if (key !== C.key || this.sig !== C.sig || !C.rt) { C.dirty = true; C.key = key; C.sig = this.sig; }
      if (C.dirty || C.dyn) shadow.needsUpdate = true;
      else this.stats.skipped++;
    }
    HITCH.since('shadow cache', t0);
  }

  /** The static casters' signature, and the layers the dynamic ones are on (once a frame). */
  signature(scene) {
    let h = 2166136261 | 0, dyn = 0;
    const mix = (v) => { h = Math.imul(h ^ (v | 0), 16777619); };
    scene.traverseVisible((o) => {
      if (!o.castShadow || !(o.isMesh || o.isLine || o.isPoints)) return;
      if (isDynamic(o)) { dyn |= o.layers.mask; return; }
      const g = o.geometry, e = o.matrixWorld.elements;
      mix(o.id); mix(o.layers.mask); mix(o.count ?? 1); mix(g.id); mix(g.drawRange.start); mix(g.drawRange.count === Infinity ? -1 : g.drawRange.count);
      mix(g.index?.version ?? 0); mix(o.instanceMatrix?.version ?? 0); mix(o.material?.id ?? 0);
      mix(e[12] * 256); mix(e[13] * 256); mix(e[14] * 256); mix(e[0] * 65536); mix(e[2] * 65536); mix(e[5] * 65536);
    });
    this.sig = h; this.dynMask = dyn;
  }
}

/** A cascade's drawing (ShadowNode.renderShadow, `this` the cascade's shadow node). */
function cachedRender(frame) {
  const { shadow, shadowMap, light } = this, C = this._cascade, owner = C.owner;
  const { renderer, scene } = frame;
  shadow.updateMatrices(light);
  shadowMap.setSize(shadow.mapSize.width, shadow.mapSize.height, shadowMap.depth);
  const w = shadow.mapSize.width, h = shadow.mapSize.height;
  if (!C.rt || C.rt.width !== w || C.rt.height !== h) {
    C.rt?.dispose();
    C.rt = new THREE.RenderTarget(w, h, { type: shadowMap.texture.type, format: shadowMap.texture.format, depthBuffer: true });
    C.rt.depthTexture = new THREE.DepthTexture(w, h, THREE.FloatType);
    renderer.initRenderTarget(C.rt);
    C.dirty = true;
  }
  const fn = renderer.getRenderObjectFunction();
  if (C.fnBase !== fn) { C.fnBase = fn; C.fnStatic = (o, ...a) => { if (!isDynamic(o)) fn(o, ...a); }; C.fnDyn = (o, ...a) => { if (isDynamic(o)) fn(o, ...a); }; }
  const color = renderer.shadowMap.transmitted === true;
  const name = scene.name;
  scene.name = `Shadow Map [ ${light.name || 'ID: ' + light.id} ]`;
  if (C.dirty) {
    // the static casters, kept
    renderer.setRenderObjectFunction(C.fnStatic);
    renderer.render(scene, shadow.camera);
    renderer.copyTextureToTexture(shadowMap.depthTexture, C.rt.depthTexture);
    if (color) renderer.copyTextureToTexture(shadowMap.texture, C.rt.texture);
    C.dirty = false;
    owner.stats.full++;
  } else {
    renderer.copyTextureToTexture(C.rt.depthTexture, shadowMap.depthTexture);
    if (color) renderer.copyTextureToTexture(C.rt.texture, shadowMap.texture);
    owner.stats.cached++;
  }
  if (C.dyn) {
    // the moving ones over them
    const clear = renderer.autoClear;
    renderer.autoClear = false;
    renderer.setRenderObjectFunction(C.fnDyn);
    renderer.render(scene, shadow.camera);
    renderer.autoClear = clear;
  }
  renderer.setRenderObjectFunction(fn);
  scene.name = name;
}
