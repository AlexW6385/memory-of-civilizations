// Music of Sumer (docs/settlements/babylon.md §9): the lyre and the harp, a reed pipe, frame drums (a
// plucked string, the ney and a reed organ stand in).
export default {
  tonic: 50,
  scale: [0, 2, 3, 5, 7, 8, 10],
  tempo: 60,
  zones: {
    open: { drone: { notes: [-12, -5], level: 0.035, timbre: 'sho' }, harp: { density: 0.32, range: [0, 19], level: 0.18, timbre: 'kithara' }, lead: { timbre: 'ney', density: 0.14, range: [7, 17], level: 0.06 }, reverb: 0.35 },
    hall: { drone: { notes: [-12, 0], level: 0.05, timbre: 'sho' }, harp: { density: 0.22, range: [0, 15], level: 0.15, timbre: 'oud' }, reverb: 0.6 },
  },
};
