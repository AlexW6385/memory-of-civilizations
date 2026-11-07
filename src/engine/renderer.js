// Renderer: three.js WebGPU (WebGL 2 backend when WebGPU is missing), physically based
// materials, cascaded sun shadows, baked irradiance volumes for indirect light, GTAO from the
// same scene pass (one pass draws colour and normals), bloom, AgX tone mapping.

import * as THREE from 'three/webgpu';
import { Fn, rtt, pass, mrt, output, normalView, directionToColor, colorToDirection, sample, context, renderOutput, fog, uv, uniform, getViewPosition, abs, vec2, vec3, vec4, min, mix, luminance, smoothstep, positionLocal, normalize, floor, fract, hash, length, dot, exp, sin, time, max, pow, float, mx_fractal_noise_float } from 'three/tsl';
import { ao } from 'three/addons/tsl/display/GTAONode.js';
import { bloom } from 'three/addons/tsl/display/BloomNode.js';
import { smaa } from 'three/addons/tsl/display/SMAANode.js';
import { CSMShadowNode } from 'three/addons/csm/CSMShadowNode.js';
import { SkyMesh, SKY_FAR } from './sky.js';
import { PLANET_RADIUS } from '../planet/sites.js';
import { ENV, cloudShadow, fogFactor, fogColor } from './env.js';
import { GIVolume } from './gi.js';
import { useGI } from './materials.js';
import { SMALL, SHADOW } from './layers.js';
import { AIR, airNode, airComposite, LampPool } from './air.js';

/** The depth buffer unless the address asks for another (see init). */
const DEPTH_DEFAULT = 'reversed';

