// Music of Manueline Lisbon (docs/settlements/manueline-lisbon.md §9): the plainchant of the Hieronymites under the vaults, a
// vihuela and a flute in the town; a Phrygian-leaning mode over a drone.
export default {
  tonic: 52,
  scale: [0, 1, 3, 5, 7, 8, 10],
  tempo: 60,
  zones: {
    open: { drone: { notes: [-12, -5, 0], level: 0.025, timbre: 'sho' }, harp: { density: 0.3, range: [5, 19], level: 0.13, timbre: 'oud' }, lead: { timbre: 'ney', density: 0.12, range: [7, 17], level: 0.04 }, reverb: 0.35 },
    inner: { drone: { notes: [-12, -5, 0], level: 0.04, timbre: 'voice' }, harp: { density: 0.2, range: [0, 12], level: 0.08, timbre: 'oud' }, reverb: 0.7 },
    hall: { drone: { notes: [-24, -12, -5, 0], level: 0.06, timbre: 'voice' }, lead: { timbre: 'voice', density: 0.3, range: [0, 12], level: 0.06 }, reverb: 1.0 },
  },
};
