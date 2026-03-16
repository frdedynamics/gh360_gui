import * as THREE from 'three';
import URDFLoader from 'urdf-loader';
/*
You'll get a bunch of warnings saying functions are unresolved due to the library not being downloaded locally,
however the program will still run in the browser.
*/
async function main() {
    // Creates a scene to show the diffent objects on screen, as well as a camera.
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 150);
    scene.add(camera);

    // Some variables for camera logic.
    const robotDistance = 0.6; // Set a desired distance from the robot for the camera.
    let theta = 0; // Angle for rotation around the robot.
    let phi = 0; // Angle for vertical positioning.

    camera.position.set(0.5, 0, robotDistance);
    camera.lookAt(0.25, 0, 0);

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

    // A list constaining all the names of the movable joints in the urdf
    const jointNames = ['shoulder_yaw', 'shoulder_roll', 'shoulder_pitch',
                                'upperarm_roll', 'elbow', 'forearm_roll', 'wrist_pitch'];

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

    // Camera control variable
    let isMouseDown = false;

    // Mouse event handlers. When mouse button is down it allows for moving the camera around the model.
    canvas.addEventListener('mousedown', (event) => {
        if (event.button === 0) { // Left mouse button
            isMouseDown = true;
        }
    });

    canvas.addEventListener('mouseup', () => {
        isMouseDown = false;
    });

    canvas.addEventListener('mousemove', (event) => {
        if (!isMouseDown) return;

        const deltaMove = {
            x: event.movementX,
            y: event.movementY
        };

        theta -= deltaMove.y * 0.005; // Rotate around Y axis
        phi -= deltaMove.x * 0.005;   // Rotate around X axis

        // Update camera position based on spherical coordinates
        camera.position.x = robotDistance * Math.sin(phi) * Math.cos(theta) + 0.5;
        camera.position.y = robotDistance * Math.sin(phi) * Math.sin(theta);
        camera.position.z = robotDistance * Math.cos(phi);

        camera.lookAt(0.25, 0, 0); // Make the camera look at the robot
    });

    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    animate();
}

main();