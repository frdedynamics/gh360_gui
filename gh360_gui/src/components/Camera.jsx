import useRosTopic from "@/hooks/useRosTopics"
import { useEffect, useRef, useState } from "react"

function Camera() {
  const canvasRef = useRef(null)
  const arucoRef = useRef(null)
  const isActiveRef = useRef(true)
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    isActiveRef.current = isActive
  }, [isActive])

  useRosTopic(
    "/door/aruco_markers",
    "ros2_aruco_interfaces/msg/ArucoMarkers",
    200,
    (msg) => {
      arucoRef.current = msg
    }
  )

  useRosTopic(
    "/camera/color/image_raw",
    "sensor_msgs/msg/Image",
    500,
    (msg) => {
      if (!isActiveRef.current || !canvasRef.current) return

      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")

      if (canvas.width !== msg.width || canvas.height !== msg.height) {
        canvas.width = msg.width
        canvas.height = msg.height
      }

      // Decode base64
      const binaryString = atob(msg.data)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }

      // Draw camera frame
      const imageData = ctx.createImageData(canvas.width, canvas.height)
      for (let i = 0, j = 0; i < bytes.length; i += 3, j += 4) {
        imageData.data[j] = bytes[i]
        imageData.data[j + 1] = bytes[i + 1]
        imageData.data[j + 2] = bytes[i + 2]
        imageData.data[j + 3] = 255
      }
      ctx.putImageData(imageData, 0, 0)

      // Draw aruco markers on top
      const aruco = arucoRef.current
      if (aruco && aruco.marker_ids.length > 0) {
        aruco.marker_ids.forEach((id, index) => {
          const pose = aruco.poses[index]
          const focalLength = 600
          const x = (pose.position.x / pose.position.z) * focalLength + canvas.width / 2
          const y = (pose.position.y / pose.position.z) * focalLength + canvas.height / 2

          ctx.beginPath()
          ctx.arc(x, y, 15, 0, 2 * Math.PI)
          ctx.strokeStyle = "lime"
          ctx.lineWidth = 3
          ctx.stroke()

          ctx.font = "bold 16px sans-serif"
          ctx.fillStyle = "lime"
          ctx.fillText(`ID: ${id}`, x + 18, y + 5)
        })
      }
    }
  )

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex items-center justify-between p-2">
        <p className="text-sm font-semibold">Camera Feed</p>
        <button
          onClick={() => setIsActive((prev) => !prev)}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${isActive
            ? "bg-red-500 hover:bg-red-600 text-white"
            : "bg-green-500 hover:bg-green-600 text-white"
            }`}
        >
          {isActive ? "Stop" : "Start"}
        </button>
      </div>
      {isActive ? (
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain"
          style={{ transform: "scaleY(-1)" }}
        />
      ) : (
        <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
          Camera feed paused
        </div>
      )}
    </div>
  )
}

export default Camera
