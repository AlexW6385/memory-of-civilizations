// Music of Mycenaean Greece (docs/settlements/mycenae.md §9): the lyre (the four- and seven-string forms of the Pylos and Ayia Triada paintings) and the
// double pipe; a plucked harp, an aulos and a drone stand in. A mode of the dry Aegean: Dorian-like, a low drone under the hall's voice.
export default {
  tonic: 50,
  scale: [0, 2, 3, 5, 7, 9, 10],
  tempo: 64,
  zones: {
    open: { drone: { notes: [-12, -5, 0], level: 0.04, timbre: 'sho' }, harp: { density: 0.28, range: [5, 22], level: 0.15, timbre: 'kithara' }, reverb: 0.3 },
    hall: { drone: { notes: [-12, 0], level: 0.05, timbre: 'sho' }, harp: { density: 0.35, range: [5, 17], level: 0.14, timbre: 'kithara' }, lead: { timbre: 'aulos', density: 0.2, range: [7, 19], level: 0.06 }, reverb: 0.75 },
    inner: { drone: { notes: [-12, -5], level: 0.05, timbre: 'voice' }, reverb: 0.9 },
  },
};
