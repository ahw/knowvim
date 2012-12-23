var NormalHandler = Backbone.DeepModel.extend({

    // Defaults.
    defaults : {
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

    input : function(key) {
        // Send the input to the tokenizer.
        this.get('tokenizer').receiveChar(key);
    },

    receiveNormalCommand : function(normalCommand) {
        console.log('NORMAL: Received normalCommand', normalCommand);

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
                    startCol : motionResult.endCol
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
            motionResult.starCol = this.cursorRow();

            console.log('NORMAL: Computed motion result', motionResult);
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
        motionName = args.motionName;
        startRow = typeof args.startRow != 'undefined' ? args.startRow : this.cursorRow();
        startCol = typeof args.startCol != 'undefined' ? args.startCol : this.cursorCol();
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
                console.warn('NORMAL: The "' + motionName + '" motion has not been implemented. Defaulting to no motion.');
        }

        // console.log(sprintf('NORMAL %s: start (%s, %s) end (%s, %s)', motionName, startRow, startCol, result.endRow, result.endCol));
        return result;
    },

    applyOperator : function(args) {
        var model = this;
        var motionResult = args.motionResult;
        var operationName = args.operationName;
        var operationCount = args.operationCount;

        // Apply the operationName.
        switch(operationName) {

            case 'd':
                if (motionResult.type == 'characterwise') {
                    var line = model.lines()[motionResult.startRow];
                    var startIndex = Math.min(motionResult.startCol, motionResult.endCol);
                    var endIndex = Math.max(motionResult.startCol, motionResult.endCol);
                    var isBackwardsDelete = motionResult.startCol > motionResult.endCol ? true : false;

                    // If the motion is inclusive, then add 1 to the end index.
                    if (motionResult.inclusive)
                        endIndex++;

                    // Repeatedly remove whatever character is at startIndex.
                    for (var i = startIndex;  i < endIndex; i++) {
                        line = line.substr(0, startIndex) + line.substr(startIndex + 1);
                    }

                    // If this is a [count]hd delete then move the cursor
                    // backwards as per Vim behavior.
                    if (isBackwardsDelete) {
                        model.get('vim').set({
                            col : Math.max(0, motionResult.endCol - 1)
                        });
                    }
                    
                    // If this is a d[count]l delete whose [count]l motion
                    // was cut short by the end of line, then we must delete
                    // the last character of the line.
                    if (motionResult.hitEol) {
                        console.log('Deleting last character from line "' + line + '"');
                        line = line.substr(0, line.length - 1)
                        model.get('vim').set({
                            col : Math.max(0, line.length - 1)
                        });
                    }

                    // Create an attributes hash of the form {'lines.3' :
                    // 'foo'}. We'll have to create this in a somewhat
                    // convoluted way since the property name ('lines.3') is
                    // dynamically generated -- it depends on which line
                    // index is being updated.
                    var attributes = {};
                    attributes[sprintf('lines.%s', motionResult.startRow)] = line;
                    model.get('vim').get('buffer').set(attributes, {silent : true});

                    // Manually trigger a change:buffer event on the Vim
                    // model (using the set() function alone doesn't seem to
                    // trigger the right change events).
                    model.get('vim').trigger('change:buffer');

                } else if (motionResult.type == 'linewise') {
                    console.warn('NORMAL: No implementation to handle linewise delete commands');

                } else {
                    // Should never get here.
                    console.log('Invalid motion type: ' + JSON.stringify(motionResult) + '. Doing nothing');
                }
                break;
            case 'c':
                console.log(sprintf('NORMAL: No implementation for operationName "%s"', operationName));
                break;
            case 'y':
                console.log(sprintf('NORMAL: No implementation for operationName "%s"', operationName));
                break;
            default:
                console.warn('NORMAL: No implementation for operationName "' + operationName + '"');
                break;
        }
    }
});
