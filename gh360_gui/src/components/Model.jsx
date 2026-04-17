import React, { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card.jsx";
import useRosStore from "@/store/rosStore.js";

function Model({ jointmsg }) {
    const modelFrame = useRef(null);

    // reads joint message from the store
    const storeJointMessage = useRosStore((s) => s.jointMessage);

    // prefer jointmsg if provided, otherwise fallback to store
    const effectiveJointMessage = jointmsg ?? storeJointMessage;

    // mapping from name -> index to fetch the index of a given joint name.
    const jointMap = {
        shoulder_yaw: 0,
        shoulder_roll: 1,
        shoulder_pitch: 2,
        upperarm_roll: 3,
        elbow: 4,
        forearm_roll: 5,
        wrist_pitch: 6,
    };

    // Helper: safe lookup of angle for a name.
    const getAngleForName = (msg, name) => {
        if (!msg) return null;
        const idx = jointMap[name];
        if (idx == null) return null;
        const posArr = Array.isArray(msg.position) ? msg.position : null;
        if (!posArr) return null;
        const val = posArr[idx];
        // guard against undefined / non-numeric
        return Number.isFinite(Number(val)) ? Number(val) : null;
    };

    useEffect(() => {
        const msg = effectiveJointMessage;
        if (!msg || !modelFrame.current) return;

        const win = modelFrame.current.contentWindow;
        if (!win) return;

        // ensure .name is an array and .position is an array
        const names = Array.isArray(msg.name) ? msg.name : [];
        if (!Array.isArray(msg.position)) {
            console.warn("Model: joint message has no valid position array", msg);
        }

        names.forEach((name) => {
            try {
                const angle = getAngleForName(msg, name);
                if (angle === null) {
                    // missing/invalid position for this name, skip
                    return;
                }

                if (typeof win.moveJoint === "function") {
                    win.moveJoint(name, angle);
                } else {
                    console.warn("moveJoint not defined on iframe window");
                }
            } catch (err) {
                console.error("Error calling moveJoint on iframe:", err);
            }
        });
    }, [effectiveJointMessage]);

    return (
        <div className="flex justify-center h-full text-foreground p-2">
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
