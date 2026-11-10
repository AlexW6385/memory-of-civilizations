// The large map's globe drawn on the GPU (WebGL2): the planet's land colours baked once into an
// equirectangular texture (landColour of src/ui/globe.js, from the land map), and each frame a
// fragment shader turns the view into it: the coast from the distance field, the sea's shallows and
// the sun's glint, relief shading, the air at the rim, and the day and night of daylight().
// A frame costs well under a millisecond at the canvas's full resolution, so turning and zooming the
// globe is drawn every display frame. The 2D canvas above it carries the marks and names.

import { climateAt, LAND } from '../planet/land.js';

// the texture is the land map's own grid: its alpha the coast's signed distance (the land map's bytes),
// its colour the land's (climate and relief, no coast); the coast, beaches and the sea's depth are made
// in the shader from the interpolated distance, so the shore stays a clean line at any zoom
let TW = 2048, TH = 1024;

const VS = `#version 300 es
in vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }`;

const FS = `#version 300 es
precision highp float;
uniform sampler2D land;
uniform vec2 res;                    // canvas pixels
uniform float rad, lod, hasSun, scale;
uniform vec3 C, R, U, sun;
out vec4 o;
const vec3 BG = vec3(30.0, 26.0, 21.0) / 255.0;
const vec3 AIR = vec3(0.42, 0.62, 0.95);
const float PI = 3.141592653589793;
float day(float d) { return smoothstep(-0.1, 0.08, d); }
void main() {
  vec2 q2 = (gl_FragCoord.xy - 0.5 * res) / rad;
  float q = dot(q2, q2), rr = sqrt(q);
  float edge = (1.0 - rr) * rad;                 // pixels inside the rim
  // the air: a thin glow round the rim, lit where the sun is
  if (edge <= -1.0) {
    vec2 dir = q2 / max(rr, 1e-5);
    vec3 vr = normalize(R * dir.x + U * dir.y);
    float lit = hasSun > 0.5 ? 0.25 + 0.75 * day(dot(vr, sun) + 0.15) : 1.0;
    float g = exp((rr - 1.0) * -38.0) * 0.55 * lit;
    o = vec4(mix(BG, AIR, g), 1.0);
    return;
  }
  float z = sqrt(max(0.0, 1.0 - q));
  vec3 v = normalize(R * q2.x + U * q2.y + C * z);
  float lat = asin(clamp(v.y, -1.0, 1.0)), lon = atan(v.x, v.z);
  vec4 t = textureLod(land, vec2((lon / PI + 1.0) * 0.5, 0.5 - lat / PI), lod);
  float d = (t.a * 255.0 - 128.0) * scale;       // metres to the coast, land positive
  // the land, with its beach; the sea, lighter in the shallows
  vec3 ground = mix(t.rgb, vec3(214.0, 196.0, 150.0) / 255.0, (1.0 - smoothstep(4.0, 18.0, d)) * 0.7);
  float sh = smoothstep(-120.0, 0.0, d);
  vec3 sea = vec3(22.0 + 30.0 * sh, 52.0 + 45.0 * sh, 82.0 + 55.0 * sh) / 255.0;
  float w = max(fwidth(d), 1e-3);
  float landK = smoothstep(-0.6 * w, 0.6 * w, d);
  vec3 c = mix(sea, ground, landK);
  c *= 0.62 + 0.38 * sqrt(z);
  float lit = 1.0;
  if (hasSun > 0.5) {
    float dd = dot(v, sun);
    float dy = day(dd), dusk = max(0.0, 1.0 - abs(dd + 0.02) / 0.12) * 0.35;
    float k = 0.22 + 0.78 * dy;
    c = vec3(c.r * k * (1.0 + dusk * 0.5) + 6.0 / 255.0 * (1.0 - dy),
             c.g * k * (1.0 + dusk * 0.12) + 10.0 / 255.0 * (1.0 - dy),
             c.b * k * (1.0 - dusk * 0.2) + 26.0 / 255.0 * (1.0 - dy));
    // the sun's glint on the sea
    vec3 h = normalize(sun + C);
    c += vec3(1.0, 0.95, 0.85) * pow(max(dot(v, h), 0.0), 90.0) * 0.35 * (1.0 - landK) * dy;
    lit = 0.25 + 0.75 * dy;
  }
  // the air seen edgewise near the rim
  c = mix(c, AIR, pow(1.0 - z, 3.0) * 0.45 * lit);
  o = vec4(mix(BG, clamp(c, 0.0, 1.0), clamp(edge + 0.5, 0.0, 1.0)), 1.0);
}`;

