// The large map's globe drawn on the GPU (WebGL2): the planet's land colours baked once into an
// equirectangular texture (landColour of src/ui/globe.js, from the land map), and each frame a
// fragment shader turns the view into it, with the rim shading and the day and night of daylight().
// A frame costs well under a millisecond at the canvas's full resolution, so turning and zooming the
// globe is drawn every display frame. The 2D canvas above it carries the marks and names.

import { coastAt, climateAt, LAND } from '../planet/land.js';

const TW = 2048, TH = 1024;          // the baked texture (the land map's own grid is about as fine)

const VS = `#version 300 es
in vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }`;

const FS = `#version 300 es
precision highp float;
uniform sampler2D land;
uniform vec2 res;                    // canvas pixels
uniform float rad, lod, hasSun;
uniform vec3 C, R, U, sun;
out vec4 o;
const vec3 BG = vec3(30.0, 26.0, 21.0) / 255.0;
const float PI = 3.141592653589793;
void main() {
  vec2 q2 = (gl_FragCoord.xy - 0.5 * res) / rad;
  float q = dot(q2, q2);
  float edge = (1.0 - sqrt(q)) * rad;            // pixels inside the rim
  if (edge <= -1.0) { o = vec4(BG, 1.0); return; }
  float z = sqrt(max(0.0, 1.0 - q));
  vec3 v = normalize(R * q2.x + U * q2.y + C * z);
  float lat = asin(clamp(v.y, -1.0, 1.0)), lon = atan(v.x, v.z);
  vec3 c = textureLod(land, vec2((lon / PI + 1.0) * 0.5, 0.5 - lat / PI), lod).rgb;
  c *= 0.55 + 0.45 * sqrt(z);
  if (hasSun > 0.5) {
    float d = dot(v, sun);
    float day = smoothstep(-0.1, 0.08, d), dusk = max(0.0, 1.0 - abs(d + 0.02) / 0.12) * 0.35;
    float k = 0.22 + 0.78 * day;
    c = vec3(c.r * k * (1.0 + dusk * 0.5) + 6.0 / 255.0 * (1.0 - day),
             c.g * k * (1.0 + dusk * 0.12) + 10.0 / 255.0 * (1.0 - day),
             c.b * k * (1.0 - dusk * 0.2) + 26.0 / 255.0 * (1.0 - day));
  }
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
    for (const n of ['land', 'res', 'rad', 'lod', 'hasSun', 'C', 'R', 'U', 'sun']) this.loc[n] = gl.getUniformLocation(pr, n);
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
      const px = new Uint8Array(TW * TH * 4), v = [0, 0, 0];
      const idle = () => new Promise((r) => (globalThis.requestIdleCallback ? requestIdleCallback(r, { timeout: 200 }) : setTimeout(r, 0)));
      for (let j0 = 0; j0 < TH; j0 += 32) {
        await idle();
        for (let j = j0; j < Math.min(TH, j0 + 32); j++) {
          const lat = (0.5 - (j + 0.5) / TH) * Math.PI, cl = Math.cos(lat), sl = Math.sin(lat);
          for (let i = 0; i < TW; i++) {
            const lon = ((i + 0.5) / TW * 2 - 1) * Math.PI;
            v[0] = cl * Math.sin(lon); v[1] = sl; v[2] = cl * Math.cos(lon);
            const c = this.landColour(coastAt(v), climateAt(v)), k = (j * TW + i) * 4;
            px[k] = c[0]; px[k + 1] = c[1]; px[k + 2] = c[2]; px[k + 3] = 255;
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
    // the mip level for the texels per pixel at the centre of the globe
    gl.uniform1f(L.lod, Math.max(0, Math.log2(TW / (2 * Math.PI * rad))));
    gl.uniform3fv(L.C, c); gl.uniform3fv(L.R, r); gl.uniform3fv(L.U, u);
    gl.uniform1f(L.hasSun, sun ? 1 : 0);
    gl.uniform3fv(L.sun, sun || [0, 1, 0]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
}
