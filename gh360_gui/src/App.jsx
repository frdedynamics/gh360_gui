import { Button, Input, Typography } from "@mui/material";
import React, { useRef, useState } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Applayout from "./ui/Applayout";
import Dashboard from "./pages/Dashboard";
import './css/RobotArmFrame.css';

function App() {
    const modelFrame = useRef(null);

    const [shoulder_yaw, setShoulder_yaw] = useState(null);
    const [realShoulder_yaw, setRealShoulder_yaw] = useState(null);

    const [shoulder_roll, setShoulder_roll] = useState(null);
    const [realShoulder_roll, setRealShoulder_roll] = useState(null);

    const [shoulder_pitch, setShoulder_pitch] = useState(null);
    const [realShoulder_pitch, setRealShoulder_pitch] = useState(null);

    const [upperarm_roll, setUpperarm_roll] = useState(null);
    const [realUpperarm_roll, setRealUpperarm_roll] = useState(null);

    const [elbowAngle, setElbowAngle] = useState(null);
    const [realElbowAngle, setRealElbowAngle] = useState(null);

    const [forearm_roll, setForearm_roll] = useState(null);
    const [realForearm_roll, setRealForearm_roll] = useState(null);

    const [wrist_pitch, setWrist_pitch] = useState(null);
    const [realWrist_pitch, setRealWrist_pitch] = useState(null);

    const handleShoulderYawClick = () => {
        let shoulderYawRad = shoulder_yaw * Math.PI / 180;
        modelFrame.current.contentWindow.moveJoint("shoulder_yaw", shoulderYawRad);
        const rad = modelFrame.current.contentWindow.getJoint("shoulder_yaw");
        const deg = rad * 180/Math.PI;
        setRealShoulder_yaw(deg);
    };

    const handleShoulderRollClick = () => {
        let shoulderRollRad = shoulder_roll * Math.PI / 180;
        modelFrame.current.contentWindow.moveJoint("shoulder_roll", shoulderRollRad);
        const rad = modelFrame.current.contentWindow.getJoint("shoulder_roll");
        const deg = rad * 180/Math.PI;
        setRealShoulder_roll(deg);
    };

    const handleShoulderPitchClick = () => {
        let shoulderPitchRad = shoulder_pitch * Math.PI / 180;
        modelFrame.current.contentWindow.moveJoint("shoulder_pitch", shoulderPitchRad);
        const rad = modelFrame.current.contentWindow.getJoint("shoulder_pitch");
        const deg = rad * 180/Math.PI;
        setRealShoulder_pitch(deg);
    };

    const handleUpperarmRollClick = () => {
        let upperarmRollRad = upperarm_roll * Math.PI / 180;
        modelFrame.current.contentWindow.moveJoint("upperarm_roll", upperarmRollRad);
        const rad = modelFrame.current.contentWindow.getJoint("upperarm_roll");
        const deg = rad * 180/Math.PI;
        setRealUpperarm_roll(deg);
    };

    const handleElbowClick = () => {
        let elbowAngleRad = elbowAngle * Math.PI / 180;
        modelFrame.current.contentWindow.moveJoint("elbow", elbowAngleRad);
        const rad = modelFrame.current.contentWindow.getJoint("elbow");
        const deg = rad * 180/Math.PI;
        setRealElbowAngle(deg);
    };

    const handleForearmRollClick = () => {
        let forearmRollRad = forearm_roll * Math.PI / 180;
        modelFrame.current.contentWindow.moveJoint("forearm_roll", forearmRollRad);
        const rad = modelFrame.current.contentWindow.getJoint("forearm_roll");
        const deg = rad * 180/Math.PI;
        setRealForearm_roll(deg);
    };

    const handleWristPitchClick = () => {
        let wristPitchRad = wrist_pitch * Math.PI / 180;
        modelFrame.current.contentWindow.moveJoint("wrist_pitch", wristPitchRad);
        const rad = modelFrame.current.contentWindow.getJoint("wrist_pitch");
        const deg = rad * 180/Math.PI;
        setRealWrist_pitch(deg);
    };

    return (
        // Routing setup, with BrowserRouter.
        <BrowserRouter>
            <Routes>
                {/* Applayout as parent component (sidebar + page) with <Outlet> as children component of the applayout */}
                <Route element={<Applayout />}>
                    <Route index element={<Dashboard />} />
                </Route>
            </Routes>
            <div className="text-orange-500">
                <div>
                  <Button variant="contained">Hello world</Button>
                  <Button variant="outlined">Hallo</Button>
                </div>
                <div>
                    <Button variant="contained" color="primary" onClick={handleShoulderYawClick}>Shoulder Yaw</Button>
                    <Input
                        onChange={(e) => setShoulder_yaw(e.target.value)}
                        inputProps={{ type: 'number', step: '0.01', min: 0, max: 360 }}
                        inputMode="numeric"
                        placeholder="Angle (degrees)"
                    />
                    <Typography>Real shoulder yaw angle: {realShoulder_yaw ?? '—'}°</Typography>
                </div>
                <div>
                    <Button variant="contained" color="primary" onClick={handleShoulderRollClick}>Shoulder Roll</Button>
                    <Input
                        onChange={(e) => setShoulder_roll(e.target.value)}
                        inputProps={{ type: 'number', step: '0.01', min: 0, max: 360 }}
                        inputMode="numeric"
                        placeholder="Angle (degrees)"
                    />
                    <Typography>Real shoulder roll angle: {realShoulder_roll ?? '—'}°</Typography>
                </div>
                <div>
                    <Button variant="contained" color="primary" onClick={handleShoulderPitchClick}>Shoulder Pitch</Button>
                    <Input
                        onChange={(e) => setShoulder_pitch(e.target.value)}
                        inputProps={{ type: 'number', step: '0.01', min: 0, max: 360 }}
                        inputMode="numeric"
                        placeholder="Angle (degrees)"
                    />
                    <Typography>Real shoulder pitch angle: {realShoulder_pitch ?? '—'}°</Typography>
                </div>
                <div>
                    <Button variant="contained" color="primary" onClick={handleUpperarmRollClick}>Upperarm Roll</Button>
                    <Input
                        onChange={(e) => setUpperarm_roll(e.target.value)}
                        inputProps={{ type: 'number', step: '0.01', min: 0, max: 360 }}
                        inputMode="numeric"
                        placeholder="Angle (degrees)"
                    />
                    <Typography>Real upperarm roll angle: {realUpperarm_roll ?? '—'}°</Typography>
                </div>
                <div>
                    <Button variant="contained" color="primary" onClick={handleElbowClick}>Elbow</Button>
                    <Input
                        onChange={(e) => setElbowAngle(e.target.value)}
                        inputProps={{ type: 'number', step: '0.01', min: 0, max: 360 }}
                        inputMode="numeric"
                        placeholder="Angle (degrees)"
                    />
                    <Typography>Real elbow angle: {realElbowAngle ?? '—'}°</Typography>
                </div>
                <div>
                    <Button variant="contained" color="primary" onClick={handleForearmRollClick}>Forearm Roll</Button>
                    <Input
                        onChange={(e) => setForearm_roll(e.target.value)}
                        inputProps={{ type: 'number', step: '0.01', min: 0, max: 360 }}
                        inputMode="numeric"
                        placeholder="Angle (degrees)"
                    />
                    <Typography>Real forearm roll angle: {realForearm_roll ?? '—'}°</Typography>
                </div>
                <div>
                    <Button variant="contained" color="primary" onClick={handleWristPitchClick}>Wrist Pitch</Button>
                    <Input
                        onChange={(e) => setWrist_pitch(e.target.value)}
                        inputProps={{ type: 'number', step: '0.01', min: 0, max: 360 }}
                        inputMode="numeric"
                        placeholder="Angle (degrees)"
                    />
                    <Typography>Real wrist pitch angle: {realWrist_pitch ?? '—'}°</Typography>
                </div>

                <div className="robotarm-iframe">
                    <iframe
                        ref={modelFrame}
                        name="robotarm-iframe"
                        src="../gh360%20ThreeJS%20model/Model%20robotarm.html"
                        title="Robot arm model"
                        sandbox="allow-scripts allow-same-origin"
                    />
                </div>
            </div>
        </BrowserRouter>
  );
}

export default App;