// air: dust, incense and coloured light in the beams indoors (src/engine/air.js); lamps: how many of
// the nearest lamps light the room as point lights
export const QUALITY = {
  high: { pixelRatio: 1.5, shadowMap: 2048, cascades: 3, ao: true, aa: true, air: true, lamps: 4 },
  medium: { pixelRatio: 1.0, shadowMap: 2048, cascades: 3, ao: true, aa: true, air: false, lamps: 2 },
  low: { pixelRatio: 0.75, shadowMap: 1024, cascades: 2, ao: false, aa: false, air: false, lamps: 0 },
};

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.webgpu = !!navigator.gpu;
  }

  async init(quality = 'high') {
    // depth: a reversed float buffer (`?depth=reversed`) keeps the precision of a logarithmic one over
    // the planet's distances without writing depth from every fragment, which turns off the GPU's
    // early depth test (each hidden surface fully shaded); `?depth=log` (and `?logdepth=1`) the
    // logarithmic buffer, `?depth=standard` (and `?logdepth=0`) a plain one, for comparison
    const qp = new URLSearchParams(location.search);
    const depthMode = qp.get('depth') || (qp.get('logdepth') === '0' ? 'standard' : qp.get('logdepth') === '1' ? 'log' : DEPTH_DEFAULT);
    const r = this.renderer = new THREE.WebGPURenderer({ canvas: this.canvas, antialias: false, forceWebGL: !this.webgpu, powerPreference: 'high-performance',
      logarithmicDepthBuffer: depthMode === 'log', reversedDepthBuffer: depthMode === 'reversed' });
    await r.init();
    SKY_FAR.value = r.reversedDepthBuffer ? 0 : 1;
    // instance matrices always as vertex attributes: below 64 kB three.js puts them in a uniform
    // array whose length is written into the shader, so every instance count was a new shader and
    // pipeline to compile (the repeated pieces of buildings come in hundreds of different counts)
    const caps = r.backend.capabilities;
    if (caps?.getUniformBufferLimit) caps.getUniformBufferLimit = () => 0;
    this.webgpu = r.backend.isWebGPUBackend === true;
    r.toneMapping = THREE.AgXToneMapping;
    r.toneMappingExposure = 0.55;          // set each frame from the climate and the eye's adaptation
    r.shadowMap.enabled = true;
    r.shadowMap.type = THREE.PCFShadowMap;
    // stained glass colours the sunlight that passes through it (material.castShadowNode)
    r.shadowMap.transmitted = true;

    const scene = this.scene = new THREE.Scene();
    const camera = this.camera = new THREE.PerspectiveCamera(68, 1, 0.08, 4000);
    camera.layers.enable(SMALL);           // small things: seen, but shadowed by the first cascade only
    camera.rotation.order = 'YXZ';

    // sky
    const sky = this.sky = new SkyMesh();
    sky.scale.setScalar(3500);
    sky.material.fog = false;
    scene.add(sky);
    // the night sky over it: stars, the band of the Milky Way, a faint glow; and the moon
    scene.add(this.stars = starDome(), this.moon = moonDisc());
    // haze: denser near the ground, glowing toward the sun; parameters come from the climate
    scene.fogNode = fog(fogColor, fogFactor);
    this.sunDir = [0, 1, 0];

    // sun
    const sun = this.sun = new THREE.DirectionalLight(0xffffff, 3);
    sun.castShadow = true;
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.04;
    sun.shadow.normalBias = 0.04;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 900;
    scene.add(sun, sun.target);

    // baked indirect light
    this.gi = new GIVolume();
    this.giNode = this.gi.irradianceNode();
    useGI(this.gi);

    // the room's air (set each frame by the climate and the world): how much under a roof, and the
    // building's haze ([dust, incense], air.js hazeOf)
    this.indoors = 0; this.haze = [1, 0.15];
    this.pipeline = new THREE.RenderPipeline(r);
    this.setQuality(quality);
    this.resize();
    addEventListener('resize', () => this.resize());
    return this;
  }

  setQuality(q) {
    const Q = this.Q = QUALITY[q] || QUALITY.high;
    this.quality = q;
    const r = this.renderer, sun = this.sun;
    r.setPixelRatio(Math.min(devicePixelRatio, Q.pixelRatio));
    sun.shadow.mapSize.set(Q.shadowMap, Q.shadowMap);
    if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null; }
    const csm = new CSMShadowNode(sun, { cascades: Q.cascades, maxFar: 320, mode: 'practical', lightMargin: 200 });
    csm.fade = true;
    sun.shadow.shadowNode = csm;
    // the lamps' pool: a fixed number of lights per preset (a change recompiles every material)
    if (this.lamps?.slots.length !== Q.lamps) { this.lamps?.dispose(); this.lamps = new LampPool(this.scene, Q.lamps); }
    this.airShadow = null;
    this.buildPipeline();
    this.resize();
  }

  buildPipeline() {
    const { scene, camera, Q } = this;
    // one scene pass: every material is compiled and drawn once per frame (a separate normal
    // pre-pass for the ambient occlusion doubled both the shaders to compile and the drawing);
    // the occlusion reads the depth alone and rebuilds the normals from it
    const scenePass = this.scenePass = pass(scene, camera);
    const gi = this.giNode;
    scenePass.contextNode = context({
      getGI: (input, { material }) => (material.transparent ? input : (input !== null ? input.add(gi) : gi)),
      // the sun is dimmed where the shadows of the clouds pass
      getShadow: ({ light, shadowColorNode }) => (light === this.sun ? shadowColorNode.mul(cloudShadow) : shadowColorNode),
    });
    // with the occlusion on, the scene pass also writes its view normals (one more target in the
    // same draw): GTAO rebuilding them from a reversed depth buffer came out mirrored about the
    // screen's middle row, a seam across every view with the lower half darker
    // The normals are blended by the alpha of what does not write depth (rain, snow, dust, halos:
    // the surface behind keeps its normal where they are clear), written outright by the rest.
    // Their outputs are matched to the pass's own target, not to whatever target the renderer has
    // when the fragment stage is set up: a shader compiled off the frame (precompile, three's
    // async build, which yields between its stages) otherwise left out the normal ("color target
    // has no corresponding fragment stage output (targets[1])")
    if (Q.ao) {
      const normalA = Fn((builder) => (builder.material?.depthWrite === false ? output.a : float(1)))();
      const sceneMRT = mrt({ output, normal: vec4(directionToColor(normalView), normalA) }).setBlendMode('normal', new THREE.BlendMode(THREE.NormalBlending));
      const setup = sceneMRT.setup;
      sceneMRT.setup = function (builder) {
        const r = builder.renderer, rt = r._renderTarget;
        r._renderTarget = scenePass.renderTarget;
        try { return setup.call(this, builder); } finally { r._renderTarget = rt; }
      };
      scenePass.setMRT(sceneMRT);
    }
    let color = scenePass.getTextureNode('output');
    if (Q.ao) {
      // with a reversed buffer the pass works unchanged: it rebuilds view positions through the
      // camera's own (reversed) projection, and the sky, at depth 0, lies on the far plane
      const normalTex = scenePass.getTextureNode('normal');
      const aoPass = ao(scenePass.getTextureNode('depth'), sample((q) => colorToDirection(normalTex.sample(q))), camera);
      aoPass.resolutionScale = 0.5;
      aoPass.distanceExponent.value = 1.0;
      aoPass.radius.value = 0.9;
      aoPass.thickness.value = 1.0;
      // occlusion darkens the shaded and half-lit parts; in full sun it is mostly hidden
      // the occlusion comes out of GTAO speckled (a 5×5 noise pattern turns its sample directions,
      // meant to be averaged by a denoiser): averaged here over about 5×5 of its texels, each
      // weighted by how near its depth lies to this pixel's, so that it does not bleed across edges
      const a = this.aoBlur(aoPass.getTextureNode(), scenePass.getTextureNode('depth'), camera);
      const lit = smoothstep(0.6, 3.0, luminance(color.rgb));
      color = vec4(color.rgb.mul(mix(a, mix(1, a, 0.35), lit)), color.a);
    }
    // the air of the room (air.js): needs the nearest cascade's map, made by the first frame (render)
    const sh0 = this.airShadow;
    if (Q.air && sh0) {
      const airTex = this.airTex = rtt(airNode({ depth: scenePass.getTextureNode('depth'), camera, shadow: sh0, reversed: this.renderer.reversedDepthBuffer, lamps: this.lamps }), null, null, { resolutionScale: 0.5 });
      color = airComposite(color, airTex, scenePass.getTextureNode('depth'), camera, this.airTexel = uniform(new THREE.Vector2(1e-3, 1e-3)));
      this.onAirResize = () => { const s = new THREE.Vector2(); this.renderer.getDrawingBufferSize(s); this.airTexel.value.set(2 / Math.max(1, s.x), 2 / Math.max(1, s.y)); };
      this.onAirResize();
    } else this.onAirResize = null;
    // the sun's disc is thousands of times brighter than the sky: clamp it before the bloom, or its
    // glow floods half the picture when one looks toward a low sun
    const glowSrc = vec4(min(color.rgb, vec3(2.5)), 1);
    let out = renderOutput(color.add(bloom(glowSrc, 0.07, 0.3, 1.4)));
    if (Q.aa) out = smaa(out);
    this.pipeline.outputColorTransform = false;
    this.pipeline.outputNode = out;
    this.pipeline.needsUpdate = true;
  }

  /**
   * Compile, off the frame, the shaders and pipelines that the meshes under `roots` (one or a list) will need, before
   * they are shown: three otherwise compiles them in the frame that first draws them, a hitch of a
   * tenth of a second to a second. One mesh of each kind (material, attributes, instancing) not
   * seen before is compiled, with the scene pass's own target, outputs and context, so that what is
   * compiled is what the frame will look for. Resolves when done (never rejects).
   */
  precompile(roots) {
    const r = this.renderer, sp = this.scenePass, ctx = sp?._contextNodeCache?.context;
    if (!r || !sp?.renderTarget || !ctx) return Promise.resolve();      // before the first frame
    const seen = this._compiled ??= new Set(), reps = [];
    for (const root of Array.isArray(roots) ? roots : [roots]) root.traverse((o) => {
      if (!o.isMesh || !o.material || !o.geometry) return;
      const g = o.geometry;
      const key = `${o.material.uuid}|${o.isInstancedMesh ? 1 : 0}${o.instanceColor ? 1 : 0}${g.index ? 1 : 0}${o.receiveShadow ? 1 : 0}|${Object.keys(g.attributes).sort().join()}`;
      if (seen.has(key)) return;
      seen.add(key); reps.push(o);
    });
    if (!reps.length) return Promise.resolve();
    // set up as the scene pass does. three's compileAsync gathers what to compile synchronously,
    // but builds each object's shader only in turn, awaiting between them: the second object on
    // was set up without the scene pass's outputs (its pipeline failed: "color target has no
    // corresponding fragment stage output"). So one object per call, each call's synchronous part
    // (the gathering and the start of the object's build) run with the scene pass's state, which
    // is put back before any frame can see it; the calls one after another
    const one = (o) => {
      const prev = { rt: r.getRenderTarget(), mrt: r.getMRT(), ctx: r.contextNode };
      const tmp = new THREE.Group(), home = [o.parent, o.frustumCulled, o.visible, o.count];
      tmp.add(o); o.frustumCulled = false; o.visible = true; if (o.isInstancedMesh && !o.count) o.count = 1;
      try {
        r.setRenderTarget(sp.renderTarget); r.setMRT(sp.getMRT?.() ?? sp._mrt ?? null); r.contextNode = ctx;
        return r.compileAsync(tmp, this.camera, this.scene);
        // (not the sun's shadow pass: three's compileAsync compiles each object later, after the
        // shadow pass's shared depth material has been reset, so what it would compile is not what
        // the shadow pass draws; those small shaders are still compiled on first use)
      } catch (e) { return Promise.reject(e); }
      finally {
        r.setRenderTarget(prev.rt); r.setMRT(prev.mrt); r.contextNode = prev.ctx;
        const [parent, fc, vis, n] = home;
        parent ? parent.add(o) : tmp.remove(o); o.frustumCulled = fc; o.visible = vis; if (o.isInstancedMesh) o.count = n;
      }
    };
    return reps.reduce((p, o) => p.then(() => one(o)), Promise.resolve()).catch((e) => console.warn('precompile:', e.message));
  }

  /** A depth-aware 5×5 average of the half-resolution occlusion, one of its texels apart: its
   *  noise pattern repeats every 5 texels, so a 5-wide average takes it out. */
  aoBlur(aoTex, depthTex, camera) {
    const projInv = uniform(camera.projectionMatrixInverse), texel = uniform(new THREE.Vector2());
    this.onResize = () => { const s = new THREE.Vector2(); this.renderer.getDrawingBufferSize(s); texel.value.set(2 / Math.max(1, s.x), 2 / Math.max(1, s.y)); };
    this.onResize();
    const c = uv(), zc = getViewPosition(c, depthTex.sample(c).r, projInv).z;
    const tol = abs(zc).mul(0.02).add(0.05);
    let sum = float(0), wsum = float(0);
    for (let j = -2; j <= 2; j++) for (let i = -2; i <= 2; i++) {
      const q = c.add(vec2(i, j).mul(texel));
      const z = getViewPosition(q, depthTex.sample(q).r, projInv).z;
      const w = max(float(1).sub(abs(z.sub(zc)).div(tol)), 0).add(i === 0 && j === 0 ? 1e-3 : 0);
      sum = sum.add(aoTex.sample(q).r.mul(w)); wsum = wsum.add(w);
    }
    // farther than a few tens of metres the occlusion's radius (0.9 m) is a few pixels, and what it
    // finds there is mostly the noise and the depth's own error mottling open ground: faded out
    return mix(sum.div(wsum), 1, smoothstep(25, 70, zc.negate()));
  }

  /**
   * Note whether the view moved this frame (looked round, walked, flew); the frame loop draws a
   * view that has held still for a while at a lower rate. (The resolution is not lowered while
   * moving: changing the pixel ratio re-makes every pass's targets and stalled the frame for up
   * to a second on the author's machine.)
   */
  setMotion(moving, now = performance.now()) {
    if (moving) this.movedAt = now;
  }

  resize() {
    if (!this.renderer) return;
    const w = innerWidth, h = innerHeight;
    this.renderer.setSize(w, h, false);
    this.onResize?.();
    this.onAirResize?.();
    this.camera.aspect = w / h;
    this.camera.fov = w < h ? 78 : 68;
    this.camera.updateProjectionMatrix();
  }

  /**
   * The camera's depth range for a height above the sea: from the eye to past the horizon (and
   * the mountains beyond it), the near plane pushed out as the camera rises.
   */
  setRange(alt, above = alt) {
    // alt: the camera's height above the sea (for the horizon); above: its height over the ground
    // under it (for the near plane, so that close walls are never cut away on high ground)
    const cam = this.camera, a = Math.max(0, alt), h = Math.max(0, above);
    const horizon = Math.sqrt((PLANET_RADIUS + a) ** 2 - PLANET_RADIUS ** 2) + Math.sqrt((PLANET_RADIUS + 240) ** 2 - PLANET_RADIUS ** 2);
    const near = Math.min(4, Math.max(0.08, h * 0.002)), far = Math.max(4000, horizon * 1.05);
    if (Math.abs(cam.near - near) > near * 0.1 || Math.abs(cam.far - far) > far * 0.05) { cam.near = near; cam.far = far; cam.updateProjectionMatrix(); }
    this.sky.horizonDip.value = Math.acos(Math.min(1, PLANET_RADIUS / (PLANET_RADIUS + a)));
  }

  /** Keep the sun's shadow cascades and the sky centred on the viewer. */
  update() {
    // the air's pass reads the nearest cascade's map, which the first frame with shadows makes
    if (this.Q.air && !this.airShadow) {
      const L0 = this.sun.shadow.shadowNode?.lights?.[0]?.shadow;
      if (L0?.map?.depthTexture) { this.airShadow = L0; this.buildPipeline(); }
    }
    const c = this.camera.position;
    this.sky.position.copy(c);
    this.stars.position.copy(c);
    const m = ENV.moonDir.value;
    this.moon.position.set(c.x + m.x * 3000, c.y + m.y * 3000, c.z + m.z * 3000);
    this.moon.lookAt(c);
    this.moon.visible = m.y > -0.05;
    const d = this.sunDir;
    this.sun.position.set(c.x + d[0] * 400, c.y + d[1] * 400, c.z + d[2] * 400);
    this.sun.target.position.copy(c);
    // the air indoors: the beams' dust and the smoke by the building's haze, fading in as one
    // goes under the roof; the light that casts the shadows (the sun, or the moon at night)
    const k = Math.max(0, Math.min(1, this.indoors || 0)), [dust, inc] = this.haze || [1, 0.15];
    AIR.sigma.value = 0.026 * dust * k;
    AIR.incense.value = 0.01 * inc * k;
    AIR.sun.value.copy(this.sun.color).multiplyScalar(this.sun.intensity * (1 - 0.7 * ENV.clouds.value));
    AIR.dir.value.set(d[0], d[1], d[2]).normalize();
    const amb = (this.gi.ambientAt(c.x, c.y, c.z) || 0) * this.gi.uIntensity.value;
    AIR.ambient.value.setRGB(0.95 * amb, 0.88 * amb, 0.78 * amb);
    const now = performance.now() / 1000;
    this.lamps?.update(now, Math.min(0.1, now - (this._lampT ?? now)));
    this._lampT = now;
  }

  render() {
    this.update();
    // the shadow cascades: the nearest drawn every frame, the middle one every second frame, the
    // farthest every third — far shadows move by a texel or less in a frame; each map keeps the
    // matrix it was drawn with, so a map drawn a frame ago still falls where it should
    const csm = this.sun.shadow.shadowNode, L = csm?.lights;
    if (L?.length && this.sun.castShadow) {
      const n = this.frameNo = (this.frameNo || 0) + 1;
      for (let i = 0; i < L.length; i++) {
        L[i].shadow.autoUpdate = false; if (i === 0 || n % (i + 1) === 0) L[i].shadow.needsUpdate = true;
        // the small things (layer SMALL) cast into the first cascade only: in the outer ones their
        // shadows are a texel or two but cost a draw each. (A mask of layer 0 alone would be taken
        // by three for "unset" and replaced by the camera's, so the outer ones carry an unused bit.)
        // Layer SHADOW (casters the camera does not see, merge.js LodSet) goes into every cascade.
        L[i].shadow.camera.layers.mask = (i === 0 ? (1 | (1 << SMALL)) : (1 | (1 << 3))) | (1 << SHADOW);
      }
    }
    this.pipeline.render();
  }

  /**
   * Make ready what is round the viewer before it is shown: draw a frame looking each of four
   * ways (behind the loading screen or the travel fade), so that the pipelines of everything near
   * are compiled exactly as the scene pass uses them, then wait for the GPU to finish.
   */
  async warmup() {
    const cam = this.camera, yaw = cam.rotation.y;
    for (let k = 0; k < 4; k++) { cam.rotation.y = yaw + k * Math.PI / 2; cam.updateMatrixWorld(); this.render(); }
    cam.rotation.y = yaw; cam.updateMatrixWorld();
    const device = this.renderer.backend?.device;
    if (device) await device.queue.onSubmittedWorkDone();
  }
}

