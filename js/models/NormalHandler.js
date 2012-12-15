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
        var parser = new Parser();
        var tokenizer = new Tokenizer({ parser : parser });
        model.set({
            vim : options.vim,
            buffer : options.buffer,
            tokenizer : tokenizer,
            parser : parser
        });

        // Listen for changes in state. When we hit the RUN state execute
        // the parsed command.
        model.on('change:state', function() {
            if (model.get('state') == 'RUN') {
                // model.printCommandExpression();
                var motion = model.get('motion');
                var operator = model.get('operator');
                var motionCount = model.get('motionCount');
                var operatorCount = model.get('operatorCount');

                for (var i = 0; i < operatorCount; i++) {
                    model.applyOperator({
                        motion : motion,
                        operator : operator,
                        motionCount : motionCount,
                        operatorCount : operatorCount
                    });
                }

            }
        });
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
        this.get('tokenizer').receiveChar(key);
    },

    oldInput : function(key) {
        switch (this.get('state')) {

            case 'START':
                if (this.get('motions')[key]) {
                    // Assert: motion command
                    this.set({
                        operator : null,
                        motion : key,
                        count : 1,
                        operatorCount : 1,
                        motionCount : 1,
                        state : 'RUN'
                    });
                } else if (this.get('operators')[key]) {
                    // Assert: operator command
                    this.set({
                        operator : key,
                        motion : null,
                        count : 1,
                        operatorCount : 1,
                        motionCount : 1,
                        state : 'OPERATOR'
                    });
                } else if (isNaN(parseInt(key)) == false) {
                    // Assert: repetition prefix
                    this.set({
                        operator : null,
                        motion : null,
                        count : parseInt(key),
                        operatorCount : 1,
                        motionCount : 1,
                        state : 'NUMBER'
                    });
                } else {
                    console.log('Invalid key "' + key + '" in ' + this.get('state') + ' state. Resetting to START state.');
                    this.set({
                        state : 'START'
                    });
                }
                break;

            case 'NUMBER':
                if (this.get('motions')[key]) {
                    // Assert: motion command
                    this.set({
                        motion : key,
                        motionCount : this.get('count'), // The [count] pertains to a motion
                        state : 'RUN'
                    });
                } else if (this.get('operators')[key]) {
                    // Assert: operator command
                    this.set({
                        operator : key,
                        operatorCount : this.get('count'), // The [count] pertains to an operator
                        state : 'OPERATOR'
                    });
                } else if (isNaN(parseInt(key)) == false) {
                    // Assert: repetition prefix
                    var n = parseInt(key);
                    var oldCount = this.get('count');
                    this.set({
                        count : 10 * oldCount + n,
                        state : 'NUMBER'
                    });
                } else {
                    console.log('Invalid key "' + key + '" in ' + this.get('state') + ' state. Resetting to START state.');
                    this.set({
                        state : 'START'
                    });
                }
                break;

            case 'OPERATOR':
                if (this.get('motions')[key]) {
                    // Assert: motion command
                    this.set({
                        motion : key,
                        state : 'RUN'
                    });
                } else if (isNaN(parseInt(key)) == false) {
                    // Assert: repetition prefix
                    this.set({
                        motionCount : parseInt(key),
                        state : 'MOTION_COUNT'
                    });
                } else {
                    console.log('Invalid key "' + key + '" in ' + this.get('state') + ' state. Resetting to START state.');
                    this.set({
                        state : 'START'
                    });
                }
                break;

            case 'MOTION_COUNT':
                if (this.get('motions')[key]) {
                    // Assert: motion command
                    this.set({
                        motion : key,
                        state : 'RUN'
                    });
                } else if (isNaN(parseInt(key)) == false) {
                    // Assert: repetition prefix
                    var n = parseInt(key);
                    var oldMotionCount = this.get('motionCount');
                    this.set({
                        motionCount : 10 * oldMotionCount + n,
                        state : 'MOTION_COUNT'
                    });
                } else {
                    console.log('Invalid key "' + key + '" in ' + this.get('state') + ' state. Resetting to START state.');
                    this.set({
                        state : 'START'
                    });
                }
                break;

            case 'RUN':
                // Epsilon transition to START state.
                this.set({
                    state : 'START'
                });
                this.input(key);
                break;
        }
    },


    // Returns the result of a motionKey motion, in the context of
    // startRow, startCol, and, implicitly, the Buffer retrieved with
    // this.get('buffer').
    getMotionResult : function(motionKey, startRow, startCol) {


        var result = {
            type : null, // 'linewise' or 'characterwise'
            startRow : startRow,
            startCol : startCol,
            endRow : startRow, // Default is no row movement
            endCol : startCol, // Default is no col movement
            inclusive : false, // True if it includes last char towards end
            hitEol : false // True if characterwise motion is stopped short due to end of line
        };

        switch(motionKey) {

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

            case 'w':
                result = this.getWMotionResult(startRow, startCol);
                break;

        }

        // console.log(sprintf('NORMAL %s: start (%s, %s) end (%s, %s)', motionKey, startRow, startCol, result.endRow, result.endCol));
        return result;
    },

    applyOperator : function(args) {

        var model = this;
        var motion = args.motion;
        var operator = args.operator;
        var motionCount = args.motionCount;
        var operatorCount = args.operatorCount;

        // Get the motionResult of the motion applied [motionCount] times.
        var motionResult = model.getMotionResult(motion, model.row(), model.col());
        for (var i = 0; i < motionCount - 1; i++) {
            motionResult = model.getMotionResult(motion, motionResult.endRow, motionResult.endCol);
        }
        // Set the initial position of motionResult to the current position.
        motionResult.startRow = model.row();
        motionResult.startCol = model.col();

        var command = sprintf('%s%s%s%s',
            operatorCount > 1 ? operatorCount : "",
            operator ? operator : "",
            motionCount > 1 ? motionCount : "",
            motion);
        console.log('NORMAL: ' + command + ' ' + JSON.stringify(motionResult));

        // Apply the operator.
        switch(operator) {

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
                    console.log(sprintf('NORMAL: No implementation for "%s"', command));

                } else {
                    // Should never get here.
                    console.log('Invalid motion type: ' + JSON.stringify(motionResult) + '. Doing nothing');
                }
                break;
            case 'c':
                console.log(sprintf('NORMAL: No implementation for operator "%s"', operator));
                break;
            case 'y':
                console.log(sprintf('NORMAL: No implementation for operator "%s"', operator));
                break;
            default:
                // Assert: no operator given; just set the new row and
                // column in Vim.
                model.get('vim').set({
                    row : motionResult.endRow,
                    col : motionResult.endCol
                });
                break;
        }

    },

    getWMotionResult : function (startRow, startCol) {
        var result = {
            type : 'characterwise', // 'linewise' or 'characterwise'
            startRow : startRow,
            startCol : startCol,
            endRow : startRow, // Default is no row movement
            endCol : startCol, // Default is no col movement
            inclusive : null, // true if it includes last char towards end
        };
        return result;

    },


    printCommandExpression : function() {
        var operator = this.get('operator') || "";
        var motion = this.get('motion') || "";
        var operatorCount = this.get('operatorCount') || "";
        var motionCount = this.get('motionCount') || "";

        var s = sprintf('Command: "%s%s%s%s"', operatorCount, operator, motionCount, motion);
        s += sprintf('\nOperatorCount = %s', operatorCount);
        s += sprintf('\n     Operator = %s', operator);
        s += sprintf('\n  MotionCount = %s', motionCount);
        s += sprintf('\n       Motion = %s', motion);
        console.log(s);
    }

});
