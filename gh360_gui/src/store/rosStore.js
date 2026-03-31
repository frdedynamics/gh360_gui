import { create } from "zustand";
import * as ROSLIB from "roslib";

//Creating a custom hook, without having to wrap everything in a provider.
//The purpose of this class is to mange the connection to ROS with status indicators.
const useRosStore = create((set, get) => ({
  //Initial state
  ros: null,
  status: "disconnected", // connecting, connected, disconnect

  //Initial topic states
  jointMessage: null,
  motorMessage: null,

  cameraMessage: null,
  arucoMessage: null,

  //Function used to subscribe to different topics
  subscribeToTopics: () => {
    const ros = get().ros;
    if (!ros) return;

    const jointTopic = new ROSLIB.Topic({
      ros,
      name: "/gh360/joint_states",
      messageType: "sensor_msgs/msg/JointState",
      throttle_rate: 100,
    });

    const motorTopic = new ROSLIB.Topic({
      ros,
      name: "/gh360/motor_states_sorted",
      messageType: "gh360_interfaces/msg/PortStatus",
      throttle_rate: 100,
    });

    const cameraTopic = new ROSLIB.Topic({
      ros,
      name: "/camera/color/image_raw",
      messageType: "sensor_msgs/msg/Image",
      throttle_rate: 100,
    });

    const arucoTopic = new ROSLIB.Topic({
      ros,
      name: "/door/aruco_markers",
      messageType: "ros2_aruco_interfaces/msg/ArucoMarkers",
      throttle_rate: 100,
    });
    cameraTopic.subscribe((msg) => set({ cameraMessage: msg }))
    arucoTopic.subscribe((msg) => set({ arucoMessage: msg }))
    jointTopic.subscribe((msg) => set({ jointMessage: msg }));
    motorTopic.subscribe((msg) => set({ motorMessage: msg }));
  },

  //Function used to start the connection to the rosbridge server
  connect: () => {
    const url = import.meta.env.VITE_ROSBRIDGE_SERVER || "ws://localhost:9090";

    set({ status: "connecting" });

    const ros = new ROSLIB.Ros({ url });

    ros.on("connection", () => {
      set({ status: "connected", ros });
      //The subscription to the different topics happends here after connection, so it ensures that we are connect before subscribing.
      get().subscribeToTopics();
    });
    ros.on("error", () => set({ status: "error" }))
    ros.on("close", () =>
      set({
        status: "close",
        ros: null,
        jointMessage: null,
        motorMessage: null,
        cameraMessage: null,
        arucoMessage: null,
      }),
    );
  },

  //Function to disconnect the connection.
  disconnect: () => {
    get().ros?.close();
    set({
      ros: null,
      status: "disconnected",
      motorMessage: null,
      jointMessage: null,
      arucoMessage: null,
      cameraMessage: null,
    });
  },
}));

export default useRosStore;
