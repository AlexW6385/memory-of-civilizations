// Music of Southern Song Lin'an (docs/settlements/song-hangzhou.md §9, §17), by place: out of doors the
// guqin's slow phrases (a plucked string) with a bamboo dizi over the water — the scholar's lake; in the
// temple hall the low drone of the sheng (the reed organ) and sparse bell-like strokes; in a tea house
// the pipa under a storyteller's voice (Lin'an's tea houses hired singers and storytellers); in a wine
// house the pipa quick and bright, the voice in the short rhythms of the song-lyric (ci) singers
// (Wu Zimu lists the singing girls of the wine houses); in a shop barely a thread of pipa; in a house the
// qin alone, with the ney. Pentatonic, in the gong mode. The zones are those of the rooms (the interiors'
// kinds in life.js: 'teahouse', 'winehouse', 'shop', 'house'; 'open' and 'hall' as before). The audio
// engine picks a zone by the room one stands in, so the lake shore and the Imperial Way both sound as
// 'open'; their ambience (water, the market's hubbub, hawkers, oars, the tea house's cups) is the engine's
// own, from the place's profile.
export default {
  tonic: 50,
  scale: [0, 2, 4, 7, 9],
  tempo: 56,
  zones: {
    open: {
      drone: { notes: [-12, 0], level: 0.025, timbre: 'sho' },
      harp: { density: 0.26, range: [0, 19], level: 0.2, timbre: 'koto' },                     // the qin: slow, low, few notes
      lead: { timbre: 'ney', density: 0.14, range: [9, 21], level: 0.06 },                      // the dizi, now and then, high over the water
      reverb: 0.5,
    },
    hall: {
      drone: { notes: [-24, -12, -5, 0], level: 0.06, timbre: 'sho' },
      harp: { density: 0.12, range: [-5, 12], level: 0.12, timbre: 'koto' },
      lead: { timbre: 'voice', density: 0.1, range: [0, 9], level: 0.04 },                      // a monk's chant
      bells: { every: 8, level: 0.05 },                                                          // the temple bell
      reverb: 0.85,
    },
    teahouse: {
      drone: { notes: [-12], level: 0.02, timbre: 'sho' },
      harp: { density: 0.34, range: [2, 17], level: 0.15, timbre: 'pipa' },
      lead: { timbre: 'voice', density: 0.4, range: [7, 17], level: 0.1, rhythm: [2, 1, 1, 2, 1] },
      reverb: 0.35,
    },
    winehouse: {
      drone: { notes: [-12, -5], level: 0.025, timbre: 'sho' },
      harp: { density: 0.6, range: [5, 24], level: 0.17, timbre: 'pipa' },
      lead: { timbre: 'voice', density: 0.5, range: [9, 21], level: 0.11, rhythm: [1, 1, 2, 1, 1, 3] },
      reverb: 0.4,
    },
    shop: {
      harp: { density: 0.14, range: [5, 17], level: 0.08, timbre: 'pipa' },
      reverb: 0.25,
    },
    house: {
      drone: { notes: [-12, 0], level: 0.025, timbre: 'sho' },
      harp: { density: 0.2, range: [0, 14], level: 0.14, timbre: 'koto' },
      lead: { timbre: 'ney', density: 0.14, range: [7, 17], level: 0.05 },
      reverb: 0.4,
    },
  },
};
