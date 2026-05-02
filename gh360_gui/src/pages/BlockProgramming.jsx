import {useEffect, useRef, useState} from 'react';
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import {javascriptGenerator} from 'blockly/javascript';
import * as En from 'blockly/msg/en';
import {Card} from '@/components/ui/card.jsx';
import {lightBlocklyTheme, darkBlocklyTheme} from '../css/blocklyThemes.js';
import '../components/CustomBlocklyBlocks.jsx';
import {Button} from "@/components/ui/button.jsx";
import useRosStore from "@/store/rosStore.js";
import toast from "react-hot-toast";

Blockly.setLocale(En);

function BlockProgramming() {
    const blocklyDiv = useRef(null);
    const workspaceRef = useRef(null);
    const [code, setCode] = useState('');

    // Notification
    const save = () => toast.success("Block program code saved!");

    // Track dark mode; initial value doesn't matter much because we sync in useEffect
    const [isDark, setIsDark] = useState(false);

    const setBlockCode = useRosStore((s) => s.setBlockCode);

    useEffect(() => {
        const sync = () => {
            const dark = document.documentElement.classList.contains('dark');
            setIsDark(dark);
        };
        sync(); // initial sync after mount
    }, []);

    function saveCode() {
        setBlockCode(code);
        save();
    }

    useEffect(() => {
        if (!blocklyDiv.current) return;

        const toolbox = {
            kind: 'flyoutToolbox',
            contents: [
                {kind: 'block', type: 'controls_if'},
                {kind: 'block', type: 'logic_compare'},
                {kind: 'block', type: 'math_number', fields: {NUM: 1}},
                {
                    kind: 'block',
                    type: 'controls_for',
                    inputs: {
                        FROM: {block: {type: 'math_number', fields: {NUM: 1}}},
                        TO: {block: {type: 'math_number', fields: {NUM: 10}}},
                        BY: {block: {type: 'math_number', fields: {NUM: 1}}},
                    },
                },
                {kind: 'block', type: 'text_print'},
                {kind: 'block', type: 'variables_get'},
                {kind: 'block', type: 'variables_set'},
                {kind: 'block', type: 'move_arm'},
            ],
        };

        const theme = isDark ? darkBlocklyTheme : lightBlocklyTheme;

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

        workspaceRef.current = workspace;

        const onChange = () => {
            setCode(javascriptGenerator.workspaceToCode(workspace));
        };
        workspace.addChangeListener(onChange);



        // Cleanup when the component unmounts
        return () => {
            workspace.removeChangeListener(onChange);
            workspace.dispose();
            workspaceRef.current = null;
        };
    }, [isDark]);
    useEffect(() => {
        console.log(code);
    }, [code])
    return (
        <div className="w-full h-full">
            <Card className="flex flex-col overflow-hidden m-2 sm:m-2 md:m-2 lg:m-3 xl:m-3 2xl:m-4">
                <div
                    id="blocklyDiv"
                    ref={blocklyDiv}
                    style={{width: '100%', height: '600px'}}
                />
                <Button
                    onClick={saveCode}
                    className="sm:text-xs md:text-xs lg:text-sm xl:text-sm 2xl:text-base cursor-pointer"
                    title="Send positions"
                >
                    Save code
                </Button>
            </Card>
        </div>
    );
}

export default BlockProgramming;
