// Music of Versailles (docs/settlements/versailles.md §9): Lully's strings and the grands motets, the harpsichord and the
// viol, the oboes of the court; voices, a plucked string and a reed stand in.
export default {
  tonic: 50,
  scale: [0, 2, 4, 5, 7, 9, 11],
  tempo: 64,
  zones: {
    open: { drone: { notes: [-12, -5, 0], level: 0.03, timbre: 'sho' }, harp: { density: 0.3, range: [5, 19], level: 0.15, timbre: 'oud' }, reverb: 0.35 },
    chamber: { drone: { notes: [-12, -5], level: 0.02, timbre: 'sho' }, harp: { density: 0.35, range: [0, 14], level: 0.12, timbre: 'oud' }, reverb: 0.3 },       // a shop or a house of the town: a lute, the street muffled
    hall: { drone: { notes: [-24, -12, -5, 0], level: 0.06, timbre: 'voice' }, lead: { timbre: 'voice', density: 0.25, range: [0, 12], level: 0.06 }, reverb: 0.95 },
  },
};
