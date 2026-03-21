import { Button } from "@/components/ui/button";
import useRosStore from "@/store/rosStore";

function Navbar() {
  const { status } = useRosStore();

  return (
    <nav className="flex flex-col items-center h-full w-full p-4 text-foreground">
      <div className="text-4xl">GH360 Robot Arm</div>
      <div className="flex flex-col gap-20 p-20">
        <Button className="bg-accent-foreground p-8">Dashboard</Button>
        <Button className="bg-accent-foreground p-8">Camera</Button>
        <Button className="bg-accent-foreground p-8">3D Model</Button>
      </div>
      <h2 className="font-bold text-2xl text-white">Status: {status}</h2>
    </nav>
  );
}

export default Navbar;
