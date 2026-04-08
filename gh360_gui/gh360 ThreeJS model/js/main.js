import * as THREE from 'three';
import URDFLoader from 'urdf-loader';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
/*
You'll get a bunch of warnings saying functions are unresolved due to the library not being downloaded locally,
however the program will still run in the browser.
*/
async function main() {
    // Creates a scene to show the diffent objects on screen, as well as a camera.
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 150);
    scene.add(camera);

    camera.position.set(0.3, -0.2, 0.75);
    camera.lookAt(0.3, -0.2, 0);

    // Sets up a canvas to use for eventlisteners needed for camera logic.
    const canvas = document.createElement('canvas');

    // Sets up the renderer for rendering the model of the arm.
    const renderer = new THREE.WebGLRenderer({canvas, antialias: true });
    renderer.setClearColor(0xffffff); // Sets background to white. Default is black.
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement); // Ads the renderer to the html document body so it becomes visible.

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    const controls = new OrbitControls( camera, renderer.domElement );
    controls.target.set( 0.3, -0.1, 0 );
    controls.update();

    const loader = new URDFLoader();
    loader.meshLoader = (geometry, done) => {
        // Creates a mesh of the geometry for the URDFLoader
        const material = new THREE.MeshStandardMaterial({ color: 0x888888 });
        const mesh = new THREE.Mesh(geometry, material);
        done(mesh);
    };
    /* Fetches the meshes for the different components of the robot
    (automatically ads "/meshes" to the path, thus leaving it with just ".", as the paths are from the html).
     */
    loader.packages = {
        gh360: '.'
    };
    // Variable used for accessing the robot object.
    let robotObj;

    // fetches the urdf file to create the mesh of the robot.
    loader.load('./urdf/gh360.urdf', robot => {
        scene.add(robot);

        robotObj = robot;
    });

    /*
    A function for changing the angle of a named joint.
    See jointNames variable for a list of all the names of movable joints.
     */
    function moveJoint(jointName, angle) {
        robotObj.setJointValue( jointName, angle );
    }

    /*
    A function for getting the current angle of a given joint in radians.
     */
    function getJoint(jointName) {
        return robotObj.joints[jointName].jointValue;
    }

    window.moveJoint = function (jointName, angle) {
        return moveJoint(jointName, angle);
    };
    window.getJoint = function (jointName) {
        return getJoint(jointName);
    };

    // Ads lights on boths sides of the robot so neither side is too dark (ambientlight was ugly as the was no shadows).
    const light1 = new THREE.DirectionalLight(0xffffff, 1);
    const light2 = new THREE.DirectionalLight(0xffffff, 1);
    light1.position.set(1, 1, 1);
    light2.position.set(-1, -1, -1);
    scene.add(light1);
    scene.add(light2);

    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    animate();
}

main();