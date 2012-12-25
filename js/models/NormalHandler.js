var NormalHandler = Backbone.DeepModel.extend({

    // Defaults.
    defaults : {
        logger : new Logger({
            module : 'normal',
            prefix : 'NORMAL: '
        }),
        parser : null,
        tokenizer : null,
        operator : null,
        motion : null,
        count : 1, // Used to hold [count] values temporarily.
        state : 'START',
        operatorCount : 1,
        motionCount : 1,

        operators : {
            'd' : 'd',
            'c' : 'c',
            'y' : 'y',
        },
        motions : {
            'w' : 'w',
            'b' : 'b',
            '{' : '{',
            '}' : '}',
            // '0' : '0',
            '$' : '$',
            'H' : 'H',
            'L' : 'L',
            'G' : 'G',
            'j' : 'j',
            'k' : 'k',
            'h' : 'h',
            'l' : 'l'
        },

        buffer : null,
        vim : null
    },

    initialize : function(options) {
        var model = this;
        var parser = new Parser({ normalHandler : model });
        var tokenizer = new Tokenizer({ parser : parser });
        model.set({
            vim : options.vim,
            buffer : options.buffer,
            tokenizer : tokenizer,
            parser : parser
        });
    },

    // Helper function to get the cursorRow.
    cursorRow : function() {
        return this.get('vim').get('cursorRow');
    },

    // Helper function to get the cursorCol.
    cursorCol : function() {
        return this.get('vim').get('cursorCol');
    },

    // Helper function to get the current row.
    row : function() {
        return this.get('vim').get('row');
    },

    // Helper function to get the current col.
    col : function() {
        return this.get('vim').get('col');
    },

    // Helper for returning this.get('buffer').get('lines')
    lines : function() {
        return this.get('vim').get('buffer').get('lines');
    },

    // Helper to get the logger
    logger : function() {
        return this.get('logger');
    },

    input : function(key) {
        // Send the input to the tokenizer.
        this.get('tokenizer').receiveChar(key);
    },

    receiveNormalCommand : function(normalCommand) {
        this.logger().log('Received normalCommand', normalCommand);

        // If there is a motion component to the command, get the motion
        // result. If normalCommand.motionCount exists, the motion result
        // will reflect this repetition.
        var motionResult;
        if (normalCommand.motionName) {
            motionResult = Motions.getMotionResult({
                normalCommand : normalCommand,
                startRow : this.cursorRow(),
                startCol : this.cursorCol(),
                lines : this.lines()
            });
            this.logger().log('Finished computing motion result:', motionResult);
        }

        // If there is an operator, apply it. If
        // normalCommand.operationCount exists, the operation will be
        // applied that many times.
        if (normalCommand.operationName) {
            this.applyOperator({
                motionResult : motionResult,
                normalCommand : normalCommand,
                operationName : normalCommand.operationName,
                operationCount : normalCommand.operationCount
            });

        } else {
            // Assert: no operator. Just apply the motion.
            this.get('vim').set({
                row : motionResult.endRow,
                col : motionResult.endCol
            });
        }
    },

    applyOperator : function(args) {
        var motionResult = args.motionResult;
        var operationName = args.operationName;
        var operationCount = args.operationCount;
        var normalCommand = args.normalCommand;
        var operationResult = {};

        // Apply the operationName.
        switch(operationName) {
            case 'd':
                if (motionResult.type == 'characterwise') {
                    operationResult = DeleteOperations.deleteCharacterwise({
                        motionResult : motionResult,
                        lines : this.lines()
                    });
                } else if (motionResult.type == 'linewise') {
                    operationResult = DeleteOperations.deleteLinewise({
                        motionResult : motionResult,
                        lines : this.lines()
                    });
                } else {
                    // Should never get here.
                    this.logger().log('Invalid motion type.', motionResult);
                }

                // Update the row and col positions as per the
                // operationResult.
                this.get('vim').set({
                    row : operationResult.row,
                    col : operationResult.col
                });

                // Manually trigger a change:buffer event on the Vim
                // model (using the set() function alone doesn't seem to
                // trigger the right change events).
                this.get('vim').trigger('change:buffer');
                break;

            case 'c':
                this.logger().log(sprintf('No implementation for operationName "%s"', operationName));
                break;

            case 'y':
                operationResult = YankOperations.getYankOperationResult({
                    motionResult : motionResult,
                    normalCommand : normalCommand,
                    lines : this.lines()
                });
                this.logger().log('Yank operation result: ', operationResult);
                break;

            default:
                this.logger().warn('No implementation for operationName "' + operationName + '"');
                break;
        }
    }
});
