import React, { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card.jsx";
import useRosStore from "@/store/rosStore.js";

function Model(setToggleCamera) {
  const modelFrame = useRef(null);
  const jointMessage = useRosStore((s) => s.jointMessage);

  const jointMap = {
    shoulder_yaw: 0,
    shoulder_roll: 1,
    shoulder_pitch: 2,
    upperarm_roll: 3,
    elbow: 4,
    forearm_roll: 5,
    wrist_pitch: 6,
  };

  // Call moveJoint whenever jointMessage changes and iframeReady is true
  useEffect(() => {
    if (!jointMessage || !modelFrame.current) return;
    const win = modelFrame.current.contentWindow;
    if (!win) return;

    jointMessage.name.forEach((name) => {
      const angle = jointMessage.position[jointMap[name]];
      try {
        // guard: check function exists
        if (typeof win.moveJoint === "function") {
          win.moveJoint(name, angle);
        } else {
          console.warn("moveJoint not defined on iframe window");
        }
      } catch (err) {
        // If cross-origin, this will throw; handle it
        console.error("Error calling moveJoint on iframe:", err);
      }
    });
  }, [jointMessage]);

  return (
    <div className="flex justify-center h-full text-foreground">
      <Card className="w-full h-full p-0 overflow-hidden">
        <div className="robotarm-iframe w-full h-full min-h-0">
          <iframe
            ref={modelFrame}
            name="robotarm-iframe"
            src="../../gh360%20ThreeJS%20model/Model%20robotarm.html"
            title="Robot arm model"
            sandbox="allow-scripts allow-same-origin"
            className="w-full h-full border-0 block"
          />
        </div>
      </Card>
    </div>
  );
}

export default Model;
