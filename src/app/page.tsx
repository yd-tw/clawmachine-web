"use client";

import * as THREE from "three";
import { JSX, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { createScene } from "../utils/createScene";
import { createClaw, createGifts, createWalls } from "../utils/createBox";
import gift from "../../public/gift.json";
import Link from "next/link";

type ControlsState = {
  left: boolean;
  right: boolean;
  forward: boolean;
  backward: boolean;
  grab: boolean;
};

export default function ClawMachine(): JSX.Element {
  const mountRef = useRef<HTMLDivElement>(null);
  const controlsStateRef = useRef<ControlsState>({
    left: false,
    right: false,
    forward: false,
    backward: false,
    grab: false,
  });

  const [giftInfo, setGiftInfo] = useState<boolean>(false);
  const [count, setCount] = useState<number>(1);

  useEffect(() => {
    if (!mountRef.current) return;
    const mountElement = mountRef.current;

    const { scene, camera, renderer } = createScene(mountRef.current);

    const { walls } = createWalls();
    const wallBoundingBoxes = walls.map((wall) => {
      scene.add(wall);
      return new THREE.Box3().setFromObject(wall);
    });

    const { claw } = createClaw();
    scene.add(claw);
    const clawBoundingBox = new THREE.Box3().setFromObject(claw);

    const { gifts, boundingBoxes: giftBoundingBoxes } = createGifts(scene, 20);

    let grabbing = false;
    let clawDirection = -0.1;
    const clawOriginalPosition = claw.position.clone();

    const handleGrab = () => {
      if (!grabbing) {
        grabbing = true;
        clawDirection = -0.1;
      }
    };

    const animate = () => {
      requestAnimationFrame(animate);

      const previousPosition = claw.position.clone();

      let offset = new THREE.Vector3(0, 0, 0);
      const controlsState = controlsStateRef.current;
      if (controlsState.left) offset = new THREE.Vector3(-0.1, 0, 0);
      if (controlsState.right) offset = new THREE.Vector3(0.1, 0, 0);
      if (controlsState.forward) claw.position.z += -0.1;
      if (controlsState.backward) claw.position.z += 0.1;
      if (controlsState.grab) handleGrab();

      claw.position.add(offset);

      if (grabbing) {
        claw.position.y += clawDirection;
        clawBoundingBox.setFromObject(claw);

        for (let i = 0; i < gifts.length; i++) {
          if (clawBoundingBox.intersectsBox(giftBoundingBoxes[i])) {
            const gift = gifts[i];
            scene.remove(gift);
            gifts.splice(i, 1);
            giftBoundingBoxes.splice(i, 1);

            setGiftInfo(true);

            break;
          }
        }

        if (claw.position.y <= 0.5) {
          clawDirection = 0.05;
        }

        if (claw.position.y >= clawOriginalPosition.y) {
          claw.position.y = clawOriginalPosition.y;
          grabbing = false;
        }
      }

      clawBoundingBox.setFromObject(claw);
      walls.forEach((wall, index) => {
        wallBoundingBoxes[index].setFromObject(wall);
      });

      if (wallBoundingBoxes.some((box) => clawBoundingBox.intersectsBox(box))) {
        claw.position.copy(previousPosition);
        offset = new THREE.Vector3(0, 0, 0);
      }

      camera.position.add(offset);
      const target = new THREE.Vector3();
      camera.getWorldDirection(target);
      target.add(camera.position);
      camera.lookAt(target);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      mountElement.removeChild(renderer.domElement);
    };
  }, []);

  const handleJoystickMove = (direction: string, active: boolean) => {
    const controlsState = controlsStateRef.current;

    if (direction === "left") controlsState.left = active;
    if (direction === "right") controlsState.right = active;
    if (direction === "up") controlsState.forward = active;
    if (direction === "down") controlsState.backward = active;
    if (direction === "grab") controlsState.grab = active;
  };

  return (
    <div ref={mountRef} className="w-screen h-screen relative">
      {giftInfo && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white w-3/4 h-2/3 p-10 rounded-lg shadow-2xl text-center z-10">
          <button
            onClick={() => {
              setGiftInfo(false);
              setCount((prevCount) => prevCount + 1);
            }}
            className="absolute top-4 right-4 bg-gray-200 hover:bg-gray-300 text-gray-600 rounded-full p-3 focus:outline-hidden"
          >
            ✖
          </button>
          <div className="flex flex-col items-center justify-center h-full">
            <Image
              src={gift[count].image}
              alt="Gift"
              width={200}
              height={200}
              layout="intrinsic"
              className="object-contain"
            />
            <p className="mt-6 text-2xl font-semibold">{gift[count].name}</p>
            <p className="mb-6 text-bg font-semibold">{gift[count].describe}</p>
            {count < 3 ? (
              <p className="mt-4 text-lg">再 {3 - count} 次出現特別禮物</p>
            ) : (
              <Link href="/end">
                <span className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg text-lg">
                  點開紙條
                </span>
              </Link>
            )}
          </div>
        </div>
      )}

      <div className="absolute bottom-10 left-5 flex flex-col items-center gap-2">
        <button
          onTouchStart={() => handleJoystickMove("up", true)}
          onTouchEnd={() => handleJoystickMove("up", false)}
          className="w-14 h-14 bg-red-200 rounded-full flex select-none items-center justify-center text-xl font-bold"
        >
          ↑
        </button>
        <div className="flex gap-2">
          <button
            onTouchStart={() => handleJoystickMove("left", true)}
            onTouchEnd={() => handleJoystickMove("left", false)}
            className="w-14 h-14 bg-red-200 rounded-full flex select-none items-center justify-center text-xl font-bold"
          >
            ←
          </button>
          <button
            onTouchStart={() => handleJoystickMove("grab", true)}
            onTouchEnd={() => handleJoystickMove("grab", false)}
            className="w-14 h-14 bg-red-200 rounded-full flex select-none items-center justify-center text-xl font-bold"
          >
            抓
          </button>
          <button
            onTouchStart={() => handleJoystickMove("right", true)}
            onTouchEnd={() => handleJoystickMove("right", false)}
            className="w-14 h-14 bg-red-200 rounded-full flex select-none items-center justify-center text-xl font-bold"
          >
            →
          </button>
        </div>
        <button
          onTouchStart={() => handleJoystickMove("down", true)}
          onTouchEnd={() => handleJoystickMove("down", false)}
          className="w-14 h-14 bg-red-200 rounded-full flex select-none items-center justify-center text-xl font-bold"
        >
          ↓
        </button>
      </div>
    </div>
  );
}
