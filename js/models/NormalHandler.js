var NormalHandler = Backbone.DeepModel.extend({

    defaults : {
        operator : null,
        motion : null,
        repeat : 1,
        state : 'START',

        operators : {
            'd' : 'd',
            'c' : 'c',
            'y' : 'y',
            '~' : '~'
        },
        motions : {
            'w' : 'w',
            'b' : 'b',
            '{' : '{',
            '}' : '}',
            '0' : '0',
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
        model.set({
            vim : options.vim,
            buffer : options.buffer
        });

        // Listen for changes in state. When we hit the RUN state execute
        // the parsed command.
        model.on('change:state', function() {
            if (model.get('state') == 'RUN') {

                model.printCommandExpression();

                var mkey = model.get('motion');
                var opkey = model.get('operator');
                var repeat = model.get('repeat');

                var m = model.getMotionResult(mkey, model.row(), model.col());
                for (var i = 0; i < repeat - 1; i++) {
                    m = model.getMotionResult(mkey, m.endRow, m.endCol);
                }
                model.row(m.endRow);
                model.col(m.endCol);
            }
        });
    },


    // Helper function to get/set the current row.
    row : function(newRow) {
        if (newRow) {
            this.get('vim').set({row : newRow});
        } else {
            return this.get('vim').get('row');
        }
    },


    // Helper function to get/set the current col.
    col : function(newCol) {
        if (newCol) {
            this.get('vim').set({col : newCol});
        } else {
            return this.get('vim').get('col');
        }
    },


    // Helper for returning `this.get('buffer').get('lines')`
    lines : function() {
        return this.get('vim').get('buffer').get('lines');
    },


    input : function(key) {
        switch (this.get('state')) {

            case 'START':
                if (this.get('motions')[key]) {
                    // Assert: motion command
                    this.set({
                        operator : null,
                        motion : key,
                        repeat : 1,
                        state : 'RUN'
                    });
                } else if (this.get('operators')[key]) {
                    // Assert: operator command
                    this.set({
                        operator : key,
                        motion : null,
                        repeat : 1,
                        state : 'OPERATOR'
                    });
                } else if (parseInt(key)) {
                    // Assert: repetition prefix
                    this.set({
                        operator : null,
                        motion : null,
                        repeat : parseInt(key),
                        state : 'NUMBER'
                    });
                } else {
                    console.log('Invalid key "' + key + '". Resetting to START state.');
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
                        state : 'RUN'
                    });
                } else if (this.get('operators')[key]) {
                    // Assert: operator command
                    this.set({
                        operator : key,
                        state : 'OPERATOR'
                    });
                } else if (parseInt(key)) {
                    // Assert: repetition prefix
                    var n = parseInt(key);
                    var oldRepeat = this.get('repeat');
                    this.set({
                        repeat : 10 * oldRepeat + n,
                        state : 'NUMBER'
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
                } else {
                    console.log('Invalid key "' + key + '". Resetting to START state.');
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


    // Returns the result of a `motionKey` motion, in the context of
    // `startRow`, `startCol`, and, implicitly, the `Buffer` retrieved with
    // `this.get('buffer')`.
    getMotionResult : function(motionKey, startRow, startCol) {


        console.log(sprintf('getMotionResult >>> motionKey = %s, startRow = %s, startCol = %s', motionKey, startRow, startCol));
        var result = {
            type : null, // 'linewise' or 'characterwise'
            startRow : startRow,
            startCol : startCol,
            endRow : startRow, // Default is no row movement
            endCol : startCol, // Default is no col movement
            inclusive : null, // true if it includes last char towards end
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
                break;

            case 'j':
                var numRows = this.lines().length;
                var endRow = startRow == numRows - 1 ? startRow : startRow + 1;
                result.type = 'linewise';
                result.endRow = endRow;
                result.inclusive = true;
                break;

            case 'k':
                var endRow = startRow == 0 ? 0 : startRow - 1;
                result.type = 'linewise';
                result.endRow = endRow;
                result.inclusive = true;
                break;
        }

        console.log(sprintf('getMotionResult >>> motionKey = %s, endRow = %s, end = %s', motionKey, result.endRow, result.endCol));
        return result;
    },


    printCommandExpression : function() {
        var o = this.get('operator') || "";
        var m = this.get('motion') || "";
        var r = this.get('repeat') || "";

        var s = sprintf('Command: "%d%s%s"', r, o, m);
        s += sprintf('\n    Operator = %s', o);
        s += sprintf('\n    Motion   = %s', m);
        s += sprintf('\n    Repeat   = %s', r);
        console.log(s);
    }

});
