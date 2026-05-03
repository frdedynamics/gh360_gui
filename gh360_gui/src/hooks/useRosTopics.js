import { useEffect, useRef } from "react";
import * as ROSLIB from "roslib";
import useRosStore from "@/store/rosStore";

// Custom hook for simplifying connecting to a specific topic.

/**
 * [Custom hook for subcribing to a speciifc topic]
 * @param  {[String]} topicName [The selected topic]
 * @param  {[messageType]} messageType [Defined messageType]
 * @param {[Int]}  throttleRate    [The throtteRate]
 */
const useRosTopic = (topicName, messageType, throttleRate = 100, onMessage) => {
  const ros = useRosStore((state) => state.ros);
  const onMessageRef = useRef(onMessage);

  onMessageRef.current = onMessage;

  useEffect(() => {
    if (!ros) return;
    const topic = new ROSLIB.Topic({
      ros,
      name: topicName,
      messageType,
      throttle_rate: throttleRate,
    });
    topic.subscribe((msg) => onMessageRef.current(msg));
    return () => topic.unsubscribe();
  }, [ros, topicName, messageType, throttleRate]);
};

export default useRosTopic;
