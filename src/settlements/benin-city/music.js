// Music of Benin City (docs/settlements/benin-city.md §7): the log drum and the bells of the palace, the hammer and bellows of the guild yard,
// a pentatonic song over a low drone; a plucked lamellophone (the thumb piano) stands for the court's music and a wooden flute for the lead.
export default {
  tonic: 52,
  scale: [0, 2, 4, 7, 9],
  tempo: 84,
  zones: {
    open: { drone: { notes: [-12, -5, 0], level: 0.025, timbre: 'sho' }, harp: { density: 0.35, range: [3, 17], level: 0.14, timbre: 'kora' }, lead: { timbre: 'ney', density: 0.08, range: [7, 17], level: 0.035 }, reverb: 0.3 },
    inner: { drone: { notes: [-12, -5, 0], level: 0.04, timbre: 'voice' }, harp: { density: 0.3, range: [0, 12], level: 0.1, timbre: 'kora' }, reverb: 0.55 },
    hall: { drone: { notes: [-24, -12, -5, 0], level: 0.05, timbre: 'voice' }, harp: { density: 0.25, range: [0, 12], level: 0.1, timbre: 'kora' }, lead: { timbre: 'voice', density: 0.15, range: [0, 10], level: 0.045 }, reverb: 0.85 },
  },
};
