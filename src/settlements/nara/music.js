// Music of Nara (docs/settlements/nara.md §9): gagaku as played at the eye-opening of the Great
// Buddha in 752 — the shō's clusters, the hichiriki's reed, the biwa; sutra chanting in the hall.
export default {
  tonic: 52,
  scale: [0, 2, 5, 7, 9],
  tempo: 40,
  zones: {
    open: { drone: { notes: [-12, -5, 0, 2], level: 0.06, timbre: 'sho' }, lead: { timbre: 'reed', density: 0.18, range: [7, 19], level: 0.06 }, reverb: 0.45 },
    hall: { drone: { notes: [-24, -12, 0], level: 0.07, timbre: 'voice' }, harp: { density: 0.2, range: [0, 12], level: 0.12, timbre: 'pipa' }, reverb: 0.9 },
  },
};
