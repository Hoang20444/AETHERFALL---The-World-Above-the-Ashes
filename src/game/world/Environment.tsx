import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { DirectionalLight, Group } from 'three'
import {
  AdditiveBlending,
  BackSide,
  Color,
  CylinderGeometry,
  Float32BufferAttribute,
  MeshBasicMaterial,
  MeshStandardMaterial,
  OctahedronGeometry,
  SphereGeometry,
  TorusGeometry,
  Vector3,
} from 'three'
import { PALETTE, WORLD_CONFIG } from '../GameConfig'
import { Sparkles } from '@react-three/drei'
import { getWorldMaterials } from './materials'
import { ModelAsset } from './ModelAsset'
import { getCloudTexture, getGlowTexture } from './textures'

/** Distant background islands to convey scale and depth */
const DISTANT_ISLANDS = [
  { x: -55, y: 12, z: -90, radius: 14, rock: 28, rot: 0.4 },
  { x: 62, y: -4, z: -80, radius: 11, rock: 22, rot: -0.6 },
  { x: -85, y: -15, z: -140, radius: 24, rock: 42, rot: 1.1 },
  { x: 95, y: 18, z: -160, radius: 28, rock: 48, rot: -0.8 },
  { x: -15, y: 28, z: -195, radius: 36, rock: 65, rot: 0.2 },
] as const

/** Colossal ancient pillars in the far mist ("The Seven Pillars") */
const DISTANT_PILLARS = [
  { x: -140, y: 40, z: -240, width: 14, height: 260 },
  { x: 130, y: 30, z: -250, width: 16, height: 240 },
  { x: -70, y: 60, z: -290, width: 18, height: 280 },
  { x: 75, y: 55, z: -300, width: 15, height: 270 },
] as const

