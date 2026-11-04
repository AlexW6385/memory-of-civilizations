// Music of Cahokia (docs/settlements/cahokia.md §9): drums and rattles of gourd and turtle shell,
// cane flutes and voices at the plaza's ceremonies; a drone, a flute-like reed and voices stand in.
export default {
  tonic: 45,
  scale: [0, 3, 5, 7, 10],
  tempo: 72,
  zones: {
    open: { drone: { notes: [-12, 0], level: 0.035, timbre: 'sho' }, lead: { timbre: 'reed', density: 0.18, range: [7, 19], level: 0.05 }, reverb: 0.3 },
    hall: { drone: { notes: [-24, -12, 0], level: 0.05, timbre: 'voice' }, lead: { timbre: 'voice', density: 0.25, range: [0, 10], level: 0.06 }, reverb: 0.6 },
  },
};
