// The large map's globe drawn on the GPU (WebGL2). The land map itself (src/planet/land.js) is the
// shader's data, uploaded as two textures with no baking: the coast's signed distance and the climate
// (mountain height, moisture, warmth). Each frame a fragment shader turns the view into the planet and
// makes its picture there: biomes blended from the climate and broken up by noise (forest and
// grassland, steppe, desert, tundra and ice), mountains raised from the climate's ranges into ridged
// crests with snow on the high cold ones, relief shading, the coast as a clean line at any zoom,
// shallows and deep sea, the sun's glint, the air at the rim, and the day and night of daylight().
// The noise is a tileable 3D texture sampled at the planet position (no seam, no pole), its
// octaves faded out below a few pixels so nothing shimmers while the globe turns. The rivers are
// drawn over it as lines by globe.js.

import { LAND } from '../planet/land.js';

const VS = `#version 300 es
in vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }`;

const FS = `#version 300 es
precision highp float;
precision highp sampler3D;
uniform sampler2D sdf, clim;
uniform sampler3D N;
uniform vec2 res, climSize;          // canvas pixels; the climate grid
uniform float rad, hasSun, scale;
uniform vec3 C, R, U, sun;
out vec4 o;
const vec3 BG = vec3(30.0, 26.0, 21.0) / 255.0;
const vec3 AIR = vec3(0.42, 0.62, 0.95);
const float PI = 3.141592653589793;
float fw;                            // planet units per pixel here

float day(float d) { return smoothstep(-0.1, 0.08, d); }
// the climate grid sampled bicubically (four bilinear taps): its cells' edges do not show close up
vec4 bicubic(sampler2D t, vec2 uv, vec2 size) {
  vec2 st = uv * size - 0.5, i = floor(st), f = st - i;
  vec2 w0 = (1.0 - f) * (1.0 - f) * (1.0 - f) / 6.0, w1 = (4.0 - 6.0 * f * f + 3.0 * f * f * f) / 6.0;
  vec2 w2 = (1.0 + 3.0 * f + 3.0 * f * f - 3.0 * f * f * f) / 6.0, w3 = f * f * f / 6.0;
  vec2 g0 = w0 + w1, g1 = w2 + w3, h0 = (w1 / g0) - 1.0 + i + 0.5, h1 = (w3 / g1) + 1.0 + i + 0.5;
  return (texture(t, vec2(h0.x, h0.y) / size) * g0.x + texture(t, vec2(h1.x, h0.y) / size) * g1.x) * g0.y
       + (texture(t, vec2(h0.x, h1.y) / size) * g0.x + texture(t, vec2(h1.x, h1.y) / size) * g1.x) * g1.y;
}
// noise, −1…1, with f features per planet radius
float n1(vec3 p, float f, float o) { return texture(N, p * (f / 16.0) + o).r * 2.0 - 1.0; }
// octaves fade out when their features fall below ~3 pixels
float keep(float f) { return 1.0 - smoothstep(0.12, 0.35, f * fw); }
float fbm(vec3 p, float f, int oct) {
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 7; i++) { if (i >= oct) break; s += a * keep(f) * n1(p, f, float(i) * 0.37); f *= 2.03; a *= 0.5; }
  return s;
}
float ridged(vec3 p, float f, int oct) {
  float s = 0.0, a = 0.55, w = 1.0;
  for (int i = 0; i < 7; i++) {
    if (i >= oct) break;
    float r = 1.0 - abs(n1(p, f, 0.21 + float(i) * 0.53));
    r = r * r * w; w = clamp(r * 1.8, 0.0, 1.0);
    s += a * mix(0.45, r, keep(f)); f *= 2.07; a *= 0.5;
  }
  return s;
}

void main() {
  vec2 q2 = (gl_FragCoord.xy - 0.5 * res) / rad;
  float q = dot(q2, q2), rr = sqrt(q);
  float edge = (1.0 - rr) * rad;                 // pixels inside the rim
  if (edge <= -1.0) {
    // the air: a thin glow round the rim, lit where the sun is
    vec2 dir = q2 / max(rr, 1e-5);
    vec3 vr = normalize(R * dir.x + U * dir.y);
    float lit = hasSun > 0.5 ? 0.25 + 0.75 * day(dot(vr, sun) + 0.15) : 1.0;
    o = vec4(mix(BG, AIR, exp((rr - 1.0) * -38.0) * 0.55 * lit), 1.0);
    return;
  }
  float z = sqrt(max(0.0, 1.0 - q));
  fw = 1.0 / (rad * max(z, 0.2));
  vec3 v = normalize(R * q2.x + U * q2.y + C * z);
  float lat = asin(clamp(v.y, -1.0, 1.0)), lon = atan(v.x, v.z);
  vec2 uv = vec2((lon / PI + 1.0) * 0.5, 0.5 - lat / PI);
  float d = (texture(sdf, uv).r * 255.0 - 128.0) * scale;      // metres to the coast, land positive
  vec3 p = v;
  // domain warp: the borders between biomes and the ranges' crests wander
  vec3 wp = p + 0.035 * vec3(fbm(p, 9.0, 3), fbm(p + 3.1, 9.0, 3), fbm(p + 5.7, 9.0, 3));
  // the climate looked up a little off the point, by noise: the dry lands' drawn outlines become ragged
  vec2 cuv = uv + vec2(fbm(p + 11.0, 7.0, 5), fbm(p + 23.0, 7.0, 5)) * vec2(0.012, 0.022);
  vec3 cl = bicubic(clim, cuv, climSize).rgb;                 // mountain 0…1 (200 m), moisture, warmth
  float moist = clamp(cl.g + 0.18 * fbm(wp, 14.0, 5), 0.0, 1.0);
  float warm = clamp(cl.b + 0.07 * fbm(wp + 1.7, 11.0, 3), 0.0, 1.0);
  float m = cl.r;

  // ── height: low hills everywhere on land, the ranges raised into ridged crests ──
  float hills = fbm(wp, 26.0, 6);
  float crest = ridged(wp, 34.0, 6);
  float h = m * (0.25 + 0.95 * crest) + 0.05 * hills + 0.02 * smoothstep(0.0, 60.0, d);

  // ── the ground's colour ──
  float grain = fbm(p, 180.0, 6);                // fine mottling: fields, scrub, rock
  float patchy = fbm(wp + 7.3, 48.0, 5);         // woods and clearings
  vec3 forest = mix(vec3(0.13, 0.25, 0.11), vec3(0.18, 0.31, 0.13), 0.5 + 0.5 * grain);
  vec3 grass = mix(vec3(0.33, 0.45, 0.20), vec3(0.42, 0.50, 0.24), 0.5 + 0.5 * grain);
  vec3 jungle = mix(vec3(0.07, 0.21, 0.08), vec3(0.12, 0.28, 0.10), 0.5 + 0.5 * patchy);
  vec3 steppe = mix(vec3(0.56, 0.55, 0.33), vec3(0.64, 0.59, 0.38), 0.5 + 0.5 * grain);
  vec3 sand = mix(vec3(0.80, 0.69, 0.48), vec3(0.86, 0.76, 0.55), 0.5 + 0.5 * fbm(p * vec3(1.0, 0.35, 1.0), 120.0, 4));
  vec3 redrock = vec3(0.66, 0.44, 0.30);
  vec3 tundra = mix(vec3(0.46, 0.47, 0.39), vec3(0.55, 0.54, 0.46), 0.5 + 0.5 * grain);
  vec3 rock = mix(vec3(0.42, 0.38, 0.34), vec3(0.55, 0.50, 0.45), 0.5 + 0.5 * fbm(p, 90.0, 4));
  vec3 snow = vec3(0.93, 0.95, 0.97);
  // temperate: woods in patches over grassland, more of them the wetter it is
  float woods = smoothstep(0.15, 0.55, patchy * 0.6 + (moist - 0.5) * 1.6);
  vec3 temperate = mix(grass, forest, woods);
  vec3 g = temperate;
  g = mix(steppe, g, smoothstep(0.33, 0.52, moist));
  vec3 desert = mix(sand, redrock, smoothstep(0.2, 0.6, fbm(wp + 2.2, 22.0, 4)) * 0.45);
  g = mix(desert, g, smoothstep(0.12, 0.38, moist));
  g = mix(g, jungle, smoothstep(0.62, 0.8, moist) * smoothstep(0.62, 0.8, warm));
  g = mix(tundra, g, smoothstep(0.18, 0.34, warm));
  // the ranges: bare rock up their flanks, snow on the crests of the high and the cold
  float bare = smoothstep(0.12, 0.48, h);
  g = mix(g, rock, bare * 0.85);
  float snowline = 0.5 + warm * 0.5 + 0.08 * fbm(p, 70.0, 4);
  float snowK = smoothstep(snowline - 0.04, snowline + 0.04, h) * smoothstep(0.35, 0.65, crest + 0.2);
  // the poles' ice
  snowK = max(snowK, smoothstep(0.12, 0.05, warm + 0.04 * fbm(p, 40.0, 4)));
  g = mix(g, snow, snowK);
  // the beach
  g = mix(g, vec3(0.84, 0.77, 0.59), (1.0 - smoothstep(3.0, 14.0, d + 4.0 * grain)) * 0.75);

  // relief shading, lit from the upper left of the view (north-west with north up): the height's
  // slope across the screen, per planet unit
  vec2 gr = vec2(dFdx(h), dFdy(h)) / fw;
  float shade = clamp(1.0 + dot(gr, vec2(0.7, -0.7)) * 0.016, 0.6, 1.3);
  g *= mix(1.0, shade, smoothstep(0.0, 20.0, d));

  // ── the sea: turquoise shallows, deep blue, a faint swell ──
  float depth = smoothstep(-130.0, 0.0, d);
  vec3 sea = mix(vec3(0.05, 0.14, 0.27), vec3(0.09, 0.24, 0.38), depth);
  sea = mix(sea, vec3(0.14, 0.36, 0.46), smoothstep(0.82, 1.0, depth) * 0.45);
  sea *= 1.0 + 0.05 * fbm(p, 30.0, 4);

  float w = max(fwidth(d), 1e-3);
  float landK = smoothstep(-0.6 * w, 0.6 * w, d);
  vec3 c = mix(sea, g, landK);
  c *= 0.66 + 0.34 * sqrt(z);
  float lit = 1.0;
  if (hasSun > 0.5) {
    float dd = dot(v, sun);
    float dy = day(dd), dusk = max(0.0, 1.0 - abs(dd + 0.02) / 0.12) * 0.35;
    float k = 0.22 + 0.78 * dy;
    c = vec3(c.r * k * (1.0 + dusk * 0.5) + 6.0 / 255.0 * (1.0 - dy),
             c.g * k * (1.0 + dusk * 0.12) + 10.0 / 255.0 * (1.0 - dy),
             c.b * k * (1.0 - dusk * 0.2) + 26.0 / 255.0 * (1.0 - dy));
    vec3 hv = normalize(sun + C);
    c += vec3(1.0, 0.95, 0.85) * pow(max(dot(v, hv), 0.0), 90.0) * 0.32 * (1.0 - landK) * dy;
    lit = 0.25 + 0.75 * dy;
  }
  c = mix(c, AIR, pow(1.0 - z, 3.0) * 0.45 * lit);
  o = vec4(mix(BG, clamp(c, 0.0, 1.0), clamp(edge + 0.5, 0.0, 1.0)), 1.0);
}`;

