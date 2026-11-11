// Music of Alexandria (docs/settlements/alexandria.md §9): the lyre and the aulos of the Greek houses and the Museion, over a drone
// as of the Egyptian temples; a plucked string and a reed stand in; a Dorian-like mode with its second flattened.
export default {
  tonic: 50,
  scale: [0, 1, 4, 5, 7, 8, 11],
  tempo: 66,
  zones: {
    open: { drone: { notes: [-12, -5, 0], level: 0.03, timbre: 'sho' }, harp: { density: 0.3, range: [5, 19], level: 0.14, timbre: 'oud' }, lead: { timbre: 'ney', density: 0.1, range: [7, 17], level: 0.04 }, reverb: 0.35 },
    hall: { drone: { notes: [-24, -12, -5, 0], level: 0.05, timbre: 'voice' }, harp: { density: 0.25, range: [0, 14], level: 0.1, timbre: 'oud' }, lead: { timbre: 'voice', density: 0.2, range: [0, 12], level: 0.05 }, reverb: 0.9 },
  },
};
