// Vertex arrays let go of once on the GPU (DESIGN §8, memory).

/**
 * Let go of a mesh's vertex arrays once they are on the GPU (the first time it is drawn): on the
 * author's machine memory is shared between CPU and GPU, so keeping them held every vertex twice.
 * The attribute keeps its count and its array type (empty), which is all the renderer reads after
 * the upload; nothing reads the vertices of a built part after its collision is made.
 */
export function releaseAfterUpload(o) {
  if (!o.isMesh || o.userData.released) return;
  const before = o.onAfterRender;
  o.onAfterRender = function (renderer, ...a) {
    before.call(this, renderer, ...a);
    const g = this.geometry, attrs = [...Object.values(g.attributes), g.index].filter(Boolean);
    // only once every attribute is on the GPU (a shadow pass uploads the positions alone)
    const be = renderer.backend;
    if (!attrs.every((at) => { const d = be.get(at); return d.buffer !== undefined || d.bufferGPU !== undefined; })) return;
    this.onAfterRender = before;
    for (const at of attrs) if (at.array?.length) at.array = new at.array.constructor(0);
    this.userData.released = true;
  };
}
