// Earth's land carried onto the planet as a raster: the mask of land and the distance to the coast
// (metres on the planet), on an equirectangular grid of the planet's latitude and longitude.
// Natural Earth land polygons (public domain) via the world-atlas package. Shared by
// tools/planet-layout.mjs and tools/planet-land.mjs.

import { readFile } from 'node:fs/promises';
import { unit, latLon, DEG } from '../../src/planet/geo.js';

/** Land rings as [lon, lat] arrays (true coordinates). */
export async function earthRings(res = '50m') {
  const topo = JSON.parse(await readFile(new URL(`../../node_modules/world-atlas/land-${res}.json`, import.meta.url), 'utf8'));
  const [sx, sy] = topo.transform.scale, [tx, ty] = topo.transform.translate;
  const arcs = topo.arcs.map((a) => { let x = 0, y = 0; return a.map(([dx, dy]) => { x += dx; y += dy; return [x * sx + tx, y * sy + ty]; }); });
  const arc = (i) => (i >= 0 ? arcs[i] : arcs[~i].slice().reverse());
  const rings = [];
  for (const g of topo.objects.land.geometries) {
    const polys = g.type === 'Polygon' ? [g.arcs] : g.arcs;
    for (const poly of polys) for (const ringArcs of poly) {
      const ring = [];
      for (const a of ringArcs) { const pts = arc(a); for (let k = ring.length ? 1 : 0; k < pts.length; k++) ring.push(pts[k]); }
      rings.push(ring);
    }
  }
  return rings;
}

/** The rings carried onto the planet by `map` (unit vector → unit vector), densified, longitudes unwrapped. */
export function mapRings(rings, map, step = 0.2) {
  const out = [];
  for (const ring of rings) {
    const r = [];
    for (let i = 0; i < ring.length; i++) {
      const [lo0, la0] = ring[i], [lo1, la1] = ring[(i + 1) % ring.length];
      let dlo = lo1 - lo0; if (dlo > 180) dlo -= 360; if (dlo < -180) dlo += 360;
      const n = Math.max(1, Math.ceil(Math.max(Math.abs(dlo), Math.abs(la1 - la0)) / step));
      for (let k = 0; k < n; k++) {
        const t = k / n, [la, lo] = latLon(map(unit(la0 + (la1 - la0) * t, lo0 + dlo * t)));
        r.push([lo, la]);
      }
    }
    for (let i = 1; i < r.length; i++) { while (r[i][0] - r[i - 1][0] > 180) r[i][0] -= 360; while (r[i][0] - r[i - 1][0] < -180) r[i][0] += 360; }
    if (Math.abs(r[r.length - 1][0] - r[0][0]) > 300) {         // round a pole (Antarctica): close over it
      const pole = r.reduce((s, p) => s + p[1], 0) < 0 ? -90 : 90;
      r.push([r[r.length - 1][0], pole], [r[0][0], pole]);
    }
    out.push(r);
  }
  return out;
}

/** Rasterise rings (even-odd) into a WS × HS mask (1 = land). */
export function rasterise(rings, WS, HS) {
  const mask = new Uint8Array(WS * HS);
  const xs = (lo) => (lo + 180) / 360 * WS - 0.5, ys = (la) => (90 - la) / 180 * HS - 0.5;
  const cross = Array.from({ length: HS }, () => []);
  for (const r of rings) {
    for (let i = 0; i < r.length; i++) {
      const a = r[i], b = r[(i + 1) % r.length], ya = ys(a[1]), yb = ys(b[1]);
      if (ya === yb) continue;
      const y0 = Math.ceil(Math.min(ya, yb)), y1 = Math.floor(Math.max(ya, yb) - 1e-9);
      for (let y = Math.max(0, y0); y <= Math.min(HS - 1, y1); y++) cross[y].push(xs(a[0]) + (xs(b[0]) - xs(a[0])) * (y - ya) / (yb - ya));
    }
  }
  for (let y = 0; y < HS; y++) {
    const c = cross[y].sort((p, q) => p - q);
    for (let i = 0; i + 1 < c.length; i += 2) {
      for (let x = Math.ceil(c[i]), x1 = Math.floor(c[i + 1]); x <= x1; x++) mask[y * WS + ((x % WS) + WS) % WS] ^= 1;
    }
  }
  return mask;
}

