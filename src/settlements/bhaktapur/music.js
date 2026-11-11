// Music of Bhaktapur (docs/settlements/bhaktapur.md §7): temple bells over a drone, a pentatonic-leaning
// line of the ney standing in for the Newar flute and the dhime drum's pulse; open air by day, a hushed house within.
export default {
  tonic: 52,
  scale: [0, 2, 4, 7, 9],
  tempo: 78,
  zones: {
    open: { drone: { notes: [-12, -5, 0], level: 0.04, timbre: 'voice' }, lead: { timbre: 'ney', density: 0.2, range: [7, 19], level: 0.07 }, reverb: 0.3 },
    hall: { drone: { notes: [-12, -5, 0], level: 0.05, timbre: 'voice' }, lead: { timbre: 'reed', density: 0.2, range: [0, 12], level: 0.06 }, reverb: 0.6 },
  },
};
