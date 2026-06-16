import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function FairyDust() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    let width = window.innerWidth;
    let height = window.innerHeight;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(
      60,
      width / height,
      1,
      1000
    );

    camera.position.set(0, 0, 40);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    container.appendChild(renderer.domElement);

    // Mouse tracking
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Resize
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Shader uniforms
    const gu = {
      time: { value: 0 },
    };

    const pts = [];
    const sizes = [];
    const shift = [];

    const pushShift = () => {
      shift.push(
        Math.random() * Math.PI,
        Math.random() * Math.PI * 2,
        (Math.random() * 0.5 + 0.05) * Math.PI * 0.05,
        Math.random() * 0.5 + 0.05
      );
    };

    // ==================================================
    // FAIRY DUST PARTICLES
    // ==================================================

    const PARTICLE_COUNT = 6000;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      sizes.push(Math.random() * 1.2 + 0.3);
      pushShift();

      pts.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 80,
          (Math.random() - 0.5) * 40,
          (Math.random() - 0.5) * 80
        )
      );
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(pts);

    geometry.setAttribute(
      'sizes',
      new THREE.Float32BufferAttribute(sizes, 1)
    );

    geometry.setAttribute(
      'shift',
      new THREE.Float32BufferAttribute(shift, 4)
    );

    const material = new THREE.PointsMaterial({
      size: 0.125,
      transparent: true,
      depthTest: false,
      blending: THREE.AdditiveBlending,

      onBeforeCompile: (shader) => {
        shader.uniforms.time = gu.time;

        shader.vertexShader = `
          uniform float time;
          attribute float sizes;
          attribute vec4 shift;
          varying vec3 vColor;
          ${shader.vertexShader}
        `
          .replace(
            `gl_PointSize = size;`,
            `
            gl_PointSize = size * sizes;
          `
          )
          .replace(
            `#include <color_vertex>`,
            `
            #include <color_vertex>

            float colorMix =
              fract(position.x * 0.03 + position.z * 0.02);

            vColor = mix(
              vec3(255.,190.,35.),
              vec3(255.,235.,180.),
              colorMix * 0.6
            ) / 255.;
          `
          )
          .replace(
            `#include <begin_vertex>`,
            `
            #include <begin_vertex>

            float t = time;

            float moveT =
              mod(shift.x + shift.z * t, PI2);

            float moveS =
              mod(shift.y + shift.z * t, PI2);

            transformed += vec3(
              cos(moveS) * sin(moveT),
              cos(moveT),
              sin(moveS) * sin(moveT)
            ) * shift.a;
          `
          );

        shader.fragmentShader = `
          varying vec3 vColor;
          ${shader.fragmentShader}
        `
          .replace(
            `void main() {`,
            `
            void main() {

              float d =
                length(gl_PointCoord.xy - 0.5);
          `
          )
          .replace(
            `vec4 diffuseColor = vec4( diffuse, opacity );`,
            `
            vec4 diffuseColor =
              vec4(
                vColor,
                smoothstep(
                  0.45,
                  0.05,
                  d
                ) * 0.75
              );
          `
          );
      },
    });

    const particles = new THREE.Points(
      geometry,
      material
    );

    particles.rotation.order = 'ZYX';

    scene.add(particles);

    const clock = new THREE.Clock();

    let animationFrameId;

    let currentRotationX = 0.15;
    let currentRotationY = 0;

    const animate = () => {
      const t = clock.getElapsedTime() * 0.5;

      gu.time.value = t * Math.PI;

      const targetRotationX =
        0.15 + mouseY * 0.05;

      const targetRotationY =
        mouseX * 0.05;

      currentRotationX = THREE.MathUtils.lerp(
        currentRotationX,
        targetRotationX,
        0.05
      );

      currentRotationY = THREE.MathUtils.lerp(
        currentRotationY,
        targetRotationY,
        0.05
      );

      particles.rotation.x =
        currentRotationX;

      particles.rotation.y =
        currentRotationY;

      renderer.render(scene, camera);

      animationFrameId =
        requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);

      window.removeEventListener(
        'mousemove',
        handleMouseMove
      );

      window.removeEventListener(
        'resize',
        handleResize
      );

      geometry.dispose();
      material.dispose();
      renderer.dispose();

      if (
        container.contains(
          renderer.domElement
        )
      ) {
        container.removeChild(
          renderer.domElement
        );
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fairy-dust-background"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 8,
        overflow: 'hidden',
      }}
    />
  );
}