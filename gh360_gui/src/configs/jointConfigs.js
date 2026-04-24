//File for helper functions and variables

export const JOINT_CONFIG = [
  { jointName: "shoulder_yaw", index: 0, motors: [0, 1] },
  { jointName: "shoulder_roll", index: 1, motors: [2, 3] },
  { jointName: "shoulder_pitch", index: 2, motors: [4, 5] },
  { jointName: "upperarm_roll", index: 3, motors: [6, 7] },
  { jointName: "elbow", index: 4, motors: [8, 9] },
  { jointName: "forearm_roll", index: 5, motors: [10] },
  { jointName: "wrist_pitch", index: 6, motors: [11, 12] },
];

export const RAD_TO_DEG = (r) => Number(((r * 180) / Math.PI).toFixed(2));
export const DEG_TO_RAD = (d) => Number((d * Math.PI) / 180);

//Jointlimits for the sliders at the move robot page.
export const JOINT_LIMITS = {
  shoulder_yaw: {
    lower: -1.571,
    upper: 1.571,
    lowerdeg: RAD_TO_DEG(-1.571),
    upperdeg: RAD_TO_DEG(1.571),
  },
  shoulder_roll: {
    lower: -1.571,
    upper: 1.571,
    lowerdeg: RAD_TO_DEG(-1.571),
    upperdeg: RAD_TO_DEG(1.571),
  },
  shoulder_pitch: {
    lower: 0.0,
    upper: 1.571,
    lowerdeg: RAD_TO_DEG(0.0),
    upperdeg: RAD_TO_DEG(1.571),
  },
  upperarm_roll: {
    lower: -3.0,
    upper: 3.0,
    lowerdeg: RAD_TO_DEG(-3.0),
    upperdeg: RAD_TO_DEG(3.0),
  },
  elbow: {
    lower: -0.1,
    upper: 2.2,
    lowerdeg: RAD_TO_DEG(-0.1),
    upperdeg: RAD_TO_DEG(2.2),
  },
  forearm_roll: {
    lower: -1.571,
    upper: 1.571,
    lowerdeg: RAD_TO_DEG(-1.571),
    upperdeg: RAD_TO_DEG(1.571),
  },
  wrist_pitch: {
    lower: -1.571,
    upper: 1.571,
    lowerdeg: RAD_TO_DEG(-1.571),
    upperdeg: RAD_TO_DEG(1.571),
  },
};

//
export function setJointValueForJoint(jointName, input, min, max) {
  if (!jointName) return;
  let val = angleUnit === "degrees" ? DEG_TO_RAD(Number(input)) : Number(input);
  if (Number.isNaN(val)) return;
  // clamp to limits if value is < min or > max.
  val = Math.max(min, Math.min(max, val));
  setJointValues((prev) => {
    const index = prev.name.indexOf(jointName);
    if (index === -1) return prev;

    const nextPositions = [...prev.position];
    nextPositions[index] = val;

    const next = {
      ...prev,
      position: nextPositions,
    };

    jointValuesRef.current = next;
    return next;
  });
}

export function sendNewJointAngles() {
  const item = sendQueueRef.current.shift();
  if (!item) {
    sendingRef.current = false;
    return;
  }

  // set current = true to show that it is currently sending.
  sendingRef.current = true;

  // publish now
  publishJointMessage({
    name: JOINT_CONFIG.map((j) => j.jointName),
    position: item.position,
  });

  // start cooldown
  cooldownTimerRef.current = window.setTimeout(() => {
    cooldownTimerRef.current = null;
    if (sendQueueRef.current.length > 0) {
      // Queue at most 1 action.
      sendNewJointAngles();
    } else {
      sendingRef.current = false;
    }
  }, SEND_COOLDOWN_MS);
}

//Function to add a message to the queue
export function enqueueSend(jointName) {
  const { name, position } = jointValuesRef.current;

  // only 1 item in queue
  if (sendQueueRef.current.length < 1) {
    sendQueueRef.current.push({
      name: [...name],
      position: [...position],
      timeRequested: Date.now(),
    });
  }

  if (!sendingRef.current) {
    sendNewJointAngles();
  }
}
