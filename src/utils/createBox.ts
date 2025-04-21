import * as THREE from "three";

export const createWalls = (): { walls: THREE.Mesh[] } => {
  const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
  const transparentWallMaterial = new THREE.MeshStandardMaterial({
    color: 0xaaaaaa,
    transparent: true,
    opacity: 0.5,
  });
  const wallThickness = 0.5;

  const walls = [
    new THREE.Mesh(new THREE.BoxGeometry(20, 20, wallThickness), wallMaterial),
    new THREE.Mesh(
      new THREE.BoxGeometry(20, 20, wallThickness),
      transparentWallMaterial,
    ),
    new THREE.Mesh(new THREE.BoxGeometry(wallThickness, 20, 20), wallMaterial),
    new THREE.Mesh(new THREE.BoxGeometry(wallThickness, 20, 20), wallMaterial),
    new THREE.Mesh(new THREE.BoxGeometry(20, wallThickness, 20), wallMaterial),
  ];

  walls[0].position.set(0, 10, -10); // Front wall
  walls[1].position.set(0, 10, 10); // Back wall
  walls[2].position.set(-10, 10, 0); // Left wall
  walls[3].position.set(10, 10, 0); // Right wall
  walls[4].position.set(0, 0, 0); // Bottom wall

  return { walls };
};

export const createClaw = (): { claw: THREE.Mesh } => {
  const clawGeometry = new THREE.BoxGeometry(1, 0.5, 1);
  const clawMaterial = new THREE.MeshStandardMaterial({ color: 0xff4500 });
  const claw = new THREE.Mesh(clawGeometry, clawMaterial);
  claw.position.set(0, 5, 0);

  return { claw };
};

export const createGifts = (
  scene: THREE.Scene,
  count: number,
): { gifts: THREE.Object3D[]; boundingBoxes: THREE.Box3[] } => {
  const giftMaterialSphere = new THREE.MeshStandardMaterial({
    color: 0x00ff00,
  });
  const giftMaterialBox = new THREE.MeshStandardMaterial({ color: 0x0000ff });

  const gifts: THREE.Object3D[] = [];
  const boundingBoxes: THREE.Box3[] = [];

  const randomPosition = () => Math.random() * 18 - 9;

  for (let i = 0; i < count; i++) {
    const isSphere = Math.random() > 0.5;
    const geometry = isSphere
      ? new THREE.SphereGeometry(0.5, 16, 16)
      : new THREE.BoxGeometry(1, 1, 1);
    const material = isSphere ? giftMaterialSphere : giftMaterialBox;

    const gift = new THREE.Mesh(geometry, material);
    gift.position.set(randomPosition(), 0.5, randomPosition());
    gifts.push(gift);
    boundingBoxes.push(new THREE.Box3().setFromObject(gift));
    scene.add(gift);
  }

  return { gifts, boundingBoxes };
};
