// Music of Baroque Rome (docs/settlements/baroque-rome.md §9): the Sistine choir's polyphony
// (Palestrina, Allegri), the organ, Corelli's strings in the palaces; voices, a drone and a plucked
// string stand in.
export default {
  tonic: 50,
  scale: [0, 2, 3, 5, 7, 8, 10],
  tempo: 66,
  zones: {
    open: { drone: { notes: [-12, -5, 0], level: 0.035, timbre: 'sho' }, harp: { density: 0.28, range: [3, 19], level: 0.14, timbre: 'oud' }, lead: { timbre: 'voice', density: 0.15, range: [0, 12], level: 0.04 }, reverb: 0.45 },
    hall: { drone: { notes: [-24, -12, -5, 0], level: 0.07, timbre: 'voice' }, lead: { timbre: 'voice', density: 0.25, range: [0, 12], level: 0.06 }, reverb: 0.98 },
  },
};