const INF = 1e20;
function edt1(f, n, s, out, v, z) {
  let k = 0; v[0] = 0; z[0] = -INF; z[1] = INF;
  for (let q = 1; q < n; q++) {
    let sp;
    for (;;) { const p = v[k]; sp = ((f[q] + (q * s) ** 2) - (f[p] + (p * s) ** 2)) / (2 * s * s * (q - p)); if (sp <= z[k]) k--; else break; }
    k++; v[k] = q; z[k] = sp; z[k + 1] = INF;
  }
  k = 0;
  for (let q = 0; q < n; q++) { while (z[k + 1] < q) k++; out[q] = ((q - v[k]) * s) ** 2 + f[v[k]]; }
}

/** Squared distance (m², planet of radius R) from every cell to the nearest cell whose mask equals target. */
function distanceTo(mask, WS, HS, R, target) {
  const cell = 2 * Math.PI * R / WS, g = new Float64Array(WS * HS);
  const n = WS * 3, F = new Float64Array(n), O = new Float64Array(n), V = new Int32Array(n + 1), Z = new Float64Array(n + 2);
  for (let y = 0; y < HS; y++) {
    const s = cell * Math.max(0.02, Math.cos((90 - (y + 0.5) / HS * 180) * DEG));
    for (let x = 0; x < n; x++) F[x] = mask[y * WS + (x % WS)] === target ? 0 : INF;
    edt1(F, n, s, O, V, Z);
    for (let x = 0; x < WS; x++) g[y * WS + x] = O[x + WS];
  }
  const cellY = Math.PI * R / HS, f = new Float64Array(HS), o = new Float64Array(HS), v = new Int32Array(HS + 1), z = new Float64Array(HS + 2);
  for (let x = 0; x < WS; x++) {
    for (let y = 0; y < HS; y++) f[y] = g[y * WS + x];
    edt1(f, HS, cellY, o, v, z);
    for (let y = 0; y < HS; y++) g[y * WS + x] = o[y];
  }
  return g;
}

/**
 * Signed distance to the coast (m, land positive) on a W × H grid, from a mask supersampled ss
 * times. Returns a Float32Array.
 */
export function signedDistance(rings, W, R, ss = 2) {
  const H = W / 2, WS = W * ss, HS = H * ss;
  const mask = rasterise(rings, WS, HS);
  const toSea = distanceTo(mask, WS, HS, R, 0), toLand = distanceTo(mask, WS, HS, R, 1);
  const half = 0.5 * 2 * Math.PI * R / WS;
  const out = new Float32Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let d = 0;
    for (let j = 0; j < ss; j++) for (let i = 0; i < ss; i++) {
      const k = (y * ss + j) * WS + x * ss + i;
      d += mask[k] ? Math.sqrt(toSea[k]) - half : -Math.sqrt(toLand[k]) + half;
    }
    out[y * W + x] = d / (ss * ss);
  }
  return out;
}

/** Bilinear sample of a W × H equirectangular grid at (lat, lon). */
export function sampleGrid(g, W, H, lat, lon) {
  const fx = ((lon + 180) / 360) * W - 0.5, fy = ((90 - lat) / 180) * H - 0.5;
  const x0 = Math.floor(fx), y0 = Math.max(0, Math.min(H - 2, Math.floor(fy))), tx = fx - x0, ty = Math.max(0, Math.min(1, fy - y0));
  const xa = ((x0 % W) + W) % W, xb = (xa + 1) % W;
  return (g[y0 * W + xa] * (1 - tx) + g[y0 * W + xb] * tx) * (1 - ty) + (g[(y0 + 1) * W + xa] * (1 - tx) + g[(y0 + 1) * W + xb] * tx) * ty;
}
