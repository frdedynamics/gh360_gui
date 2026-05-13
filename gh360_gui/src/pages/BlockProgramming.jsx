import { useEffect, useRef, useState } from "react";
import * as Blockly from "blockly/core";
import "blockly/blocks";
import { javascriptGenerator } from "blockly/javascript";
import { Card } from "@/components/ui/card.jsx";
import { lightBlocklyTheme, darkBlocklyTheme } from "../css/blocklyThemes.js";
import "../components/CustomBlocklyBlocks.jsx";
import { Button } from "@/components/ui/button.jsx";
import useRosStore from "@/store/rosStore.js";
import toast from "react-hot-toast";
import {Power} from "lucide-react";

const STORAGE_KEY = 'my_blockly_workspace';

function BlockProgramming() {
  const blocklyDiv = useRef(null);
  const workspaceRef = useRef(null);
  const [code, setCode] = useState("");
  // Change the tab name on mount.
  useEffect(() => {
    document.title = "GH360 Block Programming";
  }, []);
  // Notification
  const save = () => toast.success("Block program code saved and running!");

  // Track dark mode; initial value doesn't matter much because we sync in useEffect
  const [isDark, setIsDark] = useState(false);

  // Needed to run the code for moving the arm (used through 'eval(code)').
  const publishCmdJointPos = useRosStore((s) => s.publishCmdJointPos);
  // Saves the generated javascript code to the store.
  const setBlockCode = useRosStore((s) => s.setBlockCode);
  // Boolean used to find out if there are messages being sent.
  const currentlyRunning = useRosStore((s) => s.isProcessingJointQueue);
  // Method to set stop to true when stop button is clicked.
  const setStop = useRosStore((s) => s.setStop);

  useEffect(() => {
    const sync = () => {
      const dark = document.documentElement.classList.contains("dark");
      setIsDark(dark);
    };
    sync(); // sets the theme on load.
  }, []);

  // function that saves the generated javascript code to the store.
  function saveAndPlayCode() {
    setBlockCode(code);
    eval(code);
    save(); //notification
  }

  useEffect(() => {
    if (!blocklyDiv.current) return;

    // Setup toolbox.
    const toolbox = {
      kind: "flyoutToolbox",
      contents: [
          { kind: "block", type: "move_arm" },
        {
          kind: "block",
          type: "controls_for",
          inputs: {
            FROM: { block: { type: "math_number", fields: { NUM: 1 } } },
            TO: { block: { type: "math_number", fields: { NUM: 10 } } },
            BY: { block: { type: "math_number", fields: { NUM: 1 } } },
          },
        },
      ],
    };

    // Picks theme based on if the application is in dark or light mode.
    const theme = isDark ? darkBlocklyTheme : lightBlocklyTheme;

    // blockly workspace setup.
    const workspace = Blockly.inject(blocklyDiv.current, {
      toolbox,
      theme,
      scrollbars: true,
      trashcan: true,
      zoom: {
        controls: true,
        wheel: true,
        startScale: 1,
        maxScale: 3,
        minScale: 0.3,
      },
    });

    // Checks if there is a stored workspace already and loads it if there is so progress doesn't get deleted when
    // changing pages or refreshing.
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            const state = JSON.parse(stored);
            Blockly.serialization.workspaces.load(state, workspace);
        } catch (e) {
            console.error('Failed to load workspace from storage', e);
        }
    }

    workspaceRef.current = workspace;

    const onChange = () => {
      // When a change happens, generate javascript code from the workspace.
      setCode(javascriptGenerator.workspaceToCode(workspace));
      // When a change happens, save the change to the storage.
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Blockly.serialization.workspaces.save(workspace)));
    };
    workspace.addChangeListener(onChange);

    // Cleanup when the component unmounts
    return () => {
      workspace.removeChangeListener(onChange);
      workspace.dispose();
      workspaceRef.current = null;
    };
  }, [isDark]);

    return (
    <div className="w-full h-full">
      <Card className="flex flex-col overflow-hidden m-2 sm:m-2 md:m-2 lg:m-3 xl:m-3 2xl:m-4">
        <div
          id="blocklyDiv"
          ref={blocklyDiv}
          style={{ width: "100%", height: "600px" }}
        />
        <div className="flex w-full gap-2">
            <Button
              onClick={saveAndPlayCode}
              disabled={currentlyRunning}
              className="flex-1 sm:text-xs md:text-xs lg:text-sm xl:text-sm 2xl:text-base cursor-pointer"
              title="Save and play"
            >
              Save and play code
            </Button>
            <Button
                className="flex-1"
                variant="outline"
                size="icon"
                onClick={() => setStop(true)}
                disabled={!currentlyRunning}
                title="Stop"
            >
                <Power
                    className="sm:scale-75 md:scale-75 lg:scale-90 xl:scale-100 2xl:scale-125"
                    color="#e00b24"
                />
            </Button>
        </div>
      </Card>
    </div>
  );
}

export default BlockProgramming;
