"use client"

import { useRef, useMemo } from "react"
import { useFrame, extend } from "@react-three/fiber"
import { type Mesh, Vector3, BufferGeometry } from "three"
import * as THREE from "three"

const EdgeDiffusionMaterial = THREE.ShaderMaterial
extend({ EdgeDiffusionMaterial })

const vertexShader = `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`

const fragmentShader = `
  uniform vec3 color;
  uniform float opacity;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  
  void main() {
    vec3 viewDir = normalize(vViewPosition);
    float fresnel = 1.0 - abs(dot(viewDir, vNormal));
    
    // Create edge diffusion - more transparent at edges
    float edgeOpacity = mix(opacity * 0.2, opacity, 1.0 - fresnel);
    
    gl_FragColor = vec4(color, edgeOpacity);
  }
`

export function Globe() {
  const globeRef = useRef<Mesh>(null)

  // Rotate the globe
  useFrame((state, delta) => {
    if (globeRef.current) {
      globeRef.current.rotation.y += delta * 0.2
    }
  })

  // Generate grid lines for longitude and latitude
  const gridGeometry = useMemo(() => {
    const geometry = new BufferGeometry()
    const vertices: number[] = []
    const normals: number[] = []
    const radius = 2

    for (let i = 0; i < 24; i++) {
      const phi = (i / 24) * Math.PI * 2
      for (let j = 0; j <= 50; j++) {
        const theta = (j / 50) * Math.PI
        const x = radius * Math.sin(theta) * Math.cos(phi)
        const y = radius * Math.cos(theta)
        const z = radius * Math.sin(theta) * Math.sin(phi)
        vertices.push(x, y, z)

        // Normal is the normalized position vector for a sphere
        const normal = new Vector3(x, y, z).normalize()
        normals.push(normal.x, normal.y, normal.z)
      }
    }

    for (let i = 1; i < 20; i++) {
      const theta = (i / 20) * Math.PI
      const currentRadius = radius * Math.sin(theta)
      const y = radius * Math.cos(theta)

      for (let j = 0; j <= 100; j++) {
        const phi = (j / 100) * Math.PI * 2
        const x = currentRadius * Math.cos(phi)
        const z = currentRadius * Math.sin(phi)
        vertices.push(x, y, z)

        // Normal calculation
        const normal = new Vector3(x, y, z).normalize()
        normals.push(normal.x, normal.y, normal.z)
      }
    }

    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3))
    geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3))
    return geometry
  }, [])

  const gridMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        color: { value: new THREE.Color("white") },
        opacity: { value: 0.8 },
      },
      transparent: true,
      depthTest: true,
      depthWrite: false,
    })
  }, [])

  const gridLine = useMemo(() => {
    return new THREE.Line(gridGeometry, gridMaterial)
  }, [gridGeometry, gridMaterial])

  // Pink dots scattered on globe surface
  const dotsGeometry = useMemo(() => {
    const geometry = new BufferGeometry()
    const vertices: number[] = []
    const radius = 2.02 // Slightly above the grid surface

    // Generate random points on sphere surface
    for (let i = 0; i < 30; i++) {
      // Use spherical coordinates for even distribution
      const theta = Math.acos(1 - 2 * Math.random()) // Polar angle
      const phi = Math.random() * 2 * Math.PI // Azimuthal angle

      const x = radius * Math.sin(theta) * Math.cos(phi)
      const y = radius * Math.cos(theta)
      const z = radius * Math.sin(theta) * Math.sin(phi)

      vertices.push(x, y, z)
    }

    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3))
    return geometry
  }, [])

  const dotsMaterial = useMemo(() => {
    // Create a circular sprite texture for round points
    const size = 64
    const canvas = document.createElement("canvas")
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext("2d")!

    const center = size / 2
    const radius = size / 2

    ctx.clearRect(0, 0, size, size)
    const gradient = ctx.createRadialGradient(center, center, 0, center, center, radius)
    gradient.addColorStop(0.0, "rgba(255,255,255,1)")
    gradient.addColorStop(0.9, "rgba(255,255,255,1)")
    gradient.addColorStop(1.0, "rgba(255,255,255,0)")
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(center, center, radius, 0, Math.PI * 2)
    ctx.fill()

    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true
    texture.magFilter = THREE.LinearFilter
    texture.minFilter = THREE.LinearMipMapLinearFilter
    texture.generateMipmaps = true

    return new THREE.PointsMaterial({
      color: "#ff1493",
      size: 0.08,
      map: texture,
      alphaTest: 0.5,
      transparent: true,
      opacity: 0.9,
      depthTest: true,
      depthWrite: false,
      sizeAttenuation: true,
    })
  }, [])

  return (
    <group ref={globeRef}>
      {/* Invisible sphere for depth testing */}
      <mesh renderOrder={-1}>
        <sphereGeometry args={[1.98, 32, 32]} />
        <meshBasicMaterial opacity={0} depthWrite={true} depthTest={true} colorWrite={false} side={THREE.DoubleSide} />
      </mesh>

      {/* Grid lines with edge diffusion */}
      <primitive object={gridLine} />

      <points geometry={dotsGeometry} material={dotsMaterial} />
    </group>
  )
}
