import { create } from "zustand";
import * as ROSLIB from "roslib";

// Helper function for deciding if robot is close enough to its goal.
function isCloseEnough(target, current, epsilon) {
    if (!Array.isArray(target) || !Array.isArray(current)) return false;
    if (current.length !== target.length) return false;

    for (let i = 0; i < target.length; i++) {
        if (Math.abs(target[i] - current[i]) > epsilon) {
            return false;
        }
    }
    return true;
}

const useRosStore = create((set, get) => ({
  //Connection variables.
  ros: null,
  status: "disconnected",
  intentionalDisconnect: false,

  // Messages sending joint values and motor data.
  jointMessage: null,
  motorMessage: null,

  // Topics for joint values and motor data.
  jointTopic: null,
  motorTopic: null,

  // Function for sending a move command do robot.
  cmdJointPosPub: null,

  // Stored positions from sliders, messages and saved positions in MoveRobot page.
  jointPositions: null,
  msgJointPositions: null,
  savedPositions: [],

  // Stored block code from block programming.
  blockCode: null,

  // Motor state messages.
  motorStates: null,

  // Queue variables for multiple messages.
  jointGoalQueue: [],
  isProcessingJointQueue: false,

  // Setter for setting the code for block programming
  setBlockCode: (code) => set({blockCode: code}),
  // Setter for setting the positions the sliders point to in MoveRobot.
  setJointPositions: (positions) => set({ jointPositions: positions }),
  // Setter for either updating the position of a stored item with a given name,
  // or adding a new item with the given name and position.
  setSavedPosition: (name, position) =>
      set((state) => {
      // Looking for existing entry
      const existingIndex = state.savedPositions.findIndex(
          (item) => item.name === name
      );

      // Replace existing entry
      if (existingIndex !== -1) {
          const updated = [...state.savedPositions];
          updated[existingIndex] = { name, position };
          return { savedPositions: updated };
      }

      // Or add new entry if not found
      return {
          savedPositions: [...state.savedPositions, { name, position }],
      };
  }),

  _processJointQueue: () => {
      const state = get();
      const { ros, jointGoalQueue } = state;

      if (!ros) {
          console.warn("ROS not connected — cannot process joint goal queue");
          set({ jointGoalQueue: [], isProcessingJointQueue: false });
          return;
      }

      if (jointGoalQueue.length === 0) {
          set({ isProcessingJointQueue: false });
          return;
      }

      set({ isProcessingJointQueue: true });

      // Fetch the next goal
      const [nextTarget, ...rest] = jointGoalQueue;
      set({ jointGoalQueue: rest });

      // Fetch publisher, if it doesn't exist, add it.
      let cmdPub = state.cmdJointPosPub;
      if (!cmdPub) {
          cmdPub = new ROSLIB.Topic({
              ros,
              name: "/gh360_control/cmd_joint_pos",
              messageType: "std_msgs/msg/Float64MultiArray",
          });
          set({ cmdJointPosPub: cmdPub });
      }
      const target = nextTarget.slice();

      const maxDurationMs = 30000;// total time allowed per goal (ms)
      const intervalMs = 100;     // send/check interval (ms)
      const epsilon = 0.01;       // “close enough” tolerance

      const startTime = Date.now();

      function loop() {
          const { msgJointPositions } = get();

          // Reached target?
          if (isCloseEnough(target, msgJointPositions, epsilon)) {
              // Proceed to next in queue
              const { _processJointQueue } = get();
              _processJointQueue();
              return;
          }

          // Timeout, send next in queue.
          if (Date.now() - startTime > maxDurationMs) {
              console.warn("Timeout sending joint command — did not reach target");
              const { _processJointQueue } = get();
              _processJointQueue();
              return;
          }

          // Send one command
          cmdPub.publish({ data: target });

          // Schedule next check/send
          setTimeout(loop, intervalMs);
      }

      // Start this goal's loop
      loop();
  },

  publishCmdJointPos: (positions) => {
      const target = Array.isArray(positions) ? positions.slice() : [];
      if (!target.length) return;

      // Push onto end of queue
      set((state) => ({
          jointGoalQueue: [...state.jointGoalQueue, target],
      }));

      // Start processing if not already
      const { isProcessingJointQueue, _processJointQueue } = get();
      if (!isProcessingJointQueue) {
          _processJointQueue();
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
      throttle_rate: 100,
    });

    const motorTopic = new ROSLIB.Topic({
      ros,
      name: "/gh360/motor_states_sorted",
      messageType: "gh360_interfaces/msg/PortStatus",
      throttle_rate: 100,
    });

    jointTopic.subscribe((msg) => {
      set({ jointMessage: msg, msgJointPositions: msg.position });
    });

    motorTopic.subscribe((msg) => {
      const states = msg.motors ?? msg.ports ?? msg;
      set({ motorMessage: msg, motorStates: states });
    });

    set({ jointTopic, motorTopic });
  },

  unsubscribeFromTopics: () => {
    const { jointTopic, motorTopic, jointPublisher, cmdJointPosPub } = get();
    jointTopic?.unsubscribe();
    motorTopic?.unsubscribe();
    jointPublisher?.unadvertise?.();
    cmdJointPosPub?.unadvertise?.();
    set({
      jointTopic: null,
      motorTopic: null,
      cmdJointPosPub: null,
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
        jointPositions: null,
        msgJointPositions: null,
        motorStates: null,
        blockCode: null,
        jointGoalQueue: [],
        isProcessingJointQueue: false,
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
        set({ intentionalDisconnect: false });
        get().connect();
      });
      ros.close();
    } else {
      get().connect();
    }
  },
}));

export default useRosStore;
