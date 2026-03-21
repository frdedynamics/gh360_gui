import { BrowserRouter, Routes, Route } from "react-router-dom";
import Applayout from "./ui/Applayout";
import Dashboard from "./pages/Dashboard";
import useRosStore from "./store/rosStore";
import { useEffect } from "react";

function App() {
  const { connect, status } = useRosStore();

  useEffect(() => {
    connect();
  }, []);

  console.log("ROS status:", status);

  return (
    // Routing setup, with BrowserRouter.
    <BrowserRouter>
      <Routes>
        {/* Applayout as parent component (sidebar + page) with <Outlet> as children component of the applayout */}
        <Route element={<Applayout />}>
          <Route index element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
