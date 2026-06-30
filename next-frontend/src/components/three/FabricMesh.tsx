"use client";

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

export default function FabricMesh({ className = '', height = 500 }) {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth;
    const h = height;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / h, 0.1, 1000);
    camera.position.set(0, 2, 6);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xddd8f0, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xc9e8d8, 0.5, 20);
    pointLight.position.set(-3, 3, 3);
    scene.add(pointLight);

    // Weave threads - warp (vertical)
    const warpGroup = new THREE.Group();
    const weftGroup = new THREE.Group();
    const threadMat1 = new THREE.MeshPhongMaterial({ color: 0x1A1F2E, shininess: 80 });
    const threadMat2 = new THREE.MeshPhongMaterial({ color: 0xA59FD9, shininess: 80 });
    const threadMat3 = new THREE.MeshPhongMaterial({ color: 0x9AC9B0, shininess: 80 });

    const mats = [threadMat1, threadMat2, threadMat3];
    const threadRadius = 0.04;
    const spacing = 0.3;
    const threadCount = 14;
    const halfSpan = (threadCount - 1) * spacing / 2;

    // Create warp threads (along Z)
    for (let i = 0; i < threadCount; i++) {
      const curve = new THREE.CatmullRomCurve3([]);
      const x = -halfSpan + i * spacing;
      const points = [];
      for (let j = 0; j <= 20; j++) {
        const z = -3 + j * 0.3;
        const yOff = Math.sin(j * Math.PI + i * Math.PI) * 0.08;
        points.push(new THREE.Vector3(x, yOff, z));
      }
      const c = new THREE.CatmullRomCurve3(points);
      const geo = new THREE.TubeGeometry(c, 40, threadRadius, 8, false);
      const mesh = new THREE.Mesh(geo, mats[i % 3]);
      warpGroup.add(mesh);
    }

    // Create weft threads (along X)
    for (let j = 0; j < threadCount; j++) {
      const z = -halfSpan + j * spacing;
      const points = [];
      for (let i = 0; i <= 20; i++) {
        const x = -3 + i * 0.3;
        const yOff = Math.sin(i * Math.PI + j * Math.PI + Math.PI / 2) * 0.08;
        points.push(new THREE.Vector3(x, yOff, z));
      }
      const c = new THREE.CatmullRomCurve3(points);
      const geo = new THREE.TubeGeometry(c, 40, threadRadius, 8, false);
      const mesh = new THREE.Mesh(geo, mats[(j + 1) % 3]);
      weftGroup.add(mesh);
    }

    scene.add(warpGroup);
    scene.add(weftGroup);

    // Floating particles
    const particleGeo = new THREE.BufferGeometry();
    const particleCount = 60;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({ color: 0xDDD8F0, size: 0.05, transparent: true, opacity: 0.6 });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      warpGroup.rotation.y += 0.002;
      weftGroup.rotation.y += 0.002;
      particles.rotation.y += 0.001;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const w = container.clientWidth;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [height]);

  return <div ref={mountRef} className={className} style={{ width: '100%', height }} />;
}