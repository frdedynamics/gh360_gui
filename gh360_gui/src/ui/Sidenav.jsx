import { Button } from "@/components/ui/button";

function Navbar() {
  return (
    <nav className="flex flex-col items-center h-full w-full p-4 text-foreground">
      <div className="text-4xl">GH360 Robot Arm</div>
      <div className="flex flex-col gap-20 p-20">
        <Button className="bg-accent-foreground p-8">Dashboard</Button>
        <Button className="bg-accent-foreground p-8">Camera</Button>
        <Button className="bg-accent-foreground p-8">3D Model</Button>
      </div>
    </nav>
  );
}

export default Navbar;
