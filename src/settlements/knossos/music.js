// Music of Minoan Crete (docs/settlements/knossos.md §9): the lyre, the double pipe (aulos) and the
// sistrum shown on the Hagia Triada sarcophagus; a lyre, a double pipe and a drone stand in.
export default {
  tonic: 52,
  scale: [0, 2, 3, 5, 7, 9, 10],
  tempo: 66,
  zones: {
    open: { drone: { notes: [-12, -5, 0], level: 0.04, timbre: 'sho' }, harp: { density: 0.3, range: [5, 22], level: 0.16, timbre: 'kithara' }, reverb: 0.3 },
    hall: { drone: { notes: [-12, 0], level: 0.05, timbre: 'sho' }, lead: { timbre: 'aulos', density: 0.25, range: [7, 19], level: 0.07 }, reverb: 0.7 },
    inner: { drone: { notes: [-12, -5], level: 0.04, timbre: 'sho' }, lead: { timbre: 'aulos', density: 0.15, range: [7, 17], level: 0.05 }, reverb: 0.8 },
  },
};
