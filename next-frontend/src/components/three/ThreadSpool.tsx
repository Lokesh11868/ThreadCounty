"use client";

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

export default function ThreadSpool({ className = '', size = 200 }) {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(3, 2, 3);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(3, 4, 2);
    scene.add(dirLight);

    // Spool body
    const spoolGeo = new THREE.CylinderGeometry(0.6, 0.6, 1.6, 32);
    const spoolMat = new THREE.MeshPhongMaterial({ color: 0xDDD8F0, shininess: 60, transparent: true, opacity: 0.8 });
    const spool = new THREE.Mesh(spoolGeo, spoolMat);
    scene.add(spool);

    // Spool caps
    const capGeo = new THREE.CylinderGeometry(0.9, 0.9, 0.08, 32);
    const capMat = new THREE.MeshPhongMaterial({ color: 0xC9E8D8, shininess: 80 });
    const topCap = new THREE.Mesh(capGeo, capMat);
    topCap.position.y = 0.84;
    scene.add(topCap);
    const botCap = new THREE.Mesh(capGeo, capMat);
    botCap.position.y = -0.84;
    scene.add(botCap);

    // Thread wrapping
    for (let i = 0; i < 8; i++) {
      const curve = [];
      for (let t = 0; t <= 100; t++) {
        const angle = (t / 100) * Math.PI * 6;
        const r = 0.65 + i * 0.005;
        const y = -0.7 + (t / 100) * 1.4;
        curve.push(new THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r));
      }
      const c = new THREE.CatmullRomCurve3(curve);
      const geo = new THREE.TubeGeometry(c, 100, 0.02, 6, false);
      const colors = [0x1A1F2E, 0xA59FD9, 0x9AC9B0];
      const mat = new THREE.MeshPhongMaterial({ color: colors[i % 3], shininess: 50 });
      scene.add(new THREE.Mesh(geo, mat));
    }

    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      scene.rotation.y += 0.008;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [size]);

  return <div ref={mountRef} className={className} style={{ width: size, height: size }} />;
}