/**
 * A tileable 128³ texture of smooth value noise (a 16-cell lattice, eight texels a cell, quintic
 * between), in half floats so the relief shading's slopes come out smooth, not in steps. Made once.
 */
function noiseVolume() {
  const L = 16, S = 128, K = S / L, lat = new Float32Array(L * L * L);
  let seed = 1234567;
  for (let i = 0; i < lat.length; i++) { seed = (Math.imul(seed, 1103515245) + 12345) >>> 0; lat[i] = seed / 4294967296; }
  const at = (x, y, z) => lat[((z % L) * L + (y % L)) * L + (x % L)];
  const q = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  const l = (a, b, t) => a + (b - a) * t;
  const f32 = new Float32Array(1), u32 = new Uint32Array(f32.buffer);
  const half = (v) => { f32[0] = v; const x = u32[0], e = ((x >>> 23) & 255) - 127 + 15, m = (x >>> 13) & 1023; return e <= 0 ? 0 : ((x >>> 16) & 0x8000) | (e << 10) | m; };
  const out = new Uint16Array(S * S * S);
  for (let z = 0; z < S; z++) for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const fx = x / K, fy = y / K, fz = z / K, x0 = Math.floor(fx), y0 = Math.floor(fy), z0 = Math.floor(fz);
    const u = q(fx - x0), v = q(fy - y0), w = q(fz - z0);
    const val = l(l(l(at(x0, y0, z0), at(x0 + 1, y0, z0), u), l(at(x0, y0 + 1, z0), at(x0 + 1, y0 + 1, z0), u), v),
      l(l(at(x0, y0, z0 + 1), at(x0 + 1, y0, z0 + 1), u), l(at(x0, y0 + 1, z0 + 1), at(x0 + 1, y0 + 1, z0 + 1), u), v), w);
    out[(z * S + y) * S + x] = half(val);
  }
  return out;
}

