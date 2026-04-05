import { create } from "zustand";
import * as ROSLIB from "roslib";

//Creating a custom hook, without having to wrap everything in a provider.
//The purpose of this class is to mange the connection to ROS with status indicators.
const useRosStore = create((set, get) => ({
  ros: null,
  status: "disconnected",

  connect: () => {
    const url = import.meta.env.VITE_ROSBRIDGE_SERVER || "ws://localhost:9090";
    set({ status: "connecting" });
    const ros = new ROSLIB.Ros({ url });

    ros.on("connection", () => set({ status: "connected", ros }));
    ros.on("error", () => set({ status: "error" }));
    ros.on("close", () => set({ status: "disconnected", ros: null }));
  },

  disconnect: () => {
    get().ros?.close();
    set({ ros: null, status: "disconnected" });
  },
}));
export default useRosStore;
