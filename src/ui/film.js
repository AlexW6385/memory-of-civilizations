// Films: a short scripted flight through one settlement, recorded frame by frame into an MP4.
//
//   index.html?film=ming-suzhou&quality=cinema&capture&weather=clear
//
// With ?capture every drawn frame advances the world by exactly 1/30 s, so however slowly a machine
// draws, the recording plays back smooth (an M2 records the 900 frames in about a minute). Each frame is copied into a 1920×1080 canvas (with the
// fades and the title drawn over it), encoded as H.264 with WebCodecs and written into an MP4
// (src/vendor/mp4-muxer), which is downloaded at the end. The sound is not recorded here: the
// film's music is composed offline (tools/film/suzhou-score.py) and mixed with a real-time recording
// of the place's own sound along the same route.
// Options: &hour=16.5 (local hour, held), &size=1920x1080, &mbps=24.
//
// A film is a list of shots; a shot is a duration and two or more camera keys in the settlement's
// own frame (x east, y up, z south, metres; yaw 0 looks north, π/2 west, −π/2 east; pitch up +).
// The camera runs through the keys on a smooth curve at an eased pace; shots are joined by cuts.
import { Muxer, ArrayBufferTarget } from '../vendor/mp4-muxer/mp4-muxer.mjs';

const FPS = 30;
const P = (x, y, z, yaw, pitch) => ({ p: [x, y, z], yaw, pitch });

export const FILMS = {
  'ming-suzhou': {
    title: ['Suzhou, c. 1530', '苏州 · 明 · 约 1530 年'],
    sub: 'Memory of Civilizations · 文明的记忆',
    hour: 17.1,                                    // late afternoon: the sun about 11° up, warm and raking
    shots: [
      // over the canal quarter's roofs from the south-east, the garden and the Bao'en pagoda ahead
      { t: 6, keys: [P(-150, 120, 250, -0.45, -0.36), P(-105, 95, 200, -0.36, -0.38), P(-60, 70, 150, -0.25, -0.40)] },
      // low along the south canal, east toward the bridge on the garden's axis
      { t: 4.5, keys: [P(-56, 3.0, 70.5, -1.52, 0.0), P(-40, 2.9, 70.6, -1.56, 0.01), P(-24, 2.8, 70.7, -1.60, 0.02)] },
      // up from the residence's first court, over the hall roofs: the garden and the pagoda beyond
      { t: 4.5, keys: [P(0, 1.7, 55, 0, 0.06), P(0, 14, 54.5, 0.04, -0.14), P(0, 26, 50, 0.08, -0.30)] },
      // across the water to the Fragrant Isle, the stone boat, broadside, the tower and the pagoda beyond
      { t: 4.5, keys: [P(-35, 2.4, -28, 0.9, -0.04), P(-39.5, 2.3, -26.5, 0.67, -0.04), P(-44, 2.2, -25, 0.45, -0.04)] },
      // just over the lotus, toward the Hall of Distant Fragrance
      { t: 4.5, keys: [P(2.5, 1.7, -43, 3.11, 0.04), P(1.8, 1.6, -38, 3.13, 0.045), P(1, 1.5, -33, 3.14, 0.05)] },
      // rising back over the islands: the garden whole, the town round it
      { t: 6, keys: [P(0, 9, -38, 3.1416, -0.26), P(0, 40, -90, 3.1416, -0.42), P(0, 72, -145, 3.1416, -0.5)] },
    ],
  },
};

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const ease = (t) => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
// Catmull–Rom through the keys (ends clamped), u in [0, 1] over the whole shot
function along(keys, u) {
  const n = keys.length - 1, s = clamp(u, 0, 1) * n, i = Math.min(n - 1, Math.floor(s)), f = s - i;
  const k = (j) => keys[clamp(j, 0, n)];
  const cr = (a, b, c, d) => 0.5 * (2 * b + (c - a) * f + (2 * a - 5 * b + 4 * c - d) * f * f + (3 * b - a - 3 * c + d) * f * f * f);
  const v = (get) => cr(get(k(i - 1)), get(k(i)), get(k(i + 1)), get(k(i + 2)));
  return { p: [0, 1, 2].map((a) => v((q) => q.p[a])), yaw: v((q) => q.yaw), pitch: v((q) => q.pitch) };
}

