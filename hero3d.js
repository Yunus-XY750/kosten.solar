// ═══════════════════════════════════════════
// kosten.solar — 3D Hero (animated solar panel field, Three.js)
// Only loaded on index.html. Skips entirely on reduced-motion or if WebGL is unavailable.
// ═══════════════════════════════════════════
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

(function () {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const container = canvas.parentElement;
  let width = container.clientWidth, height = container.clientHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
  camera.position.set(0, 3.2, 9);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch (e) {
    return; // no WebGL — keep static gradient hero
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setSize(width, height);

  scene.add(new THREE.AmbientLight(0x2a3a2b, 1.4));
  const key = new THREE.PointLight(0xF0A500, 4, 30);
  key.position.set(4, 6, 6);
  scene.add(key);
  const rim = new THREE.PointLight(0x7FD94A, 2.2, 30);
  rim.position.set(-6, 2, -3);
  scene.add(rim);

  const group = new THREE.Group();
  scene.add(group);

  const panelGeo = new THREE.BoxGeometry(1.3, 0.06, 0.9);
  const edgesGeo = new THREE.EdgesGeometry(panelGeo);

  const cols = 7, rows = 5;
  const panels = [];
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const mat = new THREE.MeshStandardMaterial({ color: 0x18201a, metalness: 0.65, roughness: 0.3, emissive: 0x0a140b });
      const mesh = new THREE.Mesh(panelGeo, mat);
      const x = (i - (cols - 1) / 2) * 1.55;
      const z = (j - (rows - 1) / 2) * 1.15;
      mesh.position.set(x, 0, z);
      const edges = new THREE.LineSegments(edgesGeo, new THREE.LineBasicMaterial({ color: 0xF0A500, transparent: true, opacity: 0.5 }));
      mesh.add(edges);
      group.add(mesh);
      panels.push({ mesh, phase: Math.random() * Math.PI * 2 });
    }
  }
  group.rotation.x = 0.55;
  group.rotation.y = 0.35;
  group.position.set(0, -1.7, -1);

  let targetMX = 0, targetMY = 0;
  const heroEl = container;
  heroEl.addEventListener('pointermove', function (e) {
    const rect = heroEl.getBoundingClientRect();
    targetMX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    targetMY = ((e.clientY - rect.top) / rect.height) * 2 - 1;
  });

  function resize() {
    width = container.clientWidth; height = container.clientHeight;
    if (!width || !height) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }
  window.addEventListener('resize', resize);

  const clock = new THREE.Clock();
  let mx = 0, my = 0;
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    mx += (targetMX - mx) * 0.04;
    my += (targetMY - my) * 0.04;
    group.rotation.y = 0.35 + mx * 0.25;
    camera.position.x += (mx * 1.2 - camera.position.x) * 0.03;
    camera.position.y += (3.2 - my * 0.6 - camera.position.y) * 0.03;
    camera.lookAt(0, -0.5, 0);
    for (let k = 0; k < panels.length; k++) {
      panels[k].mesh.position.y = Math.sin(t * 0.6 + panels[k].phase) * 0.06;
    }
    renderer.render(scene, camera);
  }
  animate();
  requestAnimationFrame(function () { canvas.classList.add('ready'); });
})();
