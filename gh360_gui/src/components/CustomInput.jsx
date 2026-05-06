import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

function CustomInput({ savedPositions, nameInputRef }) {
  const [open, setOpen] = useState(false);

  // Custom input field, lets the user easily write in names while also showing a list of the currently saved positions.
  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <Input
          type="text"
          placeholder="Position name"
          className="flex-1"
          ref={nameInputRef}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)} // ensures first click focuses + opens
        />
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={4}
        className="p-0 w-24"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex flex-col">
          {savedPositions.map((item) => (
            <button
              key={item.name}
              type="button"
              className="px-2 py-1 text-left hover:bg-accent"
              onClick={() => {
                if (nameInputRef.current) {
                  nameInputRef.current.value = item.name;
                  nameInputRef.current.focus();
                }
                setOpen(false);
              }}
            >
              {item.name}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
export default CustomInput;
