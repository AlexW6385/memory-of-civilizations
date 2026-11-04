// Music of Rapa Nui (docs/settlements/rapa-nui.md §9): chant (riu) with a stamping stone and
// hand-clapping, little else; voices and a drone stand in, under the wind and the surf.
export default {
  tonic: 48,
  scale: [0, 2, 4, 7, 9],
  tempo: 70,
  zones: {
    open: { drone: { notes: [-12, 0], level: 0.04, timbre: 'voice' }, lead: { timbre: 'voice', density: 0.25, range: [0, 12], level: 0.06 }, reverb: 0.25 },
    hall: { drone: { notes: [-12, 0, 7], level: 0.05, timbre: 'voice' }, lead: { timbre: 'voice', density: 0.3, range: [0, 12], level: 0.07 }, reverb: 0.4 },
  },
};
