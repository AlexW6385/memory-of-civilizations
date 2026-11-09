// The settlement card of the globe map (DESIGN §4.1): name and era, the plain text of the settlement
// (src/planet/cards.js) in the site's language, and a Go button. A panel over the map only, never in the
// world. Desktop: beside the clicked marker, off to the side that has room; narrow screens: a bottom sheet.

import { t, tr, getLang } from './i18n.js';
import { CARDS } from '../planet/cards.js';

const SEP = { en: ' — ', zh: ' —— ' };

export class SettlementCard {
  /** host: the map panel (positioned); canvas: the globe canvas; onGo(S); onClose(). */
  constructor(host, canvas, onGo, onClose) {
    this.host = host; this.canvas = canvas; this.onGo = onGo; this.onClose = onClose;
    this.S = null;
    const el = this.el = document.createElement('aside');
    el.className = 'panel site-card'; el.hidden = true;
    el.setAttribute('role', 'dialog');
    el.innerHTML = `<button class="close" type="button">×</button><h3 class="sc-name"></h3><div class="sc-era"></div><div class="sc-body"></div><div class="sc-foot"><button class="primary sc-go" type="button"></button></div>`;
    host.appendChild(el);
    this.q = (s) => el.querySelector(s);
    this.q('.close').onclick = () => this.close();
    this.q('.sc-go').onclick = () => { const S = this.S; this.close(); this.onGo(S); };
    // Esc closes the card first (before the map panel's own Esc), the map's other keys are untouched
    addEventListener('keydown', (e) => {
      if (e.code === 'Escape' && this.S) { e.stopPropagation(); this.close(); }
    }, true);
  }

  get isOpen() { return !!this.S; }

  /** Fill the texts in the current language. */
  fill() {
    const S = this.S; if (!S) return;
    const lang = getLang(), id = S.site.id;
    this.q('.close').setAttribute('aria-label', t('card-close'));
    this.q('.sc-name').textContent = tr(S.site.name);
    this.q('.sc-era').textContent = S.site.era || '';
    this.q('.sc-go').textContent = t('go');
    const body = this.q('.sc-body'), paras = (CARDS[id] && (CARDS[id][lang] || CARDS[id].en)) || [];
    body.innerHTML = ''; body.hidden = !paras.length;
    paras.forEach((text, i) => {
      const p = document.createElement('p');
      const sep = SEP[lang] || SEP.en, k = i ? text.indexOf(sep) : -1;
      if (k > 0) {
        const b = document.createElement('strong'); b.textContent = text.slice(0, k);
        p.append(b, text.slice(k));
      } else p.textContent = text;
      body.appendChild(p);
    });
    body.scrollTop = 0;
  }

  /** Open (or replace) the card for settlement S; mark = its entry in the globe's marks, for placing. */
  show(S, mark) {
    this.S = S; this.fill();
    this.el.hidden = false;
    this.place(mark);
  }

  close() {
    if (!this.S) return;
    this.S = null; this.el.hidden = true;
    this.onClose?.();
  }

  /** Place the card beside the marker (and its name) without covering them; bottom sheet on phones. */
  place(mark) {
    const el = this.el;
    if (!this.S) return;
    if (matchMedia('(max-width: 700px)').matches) { el.style.left = el.style.top = ''; el.style.maxHeight = ''; return; }
    if (!mark) { this.close(); return; }
    const hr = this.host.getBoundingClientRect(), cr = this.canvas.getBoundingClientRect(), k = cr.width / this.canvas.width;
    const ox = cr.left - hr.left, oy = cr.top - hr.top, gap = 14;
    // the marker's box (dot and name) in host pixels
    const x0 = ox + (mark.left ?? mark.p[0]) * k - 8, x1 = ox + (mark.right ?? mark.p[0]) * k + 8;
    const my = oy + mark.p[1] * k;
    el.style.maxHeight = `${Math.max(180, cr.height - 16)}px`;
    const w = el.offsetWidth, h = el.offsetHeight;
    const L = ox + 8, R = ox + cr.width - 8, T = oy + 8, B = oy + cr.height - 8;
    const clampY = (y) => Math.max(T, Math.min(B - h, y));
    const opts = [
      { x: x1 + gap, y: clampY(my - h / 2), ok: x1 + gap + w <= R },
      { x: x0 - gap - w, y: clampY(my - h / 2), ok: x0 - gap - w >= L },
      { x: Math.max(L, Math.min(R - w, (x0 + x1) / 2 - w / 2)), y: my + 16 + gap, ok: my + 16 + gap + h <= B },
      { x: Math.max(L, Math.min(R - w, (x0 + x1) / 2 - w / 2)), y: my - 16 - gap - h, ok: my - 16 - gap - h >= T },
    ];
    const o = opts.find((q) => q.ok) || opts[x1 + gap + w - R < L - (x0 - gap - w) ? 0 : 1];
    el.style.left = `${Math.max(L, Math.min(R - w, o.x))}px`; el.style.top = `${o.y}px`;
  }
}
