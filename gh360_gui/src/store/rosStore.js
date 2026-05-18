import { create } from "zustand";
import { persist } from 'zustand/middleware';
import * as ROSLIB from "roslib";
import toast from "react-hot-toast";

/**
 * Helper function for deciding if robot is close enough to its goal.
 * Calculates if a current position is close enough to the target position to be deemed acceptable
 * based in epsilon value.
 * @private
 * @function isCloseEnough
 * @param target a list of joint angles that the robot aims to move to.
 * @param current a list of the current joint angles of the robot.
 * @param epsilon a number determining chat is considered close enough to be acceptable.
 * @returns {boolean} true if close enough, false otherwise.
 */
function isCloseEnough(target, current, epsilon) {
  if (!Array.isArray(target) || !Array.isArray(current)) return false;
  if (current.length !== target.length) return false;

  for (let i = 0; i < target.length; i++) {
    if (Math.abs(target[i] - current[i]) > epsilon) {
      return false;
    }
  }
  toast.success("Position reached!");
  return true;
}

// Create sets up useRosStore, persist allows for saving data in local browser storage to persist between refreshes.
const useRosStore = create(persist((set, get) => ({
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

  // Variable for when the user clicks the stop button.
  stop: false,

  // Sets stop to true, intended for when stop button is pressed.
  setStop: () => set({ stop: true }),

  // Setter for setting the code for block programming
  setBlockCode: (code) => set({ blockCode: code }),

  // Setter for setting the positions the sliders point to in MoveRobot.
  setJointPositions: (positions) => set({ jointPositions: positions }),

  // Setter for either updating the position of a stored item with a given name,
  // or adding a new item with the given name and position.
  setSavedPosition: (name, position) =>
    set((state) => {
      // Looking for existing entry
      const existingIndex = state.savedPositions.findIndex(
        (item) => item.name === name,
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

    /**
     * Function that processes robot movements by making sure they are completed in order and the next
     * movement is only started after the last is either completed or has timed out after maxDurationMS runs out.
     * Fetches or instantiates the publisher depending on if it exists, and starts a loop sending commands to move
     * to the next position in the queue until the position is reached, it times out, or is manually stopped.
     * @private
     * @function _processJointQueue
     */
  _processJointQueue: () => {
    const state = get();
    const { ros, jointGoalQueue } = state;

    // If ros isn't available, sends a warning and empties the queue, sets isProcessingJointQueue to false and returns.
    if (!ros) {
      console.warn("ROS not connected — cannot process joint goal queue");
      set({ jointGoalQueue: [], isProcessingJointQueue: false });
      return;
    }

    // If the queue is empty, sets isProcessingJointQueue to false and returns.
    if (jointGoalQueue.length === 0) {
      set({ isProcessingJointQueue: false });
      return;
    }

    // jointGoalQueue is not empty, so start processing.
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

    const maxDurationMs = 30000; // total time allowed per goal (ms)
    const intervalMs = 10; // send/check interval (ms)
    const epsilon = 0.03; // “close enough” tolerance

    const startTime = Date.now();

    function MessageLoop() {
      const { msgJointPositions, stop} = get();

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

      // Checks if the user clicked the stop button
      if(!stop) {
      // Send one command
      cmdPub.publish({ data: target });

      // Schedule next check/send
        setTimeout(MessageLoop, intervalMs);
      } else {
          // Sends the current position to make sure the robot and model stay where they are.
          cmdPub.publish({ data: msgJointPositions });
          set({ stop: false, isProcessingJointQueue: false, jointGoalQueue: [] });
          toast.error("Movement cancelled.");
      }
    }

    // Start this goal's loop
    MessageLoop();
  },

  /**
   * Function that adds goal joint positions to the back of the jointGoalQueue and calls the function that processes
   * the queue if it isn't running already.
   * @function publicCmdJointPos
   * @param positions Joint positions for the robot to move to.
   */
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

  /**
   * Function that instantiates two topics and sets jointMessage, msgJointPositions, motorMessage and motorStates to
   * listen to them.
   * @function subscribeToTopics
   */
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

  /**
   * Cleanup function
   * @function unsubscribeFromTopics
   */
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
    set({ intentionalDisconnect: true, jointGoalQueue: [] });
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
}), {
    name: 'ros-store',
    // only persist savedPositions and blockCode.
    partialize: (state) => ({
        savedPositions: state.savedPositions,
        blockCode: state.blockCode,
    }),
}));

export default useRosStore;
