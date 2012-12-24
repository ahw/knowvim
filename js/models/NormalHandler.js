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
            // Get the motionResult of the motion applied [motionCount] times.
            var motionCount = normalCommand.motionCount ? normalCommand.motionCount : 1;
            motionResult = Motions.getMotionResult({
                motionName : normalCommand.motionName,
                startRow : this.cursorRow(),
                startCol : this.cursorCol(),
                lines : this.lines()
            });

            for (var i = 0; i < motionCount - 1; i++) {
                // For each iteration, compute the motionResult starting
                // from the previous motion's end positions.
                motionResult = Motions.getMotionResult({
                    motionName : normalCommand.motionName,
                    startRow : motionResult.endRow,
                    startCol : motionResult.endCol,
                    lines : this.lines(),
                    isRepeat : true
                });

                // If the motionResult hasn't changed, then drop out of the
                // loop for efficiency.
                if (motionResult.startRow == motionResult.endRow
                    && motionResult.startCol == motionResult.endCol) {
                    break;
                }
            }

            // Reset the starting position to the original starting
            // position (if there was any motionCount iteration, the
            // starting position values change with each iteration).
            motionResult.startRow = this.cursorRow();
            motionResult.startCol = this.cursorCol();

            this.logger().log('Computed motion result', motionResult);
        }
        // If there is an operator, apply it. If
        // normalCommand.operationCount exists, the operation will be
        // applied that many times.
        if (normalCommand.operationName) {
            this.applyOperator({
                motionResult : motionResult,
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
        var operationResult = {};

        // Apply the operationName.
        switch(operationName) {

            case 'd':
                if (motionResult.type == 'characterwise') {
                    operationResult = Operations.deleteCharacterwise({
                        motionResult : motionResult,
                        lines : this.lines()
                    });
                } else if (motionResult.type == 'linewise') {
                    operationResult = Operations.deleteLinewise({
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
                this.logger().log(sprintf('No implementation for operationName "%s"', operationName));
                break;

            default:
                this.logger().warn('No implementation for operationName "' + operationName + '"');
                break;
        }
    }
});
