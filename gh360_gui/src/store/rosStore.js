import { create } from "zustand";
import * as ROSLIB from "roslib";

const FPS = 20;
const FRAME_TIME = 1000 / FPS;

let latestJoint = null;
let latestMotor = null;
let intervalId = null;

const useRosStore = create((set, get) => ({
  ros: null,
  status: "disconnected",
  intentionalDisconnect: false,

  jointPositions: null,
  motorStates: null,

  jointTopic: null,
  motorTopic: null,

  startRenderLoop: () => {
    if (intervalId) return;

    intervalId = setInterval(() => {
      if (!latestJoint && !latestMotor) return;

      set({
        jointPositions: latestJoint?.position ?? null,
        motorStates: latestMotor?.motors ?? null,
      });
    }, FRAME_TIME);
  },

  stopRenderLoop: () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  },

  subscribeToTopics: () => {
    const ros = get().ros;
    if (!ros) return;

    get().unsubscribeFromTopics();

    const jointTopic = new ROSLIB.Topic({
      ros,
      name: "/gh360/joint_states",
      messageType: "sensor_msgs/msg/JointState",
    });

    const motorTopic = new ROSLIB.Topic({
      ros,
      name: "/gh360/motor_states_sorted",
      messageType: "gh360_interfaces/msg/PortStatus",
    });

    jointTopic.subscribe((msg) => {
      latestJoint = msg;
    });

    motorTopic.subscribe((msg) => {
      latestMotor = msg;
    });

    set({ jointTopic, motorTopic });
    get().startRenderLoop();
  },

  unsubscribeFromTopics: () => {
    const { jointTopic, motorTopic } = get();

    jointTopic?.unsubscribe();
    motorTopic?.unsubscribe();

    get().stopRenderLoop();

    latestJoint = null;
    latestMotor = null;

    set({
      jointTopic: null,
      motorTopic: null,
      jointPositions: null,
      motorStates: null,
    });
  },

  connect: () => {
    const url = import.meta.env.VITE_ROSBRIDGE_SERVER || "ws://localhost:9090";

    set({ status: "connecting", intentionalDisconnect: false });

    const ros = new ROSLIB.Ros({ url });

    ros.on("connection", () => {
      set({ status: "connected", ros });
      get().subscribeToTopics();
    });

    ros.on("error", () => {
      set({ status: "error" });
    });

    ros.on("close", () => {
      get().unsubscribeFromTopics();

      set({
        status: "disconnected",
        ros: null,
      });

      if (!get().intentionalDisconnect) {
        setTimeout(() => get().connect(), 2000);
      }
    });
  },

  disconnect: () => {
    set({ intentionalDisconnect: true });

    get().unsubscribeFromTopics();
    get().ros?.close();
  },

  reconnect: () => {
    const ros = get().ros;

    set({ intentionalDisconnect: true });

    if (ros) {
      get().unsubscribeFromTopics();

      ros.once("close", () => {
        get().connect();
      });

      ros.close();
    } else {
      get().connect();
    }
  },
}));

export default useRosStore;
