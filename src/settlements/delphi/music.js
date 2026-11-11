// Music of Delphi (docs/settlements/delphi.md §7): the Dorian species, kithara and aulos for the processions and the Pythian hymns;
// the hall of the temple slow and low, the adyton nearly silent.
export default {
  tonic: 52,
  scale: [0, 1, 3, 5, 7, 8, 10],
  tempo: 56,
  zones: {
    open: {
      drone: { notes: [0, 7], level: 0.08, timbre: 'reed' },
      lead: { timbre: 'aulos', density: 0.3, range: [12, 26], level: 0.15 },
      harp: { density: 0.4, range: [12, 28], level: 0.28, timbre: 'kithara' },
      reverb: 0.4,
    },
    hall: {
      drone: { notes: [-12, -5, 0], level: 0.07, timbre: 'voice' },
      harp: { density: 0.22, range: [7, 24], level: 0.28, timbre: 'kithara' },
      reverb: 0.8,
    },
    inner: {
      drone: { notes: [-12, 0], level: 0.05, timbre: 'voice' },
      harp: { density: 0.1, range: [7, 19], level: 0.18, timbre: 'kithara' },
      reverb: 0.6,
    },
  },
};
