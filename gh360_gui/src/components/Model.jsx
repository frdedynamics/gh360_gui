import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card.jsx";
import useRosStore from "@/store/rosStore.js";
import * as THREE from "three";
import URDFLoader from "urdf-loader";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const JOINT_MAP = {
  shoulder_yaw: 0,
  shoulder_roll: 1,
  shoulder_pitch: 2,
  upperarm_roll: 3,
  elbow: 4,
  forearm_roll: 5,
  wrist_pitch: 6,
};

function Model({ ghost }) {
  const mountRef = useRef(null);
  const robotRef = useRef(null);
  const ghostRobotRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const sceneRef = useRef(null);
  const needsRenderRef = useRef(true);

  const jointPositions = useRosStore((s) => s.jointPositions);
  const msgJointPositions = useRosStore((s) => s.msgJointPositions);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      mount.clientWidth / mount.clientHeight,
      0.1,
      150,
    );
    scene.add(camera);
    camera.position.set(-0.5, 0, 1.3);
    camera.lookAt(0, -0.2, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(0xffffff);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0.2, 0, 0.15);
    controls.update();
    controls.addEventListener("change", () => {
      needsRenderRef.current = true;
    });

    const light1 = new THREE.DirectionalLight(0xffffff, 1);
    const light2 = new THREE.DirectionalLight(0xffffff, 1);
    light1.position.set(1, 1, 1);
    light2.position.set(-1, -1, -1);
    scene.add(light1, light2);

    const loader = new URDFLoader();
    loader.packages = { gh360: "/gh360-threejs-model" };
    loader.load("/gh360-threejs-model/urdf/gh360.urdf", (robot) => {
      scene.add(robot);
      robotRef.current = robot;
      needsRenderRef.current = true;
    });
    if (ghost) {
      loader.load(
        "/gh360-threejs-model/urdf/gh360_ghost.urdf",
        (ghostRobot) => {
          // tiny scale to avoid z-fighting
          ghostRobot.scale.set(1.0001, 1.0001, 1.0001);
          scene.add(ghostRobot);
          ghostRobotRef.current = ghostRobot;
          needsRenderRef.current = true;
        },
      );
    }

    const handleResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      needsRenderRef.current = true;
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(mount);

    const loadDeadline = Date.now() + 3000;
    let animFrameId;
    const animate = () => {
      animFrameId = requestAnimationFrame(animate);
      if (!needsRenderRef.current && Date.now() > loadDeadline) return;
      renderer.render(scene, camera);
      needsRenderRef.current = false;
    };
    animate();

    return () => {
      cancelAnimationFrame(animFrameId);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement))
        mount.removeChild(renderer.domElement);
      robotRef.current = null;
      rendererRef.current = null;
      cameraRef.current = null;
      sceneRef.current = null;
    };
  }, []);

  // Fires on every slider
  useEffect(() => {
    if (!jointPositions || !ghost || !robotRef.current) return;

    Object.entries(JOINT_MAP).forEach(([name, index]) => {
      const angle = jointPositions[index];
      if (angle === undefined) return;
      robotRef.current.setJointValue(name, angle);
    });

    // Render immediately — don't wait for the next RAF tick
    if (rendererRef.current && cameraRef.current && sceneRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
    needsRenderRef.current = false;
  }, [jointPositions]);

  // fires on ROS feedback
  useEffect(() => {
    if (!msgJointPositions) return;

    const targetRobot = ghost ? ghostRobotRef.current : robotRef.current;
    if (!targetRobot) return;

    Object.entries(JOINT_MAP).forEach(([name, index]) => {
      const angle = msgJointPositions[index];
      if (angle === undefined) return;
      targetRobot.setJointValue(name, angle);
    });

    // Render immediately — don't wait for the next RAF tick
    if (rendererRef.current && cameraRef.current && sceneRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
    needsRenderRef.current = false;
  }, [msgJointPositions]);

  return (
    <div className="flex justify-center h-full flex-col">
      <Card className="w-full h-full p-0 overflow-hidden">
        <div ref={mountRef} className="w-full h-full min-h-0" />
      </Card>
    </div>
  );
}

export default Model;
