import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js'
import { BRAIN_MESH } from '@/components/site/brainMeta'
import { createNeurons, type NeuronFx } from '@/components/site/brainNeurons'
import { BRAIN_PALETTES, DEFAULT_BRAIN_PALETTE, type BrainPalette } from '@/components/site/brainPalettes'

/**
 * Hero brain — the LOCKED "periwinkle" look from the WebGL surface-brain lab,
 * ported to React. A decimated FreeSurfer pial cortex (≈62k verts / 161k faces,
 * fetched lazily from the content-hashed /brain_lo.<hash>.bin — see brainMeta.ts)
 * rendered as a glowing additive x-ray SURFACE: fresnel rim + curvature-driven
 * sulcus glow + UnrealBloom, slow spin.
 * TRANSPARENT canvas (alpha derived from luminance in a final pass) so it
 * composites over the animated Background + hero particle field as a glow.
 * (The ambient particles live in a separate hero-wide 2D layer — HeroParticles —
 * NOT here, so nothing rotates through the camera and there is no flash.)
 *
 * Desktop-only + capability-gated by HeroGraphic (mobile / no-WebGL / reduced
 * motion → the 2D PialBrain fallback instead). Pauses off-screen + when hidden;
 * disposes all GPU resources on unmount. reduced → one still frame, no loop.
 */

// Colour + intensity (uColor / uHot / uHotMix / uExposure) come from the chosen
// brain PALETTE (brainPalettes.ts): default `periwinkle` is the locked lab look;
// DEV `?palette=` swaps it live. EXPOSURE in the palette is bumped vs the lab's 1.0
// because the transparent alpha-over composite dims the glow over the live Background.
// The constants below are the palette-independent look knobs.
const ACCUM_SCALE = 0.13 // tames unbounded additive over the folded cortex (see lab)
const BASE_GLOW = 0.0
const FRESNEL_POW = 2.8
const FRESNEL_STRENGTH = 0.6
const SULCUS_GLOW = 0.4
const SULCUS_WIDTH = 0.4
const BLOOM_STRENGTH = 0.22 // tighter halo for the iris palette (was 0.28; glow review 2026-06-18)
const BLOOM_RADIUS = 0.5
const BLOOM_THRESHOLD = 0.12
const SPIN = 0.2

type Props = {
  reduced?: boolean
  fx?: NeuronFx
  palette?: BrainPalette
  onReady?: () => void
  onContextLost?: () => void
  className?: string
}

