import React, { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

type DotUniforms = {
  u_time: { value: number };
  u_mouse: { value: THREE.Vector2 };
  u_resolution: { value: THREE.Vector2 };
  u_dot_size: { value: number };
  u_total_size: { value: number };
  u_opacities: { value: number[] };
  u_colors: { value: THREE.Vector3[] };
};

const opacities = [0.3, 0.3, 0.3, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 1.0];
const dotColors = [
  new THREE.Vector3(160 / 255, 185 / 255, 215 / 255),
  new THREE.Vector3(160 / 255, 185 / 255, 215 / 255),
  new THREE.Vector3(160 / 255, 185 / 255, 215 / 255),
  new THREE.Vector3(175 / 255, 198 / 255, 225 / 255),
  new THREE.Vector3(175 / 255, 198 / 255, 225 / 255),
  new THREE.Vector3(175 / 255, 198 / 255, 225 / 255),
];

const fragmentShader = `
  precision mediump float;
  in vec2 fragCoord;

  uniform float u_time;
  uniform vec2 u_mouse;
  uniform vec2 u_resolution;
  uniform float u_dot_size;
  uniform float u_total_size;
  uniform float u_opacities[10];
  uniform vec3 u_colors[6];

  out vec4 fragColor;

  float PHI = 1.61803398874989484820459;

  float random(vec2 xy) {
    return fract(tan(distance(xy * PHI, xy) * 0.5) * xy.x);
  }

  void main() {
    vec2 mouse_offset = (u_mouse - vec2(0.5)) * 6.0;
    vec2 st = fragCoord.xy + mouse_offset;

    st.x -= abs(floor((mod(u_resolution.x, u_total_size) - u_dot_size) * 0.5));
    st.y -= abs(floor((mod(u_resolution.y, u_total_size) - u_dot_size) * 0.5));

    float opacity = step(0.0, st.x) * step(0.0, st.y);
    vec2 st2 = vec2(int(st.x / u_total_size), int(st.y / u_total_size));

    vec2 cell_center = (st2 + 0.5) * u_total_size;
    vec2 mouse_px = u_mouse * u_resolution;
    float cursor_influence = smoothstep(85.0, 0.0, distance(cell_center, mouse_px));
    float magnify = 1.0 + cursor_influence * 0.07;

    vec2 local = st - st2 * u_total_size;
    vec2 centered = (local - vec2(u_total_size * 0.5)) / magnify + vec2(u_total_size * 0.5);

    float frequency = 5.0;
    float show_offset = random(st2);
    float rand = random(st2 * floor((u_time / frequency) + show_offset + frequency));
    opacity *= u_opacities[int(rand * 10.0)];
    opacity *= 1.0 - step(u_dot_size / u_total_size, centered.x / u_total_size);
    opacity *= 1.0 - step(u_dot_size / u_total_size, centered.y / u_total_size);

    vec3 color = u_colors[int(show_offset * 6.0)];

    float animation_speed_factor = 0.5;
    vec2 center_grid = u_resolution / 2.0 / u_total_size;
    float dist_from_center = distance(center_grid, st2);
    float timing_offset_intro = dist_from_center * 0.01 + random(st2) * 0.15;

    opacity *= step(timing_offset_intro, u_time * animation_speed_factor);
    opacity *= clamp(
      (1.0 - step(timing_offset_intro + 0.1, u_time * animation_speed_factor)) * 1.25,
      1.0,
      1.25
    );

    opacity *= 1.0 + cursor_influence * 0.08;
    color *= 1.0 + cursor_influence * 0.05;

    fragColor = vec4(color, opacity);
    fragColor.rgb *= fragColor.a;
  }
`;

const vertexShader = `
  precision mediump float;
  uniform vec2 u_resolution;
  out vec2 fragCoord;

  void main() {
    gl_Position = vec4(position.xy, 0.0, 1.0);
    fragCoord = (position.xy + vec2(1.0)) * 0.5 * u_resolution;
    fragCoord.y = u_resolution.y - fragCoord.y;
  }
`;

const DotMatrixPlane: React.FC = () => {
  const { size } = useThree();
  const meshRef = useRef<THREE.Mesh>(null);
  const mouse = useRef({ x: 0.5, y: 0.5 });
  const lerpedMouse = useRef({ x: 0.5, y: 0.5 });

  const uniforms = useMemo<DotUniforms>(
    () => ({
      u_time: { value: 0 },
      u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
      u_resolution: { value: new THREE.Vector2(size.width * 2, size.height * 2) },
      u_dot_size: { value: 6 },
      u_total_size: { value: 20 },
      u_opacities: { value: opacities },
      u_colors: { value: dotColors },
    }),
    [size.width, size.height]
  );

  useEffect(() => {
    uniforms.u_resolution.value.set(size.width * 2, size.height * 2);
  }, [size.width, size.height, uniforms]);

  useEffect(() => {
    const updateMouse = (event: PointerEvent) => {
      mouse.current.x = event.clientX / window.innerWidth;
      mouse.current.y = 1 - event.clientY / window.innerHeight;
    };

    window.addEventListener('pointermove', updateMouse, { passive: true });
    return () => window.removeEventListener('pointermove', updateMouse);
  }, []);

  useFrame(({ clock }) => {
    const material = meshRef.current?.material as THREE.ShaderMaterial | undefined;
    if (!material) return;

    lerpedMouse.current.x += (mouse.current.x - lerpedMouse.current.x) * 0.05;
    lerpedMouse.current.y += (mouse.current.y - lerpedMouse.current.y) * 0.05;

    material.uniforms.u_time.value = clock.getElapsedTime();
    material.uniforms.u_mouse.value.set(lerpedMouse.current.x, lerpedMouse.current.y);
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        glslVersion={THREE.GLSL3}
        transparent
        blending={THREE.CustomBlending}
        blendSrc={THREE.SrcAlphaFactor}
        blendDst={THREE.OneFactor}
        depthWrite={false}
      />
    </mesh>
  );
};

export const BackgroundEffect: React.FC = () => (
  <div className="pointer-events-none absolute inset-0 h-full w-full overflow-hidden bg-[#020617]">
    <Canvas
      className="absolute inset-0 h-full w-full"
      dpr={[1, 2]}
      gl={{ antialias: false, alpha: false }}
      onCreated={({ gl }) => {
        gl.setClearColor('#020617');
      }}
    >
      <DotMatrixPlane />
    </Canvas>
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(2,6,23,1)_0%,transparent_100%)]" />
    <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-[#020617] to-transparent" />
  </div>
);

export default BackgroundEffect;
