import { Outlet } from "react-router-dom";

function Applayout() {
  return (
    <div>
      <aside>hello</aside>
      <Outlet />
    </div>
  );
}

export default Applayout;