export function Environment() {
  const dirLightRef = useRef<DirectionalLight>(null)
  const cloudsRef = useRef<Group>(null)
  const cloudsHighRef = useRef<Group>(null)

  // Gradient Sky Dome with sun glow (Zenith -> Horizon -> Nadir + Sun Vector)
  const skyGeom = useMemo(() => {
    const geom = new SphereGeometry(380, 32, 20)
    const pos = geom.attributes.position
    const colors = new Float32Array(pos.count * 3)
    const top = new Color(PALETTE.skyTop)
    const horiz = new Color(PALETTE.skyHorizon)
    const bot = new Color(PALETTE.skyBelow)
    const sunGlow = new Color(PALETTE.sunWarm)
    const sunDir = new Vector3(68, 45, -55).normalize()
    const temp = new Color()

    for (let i = 0; i < pos.count; i++) {
      const px = pos.getX(i)
      const py = pos.getY(i)
      const pz = pos.getZ(i)
      const len = Math.sqrt(px * px + py * py + pz * pz) || 1
      const y = py / len // -1 .. 1

      if (y >= 0) {
        temp.lerpColors(horiz, top, Math.pow(y, 0.7))
      } else {
        temp.lerpColors(horiz, bot, Math.min(-y * 1.6, 1.0))
      }

      // Sun halo blend
      const dotSun = Math.max((px * sunDir.x + py * sunDir.y + pz * sunDir.z) / len, 0)
      if (dotSun > 0.6) {
        const glowFactor = Math.pow((dotSun - 0.6) / 0.4, 2.8) * 0.42
        temp.lerp(sunGlow, glowFactor)
      }

      colors[i * 3] = temp.r
      colors[i * 3 + 1] = temp.g
      colors[i * 3 + 2] = temp.b
    }
    geom.setAttribute('color', new Float32BufferAttribute(colors, 3))
    return geom
  }, [])

  const skyMat = useMemo(
    () =>
      new MeshBasicMaterial({
        vertexColors: true,
        side: BackSide,
        depthWrite: false,
      }),
    [],
  )

  // Materials for distant scenery
  const distantStoneMat = useMemo(
    () =>
      new MeshStandardMaterial({
        color: new Color('#526070'),
        roughness: 0.92,
      }),
    [],
  )


  const distantRockMat = useMemo(
    () =>
      new MeshStandardMaterial({
        color: new Color('#242e38'),
        roughness: 1.0,
      }),
    [],
  )

  // Cloud layer materials
  const cloudTexture = useMemo(() => getCloudTexture(), [])
  const cloudMat = useMemo(
    () =>
      new MeshBasicMaterial({
        map: cloudTexture,
        color: new Color(PALETTE.cloudLit),
        transparent: true,
        opacity: 0.52,
        depthWrite: false,
      }),
    [cloudTexture],
  )

  const cloudHighMat = useMemo(
    () =>
      new MeshBasicMaterial({
        map: cloudTexture,
        color: new Color('#ffffff'),
        transparent: true,
        opacity: 0.22,
        depthWrite: false,
      }),
    [cloudTexture],
  )

  // Pillar geometries with ancient collar rings
  const pillarGeoms = useMemo(
    () =>
      DISTANT_PILLARS.map(
        (p) => new CylinderGeometry(p.width * 0.45, p.width * 0.55, p.height, 8),
      ),
    [],
  )
  const pillarRingGeom = useMemo(() => new TorusGeometry(10, 1.2, 6, 16), [])


  // Floating debris rock around distant islands
  const debrisRockGeom = useMemo(() => new OctahedronGeometry(2.5, 0), [])

  // Waterfall geometries and materials
  const worldMats = useMemo(() => getWorldMaterials(), [])
  const waterfallGeomLarge = useMemo(() => new CylinderGeometry(3.2, 4.8, 38, 12, 1, true, 0, Math.PI), [])
  const waterfallGeomSmall = useMemo(() => new CylinderGeometry(1.8, 2.6, 26, 10, 1, true, 0, Math.PI), [])

  // Sea of clouds below (planes)
  const cloudPlanes = useMemo(() => {
    const planes = []
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2
      const dist = 32 + ((i * 19) % 85)
      planes.push({
        x: Math.cos(angle) * dist,
        y: -34 - ((i * 7) % 12),
        z: -30 + Math.sin(angle) * dist,
        size: 64 + ((i * 13) % 48),
        rot: i * 0.6,
      })
    }
    return planes
  }, [])

  // High altitude wispy cloud planes
  const cloudHighPlanes = useMemo(() => {
    const planes = []
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      const dist = 60 + ((i * 23) % 50)
      planes.push({
        x: Math.cos(angle) * dist,
        y: 42 + ((i * 5) % 12),
        z: -60 + Math.sin(angle) * dist,
        size: 85 + ((i * 17) % 35),
        rot: i * 0.9,
      })
    }
    return planes
  }, [])

  useFrame((_, delta) => {
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.003
    }
    if (cloudsHighRef.current) {
      cloudsHighRef.current.rotation.y -= delta * 0.002
    }
    // Animate rushing waterfall texture coordinates
    if (worldMats.waterfall.map) {
      worldMats.waterfall.map.offset.y -= delta * 1.3
    }
  })

  const glowTexture = useMemo(() => getGlowTexture(), [])

  // Towering golden cumulus cloud banks on the right horizon (framing the Ancient Monument)
  const goldenClouds = useMemo(
    () => [
      { x: 55, y: 18, z: -85, size: 75, rot: 0.2 },
      { x: 88, y: 34, z: -118, size: 98, rot: 0.5 },
      { x: 115, y: 52, z: -150, size: 125, rot: -0.3 },
      { x: 44, y: 8, z: -68, size: 55, rot: 0.8 },
      { x: -75, y: 22, z: -110, size: 85, rot: 0.4 },
    ],
    [],
  )

  return (
    <>
      {/* Distance-based atmospheric fog */}
      <fog attach="fog" args={[PALETTE.fog, WORLD_CONFIG.fogNear, WORLD_CONFIG.fogFar]} />

      {/* Atmospheric Gradient Sky Sphere */}
      <mesh geometry={skyGeom} material={skyMat} />

      {/* Radiant Sun Disc & Golden Celestial Halo (visible in front-right sky next to Monument) */}
      <mesh position={[160, 115, -130]} rotation={[0.3, -0.9, 0]}>
        <planeGeometry args={[125, 125]} />
        <meshBasicMaterial
          map={glowTexture}
          color={PALETTE.sunWarm}
          transparent
          opacity={0.85}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Towering Golden Cumulus Clouds on Horizon */}
      <group name="GoldenHorizonClouds">
        {goldenClouds.map((c, idx) => (
          <mesh key={idx} position={[c.x, c.y, c.z]} rotation={[0, -0.9, c.rot]}>
            <planeGeometry args={[c.size, c.size]} />
            <meshBasicMaterial
              map={cloudTexture}
              color={PALETTE.cloudLit}
              transparent
              opacity={0.65}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>

      {/* Key Directional Sunlight (Warm Golden Celestial Sun from Front-Right) */}
      <directionalLight
        ref={dirLightRef}
        color={PALETTE.sun}
        intensity={2.95}
        position={[68, 45, -55]}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={10}
        shadow-camera-far={180}
        shadow-camera-left={-28}
        shadow-camera-right={28}
        shadow-camera-top={28}
        shadow-camera-bottom={-80}
        shadow-bias={-0.00025}
        shadow-normalBias={0.02}
      />

      {/* Cool Slate-Blue Rim Light (from behind the monument to rim-light silhouettes) */}
      <directionalLight
        color={PALETTE.rimLight}
        intensity={0.8}
        position={[-28, 32, -80]}
      />

      {/* Balanced Hemisphere Light for readable shadows without crushed blacks */}
      <hemisphereLight
        color="#a5c6e4"
        groundColor="#3d4d5e"
        intensity={1.25}
      />

      {/* Soft Ambient Fill */}
      <ambientLight color="#4c627c" intensity={0.78} />

      {/* Distant Colossal Sky Pillars ("The Seven Pillars") */}
      <group name="DistantPillars">
        {DISTANT_PILLARS.map((p, idx) => (
          <group key={idx} position={[p.x, p.y, p.z]}>
            <mesh geometry={pillarGeoms[idx]} material={distantStoneMat} />
            {/* Ancient collar rings on pillars */}
            <mesh
              geometry={pillarRingGeom}
              material={distantStoneMat}
              position={[0, 30, 0]}
              scale={[p.width * 0.06, 1, p.width * 0.06]}
            />
          </group>
        ))}
      </group>

      {/* Distant Floating Islands with waterfalls and floating rock debris */}
      <group name="DistantIslands">
        {DISTANT_ISLANDS.map((isle, idx) => {
          const modelUrl = idx % 2 === 0
            ? '/models/environment/island_rock_large.glb'
            : '/models/environment/island_rock_medium.glb'
          const scaleFactor = isle.radius / 14.0
          return (
            <group
              key={idx}
              position={[isle.x, isle.y, isle.z]}
              rotation={[0, isle.rot, 0]}
            >
              {/* Handcrafted Blender Stratified Geological Rock Island */}
              <ModelAsset
                url={modelUrl}
                scale={scaleFactor}
                receiveShadow
              />

              {/* Cascading waterfalls pouring from floating islands into the abyss */}
              {idx === 0 && (
                <mesh
                  geometry={waterfallGeomLarge}
                  material={worldMats.waterfall}
                  position={[isle.radius * 0.65, -17, 0]}
                  rotation={[0, 0.4, 0]}
                />
              )}
              {idx === 1 && (
                <mesh
                  geometry={waterfallGeomSmall}
                  material={worldMats.waterfall}
                  position={[-isle.radius * 0.6, -11, 0]}
                  rotation={[0, -0.6, 0]}
                />
              )}
              {idx === 2 && (
                <mesh
                  geometry={waterfallGeomLarge}
                  material={worldMats.waterfall}
                  position={[isle.radius * 0.5, -18, isle.radius * 0.3]}
                  rotation={[0, 1.1, 0]}
                />
              )}

              {/* Floating companion debris shards */}
              <mesh
                geometry={debrisRockGeom}
                material={distantRockMat}
                position={[isle.radius * 1.25, -4, isle.radius * 0.5]}
                scale={[0.8, 1.4, 0.8]}
              />
              <mesh
                geometry={debrisRockGeom}
                material={distantRockMat}
                position={[-isle.radius * 1.2, 2, -isle.radius * 0.6]}
                scale={[0.6, 1.0, 0.6]}
              />
            </group>
          )
        })}
      </group>

      {/* Low Sea of Clouds ("The Falling" abyss) */}
      <group ref={cloudsRef} name="CloudSea">
        {cloudPlanes.map((c, idx) => (
          <mesh
            key={idx}
            position={[c.x, c.y, c.z]}
            rotation={[-Math.PI / 2, 0, c.rot]}
          >
            <planeGeometry args={[c.size, c.size]} />
            <primitive object={cloudMat} attach="material" />
          </mesh>
        ))}
      </group>

      {/* High Wispy Cloud Strata */}
      <group ref={cloudsHighRef} name="HighClouds">
        {cloudHighPlanes.map((c, idx) => (
          <mesh
            key={idx}
            position={[c.x, c.y, c.z]}
            rotation={[-Math.PI / 2, 0, c.rot]}
          >
            <planeGeometry args={[c.size, c.size]} />
            <primitive object={cloudHighMat} attach="material" />
          </mesh>
        ))}
      </group>

      {/* Ambient Drifting Aether Motes across the Sky Archipelago */}
      <Sparkles
        count={70}
        scale={[80, 25, 80]}
        position={[0, 8, 0]}
        size={3.2}
        speed={0.25}
        color="#72e4ff"
        opacity={0.5}
      />
    </>
  )
}