export class GlobeGL {
  /** canvas: the canvas under the marks' canvas. */
  constructor(canvas) {
    this.canvas = canvas;
    const gl = this.gl = canvas.getContext('webgl2', { antialias: false, alpha: false, preserveDrawingBuffer: false });
    if (!gl) throw new Error('no WebGL2');
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    const pr = this.prog = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(pr));
    this.loc = {};
    for (const n of ['sdf', 'clim', 'N', 'res', 'climSize', 'rad', 'hasSun', 'scale', 'C', 'R', 'U', 'sun']) this.loc[n] = gl.getUniformLocation(pr, n);
    const vb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vb);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);
    const pl = gl.getAttribLocation(pr, 'p');
    gl.enableVertexAttribArray(pl); gl.vertexAttribPointer(pl, 2, gl.FLOAT, false, 0, 0);
    this.ready = false;
  }

  /** Upload the land map and the noise (as soon as the land map has come); resolves when done. */
  bake() {
    if (this._baking) return this._baking;
    return (this._baking = (async () => {
      while (!LAND.ready) await new Promise((r) => setTimeout(r, 200));
      const gl = this.gl;
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      const tex2 = (unit, fmt, ifmt, w, h, data) => {
        const t = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t);
        gl.texImage2D(gl.TEXTURE_2D, 0, ifmt, w, h, 0, fmt, gl.UNSIGNED_BYTE, data);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        return t;
      };
      this.tSdf = tex2(0, gl.RED, gl.R8, LAND.W, LAND.H, LAND.sdf);
      this.tClim = tex2(1, gl.RGBA, gl.RGBA8, LAND.W2, LAND.H2, LAND.climate);
      const t3 = this.tN = gl.createTexture();
      gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_3D, t3);
      gl.texImage3D(gl.TEXTURE_3D, 0, gl.R16F, 128, 128, 128, 0, gl.RED, gl.HALF_FLOAT, noiseVolume());
      // (no mipmaps: a half-float texture cannot have them made here; the octaves too fine for the
      // pixels are faded out in the shader instead)
      gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      for (const p of [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T, gl.TEXTURE_WRAP_R]) gl.texParameteri(gl.TEXTURE_3D, p, gl.REPEAT);
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
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.tSdf);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, this.tClim);
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_3D, this.tN);
    gl.uniform1i(L.sdf, 0); gl.uniform1i(L.clim, 1); gl.uniform1i(L.N, 2);
    gl.uniform2f(L.res, W, H);
    gl.uniform2f(L.climSize, LAND.W2, LAND.H2);
    gl.uniform1f(L.rad, rad);
    gl.uniform1f(L.scale, LAND.scale);
    gl.uniform3fv(L.C, c); gl.uniform3fv(L.R, r); gl.uniform3fv(L.U, u);
    gl.uniform1f(L.hasSun, sun ? 1 : 0);
    gl.uniform3fv(L.sun, sun || [0, 1, 0]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
}
