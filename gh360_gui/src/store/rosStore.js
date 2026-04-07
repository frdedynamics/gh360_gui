import { create } from "zustand";
import * as ROSLIB from "roslib";

const useRosStore = create((set, get) => ({
  ros: null,
  status: "disconnected",
  intentionalDisconnect: false,

  jointMessage: null,
  motorMessage: null,

  jointTopic: null,
  motorTopic: null,

  subscribeToTopics: () => {
    const ros = get().ros;
    if (!ros) return;

    // Prevent duplicate subscriptions
    get().unsubscribeFromTopics();

    const jointTopic = new ROSLIB.Topic({
      ros,
      name: "/gh360/joint_states",
      messageType: "sensor_msgs/msg/JointState",
      throttle_rate: 200,
    });

    const motorTopic = new ROSLIB.Topic({
      ros,
      name: "/gh360/motor_states_sorted",
      messageType: "gh360_interfaces/msg/PortStatus",
      throttle_rate: 200,
    });

    jointTopic.subscribe((msg) => set({ jointMessage: msg }));
    motorTopic.subscribe((msg) => set({ motorMessage: msg }));

    set({ jointTopic, motorTopic });
  },

  unsubscribeFromTopics: () => {
    const { jointTopic, motorTopic } = get();

    jointTopic?.unsubscribe();
    motorTopic?.unsubscribe();

    set({
      jointTopic: null,
      motorTopic: null,
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
        jointMessage: null,
        motorMessage: null,
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

    // force intentional disconnect
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
