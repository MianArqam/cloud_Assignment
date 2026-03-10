import * as THREE from 'https://unpkg.com/three@0.169.0/build/three.module.js';

export function initThreeHero(canvasEl) {
  if (!canvasEl) return () => {};

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
  camera.position.set(0, 0, 6);

  const renderer = new THREE.WebGLRenderer({ canvas: canvasEl, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const ambient = new THREE.AmbientLight(0xffffff, 0.8);
  const point = new THREE.PointLight(0x88aaff, 1.4, 40);
  point.position.set(2.8, 2.6, 4);
  scene.add(ambient, point);

  const knot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(1.2, 0.34, 180, 32),
    new THREE.MeshPhysicalMaterial({
      color: 0x9b87ff,
      roughness: 0.2,
      metalness: 0.1,
      transmission: 0.5,
      thickness: 1.4,
      transparent: true,
      opacity: 0.9
    })
  );

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(2.2, 0.06, 16, 150),
    new THREE.MeshStandardMaterial({ color: 0x2fd7ff, emissive: 0x193cff, emissiveIntensity: 0.28 })
  );

  scene.add(knot, ring);

  const pointer = { x: 0, y: 0 };
  const onPointerMove = (e) => {
    const rect = canvasEl.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  };

  const resize = () => {
    const rect = canvasEl.getBoundingClientRect();
    const width = Math.max(280, rect.width);
    const height = Math.max(220, rect.height);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  window.addEventListener('resize', resize);
  canvasEl.addEventListener('pointermove', onPointerMove);
  resize();

  let raf = 0;
  const clock = new THREE.Clock();

  const animate = () => {
    const t = clock.getElapsedTime();

    knot.rotation.x += 0.004 + pointer.y * 0.0009;
    knot.rotation.y += 0.006 + pointer.x * 0.0012;
    knot.position.y = Math.sin(t * 1.4) * 0.18;

    ring.rotation.z = t * 0.35;
    ring.rotation.x = Math.sin(t * 0.8) * 0.35;

    camera.position.x += ((pointer.x * 0.75) - camera.position.x) * 0.04;
    camera.position.y += ((pointer.y * 0.55) - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
    raf = requestAnimationFrame(animate);
  };

  animate();

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
    canvasEl.removeEventListener('pointermove', onPointerMove);
    knot.geometry.dispose();
    ring.geometry.dispose();
    knot.material.dispose();
    ring.material.dispose();
    renderer.dispose();
  };
}
