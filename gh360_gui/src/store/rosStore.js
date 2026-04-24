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
  jointPublisher: null,
  jointPositions: null,
  motorStates: null,

  setJointPositions: (positions) => set({ jointPositions: positions }),

  subscribeToTopics: () => {
    const ros = get().ros;
    if (!ros) return;
    get().unsubscribeFromTopics();

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

    jointTopic.subscribe((msg) => {
      set({ jointMessage: msg, jointPositions: msg.position });
    });

    motorTopic.subscribe((msg) => {
      const states = msg.motors ?? msg.ports ?? msg;
      set({ motorMessage: msg, motorStates: states });
    });

    set({ jointTopic, motorTopic });
  },

  publishJointMessage: (payload) => {
    const ros = get().ros;
    if (!ros) {
      console.warn("ROS not connected — cannot publish joint message");
      return;
    }
    let jointPub = get().jointPublisher;
    if (!jointPub) {
      jointPub = new ROSLIB.Topic({
        ros,
        name: "/gh360/joint_states",
        messageType: "sensor_msgs/msg/JointState",
      });
      set({ jointPublisher: jointPub });
    }
    jointPub.publish(payload);
  },

  unsubscribeFromTopics: () => {
    const { jointTopic, motorTopic, jointPublisher } = get();
    jointTopic?.unsubscribe();
    motorTopic?.unsubscribe();
    jointPublisher?.unadvertise?.();
    set({ jointTopic: null, motorTopic: null, jointPublisher: null });
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
        jointPositions: null,
        motorStates: null,
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
      ros.once("close", () => get().connect());
      ros.close();
    } else {
      get().connect();
    }
  },
}));

export default useRosStore;
