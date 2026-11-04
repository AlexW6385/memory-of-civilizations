// Music of Sailendra Java (docs/settlements/borobudur.md §9): bronze gongs and metallophones
// interlocking, a bamboo flute (a plucked string, the ney and a reed organ stand in), slendro-like.
export default {
  tonic: 52,
  scale: [0, 2, 5, 7, 9],
  tempo: 70,
  zones: {
    open: { drone: { notes: [-12, -5], level: 0.03, timbre: 'sho' }, harp: { density: 0.45, range: [0, 19], level: 0.17, timbre: 'kithara' }, lead: { timbre: 'ney', density: 0.14, range: [7, 19], level: 0.06 }, reverb: 0.4 },
    hall: { drone: { notes: [-12, 0], level: 0.05, timbre: 'sho' }, harp: { density: 0.3, range: [0, 14], level: 0.15, timbre: 'kithara' }, reverb: 0.6 },
  },
};
