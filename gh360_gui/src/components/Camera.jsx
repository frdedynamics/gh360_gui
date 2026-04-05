import useRosTopic from "@/hooks/useRosTopics";
import { useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { VideoOff } from "lucide-react";

function Camera({ toggleCamera, setToggleCamera }) {
  const canvasRef = useRef(null);
  const arucoRef = useRef(null);
  const isActiveRef = useRef(true);

  useEffect(() => {
    isActiveRef.current = toggleCamera;
  }, [toggleCamera]);

  useRosTopic(
    "/door/aruco_markers",
    "ros2_aruco_interfaces/msg/ArucoMarkers",
    200,
    (msg) => {
      arucoRef.current = msg;
    },
  );

  useRosTopic(
    "/camera/color/image_raw",
    "sensor_msgs/msg/Image",
    500,
    (msg) => {
      if (!isActiveRef.current || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (canvas.width !== msg.width || canvas.height !== msg.height) {
        canvas.width = msg.width;
        canvas.height = msg.height;
      }

      // Decode base64
      const binaryString = atob(msg.data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Draw camera frame
      const imageData = ctx.createImageData(canvas.width, canvas.height);
      for (let i = 0, j = 0; i < bytes.length; i += 3, j += 4) {
        imageData.data[j] = bytes[i];
        imageData.data[j + 1] = bytes[i + 1];
        imageData.data[j + 2] = bytes[i + 2];
        imageData.data[j + 3] = 255;
      }
      ctx.putImageData(imageData, 0, 0);

      // Draw aruco markers on top
      const aruco = arucoRef.current;
      if (aruco && aruco.marker_ids.length > 0) {
        aruco.marker_ids.forEach((id, index) => {
          const pose = aruco.poses[index];
          const focalLength = 600;
          const x =
            (pose.position.x / pose.position.z) * focalLength +
            canvas.width / 2;
          const y =
            (pose.position.y / pose.position.z) * focalLength +
            canvas.height / 2;

          ctx.beginPath();
          ctx.arc(x, y, 15, 0, 2 * Math.PI);
          ctx.strokeStyle = "lime";
          ctx.lineWidth = 3;
          ctx.stroke();

          ctx.font = "bold 16px sans-serif";
          ctx.fillStyle = "lime";
          ctx.fillText(`ID: ${id}`, x + 18, y + 5);
        });
      }
    },
  );

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex items-center justify-between p-2">
        <p className="text-sm font-semibold">Camera Feed</p>
      </div>

      <canvas
        ref={canvasRef}
        className="w-full h-full object-contain"
        style={{
          transform: "scaleY(-1)",
          display: toggleCamera ? "block" : "none",
        }}
      />

      {!toggleCamera && (
        <div className="flex flex-1 items-center justify-center">
          <VideoOff size={88} />
        </div>
      )}
    </div>
  );
}

export default Camera;
