// Foliage textures drawn procedurally on canvases (no image assets): sprays of leaves, needle
// tufts, scale foliage, grass blades, reeds. Each texture is a card seen face-on with alpha.

import * as THREE from 'three/webgpu';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const cache = new Map();

/** Leaf colour jittered around a base (hex), as an rgb() string. */
function jitter(rand, base, amount = 18) {
  const c = new THREE.Color(base);
  const r = Math.round(c.r * 255 + (rand() - 0.5) * amount), g = Math.round(c.g * 255 + (rand() - 0.5) * amount), b = Math.round(c.b * 255 + (rand() - 0.5) * amount * 0.7);
  return `rgb(${r},${g},${b})`;
}

const DRAW = {
  /** A spray of narrow leaves on twigs (olive: dark above, silver beneath). */
  olive(g, S, rand) {
    for (let t = 0; t < 9; t++) {
      const x0 = S * (0.2 + rand() * 0.6), y0 = S * (0.55 + rand() * 0.4), a = -Math.PI / 2 + (rand() - 0.5) * 1.8, L = S * (0.35 + rand() * 0.25);
      g.strokeStyle = '#5b5040'; g.lineWidth = S * 0.006;
      g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0 + Math.cos(a) * L, y0 + Math.sin(a) * L); g.stroke();
      for (let k = 0; k < 16; k++) {
        const u = rand(), px = x0 + Math.cos(a) * L * u, py = y0 + Math.sin(a) * L * u;
        const la = a + (rand() < 0.5 ? -1 : 1) * (0.5 + rand() * 0.6);
        leaf(g, px, py, la, S * (0.07 + rand() * 0.04), S * 0.011, rand() < 0.35 ? jitter(rand, '#9aa58c') : jitter(rand, '#55634a'));
      }
    }
  },
  /** Broad oval leaves, densely overlapping (holm oak, fig, laurel). */
  broad(g, S, rand, base = '#3f5330') {
    for (let k = 0; k < 420; k++) {
      const r = Math.sqrt(rand()) * S * 0.46, a = rand() * Math.PI * 2;
      leaf(g, S / 2 + Math.cos(a) * r, S / 2 + Math.sin(a) * r, rand() * Math.PI * 2, S * (0.035 + rand() * 0.025), S * (0.018 + rand() * 0.01), jitter(rand, base, 30));
    }
  },
  /** Pine needles in tufts radiating from twig ends. */
  needles(g, S, rand, base = '#4a6236') {
    for (let t = 0; t < 26; t++) {
      const cx = S * (0.15 + rand() * 0.7), cy = S * (0.15 + rand() * 0.7);
      for (let k = 0; k < 40; k++) {
        const a = rand() * Math.PI * 2, L = S * (0.05 + rand() * 0.07);
        g.strokeStyle = jitter(rand, base, 26); g.lineWidth = S * 0.004;
        g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * L, cy + Math.sin(a) * L); g.stroke();
      }
    }
  },
  /** Cypress: dense sprays of tiny scale leaves on fine branchlets. */
  scale(g, S, rand) {
    const spray = (x, y, a, L, d) => {
      if (L < S * 0.02 || d > 5) return;
      const x1 = x + Math.cos(a) * L, y1 = y + Math.sin(a) * L;
      g.strokeStyle = jitter(rand, '#33472c', 20); g.lineWidth = Math.max(1, S * 0.014 - d * S * 0.002);
      g.beginPath(); g.moveTo(x, y); g.lineTo(x1, y1); g.stroke();
      for (let k = 0; k < 3; k++) spray(x + (x1 - x) * (0.3 + k * 0.25), y + (y1 - y) * (0.3 + k * 0.25), a + (k % 2 ? 0.7 : -0.7) + (rand() - 0.5) * 0.4, L * 0.55, d + 1);
    };
    for (let t = 0; t < 14; t++) spray(S * (0.3 + rand() * 0.4), S * (0.75 + rand() * 0.2), -Math.PI / 2 + (rand() - 0.5) * 1.2, S * (0.3 + rand() * 0.15), 0);
  },
  /** Acacia: feathery bipinnate leaves, many tiny leaflets with light between them. */
  acacia(g, S, rand) {
    for (let t = 0; t < 60; t++) {
      const x0 = S * (0.1 + rand() * 0.8), y0 = S * (0.1 + rand() * 0.8), a = rand() * Math.PI * 2, L = S * (0.08 + rand() * 0.06);
      for (let k = 0; k < 10; k++) {
        const px = x0 + Math.cos(a) * L * k / 10, py = y0 + Math.sin(a) * L * k / 10;
        for (const sd of [-1, 1]) leaf(g, px + Math.cos(a + sd * 1.4) * S * 0.008, py + Math.sin(a + sd * 1.4) * S * 0.008, a + sd * 1.4, S * 0.012, S * 0.005, jitter(rand, '#677a3c', 24));
      }
    }
  },
  /** Tamarisk: thin drooping grey-green threads. */
  tamarisk(g, S, rand) {
    for (let k = 0; k < 160; k++) {
      const x = S * rand(), y = S * rand() * 0.6, L = S * (0.15 + rand() * 0.25);
      g.strokeStyle = jitter(rand, '#7d8a6c', 24); g.lineWidth = S * 0.006;
      g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + (rand() - 0.5) * S * 0.1, y + L * 0.6, x + (rand() - 0.5) * S * 0.15, y + L); g.stroke();
    }
  },
  /** Willow: slender hanging whips from the top edge, each set with small narrow leaves, light between them. */
  willow(g, S, rand) {
    for (let k = 0; k < 22; k++) {
      const x = S * (0.04 + rand() * 0.92), L = S * (0.55 + rand() * 0.42), sw = (rand() - 0.5) * S * 0.08;
      g.strokeStyle = jitter(rand, '#7a8a3e', 20); g.lineWidth = S * 0.005;
      g.beginPath(); g.moveTo(x, 0); g.quadraticCurveTo(x + sw * 0.3, L * 0.5, x + sw, L); g.stroke();
      for (let j = 0; j < 20; j++) {
        const u = 0.12 + 0.88 * (j + rand() * 0.6) / 20, t = u, px = x + sw * (2 * t - t * t) * 0.5 + 0, py = L * u;
        const side = j % 2 ? 1 : -1;
        leaf(g, px, py, Math.PI / 2 + side * (0.5 + rand() * 0.4), S * (0.05 + rand() * 0.025), S * 0.009, jitter(rand, rand() < 0.3 ? '#a9c765' : '#86b04e', 22));
      }
    }
  },
  /** Grass: a tuft of blades from a point at the bottom centre, green to straw. */
  grass(g, S, rand, base = '#7f8e4c', dry = '#c4b47c') {
    for (let k = 0; k < 150; k++) {
      const x0 = S * (0.3 + rand() * 0.4), a = -Math.PI / 2 + (rand() - 0.5) * 1.1, L = S * (0.4 + rand() * 0.55);
      const bend = (rand() - 0.5) * S * 0.25;
      g.strokeStyle = rand() < 0.4 ? jitter(rand, dry, 26) : jitter(rand, base, 26);
      g.lineWidth = S * (0.012 + rand() * 0.012);
      g.beginPath(); g.moveTo(x0, S);
      g.quadraticCurveTo(x0 + Math.cos(a) * L * 0.5, S + Math.sin(a) * L * 0.5, x0 + Math.cos(a) * L + bend, S + Math.sin(a) * L); g.stroke();
    }
  },
  /** Meadow grass, tall: green blades with a few seed heads. */
  meadow(g, S, rand) {
    DRAW.grass(g, S, rand, '#6f8c3e', '#a9b25e');
    for (let k = 0; k < 14; k++) {
      const x0 = S * (0.3 + rand() * 0.4), top = S * (0.08 + rand() * 0.3), lean = (rand() - 0.5) * S * 0.2;
      g.strokeStyle = jitter(rand, '#8a9a4c', 20); g.lineWidth = S * 0.007;
      g.beginPath(); g.moveTo(x0, S); g.quadraticCurveTo(x0 + lean * 0.2, S * 0.5, x0 + lean, top); g.stroke();
      g.fillStyle = jitter(rand, '#b2a96a', 20); g.beginPath(); g.ellipse(x0 + lean, top + S * 0.025, S * 0.008, S * 0.04, 0, 0, Math.PI * 2); g.fill();
    }
  },
  /** Steppe and savanna grass: golden blades and heads. */
  steppe(g, S, rand) {
    DRAW.grass(g, S, rand, '#b9a45c', '#d9c581');
    for (let k = 0; k < 16; k++) {
      const x0 = S * (0.3 + rand() * 0.4), top = S * (0.05 + rand() * 0.3), lean = (rand() - 0.5) * S * 0.25;
      g.strokeStyle = jitter(rand, '#c6b270', 18); g.lineWidth = S * 0.007;
      g.beginPath(); g.moveTo(x0, S); g.quadraticCurveTo(x0 + lean * 0.2, S * 0.5, x0 + lean, top); g.stroke();
      g.fillStyle = jitter(rand, '#e0cf92', 16); g.beginPath(); g.ellipse(x0 + lean, top + S * 0.03, S * 0.01, S * 0.05, 0, 0, Math.PI * 2); g.fill();
    }
  },
  /** Ferns: arching fronds with paired leaflets. */
  fern(g, S, rand) {
    for (let f = 0; f < 6; f++) {
      const a = -Math.PI / 2 + (f - 2.5) * 0.4 + (rand() - 0.5) * 0.2, L = S * (0.55 + rand() * 0.35), x0 = S / 2;
      const ex = x0 + Math.cos(a) * L, ey = S + Math.sin(a) * L, cx = x0 + Math.cos(a) * L * 0.5 + (a < -Math.PI / 2 ? -1 : 1) * S * 0.04, cy = S + Math.sin(a) * L * 0.7;
      g.strokeStyle = '#4c6a2c'; g.lineWidth = S * 0.01; g.beginPath(); g.moveTo(x0, S); g.quadraticCurveTo(cx, cy, ex, ey); g.stroke();
      for (let k = 2; k < 22; k++) {
        const u = k / 22, px = (1 - u) * (1 - u) * x0 + 2 * u * (1 - u) * cx + u * u * ex, py = (1 - u) * (1 - u) * S + 2 * u * (1 - u) * cy + u * u * ey, ll = S * 0.11 * Math.sin(Math.PI * Math.min(1, u * 1.1));
        for (const sd of [-1, 1]) leaf(g, px, py, a + sd * 1.15, ll, S * 0.012, jitter(rand, '#4f7a2e', 26));
      }
    }
  },
  /** Wildflowers in the grass: blades with white, yellow, violet and red heads. */
  flowers(g, S, rand) {
    DRAW.grass(g, S, rand, '#6f8c3e', '#9aa650');
    const cols = ['#f1ece0', '#e8c93a', '#9a6cc2', '#d4503e', '#f1ece0', '#e49bb0'];
    for (let k = 0; k < 15; k++) {
      const x0 = S * (0.25 + rand() * 0.5), top = S * (0.08 + rand() * 0.4), lean = (rand() - 0.5) * S * 0.3, col = cols[Math.floor(rand() * cols.length)];
      g.strokeStyle = '#5b7a36'; g.lineWidth = S * 0.008; g.beginPath(); g.moveTo(x0, S); g.quadraticCurveTo(x0 + lean * 0.2, S * 0.55, x0 + lean, top); g.stroke();
      g.fillStyle = col;
      for (let p = 0; p < 5; p++) { const a = p / 5 * Math.PI * 2; g.beginPath(); g.ellipse(x0 + lean + Math.cos(a) * S * 0.022, top + Math.sin(a) * S * 0.022, S * 0.02, S * 0.014, a, 0, Math.PI * 2); g.fill(); }
      g.fillStyle = '#d9b23a'; g.beginPath(); g.arc(x0 + lean, top, S * 0.011, 0, Math.PI * 2); g.fill();
    }
  },
  /** Heather and moss: dense low sprigs, mauve in flower, with cushions of moss. */
  heather(g, S, rand) {
    for (let k = 0; k < 90; k++) {
      const x0 = S * (0.15 + rand() * 0.7), a = -Math.PI / 2 + (rand() - 0.5) * 1.8, L = S * (0.25 + rand() * 0.4);
      g.strokeStyle = jitter(rand, '#5a5a38', 20); g.lineWidth = S * 0.01;
      g.beginPath(); g.moveTo(x0, S); g.lineTo(x0 + Math.cos(a) * L, S + Math.sin(a) * L); g.stroke();
      const n = 6 + Math.floor(rand() * 5);
      for (let p = 0; p < n; p++) { const u = 0.5 + rand() * 0.5; g.fillStyle = rand() < 0.55 ? jitter(rand, '#9a6a9a', 28) : jitter(rand, '#566b3a', 22); g.beginPath(); g.arc(x0 + Math.cos(a) * L * u + (rand() - 0.5) * S * 0.04, S + Math.sin(a) * L * u, S * 0.012, 0, Math.PI * 2); g.fill(); }
    }
    for (let k = 0; k < 60; k++) { g.fillStyle = jitter(rand, '#4e6b34', 24); g.beginPath(); g.arc(S * (0.1 + rand() * 0.8), S * (0.86 + rand() * 0.14), S * (0.02 + rand() * 0.02), 0, Math.PI * 2); g.fill(); }
  },
  /** Rushes: round dark stems with brown flower tufts at the side below the tip. */
  rush(g, S, rand) {
    for (let k = 0; k < 28; k++) {
      const x0 = S * (0.25 + rand() * 0.5), lean = (rand() - 0.5) * S * 0.22, top = S * (0.04 + rand() * 0.3);
      g.strokeStyle = jitter(rand, '#4f6a3a', 22); g.lineWidth = S * 0.011;
      g.beginPath(); g.moveTo(x0, S); g.quadraticCurveTo(x0 + lean * 0.25, S * 0.55, x0 + lean, top); g.stroke();
      if (rand() < 0.4) { g.fillStyle = jitter(rand, '#7a5c38', 18); g.beginPath(); g.ellipse(x0 + lean * 0.9 + S * 0.02, top + S * 0.05, S * 0.018, S * 0.03, 0.3, 0, Math.PI * 2); g.fill(); }
    }
  },
  /** Reeds and papyrus: tall strap leaves and stems with feathery heads. */
  reed(g, S, rand) {
    for (let k = 0; k < 34; k++) {
      const x0 = S * (0.3 + rand() * 0.4), lean = (rand() - 0.5) * S * 0.3, top = S * (0.02 + rand() * 0.25);
      g.strokeStyle = jitter(rand, '#6f7d48', 26); g.lineWidth = S * 0.01;
      g.beginPath(); g.moveTo(x0, S); g.quadraticCurveTo(x0 + lean * 0.3, S * 0.5, x0 + lean, top); g.stroke();
      if (rand() < 0.35) { g.fillStyle = jitter(rand, '#a1906a', 20); g.beginPath(); g.ellipse(x0 + lean, top + S * 0.03, S * 0.02, S * 0.06, 0.2, 0, Math.PI * 2); g.fill(); }
    }
  },
  /** Maple: small palmate leaves, in summer green (the autumn red is the season's: src/engine/flora/phenology.js). */
  maple(g, S, rand) {
    const cols = ['#4f7a2c', '#5a8230', '#456f28', '#6a8a34', '#3f6626', '#5d7d2e'];
    for (let k = 0; k < 360; k++) {
      const r = Math.sqrt(rand()) * S * 0.46, a = rand() * Math.PI * 2, x = S / 2 + Math.cos(a) * r, y = S / 2 + Math.sin(a) * r;
      const c = jitter(rand, cols[Math.floor(Math.pow(rand(), 1.4) * cols.length)], 24), L = S * (0.022 + rand() * 0.014), rot = rand() * Math.PI * 2;
      for (let p = 0; p < 7; p++) leaf(g, x, y, rot + (p - 3) * 0.42, L * (p === 3 ? 1 : 0.75 + 0.1 * Math.abs(p - 3) * -1 + 0.3), S * 0.006, c);
    }
  },
  /** Bamboo: sprays of narrow lance leaves hanging from thin twigs. */
  bamboo(g, S, rand) {
    for (let t = 0; t < 16; t++) {
      const x0 = S * (0.1 + rand() * 0.8), y0 = S * (0.05 + rand() * 0.5);
      for (let k = 0; k < 9; k++) {
        const a = Math.PI / 2 + (rand() - 0.5) * 1.6, px = x0 + (rand() - 0.5) * S * 0.08, py = y0 + rand() * S * 0.15;
        leaf(g, px, py, a, S * (0.12 + rand() * 0.06), S * 0.012, jitter(rand, rand() < 0.3 ? '#8d9a4c' : '#5f7a3a', 24));
      }
    }
  },
  /** Oleander: lance leaves with pink flower clusters. */
  oleander(g, S, rand) {
    DRAW.broad(g, S, rand, '#3c5a33');
    for (let k = 0; k < 40; k++) {
      const r = Math.sqrt(rand()) * S * 0.4, a = rand() * Math.PI * 2;
      g.fillStyle = jitter(rand, '#d77a92', 30);
      for (let p = 0; p < 5; p++) { g.beginPath(); g.arc(S / 2 + Math.cos(a) * r + (rand() - 0.5) * S * 0.03, S / 2 + Math.sin(a) * r + (rand() - 0.5) * S * 0.03, S * 0.008, 0, Math.PI * 2); g.fill(); }
    }
  },
};

