import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card.jsx";
import useRosStore from "@/store/rosStore.js";
import * as THREE from "three";
import URDFLoader from "urdf-loader";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// Constant for mapping a joint name to an index.
const JOINT_MAP = {
  shoulder_yaw: 0,
  shoulder_roll: 1,
  shoulder_pitch: 2,
  upperarm_roll: 3,
  elbow: 4,
  forearm_roll: 5,
  wrist_pitch: 6,
};

// Three.js model setup with optional 'ghost' paramater that creates another ghost robot if true.
function Model({ ghost }) {
  // Pointers
  const mountRef = useRef(null);
  const robotRef = useRef(null);
  const ghostRobotRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const sceneRef = useRef(null);
  // Variable used to check if a change that warrants a rerender occurred.
  const needsRenderRef = useRef(true);

  // Listens to both jointPositions (sliders in move robot page) and msgJointPositions (messages recieved from the robot).
  const jointPositions = useRosStore((s) => s.jointPositions);
  const msgJointPositions = useRosStore((s) => s.msgJointPositions);

  useEffect(() => {
    // "mount" used to contain the model environment.
    const mount = mountRef.current;
    if (!mount) return;

    // scene used to show the rendered objects and lights.
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup.
    const camera = new THREE.PerspectiveCamera(
      75,
      mount.clientWidth / mount.clientHeight,
      0.1,
      150,
    );
    camera.position.set(-0.5, 0, 1.3); // The camera start position.
    cameraRef.current = camera;

    // Renderer used to render the scene.
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(0xffffff);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls that allow the camera to orbit around a single point (roughly where the robot is).
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0.2, 0, 0.15);
    controls.update();
    controls.addEventListener("change", () => {
      needsRenderRef.current = true;
    });

    // 2 directional light sources. Can also use ambient light, but it has no shadows so the model melts together.
    const light1 = new THREE.DirectionalLight(0xffffff, 1);
    const light2 = new THREE.DirectionalLight(0xffffff, 1);
    light1.position.set(1, 1, 1);
    light2.position.set(-1, -1, -1);
    scene.add(light1, light2);

    // URDFLoader is needed to read the URDF file in order to set up the robot.
    const loader = new URDFLoader();
    loader.packages = { gh360: "/gh360-threejs-model" };
    loader.load("/gh360-threejs-model/urdf/gh360.urdf", (robot) => {
      scene.add(robot); // Adds the robot to the scene to make it visible.
      robotRef.current = robot; // add pointer to the robot.
      needsRenderRef.current = true; // Ask for rerender so the robot is loaded.
    });
    if (ghost) { // if ghost = true, load a second ghost robot with the ghost urdf (only actually used in move robot page).
      loader.load(
        "/gh360-threejs-model/urdf/gh360_ghost.urdf",
        (ghostRobot) => {
          ghostRobot.scale.set(1.0001, 1.0001, 1.0001); // tiny scale to avoid z-fighting.
          scene.add(ghostRobot); // add ghost to scene to make it visible.
          ghostRobotRef.current = ghostRobot; // pointer to the ghost robot.
          needsRenderRef.current = true; // ask for rerender.
        },
      );
    }

    // Method that fixes the look in case of resizing.
    const handleResize = () => {
      if (!mount) return; // if there is no mount, return.
      camera.aspect = mount.clientWidth / mount.clientHeight; // fix camera aspect ratio on resize.
      camera.updateProjectionMatrix(); // needs to be called after changing camera aspect.
      renderer.setSize(mount.clientWidth, mount.clientHeight); // fix the size of the render on resize to re-center the model.
      needsRenderRef.current = true; // ask for rerender.
    };
    const resizeObserver = new ResizeObserver(handleResize); // Tool that keeps track of resizing.
    resizeObserver.observe(mount); // Make resize observer look at mount.

    const loadDeadline = Date.now() + 3000; // 3 second deadline
    let animFrameId;
    const animate = () => {
      animFrameId = requestAnimationFrame(animate); // Make the browser animate the scene
      if (!needsRenderRef.current && Date.now() > loadDeadline) return; // return if it doesn't need a rerender or timed out
      renderer.render(scene, camera); // Render the scene and camera.
      needsRenderRef.current = false; // Rerender finished, no longer need to render.
    };
    animate(); // call animate function.

    // Cleanup.
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

  // Fires on every slider change
  useEffect(() => {
    if (!jointPositions || !ghost || !robotRef.current) return; // Check if everything is ready, return if not.

    Object.entries(JOINT_MAP).forEach(([name, index]) => { // Goes over every item in the JOINT_MAP
      const angle = jointPositions[index]; // Fetch angle for a given joint
      if (angle === undefined) return;
      robotRef.current.setJointValue(name, angle); // Move robot joint to the angle.
    });

    // Render immediately — don't wait for the next RAF tick
    if (rendererRef.current && cameraRef.current && sceneRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
    needsRenderRef.current = false;
  }, [jointPositions]); // Listens for when jointPositions changes.

  // fires on ROS feedback (message received)
  useEffect(() => {
    if (!msgJointPositions) return;

    // targetRobot set based on whether ghost is true or not.
    const targetRobot = ghost ? ghostRobotRef.current : robotRef.current;
    if (!targetRobot) return;

    Object.entries(JOINT_MAP).forEach(([name, index]) => { // Goes over every item in the JOINT_MAP
      const angle = msgJointPositions[index]; // Fetch angle for a given joint
      if (angle === undefined) return;
      targetRobot.setJointValue(name, angle); // Move robot joint to the angle.
    });

    // Render immediately — don't wait for the next RAF tick
    if (rendererRef.current && cameraRef.current && sceneRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  }, [msgJointPositions]); // Listens for when msgJointPositions changes.

  return (
    <div className="flex justify-center h-full flex-col">
      <Card className="w-full h-full p-0 overflow-hidden">
          {/* Set div to show the mount. */}
        <div ref={mountRef} className="w-full h-full min-h-0" />
      </Card>
    </div>
  );
}

export default Model;
