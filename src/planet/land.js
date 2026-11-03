// The planet's land map (data/planet/land.bin, made by tools/planet-land.mjs): the distance to the
// coast and the climate, on equirectangular grids of the planet's latitude and longitude. Loaded
// once in the viewer and handed to the workers; sampled bilinearly.

export const LAND = { ready: false, W: 0, H: 0, W2: 0, H2: 0, scale: 1, sdf: null, climate: null };

/** Parse the file's bytes (the header, then a gzip stream) — the gzip is undone by the caller's means. */
export function setLand({ W, H, W2, H2, scale, sdf, climate }) {
  Object.assign(LAND, { W, H, W2, H2, scale, sdf, climate, ready: true });
}

/** Fetch and unpack data/planet/land.bin (browser and workers: DecompressionStream). */
export async function loadLand(url) {
  const buf = await (await fetch(url)).arrayBuffer();
  const u32 = new Uint32Array(buf, 0, 6);
  if (u32[0] !== 0x444c504d) throw new Error('bad land file ' + url);
  const [W, H, W2, H2] = [u32[2], u32[3], u32[4], u32[5]];
  const scale = new Float32Array(buf, 24, 1)[0];
  const stream = new Blob([buf.slice(32)]).stream().pipeThrough(new DecompressionStream('gzip'));
  const bytes = new Uint8Array(await new Response(stream).arrayBuffer());
  const data = { W, H, W2, H2, scale, sdf: bytes.subarray(0, W * H), climate: bytes.subarray(W * H, W * H + W2 * H2 * 4) };
  setLand(data);
  return data;
}

/** Grid coordinates of a unit vector on a W × H equirectangular grid. */
function grid(u, W, H) {
  const lat = Math.asin(Math.max(-1, Math.min(1, u[1]))), lon = Math.atan2(u[0], u[2]);
  return [((lon / Math.PI + 1) / 2) * W - 0.5, ((0.5 - lat / Math.PI)) * H - 0.5];
}

/** Distance to the coast (m on the planet, land positive; saturates at ±128·scale). */
export function coastAt(u) {
  const { W, H, sdf, scale } = LAND;
  const [fx, fy] = grid(u, W, H);
  const x0 = Math.floor(fx), y0 = Math.max(0, Math.min(H - 2, Math.floor(fy))), tx = fx - x0, ty = Math.max(0, Math.min(1, fy - y0));
  const xa = ((x0 % W) + W) % W, xb = (xa + 1) % W, r0 = y0 * W, r1 = r0 + W;
  const v = (sdf[r0 + xa] * (1 - tx) + sdf[r0 + xb] * tx) * (1 - ty) + (sdf[r1 + xa] * (1 - tx) + sdf[r1 + xb] * tx) * ty;
  return (v - 128) * scale;
}

/** Climate at u: [mountain height (m), moisture 0…1, warmth 0…1]. */
export function climateAt(u) {
  const { W2, H2, climate } = LAND;
  const [fx, fy] = grid(u, W2, H2);
  const x0 = Math.floor(fx), y0 = Math.max(0, Math.min(H2 - 2, Math.floor(fy))), tx = fx - x0, ty = Math.max(0, Math.min(1, fy - y0));
  const xa = ((x0 % W2) + W2) % W2, xb = (xa + 1) % W2, r0 = y0 * W2, r1 = r0 + W2;
  const out = [0, 0, 0];
  for (let c = 0; c < 3; c++) {
    const v = (climate[(r0 + xa) * 4 + c] * (1 - tx) + climate[(r0 + xb) * 4 + c] * tx) * (1 - ty) + (climate[(r1 + xa) * 4 + c] * (1 - tx) + climate[(r1 + xb) * 4 + c] * tx) * ty;
    out[c] = v / 255;
  }
  out[0] *= 200;
  return out;
}
