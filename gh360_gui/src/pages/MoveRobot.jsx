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
import {shallow} from "zustand/vanilla/shallow";

function MoveRobot() {

    const initialJointValues = JOINT_CONFIG.reduce((acc, j) => {
        acc[j.jointName] = 0;
        return acc;
    }, {});
    const [jointValues, setJointValues] = useState(initialJointValues);
    const lastEditRef = useRef(JOINT_CONFIG.reduce((acc, j) => { acc[j.jointName] = 0; return acc; }, {}));
    const [angleUnit, setAngleUnit] = useState("radians");

    const publishJointMessage = useRosStore((s) => s.publishJointMessage);
    const jointPositions = useRosStore(s => s.jointMessage?.position ?? null, shallow);

    const RAD_TO_DEG = (r) => Number((r * 180 / Math.PI).toFixed(2));
    const DEG_TO_RAD = (d) => Number((d * Math.PI / 180));

    const jointLimits = {
        shoulder_yaw:   { lower: -1.571, upper:  1.571, lowerdeg: RAD_TO_DEG(-1.571), upperdeg: RAD_TO_DEG(1.571) },
        shoulder_roll:  { lower: -1.571, upper:  1.571, lowerdeg: RAD_TO_DEG(-1.571), upperdeg: RAD_TO_DEG(1.571) },
        shoulder_pitch: { lower:  0.0,   upper:  1.571, lowerdeg: RAD_TO_DEG(0.0),    upperdeg: RAD_TO_DEG(1.571) },
        upperarm_roll:  { lower: -3.0,   upper:  3.0,   lowerdeg: RAD_TO_DEG(-3.0),   upperdeg: RAD_TO_DEG(3.0) },
        elbow:          { lower: -0.1,   upper:  2.2,   lowerdeg: RAD_TO_DEG(-0.1),   upperdeg: RAD_TO_DEG(2.2) },
        forearm_roll:   { lower: -1.571, upper:  1.571, lowerdeg: RAD_TO_DEG(-1.571), upperdeg: RAD_TO_DEG(1.571) },
        wrist_pitch:    { lower: -1.571, upper:  1.571, lowerdeg: RAD_TO_DEG(-1.571), upperdeg: RAD_TO_DEG(1.571) },
    };

    function setJointValueForJoint(jointName, input, min, max) {
        if (!jointName) return;
        let val = (angleUnit === "degrees") ? DEG_TO_RAD(Number(input)) : Number(input);
        if (Number.isNaN(val)) return;
        val = Math.max(min, Math.min(max, val));
        lastEditRef.current[jointName] = Date.now();
        setJointValues(prev => ({ ...prev, [jointName]: val }));
    }

    function sendNewJointAngle(jointName) {
        if (!jointName) return;

        const positions = JOINT_CONFIG.map(j => {
            const v = jointValues[j.jointName];
            return Number.isFinite(Number(v)) ? Number(v) : 0;
        });

        publishJointMessage({
            name: JOINT_CONFIG.map((j) => j.jointName),
            position: positions,
        });

        lastEditRef.current[jointName] = 0;
    }

    useEffect(() => {
        if (!jointPositions) return;

        const msgTime = Date.now();

        const updates = {};
        JOINT_CONFIG.forEach((j, idx) => {
            const name = j.jointName;
            const pos = jointPositions[idx] ?? 0;

            if ((lastEditRef.current[name] || 0) < msgTime) {
                if (jointValues[name] !== pos) {
                    updates[name] = pos;
                }
            }
        });

        if (Object.keys(updates).length > 0) {
            setJointValues(prev => ({ ...prev, ...updates }));
        }
    }, [jointPositions]);


    return (
        <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr] h-dvh w-full overflow-hidden">
            <div className="overflow-y-auto p-2 sm:p-3 md:p-3 lg:p-4 xl:p-4 2xl:p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ...">
                    <Card className="w-full">
                        <CardHeader className="font-semibold">Dashboard settings</CardHeader>
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
                        </CardContent>
                    </Card>

                    {JOINT_CONFIG.map((joint) => {
                        const limit = jointLimits[joint.jointName];

                        const displayValue = angleUnit === "degrees"
                            ? RAD_TO_DEG(jointValues[joint.jointName])
                            : jointValues[joint.jointName];

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

                                    <Button
                                        onClick={() => {
                                            sendNewJointAngle(joint.jointName);
                                        }}
                                    >
                                        Send
                                    </Button>
                                </CardFooter>
                            </JointCard>
                        );
                    })}
                </div>
            </div>

            <aside className="hidden sm:flex flex-col h-full gap-2 p-2 ...">
                <div className="flex-1 min-h-0">
                    <Model />
                </div>
            </aside>
        </div>
    );
}

export default MoveRobot;
