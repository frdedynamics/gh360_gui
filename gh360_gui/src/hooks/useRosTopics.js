import { useEffect, useRef } from "react"
import * as ROSLIB from "roslib"
import useRosStore from "@/store/rosStore"

const useRosTopic = (topicName, messageType, throttleRate = 100, onMessage) => {
  const ros = useRosStore((state) => state.ros)
  const onMessageRef = useRef(onMessage)

  useEffect(() => {
    onMessageRef.current = onMessage
  }, [onMessage])

  useEffect(() => {
    if (!ros) return

    const topic = new ROSLIB.Topic({
      ros,
      name: topicName,
      messageType,
      throttle_rate: throttleRate,
    })

    topic.subscribe((msg) => onMessageRef.current(msg))

    return () => topic.unsubscribe()
  }, [ros, topicName, messageType, throttleRate])
}

export default useRosTopic