export class GlobeGL {
  /** canvas: the canvas under the marks' canvas. landColour: (coast, climate) → [r, g, b]. */
  constructor(canvas, landColour) {
    this.canvas = canvas;
    this.landColour = landColour;
    const gl = this.gl = canvas.getContext('webgl2', { antialias: false, alpha: false, preserveDrawingBuffer: false });
    if (!gl) throw new Error('no WebGL2');
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    const pr = this.prog = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(pr));
    this.loc = {};
    for (const n of ['land', 'res', 'rad', 'lod', 'hasSun', 'scale', 'C', 'R', 'U', 'sun']) this.loc[n] = gl.getUniformLocation(pr, n);
    const vb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vb);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);
    const pl = gl.getAttribLocation(pr, 'p');
    gl.enableVertexAttribArray(pl); gl.vertexAttribPointer(pl, 2, gl.FLOAT, false, 0, 0);
    this.tex = null;
    this.ready = false;
  }

  /**
   * Bake the land texture, a band of rows in each idle moment (about half a second of work in all);
   * resolves when it is done. Until then the map is drawn the old way.
   */
  bake() {
    if (this._baking) return this._baking;
    return (this._baking = (async () => {
      while (!LAND.ready) await new Promise((r) => setTimeout(r, 200));
      TW = LAND.W; TH = LAND.H;
      const px = new Uint8Array(TW * TH * 4), v = [0, 0, 0], ve = [0, 0, 0], vn = [0, 0, 0];
      const idle = () => new Promise((r) => (globalThis.requestIdleCallback ? requestIdleCallback(r, { timeout: 200 }) : setTimeout(r, 0)));
      const at = (o, lat, lon) => { const cl = Math.cos(lat); o[0] = cl * Math.sin(lon); o[1] = Math.sin(lat); o[2] = cl * Math.cos(lon); return o; };
      const step = 2 * Math.PI / TW;
      for (let j0 = 0; j0 < TH; j0 += 16) {
        await idle();
        for (let j = j0; j < Math.min(TH, j0 + 16); j++) {
          const lat = (0.5 - (j + 0.5) / TH) * Math.PI;
          for (let i = 0; i < TW; i++) {
            const lon = ((i + 0.5) / TW * 2 - 1) * Math.PI;
            const cl = climateAt(at(v, lat, lon));
            const c = this.landColour(1e4, cl);
            // relief: the mountains lit from the north-west (the climate's mountain height)
            const me = climateAt(at(ve, lat, lon + step * 2))[0], mn = climateAt(at(vn, Math.min(1.56, lat + step * 2), lon))[0];
            const s2 = Math.max(0.78, Math.min(1.18, 1 + ((me - cl[0]) - (mn - cl[0])) * 0.012));
            const k = (j * TW + i) * 4;
            px[k] = Math.min(255, c[0] * s2); px[k + 1] = Math.min(255, c[1] * s2); px[k + 2] = Math.min(255, c[2] * s2);
            px[k + 3] = LAND.sdf[j * TW + i];
          }
        }
      }
      const gl = this.gl, t = this.tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, TW, TH, 0, gl.RGBA, gl.UNSIGNED_BYTE, px);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      this.ready = true;
    })());
  }

  /** Draw the globe: W × H canvas pixels, radius rad (px), the view's basis {c, r, u}, sun (or null). */
  draw(W, H, rad, { c, r, u }, sun) {
    const gl = this.gl, cv = this.canvas, L = this.loc;
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
    gl.viewport(0, 0, W, H);
    gl.useProgram(this.prog);
    gl.bindVertexArray(this.vao);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.uniform1i(L.land, 0);
    gl.uniform2f(L.res, W, H);
    gl.uniform1f(L.rad, rad);
    gl.uniform1f(L.scale, LAND.scale);
    // the mip level for the texels per pixel at the centre of the globe
    gl.uniform1f(L.lod, Math.max(0, Math.log2(TW / (2 * Math.PI * rad))));
    gl.uniform3fv(L.C, c); gl.uniform3fv(L.R, r); gl.uniform3fv(L.U, u);
    gl.uniform1f(L.hasSun, sun ? 1 : 0);
    gl.uniform3fv(L.sun, sun || [0, 1, 0]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
}
