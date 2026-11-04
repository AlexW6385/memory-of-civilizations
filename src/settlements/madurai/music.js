// Music of the temple (docs/settlements/madurai.md §9): the nadaswaram's reed over the drone, the
// tavil and the bells; a Carnatic raga, Mayamalavagowla (a reed, a drone and a plucked string stand in).
export default {
  tonic: 50,
  scale: [0, 1, 4, 5, 7, 8, 11],
  tempo: 72,
  zones: {
    open: { drone: { notes: [-12, -5, 0], level: 0.05, timbre: 'sho' }, lead: { timbre: 'reed', density: 0.35, range: [7, 22], level: 0.08 }, reverb: 0.35 },
    hall: { drone: { notes: [-12, 0, 7], level: 0.06, timbre: 'sho' }, harp: { density: 0.25, range: [5, 19], level: 0.15, timbre: 'oud' }, reverb: 0.75 },
  },
};
