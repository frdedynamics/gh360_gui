import useRosTopic from "@/hooks/useRosTopics";
import { useEffect, useRef } from "react";
import { VideoOff } from "lucide-react";

function Camera({ toggleCamera }) {
  const canvasRef = useRef(null);
  const arucoRef = useRef(null);
  const isActiveRef = useRef(toggleCamera);

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

      const binaryString = atob(msg.data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const imageData = ctx.createImageData(canvas.width, canvas.height);
      for (let i = 0, j = 0; i < bytes.length; i += 3, j += 4) {
        imageData.data[j] = bytes[i];
        imageData.data[j + 1] = bytes[i + 1];
        imageData.data[j + 2] = bytes[i + 2];
        imageData.data[j + 3] = 255;
      }
      ctx.putImageData(imageData, 0, 0);

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
    <div className="flex flex-col w-full h-full p-4 ">
      {toggleCamera ? (
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ transform: "scaleY(-1)" }}
        />
      ) : (
        <div className="flex flex-1 items-center justify-center flex-col gap-2 text-muted-foreground">
          <VideoOff size={48} />
          <p className="text-sm">Camera is turned off</p>
        </div>
      )}
    </div>
  );
}

export default Camera;
