import * as THREE from 'three'

/**
 * Neuron overlay for the WebGL surface brain — a layer of glowing nodes + synapse
 * links sampled on the cortical surface, supporting three exploratory effects:
 *   'cursor'   — nodes near the pointer reach toward it + their links brighten (the
 *                interactive "neurons reaching" effect from the old particle brain)
 *   'ambient'  — nodes/links fire in slow waves on their own (no pointer needed)
 *   'entrance' — nodes assemble from a scattered cloud into the surface on load
 *
 * Nodes sit on the surface (radius ~1, far from the camera at z≈4.6) and rotate with
 * the brain, so they never transit the camera plane → no oversized-point flash.
 * Additive, depthTest off (draws over the glow), point size clamped, no pow().
 */

export type NeuronFx = 'none' | 'cursor' | 'ambient' | 'entrance'
const MODE: Record<Exclude<NeuronFx, 'none'>, number> = { cursor: 0, ambient: 1, entrance: 2 }

const DISPLACE = /* glsl */`
  // shared node displacement so links follow their nodes identically
  uniform float uMode, uTime, uMorph; uniform vec2 uCursor; uniform vec3 uColor, uHot;
  // returns clip-space position; outputs glow (0..~2) and the whitening mix
  vec4 placeNode(vec3 base, vec3 scatter, float phase, out float glow, out float hot){
    vec3 p = (uMode > 1.5) ? mix(scatter, base, smoothstep(0.0, 1.0, uMorph)) : base;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vec4 clip = projectionMatrix * mv;
    glow = 0.45; hot = 0.0;
    if (uMode < 0.5) {                 // cursor: reach toward the pointer
      vec2 ndc = clip.xy / clip.w;
      float d = distance(ndc, uCursor);
      float infl = smoothstep(0.40, 0.0, d);
      clip.xy += (uCursor - ndc) * clip.w * infl * 0.22;
      glow = 0.35 + infl * 1.7; hot = infl;
    } else if (uMode < 1.5) {          // ambient: slow firing waves
      float f = 0.5 + 0.5 * sin(uTime * 1.4 + phase * 6.2831 + base.x * 3.0 + base.y * 2.0);
      glow = 0.30 + 0.9 * f * f * f; hot = f * 0.6;
    } else {                           // entrance: ramp in as it assembles
      glow = 0.25 + 0.9 * uMorph; hot = 0.2 * uMorph;
    }
    return clip;
  }`

