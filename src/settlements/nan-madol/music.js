// Music of Nan Madol (docs/settlements/nan-madol.md §9): a slow chant of low voices with the long note of a conch trumpet
// (a drone, a voice and the ney stand in), a few steady beats of stone on stone; pentatonic.
export default {
  tonic: 47,
  scale: [0, 2, 5, 7, 9],
  tempo: 58,
  zones: {
    open: { drone: { notes: [-12, -5], level: 0.04, timbre: 'voice' }, lead: { timbre: 'ney', density: 0.1, range: [5, 14], level: 0.05 }, reverb: 0.4 },
    hall: { drone: { notes: [-12, -5, 0], level: 0.06, timbre: 'voice' }, lead: { timbre: 'voice', density: 0.16, range: [0, 9], level: 0.06 }, reverb: 0.85 },
  },
};
