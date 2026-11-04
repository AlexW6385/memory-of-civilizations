// Music of Edo Japan (docs/settlements/edo-himeji.md §9): the koto in the in scale, a shakuhachi
// above, a shō's chord beneath (a plucked string, the ney and a reed organ stand in).
export default {
  tonic: 50,
  scale: [0, 1, 5, 7, 8],
  tempo: 56,
  zones: {
    open: { drone: { notes: [-12, -5, 0], level: 0.035, timbre: 'sho' }, harp: { density: 0.28, range: [5, 22], level: 0.18, timbre: 'koto' }, lead: { timbre: 'ney', density: 0.16, range: [7, 19], level: 0.07 }, reverb: 0.4 },
    hall: { drone: { notes: [-12, 0, 7], level: 0.05, timbre: 'sho' }, harp: { density: 0.2, range: [5, 19], level: 0.15, timbre: 'koto' }, reverb: 0.65 },
  },
};
