import { BrowserRouter, Routes, Route } from "react-router-dom";
import Applayout from "./ui/Applayout";
import Dashboard from "./pages/Dashboard";
import './css/RobotArmFrame.css';

function App() {
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
            </div>
        </BrowserRouter>
  );
}

export default App;
