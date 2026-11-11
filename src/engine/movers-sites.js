// The settlements with a moving life (src/engine/movers.js): their data modules, by settlement id.
// A settlement gets boats and walkers by having src/settlements/<id>/movers.js (its ways, who walks,
// what floats; see the Suzhou one) and a line here.
export const MOVER_SITES = {
  'ming-suzhou': () => import('../settlements/ming-suzhou/movers.js'),
  'tang-wutai': () => import('../settlements/tang-wutai/movers.js'),
  'song-hangzhou': () => import('../settlements/song-hangzhou/movers.js'),
  'qing-beijing': () => import('../settlements/qing-beijing/movers.js'),
  'florence': () => import('../settlements/florence/movers.js'),
  'granada': () => import('../settlements/granada/movers.js'),
  'venice': () => import('../settlements/venice/movers.js'),
  'joseon-seoul': () => import('../settlements/joseon-seoul/movers.js'),
  'paris': () => import('../settlements/paris/movers.js'),
  'lhasa': () => import('../settlements/lhasa/movers.js'),
  'khajuraho': () => import('../settlements/khajuraho/movers.js'),
  'song-kaifeng': () => import('../settlements/song-kaifeng/movers.js'),
};
