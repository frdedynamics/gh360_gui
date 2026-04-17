import JointCard from "@/components/JointCard";
import Model from "@/components/Model";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { JOINT_CONFIG } from "@/configs/jointConfigs";
import {useRef, useState, useEffect} from "react";
import useRosStore from "@/store/rosStore";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Slider } from "@/components/ui/slider.jsx";
import { Button } from "@/components/ui/button.jsx";

function MoveRobot() {

    const initialJointValues = {
        name: JOINT_CONFIG.map(j => j.jointName),
        position: JOINT_CONFIG.map(() => 0),
    };
    const [jointValues, setJointValues] = useState(initialJointValues);
    const jointValuesRef = useRef(initialJointValues);
    useEffect(() => {
        jointValuesRef.current = jointValues;
    }, [jointValues]);

    const [angleUnit, setAngleUnit] = useState("radians");

    // RosStore function for publishing messages.
    const publishJointMessage = useRosStore((s) => s.publishJointMessage);

    // References for cooldown logic for sending messages.
    const SEND_COOLDOWN_MS = 6000; // 6 seconds cooldown, easy way to keep messages ordered.
    const sendQueueRef = useRef([]);
    const sendingRef = useRef(false);
    const cooldownTimerRef = useRef(null);

    const RAD_TO_DEG = (r) => Number((r * 180 / Math.PI).toFixed(2));
    const DEG_TO_RAD = (d) => Number((d * Math.PI / 180));

    // Joint limits for each joint (used to clamp input numbers to limits)
    const jointLimits = {
        shoulder_yaw:   { lower: -1.571, upper:  1.571, lowerdeg: RAD_TO_DEG(-1.571), upperdeg: RAD_TO_DEG(1.571) },
        shoulder_roll:  { lower: -1.571, upper:  1.571, lowerdeg: RAD_TO_DEG(-1.571), upperdeg: RAD_TO_DEG(1.571) },
        shoulder_pitch: { lower:  0.0,   upper:  1.571, lowerdeg: RAD_TO_DEG(0.0),    upperdeg: RAD_TO_DEG(1.571) },
        upperarm_roll:  { lower: -3.0,   upper:  3.0,   lowerdeg: RAD_TO_DEG(-3.0),   upperdeg: RAD_TO_DEG(3.0) },
        elbow:          { lower: -0.1,   upper:  2.2,   lowerdeg: RAD_TO_DEG(-0.1),   upperdeg: RAD_TO_DEG(2.2) },
        forearm_roll:   { lower: -1.571, upper:  1.571, lowerdeg: RAD_TO_DEG(-1.571), upperdeg: RAD_TO_DEG(1.571) },
        wrist_pitch:    { lower: -1.571, upper:  1.571, lowerdeg: RAD_TO_DEG(-1.571), upperdeg: RAD_TO_DEG(1.571) },
    };

    // Function for setting the values of the joints in the message.
    function setJointValueForJoint(jointName, input, min, max) {
        if (!jointName) return;
        let val = (angleUnit === "degrees") ? DEG_TO_RAD(Number(input)) : Number(input);
        if (Number.isNaN(val)) return;
        // clamp to limits if value is < min or > max.
        val = Math.max(min, Math.min(max, val));
        setJointValues(prev => {
            const index = prev.name.indexOf(jointName);
            if (index === -1) return prev;

            const nextPositions = [...prev.position];
            nextPositions[index] = val;

            const next = {
                ...prev,
                position: nextPositions,
            };

            jointValuesRef.current = next;
            return next;
        });
    }

    function sendNewJointAngles() {
        const item = sendQueueRef.current.shift();
        if (!item) {
            sendingRef.current = false;
            return;
        }

        // set current = true to show that it is currently sending.
        sendingRef.current = true;

        // publish now
        publishJointMessage({
            name: JOINT_CONFIG.map((j) => j.jointName),
            position: item.position,
        });

        // start cooldown
        cooldownTimerRef.current = window.setTimeout(() => {
            cooldownTimerRef.current = null;
            if (sendQueueRef.current.length > 0) { // Queue at most 1 action.
                sendNewJointAngles();
            } else {
                sendingRef.current = false;
            }
        }, SEND_COOLDOWN_MS);
    }

    function enqueueSend(jointName) {
        const { name, position } = jointValuesRef.current;

        // only 1 item in queue
        if (sendQueueRef.current.length < 1) {
            sendQueueRef.current.push({
                name: [...name],
                position: [...position],
                timeRequested: Date.now(),
            });
        }

        if (!sendingRef.current) {
            sendNewJointAngles();
        }
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr] h-dvh w-full overflow-hidden">
            <div className="overflow-y-auto p-2 sm:p-3 md:p-3 lg:p-4 xl:p-4 2xl:p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ...">
                    <Card className="w-full">
                        <CardHeader className="font-semibold">Settings</CardHeader>
                        <CardContent className="flex flex-col gap-2 ...">
                            <p>Angle joints measured in:</p>
                            <RadioGroup value={angleUnit} onValueChange={setAngleUnit} className="w-fit gap-2 ...">
                                <div className="flex items-center gap-2 ...">
                                    <RadioGroupItem value="radians" id="r1" />
                                    <Label htmlFor="r1">Radians</Label>
                                </div>
                                <div className="flex items-center gap-2 ...">
                                    <RadioGroupItem value="degrees" id="r2" />
                                    <Label htmlFor="r2">Degrees</Label>
                                </div>
                            </RadioGroup>
                            <Button
                                onClick={() => {
                                    enqueueSend();
                                }}
                            >
                                Send
                            </Button>
                        </CardContent>
                    </Card>

                    {JOINT_CONFIG.map((joint) => {
                        const limit = jointLimits[joint.jointName];

                        const index = jointValuesRef.current.name.indexOf(joint.jointName);
                        const displayValue = angleUnit === "degrees"
                            ? RAD_TO_DEG(jointValuesRef.current.position[index])
                            : jointValuesRef.current.position[index];

                        const min = angleUnit === "degrees" ? limit.lowerdeg : limit.lower;
                        const max = angleUnit === "degrees" ? limit.upperdeg : limit.upper;
                        const step = angleUnit === "degrees" ? 0.1 : 0.01;

                        return (
                            <JointCard
                                key={joint.jointName}
                                jointName={joint.jointName}
                                index={joint.index}
                                motors={joint.motors}
                                angleUnit={angleUnit}
                            >
                                <CardFooter>
                                    <div>
                                        <Input
                                            type="number"
                                            value={displayValue}
                                            onChange={(e) => {
                                                setJointValueForJoint(joint.jointName, e.target.value, limit.lower, limit.upper);
                                            }}
                                        />
                                        <Slider
                                            min={min}
                                            max={max}
                                            step={step}
                                            value={[displayValue]}
                                            onValueChange={(vals) => {
                                                setJointValueForJoint(joint.jointName, vals[0], limit.lower, limit.upper);
                                            }}
                                        />
                                    </div>
                                </CardFooter>
                            </JointCard>
                        );
                    })}
                </div>
            </div>

            <aside className="hidden sm:flex flex-col h-full gap-2 p-2 ...">
                <div className="flex-1 min-h-0">
                    <Model jointmsg={jointValuesRef.current}/>
                </div>
            </aside>
        </div>
    );
}

export default MoveRobot;
