// React Three Fiber copies the `uniforms` prop into the material, so later changes to our own
// uniform objects (time, opacity, progress…) would never reach the shader. This ref callback makes
// the material use our object itself. It runs before the first render, so the shader compiles
// against the right uniforms.
export const bindUniforms = (uniforms) => (material) => {
  if (material && material.uniforms !== uniforms) {
    material.uniforms = uniforms
    material.needsUpdate = true
  }
}
