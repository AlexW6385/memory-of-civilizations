// Render layers. The small things (street life, fine detail) are on SMALL alone: the camera sees
// it, and only the first shadow cascade draws it (src/engine/renderer.js).

export const SMALL = 2;

// Shadow casters the camera does not see (drawn into every cascade): the coarse copies of fine
// pieces, which cast the shadows of the full ones near (src/engine/merge.js LodSet).
export const SHADOW = 4;
