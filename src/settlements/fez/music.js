// Music of Marinid Fez (docs/settlements/fez.md §9): the Andalusi nuba of the Fez school, the call to prayer from the minarets, the rabab and the oud,
// the ney; a drone and slow modal lines (the ṣīkā / māya modes).
export default {
  tonic: 50,
  scale: [0, 2, 3, 5, 7, 8, 10],
  tempo: 58,
  zones: {
    open: { drone: { notes: [-12, 0], level: 0.04, timbre: 'sho' }, lead: { timbre: 'voice', density: 0.18, range: [5, 17], level: 0.07 }, reverb: 0.5 },
    hall: { drone: { notes: [-12, -5, 0], level: 0.05, timbre: 'sho' }, lead: { timbre: 'ney', density: 0.25, range: [7, 19], level: 0.07 }, reverb: 0.95 },
  },
};
