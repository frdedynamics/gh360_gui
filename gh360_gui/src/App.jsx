import { BrowserRouter, Routes, Route } from "react-router-dom";
import Applayout from "./ui/Applayout";
import Dashboard from "./pages/Dashboard";
import useRosStore from "./store/rosStore";
import { useEffect } from "react";
import { ThemeProvider } from "./components/ui/themeProvider";
import MoveRobot from "./pages/MoveRobot";
import BlockProgramming from "./pages/BlockProgramming";

function App() {
  const { connect } = useRosStore();

  useEffect(() => {
    connect();
  }, []);

  return (
    // Routing setup, with BrowserRouter.
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Routes>
          {/* Applayout as parent component (sidebar + page) with <Outlet> as children component of the applayout */}
          <Route element={<Applayout />}>
            <Route index path="" element={<Dashboard />} />
            <Route path="moverobot" element={<MoveRobot />} />
            <Route path="block_programming" element={<BlockProgramming />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