function leaf(g, x, y, a, len, wid, color) {
  g.save(); g.translate(x, y); g.rotate(a);
  g.fillStyle = color;
  g.beginPath(); g.ellipse(len / 2, 0, len / 2, wid, 0, 0, Math.PI * 2); g.fill();
  g.restore();
}

/** The texture for a foliage kind (cached). */
export function foliageTexture(kind) {
  if (cache.has(kind)) return cache.get(kind);
  const S = 512, cv = document.createElement('canvas');
  cv.width = cv.height = S;
  const g = cv.getContext('2d');
  g.lineCap = 'round';
  DRAW[kind](g, S, rng(kind.length * 977 + 13));
  // dilate colour into the transparent texels so mipmaps do not darken the leaf edges
  const img = g.getImageData(0, 0, S, S), d = img.data;
  let sum = [0, 0, 0], n = 0;
  for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 128) { sum[0] += d[i]; sum[1] += d[i + 1]; sum[2] += d[i + 2]; n++; }
  const avg = sum.map((v) => v / Math.max(1, n));
  const lin = (v) => Math.pow(v / 255, 2.2);
  const avgLum = 0.3 * lin(avg[0]) + 0.59 * lin(avg[1]) + 0.11 * lin(avg[2]);
  for (let i = 0; i < d.length; i += 4) if (d[i + 3] < 8) { d[i] = avg[0]; d[i + 1] = avg[1]; d[i + 2] = avg[2]; d[i + 3] = 3; }   // alpha 3, not 0: canvases drop the colour of fully transparent texels
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  t.generateMipmaps = true;
  t.userData.lum = avgLum;
  cache.set(kind, t);
  return t;
}
