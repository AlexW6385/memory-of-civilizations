// Music of the Mexica (docs/settlements/tenochtitlan.md §9): drums, clay flutes, conch and rattles
// (a plucked string, the ney and a drone stand in), pentatonic.
export default {
  tonic: 48,
  scale: [0, 3, 5, 7, 10],
  tempo: 76,
  zones: {
    open: { drone: { notes: [-12, 0], level: 0.035, timbre: 'sho' }, harp: { density: 0.3, range: [0, 15], level: 0.15, timbre: 'koto' }, lead: { timbre: 'ney', density: 0.2, range: [12, 24], level: 0.07 }, reverb: 0.35 },
    hall: { drone: { notes: [-12, -5], level: 0.05, timbre: 'sho' }, lead: { timbre: 'ney', density: 0.25, range: [12, 24], level: 0.07 }, reverb: 0.6 },
  },
};
