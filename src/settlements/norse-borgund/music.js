// Music of Norse Norway (docs/settlements/norse-borgund.md §9): plainchant in the church, the
// lur's calls and the herding songs (kulokk) in the summer pastures, the bone flute and the lyre;
// a voice, a reed and a plucked string stand in.
export default {
  tonic: 50,
  scale: [0, 2, 3, 5, 7, 9, 10],
  tempo: 60,
  zones: {
    open: { drone: { notes: [-12, 0], level: 0.03, timbre: 'sho' }, lead: { timbre: 'reed', density: 0.2, range: [7, 19], level: 0.05 }, harp: { density: 0.15, range: [0, 12], level: 0.1, timbre: 'oud' }, reverb: 0.5 },
    hall: { drone: { notes: [-24, -12, 0, 7], level: 0.05, timbre: 'voice' }, lead: { timbre: 'voice', density: 0.25, range: [0, 10], level: 0.06 }, reverb: 0.75 },
  },
};
