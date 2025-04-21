import * as THREE from "three";

export function createScene(mountRef: HTMLDivElement) {
  // 建立場景
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb);

  // 建立相機
  const camera = new THREE.PerspectiveCamera(
    75,
    mountRef.clientWidth / mountRef.clientHeight,
    0.1,
    1000,
  );
  camera.position.set(0, 5, 15);

  // 建立渲染器
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(mountRef.clientWidth, mountRef.clientHeight);
  mountRef.appendChild(renderer.domElement);

  // 添加燈光
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 10, 5);
  scene.add(directionalLight);

  return { scene, camera, renderer };
}
