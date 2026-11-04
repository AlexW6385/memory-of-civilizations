// Music of Sydney, 1973 (docs/settlements/sydney.md §9): the Opera House's opening season
// (Prokofiev's War and Peace, Beethoven's Ninth), the didgeridoo and clapsticks of the Gadigal on
// whose land it stands, the ferries' horns; a drone, voices and a plucked string stand in.
export default {
  tonic: 50,
  scale: [0, 2, 4, 7, 9],
  tempo: 76,
  zones: {
    open: { drone: { notes: [-24, -12], level: 0.04, timbre: 'sho' }, harp: { density: 0.3, range: [0, 17], level: 0.13, timbre: 'oud' }, reverb: 0.4 },
    hall: { drone: { notes: [-24, -12, -5, 0], level: 0.06, timbre: 'voice' }, lead: { timbre: 'voice', density: 0.25, range: [0, 12], level: 0.06 }, reverb: 0.95 },
  },
};
