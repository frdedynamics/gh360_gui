import {javascriptGenerator} from 'blockly/javascript';
import * as Blockly from 'blockly';
import useRosStore from "@/store/rosStore";

// Method for fetching the saved positions from the rosStore, to be listed in the block.
function getSavedPositionOptions() {
    const state = useRosStore.getState();
    const savedPositions = state.savedPositions || [];

    if (!savedPositions.length) {
        return [['(none)', '']];
    }

    return savedPositions.map((item) => [item.name, item.name]);
}

// Custom move_arm block.
Blockly.Blocks['move_arm'] = {
    init: function () {
        this.appendDummyInput()
            .appendField('Move arm to')
            .appendField(
                new Blockly.FieldDropdown(function () {
                    return getSavedPositionOptions();
                }),
                'SAVED_POS' // field name
            );
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour(230);
    },
};

// Generator for generating the javascript for the move_arm block.
javascriptGenerator.forBlock['move_arm'] = function (block) {
    const posName = block.getFieldValue('SAVED_POS'); // selected name string

    // Look up the name in the store
    const state = useRosStore.getState();
    const savedPositions = state.savedPositions || [];
    const match = savedPositions.find(function (item) {
        return item.name === posName;
    });
    if (!match) {
        return (
            'console.warn("No saved position found for name: ' +
            JSON.stringify(posName) +
            '");\n'
        );
    }

    // Inline the position array into the generated code
    const positions = Array.isArray(match.position)
        ? match.position
        : match.position.position;

    // generates a string of javascript code that publishes the joint positions.
    return 'publishCmdJointPos(' + JSON.stringify(positions) + ');\n';
};