export function createNeurons(positions: Float32Array, fx: Exclude<NeuronFx, 'none'>) {
  const V = positions.length / 3
  const N = Math.min(360, V)
  const stride = Math.max(1, Math.floor(V / N))
  const base = new Float32Array(N * 3), scatter = new Float32Array(N * 3), phase = new Float32Array(N)
  for (let i = 0; i < N; i++) {
    const v = i * stride
    base[i * 3] = positions[v * 3]; base[i * 3 + 1] = positions[v * 3 + 1]; base[i * 3 + 2] = positions[v * 3 + 2]
    const r = 1.5 + (i % 9) * 0.05, a = i * 2.399963, b = Math.acos(1 - 2 * (((i * 0.618034) % 1)))
    scatter[i * 3] = Math.sin(b) * Math.cos(a) * r; scatter[i * 3 + 1] = Math.cos(b) * r * 0.8; scatter[i * 3 + 2] = Math.sin(b) * Math.sin(a) * r
    phase[i] = (i * 0.618034) % 1
  }
  // links: each node → nearest neighbour with index > i (dedup), ~N links
  const li: number[] = []
  for (let i = 0; i < N; i++) {
    let nj = -1, nd = 1e9
    for (let j = 0; j < N; j++) {
      if (j === i) continue
      const dx = base[i * 3] - base[j * 3], dy = base[i * 3 + 1] - base[j * 3 + 1], dz = base[i * 3 + 2] - base[j * 3 + 2]
      const d = dx * dx + dy * dy + dz * dz
      if (d < nd) { nd = d; nj = j }
    }
    if (nj > i) li.push(i, nj)
  }
  const L = li.length / 2
  // line geometry: 2 verts per link, each carrying its node's base/scatter/phase
  const lBase = new Float32Array(L * 6), lScatter = new Float32Array(L * 6), lPhase = new Float32Array(L * 2)
  for (let k = 0; k < L; k++) {
    for (let e = 0; e < 2; e++) {
      const idx = li[k * 2 + e], o = (k * 2 + e) * 3
      lBase[o] = base[idx * 3]; lBase[o + 1] = base[idx * 3 + 1]; lBase[o + 2] = base[idx * 3 + 2]
      lScatter[o] = scatter[idx * 3]; lScatter[o + 1] = scatter[idx * 3 + 1]; lScatter[o + 2] = scatter[idx * 3 + 2]
      lPhase[k * 2 + e] = phase[idx]
    }
  }

  const uniforms = {
    uMode: { value: MODE[fx] }, uTime: { value: 0 }, uMorph: { value: fx === 'entrance' ? 0 : 1 },
    uCursor: { value: new THREE.Vector2(-2, -2) },
    uColor: { value: new THREE.Color('#c2c8ff') }, uHot: { value: new THREE.Color('#ffffff') },
    uScale: { value: 18 }, // fine node size in device px (NOT viewport-scaled — these are small nodes)
  }

  // soft dot texture
  const tex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 64
    const g = c.getContext('2d')!; const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32)
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)')
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c)
  })()

  const ptsGeo = new THREE.BufferGeometry()
  ptsGeo.setAttribute('aBase', new THREE.BufferAttribute(base, 3))
  ptsGeo.setAttribute('aScatter', new THREE.BufferAttribute(scatter, 3))
  ptsGeo.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1))
  ptsGeo.setAttribute('position', new THREE.BufferAttribute(base, 3)) // unused but three wants it
  const ptsMat = new THREE.ShaderMaterial({
    uniforms: { ...uniforms, uTex: { value: tex } },
    transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */`
      attribute vec3 aBase; attribute vec3 aScatter; attribute float aPhase;
      uniform float uScale; varying float vGlow; varying float vHot;
      ${DISPLACE}
      void main(){ float glow, hot; vec4 clip = placeNode(aBase, aScatter, aPhase, glow, hot);
        vGlow = glow; vHot = hot;
        gl_PointSize = min(uScale * (0.55 + glow * 0.7), 44.0);
        gl_Position = clip; }`,
    fragmentShader: /* glsl */`
      uniform sampler2D uTex; uniform vec3 uColor, uHot; varying float vGlow; varying float vHot;
      void main(){ vec4 t = texture2D(uTex, gl_PointCoord);
        vec3 col = mix(uColor, uHot, clamp(vHot, 0.0, 1.0));
        gl_FragColor = vec4(col * (0.45 + vGlow * 0.7), t.a * clamp(0.35 + vGlow * 0.7, 0.0, 1.0)); }`,
  })
  const points = new THREE.Points(ptsGeo, ptsMat)
  points.frustumCulled = false

  const lineGeo = new THREE.BufferGeometry()
  lineGeo.setAttribute('aBase', new THREE.BufferAttribute(lBase, 3))
  lineGeo.setAttribute('aScatter', new THREE.BufferAttribute(lScatter, 3))
  lineGeo.setAttribute('aPhase', new THREE.BufferAttribute(lPhase, 1))
  lineGeo.setAttribute('position', new THREE.BufferAttribute(lBase, 3))
  const lineMat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */`
      attribute vec3 aBase; attribute vec3 aScatter; attribute float aPhase;
      varying float vGlow; varying float vHot;
      ${DISPLACE}
      void main(){ float glow, hot; vec4 clip = placeNode(aBase, aScatter, aPhase, glow, hot);
        vGlow = glow; vHot = hot; gl_Position = clip; }`,
    fragmentShader: /* glsl */`
      uniform vec3 uColor, uHot; varying float vGlow; varying float vHot;
      void main(){ vec3 col = mix(uColor, uHot, clamp(vHot, 0.0, 1.0));
        gl_FragColor = vec4(col * (0.5 + vGlow * 0.9), clamp(0.30 + vGlow * 0.8, 0.0, 1.0) * 0.75); }`,
  })
  const lines = new THREE.LineSegments(lineGeo, lineMat)
  lines.frustumCulled = false

  const group = new THREE.Group()
  group.add(lines); group.add(points)

  return {
    group,
    update(t: number, cursorNDC: THREE.Vector2 | null) {
      uniforms.uTime.value += t
      if (fx === 'entrance' && uniforms.uMorph.value < 1) uniforms.uMorph.value = Math.min(1, uniforms.uMorph.value + t / 1.6)
      if (fx === 'cursor' && cursorNDC) uniforms.uCursor.value.copy(cursorNDC)
    },
    setScale(px: number) { uniforms.uScale.value = px },
    dispose() { ptsGeo.dispose(); ptsMat.dispose(); lineGeo.dispose(); lineMat.dispose(); tex.dispose() },
  }
}