/** The film's camera at time t (s): { shot index, pose }. */
export function poseAt(film, t) {
  let t0 = 0;
  for (let i = 0; i < film.shots.length; i++) {
    const s = film.shots[i];
    if (t < t0 + s.t || i === film.shots.length - 1) {
      // a gentle ease at the film's two ends, an even glide through the cuts
      const u = clamp((t - t0) / s.t, 0, 1);
      const w = i === 0 ? 0.5 * ease(u) + 0.5 * u : i === film.shots.length - 1 ? 0.6 * ease(u) + 0.4 * u : u;
      return { i, pose: along(s.keys, w) };
    }
    t0 += s.t;
  }
}

const length = (film) => film.shots.reduce((a, s) => a + s.t, 0);

/**
 * Plays and records a film. `palace` is main.js's window.palace; `frames(n)` resolves after n drawn
 * frames. Returns once the MP4 has been downloaded.
 */
export async function runFilm(id, palace, frames, params) {
  const film = FILMS[id];
  if (!film) throw new Error(`no film for ${id} (films: ${Object.keys(FILMS).join(', ')})`);
  const [W, H] = (params.get('size') || '1920x1080').split('x').map(Number);
  const bitrate = (+params.get('mbps') || 24) * 1e6;
  const hour = params.has('hour') ? +params.get('hour') : film.hour;
  const status = filmStatus();
  document.body.classList.add('filming');
  const R = palace.renderer, cam = R.camera;

  const put = (pose) => {
    cam.position.set(...pose.p);
    cam.rotation.set(pose.pitch, pose.yaw, 0, 'YXZ');
  };
  const hold = async () => {
    // the hour is local: set it, let two frames pass (the frame loop takes the longitude), set it again
    for (let k = 0; k < 2; k++) { if (Number.isFinite(hour)) { palace.climate.hour = hour; palace.climate.setTime('held'); } await frames(2); }
  };

  // every shot's start, middle and end visited first, so the ground, the plants and the shaders
  // are all there before the first recorded frame
  const total = length(film);
  status(`preparing ${id}…`);
  const first = film.shots[0].keys[0];
  await palace.camera(id, ...first.p, first.yaw, first.pitch);
  await hold();
  let t0 = 0;
  for (const s of film.shots) {
    const k = s.keys[0];
    await palace.camera(id, ...k.p, k.yaw, k.pitch);          // (waits for the ground there)
    for (const u of [0, 0.5, 1]) { put(poseAt(film, t0 + u * s.t * 0.999).pose); await frames(30); }
    t0 += s.t;
  }
  await palace.camera(id, ...first.p, first.yaw, first.pitch);
  await hold();
  put(poseAt(film, 0).pose); palace.settle();
  await frames(90);

  // the recorder
  // H.264 where the browser encodes it (Chrome), else VP9 (Chromium without the H.264 encoder)
  const avc = { codec: W * H > 1920 * 1088 ? 'avc1.640034' : 'avc1.640028', width: W, height: H, bitrate, framerate: FPS, latencyMode: 'quality', avc: { format: 'avc' } };
  const vp9 = { codec: 'vp09.00.41.08', width: W, height: H, bitrate, framerate: FPS, latencyMode: 'quality' };
  const useAvc = (await VideoEncoder.isConfigSupported(avc).catch(() => ({}))).supported;
  const muxer = new Muxer({ target: new ArrayBufferTarget(), video: { codec: useAvc ? 'avc' : 'vp9', width: W, height: H, frameRate: FPS }, fastStart: 'in-memory', firstTimestampBehavior: 'offset' });
  let failed = null;
  const enc = new VideoEncoder({ output: (chunk, meta) => { try { muxer.addVideoChunk(chunk, meta); } catch (e) { failed = e; } }, error: (e) => { failed = e; } });
  enc.configure(useAvc ? avc : vp9);
  const out = new OffscreenCanvas(W, H), g = out.getContext('2d');
  const src = R.renderer.domElement;

  // the frames are driven here, one at a time, rather than by the page's loop: the encoder is
  // waited for whenever more than a few frames queue up (left to the loop, a fast machine drew
  // all 900 ahead of the encoder and its flush never came back)
  const N = Math.round(total * FPS);
  const loop = R.renderer._animation._animationLoop;
  R.renderer.setAnimationLoop(null);
  const started = performance.now();
  let shot = 0;
  try {
    await new Promise((r) => requestAnimationFrame(r));
    for (let n = 0; n < N; n++) {
      const next = poseAt(film, n / FPS);
      if (next.i !== shot) { shot = next.i; palace.settle(); }       // a cut: the eye's adaptation jumps with it
      put(next.pose);
      loop(performance.now());
      cover(g, src, W, H);                                            // (read in the task that drew it)
      overlay(g, film, n / FPS, total, W, H);
      const vf = new VideoFrame(out, { timestamp: Math.round(n * 1e6 / FPS), duration: Math.round(1e6 / FPS) });
      enc.encode(vf, { keyFrame: n % (FPS * 2) === 0 });
      vf.close();
      while (enc.encodeQueueSize > 3) await new Promise((r) => setTimeout(r, 2));
      if (failed) throw failed;
      // the canvas must be presented before the next frame is drawn: a WebGPU canvas drawn twice in
      // one task, or read after the frame it was drawn in, gives back the picture before (the first
      // films repeated a frame every ten or so, which read as a stutter)
      await new Promise((r) => requestAnimationFrame(r));
      if (n % 15 === 0) { const el = (performance.now() - started) / 1000; status(`recording ${n + 1}/${N} · ${(el / (n + 1)).toFixed(2)} s a frame`); }
    }
  } finally { R.renderer.setAnimationLoop(loop); }
  await enc.flush();
  if (failed) throw failed;
  muxer.finalize();
  const blob = new Blob([muxer.target.buffer], { type: 'video/mp4' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = `${id}-film.mp4`;
  document.body.appendChild(a); a.click();
  status(`done: ${a.download} (${(blob.size / 1e6).toFixed(1)} MB, ${N} frames)`);
  window.FILM_DONE = { frames: N, bytes: blob.size };
  return blob;
}

// the drawn picture scaled to cover the film's frame (centred, cropped to its aspect)
function cover(g, src, W, H) {
  const sw = src.width, sh = src.height, s = Math.max(W / sw, H / sh);
  const cw = W / s, ch = H / s;
  g.drawImage(src, (sw - cw) / 2, (sh - ch) / 2, cw, ch, 0, 0, W, H);
}

// fade in from black, the title over the last shot, fade out to black
function overlay(g, film, t, total, W, H) {
  const fadeIn = 1 - ease(t / 1.2), fadeOut = ease((t - (total - 1.2)) / 1.2);
  const tt = total - 4.0, a = ease((t - tt) / 1.0) * (1 - fadeOut);
  if (a > 0) {
    g.save();
    const grad = g.createLinearGradient(0, H * 0.55, 0, H);
    grad.addColorStop(0, 'rgba(0,0,0,0)'); grad.addColorStop(1, `rgba(0,0,0,${0.45 * a})`);
    g.fillStyle = grad; g.fillRect(0, H * 0.55, W, H * 0.45);
    g.globalAlpha = a; g.fillStyle = '#f4efe4'; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    g.shadowColor = 'rgba(0,0,0,0.5)'; g.shadowBlur = H * 0.01;
    g.font = `400 ${Math.round(H * 0.058)}px "Cormorant Garamond", "Songti SC", "Noto Serif SC", Georgia, serif`;
    g.fillText(film.title[0], W / 2, H * 0.80);
    g.font = `400 ${Math.round(H * 0.032)}px "Songti SC", "Noto Serif SC", "STSong", serif`;
    g.fillText(film.title[1], W / 2, H * 0.855);
    g.globalAlpha = a * 0.75; g.font = `400 ${Math.round(H * 0.019)}px "Helvetica Neue", "PingFang SC", sans-serif`;
    g.fillText(film.sub, W / 2, H * 0.91);
    g.restore();
  }
  const k = Math.max(fadeIn, fadeOut);
  if (k > 0) { g.fillStyle = `rgba(0,0,0,${k})`; g.fillRect(0, 0, W, H); }
}

function filmStatus() {
  const el = document.createElement('div');
  el.id = 'film-status';
  el.style.cssText = 'position:fixed;left:12px;bottom:12px;z-index:99;font:13px/1.4 system-ui,sans-serif;color:#fff;background:rgba(0,0,0,.6);padding:6px 10px;border-radius:6px;pointer-events:none';
  document.body.appendChild(el);
  return (s) => { el.textContent = s; console.info('[film]', s); };
}
