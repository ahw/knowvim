var NormalHandler = Backbone.DeepModel.extend({

    // Defaults.
    defaults : {
        logger : new Logger('normal'),
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

    // Helper for getting the last position of a line.
    indexOfLastChar : function(row) {
        // Note that lines with no content still need to have their last
        // position be returned as "0". If we return -1 the cursor will
        // disappear.
        return Math.max(0, this.lines()[row].length - 1);
    },

    input : function(key) {
        // Send the input to the tokenizer.
        this.get('tokenizer').receiveChar(key);
    },

    receiveNormalCommand : function(normalCommand) {
        this.logger().log('NORMAL: Received normalCommand', normalCommand);

        // If there is a motion component to the command, get the motion
        // result. If normalCommand.motionCount exists, the motion result
        // will reflect this repetition.
        var motionResult;
        if (normalCommand.motionName) {
            // Get the motionResult of the motion applied [motionCount] times.
            var motionCount = normalCommand.motionCount ? normalCommand.motionCount : 1;
            motionResult = this.getMotionResult({
                motionName : normalCommand.motionName
            });

            for (var i = 0; i < motionCount - 1; i++) {
                // For each iteration, compute the motionResult starting
                // from the previous motion's end positions.
                motionResult = this.getMotionResult({
                    motionName : normalCommand.motionName,
                    startRow : motionResult.endRow,
                    startCol : motionResult.endCol,
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

            this.logger().log('NORMAL: Computed motion result', motionResult);
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

    // Returns the result of a motionName motion, in the context of
    // startRow, startCol, and, implicitly, the Buffer retrieved with
    // this.get('buffer'). If startRow and startCol are undefined it assumed
    // that Vim.get('cursorRow') and Vim.get('cursorCol') are to be used.
    getMotionResult : function(args) {
        var motionName = args.motionName;
        var startRow = typeof args.startRow != 'undefined' ? args.startRow : this.cursorRow();
        var startCol = typeof args.startCol != 'undefined' ? args.startCol : this.cursorCol();
        var isRepeat = args.isRepeat ? args.isRepeat : false;
        var result = {
            type : null, // 'linewise' or 'characterwise'
            startRow : startRow,
            startCol : startCol,
            endRow : startRow, // Default is no row movement
            endCol : startCol, // Default is no col movement
            inclusive : false, // True if it includes last char towards end
            hitEol : false // True if characterwise motion is stopped short due to end of line
        };

        switch(motionName) {

            case 'h':
                var endCol = startCol == 0 ? 0 : startCol - 1;
                result.type = 'characterwise';
                result.endCol = endCol;
                result.inclusive = false;
                break;

            case 'l':
                var length = this.lines()[startRow].length;
                var endCol = startCol == length - 1 ? startCol : startCol + 1;
                result.type = 'characterwise';
                result.endCol = endCol;
                result.inclusive = false;
                result.hitEol = endCol == startCol ? true : false;
                break;

            case 'j':
                var numRows = this.lines().length;
                var endRow = startRow == numRows - 1 ? startRow : startRow + 1;
                // If the new row is shorter, put the column at the
                // right-most position possible.
                var endCol =
                    startRow != endRow
                    ? endCol = Math.min(this.lines()[endRow].length - 1, startCol)
                    : startCol;
                // End column can't be less than 0.
                endCol = endCol == -1 ? 0 : endCol;

                result.type = 'linewise';
                result.endRow = endRow;
                result.endCol = endCol;
                result.inclusive = true;
                break;

            case 'k':
                var endRow = startRow == 0 ? 0 : startRow - 1;
                // If the new row is shorter, put the column at the
                // right-most position possible.
                var endCol =
                    startRow != endRow
                    ? endCol = Math.min(this.lines()[endRow].length - 1, startCol)
                    : startCol;
                // End column can't be less than 0.
                endCol = endCol == -1 ? 0 : endCol;

                result.type = 'linewise';
                result.endRow = endRow;
                result.endCol = endCol;
                result.inclusive = true;
                break;

            case '0':
                result.endCol = 0;
                result.type = 'characterwise';
                result.inclusive = false;
                break;

            case '$':
                // Initially set endCol to what we expect (to the position
                // at the end of the line).
                var endCol = this.lines()[startRow].length - 1;

                if (isRepeat) {
                    // Special case: if this is part of a {count}$ motion,
                    // each successive iteration should move the cursor down
                    // one line and to the end.
                    var numRows = this.lines().length;
                    var endRow = startRow == numRows - 1 ? startRow : startRow + 1;
                    endCol = this.indexOfLastChar(endRow);
                    result.endRow = endRow;
                }

                result.endCol = endCol;
                result.type = 'characterwise';
                result.hitEol = true;
                result.inclusive = false;
                break;

            case 'd':
            case 'y':
                // If "d" or "y" are given as the motionName we'll assume
                // they were in the context of a "dd" or "yy" command. In
                // this case, the intent is to delete or yank the current
                // line.
                result.type = 'linewise';
                break;

            case 'w':
                result = this.getWMotionResult(startRow, startCol);
                break;

            default:
                this.logger().warn('NORMAL: The "' + motionName + '" motion has not been implemented. Defaulting to no motion.');
        }

        // this.logger().log(sprintf('NORMAL %s: start (%s, %s) end (%s, %s)', motionName, startRow, startCol, result.endRow, result.endCol));
        return result;
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
                    this.logger().warn('NORMAL: No implementation to handle linewise delete commands');

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
                this.logger().log(sprintf('NORMAL: No implementation for operationName "%s"', operationName));
                break;

            case 'y':
                this.logger().log(sprintf('NORMAL: No implementation for operationName "%s"', operationName));
                break;

            default:
                this.logger().warn('NORMAL: No implementation for operationName "' + operationName + '"');
                break;
        }
    }
});
