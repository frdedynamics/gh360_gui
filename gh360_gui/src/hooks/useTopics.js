//The purpose of this class is to let the componenents subscribe to differente topics
//Wrapped in a custom hook for

import useRosStore from "@/store/rosStore";
import { useEffect, useState } from "react";
import * as ROSLIB from "roslib";

const useTopics = (topicName, messageType, throttleRate = 100) => {
  const ros = useRosStore((state) => state.ros);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    //If there is no ros, return immediately
    if (!ros) return;

    const topic = new ROSLIB.Topic({
      ros,
      name: topicName,
      messageType,
      throttle_rate: throttleRate,
    });

    topic.subscribe((msg) => setMessage(msg));

    //When the component unmounts or a disconnect
    return () => topic.unsubscribe();
  }, [ros, topicName, messageType]);

  return message;
};

export default useTopics;
