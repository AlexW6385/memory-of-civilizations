// Measuring the frame (DESIGN §8): what each part of the picture costs, on the machine it runs on.
//
// `?perf` in the address shows a small panel (frame time, draw calls, triangles) with switches that
// turn one part of the picture off at a time — shadows, ambient occlusion, bloom, the plants, the
// open country's plants, the ground, the other settlements, the far views, the small things of the
// streets, the fine detail of buildings. Turning one off and reading the frame time again says what
// it costs. The same switches are `window.palace.perf`, for the console.
//
// Nothing here changes the picture unless a switch is turned.

import { HITCH } from './hitch.js';

const SWITCHES = ['shadows', 'ao', 'bloom', 'flora', 'openFlora', 'terrain', 'others', 'impostors', 'life', 'detail', 'castDetail'];

export class Perf {
  constructor(world, R) {
    this.world = world; this.R = R;
    this.off = new Set();
    this.frames = [];                    // recent frame intervals (ms)
    this.last = 0;
    R.renderer.info.autoReset = true;
  }

  /** Called once per drawn frame, after rendering. */
  tick(now = performance.now(), js = 0) {
    if (this.last) {
      const dt = now - this.last;
      this.frames.push(dt); if (this.frames.length > 240) this.frames.shift();
      if (this.record) { const i = this.R.renderer.info.render; this.record({ dt, js, calls: i.drawCalls, tris: i.triangles }); }
    }
    this.last = now;
    if (this.off.size) this.apply();
    if (this.panel && now - (this.painted || 0) > 500) { this.painted = now; this.paint(); }
  }

  /** The current counts and the mean / worst frame of the last n frames. */
  stats(n = 120) {
    const f = this.frames.slice(-n), info = this.R.renderer.info.render;
    const mean = f.reduce((a, b) => a + b, 0) / Math.max(1, f.length);
    const sorted = [...f].sort((a, b) => a - b);
    return {
      ms: +mean.toFixed(2), fps: +(1000 / Math.max(mean, 0.001)).toFixed(1),
      p95: +(sorted[Math.floor(sorted.length * 0.95)] || 0).toFixed(1), worst: +(sorted[sorted.length - 1] || 0).toFixed(1),
      calls: info.drawCalls, triangles: Math.round(info.triangles),
    };
  }

  get switches() { return SWITCHES; }

  /** Clear the frame history (after a switch, so the next stats read the new state only). */
  clear() { this.frames.length = 0; this.last = 0; }

  set(name, on) {
    if (!SWITCHES.includes(name)) throw new Error('unknown switch ' + name);
    if (on) this.off.delete(name); else this.off.add(name);
    const R = this.R;
    if (name === 'ao' || name === 'bloom') {
      R.Q = { ...R.Q, [name]: on };
      R.buildPipeline();
    }
    if (name === 'shadows') R.sun.castShadow = on;
    this.apply(true);
    this.clear();
  }

  /** Hold the switched-off parts hidden (the world shows and hides things as one moves). */
  apply(restore = false) {
    const w = this.world, off = this.off;
    if (w.flora?.group) w.flora.group.visible = !off.has('flora');
    if (w.openFlora?.group) w.openFlora.group.visible = !off.has('openFlora');
    if (w.terrain) for (const t of w.terrain.tiles.values()) { if (t.mesh) t.mesh.visible = !off.has('terrain'); if (t.sea) t.sea.visible = !off.has('terrain'); }
    w.lifeHidden = off.has('life');
    for (const s of w.settlements || []) {
      if (s.life) s.life.group.visible = !off.has('life') && s.life.ready !== false;
      if (s !== w.anchor?.site && s.state !== 'idle') s.group.visible = !off.has('others');
      else s.group.visible = true;
      if (s.impostor && off.has('impostors')) s.impostor.visible = false;
      for (const rec of s.parts) {
        if (rec.plan.style === 'life' && off.has('life')) rec.group.visible = false;
        for (const o of rec.group.children) {
          if (!o.userData.detail) continue;
          if (off.has('detail')) o.visible = false;
          else if (restore) o.visible = true;
          if (off.has('castDetail')) o.castShadow = false;
        }
      }
    }
  }

  /** The panel (`?perf`): counts and switches, bottom left. */
  show() {
    const el = this.panel = document.createElement('div');
    el.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:99;background:rgba(0,0,0,.72);color:#eee;font:12px/1.4 ui-monospace,monospace;padding:8px 10px;border-radius:6px;user-select:none';
    this.readout = document.createElement('div');
    el.appendChild(this.readout);
    // the last hitches (src/engine/hitch.js): frames over 50 ms and what they spent it on
    this.hitchOut = document.createElement('div');
    this.hitchOut.style.cssText = 'margin-top:4px;color:#fc9;white-space:pre-wrap;font-size:11px;max-height:9em;overflow:auto';
    el.appendChild(this.hitchOut);
    for (const name of SWITCHES) {
      const l = document.createElement('label');
      l.style.cssText = 'display:inline-block;margin:4px 8px 0 0;cursor:pointer';
      const c = document.createElement('input');
      c.type = 'checkbox'; c.checked = true;
      c.onchange = () => this.set(name, c.checked);
      l.append(c, ' ' + name);
      el.appendChild(l);
    }
    el.style.maxWidth = '520px';
    document.body.appendChild(el);
  }

  paint() {
    const s = this.stats(60);
    const h = HITCH.lines(5);
    this.hitchOut.textContent = h.length ? `hitches (palace.hitches):\n${h.join('\n')}` : '';
    const dpr = this.R.renderer.getPixelRatio(), D = this.dynres;
    this.readout.textContent = `${s.fps} fps · ${s.ms} ms (p95 ${s.p95}, worst ${s.worst}) · ${s.calls} draws · ${(s.triangles / 1e6).toFixed(2)} M tris · ${this.R.quality} @${dpr.toFixed(2)}${D?.pin ? ' (pinned)' : D?.active ? ` (auto, gpu ${D.gpu.toFixed(1)} ms)` : ''}`;
  }
}

export { SWITCHES };
