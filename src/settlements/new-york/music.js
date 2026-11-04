// Music of New York, 1931 (docs/settlements/new-york.md §9): jazz from Harlem and the clubs,
// Gershwin, the big bands on the radio, the street's horns and the El; a plucked bass, a reed and a
// drone stand in.
export default {
  tonic: 46,
  scale: [0, 2, 3, 5, 7, 9, 10],
  tempo: 108,
  zones: {
    open: { drone: { notes: [-12, -5, 0], level: 0.03, timbre: 'sho' }, lead: { timbre: 'reed', density: 0.35, range: [3, 17], level: 0.06 }, harp: { density: 0.45, range: [-12, 5], level: 0.13, timbre: 'oud' }, reverb: 0.4 },
    hall: { drone: { notes: [-24, -12, -5, 0], level: 0.05, timbre: 'voice' }, lead: { timbre: 'reed', density: 0.3, range: [0, 12], level: 0.06 }, reverb: 0.8 },
  },
};