/**
 * The night sky: a dome inside the sky's, adding stars (a few thousand points of different
 * brightness, twinkling a little), the Milky Way as a faint cloudy band, and a dim blue glow, all
 * fading in as the daylight goes and hidden by cloud.
 */
function starDome() {
  const m = new THREE.MeshBasicNodeMaterial({ side: THREE.BackSide, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
  const d = normalize(positionLocal);
  const N = 260, g = d.mul(N), cell = floor(g), f = fract(g).sub(0.5);
  const h = hash(cell.x.mul(7.13).add(cell.y.mul(113.31)).add(cell.z.mul(37.77)));
  const shape = smoothstep(0.32, 0.0, length(f));
  const bright = smoothstep(0.988, 1.0, h).mul(shape).mul(sin(time.mul(h.mul(9).add(2))).mul(0.18).add(0.82));
  const tint = mix(vec3(0.75, 0.82, 1.0), vec3(1.0, 0.86, 0.7), hash(cell.x.add(cell.z.mul(3.1))));
  // the Milky Way: a band about a great circle, broken by dust
  const axis = normalize(vec3(0.35, 0.6, -0.72));
  const band = exp(dot(d, axis).mul(dot(d, axis)).mul(-26)).mul(mx_fractal_noise_float(d.mul(9), 4, 2, 0.5).mul(0.5).add(0.5));
  const above = smoothstep(-0.05, 0.12, d.y);
  const night = ENV.night.mul(ENV.night).mul(float(1).sub(ENV.clouds.mul(0.95)));      // stars only once the sky is dark
  const glow = vec3(0.004, 0.007, 0.016).add(vec3(0.035, 0.04, 0.05).mul(band));
  m.colorNode = tint.mul(bright).mul(3.0).add(glow).mul(night).mul(above);
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(3200, 48, 24), m);
  mesh.name = 'stars';
  mesh.frustumCulled = false;
  mesh.renderOrder = -1;
  return mesh;
}

/** The full moon: a pale disc with darker seas, seen through the haze as the sky darkens. */
function moonDisc() {
  const m = new THREE.MeshBasicNodeMaterial({ transparent: true, depthWrite: false, fog: false });
  const p = positionLocal.xy.div(26);
  const r = length(p);
  const seas = mx_fractal_noise_float(vec3(p.mul(2.2), 1.7), 3, 2, 0.5).mul(0.5).add(0.5);
  const disc = smoothstep(1.0, 0.94, r);
  const lum = mix(float(1.0), float(0.72), smoothstep(0.45, 0.7, seas));
  m.colorNode = vec3(1.0, 0.98, 0.92).mul(lum).mul(4.0).mul(max(ENV.night, 0.15));
  m.opacityNode = disc.mul(float(1).sub(ENV.clouds.mul(0.85))).mul(smoothstep(0.0, 0.6, ENV.night).mul(0.85).add(0.15));
  const mesh = new THREE.Mesh(new THREE.CircleGeometry(26, 48), m);
  mesh.name = 'moon';
  mesh.frustumCulled = false;
  return mesh;
}