export default function SurfaceBrain({ reduced = false, fx = 'none', palette = DEFAULT_BRAIN_PALETTE, onReady, onContextLost, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const readyRef = useRef(onReady)
  const lostRef = useRef(onContextLost)
  useEffect(() => { readyRef.current = onReady; lostRef.current = onContextLost })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const parent = canvas.parentElement
    if (!parent) return

    let renderer: THREE.WebGLRenderer
    try {
      // preserveDrawingBuffer:true — the buffer keeps its last frame, so a missed rAF /
      // GC pause / IO-pause can never composite a CLEARED frame = no intermittent blink.
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, premultipliedAlpha: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' })
    } catch {
      lostRef.current?.()
      return
    }
    renderer.setClearColor(0x000000, 0) // transparent — composite over the site Background
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5) // cap to ease bloom VRAM / context-loss pressure
    renderer.setPixelRatio(dpr)

    let W = Math.max(1, parent.clientWidth), H = Math.max(1, parent.clientHeight)
    renderer.setSize(W, H, false)

    const scene = new THREE.Scene() // no background → transparent
    const camera = new THREE.PerspectiveCamera(38, W / H, 0.1, 100)
    camera.position.set(0, 0, 4.6)

    const brainGroup = new THREE.Group()
    brainGroup.rotation.y = -0.4
    scene.add(brainGroup)

    // --- brain material: additive fresnel x-ray ---------------------------------
    const pal = BRAIN_PALETTES[palette]
    const uni = {
      uColor: { value: new THREE.Color(pal.color) },
      uHot: { value: new THREE.Color(pal.hot) },
      uExposure: { value: pal.exposure },
      uBaseGlow: { value: BASE_GLOW },
      uFresnelPow: { value: FRESNEL_POW },
      uFresnelStrength: { value: FRESNEL_STRENGTH },
      uSulcusGlow: { value: SULCUS_GLOW },
      uSulcusWidth: { value: SULCUS_WIDTH },
      uHotMix: { value: pal.hotMix },
    }
    const brainMat = new THREE.ShaderMaterial({
      uniforms: uni,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.CustomBlending,
      blendEquation: THREE.AddEquation,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneFactor,
      vertexShader: /* glsl */`
        attribute float curv;
        varying float vCurv; varying vec3 vN; varying vec3 vV;
        void main(){
          vCurv = curv;
          vec4 mv = modelViewMatrix * vec4(position,1.0);
          vN = normalize(normalMatrix * normal);
          vV = normalize(-mv.xyz);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */`
        precision highp float;
        uniform vec3 uColor, uHot; uniform float uExposure, uBaseGlow, uFresnelPow,
          uFresnelStrength, uSulcusGlow, uSulcusWidth, uHotMix;
        varying float vCurv; varying vec3 vN; varying vec3 vV;
        void main(){
          float ndv = abs(dot(normalize(vN), normalize(vV)));
          // max(...,0) is critical: float error can push ndv slightly >1, making the
          // base negative; pow(negative, fractional) = NaN, which the bloom blur then
          // spreads across the whole frame → an intermittent BLACK-OUT flicker at the
          // rotation angles where a surface faces the camera dead-on. Clamping kills it.
          float fres = pow(max(1.0 - ndv, 0.0), uFresnelPow);
          float sulc = smoothstep(0.0, -max(uSulcusWidth,1e-3), vCurv);
          float I = uBaseGlow + uFresnelStrength*fres + uSulcusGlow*sulc;
          vec3 col = mix(uColor, uHot, clamp(uHotMix*fres, 0.0, 1.0));
          gl_FragColor = vec4(col * I * uExposure * ${ACCUM_SCALE}, 1.0);
        }`,
    })

    // (No 3D bokeh here — ambient particles are a separate hero-wide 2D layer. A
    // rotating 3D point field swept points through the camera plane where they
    // bloomed into an intermittent bright flash; removing it kills that class.)

    // --- postprocessing ---------------------------------------------------------
    const composer = new EffectComposer(renderer)
    composer.setSize(W, H)
    composer.addPass(new RenderPass(scene, camera))
    const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), BLOOM_STRENGTH, BLOOM_RADIUS, BLOOM_THRESHOLD)
    composer.addPass(bloom)
    composer.addPass(new OutputPass())
    // final pass: derive canvas alpha from luminance so the glow + bloom halo
    // composite over the page (UnrealBloom leaves the halo at alpha 0 otherwise).
    const alphaPass = new ShaderPass({
      uniforms: { tDiffuse: { value: null }, uGain: { value: 2.5 } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
      fragmentShader: /* glsl */`
        uniform sampler2D tDiffuse; uniform float uGain; varying vec2 vUv;
        void main(){ vec4 c = texture2D(tDiffuse, vUv);
          // subtract a luminance floor so near-black → EXACTLY 0 alpha (kills the faint
          // canvas-rectangle "block"), then fade the outer edges so a bloom halo clipped
          // by the canvas bounds can never show a hard rectangle edge.
          float m = max(c.r, max(c.g, c.b));
          float a = clamp((m - 0.035) * uGain, 0.0, 1.0);
          vec2 e = min(vUv, 1.0 - vUv);
          a *= smoothstep(0.0, 0.06, min(e.x, e.y));
          gl_FragColor = vec4(c.rgb, a); }`,
    })
    composer.addPass(alphaPass)

    // --- shared mutable state ---------------------------------------------------
    let brain: THREE.Mesh | null = null
    let neurons: ReturnType<typeof createNeurons> | null = null
    let disposed = false
    let raf = 0
    let first = true
    let started = false
    let inView = true
    const cursorNDC = new THREE.Vector2(-2, -2) // pointer in the canvas's NDC (for fx='cursor')

    // --- sizing -----------------------------------------------------------------
    const layout = () => {
      W = Math.max(1, parent.clientWidth); H = Math.max(1, parent.clientHeight)
      renderer.setSize(W, H, false)
      composer.setSize(W, H)
      bloom.setSize(W, H)
      camera.aspect = W / H; camera.updateProjectionMatrix()
      neurons?.setScale(dpr * 12)
    }
    const ro = new ResizeObserver(layout)
    ro.observe(parent)

    // --- context loss → fall back ----------------------------------------------
    const onLost = (e: Event) => { e.preventDefault(); lostRef.current?.() }
    canvas.addEventListener('webglcontextlost', onLost)

    // --- render loop ------------------------------------------------------------
    const clock = new THREE.Clock()
    const renderFrame = (t: number) => {
      if (!reduced) brainGroup.rotation.y += t * SPIN
      if (neurons) neurons.update(t, fx === 'cursor' ? cursorNDC : null)
      composer.render()
      if (first && brain) { first = false; readyRef.current?.() }
    }
    const loop = () => { raf = requestAnimationFrame(loop); renderFrame(clock.getDelta()) }
    const start = () => {
      if (started || disposed) return
      started = true
      if (reduced) { clock.getDelta(); renderFrame(0); return } // one still frame, no loop
      raf = requestAnimationFrame(loop)
    }

    // pause off-screen / when the tab is hidden (only matters in the animated path)
    const setRunning = () => {
      if (reduced || !started) return
      const should = inView && !document.hidden
      if (should && !raf) { clock.getDelta(); raf = requestAnimationFrame(loop) }
      else if (!should && raf) { cancelAnimationFrame(raf); raf = 0 }
    }
    const io = new IntersectionObserver((ents) => { inView = ents[0].isIntersecting; setRunning() })
    io.observe(parent)
    const onVis = () => setRunning()
    document.addEventListener('visibilitychange', onVis)

    // pointer tracking (canvas NDC) for fx='cursor' — window listener, so the
    // pointer-events-none wrapper still doesn't capture page scroll
    const onPointer = (e: PointerEvent) => {
      const r = parent.getBoundingClientRect()
      const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom
      if (inside) cursorNDC.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1))
      else cursorNDC.set(-2, -2)
    }
    if (fx === 'cursor') window.addEventListener('pointermove', onPointer, { passive: true })

    // DEV-only hook (stripped from production by import.meta.env.DEV dead-code
    // elimination) — lets a headless check force a frame to verify compositing.
    if (import.meta.env.DEV) {
      ;(window as unknown as { __sb?: unknown }).__sb = {
        render: () => composer.render(),
        get brain() { return brain },
        setExposure: (v: number) => { uni.uExposure.value = v },
        setGain: (v: number) => { alphaPass.uniforms.uGain.value = v },
        setBloomThreshold: (v: number) => { bloom.threshold = v },
        setBloomStrength: (v: number) => { bloom.strength = v },
        get neurons() { return neurons },
        brainGroup, camera, bloom,
      }
    }

    // --- load the mesh (last: start() and the loop are defined above) ------------
    const ac = new AbortController()
    let responded = false
    // Only fall back if the fetch is still PENDING at 12s — a slow-but-live load
    // (bytes arrived, geometry still building) must NOT be mistaken for a context loss.
    const loadTimeout = window.setTimeout(() => { if (!responded) { ac.abort(); lostRef.current?.() } }, 12000)
    ;(async () => {
      try {
        const res = await fetch(BRAIN_MESH.url, { signal: ac.signal })
        if (!res.ok) throw new Error(`mesh ${res.status}`)
        // Guard the SPA fallback: a misrouted asset is rewritten to index.html and
        // returns 200 text/html, which would feed garbage to the binary parser.
        // Throw instead → the catch swaps in the 2D PialBrain.
        const ct = res.headers.get('content-type') ?? ''
        if (ct.includes('text/html')) throw new Error(`mesh got HTML (${ct})`)
        const buf = await res.arrayBuffer()
        responded = true
        window.clearTimeout(loadTimeout)
        if (disposed) return
        const { V, F, off } = BRAIN_MESH
        const geo = new THREE.BufferGeometry()
        geo.setAttribute('position', new THREE.BufferAttribute(new Int16Array(buf, off.pos, V * 3), 3, true))
        geo.setAttribute('normal', new THREE.BufferAttribute(new Int8Array(buf, off.nrm, V * 3), 3, true))
        geo.setAttribute('curv', new THREE.BufferAttribute(new Int8Array(buf, off.curv, V), 1, true))
        const Idx = BRAIN_MESH.idxType === 'uint16' ? Uint16Array : Uint32Array
        geo.setIndex(new THREE.BufferAttribute(new Idx(buf, off.idx, F * 3), 1))
        brain = new THREE.Mesh(geo, brainMat)
        brain.frustumCulled = false
        brainGroup.add(brain)
        if (fx !== 'none') {
          const pos16 = new Int16Array(buf, off.pos, V * 3)
          const fpos = new Float32Array(V * 3)
          for (let i = 0; i < V * 3; i++) fpos[i] = pos16[i] / 32767
          neurons = createNeurons(fpos, fx)
          neurons.setScale(dpr * 12)
          brainGroup.add(neurons.group)
        }
        start()
      } catch (e) {
        if (!disposed && (e as Error).name !== 'AbortError') { window.clearTimeout(loadTimeout); lostRef.current?.() }
      }
    })()

    // --- teardown ---------------------------------------------------------------
    return () => {
      disposed = true
      ac.abort(); window.clearTimeout(loadTimeout)
      cancelAnimationFrame(raf)
      io.disconnect(); ro.disconnect()
      document.removeEventListener('visibilitychange', onVis)
      if (fx === 'cursor') window.removeEventListener('pointermove', onPointer)
      canvas.removeEventListener('webglcontextlost', onLost)
      brain?.geometry.dispose()
      brainMat.dispose()
      neurons?.dispose()
      bloom.dispose(); composer.dispose()
      renderer.dispose()
      if (import.meta.env.DEV) { delete (window as unknown as { __sb?: unknown }).__sb }
    }
  }, [reduced, fx, palette])

  return <canvas ref={canvasRef} className={className} aria-hidden />
}
