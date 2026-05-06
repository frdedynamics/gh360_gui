import * as Blockly from 'blockly/core';


// Light theme for if the page is in light mode
export const lightBlocklyTheme = Blockly.Theme.defineTheme('lightTheme', {
    base: Blockly.Themes.Classic,
    blockStyles: {
        logic_blocks: {colourPrimary: '#4b6bfb'},
        loop_blocks: {colourPrimary: '#22c55e'},
        math_blocks: {colourPrimary: '#f97316'},
        text_blocks: {colourPrimary: '#0ea5e9'},
    },
    categoryStyles: {
        logic_category: {colour: '#4b6bfb'},
        loop_category: {colour: '#22c55e'},
        math_category: {colour: '#f97316'},
        text_category: {colour: '#0ea5e9'},
    },
    componentStyles: {
        workspaceBackgroundColour: '#fdfffc', // matches your --background
        toolboxBackgroundColour: '#ffffff',
        toolboxForegroundColour: '#111827',
        flyoutBackgroundColour: '#f3f4f6',
        flyoutForegroundColour: '#111827',
        insertionMarkerColour: '#4b6bfb',
        insertionMarkerOpacity: 0.3,
        scrollbarColour: '#9ca3af',
        scrollbarOpacity: 0.7,
    },
});

// Dark theme for if the page is in dark mode.
export const darkBlocklyTheme = Blockly.Theme.defineTheme('darkTheme', {
    base: Blockly.Themes.Classic,
    blockStyles: {
        logic_blocks: {colourPrimary: '#60a5fa'},
        loop_blocks: {colourPrimary: '#4ade80'},
        math_blocks: {colourPrimary: '#fb923c'},
        text_blocks: {colourPrimary: '#38bdf8'},
    },
    categoryStyles: {
        logic_category: {colour: '#60a5fa'},
        loop_category: {colour: '#4ade80'},
        math_category: {colour: '#fb923c'},
        text_category: {colour: '#38bdf8'},
    },
    componentStyles: {
        workspaceBackgroundColour: '#030712', // your dark --background
        toolboxBackgroundColour: '#020617',
        toolboxForegroundColour: '#e5e7eb',
        flyoutBackgroundColour: '#030712',
        flyoutForegroundColour: '#e5e7eb',
        insertionMarkerColour: '#60a5fa',
        insertionMarkerOpacity: 0.3,
        scrollbarColour: '#4b5563',
        scrollbarOpacity: 0.7,
    },
});