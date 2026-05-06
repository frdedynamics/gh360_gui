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