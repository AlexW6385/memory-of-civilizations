// Sound at Ubirr (docs/settlements/kakadu.md §7): nothing of the period's music is recorded; a low drone (the didgeridoo is shown in
// Freshwater rock art) and clapsticks stand in [inferred], under the wind and the geese.
export default {
  tonic: 41,
  scale: [0, 3, 5, 7, 10],
  tempo: 58,
  zones: {
    open: { drone: { notes: [-12, -5], level: 0.05, timbre: 'voice' }, lead: { timbre: 'ney', density: 0.1, range: [7, 15], level: 0.04 }, reverb: 0.25 },
    hall: { drone: { notes: [-12, -5, 0], level: 0.06, timbre: 'voice' }, lead: { timbre: 'voice', density: 0.12, range: [0, 9], level: 0.05 }, reverb: 0.55 },
  },
};
