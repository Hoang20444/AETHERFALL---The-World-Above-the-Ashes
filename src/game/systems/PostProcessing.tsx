import { EffectComposer, Bloom, N8AO, ToneMapping, Vignette } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'

export function PostProcessing() {
  return (
    <EffectComposer multisampling={4}>
      {/* Contact ambient occlusion for depth and crevice shadowing */}
      <N8AO
        aoRadius={1.8}
        intensity={2.2}
        distanceFalloff={1.0}
        color="#080e18"
      />
      {/* Ethereal bloom for Aether core, crystal beacons, and ancient runes */}
      <Bloom
        luminanceThreshold={0.9}
        luminanceSmoothing={0.35}
        intensity={1.25}
        mipmapBlur
      />
      {/* High-fidelity filmic tone mapping to prevent highlight burnout */}
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      {/* Subtle vignette to frame the third-person gameplay */}
      <Vignette offset={0.35} darkness={0.45} />
    </EffectComposer>
  )
}
